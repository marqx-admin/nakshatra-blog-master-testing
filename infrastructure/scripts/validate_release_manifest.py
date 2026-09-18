#!/usr/bin/env python3
import json, pathlib, re, sys
p=pathlib.Path(sys.argv[1]); d=json.loads(p.read_text()); req=['schema','release_sha','build_id','lockfiles','openapi_sha256','migrations','images']; missing=[k for k in req if k not in d]
errs=[]
if missing: errs.append('missing: '+','.join(missing))
if d.get('schema')!='REL24-MANIFEST/v1': errs.append('wrong manifest schema')
for name,digest in d.get('images',{}).items():
 if not re.search(r'@sha256:[0-9a-f]{64}$',str(digest)): errs.append(f'{name}: image identity must be immutable repo@sha256 digest')
if errs:
 [print('FAIL:',x) for x in errs]; sys.exit(1)
print('PASS: immutable release manifest shape validated')
