import { useState, type CSSProperties } from "react";
import {
  READY_STYLES, SAFE_DEFAULT, articleCards, articleLayouts, authorCards, buttons, categoryCards,
  collections, heroes, homepages, images, palettes, typography, WIDTHS, DENSITIES, RADII, BORDERS,
  ELEVATIONS, SPACINGS, HOME_SLOTS, presetColors, resolveDesign, categorySelectable, authorSummarySelectable,
  typographyAvailable, heroLayout, articleCardLayout, type DesignSelection,
} from "@bp/presentation-catalogue";
import { Checkbox, FormSection, SelectField, TextArea, TextField } from "../../ui/components";
import {
  PAGE_KEYS, PAGE_NAMES, STYLE_IDS, pagesErrors, presentationErrors, selectionFrom,
  startingPresentation, withCustomPalette, withSelection,
  type InformationPage, type PresentationConfig, type StaticPages, type StyleId,
} from "./appearance-model";

type Change = (value: PresentationConfig) => void;
type Option = { id: string; name: string };
function optionsFrom<T extends Record<string, { name: string }>>(items: T, eligible: (id: string) => boolean = () => true): Option[] {
  return Object.entries(items).filter(([id]) => eligible(id)).map(([id, item]) => ({ id, name: item.name }));
}
function choices(items: Record<string, string>): Option[] { return Object.entries(items).map(([id, name]) => ({ id, name })); }
function tokenChoices(items: Record<string, unknown>, prefix = ""): Option[] {
  return Object.keys(items).map(id => {
    const name = id.slice(prefix.length).replaceAll("-", " ").toLowerCase();
    return { id, name: name.charAt(0).toUpperCase() + name.slice(1) };
  });
}

export function StyleChooser({ value, onChange, disabled = false }: { value: PresentationConfig; onChange: Change; disabled?: boolean }) {
  const styleOptions: Array<{ id: StyleId | "CUSTOM"; name: string; description: string }> = [
    ...STYLE_IDS.map(id => ({ id, name: READY_STYLES[id]!.name, description: "A curated website starting point" })),
    { id: "CUSTOM", name: "Start Custom", description: "Begin with the platform's accessible default" },
  ];
  return <FormSection title="Website style" description="Choose a starting look. You can refine supported options below.">
    <div className="bp-appearance-style-grid" role="group" aria-label="Website style">
      {styleOptions.map(option => {
        const colors = presetColors(resolveDesign(startingPresentation(option.id)).selection.palette);
        return <button key={option.id} type="button" className="bp-appearance-style" data-selected={value.style_id === option.id} aria-pressed={value.style_id === option.id} disabled={disabled} onClick={() => onChange(startingPresentation(option.id))}>
          <span className="bp-appearance-style-art" style={{ background: colors.background ?? colors.surface, color: colors.text }} aria-hidden="true"><span style={{ background: colors.accent }} /><span /><span /></span>
          <strong>{option.name}</strong><small>{option.description}</small>
        </button>;
      })}
    </div>
  </FormSection>;
}

function OptionField({ label, value, options, onChange, disabled }: { label: string; value: string; options: Option[]; onChange(value: string): void; disabled?: boolean }) {
  return <SelectField label={label} value={value} onChange={event => onChange(event.target.value)} disabled={disabled}>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</SelectField>;
}

const TOKEN_OPTIONS = {
  density: tokenChoices(DENSITIES, "DENSITY-"),
  width: tokenChoices(WIDTHS, "WIDTH-"),
  spacing: tokenChoices(SPACINGS),
  radius: tokenChoices(RADII, "RADIUS-"),
  border: tokenChoices(BORDERS, "BORDER-"),
  elevation: tokenChoices(ELEVATIONS, "ELEVATION-"),
};

