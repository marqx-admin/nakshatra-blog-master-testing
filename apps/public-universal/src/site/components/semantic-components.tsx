import { useContext, type ReactNode } from "react";
import type { components } from "@bp/api-contract";
import { DestinationLink } from "./destination-link";
import { ResponsiveMedia } from "./responsive-media";
import type { ArticleSummary, PaginationData, PublicDestination, PublicMedia, RichTextData } from "../lib/types";
import { articleCardLayout, authorLayout, cardNeedsMedia, categoryLayout, collectionLayout, heroLayout, imageTreatment, leadVariant } from "@bp/presentation-catalogue";
import { ResolvedAppearanceContext, useDesign } from "../lib/design-context";
import { formatSiteDate, useSiteLocale, useSiteMessages } from "../lib/site-locale";
export { DesignContext } from "../lib/design-context";

function mediaFrameRatio(media: PublicMedia, ratio: string): string {
  if (ratio !== "auto") return ratio;
  return media.width && media.height && media.width > 0 && media.height > 0
    ? `${media.width} / ${media.height}` : "16 / 9";
}

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
  const messages = useSiteMessages();
  return <nav className="breadcrumbs container" aria-label={messages.breadcrumb}><ol>{trail.items.map((item) => <li key={`${item.label}-${item.is_current}`} aria-current={item.is_current ? "page" : undefined}>{item.destination && !item.is_current ? <DestinationLink destination={item.destination}>{item.label}</DestinationLink> : <span>{item.label}</span>}</li>)}</ol></nav>;
}

export function PageIntro({ h1, introText }: { h1: string; introText?: string | undefined }) {
  return <header className="page-intro"><h1>{h1}</h1>{introText ? <p>{introText}</p> : null}</header>;
}

export function SectionHeader({ label }: { label: string }) {
  return <header className="section-header"><span className="section-kicker" aria-hidden="true" /> <h2>{label}</h2></header>;
}

export function ArticleCard({ article, profileId, imageId }: { article: ArticleSummary; profileId?: ReturnType<typeof useDesign>["articleCard"]; imageId?: ReturnType<typeof useDesign>["image"] }) {
  const design = useDesign();
  const { locale, timeZone } = useSiteLocale();
  const requested = profileId ?? design.articleCard;
  const profile = cardNeedsMedia(requested) && !article.featured_media ? "CARD-15" : requested;
  const imageProfile = imageId ?? design.image;
  const image = imageTreatment(imageProfile);
  const hasMedia = Boolean(article.featured_media && articleCardLayout(profile) !== "text");
  return <article className="article-card" data-card={profile} data-layout={articleCardLayout(profile)} data-image={imageProfile} data-has-media={hasMedia}>
    {article.featured_media && hasMedia ? <figure className="card-media"><div className="card-media-frame" style={{ aspectRatio: mediaFrameRatio(article.featured_media, image.ratio) }}><ResponsiveMedia media={article.featured_media} /></div>{imageProfile === "IMG-11" && article.featured_media.caption ? <figcaption className="media-caption">{article.featured_media.caption}</figcaption> : null}</figure> : null}
    <div className="card-body">{article.taxonomy_label ? <p className="eyebrow">{article.taxonomy_label}</p> : null}<h3><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h3>{article.excerpt && !["CARD-02", "CARD-07", "CARD-10", "CARD-28"].includes(profile) ? <p>{article.excerpt}</p> : null}<p className="meta"><time dateTime={article.published_at}>{formatDate(article.published_at, locale, timeZone)}</time>{profile === "CARD-19" && article.author ? <> · {article.author.display_name}</> : null}</p></div>
  </article>;
}

export function FeaturedArticleCard({ article }: { article: ArticleSummary }) {
  const design = useDesign();
  const { locale, timeZone } = useSiteLocale();
  const profile = !article.featured_media && ["HERO-05", "HERO-06", "HERO-20", "HERO-26"].includes(design.hero) ? "HERO-14" : design.hero;
  const hasMedia = Boolean(article.featured_media && heroLayout(profile) !== "text");
  const image = imageTreatment(design.heroImage);
  return <article className="featured-article" data-hero={profile} data-layout={heroLayout(profile)} data-lead={leadVariant(profile)} data-has-media={hasMedia}><div className="featured-copy">{article.taxonomy_label ? <p className="eyebrow">{article.taxonomy_label}</p> : null}<h2><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h2>{article.excerpt ? <p>{article.excerpt}</p> : null}<p className="meta"><time dateTime={article.published_at}>{formatDate(article.published_at, locale, timeZone)}</time>{article.author ? <> <span aria-hidden="true">/</span> {article.author.display_name}</> : null}</p></div>{article.featured_media && hasMedia ? <div className="featured-media" data-image={design.heroImage} style={{ aspectRatio: mediaFrameRatio(article.featured_media, image.ratio) }}><ResponsiveMedia media={article.featured_media} priority /></div> : null}</article>;
}

