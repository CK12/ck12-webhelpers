BROKER_URL = "redis://localhost:6379/5"

CELERYD_CONCURRENCY = 3
CELERYD_TASK_TIME_LIMIT = 30000
CELERY_DISABLE_RATE_LIMITS = True

CELERY_RESULT_BACKEND = "redis"
CELERY_REDIS_HOST = "localhost"
CELERY_REDIS_PORT = 6379
CELERY_REDIS_DB = 5

CELERY_QUEUES = {
        "iss": {
            "exchange": "iss",
            "exchange_type": "direct",
            "binding_key": "iss",
        },
}

CELERY_ROUTES = (
        { "flx.controllers.celerytasks.compressImages.CompressImagesTask": {
            "queue": "iss",
            "routing_key": "iss"
            }
        },
)
