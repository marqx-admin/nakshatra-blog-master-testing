#!/usr/bin/env python3
import argparse, json, sys, time
p=argparse.ArgumentParser(); p.add_argument('--wal-lag-seconds',type=float,required=True); p.add_argument('--base-backup-age-seconds',type=float,required=True); p.add_argument('--daily-verification',choices=['PASS','FAIL'],required=True); a=p.parse_args(); failures=[]
if a.wal_lag_seconds>300: failures.append('WAL/PITR archive lag exceeds 300s RPO/release threshold')
if a.base_backup_age_seconds>86400: failures.append('latest successful base backup exceeds 24h release gate')
if a.daily_verification!='PASS': failures.append('daily backup integrity/manifest verification is not PASS')
print(json.dumps({'pitr_release_preflight':'PASS' if not failures else 'FAIL','failures':failures},indent=2)); sys.exit(1 if failures else 0)
