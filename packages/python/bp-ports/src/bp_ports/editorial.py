from __future__ import annotations

from datetime import datetime
from typing import Any, Protocol

from bp_domain.context import SiteContext


class EditorialRepositoryPort(Protocol):
    async def list_posts(self, context: SiteContext, *, filters: dict[str, Any], page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]: ...
    async def get_post(self, context: SiteContext, post_id: str) -> dict[str, Any] | None: ...
    async def create_post(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def update_post(
        self,
        context: SiteContext,
        *,
        post_id: str,
        actor_admin_id: str,
        expected_version: int,
        values: dict[str, Any],
        source_action: str,
    ) -> dict[str, Any]: ...
    async def transition_post(
        self,
        context: SiteContext,
        *,
        post_id: str,
        actor_admin_id: str,
        expected_version: int,
        new_status: str,
        source_action: str,
        schedule_local_input: str | None = None,
        schedule_timezone_id: str | None = None,
        scheduled_for_utc: datetime | None = None,
        values: dict[str, Any] | None = None,
    ) -> dict[str, Any] | None: ...
    async def duplicate_post(
        self,
        context: SiteContext,
        *,
        source_post_id: str,
        actor_admin_id: str,
        title_override: str | None,
    ) -> dict[str, Any]: ...
    async def save_autosave(
        self,
        context: SiteContext,
        *,
        post_id: str,
        editor_admin_id: str,
        editor_instance_id: str,
        base_version: int,
        working_copy: dict[str, Any],
        content_schema_version: int,
    ) -> dict[str, Any]: ...
    async def get_latest_autosave(self, context: SiteContext, *, post_id: str, editor_admin_id: str, editor_instance_id: str) -> dict[str, Any] | None: ...
    async def get_autosave(self, context: SiteContext, *, post_id: str, autosave_id: str) -> dict[str, Any] | None: ...
    async def list_revisions(self, context: SiteContext, *, post_id: str, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]: ...
    async def get_revision(self, context: SiteContext, *, post_id: str, revision_id: str) -> dict[str, Any] | None: ...
    async def restore_revision(
        self,
        context: SiteContext,
        *,
        post_id: str,
        revision_id: str,
        actor_admin_id: str,
        expected_version: int,
        restore_fields: set[str],
    ) -> dict[str, Any]: ...
    async def list_url_history(self, context: SiteContext, *, post_id: str) -> list[dict[str, Any]]: ...
    async def relationships_exist(
        self,
        context: SiteContext,
        *,
        author_id: str | None = None,
        category_ids: list[str] | None = None,
        tag_ids: list[str] | None = None,
        media_ids: list[str] | None = None,
        related_post_ids: list[str] | None = None,
    ) -> bool: ...
    async def slug_available(self, context: SiteContext, *, entity: str, slug: str, exclude_id: str | None = None) -> bool: ...
    async def generate_available_post_slug(self, context: SiteContext, *, base_slug: str, exclude_id: str | None = None) -> str: ...

    async def list_categories(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]: ...
    async def get_category(self, context: SiteContext, category_id: str) -> dict[str, Any] | None: ...
    async def create_category(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def update_category(self, context: SiteContext, *, category_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def retire_category(self, context: SiteContext, *, category_id: str, actor_admin_id: str) -> None: ...
    async def category_parent_would_cycle(
        self, context: SiteContext, *, category_id: str, parent_category_id: str
    ) -> bool: ...

    async def list_tags(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]: ...
    async def get_tag(self, context: SiteContext, tag_id: str) -> dict[str, Any] | None: ...
    async def create_tag(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def update_tag(self, context: SiteContext, *, tag_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def retire_tag(self, context: SiteContext, *, tag_id: str, actor_admin_id: str) -> None: ...
    async def merge_tag(self, context: SiteContext, *, source_tag_id: str, target_tag_id: str, actor_admin_id: str) -> dict[str, Any]: ...

    async def list_authors(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]: ...
    async def get_author(self, context: SiteContext, author_id: str) -> dict[str, Any] | None: ...
    async def create_author(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def update_author(self, context: SiteContext, *, author_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]: ...
    async def retire_author(self, context: SiteContext, *, author_id: str, actor_admin_id: str) -> dict[str, Any]: ...

    async def get_navigation(self, context: SiteContext) -> dict[str, Any]: ...
    async def replace_navigation_menu(self, context: SiteContext, *, menu_key: str, actor_admin_id: str, items: list[dict[str, Any]]) -> dict[str, Any]: ...
    async def get_homepage(self, context: SiteContext) -> dict[str, Any]: ...
    async def update_homepage(self, context: SiteContext, *, actor_admin_id: str, payload: dict[str, Any]) -> dict[str, Any]: ...

    async def calendar(
        self,
        context: SiteContext,
        *,
        from_utc: datetime,
        to_utc_exclusive: datetime,
    ) -> list[dict[str, Any]]: ...
    async def get_site_settings(self, context: SiteContext) -> list[dict[str, Any]]: ...
    async def update_site_settings(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> list[dict[str, Any]]: ...


class RequestIdempotencyPort(Protocol):
    async def claim_or_replay(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
    ) -> tuple[str, tuple[int, Any, dict[str, str]] | None]: ...

    async def store_outcome(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
        outcome: tuple[int, Any, dict[str, str]],
    ) -> None: ...

    async def abandon(
        self,
        *,
        key: str,
        actor_admin_id: str,
        scope_key: str,
        method: str,
        path: str,
        body: Any,
    ) -> None: ...


class PreviewHandoffIssuerPort(Protocol):
    async def issue_handoff(
        self,
        context: SiteContext,
        *,
        post_id: str,
        initiating_admin_id: str,
        source_snapshot: str,
    ) -> tuple[str, datetime]: ...
