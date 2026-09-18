#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import time
from typing import Any

MIG_RE = re.compile(r"^(\d{4})_(DB-MIG-\d{3})__[a-z0-9][a-z0-9-]*\.sql$")
CHAIN_IR_RE = re.compile(r"^\s*\\ir\s+\.\./migrations/([^\s]+)\s*$", re.MULTILINE)
TIMEZONE_NAMES = tuple(f"SITE_{i:02d}_TIMEZONE" for i in range(1, 15))
POST_VERIFY_FILES = (
    "verify-schema.sql",
    "verify-rls.sql",
    "verify-seeds.sql",
)
LOCK_TIMEOUT = "5s"
STATEMENT_TIMEOUT = "15min"
MIGRATION_LOCK_EXPR = "hashtextextended('NAKSHATRA:BLOG:DB-MIG:v1', 0)"
LEDGER_SCHEMA = "MIG24-LEDGER/v1"


def sha(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _tail(text: str, limit: int = 4000) -> str:
    return text[-limit:] if text else ""


def _write_json(path: pathlib.Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")


def _placeholder(value: str) -> bool:
    normalized = value.strip().lower()
    return (
        not normalized
        or normalized.startswith(("replace", "changeme", "todo", "<"))
        or "iana_timezone" in normalized
        or "iana-timezone" in normalized
    )


def _transaction_wrapped(path: pathlib.Path) -> bool:
    text = re.sub(r"(?m)^\s*--[^\n]*(?:\n|$)", "", path.read_text()).strip()
    return bool(re.match(r"(?is)^BEGIN\s*;", text) and re.search(r"(?is)COMMIT\s*;\s*$", text))


def run_psql(
    host: str,
    port: str,
    database: str,
    user: str,
    credential_file: str,
    *,
    sql: str | None = None,
    file: pathlib.Path | None = None,
    input_text: str | None = None,
    variables: dict[str, str] | None = None,
    tuples_only: bool = False,
    migration_session: bool = False,
) -> subprocess.CompletedProcess[str]:
    if sum(value is not None for value in (sql, file, input_text)) != 1:
        raise ValueError("exactly one of sql, file or input_text must be supplied")

    secret_path = pathlib.Path(credential_file)
    if not secret_path.is_file():
        raise FileNotFoundError(f"migration credential file not found: {credential_file}")
    secret = secret_path.read_text().strip()
    if not secret:
        raise ValueError("migration credential file is empty")

    env = os.environ.copy()
    env["PGPASSWORD"] = secret
    env["PGSSLMODE"] = os.getenv("BP_POSTGRES_SSL_MODE", "verify-full")
    if migration_session:
        bounded = f"-c lock_timeout={LOCK_TIMEOUT} -c statement_timeout={STATEMENT_TIMEOUT}"
        env["PGOPTIONS"] = f"{env.get('PGOPTIONS', '').strip()} {bounded}".strip()

    cmd = [
        "psql",
        "-X",
        "-v",
        "ON_ERROR_STOP=1",
        "-h",
        host,
        "-p",
        str(port),
        "-d",
        database,
        "-U",
        user,
    ]
    if tuples_only:
        cmd.extend(["-A", "-t"])
    for name, value in (variables or {}).items():
        cmd.extend(["-v", f"{name}={value}"])
    if sql is not None:
        cmd.extend(["-c", sql])
    elif file is not None:
        cmd.extend(["-f", str(file)])
    else:
        cmd.extend(["-f", "-"])
    return subprocess.run(cmd, env=env, input=input_text, text=True, capture_output=True)


def canonical_plan(database_root: pathlib.Path) -> tuple[dict[str, Any], list[str]]:
    migrations_root = database_root / "migrations"
    verification_root = database_root / "verification"
    apply_chain = verification_root / "apply-chain.sql"
    errors: list[str] = []

    if not apply_chain.is_file():
        return {}, ["canonical database/verification/apply-chain.sql is missing"]

    migration_files = sorted(p for p in migrations_root.glob("*.sql") if p.is_file())
    parsed: list[tuple[int, str, pathlib.Path, str]] = []
    for path in migration_files:
        match = MIG_RE.match(path.name)
        if not match:
            errors.append(f"invalid migration filename: {path.name}")
            continue
        parsed.append((int(match.group(1)), match.group(2), path, sha(path)))
        if not _transaction_wrapped(path):
            errors.append(
                f"migration {path.name} is not transaction-wrapped; non-transactional migrations require explicit reviewed runner support"
            )

    sequence = [seq for seq, _, _, _ in parsed]
    if sequence != list(range(1, len(parsed) + 1)):
        errors.append(f"migration sequence must be contiguous from 0001; got {sequence}")
    ids = [mig_id for _, mig_id, _, _ in parsed]
    if len(ids) != len(set(ids)):
        errors.append("duplicate DB-MIG identifier")
    if len(parsed) < 17 or sequence[:17] != list(range(1, 18)):
        errors.append("frozen R3 baseline DB-MIG-001..017 is incomplete")

    expected_names = [path.name for _, _, path, _ in parsed]
    chain_text = apply_chain.read_text()
    chain_names = CHAIN_IR_RE.findall(chain_text)
    if chain_names != expected_names:
        errors.append("apply-chain migration order does not exactly match canonical migration directory order")

    try:
        pos_mig_001 = chain_text.index("0001_DB-MIG-001__bootstrap-database.sql")
        pos_set_role = chain_text.index("SET ROLE db_migrator;")
        pos_mig_002 = chain_text.index("0002_DB-MIG-002__tenancy-registry.sql")
        pos_mig_015 = chain_text.index("0015_DB-MIG-015__required-system-seed.sql")
        pos_mig_017 = chain_text.index("0017_DB-MIG-017__wave2-contract-reconciliation.sql")
        pos_reset_role = chain_text.index("RESET ROLE;")
    except ValueError as exc:
        errors.append(f"apply-chain required role/order marker missing: {exc}")
    else:
        if not (pos_mig_001 < pos_set_role < pos_mig_002):
            errors.append("apply-chain must SET ROLE db_migrator after DB-MIG-001 and before DB-MIG-002")
        if not (pos_mig_017 < pos_reset_role):
            errors.append("apply-chain must RESET ROLE after DB-MIG-017")
        for i, _name in enumerate(TIMEZONE_NAMES, 1):
            marker = f"app.bootstrap_timezone_site_{i:02d}"
            try:
                pos = chain_text.index(marker)
            except ValueError:
                errors.append(f"apply-chain missing timezone bootstrap marker {marker}")
                continue
            if not (pos_set_role < pos < pos_mig_015):
                errors.append(f"{marker} must be established after SET ROLE and before DB-MIG-015")

    if "SELECT pg_advisory_lock(" not in chain_text or "SELECT pg_advisory_unlock(" not in chain_text:
        errors.append("apply-chain must own the canonical advisory migration lock lifecycle")
    if re.search(r"\\ir\s+\.\./seeds/", chain_text):
        errors.append("apply-chain must not invoke duplicate external seed loaders")

    post_verify: list[dict[str, str]] = []
    for name in POST_VERIFY_FILES:
        path = verification_root / name
        if not path.is_file():
            errors.append(f"missing post-migration verification script: {name}")
        else:
            post_verify.append({"file": name, "sha256": sha(path)})

    plan: dict[str, Any] = {
        "apply_chain": {
            "file": "verification/apply-chain.sql",
            "sha256": sha(apply_chain),
            "invocation_count_per_fresh_run": 1,
        },
        "migrations": [
            {
                "sequence": seq,
                "id": mig_id,
                "file": path.name,
                "sha256": digest,
                "transaction_mode": "file-owned-BEGIN-COMMIT",
            }
            for seq, mig_id, path, digest in parsed
        ],
        "timezone_inputs": list(TIMEZONE_NAMES),
        "migration_session_timeouts": {
            "lock_timeout": LOCK_TIMEOUT,
            "statement_timeout": STATEMENT_TIMEOUT,
        },
        "post_migration_verification": post_verify,
        "excluded_from_post_migration_execution": [
            "apply-chain.sql",
            "verify-behavior.sql",
            "apply_test_fixtures.sh",
            "isolation/development fixture loaders",
        ],
        "initialized_database_state_source": "trusted prior MIG24 deployment evidence ledger",
    }
    return plan, errors


def _ledger_from_document(document: dict[str, Any]) -> dict[str, Any]:
    ledger = document.get("migration_ledger", document)
    if not isinstance(ledger, dict):
        raise ValueError("migration ledger document is not an object")
    return ledger


def load_and_validate_ledger(
    path: pathlib.Path,
    migrations: list[dict[str, Any]],
    environment: str,
    database: str,
) -> tuple[dict[str, Any] | None, int, list[str]]:
    if not path.is_file():
        return None, 0, [f"trusted applied-migration ledger not found: {path}"]
    try:
        document = json.loads(path.read_text())
        ledger = _ledger_from_document(document)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        return None, 0, [f"invalid applied-migration ledger: {exc}"]

    errors: list[str] = []
    if ledger.get("schema") != LEDGER_SCHEMA:
        errors.append(f"migration ledger schema must be {LEDGER_SCHEMA}")
    if ledger.get("environment") != environment:
        errors.append("migration ledger environment does not match BP_ENV")
    if ledger.get("database") != database:
        errors.append("migration ledger database does not match BP_POSTGRES_DATABASE")

    applied = ledger.get("applied_migrations")
    if not isinstance(applied, list):
        errors.append("migration ledger applied_migrations must be a list")
        return ledger, 0, errors
    if len(applied) > len(migrations):
        errors.append("migration ledger contains more migrations than the current release")
        return ledger, 0, errors

    seen: set[str] = set()
    for index, item in enumerate(applied):
        if not isinstance(item, dict):
            errors.append(f"migration ledger item {index} is not an object")
            continue
        name = str(item.get("file", ""))
        if name in seen:
            errors.append(f"duplicate migration in ledger: {name}")
        seen.add(name)
        expected = migrations[index]
        for field in ("sequence", "id", "file", "sha256"):
            if item.get(field) != expected.get(field):
                errors.append(
                    f"migration ledger is not the exact canonical applied prefix at position {index + 1}: "
                    f"{field} expected {expected.get(field)!r}, got {item.get(field)!r}"
                )

    return ledger, len(applied), errors


def build_ledger(
    migrations: list[dict[str, Any]],
    applied_count: int,
    environment: str,
    database: str,
) -> dict[str, Any]:
    release_sha = os.getenv("BP_RELEASE_SHA", "").strip() or None
    return {
        "schema": LEDGER_SCHEMA,
        "environment": environment,
        "database": database,
        "release_sha": release_sha,
        "recorded_at": time.time(),
        "applied_migrations": [
            {field: migration[field] for field in ("sequence", "id", "file", "sha256")}
            for migration in migrations[:applied_count]
        ],
    }


def incremental_session_sql(
    database_root: pathlib.Path,
    pending: list[dict[str, Any]],
) -> str:
    lines = [
        r"\set ON_ERROR_STOP on",
        f"SET lock_timeout = '{LOCK_TIMEOUT}';",
        f"SET statement_timeout = '{STATEMENT_TIMEOUT}';",
        "DO $bp$",
        "BEGIN",
        f"  IF NOT pg_try_advisory_lock({MIGRATION_LOCK_EXPR}) THEN",
        "    RAISE EXCEPTION 'another migration runner holds the canonical PostgreSQL advisory lock';",
        "  END IF;",
        "END",
        "$bp$;",
        "SET ROLE db_migrator;",
    ]
    for i, timezone_name in enumerate(TIMEZONE_NAMES, 1):
        lines.append(
            f"SELECT set_config('app.bootstrap_timezone_site_{i:02d}', :'{timezone_name}', false);"
        )
    for migration in pending:
        name = migration["file"]
        path = (database_root / "migrations" / name).resolve().as_posix()
        lines.append(f"\\echo NAKSHATRA_MIGRATION_START {name}")
        lines.append(f"\\ir {path}")
        lines.append(f"\\echo NAKSHATRA_MIGRATION_DONE {name}")
    lines.extend(
        [
            "RESET ROLE;",
            f"SELECT pg_advisory_unlock({MIGRATION_LOCK_EXPR});",
        ]
    )
    return "\n".join(lines) + "\n"


def completed_pending_count(stdout: str, pending: list[dict[str, Any]]) -> int:
    done = re.findall(r"NAKSHATRA_MIGRATION_DONE\s+([^\s]+)", stdout)
    expected = [str(item["file"]) for item in pending]
    count = 0
    for actual, wanted in zip(done, expected):
        if actual != wanted:
            break
        count += 1
    return count


def run_post_verification(
    verification_root: pathlib.Path,
    host: str,
    port: str,
    database: str,
    user: str,
    credential_file: str,
) -> tuple[list[dict[str, Any]], int]:
    results: list[dict[str, Any]] = []
    for name in POST_VERIFY_FILES:
        path = verification_root / name
        result = run_psql(
            host,
            port,
            database,
            user,
            credential_file,
            file=path,
            migration_session=True,
        )
        results.append(
            {
                "file": name,
                "returncode": result.returncode,
                "stdout_tail": _tail(result.stdout),
                "stderr_tail": _tail(result.stderr),
            }
        )
        if result.returncode:
            return results, result.returncode
    return results, 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-root", default="/workspace/database")
    parser.add_argument("--manifest-out", default="/tmp/migration-evidence.json")
    parser.add_argument(
        "--applied-ledger",
        help="trusted prior MIG24 migration evidence/ledger for an initialized database",
    )
    parser.add_argument("--plan-only", action="store_true")
    args = parser.parse_args()

    root = pathlib.Path(args.database_root)
    verification_root = root / "verification"
    apply_chain = verification_root / "apply-chain.sql"
    plan, errors = canonical_plan(root)
    evidence: dict[str, Any] = {
        "started_at": time.time(),
        "status": "PLAN",
        "execution_model": "fresh-canonical-apply-chain-or-incremental-trusted-ledger",
        "plan": plan,
        "errors": errors,
    }

    manifest_out = pathlib.Path(args.manifest_out)
    if errors:
        evidence["status"] = "FAIL_STATIC"
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        for error in errors:
            print(f"FAIL: {error}", file=sys.stderr)
        return 2

    if args.plan_only:
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(json.dumps(evidence, indent=2, sort_keys=True))
        return 0

    required = [
        "BP_ENV",
        "BP_POSTGRES_HOST",
        "BP_POSTGRES_PORT",
        "BP_POSTGRES_DATABASE",
        "BP_MIGRATION_DATABASE_USER",
        "BP_MIGRATION_CREDENTIAL_FILE",
        *TIMEZONE_NAMES,
    ]
    missing = [name for name in required if not os.getenv(name, "").strip()]
    if missing:
        evidence["status"] = "FAIL_INPUT"
        evidence["errors"] = [f"missing required deployment input: {name}" for name in missing]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print("missing " + ",".join(missing), file=sys.stderr)
        return 2

    timezone_values = {name: os.environ[name].strip() for name in TIMEZONE_NAMES}
    placeholders = [name for name, value in timezone_values.items() if _placeholder(value)]
    if placeholders:
        evidence["status"] = "FAIL_INPUT"
        evidence["errors"] = [f"placeholder/invalid timezone deployment input: {name}" for name in placeholders]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print("timezone inputs must be explicit IANA values: " + ",".join(placeholders), file=sys.stderr)
        return 2

    environment = os.environ["BP_ENV"].strip()
    host = os.environ["BP_POSTGRES_HOST"]
    port = os.environ["BP_POSTGRES_PORT"]
    database = os.environ["BP_POSTGRES_DATABASE"]
    user = os.environ["BP_MIGRATION_DATABASE_USER"]
    credential_file = os.environ["BP_MIGRATION_CREDENTIAL_FILE"]
    migrations = list(plan["migrations"])
    evidence["database_target"] = {
        "environment": environment,
        "host": host,
        "port": port,
        "database": database,
        "user": user,
    }
    evidence["timezone_inputs_present"] = list(TIMEZONE_NAMES)
    evidence["migration_session_timeouts"] = {
        "lock_timeout": LOCK_TIMEOUT,
        "statement_timeout": STATEMENT_TIMEOUT,
        "delivery": "PGOPTIONS on actual psql migration session; incremental session also issues SET",
    }

    prior_ledger: dict[str, Any] | None = None
    prior_applied_count = 0
    if args.applied_ledger:
        prior_ledger, prior_applied_count, ledger_errors = load_and_validate_ledger(
            pathlib.Path(args.applied_ledger), migrations, environment, database
        )
        if ledger_errors:
            evidence["status"] = "FAIL_LEDGER"
            evidence["errors"] = ledger_errors
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            for error in ledger_errors:
                print(f"FAIL: {error}", file=sys.stderr)
            return 2
        evidence["prior_migration_ledger"] = prior_ledger

    state_sql = (
        "SELECT count(*)::text || '|' || "
        "(CASE WHEN to_regnamespace('app') IS NULL THEN 0 ELSE 1 END)::text || '|' || "
        "(CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname='db_migrator') THEN 1 ELSE 0 END)::text "
        "FROM pg_tables WHERE schemaname='public';"
    )
    try:
        preflight = run_psql(
            host,
            port,
            database,
            user,
            credential_file,
            sql=state_sql,
            tuples_only=True,
        )
    except (OSError, ValueError) as exc:
        evidence["status"] = "FAIL_PREFLIGHT"
        evidence["errors"] = [str(exc)]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(str(exc), file=sys.stderr)
        return 2

    if preflight.returncode:
        evidence["status"] = "FAIL_PREFLIGHT"
        evidence["stderr"] = _tail(preflight.stderr)
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(preflight.stderr, file=sys.stderr)
        return preflight.returncode

    try:
        table_text, schema_text, role_text = preflight.stdout.strip().split("|")
        public_table_count = int(table_text)
        app_schema_exists = bool(int(schema_text))
        migrator_role_exists = bool(int(role_text))
    except (ValueError, TypeError):
        evidence["status"] = "FAIL_PREFLIGHT"
        evidence["errors"] = [f"unexpected database-state preflight output: {preflight.stdout!r}"]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(evidence["errors"][0], file=sys.stderr)
        return 2

    clean_database = public_table_count == 0 and not app_schema_exists and not migrator_role_exists
    evidence["database_state_before"] = {
        "public_table_count": public_table_count,
        "app_schema_exists": app_schema_exists,
        "db_migrator_role_exists": migrator_role_exists,
        "classification": "CLEAN" if clean_database else "INITIALIZED_OR_PARTIAL",
    }

    if clean_database:
        if prior_ledger is not None and prior_applied_count != 0:
            evidence["status"] = "FAIL_STATE_MISMATCH"
            evidence["errors"] = ["database is clean but trusted ledger records applied migrations"]
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            print(evidence["errors"][0], file=sys.stderr)
            return 2

        apply_result = run_psql(
            host,
            port,
            database,
            user,
            credential_file,
            file=apply_chain,
            variables=timezone_values,
            migration_session=True,
        )
        evidence["execution_path"] = "FRESH_BOOTSTRAP"
        evidence["apply_chain_execution"] = {
            "file": "verification/apply-chain.sql",
            "returncode": apply_result.returncode,
            "stdout_tail": _tail(apply_result.stdout),
            "stderr_tail": _tail(apply_result.stderr),
        }
        if apply_result.returncode:
            evidence["status"] = "FAIL_APPLY_CHAIN"
            evidence["errors"] = [
                "fresh apply-chain failed; because per-file completion is not externally ledgered inside apply-chain, rebuild/recover the bootstrap database before retry"
            ]
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            print(apply_result.stderr, file=sys.stderr)
            return apply_result.returncode

        evidence["migration_ledger"] = build_ledger(
            migrations, len(migrations), environment, database
        )
        verification_results, verify_rc = run_post_verification(
            verification_root, host, port, database, user, credential_file
        )
        evidence["post_migration_verification"] = verification_results
        if verify_rc:
            evidence["status"] = "FAIL_VERIFY"
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            print(verification_results[-1]["stderr_tail"], file=sys.stderr)
            return verify_rc

        evidence["status"] = "PASS_FRESH_BOOTSTRAP"
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        return 0

    if prior_ledger is None:
        evidence["status"] = "FAIL_UNKNOWN_INITIALIZED_STATE"
        evidence["errors"] = [
            "database is initialized/partial but no trusted prior MIG24 deployment evidence ledger was supplied; refusing to guess applied migrations"
        ]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(evidence["errors"][0], file=sys.stderr)
        return 2
    if prior_applied_count == 0:
        evidence["status"] = "FAIL_UNKNOWN_INITIALIZED_STATE"
        evidence["errors"] = [
            "database is initialized/partial but supplied ledger records zero applied migrations"
        ]
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(evidence["errors"][0], file=sys.stderr)
        return 2

    pending = migrations[prior_applied_count:]
    evidence["execution_path"] = "INCREMENTAL_RELEASE"
    evidence["applied_count_before"] = prior_applied_count
    evidence["pending_migrations"] = [item["file"] for item in pending]

    if pending:
        script = incremental_session_sql(root, pending)
        incremental = run_psql(
            host,
            port,
            database,
            user,
            credential_file,
            input_text=script,
            variables=timezone_values,
            migration_session=True,
        )
        completed_count = completed_pending_count(incremental.stdout, pending)
        applied_after_attempt = prior_applied_count + completed_count
        evidence["incremental_execution"] = {
            "returncode": incremental.returncode,
            "completed_pending_migrations": [
                item["file"] for item in pending[:completed_count]
            ],
            "stdout_tail": _tail(incremental.stdout),
            "stderr_tail": _tail(incremental.stderr),
        }
        evidence["migration_ledger"] = build_ledger(
            migrations, applied_after_attempt, environment, database
        )
        if incremental.returncode:
            evidence["status"] = "FAIL_INCREMENTAL_APPLY"
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            print(incremental.stderr, file=sys.stderr)
            return incremental.returncode
        if completed_count != len(pending):
            evidence["status"] = "FAIL_INCREMENTAL_EVIDENCE"
            evidence["errors"] = [
                "incremental psql returned success without deterministic completion markers for every pending migration"
            ]
            evidence["completed_at"] = time.time()
            _write_json(manifest_out, evidence)
            print(evidence["errors"][0], file=sys.stderr)
            return 2
    else:
        evidence["migration_ledger"] = build_ledger(
            migrations, prior_applied_count, environment, database
        )

    verification_results, verify_rc = run_post_verification(
        verification_root, host, port, database, user, credential_file
    )
    evidence["post_migration_verification"] = verification_results
    if verify_rc:
        evidence["status"] = "FAIL_VERIFY"
        evidence["completed_at"] = time.time()
        _write_json(manifest_out, evidence)
        print(verification_results[-1]["stderr_tail"], file=sys.stderr)
        return verify_rc

    evidence["status"] = "PASS_INCREMENTAL" if pending else "PASS_NO_PENDING"
    evidence["completed_at"] = time.time()
    _write_json(manifest_out, evidence)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
