import type { PaginationData, PublicDestination } from "./types";
import { destinationHref } from "./destination";

// Some existing projections supply page URLs without q. Keep every supplied page
// parameter, but carry the current query across same-site Search pagination.
export function searchPagination(pagination: PaginationData | undefined, query: string): PaginationData | undefined {
  if (!pagination) return undefined;
  const withQuery = (destination: PublicDestination): PublicDestination => {
    if (destination.is_external || destination.kind === "EXTERNAL") return destination;
    const href = destinationHref(destination);
    if (!href?.startsWith("/")) return destination;
    const url = new URL(href, "https://pagination.invalid");
    if (url.pathname !== "/search" || url.searchParams.has("q")) return destination;
    url.searchParams.set("q", query);
    return { ...destination, url: `${url.pathname}${url.search}${url.hash}` };
  };
  return {
    ...pagination,
    links: pagination.links.map((link) => ({ ...link, destination: withQuery(link.destination) })),
    ...(pagination.previous ? { previous: withQuery(pagination.previous) } : {}),
    ...(pagination.next ? { next: withQuery(pagination.next) } : {}),
  };
}
