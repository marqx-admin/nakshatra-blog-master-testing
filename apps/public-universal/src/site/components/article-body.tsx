import type { ArticleBlock as ArticleBlockType, RichTextData } from "../lib/types";
import { DestinationLink } from "./destination-link";
import { ResponsiveMedia } from "./responsive-media";
import { MissingMediaFallback, RichText } from "./semantic-components";
import { useSiteMessages } from "../lib/site-locale";

export function ArticleBodyRenderer({ blocks }: { blocks: ArticleBlockType[] }) {
  return <div className="article-body">{blocks.map((block) => <ArticleBlock key={block.block_id} block={block} />)}</div>;
}

function ArticleBlock({ block }: { block: ArticleBlockType }) {
  switch (block.type) {
    case "PARAGRAPH": return <ParagraphBlock value={block.payload.content} />;
    case "HEADING": return <HeadingBlock level={block.payload.level} value={block.payload.content} />;
    case "LIST": return <ListBlock ordered={block.payload.style === "ORDERED"} items={block.payload.items} />;
    case "QUOTE": return <QuoteBlock quote={block.payload.quote} attribution={block.payload.attribution} source={block.payload.source} />;
    case "SEPARATOR": return <SeparatorBlock />;
    case "MEDIA": return <MediaBlock payload={block.payload} />;
    case "TABLE": return <TableBlock headerRow={block.payload.header_row} rows={block.payload.rows} />;
    case "EMBED": return <EmbedBlock provider={block.payload.provider_key} source={block.payload.source_url_or_id} caption={block.payload.caption} />;
    case "CALLOUT": return <CalloutBlock label={block.payload.label} body={block.payload.body} />;
    case "CTA": return <CtaBlock label={block.payload.label} supportingText={block.payload.supporting_text} destination={block.payload.destination} />;
    case "DISCLAIMER": return <DisclaimerBlock label={block.payload.label} body={block.payload.body} />;
    case "SOURCES_REFERENCES": return <SourcesBlock entries={block.payload.entries} />;
  }
}

function ParagraphBlock({ value }: { value: RichTextData }) { return <p><RichText value={value} /></p>; }
function HeadingBlock({ level, value }: { level: 2 | 3 | 4; value: RichTextData }) { const Tag = `h${level}` as "h2" | "h3" | "h4"; return <Tag><RichText value={value} /></Tag>; }
function ListBlock({ ordered, items }: { ordered: boolean; items: RichTextData[] }) { const Tag = ordered ? "ol" : "ul"; return <Tag>{items.map((item, index) => <li key={index}><RichText value={item} /></li>)}</Tag>; }
function QuoteBlock({ quote, attribution, source }: { quote: RichTextData; attribution?: string | undefined; source?: string | undefined }) { return <blockquote><p><RichText value={quote} /></p>{attribution || source ? <footer>{attribution ? <cite>{attribution}</cite> : null}{source ? <span>{source}</span> : null}</footer> : null}</blockquote>; }
function SeparatorBlock() { return <hr />; }
function MediaBlock({ payload }: { payload: Extract<ArticleBlockType,{type:"MEDIA"}>["payload"] }) {
  const messages = useSiteMessages();
  const media = payload.resolution_state === "MISSING" ? undefined : payload.media;
  const caption = payload.caption ?? media?.caption;
  return <figure className="article-body-media">{media ? <ResponsiveMedia media={media} altOverride={payload.alt_override} /> : <MissingMediaFallback label={messages.articleMediaUnavailable} />}
    {caption || media?.credit_text ? <figcaption>{caption ? <span>{caption}</span> : null}{media?.credit_text ? <small className="media-credit">{media.credit_text}</small> : null}</figcaption> : null}
  </figure>;
}
function TableBlock({ headerRow, rows }: { headerRow: boolean; rows: RichTextData[][] }) {
  const messages = useSiteMessages();
  return <div className="table-region" role="region" aria-label={messages.articleDataTable} tabIndex={0}><table>
    {headerRow && rows.length ? <thead>{rows.slice(0, 1).map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <th key={cellIndex} scope="col"><RichText value={cell} /></th>)}</tr>)}</thead> : null}
    <tbody>{rows.slice(headerRow ? 1 : 0).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><RichText value={cell} /></td>)}</tr>)}</tbody>
  </table></div>;
}
function safeEmbedUrl(value: string): string | undefined { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.toString() : undefined; } catch { return undefined; } }
function EmbedBlock({ provider, source, caption }: { provider: string; source: string; caption?: string | undefined }) { const messages = useSiteMessages(); const href = safeEmbedUrl(source); return <aside className="embed-fallback"><strong>{provider}</strong><p>{caption ?? messages.embeddedMediaUnavailable}</p>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{messages.openApprovedSource}</a> : null}</aside>; }
function CalloutBlock({ label, body }: { label?: string | undefined; body: RichTextData }) { return <aside className="callout">{label ? <strong>{label}</strong> : null}<p><RichText value={body} /></p></aside>; }
function CtaBlock({ label, supportingText, destination }: { label: string; supportingText?: string | undefined; destination: Extract<ArticleBlockType,{type:"CTA"}>["payload"]["destination"] }) { return <aside className="article-cta">{supportingText ? <p>{supportingText}</p> : null}<DestinationLink destination={destination} className="button-primary">{label}</DestinationLink></aside>; }
function DisclaimerBlock({ label, body }: { label?: string | undefined; body: RichTextData }) { const messages = useSiteMessages(); return <aside className="disclaimer"><strong>{label ?? messages.disclaimer}</strong><p><RichText value={body} /></p></aside>; }
function SourcesBlock({ entries }: { entries: Extract<ArticleBlockType,{type:"SOURCES_REFERENCES"}>["payload"]["entries"] }) { const messages = useSiteMessages(); return <section className="sources"><h2>{messages.sourcesAndReferences}</h2><ol>{entries.map((entry, index) => { const href = entry.url ? safeEmbedUrl(entry.url) : undefined; return <li key={`${entry.title}-${index}`}><strong>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{entry.title}</a> : entry.title}</strong>{entry.publisher ? <span>{entry.publisher}</span> : null}{entry.note ? <p>{entry.note}</p> : null}</li>; })}</ol></section>; }
