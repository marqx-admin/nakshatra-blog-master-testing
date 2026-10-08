import { useRef, useState } from "react";
import { DestinationLink } from "../../components/destination-link";
import { isCurrentDestination } from "../../lib/destination";
import type { NavigationItem } from "./navigation-types";

function Entry({ item, requestPath, id }: { item: NavigationItem; requestPath: string; id: string }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return <li className="nav-entry" onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); button.current?.focus(); }
  }}>
    <div className="nav-entry-head">
      <DestinationLink destination={item.destination} ariaCurrent={isCurrentDestination(item.destination, requestPath) ? "page" : undefined}>{item.label}</DestinationLink>
      {item.children.length ? <button ref={button} type="button" className="nav-expand" aria-label={`Show ${item.label} subpages`} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? "−" : "+"}</button> : null}
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
