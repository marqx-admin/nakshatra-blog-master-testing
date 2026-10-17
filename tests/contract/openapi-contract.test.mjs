import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const python = process.env.BP_PYTHON || (fs.existsSync(path.join(root,'.venv/bin/python')) ? path.join(root,'.venv/bin/python') : 'python3');
const pinnedSha = '40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461';
const predecessorSha = 'f5bbedf280cd87705ae98d88dcca5fac1cda604797e5a274e9ca94c27ee5d0cd';
const supersededRc11Sha = '4e717243a5c9c331a6b57867e67b4d325cf4d0b69959bbcf5d3c3e63453d0358';
const source = path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.yaml');
function run(cmd,args) { return spawnSync(cmd,args,{cwd:root,encoding:'utf8'}); }

test('pinned RC13 bytes and immutable RC12 predecessor are bound exactly', () => {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  assert.equal(actual,pinnedSha);
  const provenance = JSON.parse(fs.readFileSync(path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC13.provenance.json'),'utf8'));
  assert.equal(provenance.sha256,pinnedSha);
  assert.equal(provenance.supersedes.sha256,predecessorSha);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.yaml'))).digest('hex'),predecessorSha);
  const rc12Provenance = JSON.parse(fs.readFileSync(path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC12.provenance.json'),'utf8'));
  assert.equal(rc12Provenance.sha256,predecessorSha);
  assert.equal(rc12Provenance.supersedes.sha256,supersededRc11Sha);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'contracts/http/BLOG-DOC-15_openapi_v1.0-RC11.yaml'))).digest('hex'),supersededRc11Sha);
});

test('RC13 registry/count/reference/scope/success verification passes', () => {
  const r = run(python,['tooling/scripts/verify-openapi-contract.py']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
  assert.match(r.stdout,/operations=116 paths=89 schemas\/helpers=252/);
  assert.match(r.stdout,/resolved internal references=1400 unresolved=0/);
  assert.match(r.stdout,/AUTH:12 PUBLIC\/PREVIEW:3 SITE:65 GLOBAL:36/);
  assert.match(r.stdout,/200x88 201x16 202x3 204x9/);
});

test('generated contract and both client packages are deterministic', () => {
  const g = run(process.execPath,['tooling/generators/generate-api-contract.mjs']);
  assert.equal(g.status,0,`${g.stdout}\n${g.stderr}`);
  const d = run(process.execPath,['tooling/scripts/check-generated-drift.mjs']);
  assert.equal(d.status,0,`${d.stdout}\n${d.stderr}`);
});

test('generated public/Admin operation exposure obeys DOC-23 boundary', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root,'packages/ts/api-contract/generated/contract-manifest.json'),'utf8'));
  assert.deepEqual(manifest.public_operation_ids,['API15-PUB-001','API15-PUB-002','API15-PUB-003']);
  assert.equal(manifest.admin_operation_ids.length,113);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-AUTH-')).length,12);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-S-')).length,65);
  assert.equal(manifest.admin_operation_ids.filter((id)=>id.startsWith('API15-G-')).length,36);
  assert.equal(manifest.admin_operation_ids.some((id)=>id.startsWith('API15-PUB-')),false);
});
