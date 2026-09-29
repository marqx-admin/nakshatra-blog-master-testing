from __future__ import annotations

import re
from email.parser import BytesParser
from email.policy import default
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response

from bp_domain.context import RequestContext
from bp_domain.errors import Unavailable, ValidationFault

from ..contract import operation_index, validate_json, validate_parameters, validate_response
from ..dependencies.security import current_session, require_csrf
from ..rate_limits import enforce_transport_quota

router = APIRouter()
_PERMISSION_RE = re.compile(r"\b[a-z_]+\.[a-z_]+\b")
_MEDIA_FIELDS = frozenset({"file", "alt_text", "caption", "credit", "title", "source_url"})
_MAX_MULTIPART_BODY = 20 * 1024 * 1024 + 1024 * 1024
_MEDIA_RESPONSE_OPERATION_IDS = frozenset(
    {"API15-S-060", "API15-S-061", "API15-S-062", "API15-S-063", "API15-S-064"}
)

CHAT05_OPERATION_IDS = (
    "API15-S-060", "API15-S-061", "API15-S-062", "API15-S-063", "API15-S-064", "API15-S-065", "API15-S-066",
    "API15-S-080", "API15-S-081",
    "API15-S-082", "API15-S-083", "API15-S-084", "API15-S-085", "API15-S-086",
    "API15-S-090", "API15-S-091", "API15-S-092", "API15-S-093", "API15-S-094",
)

MANAGER_OPERATION_IDS = frozenset(
    {
        "API15-S-064", "API15-S-065",
        "API15-S-080", "API15-S-081",
        "API15-S-082", "API15-S-083", "API15-S-084", "API15-S-085", "API15-S-086",
        "API15-S-093", "API15-S-094",
    }
)


def _contract(request: Request, operation_id: str):
    full = getattr(request.app.state, "chat05_operation_index", None)
    if full is None:
        full = operation_index(request.app.state.canonical_openapi)
        request.app.state.chat05_operation_index = full
    return full[operation_id]


