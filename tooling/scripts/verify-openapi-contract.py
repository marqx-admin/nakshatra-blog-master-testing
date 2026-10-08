#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

try:
    import yaml
except Exception as exc:  # pragma: no cover
    print(f"FAIL PyYAML is required to verify the canonical OpenAPI YAML: {exc}", file=sys.stderr)
    raise SystemExit(90)

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "options", "head", "trace"}
ROOT = Path(__file__).resolve().parents[2]
BASELINE_PATH = ROOT / "tooling/configs/openapi-baseline.json"


def json_pointer_resolve(document: Any, ref: str) -> Any:
    if not ref.startswith("#/"):
        raise ValueError(f"not an internal JSON pointer: {ref}")
    current = document
    for raw in ref[2:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(token)]
        else:
            current = current[token]
    return current


def walk_refs(node: Any, refs: list[str]) -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            if key == "$ref" and isinstance(value, str) and value.startswith("#/"):
                refs.append(value)
            walk_refs(value, refs)
    elif isinstance(node, list):
        for value in node:
            walk_refs(value, refs)


def fail(message: str, code: int = 1) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(code)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-out", type=Path)
    args = parser.parse_args()

    baseline = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    source = ROOT / baseline["canonical_repository_path"]
    if not source.exists():
        fail(f"canonical RC11 source missing: {baseline['canonical_repository_path']}", 20)

    raw = source.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    if sha != baseline["sha256"]:
        fail(f"pinned RC11 contract SHA mismatch: expected={baseline['sha256']} actual={sha}", 21)

    document = yaml.safe_load(raw)
    if not isinstance(document, dict):
        fail("OpenAPI root is not a mapping", 22)
    if str(document.get("openapi")) != baseline["openapi_version"]:
        fail(f"OpenAPI version mismatch: {document.get('openapi')!r}", 23)
    info = document.get("info") or {}
    if str(info.get("version")) != baseline["api_version"]:
        fail(f"API info.version mismatch: {info.get('version')!r}", 24)

    paths = document.get("paths") or {}
    if not isinstance(paths, dict):
        fail("paths is not a mapping", 25)

    operations: list[tuple[str, str, dict[str, Any]]] = []
    for route, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if str(method).lower() in HTTP_METHODS and isinstance(operation, dict):
                operations.append((str(route), str(method).lower(), operation))

    op_ids = [str(op.get("operationId", "")) for _, _, op in operations]
    if any(not value for value in op_ids):
        fail("one or more operations have no operationId", 26)
    duplicates = [item for item, count in Counter(op_ids).items() if count != 1]
    if duplicates:
        fail(f"operationId values are not unique: {duplicates}", 27)

    schemas = ((document.get("components") or {}).get("schemas") or {})
    if not isinstance(schemas, dict):
        fail("components.schemas is not a mapping", 28)

    refs: list[str] = []
    walk_refs(document, refs)
    unresolved: list[str] = []
    for ref in refs:
        try:
            json_pointer_resolve(document, ref)
        except Exception:
            unresolved.append(ref)
    if unresolved:
        fail(f"unresolved internal references found: {sorted(set(unresolved))[:20]}", 29)

    class_counts = Counter()
    context_counts = Counter()
    success_counts = Counter()
    success_mismatches: list[str] = []
    for route, method, op in operations:
        operation_id = str(op["operationId"])
        if operation_id.startswith("API15-AUTH-"):
            class_counts["AUTH"] += 1
        elif operation_id.startswith("API15-PUB-"):
            class_counts["PUBLIC_PREVIEW"] += 1
        elif operation_id.startswith("API15-S-"):
            class_counts["SITE"] += 1
        elif operation_id.startswith("API15-G-"):
            class_counts["GLOBAL"] += 1
        else:
            class_counts["UNKNOWN"] += 1

        context_counts[str(op.get("x-site-context", "MISSING"))] += 1
        declared_success = str(op.get("x-success-status", ""))
        two_xx = [str(code) for code in (op.get("responses") or {}) if re.fullmatch(r"2\d\d", str(code))]
        if len(two_xx) != 1:
            success_mismatches.append(f"{operation_id}: expected one 2xx response, got {two_xx}")
            continue
        actual_success = two_xx[0]
        if declared_success and declared_success != actual_success:
            success_mismatches.append(
                f"{operation_id}: x-success-status={declared_success} but response 2xx={actual_success}"
            )
        success_counts[actual_success] += 1

    if success_mismatches:
        fail("success status mismatches: " + "; ".join(success_mismatches[:20]), 30)

    checks = {
        "operation_count": len(operations),
        "path_count": len(paths),
        "schema_helper_count": len(schemas),
        "resolved_internal_ref_count": len(refs),
        "auth_operation_count": class_counts["AUTH"],
        "public_preview_operation_count": class_counts["PUBLIC_PREVIEW"],
        "site_operation_count": class_counts["SITE"],
        "global_operation_count": class_counts["GLOBAL"],
    }
    for key, actual in checks.items():
        expected = int(baseline[key])
        if actual != expected:
            fail(f"{key} mismatch: expected={expected} actual={actual}", 31)

    expected_success = {str(k): int(v) for k, v in baseline["success_status_distribution"].items()}
    actual_success = {str(k): int(success_counts[k]) for k in sorted(success_counts)}
    if actual_success != expected_success:
        fail(f"success distribution mismatch: expected={expected_success} actual={actual_success}", 32)

    if class_counts["UNKNOWN"]:
        fail(f"unexpected operation ID class count={class_counts['UNKNOWN']}", 33)

    # Preserve exact scope semantics beyond prefixes.
    pub_ops = [op for _, _, op in operations if str(op["operationId"]).startswith("API15-PUB-")]
    pub_contexts = {str(op.get("x-site-context")) for op in pub_ops}
    if pub_contexts != {"PUBLIC", "PREVIEW"}:
        fail(f"public/preview context set mismatch: {sorted(pub_contexts)}", 34)
    if any(str(op.get("x-site-context")) != "AUTH" for _, _, op in operations if str(op["operationId"]).startswith("API15-AUTH-")):
        fail("AUTH operations do not all declare x-site-context=AUTH", 35)
    if any(str(op.get("x-site-context")) != "SITE" for _, _, op in operations if str(op["operationId"]).startswith("API15-S-")):
        fail("SITE operations do not all declare x-site-context=SITE", 36)
    if any(str(op.get("x-site-context")) != "GLOBAL" for _, _, op in operations if str(op["operationId"]).startswith("API15-G-")):
        fail("GLOBAL operations do not all declare x-site-context=GLOBAL", 37)

    report = {
        "canonical_source": baseline["canonical_repository_path"],
        "sha256": sha,
        "historical_unavailable_original_sha256": baseline["historical_unavailable_original_sha256"],
        "historical_digest_status": baseline["historical_digest_status"],
        **checks,
        "success_status_distribution": actual_success,
        "context_distribution": dict(sorted(context_counts.items())),
        "internal_ref_unique_targets": len(set(refs)),
        "unresolved_internal_refs": 0,
        "status": "PASS",
    }

    if args.json_out:
        out = args.json_out if args.json_out.is_absolute() else ROOT / args.json_out
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(f"PASS pinned RC11 contract SHA-256 {sha}")
    print("PASS OpenAPI 3.1.0 / API 1.0-RC11")
    print(f"PASS operations={checks['operation_count']} paths={checks['path_count']} schemas/helpers={checks['schema_helper_count']}")
    print(f"PASS resolved internal references={checks['resolved_internal_ref_count']} unresolved=0")
    print(
        "PASS operation classes="
        f"AUTH:{checks['auth_operation_count']} "
        f"PUBLIC/PREVIEW:{checks['public_preview_operation_count']} "
        f"SITE:{checks['site_operation_count']} GLOBAL:{checks['global_operation_count']}"
    )
    print(
        "PASS success statuses="
        + " ".join(f"{code}x{count}" for code, count in expected_success.items())
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
