// Synthetic archive projections; no runtime content is defined here.
import { articlePageFixture } from "./uf04-editorial.mjs";
import { fixtureArticle } from "./uf02-shared-components.mjs";

export function blogFixture({ count = 3, page = 1, siteKey = "SITE-15" } = {}) {
  const base = articlePageFixture();
  const host = `${siteKey.toLowerCase()}.example.test`;
  const destination = number => ({ kind: "STATIC", page_id: "PUB-BLOG-01", url: `https://${host}/blog?page=${number}&page_size=3`, is_external: false });
  return {
    context: { page_id: "PUB-BLOG-01", page_kind: "CONTENT", render_mode: "PUBLIC" },
    site: { ...base.site, site_key: siteKey, canonical_domain: host, display_name: `${siteKey} archive fixture`, home_destination: { kind: "HOME", url: `https://${host}/`, is_external: false } },
    settings: base.settings, navigation: base.navigation,
    intro: { h1: "Articles" }, breadcrumbs: base.breadcrumbs,
    articles: Array.from({ length: count }, (_, index) => ({ ...fixtureArticle(index + 1), article_id: `${siteKey}-${index}`, title: `${siteKey} supplied archive article ${index}` })),
    seo: { ...base.seo, baseline_indexability: "CONDITIONAL-INDEX", canonical_url: `https://${host}/blog`, robots: { index: page === 1, follow: true } },
    ...(page > 1 || count === 3 ? { pagination: {
      current_page: page, links: [{ page_number: page, destination: destination(page), is_current: true }],
      ...(page > 1 ? { previous: destination(page - 1) } : {}),
      ...(count === 3 ? { next: destination(page + 1) } : {}),
    } } : {}),
  };
}
