from pathlib import Path

import yaml

from bp_api.app import create_app
from bp_api.config import Settings
from bp_api.http.contract import iter_operations, load_openapi, owned_operations
from bp_test_support.fastapi_routes import iter_effective_fastapi_routes, single_http_method

CANON = Path("contracts/http/BLOG-DOC-15_openapi_v1.0-RC9.yaml")


def test_chat03_route_method_operation_and_success_status_parity():
    spec = yaml.safe_load(CANON.read_text())
    app = create_app(
        settings=Settings(
            "test",
            str(CANON),
            ("https://admin.test",),
            "https://admin.test/reset",
            False,
        )
    )
    actual = {}
    api_routes = []
    effective_routes = list(iter_effective_fastapi_routes(app.routes))
    for route in effective_routes:
        oid = getattr(route, "operation_id", None)
        is_chat03_owned = bool(oid) and (
            oid.startswith(("API15-PUB-", "API15-AUTH-", "API15-G-")) or oid == "API15-S-001"
        )
        if is_chat03_owned:
            method = single_http_method(route)
            assert oid not in actual, f"duplicate operationId {oid}"
            api_routes.append((oid, route.path, frozenset(route.methods or ())))
            actual[oid] = (method, route.path, int(route.status_code))

    expected = {}
    for path, item in spec["paths"].items():
        for method, op in item.items():
            if not isinstance(op, dict):
                continue
            oid = op.get("operationId", "")
            if oid.startswith(("API15-PUB-", "API15-AUTH-", "API15-G-")) or oid == "API15-S-001":
                expected[oid] = (method.upper(), path, int(op["x-success-status"]))

    assert actual == expected
    assert len(api_routes) == 51
    assert (
        len(
            {
                (single_http_method(route), route.path)
                for route in effective_routes
                if getattr(route, "operation_id", None) in expected
            }
        )
        == 51
    )
    assert {oid for oid, _, _ in api_routes} == set(expected)
    assert len([key for key in actual if key.startswith("API15-AUTH-")]) == 12
    assert len([key for key in actual if key.startswith("API15-PUB-")]) == 2
    assert len([key for key in actual if key.startswith("API15-G-")]) == 36
    assert all(
        not any(param.name == "_c" for param in route.dependant.query_params)
        for route in effective_routes
        if (getattr(route, "operation_id", None) or "").startswith("API15-G-")
    )

    generated_operation_ids = {
        op["operationId"]
        for item in app.openapi()["paths"].values()
        for op in item.values()
        if isinstance(op, dict) and op.get("operationId") in expected
    }
    assert generated_operation_ids == set(expected)


def test_chat03_contract_metadata_is_loaded_directly_from_the_canonical_rc8_yaml():
    spec = load_openapi(CANON)
    owned = list(owned_operations(spec))
    assert len(list(iter_operations(spec))) == 113
    assert len(spec["paths"]) == 86
    assert len(spec["components"]["schemas"]) == 244
    assert len(owned) == 51
    assert all(operation.site_context in {"PUBLIC", "PREVIEW", "AUTH", "SITE", "GLOBAL"} for operation in owned)
    assert all(operation.rate_class for operation in owned)
    assert all(operation.responses and str(operation.success_status) in operation.responses for operation in owned)
    assert len({(operation.method, operation.path) for operation in owned}) == 51
