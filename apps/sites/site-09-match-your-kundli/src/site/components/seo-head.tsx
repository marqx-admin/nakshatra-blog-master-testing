import Head from "next/head";
import type { PaginationData, SeoProjection } from "../lib/types";

function jsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function SeoHead({ seo, pagination }: { seo: SeoProjection; pagination?: PaginationData | undefined }) {
  const robots = `${seo.robots.index ? "index" : "noindex"},${seo.robots.follow ? "follow" : "nofollow"}`;
  return (
    <Head>
      <title>{seo.title}</title>
      {seo.meta_description ? <meta name="description" content={seo.meta_description} /> : null}
      <meta name="robots" content={robots} />
      {seo.canonical_url ? <link rel="canonical" href={seo.canonical_url} /> : null}
      {pagination?.previous ? <link rel="prev" href={pagination.previous.url} /> : null}
      {pagination?.next ? <link rel="next" href={pagination.next.url} /> : null}
      {seo.open_graph ? <meta property="og:title" content={seo.open_graph.title} /> : null}
      {seo.open_graph?.description ? <meta property="og:description" content={seo.open_graph.description} /> : null}
      {seo.open_graph?.url ? <meta property="og:url" content={seo.open_graph.url} /> : null}
      {seo.open_graph ? <meta property="og:type" content={seo.open_graph.type.toLowerCase()} /> : null}
      {seo.open_graph?.image ? <meta property="og:image" content={seo.open_graph.image.url} /> : null}
      {seo.structured_data.map((item, index) => (
        <script key={`structured-data-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(item) }} />
      ))}
    </Head>
  );
}
