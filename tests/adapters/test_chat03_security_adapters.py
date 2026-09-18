from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import pytest

from bp_adapters.mail import RecordingMailAdapter, SmtpMailAdapter
from bp_adapters.secrets import LocalEnvelopeSecretProvider, VaultTransitSecretProvider
from bp_adapters.security_store import InMemorySecurityStateStore, InMemorySecurityThrottle, LimitPolicy
from bp_adapters.security_store.dynamodb import _is_conditional_failure
from bp_domain.security import MfaRecord, TokenRecord


@pytest.mark.asyncio
async def test_inmemory_token_consume_is_atomic_under_race():
    store = InMemorySecurityStateStore()
    now = datetime.now(UTC)
    token = TokenRecord("hash", "admin", "RESET", now + timedelta(minutes=1), issued_at=now)
    await store.put_token(token)
    results = await asyncio.gather(*[store.consume_token("hash", "RESET", datetime.now(UTC)) for _ in range(20)])
    assert sum(result is not None for result in results) == 1


@pytest.mark.asyncio
async def test_inmemory_recovery_code_consume_is_atomic_under_race():
    store = InMemorySecurityStateStore()
    await store.put_mfa(MfaRecord("admin", b"ciphertext", True, recovery_hashes={"recovery-hash"}))
    results = await asyncio.gather(*[store.consume_recovery_hash("admin", "recovery-hash") for _ in range(20)])
    assert sum(results) == 1


@pytest.mark.asyncio
async def test_local_envelope_provider_binds_ciphertext_and_hmac_to_purpose():
    provider = LocalEnvelopeSecretProvider()
    ciphertext = await provider.encrypt(b"top-secret", "MFA_TOTP")
    assert b"top-secret" not in ciphertext
    assert await provider.decrypt(ciphertext, "MFA_TOTP") == b"top-secret"
    with pytest.raises(ValueError):
        await provider.decrypt(ciphertext, "OTHER")
    a = await provider.hmac_digest(b"value", "A")
    b = await provider.hmac_digest(b"value", "B")
    assert a != b


def test_vault_adapter_requires_https_and_binds_context_without_network(monkeypatch):
    with pytest.raises(ValueError):
        VaultTransitSecretProvider(base_url="http://vault.test", token="secret")
    provider = VaultTransitSecretProvider(base_url="https://vault.test", token="secret")
    calls = []

    def fake_post(path, body):
        calls.append((path, body))
        if "/encrypt/" in path:
            return {"data": {"ciphertext": "vault:v1:abc"}}
        if "/decrypt/" in path:
            import base64
            return {"data": {"plaintext": base64.b64encode(b"plain").decode()}}
        return {"data": {"hmac": "vault:v1:deadbeef"}}

    monkeypatch.setattr(provider, "_post", fake_post)
    async def run():
        assert await provider.encrypt(b"plain", "MFA_TOTP") == b"vault:v1:abc"
        assert await provider.decrypt(b"vault:v1:abc", "MFA_TOTP") == b"plain"
        assert await provider.hmac_digest(b"value", "MFA_RECOVERY") == "deadbeef"
    asyncio.run(run())
    assert all("secret" not in str(body) for _, body in calls)


def test_smtp_adapter_uses_tls_login_and_message_boundary(monkeypatch):
    events = []

    class FakeSMTP:
        def __init__(self, host, port, timeout): events.append(("open", host, port, timeout))
        def __enter__(self): return self
        def __exit__(self, *args): events.append(("close",))
        def starttls(self): events.append(("tls",))
        def login(self, username, password): events.append(("login", username, password))
        def send_message(self, msg): events.append(("send", msg["To"], msg["Subject"], msg.get_content().strip()))

    monkeypatch.setattr("bp_adapters.mail.smtp.smtplib.SMTP", FakeSMTP)
    adapter = SmtpMailAdapter(host="smtp.test", port=587, sender="noreply@test", username="svc", password="provider-secret")
    asyncio.run(adapter.send("user@test", "Subject", "one-time-link"))
    assert ("tls",) in events
    assert ("login", "svc", "provider-secret") in events
    assert ("send", "user@test", "Subject", "one-time-link") in events
    assert "provider-secret" not in repr(adapter.__dict__.keys())


@pytest.mark.asyncio
async def test_inmemory_throttle_never_exceeds_configured_ceiling():
    limiter = InMemorySecurityThrottle({"X": LimitPolicy(2, 60)})
    first = await limiter.check(class_id="X", actor_key="actor", request_id="r1")
    second = await limiter.check(class_id="X", actor_key="actor", request_id="r2")
    third = await limiter.check(class_id="X", actor_key="actor", request_id="r3")
    assert first.allowed and second.allowed
    assert not third.allowed and third.remaining == 0 and third.retry_after_seconds


def test_dynamo_conditional_failure_detection_handles_boto_client_error_shape():
    class Error(Exception):
        response = {"Error": {"Code": "ConditionalCheckFailedException"}}
    assert _is_conditional_failure(Error())


@pytest.mark.asyncio
async def test_recording_mail_adapter_keeps_delivery_at_port_boundary():
    mail = RecordingMailAdapter()
    await mail.send("user@test", "subject", "opaque-one-time-token")
    assert mail.messages == [("user@test", "subject", "opaque-one-time-token")]
