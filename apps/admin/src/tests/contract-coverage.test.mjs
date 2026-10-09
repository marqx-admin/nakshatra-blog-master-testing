import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(here, "../..");
const repoRoot = path.resolve(adminRoot, "../..");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(file));
    else if (/\.(ts|tsx|css|json)$/.test(entry.name)) out.push(file);
  }
  return out;
}

const files = walk(path.join(adminRoot, "src"));
const sourceByPath = Object.fromEntries(files.map((file) => [file, fs.readFileSync(file, "utf8")]));
const allSource = Object.values(sourceByPath).join("\n");
const generatedClient = fs.readFileSync(path.join(repoRoot, "packages/ts/api-client-admin/src/generated.ts"), "utf8");
const canonicalOps = [...generatedClient.matchAll(/"(API15-(?:AUTH|S|G)-\d{3})"/g)].map((match) => match[1]);
const usedOps = [...new Set([...allSource.matchAll(/API15-(?:AUTH|S|G)-\d{3}/g)].map((match) => match[0]))];
const launchHiddenOps = ["API15-G-036", "API15-G-037"];

const states = [
  "ST10-LOADING","ST10-READY","ST10-EMPTY","ST10-DIRTY","ST10-VALIDATING","ST10-SAVING","ST10-SUCCESS",
  "ST10-ERROR-RETRY","ST10-DENIED","ST10-NOT-FOUND","ST10-CONFLICT","ST10-STALE-CONTEXT","ST10-CONFIRMING",
];
const palette = ["#111a36","#091127","#2c3b6b","#c3a15a","#987437","#e8d8ae","#fcf8ef","#f3e9d7","#fffefb"];

test("generated RC8 Admin operation surface is completely referenced", () => {
  assert.equal(canonicalOps.length, 111);
  assert.equal(canonicalOps.filter((id) => id.startsWith("API15-AUTH-")).length, 12);
  assert.equal(canonicalOps.filter((id) => id.startsWith("API15-S-")).length, 63);
  assert.equal(canonicalOps.filter((id) => id.startsWith("API15-G-")).length, 36);
  assert.deepEqual(canonicalOps.filter((id) => !usedOps.includes(id)), launchHiddenOps);
  assert.deepEqual(usedOps.filter((id) => !canonicalOps.includes(id)), []);
});

test("all 12 RC8 authentication and selector operations are represented", () => {
  for (let index = 1; index <= 12; index += 1) {
    const id = `API15-AUTH-${String(index).padStart(3, "0")}`;
    assert.ok(allSource.includes(id), `missing ${id}`);
  }
});

test("editor covers URL history plus editorial link and related-candidate helpers", () => {
  const editorAssist = fs.readFileSync(path.join(adminRoot, "src/modules/site/EditorAssist.tsx"), "utf8");
  for (const id of ["API15-S-028","API15-S-091","API15-S-092"]) assert.ok(editorAssist.includes(id), id);
  assert.ok(editorAssist.includes("Choose media"));
  assert.ok(editorAssist.includes("API15-S-061"));
  assert.ok(editorAssist.includes("BOLD"));
  assert.ok(editorAssist.includes("ITALIC"));
  assert.ok(editorAssist.includes("transformRichSelection"));
  assert.ok(editorAssist.includes("normalizedInternalCandidate"));
  assert.ok(editorAssist.includes("data-bp-link-kind"));
});

test("the exact 13 DOC-10 execution states are frozen in source", () => {
  const file = fs.readFileSync(path.join(adminRoot, "src/app/execution-states.ts"), "utf8");
  const found = [...file.matchAll(/"(ST10-[A-Z-]+)"/g)].map((match) => match[1]);
  const unique = [...new Set(found)];
  assert.deepEqual(unique, states);
});

test("DOC-25 nine brand primitives are implemented as the single Admin palette", () => {
  const tokens = fs.readFileSync(path.join(adminRoot, "src/styles/tokens.css"), "utf8").toLowerCase();
  for (const color of palette) assert.ok(tokens.includes(color), `missing ${color}`);
  assert.ok(tokens.includes("color-scheme: light"));
});

test("SITE query identity is explicit and invalidation is operation-aware", () => {
  const hooks = fs.readFileSync(path.join(adminRoot, "src/app/query-client/hooks.ts"), "utf8");
  assert.ok(hooks.includes('["SITE", siteKey, operationId, input]'));
  assert.ok(hooks.includes("predicate:"));
  assert.equal(hooks.includes("localStorage"), false);
});

test("network access remains behind the generated Admin client transport", () => {
  const transport = fs.readFileSync(path.join(adminRoot, "src/app/query-client/adminTransport.ts"), "utf8");
  assert.ok(transport.includes("createAdminApiClient"));
  assert.ok(transport.includes("securityAwareFetch"));
  for (const [file, source] of Object.entries(sourceByPath)) {
    if (file.endsWith("adminTransport.ts")) continue;
    assert.equal(/\bglobalThis\.fetch\b|\bwindow\.fetch\b|\bfetch\s*\(/.test(source), false, `direct transport in ${path.relative(adminRoot, file)}`);
  }
});

test("keyboard/focus requirements have concrete Modal and mobile drawer behavior", () => {
  const ui = fs.readFileSync(path.join(adminRoot, "src/ui/components.tsx"), "utf8");
  const shell = fs.readFileSync(path.join(adminRoot, "src/ui/AdminShell.tsx"), "utf8");
  assert.ok(ui.includes('event.key === "Escape"'));
  assert.ok(ui.includes('event.key !== "Tab"'));
  assert.ok(ui.includes("previousFocus.current?.focus()"));
  assert.ok(shell.includes('aria-expanded={navOpen}'));
  assert.ok(shell.includes('aria-controls="bp-primary-navigation"'));
  assert.ok(shell.includes('event.key !== "Escape"'));
  assert.ok(shell.includes("menuButtonRef.current?.focus()"));
});

test("breadcrumbs and server permission checks remain authorization-aware", () => {
  const frame = fs.readFileSync(path.join(adminRoot, "src/modules/PageFrame.tsx"), "utf8");
  assert.ok(frame.includes("<Breadcrumbs"));
  assert.ok(frame.includes("hasAllPermissions"));
  const router = fs.readFileSync(path.join(adminRoot, "src/app/router/AdminRouter.tsx"), "utf8");
  assert.equal(router.includes('managerOnly'), false);
  assert.ok(router.includes('API15-S-001'));
  assert.ok(router.includes('API15-AUTH-012'));
  assert.ok(router.includes('WebsiteDashboardOverview'));
  assert.equal(router.includes('<h1>My Websites</h1>'), false);
});
