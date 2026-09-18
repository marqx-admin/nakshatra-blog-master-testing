from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from bp_background_contracts import JobEnvelope, JobType, identity_for
from bp_domain.context import ContextKind, GlobalContext
from bp_ports import GlobalSiteEnumerationPort


@dataclass(slots=True)
class WorkerScheduler:
    producer: object

    @staticmethod
    def _bucket(now: datetime, seconds: int) -> str:
        epoch = int(now.timestamp())
        return str(epoch - epoch % seconds)

    async def promote_due(self, now: datetime | None = None) -> int:
        return await self.producer.queue.promote_due(now or datetime.now(UTC))

    async def enqueue_reconciliation(
        self,
        *,
        site_id: str,
        correlation_id: str,
        now: datetime | None = None,
        include_15m: bool = True,
    ) -> list[JobEnvelope]:
        """Enqueue only site-scoped maintenance jobs; null site never fans out."""
        if not site_id:
            raise ValueError("site_id is required for site reconciliation")
        now = now or datetime.now(UTC)
        jobs = [(JobType.SCHEDULE_RECONCILE_SITE, self._bucket(now, 60))]
        if include_15m:
            jobs += [
                (JobType.MEDIA_RECONCILE_SITE, self._bucket(now, 900)),
                (JobType.SEARCH_RECONCILE_SITE, self._bucket(now, 900)),
                (JobType.SITEMAP_RECONCILE_SITE, self._bucket(now, 900)),
            ]
        out: list[JobEnvelope] = []
        for job_type, bucket in jobs:
            payload = {"bucket": bucket}
            identity = identity_for(job_type, site_id=site_id, payload=payload)
            envelope = JobEnvelope(
                job_type=job_type,
                site_id=site_id,
                entity_type="SITE",
                entity_id=site_id,
                trigger="RECONCILIATION_CADENCE",
                idempotency_identity=identity,
                correlation_id=correlation_id,
                payload=payload,
            )
            await self.producer.submit(envelope)
            out.append(envelope)
        return out

    async def enqueue_global_reconciliation(
        self,
        *,
        context: GlobalContext,
        sites: GlobalSiteEnumerationPort,
        now: datetime | None = None,
        include_15m: bool = True,
        lock_ttl_seconds: int = 55,
    ) -> list[JobEnvelope]:
        """DOC-18 section 27 global coordinator: enumerate, then emit site jobs.

        CTX-GLOBAL is used only for the Site Registry read.  It is never forwarded to
        site-owned repositories or worker handlers.  Duplicate coordinator runs are
        bounded by RED18-G-LOCK and individual site-job dedupe remains the final
        duplicate-harm guard after partial coordinator failure.
        """
        if context.kind is not ContextKind.GLOBAL:
            raise ValueError("global reconciliation requires CTX-GLOBAL")
        purpose = "reconcile-coordinator"
        lease = await self.producer.control.acquire_global_lease(
            purpose=purpose, ttl_seconds=lock_ttl_seconds
        )
        if lease is None:
            return []
        try:
            eligible = await sites.list_eligible_sites(context)
            out: list[JobEnvelope] = []
            for site in eligible:
                if not site.site_id:
                    raise ValueError("Site Registry returned site without site_id")
                out.extend(
                    await self.enqueue_reconciliation(
                        site_id=site.site_id,
                        correlation_id=context.request_id,
                        now=now,
                        include_15m=include_15m,
                    )
                )
            return out
        finally:
            await self.producer.control.release_global_lease(purpose=purpose, lease=lease)
