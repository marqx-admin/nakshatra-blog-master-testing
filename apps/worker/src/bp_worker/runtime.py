from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
import asyncio
import hashlib
from typing import Any

from bp_background_contracts import RETRY_PROFILE_BY_JOB, RETRY_PROFILES, JobEnvelope, JobType
from bp_domain.context import ContextKind, ContextSource, SiteContext
from bp_ports import DeadLetterRecord, MediaDeliveryPort, MediaProcessorPort, MediaRepositoryPort, ObjectStoragePort, QueuePort, RedisControlPort, SearchIndexPort, SiteRegistryPort, SitemapArtifactPort, DerivedSourcePort


class FailureClass(StrEnum):
    SUCCESS = "SUCCESS"
    STALE_NOOP = "STALE_NOOP"
    TRANSIENT = "TRANSIENT"
    RATE_LIMITED = "RATE_LIMITED"
    BUSINESS_INVARIANT = "BUSINESS_INVARIANT"
    SECURITY_INVARIANT = "SECURITY_INVARIANT"
    PERMANENT_DEPENDENCY = "PERMANENT_DEPENDENCY"


class JobActionError(Exception):
    def __init__(self, failure_class: FailureClass, code: str, message: str = "job failed", *, retry_after_seconds: int | None = None) -> None:
        super().__init__(message)
        self.failure_class = failure_class
        self.code = code
        self.retry_after_seconds = retry_after_seconds


@dataclass(frozen=True, slots=True)
class ExecutionDecision:
    outcome: FailureClass
    retry: bool = False
    countdown_seconds: float | None = None
    dead_lettered: bool = False
    error_code: str | None = None


@dataclass(slots=True)
class WorkerContextResolver:
    sites: SiteRegistryPort

    async def resolve(self, envelope: JobEnvelope) -> SiteContext:
        site = await self.sites.get_site_by_id(envelope.site_id)
        if site is None:
            raise JobActionError(FailureClass.SECURITY_INVARIANT, "WORKER_SITE_UNKNOWN")
        # Worker payload is a routing hint only; current registry is authoritative.
        return SiteContext(
            kind=ContextKind.WORKER_SITE,
            site_id=site.site_id,
            site_key=site.site_key,
            site_status=site.lifecycle,
            canonical_domain=site.canonical_domain,
            context_source=ContextSource.WORKER_PAYLOAD,
            request_id=envelope.correlation_id,
            timezone=site.timezone,
            locale=site.locale,
            resolved_at=datetime.now(UTC),
            version_marker=site.version_marker,
        )


