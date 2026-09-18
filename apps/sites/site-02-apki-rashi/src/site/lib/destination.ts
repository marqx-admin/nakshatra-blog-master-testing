import type { PublicDestination } from "./types";

export function destinationPath(destination: PublicDestination): string {
  try {
    const url = new URL(destination.url);
    return `${url.pathname}${url.search}`;
  } catch {
    return destination.url;
  }
}

export function isCurrentDestination(destination: PublicDestination, requestPath: string): boolean {
  const path = destinationPath(destination).split("?")[0] || "/";
  const current = requestPath.split("?")[0] || "/";
  return path === current;
}
