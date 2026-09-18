#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Runtime providers/frameworks explicitly out of scope for this platform. The scan is
# deliberately limited to dependency declarations/locks, not documentation prose.
BANNED = {
    "openai",
    "anthropic",
    "cohere",
    "mistralai",
    "groq",
    "ollama",
    "litellm",
    "langchain",
    "langchain-openai",
    "llama-index",
    "google-generativeai",
    "google-genai",
    "fal-client",
}


def normalize(name: str) -> str:
    return name.strip().lower().replace("_", "-")


def scan_package_json(path: Path) -> list[str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    hits: list[str] = []
    for section in ("dependencies", "devDependencies", "optionalDependencies", "peerDependencies"):
        for name in (data.get(section) or {}):
            if normalize(name) in BANNED:
                hits.append(f"{path.relative_to(ROOT)}:{section}:{name}")
    return hits


def scan_pyproject(path: Path) -> list[str]:
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    hits: list[str] = []
    project = data.get("project") or {}
    for item in project.get("dependencies") or []:
        name = item.split(";", 1)[0].split("[", 1)[0]
        for marker in ("==", ">=", "<=", "~=", "!=", ">", "<", " "):
            name = name.split(marker, 1)[0]
        if normalize(name) in BANNED:
            hits.append(f"{path.relative_to(ROOT)}:project.dependencies:{item}")
    for group_name, items in (data.get("dependency-groups") or {}).items():
        for item in items or []:
            name = str(item).split(";", 1)[0].split("[", 1)[0]
            for marker in ("==", ">=", "<=", "~=", "!=", ">", "<", " "):
                name = name.split(marker, 1)[0]
            if normalize(name) in BANNED:
                hits.append(f"{path.relative_to(ROOT)}:dependency-groups.{group_name}:{item}")
    return hits


def scan_uv_lock(path: Path) -> list[str]:
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    hits: list[str] = []
    for package in data.get("package") or []:
        name = normalize(str(package.get("name", "")))
        if name in BANNED:
            hits.append(f"{path.relative_to(ROOT)}:package:{name}")
    return hits



def scan_pnpm_lock(path: Path) -> list[str]:
    """Catch prohibited packages that could be present only in the JS lock graph."""
    text = path.read_text(encoding="utf-8", errors="replace")
    hits: list[str] = []
    for name in sorted(BANNED):
        escaped = re.escape(name)
        patterns = (
            rf"(?m)^\s{{0,8}}['\"]?{escaped}['\"]?\s*:\s*$",
            rf"(?m)^\s*/?{escaped}(?:@|/)",
            rf"(?m)^\s*['\"]?/?{escaped}@",
        )
        if any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns):
            hits.append(f"{path.relative_to(ROOT)}:locked-package:{name}")
    return hits

def main() -> int:
    hits: list[str] = []
    for path in ROOT.rglob("package.json"):
        if "node_modules" not in path.parts:
            hits.extend(scan_package_json(path))
    for path in ROOT.rglob("pyproject.toml"):
        hits.extend(scan_pyproject(path))
    if (ROOT / "uv.lock").exists():
        hits.extend(scan_uv_lock(ROOT / "uv.lock"))
    if (ROOT / "pnpm-lock.yaml").exists():
        hits.extend(scan_pnpm_lock(ROOT / "pnpm-lock.yaml"))
    if hits:
        print("FAIL prohibited AI/LLM runtime dependency declarations found:")
        for hit in sorted(hits):
            print(f"- {hit}")
        return 1
    print("PASS no prohibited OpenAI/LLM/AI-provider runtime dependency is declared in package manifests or dependency locks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
