from __future__ import annotations

from io import BytesIO

from bp_domain.media import VARIANT_BY_KEY, square_crop_plan, uncropped_size, validate_dimensions
from bp_ports.derived import DecodedMedia, GeneratedMedia


class VipsMediaProcessor:
    """DOC-23 libvips/pyvips production processor; pyvips is imported only at runtime."""

    @staticmethod
    def _vips():
        try:
            import pyvips  # type: ignore
        except ImportError as exc:
            raise RuntimeError("pyvips/libvips runtime is required by DOC-23 for production media processing") from exc
        return pyvips

    async def inspect(self, *, data: bytes, mime_type: str) -> DecodedMedia:
        pyvips = self._vips()
        image = pyvips.Image.new_from_buffer(data, "", access="sequential", fail=True)
        pages = int(image.get("n-pages")) if image.get_typeof("n-pages") else 1
        if pages != 1:
            validate_dimensions(int(image.width), int(image.height), frames=pages)
        try:
            image = image.autorot()
        except Exception:
            pass
        validate_dimensions(int(image.width), int(image.height), frames=pages)
        return DecodedMedia(
            width=int(image.width), height=int(image.height), frames=pages,
            has_alpha=bool(image.hasalpha()), source_mime_type=mime_type,
        )

    async def generate_variant(self, *, data: bytes, source_mime_type: str, variant_key: str) -> GeneratedMedia | None:
        pyvips = self._vips()
        spec = VARIANT_BY_KEY[variant_key]
        image = pyvips.Image.new_from_buffer(data, "", access="sequential", fail=True)
        if image.get_typeof("autorot"):
            # Some builds expose autorot as operation rather than metadata; below method handles both.
            pass
        try:
            image = image.autorot()
        except Exception:
            pass
        validate_dimensions(int(image.width), int(image.height), frames=int(image.get("n-pages")) if image.get_typeof("n-pages") else 1)
        image = image.colourspace("srgb")

        if spec.crop:
            plan = square_crop_plan(image.width, image.height, int(spec.width or 0))
            if plan is None:
                return None
            cropped = image.crop(int(round(plan.left)), int(round(plan.top)), int(round(plan.width)), int(round(plan.height)))
            scale = plan.output_width / cropped.width
            image = cropped.resize(scale)
        elif spec.native:
            pass
        else:
            planned = uncropped_size(image.width, image.height, int(spec.width or 0))
            if planned is None:
                return None
            image = image.resize(planned[0] / image.width)

        # strip=True removes metadata from public derivatives. Exact format quality is DOC-17.
        if spec.mime_type == "image/webp":
            lossless = source_mime_type == "image/png" or image.hasalpha()
            encoded = image.webpsave_buffer(Q=82, lossless=lossless, strip=True)
        else:
            quality = 70 if source_mime_type == "image/png" or image.hasalpha() else 60
            encoded = image.heifsave_buffer(Q=quality, compression="av1", strip=True)
        return GeneratedMedia(bytes(encoded), int(image.width), int(image.height), spec.mime_type)


class DeterministicMediaProcessor:
    """Pure test double that exercises variant planning without claiming codec conformance evidence."""

    def __init__(self, *, width: int, height: int, frames: int = 1, has_alpha: bool = False) -> None:
        self.width = width
        self.height = height
        self.frames = frames
        self.has_alpha = has_alpha

    async def inspect(self, *, data: bytes, mime_type: str) -> DecodedMedia:
        validate_dimensions(self.width, self.height, frames=self.frames)
        return DecodedMedia(self.width, self.height, self.frames, self.has_alpha, mime_type)

    async def generate_variant(self, *, data: bytes, source_mime_type: str, variant_key: str) -> GeneratedMedia | None:
        spec = VARIANT_BY_KEY[variant_key]
        if spec.crop:
            plan = square_crop_plan(self.width, self.height, int(spec.width or 0))
            if plan is None:
                return None
            width, height = plan.output_width, plan.output_height
        elif spec.native:
            width, height = self.width, self.height
        else:
            planned = uncropped_size(self.width, self.height, int(spec.width or 0))
            if planned is None:
                return None
            width, height = planned
        payload = f"TEST_ONLY:{variant_key}:{width}x{height}".encode()
        return GeneratedMedia(payload, width, height, spec.mime_type)
