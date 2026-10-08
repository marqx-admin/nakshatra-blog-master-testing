from __future__ import annotations

import os
from ipaddress import ip_address
import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import UUID

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse, Response

from bp_domain.errors import NotFound, Unauthenticated, ValidationFault
from bp_domain.context import RequestContext

from ..contract import operation_index, validate_response
from ..dependencies.security import PREVIEW_COOKIE, set_preview_cookie
from ..rate_limits import enforce_transport_quota, safe_subject_hash, source_network_key

router = APIRouter()

_MEDIA_URL = re.compile(
    r"^/m/(?P<site_key>SITE-[0-9]{2,})/(?P<media_id>[0-9a-fA-F-]{36})/"
)


def _trusted_preview_media_reference(
    value: str, *, media_origin: str
) -> tuple[str, str] | None:
    if not media_origin:
        return None
    parsed = urlsplit(value)
    trusted = urlsplit(media_origin.rstrip("/"))
    if (
        parsed.scheme not in {"http", "https"}
        or parsed.scheme != trusted.scheme
        or parsed.netloc != trusted.netloc
        or parsed.username
        or parsed.password
    ):
        return None
    match = _MEDIA_URL.match(parsed.path)
    if not match:
        return None
    return match.group("site_key"), match.group("media_id")


_MEDIA_URL_FIELDS = frozenset({"url", "image_url", "public_url", "src"})
_MEDIA_ID = re.compile(r"^[0-9a-fA-F-]{36}$")


def _preview_media_references(
    value: object,
    *,
    media_origin: str,
    media_id: str | None = None,
) -> set[tuple[str, str]]:
    references: set[tuple[str, str]] = set()

    if isinstance(value, dict):
        scoped_media_id = media_id
        candidate = value.get("media_id")
        if isinstance(candidate, str) and _MEDIA_ID.fullmatch(candidate):
            scoped_media_id = candidate

        for key, child in value.items():
            if (
                key in _MEDIA_URL_FIELDS
                and isinstance(child, str)
                and scoped_media_id
            ):
                reference = _trusted_preview_media_reference(
                    child, media_origin=media_origin
                )
                if (
                    reference
                    and reference[1].lower() == scoped_media_id.lower()
                ):
                    references.add(reference)
                continue

            references.update(
                _preview_media_references(
                    child,
                    media_origin=media_origin,
                    media_id=scoped_media_id,
                )
            )

    elif isinstance(value, list):
        for child in value:
            references.update(
                _preview_media_references(
                    child,
                    media_origin=media_origin,
                    media_id=media_id,
                )
            )

    return references


def _attach_preview_media_grants(
    value: object,
    grants: dict[tuple[str, str], str],
    *,
    media_origin: str,
    media_id: str | None = None,
) -> object:
    if isinstance(value, dict):
        scoped_media_id = media_id
        candidate = value.get("media_id")
        if isinstance(candidate, str) and _MEDIA_ID.fullmatch(candidate):
            scoped_media_id = candidate

        result: dict[object, object] = {}

        for key, child in value.items():
            if (
                key in _MEDIA_URL_FIELDS
                and isinstance(child, str)
                and scoped_media_id
            ):
                reference = _trusted_preview_media_reference(
                    child, media_origin=media_origin
                )

                grant = (
                    grants.get(reference)
                    if reference
                    and reference[1].lower() == scoped_media_id.lower()
                    else None
                )

                if grant:
                    parsed = urlsplit(child)
                    query = [
                        (name, item)
                        for name, item in parse_qsl(
                            parsed.query, keep_blank_values=True
                        )
                        if name != "preview_grant"
                    ]
                    query.append(("preview_grant", grant))
                    child = urlunsplit(
                        (
                            parsed.scheme,
                            parsed.netloc,
                            parsed.path,
                            urlencode(query),
                            parsed.fragment,
                        )
                    )

            result[key] = _attach_preview_media_grants(
                child,
                grants,
                media_origin=media_origin,
                media_id=scoped_media_id,
            )

        return result

    if isinstance(value, list):
        return [
            _attach_preview_media_grants(
                child,
                grants,
                media_origin=media_origin,
                media_id=media_id,
            )
            for child in value
        ]

    return value


def _private_or_loopback_client(host: str) -> bool:
    try:
        address = ip_address(host)
    except ValueError:
        return False
    return address.is_private or address.is_loopback


