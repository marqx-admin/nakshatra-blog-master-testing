#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import subprocess
import sys

import yaml

ROOT = pathlib.Path(__file__).resolve().parents[2]
INF = ROOT / "infrastructure"
errors = []
for p in INF.rglob("*.yaml"):
    try:
        list(yaml.safe_load_all(p.read_text()))
    except Exception as e:
        errors.append(f"YAML {p.relative_to(ROOT)}: {e}")
compose = yaml.safe_load((INF / "local/compose.yaml").read_text())
services = compose["services"]
for name in [
    "postgres",
    "redis-control",
    "redis-broker",
    "opensearch",
    "minio",
    "security-state",
    "vault-dev",
    "smtp-sink",
    "otel-collector",
    "api",
    "worker",
    "admin",
    "site",
    "public-universal",
    "migrate",
]:
    if name not in services:
        errors.append(f"compose missing {name}")
if services.get("site", {}).get("profiles") != ["app-site"]:
    errors.append("generic site must be opt-in app-site profile")
if services.get("public-universal", {}).get("profiles") != ["app-public-universal"]:
    errors.append("Universal public frontend must be opt-in app-public-universal profile")
site_yamls = list((INF / "templates/kubernetes/base").glob("site-[0-9][0-9].yaml"))
if len(site_yamls) != 14:
    errors.append(f"expected 14 legacy reference workloads, got {len(site_yamls)}")
base = INF / "templates/kubernetes/base"
resources = yaml.safe_load((base / "kustomization.yaml").read_text())["resources"]
if resources.count("public-universal.yaml") != 1:
    errors.append("Kubernetes base must register exactly one Universal frontend workload")
if not (base / "public-universal.yaml").exists():
    errors.append("Kubernetes Universal frontend manifest missing")
coolify = yaml.safe_load((INF / "coolify/compose.yaml").read_text())["services"]
if sum(name == "public-universal" for name in coolify) != 1:
    errors.append("Coolify compose must contain one Universal frontend service")
if any(f"site-{i:02d}" not in coolify for i in range(1, 15)):
    errors.append("Coolify compose must retain all 14 legacy public services")
if (
    coolify.get("public-universal", {}).get("build", {}).get("dockerfile")
    != "infrastructure/images/public-universal.Dockerfile"
):
    errors.append("Coolify Universal service must use its generic Dockerfile")
for p in (INF / "images").glob("*.Dockerfile"):
    text = p.read_text()
    if p.name != "migrate.Dockerfile" and "USER 10001" not in text:
        errors.append(f"{p.name}: non-root USER 10001 missing")
for filename, project, module in [
    ("api.Dockerfile", "bp-api", "bp_api"),
    ("worker.Dockerfile", "bp-worker", "bp_worker"),
]:
    text = (INF / "images" / filename).read_text()
    if "ghcr.io/astral-sh/uv:0.12.11" not in text:
        errors.append(f"{filename}: uv must be pinned to 0.12.11")
    expected = f"uv sync --frozen --no-dev --no-editable --package {project}"
    if expected not in text:
        errors.append(f"{filename}: missing non-editable production sync")
    command = (
        'CMD ["python", "/workspace/bin/api_start.py"]'
        if project == "bp-api"
        else f'CMD ["python", "-m", "{module}"]'
    )
    if command not in text:
        errors.append(f"{filename}: logical entrypoint changed")
    if "PYTHONPATH=" in text:
        errors.append(f"{filename}: PYTHONPATH workaround prohibited")
api_text = (INF / "images/api.Dockerfile").read_text()
worker_text = (INF / "images/worker.Dockerfile").read_text()
for forbidden in [
    "/workspace/apps/api /workspace/apps/api",
    "/workspace/packages/python /workspace/packages/python",
]:
    if forbidden in api_text:
        errors.append(f"api.Dockerfile: runtime source copy prohibited: {forbidden}")
for forbidden in [
    "/workspace/apps/worker /workspace/apps/worker",
    "/workspace/packages/python /workspace/packages/python",
]:
    if forbidden in worker_text:
        errors.append(f"worker.Dockerfile: runtime source copy prohibited: {forbidden}")
profiles = {"publish", "media", "search", "sitemap", "cache", "maintenance", "scheduler"}
schema = yaml.safe_load((INF / "config/runtime-schema.yaml").read_text())
if set(schema["variables"]["BP_WORKER_PROFILE"]["enum"]) != profiles:
    errors.append("runtime schema Worker profiles changed")
worker_yamls = {
    p.stem.removeprefix("worker-")
    for p in (INF / "templates/kubernetes/base").glob("worker-*.yaml")
}
if worker_yamls != profiles:
    errors.append(f"Kubernetes Worker profiles mismatch: {sorted(worker_yamls)}")
for p in INF.rglob("*.yaml"):
    text = p.read_text()
    if "\t" in text:
        errors.append(f"{p}: tabs forbidden")
for p in [
    INF / "config/development.env.example",
    INF / "config/test.env.example",
    INF / "config/staging.env.example",
    INF / "config/production.env.example",
]:
    cp = subprocess.run(
        [
            sys.executable,
            str(INF / "scripts/validate_config.py"),
            "--schema",
            str(INF / "config/runtime-schema.yaml"),
            "--env-file",
            str(p),
            "--consumer",
            "api",
        ],
        capture_output=True,
        text=True,
    )
    if cp.returncode:
        errors.append(f"{p.name}: {cp.stdout}{cp.stderr}")
if errors:
    [print("FAIL:", x) for x in errors]
    sys.exit(1)
print("PASS: CHAT11 YAML/config/compose/image/Kubernetes static validation")
