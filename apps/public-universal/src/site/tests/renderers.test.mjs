import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/wu03-renderers-test.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/components/article-body.tsx"), resolve(app, "src/site/components/semantic-components.tsx")],
  outdir: dirname(output), entryNames: "wu03-[name]-test", platform: "node", format: "esm", bundle: true, jsx: "automatic",
  external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { ArticleBodyRenderer } = await import(pathToFileURL(resolve(dirname(output), "wu03-article-body-test.js")).href);
const { StaticInformationBody } = await import(pathToFileURL(resolve(dirname(output), "wu03-semantic-components-test.js")).href);
const rich = (text) => ({ runs: [{ text, marks: [] }] });
const block = (type, payload) => ({ block_id: type.toLowerCase(), type, payload });

test("the same ArticleBody renderer handles all 12 controlled RC11 block types", () => {
  const blocks = [
    block("PARAGRAPH", { content: rich("Paragraph text") }),
    block("HEADING", { level: 2, content: rich("Section heading") }),
    block("LIST", { style: "UNORDERED", items: [rich("List item")] }),
    block("QUOTE", { quote: rich("Quoted text") }),
    block("SEPARATOR", {}),
    block("MEDIA", { resolution_state: "MISSING" }),
    block("TABLE", { header_row: true, rows: [[rich("Column")], [rich("Cell")]] }),
    block("EMBED", { provider_key: "approved", source_url_or_id: "https://example.test/watch" }),
    block("CALLOUT", { body: rich("Callout text") }),
    block("CTA", { label: "Read more", destination: { kind: "ARTICLE", url: "/article/more", is_external: false } }),
    block("DISCLAIMER", { body: rich("Disclaimer text") }),
    block("SOURCES_REFERENCES", { entries: [{ title: "A source", url: "https://example.test/source" }] }),
  ];
  const html = renderToStaticMarkup(React.createElement(ArticleBodyRenderer, { blocks }));
  for (const text of ["Paragraph text", "Section heading", "List item", "Quoted text", "Article media unavailable", "Column", "Callout text", "Read more", "Disclaimer text", "A source"]) assert.ok(html.includes(text), text);
  assert.match(html, /role="region" aria-label="Article data table"/);
  assert.match(html, /<th scope="col">/);
  assert.doesNotMatch(html, /<script|javascript:/i);
});

test("fixed information pages render controlled sections and optional contact details", () => {
  const content = { static_key: "CONTACT", title: "Contact", sections: [
    { heading: "Reach us", paragraphs: [rich("Write to us")], list_items: [rich("Office hours")] },
  ] };
  const contactInfo = { items: [{ kind: "EMAIL", label: "Email", display_value: "hello@example.test", destination: { kind: "MAILTO", url: "mailto:hello@example.test", is_external: false } }] };
  const html = renderToStaticMarkup(React.createElement(StaticInformationBody, { content, contactInfo }));
  assert.match(html, /<h2>Reach us<\/h2>/);
  assert.match(html, /Write to us/);
  assert.match(html, /Office hours/);
  assert.match(html, /mailto:hello@example.test/);
  assert.doesNotMatch(html, /dangerouslySetInnerHTML|<script/i);
});
