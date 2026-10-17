// Synthetic homepage inputs for deferred regression tests; no runtime imports.
import { fixtureArticle, landscapeMedia, mediaCases } from "./uf02-shared-components.mjs";

const base = {
  site: { locale_code: "en-IN" },
  intro: { h1: "Editorial fixture", intro_text: "Approved introduction supplied by the fixture." },
  latest_articles: [], sections: [],
};
const lead = fixtureArticle(1, landscapeMedia);
const categorySection = {
  section_key: "categories", section_kind: "CATEGORY_SELECTION", label: "Authored categories",
  categories: [{ kind: "CATEGORY", name: "Fixture category", destination: { kind: "CATEGORY", url: "/category/fixture", is_external: false } }],
};
const postSection = (key, article) => ({ section_key: key, section_kind: "POST_SELECTION", label: key, posts: [article] });
export const homepageCases = {
  zero: base,
  single: { ...base, latest_articles: [fixtureArticle(1)] },
  three: { ...base, latest_articles: Array.from({ length: 3 }, (_, index) => fixtureArticle(index + 1, landscapeMedia)) },
  twelve: { ...base, latest_articles: Array.from({ length: 12 }, (_, index) => fixtureArticle(index + 1, index % 2 ? mediaCases.portrait : undefined)) },
  interleavedSelections: { ...base, sections: [postSection("First authored posts", fixtureArticle(4)), categorySection, postSection("Last authored posts", fixtureArticle(5))] },
  leadAndLatest: { ...base, lead_article: lead, latest_articles: [lead, fixtureArticle(2), fixtureArticle(3)] },
  selectedWithoutLatest: { ...base, sections: [postSection("Authored selection", fixtureArticle(1))] },
  categoriesOnly: { ...base, sections: [categorySection] },
  hindiWithoutMedia: {
    ...base, site: { locale_code: "hi-IN" }, intro: { h1: "हमारे लेख और विचार", intro_text: "स्वीकृत परिचय का परीक्षण पाठ।" },
    lead_article: { ...fixtureArticle(1), title: "लंबे हिंदी और English शीर्षक के साथ स्पष्ट और सुलभ लेख प्रस्तुति ".repeat(3) },
    latest_articles: [fixtureArticle(2, mediaCases.wide)],
  },
};
