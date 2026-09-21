from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

from bp_application.editorial import EditorialApplication
from bp_domain.context import RequestContext
from bp_domain.errors import Denied, Unavailable, ValidationFault
from bp_ports.editorial import RequestIdempotencyPort

from ..contract import OperationContract, iter_operations, validate_json, validate_parameters, validate_response
from ..dependencies.security import current_session, require_csrf
from ..rate_limits import enforce_transport_quota

_PERMISSION_RE = re.compile(r"\b[a-z_]+\.[a-z_]+\b")

# CHAT03 owns API15-S-001. CHAT04 owns only the editorial/SITE operations below.
CHAT04_OPERATION_IDS = frozenset(
    {
        *(f"API15-S-{number:03d}" for number in range(10, 29)),
        *(f"API15-S-{number:03d}" for number in range(30, 35)),
        *(f"API15-S-{number:03d}" for number in range(40, 46)),
        *(f"API15-S-{number:03d}" for number in range(50, 55)),
        *(f"API15-S-{number:03d}" for number in range(70, 74)),
        "API15-S-095",
        "API15-S-096",
        "API15-S-097",
    }
)

# DOC-19 Section 25: only permanent Post deletion in CHAT04 is an L1 action.
# Category/Tag DELETE transports are DOC-08 soft retirement, not permanent purge.
L1_OPERATION_IDS = frozenset({"API15-S-023"})

# These operations expose launch-time website management rather than content
# production.  Several reuse coarse read/edit keys needed by the Post Editor,
# so the protected per-site access level is an additional server boundary.
MANAGER_OPERATION_IDS = frozenset(
    {
        "API15-S-023",
        "API15-S-031", "API15-S-032", "API15-S-033", "API15-S-034",
        "API15-S-051", "API15-S-052", "API15-S-053", "API15-S-054",
        "API15-S-070", "API15-S-071", "API15-S-072", "API15-S-073",
        "API15-S-096", "API15-S-097",
    }
)


@dataclass(slots=True)
class EditorialTransportServices:
    application: EditorialApplication
    idempotency: RequestIdempotencyPort | None = None


def chat04_operations(spec: dict[str, Any]) -> list[OperationContract]:
    operations = [op for op in iter_operations(spec) if op.operation_id in CHAT04_OPERATION_IDS]
    found = {op.operation_id for op in operations}
    if found != CHAT04_OPERATION_IDS:
        missing = sorted(CHAT04_OPERATION_IDS - found)
        extra = sorted(found - CHAT04_OPERATION_IDS)
        raise RuntimeError(f"CHAT04 canonical RC8 operation mismatch: missing={missing}, extra={extra}")
    if len(operations) != 42:
        raise RuntimeError(f"CHAT04 must own exactly 42 RC8 operations, found {len(operations)}")
    return operations


def _required_permissions(text: str) -> set[str]:
    # API15-S-025 deliberately uses action-specific prose; the application service
    # performs its exact per-action composite after the body is contract-validated.
    return set(_PERMISSION_RE.findall(text))


async def _require_l1(request: Request, raw_session: str, principal, operation_id: str) -> None:
    try:
        await request.app.state.services.auth.require_step_up(raw_session, principal, "L1")
    except Denied:
        await request.app.state.services.audit.append(
            "AUTH.STEPUP.FAILURE",
            actor_admin_id=principal.admin_id,
            site_id=getattr(getattr(request.state, "request_context", None), "site", None).site_id
            if getattr(getattr(request.state, "request_context", None), "site", None)
            else None,
            details={"operation_id": operation_id, "required_level": "L1"},
        )
        raise


async def _request_body(request: Request, spec: dict[str, Any], contract: OperationContract) -> Any:
    if contract.request_schema is None:
        return None
    try:
        body = await request.json()
    except Exception as exc:
        raise ValidationFault("request validation failed") from exc
    validate_json(spec, contract.request_schema, body)
    return body


