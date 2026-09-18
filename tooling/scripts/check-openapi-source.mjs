import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'tooling/configs/openapi-baseline.json'), 'utf8'));
const canonical = path.join(root, baseline.canonical_repository_path);
if (!fs.existsSync(canonical)) {
  console.error(`CONTRACT BLOCKER: missing canonical DOC-15 RC8 OpenAPI source: ${baseline.canonical_repository_path}`);
  process.exit(20);
}
const bytes = fs.readFileSync(canonical);
const sha = crypto.createHash('sha256').update(bytes).digest('hex');
if (sha !== baseline.sha256) {
  console.error(`CONTRACT BLOCKER: approved replacement SHA-256 mismatch. expected=${baseline.sha256} actual=${sha}`);
  process.exit(21);
}
const verifier = spawnSync('python3', ['tooling/scripts/verify-openapi-contract.py'], { cwd: root, stdio: 'inherit' });
if (verifier.error) {
  console.error(`FAIL RC8 structural verifier could not start: ${verifier.error.message}`);
  process.exit(30);
}
if (verifier.status !== 0) process.exit(verifier.status ?? 1);
console.log(`PASS canonical owner-approved RC8 replacement verified: ${baseline.canonical_repository_path}`);
console.log(`PASS active SHA-256 ${sha}`);
console.log(`INFO superseded historical lost-artifact SHA-256 ${baseline.historical_unavailable_original_sha256}`);
