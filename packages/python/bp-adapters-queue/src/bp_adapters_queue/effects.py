from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from bp_background_contracts import JobEnvelope, JobType, identity_for
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.media import VARIANT_CATALOG
from bp_ports import DerivedSourcePort, QueuePort, RedisControlPort


def _to_dt(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value.astimezone(UTC)
    return datetime.fromisoformat(str(value).replace("Z", "+00:00")).astimezone(UTC)


def _bucket(now: datetime, minutes: int = 15) -> str:
    epoch = int(now.timestamp())
    return str(epoch - (epoch % (minutes * 60)))


@dataclass(slots=True)
class Doc18Producer:
    control: RedisControlPort
    queue: QueuePort

    async def submit(self, envelope: JobEnvelope) -> str:
        claim = await self.control.claim_dedupe(envelope)
        if claim is None:
            state = await self.control.get_dedupe_state(envelope)
            # Existing ENQUEUED/TERMINAL claim is positive idempotent acceptance.
            if state is not None and state.state in {"ENQUEUED", "TERMINAL"}:
                return f"deduped:{state.state}"
            # CLAIMED is an ambiguous in-flight producer. Fail instead of double-enqueueing.
            raise RuntimeError("DOC18_DEDUPE_CLAIM_IN_FLIGHT")
        try:
            broker_id = await (self.queue.enqueue_delayed(envelope) if envelope.not_before is not None else self.queue.enqueue(envelope))
        except Exception:
            # We intentionally do not force-delete an ambiguous claim here. Its exact 60s TTL enables reconciliation.
            raise
        if not await self.control.mark_enqueued(envelope, claim):
            # Positive broker acceptance has already occurred. Preserve safety by repairing state.
            await self.control.repair_enqueued(envelope)
        return broker_id

    async def make_and_submit(
        self,
        *,
        job_type: JobType,
        effect: SiteEffectEnvelope,
        payload: dict[str, Any],
        entity_type: str | None = None,
        entity_id: str | None = None,
        source_fingerprint: str | None = None,
        not_before: datetime | None = None,
    ) -> JobEnvelope:
        identity = identity_for(job_type, site_id=effect.context.site_id, payload=payload)
        envelope = JobEnvelope(
            job_type=job_type,
            site_id=effect.context.site_id,
            entity_type=entity_type or effect.entity_type,
            entity_id=entity_id if entity_id is not None else effect.entity_id,
            source_version=effect.source_version,
            source_fingerprint=source_fingerprint,
            not_before=not_before,
            trigger=effect.effect_type,
            idempotency_identity=identity,
            correlation_id=effect.correlation_id,
            payload=payload,
        )
        await self.submit(envelope)
        return envelope


@dataclass(slots=True)
class DerivedEffectsAdapter:
    """CHAT04/03 DownstreamEffectsPort -> exact DOC-18 jobs.

    No editorial lifecycle decision is made here: current fingerprints/generation inputs are reloaded
    through DerivedSourcePort after the authoritative transaction commits.
    """
    producer: Doc18Producer
    source: DerivedSourcePort

    async def _cache(self, effect: SiteEffectEnvelope, *, dependencies: list[tuple[str, str]] | None = None, broad: bool = False) -> None:
        deps = [{"type": t, "id": i} for t, i in (dependencies or [])]
        payload = {"mode": "SITE_PUBLIC_ALL" if broad else "TARGETED", "dependencies": deps}
        await self.producer.make_and_submit(job_type=JobType.CACHE_INVALIDATE, effect=effect, payload=payload)

    async def _sitemap(self, effect: SiteEffectEnvelope) -> None:
        desired = await self.producer.control.mark_sitemap_dirty(effect.context.site_id)
        payload = {"desired_seq": desired}
        await self.producer.make_and_submit(job_type=JobType.SITEMAP_BUILD_SITE, effect=effect, payload=payload, entity_type="SITE", entity_id=effect.context.site_id)

    async def _search_sync(self, effect: SiteEffectEnvelope, *, post_id: str) -> None:
        fingerprint = await self.source.current_search_fingerprint(effect.context, entity_type="POST", entity_id=post_id, source_version=effect.source_version)
        payload = {"post_id": post_id, "source_fingerprint": fingerprint}
        await self.producer.make_and_submit(job_type=JobType.SEARCH_SYNC_POST, effect=effect, payload=payload, entity_type="POST", entity_id=post_id, source_fingerprint=fingerprint)

    async def emit(self, effect: SiteEffectEnvelope) -> None:
        kind = effect.effect_type

        # CHAT04 emits namespaced integration events after the durable editorial
        # transaction commits.  DOC-18 job semantics predate that namespace, so
        # normalize only the already-approved effects at this adapter boundary.
        if kind.startswith("EDITORIAL.POST."):
            action = kind.removeprefix("EDITORIAL.POST.")
            kind = {"RESTORE": "RESTORE_TO_DRAFT"}.get(action, action)
            if kind == "UNSCHEDULE":
                # SCHEDULED -> private DRAFT has no public artifact to activate; a
                # stale delayed publish is fenced by current state/version.
                return
        elif kind in {"EDITORIAL.CATEGORY.CHANGED", "EDITORIAL.CATEGORY.RETIRED"}:
            kind = "CATEGORY_PUBLIC_CHANGE"
        elif kind in {"EDITORIAL.TAG.CHANGED", "EDITORIAL.TAG.RETIRED", "EDITORIAL.TAG.MERGED"}:
            kind = "TAG_PUBLIC_CHANGE"
        elif kind in {"EDITORIAL.AUTHOR.CHANGED", "EDITORIAL.AUTHOR.RETIRED"}:
            kind = "AUTHOR_PUBLIC_CHANGE"
        elif kind in {"EDITORIAL.NAVIGATION.CHANGED", "EDITORIAL.HOMEPAGE.CHANGED", "EDITORIAL.SITE_SETTINGS.CHANGED"}:
            await self._cache(effect, broad=True)
            await self._sitemap(effect)
            return

        if kind in {"SCHEDULE", "RESCHEDULE"}:
            scheduled = _to_dt(effect.payload.get("scheduled_for_utc") or effect.payload.get("scheduled_for"))
            source_version = int(effect.source_version if effect.source_version is not None else effect.payload["source_version"])
            payload = {
                "post_id": effect.entity_id,
                "source_version": source_version,
                "scheduled_for_utc": scheduled.isoformat().replace("+00:00", "Z"),
                "scheduled_for_utc_epoch_ms": int(scheduled.timestamp() * 1000),
            }
            await self.producer.make_and_submit(job_type=JobType.PUBLISH_DUE, effect=effect, payload=payload, source_fingerprint=None, not_before=scheduled)
            return

        if kind in {"PUBLISH", "SCHEDULED_PUBLISH", "UPDATE_PUBLISHED", "ARCHIVE", "TRASH", "PERMANENT_DELETE", "RESTORE_TO_DRAFT"}:
            await self._cache(effect, dependencies=[("POST", effect.entity_id)])
            await self._search_sync(effect, post_id=effect.entity_id)
            await self._sitemap(effect)
            return

        if kind in {"CATEGORY_PUBLIC_CHANGE", "TAG_PUBLIC_CHANGE", "AUTHOR_PUBLIC_CHANGE"}:
            entity_type = kind.split("_", 1)[0]
            fingerprint = await self.source.current_search_fingerprint(effect.context, entity_type=entity_type, entity_id=effect.entity_id, source_version=effect.source_version)
            payload = {"entity_type": entity_type, "entity_id": effect.entity_id, "source_fingerprint": fingerprint}
            await self._cache(effect, dependencies=[(entity_type, effect.entity_id)])
            await self.producer.make_and_submit(job_type=JobType.SEARCH_REFRESH_ENTITY, effect=effect, payload=payload, entity_type=entity_type, source_fingerprint=fingerprint)
            await self._sitemap(effect)
            return

        if kind in {"MEDIA_UPLOAD_BASELINE_READY", "MEDIA_REPLACE_BASELINE_READY"}:
            generation = await self.source.media_generation(effect.context, media_id=effect.entity_id)
            if generation is None:
                return
            requested = [spec.variant_key for spec in VARIANT_CATALOG if spec.variant_key != "native_webp"]
            fingerprint = str(generation["checksum_sha256"])
            payload = {"media_id": effect.entity_id, "source_fingerprint": fingerprint, "requested_variant_keys": requested}
            await self.producer.make_and_submit(job_type=JobType.MEDIA_VARIANTS, effect=effect, payload=payload, source_fingerprint=fingerprint)
            if kind == "MEDIA_REPLACE_BASELINE_READY":
                await self._cache(effect, dependencies=[("MEDIA", effect.entity_id)])
            return

        if kind in {"MEDIA_METADATA_CHANGE", "MEDIA_VARIANT_AVAILABILITY_CHANGE", "MEDIA_DELETE", "MEDIA_PUBLIC_ELIGIBILITY_REVOKE"}:
            await self._cache(effect, dependencies=[("MEDIA", effect.entity_id)])
            return

        if kind == "SEARCH_REINDEX_REQUESTED":
            generation = str(effect.payload.get("request_id") or uuid4())
            payload = {"rebuild_generation": generation}
            await self.producer.make_and_submit(job_type=JobType.SEARCH_REINDEX_SITE, effect=effect, payload=payload, entity_type="SITE", entity_id=effect.context.site_id)
            return

        if kind in {"SITE_SEO_CHANGE", "SITE_ENABLE", "SITE_DISABLE", "SITE_ARCHIVE", "DOMAIN_CHANGE"}:
            await self._cache(effect, broad=True)
            await self._sitemap(effect)
            if kind == "SITE_ENABLE":
                generation = f"site-enable-{effect.correlation_id}"
                await self.producer.make_and_submit(job_type=JobType.SEARCH_REINDEX_SITE, effect=effect, payload={"rebuild_generation": generation}, entity_type="SITE", entity_id=effect.context.site_id)
            elif kind in {"SITE_DISABLE", "SITE_ARCHIVE"}:
                payload = {"bucket": _bucket(datetime.now(UTC))}
                await self.producer.make_and_submit(job_type=JobType.SEARCH_RECONCILE_SITE, effect=effect, payload=payload, entity_type="SITE", entity_id=effect.context.site_id)
            return

        raise ValueError(f"unmapped derived effect type: {kind}")
