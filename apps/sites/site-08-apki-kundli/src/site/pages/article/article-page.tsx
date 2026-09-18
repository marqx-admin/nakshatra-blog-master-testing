import type { components } from "@bp/api-contract";
import { ArticleBodyRenderer } from "../../components/article-body";
import { SeoHead } from "../../components/seo-head";
import { ArticleAuthorBlock, ArticleFeaturedMedia, ArticleHeader, ArticleMeta, ArticleTagList, Breadcrumbs, RelatedPostsSection } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function ArticlePage({ data, requestPath }: { data: components["schemas"]["ArticlePageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<article className="container article-page"><ArticleHeader article={data.article} /><ArticleMeta article={data.article} /><ArticleFeaturedMedia article={data.article} /><ArticleBodyRenderer blocks={data.article.body.blocks} /><div className="article-after"><ArticleAuthorBlock author={data.article.author} /><ArticleTagList tags={data.article.tags} />{data.related_content ? <RelatedPostsSection articles={data.related_content.articles} /> : null}</div></article></SiteShell></>;
}
