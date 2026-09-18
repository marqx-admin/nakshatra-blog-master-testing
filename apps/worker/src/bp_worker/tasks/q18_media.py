from .common import register_job

def register(celery_app, runtime):
    return [register_job(celery_app, task_name="bp_worker.JOB18-MEDIA-VARIANTS", queue="q18.media", job_type="JOB18-MEDIA-VARIANTS", runtime=runtime)]
