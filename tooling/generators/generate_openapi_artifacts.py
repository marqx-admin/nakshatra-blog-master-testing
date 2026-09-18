#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except Exception as exc:  # pragma: no cover
    print(f"FAIL PyYAML is required for deterministic OpenAPI generation: {exc}", file=sys.stderr)
    raise SystemExit(90)

ROOT = Path(__file__).resolve().parents[2]
BASELINE_PATH = ROOT / "tooling/configs/openapi-baseline.json"
HTTP_METHODS = ("get", "post", "put", "patch", "delete", "options", "head", "trace")


def fail(message: str, code: int = 1) -> None:
    print(f"FAIL {message}", file=sys.stderr)
    raise SystemExit(code)


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def ts_literal(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, (int, float)):
        return repr(value)
    return "unknown"


def ref_to_ts(ref: str) -> str:
    prefix = "#/components/schemas/"
    if ref.startswith(prefix):
        name = ref[len(prefix):].replace("~1", "/").replace("~0", "~")
        return f'components["schemas"][{json.dumps(name)}]'
    return "unknown"


def schema_to_ts(schema: Any, indent: int = 0) -> str:
    if schema is True:
        return "unknown"
    if schema is False:
        return "never"
    if not isinstance(schema, dict):
        return "unknown"

    if "$ref" in schema:
        base = ref_to_ts(str(schema["$ref"]))
        # Sibling constraints are validation metadata, not additional wire fields.
        return base

    if "const" in schema:
        return ts_literal(schema["const"])

    if "enum" in schema and isinstance(schema["enum"], list):
        values = schema["enum"]
        return " | ".join(ts_literal(v) for v in values) if values else "never"

    composed: list[str] = []
    if isinstance(schema.get("oneOf"), list):
        composed.append("(" + " | ".join(schema_to_ts(v, indent) for v in schema["oneOf"]) + ")")
    if isinstance(schema.get("anyOf"), list):
        composed.append("(" + " | ".join(schema_to_ts(v, indent) for v in schema["anyOf"]) + ")")
    if isinstance(schema.get("allOf"), list):
        composed.append("(" + " & ".join(schema_to_ts(v, indent) for v in schema["allOf"]) + ")")

    schema_type = schema.get("type")
    if isinstance(schema_type, list):
        values = []
        for item in schema_type:
            if item == "null":
                values.append("null")
            else:
                clone = dict(schema)
                clone["type"] = item
                values.append(schema_to_ts(clone, indent))
        own = " | ".join(values)
    elif schema_type == "string":
        own = "Blob" if schema.get("format") == "binary" else "string"
    elif schema_type in ("integer", "number"):
        own = "number"
    elif schema_type == "boolean":
        own = "boolean"
    elif schema_type == "null":
        own = "null"
    elif schema_type == "array" or "items" in schema:
        item_type = schema_to_ts(schema.get("items", {}), indent)
        own = f"Array<{item_type}>"
    elif schema_type == "object" or "properties" in schema or "additionalProperties" in schema:
        props = schema.get("properties") or {}
        required = set(schema.get("required") or [])
        lines: list[str] = []
        if isinstance(props, dict):
            for key, value in props.items():
                optional = "" if key in required else "?"
                lines.append(" " * (indent + 2) + f"{json.dumps(str(key), ensure_ascii=False)}{optional}: {schema_to_ts(value, indent + 2)};")
        if lines:
            object_type = "{\n" + "\n".join(lines) + "\n" + " " * indent + "}"
        else:
            object_type = "Record<string, never>" if schema.get("additionalProperties") is False else "Record<string, unknown>"

        additional = schema.get("additionalProperties")
        if isinstance(additional, dict):
            object_type = f"({object_type}) & Record<string, {schema_to_ts(additional, indent)}>"
        elif additional is True and lines:
            object_type = f"({object_type}) & Record<string, unknown>"
        own = object_type
    else:
        own = "unknown"

    if composed:
        # If the schema is purely composed, do not add an unconstrained `unknown` branch/intersection.
        has_own_shape = schema_type is not None or "properties" in schema or "items" in schema or "enum" in schema or "const" in schema
        if has_own_shape:
            composed.append(f"({own})")
        joiner = " & " if "allOf" in schema and "oneOf" not in schema and "anyOf" not in schema else " & "
        return joiner.join(composed)
    return own


