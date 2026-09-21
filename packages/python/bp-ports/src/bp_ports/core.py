from __future__ import annotations

from contextlib import AbstractAsyncContextManager
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol

from bp_domain.context import GlobalContext, SiteContext, SiteRecord
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.security import AdminPrincipal, CredentialRecord, MfaRecord, SessionRecord, StepUpRecord, TokenRecord


class SiteRegistryPort(Protocol):
    async def resolve_host(self, normalized_host: str) -> SiteRecord | None: ...
    async def get_site_by_key(self, site_key: str) -> SiteRecord | None: ...
    async def get_site_by_id(self, site_id: str) -> SiteRecord | None: ...
    async def list_sites(self) -> list[SiteRecord]: ...


class IdentityAuthorizationPort(Protocol):
    async def get_principal(self, admin_id: str) -> AdminPrincipal | None: ...
    async def find_principal_by_email(self, normalized_email: str) -> AdminPrincipal | None: ...
    async def credential_verifier(self, admin_id: str) -> str | None: ...
    async def set_credential_verifier(self, admin_id: str, verifier: str) -> None: ...
    async def activate_invited_admin(self, admin_id: str) -> None: ...


class SecurityStateStorePort(Protocol):
    async def put_credential(self, record: CredentialRecord) -> None: ...
    async def get_credential(self, admin_id: str) -> CredentialRecord | None: ...
    async def delete_credential(self, admin_id: str) -> None: ...
    async def put_session(self, record: SessionRecord) -> None: ...
    async def get_session(self, session_id_hash: str) -> SessionRecord | None: ...
    async def touch_session(self, session_id_hash: str, *, last_seen_at: datetime, idle_expires_at: datetime) -> None: ...
    async def revoke_session(self, session_id_hash: str, reason: str) -> None: ...
    async def revoke_all_sessions(self, admin_id: str, reason: str, except_hash: str | None = None) -> None: ...
    async def put_token(self, record: TokenRecord) -> None: ...
    async def get_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None: ...
    async def consume_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None: ...
    async def transition_token(
        self, token_hash: str, purpose: str, *, from_phase: str, to_phase: str, now: datetime
    ) -> TokenRecord | None: ...
    async def invalidate_tokens(self, admin_id: str, purpose: str) -> None: ...
    async def get_mfa(self, admin_id: str) -> MfaRecord | None: ...
    async def put_mfa(self, record: MfaRecord) -> None: ...
    async def advance_mfa_step(self, admin_id: str, accepted_step: int) -> bool: ...
    async def consume_recovery_hash(self, admin_id: str, recovery_hash: str) -> bool: ...
    async def put_step_up(self, record: StepUpRecord) -> None: ...
    async def get_step_up(self, session_id_hash: str, level: str, now: datetime) -> StepUpRecord | None: ...
    async def revoke_step_ups(self, admin_id: str) -> None: ...


class SecretProviderPort(Protocol):
    async def encrypt(self, plaintext: bytes, purpose: str) -> bytes: ...
    async def decrypt(self, ciphertext: bytes, purpose: str) -> bytes: ...
    async def hmac_digest(self, value: bytes, purpose: str) -> str: ...


class MailPort(Protocol):
    async def send(self, recipient: str, subject: str, text: str) -> None: ...


class AuditPort(Protocol):
    async def append(
        self,
        event_code: str,
        *,
        actor_admin_id: str | None,
        site_id: str | None,
        details: dict[str, Any],
    ) -> None: ...


class PublicPagePort(Protocol):
    async def resolve_page(
        self,
        context: SiteContext,
        *,
        path: str,
        q: str | None,
        page: int,
        page_size: int,
    ) -> tuple[int, dict[str, Any], dict[str, str]]: ...

    async def resolve_preview(
        self, context: SiteContext, *, post_id: str, source_snapshot: str
    ) -> dict[str, Any]: ...


class AdminSiteContextPayloadPort(Protocol):
    async def build(self, principal: AdminPrincipal, context: SiteContext) -> dict[str, Any]: ...


class SiteDashboardPayloadPort(Protocol):
    async def build(self, principal: AdminPrincipal, context: SiteContext) -> dict[str, Any]: ...


class PreviewEligibilityPort(Protocol):
    async def is_preview_eligible(self, context: SiteContext, *, post_id: str, source_snapshot: str | None = None) -> bool: ...


class PreviewAuthorityPort(Protocol):
    async def validate(
        self,
        raw_credential: str,
        *,
        site_id: str,
        post_id: str,
        request_host: str,
    ) -> str: ...


class GlobalOperationsPort(Protocol):
    async def execute(
        self,
        operation_id: str,
        *,
        principal: AdminPrincipal,
        context: GlobalContext,
        path_params: dict[str, Any],
        query: dict[str, Any],
        body: Any,
        headers: dict[str, str],
    ) -> tuple[int, Any, dict[str, str]]: ...

    async def compensate_created_admin(self, admin_id: str) -> None: ...


class SiteTransactionPort(Protocol):
    """CHAT02 integration seam for BEGIN -> SET LOCAL app.site_id -> SQL -> end."""

    def transaction(self, context: SiteContext) -> AbstractAsyncContextManager[Any]: ...


class GlobalTransactionPort(Protocol):
    """Explicit privileged transaction seam; never selected because site context is missing."""

    def transaction(self, context: GlobalContext) -> AbstractAsyncContextManager[Any]: ...


class DownstreamEffectsPort(Protocol):
    async def emit(self, effect: SiteEffectEnvelope) -> None: ...


class LifecyclePort(Protocol):
    """Explicit process resource lifecycle used by API composition only."""

    async def start(self) -> None: ...
    async def close(self) -> None: ...


class ReadinessPort(Protocol):
    """Safe critical-dependency readiness projection; never returns secrets."""

    async def check(self) -> tuple[bool, dict[str, str]]: ...


@dataclass(frozen=True, slots=True)
class RateLimitDecision:
    allowed: bool
    limit: int
    remaining: int
    reset_seconds: int
    retry_after_seconds: int | None = None


class SecurityThrottlePort(Protocol):
    async def check(
        self,
        *,
        class_id: str,
        actor_key: str,
        request_id: str,
    ) -> RateLimitDecision: ...

class SecurityAbusePort(Protocol):
    """DOC-19 failure/cooldown state without weakening DOC-15 transport quotas.

    `peek` never increments state; `record_failure` atomically records one
    security failure. The implementation must be shared in production.
    """

    async def peek(
        self,
        *,
        class_id: str,
        actor_key: str,
        request_id: str,
    ) -> RateLimitDecision: ...

    async def record_failure(
        self,
        *,
        class_id: str,
        actor_key: str,
        request_id: str,
    ) -> RateLimitDecision: ...
