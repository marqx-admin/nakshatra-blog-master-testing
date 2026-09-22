from __future__ import annotations

import asyncio
import hashlib
import json
import sys
from pathlib import Path

import pytest
import yaml

ROOT = Path(__file__).resolve().parents[2]
for rel in [
    "apps/api/src",
    "packages/python/bp-domain/src",
    "packages/python/bp-application/src",
    "packages/python/bp-ports/src",
]:
    sys.path.insert(0, str(ROOT / rel))

from bp_application.authorization import AuthorizationService
from bp_application.context import TrustedContextService
from bp_application.editorial import EditorialApplication
from bp_domain.context import ContextKind, ContextSource, SiteContext, SiteRecord
from bp_domain.editorial import (
    ARTICLE_BLOCK_TYPES,
    PERSISTED_POST_STATES,
    STATIC_PAGE_ROUTES,
    validate_article_body,
    validate_embed_provider_registry,
    validate_link_destination,
    validate_navigation_destination,
    validate_site_settings_entries,
    validate_structured_data_inputs,
)
from bp_domain.errors import NotFound, ValidationFault, VersionConflict
from bp_domain.security import AccountState, AdminPrincipal

CANON = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml"
CANON_SHA = "690a99b8580e63359527b719fe4826f45f7a1f8f3fd753beaefb45978ab4a5ca"


def test_rc8_canonical_contract_is_self_consistent_and_complete():
    assert hashlib.sha256(CANON.read_bytes()).hexdigest() == CANON_SHA
    spec = yaml.safe_load(CANON.read_text())
    assert spec["info"]["version"] == "1.0-RC8"
    authority = spec["x-doc15-authority"]
    assert authority["version"] == "1.0-RC8"
    assert authority["operation_count"] == 113
    assert authority["unique_route_paths"] == 86
    assert authority["schema_helper_count"] == 221
    assert authority["resolved_internal_schema_references"] == 1311
    assert authority["canonical_operation_subtotals"] == {
        "public_and_preview": 2,
        "auth": 12,
        "site_admin": 63,
        "global_admin": 36,
        "total": 113,
    }
    operations = []
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if isinstance(op, dict) and op.get("operationId"):
                operations.append((op["operationId"], method.upper(), path))
    assert len(operations) == 113
    assert len({o[0] for o in operations}) == 113
    assert len({(o[1], o[2]) for o in operations}) == 113
    assert ("API15-AUTH-012", "GET", "/api/v1/auth/selectable-sites") in operations
    assert ("API15-S-002", "GET", "/api/v1/admin/sites/{site_key}/dashboard") in operations


def test_cb_w2_02_structured_data_inputs_is_one_lossless_object_model():
    value = {"Article": {"headline": "Mars transit", "keywords": ["Mars", "transit"], "featured": True}}
    assert validate_structured_data_inputs(value) == value
    with pytest.raises(ValidationFault):
        validate_structured_data_inputs([{"type": "Article", "values": {"headline": "x"}}])
    with pytest.raises(ValidationFault):
        validate_structured_data_inputs({"Article": {"@type": "Article"}})


def test_cb_w2_03_static_internal_links_are_typed_by_frozen_static_page_key():
    for key in STATIC_PAGE_ROUTES:
        validate_link_destination({"kind": "INTERNAL", "target_type": "STATIC", "static_page_key": key})
        assert validate_navigation_destination({"kind": "STATIC", "static_page_key": key}, "destination")["static_page_key"] == key
    with pytest.raises(ValidationFault):
        validate_link_destination({"kind": "INTERNAL", "target_type": "STATIC", "target_id": "00000000-0000-0000-0000-000000000001"})
    with pytest.raises(ValidationFault):
        validate_navigation_destination({"kind": "STATIC", "url": "/about"}, "destination")


