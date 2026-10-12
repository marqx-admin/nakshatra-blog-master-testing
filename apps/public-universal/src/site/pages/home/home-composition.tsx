import type { components } from "@bp/api-contract";
import { HOME_SLOTS } from "@bp/presentation-catalogue";
import { HomeFeaturedCategoriesSection, HomeFeaturedPostsSection, HomeLeadRegion, HomePrimaryArticleCollection, HomeSectionContainer, PageIntro } from "../../components/semantic-components";
import { useDesign } from "../../lib/design-context";

type HomeData = components["schemas"]["HomePageData"];

export function HomeComposition({ data }: { data: HomeData }) {
  const design = useDesign();
  const sections = data.sections.filter((section) =>
    section.section_kind === "POST_SELECTION" && !!section.posts?.length
    || section.section_kind === "CATEGORY_SELECTION" && !!section.categories?.length);
  const posts = sections.filter((section) => section.section_kind === "POST_SELECTION");
  const categories = sections.filter((section) => section.section_kind === "CATEGORY_SELECTION");
  const slots = {
    INTRO: <PageIntro h1={data.intro.h1} introText={data.intro.intro_text} />,
    LEAD: data.lead_article ? <HomeLeadRegion article={data.lead_article} supports={data.latest_articles} /> : null,
    POSTS: posts.map((section) => <HomeSectionContainer key={section.section_key} label={section.label}><HomeFeaturedPostsSection articles={section.posts ?? []} /></HomeSectionContainer>),
    CATEGORIES: categories.map((section) => <HomeSectionContainer key={section.section_key} label={section.label}><HomeFeaturedCategoriesSection categories={section.categories ?? []} /></HomeSectionContainer>),
    LATEST: <HomeSectionContainer label="Latest articles"><HomePrimaryArticleCollection articles={data.latest_articles} /></HomeSectionContainer>,
  };
  const visualOrder = HOME_SLOTS[design.homepage];
  return <div className="container page-stack home-page" data-home-recipe={design.homepage}>{(["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"] as const).filter((slot) =>
    slot === "INTRO" || slot === "LATEST" || slot === "LEAD" && !!data.lead_article || slot === "POSTS" && !!posts.length || slot === "CATEGORIES" && !!categories.length,
  ).map((slot) => <div className="home-slot" data-slot={slot} key={slot} style={{ order: visualOrder.indexOf(slot) }}>{slots[slot]}</div>)}</div>;
}
