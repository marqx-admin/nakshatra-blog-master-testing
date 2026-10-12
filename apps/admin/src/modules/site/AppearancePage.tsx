import { useEffect, useState, type FormEvent } from "react";
import type { components } from "@bp/api-contract";
import { useAdminContext, useEffectivePermissions } from "../../app/site-context/AdminContext";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { PageFrame } from "../PageFrame";
import { QueryState } from "../QueryStates";
import { Alert, Button, FormSection, SuccessState } from "../../ui/components";
import { MediaPicker } from "./EditorAssist";
import { AppearanceControls, InformationPagesEditor, StyleChooser, appearanceValidation } from "../appearance/AppearanceControls";
import { startingPages, startingPresentation, type PresentationConfig, type StaticPages } from "../appearance/appearance-model";

type SettingsResponse = components["schemas"]["SiteSettingsResponse"];

export function AppearancePage() {
  const site = useAdminContext().site!;
  const permissions = useEffectivePermissions();
  const editable = permissions.includes("site_settings.edit");
  const dirty = useDirtyState();
  const query = useAdminQuery<SettingsResponse>("API15-S-096", { path: { site_key: site.site_key } }, permissions.includes("site_settings.view"));
  const save = useAdminMutation<SettingsResponse>("API15-S-097", { invalidate: ["API15-S-096"] });
  const [config, setConfig] = useState<PresentationConfig>(() => startingPresentation("CUSTOM"));
  const [pages, setPages] = useState<StaticPages>(startingPages);
  const [locale, setLocale] = useState("en");
  const [logoMediaId, setLogoMediaId] = useState("");
  const [logoTouched, setLogoTouched] = useState(false);
  const [configTouched, setConfigTouched] = useState(false);
  const [pagesTouched, setPagesTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    if (!query.data) return;
    const settings = Object.fromEntries(query.data.settings.map(entry => [entry.key, entry.value]));
    setConfig(settings.presentation_config && typeof settings.presentation_config === "object" ? settings.presentation_config as PresentationConfig : startingPresentation("CUSTOM"));
    setPages(settings.static_pages && typeof settings.static_pages === "object" ? settings.static_pages as StaticPages : startingPages());
    setLocale(typeof settings.locale_code === "string" ? settings.locale_code : typeof settings.default_language_code === "string" ? settings.default_language_code : "en");
    setLogoMediaId(typeof settings.logo_media_id === "string" ? settings.logo_media_id : "");
    setLogoTouched(false);
    setConfigTouched(false);
    setPagesTouched(false);
    dirty.setDirty(false);
  }, [query.data]);
  function changeConfig(value: PresentationConfig) { setConfig(value); setConfigTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Appearance changes"); }
  function changePages(value: StaticPages) { setPages(value); setPagesTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Information page changes"); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const validation = appearanceValidation(config, pages, locale);
    setErrors(validation);
    if (validation.length) return;
    if (!configTouched && !pagesTouched && !logoTouched) return;
    try {
      await save.mutateAsync({ path: { site_key: site.site_key }, body: { settings: [
        ...(configTouched ? [{ key: "presentation_config" as const, value: config }] : []),
        ...(pagesTouched ? [{ key: "static_pages" as const, value: pages }] : []),
        ...(logoTouched ? [{ key: "logo_media_id" as const, value: logoMediaId }] : []),
      ] satisfies components["schemas"]["SiteSettingsInput"]["settings"] } });
      setConfigTouched(false); setPagesTouched(false); setLogoTouched(false);
      dirty.setDirty(false);
    } catch { /* Server validation and authorization remain authoritative. */ }
  }
  return <PageFrame pageId="ADM-S-APP-01" context={`${site.display_name} · controlled website presentation`}><QueryState isLoading={query.isLoading} error={query.error} hasData={Boolean(query.data)} retry={() => void query.refetch()}>
    <form className="bp-form" onSubmit={event => void submit(event)}>
      <FormSection title="Temporary website" description="This testing destination comes from the current site's server-validated context.">
        {site.temporary_site_url ? <><p>Server-provided URL: <strong>{site.temporary_site_url}</strong></p>{site.lifecycle_state === "ACTIVE" ? <a className="bp-button bp-button--secondary" href={site.temporary_site_url} target="_blank" rel="noreferrer">Open Temporary Website</a> : null}<p>{site.lifecycle_state === "DISABLED" ? "This website is disabled and remains unavailable to public visitors until authorized activation." : site.lifecycle_state === "ACTIVE" ? "Public temporary-site testing follows the backend noindex and crawler policy." : "This website is not publicly available in its current lifecycle state."}</p></> : <p>No active temporary website destination is registered for this site.</p>}
      </FormSection>
      <StyleChooser value={config} name={site.display_name} locale={locale} showSelectedPreview={false} onChange={changeConfig} disabled={!editable}/>
      <FormSection title="Branding" description="The site name is managed in Site Settings. The logo remains a same-site media selection.">{permissions.includes("media.view") ? <MediaPicker siteKey={site.site_key} value={logoMediaId} onSelect={id => { setLogoMediaId(id); setLogoTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Logo change"); }} label="Website logo" disabled={!editable}/> : <p>Logo selection requires media access.</p>}</FormSection>
      <AppearanceControls config={config} name={site.display_name} onChange={changeConfig} locale={locale} disabled={!editable}/>
      <InformationPagesEditor pages={pages} onChange={changePages} disabled={!editable}/>
      {errors.length ? <Alert tone="danger" title="Appearance cannot be saved"><ul>{errors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul></Alert> : null}
      {save.isError ? <Alert tone="danger" title="Save failed">The server did not accept these settings. {save.error instanceof Error ? save.error.message : ""}</Alert> : null}
      {save.isSuccess ? <SuccessState>Appearance and information pages saved.</SuccessState> : null}
      {editable ? <Button variant="primary" type="submit" loading={save.isPending}>Save Appearance</Button> : null}
    </form>
  </QueryState></PageFrame>;
}
