import type { CSSProperties, ReactNode } from "react";
import {
  BORDERS, DENSITIES, ELEVATIONS, HOME_SLOTS, RADII, SPACINGS, WIDTHS,
  articleCardLayout, articleCards, articleLayouts, authorCards, authorLayout, authorSummarySelectable,
  buttons, categoryCards, categoryLayout, categorySelectable, collectionLayout, collections,
  heroLayout, heroes, homepages, imageTreatment, images, paletteErrors, palettes,
  presetColors, typography, typographyAvailable, type DesignSelection,
  resolveDesign,
  appearancePaletteErrors,
} from "@bp/presentation-catalogue";
import { Checkbox, TextField } from "../../ui/components";
import { selectionFrom, withCustomPalette, withSelection, type PresentationConfig } from "./appearance-model";
import { AppearancePreview } from "./RepresentativeWebsitePreview";

type Option = { id: string; name: string };
type SampleKind = "palette" | "type" | "home" | "hero" | "card" | "category" | "author" | "article" | "collection" | "image" | "button" | "measure" | "feel";
const optionsFrom = (items: Record<string, { name: string }>, eligible: (id: string) => boolean = () => true): Option[] =>
  Object.entries(items).filter(([id]) => eligible(id)).map(([id, item]) => ({ id, name: item.name }));
const choices = (items: Record<string, string>): Option[] => Object.entries(items).map(([id, name]) => ({ id, name }));
const tokens = (items: Record<string, unknown>, prefix = ""): Option[] => Object.keys(items).map(id => {
  const name = id.slice(prefix.length).replaceAll("-", " ").toLowerCase();
  return { id, name: name.charAt(0).toUpperCase() + name.slice(1) };
});

function Sample({ kind, id }: { kind: SampleKind; id: string }) {
  if (kind === "palette") {
    const color = presetColors(id as keyof typeof palettes);
    return <span className="bp-choice-palette" style={{ "--sample-bg": color.background ?? color.surface, "--sample-surface": color.surface, "--sample-text": color.text, "--sample-accent": color.accent, "--sample-focus": color.focus } as CSSProperties} aria-hidden="true"><i/><i/><i/><i/><i/></span>;
  }
  if (kind === "type") {
    const font = typography[id as keyof typeof typography];
    return <span className="bp-choice-type" aria-hidden="true"><strong style={{ fontFamily: `"${font.heading}", Georgia, serif` }}>Your publication</strong><b style={{ fontFamily: `"${font.heading}", Georgia, serif` }}>A story worth reading</b><span style={{ fontFamily: `"${font.body}", system-ui, sans-serif` }}>Ideas that stay with your readers.</span><small style={{ fontFamily: `"${font.body}", system-ui, sans-serif` }}>CULTURE · 5 MIN READ</small></span>;
  }
  if (kind === "home") return <span className="bp-choice-layout bp-choice-home" data-layout={id} aria-hidden="true">{HOME_SLOTS[id as keyof typeof homepages].map(slot => <i key={slot} data-slot={slot}>{slot === "POSTS" ? "Stories" : slot === "CATEGORIES" ? "Topics" : slot === "LATEST" ? "Latest" : slot === "LEAD" ? "Lead" : "Intro"}</i>)}</span>;
  if (kind === "hero") return <span className="bp-choice-layout bp-choice-hero" data-layout={heroLayout(id as keyof typeof heroes)} aria-hidden="true"><i/><b>Finding a fresh perspective</b><small>FEATURED STORY</small></span>;
  if (kind === "card") return <span className="bp-choice-layout bp-choice-card" data-layout={articleCardLayout(id as keyof typeof articleCards)} aria-hidden="true"><i/><span><small>CULTURE · 5 MIN</small><b>Ideas worth sharing</b><em>A thoughtful story for your readers.</em></span></span>;
  if (kind === "category") return <span className="bp-choice-layout bp-choice-category" data-layout={categoryLayout(id as keyof typeof categoryCards)} aria-hidden="true"><i/><b>Culture</b><small>Explore topic →</small></span>;
  if (kind === "author") return <span className="bp-choice-layout bp-choice-author" data-layout={authorLayout(id as keyof typeof authorCards)} aria-hidden="true"><i/><span><b>Aanya Sharma</b><small>Writer · Stories and ideas</small></span></span>;
  if (kind === "article") return <span className="bp-choice-layout bp-choice-article" data-layout={id} aria-hidden="true"><small>EDITORIAL · 5 MIN READ</small><b>Finding meaning in everyday moments</b><i/><em>Clear, comfortable reading measure for a long story.</em></span>;
  if (kind === "collection") return <span className="bp-choice-layout bp-choice-collection" data-layout={collectionLayout(id as keyof typeof collections)} aria-hidden="true"><b>Latest stories</b><i/><i/><i/></span>;
  if (kind === "image") {
    const media = imageTreatment(id as keyof typeof images);
    return <span className="bp-choice-layout bp-choice-image" data-edge={media.edge} style={{ "--sample-ratio": media.ratio, "--sample-fit": media.fit } as CSSProperties} aria-hidden="true"><i/></span>;
  }
  if (kind === "button") return <span className="bp-choice-layout bp-choice-button" data-layout={id} aria-hidden="true"><b>Read the story →</b></span>;
  if (kind === "measure") return <span className="bp-choice-layout bp-choice-measure" data-layout={id} aria-hidden="true"><b>A good story</b><i/><i/><i/></span>;
  return <span className="bp-choice-layout bp-choice-feel" data-layout={id} aria-hidden="true"><i/><i/><i/></span>;
}

