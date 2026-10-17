import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/wu03-ssr-test.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/lib/ssr.ts")], outfile: output, platform: "node", format: "esm", bundle: true, logLevel: "silent" });
const { createPublicGetServerSideProps, createPreviewGetServerSideProps, createWebsitePreviewGetServerSideProps } = await import(pathToFileURL(output).href);

function context(host, path, query = {}, params = {}) {
  const headers = new Map();
  return {
    req: { headers: { host } },
    res: { statusCode: 200, setHeader: (name, value) => headers.set(name.toLowerCase(), value) },
    resolvedUrl: path, query, params, headers,
  };
}
const destination = { kind: "HOME", url: "/", is_external: false };
const navigation = { header: { menu_key: "HEADER", items: [] }, footer: { menu_key: "FOOTER", items: [] } };
const seo = { baseline_indexability: "INDEX-ELIGIBLE", title: "Home", robots: { index: true, follow: true }, structured_data: [] };
function home(siteKey) {
  return { context: { page_id: "PUB-HOME-01", page_kind: "CONTENT", render_mode: "PUBLIC" },
    site: { site_key: siteKey, display_name: siteKey, canonical_domain: `${siteKey.toLowerCase()}.test`, home_destination: destination, timezone_id: "UTC" },
    settings: { social_profiles: [] }, navigation, presentation: { source: "SAFE_DEFAULT", config: { schema_version: 1, style_id: "STYLE_01" } },
    intro: { h1: "Home" }, sections: [], latest_articles: [], seo };
}
function staticDraft(siteKey) {
  return { context: { page_id: "PUB-STATIC-ABOUT-01", page_kind: "STATIC", render_mode: "PUBLIC" },
    site: { ...home(siteKey).site }, settings: { social_profiles: [] }, navigation,
    presentation: { source: "SAFE_DEFAULT", config: { schema_version: 1, style_id: "STYLE_01" } },
    content: { static_key: "ABOUT", title: "About [Website Name].", sections: [] }, seo };
}
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...headers } });

test("actual SSR forwards each incoming Host and never selects a compiled tenant", async () => {
  const original = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    const host = new Headers(init.headers).get("X-BP-Public-Host");
    seen.push({ host, url: String(url) });
    return json(home(host.startsWith("site-15") ? "SITE-15" : "SITE-100"), 200, { "cache-control": "private, max-age=0" });
  };
  try {
    const load = createPublicGetServerSideProps(["PUB-HOME-01"]);
    const a = context("site-15.test", "/");
    const b = context("site-100.test", "/");
    const first = await load(a);
    const second = await load(b);
    assert.equal(first.props.render.data.site.site_key, "SITE-15");
    assert.equal(second.props.render.data.site.site_key, "SITE-100");
    assert.deepEqual(seen.map((entry) => entry.host), ["site-15.test", "site-100.test"]);
    assert.ok(seen.every((entry) => entry.url.includes("/api/v1/public/page?")));
    assert.equal(a.headers.get("cache-control"), "private, max-age=0");
    assert.equal(b.headers.get("cache-control"), "private, max-age=0");
  } finally { globalThis.fetch = original; }
});

test("unknown Host stays neutral; known 404 and 410 preserve status and PageData", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const host = new Headers(init.headers).get("X-BP-Public-Host");
    const code = host === "gone.test" ? 410 : 404;
    const base = { context: { page_id: code === 410 ? "PUB-SYS-410-01" : "PUB-SYS-404-01", page_kind: "SYSTEM", render_mode: "SYSTEM" },
      message: { code, title: code === 410 ? "Gone" : "Not found", body: "Unavailable" },
      seo: { ...seo, robots: { index: false, follow: false } } };
    return json(host === "unknown.test" ? base : { ...base, site: home("SITE-15").site, settings: { social_profiles: [] }, navigation }, code);
  };
  try {
    const load = createPublicGetServerSideProps();
    for (const [host, status, known] of [["unknown.test", 404, false], ["known.test", 404, true], ["gone.test", 410, true]]) {
      const ctx = context(host, "/missing");
      const result = await load(ctx);
      assert.equal(ctx.res.statusCode, status);
      assert.equal(result.props.render.data.site?.site_key, known ? "SITE-15" : undefined);
    }
  } finally { globalThis.fetch = original; }
});

