/** Controlled Universal V1 vocabulary transcribed from Final Blueprint §§36–38. */

export const components = {
  "CMP-U-001": {
    "name": "SiteShell",
    "purpose": "Known-site wrapper",
    "structuralVariants": "one structure",
    "visualControls": "theme/container/density",
    "data": "common PageData",
    "adminControl": "indirect via Appearance",
    "responsive": "skip-link; never used for unknown host"
  },
  "CMP-U-002": {
    "name": "HeaderEngine",
    "purpose": "site identity + primary nav/search",
    "structuralVariants": "one fixed V1 structure",
    "visualControls": "palette/type/border/elevation/logo treatment",
    "data": "site + header menu",
    "adminControl": "no structural selector",
    "responsive": "keyboard nav; fixed responsive collapse"
  },
  "CMP-U-003": {
    "name": "MobileNav",
    "purpose": "collapsed navigation",
    "structuralVariants": "one engine",
    "visualControls": "density/surface",
    "data": "header menu",
    "adminControl": "inherited",
    "responsive": "focus entry, Escape close, 44px targets"
  },
  "CMP-U-004": {
    "name": "FooterEngine",
    "purpose": "footer identity/navigation/legal/social",
    "structuralVariants": "one fixed V1 structure",
    "visualControls": "surface/type/density",
    "data": "footer menu + settings",
    "adminControl": "no structural selector",
    "responsive": "collapses to ordered stack"
  },
  "CMP-U-005": {
    "name": "BrandLockup",
    "purpose": "logo/wordmark/display name",
    "structuralVariants": "mark+name, name-only, mark-only when accessible",
    "visualControls": "size/alignment",
    "data": "site settings media",
    "adminControl": "branding controls",
    "responsive": "alt/text fallback"
  },
  "CMP-U-006": {
    "name": "SearchEntry",
    "purpose": "fixed Header access to Search",
    "structuralVariants": "one shell behavior",
    "visualControls": "size/border inherited",
    "data": "search destination",
    "adminControl": "none structural",
    "responsive": "labelled controls"
  },
  "CMP-U-007": {
    "name": "PageIntro",
    "purpose": "H1 + intro",
    "structuralVariants": "left/center/narrow/wide",
    "visualControls": "type/measure",
    "data": "page data",
    "adminControl": "recipe/layout",
    "responsive": "semantic single H1"
  },
  "CMP-U-008": {
    "name": "Breadcrumbs",
    "purpose": "navigation context",
    "structuralVariants": "one semantic structure",
    "visualControls": "separator/spacing",
    "data": "breadcrumbs data",
    "adminControl": "no arbitrary variant",
    "responsive": "nav aria-label; wraps safely"
  },
  "CMP-U-009": {
    "name": "HomeLead",
    "purpose": "primary homepage feature",
    "structuralVariants": "HERO-*",
    "visualControls": "hero profile + image ratio",
    "data": "lead article",
    "adminControl": "Home recipe",
    "responsive": "stacks predictably"
  },
  "CMP-U-010": {
    "name": "HomeSection",
    "purpose": "titled homepage section",
    "structuralVariants": "grid/list/band wrappers",
    "visualControls": "spacing/heading treatment",
    "data": "homepage section",
    "adminControl": "Home recipe",
    "responsive": "omit empty section"
  },
  "CMP-U-011": {
    "name": "ArticleCard",
    "purpose": "article summary",
    "structuralVariants": "CARD-*",
    "visualControls": "image/meta/excerpt/chrome",
    "data": "ArticleSummary",
    "adminControl": "Card profile",
    "responsive": "readable order; image alt"
  },
  "CMP-U-012": {
    "name": "CategoryCard",
    "purpose": "taxonomy summary",
    "structuralVariants": "CAT-*",
    "visualControls": "image/accent/chrome",
    "data": "category summary",
    "adminControl": "category card profile",
    "responsive": "link target covers meaningful label"
  },
  "CMP-U-013": {
    "name": "AuthorCard",
    "purpose": "author summary/profile",
    "structuralVariants": "AUTH-*",
    "visualControls": "avatar/chrome/meta",
    "data": "author data",
    "adminControl": "author card profile",
    "responsive": "monogram fallback"
  },
  "CMP-U-014": {
    "name": "CollectionRenderer",
    "purpose": "article collections",
    "structuralVariants": "COL-*",
    "visualControls": "columns/gap/card profile",
    "data": "paginated summaries",
    "adminControl": "Collection profile",
    "responsive": "4->2->1 or recipe-specific safe reduction"
  },
  "CMP-U-015": {
    "name": "Pagination",
    "purpose": "next/previous/page navigation",
    "structuralVariants": "one engine",
    "visualControls": "compact/standard spacing",
    "data": "pagination data",
    "adminControl": "none",
    "responsive": "aria labels/current page"
  },
  "CMP-U-016": {
    "name": "ArticleHeader",
    "purpose": "article title/deck/meta",
    "structuralVariants": "ART-* header portion",
    "visualControls": "type/measure/meta placement",
    "data": "article data",
    "adminControl": "Article layout",
    "responsive": "one H1; metadata remains text"
  },
  "CMP-U-017": {
    "name": "FeaturedMedia",
    "purpose": "article/lead media",
    "structuralVariants": "framed/full/wide/contained",
    "visualControls": "ratio/radius/caption",
    "data": "PublicMedia",
    "adminControl": "image profile",
    "responsive": "responsive sources; missing-media fallback"
  },
  "CMP-U-018": {
    "name": "ArticleBody",
    "purpose": "12 block renderer",
    "structuralVariants": "one controlled engine",
    "visualControls": "body typography/measure/block tokens",
    "data": "structured body",
    "adminControl": "article typography only",
    "responsive": "semantic block output"
  },
  "CMP-U-019": {
    "name": "RichText",
    "purpose": "inline runs",
    "structuralVariants": "one engine",
    "visualControls": "inherited",
    "data": "RichText",
    "adminControl": "none",
    "responsive": "safe links; no raw HTML"
  },
  "CMP-U-020": {
    "name": "MediaBlock",
    "purpose": "body media",
    "structuralVariants": "contained/wide where contract allows",
    "visualControls": "ratio/rounding",
    "data": "media",
    "adminControl": "article image profile",
    "responsive": "caption/alt"
  },
  "CMP-U-021": {
    "name": "TableBlock",
    "purpose": "body table",
    "structuralVariants": "scroll container",
    "visualControls": "border/density",
    "data": "table block",
    "adminControl": "inherited",
    "responsive": "horizontal scroll; headers preserved"
  },
  "CMP-U-022": {
    "name": "QuoteBlock",
    "purpose": "quote",
    "structuralVariants": "standard/pull-quote treatment",
    "visualControls": "accent/type",
    "data": "quote block",
    "adminControl": "article profile",
    "responsive": "blockquote semantics"
  },
  "CMP-U-023": {
    "name": "CalloutBlock",
    "purpose": "highlighted note",
    "structuralVariants": "info/warning-like content-defined kind only if current block supports",
    "visualControls": "border/surface",
    "data": "callout block",
    "adminControl": "none beyond article theme",
    "responsive": "contrast"
  },
  "CMP-U-024": {
    "name": "CTAArticleBlock",
    "purpose": "structured article CTA",
    "structuralVariants": "controlled button/link",
    "visualControls": "button profile",
    "data": "CTA block",
    "adminControl": "button profile",
    "responsive": "safe destination, keyboard accessible"
  },
  "CMP-U-025": {
    "name": "DisclaimerBlock",
    "purpose": "controlled disclaimer",
    "structuralVariants": "one structure",
    "visualControls": "accent/surface",
    "data": "block payload",
    "adminControl": "none",
    "responsive": "semantic text"
  },
  "CMP-U-026": {
    "name": "SourcesBlock",
    "purpose": "references",
    "structuralVariants": "list",
    "visualControls": "typography/divider",
    "data": "block payload",
    "adminControl": "none",
    "responsive": "link semantics"
  },
  "CMP-U-027": {
    "name": "TagList",
    "purpose": "article tags",
    "structuralVariants": "inline wrap",
    "visualControls": "pill/text profile",
    "data": "tags",
    "adminControl": "inherited",
    "responsive": "wraps; meaningful links"
  },
  "CMP-U-028": {
    "name": "AuthorProfile",
    "purpose": "Author page identity",
    "structuralVariants": "AUTH-* subset",
    "visualControls": "avatar/type/chrome",
    "data": "author profile",
    "adminControl": "author profile setting",
    "responsive": "fallback avatar"
  },
  "CMP-U-029": {
    "name": "SearchForm",
    "purpose": "public site search",
    "structuralVariants": "standard/compact",
    "visualControls": "field/button profile",
    "data": "query",
    "adminControl": "limited profile",
    "responsive": "labelled field, submit accessible"
  },
  "CMP-U-030": {
    "name": "EmptyState",
    "purpose": "no content/results",
    "structuralVariants": "one engine",
    "visualControls": "tone/spacing",
    "data": "state",
    "adminControl": "none",
    "responsive": "never decorative-only"
  },
  "CMP-U-031": {
    "name": "RuntimeErrorState",
    "purpose": "transport/contract errors",
    "structuralVariants": "one engine",
    "visualControls": "system-only",
    "data": "failure data",
    "adminControl": "none",
    "responsive": "status text exposed"
  },
  "CMP-U-032": {
    "name": "NotFoundState",
    "purpose": "404",
    "structuralVariants": "known-site/neutral context",
    "visualControls": "limited",
    "data": "NotFound data",
    "adminControl": "none",
    "responsive": "correct HTTP status"
  },
  "CMP-U-033": {
    "name": "GoneState",
    "purpose": "410",
    "structuralVariants": "known-site",
    "visualControls": "limited",
    "data": "Gone data",
    "adminControl": "none",
    "responsive": "correct HTTP status"
  },
  "CMP-U-034": {
    "name": "InformationPageBody",
    "purpose": "fixed pages",
    "structuralVariants": "controlled sections",
    "visualControls": "legal/reading width",
    "data": "site settings fixed content",
    "adminControl": "Information Pages editor",
    "responsive": "no raw HTML"
  },
  "CMP-U-035": {
    "name": "SocialLinks",
    "purpose": "site social profiles",
    "structuralVariants": "fixed Footer placement with responsive stack",
    "visualControls": "spacing/icon/text",
    "data": "settings",
    "adminControl": "existing settings",
    "responsive": "names accessible"
  },
  "CMP-U-036": {
    "name": "SectionHeading",
    "purpose": "section label",
    "structuralVariants": "standard/editorial/compact",
    "visualControls": "type/accent/rule",
    "data": "section label",
    "adminControl": "recipe",
    "responsive": "correct heading level"
  },
  "CMP-U-037": {
    "name": "Button",
    "purpose": "shared CTA/button",
    "structuralVariants": "BTN-*",
    "visualControls": "size/radius/fill",
    "data": "destination/action",
    "adminControl": "profile selection only",
    "responsive": "contrast/focus/touch size"
  },
  "CMP-U-038": {
    "name": "ResponsiveMedia",
    "purpose": "picture/source generation",
    "structuralVariants": "one engine",
    "visualControls": "crop/ratio via profile",
    "data": "PublicMedia variants",
    "adminControl": "image profile",
    "responsive": "avoids layout shift where dimensions known"
  },
  "CMP-U-039": {
    "name": "SkipLink",
    "purpose": "accessibility",
    "structuralVariants": "one",
    "visualControls": "theme-aware focus",
    "data": "none",
    "adminControl": "none",
    "responsive": "first focusable control"
  },
  "CMP-U-040": {
    "name": "ThemeProvider",
    "purpose": "maps validated presentation to CSS variables/data attributes",
    "structuralVariants": "one",
    "visualControls": "all safe tokens",
    "data": "presentation config",
    "adminControl": "indirect",
    "responsive": "request-local; no tenant-global mutable state"
  }
} as const;

