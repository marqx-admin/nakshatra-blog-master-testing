# Observability operating contract

Application/worker operational logs are structured and retained online for 30 days. Raw-IP security telemetry defaults to <=30 days, secret-access logs >=90 days, append-only audit events >=365 days online, and restore/DR evidence >=365 days. Never log credentials, password hashes, MFA/recovery material, bearer/session/Preview values, raw Idempotency-Key, signed private URLs, uploaded bytes, ArticleBody, full DB connection strings or private object-store credentials.

Metrics follow DOC-20 MET20 families and low-cardinality dimensions only. IDs such as post_id/media_id, full URL, raw query, email, IP, session/token, Redis key and arbitrary exception text are prohibited metric labels.

Trace sampling target: 10% successful public, 25% successful Admin, and 100% 5xx/timeouts/backup/restore/destructive security-sensitive/DLQ events. Full-fidelity traces retain 7 days. X-Request-ID remains the HTTP-visible correlation identity; internal trace/span IDs are telemetry-only.

Readiness uses three consecutive failures to remove a dependency and two successes to recover unless a hard failure is reported. Health output contains safe component state only.
