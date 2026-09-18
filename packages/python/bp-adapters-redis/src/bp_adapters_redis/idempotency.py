from __future__ import annotations

"""Shared Redis implementation of RC8 request idempotency.

The key is tenant/actor/request-key scoped and stores a deterministic request
fingerprint plus the exact HTTP outcome for 24 hours.  It is intentionally on
the Redis control plane, not the Celery broker plane.
"""

import hashlib
import json
from typing import Any

from bp_domain.errors import Conflict, IdempotencyKeyReuse


_TTL_SECONDS = 24 * 60 * 60


def _canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


def _fingerprint(*, actor_admin_id: str, scope_key: str, method: str, path: str, body: Any) -> str:
    raw = _canonical({
        "actor_admin_id": actor_admin_id,
        "scope_key": scope_key,
        "method": method.upper(),
        "path": path,
        "body": body,
    })
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _redis_key(scope_key: str, actor_admin_id: str, key: str) -> str:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return f"bp:v1:s:{scope_key.lower()}:idempotency:{actor_admin_id}:{digest}"


class RedisRequestIdempotencyAdapter:
    _COMPARE_DELETE = """
local raw=redis.call('GET',KEYS[1])
if not raw then return 0 end
local obj=cjson.decode(raw)
if obj['fingerprint'] ~= ARGV[1] or obj['state'] ~= 'CLAIMED' then return 0 end
return redis.call('DEL',KEYS[1])
"""
    _STORE = """
local raw=redis.call('GET',KEYS[1])
if not raw then return 0 end
local obj=cjson.decode(raw)
if obj['fingerprint'] ~= ARGV[1] or obj['state'] ~= 'CLAIMED' then return 0 end
redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3])
return 1
"""

    def __init__(self, redis_client: Any, *, ttl_seconds: int = _TTL_SECONDS) -> None:
        self.redis = redis_client
        self.ttl_seconds = int(ttl_seconds)
        if self.ttl_seconds < _TTL_SECONDS:
            raise ValueError("RC8 idempotency replay retention must be at least 24 hours")

    async def claim_or_replay(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
    ) -> tuple[str, tuple[int, Any, dict[str, str]] | None]:
        fp = _fingerprint(
            actor_admin_id=actor_admin_id,
            scope_key=scope_key,
            method=method,
            path=path,
            body=body,
        )
        redis_key = _redis_key(scope_key, actor_admin_id, key)
        claimed = _canonical({"state": "CLAIMED", "fingerprint": fp})
        if await self.redis.set(redis_key, claimed, ex=self.ttl_seconds, nx=True):
            return "CLAIMED", None
        raw = await self.redis.get(redis_key)
        if raw is None:
            # The previous claim expired between SET-NX and GET; retry once.
            if await self.redis.set(redis_key, claimed, ex=self.ttl_seconds, nx=True):
                return "CLAIMED", None
            raw = await self.redis.get(redis_key)
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        record = json.loads(str(raw))
        if record.get("fingerprint") != fp:
            raise IdempotencyKeyReuse("idempotency key was already used for a different request")
        if record.get("state") == "COMPLETED":
            outcome = record.get("outcome") or {}
            return "REPLAY", (
                int(outcome["status"]),
                outcome.get("body"),
                {str(k): str(v) for k, v in (outcome.get("headers") or {}).items()},
            )
        raise Conflict("idempotent request is already in progress")

    async def store_outcome(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
        outcome: tuple[int, Any, dict[str, str]],
    ) -> None:
        fp = _fingerprint(
            actor_admin_id=actor_admin_id,
            scope_key=scope_key,
            method=method,
            path=path,
            body=body,
        )
        redis_key = _redis_key(scope_key, actor_admin_id, key)
        status, response_body, headers = outcome
        completed = _canonical({
            "state": "COMPLETED",
            "fingerprint": fp,
            "outcome": {
                "status": int(status),
                "body": response_body,
                "headers": dict(headers),
            },
        })
        stored = await self.redis.eval(self._STORE, 1, redis_key, fp, completed, self.ttl_seconds)
        if not stored:
            raise Conflict("idempotency claim was lost before outcome storage")

    async def abandon(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
    ) -> None:
        fp = _fingerprint(
            actor_admin_id=actor_admin_id,
            scope_key=scope_key,
            method=method,
            path=path,
            body=body,
        )
        await self.redis.eval(
            self._COMPARE_DELETE,
            1,
            _redis_key(scope_key, actor_admin_id, key),
            fp,
        )
