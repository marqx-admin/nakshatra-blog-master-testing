-- System-managed website access levels. DB-MIG-019 owns the authoritative,
-- protected projection so every bootstrap path uses the same idempotent logic.
BEGIN;
SET ROLE db_migrator;
SELECT app.ensure_system_access_levels();
RESET ROLE;
COMMIT;
