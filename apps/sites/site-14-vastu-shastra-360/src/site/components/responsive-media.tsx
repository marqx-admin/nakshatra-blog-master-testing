import type { PublicMedia } from "../lib/types";

function srcSet(media: PublicMedia, mimeType: string): string | undefined {
  const entries = media.variants
    .filter((variant) => variant.mime_type === mimeType && variant.width)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
    .map((variant) => `${variant.url} ${variant.width}w`);
  return entries.length ? entries.join(", ") : undefined;
}

export function ResponsiveMedia({ media, altOverride, priority = false, className = "" }: { media: PublicMedia; altOverride?: string | undefined; priority?: boolean | undefined; className?: string | undefined }) {
  const avif = srcSet(media, "image/avif");
  const webp = srcSet(media, "image/webp");
  const alt = altOverride ?? media.alt_text ?? "";
  return (
    <picture className={className}>
      {avif ? <source type="image/avif" srcSet={avif} sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 800px" /> : null}
      {webp ? <source type="image/webp" srcSet={webp} sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 800px" /> : null}
      <img src={media.url} width={media.width} height={media.height} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} />
    </picture>
  );
}
