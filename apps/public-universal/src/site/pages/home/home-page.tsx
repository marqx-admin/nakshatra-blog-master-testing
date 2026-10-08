import type { components } from "@bp/api-contract";
import { HOME_SLOTS } from "@bp/presentation-catalogue";
import { SeoHead } from "../../components/seo-head";
import { HomeFeaturedCategoriesSection, HomeFeaturedPostsSection, HomeLeadRegion, HomePrimaryArticleCollection, HomeSectionContainer, PageIntro } from "../../components/semantic-components";
import { useDesign } from "../../lib/design-context";
import { SiteShell } from "../../shell/navigation/site-shell";

type HomeData = components["schemas"]["HomePageData"];

function HomeComposition({ data }: { data: HomeData }) {
  const design = useDesign();
  const sections = data.sections.filter((section) =>
    section.section_kind === "POST_SELECTION" && !!section.posts?.length
    || section.section_kind === "CATEGORY_SELECTION" && !!section.categories?.length
    || section.section_kind === "TOGGLE_ONLY" && !!section.label);
  const slots = {
    INTRO: <PageIntro h1={data.intro.h1} introText={data.intro.intro_text} />,
    LEAD: data.lead_article ? <HomeLeadRegion article={data.lead_article} supports={data.latest_articles} /> : null,
    POSTS: sections.filter((section) => section.section_kind !== "CATEGORY_SELECTION").map((section) =>
      <HomeSectionContainer key={section.section_key} label={section.label}>{section.section_kind === "POST_SELECTION" ? <HomeFeaturedPostsSection articles={section.posts ?? []} /> : <span className="section-presence" aria-hidden="true" />}</HomeSectionContainer>),
    CATEGORIES: sections.filter((section) => section.section_kind === "CATEGORY_SELECTION").map((section) =>
      <HomeSectionContainer key={section.section_key} label={section.label}><HomeFeaturedCategoriesSection categories={section.categories ?? []} /></HomeSectionContainer>),
    LATEST: <HomeSectionContainer label="Latest articles"><HomePrimaryArticleCollection articles={data.latest_articles} /></HomeSectionContainer>,
  };
  const visualOrder = HOME_SLOTS[design.homepage];
  return <div className="container page-stack home-page" data-home-recipe={design.homepage}>{(["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"] as const).map((slot) => <div className="home-slot" data-slot={slot} key={slot} style={{ order: visualOrder.indexOf(slot) }}>{slots[slot]}</div>)}</div>;
}

export function HomePage({ data, requestPath }: { data: HomeData; requestPath: string }) {
  return <><SeoHead seo={data.seo} /><SiteShell site={data.site} navigation={data.navigation} settings={data.settings} presentation={data.presentation} requestPath={requestPath}><HomeComposition data={data} /></SiteShell></>;
}
