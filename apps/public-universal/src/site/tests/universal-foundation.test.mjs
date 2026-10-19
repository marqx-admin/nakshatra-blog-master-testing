import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { validIncomingHost } from "../lib/host.ts";
import { validatePageData } from "../lib/response-validation.ts";
import { presentationStyle } from "../lib/presentation.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const source = (path) => readFileSync(resolve(app, path), "utf8");
const destination = (url = "/") => ({ kind: "HOME", url, is_external: false });
const site = (site_key) => ({ site_key, display_name: site_key, canonical_domain: `${site_key.toLowerCase()}.example.test`, home_destination: destination(), timezone_id: "UTC" });
const navigation = { header: { menu_key: "HEADER", items: [] }, footer: { menu_key: "FOOTER", items: [] } };
const seo = { baseline_indexability: "INDEX-ELIGIBLE", title: "Home", robots: { index: true, follow: true }, structured_data: [] };
const presentation = (accent) => ({ source: "STORED", config: { schema_version: 1, style_id: "CUSTOM", base_style_id: "STYLE_03", palette: { mode: "CUSTOM", semantic_tokens: {
  surface: "#ffffff", surface_alt: "#f0f0f0", text: "#111111", text_muted: "#555555",
  accent, accent_text: "#ffffff", border: "#dddddd", focus: "#333333",
} } } });
const home = (site_key, accent = "#174f70") => ({
  context: { page_id: "PUB-HOME-01", page_kind: "CONTENT", render_mode: "PUBLIC" },
  site: site(site_key), settings: { social_profiles: [] }, navigation, presentation: presentation(accent),
  intro: { h1: "Home" }, sections: [], latest_articles: [], seo,
});

test("SITE-N values remain data; Host is required and never inferred from a site key", () => {
  assert.equal(validIncomingHost("site-15.example.test"), true);
  assert.equal(validIncomingHost("site-100.example.test:443"), true);
  for (const bad of ["", "site.test, other.test", "site.test/path", "site.test\r\nX-Tenant: SITE-01"]) assert.equal(validIncomingHost(bad), false);
  for (const key of ["SITE-01", "SITE-14", "SITE-15", "SITE-100"]) assert.equal(validatePageData(home(key), 200, ["PUB-HOME-01"])?.site.site_key, key);
});

test("known 404 and 410 retain the correct same-response shell and HTTP discriminant", () => {
  const notFound = { context: { page_id: "PUB-SYS-404-01", page_kind: "SYSTEM", render_mode: "SYSTEM" }, site: site("SITE-100"), settings: { social_profiles: [] }, navigation, presentation: presentation("#123456"), message: { code: 404, title: "Not found", body: "Missing" }, seo: { ...seo, robots: { index: false, follow: false } } };
  const gone = { ...notFound, context: { page_id: "PUB-SYS-410-01", page_kind: "SYSTEM", render_mode: "SYSTEM" }, message: { code: 410, title: "Gone", body: "Removed" } };
  assert.equal(validatePageData(notFound, 404)?.site.site_key, "SITE-100");
  assert.equal(validatePageData(gone, 410)?.site.site_key, "SITE-100");
  assert.equal(validatePageData(notFound, 200), undefined);
  assert.equal(validatePageData(gone, 404), undefined);
});

test("unknown Host is a neutral 404 and cannot smuggle a tenant or canonical URL", () => {
  const neutral = { context: { page_id: "PUB-SYS-404-01", page_kind: "SYSTEM", render_mode: "SYSTEM" }, message: { code: 404, title: "Page not found", body: "Unavailable" }, seo: { ...seo, robots: { index: false, follow: false } } };
  assert.equal(validatePageData(neutral, 404)?.site, undefined);
  assert.equal(validatePageData({ ...neutral, site: site("SITE-01") }, 404), undefined);
  assert.equal(validatePageData({ ...neutral, seo: { ...neutral.seo, canonical_url: "https://site-01.example.test/" } }, 404), undefined);
});

test("transport or contract failure cannot reuse a previous tenant's PageData or presentation", () => {
  const first = validatePageData(home("SITE-15", "#123456"), 200);
  const second = validatePageData(home("SITE-100", "#654321"), 200);
  assert.equal(first?.site.site_key, "SITE-15");
  assert.equal(second?.site.site_key, "SITE-100");
  assert.equal(presentationStyle(first?.presentation)["--u-accent"], "#123456");
  assert.equal(presentationStyle(second?.presentation)["--u-accent"], "#654321");
  assert.equal(presentationStyle(undefined)["--u-accent"], "#B08A42");
  assert.equal(validatePageData({ ...home("SITE-100"), navigation: undefined }, 200), undefined);
  assert.equal(validatePageData({ ...home("SITE-100"), presentation: { source: "STORED", config: { schema_version: 2, style_id: "CUSTOM" } } }, 200), undefined);
  assert.equal(validatePageData({ ...home("SITE-100"), presentation: { source: "STORED", config: { schema_version: 1, style_id: "CUSTOM" } } }, 200), undefined);
});

