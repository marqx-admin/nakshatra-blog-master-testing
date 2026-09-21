from __future__ import annotations

from bp_domain.errors import Unavailable


class UnavailableSites:
    async def resolve_host(self, normalized_host):
        return None

    async def get_site_by_key(self, site_key):
        return None

    async def get_site_by_id(self, site_id):
        return None

    async def list_sites(self):
        return []


class UnavailableIdentities:
    async def get_principal(self, admin_id):
        return None

    async def find_principal_by_email(self, normalized_email):
        return None

    async def credential_verifier(self, admin_id):
        return None

    async def set_credential_verifier(self, admin_id, verifier):
        raise Unavailable("persistence unavailable")

    async def activate_invited_admin(self, admin_id):
        raise Unavailable("persistence unavailable")


class UnavailablePublicPages:
    async def resolve_page(self, *args, **kwargs):
        raise Unavailable("public persistence unavailable")

    async def resolve_preview(self, *args, **kwargs):
        raise Unavailable("public persistence unavailable")


class UnavailableGlobalOperations:
    async def execute(self, *args, **kwargs):
        raise Unavailable("global persistence unavailable")

    async def compensate_created_admin(self, admin_id):
        raise Unavailable("global persistence unavailable")


class NullAudit:
    async def append(self, *args, **kwargs):
        return None


class UnavailableMail:
    async def send(self, *args, **kwargs):
        raise Unavailable("mail provider unavailable")
