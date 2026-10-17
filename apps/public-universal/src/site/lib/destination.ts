import type { PublicDestination } from "./types";

export function destinationPath(destination: PublicDestination): string {
  try {
    const url = new URL(destination.url);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return destination.url.trim();
  }
}

export function isCurrentDestination(destination: PublicDestination, requestPath: string): boolean {
  if (destination.is_external || ["EXTERNAL", "MAILTO", "TEL"].includes(destination.kind) || !destinationHref(destination)) return false;
  const path = destinationPath(destination).split(/[?#]/)[0] || "/";
  const current = requestPath.split(/[?#]/)[0] || "/";
  return path === current;
}

export function destinationHref(destination: PublicDestination): string | undefined {
  const raw = destination.url.trim();
  if (destination.kind === "MAILTO") return /^mailto:[^\s@]+@[^\s@]+$/i.test(raw) && !/[\u0000-\u001f\u007f]/.test(raw) ? raw : undefined;
  if (destination.kind === "TEL") return /^tel:\+?[0-9()\-\s]+$/i.test(raw) && !/[\u0000-\u001f\u007f]/.test(raw) ? raw : undefined;
  // Backslashes and network-path references can turn an apparent local path into a different host.
  if (/[\u0000-\u0020\u007f\\]/.test(raw) || raw.startsWith("//")) return undefined;
  const external = destination.is_external || destination.kind === "EXTERNAL";
  if (!external && raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
    const path = destinationPath(destination);
    return external ? raw : path.startsWith("//") ? undefined : path;
  } catch { return undefined; }
}
