import test from "node:test";
import assert from "node:assert/strict";
import { APPEARANCE_IDS, appearanceConfig, customAppearanceConfig, appearanceSelection,
  resolveDesign, readyStyleConfig, SAFE_DEFAULT, appearancePaletteErrors, presetColors } from "../src/index.ts";

const expected = {
  STANDARD: ["PAL-03","TYPE-03","TYPE-11","HOME-03","HERO-22","CARD-03","ART-14","COL-01","CARD-03","CAT-02","AUTH-04"],
  STYLE_01: ["PAL-04","TYPE-09","TYPE-11","HOME-02","HERO-10","CARD-28","ART-04","COL-07","CARD-07","CAT-06","AUTH-01"],
  STYLE_02: ["PAL-02","TYPE-02","TYPE-21","HOME-01","HERO-22","CARD-03","ART-01","COL-06","CARD-27","CAT-05","AUTH-04"],
  STYLE_03: ["PAL-28","TYPE-28","TYPE-22","HOME-15","HERO-14","CARD-15","ART-16","COL-04","CARD-15","CAT-01","AUTH-05"],
  STYLE_04: ["PAL-07","TYPE-07","TYPE-12","HOME-05","HERO-21","CARD-28","ART-12","COL-01","CARD-07","CAT-05","AUTH-03"],
  STYLE_05: ["PAL-30","TYPE-12","TYPE-12","HOME-14","HERO-23","CARD-03","ART-15","COL-02","CARD-03","CAT-06","AUTH-04"],
};
for (const id of APPEARANCE_IDS) test(`${id}: exact v2 mappings, Hindi, Custom base and save/reload equality`, () => {
  const e=expected[id];
  for (const locale of ["en-IN","hi-IN"]) {
    const config=appearanceConfig(id,locale);
    assert.equal(config.recipe_version,2);
    const {selection:s}=resolveDesign(JSON.parse(JSON.stringify(config)),locale);
    assert.deepEqual([s.palette,s.typography,s.homepage,s.hero,s.articleCard,s.article,s.collection,s.relatedCard,s.categoryCard,s.authorCard],
      [e[0],locale.startsWith("hi")?e[2]:e[1],...e.slice(3)]);
    assert.equal(s.collectionCard,s.articleCard);
    for (const key of ["tagCollection","authorCollection","searchCollection"]) assert.equal(s[key],s.collection);
    assert.deepEqual(s,appearanceSelection(id,locale));
    const custom=customAppearanceConfig(id,locale);
    assert.equal(custom.base_style_id,id);
    assert.deepEqual(resolveDesign(custom,locale).selection,s);
    assert.deepEqual(resolveDesign({schema_version:1,recipe_version:2,style_id:"CUSTOM",base_style_id:id},locale).selection,s);
  }
});

test("v2 explicit overrides survive reload and do not mutate another recipe or v1 fallback", () => {
  const before=APPEARANCE_IDS.slice(1).map(id=>resolveDesign(readyStyleConfig(id)).selection);
  const custom=customAppearanceConfig("STANDARD");
  custom.cards={...custom.cards,article_card_profile_id:"CARD-09",image_profile_id:"IMG-05"};
  custom.collections={...custom.collections,article_card_profile_id:"CARD-09",search_layout_id:"COL-04"};
  custom.article={...custom.article,related_card_profile_id:"CARD-09",measure:"WIDE"};
  custom.layout={...custom.layout,width_id:"WIDTH-NARROW",radius_id:"RADIUS-ROUND"};
  const s=resolveDesign(JSON.parse(JSON.stringify(custom))).selection;
  assert.deepEqual([s.articleCard,s.collectionCard,s.relatedCard,s.image,s.searchCollection,s.articleMeasure,s.width,s.radius],
    ["CARD-09","CARD-09","CARD-09","IMG-05","COL-04","WIDE","WIDTH-NARROW","RADIUS-ROUND"]);
  assert.deepEqual(APPEARANCE_IDS.slice(1).map(id=>resolveDesign(readyStyleConfig(id)).selection),before);
  assert.equal(resolveDesign().selection.palette,SAFE_DEFAULT.palette);
  for(const invalid of [{schema_version:1,style_id:"STANDARD"},{schema_version:1,recipe_version:1,style_id:"CUSTOM",base_style_id:"STANDARD"},
    {schema_version:1,recipe_version:3,style_id:"STYLE_01"},{schema_version:1,recipe_version:"2",style_id:"STYLE_01"}]) assert.equal(resolveDesign(invalid).source,"SAFE_DEFAULT");
  assert.equal(appearancePaletteErrors({...presetColors("PAL-03"),text:"#ffffff"}).includes("text/surface"),true);
  for (const role of ["primary", "heading", "surface_alt"]) {
    const colors={...presetColors("PAL-03"),[role]:role === "surface_alt" ? "#111111" : "#ffffff"};
    assert.ok(appearancePaletteErrors(colors).length,role);
    const config={...custom,palette:{mode:"CUSTOM",semantic_tokens:colors}};
    assert.notDeepEqual(resolveDesign(config).colors,colors,"invalid semantic roles fall back safely");
  }
});
