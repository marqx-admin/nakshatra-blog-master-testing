import test from "node:test";
import assert from "node:assert/strict";
import {
  articleCards, articleLayouts, authorCards, buttons, categoryCards, collections, components,
  heroes, homepages, images, palettes, typography, HOME_SLOTS, INTERNAL_RECIPES, LEGACY_PARITY,
  READY_STYLES, SAFE_DEFAULT, DENSITIES, RADII, BORDERS, ELEVATIONS, WIDTHS, RECIPE_DENSITIES,
  paletteErrors, presetColors, categorySelectable, typographyAvailable, resolveDesign, contrast,
  readyStyleConfig, parityStartingConfig, recipeStartingConfig, OPTION_METADATA,
} from "../src/index.ts";

test("blueprint catalogues have exact unique IDs and counts", () => {
  const expected = [[components, 40, "CMP-U-"], [articleCards, 30, "CARD-"], [heroes, 26, "HERO-"],
    [categoryCards, 25, "CAT-"], [authorCards, 25, "AUTH-"], [homepages, 25, "HOME-"],
    [articleLayouts, 16, "ART-"], [collections, 12, "COL-"], [typography, 28, "TYPE-"],
    [palettes, 30, "PAL-"], [buttons, 12, "BTN-"], [images, 12, "IMG-"]];
  for (const [catalogue, count, prefix] of expected) {
    const ids = Object.keys(catalogue);
    assert.equal(ids.length, count, prefix);
    assert.equal(new Set(ids).size, count, prefix);
    assert.ok(ids.every((id) => id.startsWith(prefix) && catalogue[id].name), prefix);
  }
  assert.deepEqual([Object.keys(DENSITIES).length, Object.keys(RADII).length, Object.keys(BORDERS).length, Object.keys(ELEVATIONS).length, Object.keys(WIDTHS).length], [4, 5, 5, 4, 6]);
});

test("exact five owner-locked styles overlay platform SAFE_DEFAULT only", () => {
  assert.deepEqual(Object.keys(READY_STYLES), ["STYLE_01", "STYLE_02", "STYLE_03", "STYLE_04", "STYLE_05"]);
  const locked = [
    ["Modern Magazine", "PAL-04", "TYPE-09", "HOME-02", "HERO-10", "CARD-28", "ART-04", "COL-07", "IMG-03", "DENSITY-STANDARD", "WIDTH-WIDE", "RADIUS-MEDIUM", "ELEVATION-LOW"],
    ["Classic Editorial", "PAL-02", "TYPE-02", "HOME-01", "HERO-22", "CARD-03", "ART-01", "COL-06", "IMG-01", "DENSITY-SPACIOUS", "WIDTH-STANDARD", "RADIUS-SUBTLE", "BORDER-RULE-DRIVEN"],
    ["Minimal Clean", "PAL-28", "TYPE-28", "HOME-15", "HERO-14", "CARD-15", "ART-16", "COL-04", "IMG-01", "DENSITY-STANDARD", "WIDTH-NARROW", "RADIUS-SUBTLE", "ELEVATION-FLAT"],
    ["Bold News", "PAL-07", "TYPE-07", "HOME-05", "HERO-21", "CARD-28", "ART-12", "COL-01", "IMG-03", "DENSITY-COMPACT", "WIDTH-EXTRA-WIDE", "RADIUS-SUBTLE", "BORDER-HAIRLINE"],
    ["Warm / Spiritual Editorial", "PAL-30", "TYPE-12", "HOME-14", "HERO-23", "CARD-03", "ART-15", "COL-02", "IMG-09", "DENSITY-SPACIOUS", "WIDTH-STANDARD", "RADIUS-SOFT", "ELEVATION-LOW"],
  ];
  for (const [index, expected] of locked.entries()) {
    const style = READY_STYLES[`STYLE_0${index + 1}`];
    assert.equal(style.name, expected[0]);
    assert.deepEqual(Object.values(style.overlay), expected.slice(1));
    const resolved = resolveDesign({ schema_version: 1, style_id: `STYLE_0${index + 1}` });
    assert.equal(resolved.selection.categoryCard, SAFE_DEFAULT.categoryCard);
    assert.equal(resolved.selection.button, SAFE_DEFAULT.button);
    const transport = readyStyleConfig(`STYLE_0${index + 1}`);
    assert.equal(transport.schema_version, 1);
    assert.equal(transport.style_id, `STYLE_0${index + 1}`);
    assert.equal(transport.palette.preset_id, expected[1]);
    assert.equal(transport.cards.category_card_profile_id, SAFE_DEFAULT.categoryCard);
  }
});

test("42 internal recipes use seven locked anchors, two card systems, three densities", () => {
  assert.equal(INTERNAL_RECIPES.length, 42);
  assert.equal(new Set(INTERNAL_RECIPES.map((recipe) => recipe.id)).size, 42);
  assert.deepEqual(RECIPE_DENSITIES, ["DENSITY-COMPACT", "DENSITY-STANDARD", "DENSITY-SPACIOUS"]);
  assert.equal(INTERNAL_RECIPES.some((recipe) => recipe.density === "DENSITY-AIRY"), false);
  const anchors = ["HOME-01", "HOME-02", "HOME-03", "HOME-04", "HOME-05", "HOME-06", "HOME-07"];
  assert.deepEqual([...new Set(INTERNAL_RECIPES.map((recipe) => recipe.config.homepage))], anchors);
  for (const recipe of INTERNAL_RECIPES) {
    assert.equal(recipe.config.articleCard, recipe.cardSystem === "MEDIA_FIRST" ? "CARD-01" : "CARD-15");
    assert.equal(recipe.config.density, recipe.density);
    assert.ok(paletteErrors(presetColors(recipe.config.palette)).length === 0, recipe.id);
    assert.equal(recipeStartingConfig(recipe.id).homepage.recipe_id, recipe.config.homepage);
  }
});

