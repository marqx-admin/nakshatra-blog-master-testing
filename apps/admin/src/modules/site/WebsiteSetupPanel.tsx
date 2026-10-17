import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { components } from "@bp/api-contract";
import { useAdminMutation, useAdminQuery } from "../../app/query-client/hooks";
import { useAdminContext, useEffectivePermissions } from "../../app/site-context/AdminContext";
import { Alert, Button } from "../../ui/components";

type Readiness = components["schemas"]["WebsiteSetupReadiness"];
type Handoff = components["schemas"]["PreviewHandoffResponse"];
const REQUIRED = ["site_settings.view", "posts.view", "navigation.view", "media.view"];

export function WebsiteSetupPanel() {
  const site = useAdminContext().site!;
  const permissions = useEffectivePermissions();
  const enabled = REQUIRED.every(permission => permissions.includes(permission));
  const query = useAdminQuery<Readiness>("API15-S-099", { path: { site_key: site.site_key } }, enabled);
  const global = useAdminQuery<{effective_permissions:string[]}>("API15-G-001", {}, permissions.includes("site_settings.view"));
  const preview = useAdminMutation<Handoff>("API15-S-098");
  const currentSite = useRef(site.site_key); currentSite.current = site.site_key;
  const [handoff, setHandoff] = useState<(Handoff & { site_key: string }) | null>(null);
  useEffect(() => { setHandoff(null); preview.reset(); }, [site.site_key]);
  async function preparePreview() {
    const key = site.site_key;
    setHandoff(null);
    try {
      const result = await preview.mutateAsync({ path: { site_key: key } });
      if (currentSite.current === key) setHandoff({...result,site_key:key});
    } catch { /* Do not assume a grant exists after a failed request. */ }
  }
  const readiness = query.data && Array.isArray(query.data.checks) ? query.data : null;
  const workspace = `/site/${encodeURIComponent(site.site_key)}`;
  return <section className="bp-card" aria-label="Website setup and readiness">
    <h2>Website setup and readiness</h2>
    <p>Lifecycle: <strong>{site.lifecycle_state}</strong>. Provisioned, Content Ready and Launch Ready are assessments, not lifecycle changes.</p>
    <nav className="bp-form-actions" aria-label="Website setup tools">
      {[["settings", "Branding, logo and favicon", "site_settings.view"], ["appearance", "Appearance and information pages", "site_settings.view"],
        ["navigation", "Homepage content", "navigation.view"], ["navigation", "Header and Footer", "navigation.view"],
        ["posts", "Articles", "posts.view"], ["categories", "Categories", "categories.view"], ["authors", "Authors", "authors.view"],
        ["media", "Media", "media.view"], ["seo", "SEO settings", "seo.view"]].map(([path,label,permission]) => permissions.includes(permission!) ? <Link key={`${path}-${label}`} to={`${workspace}/${path}`}>{label}</Link> : null)}
      {global.data?.effective_permissions?.includes("sites.edit") ? <Link to={`/global/sites/${encodeURIComponent(site.site_key)}`}>Website identity and domain management</Link> : null}
    </nav>
    {enabled ? <>
      <div className="bp-form-actions"><Button type="button" onClick={() => void preparePreview()} loading={preview.isPending}>Prepare private website preview</Button><Button type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>Refresh readiness</Button></div>
      <p>Preview uses saved appearance and eligible saved content, including an authorized disabled website. Information-page drafts remain in their editors; article working-copy preview remains in the post editor.</p>
      {handoff?.site_key === site.site_key ? <p><a className="bp-button bp-button--secondary" href={handoff.preview_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open private website preview</a> One-time link expires {handoff.expires_at}. The preview ends when its Admin session or permissions expire.</p> : null}
      {preview.isError ? <Alert tone="danger">Private preview could not be prepared. No public access was enabled.</Alert> : null}
      {query.isLoading ? <p role="status">Loading readiness…</p> : query.isError ? <Alert tone="warning">Readiness is unavailable. No launch readiness is assumed.</Alert> : readiness ? <>
        <dl><dt>Provisioned</dt><dd>{readiness.provisioned ? "Yes" : "Needs attention"}</dd><dt>Content Ready</dt><dd>{readiness.content_ready ? "Yes" : "Needs review"}</dd><dt>Launch Ready</dt><dd>{readiness.launch_ready ? "Yes" : "Not established"}</dd></dl>
        <ul>{readiness.checks.map(check => <li key={check.key}><strong>{check.key.replaceAll("_", " ")}: {check.status.replaceAll("_", " ")}</strong><p>{check.detail}</p></li>)}</ul>
      </> : null}
    </> : <p>Whole-site preview/readiness requires Settings, Articles, Navigation and Media viewing permissions. Existing editor tools remain governed by their own permissions.</p>}
  </section>;
}
