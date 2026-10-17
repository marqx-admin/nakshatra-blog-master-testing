// Synthetic UF-05 data only; never imported by public runtime code.
import { articlePageFixture, destination } from "./uf04-editorial.mjs";
import { fixtureArticle } from "./uf02-shared-components.mjs";
const { site, settings, navigation, seo, breadcrumbs } = articlePageFixture();
const common = { site, settings, navigation, seo, breadcrumbs };
const rich = text => ({ runs: [{ text, marks: [] }] });

export function searchFixture(state = "NO_QUERY", query = "") {
  return {
    ...common, context: { page_id: "PUB-SEARCH-01" },
    seo: { ...seo, robots: { index: false, follow: true } },
    intro: { h1: "खोज / Search", intro_text: "Supplied search introduction" },
    query, search_state: state, result_summary: `Supplied summary: ${state}`,
    articles: state === "RESULTS" ? [fixtureArticle(3), fixtureArticle(1)] : [],
    ...(state === "RESULTS" ? { pagination: {
      current_page: 1, links: [{ page_number: 1, destination: destination(`/search?q=${encodeURIComponent(query)}`, "SEARCH"), is_current: true }],
      next: destination(`/search?q=${encodeURIComponent(query)}&page=2`, "SEARCH"),
    } } : {}),
  };
}
export const staticKeys = ["ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER"];
export function staticFixture(key, overrides = {}) {
  return {
    ...common, context: { page_id: `PUB-STATIC-${key}-01` },
    content: { static_key: key, title: `Supplied ${key} title`, intro_text: "Supplied introduction shown once",
      sections: [
        { heading: "Supplied first section", paragraphs: [rich("Supplied text / स्वीकृत पाठ।")], list_items: [rich("Supplied list item")] },
        { heading: "Supplied second section", paragraphs: [rich("Supplied second paragraph")], list_items: [] },
      ],
    }, ...overrides,
  };
}
export const contactItems = [
  { kind: "EMAIL", label: "Supplied email", display_value: "fixture@example.test", destination: destination("mailto:fixture@example.test", "MAILTO") },
  { kind: "PHONE", label: "Supplied phone", display_value: "+1 202 555 0100", destination: destination("tel:+12025550100", "TEL") },
  { kind: "ADDRESS", label: "Supplied address", display_value: "Synthetic address\nSecond supplied line" },
  { kind: "HOURS", label: "Supplied hours", display_value: "By appointment" },
  { kind: "OTHER_APPROVED", label: "Unsafe URL", display_value: "Keep this supplied text", destination: destination("javascript:alert(1)", "EXTERNAL") },
];
