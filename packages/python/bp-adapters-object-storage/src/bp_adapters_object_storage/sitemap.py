from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET

from bp_domain.context import SiteContext
from bp_domain.seo import SitemapEntry, shard_sitemap

_SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
_RESOURCE_ORDER = ("pages", "articles", "categories", "tags", "authors")


def _xml_bytes(element: ET.Element) -> bytes:
    return ET.tostring(element, encoding="utf-8", xml_declaration=True)


def _validate_entry(context: SiteContext, raw: dict) -> SitemapEntry:
    url = str(raw.get("url") or raw.get("canonical_url") or "").strip()
    resource_type = str(raw.get("resource_type") or raw.get("type") or "").strip().lower()
    if resource_type not in _RESOURCE_ORDER:
        raise ValueError("unknown DOC-16 sitemap resource type")
    parsed = urlsplit(url)
    if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.fragment:
        raise ValueError("sitemap URL must be an absolute fragment-free HTTPS canonical URL")
    if parsed.hostname.lower().rstrip(".") != context.canonical_domain.lower().rstrip("."):
        raise ValueError("sitemap candidate contains a cross-site/cross-domain URL")
    lastmod = raw.get("lastmod")
    return SitemapEntry(url=url, resource_type=resource_type, lastmod=None if lastmod in {None, ""} else str(lastmod))


def build_sitemap_resource_set(context: SiteContext, entries: list[dict]) -> dict[str, bytes]:
    """Build the complete DOC-16 site-local sitemap resource generation.

    Input entries must already satisfy DOC-16 eligibility. This layer revalidates the
    tenant/canonical-domain boundary, fixed resource classes, sort/shard rules, and
    emits no changefreq/priority fields.
    """
    canonical = [_validate_entry(context, raw) for raw in entries]
    shards = shard_sitemap(canonical)
    resources: dict[str, bytes] = {}
    child_paths: list[str] = []

    for resource_type in _RESOURCE_ORDER:
        groups = shards[resource_type]
        for index, group in enumerate(groups, 1):
            if not group:
                continue
            if resource_type == "pages":
                if index != 1:
                    raise ValueError("pages sitemap may not be sharded in the v1 page estate")
                path = "/sitemaps/pages.xml"
            else:
                path = f"/sitemaps/{resource_type}-{index}.xml"
            root = ET.Element("urlset", xmlns=_SITEMAP_NS)
            for entry in group:
                node = ET.SubElement(root, "url")
                ET.SubElement(node, "loc").text = entry.url
                if entry.lastmod is not None:
                    ET.SubElement(node, "lastmod").text = entry.lastmod
            resources[path] = _xml_bytes(root)
            child_paths.append(path)

    index_root = ET.Element("sitemapindex", xmlns=_SITEMAP_NS)
    # child_paths are already fixed type order then shard number ascending.
    for path in child_paths:
        node = ET.SubElement(index_root, "sitemap")
        ET.SubElement(node, "loc").text = f"https://{context.canonical_domain}{path}"
    resources["/sitemap.xml"] = _xml_bytes(index_root)
    return resources


def validate_sitemap_resource_set(context: SiteContext, resources: dict[str, bytes]) -> None:
    expected_prefixes = {
        "/sitemap.xml", "/sitemaps/pages.xml",
    }
    if "/sitemap.xml" not in resources:
        raise ValueError("sitemap generation must include the site-local sitemap index")
    for path, payload in resources.items():
        if path not in expected_prefixes and not any(
            path.startswith(f"/sitemaps/{kind}-") and path.endswith(".xml")
            for kind in ("articles", "categories", "tags", "authors")
        ):
            raise ValueError("unexpected sitemap resource name")
        root = ET.fromstring(payload)
        tag = root.tag.rsplit("}", 1)[-1]
        if path == "/sitemap.xml" and tag != "sitemapindex":
            raise ValueError("/sitemap.xml must be a sitemap index")
        if path != "/sitemap.xml" and tag != "urlset":
            raise ValueError("child sitemap must be a urlset")
        if path != "/sitemap.xml":
            urls = root.findall(f"{{{_SITEMAP_NS}}}url")
            if len(urls) > 25_000:
                raise ValueError("sitemap shard exceeds 25,000 URLs")
            locs = [node.findtext(f"{{{_SITEMAP_NS}}}loc") or "" for node in urls]
            if locs != sorted(locs):
                raise ValueError("sitemap URLs are not in canonical ascending order")
            for url in locs:
                parsed = urlsplit(url)
                if parsed.hostname is None or parsed.hostname.lower().rstrip(".") != context.canonical_domain.lower().rstrip("."):
                    raise ValueError("sitemap resource crosses site canonical domain")


