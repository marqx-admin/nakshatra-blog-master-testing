import {
  articleCards, articleLayouts, authorCards, buttons, categoryCards, collections,
  heroes, homepages, images, palettes, typography,
} from "./catalogue-data.ts";
import { cardNeedsMedia } from "./engines.ts";
import type { components } from "@bp/api-contract";

export const WIDTHS = { "WIDTH-READING": 760, "WIDTH-NARROW": 960, "WIDTH-STANDARD": 1120, "WIDTH-WIDE": 1200, "WIDTH-EXTRA-WIDE": 1280, "WIDTH-FLUID-CAPPED": 1360 } as const;
export const DENSITIES = { "DENSITY-COMPACT": { gap: "1.25rem", section: "2rem", padding: ".875rem" }, "DENSITY-STANDARD": { gap: "1.5rem", section: "3rem", padding: "1rem" }, "DENSITY-SPACIOUS": { gap: "2rem", section: "4.5rem", padding: "1.25rem" }, "DENSITY-AIRY": { gap: "2.5rem", section: "6rem", padding: "1.5rem" } } as const;
export const RADII = { "RADIUS-SQUARE": "4px", "RADIUS-SUBTLE": "8px", "RADIUS-MEDIUM": "12px", "RADIUS-SOFT": "18px", "RADIUS-ROUND": "24px" } as const;
export const BORDERS = { "BORDER-NONE": "0px", "BORDER-HAIRLINE": "1px", "BORDER-STANDARD": "2px", "BORDER-ACCENT-EDGE": "3px", "BORDER-RULE-DRIVEN": "1px" } as const;
export const ELEVATIONS = { "ELEVATION-FLAT": "none", "ELEVATION-LOW": "0 3px 12px #00000016", "ELEVATION-MEDIUM": "0 8px 24px #00000022", "ELEVATION-FLOATING": "0 16px 40px #0000002b" } as const;
export const SPACINGS = { COMPACT: "2rem", STANDARD: "3rem", SPACIOUS: "4.5rem" } as const;

export type DesignSelection = {
  palette: keyof typeof palettes; typography: keyof typeof typography; homepage: keyof typeof homepages;
  hero: keyof typeof heroes; articleCard: keyof typeof articleCards; categoryCard: keyof typeof categoryCards;
  authorCard: keyof typeof authorCards; article: keyof typeof articleLayouts; collection: keyof typeof collections;
  tagCollection: keyof typeof collections; authorCollection: keyof typeof collections; searchCollection: keyof typeof collections;
  collectionCard: keyof typeof articleCards; relatedCard: keyof typeof articleCards;
  image: keyof typeof images; heroImage: keyof typeof images; articleImage: keyof typeof images;
  button: keyof typeof buttons; density: keyof typeof DENSITIES;
  articleMeasure: "NARROW" | "STANDARD" | "WIDE";
  headlineScale: "STANDARD" | "LARGE" | "DISPLAY";
  metaLayout: "INLINE" | "STACKED";
  featuredRatio: "LANDSCAPE" | "WIDE";
  authorDisplay: "COMPACT" | "PROFILE";
  relatedLayout: "LIST" | "GRID";
  width: keyof typeof WIDTHS; radius: keyof typeof RADII; border: keyof typeof BORDERS;
  elevation: keyof typeof ELEVATIONS; spacing: keyof typeof SPACINGS;
};

// Platform defaults are tenant-independent and safe without optional media.
export const SAFE_DEFAULT: Readonly<DesignSelection> = Object.freeze({
  palette: "PAL-28", typography: "TYPE-28", homepage: "HOME-04", hero: "HERO-14",
  articleCard: "CARD-15", categoryCard: "CAT-01", authorCard: "AUTH-05", article: "ART-03",
  collection: "COL-04", tagCollection: "COL-04", authorCollection: "COL-04", searchCollection: "COL-04",
  collectionCard: "CARD-15", relatedCard: "CARD-15", image: "IMG-01", heroImage: "IMG-01", articleImage: "IMG-01",
  button: "BTN-07", density: "DENSITY-STANDARD",
  articleMeasure: "NARROW", headlineScale: "STANDARD", metaLayout: "INLINE",
  featuredRatio: "LANDSCAPE", authorDisplay: "COMPACT", relatedLayout: "LIST",
  width: "WIDTH-READING", radius: "RADIUS-SUBTLE", border: "BORDER-HAIRLINE",
  elevation: "ELEVATION-FLAT", spacing: "STANDARD",
});

