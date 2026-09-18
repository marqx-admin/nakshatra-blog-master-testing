import { createAdminApiClient } from "@bp/api-client-admin";
import type { AdminOperationId } from "@bp/api-client-admin";

export interface AdminRequestInput {
  path?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | readonly string[] | undefined>;
  header?: Record<string, string | number | undefined>;
  body?: unknown;
}

export interface AdminResponse<T = unknown> {
  status: number;
  data: T;
  headers: Headers;
}

export interface AdminTransport {
  request<T = unknown>(operationId: AdminOperationId, input?: AdminRequestInput, signal?: AbortSignal): Promise<AdminResponse<T>>;
}

const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

function browserBaseUrl(): string {
  const configured = import.meta.env.VITE_ADMIN_API_BASE_URL as string | undefined;
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://example.invalid";
}

/**
 * Security overlay required by DOC-19. The generated RC8 client remains the only
 * HTTP path/method/schema authority; this wrapper only adds browser credentials
 * and the current CSRF proof immediately before unsafe requests.
 */
function securityAwareFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const requestInit: RequestInit = { ...init, credentials: "include" };
  const method = String(requestInit.method ?? "GET").toUpperCase();
  const headers = new Headers(requestInit.headers);
  if (UNSAFE.has(method) && !headers.has("X-CSRF-Token")) {
    const csrf = readCookie("__Host-bp_csrf");
    if (csrf) headers.set("X-CSRF-Token", csrf);
  }
  requestInit.headers = headers;
  return globalThis.fetch(input, requestInit);
}

export function createRc7AdminTransport(): AdminTransport {
  const client = createAdminApiClient({
    baseUrl: browserBaseUrl(),
    fetch: securityAwareFetch,
    defaultInit: { credentials: "include" },
  });
  return {
    async request<T = unknown>(
      operationId: AdminOperationId,
      input: AdminRequestInput = {},
      signal?: AbortSignal,
    ): Promise<AdminResponse<T>> {
      // The generated client owns the concrete OperationRequestMap. This adapter
      // deliberately performs one narrow cast so page code cannot manufacture paths.
      const result = await client.request(operationId, input as never, signal ? { signal } : {});
      return result as AdminResponse<T>;
    },
  };
}

export function newIdempotencyKey(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function withMutationHeaders(input: AdminRequestInput = {}): AdminRequestInput {
  return {
    ...input,
    header: {
      ...(input.header ?? {}),
      "Idempotency-Key": input.header?.["Idempotency-Key"] ?? newIdempotencyKey(),
    },
  };
}
