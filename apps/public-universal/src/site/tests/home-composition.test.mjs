import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readyStyleConfig, resolveDesign } from "@bp/presentation-catalogue";
import { homepageCases } from "./fixtures/uf03-homepage.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const outfile = resolve(app, "node_modules/.cache/universal-home-test.mjs");
mkdirSync(dirname(outfile), { recursive: true });
await build({
  stdin: { contents: 'export { HomeComposition } from "./src/site/pages/home/home-composition.tsx"; export { DesignContext } from "./src/site/lib/design-context.tsx";', resolveDir: app, sourcefile: "home-test-entry.ts" },
  outfile, platform: "node", format: "esm", bundle: true, jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
});
const { HomeComposition, DesignContext } = await import(pathToFileURL(outfile).href);
const article = { article_id: "article-1", title: "Real lead", published_at: "2026-01-01T00:00:00Z", destination: { kind: "ARTICLE", url: "/article/real", is_external: false } };
const data = { intro: { h1: "Editorial home" }, latest_articles: [], sections: [
  { section_key: "empty-posts", section_kind: "POST_SELECTION", label: "Empty posts", posts: [] },
  { section_key: "toggle", section_kind: "TOGGLE_ONLY", label: "No selected content" },
] };
const render = (value, styleId = "STYLE_01") => renderToStaticMarkup(React.createElement(DesignContext.Provider,
  { value: resolveDesign(readyStyleConfig(styleId)).selection }, React.createElement(HomeComposition, { data: value })));

test("empty home slots and contentless toggle rows do not make blank sections", () => {
  const html = render(data);
  assert.match(html, /Editorial home/);
  assert.match(html, /No articles yet/);
  assert.doesNotMatch(html, /data-slot="LEAD"|data-slot="POSTS"|data-slot="CATEGORIES"|Empty posts|No selected content|section-presence/);
});

test("all five ready styles use real selected posts, categories, lead and latest", () => {
  const populated = { ...data, lead_article: article, latest_articles: [article], sections: [
    { section_key: "posts", section_kind: "POST_SELECTION", label: "Selected", posts: [article] },
    { section_key: "categories", section_kind: "CATEGORY_SELECTION", label: "Explore", categories: [
      { kind: "CATEGORY", name: "News", destination: { kind: "CATEGORY", url: "/category/news", is_external: false } },
    ] },
  ] };
  for (const id of ["STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"]) {
    const html = render(populated, id);
    for (const slot of ["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"]) assert.ok(html.includes(`data-slot="${slot}"`), `${id}: ${slot}`);
    assert.match(html, /Real lead/);
    assert.match(html, /News/);
  }
});

// UF-03 cases authored in coding-only mode. Execution remains deferred.
test("zero/single/3/12 homepage states retain one H1, latest label and exact supplied list order", () => {
  for (const name of ["zero", "single", "three", "twelve"]) {
    const value = homepageCases[name];
    const html = render(value);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
    assert.match(html, /Latest articles/);
    assert.equal((html.match(/class="article-card"/g) ?? []).length, value.latest_articles.length);
    assert.doesNotMatch(html, /data-slot="LEAD"|data-slot="SELECTIONS"/);
    let previous = -1;
    for (const article of value.latest_articles) {
      const position = html.indexOf(`href="${article.destination.url}"`);
      assert.ok(position > previous);
      previous = position;
    }
  }
  assert.match(render(homepageCases.zero), /data-content-state="empty"/);
  assert.match(render(homepageCases.single), /data-content-state="single"/);
});

test("interleaved selected sections retain authored order under each ready style", () => {
  for (const style of ["STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"]) {
    const html = render(homepageCases.interleavedSelections, style);
    const labels = ["First authored posts", "Authored categories", "Last authored posts"];
    assert.ok(html.indexOf(labels[0]) < html.indexOf(labels[1]));
    assert.ok(html.indexOf(labels[1]) < html.indexOf(labels[2]));
    assert.match(html, /data-slot="SELECTIONS"/);
    assert.match(html, /data-item-count="1"/);
  }
});

test("latest articles are not automatically promoted to extra featured cards", () => {
  const html = render(homepageCases.leadAndLatest);
  assert.match(html, /data-slot="LEAD"/);
  assert.equal((html.match(/class="featured-article"/g) ?? []).length, 1);
  assert.equal((html.match(/class="article-card"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /lead-supports|More featured articles/);
});

test("empty latest does not claim no published articles when an authored selection exists", () => {
  const html = render(homepageCases.selectedWithoutLatest);
  assert.match(html, /No latest articles/);
  assert.doesNotMatch(html, /No articles have been published/);
  assert.match(render(homepageCases.categoriesOnly), /Fixture category/);
});

test("Hindi introduction and long missing-media lead retain supplied text and language", () => {
  const value = homepageCases.hindiWithoutMedia;
  const html = render(value);
  assert.match(html, /lang="hi-IN"/);
  assert.ok(html.includes(value.intro.h1));
  assert.ok(html.includes(value.lead_article.title));
  assert.match(html, /data-has-media="false"/);
  assert.doesNotMatch(html, /undefined|Invalid Date/);
});
