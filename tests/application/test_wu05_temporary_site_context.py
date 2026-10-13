"""Local SITE-context temporary destination checks without PostgreSQL."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import pytest
import yaml  # type: ignore[import-untyped]
from bp_adapters.postgres.runtime import PostgresAdminSiteContextPayload
from bp_domain.context import ContextKind, ContextSource, SiteContext
from bp_domain.security import AccountState, AdminPrincipal
from bp_domain.temporary_site_url import TemporarySiteUrlConfig
from jsonschema import Draft202012Validator, RefResolver


ROOT = Path(__file__).resolve().parents[2]
SPEC = yaml.safe_load((ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml").read_text())


def context(site_id: str = "site-a", *, status: str = "DISABLED") -> SiteContext:
    return SiteContext(
        ContextKind.ADMIN_SITE,
        site_id,
        "SITE-100",
        status,
        "production.example",
        ContextSource.ADMIN_SELECTION,
        "request-1",
        display_name="Site 100",
    )


def principal(*, can_view: bool = True, super_admin: bool = False) -> AdminPrincipal:
    permissions = frozenset({"site_settings.view"}) if can_view else frozenset({"dashboard.view"})
    return AdminPrincipal(
        "admin-1",
        "admin@example.test",
        AccountState.ACTIVE,
        is_super_admin=super_admin,
        site_permissions={"SITE-100": permissions},
    )


class Result:
    def __init__(self, rows: list[Any]) -> None:
        self.rows = rows

    def fetchone(self) -> Any:
        return self.rows[0] if self.rows else None

    def fetchall(self) -> list[Any]:
        return self.rows


class Transactions:
    def __init__(self, domains: dict[str, str]) -> None:
        self.domains = domains
        self.lookups: list[tuple[str, dict[str, Any]]] = []
        self.site_id = ""

    @asynccontextmanager
    async def transaction(self, site: SiteContext) -> AsyncIterator[Transactions]:
        self.site_id = site.site_id
        yield self

    def execute(self, statement: Any, params: dict[str, Any] | None = None) -> Result:
        sql = str(statement)
        if "FROM permissions" in sql:
            return Result([("site_settings.view",), ("dashboard.view",)])
        assert sql.strip().upper().startswith("SELECT ")
        assert "FROM domains" in sql
        assert "site_id=:site_id" in sql and "hostname_normalized=:hostname" in sql
        assert "is_active=true" in sql
        assert params is not None and params["site_id"] == self.site_id
        self.lookups.append((self.site_id, params))
        hostname = self.domains.get(self.site_id)
        return Result([{"hostname": hostname}] if hostname == params["hostname"] else [])


@pytest.mark.asyncio
async def test_temporary_url_is_same_site_read_only_and_survives_production_canonical() -> None:
    transactions = Transactions({"site-a": "site-100.preview.example"})
    payload = await PostgresAdminSiteContextPayload(
        transactions, "preview.example"
    ).build(principal(), context())
    assert payload["temporary_site_url"] == "https://site-100.preview.example/"
    assert payload["lifecycle_state"] == "DISABLED"
    assert transactions.lookups == [
        ("site-a", {"site_id": "site-a", "hostname": "site-100.preview.example"})
    ]
    validator = Draft202012Validator(
        SPEC["components"]["schemas"]["AdminSiteContext"],
        resolver=RefResolver.from_schema(SPEC),
    )
    assert validator.is_valid(payload)


@pytest.mark.asyncio
async def test_temporary_url_requires_site_settings_view_and_never_borrows_another_site() -> None:
    transactions = Transactions({"site-b": "site-100.preview.example"})
    adapter = PostgresAdminSiteContextPayload(transactions, "preview.example")
    denied = await adapter.build(principal(can_view=False), context())
    assert "temporary_site_url" not in denied
    assert transactions.lookups == []
    other_site = await adapter.build(principal(), context("site-a"))
    assert "temporary_site_url" not in other_site
    assert transactions.lookups[0][0] == "site-a"


@pytest.mark.asyncio
async def test_same_persisted_local_hostname_uses_server_http_port() -> None:
    transactions = Transactions({"site-a": "site-100.preview.localhost"})
    payload = await PostgresAdminSiteContextPayload(
        transactions, "preview.localhost", TemporarySiteUrlConfig("http", 3015)
    ).build(principal(), context())
    assert payload["temporary_site_url"] == "http://site-100.preview.localhost:3015/"


@pytest.mark.asyncio
async def test_temporary_url_omitted_without_active_persisted_domain_or_suffix() -> None:
    transactions = Transactions({})
    assert "temporary_site_url" not in await PostgresAdminSiteContextPayload(
        transactions, "preview.example"
    ).build(principal(), context(status="ACTIVE"))
    assert "temporary_site_url" not in await PostgresAdminSiteContextPayload(
        transactions, None
    ).build(principal(), context())


@pytest.mark.asyncio
async def test_super_admin_uses_effective_site_permissions_for_temporary_read() -> None:
    transactions = Transactions({"site-a": "site-100.preview.example"})
    payload = await PostgresAdminSiteContextPayload(
        transactions, "preview.example"
    ).build(principal(can_view=False, super_admin=True), context())
    assert payload["temporary_site_url"] == "https://site-100.preview.example/"


@pytest.mark.asyncio
async def test_editor_local_navigation_resolves_persisted_target_domain_without_settings_permission():
    from types import SimpleNamespace
    from bp_adapters.postgres.runtime import PostgresSiteRegistry
    class Connection:
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def execute(self, sql, params):
            assert params == {"site_id": "site-a", "suffix": "preview.localhost"}
            assert "s.site_id=:site_id" in str(sql) and "d.is_active=true" in str(sql)
            return self
        def fetchone(self): return SimpleNamespace(_mapping={"hostname": "site-100.preview.localhost"})
    registry = PostgresSiteRegistry(SimpleNamespace(connect=Connection))
    assert await registry.local_temporary_url_for_site("site-a", "preview.localhost", TemporarySiteUrlConfig("http", 3015)) == "http://site-100.preview.localhost:3015/"
    assert await registry.local_temporary_url_for_site("site-a", "production.example", TemporarySiteUrlConfig()) is None
