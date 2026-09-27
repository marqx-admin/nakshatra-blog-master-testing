import type { ReactNode } from "react";
import type { components } from "@bp/api-contract";
import { DestinationLink } from "./destination-link";
import { ResponsiveMedia } from "./responsive-media";
import type { ArticleSummary, PaginationData, PublicDestination, RichTextData } from "../lib/types";

export function RichText({ value }: { value: RichTextData }) {
  return <>{value.runs.map((run, index) => {
    let node: ReactNode = run.text;
    if (run.marks.includes("ITALIC")) node = <em>{node}</em>;
    if (run.marks.includes("BOLD")) node = <strong>{node}</strong>;
    if (run.link) node = <DestinationLink destination={run.link}>{node}</DestinationLink>;
    return <span key={`${index}-${run.text.slice(0, 12)}`} style={{ whiteSpace: "pre-wrap" }}>{node}</span>;
  })}</>;
}

export function Breadcrumbs({ trail }: { trail: components["schemas"]["BreadcrumbTrail"] }) {
  return <nav className="breadcrumbs container" aria-label="Breadcrumb" data-component-id="CMP12-BREADCRUMBS"><ol>{trail.items.map((item) => <li key={`${item.label}-${item.is_current}`} aria-current={item.is_current ? "page" : undefined}>{item.destination && !item.is_current ? <DestinationLink destination={item.destination}>{item.label}</DestinationLink> : <span>{item.label}</span>}</li>)}</ol></nav>;
}

export function PageIntro({ h1, introText }: { h1: string; introText?: string | undefined }) {
  return <header className="page-intro" data-component-id="CMP12-PAGE-INTRO"><h1>{h1}</h1>{introText ? <p>{introText}</p> : null}</header>;
}

export function SectionHeader({ label }: { label: string }) {
  return <header className="section-header" data-component-id="CMP12-SECTION-HEADER"><span className="section-kicker" aria-hidden="true" /> <h2>{label}</h2></header>;
}

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return <article className="article-card" data-component-id="CMP12-ARTICLE-CARD">{article.featured_media ? <ResponsiveMedia media={article.featured_media} /> : null}<div className="card-body">{article.taxonomy_label ? <p className="eyebrow">{article.taxonomy_label}</p> : null}<h3><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h3>{article.excerpt ? <p>{article.excerpt}</p> : null}<p className="meta"><time dateTime={article.published_at}>{formatDate(article.published_at)}</time></p></div></article>;
}

export function FeaturedArticleCard({ article }: { article: ArticleSummary }) {
  return <article className="featured-article" data-component-id="CMP12-FEATURED-ARTICLE-CARD"><div className="featured-copy">{article.taxonomy_label ? <p className="eyebrow">{article.taxonomy_label}</p> : null}<h2><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h2>{article.excerpt ? <p>{article.excerpt}</p> : null}<p className="meta"><time dateTime={article.published_at}>{formatDate(article.published_at)}</time>{article.author ? <> <span aria-hidden="true">/</span> {article.author.display_name}</> : null}</p></div>{article.featured_media ? <ResponsiveMedia media={article.featured_media} priority className="featured-media" /> : null}</article>;
}

export function CompactArticleItem({ article }: { article: ArticleSummary }) {
  return <article className="compact-article" data-component-id="CMP12-COMPACT-ARTICLE-ITEM"><div><p className="eyebrow">{article.taxonomy_label ?? "Article"}</p><h3><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h3></div><time dateTime={article.published_at}>{formatDate(article.published_at)}</time></article>;
}

export function TaxonomyCard({ item }: { item: components["schemas"]["TaxonomySummary"] }) {
  return <article className="taxonomy-card" data-component-id="CMP12-TAXONOMY-CARD"><p className="eyebrow">{item.kind === "CATEGORY" ? "Category" : "Topic"}</p><h3><DestinationLink destination={item.destination}>{item.name}</DestinationLink></h3></article>;
}

export function AuthorCard({ author }: { author: components["schemas"]["AuthorSummary"] }) {
  return <article className="author-card" data-component-id="CMP12-AUTHOR-CARD">{author.avatar_media ? <ResponsiveMedia media={author.avatar_media} /> : <span className="avatar-fallback" aria-hidden="true">{initials(author.display_name)}</span>}<div><h3>{author.destination ? <DestinationLink destination={author.destination}>{author.display_name}</DestinationLink> : author.display_name}</h3>{author.short_bio ? <p>{author.short_bio}</p> : null}</div></article>;
}