def test_cb_w2_05_structured_site_settings_round_trip_as_json_values_not_strings():
    entries = [
        {"key": "contact_info", "value": {"email": "editor@example.test", "phones": ["1", "2"]}},
        {"key": "social_profiles", "value": {"primary": "https://example.test"}},
        {"key": "seo_defaults", "value": {"title_suffix": "Nakshatra"}},
        {"key": "analytics_verification", "value": {"token": "abc"}},
    ]
    result = validate_site_settings_entries(entries)
    assert result["contact_info"] == entries[0]["value"]
    assert isinstance(result["contact_info"], dict)
    with pytest.raises(ValidationFault):
        validate_site_settings_entries([{"key": "contact_info", "value": json.dumps({"email": "x"})}])
    with pytest.raises(ValidationFault):
        validate_site_settings_entries([{"key": "seo_defaults", "value": {"nested": {"x": 1}}}])


def test_cb_w2_06_embed_registry_is_configuration_owned_fail_closed_and_url_safe():
    production = json.loads((ROOT / "config/content/embed-provider-registry.v1.json").read_text())
    assert validate_embed_provider_registry(production) == {}
    body = {"content_schema_version": 1, "blocks": [{
        "block_id": "e1", "type": "EMBED", "provider_key": "not-configured", "source_url_or_id": "https://example.test/e/1"
    }]}
    with pytest.raises(ValidationFault):
        validate_article_body(body, embed_registry={})
    synthetic = validate_embed_provider_registry({
        "version": "test-only",
        "providers": [{"provider_key": "TEST_PROVIDER", "source_kind": "URL", "allowed_hosts": ["embed.example.test"]}],
    })
    safe = {"content_schema_version": 1, "blocks": [{
        "block_id": "e1", "type": "EMBED", "provider_key": "TEST_PROVIDER", "source_url_or_id": "https://embed.example.test/item/1"
    }]}
    assert validate_article_body(safe, embed_registry=synthetic) == 1
    unsafe = {"content_schema_version": 1, "blocks": [{
        "block_id": "e1", "type": "EMBED", "provider_key": "TEST_PROVIDER", "source_url_or_id": "http://embed.example.test/item/1"
    }]}
    with pytest.raises(ValidationFault):
        validate_article_body(unsafe, embed_registry=synthetic)


class _Sites:
    def __init__(self):
        self.records = {
            "SITE-01": SiteRecord("10000000-0000-4000-8000-000000000001", "SITE-01", "WhatsYourRashi.in", "ACTIVE", display_name="One"),
            "SITE-02": SiteRecord("10000000-0000-4000-8000-000000000002", "SITE-02", "ApkiRashi.com", "ACTIVE", display_name="Two"),
            "SITE-03": SiteRecord("10000000-0000-4000-8000-000000000003", "SITE-03", "DailyRashi360.com", "SUSPENDED", display_name="Three"),
        }
    async def resolve_host(self, host):
        return next((s for s in self.records.values() if s.canonical_domain.lower() == host.lower()), None)
    async def get_site_by_key(self, key):
        return self.records.get(key)
    async def get_site_by_id(self, site_id):
        return next((s for s in self.records.values() if s.site_id == site_id), None)
    async def list_sites(self):
        return list(self.records.values())


def test_cb_w2_07_selector_returns_only_active_assigned_sites_and_does_not_grant_access():
    async def run():
        contexts = TrustedContextService(_Sites())
        principal = AdminPrincipal(
            "a1", "site@example.test", AccountState.ACTIVE,
            site_permissions={"SITE-01": frozenset({"posts.view"}), "SITE-03": frozenset({"posts.view"})},
        )
        sites = await contexts.selectable_sites(principal=principal)
        assert [s.site_key for s in sites] == ["SITE-01"]
        with pytest.raises(NotFound):
            await contexts.admin_site("SITE-02", principal=principal, request_id="r1")
        ctx = await contexts.admin_site("SITE-01", principal=principal, request_id="r1")
        assert ctx.site_key == "SITE-01"
        super_admin = AdminPrincipal("sa", "super@example.test", AccountState.ACTIVE, is_super_admin=True)
        assert [s.site_key for s in await contexts.selectable_sites(principal=super_admin)] == ["SITE-01", "SITE-02"]
    asyncio.run(run())


