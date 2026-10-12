import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parityStartingConfig, presetColors, resolveDesign, SAFE_DEFAULT } from "@bp/presentation-catalogue";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(app, "../..");
// Backend fixture adapter only; no external services or database connections.
const pages = JSON.parse(execFileSync("uv", ["run", "--frozen", "--all-packages", "python", "-m", "tests.fixtures.universal_parity"], { cwd: root, maxBuffer: 8 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }));
const output = resolve(app, "node_modules/.cache/repair4-parity.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export { PublicRoutePage } from "./src/site/pages/router/public-route-page.tsx"; export { createPublicGetServerSideProps } from "./src/site/lib/ssr.ts";', resolveDir: app, sourcefile: "repair4-test-entry.ts" },
  outfile: output, bundle: true, platform: "node", format: "esm", jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "silent",
  // Expose SeoHead's children for assertions outside a running Next document.
  plugins: [{ name: "fixture-head", setup(b) {
    b.onResolve({ filter: /^next\/head$/ }, () => ({ path: "head", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: 'import React from "react"; export default function Head({children}) { return React.createElement("head", null, children); }', resolveDir: app }));
  } }],
});
const { PublicRoutePage, createPublicGetServerSideProps } = await import(pathToFileURL(output).href);
const render = (response, path) => renderToStaticMarkup(React.createElement(PublicRoutePage, { render: { kind: "page", data: response.data, requestPath: path } }));

for (const [key, routes] of Object.entries(pages)) {
  test(`${key}: backend-projected Home, Article, collections, fixed pages and system states use one renderer`, () => {
    const design = resolveDesign(parityStartingConfig(key), key === "SITE-11" ? "hi-IN" : "en").selection;
    for (const [path, response] of Object.entries(routes)) {
      const html = render(response, path);
      assert.ok(html.includes(response.data.site.display_name));
      assert.ok(html.includes(`${key} navigation`));
      assert.ok(html.includes(`--u-surface:${presetColors(design.palette).surface}`));
      assert.ok(html.includes(`data-home="${design.homepage}"`));
      assert.ok(html.includes(`data-article="${design.article}"`));
      assert.equal((html.match(/class="site-header"/g) ?? []).length, 1);
      assert.equal((html.match(/class="site-footer"/g) ?? []).length, 1);
      assert.ok(html.includes(`href="${response.data.seo.canonical_url}"`) || response.status !== 200);
      if (["/", "/article/story", "/category/topic", "/tag/topic", "/author/writer", "/search"].includes(path)) assert.ok(html.includes(`${key} fixture article`));
      if (["/category/topic", "/tag/topic", "/author/writer", "/search"].includes(path)) {
        assert.ok(html.includes(`data-collection="${design.collection}"`));
        assert.ok(html.includes(`data-card="${design.articleCard}"`));
      }
      if (path === "/article/story") assert.ok(html.includes(`${key} fixture body`));
      for (const other of Object.keys(pages).filter(other => other !== key)) assert.ok(!html.includes(other), `${key} leaked ${other}`);
      assert.ok(!html.includes("Stories that stay with you"), "Admin sample content must not enter public rendering");
    }
    if (key === "SITE-11") assert.match(render(routes["/"], "/"), /Noto.*Devanagari/);
  });
}

test("real SSR interleaves registered Hosts without request or presentation leakage", async () => {
  const original = globalThis.fetch;
  const seen = [];
  const byHost = new Map(Object.entries(pages).map(([key, routes]) => [routes["/"].data.site.canonical_domain, key]));
  globalThis.fetch = async (url, init) => {
    const host = new Headers(init.headers).get("X-BP-Public-Host");
    assert.equal(init.cache, "no-store");
    seen.push(host);
    await new Promise(resolve => setTimeout(resolve, host.includes("zodiac") ? 3 : 1));
    const response = pages[byHost.get(host)][new URL(url).searchParams.get("path")];
    return new Response(JSON.stringify(response.data), { status: response.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  };
  try {
    const keys = ["SITE-01", "SITE-04", "SITE-01", "SITE-11", "SITE-06", "SITE-14"];
    const load = createPublicGetServerSideProps();
    const replies = await Promise.all(keys.map(async key => {
      const context = { req: { headers: { host: pages[key]["/"].data.site.canonical_domain } }, res: { statusCode: 0, setHeader() {} }, resolvedUrl: "/", query: {}, params: {} };
      const reply = await load(context);
      assert.equal(context.res.statusCode, 200);
      assert.equal(reply.props.render.data.site.site_key, key);
      const html = renderToStaticMarkup(React.createElement(PublicRoutePage, reply.props));
      assert.ok(html.includes(`${key} fixture article`));
      return reply;
    }));
    assert.equal(replies.length, 6);
    assert.deepEqual(seen, keys.map(key => pages[key]["/"].data.site.canonical_domain));
  } finally { globalThis.fetch = original; }
});

test("authoritative SAFE_DEFAULT ignores a stale valid style descriptor", () => {
  for (const key of ["SITE-01", "SITE-11", "SITE-14"]) {
    const response = structuredClone(pages[key]["/"]);
    response.data.presentation = { source: "SAFE_DEFAULT", config: { schema_version: 1, style_id: "STYLE_01" } };
    const html = render(response, "/");
    assert.ok(html.includes(`--u-surface:${presetColors(SAFE_DEFAULT.palette).surface}`));
    assert.ok(html.includes(`data-home="${SAFE_DEFAULT.homepage}"`));
    assert.ok(html.includes(`${key} fixture article`));
  }
});

test("Universal source cannot select a tenant implementation", () => {
  const router = readFileSync(resolve(app, "src/site/pages/router/public-route-page.tsx"), "utf8");
  assert.doesNotMatch(router, /site_key|EXPECTED_SITE_KEY|EXPECTED_DOMAIN|apps\/sites/);
  for (const file of ["lib/presentation.ts", "shell/navigation/site-shell.tsx"]) assert.doesNotMatch(readFileSync(resolve(app, "src/site", file), "utf8"), /SITE-\d|parityStartingConfig|LEGACY_PARITY/);
});
