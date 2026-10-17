"""Frozen RC12 presentation/configuration validation shared by API adapters."""

from __future__ import annotations

from typing import Any

from bp_domain.errors import ValidationFault
from jsonschema import Draft202012Validator, RefResolver


class PresentationPolicy:
    def __init__(self, spec: dict[str, Any]) -> None:
        resolver = RefResolver.from_schema(spec)
        schemas = spec["components"]["schemas"]
        self.presentation = Draft202012Validator(
            schemas["PresentationConfig"],
            resolver=resolver,
            format_checker=Draft202012Validator.FORMAT_CHECKER,
        )
        self.static_pages = Draft202012Validator(
            schemas["StaticPages"],
            resolver=resolver,
            format_checker=Draft202012Validator.FORMAT_CHECKER,
        )

    def presentation_valid(self, value: Any) -> bool:
        if not self.presentation.is_valid(value):
            return False
        # New recipes validate semantic colors before persistence. Keep legacy
        # schema-1 recipe behavior unchanged; no automatic configuration migration.
        palette = value.get("palette") or {}
        if value.get("recipe_version") == 2 and palette.get("mode") == "CUSTOM":
            colors = palette.get("semantic_tokens") or {}
            surface = colors.get("surface", "#ffffff")
            background = colors.get("background", surface)
            primary = colors.get("primary", colors.get("accent", surface))
            pairs = [
                (colors["text"], surface, 4.5), (colors["text"], background, 4.5),
                (colors["text_muted"], surface, 4.5), (colors["text_muted"], background, 4.5),
                (colors.get("heading", colors["text"]), background, 3),
                (colors["accent_text"], colors["accent"], 4.5),
                (colors["focus"], surface, 3), (colors["focus"], background, 3),
            ]
            for bg in (surface, background, colors["surface_alt"]):
                pairs.extend((fg, bg, threshold) for fg, threshold in (
                    (colors["text"], 4.5), (colors["text_muted"], 4.5),
                    (colors.get("heading", colors["text"]), 4.5),
                    (primary, 4.5), (colors["focus"], 3),
                ))
            if any(_contrast(fg, bg) < threshold for fg, bg, threshold in pairs):
                return False
            if max(_contrast(primary, "#ffffff"), _contrast(primary, "#111111")) < 4.5:
                return False
        return True

    def require_presentation(self, value: Any) -> None:
        if not self.presentation_valid(value):
            raise ValidationFault("presentation does not satisfy canonical RC12")

    def require_provisioning_presentation(self, value: Any) -> None:
        """A new site receives every visual axis, not a style ID alone.

        The shared catalogue supplies the values. RC12 validates the supplied
        IDs; this check only requires the complete starting configuration.
        """
        self.require_presentation(value)
        required = {
            "palette": ("mode",),
            "layout": ("width_id", "density_id", "spacing_id", "radius_id", "border_id", "elevation_id"),
            "cards": ("article_card_profile_id", "category_card_profile_id", "author_card_profile_id"),
            "hero": ("profile_id", "image_profile_id"),
            "homepage": ("recipe_id",),
            "article": ("layout_id", "image_profile_id", "related_card_profile_id", "measure", "headline_scale", "meta_layout", "featured_media_ratio", "author_display", "related_content_layout"),
            "collections": ("category_layout_id", "tag_layout_id", "author_articles_layout_id", "search_layout_id", "article_card_profile_id"),
            "controls": ("button_profile_id",),
        }
        if not isinstance(value.get("typography_id"), str) or not value["typography_id"]:
            raise ValidationFault("new website presentation must be complete")
        for group, fields in required.items():
            values = value.get(group)
            if not isinstance(values, dict) or any(not isinstance(values.get(field), str) or not values[field] for field in fields):
                raise ValidationFault("new website presentation must be complete")
        palette = value["palette"]
        if palette["mode"] == "PRESET" and not palette.get("preset_id"):
            raise ValidationFault("new website presentation must be complete")
        if palette["mode"] == "CUSTOM" and not palette.get("semantic_tokens"):
            raise ValidationFault("new website presentation must be complete")

    def require_static_pages(self, value: Any) -> None:
        if not self.static_pages.is_valid(value):
            raise ValidationFault("fixed information pages do not satisfy canonical RC12")
        from bp_domain.website_content import information_page_ready
        if any(page["enabled"] and not information_page_ready(page) for page in value.values()):
            raise ValidationFault("enabled information pages require complete resolved content")


def _contrast(a: str, b: str) -> float:
    def light(color: str) -> float:
        rgb = [int(color[i:i+2], 16) / 255 for i in (1, 3, 5)]
        linear = [c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4 for c in rgb]
        return sum(c * weight for c, weight in zip(linear, (.2126, .7152, .0722)))
    high, low = sorted((light(a), light(b)), reverse=True)
    return (high + .05) / (low + .05)


def presentation_references(value: dict[str, Any]) -> tuple[set[str], set[str]]:
    """Extract only the reference-bearing fields admitted by PresentationConfig."""
    media: set[str] = set()
    navigation: set[str] = set()
    for parent in ("branding", "hero"):
        part = value.get(parent)
        if not isinstance(part, dict):
            continue
        for field in ("logo_media_id", "media_id"):
            if isinstance(part.get(field), str):
                media.add(part[field])
        cta = part.get("cta")
        if (
            isinstance(cta, dict)
            and cta.get("enabled") is True
            and isinstance(cta.get("navigation_item_id"), str)
        ):
            navigation.add(cta["navigation_item_id"])
    return media, navigation
