# Backup / PITR / disaster recovery harness

DOC-20 owns RPO/RTO and restore evidence; DOC-24 owns operational deployment/recovery wiring; DOC-21 QA21-DR defines the release tests. `dr20-recovery-registry.json` records the frozen recovery targets without claiming execution.

Release evidence must come from a disposable real restore environment and include backup identity/checksum, restore timeline, measured RPO/RTO, PostgreSQL integrity, RLS/cross-site isolation, audit/security revalidation, media-private-original behavior and derived-system rebuild outcomes. A runbook review alone is not PASS.