class _Audit:
    async def append(self, *args, **kwargs):
        return None


class _Repo:
    def __init__(self):
        self.post = {"post_id": "p1", "status": "DRAFT", "version": 3}
        self.autosaves = {}
    async def get_post(self, context, post_id):
        return dict(self.post) if post_id == "p1" else None
    async def relationships_exist(self, context, **kwargs):
        return True
    async def save_autosave(self, context, *, post_id, editor_admin_id, editor_instance_id, base_version, working_copy, content_schema_version):
        key = (context.site_id, post_id, editor_admin_id, editor_instance_id)
        value = {
            "autosave_id": f"as-{editor_instance_id}", "post_id": post_id, "editor_instance_id": editor_instance_id,
            "base_version": base_version, "working_copy": working_copy, "saved_at": "2026-09-11T00:00:00Z",
        }
        self.autosaves[key] = value
        return dict(value)
    async def get_latest_autosave(self, context, *, post_id, editor_admin_id, editor_instance_id):
        return self.autosaves.get((context.site_id, post_id, editor_admin_id, editor_instance_id))
    async def slug_available(self, context, **kwargs):
        return True


def test_cb_w2_01_autosave_separates_same_user_tabs_and_rejects_stale_base_version():
    async def run():
        repo = _Repo()
        app = EditorialApplication(repo, AuthorizationService(None), _Audit())
        context = SiteContext(
            ContextKind.ADMIN_SITE, "10000000-0000-4000-8000-000000000001", "SITE-01", "ACTIVE", "WhatsYourRashi.in",
            ContextSource.ADMIN_SELECTION, "request-1",
        )
        principal = AdminPrincipal(
            "admin-1", "editor@example.test", AccountState.ACTIVE,
            site_permissions={"SITE-01": frozenset({"posts.view", "posts.edit"})},
        )
        working = {"body": {"content_schema_version": 1, "blocks": [{"block_id": "b1", "type": "PARAGRAPH", "content": {"runs": [{"text": "draft", "marks": []}]}}]}}
        for tab in ("tab-A", "tab-B"):
            status, saved, _ = await app._autosave(context, principal, "p1", {"base_version": 3, "editor_instance_id": tab, "working_copy": working}, "API15-S-014")
            assert status == 201 and saved["editor_instance_id"] == tab
        assert len(repo.autosaves) == 2
        _, a, _ = await app._latest_autosave(context, principal, "p1", {"editor_instance_id": "tab-A"})
        _, b, _ = await app._latest_autosave(context, principal, "p1", {"editor_instance_id": "tab-B"})
        assert a["autosave_id"] != b["autosave_id"]
        with pytest.raises(VersionConflict):
            await app._autosave(context, principal, "p1", {"base_version": 2, "editor_instance_id": "tab-A", "working_copy": working}, "API15-S-014")
    asyncio.run(run())


def test_cb_w2_04_homepage_lead_is_persisted_by_forward_only_same_site_fk():
    migration = (ROOT / "database/migrations/0017_DB-MIG-017__wave2-contract-reconciliation.sql").read_text()
    normalized = " ".join(migration.lower().split())
    assert "alter table site_settings add column homepage_lead_post_id uuid null" in normalized
    assert "foreign key (site_id, homepage_lead_post_id) references posts(site_id, post_id)" in normalized
    adapter = (ROOT / "packages/python/bp-adapters-postgres/src/bp_adapters/postgres/editorial.py").read_text()
    assert "homepage_lead_post_id" in adapter


def test_fixed_counts_remain_product_invariants_after_reconciliation():
    assert len(ARTICLE_BLOCK_TYPES) == 12
    assert PERSISTED_POST_STATES == {"DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED", "TRASH"}
    contract = json.loads((ROOT / "database/verification/doc08-contract.json").read_text())
    assert contract["table_count"] == 33
    assert contract["site_table_count"] == 20
    assert contract["global_table_count"] == 13
    assert contract["permission_count"] == 69
