from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .io import load_json
from .status import QAStatus


def full_qa_certification(
    *,
    candidate_path: str | Path,
    qa21_status_path: str | Path,
    coverage_path: str | Path,
    visual_status_path: str | Path,
    defects_path: str | Path,
) -> dict[str, Any]:
    candidate = load_json(candidate_path)
    qa21 = load_json(qa21_status_path)
    coverage = load_json(coverage_path)
    visual = load_json(visual_status_path)
    defects = load_json(defects_path)

    reasons: list[str] = []
    qa_rows = qa21.get("results", [])
    if len(qa_rows) != 180:
        reasons.append(f"QA21 registry materialization is not 180 rows: {len(qa_rows)}")
    non_pass = [row for row in qa_rows if row.get("status") != QAStatus.PASS.value]
    if non_pass:
        reasons.append(f"QA21 rows not PASS: {len(non_pass)}")

    gate_rows = coverage.get("release_gates", {})
    non_pass_gates = [gate for gate, value in gate_rows.items() if value.get("status") != QAStatus.PASS.value]
    if non_pass_gates:
        reasons.append("release gates not PASS: " + ", ".join(sorted(non_pass_gates)))

    for doc_key, expected_total in (("doc25", 89), ("doc26", 112), ("doc27", 2281)):
        row = visual.get(doc_key, {})
        if row.get("status") != QAStatus.PASS.value or row.get("passed_assertions") != expected_total:
            reasons.append(f"{doc_key} visual acceptance is not complete PASS {expected_total}/{expected_total}")

    open_defects = [item for item in defects.get("defects", []) if not item.get("resolved_at")]
    if open_defects:
        reasons.append(f"unresolved defects: {len(open_defects)}")

    if not candidate.get("c00_feature_complete_signal_received"):
        reasons.append("C00 - FEATURE_COMPLETE_CANDIDATE_READY not recorded for this candidate")

    has_fail = any(row.get("status") == QAStatus.FAIL.value for row in qa_rows)
    has_blocked = any(row.get("status") == QAStatus.BLOCKED.value for row in qa_rows)
    if has_fail:
        status = QAStatus.FAIL.value
    elif has_blocked:
        status = QAStatus.BLOCKED.value
    elif reasons:
        status = QAStatus.NOT_EXECUTED.value
    else:
        status = QAStatus.PASS.value

    return {
        "candidate_id": candidate.get("candidate_id"),
        "status": status,
        "release_signal": "C12 - FULL_QA_PASS" if status == QAStatus.PASS.value else None,
        "reasons": reasons,
        "qa21_status_counts": dict(Counter(row.get("status") for row in qa_rows)),
        "rule": "No percentage-based substitution. Signal is emitted only when every applicable required release row and visual gate is PASS with evidence.",
    }


def two_site_certification(two_site_status_path: str | Path) -> dict[str, Any]:
    data = load_json(two_site_status_path)
    status = str(data.get("status", QAStatus.NOT_EXECUTED.value))
    required = data.get("required_checks", [])
    non_pass = [item for item in required if item.get("status") != QAStatus.PASS.value]
    if status == QAStatus.PASS.value and not non_pass and required:
        signal = "C12 - TWO_SITE_E2E_PASS"
    else:
        signal = None
    return {
        "status": status if status in {s.value for s in QAStatus} else QAStatus.FAIL.value,
        "release_signal": signal,
        "non_pass_required_checks": len(non_pass),
    }
