from __future__ import annotations

from datetime import UTC, datetime
import asyncio

import uvicorn

from bp_adapters.mail import RecordingMailAdapter
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.security_store import InMemorySecurityStateStore
from bp_application import (
    AuthService,
    AuthorizationService,
    PasswordCodec,
    PasswordPolicy,
    SessionAuthority,
    SetWeakPasswordChecker,
    TrustedContextService,
)
from bp_api.app import create_app
from bp_api.composition import Services
from bp_api.config import Settings
from bp_domain.security import AccountState, AdminPrincipal, CredentialRecord
from tests.fixtures.chat03_fakes import (
    FakeAudit,
    FakeGlobals,
    FakeIdentities,
    FakePublic,
    FakeSites,
    SITE_KEYS,
    SiteContextPayload,
)


class DashboardPayload:
    async def build(self, principal, context):
        return {"metrics": [{"key": "posts", "label": "Posts", "value": 0}], "attention_items": []}


def build_app():
    password = "correct horse battery staple"
    codec = PasswordCodec()
    principal = AdminPrincipal(
        "admin-1",
        "admin@example.test",
        AccountState.ACTIVE,
        False,
        False,
        frozenset({"network_dashboard.view", "sites.view"}),
        {site_key: frozenset({"posts.view", "dashboard.view"}) for site_key in SITE_KEYS},
    )
    identities = FakeIdentities(principal, codec.hash(password))
    state = InMemorySecurityStateStore()
    asyncio.run(
        state.put_credential(
            CredentialRecord(
                "admin-1",
                identities.verifier,
                "argon2id",
                {
                    "memory_kib": 65536,
                    "iterations": 3,
                    "parallelism": 1,
                    "salt_bytes": 16,
                    "hash_bytes": 32,
                },
                datetime.now(UTC),
            )
        )
    )
    audit = FakeAudit()
    auth = AuthService(
        identities,
        state,
        LocalEnvelopeSecretProvider(),
        audit,
        RecordingMailAdapter(),
        PasswordPolicy(SetWeakPasswordChecker({"password12345"})),
        codec,
    )
    services = Services(
        TrustedContextService(FakeSites()),
        AuthorizationService(identities),
        SessionAuthority(state, identities),
        auth,
        FakePublic(),
        FakeGlobals(),
        audit,
        site_context_payload=SiteContextPayload(),
        site_dashboard_payload=DashboardPayload(),
    )
    settings = Settings(
        "development",
        "contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml",
        ("http://localhost:5001",),
        "https://admin.test/reset",
        False,
    )
    return create_app(settings=settings, services=services)


if __name__ == "__main__":
    uvicorn.run(build_app(), host="0.0.0.0", port=8000, log_level="warning")
