"""Local WU-02 checks without a database or external service."""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from contextlib import asynccontextmanager, contextmanager
from dataclasses import replace
from datetime import UTC, datetime
import json
from pathlib import Path
from typing import Any, cast

import pytest
import yaml  # type: ignore[import-untyped]
from bp_adapters.postgres.runtime import (
    PostgresAdminSiteContextPayload,
    PostgresPublicPageAdapter,
    PostgresSiteRegistry,
    _renderable_static_content,
)
from bp_application.authorization import AuthorizationService
from bp_application.context import TrustedContextService
from bp_application.discovery import SeoCrawlerResourceService
from bp_application.editorial import EditorialApplication
from bp_application.global_platform import GlobalPlatformService
from bp_domain.context import ContextKind, ContextSource, GlobalContext, SiteContext, SiteRecord
from bp_domain.errors import Denied, NotFound, ValidationFault
from bp_domain.security import AccountState, AdminPrincipal
from bp_domain.temporary_site_url import TemporarySiteUrlConfig, temporary_site_url
from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator, RefResolver
from tests.e2e.test_chat03_auth import build

from bp_api.composition.global_postgres import PostgresGlobalOperations
from bp_api.composition.presentation import PresentationPolicy
from bp_api.config.settings import Settings
from bp_api.http.public.routes import _trusted_preview_media_reference

