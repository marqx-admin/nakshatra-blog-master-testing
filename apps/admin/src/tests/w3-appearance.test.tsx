import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { APPEARANCE_IDS, appearanceConfig, customAppearanceConfig, resolveDesign, readyStyleConfig } from "@bp/presentation-catalogue";
import { StyleChooser } from "../modules/appearance/AppearanceControls";
import { AppearanceControls } from "../modules/appearance/VisualAppearanceControls";
import { withSelection, preserveAppearanceContent, startingPages, type PresentationConfig } from "../modules/appearance/appearance-model";
import { AppearancePage } from "../modules/site/AppearancePage";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import type { AdminRequestInput, AdminResponse, AdminTransport } from "../app/query-client/adminTransport";
afterEach(cleanup);

it("Standard and all Custom bases are selectable with locale-appropriate complete configurations",()=>{
  let result=customAppearanceConfig("STANDARD","hi-IN");
  function Harness(){const [config,setConfig]=useState(result);return <StyleChooser modernRecipes value={config} locale="hi-IN" showSelectedPreview={false} onChange={value=>{result=value;setConfig(value)}}/>;}
  render(<Harness/>);
  for(const id of APPEARANCE_IDS){
    fireEvent.change(screen.getByLabelText("Custom base appearance"),{target:{value:id}});
    expect(result).toEqual(customAppearanceConfig(id,"hi-IN"));
    expect(withSelection(result,resolveDesign(result,"hi-IN").selection).base_style_id).toBe(id);
  }
  fireEvent.click(screen.getByRole("button",{name:/Standard — Sage Editorial The approved/}));
  expect(result).toEqual(appearanceConfig("STANDARD","hi-IN"));
});

it("global article-card control updates collection and related roles; image and base survive reload",()=>{
  let result=customAppearanceConfig("STYLE_01");
  function Harness(){const [config,setConfig]=useState(result);return <AppearanceControls config={config} locale="en" onChange={value=>{result=value;setConfig(value)}}/>;}
  render(<Harness/>);
  const cards=within(screen.getByRole("group",{name:"Article card",hidden:true}));
  fireEvent.click(cards.getAllByRole("button",{hidden:true}).find(button=>button.getAttribute("data-option-id")==="CARD-03")!);
  const s=resolveDesign(result).selection;
  expect([s.articleCard,s.collectionCard,s.relatedCard]).toEqual(["CARD-03","CARD-03","CARD-03"]);
  const next=withSelection(result,{...s,image:"IMG-05"});
  expect(resolveDesign(JSON.parse(JSON.stringify(next))).selection.image).toBe("IMG-05");
  expect(next.base_style_id).toBe("STYLE_01");
},15000);

it("appearance switches preserve branding and same-site hero content references",()=>{
  const current={...customAppearanceConfig("STYLE_02"),branding:{tagline:"Owned introduction"},hero:{media_id:"same-site-id",cta:{enabled:false as const}}};
  const next=preserveAppearanceContent(appearanceConfig("STANDARD"),current);
  expect(next.branding).toEqual(current.branding);expect(next.hero?.media_id).toBe("same-site-id");expect(next.hero?.cta).toEqual({enabled:false});
});

it("workspace saves only presentation, restores the saved look and reloads persisted Standard",async()=>{
  let config:PresentationConfig=readyStyleConfig("STYLE_02");const pages=startingPages();const original=JSON.stringify(pages);const writes:AdminRequestInput[]=[];
  const request:AdminTransport["request"]=async<T,>(id:string,input?:AdminRequestInput)=>{
    if(id==="API15-S-097"){
      writes.push(input!);const entries=(input!.body as {settings:Array<{key:string;value:PresentationConfig}>}).settings;
      expect(entries.map(entry=>entry.key)).toEqual(["presentation_config"]);config=entries[0]!.value;
    }else if(id!=="API15-S-096")throw new Error("unexpected operation");
    return {status:200,data:{settings:[{key:"presentation_config",value:structuredClone(config)},{key:"static_pages",value:pages},{key:"locale_code",value:"en-IN"}]},headers:new Headers()} as AdminResponse<T>;
  };
  function workspace(){const site={site_key:"SITE-15",display_name:"Synthetic workspace",lifecycle_state:"ACTIVE",effective_permissions:["site_settings.view","site_settings.edit"],access_level:"FULL_WEBSITE_MANAGER" as const};
    const router=createMemoryRouter([{path:"/site/:siteKey/appearance",element:<DirtyStateProvider><SiteContextValue value={site}><AppearancePage/></SiteContextValue></DirtyStateProvider>}],{initialEntries:["/site/SITE-15/appearance"]});
    return render(<AdminApiProvider transport={{request}}><RouterProvider router={router}/></AdminApiProvider>);}
  let mounted=workspace();const chooser=within(await screen.findByRole("group",{name:"Website style"}));
  const standard=chooser.getByRole("button",{name:/Standard — Sage Editorial The approved/});
  fireEvent.click(standard);fireEvent.click(screen.getByText("Restore saved appearance").closest("button")!);
  expect(chooser.getByRole("button",{name:/Classic Editorial A curated/})).toHaveAttribute("aria-pressed","true");
  fireEvent.click(standard);fireEvent.click(screen.getByText("Save Appearance").closest("button")!);
  await waitFor(()=>expect(writes).toHaveLength(1));
  expect(config).toEqual(appearanceConfig("STANDARD","en-IN"));expect(JSON.stringify(pages)).toBe(original);
  mounted.unmount();mounted=workspace();
  const reloaded=within(await screen.findByRole("group",{name:"Website style"}));
  expect(reloaded.getByRole("button",{name:/Standard — Sage Editorial The approved/})).toHaveAttribute("aria-pressed","true");
},15000);
