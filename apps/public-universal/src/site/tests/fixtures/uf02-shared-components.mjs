// Synthetic, frontend-only fixtures. Never imported by public runtime code.
export const landscapeMedia = {
  media_id: "uf02-landscape", url: "https://media.example.test/landscape.jpg", mime_type: "image/jpeg",
  width: 1200, height: 675, alt_text: "Landscape fixture", caption: "Approved fixture caption",
  variants: [
    { variant_key: "small-avif", url: "https://media.example.test/small.avif", mime_type: "image/avif", width: 400, height: 225 },
    { variant_key: "small-jpeg", url: "https://media.example.test/small.jpg", mime_type: "image/jpeg", width: 400, height: 225 },
  ],
};
export const mediaCases = {
  landscape: landscapeMedia,
  portrait: { ...landscapeMedia, media_id: "uf02-portrait", width: 600, height: 900, variants: [] },
  wide: { ...landscapeMedia, media_id: "uf02-wide", width: 1600, height: 400, variants: [] },
  unknownDimensions: { ...landscapeMedia, width: undefined, height: undefined, variants: [] },
  unavailable: { ...landscapeMedia, url: "", variants: [] },
};
export function fixtureArticle(index, media) {
  return {
    article_id: `uf02-article-${index}`, title: `${index}: साझा लेख शीर्षक / Shared article title`,
    destination: { kind: "ARTICLE", url: `/article/fixture-${index}`, is_external: false },
    published_at: "2026-10-15T00:00:00Z",
    ...(media ? { featured_media: media } : {}),
  };
}
export const articleSets = {
  zero: [],
  one: [fixtureArticle(1)],
  many: Array.from({ length: 12 }, (_, index) => fixtureArticle(index + 1, index % 2 ? landscapeMedia : undefined)),
};
