from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
import os

from fastapi import APIRouter, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response

from bp_adapters.mail import RecordingMailAdapter
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.security_store import InMemorySecurityStateStore, InMemorySecurityThrottle, LimitPolicy
from bp_application import (
    AuthService,
    AuthorizationService,
    PasswordCodec,
    PasswordPolicy,
    GlobalPlatformService,
    PublicPageService,
    SessionAuthority,
    SetWeakPasswordChecker,
    TrustedContextService,
)
from bp_domain.errors import SecurityFault

from .bootstrap.defaults import (
    NullAudit,
    UnavailableGlobalOperations,
    UnavailableIdentities,
    UnavailablePublicPages,
    UnavailableSites,
)
from .composition import Services
from .config import Settings
from .http.admin_global import register as register_global
from .http.admin_site import router as admin_site_router
from .http.auth import router as auth_router
from .http.contract import assert_rc10_contract, load_openapi, operation_index, owned_operations
from .http.errors import generic_error_handler, request_validation_handler, security_fault_handler
from .http.middleware import RequestSecurityMiddleware
from .http.public import router as public_router
from .http.site import build_router as build_editorial_router

SECURITY_ABUSE_POLICIES = {
    "SEC_LOGIN_ACCOUNT": LimitPolicy(5, 15 * 60),
    "SEC_LOGIN_IP": LimitPolicy(20, 15 * 60),
    "SEC_MFA_CHALLENGE": LimitPolicy(5, 5 * 60),
    "SEC_MFA_IP": LimitPolicy(20, 15 * 60),
    "SEC_RESET_ACCOUNT": LimitPolicy(3, 60 * 60),
    "SEC_RESET_IP": LimitPolicy(10, 60 * 60),
    "SEC_TOKEN_IP": LimitPolicy(10, 60 * 60),
    "SEC_PREVIEW_IP": LimitPolicy(10, 10 * 60),
    "SEC_STEPUP": LimitPolicy(5, 10 * 60),
}


def _transport_policies(spec: dict) -> dict[str, LimitPolicy]:
    classes = spec.get("components", {}).get("x-rate-limit-classes", {})
    if not classes:
        raise RuntimeError("canonical RC10 transport rate-limit registry is missing")
    return {
        class_id: LimitPolicy(int(raw["limit"]), int(raw["window_seconds"]))
        for class_id, raw in classes.items()
    }


def default_services(settings: Settings, spec: dict) -> Services:
    # DOC-19 requires shared multi-instance security state and managed secrets in
    # production. Silent fallback to process-local state is prohibited.
    if settings.environment not in {"development", "test"}:
        raise RuntimeError("production/staging requires explicitly injected security, persistence, secret, audit, and mail adapters")

    sites = UnavailableSites()
    identities = UnavailableIdentities()
    security = InMemorySecurityStateStore()
    audit = NullAudit()
    contexts = TrustedContextService(sites)
    authorization = AuthorizationService(identities)
    sessions = SessionAuthority(security, identities, audit)
    auth = AuthService(
        identities,
        security,
        LocalEnvelopeSecretProvider(),
        audit,
        RecordingMailAdapter(),
        PasswordPolicy(SetWeakPasswordChecker(set())),
        PasswordCodec(),
        require_mfa_on_login=settings.environment not in {"development", "test"},
    )
    transport = InMemorySecurityThrottle(_transport_policies(spec))
    abuse = InMemorySecurityThrottle(SECURITY_ABUSE_POLICIES)
    return Services(
        contexts=contexts,
        authorization=authorization,
        sessions=sessions,
        auth=auth,
        public_pages=PublicPageService(UnavailablePublicPages()),
        global_operations=GlobalPlatformService(
            UnavailableGlobalOperations(),
            auth,
            settings.invitation_setup_base_url,
        ),
        audit=audit,
        transport_throttle=transport,
        security_abuse=abuse,
    )


