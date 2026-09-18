from __future__ import annotations

from enum import StrEnum

from .queue_ids import QueueId


class JobType(StrEnum):
    PUBLISH_DUE = "JOB18-PUBLISH-DUE"
    MEDIA_VARIANTS = "JOB18-MEDIA-VARIANTS"
    SEARCH_SYNC_POST = "JOB18-SEARCH-SYNC-POST"
    SEARCH_REFRESH_ENTITY = "JOB18-SEARCH-REFRESH-ENTITY"
    SEARCH_REINDEX_SITE = "JOB18-SEARCH-REINDEX-SITE"
    SITEMAP_BUILD_SITE = "JOB18-SITEMAP-BUILD-SITE"
    CACHE_INVALIDATE = "JOB18-CACHE-INVALIDATE"
    SCHEDULE_RECONCILE_SITE = "JOB18-SCHEDULE-RECONCILE-SITE"
    MEDIA_RECONCILE_SITE = "JOB18-MEDIA-RECONCILE-SITE"
    SEARCH_RECONCILE_SITE = "JOB18-SEARCH-RECONCILE-SITE"
    SITEMAP_RECONCILE_SITE = "JOB18-SITEMAP-RECONCILE-SITE"


CANONICAL_JOB_TYPES: tuple[JobType, ...] = tuple(JobType)
QUEUE_BY_JOB: dict[JobType, QueueId] = {
    JobType.PUBLISH_DUE: QueueId.PUBLISH,
    JobType.MEDIA_VARIANTS: QueueId.MEDIA,
    JobType.SEARCH_SYNC_POST: QueueId.SEARCH,
    JobType.SEARCH_REFRESH_ENTITY: QueueId.SEARCH,
    JobType.SEARCH_REINDEX_SITE: QueueId.SEARCH,
    JobType.SITEMAP_BUILD_SITE: QueueId.SITEMAP,
    JobType.CACHE_INVALIDATE: QueueId.CACHE,
    JobType.SCHEDULE_RECONCILE_SITE: QueueId.MAINTENANCE,
    JobType.MEDIA_RECONCILE_SITE: QueueId.MAINTENANCE,
    JobType.SEARCH_RECONCILE_SITE: QueueId.MAINTENANCE,
    JobType.SITEMAP_RECONCILE_SITE: QueueId.MAINTENANCE,
}

PRIORITY_BY_JOB: dict[JobType, int] = {
    JobType.PUBLISH_DUE: 1,
    JobType.MEDIA_VARIANTS: 3,
    JobType.SEARCH_SYNC_POST: 2,
    JobType.SEARCH_REFRESH_ENTITY: 2,
    JobType.SEARCH_REINDEX_SITE: 4,
    JobType.SITEMAP_BUILD_SITE: 3,
    JobType.CACHE_INVALIDATE: 2,
    JobType.SCHEDULE_RECONCILE_SITE: 4,
    JobType.MEDIA_RECONCILE_SITE: 4,
    JobType.SEARCH_RECONCILE_SITE: 4,
    JobType.SITEMAP_RECONCILE_SITE: 4,
}

if len(CANONICAL_JOB_TYPES) != 11:
    raise RuntimeError("DOC-18 requires exactly eleven canonical job types")


def priority_for(job_type: JobType, payload: dict | None = None, *, trigger: str | None = None) -> int:
    payload = payload or {}
    if job_type is JobType.CACHE_INVALIDATE:
        if payload.get("mode") == "SITE_PUBLIC_ALL":
            return 0
        if trigger in {"MEDIA_DELETE", "MEDIA_PUBLIC_ELIGIBILITY_REVOKE"}:
            return 0
        return 2
    if job_type is JobType.PUBLISH_DUE:
        return 1
    if job_type is JobType.MEDIA_VARIANTS:
        return 2 if payload.get("native_webp_repair") else 3
    if job_type in {JobType.SEARCH_SYNC_POST, JobType.SEARCH_REFRESH_ENTITY}:
        return 2
    if job_type is JobType.SITEMAP_BUILD_SITE:
        return 3
    return 4
