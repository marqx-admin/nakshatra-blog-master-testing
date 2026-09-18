from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .context import SiteContext


@dataclass(frozen=True, slots=True)
class SiteEffectEnvelope:
    """Site-retaining handoff from application work to derived-system adapters.

    The envelope deliberately contains no broker, queue, Redis, media, search, or
    worker implementation semantics. CHAT05 owns those mappings.
    """

    effect_type: str
    context: SiteContext
    entity_type: str
    entity_id: str
    correlation_id: str
    source_version: str | int | None = None
    payload: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.effect_type or not self.entity_type or not self.entity_id:
            raise ValueError("effect identity is required")
        if not self.correlation_id:
            raise ValueError("correlation_id is required")
