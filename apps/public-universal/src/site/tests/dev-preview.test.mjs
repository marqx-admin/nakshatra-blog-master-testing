import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/dev-preview-server-test.mjs");
const routePathOutput = resolve(app, "node_modules/.cache/dev-preview-route-path-test.mjs");
mkdirSync(dirname(output), { recursive: true });
const bundle = await build({
  entryPoints: [resolve(app, "src/site/dev-preview/server.ts")],
  outfile: output,
  bundle: true,
  metafile: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
});
const { getDevelopmentPreviewProps } = await import(pathToFileURL(output).href);
await build({
  entryPoints: [resolve(app, "src/site/dev-preview/route-path.ts")],
  outfile: routePathOutput,
  bundle: true,
  platform: "node",
  format: "esm",
  logLevel: "silent",
});
const { routeAwareHref } = await import(pathToFileURL(routePathOutput).href);

function context({ host = "127.0.0.1:3015", remoteAddress = "127.0.0.1", page } = {}) {
  const headers = new Map();
  return {
    req: { headers: { host }, socket: { remoteAddress } },
    res: { setHeader: (name, value) => headers.set(name.toLowerCase(), value) },
    resolvedUrl: `/dev-preview${page ? `?page=${page}` : ""}`,
    query: page ? { page } : {},
    headers,
  };
}

test("development loopback preview serves only synthetic page data without API requests", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async (...args) => {
    fetchCalls += 1;
    return originalFetch(...args);
  };

  try {
    const request = context({ page: "home" });
    const result = await getDevelopmentPreviewProps(request, "development");
    assert.ok("props" in result);
    assert.equal(result.props.previewPage, "home");
    assert.equal(result.props.render.kind, "page");
    assert.equal(result.props.render.data.context.page_id, "PUB-HOME-01");
    assert.equal(result.props.render.data.site.site_key, "SYNTHETIC-DEVELOPMENT-PREVIEW");
    assert.match(result.props.render.data.intro.h1, /shared frontend/i);
    assert.equal(result.props.render.requestPath, "/dev-preview?page=home");
    assert.equal(fetchCalls, 0);
    assert.equal(request.headers.get("cache-control"), "private, no-store");
    assert.equal(request.headers.get("x-robots-tag"), "noindex, nofollow");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("development preview exposes the supported shared page templates", async () => {
  const pages = [
    ["home", "PUB-HOME-01"],
    ["blog", "PUB-BLOG-01"],
    ["article", "PUB-ARTICLE-01"],
    ["category", "PUB-CATEGORY-01"],
    ["tag", "PUB-TAG-01"],
    ["author", "PUB-AUTHOR-01"],
    ["search", "PUB-SEARCH-01"],
    ["about", "PUB-STATIC-ABOUT-01"],
    ["contact", "PUB-STATIC-CONTACT-01"],
    ["not-found", "PUB-SYS-404-01"],
    ["gone", "PUB-SYS-410-01"],
  ];

  for (const [page, pageId] of pages) {
    const result = await getDevelopmentPreviewProps(context({ page }), "development");
    assert.ok("props" in result, `${page} should be available in development`);
    assert.equal(result.props.render.data.context.page_id, pageId);
    assert.equal(result.props.render.data.seo.robots.index, false);
  }
});

test("production, non-loopback requests, and unknown templates are denied before fixtures load", async () => {
  const deniedRequests = [
    [context({ page: "home" }), "production"],
    [context({ host: "site-01.preview.localhost", page: "home" }), "development"],
    [context({ remoteAddress: "203.0.113.10", page: "home" }), "development"],
    [context({ page: "unrecognized" }), "development"],
  ];

  for (const [request, environment] of deniedRequests) {
    const result = await getDevelopmentPreviewProps(request, environment);
    assert.deepEqual(result, { notFound: true });
    assert.equal(request.headers.size, 0);
  }
});

test("preview server bundles no synthetic fixture, tenant resolver, or Public API dependency", () => {
  const inputs = Object.keys(bundle.metafile.inputs);
  assert.ok(!inputs.some((input) => input.endsWith("src/site/dev-preview/preview-data.ts")));
  assert.ok(!inputs.some((input) => input.endsWith("src/site/lib/ssr.ts")));
  assert.ok(!inputs.some((input) => input.includes("api-client-public")));
});

test("shared shell shortcuts stay inside the preview only for the preview path", () => {
  assert.equal(routeAwareHref("/dev-preview?page=home", "search", "/search"), "/dev-preview?page=search");
  assert.equal(routeAwareHref("/dev-preview", "blog", "/blog"), "/dev-preview?page=blog");
  assert.equal(routeAwareHref("/article/real-story", "search", "/search"), "/search");
});
