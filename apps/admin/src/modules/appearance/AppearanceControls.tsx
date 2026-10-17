import { useState } from "react";
import { contentLabels, informationStarter } from "./website-content";
import { READY_STYLES, SAFE_DEFAULT, APPEARANCE_IDS, appearanceConfig, customAppearanceConfig, type AppearanceId } from "@bp/presentation-catalogue";
import { Checkbox, FormSection, SelectField, TextArea, TextField } from "../../ui/components";
import {
  PAGE_KEYS, PAGE_NAMES, STYLE_IDS, informationPageHasContent, informationPageState, pagesErrors, presentationErrors,
  startingPresentation,
  preserveAppearanceContent,
  type InformationPage, type PresentationConfig, type StaticPages, type StyleId,
} from "./appearance-model";
import { AppearancePreview } from "./RepresentativeWebsitePreview";
export { AppearancePreview } from "./RepresentativeWebsitePreview";

type Change = (value: PresentationConfig) => void;

export function StyleChooser({ value, onChange, name = "Your publication", locale = "en", showSelectedPreview = true, disabled = false, modernRecipes = false }: { value: PresentationConfig; onChange: Change; name?: string; locale?: string; showSelectedPreview?: boolean; disabled?: boolean; modernRecipes?: boolean }) {
  const styleOptions: Array<{ id: StyleId | "CUSTOM"; name: string; description: string }> = [
    ...(modernRecipes ? [{ id: "STANDARD" as const, name: "Standard — Sage Editorial", description: "The approved Standard website appearance" }] : []),
    ...STYLE_IDS.map(id => ({ id, name: READY_STYLES[id]!.name, description: "A curated website starting point" })),
    { id: "CUSTOM", name: "Start Custom", description: "A complete accessible starting design you can personalize" },
  ];
  const candidate = (id: StyleId | "CUSTOM") => modernRecipes ? id === "CUSTOM" ? customAppearanceConfig("STANDARD", locale) : appearanceConfig(id, locale) : startingPresentation(id);
  return <FormSection title="Website style" description="Choose a complete website look. Refinements are optional.">
    <div className="bp-appearance-style-grid" role="group" aria-label="Website style">
      {styleOptions.map(option => {
        return <div key={option.id} className="bp-appearance-style" data-selected={value.style_id === option.id}>
          <AppearancePreview compact config={candidate(option.id)} name={name} locale={locale}/>
          <button type="button" className="bp-appearance-style-action" aria-pressed={value.style_id === option.id} disabled={disabled} onClick={() => onChange(preserveAppearanceContent(candidate(option.id), value))}><strong>{option.name}</strong><small>{option.description}</small></button>
        </div>;
      })}
    </div>
    {modernRecipes && value.recipe_version !== 2 ? <p>The saved legacy recipe remains unchanged until you select a new appearance.</p> : null}
    {modernRecipes && value.style_id === "CUSTOM" ? <SelectField label="Custom base appearance" value={value.base_style_id ?? "STANDARD"} disabled={disabled} onChange={event => onChange(preserveAppearanceContent(customAppearanceConfig(event.target.value as AppearanceId, locale), value))}>
      {APPEARANCE_IDS.map(id => <option value={id} key={id}>{id === "STANDARD" ? "Standard — Sage Editorial" : READY_STYLES[id]!.name}</option>)}
    </SelectField> : null}
    {showSelectedPreview ? <div className="bp-appearance-selected-preview"><h3>Your selected website look</h3><AppearancePreview config={value} name={name} locale={locale}/></div> : null}
  </FormSection>;
}

export { AppearanceControls } from "./VisualAppearanceControls";

