from __future__ import annotations

from dataclasses import dataclass
import ipaddress
import os
from urllib.parse import urlparse


@dataclass(frozen=True, slots=True)
class Settings:
    environment: str
    canonical_openapi_path: str
    admin_origins: tuple[str, ...]
    reset_base_url: str
    enforce_https: bool
    hsts_include_subdomains: bool = False
    invitation_setup_base_url: str = "https://admin.example.invalid/setup"

    def __post_init__(self) -> None:
        if not self.admin_origins:
            raise ValueError("at least one exact Central Admin origin is required")
        for origin in self.admin_origins:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path not in {"", "/"} or parsed.query or parsed.fragment:
                raise ValueError(f"invalid Central Admin origin: {origin!r}")
            if self.environment not in {"development", "test"} and parsed.scheme != "https":
                raise ValueError("non-development Admin origins must use HTTPS")
        reset = urlparse(self.reset_base_url)
        if not reset.netloc or reset.scheme not in {"http", "https"}:
            raise ValueError("BP_RESET_BASE_URL must be an absolute HTTP(S) URL")
        if self.environment not in {"development", "test"} and reset.scheme != "https":
            raise ValueError("non-development reset URLs must use HTTPS")
        invite = urlparse(self.invitation_setup_base_url)
        if not invite.netloc or invite.scheme not in {"http", "https"}:
            raise ValueError("BP_INVITE_SETUP_BASE_URL must be an absolute HTTP(S) URL")
        if self.environment not in {"development", "test"} and invite.scheme != "https":
            raise ValueError("non-development invitation setup URLs must use HTTPS")

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            environment=os.getenv("BP_ENV", "development"),
            canonical_openapi_path=os.getenv(
                "BP_OPENAPI_PATH",
                "contracts/http/BLOG-DOC-15_openapi_v1.0-RC9.yaml",
            ),
            admin_origins=tuple(
                value.strip().rstrip("/")
                for value in os.getenv("BP_ADMIN_ORIGINS", "https://admin.example.invalid").split(",")
                if value.strip()
            ),
            reset_base_url=os.getenv("BP_RESET_BASE_URL", "https://admin.example.invalid/reset"),
            enforce_https=os.getenv("BP_ENFORCE_HTTPS", "0") == "1",
            hsts_include_subdomains=os.getenv("BP_HSTS_INCLUDE_SUBDOMAINS", "0") == "1",
            invitation_setup_base_url=os.getenv(
                "BP_INVITE_SETUP_BASE_URL",
                "https://admin.example.invalid/setup",
            ),
        )


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or not value.strip():
        raise RuntimeError(f"{name} is required")
    return value.strip()


def _optional_env(name: str) -> str | None:
    value = os.getenv(name)
    if value is None or not value.strip():
        return None
    return value.strip()


def validated_public_origin(name: str, value: str, *, environment: str) -> str:
    parsed = urlparse(value)
    hostname = (parsed.hostname or "").lower().rstrip(".")
    if parsed.scheme not in {"http", "https"} or not parsed.netloc or parsed.path not in {"", "/"} or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise RuntimeError(f"{name} must be an absolute HTTP(S) origin without credentials, path, query, or fragment")
    if environment in {"staging", "production"}:
        if hostname.endswith(".invalid"):
            raise RuntimeError(f"{name} must not use a reserved .invalid placeholder hostname")
        if parsed.scheme != "https":
            raise RuntimeError(f"{name} must use HTTPS in staging/production")
        try:
            if ipaddress.ip_address(hostname).is_loopback:
                raise RuntimeError(f"{name} must be publicly browser-accessible in staging/production")
        except ValueError:
            if hostname == "localhost":
                raise RuntimeError(f"{name} must be publicly browser-accessible in staging/production")
    return value.rstrip("/")


