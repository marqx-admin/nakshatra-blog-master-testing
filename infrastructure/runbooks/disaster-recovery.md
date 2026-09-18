# Disaster recovery runbook

Authority: DOC-20 sections 27-31 and DOC-24 release safeguards.

Canonical order: isolate unsafe writes and preserve evidence; provision clean recovery infrastructure; restore PostgreSQL base + WAL/PITR; verify schema version, roles, RLS/FORCE RLS, permission/site baselines and representative wrong-site probes; restore private media originals; redeploy stateless services and revoke sessions when freshness is uncertain; initialize Redis clean; recover broker or reconcile inferable work; rebuild search/sitemaps/media variants per site; warm caches gradually; reopen traffic in stages; close only after RPO/RTO, audit/security and isolation evidence is recorded.

Targets: PostgreSQL RPO <=5m/RTO <=60m; private media originals RPO <=15m/RTO <=2h; stateless API/Admin/Auth RTO <=30m after infrastructure; broker accepted work catastrophic RPO <=5m/RTO <=30m; public search <=2h site service and <=4h all-site rebuild; sitemap <=2h all ACTIVE sites; media variants <=4h after originals; ephemeral Admin/session state is not restored stale.

Drills: DB PITR quarterly; media-original recovery quarterly; Redis/search/sitemap rebuild quarterly; broker/worker restart quarterly; full platform DR game day every 6 months.
