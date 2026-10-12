import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { asRecord, asRecords, formatDate, stringValue, type UnknownRecord } from "../recordUtils";
import { Alert, Button, Checkbox, DataTable, EmptyState, FormSection, Modal, SelectField, StatusBadge, TextArea, TextField } from "../../ui/components";

function listItems(value: unknown): UnknownRecord[] {
  return asRecords(asRecord(value).items);
}

const MEDIA_MAX_BYTES = 20 * 1024 * 1024;
const MEDIA_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
};
export function mediaFileValidationError(file: Pick<File, "name" | "size" | "type">): string | undefined {
  const extensions=MEDIA_TYPES[file.type];
  if(!extensions)return "Use a JPG, PNG, WebP or AVIF image.";
  const extension=file.name.includes(".")?file.name.split(".").pop()?.toLowerCase():"";
  if(!extension||!extensions.includes(extension))return "The file extension does not match the selected image type.";
  if(file.size>MEDIA_MAX_BYTES)return "Images must be 20 MB or smaller.";
  return undefined;
}

function normalizedInternalCandidate(candidate: UnknownRecord): UnknownRecord | undefined {
  const postId=stringValue(candidate,"post_id",stringValue(candidate,"resource_id",""));
  if(postId&&postId!=="—")return {kind:"ARTICLE",resource_id:postId,label:stringValue(candidate,"title",stringValue(candidate,"label","Untitled article"))};
  const staticPageKey=stringValue(candidate,"static_page_key","");
  if(staticPageKey&&staticPageKey!=="—")return {kind:"STATIC",static_page_key:staticPageKey,label:stringValue(candidate,"label","Website page")};
  return undefined;
}

