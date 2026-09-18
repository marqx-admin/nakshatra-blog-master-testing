from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit


RESERVED_REDIRECT_PREFIXES = ("/sitemaps/",)
RESERVED_REDIRECT_PATHS = frozenset({"/robots.txt", "/sitemap.xml"})
MAX_REDIRECT_HOPS = 3


def normalize_source_path(value: str) -> str:
    path = urlsplit(value).path
    if not path.startswith("/"):
        raise ValueError("redirect source_path must start with /")
    while "//" in path:
        path = path.replace("//", "/")
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")
    if path in RESERVED_REDIRECT_PATHS or any(path.startswith(prefix) for prefix in RESERVED_REDIRECT_PREFIXES):
        raise ValueError("SEO crawler resources cannot be redirect sources")
    return path


def normalize_destination_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    if parsed.scheme:
        if parsed.scheme.lower() != "https" or not parsed.hostname:
            raise ValueError("external redirect destination must be absolute HTTPS with a valid host")
        if parsed.username is not None or parsed.password is not None:
            raise ValueError("external redirect destination cannot contain credentials")
    if parsed.fragment:
        raise ValueError("redirect destination cannot contain fragment")
    if not parsed.scheme and not parsed.path.startswith("/"):
        raise ValueError("internal redirect destination must start with /")
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path or "/", parsed.query, ""))


@dataclass(frozen=True, slots=True)
class RedirectRule:
    source_path: str
    destination_url: str
    status_code: int
    is_active: bool = True

    def __post_init__(self) -> None:
        if self.status_code not in {301, 302}:
            raise ValueError("redirect status must be 301 or 302")
        object.__setattr__(self, "source_path", normalize_source_path(self.source_path))
        object.__setattr__(self, "destination_url", normalize_destination_url(self.destination_url))
        parsed = urlsplit(self.destination_url)
        if not parsed.scheme and parsed.path == self.source_path:
            raise ValueError("redirect cannot target itself")


def validate_redirect_graph(rules: list[RedirectRule], *, source_path: str, destination_url: str) -> None:
    source = normalize_source_path(source_path)
    destination = normalize_destination_url(destination_url)
    dest_parts = urlsplit(destination)
    if dest_parts.scheme:
        return
    graph = {rule.source_path: urlsplit(rule.destination_url).path for rule in rules if rule.is_active and not urlsplit(rule.destination_url).scheme}
    graph[source] = dest_parts.path
    seen = {source}
    current = dest_parts.path
    hops = 1
    while current in graph:
        if current in seen:
            raise ValueError("redirect cycle is prohibited")
        seen.add(current)
        current = graph[current]
        hops += 1
        if hops > MAX_REDIRECT_HOPS:
            raise ValueError("redirect chain may not exceed three hops")

@dataclass(frozen=True, slots=True)
class RedirectRuntimeDecision:
    outcome: str
    status_code: int
    location: str | None = None


def resolve_runtime_redirect(
    *,
    source_path: str,
    current_live_route: bool,
    active_rules: list[RedirectRule],
    unsafe_internal_destinations: set[str] | None = None,
    historical_locator: bool = False,
    historical_post_permanently_deleted: bool = False,
) -> RedirectRuntimeDecision:
    """DOC-09/16 manual-redirect/history decision after SiteContext resolution.

    The public route resolver remains responsible for steps 1-4 (host/system 308,
    crawler resources, Preview, current canonical route). This helper owns only the
    CHAT05 redirect/history branch and never turns history into an implicit redirect.
    """
    source = normalize_source_path(source_path)
    if current_live_route:
        return RedirectRuntimeDecision("CURRENT_LIVE_ROUTE", 200)

    unsafe = {normalize_destination_url(item) for item in (unsafe_internal_destinations or set())}
    for rule in active_rules:
        if not rule.is_active or rule.source_path != source:
            continue
        destination = rule.destination_url
        parsed = urlsplit(destination)
        if not parsed.scheme and destination in unsafe:
            break
        return RedirectRuntimeDecision("MANUAL_REDIRECT", rule.status_code, destination)

    if historical_locator and historical_post_permanently_deleted:
        return RedirectRuntimeDecision("GONE", 410)
    return RedirectRuntimeDecision("NOT_FOUND", 404)
