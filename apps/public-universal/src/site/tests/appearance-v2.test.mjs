import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build, transform } from "esbuild";
import { JSDOM } from "jsdom";
import { APPEARANCE_IDS, appearanceConfig, customAppearanceConfig, resolveDesign, readyStyleConfig } from "@bp/presentation-catalogue";
import { standardPages, standardHome } from "./fixtures/w1-standard.mjs";
import { blogFixture } from "./fixtures/uf06-blog.mjs";
import { fixtureArticle, landscapeMedia } from "./fixtures/uf02-shared-components.mjs";
import { archiveFixture, authorPageFixture } from "./fixtures/uf04-editorial.mjs";
const app=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
const output=resolve(app,"node_modules/.cache/w3-appearance.mjs");mkdirSync(dirname(output),{recursive:true});
await build({entryPoints:[resolve(app,"src/site/pages/router/public-route-page.tsx")],outfile:output,bundle:true,format:"esm",platform:"node",jsx:"automatic",external:["react","react/jsx-runtime"],logLevel:"silent",
  plugins:[{name:"fixture-head",setup(b){b.onResolve({filter:/^next\/head$/},()=>({path:"head",namespace:"fixture"}));b.onLoad({filter:/.*/,namespace:"fixture"},()=>({contents:"export default function Head({children}){return children}"}));}}]});
const {PublicRoutePage}=await import(pathToFileURL(output).href);
const render=(data,path)=>renderToStaticMarkup(React.createElement(PublicRoutePage,{render:{kind:"page",data,requestPath:path}}));

for(const id of APPEARANCE_IDS) test(`${id}: every public page family and private preview receive the same v2 theme without content/SEO mutation`,()=>{
  for(const locale of ["en-IN","hi-IN"]){
    const config=appearanceConfig(id,locale);
    const selections=resolveDesign(config,locale).selection;
    for(const input of standardPages()){
      const data={...input.data,site:{...input.data.site,locale_code:locale},presentation:{source:"STORED",config}};
      const before=JSON.stringify(data);const html=render(data,input.requestPath);
      const dom=new JSDOM(html);const doc=dom.window.document;const shell=doc.querySelector(".universal-site");
      assert.equal(shell.dataset.appearanceVersion,"2",input.requestPath);
      assert.equal(shell.dataset.theme,id);
      assert.equal(shell.dataset.home,selections.homepage);
      assert.equal(shell.dataset.article,selections.article);
      assert.equal(doc.querySelectorAll("main").length,1);
      assert.equal(doc.querySelectorAll("h1").length,1);
      assert.ok(doc.querySelector(".site-header")&&doc.querySelector(".site-footer"));
      assert.equal(JSON.stringify(data),before);
      assert.match(shell.getAttribute("style"),/--u-background:/);
      dom.window.close();
    }
    for (const [state, count] of [["zero", 0], ["single", 1], ["twelve", 12]]) {
      const rows = Array.from({length: count}, (_, index) => fixtureArticle(index + 1, landscapeMedia));
      for (const [path, data] of [["/", standardHome(state)], ["/blog", blogFixture({count})],
        ["/category/fixture", archiveFixture("category", rows)], ["/tag/fixture", archiveFixture("tag", rows)],
        ["/author/fixture", authorPageFixture(rows)]]) {
        const before = JSON.stringify(data);
        const doc = new JSDOM(render({...data, site: {...data.site, locale_code:locale}, presentation:{source:"STORED",config}}, path));
        assert.equal(doc.window.document.querySelectorAll(".article-card").length, count, `${path}: ${state}`);
        assert.equal(JSON.stringify(data), before);
        if (!count) assert.ok(doc.window.document.querySelector("[role=status]"));
        doc.window.close();
      }
    }
  }
});

test("v2 magazine supports use authored articles and global cards without changing legacy Home or latest ordering",()=>{
  const home=standardHome("three");
  home.lead_article=fixtureArticle(1,landscapeMedia);
  home.sections=[{section_key:"authored",section_kind:"POST_SELECTION",posts:[fixtureArticle(2,landscapeMedia),fixtureArticle(3,landscapeMedia)]}];
  const config=customAppearanceConfig("STYLE_01");config.cards.article_card_profile_id="CARD-09";
  const themed={...home,presentation:{source:"STORED",config}};
  const dom=new JSDOM(render(themed,"/"));const doc=dom.window.document;
  assert.equal(doc.querySelectorAll(".lead-supports .article-card[data-card='CARD-09']").length,2);
  assert.deepEqual([...doc.querySelectorAll(".home-latest h3 a")].map(a=>a.getAttribute("href")),home.latest_articles.map(a=>a.destination.url));
  dom.window.close();
  const legacy=render({...home,presentation:{source:"STORED",config:readyStyleConfig("STYLE_01")}},"/");
  assert.doesNotMatch(legacy,/class="lead-supports"/);
});

test("Custom global card, color, typography and image choices reach Home, Blog and supporting collections",()=>{
  const config=customAppearanceConfig("STANDARD");
  config.typography_id="TYPE-02";config.cards={...config.cards,article_card_profile_id:"CARD-09",image_profile_id:"IMG-05"};
  config.collections={...config.collections,article_card_profile_id:"CARD-09"};config.article={...config.article,related_card_profile_id:"CARD-09"};
  config.palette={mode:"CUSTOM",semantic_tokens:{surface:"#ffffff",surface_alt:"#eeeeee",text:"#111111",text_muted:"#444444",accent:"#174f70",accent_text:"#ffffff",border:"#777777",focus:"#174f70",primary:"#174f70",background:"#fafafa",heading:"#222222"}};
  for(const data of [standardHome("twelve"),blogFixture()]){
    const projected={...data,site:{...data.site,locale_code:"en-IN"},presentation:{source:"STORED",config}};
    const dom=new JSDOM(render(projected,"/blog"));const doc=dom.window.document;
    assert.ok([...doc.querySelectorAll(".article-card")].every(el=>el.dataset.card==="CARD-09"&&el.dataset.image==="IMG-05"));
    assert.match(doc.querySelector(".universal-site").getAttribute("style"),/--u-primary:#174f70/);
    assert.match(doc.querySelector(".universal-site").getAttribute("style"),/Literata/);
    dom.window.close();
  }
});

test("legacy and sequential tenants never opt into v2 just because its catalogue was added",()=>{
  for(const id of APPEARANCE_IDS.slice(1)){
    const data={...blogFixture(),presentation:{source:"STORED",config:readyStyleConfig(id)}};
    const before=render(data,"/blog");
    render({...data,presentation:{source:"STORED",config:appearanceConfig("STANDARD")}},"/blog");
    assert.equal(render(data,"/blog"),before);
    assert.doesNotMatch(before,/data-appearance-version="2"/);
  }
});

test("all v2 CSS rules are opt-in, parse cleanly and preserve legacy selector scope",async()=>{
  const css=readFileSync(resolve(app,"src/site/styles/profiles.css"),"utf8").split("/* W3 recipe v2:")[1];
  assert.deepEqual((await transform(`/* W3 recipe v2:${css}`,{loader:"css"})).warnings,[]);
  const dom=new JSDOM(`<style>/* W3 recipe v2:${css}</style>`);const rules=dom.window.document.styleSheets[0].cssRules;
  const check=rules=>{for(const rule of rules){if(rule.cssRules)check(rule.cssRules);else for(const selector of rule.selectorText.split(/,(?![^()]*\))/))assert.match(selector,/\[data-appearance-version="2"\]/);}};
  check(rules);dom.window.close();
});
