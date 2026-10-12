import { useState } from "react";
import { READY_STYLES, SAFE_DEFAULT } from "@bp/presentation-catalogue";
import { Checkbox, FormSection, TextArea, TextField } from "../../ui/components";
import {
  PAGE_KEYS, PAGE_NAMES, STYLE_IDS, informationPageHasContent, informationPageState, pagesErrors, presentationErrors,
  startingPresentation,
  type InformationPage, type PresentationConfig, type StaticPages, type StyleId,
} from "./appearance-model";
import { AppearancePreview } from "./RepresentativeWebsitePreview";
export { AppearancePreview } from "./RepresentativeWebsitePreview";

type Change = (value: PresentationConfig) => void;

export function StyleChooser({ value, onChange, name = "Your publication", locale = "en", showSelectedPreview = true, disabled = false }: { value: PresentationConfig; onChange: Change; name?: string; locale?: string; showSelectedPreview?: boolean; disabled?: boolean }) {
  const styleOptions: Array<{ id: StyleId | "CUSTOM"; name: string; description: string }> = [
    ...STYLE_IDS.map(id => ({ id, name: READY_STYLES[id]!.name, description: "A curated website starting point" })),
    { id: "CUSTOM", name: "Start Custom", description: "A complete accessible starting design you can personalize" },
  ];
  return <FormSection title="Website style" description="Choose a complete website look. Refinements are optional.">
    <div className="bp-appearance-style-grid" role="group" aria-label="Website style">
      {styleOptions.map(option => {
        return <div key={option.id} className="bp-appearance-style" data-selected={value.style_id === option.id}>
          <AppearancePreview compact config={startingPresentation(option.id)} name={name} locale={locale}/>
          <button type="button" className="bp-appearance-style-action" aria-pressed={value.style_id === option.id} disabled={disabled} onClick={() => onChange(startingPresentation(option.id))}><strong>{option.name}</strong><small>{option.description}</small></button>
        </div>;
      })}
    </div>
    {showSelectedPreview ? <div className="bp-appearance-selected-preview"><h3>Your selected website look</h3><AppearancePreview config={value} name={name} locale={locale}/></div> : null}
  </FormSection>;
}

export { AppearanceControls } from "./VisualAppearanceControls";

function splitLines(value: string): string[] { return value.split("\n").map(part => part.trim()).filter(Boolean); }
export function InformationPagesEditor({ pages, onChange, disabled = false }: { pages: StaticPages; onChange(value: StaticPages): void; disabled?: boolean }) {
  const [active, setActive] = useState<keyof StaticPages>("ABOUT");
  const page = pages[active];
  const update = (part: Partial<InformationPage>) => onChange({ ...pages, [active]: { ...page, ...part } });
  const setSection = (index: number, part: Partial<InformationPage["body_sections"][number]>) => update({ body_sections: page.body_sections.map((section, i) => i === index ? { ...section, ...part } : section) });
  return <FormSection title="Information pages" description="Exactly five fixed pages. Add approved content, then enable each page when it is ready."><div className="bp-appearance-page-tabs" role="group" aria-label="Information page">{PAGE_KEYS.map(key => <button type="button" key={key} aria-pressed={active === key} onClick={() => setActive(key)}>{PAGE_NAMES[key]}<small>{informationPageState(pages[key])}</small></button>)}</div>
    <p className="bp-appearance-page-status" role="status">{PAGE_NAMES[active]}: <strong>{informationPageState(page)}</strong></p>{["PRIVACY", "TERMS", "DISCLAIMER"].includes(active) ? <p>Use owner-approved legal content before enabling this page. No legal text is generated automatically.</p> : null}
    <Checkbox label="Publish this page when it has content" checked={page.enabled} disabled={disabled || (!page.enabled && !informationPageHasContent(page))} onChange={event => update({ enabled: event.target.checked })}/><TextField label="Page title" value={page.title} disabled={disabled} onChange={event => update({ title: event.target.value })}/><TextArea label="Introduction" value={page.intro_text} disabled={disabled} onChange={event => update({ intro_text: event.target.value })}/>
    {page.body_sections.map((section, index) => <div className="bp-appearance-section" key={index}><TextField label={`Section ${index + 1} heading`} value={section.heading ?? ""} disabled={disabled} onChange={event => setSection(index, { heading: event.target.value })}/><TextArea label="Paragraphs (one per line)" value={section.paragraphs.join("\n")} disabled={disabled} onChange={event => setSection(index, { paragraphs: splitLines(event.target.value) })}/><TextArea label="List items (one per line)" value={section.list_items.join("\n")} disabled={disabled} onChange={event => setSection(index, { list_items: splitLines(event.target.value) })}/>{!disabled ? <button type="button" onClick={() => update({ body_sections: page.body_sections.filter((_, i) => i !== index) })}>Remove section</button> : null}</div>)}
    {!disabled ? <button type="button" onClick={() => update({ body_sections: [...page.body_sections, { heading: "", paragraphs: [], list_items: [] }] })}>Add section</button> : null}
  </FormSection>;
}

export function appearanceValidation(config: PresentationConfig, pages: StaticPages, locale: string): string[] {
  return [...presentationErrors(config, locale), ...pagesErrors(pages)];
}

export const DEFAULT_PREVIEW_CONFIG = startingPresentation("CUSTOM");
export const DEFAULT_PREVIEW_SELECTION = SAFE_DEFAULT;
