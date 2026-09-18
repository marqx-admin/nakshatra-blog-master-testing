#!/usr/bin/env python3
from __future__ import annotations
import argparse, pathlib, re, sys
from urllib.parse import urlparse
import yaml

def parse_env(path: pathlib.Path) -> dict[str,str]:
    out={}
    for raw in path.read_text().splitlines():
        line=raw.strip()
        if not line or line.startswith('#'): continue
        if '=' not in line: raise ValueError(f'{path}: invalid line: {raw}')
        k,v=line.split('=',1); out[k]=v
    return out

def main() -> int:
    ap=argparse.ArgumentParser(); ap.add_argument('--schema', required=True); ap.add_argument('--env-file', required=True); ap.add_argument('--consumer', default='all'); args=ap.parse_args()
    schema=yaml.safe_load(pathlib.Path(args.schema).read_text())['variables']; vals=parse_env(pathlib.Path(args.env_file)); env=vals.get('BP_ENV')
    errors=[]
    for name, rule in schema.items():
        req=bool(rule.get('required')) or env in rule.get('required_in',[])
        consumers=rule.get('consumers',[])
        aliases={args.consumer}
        if args.consumer in {'api','worker','admin','site','migrate'}: aliases.add('server')
        if args.consumer in {'api','admin','site'}: aliases.add('http')
        if args.consumer in {'admin','site'}: aliases.add('browser')
        if args.consumer in {'api','worker','migrate'}: aliases.add('workload')
        applies='all' in consumers or bool(aliases.intersection(consumers))
        if req and applies and name not in vals: errors.append(f'missing required {name}')
        if name not in vals: continue
        v=vals[name]
        if rule.get('exposure')=='secret_reference' and v and not v.startswith('/run/secrets/bp/'):
            errors.append(f'{name} must reference /run/secrets/bp/, not contain a secret value')
        if 'enum' in rule and v not in [str(x) for x in rule['enum']]: errors.append(f'{name} invalid enum')
        if 'const' in rule and v != str(rule['const']): errors.append(f'{name} must equal {rule["const"]}')
        if 'pattern' in rule and not re.match(rule['pattern'], v): errors.append(f'{name} invalid format')
        if rule.get('type')=='integer':
            try: n=int(v)
            except ValueError: errors.append(f'{name} must be integer'); continue
            if n < rule.get('minimum', n) or n > rule.get('maximum', n): errors.append(f'{name} out of range')
        if rule.get('type')=='uri' and v and not urlparse(v).scheme: errors.append(f'{name} must be URI')
        must=rule.get('must_equal_in',{}).get(env)
        if must is not None and v != str(must): errors.append(f'{name} must equal {must} in {env}')
    forbidden=[k for k in vals if re.search(r'(PASSWORD|TOKEN|PRIVATE_KEY|SECRET)$', k) and not k.endswith('_FILE')]
    errors += [f'forbidden literal-secret variable {k}' for k in forbidden]
    for e in errors: print('FAIL:', e)
    if errors: return 1
    print(f'PASS: configuration template {args.env_file} conforms to deployment schema for {env}')
    return 0
if __name__=='__main__': raise SystemExit(main())