test("14 parity starts preserve locked IDs and downward midpoint width normalization", () => {
  assert.equal(LEGACY_PARITY.length, 14);
  assert.deepEqual(LEGACY_PARITY.map((item) => item.siteKey), Array.from({ length: 14 }, (_, index) => `SITE-${String(index + 1).padStart(2, "0")}`));
  for (const item of LEGACY_PARITY) {
    assert.ok(palettes[item.overlay.palette]);
    assert.ok(typography[item.overlay.typography]);
    assert.ok(homepages[item.overlay.homepage]);
    assert.ok(articleLayouts[item.overlay.article]);
    assert.ok(articleCards[item.overlay.articleCard]);
    assert.ok(collections[item.overlay.collection]);
    assert.equal(item.overlay.width, ({ 1120: "WIDTH-STANDARD", 1160: "WIDTH-STANDARD", 1200: "WIDTH-WIDE", 1240: "WIDTH-WIDE", 1280: "WIDTH-EXTRA-WIDE" })[item.legacyWidth]);
    assert.equal(parityStartingConfig(item.siteKey).layout.width_id, item.overlay.width);
  }
});

test("palette validation rejects poor semantic pairs; all approved presets validate", () => {
  for (const id of Object.keys(palettes)) assert.deepEqual(paletteErrors(presetColors(id)), [], id);
  const invalid = { ...presetColors("PAL-28"), text: "#ffffff", accent_text: "#ffffff", accent: "#ffffff" };
  assert.ok(paletteErrors(invalid).includes("text/surface"));
  assert.ok(paletteErrors(invalid).includes("accent text/accent"));
  assert.ok(contrast("#ffffff", "#ffffff") < 4.5);
});

test("Hindi-first typography is limited to Devanagari-capable stacks", () => {
  assert.equal(typographyAvailable("TYPE-11", "hi-IN"), true);
  assert.equal(typographyAvailable("TYPE-12", "hi-IN"), true);
  assert.equal(typographyAvailable("TYPE-09", "hi-IN"), false);
  assert.equal(resolveDesign({ schema_version: 1, style_id: "STYLE_01" }, "hi-IN").selection.typography, "TYPE-12");
});

test("category image profiles are known but unavailable and absent options collapse to safe defaults", () => {
  assert.ok(categoryCards["CAT-08"] && categoryCards["CAT-09"] && categoryCards["CAT-10"]);
  for (const id of ["CAT-08", "CAT-09", "CAT-10"]) assert.equal(categorySelectable(id), false);
  assert.equal(categorySelectable("CAT-01"), true);
  assert.equal(categorySelectable("CAT-03"), false); // Article count is absent from public taxonomy summaries.
  assert.equal(categorySelectable("CAT-13"), false);
  assert.equal(OPTION_METADATA.authorCards["AUTH-11"].available, true);
  assert.equal(OPTION_METADATA.authorCards["AUTH-11"].summaryAvailable, false);
  assert.equal(resolveDesign({ schema_version: 1, style_id: "CUSTOM", cards: { author_card_profile_id: "AUTH-11" } }).selection.authorCard, "AUTH-11");
  assert.equal(OPTION_METADATA.authorCards["AUTH-12"].available, false);
  assert.equal(OPTION_METADATA.authorCards["AUTH-12"].reason, "AUTHOR_TOTAL_COUNT_UNAVAILABLE");
  assert.equal(resolveDesign({ schema_version: 1, style_id: "CUSTOM", cards: { author_card_profile_id: "AUTH-12" } }).selection.authorCard, "AUTH-05");
  const selection = resolveDesign({ schema_version: 1, style_id: "CUSTOM", cards: { category_card_profile_id: "CAT-08", article_card_profile_id: "CARD-999" } }).selection;
  assert.equal(selection.categoryCard, SAFE_DEFAULT.categoryCard);
  assert.equal(selection.articleCard, SAFE_DEFAULT.articleCard);
});

test("all 25 home recipes use only the common content slots and never manufacture sections", () => {
  assert.equal(Object.keys(HOME_SLOTS).length, 25);
  for (const slots of Object.values(HOME_SLOTS)) {
    assert.equal(slots.length, 5);
    assert.deepEqual(new Set(slots), new Set(["INTRO", "LEAD", "POSTS", "CATEGORIES", "LATEST"]));
  }
});

test("resolution is request-local; invalid IDs and custom colors cannot leak from a prior tenant", () => {
  const first = resolveDesign({ schema_version: 1, style_id: "CUSTOM", palette: { mode: "CUSTOM", semantic_tokens: { ...presetColors("PAL-28"), accent: "#123456", accent_text: "#ffffff" } } });
  const second = resolveDesign({ schema_version: 1, style_id: "CUSTOM", palette: { mode: "PRESET", preset_id: "PAL-999" }, hero: { profile_id: "HERO-999" } });
  assert.equal(first.colors.accent, "#123456");
  assert.equal(second.colors.accent, presetColors(SAFE_DEFAULT.palette).accent);
  assert.equal(second.selection.hero, SAFE_DEFAULT.hero);
  assert.notStrictEqual(first.selection, second.selection);
  for (const invalid of [
    { schema_version: 2, style_id: "CUSTOM", cards: { article_card_profile_id: "CARD-01" } },
    { schema_version: 1, style_id: "UNKNOWN", cards: { article_card_profile_id: "CARD-01" } },
  ]) {
    const result = resolveDesign(invalid);
    assert.equal(result.source, "SAFE_DEFAULT");
    assert.equal(result.selection.articleCard, SAFE_DEFAULT.articleCard);
  }
});
