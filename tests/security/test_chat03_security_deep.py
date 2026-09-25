from __future__ import annotations

import base64
from dataclasses import replace
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qs, urlsplit

import pytest

from bp_adapters.mail import RecordingMailAdapter
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.security_store import InMemorySecurityStateStore
from bp_application import AuthService, PasswordCodec, PasswordPolicy, SessionAuthority, SetWeakPasswordChecker, TrustedContextService
from bp_application.security import PreviewAuthorityService, now_utc, token_hash, totp
from bp_domain.security import (
    AccountState,
    AdminPrincipal,
    CredentialRecord,
    Denied,
    MfaRecord,
    SessionRecord,
    StepUpLevel,
    StepUpRecord,
    Unauthenticated,
    ValidationFault,
)
from tests.fixtures.chat03_fakes import FakeAudit, FakeIdentities, FakeSites

PASSWORD = "correct horse battery staple"
NEW_PASSWORD = "a much newer secure passphrase"


def _decode_b32(value: str) -> bytes:
    return base64.b32decode(value + "=" * ((8 - len(value) % 8) % 8))


def _mail_token(mail: RecordingMailAdapter) -> str:
    url = mail.messages[-1][2]
    return parse_qs(urlsplit(url).query)["token"][0]


async def _service(principal: AdminPrincipal, *, password: str = PASSWORD):
    codec = PasswordCodec()
    verifier = codec.hash(password)
    identities = FakeIdentities(principal, verifier)
    state = InMemorySecurityStateStore()
    await state.put_credential(
        CredentialRecord(
            admin_id=principal.admin_id,
            password_verifier=verifier,
            algorithm="argon2id",
            params={
                "memory_kib": 65536,
                "iterations": 3,
                "parallelism": 1,
                "salt_bytes": 16,
                "hash_bytes": 32,
            },
            changed_at=now_utc(),
        )
    )
    audit = FakeAudit()
    mail = RecordingMailAdapter()
    secrets_provider = LocalEnvelopeSecretProvider()
    auth = AuthService(
        identities,
        state,
        secrets_provider,
        audit,
        mail,
        PasswordPolicy(SetWeakPasswordChecker({"password12345"})),
        codec,
    )
    return auth, identities, state, audit, mail, secrets_provider


def _principal(*, state: AccountState = AccountState.ACTIVE, super_admin: bool = False) -> AdminPrincipal:
    return AdminPrincipal(
        "admin-1",
        "admin@example.test",
        state,
        super_admin,
        False,
        frozenset({"sites.view", "admin_users.view", "admin_users.invite"}),
        {"SITE-01": frozenset({"posts.view"})},
    )


def test_password_policy_exact_v1_boundaries():
    policy = PasswordPolicy(SetWeakPasswordChecker({"password12345"}))
    policy.validate("twelve chars!", email="admin@example.test")
    with pytest.raises(ValidationFault):
        policy.validate("short")
    with pytest.raises(ValidationFault):
        policy.validate("a" * 129)
    with pytest.raises(ValidationFault):
        policy.validate("x" * 11 + "\x00")
    with pytest.raises(ValidationFault):
        policy.validate("password12345")
    with pytest.raises(ValidationFault):
        policy.validate("admin@example.test", email=" ADMIN@example.test ")


