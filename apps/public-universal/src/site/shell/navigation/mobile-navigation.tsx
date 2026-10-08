import { useEffect, useRef, useState } from "react";
import type { NavigationItem } from "./navigation-types";
import { NavigationTree } from "./navigation-tree";

export function MobileNavigation({ items, requestPath }: { items: NavigationItem[]; requestPath: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = "universal-mobile-navigation";

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); button.current?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <div className="mobile-navigation">
    <button ref={button} type="button" className="menu-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => {
      if (open) button.current?.focus();
      setOpen(!open);
    }}>Menu</button>
    <div id={panelId} ref={panel} className="mobile-nav-panel" hidden={!open}><nav aria-label="Mobile primary navigation">
      <NavigationTree items={items} requestPath={requestPath} idPrefix="mobile-children" />
      <a className="mobile-search-link" href="/search" aria-current={requestPath === "/search" ? "page" : undefined}>Search this site</a>
    </nav></div>
  </div>;
}