export function CompactArticleItem({ article }: { article: ArticleSummary }) {
  const { locale, timeZone } = useSiteLocale();
  const messages = useSiteMessages();
  return <article className="compact-article"><div><p className="eyebrow">{article.taxonomy_label ?? messages.article}</p><h3><DestinationLink destination={article.destination}>{article.title}</DestinationLink></h3></div><time dateTime={article.published_at}>{formatDate(article.published_at, locale, timeZone)}</time></article>;
}

export function TaxonomyCard({ item }: { item: components["schemas"]["TaxonomySummary"] }) {
  const design = useDesign();
  const messages = useSiteMessages();
  return <article className="taxonomy-card" data-category={design.categoryCard} data-layout={categoryLayout(design.categoryCard)}><p className="eyebrow">{item.kind === "CATEGORY" ? messages.category : messages.topic}</p><h3><DestinationLink destination={item.destination}>{item.name}</DestinationLink></h3></article>;
}

export function AuthorCard({ author }: { author: components["schemas"]["AuthorSummary"] }) {
  const design = useDesign();
  const profile = ["AUTH-11", "AUTH-12", "AUTH-13"].includes(design.authorCard) ? "AUTH-05" : design.authorCard;
  return <article className="author-card" data-author={profile} data-layout={authorLayout(profile)}>{author.avatar_media && profile !== "AUTH-05" ? <ResponsiveMedia media={author.avatar_media} altOverride="" sizes="96px" /> : <span className="avatar-fallback" aria-hidden="true">{initials(author.display_name)}</span>}<div><h3>{author.destination ? <DestinationLink destination={author.destination}>{author.display_name}</DestinationLink> : author.display_name}</h3>{author.short_bio ? <p>{author.short_bio}</p> : null}</div></article>;
}

export function ArticleCollection({ articles, label = "Articles", context = "CATEGORY" }: { articles: ArticleSummary[]; label?: string | undefined; context?: "CATEGORY" | "TAG" | "AUTHOR" | "SEARCH" | "HOME" }) {
  const design = useDesign();
  const messages = useSiteMessages();
  const layout = context === "TAG" ? design.tagCollection : context === "AUTHOR" ? design.authorCollection : context === "SEARCH" ? design.searchCollection : design.collection;
  if (!articles.length) return <section aria-label={label}><EmptyState title={messages.noArticlesYet} body={messages.noPubliclyEligibleArticles} /></section>;
  return <section aria-label={label} className="article-grid" data-collection={layout} data-layout={collectionLayout(layout)}>{articles.map((article) => <ArticleCard key={article.article_id} article={article} profileId={context === "HOME" ? design.articleCard : design.collectionCard} />)}</section>;
}

export function Pagination({ pagination }: { pagination: PaginationData }) {
  const messages = useSiteMessages();
  if (!pagination.links.length && !pagination.previous && !pagination.next) return null;
  return <nav className="pagination" aria-label={messages.pagination}>{pagination.previous ? <DestinationLink destination={pagination.previous} className="page-step">{messages.previous}</DestinationLink> : <span />}
    <ol>{pagination.links.map((link) => <li key={link.page_number}>{link.is_current ? <span aria-current="page"><span className="visually-hidden">{messages.page} </span>{link.page_number}</span> : <DestinationLink destination={link.destination}><span className="visually-hidden">{messages.page} </span>{link.page_number}</DestinationLink>}</li>)}</ol>
    {pagination.next ? <DestinationLink destination={pagination.next} className="page-step">{messages.next}</DestinationLink> : <span />}</nav>;
}

export function EmptyState({ title, body }: { title: string; body: string }) { return <section className="state-card" role="status"><h2>{title}</h2><p>{body}</p></section>; }
export function ErrorState({ title, body }: { title: string; body: string }) { return <section className="state-card state-error" role="alert"><h1>{title}</h1><p>{body}</p></section>; }
export function MissingMediaFallback({ label }: { label?: string | undefined }) { const messages = useSiteMessages(); const text = label ?? messages.mediaUnavailable; return <div className="missing-media" role="img" aria-label={text}><span aria-hidden="true" /> <p>{text}</p></div>; }

