from . import q18_cache, q18_maintenance, q18_media, q18_publish, q18_search, q18_sitemap


def register_all(celery_app, runtime):
    tasks=[]
    for module in (q18_publish,q18_media,q18_search,q18_sitemap,q18_cache,q18_maintenance):
        tasks.extend(module.register(celery_app, runtime))
    if len(tasks) != 11:
        raise RuntimeError("DOC-18 requires exactly eleven canonical job task registrations")
    return tasks