type Style = { name: string; overlay: Partial<DesignSelection> };
// Exact owner-locked principal mappings. Every omitted field inherits SAFE_DEFAULT.
export const READY_STYLES: Readonly<Record<string, Style>> = Object.freeze({
  STYLE_01: { name: "Modern Magazine", overlay: { palette: "PAL-04", typography: "TYPE-09", homepage: "HOME-02", hero: "HERO-10", articleCard: "CARD-28", article: "ART-04", collection: "COL-07", image: "IMG-03", density: "DENSITY-STANDARD", width: "WIDTH-WIDE", radius: "RADIUS-MEDIUM", elevation: "ELEVATION-LOW" } },
  STYLE_02: { name: "Classic Editorial", overlay: { palette: "PAL-02", typography: "TYPE-02", homepage: "HOME-01", hero: "HERO-22", articleCard: "CARD-03", article: "ART-01", collection: "COL-06", image: "IMG-01", density: "DENSITY-SPACIOUS", width: "WIDTH-STANDARD", radius: "RADIUS-SUBTLE", border: "BORDER-RULE-DRIVEN" } },
  STYLE_03: { name: "Minimal Clean", overlay: { palette: "PAL-28", typography: "TYPE-28", homepage: "HOME-15", hero: "HERO-14", articleCard: "CARD-15", article: "ART-16", collection: "COL-04", image: "IMG-01", density: "DENSITY-STANDARD", width: "WIDTH-NARROW", radius: "RADIUS-SUBTLE", elevation: "ELEVATION-FLAT" } },
  STYLE_04: { name: "Bold News", overlay: { palette: "PAL-07", typography: "TYPE-07", homepage: "HOME-05", hero: "HERO-21", articleCard: "CARD-28", article: "ART-12", collection: "COL-01", image: "IMG-03", density: "DENSITY-COMPACT", width: "WIDTH-EXTRA-WIDE", radius: "RADIUS-SUBTLE", border: "BORDER-HAIRLINE" } },
  STYLE_05: { name: "Warm / Spiritual Editorial", overlay: { palette: "PAL-30", typography: "TYPE-12", homepage: "HOME-14", hero: "HERO-23", articleCard: "CARD-03", article: "ART-15", collection: "COL-02", image: "IMG-09", density: "DENSITY-SPACIOUS", width: "WIDTH-STANDARD", radius: "RADIUS-SOFT", elevation: "ELEVATION-LOW" } },
});

