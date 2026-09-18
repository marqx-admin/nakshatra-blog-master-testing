from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import secrets
from typing import Any, Callable

from bp_background_contracts import redis_keys as RedisKeys
from bp_ports.derived import DedupeState, Lease


@dataclass(slots=True)
class _Value:
    value: Any
    expires_at: datetime | None = None




def _validated_site_cache_key(key: str) -> str:
    parts = str(key).split(":")
    if len(parts) < 6 or parts[0:3] != ["bp", "v1", "s"] or parts[4] != "cache" or not parts[3]:
        raise ValueError("cache key must use the DOC-18 site-scoped cache namespace")
    return parts[3]


def _cache_prefix(site_id: str) -> str:
    return f"bp:v1:s:{str(site_id).strip().lower()}:cache:"


class InMemoryRedisControlAdapter:
    """Deterministic DOC-18 control/cache plane used by tests and local composition.

    This is deliberately not the queue broker. A different adapter instance/connection is
    required for q18 broker state.
    """

    def __init__(self, now: Callable[[], datetime] | None = None) -> None:
        self._now = now or (lambda: datetime.now(UTC))
        self._values: dict[str, _Value] = {}
        self._sets: dict[str, set[str]] = {}
        self._fence = 0
        self._lock = asyncio.Lock()

    def _purge(self, key: str) -> None:
        entry = self._values.get(key)
        if entry and entry.expires_at and entry.expires_at <= self._now():
            self._values.pop(key, None)

    @staticmethod
    def _dedupe_key(envelope) -> str:
        return RedisKeys.dedupe(envelope.site_id, envelope.job_type.value, envelope.idempotency_identity)

    async def claim_dedupe(self, envelope) -> str | None:
        key = self._dedupe_key(envelope)
        async with self._lock:
            self._purge(key)
            if key in self._values:
                return None
            token = secrets.token_urlsafe(24)
            self._values[key] = _Value(
                {"state": "CLAIMED", "token": token},
                self._now() + timedelta(seconds=60),
            )
            return token

    async def mark_enqueued(self, envelope, claim_token: str) -> bool:
        key = self._dedupe_key(envelope)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            if not entry or entry.value.get("state") != "CLAIMED" or entry.value.get("token") != claim_token:
                return False
            entry.value = {"state": "ENQUEUED"}
            expiry = self._now() + timedelta(hours=24)
            if envelope.not_before is not None:
                expiry = max(expiry, envelope.not_before.astimezone(UTC) + timedelta(hours=24))
            entry.expires_at = expiry
            return True

    async def repair_enqueued(self, envelope) -> None:
        key = self._dedupe_key(envelope)
        async with self._lock:
            expiry = self._now() + timedelta(hours=24)
            if envelope.not_before is not None:
                expiry = max(expiry, envelope.not_before.astimezone(UTC) + timedelta(hours=24))
            self._values[key] = _Value({"state": "ENQUEUED"}, expiry)

    async def mark_terminal(self, envelope, outcome: str) -> None:
        key = self._dedupe_key(envelope)
        async with self._lock:
            self._values[key] = _Value(
                {"state": "TERMINAL", "outcome": outcome, "terminal_at": self._now().isoformat()},
                self._now() + timedelta(hours=24),
            )

    async def get_dedupe_state(self, envelope) -> DedupeState | None:
        key = self._dedupe_key(envelope)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            if not entry:
                return None
            return DedupeState(entry.value["state"], entry.value.get("token"), entry.value.get("outcome"))

    async def acquire_lease(self, *, site_id: str, purpose: str, identity: str, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.lock(site_id, purpose, identity)
        async with self._lock:
            self._purge(key)
            if key in self._values:
                return None
            self._fence += 1
            token = secrets.token_urlsafe(24)
            expires = self._now() + timedelta(seconds=ttl_seconds)
            lease = Lease(token=token, fence=self._fence, expires_at=expires)
            self._values[key] = _Value({"token": token, "fence": self._fence}, expires)
            return lease

    async def renew_lease(self, *, site_id: str, purpose: str, identity: str, lease: Lease, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.lock(site_id, purpose, identity)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            if not entry or entry.value != {"token": lease.token, "fence": lease.fence}:
                return None
            expires = self._now() + timedelta(seconds=ttl_seconds)
            entry.expires_at = expires
            return Lease(token=lease.token, fence=lease.fence, expires_at=expires)

    async def release_lease(self, *, site_id: str, purpose: str, identity: str, lease: Lease) -> bool:
        key = RedisKeys.lock(site_id, purpose, identity)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            if not entry or entry.value != {"token": lease.token, "fence": lease.fence}:
                return False
            self._values.pop(key, None)
            return True

    async def acquire_global_lease(self, *, purpose: str, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.global_lock(purpose)
        async with self._lock:
            self._purge(key)
            if key in self._values:
                return None
            token = secrets.token_urlsafe(24)
            expires = self._now() + timedelta(seconds=ttl_seconds)
            lease = Lease(token=token, fence=0, expires_at=expires)
            self._values[key] = _Value({"token": token}, expires)
            return lease

    async def release_global_lease(self, *, purpose: str, lease: Lease) -> bool:
        key = RedisKeys.global_lock(purpose)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            if not entry or entry.value != {"token": lease.token}:
                return False
            self._values.pop(key, None)
            return True

    async def get_public_epoch(self, site_id: str) -> int:
        key = RedisKeys.public_epoch(site_id)
        async with self._lock:
            self._purge(key)
            return int(self._values.get(key, _Value(0)).value)

    async def increment_public_epoch(self, site_id: str) -> int:
        key = RedisKeys.public_epoch(site_id)
        async with self._lock:
            current = int(self._values.get(key, _Value(0)).value) + 1
            self._values[key] = _Value(current)
            return current

    async def track_dependency(self, *, site_id: str, dep_type: str, dep_id: str, cache_key: str) -> None:
        cache_site = _validated_site_cache_key(cache_key)
        if cache_site != str(site_id).strip().lower():
            raise ValueError("cross-site dependency/cache association is prohibited")
        key = RedisKeys.dependency_set(site_id, dep_type, dep_id)
        async with self._lock:
            self._sets.setdefault(key, set()).add(cache_key)
            self._values[key] = _Value(True, self._now() + timedelta(seconds=900))

    async def invalidate_dependencies(self, site_id: str, dependencies: tuple[tuple[str, str], ...]) -> int:
        removed: set[str] = set()
        async with self._lock:
            for dep_type, dep_id in dependencies:
                dep_key = RedisKeys.dependency_set(site_id, dep_type, dep_id)
                self._purge(dep_key)
                if dep_key not in self._values:
                    self._sets.pop(dep_key, None)
                    continue
                for cache_key in self._sets.pop(dep_key, set()):
                    if not cache_key.startswith(_cache_prefix(site_id)):
                        continue
                    self._values.pop(cache_key, None)
                    removed.add(cache_key)
                self._values.pop(dep_key, None)
        return len(removed)

    async def set_search_status(self, site_id: str, state: str, *, active_generation: str | None = None, message_code: str | None = None) -> None:
        if state not in {"READY", "REINDEXING", "DEGRADED"}:
            raise ValueError("invalid DOC-16 search status")
        now = self._now().isoformat()
        async with self._lock:
            value = {"state": state, "updated_at": now}
            previous = self._values.get(RedisKeys.search_status(site_id))
            if previous is not None:
                value.update({k: v for k, v in previous.value.items() if k in {"active_generation", "reindex_started_at", "last_indexed_at"}})
            if state == "REINDEXING":
                value["reindex_started_at"] = now
            if state == "READY":
                value["last_indexed_at"] = now
            if active_generation is not None:
                value["active_generation"] = active_generation
            if message_code is not None:
                value["message_code"] = message_code
            elif "message_code" in value:
                value.pop("message_code", None)
            self._values[RedisKeys.search_status(site_id)] = _Value(value)

    async def get_search_status(self, site_id: str) -> dict[str, Any] | None:
        async with self._lock:
            entry = self._values.get(RedisKeys.search_status(site_id))
            return None if entry is None else dict(entry.value)

    async def mark_sitemap_dirty(self, site_id: str) -> int:
        key = RedisKeys.sitemap_desired(site_id)
        async with self._lock:
            current = int(self._values.get(key, _Value(0)).value) + 1
            self._values[key] = _Value(current)
            return current

    async def sitemap_sequence(self, site_id: str) -> tuple[int, int]:
        async with self._lock:
            desired = int(self._values.get(RedisKeys.sitemap_desired(site_id), _Value(0)).value)
            built = int(self._values.get(RedisKeys.sitemap_built(site_id), _Value(0)).value)
            return desired, built

    async def mark_sitemap_built(self, site_id: str, sequence: int) -> None:
        async with self._lock:
            current = int(self._values.get(RedisKeys.sitemap_built(site_id), _Value(0)).value)
            if sequence > current:
                self._values[RedisKeys.sitemap_built(site_id)] = _Value(sequence)

    # Optional cache helpers; namespaces/TTLs remain DOC-18 exact.
    async def cache_set(self, key: str, value: Any, ttl_seconds: int) -> None:
        _validated_site_cache_key(key)
        if ttl_seconds not in {300, 600, 900}:
            raise ValueError("unsupported DOC-18 cache TTL")
        async with self._lock:
            self._values[key] = _Value(value, self._now() + timedelta(seconds=ttl_seconds))

    async def cache_get(self, key: str) -> Any | None:
        _validated_site_cache_key(key)
        async with self._lock:
            self._purge(key)
            entry = self._values.get(key)
            return None if entry is None else entry.value


class RedisControlAdapter:
    """Production-shaped adapter over an injected async Redis client.

    No broker APIs are present here, preventing accidental use of control Redis as Celery broker.
    Lua compare-and-set is used where stale tokens must not mutate newer claims/leases.
    """

    _CAS_CLAIM_TO_ENQUEUED = """
local v = redis.call('GET', KEYS[1])
if not v then return 0 end
if v ~= 'CLAIMED:' .. ARGV[1] then return 0 end
redis.call('SET', KEYS[1], 'ENQUEUED', 'EX', ARGV[2])
return 1
"""
    _COMPARE_DELETE = """
local v = redis.call('GET', KEYS[1])
if v ~= ARGV[1] then return 0 end
return redis.call('DEL', KEYS[1])
"""

    def __init__(self, redis_client) -> None:
        self.redis = redis_client

    @staticmethod
    def _dedupe_key(envelope) -> str:
        return RedisKeys.dedupe(envelope.site_id, envelope.job_type.value, envelope.idempotency_identity)

    async def claim_dedupe(self, envelope) -> str | None:
        token = secrets.token_urlsafe(24)
        ok = await self.redis.set(self._dedupe_key(envelope), f"CLAIMED:{token}", ex=60, nx=True)
        return token if ok else None

    async def mark_enqueued(self, envelope, claim_token: str) -> bool:
        ttl = 86400
        if envelope.not_before is not None:
            ttl = max(ttl, int((envelope.not_before.astimezone(UTC) + timedelta(hours=24) - datetime.now(UTC)).total_seconds()))
        result = await self.redis.eval(self._CAS_CLAIM_TO_ENQUEUED, 1, self._dedupe_key(envelope), claim_token, ttl)
        return bool(result)

    async def repair_enqueued(self, envelope) -> None:
        ttl = 86400
        if envelope.not_before is not None:
            ttl = max(ttl, int((envelope.not_before.astimezone(UTC) + timedelta(hours=24) - datetime.now(UTC)).total_seconds()))
        await self.redis.set(self._dedupe_key(envelope), "ENQUEUED", ex=ttl)

    async def mark_terminal(self, envelope, outcome: str) -> None:
        await self.redis.set(self._dedupe_key(envelope), f"TERMINAL:{outcome}", ex=86400)

    async def get_dedupe_state(self, envelope) -> DedupeState | None:
        raw = await self.redis.get(self._dedupe_key(envelope))
        if raw is None:
            return None
        if isinstance(raw, bytes):
            raw = raw.decode()
        if raw.startswith("CLAIMED:"):
            return DedupeState("CLAIMED", raw.split(":", 1)[1])
        if raw.startswith("TERMINAL:"):
            return DedupeState("TERMINAL", outcome=raw.split(":", 1)[1])
        return DedupeState(str(raw))

    async def acquire_lease(self, *, site_id: str, purpose: str, identity: str, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.lock(site_id, purpose, identity)
        fence = int(await self.redis.incr(RedisKeys.lock(site_id, purpose + ":fence", identity)))
        token = secrets.token_urlsafe(24)
        ok = await self.redis.set(key, f"{fence}:{token}", ex=ttl_seconds, nx=True)
        if not ok:
            return None
        return Lease(token=token, fence=fence, expires_at=datetime.now(UTC) + timedelta(seconds=ttl_seconds))

    async def renew_lease(self, *, site_id: str, purpose: str, identity: str, lease: Lease, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.lock(site_id, purpose, identity)
        expected = f"{lease.fence}:{lease.token}"
        script = """if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end redis.call('EXPIRE', KEYS[1], ARGV[2]); return 1"""
        ok = await self.redis.eval(script, 1, key, expected, ttl_seconds)
        if not ok:
            return None
        return Lease(lease.token, lease.fence, datetime.now(UTC) + timedelta(seconds=ttl_seconds))

    async def release_lease(self, *, site_id: str, purpose: str, identity: str, lease: Lease) -> bool:
        key = RedisKeys.lock(site_id, purpose, identity)
        return bool(await self.redis.eval(self._COMPARE_DELETE, 1, key, f"{lease.fence}:{lease.token}"))

    async def acquire_global_lease(self, *, purpose: str, ttl_seconds: int) -> Lease | None:
        key = RedisKeys.global_lock(purpose)
        token = secrets.token_urlsafe(24)
        ok = await self.redis.set(key, token, ex=ttl_seconds, nx=True)
        if not ok:
            return None
        return Lease(token=token, fence=0, expires_at=datetime.now(UTC) + timedelta(seconds=ttl_seconds))

    async def release_global_lease(self, *, purpose: str, lease: Lease) -> bool:
        return bool(await self.redis.eval(self._COMPARE_DELETE, 1, RedisKeys.global_lock(purpose), lease.token))

    async def get_public_epoch(self, site_id: str) -> int:
        raw = await self.redis.get(RedisKeys.public_epoch(site_id))
        return int(raw or 0)

    async def increment_public_epoch(self, site_id: str) -> int:
        return int(await self.redis.incr(RedisKeys.public_epoch(site_id)))

    async def track_dependency(self, *, site_id: str, dep_type: str, dep_id: str, cache_key: str) -> None:
        cache_site = _validated_site_cache_key(cache_key)
        if cache_site != str(site_id).strip().lower():
            raise ValueError("cross-site dependency/cache association is prohibited")
        key = RedisKeys.dependency_set(site_id, dep_type, dep_id)
        pipe = self.redis.pipeline(transaction=True)
        pipe.sadd(key, cache_key)
        pipe.expire(key, 900)
        await pipe.execute()

    async def invalidate_dependencies(self, site_id: str, dependencies: tuple[tuple[str, str], ...]) -> int:
        cache_keys: set[str] = set()
        dep_keys = [RedisKeys.dependency_set(site_id, dep_type, dep_id) for dep_type, dep_id in dependencies]
        for key in dep_keys:
            members = await self.redis.smembers(key)
            for member in members:
                member_key = member.decode() if isinstance(member, bytes) else str(member)
                if member_key.startswith(_cache_prefix(site_id)):
                    cache_keys.add(member_key)
        pipe = self.redis.pipeline(transaction=True)
        for key in cache_keys:
            pipe.delete(key)
        for key in dep_keys:
            pipe.delete(key)
        if cache_keys or dep_keys:
            await pipe.execute()
        return len(cache_keys)

    async def cache_set(self, key: str, value: Any, ttl_seconds: int) -> None:
        _validated_site_cache_key(key)
        if ttl_seconds not in {300, 600, 900}:
            raise ValueError("unsupported DOC-18 cache TTL")
        await self.redis.set(key, value, ex=ttl_seconds)

    async def cache_get(self, key: str) -> Any | None:
        _validated_site_cache_key(key)
        return await self.redis.get(key)

    async def set_search_status(self, site_id: str, state: str, *, active_generation: str | None = None, message_code: str | None = None) -> None:
        if state not in {"READY", "REINDEXING", "DEGRADED"}:
            raise ValueError("invalid DOC-16 search status")
        now = datetime.now(UTC).isoformat()
        mapping = {"state": state, "updated_at": now, "message_code": message_code or ""}
        if active_generation is not None:
            mapping["active_generation"] = active_generation
        if state == "REINDEXING":
            mapping["reindex_started_at"] = now
        if state == "READY":
            mapping["last_indexed_at"] = now
        await self.redis.hset(RedisKeys.search_status(site_id), mapping=mapping)

    async def get_search_status(self, site_id: str) -> dict[str, Any] | None:
        raw = await self.redis.hgetall(RedisKeys.search_status(site_id))
        if not raw:
            return None
        out = {}
        for k, v in raw.items():
            k = k.decode() if isinstance(k, bytes) else str(k)
            v = v.decode() if isinstance(v, bytes) else str(v)
            if v:
                out[k] = v
        return out

    async def mark_sitemap_dirty(self, site_id: str) -> int:
        return int(await self.redis.incr(RedisKeys.sitemap_desired(site_id)))

    async def sitemap_sequence(self, site_id: str) -> tuple[int, int]:
        desired, built = await self.redis.mget(RedisKeys.sitemap_desired(site_id), RedisKeys.sitemap_built(site_id))
        return int(desired or 0), int(built or 0)

    async def mark_sitemap_built(self, site_id: str, sequence: int) -> None:
        key = RedisKeys.sitemap_built(site_id)
        script = """local c=tonumber(redis.call('GET',KEYS[1]) or '0'); local n=tonumber(ARGV[1]); if n>c then redis.call('SET',KEYS[1],n) end; return 1"""
        await self.redis.eval(script, 1, key, sequence)
