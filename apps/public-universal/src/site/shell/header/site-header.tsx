import type { NavigationBundle, SiteIdentity } from "../../lib/types";
import { DestinationLink } from "../../components/destination-link";
import { ResponsiveMedia } from "../../components/responsive-media";
import { MobileNavigation } from "../navigation/mobile-navigation";
import { NavigationTree } from "../navigation/navigation-tree";
import { isCurrentDestination } from "../../lib/destination";

export function SiteHeader({ site, navigation, requestPath }: { site: SiteIdentity; navigation: NavigationBundle; requestPath: string }) {
  return <header className="site-header">
    <div className="container header-inner">
      <DestinationLink destination={site.home_destination} className="brand-link" ariaCurrent={isCurrentDestination(site.home_destination, requestPath) ? "page" : undefined}>
        {site.logo_media ? <ResponsiveMedia media={site.logo_media} altOverride={site.display_name} className="brand-logo" /> : <strong className="brand-name">{site.display_name}</strong>}
      </DestinationLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavigationTree items={navigation.header.items} requestPath={requestPath} idPrefix="desktop-children" />
      </nav>
      <a className="header-search" href="/search" aria-current={requestPath === "/search" ? "page" : undefined}>Search</a>
      {/* RC11 navigation items have no stable item ID. The optional CTA remains off until a validated same-site destination is projected. */}
      <MobileNavigation items={navigation.header.items} requestPath={requestPath} />
    </div>
  </header>;
}
