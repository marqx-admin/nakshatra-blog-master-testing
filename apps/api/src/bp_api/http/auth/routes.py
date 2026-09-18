from __future__ import annotations

import asyncio

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

from bp_domain.errors import RateLimited, SecurityFault, Unauthenticated, ValidationFault
from bp_domain.context import RequestContext

from ..contract import operation_index, validate_json, validate_response
from ..dependencies.security import (
    SESSION_COOKIE,
    clear_session_cookies,
    current_session,
    require_csrf,
    set_session_cookies,
)
from ..rate_limits import (
    abuse_failure,
    abuse_peek,
    auth_token_actor,
    enforce_transport_quota,
    login_actor,
    safe_subject_hash,
    session_actor,
    source_network_key,
)

router = APIRouter()


def _contract(request: Request, operation_id: str):
    index = getattr(request.app.state, "operation_index", None)
    if index is None:
        index = operation_index(request.app.state.canonical_openapi)
        request.app.state.operation_index = index
    return index[operation_id]


async def _json(request: Request, operation_id: str):
    request.state.request_context = RequestContext(
        request_id=request.state.request_id,
        operation_id=operation_id,
    )
    contract = _contract(request, operation_id)
    try:
        body = await request.json()
    except Exception as exc:
        raise ValidationFault("request validation failed") from exc
    validate_json(request.app.state.canonical_openapi, contract.request_schema, body)
    return body


def _clean(result: dict) -> dict:
    return {key: value for key, value in result.items() if not key.startswith("_")}


def _response(request: Request, operation_id: str, result: dict, status: int = 200):
    payload = _clean(result)
    validate_response(request.app.state.canonical_openapi, _contract(request, operation_id), status, payload)
    response = JSONResponse(payload, status_code=status, headers={"Cache-Control": "no-store"})
    if result.get("_session") and result.get("_csrf"):
        set_session_cookies(response, session_id=result["_session"], csrf=result["_csrf"])
    return response


def _empty(request: Request, operation_id: str, status: int = 204) -> Response:
    validate_response(request.app.state.canonical_openapi, _contract(request, operation_id), status, None)
    return Response(status_code=status, headers={"Cache-Control": "no-store"})


async def _audit_rate_limit(request: Request, *, family: str) -> None:
    await request.app.state.services.audit.append(
        "SEC.RATE_LIMIT",
        actor_admin_id=None,
        site_id=None,
        details={"family": family},
    )


async def _security_failure_delay(request: Request, decision) -> None:
    if decision is None:
        return
    failures = max(1, decision.limit - decision.remaining)
    delay = min(16, 2 ** (failures - 1))
    request.state.security_delay_seconds = delay
    if request.app.state.settings.environment != "test":
        await asyncio.sleep(delay)


async def _token_failure(request: Request, family: str, raw_token: str) -> None:
    actor = f"{source_network_key(request)}:{family}"
    try:
        decision = await abuse_failure(request, class_id="SEC_TOKEN_IP", actor_key=actor)
    except RateLimited:
        await _audit_rate_limit(request, family=family)
        raise
    await _security_failure_delay(request, decision)


async def _token_precheck(request: Request, family: str, raw_token: str) -> None:
    actor = f"{source_network_key(request)}:{family}"
    try:
        await abuse_peek(request, class_id="SEC_TOKEN_IP", actor_key=actor)
    except RateLimited:
        await _audit_rate_limit(request, family=family)
        raise


@router.post("/api/v1/auth/login", operation_id="API15-AUTH-001", status_code=200)
async def login(request: Request):
    operation_id = "API15-AUTH-001"
    body = await _json(request, operation_id)
    normalized = body["email"].strip().lower()
    transport_actor = login_actor(request, normalized)
    await enforce_transport_quota(request, class_id="AUTH_LOGIN", actor_key=transport_actor)

    account_actor = safe_subject_hash(normalized)
    ip_actor = source_network_key(request)
    try:
        await abuse_peek(request, class_id="SEC_LOGIN_ACCOUNT", actor_key=account_actor)
        await abuse_peek(request, class_id="SEC_LOGIN_IP", actor_key=ip_actor)
    except RateLimited:
        await _audit_rate_limit(request, family="LOGIN")
        raise

    try:
        result = await request.app.state.services.auth.login(body["email"], body["password"])
    except Unauthenticated:
        account_decision = None
        ip_decision = None
        try:
            account_decision = await abuse_failure(request, class_id="SEC_LOGIN_ACCOUNT", actor_key=account_actor)
            ip_decision = await abuse_failure(request, class_id="SEC_LOGIN_IP", actor_key=ip_actor)
        except RateLimited:
            await _audit_rate_limit(request, family="LOGIN")
            raise
        await _security_failure_delay(request, account_decision or ip_decision)
        raise
    return _response(request, operation_id, result)


