import type { ReactNode } from "react";
import type { PublicDestination } from "../lib/types";
import { destinationHref } from "../lib/destination";

export function DestinationLink({ destination, children, className, ariaCurrent }: { destination: PublicDestination; children: ReactNode; className?: string | undefined; ariaCurrent?: "page" | undefined }) {
  const href = destinationHref(destination);
  const external = destination.is_external || destination.kind === "EXTERNAL";
  if (!href) {
    return <span className={className}>{children}</span>;
  }
  const externalProps = external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
  return <a href={href} className={className} aria-current={ariaCurrent} {...externalProps}>{children}</a>;
}
