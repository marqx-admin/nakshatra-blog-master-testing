# Browser / end-to-end harness

DOC-23 selects Playwright for browser E2E; DOC-21 keeps the QA21 IDs and evidence authority. The current root dependency graph intentionally does not yet materialize Playwright, so browser suites are not silently skipped or treated as PASS.

When the integrated candidate is available, the runner must use real canonical Hosts/TLS and the deterministic fixture version. It must preserve independent browser-tab SiteContext, exercise Admin and public routes, Preview, 404/410, publishing and wrong-site non-disclosure, and attach `EV21-UI` plus `EV21-HTTP` evidence where required.

`two-site-proof-plan.json` is the deliberate SITE-01/SITE-02 proof. It may emit `C12 - TWO_SITE_E2E_PASS` only after the real backend path executes and every required proof element passes with evidence.
