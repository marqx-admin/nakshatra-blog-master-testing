from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl

import yaml
from jsonschema import Draft202012Validator, RefResolver

from bp_domain.errors import ErrorDetail, ValidationFault

HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options"}


@dataclass(frozen=True, slots=True)
class OperationContract:
    operation_id: str
    method: str
    path: str
    site_context: str
    auth_context: str
    permissions: str
    rate_class: str
    idempotency: str
    success_status: int
    request_schema: dict[str, Any] | None
    responses: tuple[str, ...]
    parameters: tuple[dict[str, Any], ...] = ()
    response_schemas: tuple[tuple[str, dict[str, Any] | None], ...] = ()

    def response_schema(self, status: int) -> dict[str, Any] | None:
        key = str(status)
        return dict(self.response_schemas).get(key)

    def allows_status(self, status: int) -> bool:
        return str(status) in self.responses


def load_openapi(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def iter_operations(spec: dict[str, Any]):
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if method not in HTTP_METHODS or not isinstance(op, dict):
                continue
            request_schema = (
                op.get("requestBody", {})
                .get("content", {})
                .get("application/json", {})
                .get("schema")
            )
            response_schemas: list[tuple[str, dict[str, Any] | None]] = []
            for status, response in op.get("responses", {}).items():
                response_schemas.append(
                    (
                        str(status),
                        response.get("content", {})
                        .get("application/json", {})
                        .get("schema"),
                    )
                )
            yield OperationContract(
                operation_id=op["operationId"],
                method=method.upper(),
                path=path,
                site_context=op.get("x-site-context", ""),
                auth_context=op.get("x-auth-context", ""),
                permissions=op.get("x-permissions", "NONE"),
                rate_class=op.get("x-rate-limit-class", ""),
                idempotency=op.get("x-idempotency", "NO"),
                success_status=int(op["x-success-status"]),
                request_schema=request_schema,
                responses=tuple(str(value) for value in op.get("responses", {})),
                parameters=tuple(op.get("parameters", ())),
                response_schemas=tuple(response_schemas),
            )


def operation_index(spec: dict[str, Any]) -> dict[str, OperationContract]:
    return {op.operation_id: op for op in iter_operations(spec)}


def owned_operations(spec: dict[str, Any]):
    for op in iter_operations(spec):
        if op.operation_id.startswith(("API15-PUB-", "API15-AUTH-", "API15-G-")) or op.operation_id == "API15-S-001":
            yield op


def _validator(spec: dict[str, Any], schema: dict[str, Any]) -> Draft202012Validator:
    resolver = RefResolver.from_schema(spec)
    return Draft202012Validator(
        schema,
        resolver=resolver,
        format_checker=Draft202012Validator.FORMAT_CHECKER,
    )


def validate_json(
    spec: dict[str, Any],
    schema: dict[str, Any] | None,
    instance: Any,
    *,
    error_message: str = "request validation failed",
) -> None:
    if schema is None:
        return
    errors = sorted(_validator(spec, schema).iter_errors(instance), key=lambda error: list(error.path))
    if not errors:
        return
    details: list[ErrorDetail] = []
    for error in errors[:20]:
        path = ".".join(str(part) for part in error.path)
        details.append(
            ErrorDetail(
                code="INVALID_FIELD",
                message="Value does not satisfy the canonical contract.",
                field=path or None,
            )
        )
    raise ValidationFault(error_message, details=tuple(details))


def validate_response(spec: dict[str, Any], contract: OperationContract, status: int, payload: Any) -> None:
    if not contract.allows_status(status):
        raise RuntimeError(
            f"{contract.operation_id} returned status {status}, not declared by canonical RC12"
        )
    schema = contract.response_schema(status)
    if schema is None:
        if status != 204 and payload not in (None, b"", ""):
            # Redirects are body-less under this project transport.
            if status not in {301, 302, 308}:
                raise RuntimeError(
                    f"{contract.operation_id} returned an undeclared response body for {status}"
                )
        return
    errors = list(_validator(spec, schema).iter_errors(payload))
    if errors:
        first = errors[0]
        path = ".".join(str(part) for part in first.path)
        raise RuntimeError(
            f"{contract.operation_id} response violates canonical RC12 schema at {path or '<root>'}: {first.message}"
        )


def _coerce_parameter(raw: str, schema: dict[str, Any]) -> Any:
    kind = schema.get("type")
    if kind == "integer":
        try:
            return int(raw)
        except (TypeError, ValueError) as exc:
            raise ValidationFault("request validation failed") from exc
    if kind == "number":
        try:
            return float(raw)
        except (TypeError, ValueError) as exc:
            raise ValidationFault("request validation failed") from exc
    if kind == "boolean":
        if raw == "true":
            return True
        if raw == "false":
            return False
        raise ValidationFault("request validation failed")
    return raw


def validate_parameters(spec: dict[str, Any], contract: OperationContract, request: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    """Validate/coerce canonical path/query/header parameters for a dynamic route.

    Returns `(path_params, query_params)`. Repeated query parameters are only
    accepted when the OpenAPI parameter schema itself is an array.
    """

    path_values: dict[str, Any] = {}
    query_values: dict[str, Any] = {}
    query_pairs = list(parse_qsl(request.url.query, keep_blank_values=True))
    grouped: dict[str, list[str]] = {}
    for key, value in query_pairs:
        grouped.setdefault(key, []).append(value)

    declared_queries = {p["name"] for p in contract.parameters if p.get("in") == "query"}
    unknown = set(grouped) - declared_queries
    if unknown:
        raise ValidationFault(
            "request validation failed",
            details=tuple(
                ErrorDetail("UNKNOWN_PARAMETER", "Parameter is not declared by the canonical contract.", field=name)
                for name in sorted(unknown)
            ),
        )

    for parameter in contract.parameters:
        location = parameter.get("in")
        name = parameter["name"]
        schema = parameter.get("schema", {})
        required = bool(parameter.get("required"))
        if location == "path":
            raw = request.path_params.get(name)
            if raw is None:
                if required:
                    raise ValidationFault("request validation failed")
                continue
            value = _coerce_parameter(str(raw), schema)
            validate_json(spec, schema, value)
            path_values[name] = value
        elif location == "query":
            raw_values = grouped.get(name)
            if not raw_values:
                if required:
                    raise ValidationFault("request validation failed")
                if "default" in schema:
                    query_values[name] = schema["default"]
                continue
            if schema.get("type") == "array":
                item_schema = schema.get("items", {})
                values = [_coerce_parameter(value, item_schema) for value in raw_values]
                validate_json(spec, schema, values)
                query_values[name] = values
            else:
                if len(raw_values) != 1:
                    raise ValidationFault("request validation failed")
                value = _coerce_parameter(raw_values[0], schema)
                validate_json(spec, schema, value)
                query_values[name] = value
        elif location == "header" and required:
            raw = request.headers.get(name)
            if raw is None:
                raise ValidationFault(
                    "request validation failed",
                    details=(ErrorDetail("MISSING_HEADER", "Required header is missing.", field=name),),
                )
            validate_json(spec, schema, raw)

    return path_values, query_values

def assert_rc11_contract(spec: dict[str, Any]) -> None:
    operations = list(iter_operations(spec))
    schemas = spec.get("components", {}).get("schemas", {})
    if spec.get("openapi") != "3.1.0" or spec.get("info", {}).get("version") != "1.0-RC12":
        raise RuntimeError("canonical HTTP contract must be BLOG-DOC-15 OpenAPI 1.0-RC12")
    if len(operations) != 113 or len(spec.get("paths", {})) != 86 or len(schemas) != 248:
        raise RuntimeError("canonical RC12 estate count mismatch")
    operation_ids = [op.operation_id for op in operations]
    pairs = [(op.method, op.path) for op in operations]
    if len(set(operation_ids)) != 113 or len(set(pairs)) != 113:
        raise RuntimeError("canonical RC12 operation identity is not unique")
    owned = list(owned_operations(spec))
    if len(owned) != 51:
        raise RuntimeError("CHAT03/C00 RC12 core ownership set must be 51 operations")

# Backward import compatibility; canonical runtime is RC12.
assert_rc10_contract = assert_rc11_contract
assert_rc7_contract = assert_rc11_contract
