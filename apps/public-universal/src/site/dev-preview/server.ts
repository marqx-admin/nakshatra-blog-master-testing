import { isIP } from "node:net";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { AnyRenderablePageData, PublicRouteProps } from "../lib/types";
import type { PreviewPage } from "./preview-types";

export interface DevelopmentPreviewProps extends PublicRouteProps {
  previewPage: PreviewPage;
}

function isPreviewPage(value: string): value is PreviewPage {
  return /^(home|blog|article|category|tag|author|search|about|contact|not-found|gone)$/.test(value);
}

function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) return false;
  if (isIP(address) === 4) return address.startsWith("127.");
  const normalized = address.toLowerCase();
  return isIP(address) === 6 && (normalized === "::1" || normalized.startsWith("::ffff:127."));
}

function isLoopbackHost(hostHeader: string | undefined): boolean {
  if (!hostHeader) return false;
  try {
    const url = new URL(`http://${hostHeader}`);
    return !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash
      && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

interface PreviewDataModule {
  getPreviewPageData(page: PreviewPage): AnyRenderablePageData;
  getPreviewRequestPath(page: PreviewPage): string;
}

export async function getDevelopmentPreviewProps(
  context: GetServerSidePropsContext,
  environment = process.env.NODE_ENV,
): Promise<GetServerSidePropsResult<DevelopmentPreviewProps>> {
  if (
    environment !== "development"
    || !isLoopbackHost(context.req.headers.host)
    || !isLoopbackAddress(context.req.socket.remoteAddress)
  ) {
    return { notFound: true };
  }

  const requestedPage = context.query.page;
  if (requestedPage !== undefined && (typeof requestedPage !== "string" || !isPreviewPage(requestedPage))) {
    return { notFound: true };
  }

  const page = requestedPage ?? "home";
  const requireFromApp = createRequire(resolve(process.cwd(), "package.json"));
  const dataModule: PreviewDataModule = requireFromApp(resolve(process.cwd(), "src/site/dev-preview/preview-data.ts"));
  context.res.setHeader("Cache-Control", "private, no-store");
  context.res.setHeader("X-Robots-Tag", "noindex, nofollow");

  return {
    props: {
      previewPage: page,
      render: {
        kind: "page",
        data: dataModule.getPreviewPageData(page),
        requestPath: dataModule.getPreviewRequestPath(page),
      },
    },
  };
}
