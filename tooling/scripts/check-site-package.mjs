import fs from 'node:fs';
import path from 'node:path';

const folder = process.argv[2];
if (!folder) {
  console.error('usage: node tooling/scripts/check-site-package.mjs <site-folder>');
  process.exit(2);
}
const root = process.cwd();
const appRoot = path.join(root, 'apps', 'sites', folder);
const required = ['package.json', 'next.config.ts', 'tsconfig.json', 'src/site/site-app.manifest.ts'];
for (const rel of required) {
  if (!fs.existsSync(path.join(appRoot, rel))) {
    console.error(`FAIL missing ${path.join('apps/sites', folder, rel)}`);
    process.exit(1);
  }
}
console.log(`PASS site scaffold ${folder}`);
