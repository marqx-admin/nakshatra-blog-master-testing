import { createContext, useContext, type ReactNode } from "react";

const english = {
  skipToMain: "Skip to main content",
  home: "Home",
  allArticles: "All Articles",
  searchHeading: "Search Articles",
  search: "Search",
  searchThisWebsite: "Search this website",
  searchArticles: "Search articles",
  menu: "Menu",
  closeNavigation: "Close navigation",
  siteNavigation: "Site navigation",
  primaryNavigation: "Primary navigation",
  mobilePrimaryNavigation: "Mobile primary navigation",
  footerNavigation: "Footer navigation",
  siteShortcuts: "Site shortcuts",
  socialProfiles: "Social profiles",
  elsewhere: "Elsewhere",
  breadcrumb: "Breadcrumb",
  latestArticles: "Latest Articles",
  publishedArticles: "Published articles",
  featuredArticles: "Featured articles",
  exploreCategories: "Explore categories",
  noArticlesPublished: "No articles have been published yet. New articles will appear here when available.",
  noLatestArticles: "No latest articles",
  noArticlesOnPage: "No articles on this page",
  noArticlesOnArchive: "There are no articles on this archive page. Use the pagination to return to an earlier page.",
  articles: "Articles",
  articlesIn: (name: string) => `Articles in ${name}`,
  noArticlesIn: (name: string) => `No articles in ${name}`,
  noPublishedArticlesForArchive: "There are no published articles to show on this archive page.",
  author: "Author",
  articlesBy: (name: string) => `Articles by ${name}`,
  noPublicArticles: "No public articles",
  noPublishedArticlesForAuthor: "There are no published articles to show on this author page.",
  previous: "Previous",
  next: "Next",
  page: "Page",
  pagination: "Pagination",
  category: "Category",
  topic: "Topic",
  article: "Article",
  mediaUnavailable: "Media unavailable",
  articleMediaUnavailable: "Article media unavailable",
  articleCategories: "Article categories",
  articleTopics: "Article topics",
  articleDataTable: "Article data table",
  moreFeaturedArticles: "More featured articles",
  authorSocialProfiles: "Author social profiles",
  by: "By",
  published: "Published",
  updated: "Updated",
  unpublishedPreview: "Unpublished preview",
  aboutTheAuthor: "About the author",
  relatedReading: "Related reading",
  searchHint: "Enter a topic to search published articles.",
  startSearch: "Start a search",
  noQueryHelp: "Enter a topic to search published articles.",
  noResults: "No articles matched your search. Try another keyword.",
  noResultsTitle: "No results",
  searchResults: "Search results",
  matchingArticles: "Matching articles",
  clear: "Clear",
  contactDetails: "Contact details",
  contactUnavailable: "Contact information is not available on this page yet.",
  sourcesAndReferences: "Sources and references",
  disclaimer: "Disclaimer",
  openApprovedSource: "Open approved source",
  embeddedMediaUnavailable: "Embedded media is unavailable in this rendering context.",
  recoveryActions: "Recovery actions",
  goToHome: "Go to Home",
  searchThisSite: "Search this site",
  privatePreview: "Private preview",
  privateWebsitePreview: "Private website preview",
  previewSavedContent: "Saved content · public activation unchanged · noindex",
  exitPreview: "Exit preview",
  noArticlesYet: "No articles yet",
  noPubliclyEligibleArticles: "There are no publicly eligible articles to show right now.",
} as const;

type SiteMessages = {
  [Key in keyof typeof english]: typeof english[Key] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Result
    : string;
};

