# Universal presentation catalogue

This package is the shared V1 option vocabulary for the Universal public renderer and later Admin Appearance work. IDs, display names, descriptions, availability, compatibility, five starting styles, SAFE_DEFAULT, 42 internal recipes and 14 parity starting mappings live here. Options are configuration over shared renderers, never separate sites or applications.

The catalogue rows in `src/catalogue-data.ts` transcribe the approved component and profile inventories from the Final Universal Blueprint §§36–38. `src/registry.ts` implements the owner-locked recipe axes, style overlays, parity width normalization, fallback and contrast rules. `src/engines.ts` maps approved profile IDs to shared rendering behavior.

SAFE_DEFAULT is platform-owned: PAL-28, TYPE-28, HOME-04, HERO-14, CARD-15, CAT-01, AUTH-05, ART-03, COL-04, IMG-01, BTN-07, standard density, 760px reading container, subtle radius, hairline border and flat elevation. It requires no optional media and never comes from another tenant.

The five ready-made styles contain only their owner-locked principal overlays. Every unspecified field falls back to SAFE_DEFAULT. The seven recipe archetypes select approved palettes, typography, hero, article, collection and code-owned tokens aligned to their names; the two card systems select CARD-01 or CARD-15; the three recipe densities are compact, standard and spacious. AIRY remains a standalone controlled option. The 42 recipes are internal and do not define extra user-facing styles.

Parity widths 1160 and 1240 normalize down to WIDTH-STANDARD (1120) and WIDTH-WIDE (1200). Parity configurations are migration starting data, never a runtime site-key switch or a fallback tenant.

CAT-08–10 require category images and remain unavailable. CAT-03 and CAT-13 require article counts that the current public taxonomy summary does not project, so they are also unavailable. AUTH-11 and AUTH-13 use trusted full-author detail; compact AuthorSummary cards fall back to the text-safe profile. AUTH-12 remains registry-known but unavailable because RC11 does not project the author's total eligible public article count. No page-local count is substituted for that total, and no category-image or author-private field is fabricated.

Typography font faces are locally packaged and their stacks are code-owned. Hindi/Marathi/Nepali/Sanskrit locale selection is restricted to four loaded Devanagari-led presets; TYPE-12 is the platform fallback when a chosen Latin preset cannot cover that script. Source-level checks verify stack declarations; actual glyph appearance remains a later browser acceptance item.

Palette selection checks normal text, background, muted text, large heading, accent/button text, inverse primary text and focus contrast. Custom colors are semantic hex tokens only. Invalid stored values fall back to the selected style palette or platform SAFE_DEFAULT; no arbitrary CSS is emitted.