export function AppearanceControls({ config, onChange, locale, disabled = false }: { config: PresentationConfig; onChange: Change; locale: string; disabled?: boolean }) {
  const selection = selectionFrom(config, locale);
  const update = <K extends keyof DesignSelection>(key: K, value: DesignSelection[K]) => onChange(withSelection(config, { ...selection, [key]: value }));
  const custom = config.palette?.mode === "CUSTOM";
  const colors = custom && config.palette?.semantic_tokens ? config.palette.semantic_tokens : presetColors(selection.palette);
  const paletteFields = ["surface", "surface_alt", "text", "text_muted", "accent", "accent_text", "border", "focus", "primary", "secondary", "background", "heading"] as const;
  return <div className="bp-appearance-controls">
    <FormSection title="Colors"><Checkbox label="Use custom semantic colors" checked={custom} disabled={disabled} onChange={event => onChange(event.target.checked ? withCustomPalette(config, presetColors(selection.palette)) : { ...config, palette: { mode: "PRESET", preset_id: selection.palette } })}/>
      {custom ? <div className="bp-appearance-color-grid">{paletteFields.map(key => <TextField key={key} label={key.replaceAll("_", " ")} type="color" value={colors[key] ?? colors.surface} disabled={disabled} onChange={event => onChange(withCustomPalette(config, { ...colors, [key]: event.target.value }))}/>)}</div> : <OptionField label="Palette" value={selection.palette} options={optionsFrom(palettes)} disabled={disabled} onChange={value => update("palette", value as DesignSelection["palette"])}/>}</FormSection>
    <FormSection title="Typography"><OptionField label="Typography preset" value={selection.typography} options={optionsFrom(typography, id => typographyAvailable(id, locale))} disabled={disabled} onChange={value => update("typography", value as DesignSelection["typography"])}/></FormSection>
    <FormSection title="Cards and feature"><OptionField label="Article card" value={selection.articleCard} options={optionsFrom(articleCards)} disabled={disabled} onChange={value => update("articleCard", value as DesignSelection["articleCard"])}/><OptionField label="Category card" value={selection.categoryCard} options={optionsFrom(categoryCards, categorySelectable)} disabled={disabled} onChange={value => update("categoryCard", value as DesignSelection["categoryCard"])}/><OptionField label="Author card" value={selection.authorCard} options={optionsFrom(authorCards, authorSummarySelectable)} disabled={disabled} onChange={value => update("authorCard", value as DesignSelection["authorCard"])}/><OptionField label="Featured treatment" value={selection.hero} options={optionsFrom(heroes)} disabled={disabled} onChange={value => update("hero", value as DesignSelection["hero"])}/></FormSection>
    <FormSection title="Pages and collections"><OptionField label="Homepage composition" value={selection.homepage} options={optionsFrom(homepages)} disabled={disabled} onChange={value => update("homepage", value as DesignSelection["homepage"])}/><OptionField label="Article layout" value={selection.article} options={optionsFrom(articleLayouts)} disabled={disabled} onChange={value => update("article", value as DesignSelection["article"])}/>{(["collection", "tagCollection", "authorCollection", "searchCollection"] as const).map((key, index) => <OptionField key={key} label={["Category collection", "Tag collection", "Author articles", "Search results"][index]!} value={selection[key]} options={optionsFrom(collections)} disabled={disabled} onChange={value => update(key, value as DesignSelection[typeof key])}/>)}</FormSection>
    <FormSection title="Article presentation"><OptionField label="Article measure" value={selection.articleMeasure} options={choices({ NARROW: "Narrow reading measure", STANDARD: "Standard reading measure", WIDE: "Wide reading measure" })} disabled={disabled} onChange={value => update("articleMeasure", value as DesignSelection["articleMeasure"])}/><OptionField label="Headline scale" value={selection.headlineScale} options={choices({ STANDARD: "Standard", LARGE: "Large", DISPLAY: "Display" })} disabled={disabled} onChange={value => update("headlineScale", value as DesignSelection["headlineScale"])}/><OptionField label="Article metadata" value={selection.metaLayout} options={choices({ INLINE: "Inline", STACKED: "Stacked" })} disabled={disabled} onChange={value => update("metaLayout", value as DesignSelection["metaLayout"])}/><OptionField label="Featured media ratio" value={selection.featuredRatio} options={choices({ LANDSCAPE: "Landscape", WIDE: "Wide" })} disabled={disabled} onChange={value => update("featuredRatio", value as DesignSelection["featuredRatio"])}/><OptionField label="Article author" value={selection.authorDisplay} options={choices({ COMPACT: "Compact", PROFILE: "Profile" })} disabled={disabled} onChange={value => update("authorDisplay", value as DesignSelection["authorDisplay"])}/><OptionField label="Related articles" value={selection.relatedLayout} options={choices({ LIST: "List", GRID: "Grid" })} disabled={disabled} onChange={value => update("relatedLayout", value as DesignSelection["relatedLayout"])}/><OptionField label="Related article card" value={selection.relatedCard} options={optionsFrom(articleCards)} disabled={disabled} onChange={value => update("relatedCard", value as DesignSelection["relatedCard"])}/><OptionField label="Collection article card" value={selection.collectionCard} options={optionsFrom(articleCards)} disabled={disabled} onChange={value => update("collectionCard", value as DesignSelection["collectionCard"])}/></FormSection>
    <FormSection title="Image and controls"><OptionField label="Image treatment" value={selection.image} options={optionsFrom(images)} disabled={disabled} onChange={value => update("image", value as DesignSelection["image"])}/><OptionField label="Featured image treatment" value={selection.heroImage} options={optionsFrom(images)} disabled={disabled} onChange={value => update("heroImage", value as DesignSelection["heroImage"])}/><OptionField label="Article image treatment" value={selection.articleImage} options={optionsFrom(images)} disabled={disabled} onChange={value => update("articleImage", value as DesignSelection["articleImage"])}/><OptionField label="Button treatment" value={selection.button} options={optionsFrom(buttons)} disabled={disabled} onChange={value => update("button", value as DesignSelection["button"])}/></FormSection>
    <FormSection title="Layout tokens">{(["density", "spacing", "width", "radius", "border", "elevation"] as const).map(key => <OptionField key={key} label={key === "width" ? "Container width" : key[0]!.toUpperCase() + key.slice(1)} value={selection[key]} options={TOKEN_OPTIONS[key]} disabled={disabled} onChange={value => update(key, value as DesignSelection[typeof key])}/>)}</FormSection>
  </div>;
}

