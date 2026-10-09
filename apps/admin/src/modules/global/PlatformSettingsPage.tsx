import { useEffect, useState, type FormEvent } from "react";
import type { components } from "@bp/api-contract";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { useEffectivePermissions } from "../../app/site-context/AdminContext";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { PageFrame } from "../PageFrame";
import { QueryState } from "../QueryStates";
import { Alert, Button, Checkbox, EmptyState, FormSection, SuccessState, TextField } from "../../ui/components";

type Setting = components["schemas"]["SettingEntry"];
type Response = components["schemas"]["PlatformSettingsResponse"];
type Scalar = string | number | boolean | null;

function ScalarControl({ label, value, disabled, onChange }: { label: string; value: Scalar; disabled: boolean; onChange(value: Scalar): void }) {
  if (typeof value === "boolean") return <Checkbox label={label} checked={value} disabled={disabled} onChange={event => onChange(event.target.checked)}/>;
  if (typeof value === "number") return <TextField label={label} type="number" value={String(value)} disabled={disabled} onChange={event => { const next = Number(event.target.value); if (Number.isFinite(next)) onChange(next); }}/>;
  if (typeof value === "string") return <TextField label={label} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}/>;
  return <p>{label}: no value configured.</p>;
}

export function PlatformSettingsPage() {
  const permissions = useEffectivePermissions();
  const editable = permissions.includes("platform_settings.edit");
  const dirty = useDirtyState();
  const query = useAdminQuery<Response>("API15-G-060", {});
  const save = useAdminMutation<Response>("API15-G-061", { invalidate: ["API15-G-060"] });
  const [settings, setSettings] = useState<Setting[]>([]);
  const [changed, setChanged] = useState<string[]>([]);
  useEffect(() => { if (query.data) { setSettings(query.data.settings); setChanged([]); dirty.setDirty(false); } }, [query.data]);
  function change(key: string, value: Setting["value"]) {
    setSettings(current => current.map(setting => setting.key === key ? { ...setting, value } : setting));
    setChanged(current => current.includes(key) ? current : [...current, key]);
    dirty.setDirty(true); dirty.setDirtyLabel("platform settings changes");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!changed.length) return;
    try { await save.mutateAsync({ body: { settings: settings.filter(setting => changed.includes(setting.key)) } satisfies components["schemas"]["PlatformSettingsInput"] }); dirty.setDirty(false); setChanged([]); }
    catch { /* The server remains the validation and authorization boundary. */ }
  }
  return <PageFrame pageId="ADM-G-PLAT-01" context="Platform-wide values returned by the server"><QueryState isLoading={query.isLoading} error={query.error} hasData={Boolean(query.data)} retry={() => void query.refetch()}>
    {settings.length === 0 ? <EmptyState title="No platform settings configured" description="There are no editable platform-wide values yet."/> : <form onSubmit={event => void submit(event)}><FormSection title="Platform settings">{settings.map(setting => {
      const label = setting.key.replaceAll("_", " ");
      const value = setting.value;
      if (Array.isArray(value)) return <fieldset key={setting.key} className="bp-field"><legend>{label}</legend>{value.map((item, index) => <ScalarControl key={index} label={`${label} ${index + 1}`} value={item} disabled={!editable} onChange={next => change(setting.key, value.map((entry, i) => i === index ? next : entry))}/>)}</fieldset>;
      if (value && typeof value === "object") return <fieldset key={setting.key} className="bp-field"><legend>{label}</legend>{Object.entries(value).map(([member, entry]) => Array.isArray(entry) ? <fieldset key={member} className="bp-field"><legend>{member.replaceAll("_", " ")}</legend>{entry.map((item, index) => <ScalarControl key={index} label={`${member.replaceAll("_", " ")} ${index + 1}`} value={item} disabled={!editable} onChange={next => change(setting.key, { ...value, [member]: entry.map((part, i) => i === index ? next : part) })}/>)}</fieldset> : <ScalarControl key={member} label={member.replaceAll("_", " ")} value={entry} disabled={!editable} onChange={next => change(setting.key, { ...value, [member]: next })}/>)}</fieldset>;
      return <ScalarControl key={setting.key} label={label} value={value} disabled={!editable} onChange={next => change(setting.key, next)}/>;
    })}{save.isError ? <Alert tone="danger">The server did not accept these platform settings.</Alert> : null}{save.isSuccess ? <SuccessState>Platform settings saved.</SuccessState> : null}{editable ? <Button type="submit" variant="primary" loading={save.isPending} disabled={!changed.length}>Save settings</Button> : null}</FormSection></form>}
  </QueryState></PageFrame>;
}
