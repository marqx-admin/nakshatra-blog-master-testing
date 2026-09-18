from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import asdict, replace
from datetime import UTC, datetime
import heapq
import json
from typing import Any

from bp_background_contracts.envelope import JobEnvelope
from bp_background_contracts import priority_for
from bp_background_contracts.queue_ids import DLQ_BY_QUEUE, QueueId
from bp_ports.derived import DeadLetterRecord


class InMemoryDurableQueueAdapter:
    """Restart-safe test double: in-flight messages redeliver until explicitly acked."""

    def __init__(self) -> None:
        self.ready: dict[str, deque[JobEnvelope]] = defaultdict(deque)
        self.delayed: list[tuple[float, int, JobEnvelope]] = []
        self.inflight: dict[str, JobEnvelope] = {}
        self.dead_letters: dict[str, list[DeadLetterRecord]] = defaultdict(list)
        self._counter = 0
        self._delivery_counter = 0

    async def enqueue(self, envelope: JobEnvelope) -> str:
        self.ready[envelope.queue.value].append(envelope)
        self._counter += 1
        return f"memq-{self._counter}"

    async def enqueue_delayed(self, envelope: JobEnvelope) -> str:
        if envelope.not_before is None:
            return await self.enqueue(envelope)
        self._counter += 1
        heapq.heappush(self.delayed, (envelope.not_before.timestamp(), self._counter, envelope))
        return f"memq-delay-{self._counter}"

    async def promote_due(self, now: datetime) -> int:
        count = 0
        while self.delayed and self.delayed[0][0] <= now.timestamp():
            _, _, envelope = heapq.heappop(self.delayed)
            self.ready[envelope.queue.value].append(envelope)
            count += 1
        return count

    async def dead_letter(self, record: DeadLetterRecord) -> None:
        source = next(q for q in DLQ_BY_QUEUE if q.value == record.queue)
        self.dead_letters[DLQ_BY_QUEUE[source]].append(record)

    async def replay_dead_letter(self, queue: str, index: int, *, correlation_id: str) -> JobEnvelope:
        records = self.dead_letters[queue]
        record = records[index]
        envelope = JobEnvelope.from_wire(record.envelope)
        replayed = replace(
            envelope,
            correlation_id=correlation_id,
            causation_id=envelope.correlation_id,
            enqueued_at=datetime.now(UTC),
        )
        await self.enqueue(replayed)
        return replayed

    # Test/worker-host delivery helpers. Pop does not delete durable truth until ack.
    async def receive(self, queue: str) -> tuple[str, JobEnvelope] | None:
        if not self.ready[queue]:
            return None
        envelope = self.ready[queue].popleft()
        self._delivery_counter += 1
        tag = f"d-{self._delivery_counter}"
        self.inflight[tag] = envelope
        return tag, envelope

    async def ack(self, delivery_tag: str) -> None:
        self.inflight.pop(delivery_tag, None)

    async def recover_unacked(self) -> int:
        count = 0
        for tag, envelope in list(self.inflight.items()):
            self.ready[envelope.queue.value].appendleft(envelope)
            self.inflight.pop(tag, None)
            count += 1
        return count