export function ArticleCollection({ articles, label = "Articles" }: { articles: ArticleSummary[]; label?: string | undefined }) {
  return <section aria-label={label} className="article-grid" data-component-id="CMP12-ARTICLE-COLLECTION">{articles.map((article) => <ArticleCard key={article.article_id} article={article} />)}</section>;
}

export function Pagination({ pagination }: { pagination: PaginationData }) {
  return <nav className="pagination" aria-label="Pagination" data-component-id="CMP12-PAGINATION">{pagination.previous ? <DestinationLink destination={pagination.previous} className="page-step">Previous</DestinationLink> : <span />}
    <ol>{pagination.links.map((link) => <li key={link.page_number}>{link.is_current ? <span aria-current="page">{link.page_number}</span> : <DestinationLink destination={link.destination}>{link.page_number}</DestinationLink>}</li>)}</ol>
    {pagination.next ? <DestinationLink destination={pagination.next} className="page-step">Next</DestinationLink> : <span />}</nav>;
}

export function EmptyState({ title, body }: { title: string; body: string }) { return <section className="state-card" role="status" data-component-id="CMP12-EMPTY-STATE"><h2>{title}</h2><p>{body}</p></section>; }
export function ErrorState({ title, body }: { title: string; body: string }) { return <section className="state-card state-error" role="alert" data-component-id="CMP12-ERROR-STATE"><h1>{title}</h1><p>{body}</p></section>; }
export function MissingMediaFallback({ label = "Media unavailable" }: { label?: string | undefined }) { return <div className="missing-media" role="img" aria-label={label} data-component-id="CMP12-MISSING-MEDIA"><span aria-hidden="true" /> <p>{label}</p></div>; }

export function HomeLeadRegion({ article }: { article: ArticleSummary }) { return <section className="home-lead" data-component-id="CMP12-HOME-LEAD"><FeaturedArticleCard article={article} /></section>; }
export function HomeSectionContainer({ label, children }: { label?: string | undefined; children: ReactNode }) { return <section className="home-section" data-component-id="CMP12-HOME-SECTION">{label ? <SectionHeader label={label} /> : null}{children}</section>; }
export function HomeFeaturedPostsSection({ articles }: { articles: ArticleSummary[] }) { return <div className="article-grid" data-component-id="CMP12-HOME-FEATURED-POSTS">{articles.map((article) => <ArticleCard key={article.article_id} article={article} />)}</div>; }
export function HomeFeaturedCategoriesSection({ categories }: { categories: components["schemas"]["TaxonomySummary"][] }) { return <div className="taxonomy-grid" data-component-id="CMP12-HOME-FEATURED-CATEGORIES">{categories.map((item) => <TaxonomyCard key={`${item.kind}-${item.name}-${item.destination.url}`} item={item} />)}</div>; }
export function HomePrimaryArticleCollection({ articles }: { articles: ArticleSummary[] }) { return <div data-component-id="CMP12-HOME-LATEST">{articles.length ? <ArticleCollection articles={articles} label="Latest articles" /> : <EmptyState title="No articles yet" body="There are no publicly eligible articles to show right now." />}</div>; }

