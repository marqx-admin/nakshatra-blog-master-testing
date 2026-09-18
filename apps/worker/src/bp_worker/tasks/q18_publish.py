from .common import register_job

def register(celery_app, runtime):
    return [register_job(celery_app, task_name="bp_worker.JOB18-PUBLISH-DUE", queue="q18.publish", job_type="JOB18-PUBLISH-DUE", runtime=runtime)]