def _effective_public_host(request: Request) -> str:
    """Preserve the browser tenant host across the trusted internal SSR hop.

    Public site SSR calls the API over the private Docker service origin
    (http://api:8080). Node fetch does not preserve a caller-supplied Host
    header, so site SSR forwards the original browser host in
    X-BP-Public-Host.

    In development/test the override remains loopback-only. In staging and
    production it is accepted only for a direct private-network request whose
    transport Host is the internal API service name. Requests arriving through
    public ingress keep their actual Host and cannot use this override.
    """
    direct_host = request.headers.get("host", "").strip()
    override = request.headers.get("x-bp-public-host", "").strip()
    if not override:
        return direct_host

    client_host = request.client.host if request.client else ""
    environment = os.getenv("BP_ENV")

    if environment in {"development", "test"} and client_host in {"127.0.0.1", "::1"}:
        return override

    if (
        environment in {"staging", "production"}
        and direct_host.lower() in {"api", "api:8080"}
        and _private_or_loopback_client(client_host)
    ):
        return override

    return direct_host


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


async def _crawler_response(request: Request, path: str) -> Response:
    crawler = request.app.state.services.crawler_resources
    if crawler is None:
        return Response(status_code=404)
    try:
        context = await request.app.state.services.contexts.public(
            _effective_public_host(request), request_id=request.state.request_id,
        )
    except NotFound:
        return Response(status_code=404, headers={"Cache-Control": "no-store"})
    request.state.request_context = RequestContext(
        request.state.request_id, "PUBLIC_CRAWLER", site=context
    )
    if path == "/robots.txt":
        status, body, content_type = await crawler.robots(context)
    else:
        status, body, content_type = await crawler.sitemap(context, path)
    return Response(content=body, status_code=status, media_type=content_type)


@router.get("/robots.txt", include_in_schema=False)
async def robots_txt_resource(request: Request) -> Response:
    return await _crawler_response(request, "/robots.txt")


@router.get("/sitemap.xml", include_in_schema=False)
async def sitemap_index_resource(request: Request) -> Response:
    return await _crawler_response(request, "/sitemap.xml")


@router.get("/sitemaps/{resource_name}", include_in_schema=False)
async def sitemap_child_resource(request: Request, resource_name: str) -> Response:
    if not re.fullmatch(r"[a-z0-9-]+\.xml", resource_name):
        return Response(status_code=404)
    return await _crawler_response(request, f"/sitemaps/{resource_name}")


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
    handoff = request.query_params.get("handoff")
    raw = request.cookies.get(PREVIEW_COOKIE)
    validator = request.app.state.services.preview_authority
    if validator is None:
        raise Unauthenticated("preview authority unavailable")
    credential = handoff or raw
    if not credential or len(credential) > 512:
        raise Unauthenticated("preview authority required")
    await enforce_transport_quota(
        request,
        class_id="PREVIEW_READ",
        actor_key=f"{safe_subject_hash(credential)}:{context.site_id}",
    )
    exchanged = False
    if handoff:
        raw, _ = await validator.exchange_handoff(
            handoff,
            site_id=context.site_id,
            post_id=str(post_id),
            request_host=context.request_host or "",
        )
        exchanged = True
    assert raw is not None
    source_snapshot = await validator.validate(
        raw,
        site_id=context.site_id,
        post_id=str(post_id),
        request_host=context.request_host or "",
    )
    body = await request.app.state.services.public_pages.resolve_preview(
        context, post_id=str(post_id), source_snapshot=source_snapshot
    )
    media_origin = os.getenv("BP_MEDIA_CDN_ORIGIN", "").rstrip("/")
    references = _preview_media_references(body, media_origin=media_origin)
    grants = {
        reference: await validator.issue_media_grant(
            raw,
            site_id=context.site_id,
            post_id=str(post_id),
            media_id=reference[1],
            request_host=context.request_host or "",
        )
        for reference in references
        if reference[0] == context.site_key
    }
    body = _attach_preview_media_grants(
        body, grants, media_origin=media_origin
    )
    validate_response(request.app.state.canonical_openapi, _contract(request, operation_id), 200, body)
    response = JSONResponse(
        body,
        status_code=200,
        headers={"Cache-Control": "no-store", "Referrer-Policy": "no-referrer"},
    )
    if exchanged:
        set_preview_cookie(response, preview_session=raw)
    return response
