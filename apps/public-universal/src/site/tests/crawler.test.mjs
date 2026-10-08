import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/wu03-crawler-test.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/lib/crawler.ts")], outfile: output, platform: "node", format: "esm", bundle: true, logLevel: "silent" });
const { createCrawlerGetServerSideProps } = await import(pathToFileURL(output).href);

function context(host) {
  const headers = new Map();
  const ctx = { req: { headers: { host } }, res: {
    statusCode: 200, setHeader: (name, value) => headers.set(name.toLowerCase(), value),
    end: (body) => { ctx.body = body; },
  }, headers };
  return ctx;
}

test("crawler resource forwards Host to existing API and preserves text response", async () => {
  const previous = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url: String(url), host: new Headers(init.headers).get("X-BP-Public-Host") });
    return new Response("User-agent: *\nDisallow: /", { status: 200, headers: { "content-type": "text/plain", "cache-control": "public, max-age=60" } });
  };
  try {
    const ctx = context("site-100.test");
    const result = await createCrawlerGetServerSideProps("/robots.txt")(ctx);
    assert.deepEqual(result, { props: {} });
    assert.equal(ctx.res.statusCode, 200);
    assert.equal(ctx.headers.get("content-type"), "text/plain");
    assert.equal(ctx.headers.get("cache-control"), "public, max-age=60");
    assert.equal(ctx.body, "User-agent: *\nDisallow: /");
    assert.equal(seen[0].host, "site-100.test");
    assert.ok(seen[0].url.endsWith("/robots.txt"));
  } finally { globalThis.fetch = previous; }
});

test("invalid Host and transport error produce neutral no-store resource responses", async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error("should not be called"); };
    const invalid = context("");
    await createCrawlerGetServerSideProps("/sitemap.xml")(invalid);
    assert.equal(invalid.res.statusCode, 404);
    assert.equal(invalid.headers.get("cache-control"), "no-store");
    const outage = context("site-15.test");
    await createCrawlerGetServerSideProps("/sitemap.xml")(outage);
    assert.equal(outage.res.statusCode, 503);
    assert.equal(outage.headers.get("cache-control"), "no-store");
  } finally { globalThis.fetch = previous; }
});
