import React, { useState } from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { InformationPagesEditor } from "../modules/appearance/AppearanceControls";
import { startingPages, informationPageHasContent } from "../modules/appearance/appearance-model";
import { changedInformationPages, contentLabels, homepageStarter, informationStarter, hasDraftPlaceholders } from "../modules/appearance/website-content";

afterEach(cleanup);

describe("W2 site-owned draft content", () => {
  it("offers the approved editor-only Home draft and controlled Hindi labels without publishing posts", () => {
    expect(homepageStarter().h1).toBe("Explore [Primary Topic] with [Website Name].");
    expect(hasDraftPlaceholders(homepageStarter().intro_text)).toBe(true);
    expect(homepageStarter("hi-IN").intro_text).toContain("प्रकाशित लेख");
    expect(contentLabels("hi-IN").homeHeading).toBe("मुखपृष्ठ शीर्षक");
  });

  it("keeps all five templates disabled and legal outlines incomplete until owners supply actual text", () => {
    const pages=startingPages();
    expect(Object.keys(pages)).toEqual(["ABOUT","CONTACT","PRIVACY","TERMS","DISCLAIMER"]);
    for(const page of Object.values(pages)) { expect(page.enabled).toBe(false); expect(informationPageHasContent(page)).toBe(false); }
    expect(pages.ABOUT.body_sections.map(s=>s.heading)).toEqual(["Topics","Navigation","Publisher"]);
    expect(pages.CONTACT.intro_text).toBe("For inquiries relating to this website, use the verified contact information below.");
    expect(pages.PRIVACY.body_sections[0]?.heading).toBe("Who operates site");
    expect(informationStarter("ABOUT","hi-IN").intro_text).toContain("[Approved Topic]");
  });

  it.each(["ABOUT","CONTACT","PRIVACY","TERMS","DISCLAIMER"] as const)("saves/restores only %s, retains version and ordered sections", key => {
    const saved=startingPages();const changed=structuredClone(saved);
    changed[key]={enabled:true,content_version:4,title:"Supplied title",intro_text:"हिंदी / English",body_sections:[{heading:"Second",paragraphs:["Supplied prose"],list_items:["दो","one"]},{heading:"First",paragraphs:["More supplied prose"],list_items:[]}]};
    expect(changedInformationPages(changed,saved)).toEqual({[key]:changed[key]});
    expect(informationPageHasContent(changed[key])).toBe(true);
    changed[key]=structuredClone(saved[key]);expect(changedInformationPages(changed,saved)).toEqual({});
  });

  it("renders page-level save and restore while keeping a sibling's unsaved draft", () => {
    const saved=startingPages();const onSave=vi.fn();
    function Harness(){const [pages,setPages]=useState(saved);return <InformationPagesEditor pages={pages} savedPages={saved} onChange={setPages} onSavePage={onSave}/>;}
    render(<Harness/>);
    fireEvent.change(screen.getByLabelText("Page title"),{target:{value:"Edited About"}});
    fireEvent.click(screen.getByRole("button",{name:/^Contact/}));
    fireEvent.change(screen.getByLabelText("Page title"),{target:{value:"Edited Contact"}});
    fireEvent.click(screen.getByRole("button",{name:"Save this page"}));
    expect(onSave).toHaveBeenCalledWith("CONTACT");
    fireEvent.click(screen.getByRole("button",{name:"Restore saved page"}));
    expect(screen.getByLabelText("Page title")).toHaveValue(saved.CONTACT.title);
    fireEvent.click(screen.getByRole("button",{name:/^About/}));
    expect(screen.getByLabelText("Page title")).toHaveValue("Edited About");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