def collect_operations(document: dict[str, Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for route, path_item in (document.get("paths") or {}).items():
        if not isinstance(path_item, dict):
            continue
        for method in HTTP_METHODS:
            operation = path_item.get(method)
            if not isinstance(operation, dict):
                continue
            op = dict(operation)
            op["__path"] = str(route)
            op["__method"] = method.upper()
            result.append(op)
    result.sort(key=lambda op: str(op.get("operationId")))
    return result


def parameter_groups(op: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    groups = {"path": [], "query": [], "header": [], "cookie": []}
    for parameter in op.get("parameters") or []:
        if not isinstance(parameter, dict) or "$ref" in parameter:
            continue
        where = parameter.get("in")
        if where in groups:
            groups[where].append(parameter)
    return groups


def render_object_fields(fields: list[dict[str, Any]], indent: int = 0) -> str:
    if not fields:
        return "Record<string, never>"
    required = [f for f in fields if f.get("required") is True]
    lines = []
    for field in fields:
        name = json.dumps(str(field.get("name")), ensure_ascii=False)
        optional = "" if field.get("required") is True else "?"
        lines.append(" " * (indent + 2) + f"{name}{optional}: {schema_to_ts(field.get('schema') or {}, indent + 2)};")
    body = "{\n" + "\n".join(lines) + "\n" + " " * indent + "}"
    return body


def operation_request_type(op: dict[str, Any], indent: int = 0) -> str:
    groups = parameter_groups(op)
    fields: list[str] = []
    for group_name in ("path", "query", "header", "cookie"):
        members = groups[group_name]
        if not members:
            continue
        group_required = any(p.get("required") is True for p in members)
        optional = "" if group_required else "?"
        fields.append(" " * (indent + 2) + f"{group_name}{optional}: {render_object_fields(members, indent + 2)};")

    request_body = op.get("requestBody")
    if isinstance(request_body, dict):
        content = request_body.get("content") or {}
        body_types = []
        for content_type, media in sorted(content.items()):
            if isinstance(media, dict):
                body_types.append(schema_to_ts(media.get("schema") or {}, indent + 2))
        body_type = " | ".join(body_types) if body_types else "unknown"
        optional = "" if request_body.get("required") is True else "?"
        fields.append(" " * (indent + 2) + f"body{optional}: {body_type};")

    if not fields:
        return "Record<string, never>"
    return "{\n" + "\n".join(fields) + "\n" + " " * indent + "}"


def response_data_type(response: Any, indent: int = 0) -> str:
    if not isinstance(response, dict):
        return "undefined"
    content = response.get("content") or {}
    media = content.get("application/json") if isinstance(content, dict) else None
    if isinstance(media, dict):
        return schema_to_ts(media.get("schema") or {}, indent)
    return "undefined"


def operation_response_union(op: dict[str, Any], indent: int = 0) -> str:
    members = []
    for status, response in (op.get("responses") or {}).items():
        if not re.fullmatch(r"\d{3}", str(status)):
            continue
        data_type = response_data_type(response, indent + 2)
        members.append(f"{{ status: {int(status)}; data: {data_type}; headers: Headers }}")
    return " | ".join(members) if members else "{ status: number; data: unknown; headers: Headers }"


def operation_detailed_type(op: dict[str, Any], indent: int = 0) -> str:
    groups = parameter_groups(op)
    param_lines: list[str] = []
    for group_name in ("path", "query", "header", "cookie"):
        members = groups[group_name]
        if members:
            param_lines.append(" " * (indent + 6) + f"{group_name}: {render_object_fields(members, indent + 6)};")
    parameters_block = "{\n" + "\n".join(param_lines) + "\n" + " " * (indent + 4) + "}" if param_lines else "Record<string, never>"

    body_block = "never"
    request_body = op.get("requestBody")
    if isinstance(request_body, dict):
        c_lines = []
        for content_type, media in sorted((request_body.get("content") or {}).items()):
            if isinstance(media, dict):
                c_lines.append(" " * (indent + 6) + f"{json.dumps(str(content_type))}: {schema_to_ts(media.get('schema') or {}, indent + 6)};")
        content_type = "{\n" + "\n".join(c_lines) + "\n" + " " * (indent + 4) + "}" if c_lines else "Record<string, never>"
        body_block = "{\n" + " " * (indent + 4) + f"content: {content_type};\n" + " " * (indent + 2) + "}"

    response_lines = []
    for status, response in (op.get("responses") or {}).items():
        if not re.fullmatch(r"\d{3}", str(status)):
            continue
        headers = response.get("headers") if isinstance(response, dict) else None
        header_lines = []
        if isinstance(headers, dict):
            for name, h in headers.items():
                if not isinstance(h, dict):
                    continue
                optional = "" if h.get("required") is True else "?"
                header_lines.append(" " * (indent + 10) + f"{json.dumps(str(name))}{optional}: {schema_to_ts(h.get('schema') or {}, indent + 10)};")
        header_type = "{\n" + "\n".join(header_lines) + "\n" + " " * (indent + 8) + "}" if header_lines else "Record<string, never>"
        content = response.get("content") if isinstance(response, dict) else None
        content_lines = []
        if isinstance(content, dict):
            for ctype, media in sorted(content.items()):
                if isinstance(media, dict):
                    content_lines.append(" " * (indent + 10) + f"{json.dumps(str(ctype))}: {schema_to_ts(media.get('schema') or {}, indent + 10)};")
        content_type = "{\n" + "\n".join(content_lines) + "\n" + " " * (indent + 8) + "}" if content_lines else "Record<string, never>"
        response_lines.append(
            " " * (indent + 6)
            + f"{int(status)}: {{\n"
            + " " * (indent + 8)
            + f"headers: {header_type};\n"
            + " " * (indent + 8)
            + f"content: {content_type};\n"
            + " " * (indent + 6)
            + "};"
        )
    responses_block = "{\n" + "\n".join(response_lines) + "\n" + " " * (indent + 4) + "}"

    return (
        "{\n"
        + " " * (indent + 2) + f"parameters: {parameters_block};\n"
        + " " * (indent + 2) + f"requestBody: {body_block};\n"
        + " " * (indent + 2) + f"responses: {responses_block};\n"
        + " " * indent + "}"
    )


def build_openapi_ts(document: dict[str, Any], operations: list[dict[str, Any]], source_sha: str) -> str:
    schemas = (document.get("components") or {}).get("schemas") or {}
    op_by_path_method = {(op["__path"], op["__method"].lower()): op for op in operations}
    lines = [
        "// GENERATED FILE — DO NOT EDIT.",
        "// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml",
        f"// Source SHA-256: {source_sha}",
        "// Wire keys intentionally preserve the canonical OpenAPI spelling/casing.",
        "",
        "export interface components {",
        "  schemas: {",
    ]
    for name, schema in schemas.items():
        rendered = schema_to_ts(schema, 4).replace("\n", "\n    ")
        lines.append(f"    {json.dumps(str(name))}: {rendered};")
    lines += ["  };", "}", "", "export interface operations {"]
    for op in operations:
        opid = str(op["operationId"])
        rendered = operation_detailed_type(op, 2).replace("\n", "\n  ")
        lines.append(f"  {json.dumps(opid)}: {rendered};")
    lines += ["}", "", "export interface paths {"]
    for route, item in (document.get("paths") or {}).items():
        lines.append(f"  {json.dumps(str(route))}: {{")
        for method in HTTP_METHODS:
            op = op_by_path_method.get((str(route), method))
            if op:
                lines.append(f"    {method}: operations[{json.dumps(str(op['operationId']))}];")
        lines.append("  };")
    lines += ["}", "", "export interface OperationRequestMap {"]
    for op in operations:
        rendered = operation_request_type(op, 2).replace("\n", "\n  ")
        lines.append(f"  {json.dumps(str(op['operationId']))}: {rendered};")
    lines += ["}", "", "export interface OperationResponseMap {"]
    for op in operations:
        lines.append(f"  {json.dumps(str(op['operationId']))}: {operation_response_union(op, 2)};")
    lines += ["}", "", "export type OperationId = keyof OperationRequestMap;", ""]
    return "\n".join(lines)


def operation_metadata(op: dict[str, Any]) -> dict[str, Any]:
    content_types: list[str] = []
    rb = op.get("requestBody")
    if isinstance(rb, dict):
        content_types = sorted(str(k) for k in (rb.get("content") or {}))
    groups = parameter_groups(op)
    return {
        "method": op["__method"],
        "path": op["__path"],
        "successStatus": int(op["x-success-status"]),
        "siteContext": op.get("x-site-context"),
        "authContext": op.get("x-auth-context"),
        "permissions": op.get("x-permissions"),
        "rateLimitClass": op.get("x-rate-limit-class"),
        "idempotency": op.get("x-idempotency"),
        "concurrency": op.get("x-concurrency"),
        "requestContentType": content_types[0] if len(content_types) == 1 else None,
        "pathParameters": [str(p.get("name")) for p in groups["path"]],
        "queryParameters": [str(p.get("name")) for p in groups["query"]],
        "headerParameters": [str(p.get("name")) for p in groups["header"]],
    }


def build_registry_ts(operations: list[dict[str, Any]], source_sha: str) -> str:
    registry = {str(op["operationId"]): operation_metadata(op) for op in operations}
    return "\n".join([
        "// GENERATED FILE — DO NOT EDIT.",
        "// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml",
        f"// Source SHA-256: {source_sha}",
        "",
        "export const operationRegistry = " + json.dumps(registry, ensure_ascii=False, indent=2, sort_keys=True) + " as const;",
        "export type RegisteredOperationId = keyof typeof operationRegistry;",
        "",
    ])


def build_client_ts(kind: str, operations: list[dict[str, Any]], source_sha: str) -> str:
    if kind == "public":
        allowed = [str(op["operationId"]) for op in operations if str(op["operationId"]).startswith("API15-PUB-")]
        type_name = "PublicOperationId"
        factory = "createPublicApiClient"
    else:
        allowed = [
            str(op["operationId"])
            for op in operations
            if str(op["operationId"]).startswith(("API15-AUTH-", "API15-S-", "API15-G-"))
        ]
        type_name = "AdminOperationId"
        factory = "createAdminApiClient"

    allowed_json = json.dumps(allowed, ensure_ascii=False, indent=2)
    return f'''// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml
// Source SHA-256: {source_sha}

import {{ operationRegistry }} from "@bp/api-contract";
import type {{ OperationRequestMap, OperationResponseMap }} from "@bp/api-contract";

export const {kind}OperationIds = {allowed_json} as const;
export type {type_name} = (typeof {kind}OperationIds)[number];

export interface ApiClientConfig {{
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  defaultInit?: Omit<RequestInit, "method" | "body" | "headers" | "redirect"> & {{ headers?: HeadersInit }};
}}

export interface ApiClientRequestOptions {{
  signal?: AbortSignal;
}}

function appendFormData(form: FormData, key: string, value: unknown): void {{
  if (value === undefined) return;
  if (Array.isArray(value)) {{
    for (const item of value) appendFormData(form, key, item);
    return;
  }}
  if (value instanceof Blob) {{
    form.append(key, value);
    return;
  }}
  form.append(key, String(value));
}}

function createBody(contentType: string | null, body: unknown, headers: Headers): BodyInit | undefined {{
  if (body === undefined) return undefined;
  if (contentType === "application/json") {{
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return JSON.stringify(body);
  }}
  if (contentType === "multipart/form-data") {{
    const form = new FormData();
    if (body && typeof body === "object") {{
      for (const [key, value] of Object.entries(body as Record<string, unknown>)) appendFormData(form, key, value);
    }}
    return form;
  }}
  throw new Error(`Unsupported canonical request content type: ${{contentType ?? "none"}}`);
}}

export function {factory}(config: ApiClientConfig) {{
  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (!fetchImpl) throw new Error("No fetch implementation is available.");
  const baseUrl = config.baseUrl.endsWith("/") ? config.baseUrl : `${{config.baseUrl}}/`;

  return {{
    async request<TOperation extends {type_name}>(
      operationId: TOperation,
      input: OperationRequestMap[TOperation],
      options: ApiClientRequestOptions = {{}},
    ): Promise<OperationResponseMap[TOperation]> {{
      const meta = operationRegistry[operationId];
      let route = meta.path as string;
      const request = input as {{
        path?: Record<string, unknown>;
        query?: Record<string, unknown>;
        header?: Record<string, unknown>;
        cookie?: Record<string, unknown>;
        body?: unknown;
      }};

      for (const name of meta.pathParameters) {{
        const value = request.path?.[name];
        if (value === undefined) throw new Error(`Missing required path parameter ${{name}} for ${{operationId}}`);
        route = route.replace(`{{${{name}}}}`, encodeURIComponent(String(value)));
      }}
      if (route.includes("{{")) throw new Error(`Unresolved path parameter for ${{operationId}}`);

      const relativeRoute = route.startsWith("/") ? route.slice(1) : route;
      const url = new URL(relativeRoute, baseUrl);
      for (const name of meta.queryParameters) {{
        const value = request.query?.[name];
        if (value === undefined) continue;
        if (Array.isArray(value)) {{
          for (const item of value) url.searchParams.append(name, String(item));
        }} else {{
          url.searchParams.set(name, String(value));
        }}
      }}

      const headers = new Headers(config.defaultInit?.headers);
      for (const name of meta.headerParameters) {{
        const value = request.header?.[name];
        if (value !== undefined) headers.set(name, String(value));
      }}

      const body = createBody(meta.requestContentType, request.body, headers);
      const requestInit: RequestInit = {{
        ...config.defaultInit,
        method: meta.method,
        headers,
        redirect: "manual",
      }};
      if (body !== undefined) requestInit.body = body;
      if (options.signal !== undefined) requestInit.signal = options.signal;
      const response = await fetchImpl(url, requestInit);

      let data: unknown = undefined;
      if (response.status !== 204) {{
        const responseContentType = response.headers.get("content-type") ?? "";
        if (responseContentType.toLowerCase().includes("application/json")) data = await response.json();
      }}
      return {{ status: response.status, data, headers: response.headers }} as OperationResponseMap[TOperation];
    }},
  }};
}}
'''


def build_client_index(kind: str) -> str:
    return 'export * from "./generated";\n'


def outputs(document: dict[str, Any], operations: list[dict[str, Any]], sha: str) -> dict[Path, str]:
    manifest = {
        "source": "contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml",
        "source_sha256": sha,
        "api_version": str((document.get("info") or {}).get("version")),
        "generator": "tooling/generators/generate_openapi_artifacts.py",
        "generator_contract": "deterministic YAML-only generation; no PDF/FastAPI/code-first inference",
        "operations": len(operations),
        "paths": len(document.get("paths") or {}),
        "schemas_helpers": len((document.get("components") or {}).get("schemas") or {}),
        "public_operation_ids": [str(op["operationId"]) for op in operations if str(op["operationId"]).startswith("API15-PUB-")],
        "admin_operation_ids": [str(op["operationId"]) for op in operations if str(op["operationId"]).startswith(("API15-AUTH-", "API15-S-", "API15-G-"))],
    }
    return {
        ROOT / "packages/ts/api-contract/generated/openapi.ts": build_openapi_ts(document, operations, sha),
        ROOT / "packages/ts/api-contract/generated/operation-registry.ts": build_registry_ts(operations, sha),
        ROOT / "packages/ts/api-contract/generated/contract-manifest.json": json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        ROOT / "packages/ts/api-contract/generated/README.md": "GENERATED FROM contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml. DO NOT EDIT.\n",
        ROOT / "packages/ts/api-contract/src/index.ts": 'export * from "../generated/openapi";\nexport * from "../generated/operation-registry";\n',
        ROOT / "packages/ts/api-client-public/src/generated.ts": build_client_ts("public", operations, sha),
        ROOT / "packages/ts/api-client-public/src/index.ts": build_client_index("public"),
        ROOT / "packages/ts/api-client-admin/src/generated.ts": build_client_ts("admin", operations, sha),
        ROOT / "packages/ts/api-client-admin/src/index.ts": build_client_index("admin"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args()

    baseline = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))
    source = ROOT / baseline["canonical_repository_path"]
    if not source.exists():
        fail(f"canonical RC8 source missing: {baseline['canonical_repository_path']}", 20)
    raw = source.read_bytes()
    sha = hashlib.sha256(raw).hexdigest()
    if sha != baseline["sha256"]:
        fail(f"approved RC8 replacement SHA mismatch: expected={baseline['sha256']} actual={sha}", 21)

    document = yaml.safe_load(raw)
    if not isinstance(document, dict):
        fail("OpenAPI root is not a mapping", 22)
    operations = collect_operations(document)
    generated = outputs(document, operations, sha)

    if args.write:
        for path, content in generated.items():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")
        print(f"PASS generated {len(generated)} deterministic TypeScript contract/client artifacts from approved RC8 YAML")
        print(f"PASS public operations=2 admin operations={len(operations)-2} source_sha256={sha}")
        return 0

    drift: list[str] = []
    for path, expected in generated.items():
        if not path.exists():
            drift.append(f"missing {path.relative_to(ROOT)}")
            continue
        actual = path.read_text(encoding="utf-8")
        if actual != expected:
            drift.append(f"different {path.relative_to(ROOT)}")
    if drift:
        fail("generated contract/client drift: " + "; ".join(drift), 32)
    print(f"PASS zero generated drift across {len(generated)} contract/client artifacts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
