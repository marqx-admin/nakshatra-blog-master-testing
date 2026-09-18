from __future__ import annotations

import hashlib
import hmac
import secrets

from cryptography.fernet import Fernet


class LocalEnvelopeSecretProvider:
    """Local/test adapter only. Production binds a managed secret provider."""

    def __init__(self, key: bytes | None = None, *, hmac_key: bytes | None = None) -> None:
        self._f = Fernet(key or Fernet.generate_key())
        self._hmac_key = hmac_key or secrets.token_bytes(32)

    async def encrypt(self, plaintext: bytes, purpose: str) -> bytes:
        return self._f.encrypt(purpose.encode() + b"\0" + plaintext)

    async def decrypt(self, ciphertext: bytes, purpose: str) -> bytes:
        raw = self._f.decrypt(ciphertext)
        prefix = purpose.encode() + b"\0"
        if not raw.startswith(prefix):
            raise ValueError("secret purpose mismatch")
        return raw[len(prefix):]

    async def hmac_digest(self, value: bytes, purpose: str) -> str:
        return hmac.new(self._hmac_key, purpose.encode() + b"\0" + value, hashlib.sha256).hexdigest()
