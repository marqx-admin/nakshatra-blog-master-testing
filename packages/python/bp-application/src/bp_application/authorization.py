from __future__ import annotations

from dataclasses import dataclass

from bp_domain.security import AccountState, AdminPrincipal, Denied, Unauthenticated
from bp_ports import IdentityAuthorizationPort


@dataclass(slots=True)
class AuthorizationService:
    identities: IdentityAuthorizationPort

    async def fresh_principal(self, admin_id: str) -> AdminPrincipal:
        principal = await self.identities.get_principal(admin_id)
        if principal is None or principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        return principal

    @staticmethod
    def require_global(principal: AdminPrincipal, permissions: set[str]) -> None:
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        # Launch authority has exactly one GLOBAL principal: the designated
        # Super Admin.  Legacy GLOBAL role rows must never elevate an ordinary
        # account, even if they pre-date the protected access-level model.
        if principal.is_super_admin:
            return
        raise Denied("permission denied")

    @staticmethod
    def require_site(principal: AdminPrincipal, site_key: str, permissions: set[str]) -> None:
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")
        if principal.is_super_admin:
            return
        effective = principal.site_permissions.get(site_key)
        if effective is None or not permissions.issubset(effective):
            raise Denied("permission denied")

    @staticmethod
    def site_access_level(principal: AdminPrincipal, site_key: str) -> str | None:
        if principal.is_super_admin:
            return "SUPER_ADMIN"
        projected = principal.site_access_levels.get(site_key)
        if projected in {"CONTENT_EDITOR", "FULL_WEBSITE_MANAGER"}:
            return projected
        effective = principal.site_permissions.get(site_key)
        if effective is None:
            return None
        # Compatibility for principals produced by older/fake adapters.  Both
        # marker permissions are exclusive to the protected Manager bundle.
        if {"posts.delete", "site_settings.edit"}.issubset(effective):
            return "FULL_WEBSITE_MANAGER"
        return "CONTENT_EDITOR"

    @classmethod
    def require_site_manager(cls, principal: AdminPrincipal, site_key: str) -> None:
        if cls.site_access_level(principal, site_key) not in {"SUPER_ADMIN", "FULL_WEBSITE_MANAGER"}:
            raise Denied("permission denied")
