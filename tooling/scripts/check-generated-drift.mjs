import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceCheck = spawnSync(process.execPath, ['tooling/scripts/check-openapi-source.mjs'], {
  cwd: root,
  stdio: 'inherit',
});
if (sourceCheck.status !== 0) process.exit(sourceCheck.status ?? 1);

const run = spawnSync('python3', ['tooling/generators/generate_openapi_artifacts.py', '--check'], {
  cwd: root,
  stdio: 'inherit',
});
if (run.error) {
  console.error(`FAIL deterministic RC8 drift checker could not start: ${run.error.message}`);
  process.exit(30);
}
process.exit(run.status ?? 1);