export function ArticleHeader({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { return <header className="article-header" data-component-id="CMP12-ARTICLE-HEADER"><h1>{article.title}</h1>{article.excerpt ? <p className="article-deck">{article.excerpt}</p> : null}</header>; }
export function ArticleMeta({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { const published = article.published_at; return <div className="article-meta" data-component-id="CMP12-ARTICLE-META">{article.author ? <span>By {article.author.display_name}</span> : null}{published ? <time dateTime={published}>{formatDate(published)}</time> : <span>Unpublished preview</span>}{article.updated_at ? <span>Updated <time dateTime={article.updated_at}>{formatDate(article.updated_at)}</time></span> : null}</div>; }
export function ArticleFeaturedMedia({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { return article.featured_media ? <figure className="article-featured-media" data-component-id="CMP12-ARTICLE-FEATURED-MEDIA"><ResponsiveMedia media={article.featured_media} priority />{article.featured_media.caption ? <figcaption>{article.featured_media.caption}</figcaption> : null}</figure> : null; }
export function ArticleAuthorBlock({ author }: { author?: components["schemas"]["AuthorSummary"] | undefined }) { return author ? <aside className="article-author" data-component-id="CMP12-ARTICLE-AUTHOR" aria-label="Author"><AuthorCard author={author} /></aside> : null; }
export function ArticleTagList({ tags }: { tags: components["schemas"]["TaxonomySummary"][] }) { return tags.length ? <nav className="tag-list" aria-label="Article topics" data-component-id="CMP12-ARTICLE-TAGS">{tags.map((tag) => <DestinationLink key={`${tag.name}-${tag.destination.url}`} destination={tag.destination}>{tag.name}</DestinationLink>)}</nav> : null; }
export function RelatedPostsSection({ articles }: { articles: ArticleSummary[] }) { return articles.length ? <section className="related-posts" data-component-id="CMP12-RELATED-POSTS"><SectionHeader label="Related reading" />{articles.map((article) => <CompactArticleItem key={article.article_id} article={article} />)}</section> : null; }

export function CollectionIntroduction({ title, description, marker }: { title: string; description?: string | undefined; marker?: string | undefined }) { return <header className="collection-intro" data-component-id="CMP12-COLLECTION-INTRO">{marker ? <p className="eyebrow">{marker}</p> : null}<h1>{title}</h1>{description ? <p>{description}</p> : null}</header>; }
export function SearchForm({ query }: { query: string }) { return <form className="search-form" method="get" action="/search" role="search" data-component-id="CMP12-SEARCH-FORM"><label htmlFor="site-search-query">Search this site</label><div className="search-row"><input id="site-search-query" name="q" type="search" defaultValue={query} placeholder="Search published articles" autoComplete="off" /><button type="submit">Search</button>{query ? <a href="/search" className="button-secondary">Clear</a> : null}</div></form>; }
export function SearchResultsRegion({ articles, state, summary }: { articles: ArticleSummary[]; state: "NO_QUERY" | "RESULTS" | "EMPTY"; summary: string }) { return <section className="search-results" aria-live="polite" data-component-id="CMP12-SEARCH-RESULTS"><p className="result-summary">{summary}</p>{state === "NO_QUERY" ? <EmptyState title="Start a search" body="Enter a query to search publicly eligible articles on this site." /> : state === "EMPTY" ? <EmptyState title="No results" body="No matching public articles were found. Try a different query." /> : <ArticleCollection articles={articles} label="Search results" />}</section>; }

export function StaticInformationBody({ content, contactInfo }: { content: components["schemas"]["StaticContent"]; contactInfo?: components["schemas"]["ContactInfo"] | undefined }) { return <div className="static-body" data-component-id="CMP12-STATIC-BODY">{content.intro_text ? <p className="static-intro">{content.intro_text}</p> : null}{content.sections.map((section, index) => <section key={`${section.heading ?? "section"}-${index}`}>{section.heading ? <h2>{section.heading}</h2> : null}{section.paragraphs.map((paragraph, pIndex) => <p key={pIndex}><RichText value={paragraph} /></p>)}{section.list_items.length ? <ul>{section.list_items.map((item, itemIndex) => <li key={itemIndex}><RichText value={item} /></li>)}</ul> : null}</section>)}{contactInfo ? <address className="contact-info">{contactInfo.items.map((item) => <div key={`${item.kind}-${item.label}`}><strong>{item.label}</strong>{item.destination ? <DestinationLink destination={item.destination}>{item.display_value}</DestinationLink> : <span>{item.display_value}</span>}</div>)}</address> : null}</div>; }
export function PreviewStatusNotice({ preview }: { preview: components["schemas"]["PreviewMeta"] }) { return <aside className="preview-status" role="status" data-component-id="CMP12-PREVIEW-STATUS"><strong>Private preview</strong><span>{preview.notice_text}</span><small>{preview.lifecycle_status} / {preview.source_kind}</small></aside>; }
export function SystemMessageView({ code, title, body }: { code: 404 | 410; title: string; body: string }) { return <section className="system-message" data-component-id="CMP12-SYSTEM-MESSAGE"><p className="system-code">{code}</p><h1>{title}</h1><p>{body}</p></section>; }
export function RecoveryActions({ home, search }: { home?: PublicDestination | undefined; search?: PublicDestination | undefined }) { return home || search ? <nav className="recovery-actions" aria-label="Recovery actions" data-component-id="CMP12-RECOVERY-ACTIONS">{home ? <DestinationLink destination={home} className="button-primary">Go to home</DestinationLink> : null}{search ? <DestinationLink destination={search} className="button-secondary">Search this site</DestinationLink> : null}</nav> : null; }

export function formatDate(value: string): string { const date = new Date(value); if (Number.isNaN(date.valueOf())) return value; return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date); }
export function initials(value: string): string { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "A"; }
