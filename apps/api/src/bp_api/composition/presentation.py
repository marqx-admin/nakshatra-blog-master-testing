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
        return bool(self.presentation.is_valid(value))

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