test("invalid contract and transport errors fail closed without a previous site shell", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => json({ ...home("SITE-100"), navigation: undefined });
    const bad = context("site-100.test", "/");
    const invalid = await createPublicGetServerSideProps(["PUB-HOME-01"])(bad);
    assert.equal(bad.res.statusCode, 502);
    assert.equal(invalid.props.render.kind, "failure");
    globalThis.fetch = async () => { throw new Error("offline"); };
    const outage = context("site-15.test", "/");
    const failed = await createPublicGetServerSideProps()(outage);
    assert.equal(outage.res.statusCode, 503);
    assert.equal(failed.props.render.kind, "failure");
    assert.equal(outage.headers.get("cache-control"), "no-store");
  } finally { globalThis.fetch = original; }
});

test("canonical redirects preserve status, while missing Host never calls the API", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 308, headers: { location: "https://canonical.example.test/article/story" } });
  };
  try {
    const load = createPublicGetServerSideProps();
    const redirected = await load(context("alias.example.test", "/article/story"));
    assert.equal(redirected.redirect.statusCode, 308);
    assert.equal(redirected.redirect.destination, "https://canonical.example.test/article/story");
    const missing = context("", "/");
    const neutral = await load(missing);
    assert.equal(neutral.props.render.kind, "failure");
    assert.equal(missing.res.statusCode, 404);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test("Preview handoff forwards Host, receives secure cookie, then renders only backend-authorized PageData", async () => {
  const original = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init) => {
    const headers = new Headers(init.headers);
    seen.push({ host: headers.get("X-BP-Public-Host"), cookie: headers.get("Cookie"), url: String(url) });
    const body = { ...home("SITE-100"), context: { page_id: "PUB-SYS-PREVIEW-01", page_kind: "PREVIEW", render_mode: "PREVIEW" },
      seo: { ...seo, robots: { index: false, follow: false } },
      preview: { lifecycle_status: "DRAFT", source_kind: "COMMITTED", notice_text: "Private" },
      article: { article_id: "post-1", title: "Draft", body: { content_schema_version: "1", blocks: [] }, tags: [], categories: [] } };
    return json(body, 200, { "set-cookie": "preview=session; HttpOnly; Secure; SameSite=Lax" });
  };
  try {
    const preview = createPreviewGetServerSideProps();
    const handoff = context("site-100.test", "/_preview/post/post-1?handoff=one-time", { handoff: "one-time" }, { post_id: "post-1" });
    const exchanged = await preview(handoff);
    assert.equal(exchanged.redirect.statusCode, 302);
    assert.equal(handoff.headers.get("set-cookie"), "preview=session; HttpOnly; Secure; SameSite=Lax");
    const session = context("site-100.test", "/_preview/post/post-1", {}, { post_id: "post-1" });
    session.req.headers.cookie = "preview=session";
    const rendered = await preview(session);
    assert.equal(rendered.props.render.data.context.page_id, "PUB-SYS-PREVIEW-01");
    assert.equal(session.headers.get("referrer-policy"), "no-referrer");
    assert.equal(session.headers.get("cache-control"), "no-store, private");
    assert.deepEqual(seen.map((call) => call.host), ["site-100.test", "site-100.test"]);
    assert.ok(seen[0].url.includes("handoff=one-time"));
    assert.equal(seen[1].cookie, "preview=session");
  } finally { globalThis.fetch = original; }
});


