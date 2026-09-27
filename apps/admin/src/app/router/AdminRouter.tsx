import { useEffect, useState, type PropsWithChildren, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthFlowProvider } from "../auth/AuthFlowContext";
import { DirtyStateProvider } from "../site-context/DirtyStateContext";
import { GlobalContextBoundary, SiteContextBoundary } from "../site-context/ContextBoundary";
import { useAdminContext } from "../site-context/AdminContext";
import { AccountShell, AdminShell } from "../../ui/AdminShell";
import { useAdminTransport } from "../query-client/AdminApiProvider";
import { classifyResponse } from "../query-client/apiState";
import { DeniedState, ErrorState, PageHeader } from "../../ui/components";
import {
  AccessDeniedPage, InvitationSetupPage, LoginPage, LogoutPage, MfaEnrollmentPage, MfaPage, PasswordChangePage,
  PasswordResetCompletePage, PasswordResetRequestPage, SecurityPage, SessionExpiredPage, StepUpPage,
} from "../../access-surfaces/AccessSurfaces";
import {
  SiteDashboardPage, PostsListPage, RevisionHistoryPage, EntityListPage, EntityEditorPage, MediaLibraryPage,
  MediaDetailPage, NavigationPage, SeoPage, RedirectsListPage, RedirectEditorPage, SearchIndexingPage,
  EditorialCalendarPage, SiteSettingsPage,
} from "../../modules/site/SitePages";
import { PostEditorPage } from "../../modules/site/PostEditor";
import {
  NetworkDashboardPage, GlobalPostsPage, SitesRegistryPage, CreateSitePage, SiteDetailPage, DomainManagementPage,
  AdminUsersListPage, CreateAdminUserPage, AdminUserDetailPage, RolesListPage, CreateRolePage, RoleDetailPage,
  PermissionRegistryPage, AuditLogPage, AuditDetailPage, PlatformSettingsPage, WebsiteDashboardOverview,
} from "../../modules/global/GlobalPages";

function OperationalShell({ scope, children }: PropsWithChildren<{ scope:"SITE"|"GLOBAL" }>) {
  const boundary = scope === "SITE" ? <SiteContextBoundary><AdminShell>{children}</AdminShell></SiteContextBoundary> : <GlobalContextBoundary><AdminShell>{children}</AdminShell></GlobalContextBoundary>;
  return <DirtyStateProvider>{boundary}</DirtyStateProvider>;
}

function SiteAccessGate({ children, managerOnly=false }: { children:ReactNode; managerOnly?:boolean }) {
  const context=useAdminContext();
  if(managerOnly && context.site?.access_level === "CONTENT_EDITOR") return <DeniedState/>;
  return children;
}
function SiteRoute({ children, managerOnly=false }: { children:ReactNode; managerOnly?:boolean }) { return <OperationalShell scope="SITE"><SiteAccessGate managerOnly={managerOnly}>{children}</SiteAccessGate></OperationalShell>; }
function GlobalRoute({ children }: { children:ReactNode }) { return <OperationalShell scope="GLOBAL">{children}</OperationalShell>; }

