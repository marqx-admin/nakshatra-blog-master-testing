import type { CSSProperties } from "react";
import type { components } from "@bp/api-contract";
import { BORDERS, DENSITIES, ELEVATIONS, RADII, SPACINGS, WIDTHS, inverseText, resolveDesign, typography, typographyTokens } from "@bp/presentation-catalogue";

type TrustedPresentation = components["schemas"]["TrustedPresentation"];
type ThemeStyle = CSSProperties & Record<`--u-${string}`, string>;

const quote = (value: string): string => value === "system-ui" ? "system-ui" : `"${value.replaceAll('"', '')}"`;
const devanagariSans = '"Mukta", "Hind", "Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", sans-serif';
const devanagariSerif = '"Tiro Devanagari Hindi", "Karma", "Noto Serif Devanagari", "Kohinoor Devanagari", "Nirmala UI", serif';
function stack(value: string, serif: boolean): string {
  return `${quote(value)}, ${serif ? devanagariSerif : devanagariSans}`;
}

// All values are projected from code-owned tokens for this response. No tenant state is retained.
export function resolvePresentation(presentation?: TrustedPresentation, locale = "en") {
  // SAFE_DEFAULT is an authoritative projection result, not a selected style.
  return resolveDesign(presentation?.source === "SAFE_DEFAULT" ? undefined : presentation?.config, locale);
}

export function presentationStyle(presentation?: TrustedPresentation, locale = "en"): ThemeStyle {
  return resolvedPresentationStyle(resolvePresentation(presentation, locale));
}

export function resolvedPresentationStyle({ selection, colors }: Pick<ReturnType<typeof resolveDesign>, "selection" | "colors">): ThemeStyle {
  const type = typography[selection.typography];
  const density = DENSITIES[selection.density];
  const typeTokens = typographyTokens(selection.typography);
  return {
    "--u-surface": colors.surface,
    "--u-background": colors.background ?? colors.surface,
    "--u-surface-alt": colors.surface_alt,
    "--u-text": colors.text,
    "--u-heading": colors.heading ?? colors.primary ?? colors.text,
    "--u-muted": colors.text_muted,
    "--u-accent": colors.accent,
    "--u-accent-text": colors.accent_text,
    "--u-primary": colors.primary ?? colors.accent,
    "--u-secondary": colors.secondary ?? colors.accent,
    "--u-primary-text": inverseText(colors.primary ?? colors.accent),
    "--u-border": colors.border,
    "--u-focus": colors.focus,
    "--u-width": `${WIDTHS[selection.width]}px`,
    "--u-section-gap": SPACINGS[selection.spacing],
    "--u-grid-gap": density.gap,
    "--u-card-padding": density.padding,
    "--u-radius": RADII[selection.radius],
    "--u-border-width": BORDERS[selection.border],
    "--u-elevation": ELEVATIONS[selection.elevation],
    "--u-font-heading": stack(type.heading, !/sans|inter|manrope|mukta|hind|system-ui/i.test(type.heading)),
    "--u-font-body": stack(type.body, false),
    "--u-body-size": typeTokens.bodySize,
    "--u-body-line": typeTokens.bodyLine,
    "--u-heading-weight": typeTokens.headingWeight,
    "--u-heading-tracking": typeTokens.headingTracking,
    "--u-heading-scale": typeTokens.headingScale,
  };
}
