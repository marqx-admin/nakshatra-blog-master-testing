// Code-audit regressions authored without executing tests, builds or typechecks.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { searchFixture, staticFixture } from "./fixtures/uf05-information.mjs";
import { authorPageFixture } from "./fixtures/uf04-editorial.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/uf07-cross-cutting.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export * from "./src/site/lib/destination.ts"; export * from "./src/site/lib/search-pagination.ts"; export * from "./src/site/lib/response-validation.ts"; export { DestinationLink } from "./src/site/components/destination-link.tsx";', resolveDir: app, sourcefile: "uf07-audit.ts" },
  outfile: output, bundle: true, platform: "node", format: "esm", jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
});
const { destinationHref, isCurrentDestination, searchPagination, validatePageData, DestinationLink } = await import(pathToFileURL(output).href);
const destination = (url, kind = "STATIC", is_external = false) => ({ url, kind, is_external });

test("unsafe scheme, protocol-relative, credential and backslash destinations never become links", () => {
  for (const url of ["javascript:alert(1)", "//other.test/path", "/\\other.test/path", "https://user:password@other.test/path", "https://site.test//other.test/path", "/path\nnext"]) {
    const value = destination(url);
    assert.equal(destinationHref(value), undefined, url);
    const html = renderToStaticMarkup(React.createElement(DestinationLink, { destination: value }, "Supplied label"));
    assert.doesNotMatch(html, /<a/);
    assert.match(html, /Supplied label/);
  }
});

test("same-site canonical destinations retain query and fragment; external links cannot be current", () => {
  assert.equal(destinationHref(destination("https://site.test/about?q=one#details")), "/about?q=one#details");
  assert.equal(destinationHref(destination("/about#details")), "/about#details");
  assert.equal(isCurrentDestination(destination("/about#details"), "/about"), true);
  assert.equal(isCurrentDestination(destination("https://other.test/about", "EXTERNAL", true), "/about"), false);
  const external = renderToStaticMarkup(React.createElement(DestinationLink, { destination: destination("https://other.test/about", "EXTERNAL", true) }, "Source"));
  assert.match(external, /target="_blank" rel="noopener noreferrer"/);
});

test("Search query is carried across supplied pagination without mutating its input", () => {
  const source = { current_page: 1, links: [], next: destination("https://site.test/search?page=2&page_size=20", "SEARCH") };
  const result = searchPagination(source, "हिंदी & English");
  const url = new URL(result.next.url, "https://site.test");
  assert.equal(url.pathname, "/search");
  assert.equal(url.searchParams.get("q"), "हिंदी & English");
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.get("page_size"), "20");
  assert.equal(source.next.url, "https://site.test/search?page=2&page_size=20");
  const supplied = searchFixture("RESULTS", "supplied query").pagination;
  assert.equal(searchPagination(supplied, "supplied query").next.url, supplied.next.url);
});

test("optional UI fields with invalid shapes fail closed before reaching React", () => {
  const search = searchFixture();
  search.context.page_kind = "CONTENT";
  search.context.render_mode = "PUBLIC";
  search.site.site_key = "SITE-15";
  search.seo.baseline_indexability = "NOINDEX";
  assert.ok(validatePageData(search, 200));
  search.intro.intro_text = { unsafe: "not text" };
  assert.equal(validatePageData(search, 200), undefined);
  const author = authorPageFixture();
  author.context.page_kind = "CONTENT";
  author.context.render_mode = "PUBLIC";
  author.site.site_key = "SITE-15";
  author.seo.baseline_indexability = "INDEX-ELIGIBLE";
  assert.ok(validatePageData(author, 200));
  delete author.author.social_profiles;
  assert.equal(validatePageData(author, 200), undefined);
  const info = staticFixture("ABOUT");
  info.context.page_kind = "STATIC";
  info.context.render_mode = "PUBLIC";
  info.site.site_key = "SITE-15";
  info.seo.baseline_indexability = "INDEX-ELIGIBLE";
  assert.ok(validatePageData(info, 200));
  info.content.sections[0].heading = { unexpected: true };
  assert.equal(validatePageData(info, 200), undefined);
});
