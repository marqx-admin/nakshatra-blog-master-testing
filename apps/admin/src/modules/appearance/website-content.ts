import type { components } from "@bp/api-contract";
type Page = components["schemas"]["InformationPage"];
type Key = keyof components["schemas"]["StaticPages"];

// V4 D0/D1: editor-only draft resources, never imported by public rendering.
export const contentLabels = (locale = "en") => /^hi(?:-|$)/i.test(locale) ? {
  homeHeading: "मुखपृष्ठ शीर्षक", homeIntro: "मुखपृष्ठ परिचय", starter: "प्रारूप का उपयोग करें",
  restore: "सहेजा गया पृष्ठ पुनर्स्थापित करें", save: "यह पृष्ठ सहेजें", title: "पृष्ठ शीर्षक", intro: "परिचय",
} : { homeHeading: "Homepage H1", homeIntro: "Homepage introduction", starter: "Use starter draft",
  restore: "Restore saved page", save: "Save this page", title: "Page title", intro: "Introduction" };

export const hasDraftPlaceholders = (value: string) => /\[(?:Website Name|Primary Topic|Approved Topic|Topic|approved [^\]]+|Owner[^\]]*|email[^\]]*|\s*)\]/i.test(value);
export function homepageStarter(locale = "en") {
  return /^hi(?:-|$)/i.test(locale) ? {
    h1: "[Website Name]", intro_text: "आपका स्वागत है [Website Name] पर। यहाँ [Approved Topic] से जुड़े प्रकाशित लेख पढ़ें, उपलब्ध विषयों को देखें और अपनी रुचि की जानकारी खोजें।",
  } : { h1: "Explore [Primary Topic] with [Website Name].",
    intro_text: "Welcome to [Website Name]. Browse published articles about [approved topic], explore the available subjects and use Search to find material of interest." };
}
export function informationStarter(key: Key, locale = "en"): Page {
  const section = (heading: string, paragraphs: string[] = []) => ({ heading, paragraphs, list_items: [] as string[] });
  const legal: Partial<Record<Key, string[]>> = {
    PRIVACY: ["Who operates site", "Data categories", "Purposes", "Cookies/analytics", "Third parties", "Retention", "Rights", "Contact/updates"],
    TERMS: ["Website access", "Informational content", "Permitted use", "Rights/IP", "External links", "Modifications", "Contacts"],
    DISCLAIMER: ["Nature of content", "Limits", "External sources", "Advice boundaries where applicable", "Updates/corrections"],
  };
  const titles = { ABOUT: "About [Website Name].", CONTACT: "Contact [Website Name].", PRIVACY: "Privacy Policy", TERMS: "Terms of Use", DISCLAIMER: "Disclaimer" };
  const page: Page = { enabled: false, content_version: 1, title: titles[key], intro_text: "", body_sections: [] };
  if (key === "ABOUT") {
    page.intro_text = "[Website Name] is a publication focused on [approved primary subject].";
    page.body_sections = [section("Topics", ["Browse articles and resources covering the subjects available on this website."]),
      section("Navigation", ["Explore All Articles, browse listed categories, or use Search."]),
      section("Publisher", ["[Owner supplies approved information about the publication and its operation.]"])];
    if (/^hi(?:-|$)/i.test(locale)) { page.title = "हमारे बारे में"; page.intro_text = "[Website Name] पर [Approved Topic] से संबंधित उपलब्ध जानकारी और लेख पढ़े जा सकते हैं।"; }
  } else if (key === "CONTACT") {
    page.intro_text = "For inquiries relating to this website, use the verified contact information below.";
    page.body_sections = [section("Details", ["[email / phone / website / location only when actually supplied and approved]."])];
    if (/^hi(?:-|$)/i.test(locale)) { page.title = "संपर्क करें"; page.intro_text = "उपलब्ध सत्यापित संपर्क विवरण नीचे दिए गए हैं।"; }
  } else page.body_sections = legal[key]!.map(heading => section(heading));
  return page;
}

export function changedInformationPages(pages: components["schemas"]["StaticPages"], saved: components["schemas"]["StaticPages"]) {
  return Object.fromEntries((Object.keys(pages) as Key[]).filter(key => JSON.stringify(pages[key]) !== JSON.stringify(saved[key])).map(key => [key, pages[key]]));
}
