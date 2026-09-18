from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .io import load_json, write_json
from .status import QAStatus


def validate_result_record(record: dict[str, Any], qa_registry: dict[str, Any] | None = None) -> list[str]:
    errors: list[str] = []
    try:
        status = QAStatus(str(record.get("status")))
    except ValueError:
        return [f"invalid status {record.get('status')!r}"]

    if not record.get("test_id"):
        errors.append("test_id is required")
    if not record.get("candidate_id"):
        errors.append("candidate_id is required")
    if not record.get("environment_class"):
        errors.append("environment_class is required")

    evidence = record.get("evidence", [])
    if status is QAStatus.PASS and not evidence:
        errors.append("PASS requires at least one evidence artifact")
    if status is QAStatus.FAIL and not record.get("defect_id"):
        errors.append("FAIL requires defect_id")
    if status is QAStatus.BLOCKED and not record.get("blocked_reason"):
        errors.append("BLOCKED requires blocked_reason")
    if status is QAStatus.NOT_EXECUTED and evidence:
        errors.append("NOT_EXECUTED must not claim execution evidence")

    if qa_registry and str(record.get("test_id", "")).startswith("QA21-"):
        lookup = {row["qa_id"]: row for row in qa_registry.get("tests", [])}
        if record["test_id"] not in lookup:
            errors.append(f"unknown QA21 ID {record['test_id']}")

    return errors


def materialize_qa21_statuses(registry_path: str | Path, result_records: list[dict[str, Any]]) -> dict[str, Any]:
    registry = load_json(registry_path)
    by_id: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in result_records:
        if str(record.get("test_id", "")).startswith("QA21-"):
            by_id[str(record["test_id"])].append(record)

    rows: list[dict[str, Any]] = []
    for spec in registry["tests"]:
        qa_id = spec["qa_id"]
        records = by_id.get(qa_id, [])
        if not records:
            status = QAStatus.NOT_EXECUTED.value
            instances: list[dict[str, Any]] = []
        else:
            statuses = {QAStatus(str(r["status"])) for r in records}
            if QAStatus.FAIL in statuses:
                status = QAStatus.FAIL.value
            elif QAStatus.BLOCKED in statuses:
                status = QAStatus.BLOCKED.value
            elif statuses == {QAStatus.PASS}:
                status = QAStatus.PASS.value
            else:
                status = QAStatus.NOT_EXECUTED.value
            instances = records
        rows.append({
            "qa_id": qa_id,
            "family": spec["family"],
            "status": status,
            "instances": instances,
        })

    counts = Counter(row["status"] for row in rows)
    return {
        "status_model": [status.value for status in QAStatus],
        "qa21_total": len(rows),
        "status_counts": dict(counts),
        "results": rows,
    }


def write_materialized_statuses(registry_path: str | Path, result_records: list[dict[str, Any]], output_path: str | Path) -> None:
    write_json(output_path, materialize_qa21_statuses(registry_path, result_records))


def append_result_record(path: str | Path, record: dict[str, Any], qa_registry: dict[str, Any]) -> None:
    errors = validate_result_record(record, qa_registry)
    if errors:
        raise ValueError("; ".join(errors))
    target = Path(path)
    records = load_json(target) if target.exists() else []
    if not isinstance(records, list):
        raise ValueError("executed result store must be a JSON array")
    records.append(record)
    write_json(target, records)


def summarize_foundation_results(directory: str | Path) -> dict[str, Any]:
    root = Path(directory)
    records: list[dict[str, Any]] = []
    for path in sorted(root.glob("C12-FND-*.json")):
        records.append(load_json(path))
    statuses = [str(record.get("status")) for record in records]
    if any(status == QAStatus.FAIL.value for status in statuses):
        overall = QAStatus.FAIL.value
    elif any(status == QAStatus.BLOCKED.value for status in statuses):
        overall = QAStatus.BLOCKED.value
    elif records and all(status == QAStatus.PASS.value for status in statuses):
        overall = QAStatus.PASS.value
    else:
        overall = QAStatus.NOT_EXECUTED.value
    return {
        "kind": "CHAT12_FOUNDATION_SELF_CHECKS",
        "status": overall,
        "check_count": len(records),
        "status_counts": dict(Counter(statuses)),
        "release_qa21_effect": "NONE - these checks do not mark QA21 release rows PASS",
        "checks": records,
    }
