from __future__ import annotations

import hmac

from fastapi import Request

from bp_application.security import token_hash
from bp_domain.errors import Denied

SESSION_COOKIE = "__Host-bp_admin_session"
CSRF_COOKIE = "__Host-bp_csrf"
PREVIEW_COOKIE = "__Host-bp_preview_session"


async def current_session(request: Request):
    raw = request.cookies.get(SESSION_COOKIE)
    record, principal = await request.app.state.services.sessions.authenticate_cookie(raw)
    return raw, record, principal


async def require_csrf(request: Request, session_record, *, actor_admin_id: str | None = None) -> None:
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return
    origin = request.headers.get("origin")
    if origin not in frozenset(request.app.state.settings.admin_origins):
        await request.app.state.services.audit.append(
            "SEC.CSRF.REJECT",
            actor_admin_id=actor_admin_id,
            site_id=None,
            details={"reason": "ORIGIN"},
        )
        raise Denied("origin rejected")
    token = request.headers.get("x-csrf-token")
    if not token or len(token) > 512 or not hmac.compare_digest(token_hash(token), session_record.csrf_secret_hash):
        await request.app.state.services.audit.append(
            "SEC.CSRF.REJECT",
            actor_admin_id=actor_admin_id,
            site_id=None,
            details={"reason": "TOKEN"},
        )
        raise Denied("csrf rejected")


def set_session_cookies(response, *, session_id: str, csrf: str):
    response.set_cookie(
        SESSION_COOKIE,
        session_id,
        secure=True,
        httponly=True,
        samesite="lax",
        path="/",
    )
    # Browser-readable companion transports the session-bound CSRF proof only.
    # It is never an authentication bearer and is still checked with exact Origin.
    response.set_cookie(
        CSRF_COOKIE,
        csrf,
        secure=True,
        httponly=False,
        samesite="lax",
        path="/",
    )


def clear_session_cookies(response):
    response.delete_cookie(SESSION_COOKIE, path="/", secure=True, httponly=True, samesite="lax")
    response.delete_cookie(CSRF_COOKIE, path="/", secure=True, httponly=False, samesite="lax")


def set_preview_cookie(response, *, preview_session: str, max_age: int = 600):
    response.set_cookie(
        PREVIEW_COOKIE,
        preview_session,
        secure=True,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=max_age,
    )


def clear_preview_cookie(response):
    response.delete_cookie(PREVIEW_COOKIE, path="/", secure=True, httponly=True, samesite="lax")
