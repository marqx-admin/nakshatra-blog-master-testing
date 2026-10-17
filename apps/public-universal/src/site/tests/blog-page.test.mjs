// UF-06 tests authored only. No execution is implied by this file's presence.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { blogFixture } from "./fixtures/uf06-blog.mjs";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/uf06-blog-page.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({
  stdin: { contents: 'export { PublicRoutePage } from "./src/site/pages/router/public-route-page.tsx"; export { createPublicGetServerSideProps } from "./src/site/lib/ssr.ts"; export { validatePageData } from "./src/site/lib/response-validation.ts";', resolveDir: app, sourcefile: "uf06-blog-tests.ts" },
  outfile: output, bundle: true, platform: "node", format: "esm", jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent",
  plugins: [{ name: "fixture-head", setup(b) {
    b.onResolve({ filter: /^next\/head$/ }, () => ({ path: "head", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: 'export default function Head({children}) { return children; }', resolveDir: app }));
  } }],
});
const { PublicRoutePage, createPublicGetServerSideProps, validatePageData } = await import(pathToFileURL(output).href);
const render = data => renderToStaticMarkup(React.createElement(PublicRoutePage, { render: { kind: "page", data, requestPath: "/blog" } }));

test("archive route accepts BlogPageData, reuses shell/cards, and retains supplied article order", () => {
  const data = blogFixture();
  assert.ok(validatePageData(data, 200, ["PUB-BLOG-01"]));
  assert.equal(validatePageData(data, 200, ["PUB-SEARCH-01"]), undefined);
  const html = render(data);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
  assert.equal((html.match(/class="article-card"/g) ?? []).length, 3);
  assert.match(html, /aria-label="Breadcrumb"/);
  assert.match(html, /class="pagination"/);
  assert.match(html, /href="https:\/\/site-15.example.test\/blog"/);
  let previous = -1;
  for (const article of data.articles) {
    const index = html.indexOf(article.title);
    assert.ok(index > previous);
    previous = index;
  }
  assert.match(readFileSync(resolve(app, "src/pages/blog.tsx"), "utf8"), /createPublicGetServerSideProps\(\["PUB-BLOG-01"\]\)/);
});

test("empty first and exhausted later archive pages use honest distinct states", () => {
  const empty = render(blogFixture({ count: 0 }));
  assert.match(empty, /No articles yet/);
  assert.doesNotMatch(empty, /class="article-card"|class="pagination"/);
  const later = render(blogFixture({ count: 0, page: 4 }));
  assert.match(later, /No articles on this page/);
  assert.match(later, /Previous/);
  assert.match(later, /name="robots" content="noindex,follow"/);
  assert.doesNotMatch(later, /No articles have been published/);
});

test("independent archive fixtures do not inherit another website's identity or articles", () => {
  render(blogFixture({ siteKey: "SITE-15" }));
  const html = render(blogFixture({ siteKey: "SITE-100" }));
  assert.match(html, /SITE-100 supplied archive article/);
  assert.doesNotMatch(html, /SITE-15|site-15.example.test/);
});

test("archive SSR uses the incoming Host and existing paginated public-page endpoint", async () => {
  const previousFetch = globalThis.fetch;
  const data = blogFixture({ page: 2 });
  let observed;
  globalThis.fetch = async (url, init) => {
    observed = { url: new URL(url), host: new Headers(init.headers).get("X-BP-Public-Host") };
    return new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    const context = { req: { headers: { host: "site-15.example.test" } }, res: { statusCode: 0, setHeader() {} }, resolvedUrl: "/blog?page=2&page_size=3", query: { page: "2", page_size: "3" }, params: {} };
    const reply = await createPublicGetServerSideProps(["PUB-BLOG-01"])(context);
    assert.equal(context.res.statusCode, 200);
    assert.equal(reply.props.render.data.context.page_id, "PUB-BLOG-01");
    assert.equal(observed.host, "site-15.example.test");
    assert.equal(observed.url.searchParams.get("path"), "/blog");
    assert.equal(observed.url.searchParams.get("page"), "2");
    assert.equal(observed.url.searchParams.get("page_size"), "3");
  } finally { globalThis.fetch = previousFetch; }
});
