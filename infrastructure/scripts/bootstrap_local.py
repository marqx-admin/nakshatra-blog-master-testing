from __future__ import annotations

"""Provision only the external credentials and security table for local development."""

import argparse
import base64
from dataclasses import dataclass
from datetime import UTC, datetime
import json
import os
from pathlib import Path
import secrets
from typing import Any
from urllib.parse import urlparse

import boto3


DEFAULT_ROOT = Path.home() / ".nakshatra-blog-local"
DEFAULT_TABLE = "bp-security-state-dev"
DEFAULT_SECURITY_ENDPOINT = "http://127.0.0.1:8000"


@dataclass(frozen=True)
class LocalBootstrapConfig:
    postgres_host: str
    postgres_port: int
    postgres_database: str
    migration_credential_file: Path
    secret_root: Path
    security_endpoint: str
    security_table: str
    security_region: str
    admin_email: str
    admin_display_name: str
    admin_credential_file: Path
    media_endpoint: str
    media_bucket: str
    media_access_key_id: str
    media_secret_access_key: str
    local_envelope_key: str
    local_envelope_hmac_key: str
    admin_mfa_secret: str


def _credential_file(path: Path, username: str) -> str:
    if path.exists():
        raw = path.read_text(encoding="utf-8").strip()
        if not raw:
            raise RuntimeError(f"credential file is empty: {path}")
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = None
        if isinstance(parsed, dict):
            if parsed.get("username") != username or not parsed.get("password"):
                raise RuntimeError(f"credential file has unexpected format: {path}")
            return str(parsed["password"])
        if ":" in raw:
            file_username, password = raw.split(":", 1)
            if file_username != username or not password:
                raise RuntimeError(f"credential file has unexpected format: {path}")
            return password
        return raw

    password = secrets.token_urlsafe(32)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"username": username, "password": password}) + "\n", encoding="utf-8")
    path.chmod(0o600)
    return password


def _admin_password_file(path: Path, email: str) -> str:
    if path.exists():
        raw = path.read_text(encoding="utf-8").strip()
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"admin credential file must be JSON: {path}") from exc
        if not isinstance(parsed, dict) or parsed.get("email") != email or not parsed.get("password"):
            raise RuntimeError(f"admin credential file has unexpected format: {path}")
        return str(parsed["password"])

    password = secrets.token_urlsafe(32)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"email": email, "password": password}) + "\n", encoding="utf-8")
    path.chmod(0o600)
    return password


def _postgres_dsn(config: LocalBootstrapConfig) -> str:
    return f"host={config.postgres_host} port={config.postgres_port} dbname={config.postgres_database}"


def provision_postgres_roles(config: LocalBootstrapConfig) -> tuple[Path, Path]:
    import psycopg
    from psycopg import sql

    site_path = config.secret_root / "postgres-site-runtime"
    platform_path = config.secret_root / "postgres-platform-runtime"
    site_password = _credential_file(site_path, "db_site_runtime")
    platform_password = _credential_file(platform_path, "db_platform_runtime")
    migration_raw = config.migration_credential_file.read_text(encoding="utf-8").strip()
    try:
        parsed = json.loads(migration_raw)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        migration_user = str(parsed.get("username") or "bp_owner")
        migration_password = str(parsed.get("password") or "")
    elif ":" in migration_raw:
        migration_user, migration_password = migration_raw.split(":", 1)
    else:
        migration_user, migration_password = "bp_owner", migration_raw
    if not migration_password:
        raise RuntimeError("migration credential file has no password")

    dsn = f"{_postgres_dsn(config)} user={migration_user} password={migration_password}"
    with psycopg.connect(dsn) as connection:
        with connection.cursor() as cursor:
            for role, password in (("db_site_runtime", site_password), ("db_platform_runtime", platform_password)):
                cursor.execute(
                    sql.SQL("ALTER ROLE {} PASSWORD {}").format(
                        sql.Identifier(role), sql.Literal(password)
                    )
                )
    return site_path, platform_path


