from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bp_domain.context import ContextKind, GlobalContext
from bp_domain.security import AccountState, AdminPrincipal, Unauthenticated, ValidationFault
from bp_ports import GlobalOperationsPort

from .security import AuthService


@dataclass(slots=True)
class GlobalPlatformService:
    """CHAT03 GLOBAL application orchestration around the persistence/service port.

    HTTP transport owns canonical schema/status validation and exact permissions.
    This layer preserves explicit GLOBAL context and performs DOC-19 identity
    security side effects that must follow successful GLOBAL mutations.
    """

    backend: GlobalOperationsPort
    auth: AuthService
    invitation_setup_base_url: str

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
    ) -> tuple[int, Any, dict[str, str]]:
        if context.kind is not ContextKind.GLOBAL:
            raise ValidationFault("explicit global context required")
        if principal.state is not AccountState.ACTIVE:
            raise Unauthenticated("authentication required")

        status, payload, response_headers = await self.backend.execute(
            operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=body,
            headers=headers,
        )

        # API15-G-031 creates the INVITED identity/assignments in canonical
        # persistence. DOC-19 then owns the one-time setup authority/delivery.
        if operation_id == "API15-G-031" and status == 201:
            resource = (payload or {}).get("admin_user") if isinstance(payload, dict) else None
            if not isinstance(resource, dict):
                raise RuntimeError("API15-G-031 backend did not return canonical AdminUserResponse")
            if resource.get("state") != "INVITED":
                raise RuntimeError("API15-G-031 must create an INVITED account")
            admin_id = resource.get("admin_user_id")
            email = resource.get("email")
            if not isinstance(admin_id, str) or not isinstance(email, str):
                raise RuntimeError("API15-G-031 response lacks invited identity")
            await self.auth.issue_invitation(
                admin_id,
                email,
                setup_base_url=self.invitation_setup_base_url,
                actor_admin_id=principal.admin_id,
            )

        # Disabled accounts must not regain authority later through an old
        # session if the account is subsequently re-enabled.
        if operation_id == "API15-G-035" and 200 <= status < 300:
            target_admin_id = path_params.get("admin_user_id")
            if isinstance(target_admin_id, str):
                await self.auth.revoke_account_security_state(
                    target_admin_id,
                    reason="ACCOUNT_DISABLED",
                    actor_admin_id=principal.admin_id,
                )

        return status, payload, response_headers
