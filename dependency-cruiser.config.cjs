/**
 * DOC-14/DOC-23 structural dependency rules. dependency-cruiser is the canonical JS/TS graph tool;
 * tooling/scripts/check-js-boundaries.mjs is a dependency-free execution fallback used by CHAT01 evidence.
 */
const siteNames = ['site-01-whats-your-rashi', 'site-02-apki-rashi', 'site-03-daily-rashi-360', 'site-04-zodiac-daily', 'site-05-daily-horoscope-360', 'site-06-my-horoscope-360', 'site-07-astro-today-360', 'site-08-apki-kundli', 'site-09-match-your-kundli', 'site-10-apka-nakshatra', 'site-11-janiye-panchang', 'site-12-rashi-remedies', 'site-13-apka-pandit', 'site-14-vastu-shastra-360'];
const siteIsolation = siteNames.map((site) => ({
  name: `no-${site}-to-other-site`,
  severity: 'error',
  comment: 'A public site may import only its own site source plus approved site-neutral packages.',
  from: { path: `^apps/sites/${site}/` },
  to: { path: `^apps/sites/(?!${site}/)` },
}));

module.exports = {
  forbidden: [
    ...siteIsolation,
    {
      name: 'no-site-to-admin',
      severity: 'error',
      from: { path: '^apps/sites/' },
      to: { path: '^apps/admin/' },
    },
    {
      name: 'no-admin-to-site',
      severity: 'error',
      from: { path: '^apps/admin/' },
      to: { path: '^apps/sites/' },
    },
    {
      name: 'no-frontend-to-backend-internals',
      severity: 'error',
      from: { path: '^(apps/sites|apps/admin)/' },
      to: { path: '^(apps/api|apps/worker|packages/python|database|infrastructure)/' },
    },
    {
      name: 'no-shared-ts-to-app-source',
      severity: 'error',
      from: { path: '^packages/ts/' },
      to: { path: '^apps/(sites|admin)/' },
    },
    {
      name: 'no-api-to-worker-entrypoint',
      severity: 'error',
      from: { path: '^apps/api/' },
      to: { path: '^apps/worker/' },
    },
    {
      name: 'no-worker-to-api-entrypoint',
      severity: 'error',
      from: { path: '^apps/worker/' },
      to: { path: '^apps/api/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)node_modules/' },
    tsConfig: { fileName: 'tsconfig.foundation.json' },
    enhancedResolveOptions: { exportsFields: ['exports'] },
  },
};
