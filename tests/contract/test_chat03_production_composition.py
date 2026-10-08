from __future__ import annotations

import base64
from cryptography.fernet import Fernet
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace

import pytest

from bp_adapters.mail import SmtpMailAdapter
from bp_adapters.postgres import (
    PostgresIdentityAuthorization,
    PostgresPublicPageAdapter,
    PostgresSiteRegistry,
    PostgresSiteTransactionPort,
)
from bp_adapters.secrets import LocalEnvelopeSecretProvider, VaultTransitSecretProvider
from bp_adapters.security_store import DynamoSecurityStateStore, InMemorySecurityStateStore
from bp_api.app import create_app, default_services
from bp_api.composition.global_postgres import PostgresGlobalOperations
from bp_api.composition.production import build_production_services
from bp_api.config import Settings
from bp_api.http.contract import load_openapi


class _FakeEngine:
    def __init__(self, label: str) -> None:
        self.label = label
        self.disposed = False

    def dispose(self) -> None:
        self.disposed = True


class _FakeRedis:
    def __init__(self, url: str) -> None:
        self.url = url
        self.closed = False

    async def ping(self):
        return True

    async def aclose(self):
        self.closed = True


class _FakeCelery:
    def __init__(self, broker_url: str) -> None:
        self.broker_url = broker_url
        self.closed = False

    def close(self) -> None:
        self.closed = True


class _FakeOpenSearch:
    def __init__(self, *, hosts):
        self.hosts = list(hosts)
        self.indices = SimpleNamespace()

    def ping(self):
        return True


class _FakeDynamoTable:
    def __init__(self, name: str) -> None:
        self.name = name

    def load(self) -> None:
        return None


class _FakeDynamoResource:
    def __init__(self) -> None:
        self.tables: dict[str, _FakeDynamoTable] = {}

    def Table(self, name: str) -> _FakeDynamoTable:
        return self.tables.setdefault(name, _FakeDynamoTable(name))


class _FakeS3:
    pass


def _install_external_provider_stubs(monkeypatch: pytest.MonkeyPatch, capture: dict) -> None:
    """Stub only unavailable external-provider clients/factories.

    Application/domain services and accepted adapters remain real. The PostgreSQL
    engine constructors are provider-boundary stubs because psycopg/live RDS are
    intentionally unavailable in this source-verification executor.
    """
    import boto3
    import bp_api.composition.production as production

    fake_redis_async = ModuleType("redis.asyncio")

    def redis_from_url(url: str, *, decode_responses: bool):
        assert decode_responses is True
        client = _FakeRedis(url)
        capture.setdefault("redis_urls", []).append(url)
        capture.setdefault("redis_clients", []).append(client)
        return client

    fake_redis_async.from_url = redis_from_url  # type: ignore[attr-defined]
    fake_redis = ModuleType("redis")
    fake_redis.asyncio = fake_redis_async  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "redis", fake_redis)
    monkeypatch.setitem(sys.modules, "redis.asyncio", fake_redis_async)

    fake_opensearch = ModuleType("opensearchpy")
    fake_opensearch.OpenSearch = _FakeOpenSearch  # type: ignore[attr-defined]
    fake_helpers = ModuleType("opensearchpy.helpers")
    fake_helpers.scan = lambda *args, **kwargs: iter(())  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "opensearchpy", fake_opensearch)
    monkeypatch.setitem(sys.modules, "opensearchpy.helpers", fake_helpers)

    site_engine = _FakeEngine("site")
    platform_engine = _FakeEngine("platform")
    capture["site_engine"] = site_engine
    capture["platform_engine"] = platform_engine

    def site_engine_factory(dsn, *, budget, application_name):
        capture["site_dsn"] = dsn
        capture["site_application_name"] = application_name
        capture["site_budget"] = budget
        return site_engine

    def platform_engine_factory(dsn, *, budget, application_name):
        capture["platform_dsn"] = dsn
        capture["platform_application_name"] = application_name
        capture["platform_budget"] = budget
        return platform_engine

    monkeypatch.setattr(production, "create_site_engine", site_engine_factory)
    monkeypatch.setattr(production, "create_platform_engine", platform_engine_factory)

    def celery_factory(*, broker_url: str):
        capture["celery_broker_url"] = broker_url
        app = _FakeCelery(broker_url)
        capture["celery_app"] = app
        return app

    monkeypatch.setattr(production, "create_celery_broker_client", celery_factory)

    dynamo = _FakeDynamoResource()
    capture["dynamo"] = dynamo

    def boto_resource(service_name: str, *, region_name: str, **kwargs):
        assert service_name == "dynamodb"
        capture["dynamo_region"] = region_name
        capture["dynamo_endpoint_url"] = kwargs.get("endpoint_url")
        return dynamo

    def boto_client(service_name: str, *, region_name: str, **kwargs):
        assert service_name == "s3"
        capture["s3_region"] = region_name
        capture["s3_endpoint_url"] = kwargs.get("endpoint_url")
        capture["s3_config"] = kwargs.get("config")
        return _FakeS3()

    monkeypatch.setattr(boto3, "resource", boto_resource)
    monkeypatch.setattr(boto3, "client", boto_client)