ROOT = Path(__file__).resolve().parents[2]
SPEC = yaml.safe_load((ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml").read_text())


def _context(*, site_id: str = "site-a", host: str = "site-100.example.test") -> SiteContext:
    return SiteContext(
        ContextKind.PUBLIC_SITE,
        site_id,
        "SITE-100",
        "ACTIVE",
        host,
        ContextSource.PUBLIC_HOST,
        "request-1",
        request_host=host,
    )


def _pages() -> dict[str, dict[str, Any]]:
    page = {
        "enabled": True,
        "content_version": 1,
        "title": "About",
        "intro_text": "Intro",
        "body_sections": [{"heading": "Story", "paragraphs": ["Body"], "list_items": []}],
    }
    return {key: dict(page) for key in ("ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER")}


def _presentation(style_id: str = "STYLE_01") -> dict[str, Any]:
    """Complete transport fixture; style mappings remain in the TS catalogue."""
    return {
        "schema_version": 1,
        "style_id": style_id,
        **({"base_style_id": "STYLE_03"} if style_id == "CUSTOM" else {}),
        "palette": {"mode": "PRESET", "preset_id": "PAL-28"},
        "typography_id": "TYPE-28",
        "layout": {"width_id": "WIDTH-READING", "density_id": "DENSITY-STANDARD", "spacing_id": "STANDARD", "radius_id": "RADIUS-SUBTLE", "border_id": "BORDER-HAIRLINE", "elevation_id": "ELEVATION-FLAT"},
        "cards": {"article_card_profile_id": "CARD-15", "category_card_profile_id": "CAT-01", "author_card_profile_id": "AUTH-05"},
        "hero": {"profile_id": "HERO-14", "image_profile_id": "IMG-01"},
        "homepage": {"recipe_id": "HOME-04"},
        "article": {"layout_id": "ART-03", "image_profile_id": "IMG-01", "related_card_profile_id": "CARD-15", "measure": "NARROW", "headline_scale": "STANDARD", "meta_layout": "INLINE", "featured_media_ratio": "LANDSCAPE", "author_display": "COMPACT", "related_content_layout": "LIST"},
        "collections": {"category_layout_id": "COL-04", "tag_layout_id": "COL-04", "author_articles_layout_id": "COL-04", "search_layout_id": "COL-04", "article_card_profile_id": "CARD-15"},
        "controls": {"button_profile_id": "BTN-07"},
    }


def test_static_page_requires_renderable_sections_and_validates_public_contract() -> None:
    page = _pages()["ABOUT"]
    assert _renderable_static_content("ABOUT", {**page, "enabled": False}) is None
    assert _renderable_static_content("ABOUT", {**page, "body_sections": []}) is None
    assert (
        _renderable_static_content(
            "ABOUT", {**page, "body_sections": [{"paragraphs": [], "list_items": []}]}
        )
        is None
    )
    assert _renderable_static_content("ABOUT", None) is None
    projected = _renderable_static_content("ABOUT", page)
    assert projected is not None
    validator = Draft202012Validator(
        SPEC["components"]["schemas"]["StaticContent"], resolver=RefResolver.from_schema(SPEC)
    )
    assert validator.is_valid(projected)


@pytest.mark.asyncio
async def test_fixed_pages_use_only_authoritative_same_site_settings(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings_by_site: dict[str, dict[str, Any]] = {
        "site-a": {
            "presentation_schema_version": 1,
            "presentation_config": {"schema_version": 1, "style_id": "STYLE_01"},
            "static_pages": _pages(),
        },
        "site-b": {
            "presentation_schema_version": 1,
            "presentation_config": {"schema_version": 1, "style_id": "STYLE_02"},
            "static_pages": {"ABOUT": {**_pages()["ABOUT"], "title": "Other tenant"}},
        },
    }

    class Transactions:
        @asynccontextmanager
        async def transaction(self, context: Any) -> AsyncIterator[Any]:
            yield object()

    class Pages(PostgresPublicPageAdapter):
        def _base_rows(self, connection: Any, context: Any) -> Any:
            return {
                "display_name": "Site A",
                "timezone_id": "Asia/Kolkata",
                "status": "ACTIVE",
            }, settings_by_site[context.site_id]

        def _media(self, connection: Any, context: Any, media_id: Any) -> Any:
            return None

        def _navigation(self, connection: Any, context: Any, settings: Any) -> Any:
            return {
                "header": {"menu_key": "HEADER", "items": []},
                "footer": {"menu_key": "FOOTER", "items": []},
            }

        def _live_path(self, connection: Any, context: Any, path: Any) -> Any:
            return True

        def _seo(self, *args: Any, **kwargs: Any) -> Any:
            return {
                "baseline_indexability": "INDEX-ELIGIBLE",
                "title": "About",
                "robots": {"index": True, "follow": True},
                "structured_data": [],
            }

    adapter = Pages(
        Transactions(),
        media_cdn_origin="https://media.example.test",
        presentation_validator=PresentationPolicy(SPEC).presentation_valid,
    )
    context = _context()
    settings_by_site["site-a"]["static_pages"]["ABOUT"] = {**_pages()["ABOUT"], "enabled": False}
    assert (await adapter.resolve_page(context, path="/about", q=None, page=1, page_size=10))[
        0
    ] == 404
    settings_by_site["site-a"]["static_pages"]["ABOUT"] = {**_pages()["ABOUT"], "body_sections": []}
    assert (await adapter.resolve_page(context, path="/about", q=None, page=1, page_size=10))[
        0
    ] == 404
    settings_by_site["site-a"]["static_pages"]["ABOUT"] = {
        **_pages()["ABOUT"],
        "body_sections": [{"paragraphs": [], "list_items": []}],
    }
    assert (await adapter.resolve_page(context, path="/about", q=None, page=1, page_size=10))[
        0
    ] == 404
    settings_by_site["site-a"]["static_pages"]["ABOUT"] = _pages()["ABOUT"]
    status, page, _ = await adapter.resolve_page(
        context, path="/about", q=None, page=1, page_size=10
    )
    assert status == 200 and page["content"]["title"] == "About"
    validator = Draft202012Validator(
        SPEC["components"]["schemas"]["StaticPageData"], resolver=RefResolver.from_schema(SPEC)
    )
    assert validator.is_valid(page)
    draft = {
        "enabled": False,
        "content_version": 1,
        "title": "About [Website Name].",
        "intro_text": "[Website Name] is a publication focused on [approved primary subject].",
        "body_sections": [
            {"heading": "Topics", "paragraphs": [], "list_items": []},
            {"heading": "Publisher", "paragraphs": ["[Owner supplies approved information.]"], "list_items": []},
        ],
    }
    settings_by_site["site-a"]["static_pages"]["ABOUT"] = draft
    assert (await adapter.resolve_page(context, path="/about", q=None, page=1, page_size=10))[0] == 404
    preview_context = replace(
        context,
        kind=ContextKind.PREVIEW_SITE,
        context_source=ContextSource.PREVIEW,
        site_status="DISABLED",
    )
    status, private_page, _ = await adapter.resolve_page(
        preview_context, path="/about", q=None, page=1, page_size=10
    )
    assert status == 200
    assert private_page["content"]["title"] == draft["title"]
    assert private_page["content"]["sections"][0] == {
        "heading": "Topics", "paragraphs": [], "list_items": []
    }
    assert private_page["content"]["sections"][1]["paragraphs"][0]["runs"][0]["text"] == \
        "[Owner supplies approved information.]"
    assert Draft202012Validator(
        SPEC["components"]["schemas"]["StaticPageData"], resolver=RefResolver.from_schema(SPEC)
    ).is_valid(private_page)
    assert _renderable_static_content("ABOUT", draft) is None
    assert _renderable_static_content("ABOUT", draft, allow_draft=True) == private_page["content"]
    del settings_by_site["site-a"]["static_pages"]["ABOUT"]
    status, page, _ = await adapter.resolve_page(
        context, path="/about", q=None, page=1, page_size=10
    )
    assert status == 404 and page["site"]["site_key"] == "SITE-100"
    assert "Other tenant" not in str(page)
    monkeypatch.setattr(adapter, "_live_path", lambda connection, context, path: False)
    monkeypatch.setattr(adapter, "_manual_redirect", lambda connection, context, path: None)
    monkeypatch.setattr(adapter, "_historical_deleted", lambda connection, context, path: True)
    status, page, _ = await adapter.resolve_page(
        context, path="/article/retired", q=None, page=1, page_size=10
    )
    assert status == 410 and page["site"]["site_key"] == "SITE-100"
    assert page["presentation"]["source"] == "STORED"


def test_static_navigation_destination_requires_this_sites_renderable_page() -> None:
    adapter = PostgresPublicPageAdapter(
        cast(Any, None), media_cdn_origin="https://media.example.test"
    )
    row = {"destination_kind": "STATIC", "static_page_key": "PRIVACY"}
    context = _context()
    assert adapter._resolve_destination(None, context, row, {}) is None
    assert adapter._resolve_destination(
        None, context, row, {"PRIVACY": {**_pages()["PRIVACY"], "enabled": False}}
    ) is None
    assert adapter._resolve_destination(
        None, context, row, {"PRIVACY": {**_pages()["PRIVACY"], "body_sections": []}}
    ) is None
    destination = adapter._resolve_destination(
        None, context, row, {"PRIVACY": _pages()["PRIVACY"]}
    )
    assert destination is not None and destination["url"].endswith("/privacy-policy")


class _Row:
    def __init__(self, value: Any) -> None:
        self.value = value

    def scalar_one(self) -> Any:
        return self.value

    def fetchone(self) -> Any:
        return self.value


class _ProvisionConnection:
    def __init__(self, fail_at: str | None = None, *, homepage_ready: bool = True, identity_ready: bool = True, domain_ready: bool = True) -> None:
        self.statements: list[str] = []
        self.calls: list[tuple[str, Any]] = []
        self.fail_at = fail_at
        self.homepage_ready = homepage_ready
        self.identity_ready = identity_ready
        self.domain_ready = domain_ready
        self.created_site_key = "SITE-100"

    def execute(self, statement: Any, params: Any = None) -> Any:
        sql = str(statement)
        self.statements.append(sql)
        self.calls.append((sql, params))
        if "INSERT INTO sites" in sql:
            self.created_site_key = params["key"]
        if self.fail_at and self.fail_at in sql:
            raise RuntimeError("simulated mandatory failure")
        if "RETURNING site_id" in sql:
            return _Row("site-a")
        if "SELECT EXISTS(SELECT 1 FROM sites" in sql:
            return _Row(self.identity_ready)
        if "insert_website_site_baseline" in sql:
            return _Row(
                {
                    "settings_ready": True,
                    "navigation_ready": True,
                    "homepage_ready": self.homepage_ready,
                }
            )
        if "SELECT hostname FROM domains" in sql:
            return _Row({"hostname": params["hostname"]} if self.domain_ready else None)
        if "SELECT s.*, d.hostname canonical_domain" in sql:
            return _Row(
                {
                    "site_key": self.created_site_key,
                    "display_name": "New Site",
                    "status": "DISABLED",
                    "timezone_id": "Asia/Kolkata",
                    "created_at": datetime.now(UTC),
                    "updated_at": datetime.now(UTC),
                    "canonical_domain": "site-100.example.test",
                }
            )
        return _Row(None)


class _ProvisionEngine:
    def __init__(self, fail_at: str | None = None, *, homepage_ready: bool = True, identity_ready: bool = True, domain_ready: bool = True) -> None:
        self.connection = _ProvisionConnection(fail_at, homepage_ready=homepage_ready, identity_ready=identity_ready, domain_ready=domain_ready)
        self.committed = False
        self.rolled_back = False

    @contextmanager
    def begin(self) -> Iterator[Any]:
        try:
            yield self.connection
        except Exception:
            self.rolled_back = True
            raise
        else:
            self.committed = True


def _principal() -> AdminPrincipal:
    return AdminPrincipal("admin-a", "admin@example.test", AccountState.ACTIVE, is_super_admin=True)


@pytest.mark.asyncio
async def test_application_owns_atomic_provisioning_and_computed_readiness() -> None:
    engine = _ProvisionEngine()
    backend = PostgresGlobalOperations(
        cast(Any, engine),
        None,
        None,
        temporary_domain_suffix="example.test",
        presentation_policy=PresentationPolicy(SPEC),
    )
    status, result, _ = await backend.execute(
        "API15-G-011",
        principal=_principal(),
        context=None,
        path_params={},
        query={},
        body={
            "site_key": "SITE-100",
            "display_name": "New Site",
            "timezone_id": "Asia/Kolkata",
            "presentation": _presentation(),
            "static_pages": _pages(),
        },
        headers={"x-request-id": "request-1"},
    )
    assert status == 201 and engine.committed and not engine.rolled_back
    assert result["readiness"]["overall_ready"] is True
    assert result["temporary_hostname"] == "site-100.example.test"
    assert result["temporary_site_url"] == "https://site-100.example.test/"
    statements = "\n".join(engine.connection.statements)
    assert statements.index("INSERT INTO sites") < statements.index("insert_website_site_baseline")
    assert statements.index("insert_website_site_baseline") < statements.index(
        "INSERT INTO domains"
    )
    assert statements.index("INSERT INTO domains") < statements.index("INSERT INTO audit_events")
    baseline_params = next(params for sql, params in engine.connection.calls if "insert_website_site_baseline" in sql)
    domain_params = next(params for sql, params in engine.connection.calls if "INSERT INTO domains" in sql)
    assert baseline_params["site_id"] == domain_params["site_id"] == "site-a"
    assert domain_params["hostname"] == "site-100.example.test"
    assert "true,true" in next(sql for sql, _ in engine.connection.calls if "INSERT INTO domains" in sql)
    domain_readiness_sql, domain_readiness_params = next((sql, params) for sql, params in engine.connection.calls if "SELECT hostname FROM domains" in sql)
    assert "is_active=true AND is_canonical=true" in domain_readiness_sql
    assert domain_readiness_params == {"site_id": "site-a", "hostname": "site-100.example.test"}


@pytest.mark.asyncio
@pytest.mark.parametrize("site_key", ["SITE-15", "SITE-100"])
@pytest.mark.parametrize("style_id", ["STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05", "CUSTOM"])
async def test_provisioning_persists_complete_presentation_for_any_site(site_key: str, style_id: str) -> None:
    engine = _ProvisionEngine()
    backend = PostgresGlobalOperations(cast(Any, engine), None, None, temporary_domain_suffix="example.test", presentation_policy=PresentationPolicy(SPEC))
    config = _presentation(style_id)
    pages = {key: {"enabled": False, "content_version": 1, "title": key.title(), "intro_text": "", "body_sections": []} for key in ("ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER")}
    _, result, _ = await backend.execute("API15-G-011", principal=_principal(), context=None, path_params={}, query={}, body={"site_key": site_key, "display_name": "New Site", "timezone_id": "Asia/Kolkata", "presentation": config, "static_pages": pages}, headers={})
    baseline_params = next(params for sql, params in engine.connection.calls if "insert_website_site_baseline" in sql)
    assert json.loads(baseline_params["presentation"]) == config
    assert json.loads(baseline_params["pages"]) == pages
    assert result["temporary_hostname"] == f"{site_key.lower()}.example.test"
    assert result["temporary_site_url"] == f"https://{site_key.lower()}.example.test/"
    assert result["readiness"]["overall_ready"] is True
    assert engine.committed and not engine.rolled_back


def test_local_temporary_domains_are_development_only() -> None:
    local_backend = PostgresGlobalOperations(
        cast(Any, None),
        None,
        None,
        temporary_domain_suffix="preview.localhost",
        allow_local_temporary_hosts=True,
    )
    assert local_backend._temporary_hostname("SITE-15") == "site-15.preview.localhost"

    production_backend = PostgresGlobalOperations(
        cast(Any, None),
        None,
        None,
        temporary_domain_suffix="preview.localhost",
    )
    with pytest.raises(ValidationFault, match="explicit DNS suffix"):
        production_backend._temporary_hostname("SITE-15")


@pytest.mark.asyncio
@pytest.mark.parametrize("site_key", ["SITE-15", "SITE-100"])
async def test_persisted_local_hostname_uses_platform_http_port(site_key: str) -> None:
    engine = _ProvisionEngine()
    backend = PostgresGlobalOperations(
        cast(Any, engine), None, None, temporary_domain_suffix="preview.localhost",
        allow_local_temporary_hosts=True,
        temporary_site_url_config=TemporarySiteUrlConfig("http", 3015),
        presentation_policy=PresentationPolicy(SPEC),
    )
    _, result, _ = await backend.execute(
        "API15-G-011", principal=_principal(), context=None, path_params={}, query={},
        body={"site_key": site_key, "display_name": "New Site", "timezone_id": "Asia/Kolkata", "presentation": _presentation("CUSTOM"), "static_pages": _pages()}, headers={},
    )
    assert result["temporary_hostname"] == f"{site_key.lower()}.preview.localhost"
    assert result["temporary_site_url"] == f"http://{site_key.lower()}.preview.localhost:3015/"


def test_temporary_url_builder_rejects_nonlocal_http_and_malformed_hosts() -> None:
    with pytest.raises(ValueError, match="localhost"):
        temporary_site_url("site.preview.example.com", TemporarySiteUrlConfig("http", 3015))
    with pytest.raises(ValueError, match="hostname"):
        temporary_site_url("site.preview.localhost/path?x=1", TemporarySiteUrlConfig("http", 3015))


def test_temporary_site_url_platform_configuration_is_environment_scoped(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BP_ENV", "development")
    monkeypatch.setenv("BP_TEMP_DOMAIN_SUFFIX", "preview.localhost")
    monkeypatch.setenv("BP_TEMP_SITE_SCHEME", "http")
    monkeypatch.setenv("BP_TEMP_SITE_PORT", "3015")
    local = Settings.from_env()
    assert local.temporary_domain_suffix == "preview.localhost"
    assert temporary_site_url("site-15.preview.localhost", local.temporary_site_url_config) == "http://site-15.preview.localhost:3015/"
    monkeypatch.setenv("BP_TEMP_DOMAIN_SUFFIX", "preview.example.com")
    with pytest.raises(ValueError, match="localhost suffix"):
        Settings.from_env()
    monkeypatch.setenv("BP_TEMP_DOMAIN_SUFFIX", "preview.localhost")
    monkeypatch.setenv("BP_ENV", "production")
    with pytest.raises(ValueError, match="must use HTTPS"):
        Settings.from_env()
    monkeypatch.setenv("BP_TEMP_DOMAIN_SUFFIX", "preview.example.com")
    monkeypatch.setenv("BP_TEMP_SITE_SCHEME", "https")
    monkeypatch.delenv("BP_TEMP_SITE_PORT")
    deployed = Settings.from_env()
    assert temporary_site_url("site-100.preview.example.com", deployed.temporary_site_url_config) == "https://site-100.preview.example.com/"


@pytest.mark.asyncio
@pytest.mark.parametrize("failure", ["INSERT INTO sites", "insert_website_site_baseline", "INSERT INTO domains", "INSERT INTO audit_events"])
async def test_mandatory_failure_rolls_back_application_transaction(failure: str) -> None:
    engine = _ProvisionEngine(failure)
    backend = PostgresGlobalOperations(
        cast(Any, engine),
        None,
        None,
        temporary_domain_suffix="example.test",
        presentation_policy=PresentationPolicy(SPEC),
    )
    with pytest.raises(RuntimeError, match="simulated mandatory failure"):
        await backend.execute(
            "API15-G-011",
            principal=_principal(),
            context=None,
            path_params={},
            query={},
            body={
                "site_key": "SITE-100",
                "display_name": "New Site",
                "timezone_id": "Asia/Kolkata",
                "presentation": _presentation(),
                "static_pages": _pages(),
            },
            headers={},
        )
    assert engine.rolled_back and not engine.committed


@pytest.mark.asyncio
@pytest.mark.parametrize("missing", ["identity", "domain"])
async def test_missing_target_site_readiness_rolls_back_provisioning(missing: str) -> None:
    engine = _ProvisionEngine(identity_ready=missing != "identity", domain_ready=missing != "domain")
    backend = PostgresGlobalOperations(cast(Any, engine), None, None, temporary_domain_suffix="example.test", presentation_policy=PresentationPolicy(SPEC))
    with pytest.raises(RuntimeError, match="website identity persistence failed|mandatory website provisioning readiness failed"):
        await backend.execute("API15-G-011", principal=_principal(), context=None, path_params={}, query={}, body={"site_key": "SITE-15", "display_name": "New Site", "timezone_id": "Asia/Kolkata", "presentation": _presentation(), "static_pages": _pages()}, headers={})
    assert engine.rolled_back and not engine.committed


@pytest.mark.asyncio
async def test_style_only_presentation_is_rejected_before_site_insert() -> None:
    engine = _ProvisionEngine()
    backend = PostgresGlobalOperations(cast(Any, engine), None, None, temporary_domain_suffix="example.test", presentation_policy=PresentationPolicy(SPEC))
    with pytest.raises(ValidationFault):
        await backend.execute("API15-G-011", principal=_principal(), context=None, path_params={}, query={}, body={"site_key": "SITE-15", "display_name": "New Site", "timezone_id": "Asia/Kolkata", "presentation": {"schema_version": 1, "style_id": "STYLE_01"}, "static_pages": _pages()}, headers={})
    assert not any("INSERT INTO sites" in sql for sql in engine.connection.statements)


@pytest.mark.asyncio
async def test_missing_homepage_baseline_rolls_back_provisioning() -> None:
    engine = _ProvisionEngine(homepage_ready=False)
    backend = PostgresGlobalOperations(
        cast(Any, engine),
        None,
        None,
        temporary_domain_suffix="example.test",
        presentation_policy=PresentationPolicy(SPEC),
    )
    with pytest.raises(RuntimeError, match="mandatory website provisioning readiness failed"):
        await backend.execute(
            "API15-G-011",
            principal=_principal(),
            context=None,
            path_params={},
            query={},
            body={
                "site_key": "SITE-100",
                "display_name": "New Site",
                "timezone_id": "Asia/Kolkata",
                "presentation": _presentation(),
                "static_pages": _pages(),
            },
            headers={},
        )
    assert engine.rolled_back and not engine.committed


def test_universal_home_v1_registry_sql_is_exact_and_tenant_scoped() -> None:
    migration = (
        ROOT / "database/migrations/0021_DB-MIG-021__atomic-website-provisioning.sql"
    ).read_text()
    assert "(target_site_id,'featured-posts','POST_SELECTION','UNIVERSAL-HOME-V1'" in migration
    assert "'FEATURED_POSTS',false,NULL,NULL,true,true,true,false" in migration
    assert (
        "(target_site_id,'featured-categories','CATEGORY_SELECTION','UNIVERSAL-HOME-V1'"
        in migration
    )
    assert "'FEATURED_CATEGORIES',false,NULL,NULL,true,true,false,true" in migration
    assert "COUNT(*)=2 AND COUNT(*) FILTER" in migration
    assert "FROM public.homepage_sections WHERE site_id=target_site_id" in migration
    assert (
        "AND allow_visibility_edit AND allow_label_edit AND allow_post_selection\n"
        "     AND NOT allow_category_selection"
    ) in migration
    assert (
        "AND allow_visibility_edit AND allow_label_edit AND NOT allow_post_selection\n"
        "     AND allow_category_selection"
    ) in migration
    for required in (
        "section_kind='POST_SELECTION'",
        "section_kind='CATEGORY_SELECTION'",
        "contract_version='UNIVERSAL-HOME-V1'",
        "position_key='FEATURED_POSTS'",
        "position_key='FEATURED_CATEGORIES'",
        "allow_visibility_edit",
        "allow_label_edit",
        "allow_post_selection",
        "allow_category_selection",
    ):
        assert required in migration
    assert "'TOGGLE_ONLY'" not in migration


def test_provisioning_sql_has_exact_fixed_pages_menus_and_domain_uniqueness() -> None:
    migration = (ROOT / "database/migrations/0021_DB-MIG-021__atomic-website-provisioning.sql").read_text()
    tenancy = (ROOT / "database/migrations/0002_DB-MIG-002__tenancy-registry.sql").read_text()
    assert "pages ?& ARRAY['ABOUT','CONTACT','PRIVACY','TERMS','DISCLAIMER']" in migration
    assert "pages - 'ABOUT' - 'CONTACT' - 'PRIVACY' - 'TERMS' - 'DISCLAIMER'" in migration
    assert "VALUES (target_site_id,'HEADER'),(target_site_id,'FOOTER')" in migration
    assert "FROM public.site_settings WHERE site_id=target_site_id" in migration
    assert "FROM public.navigation_menus\n  WHERE site_id=target_site_id" in migration
    assert "CONSTRAINT uq_domains__hostname_normalized UNIQUE (hostname_normalized)" in tenancy
    assert "ON domains(site_id) WHERE is_canonical AND is_active" in tenancy


def test_presentation_falls_back_without_cross_site_references() -> None:
    adapter = PostgresPublicPageAdapter(
        cast(Any, None),
        media_cdn_origin="https://media.example.test",
        presentation_validator=PresentationPolicy(SPEC).presentation_valid,
    )

    class Connection:
        def execute(self, statement: Any, params: Any = None) -> Any:
            assert params["site_id"] == "site-a"
            return _Row(None)

    config = {
        "schema_version": 1,
        "style_id": "STYLE_03",
        "branding": {"logo_media_id": "00000000-0000-0000-0000-000000000001"},
    }
    assert adapter._presentation(
        {"presentation_schema_version": 1, "presentation_config": config}, Connection(), _context()
    ) == {
        "config": {"schema_version": 1, "style_id": "STYLE_03"},
        "source": "PRESET_DEFAULT",
    }
    assert adapter._presentation({}, Connection(), _context())["source"] == "SAFE_DEFAULT"


def test_site_100_preview_media_parser_preserves_site_binding() -> None:
    media_id = "00000000-0000-0000-0000-000000000001"
    origin = "https://media.example.test"
    assert _trusted_preview_media_reference(
        f"{origin}/m/SITE-100/{media_id}/native_webp.webp",
        media_origin=origin,
    ) == ("SITE-100", media_id)
    assert (
        _trusted_preview_media_reference(
            f"https://other.example.test/m/SITE-100/{media_id}/native_webp.webp",
            media_origin=origin,
        )
        is None
    )


def test_seo_uses_stored_fields_and_og_fallback_order() -> None:
    adapter = PostgresPublicPageAdapter(
        cast(Any, None),
        media_cdn_origin="https://media.example.test",
        temporary_domain_suffix="example.test",
    )
    context = _context(host="www.site-a.test")
    site = {"display_name": "Site A", "status": "ACTIVE", "locale_code": "en-IN"}
    settings = {
        "seo_defaults": {
            "seo_title": "{page_title} | {site_name}",
            "meta_description": "{page_summary} - {site_name}",
        }
    }
    social = {"url": "https://media.example.test/default.webp"}
    featured = {"url": "https://media.example.test/featured.webp"}
    post_og = {"url": "https://media.example.test/post-og.webp"}
    kwargs: dict[str, Any] = dict(
        page_id="PUB-ARTICLE-01",
        page_class="ARTICLE",
        page_title="Post",
        summary="Excerpt",
        path="/article/post",
        site=site,
        settings=settings,
        explicit_title="Authored",
        explicit_description="Authored summary",
    )
    seo = adapter._seo(
        context, **kwargs, og_image=post_og, featured_media=featured, default_social_image=social
    )
    assert seo["title"] == "Authored | Site A"
    assert seo["meta_description"] == "Authored summary - Site A"
    assert seo["open_graph"]["image"] is post_og
    assert (
        adapter._seo(context, **kwargs, featured_media=featured, default_social_image=social)[
            "open_graph"
        ]["image"]
        is featured
    )
    assert (
        adapter._seo(context, **kwargs, default_social_image=social)["open_graph"]["image"]
        is social
    )
    assert "image" not in adapter._seo(context, **kwargs)["open_graph"]
    temporary = adapter._seo(_context(), **kwargs, default_social_image=social)
    assert temporary["robots"]["index"] is False


@pytest.mark.asyncio
async def test_disabled_admin_allowed_only_when_assigned_public_remains_closed() -> None:
    class Sites:
        async def get_site_by_key(self, key: Any) -> Any:
            return SiteRecord("site-a", key, "", "DISABLED")

        async def resolve_host(self, host: Any) -> Any:
            return SiteRecord("site-a", "SITE-100", host, "DISABLED")

    contexts = TrustedContextService(cast(Any, Sites()))
    assigned = AdminPrincipal(
        "admin-a",
        "a@example.test",
        AccountState.ACTIVE,
        site_permissions={"SITE-100": frozenset({"site_settings.view"})},
    )
    unassigned = AdminPrincipal("admin-b", "b@example.test", AccountState.ACTIVE)
    assert (
        await contexts.admin_site("SITE-100", principal=assigned, request_id="r")
    ).canonical_domain == ""
    with pytest.raises(NotFound):
        await contexts.admin_site("SITE-100", principal=unassigned, request_id="r")
    with pytest.raises(NotFound):
        await contexts.public("site-100.example.test", request_id="r")


@pytest.mark.asyncio
async def test_registry_admin_lookup_does_not_require_canonical_domain() -> None:
    class Connection:
        def execute(self, statement: Any, params: Any = None) -> Any:
            sql = str(statement)
            assert "LEFT JOIN domains" in sql
            assert params == {"site_key": "SITE-100"}
            return _Row(
                {
                    "site_id": "site-a",
                    "site_key": "SITE-100",
                    "display_name": "New Site",
                    "status": "DISABLED",
                    "timezone_id": "Asia/Kolkata",
                    "locale_code": None,
                    "updated_at": datetime.now(UTC),
                    "canonical_domain": None,
                }
            )

    class Engine:
        @contextmanager
        def connect(self) -> Iterator[Any]:
            yield Connection()

    site = await PostgresSiteRegistry(cast(Any, Engine())).get_site_by_key("SITE-100")
    assert site is not None and site.canonical_domain == "" and site.lifecycle == "DISABLED"


@pytest.mark.asyncio
async def test_local_temporary_host_requires_active_registered_domain() -> None:
    class Connection:
        registered = False

        def execute(self, statement: Any, params: Any = None) -> Any:
            sql = str(statement)
            assert "requested.hostname_normalized" in sql
            assert params == {"host": "site-15.preview.localhost"}
            if not self.registered:
                return _Row(None)
            return _Row(
                {
                    "site_id": "site-a",
                    "site_key": "SITE-15",
                    "display_name": "First Site",
                    "status": "ACTIVE",
                    "timezone_id": "Asia/Kolkata",
                    "locale_code": "en",
                    "updated_at": datetime.now(UTC),
                    "canonical_domain": "site-15.preview.localhost",
                }
            )

    class Engine:
        connection = Connection()

        @contextmanager
        def connect(self) -> Iterator[Any]:
            yield self.connection

    engine = cast(Any, Engine())
    registry = PostgresSiteRegistry(engine)
    assert await registry.resolve_host("site-15.preview.localhost") is None
    engine.connection.registered = True
    site = await registry.resolve_host("site-15.preview.localhost")
    assert site is not None and site.site_key == "SITE-15"


@pytest.mark.asyncio
async def test_local_site_context_never_infers_unregistered_preview_alias() -> None:
    class Connection:
        def execute(self, statement: Any, params: Any = None) -> Any:
            assert "SELECT hostname FROM domains" in str(statement)
            return _Row(None)

    class SiteTransactions:
        @asynccontextmanager
        async def transaction(self, context: Any) -> AsyncIterator[Any]:
            yield Connection()

    class Context:
        site_id = "site-a"
        site_key = "SITE-01"
        display_name = "First Site"
        site_status = "ACTIVE"

    principal = AdminPrincipal(
        "admin-a",
        "a@example.test",
        AccountState.ACTIVE,
        site_permissions={"SITE-01": frozenset({"site_settings.view"})},
    )
    strict_payload = PostgresAdminSiteContextPayload(
        cast(Any, SiteTransactions()),
        "preview.localhost",
    )
    strict_result = await strict_payload.build(principal, cast(Any, Context()))
    assert "temporary_site_url" not in strict_result


@pytest.mark.asyncio
async def test_temporary_host_crawler_policy_disallows_all() -> None:
    class Seo:
        async def get_site_seo(self, context: Any) -> Any:
            return {"index_policy": "INDEX"}

    class Sitemaps:
        async def get_active_resource(self, site_id: Any, path: Any) -> Any:
            return b"<xml/>"

    crawler = SeoCrawlerResourceService(cast(Any, Seo()), cast(Any, Sitemaps()), "example.test")
    status, body, _ = await crawler.robots(_context())
    assert status == 200 and b"Disallow: /\n" in body
    assert (await crawler.sitemap(_context(), "/sitemap.xml"))[0] == 404


def test_crawler_http_routes_are_host_scoped_and_unknown_host_is_neutral() -> None:
    class Crawler:
        async def robots(self, context: Any) -> Any:
            assert context.site_key == "SITE-01"
            return 200, b"User-agent: *\nDisallow: /_preview/\n", "text/plain"

        async def sitemap(self, context: Any, path: Any) -> Any:
            assert context.site_key == "SITE-01"
            assert path in {"/sitemap.xml", "/sitemaps/pages.xml"}
            return 200, b"<xml/>", "application/xml"

    app, services, *_ = cast(Any, build)()
    services.crawler_resources = Crawler()
    known = TestClient(app, base_url="https://whatsyourrashi.in")
    assert known.get("/robots.txt").status_code == 200
    assert known.get("/sitemap.xml").status_code == 200
    assert known.get("/sitemaps/pages.xml").status_code == 200
    unknown = TestClient(app, base_url="https://unknown.example")
    response = unknown.get("/robots.txt")
    assert response.status_code == 404 and "SITE-01" not in response.text
    fixed = unknown.get("/api/v1/public/page", params={"path": "/about"})
    assert fixed.status_code == 404 and "site" not in fixed.json()


@pytest.mark.asyncio
async def test_typed_site_settings_write_and_reference_ownership() -> None:
    class Repository:
        def __init__(self) -> None:
            self.writes: list[dict[str, Any]] = []
            self.allow_refs = True

        async def relationships_exist(self, context: Any, **kwargs: Any) -> Any:
            assert context.site_id == "site-a"
            return self.allow_refs

        async def update_site_settings(
            self, context: Any, *, actor_admin_id: Any, values: Any
        ) -> Any:
            self.writes.append(values)
            return [{"key": key, "value": value} for key, value in values.items()]

    class Audit:
        async def append(self, *args: Any, **kwargs: Any) -> Any:
            pass

    repo = Repository()
    policy = PresentationPolicy(SPEC)
    app = EditorialApplication(
        cast(Any, repo),
        AuthorizationService(cast(Any, None)),
        Audit(),
        presentation_validator=policy.presentation_valid,
        static_pages_validator=policy.static_pages.is_valid,
    )
    context = SiteContext(
        ContextKind.ADMIN_SITE,
        "site-a",
        "SITE-100",
        "DISABLED",
        "",
        ContextSource.ADMIN_SELECTION,
        "request-1",
    )
    manager = AdminPrincipal(
        "admin-a",
        "a@example.test",
        AccountState.ACTIVE,
        site_permissions={"SITE-100": frozenset({"site_settings.view", "site_settings.edit"})},
    )
    config = {"schema_version": 1, "style_id": "STYLE_01"}
    body = {
        "settings": [
            {"key": "presentation_config", "value": config},
            {"key": "static_pages", "value": _pages()},
        ]
    }
    status, _, _ = await app._settings("API15-S-097", context, manager, body)
    assert status == 200 and repo.writes[-1] == {
        "presentation_config": config,
        "static_pages": _pages(),
    }
    assert "presentation_schema_version" not in repo.writes[-1]
    with pytest.raises(ValidationFault):
        await app._settings(
            "API15-S-097",
            context,
            manager,
            {"settings": [{"key": "presentation_config", "value": {**config, "css": "body{}"}}]},
        )
    with pytest.raises(ValidationFault):
        await app._settings(
            "API15-S-097",
            context,
            manager,
            {"settings": [{"key": "presentation_schema_version", "value": 2}]},
        )
    repo.allow_refs = False
    with pytest.raises(NotFound):
        await app._settings(
            "API15-S-097",
            context,
            manager,
            {
                "settings": [
                    {
                        "key": "presentation_config",
                        "value": {
                            **config,
                            "branding": {"logo_media_id": "00000000-0000-0000-0000-000000000001"},
                        },
                    }
                ]
            },
        )
    with pytest.raises(NotFound):
        await app._settings(
            "API15-S-097",
            context,
            manager,
            {
                "settings": [
                    {
                        "key": "presentation_config",
                        "value": {
                            **config,
                            "hero": {
                                "cta": {
                                    "enabled": True,
                                    "label": "Go",
                                    "navigation_item_id": "00000000-0000-0000-0000-000000000001",
                                }
                            },
                        },
                    }
                ]
            },
        )
    outsider = AdminPrincipal("admin-b", "b@example.test", AccountState.ACTIVE)
    with pytest.raises(Denied):
        await app._settings("API15-S-097", context, outsider, body)


@pytest.mark.asyncio
async def test_server_enforces_content_editor_and_manager_tag_permissions() -> None:
    class Tags:
        async def list_tags(self, context: Any, *, page: Any, page_size: Any) -> Any:
            return [], False

        async def slug_available(self, context: Any, *, entity: Any, slug: Any) -> Any:
            return True

        async def create_tag(self, context: Any, *, actor_admin_id: Any, values: Any) -> Any:
            return {"tag_id": "tag-a", **values}

    class Audit:
        async def append(self, *args: Any, **kwargs: Any) -> Any:
            pass

    app = EditorialApplication(cast(Any, Tags()), AuthorizationService(cast(Any, None)), Audit())
    context = SiteContext(
        ContextKind.ADMIN_SITE,
        "site-a",
        "SITE-100",
        "ACTIVE",
        "site-100.example.test",
        ContextSource.ADMIN_SELECTION,
        "request-1",
    )
    editor = AdminPrincipal(
        "editor",
        "editor@example.test",
        AccountState.ACTIVE,
        site_permissions={"SITE-100": frozenset({"tags.view"})},
    )
    manager = AdminPrincipal(
        "manager",
        "manager@example.test",
        AccountState.ACTIVE,
        site_permissions={
            "SITE-100": frozenset({"tags.view", "tags.create", "tags.edit", "tags.delete"})
        },
    )
    assert (await app._tags("API15-S-040", context, editor, {}, None))[0] == 200
    with pytest.raises(Denied):
        await app._tags("API15-S-041", context, editor, {}, {"name": "Tag"})
    assert (await app._tags("API15-S-041", context, manager, {}, {"name": "Tag"}))[0] == 201


@pytest.mark.asyncio
async def test_domain_and_lifecycle_effects_follow_successful_commit() -> None:
    events = []

    class Backend:
        async def execute(self, operation_id: Any, **kwargs: Any) -> Any:
            events.append("committed")
            return 200, {"domain": {}}, {}

    class Sites:
        async def get_site_by_key(self, key: Any) -> Any:
            return SiteRecord("site-a", key, "canonical.example.test", "ACTIVE")

    class Effects:
        async def emit(self, effect: Any) -> Any:
            events.append(effect.effect_type)
            assert effect.context.site_id == "site-a"

    app = GlobalPlatformService(
        cast(Any, Backend()),
        cast(Any, None),
        "https://admin.example.test/setup",
        downstream=cast(Any, Effects()),
        site_contexts=TrustedContextService(cast(Any, Sites())),
    )
    global_context = GlobalContext(ContextKind.GLOBAL, ContextSource.GLOBAL_AUTHORITY, "request-1")
    await app.execute(
        "API15-G-022",
        principal=_principal(),
        context=global_context,
        path_params={"site_key": "SITE-100"},
        query={},
        body={},
        headers={},
    )
    assert events == ["committed", "DOMAIN_CHANGE"]


@pytest.mark.asyncio
async def test_production_canonical_promotion_is_site_scoped_and_transactional() -> None:
    class Connection:
        def __init__(self) -> None:
            self.calls: list[tuple[str, Any]] = []

        def execute(self, statement: Any, params: Any = None) -> Any:
            sql = str(statement)
            self.calls.append((sql, params))
            if sql == "SELECT site_id FROM sites WHERE site_key=:k":
                return _Row({"site_id": "site-a"})
            if sql.startswith("SELECT * FROM domains WHERE domain_id=:d AND site_id=:s"):
                assert params == {"d": "production-domain", "s": "site-a"}
                return _Row(
                    {"domain_id": "production-domain", "site_id": "site-a", "is_canonical": False}
                )
            if sql.startswith("SELECT * FROM domains WHERE domain_id=:d"):
                return _Row(
                    {
                        "domain_id": "production-domain",
                        "hostname": "production.test",
                        "is_canonical": True,
                        "is_active": True,
                        "created_at": datetime.now(UTC),
                        "updated_at": datetime.now(UTC),
                    }
                )
            return _Row(None)

    class Engine:
        def __init__(self) -> None:
            self.connection = Connection()
            self.committed = False

        @contextmanager
        def begin(self) -> Iterator[Any]:
            yield self.connection
            self.committed = True

    engine = Engine()
    backend = PostgresGlobalOperations(cast(Any, engine), None, None)
    status, payload, _ = await backend.execute(
        "API15-G-022",
        principal=_principal(),
        context=None,
        path_params={"site_key": "SITE-100", "domain_id": "production-domain"},
        query={},
        body={},
        headers={},
    )
    assert status == 200 and engine.committed and payload["domain"]["is_canonical"]
    calls = engine.connection.calls
    lock = next(i for i, (sql, _) in enumerate(calls) if "FOR UPDATE" in sql)
    demote = next(i for i, (sql, _) in enumerate(calls) if "SET is_canonical=false" in sql)
    promote = next(i for i, (sql, _) in enumerate(calls) if "SET is_canonical=true" in sql)
    assert lock < demote < promote
    assert calls[demote][1] == {"s": "site-a"}
    assert calls[promote][1] == {"d": "production-domain", "s": "site-a"}
