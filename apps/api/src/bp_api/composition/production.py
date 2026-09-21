from __future__ import annotations

import asyncio
from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urlsplit, urlunsplit

from sqlalchemy import text

from bp_application import (
    AuthService, AuthorizationService, GlobalPlatformService, PasswordCodec,
    PasswordPolicy, PreviewAuthorityService, PublicPageService, SessionAuthority,
    SetWeakPasswordChecker, TrustedContextService,
)
from bp_application.editorial import EditorialApplication, EditorialPreviewEligibility
from bp_application import DerivedSiteOperationsService
from bp_application.media import MediaService
from bp_application.redirects import RedirectService
from bp_application.search_admin import SearchAdminService
from bp_application.seo import SeoAdminService
from bp_adapters.mail import SmtpMailAdapter
from bp_adapters_media import VipsMediaProcessor
from bp_adapters_object_storage import S3CompatibleObjectStorageAdapter
from bp_adapters.postgres import (
    PoolBudget, PostgresAdminSiteContextPayload, PostgresAuditAdapter,
    PostgresDerivedSource, PostgresIdentityAuthorization, PostgresPublicPageAdapter,
    PostgresSiteDashboardPayload, PostgresSiteRegistry, PostgresSiteTransactionPort,
    create_platform_engine, create_site_engine, validate_api_replica_pool_budget,
)
from bp_adapters.postgres.editorial import PostgresEditorialRepository
from bp_adapters_queue import CeleryRedisQueueAdapter, DerivedEffectsAdapter, Doc18Producer, create_celery_broker_client
from bp_adapters.redis import RedisControlAdapter, RedisRequestIdempotencyAdapter
from bp_adapters_search import OpenSearchAdapter
from bp_adapters.secrets import VaultTransitSecretProvider
from bp_adapters.security_store import DynamoSecurityStateStore, DynamoSecurityThrottle
from bp_domain.editorial import validate_embed_provider_registry

from ..config import Settings
from ..config.settings import ProductionRuntimeSettings
from ..http.site.routes import EditorialTransportServices
from .global_postgres import PostgresGlobalOperations
from .derived_postgres import PostgresDerivedAdminRepository
from .services import Services


@dataclass(slots=True)
class _ResourceLifecycle:
    site_engine: Any
    platform_engine: Any
    redis_control: Any
    redis_broker: Any
    celery_app: Any

    async def start(self) -> None:
        return None

    async def close(self) -> None:
        for client in (self.redis_control, self.redis_broker):
            close = getattr(client, "aclose", None)
            if close is not None:
                await close()
        close_celery = getattr(self.celery_app, "close", None)
        if close_celery is not None:
            close_celery()
        self.site_engine.dispose()
        self.platform_engine.dispose()


@dataclass(slots=True)
class _Readiness:
    site_engine: Any
    platform_engine: Any
    redis_control: Any
    redis_broker: Any
    opensearch: Any
    security_table: Any
    vault: VaultTransitSecretProvider

    async def check(self) -> tuple[bool, dict[str, str]]:
        components: dict[str, str] = {}
        def db(engine: Any) -> None:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
        probes = [
            ("postgres_site", lambda: asyncio.to_thread(db, self.site_engine)),
            ("postgres_platform", lambda: asyncio.to_thread(db, self.platform_engine)),
            ("redis_control", self.redis_control.ping),
            ("redis_broker", self.redis_broker.ping),
            ("opensearch", lambda: asyncio.to_thread(self.opensearch.ping)),
            ("security_state", lambda: asyncio.to_thread(self.security_table.load)),
            # Vault transit is exercised without secret disclosure using a bounded HMAC.
            ("vault", lambda: self.vault.hmac_digest(b"readiness", "api-readiness")),
        ]
        for name, factory in probes:
            try:
                result = await factory()
                if name == "opensearch" and result is False:
                    raise RuntimeError("OpenSearch ping failed")
                components[name] = "ok"
            except Exception:
                components[name] = "unavailable"
        return all(v == "ok" for v in components.values()), components



def _credential(path_value: str, *, default_username: str) -> tuple[str, str]:
    raw = Path(path_value).read_text(encoding="utf-8").strip()
    if not raw:
        raise RuntimeError(f"empty credential file: {path_value}")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        username = str(parsed.get("username") or default_username)
        password = str(parsed.get("password") or "")
    elif ":" in raw:
        username, password = raw.split(":", 1)
    else:
        username, password = default_username, raw
    if not username or not password:
        raise RuntimeError(f"invalid credential file: {path_value}")
    return username, password



