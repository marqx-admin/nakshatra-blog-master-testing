#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("sql_file", type=Path)
    parser.add_argument("--database-url", default=os.environ.get("BP_QA_DATABASE_URL"))
    args = parser.parse_args()
    if not args.database_url:
        print("BLOCKED BP_QA_DATABASE_URL is required for a real PostgreSQL QA probe")
        return 78
    if not shutil.which("psql"):
        print("BLOCKED psql is not installed in the QA execution environment")
        return 78
    if not args.sql_file.exists():
        print(f"BLOCKED SQL probe file does not exist: {args.sql_file}")
        return 78
    process = subprocess.run(
        ["psql", args.database_url, "-v", "ON_ERROR_STOP=1", "-X", "-f", str(args.sql_file)],
        text=True,
        capture_output=True,
        check=False,
    )
    sys.stdout.write(process.stdout)
    sys.stderr.write(process.stderr)
    return process.returncode


if __name__ == "__main__":
    raise SystemExit(main())
