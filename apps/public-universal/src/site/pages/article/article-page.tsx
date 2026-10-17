import type { components } from "@bp/api-contract";
import { ArticleBodyRenderer } from "../../components/article-body";
import { SeoHead } from "../../components/seo-head";
import { ArticleAuthorBlock, ArticleFeaturedMedia, ArticleHeader, ArticleMeta, ArticleTagList, Breadcrumbs, RelatedPostsSection } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function ArticlePage({ data, requestPath }: { data: components["schemas"]["ArticlePageData"]; requestPath: string }) {
  const hasAfterContent = Boolean(data.article.author || data.article.tags.length || data.related_content?.articles.length);
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<article className="container article-page" lang={data.site.locale_code ?? data.site.default_language}><ArticleHeader article={data.article} /><ArticleMeta article={data.article} /><ArticleFeaturedMedia article={data.article} /><ArticleBodyRenderer blocks={data.article.body.blocks} />{hasAfterContent ? <div className="article-after"><ArticleAuthorBlock author={data.article.author} /><ArticleTagList tags={data.article.tags} />{data.related_content ? <RelatedPostsSection articles={data.related_content.articles} /> : null}</div> : null}</article></SiteShell></>;
}
