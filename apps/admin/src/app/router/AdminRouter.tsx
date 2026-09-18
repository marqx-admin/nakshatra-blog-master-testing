import { useEffect, useState, type FormEvent, type PropsWithChildren, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthFlowProvider } from "../auth/AuthFlowContext";
import { DirtyStateProvider } from "../site-context/DirtyStateContext";
import { GlobalContextBoundary, SiteContextBoundary } from "../site-context/ContextBoundary";
import { AdminShell } from "../../ui/AdminShell";
import { useAdminTransport } from "../query-client/AdminApiProvider";
import { classifyResponse } from "../query-client/apiState";
import { Alert, Button, ErrorState, SelectField } from "../../ui/components";
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
  AdminUsersListPage, InviteAdminPage, AdminUserDetailPage, RolesListPage, CreateRolePage, RoleDetailPage,
  PermissionRegistryPage, AuditLogPage, AuditDetailPage, PlatformSettingsPage,
} from "../../modules/global/GlobalPages";

function OperationalShell({ scope, children }: PropsWithChildren<{ scope:"SITE"|"GLOBAL" }>) {
  const boundary = scope === "SITE" ? <SiteContextBoundary><AdminShell>{children}</AdminShell></SiteContextBoundary> : <GlobalContextBoundary><AdminShell>{children}</AdminShell></GlobalContextBoundary>;
  return <DirtyStateProvider>{boundary}</DirtyStateProvider>;
}

function SiteRoute({ children }: { children:ReactNode }) { return <OperationalShell scope="SITE">{children}</OperationalShell>; }
function GlobalRoute({ children }: { children:ReactNode }) { return <OperationalShell scope="GLOBAL">{children}</OperationalShell>; }

