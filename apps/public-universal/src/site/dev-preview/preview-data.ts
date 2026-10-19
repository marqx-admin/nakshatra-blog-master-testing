import type { components } from "@bp/api-contract";
import type { AnyRenderablePageData, PublicDestination } from "../lib/types";
import type { PreviewPage } from "./preview-types";

export const previewPages: Array<{ key: PreviewPage; label: string }> = [
  { key: "home", label: "Home" },
  { key: "blog", label: "Blog" },
  { key: "article", label: "Article" },
  { key: "category", label: "Category" },
  { key: "tag", label: "Tag" },
  { key: "author", label: "Author" },
  { key: "search", label: "Search" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "not-found", label: "404" },
  { key: "gone", label: "410" },
];

export function isPreviewPage(value: string): value is PreviewPage {
  return previewPages.some((page) => page.key === value);
}

const pagePath = (page: PreviewPage) => `/dev-preview?page=${page}`;
const destination = (page: PreviewPage, kind: PublicDestination["kind"]): PublicDestination => ({
  kind,
  url: pagePath(page),
  is_external: false,
});
const richText = (text: string) => ({ runs: [{ text, marks: [] as Array<"BOLD" | "ITALIC"> }] });
const articleUrl = destination("article", "ARTICLE");

const site: components["schemas"]["SiteIdentity"] = {
  site_key: "SYNTHETIC-DEVELOPMENT-PREVIEW",
  display_name: "Universal Frontend Development Preview",
  canonical_domain: "",
  home_destination: destination("home", "HOME"),
  default_language: "en",
  locale_code: "en-IN",
  timezone_id: "UTC",
};

const navigation: components["schemas"]["NavigationBundle"] = {
  header: {
    menu_key: "HEADER",
    items: [
      { label: "Home", destination: destination("home", "HOME"), children: [] },
      { label: "Articles", destination: destination("blog", "STATIC"), children: [] },
      { label: "About", destination: destination("about", "STATIC"), children: [] },
    ],
  },
  footer: {
    menu_key: "FOOTER",
    items: [
      { label: "Contact", destination: destination("contact", "STATIC"), children: [] },
      { label: "Search", destination: destination("search", "SEARCH"), children: [] },
    ],
  },
};

const settings: components["schemas"]["PublicSettings"] = {
  copyright_text: "Synthetic preview content — not a real website.",
  social_profiles: [],
};

const seo = (title: string): components["schemas"]["SeoProjection"] => ({
  baseline_indexability: "NOINDEX",
  title: `${title} · Universal Frontend Development Preview`,
  meta_description: "A local-only preview using synthetic content.",
  robots: { index: false, follow: false },
  structured_data: [],
});

const media: components["schemas"]["PublicMedia"] = {
  media_id: "synthetic-preview-artwork",
  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%23244e54'/%3E%3Ccircle cx='840' cy='245' r='145' fill='%23efc77f'/%3E%3Cpath d='M0 490 255 265l230 230 230-185 485 365H0z' fill='%23183b42'/%3E%3C/svg%3E",
  mime_type: "image/svg+xml",
  width: 1200,
  height: 675,
  alt_text: "Synthetic abstract editorial artwork for the development preview",
  caption: "Synthetic artwork included only to preview the shared media layout.",
  variants: [],
};

const authorSummary: components["schemas"]["AuthorSummary"] = {
  author_id: "synthetic-preview-author",
  display_name: "Preview Contributor",
  destination: destination("author", "AUTHOR"),
  short_bio: "A fictional author used only to demonstrate the shared author layout.",
};

function article(index: number): components["schemas"]["ArticleSummary"] {
  return {
    article_id: `synthetic-preview-article-${index}`,
    destination: articleUrl,
    title: [
      "A considered guide to everyday rituals",
      "Finding a quieter rhythm in a busy week",
      "Small observations from the changing seasons",
    ][(index - 1) % 3] ?? "A considered guide to everyday rituals",
    excerpt: "Synthetic excerpt text demonstrates the shared article-card layout without using tenant content.",
    featured_media: media,
    author: authorSummary,
    published_at: "2026-01-12T09:30:00Z",
    taxonomy_label: "Notes",
  };
}

