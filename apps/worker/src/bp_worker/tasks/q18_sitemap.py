from .common import register_job

def register(celery_app, runtime):
    return [register_job(celery_app, task_name="bp_worker.JOB18-SITEMAP-BUILD-SITE", queue="q18.sitemap", job_type="JOB18-SITEMAP-BUILD-SITE", runtime=runtime)]
