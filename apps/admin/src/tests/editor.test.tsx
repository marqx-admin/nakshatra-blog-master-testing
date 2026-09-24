import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { PostEditorPage, ARTICLE_BLOCK_TYPES } from "../modules/site/PostEditor";
import { fixtureTransport } from "./fixtures/fixtureTransport";
import { expect, test } from "vitest";

const permissions=["posts.view","posts.edit","posts.preview","posts.publish","posts.schedule","posts.archive","posts.trash","posts.restore","posts.delete","posts.duplicate","posts.revisions.view","seo.view","seo.edit","authors.view","categories.view","tags.view","media.view"];

test("editor renders the exact block palette, natural writing surface and publishing controls",async()=>{
  const router=createMemoryRouter([{
    path:"/site/:siteKey/posts/:postId",
    element:<DirtyStateProvider><SiteContextValue value={{site_key:"SITE-01",display_name:"Fixture Site",lifecycle_state:"ACTIVE",timezone_id:"Asia/Kolkata",effective_permissions:permissions,access_level:"FULL_WEBSITE_MANAGER"}}><PostEditorPage mode="edit"/></SiteContextValue></DirtyStateProvider>,
  }],{initialEntries:["/site/SITE-01/posts/00000000-0000-4000-8000-000000000001"]});
  render(<AdminApiProvider transport={fixtureTransport()}><RouterProvider router={router}/></AdminApiProvider>);
  expect(await screen.findByRole("heading",{name:"Edit Post"})).toBeInTheDocument();
  const labels:Record<(typeof ARTICLE_BLOCK_TYPES)[number],string>={PARAGRAPH:"Paragraph",HEADING:"H2",LIST:"Bullet list",QUOTE:"Quote",SEPARATOR:"Separator",MEDIA:"Image",TABLE:"Table",EMBED:"Embed",CALLOUT:"Callout",CTA:"Button",DISCLAIMER:"Disclaimer",SOURCES_REFERENCES:"Sources and references"};
  for(const type of ARTICLE_BLOCK_TYPES) expect(await screen.findByRole("button",{name:labels[type]})).toBeInTheDocument();
  const user=userEvent.setup();
  await user.click(screen.getByRole("button",{name:"Paragraph"}));
  expect(await screen.findByRole("textbox",{name:"Paragraph"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Undo"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Redo"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Preview"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Publish"})).toBeInTheDocument();
});