class InMemorySitemapArtifactAdapter:
    """Atomic candidate/activation adapter for deterministic tests/local composition."""

    def __init__(self) -> None:
        self._candidates: dict[tuple[str, str], dict[str, bytes]] = {}
        self._active: dict[str, dict[str, bytes]] = {}

    async def build_candidate(self, context: SiteContext, *, entries: list[dict], sequence: int) -> str:
        resources = build_sitemap_resource_set(context, entries)
        validate_sitemap_resource_set(context, resources)
        digest = hashlib.sha256(b"".join(resources[path] for path in sorted(resources))).hexdigest()[:16]
        candidate = f"sitemap-{int(sequence)}-{digest}"
        self._candidates[(context.site_id, candidate)] = dict(resources)
        return candidate

    async def activate_candidate(self, context: SiteContext, *, candidate_id: str) -> None:
        key = (context.site_id, candidate_id)
        if key not in self._candidates:
            raise KeyError("same-site sitemap candidate not found")
        resources = self._candidates[key]
        validate_sitemap_resource_set(context, resources)
        self._active[context.site_id] = dict(resources)

    async def get_active_resource(self, site_id: str, path: str) -> bytes | None:
        return self._active.get(site_id, {}).get(path)


@dataclass(slots=True)
class S3SitemapArtifactAdapter:
    """Production sitemap artifact store with atomic pointer activation.

    Candidate resources are immutable generation objects.  A generation becomes
    visible only when one small active-pointer object is replaced after the full
    resource set has been read back and validated.  This keeps provider mechanics
    below DOC-16/DOC-18 semantics and avoids local filesystem state in staging/prod.
    """

    s3_client: object
    bucket: str
    prefix: str = "derived/sitemaps/v1"

    def __post_init__(self) -> None:
        self.prefix = self.prefix.strip("/")
        if not self.bucket:
            raise ValueError("sitemap artifact bucket is required")
        if not self.prefix:
            raise ValueError("sitemap artifact prefix is required")

    @staticmethod
    def _relative(path: str) -> str:
        if not path.startswith("/") or ".." in path.split("/"):
            raise ValueError("invalid sitemap resource path")
        relative = path.lstrip("/")
        if not relative or not relative.endswith(".xml"):
            raise ValueError("invalid sitemap resource path")
        return relative

    def _site_prefix(self, site_id: str) -> str:
        if not site_id or "/" in site_id or ".." in site_id:
            raise ValueError("invalid site_id")
        return f"{self.prefix}/sites/{site_id}"

    def _generation_prefix(self, site_id: str, candidate_id: str) -> str:
        if not candidate_id.startswith("sitemap-") or "/" in candidate_id or ".." in candidate_id:
            raise ValueError("invalid sitemap candidate id")
        return f"{self._site_prefix(site_id)}/generations/{candidate_id}"

    def _put(self, key: str, body: bytes, *, content_type: str) -> None:
        self.s3_client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=body,
            ContentType=content_type,
            CacheControl="no-store",
        )

    def _get(self, key: str) -> bytes | None:
        try:
            response = self.s3_client.get_object(Bucket=self.bucket, Key=key)
        except Exception as exc:
            response_meta = getattr(exc, "response", None)
            error_code = None
            if isinstance(response_meta, dict):
                error_code = str(response_meta.get("Error", {}).get("Code", ""))
            if error_code in {"404", "NoSuchKey", "NotFound"}:
                return None
            raise
        body = response.get("Body")
        if body is None:
            return None
        raw = body.read() if hasattr(body, "read") else body
        return bytes(raw)

    async def build_candidate(self, context: SiteContext, *, entries: list[dict], sequence: int) -> str:
        resources = build_sitemap_resource_set(context, entries)
        validate_sitemap_resource_set(context, resources)
        digest = hashlib.sha256(b"".join(resources[path] for path in sorted(resources))).hexdigest()[:16]
        candidate = f"sitemap-{int(sequence)}-{digest}"
        generation_prefix = self._generation_prefix(context.site_id, candidate)
        for public_path in sorted(resources):
            self._put(
                f"{generation_prefix}/{self._relative(public_path)}",
                resources[public_path],
                content_type="application/xml",
            )
        manifest = {
            "candidate_id": candidate,
            "site_id": context.site_id,
            "resources": sorted(resources),
        }
        self._put(
            f"{generation_prefix}/manifest.json",
            json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode("utf-8"),
            content_type="application/json",
        )
        return candidate

    async def activate_candidate(self, context: SiteContext, *, candidate_id: str) -> None:
        generation_prefix = self._generation_prefix(context.site_id, candidate_id)
        manifest_raw = self._get(f"{generation_prefix}/manifest.json")
        if manifest_raw is None:
            raise KeyError("same-site sitemap candidate not found")
        manifest = json.loads(manifest_raw.decode("utf-8"))
        if manifest.get("site_id") != context.site_id or manifest.get("candidate_id") != candidate_id:
            raise ValueError("sitemap candidate manifest ownership mismatch")
        resources: dict[str, bytes] = {}
        for public_path in manifest.get("resources") or []:
            if not isinstance(public_path, str):
                raise ValueError("invalid sitemap candidate manifest")
            payload = self._get(f"{generation_prefix}/{self._relative(public_path)}")
            if payload is None:
                raise ValueError("incomplete sitemap candidate generation")
            resources[public_path] = payload
        validate_sitemap_resource_set(context, resources)
        pointer = {
            "candidate_id": candidate_id,
            "site_id": context.site_id,
        }
        self._put(
            f"{self._site_prefix(context.site_id)}/active.json",
            json.dumps(pointer, sort_keys=True, separators=(",", ":")).encode("utf-8"),
            content_type="application/json",
        )

    async def get_active_resource(self, site_id: str, path: str) -> bytes | None:
        relative = self._relative(path)
        active_raw = self._get(f"{self._site_prefix(site_id)}/active.json")
        if active_raw is None:
            return None
        pointer = json.loads(active_raw.decode("utf-8"))
        if pointer.get("site_id") != site_id:
            raise ValueError("active sitemap pointer ownership mismatch")
        candidate_id = str(pointer.get("candidate_id") or "")
        generation_prefix = self._generation_prefix(site_id, candidate_id)
        manifest_raw = self._get(f"{generation_prefix}/manifest.json")
        if manifest_raw is None:
            return None
        manifest = json.loads(manifest_raw.decode("utf-8"))
        if path not in (manifest.get("resources") or []):
            return None
        return self._get(f"{generation_prefix}/{relative}")


