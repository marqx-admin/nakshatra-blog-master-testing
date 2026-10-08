import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, CollectionIntroduction, EmptyState, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

type CollectionData = components["schemas"]["CategoryPageData"] | components["schemas"]["TagPageData"];
export function CollectionPage({ data, requestPath }: { data: CollectionData; requestPath: string }) {
  const entity = "category" in data ? data.category : data.tag;
  const marker = "category" in data ? "Category" : "Topic";
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack collection-page"><CollectionIntroduction title={entity.name} description={entity.description} marker={marker} />{data.articles.length ? <ArticleCollection articles={data.articles} /> : <EmptyState title={`No articles in ${entity.name}`} body="This public archive exists, but there are no eligible articles to show." />}{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
