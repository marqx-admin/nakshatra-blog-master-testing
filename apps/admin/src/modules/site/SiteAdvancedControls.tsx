import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAdminMutation } from "../../app/query-client/hooks";
import { useAdminTransport } from "../../app/query-client/AdminApiProvider";
import { requireSuccess } from "../../app/query-client/apiState";
import { withMutationHeaders } from "../../app/query-client/adminTransport";
import { useAdminContext, useEffectivePermissions } from "../../app/site-context/AdminContext";
import { asRecord, formatDate, stringValue, type UnknownRecord } from "../recordUtils";
import { Alert, Button, Checkbox, DataTable, FormSection, Modal, SelectField, StatusBadge, TextField } from "../../ui/components";

type PostLifecycleAction = "PUBLISH" | "SCHEDULE" | "ARCHIVE" | "TRASH" | "RESTORE" | "PERMANENT_DELETE";

const actionPermission: Record<PostLifecycleAction, string> = {
  PUBLISH: "posts.publish",
  SCHEDULE: "posts.schedule",
  ARCHIVE: "posts.archive",
  TRASH: "posts.trash",
  RESTORE: "posts.restore",
  PERMANENT_DELETE: "posts.delete",
};

function sitePath(siteKey: string, path: string) {
  return `/site/${encodeURIComponent(siteKey)}${path}`;
}

function selectedTargets(items: UnknownRecord[], selected: Set<string>) {
  return items
    .filter((row) => selected.has(stringValue(row, "post_id", "")))
    .map((row) => ({ post_id: stringValue(row, "post_id", ""), expected_version: Number(row.version ?? 0) }))
    .filter((target) => target.post_id && Number.isInteger(target.expected_version) && target.expected_version > 0);
}

export function PostsBulkPanel({ siteKey, items, onComplete }: { siteKey: string; items: UnknownRecord[]; onComplete(): void }) {
  const permissions = useEffectivePermissions();
  const timezone = useAdminContext().site?.timezone_id ?? "Asia/Kolkata";
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<PostLifecycleAction>("PUBLISH");
  const [scheduleLocal, setScheduleLocal] = useState("");
  const mutation = useAdminMutation<UnknownRecord>("API15-S-025");

  useEffect(() => setSelected(new Set()), [siteKey, items.map((item) => `${item.post_id}:${item.version}`).join("|")]);

  const available = (Object.keys(actionPermission) as PostLifecycleAction[]).filter((candidate) =>
    permissions.includes("posts.edit") && permissions.includes(actionPermission[candidate]),
  );
  useEffect(() => {
    if (available.length && !available.includes(action)) setAction(available[0]!);
  }, [available.join("|"), action]);

  const targets = selectedTargets(items, selected);
  const outcomes = Array.isArray(asRecord(mutation.data).outcomes) ? (asRecord(mutation.data).outcomes as UnknownRecord[]) : [];

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!targets.length) return;
    await mutation.mutateAsync({
      path: { site_key: siteKey },
      body: {
        action,
        targets,
        ...(action === "SCHEDULE" ? { schedule_local_input: scheduleLocal, schedule_timezone_id: timezone } : {}),
      },
    });
    setSelected(new Set());
    onComplete();
  }

  if (!available.length) return null;
  return (
    <FormSection
      title="Bulk lifecycle"
      description="Choose blogs from this page, then apply one lifecycle action. Every change is checked individually by the server."
    >
      <div className="bp-selection-list" role="group" aria-label="Select posts for bulk action">
        {items.map((row) => {
          const id = stringValue(row, "post_id", "");
          return (
            <Checkbox
              key={id}
              label={`${stringValue(row, "title", "Untitled")} — ${stringValue(row, "status", "DRAFT")} — v${stringValue(row, "version", "")}`}
              checked={selected.has(id)}
              onChange={(event) => setSelected((current) => {
                const next = new Set(current);
                event.target.checked ? next.add(id) : next.delete(id);
                return next;
              })}
            />
          );
        })}
      </div>
      <SelectField label="Bulk action" value={action} onChange={(event) => setAction(event.target.value as PostLifecycleAction)}>
        {available.map((candidate) => <option key={candidate} value={candidate}>{candidate.replaceAll("_", " ")}</option>)}
      </SelectField>
      {action === "SCHEDULE" ? (
        <TextField label={`Date and time (${timezone})`} type="datetime-local" value={scheduleLocal} onChange={(event) => setScheduleLocal(event.target.value)} required />
      ) : null}
      {action === "PERMANENT_DELETE" ? <Alert tone="warning">Permanent deletion also requires the server-defined step-up proof. Reauthenticate from Security/Step-up before submitting; the browser does not treat this selection as authority.</Alert> : null}
      {mutation.isError ? <Alert tone="danger">The bulk mutation was not accepted. No client-side overwrite or retry-without-version is attempted.</Alert> : null}
      <Button type="submit" variant="primary" loading={mutation.isPending} disabled={!targets.length || (action === "SCHEDULE" && (!scheduleLocal || !timezone))} onClick={(event) => void submit(event)}>
        Apply to {targets.length} selected
      </Button>
      {outcomes.length ? (
        <DataTable
          caption="Bulk post outcomes"
          rows={outcomes}
          rowKey={(row) => stringValue(row, "post_id")}
          columns={[
            { key: "post", header: "Post", cell: (row) => <Link to={sitePath(siteKey, `/posts/${stringValue(row, "post_id")}`)}>{stringValue(row, "post_id")}</Link> },
            { key: "status", header: "Outcome", cell: (row) => <StatusBadge value={stringValue(row, "status", "VALIDATION_FAILED")} /> },
            { key: "error", header: "Error code", cell: (row) => stringValue(row, "error_code") },
          ]}
        />
      ) : null}
    </FormSection>
  );
}

