from __future__ import annotations

from pathlib import Path
import sys
from uuid import UUID

import pytest

SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC))

from bp_adapters.postgres import engines
from bp_adapters.postgres.engines import PoolBudget
from bp_adapters.postgres.repositories.audit import append_site_audit_event
from bp_adapters.postgres.repositories.concurrency import PostVersionConflict
from bp_adapters.postgres.repositories.context import SiteRepositoryContext
from bp_adapters.postgres.repositories.posts import update_post_with_expected_version
from bp_adapters.postgres.runtime import PostgresPublicPageAdapter
from bp_adapters.postgres.site_transaction import _trusted_uuid
from bp_domain.context import ContextKind, ContextSource, SiteContext

SITE1 = UUID("10000000-0000-4000-8000-000000000001")
POST1 = UUID("34000000-0000-4000-8000-000000000001")


def test_pool_budget_rejects_invalid_values_and_reports_total():
    with pytest.raises(ValueError):
        PoolBudget(0)
    with pytest.raises(ValueError):
        PoolBudget(1, -1)
    assert PoolBudget(7, 2).total_connections == 9


def test_aggregate_connection_budget_preserves_thirty_percent_headroom():
    engines.validate_aggregate_connection_budget(max_connections=100, configured_maximum=70)
    with pytest.raises(ValueError):
        engines.validate_aggregate_connection_budget(max_connections=100, configured_maximum=71)
    with pytest.raises(ValueError):
        engines.validate_aggregate_connection_budget(max_connections=0, configured_maximum=0)


def test_combined_api_replica_pool_budget_is_at_most_twenty():
    engines.validate_api_replica_pool_budget(PoolBudget(12), PoolBudget(8))
    with pytest.raises(ValueError):
        engines.validate_api_replica_pool_budget(PoolBudget(12), PoolBudget(9))
    with pytest.raises(ValueError):
        engines.validate_api_replica_pool_budget()


def test_engine_factory_enforces_doc20_pool_caps():
    with pytest.raises(ValueError):
        engines.create_site_engine("postgresql+psycopg://x", budget=PoolBudget(20, 1))
    with pytest.raises(ValueError):
        engines.create_platform_engine("postgresql+psycopg://x", budget=PoolBudget(20, 1))
    with pytest.raises(ValueError):
        engines.create_worker_site_engine("postgresql+psycopg://x", budget=PoolBudget(10, 1))


def test_engine_factory_requires_psycopg_driver_url():
    with pytest.raises(ValueError):
        engines.create_site_engine("postgresql://x", budget=PoolBudget(1))


def test_engine_factory_uses_interactive_and_worker_checkout_timeouts(monkeypatch):
    calls = []

    def fake_create_engine(dsn, **kwargs):
        calls.append((dsn, kwargs))
        return object()

    monkeypatch.setattr(engines, "create_engine", fake_create_engine)
    engines.create_site_engine("postgresql+psycopg://x", budget=PoolBudget(2))
    engines.create_platform_engine("postgresql+psycopg://x", budget=PoolBudget(2))
    engines.create_worker_site_engine("postgresql+psycopg://x", budget=PoolBudget(2))
    assert calls[0][1]["pool_timeout"] == 3.0
    assert calls[1][1]["pool_timeout"] == 3.0
    assert calls[2][1]["pool_timeout"] == 10.0
    assert all(call[1]["pool_reset_on_return"] == "rollback" for call in calls)
    assert all(call[1]["pool_pre_ping"] is True for call in calls)


def test_trusted_site_id_requires_uuid():
    assert _trusted_uuid(str(SITE1)) == SITE1
    with pytest.raises(ValueError):
        _trusted_uuid("SITE-01")


def test_concurrency_conflict_is_explicit():
    exc = PostVersionConflict(POST1, 7)
    assert "expected version 7" in str(exc)


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class _FirstResult:
    def __init__(self, value):
        self.value = value

    def first(self):
        return self.value


class _FakeConnection:
    def __init__(self, observed_site=SITE1, first=(2,)):
        self.observed_site = observed_site
        self.first_value = first
        self.calls = []

    def execute(self, statement, params=None):
        sql = str(statement)
        self.calls.append((sql, params or {}))
        if "app.current_site_id()" in sql and sql.strip().upper().startswith("SELECT"):
            return _ScalarResult(self.observed_site)
        return _FirstResult(self.first_value)


def test_repository_context_rejects_missing_or_mismatched_context():
    assert SiteRepositoryContext.verified(_FakeConnection(SITE1), SITE1).site_id == SITE1
    with pytest.raises(RuntimeError):
        SiteRepositoryContext.verified(_FakeConnection(None), SITE1)
    with pytest.raises(RuntimeError):
        SiteRepositoryContext.verified(
            _FakeConnection(UUID("10000000-0000-4000-8000-000000000002")), SITE1
        )


