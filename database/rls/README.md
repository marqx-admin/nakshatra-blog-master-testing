# DOC-04 / DOC-08 PostgreSQL isolation implementation

The executable RLS authority is the ordered raw-SQL migration chain, especially DB-MIG-001, DB-MIG-012, DB-MIG-013 and DB-MIG-014. This directory is a read-only implementation locator and does **not** define a second schema.

All 20 canonical SITE-owned tables are listed in `site_owned_tables.txt` and `policy-matrix.tsv`. DB-MIG-013 applies `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, and one `FOR ALL` policy with both `USING` and `WITH CHECK` equal to the site-owned row's `site_id = app.current_site_id()` condition. `app.current_site_id()` uses `NULLIF(current_setting('app.site_id', true), '')::uuid`, so missing context yields NULL and therefore exposes no SITE rows; malformed UUID context fails instead of broadening scope.

Normal runtime roles are NOBYPASSRLS. SITE operations establish the trusted UUID transaction-locally on the same physical SQLAlchemy/Psycopg connection. GLOBAL operations use the separate platform credential/path and receive no SITE-table privileges. `db_global_read_owner` is NOLOGIN and reserved only for narrowly approved future SECURITY DEFINER global-read helpers; this CHAT02 implementation adds no tenant-blind helper that DOC-08 did not specify.
