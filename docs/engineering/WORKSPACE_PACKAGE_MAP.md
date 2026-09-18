# Workspace and package map

## Deployable ownership containers

`apps/sites/site-*` — 14 independent public presentation packages.
`apps/admin` — one Central Admin container.
`apps/api` — one Python API entrypoint container; Node manifest is orchestration bridge only.
`apps/worker` — one Python Worker entrypoint container; Node manifest is orchestration bridge only.

## Shared TypeScript boundaries

`api-contract` — canonical generated wire types only after RC7 verification.
`api-client-public` — public operations only, once generated/approved.
`api-client-admin` — AUTH/SITE/GLOBAL Admin transport only, once generated/approved.
`public-contracts` — DOC-13 canonical semantic data contract boundary, no invented fields.
`shared-utils` — deterministic pure/site-neutral utilities.
`tooling-config` — engineering config only.

None may contain Header/Footer/cards/buttons/layout/theme/assets, tenant-specific mutable state or imports from a site app.

## Python boundaries

`bp_domain` -> pure/domain only.
`bp_ports` -> `bp_domain`.
`bp_application` -> `bp_domain` + `bp_ports`.
`bp_background_contracts` -> pure/domain value contracts.
`bp_adapters.*` -> ports/domain + provider library when later implemented.
`bp_api` / `bp_worker` -> application + selected adapters; never each other's entrypoint.
`bp_observability` -> telemetry adapter boundary, no business decisions.
`bp_test_support` -> test-only helpers.
