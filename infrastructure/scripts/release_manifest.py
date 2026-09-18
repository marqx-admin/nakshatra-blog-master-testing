#!/usr/bin/env python3
import argparse, hashlib, json, pathlib, subprocess, time
ap=argparse.ArgumentParser(); ap.add_argument('--root',default='.'); ap.add_argument('--output',required=True); ap.add_argument('--release-sha',required=True); ap.add_argument('--build-id',required=True); ap.add_argument('--images-json'); args=ap.parse_args()
r=pathlib.Path(args.root)
def h(p): return hashlib.sha256(p.read_bytes()).hexdigest()
openapi=r/'contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml'
migs=sorted((r/'database/migrations').glob('*.sql'))
images=json.loads(pathlib.Path(args.images_json).read_text()) if args.images_json else {}
manifest={'schema':'REL24-MANIFEST/v1','release_sha':args.release_sha,'build_id':args.build_id,'created_at':int(time.time()),'lockfiles':{'pnpm-lock.yaml':h(r/'pnpm-lock.yaml'),'uv.lock':h(r/'uv.lock')},'openapi_sha256':h(openapi),'migrations':[{'file':p.name,'sha256':h(p)} for p in migs],'images':images}
pathlib.Path(args.output).write_text(json.dumps(manifest,indent=2,sort_keys=True)+'\n')
print(args.output)
