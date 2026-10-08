import type { ReactNode } from "react";
import type { PublicDestination } from "../lib/types";
import { destinationPath } from "../lib/destination";

export function DestinationLink({ destination, children, className, ariaCurrent }: { destination: PublicDestination; children: ReactNode; className?: string | undefined; ariaCurrent?: "page" | undefined }) {
  const raw = destination.url.trim();
  const external = destination.is_external || destination.kind === "EXTERNAL";
  const safeExternal = /^https?:\/\//i.test(raw);
  const safeSpecial = destination.kind === "MAILTO" ? /^mailto:[^\s@]+@[^\s@]+$/i.test(raw) : destination.kind === "TEL" ? /^tel:\+?[0-9()\-\s]+$/i.test(raw) : false;
  if ((external && !safeExternal) || ((destination.kind === "MAILTO" || destination.kind === "TEL") && !safeSpecial) || (!external && !safeSpecial && !raw.startsWith("/") && !safeExternal)) {
    return <span className={className}>{children}</span>;
  }
  const externalProps = external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
  const href = external || safeSpecial ? raw : destinationPath(destination);
  return <a href={href} className={className} aria-current={ariaCurrent} {...externalProps}>{children}</a>;
}
