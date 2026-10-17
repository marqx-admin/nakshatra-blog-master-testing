// UF-02 regression coverage authored in coding-only mode; execution is deferred.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React, { act } from "react";
import { JSDOM } from "jsdom";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveDesign } from "@bp/presentation-catalogue";
import { articleSets, fixtureArticle, landscapeMedia, mediaCases } from "./fixtures/uf02-shared-components.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/uf02-shared-components.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export * from "./src/site/components/semantic-components.tsx"; export { ResponsiveMedia } from "./src/site/components/responsive-media.tsx";', resolveDir: app, sourcefile: "uf02-components.ts" },
  outfile: output, platform: "node", format: "esm", bundle: true, jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
});
const { ArticleCard, ArticleCollection, FeaturedArticleCard, ResponsiveMedia, DesignContext } = await import(pathToFileURL(output).href);
const render = (Component, props, config = {}) => renderToStaticMarkup(React.createElement(DesignContext.Provider,
  { value: resolveDesign({ schema_version: 1, style_id: "CUSTOM", base_style_id: "STYLE_03", ...config }).selection },
  React.createElement(Component, props)));

test("0/1/12 collections render honest empty state or the supplied articles in order", () => {
  for (const articles of Object.values(articleSets)) {
    const markup = render(ArticleCollection, { articles });
    assert.equal((markup.match(/class="article-card"/g) ?? []).length, articles.length);
    if (!articles.length) assert.match(markup, /No articles yet/);
    let previous = -1;
    for (const article of articles) {
      const position = markup.indexOf(`href="${article.destination.url}"`);
      assert.ok(position > previous);
      previous = position;
    }
  }
});

test("missing optional media keeps horizontal cards and split heroes text-first", () => {
  const article = fixtureArticle(1);
  const card = render(ArticleCard, { article, profileId: "CARD-06" });
  const hero = render(FeaturedArticleCard, { article }, { hero: { profile_id: "HERO-02" } });
  assert.match(card, /data-has-media="false"/);
  assert.match(hero, /data-has-media="false"/);
  assert.doesNotMatch(card + hero, /<img|undefined|Invalid Date/);
});

test("card captions sit outside the reserved frame and retain intrinsic/selected ratios", () => {
  for (const media of Object.values(mediaCases)) {
    const markup = render(ArticleCard, { article: fixtureArticle(1, media), profileId: "CARD-01", imageId: "IMG-11" });
    assert.match(markup, /<figure class="card-media">/);
    assert.match(markup, /card-media-frame/);
    assert.match(markup, /<\/div><figcaption class="media-caption">Approved fixture caption<\/figcaption>/);
    if (!media.width) assert.match(markup, /aspect-ratio:16 \/ 9/);
  }
});

test("responsive media supplies native source candidates, sizing, lazy loading and accessible unavailable state", () => {
  const markup = render(ResponsiveMedia, { media: landscapeMedia, sizes: "320px" });
  assert.match(markup, /type="image\/avif"/);
  assert.match(markup, /srcSet="https:\/\/media.example.test\/small.jpg 400w"/);
  assert.match(markup, /sizes="320px"/);
  assert.match(markup, /width="1200" height="675"/);
  assert.match(markup, /loading="lazy"/);
  const unavailable = render(ResponsiveMedia, { media: mediaCases.unavailable });
  assert.match(unavailable, /media-unavailable/);
  assert.match(unavailable, /role="img" aria-label="Landscape fixture"/);
  assert.doesNotMatch(unavailable, /<img/);
});

test("text-only hero selections omit media and real hero media alone receives priority", () => {
  const article = fixtureArticle(1, landscapeMedia);
  assert.doesNotMatch(render(FeaturedArticleCard, { article }, { hero: { profile_id: "HERO-14" } }), /<img/);
  const hero = render(FeaturedArticleCard, { article }, { hero: { profile_id: "HERO-02" } });
  assert.match(hero, /loading="eager"/);
  assert.match(hero, /fetchPriority="high"/);
});

test("a failed image becomes an accessible fallback and a new media URL can render again", async () => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div></body>");
  const names = ["window", "document", "navigator", "IS_REACT_ACT_ENVIRONMENT"];
  const previous = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of ["window", "document", "navigator"]) Object.defineProperty(globalThis, name, { value: name === "window" ? dom.window : dom.window[name], configurable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    await act(async () => { root.render(React.createElement(ResponsiveMedia, { media: landscapeMedia })); });
    await act(async () => { dom.window.document.querySelector("img").dispatchEvent(new dom.window.Event("error")); });
    assert.equal(dom.window.document.querySelector("img"), null);
    assert.equal(dom.window.document.querySelector('[role="img"]').getAttribute("aria-label"), landscapeMedia.alt_text);
    await act(async () => { root.render(React.createElement(ResponsiveMedia, { media: { ...landscapeMedia, url: "https://media.example.test/replacement.jpg" } })); });
    assert.equal(dom.window.document.querySelector("img").getAttribute("src"), "https://media.example.test/replacement.jpg");
  } finally {
    await act(async () => { root.unmount(); });
    dom.window.close();
    for (const name of names) {
      if (previous[name]) Object.defineProperty(globalThis, name, previous[name]);
      else delete globalThis[name];
    }
  }
});
