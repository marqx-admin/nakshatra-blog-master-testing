"""Private whole-site navigation; deliberately separate from post preview grants."""
from dataclasses import dataclass
from datetime import datetime, timedelta

from bp_domain.context import SiteContext
from bp_domain.errors import Unauthenticated
from bp_domain.security import SessionRecord, TokenRecord
from bp_ports import SecurityStateStorePort

from .authorization import AuthorizationService
from .security import SessionAuthority, new_secret_token, now_utc, token_hash

WEBSITE_PREVIEW_COOKIE = "__Host-bp_website_preview"
PREVIEW_PERMISSIONS = {"site_settings.view", "posts.view", "navigation.view", "media.view"}


@dataclass(slots=True)
class WebsitePreviewAuthority:
    state: SecurityStateStorePort
    sessions: SessionAuthority
    authorization: AuthorizationService

    async def _parent(self, context: SiteContext, session_hash: str) -> SessionRecord:
        session = await self.state.get_session(session_hash)
        now = now_utc()
        if session is None or session.revoked_at or now >= min(session.idle_expires_at, session.absolute_expires_at):
            raise Unauthenticated("website preview requires an active Admin session")
        principal = await self.authorization.fresh_principal(session.admin_id)
        self.authorization.require_site(principal, context.site_key, PREVIEW_PERMISSIONS)
        return session

    async def issue(self, context: SiteContext, session: SessionRecord) -> tuple[str, datetime]:
        await self._parent(context, session.session_id_hash)
        now = now_utc()
        expires = min(now + timedelta(seconds=60), session.idle_expires_at, session.absolute_expires_at)
        raw = new_secret_token()
        await self.state.put_token(TokenRecord(
            token_hash(raw), session.admin_id, "WEBSITE_PREVIEW_HANDOFF", expires,
            issued_at=now, site_id=context.site_id,
            metadata={"session_hash":session.session_id_hash},
        ))
        return raw, expires

    async def exchange(self, context: SiteContext, handoff: str) -> tuple[str, SessionRecord]:
        now = now_utc()
        record = await self.state.get_token(token_hash(handoff), "WEBSITE_PREVIEW_HANDOFF", now)
        if record is None or record.site_id != context.site_id:
            raise Unauthenticated("website preview denied")
        parent = await self._parent(context, record.metadata["session_hash"])
        if await self.state.consume_token(token_hash(handoff), "WEBSITE_PREVIEW_HANDOFF", now) is None:
            raise Unauthenticated("website preview denied")
        raw = new_secret_token()
        await self.state.put_token(TokenRecord(
            token_hash(raw), parent.admin_id, "WEBSITE_PREVIEW_SESSION",
            min(now + timedelta(minutes=15), parent.idle_expires_at, parent.absolute_expires_at),
            issued_at=now, site_id=context.site_id,
            metadata={"session_hash":parent.session_id_hash, "host":context.request_host or ""},
        ))
        return raw, parent

    async def validate(self, context: SiteContext, raw: str) -> SessionRecord:
        record = await self.state.get_token(token_hash(raw), "WEBSITE_PREVIEW_SESSION", now_utc())
        if record is None or record.site_id != context.site_id or record.metadata.get("host") != context.request_host:
            raise Unauthenticated("website preview denied")
        return await self._parent(context, record.metadata["session_hash"])