def create_app(*, settings: Settings | None = None, services: Services | None = None) -> FastAPI:
    settings = settings or Settings.from_env()
    spec_path = Path(settings.canonical_openapi_path)
    if not spec_path.exists():
        root = Path(__file__).resolve().parents[4]
        candidate = root / settings.canonical_openapi_path
        if candidate.exists():
            spec_path = candidate
    spec = load_openapi(spec_path)
    assert_rc10_contract(spec)

    if services is not None:
        resolved_services = services
    elif os.getenv("BP_RUNTIME_COMPOSITION") == "two-site-e2e":
        from .composition.two_site_e2e import build_two_site_e2e_services
        resolved_services = build_two_site_e2e_services(settings, spec)
    elif os.getenv("BP_RUNTIME_COMPOSITION") == "self-hosted":
        from .composition.self_hosted import build_self_hosted_services
        resolved_services = build_self_hosted_services(settings, spec)
    elif settings.environment in {"staging", "production"}:
        from .composition.production import build_production_services
        resolved_services = build_production_services(settings, spec)
    else:
        resolved_services = default_services(settings, spec)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        started = []
        try:
            for resource in resolved_services.lifecycle:
                await resource.start()
                started.append(resource)
            yield
        finally:
            for resource in reversed(started):
                await resource.close()

    class Chat03CompatibleFastAPI(FastAPI):
        @property
        def routes(self):
            try:
                from fastapi.routing import iter_route_contexts
            except ImportError:
                return list(super().routes)

            flattened = []
            for context in iter_route_contexts(super().routes):
                route = getattr(context, "route", None)
                if route is None and hasattr(context, "path"):
                    route = context
                if route is not None:
                    flattened.append(route)
            return flattened

    app = Chat03CompatibleFastAPI(
        title="Multi-Site Blogging Platform API",
        version="1.0-RC10",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.canonical_openapi = spec
    if resolved_services.transport_throttle is None:
        if settings.environment not in {"development", "test"}:
            raise RuntimeError("shared transport throttle is required outside development/test")
        resolved_services.transport_throttle = InMemorySecurityThrottle(_transport_policies(spec))
    if resolved_services.security_abuse is None:
        if settings.environment not in {"development", "test"}:
            raise RuntimeError("shared security-abuse state is required outside development/test")
        resolved_services.security_abuse = InMemorySecurityThrottle(SECURITY_ABUSE_POLICIES)
    app.state.services = resolved_services
    app.state.chat04_editorial = resolved_services.editorial_transport
    app.state.operation_index = operation_index(spec)

    app.add_exception_handler(SecurityFault, security_fault_handler)
    app.add_exception_handler(RequestValidationError, request_validation_handler)
    app.add_exception_handler(Exception, generic_error_handler)
    app.add_middleware(
        RequestSecurityMiddleware,
        admin_origins=settings.admin_origins,
        enforce_https=settings.enforce_https,
        hsts_include_subdomains=settings.hsts_include_subdomains,
    )

    app.include_router(public_router)
    app.include_router(auth_router)
    app.include_router(admin_site_router)
    app.include_router(build_editorial_router(spec))
    global_router = APIRouter()
    register_global(
        global_router,
        spec,
        [op for op in owned_operations(spec) if op.operation_id.startswith("API15-G-")],
    )
    app.include_router(global_router)

    @app.get("/m/{site_key}/{media_id}/{variant_key}.{extension}", include_in_schema=False)
    async def self_hosted_media(site_key: str, media_id: str, variant_key: str, extension: str, request: Request):
        delivery = resolved_services.media_delivery
        if delivery is None:
            return Response(status_code=404, headers={"Cache-Control": "no-store"})
        preview_grant = request.query_params.get("preview_grant")
        admin_grant = request.query_params.get("admin_grant")
        private_authorized = False
        if preview_grant and admin_grant:
            return Response(status_code=404, headers={"Cache-Control": "no-store"})
        if preview_grant:
            validator = resolved_services.preview_authority
            try:
                private_authorized = bool(
                    validator
                    and len(preview_grant) <= 512
                    and await validator.validate_media_grant(
                        preview_grant,
                        site_key=site_key,
                        media_id=media_id,
                    )
                )
                if not private_authorized:
                    return Response(status_code=404, headers={"Cache-Control": "no-store"})
            except Exception:
                return Response(status_code=404, headers={"Cache-Control": "no-store"})
        elif admin_grant:
            try:
                private_authorized = bool(
                    len(admin_grant) <= 512
                    and await resolved_services.sessions.validate_media_grant(
                        admin_grant,
                        site_key=site_key,
                        media_id=media_id,
                    )
                )
                if not private_authorized:
                    return Response(status_code=404, headers={"Cache-Control": "no-store"})
            except Exception:
                return Response(status_code=404, headers={"Cache-Control": "no-store"})
        try:
            item = await delivery.get(
                site_key=site_key,
                media_id=media_id,
                variant_key=variant_key,
                extension=extension,
                request_id=request.headers.get("x-request-id", "media-delivery"),
                preview_authorized=private_authorized,
            )
        except Exception:
            return Response(status_code=503, headers={"Cache-Control": "no-store"})
        if item is None:
            return Response(status_code=404, headers={"Cache-Control": "no-store"})
        cache_control = (
            "no-store, private"
            if private_authorized
            else "public, max-age=31536000, immutable"
        )
        if request.headers.get("if-none-match") == f'"{item.etag}"':
            return Response(
                status_code=304,
                headers={"Cache-Control": cache_control, "ETag": f'"{item.etag}"'},
            )
        return Response(
            content=item.body,
            media_type=item.content_type,
            headers={
                "Cache-Control": cache_control,
                "ETag": f'"{item.etag}"',
                "X-Content-Type-Options": "nosniff",
            },
        )

    @app.get("/health/live", include_in_schema=False)
    async def live():
        return {"status": "ok"}

    @app.get("/health/ready", include_in_schema=False)
    async def ready():
        checker = resolved_services.readiness
        if checker is None:
            return JSONResponse({"status": "not_ready", "components": {}}, status_code=503)
        is_ready, components = await checker.check()
        payload = {"status": "ok" if is_ready else "not_ready", "components": components}
        return JSONResponse(payload, status_code=200 if is_ready else 503)

    return app