test("fixed information page and Preview require their frozen RC11 shapes", () => {
  const rich = { runs: [{ text: "A paragraph", marks: [] }] };
  const about = { ...home("SITE-15"), context: { page_id: "PUB-STATIC-ABOUT-01", page_kind: "STATIC", render_mode: "PUBLIC" }, content: { static_key: "ABOUT", title: "About", sections: [{ paragraphs: [rich], list_items: [] }] } };
  for (const [key, pageId] of [["ABOUT", "PUB-STATIC-ABOUT-01"], ["CONTACT", "PUB-STATIC-CONTACT-01"], ["PRIVACY", "PUB-STATIC-PRIVACY-01"], ["TERMS", "PUB-STATIC-TERMS-01"], ["DISCLAIMER", "PUB-STATIC-DISCLAIMER-01"]]) {
    const page = { ...about, context: { ...about.context, page_id: pageId }, content: { ...about.content, static_key: key } };
    assert.ok(validatePageData(page, 200, [pageId]), key);
    assert.equal(validatePageData(page, 200, ["PUB-HOME-01"]), undefined);
  }
  const draftAbout = { ...about, content: { ...about.content, sections: [] } };
  assert.equal(validatePageData(draftAbout, 200), undefined);
  assert.ok(validatePageData(draftAbout, 200, undefined, true));
  const emptyDraftSection = { ...about, content: { ...about.content, sections: [{ paragraphs: [], list_items: [] }] } };
  assert.equal(validatePageData(emptyDraftSection, 200), undefined);
  assert.ok(validatePageData(emptyDraftSection, 200, undefined, true));
  const preview = { ...home("SITE-15"), seo: { ...seo, robots: { index: false, follow: false } }, context: { page_id: "PUB-SYS-PREVIEW-01", page_kind: "PREVIEW", render_mode: "PREVIEW" }, preview: { lifecycle_status: "DRAFT", source_kind: "COMMITTED", notice_text: "Private" }, article: { article_id: "post-1", title: "Draft", body: { content_schema_version: "1", blocks: [] }, tags: [], categories: [] } };
  assert.ok(validatePageData(preview, 200, ["PUB-SYS-PREVIEW-01"]));
  assert.equal(validatePageData(preview, 200, ["PUB-ARTICLE-01"]), undefined);
});

test("one route tree and fixed shell; no compiled tenant identity", () => {
  for (const path of ["pages/index.tsx", "pages/article/[post_slug].tsx", "pages/category/[category_slug].tsx", "pages/tag/[tag_slug].tsx", "pages/author/[author_slug].tsx", "pages/search.tsx", "pages/about.tsx", "pages/contact.tsx", "pages/privacy-policy.tsx", "pages/terms-of-use.tsx", "pages/disclaimer.tsx", "pages/_preview/post/[post_id].tsx", "pages/[...path].tsx", "pages/404.tsx", "pages/_error.tsx"]) assert.ok(existsSync(resolve(app, "src", path)), path);
  const ssr = source("src/site/lib/ssr.ts");
  assert.match(ssr, /ctx\.req\.headers\.host/);
  assert.match(ssr, /"X-BP-Public-Host": host/);
  assert.match(ssr, /validatePageData/);
  assert.match(ssr, /"Cache-Control", "no-store, private"/);
  assert.match(ssr, /"Referrer-Policy", "no-referrer"/);
  assert.doesNotMatch(ssr, /EXPECTED_SITE_KEY|EXPECTED_DOMAIN|BP_PUBLIC_HOST_OVERRIDE|SITE-01/);
  const shell = source("src/site/shell/navigation/site-shell.tsx");
  assert.match(shell, /SiteHeader/);
  assert.match(shell, /SiteFooter/);
  assert.match(shell, /presentationStyle\(presentation, locale\)/);
  const header = source("src/site/shell/header/site-header.tsx");
  assert.match(header, /routeAwareHref\(requestPath, "search", "\/search"\)/);
  assert.match(header, /site\.logo_media/);
  assert.doesNotMatch(header, /profile_id/);
  const mobile = source("src/site/shell/navigation/mobile-navigation.tsx");
  assert.match(mobile, /aria-expanded/);
  assert.match(mobile, /aria-controls/);
  assert.match(mobile, /Escape/);
  const css = source("src/site/styles/globals.css");
  assert.match(css, /min-height: 44px/);
  assert.match(css, /max-width: 767px/);
  assert.match(css, /min-width: 768px/);
  assert.match(css, /max-width: 1199px/);
});

test("ArticleBody retains only the 12 approved block cases", () => {
  const body = source("src/site/components/article-body.tsx");
  const cases = [...body.matchAll(/case "([A-Z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(cases, ["PARAGRAPH", "HEADING", "LIST", "QUOTE", "SEPARATOR", "MEDIA", "TABLE", "EMBED", "CALLOUT", "CTA", "DISCLAIMER", "SOURCES_REFERENCES"]);
  assert.doesNotMatch(body, /dangerouslySetInnerHTML/);
});

test("SEO binds only the trusted backend projection and Preview forces noindex", () => {
  const seoSource = source("src/site/components/seo-head.tsx");
  for (const field of ["seo.title", "seo.meta_description", "seo.canonical_url", "seo.robots", "seo.open_graph", "seo.structured_data"]) assert.ok(seoSource.includes(field), field);
  assert.doesNotMatch(seoSource, /site\.canonical_domain|presentation|window\.location/);
  const preview = source("src/site/pages/preview/preview-page.tsx");
  assert.match(preview, /noindex,nofollow,noarchive/);
  assert.match(preview, /<SiteShell/);
  assert.match(preview, /<ArticleBodyRenderer/);
});
