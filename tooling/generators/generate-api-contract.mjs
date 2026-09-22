import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const python = process.env.BP_PYTHON || (fs.existsSync(path.join(root, '.venv/bin/python')) ? path.join(root, '.venv/bin/python') : 'python3');
const sourceCheck = spawnSync(process.execPath, ['tooling/scripts/check-openapi-source.mjs'], {
  cwd: root,
  stdio: 'inherit',
});
if (sourceCheck.status !== 0) process.exit(sourceCheck.status ?? 1);

const run = spawnSync(python, ['tooling/generators/generate_openapi_artifacts.py', '--write'], {
  cwd: root,
  stdio: 'inherit',
});
if (run.error) {
  console.error(`FAIL deterministic RC8 generator could not start: ${run.error.message}`);
  process.exit(30);
}
process.exit(run.status ?? 1);
