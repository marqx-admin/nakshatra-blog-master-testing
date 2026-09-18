import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const extensions = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs']);
const skip = new Set(['node_modules','.next','dist','coverage','.git','.venv','.chat01-tmp']);
const providerImports = new Set([
  'pg','postgres','ioredis','redis','@opensearch-project/opensearch','@aws-sdk/client-s3',
  '@aws-sdk/client-dynamodb','@aws-sdk/lib-dynamodb','bullmq','celery','boto3','botocore','psycopg','sqlalchemy','hvac'
]);
const violations = [];
function walk(dir, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (skip.has(e.name)) continue;
    const p = path.join(dir,e.name);
    if (e.isDirectory()) walk(p,out);
    else if (extensions.has(path.extname(e.name))) out.push(p);
  }
  return out;
}
function siteOf(rel) {
  const m = rel.replaceAll('\\\\','/').match(/^apps\/sites\/(site-[^/]+)\//);
  return m?.[1] ?? null;
}
function resolveRelative(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  return path.resolve(path.dirname(fromFile), spec);
}
function packageRoot(spec) {
  if (spec.startsWith('@')) return spec.split('/').slice(0,2).join('/');
  return spec.split('/')[0];
}
const files = [
  ...walk(path.join(root,'apps')),
  ...walk(path.join(root,'packages','ts')),
];
const importRe = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;
for (const file of files) {
  const rel = path.relative(root,file).replaceAll('\\\\','/');
  const sourceSite = siteOf(rel);
  const isFrontend = rel.startsWith('apps/sites/') || rel.startsWith('apps/admin/');
  const isSharedTs = rel.startsWith('packages/ts/');
  const text = fs.readFileSync(file,'utf8');
  for (const match of text.matchAll(importRe)) {
    const spec = match[1] ?? match[2] ?? match[3];
    const resolved = resolveRelative(file,spec);
    if (resolved) {
      const targetRel = path.relative(root,resolved).replaceAll('\\\\','/');
      const targetSite = siteOf(targetRel + '/');
      if (sourceSite && targetSite && sourceSite !== targetSite) {
        violations.push(`${rel}: site-to-site import ${spec} -> ${targetRel}`);
      }
      if (sourceSite && (targetRel.startsWith('apps/admin/') || targetRel.startsWith('apps/api/') || targetRel.startsWith('apps/worker/') || targetRel.startsWith('packages/python/') || targetRel.startsWith('database/') || targetRel.startsWith('infrastructure/'))) {
        violations.push(`${rel}: public-site import crosses into forbidden backend/Admin/infrastructure zone: ${spec}`);
      }
      if (rel.startsWith('apps/admin/') && targetRel.startsWith('apps/sites/')) {
        violations.push(`${rel}: Admin imports public-site source: ${spec}`);
      }
      if (isSharedTs && (targetRel.startsWith('apps/sites/') || targetRel.startsWith('apps/admin/'))) {
        violations.push(`${rel}: shared TS package imports app source: ${spec}`);
      }
    } else if (isFrontend && providerImports.has(packageRoot(spec))) {
      violations.push(`${rel}: frontend imports provider/backend package ${spec}`);
    }
    if (sourceSite && /^@bp\/site-\d+/.test(spec)) {
      const ownPkg = JSON.parse(fs.readFileSync(path.join(root,'apps','sites',sourceSite,'package.json'),'utf8')).name;
      if (spec !== ownPkg && !spec.startsWith(`${ownPkg}/`)) violations.push(`${rel}: public site imports another site package ${spec}`);
    }
  }
}
if (violations.length) {
  console.error(`FAIL JS/TS dependency boundaries (${violations.length} violation(s))`);
  violations.forEach((v) => console.error(`  ${v}`));
  process.exit(1);
}
console.log('PASS JS/TS dependency boundaries (dependency-free fallback scanner)');
