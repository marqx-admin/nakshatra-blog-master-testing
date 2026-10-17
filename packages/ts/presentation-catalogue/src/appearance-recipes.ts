import { READY_STYLES, SAFE_DEFAULT, toPresentationConfig } from "./registry.ts";
import type { DesignSelection } from "./registry.ts";
import { STANDARD_RECIPE } from "./standard.ts";

export const APPEARANCE_IDS = ["STANDARD", "STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"] as const;
export type AppearanceId = typeof APPEARANCE_IDS[number];
export function appearanceId(value: unknown): value is AppearanceId { return APPEARANCE_IDS.includes(value as AppearanceId); }

// V4 E0–E6: opt-in recipe v2. Legacy READY_STYLES/SAFE_DEFAULT and parity
// configurations retain their exact v1 resolution until an authorized selection.
const extensions = {
  STYLE_01: { categoryCard: "CAT-06", authorCard: "AUTH-01", relatedCard: "CARD-07", button: "BTN-01", authorDisplay: "PROFILE", relatedLayout: "GRID" },
  STYLE_02: { categoryCard: "CAT-05", authorCard: "AUTH-04", relatedCard: "CARD-27", button: "BTN-07", authorDisplay: "PROFILE", relatedLayout: "LIST" },
  STYLE_03: { categoryCard: "CAT-01", authorCard: "AUTH-05", relatedCard: "CARD-15", button: "BTN-07", authorDisplay: "COMPACT", relatedLayout: "LIST" },
  STYLE_04: { categoryCard: "CAT-05", authorCard: "AUTH-03", relatedCard: "CARD-07", button: "BTN-01", authorDisplay: "COMPACT", relatedLayout: "GRID" },
  STYLE_05: { categoryCard: "CAT-06", authorCard: "AUTH-04", relatedCard: "CARD-03", button: "BTN-01", authorDisplay: "PROFILE", relatedLayout: "GRID" },
} as const;
const hindi = { STANDARD: "TYPE-11", STYLE_01: "TYPE-11", STYLE_02: "TYPE-21", STYLE_03: "TYPE-22", STYLE_04: "TYPE-12", STYLE_05: "TYPE-12" } as const;

export function appearanceSelection(id: AppearanceId, locale = "en"): DesignSelection {
  const base = id === "STANDARD" ? { ...STANDARD_RECIPE } : { ...SAFE_DEFAULT, ...READY_STYLES[id]!.overlay };
  const selection: DesignSelection = id === "STANDARD" ? base : { ...base, ...extensions[id],
    collectionCard: base.articleCard, tagCollection: base.collection, authorCollection: base.collection, searchCollection: base.collection,
    heroImage: base.image, articleImage: base.image, articleMeasure: "STANDARD", headlineScale: "STANDARD", metaLayout: "INLINE",
    featuredRatio: "LANDSCAPE", spacing: base.density === "DENSITY-SPACIOUS" ? "SPACIOUS" : "STANDARD",
  };
  if (/^(?:hi|mr|ne|sa)(?:-|$)/i.test(locale)) selection.typography = hindi[id];
  return selection;
}

export function appearanceConfig(id: AppearanceId, locale = "en") {
  return toPresentationConfig(appearanceSelection(id, locale), id, { recipeVersion: 2 });
}
export function customAppearanceConfig(base: AppearanceId, locale = "en") {
  return toPresentationConfig(appearanceSelection(base, locale), "CUSTOM", { recipeVersion: 2, baseStyleId: base });
}
