"""Append-only DOC-08 audit persistence primitives.

Event-code vocabulary, privacy allowlisting and which outcomes require an event remain
DOC-19/application responsibilities. These helpers only persist already-validated audit data.
"""
from __future__ import annotations

import json
from collections.abc import Mapping
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection

_SITE_AUDIT = text(
    """
    INSERT INTO audit_events(
      scope, site_id, actor_type, actor_admin_id, event_code, module_key, action_key,
      target_type, target_id, request_id, outcome, details
    ) VALUES (
      'SITE', app.current_site_id(), :actor_type, :actor_admin_id, :event_code, :module_key, :action_key,
      :target_type, :target_id, :request_id, :outcome, CAST(:details_json AS jsonb)
    )
    RETURNING audit_id
    """
)

_GLOBAL_AUDIT = text(
    """
    INSERT INTO audit_events(
      scope, site_id, actor_type, actor_admin_id, event_code, module_key, action_key,
      target_type, target_id, request_id, outcome, details
    ) VALUES (
      'GLOBAL', :site_id, :actor_type, :actor_admin_id, :event_code, :module_key, :action_key,
      :target_type, :target_id, :request_id, :outcome, CAST(:details_json AS jsonb)
    )
    RETURNING audit_id
    """
)


def _params(
    *,
    actor_type: str,
    actor_admin_id: UUID | None,
    event_code: str,
    module_key: str | None,
    action_key: str | None,
    target_type: str | None,
    target_id: UUID | None,
    request_id: str | None,
    outcome: str,
    details: Mapping[str, object],
) -> dict[str, object]:
    return {
        "actor_type": actor_type,
        "actor_admin_id": None if actor_admin_id is None else str(actor_admin_id),
        "event_code": event_code,
        "module_key": module_key,
        "action_key": action_key,
        "target_type": target_type,
        "target_id": None if target_id is None else str(target_id),
        "request_id": request_id,
        "outcome": outcome,
        "details_json": json.dumps(dict(details), separators=(",", ":"), sort_keys=True),
    }


def append_site_audit_event(
    connection: Connection,
    *,
    actor_type: str,
    actor_admin_id: UUID | None,
    event_code: str,
    module_key: str | None = None,
    action_key: str | None = None,
    target_type: str | None = None,
    target_id: UUID | None = None,
    request_id: str | None = None,
    outcome: str,
    details: Mapping[str, object],
) -> UUID:
    """Append a SITE audit row bound to the transaction's current SiteContext."""
    row = connection.execute(
        _SITE_AUDIT,
        _params(
            actor_type=actor_type,
            actor_admin_id=actor_admin_id,
            event_code=event_code,
            module_key=module_key,
            action_key=action_key,
            target_type=target_type,
            target_id=target_id,
            request_id=request_id,
            outcome=outcome,
            details=details,
        ),
    ).first()
    if row is None:
        raise RuntimeError("audit INSERT returned no audit_id")
    return UUID(str(row[0]))


def append_global_audit_event(
    connection: Connection,
    *,
    site_id: UUID | None,
    actor_type: str,
    actor_admin_id: UUID | None,
    event_code: str,
    module_key: str | None = None,
    action_key: str | None = None,
    target_type: str | None = None,
    target_id: UUID | None = None,
    request_id: str | None = None,
    outcome: str,
    details: Mapping[str, object],
) -> UUID:
    """Append a GLOBAL audit row inside an explicit platform transaction."""
    params = _params(
        actor_type=actor_type,
        actor_admin_id=actor_admin_id,
        event_code=event_code,
        module_key=module_key,
        action_key=action_key,
        target_type=target_type,
        target_id=target_id,
        request_id=request_id,
        outcome=outcome,
        details=details,
    )
    params["site_id"] = None if site_id is None else str(site_id)
    row = connection.execute(_GLOBAL_AUDIT, params).first()
    if row is None:
        raise RuntimeError("audit INSERT returned no audit_id")
    return UUID(str(row[0]))
