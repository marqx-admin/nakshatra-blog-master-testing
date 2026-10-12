// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml
// Source SHA-256: 5c3d1246a313facce9b798331cbed5ec2293b3a8d8d0d1adb57373d6d7574eef
// Wire keys intentionally preserve the canonical OpenAPI spelling/casing.

export interface components {
  schemas: {
    "EmptyResponse": Record<string, never>;
    "ApiErrorDetail": {
          "field"?: string;
          "code": string;
          "message": string;
        };
    "ApiError": {
          "error": {
            "code": "BAD_REQUEST" | "UNAUTHENTICATED" | "DENIED" | "NOT_FOUND" | "CONFLICT" | "VERSION_CONFLICT" | "STATE_CONFLICT" | "IDEMPOTENCY_KEY_REUSE" | "VALIDATION_FAILED" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE";
            "message": string;
            "request_id": string;
            "details"?: Array<components["schemas"]["ApiErrorDetail"]>;
          };
        };
    "PageRequestMeta": {
          "page": number;
          "page_size": number;
          "has_more": boolean;
        };
    "AcceptedCommand": {
          "accepted": true;
          "request_id": string;
        };
    "SimpleCommandInput": {
          "reason"?: string;
        };
    "VersionCommandInput": {
          "expected_version": number;
          "reason"?: string;
        };
    "PageContext": {
          "page_id": "PUB-HOME-01" | "PUB-ARTICLE-01" | "PUB-CATEGORY-01" | "PUB-TAG-01" | "PUB-AUTHOR-01" | "PUB-SEARCH-01" | "PUB-STATIC-ABOUT-01" | "PUB-STATIC-CONTACT-01" | "PUB-STATIC-PRIVACY-01" | "PUB-STATIC-TERMS-01" | "PUB-STATIC-DISCLAIMER-01" | "PUB-SYS-PREVIEW-01" | "PUB-SYS-404-01" | "PUB-SYS-410-01";
          "page_kind": "CONTENT" | "STATIC" | "PREVIEW" | "SYSTEM";
          "render_mode": "PUBLIC" | "PREVIEW" | "SYSTEM";
          "locale_code"?: string;
        };
    "PageIntro": {
          "h1": string;
          "intro_text"?: string;
        };
    "PublicDestination": {
          "kind": "HOME" | "ARTICLE" | "CATEGORY" | "TAG" | "AUTHOR" | "SEARCH" | "STATIC" | "EXTERNAL" | "MAILTO" | "TEL";
          "url": string;
          "page_id"?: "PUB-HOME-01" | "PUB-ARTICLE-01" | "PUB-CATEGORY-01" | "PUB-TAG-01" | "PUB-AUTHOR-01" | "PUB-SEARCH-01" | "PUB-STATIC-ABOUT-01" | "PUB-STATIC-CONTACT-01" | "PUB-STATIC-PRIVACY-01" | "PUB-STATIC-TERMS-01" | "PUB-STATIC-DISCLAIMER-01" | "PUB-SYS-PREVIEW-01" | "PUB-SYS-404-01" | "PUB-SYS-410-01";
          "is_external": boolean;
        };
    "SocialProfile": {
          "platform": string;
          "label"?: string;
          "url": string;
        };
    "ContactItem": {
          "kind": "EMAIL" | "PHONE" | "ADDRESS" | "HOURS" | "OTHER_APPROVED";
          "label": string;
          "display_value": string;
          "destination"?: components["schemas"]["PublicDestination"];
        };
    "ContactInfo": {
          "items": Array<components["schemas"]["ContactItem"]>;
        };
    "MediaVariant": {
          "variant_key": string;
          "url": string;
          "mime_type": string;
          "width"?: number;
          "height"?: number;
        };
    "PublicMedia": {
          "media_id": string;
          "url": string;
          "mime_type": string;
          "width"?: number;
          "height"?: number;
          "alt_text"?: string;
          "caption"?: string;
          "variants": Array<components["schemas"]["MediaVariant"]>;
          "credit_text"?: string;
        };
    "PresentationPlainText": string;
    "PresentationPaletteTokens": {
          "surface": string;
          "surface_alt": string;
          "text": string;
          "text_muted": string;
          "accent": string;
          "accent_text": string;
          "border": string;
          "focus": string;
          "primary"?: string;
          "secondary"?: string;
          "background"?: string;
          "heading"?: string;
        };
    "PresentationPalette": {
          "mode": "PRESET" | "CUSTOM";
          "preset_id"?: string;
          "semantic_tokens"?: components["schemas"]["PresentationPaletteTokens"];
        };
    "PresentationBranding": {
          "wordmark"?: components["schemas"]["PresentationPlainText"];
          "tagline"?: components["schemas"]["PresentationPlainText"];
          "logo_media_id"?: string;
        };
    "PresentationTypography": {
          "heading_font_id"?: "SYSTEM_SANS" | "SYSTEM_SERIF";
          "body_font_id"?: "SYSTEM_SANS" | "SYSTEM_SERIF";
          "scale"?: "COMPACT" | "STANDARD" | "LARGE";
        };
    "PresentationLayout": {
          "content_width"?: "NARROW" | "STANDARD" | "WIDE";
          "section_spacing"?: "COMPACT" | "STANDARD" | "SPACIOUS";
          "corner_radius"?: "NONE" | "SMALL" | "MEDIUM";
          "width_id"?: "WIDTH-READING" | "WIDTH-NARROW" | "WIDTH-STANDARD" | "WIDTH-WIDE" | "WIDTH-EXTRA-WIDE" | "WIDTH-FLUID-CAPPED";
          "density_id"?: "DENSITY-COMPACT" | "DENSITY-STANDARD" | "DENSITY-SPACIOUS" | "DENSITY-AIRY";
          "spacing_id"?: "COMPACT" | "STANDARD" | "SPACIOUS";
          "radius_id"?: "RADIUS-SQUARE" | "RADIUS-SUBTLE" | "RADIUS-MEDIUM" | "RADIUS-SOFT" | "RADIUS-ROUND";
          "border_id"?: "BORDER-NONE" | "BORDER-HAIRLINE" | "BORDER-STANDARD" | "BORDER-ACCENT-EDGE" | "BORDER-RULE-DRIVEN";
          "elevation_id"?: "ELEVATION-FLAT" | "ELEVATION-LOW" | "ELEVATION-MEDIUM" | "ELEVATION-FLOATING";
        };
    "PresentationArticleCard": {
          "variant"?: "STANDARD" | "COMPACT" | "FEATURED";
          "image_ratio"?: "SQUARE" | "LANDSCAPE" | "WIDE";
          "show_excerpt"?: boolean;
          "show_author"?: boolean;
        };
    "PresentationCategoryCard": {
          "variant"?: "TEXT" | "ACCENT";
        };
    "PresentationAuthorCard": {
          "variant"?: "COMPACT" | "PROFILE";
          "show_bio"?: boolean;
        };
    "PresentationCards": {
          "article_card_profile_id"?: string;
          "category_card_profile_id"?: string;
          "author_card_profile_id"?: string;
        };
    "PresentationCta": {
          "enabled": boolean;
          "label"?: components["schemas"]["PresentationPlainText"];
          "navigation_item_id"?: string;
        };
    "PresentationButton": {
          "shape"?: "SQUARE" | "ROUNDED" | "PILL";
          "emphasis"?: "SOLID" | "OUTLINE" | "TEXT";
        };
    "PresentationHero": {
          "layout"?: "TEXT_FIRST" | "SPLIT" | "FEATURED_ARTICLE";
          "profile_id"?: string;
          "image_profile_id"?: string;
          "media_id"?: string;
          "cta"?: components["schemas"]["PresentationCta"];
        };
    "PresentationHomepage": {
          "lead_layout"?: "STANDARD" | "EDITORIAL" | "GRID";
          "section_layout"?: "LIST" | "GRID";
          "recipe_id"?: string;
        };
    "PresentationArticle": {
          "layout"?: "STANDARD" | "IMMERSIVE";
          "measure"?: "NARROW" | "STANDARD" | "WIDE";
          "headline_scale"?: "STANDARD" | "LARGE" | "DISPLAY";
          "meta_layout"?: "INLINE" | "STACKED";
          "featured_media_ratio"?: "LANDSCAPE" | "WIDE";
          "author_display"?: "COMPACT" | "PROFILE";
          "related_content_layout"?: "LIST" | "GRID";
          "layout_id"?: string;
          "image_profile_id"?: string;
          "related_card_profile_id"?: string;
        };
    "PresentationCollection": {
          "layout"?: "LIST" | "GRID";
          "columns"?: number;
          "show_intro"?: boolean;
        };
    "PresentationCollections": {
          "category_layout_id"?: string;
          "tag_layout_id"?: string;
          "author_articles_layout_id"?: string;
          "search_layout_id"?: string;
          "article_card_profile_id"?: string;
        };
    "PresentationControls": {
          "button_profile_id"?: string;
        };
    "PresentationConfig": {
          "schema_version": 1;
          "style_id": "STYLE_01" | "STYLE_02" | "STYLE_03" | "STYLE_04" | "STYLE_05" | "CUSTOM";
          "base_style_id"?: "STYLE_01" | "STYLE_02" | "STYLE_03" | "STYLE_04" | "STYLE_05";
          "typography_id"?: string;
          "branding"?: components["schemas"]["PresentationBranding"];
          "palette"?: components["schemas"]["PresentationPalette"];
          "typography"?: components["schemas"]["PresentationTypography"];
          "layout"?: components["schemas"]["PresentationLayout"];
          "article_card"?: components["schemas"]["PresentationArticleCard"];
          "category_card"?: components["schemas"]["PresentationCategoryCard"];
          "author_card"?: components["schemas"]["PresentationAuthorCard"];
          "cards"?: components["schemas"]["PresentationCards"];
          "hero"?: components["schemas"]["PresentationHero"];
          "homepage"?: components["schemas"]["PresentationHomepage"];
          "article"?: components["schemas"]["PresentationArticle"];
          "collection"?: components["schemas"]["PresentationCollection"];
          "collections"?: components["schemas"]["PresentationCollections"];
          "button"?: components["schemas"]["PresentationButton"];
          "controls"?: components["schemas"]["PresentationControls"];
        };
    "TrustedPresentation": {
          "config": components["schemas"]["PresentationConfig"];
          "source": "STORED" | "PRESET_DEFAULT" | "SAFE_DEFAULT";
        };
    "InformationPageSection": {
          "heading"?: components["schemas"]["PresentationPlainText"];
          "paragraphs": Array<components["schemas"]["PresentationPlainText"]>;
          "list_items": Array<components["schemas"]["PresentationPlainText"]>;
        };
    "InformationPage": {
          "enabled": boolean;
          "content_version": number;
          "title": string;
          "intro_text": components["schemas"]["PresentationPlainText"];
          "body_sections": Array<components["schemas"]["InformationPageSection"]>;
        };
    "StaticPages": {
          "ABOUT": components["schemas"]["InformationPage"];
          "CONTACT": components["schemas"]["InformationPage"];
          "PRIVACY": components["schemas"]["InformationPage"];
          "TERMS": components["schemas"]["InformationPage"];
          "DISCLAIMER": components["schemas"]["InformationPage"];
        };
    "SiteIdentity": {
          "site_key": string;
          "display_name": string;
          "canonical_domain": string;
          "home_destination": components["schemas"]["PublicDestination"];
          "logo_media"?: components["schemas"]["PublicMedia"];
          "favicon_media"?: components["schemas"]["PublicMedia"];
          "default_language"?: string;
          "locale_code"?: string;
          "timezone_id": string;
        };
    "PublicSettings": {
          "copyright_text"?: string;
          "social_profiles": Array<components["schemas"]["SocialProfile"]>;
          "default_social_image"?: components["schemas"]["PublicMedia"];
        };
    "NavigationItem": {
          "label": string;
          "destination": components["schemas"]["PublicDestination"];
          "children": Array<components["schemas"]["NavigationItem"]>;
        };
    "NavigationMenu": {
          "menu_key": "HEADER" | "FOOTER";
          "items": Array<components["schemas"]["NavigationItem"]>;
        };
    "NavigationBundle": {
          "header": components["schemas"]["NavigationMenu"];
          "footer": components["schemas"]["NavigationMenu"];
        };
    "BreadcrumbItem": {
          "label": string;
          "destination"?: components["schemas"]["PublicDestination"];
          "is_current": boolean;
        };
    "BreadcrumbTrail": {
          "items": Array<components["schemas"]["BreadcrumbItem"]>;
        };
    "TaxonomySummary": {
          "kind": "CATEGORY" | "TAG";
          "name": string;
          "destination": components["schemas"]["PublicDestination"];
        };
    "AuthorSummary": {
          "author_id": string;
          "display_name": string;
          "destination"?: components["schemas"]["PublicDestination"];
          "avatar_media"?: components["schemas"]["PublicMedia"];
          "short_bio"?: string;
        };
    "AuthorDetail": {
          "author_id": string;
          "display_name": string;
          "destination": components["schemas"]["PublicDestination"];
          "avatar_media"?: components["schemas"]["PublicMedia"];
          "bio"?: string;
          "designation"?: string;
          "expertise": Array<string>;
          "social_profiles": Array<components["schemas"]["SocialProfile"]>;
        };
    "CategoryDetail": {
          "category_id": string;
          "name": string;
          "description"?: string;
          "destination": components["schemas"]["PublicDestination"];
        };
    "TagDetail": {
          "tag_id": string;
          "name": string;
          "description"?: string;
          "destination": components["schemas"]["PublicDestination"];
        };
    "PaginationLink": {
          "page_number": number;
          "destination": components["schemas"]["PublicDestination"];
          "is_current": boolean;
        };
    "Pagination": {
          "current_page": number;
          "links": Array<components["schemas"]["PaginationLink"]>;
          "previous"?: components["schemas"]["PublicDestination"];
          "next"?: components["schemas"]["PublicDestination"];
        };
    "RobotsDirective": {
          "index": boolean;
          "follow": boolean;
        };
    "OpenGraph": {
          "title": string;
          "description"?: string;
          "url"?: string;
          "type": "ARTICLE" | "WEBSITE";
          "image"?: components["schemas"]["PublicMedia"];
        };
    "SeoProjection": {
          "baseline_indexability": "INDEX-ELIGIBLE" | "CONDITIONAL-INDEX" | "NOINDEX";
          "title": string;
          "meta_description"?: string;
          "canonical_url"?: string;
          "open_graph"?: components["schemas"]["OpenGraph"];
          "robots": components["schemas"]["RobotsDirective"];
          "structured_data": Array<Record<string, unknown>>;
        };
    "InlineMark": {
          "kind": "BOLD" | "ITALIC" | "INTERNAL_LINK" | "EXTERNAL_LINK";
          "destination"?: components["schemas"]["PublicDestination"];
        };
    "InlineRun": {
          "text": string;
          "marks": Array<"BOLD" | "ITALIC">;
          "link"?: components["schemas"]["PublicDestination"];
        };
    "RichText": {
          "runs": Array<components["schemas"]["InlineRun"]>;
        };
    "ParagraphBlock": {
          "block_id": string;
          "type": "PARAGRAPH";
          "payload": {
            "content": components["schemas"]["RichText"];
          };
        };
    "HeadingBlock": {
          "block_id": string;
          "type": "HEADING";
          "payload": {
            "level": 2 | 3 | 4;
            "content": components["schemas"]["RichText"];
          };
        };
    "ListBlock": {
          "block_id": string;
          "type": "LIST";
          "payload": {
            "style": "ORDERED" | "UNORDERED";
            "items": Array<components["schemas"]["RichText"]>;
          };
        };
    "QuoteBlock": {
          "block_id": string;
          "type": "QUOTE";
          "payload": {
            "quote": components["schemas"]["RichText"];
            "attribution"?: string;
            "source"?: string;
          };
        };
    "SeparatorBlock": {
          "block_id": string;
          "type": "SEPARATOR";
          "payload": Record<string, never>;
        };
    "MediaBlock": {
          "block_id": string;
          "type": "MEDIA";
          "payload": (unknown & unknown) & ({
            "resolution_state": "READY" | "MISSING";
            "media"?: components["schemas"]["PublicMedia"];
            "alt_override"?: string;
            "caption"?: string;
          });
        };
    "TableBlock": {
          "block_id": string;
          "type": "TABLE";
          "payload": {
            "header_row": boolean;
            "rows": Array<Array<components["schemas"]["RichText"]>>;
          };
        };
    "EmbedBlock": {
          "block_id": string;
          "type": "EMBED";
          "payload": {
            "provider_key": string;
            "source_url_or_id": string;
            "caption"?: string;
          };
        };
    "CalloutBlock": {
          "block_id": string;
          "type": "CALLOUT";
          "payload": {
            "label"?: string;
            "body": components["schemas"]["RichText"];
          };
        };
    "CtaBlock": {
          "block_id": string;
          "type": "CTA";
          "payload": {
            "label": string;
            "supporting_text"?: string;
            "destination": components["schemas"]["PublicDestination"];
          };
        };
    "DisclaimerBlock": {
          "block_id": string;
          "type": "DISCLAIMER";
          "payload": {
            "label"?: string;
            "body": components["schemas"]["RichText"];
          };
        };
    "SourceReferenceEntry": {
          "title": string;
          "url"?: string;
          "publisher"?: string;
          "note"?: string;
        };
    "SourcesReferencesBlock": {
          "block_id": string;
          "type": "SOURCES_REFERENCES";
          "payload": {
            "entries": Array<components["schemas"]["SourceReferenceEntry"]>;
          };
        };
    "ArticleBlock": (components["schemas"]["ParagraphBlock"] | components["schemas"]["HeadingBlock"] | components["schemas"]["ListBlock"] | components["schemas"]["QuoteBlock"] | components["schemas"]["SeparatorBlock"] | components["schemas"]["MediaBlock"] | components["schemas"]["TableBlock"] | components["schemas"]["EmbedBlock"] | components["schemas"]["CalloutBlock"] | components["schemas"]["CtaBlock"] | components["schemas"]["DisclaimerBlock"] | components["schemas"]["SourcesReferencesBlock"]);
    "ArticleBody": {
          "content_schema_version": string;
          "blocks": Array<components["schemas"]["ArticleBlock"]>;
        };
    "ArticleSummary": {
          "article_id": string;
          "destination": components["schemas"]["PublicDestination"];
          "title": string;
          "excerpt"?: string;
          "featured_media"?: components["schemas"]["PublicMedia"];
          "author"?: components["schemas"]["AuthorSummary"];
          "published_at": string;
          "updated_at"?: string;
          "taxonomy_label"?: string;
        };
    "ArticleDetail": {
          "article_id": string;
          "destination": components["schemas"]["PublicDestination"];
          "title": string;
          "excerpt"?: string;
          "body": components["schemas"]["ArticleBody"];
          "featured_media"?: components["schemas"]["PublicMedia"];
          "author": components["schemas"]["AuthorSummary"];
          "categories": Array<components["schemas"]["TaxonomySummary"]>;
          "tags": Array<components["schemas"]["TaxonomySummary"]>;
          "published_at": string;
          "updated_at"?: string;
        };
    "PreviewArticle": {
          "article_id": string;
          "public_destination"?: components["schemas"]["PublicDestination"];
          "title": string;
          "excerpt"?: string;
          "body": components["schemas"]["ArticleBody"];
          "author"?: components["schemas"]["AuthorSummary"];
          "categories": Array<components["schemas"]["TaxonomySummary"]>;
          "tags": Array<components["schemas"]["TaxonomySummary"]>;
          "featured_media"?: components["schemas"]["PublicMedia"];
          "published_at"?: string;
          "updated_at"?: string;
        };
    "RelatedContent": {
          "articles": Array<components["schemas"]["ArticleSummary"]>;
        };
    "HomeSection": (unknown & unknown & unknown) & ({
          "section_key": string;
          "section_kind": "POST_SELECTION" | "CATEGORY_SELECTION" | "TOGGLE_ONLY";
          "label"?: string;
          "posts"?: Array<components["schemas"]["ArticleSummary"]>;
          "categories"?: Array<components["schemas"]["TaxonomySummary"]>;
        });
    "StaticSection": (({
          "paragraphs"?: unknown;
        } | {
          "list_items"?: unknown;
        })) & ({
          "heading"?: string;
          "paragraphs": Array<components["schemas"]["RichText"]>;
          "list_items": Array<components["schemas"]["RichText"]>;
        });
    "StaticContent": {
          "static_key": "ABOUT" | "CONTACT" | "PRIVACY" | "TERMS" | "DISCLAIMER";
          "title": string;
          "intro_text"?: string;
          "sections": Array<components["schemas"]["StaticSection"]>;
        };
    "PreviewMeta": {
          "lifecycle_status": "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
          "source_kind": "COMMITTED" | "WORKING_COPY" | "AUTOSAVE";
          "notice_text": string;
          "return_url"?: string;
        };
    "SystemMessage": {
          "code": 404 | 410;
          "title": string;
          "body": string;
        };
    "RecoveryActions": {
          "home"?: components["schemas"]["PublicDestination"];
          "search"?: components["schemas"]["PublicDestination"];
        };
    "HomePageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "intro": components["schemas"]["PageIntro"];
          "lead_article"?: components["schemas"]["ArticleSummary"];
          "sections": Array<components["schemas"]["HomeSection"]>;
          "latest_articles": Array<components["schemas"]["ArticleSummary"]>;
          "seo": components["schemas"]["SeoProjection"];
        };
    "ArticlePageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "breadcrumbs"?: components["schemas"]["BreadcrumbTrail"];
          "article": components["schemas"]["ArticleDetail"];
          "related_content"?: components["schemas"]["RelatedContent"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "CategoryPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "breadcrumbs"?: components["schemas"]["BreadcrumbTrail"];
          "category": components["schemas"]["CategoryDetail"];
          "articles": Array<components["schemas"]["ArticleSummary"]>;
          "pagination"?: components["schemas"]["Pagination"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "TagPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "breadcrumbs"?: components["schemas"]["BreadcrumbTrail"];
          "tag": components["schemas"]["TagDetail"];
          "articles": Array<components["schemas"]["ArticleSummary"]>;
          "pagination"?: components["schemas"]["Pagination"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "AuthorPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "breadcrumbs"?: components["schemas"]["BreadcrumbTrail"];
          "author": components["schemas"]["AuthorDetail"];
          "articles": Array<components["schemas"]["ArticleSummary"]>;
          "pagination"?: components["schemas"]["Pagination"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "SearchPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "intro": components["schemas"]["PageIntro"];
          "query": string;
          "search_state": "NO_QUERY" | "RESULTS" | "EMPTY";
          "articles": Array<components["schemas"]["ArticleSummary"]>;
          "result_summary": string;
          "pagination"?: components["schemas"]["Pagination"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "StaticPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "breadcrumbs"?: components["schemas"]["BreadcrumbTrail"];
          "content": components["schemas"]["StaticContent"];
          "contact_info"?: components["schemas"]["ContactInfo"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "PreviewPageData": {
          "context": components["schemas"]["PageContext"];
          "site": components["schemas"]["SiteIdentity"];
          "settings": components["schemas"]["PublicSettings"];
          "navigation": components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "preview": components["schemas"]["PreviewMeta"];
          "article": components["schemas"]["PreviewArticle"];
          "related_content"?: components["schemas"]["RelatedContent"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "NotFoundPageData": {
          "context": components["schemas"]["PageContext"];
          "site"?: components["schemas"]["SiteIdentity"];
          "settings"?: components["schemas"]["PublicSettings"];
          "navigation"?: components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "message": components["schemas"]["SystemMessage"];
          "recovery"?: components["schemas"]["RecoveryActions"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "GonePageData": {
          "context": components["schemas"]["PageContext"];
          "site"?: components["schemas"]["SiteIdentity"];
          "settings"?: components["schemas"]["PublicSettings"];
          "navigation"?: components["schemas"]["NavigationBundle"];
          "presentation"?: components["schemas"]["TrustedPresentation"];
          "message": components["schemas"]["SystemMessage"];
          "recovery": components["schemas"]["RecoveryActions"];
          "seo": components["schemas"]["SeoProjection"];
        };
    "PublicPageResponse": (components["schemas"]["HomePageData"] | components["schemas"]["ArticlePageData"] | components["schemas"]["CategoryPageData"] | components["schemas"]["TagPageData"] | components["schemas"]["AuthorPageData"] | components["schemas"]["SearchPageData"] | components["schemas"]["StaticPageData"]);
    "TemporarySiteUrl": string;
    "AdminSiteContext": {
          "site_key": string;
          "display_name": string;
          "lifecycle_state": string;
          "temporary_site_url"?: components["schemas"]["TemporarySiteUrl"];
          "effective_permissions": Array<"dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit">;
        };
    "AdminGlobalContext": {
          "effective_permissions": Array<"network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view">;
        };
    "DashboardMetric": {
          "key": string;
          "label": string;
          "value": number;
        };
    "DashboardResponse": {
          "metrics": Array<components["schemas"]["DashboardMetric"]>;
          "attention_items": Array<{
            "kind": string;
            "label": string;
            "count": number;
          }>;
        };
    "AdminLinkDestination": {
          "kind": "INTERNAL" | "EXTERNAL";
          "target_type"?: "ARTICLE" | "CATEGORY" | "TAG" | "AUTHOR" | "STATIC";
          "target_id"?: string;
          "url"?: string;
          "static_page_key"?: "ABOUT" | "CONTACT" | "PRIVACY" | "TERMS" | "DISCLAIMER";
        };
    "AdminInlineRun": {
          "text": string;
          "marks": Array<"BOLD" | "ITALIC">;
          "link"?: components["schemas"]["AdminLinkDestination"];
        };
    "AdminRichText": {
          "runs": Array<components["schemas"]["AdminInlineRun"]>;
        };
    "AdminParagraphBlock": {
          "block_id": string;
          "type": "PARAGRAPH";
          "content": components["schemas"]["AdminRichText"];
        };
    "AdminHeadingBlock": {
          "block_id": string;
          "type": "HEADING";
          "level": 2 | 3 | 4;
          "content": components["schemas"]["AdminRichText"];
        };
    "AdminListBlock": {
          "block_id": string;
          "type": "LIST";
          "style": "ORDERED" | "UNORDERED";
          "items": Array<components["schemas"]["AdminRichText"]>;
        };
    "AdminQuoteBlock": {
          "block_id": string;
          "type": "QUOTE";
          "quote": components["schemas"]["AdminRichText"];
          "attribution"?: string;
          "source"?: string;
        };
    "AdminSeparatorBlock": {
          "block_id": string;
          "type": "SEPARATOR";
        };
    "AdminMediaBlock": {
          "block_id": string;
          "type": "MEDIA";
          "media_id": string;
          "alt_override"?: string;
          "caption"?: string;
        };
    "AdminTableBlock": {
          "block_id": string;
          "type": "TABLE";
          "header_row": boolean;
          "rows": Array<Array<components["schemas"]["AdminRichText"]>>;
        };
    "AdminEmbedBlock": {
          "block_id": string;
          "type": "EMBED";
          "provider_key": string;
          "source_url_or_id": string;
          "caption"?: string;
        };
    "AdminCalloutBlock": {
          "block_id": string;
          "type": "CALLOUT";
          "label"?: string;
          "body": components["schemas"]["AdminRichText"];
        };
    "AdminCtaBlock": {
          "block_id": string;
          "type": "CTA";
          "label": string;
          "supporting_text"?: string;
          "destination": components["schemas"]["AdminLinkDestination"];
        };
    "AdminDisclaimerBlock": {
          "block_id": string;
          "type": "DISCLAIMER";
          "label"?: string;
          "body": components["schemas"]["AdminRichText"];
        };
    "AdminSourceReferenceEntry": {
          "title": string;
          "url"?: string;
          "publisher"?: string;
          "note"?: string;
        };
    "AdminSourcesReferencesBlock": {
          "block_id": string;
          "type": "SOURCES_REFERENCES";
          "entries": Array<components["schemas"]["AdminSourceReferenceEntry"]>;
        };
    "AdminArticleBlock": (components["schemas"]["AdminParagraphBlock"] | components["schemas"]["AdminHeadingBlock"] | components["schemas"]["AdminListBlock"] | components["schemas"]["AdminQuoteBlock"] | components["schemas"]["AdminSeparatorBlock"] | components["schemas"]["AdminMediaBlock"] | components["schemas"]["AdminTableBlock"] | components["schemas"]["AdminEmbedBlock"] | components["schemas"]["AdminCalloutBlock"] | components["schemas"]["AdminCtaBlock"] | components["schemas"]["AdminDisclaimerBlock"] | components["schemas"]["AdminSourcesReferencesBlock"]);
    "AdminArticleBody": {
          "content_schema_version": string;
          "blocks": Array<components["schemas"]["AdminArticleBlock"]>;
        };
    "PostResource": {
          "post_id": string;
          "status": "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
          "version": number;
          "title"?: string;
          "excerpt"?: string;
          "body": components["schemas"]["AdminArticleBody"];
          "category_ids": Array<string>;
          "tag_ids": Array<string>;
          "featured_media_id"?: string;
          "manual_related_post_ids": Array<string>;
          "slug"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
          "link_robots_policy"?: "INHERIT" | "FOLLOW" | "NOFOLLOW";
          "og_title"?: string;
          "og_description"?: string;
          "published_at"?: string;
          "updated_at": string;
          "author_site_profile_id"?: string;
          "og_image_media_id"?: string;
          "structured_data_inputs"?: (Record<string, unknown>) & Record<string, (Record<string, unknown>) & Record<string, (string | number | boolean | Array<(string | number | boolean)>)>>;
          "breadcrumb_label"?: string;
          "scheduled_for_utc"?: string;
          "schedule_local_input"?: string;
          "schedule_timezone_id"?: string;
          "first_published_at"?: string;
          "archived_at"?: string;
          "trashed_at"?: string;
          "created_at": string;
        };
    "PostCreateInput": {
          "title"?: string;
          "excerpt"?: string;
          "body": components["schemas"]["AdminArticleBody"];
          "category_ids"?: Array<string>;
          "tag_ids"?: Array<string>;
          "featured_media_id"?: string;
          "manual_related_post_ids"?: Array<string>;
          "slug"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
          "link_robots_policy"?: "INHERIT" | "FOLLOW" | "NOFOLLOW";
          "og_title"?: string;
          "og_description"?: string;
          "author_site_profile_id"?: string;
          "og_image_media_id"?: string;
          "structured_data_inputs"?: (Record<string, unknown>) & Record<string, (Record<string, unknown>) & Record<string, (string | number | boolean | Array<(string | number | boolean)>)>>;
          "breadcrumb_label"?: string;
        };
    "PostUpdateInput": {
          "title"?: string;
          "excerpt"?: string;
          "body"?: components["schemas"]["AdminArticleBody"];
          "category_ids"?: Array<string>;
          "tag_ids"?: Array<string>;
          "featured_media_id"?: string;
          "manual_related_post_ids"?: Array<string>;
          "slug"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
          "link_robots_policy"?: "INHERIT" | "FOLLOW" | "NOFOLLOW";
          "og_title"?: string;
          "og_description"?: string;
          "expected_version": number;
          "author_site_profile_id"?: string;
          "og_image_media_id"?: string;
          "structured_data_inputs"?: (Record<string, unknown>) & Record<string, (Record<string, unknown>) & Record<string, (string | number | boolean | Array<(string | number | boolean)>)>>;
          "breadcrumb_label"?: string;
        };
    "PostResponse": {
          "post": components["schemas"]["PostResource"];
        };
    "PostListResponse": {
          "items": Array<components["schemas"]["PostResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "AutosaveInput": {
          "base_version": number;
          "working_copy": components["schemas"]["PostCreateInput"];
          "editor_instance_id": string;
        };
    "AutosaveResponse": {
          "autosave_id": string;
          "post_id": string;
          "base_version": number;
          "saved_at": string;
          "working_copy": components["schemas"]["PostCreateInput"];
          "editor_instance_id": string;
        };
    "PreviewHandoffInput": {
          "source_kind": "COMMITTED" | "WORKING_COPY" | "AUTOSAVE";
          "base_version"?: number;
          "working_copy"?: components["schemas"]["PostCreateInput"];
          "editor_instance_id"?: string;
        };
    "PreviewHandoffResponse": {
          "preview_url": string;
          "expires_at": string;
        };
    "SchedulePostInput": {
          "expected_version": number;
          "schedule_local_input": string;
          "schedule_timezone_id": string;
        };
    "DuplicatePostInput": {
          "title_override"?: string;
        };
    "BulkPostTarget": {
          "post_id": string;
          "expected_version": number;
        };
    "BulkPostInput": (unknown) & ({
          "action": "PUBLISH" | "SCHEDULE" | "ARCHIVE" | "TRASH" | "RESTORE" | "PERMANENT_DELETE";
          "targets": Array<components["schemas"]["BulkPostTarget"]>;
          "schedule_local_input"?: string;
          "schedule_timezone_id"?: string;
        });
    "BulkPostOutcome": {
          "post_id": string;
          "status": "SUCCESS" | "CONFLICT" | "VALIDATION_FAILED";
          "error_code"?: string;
        };
    "BulkPostResponse": {
          "outcomes": Array<components["schemas"]["BulkPostOutcome"]>;
        };
    "RevisionSummary": {
          "revision_id": string;
          "post_id": string;
          "version": number;
          "created_at": string;
          "created_by_admin_id"?: string;
        };
    "RevisionListResponse": {
          "items": Array<components["schemas"]["RevisionSummary"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "RestoreRevisionInput": {
          "expected_version": number;
        };
    "UrlHistoryItem": {
          "slug": string;
          "became_current_at": string;
          "ceased_current_at"?: string;
        };
    "UrlHistoryResponse": {
          "items": Array<components["schemas"]["UrlHistoryItem"]>;
        };
    "CategoryResource": {
          "category_id": string;
          "name": string;
          "description"?: string;
          "slug": string;
          "parent_category_id"?: string;
          "status": "ACTIVE" | "RETIRED";
          "created_at": string;
          "updated_at": string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "CategoryInput": {
          "name": string;
          "description"?: string;
          "slug"?: string;
          "parent_category_id"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "CategoryUpdateInput": {
          "name"?: string;
          "description"?: string;
          "slug"?: string;
          "parent_category_id"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "CategoryResponse": {
          "category": components["schemas"]["CategoryResource"];
        };
    "CategoryListResponse": {
          "items": Array<components["schemas"]["CategoryResource"]>;
        };
    "TagResource": {
          "tag_id": string;
          "name": string;
          "description"?: string;
          "slug": string;
          "status": "ACTIVE" | "RETIRED";
          "created_at": string;
          "updated_at": string;
        };
    "TagInput": {
          "name": string;
          "description"?: string;
          "slug"?: string;
        };
    "TagUpdateInput": {
          "name"?: string;
          "description"?: string;
          "slug"?: string;
        };
    "TagResponse": {
          "tag": components["schemas"]["TagResource"];
        };
    "TagListResponse": {
          "items": Array<components["schemas"]["TagResource"]>;
        };
    "TagMergeInput": {
          "target_tag_id": string;
        };
    "AuthorResource": {
          "author_id": string;
          "display_name": string;
          "slug"?: string;
          "bio"?: string;
          "designation"?: string;
          "expertise": Array<string>;
          "social_profiles": Array<components["schemas"]["SocialProfile"]>;
          "avatar_media_id"?: string;
          "status": "ACTIVE" | "RETIRED";
          "created_at": string;
          "updated_at": string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "AuthorInput": {
          "display_name": string;
          "slug"?: string;
          "bio"?: string;
          "designation"?: string;
          "expertise": Array<string>;
          "social_profiles": Array<components["schemas"]["SocialProfile"]>;
          "avatar_media_id"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "AuthorUpdateInput": {
          "display_name"?: string;
          "slug"?: string;
          "bio"?: string;
          "designation"?: string;
          "expertise"?: Array<string>;
          "social_profiles"?: Array<components["schemas"]["SocialProfile"]>;
          "avatar_media_id"?: string;
          "seo_title"?: string;
          "meta_description"?: string;
          "canonical_override"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
        };
    "AuthorResponse": {
          "author": components["schemas"]["AuthorResource"];
        };
    "AuthorListResponse": {
          "items": Array<components["schemas"]["AuthorResource"]>;
        };
    "MediaResource": {
          "media_id": string;
          "filename": string;
          "mime_type": string;
          "size_bytes": number;
          "width"?: number;
          "height"?: number;
          "alt_text"?: string;
          "caption"?: string;
          "credit"?: string;
          "status": string;
          "public_url"?: string;
          "created_at": string;
          "updated_at": string;
          "title"?: string;
          "source_url"?: string;
          "usage_count": number;
          "variants": Array<{
            "variant_key": string;
            "mime_type": string;
            "byte_size": number;
            "width"?: number;
            "height"?: number;
          }>;
        };
    "MediaUploadInput": {
          "file": Blob;
          "alt_text"?: string;
          "caption"?: string;
          "credit"?: string;
          "title"?: string;
          "source_url"?: string;
        };
    "MediaUpdateInput": {
          "alt_text"?: string;
          "caption"?: string;
          "credit"?: string;
          "title"?: string;
          "source_url"?: string;
        };
    "MediaResponse": {
          "media": components["schemas"]["MediaResource"];
        };
    "MediaListResponse": {
          "items": Array<components["schemas"]["MediaResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "MediaUsageItem": {
          "resource_type": "POST" | "AUTHOR" | "SITE_SETTING" | "HOMEPAGE" | "NAVIGATION";
          "resource_id": string;
          "label": string;
        };
    "MediaUsageResponse": {
          "items": Array<components["schemas"]["MediaUsageItem"]>;
        };
    "AdminNavDestination": {
          "kind": "HOME" | "ARTICLE" | "CATEGORY" | "TAG" | "AUTHOR" | "SEARCH" | "STATIC" | "EXTERNAL";
          "target_id"?: string;
          "url"?: string;
          "static_page_key"?: "ABOUT" | "CONTACT" | "PRIVACY" | "TERMS" | "DISCLAIMER";
        };
    "AdminNavItem": {
          "label": string;
          "destination": components["schemas"]["AdminNavDestination"];
          "children": Array<components["schemas"]["AdminNavItem"]>;
        };
    "NavigationMenuInput": {
          "items": Array<components["schemas"]["AdminNavItem"]>;
        };
    "NavigationAdminResponse": {
          "header": components["schemas"]["NavigationMenuInput"];
          "footer": components["schemas"]["NavigationMenuInput"];
        };
    "HomepageSectionAdmin": {
          "section_key": string;
          "section_kind": "POST_SELECTION" | "CATEGORY_SELECTION" | "TOGGLE_ONLY";
          "enabled": boolean;
          "display_label"?: string;
          "post_ids"?: Array<string>;
          "category_ids"?: Array<string>;
        };
    "HomepageInput": {
          "lead_post_id"?: string;
          "sections": Array<components["schemas"]["HomepageSectionAdmin"]>;
        };
    "HomepageAdminResponse": {
          "homepage": components["schemas"]["HomepageInput"];
        };
    "SiteSeoInput": {
          "seo_title"?: string;
          "meta_description"?: string;
          "index_policy"?: "INHERIT" | "INDEX" | "NOINDEX";
          "link_robots_policy"?: "INHERIT" | "FOLLOW" | "NOFOLLOW";
          "default_social_image_media_id"?: string;
          "structured_data_inputs"?: (Record<string, unknown>) & Record<string, (Record<string, unknown>) & Record<string, (string | number | boolean | Array<(string | number | boolean)>)>>;
        };
    "SiteSeoResponse": {
          "seo": components["schemas"]["SiteSeoInput"];
        };
    "RedirectResource": {
          "redirect_id": string;
          "source_path": string;
          "destination_url": string;
          "status_code": 301 | 302;
          "is_active": boolean;
          "created_at": string;
          "updated_at": string;
        };
    "RedirectInput": {
          "source_path": string;
          "destination_url": string;
          "status_code": 301 | 302;
          "is_active"?: boolean;
        };
    "RedirectUpdateInput": {
          "source_path"?: string;
          "destination_url"?: string;
          "status_code"?: 301 | 302;
          "is_active"?: boolean;
        };
    "RedirectResponse": {
          "redirect": components["schemas"]["RedirectResource"];
        };
    "RedirectListResponse": {
          "items": Array<components["schemas"]["RedirectResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "AdminSearchHit": {
          "post_id": string;
          "title": string;
          "status": "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
          "updated_at": string;
        };
    "AdminSearchResponse": {
          "items": Array<components["schemas"]["AdminSearchHit"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "InternalLinkCandidate": {
          "kind": "ARTICLE" | "CATEGORY" | "TAG" | "AUTHOR" | "STATIC";
          "label": string;
          "destination_url": string;
          "resource_id"?: string;
          "static_page_key"?: "ABOUT" | "CONTACT" | "PRIVACY" | "TERMS" | "DISCLAIMER";
        };
    "InternalLinkSearchResponse": {
          "items": Array<components["schemas"]["InternalLinkCandidate"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "RelatedCandidateResponse": {
          "items": Array<components["schemas"]["AdminSearchHit"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "SearchStatusResponse": {
          "state": "READY" | "REINDEXING" | "DEGRADED";
          "last_indexed_at"?: string;
          "message"?: string;
        };
    "CalendarItem": {
          "post_id": string;
          "title": string;
          "status": "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
          "scheduled_for"?: string;
          "published_at"?: string;
        };
    "CalendarResponse": {
          "items": Array<components["schemas"]["CalendarItem"]>;
          "from": string;
          "to": string;
        };
    "SettingEntry": {
          "key": string;
          "value": components["schemas"]["SettingJsonValue"];
        };
    "SiteSettingEntry": ({
          "key": "presentation_config";
          "value": components["schemas"]["PresentationConfig"];
        } | {
          "key": "static_pages";
          "value": components["schemas"]["StaticPages"];
        } | {
          "key": "display_name" | "locale_code" | "default_language_code" | "timezone_id" | "logo_media_id" | "favicon_media_id" | "default_social_image_media_id" | "copyright_text" | "contact_info" | "social_profiles" | "seo_defaults" | "analytics_verification";
          "value": components["schemas"]["SettingJsonValue"];
        });
    "SiteSettingsInput": {
          "settings": Array<components["schemas"]["SiteSettingEntry"]>;
        };
    "SiteSettingsResponse": {
          "settings": Array<components["schemas"]["SiteSettingEntry"]>;
        };
    "PlatformSettingsInput": {
          "settings": Array<components["schemas"]["SettingEntry"]>;
        };
    "PlatformSettingsResponse": {
          "settings": Array<components["schemas"]["SettingEntry"]>;
        };
    "SiteAdminResource": {
          "site_key": string;
          "display_name": string;
          "lifecycle_state": "ACTIVE" | "DISABLED" | "ARCHIVED" | "DELETION_REQUESTED";
          "canonical_domain"?: string;
          "default_language"?: string;
          "locale_code"?: string;
          "timezone_id": string;
          "created_at": string;
          "updated_at": string;
        };
    "SiteCreateInput": {
          "site_key": string;
          "display_name": string;
          "default_language"?: string;
          "locale_code"?: string;
          "timezone_id": string;
        };
    "CreateWebsiteInput": {
          "site_key": string;
          "display_name": string;
          "default_language"?: string;
          "locale_code"?: string;
          "timezone_id": string;
          "presentation": components["schemas"]["PresentationConfig"];
          "static_pages": components["schemas"]["StaticPages"];
        };
    "WebsiteReadiness": {
          "overall_ready": boolean;
          "settings_ready": boolean;
          "navigation_ready": boolean;
          "homepage_ready": boolean;
          "temporary_domain_ready": boolean;
          "missing_components": Array<"SETTINGS" | "NAVIGATION" | "HOMEPAGE" | "TEMPORARY_DOMAIN">;
        };
    "CreateWebsiteResponse": {
          "site": components["schemas"]["SiteAdminResource"];
          "temporary_hostname": string;
          "temporary_site_url"?: components["schemas"]["TemporarySiteUrl"];
          "readiness": components["schemas"]["WebsiteReadiness"];
        };
    "SiteUpdateInput": {
          "display_name"?: string;
          "default_language"?: string;
          "locale_code"?: string;
          "timezone_id"?: string;
        };
    "SiteAdminResponse": {
          "site": components["schemas"]["SiteAdminResource"];
        };
    "SiteListResponse": {
          "items": Array<components["schemas"]["SiteAdminResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "SiteDeletionRequestInput": {
          "reason": string;
          "confirmation_text": string;
        };
    "SiteDeletionRequestResponse": {
          "request_id": string;
          "site_key": string;
          "state": "REQUESTED" | "CANCELLED" | "APPROVED" | "COMPLETED" | "REJECTED";
          "created_at": string;
        };
    "DomainResource": {
          "domain_id": string;
          "hostname": string;
          "is_canonical": boolean;
          "is_active": boolean;
          "created_at": string;
          "updated_at": string;
        };
    "DomainInput": {
          "hostname": string;
          "is_canonical"?: boolean;
          "is_active"?: boolean;
        };
    "DomainUpdateInput": {
          "is_active"?: boolean;
        };
    "DomainResponse": {
          "domain": components["schemas"]["DomainResource"];
        };
    "DomainListResponse": {
          "items": Array<components["schemas"]["DomainResource"]>;
        };
    "RoleAssignment": (unknown & unknown) & ({
          "role_id": string;
          "scope": "GLOBAL" | "SITE";
          "site_key"?: string;
        });
    "AdminUserResource": {
          "admin_user_id": string;
          "email": string;
          "display_name"?: string;
          "state": "INVITED" | "ACTIVE" | "DISABLED";
          "site_assignments": Array<string>;
          "role_assignments": Array<components["schemas"]["RoleAssignment"]>;
          "created_at": string;
          "updated_at": string;
        };
    "AdminUserCreateInput": {
          "email": string;
          "display_name": string;
          "password": string;
          "site_assignments": Array<string>;
          "role_assignments": Array<components["schemas"]["RoleAssignment"]>;
        };
    "AdminUserUpdateInput": {
          "display_name"?: string;
          "email"?: string;
          "site_assignments"?: Array<string>;
          "role_assignments"?: Array<components["schemas"]["RoleAssignment"]>;
        };
    "SiteAssignmentInput": {
          "site_keys": Array<string>;
        };
    "RoleAssignmentInput": {
          "assignments": Array<components["schemas"]["RoleAssignment"]>;
        };
    "AdminUserResponse": {
          "admin_user": components["schemas"]["AdminUserResource"];
        };
    "AdminUserListResponse": {
          "items": Array<components["schemas"]["AdminUserResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "RoleResource": {
          "role_id": string;
          "name": string;
          "description"?: string;
          "scope": "SITE" | "GLOBAL";
          "permission_keys": Array<"dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit" | "network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view">;
          "state": "ACTIVE" | "RETIRED";
          "created_at": string;
          "updated_at": string;
        };
    "RoleInput": {
          "name": string;
          "description"?: string;
          "scope": "SITE" | "GLOBAL";
          "permission_keys": Array<"dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit" | "network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view">;
        };
    "RoleUpdateInput": {
          "name"?: string;
          "description"?: string;
          "permission_keys"?: Array<"dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit" | "network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view">;
        };
    "RoleDuplicateInput": {
          "name": string;
        };
    "RoleResponse": {
          "role": components["schemas"]["RoleResource"];
        };
    "RoleListResponse": {
          "items": Array<components["schemas"]["RoleResource"]>;
        };
    "PermissionEntry": {
          "permission_key": "dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit" | "network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view";
          "scope": "SITE" | "GLOBAL";
          "description": string;
          "prerequisite_keys": Array<"dashboard.view" | "posts.view" | "posts.create" | "posts.edit" | "posts.preview" | "posts.duplicate" | "posts.revisions.view" | "posts.revisions.restore" | "posts.publish" | "posts.schedule" | "posts.archive" | "posts.trash" | "posts.restore" | "posts.delete" | "categories.view" | "categories.create" | "categories.edit" | "categories.delete" | "tags.view" | "tags.create" | "tags.edit" | "tags.delete" | "authors.view" | "authors.create" | "authors.edit" | "authors.retire" | "media.view" | "media.upload" | "media.edit" | "media.replace" | "media.delete" | "navigation.view" | "navigation.manage" | "seo.view" | "seo.edit" | "redirects.view" | "redirects.create" | "redirects.edit" | "redirects.delete" | "search.view" | "search.reindex" | "calendar.view" | "site_settings.view" | "site_settings.edit" | "network_dashboard.view" | "sites.view" | "sites.create" | "sites.edit" | "sites.enable" | "sites.disable" | "sites.archive" | "sites.deletion_request" | "sites.manage_domains" | "admin_users.view" | "admin_users.invite" | "admin_users.edit" | "admin_users.enable" | "admin_users.disable" | "admin_users.manage_site_assignments" | "roles.view" | "roles.create" | "roles.edit" | "roles.retire" | "roles.assign" | "audit.view" | "audit.export" | "platform_settings.view" | "platform_settings.edit" | "permissions.view">;
        };
    "PermissionRegistryResponse": {
          "items": Array<components["schemas"]["PermissionEntry"]>;
          "count": 69;
        };
    "NetworkDashboardResponse": {
          "site_count": number;
          "aggregates": Array<components["schemas"]["DashboardMetric"]>;
          "site_summaries": Array<{
            "site_key": string;
            "display_name": string;
            "lifecycle_state": string;
            "counts": Array<components["schemas"]["DashboardMetric"]>;
          }>;
        };
    "NetworkPostItem": {
          "site_key": string;
          "site_display_name": string;
          "post": components["schemas"]["PostResource"];
        };
    "NetworkPostListResponse": {
          "items": Array<components["schemas"]["NetworkPostItem"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "AuditResource": {
          "audit_id": string;
          "occurred_at": string;
          "actor_admin_user_id"?: string;
          "scope": "SITE" | "GLOBAL";
          "site_key"?: string;
          "event_type": string;
          "resource_type"?: string;
          "resource_id"?: string;
          "summary": string;
          "request_id": string;
        };
    "AuditResponse": {
          "audit": components["schemas"]["AuditResource"];
        };
    "AuditListResponse": {
          "items": Array<components["schemas"]["AuditResource"]>;
          "page": components["schemas"]["PageRequestMeta"];
        };
    "AuditExportInput": {
          "actor_id"?: string;
          "site_key"?: string;
          "event_type"?: string;
          "from"?: string;
          "to"?: string;
          "format": "CSV" | "JSON";
        };
    "LoginInput": {
          "email": string;
          "password": string;
        };
    "LoginResponse": {
          "state": "AUTHENTICATED" | "MFA_REQUIRED";
          "display_name"?: string;
          "session_expires_at"?: string;
          "mfa_challenge_id"?: string;
          "challenge_expires_at"?: string;
        };
    "InvitationAcceptanceInput": {
          "invite_token": string;
        };
    "InvitationAcceptanceResponse": {
          "accepted": boolean;
          "next_step": string;
          "expires_at": string;
        };
    "InvitationPasswordSetupInput": {
          "mode": "INVITATION";
          "invite_token": string;
          "new_password": string;
        };
    "AuthenticatedPasswordChangeInput": {
          "mode": "AUTHENTICATED";
          "current_password": string;
          "new_password": string;
        };
    "PasswordSetupInput": (components["schemas"]["InvitationPasswordSetupInput"] | components["schemas"]["AuthenticatedPasswordChangeInput"]);
    "PasswordSetupResponse": {
          "completed": boolean;
          "next_step": string;
        };
    "PasswordResetRequestInput": {
          "email": string;
        };
    "PasswordResetCompleteInput": {
          "reset_token": string;
          "new_password": string;
        };
    "MfaEnrollmentInput": {
          "mode": string;
          "current_password"?: string;
          "invite_token"?: string;
        };
    "MfaEnrollmentResponse": {
          "enrollment_id": string;
          "secret_base32": string;
          "provisioning_uri": string;
          "expires_at": string;
        };
    "MfaVerificationInput": {
          "challenge_id": string;
          "code": string;
        };
    "MfaVerificationResponse": {
          "result": string;
          "session_expires_at"?: string;
          "step_up_expires_at"?: string;
          "recovery_codes"?: Array<string>;
        };
    "MfaRecoveryInput": {
          "challenge_id": string;
          "recovery_code": string;
        };
    "SessionTerminationInput": {
          "scope": "CURRENT_SESSION" | "ALL_SESSIONS";
        };
    "StepUpFactor": {
          "kind": "TOTP" | "RECOVERY";
          "value": string;
        };
    "StepUpInput": {
          "level": "L1" | "L2";
          "current_password": string;
          "factor"?: components["schemas"]["StepUpFactor"];
        };
    "StepUpResponse": {
          "level": "L1" | "L2";
          "expires_at": string;
        };
    "SettingJsonScalar": (string | number | boolean | null);
    "SettingJsonValue": (components["schemas"]["SettingJsonScalar"] | Array<components["schemas"]["SettingJsonScalar"]> | (Record<string, unknown>) & Record<string, (components["schemas"]["SettingJsonScalar"] | Array<components["schemas"]["SettingJsonScalar"]>)>);
    "SelectableSiteResource": {
          "site_key": string;
          "display_name": string;
          "lifecycle_state": string;
        };
    "SelectableSitesResponse": {
          "items": Array<components["schemas"]["SelectableSiteResource"]>;
        };
  };
}

export interface operations {
  "API15-AUTH-001": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["LoginInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["LoginResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-002": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-003": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["InvitationAcceptanceInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["InvitationAcceptanceResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-004": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PasswordSetupInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PasswordSetupResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-005": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PasswordResetRequestInput"];
        };
      };
      responses: {
          202: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AcceptedCommand"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-006": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PasswordResetCompleteInput"];
        };
      };
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-007": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["MfaEnrollmentInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MfaEnrollmentResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-008": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["MfaVerificationInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MfaVerificationResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-009": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["MfaRecoveryInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MfaVerificationResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-010": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SessionTerminationInput"];
        };
      };
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-011": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["StepUpInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["StepUpResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-AUTH-012": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SelectableSitesResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-001": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminGlobalContext"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-002": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["NetworkDashboardResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-003": {
      parameters: {
          query: {
            "site_key"?: string;
            "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
            "search"?: string;
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["NetworkPostListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-010": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-011": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["CreateWebsiteInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CreateWebsiteResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-012": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-013": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SiteUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-014": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-015": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-016": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-017": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SiteDeletionRequestInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteDeletionRequestResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-018": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["DomainListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-019": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["DomainInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["DomainResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-020": {
      parameters: {
          path: {
            "site_key": string;
            "domain_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["DomainUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["DomainResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-021": {
      parameters: {
          path: {
            "site_key": string;
            "domain_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-022": {
      parameters: {
          path: {
            "site_key": string;
            "domain_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["DomainResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-030": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-031": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AdminUserCreateInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-032": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-033": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AdminUserUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-034": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-035": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-036": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SiteAssignmentInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-037": {
      parameters: {
          path: {
            "admin_user_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RoleAssignmentInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminUserResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-040": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-041": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RoleInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-042": {
      parameters: {
          path: {
            "role_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-043": {
      parameters: {
          path: {
            "role_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RoleUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-044": {
      parameters: {
          path: {
            "role_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-045": {
      parameters: {
          path: {
            "role_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RoleDuplicateInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RoleResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-046": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PermissionRegistryResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-050": {
      parameters: {
          query: {
            "actor_id"?: string;
            "site_key"?: string;
            "event_type"?: string;
            "from"?: string;
            "to"?: string;
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuditListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-051": {
      parameters: {
          path: {
            "audit_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuditResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-052": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AuditExportInput"];
        };
      };
      responses: {
          202: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AcceptedCommand"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-060": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PlatformSettingsResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-G-061": {
      parameters: {
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PlatformSettingsInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PlatformSettingsResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-PUB-001": {
      parameters: {
          query: {
            "path": string;
            "q"?: string;
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["PublicPageResponse"];
            };
          };
          301: {
            headers: {
              "Location": string;
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: Record<string, never>;
          };
          302: {
            headers: {
              "Location": string;
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: Record<string, never>;
          };
          308: {
            headers: {
              "Location": string;
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: Record<string, never>;
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["NotFoundPageData"];
            };
          };
          410: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["GonePageData"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-PUB-002": {
      parameters: {
          path: {
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PreviewPageData"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-001": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminSiteContext"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-002": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["DashboardResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-010": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
            "search"?: string;
            "author_id"?: string;
            "category_id"?: string;
            "tag_id"?: string;
            "page"?: number;
            "page_size"?: number;
            "sort"?: string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-011": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PostCreateInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-012": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-013": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PostUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-014": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AutosaveInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AutosaveResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-015": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          query: {
            "editor_instance_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AutosaveResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-016": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["PreviewHandoffInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PreviewHandoffResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-017": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SchedulePostInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-018": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-019": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-020": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-021": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-022": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-023": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["VersionCommandInput"];
        };
      };
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-024": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["DuplicatePostInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-025": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["BulkPostInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["BulkPostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-026": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          query: {
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RevisionListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-027": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
            "revision_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RestoreRevisionInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["PostResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-028": {
      parameters: {
          path: {
            "site_key": string;
            "post_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["UrlHistoryResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-030": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CategoryListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-031": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["CategoryInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CategoryResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-032": {
      parameters: {
          path: {
            "site_key": string;
            "category_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CategoryResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-033": {
      parameters: {
          path: {
            "site_key": string;
            "category_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["CategoryUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CategoryResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-034": {
      parameters: {
          path: {
            "site_key": string;
            "category_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-040": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["TagListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-041": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["TagInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["TagResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-042": {
      parameters: {
          path: {
            "site_key": string;
            "tag_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["TagResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-043": {
      parameters: {
          path: {
            "site_key": string;
            "tag_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["TagUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["TagResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-044": {
      parameters: {
          path: {
            "site_key": string;
            "tag_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-045": {
      parameters: {
          path: {
            "site_key": string;
            "tag_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["TagMergeInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["TagResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-050": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuthorListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-051": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AuthorInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuthorResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-052": {
      parameters: {
          path: {
            "site_key": string;
            "author_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuthorResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-053": {
      parameters: {
          path: {
            "site_key": string;
            "author_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["AuthorUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuthorResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-054": {
      parameters: {
          path: {
            "site_key": string;
            "author_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AuthorResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-060": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "search"?: string;
            "mime_type"?: string;
            "usage"?: "ALL" | "USED" | "UNUSED";
            "page"?: number;
            "page_size"?: number;
            "sort"?: "CREATED_DESC" | "CREATED_ASC" | "UPDATED_DESC" | "UPDATED_ASC" | "TITLE_ASC" | "TITLE_DESC" | "FILENAME_ASC" | "FILENAME_DESC";
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-061": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "multipart/form-data": components["schemas"]["MediaUploadInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-062": {
      parameters: {
          path: {
            "site_key": string;
            "media_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-063": {
      parameters: {
          path: {
            "site_key": string;
            "media_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["MediaUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-064": {
      parameters: {
          path: {
            "site_key": string;
            "media_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "multipart/form-data": components["schemas"]["MediaUploadInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-065": {
      parameters: {
          path: {
            "site_key": string;
            "media_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-066": {
      parameters: {
          path: {
            "site_key": string;
            "media_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["MediaUsageResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-070": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["NavigationAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-071": {
      parameters: {
          path: {
            "site_key": string;
            "menu_key": "HEADER" | "FOOTER";
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["NavigationMenuInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["NavigationAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-072": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["HomepageAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-073": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["HomepageInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["HomepageAdminResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-080": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteSeoResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-081": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SiteSeoInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteSeoResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-082": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RedirectListResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-083": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RedirectInput"];
        };
      };
      responses: {
          201: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RedirectResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-084": {
      parameters: {
          path: {
            "site_key": string;
            "redirect_id": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RedirectResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-085": {
      parameters: {
          path: {
            "site_key": string;
            "redirect_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["RedirectUpdateInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RedirectResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-086": {
      parameters: {
          path: {
            "site_key": string;
            "redirect_id": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: never;
      responses: {
          204: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: Record<string, never>;
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-090": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "q"?: string;
            "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AdminSearchResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-091": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "q"?: string;
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["InternalLinkSearchResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-092": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "post_id"?: string;
            "q"?: string;
            "page"?: number;
            "page_size"?: number;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["RelatedCandidateResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-093": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SearchStatusResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-094": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SimpleCommandInput"];
        };
      };
      responses: {
          202: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["AcceptedCommand"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-095": {
      parameters: {
          path: {
            "site_key": string;
          };
          query: {
            "from"?: string;
            "to"?: string;
            "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["CalendarResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-096": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
          };
        };
      requestBody: never;
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteSettingsResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
  "API15-S-097": {
      parameters: {
          path: {
            "site_key": string;
          };
          header: {
            "X-Request-ID"?: string;
            "Idempotency-Key": string;
          };
        };
      requestBody: {
        content: {
          "application/json": components["schemas"]["SiteSettingsInput"];
        };
      };
      responses: {
          200: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Cache-Control"?: "no-store";
            };
            content: {
              "application/json": components["schemas"]["SiteSettingsResponse"];
            };
          };
          400: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          401: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          403: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          404: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          409: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          422: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          429: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
              "Retry-After"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
          503: {
            headers: {
              "X-Request-ID"?: string;
              "RateLimit-Limit"?: number;
              "RateLimit-Remaining"?: number;
              "RateLimit-Reset"?: number;
            };
            content: {
              "application/json": components["schemas"]["ApiError"];
            };
          };
        };
    };
}

export interface paths {
  "/api/v1/public/page": {
    get: operations["API15-PUB-001"];
  };
  "/api/v1/public/preview/posts/{post_id}": {
    get: operations["API15-PUB-002"];
  };
  "/api/v1/auth/login": {
    post: operations["API15-AUTH-001"];
  };
  "/api/v1/auth/logout": {
    post: operations["API15-AUTH-002"];
  };
  "/api/v1/auth/invitations/accept": {
    post: operations["API15-AUTH-003"];
  };
  "/api/v1/auth/password/setup": {
    post: operations["API15-AUTH-004"];
  };
  "/api/v1/auth/password-reset/request": {
    post: operations["API15-AUTH-005"];
  };
  "/api/v1/auth/password-reset/complete": {
    post: operations["API15-AUTH-006"];
  };
  "/api/v1/auth/mfa/enrollment": {
    post: operations["API15-AUTH-007"];
  };
  "/api/v1/auth/mfa/verify": {
    post: operations["API15-AUTH-008"];
  };
  "/api/v1/auth/mfa/recovery": {
    post: operations["API15-AUTH-009"];
  };
  "/api/v1/auth/sessions/terminate": {
    post: operations["API15-AUTH-010"];
  };
  "/api/v1/auth/step-up": {
    post: operations["API15-AUTH-011"];
  };
  "/api/v1/admin/sites/{site_key}/context": {
    get: operations["API15-S-001"];
  };
  "/api/v1/admin/sites/{site_key}/dashboard": {
    get: operations["API15-S-002"];
  };
  "/api/v1/admin/sites/{site_key}/posts": {
    get: operations["API15-S-010"];
    post: operations["API15-S-011"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}": {
    get: operations["API15-S-012"];
    patch: operations["API15-S-013"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves": {
    post: operations["API15-S-014"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves/latest": {
    get: operations["API15-S-015"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/preview-handoff": {
    post: operations["API15-S-016"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/schedule": {
    post: operations["API15-S-017"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/unschedule": {
    post: operations["API15-S-018"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/publish": {
    post: operations["API15-S-019"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/archive": {
    post: operations["API15-S-020"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/trash": {
    post: operations["API15-S-021"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/restore": {
    post: operations["API15-S-022"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/permanent-delete": {
    post: operations["API15-S-023"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/duplicate": {
    post: operations["API15-S-024"];
  };
  "/api/v1/admin/sites/{site_key}/posts/bulk": {
    post: operations["API15-S-025"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions": {
    get: operations["API15-S-026"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions/{revision_id}/restore": {
    post: operations["API15-S-027"];
  };
  "/api/v1/admin/sites/{site_key}/posts/{post_id}/url-history": {
    get: operations["API15-S-028"];
  };
  "/api/v1/admin/sites/{site_key}/categories": {
    get: operations["API15-S-030"];
    post: operations["API15-S-031"];
  };
  "/api/v1/admin/sites/{site_key}/categories/{category_id}": {
    get: operations["API15-S-032"];
    patch: operations["API15-S-033"];
    delete: operations["API15-S-034"];
  };
  "/api/v1/admin/sites/{site_key}/tags": {
    get: operations["API15-S-040"];
    post: operations["API15-S-041"];
  };
  "/api/v1/admin/sites/{site_key}/tags/{tag_id}": {
    get: operations["API15-S-042"];
    patch: operations["API15-S-043"];
    delete: operations["API15-S-044"];
  };
  "/api/v1/admin/sites/{site_key}/tags/{tag_id}/merge": {
    post: operations["API15-S-045"];
  };
  "/api/v1/admin/sites/{site_key}/authors": {
    get: operations["API15-S-050"];
    post: operations["API15-S-051"];
  };
  "/api/v1/admin/sites/{site_key}/authors/{author_id}": {
    get: operations["API15-S-052"];
    patch: operations["API15-S-053"];
  };
  "/api/v1/admin/sites/{site_key}/authors/{author_id}/retire": {
    post: operations["API15-S-054"];
  };
  "/api/v1/admin/sites/{site_key}/media": {
    get: operations["API15-S-060"];
    post: operations["API15-S-061"];
  };
  "/api/v1/admin/sites/{site_key}/media/{media_id}": {
    get: operations["API15-S-062"];
    patch: operations["API15-S-063"];
    delete: operations["API15-S-065"];
  };
  "/api/v1/admin/sites/{site_key}/media/{media_id}/replace": {
    post: operations["API15-S-064"];
  };
  "/api/v1/admin/sites/{site_key}/media/{media_id}/usage": {
    get: operations["API15-S-066"];
  };
  "/api/v1/admin/sites/{site_key}/navigation/menus": {
    get: operations["API15-S-070"];
  };
  "/api/v1/admin/sites/{site_key}/navigation/menus/{menu_key}": {
    put: operations["API15-S-071"];
  };
  "/api/v1/admin/sites/{site_key}/homepage": {
    get: operations["API15-S-072"];
    put: operations["API15-S-073"];
  };
  "/api/v1/admin/sites/{site_key}/seo": {
    get: operations["API15-S-080"];
    patch: operations["API15-S-081"];
  };
  "/api/v1/admin/sites/{site_key}/redirects": {
    get: operations["API15-S-082"];
    post: operations["API15-S-083"];
  };
  "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}": {
    get: operations["API15-S-084"];
    patch: operations["API15-S-085"];
    delete: operations["API15-S-086"];
  };
  "/api/v1/admin/sites/{site_key}/search/posts": {
    get: operations["API15-S-090"];
  };
  "/api/v1/admin/sites/{site_key}/search/internal-links": {
    get: operations["API15-S-091"];
  };
  "/api/v1/admin/sites/{site_key}/search/related-posts": {
    get: operations["API15-S-092"];
  };
  "/api/v1/admin/sites/{site_key}/search/status": {
    get: operations["API15-S-093"];
  };
  "/api/v1/admin/sites/{site_key}/search/reindex": {
    post: operations["API15-S-094"];
  };
  "/api/v1/admin/sites/{site_key}/calendar": {
    get: operations["API15-S-095"];
  };
  "/api/v1/admin/sites/{site_key}/settings": {
    get: operations["API15-S-096"];
    patch: operations["API15-S-097"];
  };
  "/api/v1/admin/context": {
    get: operations["API15-G-001"];
  };
  "/api/v1/admin/network/dashboard": {
    get: operations["API15-G-002"];
  };
  "/api/v1/admin/network/posts": {
    get: operations["API15-G-003"];
  };
  "/api/v1/admin/sites": {
    get: operations["API15-G-010"];
    post: operations["API15-G-011"];
  };
  "/api/v1/admin/sites/{site_key}": {
    get: operations["API15-G-012"];
    patch: operations["API15-G-013"];
  };
  "/api/v1/admin/sites/{site_key}/enable": {
    post: operations["API15-G-014"];
  };
  "/api/v1/admin/sites/{site_key}/disable": {
    post: operations["API15-G-015"];
  };
  "/api/v1/admin/sites/{site_key}/archive": {
    post: operations["API15-G-016"];
  };
  "/api/v1/admin/sites/{site_key}/deletion-requests": {
    post: operations["API15-G-017"];
  };
  "/api/v1/admin/sites/{site_key}/domains": {
    get: operations["API15-G-018"];
    post: operations["API15-G-019"];
  };
  "/api/v1/admin/sites/{site_key}/domains/{domain_id}": {
    patch: operations["API15-G-020"];
    delete: operations["API15-G-021"];
  };
  "/api/v1/admin/sites/{site_key}/domains/{domain_id}/make-canonical": {
    post: operations["API15-G-022"];
  };
  "/api/v1/admin/admin-users": {
    get: operations["API15-G-030"];
  };
  "/api/v1/admin/admin-users/create": {
    post: operations["API15-G-031"];
  };
  "/api/v1/admin/admin-users/{admin_user_id}": {
    get: operations["API15-G-032"];
    patch: operations["API15-G-033"];
  };
  "/api/v1/admin/admin-users/{admin_user_id}/enable": {
    post: operations["API15-G-034"];
  };
  "/api/v1/admin/admin-users/{admin_user_id}/disable": {
    post: operations["API15-G-035"];
  };
  "/api/v1/admin/admin-users/{admin_user_id}/site-assignments": {
    put: operations["API15-G-036"];
  };
  "/api/v1/admin/admin-users/{admin_user_id}/role-assignments": {
    put: operations["API15-G-037"];
  };
  "/api/v1/admin/roles": {
    get: operations["API15-G-040"];
    post: operations["API15-G-041"];
  };
  "/api/v1/admin/roles/{role_id}": {
    get: operations["API15-G-042"];
    patch: operations["API15-G-043"];
  };
  "/api/v1/admin/roles/{role_id}/retire": {
    post: operations["API15-G-044"];
  };
  "/api/v1/admin/roles/{role_id}/duplicate": {
    post: operations["API15-G-045"];
  };
  "/api/v1/admin/permissions": {
    get: operations["API15-G-046"];
  };
  "/api/v1/admin/audit": {
    get: operations["API15-G-050"];
  };
  "/api/v1/admin/audit/{audit_id}": {
    get: operations["API15-G-051"];
  };
  "/api/v1/admin/audit/export": {
    post: operations["API15-G-052"];
  };
  "/api/v1/admin/platform-settings": {
    get: operations["API15-G-060"];
    patch: operations["API15-G-061"];
  };
  "/api/v1/auth/selectable-sites": {
    get: operations["API15-AUTH-012"];
  };
}

export interface OperationRequestMap {
  "API15-AUTH-001": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["LoginInput"];
    };
  "API15-AUTH-002": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-AUTH-003": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["InvitationAcceptanceInput"];
    };
  "API15-AUTH-004": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["PasswordSetupInput"];
    };
  "API15-AUTH-005": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["PasswordResetRequestInput"];
    };
  "API15-AUTH-006": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["PasswordResetCompleteInput"];
    };
  "API15-AUTH-007": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["MfaEnrollmentInput"];
    };
  "API15-AUTH-008": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["MfaVerificationInput"];
    };
  "API15-AUTH-009": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["MfaRecoveryInput"];
    };
  "API15-AUTH-010": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["SessionTerminationInput"];
    };
  "API15-AUTH-011": {
      header?: {
        "X-Request-ID"?: string;
      };
      body: components["schemas"]["StepUpInput"];
    };
  "API15-AUTH-012": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-001": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-002": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-003": {
      query?: {
        "site_key"?: string;
        "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
        "search"?: string;
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-010": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-011": {
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["CreateWebsiteInput"];
    };
  "API15-G-012": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-013": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SiteUpdateInput"];
    };
  "API15-G-014": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-015": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-016": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-017": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SiteDeletionRequestInput"];
    };
  "API15-G-018": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-019": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["DomainInput"];
    };
  "API15-G-020": {
      path: {
        "site_key": string;
        "domain_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["DomainUpdateInput"];
    };
  "API15-G-021": {
      path: {
        "site_key": string;
        "domain_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
    };
  "API15-G-022": {
      path: {
        "site_key": string;
        "domain_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-030": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-031": {
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AdminUserCreateInput"];
    };
  "API15-G-032": {
      path: {
        "admin_user_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-033": {
      path: {
        "admin_user_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AdminUserUpdateInput"];
    };
  "API15-G-034": {
      path: {
        "admin_user_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-035": {
      path: {
        "admin_user_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-036": {
      path: {
        "admin_user_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SiteAssignmentInput"];
    };
  "API15-G-037": {
      path: {
        "admin_user_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RoleAssignmentInput"];
    };
  "API15-G-040": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-041": {
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RoleInput"];
    };
  "API15-G-042": {
      path: {
        "role_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-043": {
      path: {
        "role_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RoleUpdateInput"];
    };
  "API15-G-044": {
      path: {
        "role_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-G-045": {
      path: {
        "role_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RoleDuplicateInput"];
    };
  "API15-G-046": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-050": {
      query?: {
        "actor_id"?: string;
        "site_key"?: string;
        "event_type"?: string;
        "from"?: string;
        "to"?: string;
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-051": {
      path: {
        "audit_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-052": {
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AuditExportInput"];
    };
  "API15-G-060": {
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-G-061": {
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["PlatformSettingsInput"];
    };
  "API15-PUB-001": {
      query: {
        "path": string;
        "q"?: string;
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-PUB-002": {
      path: {
        "post_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-001": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-002": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-010": {
      path: {
        "site_key": string;
      };
      query?: {
        "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
        "search"?: string;
        "author_id"?: string;
        "category_id"?: string;
        "tag_id"?: string;
        "page"?: number;
        "page_size"?: number;
        "sort"?: string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-011": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["PostCreateInput"];
    };
  "API15-S-012": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-013": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["PostUpdateInput"];
    };
  "API15-S-014": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AutosaveInput"];
    };
  "API15-S-015": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      query: {
        "editor_instance_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-016": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["PreviewHandoffInput"];
    };
  "API15-S-017": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SchedulePostInput"];
    };
  "API15-S-018": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-019": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-020": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-021": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-022": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-023": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["VersionCommandInput"];
    };
  "API15-S-024": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["DuplicatePostInput"];
    };
  "API15-S-025": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["BulkPostInput"];
    };
  "API15-S-026": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      query?: {
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-027": {
      path: {
        "site_key": string;
        "post_id": string;
        "revision_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RestoreRevisionInput"];
    };
  "API15-S-028": {
      path: {
        "site_key": string;
        "post_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-030": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-031": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["CategoryInput"];
    };
  "API15-S-032": {
      path: {
        "site_key": string;
        "category_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-033": {
      path: {
        "site_key": string;
        "category_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["CategoryUpdateInput"];
    };
  "API15-S-034": {
      path: {
        "site_key": string;
        "category_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
    };
  "API15-S-040": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-041": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["TagInput"];
    };
  "API15-S-042": {
      path: {
        "site_key": string;
        "tag_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-043": {
      path: {
        "site_key": string;
        "tag_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["TagUpdateInput"];
    };
  "API15-S-044": {
      path: {
        "site_key": string;
        "tag_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
    };
  "API15-S-045": {
      path: {
        "site_key": string;
        "tag_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["TagMergeInput"];
    };
  "API15-S-050": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-051": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AuthorInput"];
    };
  "API15-S-052": {
      path: {
        "site_key": string;
        "author_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-053": {
      path: {
        "site_key": string;
        "author_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["AuthorUpdateInput"];
    };
  "API15-S-054": {
      path: {
        "site_key": string;
        "author_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-S-060": {
      path: {
        "site_key": string;
      };
      query?: {
        "search"?: string;
        "mime_type"?: string;
        "usage"?: "ALL" | "USED" | "UNUSED";
        "page"?: number;
        "page_size"?: number;
        "sort"?: "CREATED_DESC" | "CREATED_ASC" | "UPDATED_DESC" | "UPDATED_ASC" | "TITLE_ASC" | "TITLE_DESC" | "FILENAME_ASC" | "FILENAME_DESC";
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-061": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["MediaUploadInput"];
    };
  "API15-S-062": {
      path: {
        "site_key": string;
        "media_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-063": {
      path: {
        "site_key": string;
        "media_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["MediaUpdateInput"];
    };
  "API15-S-064": {
      path: {
        "site_key": string;
        "media_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["MediaUploadInput"];
    };
  "API15-S-065": {
      path: {
        "site_key": string;
        "media_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
    };
  "API15-S-066": {
      path: {
        "site_key": string;
        "media_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-070": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-071": {
      path: {
        "site_key": string;
        "menu_key": "HEADER" | "FOOTER";
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["NavigationMenuInput"];
    };
  "API15-S-072": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-073": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["HomepageInput"];
    };
  "API15-S-080": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-081": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SiteSeoInput"];
    };
  "API15-S-082": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-083": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RedirectInput"];
    };
  "API15-S-084": {
      path: {
        "site_key": string;
        "redirect_id": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-085": {
      path: {
        "site_key": string;
        "redirect_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["RedirectUpdateInput"];
    };
  "API15-S-086": {
      path: {
        "site_key": string;
        "redirect_id": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
    };
  "API15-S-090": {
      path: {
        "site_key": string;
      };
      query?: {
        "q"?: string;
        "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-091": {
      path: {
        "site_key": string;
      };
      query?: {
        "q"?: string;
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-092": {
      path: {
        "site_key": string;
      };
      query?: {
        "post_id"?: string;
        "q"?: string;
        "page"?: number;
        "page_size"?: number;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-093": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-094": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SimpleCommandInput"];
    };
  "API15-S-095": {
      path: {
        "site_key": string;
      };
      query?: {
        "from"?: string;
        "to"?: string;
        "status"?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" | "TRASH";
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-096": {
      path: {
        "site_key": string;
      };
      header?: {
        "X-Request-ID"?: string;
      };
    };
  "API15-S-097": {
      path: {
        "site_key": string;
      };
      header: {
        "X-Request-ID"?: string;
        "Idempotency-Key": string;
      };
      body: components["schemas"]["SiteSettingsInput"];
    };
}

export interface OperationResponseMap {
  "API15-AUTH-001": { status: 200; data: components["schemas"]["LoginResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-002": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-003": { status: 200; data: components["schemas"]["InvitationAcceptanceResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-004": { status: 200; data: components["schemas"]["PasswordSetupResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-005": { status: 202; data: components["schemas"]["AcceptedCommand"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-006": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-007": { status: 200; data: components["schemas"]["MfaEnrollmentResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-008": { status: 200; data: components["schemas"]["MfaVerificationResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-009": { status: 200; data: components["schemas"]["MfaVerificationResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-010": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-011": { status: 200; data: components["schemas"]["StepUpResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-AUTH-012": { status: 200; data: components["schemas"]["SelectableSitesResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-001": { status: 200; data: components["schemas"]["AdminGlobalContext"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-002": { status: 200; data: components["schemas"]["NetworkDashboardResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-003": { status: 200; data: components["schemas"]["NetworkPostListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-010": { status: 200; data: components["schemas"]["SiteListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-011": { status: 201; data: components["schemas"]["CreateWebsiteResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-012": { status: 200; data: components["schemas"]["SiteAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-013": { status: 200; data: components["schemas"]["SiteAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-014": { status: 200; data: components["schemas"]["SiteAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-015": { status: 200; data: components["schemas"]["SiteAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-016": { status: 200; data: components["schemas"]["SiteAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-017": { status: 201; data: components["schemas"]["SiteDeletionRequestResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-018": { status: 200; data: components["schemas"]["DomainListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-019": { status: 201; data: components["schemas"]["DomainResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-020": { status: 200; data: components["schemas"]["DomainResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-021": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-022": { status: 200; data: components["schemas"]["DomainResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-030": { status: 200; data: components["schemas"]["AdminUserListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-031": { status: 201; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-032": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-033": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-034": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-035": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-036": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-037": { status: 200; data: components["schemas"]["AdminUserResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-040": { status: 200; data: components["schemas"]["RoleListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-041": { status: 201; data: components["schemas"]["RoleResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-042": { status: 200; data: components["schemas"]["RoleResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-043": { status: 200; data: components["schemas"]["RoleResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-044": { status: 200; data: components["schemas"]["RoleResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-045": { status: 201; data: components["schemas"]["RoleResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-046": { status: 200; data: components["schemas"]["PermissionRegistryResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-050": { status: 200; data: components["schemas"]["AuditListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-051": { status: 200; data: components["schemas"]["AuditResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-052": { status: 202; data: components["schemas"]["AcceptedCommand"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-060": { status: 200; data: components["schemas"]["PlatformSettingsResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-G-061": { status: 200; data: components["schemas"]["PlatformSettingsResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-PUB-001": { status: 200; data: components["schemas"]["PublicPageResponse"]; headers: Headers } | { status: 301; data: undefined; headers: Headers } | { status: 302; data: undefined; headers: Headers } | { status: 308; data: undefined; headers: Headers } | { status: 404; data: components["schemas"]["NotFoundPageData"]; headers: Headers } | { status: 410; data: components["schemas"]["GonePageData"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-PUB-002": { status: 200; data: components["schemas"]["PreviewPageData"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-001": { status: 200; data: components["schemas"]["AdminSiteContext"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-002": { status: 200; data: components["schemas"]["DashboardResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-010": { status: 200; data: components["schemas"]["PostListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-011": { status: 201; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-012": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-013": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-014": { status: 201; data: components["schemas"]["AutosaveResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-015": { status: 200; data: components["schemas"]["AutosaveResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-016": { status: 201; data: components["schemas"]["PreviewHandoffResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-017": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-018": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-019": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-020": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-021": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-022": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-023": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-024": { status: 201; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-025": { status: 200; data: components["schemas"]["BulkPostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-026": { status: 200; data: components["schemas"]["RevisionListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-027": { status: 200; data: components["schemas"]["PostResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-028": { status: 200; data: components["schemas"]["UrlHistoryResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-030": { status: 200; data: components["schemas"]["CategoryListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-031": { status: 201; data: components["schemas"]["CategoryResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-032": { status: 200; data: components["schemas"]["CategoryResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-033": { status: 200; data: components["schemas"]["CategoryResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-034": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-040": { status: 200; data: components["schemas"]["TagListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-041": { status: 201; data: components["schemas"]["TagResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-042": { status: 200; data: components["schemas"]["TagResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-043": { status: 200; data: components["schemas"]["TagResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-044": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-045": { status: 200; data: components["schemas"]["TagResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-050": { status: 200; data: components["schemas"]["AuthorListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-051": { status: 201; data: components["schemas"]["AuthorResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-052": { status: 200; data: components["schemas"]["AuthorResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-053": { status: 200; data: components["schemas"]["AuthorResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-054": { status: 200; data: components["schemas"]["AuthorResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-060": { status: 200; data: components["schemas"]["MediaListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-061": { status: 201; data: components["schemas"]["MediaResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-062": { status: 200; data: components["schemas"]["MediaResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-063": { status: 200; data: components["schemas"]["MediaResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-064": { status: 200; data: components["schemas"]["MediaResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-065": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-066": { status: 200; data: components["schemas"]["MediaUsageResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-070": { status: 200; data: components["schemas"]["NavigationAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-071": { status: 200; data: components["schemas"]["NavigationAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-072": { status: 200; data: components["schemas"]["HomepageAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-073": { status: 200; data: components["schemas"]["HomepageAdminResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-080": { status: 200; data: components["schemas"]["SiteSeoResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-081": { status: 200; data: components["schemas"]["SiteSeoResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-082": { status: 200; data: components["schemas"]["RedirectListResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-083": { status: 201; data: components["schemas"]["RedirectResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-084": { status: 200; data: components["schemas"]["RedirectResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-085": { status: 200; data: components["schemas"]["RedirectResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-086": { status: 204; data: undefined; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-090": { status: 200; data: components["schemas"]["AdminSearchResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-091": { status: 200; data: components["schemas"]["InternalLinkSearchResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-092": { status: 200; data: components["schemas"]["RelatedCandidateResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-093": { status: 200; data: components["schemas"]["SearchStatusResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-094": { status: 202; data: components["schemas"]["AcceptedCommand"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-095": { status: 200; data: components["schemas"]["CalendarResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-096": { status: 200; data: components["schemas"]["SiteSettingsResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
  "API15-S-097": { status: 200; data: components["schemas"]["SiteSettingsResponse"]; headers: Headers } | { status: 400; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 401; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 403; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 404; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 409; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 422; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 429; data: components["schemas"]["ApiError"]; headers: Headers } | { status: 503; data: components["schemas"]["ApiError"]; headers: Headers };
}

export type OperationId = keyof OperationRequestMap;
