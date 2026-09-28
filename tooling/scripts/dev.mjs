import { spawn } from "node:child_process";

const adminPort = process.env.VITE_ADMIN_PORT ?? "5173";
const apiPort = process.env.BP_HTTP_PORT ?? "8000";
const adminOrigins = [
  `http://localhost:${adminPort}`,
  `http://127.0.0.1:${adminPort}`,
].join(",");
const localSiteOrigins = Object.fromEntries(
  Array.from({ length: 14 }, (_, index) => [
    `SITE-${String(index + 1).padStart(2, "0")}`,
    `http://127.0.0.1:${3001 + index}`,
  ]),
);
const children = new Set();
let shuttingDown = false;

function launch(command, arguments_, environment = {}) {
  const child = spawn(command, arguments_, {
    cwd: process.cwd(),
    env: { ...process.env, ...environment },
    stdio: "inherit",
  });
  children.add(child);
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `status ${code ?? 1}`;
    console.error(`${command} stopped unexpectedly with ${reason}`);
    shutdown(code ?? 1);
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 750);
}

async function waitForApi(api) {
  const deadline = Date.now() + 120_000;
  const healthUrl = `http://127.0.0.1:${apiPort}/health/live`;
  while (Date.now() < deadline) {
    if (api.exitCode !== null) throw new Error("development API stopped during startup");
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The socket is expected to refuse connections while uv installs/starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`development API did not become healthy at ${healthUrl}`);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const api = launch("uv", ["run", "--frozen", "--package", "bp-api", "python", "-m", "bp_api"], {
  BP_ENV: "development",
  BP_HTTP_PORT: apiPort,
  BP_ADMIN_ORIGINS: process.env.BP_ADMIN_ORIGINS ?? adminOrigins,
  BP_RESET_BASE_URL:
    process.env.BP_RESET_BASE_URL ?? `http://localhost:${adminPort}/password-reset/complete`,
  BP_INVITE_SETUP_BASE_URL:
    process.env.BP_INVITE_SETUP_BASE_URL ?? `http://localhost:${adminPort}/invitation/setup`,
});

try {
  await waitForApi(api);
  console.log(`Development API ready on http://localhost:${apiPort}`);
  launch("corepack", ["pnpm", "--filter", "@bp/admin", "dev"], {
    VITE_ADMIN_PORT: adminPort,
    VITE_ADMIN_API_PROXY_TARGET:
      process.env.VITE_ADMIN_API_PROXY_TARGET ?? `http://127.0.0.1:${apiPort}`,
    VITE_PUBLIC_SITE_ORIGINS:
      process.env.VITE_PUBLIC_SITE_ORIGINS ?? JSON.stringify(localSiteOrigins),
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  shutdown(1);
}
