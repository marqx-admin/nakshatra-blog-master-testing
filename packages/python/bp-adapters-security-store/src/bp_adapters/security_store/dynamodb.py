from __future__ import annotations

"""DynamoDB-compatible shared security-state adapter.

The adapter owns only DOC-19 logical credential/session/token/MFA/step-up state.
It never creates or mutates DOC-08 PostgreSQL schema. A concrete table and its
admin lookup GSI are deployment resources owned by DOC-24/CHAT11.
"""

import asyncio
from dataclasses import asdict
from datetime import UTC, datetime
from typing import Any

from bp_domain.security import CredentialRecord, MfaRecord, SessionRecord, StepUpLevel, StepUpRecord, TokenRecord


class DynamoSecurityStateStore:
    def __init__(
        self,
        *,
        table: Any,
        namespace: str = "SEC",
        admin_index_name: str = "gsi_admin",
    ) -> None:
        self.table = table
        self.namespace = namespace
        self.admin_index_name = admin_index_name

    def _key(self, kind: str, key: str) -> dict[str, str]:
        return {"pk": f"{self.namespace}#{kind}#{key}", "sk": "STATE"}

    def _item(self, kind: str, key: str, record: Any, *, ttl: datetime | None = None) -> dict[str, Any]:
        item = self._key(kind, key)
        item.update(_serialize(record))
        admin_id = item.get("admin_id")
        if admin_id:
            item["gsi_admin_pk"] = f"{self.namespace}#ADMIN#{admin_id}"
            item["gsi_admin_sk"] = f"{kind}#{key}"
        if ttl is not None:
            item["ttl_epoch"] = int(ttl.timestamp())
        return item

    async def put_credential(self, record: CredentialRecord) -> None:
        item = self._item("CREDENTIAL", record.admin_id, record)
        await asyncio.to_thread(self.table.put_item, Item=item)

    async def get_credential(self, admin_id: str) -> CredentialRecord | None:
        out = await asyncio.to_thread(
            self.table.get_item,
            Key=self._key("CREDENTIAL", admin_id),
            ConsistentRead=True,
        )
        raw = out.get("Item")
        return _credential(raw) if raw else None

    async def delete_credential(self, admin_id: str) -> None:
        await asyncio.to_thread(self.table.delete_item, Key=self._key("CREDENTIAL", admin_id))

    async def put_session(self, record: SessionRecord) -> None:
        item = self._item("SESSION", record.session_id_hash, record, ttl=record.absolute_expires_at)
        await asyncio.to_thread(self.table.put_item, Item=item)

    async def get_session(self, session_id_hash: str) -> SessionRecord | None:
        out = await asyncio.to_thread(
            self.table.get_item,
            Key=self._key("SESSION", session_id_hash),
            ConsistentRead=True,
        )
        raw = out.get("Item")
        return _session(raw) if raw else None

    async def touch_session(self, session_id_hash: str, *, last_seen_at: datetime, idle_expires_at: datetime) -> None:
        await asyncio.to_thread(
            self.table.update_item,
            Key=self._key("SESSION", session_id_hash),
            UpdateExpression="SET last_seen_at=:seen, idle_expires_at=:idle",
            ConditionExpression="attribute_exists(pk) AND attribute_not_exists(revoked_at)",
            ExpressionAttributeValues={":seen": last_seen_at.isoformat(), ":idle": idle_expires_at.isoformat()},
        )

    async def revoke_session(self, session_id_hash: str, reason: str) -> None:
        now = datetime.now(UTC).isoformat()
        try:
            await asyncio.to_thread(
                self.table.update_item,
                Key=self._key("SESSION", session_id_hash),
                UpdateExpression="SET revoked_at=:now, revoke_reason=:reason",
                ConditionExpression="attribute_exists(pk) AND attribute_not_exists(revoked_at)",
                ExpressionAttributeValues={":now": now, ":reason": reason},
            )
        except Exception as exc:
            if _is_conditional_failure(exc):
                return
            raise

    async def revoke_all_sessions(self, admin_id: str, reason: str, except_hash: str | None = None) -> None:
        items = await self._query_admin(admin_id, prefix="SESSION#")
        for item in items:
            session_hash = str(item.get("session_id_hash", ""))
            if session_hash and session_hash != except_hash:
                await self.revoke_session(session_hash, reason)

    async def put_token(self, record: TokenRecord) -> None:
        item = self._item(f"TOKEN#{record.purpose}", record.token_hash, record, ttl=record.expires_at)
        await asyncio.to_thread(self.table.put_item, Item=item)

    async def get_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None:
        out = await asyncio.to_thread(
            self.table.get_item,
            Key=self._key(f"TOKEN#{purpose}", token_hash),
            ConsistentRead=True,
        )
        raw = out.get("Item")
        if not raw or raw.get("consumed_at"):
            return None
        expires = datetime.fromisoformat(raw["expires_at"])
        if now >= expires:
            return None
        return _token(raw)

    async def consume_token(self, token_hash: str, purpose: str, now: datetime) -> TokenRecord | None:
        key = self._key(f"TOKEN#{purpose}", token_hash)
        try:
            out = await asyncio.to_thread(
                self.table.update_item,
                Key=key,
                UpdateExpression="SET consumed_at=:now",
                ConditionExpression="attribute_exists(pk) AND attribute_not_exists(consumed_at) AND expires_epoch > :epoch",
                ExpressionAttributeValues={":now": now.isoformat(), ":epoch": int(now.timestamp())},
                ReturnValues="ALL_OLD",
            )
        except Exception as exc:
            if _is_conditional_failure(exc):
                return None
            raise
        attrs = out.get("Attributes")
        return _token(attrs) if attrs else None

    async def transition_token(
        self, token_hash: str, purpose: str, *, from_phase: str, to_phase: str, now: datetime
    ) -> TokenRecord | None:
        key = self._key(f"TOKEN#{purpose}", token_hash)
        try:
            out = await asyncio.to_thread(
                self.table.update_item,
                Key=key,
                UpdateExpression="SET metadata.#phase=:to",
                ConditionExpression=(
                    "attribute_exists(pk) AND attribute_not_exists(consumed_at) "
                    "AND expires_epoch > :epoch AND (metadata.#phase = :from OR "
                    "(attribute_not_exists(metadata.#phase) AND :from = :issued))"
                ),
                ExpressionAttributeNames={"#phase": "phase"},
                ExpressionAttributeValues={
                    ":to": to_phase,
                    ":from": from_phase,
                    ":issued": "ISSUED",
                    ":epoch": int(now.timestamp()),
                },
                ReturnValues="ALL_NEW",
            )
        except Exception as exc:
            if _is_conditional_failure(exc):
                return None
            raise
        attrs = out.get("Attributes")
        return _token(attrs) if attrs else None

    async def invalidate_tokens(self, admin_id: str, purpose: str) -> None:
        prefix = f"TOKEN#{purpose}#"
        items = await self._query_admin(admin_id, prefix=prefix)
        now = datetime.now(UTC).isoformat()
        for item in items:
            token_hash = item.get("token_hash")
            if not token_hash:
                continue
            try:
                await asyncio.to_thread(
                    self.table.update_item,
                    Key=self._key(f"TOKEN#{purpose}", token_hash),
                    UpdateExpression="SET consumed_at=:now",
                    ConditionExpression="attribute_not_exists(consumed_at)",
                    ExpressionAttributeValues={":now": now},
                )
            except Exception as exc:
                if not _is_conditional_failure(exc):
                    raise

    async def get_mfa(self, admin_id: str) -> MfaRecord | None:
        out = await asyncio.to_thread(
            self.table.get_item,
            Key=self._key("MFA", admin_id),
            ConsistentRead=True,
        )
        raw = out.get("Item")
        return _mfa(raw) if raw else None

    async def put_mfa(self, record: MfaRecord) -> None:
        item = self._item("MFA", record.admin_id, record)
        await asyncio.to_thread(self.table.put_item, Item=item)

    async def advance_mfa_step(self, admin_id: str, accepted_step: int) -> bool:
        try:
            await asyncio.to_thread(
                self.table.update_item,
                Key=self._key("MFA", admin_id),
                UpdateExpression="SET last_accepted_step=:step",
                ConditionExpression=(
                    "attribute_exists(pk) AND (attribute_not_exists(last_accepted_step) OR last_accepted_step < :step)"
                ),
                ExpressionAttributeValues={":step": accepted_step},
            )
            return True
        except Exception as exc:
            if _is_conditional_failure(exc):
                return False
            raise

    async def consume_recovery_hash(self, admin_id: str, recovery_hash: str) -> bool:
        key = self._key("MFA", admin_id)
        # Recovery hashes are serialized as an ordered list. Use a full-list CAS
        # so concurrent recovery attempts cannot consume the same code twice.
        out = await asyncio.to_thread(self.table.get_item, Key=key, ConsistentRead=True)
        item = out.get("Item")
        if not item:
            return False
        expected = list(item.get("recovery_hashes") or [])
        if recovery_hash not in expected:
            return False
        updated = [value for value in expected if value != recovery_hash]
        try:
            await asyncio.to_thread(
                self.table.update_item,
                Key=key,
                UpdateExpression="SET recovery_hashes=:updated",
                ConditionExpression="recovery_hashes=:expected",
                ExpressionAttributeValues={":updated": updated, ":expected": expected},
            )
            return True
        except Exception as exc:
            if _is_conditional_failure(exc):
                return False
            raise

    async def put_step_up(self, record: StepUpRecord) -> None:
        item = self._item("STEPUP", record.proof_id_hash, record, ttl=record.expires_at)
        await asyncio.to_thread(self.table.put_item, Item=item)

    async def get_step_up(self, session_id_hash: str, level: str, now: datetime) -> StepUpRecord | None:
        # Step-up rows are indexed by admin for revocation and carry session hash.
        # The caller already knows the session but not necessarily the admin ID, so
        # query-by-session is modeled through an explicit table scan fallback. The
        # production table may replace this with a dedicated session GSI without
        # changing the port.
        allowed = {"L1", "L2"} if level == "L1" else {level}
        candidates = []
        kwargs: dict[str, Any] = {
            "FilterExpression": (
                "begins_with(pk, :prefix) AND session_id_hash = :session "
                "AND attribute_not_exists(revoked_at)"
            ),
            "ExpressionAttributeValues": {
                ":prefix": f"{self.namespace}#STEPUP#",
                ":session": session_id_hash,
            },
        }
        while True:
            out = await asyncio.to_thread(self.table.scan, **kwargs)
            for raw in out.get("Items", []):
                if raw.get("level") in allowed:
                    record = _stepup(raw)
                    if now < record.expires_at:
                        candidates.append(record)
            last_key = out.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
        return max(candidates, key=lambda item: item.issued_at) if candidates else None

    async def revoke_step_ups(self, admin_id: str) -> None:
        items = await self._query_admin(admin_id, prefix="STEPUP#")
        now = datetime.now(UTC).isoformat()
        for item in items:
            proof_hash = item.get("proof_id_hash")
            if not proof_hash:
                continue
            try:
                await asyncio.to_thread(
                    self.table.update_item,
                    Key=self._key("STEPUP", proof_hash),
                    UpdateExpression="SET revoked_at=:now",
                    ConditionExpression="attribute_not_exists(revoked_at)",
                    ExpressionAttributeValues={":now": now},
                )
            except Exception as exc:
                if not _is_conditional_failure(exc):
                    raise

    async def _query_admin(self, admin_id: str, *, prefix: str) -> list[dict[str, Any]]:
        kwargs: dict[str, Any] = {
            "IndexName": self.admin_index_name,
            "KeyConditionExpression": "gsi_admin_pk = :admin AND begins_with(gsi_admin_sk, :prefix)",
            "ExpressionAttributeValues": {
                ":admin": f"{self.namespace}#ADMIN#{admin_id}",
                ":prefix": prefix,
            },
        }
        items: list[dict[str, Any]] = []
        while True:
            out = await asyncio.to_thread(self.table.query, **kwargs)
            items.extend(out.get("Items", []))
            key = out.get("LastEvaluatedKey")
            if not key:
                break
            kwargs["ExclusiveStartKey"] = key
        return items


