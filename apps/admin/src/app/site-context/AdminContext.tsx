import { createContext, useContext, type PropsWithChildren } from "react";
import type { components } from "@bp/api-contract";

export type SiteContextData = Omit<components["schemas"]["AdminSiteContext"], "effective_permissions"> & {
  effective_permissions: string[];
  timezone_id?: string;
};
export interface GlobalContextData { effective_permissions: string[] }

interface ContextValue {
  scope: "SITE" | "GLOBAL";
  site?: SiteContextData;
  global?: GlobalContextData;
}
const AdminContext = createContext<ContextValue | null>(null);

export function SiteContextValue({ value, children }: PropsWithChildren<{ value: SiteContextData }>) {
  return <AdminContext.Provider value={{ scope: "SITE", site: value }}>{children}</AdminContext.Provider>;
}
export function GlobalContextValue({ value, children }: PropsWithChildren<{ value: GlobalContextData }>) {
  return <AdminContext.Provider value={{ scope: "GLOBAL", global: value }}>{children}</AdminContext.Provider>;
}
export function useAdminContext(): ContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("Admin execution context is required");
  return value;
}
export function useEffectivePermissions(): readonly string[] {
  const value = useAdminContext();
  return value.scope === "SITE" ? value.site?.effective_permissions ?? [] : value.global?.effective_permissions ?? [];
}
