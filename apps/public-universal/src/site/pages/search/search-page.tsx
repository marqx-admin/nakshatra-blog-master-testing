import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { PageIntro, Pagination, SearchForm, SearchResultsRegion } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function SearchPage({ data, requestPath }: { data: components["schemas"]["SearchPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><div className="container page-stack search-page"><PageIntro h1={data.intro.h1} introText={data.intro.intro_text} /><SearchForm query={data.query} /><SearchResultsRegion articles={data.articles} state={data.search_state} summary={data.result_summary} />{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
