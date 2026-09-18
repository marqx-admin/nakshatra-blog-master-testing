from __future__ import annotations

import ast
import sys
from pathlib import Path

ROOT = Path.cwd()
SRC_ROOTS = [ROOT / "apps/api/src", ROOT / "apps/worker/src"] + list((ROOT / "packages/python").glob("*/src"))
VIOLATIONS: list[str] = []


def layer(module: str) -> str:
    if module == "bp_domain" or module.startswith("bp_domain."):
        return "domain"
    if module == "bp_ports" or module.startswith("bp_ports."):
        return "ports"
    if module == "bp_application" or module.startswith("bp_application."):
        return "application"
    if module == "bp_background_contracts" or module.startswith("bp_background_contracts."):
        return "background"
    if module == "bp_api" or module.startswith("bp_api."):
        return "api"
    if module == "bp_worker" or module.startswith("bp_worker."):
        return "worker"
    if module == "bp_adapters" or module.startswith("bp_adapters."):
        return "adapter"
    if module == "bp_observability" or module.startswith("bp_observability."):
        return "observability"
    if module == "bp_test_support" or module.startswith("bp_test_support."):
        return "test_support"
    return "external"


def owner_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("packages/python/bp-domain/"):
        return "domain"
    if rel.startswith("packages/python/bp-ports/"):
        return "ports"
    if rel.startswith("packages/python/bp-application/"):
        return "application"
    if rel.startswith("packages/python/bp-background-contracts/"):
        return "background"
    if rel.startswith("packages/python/bp-adapters-"):
        return "adapter"
    if rel.startswith("packages/python/bp-observability/"):
        return "observability"
    if rel.startswith("packages/python/bp-test-support/"):
        return "test_support"
    if rel.startswith("apps/api/"):
        return "api"
    if rel.startswith("apps/worker/"):
        return "worker"
    return "external"

allowed = {
    "domain": {"domain", "external"},
    "ports": {"ports", "domain", "external"},
    "application": {"application", "ports", "domain", "external"},
    "background": {"background", "domain", "external"},
    "adapter": {"adapter", "ports", "domain", "background", "observability", "external"},
    "observability": {"observability", "external"},
    "test_support": {"test_support", "domain", "ports", "application", "background", "adapter", "observability", "external"},
    "api": {"api", "application", "ports", "domain", "adapter", "observability", "external"},
    "worker": {"worker", "application", "ports", "domain", "background", "adapter", "observability", "external"},
}

def imports_from(tree: ast.AST):
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                yield alias.name
        elif isinstance(node, ast.ImportFrom) and node.module:
            yield node.module

for src_root in SRC_ROOTS:
    if not src_root.exists():
        continue
    for file in src_root.rglob("*.py"):
        if "__pycache__" in file.parts:
            continue
        owner = owner_for(file)
        try:
            tree = ast.parse(file.read_text(encoding="utf-8"), filename=str(file))
        except SyntaxError as exc:
            VIOLATIONS.append(f"{file.relative_to(ROOT)}: syntax error: {exc}")
            continue
        for module in imports_from(tree):
            target = layer(module)
            if target not in allowed.get(owner, {"external"}):
                VIOLATIONS.append(f"{file.relative_to(ROOT)}: {owner} may not import {module} ({target})")
            if owner == "api" and target == "worker":
                VIOLATIONS.append(f"{file.relative_to(ROOT)}: API entrypoint may not import Worker entrypoint")
            if owner == "worker" and target == "api":
                VIOLATIONS.append(f"{file.relative_to(ROOT)}: Worker entrypoint may not import API entrypoint")

if VIOLATIONS:
    print(f"FAIL Python dependency boundaries ({len(VIOLATIONS)} violation(s))", file=sys.stderr)
    for item in VIOLATIONS:
        print(f"  {item}", file=sys.stderr)
    raise SystemExit(1)
print("PASS Python dependency boundaries (AST fallback scanner)")
