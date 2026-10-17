from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
import re
from urllib.parse import urlsplit, urlunsplit


class IndexPolicy(StrEnum):
    INHERIT = "INHERIT"
    INDEX = "INDEX"
    NOINDEX = "NOINDEX"


class LinkRobotsPolicy(StrEnum):
    INHERIT = "INHERIT"
    FOLLOW = "FOLLOW"
    NOFOLLOW = "NOFOLLOW"


@dataclass(frozen=True, slots=True)
class RobotsDecision:
    index: bool
    follow: bool


HARD_NOINDEX_PAGE_IDS = frozenset({"PUB-SEARCH-01", "PUB-SYS-PREVIEW-01", "PUB-SYS-404-01", "PUB-SYS-410-01"})
CONDITIONAL_ARCHIVE_PAGE_IDS = frozenset({"PUB-BLOG-01", "PUB-CATEGORY-01", "PUB-TAG-01", "PUB-AUTHOR-01"})


def normalize_seo_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = re.sub(r"\s+", " ", value.strip())
    return normalized or None


def validate_site_title_template(template: str | None) -> str:
    normalized = normalize_seo_text(template) or "{page_title}"
    tokens = re.findall(r"\{[^{}]+\}", normalized)
    allowed = {"{page_title}", "{site_name}"}
    if any(token not in allowed for token in tokens) or normalized.count("{page_title}") != 1:
        raise ValueError("site seo_title template must contain {page_title} exactly once and only approved tokens")
    return normalized


def validate_site_meta_template(template: str | None) -> str | None:
    normalized = normalize_seo_text(template)
    if normalized is None:
        return None
    tokens = re.findall(r"\{[^{}]+\}", normalized)
    allowed = {"{page_summary}", "{site_name}"}
    if any(token not in allowed for token in tokens):
        raise ValueError("site meta_description template contains an unknown token")
    return normalized


def resolve_document_title(*, page_title: str | None, site_name: str, site_template: str | None = None, allow_site_fallback: bool = False) -> str:
    title = normalize_seo_text(page_title)
    if title is None:
        if not allow_site_fallback:
            raise ValueError("page title is required")
        title = normalize_seo_text(site_name)
    if title is None:
        raise ValueError("site display name is required")
    template = validate_site_title_template(site_template)
    return re.sub(r"\s+", " ", template.replace("{page_title}", title).replace("{site_name}", site_name)).strip()


def generated_summary(text: str | None, *, max_chars: int = 180) -> str | None:
    normalized = normalize_seo_text(text)
    if normalized is None:
        return None
    if len(normalized) <= max_chars:
        return normalized
    prefix = normalized[:max_chars]
    # DOC-16: use first complete sentence at/before 180 when possible.
    last_boundary = max(prefix.rfind("."), prefix.rfind("!"), prefix.rfind("?"), prefix.rfind("।"))
    if last_boundary >= 0:
        return prefix[: last_boundary + 1].strip()
    return prefix.rstrip()


def resolve_meta_description(*, explicit: str | None, summary_source: str | None, site_template: str | None, site_name: str) -> str | None:
    # Explicit authored copy is normalized but never clipped. Fallback summary text may be
    # sentence-clipped to the DOC-16 180-character generation rule. In either case the
    # resulting page_summary is then fed through the optional site template.
    authored = normalize_seo_text(explicit)
    page_summary = authored if authored is not None else generated_summary(summary_source)
    template = validate_site_meta_template(site_template)
    if template is None:
        return page_summary
    if "{page_summary}" in template and page_summary is None:
        return None
    return re.sub(
        r"\s+",
        " ",
        template.replace("{page_summary}", page_summary or "").replace("{site_name}", site_name),
    ).strip() or None


