from __future__ import annotations
from dataclasses import dataclass, field
from enum import StrEnum

class HealthState(StrEnum):
    OK="ok"; DEGRADED="degraded"; FAIL="fail"

@dataclass(frozen=True, slots=True)
class ComponentHealth:
    name: str
    state: HealthState
    critical: bool = True

@dataclass(frozen=True, slots=True)
class HealthReport:
    live: bool
    ready: bool
    components: tuple[ComponentHealth, ...] = field(default_factory=tuple)
    def safe_dict(self) -> dict[str, object]:
        return {"live":self.live,"ready":self.ready,"components":[{"name":x.name,"state":x.state.value} for x in self.components]}

class ReadinessLatch:
    """DOC-20 anti-flap: 3 consecutive dependency failures to remove readiness, 2 successes to recover. Hard failures remove readiness immediately."""
    def __init__(self, initially_ready: bool=False): self.ready=initially_ready; self._fails=0; self._oks=0
    def observe(self, ok: bool, *, hard_failure: bool=False) -> bool:
        if hard_failure: self.ready=False; self._fails=3; self._oks=0; return self.ready
        if ok:
            self._oks+=1; self._fails=0
            if self._oks>=2: self.ready=True
        else:
            self._fails+=1; self._oks=0
            if self._fails>=3: self.ready=False
        return self.ready
