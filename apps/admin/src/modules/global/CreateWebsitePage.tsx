import { useState } from "react";
import { Link } from "react-router-dom";
import type { components } from "@bp/api-contract";
import { READY_STYLES } from "@bp/presentation-catalogue";
import { useAdminMutation } from "../../app/query-client/hooks";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { PageFrame } from "../PageFrame";
import { Alert, Button, FormSection, TextField } from "../../ui/components";
import { AppearanceControls, AppearancePreview, InformationPagesEditor, StyleChooser, appearanceValidation } from "../appearance/AppearanceControls";
import { startingPages, startingPresentation, type StyleId } from "../appearance/appearance-model";

type CreateWebsiteInput = components["schemas"]["CreateWebsiteInput"];
type CreateWebsiteResponse = components["schemas"]["CreateWebsiteResponse"];
const STEPS = ["Identity", "Style", "Customize", "Preview", "Review"] as const;

export function CreateWebsitePage() {
  const dirty = useDirtyState();
  const create = useAdminMutation<CreateWebsiteResponse>("API15-G-011");
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState({ site_key: "", display_name: "", default_language: "en", locale_code: "en", timezone_id: "Asia/Kolkata" });
  const [chosen, setChosen] = useState<StyleId | "CUSTOM" | null>(null);
  const [presentation, setPresentation] = useState(() => startingPresentation("CUSTOM"));
  const [staticPages, setStaticPages] = useState(startingPages);
  const [validation, setValidation] = useState<string[]>([]);
  const [result, setResult] = useState<CreateWebsiteResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const locale = identity.locale_code || identity.default_language || "en";

  function mark() { dirty.setDirty(true); dirty.setDirtyLabel("Create Website values"); }
  function changeIdentity(key: keyof typeof identity, value: string) { setIdentity(current => ({ ...current, [key]: value })); mark(); }
  function next() {
    const errors: string[] = [];
    if (step === 0 && (!/^SITE-[0-9]{2,}$/.test(identity.site_key.trim().toUpperCase()) || !identity.display_name.trim() || !identity.timezone_id.trim())) errors.push("Enter a valid site key, display name and timezone.");
    if (step === 1 && !chosen) errors.push("Choose one website style or Start Custom.");
    if (step >= 2) errors.push(...appearanceValidation(presentation, staticPages, locale));
    setValidation(errors);
    if (!errors.length) setStep(current => Math.min(current + 1, STEPS.length - 1));
  }
  async function submit() {
    if (submitting || create.isPending || result) return;
    const errors = appearanceValidation(presentation, staticPages, locale);
    setValidation(errors);
    if (errors.length) return;
    const body: CreateWebsiteInput = {
      site_key: identity.site_key.trim().toUpperCase(), display_name: identity.display_name.trim(),
      ...(identity.default_language.trim() ? { default_language: identity.default_language.trim() } : {}),
      ...(identity.locale_code.trim() ? { locale_code: identity.locale_code.trim() } : {}),
      timezone_id: identity.timezone_id.trim(), presentation, static_pages: staticPages,
    };
    setSubmitting(true);
    try {
      const response = await create.mutateAsync({ body });
      setResult(response); dirty.setDirty(false);
    } catch { /* The mutation error is rendered below; no site is assumed to exist. */ }
    finally { setSubmitting(false); }
  }

  return <PageFrame pageId="ADM-G-SITE-02" back={<Link to="/global/sites">← Back to Websites</Link>} context="Create one website through the server-owned atomic provisioning operation.">
    {result ? <section className="bp-card" aria-label="Provisioning result"><Alert tone="success" title="Website provisioned">The server created {result.site.display_name} as {result.site.lifecycle_state}.</Alert>
      <h2>Readiness</h2><p>{result.readiness.overall_ready ? "Required baseline is ready." : "Required baseline needs attention."}</p>
      <ul><li>Settings: {result.readiness.settings_ready ? "Ready" : "Needs attention"}</li><li>Navigation: {result.readiness.navigation_ready ? "Ready" : "Needs attention"}</li><li>Homepage: {result.readiness.homepage_ready ? "Ready" : "Needs attention"}</li><li>Temporary domain: {result.readiness.temporary_domain_ready ? "Ready" : "Needs attention"}</li></ul>
      {result.readiness.missing_components.length ? <p>Missing: {result.readiness.missing_components.join(", ")}</p> : null}
      <p>Temporary Host supplied by the server: <strong>{result.temporary_hostname}</strong></p><p>A disabled website remains unavailable to public visitors until authorized activation.</p>
      <div className="bp-form-actions"><Link className="bp-button bp-button--primary" to={`/site/${encodeURIComponent(result.site.site_key)}/dashboard`}>Open Website Workspace</Link><a className="bp-button bp-button--secondary" href={`https://${result.temporary_hostname}`} target="_blank" rel="noreferrer">Open Temporary Site</a><Link className="bp-button bp-button--tertiary" to={`/global/sites/${encodeURIComponent(result.site.site_key)}/domains`}>Production domains later</Link></div>
    </section> : <>
      <ol className="bp-website-steps" aria-label="Create Website progress">{STEPS.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined}>{label}</li>)}</ol>
      {step === 0 ? <FormSection title="Website identity"><TextField label="Site key" value={identity.site_key} onChange={event => changeIdentity("site_key", event.target.value)} placeholder="SITE-15" required/><TextField label="Display name" value={identity.display_name} onChange={event => changeIdentity("display_name", event.target.value)} required/><TextField label="Default language" value={identity.default_language} onChange={event => changeIdentity("default_language", event.target.value)}/><TextField label="Locale" value={identity.locale_code} onChange={event => changeIdentity("locale_code", event.target.value)}/><TextField label="Timezone ID" value={identity.timezone_id} onChange={event => changeIdentity("timezone_id", event.target.value)} required/></FormSection> : null}
      {step === 1 ? <StyleChooser value={presentation} onChange={value => { setPresentation(value); setChosen(value.style_id); mark(); }} /> : null}
      {step === 2 ? <><AppearanceControls config={presentation} onChange={value => { setPresentation(value); mark(); }} locale={locale}/><InformationPagesEditor pages={staticPages} onChange={value => { setStaticPages(value); mark(); }}/></> : null}
      {step === 3 ? <><h2>Representative appearance preview</h2><p>This uses sample content and creates no site or domain.</p><AppearancePreview config={presentation} name={identity.display_name} locale={locale}/></> : null}
      {step === 4 ? <section className="bp-card"><h2>Confirm website</h2><p><strong>{identity.display_name}</strong> ({identity.site_key.trim().toUpperCase()})</p><p>Style: {chosen === "CUSTOM" ? "Start Custom" : chosen ? READY_STYLES[chosen]?.name : "Unselected"}</p><p>After confirmation the backend creates the site, settings, navigation, homepage baseline and temporary Host in one operation.</p><AppearancePreview config={presentation} name={identity.display_name} locale={locale}/></section> : null}
      {validation.length ? <Alert tone="danger" title="Review these settings"><ul>{validation.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul></Alert> : null}
      {create.isError ? <Alert tone="danger" title="Provisioning failed">The server did not confirm a website. Review the error and retry safely. {create.error instanceof Error ? create.error.message : ""}</Alert> : null}
      <div className="bp-form-actions">{step > 0 ? <Button type="button" onClick={() => { setValidation([]); setStep(current => current - 1); }} disabled={submitting}>Back</Button> : null}{step < STEPS.length - 1 ? <Button type="button" variant="primary" onClick={next}>Continue</Button> : <Button type="button" variant="primary" onClick={() => void submit()} loading={submitting || create.isPending}>Confirm and create website</Button>}</div>
    </>}
  </PageFrame>;
}
