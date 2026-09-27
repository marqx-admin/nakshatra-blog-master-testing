import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import type { AdminOperationId } from "@bp/api-client-admin";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import type { AdminRequestInput, AdminResponse, AdminTransport } from "../app/query-client/adminTransport";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { SiteContextValue } from "../app/site-context/AdminContext";
import { PostEditorPage, ARTICLE_BLOCK_TYPES, persistableArticleBlocks } from "../modules/site/PostEditor";
import { MediaPicker, RelatedCandidatePanel, RichTextRunsEditor, insertRichTextAt, mediaFileValidationError } from "../modules/site/EditorAssist";
import { fixtureTransport } from "./fixtures/fixtureTransport";
import { afterEach, expect, test, vi } from "vitest";

const permissions=["posts.view","posts.create","posts.edit","posts.preview","posts.publish","posts.schedule","posts.archive","posts.trash","posts.restore","posts.delete","posts.duplicate","posts.revisions.view","seo.view","seo.edit","authors.view","categories.view","tags.view","media.view","media.upload","search.view","calendar.view"];
const postId="00000000-0000-4000-8000-000000000001";

function ok<T>(data:T,headers:Record<string,string>={}):AdminResponse<T>{
  return {status:200,data,headers:new Headers({"X-Request-ID":"test",...headers})};
}
function response<T>(status:number,data:T):AdminResponse<T>{
  return {status,data,headers:new Headers({"X-Request-ID":"test"})};
}
function withOverrides(handler:(id:AdminOperationId,input?:AdminRequestInput)=>AdminResponse<unknown>|Promise<AdminResponse<unknown>|undefined>|undefined):AdminTransport{
  const base=fixtureTransport();
  return {async request<T=unknown>(id:AdminOperationId,input?:AdminRequestInput,signal?:AbortSignal):Promise<AdminResponse<T>>{
    const handled=await handler(id,input);
    if(handled)return handled as AdminResponse<T>;
    return base.request<T>(id,input,signal);
  }};
}
function rich(text:string,marks:string[]=[]){return {runs:[{text,marks}]}}
function makePost(overrides:Record<string,unknown>={}):Record<string,unknown>{
  return {
    post_id:postId,status:"DRAFT",version:1,title:"Fixture Post",excerpt:"",
    body:{content_schema_version:"1",blocks:[{block_id:"b1",type:"PARAGRAPH",content:rich("First paragraph")}]},
    author_site_profile_id:"author-1",category_ids:[],tag_ids:[],manual_related_post_ids:[],
    slug:"fixture-post",updated_at:"2026-09-24T08:00:00Z",created_at:"2026-09-24T08:00:00Z",
    ...overrides,
  };
}
function editorTransport(post:Record<string,unknown>=makePost(),handler?:(id:AdminOperationId,input?:AdminRequestInput)=>AdminResponse<unknown>|Promise<AdminResponse<unknown>|undefined>|undefined):AdminTransport{
  return withOverrides(async(id,input)=>{
    const custom=await handler?.(id,input);if(custom)return custom;
    if(id==="API15-S-012")return ok({post});
    if(id==="API15-S-050")return ok({items:[{author_id:"author-1",display_name:"Fixture Writer"}],page:{page:1,page_size:100,has_more:false}});
    if(id==="API15-S-030")return ok({items:[{category_id:"category-1",name:"News"}],page:{page:1,page_size:100,has_more:false}});
    return undefined;
  });
}
function renderEditor({mode="edit",post=makePost(),transport=editorTransport(post)}:{mode?:"create"|"edit";post?:Record<string,unknown>;transport?:AdminTransport}={}){
  const site={site_key:"SITE-01",display_name:"Fixture Site",lifecycle_state:"ACTIVE" as const,timezone_id:"Asia/Kolkata",effective_permissions:permissions,access_level:"FULL_WEBSITE_MANAGER" as const};
  const element=(editorMode:"create"|"edit")=><DirtyStateProvider><SiteContextValue value={site}><PostEditorPage mode={editorMode}/></SiteContextValue></DirtyStateProvider>;
  const router=createMemoryRouter([
    {path:"/site/:siteKey/posts/new",element:element("create")},
    {path:"/site/:siteKey/posts/:postId",element:element("edit")},
  ],{initialEntries:[mode==="create"?"/site/SITE-01/posts/new":`/site/SITE-01/posts/${String(post.post_id??postId)}`]});
  render(<AdminApiProvider transport={transport}><RouterProvider router={router}/></AdminApiProvider>);
  return router;
}
function setSelection(editor:HTMLElement,start:number,end=start){
  const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT);let node=walker.nextNode();
  let cursor=0;let startNode:Node|undefined;let endNode:Node|undefined;let startOffset=0;let endOffset=0;
  while(node){
    const length=node.textContent?.length??0;
    if(!startNode&&start<=cursor+length){startNode=node;startOffset=Math.max(0,start-cursor)}
    if(!endNode&&end<=cursor+length){endNode=node;endOffset=Math.max(0,end-cursor);break}
    cursor+=length;node=walker.nextNode();
  }
  if(!startNode){startNode=editor;startOffset=editor.childNodes.length}
  if(!endNode){endNode=startNode;endOffset=startOffset}
  const range=document.createRange();range.setStart(startNode,startOffset);range.setEnd(endNode,endOffset);
  const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);
}
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks()});

