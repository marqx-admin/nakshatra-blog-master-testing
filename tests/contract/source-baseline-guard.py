#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
EXPECTED={
"DOC-00":"v1.0-RC2","DOC-01":"v1.0-RC1","DOC-02":"v1.0-RC1","DOC-03":"v1.0-RC2",
"DOC-04":"v1.0-RC1","DOC-05":"v1.0-RC1","DOC-06":"v1.0-RC1","DOC-07":"v1.0-RC2",
"DOC-08":"v1.0-RC2","DOC-09":"v1.0-RC1","DOC-10":"v1.0-RC1","DOC-11":"v1.0-RC1",
"DOC-12":"v1.0-RC1","DOC-13":"v1.0-RC1","DOC-14":"v1.0-RC1","DOC-15":"v1.0-RC8",
"DOC-16":"v1.0-RC5","DOC-17":"v1.0-RC3","DOC-18":"v1.0-RC3","DOC-19":"v1.0-RC3",
"DOC-20":"v1.0-RC2","DOC-21":"v1.0-RC2","DOC-22":"v1.0-RC2","DOC-23":"v1.0-RC3",
"DOC-24":"v1.0-RC4","DOC-25":"v1.0-RC3","DOC-26":"v1.0-RC2","DOC-27":"v1.0-RC2"}
OPENAPI_SHA="690a99b8580e63359527b719fe4826f45f7a1f8f3fd753beaefb45978ab4a5ca"
RC7_SHA="b338acb443500f06ed2141db66b416f7f0378d26fc96a57b93bfef50d19eff15"
def main():
 d=json.loads((ROOT/'docs/source-baseline.json').read_text()); errors=[]
 if d.get('selected_authorities')!=EXPECTED: errors.append('selected authority versions differ from Wave-2 reconciled baseline')
 c=d.get('openapi_companion') or {}
 if c.get('sha256')!=OPENAPI_SHA: errors.append('RC8 companion digest not pinned')
 if c.get('superseded_rc7_sha256')!=RC7_SHA: errors.append('superseded RC7 provenance changed')
 src=ROOT/c.get('canonical_path','')
 if not src.is_file(): errors.append('canonical RC8 OpenAPI source missing')
 elif hashlib.sha256(src.read_bytes()).hexdigest()!=OPENAPI_SHA: errors.append('canonical RC8 OpenAPI digest mismatch')
 if errors:
  print('FAIL source baseline drift detected'); [print('- '+e) for e in errors]; return 1
 print('PASS Wave-2 reconciled DOC versions and canonical RC8 OpenAPI provenance are intact'); return 0
if __name__=='__main__': raise SystemExit(main())