const ARCHETYPES = {
  BALANCED_EDITORIAL: { homepage: "HOME-01", palette: "PAL-02", typography: "TYPE-02", hero: "HERO-22", article: "ART-01", collection: "COL-06", image: "IMG-01", width: "WIDTH-STANDARD", radius: "RADIUS-SUBTLE", border: "BORDER-RULE-DRIVEN", elevation: "ELEVATION-FLAT", button: "BTN-07" },
  MAGAZINE_PAIR: { homepage: "HOME-02", palette: "PAL-04", typography: "TYPE-09", hero: "HERO-10", article: "ART-04", collection: "COL-07", image: "IMG-03", width: "WIDTH-WIDE", radius: "RADIUS-MEDIUM", border: "BORDER-HAIRLINE", elevation: "ELEVATION-LOW", button: "BTN-01" },
  JOURNAL_GRID: { homepage: "HOME-03", palette: "PAL-03", typography: "TYPE-03", hero: "HERO-22", article: "ART-14", collection: "COL-01", image: "IMG-01", width: "WIDTH-WIDE", radius: "RADIUS-SUBTLE", border: "BORDER-RULE-DRIVEN", elevation: "ELEVATION-FLAT", button: "BTN-07" },
  READING_FIRST: { homepage: "HOME-04", palette: "PAL-28", typography: "TYPE-28", hero: "HERO-14", article: "ART-03", collection: "COL-04", image: "IMG-01", width: "WIDTH-READING", radius: "RADIUS-SUBTLE", border: "BORDER-HAIRLINE", elevation: "ELEVATION-FLAT", button: "BTN-07" },
  NEWSROOM_WIDE: { homepage: "HOME-05", palette: "PAL-07", typography: "TYPE-07", hero: "HERO-21", article: "ART-12", collection: "COL-01", image: "IMG-03", width: "WIDTH-EXTRA-WIDE", radius: "RADIUS-SUBTLE", border: "BORDER-HAIRLINE", elevation: "ELEVATION-FLAT", button: "BTN-08" },
  KNOWLEDGE_DOSSIER: { homepage: "HOME-06", palette: "PAL-08", typography: "TYPE-08", hero: "HERO-24", article: "ART-05", collection: "COL-08", image: "IMG-08", width: "WIDTH-STANDARD", radius: "RADIUS-SUBTLE", border: "BORDER-RULE-DRIVEN", elevation: "ELEVATION-FLAT", button: "BTN-04" },
  FEATURE_FORWARD: { homepage: "HOME-07", palette: "PAL-04", typography: "TYPE-09", hero: "HERO-10", article: "ART-04", collection: "COL-07", image: "IMG-03", width: "WIDTH-WIDE", radius: "RADIUS-MEDIUM", border: "BORDER-HAIRLINE", elevation: "ELEVATION-LOW", button: "BTN-01" },
} as const satisfies Record<string, Partial<DesignSelection>>;
export type Archetype = keyof typeof ARCHETYPES;
export type CardSystem = "MEDIA_FIRST" | "TEXT_FIRST";
export const RECIPE_DENSITIES = ["DENSITY-COMPACT", "DENSITY-STANDARD", "DENSITY-SPACIOUS"] as const;
export const INTERNAL_RECIPES = Object.freeze(Object.entries(ARCHETYPES).flatMap(([archetype, anchor]) =>
  (["MEDIA_FIRST", "TEXT_FIRST"] as const).flatMap((cardSystem) => RECIPE_DENSITIES.map((density) => ({
    id: `${archetype}__${cardSystem}__${density}`,
    archetype: archetype as Archetype, cardSystem, density,
    config: { ...SAFE_DEFAULT, ...anchor, articleCard: cardSystem === "MEDIA_FIRST" ? "CARD-01" : "CARD-15", density } as DesignSelection,
  })))));