export function AppearancePreview({ config, name, locale }: { config: PresentationConfig; name: string; locale: string }) {
  const { selection, colors } = resolveDesign(config, locale);
  const style = {
    "--preview-surface": colors.surface, "--preview-background": colors.background ?? colors.surface,
    "--preview-text": colors.text, "--preview-accent": colors.accent, "--preview-border": colors.border,
    "--preview-radius": RADII[selection.radius], "--preview-gap": DENSITIES[selection.density].gap,
    "--preview-shadow": ELEVATIONS[selection.elevation], "--preview-border-width": BORDERS[selection.border],
    "--preview-width": `${WIDTHS[selection.width]}px`, "--preview-space": SPACINGS[selection.spacing],
  } as CSSProperties;
  return <section className="bp-appearance-preview" aria-label="Representative appearance preview" style={style} data-home={selection.homepage} data-hero={heroLayout(selection.hero)} data-card={articleCardLayout(selection.articleCard)}>
    <header className="bp-appearance-preview-header"><strong>{name || "Your website"}</strong><nav aria-label="Representative primary navigation"><span>Home</span><span>Topics</span><span>About</span></nav><span>Search</span></header>
    <div className="bp-appearance-preview-main">{HOME_SLOTS[selection.homepage].map(slot => {
      if (slot === "INTRO") return <section key={slot}><h2>Ideas worth reading</h2><p>Representative content shows the selected site typography, spacing and color.</p></section>;
      if (slot === "LEAD") return <section key={slot}><p className="bp-appearance-preview-kicker">FEATURED STORY</p><div className="bp-appearance-preview-lead"><div className="bp-appearance-preview-media" aria-hidden="true"/><div><strong>A thoughtful story for your readers</strong><p>Clear typography and controlled feature treatment.</p></div></div></section>;
      if (slot === "POSTS") return <section key={slot} aria-label="Featured articles"><h3>Featured articles</h3><div className="bp-appearance-preview-cards">{["The latest perspective", "A practical guide", "Stories from the community"].map(title => <article key={title}><div aria-hidden="true"/><strong>{title}</strong><p>Representative article summary</p></article>)}</div></section>;
      if (slot === "CATEGORIES") return <section key={slot} aria-label="Featured topics"><h3>Featured topics</h3><div className="bp-appearance-preview-topics"><span>Culture</span><span>Ideas</span><span>Guides</span></div></section>;
      return <section key={slot} aria-label="Latest articles"><h3>Latest articles</h3><p>Recent stories appear here when a real website has public content.</p></section>;
    })}</div>
    <footer className="bp-appearance-preview-footer"><strong>{name || "Your website"}</strong><span>Explore · About · Contact</span><small>Legal information</small></footer>
  </section>;
}