def test_post_update_is_same_site_cas_and_increments_once():
    conn = _FakeConnection(first=(8,))
    new_version = update_post_with_expected_version(
        conn,
        post_id=POST1,
        expected_version=7,
        actor_admin_id=None,
        changes={"title": "New title", "excerpt": "Summary"},
    )
    assert new_version == 8
    sql, params = conn.calls[-1]
    normalized = " ".join(sql.split())
    assert "site_id=app.current_site_id()" in normalized
    assert "version=:expected_version" in normalized
    assert "version = version + 1" in normalized
    assert params["expected_version"] == 7


def test_post_update_serializes_jsonb_values_explicitly():
    conn = _FakeConnection(first=(2,))
    update_post_with_expected_version(
        conn,
        post_id=POST1,
        expected_version=1,
        actor_admin_id=None,
        changes={"body": {"blocks": []}, "structured_data_inputs": {"kind": "article"}},
    )
    sql, params = conn.calls[-1]
    normalized = " ".join(sql.split())
    assert "body = CAST(:v_body AS jsonb)" in normalized
    assert "structured_data_inputs = CAST(:v_structured_data_inputs AS jsonb)" in normalized
    assert params["v_body"] == '{"blocks":[]}'
    assert params["v_structured_data_inputs"] == '{"kind":"article"}'


def test_post_update_rejects_unknown_or_empty_fields():
    conn = _FakeConnection()
    with pytest.raises(ValueError):
        update_post_with_expected_version(conn, post_id=POST1, expected_version=1, actor_admin_id=None, changes={})
    with pytest.raises(ValueError):
        update_post_with_expected_version(
            conn,
            post_id=POST1,
            expected_version=1,
            actor_admin_id=None,
            changes={"site_id": SITE1},
        )


def test_post_update_raises_conflict_on_zero_row_result():
    conn = _FakeConnection(first=None)
    with pytest.raises(PostVersionConflict):
        update_post_with_expected_version(
            conn,
            post_id=POST1,
            expected_version=4,
            actor_admin_id=None,
            changes={"title": "stale"},
        )


def test_site_audit_insert_binds_site_from_database_context_and_serializes_details():
    audit_id = UUID("61000000-0000-4000-8000-000000000001")
    conn = _FakeConnection(first=(audit_id,))
    result = append_site_audit_event(
        conn,
        actor_type="ADMIN",
        actor_admin_id=None,
        event_code="POST.UPDATED",
        outcome="SUCCESS",
        details={"changed_field_names": ["title"]},
    )
    assert result == audit_id
    sql, params = conn.calls[-1]
    normalized = " ".join(sql.split())
    assert "'SITE', app.current_site_id()" in normalized
    assert "CAST(:details_json AS jsonb)" in normalized
    assert params["details_json"] == '{"changed_field_names":["title"]}'


def test_public_article_body_projects_persisted_editor_blocks_to_rc8_payload_shape():
    adapter = PostgresPublicPageAdapter(None, media_cdn_origin="https://media.example.test")
    context = SiteContext(
        kind=ContextKind.PUBLIC_SITE,
        site_id=str(SITE1),
        site_key="SITE-01",
        site_status="ACTIVE",
        canonical_domain="whatsyourrashi.in",
        context_source=ContextSource.PUBLIC_HOST,
        request_id="req-public-body",
        request_host="site01-staging.sslip.io",
    )
    persisted = {
        "content_schema_version": "1",
        "blocks": [
            {
                "block_id": "block-1",
                "type": "PARAGRAPH",
                "content": {
                    "runs": [
                        {
                            "text": "Published body",
                            "marks": ["BOLD"],
                            "link": {"kind": "EXTERNAL", "url": "https://example.test/source"},
                        }
                    ]
                },
            },
            {"block_id": "block-2", "type": "SEPARATOR"},
        ],
    }

    projected = adapter._public_article_body(object(), context, persisted, 1)

    assert projected["content_schema_version"] == "1"
    assert projected["blocks"][0] == {
        "block_id": "block-1",
        "type": "PARAGRAPH",
        "payload": {
            "content": {
                "runs": [
                    {
                        "text": "Published body",
                        "marks": ["BOLD"],
                        "link": {
                            "kind": "EXTERNAL",
                            "url": "https://example.test/source",
                            "is_external": True,
                        },
                    }
                ]
            }
        },
    }
    assert projected["blocks"][1] == {"block_id": "block-2", "type": "SEPARATOR", "payload": {}}
