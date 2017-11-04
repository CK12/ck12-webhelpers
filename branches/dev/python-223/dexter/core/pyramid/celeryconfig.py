from celeryconfig_queues import *

CELERYD_CONCURRENCY = 5


BROKER_URL = "redis://qaflxcore1.ck12.org:6379/0"

CELERYD_CONCURRENCY = 5
CELERYD_TASK_SOFT_TIME_LIMIT = 29800
CELERYD_TASK_TIME_LIMIT = 30000
CELERY_DISABLE_RATE_LIMITS = True

CELERY_RESULT_BACKEND = "redis"
CELERY_REDIS_HOST = "qaflxcore1.ck12.org"
CELERY_REDIS_PORT = 6379
CELERY_REDIS_DB = 0

CELERY_ENABLE_UTC = False

CELERY_IMPORTS = (
    "dexter.views.celerytasks.events",
    "dexter.views.celerytasks.entity_resolver",
    "dexter.views.celerytasks.dispatcher",
    "dexter.views.celerytasks.eventtasks.executor",
    "dexter.views.celerytasks.entity_reporter",
    "dexter.views.celerytasks.fbs_search_aggregate",
    "dexter.views.celerytasks.fbs_concept_aggregate",    
    "dexter.views.celerytasks.fbs_modality_aggregate",    
    "dexter.views.celerytasks.assessment",
    "dexter.views.celerytasks.record_event_parameters",
    "dexter.views.celerytasks.fbs_concept_loader",
    )