def provision_local_admin(config: LocalBootstrapConfig, password: str) -> str:
    import asyncio
    import boto3
    import psycopg
    from bp_adapters.security_store import DynamoSecurityStateStore
    from bp_application import PasswordCodec
    from bp_adapters.secrets import LocalEnvelopeSecretProvider
    from bp_domain.security import AccountState, CredentialRecord, MfaRecord

    migration_raw = config.migration_credential_file.read_text(encoding="utf-8").strip()
    try:
        parsed = json.loads(migration_raw)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        migration_user = str(parsed.get("username") or "bp_owner")
        migration_password = str(parsed.get("password") or "")
    elif ":" in migration_raw:
        migration_user, migration_password = migration_raw.split(":", 1)
    else:
        migration_user, migration_password = "bp_owner", migration_raw

    dsn = f"{_postgres_dsn(config)} user={migration_user} password={migration_password}"
    with psycopg.connect(dsn) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT admin_id,status,is_super_admin FROM admin_accounts WHERE email_normalized=%s",
                (config.admin_email,),
            )
            existing = cursor.fetchone()
            if existing is None:
                cursor.execute(
                    "INSERT INTO admin_accounts(email,display_name,status,is_super_admin) "
                    "VALUES (%s,%s,'ACTIVE',true) RETURNING admin_id",
                    (config.admin_email, config.admin_display_name),
                )
                admin_id = str(cursor.fetchone()[0])
            else:
                admin_id, status, is_super_admin = map(str, existing)
                if status != AccountState.ACTIVE:
                    raise RuntimeError("local Super Admin exists but is not ACTIVE")
                if is_super_admin.lower() != "true":
                    cursor.execute("UPDATE admin_accounts SET is_super_admin=true,updated_at=now() WHERE admin_id=%s", (admin_id,))

            content_editor_permissions = {
                "dashboard.view", "posts.view", "posts.create", "posts.edit", "posts.duplicate",
                "posts.revisions.view", "posts.preview", "posts.revisions.restore", "posts.publish",
                "posts.schedule", "posts.archive", "posts.restore", "posts.trash", "media.view",
                "media.upload", "media.edit", "media.replace", "media.delete", "authors.view",
                "categories.view", "seo.view", "seo.edit", "calendar.view", "search.view",
            }
            full_manager_permissions = content_editor_permissions | {
                "posts.delete", "categories.create", "categories.edit", "categories.delete",
                "authors.create", "authors.edit", "authors.retire", "navigation.view",
                "navigation.manage", "redirects.view", "redirects.create", "redirects.edit",
                "redirects.delete", "search.reindex", "site_settings.view", "site_settings.edit",
            }
            site_roles = []
            for role_name, role_permissions in (
                ("Content Editor", content_editor_permissions),
                ("Full Website Manager", full_manager_permissions),
            ):
                cursor.execute(
                    "INSERT INTO roles(scope,name,description,created_by_admin_id) VALUES ('SITE',%s,%s,%s) "
                    "ON CONFLICT (scope,name_normalized) DO UPDATE SET status='ACTIVE',retired_at=NULL,updated_at=now() RETURNING role_id",
                    (role_name, "System-managed website access level", admin_id),
                )
                role_id = str(cursor.fetchone()[0])
                site_roles.append(role_id)
                cursor.execute("DELETE FROM role_permissions WHERE role_id=%s", (role_id,))
                for permission_key in sorted(role_permissions):
                    cursor.execute(
                        "INSERT INTO role_permissions(role_id,permission_key,scope) VALUES (%s,%s,'SITE')",
                        (role_id, permission_key),
                    )
            cursor.execute("SELECT site_id FROM sites WHERE status='ACTIVE'")
            site_ids = [str(row[0]) for row in cursor.fetchall()]
            if not site_roles or not site_ids:
                raise RuntimeError("system access levels or sites are not seeded")
            for site_id in site_ids:
                cursor.execute(
                    "INSERT INTO account_site_assignments(admin_id,site_id,assigned_by_admin_id) "
                    "VALUES (%s,%s,%s) ON CONFLICT (admin_id,site_id) DO NOTHING",
                    (admin_id, site_id, admin_id),
                )

    dynamo = boto3.resource(
        "dynamodb",
        endpoint_url=config.security_endpoint,
        region_name=config.security_region,
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
    state = DynamoSecurityStateStore(table=dynamo.Table(config.security_table))
    verifier = PasswordCodec().hash(password)
    async def provision_security_state() -> None:
        await state.put_credential(
            CredentialRecord(
                admin_id=admin_id,
                password_verifier=verifier,
                algorithm="argon2id",
                params={"memory_kib": 65536, "iterations": 3, "parallelism": 1, "salt_bytes": 16, "hash_bytes": 32},
                changed_at=datetime.now(UTC),
            )
        )
        padded = config.admin_mfa_secret + "=" * (-len(config.admin_mfa_secret) % 8)
        mfa_secret = base64.b32decode(padded, casefold=True)
        secrets_provider = LocalEnvelopeSecretProvider(
            key=config.local_envelope_key.encode("ascii"),
            hmac_key=bytes.fromhex(config.local_envelope_hmac_key),
        )
        await state.put_mfa(MfaRecord(
            admin_id=admin_id,
            encrypted_secret=await secrets_provider.encrypt(mfa_secret, "MFA_TOTP"),
            enabled=True,
            enabled_at=datetime.now(UTC),
        ))
    asyncio.run(provision_security_state())
    return admin_id


def _expected_table_definition(table_name: str) -> dict[str, Any]:
    return {
        "TableName": table_name,
        "KeySchema": [
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "sk", "KeyType": "RANGE"},
        ],
        "AttributeDefinitions": [
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
            {"AttributeName": "gsi_admin_pk", "AttributeType": "S"},
            {"AttributeName": "gsi_admin_sk", "AttributeType": "S"},
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexName": "gsi_admin",
                "KeySchema": [
                    {"AttributeName": "gsi_admin_pk", "KeyType": "HASH"},
                    {"AttributeName": "gsi_admin_sk", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }
        ],
    }


def _normalized_schema(description: dict[str, Any]) -> dict[str, Any]:
    indexes = []
    for index in description.get("GlobalSecondaryIndexes") or []:
        indexes.append(
            {
                "IndexName": index.get("IndexName"),
                "KeySchema": index.get("KeySchema"),
                "Projection": index.get("Projection"),
            }
        )
    return {
        "KeySchema": description.get("KeySchema"),
        "AttributeDefinitions": description.get("AttributeDefinitions"),
        "GlobalSecondaryIndexes": indexes,
    }


def _verify_table(table: Any, table_name: str) -> None:
    description = table.meta.client.describe_table(TableName=table_name)["Table"]
    expected = _expected_table_definition(table_name)
    if _normalized_schema(description) != _normalized_schema(expected):
        raise RuntimeError(f"security-state table has incompatible schema: {table_name}")
    ttl = table.meta.client.describe_time_to_live(TableName=table_name).get("TimeToLiveDescription", {})
    if ttl.get("AttributeName") != "ttl_epoch" or ttl.get("TimeToLiveStatus") != "ENABLED":
        raise RuntimeError(f"security-state table TTL must be enabled on ttl_epoch: {table_name}")


def ensure_security_table(config: LocalBootstrapConfig) -> None:
    parsed = urlparse(config.security_endpoint)
    if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost"}:
        raise RuntimeError("local security bootstrap requires an HTTP localhost DynamoDB endpoint")
    client = boto3.client(
        "dynamodb",
        endpoint_url=config.security_endpoint,
        region_name=config.security_region,
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
    resource = boto3.resource(
        "dynamodb",
        endpoint_url=config.security_endpoint,
        region_name=config.security_region,
        aws_access_key_id="local",
        aws_secret_access_key="local",
    )
    names = client.list_tables().get("TableNames", [])
    if config.security_table not in names:
        client.create_table(**_expected_table_definition(config.security_table), BillingMode="PAY_PER_REQUEST")
        client.get_waiter("table_exists").wait(TableName=config.security_table)
        client.update_time_to_live(
            TableName=config.security_table,
            TimeToLiveSpecification={"AttributeName": "ttl_epoch", "Enabled": True},
        )
    _verify_table(resource.Table(config.security_table), config.security_table)


def ensure_media_bucket(config: LocalBootstrapConfig) -> None:
    parsed = urlparse(config.media_endpoint)
    if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost"}:
        raise RuntimeError("local media bootstrap requires an HTTP localhost object-storage endpoint")
    client = boto3.client(
        "s3",
        endpoint_url=config.media_endpoint,
        region_name=config.security_region,
        aws_access_key_id=config.media_access_key_id,
        aws_secret_access_key=config.media_secret_access_key,
    )
    names = {item["Name"] for item in client.list_buckets().get("Buckets", [])}
    if config.media_bucket not in names:
        client.create_bucket(Bucket=config.media_bucket)


def _config_from_args(args: argparse.Namespace) -> LocalBootstrapConfig:
    return LocalBootstrapConfig(
        postgres_host=args.postgres_host,
        postgres_port=args.postgres_port,
        postgres_database=args.postgres_database,
        migration_credential_file=Path(args.migration_credential_file).expanduser(),
        secret_root=Path(args.secret_root).expanduser(),
        security_endpoint=args.security_endpoint,
        security_table=args.security_table,
        security_region=args.security_region,
        admin_email=args.admin_email.strip().lower(),
        admin_display_name=args.admin_display_name.strip(),
        admin_credential_file=Path(args.admin_credential_file).expanduser(),
        media_endpoint=args.media_endpoint,
        media_bucket=args.media_bucket,
        media_access_key_id=args.media_access_key_id,
        media_secret_access_key=args.media_secret_access_key,
        local_envelope_key=args.local_envelope_key,
        local_envelope_hmac_key=args.local_envelope_hmac_key,
        admin_mfa_secret=args.admin_mfa_secret,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--postgres-host", default=os.getenv("BP_POSTGRES_HOST", "127.0.0.1"))
    parser.add_argument("--postgres-port", type=int, default=int(os.getenv("BP_POSTGRES_PORT", "5432")))
    parser.add_argument("--postgres-database", default=os.getenv("BP_POSTGRES_DATABASE", "bp"))
    parser.add_argument("--migration-credential-file", default=os.getenv("BP_POSTGRES_MIGRATION_CREDENTIAL_FILE", str(DEFAULT_ROOT / "migration")))
    parser.add_argument("--secret-root", default=os.getenv("BP_LOCAL_SECRET_ROOT", str(DEFAULT_ROOT)))
    parser.add_argument("--security-endpoint", default=os.getenv("BP_SECURITY_STATE_ENDPOINT", DEFAULT_SECURITY_ENDPOINT))
    parser.add_argument("--security-table", default=os.getenv("BP_SECURITY_STATE_TABLE", DEFAULT_TABLE))
    parser.add_argument("--security-region", default=os.getenv("AWS_REGION", "us-east-1"))
    parser.add_argument("--admin-email", default=os.getenv("BP_LOCAL_ADMIN_EMAIL", "local-admin@example.invalid"))
    parser.add_argument("--admin-display-name", default=os.getenv("BP_LOCAL_ADMIN_DISPLAY_NAME", "Local Acceptance Admin"))
    parser.add_argument("--admin-credential-file", default=os.getenv("BP_LOCAL_ADMIN_CREDENTIAL_FILE", str(DEFAULT_ROOT / "admin-credential.json")))
    parser.add_argument("--media-endpoint", default=os.getenv("BP_MEDIA_ENDPOINT_URL", "http://127.0.0.1:9010"))
    parser.add_argument("--media-bucket", default=os.getenv("BP_MEDIA_BUCKET", "bp-media-dev"))
    parser.add_argument("--media-access-key-id", default=os.getenv("BP_MEDIA_ACCESS_KEY_ID", "localminio"))
    parser.add_argument("--media-secret-access-key", default=os.getenv("BP_MEDIA_SECRET_ACCESS_KEY", "localminio-only"))
    parser.add_argument("--local-envelope-key", default=os.getenv("BP_LOCAL_ENVELOPE_KEY", ""))
    parser.add_argument("--local-envelope-hmac-key", default=os.getenv("BP_LOCAL_ENVELOPE_HMAC_KEY", ""))
    parser.add_argument("--admin-mfa-secret", default=os.getenv("BP_LOCAL_ADMIN_MFA_SECRET", ""))
    config = _config_from_args(parser.parse_args())
    if not config.local_envelope_key or not config.local_envelope_hmac_key or not config.admin_mfa_secret:
        raise RuntimeError("local envelope and Admin MFA values are required")
    if os.getenv("BP_ENV", "development") != "development":
        raise RuntimeError("local Admin bootstrap is restricted to BP_ENV=development")
    if urlparse(config.security_endpoint).hostname not in {"127.0.0.1", "localhost"}:
        raise RuntimeError("local Admin bootstrap requires a localhost security endpoint")
    if not config.migration_credential_file.is_file():
        raise RuntimeError(f"migration credential file does not exist: {config.migration_credential_file}")
    site_path, platform_path = provision_postgres_roles(config)
    ensure_security_table(config)
    ensure_media_bucket(config)
    password = _admin_password_file(config.admin_credential_file, config.admin_email)
    admin_id = provision_local_admin(config, password)
    print(
        f"local bootstrap verified: Admin {config.admin_email} ({admin_id}); "
        f"credential at {config.admin_credential_file}; postgres credentials at {site_path} and {platform_path}; "
        f"security table {config.security_table}; media bucket {config.media_bucket}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
