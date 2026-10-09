"""Concrete two-site E2E API composition.

This composition is intentionally opt-in (``BP_RUNTIME_COMPOSITION=two-site-e2e``)
and exists to let CHAT12 exercise the real accepted adapters with real dependency
services.  It does not change HTTP contracts or introduce a tenant bypass.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus, urlsplit, urlunsplit

from sqlalchemy import text

from bp_application import (
    AuthService, DerivedSiteOperationsService,
    AuthorizationService,
    PasswordCodec,
    PasswordPolicy,
    PreviewAuthorityService,
    PublicPageService,
    SessionAuthority,
    SetWeakPasswordChecker,
    TrustedContextService,
)
from bp_application.discovery import SeoCrawlerResourceService
from bp_application.global_platform import GlobalPlatformService
from bp_application.editorial import EditorialApplication, EditorialPreviewEligibility
from bp_application.media import MediaService
from bp_application.redirects import RedirectService
from bp_application.search_admin import SearchAdminService
from bp_application.seo import SeoAdminService
from bp_adapters_media import VipsMediaProcessor
from bp_adapters_object_storage import (
    S3CompatibleObjectStorageAdapter,
    FilesystemSitemapArtifactAdapter,
)
from bp_adapters.mail import SmtpMailAdapter
from bp_adapters.postgres import (
    PoolBudget,
    PostgresAdminSiteContextPayload,
    PostgresAuditAdapter,
    PostgresDerivedSource,
    PostgresIdentityAuthorization,
    PostgresPublicPageAdapter,
    PostgresSiteDashboardPayload,
    PostgresSiteRegistry,
    PostgresSiteTransactionPort,
    create_platform_engine,
    create_site_engine,
    validate_api_replica_pool_budget,
)
from bp_adapters.postgres.editorial import PostgresEditorialRepository
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.security_store import DynamoSecurityStateStore, DynamoSecurityThrottle
from bp_adapters_queue import CeleryRedisQueueAdapter, DerivedEffectsAdapter, Doc18Producer, create_celery_broker_client
from bp_adapters_redis import RedisControlAdapter, RedisRequestIdempotencyAdapter
from bp_adapters_search import OpenSearchAdapter
from bp_domain.editorial import validate_embed_provider_registry

from ..config import Settings
from ..http.site.routes import EditorialTransportServices
from .global_postgres import PostgresGlobalOperations
from .presentation import PresentationPolicy
from .derived_postgres import PostgresDerivedAdminRepository
from .services import Services
from ..media_delivery import SelfHostedMediaDelivery


@dataclass(slots=True)
class _ResourceLifecycle:
    site_engine: Any
    platform_engine: Any
    redis_control: Any
    redis_broker: Any
    celery_app: Any

    async def start(self) -> None:
        # Network readiness is checked separately so process startup never mutates
        # dependency state merely by opening a connection.
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

    async def check(self) -> tuple[bool, dict[str, str]]:
        components: dict[str, str] = {}

        def db(engine: Any) -> None:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))

        async def probe(name: str, fn) -> None:
            try:
                result = fn()
                if asyncio.iscoroutine(result):
                    await result
                else:
                    await asyncio.to_thread(lambda: result)
                components[name] = "ok"
            except Exception:
                components[name] = "unavailable"

        try:
            await asyncio.to_thread(db, self.site_engine)
            components["postgres_site"] = "ok"
        except Exception:
            components["postgres_site"] = "unavailable"
        try:
            await asyncio.to_thread(db, self.platform_engine)
            components["postgres_platform"] = "ok"
        except Exception:
            components["postgres_platform"] = "unavailable"
        try:
            await self.redis_control.ping()
            components["redis_control"] = "ok"
        except Exception:
            components["redis_control"] = "unavailable"
        try:
            await self.redis_broker.ping()
            components["redis_broker"] = "ok"
        except Exception:
            components["redis_broker"] = "unavailable"
        try:
            ok = await asyncio.to_thread(self.opensearch.ping)
            components["opensearch"] = "ok" if ok else "unavailable"
        except Exception:
            components["opensearch"] = "unavailable"
        try:
            await asyncio.to_thread(self.security_table.load)
            components["security_state"] = "ok"
        except Exception:
            components["security_state"] = "unavailable"
        return all(value == "ok" for value in components.values()), components


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required by the two-site E2E composition")
    return value


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


def _postgres_dsn(*, username: str, password: str) -> str:
    host = _require("BP_POSTGRES_HOST")
    port = int(_require("BP_POSTGRES_PORT"))
    database = _require("BP_POSTGRES_DATABASE")
    sslmode = _require("BP_POSTGRES_SSL_MODE")
    return (
        f"postgresql+psycopg://{quote_plus(username)}:{quote_plus(password)}@"
        f"{host}:{port}/{quote_plus(database)}?sslmode={quote_plus(sslmode)}"
    )


def _redis_url(endpoint: str, password_file: str | None) -> str:
    if not password_file:
        return endpoint
    password = Path(password_file).read_text(encoding="utf-8").strip()
    parts = urlsplit(endpoint)
    if not parts.hostname:
        raise RuntimeError("invalid Redis endpoint")
    port = f":{parts.port}" if parts.port else ""
    netloc = f":{quote_plus(password)}@{parts.hostname}{port}"
    return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))


def _load_embed_provider_registry() -> dict[str, Any]:
    explicit = os.getenv("BP_EMBED_PROVIDER_REGISTRY_FILE")
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit))
    for parent in Path(__file__).resolve().parents:
        candidates.append(parent / "config/content/embed-provider-registry.v1.json")
    for path in candidates:
        if path.is_file():
            raw = json.loads(path.read_text(encoding="utf-8"))
            return dict(validate_embed_provider_registry(raw))
    raise RuntimeError("authoritative embed-provider registry is unavailable")


def _load_static_content() -> dict[str, dict[str, Any]]:
    path_value = _require("BP_TWO_SITE_STATIC_CONTENT_FILE")
    raw = json.loads(Path(path_value).read_text(encoding="utf-8"))
    if not isinstance(raw, dict) or set(raw) != {"SITE-01", "SITE-02"}:
        raise RuntimeError("two-site static content fixture must contain exactly SITE-01 and SITE-02")
    return {str(site): dict(value) for site, value in raw.items()}


def build_two_site_e2e_services(settings: Settings, spec: dict[str, Any]) -> Services:
    if settings.environment not in {"development", "test"}:
        raise RuntimeError("two-site-e2e composition is restricted to development/test")

    # Imports stay local so the ordinary source-inspection/test environment can
    # import bp_api without materializing provider dependencies.
    try:
        import boto3  # type: ignore
        import redis.asyncio as redis_async  # type: ignore
        from opensearchpy import OpenSearch  # type: ignore
        from opensearchpy.helpers import scan  # type: ignore
    except ImportError as exc:
        raise RuntimeError("two-site E2E provider dependencies are not materialized") from exc

    pool_max = int(_require("BP_POSTGRES_POOL_MAX"))
    site_budget = PoolBudget(pool_size=max(1, pool_max // 2))
    platform_budget = PoolBudget(pool_size=max(1, pool_max - site_budget.pool_size))
    validate_api_replica_pool_budget(site_budget, platform_budget)

    site_user, site_password = _credential(
        _require("BP_POSTGRES_SITE_CREDENTIAL_FILE"), default_username="db_site_runtime"
    )
    platform_user, platform_password = _credential(
        _require("BP_POSTGRES_PLATFORM_CREDENTIAL_FILE"), default_username="db_platform_runtime"
    )
    site_engine = create_site_engine(
        _postgres_dsn(username=site_user, password=site_password), budget=site_budget, application_name="bp-api-e2e-site"
    )
    platform_engine = create_platform_engine(
        _postgres_dsn(username=platform_user, password=platform_password), budget=platform_budget, application_name="bp-api-e2e-platform"
    )
    site_transactions = PostgresSiteTransactionPort(site_engine)

    control_url = _redis_url(_require("BP_REDIS_CONTROL_ENDPOINT"), os.getenv("BP_REDIS_CONTROL_PASSWORD_FILE"))
    broker_url = _redis_url(_require("BP_REDIS_BROKER_ENDPOINT"), os.getenv("BP_REDIS_BROKER_PASSWORD_FILE"))
    redis_control_client = redis_async.from_url(control_url, decode_responses=True)
    redis_broker_client = redis_async.from_url(broker_url, decode_responses=True)
    control = RedisControlAdapter(redis_control_client)
    celery_client = create_celery_broker_client(broker_url=broker_url)
    queue = CeleryRedisQueueAdapter(celery_app=celery_client, broker_redis=redis_broker_client)

    opensearch = OpenSearch(hosts=[_require("BP_OPENSEARCH_ENDPOINT")])
    search = OpenSearchAdapter(client=opensearch, scan=scan)

    security_endpoint = os.getenv("BP_SECURITY_STATE_ENDPOINT")
    dynamo = boto3.resource(
        "dynamodb",
        endpoint_url=security_endpoint,
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "e2e-local"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "e2e-local"),
    )
    security_table = dynamo.Table(_require("BP_SECURITY_STATE_TABLE"))
    security = DynamoSecurityStateStore(table=security_table)

    # Import the accepted limit registries from bp_api without copying values.
    from ..app import SECURITY_ABUSE_POLICIES, _transport_policies
    transport = DynamoSecurityThrottle(table=security_table, policies=_transport_policies(spec), namespace="RATE#TRANSPORT")
    abuse = DynamoSecurityThrottle(table=security_table, policies=SECURITY_ABUSE_POLICIES, namespace="RATE#SECURITY")

    sites = PostgresSiteRegistry(site_engine)
    identities = PostgresIdentityAuthorization(platform_engine)
    audit = PostgresAuditAdapter(platform_engine)
    contexts = TrustedContextService(sites)
    authorization = AuthorizationService(identities)
    sessions = SessionAuthority(security, identities, audit)

    smtp_password = None
    smtp_username = None
    smtp_file = os.getenv("BP_SMTP_CREDENTIAL_FILE")
    if smtp_file and Path(smtp_file).exists():
        smtp_username, smtp_password = _credential(smtp_file, default_username="")
    mail = SmtpMailAdapter(
        host=_require("BP_SMTP_HOST"),
        port=int(_require("BP_SMTP_PORT")),
        sender=os.getenv("BP_SMTP_SENDER", "noreply@example.invalid"),
        username=smtp_username or None,
        password=smtp_password or None,
        starttls=os.getenv("BP_SMTP_STARTTLS", "0") == "1",
    )
    envelope_key = _require("BP_LOCAL_ENVELOPE_KEY").encode("ascii")
    envelope_hmac_key = bytes.fromhex(_require("BP_LOCAL_ENVELOPE_HMAC_KEY"))
    auth = AuthService(
        identities,
        security,
        LocalEnvelopeSecretProvider(key=envelope_key, hmac_key=envelope_hmac_key),
        audit,
        mail,
        PasswordPolicy(SetWeakPasswordChecker(set())),
        PasswordCodec(),
        require_mfa_on_login=False,
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
        embed_provider_registry=_load_embed_provider_registry(),
        presentation_validator=PresentationPolicy(spec).presentation_valid,
        static_pages_validator=PresentationPolicy(spec).static_pages.is_valid,
    )
    editorial_transport = EditorialTransportServices(
        editorial_application,
        idempotency=RedisRequestIdempotencyAdapter(redis_control_client),
    )

    public_backend = PostgresPublicPageAdapter(
        site_transactions,
        search=search,
        media_cdn_origin=_require("BP_MEDIA_CDN_ORIGIN"),
        static_content=_load_static_content(),
        presentation_validator=PresentationPolicy(spec).presentation_valid,
        temporary_domain_suffix=settings.temporary_domain_suffix,
    )

    s3 = boto3.client(
        "s3",
        endpoint_url=_require("BP_MEDIA_ENDPOINT_URL"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=_require("BP_MEDIA_ACCESS_KEY_ID"),
        aws_secret_access_key=_require("BP_MEDIA_SECRET_ACCESS_KEY"),
    )
    object_storage = S3CompatibleObjectStorageAdapter(s3_client=s3, bucket=_require("BP_MEDIA_BUCKET"))
    derived_repo = PostgresDerivedAdminRepository(site_transactions)
    derived_ops = DerivedSiteOperationsService(
        media=MediaService(
            derived_repo,
            object_storage,
            VipsMediaProcessor(),
            downstream,
            media_cdn_origin=_require("BP_MEDIA_CDN_ORIGIN"),
        ),
        seo=SeoAdminService(derived_repo, downstream),
        redirects=RedirectService(derived_repo),
        search=SearchAdminService(derived_repo, control, downstream),
    )

    lifecycle = _ResourceLifecycle(
        site_engine=site_engine,
        platform_engine=platform_engine,
        redis_control=redis_control_client,
        redis_broker=redis_broker_client,
        celery_app=celery_client,
    )
    readiness = _Readiness(
        site_engine=site_engine,
        platform_engine=platform_engine,
        redis_control=redis_control_client,
        redis_broker=redis_broker_client,
        opensearch=opensearch,
        security_table=security_table,
    )

    return Services(
        contexts=contexts,
        authorization=authorization,
        sessions=sessions,
        auth=auth,
        public_pages=PublicPageService(public_backend),
        global_operations=GlobalPlatformService(
            PostgresGlobalOperations(
                platform_engine,
                site_transactions,
                contexts,
                temporary_domain_suffix=settings.temporary_domain_suffix,
                presentation_policy=PresentationPolicy(spec),
            ),
            auth,
            settings.invitation_setup_base_url,
            downstream=downstream,
            site_contexts=contexts,
        ),
        audit=audit,
        derived_operations=derived_ops,
        preview_authority=preview_authority,
        site_context_payload=PostgresAdminSiteContextPayload(site_transactions, settings.temporary_domain_suffix),
        site_dashboard_payload=PostgresSiteDashboardPayload(site_transactions),
        transport_throttle=transport,
        security_abuse=abuse,
        lifecycle=(lifecycle,),
        readiness=readiness,
        editorial_transport=editorial_transport,
        crawler_resources=SeoCrawlerResourceService(
            derived_repo,
            FilesystemSitemapArtifactAdapter(
                os.getenv("BP_SITEMAP_ARTIFACT_ROOT", "/tmp/bp-sitemaps")
            ),
            settings.temporary_domain_suffix,
        ),
        media_delivery=SelfHostedMediaDelivery(
            sites=sites, transactions=site_transactions, storage=object_storage
        ),
    )