def robots_decision(
    *,
    page_id: str,
    site_status: str,
    public_status: int,
    site_index_policy: str = "INHERIT",
    object_index_policy: str | None = None,
    site_link_policy: str = "INHERIT",
    article_link_policy: str | None = None,
    conditional_gate: bool = True,
    page: int = 1,
) -> RobotsDecision:
    index = True
    if page_id in HARD_NOINDEX_PAGE_IDS:
        index = False
    elif site_status != "ACTIVE" or public_status != 200:
        index = False
    elif site_index_policy == "NOINDEX":
        index = False
    elif object_index_policy == "NOINDEX":
        index = False
    elif page_id in CONDITIONAL_ARCHIVE_PAGE_IDS and page > 1:
        index = False
    elif page_id in CONDITIONAL_ARCHIVE_PAGE_IDS:
        index = bool(conditional_gate)

    follow = True
    if page_id == "PUB-SYS-PREVIEW-01":
        follow = False
    elif site_link_policy == "NOFOLLOW":
        follow = False
    elif page_id == "PUB-ARTICLE-01" and article_link_policy == "NOFOLLOW":
        follow = False
    return RobotsDecision(index=index, follow=follow)


def robots_txt(*, site_status: str, index_policy: str, canonical_domain: str) -> str | None:
    if site_status != "ACTIVE":
        return None
    disallow = "/" if index_policy == "NOINDEX" else "/_preview/"
    return f"User-agent: *\nDisallow: {disallow}\nSitemap: https://{canonical_domain}/sitemap.xml\n"


def validate_canonical_override(
    value: str,
    *,
    current_canonical_domain: str,
    same_site_aliases: set[str] | None = None,
    forbidden_same_site_paths: set[str] | None = None,
) -> str:
    parsed = urlsplit(value.strip())
    if parsed.scheme.lower() != "https" or not parsed.hostname:
        raise ValueError("canonical override must be an absolute HTTPS URL")
    if parsed.username is not None or parsed.password is not None:
        raise ValueError("canonical override cannot contain credentials")
    if parsed.fragment:
        raise ValueError("canonical override cannot contain a fragment")
    host = parsed.hostname.encode("idna").decode("ascii").lower().rstrip(".")
    aliases = {item.lower().rstrip(".") for item in (same_site_aliases or set())}
    if host == current_canonical_domain.lower().rstrip(".") or host in aliases:
        host = current_canonical_domain.lower().rstrip(".")
        if parsed.query and parsed.path == "/search":
            raise ValueError("same-site Search query is not a canonical target")
        forbidden = forbidden_same_site_paths or {"/404", "/410"}
        if parsed.path in forbidden or parsed.path.startswith("/_preview/"):
            raise ValueError("same-site private/system path cannot be a canonical target")
    netloc = host
    if parsed.port is not None and parsed.port != 443:
        netloc = f"{host}:{parsed.port}"
    return urlunsplit(("https", netloc, parsed.path or "/", parsed.query, ""))


def resolve_canonical_url(
    *,
    page_id: str,
    default_url: str,
    page: int = 1,
    base_archive_url: str | None = None,
    canonical_override: str | None = None,
    current_canonical_domain: str,
    same_site_aliases: set[str] | None = None,
) -> str | None:
    if page_id in {"PUB-SYS-PREVIEW-01", "PUB-SYS-404-01", "PUB-SYS-410-01"}:
        return None
    if page_id == "PUB-SEARCH-01":
        return f"https://{current_canonical_domain}/search"
    if page_id in CONDITIONAL_ARCHIVE_PAGE_IDS and page > 1:
        return base_archive_url or default_url
    if canonical_override:
        return validate_canonical_override(
            canonical_override,
            current_canonical_domain=current_canonical_domain,
            same_site_aliases=same_site_aliases,
        )
    return default_url


def resolve_open_graph(
    *,
    page_class: str,
    resolved_title: str,
    resolved_meta_description: str | None,
    canonical_url: str | None,
    post_og_title: str | None = None,
    post_og_description: str | None = None,
    post_og_image: dict | None = None,
    featured_media: dict | None = None,
    site_default_image: dict | None = None,
) -> dict | None:
    """Resolve the DOC-13 OpenGraph projection using DOC-16 fallback order.

    Media arguments are already-resolved same-site PublicMedia projections. This pure
    function never accepts media IDs, storage keys, private URLs, or cross-site fallback.
    """
    cls = page_class.upper()
    if cls in {"PREVIEW", "404", "410"}:
        return None
    title = normalize_seo_text(post_og_title) if cls == "ARTICLE" else None
    title = title or normalize_seo_text(resolved_title)
    if title is None:
        raise ValueError("resolved Open Graph title is required")
    description = normalize_seo_text(post_og_description) if cls == "ARTICLE" else None
    description = description or normalize_seo_text(resolved_meta_description)
    image = (post_og_image or featured_media or site_default_image) if cls == "ARTICLE" else site_default_image
    result: dict[str, object] = {"title": title, "type": "ARTICLE" if cls == "ARTICLE" else "WEBSITE"}
    if description is not None:
        result["description"] = description
    if canonical_url is not None:
        result["url"] = canonical_url
    if image is not None:
        result["image"] = image
    return result