function splitLines(value: string): string[] { return value.split("\n").map(part => part.trim()).filter(Boolean); }
export function InformationPagesEditor({ pages, onChange, disabled = false }: { pages: StaticPages; onChange(value: StaticPages): void; disabled?: boolean }) {
  const [active, setActive] = useState<keyof StaticPages>("ABOUT");
  const page = pages[active];
  const update = (part: Partial<InformationPage>) => onChange({ ...pages, [active]: { ...page, ...part } });
  const setSection = (index: number, part: Partial<InformationPage["body_sections"][number]>) => update({ body_sections: page.body_sections.map((section, i) => i === index ? { ...section, ...part } : section) });
  return <FormSection title="Information pages" description="Exactly five fixed pages. Disabled or incomplete pages stay unpublished."><div className="bp-appearance-page-tabs" role="group" aria-label="Information page">{PAGE_KEYS.map(key => <button type="button" key={key} aria-pressed={active === key} onClick={() => setActive(key)}>{PAGE_NAMES[key]}</button>)}</div>
    <Checkbox label="Publish this page when it has content" checked={page.enabled} disabled={disabled} onChange={event => update({ enabled: event.target.checked })}/><TextField label="Page title" value={page.title} disabled={disabled} onChange={event => update({ title: event.target.value })}/><TextArea label="Introduction" value={page.intro_text} disabled={disabled} onChange={event => update({ intro_text: event.target.value })}/>
    {page.body_sections.map((section, index) => <div className="bp-appearance-section" key={index}><TextField label={`Section ${index + 1} heading`} value={section.heading ?? ""} disabled={disabled} onChange={event => setSection(index, { heading: event.target.value })}/><TextArea label="Paragraphs (one per line)" value={section.paragraphs.join("\n")} disabled={disabled} onChange={event => setSection(index, { paragraphs: splitLines(event.target.value) })}/><TextArea label="List items (one per line)" value={section.list_items.join("\n")} disabled={disabled} onChange={event => setSection(index, { list_items: splitLines(event.target.value) })}/>{!disabled ? <button type="button" onClick={() => update({ body_sections: page.body_sections.filter((_, i) => i !== index) })}>Remove section</button> : null}</div>)}
    {!disabled ? <button type="button" onClick={() => update({ body_sections: [...page.body_sections, { heading: "", paragraphs: [], list_items: [] }] })}>Add section</button> : null}
  </FormSection>;
}

export function appearanceValidation(config: PresentationConfig, pages: StaticPages, locale: string): string[] {
  return [...presentationErrors(config, locale), ...pagesErrors(pages)];
}

export const DEFAULT_PREVIEW_CONFIG = startingPresentation("CUSTOM");
export const DEFAULT_PREVIEW_SELECTION = SAFE_DEFAULT;
