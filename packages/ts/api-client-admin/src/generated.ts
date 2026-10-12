// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml
// Source SHA-256: 5c3d1246a313facce9b798331cbed5ec2293b3a8d8d0d1adb57373d6d7574eef

import { operationRegistry } from "@bp/api-contract";
import type { OperationRequestMap, OperationResponseMap } from "@bp/api-contract";

export const adminOperationIds = [
  "API15-AUTH-001",
  "API15-AUTH-002",
  "API15-AUTH-003",
  "API15-AUTH-004",
  "API15-AUTH-005",
  "API15-AUTH-006",
  "API15-AUTH-007",
  "API15-AUTH-008",
  "API15-AUTH-009",
  "API15-AUTH-010",
  "API15-AUTH-011",
  "API15-AUTH-012",
  "API15-G-001",
  "API15-G-002",
  "API15-G-003",
  "API15-G-010",
  "API15-G-011",
  "API15-G-012",
  "API15-G-013",
  "API15-G-014",
  "API15-G-015",
  "API15-G-016",
  "API15-G-017",
  "API15-G-018",
  "API15-G-019",
  "API15-G-020",
  "API15-G-021",
  "API15-G-022",
  "API15-G-030",
  "API15-G-031",
  "API15-G-032",
  "API15-G-033",
  "API15-G-034",
  "API15-G-035",
  "API15-G-036",
  "API15-G-037",
  "API15-G-040",
  "API15-G-041",
  "API15-G-042",
  "API15-G-043",
  "API15-G-044",
  "API15-G-045",
  "API15-G-046",
  "API15-G-050",
  "API15-G-051",
  "API15-G-052",
  "API15-G-060",
  "API15-G-061",
  "API15-S-001",
  "API15-S-002",
  "API15-S-010",
  "API15-S-011",
  "API15-S-012",
  "API15-S-013",
  "API15-S-014",
  "API15-S-015",
  "API15-S-016",
  "API15-S-017",
  "API15-S-018",
  "API15-S-019",
  "API15-S-020",
  "API15-S-021",
  "API15-S-022",
  "API15-S-023",
  "API15-S-024",
  "API15-S-025",
  "API15-S-026",
  "API15-S-027",
  "API15-S-028",
  "API15-S-030",
  "API15-S-031",
  "API15-S-032",
  "API15-S-033",
  "API15-S-034",
  "API15-S-040",
  "API15-S-041",
  "API15-S-042",
  "API15-S-043",
  "API15-S-044",
  "API15-S-045",
  "API15-S-050",
  "API15-S-051",
  "API15-S-052",
  "API15-S-053",
  "API15-S-054",
  "API15-S-060",
  "API15-S-061",
  "API15-S-062",
  "API15-S-063",
  "API15-S-064",
  "API15-S-065",
  "API15-S-066",
  "API15-S-070",
  "API15-S-071",
  "API15-S-072",
  "API15-S-073",
  "API15-S-080",
  "API15-S-081",
  "API15-S-082",
  "API15-S-083",
  "API15-S-084",
  "API15-S-085",
  "API15-S-086",
  "API15-S-090",
  "API15-S-091",
  "API15-S-092",
  "API15-S-093",
  "API15-S-094",
  "API15-S-095",
  "API15-S-096",
  "API15-S-097"
] as const;
export type AdminOperationId = (typeof adminOperationIds)[number];

export interface ApiClientConfig {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  defaultInit?: Omit<RequestInit, "method" | "body" | "headers" | "redirect"> & { headers?: HeadersInit };
}

export interface ApiClientRequestOptions {
  signal?: AbortSignal;
}

function appendFormData(form: FormData, key: string, value: unknown): void {
  if (value === undefined) return;
  if (Array.isArray(value)) {
    for (const item of value) appendFormData(form, key, item);
    return;
  }
  if (value instanceof Blob) {
    form.append(key, value);
    return;
  }
  form.append(key, String(value));
}

function createBody(contentType: string | null, body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (contentType === "application/json") {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return JSON.stringify(body);
  }
  if (contentType === "multipart/form-data") {
    const form = new FormData();
    if (body && typeof body === "object") {
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) appendFormData(form, key, value);
    }
    return form;
  }
  throw new Error(`Unsupported canonical request content type: ${contentType ?? "none"}`);
}

export function createAdminApiClient(config: ApiClientConfig) {
  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (!fetchImpl) throw new Error("No fetch implementation is available.");
  const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;

  return {
    async request<TOperation extends AdminOperationId>(
      operationId: TOperation,
      input: OperationRequestMap[TOperation],
      options: ApiClientRequestOptions = {},
    ): Promise<OperationResponseMap[TOperation]> {
      const meta = operationRegistry[operationId];
      let route = meta.path as string;
      const request = input as {
        path?: Record<string, unknown>;
        query?: Record<string, unknown>;
        header?: Record<string, unknown>;
        cookie?: Record<string, unknown>;
        body?: unknown;
      };

      for (const name of meta.pathParameters) {
        const value = request.path?.[name];
        if (value === undefined) throw new Error(`Missing required path parameter ${name} for ${operationId}`);
        route = route.replace(`{${name}}`, encodeURIComponent(String(value)));
      }
      if (route.includes("{")) throw new Error(`Unresolved path parameter for ${operationId}`);

      const relativeRoute = route.startsWith("/") ? route.slice(1) : route;
      const url = new URL(relativeRoute, baseUrl);
      for (const name of meta.queryParameters) {
        const value = request.query?.[name];
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const item of value) url.searchParams.append(name, String(item));
        } else {
          url.searchParams.set(name, String(value));
        }
      }

      const headers = new Headers(config.defaultInit?.headers);
      for (const name of meta.headerParameters) {
        const value = request.header?.[name];
        if (value !== undefined) headers.set(name, String(value));
      }

      const body = createBody(meta.requestContentType, request.body, headers);
      const requestInit: RequestInit = {
        ...config.defaultInit,
        method: meta.method,
        headers,
        redirect: "manual",
      };
      if (body !== undefined) requestInit.body = body;
      if (options.signal !== undefined) requestInit.signal = options.signal;
      const response = await fetchImpl(url, requestInit);

      let data: unknown = undefined;
      if (response.status !== 204) {
        const responseContentType = response.headers.get("content-type") ?? "";
        if (responseContentType.toLowerCase().includes("application/json")) data = await response.json();
      }
      return { status: response.status, data, headers: response.headers } as OperationResponseMap[TOperation];
    },
  };
}
