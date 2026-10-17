import type { AnyRenderablePageData, PageId } from "./types";

type JsonObject = Record<string, unknown>;
const pageIds = new Set<PageId>([
  "PUB-HOME-01", "PUB-BLOG-01", "PUB-ARTICLE-01", "PUB-CATEGORY-01", "PUB-TAG-01", "PUB-AUTHOR-01",
  "PUB-SEARCH-01", "PUB-STATIC-ABOUT-01", "PUB-STATIC-CONTACT-01", "PUB-STATIC-PRIVACY-01",
  "PUB-STATIC-TERMS-01", "PUB-STATIC-DISCLAIMER-01", "PUB-SYS-PREVIEW-01", "PUB-SYS-404-01", "PUB-SYS-410-01",
]);
const blockTypes = new Set(["PARAGRAPH", "HEADING", "LIST", "QUOTE", "SEPARATOR", "MEDIA", "TABLE", "EMBED", "CALLOUT", "CTA", "DISCLAIMER", "SOURCES_REFERENCES"]);
const staticKeys: Record<string, string> = {
  "PUB-STATIC-ABOUT-01": "ABOUT", "PUB-STATIC-CONTACT-01": "CONTACT", "PUB-STATIC-PRIVACY-01": "PRIVACY",
  "PUB-STATIC-TERMS-01": "TERMS", "PUB-STATIC-DISCLAIMER-01": "DISCLAIMER",
};

