import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { PageIntro, Pagination, SearchForm, SearchResultsRegion } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { searchPagination } from "../../lib/search-pagination";

export function SearchPage({ data, requestPath }: { data: components["schemas"]["SearchPageData"]; requestPath: string }) {
  const pagination = data.search_state !== "NO_QUERY" ? searchPagination(data.pagination, data.query) : undefined;
  return <><SeoHead seo={data.seo} pagination={pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><div className="container page-stack search-page" data-search-state={data.search_state} lang={data.site.locale_code ?? data.site.default_language}><PageIntro h1={data.intro.h1} introText={data.intro.intro_text} /><SearchForm query={data.query} /><SearchResultsRegion articles={data.articles} state={data.search_state} summary={data.result_summary} />{pagination ? <Pagination pagination={pagination} /> : null}</div></SiteShell></>;
}
