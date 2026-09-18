"""PostgreSQL engine construction for the DOC-23 ports/adapters boundary.

DDL is deliberately absent. Raw SQL under ``database/migrations`` is the schema authority.
The API and Worker must use separate credentials/pools selected by composition code.
"""
from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine


@dataclass(frozen=True, slots=True)
class PoolBudget:
    """Per-process pool budget constrained by DOC-20/DOC-23."""

    pool_size: int
    max_overflow: int = 0

    def __post_init__(self) -> None:
        if self.pool_size < 1:
            raise ValueError("pool_size must be >= 1")
        if self.max_overflow < 0:
            raise ValueError("max_overflow must be >= 0")

    @property
    def total_connections(self) -> int:
        return self.pool_size + self.max_overflow



def validate_api_replica_pool_budget(*budgets: PoolBudget) -> None:
    """Enforce the DOC-20/DOC-23 <=20 total connections per API replica cap.

    Site-runtime and platform-runtime pools use separate credentials, but they still belong
    to one API replica connection budget. Composition code must validate the combined
    configured maxima before creating/starting the replica.
    """
    if not budgets:
        raise ValueError("at least one API pool budget is required")
    if sum(b.total_connections for b in budgets) > 20:
        raise ValueError("combined API replica pool budget may not exceed 20 connections")


def validate_aggregate_connection_budget(*, max_connections: int, configured_maximum: int) -> None:
    """Enforce DOC-20's >=30% PostgreSQL connection headroom invariant.

    Composition/infrastructure code supplies the database ``max_connections`` and the
    aggregate configured maxima for API, Worker and operational pools.
    """
    if max_connections < 1:
        raise ValueError("max_connections must be positive")
    if configured_maximum < 0:
        raise ValueError("configured_maximum must be non-negative")
    # Multiplication avoids floating-point rounding at the 70% boundary.
    if configured_maximum * 100 > max_connections * 70:
        raise ValueError("aggregate configured pools exceed 70% of PostgreSQL max_connections")

def _validate_postgres_url(dsn: str) -> None:
    if not dsn.startswith("postgresql+psycopg://"):
        raise ValueError("PostgreSQL DSN must use SQLAlchemy's postgresql+psycopg driver")


def _create_engine(
    dsn: str,
    budget: PoolBudget,
    *,
    application_name: str,
    pool_timeout_seconds: float,
) -> Engine:
    _validate_postgres_url(dsn)
    return create_engine(
        dsn,
        pool_pre_ping=True,
        pool_size=budget.pool_size,
        max_overflow=budget.max_overflow,
        pool_timeout=pool_timeout_seconds,
        pool_reset_on_return="rollback",
        connect_args={"application_name": application_name},
    )


def create_site_engine(
    dsn: str,
    *,
    budget: PoolBudget,
    application_name: str = "bp-site-runtime",
) -> Engine:
    """Create an interactive SITE runtime pool.

    The DSN is expected to authenticate as ``db_site_runtime``. DOC-20 caps one API
    replica at 20 connections and its interactive pool checkout timeout at 3 seconds.
    """
    if budget.total_connections > 20:
        raise ValueError("SITE/API process pool budget may not exceed 20 connections")
    return _create_engine(
        dsn,
        budget,
        application_name=application_name,
        pool_timeout_seconds=3.0,
    )


def create_platform_engine(
    dsn: str,
    *,
    budget: PoolBudget,
    application_name: str = "bp-platform-runtime",
) -> Engine:
    """Create the explicit GLOBAL platform pool using ``db_platform_runtime`` credentials."""
    if budget.total_connections > 20:
        raise ValueError("Platform/API process pool budget may not exceed 20 connections")
    return _create_engine(
        dsn,
        budget,
        application_name=application_name,
        pool_timeout_seconds=3.0,
    )


def create_worker_site_engine(
    dsn: str,
    *,
    budget: PoolBudget,
    application_name: str = "bp-worker-site",
) -> Engine:
    """Create a worker SITE pool with the DOC-20 <=10 connection per-process cap.

    Worker checkout may wait at most 10 seconds under the DOC-20 pool budget.
    """
    if budget.total_connections > 10:
        raise ValueError("Worker process pool budget may not exceed 10 connections")
    return _create_engine(
        dsn,
        budget,
        application_name=application_name,
        pool_timeout_seconds=10.0,
    )