export const articleCards = {
  "CARD-01": {
    "name": "Image Top Standard",
    "description": "image top; eyebrow; title; excerpt; meta"
  },
  "CARD-02": {
    "name": "Image Top Compact",
    "description": "image top; title; compact meta; no excerpt"
  },
  "CARD-03": {
    "name": "Image Top Editorial",
    "description": "image top; large serif title; excerpt optional"
  },
  "CARD-04": {
    "name": "Image Top Bordered",
    "description": "flat border; no shadow"
  },
  "CARD-05": {
    "name": "Image Top Elevated",
    "description": "surface + approved elevation"
  },
  "CARD-06": {
    "name": "Image Left Standard",
    "description": "left thumbnail; title/excerpt/meta right"
  },
  "CARD-07": {
    "name": "Image Left Compact",
    "description": "small left thumbnail; title/meta"
  },
  "CARD-08": {
    "name": "Image Left Editorial",
    "description": "large left image; title/excerpt"
  },
  "CARD-09": {
    "name": "Image Right Standard",
    "description": "content left; image right"
  },
  "CARD-10": {
    "name": "Image Right Compact",
    "description": "compact content left; thumb right"
  },
  "CARD-11": {
    "name": "Horizontal Feature",
    "description": "wide 40/60 image/content split"
  },
  "CARD-12": {
    "name": "Horizontal Reverse",
    "description": "wide content/image reverse split"
  },
  "CARD-13": {
    "name": "Overlay Dark",
    "description": "image full; controlled dark overlay; title/meta"
  },
  "CARD-14": {
    "name": "Overlay Light",
    "description": "image full; light surface caption zone"
  },
  "CARD-15": {
    "name": "Text Only Minimal",
    "description": "no image; title/excerpt/meta"
  },
  "CARD-16": {
    "name": "Text Only Bordered",
    "description": "no image; border and category accent"
  },
  "CARD-17": {
    "name": "Numbered List",
    "description": "ordinal + title + meta; image optional"
  },
  "CARD-18": {
    "name": "Category Accent",
    "description": "category label/accent rule emphasized"
  },
  "CARD-19": {
    "name": "Author Focus",
    "description": "author avatar/name prominent with title"
  },
  "CARD-20": {
    "name": "Date Focus",
    "description": "date block prominent with title"
  },
  "CARD-21": {
    "name": "Excerpt Focus",
    "description": "longer excerpt, reduced image"
  },
  "CARD-22": {
    "name": "Title Focus",
    "description": "large title, minimal supporting metadata"
  },
  "CARD-23": {
    "name": "Square Media",
    "description": "1:1 media with compact text"
  },
  "CARD-24": {
    "name": "Portrait Media",
    "description": "4:5 media treatment; editorial text below"
  },
  "CARD-25": {
    "name": "Landscape Media",
    "description": "16:9 media; title/meta below"
  },
  "CARD-26": {
    "name": "Soft Surface",
    "description": "surface-alt background; no shadow"
  },
  "CARD-27": {
    "name": "Rule Separated",
    "description": "no card chrome; list separated by rules"
  },
  "CARD-28": {
    "name": "Magazine Tile",
    "description": "bold image + short title + category label"
  },
  "CARD-29": {
    "name": "Reading List",
    "description": "no border; left text, subtle right thumbnail"
  },
  "CARD-30": {
    "name": "Lead-Support",
    "description": "medium feature card for secondary lead items"
  }
} as const;

