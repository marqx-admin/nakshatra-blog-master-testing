import type { components } from "@bp/api-contract";

export type PageId = components["schemas"]["PageContext"]["page_id"];
export type PublicPageData = components["schemas"]["PublicPageResponse"];
export type PreviewPageData = components["schemas"]["PreviewPageData"];
export type NotFoundPageData = components["schemas"]["NotFoundPageData"];
export type GonePageData = components["schemas"]["GonePageData"];
export type AnyRenderablePageData = PublicPageData | PreviewPageData | NotFoundPageData | GonePageData;
export type SiteIdentity = components["schemas"]["SiteIdentity"];
export type PublicSettings = components["schemas"]["PublicSettings"];
export type NavigationBundle = components["schemas"]["NavigationBundle"];
export type PublicDestination = components["schemas"]["PublicDestination"];
export type PublicMedia = components["schemas"]["PublicMedia"];
export type SeoProjection = components["schemas"]["SeoProjection"];
export type PaginationData = components["schemas"]["Pagination"];
export type ArticleSummary = components["schemas"]["ArticleSummary"];
export type ArticleBlock = components["schemas"]["ArticleBlock"];
export type RichTextData = components["schemas"]["RichText"];

export type PublicRouteRender =
  | { kind: "page"; data: AnyRenderablePageData; requestPath: string }
  | { kind: "failure"; status: number; title: string; message: string; requestPath: string; reason: "transport" | "isolation" | "contract" | "preview" };

export interface PublicRouteProps {
  render: PublicRouteRender;
  privateSitePreview?: boolean;
}