const articleDetail: components["schemas"]["ArticleDetail"] = {
  ...article(1),
  author: authorSummary,
  categories: [{ kind: "CATEGORY", name: "Notes", destination: destination("category", "CATEGORY") }],
  tags: [{ kind: "TAG", name: "Rituals", destination: destination("tag", "TAG") }],
  updated_at: "2026-01-13T09:30:00Z",
  body: {
    content_schema_version: "1",
    blocks: [
      { block_id: "preview-paragraph-1", type: "PARAGRAPH", payload: { content: richText("This fictional article shows how the shared renderer presents long-form content. It does not describe a real publication or tenant.") } },
      { block_id: "preview-heading-1", type: "HEADING", payload: { level: 2, content: richText("A shared article template") } },
      { block_id: "preview-paragraph-2", type: "PARAGRAPH", payload: { content: richText("Headings, text, metadata, images, and related stories are all rendered by the same Universal Frontend components used by public pages.") } },
      { block_id: "preview-quote-1", type: "QUOTE", payload: { quote: richText("Synthetic content makes the layout inspectable without resolving a real website."), attribution: "Preview fixture" } },
      { block_id: "preview-media-1", type: "MEDIA", payload: { resolution_state: "READY", media } },
    ],
  },
};

const breadcrumbs = (label: string): components["schemas"]["BreadcrumbTrail"] => ({
  items: [
    { label: "Home", destination: destination("home", "HOME"), is_current: false },
    { label, is_current: true },
  ],
});

const previewContext = (pageId: components["schemas"]["PageContext"]["page_id"]): components["schemas"]["PageContext"] => ({
  page_id: pageId,
  page_kind: "CONTENT",
  render_mode: "PUBLIC",
  locale_code: "en-IN",
});

const base = {
  site,
  settings,
  navigation,
};

function archivePagination(page: PreviewPage): components["schemas"]["Pagination"] {
  return {
    current_page: 1,
    links: [{ page_number: 1, destination: destination(page, "STATIC"), is_current: true }],
    next: destination(page, "STATIC"),
  };
}

function categoryPage(): components["schemas"]["CategoryPageData"] {
  return {
    ...base,
    context: previewContext("PUB-CATEGORY-01"),
    breadcrumbs: breadcrumbs("Notes"),
    category: {
      category_id: "synthetic-preview-category",
      name: "Notes",
      description: "A fictional category for previewing archive layouts.",
      destination: destination("category", "CATEGORY"),
    },
    articles: [article(1), article(2)],
    pagination: archivePagination("category"),
    seo: seo("Category"),
  };
}

function tagPage(): components["schemas"]["TagPageData"] {
  return {
    ...base,
    context: previewContext("PUB-TAG-01"),
    breadcrumbs: breadcrumbs("Rituals"),
    tag: {
      tag_id: "synthetic-preview-tag",
      name: "Rituals",
      description: "A fictional tag for previewing archive layouts.",
      destination: destination("tag", "TAG"),
    },
    articles: [article(2), article(3)],
    pagination: archivePagination("tag"),
    seo: seo("Tag"),
  };
}

function staticPage(key: "ABOUT" | "CONTACT"): components["schemas"]["StaticPageData"] {
  const title = key === "ABOUT" ? "About this preview" : "Contact";
  return {
    ...base,
    context: previewContext(key === "ABOUT" ? "PUB-STATIC-ABOUT-01" : "PUB-STATIC-CONTACT-01"),
    breadcrumbs: breadcrumbs(title),
    content: {
      static_key: key,
      title,
      intro_text: "This page is synthetic and exists only to demonstrate the shared information-page template.",
      sections: [
        {
          heading: "About the development preview",
          paragraphs: [richText("No real tenant is selected, and no public API or database content is used.")],
          list_items: [],
        },
        {
          heading: "Shared presentation",
          paragraphs: [richText("The header, footer, typography, spacing, and page renderer come from the Universal Frontend.")],
          list_items: [],
        },
      ],
    },
    seo: seo(title),
  };
}

