# Release and rollback runbook

Build once and promote the identical immutable release manifest/image digests from Staging to Production. Production deployment must never rebuild source. Production requires exact-candidate QA21 evidence and protected manual approval.

Rollout order: release lock; verify manifest/digests/OpenAPI/migration checksums; backup/PITR and migration preflight; run approved M24-EXPAND migration job; API rolling update with maxUnavailable=0; independently drain/roll affected worker profiles; Admin if affected; only affected public sites one-by-one; publish already-built static assets; post-deploy host/SiteContext/auth/queue smoke; observe at least 30 minutes.

Application rollback restores prior immutable digests only when the database remains compatible. Reverse/down migration is never automatic. Breaking M24-CONTRACT work requires a later approved release/window; failed database changes are normally forward-fixed, with PITR reserved for true recovery events.
