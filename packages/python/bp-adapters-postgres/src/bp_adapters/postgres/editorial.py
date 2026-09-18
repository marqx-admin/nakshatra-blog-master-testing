from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any, Iterable
from uuid import uuid4

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from bp_domain.context import SiteContext
from bp_domain.editorial import STATIC_PAGE_ROUTES
from bp_domain.errors import Conflict, ErrorDetail, NotFound, StateConflict, ValidationFault, VersionConflict
from bp_ports import SiteTransactionPort


def _iso(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        text_value = value.isoformat()
        if value.tzinfo is not None:
            text_value = text_value.replace("+00:00", "Z")
        return text_value
    return str(value)


def _json(value: Any) -> str:
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def _mapping(row: Any) -> dict[str, Any]:
    return dict(row._mapping if hasattr(row, "_mapping") else row)


def _clean(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in payload.items() if value is not None}


def _social_to_db(value: Any) -> dict[str, Any]:
    if not isinstance(value, list):
        return {}
    result: dict[str, Any] = {}
    for item in value:
        if not isinstance(item, dict) or not item.get("platform"):
            continue
        result[str(item["platform"])] = {key: item[key] for key in ("label", "url") if item.get(key) is not None}
    return result


def _social_from_db(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, dict):
        return []
    result: list[dict[str, Any]] = []
    for platform in sorted(value):
        data = value[platform]
        if isinstance(data, str):
            result.append({"platform": platform, "url": data})
        elif isinstance(data, dict) and data.get("url"):
            result.append({"platform": platform, **{key: data[key] for key in ("label", "url") if data.get(key) is not None}})
    return result


class PostgresEditorialRepository:
    """CHAT04 persistence adapter over the accepted CHAT02 transaction/RLS seam.

    The adapter contains no DDL or migration behavior. Every method requires a trusted
    SiteContext and executes inside ``SiteTransactionPort`` so DOC-08 RLS and same-site
    foreign keys remain authoritative.
    """

    def __init__(self, site_transactions: SiteTransactionPort) -> None:
        self._site_transactions = site_transactions

    async def list_posts(self, context: SiteContext, *, filters: dict[str, Any], page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]:
        clauses = ["p.site_id = :site_id"]
        params: dict[str, Any] = {"site_id": context.site_id, "limit": page_size + 1, "offset": (page - 1) * page_size}
        joins: list[str] = []
        if filters.get("status"):
            clauses.append("p.status = :status")
            params["status"] = filters["status"]
        if filters.get("search"):
            clauses.append("(p.title ILIKE :search OR COALESCE(p.excerpt,'') ILIKE :search)")
            params["search"] = f"%{filters['search']}%"
        if filters.get("author_id"):
            clauses.append("p.author_site_profile_id = :author_id")
            params["author_id"] = filters["author_id"]
        if filters.get("category_id"):
            joins.append("JOIN post_categories pc ON pc.site_id=p.site_id AND pc.post_id=p.post_id")
            clauses.append("pc.category_id = :category_id")
            params["category_id"] = filters["category_id"]
        if filters.get("tag_id"):
            joins.append("JOIN post_tags pt ON pt.site_id=p.site_id AND pt.post_id=p.post_id")
            clauses.append("pt.tag_id = :tag_id")
            params["tag_id"] = filters["tag_id"]
        sort = str(filters.get("sort") or "UPDATED_DESC").upper()
        order = {
            "UPDATED_DESC": "p.updated_at DESC, p.post_id ASC",
            "UPDATED_ASC": "p.updated_at ASC, p.post_id ASC",
            "CREATED_DESC": "p.created_at DESC, p.post_id ASC",
            "CREATED_ASC": "p.created_at ASC, p.post_id ASC",
            "PUBLISHED_DESC": "p.published_at DESC NULLS LAST, p.post_id ASC",
            "PUBLISHED_ASC": "p.published_at ASC NULLS LAST, p.post_id ASC",
            "TITLE_ASC": "p.title ASC, p.post_id ASC",
            "TITLE_DESC": "p.title DESC, p.post_id ASC",
        }.get(sort)
        if order is None:
            raise ValidationFault("request validation failed")
        sql = text(
            f"SELECT DISTINCT p.* FROM posts p {' '.join(joins)} WHERE {' AND '.join(clauses)} "
            f"ORDER BY {order} LIMIT :limit OFFSET :offset"
        )
        async with self._site_transactions.transaction(context) as connection:
            rows = connection.execute(sql, params).fetchall()
            result = [self._load_post(connection, context, str(_mapping(row)["post_id"])) for row in rows[:page_size]]
        return result, len(rows) > page_size

    async def get_post(self, context: SiteContext, post_id: str) -> dict[str, Any] | None:
        async with self._site_transactions.transaction(context) as connection:
            return self._load_post(connection, context, post_id)

    def _load_post(self, connection: Any, context: SiteContext, post_id: str) -> dict[str, Any] | None:
        row = connection.execute(
            text("SELECT * FROM posts WHERE site_id=:site_id AND post_id=:post_id"),
            {"site_id": context.site_id, "post_id": post_id},
        ).fetchone()
        if row is None:
            return None
        data = _mapping(row)
        categories = [
            str(item[0])
            for item in connection.execute(
                text("SELECT category_id FROM post_categories WHERE site_id=:site_id AND post_id=:post_id ORDER BY category_id"),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchall()
        ]
        tags = [
            str(item[0])
            for item in connection.execute(
                text("SELECT tag_id FROM post_tags WHERE site_id=:site_id AND post_id=:post_id ORDER BY tag_id"),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchall()
        ]
        related = [
            str(item[0])
            for item in connection.execute(
                text("SELECT related_post_id FROM post_related_posts WHERE site_id=:site_id AND post_id=:post_id ORDER BY position"),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchall()
        ]
        body = data.get("body")
        if not isinstance(body, dict):
            body = {"blocks": []}
        body = dict(body)
        body.setdefault("content_schema_version", str(data["content_schema_version"]))
        body["content_schema_version"] = str(body["content_schema_version"])
        payload = {
            "post_id": str(data["post_id"]),
            "status": data["status"],
            "version": int(data["version"]),
            "title": data.get("title"),
            "excerpt": data.get("excerpt"),
            "body": body,
            "category_ids": categories,
            "tag_ids": tags,
            "featured_media_id": str(data["featured_media_id"]) if data.get("featured_media_id") else None,
            "manual_related_post_ids": related,
            "slug": data.get("slug"),
            "seo_title": data.get("seo_title"),
            "meta_description": data.get("meta_description"),
            "canonical_override": data.get("canonical_override"),
            "index_policy": data.get("index_policy"),
            "link_robots_policy": data.get("link_robots_policy"),
            "og_title": data.get("og_title"),
            "og_description": data.get("og_description"),
            "author_site_profile_id": str(data["author_site_profile_id"]) if data.get("author_site_profile_id") else None,
            "og_image_media_id": str(data["og_image_media_id"]) if data.get("og_image_media_id") else None,
            "breadcrumb_label": data.get("breadcrumb_label"),
            "scheduled_for_utc": _iso(data.get("scheduled_for_utc")),
            "schedule_local_input": _iso(data.get("schedule_local_input")),
            "schedule_timezone_id": data.get("schedule_timezone_id"),
            "first_published_at": _iso(data.get("first_published_at")),
            "published_at": _iso(data.get("published_at")),
            "archived_at": _iso(data.get("archived_at")),
            "trashed_at": _iso(data.get("trashed_at")),
            "created_at": _iso(data.get("created_at")),
            "updated_at": _iso(data.get("updated_at")),
        }
        if isinstance(data.get("structured_data_inputs"), dict):
            payload["structured_data_inputs"] = data["structured_data_inputs"]
        return _clean(payload)

    @staticmethod
    def _post_db_values(values: dict[str, Any]) -> dict[str, Any]:
        mapping = {
            "title": "title",
            "excerpt": "excerpt",
            "author_site_profile_id": "author_site_profile_id",
            "featured_media_id": "featured_media_id",
            "slug": "slug",
            "seo_title": "seo_title",
            "meta_description": "meta_description",
            "canonical_override": "canonical_override",
            "index_policy": "index_policy",
            "link_robots_policy": "link_robots_policy",
            "og_title": "og_title",
            "og_description": "og_description",
            "og_image_media_id": "og_image_media_id",
            "breadcrumb_label": "breadcrumb_label",
        }
        result = {column: values[key] for key, column in mapping.items() if key in values}
        if "structured_data_inputs" in values:
            result["structured_data_inputs"] = _json(values["structured_data_inputs"])
        if "body" in values:
            result["body_json"] = _json(values["body"])
            try:
                result["content_schema_version"] = int(str(values["body"]["content_schema_version"]))
            except Exception as exc:
                raise ValidationFault("request validation failed") from exc
        return result

    def _replace_relationships(self, connection: Any, context: SiteContext, post_id: str, values: dict[str, Any]) -> None:
        for key, table, id_column in (
            ("category_ids", "post_categories", "category_id"),
            ("tag_ids", "post_tags", "tag_id"),
        ):
            if key not in values:
                continue
            connection.execute(text(f"DELETE FROM {table} WHERE site_id=:site_id AND post_id=:post_id"), {"site_id": context.site_id, "post_id": post_id})
            for item in values.get(key) or []:
                connection.execute(
                    text(f"INSERT INTO {table}(site_id,post_id,{id_column}) VALUES (:site_id,:post_id,:target_id)"),
                    {"site_id": context.site_id, "post_id": post_id, "target_id": item},
                )
        if "manual_related_post_ids" in values:
            connection.execute(text("DELETE FROM post_related_posts WHERE site_id=:site_id AND post_id=:post_id"), {"site_id": context.site_id, "post_id": post_id})
            for position, item in enumerate(values.get("manual_related_post_ids") or []):
                connection.execute(
                    text("INSERT INTO post_related_posts(site_id,post_id,related_post_id,position) VALUES (:site_id,:post_id,:target_id,:position)"),
                    {"site_id": context.site_id, "post_id": post_id, "target_id": item, "position": position},
                )

    def _sync_post_media_usages(self, connection: Any, context: SiteContext, post: dict[str, Any]) -> None:
        post_id = post["post_id"]
        connection.execute(
            text("DELETE FROM media_usages WHERE site_id=:site_id AND post_id=:post_id"),
            {"site_id": context.site_id, "post_id": post_id},
        )
        usages: list[tuple[str, str, str | None]] = []
        if post.get("featured_media_id"):
            usages.append(("POST_FEATURED", str(post["featured_media_id"]), None))
        if post.get("og_image_media_id"):
            usages.append(("POST_OG", str(post["og_image_media_id"]), None))
        body = post.get("body")
        if isinstance(body, dict):
            for block in body.get("blocks") or []:
                if isinstance(block, dict) and block.get("type") == "MEDIA" and block.get("media_id") and block.get("block_id"):
                    usages.append(("POST_BODY", str(block["media_id"]), str(block["block_id"])))
        for usage_kind, media_id, block_id in usages:
            connection.execute(
                text("INSERT INTO media_usages(site_id,media_id,usage_kind,post_id,block_id) VALUES (:site_id,:media_id,:kind,:post_id,:block_id)"),
                {"site_id": context.site_id, "media_id": media_id, "kind": usage_kind, "post_id": post_id, "block_id": block_id},
            )

    def _sync_site_setting_media_usages(self, connection: Any, context: SiteContext) -> None:
        connection.execute(
            text("DELETE FROM media_usages WHERE site_id=:site_id AND usage_kind IN ('SITE_LOGO','SITE_FAVICON','SITE_DEFAULT_SOCIAL')"),
            {"site_id": context.site_id},
        )
        row = connection.execute(
            text("SELECT logo_media_id,favicon_media_id,default_social_image_media_id FROM site_settings WHERE site_id=:site_id"),
            {"site_id": context.site_id},
        ).fetchone()
        if row is None:
            return
        values = _mapping(row)
        for column, usage_kind in (
            ("logo_media_id", "SITE_LOGO"),
            ("favicon_media_id", "SITE_FAVICON"),
            ("default_social_image_media_id", "SITE_DEFAULT_SOCIAL"),
        ):
            media_id = values.get(column)
            if media_id:
                connection.execute(
                    text("INSERT INTO media_usages(site_id,media_id,usage_kind,setting_slot) VALUES (:site_id,:media_id,:kind,:slot)"),
                    {"site_id": context.site_id, "media_id": media_id, "kind": usage_kind, "slot": column},
                )

    def _revision_snapshot(self, post: dict[str, Any]) -> dict[str, Any]:
        return dict(post)

    def _insert_revision(self, connection: Any, context: SiteContext, post: dict[str, Any], *, actor_admin_id: str | None, source_action: str, actor_type: str = "ADMIN") -> None:
        connection.execute(
            text(
                "INSERT INTO post_revisions(site_id,post_id,revision_number,source_action,actor_type,actor_admin_id,resulting_post_version,snapshot) "
                "VALUES (:site_id,:post_id,:revision_number,:source_action,:actor_type,:actor_admin_id,:version,CAST(:snapshot AS jsonb))"
            ),
            {
                "site_id": context.site_id,
                "post_id": post["post_id"],
                "revision_number": post["version"],
                "source_action": source_action,
                "actor_type": actor_type,
                "actor_admin_id": actor_admin_id,
                "version": post["version"],
                "snapshot": _json(self._revision_snapshot(post)),
            },
        )

    def _record_slug_transition(self, connection: Any, context: SiteContext, *, post_id: str, old_slug: str | None, new_slug: str | None, actor_admin_id: str, became_public: bool = False, ceased_public: bool = False) -> None:
        now = datetime.now(UTC)
        if old_slug and (ceased_public or old_slug != new_slug):
            connection.execute(
                text(
                    "UPDATE post_url_history SET ceased_public_at=COALESCE(ceased_public_at,:now) "
                    "WHERE site_id=:site_id AND post_id=:post_id AND slug=:slug AND ceased_public_at IS NULL"
                ),
                {"now": now, "site_id": context.site_id, "post_id": post_id, "slug": old_slug},
            )
        if new_slug and (became_public or (old_slug != new_slug and not ceased_public)):
            open_row = connection.execute(
                text("SELECT 1 FROM post_url_history WHERE site_id=:site_id AND post_id=:post_id AND slug=:slug AND ceased_public_at IS NULL"),
                {"site_id": context.site_id, "post_id": post_id, "slug": new_slug},
            ).fetchone()
            if open_row is None:
                connection.execute(
                    text("INSERT INTO post_url_history(site_id,post_id,slug,became_public_at,created_by_admin_id) VALUES (:site_id,:post_id,:slug,:now,:actor)"),
                    {"site_id": context.site_id, "post_id": post_id, "slug": new_slug, "now": now, "actor": actor_admin_id},
                )

    async def create_post(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        post_id = str(uuid4())
        db = self._post_db_values(values)
        columns = ["post_id", "site_id", "created_by_admin_id", "updated_by_admin_id"]
        params: dict[str, Any] = {"post_id": post_id, "site_id": context.site_id, "actor": actor_admin_id}
        value_sql = [":post_id", ":site_id", ":actor", ":actor"]
        for key, value in db.items():
            if key == "body_json":
                columns.append("body")
                value_sql.append("CAST(:body_json AS jsonb)")
            elif key == "structured_data_inputs":
                columns.append(key)
                value_sql.append("CAST(:structured_data_inputs AS jsonb)")
            else:
                columns.append(key)
                value_sql.append(f":{key}")
            params[key] = value
        try:
            async with self._site_transactions.transaction(context) as connection:
                connection.execute(text(f"INSERT INTO posts({','.join(columns)}) VALUES ({','.join(value_sql)})"), params)
                self._replace_relationships(connection, context, post_id, values)
                post = self._load_post(connection, context, post_id)
                assert post is not None
                self._sync_post_media_usages(connection, context, post)
                self._insert_revision(connection, context, post, actor_admin_id=actor_admin_id, source_action="CREATE")
                return post
        except IntegrityError as exc:
            raise Conflict("post create conflict") from exc

    async def update_post(self, context: SiteContext, *, post_id: str, actor_admin_id: str, expected_version: int, values: dict[str, Any], source_action: str) -> dict[str, Any]:
        db = self._post_db_values(values)
        try:
            async with self._site_transactions.transaction(context) as connection:
                before = self._load_post(connection, context, post_id)
                if before is None:
                    raise NotFound("resource not found")
                assignments = ["version=version+1", "updated_at=now()", "updated_by_admin_id=:actor"]
                params: dict[str, Any] = {"site_id": context.site_id, "post_id": post_id, "expected": expected_version, "actor": actor_admin_id}
                for key, value in db.items():
                    if key == "body_json":
                        assignments.append("body=CAST(:body_json AS jsonb)")
                    elif key == "structured_data_inputs":
                        assignments.append("structured_data_inputs=CAST(:structured_data_inputs AS jsonb)")
                    else:
                        assignments.append(f"{key}=:{key}")
                    params[key] = value
                row = connection.execute(
                    text(f"UPDATE posts SET {','.join(assignments)} WHERE site_id=:site_id AND post_id=:post_id AND version=:expected RETURNING post_id"),
                    params,
                ).fetchone()
                if row is None:
                    existing = connection.execute(text("SELECT version FROM posts WHERE site_id=:site_id AND post_id=:post_id"), {"site_id": context.site_id, "post_id": post_id}).fetchone()
                    if existing is None:
                        raise NotFound("resource not found")
                    raise VersionConflict("post version conflict")
                self._replace_relationships(connection, context, post_id, values)
                after = self._load_post(connection, context, post_id)
                assert after is not None
                self._sync_post_media_usages(connection, context, after)
                if before["status"] == "PUBLISHED" and before.get("slug") != after.get("slug"):
                    self._record_slug_transition(connection, context, post_id=post_id, old_slug=before.get("slug"), new_slug=after.get("slug"), actor_admin_id=actor_admin_id)
                self._insert_revision(connection, context, after, actor_admin_id=actor_admin_id, source_action=source_action)
                # Preserve per-tab autosaves. Durable version advancement makes older base versions stale without deleting sibling-tab recovery state.
                return after
        except IntegrityError as exc:
            raise Conflict("post update conflict") from exc

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
    ) -> dict[str, Any] | None:
        values = values or {}
        try:
            async with self._site_transactions.transaction(context) as connection:
                before = self._load_post(connection, context, post_id)
                if before is None:
                    raise NotFound("resource not found")
                if int(before["version"]) != expected_version:
                    raise VersionConflict("post version conflict")
                if new_status == "TERMINAL":
                    connection.execute(
                        text("UPDATE site_settings SET homepage_lead_post_id=NULL,updated_at=now() WHERE site_id=:site_id AND homepage_lead_post_id=:post_id"),
                        {"site_id": context.site_id, "post_id": post_id},
                    )
                    connection.execute(
                        text("DELETE FROM posts WHERE site_id=:site_id AND post_id=:post_id AND version=:expected"),
                        {"site_id": context.site_id, "post_id": post_id, "expected": expected_version},
                    )
                    return None
                assignments = ["status=:status", "version=version+1", "updated_at=now()", "updated_by_admin_id=:actor"]
                params: dict[str, Any] = {"site_id": context.site_id, "post_id": post_id, "expected": expected_version, "status": new_status, "actor": actor_admin_id}
                if new_status == "SCHEDULED":
                    assignments += ["scheduled_for_utc=:scheduled_for", "schedule_local_input=:schedule_local", "schedule_timezone_id=:schedule_tz", "archived_at=NULL", "trashed_at=NULL"]
                    params.update({"scheduled_for": scheduled_for_utc, "schedule_local": schedule_local_input, "schedule_tz": schedule_timezone_id})
                else:
                    assignments += ["scheduled_for_utc=NULL", "schedule_local_input=NULL", "schedule_timezone_id=NULL"]
                if new_status == "PUBLISHED":
                    assignments += ["first_published_at=COALESCE(first_published_at,now())", "published_at=now()", "archived_at=NULL", "trashed_at=NULL"]
                elif new_status == "ARCHIVED":
                    assignments += ["archived_at=now()", "trashed_at=NULL"]
                elif new_status == "TRASH":
                    assignments += ["trashed_at=now()", "archived_at=NULL"]
                elif new_status == "DRAFT":
                    assignments += ["archived_at=NULL", "trashed_at=NULL"]
                db = self._post_db_values(values)
                for key, value in db.items():
                    if key == "body_json":
                        assignments.append("body=CAST(:body_json AS jsonb)")
                    elif key == "structured_data_inputs":
                        assignments.append("structured_data_inputs=CAST(:structured_data_inputs AS jsonb)")
                    else:
                        assignments.append(f"{key}=:{key}")
                    params[key] = value
                changed = connection.execute(
                    text(f"UPDATE posts SET {','.join(assignments)} WHERE site_id=:site_id AND post_id=:post_id AND version=:expected RETURNING post_id"),
                    params,
                ).fetchone()
                if changed is None:
                    raise VersionConflict("post version conflict")
                after = self._load_post(connection, context, post_id)
                assert after is not None
                self._sync_post_media_usages(connection, context, after)
                if before["status"] == "PUBLISHED" and new_status != "PUBLISHED":
                    self._record_slug_transition(connection, context, post_id=post_id, old_slug=before.get("slug"), new_slug=before.get("slug"), actor_admin_id=actor_admin_id, ceased_public=True)
                elif before["status"] != "PUBLISHED" and new_status == "PUBLISHED":
                    self._record_slug_transition(connection, context, post_id=post_id, old_slug=None, new_slug=after.get("slug"), actor_admin_id=actor_admin_id, became_public=True)
                elif before["status"] == "PUBLISHED" and new_status == "PUBLISHED" and before.get("slug") != after.get("slug"):
                    self._record_slug_transition(connection, context, post_id=post_id, old_slug=before.get("slug"), new_slug=after.get("slug"), actor_admin_id=actor_admin_id)
                self._insert_revision(connection, context, after, actor_admin_id=actor_admin_id, source_action=source_action)
                # Preserve per-tab autosaves. Durable version advancement makes older base versions stale without deleting sibling-tab recovery state.
                return after
        except IntegrityError as exc:
            raise Conflict("post transition conflict") from exc

    async def duplicate_post(self, context: SiteContext, *, source_post_id: str, actor_admin_id: str, title_override: str | None) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            source = self._load_post(connection, context, source_post_id)
            if source is None:
                raise NotFound("resource not found")
            new_id = str(uuid4())
            title = title_override if title_override is not None else source.get("title", "")
            row = connection.execute(
                text(
                    "INSERT INTO posts(post_id,site_id,content_schema_version,status,version,title,excerpt,body,author_site_profile_id,featured_media_id,"
                    "seo_title,meta_description,index_policy,link_robots_policy,og_title,og_description,og_image_media_id,breadcrumb_label,created_by_admin_id,updated_by_admin_id) "
                    "SELECT :new_id,site_id,content_schema_version,'DRAFT',1,:title,excerpt,body,author_site_profile_id,featured_media_id,"
                    "seo_title,meta_description,index_policy,link_robots_policy,og_title,og_description,og_image_media_id,breadcrumb_label,:actor,:actor "
                    "FROM posts WHERE site_id=:site_id AND post_id=:source_id RETURNING post_id"
                ),
                {"new_id": new_id, "title": title, "actor": actor_admin_id, "site_id": context.site_id, "source_id": source_post_id},
            ).fetchone()
            if row is None:
                raise NotFound("resource not found")
            for table, id_column in (("post_categories", "category_id"), ("post_tags", "tag_id")):
                connection.execute(
                    text(f"INSERT INTO {table}(site_id,post_id,{id_column}) SELECT site_id,:new_id,{id_column} FROM {table} WHERE site_id=:site_id AND post_id=:source_id"),
                    {"new_id": new_id, "site_id": context.site_id, "source_id": source_post_id},
                )
            connection.execute(
                text("INSERT INTO post_related_posts(site_id,post_id,related_post_id,position) SELECT site_id,:new_id,related_post_id,position FROM post_related_posts WHERE site_id=:site_id AND post_id=:source_id"),
                {"new_id": new_id, "site_id": context.site_id, "source_id": source_post_id},
            )
            duplicate = self._load_post(connection, context, new_id)
            assert duplicate is not None
            self._sync_post_media_usages(connection, context, duplicate)
            self._insert_revision(connection, context, duplicate, actor_admin_id=actor_admin_id, source_action="DUPLICATE")
            return duplicate

    async def save_autosave(self, context: SiteContext, *, post_id: str, editor_admin_id: str, editor_instance_id: str, base_version: int, working_copy: dict[str, Any], content_schema_version: int) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            if self._load_post(connection, context, post_id) is None:
                raise NotFound("resource not found")
            autosave_id = str(uuid4())
            row = connection.execute(
                text(
                    "INSERT INTO post_autosaves(autosave_id,site_id,post_id,editor_admin_id,editor_instance_id,base_post_version,content_schema_version,working_copy,saved_at) "
                    "VALUES (:id,:site_id,:post_id,:editor,:instance,:base,:schema,CAST(:working AS jsonb),now()) "
                    "ON CONFLICT(site_id,post_id,editor_admin_id,editor_instance_id) DO UPDATE SET autosave_id=EXCLUDED.autosave_id,base_post_version=EXCLUDED.base_post_version,content_schema_version=EXCLUDED.content_schema_version,working_copy=EXCLUDED.working_copy,saved_at=now() "
                    "RETURNING autosave_id,post_id,editor_instance_id,base_post_version,saved_at,working_copy"
                ),
                {"id": autosave_id, "site_id": context.site_id, "post_id": post_id, "editor": editor_admin_id, "instance": editor_instance_id, "base": base_version, "schema": content_schema_version, "working": _json(working_copy)},
            ).fetchone()
            return self._autosave_wire(_mapping(row))

    async def get_latest_autosave(self, context: SiteContext, *, post_id: str, editor_admin_id: str, editor_instance_id: str) -> dict[str, Any] | None:
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(
                text("SELECT autosave_id,post_id,editor_instance_id,base_post_version,saved_at,working_copy FROM post_autosaves WHERE site_id=:site_id AND post_id=:post_id AND editor_admin_id=:editor AND editor_instance_id=:instance ORDER BY saved_at DESC LIMIT 1"),
                {"site_id": context.site_id, "post_id": post_id, "editor": editor_admin_id, "instance": editor_instance_id},
            ).fetchone()
            return None if row is None else self._autosave_wire(_mapping(row))

    async def get_autosave(self, context: SiteContext, *, post_id: str, autosave_id: str) -> dict[str, Any] | None:
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(
                text("SELECT autosave_id,post_id,editor_instance_id,base_post_version,saved_at,working_copy FROM post_autosaves WHERE site_id=:site_id AND post_id=:post_id AND autosave_id=:autosave_id LIMIT 1"),
                {"site_id": context.site_id, "post_id": post_id, "autosave_id": autosave_id},
            ).fetchone()
            return None if row is None else self._autosave_wire(_mapping(row))

    @staticmethod
    def _autosave_wire(data: dict[str, Any]) -> dict[str, Any]:
        return {
            "autosave_id": str(data["autosave_id"]),
            "post_id": str(data["post_id"]),
            "editor_instance_id": str(data["editor_instance_id"]),
            "base_version": int(data["base_post_version"]),
            "saved_at": _iso(data["saved_at"]),
            "working_copy": data["working_copy"],
        }

    async def list_revisions(self, context: SiteContext, *, post_id: str, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]:
        async with self._site_transactions.transaction(context) as connection:
            rows = connection.execute(
                text("SELECT revision_id,post_id,resulting_post_version,actor_admin_id,created_at FROM post_revisions WHERE site_id=:site_id AND post_id=:post_id ORDER BY revision_number DESC LIMIT :limit OFFSET :offset"),
                {"site_id": context.site_id, "post_id": post_id, "limit": page_size + 1, "offset": (page - 1) * page_size},
            ).fetchall()
            items = []
            for row in rows[:page_size]:
                data = _mapping(row)
                item = {"revision_id": str(data["revision_id"]), "post_id": str(data["post_id"]), "version": int(data["resulting_post_version"]), "created_at": _iso(data["created_at"])}
                if data.get("actor_admin_id"):
                    item["created_by_admin_id"] = str(data["actor_admin_id"])
                items.append(item)
            return items, len(rows) > page_size

    async def get_revision(self, context: SiteContext, *, post_id: str, revision_id: str) -> dict[str, Any] | None:
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(
                text("SELECT revision_id,post_id,resulting_post_version,snapshot,created_at FROM post_revisions WHERE site_id=:site_id AND post_id=:post_id AND revision_id=:revision_id"),
                {"site_id": context.site_id, "post_id": post_id, "revision_id": revision_id},
            ).fetchone()
            if row is None:
                return None
            data = _mapping(row)
            return {"revision_id": str(data["revision_id"]), "post_id": str(data["post_id"]), "version": int(data["resulting_post_version"]), "snapshot": data["snapshot"], "created_at": _iso(data["created_at"])}

    async def restore_revision(self, context: SiteContext, *, post_id: str, revision_id: str, actor_admin_id: str, expected_version: int, restore_fields: set[str]) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            before = self._load_post(connection, context, post_id)
            if before is None:
                raise NotFound("resource not found")
            if int(before["version"]) != expected_version:
                raise VersionConflict("post version conflict")
            row = connection.execute(
                text("SELECT snapshot FROM post_revisions WHERE site_id=:site_id AND post_id=:post_id AND revision_id=:revision_id"),
                {"site_id": context.site_id, "post_id": post_id, "revision_id": revision_id},
            ).fetchone()
            if row is None:
                raise NotFound("resource not found")
            snapshot = _mapping(row)["snapshot"]
            values = {key: snapshot[key] for key in restore_fields if key in snapshot}
            db = self._post_db_values(values)
            assignments = ["version=version+1", "updated_at=now()", "updated_by_admin_id=:actor"]
            params: dict[str, Any] = {"site_id": context.site_id, "post_id": post_id, "expected": expected_version, "actor": actor_admin_id}
            for key, value in db.items():
                if key == "body_json":
                    assignments.append("body=CAST(:body_json AS jsonb)")
                elif key == "structured_data_inputs":
                    assignments.append("structured_data_inputs=CAST(:structured_data_inputs AS jsonb)")
                else:
                    assignments.append(f"{key}=:{key}")
                params[key] = value
            changed = connection.execute(text(f"UPDATE posts SET {','.join(assignments)} WHERE site_id=:site_id AND post_id=:post_id AND version=:expected RETURNING post_id"), params).fetchone()
            if changed is None:
                raise VersionConflict("post version conflict")
            self._replace_relationships(connection, context, post_id, values)
            after = self._load_post(connection, context, post_id)
            assert after is not None
            if before["status"] == "PUBLISHED" and before.get("slug") != after.get("slug"):
                self._record_slug_transition(connection, context, post_id=post_id, old_slug=before.get("slug"), new_slug=after.get("slug"), actor_admin_id=actor_admin_id)
            self._insert_revision(connection, context, after, actor_admin_id=actor_admin_id, source_action="REVISION_RESTORE")
            # Preserve per-tab autosaves; base_post_version governs recovery/staleness after this durable mutation.
            return after

    async def list_url_history(self, context: SiteContext, *, post_id: str) -> list[dict[str, Any]]:
        async with self._site_transactions.transaction(context) as connection:
            rows = connection.execute(
                text("SELECT slug,became_public_at,ceased_public_at FROM post_url_history WHERE site_id=:site_id AND post_id=:post_id ORDER BY became_public_at ASC,url_history_id ASC"),
                {"site_id": context.site_id, "post_id": post_id},
            ).fetchall()
            return [_clean({"slug": _mapping(row)["slug"], "became_current_at": _iso(_mapping(row)["became_public_at"]), "ceased_current_at": _iso(_mapping(row)["ceased_public_at"])}) for row in rows]

    async def relationships_exist(self, context: SiteContext, *, author_id: str | None = None, category_ids: list[str] | None = None, tag_ids: list[str] | None = None, media_ids: list[str] | None = None, related_post_ids: list[str] | None = None) -> bool:
        async with self._site_transactions.transaction(context) as connection:
            if author_id is not None and not self._one_exists(connection, "author_site_profiles", "author_profile_id", context.site_id, author_id, "status='ACTIVE'"):
                return False
            if not self._all_exist(connection, "categories", "category_id", context.site_id, category_ids or [], "status='ACTIVE'"):
                return False
            if not self._all_exist(connection, "tags", "tag_id", context.site_id, tag_ids or [], "status='ACTIVE'"):
                return False
            if not self._all_exist(connection, "media", "media_id", context.site_id, media_ids or [], "status='ACTIVE'"):
                return False
            if not self._all_exist(connection, "posts", "post_id", context.site_id, related_post_ids or [], None):
                return False
            return True

    @staticmethod
    def _one_exists(connection: Any, table: str, column: str, site_id: str, value: str, extra: str | None) -> bool:
        suffix = f" AND {extra}" if extra else ""
        return connection.execute(text(f"SELECT 1 FROM {table} WHERE site_id=:site_id AND {column}=:value{suffix}"), {"site_id": site_id, "value": value}).fetchone() is not None

    def _all_exist(self, connection: Any, table: str, column: str, site_id: str, values: Iterable[str], extra: str | None) -> bool:
        for value in values:
            if not self._one_exists(connection, table, column, site_id, str(value), extra):
                return False
        return True

    async def slug_available(self, context: SiteContext, *, entity: str, slug: str, exclude_id: str | None = None) -> bool:
        table, column = {"POST": ("posts", "post_id"), "CATEGORY": ("categories", "category_id"), "TAG": ("tags", "tag_id"), "AUTHOR": ("author_site_profiles", "author_profile_id")}[entity]
        async with self._site_transactions.transaction(context) as connection:
            sql = f"SELECT 1 FROM {table} WHERE site_id=:site_id AND slug=:slug"
            params: dict[str, Any] = {"site_id": context.site_id, "slug": slug}
            if exclude_id:
                sql += f" AND {column}<>:exclude_id"
                params["exclude_id"] = exclude_id
            return connection.execute(text(sql), params).fetchone() is None

    async def generate_available_post_slug(self, context: SiteContext, *, base_slug: str, exclude_id: str | None = None) -> str:
        candidate = base_slug
        counter = 2
        while not await self.slug_available(context, entity="POST", slug=candidate, exclude_id=exclude_id):
            candidate = f"{base_slug}-{counter}"
            counter += 1
            if len(candidate) > 160:
                candidate = f"{base_slug[:150].rstrip('-')}-{counter}"
        return candidate

    # ---------------- taxonomy ----------------
    async def list_categories(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]:
        return await self._list_simple(context, "categories", "name ASC, category_id ASC", page, page_size, self._category_wire)

    async def get_category(self, context: SiteContext, category_id: str) -> dict[str, Any] | None:
        return await self._get_simple(context, "categories", "category_id", category_id, self._category_wire)

    @staticmethod
    def _category_wire(data: dict[str, Any]) -> dict[str, Any]:
        return _clean({"category_id": str(data["category_id"]), "name": data["name"], "description": data.get("description"), "slug": data["slug"], "parent_category_id": str(data["parent_category_id"]) if data.get("parent_category_id") else None, "status": data["status"], "created_at": _iso(data["created_at"]), "updated_at": _iso(data["updated_at"]), "seo_title": data.get("seo_title"), "meta_description": data.get("meta_description"), "canonical_override": data.get("canonical_override"), "index_policy": data.get("index_policy")})

    async def create_category(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._create_simple(context, "categories", "category_id", values, self._category_wire, allowed={"parent_category_id", "name", "slug", "description", "seo_title", "meta_description", "canonical_override", "index_policy"})

    async def update_category(self, context: SiteContext, *, category_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._update_simple(context, "categories", "category_id", category_id, values, self._category_wire, allowed={"parent_category_id", "name", "slug", "description", "seo_title", "meta_description", "canonical_override", "index_policy"})

    async def retire_category(self, context: SiteContext, *, category_id: str, actor_admin_id: str) -> None:
        await self._retire_simple(context, "categories", "category_id", category_id)

    async def category_parent_would_cycle(
        self, context: SiteContext, *, category_id: str, parent_category_id: str
    ) -> bool:
        """Fail closed on a proposed same-site category parent cycle."""
        async with self._site_transactions.transaction(context) as connection:
            cursor: str | None = parent_category_id
            seen: set[str] = set()
            while cursor is not None:
                if cursor == category_id:
                    return True
                if cursor in seen:
                    # Existing corrupt hierarchy must never be extended.
                    return True
                seen.add(cursor)
                row = connection.execute(
                    text(
                        "SELECT parent_category_id FROM categories "
                        "WHERE site_id=:site_id AND category_id=:id AND status='ACTIVE'"
                    ),
                    {"site_id": context.site_id, "id": cursor},
                ).fetchone()
                if row is None:
                    return True
                parent = _mapping(row).get("parent_category_id")
                cursor = str(parent) if parent else None
            return False

    async def list_tags(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]:
        return await self._list_simple(context, "tags", "name ASC, tag_id ASC", page, page_size, self._tag_wire)

    async def get_tag(self, context: SiteContext, tag_id: str) -> dict[str, Any] | None:
        return await self._get_simple(context, "tags", "tag_id", tag_id, self._tag_wire)

    @staticmethod
    def _tag_wire(data: dict[str, Any]) -> dict[str, Any]:
        return _clean({"tag_id": str(data["tag_id"]), "name": data["name"], "description": data.get("description"), "slug": data["slug"], "status": data["status"], "created_at": _iso(data["created_at"]), "updated_at": _iso(data["updated_at"])})

    async def create_tag(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._create_simple(context, "tags", "tag_id", values, self._tag_wire, allowed={"name", "slug", "description"})

    async def update_tag(self, context: SiteContext, *, tag_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._update_simple(context, "tags", "tag_id", tag_id, values, self._tag_wire, allowed={"name", "slug", "description"})

    async def retire_tag(self, context: SiteContext, *, tag_id: str, actor_admin_id: str) -> None:
        await self._retire_simple(context, "tags", "tag_id", tag_id)

    async def merge_tag(self, context: SiteContext, *, source_tag_id: str, target_tag_id: str, actor_admin_id: str) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            if not self._one_exists(connection, "tags", "tag_id", context.site_id, source_tag_id, "status='ACTIVE'") or not self._one_exists(connection, "tags", "tag_id", context.site_id, target_tag_id, "status='ACTIVE'"):
                raise NotFound("resource not found")
            connection.execute(
                text("INSERT INTO post_tags(site_id,post_id,tag_id) SELECT site_id,post_id,:target FROM post_tags WHERE site_id=:site_id AND tag_id=:source ON CONFLICT DO NOTHING"),
                {"target": target_tag_id, "site_id": context.site_id, "source": source_tag_id},
            )
            connection.execute(text("DELETE FROM post_tags WHERE site_id=:site_id AND tag_id=:source"), {"site_id": context.site_id, "source": source_tag_id})
            connection.execute(
                text("UPDATE tags SET status='RETIRED',merged_into_tag_id=:target,retired_at=now(),updated_at=now() WHERE site_id=:site_id AND tag_id=:source"),
                {"target": target_tag_id, "site_id": context.site_id, "source": source_tag_id},
            )
            row = connection.execute(text("SELECT * FROM tags WHERE site_id=:site_id AND tag_id=:source"), {"site_id": context.site_id, "source": source_tag_id}).fetchone()
            return self._tag_wire(_mapping(row))

    async def list_authors(self, context: SiteContext, *, page: int, page_size: int) -> tuple[list[dict[str, Any]], bool]:
        return await self._list_simple(context, "author_site_profiles", "display_name ASC, author_profile_id ASC", page, page_size, self._author_wire)

    async def get_author(self, context: SiteContext, author_id: str) -> dict[str, Any] | None:
        return await self._get_simple(context, "author_site_profiles", "author_profile_id", author_id, self._author_wire)

    @staticmethod
    def _author_wire(data: dict[str, Any]) -> dict[str, Any]:
        return _clean({"author_id": str(data["author_profile_id"]), "display_name": data["display_name"], "slug": data.get("slug"), "bio": data.get("bio"), "designation": data.get("designation"), "expertise": list(data.get("expertise") or []), "social_profiles": _social_from_db(data.get("social_profiles")), "avatar_media_id": str(data["photo_media_id"]) if data.get("photo_media_id") else None, "status": data["status"], "created_at": _iso(data["created_at"]), "updated_at": _iso(data["updated_at"]), "seo_title": data.get("seo_title"), "meta_description": data.get("meta_description"), "canonical_override": data.get("canonical_override"), "index_policy": data.get("index_policy")})

    async def create_author(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._author_upsert(context, None, values, create=True)

    async def update_author(self, context: SiteContext, *, author_id: str, actor_admin_id: str, values: dict[str, Any]) -> dict[str, Any]:
        return await self._author_upsert(context, author_id, values, create=False)

    async def _author_upsert(self, context: SiteContext, author_id: str | None, values: dict[str, Any], *, create: bool) -> dict[str, Any]:
        transformed = dict(values)
        if "avatar_media_id" in transformed:
            transformed["photo_media_id"] = transformed.pop("avatar_media_id")
        if "social_profiles" in transformed:
            transformed["social_profiles_json"] = _json(_social_to_db(transformed.pop("social_profiles")))
        allowed = {"display_name", "slug", "bio", "designation", "expertise", "photo_media_id", "seo_title", "meta_description", "canonical_override", "index_policy", "social_profiles_json"}
        async with self._site_transactions.transaction(context) as connection:
            params = {"site_id": context.site_id, **{k: v for k, v in transformed.items() if k in allowed}}
            try:
                if create:
                    cols = ["site_id"]
                    vals = [":site_id"]
                    for key in transformed:
                        if key not in allowed:
                            continue
                        cols.append("social_profiles" if key == "social_profiles_json" else key)
                        vals.append("CAST(:social_profiles_json AS jsonb)" if key == "social_profiles_json" else f":{key}")
                    row = connection.execute(text(f"INSERT INTO author_site_profiles({','.join(cols)}) VALUES ({','.join(vals)}) RETURNING *"), params).fetchone()
                else:
                    params["id"] = author_id
                    assignments = []
                    for key in transformed:
                        if key not in allowed:
                            continue
                        assignments.append("social_profiles=CAST(:social_profiles_json AS jsonb)" if key == "social_profiles_json" else f"{key}=:{key}")
                    assignments.append("updated_at=now()")
                    row = connection.execute(text(f"UPDATE author_site_profiles SET {','.join(assignments)} WHERE site_id=:site_id AND author_profile_id=:id RETURNING *"), params).fetchone()
                    if row is None:
                        raise NotFound("resource not found")
                return self._author_wire(_mapping(row))
            except IntegrityError as exc:
                raise Conflict("author conflict") from exc

    async def retire_author(self, context: SiteContext, *, author_id: str, actor_admin_id: str) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(text("UPDATE author_site_profiles SET status='RETIRED',retired_at=now(),updated_at=now() WHERE site_id=:site_id AND author_profile_id=:id AND status='ACTIVE' RETURNING *"), {"site_id": context.site_id, "id": author_id}).fetchone()
            if row is None:
                existing = connection.execute(text("SELECT 1 FROM author_site_profiles WHERE site_id=:site_id AND author_profile_id=:id"), {"site_id": context.site_id, "id": author_id}).fetchone()
                if existing is None:
                    raise NotFound("resource not found")
                raise StateConflict("author already retired")
            return self._author_wire(_mapping(row))

    async def _list_simple(self, context: SiteContext, table: str, order: str, page: int, page_size: int, mapper):
        async with self._site_transactions.transaction(context) as connection:
            rows = connection.execute(text(f"SELECT * FROM {table} WHERE site_id=:site_id ORDER BY {order} LIMIT :limit OFFSET :offset"), {"site_id": context.site_id, "limit": page_size + 1, "offset": (page - 1) * page_size}).fetchall()
            return [mapper(_mapping(row)) for row in rows[:page_size]], len(rows) > page_size

    async def _get_simple(self, context: SiteContext, table: str, id_col: str, value: str, mapper):
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(text(f"SELECT * FROM {table} WHERE site_id=:site_id AND {id_col}=:id"), {"site_id": context.site_id, "id": value}).fetchone()
            return None if row is None else mapper(_mapping(row))

    async def _create_simple(self, context: SiteContext, table: str, id_col: str, values: dict[str, Any], mapper, *, allowed: set[str]):
        params = {"site_id": context.site_id, **{key: value for key, value in values.items() if key in allowed}}
        cols = ["site_id"] + [key for key in values if key in allowed]
        vals = [":site_id"] + [f":{key}" for key in values if key in allowed]
        async with self._site_transactions.transaction(context) as connection:
            try:
                row = connection.execute(text(f"INSERT INTO {table}({','.join(cols)}) VALUES ({','.join(vals)}) RETURNING *"), params).fetchone()
                return mapper(_mapping(row))
            except IntegrityError as exc:
                raise Conflict("resource conflict") from exc

    async def _update_simple(self, context: SiteContext, table: str, id_col: str, value: str, values: dict[str, Any], mapper, *, allowed: set[str]):
        assignments = [f"{key}=:{key}" for key in values if key in allowed] + ["updated_at=now()"]
        params = {"site_id": context.site_id, "id": value, **{key: val for key, val in values.items() if key in allowed}}
        async with self._site_transactions.transaction(context) as connection:
            try:
                row = connection.execute(text(f"UPDATE {table} SET {','.join(assignments)} WHERE site_id=:site_id AND {id_col}=:id RETURNING *"), params).fetchone()
                if row is None:
                    raise NotFound("resource not found")
                return mapper(_mapping(row))
            except IntegrityError as exc:
                raise Conflict("resource conflict") from exc

    async def _retire_simple(self, context: SiteContext, table: str, id_col: str, value: str) -> None:
        async with self._site_transactions.transaction(context) as connection:
            row = connection.execute(text(f"UPDATE {table} SET status='RETIRED',retired_at=now(),updated_at=now() WHERE site_id=:site_id AND {id_col}=:id AND status='ACTIVE' RETURNING {id_col}"), {"site_id": context.site_id, "id": value}).fetchone()
            if row is None:
                existing = connection.execute(text(f"SELECT 1 FROM {table} WHERE site_id=:site_id AND {id_col}=:id"), {"site_id": context.site_id, "id": value}).fetchone()
                if existing is None:
                    raise NotFound("resource not found")
                raise StateConflict("resource already retired")

    # ---------------- Navigation / Homepage ----------------
    async def get_navigation(self, context: SiteContext) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            return {"header": {"items": self._menu_items(connection, context, "HEADER")}, "footer": {"items": self._menu_items(connection, context, "FOOTER")}}

    def _menu_items(self, connection: Any, context: SiteContext, menu_key: str) -> list[dict[str, Any]]:
        menu = connection.execute(text("SELECT menu_id FROM navigation_menus WHERE site_id=:site_id AND menu_key=:key"), {"site_id": context.site_id, "key": menu_key}).fetchone()
        if menu is None:
            return []
        menu_id = str(menu[0])
        rows = connection.execute(text("SELECT * FROM navigation_items WHERE site_id=:site_id AND menu_id=:menu_id AND is_enabled=true ORDER BY parent_item_id NULLS FIRST,sort_order,item_id"), {"site_id": context.site_id, "menu_id": menu_id}).fetchall()
        nodes: dict[str, dict[str, Any]] = {}
        parent: dict[str, str | None] = {}
        for row in rows:
            data = _mapping(row)
            iid = str(data["item_id"])
            nodes[iid] = {"label": data["label"], "destination": self._nav_destination_from_db(context, data), "children": []}
            parent[iid] = str(data["parent_item_id"]) if data.get("parent_item_id") else None
        roots: list[dict[str, Any]] = []
        for iid, node in nodes.items():
            pid = parent[iid]
            if pid and pid in nodes:
                nodes[pid]["children"].append(node)
            else:
                roots.append(node)
        return roots

    @staticmethod
    def _nav_destination_from_db(context: SiteContext, data: dict[str, Any]) -> dict[str, Any]:
        kind = data["destination_kind"]
        if kind == "POST":
            return {"kind": "ARTICLE", "target_id": str(data["target_post_id"])}
        if kind == "CATEGORY":
            return {"kind": "CATEGORY", "target_id": str(data["target_category_id"])}
        if kind == "TAG":
            return {"kind": "TAG", "target_id": str(data["target_tag_id"])}
        if kind == "AUTHOR":
            return {"kind": "AUTHOR", "target_id": str(data["target_author_profile_id"])}
        if kind == "EXTERNAL":
            return {"kind": "EXTERNAL", "url": data["external_url"]}
        if kind in {"HOME", "SEARCH"}:
            return {"kind": kind}
        if kind == "STATIC":
            static_key = data["static_page_key"]
            if static_key not in STATIC_PAGE_ROUTES:
                raise ValidationFault("request validation failed")
            return {"kind": "STATIC", "static_page_key": static_key}
        raise ValidationFault("request validation failed")

    async def replace_navigation_menu(self, context: SiteContext, *, menu_key: str, actor_admin_id: str, items: list[dict[str, Any]]) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            menu = connection.execute(text("SELECT menu_id FROM navigation_menus WHERE site_id=:site_id AND menu_key=:key"), {"site_id": context.site_id, "key": menu_key}).fetchone()
            if menu is None:
                raise NotFound("resource not found")
            menu_id = str(menu[0])
            connection.execute(text("DELETE FROM navigation_items WHERE site_id=:site_id AND menu_id=:menu_id"), {"site_id": context.site_id, "menu_id": menu_id})
            for position, item in enumerate(items):
                self._insert_nav_item(connection, context, menu_id, item, position, None)
            connection.execute(text("UPDATE navigation_menus SET updated_at=now() WHERE site_id=:site_id AND menu_id=:menu_id"), {"site_id": context.site_id, "menu_id": menu_id})
            return {"items": self._menu_items(connection, context, menu_key)}

    def _insert_nav_item(self, connection: Any, context: SiteContext, menu_id: str, item: dict[str, Any], position: int, parent_id: str | None) -> None:
        dest = item["destination"]
        kind = dest["kind"]
        db_kind = "POST" if kind == "ARTICLE" else kind
        columns: dict[str, Any] = {"target_post_id": None, "target_category_id": None, "target_tag_id": None, "target_author_profile_id": None, "static_page_key": None, "external_url": None}
        if kind == "ARTICLE": columns["target_post_id"] = dest["target_id"]
        elif kind == "CATEGORY": columns["target_category_id"] = dest["target_id"]
        elif kind == "TAG": columns["target_tag_id"] = dest["target_id"]
        elif kind == "AUTHOR": columns["target_author_profile_id"] = dest["target_id"]
        elif kind == "EXTERNAL": columns["external_url"] = dest["url"]
        elif kind == "STATIC":
            static_key = dest["static_page_key"]
            if static_key not in STATIC_PAGE_ROUTES:
                raise ValidationFault("request validation failed")
            columns["static_page_key"] = static_key
        item_id = str(uuid4())
        connection.execute(
            text("INSERT INTO navigation_items(item_id,site_id,menu_id,parent_item_id,label,sort_order,is_enabled,destination_kind,target_post_id,target_category_id,target_tag_id,target_author_profile_id,static_page_key,external_url) VALUES (:item_id,:site_id,:menu_id,:parent_id,:label,:sort_order,true,:kind,:post,:cat,:tag,:author,:static,:url)"),
            {"item_id": item_id, "site_id": context.site_id, "menu_id": menu_id, "parent_id": parent_id, "label": item["label"], "sort_order": position, "kind": db_kind, "post": columns["target_post_id"], "cat": columns["target_category_id"], "tag": columns["target_tag_id"], "author": columns["target_author_profile_id"], "static": columns["static_page_key"], "url": columns["external_url"]},
        )
        for child_position, child in enumerate(item["children"]):
            self._insert_nav_item(connection, context, menu_id, child, child_position, item_id)

    async def get_homepage(self, context: SiteContext) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            return self._homepage_wire(connection, context)

    def _homepage_wire(self, connection: Any, context: SiteContext) -> dict[str, Any]:
        setting = connection.execute(text("SELECT homepage_lead_post_id FROM site_settings WHERE site_id=:site_id"), {"site_id": context.site_id}).fetchone()
        lead_post_id = str(_mapping(setting)["homepage_lead_post_id"]) if setting is not None and _mapping(setting).get("homepage_lead_post_id") else None
        rows = connection.execute(text("SELECT * FROM homepage_sections WHERE site_id=:site_id ORDER BY position_key,section_key"), {"site_id": context.site_id}).fetchall()
        sections = []
        for row in rows:
            data = _mapping(row)
            section = {"section_key": data["section_key"], "section_kind": data["section_kind"], "enabled": bool(data["is_enabled"])}
            if data.get("display_label") is not None:
                section["display_label"] = data["display_label"]
            posts = connection.execute(text("SELECT post_id FROM homepage_section_posts WHERE site_id=:site_id AND section_id=:section ORDER BY position"), {"site_id": context.site_id, "section": data["section_id"]}).fetchall()
            cats = connection.execute(text("SELECT category_id FROM homepage_section_categories WHERE site_id=:site_id AND section_id=:section ORDER BY position"), {"site_id": context.site_id, "section": data["section_id"]}).fetchall()
            if posts:
                section["post_ids"] = [str(r[0]) for r in posts]
            if cats:
                section["category_ids"] = [str(r[0]) for r in cats]
            sections.append(section)
        return _clean({"lead_post_id": lead_post_id, "sections": sections})

    async def update_homepage(self, context: SiteContext, *, actor_admin_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        async with self._site_transactions.transaction(context) as connection:
            if "lead_post_id" in payload:
                lead = payload.get("lead_post_id")
                connection.execute(
                    text("UPDATE site_settings SET homepage_lead_post_id=:lead,updated_at=now(),updated_by_admin_id=:actor WHERE site_id=:site_id"),
                    {"site_id": context.site_id, "lead": lead, "actor": actor_admin_id},
                )
            for incoming in payload.get("sections", []):
                row = connection.execute(text("SELECT * FROM homepage_sections WHERE site_id=:site_id AND section_key=:key"), {"site_id": context.site_id, "key": incoming["section_key"]}).fetchone()
                if row is None:
                    raise NotFound("resource not found")
                current = _mapping(row)
                if incoming["section_kind"] != current["section_kind"]:
                    raise StateConflict("homepage section contract mismatch")
                assignments = []
                params: dict[str, Any] = {"site_id": context.site_id, "id": current["section_id"]}
                if incoming.get("enabled") != bool(current["is_enabled"]):
                    if not current["allow_visibility_edit"]:
                        raise StateConflict("homepage visibility is not editable")
                    assignments.append("is_enabled=:enabled")
                    params["enabled"] = incoming["enabled"]
                if "display_label" in incoming:
                    if not current["allow_label_edit"]:
                        raise StateConflict("homepage label is not editable")
                    assignments.append("display_label=:label")
                    params["label"] = incoming.get("display_label")
                if assignments:
                    connection.execute(text(f"UPDATE homepage_sections SET {','.join(assignments)},updated_at=now() WHERE site_id=:site_id AND section_id=:id"), params)
                if "post_ids" in incoming:
                    if not current["allow_post_selection"]:
                        raise StateConflict("post selection is not editable")
                    ids = incoming.get("post_ids") or []
                    if current.get("max_items") is not None and len(ids) > int(current["max_items"]):
                        raise ValidationFault("request validation failed")
                    connection.execute(text("DELETE FROM homepage_section_posts WHERE site_id=:site_id AND section_id=:id"), {"site_id": context.site_id, "id": current["section_id"]})
                    for pos, post_id in enumerate(ids):
                        connection.execute(text("INSERT INTO homepage_section_posts(site_id,section_id,post_id,position) VALUES (:site_id,:id,:post,:pos)"), {"site_id": context.site_id, "id": current["section_id"], "post": post_id, "pos": pos})
                if "category_ids" in incoming:
                    if not current["allow_category_selection"]:
                        raise StateConflict("category selection is not editable")
                    ids = incoming.get("category_ids") or []
                    if current.get("max_items") is not None and len(ids) > int(current["max_items"]):
                        raise ValidationFault("request validation failed")
                    connection.execute(text("DELETE FROM homepage_section_categories WHERE site_id=:site_id AND section_id=:id"), {"site_id": context.site_id, "id": current["section_id"]})
                    for pos, category_id in enumerate(ids):
                        connection.execute(text("INSERT INTO homepage_section_categories(site_id,section_id,category_id,position) VALUES (:site_id,:id,:cat,:pos)"), {"site_id": context.site_id, "id": current["section_id"], "cat": category_id, "pos": pos})
            return self._homepage_wire(connection, context)

    # ---------------- Calendar / Settings ----------------
    async def calendar(
        self,
        context: SiteContext,
        *,
        from_utc: datetime,
        to_utc_exclusive: datetime,
    ) -> list[dict[str, Any]]:
        # Application resolves the requested calendar range in the trusted site
        # timezone, then hands us exact UTC bounds. This avoids DB-session timezone
        # dependence and preserves already-resolved scheduled UTC instants.
        async with self._site_transactions.transaction(context) as connection:
            rows = connection.execute(
                text(
                    "SELECT post_id,title,status,scheduled_for_utc,published_at FROM posts "
                    "WHERE site_id=:site_id AND "
                    "((scheduled_for_utc >= :from_utc AND scheduled_for_utc < :to_utc) "
                    "OR (published_at >= :from_utc AND published_at < :to_utc)) "
                    "ORDER BY COALESCE(scheduled_for_utc,published_at),post_id"
                ),
                {"site_id": context.site_id, "from_utc": from_utc, "to_utc": to_utc_exclusive},
            ).fetchall()
            return [
                _clean(
                    {
                        "post_id": str(_mapping(row)["post_id"]),
                        "title": _mapping(row)["title"],
                        "status": _mapping(row)["status"],
                        "scheduled_for": _iso(_mapping(row)["scheduled_for_utc"]),
                        "published_at": _iso(_mapping(row)["published_at"]),
                    }
                )
                for row in rows
            ]

    async def get_site_settings(self, context: SiteContext) -> list[dict[str, Any]]:
        async with self._site_transactions.transaction(context) as connection:
            return self._site_settings_wire(connection, context)

    def _site_settings_wire(self, connection: Any, context: SiteContext) -> list[dict[str, Any]]:
        site = connection.execute(text("SELECT display_name,locale_code,default_language_code,timezone_id FROM sites WHERE site_id=:site_id"), {"site_id": context.site_id}).fetchone()
        settings = connection.execute(text("SELECT logo_media_id,favicon_media_id,default_social_image_media_id,copyright_text,contact_info,social_profiles,seo_defaults,analytics_verification FROM site_settings WHERE site_id=:site_id"), {"site_id": context.site_id}).fetchone()
        if site is None or settings is None:
            raise NotFound("resource not found")
        s = _mapping(site)
        x = _mapping(settings)
        ordered = [
            ("display_name", s.get("display_name")),
            ("locale_code", s.get("locale_code")),
            ("default_language_code", s.get("default_language_code")),
            ("timezone_id", s.get("timezone_id")),
            ("logo_media_id", str(x["logo_media_id"]) if x.get("logo_media_id") else ""),
            ("favicon_media_id", str(x["favicon_media_id"]) if x.get("favicon_media_id") else ""),
            ("default_social_image_media_id", str(x["default_social_image_media_id"]) if x.get("default_social_image_media_id") else ""),
            ("copyright_text", x.get("copyright_text") or ""),
            ("contact_info", x.get("contact_info") or {}),
            ("social_profiles", x.get("social_profiles") or {}),
            ("seo_defaults", x.get("seo_defaults") or {}),
            ("analytics_verification", x.get("analytics_verification") or {}),
        ]
        return [{"key": key, "value": value if value is not None else ""} for key, value in ordered]

    async def update_site_settings(self, context: SiteContext, *, actor_admin_id: str, values: dict[str, Any]) -> list[dict[str, Any]]:
        site_fields = {key: values[key] for key in ("display_name", "locale_code", "default_language_code", "timezone_id") if key in values}
        local_fields = {key: values[key] for key in ("logo_media_id", "favicon_media_id", "default_social_image_media_id", "copyright_text", "contact_info", "social_profiles", "seo_defaults", "analytics_verification") if key in values}
        for key in ("logo_media_id", "favicon_media_id", "default_social_image_media_id"):
            if local_fields.get(key) == "":
                local_fields[key] = None
        if local_fields.get("copyright_text") == "":
            local_fields["copyright_text"] = None
        async with self._site_transactions.transaction(context) as connection:
            if site_fields:
                connection.execute(
                    text("SELECT app.update_current_site_identity(CAST(:payload AS jsonb))"),
                    {"payload": _json(site_fields)},
                )
            if local_fields:
                json_keys = {"contact_info", "social_profiles", "seo_defaults", "analytics_verification"}
                assignments = [f"{key}=CAST(:{key} AS jsonb)" if key in json_keys else f"{key}=:{key}" for key in local_fields]
                params = {"site_id": context.site_id, "actor": actor_admin_id}
                for key, value in local_fields.items():
                    params[key] = _json(value) if key in json_keys else value
                connection.execute(text(f"UPDATE site_settings SET {','.join(assignments)},updated_at=now(),updated_by_admin_id=:actor WHERE site_id=:site_id"), params)
                self._sync_site_setting_media_usages(connection, context)
            return self._site_settings_wire(connection, context)
