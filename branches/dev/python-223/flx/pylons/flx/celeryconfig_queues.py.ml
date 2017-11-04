BROKER_URL = "amqp://guest@localhost:5672//"

CELERYD_CONCURRENCY = 3
#CELERYD_TASK_SOFT_TIME_LIMIT = 29800
CELERYD_TASK_TIME_LIMIT = 30000
CELERY_DISABLE_RATE_LIMITS = True

CELERY_RESULT_BACKEND = "amqp"

CELERY_QUEUES = {
        "ml": {
            "exchange": "ml",
            "exchange_type": "direct",
            "binding_key": "ml",
        },
}

CELERY_ROUTES = (
        { "flx.controllers.celerytasks.persist_content_model.PersistContentModel": {
            "queue": "ml",
            "routing_key": "ml"
            }
        },
        { "flx.controllers.celerytasks.compute_content_similarity.ComputeContentSimilarity": {
            "queue": "ml",
            "routing_key": "ml"
            }
        },
)