export function HomeLeadRegion({ article, supports = [] }: { article: ArticleSummary; supports?: ArticleSummary[] }) {
  const design = useDesign();
  const modern = useContext(ResolvedAppearanceContext);
  const slots = ({ "HERO-10": 2, "HERO-11": 4, "HERO-12": 3, "HERO-20": 2 } as Record<string, number>)[design.hero] ?? 0;
  const available = supports.filter((item) => item.article_id !== article.article_id).slice(0, slots);
  const messages = useSiteMessages();
  return <section className="home-lead" data-support-count={available.length}><FeaturedArticleCard article={article} />{available.length ? <div className="lead-supports" aria-label={messages.moreFeaturedArticles}>{available.map((item) => <ArticleCard key={item.article_id} article={item} profileId={modern ? design.articleCard : "CARD-30"} />)}</div> : null}</section>;
}
export function HomeSectionContainer({ label, children }: { label?: string | undefined; children: ReactNode }) { return <section className="home-section">{label ? <SectionHeader label={label} /> : null}{children}</section>; }
export function HomeFeaturedPostsSection({ articles }: { articles: ArticleSummary[] }) { return <div className="article-grid">{articles.map((article) => <ArticleCard key={article.article_id} article={article} />)}</div>; }
export function HomeFeaturedCategoriesSection({ categories }: { categories: components["schemas"]["TaxonomySummary"][] }) { return <div className="taxonomy-grid">{categories.map((item) => <TaxonomyCard key={`${item.kind}-${item.name}-${item.destination.url}`} item={item} />)}</div>; }
export function HomePrimaryArticleCollection({ articles }: { articles: ArticleSummary[] }) { const messages = useSiteMessages(); return <div>{articles.length ? <ArticleCollection articles={articles} label={messages.latestArticles} context="HOME" /> : <EmptyState title={messages.noArticlesYet} body={messages.noPubliclyEligibleArticles} />}</div>; }

