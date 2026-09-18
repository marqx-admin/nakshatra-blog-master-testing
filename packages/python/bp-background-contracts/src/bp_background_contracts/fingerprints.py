from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
from typing import Any


def _normalize(value: Any) -> Any:
    if isinstance(value, datetime):
        value = value.astimezone(UTC)
        return value.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    if isinstance(value, dict):
        return {str(k): _normalize(value[k]) for k in sorted(value)}
    if isinstance(value, (list, tuple)):
        return [_normalize(v) for v in value]
    return value


def canonical_json_v1(value: dict[str, Any]) -> bytes:
    return json.dumps(_normalize(value), ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def fingerprint(value: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json_v1(value)).hexdigest()


def post_search_fingerprint(
    *,
    site_id: str,
    post_id: str,
    version: int,
    status: str,
    author: tuple[Any, ...] | None,
    categories: list[tuple[Any, ...]],
    tags: list[tuple[Any, ...]],
) -> str:
    payload = {
        "site_id": str(site_id).lower(),
        "post_id": str(post_id).lower(),
        "posts.version": int(version),
        "posts.status": status,
        "author": list(author) if author else None,
        "categories": [list(x) for x in sorted(categories, key=lambda x: str(x[0]))],
        "tags": [list(x) for x in sorted(tags, key=lambda x: str(x[0]))],
    }
    return fingerprint(payload)


def permanent_delete_fingerprint(*, site_id: str, post_id: str, source_version: int) -> str:
    raw = f"search-delete-v1|{str(site_id).lower()}|{str(post_id).lower()}|v{int(source_version)}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def entity_search_fingerprint(*, entity_type: str, entity_id: str, fields: dict[str, Any]) -> str:
    return fingerprint({"entity_type": entity_type.upper(), "entity_id": str(entity_id).lower(), **fields})
