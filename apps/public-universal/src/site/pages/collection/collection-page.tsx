import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, CollectionIntroduction, EmptyState, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

type CollectionData = components["schemas"]["CategoryPageData"] | components["schemas"]["TagPageData"];
export function CollectionPage({ data, requestPath }: { data: CollectionData; requestPath: string }) {
  const entity = "category" in data ? data.category : data.tag;
  const marker = "category" in data ? "Category" : "Topic";
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack collection-page" lang={data.site.locale_code ?? data.site.default_language}><CollectionIntroduction title={entity.name} description={entity.description} marker={marker} /><section className="collection-articles"><h2>Articles</h2>{data.articles.length ? <ArticleCollection articles={data.articles} label={`Articles: ${entity.name}`} context={marker === "Category" ? "CATEGORY" : "TAG"} /> : <EmptyState title={`No articles in ${entity.name}`} body="There are no published articles to show on this archive page." />}</section>{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
