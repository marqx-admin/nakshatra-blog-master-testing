import type { components } from "@bp/api-contract";
import { ResponsiveMedia } from "../../components/responsive-media";
import { useDesign } from "../../lib/design-context";
import { initials } from "../../components/semantic-components";
import { DestinationLink } from "../../components/destination-link";
import { destinationHref } from "../../lib/destination";

export function AuthorProfile({ author }: { author: components["schemas"]["AuthorDetail"] }) {
  const design = useDesign();
  const social = author.social_profiles.filter((profile) => destinationHref({ kind: "EXTERNAL", url: profile.url, is_external: true }));
  const profile = design.authorCard === "AUTH-12" || design.authorCard === "AUTH-11" && !author.expertise.length || design.authorCard === "AUTH-13" && !social.length ? "AUTH-05" : design.authorCard;
  return <header className="author-intro" data-author-profile={profile}>
    {author.avatar_media ? <ResponsiveMedia media={author.avatar_media} altOverride="" sizes="96px" /> : <span className="avatar-fallback large" aria-hidden="true">{initials(author.display_name)}</span>}
    <div><p className="eyebrow">Author</p><h1>{author.display_name}</h1>
      {author.designation ? <p className="author-designation">{author.designation}</p> : null}
      {author.bio ? <p>{author.bio}</p> : null}
      {author.expertise.length ? <ul className="expertise-list">{author.expertise.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      {social.length ? <nav aria-label="Author social profiles"><ul className="author-social">{social.map((item) => <li key={item.url}><DestinationLink destination={{ kind: "EXTERNAL", url: item.url, is_external: true }}>{item.label?.trim() || item.platform}</DestinationLink></li>)}</ul></nav> : null}
    </div>
  </header>;
}
