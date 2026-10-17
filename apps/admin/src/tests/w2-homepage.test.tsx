import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { NavigationPage } from "../modules/site/SitePages";
import type { AdminRequestInput, AdminTransport, AdminResponse } from "../app/query-client/adminTransport";

afterEach(cleanup);

function workspace(editable = true) {
  const writes: AdminRequestInput[] = [];
  let homepage = { h1: "Saved title", intro_text: "Saved introduction", sections: [] };
  const request: AdminTransport["request"] = async <T,>(id: string, input?: AdminRequestInput) => {
    let data: unknown;
    if (id === "API15-S-070") data = {header:{items:[]},footer:{items:[]}};
    else if (id === "API15-S-072") data = {homepage};
    else if (id === "API15-S-073") { writes.push(input!); homepage = input!.body as typeof homepage; data = {homepage}; }
    else if (id === "API15-S-096") data = {settings:[{key:"locale_code",value:"hi-IN"}]};
    else data = {items:[]};
    return {status:200,data,headers:new Headers()} as AdminResponse<T>;
  };
  const permissions=["navigation.view","site_settings.view",...(editable?["navigation.manage"]:[])];
  const site={site_key:"SITE-15",display_name:"Synthetic workspace",lifecycle_state:"ACTIVE",effective_permissions:permissions,access_level:"FULL_WEBSITE_MANAGER" as const};
  const router=createMemoryRouter([{path:"/site/:siteKey/navigation",element:<DirtyStateProvider><SiteContextValue value={site}><NavigationPage/></SiteContextValue></DirtyStateProvider>}],{initialEntries:["/site/SITE-15/navigation"]});
  render(<AdminApiProvider transport={{request}}><RouterProvider router={router}/></AdminApiProvider>);
  return writes;
}

it("Home controls send site-owned H1/intro and an explicit cleared lead through the existing operation", async () => {
  const writes=workspace();
  fireEvent.change(await screen.findByLabelText("मुखपृष्ठ शीर्षक"),{target:{value:"हमारा सहेजा गया शीर्षक"}});
  fireEvent.change(screen.getByLabelText("मुखपृष्ठ परिचय"),{target:{value:"हिंदी और English परिचय"}});
  fireEvent.click(screen.getByRole("button",{name:"Save homepage"}));
  await waitFor(()=>expect(writes).toHaveLength(1));
  expect(writes[0]?.path?.site_key).toBe("SITE-15");
  expect(writes[0]?.body).toEqual({h1:"हमारा सहेजा गया शीर्षक",intro_text:"हिंदी और English परिचय",lead_post_id:null,sections:[]});
});

it("Home starter placeholders cannot be submitted by the workspace", async () => {
  const writes=workspace();
  fireEvent.change(await screen.findByLabelText("मुखपृष्ठ शीर्षक"),{target:{value:""}});
  fireEvent.change(screen.getByLabelText("मुखपृष्ठ परिचय"),{target:{value:""}});
  fireEvent.click(screen.getByRole("button",{name:"प्रारूप का उपयोग करें"}));
  expect(screen.getByRole("button",{name:"Save homepage"})).toBeDisabled();
  expect(writes).toHaveLength(0);
});

it("read-only navigation authority cannot save Home content", async () => {
  workspace(false);
  expect(await screen.findByLabelText("मुखपृष्ठ शीर्षक")).toBeDisabled();
  expect(screen.queryByRole("button",{name:"Save homepage"})).not.toBeInTheDocument();
});
