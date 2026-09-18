# EMBED provider registry

`embed-provider-registry.v1.json` is the authoritative runtime allowlist source introduced by DOC-07 v1.0-RC2.

The registry is intentionally empty until the project owner approves a real provider. This is not a blocked contract: the behavior is deterministic and fail-closed. Each future approved provider entry must declare `provider_key` plus either:

- `source_kind: "URL"` and a non-empty `allowed_hosts` HTTPS hostname allowlist; or
- `source_kind: "ID"` and an anchored `id_pattern`.

Provider entries are configuration/change-control data, not new product features. Unknown providers and URLs outside the approved host list are rejected.