@router.post("/api/v1/auth/logout", operation_id="API15-AUTH-002", status_code=204)
async def logout(request: Request):
    operation_id = "API15-AUTH-002"
    request.state.request_context = RequestContext(request.state.request_id, operation_id)
    raw, record, principal = await current_session(request)
    await enforce_transport_quota(
        request,
        class_id="AUTH_SESSION",
        actor_key=session_actor(raw, principal.admin_id),
    )
    await require_csrf(request, record, actor_admin_id=principal.admin_id)
    await request.app.state.services.auth.logout(principal, raw)
    response = _empty(request, operation_id)
    clear_session_cookies(response)
    return response


@router.post("/api/v1/auth/invitations/accept", operation_id="API15-AUTH-003", status_code=200)
async def invitation_accept(request: Request):
    operation_id = "API15-AUTH-003"
    body = await _json(request, operation_id)
    raw_token = body["invite_token"]
    await enforce_transport_quota(
        request,
        class_id="AUTH_TOKEN",
        actor_key=auth_token_actor(request, raw_token, "INVITE_SETUP"),
    )
    await _token_precheck(request, "INVITE_SETUP", raw_token)
    try:
        result = await request.app.state.services.auth.accept_invitation(raw_token)
    except Unauthenticated:
        await _token_failure(request, "INVITE_SETUP", raw_token)
        raise
    return _response(request, operation_id, result)


@router.post("/api/v1/auth/password/setup", operation_id="API15-AUTH-004", status_code=200)
async def password_setup(request: Request):
    operation_id = "API15-AUTH-004"
    body = await _json(request, operation_id)
    if body["mode"] == "INVITATION":
        raw_token = body["invite_token"]
        await enforce_transport_quota(
            request,
            class_id="AUTH_TOKEN",
            actor_key=auth_token_actor(request, raw_token, "INVITE_SETUP"),
        )
        await _token_precheck(request, "INVITE_SETUP", raw_token)
        try:
            result = await request.app.state.services.auth.password_setup_invite(raw_token, body["new_password"])
        except Unauthenticated:
            await _token_failure(request, "INVITE_SETUP", raw_token)
            raise
        return _response(request, operation_id, result)

    raw, record, principal = await current_session(request)
    await enforce_transport_quota(
        request,
        class_id="AUTH_TOKEN",
        actor_key=session_actor(raw, principal.admin_id),
    )
    await require_csrf(request, record, actor_admin_id=principal.admin_id)
    result = await request.app.state.services.auth.password_change(
        principal,
        raw,
        body["current_password"],
        body["new_password"],
    )
    return _response(request, operation_id, result)


@router.post("/api/v1/auth/password-reset/request", operation_id="API15-AUTH-005", status_code=202)
async def password_reset_request(request: Request):
    operation_id = "API15-AUTH-005"
    body = await _json(request, operation_id)
    normalized = body["email"].strip().lower()
    ip_actor = source_network_key(request)
    account_actor = safe_subject_hash(normalized)
    await enforce_transport_quota(request, class_id="AUTH_RESET_REQUEST", actor_key=ip_actor)
    # Applying the matched-account ceiling to the normalized identifier for all
    # callers is deliberately enumeration-safe and only stricter for unknown IDs.
    try:
        await abuse_peek(request, class_id="SEC_RESET_ACCOUNT", actor_key=account_actor)
        await abuse_peek(request, class_id="SEC_RESET_IP", actor_key=ip_actor)
        # The security counter is request-based here; the response stays identical
        # regardless of account existence.
        await abuse_failure(request, class_id="SEC_RESET_ACCOUNT", actor_key=account_actor)
        await abuse_failure(request, class_id="SEC_RESET_IP", actor_key=ip_actor)
    except RateLimited:
        await _audit_rate_limit(request, family="PASSWORD_RESET_REQUEST")
        raise
    await request.app.state.services.auth.password_reset_request(
        body["email"],
        reset_base_url=request.app.state.settings.reset_base_url,
    )
    payload = {"accepted": True, "request_id": request.state.request_id}
    return _response(request, operation_id, payload, status=202)


