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
await build({ stdin: { contents: 'export { MobileNavigation } from "./src/site/shell/navigation/mobile-navigation.tsx"; export { NavigationTree } from "./src/site/shell/navigation/navigation-tree.tsx";', resolveDir: app, sourcefile: "navigation-test.ts" }, outfile: output, platform: "node", format: "esm", bundle: true, jsx: "automatic", external: ["react", "react/jsx-runtime"], logLevel: "silent" });
const { MobileNavigation, NavigationTree } = await import(pathToFileURL(output).href);

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
    assert.equal(dom.window.document.activeElement === menu, true, "focus should return to the Menu trigger");
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of Object.entries(previous)) {
      if (name === "IS_REACT_ACT_ENVIRONMENT") globalThis[name] = value;
      else Object.defineProperty(globalThis, name, { value, configurable: true });
    }
  }
});

test("mobile menu dismisses on outside interaction, leaving its focus region, resize, and route change", async () => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div><button id='outside'>Outside</button></body>", { url: "https://site-100.test/" });
  const previous = Object.fromEntries(["window", "document", "navigator", "IS_REACT_ACT_ENVIRONMENT"].map(name => [name, globalThis[name]]));
  for (const name of ["window", "document", "navigator"]) Object.defineProperty(globalThis, name, { value: name === "window" ? dom.window : dom.window[name], configurable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  const items = [{ label: "About", destination: { kind: "STATIC", url: "/about", is_external: false }, children: [] }];
  const render = (path, value = items) => act(async () => root.render(React.createElement(MobileNavigation, { items: value, requestPath: path })));
  const click = element => act(async () => element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
  try {
    await render("/");
    const menu = dom.window.document.querySelector(".menu-trigger");
    const outside = dom.window.document.getElementById("outside");
    await click(menu);
    await act(async () => outside.dispatchEvent(new dom.window.Event("pointerdown", { bubbles: true })));
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    await click(menu);
    await act(async () => outside.focus());
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(dom.window.document.activeElement, outside);
    await click(menu);
    await act(async () => dom.window.dispatchEvent(new dom.window.Event("resize")));
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(dom.window.document.activeElement === menu, true, "focus should return to the Menu trigger");
    await click(menu);
    await render("/about");
    assert.equal(menu.getAttribute("aria-expanded"), "false");
    assert.equal(dom.window.document.activeElement === menu, true, "focus should return to the Menu trigger");
    await render("/", []);
    assert.equal(dom.window.document.querySelector(".menu-trigger"), null);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of Object.entries(previous)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
});

test("desktop/footer nested navigation dismisses safely and marks only the actual current destination", async () => {
  const dom = new JSDOM("<!doctype html><body><div id='root'></div><button id='outside'>Outside</button></body>");
  const previous = Object.fromEntries(["window", "document", "navigator", "IS_REACT_ACT_ENVIRONMENT"].map(name => [name, globalThis[name]]));
  for (const name of ["window", "document", "navigator"]) Object.defineProperty(globalThis, name, { value: name === "window" ? dom.window : dom.window[name], configurable: true });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(dom.window.document.getElementById("root"));
  const item = (label, url, children = []) => ({ label, destination: { kind: "STATIC", url, is_external: false }, children });
  const items = [item("Information", "/about", [item("Team", "/team", [item("Editors", "/editors")])])];
  const render = path => act(async () => root.render(React.createElement(NavigationTree, { items, requestPath: path, idPrefix: "test" })));
  const click = element => act(async () => element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
  try {
    await render("/editors");
    const toggles = dom.window.document.querySelectorAll(".nav-expand");
    assert.equal(dom.window.document.querySelectorAll('[aria-current="page"]').length, 1);
    assert.equal(dom.window.document.querySelectorAll('[data-current-branch="true"]').length, 2);
    await click(toggles[0]);
    await click(toggles[1]);
    await act(async () => toggles[1].dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    assert.equal(toggles[1].getAttribute("aria-expanded"), "false");
    assert.equal(toggles[0].getAttribute("aria-expanded"), "true");
    assert.equal(dom.window.document.activeElement, toggles[1]);
    await act(async () => dom.window.document.getElementById("outside").dispatchEvent(new dom.window.Event("pointerdown", { bubbles: true })));
    assert.equal(toggles[0].getAttribute("aria-expanded"), "false");
    await click(toggles[0]);
    await render("/team");
    assert.equal(toggles[0].getAttribute("aria-expanded"), "false");
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    for (const [name, value] of Object.entries(previous)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
});
