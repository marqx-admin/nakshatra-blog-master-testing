import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { AuthorProfile } from "./author-profile";

export function AuthorPage({ data, requestPath }: { data: components["schemas"]["AuthorPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack author-page" lang={data.site.locale_code ?? data.site.default_language}><AuthorProfile author={data.author} /><section className="author-articles"><h2>Articles by {data.author.display_name}</h2>{data.articles.length ? <ArticleCollection articles={data.articles} label={`Articles by ${data.author.display_name}`} context="AUTHOR" /> : <EmptyState title="No public articles" body="There are no published articles to show on this author page." />}</section>{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
