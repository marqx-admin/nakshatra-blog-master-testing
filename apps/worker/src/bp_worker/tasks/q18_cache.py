from .common import register_job

def register(celery_app, runtime):
    return [register_job(celery_app, task_name="bp_worker.JOB18-CACHE-INVALIDATE", queue="q18.cache", job_type="JOB18-CACHE-INVALIDATE", runtime=runtime)]