export const heroes = {
  "HERO-01": {
    "name": "Split 50/50",
    "description": "copy left; image right"
  },
  "HERO-02": {
    "name": "Split 60/40",
    "description": "copy dominant left; image right"
  },
  "HERO-03": {
    "name": "Split 40/60",
    "description": "image dominant right"
  },
  "HERO-04": {
    "name": "Reverse 50/50",
    "description": "image left; copy right"
  },
  "HERO-05": {
    "name": "Full-Bleed Overlay",
    "description": "image background; constrained overlay copy"
  },
  "HERO-06": {
    "name": "Contained Overlay",
    "description": "contained image with overlay panel"
  },
  "HERO-07": {
    "name": "Top Image",
    "description": "large image above title/excerpt"
  },
  "HERO-08": {
    "name": "Bottom Image",
    "description": "copy first; image below"
  },
  "HERO-09": {
    "name": "Editorial Text First",
    "description": "oversized title; image secondary"
  },
  "HERO-10": {
    "name": "Magazine Lead + Two Supports",
    "description": "one lead plus two secondary cards"
  },
  "HERO-11": {
    "name": "Lead + Four Supports",
    "description": "one lead plus 2x2 support cards"
  },
  "HERO-12": {
    "name": "Lead Rail",
    "description": "large lead plus vertical support rail"
  },
  "HERO-13": {
    "name": "Centered Statement",
    "description": "centered title/excerpt + image below"
  },
  "HERO-14": {
    "name": "Minimal Text",
    "description": "no required image; intro + lead link"
  },
  "HERO-15": {
    "name": "Framed Media",
    "description": "image in bordered/elevated frame"
  },
  "HERO-16": {
    "name": "Edge Media",
    "description": "media touches container edge, text padded"
  },
  "HERO-17": {
    "name": "Category Accent",
    "description": "accented category/eyebrow + lead"
  },
  "HERO-18": {
    "name": "Date-Led",
    "description": "publication/date context emphasized"
  },
  "HERO-19": {
    "name": "Author-Led",
    "description": "author context emphasized"
  },
  "HERO-20": {
    "name": "Image Mosaic",
    "description": "one lead media + two supporting media cells"
  },
  "HERO-21": {
    "name": "Newsroom Banner",
    "description": "wide lead strip with compact excerpt"
  },
  "HERO-22": {
    "name": "Journal Quiet",
    "description": "restrained image and serif title"
  },
  "HERO-23": {
    "name": "Sunrise Warm",
    "description": "soft alternate surface + split lead"
  },
  "HERO-24": {
    "name": "Dossier",
    "description": "structured label/value intro + lead"
  },
  "HERO-25": {
    "name": "Reading First",
    "description": "narrow copy column; image optional below"
  },
  "HERO-26": {
    "name": "Wide Panorama",
    "description": "16:9/2:1 media above compact lead copy"
  }
} as const;

