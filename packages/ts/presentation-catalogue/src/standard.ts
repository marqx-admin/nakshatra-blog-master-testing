import { presetColors, typographyAvailable } from "./registry.ts";
import type { DesignSelection } from "./registry.ts";

// V4 C0/C1: a complete, code-owned recipe, deliberately separate from the
// emergency SAFE_DEFAULT and persisted STYLE_01–05 / CUSTOM configurations.
// W3 exposes this as opt-in STANDARD/recipe_version=2; no tenant is remapped.
export const STANDARD_RECIPE: Readonly<DesignSelection> = Object.freeze({
  palette: "PAL-03", typography: "TYPE-03", homepage: "HOME-03", hero: "HERO-22",
  articleCard: "CARD-03", categoryCard: "CAT-02", authorCard: "AUTH-04", article: "ART-14",
  collection: "COL-01", tagCollection: "COL-01", authorCollection: "COL-01", searchCollection: "COL-01",
  collectionCard: "CARD-03", relatedCard: "CARD-03",
  image: "IMG-03", heroImage: "IMG-03", articleImage: "IMG-01",
  button: "BTN-01", density: "DENSITY-STANDARD",
  articleMeasure: "STANDARD", headlineScale: "STANDARD", metaLayout: "INLINE",
  featuredRatio: "LANDSCAPE", authorDisplay: "PROFILE", relatedLayout: "GRID",
  width: "WIDTH-WIDE", radius: "RADIUS-MEDIUM", border: "BORDER-HAIRLINE",
  elevation: "ELEVATION-FLAT", spacing: "STANDARD",
});

export function resolveStandardDesign(locale = "en") {
  const selection = { ...STANDARD_RECIPE,
    typography: typographyAvailable("TYPE-03", locale) ? "TYPE-03" as const : "TYPE-11" as const,
  };
  return { selection, colors: presetColors(selection.palette) };
}
