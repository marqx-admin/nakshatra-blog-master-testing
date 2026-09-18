from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from typing import Any

from .io import load_json

QA21_RE = re.compile(r"^QA21-([A-Z0-9]+)-(\d{3})$")

EXPECTED_FAMILY_COUNTS = {
    "ISO": 16,
    "DB": 10,
    "API": 10,
    "PERM": 12,
    "ADM": 10,
    "PUB": 10,
    "CONC": 12,
    "LIFE": 10,
    "MED": 10,
    "SEO": 12,
    "WRK": 12,
    "SEC": 16,
    "A11Y": 10,
    "PERF": 12,
    "DR": 8,
    "REG": 10,
}

EXPECTED_FAMILY_ORDER = list(EXPECTED_FAMILY_COUNTS)


def validate_qa21_registry(path: str | Path) -> dict[str, Any]:
    data = load_json(path)
    tests = data.get("tests", [])
    errors: list[str] = []
    if len(tests) != 180:
        errors.append(f"expected 180 QA21 rows, found {len(tests)}")

    ids = [str(row.get("qa_id", "")) for row in tests]
    if len(ids) != len(set(ids)):
        errors.append("duplicate QA21 IDs present")

    actual_counts: Counter[str] = Counter()
    sequences: dict[str, list[int]] = {family: [] for family in EXPECTED_FAMILY_COUNTS}
    for row in tests:
        qa_id = str(row.get("qa_id", ""))
        match = QA21_RE.match(qa_id)
        if not match:
            errors.append(f"invalid QA21 ID: {qa_id!r}")
            continue
        family, number = match.groups()
        actual_counts[family] += 1
        sequences.setdefault(family, []).append(int(number))
        if row.get("family") != family:
            errors.append(f"family mismatch for {qa_id}")
        if not row.get("required_evidence_expression"):
            errors.append(f"missing evidence expression for {qa_id}")
        if not row.get("expected_behavior_authority"):
            errors.append(f"missing expected-behavior authority for {qa_id}")

    if dict(actual_counts) != EXPECTED_FAMILY_COUNTS:
        errors.append(f"family counts mismatch: {dict(actual_counts)!r}")

    for family, expected in EXPECTED_FAMILY_COUNTS.items():
        seq = sorted(sequences.get(family, []))
        if seq != list(range(1, expected + 1)):
            errors.append(f"{family} sequence is not 001..{expected:03d}: {seq!r}")

    allowed_statuses = set(data.get("allowed_result_statuses", []))
    required_statuses = {"PASS", "FAIL", "BLOCKED", "NOT_EXECUTED"}
    if allowed_statuses != required_statuses:
        errors.append(f"allowed statuses must be exactly {sorted(required_statuses)}")

    return {
        "ok": not errors,
        "errors": errors,
        "qa21_count": len(tests),
        "family_counts": dict(actual_counts),
    }
