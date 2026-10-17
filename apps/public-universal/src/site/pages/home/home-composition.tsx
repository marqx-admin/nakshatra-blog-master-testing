import type { components } from "@bp/api-contract";
import { useContext } from "react";
import { HOME_SLOTS } from "@bp/presentation-catalogue";
import { EmptyState, HomeFeaturedCategoriesSection, HomeFeaturedPostsSection, HomeLeadRegion, HomePrimaryArticleCollection, HomeSectionContainer, PageIntro } from "../../components/semantic-components";
import { ResolvedAppearanceContext, useDesign } from "../../lib/design-context";

type HomeData = components["schemas"]["HomePageData"];

export function HomeComposition({ data }: { data: HomeData }) {
  const design = useDesign();
  const modern = useContext(ResolvedAppearanceContext);
  const sections = data.sections.filter((section) =>
    section.section_kind === "POST_SELECTION" && !!section.posts?.length
    || section.section_kind === "CATEGORY_SELECTION" && !!section.categories?.length);
  const articleIds = new Set([
    ...data.latest_articles.map((article) => article.article_id),
    ...sections.flatMap((section) => (section.posts ?? []).map((article) => article.article_id)),
    ...(data.lead_article ? [data.lead_article.article_id] : []),
  ]);
  const contentState = articleIds.size === 0 ? "empty" : articleIds.size === 1 ? "single" : "populated";
  // V2 lead-support recipes reuse actual authored selections in source order.
  // Deduplicate without moving or removing anything from the latest feed.
  const supports = modern ? [...new Map(sections.flatMap(section => section.posts ?? []).map(article => [article.article_id, article])).values()] : [];
  const slots = {
    INTRO: <PageIntro h1={data.intro.h1} introText={data.intro.intro_text} />,
    // Only the supplied lead is featured. Latest entries remain in their authoritative list.
    LEAD: data.lead_article ? <HomeLeadRegion article={data.lead_article} supports={supports} /> : null,
    SELECTIONS: sections.length ? <div className="home-selection-stack">{sections.map((section) => {
      const isPosts = section.section_kind === "POST_SELECTION";
      return <div className="home-selection" data-slot={isPosts ? "POSTS" : "CATEGORIES"} data-item-count={isPosts ? section.posts?.length : section.categories?.length} key={section.section_key}>
        <HomeSectionContainer label={section.label?.trim() ? section.label : isPosts ? "Featured articles" : "Explore categories"}>{isPosts
          ? <HomeFeaturedPostsSection articles={section.posts ?? []} />
          : <HomeFeaturedCategoriesSection categories={section.categories ?? []} />}</HomeSectionContainer>
      </div>;
    })}</div> : null,
    LATEST: <HomeSectionContainer label="Latest articles"><div className="home-latest" data-item-count={data.latest_articles.length}>{data.latest_articles.length
      ? <HomePrimaryArticleCollection articles={data.latest_articles} />
      : <EmptyState title={contentState === "empty" ? "No articles yet" : "No latest articles"} body={contentState === "empty"
        ? "No articles have been published on this website yet. Please check back soon."
        : "There are no articles in the latest list right now."} />}</div></HomeSectionContainer>,
  };
  const visualOrder = HOME_SLOTS[design.homepage];
  // Keep authored selections together at the preset's first populated selection slot.
  // This preserves interleaved POST/CATEGORY response order rather than regrouping it.
  const selectionOrder = sections.length ? Math.min(...sections.map((section) => visualOrder.indexOf(section.section_kind === "POST_SELECTION" ? "POSTS" : "CATEGORIES"))) : 0;
  return <div className="container page-stack home-page" data-home-recipe={design.homepage} data-content-state={contentState} lang={data.site?.locale_code ?? data.site?.default_language}>{(["INTRO", "LEAD", "SELECTIONS", "LATEST"] as const).filter((slot) =>
    slot === "INTRO" || slot === "LATEST" || slot === "LEAD" && !!data.lead_article || slot === "SELECTIONS" && !!sections.length,
  ).map((slot) => <div className="home-slot" data-slot={slot} key={slot} style={{ order: slot === "SELECTIONS" ? selectionOrder : visualOrder.indexOf(slot) }}>{slots[slot]}</div>)}</div>;
}
