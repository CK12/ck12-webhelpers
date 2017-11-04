from datetime import timedelta
from celery.schedules import crontab

CELERYBEAT_SCHEDULE = {
    "run-every-5-min": {
        "task": "dexter.views.celerytasks.entity_resolver.EntityResolver",
        "schedule": timedelta(seconds=5*60),
    },
    "run-every-1-min": {
        "task": "dexter.views.celerytasks.dispatcher.Dispatcher",
        "schedule": timedelta(seconds=1*60),
    },
    "run-every-midnight": {
        "task": "dexter.views.celerytasks.entity_reporter.EntityReporter",
        "schedule": crontab(minute=15, hour=0),
    },
    "run-every-1-hour": {
        "task": "dexter.views.celerytasks.fbs_search_aggregate.FBSSearchAggregateTask",
        "schedule": crontab(minute=1, hour='*/1'),
    },
    "run-every-1-hour-concept": {
        "task": "dexter.views.celerytasks.fbs_concept_aggregate.FBSConceptAggregateTask",
        "schedule": crontab(minute=1, hour='*/1'),
    },
    "run-every-hour": {
        "task": "dexter.views.celerytasks.fbs_modality_aggregate.FBSModalityAggregateTask",
        "schedule": crontab(minute=1, hour='*/1'),
    },
    "run-every-5-mins": {
        "task": "dexter.views.celerytasks.assessment.AssessmentEventTask",
        "schedule": crontab(minute=1, hour='*/1'),
    },
    "run-every-one-hour": {
        "task": "dexter.views.celerytasks.record_event_parameters.EventParametersTask",
        "schedule": crontab(minute=1, hour='*/1'),
    },
    "runs-every-midnight": {
        "task": "dexter.views.celerytasks.fbs_concept_loader.FBSConceptLoaderTask",
        "schedule": crontab(minute=15, hour=0),
    }, 
}

CELERY_ROUTES = (
        { "dexter.views.celerytasks.entity_resolver.EntityResolver": {
          "queue": "entity_resolver"
            }
        },
        { "dexter.views.celerytasks.entity_reporter.EntityReporter": {
          "queue": "entity_reporter"
            }
        },
        { "dexter.views.celerytasks.dispatcher.Dispatcher": {
          "queue": "dispatcher"
            }
        },
        { "dexter.views.celerytasks.fbs_search_aggregate.FBSSearchAggregateTask": {
          "queue": "fbs_aggregate"
            }
        },
        { "dexter.views.celerytasks.fbs_concept_aggregate.FBSConceptAggregateTask": {
          "queue": "fbs_aggregate"
            }
        },
        { "dexter.views.celerytasks.fbs_modality_aggregate.FBSModalityAggregateTask": {
          "queue": "fbs_aggregate"
            }
        },
        { "dexter.views.celerytasks.assessment.AssessmentEventTask": {
          "queue": "fbs_assessment"
            }
        },
        { "dexter.views.celerytasks.record_event_parameters.EventParametersTask": {
          "queue": "event_parameters"
            }
        },
        { "dexter.views.celerytasks.fbs_concept_loader.FBSConceptLoaderTask": {
          "queue": "fbs_concept_loader"
            }
        },        
)
