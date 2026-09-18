from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from sqlalchemy import text


def _m(row: Any) -> dict[str, Any]: return dict(getattr(row, "_mapping", row))
def _iso(v: Any) -> str:
    if isinstance(v, datetime):
        if v.tzinfo is None: v=v.replace(tzinfo=UTC)
        return v.astimezone(UTC).isoformat().replace("+00:00","Z")
    return str(v)


class PostgresDerivedAdminRepository:
    """RLS-bound persistence for already-accepted CHAT05 Admin services.

    No schema or discovery/media algorithm lives here; this is only the concrete
    repository seam required to compose those application services in the API.
    """
    def __init__(self, site_transactions: Any) -> None: self.tx=site_transactions

    def _media(self,d:dict[str,Any])->dict[str,Any]:
        out={"media_id":str(d["media_id"]),"status":d["status"],"filename":d["original_filename"],"mime_type":d["mime_type"],"size_bytes":int(d["byte_size"]),"created_at":_iso(d["created_at"]),"updated_at":_iso(d["updated_at"]),"usage_count":int(d.get("usage_count") or 0),"variants":list(d.get("variants") or [])}
        for src,dst in [("width_px","width"),("height_px","height"),("alt_text","alt_text"),("title","title"),("caption","caption"),("credit_text","credit"),("source_url","source_url")]:
            if d.get(src) is not None: out[dst]=d[src]
        return out

    async def list_media(self,context,*,query):
        page=max(1,int(query.get("page",1))); size=max(1,min(50,int(query.get("page_size",50)))); off=(page-1)*size
        search=str(query.get("search") or "").strip(); where="m.site_id=:s AND m.status='ACTIVE'"; params={"s":context.site_id,"l":size+1,"o":off}
        if search: where+=" AND (m.original_filename ILIKE :search OR m.title ILIKE :search)"; params["search"]=f"%{search}%"
        async with self.tx.transaction(context) as c:
            rows=c.execute(text(f"SELECT m.*,(SELECT count(*) FROM media_usages u WHERE u.site_id=m.site_id AND u.media_id=m.media_id) usage_count FROM media m WHERE {where} ORDER BY m.created_at DESC LIMIT :l OFFSET :o"),params).fetchall()
            items=[]
            for r in rows[:size]:
                d=_m(r); vr=c.execute(text("SELECT variant_key,mime_type,byte_size,width_px,height_px FROM media_variants WHERE site_id=:s AND media_id=:id ORDER BY variant_key"),{"s":context.site_id,"id":d["media_id"]}).fetchall(); d["variants"]=[{k:v for k,v in {"variant_key":_m(x)["variant_key"],"mime_type":_m(x)["mime_type"],"byte_size":int(_m(x)["byte_size"]),"width":_m(x).get("width_px"),"height":_m(x).get("height_px")}.items() if v is not None} for x in vr]; items.append(self._media(d))
        return items,len(rows)>size
    async def get_media(self,context,media_id):
        async with self.tx.transaction(context) as c:
            row=c.execute(text("SELECT m.*,(SELECT count(*) FROM media_usages u WHERE u.site_id=m.site_id AND u.media_id=m.media_id) usage_count FROM media m WHERE m.site_id=:s AND m.media_id=:id AND m.status='ACTIVE'"),{"s":context.site_id,"id":media_id}).fetchone()
            if row is None: return None
            d=_m(row); vr=c.execute(text("SELECT variant_key,mime_type,byte_size,width_px,height_px FROM media_variants WHERE site_id=:s AND media_id=:id ORDER BY variant_key"),{"s":context.site_id,"id":media_id}).fetchall(); d["variants"]=[{k:v for k,v in {"variant_key":_m(x)["variant_key"],"mime_type":_m(x)["mime_type"],"byte_size":int(_m(x)["byte_size"]),"width":_m(x).get("width_px"),"height":_m(x).get("height_px")}.items() if v is not None} for x in vr]
        return self._media(d)
    async def create_media(self,context,record,native_variant,*,actor_admin_id):
        async with self.tx.transaction(context) as c:
            row=c.execute(text("INSERT INTO media(media_id,site_id,status,original_filename,mime_type,byte_size,width_px,height_px,checksum_sha256,object_key,alt_text,title,caption,credit_text,source_url,created_by_admin_id) VALUES (:id,:s,'ACTIVE',:fn,:mt,:bs,:w,:h,:sha,:key,:alt,:title,:cap,:credit,:url,:actor) RETURNING *"),{"id":record["media_id"],"s":context.site_id,"fn":record["filename"],"mt":record["mime_type"],"bs":record["size_bytes"],"w":record.get("width"),"h":record.get("height"),"sha":record["checksum_sha256"],"key":record["object_key"],"alt":record.get("alt_text"),"title":record.get("title"),"cap":record.get("caption"),"credit":record.get("credit_text"),"url":record.get("source_url"),"actor":actor_admin_id}).fetchone()
            c.execute(text("INSERT INTO media_variants(site_id,media_id,variant_key,mime_type,byte_size,width_px,height_px,object_key) VALUES (:s,:id,:vk,:mt,:bs,:w,:h,:key)"),{"s":context.site_id,"id":record["media_id"],"vk":native_variant["variant_key"],"mt":native_variant["mime_type"],"bs":native_variant["byte_size"],"w":native_variant.get("width"),"h":native_variant.get("height"),"key":native_variant["object_key"]})
        return self._media(_m(row))
    async def update_metadata(self,context,media_id,fields,*,actor_admin_id):
        mapping={"alt_text":"alt_text","title":"title","caption":"caption","credit_text":"credit_text","source_url":"source_url"}; sets=[]; p={"s":context.site_id,"id":media_id,"actor":actor_admin_id}
        for k,col in mapping.items():
            if k in fields: sets.append(f"{col}=:{k}"); p[k]=fields[k]
        if not sets: return await self.get_media(context,media_id)
        async with self.tx.transaction(context) as c: row=c.execute(text("UPDATE media SET "+",".join(sets)+",updated_by_admin_id=:actor,updated_at=now() WHERE site_id=:s AND media_id=:id AND status='ACTIVE' RETURNING *"),p).fetchone()
        return None if row is None else self._media(_m(row))
    async def replace_generation(self,context,media_id,generation,native_variant,metadata,*,actor_admin_id):
        async with self.tx.transaction(context) as c:
            row=c.execute(text("UPDATE media SET original_filename=:fn,mime_type=:mt,byte_size=:bs,width_px=:w,height_px=:h,object_key=:key,checksum_sha256=:sha,updated_by_admin_id=:actor,updated_at=now() WHERE site_id=:s AND media_id=:id AND status='ACTIVE' RETURNING *"),{"fn":generation["filename"],"mt":generation["mime_type"],"bs":generation["size_bytes"],"w":generation.get("width"),"h":generation.get("height"),"key":generation["object_key"],"sha":generation["checksum_sha256"],"actor":actor_admin_id,"s":context.site_id,"id":media_id}).fetchone()
            if row is None: return None
            c.execute(text("DELETE FROM media_variants WHERE site_id=:s AND media_id=:id"),{"s":context.site_id,"id":media_id})
            c.execute(text("INSERT INTO media_variants(site_id,media_id,variant_key,mime_type,byte_size,width_px,height_px,object_key) VALUES (:s,:id,:vk,:mt,:bs,:w,:h,:key)"),{"s":context.site_id,"id":media_id,"vk":native_variant["variant_key"],"mt":native_variant["mime_type"],"bs":native_variant["byte_size"],"w":native_variant.get("width"),"h":native_variant.get("height"),"key":native_variant["object_key"]})
        if metadata: return await self.update_metadata(context,media_id,metadata,actor_admin_id=actor_admin_id)
        return self._media(_m(row))
    async def authoritative_usages(self,context,media_id):
        async with self.tx.transaction(context) as c:
            rows=c.execute(text("SELECT usage_kind,post_id,author_profile_id FROM media_usages WHERE site_id=:s AND media_id=:id ORDER BY usage_kind,usage_id"),{"s":context.site_id,"id":media_id}).fetchall()
        out=[]
        for r in rows:
            d=_m(r)
            if d.get("post_id"): out.append({"resource_type":"POST","resource_id":str(d["post_id"]),"label":d["usage_kind"]})
            elif d.get("author_profile_id"): out.append({"resource_type":"AUTHOR","resource_id":str(d["author_profile_id"]),"label":d["usage_kind"]})
            else: out.append({"resource_type":"SITE_SETTING","resource_id":str(context.site_id),"label":d["usage_kind"]})
        return out
    async def tombstone_if_unused(self,context,media_id,*,actor_admin_id):
        if await self.authoritative_usages(context,media_id): return False
        async with self.tx.transaction(context) as c: res=c.execute(text("UPDATE media SET status='DELETED',deleted_at=now(),deleted_by_admin_id=:a,updated_at=now() WHERE site_id=:s AND media_id=:id AND status='ACTIVE'"),{"a":actor_admin_id,"s":context.site_id,"id":media_id})
        return res.rowcount==1
    async def upsert_variant(self,context,media_id,variant):
        async with self.tx.transaction(context) as c: c.execute(text("INSERT INTO media_variants(site_id,media_id,variant_key,mime_type,byte_size,width_px,height_px,object_key) VALUES (:s,:id,:vk,:mt,:bs,:w,:h,:key) ON CONFLICT (site_id,media_id,variant_key) DO UPDATE SET mime_type=EXCLUDED.mime_type,byte_size=EXCLUDED.byte_size,width_px=EXCLUDED.width_px,height_px=EXCLUDED.height_px,object_key=EXCLUDED.object_key"),{"s":context.site_id,"id":media_id,"vk":variant["variant_key"],"mt":variant["mime_type"],"bs":variant["byte_size"],"w":variant.get("width"),"h":variant.get("height"),"key":variant["object_key"]})
    async def withdraw_current_variants(self,context,media_id):
        async with self.tx.transaction(context) as c: c.execute(text("DELETE FROM media_variants WHERE site_id=:s AND media_id=:id"),{"s":context.site_id,"id":media_id})

    async def get_site_seo(self,context):
        async with self.tx.transaction(context) as c: row=c.execute(text("SELECT seo_defaults FROM site_settings WHERE site_id=:s"),{"s":context.site_id}).fetchone()
        return {} if row is None else dict(_m(row)["seo_defaults"] or {})
    async def update_site_seo(self,context,fields,*,actor_admin_id):
        async with self.tx.transaction(context) as c:
            c.execute(text("INSERT INTO site_settings(site_id,seo_defaults,updated_by_admin_id) VALUES (:s,CAST(:v AS jsonb),:a) ON CONFLICT (site_id) DO UPDATE SET seo_defaults=EXCLUDED.seo_defaults,updated_by_admin_id=:a,updated_at=now()"),{"s":context.site_id,"v":__import__('json').dumps(fields),"a":actor_admin_id})
        return fields

    def _redirect(self,d):
        return {"redirect_id":str(d["redirect_id"]),"source_path":d["source_path"],"destination_url":d["destination_value"],"status_code":int(d["status_code"]),"is_active":bool(d["is_active"]),"created_at":_iso(d["created_at"]),"updated_at":_iso(d["updated_at"])}
    async def list_redirects(self,context,*,query):
        page=max(1,int(query.get("page",1))); size=max(1,min(50,int(query.get("page_size",50)))); off=(page-1)*size
        async with self.tx.transaction(context) as c: rows=c.execute(text("SELECT * FROM redirects WHERE site_id=:s ORDER BY source_path LIMIT :l OFFSET :o"),{"s":context.site_id,"l":size+1,"o":off}).fetchall()
        return [self._redirect(_m(r)) for r in rows[:size]],len(rows)>size
    async def get_redirect(self,context,redirect_id):
        async with self.tx.transaction(context) as c: row=c.execute(text("SELECT * FROM redirects WHERE site_id=:s AND redirect_id=:id"),{"s":context.site_id,"id":redirect_id}).fetchone()
        return None if row is None else self._redirect(_m(row))
    async def create_redirect(self,context,fields,*,actor_admin_id):
        dest=fields["destination_url"]; kind="INTERNAL_PATH" if str(dest).startswith("/") else "EXTERNAL_URL"
        async with self.tx.transaction(context) as c: row=c.execute(text("INSERT INTO redirects(site_id,source_path,destination_kind,destination_value,status_code,is_active,created_by_admin_id) VALUES (:s,:src,:kind,:dst,:code,:active,:a) RETURNING *"),{"s":context.site_id,"src":fields["source_path"],"kind":kind,"dst":dest,"code":fields["status_code"],"active":fields.get("is_active",True),"a":actor_admin_id}).fetchone()
        return self._redirect(_m(row))
    async def update_redirect(self,context,redirect_id,fields,*,actor_admin_id):
        cur=await self.get_redirect(context,redirect_id)
        if cur is None:return None
        src=fields.get("source_path",cur["source_path"]); dst=fields.get("destination_url",cur["destination_url"]); code=fields.get("status_code",cur["status_code"]); active=fields.get("is_active",cur["is_active"]); kind="INTERNAL_PATH" if str(dst).startswith("/") else "EXTERNAL_URL"
        async with self.tx.transaction(context) as c: row=c.execute(text("UPDATE redirects SET source_path=:src,destination_kind=:kind,destination_value=:dst,status_code=:code,is_active=:active,updated_by_admin_id=:a,updated_at=now() WHERE site_id=:s AND redirect_id=:id RETURNING *"),{"src":src,"kind":kind,"dst":dst,"code":code,"active":active,"a":actor_admin_id,"s":context.site_id,"id":redirect_id}).fetchone()
        return None if row is None else self._redirect(_m(row))
    async def delete_redirect(self,context,redirect_id,*,actor_admin_id):
        async with self.tx.transaction(context) as c: r=c.execute(text("DELETE FROM redirects WHERE site_id=:s AND redirect_id=:id"),{"s":context.site_id,"id":redirect_id})
        return r.rowcount==1
    async def active_graph(self,context,*,exclude_redirect_id=None):
        sql="SELECT * FROM redirects WHERE site_id=:s AND is_active=true"+(" AND redirect_id<>:x" if exclude_redirect_id else "")+" ORDER BY source_path"; p={"s":context.site_id};
        if exclude_redirect_id:p["x"]=exclude_redirect_id
        async with self.tx.transaction(context) as c: rows=c.execute(text(sql),p).fetchall()
        return [self._redirect(_m(r)) for r in rows]
    async def conflicts_with_live_route(self,context,source_path):
        if source_path in {"/","/search","/about","/contact","/privacy-policy","/terms-of-use","/disclaimer"}: return True
        if source_path.startswith("/article/"):
            slug=source_path.removeprefix("/article/")
            async with self.tx.transaction(context) as c: row=c.execute(text("SELECT 1 FROM posts WHERE site_id=:s AND slug=:slug AND status='PUBLISHED'"),{"s":context.site_id,"slug":slug}).fetchone()
            return row is not None
        return False
    async def internal_target_public_eligible(self,context,destination_url):
        if not destination_url.startswith("/"): return True
        return not await self.conflicts_with_live_route(context,destination_url) or destination_url in {"/","/about","/contact","/privacy-policy","/terms-of-use","/disclaimer"}

    def _post_item(self,d):
        return {"post_id":str(d["post_id"]),"status":d["status"],"version":int(d["version"]),"title":d.get("title") or "","updated_at":_iso(d["updated_at"]),"created_at":_iso(d["created_at"])}
    async def search_posts(self,context,*,principal,q,status,page,page_size):
        where="site_id=:s"; p={"s":context.site_id,"q":f"%{q}%","l":page_size+1,"o":(page-1)*page_size}
        if q: where+=" AND (title ILIKE :q OR excerpt ILIKE :q)"
        if status: where+=" AND status=:st";p["st"]=status
        async with self.tx.transaction(context) as c: rows=c.execute(text(f"SELECT * FROM posts WHERE {where} ORDER BY updated_at DESC LIMIT :l OFFSET :o"),p).fetchall()
        return [self._post_item(_m(r)) for r in rows[:page_size]],len(rows)>page_size
    async def internal_links(self,context,*,principal,q,page,page_size):
        return await self.search_posts(context,principal=principal,q=q,status="PUBLISHED",page=page,page_size=page_size)
    async def related_posts(self,context,*,principal,post_id,q,page,page_size):
        return await self.search_posts(context,principal=principal,q=q or "",status="PUBLISHED",page=page,page_size=page_size)
