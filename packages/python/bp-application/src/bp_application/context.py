from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import UTC, datetime

from bp_domain.context import ContextKind, ContextSource, GlobalContext, SiteContext, SiteRecord
from bp_domain.security import AccountState, AdminPrincipal, Denied, NotFound, Unauthenticated
from bp_ports import SiteRegistryPort

_LABEL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")


def normalize_host(raw: str) -> str:
    """DOC-09 host normalization for a parsed effective Host value.

    The function accepts an optional numeric network port because ASGI request
    hosts may include one after HTTP parsing. It rejects URL syntax, whitespace,
    user-info, paths, queries, fragments, control characters, and malformed DNS
    labels. Unicode input is converted to the IDNA ASCII A-label form.
    """

    if not isinstance(raw, str) or not raw:
        raise NotFound("resource not found")
    if any(ord(ch) < 32 or ord(ch) == 127 for ch in raw) or "\x00" in raw:
        raise NotFound("resource not found")
    if raw != raw.strip() or any(ch.isspace() for ch in raw):
        raise NotFound("resource not found")
    if any(token in raw for token in ("/", "?", "#", "@")) or "://" in raw:
        raise NotFound("resource not found")

    host = raw
    if host.count(":") == 1:
        name, port = host.rsplit(":", 1)
        if port.isdigit() and name:
            host = name
        elif ":" in host:
            raise NotFound("resource not found")
    elif ":" in host:
        # Address literals are not production public identities in the v1 registry.
        raise NotFound("resource not found")

    if host.endswith("."):
        host = host[:-1]
    if not host:
        raise NotFound("resource not found")
    try:
        host = host.encode("idna").decode("ascii").lower()
    except UnicodeError as exc:
        raise NotFound("resource not found") from exc

    try:
        encoded = host.encode("ascii")
    except UnicodeError as exc:
        raise NotFound("resource not found") from exc
    if len(encoded) > 253:
        raise NotFound("resource not found")
    labels = host.split(".")
    if any(not (1 <= len(label.encode("ascii")) <= 63 and _LABEL_RE.fullmatch(label)) for label in labels):
        raise NotFound("resource not found")
    return host


def _site_context(
    site: SiteRecord,
    *,
    kind: ContextKind,
    source: ContextSource,
    request_id: str,
    request_host: str | None = None,
) -> SiteContext:
    return SiteContext(
        kind=kind,
        site_id=site.site_id,
        site_key=site.site_key,
        site_status=site.lifecycle,
        canonical_domain=site.canonical_domain,
        context_source=source,
        request_id=request_id,
        request_host=request_host,
        timezone=site.timezone,
        locale=site.locale,
        resolved_at=datetime.now(UTC),
        version_marker=site.version_marker,
        display_name=site.display_name,
    )


@dataclass(slots=True)
class TrustedContextService:
    sites: SiteRegistryPort

    async def public(self, effective_host: str, *, request_id: str) -> SiteContext:
        host = normalize_host(effective_host)
        site = await self.sites.resolve_host(host)
        if site is None or not site.public_eligible:
            raise NotFound("resource not found")
        return _site_context(
            site,
            kind=ContextKind.PUBLIC_SITE,
            source=ContextSource.PUBLIC_HOST,
            request_id=request_id,
            request_host=host,
        )

    async def preview(self, effective_host: str, *, request_id: str) -> SiteContext:
        host = normalize_host(effective_host)
        site = await self.sites.resolve_host(host)
        if site is None or not site.public_eligible:
            raise NotFound("resource not found")
        # Preview context remains host-bound and resource authority is validated
        # separately by the PreviewAuthorityPort before PageData is loaded.
        return _site_context(
            site,
            kind=ContextKind.PREVIEW_SITE,
            source=ContextSource.PREVIEW,
            request_id=request_id,
            request_host=host,
        )

    async def admin_site(
        self,
        site_key: str,
        *,
        principal: AdminPrincipal,
        request_id: str,
    ) -> SiteContext:
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        site = await self.sites.get_site_by_key(site_key)
        # Unknown, inactive, and unassigned site keys share a safe non-disclosing
        # result for ordinary site-scoped Admin execution.
        if site is None or not site.ordinary_admin_eligible:
            raise NotFound("resource not found")
        if not principal.is_super_admin and site_key not in principal.site_permissions:
            raise NotFound("resource not found")
        return _site_context(
            site,
            kind=ContextKind.ADMIN_SITE,
            source=ContextSource.ADMIN_SELECTION,
            request_id=request_id,
        )

    async def selectable_sites(self, *, principal: AdminPrincipal) -> list[SiteRecord]:
        """Return only ACTIVE Sites the authenticated Admin may legitimately attempt to enter.

        This is a projection for the existing Active Website selector, never an
        authorization grant. Every subsequent SITE operation still resolves and
        authorizes its own CTX-ADMIN-SITE.
        """
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        if principal.is_super_admin:
            candidates = await self.sites.list_sites()
        else:
            candidates = []
            for site_key in sorted(principal.site_permissions):
                site = await self.sites.get_site_by_key(site_key)
                if site is not None:
                    candidates.append(site)
        return sorted(
            (site for site in candidates if site.ordinary_admin_eligible),
            key=lambda site: site.site_key,
        )

    def global_context(self, *, principal: AdminPrincipal, request_id: str) -> GlobalContext:
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        if not principal.is_super_admin and not principal.global_permissions:
            raise Denied("global authority required")
        return GlobalContext(
            kind=ContextKind.GLOBAL,
            context_source=ContextSource.GLOBAL_AUTHORITY,
            request_id=request_id,
            resolved_at=datetime.now(UTC),
        )
