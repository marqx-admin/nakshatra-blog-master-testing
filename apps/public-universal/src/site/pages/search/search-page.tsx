import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { PageIntro, Pagination, SearchForm, SearchResultsRegion } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { searchPagination } from "../../lib/search-pagination";
import { messagesForLocale } from "../../lib/site-locale";
import { routeAwareHref } from "../../dev-preview/route-path";

export function SearchPage({ data, requestPath }: { data: components["schemas"]["SearchPageData"]; requestPath: string }) {
  const messages = messagesForLocale(data.site.locale_code ?? data.site.default_language ?? "en");
  const pagination = data.search_state !== "NO_QUERY" ? searchPagination(data.pagination, data.query) : undefined;
  const searchAction = routeAwareHref(requestPath, "search", "/search");
  return <><SeoHead seo={data.seo} pagination={pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><div className="container page-stack search-page" data-search-state={data.search_state} lang={data.site.locale_code ?? data.site.default_language}><PageIntro h1={messages.searchHeading} introText={data.intro.intro_text} /><SearchForm query={data.query} action={searchAction} /><SearchResultsRegion articles={data.articles} state={data.search_state} summary={data.result_summary} />{pagination ? <Pagination pagination={pagination} /> : null}</div></SiteShell></>;
}
