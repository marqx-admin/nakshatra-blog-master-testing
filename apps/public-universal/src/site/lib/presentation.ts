import type { CSSProperties } from "react";
import type { components } from "@bp/api-contract";

type TrustedPresentation = components["schemas"]["TrustedPresentation"];
type ThemeStyle = CSSProperties & Record<`--u-${string}`, string>;

const SAFE_COLORS = {
  surface: "#ffffff", surface_alt: "#f6f7f9", text: "#17202a", text_muted: "#506070",
  accent: "#174f70", accent_text: "#ffffff", border: "#d2d9df", focus: "#174f70",
};
const widths = { NARROW: "960px", STANDARD: "1120px", WIDE: "1280px" } as const;
const spacing = { COMPACT: "2rem", STANDARD: "3rem", SPACIOUS: "4.5rem" } as const;
const radii = { NONE: "0px", SMALL: "6px", MEDIUM: "12px" } as const;
const color = (value: unknown, fallback: string): string => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

// Pure projection: each SSR response creates its own style object; no tenant data is stored in a module singleton.
export function presentationStyle(presentation?: TrustedPresentation): ThemeStyle {
  const palette = presentation?.config.schema_version === 1 ? presentation.config.palette?.semantic_tokens : undefined;
  const layout = presentation?.config.schema_version === 1 ? presentation.config.layout : undefined;
  return {
    "--u-surface": color(palette?.surface, SAFE_COLORS.surface),
    "--u-surface-alt": color(palette?.surface_alt, SAFE_COLORS.surface_alt),
    "--u-text": color(palette?.text, SAFE_COLORS.text),
    "--u-muted": color(palette?.text_muted, SAFE_COLORS.text_muted),
    "--u-accent": color(palette?.accent, SAFE_COLORS.accent),
    "--u-accent-text": color(palette?.accent_text, SAFE_COLORS.accent_text),
    "--u-border": color(palette?.border, SAFE_COLORS.border),
    "--u-focus": color(palette?.focus, SAFE_COLORS.focus),
    "--u-width": widths[layout?.content_width ?? "STANDARD"],
    "--u-section-gap": spacing[layout?.section_spacing ?? "STANDARD"],
    "--u-radius": radii[layout?.corner_radius ?? "SMALL"],
  };
}
