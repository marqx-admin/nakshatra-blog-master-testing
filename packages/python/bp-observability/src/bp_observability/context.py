from __future__ import annotations
from contextlib import contextmanager
from contextvars import ContextVar
from dataclasses import dataclass, asdict
from typing import Iterator

@dataclass(frozen=True, slots=True)
class ObservabilityContext:
    service: str
    environment: str
    release_sha: str
    request_id: str | None = None
    correlation_id: str | None = None
    trace_id: str | None = None
    span_id: str | None = None
    scope: str | None = None
    site_key: str | None = None
    operation_id: str | None = None
    queue: str | None = None
    job_type: str | None = None

    def safe_fields(self) -> dict[str, str]:
        return {k: str(v) for k, v in asdict(self).items() if v is not None}

_CTX: ContextVar[ObservabilityContext | None] = ContextVar("bp_observability_context", default=None)

def get_context() -> ObservabilityContext | None: return _CTX.get()

@contextmanager
def bind_context(ctx: ObservabilityContext) -> Iterator[ObservabilityContext]:
    token=_CTX.set(ctx)
    try: yield ctx
    finally: _CTX.reset(token)
