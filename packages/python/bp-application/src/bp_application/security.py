from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import struct
from dataclasses import dataclass, replace
from datetime import UTC, datetime, timedelta
from urllib.parse import quote

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError

from bp_domain.context import SiteContext
from bp_domain.security import (
    AccountState,
    AdminPrincipal,
    CredentialRecord,
    Denied,
    MfaRecord,
    SessionRecord,
    StepUpLevel,
    StepUpRecord,
    TokenRecord,
    Unauthenticated,
    ValidationFault,
)
from bp_ports import (
    AuditPort,
    IdentityAuthorizationPort,
    MailPort,
    PreviewEligibilityPort,
    SecretProviderPort,
    SecurityStateStorePort,
    SiteRegistryPort,
)

from .context import normalize_host

SESSION_IDLE = timedelta(minutes=30)
SESSION_ABSOLUTE = timedelta(hours=12)
SESSION_TOUCH_INTERVAL = timedelta(minutes=5)
PREAUTH_TTL = timedelta(minutes=5)
INVITE_TTL = timedelta(hours=48)
RESET_TTL = timedelta(minutes=30)
PREVIEW_HANDOFF_TTL = timedelta(seconds=60)
PREVIEW_SESSION_TTL = timedelta(minutes=10)
STEP_UP_L1_TTL = timedelta(minutes=10)
STEP_UP_L2_TTL = timedelta(minutes=5)


class WeakPasswordPort:
    def contains(self, candidate: str) -> bool:
        raise NotImplementedError


class SetWeakPasswordChecker(WeakPasswordPort):
    def __init__(self, values: set[str], *, production: bool = False) -> None:
        if production and len(values) < 10_000:
            raise ValueError("DOC-19 requires a versioned denylist of at least 10,000 entries")
        self._values = values

    def contains(self, candidate: str) -> bool:
        return candidate in self._values


class PasswordPolicy:
    def __init__(self, weak: WeakPasswordPort) -> None:
        self.weak = weak

    def validate(self, password: str, *, email: str | None = None) -> None:
        if "\x00" in password:
            raise ValidationFault("invalid password")
        if not 12 <= len(password) <= 128 or len(password.encode("utf-8")) > 512:
            raise ValidationFault("invalid password")
        if email is not None:
            login_identifier = email.strip().lower()
            if hmac.compare_digest(password, login_identifier):
                raise ValidationFault("invalid password")
        if self.weak.contains(password):
            raise ValidationFault("invalid password")


class PasswordCodec:
    def __init__(self) -> None:
        self._ph = PasswordHasher(
            time_cost=3,
            memory_cost=65536,
            parallelism=1,
            hash_len=32,
            salt_len=16,
        )

    def hash(self, password: str) -> str:
        return self._ph.hash(password)

    def verify(self, encoded: str, password: str) -> bool:
        try:
            return self._ph.verify(encoded, password)
        except (VerifyMismatchError, VerificationError):
            return False

    def needs_rehash(self, encoded: str) -> bool:
        return self._ph.check_needs_rehash(encoded)


def token_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def new_secret_token(nbytes: int = 32) -> str:
    return secrets.token_urlsafe(nbytes)


def now_utc() -> datetime:
    return datetime.now(UTC)


def totp(secret: bytes, counter: int) -> str:
    msg = struct.pack(">Q", counter)
    digest = hmac.new(secret, msg, hashlib.sha1).digest()
    offset = digest[-1] & 0x0F
    code = (struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF) % 1_000_000
    return f"{code:06d}"


def verify_totp(secret: bytes, code: str, *, now: datetime, last_step: int | None) -> int | None:
    if len(code) != 6 or not code.isdigit():
        return None
    step = int(now.timestamp()) // 30
    for candidate in (step - 1, step, step + 1):
        if last_step is not None and candidate <= last_step:
            continue
        if hmac.compare_digest(totp(secret, candidate), code):
            return candidate
    return None


@dataclass(slots=True)
class SessionAuthority:
    store: SecurityStateStorePort
    identities: IdentityAuthorizationPort
    audit: AuditPort | None = None

    async def authenticate_cookie(self, raw_session_id: str | None) -> tuple[SessionRecord, AdminPrincipal]:
        if not raw_session_id:
            raise Unauthenticated("authentication required")
        session_hash = token_hash(raw_session_id)
        record = await self.store.get_session(session_hash)
        now = now_utc()
        if record is None or record.revoked_at is not None:
            raise Unauthenticated("authentication required")
        if now >= record.idle_expires_at or now >= record.absolute_expires_at:
            await self.store.revoke_session(session_hash, "EXPIRED")
            if self.audit is not None:
                await self.audit.append(
                    "AUTH.SESSION.EXPIRED",
                    actor_admin_id=record.admin_id,
                    site_id=None,
                    details={},
                )
            raise Unauthenticated("authentication required")
        principal = await self.identities.get_principal(record.admin_id)
        if principal is None or principal.state is not AccountState.ACTIVE:
            await self.store.revoke_session(session_hash, "ACCOUNT_NOT_ACTIVE")
            raise Unauthenticated("authentication required")
        mfa = await self.store.get_mfa(principal.admin_id)
        principal = replace(principal, mfa_enabled=bool(mfa and mfa.enabled))
        if now - record.last_seen_at >= SESSION_TOUCH_INTERVAL:
            idle_expires = min(now + SESSION_IDLE, record.absolute_expires_at)
            await self.store.touch_session(session_hash, last_seen_at=now, idle_expires_at=idle_expires)
            record.last_seen_at = now
            record.idle_expires_at = idle_expires
        return record, principal


