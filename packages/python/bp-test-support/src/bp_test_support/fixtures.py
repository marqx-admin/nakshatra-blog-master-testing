from __future__ import annotations

from itertools import permutations
from pathlib import Path
from typing import Any

from .hashing import sha256_json
from .io import load_json

EXPECTED_COLLISIONS = {
    "post_slug": "shared-article",
    "category_slug": "shared-category",
    "tag_slug": "shared-tag",
    "author_slug": "shared-author",
    "media_original_filename": "shared-image.jpg",
}


def directed_site_pairs(site_keys: list[str]) -> list[tuple[str, str]]:
    return list(permutations(site_keys, 2))


def validate_collision_fixture(path: str | Path) -> dict[str, Any]:
    data = load_json(path)
    errors: list[str] = []
    sites = data.get("sites", [])
    if len(sites) != 14:
        errors.append(f"expected 14 sites, found {len(sites)}")

    keys = [str(site.get("site_key", "")) for site in sites]
    expected_keys = [f"SITE-{i:02d}" for i in range(1, 15)]
    if sorted(keys) != expected_keys:
        errors.append("site_key set is not exactly SITE-01..SITE-14")

    uuids = [str(site.get("site_uuid", "")) for site in sites]
    if len(uuids) != len(set(uuids)):
        errors.append("site UUIDs are not unique")
    for i in range(1, 15):
        key = f"SITE-{i:02d}"
        match = next((site for site in sites if site.get("site_key") == key), None)
        expected_uuid = f"10000000-0000-4000-8000-{i:012d}"
        if not match or match.get("site_uuid") != expected_uuid:
            errors.append(f"{key} stable UUID mismatch")

    markers = [str(site.get("unique_marker", "")) for site in sites]
    if any(not marker for marker in markers) or len(markers) != len(set(markers)):
        errors.append("each site must have a unique non-empty marker")

    collision = data.get("collision_values", {})
    for key, expected in EXPECTED_COLLISIONS.items():
        if collision.get(key) != expected:
            errors.append(f"collision {key} must equal {expected!r}")

    if not collision.get("navigation_menu_key"):
        errors.append("navigation_menu_key collision is required")
    if not collision.get("redirect_source_path"):
        errors.append("redirect_source_path collision is required")

    pairs = directed_site_pairs(keys)
    if len(pairs) != 182 or len(set(pairs)) != 182:
        errors.append("directed cross-site matrix must contain 182 unique ordered pairs")

    return {
        "ok": not errors,
        "errors": errors,
        "site_count": len(sites),
        "directed_pair_count": len(pairs),
        "fixture_sha256": sha256_json(data),
    }
