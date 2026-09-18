from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from bp_domain.errors import NotFound
from bp_domain.context import RequestContext

from ..contract import operation_index, validate_parameters, validate_response
from ..dependencies.security import current_session
from ..rate_limits import enforce_transport_quota

router = APIRouter()


def _contract(request: Request, operation_id: str):
    index = getattr(request.app.state, "operation_index", None)
    if index is None:
        index = operation_index(request.app.state.canonical_openapi)
        request.app.state.operation_index = index
    return index[operation_id]


@router.get("/api/v1/admin/sites/{site_key}/context", operation_id="API15-S-001", status_code=200)
async def admin_site_context(request: Request, site_key: str):
    contract = _contract(request, "API15-S-001")
    path_params, _ = validate_parameters(request.app.state.canonical_openapi, contract, request)
    site_key = path_params["site_key"]
    raw, _, principal = await current_session(request)
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
        class_id="ADMIN_READ",
        actor_key=f"{principal.admin_id}:{context.site_id}",
    )
    provider = request.app.state.services.site_context_payload
    if provider is None:
        raise NotFound("resource not found")
    payload = await provider.build(principal, context)
    validate_response(request.app.state.canonical_openapi, contract, 200, payload)
    return JSONResponse(payload, status_code=200, headers={"Cache-Control": "no-store"})


@router.get("/api/v1/admin/sites/{site_key}/dashboard", operation_id="API15-S-002", status_code=200)
async def admin_site_dashboard(request: Request, site_key: str):
    contract = _contract(request, "API15-S-002")
    path_params, _ = validate_parameters(request.app.state.canonical_openapi, contract, request)
    raw, _, principal = await current_session(request)
    context = await request.app.state.services.contexts.admin_site(
        path_params["site_key"], principal=principal, request_id=request.state.request_id
    )
    request.state.request_context = RequestContext(
        request.state.request_id, contract.operation_id, site=context
    )
    await enforce_transport_quota(
        request, class_id=contract.rate_class, actor_key=f"{principal.admin_id}:{context.site_id}"
    )
    request.app.state.services.authorization.require_site(principal, context.site_key, {"dashboard.view"})
    provider = request.app.state.services.site_dashboard_payload
    if provider is None:
        raise NotFound("resource not found")
    payload = await provider.build(principal, context)
    validate_response(request.app.state.canonical_openapi, contract, 200, payload)
    return JSONResponse(payload, status_code=200, headers={"Cache-Control": "no-store"})