async def _multipart_media(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    if not content_type.lower().startswith("multipart/form-data") or "boundary=" not in content_type:
        raise ValidationFault("request validation failed")
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > _MAX_MULTIPART_BODY:
            raise ValidationFault("request validation failed")
    message = BytesParser(policy=default).parsebytes(
        b"Content-Type: " + content_type.encode("latin-1") + b"\r\nMIME-Version: 1.0\r\n\r\n" + bytes(data)
    )
    result: dict[str, Any] = {}
    for part in message.iter_parts():
        name = part.get_param("name", header="content-disposition")
        if not name or name not in _MEDIA_FIELDS or name in result:
            raise ValidationFault("request validation failed")
        payload = part.get_payload(decode=True) or b""
        filename = part.get_filename()
        if name == "file":
            if not filename:
                raise ValidationFault("request validation failed")
            result["file"] = {
                "filename": filename,
                "content_type": part.get_content_type().lower(),
                "bytes": payload,
            }
        else:
            try:
                result[name] = payload.decode(part.get_content_charset() or "utf-8")
            except UnicodeDecodeError as exc:
                raise ValidationFault("request validation failed") from exc
    if "file" not in result:
        raise ValidationFault("request validation failed")
    return result


async def _body(request: Request, contract) -> Any:
    if contract.operation_id in {"API15-S-061", "API15-S-064"}:
        return await _multipart_media(request)
    if contract.request_schema is None:
        return None
    try:
        body = await request.json()
    except Exception as exc:
        raise ValidationFault("request validation failed") from exc
    validate_json(request.app.state.canonical_openapi, contract.request_schema, body)
    return body


def _admin_media_url_with_grant(
    value: str,
    grant: str,
    *,
    media_origin: str,
    site_key: str,
    media_id: str,
) -> str:
    """Attach a grant only to the expected same-site media gateway URL."""

    parsed = urlsplit(value)
    trusted = urlsplit(media_origin.rstrip("/"))
    prefix = f"/m/{site_key}/{media_id}/"
    if (
        not media_origin
        or parsed.scheme not in {"http", "https"}
        or parsed.scheme != trusted.scheme
        or parsed.netloc != trusted.netloc
        or parsed.username
        or parsed.password
        or not parsed.path.startswith(prefix)
    ):
        return value
    query = [
        (name, item)
        for name, item in parse_qsl(parsed.query, keep_blank_values=True)
        if name != "admin_grant"
    ]
    query.append(("admin_grant", grant))
    return urlunsplit(
        (parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment)
    )


async def _secure_admin_media_payload(
    payload: Any,
    *,
    sessions: Any,
    session: Any,
    context: Any,
    media_origin: str,
) -> Any:
    if not isinstance(payload, dict):
        return payload
    raw_records = (
        payload.get("items")
        if isinstance(payload.get("items"), list)
        else [payload.get("media")]
    )
    secured_records: list[Any] = []
    for raw_record in raw_records:
        if not isinstance(raw_record, dict):
            secured_records.append(raw_record)
            continue
        record = dict(raw_record)
        media_id = record.get("media_id")
        public_url = record.get("public_url")
        if isinstance(media_id, str) and isinstance(public_url, str):
            grant = await sessions.issue_media_grant(
                session,
                site_id=context.site_id,
                site_key=context.site_key,
                media_id=media_id,
            )
            record["public_url"] = _admin_media_url_with_grant(
                public_url,
                grant,
                media_origin=media_origin,
                site_key=context.site_key,
                media_id=media_id,
            )
        secured_records.append(record)
    secured = dict(payload)
    if isinstance(payload.get("items"), list):
        secured["items"] = secured_records
    elif secured_records:
        secured["media"] = secured_records[0]
    return secured


def _endpoint(operation_id: str):
    async def endpoint(request: Request):
        contract = _contract(request, operation_id)
        path_params, query = validate_parameters(request.app.state.canonical_openapi, contract, request)
        raw, session, principal = await current_session(request)
        site_key = str(path_params["site_key"])
        context = await request.app.state.services.contexts.admin_site(
            site_key, principal=principal, request_id=request.state.request_id
        )
        request.state.request_context = RequestContext(
            request.state.request_id, contract.operation_id, site=context
        )
        await enforce_transport_quota(
            request, class_id=contract.rate_class, actor_key=f"{principal.admin_id}:{context.site_id}"
        )
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            await require_csrf(request, session, actor_admin_id=principal.admin_id)

        required = set(_PERMISSION_RE.findall(contract.permissions))
        request.app.state.services.authorization.require_site(principal, site_key, required)
        if operation_id in MANAGER_OPERATION_IDS:
            request.app.state.services.authorization.require_site_manager(principal, site_key)
        body = await _body(request, contract)

        # DOC-17/RC7 field-sensitive replace permission is atomic.
        if operation_id == "API15-S-064" and any(name in body for name in ("alt_text", "title", "caption", "credit", "source_url")):
            request.app.state.services.authorization.require_site(principal, site_key, {"media.edit"})

        service = request.app.state.services.derived_operations
        if service is None:
            raise Unavailable("derived-system operation service is not configured")
        status, payload, headers = await service.execute(
            operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
            headers={
                "x-request-id": request.state.request_id,
                **({"idempotency-key": request.headers["idempotency-key"]} if request.headers.get("idempotency-key") else {}),
            },
        )
        if operation_id in _MEDIA_RESPONSE_OPERATION_IDS:
            payload = await _secure_admin_media_payload(
                payload,
                sessions=request.app.state.services.sessions,
                session=session,
                context=context,
                media_origin=str(getattr(getattr(service, "media", None), "media_cdn_origin", "")),
            )
        validate_response(request.app.state.canonical_openapi, contract, status, payload)
        if status == 204:
            return Response(status_code=204, headers=headers)
        return JSONResponse(payload, status_code=status, headers=headers)

    endpoint.__name__ = f"chat05_{operation_id.lower().replace('-', '_')}"
    return endpoint


_ROUTE_TABLE = (
    ("GET", "/api/v1/admin/sites/{site_key}/media", "API15-S-060", 200),
    ("POST", "/api/v1/admin/sites/{site_key}/media", "API15-S-061", 201),
    ("GET", "/api/v1/admin/sites/{site_key}/media/{media_id}", "API15-S-062", 200),
    ("PATCH", "/api/v1/admin/sites/{site_key}/media/{media_id}", "API15-S-063", 200),
    ("POST", "/api/v1/admin/sites/{site_key}/media/{media_id}/replace", "API15-S-064", 200),
    ("DELETE", "/api/v1/admin/sites/{site_key}/media/{media_id}", "API15-S-065", 204),
    ("GET", "/api/v1/admin/sites/{site_key}/media/{media_id}/usage", "API15-S-066", 200),
    ("GET", "/api/v1/admin/sites/{site_key}/seo", "API15-S-080", 200),
    ("PATCH", "/api/v1/admin/sites/{site_key}/seo", "API15-S-081", 200),
    ("GET", "/api/v1/admin/sites/{site_key}/redirects", "API15-S-082", 200),
    ("POST", "/api/v1/admin/sites/{site_key}/redirects", "API15-S-083", 201),
    ("GET", "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}", "API15-S-084", 200),
    ("PATCH", "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}", "API15-S-085", 200),
    ("DELETE", "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}", "API15-S-086", 204),
    ("GET", "/api/v1/admin/sites/{site_key}/search/posts", "API15-S-090", 200),
    ("GET", "/api/v1/admin/sites/{site_key}/search/internal-links", "API15-S-091", 200),
    ("GET", "/api/v1/admin/sites/{site_key}/search/related-posts", "API15-S-092", 200),
    ("GET", "/api/v1/admin/sites/{site_key}/search/status", "API15-S-093", 200),
    ("POST", "/api/v1/admin/sites/{site_key}/search/reindex", "API15-S-094", 202),
)

for method, path, operation_id, status in _ROUTE_TABLE:
    router.add_api_route(path, _endpoint(operation_id), methods=[method], operation_id=operation_id, status_code=status, response_model=None)
