import test from "node:test";
import assert from "node:assert/strict";
import { STANDARD_RECIPE, resolveStandardDesign, SAFE_DEFAULT, READY_STYLES, resolveDesign,
  paletteErrors, contrast, toPresentationConfig, readyStyleConfig } from "../src/index.ts";

test("Sage Editorial is a complete separate recipe, including every archive and related card", () => {
  const { selection, colors } = resolveStandardDesign();
  assert.deepEqual(Object.keys(selection).sort(), Object.keys(SAFE_DEFAULT).sort());
  assert.deepEqual([selection.palette, selection.typography, selection.homepage, selection.hero,
    selection.articleCard, selection.categoryCard, selection.authorCard, selection.article],
  ["PAL-03", "TYPE-03", "HOME-03", "HERO-22", "CARD-03", "CAT-02", "AUTH-04", "ART-14"]);
  for (const key of ["collection", "tagCollection", "authorCollection", "searchCollection"]) assert.equal(selection[key], "COL-01");
  for (const key of ["articleCard", "collectionCard", "relatedCard"]) assert.equal(selection[key], "CARD-03");
  assert.equal(selection.image, "IMG-03");
  assert.equal(selection.articleImage, "IMG-01", "body/featured article media keeps natural dimensions");
  assert.deepEqual([selection.width, selection.radius, selection.button], ["WIDTH-WIDE", "RADIUS-MEDIUM", "BTN-01"]);
  assert.deepEqual(paletteErrors(colors), []);
  assert.ok(contrast(colors.text_muted, colors.background) >= 4.5, "metadata must be readable on cream as well as white");
  assert.ok(contrast(colors.focus, colors.background) >= 3);
  assert.equal(Object.isFrozen(STANDARD_RECIPE), true);
});

test("Standard language selection is local to each render and supports Hindi mixed-script typography", () => {
  for (const locale of ["hi", "hi-IN", "HI-in", "mr", "ne-NP", "sa"]) assert.equal(resolveStandardDesign(locale).selection.typography, "TYPE-11");
  assert.equal(resolveStandardDesign("en-IN").selection.typography, "TYPE-03");
  assert.equal(STANDARD_RECIPE.typography, "TYPE-03");
  const mutated = resolveStandardDesign();
  mutated.selection.palette = "PAL-01";
  assert.equal(resolveStandardDesign().selection.palette, "PAL-03");
});

test("Standard does not change stored styles, CUSTOM inheritance or emergency defaults", () => {
  assert.equal(READY_STYLES.STANDARD, undefined);
  const before = Object.keys(READY_STYLES).map(id => resolveDesign(readyStyleConfig(id)));
  const custom = toPresentationConfig({ ...SAFE_DEFAULT, palette: "PAL-02" });
  const customBefore = resolveDesign(custom);
  resolveStandardDesign("hi-IN");
  assert.deepEqual(Object.keys(READY_STYLES).map(id => resolveDesign(readyStyleConfig(id))), before);
  assert.deepEqual(resolveDesign(custom), customBefore);
  assert.equal(custom.base_style_id, "STYLE_03");
  assert.equal(resolveDesign(undefined).selection.palette, "PAL-28");
  assert.equal(resolveDesign({ schema_version: 1, style_id: "STANDARD" }).source, "SAFE_DEFAULT");
});