export function AppearanceSummary({ config, locale }: { config: PresentationConfig; locale: string }) {
  const selected = resolveDesign(config, locale).selection;
  return <dl className="bp-appearance-summary"><div><dt>Colors</dt><dd>{config.palette?.mode === "CUSTOM" ? "Custom colors" : palettes[selected.palette].name}</dd></div><div><dt>Typography</dt><dd>{typography[selected.typography].name}</dd></div><div><dt>Homepage</dt><dd>{homepages[selected.homepage].name}</dd></div><div><dt>Cards</dt><dd>{articleCards[selected.articleCard].name}</dd></div><div><dt>Article layout</dt><dd>{articleLayouts[selected.article].name}</dd></div><div><dt>Collections</dt><dd>{collections[selected.collection].name}</dd></div></dl>;
}

function Gallery({ label, value, options, kind, onChange, disabled = false }: { label: string; value: string; options: Option[]; kind: SampleKind; onChange(id: string): void; disabled?: boolean }) {
  return <div className="bp-choice-field"><div className="bp-choice-heading"><h4>{label}</h4><span>{options.find(option => option.id === value)?.name ?? "Choose an option"}</span></div><div className="bp-choice-grid" role="group" aria-label={label}>{options.map(option => <button className="bp-choice" key={option.id} type="button" aria-pressed={option.id === value} data-selected={option.id === value} data-option-id={option.id} disabled={disabled} onClick={() => onChange(option.id)}><Sample kind={kind} id={option.id}/><span className="bp-choice-name">{option.name}</span></button>)}</div></div>;
}

function Group({ title, description, children, open = false }: { title: string; description: string; children: ReactNode; open?: boolean }) {
  return <details className="bp-appearance-group" open={open || undefined}><summary><span><strong>{title}</strong><small>{description}</small></span><span aria-hidden="true">⌄</span></summary><div className="bp-appearance-group-body">{children}</div></details>;
}