type SelectableWebsite={site_key:string;display_name:string;lifecycle_state:string};
type AssignedWebsite=SelectableWebsite&{access_level:"CONTENT_EDITOR"|"FULL_WEBSITE_MANAGER"|"SUPER_ADMIN";public_url:string|undefined;blog_count:number;draft_count:number;scheduled_count:number;published_count:number};
type WebsiteSummary={blogs:number;drafts:number;scheduled:number;published:number};
function friendlyAccountName(identifier:string):string {const local=identifier.split("@",1)[0]||"Admin";return local.split(/[._-]+/).filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ")||"Admin"}
function accessLabel(value:AssignedWebsite["access_level"]):string {
  if(value==="FULL_WEBSITE_MANAGER")return "Full Website Manager";
  if(value==="SUPER_ADMIN")return "Super Admin";
  return "Content Editor";
}
function metricValue(metrics:Array<Record<string,unknown>>,keys:string[]):number {
  const normalized=keys.map(key=>key.toLowerCase());
  const match=metrics.find(metric=>{
    const key=String(metric.key??"").toLowerCase();
    const label=String(metric.label??"").toLowerCase();
    return normalized.some(candidate=>key===candidate||key.includes(candidate)||label.includes(candidate));
  });
  const value=Number(match?.value??0);
  return Number.isFinite(value)?value:0;
}

function LandingPage() {
  const transport=useAdminTransport(); const navigate=useNavigate();
  const [state,setState]=useState<"loading"|"ready"|"error">("loading");
  const [sites,setSites]=useState<AssignedWebsite[]>([]);
  const [summary,setSummary]=useState<WebsiteSummary>({blogs:0,drafts:0,scheduled:0,published:0});
  const [accountName,setAccountName]=useState("");
  useEffect(()=>{let active=true; void (async()=>{try{
    const global=await transport.request<{effective_permissions:string[]}>("API15-G-001",{});
    if(!active)return;
    const globalFailure=classifyResponse(global);
    if(!globalFailure&&global.data.effective_permissions.includes("network_dashboard.view")){navigate("/global/network",{replace:true});return;}
    if(globalFailure?.uiState==="UNAUTHENTICATED"){navigate("/login",{replace:true});return;}
    const selectable=await transport.request<{items:SelectableWebsite[]}>("API15-AUTH-012",{});
    if(!active)return;
    const failure=classifyResponse(selectable);
    if(failure?.uiState==="UNAUTHENTICATED"){navigate("/login",{replace:true});return;}
    if(failure){setState("error");return;}
    const resolved=await Promise.all(selectable.data.items.map(async site=>{
      const response=await transport.request<{effective_permissions:string[]}>("API15-S-001",{path:{site_key:site.site_key}});
      const contextFailure=classifyResponse(response);
      if(contextFailure)throw new Error("site context unavailable");
      const effective=new Set(response.data.effective_permissions);
      const access_level:AssignedWebsite["access_level"]=effective.has("tags.view")?"SUPER_ADMIN":effective.has("posts.delete")&&effective.has("site_settings.edit")?"FULL_WEBSITE_MANAGER":"CONTENT_EDITOR";
      const public_url=response.headers.get("X-BP-Public-Url")||undefined;
      const dashboard=await transport.request<{metrics:Array<Record<string,unknown>>}>("API15-S-002",{path:{site_key:site.site_key}});
      const dashboardFailure=classifyResponse(dashboard);
      const metrics=dashboardFailure?[]:dashboard.data.metrics;
      const siteSummary={blogs:metricValue(metrics,["total_posts","total blogs","posts","blogs"]),drafts:metricValue(metrics,["draft_posts","drafts","draft"]),scheduled:metricValue(metrics,["scheduled_posts","scheduled"]),published:metricValue(metrics,["published_posts","published"])};
      return {site:{...site,access_level,public_url,blog_count:siteSummary.blogs,draft_count:siteSummary.drafts,scheduled_count:siteSummary.scheduled,published_count:siteSummary.published},summary:siteSummary};
    }));
    setSites(resolved.map(item=>item.site));
    setSummary(resolved.reduce<WebsiteSummary>((total,item)=>({blogs:total.blogs+item.summary.blogs,drafts:total.drafts+item.summary.drafts,scheduled:total.scheduled+item.summary.scheduled,published:total.published+item.summary.published}),{blogs:0,drafts:0,scheduled:0,published:0}));
    try{setAccountName(friendlyAccountName(sessionStorage.getItem("bp.accountDisplayName")||"Admin"))}catch{setAccountName("Admin")}
    setState("ready");
  }catch{if(active)setState("error")}})();return()=>{active=false}},[navigate,transport]);
  if(state==="loading") return <main className="bp-centered-state"><div aria-hidden="true">✦</div><h1>Opening Central Admin</h1><p>Validating the current server-authoritative workspace.</p></main>;
  if(state==="error") return <ErrorState onRetry={()=>window.location.reload()}/>;
  return <AccountShell><PageHeader title="Dashboard" context={`Welcome, ${accountName}. Your dashboard shows only websites assigned to this account.`}/><WebsiteDashboardOverview siteCount={sites.length} totalBlogs={summary.blogs} drafts={summary.drafts} scheduled={summary.scheduled} published={summary.published} websites={sites.map(site=>({site_key:site.site_key,display_name:site.display_name,lifecycle_state:site.lifecycle_state,blog_count:site.blog_count,draft_count:site.draft_count,scheduled_count:site.scheduled_count,published_count:site.published_count,public_url:site.public_url,access_label:accessLabel(site.access_level)}))}/></AccountShell>;
}

export function AdminRouter() {
  return <BrowserRouter><AuthFlowProvider><Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<LoginPage/>}/><Route path="/logout" element={<LogoutPage/>}/>
    <Route path="/invitation/setup" element={<InvitationSetupPage/>}/>
    <Route path="/password-reset" element={<PasswordResetRequestPage/>}/><Route path="/password-reset/complete" element={<PasswordResetCompletePage/>}/><Route path="/password-change" element={<PasswordChangePage/>}/>
    <Route path="/mfa" element={<MfaPage/>}/><Route path="/mfa/enroll" element={<MfaEnrollmentPage/>}/><Route path="/security" element={<SecurityPage/>}/><Route path="/step-up" element={<StepUpPage/>}/><Route path="/access-denied" element={<AccessDeniedPage/>}/><Route path="/session-expired" element={<SessionExpiredPage/>}/>

    <Route path="/site/:siteKey/dashboard" element={<SiteRoute><SiteDashboardPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/posts" element={<SiteRoute><PostsListPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/posts/new" element={<SiteRoute><PostEditorPage mode="create"/></SiteRoute>}/>
    <Route path="/site/:siteKey/posts/:postId/revisions" element={<SiteRoute><RevisionHistoryPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/posts/:postId" element={<SiteRoute><PostEditorPage mode="edit"/></SiteRoute>}/>
    <Route path="/site/:siteKey/categories" element={<SiteRoute managerOnly><EntityListPage kind="category"/></SiteRoute>}/><Route path="/site/:siteKey/categories/:categoryId" element={<SiteRoute managerOnly><EntityEditorPage kind="category"/></SiteRoute>}/>
    <Route path="/site/:siteKey/tags" element={<SiteRoute managerOnly><EntityListPage kind="tag"/></SiteRoute>}/><Route path="/site/:siteKey/tags/:tagId" element={<SiteRoute managerOnly><EntityEditorPage kind="tag"/></SiteRoute>}/>
    <Route path="/site/:siteKey/authors" element={<SiteRoute managerOnly><EntityListPage kind="author"/></SiteRoute>}/><Route path="/site/:siteKey/authors/:authorId" element={<SiteRoute managerOnly><EntityEditorPage kind="author"/></SiteRoute>}/>
    <Route path="/site/:siteKey/media" element={<SiteRoute><MediaLibraryPage/></SiteRoute>}/><Route path="/site/:siteKey/media/:mediaId" element={<SiteRoute><MediaDetailPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/navigation" element={<SiteRoute managerOnly><NavigationPage/></SiteRoute>}/><Route path="/site/:siteKey/seo" element={<SiteRoute managerOnly><SeoPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/redirects" element={<SiteRoute managerOnly><RedirectsListPage/></SiteRoute>}/><Route path="/site/:siteKey/redirects/:redirectId" element={<SiteRoute managerOnly><RedirectEditorPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/search" element={<SiteRoute managerOnly><SearchIndexingPage/></SiteRoute>}/><Route path="/site/:siteKey/calendar" element={<SiteRoute><EditorialCalendarPage/></SiteRoute>}/><Route path="/site/:siteKey/settings" element={<SiteRoute managerOnly><SiteSettingsPage/></SiteRoute>}/>

    <Route path="/global/network" element={<GlobalRoute><NetworkDashboardPage/></GlobalRoute>}/><Route path="/global/network/posts" element={<GlobalRoute><GlobalPostsPage/></GlobalRoute>}/>
    <Route path="/global/sites" element={<GlobalRoute><SitesRegistryPage/></GlobalRoute>}/><Route path="/global/sites/new" element={<GlobalRoute><CreateSitePage/></GlobalRoute>}/><Route path="/global/sites/:targetSiteKey/domains" element={<GlobalRoute><DomainManagementPage/></GlobalRoute>}/><Route path="/global/sites/:targetSiteKey" element={<GlobalRoute><SiteDetailPage/></GlobalRoute>}/>
    <Route path="/global/users" element={<GlobalRoute><AdminUsersListPage/></GlobalRoute>}/><Route path="/global/users/new" element={<GlobalRoute><CreateAdminUserPage/></GlobalRoute>}/><Route path="/global/users/invite" element={<Navigate to="/global/users/new" replace/>}/><Route path="/global/users/:adminUserId" element={<GlobalRoute><AdminUserDetailPage/></GlobalRoute>}/>
    <Route path="/global/roles" element={<GlobalRoute><RolesListPage/></GlobalRoute>}/><Route path="/global/roles/new" element={<GlobalRoute><CreateRolePage/></GlobalRoute>}/><Route path="/global/roles/:roleId" element={<GlobalRoute><RoleDetailPage/></GlobalRoute>}/>
    <Route path="/global/permissions" element={<GlobalRoute><PermissionRegistryPage/></GlobalRoute>}/><Route path="/global/audit" element={<GlobalRoute><AuditLogPage/></GlobalRoute>}/><Route path="/global/audit/:auditId" element={<GlobalRoute><AuditDetailPage/></GlobalRoute>}/><Route path="/global/platform-settings" element={<GlobalRoute><PlatformSettingsPage/></GlobalRoute>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthFlowProvider></BrowserRouter>;
}
