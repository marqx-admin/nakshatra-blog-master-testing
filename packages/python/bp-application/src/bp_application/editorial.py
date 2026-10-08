from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from typing import Any
from collections.abc import Callable
from uuid import UUID
from zoneinfo import ZoneInfo

from bp_domain.context import SiteContext
from bp_domain.editorial import (
    SEO_FIELDS,
    STATIC_PAGE_ROUTES,
    assert_no_unresolved_structured_data_transport,
    decode_working_copy_preview_snapshot,
    encode_working_copy_preview_snapshot,
    normalize_slug,
    parse_content_schema_version,
    require_transition,
    resolve_schedule,
    validate_article_body,
    validate_navigation_items,
    validate_publish_eligibility,
    validate_site_settings_entries,
    validate_unique_ids,
    validation_error,
)
from bp_domain.effects import SiteEffectEnvelope
from bp_domain.errors import Conflict, Denied, NotFound, StateConflict, ValidationFault, VersionConflict
from bp_domain.security import AdminPrincipal
from bp_ports import AuditPort, DownstreamEffectsPort
from bp_ports.editorial import EditorialRepositoryPort, PreviewHandoffIssuerPort

from .authorization import AuthorizationService


logger = logging.getLogger(__name__)


POST_SEO_FIELDS = SEO_FIELDS
POST_MEDIA_FIELDS = frozenset({"featured_media_id", "og_image_media_id"})
CATEGORY_SEO_FIELDS = frozenset({"seo_title", "meta_description", "canonical_override", "index_policy"})
AUTHOR_SEO_FIELDS = frozenset({"seo_title", "meta_description", "canonical_override", "index_policy"})

BULK_ACTIONS = frozenset({"PUBLISH", "SCHEDULE", "ARCHIVE", "TRASH", "RESTORE", "PERMANENT_DELETE"})

LIFECYCLE_PERMISSIONS: dict[str, set[str]] = {
    "SCHEDULE": {"posts.view", "posts.edit", "posts.schedule"},
    "UNSCHEDULE": {"posts.view", "posts.edit", "posts.schedule"},
    "PUBLISH": {"posts.view", "posts.edit", "posts.publish"},
    "ARCHIVE": {"posts.view", "posts.edit", "posts.archive"},
    "TRASH": {"posts.view", "posts.edit", "posts.trash"},
    "RESTORE": {"posts.view", "posts.edit", "posts.restore"},
    "PERMANENT_DELETE": {"posts.view", "posts.edit", "posts.delete"},
}

PUBLIC_EFFECT_ACTIONS = frozenset(
    {
        "PUBLISH",
        "UPDATE_PUBLISHED",
        "ARCHIVE",
        "TRASH",
        "REVISION_RESTORE_PUBLISHED",
    }
)


