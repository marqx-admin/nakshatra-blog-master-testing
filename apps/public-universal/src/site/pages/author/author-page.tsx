import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { AuthorProfile } from "./author-profile";
import { messagesForLocale } from "../../lib/site-locale";

export function AuthorPage({ data, requestPath }: { data: components["schemas"]["AuthorPageData"]; requestPath: string }) {
  const messages = messagesForLocale(data.site.locale_code ?? data.site.default_language ?? "en");
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack author-page" lang={data.site.locale_code ?? data.site.default_language}><AuthorProfile author={data.author} /><section className="author-articles"><h2>{messages.articlesBy(data.author.display_name)}</h2>{data.articles.length ? <ArticleCollection articles={data.articles} label={messages.articlesBy(data.author.display_name)} context="AUTHOR" /> : <EmptyState title={messages.noPublicArticles} body={messages.noPublishedArticlesForAuthor} />}</section>{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