export const categoryCards = {
  "CAT-01": {
    "name": "Text Tile",
    "description": "name + description"
  },
  "CAT-02": {
    "name": "Text Tile Accent",
    "description": "accent rule + name + description"
  },
  "CAT-03": {
    "name": "Count Tile",
    "description": "name + article count"
  },
  "CAT-04": {
    "name": "Minimal Link",
    "description": "name only"
  },
  "CAT-05": {
    "name": "Bordered Link",
    "description": "name in bordered tile"
  },
  "CAT-06": {
    "name": "Soft Surface",
    "description": "surface-alt tile"
  },
  "CAT-07": {
    "name": "Elevated Surface",
    "description": "light shadow tile"
  },
  "CAT-08": {
    "name": "Image Top",
    "description": "representative image top + name"
  },
  "CAT-09": {
    "name": "Image Left",
    "description": "thumb left + name/description"
  },
  "CAT-10": {
    "name": "Image Overlay",
    "description": "image + controlled text overlay"
  },
  "CAT-11": {
    "name": "Icon/Mark",
    "description": "approved generated mark + name"
  },
  "CAT-12": {
    "name": "Editorial Serif",
    "description": "large serif name + description"
  },
  "CAT-13": {
    "name": "Magazine Bold",
    "description": "bold name + count"
  },
  "CAT-14": {
    "name": "Numbered",
    "description": "ordinal + name"
  },
  "CAT-15": {
    "name": "Pill",
    "description": "compact rounded link"
  },
  "CAT-16": {
    "name": "Underline",
    "description": "text link with accent underline"
  },
  "CAT-17": {
    "name": "Rule List",
    "description": "vertical rule-separated list"
  },
  "CAT-18": {
    "name": "Two-Line Compact",
    "description": "name + short description"
  },
  "CAT-19": {
    "name": "Wide Banner",
    "description": "wide row with name/description"
  },
  "CAT-20": {
    "name": "Split Accent",
    "description": "accent block left + text right"
  },
  "CAT-21": {
    "name": "Monochrome",
    "description": "neutral text/surface only"
  },
  "CAT-22": {
    "name": "High Contrast",
    "description": "primary surface with accessible inverse text"
  },
  "CAT-23": {
    "name": "Outline Accent",
    "description": "accent border only"
  },
  "CAT-24": {
    "name": "Centered",
    "description": "centered name/description"
  },
  "CAT-25": {
    "name": "Directory",
    "description": "compact multi-column category directory item"
  }
} as const;

export const authorCards = {
  "AUTH-01": {
    "name": "Avatar Left",
    "description": "avatar left; name/bio right"
  },
  "AUTH-02": {
    "name": "Avatar Top",
    "description": "avatar centered/top; copy below"
  },
  "AUTH-03": {
    "name": "Compact Row",
    "description": "small avatar; name/designation"
  },
  "AUTH-04": {
    "name": "Editorial Bio",
    "description": "large name; bio; subtle avatar"
  },
  "AUTH-05": {
    "name": "Minimal Name",
    "description": "name/designation only"
  },
  "AUTH-06": {
    "name": "Bordered Profile",
    "description": "bordered surface; avatar/name/bio"
  },
  "AUTH-07": {
    "name": "Elevated Profile",
    "description": "elevated surface"
  },
  "AUTH-08": {
    "name": "Round Avatar",
    "description": "large circular avatar"
  },
  "AUTH-09": {
    "name": "Square Avatar",
    "description": "square/soft-radius avatar"
  },
  "AUTH-10": {
    "name": "Monogram",
    "description": "generated initials when no image"
  },
  "AUTH-11": {
    "name": "Expertise Focus",
    "description": "expertise labels prominent"
  },
  "AUTH-12": {
    "name": "Article Count",
    "description": "article count prominent"
  },
  "AUTH-13": {
    "name": "Social Focus",
    "description": "approved social/profile links prominent"
  },
  "AUTH-14": {
    "name": "Bio Focus",
    "description": "longer bio width"
  },
  "AUTH-15": {
    "name": "Designation Focus",
    "description": "role/title emphasized"
  },
  "AUTH-16": {
    "name": "Horizontal Wide",
    "description": "wide avatar + multi-line bio"
  },
  "AUTH-17": {
    "name": "Centered Profile",
    "description": "centered avatar/copy"
  },
  "AUTH-18": {
    "name": "Rule Separated",
    "description": "no card chrome; horizontal rule"
  },
  "AUTH-19": {
    "name": "Soft Surface",
    "description": "surface-alt profile"
  },
  "AUTH-20": {
    "name": "Accent Edge",
    "description": "accent left border"
  },
  "AUTH-21": {
    "name": "Magazine Contributor",
    "description": "bold name, compact bio, avatar"
  },
  "AUTH-22": {
    "name": "Journal Contributor",
    "description": "serif name, quiet metadata"
  },
  "AUTH-23": {
    "name": "Newsroom Byline",
    "description": "compact newsroom-style identity"
  },
  "AUTH-24": {
    "name": "Reading Profile",
    "description": "narrow text-first profile"
  },
  "AUTH-25": {
    "name": "Dossier Profile",
    "description": "labelled author details + bio"
  }
} as const;

