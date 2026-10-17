// UF-04 regression tests authored only; do not infer execution from their presence.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { articlePageFixture, archiveFixture, authorPageFixture } from "./fixtures/uf04-editorial.mjs";
import { fixtureArticle } from "./fixtures/uf02-shared-components.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/uf04-editorial-pages.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export { ArticlePage } from "./src/site/pages/article/article-page.tsx"; export { CollectionPage } from "./src/site/pages/collection/collection-page.tsx"; export { AuthorPage } from "./src/site/pages/author/author-page.tsx";', resolveDir: app, sourcefile: "editorial-tests.ts" },
  outfile: output, bundle: true, platform: "node", format: "esm", jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
  plugins: [{ name: "fixture-head", setup(b) {
    b.onResolve({ filter: /^next\/head$/ }, () => ({ path: "head", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: 'export default function Head({children}) { return children; }', resolveDir: app }));
  } }],
});
const { ArticlePage, CollectionPage, AuthorPage } = await import(pathToFileURL(output).href);
const render = (Component, data) => renderToStaticMarkup(React.createElement(Component, { data, requestPath: "/fixture" }));

test("article renders long-form editorial anatomy and all controlled block families without unsafe embeds", () => {
  const html = render(ArticlePage, articlePageFixture());
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  for (const text of ["Supplied category", "Published", "Updated", "Supplied quotation", "Supplied credit", "Column 0", "Value 7", "Supplied callout", "Supplied disclaimer", "Supplied reference", "Supplied tag", "Related reading", "About the author"]) assert.ok(html.includes(text), text);
  assert.match(html, /<thead><tr><th scope="col">/);
  assert.match(html, /<tbody><tr><td>/);
  assert.match(html, /lang="hi-IN"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /javascript:|<iframe|undefined|Invalid Date/);
  assert.match(html, /href="https:\/\/uf04.example.test\/supplied"/);
});

test("minimal article omits missing featured media and empty optional regions", () => {
  const data = articlePageFixture({ featured_media: undefined, author: undefined, categories: [], tags: [], body: { blocks: [] } });
  delete data.related_content;
  const html = render(ArticlePage, data);
  assert.doesNotMatch(html, /class="article-featured-media"|class="article-after"|class="article-categories"|About the author|Related reading/);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
});

test("missing body media preserves the supplied caption and table without headers keeps its first row", () => {
  const data = articlePageFixture({ body: { blocks: [
    { block_id: "missing", type: "MEDIA", payload: { resolution_state: "MISSING", caption: "Supplied missing-media caption" } },
    { block_id: "table", type: "TABLE", payload: { header_row: false, rows: [[{ runs: [{ text: "First data row", marks: [] }] }]] } },
  ] } });
  const html = render(ArticlePage, data);
  assert.match(html, /Article media unavailable/);
  assert.match(html, /Supplied missing-media caption/);
  assert.match(html, /First data row/);
  assert.doesNotMatch(html, /<thead>/);
});

test("Category and Tag archives retain supplied article order, empty states and pagination URLs", () => {
  for (const kind of ["category", "tag"]) {
    assert.match(render(CollectionPage, archiveFixture(kind)), /No articles in Supplied archive/);
    const html = render(CollectionPage, archiveFixture(kind, [fixtureArticle(3), fixtureArticle(1)]));
    assert.ok(html.indexOf('href="/article/fixture-3"') < html.indexOf('href="/article/fixture-1"'));
    assert.match(html, new RegExp(`href="/${kind}/fixture\\?page=3"`));
    assert.match(html, /aria-current="page"/);
  }
});

test("Author page uses public biography, initials fallback and genuine article collection", () => {
  const empty = render(AuthorPage, authorPageFixture());
  assert.match(empty, /Supplied biography/);
  assert.match(empty, /avatar-fallback large/);
  assert.match(empty, /FW/);
  assert.match(empty, /No public articles/);
  const html = render(AuthorPage, authorPageFixture([fixtureArticle(1)]));
  assert.match(html, /Articles by Fixture Writer/);
  assert.match(html, /href="\/article\/fixture-1"/);
  assert.doesNotMatch(html, /No public articles|undefined/);
});
