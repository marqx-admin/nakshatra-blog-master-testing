import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { components } from "@bp/api-contract";
import { appearanceConfig, READY_STYLES } from "@bp/presentation-catalogue";
import { newIdempotencyKey } from "../../app/query-client/adminTransport";
import { hasDraftPlaceholders } from "../appearance/website-content";
import { useAdminMutation } from "../../app/query-client/hooks";
import { useDirtyState } from "../../app/site-context/DirtyStateContext";
import { PageFrame } from "../PageFrame";
import { Alert, Button, Checkbox, FormSection, TextArea, TextField } from "../../ui/components";
import { AppearanceControls, AppearancePreview, InformationPagesEditor, StyleChooser, appearanceValidation } from "../appearance/AppearanceControls";
import { AppearanceSummary } from "../appearance/VisualAppearanceControls";
import { PAGE_KEYS, PAGE_NAMES, informationPageState, startingPages, type StyleId } from "../appearance/appearance-model";

type CreateWebsiteInput = components["schemas"]["CreateWebsiteInput"];
type CreateWebsiteResponse = components["schemas"]["CreateWebsiteResponse"];
const STEPS = ["Identity", "Style", "Customize", "Preview", "Review"] as const;

export function CreateWebsitePage() {
  const dirty = useDirtyState();
  const create = useAdminMutation<CreateWebsiteResponse>("API15-G-011");
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState({ display_name: "", default_language: "en", locale_code: "en", timezone_id: "Asia/Kolkata" });
  const [chosen, setChosen] = useState<StyleId | "CUSTOM">("STANDARD");
  const [presentation, setPresentation] = useState(() => appearanceConfig("STANDARD"));
  const [staticPages, setStaticPages] = useState(startingPages);
  const [validation, setValidation] = useState<string[]>([]);
  const [result, setResult] = useState<CreateWebsiteResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [home, setHome] = useState({ h1: "", intro_text: "" });
  const [confirmed, setConfirmed] = useState(false);
  const requestKey = useRef(newIdempotencyKey());
  const createLock = useRef(false);
  const locale = identity.locale_code || identity.default_language || "en";

  function mark() { setConfirmed(false); dirty.setDirty(true); dirty.setDirtyLabel("Create Website values"); }
  function changeIdentity(key: keyof typeof identity, value: string) { setIdentity(current => ({ ...current, [key]: value })); mark(); }
  function next() {
    const errors: string[] = [];
    if (step === 0 && (!identity.display_name.trim() || /[<>]/.test(identity.display_name) || hasDraftPlaceholders(identity.display_name) || !identity.timezone_id.trim())) errors.push("Enter a resolved website name and valid timezone.");
    if (Object.values(home).some(value => /[<>]/.test(value) || hasDraftPlaceholders(value))) errors.push("Replace homepage placeholders with approved plain text, or leave the optional fields blank.");
    if (step >= 2) errors.push(...appearanceValidation(presentation, staticPages, locale));
    setValidation(errors);
    if (!errors.length) setStep(current => Math.min(current + 1, STEPS.length - 1));
  }
  async function submit() {
    if (createLock.current || submitting || create.isPending || result || step !== 4 || !confirmed) return;
    const errors = appearanceValidation(presentation, staticPages, locale);
    if (Object.values(home).some(value => /[<>]/.test(value) || hasDraftPlaceholders(value))) errors.push("Homepage content needs resolved plain text.");
    setValidation(errors);
    if (errors.length) return;
    const body: CreateWebsiteInput = {
      display_name: identity.display_name.trim(),
      ...(identity.default_language.trim() ? { default_language: identity.default_language.trim() } : {}),
      ...(identity.locale_code.trim() ? { locale_code: identity.locale_code.trim() } : {}),
      timezone_id: identity.timezone_id.trim(), presentation, static_pages: staticPages,
      ...(home.h1.trim() || home.intro_text.trim() ? { homepage: { h1: home.h1.trim(), intro_text: home.intro_text.trim() } } : {}),
    };
    createLock.current = true; setSubmitting(true);
    try {
      const response = await create.mutateAsync({ body, header: { "Idempotency-Key": requestKey.current } });
      setResult(response); dirty.setDirty(false);
    } catch { /* The mutation error is rendered below; no site is assumed to exist. */ }
    finally { createLock.current = false; setSubmitting(false); }
  }

  return <PageFrame pageId="ADM-G-SITE-02" back={<Link to="/global/sites">← Back to Websites</Link>} context="Create one website through the server-owned atomic provisioning operation.">
    {result ? <section className="bp-card" aria-label="Provisioning result"><Alert tone="success" title="Website created">{result.site.display_name} ({result.site.site_key}) is ready for setup in its Website Workspace.</Alert>
      <h2>Provisioning readiness</h2><p>{result.readiness.overall_ready ? "Provisioned. Content Ready and Launch Ready are assessed separately in the Website Workspace." : "Required baseline needs attention."}</p>
      <ul><li>Settings: {result.readiness.settings_ready ? "Ready" : "Needs attention"}</li><li>Navigation: {result.readiness.navigation_ready ? "Ready" : "Needs attention"}</li><li>Homepage: {result.readiness.homepage_ready ? "Ready" : "Needs attention"}</li><li>Temporary domain: {result.readiness.temporary_domain_ready ? "Ready" : "Needs attention"}</li></ul>
      {result.readiness.missing_components.length ? <p>Missing: {result.readiness.missing_components.join(", ")}</p> : null}
      <p>Lifecycle: <strong>{result.site.lifecycle_state}</strong></p><p>Temporary Host supplied by the server: <strong>{result.temporary_hostname}</strong></p>{result.temporary_site_url ? <p>Temporary website URL: <strong>{result.temporary_site_url}</strong></p> : null}<p>{result.site.lifecycle_state === "DISABLED" ? "Public access is disabled until authorized activation. You can configure the website now." : "Public access follows the current lifecycle and domain policy."}</p>
      <div className="bp-form-actions"><Link className="bp-button bp-button--primary" to={`/site/${encodeURIComponent(result.site.site_key)}/dashboard`}>Open Website Workspace</Link><Link className="bp-button bp-button--secondary" to={`/site/${encodeURIComponent(result.site.site_key)}/appearance`}>Configure Appearance</Link>{result.site.lifecycle_state === "ACTIVE" && result.temporary_site_url ? <a className="bp-button bp-button--secondary" href={result.temporary_site_url} target="_blank" rel="noreferrer">Open Temporary Website</a> : null}<Link className="bp-button bp-button--tertiary" to={`/global/sites/${encodeURIComponent(result.site.site_key)}/domains`}>Manage domains</Link></div>
    </section> : <>
      <ol className="bp-website-steps" aria-label="Create Website progress">{STEPS.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined}>{label}</li>)}</ol>
      {step === 0 ? <FormSection title="Website identity"><p>The server allocates the internal UUID and readable site key at confirmation. No technical identifier is required.</p><TextField label="Display name" value={identity.display_name} onChange={event => changeIdentity("display_name", event.target.value)} required/><TextField label="Default language" value={identity.default_language} onChange={event => changeIdentity("default_language", event.target.value)}/><TextField label="Locale" value={identity.locale_code} onChange={event => changeIdentity("locale_code", event.target.value)}/><TextField label="Timezone ID" value={identity.timezone_id} onChange={event => changeIdentity("timezone_id", event.target.value)} required/></FormSection> : null}
      {step === 1 ? <StyleChooser modernRecipes value={presentation} name={identity.display_name} locale={locale} onChange={value => { setPresentation(value); setChosen(value.style_id); mark(); }} /> : null}
      {step === 2 ? <><FormSection title="Homepage introduction" description="Optional approved text. Leave blank to use the website name and an honest empty archive. Logo and favicon can be uploaded in the workspace after creation."><TextField label="Homepage heading" value={home.h1} maxLength={200} onChange={event => {setHome({...home,h1:event.target.value});mark();}}/><TextArea label="Homepage introduction" value={home.intro_text} maxLength={12000} onChange={event => {setHome({...home,intro_text:event.target.value});mark();}}/></FormSection><details><summary>Optional appearance refinements</summary><AppearanceControls config={presentation} name={identity.display_name} onChange={value => { setPresentation(value); mark(); }} locale={locale}/></details><InformationPagesEditor locale={locale} pages={staticPages} onChange={value => { setStaticPages(value); mark(); }}/></> : null}
      {step === 3 ? <><h2>Preview your website</h2><p>This is representative content. No website or temporary domain is created until confirmation.</p><AppearancePreview config={presentation} name={identity.display_name} locale={locale}/><AppearanceSummary config={presentation} locale={locale}/></> : null}
      {step === 4 ? <section className="bp-card"><h2>Confirm website</h2><p><strong>{identity.display_name}</strong> (identity allocated on confirmation)</p><p>Style: {chosen === "CUSTOM" ? "Start Custom" : chosen === "STANDARD" ? "Standard — Sage Editorial" : chosen ? READY_STYLES[chosen]?.name : "Unselected"}</p><AppearanceSummary config={presentation} locale={locale}/><h3>Information pages</h3><ul>{PAGE_KEYS.map(key => <li key={key}>{PAGE_NAMES[key]}: {informationPageState(staticPages[key])}</li>)}</ul><p>The server creates this website as one tenant of the Universal Frontend, including settings, navigation, homepage baseline and temporary Host in one operation. No separate application or deployment is created.</p><p>The server provides the temporary URL after creation. The new site starts DISABLED and remains configurable in its Website Workspace.</p><Checkbox label="I confirm this website identity and saved appearance. Unreviewed information pages remain disabled drafts." checked={confirmed} onChange={event => setConfirmed(event.target.checked)}/></section> : null}
      {validation.length ? <Alert tone="danger" title="Review these settings"><ul>{validation.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}</ul></Alert> : null}
      {create.isError ? <Alert tone="danger" title="Provisioning failed">The server did not confirm a website. Retry unchanged values to recover the same creation result. Changed values conflict if this request already created a site. {create.error instanceof Error ? create.error.message : ""}</Alert> : null}
      <div className="bp-form-actions">{step > 0 ? <Button type="button" onClick={() => { setValidation([]); setStep(current => current - 1); }} disabled={submitting}>Back</Button> : null}{step < STEPS.length - 1 ? <Button type="button" variant="primary" onClick={next}>{step === 2 ? "Keep this look and continue" : "Continue"}</Button> : <Button type="button" variant="primary" onClick={() => void submit()} loading={submitting || create.isPending} disabled={!confirmed}>Confirm and create website</Button>}</div>
    </>}
  </PageFrame>;
}
