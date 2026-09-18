"""Explicit GLOBAL transaction primitive for the separate platform credential/pool."""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import text
from sqlalchemy.engine import Connection, Engine

_CLEAR_SITE = text("SELECT set_config('app.site_id', '', true)")


@contextmanager
def platform_transaction(engine: Engine) -> Iterator[Connection]:
    """Yield one explicit platform transaction with no inherited tenant setting.

    GLOBAL authority is still decided by upstream authorization/business code. This adapter
    only prevents accidental tenant-context carryover and provides the persistence boundary.
    """
    with engine.connect() as connection:
        with connection.begin():
            connection.execute(_CLEAR_SITE)
            yield connection