def _postgres_dsn(runtime: ProductionRuntimeSettings, *, username: str, password: str) -> str:
    return (
        f"postgresql+psycopg://{quote_plus(username)}:{quote_plus(password)}@"
        f"{runtime.postgres_host}:{runtime.postgres_port}/"
        f"{quote_plus(runtime.postgres_database)}?sslmode={quote_plus(runtime.postgres_ssl_mode)}"
    )


def _redis_url(endpoint: str, password_file: str | None) -> str:
    if not password_file:
        return endpoint
    password = Path(password_file).read_text(encoding="utf-8").strip()
    parts = urlsplit(endpoint)
    if not parts.hostname:
        raise RuntimeError("invalid Redis endpoint")
    port = f":{parts.port}" if parts.port else ""
    return urlunsplit((parts.scheme, f":{quote_plus(password)}@{parts.hostname}{port}", parts.path, parts.query, parts.fragment))


def _load_embed_provider_registry(runtime: ProductionRuntimeSettings) -> dict[str, Any]:
    explicit = runtime.embed_provider_registry_file
    candidates = [Path(explicit)] if explicit else []
    for parent in Path(__file__).resolve().parents:
        candidates.append(parent / "config/content/embed-provider-registry.v1.json")
    for path in candidates:
        if path.is_file():
            return dict(validate_embed_provider_registry(json.loads(path.read_text(encoding="utf-8"))))
    raise RuntimeError("authoritative embed-provider registry is unavailable")



def _smtp_sender(settings: Settings) -> str:
    host = urlsplit(settings.invitation_setup_base_url).hostname
    if not host:
        raise RuntimeError("invitation setup base URL has no hostname for SMTP sender derivation")
    return f"noreply@{host}"


