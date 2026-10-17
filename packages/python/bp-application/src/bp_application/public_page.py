from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bp_domain.context import ContextKind, SiteContext
from bp_domain.errors import ValidationFault
from bp_ports import PublicPagePort


@dataclass(slots=True)
class PublicPageService:
    """CHAT03 public PageData orchestration guard around downstream projections.

    Route/data/content/search/SEO specialists remain behind the supplied
    backend port. This service prevents a projection backend from being called
    with the wrong trusted context class or from returning a non-contractual
    public routing status.
    """

    backend: PublicPagePort

    async def resolve_page(
        self,
        context: SiteContext,
        *,
        path: str,
        q: str | None,
        page: int,
        page_size: int,
    ) -> tuple[int, dict[str, Any], dict[str, str]]:
        if context.kind is not ContextKind.PUBLIC_SITE:
            raise ValidationFault("public site context required")
        result = await self.backend.resolve_page(
            context,
            path=path,
            q=q,
            page=page,
            page_size=page_size,
        )
        if result[0] not in {200, 301, 302, 308, 404, 410}:
            raise RuntimeError("public projection returned a status outside API15-PUB-001")
        return result

    async def resolve_preview(
        self, context: SiteContext, *, post_id: str, source_snapshot: str
    ) -> dict[str, Any]:
        if context.kind is not ContextKind.PREVIEW_SITE:
            raise ValidationFault("preview site context required")
        if not source_snapshot:
            raise ValidationFault("preview source snapshot required")
        return await self.backend.resolve_preview(
            context, post_id=post_id, source_snapshot=source_snapshot
        )

    async def resolve_website_preview(self, context: SiteContext, **query: Any):
        # Called only after a session-bound website grant has been validated.
        # Reuse public eligibility: no draft posts or disabled information pages.
        if context.kind is not ContextKind.PREVIEW_SITE:
            raise ValidationFault("preview site context required")
        return await self.backend.resolve_page(context, **query)