@router.post("/api/v1/auth/password-reset/complete", operation_id="API15-AUTH-006", status_code=204)
async def password_reset_complete(request: Request):
    operation_id = "API15-AUTH-006"
    body = await _json(request, operation_id)
    raw_token = body["reset_token"]
    await enforce_transport_quota(
        request,
        class_id="AUTH_TOKEN",
        actor_key=auth_token_actor(request, raw_token, "RESET"),
    )
    await _token_precheck(request, "RESET", raw_token)
    try:
        await request.app.state.services.auth.password_reset_complete(raw_token, body["new_password"])
    except Unauthenticated:
        await _token_failure(request, "RESET", raw_token)
        raise
    return _empty(request, operation_id)


@router.post("/api/v1/auth/mfa/enrollment", operation_id="API15-AUTH-007", status_code=200)
async def mfa_enrollment(request: Request):
    operation_id = "API15-AUTH-007"
    body = await _json(request, operation_id)
    mode = body["mode"]
    if mode == "ADMIN_SESSION":
        if not body.get("current_password") or body.get("invite_token") is not None:
            raise ValidationFault("request validation failed")
        raw, record, principal = await current_session(request)
        await enforce_transport_quota(
            request,
            class_id="AUTH_SESSION",
            actor_key=session_actor(raw, principal.admin_id),
        )
        await require_csrf(request, record, actor_admin_id=principal.admin_id)
        result = await request.app.state.services.auth.begin_mfa_enrollment_session(
            principal, raw, body["current_password"]
        )
        return _response(request, operation_id, result)
    if mode == "INVITE_SETUP_TOKEN":
        raw_token = body.get("invite_token")
        if not raw_token or body.get("current_password") is not None:
            raise ValidationFault("request validation failed")
        await enforce_transport_quota(
            request,
            class_id="AUTH_SESSION",
            actor_key=auth_token_actor(request, raw_token, "INVITE_SETUP"),
        )
        await _token_precheck(request, "INVITE_SETUP", raw_token)
        try:
            result = await request.app.state.services.auth.begin_mfa_enrollment_invite(raw_token)
        except Unauthenticated:
            await _token_failure(request, "INVITE_SETUP", raw_token)
            raise
        return _response(request, operation_id, result)
    raise ValidationFault("request validation failed")


async def _mfa_failure(request: Request, challenge_id: str) -> None:
    challenge_actor = safe_subject_hash(challenge_id)
    ip_actor = source_network_key(request)
    try:
        challenge_decision = await abuse_failure(
            request, class_id="SEC_MFA_CHALLENGE", actor_key=challenge_actor
        )
        ip_decision = await abuse_failure(request, class_id="SEC_MFA_IP", actor_key=ip_actor)
    except RateLimited:
        await request.app.state.services.auth.invalidate_mfa_challenge(challenge_id)
        await _audit_rate_limit(request, family="MFA")
        raise
    if challenge_decision is not None and challenge_decision.remaining == 0:
        await request.app.state.services.auth.invalidate_mfa_challenge(challenge_id)
    await _security_failure_delay(request, challenge_decision or ip_decision)


async def _mfa_precheck(request: Request, challenge_id: str) -> None:
    try:
        await abuse_peek(
            request,
            class_id="SEC_MFA_CHALLENGE",
            actor_key=safe_subject_hash(challenge_id),
        )
        await abuse_peek(request, class_id="SEC_MFA_IP", actor_key=source_network_key(request))
    except RateLimited:
        await _audit_rate_limit(request, family="MFA")
        raise


@router.post("/api/v1/auth/mfa/verify", operation_id="API15-AUTH-008", status_code=200)
async def mfa_verify(request: Request):
    operation_id = "API15-AUTH-008"
    body = await _json(request, operation_id)
    challenge = body["challenge_id"]
    await enforce_transport_quota(
        request,
        class_id="AUTH_TOKEN",
        actor_key=auth_token_actor(request, challenge, "MFA_CHALLENGE"),
    )
    await _mfa_precheck(request, challenge)
    try:
        result = await request.app.state.services.auth.verify_mfa(
            challenge,
            body["code"],
            raw_session=request.cookies.get(SESSION_COOKIE),
        )
    except Unauthenticated:
        await _mfa_failure(request, challenge)
        raise
    return _response(request, operation_id, result)


