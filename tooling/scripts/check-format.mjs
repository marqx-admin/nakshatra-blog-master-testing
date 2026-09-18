import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skip = new Set(['node_modules', '.git', '.venv', '.next', 'dist', 'coverage', '.chat01-tmp']);
const textExt = new Set(['.json','.md','.mjs','.cjs','.js','.ts','.tsx','.py','.toml','.ini','.yaml','.yml','.txt','.editorconfig','.gitattributes','.gitignore']);
const problems = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else {
      const ext = path.extname(entry.name);
      const base = entry.name;
      if (!(textExt.has(ext) || ['.gitignore','.editorconfig','.gitattributes','.prettierignore','.nvmrc','.python-version'].includes(base))) continue;
      const buf = fs.readFileSync(p);
      if (buf.includes(0)) continue;
      const s = buf.toString('utf8');
      if (s.length && !s.endsWith('\n')) problems.push(`${path.relative(root,p)}: missing final newline`);
      const lines = s.split('\n');
      lines.forEach((line, idx) => {
        if (/[ \t]+$/.test(line)) problems.push(`${path.relative(root,p)}:${idx+1}: trailing whitespace`);
        if (/\t/.test(line) && !base.endsWith('.txt')) problems.push(`${path.relative(root,p)}:${idx+1}: tab character`);
      });
    }
  }
}
walk(root);
if (problems.length) {
  console.error('FAIL foundation format check');
  problems.slice(0,50).forEach((p) => console.error(`  ${p}`));
  process.exit(1);
}
console.log('PASS foundation format check (LF/final-newline/trailing-whitespace/tab policy)');
