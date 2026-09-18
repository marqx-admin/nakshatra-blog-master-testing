from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from enum import StrEnum
import hashlib

from .job_types import JobType


class DedupeState(StrEnum):
    CLAIMED = "CLAIMED"
    ENQUEUED = "ENQUEUED"
    TERMINAL = "TERMINAL"


@dataclass(frozen=True, slots=True)
class DedupeRecord:
    state: DedupeState
    claim_token: str | None = None
    outcome: str | None = None
    terminal_at: datetime | None = None


def dependency_set_hash(dependencies: list[tuple[str, str]]) -> str:
    canonical = "|".join(f"{kind}:{identity}" for kind, identity in sorted(dependencies))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def identity_for(job_type: JobType, *, site_id: str, payload: dict) -> str:
    if job_type is JobType.PUBLISH_DUE:
        return f"publish:{site_id}:{payload['post_id']}:v{payload['source_version']}:{payload['scheduled_for_utc_epoch_ms']}"
    if job_type is JobType.MEDIA_VARIANTS:
        keys = ",".join(sorted(payload.get("requested_variant_keys", ())))
        key_hash = hashlib.sha256(keys.encode("utf-8")).hexdigest()
        return f"media:{site_id}:{payload['media_id']}:{payload['source_fingerprint']}:{key_hash}"
    if job_type is JobType.SEARCH_SYNC_POST:
        return f"search-sync:{site_id}:{payload['post_id']}:{payload['source_fingerprint']}"
    if job_type is JobType.SEARCH_REFRESH_ENTITY:
        return (
            f"search-refresh:{site_id}:{payload['entity_type']}:{payload['entity_id']}:"
            f"{payload['source_fingerprint']}"
        )
    if job_type is JobType.SEARCH_REINDEX_SITE:
        return f"search-reindex:{site_id}:{payload['rebuild_generation']}"
    if job_type is JobType.SITEMAP_BUILD_SITE:
        return f"sitemap:{site_id}:{int(payload['desired_seq'])}"
    if job_type is JobType.CACHE_INVALIDATE:
        deps = [(str(x["type"]), str(x["id"])) for x in payload.get("dependencies", [])]
        return f"cache:{site_id}:{payload['mode']}:{dependency_set_hash(deps)}"
    if job_type is JobType.SCHEDULE_RECONCILE_SITE:
        return f"schedule-reconcile:{site_id}:{payload['bucket']}"
    if job_type is JobType.MEDIA_RECONCILE_SITE:
        return f"media-reconcile:{site_id}:{payload['bucket']}"
    if job_type is JobType.SEARCH_RECONCILE_SITE:
        return f"search-reconcile:{site_id}:{payload['bucket']}"
    if job_type is JobType.SITEMAP_RECONCILE_SITE:
        return f"sitemap-reconcile:{site_id}:{payload['bucket']}"
    raise ValueError(f"unknown DOC-18 job type: {job_type}")


def minimum_terminal_expiry(*, now: datetime, scheduled_for_utc: datetime | None = None) -> datetime:
    now = now.astimezone(UTC)
    expiry = now + timedelta(hours=24)
    if scheduled_for_utc is not None:
        expiry = max(expiry, scheduled_for_utc.astimezone(UTC) + timedelta(hours=24))
    return expiry