@dataclass(slots=True)
class AuthService:
    identities: IdentityAuthorizationPort
    state: SecurityStateStorePort
    secrets_provider: SecretProviderPort
    audit: AuditPort
    mail: MailPort
    password_policy: PasswordPolicy
    password_codec: PasswordCodec
    require_mfa_on_login: bool = True

    async def _fresh_principal(self, admin_id: str) -> AdminPrincipal:
        principal = await self.identities.get_principal(admin_id)
        if principal is None or principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        mfa = await self.state.get_mfa(admin_id)
        return replace(principal, mfa_enabled=bool(mfa and mfa.enabled))

    async def _credential_verifier(self, admin_id: str) -> str | None:
        record = await self.state.get_credential(admin_id)
        return record.password_verifier if record is not None else None

    async def _set_credential_verifier(self, admin_id: str, verifier: str) -> None:
        await self.state.put_credential(
            CredentialRecord(
                admin_id=admin_id,
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

    def validate_new_admin_password(self, email: str, password: str) -> None:
        """Validate a launch-created user's password before persistence begins."""

        self.password_policy.validate(password, email=email.strip().lower())

    async def provision_created_admin(self, admin_id: str, email: str, password: str) -> None:
        """Create hashed login state and activate a newly persisted INVITED identity.

        The caller owns PostgreSQL compensation. This method removes security-state
        credential material if activation cannot complete, so no orphaned verifier
        survives a failed cross-store create.
        """

        principal = await self.identities.get_principal(admin_id)
        if (
            principal is None
            or principal.state is not AccountState.INVITED
            or principal.email.strip().lower() != email.strip().lower()
            or principal.is_super_admin
        ):
            raise ValidationFault("new Admin account is not eligible")
        self.validate_new_admin_password(principal.email, password)
        await self._set_credential_verifier(admin_id, self.password_codec.hash(password))
        try:
            await self.identities.activate_invited_admin(admin_id)
        except Exception:
            await self.state.delete_credential(admin_id)
            raise
        await self.audit.append(
            "AUTH.PASSWORD.SET",
            actor_admin_id=admin_id,
            site_id=None,
            details={"source": "DIRECT_CREATE"},
        )

    async def _issue_session(self, principal: AdminPrincipal, *, mfa_verified: bool) -> tuple[str, str, SessionRecord]:
        now = now_utc()
        raw = new_secret_token(32)
        csrf = new_secret_token(32)
        record = SessionRecord(
            session_id_hash=token_hash(raw),
            admin_id=principal.admin_id,
            created_at=now,
            last_seen_at=now,
            idle_expires_at=now + SESSION_IDLE,
            absolute_expires_at=now + SESSION_ABSOLUTE,
            authn_strength="MFA" if mfa_verified else "PASSWORD",
            csrf_secret_hash=token_hash(csrf),
            mfa_verified_at=now if mfa_verified else None,
        )
        await self.state.put_session(record)
        return raw, csrf, record

    async def _rotate_session(
        self,
        principal: AdminPrincipal,
        raw_session: str,
        *,
        revoke_reason: str,
    ) -> tuple[str, str, SessionRecord]:
        old_hash = token_hash(raw_session)
        old = await self.state.get_session(old_hash)
        now = now_utc()
        if old is None or old.revoked_at is not None or now >= old.idle_expires_at or now >= old.absolute_expires_at:
            raise Unauthenticated("authentication required")
        new_raw = new_secret_token(32)
        new_csrf = new_secret_token(32)
        rotated = SessionRecord(
            session_id_hash=token_hash(new_raw),
            admin_id=principal.admin_id,
            created_at=old.created_at,
            last_seen_at=now,
            idle_expires_at=min(now + SESSION_IDLE, old.absolute_expires_at),
            absolute_expires_at=old.absolute_expires_at,
            authn_strength=old.authn_strength,
            csrf_secret_hash=token_hash(new_csrf),
            mfa_verified_at=old.mfa_verified_at,
        )
        await self.state.put_session(rotated)
        await self.state.revoke_session(old_hash, revoke_reason)
        return new_raw, new_csrf, rotated

    async def issue_invitation(
        self,
        admin_id: str,
        recipient_email: str,
        *,
        setup_base_url: str,
        actor_admin_id: str | None = None,
    ) -> None:
        principal = await self.identities.get_principal(admin_id)
        if principal is None or principal.state is not AccountState.INVITED:
            raise ValidationFault("invitation target is not eligible")
        recipient = recipient_email.strip().lower()
        if recipient != principal.email.strip().lower():
            raise ValidationFault("invitation target is not eligible")
        await self.state.invalidate_tokens(admin_id, "INVITE_SETUP")
        now = now_utc()
        raw = new_secret_token(32)
        await self.state.put_token(
            TokenRecord(
                token_hash=token_hash(raw),
                admin_id=admin_id,
                purpose="INVITE_SETUP",
                issued_at=now,
                expires_at=now + INVITE_TTL,
                metadata={"phase": "ISSUED"},
            )
        )
        await self.mail.send(recipient, "Admin invitation", f"{setup_base_url}?token={quote(raw)}")
        await self.audit.append("AUTH.INVITE.CREATED", actor_admin_id=actor_admin_id, site_id=None, details={})

    async def revoke_account_security_state(
        self,
        admin_id: str,
        *,
        reason: str,
        actor_admin_id: str | None = None,
    ) -> None:
        """Defense-in-depth revocation after an authoritative account disable."""

        await self.state.revoke_all_sessions(admin_id, reason)
        await self.state.revoke_step_ups(admin_id)
        await self.state.invalidate_tokens(admin_id, "MFA_CHALLENGE_LOGIN")
        await self.state.invalidate_tokens(admin_id, "MFA_ENROLLMENT")
        await self.state.invalidate_tokens(admin_id, "INVITE_SETUP")
        await self.state.invalidate_tokens(admin_id, "RESET")
        await self.audit.append(
            "AUTH.SESSION.REVOKED",
            actor_admin_id=actor_admin_id,
            site_id=None,
            details={"reason": reason, "target_admin_id": admin_id},
        )

    async def login(self, email: str, password: str) -> dict:
        normalized = email.strip().lower()
        principal = await self.identities.find_principal_by_email(normalized)
        verifier = None
        if principal is not None and principal.state is AccountState.ACTIVE:
            verifier = await self._credential_verifier(principal.admin_id)
        if not verifier or not self.password_codec.verify(verifier, password):
            await self.audit.append(
                "AUTH.LOGIN.FAILURE",
                actor_admin_id=None,
                site_id=None,
                details={"reason": "CREDENTIAL_REJECTED"},
            )
            raise Unauthenticated("invalid credentials")
        if self.password_codec.needs_rehash(verifier):
            await self._set_credential_verifier(principal.admin_id, self.password_codec.hash(password))
        principal = await self._fresh_principal(principal.admin_id)
        # Launch mode: MFA is optional. Accounts that explicitly enroll MFA still require it.
        if self.require_mfa_on_login and principal.mfa_enabled:
            now = now_utc()
            raw = new_secret_token(32)
            await self.state.invalidate_tokens(principal.admin_id, "MFA_CHALLENGE_LOGIN")
            await self.state.put_token(
                TokenRecord(
                    token_hash=token_hash(raw),
                    admin_id=principal.admin_id,
                    purpose="MFA_CHALLENGE_LOGIN",
                    issued_at=now,
                    expires_at=now + PREAUTH_TTL,
                )
            )
            return {
                "state": "MFA_REQUIRED",
                "display_name": principal.display_name or principal.email,
                "mfa_challenge_id": raw,
                "challenge_expires_at": (now + PREAUTH_TTL).isoformat(),
            }
        raw_session, raw_csrf, record = await self._issue_session(principal, mfa_verified=False)
        await self.audit.append("AUTH.LOGIN.SUCCESS", actor_admin_id=principal.admin_id, site_id=None, details={})
        return {
            "state": "AUTHENTICATED",
            "display_name": principal.display_name or principal.email,
            "session_expires_at": record.absolute_expires_at.isoformat(),
            "_session": raw_session,
            "_csrf": raw_csrf,
        }

    async def logout(self, principal: AdminPrincipal, raw_session: str) -> None:
        await self.state.revoke_session(token_hash(raw_session), "LOGOUT")
        await self.state.revoke_step_ups(principal.admin_id)
        await self.audit.append("AUTH.LOGOUT", actor_admin_id=principal.admin_id, site_id=None, details={})

    async def accept_invitation(self, invite_token: str) -> dict:
        now = now_utc()
        digest = token_hash(invite_token)
        record = await self.state.get_token(digest, "INVITE_SETUP", now)
        if record is None or record.metadata.get("phase", "ISSUED") != "ISSUED":
            raise Unauthenticated("invalid or expired token")
        principal = await self.identities.get_principal(record.admin_id)
        if principal is None or principal.state is not AccountState.INVITED:
            raise Unauthenticated("invalid or expired token")
        accepted = await self.state.transition_token(
            digest,
            "INVITE_SETUP",
            from_phase="ISSUED",
            to_phase="ACCEPTED",
            now=now,
        )
        if accepted is None:
            raise Unauthenticated("invalid or expired token")
        await self.audit.append("AUTH.INVITE.ACCEPTED", actor_admin_id=accepted.admin_id, site_id=None, details={})
        return {"accepted": True, "next_step": "PASSWORD_SETUP", "expires_at": accepted.expires_at.isoformat()}

    async def password_setup_invite(self, invite_token: str, new_password: str) -> dict:
        now = now_utc()
        digest = token_hash(invite_token)
        record = await self.state.get_token(digest, "INVITE_SETUP", now)
        if record is None or record.metadata.get("phase") != "ACCEPTED":
            raise Unauthenticated("invalid or expired token")
        principal = await self.identities.get_principal(record.admin_id)
        if principal is None or principal.state is not AccountState.INVITED:
            raise Unauthenticated("invalid or expired token")
        self.password_policy.validate(new_password, email=principal.email)
        verifier = self.password_codec.hash(new_password)

        existing_mfa = await self.state.get_mfa(principal.admin_id)
        mfa_enabled = bool(existing_mfa and existing_mfa.enabled)

        if principal.is_super_admin and not mfa_enabled:
            claimed = await self.state.transition_token(
                digest,
                "INVITE_SETUP",
                from_phase="ACCEPTED",
                to_phase="PASSWORD_SETUP_CLAIMED",
                now=now,
            )
            if claimed is None:
                raise Unauthenticated("invalid or expired token")
            await self._set_credential_verifier(record.admin_id, verifier)
            completed = await self.state.transition_token(
                digest,
                "INVITE_SETUP",
                from_phase="PASSWORD_SETUP_CLAIMED",
                to_phase="PASSWORD_SET",
                now=now_utc(),
            )
            if completed is None:
                raise Unauthenticated("invalid or expired token")
            await self.audit.append("AUTH.PASSWORD.SET", actor_admin_id=record.admin_id, site_id=None, details={})
            return {"completed": False, "next_step": "MFA_ENROLLMENT"}

        claimed = await self.state.transition_token(
            digest,
            "INVITE_SETUP",
            from_phase="ACCEPTED",
            to_phase="PASSWORD_SETUP_CLAIMED",
            now=now,
        )
        if claimed is None:
            raise Unauthenticated("invalid or expired token")
        await self._set_credential_verifier(record.admin_id, verifier)
        await self.identities.activate_invited_admin(record.admin_id)
        consumed = await self.state.consume_token(digest, "INVITE_SETUP", now_utc())
        if consumed is None:
            raise Unauthenticated("invalid or expired token")
        await self.state.invalidate_tokens(record.admin_id, "MFA_ENROLLMENT")
        await self.audit.append("AUTH.PASSWORD.SET", actor_admin_id=record.admin_id, site_id=None, details={})
        return {"completed": True, "next_step": "COMPLETE"}

    async def password_change(
        self,
        principal: AdminPrincipal,
        raw_session: str,
        current_password: str,
        new_password: str,
    ) -> dict:
        verifier = await self._credential_verifier(principal.admin_id)
        if not verifier or not self.password_codec.verify(verifier, current_password):
            raise Unauthenticated("invalid credentials")
        self.password_policy.validate(new_password, email=principal.email)
        await self._set_credential_verifier(principal.admin_id, self.password_codec.hash(new_password))
        await self.state.invalidate_tokens(principal.admin_id, "RESET")
        await self.state.invalidate_tokens(principal.admin_id, "MFA_CHALLENGE_LOGIN")
        await self.state.revoke_step_ups(principal.admin_id)
        old_hash = token_hash(raw_session)
        await self.state.revoke_all_sessions(principal.admin_id, "PASSWORD_CHANGED", except_hash=old_hash)
        new_raw, new_csrf, _ = await self._rotate_session(principal, raw_session, revoke_reason="PASSWORD_CHANGED_ROTATION")
        await self.audit.append("AUTH.PASSWORD.CHANGED", actor_admin_id=principal.admin_id, site_id=None, details={})
        return {
            "completed": True,
            "next_step": "COMPLETE",
            "_session": new_raw,
            "_csrf": new_csrf,
        }

    async def password_reset_request(self, email: str, *, reset_base_url: str) -> None:
        normalized = email.strip().lower()
        principal = await self.identities.find_principal_by_email(normalized)
        if principal is not None and principal.state is AccountState.ACTIVE:
            await self.state.invalidate_tokens(principal.admin_id, "RESET")
            now = now_utc()
            raw = new_secret_token(32)
            await self.state.put_token(
                TokenRecord(
                    token_hash=token_hash(raw),
                    admin_id=principal.admin_id,
                    purpose="RESET",
                    issued_at=now,
                    expires_at=now + RESET_TTL,
                )
            )
            await self.mail.send(principal.email, "Password reset", f"{reset_base_url}?token={quote(raw)}")
            await self.audit.append("AUTH.RESET.REQUESTED", actor_admin_id=principal.admin_id, site_id=None, details={})

    async def password_reset_complete(self, reset_token: str, new_password: str) -> None:
        now = now_utc()
        digest = token_hash(reset_token)
        record = await self.state.get_token(digest, "RESET", now)
        if record is None:
            raise Unauthenticated("invalid or expired token")
        principal = await self.identities.get_principal(record.admin_id)
        if principal is None or principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("invalid or expired token")
        self.password_policy.validate(new_password, email=principal.email)
        claimed = await self.state.transition_token(
            digest,
            "RESET",
            from_phase="ISSUED",
            to_phase="CLAIMED",
            now=now,
        )
        if claimed is None:
            raise Unauthenticated("invalid or expired token")
        await self._set_credential_verifier(record.admin_id, self.password_codec.hash(new_password))
        consumed = await self.state.consume_token(digest, "RESET", now_utc())
        if consumed is None:
            raise Unauthenticated("invalid or expired token")
        await self.state.revoke_all_sessions(record.admin_id, "PASSWORD_RESET")
        await self.state.revoke_step_ups(record.admin_id)
        await self.state.invalidate_tokens(record.admin_id, "MFA_CHALLENGE_LOGIN")
        await self.audit.append("AUTH.RESET.COMPLETED", actor_admin_id=record.admin_id, site_id=None, details={})

    async def begin_mfa_enrollment_session(
        self,
        principal: AdminPrincipal,
        raw_session: str,
        current_password: str,
    ) -> dict:
        verifier = await self._credential_verifier(principal.admin_id)
        if not verifier or not self.password_codec.verify(verifier, current_password):
            raise Unauthenticated("invalid credentials")
        existing = await self.state.get_mfa(principal.admin_id)
        if existing is not None and existing.enabled:
            # DOC-19 replacement requires current password + current MFA/recovery.
            # Reuse the already-issued L2 proof for the same *current* session;
            # there is no separate MFA-disable/replace API in RC7.
            proof = await self.state.get_step_up(token_hash(raw_session), "L2", now_utc())
            if proof is None or proof.admin_id != principal.admin_id:
                raise Denied("step-up required")
        return await self._begin_mfa_enrollment(
            principal,
            activation_invite_hash=None,
            session_id_hash=token_hash(raw_session),
        )

    async def begin_mfa_enrollment_invite(self, invite_token: str) -> dict:
        now = now_utc()
        invite_hash = token_hash(invite_token)
        record = await self.state.get_token(invite_hash, "INVITE_SETUP", now)
        if record is None or record.metadata.get("phase") not in {"ACCEPTED", "PASSWORD_SET"}:
            raise Unauthenticated("invalid or expired token")
        principal = await self.identities.get_principal(record.admin_id)
        if principal is None or principal.state is not AccountState.INVITED:
            raise Unauthenticated("invalid or expired token")
        return await self._begin_mfa_enrollment(
            principal,
            activation_invite_hash=invite_hash,
            session_id_hash=None,
        )

    async def _begin_mfa_enrollment(
        self,
        principal: AdminPrincipal,
        *,
        activation_invite_hash: str | None,
        session_id_hash: str | None,
    ) -> dict:
        now = now_utc()
        secret = secrets.token_bytes(20)
        encrypted = await self.secrets_provider.encrypt(secret, "MFA_TOTP")
        enrollment = new_secret_token(32)
        # Do not replace an existing enabled factor until the candidate secret
        # has been successfully verified. Pending enrollment stays inside the
        # short-lived security token record so a failed/abandoned replacement
        # cannot silently disable the old factor.
        metadata = {
            "pending_secret_b64": base64.urlsafe_b64encode(encrypted).decode("ascii"),
        }
        if activation_invite_hash is not None:
            metadata["activation_invite_hash"] = activation_invite_hash
        if session_id_hash is not None:
            metadata["session_id_hash"] = session_id_hash
        await self.state.invalidate_tokens(principal.admin_id, "MFA_ENROLLMENT")
        await self.state.put_token(
            TokenRecord(
                token_hash=token_hash(enrollment),
                admin_id=principal.admin_id,
                purpose="MFA_ENROLLMENT",
                issued_at=now,
                expires_at=now + PREAUTH_TTL,
                metadata=metadata,
            )
        )
        b32 = base64.b32encode(secret).decode().rstrip("=")
        uri = (
            f"otpauth://totp/Nakshatra:{quote(principal.email)}?secret={b32}"
            "&issuer=Nakshatra&algorithm=SHA1&digits=6&period=30"
        )
        return {
            "enrollment_id": enrollment,
            "secret_base32": b32,
            "provisioning_uri": uri,
            "expires_at": (now + PREAUTH_TTL).isoformat(),
        }

    async def verify_mfa(self, challenge_id: str, code: str, *, raw_session: str | None = None) -> dict:
        now = now_utc()
        challenge_hash = token_hash(challenge_id)
        purpose = None
        token = None
        for candidate_purpose in ("MFA_CHALLENGE_LOGIN", "MFA_ENROLLMENT"):
            token = await self.state.get_token(challenge_hash, candidate_purpose, now)
            if token is not None:
                purpose = candidate_purpose
                break
        if token is None or purpose is None:
            raise Unauthenticated("invalid or expired challenge")
        principal = await self.identities.get_principal(token.admin_id)
        if principal is None:
            raise Unauthenticated("invalid factor")
        if purpose == "MFA_CHALLENGE_LOGIN" and principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("invalid factor")
        activation_invite_hash = token.metadata.get("activation_invite_hash")
        activation_invite = None
        if purpose == "MFA_ENROLLMENT" and activation_invite_hash is not None:
            activation_invite = await self.state.get_token(activation_invite_hash, "INVITE_SETUP", now)
            if activation_invite is None or principal.state is not AccountState.INVITED:
                await self.state.consume_token(challenge_hash, purpose, now)
                raise Unauthenticated("invalid or expired token")
        expected_session_hash = token.metadata.get("session_id_hash")
        if expected_session_hash is not None:
            if raw_session is None or not hmac.compare_digest(token_hash(raw_session), expected_session_hash):
                raise Unauthenticated("invalid factor")
            session = await self.state.get_session(expected_session_hash)
            if (
                session is None
                or session.admin_id != token.admin_id
                or session.revoked_at is not None
                or now >= session.idle_expires_at
                or now >= session.absolute_expires_at
                or principal.state is not AccountState.ACTIVE
            ):
                raise Unauthenticated("invalid factor")
        mfa = await self.state.get_mfa(token.admin_id)
        pending_encrypted: bytes | None = None
        if purpose == "MFA_ENROLLMENT":
            encoded = token.metadata.get("pending_secret_b64")
            if not encoded:
                await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={})
                raise Unauthenticated("invalid factor")
            try:
                pending_encrypted = base64.urlsafe_b64decode(encoded.encode("ascii"))
            except Exception as exc:
                raise Unauthenticated("invalid factor") from exc
            secret = await self.secrets_provider.decrypt(pending_encrypted, "MFA_TOTP")
            last_step = None
        else:
            if mfa is None or not mfa.enabled:
                await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={})
                raise Unauthenticated("invalid factor")
            secret = await self.secrets_provider.decrypt(mfa.encrypted_secret, "MFA_TOTP")
            last_step = mfa.last_accepted_step

        accepted_step = verify_totp(secret, code, now=now, last_step=last_step)
        if accepted_step is None:
            await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={})
            raise Unauthenticated("invalid factor")
        consumed = await self.state.consume_token(challenge_hash, purpose, now)
        if consumed is None:
            raise Unauthenticated("invalid or expired challenge")
        recovery_codes = None
        if purpose == "MFA_ENROLLMENT":
            assert pending_encrypted is not None
            recovery_codes = [new_secret_token(16) for _ in range(10)]
            recovery_hashes = {
                await self.secrets_provider.hmac_digest(code_value.encode("utf-8"), "MFA_RECOVERY")
                for code_value in recovery_codes
            }
            await self.state.put_mfa(
                MfaRecord(
                    admin_id=token.admin_id,
                    encrypted_secret=pending_encrypted,
                    enabled=True,
                    enabled_at=now,
                    last_accepted_step=accepted_step,
                    recovery_hashes=recovery_hashes,
                )
            )
            await self.state.invalidate_tokens(token.admin_id, "MFA_CHALLENGE_LOGIN")
            await self.audit.append("AUTH.MFA.ENROLLED", actor_admin_id=token.admin_id, site_id=None, details={})
        else:
            if not await self.state.advance_mfa_step(token.admin_id, accepted_step):
                await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={"reason": "REPLAY"})
                raise Unauthenticated("invalid factor")
        result = {"result": "VERIFIED"}
        if purpose == "MFA_CHALLENGE_LOGIN":
            raw, csrf, session = await self._issue_session(principal, mfa_verified=True)
            result.update(
                {
                    "session_expires_at": session.absolute_expires_at.isoformat(),
                    "_session": raw,
                    "_csrf": csrf,
                }
            )
            await self.audit.append("AUTH.LOGIN.SUCCESS", actor_admin_id=principal.admin_id, site_id=None, details={"mfa": True})
        elif expected_session_hash is not None and raw_session is not None:
            # Enrollment changes authentication material, so the current session
            # and CSRF secret rotate immediately after verification.
            await self.state.revoke_step_ups(principal.admin_id)
            raw, csrf, session = await self._rotate_session(
                principal,
                raw_session,
                revoke_reason="MFA_CHANGED_ROTATION",
            )
            result.update(
                {
                    "session_expires_at": session.absolute_expires_at.isoformat(),
                    "_session": raw,
                    "_csrf": csrf,
                }
            )
        elif activation_invite_hash is not None:
            invite_hash = activation_invite_hash
            invite = activation_invite
            if invite is None or principal.state is not AccountState.INVITED:
                raise Unauthenticated("invalid or expired token")
            # Super Admin password-first setup reaches PASSWORD_SET and may now
            # activate. Optional MFA-before-password for other invited Admins
            # leaves the accepted invitation alive for password setup.
            if invite.metadata.get("phase") == "PASSWORD_SET":
                consumed_invite = await self.state.consume_token(invite_hash, "INVITE_SETUP", now)
                if consumed_invite is None:
                    raise Unauthenticated("invalid or expired token")
                await self.identities.activate_invited_admin(principal.admin_id)
                await self.state.invalidate_tokens(principal.admin_id, "MFA_ENROLLMENT")
        if recovery_codes is not None:
            result["recovery_codes"] = recovery_codes
        return result

    async def recover_mfa(self, challenge_id: str, recovery_code: str) -> dict:
        now = now_utc()
        challenge_hash = token_hash(challenge_id)
        token = await self.state.get_token(challenge_hash, "MFA_CHALLENGE_LOGIN", now)
        if token is None:
            raise Unauthenticated("invalid or expired challenge")
        principal = await self.identities.get_principal(token.admin_id)
        if principal is None or principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("invalid factor")
        mfa = await self.state.get_mfa(token.admin_id)
        digest = await self.secrets_provider.hmac_digest(recovery_code.encode("utf-8"), "MFA_RECOVERY")
        if mfa is None or digest not in mfa.recovery_hashes:
            await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={})
            raise Unauthenticated("invalid factor")
        consumed = await self.state.consume_token(challenge_hash, "MFA_CHALLENGE_LOGIN", now)
        if consumed is None:
            raise Unauthenticated("invalid or expired challenge")
        if not await self.state.consume_recovery_hash(token.admin_id, digest):
            await self.audit.append("AUTH.MFA.FAILURE", actor_admin_id=token.admin_id, site_id=None, details={"reason": "RECOVERY_REPLAY"})
            raise Unauthenticated("invalid factor")
        raw, csrf, session = await self._issue_session(principal, mfa_verified=True)
        await self.audit.append("AUTH.MFA.RECOVERY_USED", actor_admin_id=principal.admin_id, site_id=None, details={})
        return {
            "result": "VERIFIED",
            "session_expires_at": session.absolute_expires_at.isoformat(),
            "_session": raw,
            "_csrf": csrf,
        }

    async def terminate_sessions(self, principal: AdminPrincipal, raw_session: str, scope: str) -> None:
        if scope == "CURRENT_SESSION":
            await self.state.revoke_session(token_hash(raw_session), "SESSION_TERMINATED")
        elif scope == "ALL_SESSIONS":
            await self.state.revoke_all_sessions(principal.admin_id, "SESSION_TERMINATED")
        else:
            raise ValidationFault("invalid scope")
        await self.state.revoke_step_ups(principal.admin_id)
        await self.audit.append("AUTH.SESSION.REVOKED", actor_admin_id=principal.admin_id, site_id=None, details={"scope": scope})

    async def invalidate_mfa_challenge(self, challenge_id: str) -> None:
        """Invalidate a pre-auth/enrollment challenge after the DOC-19 failure ceiling.

        The opaque challenge is hashed before any store lookup and is never
        returned or written to audit detail.
        """

        now = now_utc()
        digest = token_hash(challenge_id)
        for purpose in ("MFA_CHALLENGE_LOGIN", "MFA_ENROLLMENT"):
            await self.state.consume_token(digest, purpose, now)

    async def revoke_current_for_security(
        self,
        principal: AdminPrincipal,
        raw_session: str,
        *,
        reason: str,
    ) -> None:
        await self.state.revoke_session(token_hash(raw_session), reason)
        await self.state.revoke_step_ups(principal.admin_id)
        await self.audit.append(
            "AUTH.SESSION.REVOKED",
            actor_admin_id=principal.admin_id,
            site_id=None,
            details={"reason": reason},
        )

    async def require_step_up(self, raw_session: str, principal: AdminPrincipal, level: str) -> StepUpRecord:
        try:
            required = StepUpLevel(level)
        except ValueError as exc:
            raise ValidationFault("invalid step-up level") from exc
        if required not in {StepUpLevel.L1, StepUpLevel.L2}:
            raise ValidationFault("invalid step-up level")
        proof = await self.state.get_step_up(token_hash(raw_session), required.value, now_utc())
        if proof is None or proof.admin_id != principal.admin_id:
            raise Denied("step-up required")
        return proof

    async def step_up(
        self,
        principal: AdminPrincipal,
        raw_session: str,
        level: str,
        current_password: str,
        factor_code: str | None = None,
        recovery_code: str | None = None,
    ) -> dict:
        try:
            requested = StepUpLevel(level)
        except ValueError as exc:
            raise ValidationFault("invalid step-up level") from exc
        if requested not in {StepUpLevel.L1, StepUpLevel.L2}:
            raise ValidationFault("invalid step-up level")
        verifier = await self._credential_verifier(principal.admin_id)
        if not verifier or not self.password_codec.verify(verifier, current_password):
            await self.audit.append("AUTH.STEPUP.FAILURE", actor_admin_id=principal.admin_id, site_id=None, details={"level": requested.value})
            raise Unauthenticated("invalid credentials")
        mfa = await self.state.get_mfa(principal.admin_id)
        mfa_enabled = bool(mfa and mfa.enabled)
        if requested is StepUpLevel.L2 and not mfa_enabled:
            await self.audit.append("AUTH.STEPUP.FAILURE", actor_admin_id=principal.admin_id, site_id=None, details={"level": requested.value})
            raise Denied("MFA required")
        if requested is StepUpLevel.L2 or mfa_enabled:
            if mfa is None:
                raise Denied("MFA required")
            ok = False
            if factor_code:
                secret = await self.secrets_provider.decrypt(mfa.encrypted_secret, "MFA_TOTP")
                accepted = verify_totp(secret, factor_code, now=now_utc(), last_step=mfa.last_accepted_step)
                if accepted is not None and await self.state.advance_mfa_step(principal.admin_id, accepted):
                    ok = True
            elif recovery_code:
                digest = await self.secrets_provider.hmac_digest(recovery_code.encode("utf-8"), "MFA_RECOVERY")
                if digest in mfa.recovery_hashes and await self.state.consume_recovery_hash(principal.admin_id, digest):
                    ok = True
            if not ok:
                await self.audit.append("AUTH.STEPUP.FAILURE", actor_admin_id=principal.admin_id, site_id=None, details={"level": requested.value})
                raise Unauthenticated("invalid factor")
        await self.state.revoke_step_ups(principal.admin_id)
        new_raw, new_csrf, rotated = await self._rotate_session(principal, raw_session, revoke_reason="STEP_UP_ROTATION")
        ttl = STEP_UP_L1_TTL if requested is StepUpLevel.L1 else STEP_UP_L2_TTL
        now = now_utc()
        proof = new_secret_token(32)
        await self.state.put_step_up(
            StepUpRecord(
                proof_id_hash=token_hash(proof),
                admin_id=principal.admin_id,
                session_id_hash=rotated.session_id_hash,
                level=requested,
                issued_at=now,
                expires_at=now + ttl,
            )
        )
        await self.audit.append("AUTH.STEPUP.SUCCESS", actor_admin_id=principal.admin_id, site_id=None, details={"level": requested.value})
        return {
            "level": requested.value,
            "expires_at": (now + ttl).isoformat(),
            "_session": new_raw,
            "_csrf": new_csrf,
        }