def _same_site_destination(destination: dict, canonical_domain: str) -> dict:
    url = str(destination.get("url") or "")
    parsed = urlsplit(url)
    if (
        destination.get("is_external") is not False
        or parsed.scheme.lower() != "https"
        or not parsed.hostname
        or parsed.hostname.lower().rstrip(".") != canonical_domain.lower().rstrip(".")
    ):
        raise ValueError("breadcrumb destination must be an internal same-site HTTPS destination")
    return destination


def build_breadcrumb_trail(
    *,
    page_class: str,
    canonical_domain: str,
    current_label: str,
    home_destination: dict | None = None,
    home_label: str = "Home",
    primary_category_label: str | None = None,
    primary_category_destination: dict | None = None,
    include_home: bool = True,
) -> dict | None:
    """Build the visible DOC-13 BreadcrumbTrail in exact root-to-current order."""
    cls = page_class.upper()
    label = normalize_seo_text(current_label)
    if label is None:
        raise ValueError("breadcrumb current label is required")
    if cls == "HOME":
        return None
    items: list[dict] = []
    if include_home and cls != "PREVIEW" and home_destination is not None:
        items.append({
            "label": normalize_seo_text(home_label) or "Home",
            "destination": _same_site_destination(home_destination, canonical_domain),
            "is_current": False,
        })
    if cls == "ARTICLE" and primary_category_destination is not None:
        category_label = normalize_seo_text(primary_category_label)
        if category_label is None:
            raise ValueError("primary category breadcrumb label is required when destination is present")
        items.append({
            "label": category_label,
            "destination": _same_site_destination(primary_category_destination, canonical_domain),
            "is_current": False,
        })
    items.append({"label": label, "is_current": True})
    return {"items": items}


@dataclass(frozen=True, slots=True)
class SitemapEntry:
    url: str
    resource_type: str
    lastmod: str | None = None


SITEMAP_RESOURCE_ORDER = {"pages": 0, "articles": 1, "categories": 2, "tags": 3, "authors": 4}
SITEMAP_SHARD_SIZE = 25_000


def sitemap_eligible(
    *,
    site_status: str,
    url_host: str,
    canonical_domain: str,
    public_status: int,
    public_eligible: bool,
    robots: RobotsDecision,
    canonical_url: str | None,
    route_canonical_url: str,
    page_id: str,
    page: int,
) -> bool:
    return (
        site_status == "ACTIVE"
        and url_host.lower().rstrip(".") == canonical_domain.lower().rstrip(".")
        and public_status == 200
        and public_eligible
        and robots.index
        and canonical_url is not None
        and canonical_url == route_canonical_url
        and page_id not in HARD_NOINDEX_PAGE_IDS
        and page == 1
    )


def shard_sitemap(entries: list[SitemapEntry]) -> dict[str, list[list[SitemapEntry]]]:
    buckets: dict[str, list[SitemapEntry]] = {name: [] for name in SITEMAP_RESOURCE_ORDER}
    for entry in entries:
        if entry.resource_type not in buckets:
            raise ValueError("unknown sitemap resource type")
        buckets[entry.resource_type].append(entry)
    result: dict[str, list[list[SitemapEntry]]] = {}
    for resource_type in sorted(buckets, key=SITEMAP_RESOURCE_ORDER.__getitem__):
        ordered = sorted(buckets[resource_type], key=lambda item: item.url)
        result[resource_type] = [ordered[i : i + SITEMAP_SHARD_SIZE] for i in range(0, len(ordered), SITEMAP_SHARD_SIZE)]
    return result


