from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

from bp_ports import RateLimitDecision


@dataclass(frozen=True, slots=True)
class LimitPolicy:
    limit: int
    window_seconds: int


class InMemorySecurityThrottle:
    """Deterministic process-local quota/failure counter for development/tests.

    Production must use a shared adapter. The counter uses fixed windows so the
    reset value is deterministic and never grants more than the configured
    canonical ceiling.
    """

    def __init__(self, policies: dict[str, LimitPolicy]) -> None:
        self.policies = dict(policies)
        self._counts: dict[tuple[str, str, int], int] = {}
        self._lock = asyncio.Lock()

    def _bucket(self, class_id: str, actor_key: str, now: datetime) -> tuple[tuple[str, str, int], LimitPolicy, int]:
        policy = self.policies[class_id]
        epoch = int(now.timestamp())
        bucket = epoch // policy.window_seconds
        reset = policy.window_seconds - (epoch % policy.window_seconds)
        return (class_id, actor_key, bucket), policy, reset

    async def check(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        now = datetime.now(UTC)
        async with self._lock:
            key, policy, reset = self._bucket(class_id, actor_key, now)
            count = self._counts.get(key, 0) + 1
            self._counts[key] = count
        allowed = count <= policy.limit
        remaining = max(0, policy.limit - count)
        return RateLimitDecision(allowed, policy.limit, remaining, reset, reset if not allowed else None)

    async def peek(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        now = datetime.now(UTC)
        async with self._lock:
            key, policy, reset = self._bucket(class_id, actor_key, now)
            count = self._counts.get(key, 0)
        allowed = count < policy.limit
        remaining = max(0, policy.limit - count)
        return RateLimitDecision(allowed, policy.limit, remaining, reset, reset if not allowed else None)

    async def record_failure(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        return await self.check(class_id=class_id, actor_key=actor_key, request_id=request_id)


class DynamoSecurityThrottle:
    """Shared fixed-window quota/failure counter backed by a DynamoDB-compatible table.

    The table is an external DOC-19 security-state deployment resource. This
    adapter never changes DOC-08 PostgreSQL schema. It requires atomic
    UpdateItem support and server-side TTL on `ttl_epoch`.
    """

    def __init__(self, *, table: Any, policies: dict[str, LimitPolicy], namespace: str = "SEC#THROTTLE") -> None:
        self.table = table
        self.policies = dict(policies)
        self.namespace = namespace

    def _identity(self, class_id: str, actor_key: str, now: datetime) -> tuple[dict[str, str], LimitPolicy, int, int]:
        policy = self.policies[class_id]
        epoch = int(now.timestamp())
        bucket = epoch // policy.window_seconds
        reset = policy.window_seconds - (epoch % policy.window_seconds)
        key = {"pk": f"{self.namespace}#{class_id}#{actor_key}#{bucket}", "sk": "STATE"}
        return key, policy, reset, epoch + reset + 60

    async def check(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        now = datetime.now(UTC)
        key, policy, reset, ttl = self._identity(class_id, actor_key, now)
        out = await asyncio.to_thread(
            self.table.update_item,
            Key=key,
            UpdateExpression="ADD #count :one SET ttl_epoch=:ttl",
            ExpressionAttributeNames={"#count": "count"},
            ExpressionAttributeValues={":one": 1, ":ttl": ttl},
            ReturnValues="ALL_NEW",
        )
        count = int(out.get("Attributes", {}).get("count", 1))
        allowed = count <= policy.limit
        return RateLimitDecision(
            allowed,
            policy.limit,
            max(0, policy.limit - count),
            reset,
            reset if not allowed else None,
        )

    async def peek(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        now = datetime.now(UTC)
        key, policy, reset, _ = self._identity(class_id, actor_key, now)
        out = await asyncio.to_thread(self.table.get_item, Key=key, ConsistentRead=True)
        count = int(out.get("Item", {}).get("count", 0))
        allowed = count < policy.limit
        return RateLimitDecision(allowed, policy.limit, max(0, policy.limit - count), reset, reset if not allowed else None)

    async def record_failure(self, *, class_id: str, actor_key: str, request_id: str) -> RateLimitDecision:
        return await self.check(class_id=class_id, actor_key=actor_key, request_id=request_id)
