# bp-adapters-queue

CHAT05 Celery/Redis broker adapter. Implements canonical job routing, broker-private durable delayed publishing transport, dead-letter recording/replay, and promotion recovery without making broker data authoritative application state. It must use a Redis broker plane separate from the DOC-18 control/cache Redis plane.
