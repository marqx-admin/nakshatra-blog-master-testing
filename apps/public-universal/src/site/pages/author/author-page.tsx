import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { AuthorProfile } from "./author-profile";

export function AuthorPage({ data, requestPath }: { data: components["schemas"]["AuthorPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack author-page"><AuthorProfile author={data.author} />{data.articles.length ? <ArticleCollection articles={data.articles} context="AUTHOR" /> : <EmptyState title="No public articles" body="This author profile exists, but it currently has no eligible articles." />}{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
