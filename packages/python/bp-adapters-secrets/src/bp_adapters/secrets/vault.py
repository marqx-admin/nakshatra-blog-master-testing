from __future__ import annotations

import asyncio
import base64
import json
from pathlib import Path
import threading
import urllib.error
import urllib.request


class VaultTransitSecretProvider:
    """Vault Transit HTTPS adapter with encrypt/decrypt/HMAC purpose binding.

    Production may either inject a short-lived token directly (primarily useful
    for controlled tests/agent sinks) or provide the DOC-24 workload auth role.
    In role mode the adapter exchanges the Kubernetes service-account JWT for a
    short-lived Vault client token and never persists it outside this process.
    """

    def __init__(
        self,
        *,
        base_url: str,
        token: str | None = None,
        role: str | None = None,
        key_name: str = "bp-security",
        timeout: float = 5.0,
        kubernetes_jwt_path: str = "/var/run/secrets/kubernetes.io/serviceaccount/token",
        kubernetes_auth_mount: str = "kubernetes",
    ):
        if not base_url.startswith("https://"):
            raise ValueError("Vault endpoint must use HTTPS")
        if not token and not role:
            raise ValueError("Vault token or workload auth role is required")
        self.base_url = base_url.rstrip("/")
        self._client_token = token
        self.role = role
        self.key_name = key_name
        self.timeout = timeout
        self.kubernetes_jwt_path = kubernetes_jwt_path
        self.kubernetes_auth_mount = kubernetes_auth_mount.strip("/")
        self._auth_lock = threading.Lock()

    async def encrypt(self, plaintext: bytes, purpose: str) -> bytes:
        body = {
            "plaintext": base64.b64encode(plaintext).decode(),
            "context": base64.b64encode(purpose.encode()).decode(),
        }
        out = await asyncio.to_thread(self._post, f"/v1/transit/encrypt/{self.key_name}", body)
        return out["data"]["ciphertext"].encode()

    async def decrypt(self, ciphertext: bytes, purpose: str) -> bytes:
        body = {
            "ciphertext": ciphertext.decode(),
            "context": base64.b64encode(purpose.encode()).decode(),
        }
        out = await asyncio.to_thread(self._post, f"/v1/transit/decrypt/{self.key_name}", body)
        return base64.b64decode(out["data"]["plaintext"])

    async def hmac_digest(self, value: bytes, purpose: str) -> str:
        body = {
            "input": base64.b64encode(purpose.encode() + b"\0" + value).decode(),
            "algorithm": "sha2-256",
        }
        out = await asyncio.to_thread(self._post, f"/v1/transit/hmac/{self.key_name}/sha2-256", body)
        digest = out["data"]["hmac"]
        return digest.rsplit(":", 1)[-1]

    def _token(self) -> str:
        if self._client_token:
            return self._client_token
        with self._auth_lock:
            if self._client_token:
                return self._client_token
            if not self.role:
                raise RuntimeError("Vault workload role is unavailable")
            jwt = Path(self.kubernetes_jwt_path).read_text(encoding="utf-8").strip()
            if not jwt:
                raise RuntimeError("Vault Kubernetes workload identity token is empty")
            body = {"role": self.role, "jwt": jwt}
            out = self._request(
                f"/v1/auth/{self.kubernetes_auth_mount}/login",
                body,
                token=None,
            )
            token = str(out.get("auth", {}).get("client_token") or "")
            if not token:
                raise RuntimeError("Vault workload authentication returned no client token")
            self._client_token = token
            return token

    def _post(self, path: str, body: dict) -> dict:
        token = self._token()
        try:
            return self._request(path, body, token=token)
        except urllib.error.HTTPError as exc:
            # A rotated/expired workload token is recoverable once. Re-auth is
            # intentionally available only in role mode.
            if exc.code not in {401, 403} or not self.role:
                raise
            with self._auth_lock:
                if self._client_token == token:
                    self._client_token = None
            return self._request(path, body, token=self._token())

    def _request(self, path: str, body: dict, *, token: str | None) -> dict:
        headers = {"Content-Type": "application/json"}
        if token:
            headers["X-Vault-Token"] = token
        req = urllib.request.Request(
            self.base_url + path,
            data=json.dumps(body).encode(),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as resp:
            return json.loads(resp.read())
