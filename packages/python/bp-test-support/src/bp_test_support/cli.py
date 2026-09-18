from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from .coverage import coverage_summary
from .certification import full_qa_certification, two_site_certification
from .evidence import evidence_ref
from .fixtures import validate_collision_fixture
from .io import load_json, write_json
from .registry import validate_qa21_registry
from .results import append_result_record, materialize_qa21_statuses, summarize_foundation_results, validate_result_record
from .runner import execute_foundation_check
from .status import QAStatus


def _repo_root(value: str | None) -> Path:
    return Path(value or os.getcwd()).resolve()


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _parse_evidence(values: list[str], root: Path) -> list[dict[str, object]]:
    refs: list[dict[str, object]] = []
    for value in values:
        if "=" not in value:
            raise ValueError(f"evidence must be CLASS=repo-relative-path, got {value!r}")
        evidence_class, raw_path = value.split("=", 1)
        refs.append(evidence_ref(evidence_class, root / raw_path, root))
    return refs


def _enforce_pass_evidence(qa_id: str, registry: dict[str, object], evidence: list[dict[str, object]], resolution: str | None) -> list[str]:
    rows = {row["qa_id"]: row for row in registry["tests"]}  # type: ignore[index]
    row = rows.get(qa_id)
    if not row:
        return [f"unknown QA21 ID {qa_id}"]
    expression = str(row["required_evidence_expression"])
    classes = {str(item["evidence_class"]) for item in evidence}
    errors: list[str] = []
    if qa_id.startswith("QA21-REG-"):
        if not resolution:
            errors.append("REG PASS requires --evidence-resolution because DOC-22 says evidence is 'as assertion requires'")
        return errors
    if qa_id.startswith("QA21-ISO-"):
        if "EV21-HTTP" not in classes:
            errors.append("ISO PASS requires EV21-HTTP")
        if not resolution:
            errors.append("ISO PASS requires --evidence-resolution for DB/REDIS/QUEUE applicability")
        return errors
    required = set(re.findall(r"EV21-[A-Z]+", expression))
    missing = sorted(required - classes)
    if missing:
        errors.append(f"PASS is missing required evidence classes: {missing}")
    return errors


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="bp-test-support")
    parser.add_argument("--repo-root", default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("validate-registry")
    sub.add_parser("validate-fixtures")
    sub.add_parser("validate-foundation")

    materialize = sub.add_parser("materialize-qa21")
    materialize.add_argument("--records", default="tests/evidence/results/qa21/executed-records.json")
    materialize.add_argument("--output", default="tests/evidence/results/qa21/qa21-status.json")

    sub.add_parser("summarize-foundation")

    certify = sub.add_parser("certify-full")
    certify.add_argument("--output", default="tests/evidence/release-certification.json")

    certify_two = sub.add_parser("certify-two-site")
    certify_two.add_argument("--output", default="tests/evidence/two-site-certification.json")

    coverage = sub.add_parser("coverage")
    coverage.add_argument("--results", default="tests/evidence/results/qa21/qa21-status.json")
    coverage.add_argument("--output", default="tests/evidence/coverage/coverage-summary.json")

    execute = sub.add_parser("execute-foundation")
    execute.add_argument("--check-id", required=True)
    execute.add_argument("--candidate-id", required=True)
    execute.add_argument("--description", required=True)
    execute.add_argument("command_args", nargs=argparse.REMAINDER)

    record = sub.add_parser("record-result")
    record.add_argument("--test-id", required=True)
    record.add_argument("--instance", required=True)
    record.add_argument("--candidate-id", required=True)
    record.add_argument("--environment", required=True)
    record.add_argument("--status", required=True, choices=[status.value for status in QAStatus])
    record.add_argument("--source-trace", action="append", default=[])
    record.add_argument("--evidence", action="append", default=[])
    record.add_argument("--evidence-resolution")
    record.add_argument("--defect-id")
    record.add_argument("--blocked-reason")
    record.add_argument("--started-at")
    record.add_argument("--completed-at")
    record.add_argument("--records", default="tests/evidence/results/qa21/executed-records.json")

    defect = sub.add_parser("register-defect")
    defect.add_argument("--defect-id", required=True)
    defect.add_argument("--test-id", required=True)
    defect.add_argument("--instance", required=True)
    defect.add_argument("--candidate-id", required=True)
    defect.add_argument("--owner-chat", required=True)
    defect.add_argument("--owning-requirement", required=True)
    defect.add_argument("--summary", required=True)
    defect.add_argument("--evidence", action="append", default=[])
    defect.add_argument("--register", default="tests/evidence/defects/defect-register.json")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    root = _repo_root(args.repo_root)
    registry_path = root / "tests/qa/qa21-registry.json"
    fixture_path = root / "tests/fixtures/tenant-collision-v1.json"

    if args.command == "validate-registry":
        result = validate_qa21_registry(registry_path)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["ok"] else 1

    if args.command == "validate-fixtures":
        result = validate_collision_fixture(fixture_path)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["ok"] else 1

    if args.command == "validate-foundation":
        registry_result = validate_qa21_registry(registry_path)
        fixture_result = validate_collision_fixture(fixture_path)
        visual = load_json(root / "tests/qa/visual-acceptance-registry.json")
        visual_ok = (
            visual["doc25"]["assertion_count"] == 89
            and visual["doc26"]["assertion_count"] == 112
            and visual["doc27"]["assertion_count"] == 2281
        )
        result = {
            "ok": registry_result["ok"] and fixture_result["ok"] and visual_ok,
            "qa21": registry_result,
            "fixtures": fixture_result,
            "visual_acceptance_counts_ok": visual_ok,
        }
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["ok"] else 1

    if args.command == "materialize-qa21":
        records_path = root / args.records
        records = load_json(records_path) if records_path.exists() else []
        registry = load_json(registry_path)
        errors = []
        for record in records:
            record_errors = validate_result_record(record, registry)
            if record_errors:
                errors.append((record.get("test_id"), record_errors))
        if errors:
            print(json.dumps({"status": "FAIL", "record_errors": errors}, indent=2), file=sys.stderr)
            return 2
        output = materialize_qa21_statuses(registry_path, records)
        write_json(root / args.output, output)
        print(json.dumps({"status": "PASS", "output": args.output, "counts": output["status_counts"]}, indent=2))
        return 0

    if args.command == "summarize-foundation":
        summary = summarize_foundation_results(root / "tests/evidence/results/foundation")
        write_json(root / "tests/evidence/results/foundation/foundation-summary.json", summary)
        print(json.dumps({"status": summary["status"], "checks": summary["check_count"]}, indent=2))
        return 0 if summary["status"] == "PASS" else 1

    if args.command == "certify-full":
        report = full_qa_certification(
            candidate_path=root / "tests/evidence/candidate/candidate.json",
            qa21_status_path=root / "tests/evidence/results/qa21/qa21-status.json",
            coverage_path=root / "tests/evidence/coverage/coverage-summary.json",
            visual_status_path=root / "tests/evidence/results/visual/visual-status.json",
            defects_path=root / "tests/evidence/defects/defect-register.json",
        )
        write_json(root / args.output, report)
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0 if report["status"] in {"PASS", "NOT_EXECUTED"} else 1

    if args.command == "certify-two-site":
        report = two_site_certification(root / "tests/evidence/results/e2e/two-site-status.json")
        write_json(root / args.output, report)
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0 if report["status"] in {"PASS", "NOT_EXECUTED"} else 1

    if args.command == "coverage":
        summary = coverage_summary(registry_path, root / args.results)
        write_json(root / args.output, summary)
        print(json.dumps({"status": "PASS", "output": args.output}, indent=2))
        return 0

    if args.command == "execute-foundation":
        command = list(args.command_args)
        if command and command[0] == "--":
            command = command[1:]
        if not command:
            print("missing command after --", file=sys.stderr)
            return 2
        result = execute_foundation_check(
            check_id=args.check_id,
            command=command,
            repo_root=root,
            candidate_id=args.candidate_id,
            output_dir=root / "tests/evidence/results/foundation",
            description=args.description,
        )
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0 if result["status"] == "PASS" else 1

    if args.command == "record-result":
        registry = load_json(registry_path)
        status = QAStatus(args.status)
        try:
            evidence = _parse_evidence(args.evidence, root)
        except (ValueError, FileNotFoundError) as exc:
            print(f"FAIL {exc}", file=sys.stderr)
            return 2
        if status is QAStatus.PASS:
            errors = _enforce_pass_evidence(args.test_id, registry, evidence, args.evidence_resolution)
            if errors:
                print(json.dumps({"status": "FAIL", "errors": errors}, indent=2), file=sys.stderr)
                return 2
        if status is QAStatus.FAIL and "EV21-DEFECT" not in {str(item["evidence_class"]) for item in evidence}:
            print("FAIL QA21 FAIL requires EV21-DEFECT evidence", file=sys.stderr)
            return 2
        record = {
            "test_id": args.test_id,
            "instance": args.instance,
            "candidate_id": args.candidate_id,
            "environment_class": args.environment,
            "status": status.value,
            "source_trace": args.source_trace,
            "evidence": evidence,
            "evidence_requirement_resolution": args.evidence_resolution,
            "started_at": args.started_at,
            "completed_at": args.completed_at or (_utc_now() if status is not QAStatus.NOT_EXECUTED else None),
            "defect_id": args.defect_id,
            "blocked_reason": args.blocked_reason,
        }
        try:
            append_result_record(root / args.records, record, registry)
        except ValueError as exc:
            print(f"FAIL {exc}", file=sys.stderr)
            return 2
        print(json.dumps({"status": "PASS", "recorded_test_status": status.value, "test_id": args.test_id, "instance": args.instance}, indent=2))
        return 0

    if args.command == "register-defect":
        try:
            evidence = _parse_evidence(args.evidence, root)
        except (ValueError, FileNotFoundError) as exc:
            print(f"FAIL {exc}", file=sys.stderr)
            return 2
        target = root / args.register
        register = load_json(target)
        if any(item.get("defect_id") == args.defect_id for item in register.get("defects", [])):
            print(f"FAIL duplicate defect_id {args.defect_id}", file=sys.stderr)
            return 2
        register.setdefault("defects", []).append({
            "defect_id": args.defect_id,
            "test_id": args.test_id,
            "instance": args.instance,
            "candidate_id": args.candidate_id,
            "owner_chat": args.owner_chat,
            "owning_requirement": args.owning_requirement,
            "summary": args.summary,
            "first_seen_at": _utc_now(),
            "evidence": evidence,
            "resolved_at": None,
            "fix_candidate_id": None,
            "retest_evidence": [],
        })
        write_json(target, register)
        print(json.dumps({"status": "PASS", "defect_id": args.defect_id, "register": args.register}, indent=2))
        return 0

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
