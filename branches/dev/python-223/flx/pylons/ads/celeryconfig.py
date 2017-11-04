from celeryconfig_queues import *
from celery.schedules import crontab

CELERYD_CONCURRENCY = 3
CELERY_IMPORTS = ( 
                  "flx.controllers.celerytasks.ads",
                 )

from datetime import timedelta

CELERYBEAT_SCHEDULE = {
    "updates-bridge-tables-every-5-minutes": {
        "task": "flx.controllers.celerytasks.ads.updateBridgeTables",
        "schedule": timedelta(seconds=15*60),
    },                       
    "imports-events-every-5-minutes": {
        "task": "flx.controllers.celerytasks.ads.importEvents",
        "schedule": timedelta(seconds=15*60),
    },                       
    "compute-time-spent-every-1-hour": {
        "task": "flx.controllers.celerytasks.ads.computeTimeSpent",
        "schedule": timedelta(seconds=60*60),
    },                       
    "runs-daily-pre-aggregation": {
        "task": "flx.controllers.celerytasks.ads.runDailyAggregation",
        "schedule": crontab(minute=5, hour=0),
    },                       
    "runs-weekly-pre-aggregation": {
        "task": "flx.controllers.celerytasks.ads.runWeeklyAggregation",
        "schedule": crontab(minute=5, hour=0, day_of_week="sunday"),
    },                       
    "runs-monthly-pre-aggregation": {
        "task": "flx.controllers.celerytasks.ads.runMonthlyAggregation",
        "schedule": crontab(minute=5, hour=0),  # fired daily but worker only does work on 1st of each month
    },                       
    "runs-yearly-pre-aggregation": {
        "task": "flx.controllers.celerytasks.ads.runYearlyAggregation",
        "schedule": crontab(minute=5, hour=0),  # fired daily but worker only does work on 1st of each year
    },                       
}