function splitLines(value: string): string[] { return value.split("\n").map(part => part.trim()).filter(Boolean); }
export function InformationPagesEditor({ pages, onChange, disabled = false, locale = "en", savedPages, onSavePage }: { pages: StaticPages; onChange(value: StaticPages): void; disabled?: boolean; locale?: string; savedPages?: StaticPages; onSavePage?(key: keyof StaticPages): void }) {
  const [active, setActive] = useState<keyof StaticPages>("ABOUT");
  const page = pages[active];
  const labels = contentLabels(locale);
  const update = (part: Partial<InformationPage>) => onChange({ ...pages, [active]: { ...page, ...part } });
  const setSection = (index: number, part: Partial<InformationPage["body_sections"][number]>) => update({ body_sections: page.body_sections.map((section, i) => i === index ? { ...section, ...part } : section) });
  return <FormSection title="Information pages" description="Exactly five fixed pages. Add approved content, then enable each page when it is ready."><div className="bp-appearance-page-tabs" role="group" aria-label="Information page">{PAGE_KEYS.map(key => <button type="button" key={key} aria-pressed={active === key} onClick={() => setActive(key)}>{PAGE_NAMES[key]}<small>{informationPageState(pages[key])}</small></button>)}</div>
    <p className="bp-appearance-page-status" role="status">{PAGE_NAMES[active]}: <strong>{informationPageState(page)}</strong></p>{["PRIVACY", "TERMS", "DISCLAIMER"].includes(active) ? <p>Use owner-approved legal content before enabling this page. No legal text is generated automatically.</p> : null}
    <p>Content version: {page.content_version}. Starter templates are disabled drafts. Replace placeholders and review legal wording before explicitly enabling.</p>
    <Checkbox label="Owner-reviewed and publicly enabled" checked={page.enabled} disabled={disabled || (!page.enabled && !informationPageHasContent(page))} onChange={event => update({ enabled: event.target.checked })}/><TextField label={labels.title} value={page.title} disabled={disabled} onChange={event => update({ title: event.target.value })}/><TextArea label={labels.intro} value={page.intro_text} disabled={disabled} onChange={event => update({ intro_text: event.target.value })}/>
    {!disabled && !page.enabled && !page.intro_text.trim() && !page.body_sections.length ? <button type="button" onClick={() => update({ ...informationStarter(active, locale), content_version: page.content_version })}>{labels.starter}</button> : null}
    {savedPages ? <button type="button" disabled={disabled} onClick={() => onChange({ ...pages, [active]: structuredClone(savedPages[active]) })}>{labels.restore}</button> : null}
    {page.body_sections.map((section, index) => <div className="bp-appearance-section" key={index}><TextField label={`Section ${index + 1} heading`} value={section.heading ?? ""} disabled={disabled} onChange={event => setSection(index, { heading: event.target.value })}/><TextArea label="Paragraphs (one per line)" value={section.paragraphs.join("\n")} disabled={disabled} onChange={event => setSection(index, { paragraphs: splitLines(event.target.value) })}/><TextArea label="List items (one per line)" value={section.list_items.join("\n")} disabled={disabled} onChange={event => setSection(index, { list_items: splitLines(event.target.value) })}/>{!disabled ? <button type="button" onClick={() => update({ body_sections: page.body_sections.filter((_, i) => i !== index) })}>Remove section</button> : null}</div>)}
    {!disabled ? <button type="button" onClick={() => update({ body_sections: [...page.body_sections, { heading: "", paragraphs: [], list_items: [] }] })}>Add section</button> : null}
    {page.body_sections.length > 1 ? <div>{page.body_sections.map((_, index) => <span key={index}>{[-1, 1].map(delta => <button key={delta} type="button" disabled={disabled || index + delta < 0 || index + delta >= page.body_sections.length} onClick={() => { const sections = [...page.body_sections]; [sections[index], sections[index + delta]] = [sections[index + delta]!, sections[index]!]; update({ body_sections: sections }); }}>Section {index + 1}: {delta < 0 ? "Move up" : "Move down"}</button>)}</span>)}</div> : null}
    {onSavePage ? <button type="button" disabled={disabled} onClick={() => onSavePage(active)}>{labels.save}</button> : null}
  </FormSection>;
}

export function appearanceValidation(config: PresentationConfig, pages: StaticPages, locale: string): string[] {
  return [...presentationErrors(config, locale), ...pagesErrors(pages)];
}

export const DEFAULT_PREVIEW_CONFIG = startingPresentation("CUSTOM");
export const DEFAULT_PREVIEW_SELECTION = SAFE_DEFAULT;
