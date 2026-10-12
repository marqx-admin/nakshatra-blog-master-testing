import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, expect, test } from "vitest";
import type { AdminOperationId } from "@bp/api-client-admin";
import { READY_STYLES, OPTION_METADATA, DENSITIES, WIDTHS, presetColors } from "@bp/presentation-catalogue";
import { AdminApiProvider } from "../app/query-client/AdminApiProvider";
import type { AdminRequestInput, AdminResponse, AdminTransport } from "../app/query-client/adminTransport";
import { GlobalContextValue, SiteContextValue } from "../app/site-context/AdminContext";
import { DirtyStateProvider } from "../app/site-context/DirtyStateContext";
import { CreateWebsitePage } from "../modules/global/CreateWebsitePage";
import { AppearancePage } from "../modules/site/AppearancePage";
import { AppearancePreview, StyleChooser, appearanceValidation } from "../modules/appearance/AppearanceControls";
import { AppearanceControls, InformationPagesEditor } from "../modules/appearance/AppearanceControls";
import { PAGE_KEYS, STYLE_IDS, informationPageState, startingPages, startingPresentation, withCustomPalette } from "../modules/appearance/appearance-model";
import { AdminShell } from "../ui/AdminShell";
import { PlatformSettingsPage } from "../modules/global/PlatformSettingsPage";
import { AdminRouter } from "../app/router/AdminRouter";

afterEach(cleanup);
const ok = <T,>(data: T, status = 200): AdminResponse<T> => ({ status, data, headers: new Headers({ "X-Request-ID": "wu05" }) });

function renderWizard(request: AdminTransport["request"]) {
  const router = createMemoryRouter([{ path: "/global/sites/new", element: <DirtyStateProvider><GlobalContextValue value={{ effective_permissions: ["sites.view", "sites.create"] }}><CreateWebsitePage/></GlobalContextValue></DirtyStateProvider> }], { initialEntries: ["/global/sites/new"] });
  render(<AdminApiProvider transport={{ request }}><RouterProvider router={router}/></AdminApiProvider>);
}

async function reachReview(user: ReturnType<typeof userEvent.setup>, style = "Modern Magazine") {
  await user.type(screen.getByRole("textbox", { name: /Site key/ }), "SITE-100");
  await user.type(screen.getByRole("textbox", { name: /Display name/ }), "Future Site");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("group", { name: "Website style" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: new RegExp(style) }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Typography", { selector: "summary strong" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Keep this look and continue" }));
  expect(screen.getByRole("region", { name: "Representative appearance preview" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("heading", { name: "Confirm website" })).toBeInTheDocument();
}

test("Create Website previews without provisioning, then sends one typed atomic request", async () => {
  const calls: Array<{ id: AdminOperationId; input: AdminRequestInput | undefined }> = [];
  const request: AdminTransport["request"] = async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    calls.push({ id, input });
    if (id === "API15-G-011") return ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED", timezone_id: "Asia/Kolkata", created_at: "now", updated_at: "now" }, temporary_hostname: "site-100.preview.localhost", temporary_site_url: "http://site-100.preview.localhost:3015/", readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201) as AdminResponse<T>;
    throw new Error(`Unexpected operation ${id}`);
  };
  renderWizard(request);
  const user = userEvent.setup();
  await reachReview(user);
  expect(calls).toHaveLength(0);
  await user.click(screen.getByRole("button", { name: "Confirm and create website" }));
  expect(await screen.findByRole("region", { name: "Provisioning result" })).toBeInTheDocument();
  expect(calls).toHaveLength(1);
  expect(calls[0]?.id).toBe("API15-G-011");
  const body = calls[0]?.input?.body as Record<string, unknown>;
  expect(body.site_key).toBe("SITE-100");
  expect((body.presentation as Record<string, unknown>).style_id).toBe("STYLE_01");
  expect(Object.keys(body.static_pages as object)).toEqual(PAGE_KEYS);
  expect(screen.getByText("site-100.preview.localhost")).toBeInTheDocument();
  expect(screen.getByText("http://site-100.preview.localhost:3015/")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Open Website Workspace" })).toHaveAttribute("href", "/site/SITE-100/dashboard");
  expect(screen.queryByRole("link", { name: "Open Temporary Website" })).not.toBeInTheDocument();
});

test.each([
  [undefined, null],
  ["http://site-100.preview.localhost:3015/", "http://site-100.preview.localhost:3015/"],
])("Create Website uses only the server URL for an available temporary action", async (temporaryUrl, expectedHref) => {
  renderWizard(async <T,>(id: AdminOperationId) => {
    if (id !== "API15-G-011") throw new Error("unexpected");
    return ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "ACTIVE" }, temporary_hostname: "site-100.preview.localhost", ...(temporaryUrl ? { temporary_site_url: temporaryUrl } : {}), readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201) as AdminResponse<T>;
  });
  const user = userEvent.setup();
  await reachReview(user);
  await user.click(screen.getByRole("button", { name: "Confirm and create website" }));
  expect(await screen.findByRole("region", { name: "Provisioning result" })).toBeInTheDocument();
  const link = screen.queryByRole("link", { name: "Open Temporary Website" });
  if (expectedHref) expect(link).toHaveAttribute("href", expectedHref);
  else expect(link).not.toBeInTheDocument();
});