const hindi: SiteMessages = {
  skipToMain: "मुख्य सामग्री पर जाएँ",
  home: "मुखपृष्ठ",
  allArticles: "सभी लेख",
  searchHeading: "लेख खोजें",
  search: "खोजें",
  searchThisWebsite: "इस वेबसाइट पर खोजें",
  searchArticles: "लेख खोजें",
  menu: "मेनू",
  closeNavigation: "नेविगेशन बंद करें",
  siteNavigation: "साइट नेविगेशन",
  primaryNavigation: "मुख्य नेविगेशन",
  mobilePrimaryNavigation: "मोबाइल मुख्य नेविगेशन",
  footerNavigation: "फुटर नेविगेशन",
  siteShortcuts: "साइट शॉर्टकट",
  socialProfiles: "सोशल प्रोफ़ाइल",
  elsewhere: "अन्य स्थान",
  breadcrumb: "ब्रेडक्रंब",
  latestArticles: "नवीनतम लेख",
  publishedArticles: "प्रकाशित लेख",
  featuredArticles: "चयनित लेख",
  exploreCategories: "विषय देखें",
  noArticlesPublished: "अभी कोई लेख प्रकाशित नहीं हुआ है। नए लेख प्रकाशित होने पर यहाँ दिखाई देंगे।",
  noLatestArticles: "नवीनतम लेखों की सूची में अभी कोई लेख नहीं है।",
  noArticlesOnPage: "इस पृष्ठ पर कोई लेख नहीं है",
  noArticlesOnArchive: "इस संग्रह पृष्ठ पर कोई लेख नहीं है। पहले के पृष्ठ पर जाने के लिए पृष्ठांकन का उपयोग करें।",
  articles: "लेख",
  articlesIn: (name: string) => `${name} के लेख`,
  noArticlesIn: (name: string) => `${name} में कोई लेख नहीं है`,
  noPublishedArticlesForArchive: "इस संग्रह पृष्ठ पर दिखाने के लिए कोई प्रकाशित लेख नहीं है।",
  author: "लेखक",
  articlesBy: (name: string) => `${name} के लेख`,
  noPublicArticles: "कोई सार्वजनिक लेख नहीं",
  noPublishedArticlesForAuthor: "इस लेखक पृष्ठ पर दिखाने के लिए कोई प्रकाशित लेख नहीं है।",
  previous: "पिछला",
  next: "अगला",
  page: "पृष्ठ",
  pagination: "पृष्ठांकन",
  category: "श्रेणी",
  topic: "विषय",
  article: "लेख",
  mediaUnavailable: "मीडिया उपलब्ध नहीं है",
  articleMediaUnavailable: "लेख का मीडिया उपलब्ध नहीं है",
  articleCategories: "लेख की श्रेणियाँ",
  articleTopics: "लेख के विषय",
  articleDataTable: "लेख की डेटा तालिका",
  moreFeaturedArticles: "अन्य चयनित लेख",
  authorSocialProfiles: "लेखक की सोशल प्रोफ़ाइल",
  by: "लेखक",
  published: "प्रकाशित",
  updated: "अपडेट किया गया",
  unpublishedPreview: "अप्रकाशित पूर्वावलोकन",
  aboutTheAuthor: "लेखक के बारे में",
  relatedReading: "संबंधित लेख",
  searchHint: "प्रकाशित लेख खोजने के लिए कोई विषय दर्ज करें।",
  startSearch: "खोज शुरू करें",
  noQueryHelp: "प्रकाशित लेख खोजने के लिए कोई विषय दर्ज करें।",
  noResults: "आपकी खोज से कोई लेख नहीं मिला। दूसरा शब्द आज़माएँ।",
  noResultsTitle: "कोई परिणाम नहीं",
  searchResults: "खोज परिणाम",
  matchingArticles: "मिलते-जुलते लेख",
  clear: "हटाएँ",
  contactDetails: "संपर्क विवरण",
  contactUnavailable: "इस पृष्ठ पर संपर्क जानकारी अभी उपलब्ध नहीं है।",
  sourcesAndReferences: "स्रोत और संदर्भ",
  disclaimer: "अस्वीकरण",
  openApprovedSource: "स्वीकृत स्रोत खोलें",
  embeddedMediaUnavailable: "इस प्रस्तुति में एम्बेड किया गया मीडिया उपलब्ध नहीं है।",
  recoveryActions: "वापसी के विकल्प",
  goToHome: "मुखपृष्ठ पर जाएँ",
  searchThisSite: "इस साइट पर खोजें",
  privatePreview: "निजी पूर्वावलोकन",
  privateWebsitePreview: "निजी वेबसाइट पूर्वावलोकन",
  previewSavedContent: "सहेजी गई सामग्री · सार्वजनिक सक्रियण अपरिवर्तित · noindex",
  exitPreview: "पूर्वावलोकन से बाहर जाएँ",
  noArticlesYet: "अभी कोई लेख प्रकाशित नहीं हुआ है।",
  noPubliclyEligibleArticles: "अभी दिखाने के लिए कोई सार्वजनिक रूप से उपलब्ध लेख नहीं है।",
};

export interface SiteLocale {
  locale: string;
  timeZone: string;
}

export const SiteLocaleContext = createContext<SiteLocale>({ locale: "en-IN", timeZone: "UTC" });

export function siteLocale(locale: string | undefined, timeZone: string): SiteLocale {
  return { locale: locale?.trim() || "en-IN", timeZone };
}

export function messagesForLocale(locale: string) {
  return locale.toLowerCase().split(/[-_]/)[0] === "hi" ? hindi : english;
}

export function useSiteLocale(): SiteLocale {
  return useContext(SiteLocaleContext);
}

export function useSiteMessages() {
  return messagesForLocale(useSiteLocale().locale);
}

export function SiteLocaleProvider({ value, children }: { value: SiteLocale; children: ReactNode }) {
  return <SiteLocaleContext.Provider value={value}>{children}</SiteLocaleContext.Provider>;
}

export function formatSiteDate(value: string, locale: string, timeZone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone }).format(date);
}
