import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { createPublicApiClient } from "@bp/api-client-public";
import type { components } from "@bp/api-contract";
import type { AnyRenderablePageData, PageId, PublicRouteProps } from "./types";
import { resolveFixture, resolvePreviewFixture } from "../tests/fixtures/fixture-resolver";

const EXPECTED_SITE_KEY = "SITE-04";
const EXPECTED_DOMAIN = "ZodiacDaily.in";

function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }
function positiveInt(value: string | string[] | undefined, fallback: number): number { const parsed = Number.parseInt(first(value) ?? "", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }
function requestPath(ctx: GetServerSidePropsContext): string { try { return new URL(ctx.resolvedUrl, "https://frontend.invalid").pathname; } catch { return "/"; } }
function hostOf(ctx: GetServerSidePropsContext): string { return process.env.NODE_ENV !== "production" && process.env.BP_PUBLIC_HOST_OVERRIDE ? process.env.BP_PUBLIC_HOST_OVERRIDE : String(ctx.req.headers.host ?? ""); }
function forwardedProto(ctx: GetServerSidePropsContext): string { const value = first(ctx.req.headers["x-forwarded-proto"] as string | string[] | undefined); return value === "http" ? "http" : "https"; }
function apiOrigin(ctx: GetServerSidePropsContext): string { return process.env.BP_API_INTERNAL_ORIGIN || `${forwardedProto(ctx)}://${hostOf(ctx)}`; }
function copyHeader(ctx: GetServerSidePropsContext, headers: Headers, name: string) { const value = headers.get(name); if (value) ctx.res.setHeader(name, value); }
function fixtureModeEnabled(): boolean { return process.env.NODE_ENV === "test" && process.env.BP_PUBLIC_FIXTURE_MODE === "1"; }

function hasSite(data: AnyRenderablePageData): data is AnyRenderablePageData & { site: components["schemas"]["SiteIdentity"] } { return "site" in data && Boolean(data.site); }
function siteMatches(data: AnyRenderablePageData): boolean { if (!hasSite(data)) return true; return data.site.site_key === EXPECTED_SITE_KEY && data.site.canonical_domain.toLowerCase() === EXPECTED_DOMAIN.toLowerCase(); }
function failClosed(ctx: GetServerSidePropsContext, path: string): GetServerSidePropsResult<PublicRouteProps> { ctx.res.statusCode = 404; ctx.res.setHeader("Cache-Control", "no-store"); return { props: { render: { kind: "failure", status: 404, title: "Page not found", message: "The requested page is unavailable.", requestPath: path, reason: "isolation" } } }; }

export function createPublicGetServerSideProps(expectedPageIds?: readonly PageId[]) {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PublicRouteProps>> {
    const path = requestPath(ctx);
    const host = hostOf(ctx);
    const q = first(ctx.query.q);
    const page = positiveInt(ctx.query.page, 1);
    const pageSize = Math.min(50, positiveInt(ctx.query.page_size, 20));
    try {
      let response: { status: number; data?: unknown; headers: Headers };
      if (fixtureModeEnabled()) {
        const fixtureResponse = resolveFixture(host, path, q, page);
        response = { status: fixtureResponse.status, data: fixtureResponse.data, headers: new Headers(fixtureResponse.location ? { Location: fixtureResponse.location } : undefined) };
      } else {
        const client = createPublicApiClient({ baseUrl: apiOrigin(ctx), defaultInit: { cache: "no-store", headers: { "X-BP-Public-Host": host } } });
        response = await client.request("API15-PUB-001", { query: { path, ...(q !== undefined ? { q } : {}), page, page_size: pageSize } });
      }
      if (response.status === 301 || response.status === 302 || response.status === 308) {
        const destination = response.headers.get("location");
        if (!destination) throw new Error("Canonical redirect response did not include Location");
        return { redirect: { destination, statusCode: response.status } };
      }
      if (response.status === 200 || response.status === 404 || response.status === 410) {
        const data = response.data as AnyRenderablePageData;
        if (!data || !data.context || !siteMatches(data)) return failClosed(ctx, path);
        if (response.status === 200 && expectedPageIds && !expectedPageIds.includes(data.context.page_id)) {
          ctx.res.statusCode = 500; ctx.res.setHeader("Cache-Control", "no-store");
          return { props: { render: { kind: "failure", status: 500, title: "Page unavailable", message: "The public response did not match this route contract.", requestPath: path, reason: "contract" } } };
        }
        ctx.res.statusCode = response.status;
        copyHeader(ctx, response.headers, "Cache-Control");
        return { props: { render: { kind: "page", data, requestPath: path } } };
      }
      ctx.res.statusCode = response.status;
      ctx.res.setHeader("Cache-Control", "no-store");
      return { props: { render: { kind: "failure", status: response.status, title: "Page temporarily unavailable", message: "The public service could not complete this request. Please try again.", requestPath: path, reason: "transport" } } };
    } catch {
      ctx.res.statusCode = 503;
      ctx.res.setHeader("Cache-Control", "no-store");
      return { props: { render: { kind: "failure", status: 503, title: "Page temporarily unavailable", message: "The public service is currently unavailable. Please try again.", requestPath: path, reason: "transport" } } };
    }
  };
}

export function createPreviewGetServerSideProps() {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<PublicRouteProps>> {
    const path = requestPath(ctx);
    const host = hostOf(ctx);
    const postId = first(ctx.params?.post_id as string | string[] | undefined);
    ctx.res.setHeader("Cache-Control", "no-store, private");
    ctx.res.setHeader("Referrer-Policy", "no-referrer");
    if (!postId) { ctx.res.statusCode = 404; return { props: { render: { kind: "failure", status: 404, title: "Preview unavailable", message: "The private preview is unavailable.", requestPath: path, reason: "preview" } } }; }
    try {
      let response: { status: number; data?: unknown; headers: Headers };
      if (fixtureModeEnabled()) {
        const fixtureResponse = resolvePreviewFixture(host);
        response = { status: fixtureResponse.status, data: fixtureResponse.data, headers: new Headers({ "Cache-Control": "no-store" }) };
      } else {
        const cookie = first(ctx.req.headers.cookie as string | string[] | undefined) ?? "";
        const client = createPublicApiClient({ baseUrl: apiOrigin(ctx), defaultInit: { cache: "no-store", headers: { "X-BP-Public-Host": host, ...(cookie ? { Cookie: cookie } : {}) } } });
        response = await client.request("API15-PUB-002", { path: { post_id: postId } });
      }
      if (response.status === 200) {
        const data = response.data as AnyRenderablePageData;
        if (!data || !data.context || data.context.page_id !== "PUB-SYS-PREVIEW-01" || !siteMatches(data)) return failClosed(ctx, path);
        return { props: { render: { kind: "page", data, requestPath: path } } };
      }
      ctx.res.statusCode = response.status;
      return { props: { render: { kind: "failure", status: response.status, title: "Preview unavailable", message: "This private preview cannot be displayed.", requestPath: path, reason: "preview" } } };
    } catch {
      ctx.res.statusCode = 503;
      return { props: { render: { kind: "failure", status: 503, title: "Preview unavailable", message: "This private preview cannot be displayed.", requestPath: path, reason: "preview" } } };
    }
  };
}
