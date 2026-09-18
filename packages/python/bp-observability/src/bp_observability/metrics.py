from __future__ import annotations
from dataclasses import dataclass

FORBIDDEN_LABELS={"post_id","media_id","url","full_url","query","raw_query","email","ip","ip_address","session_id","token","redis_key","exception","exception_text"}
REGISTRY={
 "MET20-API-REQ":("api_request_total",{"operation_id","status_class","scope"}),
 "MET20-API-LAT":("api_request_duration_seconds",{"operation_id","scope"}),
 "MET20-API-CONC":("api_inflight_requests",{"scope"}),
 "MET20-DB-POOL":("db_pool_in_use",{"pool_class"}),
 "MET20-QUEUE":("worker_queue_depth",{"queue"}),
 "MET20-BACKUP":("backup_last_success_age_seconds",{"asset_class"}),
 "MET20-PITR":("pitr_archive_lag_seconds",{"database"}),
 "MET20-RESTORE":("restore_drill_duration_seconds",{"scope","outcome"}),
 "MET20-SEC":("audit_write_failure_total",{"reason","surface"}),
}
@dataclass(frozen=True, slots=True)
class MetricIdentity:
    authority_id: str
    name: str

def validate_metric_labels(labels: dict[str, str]) -> None:
    bad=FORBIDDEN_LABELS.intersection(labels)
    if bad: raise ValueError(f"forbidden high-cardinality/private metric labels: {sorted(bad)}")
