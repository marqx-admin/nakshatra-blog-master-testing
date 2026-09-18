from __future__ import annotations

"""Staging/production Worker composition for the accepted DOC-23 runtime."""

import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime
import json
import os
from pathlib import Path
from urllib.parse import quote_plus, urlsplit, urlunsplit

from bp_adapters_media import CdnMediaDeliveryAdapter, CloudFrontPurgeClient, VipsMediaProcessor
from bp_adapters_object_storage import S3CompatibleObjectStorageAdapter, S3SitemapArtifactAdapter
from bp_adapters.postgres import (
    PoolBudget,
    PostgresDerivedSource,
    PostgresSiteRegistry,
    PostgresSiteTransactionPort,
    PostgresWorkerMediaRepository,
    create_platform_engine,
    create_worker_site_engine,
)
from bp_adapters_queue import CeleryRedisQueueAdapter, DerivedEffectsAdapter, Doc18Producer
from bp_adapters_redis import RedisControlAdapter
from bp_adapters_search import OpenSearchAdapter
from bp_domain.context import ContextKind, ContextSource, GlobalContext

from ..celery_app import create_celery
from ..runtime import DerivedJobActions, WorkerContextResolver, WorkerEngine
from ..scheduler import WorkerScheduler
from ..tasks import register_all

PROFILE_QUEUE: dict[str, str] = {
    "publish": "q18.publish",
    "media": "q18.media",
    "search": "q18.search",
    "sitemap": "q18.sitemap",
    "cache": "q18.cache",
    "maintenance": "q18.maintenance",
}
QUEUE_PROFILES = tuple(PROFILE_QUEUE)
ALL_PROFILES = QUEUE_PROFILES + ("scheduler",)
_PRODUCTION_ENVS = {"staging", "production"}


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required by the production Worker composition")
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


