from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .hashing import sha256_file

_SECRET_PATTERNS = [
    (re.compile(r"(?i)(authorization:\s*bearer\s+)[^\s]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(password\s*[=:]\s*)[^\s,;]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(csrf[-_ ]?token\s*[=:]\s*)[^\s,;]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(mfa[-_ ]?(?:seed|secret|code)\s*[=:]\s*)[^\s,;]+"), r"\1[REDACTED]"),
    (re.compile(r"(?i)(preview[-_ ]?(?:grant|token|credential)\s*[=:]\s*)[^\s,;]+"), r"\1[REDACTED]"),
]


def redact_text(text: str) -> str:
    value = text
    for pattern, replacement in _SECRET_PATTERNS:
        value = pattern.sub(replacement, value)
    return value


def evidence_ref(evidence_class: str, path: str | Path, repo_root: str | Path) -> dict[str, Any]:
    target = Path(path).resolve()
    root = Path(repo_root).resolve()
    relative = target.relative_to(root)
    return {
        "evidence_class": evidence_class,
        "path": relative.as_posix(),
        "sha256": sha256_file(target),
        "bytes": target.stat().st_size,
    }
