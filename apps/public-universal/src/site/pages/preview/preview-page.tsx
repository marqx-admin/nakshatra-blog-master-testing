import Head from "next/head";
import type { components } from "@bp/api-contract";
import { ArticleBodyRenderer } from "../../components/article-body";
import { SeoHead } from "../../components/seo-head";
import { ArticleAuthorBlock, ArticleFeaturedMedia, ArticleHeader, ArticleMeta, ArticleTagList, PreviewStatusNotice, RelatedPostsSection } from "../../components/semantic-components";
import { SiteShell } from "../../shell/navigation/site-shell";

export function PreviewPage({ data, requestPath }: { data: components["schemas"]["PreviewPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} /><Head><meta name="robots" content="noindex,nofollow,noarchive" /></Head><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><article className="container article-page preview-page"><PreviewStatusNotice preview={data.preview} /><ArticleHeader article={data.article} /><ArticleMeta article={data.article} /><ArticleFeaturedMedia article={data.article} /><ArticleBodyRenderer blocks={data.article.body.blocks} /><div className="article-after"><ArticleAuthorBlock author={data.article.author} /><ArticleTagList tags={data.article.tags} />{data.related_content ? <RelatedPostsSection articles={data.related_content.articles} /> : null}</div></article></SiteShell></>;
}
