from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bp_domain.context import SiteContext
from bp_domain.errors import Conflict, NotFound, ValidationFault
from bp_domain.redirects import RedirectRule, RedirectRuntimeDecision, resolve_runtime_redirect, validate_redirect_graph
from bp_ports import RedirectRepositoryPort, RedirectResolutionPort


@dataclass(slots=True)
class RedirectService:
    repository: RedirectRepositoryPort

    async def list(self, context: SiteContext, query: dict[str, Any]) -> dict[str, Any]:
        items, has_more = await self.repository.list_redirects(context, query=query)
        return {"items": items, "page": {"page": int(query.get("page", 1)), "page_size": int(query.get("page_size", 50)), "has_more": has_more}}

    async def get(self, context: SiteContext, redirect_id: str) -> dict[str, Any]:
        item = await self.repository.get_redirect(context, redirect_id)
        if item is None:
            raise NotFound("redirect not found")
        return {"redirect": item}

    async def _validate(self, context: SiteContext, fields: dict[str, Any], *, exclude_redirect_id: str | None = None) -> dict[str, Any]:
        source = fields.get("source_path")
        destination = fields.get("destination_url")
        status = fields.get("status_code")
        if exclude_redirect_id is not None:
            current = await self.repository.get_redirect(context, exclude_redirect_id)
            if current is None:
                raise NotFound("redirect not found")
            source = source if source is not None else current["source_path"]
            destination = destination if destination is not None else current["destination_url"]
            status = status if status is not None else current["status_code"]
        try:
            rule = RedirectRule(str(source), str(destination), int(status))
            graph_rows = await self.repository.active_graph(context, exclude_redirect_id=exclude_redirect_id)
            graph = [RedirectRule(row["source_path"], row["destination_url"], int(row["status_code"]), bool(row.get("is_active", True))) for row in graph_rows]
            validate_redirect_graph(graph, source_path=rule.source_path, destination_url=rule.destination_url)
        except (ValueError, TypeError) as exc:
            raise ValidationFault(str(exc)) from exc
        if await self.repository.conflicts_with_live_route(context, rule.source_path):
            raise Conflict("redirect source conflicts with a current live route")
        if rule.destination_url.startswith("/") and not await self.repository.internal_target_public_eligible(context, rule.destination_url):
            raise Conflict("internal redirect target is not currently public eligible")
        result = dict(fields)
        result["source_path"] = rule.source_path
        result["destination_url"] = rule.destination_url
        result["status_code"] = rule.status_code
        return result

    async def create(self, context: SiteContext, fields: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        validated = await self._validate(context, fields)
        return {"redirect": await self.repository.create_redirect(context, validated, actor_admin_id=actor_admin_id)}

    async def update(self, context: SiteContext, redirect_id: str, fields: dict[str, Any], *, actor_admin_id: str) -> dict[str, Any]:
        validated = await self._validate(context, fields, exclude_redirect_id=redirect_id)
        item = await self.repository.update_redirect(context, redirect_id, validated, actor_admin_id=actor_admin_id)
        if item is None:
            raise NotFound("redirect not found")
        return {"redirect": item}

    async def delete(self, context: SiteContext, redirect_id: str, *, actor_admin_id: str) -> None:
        if not await self.repository.delete_redirect(context, redirect_id, actor_admin_id=actor_admin_id):
            raise NotFound("redirect not found")


@dataclass(slots=True)
class RedirectRuntimeService(RedirectResolutionPort):
    repository: RedirectRepositoryPort

    async def resolve(
        self, context: SiteContext, *, source_path: str, current_live_route: bool,
        historical_locator: bool, historical_post_permanently_deleted: bool,
    ) -> RedirectRuntimeDecision:
        rows = await self.repository.active_graph(context)
        rules = [
            RedirectRule(
                row["source_path"], row["destination_url"], int(row["status_code"]),
                bool(row.get("is_active", True)),
            )
            for row in rows
        ]
        unsafe: set[str] = set()
        for rule in rules:
            if rule.destination_url.startswith("/"):
                if not await self.repository.internal_target_public_eligible(context, rule.destination_url):
                    unsafe.add(rule.destination_url)
        return resolve_runtime_redirect(
            source_path=source_path, current_live_route=current_live_route, active_rules=rules,
            unsafe_internal_destinations=unsafe, historical_locator=historical_locator,
            historical_post_permanently_deleted=historical_post_permanently_deleted,
        )
