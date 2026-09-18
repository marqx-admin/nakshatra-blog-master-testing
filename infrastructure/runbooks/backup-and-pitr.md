# PostgreSQL backup / PITR runbook

Authority: DOC-20 sections 25-26 and DOC-24 sections 28/35.

Production PostgreSQL uses encrypted base backups at least every 24 hours plus continuous WAL/PITR, with 35-day rolling recoverability. Daily integrity/manifest verification is mandatory. Release preflight requires WAL/archive lag <=5 minutes, latest successful base backup age <=24 hours, and verification PASS; the 26-hour value is the alert threshold, not the release gate.

Backup encryption keys are separate operational/KMS authority and never embedded in repository or backup files. Ordinary Admin users have no restore capability.
