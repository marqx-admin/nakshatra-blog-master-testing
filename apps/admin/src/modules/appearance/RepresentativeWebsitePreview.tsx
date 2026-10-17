import { useState, type CSSProperties } from "react";
import {
  BORDERS, DENSITIES, ELEVATIONS, HOME_SLOTS, RADII, SPACINGS, WIDTHS,
  articleCardLayout, authorLayout, categoryLayout, collectionLayout, heroLayout, imageTreatment, resolveDesign, typography,
} from "@bp/presentation-catalogue";
import type { PresentationConfig } from "./appearance-model";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const STORIES = [
  { title: "A fresh perspective on everyday life", eyebrow: "Culture", time: "5 min read" },
  { title: "Ideas to carry into the week", eyebrow: "Ideas", time: "4 min read" },
  { title: "A thoughtful guide for curious minds", eyebrow: "Guides", time: "6 min read" },
] as const;

export function AppearancePreview({ config, name, locale, compact = false }: { config: PresentationConfig; name: string; locale: string; compact?: boolean }) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const { selection, colors } = resolveDesign(config, locale);
  const type = typography[selection.typography];
  const media = imageTreatment(selection.image);
  const style = {
    "--preview-surface": colors.surface,
    "--preview-background": colors.background ?? colors.surface,
    "--preview-text": colors.text,
    "--preview-muted": colors.text_muted,
    "--preview-heading": colors.heading ?? colors.text,
    "--preview-accent": colors.accent,
    "--preview-accent-text": colors.accent_text,
    "--preview-border": colors.border,
    "--preview-focus": colors.focus,
    "--preview-radius": RADII[selection.radius],
    "--preview-gap": DENSITIES[selection.density].gap,
    "--preview-section": DENSITIES[selection.density].section,
    "--preview-padding": DENSITIES[selection.density].padding,
    "--preview-shadow": ELEVATIONS[selection.elevation],
    "--preview-border-width": BORDERS[selection.border],
    "--preview-width": `${WIDTHS[selection.width]}px`,
    "--preview-space": SPACINGS[selection.spacing],
    "--preview-heading-font": `"${type.heading}", Georgia, serif`,
    "--preview-body-font": `"${type.body}", system-ui, sans-serif`,
    "--preview-media-ratio": media.ratio,
    "--preview-media-fit": media.fit,
    "--preview-reading-width": selection.articleMeasure === "NARROW" ? "46ch" : selection.articleMeasure === "WIDE" ? "76ch" : "62ch",
  } as CSSProperties;
  const brand = name.trim() || "Your publication";
  const slots = HOME_SLOTS[selection.homepage];
  return <section className={`bp-appearance-preview-frame${compact ? " is-compact" : ""}`} aria-label={compact ? undefined : "Representative appearance preview"} aria-hidden={compact || undefined} data-preview-engine="universal-representative">
    {!compact ? <div className="bp-appearance-preview-toolbar"><div><strong>Website preview</strong><span>Synthetic layout examples · no articles are saved or published</span><small>{config.style_id} / {config.base_style_id ?? "preset"} · cards {selection.articleCard} / {selection.collectionCard} / {selection.relatedCard} · {selection.typography}</small></div><div className="bp-appearance-device-controls" role="group" aria-label="Preview size">{(["desktop", "tablet", "mobile"] as const).map(mode => <button key={mode} type="button" aria-pressed={device === mode} onClick={() => setDevice(mode)}>{mode[0]!.toUpperCase() + mode.slice(1)}</button>)}</div></div> : null}
    <div className="bp-appearance-preview-stage"><div className="bp-appearance-preview" style={style} data-device={compact ? "tile" : device} data-home={selection.homepage} data-hero={heroLayout(selection.hero)} data-card={articleCardLayout(selection.articleCard)} data-category={categoryLayout(selection.categoryCard)} data-author={authorLayout(selection.authorCard)} data-article={selection.article} data-headline={selection.headlineScale} data-collection={collectionLayout(selection.collection)} data-image={selection.image} data-button={selection.button}>
      <header className="bp-appearance-preview-header"><div className="bp-appearance-preview-brand"><span className="bp-appearance-preview-mark" aria-hidden="true">✦</span><strong>{brand}</strong></div><nav aria-label="Representative primary navigation"><span>Home</span><span>Stories</span><span>Topics</span><span>About</span></nav><span className="bp-appearance-preview-search" aria-label="Search representation">⌕ <span>Search</span></span><span className="bp-appearance-preview-menu" aria-hidden="true">☰</span></header>
      <main className="bp-appearance-preview-main">{slots.map(slot => {
        if (slot === "INTRO") return <section className="bp-appearance-preview-intro" key={slot}><p className="bp-appearance-preview-kicker">A publication for curious minds</p><h2>Stories that stay with you.</h2><p>Fresh perspectives, thoughtful guides, and ideas worth sharing.</p></section>;
        if (slot === "LEAD") return <section className="bp-appearance-preview-lead-section" key={slot}><div className="bp-appearance-preview-lead"><div className="bp-appearance-preview-media bp-appearance-preview-media--lead" aria-hidden="true"><span /></div><div className="bp-appearance-preview-lead-copy"><p className="bp-appearance-preview-kicker">Featured story · Editorial</p><h3>Finding meaning in the moments that matter</h3><p>An inviting introduction to the ideas and voices shaping this publication.</p><span className="bp-appearance-preview-button">Read the story <span aria-hidden="true">↗</span></span></div></div></section>;
        if (slot === "POSTS") return <section key={slot} aria-label="Featured articles"><div className="bp-appearance-preview-section-head"><h3>Featured stories</h3><span>Explore all →</span></div><div className="bp-appearance-preview-cards">{STORIES.map((story, index) => <article key={story.title}><div className={`bp-appearance-preview-media bp-appearance-preview-media--${index + 1}`} aria-hidden="true"><span /></div><div className="bp-appearance-preview-card-copy"><small>{story.eyebrow} · {story.time}</small><h4>{story.title}</h4><p>Representative editorial content that shows the selected card treatment.</p></div></article>)}</div></section>;
        if (slot === "CATEGORIES") return <section key={slot} aria-label="Featured topics"><div className="bp-appearance-preview-section-head"><h3>Explore by topic</h3><span>Browse topics →</span></div><div className="bp-appearance-preview-topics"><span>Culture <i aria-hidden="true">↗</i></span><span>Ideas <i aria-hidden="true">↗</i></span><span>Guides <i aria-hidden="true">↗</i></span></div></section>;
        return <section key={slot} aria-label="Latest articles"><div className="bp-appearance-preview-section-head"><h3>Latest stories</h3><span>View all →</span></div><div className="bp-appearance-preview-latest"><strong>A new chapter begins with one good question</strong><small>Ideas · 3 min read</small></div></section>;
      })}{!compact ? <section className="bp-appearance-preview-depth" aria-label="Representative inside pages"><div className="bp-appearance-preview-article-sample"><small>Inside a story · 5 min read</small><h3>A closer look at the ideas behind the headlines</h3><div className="bp-appearance-preview-media" aria-hidden="true"/><p>Long-form pages keep a comfortable reading measure and a clear hierarchy for every story.</p><div className="bp-appearance-preview-author"><i aria-hidden="true"/><span><strong>Aanya Sharma</strong><small>Writer</small></span></div></div><div className="bp-appearance-preview-collection-sample"><h3>More from the archive</h3><div><span>Perspectives on culture and life</span><span>A guide to the questions that matter</span><span>Stories from our community</span></div></div></section> : null}</main>
      <footer className="bp-appearance-preview-footer"><div><strong>{brand}</strong><p>Ideas, stories, and perspectives for the journey ahead.</p></div><div><small>Explore</small><span>Home · Stories · Topics</span></div><div><small>Information</small><span>About · Contact · Legal pages</span></div><div className="bp-appearance-preview-footer-bottom"><span>Representative footer</span><span>Information links appear when pages are ready and enabled.</span></div></footer>
    </div></div>
  </section>;
}