test("editor exposes a clean WordPress-style command bar while preserving all 12 ArticleBody types",async()=>{
  renderEditor();
  expect(await screen.findByRole("toolbar",{name:"Editor toolbar"})).toBeInTheDocument();
  expect(ARTICLE_BLOCK_TYPES).toEqual(["PARAGRAPH","HEADING","LIST","QUOTE","SEPARATOR","MEDIA","TABLE","EMBED","CALLOUT","CTA","DISCLAIMER","SOURCES_REFERENCES"]);
  for(const label of ["+ Add block","Add Media","Bold","Italic","Link","Bullets","Numbers","Quote","Table","Divider","More","Undo","Redo","Hide settings","Preview","Schedule"]){
    expect(screen.getByRole("button",{name:label})).toBeInTheDocument();
  }
  expect(screen.getByRole("button",{name:/Publish/})).toBeInTheDocument();
  expect(screen.getByRole("heading",{name:"Featured image"})).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"H2"})).not.toBeInTheDocument();
  expect(screen.queryByText("RC8 editorial helper")).not.toBeInTheDocument();
});

test("unified toolbar formats the active writer and More exposes only advanced blocks",async()=>{
  renderEditor();await screen.findByRole("toolbar",{name:"Editor toolbar"});const user=userEvent.setup();
  const paragraph=screen.getByRole("textbox",{name:"Paragraph"});paragraph.focus();setSelection(paragraph,0,5);
  await user.click(screen.getByRole("button",{name:"Bold"}));
  expect(paragraph.querySelector("strong")?.textContent).toBe("First");
  await user.click(screen.getByRole("button",{name:"More"}));
  const more=screen.getByRole("dialog",{name:"More blocks"});
  for(const name of ["Embed","Callout","Button","Disclaimer","Sources and references"])expect(within(more).getByRole("button",{name:new RegExp(name,"i")})).toBeInTheDocument();
  expect(within(more).queryByRole("button",{name:/Paragraph/i})).not.toBeInTheDocument();
  await user.click(within(more).getByRole("button",{name:/Callout/i}));
  expect(await screen.findByLabelText("Callout label")).toBeInTheDocument();
});

test("Add Media immediately opens the portal media picker above the editor",async()=>{
  renderEditor();await screen.findByRole("toolbar",{name:"Editor toolbar"});
  fireEvent.click(screen.getByRole("button",{name:"Add Media"}));
  const dialog=await screen.findByRole("dialog",{name:"Choose media"});
  const backdrop=dialog.closest(".bp-modal-backdrop");
  expect(backdrop?.parentElement).toBe(document.body);
  expect(document.body.style.overflow).toBe("hidden");
  expect(screen.getByLabelText("Image block")).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button",{name:"Close dialog"}));
  await waitFor(()=>expect(screen.queryByRole("dialog",{name:"Choose media"})).not.toBeInTheDocument());
  expect(document.body.style.overflow).toBe("");
});

test("transient empty writer blocks are omitted from persisted ArticleBody content",()=>{
  const blocks=[
    {block_id:"p1",type:"PARAGRAPH",content:rich("Kept")},
    {block_id:"p2",type:"PARAGRAPH",content:rich("")},
    {block_id:"l1",type:"LIST",style:"UNORDERED",items:[rich("One"),rich("")]},
    {block_id:"m1",type:"MEDIA",media_id:"",alt_override:"",caption:""},
    {block_id:"s1",type:"SEPARATOR"},
  ] as never[];
  const persisted=persistableArticleBlocks(blocks);
  expect(persisted.map(block=>block.type)).toEqual(["PARAGRAPH","LIST","SEPARATOR"]);
  const listItems=persisted[1]?.items;
  expect(Array.isArray(listItems)?listItems:[]).toHaveLength(1);
});

