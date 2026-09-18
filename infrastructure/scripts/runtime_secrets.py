#!/usr/bin/env python3
"""Materialize Coolify secret environment values as process-private files."""

from __future__ import annotations

import os
import sys
from pathlib import Path

MAPPINGS = {
    "BP_POSTGRES_SITE_CREDENTIAL": "BP_POSTGRES_SITE_CREDENTIAL_FILE",
    "BP_POSTGRES_PLATFORM_CREDENTIAL": "BP_POSTGRES_PLATFORM_CREDENTIAL_FILE",
    "BP_POSTGRES_MIGRATION_CREDENTIAL": "BP_MIGRATION_CREDENTIAL_FILE",
    "BP_SMTP_CREDENTIAL": "BP_SMTP_CREDENTIAL_FILE",
}


def main() -> int:
    command = sys.argv[1:]
    if command[:1] == ["--"]:
        command = command[1:]
    if not command:
        raise RuntimeError("runtime_secrets requires a command after --")

    root = Path(os.getenv("BP_RUNTIME_SECRET_ROOT", "/run/secrets/bp"))
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    for value_name, path_name in MAPPINGS.items():
        value = os.environ.pop(value_name, "").strip()
        configured_path = os.getenv(path_name, "").strip()
        if not value:
            continue
        path = Path(configured_path) if configured_path else root / value_name.lower()
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        path.write_text(value + "\n", encoding="utf-8")
        path.chmod(0o600)
        os.environ[path_name] = str(path)
    os.execvpe(command[0], command, os.environ)
    return 127


if __name__ == "__main__":
    raise SystemExit(main())
