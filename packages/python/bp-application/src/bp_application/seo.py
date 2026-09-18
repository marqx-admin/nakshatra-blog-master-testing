from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bp_domain.context import SiteContext
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.errors import ValidationFault
from bp_domain.seo import validate_site_meta_template, validate_site_title_template
from bp_ports import DownstreamEffectsPort, SeoRepositoryPort


_GENERATED_TYPES = {"WebSite", "Article", "CollectionPage", "ProfilePage", "Person", "WebPage", "BreadcrumbList"}


@dataclass(slots=True)
class SeoAdminService:
    repository: SeoRepositoryPort
    effects: DownstreamEffectsPort

    async def get(self, context: SiteContext) -> dict[str, Any]:
        return {"seo": await self.repository.get_site_seo(context)}

    async def update(self, context: SiteContext, fields: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        try:
            if "seo_title" in fields and fields["seo_title"] is not None:
                validate_site_title_template(fields["seo_title"])
            if "meta_description" in fields:
                validate_site_meta_template(fields.get("meta_description"))
            for item in fields.get("structured_data_inputs") or []:
                if item.get("type") not in _GENERATED_TYPES:
                    raise ValueError("unrecognized structured-data source type")
                if any(str(key).startswith("@") for key in (item.get("values") or {})):
                    raise ValueError("structured-data source keys beginning with @ are prohibited")
                if any(isinstance(value, dict) for value in (item.get("values") or {}).values()):
                    raise ValueError("nested arbitrary structured-data objects are prohibited")
        except ValueError as exc:
            raise ValidationFault(str(exc)) from exc
        updated = await self.repository.update_site_seo(context, fields, actor_admin_id=actor_admin_id)
        await self.effects.emit(SiteEffectEnvelope(
            effect_type="SITE_SEO_CHANGE", context=context, entity_type="SITE", entity_id=context.site_id,
            correlation_id=context.request_id, payload={},
        ))
        return {"seo": updated}
