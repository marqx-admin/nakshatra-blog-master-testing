import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, transform } from "esbuild";
import React, { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { readyStyleConfig } from "@bp/presentation-catalogue";
import { standardHome, standardPages } from "./fixtures/w1-standard.mjs";
import { searchFixture } from "./fixtures/uf05-information.mjs";
import { blogFixture } from "./fixtures/uf06-blog.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/w1-standard-reference.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ stdin: { contents: 'export { StandardWebsiteReference } from "./src/site/reference/standard-website-reference.tsx"; export { PublicRoutePage } from "./src/site/pages/router/public-route-page.tsx"; export { MobileNavigation } from "./src/site/shell/navigation/mobile-navigation.tsx"; export { StandardRecipeContext } from "./src/site/lib/design-context.tsx";', resolveDir: app },
  outfile: output, platform: "node", format: "esm", bundle: true, jsx: "automatic", external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "silent",
  plugins: [{ name: "fixture-head", setup(b) {
    b.onResolve({ filter: /^next\/head$/ }, () => ({ path: "head", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: "export default function Head({children}) { return children; }", resolveDir: app }));
  } }],
});
const { StandardWebsiteReference, PublicRoutePage, MobileNavigation, StandardRecipeContext } = await import(pathToFileURL(output).href);
const markup = (render, Component = StandardWebsiteReference) => renderToStaticMarkup(React.createElement(Component, { render }));
const page = (data, requestPath = "/") => ({ kind: "page", data, requestPath });
const documentFor = html => new JSDOM(html).window.document;

test("Standard uses the same route renderer across nine primary pages, archives, system states and preview", () => {
  for (const render of standardPages()) {
    const original = JSON.stringify(render);
    const html = markup(render);
    const doc = documentFor(html);
    assert.equal(doc.querySelectorAll("h1").length, 1, render.requestPath);
    assert.equal(doc.querySelectorAll("main").length, 1, render.requestPath);
    assert.ok(doc.querySelector('.universal-site[data-recipe="STANDARD"][data-home="HOME-03"][data-article="ART-14"]'), render.requestPath);
    assert.ok(doc.querySelector("header.site-header"));
    assert.ok(doc.querySelector("footer.site-footer"));
    assert.match(html, /--u-width:1200px/);
    assert.match(html, /--u-primary:#285047/);
    assert.equal(JSON.stringify(render), original, "reference appearance must not mutate PageData/SEO");
  }
});

test("Standard keeps 0/1/3/12 real input cards, omits an absent hero and preserves authored selection order", () => {
  for (const [state, count] of [["zero", 0], ["single", 1], ["three", 3], ["twelve", 12]]) {
    const doc = documentFor(markup(page(standardHome(state))));
    assert.equal(doc.querySelectorAll(".article-card").length, count);
    for (const card of doc.querySelectorAll(".article-card")) assert.equal(card.dataset.card, "CARD-03");
    assert.equal(doc.querySelector(".featured-article"), null);
    if (!count) assert.match(doc.querySelector("main").textContent, /No articles/);
  }
  const doc = documentFor(markup(page(standardHome("interleavedSelections"))));
  assert.deepEqual([...doc.querySelectorAll(".home-selection .section-header")].map(el => el.textContent.trim()),
    ["First authored posts", "Authored categories", "Last authored posts"]);
  assert.equal(doc.querySelector(".taxonomy-card").dataset.category, "CAT-02");
  const lead = documentFor(markup(page(standardHome("leadAndLatest"))));
  assert.equal(lead.querySelector(".featured-article").dataset.hero, "HERO-22");
});

test("Blog and Search populated results use the same image-top family and keep destinations/order", () => {
  for (const data of [blogFixture(), searchFixture("RESULTS", "हिंदी & English")]) {
    const doc = documentFor(markup(page(data, data.query ? "/search" : "/blog")));
    assert.deepEqual([...doc.querySelectorAll(".article-card h3 a")].map(el => el.textContent), data.articles.map(a => a.title));
    assert.ok([...doc.querySelectorAll(".article-card")].every(el => el.dataset.card === "CARD-03"));
    assert.equal(doc.querySelector(".article-grid").dataset.collection, "COL-01");
    if (data.query) assert.equal(new URL(doc.querySelector('.pagination .page-step:last-child').href, "https://fixture.test").searchParams.get("q"), data.query);
  }
});

test("Hindi uses the approved fonts without changing supplied prose, titles, links or images", () => {
  const data = standardHome("hindiWithoutMedia", "hi-IN");
  const html = markup(page(data));
  assert.match(html, /Tiro Devanagari Hindi/);
  assert.match(html, /Mukta/);
  assert.match(html, /lang="hi-IN"/);
  assert.equal(documentFor(html).querySelector("h1").textContent, data.intro.h1);
});

test("Standard remains reference-only: existing styles and a later ordinary request keep their own presentation", () => {
  const before = markup(page(standardHome()), PublicRoutePage);
  for (const id of ["STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"]) {
    const data = { ...standardHome(), presentation: { source: "STORED", config: readyStyleConfig(id) } };
    const original = markup(page(data), PublicRoutePage);
    assert.doesNotMatch(original, /data-recipe="STANDARD"/);
    assert.match(markup(page(data)), /data-recipe="STANDARD"/);
    assert.equal(markup(page(data), PublicRoutePage), original);
  }
  assert.equal(markup(page(standardHome()), PublicRoutePage), before);
});

test("unbranded unknown-host and service failures do not acquire a reference tenant shell", () => {
  const known404 = standardPages().find(render => render.requestPath === "/missing").data;
  const neutral = { ...known404, site: undefined, settings: undefined, navigation: undefined, recovery: undefined };
  const inputs = [page(neutral, "/missing"), { kind: "failure", status: 503, title: "Service unavailable", message: "Please try again later.", requestPath: "/", reason: "transport" }];
  for (const render of inputs) {
    const doc = documentFor(markup(render));
    assert.equal(doc.querySelector(".site-header, .site-footer"), null);
    assert.equal(doc.querySelectorAll("h1").length, 1);
    assert.ok(doc.querySelector(".neutral-system-shell"));
  }
});

test("Standard CSS parses without warnings and all additions are isolated from stored tenant styles", async () => {
  const css = readFileSync(resolve(app, "src/site/styles/profiles.css"), "utf8").split("/* V4 C0–C2 / W1:")[1].split("/* W3 recipe v2:")[0];
  const result = await transform(`/* V4 C0–C2 / W1:${css}`, { loader: "css" });
  assert.deepEqual(result.warnings, []);
  // Check each rule selector, not declarations/comments, to catch an unscoped
  // addition that would silently restyle existing tenants.
  const parsed = new JSDOM(`<style>/* V4 C0–C2 / W1:${css}</style>`).window.document.styleSheets[0];
  const check = rules => {
    for (const rule of rules) {
      if (rule.cssRules) check(rule.cssRules);
      else for (const selector of rule.selectorText.split(/,(?![^()]*\))/)) assert.match(selector, /\[data-(?:recipe="STANDARD"|standard-reference)\]/);
    }
  };
  check(parsed.cssRules);
});

