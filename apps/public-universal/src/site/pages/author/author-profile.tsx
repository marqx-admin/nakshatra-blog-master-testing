import type { components } from "@bp/api-contract";
import { ResponsiveMedia } from "../../components/responsive-media";
import { useDesign } from "../../lib/design-context";

export function AuthorProfile({ author }: { author: components["schemas"]["AuthorDetail"] }) {
  const design = useDesign();
  const social = author.social_profiles.filter((profile) => /^https?:\/\//i.test(profile.url));
  const profile = design.authorCard === "AUTH-12" || design.authorCard === "AUTH-11" && !author.expertise.length || design.authorCard === "AUTH-13" && !social.length ? "AUTH-05" : design.authorCard;
  return <header className="author-intro" data-author-profile={profile}>
    {author.avatar_media ? <ResponsiveMedia media={author.avatar_media} /> : <span className="avatar-fallback large" aria-hidden="true">{author.display_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span>}
    <div><p className="eyebrow">Author</p><h1>{author.display_name}</h1>
      {author.designation ? <p className="author-designation">{author.designation}</p> : null}
      {author.bio ? <p>{author.bio}</p> : null}
      {author.expertise.length ? <ul className="expertise-list">{author.expertise.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      {social.length ? <nav aria-label="Author social profiles"><ul className="author-social">{social.map((item) => <li key={item.url}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.label ?? item.platform}</a></li>)}</ul></nav> : null}
    </div>
  </header>;
}
