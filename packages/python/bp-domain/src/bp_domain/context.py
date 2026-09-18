from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class ContextKind(StrEnum):
    PUBLIC_SITE = "CTX-PUBLIC-SITE"
    ADMIN_SITE = "CTX-ADMIN-SITE"
    WORKER_SITE = "CTX-WORKER-SITE"
    GLOBAL = "CTX-GLOBAL"
    PREVIEW_SITE = "CTX-PREVIEW-SITE"


class ContextSource(StrEnum):
    PUBLIC_HOST = "PUBLIC_HOST"
    ADMIN_SELECTION = "ADMIN_SELECTION"
    WORKER_PAYLOAD = "WORKER_PAYLOAD"
    GLOBAL_AUTHORITY = "GLOBAL_AUTHORITY"
    PREVIEW = "PREVIEW"


@dataclass(frozen=True, slots=True)
class SiteContext:
    kind: ContextKind
    site_id: str
    site_key: str
    site_status: str
    canonical_domain: str
    context_source: ContextSource
    request_id: str
    request_host: str | None = None
    timezone: str | None = None
    locale: str | None = None
    resolved_at: datetime | None = None
    version_marker: str | None = None
    display_name: str | None = None

    def __post_init__(self) -> None:
        if self.kind not in {
            ContextKind.PUBLIC_SITE,
            ContextKind.ADMIN_SITE,
            ContextKind.WORKER_SITE,
            ContextKind.PREVIEW_SITE,
        }:
            raise ValueError("SiteContext cannot represent GLOBAL scope")
        if not self.site_id or not self.site_key or not self.canonical_domain:
            raise ValueError("site-owned context requires one resolved site")
        if not self.request_id:
            raise ValueError("site-owned context requires request correlation")
        if self.kind in {ContextKind.PUBLIC_SITE, ContextKind.PREVIEW_SITE} and not self.request_host:
            raise ValueError("public and preview contexts require resolved request host")

    @property
    def canonical_host(self) -> str:
        return self.canonical_domain


@dataclass(frozen=True, slots=True)
class GlobalContext:
    kind: ContextKind
    context_source: ContextSource
    request_id: str
    resolved_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.kind is not ContextKind.GLOBAL:
            raise ValueError("GlobalContext must be CTX-GLOBAL")
        if not self.request_id:
            raise ValueError("GLOBAL context requires request correlation")


@dataclass(frozen=True, slots=True)
class RequestContext:
    request_id: str
    operation_id: str | None = None
    site: SiteContext | None = None
    global_scope: GlobalContext | None = None

    def __post_init__(self) -> None:
        if not self.request_id:
            raise ValueError("request_id is required")
        if self.site is not None and self.global_scope is not None:
            raise ValueError("request cannot be site-scoped and GLOBAL simultaneously")


@dataclass(frozen=True, slots=True)
class SiteRecord:
    site_id: str
    site_key: str
    canonical_domain: str
    lifecycle: str = "ACTIVE"
    timezone: str | None = None
    locale: str | None = None
    version_marker: str | None = None
    display_name: str | None = None

    @property
    def canonical_host(self) -> str:
        return self.canonical_domain

    @property
    def public_eligible(self) -> bool:
        return self.lifecycle == "ACTIVE"

    @property
    def ordinary_admin_eligible(self) -> bool:
        return self.lifecycle == "ACTIVE"
