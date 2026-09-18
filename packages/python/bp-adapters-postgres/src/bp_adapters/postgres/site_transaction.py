"""Trusted transaction-local SiteContext primitive.

A protected SITE operation must use the same physical connection and transaction from
context establishment through persistence completion. Persistent session-level SET is forbidden.
"""
from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection, Engine

_SET_SITE = text("SELECT set_config('app.site_id', :site_id, true)")
_READ_SITE = text("SELECT app.current_site_id()")


def _trusted_uuid(value: UUID | str) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


@contextmanager
def site_transaction(engine: Engine, trusted_site_id: UUID | str) -> Iterator[Connection]:
    """Begin a transaction, establish local SiteContext, and yield that same connection.

    ``set_config(..., true)`` is PostgreSQL's transaction-local equivalent of ``SET LOCAL``
    and is parameter-safe with Psycopg/SQLAlchemy. The setting disappears on commit/rollback.
    """
    site_id = _trusted_uuid(trusted_site_id)
    with engine.connect() as connection:
        with connection.begin():
            connection.execute(_SET_SITE, {"site_id": str(site_id)})
            observed = connection.execute(_READ_SITE).scalar_one()
            if UUID(str(observed)) != site_id:
                raise RuntimeError("PostgreSQL SiteContext verification failed")
            yield connection
