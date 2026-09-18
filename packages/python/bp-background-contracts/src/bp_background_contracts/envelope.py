from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from .job_types import JobType, QUEUE_BY_JOB
from .payloads import validate_job_payload

_ALLOWED_ENTITY_TYPES = {"POST", "MEDIA", "CATEGORY", "TAG", "AUTHOR", "SITE", "NONE"}


@dataclass(frozen=True, slots=True)
class JobEnvelope:
    job_type: JobType
    site_id: str
    trigger: str
    idempotency_identity: str
    correlation_id: str
    payload: dict[str, Any]
    schema_version: int = 1
    entity_type: str = "NONE"
    entity_id: str | None = None
    source_version: str | int | None = None
    source_fingerprint: str | None = None
    not_before: datetime | None = None
    causation_id: str | None = None
    enqueued_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def __post_init__(self) -> None:
        if self.schema_version != 1:
            raise ValueError("unknown DOC-18 envelope major version")
        if not isinstance(self.job_type, JobType):
            object.__setattr__(self, "job_type", JobType(self.job_type))
        if not str(self.site_id).strip():
            raise ValueError("site_id is required")
        if self.entity_type not in _ALLOWED_ENTITY_TYPES:
            raise ValueError("entity_type is outside DOC-18 envelope contract")
        if self.entity_id is not None and self.entity_type == "NONE":
            raise ValueError("entity_id requires an entity_type")
        if not self.trigger or not self.idempotency_identity or not self.correlation_id:
            raise ValueError("trigger, idempotency_identity and correlation_id are required")
        if len(self.correlation_id) > 128:
            raise ValueError("correlation_id exceeds DOC-18 maximum")
        if self.not_before is not None and self.not_before.tzinfo is None:
            raise ValueError("not_before must be timezone-aware UTC-compatible")
        if not isinstance(self.payload, dict):
            raise ValueError("payload must be an object")
        validate_job_payload(self.job_type, self.payload)
        if self.source_fingerprint is not None and "source_fingerprint" in self.payload:
            if str(self.source_fingerprint) != str(self.payload["source_fingerprint"]):
                raise ValueError("envelope source_fingerprint must match payload source_fingerprint")

    @property
    def queue(self):
        return QUEUE_BY_JOB[self.job_type]

    def to_wire(self) -> dict[str, Any]:
        def dt(value: datetime | None):
            return None if value is None else value.astimezone(UTC).isoformat().replace("+00:00", "Z")

        result = {
            "schema_version": self.schema_version,
            "job_type": self.job_type.value,
            "site_id": self.site_id,
            "entity_type": self.entity_type,
            "trigger": self.trigger,
            "idempotency_identity": self.idempotency_identity,
            "correlation_id": self.correlation_id,
            "enqueued_at": dt(self.enqueued_at),
            "payload": self.payload,
        }
        for key, value in {
            "entity_id": self.entity_id,
            "source_version": self.source_version,
            "source_fingerprint": self.source_fingerprint,
            "not_before": dt(self.not_before),
            "causation_id": self.causation_id,
        }.items():
            if value is not None:
                result[key] = value
        return result

    @classmethod
    def from_wire(cls, raw: dict[str, Any]) -> "JobEnvelope":
        allowed = {
            "schema_version", "job_type", "site_id", "entity_type", "entity_id", "source_version",
            "source_fingerprint", "not_before", "trigger", "idempotency_identity", "correlation_id",
            "causation_id", "enqueued_at", "payload",
        }
        extra = set(raw) - allowed
        if extra:
            raise ValueError(f"unknown job envelope properties: {sorted(extra)}")

        def parse_dt(value: Any) -> datetime | None:
            if value is None or isinstance(value, datetime):
                return value
            return datetime.fromisoformat(str(value).replace("Z", "+00:00"))

        required = {"schema_version", "job_type", "site_id", "trigger", "idempotency_identity", "correlation_id", "enqueued_at", "payload"}
        missing = required - set(raw)
        if missing:
            raise ValueError(f"missing job envelope properties: {sorted(missing)}")
        return cls(
            schema_version=int(raw["schema_version"]),
            job_type=JobType(raw["job_type"]),
            site_id=str(raw["site_id"]),
            entity_type=str(raw.get("entity_type", "NONE")),
            entity_id=raw.get("entity_id"),
            source_version=raw.get("source_version"),
            source_fingerprint=raw.get("source_fingerprint"),
            not_before=parse_dt(raw.get("not_before")),
            trigger=str(raw["trigger"]),
            idempotency_identity=str(raw["idempotency_identity"]),
            correlation_id=str(raw["correlation_id"]),
            causation_id=raw.get("causation_id"),
            enqueued_at=parse_dt(raw["enqueued_at"]) or datetime.now(UTC),
            payload=dict(raw["payload"]),
        )