@dataclass(slots=True)
class WorkerEngine:
    control: RedisControlPort
    queue: QueuePort
    resolver: WorkerContextResolver
    actions: "DerivedJobActions"

    @staticmethod
    def _lease_coordinates(envelope: JobEnvelope) -> tuple[str, str]:
        purpose = envelope.job_type.value
        if envelope.job_type is JobType.MEDIA_VARIANTS:
            return purpose, f"{envelope.entity_id or envelope.payload['media_id']}:{envelope.source_fingerprint or envelope.payload['source_fingerprint']}"
        if envelope.job_type in {
            JobType.SEARCH_REINDEX_SITE, JobType.SITEMAP_BUILD_SITE,
            JobType.SCHEDULE_RECONCILE_SITE, JobType.MEDIA_RECONCILE_SITE,
            JobType.SEARCH_RECONCILE_SITE, JobType.SITEMAP_RECONCILE_SITE,
        }:
            return purpose, envelope.site_id
        if envelope.job_type is JobType.CACHE_INVALIDATE:
            return purpose, envelope.idempotency_identity
        return purpose, envelope.entity_id or envelope.idempotency_identity

    async def _run_with_lease_renewal(self, envelope: JobEnvelope, context: SiteContext, *, lease, purpose: str, identity: str, timeout_seconds: int):
        task = asyncio.create_task(self.actions.run(envelope, context))
        interval = max(1.0, timeout_seconds / 3.0)
        loop = asyncio.get_running_loop()
        deadline = loop.time() + timeout_seconds
        try:
            while True:
                remaining = deadline - loop.time()
                if remaining <= 0:
                    raise JobActionError(FailureClass.TRANSIENT, "ATTEMPT_TIMEOUT")
                done, _ = await asyncio.wait({task}, timeout=min(interval, remaining))
                if task in done:
                    return task.result()
                if loop.time() >= deadline:
                    raise JobActionError(FailureClass.TRANSIENT, "ATTEMPT_TIMEOUT")
                renewed = await self.control.renew_lease(
                    site_id=envelope.site_id, purpose=purpose, identity=identity, lease=lease,
                    ttl_seconds=timeout_seconds + 60,
                )
                if renewed is None:
                    raise JobActionError(FailureClass.TRANSIENT, "LEASE_LOST")
                lease = renewed
        finally:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    async def execute(self, envelope: JobEnvelope, *, attempt: int = 1, first_failed_at: datetime | None = None) -> ExecutionDecision:
        profile = RETRY_PROFILES[RETRY_PROFILE_BY_JOB[envelope.job_type]]
        # Read before repair: a normal duplicate must not overwrite TERMINAL dedupe state.
        # A DLQ replay is identifiable by its fresh child correlation + preserved causation_id;
        # replay re-arms the same idempotency identity but still runs all current-state checks.
        state = await self.control.get_dedupe_state(envelope)
        replay = envelope.causation_id is not None and envelope.causation_id != envelope.correlation_id
        if state is not None and state.state == "TERMINAL" and not replay:
            return ExecutionDecision(FailureClass.STALE_NOOP)
        await self.control.repair_enqueued(envelope)

        purpose, identity = self._lease_coordinates(envelope)
        lease = await self.control.acquire_lease(
            site_id=envelope.site_id,
            purpose=purpose,
            identity=identity,
            ttl_seconds=profile.attempt_timeout_seconds + 60,
        )
        if lease is None:
            failure = JobActionError(FailureClass.TRANSIENT, "LEASE_BUSY")
            return await self._failure(envelope, failure, attempt=attempt, first_failed_at=first_failed_at)
        try:
            context = await self.resolver.resolve(envelope)
            result = await self._run_with_lease_renewal(
                envelope, context, lease=lease, purpose=purpose, identity=identity,
                timeout_seconds=profile.attempt_timeout_seconds,
            )
            if result not in {FailureClass.SUCCESS, FailureClass.STALE_NOOP}:
                raise JobActionError(FailureClass.PERMANENT_DEPENDENCY, "INVALID_HANDLER_OUTCOME")
            await self.control.mark_terminal(envelope, result.value)
            return ExecutionDecision(result)
        except JobActionError as exc:
            return await self._failure(envelope, exc, attempt=attempt, first_failed_at=first_failed_at)
        except Exception as exc:
            failure = JobActionError(FailureClass.TRANSIENT, exc.__class__.__name__.upper(), str(exc))
            return await self._failure(envelope, failure, attempt=attempt, first_failed_at=first_failed_at)
        finally:
            await self.control.release_lease(
                site_id=envelope.site_id, purpose=purpose, identity=identity, lease=lease,
            )

    async def _failure(self, envelope: JobEnvelope, failure: JobActionError, *, attempt: int, first_failed_at: datetime | None) -> ExecutionDecision:
        profile = RETRY_PROFILES[RETRY_PROFILE_BY_JOB[envelope.job_type]]
        retryable = failure.failure_class in {FailureClass.TRANSIENT, FailureClass.RATE_LIMITED}
        if retryable and attempt < profile.max_attempts:
            countdown = profile.delay_seconds(
                attempt,
                idempotency_identity=envelope.idempotency_identity,
                retry_after_seconds=failure.retry_after_seconds,
            )
            return ExecutionDecision(failure.failure_class, retry=True, countdown_seconds=countdown, error_code=failure.code)

        now = datetime.now(UTC)
        # Privacy-safe original envelope: DOC-18 job payloads are identifier/derived-control only.
        record = DeadLetterRecord(
            envelope=envelope.to_wire(),
            queue=envelope.queue.value,
            final_error_class=failure.failure_class.value,
            final_error_code=failure.code,
            attempt_count=attempt,
            first_failed_at=first_failed_at or now,
            last_failed_at=now,
            correlation_id=envelope.correlation_id,
        )
        await self.queue.dead_letter(record)
        await self.control.mark_terminal(envelope, f"DLQ:{failure.code}")
        return ExecutionDecision(failure.failure_class, dead_lettered=True, error_code=failure.code)


