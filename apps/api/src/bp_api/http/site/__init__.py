"""CHAT04 SITE editorial HTTP transport.

This package is intentionally separate from CHAT03's ``http.admin_site`` module.
CHAT00 wires ``build_router`` into the master API composition after integration.
"""

from .routes import CHAT04_OPERATION_IDS, EditorialTransportServices, build_router, chat04_operations

__all__ = [
    "CHAT04_OPERATION_IDS",
    "EditorialTransportServices",
    "build_router",
    "chat04_operations",
]