def _postgres_dsn(username: str, password: str) -> str:
    return (
        f"postgresql+psycopg://{quote_plus(username)}:{quote_plus(password)}@"
        f"{_require('BP_POSTGRES_HOST')}:{int(_require('BP_POSTGRES_PORT'))}/"
        f"{quote_plus(_require('BP_POSTGRES_DATABASE'))}?sslmode={quote_plus(_require('BP_POSTGRES_SSL_MODE'))}"
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


@dataclass(slots=True)
class _GlobalSiteEnumeration:
    registry: object

    async def list_eligible_sites(self, context: GlobalContext):
        if context.kind is not ContextKind.GLOBAL or context.context_source is not ContextSource.GLOBAL_AUTHORITY:
            raise ValueError("site enumeration requires trusted CTX-GLOBAL authority")
        return [site for site in await self.registry.list_sites() if site.public_eligible]


@dataclass(slots=True)
class ProductionWorkerRuntime:
    profile: str
    celery_app: object
    producer: object
    queue_name: str | None
    redis_control: object
    redis_broker: object
    engines: tuple[object, ...]
    scheduler: WorkerScheduler | None = None
    scheduler_sites: object | None = None

    @property
    def is_scheduler(self) -> bool:
        return self.profile == "scheduler"

    async def run_scheduler_cycle(
        self,
        *,
        now: datetime | None = None,
        reconcile: bool = True,
        include_15m: bool = True,
    ) -> tuple[int, int]:
        if not self.is_scheduler or self.scheduler is None or self.scheduler_sites is None:
            raise RuntimeError("scheduler cycle is available only for the scheduler profile")
        now = now or datetime.now(UTC)
        promoted = await self.scheduler.promote_due(now)
        if not reconcile:
            return promoted, 0
        context = GlobalContext(
            kind=ContextKind.GLOBAL,
            context_source=ContextSource.GLOBAL_AUTHORITY,
            request_id=f"worker-scheduler-{int(now.timestamp())}",
            resolved_at=now,
        )
        jobs = await self.scheduler.enqueue_global_reconciliation(
            context=context,
            sites=self.scheduler_sites,
            now=now,
            include_15m=include_15m,
        )
        return promoted, len(jobs)

    async def run_scheduler_forever(self, *, poll_seconds: float = 1.0) -> None:
        if not self.is_scheduler:
            raise RuntimeError("queue-worker profile cannot run the scheduler loop")
        last_minute: int | None = None
        last_quarter: int | None = None
        while True:
            now = datetime.now(UTC)
            epoch = int(now.timestamp())
            minute = epoch // 60
            quarter = epoch // 900
            reconcile = minute != last_minute
            include_15m = reconcile and quarter != last_quarter
            await self.run_scheduler_cycle(now=now, reconcile=reconcile, include_15m=include_15m)
            if reconcile:
                last_minute = minute
            if include_15m:
                last_quarter = quarter
            await asyncio.sleep(poll_seconds)

    async def close(self) -> None:
        for client in (self.redis_control, self.redis_broker):
            close = getattr(client, "aclose", None)
            if close is not None:
                await close()
        close_celery = getattr(self.celery_app, "close", None)
        if close_celery is not None:
            close_celery()
        for engine in self.engines:
            dispose = getattr(engine, "dispose", None)
            if dispose is not None:
                dispose()


def build_production_worker_runtime() -> ProductionWorkerRuntime:
    env = os.getenv("BP_ENV", "").strip().lower()
    if env not in _PRODUCTION_ENVS:
        raise RuntimeError("production Worker composition is restricted to staging/production")
    composition = os.getenv("BP_RUNTIME_COMPOSITION")
    if composition not in {None, ""}:
        raise RuntimeError("staging/production Worker may not use a development/test runtime composition")
    profile = _require("BP_WORKER_PROFILE")
    if profile not in ALL_PROFILES:
        raise RuntimeError(f"unsupported Worker profile: {profile}")

    pool_size = int(_require("BP_POSTGRES_POOL_MAX"))
    if pool_size < 1 or pool_size > 10:
        raise RuntimeError("production Worker process pool must be between 1 and 10 connections")
    pool = PoolBudget(pool_size=pool_size)

    try:
        import boto3  # type: ignore
        import redis.asyncio as redis_async  # type: ignore
        from opensearchpy import AWSV4SignerAuth, OpenSearch, RequestsHttpConnection  # type: ignore
        from opensearchpy.helpers import scan  # type: ignore
    except ImportError as exc:
        raise RuntimeError("production Worker provider dependencies are not materialized") from exc

    control_url = _redis_url(_require("BP_REDIS_CONTROL_ENDPOINT"), os.getenv("BP_REDIS_CONTROL_PASSWORD_FILE"))
    broker_url = _redis_url(_require("BP_REDIS_BROKER_ENDPOINT"), os.getenv("BP_REDIS_BROKER_PASSWORD_FILE"))
    redis_control_client = redis_async.from_url(control_url, decode_responses=True)
    redis_broker_client = redis_async.from_url(broker_url, decode_responses=True)
    control = RedisControlAdapter(redis_control_client)
    celery_app = create_celery(broker_url=broker_url)
    queue = CeleryRedisQueueAdapter(celery_app=celery_app, broker_redis=redis_broker_client)
    producer = Doc18Producer(control=control, queue=queue)

    if profile == "scheduler":
        platform_user, platform_password = _credential(
            _require("BP_POSTGRES_PLATFORM_CREDENTIAL_FILE"),
            default_username="db_platform_runtime",
        )
        platform_engine = create_platform_engine(
            _postgres_dsn(platform_user, platform_password),
            budget=pool,
            application_name="bp-worker-scheduler-platform",
        )
        return ProductionWorkerRuntime(
            profile=profile,
            celery_app=celery_app,
            producer=producer,
            queue_name=None,
            redis_control=redis_control_client,
            redis_broker=redis_broker_client,
            engines=(platform_engine,),
            scheduler=WorkerScheduler(producer),
            scheduler_sites=_GlobalSiteEnumeration(PostgresSiteRegistry(platform_engine)),
        )

    user, password = _credential(_require("BP_POSTGRES_SITE_CREDENTIAL_FILE"), default_username="db_site_runtime")
    site_engine = create_worker_site_engine(
        _postgres_dsn(user, password),
        budget=pool,
        application_name=f"bp-worker-{profile}",
    )
    site_transactions = PostgresSiteTransactionPort(site_engine)

    opensearch_endpoint = _require("BP_OPENSEARCH_ENDPOINT")
    opensearch_parts = urlsplit(opensearch_endpoint)
    if opensearch_parts.scheme.lower() != "https" or not opensearch_parts.hostname:
        raise RuntimeError("staging/production OpenSearch endpoint must be HTTPS")
    region = os.getenv("AWS_REGION", "us-east-1")
    aws_credentials = boto3.Session().get_credentials()
    if aws_credentials is None:
        raise RuntimeError("AWS workload credentials are required by the production Worker composition")
    opensearch = OpenSearch(
        hosts=[{"host": opensearch_parts.hostname, "port": opensearch_parts.port or 443}],
        http_auth=AWSV4SignerAuth(aws_credentials, region, "es"),
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
    )
    search = OpenSearchAdapter(client=opensearch, scan=scan)

    s3 = boto3.client("s3", region_name=region)
    cloudfront = boto3.client("cloudfront", region_name=region)
    bucket = _require("BP_MEDIA_BUCKET")
    storage = S3CompatibleObjectStorageAdapter(s3_client=s3, bucket=bucket)
    sitemap = S3SitemapArtifactAdapter(s3_client=s3, bucket=bucket)

    sites = PostgresSiteRegistry(site_engine)
    source = PostgresDerivedSource(site_transactions)
    effects = DerivedEffectsAdapter(producer=producer, source=source)
    actions = DerivedJobActions(
        source=source,
        producer=producer,
        effects=effects,
        search=search,
        storage=storage,
        media_repository=PostgresWorkerMediaRepository(site_transactions),
        media_processor=VipsMediaProcessor(),
        sitemap=sitemap,
        control=control,
        delivery=CdnMediaDeliveryAdapter(
            media_cdn_origin=_require("BP_MEDIA_CDN_ORIGIN"),
            purge_client=CloudFrontPurgeClient(cloudfront, _require("BP_MEDIA_CDN_ORIGIN")),
        ),
    )
    engine = WorkerEngine(control=control, queue=queue, resolver=WorkerContextResolver(sites), actions=actions)
    register_all(celery_app, engine)

    return ProductionWorkerRuntime(
        profile=profile,
        celery_app=celery_app,
        producer=producer,
        queue_name=PROFILE_QUEUE[profile],
        redis_control=redis_control_client,
        redis_broker=redis_broker_client,
        engines=(site_engine,),
    )
