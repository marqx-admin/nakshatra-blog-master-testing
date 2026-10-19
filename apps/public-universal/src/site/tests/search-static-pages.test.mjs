// Authored in coding-only mode. Test execution and all acceptance checks are deferred.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contactItems, searchFixture, staticFixture, staticKeys } from "./fixtures/uf05-information.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/uf05-information-pages.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export { SearchPage } from "./src/site/pages/search/search-page.tsx"; export { StaticInformationPage } from "./src/site/pages/static/static-page.tsx";', resolveDir: app, sourcefile: "uf05-tests.ts" },
  outfile: output, bundle: true, platform: "node", format: "esm", jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
  plugins: [{ name: "fixture-head", setup(b) {
    b.onResolve({ filter: /^next\/head$/ }, () => ({ path: "head", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: 'export default function Head({children}) { return children; }', resolveDir: app }));
  } }],
});
const { SearchPage, StaticInformationPage } = await import(pathToFileURL(output).href);
const render = (Component, data) => renderToStaticMarkup(React.createElement(Component, { data, requestPath: "/fixture" }));

test("blank and whitespace NO_QUERY remain an initial search rather than an article archive", () => {
  for (const query of ["", "   "]) {
    const data = searchFixture("NO_QUERY", query);
    // State remains authoritative even if an inconsistent fixture also includes articles/pagination.
    data.articles = searchFixture("RESULTS", "fixture").articles;
    data.pagination = searchFixture("RESULTS", "fixture").pagination;
    const html = render(SearchPage, data);
    assert.match(html, /खोज शुरू करें/);
    assert.doesNotMatch(html, /class="article-card"|class="pagination"/);
    const form = html.match(/<form\b[^>]*>/)?.[0] ?? "";
    for (const attribute of ['method="get"', 'action="/search"', 'role="search"']) assert.ok(form.includes(attribute), attribute);
    assert.match(html, /aria-describedby="site-search-hint"/);
    assert.doesNotMatch(html, /name="page"/);
  }
});

test("EMPTY preserves the supplied query and summary without unrelated article cards", () => {
  const html = render(SearchPage, searchFixture("EMPTY", "हिंदी keyword"));
  assert.match(html, /कोई परिणाम नहीं/);
  assert.match(html, /value="हिंदी keyword"/);
  assert.match(html, /Supplied summary: EMPTY/);
  assert.doesNotMatch(html, /class="article-card"|class="pagination"/);
});

test("an empty later results page preserves supplied previous-page recovery and its query", () => {
  const data = searchFixture("EMPTY", "current query");
  data.pagination = { current_page: 2, links: [], previous: { kind: "SEARCH", url: "/search?page=1&page_size=20", is_external: false } };
  const html = render(SearchPage, data);
  assert.match(html, /कोई परिणाम नहीं/);
  assert.match(html, /class="pagination"/);
  assert.match(html, /q=current\+query/);
  assert.match(html, /पिछला/);
  assert.doesNotMatch(html, /class="article-card"/);
});

test("RESULTS retains article order, encoded pagination, noindex SEO and query reset link", () => {
  const data = searchFixture("RESULTS", "हिंदी & English");
  const html = render(SearchPage, data);
  assert.ok(html.indexOf('href="/article/fixture-3"') < html.indexOf('href="/article/fixture-1"'));
  assert.ok(html.includes(`q=${encodeURIComponent(data.query)}&amp;page=2`));
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /href="\/search" class="button-secondary">हटाएँ/);
  assert.match(html, /role="status" aria-atomic="true"/);
});

test("all five static pages render supplied content once, in order, with one H1", () => {
  for (const key of staticKeys) {
    const html = render(StaticInformationPage, staticFixture(key));
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.equal((html.match(/Supplied introduction shown once/g) ?? []).length, 1);
    assert.ok(html.indexOf("Supplied first section") < html.indexOf("Supplied second section"));
    assert.match(html, /Supplied list item/);
    assert.match(html, /lang="hi-IN"/);
    assert.match(html, /aria-label="ब्रेडक्रंब"/);
    assert.doesNotMatch(html, /All rights reserved|<form|javascript:/);
  }
});

test("minimal legal pages do not fabricate policy text or empty sections", () => {
  const data = staticFixture("PRIVACY");
  data.content = { static_key: "PRIVACY", title: "Supplied privacy title", sections: [{ paragraphs: [], list_items: [] }] };
  const html = render(StaticInformationPage, data);
  assert.match(html, /Supplied privacy title/);
  assert.doesNotMatch(html, /static-content-section|contact-section|cookie|retention|refund/i);
});

test("Contact renders only supplied safe methods and an honest unavailable state", () => {
  const empty = render(StaticInformationPage, staticFixture("CONTACT"));
  assert.match(empty, /इस पृष्ठ पर संपर्क जानकारी अभी उपलब्ध नहीं है/);
  const html = render(StaticInformationPage, staticFixture("CONTACT", { contact_info: { items: contactItems } }));
  assert.match(html, /<dl class="contact-list">/);
  assert.match(html, /href="mailto:fixture@example.test"/);
  assert.match(html, /href="tel:\+12025550100"/);
  assert.match(html, /Supplied hours/);
  assert.match(html, /Keep this supplied text/);
  assert.doesNotMatch(html, /javascript:|<form|इस पृष्ठ पर संपर्क जानकारी अभी उपलब्ध नहीं है/);
});