type Parity = { siteKey: string; name: string; legacyWidth: number; overlay: Partial<DesignSelection> };
// Blueprint §40 migration starting points; midpoint widths normalize downward by owner decision.
export const LEGACY_PARITY: readonly Parity[] = Object.freeze([
  ["SITE-01", "WhatsYourRashi", "PAL-01", "TYPE-01", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-SPACIOUS", 1200, "RADIUS-SOFT"],
  ["SITE-02", "ApkiRashi", "PAL-02", "TYPE-02", "HOME-01", "ART-01", "CARD-01", "COL-02", "DENSITY-STANDARD", 1200, "RADIUS-MEDIUM"],
  ["SITE-03", "DailyRashi360", "PAL-03", "TYPE-03", "HOME-03", "ART-14", "CARD-01", "COL-01", "DENSITY-STANDARD", 1200, "RADIUS-SOFT"],
  ["SITE-04", "ZodiacDaily", "PAL-04", "TYPE-04", "HOME-02", "ART-04", "CARD-01", "COL-02", "DENSITY-SPACIOUS", 1200, "RADIUS-ROUND"],
  ["SITE-05", "DailyHoroscope360", "PAL-05", "TYPE-05", "HOME-14", "ART-01", "CARD-01", "COL-02", "DENSITY-STANDARD", 1240, "RADIUS-SOFT"],
  ["SITE-06", "MyHoroscope360", "PAL-06", "TYPE-06", "HOME-04", "ART-03", "CARD-29", "COL-04", "DENSITY-STANDARD", 1120, "RADIUS-SOFT"],
  ["SITE-07", "AstroToday360", "PAL-07", "TYPE-07", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-STANDARD", 1280, "RADIUS-MEDIUM"],
  ["SITE-08", "ApkiKundli", "PAL-08", "TYPE-08", "HOME-01", "ART-01", "CARD-01", "COL-02", "DENSITY-STANDARD", 1240, "RADIUS-SUBTLE"],
  ["SITE-09", "MatchYourKundli", "PAL-09", "TYPE-09", "HOME-01", "ART-01", "CARD-01", "COL-02", "DENSITY-SPACIOUS", 1200, "RADIUS-SOFT"],
  ["SITE-10", "ApkaNakshatra", "PAL-10", "TYPE-10", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-SPACIOUS", 1200, "RADIUS-MEDIUM"],
  ["SITE-11", "JaniyePanchang", "PAL-11", "TYPE-11", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-STANDARD", 1160, "RADIUS-SUBTLE"],
  ["SITE-12", "RashiRemedies", "PAL-12", "TYPE-12", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-SPACIOUS", 1120, "RADIUS-SOFT"],
  ["SITE-13", "ApkaPandit", "PAL-13", "TYPE-13", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-SPACIOUS", 1160, "RADIUS-MEDIUM"],
  ["SITE-14", "VastuShastra360", "PAL-14", "TYPE-14", "HOME-01", "ART-01", "CARD-01", "COL-01", "DENSITY-STANDARD", 1280, "RADIUS-SQUARE"],
].map(([siteKey, name, palette, typography, homepage, article, articleCard, collection, density, legacyWidth, radius]) => ({
  siteKey: siteKey as string, name: name as string, legacyWidth: legacyWidth as number,
  overlay: { palette, typography, homepage, article, articleCard, collection, density, radius,
    width: ({ 1120: "WIDTH-STANDARD", 1160: "WIDTH-STANDARD", 1200: "WIDTH-WIDE", 1240: "WIDTH-WIDE", 1280: "WIDTH-EXTRA-WIDE" } as Record<number, DesignSelection["width"]>)[legacyWidth as number],
  } as Partial<DesignSelection>,
})));

export function toPresentationConfig(selection: Readonly<DesignSelection>, styleId: "STYLE_01" | "STYLE_02" | "STYLE_03" | "STYLE_04" | "STYLE_05" | "CUSTOM" = "CUSTOM"): components["schemas"]["PresentationConfig"] {
  return {
    schema_version: 1 as const, style_id: styleId,
    palette: { mode: "PRESET" as const, preset_id: selection.palette },
    typography_id: selection.typography,
    layout: { width_id: selection.width, density_id: selection.density, spacing_id: selection.spacing, radius_id: selection.radius, border_id: selection.border, elevation_id: selection.elevation },
    cards: { article_card_profile_id: selection.articleCard, category_card_profile_id: selection.categoryCard, author_card_profile_id: selection.authorCard },
    hero: { profile_id: selection.hero, image_profile_id: selection.heroImage },
    homepage: { recipe_id: selection.homepage },
    article: { layout_id: selection.article, image_profile_id: selection.articleImage, related_card_profile_id: selection.relatedCard,
      measure: selection.articleMeasure, headline_scale: selection.headlineScale, meta_layout: selection.metaLayout,
      featured_media_ratio: selection.featuredRatio, author_display: selection.authorDisplay, related_content_layout: selection.relatedLayout },
    collections: { category_layout_id: selection.collection, tag_layout_id: selection.tagCollection,
      author_articles_layout_id: selection.authorCollection, search_layout_id: selection.searchCollection,
      article_card_profile_id: selection.collectionCard },
    controls: { button_profile_id: selection.button },
  };
}
export function readyStyleConfig(styleId: "STYLE_01" | "STYLE_02" | "STYLE_03" | "STYLE_04" | "STYLE_05") {
  const style = READY_STYLES[styleId];
  return toPresentationConfig({ ...SAFE_DEFAULT, ...style!.overlay }, styleId);
}
export function recipeStartingConfig(id: string) {
  const recipe = INTERNAL_RECIPES.find((item) => item.id === id);
  return recipe ? toPresentationConfig(recipe.config) : undefined;
}
export function parityStartingConfig(siteKey: string) {
  const parity = LEGACY_PARITY.find((item) => item.siteKey === siteKey);
  return parity ? toPresentationConfig({ ...SAFE_DEFAULT, ...parity.overlay }) : undefined;
}

export const CATEGORY_IMAGE_UNAVAILABLE = ["CAT-08", "CAT-09", "CAT-10"] as const;
export const CATEGORY_COUNT_UNAVAILABLE = ["CAT-03", "CAT-13"] as const;
export const AUTHOR_SUMMARY_UNAVAILABLE = ["AUTH-11", "AUTH-12", "AUTH-13"] as const;
export const AUTHOR_TOTAL_COUNT_UNAVAILABLE = ["AUTH-12"] as const;
export const HOME_FAMILIES = Object.keys(ARCHETYPES) as readonly Archetype[];
export const LEAD_VARIANTS = ["SPLIT_MEDIA", "TEXT_FIRST", "FEATURED_PANEL", "COMPACT"] as const;

export function hasOption<T extends object>(catalogue: T, id: unknown): id is keyof T {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(catalogue, id);
}
export function categorySelectable(id: unknown): boolean {
  return hasOption(categoryCards, id) && !(CATEGORY_IMAGE_UNAVAILABLE as readonly string[]).includes(String(id))
    && !(CATEGORY_COUNT_UNAVAILABLE as readonly string[]).includes(String(id));
}
export function authorSummarySelectable(id: unknown): boolean {
  return authorSelectable(id) && !(AUTHOR_SUMMARY_UNAVAILABLE as readonly string[]).includes(String(id));
}
export function authorSelectable(id: unknown): boolean {
  return hasOption(authorCards, id) && !(AUTHOR_TOTAL_COUNT_UNAVAILABLE as readonly string[]).includes(String(id));
}
export const OPTION_METADATA = Object.freeze({
  articleCards: Object.fromEntries(Object.entries(articleCards).map(([id, item]) => [id, {
    id, name: item.name, available: true, requiresMedia: cardNeedsMedia(id as keyof typeof articleCards), fallbackId: "CARD-15",
  }])),
  categoryCards: Object.fromEntries(Object.entries(categoryCards).map(([id, item]) => [id, {
    id, name: item.name, available: categorySelectable(id),
    reason: (CATEGORY_IMAGE_UNAVAILABLE as readonly string[]).includes(id) ? "CATEGORY_IMAGE_UNAVAILABLE" : (CATEGORY_COUNT_UNAVAILABLE as readonly string[]).includes(id) ? "CATEGORY_COUNT_UNAVAILABLE" : undefined,
    fallbackId: "CAT-01",
  }])),
  authorCards: Object.fromEntries(Object.entries(authorCards).map(([id, item]) => [id, {
    id, name: item.name, available: authorSelectable(id), summaryAvailable: authorSummarySelectable(id),
    reason: id === "AUTH-12" ? "AUTHOR_TOTAL_COUNT_UNAVAILABLE" : undefined, fallbackId: "AUTH-05",
  }])),
  typography: Object.fromEntries(Object.entries(typography).map(([id, item]) => [id, {
    id, name: item.name, scripts: ["LATIN", ...(["TYPE-11", "TYPE-12", "TYPE-21", "TYPE-22"].includes(id) ? ["DEVANAGARI"] : [])], fallbackId: "TYPE-28",
  }])),
});

export function typographyAvailable(id: unknown, locale: string): boolean {
  if (!hasOption(typography, id)) return false;
  const hindiFirst = /^(?:hi|mr|ne|sa)(?:-|$)/i.test(locale);
  return !hindiFirst || ["TYPE-11", "TYPE-12", "TYPE-21", "TYPE-22"].includes(String(id));
}
export function typographyTokens(id: keyof typeof typography): { bodySize: string; bodyLine: string; headingWeight: string; headingTracking: string; headingScale: string } {
  const row = typography[id];
  const spacious = row.densityAffinity === "spacious";
  const compact = row.densityAffinity === "compact";
  return { bodySize: "1rem", bodyLine: spacious ? "1.8" : compact ? "1.6" : "1.7",
    headingWeight: /sans|system/i.test(row.heading) ? "700" : "600",
    headingTracking: spacious ? "-0.025em" : compact ? "-0.012em" : "-0.02em",
    headingScale: spacious ? "1.08" : compact ? "0.95" : "1" };
}

export type PaletteColors = { surface: string; surface_alt: string; text: string; text_muted: string; accent: string; accent_text: string; border: string; focus: string; primary?: string; secondary?: string; background?: string; heading?: string };
function luminance(hex: string): number {
  const rgb = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}
export function contrast(a: string, b: string): number {
  if (!/^#[\da-f]{6}$/i.test(a) || !/^#[\da-f]{6}$/i.test(b)) return 0;
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}
export function inverseText(background: string): string { return contrast("#ffffff", background) >= 4.5 ? "#ffffff" : "#111111"; }
export function paletteErrors(colors: PaletteColors): string[] {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(colors)) if (!/^#[\da-f]{6}$/i.test(String(value))) errors.push(`invalid ${key}`);
  const pairs: [string, string, string, number][] = [
    ["text/surface", colors.text, colors.surface, 4.5],
    ["text/background", colors.text, colors.background ?? colors.surface, 4.5],
    ["muted/surface", colors.text_muted, colors.surface, 4.5],
    ["heading/background", colors.heading ?? colors.text, colors.background ?? colors.surface, 3],
    ["accent text/accent", colors.accent_text, colors.accent, 4.5],
    ["focus/surface", colors.focus, colors.surface, 3],
    ["inverse/primary", inverseText(colors.primary ?? colors.accent), colors.primary ?? colors.accent, 4.5],
  ];
  for (const [label, fg, bg, threshold] of pairs) if (contrast(fg, bg) < threshold) errors.push(label);
  return errors;
}
export function presetColors(id: keyof typeof palettes): PaletteColors {
  const row = palettes[id];
  return { primary: row.primary, secondary: row.secondary, background: row.background,
    surface: row.surface, surface_alt: row.background, text: row.text, text_muted: row.muted,
    heading: row.text, accent: row.accent, accent_text: inverseText(row.accent), border: row.border, focus: row.focus };
}

type RawConfig = Record<string, unknown>;
function record(value: unknown): RawConfig { return typeof value === "object" && value !== null && !Array.isArray(value) ? value as RawConfig : {}; }
function pick<T extends object>(catalogue: T, value: unknown, fallback: keyof T): keyof T {
  return hasOption(catalogue, value) ? value : fallback;
}
export function resolveDesign(value: unknown, locale = "en"): { selection: DesignSelection; colors: PaletteColors; source: "STORED" | "STYLE_DEFAULT" | "SAFE_DEFAULT" } {
  const config = record(value);
  if (config.schema_version !== 1 || (config.style_id !== "CUSTOM" && !(typeof config.style_id === "string" && Object.hasOwn(READY_STYLES, config.style_id)))) {
    return { selection: { ...SAFE_DEFAULT, typography: typographyAvailable(SAFE_DEFAULT.typography, locale) ? SAFE_DEFAULT.typography : "TYPE-12" }, colors: presetColors(SAFE_DEFAULT.palette), source: "SAFE_DEFAULT" };
  }
  const styleId = config.style_id === "CUSTOM" ? config.base_style_id : config.style_id;
  const style = config.schema_version === 1 && typeof styleId === "string" ? READY_STYLES[styleId] : undefined;
  const base = { ...SAFE_DEFAULT, ...(style?.overlay ?? {}) } as DesignSelection;
  const palette = record(config.palette), layout = record(config.layout), cards = record(config.cards);
  const hero = record(config.hero), homepage = record(config.homepage), article = record(config.article);
  const collection = record(config.collections), controls = record(config.controls);
  const selected: DesignSelection = {
    palette: pick(palettes, palette.mode === "PRESET" ? palette.preset_id : undefined, base.palette) as DesignSelection["palette"],
    typography: pick(typography, config.typography_id, base.typography) as DesignSelection["typography"],
    homepage: pick(homepages, homepage.recipe_id, base.homepage) as DesignSelection["homepage"],
    hero: pick(heroes, hero.profile_id, base.hero) as DesignSelection["hero"],
    articleCard: pick(articleCards, cards.article_card_profile_id, base.articleCard) as DesignSelection["articleCard"],
    categoryCard: categorySelectable(cards.category_card_profile_id) ? cards.category_card_profile_id as DesignSelection["categoryCard"] : base.categoryCard,
    authorCard: authorSelectable(cards.author_card_profile_id) ? cards.author_card_profile_id as DesignSelection["authorCard"] : base.authorCard,
    article: pick(articleLayouts, article.layout_id, base.article) as DesignSelection["article"],
    collection: pick(collections, collection.category_layout_id, base.collection) as DesignSelection["collection"],
    tagCollection: pick(collections, collection.tag_layout_id, base.tagCollection) as DesignSelection["tagCollection"],
    authorCollection: pick(collections, collection.author_articles_layout_id, base.authorCollection) as DesignSelection["authorCollection"],
    searchCollection: pick(collections, collection.search_layout_id, base.searchCollection) as DesignSelection["searchCollection"],
    collectionCard: pick(articleCards, collection.article_card_profile_id, base.collectionCard) as DesignSelection["collectionCard"],
    relatedCard: pick(articleCards, article.related_card_profile_id, base.relatedCard) as DesignSelection["relatedCard"],
    image: base.image,
    heroImage: pick(images, hero.image_profile_id, base.image) as DesignSelection["heroImage"],
    articleImage: pick(images, article.image_profile_id, base.image) as DesignSelection["articleImage"],
    button: pick(buttons, controls.button_profile_id, base.button) as DesignSelection["button"],
    density: pick(DENSITIES, layout.density_id, base.density) as DesignSelection["density"],
    articleMeasure: ["NARROW", "STANDARD", "WIDE"].includes(String(article.measure)) ? article.measure as DesignSelection["articleMeasure"] : base.articleMeasure,
    headlineScale: ["STANDARD", "LARGE", "DISPLAY"].includes(String(article.headline_scale)) ? article.headline_scale as DesignSelection["headlineScale"] : base.headlineScale,
    metaLayout: ["INLINE", "STACKED"].includes(String(article.meta_layout)) ? article.meta_layout as DesignSelection["metaLayout"] : base.metaLayout,
    featuredRatio: ["LANDSCAPE", "WIDE"].includes(String(article.featured_media_ratio)) ? article.featured_media_ratio as DesignSelection["featuredRatio"] : base.featuredRatio,
    authorDisplay: ["COMPACT", "PROFILE"].includes(String(article.author_display)) ? article.author_display as DesignSelection["authorDisplay"] : base.authorDisplay,
    relatedLayout: ["LIST", "GRID"].includes(String(article.related_content_layout)) ? article.related_content_layout as DesignSelection["relatedLayout"] : base.relatedLayout,
    width: pick(WIDTHS, layout.width_id, ({ NARROW: "WIDTH-NARROW", STANDARD: "WIDTH-STANDARD", WIDE: "WIDTH-EXTRA-WIDE" } as Record<string, DesignSelection["width"]>)[String(layout.content_width)] ?? base.width) as DesignSelection["width"],
    radius: pick(RADII, layout.radius_id, ({ NONE: "RADIUS-SQUARE", SMALL: "RADIUS-SUBTLE", MEDIUM: "RADIUS-MEDIUM" } as Record<string, DesignSelection["radius"]>)[String(layout.corner_radius)] ?? base.radius) as DesignSelection["radius"],
    border: pick(BORDERS, layout.border_id, base.border) as DesignSelection["border"],
    elevation: pick(ELEVATIONS, layout.elevation_id, base.elevation) as DesignSelection["elevation"],
    spacing: pick(SPACINGS, layout.spacing_id ?? layout.section_spacing, base.spacing) as DesignSelection["spacing"],
  };
  if (!typographyAvailable(selected.typography, locale)) selected.typography = typographyAvailable(base.typography, locale) ? base.typography : /^(?:hi|mr|ne|sa)(?:-|$)/i.test(locale) ? "TYPE-12" : "TYPE-28";
  const custom = palette.mode === "CUSTOM" ? record(palette.semantic_tokens) : undefined;
  const customColors = custom && Object.fromEntries(Object.entries(custom).filter(([key]) => ["surface", "surface_alt", "text", "text_muted", "accent", "accent_text", "border", "focus", "primary", "secondary", "background", "heading"].includes(key))) as PaletteColors;
  let colors = customColors && paletteErrors(customColors).length === 0 ? customColors : presetColors(selected.palette);
  if (paletteErrors(colors).length) { selected.palette = SAFE_DEFAULT.palette; colors = presetColors(SAFE_DEFAULT.palette); }
  const source = config.schema_version !== 1 || (!style && config.style_id !== "CUSTOM") ? "SAFE_DEFAULT" : Object.keys(config).length > 2 ? "STORED" : "STYLE_DEFAULT";
  return { selection: selected, colors, source };
}
