#!/usr/bin/env python3
"""Live PostgreSQL verification for the CHAT02 persistence candidate.

Required environment:
  POSTGRES_DSN  psycopg DSN for a verification/bootstrap identity that may SET ROLE
                to db_site_runtime and db_platform_runtime.

The database must be built from the CHAT02 migration chain and must have
``database/seeds/isolation-fixtures.sql`` applied. The verifier does not weaken RLS.
"""
from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Callable
from uuid import UUID

try:
    import psycopg
    from psycopg import errors
except ImportError:
    print("NOT_EXECUTED: psycopg is not installed in this environment")
    raise SystemExit(2)

DSN = os.getenv("POSTGRES_DSN")
if not DSN:
    print("NOT_EXECUTED: POSTGRES_DSN is required")
    raise SystemExit(2)

HERE = Path(__file__).resolve().parent
CONTRACT = json.loads((HERE / "doc08-contract.json").read_text())
SITE1 = UUID("10000000-0000-4000-8000-000000000001")
SITE2 = UUID("10000000-0000-4000-8000-000000000002")
POST1 = UUID("34000000-0000-4000-8000-000000000001")
POST2 = UUID("34000000-0000-4000-8000-000000000002")
CAT2 = UUID("30000000-0000-4000-8000-000000000002")

Result = tuple[str, str, str]
results: list[Result] = []


def record(name: str, fn: Callable[[], None]) -> None:
    try:
        fn()
    except Exception as exc:  # evidence runner intentionally records exact exception
        results.append((name, "FAIL", f"{type(exc).__name__}: {exc}"))
    else:
        results.append((name, "PASS", ""))


def connect():
    return psycopg.connect(DSN)


def scalar(sql: str, params: tuple[object, ...] = ()):
    with connect() as conn, conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchone()[0]


def set_role(cur, role: str) -> None:
    if role not in {"db_site_runtime", "db_platform_runtime", "db_migrator"}:
        raise ValueError("unexpected verification role")
    cur.execute(f"SET ROLE {role}")


def set_site(cur, site_id: UUID) -> None:
    cur.execute("SELECT set_config('app.site_id', %s, true)", (str(site_id),))


def expect_sqlstate(fn: Callable[[], None], states: set[str]) -> None:
    try:
        fn()
    except psycopg.Error as exc:
        if exc.sqlstate not in states:
            raise AssertionError(f"expected SQLSTATE {sorted(states)}, got {exc.sqlstate}: {exc}") from exc
        return
    raise AssertionError(f"expected SQLSTATE {sorted(states)} but statement succeeded")


def check_fixture_ready() -> None:
    assert scalar("SELECT count(*) FROM posts WHERE post_id IN (%s,%s)", (POST1, POST2)) == 2


try:
    check_fixture_ready()
except Exception as exc:
    print(f"NOT_EXECUTED: live isolation fixtures are missing/unreachable: {type(exc).__name__}: {exc}")
    raise SystemExit(2)


record("migration_schema_exact_33_tables", lambda: (
    None if scalar("SELECT count(*) FROM pg_tables WHERE schemaname='public'") == 33
    else (_ for _ in ()).throw(AssertionError("public table count is not 33"))
))


def table_split() -> None:
    actual = {row[0] for row in _rows("SELECT tablename FROM pg_tables WHERE schemaname='public'")}
    expected = set(CONTRACT["tables"])
    assert actual == expected
    assert len([t for t, v in CONTRACT["tables"].items() if v["scope"] == "SITE"]) == 20
    assert len([t for t, v in CONTRACT["tables"].items() if v["scope"] == "GLOBAL"]) == 13


def _rows(sql: str, params: tuple[object, ...] = ()):
    with connect() as conn, conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


record("table_classification_20_site_13_global", table_split)


def columns_types_nullability() -> None:
    for table, spec in CONTRACT["tables"].items():
        rows = _rows(
            """
            SELECT a.attname, format_type(a.atttypid,a.atttypmod), NOT a.attnotnull
            FROM pg_attribute a
            JOIN pg_class c ON c.oid=a.attrelid
            JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='public' AND c.relname=%s AND a.attnum>0 AND NOT a.attisdropped
            """,
            (table,),
        )
        actual = {name: (typ, nullable) for name, typ, nullable in rows}
        expected = {name: (c["type"], c["nullable"]) for name, c in spec["columns"].items()}
        assert actual == expected, table


record("columns_types_nullability", columns_types_nullability)


def constraint_families() -> None:
    rows = _rows(
        """
        SELECT co.contype, count(*)
        FROM pg_constraint co JOIN pg_class c ON c.oid=co.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' GROUP BY co.contype
        """
    )
    counts = dict(rows)
    assert counts.get("p") == 33
    assert counts.get("u") == 39
    assert counts.get("f") == 72
    assert counts.get("c") == 77