export function MediaPicker({ siteKey, value, fallbackValue, fallbackLabel, onSelect, label = "Choose media", disabled = false, preview = "compact", openOnMount = false, buttonId }: { siteKey: string; value?: string; fallbackValue?: string; fallbackLabel?: string; onSelect(mediaId: string): void; label?: string; disabled?: boolean; preview?: "compact" | "article"; openOnMount?: boolean; buttonId?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File>();
  const [altText, setAltText] = useState("");
  const [validationError,setValidationError]=useState<string>();
  const effectiveValue=value||fallbackValue||"";
  const query = useAdminQuery<UnknownRecord>("API15-S-060", { path: { site_key: siteKey }, query: { search: search.trim() || undefined, page: 1, page_size: 24, sort: "UPDATED_DESC" } }, open);
  const selectedQuery = useAdminQuery<UnknownRecord>("API15-S-062", { path: { site_key: siteKey, media_id: effectiveValue } }, Boolean(effectiveValue));
  const upload = useAdminMutation<UnknownRecord>("API15-S-061", { invalidate: ["API15-S-060"] });
  const items = listItems(query.data);
  const selectedDetail = asRecord(asRecord(selectedQuery.data).media);
  const selected = Object.keys(selectedDetail).length ? selectedDetail : items.find((media) => stringValue(media, "media_id", "") === effectiveValue);
  useEffect(()=>{if(openOnMount&&!disabled)setOpen(true)},[openOnMount,disabled]);
  function prepareFile(next:File|undefined){
    setFile(next);const problem=next?mediaFileValidationError(next):undefined;setValidationError(problem);if(next)setOpen(true);
  }
  async function uploadAndSelect(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const problem=mediaFileValidationError(file);setValidationError(problem);if(problem)return;
    const response = await upload.mutateAsync({ path: { site_key: siteKey }, body: { file, alt_text: altText.trim() || undefined } });
    const media = asRecord(asRecord(response).media);
    const mediaId = stringValue(media, "media_id", "");
    if (mediaId && mediaId !== "—") onSelect(mediaId);
    setFile(undefined);
    setAltText("");
    setValidationError(undefined);
    setOpen(false);
  }
  return <>
    <div className={`bp-media-picker-selection${preview==="article"?" bp-media-picker-selection--article":""}`} onDragOver={event=>{if(!disabled)event.preventDefault()}} onDrop={event=>{if(disabled)return;event.preventDefault();prepareFile(event.dataTransfer.files?.[0])}}>
      {selected && typeof selected.public_url === "string" ? <img className={preview === "article" ? "bp-media-picker-selected-thumb bp-media-picker-selected-thumb--article" : "bp-media-picker-selected-thumb"} src={selected.public_url} alt={stringValue(selected, "alt_text", "")} /> : preview==="article"?<div className="bp-media-drop-hint"><strong>Drop an image here</strong><span>or choose from this website's media library</span></div>:null}
      <div><div className="bp-inline-actions">
        <Button id={buttonId} type="button" variant="secondary" onClick={() => setOpen(true)} disabled={disabled}>{value ? "Change media" : fallbackValue ? "Choose social image" : label}</Button>
        {value ? <Button type="button" variant="tertiary" onClick={() => onSelect("")} disabled={disabled}>Remove</Button> : null}
      </div>{effectiveValue ? <span className="bp-field-hint">{!value&&fallbackValue?(fallbackLabel??"Using fallback")+" · ":""}{selected ? stringValue(selected, "title", stringValue(selected, "filename", "Selected media")) : !value&&fallbackValue?(fallbackLabel??"Using fallback"):"Selected media"}</span> : null}</div>
    </div>
    <Modal open={open} title="Choose media" description="Upload a new file or choose one already used by this website." onClose={() => setOpen(false)}>
      <div className="bp-form-stack">
        <form className="bp-media-picker-upload" onSubmit={uploadAndSelect}>
          <strong>Upload new</strong>
          <TextField label="File" type="file" accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif" onChange={(event) => prepareFile(event.target.files?.[0])} />
          <TextField label="Alt text" value={altText} onChange={(event) => setAltText(event.target.value)} hint="Describe the image for readers who cannot see it." />
          {validationError ? <Alert tone="warning">{validationError}</Alert> : null}
          {upload.isError ? <Alert tone="danger">The file could not be uploaded. Check the file and try again.</Alert> : null}
          <Button type="submit" variant="primary" loading={upload.isPending} disabled={!file||Boolean(validationError)}>Upload and select</Button>
        </form>
        <div className="bp-media-picker-divider"><span>or choose from the library</span></div>
        <TextField label="Search media" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title or filename" />
        {query.isLoading ? <p role="status">Loading media…</p> : null}
        {query.isError ? <Alert tone="danger">Media could not be loaded for this website.</Alert> : null}
        {!query.isLoading && !query.isError && items.length === 0 ? <EmptyState title="No media found" description={search ? "Try a different search, or upload a new file." : "Upload the first file for this website."} /> : null}
        <div className="bp-media-picker-list">
          {items.map((media) => {
            const mediaId = stringValue(media, "media_id", "");
            return <article key={mediaId} className="bp-media-picker-row">
              <div>{typeof media.public_url === "string" ? <img className="bp-media-picker-thumb" src={media.public_url} alt={stringValue(media, "alt_text", "")} /> : null}<strong>{stringValue(media, "title", stringValue(media, "filename", "Untitled media"))}</strong><span>{stringValue(media, "filename")}</span></div>
              <Button type="button" variant="secondary" onClick={() => { onSelect(mediaId); setOpen(false); }}>{mediaId === effectiveValue ? "Selected" : "Select"}</Button>
            </article>;
          })}
        </div>
      </div>
    </Modal>
  </>;
}

export function UrlHistoryPanel({ siteKey, postId }: { siteKey: string; postId: string }) {
  const query = useAdminQuery<UnknownRecord>("API15-S-028", { path: { site_key: siteKey, post_id: postId } }, Boolean(postId));
  const items = listItems(query.data);
  return <FormSection title="URL history awareness" description="Former slugs are read-only history here. The Admin does not treat URL history as an implicit redirect rule.">
    {query.isLoading ? <p role="status">Loading URL history…</p> : null}
    {query.isError ? <Alert tone="warning">URL history could not be loaded. No redirect is inferred client-side.</Alert> : null}
    {!query.isLoading && !query.isError && items.length === 0 ? <p className="bp-field-hint">No former slug history was returned.</p> : null}
    {items.length ? <DataTable caption="Post URL history" rows={items} rowKey={(row) => `${stringValue(row, "slug")}-${stringValue(row, "became_current_at")}`} columns={[
      { key: "slug", header: "Slug", cell: (row) => <code>{stringValue(row, "slug")}</code> },
      { key: "from", header: "Became current", cell: (row) => formatDate(row.became_current_at) },
      { key: "until", header: "Ceased current", cell: (row) => row.ceased_current_at ? formatDate(row.ceased_current_at) : "Current / not ceased" },
    ]} /> : null}
  </FormSection>;
}

export function InternalLinkSearchPanel({ siteKey, onUse }: { siteKey: string; onUse(candidate: UnknownRecord): void }) {
  const [search, setSearch] = useState("");
  const enabled = search.trim().length > 0;
  const query = useAdminQuery<UnknownRecord>("API15-S-091", { path: { site_key: siteKey }, query: { q: search.trim() || undefined, page: 1, page_size: 20 } }, enabled);
  const candidates = listItems(query.data).map(normalizedInternalCandidate).filter((item): item is UnknownRecord => Boolean(item));
  return <FormSection title="Internal link search" description="Search articles on this website and choose a destination by title.">
    <TextField label="Search articles" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title" />
    {query.isLoading ? <p role="status">Searching…</p> : null}
    {query.isError ? <Alert tone="warning">Articles could not be searched right now.</Alert> : null}
    {enabled && !query.isLoading && !query.isError && candidates.length === 0 ? <p className="bp-field-hint">No matching articles found.</p> : null}
    {candidates.length ? <div className="bp-link-candidate-list">{candidates.map((candidate) => <InternalArticleCandidate key={stringValue(candidate,"resource_id",stringValue(candidate,"static_page_key"))} siteKey={siteKey} candidate={candidate} onUse={onUse}/>)}</div> : null}
  </FormSection>;
}

function InternalArticleCandidate({siteKey,candidate,onUse}:{siteKey:string;candidate:UnknownRecord;onUse(candidate:UnknownRecord):void}){
  const postId=stringValue(candidate,"resource_id","");
  const detail=useAdminQuery<UnknownRecord>("API15-S-012",{path:{site_key:siteKey,post_id:postId}},Boolean(postId));
  const post=asRecord(asRecord(detail.data).post);
  const title=stringValue(candidate,"label",stringValue(post,"title","Untitled article"));
  const slug=stringValue(post,"slug","");
  return <button className="bp-link-candidate" type="button" onClick={()=>onUse(candidate)}><strong>{title}</strong><span>{slug&&slug!=="—"?"/article/"+slug:"Article on this website"}</span></button>;
}
function SelectedRelatedArticle({ siteKey, postId, onRemove }: { siteKey: string; postId: string; onRemove(): void }) {
  const query = useAdminQuery<UnknownRecord>("API15-S-012", { path: { site_key: siteKey, post_id: postId } }, Boolean(postId));
  const post = asRecord(asRecord(query.data).post);
  return <span className="bp-related-chip"><span>{query.isLoading ? "Loading article…" : query.isError ? "Selected article" : stringValue(post, "title", "Selected article")}</span><Button type="button" variant="tertiary" onClick={onRemove}>Remove</Button></span>;
}

export function RelatedCandidatePanel({ siteKey, postId, relatedIds, onChange }: { siteKey: string; postId?: string; relatedIds: string[]; onChange(ids: string[]): void }) {
  const [search, setSearch] = useState("");
  const enabled = search.trim().length > 0;
  const query = useAdminQuery<UnknownRecord>("API15-S-092", { path: { site_key: siteKey }, query: { post_id: postId || undefined, q: search.trim() || undefined, page: 1, page_size: 20 } }, enabled);
  const items = listItems(query.data).filter(row=>stringValue(row,"post_id",stringValue(row,"resource_id",""))!==postId);
  const selected = useMemo(() => new Set(relatedIds.filter(Boolean)), [relatedIds.join("|")]);
  return <FormSection title="Related articles" description="Search and choose articles from this website only.">
    {relatedIds.length ? <div className="bp-related-selected" aria-label="Selected related articles">{relatedIds.map((id) => <SelectedRelatedArticle key={id} siteKey={siteKey} postId={id} onRemove={() => onChange(relatedIds.filter((candidate) => candidate !== id))}/>)}</div> : <p className="bp-field-hint">No related articles selected.</p>}
    <TextField label="Find an article" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title" />
    {query.isLoading ? <p role="status">Searching…</p> : null}
    {query.isError ? <Alert tone="warning">Related article suggestions could not be loaded.</Alert> : null}
    {enabled && !query.isLoading && !query.isError && items.length === 0 ? <p className="bp-field-hint">No matching articles found.</p> : null}
    {items.length ? <DataTable caption="Related article candidates" rows={items} rowKey={(row) => stringValue(row, "post_id")} columns={[
      { key: "title", header: "Article", cell: (row) => <strong>{stringValue(row, "title", "Untitled article")}</strong> },
      { key: "status", header: "Status", cell: (row) => <StatusBadge value={stringValue(row, "status", "DRAFT")} /> },
      { key: "action", header: "Action", cell: (row) => { const id = stringValue(row, "post_id", ""); const exists = selected.has(id); return <Button type="button" variant="secondary" onClick={() => onChange(exists ? relatedIds.filter((candidate) => candidate !== id) : [...relatedIds, id])}>{exists ? "Remove" : "Add"}</Button>; } },
    ]} /> : null}
  </FormSection>;
}

function normalizeRuns(value: unknown): UnknownRecord[] {
  const raw = asRecord(value).runs;
  const runs = asRecords(raw);
  return runs.length ? runs : [{ text: "", marks: [] }];
}

function runSignature(value: unknown): string {
  return JSON.stringify(normalizeRuns(value));
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function richHtml(value: unknown): string {
  return normalizeRuns(value).map(run => {
    let html = escapeHtml(String(run.text ?? "")).replaceAll("\n", "<br>");
    const marks = Array.isArray(run.marks) ? run.marks.map(String) : [];
    if (marks.includes("BOLD")) html = `<strong>${html}</strong>`;
    if (marks.includes("ITALIC")) html = `<em>${html}</em>`;
    const link = asRecord(run.link);
    const kind=stringValue(link,"kind","");
    if(kind==="INTERNAL"){const targetType=stringValue(link,"target_type","");const targetId=stringValue(link,"target_id","");const staticPageKey=stringValue(link,"static_page_key","");const attrs=["data-bp-link-kind=\"INTERNAL\"",targetType?"data-bp-target-type=\""+escapeHtml(targetType)+"\"":"",targetId?"data-bp-target-id=\""+escapeHtml(targetId)+"\"":"",staticPageKey?"data-bp-static-page-key=\""+escapeHtml(staticPageKey)+"\"":""].filter(Boolean).join(" ");html="<a href=\"#\" "+attrs+">"+html+"</a>"}else{const href=stringValue(link,"url","");if(href&&href!=="—")html="<a href=\""+escapeHtml(href)+"\" data-bp-link-kind=\"EXTERNAL\">"+html+"</a>"};
    return html;
  }).join("");
}

function sameRunStyle(a: UnknownRecord, b: UnknownRecord): boolean {
  const aMarks = Array.isArray(a.marks) ? a.marks.map(String).sort().join("|") : "";
  const bMarks = Array.isArray(b.marks) ? b.marks.map(String).sort().join("|") : "";
  const aLink = JSON.stringify(asRecord(a.link));
  const bLink = JSON.stringify(asRecord(b.link));
  return aMarks === bMarks && aLink === bLink;
}

function parseRichEditor(root: HTMLElement): UnknownRecord {
  const runs: UnknownRecord[] = [];
  const push = (text: string, marks: string[], link?: UnknownRecord) => {
    if (!text) return;
    const next = { text, marks: [...new Set(marks)], ...(link && Object.keys(link).length ? { link } : {}) };
    const previous = runs.at(-1);
    if (previous && sameRunStyle(previous, next)) previous.text = String(previous.text ?? "") + text;
    else runs.push(next);
  };
  const walk = (node: Node, marks: string[], link?: UnknownRecord) => {
    if (node.nodeType === Node.TEXT_NODE) {
      push(node.textContent ?? "", marks, link);
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName;
    if (tag === "BR") {
      push("\n", marks, link);
      return;
    }
    const nextMarks = [...marks];
    if ((tag === "STRONG" || tag === "B") && !nextMarks.includes("BOLD")) nextMarks.push("BOLD");
    if ((tag === "EM" || tag === "I") && !nextMarks.includes("ITALIC")) nextMarks.push("ITALIC");
    let nextLink=link;
    if(tag==="A"){if(node.getAttribute("data-bp-link-kind")==="INTERNAL"){const targetType=node.getAttribute("data-bp-target-type")??"ARTICLE";const targetId=node.getAttribute("data-bp-target-id");const staticPageKey=node.getAttribute("data-bp-static-page-key");nextLink=targetType==="STATIC"?{kind:"INTERNAL",target_type:"STATIC",static_page_key:staticPageKey??""}:{kind:"INTERNAL",target_type:targetType,target_id:targetId??""}}else nextLink={kind:"EXTERNAL",url:node.getAttribute("href")??""}}
    const isBlock = tag === "DIV" || tag === "P";
    const beforeLength = runs.reduce((total, run) => total + String(run.text ?? "").length, 0);
    node.childNodes.forEach(child => walk(child, nextMarks, nextLink));
    const afterLength = runs.reduce((total, run) => total + String(run.text ?? "").length, 0);
    if (isBlock && afterLength > beforeLength) {
      const last = runs.at(-1);
      if (last && !String(last.text ?? "").endsWith("\n")) push("\n", nextMarks, nextLink);
    }
  };
  root.childNodes.forEach(node => walk(node, [], undefined));
  const last = runs.at(-1);
  if (last && String(last.text ?? "").endsWith("\n")) last.text = String(last.text ?? "").slice(0, -1);
  return { runs: runs.length ? runs : [{ text: "", marks: [] }] };
}

function selectionOffsets(root: HTMLElement): { start: number; end: number } | undefined {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return undefined;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return undefined;
  const beforeStart = document.createRange();
  beforeStart.selectNodeContents(root);
  beforeStart.setEnd(range.startContainer, range.startOffset);
  const beforeEnd = document.createRange();
  beforeEnd.selectNodeContents(root);
  beforeEnd.setEnd(range.endContainer, range.endOffset);
  return { start: beforeStart.toString().length, end: beforeEnd.toString().length };
}

function restoreSelection(root: HTMLElement, start: number, end: number): void {
  const selection = window.getSelection();
  if (!selection) return;
  let cursor = 0;
  let startNode: Node | undefined;
  let endNode: Node | undefined;
  let startOffset = 0;
  let endOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const length = node.textContent?.length ?? 0;
    if (!startNode && start <= cursor + length) {
      startNode = node;
      startOffset = Math.max(0, Math.min(length, start - cursor));
    }
    if (!endNode && end <= cursor + length) {
      endNode = node;
      endOffset = Math.max(0, Math.min(length, end - cursor));
      break;
    }
    cursor += length;
  }
  if (!startNode) {
    startNode = root;
    startOffset = root.childNodes.length;
  }
  if (!endNode) {
    endNode = startNode;
    endOffset = startOffset;
  }
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
}

function transformRichSelection(value: unknown, start: number, end: number, transform: (run: UnknownRecord) => UnknownRecord): UnknownRecord {
  const runs = normalizeRuns(value);
  if (end <= start) return { runs };
  let offset = 0;
  const next: UnknownRecord[] = [];
  for (const run of runs) {
    const runText = String(run.text ?? "");
    const runStart = offset;
    const runEnd = offset + runText.length;
    const selectedStart = Math.max(start, runStart);
    const selectedEnd = Math.min(end, runEnd);
    if (selectedStart >= selectedEnd) next.push(run);
    else {
      const before = runText.slice(0, selectedStart - runStart);
      const selectedText = runText.slice(selectedStart - runStart, selectedEnd - runStart);
      const after = runText.slice(selectedEnd - runStart);
      if (before) next.push({ ...run, text: before });
      next.push(transform({ ...run, text: selectedText }));
      if (after) next.push({ ...run, text: after });
    }
    offset = runEnd;
  }
  return { runs: next.length ? next : [{ text: "", marks: [] }] };
}

function plainRichText(value: unknown): string {
  return normalizeRuns(value).map((run) => String(run.text ?? "")).join("");
}

function runsInsideSelection(value: unknown, start: number, end: number): UnknownRecord[] {
  if (end <= start) return [];
  const runs = normalizeRuns(value);
  const selected: UnknownRecord[] = [];
  let offset = 0;
  for (const run of runs) {
    const text = String(run.text ?? "");
    const runStart = offset;
    const runEnd = offset + text.length;
    const selectedStart = Math.max(start, runStart);
    const selectedEnd = Math.min(end, runEnd);
    if (selectedStart < selectedEnd) selected.push({ ...run, text: text.slice(selectedStart - runStart, selectedEnd - runStart) });
    offset = runEnd;
  }
  return selected;
}

function formattingAtOffset(value:unknown,offset:number):{marks:string[];link?:UnknownRecord}{
  const runs=normalizeRuns(value);let cursor=0;
  for(const run of runs){const text=String(run.text??"");const end=cursor+text.length;if(offset<=end){const marks=Array.isArray(run.marks)?run.marks.map(String):[];const link=asRecord(run.link);return {marks,...(Object.keys(link).length?{link}:{})}}cursor=end}
  return {marks:[]};
}
export function insertRichTextAt(value:unknown,offset:number,text:string,marks:string[],link?:UnknownRecord):UnknownRecord{
  const runs=normalizeRuns(value);let cursor=0;const next:UnknownRecord[]=[];let inserted=false;
  for(const run of runs){const runText=String(run.text??"");const end=cursor+runText.length;if(!inserted&&offset<=end){const cut=Math.max(0,Math.min(runText.length,offset-cursor));const before=runText.slice(0,cut);const after=runText.slice(cut);if(before)next.push({...run,text:before});next.push({text,marks:[...marks],...(link&&Object.keys(link).length?{link}:{})});if(after)next.push({...run,text:after});inserted=true}else next.push(run);cursor=end}
  if(!inserted)next.push({text,marks:[...marks],...(link&&Object.keys(link).length?{link}:{})});
  const merged:UnknownRecord[]=[];for(const run of next){const previous=merged.at(-1);if(previous&&sameRunStyle(previous,run))previous.text=String(previous.text??"")+String(run.text??"");else merged.push(run)}
  return {runs:merged.length?merged:[{text:"",marks:[]}]};
}
export function RichTextRunsEditor({
  label,
  value,
  onChange,
  multiline = false,
  variant = "body",
  editorId,
  placeholder,
  siteKey,
  onEnter,
  onBackspaceAtStart,
  onFocus,
  onUndo,
  onRedo,
  onSlashCommand,
  showToolbar = true,
}: {
  label: string;
  value: unknown;
  onChange(value: UnknownRecord): void;
  multiline?: boolean;
  variant?: "body" | "paragraph" | "heading2" | "heading3" | "heading4" | "quote";
  editorId?: string;
  placeholder?: string;
  siteKey?: string;
  onEnter?(offset: number): void;
  onBackspaceAtStart?(): boolean;
  onFocus?(): void;
  onUndo?(): void;
  onRedo?(): void;
  onSlashCommand?(command: string): boolean;
  showToolbar?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const localSignature = useRef<string | undefined>(undefined);
  const linkRangeRef = useRef<{ start: number; end: number } | undefined>(undefined);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkSearch, setLinkSearch] = useState("");
  const caretFormatRef=useRef<{active:boolean;marks:string[];link?:UnknownRecord}>({active:false,marks:[]});
  const [,setCaretFormatTick]=useState(0);
  const signature = runSignature(value);
  const slashText=plainRichText(value).trim().toLowerCase();
  const slashChoices=[
    {command:"/paragraph",label:"Paragraph",hint:"Start a text paragraph"},
    {command:"/h2",label:"Heading 2",hint:"Section heading"},
    {command:"/h3",label:"Heading 3",hint:"Subsection heading"},
    {command:"/list",label:"Bulleted list",hint:"Create a bullet list"},
    {command:"/number",label:"Numbered list",hint:"Create a numbered list"},
    {command:"/quote",label:"Quote",hint:"Insert a quotation"},
    {command:"/image",label:"Image",hint:"Upload or choose media"},
    {command:"/table",label:"Table",hint:"Insert a table"},
    {command:"/divider",label:"Divider",hint:"Separate sections"},
  ].filter(choice=>slashText==="/"||choice.command.includes(slashText)||choice.label.toLowerCase().includes(slashText.slice(1)));
  const internalLinkQuery = useAdminQuery<UnknownRecord>(
    "API15-S-091",
    { path: { site_key: siteKey || "" }, query: { q: linkSearch.trim() || undefined, page: 1, page_size: 12 } },
    Boolean(siteKey && linkOpen && linkSearch.trim()),
  );
  const internalCandidates = listItems(internalLinkQuery.data);

  useEffect(() => {
    const root = editorRef.current;
    if (!root || signature === localSignature.current) return;
    root.innerHTML = richHtml(value);
    localSignature.current = signature;
  }, [signature, value]);

  function emit(next: UnknownRecord, selection?: { start: number; end: number }) {
    const root = editorRef.current;
    const nextSignature = runSignature(next);
    localSignature.current = nextSignature;
    if (root) {
      root.innerHTML = richHtml(next);
      if (selection) requestAnimationFrame(() => {
        // A removed editor must not replace the active editor's DOM selection.
        if (editorRef.current !== root || !root.isConnected) return;
        restoreSelection(root, selection.start, selection.end);
      });
    }
    onChange(next);
  }

  function handleInput(event: FormEvent<HTMLDivElement>) {
    const next = parseRichEditor(event.currentTarget);
    localSignature.current = runSignature(next);
    onChange(next);
  }

  function selectedRange() {
    const root = editorRef.current;
    return root ? selectionOffsets(root) : undefined;
  }

  function applyMark(mark: "BOLD" | "ITALIC") {
    const range = selectedRange();
    if (!range) return;
    if(range.end<=range.start){const base=caretFormatRef.current.active?caretFormatRef.current:formattingAtOffset(value,range.start);const marks=base.marks.includes(mark)?base.marks.filter(item=>item!==mark):[...new Set([...base.marks,mark])];caretFormatRef.current={active:true,marks,...(base.link?{link:base.link}:{})};setCaretFormatTick(tick=>tick+1);return}
    caretFormatRef.current={active:false,marks:[]};
    const selected = runsInsideSelection(value, range.start, range.end);
    const shouldRemove = selected.length > 0 && selected.every((run) => Array.isArray(run.marks) && run.marks.map(String).includes(mark));
    const next = transformRichSelection(value, range.start, range.end, (run) => {
      const marks = Array.isArray(run.marks) ? run.marks.map(String) : [];
      return { ...run, marks: shouldRemove ? marks.filter((item) => item !== mark) : [...new Set([...marks, mark])] };
    });
    emit(next, range);
  }

  function openLinkEditor() {
    const range = selectedRange();
    if (!range) return;
    linkRangeRef.current = range;
    const linked = range.end>range.start?runsInsideSelection(value, range.start, range.end).map((run) => asRecord(run.link)).find((link) => Object.keys(link).length > 0):caretFormatRef.current.link??formattingAtOffset(value,range.start).link;
    setLinkUrl(linked && stringValue(linked, "kind", "") === "EXTERNAL" ? stringValue(linked, "url", "") : "");
    setLinkSearch("");
    setLinkOpen(true);
  }

  function applyLinkDestination(destination: UnknownRecord) {
    const range = linkRangeRef.current;
    if (!range) return;
    if(range.end<=range.start){const base=caretFormatRef.current.active?caretFormatRef.current:formattingAtOffset(value,range.start);caretFormatRef.current={active:true,marks:base.marks,link:destination};setCaretFormatTick(tick=>tick+1)}else emit(transformRichSelection(value, range.start, range.end, (run) => ({ ...run, link: destination })), range);
    setLinkOpen(false);
  }

  function removeLink() {
    const range = linkRangeRef.current;
    if (!range) return;
    if(range.end<=range.start){const base=caretFormatRef.current.active?caretFormatRef.current:formattingAtOffset(value,range.start);caretFormatRef.current={active:true,marks:base.marks};setCaretFormatTick(tick=>tick+1)}else emit(transformRichSelection(value, range.start, range.end, (run) => {const next = { ...run };delete next.link;return next;}), range);
    setLinkOpen(false);
  }

  function applyInternalCandidate(candidate: UnknownRecord) {
    const normalized=normalizedInternalCandidate(candidate)??candidate;
    const kind = stringValue(normalized, "kind", "ARTICLE");
    if (kind === "STATIC") {
      const staticPageKey = stringValue(normalized, "static_page_key", "");
      if (!staticPageKey || staticPageKey === "—") return;
      applyLinkDestination({ kind: "INTERNAL", target_type: "STATIC", static_page_key: staticPageKey });
      return;
    }
    const resourceId = stringValue(normalized, "resource_id", "");
    if (!resourceId || resourceId === "—") return;
    applyLinkDestination({ kind: "INTERNAL", target_type: kind, target_id: resourceId });
  }

  function handleBeforeInput(event: FormEvent<HTMLDivElement>){const root=editorRef.current;const native=event.nativeEvent as InputEvent;if(!root||!caretFormatRef.current.active||native.inputType!=="insertText"||!native.data)return;const range=selectionOffsets(root);if(!range||range.start!==range.end)return;event.preventDefault();const context=caretFormatRef.current;const next=insertRichTextAt(value,range.start,native.data,context.marks,context.link);const end=range.start+native.data.length;emit(next,{start:end,end})}

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const root = editorRef.current;
    if (!root) return;
    const range = selectionOffsets(root);
    if (!range) return;
    const modifier = event.metaKey || event.ctrlKey;
    const key = event.key.toLowerCase();
    if (modifier && key === "b") { event.preventDefault(); applyMark("BOLD"); return; }
    if (modifier && key === "i") { event.preventDefault(); applyMark("ITALIC"); return; }
    if (modifier && key === "k") { event.preventDefault(); openLinkEditor(); return; }
    if (modifier && key === "z") {
      event.preventDefault();
      if (event.shiftKey) onRedo?.(); else onUndo?.();
      return;
    }
    if (modifier && key === "y") { event.preventDefault(); onRedo?.(); return; }
    if (event.key === "Enter" && !event.shiftKey && onSlashCommand) {
      const command = plainRichText(value).trim();
      if (command.startsWith("/") && onSlashCommand(command)) {
        event.preventDefault();
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey && onEnter) {
      event.preventDefault();
      onEnter(range.start);
      return;
    }
    if (event.key === "Backspace" && range.start === 0 && range.end === 0 && onBackspaceAtStart?.()) {
      event.preventDefault();
    }
  }

  return <div className={`bp-rich-text-editor bp-rich-text-editor--writer bp-rich-text-editor--${variant}`}>
    {showToolbar?<div className="bp-format-toolbar" role="toolbar" aria-label={`${label} formatting`}>
      <Button type="button" variant="tertiary" onMouseDown={(event) => event.preventDefault()} onClick={() => applyMark("BOLD")} title="Bold (⌘/Ctrl+B)"><strong>Bold</strong></Button>
      <Button type="button" variant="tertiary" onMouseDown={(event) => event.preventDefault()} onClick={() => applyMark("ITALIC")} title="Italic (⌘/Ctrl+I)"><em>Italic</em></Button>
      <Button type="button" variant="tertiary" onMouseDown={(event) => event.preventDefault()} onClick={openLinkEditor} title="Link (⌘/Ctrl+K)">Link</Button>
    </div>:null}
    <div
      ref={editorRef}
      id={editorId}
      role="textbox"
      aria-label={label}
      aria-multiline={multiline}
      className="bp-rich-text-surface"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder ?? label}
      onInput={handleInput}
      onBeforeInput={handleBeforeInput}
      onKeyDown={handleKeyDown}
      onMouseUp={()=>{const range=selectedRange();if(range&&range.start===range.end){const base=formattingAtOffset(value,range.start);caretFormatRef.current={active:false,marks:base.marks,...(base.link?{link:base.link}:{})}}}}
      onFocus={onFocus}
    />
    {onSlashCommand&&slashText.startsWith("/")&&slashChoices.length?<div className="bp-slash-menu" role="listbox" aria-label="Block suggestions">{slashChoices.map(choice=><button key={choice.command} type="button" role="option" onMouseDown={event=>event.preventDefault()} onClick={()=>onSlashCommand(choice.command)}><span>{choice.label}</span><small>{choice.hint}</small></button>)}</div>:null}
    <Modal open={linkOpen} title="Add or edit link" description="Paste a web address or choose content from this website." onClose={() => setLinkOpen(false)} footer={<><Button type="button" onClick={() => setLinkOpen(false)}>Cancel</Button><Button type="button" variant="tertiary" onClick={removeLink}>Remove link</Button><Button type="button" variant="primary" disabled={!linkUrl.trim()} onClick={() => applyLinkDestination({ kind: "EXTERNAL", url: linkUrl.trim() })}>Apply URL</Button></>}>
      <div className="bp-form-stack">
        <TextField label="Web address" type="url" value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://example.com" />
        {siteKey ? <><div className="bp-media-picker-divider"><span>or link to this website</span></div><TextField label="Search this website" value={linkSearch} onChange={(event) => setLinkSearch(event.target.value)} placeholder="Search by title" />
          {internalLinkQuery.isLoading ? <p role="status">Searching…</p> : null}
          {internalLinkQuery.isError ? <Alert tone="warning">Internal links could not be searched right now.</Alert> : null}
          <div className="bp-link-candidate-list">{internalCandidates.map(normalizedInternalCandidate).filter((candidate):candidate is UnknownRecord=>Boolean(candidate)).map((candidate) => <InternalArticleCandidate siteKey={siteKey} candidate={candidate} key={stringValue(candidate,"resource_id",stringValue(candidate,"static_page_key"))} onUse={applyInternalCandidate}/>)}</div>
        </> : null}
      </div>
    </Modal>
  </div>;
}