@dataclass(slots=True)
class DerivedJobActions:
    source: DerivedSourcePort
    producer: Any
    effects: Any
    search: SearchIndexPort
    storage: ObjectStoragePort
    media_repository: MediaRepositoryPort
    media_processor: MediaProcessorPort
    sitemap: SitemapArtifactPort
    control: RedisControlPort
    delivery: MediaDeliveryPort | None = None

    async def run(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        dispatch = {
            JobType.PUBLISH_DUE: self._publish_due,
            JobType.MEDIA_VARIANTS: self._media_variants,
            JobType.SEARCH_SYNC_POST: self._search_sync_post,
            JobType.SEARCH_REFRESH_ENTITY: self._search_refresh_entity,
            JobType.SEARCH_REINDEX_SITE: self._search_reindex_site,
            JobType.SITEMAP_BUILD_SITE: self._sitemap_build_site,
            JobType.CACHE_INVALIDATE: self._cache_invalidate,
            JobType.SCHEDULE_RECONCILE_SITE: self._schedule_reconcile,
            JobType.MEDIA_RECONCILE_SITE: self._media_reconcile,
            JobType.SEARCH_RECONCILE_SITE: self._search_reconcile,
            JobType.SITEMAP_RECONCILE_SITE: self._sitemap_reconcile,
        }
        return await dispatch[envelope.job_type](envelope, context)

    async def _publish_due(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        scheduled = datetime.fromisoformat(str(envelope.payload["scheduled_for_utc"]).replace("Z", "+00:00"))
        outcome = await self.source.publish_due(
            context,
            post_id=str(envelope.payload["post_id"]),
            source_version=int(envelope.payload["source_version"]),
            scheduled_for_utc=scheduled,
        )
        if outcome == "STALE_NOOP":
            return FailureClass.STALE_NOOP
        if outcome != "PUBLISHED":
            raise JobActionError(FailureClass.BUSINESS_INVARIANT, "PUBLISH_DUE_INVARIANT")
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="SCHEDULED_PUBLISH", context=context, entity_type="POST", entity_id=str(envelope.payload["post_id"]),
            correlation_id=envelope.correlation_id, source_version=envelope.payload["source_version"], payload={},
        ))
        return FailureClass.SUCCESS

    async def _media_variants(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        from bp_domain.media import VARIANT_BY_KEY, variant_object_key
        generation = await self.source.media_generation(context, media_id=str(envelope.payload["media_id"]))
        if generation is None:
            return FailureClass.STALE_NOOP
        if str(generation["checksum_sha256"]) != str(envelope.payload["source_fingerprint"]):
            return FailureClass.STALE_NOOP
        original_key = str(generation["object_key"])
        original_meta = await self.storage.head_private(original_key)
        if original_meta is None or original_meta.checksum_sha256 != str(generation["checksum_sha256"]):
            raise JobActionError(FailureClass.PERMANENT_DEPENDENCY, "MEDIA_ORIGINAL_INTEGRITY_FAILED")
        original = await self.storage.get_private(original_key)
        for key in envelope.payload.get("requested_variant_keys", []):
            spec = VARIANT_BY_KEY.get(key)
            native_repair = key == "native_webp" and envelope.payload.get("native_webp_repair") is True
            if spec is None or (key == "native_webp" and not native_repair):
                raise JobActionError(FailureClass.SECURITY_INVARIANT, "UNAPPROVED_MEDIA_VARIANT")
            try:
                generated = await self.media_processor.generate_variant(data=original, source_mime_type=str(generation["mime_type"]), variant_key=key)
                if generated is None:
                    continue
                if generated.mime_type != spec.mime_type or generated.width <= 0 or generated.height <= 0 or not generated.data:
                    raise ValueError("generated derivative failed DOC-17 variant verification")
                object_key = variant_object_key(site_id=context.site_id, media_id=str(envelope.payload["media_id"]), checksum_sha256=str(generation["checksum_sha256"]), variant_key=key)
                checksum = hashlib.sha256(generated.data).hexdigest()
                await self.storage.put_private_create_only(key=object_key, data=generated.data, content_type=generated.mime_type, checksum_sha256=checksum)
                stored = await self.storage.head_private(object_key)
                if stored is None or stored.checksum_sha256 != checksum or stored.byte_size != len(generated.data) or stored.content_type != generated.mime_type:
                    raise ValueError("stored derivative failed integrity verification")
                # Replacement generations are allowed to run concurrently. Revalidate the
                # authoritative generation immediately before publishing derivative metadata so
                # an old generation can never become current by finishing late.
                current_generation = await self.source.media_generation(
                    context, media_id=str(envelope.payload["media_id"])
                )
                if current_generation is None or str(current_generation["checksum_sha256"]) != str(envelope.payload["source_fingerprint"]):
                    return FailureClass.STALE_NOOP
                await self.media_repository.upsert_variant(context, str(envelope.payload["media_id"]), {
                    "variant_key": key, "mime_type": generated.mime_type, "byte_size": len(generated.data),
                    "width": generated.width, "height": generated.height, "object_key": object_key,
                })
            except Exception as exc:
                # AVIF is an optional preferred-format sibling.  WebP (including native_webp
                # baseline repair) remains mandatory and therefore retries/fails loudly.
                if spec.mime_type == "image/avif":
                    continue
                raise JobActionError(FailureClass.TRANSIENT, "MEDIA_VARIANT_GENERATION_FAILED", str(exc)) from exc
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="MEDIA_VARIANT_AVAILABILITY_CHANGE", context=context, entity_type="MEDIA", entity_id=str(envelope.payload["media_id"]),
            correlation_id=envelope.correlation_id, source_version=envelope.source_version, payload={},
        ))
        return FailureClass.SUCCESS

    async def _acquire_search_reindex_gate(self, context: SiteContext):
        lease = await self.control.acquire_lease(
            site_id=context.site_id,
            purpose=JobType.SEARCH_REINDEX_SITE.value,
            identity=context.site_id,
            ttl_seconds=120,
        )
        if lease is None:
            raise JobActionError(FailureClass.TRANSIENT, "SEARCH_REINDEX_ACTIVE")
        return lease

    async def _release_search_reindex_gate(self, context: SiteContext, lease) -> None:
        await self.control.release_lease(
            site_id=context.site_id, purpose=JobType.SEARCH_REINDEX_SITE.value,
            identity=context.site_id, lease=lease,
        )

    async def _search_sync_post(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        gate = await self._acquire_search_reindex_gate(context)
        try:
            post_id = str(envelope.payload["post_id"])
            current_fingerprint = await self.source.current_search_fingerprint(
                context, entity_type="POST", entity_id=post_id, source_version=envelope.source_version
            )
            # The payload is a change coordinate, not a stale serialized search document.  If
            # source truth moved, continue by projecting current truth; never write old content.
            document = await self.source.public_search_document(context, post_id=post_id)
            if document is None:
                await self.search.delete_public(site_id=context.site_id, post_id=post_id)
            else:
                if document.site_id != context.site_id:
                    raise JobActionError(FailureClass.SECURITY_INVARIANT, "SEARCH_CROSS_SITE_DOCUMENT")
                await self.search.upsert_public(document)
            # Retain the comparison as an observable stale-coordinate distinction without
            # suppressing convergence to current truth.
            _ = current_fingerprint != str(envelope.payload["source_fingerprint"])
            return FailureClass.SUCCESS
        finally:
            await self._release_search_reindex_gate(context, gate)

    async def _search_refresh_entity(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        gate = await self._acquire_search_reindex_gate(context)
        try:
            entity_type = str(envelope.payload["entity_type"])
            entity_id = str(envelope.payload["entity_id"])
            current_fingerprint = await self.source.current_search_fingerprint(
                context, entity_type=entity_type, entity_id=entity_id, source_version=envelope.source_version
            )
            posts = await self.source.affected_public_posts(context, entity_type=entity_type, entity_id=entity_id)
            for post_id in sorted(set(posts)):
                await self.effects._search_sync(SiteEffectEnvelope(
                    effect_type=f"{entity_type}_PUBLIC_CHANGE", context=context, entity_type="POST", entity_id=post_id,
                    correlation_id=envelope.correlation_id, payload={"source_coordinate_changed": current_fingerprint != str(envelope.payload["source_fingerprint"])},
                ), post_id=post_id)
            return FailureClass.SUCCESS
        finally:
            await self._release_search_reindex_gate(context, gate)

    async def _search_reindex_site(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        generation = str(envelope.payload["rebuild_generation"])
        await self.control.set_search_status(context.site_id, "REINDEXING")
        await self.search.begin_reindex(site_id=context.site_id, generation=generation)
        count = 0
        try:
            async for document in self.source.reindex_documents(context):
                if document.site_id != context.site_id:
                    raise JobActionError(FailureClass.SECURITY_INVARIANT, "REINDEX_CROSS_SITE_DOCUMENT")
                await self.search.upsert_public(document, generation=generation)
                count += 1
            if not await self.search.validate_generation(site_id=context.site_id, generation=generation, expected_count=count):
                raise JobActionError(FailureClass.PERMANENT_DEPENDENCY, "REINDEX_VALIDATION_FAILED")
            await self.search.activate_generation(site_id=context.site_id, generation=generation)
            await self.control.set_search_status(context.site_id, "READY", active_generation=generation)
            return FailureClass.SUCCESS
        except asyncio.CancelledError:
            # Attempt timeout / lease-loss cancellation must not leave a shadow generation or
            # REINDEXING status behind. Cleanup is safe because the active alias has not switched.
            await self.search.discard_generation(site_id=context.site_id, generation=generation)
            await self.control.set_search_status(context.site_id, "DEGRADED", message_code="REINDEX_CANCELLED")
            raise
        except Exception:
            await self.search.discard_generation(site_id=context.site_id, generation=generation)
            await self.control.set_search_status(context.site_id, "DEGRADED", message_code="REINDEX_FAILED")
            raise

    async def _sitemap_build_site(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        desired, built = await self.control.sitemap_sequence(context.site_id)
        requested = int(envelope.payload["desired_seq"])
        if built >= requested:
            return FailureClass.STALE_NOOP
        target = max(desired, requested)
        entries = await self.source.sitemap_entries(context)
        candidate = await self.sitemap.build_candidate(context, entries=entries, sequence=target)
        await self.sitemap.activate_candidate(context, candidate_id=candidate)
        await self.control.mark_sitemap_built(context.site_id, target)
        desired_after, built_after = await self.control.sitemap_sequence(context.site_id)
        if desired_after > built_after:
            from bp_domain.effects import SiteEffectEnvelope
            await self.effects._sitemap(SiteEffectEnvelope(
                effect_type="SITEMAP_DIRTY_DURING_BUILD", context=context, entity_type="SITE", entity_id=context.site_id,
                correlation_id=envelope.correlation_id, payload={},
            ))
        return FailureClass.SUCCESS

    async def _cache_invalidate(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        mode = str(envelope.payload["mode"])
        if mode == "SITE_PUBLIC_ALL":
            await self.control.increment_public_epoch(context.site_id)
        elif mode == "TARGETED":
            deps = tuple((str(item["type"]), str(item["id"])) for item in envelope.payload.get("dependencies", []))
            await self.control.invalidate_dependencies(context.site_id, deps)
        else:
            raise JobActionError(FailureClass.SECURITY_INVARIANT, "INVALID_CACHE_INVALIDATION_MODE")

        # DOC-18 q18.cache owns the required DOC-17 CDN revocation execution.
        # The envelope contains only typed site-owned identity; purge URL/object key
        # input is never accepted from a producer.
        if envelope.trigger in {"MEDIA_REPLACE_BASELINE_READY", "MEDIA_DELETE", "MEDIA_PUBLIC_ELIGIBILITY_REVOKE"}:
            if envelope.entity_type != "MEDIA" or not envelope.entity_id:
                raise JobActionError(FailureClass.SECURITY_INVARIANT, "MEDIA_CDN_IDENTITY_MISSING")
            if self.delivery is None:
                raise JobActionError(FailureClass.TRANSIENT, "MEDIA_CDN_PURGE_UNAVAILABLE")
            await self.delivery.purge_media_namespace(site_key=context.site_key, media_id=envelope.entity_id)
        return FailureClass.SUCCESS

    async def _schedule_reconcile(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        now = datetime.now(UTC)
        for row in await self.source.reconcile_due_schedules(context, now=now):
            scheduled = row["scheduled_for_utc"]
            effect = SiteEffectEnvelope(
                effect_type="SCHEDULE", context=context, entity_type="POST", entity_id=str(row["post_id"]),
                correlation_id=envelope.correlation_id, source_version=row["source_version"], payload={"scheduled_for_utc": scheduled},
            )
            await self.effects.emit(effect)
        return FailureClass.SUCCESS

    async def _media_reconcile(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        from bp_domain.media import VARIANT_CATALOG
        for row in await self.source.reconcile_media(context):
            media_id = str(row["media_id"])
            generation = await self.source.media_generation(context, media_id=media_id)
            if generation is None:
                continue
            requested = row.get("requested_variant_keys")
            if requested is None:
                requested = [spec.variant_key for spec in VARIANT_CATALOG if spec.variant_key != "native_webp"]
            requested = [str(key) for key in requested]
            native_repair = bool(row.get("native_webp_repair"))
            if native_repair and "native_webp" not in requested:
                requested.insert(0, "native_webp")
            payload = {
                "media_id": media_id,
                "source_fingerprint": str(generation["checksum_sha256"]),
                "requested_variant_keys": requested,
            }
            if native_repair:
                payload["native_webp_repair"] = True
            effect = SiteEffectEnvelope(
                effect_type="MEDIA_RECONCILE", context=context, entity_type="MEDIA", entity_id=media_id,
                correlation_id=envelope.correlation_id, source_version=row.get("source_version"), payload={},
            )
            await self.producer.make_and_submit(
                job_type=JobType.MEDIA_VARIANTS, effect=effect, payload=payload, entity_type="MEDIA",
                entity_id=media_id, source_fingerprint=str(generation["checksum_sha256"]),
            )
        return FailureClass.SUCCESS

    async def _search_reconcile(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        from bp_domain.effects import SiteEffectEnvelope
        for row in await self.source.reconcile_search(context):
            await self.effects._search_sync(SiteEffectEnvelope(
                effect_type="SEARCH_RECONCILE", context=context, entity_type="POST", entity_id=str(row["post_id"]),
                correlation_id=envelope.correlation_id, source_version=row.get("source_version"), payload={},
            ), post_id=str(row["post_id"]))
        return FailureClass.SUCCESS

    async def _sitemap_reconcile(self, envelope: JobEnvelope, context: SiteContext) -> FailureClass:
        if await self.source.reconcile_sitemap(context):
            from bp_domain.effects import SiteEffectEnvelope
            await self.effects._sitemap(SiteEffectEnvelope(
                effect_type="SITEMAP_RECONCILE", context=context, entity_type="SITE", entity_id=context.site_id,
                correlation_id=envelope.correlation_id, payload={},
            ))
        return FailureClass.SUCCESS
