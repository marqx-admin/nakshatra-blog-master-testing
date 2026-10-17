// Explicitly synthetic, nonpublic projections. No database or runtime imports.
// Reuse UF fixtures; these rows are never published or fetched by a public page.
import { homepageCases } from "./uf03-homepage.mjs";
import { articlePageFixture, archiveFixture, authorPageFixture } from "./uf04-editorial.mjs";
import { searchFixture, staticFixture, staticKeys } from "./uf05-information.mjs";
import { blogFixture } from "./uf06-blog.mjs";

export function standardHome(state = "zero", locale = "en-IN") {
  const shell = blogFixture({ count: 0 });
  return { ...shell, ...structuredClone(homepageCases[state]), context: { page_id: "PUB-HOME-01", page_kind: "CONTENT", render_mode: "PUBLIC" },
    site: { ...shell.site, locale_code: locale },
  };
}

export function standardPages() {
  const base = blogFixture({ count: 0 });
  const system = code => ({ ...base, context: { page_id: `PUB-SYS-${code}-01`, page_kind: "SYSTEM", render_mode: "SYSTEM" },
    message: { code, title: `Synthetic ${code} title`, body: "Synthetic unavailable page." },
    recovery: { home: base.site.home_destination }, seo: { ...base.seo, robots: { index: false, follow: false } },
  });
  const article = articlePageFixture();
  const pages = [
    ["/", standardHome()], ["/blog", base], ["/article/fixture-1", article],
    ["/search", searchFixture()],
    ...staticKeys.map(key => [{ ABOUT: "/about", CONTACT: "/contact", PRIVACY: "/privacy-policy", TERMS: "/terms-of-use", DISCLAIMER: "/disclaimer" }[key], staticFixture(key)]),
    ["/category/fixture", archiveFixture("category")], ["/tag/fixture", archiveFixture("tag")],
    ["/author/fixture", authorPageFixture()], ["/missing", system(404)], ["/removed", system(410)],
    ["/preview", { ...article, context: { page_id: "PUB-SYS-PREVIEW-01", page_kind: "PREVIEW", render_mode: "PREVIEW" },
      preview: { notice_text: "Synthetic private preview", lifecycle_status: "DISABLED", source_kind: "DRAFT" } }],
  ];
  return pages.map(([requestPath, data]) => ({ kind: "page", data, requestPath }));
}
