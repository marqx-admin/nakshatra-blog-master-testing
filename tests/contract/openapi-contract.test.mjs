import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const python = process.env.BP_PYTHON || (fs.existsSync(path.join(root,'.venv/bin/python')) ? path.join(root,'.venv/bin/python') : 'python3');
const pinnedSha = '001363acaf1f40d65edde67fb06f36990269e89ed1c699f221c4d545a6ea2e65';
const supersededRc9Sha = 'f0d55354f79d7ff43385f5e761670b3cc8bf30a0a19de1623777be83f23ac172';
const source = path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml');
function run(cmd,args) { return spawnSync(cmd,args,{cwd:root,encoding:'utf8'}); }

test('pinned local RC10 bytes and provenance are bound exactly', () => {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  assert.equal(actual,pinnedSha);
  const provenance = JSON.parse(fs.readFileSync(path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.provenance.json'),'utf8'));
  assert.equal(provenance.sha256,pinnedSha);
  assert.equal(provenance.supersedes.sha256,supersededRc9Sha);
});

test('RC10 registry/count/reference/scope/success verification passes', () => {
  const r = run(python,['tooling/scripts/verify-openapi-contract.py']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout,/operations=113 paths=86 schemas\/helpers=245/);
  assert.match(r.stdout,/resolved internal references=1357 unresolved=0/);
  assert.match(r.stdout,/AUTH:12 PUBLIC\/PREVIEW:2 SITE:63 GLOBAL:36/);
  assert.match(r.stdout,/200x86 201x15 202x3 204x9/);
});

test('generated contract and both client packages are deterministic', () => {
  const g = run(process.execPath,['tooling/generators/generate-api-contract.mjs']);
  assert.equal(g.status,0,`${g.stdout}\n${g.stderr}`);
  const d = run(process.execPath,['tooling/scripts/check-generated-drift.mjs']);
  assert.equal(d.status,0,`${d.stdout}\n${d.stderr}`);
});

test('generated public/Admin operation exposure obeys DOC-23 boundary', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'packages/ts/api-contract/generated/contract-manifest.json'),'utf8'));
  assert.deepEqual(manifest.public_operation_ids,['API15-PUB-001','API15-PUB-002']);
  assert.equal(manifest.admin_operation_ids.length,111);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-AUTH-')).length,12);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-S-')).length,63);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-G-')).length,36);
  assert.equal(manifest.admin_operation_ids.some((id)=>id.startsWith('API15-PUB-')),false);
});
