import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { PostEditorPage, ARTICLE_BLOCK_TYPES } from "../modules/site/PostEditor";
import { RichTextRunsEditor } from "../modules/site/EditorAssist";
import { fixtureTransport } from "./fixtures/fixtureTransport";
import { expect, test } from "vitest";

const permissions=["posts.view","posts.create","posts.edit","posts.preview","posts.publish","posts.schedule","posts.archive","posts.trash","posts.restore","posts.delete","posts.duplicate","posts.revisions.view","seo.view","seo.edit","authors.view","categories.view","tags.view","media.view","media.upload","search.view","calendar.view"];

function renderEditor(){
  const router=createMemoryRouter([{
    path:"/site/:siteKey/posts/:postId",
    element:<DirtyStateProvider><SiteContextValue value={{site_key:"SITE-01",display_name:"Fixture Site",lifecycle_state:"ACTIVE",timezone_id:"Asia/Kolkata",effective_permissions:permissions,access_level:"FULL_WEBSITE_MANAGER"}}><PostEditorPage mode="edit"/></SiteContextValue></DirtyStateProvider>,
  }],{initialEntries:["/site/SITE-01/posts/00000000-0000-4000-8000-000000000001"]});
  render(<AdminApiProvider transport={fixtureTransport()}><RouterProvider router={router}/></AdminApiProvider>);
}

test("editor exposes the frozen 12 block model through a simple writer surface",async()=>{
  renderEditor();
  expect(await screen.findByRole("heading",{name:"Edit Post"})).toBeInTheDocument();
  expect(ARTICLE_BLOCK_TYPES).toEqual(["PARAGRAPH","HEADING","LIST","QUOTE","SEPARATOR","MEDIA","TABLE","EMBED","CALLOUT","CTA","DISCLAIMER","SOURCES_REFERENCES"]);
  for(const label of ["H2","H3","Bulleted list","Numbered list","Quote","Image","Table","Divider","Undo","Redo","Preview"]){
    expect(screen.getByRole("button",{name:label})).toBeInTheDocument();
  }
  expect(screen.getByRole("button",{name:/Publish/})).toBeInTheDocument();
  expect(screen.queryByText("Unordered")).not.toBeInTheDocument();
  expect(screen.queryByText("Ordered")).not.toBeInTheDocument();
  expect(screen.queryByText("A horizontal divider will appear here.")).not.toBeInTheDocument();
});

test("list, table and divider insert as visual editor controls",async()=>{
  renderEditor();
  await screen.findByRole("heading",{name:"Edit Post"});
  const user=userEvent.setup();

  await user.click(screen.getByRole("button",{name:"Bulleted list"}));
  expect(await screen.findByRole("textbox",{name:"List item 1"})).toBeInTheDocument();

  await user.click(screen.getByRole("button",{name:"Table"}));
  expect(await screen.findByRole("textbox",{name:"Row 1, column 1"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Add row"})).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Add column"})).toBeInTheDocument();

  await user.click(screen.getByRole("button",{name:"Divider"}));
  expect(screen.getByLabelText("Divider")).toBeInTheDocument();
});

test("bold formatting toggles on and back off for the selected text",async()=>{
  function Harness(){
    const [value,setValue]=useState({runs:[{text:"second paragraph",marks:[] as string[]}]});
    return <RichTextRunsEditor label="Paragraph" value={value} onChange={next=>setValue(next as typeof value)}/>;
  }
  render(<AdminApiProvider transport={fixtureTransport()}><Harness/></AdminApiProvider>);
  const user=userEvent.setup();
  const editor=screen.getByRole("textbox",{name:"Paragraph"});
  const selectSecond=()=>{
    const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);
    const textNode=walker.nextNode();
    expect(textNode).toBeTruthy();
    const range=document.createRange();
    range.setStart(textNode!,0);range.setEnd(textNode!,6);
    const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);
  };

  selectSecond();
  await user.click(screen.getByRole("button",{name:"Bold"}));
  expect(editor.querySelector("strong")?.textContent).toBe("second");

  selectSecond();
  await user.click(screen.getByRole("button",{name:"Bold"}));
  expect(editor.querySelector("strong")).toBeNull();
  expect(editor.textContent).toBe("second paragraph");
});
