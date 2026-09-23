import { useMemo, useRef, useState, type FormEvent } from "react";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { asRecord, asRecords, formatDate, stringValue, type UnknownRecord } from "../recordUtils";
import { Alert, Button, Checkbox, DataTable, EmptyState, FormSection, Modal, SelectField, StatusBadge, TextArea, TextField } from "../../ui/components";

function listItems(value: unknown): UnknownRecord[] {
  return asRecords(asRecord(value).items);
}

export function MediaPicker({ siteKey, value, onSelect, label = "Choose media", disabled = false }: { siteKey: string; value?: string; onSelect(mediaId: string): void; label?: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File>();
  const [altText, setAltText] = useState("");
  const query = useAdminQuery<UnknownRecord>("API15-S-060", { path: { site_key: siteKey }, query: { search: search.trim() || undefined, page: 1, page_size: 24, sort: "UPDATED_DESC" } }, open || Boolean(value));
  const upload = useAdminMutation<UnknownRecord>("API15-S-061", { invalidate: ["API15-S-060"] });
  const items = listItems(query.data);
  const selected = items.find((media) => stringValue(media, "media_id", "") === value);
  async function uploadAndSelect(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const response = await upload.mutateAsync({ path: { site_key: siteKey }, body: { file, alt_text: altText.trim() || undefined } });
    const media = asRecord(asRecord(response).media);
    const mediaId = stringValue(media, "media_id", "");
    if (mediaId && mediaId !== "—") onSelect(mediaId);
    setFile(undefined);
    setAltText("");
    setOpen(false);
  }
  return <>
    <div className="bp-media-picker-selection">
      {selected && typeof selected.public_url === "string" ? <img className="bp-media-picker-selected-thumb" src={selected.public_url} alt={stringValue(selected, "alt_text", "")} /> : null}
      <div><div className="bp-inline-actions">
        <Button type="button" variant="secondary" onClick={() => setOpen(true)} disabled={disabled}>{value ? "Change media" : label}</Button>
        {value ? <Button type="button" variant="tertiary" onClick={() => onSelect("")} disabled={disabled}>Remove</Button> : null}
      </div>{value ? <span className="bp-field-hint">{selected ? stringValue(selected, "title", stringValue(selected, "filename", "Selected media")) : "Selected media"}</span> : null}</div>
    </div>
    <Modal open={open} title="Choose media" description="Upload a new file or choose one already used by this website." onClose={() => setOpen(false)}>
      <div className="bp-form-stack">
        <form className="bp-media-picker-upload" onSubmit={uploadAndSelect}>
          <strong>Upload new</strong>
          <TextField label="File" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0])} />
          <TextField label="Alt text" value={altText} onChange={(event) => setAltText(event.target.value)} hint="Describe the image for readers who cannot see it." />
          {upload.isError ? <Alert tone="danger">The file could not be uploaded. Check the file and try again.</Alert> : null}
          <Button type="submit" variant="primary" loading={upload.isPending} disabled={!file}>Upload and select</Button>
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
              <Button type="button" variant="secondary" onClick={() => { onSelect(mediaId); setOpen(false); }}>{mediaId === value ? "Selected" : "Select"}</Button>
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
  const items = listItems(query.data);
  return <FormSection title="Internal link search" description="Search same-site link candidates through the RC8 editorial helper. Selecting a candidate only prepares structured link data in the working copy.">
    <TextField label="Search link candidates" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search current website" />
    {query.isLoading ? <p role="status">Searching…</p> : null}
    {query.isError ? <Alert tone="warning">Internal-link candidates could not be loaded.</Alert> : null}
    {enabled && !query.isLoading && !query.isError && items.length === 0 ? <p className="bp-field-hint">No same-site link candidates returned.</p> : null}
    {items.length ? <DataTable caption="Internal link candidates" rows={items} rowKey={(row) => `${stringValue(row, "kind")}-${stringValue(row, "resource_id", stringValue(row, "destination_url"))}`} columns={[
      { key: "label", header: "Candidate", cell: (row) => <><strong>{stringValue(row, "label")}</strong><span className="bp-table-secondary">{stringValue(row, "destination_url")}</span></> },
      { key: "kind", header: "Kind", cell: (row) => <StatusBadge value={stringValue(row, "kind", "ARTICLE")} /> },
      { key: "action", header: "Action", cell: (row) => <Button type="button" variant="secondary" onClick={() => onUse(row)} disabled={!row.resource_id}>Insert CTA</Button> },
    ]} /> : null}
  </FormSection>;
}

