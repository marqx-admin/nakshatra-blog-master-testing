import type { ReactNode } from "react";
import { AdminRequestError } from "../app/query-client/apiState";
import { ConflictPanel, DeniedState, EmptyState, ErrorState, LoadingState, NotFoundState } from "../ui/components";

export function QueryState({ isLoading, error, hasData, retry, empty, children }: { isLoading:boolean; error:unknown; hasData:boolean; retry():void; empty?:ReactNode; children:ReactNode }) {
  if(isLoading) return <LoadingState label="Loading page data"/>;
  if(error instanceof AdminRequestError){
    if(error.failure.uiState==="UNAUTHENTICATED") { window.location.assign("/session-expired"); return null; }
    if(error.failure.uiState==="DENIED") return <DeniedState/>;
    if(error.failure.uiState==="NOT_FOUND") return <NotFoundState/>;
    if(error.failure.uiState==="CONFLICT") return <ConflictPanel onReload={retry}/>;
  }
  if(error) return <ErrorState onRetry={retry}/>;
  if(!hasData) return <>{empty??<EmptyState/>}</>;
  return <>{children}</>;
}
