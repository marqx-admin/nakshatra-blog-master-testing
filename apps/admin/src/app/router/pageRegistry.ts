import rawPages from "./admin-pages.json";
import type { AdminOperationId } from "@bp/api-client-admin";

export type AdminScope = "SITE" | "GLOBAL";
export interface AdminPageDefinition {
  pageId: string;
  scope: AdminScope;
  moduleId: string;
  moduleLabel: string;
  label: string;
  route: string;
  access: readonly string[];
  primary: boolean;
  loadOperation?: AdminOperationId;
}

export const adminPages = rawPages as AdminPageDefinition[];
export const sitePages = adminPages.filter((page) => page.scope === "SITE");
export const globalPages = adminPages.filter((page) => page.scope === "GLOBAL");
export const primaryPages = adminPages.filter((page) => page.primary);
export const sitePrimaryPages = primaryPages.filter((page) => page.scope === "SITE");
export const globalPrimaryPages = primaryPages.filter((page) => page.scope === "GLOBAL");

export function pageById(pageId: string): AdminPageDefinition {
  const page = adminPages.find((candidate) => candidate.pageId === pageId);
  if (!page) throw new Error(`Unknown frozen Admin Page ID: ${pageId}`);
  return page;
}

export function routeForPage(pageId: string, params: Record<string, string> = {}): string {
  const page = pageById(pageId);
  return page.route.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key];
    if (!value) throw new Error(`Missing route parameter ${key} for ${pageId}`);
    return encodeURIComponent(value);
  });
}

export function hasAllPermissions(effective: readonly string[], required: readonly string[]): boolean {
  return required.every((permission) => effective.includes(permission));
}
