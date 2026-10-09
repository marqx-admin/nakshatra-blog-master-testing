import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
import { PAGE_KEYS, STYLE_IDS, startingPages, startingPresentation, withCustomPalette } from "../modules/appearance/appearance-model";
import { AdminShell } from "../ui/AdminShell";
import { PlatformSettingsPage } from "../modules/global/PlatformSettingsPage";
import { AdminRouter } from "../app/router/AdminRouter";

afterEach(cleanup);
const ok = <T,>(data: T, status = 200): AdminResponse<T> => ({ status, data, headers: new Headers({ "X-Request-ID": "wu05" }) });

function renderWizard(request: AdminTransport["request"]) {
  const router = createMemoryRouter([{ path: "/global/sites/new", element: <DirtyStateProvider><GlobalContextValue value={{ effective_permissions: ["sites.view", "sites.create"] }}><CreateWebsitePage/></GlobalContextValue></DirtyStateProvider> }], { initialEntries: ["/global/sites/new"] });
  render(<AdminApiProvider transport={{ request }}><RouterProvider router={router}/></AdminApiProvider>);
}

async function reachReview(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: /Site key/ }), "SITE-100");
  await user.type(screen.getByRole("textbox", { name: /Display name/ }), "Future Site");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("group", { name: "Website style" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Modern Magazine/ }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("heading", { name: "Typography" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("region", { name: "Representative appearance preview" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByRole("heading", { name: "Confirm website" })).toBeInTheDocument();
}

test("Create Website previews without provisioning, then sends one typed atomic request", async () => {
  const calls: Array<{ id: AdminOperationId; input: AdminRequestInput | undefined }> = [];
  const request: AdminTransport["request"] = async <T,>(id: AdminOperationId, input?: AdminRequestInput) => {
    calls.push({ id, input });
    if (id === "API15-G-011") return ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED", timezone_id: "Asia/Kolkata", created_at: "now", updated_at: "now" }, temporary_hostname: "site-100.preview.example", readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201) as AdminResponse<T>;
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
  expect(screen.getByText("site-100.preview.example")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Open Website Workspace" })).toHaveAttribute("href", "/site/SITE-100/dashboard");
  expect(screen.getByRole("link", { name: "Open Temporary Site" })).toHaveAttribute("href", "https://site-100.preview.example");
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
  complete(ok({ site: { site_key: "SITE-100", display_name: "Future Site", lifecycle_state: "DISABLED" }, temporary_hostname: "site-100.preview.example", readiness: { overall_ready: true, settings_ready: true, navigation_ready: true, homepage_ready: true, temporary_domain_ready: true, missing_components: [] } }, 201));
  expect(await screen.findByRole("region", { name: "Provisioning result" })).toBeInTheDocument();
});

test("shared style and option vocabulary keeps unsupported controls unavailable", () => {
  expect(STYLE_IDS).toHaveLength(5);
  expect(Object.keys(READY_STYLES)).toEqual(STYLE_IDS);
  expect(PAGE_KEYS).toHaveLength(5);
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
  const category = screen.getByRole("combobox", { name: "Category card" }) as HTMLSelectElement;
  const author = screen.getByRole("combobox", { name: "Author card" }) as HTMLSelectElement;
  const type = screen.getByRole("combobox", { name: "Typography preset" }) as HTMLSelectElement;
  expect([...category.options].map(option => option.value)).not.toContain("CAT-08");
  expect([...category.options].map(option => option.value)).not.toContain("CAT-03");
  expect([...author.options].map(option => option.value)).not.toContain("AUTH-12");
  expect([...type.options].map(option => option.value)).toEqual(["TYPE-11", "TYPE-12", "TYPE-21", "TYPE-22"]);
  expect([...(screen.getByRole("combobox", { name: "Density" }) as HTMLSelectElement).options].map(option => option.value)).toEqual(Object.keys(DENSITIES));
  expect([...(screen.getByRole("combobox", { name: "Container width" }) as HTMLSelectElement).options].map(option => option.value)).toEqual(Object.keys(WIDTHS));
  expect(screen.queryByRole("combobox", { name: /Header|Footer|CTA/ })).not.toBeInTheDocument();
});

test("information editor has exactly the five fixed page tabs", () => {
  render(<InformationPagesEditor pages={startingPages()} onChange={() => undefined}/>);
  const tabs = screen.getByRole("group", { name: "Information page" });
  expect(within(tabs).getAllByRole("button").map(button => button.textContent)).toEqual(["About", "Contact", "Privacy Policy", "Terms of Use", "Disclaimer"]);
  expect(screen.queryByRole("textbox", { name: /HTML|CSS|JavaScript/ })).not.toBeInTheDocument();
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
  await user.click(await screen.findByRole("button", { name: "Contact" }));
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
  expect(await screen.findByRole("link", { name: "Open Temporary Website" })).toHaveAttribute("href", url);
  expect(screen.getByText(/disabled and remains unavailable/)).toBeInTheDocument();
  expect(first).toContain("API15-S-001");
  cleanup();
  const second = renderDirectAppearance("SITE-100", url, "ACTIVE");
  expect(await screen.findByRole("link", { name: "Open Temporary Website" })).toHaveAttribute("href", url);
  expect(screen.getByText(/backend noindex and crawler policy/)).toBeInTheDocument();
  expect(second).toContain("API15-S-001");
});

test("Appearance never infers a temporary Host from public URL, site key, or another site", async () => {
  renderDirectAppearance("SITE-100", "https://site-100.preview.example");
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
  await user.click(await screen.findByRole("checkbox", { name: "Use custom semantic colors" }));
  const surface = screen.getByLabelText("surface") as HTMLInputElement;
  const text = screen.getByLabelText("text") as HTMLInputElement;
  fireEvent.change(text, { target: { value: surface.value } });
  await user.click(screen.getByRole("button", { name: "Save Appearance" }));
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
