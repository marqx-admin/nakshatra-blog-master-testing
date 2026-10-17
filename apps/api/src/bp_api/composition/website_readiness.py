"""Read-only setup assessment, never a lifecycle transition or deployment claim."""
import json
from sqlalchemy import text
from bp_domain.website_content import information_page_ready, public_text


class WebsiteReadinessProjection:
    def __init__(self, public_backend, presentation_policy, temporary_suffix):
        self.backend = public_backend
        self.policy = presentation_policy
        self.temporary_suffix = (temporary_suffix or "").lower().strip(".")

    async def build(self, context):
        checks = []
        def add(key, ready, detail):
            checks.append({"key":key,"status":"READY" if ready else "NEEDS_ATTENTION","detail":detail})
        async with self.backend.site_transactions.transaction(context) as connection:
            site, settings = self.backend._base_rows(connection, context)
            def obj(value):
                return json.loads(value) if isinstance(value, str) else value or {}
            presentation = obj(settings.get("presentation_config"))
            pages = obj(settings.get("static_pages"))
            menus = self.backend._navigation(connection, context, settings)
            params = {"sid":context.site_id}
            menu_count = connection.execute(text("SELECT COUNT(*) FROM navigation_menus WHERE site_id=:sid AND menu_key IN ('HEADER','FOOTER')"),params).scalar_one()
            sections = connection.execute(text("SELECT COUNT(*) FROM homepage_sections WHERE site_id=:sid"),params).scalar_one()
            domains = connection.execute(text("SELECT hostname,is_canonical FROM domains WHERE site_id=:sid AND is_active=true"),params).fetchall()
            temporary = any(self.temporary_suffix and str(row._mapping["hostname"]).endswith("."+self.temporary_suffix) for row in domains)
            identity = bool(context.site_id and context.site_key and site.get("display_name") and site.get("timezone_id"))
            valid_appearance = self.policy.presentation_valid(presentation) and self.backend._presentation_references_valid(connection,context,presentation)
            provisioned = identity and valid_appearance and menu_count == 2 and sections >= 2 and temporary
            add("IDENTITY", identity, "Stored website name, UUID, key and timezone; name is managed in Global Websites.")
            add("APPEARANCE",valid_appearance,"Saved appearance must satisfy the current versioned contract.")
            add("HOMEPAGE",bool(sections >= 2 and public_text(settings.get("homepage_h1") or "",required=True) and public_text(settings.get("homepage_intro_text") or "",required=True)),"Review and save the actual homepage heading and introduction; no published posts are required.")
            invalid_nav = False
            for raw in connection.execute(text("SELECT * FROM navigation_items WHERE site_id=:sid AND is_enabled=true"),params).fetchall():
                if self.backend._resolve_destination(connection,context,dict(raw._mapping),pages) is None: invalid_nav=True
            add("NAVIGATION",not invalid_nav and all(menus[key]["items"] for key in ("header","footer")),"Both menus need eligible destinations; disabled or unknown links are excluded from public rendering.")
            for key in ("ABOUT","CONTACT","PRIVACY","TERMS","DISCLAIMER"):
                page = pages.get(key)
                add(key,bool(isinstance(page,dict) and page.get("enabled") is True and information_page_ready(page)),"Owner must review, complete and explicitly enable this page; draft templates are not approval.")
            media_ok = all(not settings.get(key) or self.backend._media(connection,context,str(settings[key])) is not None for key in ("logo_media_id","favicon_media_id","default_social_image_media_id"))
            add("BRANDING_MEDIA",media_ok,"Logo/favicon are optional; any selected assets must resolve within this site. Owner visual review remains required.")
            seo = self.backend._seo_defaults(settings)
            add("SEO",bool(seo.get("seo_title") or seo.get("meta_description")),"Review SEO defaults and indexing policy; preview always forces noindex.")
            add("TEMPORARY_DOMAIN",temporary,"A registered active temporary Host is required, even while public access remains disabled.")
            add("PUBLIC_ACTIVATION",str(site.get("status")) == "ACTIVE","Public access requires a separate authorized lifecycle action. This checklist never activates a site.")
            checks.extend({"key":key,"status":"NOT_VERIFIED","detail":detail} for key,detail in (
                ("PERMANENT_DOMAIN_TLS","Permanent canonical domain, DNS ownership and TLS require separate operational evidence."),
                ("SECURITY_PLATFORM_HEALTH","FORCE-RLS, services, browser acceptance and launch approval require owner-led verification."),
            ))
            content_keys={"IDENTITY","APPEARANCE","HOMEPAGE","NAVIGATION","ABOUT","CONTACT","PRIVACY","TERMS","DISCLAIMER","BRANDING_MEDIA","SEO"}
            content_ready=provisioned and all(check["status"] == "READY" for check in checks if check["key"] in content_keys)
            return {"provisioned":bool(provisioned),"content_ready":bool(content_ready),"launch_ready":False,
                "stage":"CONTENT_READY" if content_ready else "PROVISIONED" if provisioned else "SETUP_REQUIRED","checks":checks}
