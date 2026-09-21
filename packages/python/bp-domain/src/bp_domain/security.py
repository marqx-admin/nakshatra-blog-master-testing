from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum

from .errors import *


class AccountState(StrEnum):
    INVITED = "INVITED"
    ACTIVE = "ACTIVE"
    DISABLED = "DISABLED"


class StepUpLevel(StrEnum):
    L0 = "L0"
    L1 = "L1"
    L2 = "L2"
    L3 = "L3"


@dataclass(frozen=True, slots=True)
class AdminPrincipal:
    admin_id: str
    email: str
    state: AccountState
    is_super_admin: bool = False
    mfa_enabled: bool = False
    global_permissions: frozenset[str] = field(default_factory=frozenset)
    site_permissions: dict[str, frozenset[str]] = field(default_factory=dict)
    display_name: str | None = None
    site_access_levels: dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class CredentialRecord:
    """DOC-19 logical credential state stored outside DOC-08 PostgreSQL."""

    admin_id: str
    password_verifier: str
    algorithm: str
    params: dict[str, int]
    changed_at: datetime


@dataclass(slots=True)
class SessionRecord:
    session_id_hash: str
    admin_id: str
    created_at: datetime
    last_seen_at: datetime
    idle_expires_at: datetime
    absolute_expires_at: datetime
    authn_strength: str
    csrf_secret_hash: str
    mfa_verified_at: datetime | None = None
    revoked_at: datetime | None = None
    revoke_reason: str | None = None


@dataclass(slots=True)
class TokenRecord:
    token_hash: str
    admin_id: str
    purpose: str
    expires_at: datetime
    issued_at: datetime | None = None
    consumed_at: datetime | None = None
    site_id: str | None = None
    post_id: str | None = None
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass(slots=True)
class MfaRecord:
    admin_id: str
    encrypted_secret: bytes
    enabled: bool = False
    enabled_at: datetime | None = None
    last_accepted_step: int | None = None
    recovery_hashes: set[str] = field(default_factory=set)


@dataclass(slots=True)
class StepUpRecord:
    proof_id_hash: str
    admin_id: str
    session_id_hash: str
    level: StepUpLevel
    issued_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None
