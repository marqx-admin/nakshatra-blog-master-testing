import { useMemo, useState } from "react";
import { useAdminQuery } from "../../app/query-client/hooks";
import { asRecord, asRecords, formatDate, stringValue, type UnknownRecord } from "../recordUtils";
import { Alert, Button, Checkbox, DataTable, EmptyState, FormSection, Modal, SelectField, StatusBadge, TextArea, TextField } from "../../ui/components";

function listItems(value: unknown): UnknownRecord[] {
  return asRecords(asRecord(value).items);
}

export function MediaPicker({ siteKey, value, onSelect, label = "Choose media" }: { siteKey: string; value?: string; onSelect(mediaId: string): void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const query = useAdminQuery<UnknownRecord>("API15-S-060", { path: { site_key: siteKey }, query: { search: search.trim() || undefined, page: 1, page_size: 24, sort: "UPDATED_DESC" } }, open || Boolean(value));
  const items = listItems(query.data);
  const selected = items.find((media) => stringValue(media, "media_id", "") === value);
  return <>
    <div className="bp-inline-actions">
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>{label}</Button>
      {value ? <span className="bp-field-hint">Selected: {selected ? stringValue(selected, "title", stringValue(selected, "filename", "Media")) : "Media selected"}</span> : null}
    </div>
    <Modal open={open} title="Media picker" description="Only media returned for the current validated SiteContext can be selected. The picker never reads object storage directly." onClose={() => setOpen(false)}>
      <div className="bp-form-stack">
        <TextField label="Search media" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title or filename" />
        {query.isLoading ? <p role="status">Loading media…</p> : null}
        {query.isError ? <Alert tone="danger">Media could not be loaded in this website context.</Alert> : null}
        {!query.isLoading && !query.isError && items.length === 0 ? <EmptyState title="No selectable media" description="The current authorized media query returned no records." /> : null}
        <div className="bp-media-picker-list">
          {items.map((media) => {
            const mediaId = stringValue(media, "media_id", "");
            return <article key={mediaId} className="bp-media-picker-row">
              <div>{typeof media.public_url === "string" ? <img className="bp-media-picker-thumb" src={media.public_url} alt={stringValue(media, "alt_text", "")} /> : null}<strong>{stringValue(media, "title", stringValue(media, "filename", "Untitled media"))}</strong><span>{stringValue(media, "filename")} · {stringValue(media, "mime_type")} · usage {stringValue(media, "usage_count", "0")}</span></div>
              <Button type="button" variant="secondary" onClick={() => { onSelect(mediaId); setOpen(false); }}>Select</Button>
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

function normalizedLink(value: unknown): UnknownRecord | undefined {
  const link = asRecord(value);
  return Object.keys(link).length ? link : undefined;
}

export function RichTextRunsEditor({ label, value, onChange, multiline = false }: { label: string; value: unknown; onChange(value: UnknownRecord): void; multiline?: boolean }) {
  const runs = normalizeRuns(value);
  function replaceRun(index: number, patch: UnknownRecord) {
    const next = runs.map((run, current) => current === index ? { ...run, ...patch } : run);
    onChange({ runs: next });
  }
  function setMark(index: number, mark: "BOLD" | "ITALIC", checked: boolean) {
    const current = Array.isArray(runs[index]?.marks) ? (runs[index]!.marks as unknown[]).filter((item): item is string => typeof item === "string") : [];
    const marks = checked ? [...new Set([...current, mark])] : current.filter((item) => item !== mark);
    replaceRun(index, { marks });
  }
  function setLink(index: number, link: UnknownRecord | undefined) {
    const next = runs.map((run, current) => {
      if (current !== index) return run;
      const copy = { ...run };
      if (link) copy.link = link;
      else delete copy.link;
      return copy;
    });
    onChange({ runs: next });
  }
  return <div className="bp-rich-text-editor" role="group" aria-label={label}>
    <div className="bp-rich-text-editor-heading"><strong>{label}</strong><Button type="button" variant="tertiary" onClick={() => onChange({ runs: [...runs, { text: "", marks: [] }] })}>Add text run</Button></div>
    {runs.map((run, index) => {
      const marks = Array.isArray(run.marks) ? run.marks as unknown[] : [];
      const link = normalizedLink(run.link);
      const kind = link ? stringValue(link, "kind", "EXTERNAL") : "EXTERNAL";
      // The key must describe the run's identity, not its mutable text.  Including
      // text here remounted the input after every keystroke and made typing appear
      // limited to one character.
      return <div className="bp-rich-text-run" key={index}>
        {multiline ? <TextArea label={`Text run ${index + 1}`} value={String(run.text ?? "")} onChange={(event) => replaceRun(index, { text: event.target.value })} /> : <TextField label={`Text run ${index + 1}`} value={String(run.text ?? "")} onChange={(event) => replaceRun(index, { text: event.target.value })} />}
        <div className="bp-inline-actions" role="group" aria-label={`Formatting for text run ${index + 1}`}>
          <Checkbox label="Bold" checked={marks.includes("BOLD")} onChange={(event) => setMark(index, "BOLD", event.target.checked)} />
          <Checkbox label="Italic" checked={marks.includes("ITALIC")} onChange={(event) => setMark(index, "ITALIC", event.target.checked)} />
          <Checkbox label="Link" checked={Boolean(link)} onChange={(event) => setLink(index, event.target.checked ? { kind: "EXTERNAL", url: "" } : undefined)} />
          {runs.length > 1 ? <Button type="button" variant="tertiary" onClick={() => onChange({ runs: runs.filter((_, current) => current !== index) })}>Remove run</Button> : null}
        </div>
        {link ? <div className="bp-rich-text-link-fields">
          <SelectField label="Link kind" value={kind} onChange={(event) => setLink(index, event.target.value === "INTERNAL" ? { kind: "INTERNAL", target_type: "ARTICLE", target_id: "" } : { kind: "EXTERNAL", url: "" })}><option value="EXTERNAL">External</option><option value="INTERNAL">Internal</option></SelectField>
          {kind === "INTERNAL" ? <><SelectField label="Internal target type" value={stringValue(link, "target_type", "ARTICLE")} onChange={(event) => setLink(index, { ...link, kind: "INTERNAL", target_type: event.target.value })}><option value="ARTICLE">ARTICLE</option><option value="CATEGORY">CATEGORY</option><option value="TAG">TAG</option><option value="AUTHOR">AUTHOR</option><option value="STATIC">STATIC</option></SelectField><TextField label="Internal target ID" value={stringValue(link, "target_id", "") === "—" ? "" : stringValue(link, "target_id", "")} onChange={(event) => setLink(index, { ...link, kind: "INTERNAL", target_id: event.target.value })} /></> : <TextField label="External URL" type="url" value={stringValue(link, "url", "") === "—" ? "" : stringValue(link, "url", "")} onChange={(event) => setLink(index, { kind: "EXTERNAL", url: event.target.value })} />}
        </div> : null}
      </div>;
    })}
  </div>;
}