@pytest.mark.asyncio
async def test_non_super_invitation_allows_optional_mfa_before_password_and_activates_after_password():
    auth, identities, state, audit, mail, _ = await _service(_principal(state=AccountState.INVITED))
    await auth.issue_invitation("admin-1", "admin@example.test", setup_base_url="https://admin.test/setup")
    invite = _mail_token(mail)

    accepted = await auth.accept_invitation(invite)
    assert accepted["accepted"] is True
    enrollment = await auth.begin_mfa_enrollment_invite(invite)
    secret = _decode_b32(enrollment["secret_base32"])
    code = totp(secret, int(datetime.now(UTC).timestamp()) // 30)
    verified = await auth.verify_mfa(enrollment["enrollment_id"], code)

    assert len(verified["recovery_codes"]) == 10
    assert identities.principal.state is AccountState.INVITED
    assert (await state.get_mfa("admin-1")).enabled is True

    completed = await auth.password_setup_invite(invite, NEW_PASSWORD)
    assert completed == {"completed": True, "next_step": "COMPLETE"}
    assert identities.principal.state is AccountState.ACTIVE
    assert await state.get_token(token_hash(invite), "INVITE_SETUP", now_utc()) is None
    assert {event for event, _ in audit.events} >= {"AUTH.INVITE.CREATED", "AUTH.INVITE.ACCEPTED", "AUTH.MFA.ENROLLED", "AUTH.PASSWORD.SET"}


@pytest.mark.asyncio
async def test_super_admin_invitation_cannot_activate_until_mfa_verified():
    auth, identities, state, _, mail, _ = await _service(_principal(state=AccountState.INVITED, super_admin=True))
    await auth.issue_invitation("admin-1", "admin@example.test", setup_base_url="https://admin.test/setup")
    invite = _mail_token(mail)
    await auth.accept_invitation(invite)

    password_result = await auth.password_setup_invite(invite, NEW_PASSWORD)
    assert password_result == {"completed": False, "next_step": "MFA_ENROLLMENT"}
    assert identities.principal.state is AccountState.INVITED

    enrollment = await auth.begin_mfa_enrollment_invite(invite)
    secret = _decode_b32(enrollment["secret_base32"])
    code = totp(secret, int(datetime.now(UTC).timestamp()) // 30)
    verified = await auth.verify_mfa(enrollment["enrollment_id"], code)

    assert len(verified["recovery_codes"]) == 10
    assert identities.principal.state is AccountState.ACTIVE
    assert await state.get_token(token_hash(invite), "INVITE_SETUP", now_utc()) is None


@pytest.mark.asyncio
async def test_stale_invitation_enrollment_cannot_modify_factor_after_activation():
    auth, identities, state, _, mail, _ = await _service(_principal(state=AccountState.INVITED))
    await auth.issue_invitation("admin-1", "admin@example.test", setup_base_url="https://admin.test/setup")
    invite = _mail_token(mail)
    await auth.accept_invitation(invite)
    enrollment = await auth.begin_mfa_enrollment_invite(invite)

    await auth.password_setup_invite(invite, NEW_PASSWORD)
    assert identities.principal.state is AccountState.ACTIVE
    assert await state.get_mfa("admin-1") is None

    secret = _decode_b32(enrollment["secret_base32"])
    code = totp(secret, int(datetime.now(UTC).timestamp()) // 30)
    with pytest.raises(Unauthenticated):
        await auth.verify_mfa(enrollment["enrollment_id"], code)
    assert await state.get_mfa("admin-1") is None


@pytest.mark.asyncio
async def test_authenticated_mfa_enrollment_rotates_session_and_recovery_is_single_use():
    auth, identities, state, _, _, secrets_provider = await _service(_principal())
    principal = identities.principal
    old_raw, _, _ = await auth._issue_session(principal, mfa_verified=False)
    enrollment = await auth.begin_mfa_enrollment_session(principal, old_raw, PASSWORD)
    secret = _decode_b32(enrollment["secret_base32"])
    code = totp(secret, int(datetime.now(UTC).timestamp()) // 30)
    result = await auth.verify_mfa(enrollment["enrollment_id"], code, raw_session=old_raw)

    assert len(result["recovery_codes"]) == 10
    assert (await state.get_session(token_hash(old_raw))).revoked_at is not None
    assert await state.get_session(token_hash(result["_session"])) is not None
    mfa = await state.get_mfa("admin-1")
    assert mfa and mfa.enabled

    login = await auth.login("admin@example.test", PASSWORD)
    assert login["state"] == "MFA_REQUIRED"
    recovery = result["recovery_codes"][0]
    recovered = await auth.recover_mfa(login["mfa_challenge_id"], recovery)
    assert recovered["result"] == "VERIFIED"
    digest = await secrets_provider.hmac_digest(recovery.encode(), "MFA_RECOVERY")
    assert digest not in (await state.get_mfa("admin-1")).recovery_hashes


@pytest.mark.asyncio
async def test_factor_replacement_requires_l2_and_preserves_old_factor_until_verified():
    auth, identities, state, _, _, secrets_provider = await _service(_principal())
    old_secret = b"12345678901234567890"
    encrypted = await secrets_provider.encrypt(old_secret, "MFA_TOTP")
    await state.put_mfa(MfaRecord("admin-1", encrypted, True, enabled_at=now_utc()))
    raw, _, session = await auth._issue_session(identities.principal, mfa_verified=True)

    with pytest.raises(Denied):
        await auth.begin_mfa_enrollment_session(identities.principal, raw, PASSWORD)

    now = now_utc()
    await state.put_step_up(
        StepUpRecord(
            proof_id_hash="internal-proof",
            admin_id="admin-1",
            session_id_hash=session.session_id_hash,
            level=StepUpLevel.L2,
            issued_at=now,
            expires_at=now + timedelta(minutes=5),
        )
    )
    enrollment = await auth.begin_mfa_enrollment_session(identities.principal, raw, PASSWORD)
    assert (await state.get_mfa("admin-1")).encrypted_secret == encrypted

    new_secret = _decode_b32(enrollment["secret_base32"])
    code = totp(new_secret, int(datetime.now(UTC).timestamp()) // 30)
    result = await auth.verify_mfa(enrollment["enrollment_id"], code, raw_session=raw)
    assert result["_session"] != raw
    assert (await state.get_mfa("admin-1")).encrypted_secret != encrypted


@pytest.mark.asyncio
async def test_password_reset_consumes_token_revokes_sessions_and_stepup_but_retains_mfa():
    auth, identities, state, _, mail, secrets_provider = await _service(_principal())
    secret = b"12345678901234567890"
    encrypted = await secrets_provider.encrypt(secret, "MFA_TOTP")
    await state.put_mfa(MfaRecord("admin-1", encrypted, True, enabled_at=now_utc()))
    raw, _, session = await auth._issue_session(identities.principal, mfa_verified=True)
    now = now_utc()
    await state.put_step_up(StepUpRecord("proof", "admin-1", session.session_id_hash, StepUpLevel.L1, now, now + timedelta(minutes=10)))

    await auth.password_reset_request("admin@example.test", reset_base_url="https://admin.test/reset")
    reset = _mail_token(mail)
    await auth.password_reset_complete(reset, NEW_PASSWORD)

    assert (await state.get_session(token_hash(raw))).revoked_at is not None
    assert await state.get_step_up(session.session_id_hash, "L1", now_utc()) is None
    assert (await state.get_mfa("admin-1")).enabled is True
    assert await state.get_token(token_hash(reset), "RESET", now_utc()) is None
    assert auth.password_codec.verify((await state.get_credential("admin-1")).password_verifier, NEW_PASSWORD)


@pytest.mark.asyncio
async def test_session_idle_absolute_expiry_and_account_state_are_authoritative():
    auth, identities, state, audit, _, _ = await _service(_principal())
    authority = SessionAuthority(state, identities, audit)
    now = now_utc()

    idle_raw = "idle-session-secret-value-which-is-long"
    await state.put_session(SessionRecord(token_hash(idle_raw), "admin-1", now - timedelta(hours=1), now - timedelta(hours=1), now - timedelta(seconds=1), now + timedelta(hours=1), "PASSWORD", "csrf"))
    with pytest.raises(Unauthenticated):
        await authority.authenticate_cookie(idle_raw)
    assert "AUTH.SESSION.EXPIRED" in [event for event, _ in audit.events]

    active_raw, _, _ = await auth._issue_session(identities.principal, mfa_verified=False)
    identities.principal = replace(identities.principal, state=AccountState.DISABLED)
    with pytest.raises(Unauthenticated):
        await authority.authenticate_cookie(active_raw)
    assert (await state.get_session(token_hash(active_raw))).revoked_at is not None


@pytest.mark.asyncio
async def test_l2_stepup_requires_mfa_rotates_session_and_is_bound_to_new_session():
    auth, identities, state, _, _, secrets_provider = await _service(_principal())
    secret = b"12345678901234567890"
    encrypted = await secrets_provider.encrypt(secret, "MFA_TOTP")
    await state.put_mfa(MfaRecord("admin-1", encrypted, True, enabled_at=now_utc()))
    raw, _, _ = await auth._issue_session(identities.principal, mfa_verified=True)
    code = totp(secret, int(datetime.now(UTC).timestamp()) // 30)

    result = await auth.step_up(identities.principal, raw, "L2", PASSWORD, factor_code=code)
    new_raw = result["_session"]
    assert result["level"] == "L2"
    assert (await state.get_session(token_hash(raw))).revoked_at is not None
    assert await auth.require_step_up(new_raw, identities.principal, "L2")
    with pytest.raises(Denied):
        await auth.require_step_up(raw, identities.principal, "L2")


class _Eligibility:
    def __init__(self) -> None:
        self.allowed = True
        self.snapshots: list[str | None] = []

    async def is_preview_eligible(self, context, *, post_id, source_snapshot=None):
        self.snapshots.append(source_snapshot)
        return self.allowed and post_id == "post-1"


@pytest.mark.asyncio
async def test_preview_handoff_is_single_use_host_site_target_bound_and_revalidated():
    state = InMemorySecurityStateStore()
    sites = FakeSites()
    staging_host = "site01-staging.sslip.io"
    sites.by_host[staging_host] = sites.by_host["whatsyourrashi.in"]
    eligibility = _Eligibility()
    audit = FakeAudit()
    preview = PreviewAuthorityService(state, sites, eligibility, audit)
    principal = _principal()
    context = await TrustedContextService(sites).admin_site("SITE-01", principal=principal, request_id="req")

    handoff, _ = await preview.issue_handoff(context, post_id="post-1", initiating_admin_id="admin-1", source_snapshot="v7")
    with pytest.raises(Unauthenticated):
        await preview.exchange_handoff(handoff, site_id="site-uuid-01", post_id="post-1", request_host="other.example")
    with pytest.raises(Unauthenticated):
        await preview.exchange_handoff(handoff, site_id="site-uuid-01", post_id="post-1", request_host="apkirashi.com")

    session, _ = await preview.exchange_handoff(handoff, site_id="site-uuid-01", post_id="post-1", request_host=staging_host)
    with pytest.raises(Unauthenticated):
        await preview.exchange_handoff(handoff, site_id="site-uuid-01", post_id="post-1", request_host=staging_host)
    selected = await preview.validate(session, site_id="site-uuid-01", post_id="post-1", request_host=staging_host)
    assert selected == "v7"
    assert eligibility.snapshots[-1] == "v7"
    with pytest.raises(Unauthenticated):
        await preview.validate(session, site_id="site-uuid-01", post_id="post-1", request_host="whatsyourrashi.in")

    canonical_handoff, _ = await preview.issue_handoff(context, post_id="post-1", initiating_admin_id="admin-1", source_snapshot="v8")
    canonical_session, _ = await preview.exchange_handoff(
        canonical_handoff, site_id="site-uuid-01", post_id="post-1", request_host="whatsyourrashi.in"
    )
    assert await preview.validate(
        canonical_session, site_id="site-uuid-01", post_id="post-1", request_host="whatsyourrashi.in"
    ) == "v8"

    eligibility.allowed = False
    with pytest.raises(Unauthenticated):
        await preview.validate(session, site_id="site-uuid-01", post_id="post-1", request_host=staging_host)
    assert "SEC.PREVIEW.DENIED" in [event for event, _ in audit.events]
