import logging
import traceback
from urlparse import urlparse, parse_qs
from celery import task
from pymongo import ASCENDING
#from time import sleep

from dexter.views.celerytasks.generictask import GenericTask
from dexter.models import event
from dexter.models import parameter
from dexter.models import entity
from dexter.lib.remoteapi import RemoteAPI as remotecall
from dexter.lib.helpers import DotAccessibleDict, renameKeyWithDot, getTimeBucket, getLoginCookie, convert_to_utc_from_timestamp
from dexter.lib.global_lock import GlobalLock
log = logging.getLogger(__name__)

@task(name="tasks.entity_resolver", base=GenericTask)
class EntityResolver(GenericTask):

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)
        try:
            log.info('Running celery-beat with taskID: %s' %(self.taskID))
            pageNum = 1
            pageSize = 5000
            #timeBucketFormats = ['%Y-year', '%Y-%m-month', '%Y-%W-week', '%Y-%m-%d-day', '%Y-%m-%d %H-hour']
            # Get all un-resolved events sorted by timestamp
            while True:
                with GlobalLock(self.rs, key='ERS_LOCK', value=self.taskID, expires=60):
                    events = event.Event(self.db, dc=True).getAll({'resolved': False}, pageNum=pageNum, pageSize=pageSize, sort=[("timestamp", ASCENDING)])
                    idList = [x.get('_id') for x in events]
                    event.Event(self.db, dc=True).process(idList=idList)
                if not events:
                    break
                for eachEvent in events:
                    eventID = eachEvent.get('_id')
                    log.info('Processing event with id: [%s]' %(eventID))
                    payload = eachEvent.get('payload')
                    if not payload:
                        log.error('Event with id: [%s] has no payload. Skipping' %(eventID))
                        break
                    parameters = payload.keys()
                    parameters = parameter.Parameter(self.db).getParameters(parameters)
                    resolvedEventPayload = {}
                    resolvedEventPayload.update(payload)
                    timestamp = eachEvent.get('timestamp')
                    resolvedEventPayload['timestamp'] = timestamp
                    resolvedEventPayload['timestamp_utc'] = eachEvent.get('timestamp_utc')
                    resolvedEventPayload['time_bucket'] = getTimeBucket(timestamp)
                    resolvedEventPayload['eventID'] = eventID
                    resolvedParameters = {}
                    try:
                        for eachParameter in parameters:
                            api = eachParameter.get('api')
                            if not api:
                                continue
                            parameterName = eachParameter.get('name')
                            parameterValue = str(payload.get(parameterName))
                            if not parameterValue:
                                continue
                            if parameterName == 'context_eid':
                                parameterValue = parameterValue.split(',')[0]
                            quizAPI = False
                            if parameterName == 'testScoreID':
                                quizAPI = True
                                entityValue = None # For testScoreID we do not store response in db.
                            else:
                                tableName = eachParameter.get('tableName')
                                entityValue = entity.Entity(self.db, dc=True).getByEntityKey(tableName = tableName, entityKey = parameterValue)
                            if entityValue:
                                entityValue = DotAccessibleDict(entityValue.get('entityValue'))
                            #entityValue = None
                            if not entityValue:
                                # Prepare the API for quiz.
                                if quizAPI:
                                    testScoreID = str(payload.get('testScoreID'))
                                    sequence = str(payload.get('sequence'))
                                    api = eachParameter.get('api').replace('@param1', testScoreID).replace('@param2', sequence)
                                else:
                                    api = eachParameter.get('api').replace('@param', parameterValue)
                                log.info('Preparing to execute API: [%s] for parameter: [%s]' %(api, parameterName))
                                o = urlparse(api)
                                api_server, api_path, api_params = o.scheme + '://' + o.netloc, o.path.lstrip('/'), parse_qs(o.query)
                                for key in api_params:
                                    api_params[key] = api_params[key][0]
                                if eachParameter.get('requiresAuth'):
                                    auth_cookies = getLoginCookie()
                                    log.info('auth_cookies: %s' %(auth_cookies))
                                    api_response = remotecall.makeRemoteCallWithAuth(api_path, api_server, params_dict=api_params,method="POST", custom_cookie=auth_cookies)
                                else:
                                    api_response = remotecall.makeRemoteCall(api_path, api_server, method='GET', params_dict=api_params)
                                log.info('API Response: %s' % api_response)
                                renameKeyWithDot(api_response)
                                apiDict = DotAccessibleDict(api_response)
                                statusField = eachParameter.get('statusField')
                                if statusField:
                                    log.info('statusField: %s' %(apiDict[statusField]))
                                #raise Exception('Dummy Exception')
                                if statusField and apiDict[statusField] != 0:
                                    log.error('Non-zero status code from the API. Skipping...')
                                    continue
                                log.debug(api_response)
                                # Do not add entity in case of testScore. 
                                if not quizAPI:
                                    entity.Entity(self.db, dc=True).store(tableName = tableName, entityKey = parameterValue, entityValue = api_response)
                                entityValue = apiDict
                            log.debug(entityValue)
                            for eachAttribute in eachParameter.get('attributesField',[]):
                                attributeName = eachAttribute.split('.')[-1]
                                resolvedParameters[parameterName + '_' + attributeName] = entityValue[eachAttribute]
                    except Exception as e:
                        log.error('Exception in processing event with id: [%s]. Skipping...' %(eventID))
                        log.error(traceback.format_exc())
                        continue
                    resolvedEventPayload.update(resolvedParameters)
                    resolvedEventsCollection = 'Resolved_' + eachEvent.get('eventType')
                    log.info('resolvedEventsCollection: [%s]' %(resolvedEventsCollection))
                    log.info('resolvedEventPayload: [%s]' %(resolvedEventPayload))
                    collection = self.db[resolvedEventsCollection]
                    resolvedEventID = collection.insert(resolvedEventPayload)
                    log.info('Done resolving event. ResolvedEventID:[%s]' %(resolvedEventID))
                    event.Event(self.db, dc=True).resolve(id=eventID)

                pageNum = pageNum + 1
        except Exception as e:
            log.error('Error enountered: %s' %(str(e)))
            log.error(traceback.format_exc())
        return True
