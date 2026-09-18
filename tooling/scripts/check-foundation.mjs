import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const siteRegistry = JSON.parse(fs.readFileSync(path.join(root,'tooling/configs/site-registry.json'),'utf8'));
const expectedTs = ['api-contract','api-client-public','api-client-admin','public-contracts','shared-utils','tooling-config'];
const expectedPy = ['bp-domain','bp-ports','bp-application','bp-background-contracts','bp-adapters-postgres','bp-adapters-redis','bp-adapters-queue','bp-adapters-search','bp-adapters-object-storage','bp-adapters-media','bp-adapters-security-store','bp-adapters-secrets','bp-adapters-mail','bp-observability','bp-test-support'];
const errors = [];
const pass = [];
function exists(rel) { return fs.existsSync(path.join(root,rel)); }

const siteRoot = path.join(root,'apps/sites');
const actualSites = fs.readdirSync(siteRoot,{withFileTypes:true}).filter((e)=>e.isDirectory()).map((e)=>e.name).sort();
const expectedSites = siteRegistry.map((s)=>s.folder).sort();
if (JSON.stringify(actualSites) !== JSON.stringify(expectedSites)) errors.push(`site folder registry mismatch actual=${actualSites.length} expected=14`); else pass.push('exact 14 public site folders');
for (const s of siteRegistry) {
  const pkgPath = path.join(root,'apps/sites',s.folder,'package.json');
  if (!fs.existsSync(pkgPath)) { errors.push(`missing ${path.relative(root,pkgPath)}`); continue; }
  const pkg = JSON.parse(fs.readFileSync(pkgPath,'utf8'));
  if (pkg.name !== s.package || pkg.bp?.appId !== s.app_id || pkg.bp?.siteId !== s.site_id || pkg.bp?.canonicalDomain !== s.canonical_domain) errors.push(`identity mismatch ${s.folder}`);
}
if (['apps/admin','apps/api','apps/worker'].every(exists)) pass.push('Admin + API + Worker containers'); else errors.push('Admin/API/Worker container missing');
for (const p of expectedTs) if (!exists(`packages/ts/${p}/package.json`)) errors.push(`missing TS package ${p}`);
if (!errors.some((e)=>e.startsWith('missing TS'))) pass.push(`required TS package containers (${expectedTs.length})`);
for (const p of expectedPy) if (!exists(`packages/python/${p}/pyproject.toml`)) errors.push(`missing Python package ${p}`);
if (!errors.some((e)=>e.startsWith('missing Python'))) pass.push(`required Python package containers (${expectedPy.length})`);
const prohibitedShared = ['shared-public-ui','public-ui','shared-theme','global-site-theme','shared-header','shared-footer','shared-public-components','shared-cards','shared-layouts','ui','theme'];
for (const p of prohibitedShared) if (exists(`packages/ts/${p}`)) errors.push(`prohibited shared public presentation package exists: packages/ts/${p}`);
if (!errors.some((e)=>e.includes('prohibited shared'))) pass.push('no shared public presentation package');
const locks = [];
function findLocks(dir) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (['node_modules','.git','.venv'].includes(e.name)) continue;
    const p = path.join(dir,e.name); const rel = path.relative(root,p).replaceAll('\\\\','/');
    if (e.isDirectory()) findLocks(p);
    else if (['pnpm-lock.yaml','package-lock.json','yarn.lock','npm-shrinkwrap.json','poetry.lock','pdm.lock'].includes(e.name)) locks.push(rel);
  }
}
findLocks(root);
const expectedLocks = ['pnpm-lock.yaml','uv.lock'];
if (!locks.includes('pnpm-lock.yaml')) errors.push('missing root pnpm-lock.yaml');
if (!exists('uv.lock')) errors.push('missing root uv.lock');
if (locks.some((l)=>l !== 'pnpm-lock.yaml')) errors.push(`competing/package-local lockfile(s): ${locks.filter((l)=>l!=='pnpm-lock.yaml').join(', ')}`); else pass.push('single JS lock strategy + root uv.lock authority');
for (const d of ['database/migrations','database/seeds','database/rls','database/verification']) {
  if (!exists(d)) errors.push(`missing required database ownership root ${d}`);
}
if (!errors.some((e)=>e.includes('database ownership root'))) pass.push('database ownership roots preserved for CHAT02/integrated implementation');
const canonical = 'contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml';
if (exists(canonical)) pass.push('canonical owner-approved RC8 YAML bound'); else errors.push('canonical RC8 YAML missing');
for (const generated of [
  'packages/ts/api-contract/generated/openapi.ts',
  'packages/ts/api-contract/generated/operation-registry.ts',
  'packages/ts/api-contract/generated/contract-manifest.json',
  'packages/ts/api-client-public/src/generated.ts',
  'packages/ts/api-client-admin/src/generated.ts',
]) {
  if (!exists(generated)) errors.push(`missing generated contract/client artifact ${generated}`);
}
if (!errors.some((e)=>e.includes('generated contract/client'))) pass.push('generated RC8 contract and both typed client sources present');
for (const item of pass) console.log(`PASS ${item}`);
if (errors.length) {
  console.error(`FAIL foundation structure (${errors.length} error(s))`);
  errors.forEach((e)=>console.error(`  ${e}`));
  process.exit(1);
}
console.log('PASS CHAT01 foundation structure');
