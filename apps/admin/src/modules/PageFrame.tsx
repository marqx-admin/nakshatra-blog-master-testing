import type { PropsWithChildren, ReactNode } from "react";
import { useAdminContext, useEffectivePermissions } from "../app/site-context/AdminContext";
import { pageById, hasAllPermissions, primaryPages, routeForPage } from "../app/router/pageRegistry";
import { Breadcrumbs, DeniedState, PageHeader } from "../ui/components";

export function PageFrame({ pageId, context, actions, back, required, children }: PropsWithChildren<{ pageId:string; context?:string; actions?:ReactNode; back?:ReactNode; required?:readonly string[] }>) {
  const page = pageById(pageId);
  const executionContext = useAdminContext();
  const permissions = useEffectivePermissions();
  const need = required ?? page.access;
  if (!hasAllPermissions(permissions, need)) return <DeniedState />;

  const modulePrimary = primaryPages.find((candidate) => candidate.moduleId === page.moduleId && candidate.scope === page.scope);
  const siteKey = executionContext.site?.site_key;
  const workspaceHref = page.scope === "SITE" && siteKey ? routeForPage("ADM-S-DASH-01", { siteKey }) : routeForPage("ADM-G-NET-01");
  const moduleHref = modulePrimary
    ? modulePrimary.scope === "SITE" && siteKey ? routeForPage(modulePrimary.pageId, { siteKey }) : routeForPage(modulePrimary.pageId)
    : workspaceHref;
  const breadcrumbItems = [
    { label: page.scope === "SITE" ? "Site workspace" : "Global workspace", href: workspaceHref },
    ...(modulePrimary && modulePrimary.pageId !== page.pageId ? [{ label: modulePrimary.moduleLabel, href: moduleHref }] : []),
    { label: page.label },
  ];

  return <>
    <Breadcrumbs items={breadcrumbItems} />
    <PageHeader
      title={page.label}
      pageId={page.pageId}
      scope={page.scope}
      {...(context !== undefined ? { context } : {})}
      actions={actions}
      back={back}
    />
    {children}
  </>;
}
