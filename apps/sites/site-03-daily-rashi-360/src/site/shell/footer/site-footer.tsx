import type { NavigationBundle, PublicSettings, SiteIdentity } from "../../lib/types";
import { DestinationLink } from "../../components/destination-link";

export function SiteFooter({ site, navigation, settings }: { site: SiteIdentity; navigation: NavigationBundle; settings: PublicSettings }) {
  return (
    <footer className="site-footer journal-footer" data-component-id="CMP12-SHELL-FOOTER">
      <div className="container footer-grid">
        <div className="footer-brand"><strong>{site.display_name}</strong><p>{site.canonical_domain}</p></div>
        <nav aria-label="Footer navigation"><ul>{navigation.footer.items.map((item) => <li key={`${item.label}-${item.destination.url}`}><DestinationLink destination={item.destination}>{item.label}</DestinationLink></li>)}</ul></nav>
        {settings.social_profiles.length ? <div className="footer-social"><p>Elsewhere</p>{settings.social_profiles.map((profile) => <a key={profile.url} href={profile.url} rel="noopener noreferrer" target="_blank">{profile.label ?? profile.platform}</a>)}</div> : null}
      </div>
      {settings.copyright_text ? <div className="container footer-legal">{settings.copyright_text}</div> : null}
    </footer>
  );
}