export function AppearanceControls({ config, onChange, locale, name = "Your publication", disabled = false }: { config: PresentationConfig; onChange(value: PresentationConfig): void; locale: string; name?: string; disabled?: boolean }) {
  const selection = selectionFrom(config, locale);
  const update = (key: keyof DesignSelection, value: string) => onChange(withSelection(config, { ...selection, [key]: value,
    ...(key === "articleCard" ? { collectionCard: value, relatedCard: value } : {}),
  } as DesignSelection));
  const custom = config.palette?.mode === "CUSTOM";
  const colors = custom && config.palette?.semantic_tokens ? config.palette.semantic_tokens : presetColors(selection.palette);
  const colorErrors = custom ? config.recipe_version === 2 ? appearancePaletteErrors(colors) : paletteErrors(colors) : [];
  const colorFields = ["surface", "surface_alt", "text", "text_muted", "accent", "accent_text", "border", "focus", "primary", "secondary", "background", "heading"] as const;
  const gallery = (label: string, key: keyof DesignSelection, options: Option[], kind: SampleKind) => <Gallery label={label} value={selection[key]} options={options} kind={kind} disabled={disabled} onChange={value => update(key, value)}/>;
  return <div className="bp-appearance-workbench"><div className="bp-appearance-controls">
    <p className="bp-appearance-intro">Your chosen style is already a complete website look. Keep it as-is or refine any detail below; the preview updates as you choose.</p>
    <Group title="Brand & Colors" description="See the palette in context before choosing" open>
      <Checkbox label="Use custom semantic colors" checked={custom} disabled={disabled} onChange={event => onChange(event.target.checked ? withCustomPalette(config, presetColors(selection.palette)) : { ...config, palette: { mode: "PRESET", preset_id: selection.palette } })}/>
      {custom ? <><div className="bp-appearance-color-grid">{colorFields.map(key => <TextField key={key} label={key.replaceAll("_", " ")} type="color" value={colors[key] ?? colors.surface} disabled={disabled} onChange={event => onChange(withCustomPalette(config, { ...colors, [key]: event.target.value }))}/>)}</div>{colorErrors.length ? <p className="bp-appearance-contrast-error" role="alert">Contrast needs attention: {colorErrors.join(" ")}</p> : <p className="bp-appearance-color-valid">Color contrast is valid.</p>}</> : gallery("Palette", "palette", optionsFrom(palettes), "palette")}
    </Group>
    <Group title="Typography" description="Compare real heading, body and metadata specimens">{gallery("Typography preset", "typography", optionsFrom(typography, id => typographyAvailable(id, locale)), "type")}</Group>
    <Group title="Homepage & Hero" description="Choose how the lead and sections flow">{gallery("Homepage composition", "homepage", optionsFrom(homepages), "home")}{gallery("Featured treatment", "hero", optionsFrom(heroes), "hero")}</Group>
    <Group title="Cards" description="See stories, topics and writers as readers will">{gallery("Article card", "articleCard", optionsFrom(articleCards), "card")}{gallery("Category card", "categoryCard", optionsFrom(categoryCards, categorySelectable), "category")}{gallery("Author card", "authorCard", optionsFrom(authorCards, authorSummarySelectable), "author")}</Group>
    <Group title="Articles" description="Reading width, media and supporting stories">{gallery("Article layout", "article", optionsFrom(articleLayouts), "article")}{gallery("Article measure", "articleMeasure", choices({ NARROW: "Narrow reading", STANDARD: "Standard reading", WIDE: "Wide reading" }), "measure")}{gallery("Headline scale", "headlineScale", choices({ STANDARD: "Standard", LARGE: "Large", DISPLAY: "Display" }), "article")}{gallery("Article metadata", "metaLayout", choices({ INLINE: "Inline", STACKED: "Stacked" }), "article")}{gallery("Featured media ratio", "featuredRatio", choices({ LANDSCAPE: "Landscape", WIDE: "Wide" }), "image")}{gallery("Article author", "authorDisplay", choices({ COMPACT: "Compact", PROFILE: "Profile" }), "author")}{gallery("Related articles", "relatedLayout", choices({ LIST: "List", GRID: "Grid" }), "collection")}{gallery("Related article card", "relatedCard", optionsFrom(articleCards), "card")}</Group>
    <Group title="Collections" description="Shape topic, author and search result pages">{gallery("Category collection", "collection", optionsFrom(collections), "collection")}{gallery("Tag collection", "tagCollection", optionsFrom(collections), "collection")}{gallery("Author articles", "authorCollection", optionsFrom(collections), "collection")}{gallery("Search results", "searchCollection", optionsFrom(collections), "collection")}{gallery("Collection article card", "collectionCard", optionsFrom(articleCards), "card")}</Group>
    <Group title="Images" description="Compare approved framing and ratios">{gallery("Image treatment", "image", optionsFrom(images), "image")}{gallery("Featured image treatment", "heroImage", optionsFrom(images), "image")}{gallery("Article image treatment", "articleImage", optionsFrom(images), "image")}</Group>
    <Group title="Layout & Feel" description="Fine tune space, width, shape and emphasis">{gallery("Density", "density", tokens(DENSITIES, "DENSITY-"), "feel")}{gallery("Spacing", "spacing", tokens(SPACINGS), "feel")}{gallery("Container width", "width", tokens(WIDTHS, "WIDTH-"), "measure")}{gallery("Radius", "radius", tokens(RADII, "RADIUS-"), "feel")}{gallery("Border", "border", tokens(BORDERS, "BORDER-"), "feel")}{gallery("Elevation", "elevation", tokens(ELEVATIONS, "ELEVATION-"), "feel")}{gallery("Button treatment", "button", optionsFrom(buttons), "button")}</Group>
  </div><aside className="bp-appearance-live-preview"><AppearancePreview config={config} name={name} locale={locale}/></aside></div>;
}
