from __future__ import annotations

from asyncio import Lock
from dataclasses import replace
from datetime import UTC, datetime

from bp_domain.security import CredentialRecord, MfaRecord, SessionRecord, StepUpRecord, TokenRecord


class InMemorySecurityStateStore:
    """Atomic local/test adapter for DOC-19 logical security state.

    This adapter is deliberately process-local and therefore is not a production
    multi-replica store. Production must bind a shared conditional-TTL adapter.
    """

    def __init__(self) -> None:
        self.credentials: dict[str, CredentialRecord] = {}
        self.sessions: dict[str, SessionRecord] = {}
        self.tokens: dict[tuple[str, str], TokenRecord] = {}
        self.mfa: dict[str, MfaRecord] = {}
        self.stepups: list[StepUpRecord] = []
        self._lock = Lock()

    async def put_credential(self, record: CredentialRecord) -> None:
        async with self._lock:
            self.credentials[record.admin_id] = replace(record, params=dict(record.params))

    async def get_credential(self, admin_id: str) -> CredentialRecord | None:
        record = self.credentials.get(admin_id)
        return replace(record, params=dict(record.params)) if record is not None else None

    async def put_session(self, record: SessionRecord) -> None:
        async with self._lock:
            self.sessions[record.session_id_hash] = replace(record)

    async def get_session(self, session_id_hash: str) -> SessionRecord | None:
        record = self.sessions.get(session_id_hash)
        return replace(record) if record is not None else None

    async def touch_session(self, session_id_hash: str, *, last_seen_at: datetime, idle_expires_at: datetime) -> None:
        async with self._lock:
            record = self.sessions.get(session_id_hash)
            if record is not None and record.revoked_at is None:
                record.last_seen_at = last_seen_at
                record.idle_expires_at = idle_expires_at

    async def revoke_session(self, session_id_hash: str, reason: str) -> None:
        async with self._lock:
            record = self.sessions.get(session_id_hash)
            if record is not None and record.revoked_at is None:
                record.revoked_at = datetime.now(UTC)
                record.revoke_reason = reason

    async def revoke_all_sessions(self, admin_id: str, reason: str, except_hash: str | None = None) -> None:
        async with self._lock:
            now = datetime.now(UTC)
            for key, record in self.sessions.items():
                if record.admin_id == admin_id and key != except_hash and record.revoked_at is None:
                    record.revoked_at = now
                    record.revoke_reason = reason

    async def put_token(self, record: TokenRecord) -> None:
        async with self._lock:
            self.tokens[(record.purpose, record.token_hash)] = replace(record, metadata=dict(record.metadata))

    async def get_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None:
        record = self.tokens.get((purpose, token_hash))
        if record is None or record.consumed_at is not None or now >= record.expires_at:
            return None
        return replace(record, metadata=dict(record.metadata))

    async def consume_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None:
        async with self._lock:
            record = self.tokens.get((purpose, token_hash))
            if record is None or record.consumed_at is not None or now >= record.expires_at:
                return None
            record.consumed_at = now
            return replace(record, metadata=dict(record.metadata))

    async def transition_token(
        self, token_hash: str, purpose: str, *, from_phase: str, to_phase: str, now: datetime
    ) -> TokenRecord | None:
        async with self._lock:
            record = self.tokens.get((purpose, token_hash))
            if (
                record is None
                or record.consumed_at is not None
                or now >= record.expires_at
                or record.metadata.get("phase", "ISSUED") != from_phase
            ):
                return None
            record.metadata["phase"] = to_phase
            return replace(record, metadata=dict(record.metadata))

    async def invalidate_tokens(self, admin_id: str, purpose: str) -> None:
        async with self._lock:
            now = datetime.now(UTC)
            for (token_purpose, _), record in self.tokens.items():
                if token_purpose == purpose and record.admin_id == admin_id and record.consumed_at is None:
                    record.consumed_at = now

    async def get_mfa(self, admin_id: str) -> MfaRecord | None:
        record = self.mfa.get(admin_id)
        if record is None:
            return None
        return replace(record, recovery_hashes=set(record.recovery_hashes))

    async def put_mfa(self, record: MfaRecord) -> None:
        async with self._lock:
            self.mfa[record.admin_id] = replace(record, recovery_hashes=set(record.recovery_hashes))

    async def advance_mfa_step(self, admin_id: str, accepted_step: int) -> bool:
        async with self._lock:
            record = self.mfa.get(admin_id)
            if record is None:
                return False
            if record.last_accepted_step is not None and accepted_step <= record.last_accepted_step:
                return False
            record.last_accepted_step = accepted_step
            return True

    async def consume_recovery_hash(self, admin_id: str, recovery_hash: str) -> bool:
        async with self._lock:
            record = self.mfa.get(admin_id)
            if record is None or recovery_hash not in record.recovery_hashes:
                return False
            record.recovery_hashes.remove(recovery_hash)
            return True

    async def put_step_up(self, record: StepUpRecord) -> None:
        async with self._lock:
            self.stepups.append(replace(record))

    async def get_step_up(self, session_id_hash: str, level: str, now: datetime) -> StepUpRecord | None:
        levels = {"L1": {"L1", "L2"}, "L2": {"L2"}}.get(level, {level})
        candidates = [
            record
            for record in self.stepups
            if record.session_id_hash == session_id_hash
            and record.level.value in levels
            and record.revoked_at is None
            and now < record.expires_at
        ]
        return replace(max(candidates, key=lambda item: item.issued_at)) if candidates else None

    async def revoke_step_ups(self, admin_id: str) -> None:
        async with self._lock:
            now = datetime.now(UTC)
            for record in self.stepups:
                if record.admin_id == admin_id and record.revoked_at is None:
                    record.revoked_at = now