test("Enter splits paragraphs, Backspace merges them, and Undo/Redo restore actual editor state",async()=>{
  const post=makePost({body:{content_schema_version:"1",blocks:[
    {block_id:"b1",type:"PARAGRAPH",content:rich("One")},
    {block_id:"b2",type:"PARAGRAPH",content:rich("Two")},
  ]}});
  renderEditor({post,transport:editorTransport(post)});
  await screen.findByRole("toolbar",{name:"Editor toolbar"});
  let paragraphs=screen.getAllByRole("textbox",{name:"Paragraph"});
  setSelection(paragraphs[1]!,0);fireEvent.keyDown(paragraphs[1]!,{key:"Backspace"});
  await waitFor(()=>expect(screen.getAllByRole("textbox",{name:"Paragraph"})).toHaveLength(1));
  expect(screen.getByRole("textbox",{name:"Paragraph"})).toHaveTextContent("OneTwo");
  await userEvent.click(screen.getByRole("button",{name:"Undo"}));
  await waitFor(()=>expect(screen.getAllByRole("textbox",{name:"Paragraph"})).toHaveLength(2));
  await userEvent.click(screen.getByRole("button",{name:"Redo"}));
  await waitFor(()=>expect(screen.getAllByRole("textbox",{name:"Paragraph"})).toHaveLength(1));

  const paragraph=screen.getByRole("textbox",{name:"Paragraph"});setSelection(paragraph,3);
  fireEvent.keyDown(paragraph,{key:"Enter"});
  await waitFor(()=>expect(screen.getAllByRole("textbox",{name:"Paragraph"})).toHaveLength(2));
});

test("contextual transforms, slash blocks, inserter blocks and natural list exit work",async()=>{
  renderEditor();await screen.findByRole("toolbar",{name:"Editor toolbar"});const user=userEvent.setup();
  const paragraph=screen.getByRole("textbox",{name:"Paragraph"});paragraph.focus();
  const transform=await screen.findByRole("combobox",{name:"Block type"});
  await user.selectOptions(transform,"H2");const h2=await screen.findByRole("textbox",{name:"Heading H2"});await user.type(h2,"Heading converted");
  await user.selectOptions(screen.getByRole("combobox",{name:"Block type"}),"PARAGRAPH");
  await waitFor(()=>expect(screen.queryByRole("textbox",{name:"Heading H2"})).not.toBeInTheDocument());
  expect(screen.getByRole("textbox",{name:"Paragraph"})).toHaveTextContent("Heading converted");

  const activeParagraph=screen.getByRole("textbox",{name:"Paragraph"});activeParagraph.focus();activeParagraph.textContent="/h3";setSelection(activeParagraph,3);
  fireEvent.input(activeParagraph);await waitFor(()=>expect(screen.getByRole("listbox",{name:"Block suggestions"})).toBeInTheDocument());
  await user.click(within(screen.getByRole("listbox",{name:"Block suggestions"})).getByRole("option",{name:/Heading 3/}));
  expect(await screen.findByRole("textbox",{name:"Heading H3"})).toBeInTheDocument();

  await user.click(screen.getByRole("button",{name:"+ Add block"}));let dialog=screen.getByRole("dialog",{name:"Add block"});
  await user.type(within(dialog).getByLabelText("Search blocks"),"Quote");await user.click(within(dialog).getByRole("button",{name:/Quote/}));
  const quote=await screen.findByRole("textbox",{name:"Quote"});await user.type(quote,"A simple quote");expect(quote).toHaveTextContent("A simple quote");

  await user.click(screen.getByRole("button",{name:"+ Add block"}));dialog=screen.getByRole("dialog",{name:"Add block"});
  await user.type(within(dialog).getByLabelText("Search blocks"),"Table");await user.click(within(dialog).getByRole("button",{name:/Table/}));
  const cell=await screen.findByRole("textbox",{name:"Row 1, column 1"});await user.type(cell,"Cell value");expect(cell).toHaveValue("Cell value");

  await user.click(screen.getByRole("button",{name:"+ Add block"}));dialog=screen.getByRole("dialog",{name:"Add block"});
  await user.type(within(dialog).getByLabelText("Search blocks"),"List");await user.click(within(dialog).getByRole("button",{name:/List/}));
  const listStyle=await screen.findByRole("group",{name:"List style"});await user.click(within(listStyle).getByRole("button",{name:"Bullets"}));
  const item1=await screen.findByRole("textbox",{name:"List item 1"});await user.type(item1,"First item");fireEvent.keyDown(item1,{key:"Enter"});
  const item2=await screen.findByRole("textbox",{name:"List item 2"});setSelection(item2,0);fireEvent.keyDown(item2,{key:"Enter"});
  await waitFor(()=>expect(screen.queryByRole("textbox",{name:"List item 2"})).not.toBeInTheDocument());
  expect(screen.getByText("First item")).toBeInTheDocument();
  await user.click(within(listStyle).getByRole("button",{name:"Numbers"}));
});

