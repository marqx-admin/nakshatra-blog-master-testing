import { useContext, type ReactNode } from "react";
import { appearanceId, resolveStandardDesign } from "@bp/presentation-catalogue";
import type { components } from "@bp/api-contract";
import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { presentationStyle, resolvedPresentationStyle, resolvePresentation } from "../../lib/presentation";
import { DesignContext, StandardRecipeContext, ResolvedAppearanceContext } from "../../lib/design-context";
import { SiteHeader } from "../header/site-header";
import { SiteFooter } from "../footer/site-footer";

export function SiteShell({ site, navigation, settings, contactInfo, presentation, requestPath, children }: {
  site: SiteIdentity;
  navigation: NavigationBundle;
  settings: PublicSettings;
  contactInfo?: components["schemas"]["ContactInfo"] | undefined;
  presentation: components["schemas"]["TrustedPresentation"] | undefined;
  requestPath: string;
  children: ReactNode;
}) {
  const locale = site.locale_code ?? site.default_language ?? "en";
  const standard = useContext(StandardRecipeContext);
  const resolved = standard ? { ...resolveStandardDesign(locale), source: "STYLE_DEFAULT" as const } : resolvePresentation(presentation, locale);
  const design = resolved.selection;
  const config = presentation?.config;
  const base = config?.style_id === "CUSTOM" ? config.base_style_id : config?.style_id;
  const modern = !standard && config?.recipe_version === 2 && resolved.source !== "SAFE_DEFAULT" && appearanceId(base);
  const recipe = standard ? "STANDARD" : modern ? base : undefined;
  const style = standard ? resolvedPresentationStyle(resolved) : presentationStyle(presentation, locale);
  return <ResolvedAppearanceContext.Provider value={Boolean(modern)}><DesignContext.Provider value={design}><div className="universal-site" lang={locale} style={style} data-recipe={recipe === "STANDARD" ? "STANDARD" : undefined} data-theme={recipe} data-appearance-version={modern ? "2" : undefined} data-custom={modern && config?.style_id === "CUSTOM" || undefined} data-custom-colors={modern && config?.palette?.mode === "CUSTOM" || undefined} data-home={design.homepage} data-article={design.article} data-author={design.authorCard} data-author-display={design.authorDisplay} data-collection={design.collection} data-button={design.button} data-measure={design.articleMeasure} data-headline={design.headlineScale} data-meta={design.metaLayout} data-featured-ratio={design.featuredRatio} data-related={design.relatedLayout}>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <SiteHeader site={site} navigation={navigation} requestPath={requestPath} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <SiteFooter site={site} navigation={navigation} settings={settings} contactInfo={contactInfo} requestPath={requestPath} />
  </div></DesignContext.Provider></ResolvedAppearanceContext.Provider>;
}
