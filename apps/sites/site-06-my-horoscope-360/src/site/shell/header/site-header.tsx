import type { NavigationBundle, SiteIdentity } from "../../lib/types";
import { DestinationLink } from "../../components/destination-link";
import { isCurrentDestination } from "../../lib/destination";
import { MobileNavigation } from "../navigation/mobile-navigation";

function findSearch(items: NavigationBundle["header"]["items"]) {
  for (const item of items) {
    if (item.destination.kind === "SEARCH") return item.destination;
    const child = item.children.find((value) => value.destination.kind === "SEARCH");
    if (child) return child.destination;
  }
  return undefined;
}

export function SiteHeader({ site, navigation, requestPath }: { site: SiteIdentity; navigation: NavigationBundle; requestPath: string }) {
  const searchDestination = findSearch(navigation.header.items);
  return (
    <header className="site-header essay-header" data-component-id="CMP12-SHELL-HEADER">
      <div className="container header-frame">
        <div className="header-primary">
          <DestinationLink destination={site.home_destination} className="brand-link">
            <span className="brand-mark book-mark" aria-hidden="true" />
            <span className="brand-copy"><strong>{site.display_name}</strong><small>{site.canonical_domain}</small></span>
          </DestinationLink>
          {searchDestination ? <DestinationLink destination={searchDestination} className="header-search" ariaCurrent={isCurrentDestination(searchDestination, requestPath) ? "page" : undefined}><span data-component-id="CMP12-SHELL-SEARCH-ENTRY">Search</span></DestinationLink> : null}
          <MobileNavigation items={navigation.header.items} requestPath={requestPath} searchDestination={searchDestination} />
        </div>
        <nav className="desktop-nav" aria-label="Primary navigation" data-component-id="CMP12-SHELL-NAV">
          <ul>
            {navigation.header.items.filter((item) => item.destination.kind !== "SEARCH").map((item) => <li key={`${item.label}-${item.destination.url}`}><DestinationLink destination={item.destination} ariaCurrent={isCurrentDestination(item.destination, requestPath) ? "page" : undefined}>{item.label}</DestinationLink></li>)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
