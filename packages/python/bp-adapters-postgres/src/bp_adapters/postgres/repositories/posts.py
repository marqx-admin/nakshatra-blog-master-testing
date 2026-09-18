"""DOC-08 Post persistence primitives that contain no lifecycle/authorization policy."""
from __future__ import annotations

from collections.abc import Mapping
import json
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection

from .concurrency import PostVersionConflict

# Physical DOC-08 fields that may participate in a durable Post UPDATE. Business-layer
# field authorization/lifecycle validation must happen before calling this function.
_JSONB_POST_COLUMNS = frozenset({"body", "structured_data_inputs"})

_MUTABLE_POST_COLUMNS = frozenset(
    {
        "content_schema_version",
        "status",
        "title",
        "excerpt",
        "body",
        "author_site_profile_id",
        "featured_media_id",
        "slug",
        "seo_title",
        "meta_description",
        "canonical_override",
        "index_policy",
        "link_robots_policy",
        "og_title",
        "og_description",
        "og_image_media_id",
        "structured_data_inputs",
        "breadcrumb_label",
        "scheduled_for_utc",
        "schedule_local_input",
        "schedule_timezone_id",
        "first_published_at",
        "published_at",
        "archived_at",
        "trashed_at",
    }
)


def load_post_row(connection: Connection, *, post_id: UUID) -> Mapping[str, object] | None:
    """Load one visible same-site Post row under the connection's active RLS context."""
    row = connection.execute(
        text("SELECT * FROM posts WHERE site_id=app.current_site_id() AND post_id=:post_id"),
        {"post_id": str(post_id)},
    ).mappings().first()
    return row


def update_post_with_expected_version(
    connection: Connection,
    *,
    post_id: UUID,
    expected_version: int,
    actor_admin_id: UUID | None,
    changes: Mapping[str, object],
) -> int:
    """CAS-update physical Post fields and increment ``version`` exactly once.

    The function intentionally does not decide whether a field may be changed in a given
    lifecycle state or by a given actor. It only enforces the DOC-08 persistence boundary:
    one same-site row at exactly ``expected_version`` may be mutated. A zero-row result is
    a concurrency conflict/non-visible target for the upstream service to interpret under its
    non-disclosure rules.
    """
    if expected_version < 1:
        raise ValueError("expected_version must be positive")
    if not changes:
        raise ValueError("changes must not be empty")
    unknown = set(changes) - _MUTABLE_POST_COLUMNS
    if unknown:
        raise ValueError(f"non-DOC-08 or non-mutable Post fields: {sorted(unknown)}")

    ordered = sorted(changes)
    assignments = [
        f"{column} = CAST(:v_{column} AS jsonb)" if column in _JSONB_POST_COLUMNS else f"{column} = :v_{column}"
        for column in ordered
    ]
    assignments.extend(
        [
            "version = version + 1",
            "updated_at = now()",
            "updated_by_admin_id = :actor_admin_id",
        ]
    )
    statement = text(
        "UPDATE posts SET "
        + ", ".join(assignments)
        + " WHERE site_id=app.current_site_id() AND post_id=:post_id AND version=:expected_version RETURNING version"
    )
    params = {
        f"v_{column}": json.dumps(changes[column], separators=(",", ":"), sort_keys=True)
        if column in _JSONB_POST_COLUMNS
        else changes[column]
        for column in ordered
    }
    params.update(
        {
            "post_id": str(post_id),
            "expected_version": expected_version,
            "actor_admin_id": None if actor_admin_id is None else str(actor_admin_id),
        }
    )
    row = connection.execute(statement, params).first()
    if row is None:
        raise PostVersionConflict(post_id=post_id, expected_version=expected_version)
    return int(row[0])
