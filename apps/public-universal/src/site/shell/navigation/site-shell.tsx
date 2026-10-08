import type { ReactNode } from "react";
import type { components } from "@bp/api-contract";
import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { presentationStyle } from "../../lib/presentation";
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
  return <div className="universal-site" style={presentationStyle(presentation)}>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <SiteHeader site={site} navigation={navigation} requestPath={requestPath} />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <SiteFooter site={site} navigation={navigation} settings={settings} contactInfo={contactInfo} requestPath={requestPath} />
  </div>;
}