record("pk_fk_unique_check_constraints", constraint_families)


def baseline_indexes() -> None:
    names = {row[0] for row in _rows("SELECT indexname FROM pg_indexes WHERE schemaname='public'")}
    expected = {x["name"] for x in CONTRACT["required_baseline_indexes"]}
    missing = expected - names
    assert not missing, sorted(missing)


record("required_70_indexes_uniqueness_objects", baseline_indexes)


def trigger_inventory() -> None:
    immutable = scalar(
        """
        SELECT count(*) FROM pg_trigger tr JOIN pg_class c ON c.oid=tr.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND NOT tr.tgisinternal AND tr.tgname LIKE 'trg_%__site_id_immutable'
        """
    )
    assert immutable == 20
    assert scalar("SELECT count(*) FROM pg_trigger tr JOIN pg_class c ON c.oid=tr.tgrelid WHERE c.relname='roles' AND tr.tgname='trg_roles__integrity' AND NOT tr.tgisinternal") == 1


record("required_triggers", trigger_inventory)


def permission_seeds() -> None:
    assert scalar("SELECT count(*) FROM permissions") == 69
    assert scalar("SELECT count(*) FROM permissions WHERE scope='SITE'") == 44
    assert scalar("SELECT count(*) FROM permissions WHERE scope='GLOBAL'") == 25
    assert scalar("SELECT count(*) FROM permission_prerequisites") == 57


record("permission_seed_69_and_prerequisites", permission_seeds)


def fourteen_sites() -> None:
    assert scalar("SELECT count(*) FROM sites WHERE site_key ~ '^SITE-(0[1-9]|1[0-4])$'") == 14
    assert scalar("SELECT count(*) FROM domains d JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$' AND d.is_canonical AND d.is_active") == 14
    assert scalar("SELECT count(*) FROM site_settings ss JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'") == 14
    assert scalar("SELECT count(*) FROM navigation_menus nm JOIN sites s USING(site_id) WHERE s.site_key ~ '^SITE-(0[1-9]|1[0-4])$'") == 28


record("fourteen_site_seed_integrity", fourteen_sites)


def rls_catalog() -> None:
    site_tables = [t for t, v in CONTRACT["tables"].items() if v["scope"] == "SITE"]
    for table in site_tables:
        row = _rows(
            """SELECT c.relrowsecurity,c.relforcerowsecurity
               FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
               WHERE n.nspname='public' AND c.relname=%s""",
            (table,),
        )
        assert row == [(True, True)], table
        assert scalar("SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename=%s AND cmd='ALL'", (table,)) == 1


record("rls_enable_force_policy_all_20", rls_catalog)


def same_site_read_write() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        with conn.transaction():
            set_site(cur, SITE1)
            cur.execute("SELECT count(*) FROM posts WHERE post_id=%s", (POST1,))
            assert cur.fetchone()[0] == 1
            cur.execute("INSERT INTO categories(site_id,category_id,name,slug) VALUES (%s,%s,%s,%s)", (SITE1, UUID("39000000-0000-4000-8000-000000000010"), "Runtime Probe", "runtime-probe"))
            cur.execute("UPDATE categories SET description='ok' WHERE category_id=%s", (UUID("39000000-0000-4000-8000-000000000010"),))
            assert cur.rowcount == 1
            raise _RollbackProbe


class _RollbackProbe(Exception):
    pass


def same_site_wrapper() -> None:
    try:
        same_site_read_write()
    except _RollbackProbe:
        return


record("rls_positive_same_site_read_write", same_site_wrapper)


def cross_site_read() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        with conn.transaction():
            set_site(cur, SITE1)
            cur.execute("SELECT count(*) FROM posts WHERE post_id=%s", (POST2,))
            assert cur.fetchone()[0] == 0


record("cross_site_read_denial", cross_site_read)


def cross_site_write() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        def attack() -> None:
            with conn.transaction():
                set_site(cur, SITE1)
                cur.execute("INSERT INTO categories(site_id,category_id,name,slug) VALUES (%s,%s,%s,%s)", (SITE2, UUID("39000000-0000-4000-8000-000000000011"), "Foreign", "foreign"))
        expect_sqlstate(attack, {"42501"})


record("cross_site_write_denial", cross_site_write)


def cross_site_relationship() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        def attack() -> None:
            with conn.transaction():
                set_site(cur, SITE1)
                cur.execute("INSERT INTO post_categories(site_id,post_id,category_id) VALUES (%s,%s,%s)", (SITE1, POST1, CAT2))
        expect_sqlstate(attack, {"23503"})


record("cross_site_relationship_denial", cross_site_relationship)


