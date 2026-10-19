import type { components } from "@bp/api-contract";
import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { DestinationLink } from "../../components/destination-link";
import { ResponsiveMedia } from "../../components/responsive-media";
import { NavigationTree } from "../navigation/navigation-tree";
import { destinationHref, destinationPath, isCurrentDestination } from "../../lib/destination";
import { useSiteMessages } from "../../lib/site-locale";
import { routeAwareHref } from "../../dev-preview/route-path";

function FooterSocialContact({ socialProfiles, contactInfo }: { socialProfiles: PublicSettings["social_profiles"]; contactInfo?: components["schemas"]["ContactInfo"] | undefined }) {
  const messages = useSiteMessages();
  const approvedProfiles = socialProfiles.filter((profile) => destinationHref({ kind: "EXTERNAL", url: profile.url, is_external: true }));
  const approvedContact = contactInfo?.items.filter((item) => item.label.trim() && item.display_value.trim()) ?? [];
  if (!approvedProfiles.length && !approvedContact.length) return null;
  return <div className="footer-social-contact">
    {approvedProfiles.length ? <nav aria-label={messages.socialProfiles} className="footer-social">
      <h2>{messages.elsewhere}</h2>
      <ul>{approvedProfiles.map((profile) => <li key={profile.url}><DestinationLink destination={{ kind: "EXTERNAL", url: profile.url, is_external: true }}>{profile.label?.trim() || profile.platform}</DestinationLink></li>)}</ul>
    </nav> : null}
    {approvedContact.length ? <address className="footer-contact">
      {approvedContact.map((item) => <div key={`${item.kind}-${item.label}`}><strong>{item.label}</strong>{item.destination ? <DestinationLink destination={item.destination}>{item.display_value}</DestinationLink> : <span>{item.display_value}</span>}</div>)}
    </address> : null}
  </div>;
}

export function SiteFooter({ site, navigation, settings, contactInfo, requestPath }: { site: SiteIdentity; navigation: NavigationBundle; settings: PublicSettings; contactInfo?: components["schemas"]["ContactInfo"] | undefined; requestPath: string }) {
  const messages = useSiteMessages();
  const blogHref = routeAwareHref(requestPath, "blog", "/blog");
  const searchHref = routeAwareHref(requestPath, "search", "/search");
  const authored = new Set(navigation.footer.items.filter(item => !item.destination.is_external && destinationHref(item.destination)).map(item => destinationPath(item.destination).split(/[?#]/)[0]));
  const shortcuts = ["/", "/blog", "/search"].filter(path => !authored.has(path));
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <DestinationLink destination={site.home_destination} className="footer-brand-link" ariaCurrent={isCurrentDestination(site.home_destination, requestPath) ? "page" : undefined}>
          {site.logo_media ? <ResponsiveMedia media={site.logo_media} altOverride={site.display_name} className="footer-logo" /> : <strong>{site.display_name}</strong>}
        </DestinationLink>
        {shortcuts.length ? <nav aria-label={messages.siteShortcuts} className="footer-shortcuts">
          {shortcuts.includes("/") ? <DestinationLink destination={site.home_destination} ariaCurrent={isCurrentDestination(site.home_destination, requestPath) ? "page" : undefined}>{messages.home}</DestinationLink> : null}
          {shortcuts.includes("/blog") ? <a href={blogHref} aria-current={requestPath === blogHref || requestPath.split("?")[0] === "/blog" ? "page" : undefined}>{messages.allArticles}</a> : null}
          {shortcuts.includes("/search") ? <a href={searchHref} aria-current={requestPath === searchHref || requestPath.split("?")[0] === "/search" ? "page" : undefined}>{messages.search}</a> : null}
        </nav> : null}
      </div>
      {navigation.footer.items.length ? <nav aria-label={messages.footerNavigation} className="footer-navigation">
        <NavigationTree items={navigation.footer.items} requestPath={requestPath} idPrefix="footer-children" />
      </nav> : null}
      <FooterSocialContact socialProfiles={settings.social_profiles} contactInfo={contactInfo} />
    </div>
    {settings.copyright_text ? <div className="container footer-legal"><small>{settings.copyright_text}</small></div> : null}
  </footer>;
}
