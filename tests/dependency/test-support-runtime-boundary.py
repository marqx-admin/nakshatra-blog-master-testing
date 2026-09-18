#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEST_SUPPORT_NAMES = {"bp-test-support", "bp_test_support"}
EXCLUDED = {ROOT / "tests", ROOT / "packages/python/bp-test-support"}


def under(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def main() -> int:
    violations: list[str] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(under(path, excluded) for excluded in EXCLUDED):
            continue
        if any(part in {"node_modules", ".git", ".venv"} for part in path.parts):
            continue
        rel = path.relative_to(ROOT)
        if path.name == "package.json":
            data = json.loads(path.read_text(encoding="utf-8"))
            for section in ("dependencies", "devDependencies", "optionalDependencies", "peerDependencies"):
                names = set((data.get(section) or {}).keys())
                if names & TEST_SUPPORT_NAMES:
                    violations.append(f"{rel}:{section}")
        elif path.name == "pyproject.toml":
            data = tomllib.loads(path.read_text(encoding="utf-8"))
            deps = [str(x).lower() for x in ((data.get("project") or {}).get("dependencies") or [])]
            if any(any(name in dep for name in TEST_SUPPORT_NAMES) for dep in deps):
                violations.append(f"{rel}:project.dependencies")
        elif path.suffix in {".py", ".pyi"}:
            text = path.read_text(encoding="utf-8", errors="ignore")
            if re.search(r"\b(?:from|import)\s+bp_test_support\b", text):
                violations.append(f"{rel}:python-import")
    if violations:
        print("FAIL production/runtime source depends on CHAT12 test support:")
        for item in violations:
            print(f"- {item}")
        return 1
    print("PASS bp-test-support is not a production/runtime dependency")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
