import type { ReactNode } from "react";
import type { components } from "@bp/api-contract";
import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { presentationStyle, resolvePresentation } from "../../lib/presentation";
import { DesignContext } from "../../lib/design-context";
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
  const design = resolvePresentation(presentation, locale).selection;
  return <DesignContext.Provider value={design}><div className="universal-site" style={presentationStyle(presentation, locale)} data-home={design.homepage} data-article={design.article} data-author={design.authorCard} data-author-display={design.authorDisplay} data-collection={design.collection} data-button={design.button} data-measure={design.articleMeasure} data-headline={design.headlineScale} data-meta={design.metaLayout} data-featured-ratio={design.featuredRatio} data-related={design.relatedLayout}>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <SiteHeader site={site} navigation={navigation} requestPath={requestPath} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <SiteFooter site={site} navigation={navigation} settings={settings} contactInfo={contactInfo} requestPath={requestPath} />
  </div></DesignContext.Provider>;
}
