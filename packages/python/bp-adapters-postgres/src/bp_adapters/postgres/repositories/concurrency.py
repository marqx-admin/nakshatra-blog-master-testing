"""Persistence-only optimistic concurrency primitives for DOC-08 versioned Post writes."""
from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection


@dataclass(frozen=True, slots=True)
class PostVersionConflict(Exception):
    post_id: UUID
    expected_version: int

    def __str__(self) -> str:
        return f"post {self.post_id} is not at expected version {self.expected_version}"


_CLAIM = text(
    """
    UPDATE posts
       SET version = version + 1,
           updated_at = now(),
           updated_by_admin_id = :actor_admin_id
     WHERE site_id = app.current_site_id()
       AND post_id = :post_id
       AND version = :expected_version
    RETURNING version
    """
)


def claim_post_version(
    connection: Connection,
    *,
    post_id: UUID,
    expected_version: int,
    actor_admin_id: UUID | None,
) -> int:
    """Atomically claim the next Post version inside an existing SITE transaction.

    Callers must perform the rest of the mutation and any revision/event persistence in the
    same transaction. A zero-row update is a stale-version conflict. This function contains
    no lifecycle/authorization decisions.
    """
    if expected_version < 1:
        raise ValueError("expected_version must be positive")
    row = connection.execute(
        _CLAIM,
        {
            "post_id": str(post_id),
            "expected_version": expected_version,
            "actor_admin_id": None if actor_admin_id is None else str(actor_admin_id),
        },
    ).first()
    if row is None:
        raise PostVersionConflict(post_id=post_id, expected_version=expected_version)
    return int(row[0])
