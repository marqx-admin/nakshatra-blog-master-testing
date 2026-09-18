#!/usr/bin/env sh
set -eu
: "${BP_ENV:?BP_ENV required}"
: "${BP_RDS_INSTANCE_ID:?BP_RDS_INSTANCE_ID required}"
: "${BP_MEDIA_BUCKET:?BP_MEDIA_BUCKET required}"
command -v aws >/dev/null 2>&1 || { echo 'FAIL: aws CLI unavailable' >&2; exit 2; }
aws rds describe-db-instances --db-instance-identifier "$BP_RDS_INSTANCE_ID" --query 'DBInstances[0].{Status:DBInstanceStatus,BackupRetentionPeriod:BackupRetentionPeriod,LatestRestorableTime:LatestRestorableTime,Encrypted:StorageEncrypted}' --output json
aws s3api get-bucket-versioning --bucket "$BP_MEDIA_BUCKET" --output json
aws s3api get-public-access-block --bucket "$BP_MEDIA_BUCKET" --output json