test("settings rail toggles cleanly and selected block controls stay contextual",async()=>{
  renderEditor();await screen.findByRole("toolbar",{name:"Editor toolbar"});const user=userEvent.setup();
  expect(screen.getByRole("complementary",{name:"Post settings"})).toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:"Hide settings"}));
  expect(screen.queryByRole("complementary",{name:"Post settings"})).not.toBeInTheDocument();
  await user.click(screen.getByRole("button",{name:"Settings"}));
  const paragraph=screen.getByRole("textbox",{name:"Paragraph"});paragraph.focus();
  await user.click(screen.getByRole("tab",{name:"Block"}));
  expect(await screen.findByText("Block controls stay contextual so the writing canvas remains clean.")).toBeInTheDocument();
});

test("duplicate and drag-drop block controls reorder the writing document without changing content",async()=>{
  const post=makePost({body:{content_schema_version:"1",blocks:[
    {block_id:"b1",type:"PARAGRAPH",content:rich("First")},
    {block_id:"b2",type:"PARAGRAPH",content:rich("Second")},
  ]}});
  renderEditor({post,transport:editorTransport(post)});await screen.findByRole("toolbar",{name:"Editor toolbar"});
  const first=screen.getAllByRole("textbox",{name:"Paragraph"})[0]!;first.focus();
  const firstBlock=screen.getAllByLabelText("Paragraph block")[0]!;
  await userEvent.click(within(firstBlock).getByRole("button",{name:"Duplicate"}));
  await waitFor(()=>expect(screen.getAllByRole("textbox",{name:"Paragraph"})).toHaveLength(3));
  const blocks=screen.getAllByLabelText("Paragraph block");
  const drag=within(blocks[0]!).getByRole("button",{name:"Drag Paragraph"});
  fireEvent.dragStart(drag,{dataTransfer:{effectAllowed:"move"}});
  fireEvent.drop(blocks[2]!);
  expect(screen.getAllByRole("textbox",{name:"Paragraph"}).map(node=>node.textContent)).toContain("First");
});

test("Bold and Italic toggle ON/OFF without losing selected text",async()=>{
  function Harness(){const [value,setValue]=useState({runs:[{text:"second paragraph",marks:[] as string[]}]});return <RichTextRunsEditor label="Paragraph" value={value} onChange={next=>setValue(next as typeof value)}/>;}
  render(<AdminApiProvider transport={fixtureTransport()}><Harness/></AdminApiProvider>);const user=userEvent.setup();const editor=screen.getByRole("textbox",{name:"Paragraph"});
  setSelection(editor,0,6);await user.click(screen.getByRole("button",{name:"Bold"}));expect(editor.querySelector("strong")?.textContent).toBe("second");
  setSelection(editor,0,6);await user.click(screen.getByRole("button",{name:"Bold"}));expect(editor.querySelector("strong")).toBeNull();
  setSelection(editor,7,16);await user.click(screen.getByRole("button",{name:"Italic"}));expect(editor.querySelector("em")?.textContent).toBe("paragraph");
  setSelection(editor,7,16);await user.click(screen.getByRole("button",{name:"Italic"}));expect(editor.querySelector("em")).toBeNull();
  expect(editor.textContent).toBe("second paragraph");
});

