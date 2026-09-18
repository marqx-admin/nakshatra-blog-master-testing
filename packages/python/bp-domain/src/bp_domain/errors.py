from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class ErrorDetail:
    code: str
    message: str
    field: str | None = None

    def to_wire(self) -> dict[str, str]:
        payload = {"code": self.code, "message": self.message}
        if self.field is not None:
            payload["field"] = self.field
        return payload


class SecurityFault(Exception):
    code = "DENIED"
    status = 403

    def __init__(
        self,
        message: str = "request denied",
        *,
        details: tuple[ErrorDetail, ...] = (),
        retry_after: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.safe_message = message
        self.details = details
        self.retry_after = retry_after
        self.metadata = metadata or {}


class BadRequest(SecurityFault):
    code = "BAD_REQUEST"
    status = 400


class Unauthenticated(SecurityFault):
    code = "UNAUTHENTICATED"
    status = 401


class Denied(SecurityFault):
    code = "DENIED"
    status = 403


class NotFound(SecurityFault):
    code = "NOT_FOUND"
    status = 404


class Conflict(SecurityFault):
    code = "CONFLICT"
    status = 409


class VersionConflict(Conflict):
    code = "VERSION_CONFLICT"


class StateConflict(Conflict):
    code = "STATE_CONFLICT"


class IdempotencyKeyReuse(Conflict):
    code = "IDEMPOTENCY_KEY_REUSE"


class ValidationFault(SecurityFault):
    code = "VALIDATION_FAILED"
    status = 422


class RateLimited(SecurityFault):
    code = "RATE_LIMITED"
    status = 429


class Unavailable(SecurityFault):
    code = "SERVICE_UNAVAILABLE"
    status = 503