def missing_context() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        with conn.transaction():
            cur.execute("SELECT app.current_site_id()")
            assert cur.fetchone()[0] is None
            cur.execute("SELECT count(*) FROM posts")
            assert cur.fetchone()[0] == 0


record("missing_site_context_denial", missing_context)


def invalid_context() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        with conn.transaction():
            set_site(cur, UUID("ffffffff-ffff-4fff-8fff-ffffffffffff"))
            cur.execute("SELECT count(*) FROM posts")
            assert cur.fetchone()[0] == 0
        def malformed() -> None:
            with conn.transaction():
                cur.execute("SELECT set_config('app.site_id','not-a-uuid',true)")
                cur.execute("SELECT app.current_site_id()")
        expect_sqlstate(malformed, {"22P02"})


record("invalid_site_context_fail_closed", invalid_context)


def context_cleanup() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_site_runtime")
        with conn.transaction():
            set_site(cur, SITE1)
            cur.execute("SELECT app.current_site_id()")
            assert UUID(str(cur.fetchone()[0])) == SITE1
        with conn.transaction():
            cur.execute("SELECT app.current_site_id()")
            assert cur.fetchone()[0] is None
            cur.execute("SELECT count(*) FROM posts")
            assert cur.fetchone()[0] == 0


record("transaction_local_context_cleanup", context_cleanup)


def role_posture() -> None:
    rows = _rows("SELECT rolname,rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname IN ('db_migrator','db_site_runtime','db_platform_runtime','db_global_read_owner')")
    by_name = {r[0]: r[1:] for r in rows}
    assert by_name["db_site_runtime"] == (True, False, False, False, False)
    assert by_name["db_platform_runtime"] == (True, False, False, False, False)
    assert by_name["db_migrator"] == (True, False, False, False, True)
    assert by_name["db_global_read_owner"] == (False, False, False, False, True)


record("runtime_roles_cannot_bypass_rls", role_posture)


def global_boundary() -> None:
    with connect() as conn, conn.cursor() as cur:
        set_role(cur, "db_platform_runtime")
        with conn.transaction():
            cur.execute("SELECT count(*) FROM sites")
            assert cur.fetchone()[0] >= 14
        def site_read() -> None:
            with conn.transaction():
                cur.execute("SELECT count(*) FROM posts")
        expect_sqlstate(site_read, {"42501"})


record("explicit_global_boundary", global_boundary)


def concurrency_cas() -> None:
    current = scalar("SELECT version FROM posts WHERE post_id=%s", (POST1,))
    barrier = threading.Barrier(2)
    outcomes: list[int | None] = []
    lock = threading.Lock()

    def worker() -> None:
        with connect() as conn, conn.cursor() as cur:
            set_role(cur, "db_site_runtime")
            with conn.transaction():
                set_site(cur, SITE1)
                barrier.wait(timeout=10)
                cur.execute(
                    "UPDATE posts SET version=version+1,updated_at=now() WHERE site_id=app.current_site_id() AND post_id=%s AND version=%s RETURNING version",
                    (POST1, current),
                )
                row = cur.fetchone()
                with lock:
                    outcomes.append(None if row is None else int(row[0]))

    threads = [threading.Thread(target=worker), threading.Thread(target=worker)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=20)
    assert not any(thread.is_alive() for thread in threads)
    assert sorted(outcomes, key=lambda x: (-1 if x is None else x)) == [None, current + 1]
    assert scalar("SELECT version FROM posts WHERE post_id=%s", (POST1,)) == current + 1


record("optimistic_concurrency_exactly_one_winner", concurrency_cas)


def fixture_collisions() -> None:
    assert scalar("SELECT count(*) FROM posts WHERE slug='future-of-ai' AND site_id IN (%s,%s)", (SITE1, SITE2)) == 2
    assert scalar("SELECT count(*) FROM categories WHERE name='Technology' AND site_id IN (%s,%s)", (SITE1, SITE2)) == 2
    assert scalar("SELECT count(*) FROM tags WHERE name='AI' AND site_id IN (%s,%s)", (SITE1, SITE2)) == 2
    assert scalar("SELECT count(*) FROM author_site_profiles WHERE display_name='Test Author' AND site_id IN (%s,%s)", (SITE1, SITE2)) == 2
    assert scalar("SELECT count(*) FROM media WHERE original_filename='hero.jpg' AND site_id IN (%s,%s)", (SITE1, SITE2)) == 2


record("isolation_collision_fixtures", fixture_collisions)

for name, status, detail in results:
    print(f"{status}: {name}{' - ' + detail if detail else ''}")

failed = [r for r in results if r[1] == "FAIL"]
print(f"SUMMARY: PASS={sum(r[1]=='PASS' for r in results)} FAIL={len(failed)} NOT_EXECUTED=0")
raise SystemExit(1 if failed else 0)
