from __future__ import annotations

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from bp_domain.errors import SecurityFault


_SAFE_MESSAGES = {
    400: "Request is invalid.",
    401: "Authentication required.",
    403: "Request denied.",
    404: "Resource not found.",
    409: "Request conflicts with current state.",
    422: "Request validation failed.",
    429: "Too many requests.",
    503: "Service unavailable.",
}


def error_body(code: str, message: str, request_id: str, details: list[dict] | None = None) -> dict:
    error = {"code": code, "message": message, "request_id": request_id}
    if details:
        error["details"] = details
    return {"error": error}


def _headers(request: Request, *, retry_after: int | None = None) -> dict[str, str]:
    headers = {"X-Request-ID": getattr(request.state, "request_id", "unknown")}
    path = request.url.path
    if path.startswith("/api/v1/auth/") or path.startswith("/api/v1/admin/") or "/public/preview/" in path:
        headers["Cache-Control"] = "no-store"
    for key, value in getattr(request.state, "rate_headers", {}).items():
        headers[key] = value
    if retry_after is not None:
        headers["Retry-After"] = str(max(1, retry_after))
    return headers


async def security_fault_handler(request: Request, exc: SecurityFault):
    rid = getattr(request.state, "request_id", "unknown")
    message = _SAFE_MESSAGES.get(exc.status, "Request failed.")
    details = [detail.to_wire() for detail in exc.details]
    return JSONResponse(
        status_code=exc.status,
        content=error_body(exc.code, message, rid, details or None),
        headers=_headers(request, retry_after=exc.retry_after if exc.status == 429 else None),
    )


async def request_validation_handler(request: Request, exc: RequestValidationError):
    rid = getattr(request.state, "request_id", "unknown")
    details: list[dict[str, str]] = []
    for error in exc.errors()[:20]:
        loc = [str(part) for part in error.get("loc", ()) if part not in {"body", "query", "path", "header"}]
        item = {"code": "INVALID_FIELD", "message": "Value does not satisfy the canonical contract."}
        if loc:
            item["field"] = ".".join(loc)
        details.append(item)
    return JSONResponse(
        status_code=422,
        content=error_body("VALIDATION_FAILED", "Request validation failed.", rid, details or None),
        headers=_headers(request),
    )


async def generic_error_handler(request: Request, exc: Exception):
    rid = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=503,
        content=error_body("SERVICE_UNAVAILABLE", "Service unavailable.", rid),
        headers=_headers(request),
    )