def _set_runtime_env(monkeypatch: pytest.MonkeyPatch, tmp_path: Path, environment: str) -> None:
    site_credential = tmp_path / "site-db.json"
    site_credential.write_text('{"username":"site_runtime","password":"TEST_ONLY_SITE_PASSWORD"}', encoding="utf-8")
    platform_credential = tmp_path / "platform-db.json"
    platform_credential.write_text('{"username":"platform_runtime","password":"TEST_ONLY_PLATFORM_PASSWORD"}', encoding="utf-8")
    smtp_credential = tmp_path / "smtp.json"
    smtp_credential.write_text('{"username":"smtp-runtime","password":"TEST_ONLY_SMTP_PASSWORD"}', encoding="utf-8")

    values = {
        "BP_ENV": environment,
        "BP_POSTGRES_HOST": "postgres.internal",
        "BP_POSTGRES_PORT": "5432",
        "BP_POSTGRES_DATABASE": "nakshatra_blog",
        "BP_POSTGRES_SSL_MODE": "verify-full",
        "BP_POSTGRES_POOL_MAX": "10",
        "BP_POSTGRES_SITE_CREDENTIAL_FILE": str(site_credential),
        "BP_POSTGRES_PLATFORM_CREDENTIAL_FILE": str(platform_credential),
        "BP_REDIS_CONTROL_ENDPOINT": "rediss://redis-control.internal:6379/0",
        "BP_REDIS_BROKER_ENDPOINT": "rediss://redis-broker.internal:6379/0",
        "BP_OPENSEARCH_ENDPOINT": "https://opensearch.internal:9200",
        "BP_MEDIA_BUCKET": "nakshatra-media",
        "BP_MEDIA_STAGING_PREFIX": "staging/",
        "BP_MEDIA_CDN_ORIGIN": "https://cdn.example.test",
        "BP_SECURITY_STATE_TABLE": "nakshatra-security-state",
        "BP_VAULT_ADDR": "https://vault.internal",
        "BP_VAULT_ROLE": "bp-api",
        "BP_SMTP_HOST": "smtp.internal",
        "BP_SMTP_PORT": "587",
        "BP_SMTP_CREDENTIAL_FILE": str(smtp_credential),
        "BP_TRUSTED_PROXY_MODE": "forwarded",
        "AWS_REGION": "ap-south-1",
        "BP_EMBED_PROVIDER_REGISTRY_FILE": str(
            Path(__file__).resolve().parents[2] / "config/content/embed-provider-registry.v1.json"
        ),
    }
    for key, value in values.items():
        monkeypatch.setenv(key, value)
    monkeypatch.delenv("BP_REDIS_CONTROL_PASSWORD_FILE", raising=False)
    monkeypatch.delenv("BP_REDIS_BROKER_PASSWORD_FILE", raising=False)
    monkeypatch.delenv("BP_RUNTIME_COMPOSITION", raising=False)