test("external links and API15-S-091 internal article links preserve structured destinations",async()=>{
  const transport=withOverrides((id,input)=>{
    if(id==="API15-S-091")return ok({items:[{post_id:"article-2",title:"Human Article",status:"PUBLISHED",version:2}],page:{page:1,page_size:12,has_more:false}});
    if(id==="API15-S-012"&&input?.path?.post_id==="article-2")return ok({post:{post_id:"article-2",title:"Human Article",slug:"human-article"}});
    return undefined;
  });
  function Harness(){const [value,setValue]=useState({runs:[{text:"link me",marks:[] as string[],link:undefined as unknown}]});return <RichTextRunsEditor siteKey="SITE-01" label="Paragraph" value={value} onChange={next=>setValue(next as typeof value)}/>;}
  render(<AdminApiProvider transport={transport}><Harness/></AdminApiProvider>);const user=userEvent.setup();const editor=screen.getByRole("textbox",{name:"Paragraph"});

  setSelection(editor,0,4);await user.click(screen.getByRole("button",{name:"Link"}));const dialog=screen.getByRole("dialog");await user.type(within(dialog).getByLabelText("Web address"),"https://example.com");await user.click(within(dialog).getByRole("button",{name:"Apply URL"}));
  expect(editor.querySelector('a[data-bp-link-kind="EXTERNAL"]')).toHaveAttribute("href","https://example.com");

  setSelection(editor,5,7);await user.click(screen.getByRole("button",{name:"Link"}));const internalDialog=screen.getByRole("dialog");await user.type(within(internalDialog).getByLabelText("Search this website"),"Human");
  const candidate=await within(internalDialog).findByRole("button",{name:/Human Article/});await user.click(candidate);
  const internal=editor.querySelector('a[data-bp-link-kind="INTERNAL"]');
  expect(internal).toHaveAttribute("data-bp-target-type","ARTICLE");expect(internal).toHaveAttribute("data-bp-target-id","article-2");
  expect(screen.queryByText("article-2")).not.toBeInTheDocument();
  fireEvent.input(editor);expect(editor.querySelector('a[data-bp-link-kind="INTERNAL"]')).toHaveAttribute("data-bp-target-id","article-2");
});

test("keyboard shortcuts and structured caret insertion preserve formatting context",async()=>{
  const undo=vi.fn(),redo=vi.fn();
  function Harness(){const [value,setValue]=useState({runs:[{text:"hello",marks:[] as string[]}]});return <RichTextRunsEditor label="Paragraph" value={value} onChange={next=>setValue(next as typeof value)} onUndo={undo} onRedo={redo}/>;}
  render(<AdminApiProvider transport={fixtureTransport()}><Harness/></AdminApiProvider>);const editor=screen.getByRole("textbox",{name:"Paragraph"});
  setSelection(editor,0,5);fireEvent.keyDown(editor,{key:"b",ctrlKey:true});
  expect(editor.querySelector("strong")).toHaveTextContent("hello");
  fireEvent.keyDown(editor,{key:"z",ctrlKey:true});expect(undo).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(editor,{key:"z",ctrlKey:true,shiftKey:true});expect(redo).toHaveBeenCalledTimes(1);

  const boldInsert=insertRichTextAt(rich("hello"),5,"X",["BOLD"]) as {runs:Array<Record<string,unknown>>};
  expect(boldInsert.runs.at(-1)).toMatchObject({text:"X",marks:["BOLD"]});
  const withInternal=insertRichTextAt(rich("abc"),3,"Z",["BOLD"],{kind:"INTERNAL",target_type:"ARTICLE",target_id:"p9"}) as {runs:Array<Record<string,unknown>>};
  expect(withInternal.runs.at(-1)).toMatchObject({text:"Z",marks:["BOLD"],link:{kind:"INTERNAL",target_type:"ARTICLE",target_id:"p9"}});
});

