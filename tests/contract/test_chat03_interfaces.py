from bp_domain.context import ContextKind, ContextSource, GlobalContext, SiteContext
from bp_domain.errors import (
    BadRequest,
    Denied,
    IdempotencyKeyReuse,
    NotFound,
    RateLimited,
    StateConflict,
    Unauthenticated,
    Unavailable,
    ValidationFault,
    VersionConflict,
)
from bp_ports import DownstreamEffectsPort, GlobalOperationsPort, GlobalTransactionPort, SiteTransactionPort


def test_context_classes_are_scope_distinct():
    global_ctx = GlobalContext(ContextKind.GLOBAL, ContextSource.GLOBAL_AUTHORITY, "req")
    assert not isinstance(global_ctx, SiteContext)


def test_canonical_error_codes_and_statuses_are_stable():
    classes = {
        BadRequest: ("BAD_REQUEST", 400),
        Unauthenticated: ("UNAUTHENTICATED", 401),
        Denied: ("DENIED", 403),
        NotFound: ("NOT_FOUND", 404),
        VersionConflict: ("VERSION_CONFLICT", 409),
        StateConflict: ("STATE_CONFLICT", 409),
        IdempotencyKeyReuse: ("IDEMPOTENCY_KEY_REUSE", 409),
        ValidationFault: ("VALIDATION_FAILED", 422),
        RateLimited: ("RATE_LIMITED", 429),
        Unavailable: ("SERVICE_UNAVAILABLE", 503),
    }
    for cls, expected in classes.items():
        assert (cls.code, cls.status) == expected


def test_parallel_chat_port_interfaces_are_importable():
    assert SiteTransactionPort is not None
    assert GlobalTransactionPort is not None
    assert DownstreamEffectsPort is not None
    assert GlobalOperationsPort is not None
