import type { ReactNode } from "react";
import type { PublicDestination } from "../lib/types";
import { destinationPath } from "../lib/destination";

export function DestinationLink({ destination, children, className, ariaCurrent }: { destination: PublicDestination; children: ReactNode; className?: string | undefined; ariaCurrent?: "page" | undefined }) {
  const externalProps = destination.is_external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
  const href = destination.is_external || destination.kind === "MAILTO" || destination.kind === "TEL" ? destination.url : destinationPath(destination);
  return <a href={href} className={className} aria-current={ariaCurrent} {...externalProps}>{children}</a>;
}
