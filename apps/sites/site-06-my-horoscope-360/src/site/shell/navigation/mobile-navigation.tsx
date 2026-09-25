"use client";

import { useEffect, useRef, useState } from "react";
import type { NavigationItem } from "./navigation-types";
import { DestinationLink } from "../../components/destination-link";
import { destinationPath, isCurrentDestination } from "../../lib/destination";

export function MobileNavigation({ items, requestPath, searchDestination }: { items: NavigationItem[]; requestPath: string; searchDestination?: NavigationItem["destination"] | undefined }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const panelId = "site-mobile-navigation";

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="mobile-nav" data-component-id="CMP12-SHELL-MOBILE-NAV">
      <button ref={buttonRef} type="button" className="menu-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>Menu</button>
      {open ? (
        <div id={panelId} className="mobile-nav-panel">
          <nav aria-label="Primary navigation">
            <ul>
              {items.map((item, index) => (
                <li key={`${item.label}-${item.destination.url}`}>
                  <a ref={index === 0 ? firstLinkRef : undefined} href={item.destination.is_external || item.destination.kind === "MAILTO" || item.destination.kind === "TEL" ? item.destination.url : destinationPath(item.destination)} aria-current={isCurrentDestination(item.destination, requestPath) ? "page" : undefined}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          {searchDestination ? <DestinationLink destination={searchDestination} className="mobile-search-link">Search</DestinationLink> : null}
        </div>
      ) : null}
    </div>
  );
}
