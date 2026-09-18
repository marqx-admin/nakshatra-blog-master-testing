import { spawn } from "node:child_process";

const sites = [
  ["@bp/site-01-whats-your-rashi", 3001, "WhatsYourRashi.in"],
  ["@bp/site-02-apki-rashi", 3002, "ApkiRashi.com"],
  ["@bp/site-03-daily-rashi-360", 3003, "DailyRashi360.com"],
  ["@bp/site-04-zodiac-daily", 3004, "ZodiacDaily.in"],
  ["@bp/site-05-daily-horoscope-360", 3005, "DailyHoroscope360.com"],
  ["@bp/site-06-my-horoscope-360", 3006, "MyHoroscope360.com"],
  ["@bp/site-07-astro-today-360", 3007, "AstroToday360.com"],
  ["@bp/site-08-apki-kundli", 3008, "ApkiKundli.com"],
  ["@bp/site-09-match-your-kundli", 3009, "MatchYourKundli.com"],
  ["@bp/site-10-apka-nakshatra", 3010, "ApkaNakshatra.com"],
  ["@bp/site-11-janiye-panchang", 3011, "JaniyePanchang.com"],
  ["@bp/site-12-rashi-remedies", 3012, "RashiRemedies.com"],
  ["@bp/site-13-apka-pandit", 3013, "ApkaPandit.in"],
  ["@bp/site-14-vastu-shastra-360", 3014, "VastuShastra360.in"],
];

const children = new Set();
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 750);
}

function launch([packageName, port, domain]) {
  const child = spawn(
    "corepack",
    ["pnpm", "--filter", packageName, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BP_API_INTERNAL_ORIGIN: process.env.BP_API_INTERNAL_ORIGIN ?? "http://127.0.0.1:8080",
        BP_PUBLIC_HOST_OVERRIDE: domain,
        NODE_OPTIONS: process.env.BP_SITE_NODE_OPTIONS ?? "--max-old-space-size=384",
      },
      stdio: "inherit",
    },
  );
  children.add(child);
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `status ${code ?? 1}`;
    console.error(`${packageName} stopped unexpectedly with ${reason}`);
    shutdown(code ?? 1);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

for (const site of sites) {
  launch(site);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

console.log("Public sites starting on http://localhost:3001 through http://localhost:3014");
