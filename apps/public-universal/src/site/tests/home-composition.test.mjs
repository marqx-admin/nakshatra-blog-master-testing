import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readyStyleConfig, resolveDesign } from "@bp/presentation-catalogue";

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