export function ArticleHeader({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { const messages = useSiteMessages(); return <header className="article-header">{article.categories.length ? <nav className="article-categories" aria-label={messages.articleCategories}>{article.categories.map((category) => <DestinationLink key={`${category.name}-${category.destination.url}`} destination={category.destination}>{category.name}</DestinationLink>)}</nav> : null}<h1>{article.title}</h1>{article.excerpt ? <p className="article-deck">{article.excerpt}</p> : null}</header>; }
export function ArticleMeta({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { const published = article.published_at; const messages = useSiteMessages(); const { locale, timeZone } = useSiteLocale(); return <div className="article-meta">{article.author ? <span className="article-byline">{messages.by} {article.author.destination ? <DestinationLink destination={article.author.destination}>{article.author.display_name}</DestinationLink> : article.author.display_name}</span> : null}{published ? <span>{messages.published} <time dateTime={published}>{formatDate(published, locale, timeZone)}</time></span> : <span>{messages.unpublishedPreview}</span>}{article.updated_at ? <span>{messages.updated} <time dateTime={article.updated_at}>{formatDate(article.updated_at, locale, timeZone)}</time></span> : null}</div>; }
export function ArticleFeaturedMedia({ article }: { article: components["schemas"]["ArticleDetail"] | components["schemas"]["PreviewArticle"] }) { const design = useDesign(); return article.featured_media ? <figure className="article-featured-media" data-image={design.articleImage}><ResponsiveMedia media={article.featured_media} priority />{article.featured_media.caption || article.featured_media.credit_text ? <figcaption>{article.featured_media.caption ? <span>{article.featured_media.caption}</span> : null}{article.featured_media.credit_text ? <small className="media-credit">{article.featured_media.credit_text}</small> : null}</figcaption> : null}</figure> : null; }
export function ArticleAuthorBlock({ author }: { author?: components["schemas"]["AuthorSummary"] | undefined }) { const messages = useSiteMessages(); return author ? <aside className="article-author" aria-label={messages.author}><h2>{messages.aboutTheAuthor}</h2><AuthorCard author={author} /></aside> : null; }
export function ArticleTagList({ tags }: { tags: components["schemas"]["TaxonomySummary"][] }) { const messages = useSiteMessages(); return tags.length ? <nav className="tag-list" aria-label={messages.articleTopics}>{tags.map((tag) => <DestinationLink key={`${tag.name}-${tag.destination.url}`} destination={tag.destination}>{tag.name}</DestinationLink>)}</nav> : null; }
export function RelatedPostsSection({ articles }: { articles: ArticleSummary[] }) { const design = useDesign(); const messages = useSiteMessages(); return articles.length ? <section className="related-posts"><SectionHeader label={messages.relatedReading} /><div className="article-grid" data-layout="list">{articles.map((article) => <ArticleCard key={article.article_id} article={article} profileId={design.relatedCard} />)}</div></section> : null; }

export function CollectionIntroduction({ title, description, marker }: { title: string; description?: string | undefined; marker?: string | undefined }) { const messages = useSiteMessages(); const heading = marker === "Category" ? messages.articlesIn(title) : marker === "Author" ? messages.articlesBy(title) : title; return <header className="collection-intro">{marker ? <p className="eyebrow">{marker === "Category" ? messages.category : marker === "Topic" ? messages.topic : marker}</p> : null}<h1>{heading}</h1>{description ? <p>{description}</p> : null}</header>; }
export function SearchForm({ query, action = "/search" }: { query: string; action?: string }) {
  const messages = useSiteMessages();
  return <form className="search-form" method="get" action={action} role="search" aria-label={messages.searchArticles}>
    <label htmlFor="site-search-query">{messages.searchThisWebsite}</label>
    <p id="site-search-hint" className="search-hint">{messages.searchHint}</p>
    <div className="search-row"><input key={query} id="site-search-query" name="q" type="search" defaultValue={query} placeholder={messages.searchArticles} aria-describedby="site-search-hint" autoComplete="off" enterKeyHint="search" /><button type="submit" className="button-primary">{messages.search}</button>{query ? <a href={action} className="button-secondary">{messages.clear}</a> : null}</div>
  </form>;
}
export function SearchResultsRegion({ articles, state, summary }: { articles: ArticleSummary[]; state: "NO_QUERY" | "RESULTS" | "EMPTY"; summary: string }) {
  const messages = useSiteMessages();
  return <section className="search-results" aria-label={messages.searchResults}>
    {summary.trim() ? <p className="result-summary" role="status" aria-atomic="true">{summary}</p> : null}
    {state === "NO_QUERY" ? <EmptyState title={messages.startSearch} body={messages.noQueryHelp} />
      : state === "EMPTY" ? <EmptyState title={messages.noResultsTitle} body={messages.noResults} />
      : <><h2 className="search-results-heading">{messages.searchResults}</h2><ArticleCollection articles={articles} label={messages.matchingArticles} context="SEARCH" /></>}
  </section>;
}

export function StaticInformationBody({ content, contactInfo, showIntro = true }: { content: components["schemas"]["StaticContent"]; contactInfo?: components["schemas"]["ContactInfo"] | undefined; showIntro?: boolean | undefined }) {
  const messages = useSiteMessages();
  const sections = content.sections.filter((section) => section.heading?.trim() || section.paragraphs.length || section.list_items.length);
  const contacts = contactInfo?.items.filter((item) => item.label.trim() && item.display_value.trim()) ?? [];
  return <div className="static-body">
    {showIntro && content.intro_text ? <p className="static-intro">{content.intro_text}</p> : null}
    {sections.map((section, index) => <section className="static-content-section" key={`${section.heading ?? "section"}-${index}`}>
      {section.heading ? <h2>{section.heading}</h2> : null}
      {section.paragraphs.map((paragraph, pIndex) => <p key={pIndex}><RichText value={paragraph} /></p>)}
      {section.list_items.length ? <ul>{section.list_items.map((item, itemIndex) => <li key={itemIndex}><RichText value={item} /></li>)}</ul> : null}
    </section>)}
    {contactInfo ? <section className="contact-section"><h2>{messages.contactDetails}</h2>{contacts.length ? <address className="contact-info"><dl className="contact-list">{contacts.map((item, index) => <div key={`${item.kind}-${item.label}-${index}`}><dt>{item.label}</dt><dd>{item.destination ? <DestinationLink destination={item.destination}>{item.display_value}</DestinationLink> : <span>{item.display_value}</span>}</dd></div>)}</dl></address>
      : <p className="contact-unavailable" role="status">{messages.contactUnavailable}</p>}</section> : null}
  </div>;
}
export function PreviewStatusNotice({ preview }: { preview: components["schemas"]["PreviewMeta"] }) { const messages = useSiteMessages(); return <aside className="preview-status" role="status"><strong>{messages.privatePreview}</strong><span>{preview.notice_text}</span><small>{preview.lifecycle_status} / {preview.source_kind}</small></aside>; }
export function SystemMessageView({ code, title, body }: { code: 404 | 410; title: string; body: string }) { return <section className="system-message"><p className="system-code">{code}</p><h1>{title}</h1><p>{body}</p></section>; }
export function RecoveryActions({ home, search }: { home?: PublicDestination | undefined; search?: PublicDestination | undefined }) { const messages = useSiteMessages(); return home || search ? <nav className="recovery-actions" aria-label={messages.recoveryActions}>{home ? <DestinationLink destination={home} className="button-primary">{messages.goToHome}</DestinationLink> : null}{search ? <DestinationLink destination={search} className="button-secondary">{messages.searchThisSite}</DestinationLink> : null}</nav> : null; }

export function formatDate(value: string, locale = "en-IN", timeZone = "UTC"): string { return formatSiteDate(value, locale, timeZone); }
export function initials(value: string): string { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "A"; }