test.each([
  ["Modern Magazine", "STYLE_01"],
  ["Classic Editorial", "STYLE_02"],
  ["Minimal Clean", "STYLE_03"],
  ["Bold News", "STYLE_04"],
  ["Warm / Spiritual Editorial", "STYLE_05"],
  ["Start Custom", "CUSTOM"],
])("%s provisions one complete %s presentation and five safe information pages", async (label, styleId) => {
  const calls: AdminRequestInput[] = [];
  renderWizard(async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    if (id !== "API15-G-011") throw new Error(`Unexpected operation ${id}`);
    calls.push(input ?? {});
    return ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED" }, temporary_hostname: "site-100.preview.localhost", temporary_site_url: "http://site-100.preview.localhost:3015/", readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201) as AdminResponse<T>;
  });
  const user = userEvent.setup();
  await reachReview(user, label);
  await user.click(screen.getByRole("button", { name: "Confirm and create website" }));
  expect(await screen.findByRole("region", { name: "Provisioning result" })).toBeInTheDocument();
  expect(calls).toHaveLength(1);
  const body = calls[0]?.body as { presentation: ReturnType<typeof startingPresentation>; static_pages: ReturnType<typeof startingPages> };
  expect(body.presentation).toEqual(startingPresentation(styleId as Parameters<typeof startingPresentation>[0]));
  expect(body.presentation).toMatchObject({ schema_version: 1, style_id: styleId, palette: expect.any(Object), typography_id: expect.any(String), layout: expect.any(Object), cards: expect.any(Object), hero: expect.any(Object), homepage: expect.any(Object), article: expect.any(Object), collections: expect.any(Object), controls: expect.any(Object) });
  if (styleId === "CUSTOM") expect(body.presentation.base_style_id).toBe("STYLE_03");
  expect(Object.keys(body.static_pages)).toEqual(PAGE_KEYS);
  for (const page of Object.values(body.static_pages)) expect(page).toMatchObject({ enabled: false, content_version: 1, intro_text: "", body_sections: [] });
});

test("provisioning failure never presents a successful site", async () => {
  let calls = 0;
  renderWizard(async <T,>(id: AdminOperationId) => { if (id === "API15-G-011") { calls++; throw new Error("failed"); } throw new Error("unexpected"); });
  const user = userEvent.setup();
  await reachReview(user);
  await user.click(screen.getByRole("button", { name: "Confirm and create website" }));
  expect(await screen.findByText(/The server did not confirm a website/)).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Provisioning result" })).not.toBeInTheDocument();
  expect(calls).toBe(1);
});

