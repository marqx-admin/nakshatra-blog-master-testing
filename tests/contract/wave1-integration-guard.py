#!/usr/bin/env python3
"""Wave-1 integrated-candidate architecture/contract guard.

This replaces the CHAT01-only empty-placeholder assertion once later-chat owned
paths are intentionally populated. It does not execute PostgreSQL/Docker/cloud QA.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXPECTED_OPENAPI_SHA = "f0d55354f79d7ff43385f5e761670b3cc8bf30a0a19de1623777be83f23ac172"
EXPECTED_SITES = [
    "site-01-whats-your-rashi",
    "site-02-apki-rashi",
    "site-03-daily-rashi-360",
    "site-04-zodiac-daily",
    "site-05-daily-horoscope-360",
    "site-06-my-horoscope-360",
    "site-07-astro-today-360",
    "site-08-apki-kundli",
    "site-09-match-your-kundli",
    "site-10-apka-nakshatra",
    "site-11-janiye-panchang",
    "site-12-rashi-remedies",
    "site-13-apka-pandit",
    "site-14-vastu-shastra-360",
]

failures: list[str] = []
passes: list[str] = []

def check(name: str, condition: bool, detail: str = "") -> None:
    if condition:
        passes.append(name)
        print(f"PASS {name}" + (f" — {detail}" if detail else ""))
    else:
        failures.append(name + (f": {detail}" if detail else ""))
        print(f"FAIL {name}" + (f" — {detail}" if detail else ""))

# One Hybrid Monorepo / deployable application estate.
site_root = ROOT / "apps" / "sites"
actual_sites = sorted(p.name for p in site_root.iterdir() if p.is_dir()) if site_root.exists() else []
check("exact 14 canonical public application folders", actual_sites == EXPECTED_SITES, f"found={len(actual_sites)}")
check("single Admin application folder", (ROOT / "apps/admin").is_dir())
check("single API application folder", (ROOT / "apps/api").is_dir())
check("single Worker application folder", (ROOT / "apps/worker").is_dir())

# Canonical OpenAPI source custody.
openapi = ROOT / "contracts/http/BLOG-DOC-15_openapi_v1.0-RC9.yaml"
actual_sha = hashlib.sha256(openapi.read_bytes()).hexdigest() if openapi.is_file() else "MISSING"
check("owner-approved RC9 OpenAPI byte identity", actual_sha == EXPECTED_OPENAPI_SHA, actual_sha)

# DOC-08 source baseline counts (source verification only, not live PostgreSQL PASS).
contract_path = ROOT / "database/verification/doc08-contract.json"
contract = json.loads(contract_path.read_text(encoding="utf-8")) if contract_path.is_file() else {}
tables = contract.get("tables", {})
site_tables = sorted(k for k, v in tables.items() if v.get("scope") == "SITE")
global_tables = sorted(k for k, v in tables.items() if v.get("scope") != "SITE")
check("DOC-08 contract has 33 canonical tables", len(tables) == 33, f"found={len(tables)}")
check("DOC-08 contract has 20 SITE-owned tables", len(site_tables) == 20, f"found={len(site_tables)}")
check("DOC-08 contract has 13 GLOBAL/system tables", len(global_tables) == 13, f"found={len(global_tables)}")
rls_list = ROOT / "database/rls/site_owned_tables.txt"
rls_tables = [x.strip() for x in rls_list.read_text(encoding="utf-8").splitlines() if x.strip() and not x.lstrip().startswith("#")] if rls_list.is_file() else []
check("RLS registry covers the exact 20 SITE tables", sorted(rls_tables) == site_tables, f"found={len(rls_tables)}")
migrations = sorted((ROOT / "database/migrations").glob("[0-9][0-9][0-9][0-9]_DB-MIG-*.sql"))
check("exactly 19 ordered migration source files", len(migrations) == 19 and [p.name[:4] for p in migrations] == [f"{i:04d}" for i in range(1, 20)], f"found={len(migrations)}")
perms = contract.get("permission_registry", [])
check("DOC-08 contract has 69 fixed permissions", len(perms) == 69, f"found={len(perms)}")
site_seeds = (ROOT / "database/seeds/initial-sites.sql").read_text(encoding="utf-8") if (ROOT / "database/seeds/initial-sites.sql").is_file() else ""
check("initial seed identifies all 14 canonical SITE keys", all(f"SITE-{i:02d}" in site_seeds for i in range(1, 15)))

# No transport wrappers / ownership-induced duplicate Python import trees.
for wrapper in ("CHAT11_HANDOFF", "NAKSHATRA_CHAT02_HANDOFF", "NAKSHATRA_CHAT03_HANDOFF", "NAKSHATRA_CHAT12_QA_FOUNDATION_HANDOFF"):
    check(f"transport wrapper absent: {wrapper}", not (ROOT / wrapper).exists())
for pkg, forbidden in (
    ("bp-adapters-security-store", "bp_adapters_security_store"),
    ("bp-adapters-secrets", "bp_adapters_secrets"),
    ("bp-adapters-mail", "bp_adapters_mail"),
):
    base = ROOT / "packages/python" / pkg / "src"
    check(f"canonical bp_adapters namespace only for {pkg}", not (base / forbidden).exists())

# CHAT03 tests are preserved even though CHAT12 is continuing owner of tests/*.
chat03_tests = list((ROOT / "tests").rglob("test_chat03*.py"))
check("CHAT03 specialist tests preserved under shared tests tree", len(chat03_tests) >= 8, f"files={len(chat03_tests)}")

# Production manifests/locks must not introduce AI/LLM providers.
patterns = re.compile(r"(?i)(openai|anthropic|langchain|llamaindex|cohere|gemini|vertexai|bedrock-runtime|huggingface_hub|transformers)")
manifest_paths = [ROOT / "package.json", ROOT / "pyproject.toml", ROOT / "uv.lock", ROOT / "pnpm-lock.yaml"]
manifest_text = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in manifest_paths if p.is_file())
check("no OpenAI/LLM/AI provider runtime dependency in root manifests/locks", patterns.search(manifest_text) is None)

# Integration bridge exists without adding a second package tree.
ports = ROOT / "packages/python/bp-adapters-postgres/src/bp_adapters/postgres/ports.py"
ports_text = ports.read_text(encoding="utf-8") if ports.is_file() else ""
check("CHAT02↔CHAT03 transaction-port bridge present", "PostgresSiteTransactionPort" in ports_text and "PostgresGlobalTransactionPort" in ports_text)

if failures:
    print(f"FAIL Wave-1 integration guard: {len(failures)} failure(s)")
    for failure in failures:
        print(f"  - {failure}")
    sys.exit(1)
print(f"PASS Wave-1 integration guard: {len(passes)} checks")
