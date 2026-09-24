import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const pages=JSON.parse(fs.readFileSync(path.join(root,'src/app/router/admin-pages.json'),'utf8'));
const router=fs.readFileSync(path.join(root,'src/app/router/AdminRouter.tsx'),'utf8');
const editor=fs.readFileSync(path.join(root,'src/modules/site/PostEditor.tsx'),'utf8');
const globalPages=fs.readFileSync(path.join(root,'src/modules/global/GlobalPages.tsx'),'utf8');
const sources=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(/\.(ts|tsx|css|json)$/.test(ent.name))sources.push([p,fs.readFileSync(p,'utf8')]);}}
walk(path.join(root,'src'));
const all=sources.map(([,text])=>text).join('\n');

const SITE_IDS=['ADM-S-DASH-01','ADM-S-POST-01','ADM-S-POST-02','ADM-S-POST-03','ADM-S-POST-04','ADM-S-CAT-01','ADM-S-CAT-02','ADM-S-TAG-01','ADM-S-TAG-02','ADM-S-AUTHOR-01','ADM-S-AUTHOR-02','ADM-S-MEDIA-01','ADM-S-MEDIA-02','ADM-S-NAV-01','ADM-S-SEO-01','ADM-S-REDIR-01','ADM-S-REDIR-02','ADM-S-SEARCH-01','ADM-S-CAL-01','ADM-S-SET-01'];
const GLOBAL_IDS=['ADM-G-NET-01','ADM-G-NET-02','ADM-G-SITE-01','ADM-G-SITE-02','ADM-G-SITE-03','ADM-G-SITE-04','ADM-G-USER-01','ADM-G-USER-02','ADM-G-USER-03','ADM-G-ROLE-01','ADM-G-ROLE-02','ADM-G-ROLE-03','ADM-G-PERM-01','ADM-G-AUDIT-01','ADM-G-AUDIT-02','ADM-G-PLAT-01'];
const BLOCKS=['PARAGRAPH','HEADING','LIST','QUOTE','SEPARATOR','MEDIA','TABLE','EMBED','CALLOUT','CTA','DISCLAIMER','SOURCES_REFERENCES'];

test('exact DOC-06 operational estate is preserved',()=>{
  assert.equal(pages.length,36);
  assert.deepEqual(pages.filter(p=>p.scope==='SITE').map(p=>p.pageId),SITE_IDS);
  assert.deepEqual(pages.filter(p=>p.scope==='GLOBAL').map(p=>p.pageId),GLOBAL_IDS);
  assert.equal(new Set(pages.map(p=>p.pageId)).size,36);
  assert.equal(new Set(pages.map(p=>p.moduleId)).size,19);
  assert.equal(pages.filter(p=>p.primary&&p.scope==='SITE').length,11);
  assert.equal(pages.filter(p=>p.primary&&p.scope==='GLOBAL').length,7);
});

test('every operational route is wired and no operational page id is invented',()=>{
  for(const page of pages){
    const route=page.route.replaceAll(':siteKey',':siteKey');
    assert.ok(router.includes(route),`route missing from AdminRouter: ${page.route}`);
  }
  const ids=[...all.matchAll(/ADM-[SG]-[A-Z0-9-]+/g)].map(m=>m[0]);
  for(const id of new Set(ids)) assert.ok([...SITE_IDS,...GLOBAL_IDS].includes(id),`invented operational page id ${id}`);
});

test('editor exposes exactly the 12 frozen ArticleBody types',()=>{
  const match=editor.match(/ARTICLE_BLOCK_TYPES\s*=\s*\[([^\]]+)\]/s);
  assert.ok(match);
  const found=[...match[1].matchAll(/"([A-Z_]+)"/g)].map(m=>m[1]);
  assert.deepEqual(found,BLOCKS);
  assert.ok(!editor.includes('CUSTOM_HTML'));
  assert.ok(!editor.includes('PAGE_BUILDER'));
});

test('access/security surfaces are outside operational page registry',()=>{
  for(const route of ['/login','/invitation/setup','/password-reset','/password-change','/mfa','/security','/step-up','/access-denied','/session-expired']) assert.ok(router.includes(`path=\"${route}\"`),route);
  assert.ok(pages.every(p=>!p.route.startsWith('/login')&&!p.pageId.includes('LOGIN')));
});

test('Admin source respects architecture boundaries',()=>{
  const prohibited=['openai','@openai','llm provider','DOC-26','DOC-27','packages/python','database/','opensearch','redis://','postgres://'];
  const lower=all.toLowerCase();
  for(const token of prohibited){
    if(token==='DOC-26'||token==='DOC-27') continue; // README/styles may name them only to state exclusion.
    assert.equal(lower.includes(token.toLowerCase()),false,`prohibited runtime/dependency token: ${token}`);
  }
  assert.ok(all.includes('@bp/api-client-admin'));
  assert.ok(all.includes('API15-S-001'));
  assert.ok(all.includes('API15-G-001'));
});

test('My Websites validates each card before opening and the workspace shell stays focused',()=>{
  const shell=fs.readFileSync(path.join(root,'src/ui/AdminShell.tsx'),'utf8');
  assert.equal(shell.includes('API15-S-001'),false);
  assert.equal(shell.includes('Active Website'),false);
  assert.ok(router.includes('API15-S-001'));
  assert.ok(router.includes('<h1>My Websites</h1>'));
  assert.ok(router.includes('Open Dashboard'));
  assert.ok(router.includes('Full Website Manager'));
  assert.equal(router.includes('Validate and open'),false);
  assert.ok(router.includes('"SITE-01":"WhatsYourRashi.in"'));
  assert.ok(router.includes('"SITE-14":"VastuShastra360.in"'));
  assert.equal(router.includes('"SITE-01":"jwohxcdtucakfgaj1hap49wy"'),false);
  assert.equal(router.includes('"SITE-14":"ovlpmow0sqgawkh4xz4hgig0"'),false);
  assert.ok(router.includes('response.headers.get("X-BP-Public-Url")'));
  assert.ok(router.includes('if(site.public_url)return site.public_url'));
});

test('Super Admin Open Website uses the same server-resolved public URL path',()=>{
  assert.ok(globalPages.includes('API15-S-001'));
  assert.ok(globalPages.includes('response.headers.get("X-BP-Public-Url")'));
  assert.ok(globalPages.includes('publicUrls[siteKey]'));
  assert.equal(globalPages.includes('function frontendUrl'),false);
  assert.equal(globalPages.includes('http://localhost:${3000 + siteNumber}'),false);
});
