import type { PublicRouteProps } from "../../lib/types";
import type { components } from "@bp/api-contract";
import Head from "next/head";
import { ErrorState } from "../../components/semantic-components";
import { HomePage } from "../home/home-page";
import { BlogPage } from "../blog/blog-page";
import { ArticlePage } from "../article/article-page";
import { CollectionPage } from "../collection/collection-page";
import { AuthorPage } from "../author/author-page";
import { SearchPage } from "../search/search-page";
import { StaticInformationPage } from "../static/static-page";
import { PreviewPage } from "../preview/preview-page";
import { SystemPage } from "../system/system-page";

export function PublicRoutePage(props: PublicRouteProps) {
  return <>{props.privateSitePreview ? <aside className="website-preview-notice" aria-label="Private website preview"><strong>Private website preview</strong><span>Saved content · public activation unchanged · noindex</span><a href="/_preview/site?exit=1">Exit preview</a></aside> : null}<RouteContent {...props}/></>;
}

function RouteContent({ render }: PublicRouteProps) {
  if (render.kind === "failure") return <><Head><title>{render.title}</title><meta name="robots" content="noindex,nofollow" /></Head><main id="main-content" className="neutral-system-shell"><div className="container system-page"><ErrorState title={render.title} body={render.message} /></div></main></>;
  const data = render.data;
  switch (data.context.page_id) {
    case "PUB-HOME-01": return <HomePage data={data as components["schemas"]["HomePageData"]} requestPath={render.requestPath} />;
    case "PUB-BLOG-01": return <BlogPage data={data as components["schemas"]["BlogPageData"]} requestPath={render.requestPath} />;
    case "PUB-ARTICLE-01": return <ArticlePage data={data as components["schemas"]["ArticlePageData"]} requestPath={render.requestPath} />;
    case "PUB-CATEGORY-01":
    case "PUB-TAG-01": return <CollectionPage data={data as components["schemas"]["CategoryPageData"] | components["schemas"]["TagPageData"]} requestPath={render.requestPath} />;
    case "PUB-AUTHOR-01": return <AuthorPage data={data as components["schemas"]["AuthorPageData"]} requestPath={render.requestPath} />;
    case "PUB-SEARCH-01": return <SearchPage data={data as components["schemas"]["SearchPageData"]} requestPath={render.requestPath} />;
    case "PUB-STATIC-ABOUT-01":
    case "PUB-STATIC-CONTACT-01":
    case "PUB-STATIC-PRIVACY-01":
    case "PUB-STATIC-TERMS-01":
    case "PUB-STATIC-DISCLAIMER-01": return <StaticInformationPage data={data as components["schemas"]["StaticPageData"]} requestPath={render.requestPath} />;
    case "PUB-SYS-PREVIEW-01": return <PreviewPage data={data as components["schemas"]["PreviewPageData"]} requestPath={render.requestPath} />;
    case "PUB-SYS-404-01":
    case "PUB-SYS-410-01": return <SystemPage data={data as components["schemas"]["NotFoundPageData"] | components["schemas"]["GonePageData"]} requestPath={render.requestPath} />;
  }
}
