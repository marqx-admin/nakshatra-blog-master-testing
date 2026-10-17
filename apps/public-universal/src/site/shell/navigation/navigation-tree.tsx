import { useEffect, useRef, useState } from "react";
import { DestinationLink } from "../../components/destination-link";
import { isCurrentDestination } from "../../lib/destination";
import type { NavigationItem } from "./navigation-types";

function hasCurrentDescendant(items: NavigationItem[], requestPath: string): boolean {
  return items.some((item) => isCurrentDestination(item.destination, requestPath) || hasCurrentDescendant(item.children, requestPath));
}

function Entry({ item, requestPath, id }: { item: NavigationItem; requestPath: string; id: string }) {
  const descendantCurrent = hasCurrentDescendant(item.children, requestPath);
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const entry = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (entry.current?.querySelector(".nav-children")?.contains(document.activeElement)) button.current?.focus();
    setOpen(false);
  }, [requestPath]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!entry.current?.contains(event.target as Node)) {
        if (entry.current?.contains(document.activeElement)) button.current?.focus();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return <li ref={entry} className="nav-entry" data-current-branch={descendantCurrent || undefined} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }} onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); button.current?.focus(); }
  }}>
    <div className="nav-entry-head">
      <DestinationLink destination={item.destination} ariaCurrent={isCurrentDestination(item.destination, requestPath) ? "page" : undefined}>{item.label}</DestinationLink>
      {item.children.length ? <button ref={button} type="button" className="nav-expand" aria-label={`${open ? "Hide" : "Show"} ${item.label} subpages`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? "−" : "+"}</button> : null}
    </div>
    {item.children.length ? <ul id={id} className="nav-children" hidden={!open}>{item.children.map((child, index) =>
      <Entry key={`${child.label}-${index}`} item={child} requestPath={requestPath} id={`${id}-${index}`} />,
    )}</ul> : null}
  </li>;
}

export function NavigationTree({ items, requestPath, idPrefix }: { items: NavigationItem[]; requestPath: string; idPrefix: string }) {
  return <ul className="navigation-list">{items.map((item, index) =>
    <Entry key={`${item.label}-${index}`} item={item} requestPath={requestPath} id={`${idPrefix}-${index}`} />,
  )}</ul>;
}
