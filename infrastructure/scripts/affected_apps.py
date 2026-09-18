#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, pathlib
SITE_PREFIX='apps/sites/'
ALL_SITES=['site-01-whats-your-rashi','site-02-apki-rashi','site-03-daily-rashi-360','site-04-zodiac-daily','site-05-daily-horoscope-360','site-06-my-horoscope-360','site-07-astro-today-360','site-08-apki-kundli','site-09-match-your-kundli','site-10-apka-nakshatra','site-11-janiye-panchang','site-12-rashi-remedies','site-13-apka-pandit','site-14-vastu-shastra-360']
def affected(paths:list[str]):
    out=set()
    for p in paths:
        if p.startswith(SITE_PREFIX):
            seg=p.split('/')[2]; out.add(seg)
        elif p.startswith('apps/admin/'):
            out.add('admin')
        elif p.startswith('apps/api/') or p.startswith('packages/python/bp-domain') or p.startswith('packages/python/bp-application') or p.startswith('packages/python/bp-ports'):
            out.add('api')
        elif p.startswith('apps/worker/') or p.startswith('packages/python/bp-background-contracts'):
            out.add('worker')
        elif p.startswith('database/'):
            out.update({'api','worker','migrate'})
        elif p.startswith('packages/ts/public-contracts') or p.startswith('packages/ts/api-client-public'):
            out.update(ALL_SITES)
        elif p.startswith('packages/ts/api-client-admin'):
            out.add('admin')
        elif p.startswith('contracts/http/'):
            out.update(ALL_SITES+['admin','api'])
        elif p.startswith('infrastructure/') or p in {'package.json','pnpm-lock.yaml','uv.lock','pyproject.toml','turbo.json'}:
            out.update(ALL_SITES+['admin','api','worker','migrate'])
    return sorted(out)
ap=argparse.ArgumentParser(); ap.add_argument('paths',nargs='*'); a=ap.parse_args(); print(json.dumps({'affected':affected(a.paths)},indent=2))
