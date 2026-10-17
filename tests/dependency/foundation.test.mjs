import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = process.cwd();
const python = process.env.BP_PYTHON || (fs.existsSync(path.join(root,'.venv/bin/python')) ? path.join(root,'.venv/bin/python') : 'python3');
function run(cmd,args,options={}) { return spawnSync(cmd,args,{cwd:root,encoding:'utf8',...options}); }

test('foundation structure check passes', () => {
  const r = run(process.execPath,['tooling/scripts/check-foundation.mjs']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
});

test('JS/TS dependency boundary scanner is clean', () => {
  const r = run(process.execPath,['tooling/scripts/check-js-boundaries.mjs']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
});

test('deliberate cross-site import is rejected and clean state returns', () => {
  const fixture = path.join(root,'apps/sites/site-01-whats-your-rashi/src/__boundary_negative__.ts');
  const target = '../site-02-apki-rashi/src/site/site-app.manifest';
  // From SITE-01/src: ../../site-02... reaches apps/sites/site-02...
  fs.writeFileSync(fixture,"import '../../site-02-apki-rashi/src/site/site-app.manifest';\n",'utf8');
  try {
    const bad = run(process.execPath,['tooling/scripts/check-js-boundaries.mjs']);
    assert.notEqual(bad.status,0,'forbidden cross-site import was not detected');
    assert.match(`${bad.stdout}\n${bad.stderr}`,/site-to-site import|another site package/);
  } finally {
    fs.rmSync(fixture,{force:true});
  }
  const clean = run(process.execPath,['tooling/scripts/check-js-boundaries.mjs']);
  assert.equal(clean.status,0,`${clean.stdout}\n${clean.stderr}`);
});

test('Python boundary scanner is clean', () => {
  const r = run(python,['tooling/scripts/check-python-boundaries.py']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
});

test('deliberate Python inward-layer violation is rejected and clean state returns', () => {
  const fixture = path.join(root,'packages/python/bp-domain/src/bp_domain/__boundary_negative__.py');
  fs.writeFileSync(fixture,'import bp_application\n','utf8');
  try {
    const bad = run(python,['tooling/scripts/check-python-boundaries.py']);
    assert.notEqual(bad.status,0,'forbidden domain -> application import was not detected');
    assert.match(`${bad.stdout}\n${bad.stderr}`,/domain may not import bp_application/);
  } finally {
    fs.rmSync(fixture,{force:true});
  }
  const clean = run(python,['tooling/scripts/check-python-boundaries.py']);
  assert.equal(clean.status,0,`${clean.stdout}\n${clean.stderr}`);
});

test('Python import namespaces resolve through declared src roots', () => {
  const r = run(python,['tooling/scripts/check-python-namespaces.py']);
  assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
});

test('pinned RC13 source verifies and deterministic contract/client generation has zero drift', () => {
  const source = run(process.execPath,['tooling/scripts/check-openapi-source.mjs']);
  assert.equal(source.status,0,`${source.stdout}\n${source.stderr}`);
  assert.match(`${source.stdout}\n${source.stderr}`,/pinned canonical RC13 source verified/);

  const gen = run(process.execPath,['tooling/generators/generate-api-contract.mjs']);
  assert.equal(gen.status,0,`${gen.stdout}\n${gen.stderr}`);
  const drift = run(process.execPath,['tooling/scripts/check-generated-drift.mjs']);
  assert.equal(drift.status,0,`${drift.stdout}\n${drift.stderr}`);

  const manifest = JSON.parse(fs.readFileSync(path.join(root,'packages/ts/api-contract/generated/contract-manifest.json'),'utf8'));
  assert.equal(manifest.source_sha256,'40e642fab61bae9f5fd60afac2ad76912cb6f1a5c1fe4e251dc7f0485f278461');
  assert.equal(manifest.operations,116);
  assert.equal(manifest.paths,89);
  assert.equal(manifest.schemas_helpers,252);
  assert.deepEqual(manifest.public_operation_ids,['API15-PUB-001','API15-PUB-002','API15-PUB-003']);
  assert.equal(manifest.admin_operation_ids.length,113);
  assert.ok(manifest.admin_operation_ids.every((id)=>/^API15-(AUTH|S|G)-/.test(id)));
});

test('legacy reference-app scaffold requires an explicit opt-in and copies local ownership only', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(),'bp-site-scaffold-'));
  try {
    const withoutOptIn = run(process.execPath,[
      'tooling/generators/create-public-site.mjs',
      '--app-id=APP-15','--site-id=SITE-15','--domain=ExampleFutureSite.invalid',
      '--folder=site-15-example-future-site','--package=@bp/site-15-example-future-site',`--output=${tmp}`,
    ]);
    assert.notEqual(withoutOptIn.status,0);
    assert.match(withoutOptIn.stderr,/Legacy reference-app scaffold only/);
    const r = run(process.execPath,[
      'tooling/generators/create-public-site.mjs',
      '--legacy-reference',
      '--app-id=APP-15','--site-id=SITE-15','--domain=ExampleFutureSite.invalid',
      '--folder=site-15-example-future-site','--package=@bp/site-15-example-future-site',`--output=${tmp}`,
    ]);
    assert.equal(r.status,0,`${r.stdout}\n${r.stderr}`);
    const created = path.join(tmp,'site-15-example-future-site');
    assert.ok(fs.existsSync(path.join(created,'src/site/site-app.manifest.ts')));
    assert.equal(fs.existsSync(path.join(created,'database')),false);
    assert.equal(fs.existsSync(path.join(created,'infrastructure')),false);
  } finally { fs.rmSync(tmp,{recursive:true,force:true}); }
});