def _serialize(obj: Any) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in asdict(obj).items():
        if isinstance(value, datetime):
            out[key] = value.isoformat()
        elif isinstance(value, bytes):
            out[key] = value.hex()
        elif isinstance(value, set):
            out[key] = sorted(value)
        elif value is not None:
            out[key] = value.value if hasattr(value, "value") else value
    expires = out.get("expires_at")
    if expires:
        out["expires_epoch"] = int(datetime.fromisoformat(expires).timestamp())
    return out


def _credential(raw: dict[str, Any]) -> CredentialRecord:
    data = {key: value for key, value in raw.items() if key in CredentialRecord.__dataclass_fields__}
    if data.get("changed_at"):
        data["changed_at"] = datetime.fromisoformat(data["changed_at"])
    data["params"] = {str(key): int(value) for key, value in dict(data.get("params") or {}).items()}
    return CredentialRecord(**data)


def _session(raw: dict[str, Any]) -> SessionRecord:
    data = {key: value for key, value in raw.items() if key in SessionRecord.__dataclass_fields__}
    for key in ("created_at", "last_seen_at", "idle_expires_at", "absolute_expires_at", "mfa_verified_at", "revoked_at"):
        if data.get(key):
            data[key] = datetime.fromisoformat(data[key])
    return SessionRecord(**data)