function LandingPage() {
  const transport=useAdminTransport(); const navigate=useNavigate();
  const [state,setState]=useState<"loading"|"choose"|"error">("loading");
  const [siteKey,setSiteKey]=useState("");
  const [sites,setSites]=useState<Array<{site_key:string;display_name:string;lifecycle_state:string}>>([]);
  const [message,setMessage]=useState<string>(); const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true; void (async()=>{try{
    const global=await transport.request<{effective_permissions:string[]}>("API15-G-001",{});
    if(!active)return;
    const globalFailure=classifyResponse(global);
    if(!globalFailure&&global.data.effective_permissions.includes("network_dashboard.view")){navigate("/global/network",{replace:true});return;}
    if(globalFailure?.uiState==="UNAUTHENTICATED"){navigate("/login",{replace:true});return;}
    const selectable=await transport.request<{items:Array<{site_key:string;display_name:string;lifecycle_state:string}>}>("API15-AUTH-012",{});
    if(!active)return;
    const failure=classifyResponse(selectable);
    if(failure?.uiState==="UNAUTHENTICATED"){navigate("/login",{replace:true});return;}
    if(failure){setState("error");return;}
    setSites(selectable.data.items);
    const remembered=sessionStorage.getItem("bp.lastValidatedSite");
    const initial=selectable.data.items.find(item=>item.site_key===remembered)?.site_key ?? (selectable.data.items.length===1?selectable.data.items[0]!.site_key:"");
    setSiteKey(initial);
    setState("choose");
  }catch{if(active)setState("error")}})();return()=>{active=false}},[navigate,transport]);
  async function choose(e:FormEvent){e.preventDefault();setBusy(true);setMessage(undefined);try{const target=siteKey.trim().toUpperCase();if(!sites.some(item=>item.site_key===target)){setMessage("Choose a website returned for this authenticated account.");return;}const response=await transport.request<{site_key:string}>("API15-S-001",{path:{site_key:target}});const failure=classifyResponse(response);if(failure){if(failure.uiState==="UNAUTHENTICATED"){navigate("/login",{replace:true});return;}setMessage("That site context is not available to this account.");return;}navigate(`/site/${encodeURIComponent(response.data.site_key)}/dashboard`,{replace:true})}finally{setBusy(false)}}
  if(state==="loading") return <main className="bp-centered-state"><div aria-hidden="true">✦</div><h1>Opening Central Admin</h1><p>Validating the current server-authoritative workspace.</p></main>;
  if(state==="error") return <ErrorState onRetry={()=>window.location.reload()}/>;
  return <main className="bp-access-layout"><section className="bp-auth-card"><div className="bp-auth-brand"><span className="bp-brand-mark" aria-hidden="true">✦</span><strong>Nakshatra Central Admin</strong></div><h1>Open a site workspace</h1><p>Only ACTIVE sites this authenticated account may attempt to enter are listed. The selection is working context only and never grants authority.</p><Alert tone="info">The server revalidates assignment, permission and target ownership with API15-S-001 before the site workspace opens.</Alert><form className="bp-form-stack" onSubmit={choose}>{message?<Alert tone="danger">{message}</Alert>:null}<SelectField label="Website" value={siteKey} onChange={e=>setSiteKey(e.target.value)} required><option value="">Choose a website</option>{sites.map(site=><option key={site.site_key} value={site.site_key}>{site.display_name} · {site.site_key}</option>)}</SelectField><Button variant="primary" type="submit" loading={busy} disabled={sites.length===0}>Validate and open</Button></form></section></main>;
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
    <Route path="/site/:siteKey/categories" element={<SiteRoute><EntityListPage kind="category"/></SiteRoute>}/><Route path="/site/:siteKey/categories/:categoryId" element={<SiteRoute><EntityEditorPage kind="category"/></SiteRoute>}/>
    <Route path="/site/:siteKey/tags" element={<SiteRoute><EntityListPage kind="tag"/></SiteRoute>}/><Route path="/site/:siteKey/tags/:tagId" element={<SiteRoute><EntityEditorPage kind="tag"/></SiteRoute>}/>
    <Route path="/site/:siteKey/authors" element={<SiteRoute><EntityListPage kind="author"/></SiteRoute>}/><Route path="/site/:siteKey/authors/:authorId" element={<SiteRoute><EntityEditorPage kind="author"/></SiteRoute>}/>
    <Route path="/site/:siteKey/media" element={<SiteRoute><MediaLibraryPage/></SiteRoute>}/><Route path="/site/:siteKey/media/:mediaId" element={<SiteRoute><MediaDetailPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/navigation" element={<SiteRoute><NavigationPage/></SiteRoute>}/><Route path="/site/:siteKey/seo" element={<SiteRoute><SeoPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/redirects" element={<SiteRoute><RedirectsListPage/></SiteRoute>}/><Route path="/site/:siteKey/redirects/:redirectId" element={<SiteRoute><RedirectEditorPage/></SiteRoute>}/>
    <Route path="/site/:siteKey/search" element={<SiteRoute><SearchIndexingPage/></SiteRoute>}/><Route path="/site/:siteKey/calendar" element={<SiteRoute><EditorialCalendarPage/></SiteRoute>}/><Route path="/site/:siteKey/settings" element={<SiteRoute><SiteSettingsPage/></SiteRoute>}/>

    <Route path="/global/network" element={<GlobalRoute><NetworkDashboardPage/></GlobalRoute>}/><Route path="/global/network/posts" element={<GlobalRoute><GlobalPostsPage/></GlobalRoute>}/>
    <Route path="/global/sites" element={<GlobalRoute><SitesRegistryPage/></GlobalRoute>}/><Route path="/global/sites/new" element={<GlobalRoute><CreateSitePage/></GlobalRoute>}/><Route path="/global/sites/:targetSiteKey/domains" element={<GlobalRoute><DomainManagementPage/></GlobalRoute>}/><Route path="/global/sites/:targetSiteKey" element={<GlobalRoute><SiteDetailPage/></GlobalRoute>}/>
    <Route path="/global/users" element={<GlobalRoute><AdminUsersListPage/></GlobalRoute>}/><Route path="/global/users/invite" element={<GlobalRoute><InviteAdminPage/></GlobalRoute>}/><Route path="/global/users/:adminUserId" element={<GlobalRoute><AdminUserDetailPage/></GlobalRoute>}/>
    <Route path="/global/roles" element={<GlobalRoute><RolesListPage/></GlobalRoute>}/><Route path="/global/roles/new" element={<GlobalRoute><CreateRolePage/></GlobalRoute>}/><Route path="/global/roles/:roleId" element={<GlobalRoute><RoleDetailPage/></GlobalRoute>}/>
    <Route path="/global/permissions" element={<GlobalRoute><PermissionRegistryPage/></GlobalRoute>}/><Route path="/global/audit" element={<GlobalRoute><AuditLogPage/></GlobalRoute>}/><Route path="/global/audit/:auditId" element={<GlobalRoute><AuditDetailPage/></GlobalRoute>}/><Route path="/global/platform-settings" element={<GlobalRoute><PlatformSettingsPage/></GlobalRoute>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthFlowProvider></BrowserRouter>;
}