@dataclass(slots=True)
class PreviewAuthorityService:
    state: SecurityStateStorePort
    sites: SiteRegistryPort
    eligibility: PreviewEligibilityPort
    audit: AuditPort

    async def issue_handoff(
        self,
        context: SiteContext,
        *,
        post_id: str,
        initiating_admin_id: str,
        source_snapshot: str,
    ) -> tuple[str, datetime]:
        if not await self.eligibility.is_preview_eligible(context, post_id=post_id, source_snapshot=source_snapshot):
            raise Denied("preview denied")
        now = now_utc()
        raw = new_secret_token(32)
        expires = now + PREVIEW_HANDOFF_TTL
        await self.state.put_token(
            TokenRecord(
                token_hash=token_hash(raw),
                admin_id=initiating_admin_id,
                purpose="PREVIEW_HANDOFF",
                issued_at=now,
                expires_at=expires,
                site_id=context.site_id,
                post_id=post_id,
                metadata={
                    "canonical_domain": context.canonical_domain,
                    "source_snapshot": source_snapshot,
                },
            )
        )
        return raw, expires

    async def exchange_handoff(
        self,
        raw_handoff: str,
        *,
        site_id: str,
        post_id: str,
        request_host: str,
    ) -> tuple[str, datetime]:
        now = now_utc()
        digest = token_hash(raw_handoff)
        record = await self.state.get_token(digest, "PREVIEW_HANDOFF", now)
        if record is None or record.site_id != site_id or record.post_id != post_id:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        expected_host = record.metadata.get("canonical_domain")
        try:
            observed_host = normalize_host(request_host)
            canonical_host = normalize_host(expected_host or "")
        except Exception:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        if observed_host != canonical_host:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        site = await self.sites.get_site_by_id(site_id)
        if site is None or not site.public_eligible:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        context = SiteContext(
            kind=context_kind_preview(),
            site_id=site.site_id,
            site_key=site.site_key,
            site_status=site.lifecycle,
            canonical_domain=site.canonical_domain,
            context_source=context_source_preview(),
            request_id="preview-exchange",
            request_host=observed_host,
            timezone=site.timezone,
            locale=site.locale,
            resolved_at=now,
            version_marker=site.version_marker,
        )
        if not await self.eligibility.is_preview_eligible(
            context,
            post_id=post_id,
            source_snapshot=record.metadata.get("source_snapshot"),
        ):
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        consumed = await self.state.consume_token(digest, "PREVIEW_HANDOFF", now)
        if consumed is None:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        raw_session = new_secret_token(32)
        expires = now + PREVIEW_SESSION_TTL
        await self.state.put_token(
            TokenRecord(
                token_hash=token_hash(raw_session),
                admin_id=record.admin_id,
                purpose="PREVIEW_SESSION",
                issued_at=now,
                expires_at=expires,
                site_id=site_id,
                post_id=post_id,
                metadata={
                    "canonical_domain": canonical_host,
                    "source_snapshot": record.metadata.get("source_snapshot", ""),
                },
            )
        )
        return raw_session, expires

    async def validate(
        self,
        raw_credential: str,
        *,
        site_id: str,
        post_id: str,
        request_host: str,
    ) -> str:
        now = now_utc()
        record = await self.state.get_token(token_hash(raw_credential), "PREVIEW_SESSION", now)
        try:
            observed_host = normalize_host(request_host)
        except Exception:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        if (
            record is None
            or record.site_id != site_id
            or record.post_id != post_id
            or record.metadata.get("canonical_domain", "") != observed_host
        ):
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        site = await self.sites.get_site_by_id(site_id)
        if site is None or not site.public_eligible:
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        from bp_domain.context import ContextKind, ContextSource

        context = SiteContext(
            kind=ContextKind.PREVIEW_SITE,
            site_id=site.site_id,
            site_key=site.site_key,
            site_status=site.lifecycle,
            canonical_domain=site.canonical_domain,
            context_source=ContextSource.PREVIEW,
            request_id="preview-read",
            request_host=observed_host,
            timezone=site.timezone,
            locale=site.locale,
            resolved_at=now,
            version_marker=site.version_marker,
        )
        source_snapshot = record.metadata.get("source_snapshot") or None
        if not await self.eligibility.is_preview_eligible(
            context,
            post_id=post_id,
            source_snapshot=source_snapshot,
        ):
            await self.audit.append("SEC.PREVIEW.DENIED", actor_admin_id=None, site_id=site_id, details={})
            raise Unauthenticated("preview authority required")
        if source_snapshot is None:
            # PREVIEW_SESSION records are always issued from a source-bound handoff.
            # Fail closed rather than allowing a projection to guess committed content.
            raise Unauthenticated("preview authority required")
        return source_snapshot


def context_kind_preview():
    from bp_domain.context import ContextKind

    return ContextKind.PREVIEW_SITE


def context_source_preview():
    from bp_domain.context import ContextSource

    return ContextSource.PREVIEW
