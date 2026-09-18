from .common import register_job

def register(celery_app, runtime):
    return [register_job(celery_app, task_name=f"bp_worker.{j}", queue="q18.search", job_type=j, runtime=runtime) for j in ("JOB18-SEARCH-SYNC-POST","JOB18-SEARCH-REFRESH-ENTITY","JOB18-SEARCH-REINDEX-SITE")]
