from __future__ import annotations

from contextlib import contextmanager
from dataclasses import dataclass

import pytest

from bp_adapters.postgres import ports as postgres_ports
from bp_adapters.postgres.ports import PostgresGlobalTransactionPort, PostgresSiteTransactionPort


@dataclass
class SiteCtx:
    site_id: str


@dataclass
class Kind:
    value: str


@dataclass
class GlobalCtx:
    kind: Kind


def test_site_port_passes_only_trusted_site_id(monkeypatch):
    seen = []

    @contextmanager
    def fake_site_transaction(engine, site_id):
        seen.append((engine, site_id))
        yield "site-connection"

    monkeypatch.setattr(postgres_ports, "site_transaction", fake_site_transaction)
    adapter = PostgresSiteTransactionPort(engine=object())

    async def run():
        async with adapter.transaction(SiteCtx("00000000-0000-0000-0000-000000000001")) as conn:
            assert conn == "site-connection"

    import asyncio
    asyncio.run(run())
    assert seen[0][1] == "00000000-0000-0000-0000-000000000001"


def test_site_port_fails_closed_without_site_context():
    adapter = PostgresSiteTransactionPort(engine=object())
    with pytest.raises(ValueError):
        adapter.transaction(None)


def test_global_port_requires_explicit_global_context(monkeypatch):
    @contextmanager
    def fake_platform_transaction(engine):
        yield "global-connection"

    monkeypatch.setattr(postgres_ports, "platform_transaction", fake_platform_transaction)
    adapter = PostgresGlobalTransactionPort(engine=object())

    async def run():
        async with adapter.transaction(GlobalCtx(Kind("CTX-GLOBAL"))) as conn:
            assert conn == "global-connection"

    import asyncio
    asyncio.run(run())

    with pytest.raises(ValueError):
        adapter.transaction(GlobalCtx(Kind("CTX-ADMIN-SITE")))
