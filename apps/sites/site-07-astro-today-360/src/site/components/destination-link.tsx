import type { ReactNode } from "react";
import type { PublicDestination } from "../lib/types";

export function DestinationLink({ destination, children, className, ariaCurrent }: { destination: PublicDestination; children: ReactNode; className?: string | undefined; ariaCurrent?: "page" | undefined }) {
  const externalProps = destination.is_external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
  return <a href={destination.url} className={className} aria-current={ariaCurrent} {...externalProps}>{children}</a>;
}
