import { useContext, useEffect, useRef, useState } from "react";
import { ResolvedAppearanceContext, StandardRecipeContext } from "../../lib/design-context";
import type { NavigationBundle, SiteIdentity } from "../../lib/types";
import { DestinationLink } from "../../components/destination-link";
import { ResponsiveMedia } from "../../components/responsive-media";
import { MobileNavigation } from "../navigation/mobile-navigation";
import { NavigationTree } from "../navigation/navigation-tree";
import { isCurrentDestination } from "../../lib/destination";

export function SiteHeader({ site, navigation, requestPath }: { site: SiteIdentity; navigation: NavigationBundle; requestPath: string }) {
  const reference = useContext(StandardRecipeContext);
  const enhanced = useContext(ResolvedAppearanceContext);
  const standard = reference || enhanced;
  // Only the always-supported routes fill an empty reference menu. Authored
  // navigation and information-page eligibility stay entirely server-owned.
  const items = standard && !navigation.header.items.length ? [
    { label: "Home", destination: site.home_destination, children: [] },
    { label: "Articles", destination: { kind: "STATIC" as const, page_id: "PUB-BLOG-01" as const, url: "/blog", is_external: false }, children: [] },
  ] : navigation.header.items;
  const row = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const element = row.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const brand = element.querySelector<HTMLElement>(".brand-link");
      const nav = element.querySelector<HTMLElement>(".desktop-nav");
      const search = element.querySelector<HTMLElement>(".header-search");
      if (!brand || !nav || !search) return;
      const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
      const listWidth = nav.querySelector<HTMLElement>(".navigation-list")?.getBoundingClientRect().width ?? 0;
      const needsCompact = listWidth + brand.offsetWidth + search.offsetWidth + gap * 2 > element.clientWidth;
      if (needsCompact && nav.contains(document.activeElement)) search.focus();
      setCompact(needsCompact);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    const list = element.querySelector(".desktop-nav > .navigation-list");
    if (list) observer.observe(list);
    measure();
    return () => observer.disconnect();
  }, [site, navigation]);
  return <header className="site-header">
    <div ref={row} className="container header-inner" data-compact={compact || undefined}>
      <DestinationLink destination={site.home_destination} className="brand-link" ariaCurrent={isCurrentDestination(site.home_destination, requestPath) ? "page" : undefined}>
        {site.logo_media ? <ResponsiveMedia media={site.logo_media} altOverride={site.display_name} className="brand-logo" /> : <strong className="brand-name">{site.display_name}</strong>}
      </DestinationLink>
      <nav className="desktop-nav" aria-label="Primary navigation" inert={compact}>
        <NavigationTree items={items} requestPath={requestPath} idPrefix="desktop-children" />
      </nav>
      <a className="header-search" href="/search" aria-current={requestPath === "/search" ? "page" : undefined}>Search</a>
      {/* RC11 navigation items have no stable item ID. The optional CTA remains off until a validated same-site destination is projected. */}
      <MobileNavigation items={items} requestPath={requestPath} />
    </div>
  </header>;
}
