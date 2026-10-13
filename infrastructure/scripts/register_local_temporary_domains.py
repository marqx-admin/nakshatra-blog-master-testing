"""Add missing localhost aliases without changing canonical domains or site data.

Explicit local maintenance only; provisioning handles newly created sites itself.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

from bp_domain.temporary_site_url import TemporarySiteUrlConfig, temporary_site_url


def read_runtime_credential(path: Path, default_username: str = "db_platform_runtime") -> tuple[str, str]:
    """Read the JSON, username:password and plain-password formats used by the API."""
    raw = path.expanduser().read_text(encoding="utf-8").strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        username = str(parsed.get("username") or default_username)
        password = str(parsed.get("password") or "")
    elif ":" in raw:
        username, password = raw.split(":", 1)
    else:
        username, password = default_username, raw
    if not username or not password:
        raise ValueError("local runtime credential file is empty or incomplete")
    return username, password


def plan_aliases(sites: list[dict], domains: list[dict], suffix: str) -> list[dict]:
    if suffix != "localhost" and not suffix.endswith(".localhost"):
        raise ValueError("local alias repair requires a .localhost suffix")
    indexed = {row["hostname"].lower().rstrip("."): row for row in domains}
    planned = []
    for site in sites:
        if site["status"] not in {"ACTIVE", "DISABLED"}:
            continue
        hostname = site["site_key"].lower() + "." + suffix
        temporary_site_url(hostname, TemporarySiteUrlConfig("http"))
        existing = indexed.get(hostname)
        if existing:
            if existing["site_id"] != site["site_id"] or not existing["is_active"]:
                raise ValueError(f"refusing conflicting/inactive alias: {hostname}")
            continue
        planned.append({"site_id": site["site_id"], "site_key": site["site_key"], "hostname": hostname})
    return planned


def reconcile(connection, suffix: str, *, apply: bool) -> list[dict]:
    with connection.transaction():
        sites = connection.execute("SELECT site_id::text,site_key,status FROM sites ORDER BY site_key FOR UPDATE").fetchall()
        domains = connection.execute("SELECT site_id::text,hostname,is_active FROM domains FOR UPDATE").fetchall()
        planned = plan_aliases(sites, domains, suffix)
        if apply:
            for row in planned:
                connection.execute(
                    "INSERT INTO domains(site_id,hostname,is_active,is_canonical) VALUES(%s,%s,true,false)",
                    (row["site_id"], row["hostname"]),
                )
        return planned


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Add missing aliases atomically; default is dry run")
    args = parser.parse_args()
    host = os.getenv("BP_POSTGRES_HOST", "127.0.0.1")
    if os.getenv("BP_ENV") not in {"development", "test"} or host not in {"localhost", "127.0.0.1", "::1"}:
        raise ValueError("local maintenance requires development/test and a loopback PostgreSQL host")
    suffix = os.getenv("BP_TEMP_DOMAIN_SUFFIX", "preview.localhost").lower().rstrip(".")
    # Validate the URL settings before accessing the database.
    temporary_site_url("validation." + suffix, TemporarySiteUrlConfig("http"))
    username, password = read_runtime_credential(Path(os.environ["BP_POSTGRES_PLATFORM_CREDENTIAL_FILE"]))
    with psycopg.connect(
        host=host, port=int(os.getenv("BP_POSTGRES_PORT", "5432")),
        dbname=os.getenv("BP_POSTGRES_DATABASE", "bp"),
        user=username, password=password, row_factory=dict_row,
    ) as connection:
        planned = reconcile(connection, suffix, apply=args.apply)
    print(json.dumps({"applied": args.apply, "missing_aliases": [{"site_key": row["site_key"], "hostname": row["hostname"]} for row in planned]}, indent=2))


if __name__ == "__main__":
    main()