def build_production_services(settings: Settings, spec: dict[str, Any]) -> Services:
    if settings.environment not in {"staging", "production"}:
        raise RuntimeError("production composition is restricted to staging/production")
    runtime = ProductionRuntimeSettings.from_env()
    try:
        import boto3  # type: ignore
        import redis.asyncio as redis_async  # type: ignore
        from opensearchpy import OpenSearch  # type: ignore
        from opensearchpy.helpers import scan  # type: ignore
    except ImportError as exc:
        raise RuntimeError("production API provider dependencies are not materialized") from exc

    site_budget = PoolBudget(pool_size=max(1, runtime.postgres_pool_max // 2))
    platform_budget = PoolBudget(pool_size=max(1, runtime.postgres_pool_max - site_budget.pool_size))
    validate_api_replica_pool_budget(site_budget, platform_budget)
    site_user, site_password = _credential(runtime.postgres_site_credential_file, default_username="db_site_runtime")
    platform_user, platform_password = _credential(runtime.postgres_platform_credential_file, default_username="db_platform_runtime")
    site_engine = create_site_engine(
        _postgres_dsn(runtime, username=site_user, password=site_password),
        budget=site_budget,
        application_name="bp-api-site",
    )
    platform_engine = create_platform_engine(
        _postgres_dsn(runtime, username=platform_user, password=platform_password),
        budget=platform_budget,
        application_name="bp-api-platform",
    )
    site_transactions = PostgresSiteTransactionPort(site_engine)

    control_url = _redis_url(runtime.redis_control_endpoint, runtime.redis_control_password_file)
    broker_url = _redis_url(runtime.redis_broker_endpoint, runtime.redis_broker_password_file)
    if control_url == broker_url:
        raise RuntimeError("control/cache Redis and broker Redis must remain separate in staging/production")
    redis_control_client = redis_async.from_url(control_url, decode_responses=True)
    redis_broker_client = redis_async.from_url(broker_url, decode_responses=True)
    control = RedisControlAdapter(redis_control_client)
    celery_client = create_celery_broker_client(broker_url=broker_url)
    queue = CeleryRedisQueueAdapter(celery_app=celery_client, broker_redis=redis_broker_client)

    opensearch = OpenSearch(hosts=[runtime.opensearch_endpoint])
    search = OpenSearchAdapter(client=opensearch, scan=scan)

    # Staging/production use ambient AWS workload identity. No static AWS keys
    # or development endpoint override are accepted by this composition.
    dynamo = boto3.resource("dynamodb", region_name=runtime.aws_region)
    security_table = dynamo.Table(runtime.security_state_table)
    security = DynamoSecurityStateStore(table=security_table)
    from ..app import SECURITY_ABUSE_POLICIES, _transport_policies
    transport = DynamoSecurityThrottle(table=security_table, policies=_transport_policies(spec), namespace="RATE#TRANSPORT")
    abuse = DynamoSecurityThrottle(table=security_table, policies=SECURITY_ABUSE_POLICIES, namespace="RATE#SECURITY")

    # DOC-24 workload identity/Kubernetes auth provides a short-lived Vault
    # client token under the environment-specific BP_VAULT_ROLE.
    vault = VaultTransitSecretProvider(
        base_url=runtime.vault_addr,
        role=runtime.vault_role,
    )

    smtp_username, smtp_password = _credential(runtime.smtp_credential_file, default_username="")
    mail = SmtpMailAdapter(
        host=runtime.smtp_host,
        port=runtime.smtp_port,
        sender=_smtp_sender(settings),
        username=smtp_username or None,
        password=smtp_password or None,
        starttls=True,
    )

    sites = PostgresSiteRegistry(site_engine)
    identities = PostgresIdentityAuthorization(platform_engine)
    audit = PostgresAuditAdapter(platform_engine)
    contexts = TrustedContextService(sites)
    authorization = AuthorizationService(identities)
    sessions = SessionAuthority(security, identities, audit)
    auth = AuthService(
        identities,
        security,
        vault,
        audit,
        mail,
        PasswordPolicy(SetWeakPasswordChecker(set())),
        PasswordCodec(),
        require_mfa_on_login=settings.environment not in {"development", "test"},
    )

    editorial_repository = PostgresEditorialRepository(site_transactions)
    preview_authority = PreviewAuthorityService(
        security,
        sites,
        EditorialPreviewEligibility(editorial_repository),
        audit,
    )
    derived_source = PostgresDerivedSource(site_transactions)
    producer = Doc18Producer(control=control, queue=queue)
    downstream = DerivedEffectsAdapter(producer=producer, source=derived_source)
    editorial_application = EditorialApplication(
        editorial_repository,
        authorization,
        audit,
        downstream=downstream,
        preview_issuer=preview_authority,
        embed_provider_registry=_load_embed_provider_registry(runtime),
    )
    editorial_transport = EditorialTransportServices(
        editorial_application,
        idempotency=RedisRequestIdempotencyAdapter(redis_control_client),
    )
    public_backend = PostgresPublicPageAdapter(
        site_transactions,
        search=search,
        media_cdn_origin=runtime.media_cdn_origin,
        static_content={},
    )
    global_backend = PostgresGlobalOperations(platform_engine, site_transactions, contexts)

    # Compose the already-accepted CHAT05 application services with production
    # providers. No discovery/media semantics are redefined here.
    s3 = boto3.client("s3", region_name=runtime.aws_region)
    object_storage = S3CompatibleObjectStorageAdapter(s3_client=s3, bucket=runtime.media_bucket)
    derived_repo = PostgresDerivedAdminRepository(site_transactions)
    derived_ops = DerivedSiteOperationsService(
        media=MediaService(
            derived_repo,
            object_storage,
            VipsMediaProcessor(),
            downstream,
            media_cdn_origin=runtime.media_cdn_origin,
        ),
        seo=SeoAdminService(derived_repo, downstream),
        redirects=RedirectService(derived_repo),
        search=SearchAdminService(derived_repo, control, downstream),
    )

    lifecycle = _ResourceLifecycle(
        site_engine,
        platform_engine,
        redis_control_client,
        redis_broker_client,
        celery_client,
    )
    readiness = _Readiness(
        site_engine,
        platform_engine,
        redis_control_client,
        redis_broker_client,
        opensearch,
        security_table,
        vault,
    )
    return Services(
        contexts=contexts,
        authorization=authorization,
        sessions=sessions,
        auth=auth,
        public_pages=PublicPageService(public_backend),
        global_operations=GlobalPlatformService(
            global_backend,
            auth,
            settings.invitation_setup_base_url,
        ),
        audit=audit,
        derived_operations=derived_ops,
        preview_authority=preview_authority,
        site_context_payload=PostgresAdminSiteContextPayload(site_transactions),
        site_dashboard_payload=PostgresSiteDashboardPayload(site_transactions),
        transport_throttle=transport,
        security_abuse=abuse,
        lifecycle=(lifecycle,),
        readiness=readiness,
        editorial_transport=editorial_transport,
    )