export function RelatedCandidatePanel({ siteKey, postId, relatedIds, onChange }: { siteKey: string; postId?: string; relatedIds: string[]; onChange(ids: string[]): void }) {
  const [search, setSearch] = useState("");
  const enabled = search.trim().length > 0;
  const query = useAdminQuery<UnknownRecord>("API15-S-092", { path: { site_key: siteKey }, query: { post_id: postId || undefined, q: search.trim() || undefined, page: 1, page_size: 20 } }, enabled);
  const items = listItems(query.data);
  const selected = useMemo(() => new Set(relatedIds.filter(Boolean)), [relatedIds.join("|")]);
  return <FormSection title="Manual related posts" description="Candidate search is site-scoped. Final same-site relationship validation remains server-authoritative when the Post is saved.">
    <TextField label="Search related candidates" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Posts" />
    {query.isLoading ? <p role="status">Searching…</p> : null}
    {query.isError ? <Alert tone="warning">Related Post candidates could not be loaded.</Alert> : null}
    {enabled && !query.isLoading && !query.isError && items.length === 0 ? <p className="bp-field-hint">No candidate Posts returned.</p> : null}
    {items.length ? <DataTable caption="Related Post candidates" rows={items} rowKey={(row) => stringValue(row, "post_id")} columns={[
      { key: "title", header: "Post", cell: (row) => <><strong>{stringValue(row, "title")}</strong><span className="bp-table-secondary">{stringValue(row, "post_id")}</span></> },
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

export function RichTextRunsEditor({ label, value, onChange, multiline = false }: { label: string; value: unknown; onChange(value: UnknownRecord): void; multiline?: boolean }) {
  const runs = normalizeRuns(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const text = runs.map(run => String(run.text ?? "")).join("");
  function transformSelection(transform: (run: UnknownRecord) => UnknownRecord) {
    const start = inputRef.current?.selectionStart ?? 0;
    const end = inputRef.current?.selectionEnd ?? 0;
    if (end <= start) return;
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
    onChange({ runs: next });
    requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(start, end); });
  }
  function applyMark(mark: "BOLD" | "ITALIC") {
    transformSelection(run => ({ ...run, marks: [...new Set([...(Array.isArray(run.marks) ? run.marks.filter(item => typeof item === "string") : []), mark])] }));
  }
  function applyLink() {
    const url = window.prompt("Paste the link URL");
    if (!url) return;
    transformSelection(run => ({ ...run, link: { kind: "EXTERNAL", url } }));
  }
  const editor = <TextArea ref={inputRef} label={label} rows={multiline ? 5 : 2} value={text} hint="Select text, then use Bold, Italic, or Link." onChange={event => onChange({ runs: [{ text: event.target.value, marks: [] }] })} />;
  return <div className="bp-rich-text-editor" role="group" aria-label={label}>
    <div className="bp-format-toolbar" role="toolbar" aria-label={`${label} formatting`}>
      <Button type="button" variant="tertiary" onClick={() => applyMark("BOLD")}><strong>Bold</strong></Button>
      <Button type="button" variant="tertiary" onClick={() => applyMark("ITALIC")}><em>Italic</em></Button>
      <Button type="button" variant="tertiary" onClick={applyLink}>Link</Button>
    </div>
    {editor}
  </div>;
}
