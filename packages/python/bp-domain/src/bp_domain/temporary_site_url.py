"""Platform-authored root URL for a persisted temporary domain hostname."""

from dataclasses import dataclass
import re


_HOSTNAME = re.compile(
    r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*"
)


@dataclass(frozen=True, slots=True)
class TemporarySiteUrlConfig:
    scheme: str = "https"
    port: int | None = None

    def __post_init__(self) -> None:
        if self.scheme not in {"http", "https"}:
            raise ValueError("temporary-site scheme must be http or https")
        if self.port is not None and not 1 <= self.port <= 65535:
            raise ValueError("temporary-site public port must be between 1 and 65535")


def temporary_site_url(hostname: str, config: TemporarySiteUrlConfig) -> str:
    """Construct only a root URL; HTTP is confined to .localhost hosts."""
    if not _HOSTNAME.fullmatch(hostname) or "." not in hostname:
        raise ValueError("temporary domain hostname is invalid")
    if config.scheme == "http" and hostname != "localhost" and not hostname.endswith(".localhost"):
        raise ValueError("HTTP temporary-site URLs require a localhost hostname")
    authority = hostname + (f":{config.port}" if config.port is not None else "")
    return f"{config.scheme}://{authority}/"
