from __future__ import annotations

import re

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

from bp_domain.errors import Denied, ValidationFault
from bp_domain.context import RequestContext

from ..contract import OperationContract, validate_json, validate_parameters, validate_response
from ..dependencies.security import current_session, require_csrf
from ..rate_limits import enforce_transport_quota

_PERMISSION_RE = re.compile(r"\b[a-z_]+\.[a-z_]+\b")

# DOC-19 L2 security overlay for CHAT03-owned GLOBAL operations. The set maps
# the explicit site/domain, Admin authority, GLOBAL role, and Platform Settings
# high-risk classes. Read operations never acquire step-up implicitly.
L2_OPS = frozenset(
    {
        "API15-G-015",  # disable
        "API15-G-016",  # archive
        "API15-G-017",  # deletion request
        "API15-G-019",  # domain create
        "API15-G-020",  # domain update
        "API15-G-021",  # domain delete
        "API15-G-022",  # domain canonical change
        "API15-G-035",  # admin disable
        "API15-G-036",  # site assignment
        "API15-G-037",  # role assignment
        "API15-G-041",  # role create
        "API15-G-043",  # role edit
        "API15-G-044",  # role retire
        "API15-G-045",  # role duplication creates a new role
        "API15-G-061",  # platform settings edit
    }
)


def _canonical_global_permissions(spec: dict) -> frozenset[str]:
    values = (
        spec.get("components", {})
        .get("schemas", {})
        .get("AdminGlobalContext", {})
        .get("properties", {})
        .get("effective_permissions", {})
        .get("items", {})
        .get("enum", [])
    )
    return frozenset(str(value) for value in values)


def _required_permissions(text: str, allowed: frozenset[str]) -> set[str]:
    # x-permissions may contain per-row SITE authorization prose (notably
    # API15-G-003). Only canonical GLOBAL keys authorize the GLOBAL surface.
    return {value for value in _PERMISSION_RE.findall(text) if value in allowed}


async def _require_l2(request: Request, raw_session: str, operation_id: str, principal) -> None:
    try:
        await request.app.state.services.auth.require_step_up(raw_session, principal, "L2")
    except Denied:
        await request.app.state.services.audit.append(
            "AUTH.STEPUP.FAILURE",
            actor_admin_id=principal.admin_id,
            site_id=None,
            details={"operation_id": operation_id, "required_level": "L2"},
        )
        raise


def _endpoint_for(contract: OperationContract, spec: dict, allowed_global: frozenset[str]):
    """Bind one canonical contract without exposing closure state as HTTP input."""

    async def endpoint(request: Request):
        path_params, query = validate_parameters(spec, contract, request)
        raw, session, principal = await current_session(request)

        await enforce_transport_quota(
            request,
            class_id=contract.rate_class,
            actor_key=f"{principal.admin_id}:GLOBAL",
        )

        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            await require_csrf(request, session, actor_admin_id=principal.admin_id)

        required = _required_permissions(contract.permissions, allowed_global)
        request.app.state.services.authorization.require_global(principal, required)
        context = request.app.state.services.contexts.global_context(
            principal=principal,
            request_id=request.state.request_id,
        )
        request.state.request_context = RequestContext(
            request.state.request_id,
            contract.operation_id,
            global_scope=context,
        )

        if contract.operation_id in L2_OPS:
            await _require_l2(request, raw, contract.operation_id, principal)

        body = None
        if contract.request_schema is not None:
            try:
                body = await request.json()
            except Exception as exc:
                raise ValidationFault("request validation failed") from exc
            validate_json(spec, contract.request_schema, body)

        status, payload, headers = await request.app.state.services.global_operations.execute(
            contract.operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
            headers={
                "x-request-id": request.state.request_id,
                **(
                    {"idempotency-key": request.headers["idempotency-key"]}
                    if request.headers.get("idempotency-key")
                    else {}
                ),
            },
        )
        validate_response(spec, contract, status, payload)
        if status == 204:
            return Response(status_code=204, headers=headers)
        return JSONResponse(payload, status_code=status, headers=headers)

    endpoint.__name__ = f"chat03_{contract.operation_id.lower().replace('-', '_')}"
    return endpoint


def register(router: APIRouter, spec: dict, operations: list[OperationContract]):
    allowed_global = _canonical_global_permissions(spec)
    for contract in operations:
        router.add_api_route(
            contract.path,
            _endpoint_for(contract, spec, allowed_global),
            methods=[contract.method],
            operation_id=contract.operation_id,
            status_code=contract.success_status,
            response_model=None,
        )
