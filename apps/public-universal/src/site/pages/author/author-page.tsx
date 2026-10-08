import type { components } from "@bp/api-contract";
import { SeoHead } from "../../components/seo-head";
import { ArticleCollection, Breadcrumbs, EmptyState, Pagination } from "../../components/semantic-components";
import { ResponsiveMedia } from "../../components/responsive-media";
import { SiteShell } from "../../shell/navigation/site-shell";

export function AuthorPage({ data, requestPath }: { data: components["schemas"]["AuthorPageData"]; requestPath: string }) {
  return <><SeoHead seo={data.seo} pagination={data.pagination} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}>{data.breadcrumbs ? <Breadcrumbs trail={data.breadcrumbs} /> : null}<div className="container page-stack author-page"><header className="author-intro">{data.author.avatar_media ? <ResponsiveMedia media={data.author.avatar_media} /> : <span className="avatar-fallback large" aria-hidden="true">{data.author.display_name.split(/\s+/).slice(0,2).map((p) => p[0]).join("")}</span>}<div><p className="eyebrow">Author</p><h1>{data.author.display_name}</h1>{data.author.designation ? <p className="author-designation">{data.author.designation}</p> : null}{data.author.bio ? <p>{data.author.bio}</p> : null}{data.author.expertise.length ? <ul className="expertise-list">{data.author.expertise.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div></header>{data.articles.length ? <ArticleCollection articles={data.articles} /> : <EmptyState title="No public articles" body="This author profile exists, but it currently has no eligible articles." />}{data.pagination ? <Pagination pagination={data.pagination} /> : null}</div></SiteShell></>;
}
