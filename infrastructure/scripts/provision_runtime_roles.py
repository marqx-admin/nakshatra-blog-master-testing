#!/usr/bin/env python3
"""Assign generated Coolify passwords to the canonical runtime database roles."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path


def credential(path_name: str, default_username: str) -> tuple[str, str]:
    raw = Path(os.environ[path_name]).read_text(encoding="utf-8").strip()
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        value = None
    if isinstance(value, dict):
        return str(value.get("username") or default_username), str(value.get("password") or "")
    if ":" in raw:
        return tuple(raw.split(":", 1))  # type: ignore[return-value]
    return default_username, raw


def main() -> int:
    migration_user, migration_password = credential("BP_MIGRATION_CREDENTIAL_FILE", "bp_owner")
    site_user, site_password = credential("BP_POSTGRES_SITE_CREDENTIAL_FILE", "db_site_runtime")
    platform_user, platform_password = credential(
        "BP_POSTGRES_PLATFORM_CREDENTIAL_FILE", "db_platform_runtime"
    )
    if not all((migration_password, site_password, platform_password)):
        raise RuntimeError("database credential files must contain non-empty passwords")
    env = os.environ.copy()
    env.update(
        PGPASSWORD=migration_password,
        BP_SITE_ROLE=site_user,
        BP_SITE_PASSWORD=site_password,
        BP_PLATFORM_ROLE=platform_user,
        BP_PLATFORM_PASSWORD=platform_password,
    )
    script = r"""
\set ON_ERROR_STOP on
\getenv site_role BP_SITE_ROLE
\getenv site_password BP_SITE_PASSWORD
\getenv platform_role BP_PLATFORM_ROLE
\getenv platform_password BP_PLATFORM_PASSWORD
ALTER ROLE :"site_role" PASSWORD :'site_password';
ALTER ROLE :"platform_role" PASSWORD :'platform_password';
"""
    result = subprocess.run(
        [
            "psql",
            "-X",
            "-h",
            os.environ["BP_POSTGRES_HOST"],
            "-p",
            os.environ["BP_POSTGRES_PORT"],
            "-U",
            migration_user,
            "-d",
            os.environ["BP_POSTGRES_DATABASE"],
        ],
        input=script,
        text=True,
        env=env,
        check=False,
    )
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
