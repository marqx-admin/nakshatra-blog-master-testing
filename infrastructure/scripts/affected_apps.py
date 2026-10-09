#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import pathlib

SITE_PREFIX = "apps/sites/"
ROOT = pathlib.Path(__file__).resolve().parents[2]
# This fixed registry is the retained legacy build/rollback estate, not tenants.
LEGACY_REFERENCE_APPS = [
    item["folder"] for item in json.loads((ROOT / "tooling/configs/site-registry.json").read_text())
]
UNIVERSAL_FRONTEND = "public-universal"


def affected(paths: list[str]):
    out = set()
    for p in paths:
        if p.startswith(SITE_PREFIX):
            seg = p.split("/")[2]
            out.add(seg)
        elif p.startswith("apps/public-universal/"):
            out.add(UNIVERSAL_FRONTEND)
        elif p.startswith("apps/admin/"):
            out.add("admin")
        elif (
            p.startswith("apps/api/")
            or p.startswith("packages/python/bp-domain")
            or p.startswith("packages/python/bp-application")
            or p.startswith("packages/python/bp-ports")
        ):
            out.add("api")
        elif p.startswith("apps/worker/") or p.startswith(
            "packages/python/bp-background-contracts"
        ):
            out.add("worker")
        elif p.startswith("database/"):
            out.update({"api", "worker", "migrate"})
        elif p.startswith(("packages/ts/public-contracts", "packages/ts/api-client-public")):
            out.update([*LEGACY_REFERENCE_APPS, UNIVERSAL_FRONTEND])
        elif p.startswith("packages/ts/presentation-catalogue"):
            out.update(["admin", UNIVERSAL_FRONTEND])
        elif p.startswith("packages/ts/api-contract"):
            out.update([*LEGACY_REFERENCE_APPS, UNIVERSAL_FRONTEND, "admin"])
        elif p.startswith("packages/ts/api-client-admin"):
            out.add("admin")
        elif p.startswith("contracts/http/"):
            out.update([*LEGACY_REFERENCE_APPS, UNIVERSAL_FRONTEND, "admin", "api"])
        elif p.startswith("infrastructure/") or p in {
            "package.json",
            "pnpm-lock.yaml",
            "pnpm-workspace.yaml",
            "uv.lock",
            "pyproject.toml",
            "turbo.json",
        }:
            out.update(
                [*LEGACY_REFERENCE_APPS, UNIVERSAL_FRONTEND, "admin", "api", "worker", "migrate"]
            )
    return sorted(out)


ap = argparse.ArgumentParser()
ap.add_argument("paths", nargs="*")
a = ap.parse_args()
print(json.dumps({"affected": affected(a.paths)}, indent=2))