def _token(raw: dict[str, Any]) -> TokenRecord:
    data = {key: value for key, value in raw.items() if key in TokenRecord.__dataclass_fields__}
    for key in ("issued_at", "expires_at", "consumed_at"):
        if data.get(key):
            data[key] = datetime.fromisoformat(data[key])
    data.setdefault("metadata", {})
    return TokenRecord(**data)


def _mfa(raw: dict[str, Any]) -> MfaRecord:
    data = {key: value for key, value in raw.items() if key in MfaRecord.__dataclass_fields__}
    if isinstance(data.get("encrypted_secret"), str):
        data["encrypted_secret"] = bytes.fromhex(data["encrypted_secret"])
    if data.get("enabled_at"):
        data["enabled_at"] = datetime.fromisoformat(data["enabled_at"])
    data["recovery_hashes"] = set(data.get("recovery_hashes") or [])
    return MfaRecord(**data)


def _stepup(raw: dict[str, Any]) -> StepUpRecord:
    data = {key: value for key, value in raw.items() if key in StepUpRecord.__dataclass_fields__}
    data["level"] = StepUpLevel(data["level"])
    for key in ("issued_at", "expires_at", "revoked_at"):
        if data.get(key):
            data[key] = datetime.fromisoformat(data[key])
    return StepUpRecord(**data)


def _is_conditional_failure(exc: Exception) -> bool:
    if exc.__class__.__name__ == "ConditionalCheckFailedException":
        return True
    response = getattr(exc, "response", None)
    if isinstance(response, dict):
        code = response.get("Error", {}).get("Code")
        return code == "ConditionalCheckFailedException"
    return False
