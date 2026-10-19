export function isDevelopmentPreviewPath(requestPath: string): boolean {
  return requestPath.split(/[?#]/, 1)[0] === "/dev-preview";
}

export function previewPageHref(page: string): string {
  return `/dev-preview?page=${page}`;
}

export function routeAwareHref(requestPath: string, page: string, publicHref: string): string {
  return isDevelopmentPreviewPath(requestPath) ? previewPageHref(page) : publicHref;
}