function systemPage(code: 404 | 410): components["schemas"]["NotFoundPageData"] {
  return {
    context: {
      ...previewContext(code === 404 ? "PUB-SYS-404-01" : "PUB-SYS-410-01"),
      page_kind: "SYSTEM",
      render_mode: "SYSTEM",
    },
    message: {
      code,
      title: code === 404 ? "Preview page not found" : "Preview page no longer available",
      body: "This synthetic system page demonstrates the shared recovery layout.",
    },
    recovery: { home: destination("home", "HOME"), search: destination("search", "SEARCH") },
    seo: seo(code === 404 ? "Not found" : "Gone"),
  };
}

export function getPreviewPageData(page: PreviewPage): AnyRenderablePageData {
  switch (page) {
    case "home": {
      const data: components["schemas"]["HomePageData"] = {
        ...base,
        context: previewContext("PUB-HOME-01"),
        intro: {
          h1: "A shared frontend, ready to explore",
          intro_text: "Synthetic stories and imagery let you inspect the Universal Frontend without selecting a real website.",
        },
        lead_article: article(1),
        sections: [{
          section_key: "preview-notes",
          section_kind: "POST_SELECTION",
          label: "Explore the shared layouts",
          posts: [article(2), article(3)],
        }],
        latest_articles: [article(1), article(2), article(3)],
        seo: seo("Home"),
      };
      return data;
    }
    case "blog": {
      const data: components["schemas"]["BlogPageData"] = {
        ...base,
        context: previewContext("PUB-BLOG-01"),
        intro: { h1: "Latest articles", intro_text: "A synthetic archive showing the shared blog layout." },
        breadcrumbs: breadcrumbs("Articles"),
        articles: [article(1), article(2), article(3)],
        pagination: archivePagination("blog"),
        seo: seo("Blog"),
      };
      return data;
    }
    case "article": {
      const data: components["schemas"]["ArticlePageData"] = {
        ...base,
        context: previewContext("PUB-ARTICLE-01"),
        breadcrumbs: breadcrumbs("A considered guide to everyday rituals"),
        article: articleDetail,
        related_content: { articles: [article(2), article(3)] },
        seo: seo("Article"),
      };
      return data;
    }
    case "category":
      return categoryPage();
    case "tag":
      return tagPage();
    case "author": {
      const data: components["schemas"]["AuthorPageData"] = {
        ...base,
        context: previewContext("PUB-AUTHOR-01"),
        breadcrumbs: breadcrumbs("Preview Contributor"),
        author: {
          author_id: authorSummary.author_id,
          display_name: authorSummary.display_name,
          destination: destination("author", "AUTHOR"),
          bio: "A fictional author profile used only to preview this template.",
          designation: "Preview fixture",
          expertise: ["Synthetic content", "Layout preview"],
          social_profiles: [],
        },
        articles: [article(1), article(2)],
        seo: seo("Author"),
      };
      return data;
    }
    case "search": {
      const data: components["schemas"]["SearchPageData"] = {
        ...base,
        context: previewContext("PUB-SEARCH-01"),
        intro: { h1: "Search", intro_text: "A sample results state for the shared search page." },
        query: "preview",
        search_state: "RESULTS",
        articles: [article(1), article(2)],
        result_summary: "Two synthetic results",
        seo: seo("Search"),
      };
      return data;
    }
    case "about":
      return staticPage("ABOUT");
    case "contact":
      return staticPage("CONTACT");
    case "not-found":
      return systemPage(404);
    case "gone":
      return systemPage(410);
  }
}

export function getPreviewRequestPath(page: PreviewPage): string {
  return pagePath(page);
}
