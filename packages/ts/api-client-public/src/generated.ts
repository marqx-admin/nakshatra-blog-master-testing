// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml
// Source SHA-256: bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00

import { operationRegistry } from "@bp/api-contract";
import type { OperationRequestMap, OperationResponseMap } from "@bp/api-contract";

export const publicOperationIds = [
  "API15-PUB-001",
  "API15-PUB-002"
] as const;
export type PublicOperationId = (typeof publicOperationIds)[number];

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

export function createPublicApiClient(config: ApiClientConfig) {
  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (!fetchImpl) throw new Error("No fetch implementation is available.");
  const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`;

  return {
    async request<TOperation extends PublicOperationId>(
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
