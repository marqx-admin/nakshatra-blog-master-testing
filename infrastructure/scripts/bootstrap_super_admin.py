#!/usr/bin/env python3
"""Idempotently bootstrap the designated Super Admin and initial credential."""

from __future__ import annotations

import asyncio
import json
import os
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import quote_plus

import boto3
from sqlalchemy import create_engine, text

from bp_application.security import PasswordCodec, PasswordPolicy, SetWeakPasswordChecker
from bp_adapters.security_store import DynamoSecurityStateStore
from bp_domain.security import CredentialRecord


def _optional(name: str) -> str | None:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else None


def _read_platform_credential() -> tuple[str, str]:
    path_value = _optional("BP_POSTGRES_PLATFORM_CREDENTIAL_FILE")
    if not path_value:
        raise RuntimeError("BP_POSTGRES_PLATFORM_CREDENTIAL_FILE is required for Super Admin bootstrap")
    raw = Path(path_value).read_text(encoding="utf-8").strip()
    if not raw:
        raise RuntimeError("platform credential file is empty")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        username = str(parsed.get("username") or "db_platform_runtime")
        password = str(parsed.get("password") or "")
    elif ":" in raw:
        username, password = raw.split(":", 1)
    else:
        username, password = "db_platform_runtime", raw
    if not username or not password:
        raise RuntimeError("platform credential file is invalid")
    return username, password


def _postgres_url(username: str, password: str) -> str:
    host = os.environ["BP_POSTGRES_HOST"]
    port = os.getenv("BP_POSTGRES_PORT", "5432")
    database = os.environ["BP_POSTGRES_DATABASE"]
    sslmode = os.getenv("BP_POSTGRES_SSL_MODE", "require")
    return (
        f"postgresql+psycopg://{quote_plus(username)}:{quote_plus(password)}@"
        f"{host}:{port}/{quote_plus(database)}?sslmode={quote_plus(sslmode)}"
    )


async def _run() -> int:
    email = _optional("BP_BOOTSTRAP_SUPER_ADMIN_EMAIL")
    display_name = _optional("BP_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME")
    password_file = _optional("BP_BOOTSTRAP_SUPER_ADMIN_PASSWORD_FILE")
    if not email and not display_name and not password_file:
        print("SUPER_ADMIN_BOOTSTRAP_DISABLED")
        return 0
    if not email or not display_name or not password_file:
        raise RuntimeError(
            "Super Admin bootstrap requires BP_BOOTSTRAP_SUPER_ADMIN_EMAIL, "
            "BP_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME and BP_BOOTSTRAP_SUPER_ADMIN_PASSWORD"
        )

    normalized_email = email.strip().lower()
    if email != normalized_email:
        raise RuntimeError("BP_BOOTSTRAP_SUPER_ADMIN_EMAIL must already be normalized")
    if not display_name.strip():
        raise RuntimeError("BP_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME must be nonblank")

    password = Path(password_file).read_text(encoding="utf-8").rstrip("\n")
    PasswordPolicy(SetWeakPasswordChecker(set())).validate(password, email=normalized_email)
    username, db_password = _read_platform_credential()
    engine = create_engine(_postgres_url(username, db_password), pool_pre_ping=True)
    created_account = False
    try:
        with engine.begin() as connection:
            designated = connection.execute(
                text(
                    "SELECT admin_id,email_normalized FROM admin_accounts "
                    "WHERE is_super_admin=true FOR UPDATE"
                )
            ).fetchone()
            if designated is not None:
                if str(designated.email_normalized) != normalized_email:
                    raise RuntimeError(
                        "a different designated Super Admin already exists; "
                        "bootstrap will not replace it"
                    )
                admin_id = str(designated.admin_id)
                connection.execute(
                    text(
                        "UPDATE admin_accounts SET status='ACTIVE',disabled_at=NULL,updated_at=now() "
                        "WHERE admin_id=:admin_id"
                    ),
                    {"admin_id": admin_id},
                )
            else:
                existing = connection.execute(
                    text(
                        "SELECT admin_id FROM admin_accounts "
                        "WHERE email_normalized=:email FOR UPDATE"
                    ),
                    {"email": normalized_email},
                ).fetchone()
                if existing is None:
                    row = connection.execute(
                        text(
                            "INSERT INTO admin_accounts(email,display_name,status,is_super_admin) "
                            "VALUES (:email,:display_name,'ACTIVE',true) RETURNING admin_id"
                        ),
                        {"email": normalized_email, "display_name": display_name},
                    ).fetchone()
                    admin_id = str(row.admin_id)
                    created_account = True
                else:
                    admin_id = str(existing.admin_id)
                    connection.execute(
                        text(
                            "UPDATE admin_accounts SET display_name=:display_name,status='ACTIVE',"
                            "disabled_at=NULL,is_super_admin=true,updated_at=now() "
                            "WHERE admin_id=:admin_id"
                        ),
                        {"admin_id": admin_id, "display_name": display_name},
                    )
    finally:
        engine.dispose()

    dynamo = boto3.resource(
        "dynamodb",
        endpoint_url=os.environ["BP_SECURITY_STATE_ENDPOINT"],
        region_name=os.getenv("BP_SELF_HOSTED_REGION", "us-east-1"),
        aws_access_key_id=os.environ["BP_SECURITY_STATE_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["BP_SECURITY_STATE_SECRET_ACCESS_KEY"],
    )
    store = DynamoSecurityStateStore(
        table=dynamo.Table(os.environ["BP_SECURITY_STATE_TABLE"])
    )
    credential = await store.get_credential(admin_id)
    credential_state = "CREDENTIAL_EXISTING"
    if credential is None:
        codec = PasswordCodec()
        await store.put_credential(
            CredentialRecord(
                admin_id=admin_id,
                password_verifier=codec.hash(password),
                algorithm="argon2id",
                params={
                    "memory_kib": 65536,
                    "iterations": 3,
                    "parallelism": 1,
                    "salt_bytes": 16,
                    "hash_bytes": 32,
                },
                changed_at=datetime.now(UTC),
            )
        )
        credential_state = "CREDENTIAL_CREATED"

    print(
        "SUPER_ADMIN_BOOTSTRAP_READY "
        + ("ACCOUNT_CREATED " if created_account else "ACCOUNT_EXISTING ")
        + credential_state
    )
    return 0


def main() -> int:
    return asyncio.run(_run())


if __name__ == "__main__":
    raise SystemExit(main())
