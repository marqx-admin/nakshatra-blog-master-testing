from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from bp_adapters.mail import RecordingMailAdapter
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.security_store import InMemorySecurityStateStore
from bp_application import AuthService, GlobalPlatformService, PasswordCodec, PasswordPolicy, PublicPageService, SetWeakPasswordChecker
from bp_application.security import token_hash
from bp_domain.context import ContextKind, ContextSource, GlobalContext, SiteContext
from bp_domain.security import AccountState, AdminPrincipal, CredentialRecord, ValidationFault
from tests.fixtures.chat03_fakes import FakeAudit

PASSWORD = "correct horse battery staple"


class MultiIdentities:
    def __init__(self, principals):
        self.principals = {p.admin_id: p for p in principals}
    async def get_principal(self, admin_id): return self.principals.get(admin_id)
    async def find_principal_by_email(self, email):
        return next((p for p in self.principals.values() if p.email.strip().lower() == email), None)
    async def credential_verifier(self, admin_id): return None
    async def set_credential_verifier(self, admin_id, verifier): return None
    async def activate_invited_admin(self, admin_id): self.principals[admin_id] = replace(self.principals[admin_id], state=AccountState.ACTIVE)


class Backend:
    def __init__(self, target): self.target = target; self.calls = []
    async def execute(self, operation_id, **kwargs):
        self.calls.append((operation_id, kwargs))
        if operation_id == "API15-G-031":
            now = datetime.now(UTC).isoformat()
            return 201, {"admin_user": {"admin_user_id": self.target.admin_id, "email": self.target.email, "state": "INVITED", "site_assignments": [], "role_assignments": [], "created_at": now, "updated_at": now}}, {}
        if operation_id == "API15-G-032":
            now = datetime.now(UTC).isoformat()
            return 200, {"admin_user": {"admin_user_id": self.target.admin_id, "email": self.target.email, "state": "ACTIVE", "site_assignments": [], "role_assignments": [], "created_at": now, "updated_at": now}}, {}
        if operation_id == "API15-G-035":
            return 200, {"ok": True}, {}
        return 200, {}, {}
    async def compensate_created_admin(self, admin_id):
        self.calls.append(("COMPENSATE_CREATED_ADMIN", {"admin_id": admin_id}))


async def build_auth(actor, target):
    identities = MultiIdentities([actor, target])
    state = InMemorySecurityStateStore()
    audit = FakeAudit()
    mail = RecordingMailAdapter()
    codec = PasswordCodec()
    verifier = codec.hash(PASSWORD)
    await state.put_credential(CredentialRecord(actor.admin_id, verifier, "argon2id", {}, datetime.now(UTC)))
    auth = AuthService(identities, state, LocalEnvelopeSecretProvider(), audit, mail, PasswordPolicy(SetWeakPasswordChecker(set())), codec)
    return auth, state, audit, mail


def global_context():
    return GlobalContext(ContextKind.GLOBAL, ContextSource.GLOBAL_AUTHORITY, "req", datetime.now(UTC))


@pytest.mark.asyncio
async def test_global_direct_create_provisions_hashed_login_without_invitation():
    actor = AdminPrincipal("actor", "actor@test", AccountState.ACTIVE, global_permissions=frozenset({"admin_users.view", "admin_users.invite"}))
    target = AdminPrincipal("target", "target@test", AccountState.INVITED)
    auth, state, _, mail = await build_auth(actor, target)
    backend = Backend(target)
    service = GlobalPlatformService(backend, auth, "https://admin.test/setup")

    status, payload, _ = await service.execute("API15-G-031", principal=actor, context=global_context(), path_params={}, query={}, body={"email": target.email, "password": PASSWORD}, headers={})
    assert status == 201 and payload["admin_user"]["state"] == "ACTIVE"
    assert len(mail.messages) == 0
    assert (await state.get_credential("target")) is not None


@pytest.mark.asyncio
async def test_global_account_disable_revokes_target_security_state():
    actor = AdminPrincipal("actor", "actor@test", AccountState.ACTIVE, global_permissions=frozenset({"admin_users.view", "admin_users.disable"}))
    target = AdminPrincipal("target", "target@test", AccountState.ACTIVE)
    auth, state, _, _ = await build_auth(actor, target)
    raw, _, _ = await auth._issue_session(target, mfa_verified=False)
    backend = Backend(target)
    service = GlobalPlatformService(backend, auth, "https://admin.test/setup")

    await service.execute("API15-G-035", principal=actor, context=global_context(), path_params={"admin_user_id": "target"}, query={}, body={}, headers={})
    assert (await state.get_session(token_hash(raw))).revoked_at is not None


class PublicBackend:
    def __init__(self): self.calls = []
    async def resolve_page(self, context, **kwargs): self.calls.append(("page", context, kwargs)); return 200, {"ok": True}, {}
    async def resolve_preview(self, context, *, post_id, source_snapshot): self.calls.append(("preview", context, post_id, source_snapshot)); return {"ok": True}


def site_context(kind):
    return SiteContext(kind, "site", "SITE-01", "ACTIVE", "example.test", ContextSource.PUBLIC_HOST if kind is ContextKind.PUBLIC_SITE else ContextSource.PREVIEW, "req", request_host="example.test")


@pytest.mark.asyncio
async def test_public_application_service_enforces_context_class_before_projection_backend():
    backend = PublicBackend()
    service = PublicPageService(backend)
    await service.resolve_page(site_context(ContextKind.PUBLIC_SITE), path="/", q=None, page=1, page_size=20)
    await service.resolve_preview(site_context(ContextKind.PREVIEW_SITE), post_id="p", source_snapshot="COMMITTED:1")
    with pytest.raises(ValidationFault):
        await service.resolve_page(site_context(ContextKind.PREVIEW_SITE), path="/", q=None, page=1, page_size=20)
    with pytest.raises(ValidationFault):
        await service.resolve_preview(site_context(ContextKind.PUBLIC_SITE), post_id="p", source_snapshot="COMMITTED:1")
    assert len(backend.calls) == 2
