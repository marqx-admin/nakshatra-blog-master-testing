import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";
import { LEGACY_PARITY, parityStartingConfig, READY_STYLES, readyStyleConfig, SAFE_DEFAULT, presetColors } from "@bp/presentation-catalogue";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/wu03-shell-test.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/shell/navigation/site-shell.tsx")], outfile: output, platform: "node", format: "esm", bundle: true, jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { SiteShell } = await import(pathToFileURL(output).href);

const destination = (url, kind = "STATIC") => ({ kind, url, is_external: false });
const site = (key) => ({ site_key: key, display_name: key, canonical_domain: `${key.toLowerCase()}.test`, home_destination: destination("/", "HOME"), timezone_id: "UTC" });
const item = (label, url, children = []) => ({ label, destination: destination(url), children });
const navigation = (header = [], footer = []) => ({ header: { menu_key: "HEADER", items: header }, footer: { menu_key: "FOOTER", items: footer } });
const shell = (key, nav, settings = { social_profiles: [] }, presentation = undefined, contactInfo = undefined) => renderToStaticMarkup(React.createElement(SiteShell, {
  site: site(key), navigation: nav, settings, presentation, contactInfo, requestPath: "/about", children: React.createElement("p", null, "Page body"),
}));

test("fixed Header renders brand, ordered navigation, child expansion and Search for a minimal site", () => {
  const markup = shell("SITE-15", navigation([item("About", "/about", [item("Team", "/team")]), item("Contact", "/contact")]));
  assert.ok(markup.indexOf("About") < markup.indexOf("Contact"));
  assert.match(markup, /aria-label="Primary navigation"/);
  assert.match(markup, /aria-label="Show About subpages"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /aria-controls="desktop-children-0"/);
  assert.match(markup, /href="\/search"/);
  assert.match(markup, /aria-current="page"/);
  assert.match(markup, /Skip to main content/);
  assert.match(markup, /SITE-15/);
});

test("Footer omits optional groups and keeps a usable minimal site shell", () => {
  const minimal = shell("SITE-100", navigation());
  assert.match(minimal, /SITE-100/);
  assert.doesNotMatch(minimal, /aria-label="Footer navigation"|aria-label="Social profiles"|footer-legal/);
  const full = shell("SITE-100", navigation([], [item("Privacy", "/privacy-policy")]), {
    social_profiles: [{ platform: "EXAMPLE", label: "Example profile", url: "https://social.example.test/site-100" }],
    copyright_text: "Copyright SITE-100",
  });
  assert.match(full, /aria-label="Footer navigation"/);
  assert.match(full, /aria-label="Social profiles"/);
  assert.match(full, /Copyright SITE-100/);
  assert.match(full, /Privacy/);
});

test("Footer social/contact region uses trusted social settings without inventing contact details", () => {
  const markup = shell("SITE-15", navigation([], [item("Contact", "/contact")]), {
    social_profiles: [
      { platform: "EXAMPLE", label: "Site 15 social", url: "https://social.example.test/site-15" },
      { platform: "UNTRUSTED", label: "Unsafe", url: "javascript:alert(1)" },
    ],
  });
  assert.match(markup, /aria-label="Footer navigation"/);
  assert.match(markup, /href="\/contact"/);
  assert.match(markup, /aria-label="Social profiles"/);
  assert.match(markup, /Site 15 social/);
  assert.doesNotMatch(markup, /javascript:alert|Unsafe|<address/);
  const contact = shell("SITE-15", navigation(), { social_profiles: [] }, undefined, { items: [
    { kind: "EMAIL", label: "Email", display_value: "hello@site15.test", destination: destination("mailto:hello@site15.test", "MAILTO") },
    { kind: "HOURS", label: "Hours", display_value: "By appointment" },
  ] });
  assert.match(contact, /class="footer-contact"/);
  assert.match(contact, /href="mailto:hello@site15.test"/);
  assert.match(contact, /By appointment/);
  assert.doesNotMatch(contact, /aria-label="Social profiles"/);
  const next = shell("SITE-100", navigation());
  assert.doesNotMatch(next, /Site 15 social|hello@site15.test|By appointment|aria-label="Social profiles"|href="\/contact"/);
});

test("shell presentation and branding are per render, never inherited from an earlier tenant", () => {
  const presentation = (accent) => ({ source: "STORED", config: { schema_version: 1, style_id: "CUSTOM", base_style_id: "STYLE_03", palette: { mode: "CUSTOM", semantic_tokens: {
    surface: "#ffffff", surface_alt: "#eeeeee", text: "#111111", text_muted: "#555555", accent,
    accent_text: "#ffffff", border: "#dddddd", focus: "#222222",
  } } } });
  const first = shell("SITE-15", navigation(), { social_profiles: [] }, presentation("#123456"));
  const second = shell("SITE-100", navigation(), { social_profiles: [] }, presentation("#654321"));
  assert.match(first, /--u-accent:#123456/);
  assert.match(second, /--u-accent:#654321/);
  assert.doesNotMatch(second, /SITE-15|#123456/);
});

test("five ready styles and fourteen parity configs render through the same fixed shell", () => {
  assert.equal(Object.keys(READY_STYLES).length, 5);
  assert.equal(LEGACY_PARITY.length, 14);
  const fingerprints = new Set();
  for (const styleId of Object.keys(READY_STYLES)) {
    const html = shell("SITE-100", navigation(), { social_profiles: [] }, { source: "STORED", config: readyStyleConfig(styleId) });
    assert.match(html, /class="site-header"/);
    assert.match(html, /class="site-footer"/);
    assert.match(html, /aria-label="Primary navigation"/);
    assert.match(html, /href="\/search"/);
    assert.match(html, /class="brand-link"/);
    fingerprints.add([html.match(/data-home="([^"]+)/)?.[1], html.match(/data-article="([^"]+)/)?.[1], html.match(/--u-width:([^;]+)/)?.[1], html.match(/--u-font-heading:([^;]+)/)?.[1]].join("|"));
  }
  assert.equal(fingerprints.size, 5);
  for (const parity of LEGACY_PARITY) {
    const config = parityStartingConfig(parity.siteKey);
    assert.equal(config.style_id, "CUSTOM");
    assert.equal(config.base_style_id, "STYLE_03");
    const html = shell(parity.siteKey, navigation(), { social_profiles: [] }, { source: "STORED", config });
    assert.match(html, /class="site-header"/);
    assert.match(html, /class="site-footer"/);
    assert.ok(html.includes(`--u-surface:${presetColors(parity.overlay.palette).surface}`));
    assert.doesNotMatch(html, /EXPECTED_SITE_KEY|EXPECTED_DOMAIN/);
  }
  const invalid = shell("SITE-100", navigation(), { social_profiles: [] }, { source: "STORED", config: { schema_version: 1, style_id: "CUSTOM" } });
  assert.ok(invalid.includes(`--u-surface:${presetColors(SAFE_DEFAULT.palette).surface}`));
});