function object(value: unknown): value is JsonObject { return typeof value === "object" && value !== null && !Array.isArray(value); }
function string(value: unknown): value is string { return typeof value === "string"; }
function nonempty(value: unknown): value is string { return string(value) && value.trim().length > 0; }
function optionalString(value: unknown): boolean { return value === undefined || string(value); }
function array(value: unknown): value is unknown[] { return Array.isArray(value); }
function destination(value: unknown): boolean { return object(value) && string(value.kind) && string(value.url) && typeof value.is_external === "boolean"; }
function taxonomy(value: unknown): boolean { return object(value) && nonempty(value.name) && destination(value.destination) && (value.kind === "CATEGORY" || value.kind === "TAG"); }
function authorSummary(value: unknown): boolean { return object(value) && nonempty(value.author_id) && nonempty(value.display_name) && optionalString(value.short_bio) && (value.destination === undefined || destination(value.destination)) && (value.avatar_media === undefined || media(value.avatar_media)); }
function socialProfile(value: unknown): boolean { return object(value) && nonempty(value.platform) && nonempty(value.url) && optionalString(value.label); }
function pagination(value: unknown): boolean {
  return value === undefined || object(value) && Number.isInteger(value.current_page) && array(value.links)
    && value.links.every((link) => object(link) && Number.isInteger(link.page_number) && typeof link.is_current === "boolean" && destination(link.destination))
    && (value.previous === undefined || destination(value.previous)) && (value.next === undefined || destination(value.next));
}
function breadcrumbs(value: unknown): boolean {
  return value === undefined || object(value) && array(value.items) && value.items.every((item) =>
    object(item) && nonempty(item.label) && typeof item.is_current === "boolean" && (item.destination === undefined || destination(item.destination)));
}
function navigationItem(value: unknown, depth = 0): boolean {
  return depth < 4 && object(value) && nonempty(value.label) && destination(value.destination) && array(value.children)
    && value.children.every((child) => navigationItem(child, depth + 1));
}
function media(value: unknown): boolean {
  const dimension = (item: unknown) => item === undefined || typeof item === "number" && Number.isFinite(item) && item > 0;
  return object(value) && nonempty(value.media_id) && nonempty(value.url) && dimension(value.width) && dimension(value.height)
    && optionalString(value.alt_text) && optionalString(value.caption) && optionalString(value.credit_text) && optionalString(value.mime_type)
    && array(value.variants) && value.variants.every((variant) => object(variant) && nonempty(variant.url) && nonempty(variant.mime_type) && dimension(variant.width) && dimension(variant.height));
}
function summary(value: unknown): boolean { return object(value) && nonempty(value.article_id) && nonempty(value.title) && optionalString(value.excerpt) && optionalString(value.taxonomy_label) && destination(value.destination) && string(value.published_at) && (value.featured_media === undefined || media(value.featured_media)) && (value.author === undefined || authorSummary(value.author)); }
function richText(value: unknown): boolean { return object(value) && array(value.runs) && value.runs.every((run) => object(run) && string(run.text) && array(run.marks) && run.marks.every((mark) => mark === "BOLD" || mark === "ITALIC") && (run.link === undefined || destination(run.link))); }
function block(value: unknown): boolean {
  if (!object(value) || !nonempty(value.block_id) || !blockTypes.has(String(value.type)) || !object(value.payload)) return false;
  const payload = value.payload;
  switch (value.type) {
    case "PARAGRAPH": return richText(payload.content);
    case "HEADING": return [2, 3, 4].includes(Number(payload.level)) && richText(payload.content);
    case "LIST": return ["ORDERED", "UNORDERED"].includes(String(payload.style)) && array(payload.items) && payload.items.every(richText);
    case "QUOTE": return richText(payload.quote) && optionalString(payload.attribution) && optionalString(payload.source);
    case "SEPARATOR": return true;
    case "MEDIA": return (payload.resolution_state === "READY" || payload.resolution_state === "MISSING") && optionalString(payload.caption) && optionalString(payload.alt_override) && (payload.media === undefined || media(payload.media));
    case "TABLE": return typeof payload.header_row === "boolean" && array(payload.rows) && payload.rows.every((row) => array(row) && row.every(richText));
    case "EMBED": return nonempty(payload.provider_key) && nonempty(payload.source_url_or_id) && optionalString(payload.caption);
    case "CALLOUT": case "DISCLAIMER": return richText(payload.body) && optionalString(payload.label);
    case "CTA": return nonempty(payload.label) && optionalString(payload.supporting_text) && destination(payload.destination);
    case "SOURCES_REFERENCES": return array(payload.entries) && payload.entries.every((entry) => object(entry) && nonempty(entry.title) && optionalString(entry.url) && optionalString(entry.publisher) && optionalString(entry.note));
    default: return false;
  }
}
function article(value: unknown, preview = false): boolean {
  return object(value) && nonempty(value.article_id) && nonempty(value.title) && object(value.body) && array(value.body.blocks)
    && optionalString(value.excerpt) && optionalString(value.updated_at)
    && value.body.blocks.every(block) && array(value.tags) && value.tags.every(taxonomy)
    && array(value.categories) && value.categories.every(taxonomy)
    && (value.author === undefined ? preview : authorSummary(value.author))
    && (value.featured_media === undefined || media(value.featured_media))
    && (preview || destination(value.destination) && string(value.published_at));
}
function seo(value: unknown): boolean {
  return object(value) && ["INDEX-ELIGIBLE", "CONDITIONAL-INDEX", "NOINDEX"].includes(String(value.baseline_indexability))
    && nonempty(value.title) && object(value.robots) && typeof value.robots.index === "boolean"
    && typeof value.robots.follow === "boolean" && array(value.structured_data) && value.structured_data.every(object)
    && (value.open_graph === undefined || object(value.open_graph) && nonempty(value.open_graph.title)
      && ["ARTICLE", "WEBSITE"].includes(String(value.open_graph.type))
      && (value.open_graph.image === undefined || media(value.open_graph.image)))
    && (value.canonical_url === undefined || string(value.canonical_url));
}
function presentation(value: unknown): boolean {
  if (!object(value) || !["STORED", "PRESET_DEFAULT", "SAFE_DEFAULT"].includes(String(value.source)) || !object(value.config)) return false;
  const config = value.config;
  if (config.schema_version !== 1 || !["STANDARD", "STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05", "CUSTOM"].includes(String(config.style_id))) return false;
  if (config.recipe_version !== undefined && config.recipe_version !== 1 && config.recipe_version !== 2) return false;
  if ((config.style_id === "STANDARD" || config.base_style_id === "STANDARD") && config.recipe_version !== 2) return false;
  const base = config.base_style_id;
  if (config.style_id === "CUSTOM" ? !["STANDARD", "STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"].includes(String(base)) : base !== undefined) return false;
  if (config.palette !== undefined) {
    if (!object(config.palette) || !["PRESET", "CUSTOM"].includes(String(config.palette.mode))) return false;
    if (config.palette.semantic_tokens !== undefined) {
      if (!object(config.palette.semantic_tokens)) return false;
      for (const token of ["surface", "surface_alt", "text", "text_muted", "accent", "accent_text", "border", "focus"]) {
        if (!/^#[0-9a-fA-F]{6}$/.test(String(config.palette.semantic_tokens[token] ?? ""))) return false;
      }
    }
  }
  return true;
}
function shell(value: JsonObject): boolean {
  const site = value.site;
  const settings = value.settings;
  const nav = value.navigation;
  return object(site) && /^SITE-[0-9]{2,}$/.test(String(site.site_key)) && nonempty(site.display_name)
    && optionalString(site.locale_code) && optionalString(site.default_language)
    && nonempty(site.canonical_domain) && destination(site.home_destination)
    && (site.logo_media === undefined || media(site.logo_media))
    && object(settings) && optionalString(settings.copyright_text) && array(settings.social_profiles) && settings.social_profiles.every(socialProfile)
    && object(nav) && object(nav.header) && nav.header.menu_key === "HEADER" && array(nav.header.items)
    && nav.header.items.every((item) => navigationItem(item))
    && object(nav.footer) && nav.footer.menu_key === "FOOTER" && array(nav.footer.items)
    && nav.footer.items.every((item) => navigationItem(item))
    && (value.presentation === undefined || presentation(value.presentation));
}
function payload(value: JsonObject, pageId: PageId, allowDraftContent = false): boolean {
  switch (pageId) {
    case "PUB-BLOG-01": return object(value.intro) && nonempty(value.intro.h1) && optionalString(value.intro.intro_text)
      && array(value.articles) && value.articles.every(summary) && pagination(value.pagination) && breadcrumbs(value.breadcrumbs);
    case "PUB-HOME-01": return object(value.intro) && nonempty(value.intro.h1) && optionalString(value.intro.intro_text) && (value.lead_article === undefined || summary(value.lead_article))
      && array(value.sections) && value.sections.every((section) => object(section) && nonempty(section.section_key)
        && optionalString(section.label)
        && ["POST_SELECTION", "CATEGORY_SELECTION", "TOGGLE_ONLY"].includes(String(section.section_kind))
        && (section.posts === undefined || array(section.posts) && section.posts.every(summary))
        && (section.categories === undefined || array(section.categories) && section.categories.every(taxonomy)))
      && array(value.latest_articles) && value.latest_articles.every(summary);
    case "PUB-ARTICLE-01": return article(value.article) && breadcrumbs(value.breadcrumbs)
      && (value.related_content === undefined || object(value.related_content) && array(value.related_content.articles) && value.related_content.articles.every(summary));
    case "PUB-CATEGORY-01": return object(value.category) && nonempty(value.category.name) && optionalString(value.category.description) && array(value.articles) && value.articles.every(summary) && pagination(value.pagination) && breadcrumbs(value.breadcrumbs);
    case "PUB-TAG-01": return object(value.tag) && nonempty(value.tag.name) && optionalString(value.tag.description) && array(value.articles) && value.articles.every(summary) && pagination(value.pagination) && breadcrumbs(value.breadcrumbs);
    case "PUB-AUTHOR-01": return object(value.author) && nonempty(value.author.display_name) && array(value.author.expertise)
      && value.author.expertise.every(string) && optionalString(value.author.bio) && optionalString(value.author.designation)
      && array(value.author.social_profiles) && value.author.social_profiles.every(socialProfile)
      && (value.author.avatar_media === undefined || media(value.author.avatar_media))
      && array(value.articles) && value.articles.every(summary) && pagination(value.pagination) && breadcrumbs(value.breadcrumbs);
    case "PUB-SEARCH-01": return object(value.intro) && nonempty(value.intro.h1) && optionalString(value.intro.intro_text) && string(value.query)
      && ["NO_QUERY", "RESULTS", "EMPTY"].includes(String(value.search_state)) && string(value.result_summary)
      && array(value.articles) && value.articles.every(summary) && pagination(value.pagination);
    case "PUB-STATIC-ABOUT-01":
    case "PUB-STATIC-CONTACT-01":
    case "PUB-STATIC-PRIVACY-01":
    case "PUB-STATIC-TERMS-01":
    case "PUB-STATIC-DISCLAIMER-01": {
      if (!object(value.content) || value.content.static_key !== staticKeys[pageId] || !nonempty(value.content.title) || !optionalString(value.content.intro_text) || !array(value.content.sections) || (!allowDraftContent && value.content.sections.length === 0)) return false;
      return breadcrumbs(value.breadcrumbs)
        && value.content.sections.every((section) => object(section) && optionalString(section.heading) && array(section.paragraphs) && array(section.list_items)
          && (allowDraftContent || section.paragraphs.length > 0 || section.list_items.length > 0)
          && [...section.paragraphs, ...section.list_items].every(richText))
        && (value.contact_info === undefined || object(value.contact_info) && array(value.contact_info.items)
          && value.contact_info.items.every((item) => object(item) && nonempty(item.label) && string(item.display_value) && (item.destination === undefined || destination(item.destination))));
    }
    case "PUB-SYS-PREVIEW-01": return object(value.preview) && nonempty(value.preview.notice_text) && article(value.article, true);
    case "PUB-SYS-404-01": return object(value.message) && value.message.code === 404 && nonempty(value.message.title) && string(value.message.body)
      && (value.recovery === undefined || object(value.recovery) && (value.recovery.home === undefined || destination(value.recovery.home)) && (value.recovery.search === undefined || destination(value.recovery.search)));
    case "PUB-SYS-410-01": return object(value.message) && value.message.code === 410 && nonempty(value.message.title) && string(value.message.body)
      && (value.recovery === undefined || object(value.recovery) && (value.recovery.home === undefined || destination(value.recovery.home)) && (value.recovery.search === undefined || destination(value.recovery.search)));
  }
}

export function validatePageData(value: unknown, status: number, expectedPageIds?: readonly PageId[], allowDraftContent = false): AnyRenderablePageData | undefined {
  if (!object(value) || !object(value.context) || !pageIds.has(value.context.page_id as PageId) || !seo(value.seo)) return undefined;
  const pageId = value.context.page_id as PageId;
  const expectedKind = pageId === "PUB-SYS-PREVIEW-01" ? "PREVIEW" : pageId.startsWith("PUB-SYS-") ? "SYSTEM" : pageId.startsWith("PUB-STATIC-") ? "STATIC" : "CONTENT";
  const expectedMode = expectedKind === "PREVIEW" ? "PREVIEW" : expectedKind === "SYSTEM" ? "SYSTEM" : "PUBLIC";
  if (value.context.page_kind !== expectedKind || value.context.render_mode !== expectedMode) return undefined;
  if ((status === 404 && pageId !== "PUB-SYS-404-01") || (status === 410 && pageId !== "PUB-SYS-410-01")) return undefined;
  if (status === 200 && (pageId === "PUB-SYS-404-01" || pageId === "PUB-SYS-410-01")) return undefined;
  if ((status === 404 || status === 410 || pageId === "PUB-SYS-PREVIEW-01") && (value.seo as JsonObject).robots && ((value.seo as JsonObject).robots as JsonObject).index !== false) return undefined;
  if (expectedPageIds && status === 200 && !expectedPageIds.includes(pageId)) return undefined;
  if (!payload(value, pageId, allowDraftContent)) return undefined;
  // A site-less 404 is the only neutral tenant-less PageData shape. A partial shell is untrusted.
  const neutral = status === 404 && value.site === undefined && value.settings === undefined && value.navigation === undefined && value.presentation === undefined;
  if (neutral && ((value.seo as JsonObject).canonical_url !== undefined || (value.seo as JsonObject).open_graph !== undefined || ((value.seo as JsonObject).structured_data as unknown[]).length !== 0)) return undefined;
  if (!neutral && !shell(value)) return undefined;
  if (status === 410 && neutral) return undefined;
  return value as AnyRenderablePageData;
}
