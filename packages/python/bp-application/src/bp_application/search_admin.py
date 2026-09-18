from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from bp_domain.context import SiteContext
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.security import AdminPrincipal
from bp_ports import AdminSearchPort, DownstreamEffectsPort, RedisControlPort


@dataclass(slots=True)
class SearchAdminService:
    repository: AdminSearchPort
    control: RedisControlPort
    effects: DownstreamEffectsPort

    async def posts(self, context: SiteContext, principal: AdminPrincipal, query: dict[str, Any]) -> dict[str, Any]:
        page = int(query.get("page", 1)); page_size = int(query.get("page_size", 50))
        # DOC-16 section 25: search.view permits the search surface, but does not
        # grant visibility to Post content.  Preserve DOC-15's transport permission
        # mapping and fail closed at the candidate boundary when posts.view is absent.
        can_view_posts = principal.is_super_admin or "posts.view" in principal.site_permissions.get(context.site_key, frozenset())
        if not can_view_posts:
            return {"items": [], "page": {"page": page, "page_size": page_size, "has_more": False}}
        items, has_more = await self.repository.search_posts(context, principal=principal, q=str(query.get("q") or ""), status=query.get("status"), page=page, page_size=page_size)
        return {"items": items, "page": {"page": page, "page_size": page_size, "has_more": has_more}}

    async def internal_links(self, context: SiteContext, principal: AdminPrincipal, query: dict[str, Any]) -> dict[str, Any]:
        page = int(query.get("page", 1)); page_size = int(query.get("page_size", 50))
        items, has_more = await self.repository.internal_links(context, principal=principal, q=str(query.get("q") or ""), page=page, page_size=page_size)
        return {"items": items, "page": {"page": page, "page_size": page_size, "has_more": has_more}}

    async def related(self, context: SiteContext, principal: AdminPrincipal, query: dict[str, Any]) -> dict[str, Any]:
        page = int(query.get("page", 1)); page_size = int(query.get("page_size", 50))
        items, has_more = await self.repository.related_posts(context, principal=principal, post_id=query.get("post_id"), q=query.get("q"), page=page, page_size=page_size)
        return {"items": items, "page": {"page": page, "page_size": page_size, "has_more": has_more}}

    async def status(self, context: SiteContext) -> dict[str, Any]:
        state = await self.control.get_search_status(context.site_id)
        if state is None:
            return {"state": "DEGRADED", "message": "SEARCH_STATUS_UNKNOWN"}
        response = {"state": state["state"]}
        if state.get("last_indexed_at"):
            response["last_indexed_at"] = state["last_indexed_at"]
        if state.get("message_code"):
            response["message"] = state["message_code"]
        return response

    async def request_reindex(self, context: SiteContext, body: dict[str, Any]) -> dict[str, Any]:
        request_id = str(uuid4())
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="SEARCH_REINDEX_REQUESTED", context=context, entity_type="SITE", entity_id=context.site_id,
            correlation_id=context.request_id, payload={"request_id": request_id, "reason": body.get("reason")},
        ))
        return {"accepted": True, "request_id": request_id}