class CeleryRedisQueueAdapter:
    """DOC-23 production mapping over separate Celery broker + broker-private Redis state.

    Far-future delayed work is never put into Celery ETA memory.  Promotion is a
    claim/ack protocol on the *broker* Redis plane so a scheduler crash after claim
    can be recovered without inventing an application-visible Redis key or a seventh
    logical queue.  DLQ replay metadata is likewise broker-private transport state;
    PostgreSQL remains business truth.
    """

    _DELAY_ZSET = "_bp_broker_v1:publish_due"
    _PROMOTION_ZSET = "_bp_broker_v1:publish_due:promoting"
    _PROMOTION_DUE_HASH = "_bp_broker_v1:publish_due:promotion_due"
    _PROMOTION_CLAIM_SECONDS = 60
    _DLQ_RECORD_PREFIX = "_bp_broker_v1:dlq_records:"

    _CLAIM_DUE = """
local vals=redis.call('ZRANGEBYSCORE',KEYS[1],'-inf',ARGV[1],'LIMIT',0,ARGV[2],'WITHSCORES')
local out={}
for i=1,#vals,2 do
  local member=vals[i]
  local due=vals[i+1]
  if redis.call('ZREM',KEYS[1],member)==1 then
    redis.call('ZADD',KEYS[2],ARGV[3],member)
    redis.call('HSET',KEYS[3],member,due)
    table.insert(out,member)
  end
end
return out
"""
    _ACK_PROMOTION = """
redis.call('ZREM',KEYS[1],ARGV[1])
redis.call('HDEL',KEYS[2],ARGV[1])
return 1
"""
    _ROLLBACK_PROMOTION = """
local due=redis.call('HGET',KEYS[3],ARGV[1])
if due then redis.call('ZADD',KEYS[1],due,ARGV[1]) end
redis.call('ZREM',KEYS[2],ARGV[1])
redis.call('HDEL',KEYS[3],ARGV[1])
return 1
"""
    _RECOVER_STALE = """
local vals=redis.call('ZRANGEBYSCORE',KEYS[2],'-inf',ARGV[1],'LIMIT',0,ARGV[2])
for _,member in ipairs(vals) do
  local due=redis.call('HGET',KEYS[3],member)
  if due then redis.call('ZADD',KEYS[1],due,member) end
  redis.call('ZREM',KEYS[2],member)
  redis.call('HDEL',KEYS[3],member)
end
return #vals
"""

    def __init__(self, *, celery_app, broker_redis) -> None:
        self.celery = celery_app
        self.broker_redis = broker_redis

    @staticmethod
    def _provider_priority(envelope: JobEnvelope) -> int:
        # DOC-18 P0 is highest. Celery/Redis uses larger numeric values as higher
        # priority when configured with all priority_steps (see bp_worker.celery_app).
        logical = priority_for(envelope.job_type, envelope.payload, trigger=envelope.trigger)
        if logical not in {0, 1, 2, 3, 4}:
            raise ValueError("invalid DOC-18 priority class")
        return 9 - logical

    async def enqueue(self, envelope: JobEnvelope) -> str:
        result = self.celery.send_task(
            f"bp_worker.{envelope.job_type.value}",
            args=[envelope.to_wire()],
            queue=envelope.queue.value,
            priority=self._provider_priority(envelope),
        )
        return str(result.id)

    async def enqueue_delayed(self, envelope: JobEnvelope) -> str:
        if envelope.not_before is None:
            return await self.enqueue(envelope)
        if envelope.job_type.value != "JOB18-PUBLISH-DUE" or envelope.queue.value != "q18.publish":
            raise ValueError("only JOB18-PUBLISH-DUE may use far-future delayed broker state")
        member = json.dumps(envelope.to_wire(), sort_keys=True, separators=(",", ":"))
        added = await self.broker_redis.zadd(
            self._DELAY_ZSET, {member: envelope.not_before.timestamp()}, nx=True
        )
        return f"broker-delay-{int(bool(added))}"

    async def recover_stale_promotions(self, now: datetime) -> int:
        return int(
            await self.broker_redis.eval(
                self._RECOVER_STALE,
                3,
                self._DELAY_ZSET,
                self._PROMOTION_ZSET,
                self._PROMOTION_DUE_HASH,
                now.timestamp(),
                1000,
            )
        )

    async def promote_due(self, now: datetime) -> int:
        await self.recover_stale_promotions(now)
        raw_items = await self.broker_redis.eval(
            self._CLAIM_DUE,
            3,
            self._DELAY_ZSET,
            self._PROMOTION_ZSET,
            self._PROMOTION_DUE_HASH,
            now.timestamp(),
            100,
            now.timestamp() + self._PROMOTION_CLAIM_SECONDS,
        )
        promoted = 0
        for raw in raw_items:
            text = raw.decode() if isinstance(raw, bytes) else str(raw)
            envelope = JobEnvelope.from_wire(json.loads(text))
            try:
                await self.enqueue(envelope)
            except Exception:
                # Definite local exception or ambiguous broker failure is repaired by
                # rollback now; if the process dies first, stale promotion recovery
                # repeats safely and job/dedupe/current-state checks absorb duplicate.
                await self.broker_redis.eval(
                    self._ROLLBACK_PROMOTION,
                    3,
                    self._DELAY_ZSET,
                    self._PROMOTION_ZSET,
                    self._PROMOTION_DUE_HASH,
                    text,
                )
                raise
            await self.broker_redis.eval(
                self._ACK_PROMOTION,
                2,
                self._PROMOTION_ZSET,
                self._PROMOTION_DUE_HASH,
                text,
            )
            promoted += 1
        return promoted

    @staticmethod
    def _dlq_name(source_queue: str) -> str:
        source = QueueId(source_queue)
        return DLQ_BY_QUEUE[source].value

    async def dead_letter(self, record: DeadLetterRecord) -> None:
        dlq_name = self._dlq_name(record.queue)
        wire = asdict(record)
        for key in ("first_failed_at", "last_failed_at"):
            wire[key] = wire[key].astimezone(UTC).isoformat().replace("+00:00", "Z")
        encoded = json.dumps(wire, sort_keys=True, separators=(",", ":"))
        # Persist replay evidence on the dedicated broker plane before publishing the
        # physical dlq18.* delivery record.
        await self.broker_redis.rpush(self._DLQ_RECORD_PREFIX + dlq_name, encoded)
        self.celery.send_task(
            "bp_worker.dead_letter_record",
            args=[wire],
            queue=dlq_name,
        )

    async def replay_dead_letter(self, queue: str, index: int, *, correlation_id: str) -> JobEnvelope:
        if queue not in {value.value for value in DLQ_BY_QUEUE.values()}:
            raise ValueError("unknown DOC-18 DLQ")
        raw = await self.broker_redis.lindex(self._DLQ_RECORD_PREFIX + queue, index)
        if raw is None:
            raise IndexError("DLQ record not found")
        text = raw.decode() if isinstance(raw, bytes) else str(raw)
        record = json.loads(text)
        envelope = JobEnvelope.from_wire(record["envelope"])
        replayed = replace(
            envelope,
            correlation_id=correlation_id,
            causation_id=envelope.correlation_id,
            enqueued_at=datetime.now(UTC),
        )
        # Replay is never force-success: the normal worker will re-resolve SiteContext
        # and current ownership/lifecycle/state before any side effect.
        await self.enqueue(replayed)
        return replayed


def create_celery_broker_client(*, broker_url: str):
    """Create the producer-side Celery client used by API runtime composition.

    Queue semantics remain owned by :class:`CeleryRedisQueueAdapter`; this helper
    only avoids importing the Worker application into the API process.
    """
    try:
        from celery import Celery  # type: ignore
    except ImportError as exc:
        raise RuntimeError("Celery 5.6 runtime is required by DOC-23") from exc
    app = Celery("bp_api_producer", broker=broker_url)
    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_backend=None,
        timezone="UTC",
        enable_utc=True,
        broker_transport_options={"priority_steps": list(range(10)), "queue_order_strategy": "priority"},
    )
    return app
