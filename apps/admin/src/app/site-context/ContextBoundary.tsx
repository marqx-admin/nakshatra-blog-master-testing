import { Navigate, useLocation, useParams } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAdminQuery } from "../query-client/hooks";
import { AdminRequestError } from "../query-client/apiState";
import { GlobalContextValue, SiteContextValue, type GlobalContextData, type SiteContextData } from "./AdminContext";
import { DeniedState, ErrorState, LoadingState, NotFoundState } from "../../ui/components";

function BoundaryFailure({ error, retry }: { error: unknown; retry(): void }) {
  if (error instanceof AdminRequestError) {
    if (error.failure.uiState === "UNAUTHENTICATED") return <Navigate to="/session-expired" replace />;
    if (error.failure.uiState === "DENIED") return <DeniedState />;
    if (error.failure.uiState === "NOT_FOUND") return <NotFoundState />;
  }
  return <ErrorState onRetry={retry} />;
}

export function SiteContextBoundary({ children }: PropsWithChildren) {
  const { siteKey } = useParams();
  const location = useLocation();
  const query = useAdminQuery<Omit<SiteContextData,"access_level">>("API15-S-001", { path: { site_key: siteKey ?? "" } }, Boolean(siteKey));
  if (!siteKey) return <NotFoundState title="Site context missing" />;
  if (query.isLoading) return <LoadingState label="Validating website context" />;
  if (query.error) return <BoundaryFailure error={query.error} retry={() => void query.refetch()} />;
  if (!query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  try { sessionStorage.setItem("bp.lastValidatedSite", query.data.site_key); } catch { /* non-authoritative convenience only */ }
  const effective=new Set(query.data.effective_permissions);
  const access_level:SiteContextData["access_level"]=effective.has("tags.view")
    ? "SUPER_ADMIN"
    : effective.has("posts.delete")&&effective.has("site_settings.edit")
      ? "FULL_WEBSITE_MANAGER"
      : "CONTENT_EDITOR";
  return <SiteContextValue value={{...query.data,access_level}}>{children}</SiteContextValue>;
}

export function GlobalContextBoundary({ children }: PropsWithChildren) {
  const query = useAdminQuery<GlobalContextData>("API15-G-001", {});
  if (query.isLoading) return <LoadingState label="Validating global authority" />;
  if (query.error) return <BoundaryFailure error={query.error} retry={() => void query.refetch()} />;
  if (!query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  return <GlobalContextValue value={query.data}>{children}</GlobalContextValue>;
}