export const homepages = {
  "HOME-01": {
    "name": "Balanced Editorial",
    "description": "intro > split lead > selected posts grid > categories > latest grid"
  },
  "HOME-02": {
    "name": "Magazine Pair",
    "description": "masthead intro > lead + supports > category band > latest 2-column"
  },
  "HOME-03": {
    "name": "Journal Grid",
    "description": "intro > quiet lead > 3-column selected posts > category directory > latest"
  },
  "HOME-04": {
    "name": "Reading First",
    "description": "intro > text-forward lead > 1-column latest > categories later"
  },
  "HOME-05": {
    "name": "Newsroom Wide",
    "description": "compact intro > wide lead > 3-column latest > selected section bands"
  },
  "HOME-06": {
    "name": "Knowledge Dossier",
    "description": "intro > dossier lead > category tiles > selected explainers > latest"
  },
  "HOME-07": {
    "name": "Feature Forward",
    "description": "large lead > secondary lead row > selected posts > categories > latest"
  },
  "HOME-08": {
    "name": "Category First",
    "description": "intro > category grid > lead > selected posts > latest"
  },
  "HOME-09": {
    "name": "Latest First",
    "description": "intro > latest grid/list > selected posts > categories"
  },
  "HOME-10": {
    "name": "Editorial Rail",
    "description": "lead + right support rail > section grids > latest"
  },
  "HOME-11": {
    "name": "Mosaic Lead",
    "description": "mosaic hero > selected posts > category tiles > latest"
  },
  "HOME-12": {
    "name": "Centered Magazine",
    "description": "centered intro > centered lead > 2-col sections > latest"
  },
  "HOME-13": {
    "name": "Compact Portal",
    "description": "compact intro > dense lead strip > dense cards > category directory"
  },
  "HOME-14": {
    "name": "Warm Lifestyle",
    "description": "soft-surface lead > spacious selected cards > categories > latest"
  },
  "HOME-15": {
    "name": "Minimal Publication",
    "description": "small intro > text lead > rule-separated latest > categories footerward"
  },
  "HOME-16": {
    "name": "Topic Hub",
    "description": "intro > categories > per-category selected sections > latest"
  },
  "HOME-17": {
    "name": "Editorial Sequence",
    "description": "intro > lead > one selected section at a time with alternating card layouts"
  },
  "HOME-18": {
    "name": "Lead + Directory",
    "description": "lead > category directory > latest list"
  },
  "HOME-19": {
    "name": "Visual Grid",
    "description": "image-forward lead > image-forward 3-col sections > latest"
  },
  "HOME-20": {
    "name": "Text Journal",
    "description": "text-forward lead > text/rule card lists > categories"
  },
  "HOME-21": {
    "name": "Two-Column Digest",
    "description": "lead > two-column section stream > latest"
  },
  "HOME-22": {
    "name": "Wide Feature Bands",
    "description": "lead > full-width section bands > latest compact"
  },
  "HOME-23": {
    "name": "Compact Hindi Editorial",
    "description": "localized heading treatment > lead > 3-col cards > category band"
  },
  "HOME-24": {
    "name": "Archive Forward",
    "description": "intro > latest/archive list > selected highlights > categories"
  },
  "HOME-25": {
    "name": "Hybrid Editorial",
    "description": "lead > selected feature row > category grid > latest mixed grid/list"
  }
} as const;

export const articleLayouts = {
  "ART-01": {
    "name": "Classic Centered",
    "description": "centered headline; wide media; narrow body"
  },
  "ART-02": {
    "name": "Editorial Wide",
    "description": "wide headline; 70ch body"
  },
  "ART-03": {
    "name": "Reading Narrow",
    "description": "narrow headline/body; minimal chrome"
  },
  "ART-04": {
    "name": "Magazine Header",
    "description": "wide headline + metadata row + strong media"
  },
  "ART-05": {
    "name": "Dossier",
    "description": "eyebrow/details + headline + structured after-content"
  },
  "ART-06": {
    "name": "Author Led",
    "description": "author identity near title"
  },
  "ART-07": {
    "name": "Date Led",
    "description": "date/updated metadata emphasized"
  },
  "ART-08": {
    "name": "Media First",
    "description": "featured image before headline"
  },
  "ART-09": {
    "name": "Headline First",
    "description": "large headline then media"
  },
  "ART-10": {
    "name": "Split Header",
    "description": "headline/meta beside featured media on wide screens"
  },
  "ART-11": {
    "name": "No Featured Media",
    "description": "graceful text-first when media absent"
  },
  "ART-12": {
    "name": "Compact News",
    "description": "compact header + denser body spacing"
  },
  "ART-13": {
    "name": "Longform",
    "description": "extra reading measure controls, large paragraph rhythm"
  },
  "ART-14": {
    "name": "Journal",
    "description": "serif hierarchy, rules, restrained cards"
  },
  "ART-15": {
    "name": "Warm Editorial",
    "description": "surface-alt accents and spacious blocks"
  },
  "ART-16": {
    "name": "Minimal Monochrome",
    "description": "near-zero decoration; typography hierarchy"
  }
} as const;

export const collections = {
  "COL-01": {
    "name": "Grid 3",
    "description": "3-column cards desktop"
  },
  "COL-02": {
    "name": "Grid 2",
    "description": "2-column cards desktop"
  },
  "COL-03": {
    "name": "Grid 4 Compact",
    "description": "4-column compact cards on wide screens"
  },
  "COL-04": {
    "name": "Single List",
    "description": "1-column article list"
  },
  "COL-05": {
    "name": "Media List",
    "description": "horizontal media list"
  },
  "COL-06": {
    "name": "Editorial List",
    "description": "text-forward list"
  },
  "COL-07": {
    "name": "Magazine Mixed",
    "description": "lead card + supporting grid"
  },
  "COL-08": {
    "name": "Compact Directory",
    "description": "dense link/card matrix"
  },
  "COL-09": {
    "name": "Masonry-Like Controlled",
    "description": "CSS grid varied spans from approved pattern; not arbitrary masonry JS"
  },
  "COL-10": {
    "name": "Numbered Digest",
    "description": "numbered list"
  },
  "COL-11": {
    "name": "Image Grid",
    "description": "image-forward compact grid"
  },
  "COL-12": {
    "name": "Hybrid",
    "description": "first two features + remaining list/grid"
  }
} as const;

