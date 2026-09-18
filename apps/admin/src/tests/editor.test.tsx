import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { PostEditorPage, ARTICLE_BLOCK_TYPES } from "../modules/site/PostEditor";
import { fixtureTransport } from "./fixtures/fixtureTransport";
import { expect, test } from "vitest";

const permissions=["posts.view","posts.edit","posts.preview","posts.publish","posts.schedule","posts.archive","posts.trash","posts.restore","posts.delete","posts.duplicate","posts.revisions.view","seo.view","seo.edit","authors.view","categories.view","tags.view","media.view"];

test("editor renders the exact block palette and Preview/publish controls",async()=>{
  const router=createMemoryRouter([{
    path:"/site/:siteKey/posts/:postId",
    element:<DirtyStateProvider><SiteContextValue value={{site_key:"SITE-01",display_name:"Fixture Site",lifecycle_state:"ACTIVE",effective_permissions:permissions}}><PostEditorPage mode="edit"/></SiteContextValue></DirtyStateProvider>,
  }],{initialEntries:["/site/SITE-01/posts/00000000-0000-4000-8000-000000000001"]});
  render(<AdminApiProvider transport={fixtureTransport()}><RouterProvider router={router}/></AdminApiProvider>);
  expect(await screen.findByRole("heading",{name:"Edit Post"})).toBeInTheDocument();
  const quickLabels:Partial<Record<(typeof ARTICLE_BLOCK_TYPES)[number],string>>={PARAGRAPH:"Paragraph",HEADING:"Heading",LIST:"List",MEDIA:"Image",QUOTE:"Quote"};
  for(const type of ARTICLE_BLOCK_TYPES) expect(await screen.findByRole("button",{name:quickLabels[type]??type.replaceAll("_"," ").toLowerCase()})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Preview"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Publish"})).toBeInTheDocument();
});
