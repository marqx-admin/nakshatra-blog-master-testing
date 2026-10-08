from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from bp_domain.context import ContextKind, ContextSource, GlobalContext, SiteContext
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.security import AccountState, AdminPrincipal, Unauthenticated, ValidationFault
from bp_ports import DownstreamEffectsPort, GlobalOperationsPort

from .context import TrustedContextService
from .security import AuthService

logger = logging.getLogger(__name__)


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
    downstream: DownstreamEffectsPort | None = None
    site_contexts: TrustedContextService | None = None

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

        backend_body = body
        create_password: str | None = None
        if operation_id == "API15-G-031":
            if not isinstance(body, dict):
                raise ValidationFault("request validation failed")
            email = body.get("email")
            password = body.get("password")
            if not isinstance(email, str) or not isinstance(password, str):
                raise ValidationFault("request validation failed")
            self.auth.validate_new_admin_password(email, password)
            create_password = password
            backend_body = {key: value for key, value in body.items() if key != "password"}

        status, payload, response_headers = await self.backend.execute(
            operation_id,
            principal=principal,
            context=context,
            path_params=path_params,
            query=query,
            body=backend_body,
            headers=headers,
        )

        # API15-G-031 persists a non-super-admin identity and its SITE access in
        # one PostgreSQL transaction. Security state receives only an Argon2id
        # verifier, then the identity becomes immediately login-ready.
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
            try:
                await self.auth.provision_created_admin(admin_id, email, create_password or "")
            except Exception:
                await self.backend.compensate_created_admin(admin_id)
                raise
            _, payload, response_headers = await self.backend.execute(
                "API15-G-032",
                principal=principal,
                context=context,
                path_params={"admin_user_id": admin_id},
                query={},
                body=None,
                headers=headers,
            )
            status = 201

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

        effect_type = {
            "API15-G-014": "SITE_ENABLE",
            "API15-G-015": "SITE_DISABLE",
            "API15-G-016": "SITE_ARCHIVE",
            "API15-G-019": "DOMAIN_CHANGE",
            "API15-G-020": "DOMAIN_CHANGE",
            "API15-G-021": "DOMAIN_CHANGE",
            "API15-G-022": "DOMAIN_CHANGE",
        }.get(operation_id)
        site_key = path_params.get("site_key")
        if (
            effect_type
            and 200 <= status < 300
            and isinstance(site_key, str)
            and self.downstream
            and self.site_contexts
        ):
            try:
                record = await self.site_contexts.sites.get_site_by_key(site_key)
                if record is None:
                    raise RuntimeError("committed site missing during effect enqueue")
                site = SiteContext(
                    kind=ContextKind.ADMIN_SITE,
                    site_id=record.site_id,
                    site_key=record.site_key,
                    site_status=record.lifecycle,
                    canonical_domain=record.canonical_domain,
                    context_source=ContextSource.ADMIN_SELECTION,
                    request_id=headers.get("x-request-id") or context.request_id,
                )
                await self.downstream.emit(
                    SiteEffectEnvelope(
                        effect_type=effect_type,
                        context=site,
                        entity_type="SITE",
                        entity_id=site.site_id,
                        correlation_id=site.request_id,
                        payload={},
                    )
                )
            except Exception:
                logger.exception(
                    "post-commit site effect enqueue failed",
                    extra={"operation_id": operation_id, "site_key": site_key},
                )

        return status, payload, response_headers