def test_production_runtime_rejects_placeholder_public_media_origin(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    from bp_api.config.settings import ProductionRuntimeSettings

    _set_runtime_env(monkeypatch, tmp_path, "production")
    monkeypatch.setenv("BP_MEDIA_CDN_ORIGIN", "https://media.example.invalid")
    with pytest.raises(RuntimeError, match=r"reserved \.invalid placeholder"):
        ProductionRuntimeSettings.from_env()


def _settings(environment: str) -> Settings:
    return Settings(
        environment=environment,
        canonical_openapi_path="contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml",
        admin_origins=("https://admin.example.test",),
        reset_base_url="https://admin.example.test/reset",
        enforce_https=True,
        invitation_setup_base_url="https://admin.example.test/setup",
    )


@pytest.mark.parametrize("environment", ["staging", "production"])
def test_production_composition_constructs_with_concrete_provider_backed_services(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path, environment: str
):
    root = Path(__file__).resolve().parents[2]
    spec = load_openapi(root / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml")
    _set_runtime_env(monkeypatch, tmp_path, environment)
    capture: dict = {}
    _install_external_provider_stubs(monkeypatch, capture)

    services = build_production_services(_settings(environment), spec)

    # PostgreSQL is split between SITE/RLS and privileged platform runtimes.
    assert capture["site_engine"] is not capture["platform_engine"]
    assert capture["site_application_name"] == "bp-api-site"
    assert capture["platform_application_name"] == "bp-api-platform"
    assert "site_runtime" in capture["site_dsn"]
    assert "platform_runtime" in capture["platform_dsn"]
    assert isinstance(services.contexts.sites, PostgresSiteRegistry)
    assert isinstance(services.authorization.identities, PostgresIdentityAuthorization)
    assert isinstance(services.site_dashboard_payload.site_transactions, PostgresSiteTransactionPort)

    # GLOBAL is concrete and production cannot silently use unavailable/local backends.
    assert isinstance(services.global_operations.backend, PostgresGlobalOperations)
    assert not isinstance(services.sessions.store, InMemorySecurityStateStore)
    assert isinstance(services.sessions.store, DynamoSecurityStateStore)
    assert isinstance(services.auth.secrets_provider, VaultTransitSecretProvider)
    assert not isinstance(services.auth.secrets_provider, LocalEnvelopeSecretProvider)
    assert isinstance(services.auth.mail, SmtpMailAdapter)

    # Public/Preview/editorial/derived paths use accepted application/adapters.
    assert isinstance(services.public_pages.backend, PostgresPublicPageAdapter)
    assert services.preview_authority is not None
    assert services.editorial_transport is not None
    assert services.derived_operations is not None

    # Control/cache and broker Redis are explicitly separate planes.
    assert capture["redis_urls"] == [
        "rediss://redis-control.internal:6379/0",
        "rediss://redis-broker.internal:6379/0",
    ]
    assert capture["celery_broker_url"] == "rediss://redis-broker.internal:6379/0"
    assert services.transport_throttle is not None
    assert services.security_abuse is not None

    # OpenSearch, DynamoDB, Vault, SMTP, lifecycle and readiness are all wired.
    assert services.public_pages.backend.search.client.hosts == ["https://opensearch.internal:9200"]


def test_self_hosted_composition_uses_s3_compatible_runtime(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    root = Path(__file__).resolve().parents[2]
    spec = load_openapi(root / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml")
    _set_runtime_env(monkeypatch, tmp_path, "staging")
    monkeypatch.setenv("BP_RUNTIME_COMPOSITION", "self-hosted")
    monkeypatch.setenv("BP_MEDIA_ENDPOINT_URL", "http://minio.internal:9000")
    monkeypatch.setenv("BP_SECURITY_STATE_ENDPOINT", "http://dynamodb.internal:8000")
    monkeypatch.setenv("BP_LOCAL_ENVELOPE_KEY", Fernet.generate_key().decode("ascii"))
    monkeypatch.setenv("BP_LOCAL_ENVELOPE_HMAC_KEY", "00112233445566778899aabbccddeeff")
    monkeypatch.setenv("BP_MEDIA_ACCESS_KEY_ID", "selfhosted-media-user")
    monkeypatch.setenv("BP_MEDIA_SECRET_ACCESS_KEY", "selfhosted-media-secret")
    monkeypatch.setenv("BP_SECURITY_STATE_ACCESS_KEY_ID", "selfhosted-security-user")
    monkeypatch.setenv("BP_SECURITY_STATE_SECRET_ACCESS_KEY", "selfhosted-security-secret")
    capture: dict = {}
    _install_external_provider_stubs(monkeypatch, capture)

    from bp_api.composition.self_hosted import build_self_hosted_services
    import bp_api.composition.self_hosted as self_hosted

    site_engine = _FakeEngine("site")
    platform_engine = _FakeEngine("platform")

    def fake_site_engine(dsn, *, budget, application_name):
        capture["site_engine"] = site_engine
        capture["site_dsn"] = dsn
        capture["site_application_name"] = application_name
        capture["site_budget"] = budget
        return site_engine

    def fake_platform_engine(dsn, *, budget, application_name):
        capture["platform_engine"] = platform_engine
        capture["platform_dsn"] = dsn
        capture["platform_application_name"] = application_name
        capture["platform_budget"] = budget
        return platform_engine

    def fake_celery_factory(*, broker_url: str):
        capture["celery_broker_url"] = broker_url
        app = _FakeCelery(broker_url)
        capture["celery_app"] = app
        return app

    self_hosted.create_site_engine = fake_site_engine
    self_hosted.create_platform_engine = fake_platform_engine
    self_hosted.create_celery_broker_client = fake_celery_factory

    services = build_self_hosted_services(_settings("staging"), spec)

    assert services.transport_throttle is not None
    assert services.security_abuse is not None
    assert services.public_pages is not None
    assert services.auth.secrets_provider is not None
    assert isinstance(services.auth.secrets_provider, LocalEnvelopeSecretProvider)
    assert capture["dynamo"].tables["nakshatra-security-state"].name == "nakshatra-security-state"
    assert services.auth.mail.host == "smtp.internal"
    assert services.auth.mail.port == 587
    assert len(services.lifecycle) == 1
    lifecycle = services.lifecycle[0]
    assert lifecycle.site_engine is site_engine
    assert lifecycle.platform_engine is platform_engine
    assert lifecycle.redis_control is capture["redis_clients"][0]
    assert lifecycle.redis_broker is capture["redis_clients"][1]
    assert lifecycle.celery_app is capture["celery_app"]
    assert services.readiness is not None
    assert services.readiness.site_engine is site_engine
    assert services.readiness.platform_engine is platform_engine
    assert services.readiness.redis_control is capture["redis_clients"][0]
    assert services.readiness.redis_broker is capture["redis_clients"][1]
    assert services.readiness.opensearch is services.public_pages.backend.search.client
    assert services.readiness.security_table is capture["dynamo"].tables["nakshatra-security-state"]
    assert services.readiness.secrets is services.auth.secrets_provider


def test_runtime_selector_keeps_production_off_two_site_and_in_memory_fallbacks(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
):
    root = Path(__file__).resolve().parents[2]
    spec = load_openapi(root / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml")
    settings = _settings("production")
    _set_runtime_env(monkeypatch, tmp_path, "production")
    capture: dict = {}
    _install_external_provider_stubs(monkeypatch, capture)
    services = build_production_services(settings, spec)

    # The development default composition is fail-closed outside dev/test.
    with pytest.raises(RuntimeError, match="production/staging requires explicitly injected"):
        default_services(settings, spec)

    # Normal production create_app selects the production builder, never two-site-e2e.
    import bp_api.composition.production as production
    import bp_api.composition.two_site_e2e as two_site

    calls = {"production": 0, "two_site": 0}
    actual_two_site = two_site.build_two_site_e2e_services

    def selected_production(_settings, _spec):
        calls["production"] += 1
        return services

    def forbidden_two_site(*args, **kwargs):
        calls["two_site"] += 1
        raise AssertionError("production selected two-site-e2e")

    monkeypatch.setattr(production, "build_production_services", selected_production)
    monkeypatch.setattr(two_site, "build_two_site_e2e_services", forbidden_two_site)
    monkeypatch.delenv("BP_RUNTIME_COMPOSITION", raising=False)
    app = create_app(settings=settings)
    assert app.state.services is services
    assert calls == {"production": 1, "two_site": 0}

    # The real two-site composition remains explicitly restricted to dev/test.
    monkeypatch.setattr(two_site, "build_two_site_e2e_services", actual_two_site)
    with pytest.raises(RuntimeError, match="restricted to development/test"):
        actual_two_site(settings, spec)