test("provisioning disables duplicate confirmation while the single request is pending", async () => {
  let calls = 0;
  let complete!: (response: AdminResponse<unknown>) => void;
  const pending = new Promise<AdminResponse<unknown>>(resolve => { complete = resolve; });
  renderWizard(async <T,>(id: AdminOperationId) => {
    if (id !== "API15-G-011") throw new Error("unexpected");
    calls++;
    return pending as Promise<AdminResponse<T>>;
  });
  const user = userEvent.setup();
  await reachReview(user);
  await user.click(screen.getByRole("button", { name: "Confirm and create website" }));
  expect(calls).toBe(1);
  const confirm = screen.getByRole("button", { name: /Working/ });
  expect(confirm).toBeDisabled();
  await user.click(confirm);
  expect(calls).toBe(1);
  complete(ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED" }, temporary_hostname: "site-100.preview.localhost", temporary_site_url: "http://site-100.preview.localhost:3015/", readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201));
  expect(await screen.findByRole("region", { name: "Provisioning result" })).toBeInTheDocument();
});

test("shared style and option vocabulary keeps unsupported controls unavailable", () => {
  expect(STYLE_IDS).toHaveLength(5);
  expect(Object.keys(READY_STYLES)).toEqual(STYLE_IDS);
  expect(PAGE_KEYS).toHaveLength(5);
  expect(startingPresentation("CUSTOM")).toMatchObject({ style_id: "CUSTOM", base_style_id: "STYLE_03" });
  expect(OPTION_METADATA.authorCards["AUTH-12"]).toMatchObject({ available: false, reason: "AUTHOR_TOTAL_COUNT_UNAVAILABLE", fallbackId: "AUTH-05" });
  expect(OPTION_METADATA.categoryCards["CAT-08"]).toMatchObject({ available: false, reason: "CATEGORY_IMAGE_UNAVAILABLE" });
  expect(OPTION_METADATA.categoryCards["CAT-03"]).toMatchObject({ available: false, reason: "CATEGORY_COUNT_UNAVAILABLE" });
  render(<StyleChooser value={startingPresentation("CUSTOM")} onChange={() => undefined}/>);
  expect(within(screen.getByRole("group", { name: "Website style" })).getAllByRole("button")).toHaveLength(6);
  expect(screen.queryByText("AUTH-12")).not.toBeInTheDocument();
});

test("selectors omit unavailable category, author and Hindi-ineligible typography choices", () => {
  const config = startingPresentation("CUSTOM");
  render(<AppearanceControls config={config} locale="hi-IN" onChange={() => undefined}/>);
  const optionIds = (label: string) => [...within(screen.getByRole("group", { name: label })).getAllByRole("button", { hidden: true })].map(button => button.getAttribute("data-option-id"));
  expect(optionIds("Category card")).not.toContain("CAT-08");
  expect(optionIds("Category card")).not.toContain("CAT-03");
  expect(optionIds("Author card")).not.toContain("AUTH-12");
  expect(optionIds("Typography preset")).toEqual(["TYPE-11", "TYPE-12", "TYPE-21", "TYPE-22"]);
  expect(optionIds("Density")).toEqual(Object.keys(DENSITIES));
  expect(optionIds("Container width")).toEqual(Object.keys(WIDTHS));
  expect(screen.queryByRole("group", { name: /Header|Footer|CTA/ })).not.toBeInTheDocument();
});

test("information editor has exactly the five fixed page tabs", () => {
  render(<InformationPagesEditor pages={startingPages()} onChange={() => undefined}/>);
  const tabs = screen.getByRole("group", { name: "Information page" });
  expect(within(tabs).getAllByRole("button").map(button => button.firstChild?.textContent)).toEqual(["About", "Contact", "Privacy Policy", "Terms of Use", "Disclaimer"]);
  expect(screen.queryByRole("textbox", { name: /HTML|CSS|JavaScript/ })).not.toBeInTheDocument();
});

test("information pages stay incomplete until a renderable body section exists", () => {
  const pages = startingPages();
  expect(informationPageState(pages.PRIVACY)).toBe("Not written / incomplete");
  pages.PRIVACY.intro_text = "An introduction alone";
  expect(informationPageState(pages.PRIVACY)).toBe("Not written / incomplete");
  pages.PRIVACY.body_sections = [{ heading: "Use of data", paragraphs: ["Owner-approved policy content"], list_items: [] }];
  expect(informationPageState(pages.PRIVACY)).toBe("Ready but disabled");
  pages.PRIVACY.enabled = true;
  expect(informationPageState(pages.PRIVACY)).toBe("Enabled");
});

test("custom palette with invalid contrast cannot pass Appearance validation", () => {
  const palette = presetColors("PAL-28");
  const config = withCustomPalette(startingPresentation("CUSTOM"), { ...palette, text: palette.surface });
  expect(appearanceValidation(config, startingPages(), "en")).toContain("text/surface");
  expect(appearanceValidation(startingPresentation("CUSTOM"), startingPages(), "hi-IN")).toContain("Typography does not support this site's script.");
});

test("Appearance preview is representative and has a fixed header and footer", () => {
  render(<AppearancePreview config={startingPresentation("STYLE_03")} name="Site 15" locale="en"/>);
  const preview = screen.getByRole("region", { name: "Representative appearance preview" });
  expect(within(preview).getByRole("banner")).toHaveTextContent("Site 15");
  expect(within(preview).getByRole("contentinfo")).toHaveTextContent("Site 15");
  expect(within(preview).getByText("Finding meaning in the moments that matter")).toBeInTheDocument();
  expect(within(preview).getByText("Explore by topic")).toBeInTheDocument();
  const controls = within(preview).getByRole("group", { name: "Preview size" });
  fireEvent.click(within(controls).getByRole("button", { name: "Tablet" }));
  expect(preview.querySelector('[data-device="tablet"]')).toBeTruthy();
  fireEvent.click(within(controls).getByRole("button", { name: "Mobile" }));
  expect(preview.querySelector('[data-device="mobile"]')).toBeTruthy();
});

test("all six catalogue-derived style tiles show a miniature website", () => {
  render(<StyleChooser value={startingPresentation("CUSTOM")} onChange={() => undefined}/>);
  const styles = within(screen.getByRole("group", { name: "Website style" })).getAllByRole("button");
  expect(styles).toHaveLength(6);
  for (const style of styles) {
    const tile = style.parentElement!;
    expect(tile.querySelector('[data-preview-engine="universal-representative"]')).toBeTruthy();
    expect(tile.querySelector(".bp-appearance-preview-header")).toBeTruthy();
    expect(tile.querySelector(".bp-appearance-preview-lead")).toBeTruthy();
    expect(tile.querySelector(".bp-appearance-preview-cards")).toBeTruthy();
    expect(tile.querySelector(".bp-appearance-preview-footer")).toBeTruthy();
    expect(style.textContent).not.toMatch(/STYLE_\d|PAL-\d|TYPE-\d/);
  }
  expect(new Set(styles.map(style => style.parentElement?.querySelector(".bp-appearance-preview")?.getAttribute("style"))).size).toBe(6);
});

test("choosing a ready-made style updates the complete selected website preview", () => {
  function Harness() {
    const [config, setConfig] = useState(startingPresentation("CUSTOM"));
    return <StyleChooser value={config} onChange={setConfig} name="Example"/>;
  }
  render(<Harness/>);
  const selected = screen.getByRole("region", { name: "Representative appearance preview" });
  const before = selected.querySelector(".bp-appearance-preview")?.getAttribute("style");
  fireEvent.click(screen.getByRole("button", { name: /Bold News/ }));
  expect(screen.getByRole("button", { name: /Bold News/ })).toHaveAttribute("aria-pressed", "true");
  expect(selected.querySelector(".bp-appearance-preview")?.getAttribute("style")).not.toBe(before);
  expect(within(selected).getByRole("banner")).toHaveTextContent("Example");
});

test("visual galleries update the shared live preview without changing the style", () => {
  function Harness() {
    const [config, setConfig] = useState(startingPresentation("STYLE_01"));
    return <AppearanceControls config={config} onChange={setConfig} locale="en" name="Example"/>;
  }
  render(<Harness/>);
  expect(screen.getAllByRole("region", { name: "Representative appearance preview" })).toHaveLength(1);
  const palette = screen.getByRole("group", { name: "Palette" });
  const options = within(palette).getAllByRole("button");
  expect(options[0]?.querySelector(".bp-choice-palette")).toBeTruthy();
  fireEvent.click(options.find(option => option.getAttribute("aria-pressed") === "false")!);
  expect(within(palette).getAllByRole("button", { pressed: true })).toHaveLength(1);
  expect(screen.getByText("Layout & Feel", { selector: "summary strong" })).toBeInTheDocument();
  expect(screen.queryByRole("group", { name: /Header|Footer|CTA/ })).not.toBeInTheDocument();
});

function renderSite(request: AdminTransport["request"], permissions = ["site_settings.view", "site_settings.edit", "media.view"]) {
  const site = { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED", effective_permissions: permissions, access_level: "FULL_WEBSITE_MANAGER" as const };
  const router = createMemoryRouter([{ path: "/site/:siteKey/appearance", element: <DirtyStateProvider><SiteContextValue value={site}><AppearancePage/></SiteContextValue></DirtyStateProvider> }], { initialEntries: ["/site/SITE-100/appearance"] });
  render(<AdminApiProvider transport={{ request }}><RouterProvider router={router}/></AdminApiProvider>);
}

test("assigned disabled site can save typed Appearance through site_settings authority", async () => {
  const writes: AdminRequestInput[] = [];
  renderSite(async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    if (id === "API15-S-096") return ok({ settings: [{ key: "presentation_config", value: startingPresentation("CUSTOM") }, { key: "static_pages", value: startingPages() }, { key: "locale_code", value: "en" }] }) as AdminResponse<T>;
    if (id === "API15-S-097") { writes.push(input ?? {}); return ok({ settings: [] }) as AdminResponse<T>; }
    throw new Error(`Unexpected operation ${id}`);
  });
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: /Classic Editorial/ }));
  await user.click(screen.getByRole("button", { name: "Save Appearance" }));
  await waitFor(() => expect(writes).toHaveLength(1));
  expect(writes[0]?.path?.site_key).toBe("SITE-100");
  const entries = (writes[0]?.body as { settings: Array<{ key: string; value: unknown }> }).settings;
  expect(entries).toHaveLength(1);
  expect(entries[0]?.key).toBe("presentation_config");
  expect((entries[0]?.value as Record<string, unknown>).style_id).toBe("STYLE_02");
});

