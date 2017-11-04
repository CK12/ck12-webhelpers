BROKER_URL = "amqp://guest@localhost:5672//"

CELERYD_CONCURRENCY = 3
CELERYD_TASK_TIME_LIMIT = 5400

CELERY_RESULT_BACKEND = "amqp"

CELERY_QUEUES = {
        "celery": {
            "exchange": "celery",
            "exchange_type": "direct",
        },
        "ads": {
            "exchange": "ads",
            "exchange_type": "topic",
            "binding_key": "ads"
        }
}

CELERY_ROUTES = (
        { "flx.controllers.celerytasks.ads.updateBridgeTables": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.importEvents": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.logEvent": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.runDailyAggregation": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.runWeeklyAggregation": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.runMonthlyAggregation": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.runYearlyAggregation": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
        { "flx.controllers.celerytasks.ads.computeTimeSpent": {
            "queue": "ads",
            "routing_key": "ads"
            }
        },
)


