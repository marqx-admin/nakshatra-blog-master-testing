from __future__ import annotations

from dataclasses import dataclass

from bp_application import AuthService, AuthorizationService, SessionAuthority, TrustedContextService
from bp_ports import (
    AdminSiteContextPayloadPort,
    SiteDashboardPayloadPort,
    AuditPort,
    DerivedSiteOperationsPort,
    GlobalOperationsPort,
    PreviewAuthorityPort,
    PublicPagePort,
    LifecyclePort,
    ReadinessPort,
    SecurityAbusePort,
    SecurityThrottlePort,
)


@dataclass(slots=True)
class Services:
    contexts: TrustedContextService
    authorization: AuthorizationService
    sessions: SessionAuthority
    auth: AuthService
    public_pages: PublicPagePort
    global_operations: GlobalOperationsPort
    audit: AuditPort
    # CHAT05 SITE-derived HTTP service. It remains optional until concrete
    # persistence/provider composition is supplied by the integrated runtime.
    derived_operations: DerivedSiteOperationsPort | None = None
    preview_authority: PreviewAuthorityPort | None = None
    site_context_payload: AdminSiteContextPayloadPort | None = None
    site_dashboard_payload: SiteDashboardPayloadPort | None = None
    transport_throttle: SecurityThrottlePort | None = None
    security_abuse: SecurityAbusePort | None = None
    lifecycle: tuple[LifecyclePort, ...] = ()
    readiness: ReadinessPort | None = None
    # CHAT00 integration slot for the CHAT04 SITE editorial transport.
    # The concrete type remains in bp_api.http.site to avoid moving specialist
    # business ownership into CHAT03 composition.
    editorial_transport: object | None = None
    # Self-hosted private-origin media gateway. Managed-CDN compositions leave
    # this unset because their delivery tier owns /m/*.
    media_delivery: object | None = None
