from celeryconfig_queues import *
from celery.schedules import crontab

CELERYD_CONCURRENCY = 3
CELERY_IMPORTS = (
                  "flx.controllers.celerytasks.compressImages",
                 )

CELERY_DEFAULT_QUEUE = "iss"

CELERYBEAT_SCHEDULE = {
    "run-every-night-01": {
        "task": "flx.controllers.celerytasks.compressImages.CompressImagesTask",
        "schedule": crontab(minute=0, hour=1), 
    } 
}