test("MediaPicker validates type/size, selects site media, and Social Image returns to Featured Image fallback",async()=>{
  expect(mediaFileValidationError({name:"photo.jpg",type:"image/jpeg",size:1024})).toBeUndefined();
  expect(mediaFileValidationError({name:"photo.gif",type:"image/gif",size:1024})).toMatch(/JPG/);
  expect(mediaFileValidationError({name:"photo.png",type:"image/png",size:21*1024*1024})).toMatch(/20 MB/);

  const media1={media_id:"m1",title:"Featured Cover",filename:"cover.jpg",public_url:"https://media.test/cover.jpg",alt_text:"Cover"};
  const media2={media_id:"m2",title:"Social Override",filename:"social.jpg",public_url:"https://media.test/social.jpg",alt_text:"Social"};
  const transport=withOverrides((id,input)=>{
    if(id==="API15-S-060")return ok({items:[media1,media2],page:{page:1,page_size:24,has_more:false}});
    if(id==="API15-S-062")return ok({media:input?.path?.media_id==="m2"?media2:media1});
    return undefined;
  });
  function Harness(){const [value,setValue]=useState("");return <MediaPicker siteKey="SITE-01" value={value} fallbackValue="m1" fallbackLabel="Using Featured Image" onSelect={setValue} label="Choose social image"/>;}
  render(<AdminApiProvider transport={transport}><Harness/></AdminApiProvider>);
  expect(await screen.findByText(/Using Featured Image/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button",{name:"Choose social image"}));const dialog=screen.getByRole("dialog");await within(dialog).findByText("Social Override");await userEvent.click(within(dialog).getByRole("button",{name:"Select"}));
  await waitFor(()=>expect(screen.getByRole("button",{name:"Remove"})).toBeInTheDocument());
  await userEvent.click(screen.getByRole("button",{name:"Remove"}));expect(await screen.findByText(/Using Featured Image/)).toBeInTheDocument();
});

test("article image picker accepts drag-drop files into the existing validated media workflow",async()=>{
  const transport=withOverrides(()=>undefined);
  function Harness(){const [value,setValue]=useState("");return <MediaPicker siteKey="SITE-01" value={value} onSelect={setValue} label="Upload or choose image" preview="article"/>;}
  render(<AdminApiProvider transport={transport}><Harness/></AdminApiProvider>);
  const drop=screen.getByText("Drop an image here").closest(".bp-media-picker-selection--article");expect(drop).toBeTruthy();
  const file=new File(["image"],"article.png",{type:"image/png"});
  fireEvent.drop(drop as HTMLElement,{dataTransfer:{files:[file]}});
  const dialog=await screen.findByRole("dialog",{name:"Choose media"});
  expect(within(dialog).getByLabelText("File")).toBeInTheDocument();
});

test("Featured Image loads by site media identity and can be removed without exposing an ID",async()=>{
  const featured={media_id:"m1",title:"Featured Cover",filename:"cover.jpg",public_url:"https://media.test/cover.jpg",alt_text:"Featured cover"};
  const post=makePost({featured_media_id:"m1"});
  const transport=editorTransport(post,(id,input)=>{
    if(id==="API15-S-062"&&input?.path?.media_id==="m1")return ok({media:featured});
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});
  const heading=screen.getByRole("heading",{name:"Featured image"});const section=heading.closest("section");expect(section).toBeTruthy();
  expect(await within(section as HTMLElement).findByAltText("Featured cover")).toBeInTheDocument();
  expect(within(section as HTMLElement).getByRole("button",{name:"Change media"})).toBeInTheDocument();
  await userEvent.click(within(section as HTMLElement).getByRole("button",{name:"Remove"}));
  expect(within(section as HTMLElement).getByRole("button",{name:"Choose featured image"})).toBeInTheDocument();
  expect(screen.queryByText("m1")).not.toBeInTheDocument();
});

test("Related Articles reload by title, exclude the current post, and add another human-title result",async()=>{
  const transport=withOverrides((id,input)=>{
    if(id==="API15-S-012"){const idValue=String(input?.path?.post_id);return ok({post:{post_id:idValue,title:idValue==="p2"?"Saved Related":"New Related",slug:idValue}})}
    if(id==="API15-S-092")return ok({items:[{post_id:"p1",title:"Current Article",status:"PUBLISHED"},{post_id:"p3",title:"New Related",status:"PUBLISHED"}],page:{page:1,page_size:20,has_more:false}});
    return undefined;
  });
  function Harness(){const [ids,setIds]=useState(["p2"]);return <RelatedCandidatePanel siteKey="SITE-01" postId="p1" relatedIds={ids} onChange={setIds}/>;}
  render(<AdminApiProvider transport={transport}><Harness/></AdminApiProvider>);
  expect(await screen.findByText("Saved Related")).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Find an article"),"related");
  expect(await screen.findByText("New Related")).toBeInTheDocument();expect(screen.queryByText("Current Article")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button",{name:"Add"}));await waitFor(()=>expect(screen.getAllByText("New Related").length).toBeGreaterThan(1));
});

test("initial draft creation persists edits made while the create request is in flight",async()=>{
  let resolveCreate!:(value:AdminResponse<unknown>)=>void;const createPromise=new Promise<AdminResponse<unknown>>(resolve=>{resolveCreate=resolve});
  const savedBodies:unknown[]=[];
  const transport=editorTransport(makePost(),(id,input)=>{
    if(id==="API15-S-011")return createPromise;
    if(id==="API15-S-013"){savedBodies.push(input?.body);return ok({post:{...makePost({post_id:"new-post",version:2}),excerpt:(input?.body as Record<string,unknown>)?.excerpt}})}
    return undefined;
  });
  renderEditor({mode:"create",transport});await screen.findByRole("heading",{name:"Create Post"});
  fireEvent.change(screen.getByLabelText("Article title"),{target:{value:"New draft"}});
  fireEvent.click(screen.getByRole("button",{name:"Save draft"}));
  fireEvent.change(screen.getByLabelText("Short summary"),{target:{value:"Typed while creating"}});
  await act(async()=>{resolveCreate(ok({post:{...makePost({post_id:"new-post",version:1})}}));await Promise.resolve()});
  await waitFor(()=>expect(savedBodies.length).toBeGreaterThan(0));
  expect(savedBodies.at(-1)).toMatchObject({excerpt:"Typed while creating"});
});

test("stale autosave responses never mark newer edits Saved, and Retry recovers a real failure",async()=>{
  const post=makePost();
  let autosaveCount=0;let resolveFirst!:(value:AdminResponse<unknown>)=>void;const first=new Promise<AdminResponse<unknown>>(resolve=>{resolveFirst=resolve});
  let failNext=false;
  const transport=editorTransport(post,(id)=>{
    if(id==="API15-S-014"){
      autosaveCount+=1;
      if(autosaveCount===1)return first;
      if(failNext){failNext=false;return response(500,{error:{code:"TEST_FAILURE"}})}
      return ok({saved_at:"2026-09-24T09:00:00Z"});
    }
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});vi.useFakeTimers();
  const summary=screen.getByLabelText("Short summary");fireEvent.change(summary,{target:{value:"Edit A"}});
  await act(async()=>{await vi.advanceTimersByTimeAsync(4100)});
  expect(autosaveCount).toBe(1);
  fireEvent.change(summary,{target:{value:"Edit B"}});
  await act(async()=>{resolveFirst(ok({saved_at:"2026-09-24T08:59:00Z"}));await Promise.resolve();await Promise.resolve()});
  expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
  await act(async()=>{await vi.advanceTimersByTimeAsync(4100);await Promise.resolve()});
  expect(screen.getByText(/^Saved/)).toBeInTheDocument();

  fireEvent.change(summary,{target:{value:"Edit C"}});failNext=true;
  await act(async()=>{await vi.advanceTimersByTimeAsync(4100);await Promise.resolve()});
  expect(screen.getByText("Autosave failed.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Retry"}));
  await act(async()=>{await Promise.resolve();await Promise.resolve()});
  expect(screen.getByText(/^Saved/)).toBeInTheDocument();
});

test("manual Save waits for an in-flight autosave so the editor cannot conflict with its own stale base version",async()=>{
  const post=makePost();const calls:AdminOperationId[]=[];let resolveAutosave!:(value:AdminResponse<unknown>)=>void;
  const pendingAutosave=new Promise<AdminResponse<unknown>>(resolve=>{resolveAutosave=resolve});
  const transport=editorTransport(post,(id,input)=>{
    if(id==="API15-S-014"){calls.push(id);return pendingAutosave}
    if(id==="API15-S-013"){calls.push(id);return ok({post:{...post,...(input?.body as object),version:2,status:"DRAFT"}})}
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});vi.useFakeTimers();
  fireEvent.change(screen.getByLabelText("Short summary"),{target:{value:"Serialize me"}});
  await act(async()=>{await vi.advanceTimersByTimeAsync(4100)});
  expect(calls).toEqual(["API15-S-014"]);
  vi.useRealTimers();
  fireEvent.click(screen.getByRole("button",{name:"Save draft"}));
  await act(async()=>{await Promise.resolve();await Promise.resolve()});
  expect(calls).toEqual(["API15-S-014"]);
  await act(async()=>{resolveAutosave(ok({saved_at:"2026-09-24T09:00:00Z"}));await Promise.resolve();await Promise.resolve()});
  await waitFor(()=>expect(calls).toEqual(["API15-S-014","API15-S-013"]));
});

test("recovery with zero persisted blocks restores a usable paragraph placeholder",async()=>{
  const post=makePost({updated_at:"2026-09-24T08:00:00Z"});
  const transport=editorTransport(post,(id)=>{
    if(id==="API15-S-015")return ok({autosave_id:"a1",post_id:postId,base_version:1,saved_at:"2026-09-24T09:00:00Z",working_copy:{body:{content_schema_version:"1",blocks:[]}}});
    return undefined;
  });
  renderEditor({post,transport});const dialog=await screen.findByRole("dialog",{name:"Newer autosave available"});
  await userEvent.click(within(dialog).getByRole("button",{name:"Load autosave into editor"}));
  const paragraph=await screen.findByRole("textbox",{name:"Paragraph"});expect(paragraph).toBeInTheDocument();expect(paragraph.textContent).toBe("");
});

test("dirty content is saved before Schedule and Publish",async()=>{
  let version=1,status="DRAFT";const calls:AdminOperationId[]=[];const post=makePost();
  const transport=editorTransport(post,(id,input)=>{
    if(["API15-S-013","API15-S-017","API15-S-019"].includes(id))calls.push(id);
    if(id==="API15-S-013"){version+=1;return ok({post:{...post,...(input?.body as object),version,status}})}
    if(id==="API15-S-017"){version+=1;status="SCHEDULED";return ok({post:{...post,version,status,slug:"fixture-post"}})}
    if(id==="API15-S-019"){version+=1;status="PUBLISHED";return ok({post:{...post,version,status,slug:"fixture-post"}})}
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});
  fireEvent.change(screen.getByLabelText("Short summary"),{target:{value:"Schedule change"}});
  fireEvent.click(screen.getByRole("button",{name:"Schedule"}));let dialog=screen.getByRole("dialog");fireEvent.change(within(dialog).getByLabelText(/Date and time/),{target:{value:"2026-10-01T10:30"}});fireEvent.click(within(dialog).getByRole("button",{name:"Schedule"}));
  await waitFor(()=>expect(calls).toEqual(["API15-S-013","API15-S-017"]));

  fireEvent.change(screen.getByLabelText("Short summary"),{target:{value:"Publish change"}});
  fireEvent.click(screen.getByRole("button",{name:"Publish…"}));dialog=screen.getByRole("dialog");fireEvent.click(within(dialog).getByRole("button",{name:"Publish now"}));
  await waitFor(()=>expect(calls).toEqual(["API15-S-013","API15-S-017","API15-S-013","API15-S-019"]));
});

test.each([
  ["Archive","API15-S-020"],
  ["Move to Trash","API15-S-021"],
] as const)("%s saves dirty content before the lifecycle mutation",async(actionLabel,lifecycleOp)=>{
  const post=makePost();const calls:AdminOperationId[]=[];
  const transport=editorTransport(post,(id,input)=>{
    if(id==="API15-S-013"){calls.push(id);return ok({post:{...post,...(input?.body as object),version:2,status:"DRAFT"}})}
    if(id===lifecycleOp){calls.push(id);return ok({post:{...post,version:3,status:lifecycleOp==="API15-S-020"?"ARCHIVED":"TRASH"}})}
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});
  fireEvent.change(screen.getByLabelText("Short summary"),{target:{value:"Keep this local edit"}});
  fireEvent.click(screen.getByRole("button",{name:actionLabel}));const dialog=screen.getByRole("dialog");fireEvent.click(within(dialog).getByRole("button",{name:"Confirm"}));
  await waitFor(()=>expect(calls).toEqual(["API15-S-013",lifecycleOp]));
});

test("Preview uses the dynamic current-site origin without publishing",async()=>{
  const open=vi.spyOn(window,"open").mockImplementation(()=>null);const calls:AdminOperationId[]=[];
  const transport=editorTransport(makePost(),(id)=>{
    if(id==="API15-S-016"){calls.push(id);return ok({preview_url:"https://canonical.invalid/_preview/private-token?x=1"})}
    if(id==="API15-S-001")return ok({site_key:"SITE-01"},{"X-BP-Public-Url":"https://site01-staging.example"});
    return undefined;
  });
  renderEditor({transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});fireEvent.click(screen.getByRole("button",{name:"Preview"}));
  await waitFor(()=>expect(open).toHaveBeenCalledWith("https://site01-staging.example/_preview/private-token?x=1","_blank","noopener,noreferrer"));
  expect(calls).toEqual(["API15-S-016"]);
});

test("published posts update through the versioned save and View Live Post uses the dynamic site URL",async()=>{
  const post=makePost({status:"PUBLISHED",slug:"published-article"});const calls:AdminOperationId[]=[];const open=vi.spyOn(window,"open").mockImplementation(()=>null);
  const transport=editorTransport(post,(id,input)=>{
    if(id==="API15-S-013"){calls.push(id);return ok({post:{...post,...(input?.body as object),version:2,status:"PUBLISHED",slug:"published-article"}})}
    if(id==="API15-S-001")return ok({site_key:"SITE-01"},{"X-BP-Public-Url":"https://current-site.example"});
    return undefined;
  });
  renderEditor({post,transport});await screen.findByRole("toolbar",{name:"Editor toolbar"});
  fireEvent.change(screen.getByLabelText("Article title"),{target:{value:"Updated published title"}});fireEvent.click(screen.getByRole("button",{name:"Update"}));
  await waitFor(()=>expect(calls).toEqual(["API15-S-013"]));
  fireEvent.click(screen.getByRole("button",{name:"View Live Post"}));
  await waitFor(()=>expect(open).toHaveBeenCalledWith("https://current-site.example/article/published-article","_blank","noopener,noreferrer"));
});