@dataclass(slots=True)
class EditorialApplication:
    repository: EditorialRepositoryPort
    authorization: AuthorizationService
    audit: AuditPort
    downstream: DownstreamEffectsPort | None = None
    preview_issuer: PreviewHandoffIssuerPort | None = None
    embed_provider_registry: dict[str, Any] = field(default_factory=dict)
    presentation_validator: Callable[[Any], bool] | None = None
    static_pages_validator: Callable[[Any], bool] | None = None

    def _require(self, principal: AdminPrincipal, context: SiteContext, *permissions: str) -> None:
        self.authorization.require_site(principal, context.site_key, set(permissions))

    @staticmethod
    def _can(principal: AdminPrincipal, context: SiteContext, *permissions: str) -> bool:
        if principal.is_super_admin:
            return True
        effective = principal.site_permissions.get(context.site_key)
        return effective is not None and set(permissions).issubset(effective)

    async def _audit(
        self,
        context: SiteContext,
        principal: AdminPrincipal,
        *,
        event_code: str,
        target_type: str,
        target_id: str,
        operation_id: str,
        extra: dict[str, Any] | None = None,
    ) -> None:
        details = {
            "operation_id": operation_id,
            "target_type": target_type,
            "target_id": target_id,
            "outcome": "SUCCESS",
            **(extra or {}),
        }
        await self.audit.append(
            event_code,
            actor_admin_id=principal.admin_id,
            site_id=context.site_id,
            details=details,
        )

    async def _emit_post_effect(self, context: SiteContext, *, action: str, post: dict[str, Any]) -> None:
        if self.downstream is None:
            return
        try:
            await self.downstream.emit(
                SiteEffectEnvelope(
                    effect_type=f"EDITORIAL.POST.{action}",
                    context=context,
                    entity_type="POST",
                    entity_id=str(post["post_id"]),
                    correlation_id=context.request_id,
                    source_version=post.get("version"),
                    payload={
                        "status": post.get("status"),
                        "slug": post.get("slug"),
                        "scheduled_for": post.get("scheduled_for_utc"),
                    },
                )
            )
        except Exception:
            # DOC-18 producer ordering is commit-first. A derived-system outage must
            # not roll back or make the already committed editorial mutation appear
            # uncommitted. CHAT05 owns durable enqueue/reconciliation internals.
            logger.exception(
                "CHAT04 downstream effect emission failed after committed Post mutation",
                extra={"effect_action": action, "site_key": context.site_key},
            )

    async def _emit_site_effect(self, context: SiteContext, *, effect_type: str, entity_type: str, entity_id: str) -> None:
        if self.downstream is None:
            return
        try:
            await self.downstream.emit(
                SiteEffectEnvelope(
                    effect_type=effect_type,
                    context=context,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    correlation_id=context.request_id,
                )
            )
        except Exception:
            logger.exception(
                "CHAT04 downstream effect emission failed after committed SITE mutation",
                extra={"effect_type": effect_type, "site_key": context.site_key},
            )

    @staticmethod
    def _page(query: dict[str, Any]) -> tuple[int, int]:
        return int(query.get("page") or 1), int(query.get("page_size") or 50)

    @staticmethod
    def _page_meta(page: int, page_size: int, has_more: bool) -> dict[str, Any]:
        return {"page": page, "page_size": page_size, "has_more": has_more}

    async def _post_or_404(self, context: SiteContext, post_id: str) -> dict[str, Any]:
        post = await self.repository.get_post(context, post_id)
        if post is None:
            raise NotFound("resource not found")
        return post

    async def _validate_post_permissions_and_relationships(
        self,
        context: SiteContext,
        principal: AdminPrincipal,
        values: dict[str, Any],
        *,
        post_id: str | None = None,
        create: bool = False,
    ) -> dict[str, Any]:
        result = dict(values)
        assert_no_unresolved_structured_data_transport(result)
        if "body" in result:
            validate_article_body(result["body"], require_meaningful=False, embed_registry=self.embed_provider_registry)
            media_ids = self._article_body_media_ids(result["body"])
            internal = self._article_body_internal_targets(result["body"])
            if media_ids:
                self._require(principal, context, "media.view")
                if not await self.repository.relationships_exist(context, media_ids=media_ids):
                    raise NotFound("resource not found")
            if internal["post_ids"]:
                if not await self.repository.relationships_exist(
                    context,
                    related_post_ids=internal["post_ids"],
                ):
                    raise NotFound("resource not found")
            if internal["category_ids"]:
                if not await self.repository.relationships_exist(context, category_ids=internal["category_ids"]):
                    raise NotFound("resource not found")
            if internal["tag_ids"]:
                if not await self.repository.relationships_exist(context, tag_ids=internal["tag_ids"]):
                    raise NotFound("resource not found")
            if internal["author_ids"]:
                for author_id in internal["author_ids"]:
                    if not await self.repository.relationships_exist(context, author_id=author_id):
                        raise NotFound("resource not found")
        if any(field in result for field in POST_SEO_FIELDS):
            self._require(principal, context, "seo.view", "seo.edit")
        if "author_site_profile_id" in result and result.get("author_site_profile_id") is not None:
            self._require(principal, context, "authors.view")
        if "category_ids" in result:
            self._require(principal, context, "categories.view")
            result["category_ids"] = validate_unique_ids(result.get("category_ids") or [], "category_ids")
        if "tag_ids" in result:
            self._require(principal, context, "tags.view")
            result["tag_ids"] = validate_unique_ids(result.get("tag_ids") or [], "tag_ids")
        if "manual_related_post_ids" in result:
            result["manual_related_post_ids"] = validate_unique_ids(
                result.get("manual_related_post_ids") or [],
                "manual_related_post_ids",
                disallow=post_id,
            )
        if any(field in result and result.get(field) is not None for field in POST_MEDIA_FIELDS):
            self._require(principal, context, "media.view")
        if "slug" in result and result.get("slug") is not None:
            result["slug"] = normalize_slug(result["slug"])
            if not await self.repository.slug_available(
                context,
                entity="POST",
                slug=result["slug"],
                exclude_id=post_id,
            ):
                raise Conflict("slug conflict")

        media_ids = [str(result[field]) for field in POST_MEDIA_FIELDS if result.get(field)]
        related_ok = await self.repository.relationships_exist(
            context,
            author_id=str(result["author_site_profile_id"]) if result.get("author_site_profile_id") else None,
            category_ids=[str(v) for v in result.get("category_ids") or []],
            tag_ids=[str(v) for v in result.get("tag_ids") or []],
            media_ids=media_ids,
            related_post_ids=[str(v) for v in result.get("manual_related_post_ids") or []],
        )
        if not related_ok:
            raise NotFound("resource not found")
        return result

    @staticmethod
    def _article_body_media_ids(body: dict[str, Any]) -> list[str]:
        return [str(block["media_id"]) for block in body.get("blocks", []) if block.get("type") == "MEDIA"]

    @staticmethod
    def _article_body_internal_targets(body: dict[str, Any]) -> dict[str, list[str]]:
        result = {"post_ids": [], "category_ids": [], "tag_ids": [], "author_ids": [], "static_keys": []}

        def capture(destination: Any) -> None:
            if not isinstance(destination, dict) or destination.get("kind") != "INTERNAL":
                return
            target_type = destination.get("target_type")
            if target_type == "STATIC":
                static_key = destination.get("static_page_key")
                if static_key in STATIC_PAGE_ROUTES:
                    result["static_keys"].append(str(static_key))
                return
            target_id = destination.get("target_id")
            if not target_id:
                return
            if target_type == "ARTICLE":
                result["post_ids"].append(str(target_id))
            elif target_type == "CATEGORY":
                result["category_ids"].append(str(target_id))
            elif target_type == "TAG":
                result["tag_ids"].append(str(target_id))
            elif target_type == "AUTHOR":
                result["author_ids"].append(str(target_id))

        for block in body.get("blocks", []):
            if block.get("type") == "CTA":
                capture(block.get("destination"))
            for rich_key in ("content", "quote", "body"):
                rich = block.get(rich_key)
                if isinstance(rich, dict):
                    for run in rich.get("runs", []):
                        capture(run.get("link"))
            if block.get("type") == "LIST":
                for item in block.get("items", []):
                    for run in item.get("runs", []):
                        capture(run.get("link"))
            if block.get("type") == "TABLE":
                for row in block.get("rows", []):
                    for cell in row:
                        for run in cell.get("runs", []):
                            capture(run.get("link"))
        for key in result:
            result[key] = list(dict.fromkeys(result[key]))
        return result

    async def _ensure_public_eligibility(self, context: SiteContext, post: dict[str, Any]) -> dict[str, Any]:
        candidate = dict(post)
        if not candidate.get("slug"):
            base = normalize_slug(str(candidate.get("title") or ""))
            candidate["slug"] = await self.repository.generate_available_post_slug(context, base_slug=base)
        validate_publish_eligibility(candidate, embed_registry=self.embed_provider_registry)
        if not await self.repository.relationships_exist(
            context,
            author_id=str(candidate["author_site_profile_id"]),
            category_ids=[str(v) for v in candidate.get("category_ids") or []],
            tag_ids=[str(v) for v in candidate.get("tag_ids") or []],
            media_ids=[str(v) for v in [candidate.get("featured_media_id"), candidate.get("og_image_media_id")] if v],
            related_post_ids=[str(v) for v in candidate.get("manual_related_post_ids") or []],
        ):
            raise NotFound("resource not found")
        return candidate

    async def execute(
        self,
        operation_id: str,
        *,
        principal: AdminPrincipal,
        context: SiteContext,
        path_params: dict[str, Any],
        query: dict[str, Any],
        body: Any,
    ) -> tuple[int, Any, dict[str, str]]:
        if context.site_key != path_params.get("site_key", context.site_key):
            raise NotFound("resource not found")
        if operation_id == "API15-S-010":
            self._require(principal, context, "posts.view")
            return await self._list_posts(context, query)
        if operation_id == "API15-S-011":
            return await self._create_post(context, principal, body, operation_id)
        if operation_id == "API15-S-012":
            self._require(principal, context, "posts.view")
            return await self._read_post(context, path_params["post_id"])
        if operation_id == "API15-S-013":
            return await self._update_post(context, principal, path_params["post_id"], body, operation_id)
        if operation_id == "API15-S-014":
            return await self._autosave(context, principal, path_params["post_id"], body, operation_id)
        if operation_id == "API15-S-015":
            return await self._latest_autosave(context, principal, path_params["post_id"], query)
        if operation_id == "API15-S-016":
            return await self._preview_handoff(context, principal, path_params["post_id"], body, operation_id)
        if operation_id in {
            "API15-S-017",
            "API15-S-018",
            "API15-S-019",
            "API15-S-020",
            "API15-S-021",
            "API15-S-022",
            "API15-S-023",
        }:
            return await self._lifecycle(context, principal, operation_id, path_params["post_id"], body)
        if operation_id == "API15-S-024":
            return await self._duplicate(context, principal, path_params["post_id"], body, operation_id)
        if operation_id == "API15-S-025":
            return await self._bulk(context, principal, body, operation_id)
        if operation_id == "API15-S-026":
            self._require(principal, context, "posts.view", "posts.revisions.view")
            return await self._revisions(context, path_params["post_id"], query)
        if operation_id == "API15-S-027":
            return await self._restore_revision(
                context,
                principal,
                path_params["post_id"],
                path_params["revision_id"],
                body,
                operation_id,
            )
        if operation_id == "API15-S-028":
            self._require(principal, context, "posts.view")
            return await self._url_history(context, path_params["post_id"])
        if operation_id.startswith("API15-S-03"):
            return await self._categories(operation_id, context, principal, path_params, body)
        if operation_id.startswith("API15-S-04"):
            return await self._tags(operation_id, context, principal, path_params, body)
        if operation_id.startswith("API15-S-05"):
            return await self._authors(operation_id, context, principal, path_params, body)
        if operation_id in {"API15-S-070", "API15-S-071"}:
            return await self._navigation(operation_id, context, principal, path_params, body)
        if operation_id in {"API15-S-072", "API15-S-073"}:
            return await self._homepage(operation_id, context, principal, body)
        if operation_id == "API15-S-095":
            self._require(principal, context, "calendar.view")
            return await self._calendar(context, query)
        if operation_id in {"API15-S-096", "API15-S-097"}:
            return await self._settings(operation_id, context, principal, body)
        raise NotFound("resource not found")

    async def _list_posts(self, context: SiteContext, query: dict[str, Any]):
        page, page_size = self._page(query)
        filters = {key: value for key, value in query.items() if key not in {"page", "page_size"} and value is not None}
        items, has_more = await self.repository.list_posts(context, filters=filters, page=page, page_size=page_size)
        return 200, {"items": items, "page": self._page_meta(page, page_size, has_more)}, {}

    async def _read_post(self, context: SiteContext, post_id: str):
        return 200, {"post": await self._post_or_404(context, post_id)}, {}

    async def _create_post(self, context: SiteContext, principal: AdminPrincipal, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.create")
        values = await self._validate_post_permissions_and_relationships(context, principal, dict(body), create=True)
        post = await self.repository.create_post(context, actor_admin_id=principal.admin_id, values=values)
        await self._audit(context, principal, event_code="POST.CREATE", target_type="POST", target_id=post["post_id"], operation_id=operation_id)
        return 201, {"post": post}, {}

    async def _update_post(self, context: SiteContext, principal: AdminPrincipal, post_id: str, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.edit")
        current = await self._post_or_404(context, post_id)
        require_transition(current["status"], "EDIT")
        expected = int(body["expected_version"])
        values = {key: value for key, value in body.items() if key != "expected_version"}
        values = await self._validate_post_permissions_and_relationships(context, principal, values, post_id=post_id)
        if current["status"] in {"SCHEDULED", "PUBLISHED"}:
            candidate = {**current, **values}
            validate_publish_eligibility(candidate, embed_registry=self.embed_provider_registry)
            if not await self.repository.relationships_exist(
                context,
                author_id=str(candidate["author_site_profile_id"]),
                category_ids=[str(v) for v in candidate.get("category_ids") or []],
                tag_ids=[str(v) for v in candidate.get("tag_ids") or []],
                media_ids=[str(v) for v in [candidate.get("featured_media_id"), candidate.get("og_image_media_id")] if v],
                related_post_ids=[str(v) for v in candidate.get("manual_related_post_ids") or []],
            ):
                raise NotFound("resource not found")
            if current["status"] == "SCHEDULED":
                raw_due = candidate.get("scheduled_for_utc")
                if not raw_due:
                    raise StateConflict("scheduled post is missing its active schedule")
                due = datetime.fromisoformat(str(raw_due).replace("Z", "+00:00"))
                if due.astimezone(UTC) <= datetime.now(UTC):
                    raise StateConflict("scheduled post no longer has a future valid schedule")
        source_action = "UPDATE_PUBLISHED" if current["status"] == "PUBLISHED" else f"SAVE_{current['status']}"
        post = await self.repository.update_post(
            context,
            post_id=post_id,
            actor_admin_id=principal.admin_id,
            expected_version=expected,
            values=values,
            source_action=source_action,
        )
        await self._audit(context, principal, event_code="POST.UPDATE", target_type="POST", target_id=post_id, operation_id=operation_id)
        if current["status"] == "PUBLISHED":
            await self._emit_post_effect(context, action="UPDATE_PUBLISHED", post=post)
        return 200, {"post": post}, {}

    async def _autosave(self, context: SiteContext, principal: AdminPrincipal, post_id: str, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.edit")
        current = await self._post_or_404(context, post_id)
        require_transition(current["status"], "EDIT")
        if int(body["base_version"]) != int(current["version"]):
            raise VersionConflict("post version conflict")
        working = dict(body["working_copy"])
        await self._validate_post_permissions_and_relationships(context, principal, working, post_id=post_id)
        version = parse_content_schema_version(working["body"]["content_schema_version"])
        saved = await self.repository.save_autosave(
            context,
            post_id=post_id,
            editor_admin_id=principal.admin_id,
            editor_instance_id=str(body["editor_instance_id"]),
            base_version=int(body["base_version"]),
            working_copy=working,
            content_schema_version=version,
        )
        await self._audit(context, principal, event_code="POST.AUTOSAVE", target_type="POST", target_id=post_id, operation_id=operation_id)
        return 201, saved, {}

    async def _latest_autosave(self, context: SiteContext, principal: AdminPrincipal, post_id: str, query: dict[str, Any]):
        self._require(principal, context, "posts.view", "posts.edit")
        await self._post_or_404(context, post_id)
        saved = await self.repository.get_latest_autosave(context, post_id=post_id, editor_admin_id=principal.admin_id, editor_instance_id=str(query["editor_instance_id"]))
        if saved is None:
            raise NotFound("resource not found")
        return 200, saved, {}

    async def _preview_handoff(self, context: SiteContext, principal: AdminPrincipal, post_id: str, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.preview")
        post = await self._post_or_404(context, post_id)
        if self.preview_issuer is None:
            raise StateConflict("preview handoff service is unavailable")
        source_kind = body["source_kind"]
        if source_kind == "COMMITTED":
            if post["status"] == "PUBLISHED":
                raise validation_error(
                    "source_kind",
                    "A committed PUBLISHED Post is already public; Preview requires a private autosaved or working-copy source.",
                    "INVALID_PREVIEW_SOURCE",
                )
            source_snapshot = f"COMMITTED:{post['version']}"
        elif source_kind == "AUTOSAVE":
            editor_instance_id = body.get("editor_instance_id")
            if not isinstance(editor_instance_id, str) or not editor_instance_id.strip():
                raise validation_error("editor_instance_id", "AUTOSAVE preview requires the current editor_instance_id.")
            saved = await self.repository.get_latest_autosave(
                context, post_id=post_id, editor_admin_id=principal.admin_id, editor_instance_id=editor_instance_id
            )
            if saved is None:
                raise NotFound("resource not found")
            source_snapshot = f"AUTOSAVE:{saved['autosave_id']}:{saved['base_version']}"
        elif source_kind == "WORKING_COPY":
            if body.get("working_copy") is None or body.get("base_version") is None:
                raise validation_error("working_copy", "WORKING_COPY preview requires base_version and working_copy.")
            base_version = int(body["base_version"])
            if base_version != int(post["version"]):
                raise VersionConflict("post version conflict")
            working_copy = dict(body["working_copy"])
            await self._validate_post_permissions_and_relationships(
                context,
                principal,
                working_copy,
                post_id=post_id,
            )
            source_snapshot = encode_working_copy_preview_snapshot(base_version, working_copy)
        else:
            raise validation_error("source_kind", "Preview source kind is invalid.")
        raw, expires = await self.preview_issuer.issue_handoff(
            context,
            post_id=post_id,
            initiating_admin_id=principal.admin_id,
            source_snapshot=source_snapshot,
        )
        preview_url = f"https://{context.canonical_domain}/_preview/post/{post_id}?handoff={raw}"
        await self._audit(context, principal, event_code="POST.PREVIEW.HANDOFF", target_type="POST", target_id=post_id, operation_id=operation_id)
        return 201, {"preview_url": preview_url, "expires_at": expires.isoformat()}, {"Cache-Control": "no-store"}

    async def _lifecycle(self, context: SiteContext, principal: AdminPrincipal, operation_id: str, post_id: str, body: dict[str, Any]):
        action = {
            "API15-S-017": "SCHEDULE",
            "API15-S-018": "UNSCHEDULE",
            "API15-S-019": "PUBLISH",
            "API15-S-020": "ARCHIVE",
            "API15-S-021": "TRASH",
            "API15-S-022": "RESTORE",
            "API15-S-023": "PERMANENT_DELETE",
        }[operation_id]
        self._require(principal, context, *LIFECYCLE_PERMISSIONS[action])
        post = await self._post_or_404(context, post_id)
        target_status = require_transition(post["status"], action)
        expected = int(body["expected_version"])
        values: dict[str, Any] = {}
        schedule_local = None
        schedule_tz = None
        schedule_utc = None
        if action in {"SCHEDULE", "PUBLISH"}:
            eligible = await self._ensure_public_eligibility(context, post)
            if eligible.get("slug") != post.get("slug"):
                values["slug"] = eligible["slug"]
        if action == "SCHEDULE":
            schedule_local = body["schedule_local_input"]
            schedule_tz = body["schedule_timezone_id"]
            if not context.timezone or schedule_tz != context.timezone:
                raise validation_error(
                    "schedule_timezone_id",
                    "Schedule timezone must equal the current configured site timezone.",
                )
            schedule_utc = resolve_schedule(schedule_local, schedule_tz)
        semantic_action = "RESCHEDULE" if action == "SCHEDULE" and post["status"] == "SCHEDULED" else action
        result = await self.repository.transition_post(
            context,
            post_id=post_id,
            actor_admin_id=principal.admin_id,
            expected_version=expected,
            new_status=target_status or "TERMINAL",
            source_action=semantic_action,
            schedule_local_input=schedule_local,
            schedule_timezone_id=schedule_tz,
            scheduled_for_utc=schedule_utc,
            values=values,
        )
        await self._audit(context, principal, event_code=f"POST.{semantic_action}", target_type="POST", target_id=post_id, operation_id=operation_id)
        if action == "PERMANENT_DELETE":
            return 204, None, {}
        assert result is not None
        await self._emit_post_effect(context, action=semantic_action, post=result)
        return 200, {"post": result}, {}

    async def _duplicate(self, context: SiteContext, principal: AdminPrincipal, post_id: str, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.create", "posts.duplicate")
        source = await self._post_or_404(context, post_id)
        if source["status"] == "TRASH":
            raise StateConflict("trashed posts cannot be duplicated")
        post = await self.repository.duplicate_post(
            context,
            source_post_id=post_id,
            actor_admin_id=principal.admin_id,
            title_override=body.get("title_override") if body else None,
        )
        await self._audit(context, principal, event_code="POST.DUPLICATE", target_type="POST", target_id=post["post_id"], operation_id=operation_id, extra={"source_post_id": post_id})
        return 201, {"post": post}, {}

    async def _bulk(self, context: SiteContext, principal: AdminPrincipal, body: dict[str, Any], operation_id: str):
        action = body["action"]
        if action not in BULK_ACTIONS:
            raise validation_error("action", "Bulk action is not supported.")
        self._require(principal, context, *LIFECYCLE_PERMISSIONS[action])
        targets = body["targets"]
        # Security gate: resolve every target first. Wrong-site/nonexistent is not a
        # normal per-row business result and aborts the whole request.
        loaded: dict[str, dict[str, Any]] = {}
        for target in targets:
            post_id = str(target["post_id"])
            loaded[post_id] = await self._post_or_404(context, post_id)
        outcomes = []
        for target in targets:
            post_id = str(target["post_id"])
            current = loaded[post_id]
            try:
                target_status = require_transition(current["status"], action)
                values: dict[str, Any] = {}
                schedule_local = None
                schedule_tz = None
                schedule_utc = None
                if action in {"SCHEDULE", "PUBLISH"}:
                    eligible = await self._ensure_public_eligibility(context, current)
                    if eligible.get("slug") != current.get("slug"):
                        values["slug"] = eligible["slug"]
                if action == "SCHEDULE":
                    schedule_local = body.get("schedule_local_input")
                    schedule_tz = body.get("schedule_timezone_id")
                    if not schedule_local or not schedule_tz:
                        raise validation_error("schedule_local_input", "Bulk SCHEDULE requires schedule fields.")
                    if not context.timezone or schedule_tz != context.timezone:
                        raise validation_error(
                            "schedule_timezone_id",
                            "Schedule timezone must equal the current configured site timezone.",
                        )
                    schedule_utc = resolve_schedule(schedule_local, schedule_tz)
                result = await self.repository.transition_post(
                    context,
                    post_id=post_id,
                    actor_admin_id=principal.admin_id,
                    expected_version=int(target["expected_version"]),
                    new_status=target_status or "TERMINAL",
                    source_action=f"BULK_{'RESCHEDULE' if action == 'SCHEDULE' and current['status'] == 'SCHEDULED' else action}",
                    schedule_local_input=schedule_local,
                    schedule_timezone_id=schedule_tz,
                    scheduled_for_utc=schedule_utc,
                    values=values,
                )
                outcomes.append({"post_id": post_id, "status": "SUCCESS"})
                if result is not None:
                    effect_action = "RESCHEDULE" if action == "SCHEDULE" and current["status"] == "SCHEDULED" else action
                    await self._emit_post_effect(context, action=effect_action, post=result)
            except VersionConflict:
                outcomes.append({"post_id": post_id, "status": "CONFLICT", "error_code": "VERSION_CONFLICT"})
            except (ValidationFault, StateConflict) as exc:
                outcomes.append({"post_id": post_id, "status": "VALIDATION_FAILED", "error_code": getattr(exc, "code", "VALIDATION_FAILED")})
        await self._audit(context, principal, event_code=f"POST.BULK.{action}", target_type="POST_SET", target_id=context.site_id, operation_id=operation_id, extra={"target_count": len(targets)})
        return 200, {"outcomes": outcomes}, {}

    async def _revisions(self, context: SiteContext, post_id: str, query: dict[str, Any]):
        await self._post_or_404(context, post_id)
        page, page_size = self._page(query)
        items, has_more = await self.repository.list_revisions(context, post_id=post_id, page=page, page_size=page_size)
        return 200, {"items": items, "page": self._page_meta(page, page_size, has_more)}, {}

    async def _restore_revision(self, context: SiteContext, principal: AdminPrincipal, post_id: str, revision_id: str, body: dict[str, Any], operation_id: str):
        self._require(principal, context, "posts.view", "posts.edit", "posts.revisions.view", "posts.revisions.restore")
        current = await self._post_or_404(context, post_id)
        require_transition(current["status"], "REVISION_RESTORE")
        revision = await self.repository.get_revision(context, post_id=post_id, revision_id=revision_id)
        if revision is None:
            raise NotFound("resource not found")
        snapshot = revision["snapshot"]
        restorable = {
            "title",
            "excerpt",
            "body",
            "author_site_profile_id",
            "featured_media_id",
            "category_ids",
            "tag_ids",
            "manual_related_post_ids",
            *POST_SEO_FIELDS,
        }
        restore_fields = {
            key for key in restorable
            if key in snapshot and snapshot.get(key) != current.get(key)
        }
        changed_values = {key: snapshot.get(key) for key in restore_fields}
        # Section 22.3 requires field permissions only for fields that would change.
        await self._validate_post_permissions_and_relationships(
            context,
            principal,
            changed_values,
            post_id=post_id,
        )
        candidate = {**current, **changed_values}
        if current["status"] in {"SCHEDULED", "PUBLISHED"}:
            validate_publish_eligibility(candidate, embed_registry=self.embed_provider_registry)
            if not await self.repository.relationships_exist(
                context,
                author_id=str(candidate["author_site_profile_id"]),
                category_ids=[str(v) for v in candidate.get("category_ids") or []],
                tag_ids=[str(v) for v in candidate.get("tag_ids") or []],
                media_ids=[str(v) for v in [candidate.get("featured_media_id"), candidate.get("og_image_media_id")] if v],
                related_post_ids=[str(v) for v in candidate.get("manual_related_post_ids") or []],
            ):
                raise NotFound("resource not found")
            if current["status"] == "SCHEDULED":
                raw_due = candidate.get("scheduled_for_utc")
                if not raw_due:
                    raise StateConflict("scheduled post is missing its active schedule")
                due = datetime.fromisoformat(str(raw_due).replace("Z", "+00:00"))
                if due.astimezone(UTC) <= datetime.now(UTC):
                    raise StateConflict("scheduled post no longer has a future valid schedule")
        post = await self.repository.restore_revision(
            context,
            post_id=post_id,
            revision_id=revision_id,
            actor_admin_id=principal.admin_id,
            expected_version=int(body["expected_version"]),
            restore_fields=restore_fields,
        )
        await self._audit(context, principal, event_code="POST.REVISION.RESTORE", target_type="POST", target_id=post_id, operation_id=operation_id, extra={"revision_id": revision_id})
        if current["status"] == "PUBLISHED":
            await self._emit_post_effect(context, action="REVISION_RESTORE_PUBLISHED", post=post)
        return 200, {"post": post}, {}

    async def _url_history(self, context: SiteContext, post_id: str):
        await self._post_or_404(context, post_id)
        return 200, {"items": await self.repository.list_url_history(context, post_id=post_id)}, {}

    async def _categories(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, path: dict[str, Any], body: Any):
        if operation_id == "API15-S-030":
            self._require(principal, context, "categories.view")
            items, _ = await self.repository.list_categories(context, page=1, page_size=100)
            if not self._can(principal, context, "seo.view"):
                items = [self._without_fields(item, CATEGORY_SEO_FIELDS) for item in items]
            return 200, {"items": items}, {}
        if operation_id == "API15-S-031":
            self._require(principal, context, "categories.view", "categories.create")
            values = await self._normalize_category(context, principal, dict(body), None)
            item = await self.repository.create_category(context, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="CATEGORY.CREATE", target_type="CATEGORY", target_id=item["category_id"], operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.CATEGORY.CHANGED", entity_type="CATEGORY", entity_id=item["category_id"])
            if not self._can(principal, context, "seo.view"):
                item = self._without_fields(item, CATEGORY_SEO_FIELDS)
            return 201, {"category": item}, {}
        category_id = str(path["category_id"])
        existing = await self.repository.get_category(context, category_id)
        if existing is None:
            raise NotFound("resource not found")
        if operation_id == "API15-S-032":
            self._require(principal, context, "categories.view")
            if not self._can(principal, context, "seo.view"):
                existing = self._without_fields(existing, CATEGORY_SEO_FIELDS)
            return 200, {"category": existing}, {}
        if operation_id == "API15-S-033":
            self._require(principal, context, "categories.view", "categories.edit")
            values = await self._normalize_category(context, principal, dict(body), category_id)
            item = await self.repository.update_category(context, category_id=category_id, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="CATEGORY.UPDATE", target_type="CATEGORY", target_id=category_id, operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.CATEGORY.CHANGED", entity_type="CATEGORY", entity_id=category_id)
            if not self._can(principal, context, "seo.view"):
                item = self._without_fields(item, CATEGORY_SEO_FIELDS)
            return 200, {"category": item}, {}
        self._require(principal, context, "categories.view", "categories.delete")
        await self.repository.retire_category(context, category_id=category_id, actor_admin_id=principal.admin_id)
        await self._audit(context, principal, event_code="CATEGORY.RETIRE", target_type="CATEGORY", target_id=category_id, operation_id=operation_id)
        await self._emit_site_effect(context, effect_type="EDITORIAL.CATEGORY.RETIRED", entity_type="CATEGORY", entity_id=category_id)
        return 204, None, {}

    async def _normalize_category(self, context: SiteContext, principal: AdminPrincipal, values: dict[str, Any], category_id: str | None):
        if any(field in values for field in CATEGORY_SEO_FIELDS):
            self._require(principal, context, "seo.view", "seo.edit")
        if "slug" in values:
            values["slug"] = normalize_slug(values["slug"])
            if not await self.repository.slug_available(context, entity="CATEGORY", slug=values["slug"], exclude_id=category_id):
                raise Conflict("slug conflict")
        elif category_id is None:
            values["slug"] = normalize_slug(values["name"])
            if not await self.repository.slug_available(context, entity="CATEGORY", slug=values["slug"]):
                raise Conflict("slug conflict")
        if category_id is not None and values.get("parent_category_id") == category_id:
            raise validation_error("parent_category_id", "Category cannot be its own parent.")
        if values.get("parent_category_id"):
            parent_id = str(values["parent_category_id"])
            if not await self.repository.relationships_exist(context, category_ids=[parent_id]):
                raise NotFound("resource not found")
            if category_id is not None and await self.repository.category_parent_would_cycle(
                context, category_id=category_id, parent_category_id=parent_id
            ):
                raise validation_error("parent_category_id", "Category hierarchy cannot contain a cycle.")
        return values

    async def _tags(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, path: dict[str, Any], body: Any):
        if operation_id == "API15-S-040":
            self._require(principal, context, "tags.view")
            items, _ = await self.repository.list_tags(context, page=1, page_size=100)
            return 200, {"items": items}, {}
        if operation_id == "API15-S-041":
            self._require(principal, context, "tags.view", "tags.create")
            values = dict(body)
            values["slug"] = normalize_slug(values.get("slug") or values["name"])
            if not await self.repository.slug_available(context, entity="TAG", slug=values["slug"]):
                raise Conflict("slug conflict")
            item = await self.repository.create_tag(context, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="TAG.CREATE", target_type="TAG", target_id=item["tag_id"], operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.TAG.CHANGED", entity_type="TAG", entity_id=item["tag_id"])
            return 201, {"tag": item}, {}
        tag_id = str(path["tag_id"])
        existing = await self.repository.get_tag(context, tag_id)
        if existing is None:
            raise NotFound("resource not found")
        if operation_id == "API15-S-042":
            self._require(principal, context, "tags.view")
            return 200, {"tag": existing}, {}
        if operation_id == "API15-S-043":
            self._require(principal, context, "tags.view", "tags.edit")
            values = dict(body)
            if "slug" in values:
                values["slug"] = normalize_slug(values["slug"])
                if not await self.repository.slug_available(context, entity="TAG", slug=values["slug"], exclude_id=tag_id):
                    raise Conflict("slug conflict")
            item = await self.repository.update_tag(context, tag_id=tag_id, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="TAG.UPDATE", target_type="TAG", target_id=tag_id, operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.TAG.CHANGED", entity_type="TAG", entity_id=tag_id)
            return 200, {"tag": item}, {}
        if operation_id == "API15-S-044":
            self._require(principal, context, "tags.view", "tags.delete")
            await self.repository.retire_tag(context, tag_id=tag_id, actor_admin_id=principal.admin_id)
            await self._audit(context, principal, event_code="TAG.RETIRE", target_type="TAG", target_id=tag_id, operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.TAG.RETIRED", entity_type="TAG", entity_id=tag_id)
            return 204, None, {}
        self._require(principal, context, "tags.view", "tags.edit", "tags.delete")
        target_id = str(body["target_tag_id"])
        if target_id == tag_id:
            raise validation_error("target_tag_id", "A tag cannot be merged into itself.")
        if await self.repository.get_tag(context, target_id) is None:
            raise NotFound("resource not found")
        item = await self.repository.merge_tag(context, source_tag_id=tag_id, target_tag_id=target_id, actor_admin_id=principal.admin_id)
        await self._audit(context, principal, event_code="TAG.MERGE", target_type="TAG", target_id=tag_id, operation_id=operation_id, extra={"target_tag_id": target_id})
        await self._emit_site_effect(context, effect_type="EDITORIAL.TAG.MERGED", entity_type="TAG", entity_id=tag_id)
        return 200, {"tag": item}, {}

    async def _authors(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, path: dict[str, Any], body: Any):
        if operation_id == "API15-S-050":
            self._require(principal, context, "authors.view")
            items, _ = await self.repository.list_authors(context, page=1, page_size=100)
            if not self._can(principal, context, "seo.view"):
                items = [self._without_fields(item, AUTHOR_SEO_FIELDS) for item in items]
            return 200, {"items": items}, {}
        if operation_id == "API15-S-051":
            self._require(principal, context, "authors.view", "authors.create")
            values = await self._normalize_author(context, principal, dict(body), None)
            item = await self.repository.create_author(context, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="AUTHOR.CREATE", target_type="AUTHOR", target_id=item["author_id"], operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.AUTHOR.CHANGED", entity_type="AUTHOR", entity_id=item["author_id"])
            if not self._can(principal, context, "seo.view"):
                item = self._without_fields(item, AUTHOR_SEO_FIELDS)
            return 201, {"author": item}, {}
        author_id = str(path["author_id"])
        existing = await self.repository.get_author(context, author_id)
        if existing is None:
            raise NotFound("resource not found")
        if operation_id == "API15-S-052":
            self._require(principal, context, "authors.view")
            if not self._can(principal, context, "seo.view"):
                existing = self._without_fields(existing, AUTHOR_SEO_FIELDS)
            return 200, {"author": existing}, {}
        if operation_id == "API15-S-053":
            self._require(principal, context, "authors.view", "authors.edit")
            values = await self._normalize_author(context, principal, dict(body), author_id)
            item = await self.repository.update_author(context, author_id=author_id, actor_admin_id=principal.admin_id, values=values)
            await self._audit(context, principal, event_code="AUTHOR.UPDATE", target_type="AUTHOR", target_id=author_id, operation_id=operation_id)
            await self._emit_site_effect(context, effect_type="EDITORIAL.AUTHOR.CHANGED", entity_type="AUTHOR", entity_id=author_id)
            if not self._can(principal, context, "seo.view"):
                item = self._without_fields(item, AUTHOR_SEO_FIELDS)
            return 200, {"author": item}, {}
        self._require(principal, context, "authors.view", "authors.retire")
        item = await self.repository.retire_author(context, author_id=author_id, actor_admin_id=principal.admin_id)
        await self._audit(context, principal, event_code="AUTHOR.RETIRE", target_type="AUTHOR", target_id=author_id, operation_id=operation_id)
        await self._emit_site_effect(context, effect_type="EDITORIAL.AUTHOR.RETIRED", entity_type="AUTHOR", entity_id=author_id)
        if not self._can(principal, context, "seo.view"):
            item = self._without_fields(item, AUTHOR_SEO_FIELDS)
        return 200, {"author": item}, {}

    async def _normalize_author(self, context: SiteContext, principal: AdminPrincipal, values: dict[str, Any], author_id: str | None):
        if any(field in values for field in AUTHOR_SEO_FIELDS):
            self._require(principal, context, "seo.view", "seo.edit")
        if values.get("avatar_media_id"):
            self._require(principal, context, "media.view")
            if not await self.repository.relationships_exist(context, media_ids=[str(values["avatar_media_id"])]):
                raise NotFound("resource not found")
        if "slug" in values:
            values["slug"] = normalize_slug(values["slug"])
        elif author_id is None:
            values["slug"] = normalize_slug(values["display_name"])
        if "slug" in values and not await self.repository.slug_available(context, entity="AUTHOR", slug=values["slug"], exclude_id=author_id):
            raise Conflict("slug conflict")
        return values

    async def _navigation(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, path: dict[str, Any], body: Any):
        if operation_id == "API15-S-070":
            self._require(principal, context, "navigation.view")
            return 200, await self.repository.get_navigation(context), {}
        self._require(principal, context, "navigation.view", "navigation.manage")
        menu_key = str(path["menu_key"])
        items = validate_navigation_items(body["items"])
        self._validate_static_navigation_urls(context, items)
        await self.repository.replace_navigation_menu(
            context,
            menu_key=menu_key,
            actor_admin_id=principal.admin_id,
            items=items,
        )
        await self._audit(context, principal, event_code="NAVIGATION.UPDATE", target_type="NAVIGATION_MENU", target_id=menu_key, operation_id=operation_id)
        await self._emit_site_effect(context, effect_type="EDITORIAL.NAVIGATION.CHANGED", entity_type="SITE", entity_id=context.site_id)
        return 200, await self.repository.get_navigation(context), {}

    @staticmethod
    def _validate_static_navigation_urls(context: SiteContext, items: list[dict[str, Any]]) -> None:
        def visit(item: dict[str, Any]) -> None:
            destination = item["destination"]
            if destination.get("kind") == "STATIC":
                static_key = destination.get("static_page_key")
                if static_key not in STATIC_PAGE_ROUTES:
                    raise validation_error("items", "STATIC navigation requires a frozen static page key.")
            for child in item["children"]:
                visit(child)

        for item in items:
            visit(item)

    async def _homepage(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, body: Any):
        if operation_id == "API15-S-072":
            self._require(principal, context, "navigation.view")
            return 200, {"homepage": await self.repository.get_homepage(context)}, {}
        self._require(principal, context, "navigation.view", "navigation.manage")
        lead_post_id = body.get("lead_post_id")
        if lead_post_id is not None:
            self._require(principal, context, "posts.view")
            lead = await self.repository.get_post(context, str(lead_post_id))
            if lead is None:
                raise NotFound("resource not found")
            if lead.get("status") != "PUBLISHED":
                raise validation_error("lead_post_id", "Homepage lead Post must currently be PUBLISHED and same-site.")
        post_ids: list[str] = []
        category_ids: list[str] = []
        for section in body.get("sections", []):
            post_ids.extend(str(value) for value in section.get("post_ids") or [])
            category_ids.extend(str(value) for value in section.get("category_ids") or [])
        if post_ids:
            self._require(principal, context, "posts.view")
        if category_ids:
            self._require(principal, context, "categories.view")
        if not await self.repository.relationships_exist(
            context,
            related_post_ids=list(dict.fromkeys(post_ids)),
            category_ids=list(dict.fromkeys(category_ids)),
        ):
            raise NotFound("resource not found")
        result = await self.repository.update_homepage(context, actor_admin_id=principal.admin_id, payload=dict(body))
        await self._audit(context, principal, event_code="HOMEPAGE.UPDATE", target_type="HOMEPAGE", target_id=context.site_id, operation_id=operation_id)
        await self._emit_site_effect(context, effect_type="EDITORIAL.HOMEPAGE.CHANGED", entity_type="SITE", entity_id=context.site_id)
        return 200, {"homepage": result}, {}

    async def _calendar(self, context: SiteContext, query: dict[str, Any]):
        if not context.timezone:
            raise StateConflict("site timezone is unavailable")
        zone = ZoneInfo(context.timezone)
        now_local = datetime.now(UTC).astimezone(zone)
        raw_from = query.get("from")
        raw_to = query.get("to")
        from_input = datetime.fromisoformat(raw_from.replace("Z", "+00:00")) if raw_from else now_local - timedelta(days=31)
        to_input = datetime.fromisoformat(raw_to.replace("Z", "+00:00")) if raw_to else now_local + timedelta(days=31)
        if from_input.tzinfo is None or to_input.tzinfo is None:
            raise validation_error("from", "Calendar date-time filters must include an explicit offset.")
        from_local = from_input.astimezone(zone)
        to_local = to_input.astimezone(zone)
        if from_local > to_local:
            raise validation_error("from", "Calendar from must not be after to.")
        from_date = from_local.date()
        to_date = to_local.date()
        from_utc = datetime.combine(from_date, datetime.min.time(), tzinfo=zone).astimezone(UTC)
        to_utc_exclusive = datetime.combine(to_date + timedelta(days=1), datetime.min.time(), tzinfo=zone).astimezone(UTC)
        items = await self.repository.calendar(
            context, from_utc=from_utc, to_utc_exclusive=to_utc_exclusive
        )
        status = query.get("status")
        if status:
            items = [item for item in items if item["status"] == status]
        return 200, {"items": items, "from": from_date.isoformat(), "to": to_date.isoformat()}, {}

    async def _settings(self, operation_id: str, context: SiteContext, principal: AdminPrincipal, body: Any):
        if operation_id == "API15-S-096":
            self._require(principal, context, "site_settings.view")
            return 200, {"settings": await self.repository.get_site_settings(context)}, {}
        self._require(principal, context, "site_settings.view", "site_settings.edit")
        values = validate_site_settings_entries(body["settings"])
        if "presentation_config" in values:
            config = values["presentation_config"]
            if self.presentation_validator is None or not self.presentation_validator(config):
                raise validation_error(
                    "settings.presentation_config", "PresentationConfig is invalid."
                )
            media_ids = [
                str(part[field])
                for part, field in (
                    (config.get("branding") or {}, "logo_media_id"),
                    (config.get("hero") or {}, "media_id"),
                )
                if field in part
            ]
            cta = (config.get("hero") or {}).get("cta") or {}
            navigation_ids = [str(cta["navigation_item_id"])] if cta.get("enabled") is True else []
            if media_ids or navigation_ids:
                if not await self.repository.relationships_exist(
                    context,media_ids=media_ids,header_navigation_item_ids=navigation_ids,
                ):
                    raise NotFound("resource not found")
        if "static_pages" in values:
            if self.static_pages_validator is None or not self.static_pages_validator(
                values["static_pages"]
            ):
                raise validation_error("settings.static_pages", "StaticPages is invalid.")
        for key in {"logo_media_id", "favicon_media_id", "default_social_image_media_id"}:
            if values.get(key):
                self._require(principal, context, "media.view")
                if not await self.repository.relationships_exist(context, media_ids=[str(values[key])]):
                    raise NotFound("resource not found")
        settings = await self.repository.update_site_settings(context, actor_admin_id=principal.admin_id, values=values)
        await self._audit(context, principal, event_code="SITE_SETTINGS.UPDATE", target_type="SITE_SETTINGS", target_id=context.site_id, operation_id=operation_id)
        await self._emit_site_effect(context, effect_type="EDITORIAL.SITE_SETTINGS.CHANGED", entity_type="SITE", entity_id=context.site_id)
        return 200, {"settings": settings}, {}

    @staticmethod
    def _without_fields(item: dict[str, Any], fields: frozenset[str]) -> dict[str, Any]:
        return {key: value for key, value in item.items() if key not in fields}


@dataclass(slots=True)
class EditorialPreviewEligibility:
    """CHAT04 preview eligibility guard consumed by CHAT03 PreviewAuthorityService.

    The security service stores only a source locator. This guard confirms that the
    locator still belongs to the current same-site Post and has not become stale.
    Rendering remains behind the CHAT03/PublicPage boundary.
    """

    repository: EditorialRepositoryPort

    async def is_preview_eligible(self, context: SiteContext, *, post_id: str, source_snapshot: str | None = None) -> bool:
        post = await self.repository.get_post(context, post_id)
        if post is None:
            return False
        if source_snapshot is None:
            return post["status"] in {"DRAFT", "SCHEDULED", "ARCHIVED"}
        parts = source_snapshot.split(":", 2)
        if parts[0] == "COMMITTED" and len(parts) == 2:
            return str(post["version"]) == parts[1] and post["status"] in {"DRAFT", "SCHEDULED", "ARCHIVED"}
        if parts[0] == "AUTOSAVE" and len(parts) == 3:
            if post["status"] == "TRASH":
                return False
            autosave = await self.repository.get_autosave(
                context, post_id=post_id, autosave_id=parts[1]
            )
            return autosave is not None and str(autosave["base_version"]) == parts[2]
        working = decode_working_copy_preview_snapshot(source_snapshot)
        if working is not None:
            base_version, _ = working
            return post["status"] != "TRASH" and int(post["version"]) == base_version
        return False
