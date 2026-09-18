from __future__ import annotations

from datetime import datetime
from typing import Any

from .job_types import JobType

_ALLOWED_DEPENDENCY_TYPES = {
    "POST", "CATEGORY", "TAG", "AUTHOR", "MEDIA", "NAVIGATION",
    "SITE_SETTINGS", "SITE", "DOMAIN",
}
_ALLOWED_REFRESH_ENTITY_TYPES = {"CATEGORY", "TAG", "AUTHOR"}


def _required(payload: dict[str, Any], *names: str) -> None:
    missing = [name for name in names if name not in payload]
    if missing:
        raise ValueError(f"missing DOC-18 job payload properties: {missing}")


def _nonempty(value: Any, name: str) -> str:
    text = str(value).strip()
    if not text:
        raise ValueError(f"{name} must be non-empty")
    return text


def validate_job_payload(job_type: JobType, payload: dict[str, Any]) -> None:
    """Validate only the canonical DOC-18 payload shape/identity fields.

    Business state is deliberately not validated here; the worker reloads PostgreSQL
    truth under CTX-WORKER-SITE before any side effect.
    """
    if not isinstance(payload, dict):
        raise ValueError("payload must be an object")

    if job_type is JobType.PUBLISH_DUE:
        _required(payload, "post_id", "source_version", "scheduled_for_utc", "scheduled_for_utc_epoch_ms")
        _nonempty(payload["post_id"], "post_id")
        scheduled = datetime.fromisoformat(str(payload["scheduled_for_utc"]).replace("Z", "+00:00"))
        if scheduled.tzinfo is None:
            raise ValueError("scheduled_for_utc must be timezone-aware")
        if int(payload["scheduled_for_utc_epoch_ms"]) != int(scheduled.timestamp() * 1000):
            raise ValueError("scheduled_for_utc_epoch_ms must match scheduled_for_utc")
        return

    if job_type is JobType.MEDIA_VARIANTS:
        _required(payload, "media_id", "source_fingerprint", "requested_variant_keys")
        _nonempty(payload["media_id"], "media_id")
        _nonempty(payload["source_fingerprint"], "source_fingerprint")
        keys = payload["requested_variant_keys"]
        if not isinstance(keys, list) or any(not isinstance(key, str) or not key for key in keys):
            raise ValueError("requested_variant_keys must be an array of non-empty strings")
        if len(keys) != len(set(keys)):
            raise ValueError("requested_variant_keys must not contain duplicates")
        if "native_webp" in keys and payload.get("native_webp_repair") is not True:
            raise ValueError("native_webp may only be requested by the explicit repair path")
        return

    if job_type is JobType.SEARCH_SYNC_POST:
        _required(payload, "post_id", "source_fingerprint")
        _nonempty(payload["post_id"], "post_id")
        _nonempty(payload["source_fingerprint"], "source_fingerprint")
        return

    if job_type is JobType.SEARCH_REFRESH_ENTITY:
        _required(payload, "entity_type", "entity_id", "source_fingerprint")
        if str(payload["entity_type"]) not in _ALLOWED_REFRESH_ENTITY_TYPES:
            raise ValueError("SEARCH_REFRESH_ENTITY supports CATEGORY/TAG/AUTHOR only")
        _nonempty(payload["entity_id"], "entity_id")
        _nonempty(payload["source_fingerprint"], "source_fingerprint")
        return

    if job_type is JobType.SEARCH_REINDEX_SITE:
        _required(payload, "rebuild_generation")
        _nonempty(payload["rebuild_generation"], "rebuild_generation")
        return

    if job_type is JobType.SITEMAP_BUILD_SITE:
        _required(payload, "desired_seq")
        if int(payload["desired_seq"]) < 1:
            raise ValueError("desired_seq must be >= 1")
        return

    if job_type is JobType.CACHE_INVALIDATE:
        _required(payload, "mode", "dependencies")
        mode = str(payload["mode"])
        if mode not in {"TARGETED", "SITE_PUBLIC_ALL"}:
            raise ValueError("invalid DOC-18 cache invalidation mode")
        dependencies = payload["dependencies"]
        if not isinstance(dependencies, list):
            raise ValueError("dependencies must be an array")
        for item in dependencies:
            if not isinstance(item, dict) or set(item) != {"type", "id"}:
                raise ValueError("cache dependencies must contain only type/id")
            if str(item["type"]) not in _ALLOWED_DEPENDENCY_TYPES:
                raise ValueError("unsupported DOC-18 dependency type")
            _nonempty(item["id"], "dependency id")
        if mode == "SITE_PUBLIC_ALL" and dependencies:
            raise ValueError("SITE_PUBLIC_ALL must not carry targeted dependency identities")
        return

    if job_type in {
        JobType.SCHEDULE_RECONCILE_SITE,
        JobType.MEDIA_RECONCILE_SITE,
        JobType.SEARCH_RECONCILE_SITE,
        JobType.SITEMAP_RECONCILE_SITE,
    }:
        _required(payload, "bucket")
        _nonempty(payload["bucket"], "bucket")
        return

    raise ValueError(f"unknown DOC-18 job type: {job_type}")