test("fixed information page edits save only static_pages through typed settings", async () => {
  const writes: AdminRequestInput[] = [];
  renderSite(async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    if (id === "API15-S-096") return ok({ settings: [{ key: "presentation_config", value: startingPresentation("CUSTOM") }, { key: "static_pages", value: startingPages() }] }) as AdminResponse<T>;
    if (id === "API15-S-097") { writes.push(input ?? {}); return ok({ settings: [] }) as AdminResponse<T>; }
    throw new Error("unexpected");
  });
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: /^Contact/ }));
  await user.type(screen.getByRole("textbox", { name: "Introduction" }), "How to reach us");
  await user.click(screen.getByRole("button", { name: "Save Appearance" }));
  await waitFor(() => expect(writes).toHaveLength(1));
  const entries = (writes[0]?.body as { settings: Array<{ key: string; value: unknown }> }).settings;
  expect(entries).toHaveLength(1);
  expect(entries[0]?.key).toBe("static_pages");
  expect((entries[0]?.value as ReturnType<typeof startingPages>).CONTACT.intro_text).toBe("How to reach us");
});

test("site_settings.view without edit offers no Appearance save action", async () => {
  renderSite(async <T,>(id: AdminOperationId) => id === "API15-S-096" ? ok({ settings: [] }) as AdminResponse<T> : Promise.reject(new Error("unexpected write")), ["site_settings.view"]);
  expect(await screen.findByRole("heading", { name: "Website style" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Save Appearance" })).not.toBeInTheDocument();
});

function renderDirectAppearance(siteKey: string, temporaryUrl?: string, lifecycle = "DISABLED") {
  window.history.replaceState({}, "", `/site/${siteKey}/appearance`);
  const calls: AdminOperationId[] = [];
  const request: AdminTransport["request"] = async <T,>(id: AdminOperationId) => {
    calls.push(id);
    if (id === "API15-S-001") return {
      ...ok({ site_key: siteKey, display_name: siteKey, lifecycle_state: lifecycle, effective_permissions: ["site_settings.view"], ...(temporaryUrl ? { temporary_site_url: temporaryUrl } : {}) }),
      headers: new Headers({ "X-BP-Public-Url": "https://production.example" }),
    } as AdminResponse<T>;
    if (id === "API15-S-096") return ok({ settings: [] }) as AdminResponse<T>;
    throw new Error(`Unexpected operation ${id}`);
  };
  render(<AdminApiProvider transport={{ request }}><AdminRouter/></AdminApiProvider>);
  return calls;
}

test("direct and reloaded Appearance uses the authoritative temporary destination", async () => {
  const url = "https://site-100.preview.example";
  const first = renderDirectAppearance("SITE-100", url);
  expect(await screen.findByText(/disabled and remains unavailable/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Open Temporary Website" })).not.toBeInTheDocument();
  expect(first).toContain("API15-S-001");
  cleanup();
  const second = renderDirectAppearance("SITE-100", url, "ACTIVE");
  expect(await screen.findByRole("link", { name: "Open Temporary Website" })).toHaveAttribute("href", url);
  expect(screen.getByText(/backend noindex and crawler policy/)).toBeInTheDocument();
  expect(second).toContain("API15-S-001");
});

test("Appearance opens localhost temporary sites through the shared public app", async () => {
  renderDirectAppearance("SITE-100", "http://site-100.preview.localhost:3015/", "ACTIVE");
  expect(await screen.findByRole("link", { name: "Open Temporary Website" })).toHaveAttribute("href", "http://site-100.preview.localhost:3015/");
});

test("Appearance never infers a temporary Host from public URL, site key, or another site", async () => {
  renderDirectAppearance("SITE-100", "https://site-100.preview.example", "ACTIVE");
  expect(await screen.findByRole("link", { name: "Open Temporary Website" })).toBeInTheDocument();
  cleanup();
  renderDirectAppearance("SITE-101");
  expect(await screen.findByText(/No active temporary website destination/)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Open Temporary Website" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Production domain/ })).not.toBeInTheDocument();
});

test("Appearance denies a site user without site_settings.view", () => {
  let requests = 0;
  renderSite(async <T,>() => { requests++; return ok({ settings: [] }) as AdminResponse<T>; }, []);
  expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  expect(requests).toBe(0);
});

test("invalid custom palette is visibly rejected before any write", async () => {
  let writes = 0;
  renderSite(async <T,>(id: AdminOperationId) => {
    if (id === "API15-S-096") return ok({ settings: [{ key: "presentation_config", value: startingPresentation("CUSTOM") }, { key: "static_pages", value: startingPages() }] }) as AdminResponse<T>;
    if (id === "API15-S-097") { writes++; return ok({ settings: [] }) as AdminResponse<T>; }
    throw new Error("unexpected");
  });
  const user = userEvent.setup();
  // Label queries avoid computing names for the entire visual option gallery.
  const customColors = await screen.findByLabelText("Use custom semantic colors");
  expect(customColors).toBeVisible();
  await user.click(customColors);
  expect(customColors).toBeChecked();
  const colors = within(screen.getByText("Brand & Colors", { selector: "summary strong" }).closest("details")!);
  const surface = colors.getByLabelText("surface") as HTMLInputElement;
  const text = colors.getByLabelText("text") as HTMLInputElement;
  fireEvent.change(text, { target: { value: surface.value } });
  const saveButton = screen.getByText("Save Appearance").closest("button")!;
  expect(saveButton).toHaveAccessibleName("Save Appearance");
  expect(saveButton).toBeVisible();
  await user.click(saveButton);
  expect(screen.getByText("text/surface")).toBeInTheDocument();
  expect(writes).toBe(0);
});

test("GLOBAL launch navigation includes Audit and Platform Settings while Roles remain hidden", () => {
  const permissions = ["network_dashboard.view", "sites.view", "admin_users.view", "audit.view", "platform_settings.view", "roles.view", "permissions.view"];
  const router = createMemoryRouter([{ path: "/global/network", element: <GlobalContextValue value={{ effective_permissions: permissions }}><AdminShell><p>Dashboard</p></AdminShell></GlobalContextValue> }], { initialEntries: ["/global/network"] });
  render(<AdminApiProvider transport={{ request: async () => ok({}) as never }}><RouterProvider router={router}/></AdminApiProvider>);
  const navigation = screen.getByRole("navigation", { name: "Global workspace" });
  expect(within(navigation).getByRole("link", { name: /Audit/ })).toHaveAttribute("href", "/global/audit");
  expect(within(navigation).getByRole("link", { name: /Platform Settings/ })).toHaveAttribute("href", "/global/platform-settings");
  expect(within(navigation).queryByRole("link", { name: /Roles|Permission Registry/ })).not.toBeInTheDocument();
});

test("one SITE workspace filters links by effective permissions and never offers production domains", () => {
  const site = { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED", effective_permissions: ["dashboard.view", "tags.view", "site_settings.view"] };
  const router = createMemoryRouter([{ path: "/site/:siteKey/dashboard", element: <SiteContextValue value={site}><AdminShell><p>Site dashboard</p></AdminShell></SiteContextValue> }], { initialEntries: ["/site/SITE-100/dashboard"] });
  render(<AdminApiProvider transport={{ request: async () => ok({}) as never }}><RouterProvider router={router}/></AdminApiProvider>);
  const navigation = screen.getByRole("navigation", { name: "Site workspace" });
  expect(within(navigation).getByRole("link", { name: /Tags/ })).toHaveAttribute("href", "/site/SITE-100/tags");
  expect(within(navigation).getByRole("link", { name: /Appearance/ })).toHaveAttribute("href", "/site/SITE-100/appearance");
  expect(within(navigation).queryByRole("link", { name: /Production|Domains/ })).not.toBeInTheDocument();
  expect(within(navigation).queryByRole("link", { name: /Posts/ })).not.toBeInTheDocument();
});

test("assigned-sites landing accepts future SITE-100 from server authority", async () => {
  window.history.replaceState({}, "", "/");
  const calls: AdminOperationId[] = [];
  const request: AdminTransport["request"] = async <T,>(id: AdminOperationId) => {
    calls.push(id);
    if (id === "API15-G-001") return ok({ detail: "Forbidden" }, 403) as AdminResponse<T>;
    if (id === "API15-AUTH-012") return ok({ items: [{ site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED" }] }) as AdminResponse<T>;
    if (id === "API15-S-001") return ok({ site_key: "SITE-100", effective_permissions: ["dashboard.view"] }) as AdminResponse<T>;
    if (id === "API15-S-002") return ok({ metrics: [] }) as AdminResponse<T>;
    throw new Error(`Unexpected operation ${id}`);
  };
  render(<AdminApiProvider transport={{ request }}><AdminRouter/></AdminApiProvider>);
  expect(await screen.findByRole("link", { name: /Open Dashboard/ })).toHaveAttribute("href", "/site/SITE-100/dashboard");
  expect(calls).toContain("API15-AUTH-012");
  expect(screen.queryByText("SITE-01")).not.toBeInTheDocument();
});

test("Platform Settings edits only server-provided structured controls", async () => {
  const writes: AdminRequestInput[] = [];
  const request: AdminTransport["request"] = async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    if (id === "API15-G-060") return ok({ settings: [{ key: "maintenance_message", value: "Hello" }, { key: "feature_enabled", value: false }, { key: "server_object", value: { a: 1, categories: ["News"] } }] }) as AdminResponse<T>;
    if (id === "API15-G-061") { writes.push(input ?? {}); return ok({ settings: [] }) as AdminResponse<T>; }
    throw new Error("unexpected");
  };
  const router = createMemoryRouter([{ path: "/global/platform-settings", element: <DirtyStateProvider><GlobalContextValue value={{ effective_permissions: ["platform_settings.view", "platform_settings.edit"] }}><PlatformSettingsPage/></GlobalContextValue></DirtyStateProvider> }], { initialEntries: ["/global/platform-settings"] });
  render(<AdminApiProvider transport={{ request }}><RouterProvider router={router}/></AdminApiProvider>);
  const user = userEvent.setup();
  await user.clear(await screen.findByRole("textbox", { name: "maintenance message" }));
  await user.type(screen.getByRole("textbox", { name: "maintenance message" }), "Updated");
  await user.clear(screen.getByRole("spinbutton", { name: "a" }));
  await user.type(screen.getByRole("spinbutton", { name: "a" }), "2");
  await user.clear(screen.getByRole("textbox", { name: "categories 1" }));
  await user.type(screen.getByRole("textbox", { name: "categories 1" }), "Ideas");
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await waitFor(() => expect(writes).toHaveLength(1));
  expect((writes[0]?.body as { settings: Array<{ key: string; value: unknown }> }).settings).toEqual([
    { key: "maintenance_message", value: "Updated" },
    { key: "server_object", value: { a: 2, categories: ["Ideas"] } },
  ]);
});
