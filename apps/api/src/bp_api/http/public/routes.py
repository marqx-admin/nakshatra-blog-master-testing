from __future__ import annotations

import os
from uuid import UUID

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse

from bp_domain.errors import NotFound, Unauthenticated, ValidationFault
from bp_domain.context import RequestContext

from ..contract import operation_index, validate_response
from ..dependencies.security import PREVIEW_COOKIE
from ..rate_limits import enforce_transport_quota, safe_subject_hash, source_network_key

router = APIRouter()


def _effective_public_host(request: Request) -> str:
    """Allow local SSR processes to preserve the browser tenant host.

    Node's fetch implementation does not permit overriding ``Host``.  The
    explicit header is accepted only from loopback in development/test, so it
    cannot weaken production tenant resolution.
    """
    client_host = request.client.host if request.client else ""
    if os.getenv("BP_ENV") in {"development", "test"} and client_host in {"127.0.0.1", "::1"}:
        override = request.headers.get("x-bp-public-host", "").strip()
        if override:
            return override
    return request.headers.get("host", "")


def _contract(request: Request, operation_id: str):
    index = getattr(request.app.state, "operation_index", None)
    if index is None:
        index = operation_index(request.app.state.canonical_openapi)
        request.app.state.operation_index = index
    return index[operation_id]


def _neutral_not_found() -> dict:
    # DOC-13 permits a site-less neutral 404 for an unknown Host. No target,
    # tenant, route, or hidden object metadata is reflected.
    return {
        "context": {
            "page_id": "PUB-SYS-404-01",
            "page_kind": "SYSTEM",
            "render_mode": "SYSTEM",
        },
        "message": {
            "code": 404,
            "title": "Page not found",
            "body": "The requested page is unavailable.",
        },
        "seo": {
            "baseline_indexability": "NOINDEX",
            "title": "Page not found",
            "robots": {"index": False, "follow": False},
            "structured_data": [],
        },
    }


@router.get("/api/v1/public/page", operation_id="API15-PUB-001", status_code=200)
async def public_page(
    request: Request,
    path: str,
    q: str | None = None,
    page: int = 1,
    page_size: int = 20,
):
    operation_id = "API15-PUB-001"
    if not path.startswith("/") or len(path) > 2048 or page < 1 or not 1 <= page_size <= 50 or (q is not None and len(q) > 500):
        raise ValidationFault("request validation failed")

    source = source_network_key(request)
    try:
        context = await request.app.state.services.contexts.public(
            _effective_public_host(request),
            request_id=request.state.request_id,
        )
    except NotFound:
        request.state.request_context = RequestContext(request.state.request_id, operation_id)
        await enforce_transport_quota(request, class_id="PUBLIC_READ", actor_key=f"{source}:NO_SITE")
        payload = _neutral_not_found()
        validate_response(request.app.state.canonical_openapi, _contract(request, operation_id), 404, payload)
        return JSONResponse(payload, status_code=404)

    await enforce_transport_quota(
        request,
        class_id="PUBLIC_READ",
        actor_key=f"{source}:{context.site_id}",
    )
    request.state.request_context = RequestContext(
        request.state.request_id,
        operation_id,
        site=context,
    )
    status, body, headers = await request.app.state.services.public_pages.resolve_page(
        context,
        path=path,
        q=q,
        page=page,
        page_size=page_size,
    )
    contract = _contract(request, operation_id)
    if status in {301, 302, 308}:
        location = headers.get("Location")
        if not location:
            raise RuntimeError(f"{operation_id} redirect missing canonical Location header")
        validate_response(request.app.state.canonical_openapi, contract, status, None)
        return RedirectResponse(location, status_code=status, headers=headers)
    validate_response(request.app.state.canonical_openapi, contract, status, body)
    return JSONResponse(body, status_code=status, headers=headers)


@router.get("/api/v1/public/preview/posts/{post_id}", operation_id="API15-PUB-002", status_code=200)
async def preview_page(request: Request, post_id: UUID):
    operation_id = "API15-PUB-002"
    context = await request.app.state.services.contexts.preview(
        _effective_public_host(request),
        request_id=request.state.request_id,
    )
    request.state.request_context = RequestContext(
        request.state.request_id,
        operation_id,
        site=context,
    )
    raw = request.cookies.get(PREVIEW_COOKIE)
    if not raw:
        raise Unauthenticated("preview authority required")
    await enforce_transport_quota(
        request,
        class_id="PREVIEW_READ",
        actor_key=f"{safe_subject_hash(raw)}:{context.site_id}",
    )
    validator = request.app.state.services.preview_authority
    if validator is None:
        raise Unauthenticated("preview authority unavailable")
    source_snapshot = await validator.validate(
        raw,
        site_id=context.site_id,
        post_id=str(post_id),
        request_host=context.request_host or "",
    )
    body = await request.app.state.services.public_pages.resolve_preview(
        context, post_id=str(post_id), source_snapshot=source_snapshot
    )
    validate_response(request.app.state.canonical_openapi, _contract(request, operation_id), 200, body)
    return JSONResponse(
        body,
        status_code=200,
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
    )
