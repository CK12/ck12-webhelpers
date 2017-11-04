import logging
import traceback

from celery import task
from dexter.lib import helpers as h
from dexter.lib.helpers import getTimeBucket

from dexter.views.celerytasks.generictask import GenericTask
from dexter.models import event

log = logging.getLogger(__name__)

@task(name="events.validate", base=GenericTask)
class EventTask(GenericTask):

    def run(self, clientID, eventType, resolved, payload, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            log.info('Validating and storing event from clientID: [%s] for eventType: [%s] with payload: [%s]' %(clientID, eventType, payload))
            eventDict = {}
            eventDict['clientID'] = clientID
            eventDict['eventType'] = eventType
            eventDict['payload'] = h.fixDecimalValues(payload)
            timestamp = h.toDatetime(payload['timestamp'], format='%Y-%m-%d %H:%M:%S %f')
            timestamp_utc = h.convert_to_utc_from_timestamp(timestamp)
            timebucket = getTimeBucket(timestamp)
            eventDict['timestamp'] = timestamp
            eventDict['timestamp_utc'] = timestamp_utc
            eventDict['time_bucket'] = timebucket
            del payload['timestamp']
            del payload['timestamp_utc']
            eventDict['resolved'] = resolved
            if not resolved:
                eventID = event.Event(self.db, dc=True).store(**eventDict)
                log.info('Storing the event in Events collection. EventID: [%s]' %(eventID['_id']))
            else:
                resolvedEventPayload = {}
                resolvedEventPayload['timestamp'] = timestamp
                resolvedEventPayload['timestamp_utc'] = timestamp_utc
                resolvedEventPayload['time_bucket'] = timebucket
                resolvedEventPayload.update(payload)
                resolvedEventsCollection = 'Resolved_' + eventType
                log.info('resolvedEventsCollection: [%s]' %(resolvedEventsCollection))
                log.info('resolvedEventPayload: [%s]' %(resolvedEventPayload))
                collection = self.db[resolvedEventsCollection]
                resolvedEventID = collection.insert(resolvedEventPayload)
                log.info('Storing the already resolved event. ResolvedEventID: [%s]' %(resolvedEventID))
        except Exception as e:
            log.error('Error enountered: %s' %(str(e)))
            log.error(traceback.format_exc())
        return True