@router.post("/api/v1/auth/mfa/recovery", operation_id="API15-AUTH-009", status_code=200)
async def mfa_recovery(request: Request):
    operation_id = "API15-AUTH-009"
    body = await _json(request, operation_id)
    challenge = body["challenge_id"]
    await enforce_transport_quota(
        request,
        class_id="AUTH_TOKEN",
        actor_key=auth_token_actor(request, challenge, "MFA_CHALLENGE"),
    )
    await _mfa_precheck(request, challenge)
    try:
        result = await request.app.state.services.auth.recover_mfa(challenge, body["recovery_code"])
    except Unauthenticated:
        await _mfa_failure(request, challenge)
        raise
    return _response(request, operation_id, result)


@router.post("/api/v1/auth/sessions/terminate", operation_id="API15-AUTH-010", status_code=204)
async def sessions_terminate(request: Request):
    operation_id = "API15-AUTH-010"
    request.state.request_context = RequestContext(request.state.request_id, operation_id)
    body = await _json(request, operation_id)
    raw, record, principal = await current_session(request)
    await enforce_transport_quota(
        request,
        class_id="AUTH_SESSION",
        actor_key=session_actor(raw, principal.admin_id),
    )
    await require_csrf(request, record, actor_admin_id=principal.admin_id)
    await request.app.state.services.auth.terminate_sessions(principal, raw, body["scope"])
    response = _empty(request, operation_id)
    clear_session_cookies(response)
    return response


@router.post("/api/v1/auth/step-up", operation_id="API15-AUTH-011", status_code=200)
async def step_up(request: Request):
    operation_id = "API15-AUTH-011"
    body = await _json(request, operation_id)
    raw, record, principal = await current_session(request)
    actor = session_actor(raw, principal.admin_id)
    await enforce_transport_quota(request, class_id="AUTH_SESSION", actor_key=actor)
    await require_csrf(request, record, actor_admin_id=principal.admin_id)
    try:
        await abuse_peek(request, class_id="SEC_STEPUP", actor_key=actor)
    except RateLimited:
        await _audit_rate_limit(request, family="STEP_UP")
        raise
    factor = body.get("factor") or {}
    try:
        result = await request.app.state.services.auth.step_up(
            principal,
            raw,
            body["level"],
            body["current_password"],
            factor.get("value") if factor.get("kind") == "TOTP" else None,
            factor.get("value") if factor.get("kind") == "RECOVERY" else None,
        )
    except SecurityFault:
        try:
            decision = await abuse_failure(request, class_id="SEC_STEPUP", actor_key=actor)
        except RateLimited:
            await request.app.state.services.auth.revoke_current_for_security(
                principal,
                raw,
                reason="STEP_UP_FAILURE_LIMIT",
            )
            await _audit_rate_limit(request, family="STEP_UP")
            raise
        if decision is not None and decision.remaining == 0:
            await request.app.state.services.auth.revoke_current_for_security(
                principal,
                raw,
                reason="STEP_UP_FAILURE_LIMIT",
            )
        await _security_failure_delay(request, decision)
        raise
    return _response(request, operation_id, result)


@router.get("/api/v1/auth/selectable-sites", operation_id="API15-AUTH-012", status_code=200)
async def selectable_sites(request: Request):
    operation_id = "API15-AUTH-012"
    request.state.request_context = RequestContext(request.state.request_id, operation_id)
    raw, _, principal = await current_session(request)
    await enforce_transport_quota(
        request, class_id="AUTH_SESSION", actor_key=session_actor(raw, principal.admin_id)
    )
    sites = await request.app.state.services.contexts.selectable_sites(principal=principal)
    payload = {
        "items": [
            {
                "site_key": site.site_key,
                "display_name": site.display_name or site.site_key,
                "lifecycle_state": site.lifecycle,
            }
            for site in sites
        ]
    }
    contract = operation_index(request.app.state.canonical_openapi)[operation_id]
    validate_response(request.app.state.canonical_openapi, contract, 200, payload)
    return JSONResponse(payload, status_code=200, headers={"Cache-Control": "no-store"})
