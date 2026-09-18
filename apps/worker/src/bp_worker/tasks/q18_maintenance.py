from .common import register_job

def register(celery_app, runtime):
    jobs=("JOB18-SCHEDULE-RECONCILE-SITE","JOB18-MEDIA-RECONCILE-SITE","JOB18-SEARCH-RECONCILE-SITE","JOB18-SITEMAP-RECONCILE-SITE")
    return [register_job(celery_app, task_name=f"bp_worker.{j}", queue="q18.maintenance", job_type=j, runtime=runtime) for j in jobs]
