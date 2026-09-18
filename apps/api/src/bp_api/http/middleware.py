from __future__ import annotations

import secrets
from urllib.parse import urlsplit

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

ADMIN_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
ADMIN_HEADERS = {
    "accept",
    "content-type",
    "x-csrf-token",
    "x-request-id",
    "idempotency-key",
}


def _error(status: int, code: str, message: str, request_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"error": {"code": code, "message": message, "request_id": request_id}},
        headers={"X-Request-ID": request_id, "Cache-Control": "no-store"},
    )


def _append_vary(response: Response, value: str) -> None:
    current = response.headers.get("Vary", "")
    values = {part.strip() for part in current.split(",") if part.strip()}
    values.add(value)
    response.headers["Vary"] = ", ".join(sorted(values))


class RequestSecurityMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        *,
        admin_origins: tuple[str, ...],
        enforce_https: bool = False,
        hsts_include_subdomains: bool = False,
    ):
        super().__init__(app)
        self.admin_origins = frozenset(admin_origins)
        self.enforce_https = enforce_https
        self.hsts_include_subdomains = hsts_include_subdomains

    async def dispatch(self, request, call_next):
        rid = request.headers.get("x-request-id")
        if not rid or len(rid) > 128:
            rid = secrets.token_hex(16)
        request.state.request_id = rid
        request.state.csp_nonce = secrets.token_urlsafe(18)
        request.state.rate_headers = {}

        path = request.url.path
        is_admin = path.startswith("/api/v1/admin/") or path == "/api/v1/admin/context"
        is_auth = path.startswith("/api/v1/auth/")
        is_preview = path.startswith("/api/v1/public/preview/")
        protected = is_admin or is_auth or is_preview

        if self.enforce_https and protected and request.url.scheme != "https":
            response = _error(400, "BAD_REQUEST", "HTTPS required.", rid)
            return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=is_preview)

        origin = request.headers.get("origin")
        if (is_admin or is_auth) and origin is not None:
            if origin in {"null", "file://"} or origin not in self.admin_origins:
                await request.app.state.services.audit.append(
                    "SEC.CORS.REJECT", actor_admin_id=None, site_id=None, details={"reason": "ORIGIN"}
                )
                response = _error(403, "DENIED", "Request denied.", rid)
                return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=is_preview)

        if is_preview and origin is not None:
            allowed = False
            try:
                parsed = urlsplit(origin)
                allowed = (
                    parsed.scheme == request.url.scheme
                    and parsed.netloc.lower() == request.headers.get("host", "").lower()
                    and parsed.path in {"", "/"}
                    and not parsed.query
                    and not parsed.fragment
                )
            except ValueError:
                allowed = False
            if not allowed:
                await request.app.state.services.audit.append(
                    "SEC.CORS.REJECT",
                    actor_admin_id=None,
                    site_id=None,
                    details={"reason": "PREVIEW_ORIGIN"},
                )
                response = _error(403, "DENIED", "Request denied.", rid)
                return self._secure_headers(
                    response,
                    request,
                    is_admin=False,
                    is_auth=False,
                    is_preview=True,
                )

        if request.method == "OPTIONS" and (is_admin or is_auth):
            if origin not in self.admin_origins:
                await request.app.state.services.audit.append(
                    "SEC.CORS.REJECT", actor_admin_id=None, site_id=None, details={"reason": "PREFLIGHT_ORIGIN"}
                )
                response = _error(403, "DENIED", "Request denied.", rid)
                return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=False)
            requested_headers = {
                value.strip().lower()
                for value in request.headers.get("access-control-request-headers", "").split(",")
                if value.strip()
            }
            requested_method = request.headers.get("access-control-request-method", "").upper()
            if requested_headers - ADMIN_HEADERS or requested_method not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
                await request.app.state.services.audit.append(
                    "SEC.CORS.REJECT", actor_admin_id=None, site_id=None, details={"reason": "PREFLIGHT_SHAPE"}
                )
                response = _error(403, "DENIED", "Request denied.", rid)
                return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=False)
            response = Response(status_code=204)
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = ADMIN_METHODS
            response.headers["Access-Control-Allow-Headers"] = ", ".join(sorted(ADMIN_HEADERS))
            response.headers["Access-Control-Max-Age"] = "600"
            _append_vary(response, "Origin")
            return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=False)

        response = await call_next(request)
        for key, value in getattr(request.state, "rate_headers", {}).items():
            response.headers[key] = value

        if origin and origin in self.admin_origins and (is_admin or is_auth):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            _append_vary(response, "Origin")

        return self._secure_headers(response, request, is_admin=is_admin, is_auth=is_auth, is_preview=is_preview)

    def _secure_headers(self, response: Response, request, *, is_admin: bool, is_auth: bool, is_preview: bool) -> Response:
        rid = getattr(request.state, "request_id", "unknown")
        response.headers["X-Request-ID"] = rid
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        hsts = "max-age=31536000"
        if self.hsts_include_subdomains:
            hsts += "; includeSubDomains"
        response.headers["Strict-Transport-Security"] = hsts

        nonce = getattr(request.state, "csp_nonce", "")
        if is_admin or is_auth:
            response.headers["Referrer-Policy"] = "same-origin"
            response.headers["Cache-Control"] = "no-store"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                f"script-src 'self' 'nonce-{nonce}'; "
                "object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
            )
        elif is_preview:
            response.headers["Referrer-Policy"] = "no-referrer"
            response.headers["Cache-Control"] = "no-store"
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                f"script-src 'self' 'nonce-{nonce}'; "
                "object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
            )
        else:
            response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
            response.headers.setdefault(
                "Content-Security-Policy",
                "default-src 'self'; object-src 'none'; base-uri 'self'",
            )
        return response
