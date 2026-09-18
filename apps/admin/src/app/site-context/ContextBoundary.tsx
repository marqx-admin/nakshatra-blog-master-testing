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
  const query = useAdminQuery<SiteContextData>("API15-S-001", { path: { site_key: siteKey ?? "" } }, Boolean(siteKey));
  if (!siteKey) return <NotFoundState title="Site context missing" />;
  if (query.isLoading) return <LoadingState label="Validating website context" />;
  if (query.error) return <BoundaryFailure error={query.error} retry={() => void query.refetch()} />;
  if (!query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  try { sessionStorage.setItem("bp.lastValidatedSite", query.data.site_key); } catch { /* non-authoritative convenience only */ }
  return <SiteContextValue value={query.data}>{children}</SiteContextValue>;
}

export function GlobalContextBoundary({ children }: PropsWithChildren) {
  const query = useAdminQuery<GlobalContextData>("API15-G-001", {});
  if (query.isLoading) return <LoadingState label="Validating global authority" />;
  if (query.error) return <BoundaryFailure error={query.error} retry={() => void query.refetch()} />;
  if (!query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  return <GlobalContextValue value={query.data}>{children}</GlobalContextValue>;
}
