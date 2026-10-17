import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, PageIntro, Pagination } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function BlogPage({ data, requestPath }: { data: components["schemas"]["BlogPageData"]; requestPath: string }) {
  const laterPage = (data.pagination?.current_page ?? 1) > 1;
  return <><SeoHead seo={data.seo} pagination={data.pagination} />
    <SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>
      {data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}
      <div className="container page-stack collection-page blog-page">
        <PageIntro h1={data.intro.h1} introText={data.intro.intro_text} />
        <section className="collection-articles"><h2>Published articles</h2>
          {data.articles.length ? <ArticleCollection articles={data.articles} label="Published articles" />
            : <EmptyState title={laterPage ? "No articles on this page" : "No articles yet"} body={laterPage
              ? "There are no articles on this archive page. Use the pagination to return to an earlier page."
              : "No articles have been published on this website yet. Please check back soon."} />}
        </section>
        {data.pagination ? <Pagination pagination={data.pagination} /> : null}
      </div>
    </SiteShell>
  </>;
}
