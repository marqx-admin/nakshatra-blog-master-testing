import { useEffect, useRef, useState, type PropsWithChildren, type RefObject } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAdminContext, useEffectivePermissions } from "../app/site-context/AdminContext";
import { globalPrimaryPages, sitePrimaryPages, routeForPage } from "../app/router/pageRegistry";
import { Button } from "./components";
import { useAdminQuery } from "../app/query-client/hooks";
import { asRecords, asRecord } from "../modules/recordUtils";

const moduleSymbols: Record<string, string> = {
  "MOD-S-01":"◇","MOD-S-02":"▤","MOD-S-03":"⌁","MOD-S-04":"#","MOD-S-05":"◉","MOD-S-06":"▧","MOD-S-07":"☰","MOD-S-08":"◎","MOD-S-09":"↗","MOD-S-10":"⌕","MOD-S-11":"□","MOD-S-12":"⚙",
  "MOD-G-01":"◈","MOD-G-02":"◫","MOD-G-03":"♙","MOD-G-04":"♜","MOD-G-05":"≡","MOD-G-06":"⚙","MOD-G-07":"⌘",
};

function primaryHref(pageId: string, siteKey?: string): string {
  if (pageId.startsWith("ADM-S-")) return routeForPage(pageId, { siteKey: siteKey ?? "" });
  return routeForPage(pageId);
}

function Sidebar({ onNavigate, drawerRef }: { onNavigate(): void; drawerRef: RefObject<HTMLElement | null> }) {
  const context = useAdminContext();
  const permissions = useEffectivePermissions();
  const platformSettings = useAdminQuery<Record<string, unknown>>("API15-G-060", {}, context.scope === "GLOBAL" && permissions.includes("platform_settings.view"));
  const siteKey = context.site?.site_key;
  const editorModules = new Set(["MOD-S-01", "MOD-S-02", "MOD-S-06", "MOD-S-11"]);
  const visibleSite = sitePrimaryPages.filter((page) =>
    page.access.every((permission) => permissions.includes(permission)) &&
    (context.site?.access_level !== "CONTENT_EDITOR" || editorModules.has(page.moduleId))
  );
  const hiddenGlobalModules = new Set(["MOD-G-04", "MOD-G-05", "MOD-G-07"]);
  const hasPlatformSettings = asRecords(asRecord(platformSettings.data).settings).length > 0;
  const visibleGlobal = globalPrimaryPages.filter((page) => context.scope === "GLOBAL" && !hiddenGlobalModules.has(page.moduleId) && (page.moduleId !== "MOD-G-06" || hasPlatformSettings) && page.access.every((permission) => permissions.includes(permission)));
  return (
    <aside id="bp-primary-navigation" ref={drawerRef} className="bp-sidebar" aria-label="Central Admin primary navigation" tabIndex={-1}>
      <div className="bp-brand"><span className="bp-brand-mark" aria-hidden="true">✦</span><div><strong>Nakshatra Admin</strong><span>Blogging Platform</span></div></div>
      {context.scope === "SITE" ? <nav className="bp-nav-group" aria-label="Site workspace"><h2>Site workspace</h2><ul className="bp-nav-list">{visibleSite.map((page) => <li key={page.pageId}><NavLink className="bp-nav-link" to={primaryHref(page.pageId, siteKey)} onClick={onNavigate}><span className="bp-nav-symbol" aria-hidden="true">{moduleSymbols[page.moduleId] ?? "•"}</span><span>{page.moduleLabel}</span></NavLink></li>)}</ul></nav> : null}
      {context.scope === "GLOBAL" ? <nav className="bp-nav-group" aria-label="Global workspace"><h2>Global workspace</h2><ul className="bp-nav-list">{visibleGlobal.map((page) => <li key={page.pageId}><NavLink className="bp-nav-link" to={primaryHref(page.pageId)} onClick={onNavigate}><span className="bp-nav-symbol" aria-hidden="true">{moduleSymbols[page.moduleId] ?? "•"}</span><span>{page.moduleLabel}</span></NavLink></li>)}</ul></nav> : null}
    </aside>
  );
}

export function AdminShell({ children }: PropsWithChildren) {
  const [navOpen,setNavOpen] = useState(false);
  const context = useAdminContext();
  const location = useLocation();
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const workspaceLabel = context.scope === "SITE" ? context.site?.display_name ?? "Site workspace" : "Global workspace";
  const securityHref = context.scope === "SITE" && context.site ? `/site/${context.site.site_key}/dashboard` : "/global/network";

  useEffect(() => {
    if (!navOpen) return;
    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLElement>("a,button,[tabindex]:not([tabindex='-1'])")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setNavOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  function closeNavigation() {
    setNavOpen(false);
  }

  return <div className="bp-app" data-nav-open={navOpen ? "true" : "false"}>
    <Sidebar onNavigate={closeNavigation} drawerRef={drawerRef} />
    {navOpen ? <button className="bp-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => { closeNavigation(); menuButtonRef.current?.focus(); }} /> : null}
    <header className="bp-topbar">
      <div className="bp-topbar-left"><button ref={menuButtonRef} type="button" className="bp-icon-button bp-mobile-menu-button" aria-label={navOpen ? "Close navigation" : "Open navigation"} aria-expanded={navOpen} aria-controls="bp-primary-navigation" onClick={() => setNavOpen((value) => !value)}>☰</button><span className="bp-topbar-title">{workspaceLabel}</span></div>
      <div className="bp-topbar-actions">{context.scope === "SITE" ? <Button variant="secondary" onClick={() => navigate(context.site?.access_level === "SUPER_ADMIN" ? "/global/network" : "/")}>{context.site?.access_level === "SUPER_ADMIN" ? "← Back to Global Dashboard" : "← Back to My Websites"}</Button> : null}<Button variant="tertiary" onClick={() => navigate("/security", { state: { returnTo: location.pathname || securityHref } })}>Security</Button><Button variant="tertiary" onClick={() => navigate("/logout")}>Sign out</Button></div>
    </header>
    <main className="bp-main"><div className="bp-content">{children}</div></main>
  </div>;
}
