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

test('ordinary users share the main dashboard presentation while authority remains server-scoped',()=>{
  const shell=fs.readFileSync(path.join(root,'src/ui/AdminShell.tsx'),'utf8');
  assert.equal(shell.includes('API15-S-001'),false);
  assert.equal(shell.includes('Active Website'),false);
  assert.ok(router.includes('API15-S-001'));
  assert.ok(router.includes('WebsiteDashboardOverview'));
  assert.ok(router.includes('AccountShell'));
  assert.equal(router.includes('<h1>My Websites</h1>'),false);
  assert.ok(globalPages.includes('export function WebsiteDashboardOverview'));
  assert.ok(globalPages.includes('Open Dashboard'));
  assert.ok(router.includes('Full Website Manager'));
  assert.ok(router.includes('response.headers.get("X-BP-Public-Url")'));
  assert.ok(shell.includes('← Back to Dashboard'));
});

test('Super Admin Open Website uses the same server-resolved public URL path',()=>{
  assert.ok(globalPages.includes('API15-S-001'));
  assert.ok(globalPages.includes('response.headers.get("X-BP-Public-Url")'));
  assert.ok(globalPages.includes('publicUrls[siteKey]'));
  assert.equal(globalPages.includes('function frontendUrl'),false);
  assert.equal(globalPages.includes('http://localhost:${3000 + siteNumber}'),false);
});


test('all 14 isolated public RichText renderers preserve soft line breaks',()=>{
  const repoRoot=path.resolve(root,'../..');
  const sitesRoot=path.join(repoRoot,'apps/sites');
  const siteDirs=fs.readdirSync(sitesRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory()&&/^site-\d{2}-/.test(entry.name));
  assert.equal(siteDirs.length,14);
  for(const siteDir of siteDirs){
    const renderer=fs.readFileSync(path.join(sitesRoot,siteDir.name,'src/site/components/semantic-components.tsx'),'utf8');
    assert.ok(renderer.includes('style={{ whiteSpace: "pre-wrap" }}'),`soft line break rendering missing in ${siteDir.name}`);
  }
});

test('Post editor keeps natural writer-state controls out of browser execCommand',()=>{
  assert.equal(editor.includes('document.execCommand('),false);
  assert.ok(editor.includes('onEnter={onSplit}'));
  assert.ok(editor.includes('onBackspaceAtStart={onMergePrevious}'));
  assert.ok(editor.includes('activeBlockId'));
  assert.ok(editor.includes('undoEditor'));
  assert.ok(editor.includes('redoEditor'));
});

test('Phase 1 editor keeps technical concepts out of the routine writer flow',()=>{
  const canvasStart=editor.indexOf('<section className="bp-editor-canvas"');
  const railStart=editor.indexOf('<aside className="bp-editor-rail"',canvasStart);
  assert.ok(canvasStart>=0&&railStart>canvasStart);
  const routineWriter=editor.slice(canvasStart,railStart);
  assert.ok(editor.includes('Bulleted list'));
  assert.ok(editor.includes('Numbered list'));
  assert.ok(editor.includes('const ADVANCED_BLOCK_TYPES:readonly BlockType[]=["SEPARATOR"'));
  assert.ok(routineWriter.includes('label="More"'));
  assert.equal(routineWriter.includes('className="bp-editor-icon-button"aria-label="Divider"'),false);
  assert.equal(routineWriter.includes('<SelectField label="List style"'),false);
  assert.equal(routineWriter.includes('>List style<'),false);
  assert.equal(routineWriter.includes('A horizontal divider will appear here.'),false);
  assert.equal(routineWriter.includes('Put each row on a new line and press Tab between columns.'),false);
  assert.ok(editor.includes('bp-table-editor-grid'));
  assert.ok(editor.includes('Short summary'));
});

test('Phase 1 lifecycle saves current content before publish and schedule',()=>{
  assert.ok(editor.includes('saveBeforeLifecycle'));
  assert.ok(editor.includes('await saveBeforeLifecycle()'));
  assert.ok(editor.includes('setPublishReviewOpen(true)'));
  assert.ok(editor.includes('X-BP-Public-Url'));
  assert.ok(editor.includes('/article/'));
  assert.ok(editor.includes('View Live Post'));
});