export function TagMergePanel({ siteKey, tags, onComplete }: { siteKey: string; tags: UnknownRecord[]; onComplete(): void }) {
  const permissions = useEffectivePermissions();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [confirm, setConfirm] = useState(false);
  const mutation = useAdminMutation<UnknownRecord>("API15-S-045");
  if (!(permissions.includes("tags.edit") && permissions.includes("tags.delete")) || tags.length < 2) return null;

  return (
    <FormSection title="Merge tags" description="Merging requires tags.view + tags.edit + tags.delete. The server enforces same-site target integrity and performs the authoritative merge.">
      <div className="bp-grid bp-grid--2">
        <SelectField label="Source tag" value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="">Choose source</option>
          {tags.map((tag) => <option key={stringValue(tag, "tag_id")} value={stringValue(tag, "tag_id")}>{stringValue(tag, "name")}</option>)}
        </SelectField>
        <SelectField label="Target tag" value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="">Choose target</option>
          {tags.filter((tag) => stringValue(tag, "tag_id") !== source).map((tag) => <option key={stringValue(tag, "tag_id")} value={stringValue(tag, "tag_id")}>{stringValue(tag, "name")}</option>)}
        </SelectField>
      </div>
      <Button variant="destructive" disabled={!source || !target || source === target} onClick={() => setConfirm(true)}>Merge source into target</Button>
      {mutation.isError ? <Alert tone="danger">The merge was rejected. No local relationship rewrite is performed.</Alert> : null}
      <Modal
        open={confirm}
        title="Merge tags?"
        description="This can change Post relationships and remove the source tag. The server reauthorizes and validates the same-site merge."
        onClose={() => setConfirm(false)}
        footer={<><Button onClick={() => setConfirm(false)}>Cancel</Button><Button variant="destructive" loading={mutation.isPending} onClick={() => void mutation.mutateAsync({ path: { site_key: siteKey, tag_id: source }, body: { target_tag_id: target } }).then(() => { setConfirm(false); setSource(""); setTarget(""); onComplete(); })}>Merge tags</Button></>}
      >
        <Alert tone="warning">The browser does not infer deletion impact. Server acceptance is required.</Alert>
      </Modal>
    </FormSection>
  );
}