@dataclass(frozen=True, slots=True)
class ProductionRuntimeSettings:
    """Validated DOC-24 provider/runtime configuration for the API composition.

    This is intentionally separate from product/application Settings so the
    production composition consumes one immutable configuration snapshot and
    never falls back to Development provider defaults.
    """

    postgres_host: str
    postgres_port: int
    postgres_database: str
    postgres_ssl_mode: str
    postgres_pool_max: int
    postgres_site_credential_file: str
    postgres_platform_credential_file: str
    redis_control_endpoint: str
    redis_control_password_file: str | None
    redis_broker_endpoint: str
    redis_broker_password_file: str | None
    opensearch_endpoint: str
    media_bucket: str
    media_staging_prefix: str
    media_cdn_origin: str
    security_state_table: str
    vault_addr: str
    vault_role: str
    smtp_host: str
    smtp_port: int
    smtp_credential_file: str
    embed_provider_registry_file: str | None
    trusted_proxy_mode: str
    aws_region: str

    @classmethod
    def from_env(cls) -> "ProductionRuntimeSettings":
        environment = _required_env("BP_ENV")
        if environment not in {"staging", "production"}:
            raise RuntimeError("production runtime settings require staging or production")
        port = int(_required_env("BP_POSTGRES_PORT"))
        if port != 5432:
            raise RuntimeError("BP_POSTGRES_PORT must be 5432")
        ssl_mode = _required_env("BP_POSTGRES_SSL_MODE")
        if ssl_mode != "verify-full":
            raise RuntimeError("BP_POSTGRES_SSL_MODE must be verify-full in staging/production")
        pool_max = int(_required_env("BP_POSTGRES_POOL_MAX"))
        if not 1 <= pool_max <= 20:
            raise RuntimeError("BP_POSTGRES_POOL_MAX must be between 1 and 20")
        smtp_port = int(_required_env("BP_SMTP_PORT"))
        if not 1 <= smtp_port <= 65535:
            raise RuntimeError("BP_SMTP_PORT is outside the valid port range")
        return cls(
            postgres_host=_required_env("BP_POSTGRES_HOST"),
            postgres_port=port,
            postgres_database=_required_env("BP_POSTGRES_DATABASE"),
            postgres_ssl_mode=ssl_mode,
            postgres_pool_max=pool_max,
            postgres_site_credential_file=_required_env("BP_POSTGRES_SITE_CREDENTIAL_FILE"),
            # CHAT03 production GLOBAL operations are always composed, so the
            # DOC-24 conditional platform credential becomes required here.
            postgres_platform_credential_file=_required_env("BP_POSTGRES_PLATFORM_CREDENTIAL_FILE"),
            redis_control_endpoint=_required_env("BP_REDIS_CONTROL_ENDPOINT"),
            redis_control_password_file=_optional_env("BP_REDIS_CONTROL_PASSWORD_FILE"),
            redis_broker_endpoint=_required_env("BP_REDIS_BROKER_ENDPOINT"),
            redis_broker_password_file=_optional_env("BP_REDIS_BROKER_PASSWORD_FILE"),
            opensearch_endpoint=_required_env("BP_OPENSEARCH_ENDPOINT"),
            media_bucket=_required_env("BP_MEDIA_BUCKET"),
            media_staging_prefix=_required_env("BP_MEDIA_STAGING_PREFIX"),
            media_cdn_origin=validated_public_origin("BP_MEDIA_CDN_ORIGIN", _required_env("BP_MEDIA_CDN_ORIGIN"), environment=environment),
            security_state_table=_required_env("BP_SECURITY_STATE_TABLE"),
            vault_addr=_required_env("BP_VAULT_ADDR"),
            vault_role=_required_env("BP_VAULT_ROLE"),
            smtp_host=_required_env("BP_SMTP_HOST"),
            smtp_port=smtp_port,
            smtp_credential_file=_required_env("BP_SMTP_CREDENTIAL_FILE"),
            embed_provider_registry_file=_optional_env("BP_EMBED_PROVIDER_REGISTRY_FILE"),
            trusted_proxy_mode=_required_env("BP_TRUSTED_PROXY_MODE"),
            # AWS workload identity is ambient; region is non-secret SDK config.
            aws_region=os.getenv("AWS_REGION", "us-east-1"),
        )


def api_http_port_from_env() -> int:
    raw = os.getenv("BP_HTTP_PORT", "8000")
    port = int(raw)
    if not 1 <= port <= 65535:
        raise RuntimeError("BP_HTTP_PORT is outside the valid port range")
    return port
