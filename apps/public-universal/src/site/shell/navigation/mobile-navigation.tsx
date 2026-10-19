import { useContext, useEffect, useRef, useState } from "react";
import { ResolvedAppearanceContext, StandardRecipeContext } from "../../lib/design-context";
import type { NavigationItem } from "./navigation-types";
import { NavigationTree } from "./navigation-tree";
import { useSiteMessages } from "../../lib/site-locale";
import { routeAwareHref } from "../../dev-preview/route-path";

export function MobileNavigation({ items, requestPath }: { items: NavigationItem[]; requestPath: string }) {
  const messages = useSiteMessages();
  const searchHref = routeAwareHref(requestPath, "search", "/search");
  const reference = useContext(StandardRecipeContext);
  const enhanced = useContext(ResolvedAppearanceContext);
  const standard = reference || enhanced;
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const panelId = "universal-mobile-navigation";

  useEffect(() => {
    if (panel.current?.contains(document.activeElement)) button.current?.focus();
    setOpen(false);
  }, [requestPath, items.length]);

  useEffect(() => {
    if (!standard || !open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [standard, open]);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); button.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) {
        if (panel.current?.contains(document.activeElement)) button.current?.focus();
        setOpen(false);
      }
    };
    const onResize = () => {
      if (panel.current?.contains(document.activeElement)) {
        const target = button.current?.getClientRects().length ? button.current : wrapper.current?.closest("header")?.querySelector<HTMLAnchorElement>(".header-search");
        (target ?? button.current)?.focus();
      }
      setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  if (!items.length) return null;
  return <div ref={wrapper} className="mobile-navigation" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={button} type="button" className="menu-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => {
      if (open) button.current?.focus();
      setOpen(!open);
    }}>{messages.menu}</button>
    <div id={panelId} ref={panel} className="mobile-nav-panel" role={standard ? "region" : undefined} aria-label={standard ? messages.siteNavigation : undefined} hidden={!open} onClick={(event) => {
      if ((event.target as Element).closest("a")) { button.current?.focus(); setOpen(false); }
    }}>
      {standard ? <button type="button" className="menu-close" onClick={() => { button.current?.focus(); setOpen(false); }}>{messages.closeNavigation}</button> : null}
      <nav aria-label={messages.mobilePrimaryNavigation}>
      <NavigationTree key={String(open)} items={items} requestPath={requestPath} idPrefix="mobile-children" />
      <a className="mobile-search-link" href={searchHref} aria-current={requestPath === searchHref ? "page" : undefined}>{messages.searchThisWebsite}</a>
    </nav></div>
  </div>;
}
