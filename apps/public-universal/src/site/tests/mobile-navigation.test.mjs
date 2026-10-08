import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import React, { act } from "react";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const output = resolve(app, "node_modules/.cache/wu03-mobile-test.mjs");
mkdirSync(dirname(output), { recursive: true });
await build({ entryPoints: [resolve(app, "src/site/shell/navigation/mobile-navigation.tsx")], outfile: output, platform: "node", format: "esm", bundle: true, jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { MobileNavigation } = await import(pathToFileURL(output).href);

test("mobile navigation opens, focuses first destination, exposes nested items, and returns focus on Escape", async () => {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "https://site-100.test/" });
  const previous = { window: globalThis.window, document: globalThis.document, navigator: globalThis.navigator, IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT };
  Object.defineProperty(globalThis, "window", { value: dom.window, configurable: true });
  Object.defineProperty(globalThis, "document", { value: dom.window.document, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  try {
    const destination = (url) => ({ kind: "STATIC", url, is_external: false });
    const items = [{ label: "About", destination: destination("/about"), children: [{ label: "Team", destination: destination("/team"), children: [] }] }];
    await act(async () => root.render(React.createElement(MobileNavigation, { items, requestPath: "/about" })));
    const menu = dom.window.document.querySelector(".menu-trigger");
    const panel = dom.window.document.getElementById("universal-mobile-navigation");
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(menu.getAttribute("aria-controls"), panel.id);
    assert.equal(panel.hidden, true);
    await act(async () => menu.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.equal(menu.getAttribute("aria-expanded"), "true");
    assert.equal(panel.hidden, false);
    assert.equal(dom.window.document.activeElement.textContent, "About");
    const childToggle = dom.window.document.querySelector(".nav-expand");
    assert.equal(childToggle.getAttribute("aria-expanded"), "false");
    await act(async () => childToggle.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.equal(childToggle.getAttribute("aria-expanded"), "true");
    assert.equal(dom.window.document.getElementById(childToggle.getAttribute("aria-controls")).hidden, false);
    await act(async () => childToggle.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(childToggle.getAttribute("aria-expanded"), "false");
    assert.equal(dom.window.document.activeElement, childToggle);
    await act(async () => childToggle.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(dom.window.document.activeElement, menu);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of Object.entries(previous)) {
      if (name === "IS_REACT_ACT_ENVIRONMENT") globalThis[name] = value;
      else Object.defineProperty(globalThis, name, { value, configurable: true });
    }
  }
});
