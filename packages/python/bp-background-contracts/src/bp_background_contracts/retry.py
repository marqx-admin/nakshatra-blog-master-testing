from __future__ import annotations

from dataclasses import dataclass
import hashlib

from .job_types import JobType


@dataclass(frozen=True, slots=True)
class RetryProfile:
    profile_id: str
    max_attempts: int
    base_delay_seconds: int
    max_delay_seconds: int
    attempt_timeout_seconds: int

    def delay_seconds(
        self,
        retry_number: int,
        *,
        idempotency_identity: str,
        retry_after_seconds: int | None = None,
    ) -> float:
        if retry_number < 1:
            raise ValueError("retry_number starts at 1 after the first failed attempt")
        base = min(self.base_delay_seconds * (2 ** (retry_number - 1)), self.max_delay_seconds)
        digest = hashlib.sha256(idempotency_identity.encode("utf-8")).digest()
        # Deterministic inclusive 0.00%-20.00% jitter in 0.01% steps.
        jitter_ratio = (int.from_bytes(digest[:4], "big") % 2001) / 10000.0
        computed = base * (1.0 + jitter_ratio)
        if retry_after_seconds is not None:
            computed = max(computed, min(float(retry_after_seconds), float(self.max_delay_seconds)))
        return min(computed, float(self.max_delay_seconds) * 1.2)


RETRY_PROFILES: dict[str, RetryProfile] = {
    "R18-PUBLISH": RetryProfile("R18-PUBLISH", 8, 15, 300, 60),
    "R18-MEDIA": RetryProfile("R18-MEDIA", 6, 30, 900, 900),
    "R18-SEARCH": RetryProfile("R18-SEARCH", 6, 5, 120, 60),
    "R18-REINDEX": RetryProfile("R18-REINDEX", 4, 60, 900, 1800),
    "R18-SITEMAP": RetryProfile("R18-SITEMAP", 5, 30, 600, 900),
    "R18-CACHE": RetryProfile("R18-CACHE", 8, 2, 60, 60),
    "R18-MAINT": RetryProfile("R18-MAINT", 3, 60, 600, 600),
}

RETRY_PROFILE_BY_JOB: dict[JobType, str] = {
    JobType.PUBLISH_DUE: "R18-PUBLISH",
    JobType.MEDIA_VARIANTS: "R18-MEDIA",
    JobType.SEARCH_SYNC_POST: "R18-SEARCH",
    JobType.SEARCH_REFRESH_ENTITY: "R18-SEARCH",
    JobType.SEARCH_REINDEX_SITE: "R18-REINDEX",
    JobType.SITEMAP_BUILD_SITE: "R18-SITEMAP",
    JobType.CACHE_INVALIDATE: "R18-CACHE",
    JobType.SCHEDULE_RECONCILE_SITE: "R18-MAINT",
    JobType.MEDIA_RECONCILE_SITE: "R18-MAINT",
    JobType.SEARCH_RECONCILE_SITE: "R18-MAINT",
    JobType.SITEMAP_RECONCILE_SITE: "R18-MAINT",
}

if len(RETRY_PROFILES) != 7:
    raise RuntimeError("DOC-18 requires exactly seven retry profiles")
