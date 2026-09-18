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
        if principal.is_super_admin:
            return
        if not principal.global_permissions:
            raise Denied("permission denied")
        if permissions and not permissions.issubset(principal.global_permissions):
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
