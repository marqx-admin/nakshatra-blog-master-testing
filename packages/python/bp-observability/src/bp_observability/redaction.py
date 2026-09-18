from __future__ import annotations
import re
from collections.abc import Mapping
SENSITIVE_KEYS = re.compile(r"(password|passwd|secret|token|authorization|cookie|session|preview|recovery_code|idempotency|connection_string|database_url|signed_url)", re.I)
SECRET_PATTERNS = [
    re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._~+/-]+=*"),
    re.compile(r"(?i)(password|passwd|secret|token)=([^\s&]+)"),
]

def redact_text(value: str) -> str:
    out=value
    for p in SECRET_PATTERNS: out=p.sub(lambda m: (m.group(1) if m.lastindex else "") + "[REDACTED]", out)
    return out

def redact_mapping(value: Mapping[str, object]) -> dict[str, object]:
    out={}
    for k,v in value.items():
        if SENSITIVE_KEYS.search(str(k)): out[str(k)]="[REDACTED]"
        elif isinstance(v, Mapping): out[str(k)]=redact_mapping(v)
        elif isinstance(v, str): out[str(k)]=redact_text(v)
        else: out[str(k)]=v
    return out
