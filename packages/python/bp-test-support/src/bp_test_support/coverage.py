from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .io import load_json
from .status import QAStatus


def aggregate_status(statuses: list[str]) -> str:
    parsed = [QAStatus(status) for status in statuses]
    if not parsed:
        return QAStatus.NOT_EXECUTED.value
    if QAStatus.FAIL in parsed:
        return QAStatus.FAIL.value
    if QAStatus.BLOCKED in parsed:
        return QAStatus.BLOCKED.value
    if all(status is QAStatus.PASS for status in parsed):
        return QAStatus.PASS.value
    return QAStatus.NOT_EXECUTED.value


def coverage_summary(registry_path: str | Path, materialized_results_path: str | Path) -> dict[str, Any]:
    registry = load_json(registry_path)
    results = load_json(materialized_results_path)
    status_by_id = {row["qa_id"]: row["status"] for row in results["results"]}

    family_statuses: dict[str, list[str]] = {}
    for row in registry["tests"]:
        family_statuses.setdefault(row["family"], []).append(status_by_id[row["qa_id"]])

    family_summary = {
        family: {
            "status": aggregate_status(statuses),
            "counts": dict(Counter(statuses)),
        }
        for family, statuses in family_statuses.items()
    }

    gate_summary: dict[str, Any] = {}
    for gate in registry["release_gates"]:
        families = gate["families"]
        statuses = [family_summary[family]["status"] for family in families]
        gate_summary[gate["gate_id"]] = {
            "status": aggregate_status(statuses),
            "families": families,
            "note": gate.get("note"),
        }
    return {"families": family_summary, "release_gates": gate_summary}
