import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.replace(/^--/, '').split('=');
  return [k, rest.join('=')];
}));
const required = ['app-id','site-id','domain','folder','package'];
for (const key of required) {
  if (!args[key]) {
    console.error(`missing --${key}=...`);
    process.exit(2);
  }
}
if (!/^APP-\d{2,}$/.test(args['app-id']) || !/^SITE-\d{2,}$/.test(args['site-id']) || !/^site-\d{2,}-[a-z0-9-]+$/.test(args.folder) || !/^@bp\/site-\d{2,}-[a-z0-9-]+$/.test(args.package)) {
  console.error('invalid neutral site scaffold identity format');
  process.exit(3);
}
const root = process.cwd();
const targetBase = args.output ? path.resolve(args.output) : path.join(root, 'apps/sites');
const target = path.join(targetBase, args.folder);
if (fs.existsSync(target)) {
  console.error(`target already exists: ${target}`);
  process.exit(4);
}
const template = path.join(root, 'tooling/scaffolds/public-site');
fs.cpSync(template, target, { recursive: true });
const replacements = {
  '__APP_ID__': args['app-id'], '__SITE_ID__': args['site-id'], '__DOMAIN__': args.domain,
  '__FOLDER__': args.folder, '__PACKAGE__': args.package,
};
function walk(dir) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p = path.join(dir,e.name);
    if (e.isDirectory()) walk(p);
    else {
      let text = fs.readFileSync(p,'utf8');
      for (const [from,to] of Object.entries(replacements)) text = text.replaceAll(from,to);
      fs.writeFileSync(p,text);
    }
  }
}
walk(target);
console.log(`PASS neutral site scaffold created: ${target}`);
console.log('No DB/domain registry row, permission, content, deployment resource or runtime shared visual dependency was created.');
