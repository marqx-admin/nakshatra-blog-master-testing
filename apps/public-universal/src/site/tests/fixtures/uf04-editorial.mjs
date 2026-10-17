// Synthetic data for deferred frontend tests only; never imported by public routes.
import { fixtureArticle, landscapeMedia } from "./uf02-shared-components.mjs";
const rich = text => ({ runs: [{ text, marks: [] }] });
const block = (type, payload) => ({ block_id: `uf04-${type}`, type, payload });
export const destination = (url, kind = "STATIC") => ({ kind, url, is_external: false });
export const editorialBlocks = [
  block("PARAGRAPH", { content: rich("Long-form fixture paragraph / हिंदी अनुच्छेद।") }),
  block("HEADING", { level: 2, content: rich("Fixture section") }),
  block("LIST", { style: "ORDERED", items: [rich("First supplied item"), rich("Second supplied item")] }),
  block("QUOTE", { quote: rich("Supplied quotation"), attribution: "Fixture attribution", source: "Fixture source" }),
  block("SEPARATOR", {}),
  block("MEDIA", { resolution_state: "READY", media: { ...landscapeMedia, width: 600, height: 900, credit_text: "Supplied credit" } }),
  block("TABLE", { header_row: true, rows: [Array.from({ length: 8 }, (_, i) => rich(`Column ${i}`)), Array.from({ length: 8 }, (_, i) => rich(`Value ${i}`))] }),
  block("EMBED", { provider_key: "FIXTURE", source_url_or_id: "https://example.test/embed", caption: "Supplied embed caption" }),
  block("CALLOUT", { label: "Fixture note", body: rich("Supplied callout") }),
  block("CTA", { label: "Supplied destination", destination: destination("/article/fixture-2", "ARTICLE") }),
  block("DISCLAIMER", { label: "Fixture disclaimer", body: rich("Supplied disclaimer") }),
  block("SOURCES_REFERENCES", { entries: [{ title: "Supplied reference", publisher: "Fixture publisher", url: "https://example.test/reference", note: "Supplied source note" }, { title: "Unsafe URL stays text", url: "javascript:alert(1)" }] }),
  ...Array.from({ length: 10 }, (_, i) => ({ block_id: `uf04-paragraph-${i}`, type: "PARAGRAPH", payload: { content: rich(`Additional paragraph ${i}`) } })),
];
export const publicAuthor = {
  author_id: "uf04-author", display_name: "Fixture Writer", destination: destination("/author/fixture", "AUTHOR"),
  short_bio: "Supplied public summary", bio: "Supplied biography.\nदूसरी पंक्ति।", designation: "Supplied designation",
  expertise: ["Supplied expertise"], social_profiles: [],
};
const base = {
  site: { site_key: "SITE-UF04", display_name: "Editorial fixture site", canonical_domain: "uf04.example.test", timezone_id: "UTC", locale_code: "hi-IN", home_destination: destination("/", "HOME") },
  settings: { social_profiles: [] },
  navigation: { header: { menu_key: "HEADER", items: [] }, footer: { menu_key: "FOOTER", items: [] } },
  seo: { title: "Supplied SEO", robots: { index: true, follow: true }, canonical_url: "https://uf04.example.test/supplied", structured_data: [] },
  breadcrumbs: { items: [{ label: "Home", destination: destination("/", "HOME"), is_current: false }, { label: "Current", is_current: true }] },
};
export function articlePageFixture(overrides = {}) {
  return { ...base, context: { page_id: "PUB-ARTICLE-01" }, article: {
    ...fixtureArticle(1, landscapeMedia), title: "लंबा हिंदी शीर्षक / Long supplied editorial title ".repeat(3),
    author: publicAuthor, categories: [{ kind: "CATEGORY", name: "Supplied category", destination: destination("/category/fixture", "CATEGORY") }],
    tags: [{ kind: "TAG", name: "Supplied tag", destination: destination("/tag/fixture", "TAG") }],
    updated_at: "2026-10-16T00:00:00Z", body: { blocks: editorialBlocks }, ...overrides,
  }, related_content: { articles: [fixtureArticle(2), fixtureArticle(3)] } };
}
export function archiveFixture(kind, articles = []) {
  const entity = { name: "Supplied archive", description: "Supplied archive description", destination: destination(`/${kind}/fixture`, kind === "category" ? "CATEGORY" : "TAG") };
  return { ...base, context: { page_id: kind === "category" ? "PUB-CATEGORY-01" : "PUB-TAG-01" },
    [kind]: kind === "category" ? { ...entity, category_id: "uf04-category" } : { ...entity, tag_id: "uf04-tag" },
    articles, pagination: { current_page: 2, links: [{ page_number: 2, destination: destination(`/${kind}/fixture?page=2`), is_current: true }], previous: destination(`/${kind}/fixture`), next: destination(`/${kind}/fixture?page=3`) },
  };
}
export function authorPageFixture(articles = []) {
  return { ...base, context: { page_id: "PUB-AUTHOR-01" }, author: publicAuthor, articles };
}
