"""Repository-side guards for already-open persistence transactions."""
from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection

_READ_SITE = text("SELECT app.current_site_id()")


@dataclass(frozen=True, slots=True)
class SiteRepositoryContext:
    """Bind repository work to the connection whose SiteContext was established upstream.

    This object does not open a transaction and does not authorize an operation. It merely
    prevents a repository from silently accepting a different or missing database SiteContext.
    """

    connection: Connection
    site_id: UUID

    @classmethod
    def verified(cls, connection: Connection, trusted_site_id: UUID | str) -> "SiteRepositoryContext":
        expected = trusted_site_id if isinstance(trusted_site_id, UUID) else UUID(str(trusted_site_id))
        observed = connection.execute(_READ_SITE).scalar_one_or_none()
        if observed is None or UUID(str(observed)) != expected:
            raise RuntimeError("repository connection SiteContext is missing or mismatched")
        return cls(connection=connection, site_id=expected)
