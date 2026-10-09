from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).parents[2]
INF = ROOT / "infrastructure"
REGISTRY = json.loads((ROOT / "tooling/configs/site-registry.json").read_text())
LEGACY = {item["folder"] for item in REGISTRY}


def test_workspace_and_image_are_one_generic_public_application() -> None:
    workspace = yaml.safe_load((ROOT / "pnpm-workspace.yaml").read_text())
    assert workspace["packages"].count("apps/public-universal") == 1
    assert "apps/sites/*" in workspace["packages"]
    assert (ROOT / "apps/public-universal/package.json").exists()
    assert {path.name for path in (ROOT / "apps/sites").iterdir() if path.is_dir()} == LEGACY

    dockerfile = (INF / "images/public-universal.Dockerfile").read_text()
    assert "COPY apps/public-universal ./apps/public-universal" in dockerfile
    assert "pnpm --filter @bp/public-universal build" in dockerfile
    assert "USER 10001:10001" in dockerfile
    for forbidden in (
        "EXPECTED_SITE_KEY",
        "EXPECTED_DOMAIN",
        "BP_SITE_APP_KEY",
        "SITE_PACKAGE",
        "SITE_DIR",
        "SITE_NUMBER",
        "TENANT_ID",
    ):
        assert forbidden not in dockerfile


def test_coexistence_definitions_have_one_universal_and_fourteen_legacy_services() -> None:
    compose = yaml.safe_load((INF / "coolify/compose.yaml").read_text())
    services = compose["services"]
    assert [name for name in services if name == "public-universal"] == ["public-universal"]
    assert {f"site-{number:02d}" for number in range(1, 15)} <= services.keys()
    universal = services["public-universal"]
    assert universal["build"]["dockerfile"] == "infrastructure/images/public-universal.Dockerfile"
    assert universal["environment"]["BP_API_INTERNAL_ORIGIN"] == "http://api:8080"
    for forbidden in (
        "EXPECTED_SITE_KEY",
        "EXPECTED_DOMAIN",
        "BP_SITE_APP_KEY",
        "SITE_NUMBER",
        "TENANT_ID",
    ):
        assert forbidden not in universal["environment"]
    assert not any(
        name in services
        for name in ("site-15", "site-100", "public-universal-site-15", "public-universal-site-100")
    )

    base = INF / "templates/kubernetes/base"
    resources = yaml.safe_load((base / "kustomization.yaml").read_text())["resources"]
    assert resources.count("public-universal.yaml") == 1
    assert {f"site-{number:02d}.yaml" for number in range(1, 15)} <= set(resources)
    manifests = list(yaml.safe_load_all((base / "public-universal.yaml").read_text()))
    assert [item["kind"] for item in manifests] == ["Deployment", "Service"]
    assert manifests[0]["spec"]["template"]["spec"]["containers"][0]["env"] == [
        {"name": "BP_API_INTERNAL_ORIGIN", "value": "http://api:8080"}
    ]


def test_future_site_keys_need_no_new_environment_family_or_frontend_build() -> None:
    schema = yaml.safe_load((INF / "config/runtime-schema.yaml").read_text())
    variables = schema["variables"]
    assert re.fullmatch(variables["BP_SITE_APP_KEY"]["pattern"], "SITE-15")
    assert re.fullmatch(variables["BP_SITE_APP_KEY"]["pattern"], "SITE-100")
    assert re.fullmatch(variables["BP_SERVICE_NAME"]["pattern"], "public-universal")
    assert "BP_TEMP_DOMAIN_SUFFIX" in variables
    assert not any(
        name.startswith(("SITE_15_", "SITE_100_"))
        for name in schema["explicit_non_bp_deployment_inputs"]
    )
    for name in ("development", "test", "staging", "production"):
        template = (INF / f"config/{name}.env.example").read_text()
        assert "BP_TEMP_DOMAIN_SUFFIX=" in template
        assert "SITE_15_" not in template and "SITE_100_" not in template

    script = INF / "scripts/affected_apps.py"
    result = subprocess.run(
        [sys.executable, str(script), "apps/public-universal/src/site/page.tsx"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    assert json.loads(result.stdout)["affected"] == ["public-universal"]
    result = subprocess.run(
        [sys.executable, str(script), "packages/ts/api-client-public/src/generated.ts"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    assert set(json.loads(result.stdout)["affected"]) == LEGACY | {"public-universal"}


def test_legacy_seed_timezones_are_not_universal_runtime_inputs() -> None:
    coolify = yaml.safe_load((INF / "coolify/compose.yaml").read_text())
    assert {f"SITE_{number:02d}_TIMEZONE" for number in range(1, 15)} <= coolify["services"][
        "migrate"
    ]["environment"].keys()
    for name in ("api", "public-universal"):
        assert not any(key.startswith("SITE_") for key in coolify["services"][name]["environment"])
    local = yaml.safe_load((INF / "local/compose.yaml").read_text())["services"]
    assert not any(key.startswith("SITE_") for key in local["public-universal"]["environment"])
    assert "BP_TEMP_DOMAIN_SUFFIX" in local["api"]["environment"]
