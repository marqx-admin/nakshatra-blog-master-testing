import type { components } from "@bp/api-contract";
import fixture from "./public-pages.json";

type FixtureResponse = { status: 200 | 301 | 302 | 308 | 404 | 410; data?: unknown; location?: string };
const pages = fixture.pages as unknown as Record<string, unknown>;
const redirects = fixture.redirects as unknown as Record<string, string>;

export function resolveFixture(host: string, path: string, query: string | undefined, page: number): FixtureResponse {
  const normalized = host.toLowerCase().split(":")[0];
  const expected = fixture.canonical_domain.toLowerCase();
  // DOC-09: no alias is implicit. A www host is not accepted unless an explicit active alias exists upstream.
  if (normalized !== expected) return { status: 404, data: fixture.neutral_not_found };
  const redirect = redirects[path];
  if (redirect) return { status: 308, location: redirect };
  if (path === "/article/gone-example") return { status: 410, data: fixture.gone };
  if (path === "/search") {
    const raw = pages["/search"];
    if (!raw) return { status: 404, data: fixture.not_found };
    const base = structuredClone(raw) as components["schemas"]["SearchPageData"];
    base.query = query ?? "";
    if (!query) { base.search_state = "NO_QUERY"; base.articles = []; base.result_summary = "Enter a query to search this site"; delete base.pagination; }
    else if (query.toLowerCase() === "none") { base.search_state = "EMPTY"; base.articles = []; base.result_summary = `0 results for ${query}`; delete base.pagination; }
    if (page > 1) base.result_summary = `${base.result_summary} - page ${page}`;
    return { status: 200, data: base };
  }
  const pageData = pages[path];
  if (pageData) return { status: 200, data: pageData };
  return { status: 404, data: fixture.not_found };
}

export function resolvePreviewFixture(host: string): { status: 200 | 404; data: components["schemas"]["PreviewPageData"] | components["schemas"]["NotFoundPageData"] } {
  const normalized = host.toLowerCase().split(":")[0];
  if (normalized !== fixture.canonical_domain.toLowerCase()) return { status: 404, data: fixture.neutral_not_found as components["schemas"]["NotFoundPageData"] };
  return { status: 200, data: fixture.preview as components["schemas"]["PreviewPageData"] };
}