export const typography = {
  "TYPE-01": {
    "name": "Fraunces / Nunito Sans",
    "heading": "Fraunces",
    "body": "Nunito Sans",
    "character": "editorial serif",
    "densityAffinity": "balanced"
  },
  "TYPE-02": {
    "name": "Literata / Inter",
    "heading": "Literata",
    "body": "Inter",
    "character": "literary serif",
    "densityAffinity": "balanced"
  },
  "TYPE-03": {
    "name": "Lora / Source Sans 3",
    "heading": "Lora",
    "body": "Source Sans 3",
    "character": "journal serif",
    "densityAffinity": "balanced"
  },
  "TYPE-04": {
    "name": "Cormorant / Manrope",
    "heading": "Cormorant Garamond",
    "body": "Manrope",
    "character": "high-contrast editorial",
    "densityAffinity": "spacious"
  },
  "TYPE-05": {
    "name": "Fraunces / Inter",
    "heading": "Fraunces",
    "body": "Inter",
    "character": "modern editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-06": {
    "name": "Libre Baskerville / Inter",
    "heading": "Libre Baskerville",
    "body": "Inter",
    "character": "reading",
    "densityAffinity": "spacious"
  },
  "TYPE-07": {
    "name": "Space Grotesk / Inter",
    "heading": "Space Grotesk",
    "body": "Inter",
    "character": "newsroom sans",
    "densityAffinity": "compact"
  },
  "TYPE-08": {
    "name": "Spectral / IBM Plex Sans",
    "heading": "Spectral",
    "body": "IBM Plex Sans",
    "character": "dossier serif",
    "densityAffinity": "balanced"
  },
  "TYPE-09": {
    "name": "Playfair / Manrope",
    "heading": "Playfair Display",
    "body": "Manrope",
    "character": "magazine serif",
    "densityAffinity": "spacious"
  },
  "TYPE-10": {
    "name": "Cormorant / Inter",
    "heading": "Cormorant Garamond",
    "body": "Inter",
    "character": "heritage editorial",
    "densityAffinity": "spacious"
  },
  "TYPE-11": {
    "name": "Tiro Devanagari Hindi / Mukta",
    "heading": "Tiro Devanagari Hindi",
    "body": "Mukta",
    "character": "Hindi editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-12": {
    "name": "Karma / Hind",
    "heading": "Karma",
    "body": "Hind",
    "character": "Hindi reading",
    "densityAffinity": "balanced"
  },
  "TYPE-13": {
    "name": "Merriweather / Source Sans 3",
    "heading": "Merriweather",
    "body": "Source Sans 3",
    "character": "practical serif",
    "densityAffinity": "balanced"
  },
  "TYPE-14": {
    "name": "Merriweather / Inter",
    "heading": "Merriweather",
    "body": "Inter",
    "character": "classic digital",
    "densityAffinity": "balanced"
  },
  "TYPE-15": {
    "name": "Lora / Inter",
    "heading": "Lora",
    "body": "Inter",
    "character": "clean journal",
    "densityAffinity": "balanced"
  },
  "TYPE-16": {
    "name": "Spectral / Inter",
    "heading": "Spectral",
    "body": "Inter",
    "character": "clean dossier",
    "densityAffinity": "balanced"
  },
  "TYPE-17": {
    "name": "Playfair / Inter",
    "heading": "Playfair Display",
    "body": "Inter",
    "character": "high-contrast magazine",
    "densityAffinity": "spacious"
  },
  "TYPE-18": {
    "name": "Fraunces / Source Sans 3",
    "heading": "Fraunces",
    "body": "Source Sans 3",
    "character": "friendly editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-19": {
    "name": "Libre Baskerville / Source Sans 3",
    "heading": "Libre Baskerville",
    "body": "Source Sans 3",
    "character": "longform",
    "densityAffinity": "spacious"
  },
  "TYPE-20": {
    "name": "Space Grotesk / Source Sans 3",
    "heading": "Space Grotesk",
    "body": "Source Sans 3",
    "character": "news sans",
    "densityAffinity": "compact"
  },
  "TYPE-21": {
    "name": "Tiro Devanagari Hindi / Hind",
    "heading": "Tiro Devanagari Hindi",
    "body": "Hind",
    "character": "Hindi traditional",
    "densityAffinity": "balanced"
  },
  "TYPE-22": {
    "name": "Karma / Mukta",
    "heading": "Karma",
    "body": "Mukta",
    "character": "Hindi soft editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-23": {
    "name": "Merriweather / IBM Plex Sans",
    "heading": "Merriweather",
    "body": "IBM Plex Sans",
    "character": "technical editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-24": {
    "name": "Lora / IBM Plex Sans",
    "heading": "Lora",
    "body": "IBM Plex Sans",
    "character": "knowledge editorial",
    "densityAffinity": "balanced"
  },
  "TYPE-25": {
    "name": "Cormorant / Source Sans 3",
    "heading": "Cormorant Garamond",
    "body": "Source Sans 3",
    "character": "heritage airy",
    "densityAffinity": "spacious"
  },
  "TYPE-26": {
    "name": "Fraunces / Manrope",
    "heading": "Fraunces",
    "body": "Manrope",
    "character": "modern lifestyle",
    "densityAffinity": "spacious"
  },
  "TYPE-27": {
    "name": "Spectral / Manrope",
    "heading": "Spectral",
    "body": "Manrope",
    "character": "soft magazine",
    "densityAffinity": "balanced"
  },
  "TYPE-28": {
    "name": "System Sans / System Sans",
    "heading": "system-ui",
    "body": "system-ui",
    "character": "utility/performance",
    "densityAffinity": "compact"
  }
} as const;

export const palettes = {
  "PAL-01": {
    "name": "Indigo Gold Editorial",
    "primary": "#1F2A5A",
    "secondary": "#5868B6",
    "accent": "#F2B84B",
    "background": "#F8F6FF",
    "surface": "#FFFFFF",
    "text": "#171B32",
    "muted": "#5D6478",
    "border": "#D9DCEF",
    "focus": "#4C5DB3",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-02": {
    "name": "Warm Heritage Editorial",
    "primary": "#30375D",
    "secondary": "#B06B45",
    "accent": "#C5A253",
    "background": "#F8F3E9",
    "surface": "#FFFFFF",
    "text": "#20243A",
    "muted": "#666B7C",
    "border": "#DDD5C5",
    "focus": "#4D5791",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-03": {
    "name": "Sage Journal",
    "primary": "#285047",
    "secondary": "#C66C4B",
    "accent": "#D1A23B",
    "background": "#FBF7EE",
    "surface": "#FFFFFF",
    "text": "#1D2B28",
    "muted": "#66736F",
    "border": "#DDD5C6",
    "focus": "#285047",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-04": {
    "name": "Plum Magazine",
    "primary": "#4A234F",
    "secondary": "#A04E69",
    "accent": "#E09B66",
    "background": "#FFF7F4",
    "surface": "#FFFFFF",
    "text": "#2C1D2F",
    "muted": "#75636F",
    "border": "#E8D4DA",
    "focus": "#7A2E67",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-05": {
    "name": "Sunrise Orchid",
    "primary": "#2C244D",
    "secondary": "#995479",
    "accent": "#E67A3A",
    "background": "#FFF8F4",
    "surface": "#FFFFFF",
    "text": "#241E35",
    "muted": "#6C6377",
    "border": "#E4D8DE",
    "focus": "#6A45A1",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-06": {
    "name": "Blue Reading Essay",
    "primary": "#20365F",
    "secondary": "#536AA6",
    "accent": "#D6A547",
    "background": "#F6F7FB",
    "surface": "#FFFFFF",
    "text": "#17213A",
    "muted": "#606B82",
    "border": "#D8DFEB",
    "focus": "#435FA3",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-07": {
    "name": "Newsroom Blue",
    "primary": "#101A2D",
    "secondary": "#2D5C7A",
    "accent": "#F0B44D",
    "background": "#F4F7FB",
    "surface": "#FFFFFF",
    "text": "#101828",
    "muted": "#5F6B7A",
    "border": "#D5DDE7",
    "focus": "#2D5C7A",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-08": {
    "name": "Dossier Navy",
    "primary": "#17233C",
    "secondary": "#8E493E",
    "accent": "#B99A54",
    "background": "#FAF5E9",
    "surface": "#FFFFFF",
    "text": "#121B2D",
    "muted": "#636C7B",
    "border": "#D8CFBE",
    "focus": "#2E4A7A",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-09": {
    "name": "Rose Editorial",
    "primary": "#68273A",
    "secondary": "#AD6873",
    "accent": "#C69C55",
    "background": "#FFF7F3",
    "surface": "#FFFFFF",
    "text": "#2D1E24",
    "muted": "#75656B",
    "border": "#E7D6D7",
    "focus": "#7C3852",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-10": {
    "name": "Midnight Heritage",
    "primary": "#111A36",
    "secondary": "#2C3B6B",
    "accent": "#C3A15A",
    "background": "#FCF8EF",
    "surface": "#FFFEFB",
    "text": "#111A36",
    "muted": "#616579",
    "border": "#E3D5B5",
    "focus": "#2C3B6B",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-11": {
    "name": "Almanac Hindi",
    "primary": "#27324D",
    "secondary": "#8B3F32",
    "accent": "#D7A43A",
    "background": "#FFF8E8",
    "surface": "#FFFDF7",
    "text": "#2A241C",
    "muted": "#6B6256",
    "border": "#E3D2B4",
    "focus": "#7A332B",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-12": {
    "name": "Remedies Green",
    "primary": "#244A3B",
    "secondary": "#8A4F43",
    "accent": "#D79336",
    "background": "#FFF8ED",
    "surface": "#FFFFFF",
    "text": "#1F2E28",
    "muted": "#66756E",
    "border": "#DDD8C7",
    "focus": "#3C6655",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-13": {
    "name": "Ritual Maroon",
    "primary": "#5B2932",
    "secondary": "#A45E33",
    "accent": "#C68D36",
    "background": "#FFF7EE",
    "surface": "#FFFEFB",
    "text": "#2F2024",
    "muted": "#786A6D",
    "border": "#E6D4C4",
    "focus": "#7A3344",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-14": {
    "name": "Vastu Slate",
    "primary": "#29383D",
    "secondary": "#A85A3E",
    "accent": "#C1A06B",
    "background": "#F5F2EA",
    "surface": "#FFFFFF",
    "text": "#1F292C",
    "muted": "#687579",
    "border": "#D7D2C6",
    "focus": "#355E5A",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-15": {
    "name": "Ocean Teal",
    "primary": "#124E66",
    "secondary": "#2E7185",
    "accent": "#E1A948",
    "background": "#F4FAFB",
    "surface": "#FFFFFF",
    "text": "#102E3A",
    "muted": "#5D7078",
    "border": "#CFE0E5",
    "focus": "#146B82",
    "success": "#2E7D32",
    "warning": "#A66A00",
    "error": "#B3261E"
  },
  "PAL-16": {
    "name": "Forest Copper",
    "primary": "#1E493A",
    "secondary": "#55735E",
    "accent": "#B66D3A",
    "background": "#F7F5EF",
    "surface": "#FFFFFF",
    "text": "#1B2D26",
    "muted": "#66736B",
    "border": "#D8DED8",
    "focus": "#27654E",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-17": {
    "name": "Royal Violet",
    "primary": "#3C2564",
    "secondary": "#6B4E99",
    "accent": "#D29B4A",
    "background": "#F8F5FC",
    "surface": "#FFFFFF",
    "text": "#251A37",
    "muted": "#6B6277",
    "border": "#DED6EA",
    "focus": "#6949A8",
    "success": "#287D3C",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-18": {
    "name": "Terracotta Sand",
    "primary": "#7A3F2D",
    "secondary": "#B36B4D",
    "accent": "#D7A449",
    "background": "#FFF7EF",
    "surface": "#FFFFFF",
    "text": "#3B2821",
    "muted": "#78665D",
    "border": "#E8D8CC",
    "focus": "#98523B",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-19": {
    "name": "Slate Saffron",
    "primary": "#26343D",
    "secondary": "#536570",
    "accent": "#E3A330",
    "background": "#F5F7F8",
    "surface": "#FFFFFF",
    "text": "#18242A",
    "muted": "#64717A",
    "border": "#D8E0E4",
    "focus": "#355A70",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-20": {
    "name": "Emerald Cream",
    "primary": "#174A3C",
    "secondary": "#4B776A",
    "accent": "#C99A3B",
    "background": "#F9F7EE",
    "surface": "#FFFFFF",
    "text": "#183129",
    "muted": "#68756F",
    "border": "#DCE0D7",
    "focus": "#296555",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-21": {
    "name": "Burgundy Ivory",
    "primary": "#6B2338",
    "secondary": "#9E5869",
    "accent": "#C89A54",
    "background": "#FFF9F1",
    "surface": "#FFFFFF",
    "text": "#332026",
    "muted": "#76666B",
    "border": "#E7D9D8",
    "focus": "#8D3450",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-22": {
    "name": "Indigo Mint",
    "primary": "#243C70",
    "secondary": "#506CAA",
    "accent": "#59A889",
    "background": "#F4F8FB",
    "surface": "#FFFFFF",
    "text": "#17223B",
    "muted": "#626F82",
    "border": "#D6DFEA",
    "focus": "#3B5F9A",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-23": {
    "name": "Charcoal Rose",
    "primary": "#302D33",
    "secondary": "#6A5A67",
    "accent": "#C77B91",
    "background": "#F8F5F7",
    "surface": "#FFFFFF",
    "text": "#211E22",
    "muted": "#6E6870",
    "border": "#DFD8DD",
    "focus": "#6E4961",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-24": {
    "name": "Cobalt Amber",
    "primary": "#183E75",
    "secondary": "#416AA6",
    "accent": "#E0A53E",
    "background": "#F5F8FD",
    "surface": "#FFFFFF",
    "text": "#17263C",
    "muted": "#667286",
    "border": "#D7E0EC",
    "focus": "#305E9B",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-25": {
    "name": "Earth Olive",
    "primary": "#4B512A",
    "secondary": "#777B4D",
    "accent": "#C28A3A",
    "background": "#FBF8EF",
    "surface": "#FFFFFF",
    "text": "#2D3020",
    "muted": "#70715F",
    "border": "#E0DDCF",
    "focus": "#656B39",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-26": {
    "name": "Peacock",
    "primary": "#0E5960",
    "secondary": "#487B82",
    "accent": "#D89B3C",
    "background": "#F4FAFA",
    "surface": "#FFFFFF",
    "text": "#173238",
    "muted": "#627779",
    "border": "#D4E3E4",
    "focus": "#18747D",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-27": {
    "name": "Lotus Pink",
    "primary": "#7C365D",
    "secondary": "#B5678B",
    "accent": "#D99C50",
    "background": "#FFF7FB",
    "surface": "#FFFFFF",
    "text": "#35212D",
    "muted": "#77636E",
    "border": "#E8D8E1",
    "focus": "#9A4E75",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-28": {
    "name": "Monochrome Gold",
    "primary": "#252525",
    "secondary": "#555555",
    "accent": "#B08A42",
    "background": "#F7F7F5",
    "surface": "#FFFFFF",
    "text": "#1A1A1A",
    "muted": "#666666",
    "border": "#DDDDD8",
    "focus": "#4C4C4C",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-29": {
    "name": "Sky Sand",
    "primary": "#275B7A",
    "secondary": "#6289A2",
    "accent": "#C99C58",
    "background": "#F7FAFC",
    "surface": "#FFFFFF",
    "text": "#1C3340",
    "muted": "#687781",
    "border": "#D9E3E8",
    "focus": "#3B7495",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  },
  "PAL-30": {
    "name": "Saffron Maroon",
    "primary": "#742F2A",
    "secondary": "#A35B4A",
    "accent": "#D9952C",
    "background": "#FFF8EB",
    "surface": "#FFFFFF",
    "text": "#352421",
    "muted": "#75655E",
    "border": "#E7D8C5",
    "focus": "#8E4037",
    "success": "#2E7D32",
    "warning": "#9A6700",
    "error": "#B42318"
  }
} as const;

export const buttons = {
  "BTN-01": {
    "name": "Solid Primary",
    "description": "primary fill, accessible inverse text"
  },
  "BTN-02": {
    "name": "Solid Secondary",
    "description": "secondary fill, inverse text"
  },
  "BTN-03": {
    "name": "Accent",
    "description": "accent fill only when contrast passes"
  },
  "BTN-04": {
    "name": "Outline Primary",
    "description": "transparent/surface fill + primary border"
  },
  "BTN-05": {
    "name": "Outline Neutral",
    "description": "surface + border token"
  },
  "BTN-06": {
    "name": "Soft Primary",
    "description": "primary-tinted surface + primary text"
  },
  "BTN-07": {
    "name": "Text Link",
    "description": "no container chrome; underline/focus treatment"
  },
  "BTN-08": {
    "name": "Compact Solid",
    "description": "smaller padding, same touch-target minimum"
  },
  "BTN-09": {
    "name": "Wide Solid",
    "description": "full/large inline width where recipe calls for it"
  },
  "BTN-10": {
    "name": "Icon + Text",
    "description": "approved icon slot plus label"
  },
  "BTN-11": {
    "name": "Editorial Arrow",
    "description": "text + code-owned directional glyph"
  },
  "BTN-12": {
    "name": "High Contrast",
    "description": "primary/text pair chosen from validated high-contrast mapping"
  }
} as const;

export const images = {
  "IMG-01": {
    "name": "Natural",
    "description": "intrinsic ratio, max width"
  },
  "IMG-02": {
    "name": "Landscape 4:3",
    "description": "cover for cards only"
  },
  "IMG-03": {
    "name": "Landscape 16:9",
    "description": "cover for cards/heroes"
  },
  "IMG-04": {
    "name": "Panorama 2:1",
    "description": "wide hero use"
  },
  "IMG-05": {
    "name": "Square 1:1",
    "description": "cards/avatars where semantically valid"
  },
  "IMG-06": {
    "name": "Portrait 4:5",
    "description": "editorial card use"
  },
  "IMG-07": {
    "name": "Portrait 3:4",
    "description": "editorial card use"
  },
  "IMG-08": {
    "name": "Contained Frame",
    "description": "contain + surface frame; no crop"
  },
  "IMG-09": {
    "name": "Soft Radius",
    "description": "ratio inherited; medium radius"
  },
  "IMG-10": {
    "name": "Square Edge",
    "description": "ratio inherited; zero/small radius"
  },
  "IMG-11": {
    "name": "Captioned",
    "description": "media + visible caption spacing"
  },
  "IMG-12": {
    "name": "Edge-to-Container",
    "description": "hero/featured media may use container edge but never viewport overflow"
  }
} as const;
