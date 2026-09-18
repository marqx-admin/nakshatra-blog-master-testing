from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bp_domain.errors import NotFound, Unavailable
from bp_ports import DerivedSiteOperationsPort
from .media import MediaService
from .redirects import RedirectService
from .search_admin import SearchAdminService
from .seo import SeoAdminService


@dataclass(slots=True)
class DerivedSiteOperationsService(DerivedSiteOperationsPort):
    media: MediaService
    seo: SeoAdminService
    redirects: RedirectService
    search: SearchAdminService

    async def execute(self, operation_id: str, *, principal: Any, context, path_params: dict[str, Any], query: dict[str, Any], body: Any, headers: dict[str, str]):
        if operation_id == "API15-S-060": return 200, await self.media.list(context, query), {}
        if operation_id == "API15-S-061": return 201, await self.media.upload(context, body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-062": return 200, await self.media.get(context, path_params["media_id"]), {}
        if operation_id == "API15-S-063": return 200, await self.media.update_metadata(context, path_params["media_id"], body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-064": return 200, await self.media.replace(context, path_params["media_id"], body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-065":
            await self.media.delete(context, path_params["media_id"], actor_admin_id=principal.admin_id); return 204, None, {}
        if operation_id == "API15-S-066": return 200, await self.media.usage(context, path_params["media_id"]), {}
        if operation_id == "API15-S-080": return 200, await self.seo.get(context), {}
        if operation_id == "API15-S-081": return 200, await self.seo.update(context, body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-082": return 200, await self.redirects.list(context, query), {}
        if operation_id == "API15-S-083": return 201, await self.redirects.create(context, body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-084": return 200, await self.redirects.get(context, path_params["redirect_id"]), {}
        if operation_id == "API15-S-085": return 200, await self.redirects.update(context, path_params["redirect_id"], body or {}, actor_admin_id=principal.admin_id), {}
        if operation_id == "API15-S-086":
            await self.redirects.delete(context, path_params["redirect_id"], actor_admin_id=principal.admin_id); return 204, None, {}
        if operation_id == "API15-S-090": return 200, await self.search.posts(context, principal, query), {}
        if operation_id == "API15-S-091": return 200, await self.search.internal_links(context, principal, query), {}
        if operation_id == "API15-S-092": return 200, await self.search.related(context, principal, query), {}
        if operation_id == "API15-S-093": return 200, await self.search.status(context), {}
        if operation_id == "API15-S-094": return 202, await self.search.request_reindex(context, body or {}), {}
        raise NotFound("unsupported CHAT05 operation")
