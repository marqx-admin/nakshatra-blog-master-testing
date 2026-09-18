# bp-observability

Site-aware, privacy-safe instrumentation primitives implementing the DOC-20 observability boundary without creating business semantics. The package provides correlation context, structured JSON logging, secret redaction, anti-flap readiness state, and metric-label cardinality guards. Application owners can adopt these interfaces without moving SiteContext authorization into telemetry.