async def _idempotent_execute(
    request: Request,
    transport: EditorialTransportServices,
    contract: OperationContract,
    *,
    principal,
    context,
    path_params: dict[str, Any],
    query: dict[str, Any],
    body: Any,
) -> tuple[int, Any, dict[str, str]]:
    if contract.idempotency != "REQUIRED":
        return await transport.application.execute(
            contract.operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
        )

    store = transport.idempotency
    if store is None:
        # A process-local hidden fallback would violate the RC8 24-hour replay
        # guarantee once the API is replicated. CHAT00/CHAT05 must inject the
        # approved shared implementation; CHAT04 does not implement Redis here.
        raise Unavailable("idempotency service unavailable")
    key = request.headers.get("idempotency-key")
    if not key:
        # Required-header validation normally catches this first. Keep the
        # application boundary fail-closed if this helper is reused directly.
        raise ValidationFault("request validation failed")

    fingerprint_path = request.url.path
    decision, replay = await store.claim_or_replay(
        key=key,
        actor_admin_id=principal.admin_id,
        scope_key=context.site_id,
        method=contract.method,
        path=fingerprint_path,
        body=body,
    )
    if decision == "REPLAY":
        if replay is None:
            raise RuntimeError("idempotency replay decision did not include an outcome")
        return replay
    if decision != "CLAIMED":
        raise RuntimeError(f"unsupported idempotency decision {decision!r}")

    try:
        outcome = await transport.application.execute(
            contract.operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
        )
    except Exception:
        await store.abandon(
            key=key,
            actor_admin_id=principal.admin_id,
            scope_key=context.site_id,
            method=contract.method,
            path=fingerprint_path,
            body=body,
        )
        raise

    await store.store_outcome(
        key=key,
        actor_admin_id=principal.admin_id,
        scope_key=context.site_id,
        method=contract.method,
        path=fingerprint_path,
        body=body,
        outcome=outcome,
    )
    return outcome


def _endpoint_for(contract: OperationContract, spec: dict[str, Any], state_attr: str):
    async def endpoint(request: Request):
        path_params, query = validate_parameters(spec, contract, request)
        raw_session, session, principal = await current_session(request)

        site_key = str(path_params["site_key"])
        context = await request.app.state.services.contexts.admin_site(
            site_key,
            principal=principal,
            request_id=request.state.request_id,
        )
        request.state.request_context = RequestContext(
            request.state.request_id,
            contract.operation_id,
            site=context,
        )

        await enforce_transport_quota(
            request,
            class_id=contract.rate_class,
            actor_key=f"{principal.admin_id}:{context.site_id}",
        )

        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            await require_csrf(request, session, actor_admin_id=principal.admin_id)

        required = _required_permissions(contract.permissions)
        request.app.state.services.authorization.require_site(principal, site_key, required)
        if contract.operation_id in MANAGER_OPERATION_IDS:
            request.app.state.services.authorization.require_site_manager(principal, site_key)

        if contract.operation_id in L1_OPERATION_IDS:
            await _require_l1(request, raw_session, principal, contract.operation_id)

        body = await _request_body(request, spec, contract)
        transport: EditorialTransportServices | None = getattr(request.app.state, state_attr, None)
        if transport is None:
            raise Unavailable("editorial service unavailable")

        status, payload, headers = await _idempotent_execute(
            request,
            transport,
            contract,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
        )
        validate_response(spec, contract, status, payload)
        if status == 204:
            return Response(status_code=204, headers=headers)
        return JSONResponse(payload, status_code=status, headers=headers)

    endpoint.__name__ = f"chat04_{contract.operation_id.lower().replace('-', '_')}"
    return endpoint


def build_router(
    spec: dict[str, Any],
    *,
    state_attr: str = "chat04_editorial",
) -> APIRouter:
    """Build exactly the CHAT04 RC8 SITE transport router.

    CHAT00 integrates the returned router into ``bp_api.app`` and assigns an
    ``EditorialTransportServices`` instance to ``app.state.<state_attr>``. This
    avoids editing CHAT03-owned composition files inside the CHAT04 handoff.
    """

    router = APIRouter()
    for contract in chat04_operations(spec):
        router.add_api_route(
            contract.path,
            _endpoint_for(contract, spec, state_attr),
            methods=[contract.method],
            operation_id=contract.operation_id,
            status_code=contract.success_status,
            response_model=None,
        )
    return router