test("W4 website handoff exchanges only on the actual tenant Host, stores a private cookie and removes the URL secret", async () => {
  const original=globalThis.fetch;
  globalThis.fetch=async(url,init)=>{
    assert.equal(new Headers(init.headers).get("X-BP-Public-Host"),"site-15.test");
    assert.equal(new Headers(init.headers).get("Cookie"),null);
    assert.equal(new URL(url).pathname,"/api/v1/public/preview/website");
    assert.equal(new URL(url).searchParams.get("handoff"),"one-time-secret");
    return json(home("SITE-15"),200,{"set-cookie":"__Host-bp_website_preview=session; Path=/; Secure; HttpOnly; SameSite=Strict"});
  };
  try {
    const ctx=context("site-15.test","/_preview/site?handoff=one-time-secret",{handoff:"one-time-secret"});
    const result=await createWebsitePreviewGetServerSideProps()(ctx);
    assert.deepEqual(result,{redirect:{destination:"/",statusCode:302}});
    assert.match(ctx.headers.get("set-cookie"),/Secure; HttpOnly/);
    assert.equal(ctx.headers.get("x-robots-tag"),"noindex, nofollow");
    assert.doesNotMatch(JSON.stringify(result),/one-time-secret/);
  } finally {globalThis.fetch=original;}
});

test("W4 whole-site navigation remains private and a denied grant never retries the ordinary public endpoint", async () => {
  const original=globalThis.fetch;let denied=false;const paths=[];
  globalThis.fetch=async(url,init)=>{
    paths.push(new URL(url).pathname);
    assert.equal(new Headers(init.headers).get("Cookie"),"__Host-bp_website_preview=session");
    return denied?json({error:{code:"UNAUTHENTICATED"}},401):json(home("SITE-15"));
  };
  try {
    const ctx=context("site-15.test","/");ctx.req.headers.cookie="__Host-bp_admin_session=never-forward; __Host-bp_website_preview=session";
    const result=await createPublicGetServerSideProps()(ctx);
    assert.equal(result.props.privateSitePreview,true);
    assert.deepEqual(result.props.render.data.seo.robots,{index:false,follow:false});
    assert.equal(ctx.headers.get("cache-control"),"no-store, private");
    denied=true;const failure=await createPublicGetServerSideProps()(ctx);
    assert.equal(failure.props.render.reason,"preview");
    assert.equal(failure.props.privateSitePreview,true);
    assert.deepEqual(paths,["/api/v1/public/preview/website","/api/v1/public/preview/website"]);
  } finally {globalThis.fetch=original;}
});

test("whole-site preview accepts saved empty static drafts only with its private cookie", async () => {
  const original = globalThis.fetch;
  const paths = [];
  globalThis.fetch = async (url, init) => {
    paths.push(new URL(url).pathname);
    return json(staticDraft("SITE-15"));
  };
  try {
    const ctx = context("site-15.test", "/about");
    ctx.req.headers.cookie = "__Host-bp_website_preview=session";
    const preview = await createPublicGetServerSideProps()(ctx);
    assert.equal(preview.props.privateSitePreview, true);
    assert.equal(preview.props.render.data.content.title, "About [Website Name].");
    assert.deepEqual(preview.props.render.data.content.sections, []);
    assert.deepEqual(ctx.headers.get("x-robots-tag"), "noindex, nofollow");

    const publicResult = await createPublicGetServerSideProps()(context("site-15.test", "/about"));
    assert.equal(publicResult.props.render.kind, "failure");
    assert.equal(publicResult.props.render.reason, "contract");
    assert.deepEqual(paths, ["/api/v1/public/preview/website", "/api/v1/public/page"]);
  } finally { globalThis.fetch = original; }
});

test("W4 exit clears only the website-preview cookie without a network operation", async()=>{
  const original=globalThis.fetch;globalThis.fetch=()=>{throw Error("unexpected request");};
  try {
    const ctx=context("site-15.test","/_preview/site?exit=1",{exit:"1"});
    assert.deepEqual(await createWebsitePreviewGetServerSideProps()(ctx),{redirect:{destination:"/",statusCode:302}});
    assert.match(ctx.headers.get("set-cookie"),/__Host-bp_website_preview=; Path=\/; Max-Age=0/);
  } finally {globalThis.fetch=original;}
});
