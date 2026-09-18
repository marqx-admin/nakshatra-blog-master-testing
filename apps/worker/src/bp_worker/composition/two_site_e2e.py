from __future__ import annotations

"""Concrete Worker composition for the CHAT12 two-site E2E candidate."""

from dataclasses import dataclass
import json
import os
from pathlib import Path
from urllib.parse import quote_plus, urlsplit, urlunsplit

from bp_adapters_media import VipsMediaProcessor
from bp_adapters_object_storage import FilesystemSitemapArtifactAdapter, S3CompatibleObjectStorageAdapter
from bp_adapters.postgres import (
    PoolBudget,
    PostgresDerivedSource,
    PostgresSiteRegistry,
    PostgresSiteTransactionPort,
    PostgresWorkerMediaRepository,
    create_worker_site_engine,
)
from bp_adapters_queue import CeleryRedisQueueAdapter, DerivedEffectsAdapter, Doc18Producer
from bp_adapters_redis import RedisControlAdapter
from bp_adapters_search import OpenSearchAdapter

from ..celery_app import create_celery
from ..runtime import DerivedJobActions, WorkerContextResolver, WorkerEngine
from ..tasks import register_all


PROFILE_QUEUE = {
    "publish": "q18.publish",
    "media": "q18.media",
    "search": "q18.search",
    "sitemap": "q18.sitemap",
    "cache": "q18.cache",
    "maintenance": "q18.maintenance",
}


@dataclass(slots=True)
class TwoSiteWorkerRuntime:
    celery_app: object
    engine: WorkerEngine
    producer: Doc18Producer
    queue_name: str
    site_engine: object
    redis_control: object
    redis_broker: object

    async def close(self) -> None:
        for client in (self.redis_control, self.redis_broker):
            close = getattr(client, "aclose", None)
            if close is not None:
                await close()
        close_celery = getattr(self.celery_app, "close", None)
        if close_celery is not None:
            close_celery()
        self.site_engine.dispose()


def _require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required by the two-site E2E Worker composition")
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


def build_two_site_worker_runtime() -> TwoSiteWorkerRuntime:
    if os.getenv("BP_ENV", "development") not in {"development", "test"}:
        raise RuntimeError("two-site-e2e Worker composition is restricted to development/test")
    try:
        import boto3  # type: ignore
        import redis.asyncio as redis_async  # type: ignore
        from opensearchpy import OpenSearch  # type: ignore
        from opensearchpy.helpers import scan  # type: ignore
    except ImportError as exc:
        raise RuntimeError("two-site E2E Worker provider dependencies are not materialized") from exc

    user, password = _credential(_require("BP_POSTGRES_SITE_CREDENTIAL_FILE"), default_username="db_site_runtime")
    pool = PoolBudget(pool_size=min(10, int(_require("BP_POSTGRES_POOL_MAX"))))
    site_engine = create_worker_site_engine(_postgres_dsn(user, password), budget=pool, application_name="bp-worker-e2e")
    site_transactions = PostgresSiteTransactionPort(site_engine)

    control_url = _redis_url(_require("BP_REDIS_CONTROL_ENDPOINT"), os.getenv("BP_REDIS_CONTROL_PASSWORD_FILE"))
    broker_url = _redis_url(_require("BP_REDIS_BROKER_ENDPOINT"), os.getenv("BP_REDIS_BROKER_PASSWORD_FILE"))
    redis_control_client = redis_async.from_url(control_url, decode_responses=True)
    redis_broker_client = redis_async.from_url(broker_url, decode_responses=True)
    control = RedisControlAdapter(redis_control_client)
    celery_app = create_celery(broker_url=broker_url)
    queue = CeleryRedisQueueAdapter(celery_app=celery_app, broker_redis=redis_broker_client)
    producer = Doc18Producer(control=control, queue=queue)

    opensearch = OpenSearch(hosts=[_require("BP_OPENSEARCH_ENDPOINT")])
    search = OpenSearchAdapter(client=opensearch, scan=scan)

    s3 = boto3.client(
        "s3",
        endpoint_url=os.getenv("BP_OBJECT_STORAGE_ENDPOINT"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    storage = S3CompatibleObjectStorageAdapter(s3_client=s3, bucket=_require("BP_MEDIA_BUCKET"))
    sitemap = FilesystemSitemapArtifactAdapter(os.getenv("BP_SITEMAP_ARTIFACT_ROOT", "/tmp/bp-sitemaps"))

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
        delivery=None,
    )
    engine = WorkerEngine(control=control, queue=queue, resolver=WorkerContextResolver(sites), actions=actions)
    register_all(celery_app, engine)

    profile = _require("BP_WORKER_PROFILE")
    if profile == "scheduler":
        queue_name = "q18.maintenance"
    else:
        try:
            queue_name = PROFILE_QUEUE[profile]
        except KeyError as exc:
            raise RuntimeError(f"unsupported Worker profile: {profile}") from exc

    return TwoSiteWorkerRuntime(
        celery_app=celery_app,
        engine=engine,
        producer=producer,
        queue_name=queue_name,
        site_engine=site_engine,
        redis_control=redis_control_client,
        redis_broker=redis_broker_client,
    )
