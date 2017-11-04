from celeryconfig_queues import *
from celery.schedules import crontab

CELERYD_CONCURRENCY = 3
CELERY_IMPORTS = ( "flx.controllers.celerytasks.persist_content_model",
                   "flx.controllers.celerytasks.compute_content_similarity",
                 )

CELERY_DEFAULT_QUEUE = "ml"

from datetime import timedelta

CELERYBEAT_SCHEDULE = {
    "run-every-night-00_05": {
        "task": "flx.controllers.celerytasks.persist_content_model.PersistContentModel",
        "schedule": crontab(minute=5, hour=0)
    },
    "run-every-night-01_00": {
        "task": "flx.controllers.celerytasks.compute_content_similarity.ComputeContentSimilarity",
        "schedule": crontab(minute=0, hour=1)
    },
}