test("Standard disclosure locks scrolling only while open, exposes Close and restores focus/previous overflow", async () => {
  const dom = new JSDOM("<!doctype html><body style='overflow:auto'><div id='root'></div></body>");
  const previous = Object.fromEntries(["window", "document", "navigator", "IS_REACT_ACT_ENVIRONMENT"].map(name => [name, globalThis[name]]));
  for (const name of ["window", "document", "navigator"]) Object.defineProperty(globalThis, name, { value: name === "window" ? dom.window : dom.window[name], configurable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  const items = [{ label: "Home", destination: { kind: "HOME", url: "/", is_external: false }, children: [] }];
  const render = path => act(async () => root.render(React.createElement(StandardRecipeContext.Provider, { value: true }, React.createElement(MobileNavigation, { items, requestPath: path }))));
  const click = el => act(async () => el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
  try {
    await render("/");
    const menu = dom.window.document.querySelector(".menu-trigger");
    await click(menu);
    assert.equal(dom.window.document.body.style.overflow, "hidden");
    assert.equal(dom.window.document.querySelector(".mobile-nav-panel").getAttribute("aria-label"), "Site navigation");
    await click(dom.window.document.querySelector(".menu-close"));
    assert.equal(dom.window.document.body.style.overflow, "auto");
    assert.equal(dom.window.document.activeElement === menu, true);
    await click(menu);
    await render("/blog");
    assert.equal(dom.window.document.body.style.overflow, "auto");
    assert.equal(dom.window.document.activeElement === menu, true);
    await click(menu);
    await act(async () => root.unmount());
    assert.equal(dom.window.document.body.style.overflow, "auto");
  } finally {
    if (dom.window.document.getElementById("root").childNodes.length) await act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of Object.entries(previous)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
});
