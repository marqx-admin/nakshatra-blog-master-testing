from __future__ import annotations

import hashlib
from typing import Any

from fastapi import Request

from bp_domain.errors import RateLimited
from bp_ports import RateLimitDecision, SecurityAbusePort, SecurityThrottlePort


def safe_subject_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def source_network_key(request: Request) -> str:
    # Deployment/trusted-proxy handling determines the effective client IP in
    # request.client. We hash it before using it as security-state identity.
    host = request.client.host if request.client else "unknown"
    return safe_subject_hash(host)


def rate_headers(decision: RateLimitDecision) -> dict[str, str]:
    headers = {
        "RateLimit-Limit": str(decision.limit),
        "RateLimit-Remaining": str(decision.remaining),
        "RateLimit-Reset": str(max(0, decision.reset_seconds)),
    }
    if not decision.allowed and decision.retry_after_seconds:
        headers["Retry-After"] = str(max(1, decision.retry_after_seconds))
    return headers


def merge_rate_headers(request: Request, decision: RateLimitDecision) -> None:
    request.state.rate_headers = rate_headers(decision)


async def enforce_transport_quota(
    request: Request,
    *,
    class_id: str,
    actor_key: str,
) -> RateLimitDecision:
    limiter: SecurityThrottlePort | None = request.app.state.services.transport_throttle
    if limiter is None:
        # A deployment must supply a shared limiter. The in-memory default is
        # wired by create_app for dev/test so ordinary execution is not silent.
        raise RuntimeError("transport throttle is not configured")
    decision = await limiter.check(
        class_id=class_id,
        actor_key=actor_key,
        request_id=request.state.request_id,
    )
    merge_rate_headers(request, decision)
    if not decision.allowed:
        raise RateLimited("rate limit exceeded", retry_after=decision.retry_after_seconds)
    return decision


async def abuse_peek(request: Request, *, class_id: str, actor_key: str) -> RateLimitDecision | None:
    guard: SecurityAbusePort | None = request.app.state.services.security_abuse
    if guard is None:
        return None
    decision = await guard.peek(class_id=class_id, actor_key=actor_key, request_id=request.state.request_id)
    if not decision.allowed:
        merge_rate_headers(request, decision)
        raise RateLimited("security throttle exceeded", retry_after=decision.retry_after_seconds)
    return decision


async def abuse_failure(request: Request, *, class_id: str, actor_key: str) -> RateLimitDecision | None:
    guard: SecurityAbusePort | None = request.app.state.services.security_abuse
    if guard is None:
        return None
    decision = await guard.record_failure(class_id=class_id, actor_key=actor_key, request_id=request.state.request_id)
    if not decision.allowed:
        merge_rate_headers(request, decision)
        raise RateLimited("security throttle exceeded", retry_after=decision.retry_after_seconds)
    return decision


def auth_token_actor(request: Request, raw_token: str, family: str) -> str:
    return f"{source_network_key(request)}:{family}:{safe_subject_hash(raw_token)}"


def login_actor(request: Request, normalized_email: str) -> str:
    return f"{source_network_key(request)}:{safe_subject_hash(normalized_email)}"


def session_actor(raw_session: str, admin_id: str) -> str:
    return f"{safe_subject_hash(raw_session)}:{admin_id}"


def admin_actor(admin_id: str, scope: str = "GLOBAL") -> str:
    return f"{admin_id}:{scope}"
