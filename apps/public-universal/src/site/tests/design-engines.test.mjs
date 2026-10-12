import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveDesign } from "@bp/presentation-catalogue";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const outdir = resolve(app, "node_modules/.cache/wu04-design");
mkdirSync(outdir, { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/components/semantic-components.tsx")], outdir,
  entryNames: "engine", platform: "node", format: "esm", bundle: true, jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { ArticleCard, ArticleCollection, AuthorCard, FeaturedArticleCard, HomeLeadRegion, TaxonomyCard, DesignContext } = await import(pathToFileURL(resolve(outdir, "engine.js")).href);
await build({ stdin: { contents: 'export { AuthorProfile } from "./src/site/pages/author/author-profile.tsx"; export { DesignContext } from "./src/site/lib/design-context.tsx";', resolveDir: app, sourcefile: "author-test-entry.ts" }, outfile: resolve(outdir, "author-profile.js"),
  platform: "node", format: "esm", bundle: true, jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { AuthorProfile, DesignContext: AuthorDesignContext } = await import(pathToFileURL(resolve(outdir, "author-profile.js")).href);
const destination = (url) => ({ kind: "ARTICLE", url, is_external: false });
const article = (media = undefined) => ({ article_id: "article-1", title: "Tenant article", excerpt: "Excerpt", published_at: "2026-01-01T00:00:00Z", destination: destination("/article/tenant"), ...(media ? { featured_media: media } : {}) });
const media = { media_id: "media-1", url: "https://media.example.test/image.jpg", width: 800, height: 500, variants: [], alt_text: "Featured" };
const withDesign = (config, component) => renderToStaticMarkup(React.createElement(DesignContext.Provider,
  { value: resolveDesign({ schema_version: 1, style_id: "CUSTOM", base_style_id: "STYLE_03", ...config }).selection }, component));

test("overlay article and media-led hero fail safely to text when media is absent", () => {
  const config = { cards: { article_card_profile_id: "CARD-13" }, hero: { profile_id: "HERO-05" } };
  const card = withDesign(config, React.createElement(ArticleCard, { article: article() }));
  const hero = withDesign(config, React.createElement(FeaturedArticleCard, { article: article() }));
  assert.match(card, /data-card="CARD-15"/);
  assert.match(hero, /data-hero="HERO-14"/);
  assert.doesNotMatch(card + hero, /<img/);
  const cardWithMedia = withDesign(config, React.createElement(ArticleCard, { article: article(media) }));
  assert.match(cardWithMedia, /data-card="CARD-13"/);
  assert.match(cardWithMedia, /alt="Featured"/);
});

test("category and author cards use only public summary fields and safe fallback", () => {
  const category = withDesign({ cards: { category_card_profile_id: "CAT-08" } }, React.createElement(TaxonomyCard,
    { item: { kind: "CATEGORY", name: "Topic", destination: { kind: "CATEGORY", url: "/category/topic", is_external: false } } }));
  assert.match(category, /data-category="CAT-01"/);
  assert.doesNotMatch(category, /<img/);
  const author = withDesign({ cards: { author_card_profile_id: "AUTH-02" } }, React.createElement(AuthorCard,
    { author: { author_id: "author-1", display_name: "Ada Example", short_bio: "Writer" } }));
  assert.match(author, /data-author="AUTH-02"/);
  assert.match(author, /avatar-fallback/);
  assert.match(author, /AE/);
});

test("full author page uses trusted expertise and approved social profiles; AUTH-12 falls back", () => {
  const author = { author_id: "author-1", display_name: "Ada Example", destination: { kind: "AUTHOR", url: "/author/ada", is_external: false },
    expertise: ["Astronomy"], social_profiles: [{ platform: "WEB", label: "Ada's site", url: "https://example.test/ada" }] };
  const render = (id, value = author) => renderToStaticMarkup(React.createElement(AuthorDesignContext.Provider,
    { value: resolveDesign({ schema_version: 1, style_id: "CUSTOM", base_style_id: "STYLE_03", cards: { author_card_profile_id: id } }).selection },
    React.createElement(AuthorProfile, { author: value })));
  assert.match(render("AUTH-11"), /data-author-profile="AUTH-11"[\s\S]*Astronomy/);
  assert.match(render("AUTH-12"), /data-author-profile="AUTH-05"/);
  assert.doesNotMatch(render("AUTH-12"), /articles on this page|article count/i);
  assert.match(render("AUTH-13"), /data-author-profile="AUTH-13"[\s\S]*https:\/\/example.test\/ada/);
  assert.match(render("AUTH-13", { ...author, social_profiles: [] }), /data-author-profile="AUTH-05"/);
});

test("collection and feature support use existing article data, never fabricated cards", () => {
  const collection = withDesign({ collections: { category_layout_id: "COL-03", article_card_profile_id: "CARD-15" } },
    React.createElement(ArticleCollection, { articles: [article()], context: "CATEGORY" }));
  assert.match(collection, /data-collection="COL-03"/);
  assert.match(collection, /data-card="CARD-15"/);
  const lead = withDesign({ hero: { profile_id: "HERO-10" } }, React.createElement(HomeLeadRegion,
    { article: article(), supports: [{ ...article(), article_id: "article-2", title: "Actual support" }] }));
  assert.match(lead, /Actual support/);
  assert.match(lead, /data-support-count="1"/);
  const withoutSupport = withDesign({ hero: { profile_id: "HERO-10" } }, React.createElement(HomeLeadRegion, { article: article() }));
  assert.match(withoutSupport, /data-support-count="0"/);
  assert.doesNotMatch(withoutSupport, /Actual support/);
});

test("responsive, keyboard and article media rules stay code-owned", () => {
  const css = readFileSync(resolve(app, "src/site/styles/globals.css"), "utf8");
  for (const rule of ["max-width: 767px", "min-width: 768px", "max-width: 1199px", "grid-template-columns: repeat(2", "grid-template-columns: minmax(0, 1fr)", ":focus-visible", "min-height: 44px", ".table-region { max-width: 100%; overflow-x: auto; }"]) assert.ok(css.includes(rule), rule);
  assert.match(css, /\.article-body img, \.article-featured-media img/);
  assert.doesNotMatch(css, /\.article-body img\s*\{[^}]*object-fit:\s*cover/s);
});

test("home composition keeps the semantic H1 first even in lead-first visual recipes", () => {
  const source = readFileSync(resolve(app, "src/site/pages/home/home-composition.tsx"), "utf8");
  assert.match(source, /\["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"\]/);
  assert.match(source, /order: visualOrder\.indexOf\(slot\)/);
});
