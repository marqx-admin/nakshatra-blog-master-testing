# CHAT11 infrastructure

Operational/deployment sources for BLOG-DOC-20/23/24. This directory does not redefine application semantics, database DDL, API transport, worker jobs, or tenant authority.

Key entry points:
- `local/compose.yaml`: dependency profiles plus optional application profiles; individual public sites are independently selectable.
- `images/*.Dockerfile`: one public-site image per selected site build, plus Admin/API/Worker/migration classes.
- `config/`: environment schema/examples for development, test, staging and production.
- `templates/ci/`: AWS CodeBuild buildspecs used by the CodePipeline reference model fixed by DOC-24.
- `templates/kubernetes/`: digest-promotion workload templates and environment overlays.
- `templates/aws/cloudformation/`: provider wiring skeletons for AWS non-production/production accounts.
- `observability/`: OpenTelemetry/Prometheus/Grafana configuration.
- `scripts/`: validation, release-manifest, migration-control and backup/DR tools.
- `runbooks/`: operational procedures for release, rollback, backup and disaster recovery.

Production secrets are never committed. `*_FILE` values identify runtime-mounted secret files only.
