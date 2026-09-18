export const siteAppManifest = {
  appId: "APP-04",
  siteKey: "SITE-04",
  canonicalDomain: "ZodiacDaily.in",
  role: "public-site",
  owner: "CHAT08",
  tenantAuthority: "trusted Host -> shared API -> SiteContext; this manifest is diagnostic only",
  presentationAuthority: ["DOC-26 v1.0-RC2 (RC1 semantics unchanged)", "DOC-27 v1.0-RC2 (RC1 semantics unchanged)"],
  apiAuthority: "DOC-15 v1.0-RC8 / API15-PUB-001 + API15-PUB-002",
  pageIds: ["PUB-HOME-01", "PUB-ARTICLE-01", "PUB-CATEGORY-01", "PUB-TAG-01", "PUB-AUTHOR-01", "PUB-SEARCH-01", "PUB-STATIC-ABOUT-01", "PUB-STATIC-CONTACT-01", "PUB-STATIC-PRIVACY-01", "PUB-STATIC-TERMS-01", "PUB-STATIC-DISCLAIMER-01", "PUB-SYS-PREVIEW-01", "PUB-SYS-404-01", "PUB-SYS-410-01"],
  routeFamilies: ["/", "/article/{post_slug}", "/category/{category_slug}", "/tag/{tag_slug}", "/author/{author_slug}", "/search", "/about", "/contact", "/privacy-policy", "/terms-of-use", "/disclaimer", "/_preview/post/{post_id}", "outcome:404", "outcome:410"],
} as const;
