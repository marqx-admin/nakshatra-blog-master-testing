import type { components } from "@bp/api-contract";
import {
  SAFE_DEFAULT, READY_STYLES, readyStyleConfig, resolveDesign, toPresentationConfig,
  paletteErrors, presetColors, typographyAvailable, categorySelectable, authorSummarySelectable,
  type DesignSelection, type PaletteColors,
} from "@bp/presentation-catalogue";

export type PresentationConfig = components["schemas"]["PresentationConfig"];
export type StaticPages = components["schemas"]["StaticPages"];
export type InformationPage = components["schemas"]["InformationPage"];
export type StyleId = Exclude<PresentationConfig["style_id"], "CUSTOM">;
export const STYLE_IDS = Object.keys(READY_STYLES) as StyleId[];
export const PAGE_KEYS = ["ABOUT", "CONTACT", "PRIVACY", "TERMS", "DISCLAIMER"] as const;
export const PAGE_NAMES: Record<keyof StaticPages, string> = {
  ABOUT: "About", CONTACT: "Contact", PRIVACY: "Privacy Policy", TERMS: "Terms of Use", DISCLAIMER: "Disclaimer",
};

export function startingPages(): StaticPages {
  const page = (key: keyof StaticPages): InformationPage => ({ enabled: false, content_version: 1, title: PAGE_NAMES[key], intro_text: "", body_sections: [] });
  return { ABOUT: page("ABOUT"), CONTACT: page("CONTACT"), PRIVACY: page("PRIVACY"), TERMS: page("TERMS"), DISCLAIMER: page("DISCLAIMER") };
}

export function startingPresentation(style: StyleId | "CUSTOM"): PresentationConfig {
  return style === "CUSTOM" ? toPresentationConfig(SAFE_DEFAULT) : readyStyleConfig(style);
}

export function selectionFrom(config: PresentationConfig, locale: string): DesignSelection {
  return resolveDesign(config, locale).selection;
}

export function withSelection(config: PresentationConfig, selection: DesignSelection): PresentationConfig {
  const next = toPresentationConfig(selection, config.style_id);
  if (config.branding) next.branding = config.branding;
  if (config.palette?.mode === "CUSTOM" && config.palette.semantic_tokens) next.palette = config.palette;
  return next;
}

export function withCustomPalette(config: PresentationConfig, colors: PaletteColors): PresentationConfig {
  return { ...config, palette: { mode: "CUSTOM", semantic_tokens: colors } };
}

export function presentationErrors(config: PresentationConfig, locale: string): string[] {
  const errors: string[] = [];
  const selected = selectionFrom(config, locale);
  if (!typographyAvailable(config.typography_id ?? selected.typography, locale)) errors.push("Typography does not support this site's script.");
  if (config.cards?.category_card_profile_id && !categorySelectable(config.cards.category_card_profile_id)) errors.push("Category card needs unavailable public data.");
  if (config.cards?.author_card_profile_id && !authorSummarySelectable(config.cards.author_card_profile_id)) errors.push("Author card needs unavailable public data.");
  if (config.palette?.mode === "CUSTOM") {
    const colors = config.palette.semantic_tokens;
    errors.push(...(colors ? paletteErrors(colors) : ["Custom palette colors are required."]));
  } else if (paletteErrors(presetColors(selected.palette)).length) errors.push("Palette contrast is insufficient.");
  return errors;
}

export function pagesErrors(pages: StaticPages): string[] {
  const errors: string[] = [];
  for (const key of PAGE_KEYS) {
    const page = pages[key];
    if (!page || /[<>]/.test(page.title + page.intro_text)) errors.push(`${PAGE_NAMES[key]} contains unsupported markup.`);
    for (const section of page?.body_sections ?? []) {
      if (/[<>]/.test((section.heading ?? "") + section.paragraphs.join("") + section.list_items.join(""))) errors.push(`${PAGE_NAMES[key]} contains unsupported markup.`);
    }
  }
  return errors;
}
