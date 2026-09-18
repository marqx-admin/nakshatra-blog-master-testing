import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "../../..");
const repoRoot = path.resolve(siteRoot, "../../..");
const expectedSite = "SITE-01";
const expectedDomain = "WhatsYourRashi.in";
const otherFolder = "site-02-apki-rashi";
const fixture = JSON.parse(fs.readFileSync(path.join(here, "fixtures/public-pages.json"), "utf8"));

function allFiles(dir, out = []) { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, item.name); if (item.isDirectory()) allFiles(full, out); else out.push(full); } return out; }
function sourceText() { return allFiles(path.join(siteRoot, "src")).filter((file) => /\.(ts|tsx|css)$/.test(file)).map((file) => fs.readFileSync(file, "utf8")).join("\n"); }

test("site identity and fixture ownership", () => { assert.equal(fixture.site_key, expectedSite); assert.equal(fixture.canonical_domain, expectedDomain); for (const page of Object.values(fixture.pages)) { assert.equal(page.site.site_key, expectedSite); assert.equal(page.site.canonical_domain, expectedDomain); } });
test("same-slug fixture exists and is site-owned", () => { assert.equal(fixture.same_slug, "shared-slug"); const page = fixture.pages["/article/shared-slug"]; assert.equal(page.context.page_id, "PUB-ARTICLE-01"); assert.equal(page.site.site_key, expectedSite); assert.match(page.article.article_id, new RegExp(expectedSite.toLowerCase())); });
test("all 14 public Page IDs are represented in source/fixture", () => { const text = sourceText(); const pageIds = ["PUB-HOME-01", "PUB-ARTICLE-01", "PUB-CATEGORY-01", "PUB-TAG-01", "PUB-AUTHOR-01", "PUB-SEARCH-01", "PUB-STATIC-ABOUT-01", "PUB-STATIC-CONTACT-01", "PUB-STATIC-PRIVACY-01", "PUB-STATIC-TERMS-01", "PUB-STATIC-DISCLAIMER-01", "PUB-SYS-PREVIEW-01", "PUB-SYS-404-01", "PUB-SYS-410-01"]; for (const id of pageIds) assert.ok(text.includes(id) || JSON.stringify(fixture).includes(id), `missing ${id}`); });
test("all 50 semantic component IDs are implemented locally", () => { const text = sourceText(); const ids = ["CMP12-SHELL-SKIP", "CMP12-SHELL-HEADER", "CMP12-SHELL-NAV", "CMP12-SHELL-MOBILE-NAV", "CMP12-SHELL-SEARCH-ENTRY", "CMP12-SHELL-FOOTER", "CMP12-BREADCRUMBS", "CMP12-PAGE-INTRO", "CMP12-SECTION-HEADER", "CMP12-ARTICLE-CARD", "CMP12-FEATURED-ARTICLE-CARD", "CMP12-COMPACT-ARTICLE-ITEM", "CMP12-TAXONOMY-CARD", "CMP12-AUTHOR-CARD", "CMP12-ARTICLE-COLLECTION", "CMP12-PAGINATION", "CMP12-EMPTY-STATE", "CMP12-ERROR-STATE", "CMP12-MISSING-MEDIA", "CMP12-HOME-LEAD", "CMP12-HOME-SECTION", "CMP12-HOME-FEATURED-POSTS", "CMP12-HOME-FEATURED-CATEGORIES", "CMP12-HOME-LATEST", "CMP12-ARTICLE-HEADER", "CMP12-ARTICLE-META", "CMP12-ARTICLE-FEATURED-MEDIA", "CMP12-ARTICLE-BODY", "CMP12-ARTICLE-AUTHOR", "CMP12-ARTICLE-TAGS", "CMP12-RELATED-POSTS", "CMP12-COLLECTION-INTRO", "CMP12-SEARCH-FORM", "CMP12-SEARCH-RESULTS", "CMP12-STATIC-BODY", "CMP12-PREVIEW-STATUS", "CMP12-SYSTEM-MESSAGE", "CMP12-RECOVERY-ACTIONS", "CMP12-BLOCK-PARAGRAPH", "CMP12-BLOCK-HEADING", "CMP12-BLOCK-LIST", "CMP12-BLOCK-QUOTE", "CMP12-BLOCK-SEPARATOR", "CMP12-BLOCK-MEDIA", "CMP12-BLOCK-TABLE", "CMP12-BLOCK-EMBED", "CMP12-BLOCK-CALLOUT", "CMP12-BLOCK-CTA", "CMP12-BLOCK-DISCLAIMER", "CMP12-BLOCK-SOURCES"]; for (const id of ids) assert.ok(text.includes(id), `missing ${id}`); });
test("no site-to-site presentation import", () => { const text = sourceText(); assert.equal(text.includes(otherFolder), false); assert.equal(text.includes(`@bp/${otherFolder}`), false); });
test("generated public client is the only API client dependency", () => { const text = sourceText(); assert.ok(text.includes("createPublicApiClient")); assert.ok(text.includes("API15-PUB-001")); assert.ok(text.includes("API15-PUB-002")); assert.equal(/fetch\s*\(\s*[`'\"]?\/api\/v1/.test(text), false); });
test("no direct backend provider import", () => { const text = sourceText(); for (const banned of ["pg", "postgres", "ioredis", "redis", "opensearch", "boto3", "sqlalchemy", "object-storage"]) assert.equal(text.includes(`from \"${banned}`), false); });

test("routing fixture does not create an implicit www alias", () => { const resolver = fs.readFileSync(path.join(siteRoot, "src/site/tests/fixtures/fixture-resolver.ts"), "utf8"); assert.match(resolver, /normalized !== expected/); assert.equal(resolver.includes("www.${expected}"), false); });
test("breadcrumbs render inside the site shell main region", () => { for (const rel of ["pages/article/article-page.tsx", "pages/collection/collection-page.tsx", "pages/author/author-page.tsx", "pages/static/static-page.tsx"]) { const value = fs.readFileSync(path.join(siteRoot, "src/site", rel), "utf8"); assert.ok(value.indexOf("<SiteShell") < value.indexOf("<Breadcrumbs"), `${rel} puts breadcrumbs before header/shell`); } });
test("fixture exercises header search and local loading state exists", () => { const home = fixture.pages["/"]; assert.ok(home.navigation.header.items.some((item) => item.destination.kind === "SEARCH")); assert.ok(fs.existsSync(path.join(siteRoot, "src/site/components/runtime-states.tsx"))); });

test("fixture mode is test-only and production cannot select it", () => { const ssr = fs.readFileSync(path.join(siteRoot, "src/site/lib/ssr.ts"), "utf8"); assert.match(ssr, /process\.env\.NODE_ENV === "test"/); assert.match(ssr, /BP_PUBLIC_FIXTURE_MODE/); });
