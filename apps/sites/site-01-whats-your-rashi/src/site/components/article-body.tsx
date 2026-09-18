import type { ArticleBlock as ArticleBlockType, RichTextData } from "../lib/types";
import { DestinationLink } from "./destination-link";
import { ResponsiveMedia } from "./responsive-media";
import { MissingMediaFallback, RichText } from "./semantic-components";

export function ArticleBodyRenderer({ blocks }: { blocks: ArticleBlockType[] }) {
  return <div className="article-body" data-component-id="CMP12-ARTICLE-BODY">{blocks.map((block) => <ArticleBlock key={block.block_id} block={block} />)}</div>;
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

function ParagraphBlock({ value }: { value: RichTextData }) { return <p data-component-id="CMP12-BLOCK-PARAGRAPH"><RichText value={value} /></p>; }
function HeadingBlock({ level, value }: { level: 2 | 3 | 4; value: RichTextData }) { const Tag = `h${level}` as "h2" | "h3" | "h4"; return <Tag data-component-id="CMP12-BLOCK-HEADING"><RichText value={value} /></Tag>; }
function ListBlock({ ordered, items }: { ordered: boolean; items: RichTextData[] }) { const Tag = ordered ? "ol" : "ul"; return <Tag data-component-id="CMP12-BLOCK-LIST">{items.map((item, index) => <li key={index}><RichText value={item} /></li>)}</Tag>; }
function QuoteBlock({ quote, attribution, source }: { quote: RichTextData; attribution?: string | undefined; source?: string | undefined }) { return <blockquote data-component-id="CMP12-BLOCK-QUOTE"><p><RichText value={quote} /></p>{attribution || source ? <footer>{attribution ? <cite>{attribution}</cite> : null}{source ? <span>{source}</span> : null}</footer> : null}</blockquote>; }
function SeparatorBlock() { return <hr data-component-id="CMP12-BLOCK-SEPARATOR" />; }
function MediaBlock({ payload }: { payload: Extract<ArticleBlockType,{type:"MEDIA"}>["payload"] }) { if (payload.resolution_state === "MISSING" || !payload.media) return <MissingMediaFallback label="Article media unavailable" />; return <figure data-component-id="CMP12-BLOCK-MEDIA"><ResponsiveMedia media={payload.media} altOverride={payload.alt_override} />{payload.caption ? <figcaption>{payload.caption}</figcaption> : null}</figure>; }
function TableBlock({ headerRow, rows }: { headerRow: boolean; rows: RichTextData[][] }) { return <div className="table-region" role="region" aria-label="Article data table" tabIndex={0} data-component-id="CMP12-BLOCK-TABLE"><table><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => headerRow && rowIndex === 0 ? <th key={cellIndex} scope="col"><RichText value={cell} /></th> : <td key={cellIndex}><RichText value={cell} /></td>)}</tr>)}</tbody></table></div>; }
function safeEmbedUrl(value: string): string | undefined { try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; } }
function EmbedBlock({ provider, source, caption }: { provider: string; source: string; caption?: string | undefined }) { const href = safeEmbedUrl(source); return <aside className="embed-fallback" data-component-id="CMP12-BLOCK-EMBED"><strong>{provider}</strong><p>{caption ?? "Embedded media is unavailable in this rendering context."}</p>{href ? <a href={href} target="_blank" rel="noopener noreferrer">Open approved source</a> : null}</aside>; }
function CalloutBlock({ label, body }: { label?: string | undefined; body: RichTextData }) { return <aside className="callout" data-component-id="CMP12-BLOCK-CALLOUT">{label ? <strong>{label}</strong> : null}<p><RichText value={body} /></p></aside>; }
function CtaBlock({ label, supportingText, destination }: { label: string; supportingText?: string | undefined; destination: Extract<ArticleBlockType,{type:"CTA"}>["payload"]["destination"] }) { return <aside className="article-cta" data-component-id="CMP12-BLOCK-CTA">{supportingText ? <p>{supportingText}</p> : null}<DestinationLink destination={destination} className="button-primary">{label}</DestinationLink></aside>; }
function DisclaimerBlock({ label, body }: { label?: string | undefined; body: RichTextData }) { return <aside className="disclaimer" data-component-id="CMP12-BLOCK-DISCLAIMER"><strong>{label ?? "Disclaimer"}</strong><p><RichText value={body} /></p></aside>; }
function SourcesBlock({ entries }: { entries: Extract<ArticleBlockType,{type:"SOURCES_REFERENCES"}>["payload"]["entries"] }) { return <section className="sources" data-component-id="CMP12-BLOCK-SOURCES"><h2>Sources and references</h2><ol>{entries.map((entry, index) => <li key={`${entry.title}-${index}`}><strong>{entry.url ? <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.title}</a> : entry.title}</strong>{entry.publisher ? <span>{entry.publisher}</span> : null}{entry.note ? <p>{entry.note}</p> : null}</li>)}</ol></section>; }
