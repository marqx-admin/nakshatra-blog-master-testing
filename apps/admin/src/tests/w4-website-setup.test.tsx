// Synthetic W4 setup coverage; no published records or live services.
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { AdminOperationId } from "@bp/api-client-admin";
import { MemoryRouter } from "react-router-dom";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import type { AdminResponse, AdminTransport } from "../app/query-client/adminTransport";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { WebsiteSetupPanel } from "../modules/site/WebsiteSetupPanel";

afterEach(cleanup);
const permissions=["site_settings.view","posts.view","navigation.view","media.view"];
const readiness={stage:"PROVISIONED",provisioned:true,content_ready:false,launch_ready:false,checks:[
  {key:"PRIVACY",status:"NEEDS_ATTENTION",detail:"Disabled draft needs owner review."},
  {key:"SECURITY_PLATFORM_HEALTH",status:"NOT_VERIFIED",detail:"Separate operational gate."},
]};
const reply=<T,>(data:unknown):AdminResponse<T>=>({status:200,data:data as T,headers:new Headers()});

it("workspace distinguishes provisioning from content/launch readiness and only prepares preview on request",async()=>{
  const writes:string[]=[];
  const request:AdminTransport["request"]=async<T,>(id:AdminOperationId)=>{
    if(id==="API15-S-099")return reply<T>(readiness);
    if(id==="API15-G-001")return reply<T>({effective_permissions:["sites.edit"]});
    if(id==="API15-S-098"){writes.push(id);return reply<T>({preview_url:"https://site-15.example.test/_preview/site?handoff=synthetic",expires_at:"2026-10-17T00:00:00Z"});}
    throw Error("unexpected operation");
  };
  render(<MemoryRouter><AdminApiProvider transport={{request}}><SiteContextValue value={{site_key:"SITE-15",display_name:"Synthetic setup",lifecycle_state:"DISABLED",effective_permissions:permissions}}><WebsiteSetupPanel/></SiteContextValue></AdminApiProvider></MemoryRouter>);
  expect(await screen.findByText(/PRIVACY: NEEDS ATTENTION/)).toBeInTheDocument();
  expect(screen.getByText(/SECURITY PLATFORM HEALTH: NOT VERIFIED/)).toBeInTheDocument();
  expect(screen.getByText("Not established")).toBeInTheDocument();expect(writes).toEqual([]);
  expect(screen.queryByRole("button",{name:/activate|deploy/i})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Prepare private website preview"}));
  expect(await screen.findByRole("link",{name:"Open private website preview"})).toHaveAttribute("rel","noopener noreferrer");
  expect(writes).toEqual(["API15-S-098"]);
});

it("late preview grants cannot appear after switching the selected website",async()=>{
  let finish:(value:AdminResponse<unknown>)=>void=()=>undefined;
  const pending=new Promise<AdminResponse<unknown>>(resolve=>{finish=resolve;});
  const request:AdminTransport["request"]=async<T,>(id:AdminOperationId)=>{
    if(id==="API15-S-099")return reply<T>(readiness);
    if(id==="API15-G-001")return reply<T>({effective_permissions:[]});
    if(id==="API15-S-098")return pending as Promise<AdminResponse<T>>;
    throw Error("unexpected operation");
  };
  function Harness(){const [key,setKey]=useState("SITE-15");return <><button onClick={()=>setKey("SITE-01")}>Switch site</button><SiteContextValue value={{site_key:key,display_name:"Synthetic workspace",lifecycle_state:"DISABLED",effective_permissions:permissions}}><WebsiteSetupPanel/></SiteContextValue></>;}
  render(<MemoryRouter><AdminApiProvider transport={{request}}><Harness/></AdminApiProvider></MemoryRouter>);
  await screen.findByText(/PRIVACY: NEEDS ATTENTION/);
  fireEvent.click(screen.getByRole("button",{name:"Prepare private website preview"}));
  fireEvent.click(screen.getByRole("button",{name:"Switch site"}));
  finish(reply({preview_url:"https://site-15.example.test/_preview/site?handoff=synthetic",expires_at:"2026-10-17T00:00:00Z"}));
  await waitFor(()=>expect(screen.queryByRole("link",{name:"Open private website preview"})).not.toBeInTheDocument());
});
