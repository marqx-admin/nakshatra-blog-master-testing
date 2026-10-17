from __future__ import annotations

from urllib.parse import urlsplit

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from bp_domain.errors import NotFound, Unavailable
from bp_application.website_preview import PREVIEW_PERMISSIONS
from bp_domain.context import RequestContext

from ..contract import operation_index, validate_parameters, validate_response
from ..dependencies.security import current_session, require_csrf
from ..rate_limits import enforce_transport_quota

router = APIRouter()


def _contract(request: Request, operation_id: str):
    index = getattr(request.app.state, "operation_index", None)
    if index is None:
        index = operation_index(request.app.state.canonical_openapi)
        request.app.state.operation_index = index
    return index[operation_id]


def _local_admin_navigation(environment: str, admin_host: str) -> bool:
    if environment not in {"development", "test"}:
        return False
    try:
        host = urlsplit("//" + admin_host).hostname or ""
    except ValueError:
        return False
    return host in {"localhost", "127.0.0.1"} or host.endswith(".localhost")


def _local_temporary_destination(environment: str, admin_host: str, temporary_url: str | None) -> str | None:
    if not _local_admin_navigation(environment, admin_host) or not temporary_url:
        return None
    try:
        parsed = urlsplit(temporary_url)
    except ValueError:
        return None
    if parsed.scheme in {"http", "https"} and (parsed.hostname or "").endswith(".localhost"):
        return temporary_url
    return None


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
    resolver = getattr(request.app.state.services.contexts.sites, "public_url_for_site", None)
    public_url = None
    if resolver is not None:
        public_url = await resolver(context.site_id, request.headers.get("host", ""))
    # Local navigation uses the registered RC13 destination, never a browser map.
    settings = request.app.state.settings
    admin_host = request.headers.get("host", "")
    temporary_url = payload.get("temporary_site_url")
    # Content editors need preview navigation without gaining Settings or domain permissions.
    local_resolver = getattr(request.app.state.services.contexts.sites, "local_temporary_url_for_site", None)
    if not temporary_url and local_resolver and _local_admin_navigation(settings.environment, admin_host):
        temporary_url = await local_resolver(context.site_id, settings.temporary_domain_suffix, settings.temporary_site_url_config)
    public_url = _local_temporary_destination(settings.environment, admin_host, temporary_url) or public_url
    if not public_url:
        public_url = f"https://{context.canonical_domain}"
    return JSONResponse(
        payload,
        status_code=200,
        headers={"Cache-Control": "no-store", "X-BP-Public-Url": public_url},
    )


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


async def _website_setup_context(request: Request, operation_id: str):
    contract = _contract(request, operation_id)
    params, _ = validate_parameters(request.app.state.canonical_openapi, contract, request)
    _, session, principal = await current_session(request)
    context = await request.app.state.services.contexts.admin_site(params["site_key"], principal=principal, request_id=request.state.request_id)
    request.app.state.services.authorization.require_site(principal, context.site_key, PREVIEW_PERMISSIONS)
    request.state.request_context = RequestContext(request.state.request_id, operation_id, site=context)
    await enforce_transport_quota(request,class_id=contract.rate_class,actor_key=f"{principal.admin_id}:{context.site_id}")
    return contract, context, session, principal


@router.post("/api/v1/admin/sites/{site_key}/website-preview", operation_id="API15-S-098", status_code=201)
async def website_preview_handoff(request: Request, site_key: str):
    contract, context, session, principal = await _website_setup_context(request,"API15-S-098")
    await require_csrf(request,session,actor_admin_id=principal.admin_id)
    authority = request.app.state.services.website_preview
    if authority is None: raise Unavailable("website preview unavailable")
    registry = request.app.state.services.contexts.sites
    settings = request.app.state.settings
    origin = f"https://{context.canonical_domain}"
    resolver = getattr(registry,"local_temporary_url_for_site",None)
    if resolver and _local_admin_navigation(settings.environment,request.headers.get("host","")):
        temporary = await resolver(context.site_id,settings.temporary_domain_suffix,settings.temporary_site_url_config)
        origin = _local_temporary_destination(settings.environment,request.headers.get("host",""),temporary) or origin
    raw, expires = await authority.issue(context,session)
    payload = {"preview_url":origin.rstrip("/")+"/_preview/site?handoff="+raw,"expires_at":expires.isoformat()}
    await request.app.state.services.audit.append("SEC.PREVIEW.ISSUED",actor_admin_id=principal.admin_id,site_id=context.site_id,details={"kind":"WEBSITE"})
    validate_response(request.app.state.canonical_openapi,contract,201,payload)
    return JSONResponse(payload,status_code=201,headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer"})


@router.get("/api/v1/admin/sites/{site_key}/website-readiness", operation_id="API15-S-099", status_code=200)
async def website_readiness(request: Request, site_key: str):
    contract, context, _, _ = await _website_setup_context(request,"API15-S-099")
    provider = request.app.state.services.website_readiness
    if provider is None: raise Unavailable("website readiness unavailable")
    payload = await provider.build(context)
    validate_response(request.app.state.canonical_openapi,contract,200,payload)
    return JSONResponse(payload,headers={"Cache-Control":"no-store"})