def build_structured_data(
    *,
    page_class: str,
    source: dict,
    breadcrumbs: list[dict] | dict | None = None,
    supplemental_inputs: list[dict] | None = None,
) -> list[dict]:
    """Generate only the DOC-16 JSON-LD allowlist from public-safe resolved inputs."""
    out: list[dict] = []
    cls = page_class.upper()
    canonical_url = source.get("canonical_url")
    if cls == "HOME":
        obj = {"@context": "https://schema.org", "@type": "WebSite", "name": source.get("site_name"), "url": canonical_url}
        if source.get("logo_url"):
            obj["image"] = source["logo_url"]
        out.append({k: v for k, v in obj.items() if v is not None})
    elif cls == "ARTICLE":
        obj = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": source.get("headline") or source.get("title"),
            "description": source.get("description"),
            "url": canonical_url,
            "mainEntityOfPage": canonical_url,
            "datePublished": source.get("date_published") or source.get("first_published_at") or source.get("published_at"),
            "dateModified": source.get("date_modified") or source.get("updated_at"),
            "image": source.get("image_url"),
            "inLanguage": source.get("language") or source.get("default_language") or source.get("locale_code"),
        }
        if source.get("author_name"):
            author = {"@type": "Person", "name": source["author_name"]}
            if source.get("author_url"):
                author["url"] = source["author_url"]
            obj["author"] = author
        out.append({k: v for k, v in obj.items() if v is not None})
    elif cls in {"BLOG", "CATEGORY", "TAG"}:
        out.append({k: v for k, v in {
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": source.get("title"), "description": source.get("description"), "url": canonical_url,
        }.items() if v is not None})
    elif cls == "AUTHOR":
        person = {k: v for k, v in {
            "@context": "https://schema.org", "@type": "Person",
            "name": source.get("display_name"), "url": source.get("author_url") or canonical_url,
        }.items() if v is not None}
        profile = {k: v for k, v in {
            "@context": "https://schema.org", "@type": "ProfilePage",
            "name": source.get("display_name"), "url": canonical_url,
            "mainEntity": {"@type": "Person", "name": source.get("display_name"), **({"url": person.get("url")} if person.get("url") else {})},
        }.items() if v is not None}
        out.extend([profile, person])
    elif cls == "STATIC":
        out.append({k: v for k, v in {
            "@context": "https://schema.org", "@type": "WebPage",
            "name": source.get("title"), "description": source.get("description"), "url": canonical_url,
        }.items() if v is not None})
    elif cls in {"SEARCH", "PREVIEW", "404", "410"}:
        return []
    else:
        raise ValueError("unsupported DOC-16 page class")

    breadcrumb_items = breadcrumbs.get("items", []) if isinstance(breadcrumbs, dict) else (breadcrumbs or [])
    if breadcrumb_items and source.get("robots_index", True):
        items = []
        for position, item in enumerate(breadcrumb_items, 1):
            node = {"@type": "ListItem", "position": position, "name": item["label"]}
            if item.get("is_current"):
                if canonical_url:
                    node["item"] = canonical_url
            else:
                destination = item.get("destination")
                url = destination.get("url") if isinstance(destination, dict) else item.get("url")
                if url:
                    node["item"] = url
            items.append(node)
        out.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items})

    # Supplemental Admin values may add only scalar/array properties to an already
    # generated recognized object. They cannot redefine generated identity/ownership.
    protected = {
        "@context", "@type", "url", "mainEntityOfPage", "mainEntity", "author",
        "datePublished", "dateModified", "headline", "name", "itemListElement", "position",
    }
    for entry in supplemental_inputs or []:
        object_type = str(entry.get("type") or "")
        values = entry.get("values") or {}
        if object_type not in {"WebSite", "Article", "CollectionPage", "ProfilePage", "Person", "WebPage", "BreadcrumbList"}:
            raise ValueError("unknown structured-data supplemental type")
        if not isinstance(values, dict):
            raise ValueError("structured-data supplemental values must be an object")
        if any(str(key).startswith("@") or key in protected for key in values):
            raise ValueError("structured-data supplemental input attempts to override a generated property")
        if any(isinstance(value, dict) for value in values.values()):
            raise ValueError("nested arbitrary structured-data objects are prohibited")
        target = next((obj for obj in out if obj.get("@type") == object_type), None)
        if target is not None:
            target.update(values)
    return out

