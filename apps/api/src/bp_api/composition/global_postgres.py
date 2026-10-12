from __future__ import annotations

from datetime import UTC, datetime
import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine

from bp_domain.errors import Conflict, NotFound, ValidationFault
from bp_domain.temporary_site_url import TemporarySiteUrlConfig, temporary_site_url
from bp_application.context import normalize_host

from .presentation import PresentationPolicy, presentation_references


def _m(row: Any) -> dict[str, Any]:
    return dict(getattr(row, "_mapping", row))


def _iso(value: Any) -> str:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC).isoformat().replace("+00:00", "Z")
    return str(value)


def _page(query: dict[str, Any]) -> tuple[int, int, int]:
    page = max(1, int(query.get("page") or 1))
    size = max(1, min(100, int(query.get("page_size") or 20)))
    return page, size, (page - 1) * size


class PostgresGlobalOperations:
    """Concrete DOC-15 GLOBAL backend over accepted DOC-08 tables.

    This adapter intentionally owns no schema. It uses the privileged platform
    runtime engine only after the HTTP layer has established explicit GLOBAL
    authority and exact permission/step-up requirements.
    """

    def __init__(self, platform_engine: Engine, site_transactions: Any, contexts: Any, *,
                 temporary_domain_suffix: str | None = None,
                 allow_local_temporary_hosts: bool = False,
                 temporary_site_url_config: TemporarySiteUrlConfig = TemporarySiteUrlConfig(),
                 presentation_policy: PresentationPolicy | None = None) -> None:
        self.engine = platform_engine
        self.site_transactions = site_transactions
        self.contexts = contexts
        self.temporary_domain_suffix = temporary_domain_suffix
        self.allow_local_temporary_hosts = allow_local_temporary_hosts
        self.temporary_site_url_config = temporary_site_url_config
        self.presentation_policy = presentation_policy

    def _temporary_hostname(self, site_key: str) -> str:
        suffix = self.temporary_domain_suffix
        if not suffix:
            raise ValidationFault("platform temporary-domain suffix is not configured")
        try:
            normalized_suffix = normalize_host(suffix)
            hostname = normalize_host(f"{site_key.lower()}.{normalized_suffix}")
        except NotFound as exc:
            raise ValidationFault("platform temporary-domain suffix is invalid") from exc
        if (
            normalized_suffix.endswith(".invalid")
            or (normalized_suffix.endswith(".localhost") and not self.allow_local_temporary_hosts)
            or "." not in normalized_suffix
        ):
            raise ValidationFault("platform temporary-domain suffix must be an explicit DNS suffix")
        return hostname

    def _site(self, connection, site_key: str) -> dict[str, Any]:
        row = connection.execute(text(
            "SELECT s.*, d.hostname canonical_domain FROM sites s "
            "LEFT JOIN domains d ON d.site_id=s.site_id AND d.is_canonical=true AND d.is_active=true "
            "WHERE s.site_key=:key LIMIT 1"
        ), {"key": site_key}).fetchone()
        if row is None:
            raise NotFound("resource not found")
        d = _m(row)
        out = {
            "site_key": d["site_key"], "display_name": d["display_name"],
            "lifecycle_state": "ARCHIVED" if d["status"] == "DELETION_REQUESTED" else d["status"],
            "timezone_id": d["timezone_id"], "created_at": _iso(d["created_at"]), "updated_at": _iso(d["updated_at"]),
        }
        if d.get("canonical_domain"): out["canonical_domain"] = d["canonical_domain"]
        if d.get("default_language_code"): out["default_language"] = d["default_language_code"]
        if d.get("locale_code"): out["locale_code"] = d["locale_code"]
        return out

    def _domain(self, row: Any) -> dict[str, Any]:
        d=_m(row)
        return {"domain_id":str(d["domain_id"]),"hostname":d["hostname"],"is_canonical":bool(d["is_canonical"]),"is_active":bool(d["is_active"]),"created_at":_iso(d["created_at"]),"updated_at":_iso(d["updated_at"])}

    def _role(self, connection, row: Any) -> dict[str, Any]:
        d=_m(row)
        perms=[str(_m(r)["permission_key"]) for r in connection.execute(text("SELECT permission_key FROM role_permissions WHERE role_id=:id ORDER BY permission_key"),{"id":d["role_id"]}).fetchall()]
        out={"role_id":str(d["role_id"]),"name":d["name"],"scope":d["scope"],"permission_keys":perms,"state":d["status"],"created_at":_iso(d["created_at"]),"updated_at":_iso(d["updated_at"])}
        if d.get("description") is not None: out["description"]=d["description"]
        return out

    def _admin(self, connection, row: Any) -> dict[str, Any]:
        d=_m(row); aid=d["admin_id"]
        sites=[str(_m(r)["site_key"]) for r in connection.execute(text("SELECT s.site_key FROM account_site_assignments a JOIN sites s ON s.site_id=a.site_id WHERE a.admin_id=:id ORDER BY s.site_key"),{"id":aid}).fetchall()]
        roles=[]
        for r in connection.execute(text("SELECT role_id FROM account_global_role_assignments WHERE admin_id=:id ORDER BY role_id"),{"id":aid}).fetchall(): roles.append({"role_id":str(_m(r)["role_id"]),"scope":"GLOBAL"})
        for r in connection.execute(text("SELECT a.role_id,s.site_key FROM account_site_role_assignments a JOIN sites s ON s.site_id=a.site_id WHERE a.admin_id=:id ORDER BY s.site_key,a.role_id"),{"id":aid}).fetchall():
            x=_m(r); roles.append({"role_id":str(x["role_id"]),"scope":"SITE","site_key":x["site_key"]})
        out={"admin_user_id":str(aid),"email":d["email"],"state":d["status"],"site_assignments":sites,"role_assignments":roles,"created_at":_iso(d["created_at"]),"updated_at":_iso(d["updated_at"])}
        if d.get("display_name"): out["display_name"]=d["display_name"]
        return out

    def _audit(self, row: Any) -> dict[str, Any]:
        d=_m(row); details=d.get("details") or {}
        if isinstance(details,str):
            try: details=json.loads(details)
            except Exception: details={}
        out={"audit_id":str(d["audit_id"]),"occurred_at":_iso(d["occurred_at"]),"scope":d["scope"],"event_type":d["event_code"],"summary":str(details.get("summary") or d["event_code"]),"request_id":str(d.get("request_id") or "system")}
        if d.get("actor_admin_id"): out["actor_admin_user_id"]=str(d["actor_admin_id"])
        if d.get("site_key"): out["site_key"]=d["site_key"]
        if d.get("target_type"): out["resource_type"]=d["target_type"]
        if d.get("target_id"): out["resource_id"]=str(d["target_id"])
        return out

    def _write_audit(self, connection, *, event_code: str, principal: Any, headers: dict[str, str], target_type: str | None = None, target_id: Any | None = None, site_id: Any | None = None, details: dict[str, Any] | None = None) -> None:
        safe_details = dict(details or {})
        safe_details.setdefault("operation_id", safe_details.get("operation_id"))
        safe_details = {k: v for k, v in safe_details.items() if v is not None}
        connection.execute(
            text(
                "INSERT INTO audit_events(scope,site_id,actor_type,actor_admin_id,event_code,target_type,target_id,request_id,outcome,details) "
                "VALUES ('GLOBAL',:site_id,'ADMIN',:actor,:event_code,:target_type,:target_id,:request_id,'SUCCESS',CAST(:details AS jsonb))"
            ),
            {
                "site_id": site_id,
                "actor": principal.admin_id,
                "event_code": event_code,
                "target_type": target_type,
                "target_id": target_id,
                "request_id": headers.get("x-request-id"),
                "details": json.dumps(safe_details, sort_keys=True, default=str),
            },
        )

    @staticmethod
    def _validate_launch_access(site_keys: list[str], assignments: list[dict[str, Any]], *, require_one: bool) -> None:
        requested_sites = [str(value) for value in site_keys]
        assignment_sites = [str(item.get("site_key") or "") for item in assignments]
        if (require_one and not requested_sites) or len(requested_sites) != len(set(requested_sites)):
            raise ValidationFault("website assignments must be unique")
        if (
            len(assignments) != len(requested_sites)
            or any(str(item.get("scope")) != "SITE" for item in assignments)
            or set(assignment_sites) != set(requested_sites)
            or len(assignment_sites) != len(set(assignment_sites))
        ):
            raise ValidationFault("each website requires exactly one supported access level")

    async def compensate_created_admin(self, admin_id: str) -> None:
        """Remove a not-yet-active launch account after security-state failure."""

        with self.engine.begin() as connection:
            connection.execute(
                text(
                    "DELETE FROM admin_accounts "
                    "WHERE admin_id=:admin_id AND status='INVITED' AND is_super_admin=false"
                ),
                {"admin_id": admin_id},
            )

    async def execute(self, operation_id: str, *, principal: Any, context: Any, path_params: dict[str,Any], query: dict[str,Any], body: Any, headers: dict[str,str]) -> tuple[int,Any,dict[str,str]]:
        if operation_id == "API15-G-001":
            if principal.is_super_admin:
                with self.engine.connect() as connection:
                    permissions=[str(row[0]) for row in connection.execute(text("SELECT permission_key FROM permissions WHERE scope='GLOBAL' ORDER BY permission_key")).fetchall()]
                return 200,{"effective_permissions":permissions},{}
            return 200,{"effective_permissions":sorted(principal.global_permissions)},{}
        with self.engine.begin() as c:
            if operation_id == "API15-G-002":
                rows=c.execute(text("SELECT site_key,display_name,status FROM sites ORDER BY site_key")).fetchall()
                summaries=[]
                total_posts=0
                for row in rows:
                    data=_m(row)
                    count=0
                    try:
                        site_context = await self.contexts.admin_site(
                            data["site_key"], principal=principal,
                            request_id=headers.get("x-request-id", "global-dashboard"),
                        )
                        async with self.site_transactions.transaction(site_context) as site_connection:
                            count=int(site_connection.execute(
                                text("SELECT count(*) FROM posts WHERE site_id=:site_id"),
                                {"site_id":site_context.site_id},
                            ).scalar_one() or 0)
                    except NotFound:
                        # Lifecycle or assignment changes must not make the global
                        # overview fail.  The registry row remains visible while
                        # site-owned counts are disclosed only when authorized.
                        count=0
                    total_posts+=count
                    summaries.append({"site_key":data["site_key"],"display_name":data["display_name"],"lifecycle_state":data["status"],"counts":[{"key":"total_posts","label":"Total blogs","value":count}]})
                return 200,{"site_count":len(rows),"aggregates":[{"key":"total_posts","label":"Total blogs","value":total_posts}],"site_summaries":summaries},{}
            if operation_id == "API15-G-003":
                page,size,_=_page(query)
                # Exact per-row SITE authorization is preserved by filtering to the principal's assigned sites with posts.view.
                items=[]
                allowed=[k for k,v in principal.site_permissions.items() if "posts.view" in v]
                for site_key in allowed:
                    # Reconstruct the same trusted CTX-ADMIN-SITE used by an
                    # ordinary SITE request before entering the RLS transaction.
                    # Unknown/inactive/unassigned sites are non-disclosed.
                    try:
                        ctx = await self.contexts.admin_site(
                            site_key,
                            principal=principal,
                            request_id=headers.get("x-request-id", "global"),
                        )
                    except NotFound:
                        continue
                    srow=c.execute(text("SELECT display_name FROM sites WHERE site_id=:sid"),{"sid":ctx.site_id}).fetchone()
                    if not srow:
                        continue
                    sd=_m(srow)
                    async with self.site_transactions.transaction(ctx) as sc:
                        rows=sc.execute(text("SELECT * FROM posts WHERE site_id=:sid ORDER BY updated_at DESC LIMIT :lim"),{"sid":ctx.site_id,"lim":size}).fetchall()
                    for r in rows:
                        d=_m(r); post={"post_id":str(d["post_id"]),"status":d["status"],"version":int(d["version"]),"body":d["body"],"category_ids":[],"tag_ids":[],"manual_related_post_ids":[],"updated_at":_iso(d["updated_at"]),"created_at":_iso(d["created_at"])}
                        for key in ("title","excerpt","slug","seo_title","meta_description","canonical_override","index_policy","link_robots_policy","og_title","og_description","schedule_local_input","schedule_timezone_id","breadcrumb_label"):
                            if d.get(key) is not None: post[key]=d[key]
                        for key in ("featured_media_id","author_site_profile_id","og_image_media_id"):
                            if d.get(key) is not None: post[key]=str(d[key])
                        for key in ("published_at","scheduled_for_utc","first_published_at","archived_at","trashed_at"):
                            if d.get(key) is not None: post[key]=_iso(d[key])
                        if d.get("structured_data_inputs") is not None: post["structured_data_inputs"]=d["structured_data_inputs"]
                        items.append({"site_key":site_key,"site_display_name":sd["display_name"],"post":post})
                return 200,{"items":items[:size],"page":{"page":page,"page_size":size,"has_more":len(items)>size}},{}
            if operation_id == "API15-G-010":
                page,size,off=_page(query); rows=c.execute(text("SELECT site_key FROM sites ORDER BY site_key LIMIT :l OFFSET :o"),{"l":size+1,"o":off}).fetchall(); vals=[self._site(c,_m(r)["site_key"]) for r in rows[:size]]
                return 200,{"items":vals,"page":{"page":page,"page_size":size,"has_more":len(rows)>size}},{}
            if operation_id == "API15-G-011":
                b=body or {}
                if self.presentation_policy is None:
                    raise RuntimeError("canonical presentation policy is required for provisioning")
                self.presentation_policy.require_provisioning_presentation(b.get("presentation"))
                self.presentation_policy.require_static_pages(b.get("static_pages"))
                media_refs, navigation_refs = presentation_references(b["presentation"])
                # The new tenant has no media or navigation items yet. References
                # cannot be borrowed from any existing tenant during creation.
                if media_refs or navigation_refs:
                    raise ValidationFault(
                        "new website presentation cannot reference existing tenant resources"
                    )
                hostname = self._temporary_hostname(b["site_key"])
                sid = c.execute(
                    text(
                        "INSERT INTO sites(site_key,display_name,status,timezone_id,"
                        "locale_code,default_language_code) "
                        "VALUES (:key,:name,'DISABLED',:timezone,:locale,:language) RETURNING site_id"
                    ),
                    {
                        "key": b["site_key"],
                        "name": b["display_name"],
                        "timezone": b["timezone_id"],
                        "locale": b.get("locale_code"),
                        "language": b.get("default_language"),
                    },
                ).scalar_one()
                identity_ready=bool(c.execute(text(
                    "SELECT EXISTS(SELECT 1 FROM sites WHERE site_id=:site_id AND site_key=:key "
                    "AND status='DISABLED' AND timezone_id=:timezone "
                    "AND locale_code IS NOT DISTINCT FROM :locale "
                    "AND default_language_code IS NOT DISTINCT FROM :language)"
                ), {
                    "site_id":sid,"key":b["site_key"],"timezone":b["timezone_id"],
                    "locale":b.get("locale_code"),"language":b.get("default_language"),
                }).scalar_one())
                if not identity_ready:
                    raise RuntimeError("website identity persistence failed")
                baseline = c.execute(
                    text(
                        "SELECT app.insert_website_site_baseline("
                        ":site_id,:actor,CAST(:presentation AS jsonb),CAST(:pages AS jsonb))"
                    ),
                    {
                        "site_id": sid,
                        "actor": principal.admin_id,
                        "presentation": json.dumps(b["presentation"], sort_keys=True),
                        "pages": json.dumps(b["static_pages"], sort_keys=True),
                    },
                ).scalar_one()
                if isinstance(baseline, str):
                    baseline = json.loads(baseline)
                c.execute(
                    text(
                        "INSERT INTO domains(site_id,hostname,is_canonical,is_active) "
                        "VALUES (:site_id,:hostname,true,true)"
                    ),
                    {"site_id": sid, "hostname": hostname},
                )
                domain_row=c.execute(text(
                    "SELECT hostname FROM domains WHERE site_id=:site_id "
                    "AND hostname_normalized=:hostname AND is_active=true AND is_canonical=true LIMIT 1"
                ), {"site_id":sid,"hostname":hostname}).fetchone()
                domain_ready=domain_row is not None
                self._write_audit(c,event_code="SITE.CREATED",principal=principal,headers=headers,
                                  target_type="SITE",target_id=sid,site_id=sid,
                                  details={"operation_id":operation_id,"temporary_hostname":hostname})
                readiness={**baseline,"temporary_domain_ready":domain_ready}
                missing=[name for name,ready in (
                    ("SETTINGS",readiness["settings_ready"]),
                    ("NAVIGATION",readiness["navigation_ready"]),
                    ("HOMEPAGE",readiness["homepage_ready"]),
                    ("TEMPORARY_DOMAIN",domain_ready),
                ) if not ready]
                readiness.update(overall_ready=not missing,missing_components=missing)
                if not readiness["overall_ready"]:
                    raise RuntimeError("mandatory website provisioning readiness failed")
                persisted_hostname = _m(domain_row)["hostname"]
                return (
                    201,
                    {
                        "site": self._site(c, b["site_key"]),
                        "temporary_hostname": persisted_hostname,
                        "temporary_site_url": temporary_site_url(persisted_hostname, self.temporary_site_url_config),
                        "readiness": readiness,
                    },
                    {},
                )
            if operation_id in {
                "API15-G-012",
                "API15-G-013",
                "API15-G-014",
                "API15-G-015",
                "API15-G-016",
            }:
                key=path_params["site_key"]
                if operation_id=="API15-G-012":
                    return 200,{"site":self._site(c,key)},{}
                if operation_id=="API15-G-013":
                    b=body or {}; sets=[]; params={"k":key}
                    mapping={"display_name":"display_name","default_language":"default_language_code","locale_code":"locale_code","timezone_id":"timezone_id"}
                    for inp,col in mapping.items():
                        if inp in b: sets.append(f"{col}=:{inp}"); params[inp]=b[inp]
                    if sets: c.execute(text("UPDATE sites SET "+",".join(sets)+",updated_at=now() WHERE site_key=:k"),params)
                elif operation_id in {"API15-G-014","API15-G-015","API15-G-016"}:
                    state={"API15-G-014":"ACTIVE","API15-G-015":"DISABLED","API15-G-016":"ARCHIVED"}[operation_id]
                    extra=", disabled_at=now()" if state=="DISABLED" else (", archived_at=now()" if state=="ARCHIVED" else ", disabled_at=NULL, archived_at=NULL")
                    c.execute(text(f"UPDATE sites SET status=:s,updated_at=now(){extra} WHERE site_key=:k"),{"s":state,"k":key})
                target=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":key}).fetchone()
                if not target: raise NotFound("resource not found")
                event={"API15-G-013":"SITE.UPDATED","API15-G-014":"SITE.ENABLED","API15-G-015":"SITE.DISABLED","API15-G-016":"SITE.ARCHIVED"}[operation_id]
                self._write_audit(c,event_code=event,principal=principal,headers=headers,target_type="SITE",target_id=_m(target)["site_id"],site_id=_m(target)["site_id"],details={"operation_id":operation_id,"changed_field_names":sorted((body or {}).keys()) if operation_id=="API15-G-013" else ["status"]})
                return 200,{"site":self._site(c,key)},{}
            if operation_id == "API15-G-017":
                key=path_params["site_key"]; site=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":key}).fetchone();
                if not site: raise NotFound("resource not found")
                row=c.execute(text("INSERT INTO site_deletion_requests(site_id,requested_by_admin_id,reason) VALUES (:s,:a,:r) RETURNING request_id,requested_at"),{"s":_m(site)["site_id"],"a":principal.admin_id,"r":body["reason"]}).fetchone()
                c.execute(text("UPDATE sites SET status='DELETION_REQUESTED',deletion_requested_at=now(),updated_at=now() WHERE site_key=:k"),{"k":key})
                d=_m(row)
                self._write_audit(c,event_code="SITE.DELETION_REQUESTED",principal=principal,headers=headers,target_type="SITE",target_id=_m(site)["site_id"],site_id=_m(site)["site_id"],details={"operation_id":operation_id,"reason":body["reason"]})
                return 201,{"request_id":str(d["request_id"]),"site_key":key,"state":"REQUESTED","created_at":_iso(d["requested_at"])},{}
            if operation_id == "API15-G-018":
                site=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":path_params["site_key"]}).fetchone();
                if not site: raise NotFound("resource not found")
                rows=c.execute(text("SELECT * FROM domains WHERE site_id=:s ORDER BY is_canonical DESC,hostname_normalized"),{"s":_m(site)["site_id"]}).fetchall(); return 200,{"items":[self._domain(r) for r in rows]},{}
            if operation_id in {"API15-G-019","API15-G-020","API15-G-021","API15-G-022"}:
                key=path_params["site_key"]; site=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":key}).fetchone();
                if not site: raise NotFound("resource not found")
                sid=_m(site)["site_id"]
                if operation_id=="API15-G-019":
                    b=body or {}; row=c.execute(text("INSERT INTO domains(site_id,hostname,is_canonical,is_active) VALUES (:s,:h,:can,:act) RETURNING *"),{"s":sid,"h":b["hostname"],"can":bool(b.get("is_canonical",False)),"act":bool(b.get("is_active",True))}).fetchone()
                    self._write_audit(c,event_code="SITE.DOMAIN_CHANGED",principal=principal,headers=headers,target_type="DOMAIN",target_id=_m(row)["domain_id"],site_id=sid,details={"operation_id":operation_id,"changed_field_names":["hostname","is_canonical","is_active"]})
                    return 201,{"domain":self._domain(row)},{}
                did=path_params["domain_id"]; row=c.execute(text("SELECT * FROM domains WHERE domain_id=:d AND site_id=:s"),{"d":did,"s":sid}).fetchone();
                if not row: raise NotFound("resource not found")
                if operation_id=="API15-G-020": c.execute(text("UPDATE domains SET is_active=:v,updated_at=now() WHERE domain_id=:d AND site_id=:s"),{"v":body["is_active"],"d":did,"s":sid})
                elif operation_id=="API15-G-021":
                    if bool(_m(row)["is_canonical"]): raise Conflict("canonical domain cannot be deleted")
                    self._write_audit(c,event_code="SITE.DOMAIN_CHANGED",principal=principal,headers=headers,target_type="DOMAIN",target_id=did,site_id=sid,details={"operation_id":operation_id,"changed_field_names":["deleted"]})
                    c.execute(text("DELETE FROM domains WHERE domain_id=:d AND site_id=:s"),{"d":did,"s":sid}); return 204,None,{}
                else:
                    # Serialize canonical promotion for this tenant. Both updates
                    # participate in the enclosing engine.begin() transaction.
                    c.execute(text("SELECT 1 FROM sites WHERE site_id=:s FOR UPDATE"), {"s": sid})
                    c.execute(text("UPDATE domains SET is_canonical=false,updated_at=now() WHERE site_id=:s"),{"s":sid}); c.execute(text("UPDATE domains SET is_canonical=true,is_active=true,updated_at=now() WHERE domain_id=:d AND site_id=:s"),{"d":did,"s":sid})
                self._write_audit(c,event_code="SITE.DOMAIN_CHANGED",principal=principal,headers=headers,target_type="DOMAIN",target_id=did,site_id=sid,details={"operation_id":operation_id,"changed_field_names":["is_active"] if operation_id=="API15-G-020" else ["is_canonical","is_active"]})
                row=c.execute(text("SELECT * FROM domains WHERE domain_id=:d"),{"d":did}).fetchone(); return 200,{"domain":self._domain(row)},{}
            if operation_id == "API15-G-030":
                page,size,off=_page(query); rows=c.execute(text("SELECT * FROM admin_accounts ORDER BY created_at DESC LIMIT :l OFFSET :o"),{"l":size+1,"o":off}).fetchall(); return 200,{"items":[self._admin(c,r) for r in rows[:size]],"page":{"page":page,"page_size":size,"has_more":len(rows)>size}},{}
            if operation_id == "API15-G-031":
                b=body or {}
                self._validate_launch_access(b.get("site_assignments", []), b.get("role_assignments", []), require_one=True)
                if c.execute(text("SELECT 1 FROM admin_accounts WHERE email_normalized=lower(btrim(:email))"), {"email": b["email"]}).fetchone():
                    raise Conflict("an Admin account with this email already exists")
                row=c.execute(text("INSERT INTO admin_accounts(email,display_name,status,is_super_admin) VALUES (:e,:n,'INVITED',false) RETURNING *"),{"e":b["email"],"n":b["display_name"]}).fetchone(); aid=_m(row)["admin_id"]
                self._replace_site_assignments(c,aid,b.get("site_assignments",[]),principal.admin_id,principal=principal,headers=headers,operation_id=operation_id); self._replace_role_assignments(c,aid,b.get("role_assignments",[]),principal.admin_id,principal=principal,headers=headers,operation_id=operation_id)
                self._write_audit(c,event_code="ACCOUNT.CREATED",principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=aid,details={"operation_id":operation_id,"changed_field_names":["email","display_name","site_assignments","role_assignments"]})
                row=c.execute(text("SELECT * FROM admin_accounts WHERE admin_id=:id"),{"id":aid}).fetchone(); return 201,{"admin_user":self._admin(c,row)},{}
            if operation_id in {"API15-G-032","API15-G-033","API15-G-034","API15-G-035","API15-G-036","API15-G-037"}:
                aid=path_params["admin_user_id"]; row=c.execute(text("SELECT * FROM admin_accounts WHERE admin_id=:id"),{"id":aid}).fetchone();
                if not row: raise NotFound("resource not found")
                if operation_id=="API15-G-033":
                    b=body or {}; sets=[]; params={"id":aid}
                    for k in ("display_name","email"):
                        if k in b: sets.append(f"{k}=:{k}");params[k]=b[k]
                    if sets: c.execute(text("UPDATE admin_accounts SET "+",".join(sets)+",updated_at=now() WHERE admin_id=:id"),params)
                    if "site_assignments" in b or "role_assignments" in b:
                        if "site_assignments" not in b or "role_assignments" not in b:
                            raise ValidationFault("website assignments and access levels must be saved together")
                        self._validate_launch_access(b["site_assignments"], b["role_assignments"], require_one=False)
                        self._replace_site_assignments(c,aid,b["site_assignments"],principal.admin_id,principal=principal,headers=headers,operation_id=operation_id)
                        self._replace_role_assignments(c,aid,b["role_assignments"],principal.admin_id,principal=principal,headers=headers,operation_id=operation_id)
                elif operation_id=="API15-G-034": c.execute(text("UPDATE admin_accounts SET status='ACTIVE',disabled_at=NULL,updated_at=now() WHERE admin_id=:id"),{"id":aid})
                elif operation_id=="API15-G-035":
                    if bool(_m(row).get("is_super_admin")): raise Conflict("designated Super Admin cannot be disabled")
                    c.execute(text("UPDATE admin_accounts SET status='DISABLED',disabled_at=now(),updated_at=now() WHERE admin_id=:id"),{"id":aid})
                elif operation_id=="API15-G-036": self._replace_site_assignments(c,aid,body["site_keys"],principal.admin_id,principal=principal,headers=headers,operation_id=operation_id)
                elif operation_id=="API15-G-037": self._replace_role_assignments(c,aid,body["assignments"],principal.admin_id,principal=principal,headers=headers,operation_id=operation_id)
                event={"API15-G-033":"ACCOUNT.PROFILE.UPDATED","API15-G-034":"ACCOUNT.ENABLED","API15-G-035":"ACCOUNT.DISABLED"}.get(operation_id)
                if event:
                    self._write_audit(c,event_code=event,principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=aid,details={"operation_id":operation_id,"changed_field_names":sorted((body or {}).keys()) if operation_id=="API15-G-033" else ["status"]})
                row=c.execute(text("SELECT * FROM admin_accounts WHERE admin_id=:id"),{"id":aid}).fetchone(); return 200,{"admin_user":self._admin(c,row)},{}
            if operation_id == "API15-G-040":
                rows=c.execute(text("SELECT * FROM roles ORDER BY scope,name_normalized")).fetchall(); return 200,{"items":[self._role(c,r) for r in rows]},{}
            if operation_id in {"API15-G-041","API15-G-042","API15-G-043","API15-G-044","API15-G-045"}:
                if operation_id=="API15-G-041":
                    b=body or {}; row=c.execute(text("INSERT INTO roles(scope,name,description,created_by_admin_id) VALUES (:s,:n,:d,:a) RETURNING *"),{"s":b["scope"],"n":b["name"],"d":b.get("description"),"a":principal.admin_id}).fetchone(); self._replace_role_permissions(c,_m(row)["role_id"],b["scope"],b["permission_keys"]); self._write_audit(c,event_code="ROLE.CREATED",principal=principal,headers=headers,target_type="ROLE",target_id=_m(row)["role_id"],details={"operation_id":operation_id,"changed_field_names":["scope","name","description","permission_keys"]}); return 201,{"role":self._role(c,row)},{}
                rid=path_params["role_id"]; row=c.execute(text("SELECT * FROM roles WHERE role_id=:id"),{"id":rid}).fetchone();
                if not row: raise NotFound("resource not found")
                if _m(row).get("name_normalized") in {"content editor", "full website manager"} and operation_id in {"API15-G-043", "API15-G-044"}:
                    raise Conflict("system-managed access levels cannot be edited or retired")
                if operation_id=="API15-G-043":
                    b=body or {}; sets=[]; params={"id":rid,"actor":principal.admin_id}
                    for k in ("name","description"):
                        if k in b: sets.append(f"{k}=:{k}");params[k]=b[k]
                    if sets: c.execute(text("UPDATE roles SET "+",".join(sets)+",updated_by_admin_id=:actor,updated_at=now() WHERE role_id=:id"),params)
                    if "permission_keys" in b: self._replace_role_permissions(c,rid,_m(row)["scope"],b["permission_keys"])
                elif operation_id=="API15-G-044": c.execute(text("UPDATE roles SET status='RETIRED',retired_at=now(),updated_at=now(),updated_by_admin_id=:a WHERE role_id=:id"),{"a":principal.admin_id,"id":rid})
                elif operation_id=="API15-G-045":
                    b=body or {}; src=_m(row); new=c.execute(text("INSERT INTO roles(scope,name,description,created_by_admin_id) VALUES (:s,:n,:d,:a) RETURNING *"),{"s":src["scope"],"n":b["name"],"d":src.get("description"),"a":principal.admin_id}).fetchone(); perms=[_m(r)["permission_key"] for r in c.execute(text("SELECT permission_key FROM role_permissions WHERE role_id=:id"),{"id":rid}).fetchall()]; self._replace_role_permissions(c,_m(new)["role_id"],src["scope"],perms); self._write_audit(c,event_code="ROLE.DUPLICATED",principal=principal,headers=headers,target_type="ROLE",target_id=_m(new)["role_id"],details={"operation_id":operation_id,"source_role_id":str(rid)}); return 201,{"role":self._role(c,new)},{}
                if operation_id in {"API15-G-043","API15-G-044"}:
                    self._write_audit(c,event_code="ROLE.UPDATED" if operation_id=="API15-G-043" else "ROLE.RETIRED",principal=principal,headers=headers,target_type="ROLE",target_id=rid,details={"operation_id":operation_id,"changed_field_names":sorted((body or {}).keys()) if operation_id=="API15-G-043" else ["status"]})
                row=c.execute(text("SELECT * FROM roles WHERE role_id=:id"),{"id":rid}).fetchone(); return 200,{"role":self._role(c,row)},{}
            if operation_id == "API15-G-046":
                rows=c.execute(text("SELECT * FROM permissions ORDER BY permission_key")).fetchall(); items=[]
                for r in rows:
                    d=_m(r); pre=[_m(x)["required_permission_key"] for x in c.execute(text("SELECT required_permission_key FROM permission_prerequisites WHERE permission_key=:k ORDER BY required_permission_key"),{"k":d["permission_key"]}).fetchall()]; items.append({"permission_key":d["permission_key"],"scope":d["scope"],"description":d["description"],"prerequisite_keys":pre})
                return 200,{"items":items,"count":69},{}
            if operation_id in {"API15-G-050","API15-G-051"}:
                base="SELECT a.*,s.site_key FROM audit_events a LEFT JOIN sites s ON s.site_id=a.site_id"
                if operation_id=="API15-G-051":
                    row=c.execute(text(base+" WHERE a.audit_id=:id"),{"id":path_params["audit_id"]}).fetchone();
                    if not row: raise NotFound("resource not found")
                    return 200,{"audit":self._audit(row)},{}
                page,size,off=_page(query); rows=c.execute(text(base+" ORDER BY a.occurred_at DESC LIMIT :l OFFSET :o"),{"l":size+1,"o":off}).fetchall(); return 200,{"items":[self._audit(r) for r in rows[:size]],"page":{"page":page,"page_size":size,"has_more":len(rows)>size}},{}
            if operation_id == "API15-G-052":
                count=int(c.execute(text("SELECT count(*) FROM audit_events")).scalar_one())
                self._write_audit(c,event_code="AUDIT.EXPORTED",principal=principal,headers=headers,details={"operation_id":operation_id,"format":(body or {}).get("format"),"matched_record_count":count})
                return 202,{"accepted":True,"request_id":headers.get("x-request-id","accepted")},{}
            if operation_id in {"API15-G-060","API15-G-061"}:
                if operation_id=="API15-G-061":
                    for item in body["settings"]:
                        result=c.execute(text("UPDATE platform_settings SET value_jsonb=CAST(:v AS jsonb),updated_at=now(),updated_by_admin_id=:a WHERE setting_key=:k AND is_editable=true"),{"v":json.dumps(item["value"]),"a":principal.admin_id,"k":item["key"]})
                        if result.rowcount!=1: raise ValidationFault("setting is not editable")
                    self._write_audit(c,event_code="PLATFORM.SETTING_UPDATED",principal=principal,headers=headers,details={"operation_id":operation_id,"changed_field_names":[str(item["key"]) for item in body["settings"]]})
                rows=c.execute(text("SELECT setting_key,value_jsonb FROM platform_settings ORDER BY setting_key")).fetchall(); return 200,{"settings":[{"key":_m(r)["setting_key"],"value":_m(r)["value_jsonb"]} for r in rows]},{}
        raise RuntimeError(f"unhandled GLOBAL operation {operation_id}")

    def _replace_site_assignments(self,c,admin_id:Any,site_keys:list[str],actor_id:str,*,principal:Any,headers:dict[str,str],operation_id:str)->None:
        before_rows=c.execute(text("SELECT s.site_key FROM account_site_assignments a JOIN sites s ON s.site_id=a.site_id WHERE a.admin_id=:a"),{"a":admin_id}).fetchall()
        before={str(_m(r)["site_key"]) for r in before_rows}
        requested=set(site_keys)
        c.execute(text("DELETE FROM account_site_assignments WHERE admin_id=:a"),{"a":admin_id})
        for key in sorted(requested):
            row=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":key}).fetchone()
            if not row: raise ValidationFault("unknown site assignment")
            c.execute(text("INSERT INTO account_site_assignments(admin_id,site_id,assigned_by_admin_id) VALUES (:a,:s,:by)"),{"a":admin_id,"s":_m(row)["site_id"],"by":actor_id})
        for key in sorted(requested-before):
            self._write_audit(c,event_code="AUTHZ.SITE_ASSIGNED",principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=admin_id,details={"operation_id":operation_id,"site_key":key})
        for key in sorted(before-requested):
            self._write_audit(c,event_code="AUTHZ.SITE_UNASSIGNED",principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=admin_id,details={"operation_id":operation_id,"site_key":key})

    def _replace_role_assignments(self,c,admin_id:Any,assignments:list[dict[str,Any]],actor_id:str,*,principal:Any,headers:dict[str,str],operation_id:str)->None:
        target=c.execute(text("SELECT is_super_admin FROM admin_accounts WHERE admin_id=:a"),{"a":admin_id}).fetchone()
        if not target: raise ValidationFault("unknown Admin account")
        target_is_super=bool(_m(target)["is_super_admin"])
        if not target_is_super and any(str(item.get("scope"))=="GLOBAL" for item in assignments):
            raise ValidationFault("ordinary Admin accounts cannot hold GLOBAL authority")
        before_global={("GLOBAL",str(_m(r)["role_id"]),None) for r in c.execute(text("SELECT role_id FROM account_global_role_assignments WHERE admin_id=:a"),{"a":admin_id}).fetchall()}
        before_site={("SITE",str(_m(r)["role_id"]),str(_m(r)["site_key"])) for r in c.execute(text("SELECT a.role_id,s.site_key FROM account_site_role_assignments a JOIN sites s ON s.site_id=a.site_id WHERE a.admin_id=:a"),{"a":admin_id}).fetchall()}
        before=before_global|before_site
        requested={(str(item["scope"]),str(item["role_id"]),str(item.get("site_key")) if item.get("site_key") is not None else None) for item in assignments}
        c.execute(text("DELETE FROM account_global_role_assignments WHERE admin_id=:a"),{"a":admin_id}); c.execute(text("DELETE FROM account_site_role_assignments WHERE admin_id=:a"),{"a":admin_id})
        for item in assignments:
            role=c.execute(text("SELECT scope,name_normalized FROM roles WHERE role_id=:r AND status='ACTIVE'"),{"r":item["role_id"]}).fetchone()
            if not role or _m(role)["scope"]!=item["scope"]: raise ValidationFault("invalid role assignment")
            if not target_is_super and item["scope"]=="SITE" and _m(role)["name_normalized"] not in {"content editor", "full website manager"}:
                raise ValidationFault("ordinary Admin website access must use a system-managed access level")
            if item["scope"]=="GLOBAL": c.execute(text("INSERT INTO account_global_role_assignments(admin_id,role_id,assigned_by_admin_id) VALUES (:a,:r,:by)"),{"a":admin_id,"r":item["role_id"],"by":actor_id})
            else:
                site=c.execute(text("SELECT site_id FROM sites WHERE site_key=:k"),{"k":item["site_key"]}).fetchone()
                if not site: raise ValidationFault("unknown site assignment")
                sid=_m(site)["site_id"]; c.execute(text("INSERT INTO account_site_assignments(admin_id,site_id,assigned_by_admin_id) VALUES (:a,:s,:by) ON CONFLICT (admin_id,site_id) DO NOTHING"),{"a":admin_id,"s":sid,"by":actor_id}); c.execute(text("INSERT INTO account_site_role_assignments(admin_id,site_id,role_id,assigned_by_admin_id) VALUES (:a,:s,:r,:by)"),{"a":admin_id,"s":sid,"r":item["role_id"],"by":actor_id})
        for scope,role_id,site_key in sorted(requested-before):
            self._write_audit(c,event_code="AUTHZ.GLOBAL_ROLE_ASSIGNED" if scope=="GLOBAL" else "AUTHZ.SITE_ROLE_ASSIGNED",principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=admin_id,details={"operation_id":operation_id,"role_id":role_id,"site_key":site_key})
        for scope,role_id,site_key in sorted(before-requested):
            self._write_audit(c,event_code="AUTHZ.GLOBAL_ROLE_UNASSIGNED" if scope=="GLOBAL" else "AUTHZ.SITE_ROLE_UNASSIGNED",principal=principal,headers=headers,target_type="ADMIN_ACCOUNT",target_id=admin_id,details={"operation_id":operation_id,"role_id":role_id,"site_key":site_key})

    def _replace_role_permissions(self,c,role_id:Any,scope:str,keys:list[str])->None:
        unique_keys=sorted(set(keys))
        for key in unique_keys:
            row=c.execute(text("SELECT 1 FROM permissions WHERE scope=:s AND permission_key=:k"),{"s":scope,"k":key}).fetchone()
            if not row: raise ValidationFault("permission scope mismatch")
        c.execute(text("DELETE FROM role_permissions WHERE role_id=:r"),{"r":role_id})
        for key in unique_keys: c.execute(text("INSERT INTO role_permissions(role_id,permission_key,scope) VALUES (:r,:k,:s)"),{"r":role_id,"k":key,"s":scope})