export function MediaReplacePanel({ siteKey, mediaId, onComplete }: { siteKey: string; mediaId: string; onComplete(): void }) {
  const permissions = useEffectivePermissions();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const mutation = useAdminMutation<UnknownRecord>("API15-S-064");
  if (!permissions.includes("media.replace")) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    await mutation.mutateAsync({ path: { site_key: siteKey, media_id: mediaId }, body: { file, title: title || undefined, alt_text: alt || undefined } });
    setOpen(false); setFile(undefined); setTitle(""); setAlt(""); onComplete();
  }

  return <>
    <Button onClick={() => setOpen(true)}>Replace file</Button>
    <Modal open={open} title="Replace media file" description="Replacement preserves the same site-owned Media identity while the server controls validation, derivatives, usages and CDN effects." onClose={() => setOpen(false)} footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button form="bp-media-replace" type="submit" variant="primary" loading={mutation.isPending} disabled={!file}>Replace</Button></>}>
      <form id="bp-media-replace" className="bp-form-stack" onSubmit={submit}>
        <TextField label="Replacement file" type="file" onChange={(event) => setFile(event.target.files?.[0])} required />
        <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <TextField label="Alt text" value={alt} onChange={(event) => setAlt(event.target.value)} />
        {mutation.isError ? <Alert tone="danger">Replacement was rejected; the current asset remains authoritative.</Alert> : null}
      </form>
    </Modal>
  </>;
}

type CalendarBulkMode = "CATEGORY" | "TAG" | "AUTHOR" | "PUBLISH" | "ARCHIVE" | "TRASH";

function calendarPermissions(mode: CalendarBulkMode): string[] {
  const shared = ["calendar.view", "posts.view", "posts.edit"];
  if (mode === "CATEGORY") return [...shared, "categories.view"];
  if (mode === "TAG") return [...shared, "tags.view"];
  if (mode === "AUTHOR") return [...shared, "authors.view"];
  if (mode === "PUBLISH") return [...shared, "posts.publish"];
  if (mode === "ARCHIVE") return [...shared, "posts.archive"];
  return [...shared, "posts.trash"];
}

