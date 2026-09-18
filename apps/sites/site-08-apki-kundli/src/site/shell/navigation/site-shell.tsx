import type { ReactNode } from "react";
import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { SiteHeader } from "../header/site-header";
import { SiteFooter } from "../footer/site-footer";

export function SiteShell({ site, navigation, settings, requestPath, children }: { site: SiteIdentity; navigation: NavigationBundle; settings: PublicSettings; requestPath: string; children: ReactNode }) {
  return <><a href="#main-content" className="skip-link" data-component-id="CMP12-SHELL-SKIP">Skip to main content</a><SiteHeader site={site} navigation={navigation} requestPath={requestPath} /><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter site={site} navigation={navigation} settings={settings} /></>;
}
