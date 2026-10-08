import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { validIncomingHost } from "./host";

// Existing WU-02 crawler resources are served by the API under authoritative Host resolution.
export function createCrawlerGetServerSideProps(resourcePath: string) {
  return async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Record<string, never>>> {
    const host = String(ctx.req.headers.host ?? "").trim();
    ctx.res.setHeader("Cache-Control", "no-store");
    if (!validIncomingHost(host)) {
      ctx.res.statusCode = 404;
      ctx.res.end();
      return { props: {} };
    }
    try {
      const origin = process.env.BP_API_INTERNAL_ORIGIN || "http://api:8080";
      const target = new URL(resourcePath, origin.endsWith("/") ? origin : `${origin}/`);
      const response = await fetch(target, { cache: "no-store", redirect: "manual", headers: { "X-BP-Public-Host": host } });
      ctx.res.statusCode = response.status;
      const contentType = response.headers.get("content-type");
      const cacheControl = response.headers.get("cache-control");
      if (contentType) ctx.res.setHeader("Content-Type", contentType);
      if (cacheControl) ctx.res.setHeader("Cache-Control", cacheControl);
      ctx.res.end(await response.text());
    } catch {
      ctx.res.statusCode = 503;
      ctx.res.end();
    }
    return { props: {} };
  };
}
