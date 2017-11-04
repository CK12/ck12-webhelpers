BROKER_URL = "redis://localhost:6379/2"

CELERYD_CONCURRENCY = 1
CELERYD_TASK_SOFT_TIME_LIMIT = 29800
CELERYD_TASK_TIME_LIMIT = 30000
CELERY_DISABLE_RATE_LIMITS = True

CELERY_RESULT_BACKEND = "redis"
CELERY_REDIS_HOST = "localhost"
CELERY_REDIS_PORT = 6379
CELERY_REDIS_DB = 2

CELERY_ENABLE_UTC = False

CELERY_IMPORTS = ( 
                  "auth.controllers.celerytasks.clever",
                  "auth.controllers.celerytasks.marketing",
                 )

CELERY_QUEUES = {
        "data-auth": {
            "exchange": "data-auth",
            "exchange_type": "direct",
            "binding_key": "data-auth",
        }
    }

CELERY_DEFAULT_QUEUE = "data-auth"

from datetime import timedelta

CELERYBEAT_SCHEDULE = {
    "run-every-24-hrs-1": {
        "task": "auth.controllers.celerytasks.clever.CleverPartnerUpdator",
        "schedule": timedelta(seconds=60*60*24),
    },
}
