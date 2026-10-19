import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, PageIntro, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";
import { messagesForLocale } from "../../lib/site-locale";

export function BlogPage({ data, requestPath }: { data: components["schemas"]["BlogPageData"]; requestPath: string }) {
  const messages = messagesForLocale(data.site.locale_code ?? data.site.default_language ?? "en");
  const laterPage = (data.pagination?.current_page ?? 1) > 1;
  return <><SeoHead seo={data.seo} pagination={data.pagination} />
    <SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>
      {data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}
      <div className="container page-stack collection-page blog-page">
        <PageIntro h1={messages.allArticles} introText={data.intro.intro_text} />
        <section className="collection-articles"><h2>{messages.publishedArticles}</h2>
          {data.articles.length ? <ArticleCollection articles={data.articles} label={messages.publishedArticles} />
            : <EmptyState title={laterPage ? messages.noArticlesOnPage : messages.noArticlesYet} body={laterPage
              ? messages.noArticlesOnArchive
              : messages.noArticlesPublished} />}
        </section>
        {data.pagination ? <Pagination pagination={data.pagination} /> : null}
      </div>
    </SiteShell>
  </>;
}
