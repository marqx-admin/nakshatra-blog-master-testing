"""Wave-1 composition adapters for CHAT03 transaction ports.

This module is intentionally thin. It adapts CHAT02's authoritative synchronous
SQLAlchemy/Psycopg transaction primitives to the async context-manager shape
published by CHAT03's SiteTransactionPort / GlobalTransactionPort. It does not
add schema, authorization, SiteContext resolution, or business behavior.
"""
from __future__ import annotations

from contextlib import AbstractAsyncContextManager, asynccontextmanager
from typing import Any

from sqlalchemy.engine import Engine

from .platform_transaction import platform_transaction
from .site_transaction import site_transaction


class PostgresSiteTransactionPort:
    """Bind one trusted SiteContext to CHAT02's transaction-local RLS primitive."""

    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def transaction(self, context: Any) -> AbstractAsyncContextManager[Any]:
        if context is None or not getattr(context, "site_id", None):
            raise ValueError("trusted SiteContext with site_id is required")
        return self._transaction(str(context.site_id))

    @asynccontextmanager
    async def _transaction(self, site_id: str):
        with site_transaction(self._engine, site_id) as connection:
            yield connection


class PostgresGlobalTransactionPort:
    """Bind only an explicit CTX-GLOBAL object to CHAT02's platform transaction."""

    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def transaction(self, context: Any) -> AbstractAsyncContextManager[Any]:
        kind = getattr(context, "kind", None)
        value = getattr(kind, "value", kind)
        if context is None or value != "CTX-GLOBAL":
            raise ValueError("explicit CTX-GLOBAL context is required")
        return self._transaction()

    @asynccontextmanager
    async def _transaction(self):
        with platform_transaction(self._engine) as connection:
            yield connection
