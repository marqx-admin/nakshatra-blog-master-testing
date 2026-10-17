import { useState } from "react";
import type { PublicMedia } from "../lib/types";

function srcSet(media: PublicMedia, mimeType: string): string | undefined {
  const entries = media.variants
    .filter((variant) => variant.mime_type === mimeType && Number.isFinite(variant.width) && (variant.width ?? 0) > 0 && typeof variant.url === "string" && variant.url.trim())
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
    .map((variant) => `${variant.url} ${variant.width}w`);
  return entries.length ? entries.join(", ") : undefined;
}

const defaultSizes = "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 800px";

export function ResponsiveMedia({ media, altOverride, priority = false, className = "", sizes = defaultSizes }: { media: PublicMedia; altOverride?: string | undefined; priority?: boolean | undefined; className?: string | undefined; sizes?: string | undefined }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const avif = srcSet(media, "image/avif");
  const webp = srcSet(media, "image/webp");
  const alt = altOverride ?? media.alt_text ?? "";
  const width = Number.isFinite(media.width) && (media.width ?? 0) > 0 ? media.width : undefined;
  const height = Number.isFinite(media.height) && (media.height ?? 0) > 0 ? media.height : undefined;
  if (!media.url.trim() || failedUrl === media.url) {
    return <span className={`responsive-media media-unavailable ${className}`} role="img" aria-label={alt || "Image unavailable"} style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}>
      <span aria-hidden="true">{alt || "Image unavailable"}</span>
    </span>;
  }
  return (
    <picture className={`responsive-media ${className}`.trim()}>
      {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
      <img src={media.url} srcSet={srcSet(media, media.mime_type)} sizes={sizes} width={width} height={height} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} onError={() => setFailedUrl(media.url)} />
    </picture>
  );
}
