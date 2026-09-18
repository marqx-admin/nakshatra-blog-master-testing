import type { AdminResponse } from "./adminTransport";

export type ApiUiState =
  | "READY"
  | "UNAUTHENTICATED"
  | "DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "ERROR_RETRY";

export interface ApiFailure {
  uiState: Exclude<ApiUiState, "READY">;
  status: number;
  code?: string;
  requestId?: string;
  fieldErrors?: readonly { field?: string; message?: string }[];
}

function objectData(data: unknown): Record<string, unknown> | undefined {
  return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : undefined;
}

export function classifyResponse(response: AdminResponse): ApiFailure | undefined {
  if (response.status >= 200 && response.status < 300) return undefined;
  const data = objectData(response.data);
  const envelope = objectData(data?.error) ?? data;
  const code = typeof envelope?.code === "string" ? envelope.code : undefined;
  const rawFieldErrors = Array.isArray(envelope?.details) ? envelope.details : envelope?.field_errors;
  const fieldErrors = Array.isArray(rawFieldErrors)
    ? rawFieldErrors.filter((item): item is { field?: string; message?: string } => Boolean(item && typeof item === "object"))
    : undefined;
  const requestId = response.headers.get("X-Request-ID") ?? undefined;
  const details = {
    ...(code !== undefined ? { code } : {}),
    ...(requestId !== undefined ? { requestId } : {}),
    ...(fieldErrors !== undefined ? { fieldErrors } : {}),
  };
  if (response.status === 401) return { uiState: "UNAUTHENTICATED", status: 401, ...details };
  if (response.status === 403) return { uiState: "DENIED", status: 403, ...details };
  if (response.status === 404) return { uiState: "NOT_FOUND", status: 404, ...details };
  if (response.status === 409) return { uiState: "CONFLICT", status: 409, ...details };
  if (response.status === 422) return { uiState: "VALIDATION", status: 422, ...details };
  if (response.status === 429) return { uiState: "RATE_LIMITED", status: 429, ...details };
  return { uiState: "ERROR_RETRY", status: response.status, ...details };
}

export class AdminRequestError extends Error {
  readonly failure: ApiFailure;
  constructor(failure: ApiFailure) {
    super(`Admin request failed with ${failure.status}${failure.code ? ` (${failure.code})` : ""}`);
    this.failure = failure;
  }
}

export function requireSuccess<T>(response: AdminResponse<T>): T {
  const failure = classifyResponse(response);
  if (failure) throw new AdminRequestError(failure);
  return response.data;
}
