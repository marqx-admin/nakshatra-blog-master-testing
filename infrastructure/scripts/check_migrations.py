#!/usr/bin/env python3
import argparse, pathlib, re, sys
p=argparse.ArgumentParser(); p.add_argument('--database-root',required=True); a=p.parse_args(); root=pathlib.Path(a.database_root); files=sorted((root/'migrations').glob('*.sql')); rx=re.compile(r'^(\d{4})_(DB-MIG-\d{3})__[a-z0-9][a-z0-9-]*\.sql$'); errs=[]; seq=[]; ids=[]
for f in files:
 m=rx.match(f.name)
 if not m: errs.append(f'invalid migration filename {f.name}'); continue
 seq.append(int(m.group(1))); ids.append(m.group(2))
if seq and seq != list(range(seq[0],seq[0]+len(seq))): errs.append('migration sequence must be contiguous')
if len(ids)!=len(set(ids)): errs.append('duplicate DB-MIG ID')
for x in errs: print('FAIL:',x)
if errs: sys.exit(1)
print(f'PASS: {len(files)} migration files satisfy DOC-24 naming/sequence checks (semantic SQL remains CHAT02/DOC-08 authority)')