@dataclass(slots=True)
class FilesystemSitemapArtifactAdapter:
    """Filesystem implementation with whole-generation atomic activation.

    Each candidate is written into an immutable generation directory. Activation is
    one atomic symlink replacement (`current`) so crawler resource serving can never
    observe a half-written generation. The provider/serving mount remains DOC-23/24
    deployment wiring rather than business authority.
    """

    root: Path

    def __init__(self, root: str | os.PathLike[str]) -> None:
        self.root = Path(root)

    def _site_root(self, site_id: str) -> Path:
        return self.root / "sites" / site_id

    async def build_candidate(self, context: SiteContext, *, entries: list[dict], sequence: int) -> str:
        resources = build_sitemap_resource_set(context, entries)
        validate_sitemap_resource_set(context, resources)
        digest = hashlib.sha256(b"".join(resources[path] for path in sorted(resources))).hexdigest()[:16]
        candidate = f"sitemap-{int(sequence)}-{digest}"
        site_root = self._site_root(context.site_id)
        generations = site_root / "generations"
        generations.mkdir(parents=True, exist_ok=True)
        final_dir = generations / candidate
        if final_dir.exists():
            return candidate
        temp_dir = Path(tempfile.mkdtemp(prefix=".candidate-", dir=str(generations)))
        try:
            for public_path, payload in resources.items():
                relative = public_path.lstrip("/")
                target = temp_dir / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(payload)
            os.replace(temp_dir, final_dir)
        except Exception:
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise
        return candidate

    async def activate_candidate(self, context: SiteContext, *, candidate_id: str) -> None:
        site_root = self._site_root(context.site_id)
        target = site_root / "generations" / candidate_id
        if not target.is_dir():
            raise KeyError("same-site sitemap candidate not found")
        # Validate the on-disk candidate before switching it live.
        resources: dict[str, bytes] = {}
        for file in target.rglob("*.xml"):
            resources["/" + file.relative_to(target).as_posix()] = file.read_bytes()
        validate_sitemap_resource_set(context, resources)
        site_root.mkdir(parents=True, exist_ok=True)
        tmp_link = site_root / f".current-{os.getpid()}-{candidate_id}"
        current = site_root / "current"
        try:
            if tmp_link.exists() or tmp_link.is_symlink():
                tmp_link.unlink()
            tmp_link.symlink_to(Path("generations") / candidate_id, target_is_directory=True)
            os.replace(tmp_link, current)
        finally:
            if tmp_link.exists() or tmp_link.is_symlink():
                tmp_link.unlink()

    async def get_active_resource(self, site_id: str, path: str) -> bytes | None:
        current = self._site_root(site_id) / "current"
        if not current.exists():
            return None
        target = current / path.lstrip("/")
        if not target.is_file():
            return None
        return target.read_bytes()
