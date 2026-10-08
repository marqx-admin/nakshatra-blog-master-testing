from __future__ import annotations

from dataclasses import dataclass

from bp_domain.context import SiteContext
from bp_domain.seo import robots_txt
from bp_ports import CrawlerResourcePort, SeoRepositoryPort, SitemapArtifactPort


@dataclass(slots=True)
class SeoCrawlerResourceService(CrawlerResourcePort):
    """Backend-side DOC-16 crawler resource integration for public frontends.

    The shared API serves these resources only after Host resolves a trusted site.
    """

    seo_repository: SeoRepositoryPort
    sitemaps: SitemapArtifactPort
    temporary_domain_suffix: str | None = None

    def _temporary(self, context: SiteContext) -> bool:
        suffix = (self.temporary_domain_suffix or "").lower().rstrip(".")
        return bool(suffix and context.request_host == f"{context.site_key.lower()}.{suffix}")

    async def robots(self, context: SiteContext) -> tuple[int, bytes, str]:
        settings = await self.seo_repository.get_site_seo(context)
        body = robots_txt(
            site_status=context.site_status,
            index_policy="NOINDEX"
            if self._temporary(context)
            else str(settings.get("index_policy") or "INHERIT"),
            canonical_domain=context.canonical_domain,
        )
        if body is None:
            return 404, b"", "text/plain; charset=utf-8"
        return 200, body.encode("utf-8"), "text/plain; charset=utf-8"

    async def sitemap(self, context: SiteContext, path: str) -> tuple[int, bytes, str]:
        if path != "/sitemap.xml" and not (path.startswith("/sitemaps/") and path.endswith(".xml")):
            return 404, b"", "application/xml; charset=utf-8"
        if context.site_status != "ACTIVE" or self._temporary(context):
            return 404, b"", "application/xml; charset=utf-8"
        payload = await self.sitemaps.get_active_resource(context.site_id, path)
        if payload is None:
            return 404, b"", "application/xml; charset=utf-8"
        return 200, payload, "application/xml; charset=utf-8"
