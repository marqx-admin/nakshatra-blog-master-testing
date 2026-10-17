import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { createPublicApiClient } from "@bp/api-client-public";
import type { PageId, PublicRouteProps } from "./types";
import { validatePageData } from "./response-validation";
import { validIncomingHost } from "./host";

function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }
function positiveInt(value: string | string[] | undefined, fallback: number): number { const parsed = Number.parseInt(first(value) ?? "", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function requestPath(ctx: GetServerSidePropsContext): string { try { return new URL(ctx.resolvedUrl, "https://frontend.invalid").pathname; } catch { return "/"; } }
function incomingHost(ctx: GetServerSidePropsContext): string { return String(ctx.req.headers.host ?? "").trim(); }
function apiOrigin(): string { return process.env.BP_API_INTERNAL_ORIGIN || "http://api:8080"; }
function copyHeader(ctx: GetServerSidePropsContext, headers: Headers, name: string): void { const value = headers.get(name); if (value) ctx.res.setHeader(name, value); }
const WEBSITE_PREVIEW_COOKIE = "__Host-bp_website_preview";
function websitePreviewCookie(ctx: GetServerSidePropsContext): string | undefined {
  return ctx.req.headers.cookie?.split(";").map(part => part.trim()).find(part => part.startsWith(`${WEBSITE_PREVIEW_COOKIE}=`));
}
function privatePreviewHeaders(ctx: GetServerSidePropsContext): void {
  ctx.res.setHeader("Cache-Control", "no-store, private");
  ctx.res.setHeader("Referrer-Policy", "no-referrer");
  ctx.res.setHeader("X-Robots-Tag", "noindex, nofollow");
}

function failure(ctx: GetServerSidePropsContext, path: string, status: number, reason: "transport" | "isolation" | "contract" | "preview"): GetServerSidePropsResult<PublicRouteProps> {
  ctx.res.statusCode = status;
  ctx.res.setHeader("Cache-Control", "no-store");
  if (reason === "preview") ctx.res.setHeader("Referrer-Policy", "no-referrer");
  const preview = reason === "preview";
  return { props: { ...(reason === "preview" && (websitePreviewCookie(ctx) || path === "/_preview/site") ? { privateSitePreview: true } : {}), render: { kind: "failure", status, title: preview ? "Preview unavailable" : status === 404 ? "Page not found" : "Page temporarily unavailable", message: preview ? "This private preview cannot be displayed." : status === 404 ? "The requested page is unavailable." : "The public service could not complete this request.", requestPath: path, reason } } };
}

export function createPublicGetServerSideProps(expectedPageIds?: readonly PageId[]) {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PublicRouteProps>> {
    const path = requestPath(ctx);
    const host = incomingHost(ctx);
    if (!validIncomingHost(host)) return failure(ctx, path, 404, "isolation");
    const q = first(ctx.query.q);
    const page = positiveInt(ctx.query.page, 1);
    const pageSize = Math.min(50, positiveInt(ctx.query.page_size, 20));
    const previewCookie = websitePreviewCookie(ctx);
    if (previewCookie) privatePreviewHeaders(ctx);
    try {
      const client = createPublicApiClient({ baseUrl: apiOrigin(), defaultInit: { cache: "no-store", headers: { "X-BP-Public-Host": host, ...(previewCookie ? { Cookie: previewCookie } : {}) } } });
      const response = await client.request(previewCookie ? "API15-PUB-003" : "API15-PUB-001", { query: { path, ...(q !== undefined ? { q } : {}), page, page_size: pageSize } });
      if (response.status === 301 || response.status === 302 || response.status === 308) {
        const destination = response.headers.get("location");
        if (!destination) return failure(ctx, path, 502, "contract");
        ctx.res.setHeader("Cache-Control", "no-store");
        return { redirect: { destination, statusCode: response.status } };
      }
      if (response.status === 200 || response.status === 404 || response.status === 410) {
        const data = validatePageData(response.data, response.status, expectedPageIds, Boolean(previewCookie));
        if (!data) return failure(ctx, path, 502, "contract");
        if (previewCookie) {
          data.seo = { ...data.seo, baseline_indexability: "NOINDEX", robots: { index: false, follow: false }, structured_data: [] };
          delete data.seo.canonical_url;
        }
        ctx.res.statusCode = response.status;
        ctx.res.setHeader("Cache-Control", "no-store");
        copyHeader(ctx, response.headers, "Cache-Control");
        if (previewCookie) privatePreviewHeaders(ctx);
        return { props: { render: { kind: "page", data, requestPath: path }, ...(previewCookie ? { privateSitePreview: true } : {}) } };
      }
      return failure(ctx, path, response.status, previewCookie ? "preview" : "transport");
    } catch {
      return failure(ctx, path, 503, previewCookie ? "preview" : "transport");
    }
  };
}

export function createWebsitePreviewGetServerSideProps() {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PublicRouteProps>> {
    privatePreviewHeaders(ctx);
    const host = incomingHost(ctx);
    if (!validIncomingHost(host)) return failure(ctx, "/_preview/site", 404, "preview");
    if (first(ctx.query.exit) === "1") {
      ctx.res.setHeader("Set-Cookie", `${WEBSITE_PREVIEW_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
      return { redirect: { destination: "/", statusCode: 302 } };
    }
    const handoff = first(ctx.query.handoff);
    if (!handoff || handoff.length > 512) return failure(ctx, "/_preview/site", 401, "preview");
    try {
      const client = createPublicApiClient({ baseUrl: apiOrigin(), defaultInit: { cache: "no-store", headers: { "X-BP-Public-Host": host } } });
      const response = await client.request("API15-PUB-003", { query: { path: "/", handoff } });
      const cookie = response.headers.get("set-cookie");
      if (response.status !== 200 || !cookie || !validatePageData(response.data, 200, ["PUB-HOME-01"])) return failure(ctx, "/_preview/site", 401, "preview");
      ctx.res.setHeader("Set-Cookie", cookie);
      // Never serialize the one-time handoff or media grants from this exchange.
      return { redirect: { destination: "/", statusCode: 302 } };
    } catch { return failure(ctx, "/_preview/site", 503, "preview"); }
  };
}

export function createPreviewGetServerSideProps() {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PublicRouteProps>> {
    const path = requestPath(ctx);
    const host = incomingHost(ctx);
    const postId = first(ctx.params?.post_id as string | string[] | undefined);
    ctx.res.setHeader("Cache-Control", "no-store, private");
    ctx.res.setHeader("Referrer-Policy", "no-referrer");
    if (!postId || !validIncomingHost(host)) return failure(ctx, path, 404, "preview");
    try {
      const handoff = first(ctx.query.handoff);
      const cookie = first(ctx.req.headers.cookie as string | string[] | undefined) ?? "";
      const exchangeFetch: typeof globalThis.fetch | undefined = handoff ? async (input, init) => {
        const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const target = new URL(rawUrl);
        target.searchParams.set("handoff", handoff);
        return globalThis.fetch(target, init);
      } : undefined;
      const client = createPublicApiClient({
        baseUrl: apiOrigin(),
        ...(exchangeFetch ? { fetch: exchangeFetch } : {}),
        defaultInit: { cache: "no-store", headers: { "X-BP-Public-Host": host, ...(!handoff && cookie ? { Cookie: cookie } : {}) } },
      });
      const response = await client.request("API15-PUB-002", { path: { post_id: postId } });
      if (response.status !== 200) return failure(ctx, path, response.status, "preview");
      const data = validatePageData(response.data, 200, ["PUB-SYS-PREVIEW-01"]);
      if (!data) return failure(ctx, path, 502, "preview");
      if (handoff) {
        const setCookie = response.headers.get("set-cookie");
        if (!setCookie) return failure(ctx, path, 502, "preview");
        ctx.res.setHeader("Set-Cookie", setCookie);
        return { redirect: { destination: path, statusCode: 302 } };
      }
      ctx.res.statusCode = 200;
      return { props: { render: { kind: "page", data, requestPath: path } } };
    } catch {
      return failure(ctx, path, 503, "preview");
    }
  };
}
