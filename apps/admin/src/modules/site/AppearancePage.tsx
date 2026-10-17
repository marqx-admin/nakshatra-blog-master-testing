import { useEffect, useRef, useState, type FormEvent } from "react";
import type { components } from "@bp/api-contract";
import { useAdminContext, useEffectivePermissions } from "../../app/site-context/AdminContext";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { PageFrame } from "../PageFrame";
import { WebsiteSetupPanel } from "./WebsiteSetupPanel";
import { QueryState } from "../QueryStates";
import { Alert, Button, FormSection, SuccessState } from "../../ui/components";
import { MediaPicker } from "./EditorAssist";
import { AppearanceControls, InformationPagesEditor, StyleChooser, appearanceValidation } from "../appearance/AppearanceControls";
import { startingPages, startingPresentation, type PresentationConfig, type StaticPages } from "../appearance/appearance-model";
import { changedInformationPages } from "../appearance/website-content";
import { pagesErrors } from "../appearance/appearance-model";

type SettingsResponse = components["schemas"]["SiteSettingsResponse"];

export function AppearancePage() {
  const site = useAdminContext().site!;
  const activeSite = useRef(site.site_key);
  activeSite.current = site.site_key;
  const permissions = useEffectivePermissions();
  const editable = permissions.includes("site_settings.edit");
  const dirty = useDirtyState();
  const query = useAdminQuery<SettingsResponse>("API15-S-096", { path: { site_key: site.site_key } }, permissions.includes("site_settings.view"));
  const save = useAdminMutation<SettingsResponse>("API15-S-097", { invalidate: ["API15-S-096"] });
  const [config, setConfig] = useState<PresentationConfig>(() => startingPresentation("CUSTOM"));
  const [savedConfig, setSavedConfig] = useState<PresentationConfig>(() => startingPresentation("CUSTOM"));
  const [pages, setPages] = useState<StaticPages>(startingPages);
  const [savedPages, setSavedPages] = useState<StaticPages>(startingPages);
  const [editingSite, setEditingSite] = useState("");
  const [locale, setLocale] = useState("en");
  const [logoMediaId, setLogoMediaId] = useState("");
  const [logoTouched, setLogoTouched] = useState(false);
  const [configTouched, setConfigTouched] = useState(false);
  const [pagesTouched, setPagesTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    if (!query.data) return;
    if (dirty.dirty && editingSite === site.site_key) return; // Refetch must not replace unsaved content.
    const settings = Object.fromEntries(query.data.settings.map(entry => [entry.key, entry.value]));
    setConfig(settings.presentation_config && typeof settings.presentation_config === "object" ? settings.presentation_config as PresentationConfig : startingPresentation("CUSTOM"));
    setSavedConfig(settings.presentation_config && typeof settings.presentation_config === "object" ? settings.presentation_config as PresentationConfig : startingPresentation("CUSTOM"));
    const restored = { ...startingPages(), ...(settings.static_pages && typeof settings.static_pages === "object" ? settings.static_pages as StaticPages : {}) };
    setPages(restored); setSavedPages(restored); setEditingSite(site.site_key);
    setLocale(typeof settings.locale_code === "string" ? settings.locale_code : typeof settings.default_language_code === "string" ? settings.default_language_code : "en");
    setLogoMediaId(typeof settings.logo_media_id === "string" ? settings.logo_media_id : "");
    setLogoTouched(false);
    setConfigTouched(false);
    setPagesTouched(false);
    dirty.setDirty(false);
  }, [query.data, site.site_key]);
  function changeConfig(value: PresentationConfig) { setConfig(value); setConfigTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Appearance changes"); }
  function changePages(value: StaticPages) { setPages(value); setPagesTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Information page changes"); }
  async function saveInformationPage(key: keyof StaticPages) {
    if (!editable || editingSite !== site.site_key) return;
    const requestSite = site.site_key;
    const validation = pagesErrors({ ...startingPages(), [key]: pages[key] });
    setErrors(validation);
    if (validation.length) return;
    try {
      const result = await save.mutateAsync({ path: { site_key: site.site_key }, body: { settings: [{ key: "static_pages", value: { [key]: pages[key] } }] } });
      if (activeSite.current !== requestSite) return;
      const entries = Object.fromEntries(result.settings.map(entry => [entry.key, entry.value]));
      const committed = { ...startingPages(), ...entries.static_pages as StaticPages };
      const next = { ...pages, [key]: committed[key] };
      setSavedPages(committed); setPages(next);
      const remaining = Object.keys(changedInformationPages(next, committed)).length > 0;
      setPagesTouched(remaining);
      dirty.setDirty(remaining || configTouched || logoTouched);
    } catch { /* Keep drafts on validation, authorization or transport failure. */ }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editable || editingSite !== site.site_key) return;
    const requestSite = site.site_key;
    const validation = appearanceValidation(config, pages, locale);
    setErrors(validation);
    if (validation.length) return;
    if (!configTouched && !pagesTouched && !logoTouched) return;
    try {
      const result = await save.mutateAsync({ path: { site_key: site.site_key }, body: { settings: [
        ...(configTouched ? [{ key: "presentation_config" as const, value: config }] : []),
        ...(pagesTouched && Object.keys(changedInformationPages(pages, savedPages)).length ? [{ key: "static_pages" as const, value: changedInformationPages(pages, savedPages) }] : []),
        ...(logoTouched ? [{ key: "logo_media_id" as const, value: logoMediaId }] : []),
      ] satisfies components["schemas"]["SiteSettingsInput"]["settings"] } });
      if (activeSite.current !== requestSite) return;
      const stored = result.settings.find(entry => entry.key === "static_pages")?.value;
      const storedConfig = result.settings.find(entry => entry.key === "presentation_config")?.value;
      if (storedConfig && typeof storedConfig === "object") setSavedConfig(storedConfig as PresentationConfig);
      if (stored && typeof stored === "object") setSavedPages({ ...startingPages(), ...stored as StaticPages });
      setConfigTouched(false); setPagesTouched(false); setLogoTouched(false);
      dirty.setDirty(false);
    } catch { /* Server validation and authorization remain authoritative. */ }
  }
  return <PageFrame pageId="ADM-S-APP-01" context={`${site.display_name} · controlled website presentation`}><QueryState isLoading={query.isLoading} error={query.error} hasData={Boolean(query.data)} retry={() => void query.refetch()}>
    <WebsiteSetupPanel/>
    <form className="bp-form" onSubmit={event => void submit(event)}>
      <FormSection title="Temporary website" description="This testing destination comes from the current site's server-validated context.">
        {site.temporary_site_url ? <><p>Server-provided URL: <strong>{site.temporary_site_url}</strong></p>{site.lifecycle_state === "ACTIVE" ? <a className="bp-button bp-button--secondary" href={site.temporary_site_url} target="_blank" rel="noreferrer">Open Temporary Website</a> : null}<p>{site.lifecycle_state === "DISABLED" ? "This website is disabled and remains unavailable to public visitors until authorized activation." : site.lifecycle_state === "ACTIVE" ? "Public temporary-site testing follows the backend noindex and crawler policy." : "This website is not publicly available in its current lifecycle state."}</p></> : <p>No active temporary website destination is registered for this site.</p>}
      </FormSection>
      <StyleChooser modernRecipes value={config} name={site.display_name} locale={locale} showSelectedPreview={false} onChange={changeConfig} disabled={!editable || save.isPending}/>
      <Button type="button" disabled={!editable || save.isPending} onClick={() => changeConfig(structuredClone(savedConfig))}>Restore saved appearance</Button>
      <FormSection title="Branding" description="The site name is managed in Site Settings. The logo remains a same-site media selection.">{permissions.includes("media.view") ? <MediaPicker siteKey={site.site_key} value={logoMediaId} onSelect={id => { setLogoMediaId(id); setLogoTouched(true); dirty.setDirty(true); dirty.setDirtyLabel("Logo change"); }} label="Website logo" disabled={!editable}/> : <p>Logo selection requires media access.</p>}</FormSection>
      <AppearanceControls config={config} name={site.display_name} onChange={changeConfig} locale={locale} disabled={!editable}/>
      <InformationPagesEditor pages={pages} savedPages={savedPages} onChange={changePages} onSavePage={key => void saveInformationPage(key)} locale={locale} disabled={!editable || save.isPending}/>
      {errors.length ? <Alert tone="danger" title="Appearance cannot be saved"><ul>{errors.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul></Alert> : null}
      {save.isError ? <Alert tone="danger" title="Save failed">The server did not accept these settings. {save.error instanceof Error ? save.error.message : ""}</Alert> : null}
      {save.isSuccess ? <SuccessState>Appearance and information pages saved.</SuccessState> : null}
      {editable ? <Button variant="primary" type="submit" loading={save.isPending}>Save Appearance</Button> : null}
    </form>
  </QueryState></PageFrame>;
}
