from __future__ import annotations

from dataclasses import replace

from bp_domain.context import SiteRecord
from bp_domain.security import AccountState, AdminPrincipal, Unavailable

SITE_KEYS = tuple(f"SITE-{index:02d}" for index in range(1, 15))


class FakeSites:
    def __init__(self):
        domains = (
            "whatsyourrashi.in",
            "apkirashi.com",
            "dailyrashi360.com",
            "zodiacdaily.com",
            "dailyhoroscope360.com",
            "myhoroscope360.com",
            "astrotoday360.com",
            "apkikundli.com",
            "matchyourkundli.com",
            "apkanakshatra.com",
            "janiyepanchang.com",
            "rashiremedies.com",
            "apkapandit.com",
            "vastushastra360.com",
        )
        self.by_host = {
            domain: SiteRecord(f"site-uuid-{index:02d}", f"SITE-{index:02d}", domain, "ACTIVE", "Asia/Kolkata")
            for index, domain in enumerate(domains, start=1)
        }
        self.by_key = {site.site_key: site for site in self.by_host.values()}
        self.by_id = {site.site_id: site for site in self.by_host.values()}

    async def resolve_host(self, host):
        return self.by_host.get(host)

    async def get_site_by_key(self, key):
        return self.by_key.get(key)

    async def get_site_by_id(self, site_id):
        return self.by_id.get(site_id)

    async def list_sites(self):
        return list(self.by_key.values())


class FakeIdentities:
    def __init__(self, principal, verifier):
        self.principal = principal
        self.verifier = verifier

    async def get_principal(self, admin_id):
        return self.principal if self.principal.admin_id == admin_id else None

    async def find_principal_by_email(self, email):
        return self.principal if self.principal.email == email else None

    async def credential_verifier(self, admin_id):
        return self.verifier if admin_id == self.principal.admin_id else None

    async def set_credential_verifier(self, admin_id, verifier):
        self.verifier = verifier

    async def activate_invited_admin(self, admin_id):
        self.principal = replace(self.principal, state=AccountState.ACTIVE)


class FakeAudit:
    def __init__(self):
        self.events = []

    async def append(self, event_code, **kw):
        self.events.append((event_code, kw))


class FakePublic:
    async def resolve_page(self, context, **kw):
        return 404, {"page_id": "PUB-SYS-404-01", "site": {"site_key": context.site_key}}, {}

    async def resolve_preview(self, context, *, post_id, source_snapshot):
        return {"page_id": "PUB-SYS-PREVIEW-01", "post_id": post_id, "source_snapshot": source_snapshot}


class FakeGlobals:
    def __init__(self):
        self.calls = []

    async def execute(self, operation_id, **kw):
        self.calls.append((operation_id, kw))
        if operation_id == "API15-G-001":
            principal = kw["principal"]
            return 200, {"effective_permissions": sorted(principal.global_permissions)}, {}
        if operation_id == "API15-G-002":
            return 200, {
                "site_count": len(SITE_KEYS),
                "aggregates": [],
                "site_summaries": [
                    {
                        "site_key": site_key,
                        "display_name": site_key,
                        "lifecycle_state": "ACTIVE",
                        "counts": [],
                    }
                    for site_key in SITE_KEYS
                ],
            }, {}
        raise Unavailable("fake operation not bound")

    async def compensate_created_admin(self, admin_id):
        self.calls.append(("COMPENSATE_CREATED_ADMIN", {"admin_id": admin_id}))


class SiteContextPayload:
    async def build(self, principal, context):
        effective = principal.site_permissions.get(context.site_key, frozenset())
        return {
            "site_key": context.site_key,
            "display_name": context.site_key,
            "lifecycle_state": context.site_status,
            "effective_permissions": sorted(effective),
        }