export function CalendarOperationsPanel({ siteKey, items, onComplete }: { siteKey: string; items: UnknownRecord[]; onComplete(): void }) {
  const permissions = useEffectivePermissions();
  const transport = useAdminTransport();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<CalendarBulkMode>("PUBLISH");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [outcomes, setOutcomes] = useState<Array<{ post_id: string; status: string; error_code?: string }>>([]);
  const [details, setDetails] = useState<Record<string, UnknownRecord>>({});

  const signature = items.map((item) => stringValue(item, "post_id", "")).join("|");
  useEffect(() => {
    let active = true;
    setSelected(new Set());
    setDetails({});
    if (!items.length || !permissions.includes("posts.view")) return () => { active = false; };
    void Promise.all(items.map(async (item) => {
      const postId = stringValue(item, "post_id", "");
      try {
        const response = await transport.request<UnknownRecord>("API15-S-012", { path: { site_key: siteKey, post_id: postId } });
        const data = await requireSuccess(response);
        return [postId, asRecord(asRecord(data).post)] as const;
      } catch {
        return [postId, {}] as const;
      }
    })).then((pairs) => { if (active) setDetails(Object.fromEntries(pairs)); });
    return () => { active = false; };
  }, [siteKey, signature, permissions.includes("posts.view")]);

  const availableModes = useMemo(() => (["CATEGORY", "TAG", "AUTHOR", "PUBLISH", "ARCHIVE", "TRASH"] as CalendarBulkMode[]).filter((candidate) => calendarPermissions(candidate).every((permission) => permissions.includes(permission))), [permissions.join("|")]);
  useEffect(() => { if (availableModes.length && !availableModes.includes(mode)) setMode(availableModes[0]!); }, [availableModes.join("|"), mode]);

  async function loadTargets() {
    const ids = [...selected];
    const targets: Array<{ post_id: string; expected_version: number; post: UnknownRecord }> = [];
    for (const postId of ids) {
      const response = await transport.request<UnknownRecord>("API15-S-012", { path: { site_key: siteKey, post_id: postId } });
      const data = await requireSuccess(response);
      const post = asRecord(asRecord(data).post);
      targets.push({ post_id: postId, expected_version: Number(post.version), post });
    }
    return targets;
  }

  async function applyBulk() {
    if (!selected.size) return;
    setBusy(true); setError(undefined); setOutcomes([]);
    try {
      const targets = await loadTargets();
      if (mode === "PUBLISH" || mode === "ARCHIVE" || mode === "TRASH") {
        const response = await transport.request<UnknownRecord>("API15-S-025", withMutationHeaders({ path: { site_key: siteKey }, body: { action: mode, targets: targets.map(({ post_id, expected_version }) => ({ post_id, expected_version })) } }));
        const data = await requireSuccess(response);
        const serverOutcomes = Array.isArray(asRecord(data).outcomes) ? asRecord(data).outcomes as UnknownRecord[] : [];
        setOutcomes(serverOutcomes.map((row) => ({
          post_id: stringValue(row, "post_id"),
          status: stringValue(row, "status"),
          ...(typeof row.error_code === "string" ? { error_code: row.error_code } : {}),
        })));
      } else {
        const ids = value.split(",").map((entry) => entry.trim()).filter(Boolean);
        if ((mode === "CATEGORY" || mode === "TAG") && !ids.length) throw new Error("Enter at least one same-site ID.");
        if (mode === "AUTHOR" && ids.length !== 1) throw new Error("Enter exactly one Author Site Profile ID.");
        const localOutcomes: Array<{ post_id: string; status: string; error_code?: string }> = [];
        for (const target of targets) {
          try {
            const body: UnknownRecord = { expected_version: target.expected_version };
            if (mode === "CATEGORY") body.category_ids = ids;
            if (mode === "TAG") body.tag_ids = ids;
            if (mode === "AUTHOR") body.author_site_profile_id = ids[0];
            const response = await transport.request<UnknownRecord>("API15-S-013", withMutationHeaders({ path: { site_key: siteKey, post_id: target.post_id }, body }));
            await requireSuccess(response);
            localOutcomes.push({ post_id: target.post_id, status: "SUCCESS" });
          } catch (cause) {
            localOutcomes.push({ post_id: target.post_id, status: "CONFLICT", error_code: cause instanceof Error ? cause.message : "UPDATE_REJECTED" });
          }
        }
        setOutcomes(localOutcomes);
      }
      setSelected(new Set()); onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The calendar bulk action was rejected.");
    } finally { setBusy(false); }
  }

  if (!availableModes.length) return <Alert tone="info">Calendar bulk mutation controls are hidden because the current validated SiteContext does not contain a complete required permission composite.</Alert>;

  return (
    <FormSection title="Bulk selection and actions" description="The current target set is reloaded immediately before mutation so expected_version values are not guessed. SITE/GLOBAL authority is never inferred from the selection.">
      <div className="bp-selection-list" role="group" aria-label="Select calendar posts">
        {items.map((item) => {
          const postId = stringValue(item, "post_id", "");
          const detail = details[postId] ?? {};
          const local = stringValue(detail, "schedule_local_input", "");
          const tz = stringValue(detail, "schedule_timezone_id", "");
          return <Checkbox key={postId} label={`${stringValue(item, "title", "Untitled")} — ${stringValue(item, "status", "DRAFT")}${local && local !== "—" ? ` — ${local}${tz && tz !== "—" ? ` ${tz}` : ""}` : ""}`} checked={selected.has(postId)} onChange={(event) => setSelected((current) => { const next = new Set(current); event.target.checked ? next.add(postId) : next.delete(postId); return next; })} />;
        })}
      </div>
      <SelectField label="Bulk action" value={mode} onChange={(event) => { setMode(event.target.value as CalendarBulkMode); setValue(""); }}>
        {availableModes.map((candidate) => <option key={candidate} value={candidate}>{candidate === "CATEGORY" ? "Assign categories" : candidate === "TAG" ? "Assign tags" : candidate === "AUTHOR" ? "Assign author" : candidate}</option>)}
      </SelectField>
      {mode === "CATEGORY" ? <TextField label="Category IDs" value={value} onChange={(event) => setValue(event.target.value)} hint="Comma-separated same-site Category IDs." /> : null}
      {mode === "TAG" ? <TextField label="Tag IDs" value={value} onChange={(event) => setValue(event.target.value)} hint="Comma-separated same-site Tag IDs." /> : null}
      {mode === "AUTHOR" ? <TextField label="Author Site Profile ID" value={value} onChange={(event) => setValue(event.target.value)} /> : null}
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <Button variant="primary" loading={busy} disabled={!selected.size} onClick={() => void applyBulk()}>Apply to {selected.size} selected</Button>
      {outcomes.length ? <DataTable caption="Calendar bulk outcomes" rows={outcomes} rowKey={(row) => row.post_id} columns={[
        { key: "post", header: "Post", cell: (row) => <Link to={sitePath(siteKey, `/posts/${row.post_id}`)}>{row.post_id}</Link> },
        { key: "status", header: "Outcome", cell: (row) => <StatusBadge value={row.status} /> },
        { key: "error", header: "Detail", cell: (row) => row.error_code ?? "—" },
      ]} /> : null}
    </FormSection>
  );
}
