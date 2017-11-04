import logging
import traceback
from datetime import datetime
from datetime import timedelta
from urlparse import urlparse, parse_qs

from celery import task
from dexter.views.celerytasks.generictask import GenericTask
from dexter.models import event
from dexter.models import parameter
from dexter.models import entity
from dexter.lib.remoteapi import RemoteAPI as remotecall
from dexter.lib.helpers import DotAccessibleDict, renameKeyWithDot, getTimeBucket, getLoginCookie

log = logging.getLogger(__name__)

@task(name="tasks.fbs_assessment_task", base=GenericTask)
class AssessmentEventTask(GenericTask):

    def __init__(self, **kwargs):
        GenericTask.__init__(self)
        self.singleInstance = True
    
    def run(self):
        GenericTask.run(self, **kwargs)
        # Get the test score api from parameters collection.
        self.test_score_api = None
        params = self.db.Parameters.find_one({'tableName': 'testScoreID'})
        if params:
            self.test_score_api = params['api']
        try:
            # Get the assessment events for last 2nd hour
            # if now is 11.00 A.M, then last 2nd hour will be 9.00 AM to 10.00 AM
            # if now is 11.01 A.M, then last 2nd hour will be 9.00 AM to 10.00 AM
            now = datetime.now()
            tmp_time = now - timedelta(hours=2)
            from_time = datetime(tmp_time.year, tmp_time.month, tmp_time.day, tmp_time.hour)
            to_time = from_time + timedelta(hours=1)
            events = event.Event(self.db, dc=True).getAssessmentEvents(from_time, to_time)

            test_score_ids = []
            for ev in events:
                tmp_payload = ev.get('payload', {})
                if tmp_payload.get('testScoreID'):
                    test_score_ids.append(tmp_payload['testScoreID'])
            # Get list of unique testScoreIDs and retriev the test scores.
            test_score_ids = set(test_score_ids)
            log.info('testScoreIDs :%s'% test_score_ids)
            self.test_score_results = self.get_test_score_results(test_score_ids)

            for each_event in events:
                event_id = each_event.get('_id')
                log.info('Processing event with id: [%s]' %(event_id))
                payload = each_event.get('payload')
                if not payload:
                    log.error('Event with id: [%s] has no payload. Skipping' % (event_id))
                    continue

                log.info('payload: [%s]' %(payload))
                timestamp = each_event.get('timestamp')

                resolved_event_payload = dict()
                resolved_event_payload.update(payload)
                resolved_event_payload['timestamp'] = timestamp
                resolved_event_payload['time_bucket'] = getTimeBucket(timestamp)
                resolved_event_payload['eventID'] = event_id
                resolved_parameters = self.get_resolved_parameters(payload)
                log.info("resolved_parameters :%s" % resolved_parameters)

                resolved_event_payload.update(resolved_parameters)
                resolved_events_collection = 'Resolved_' + each_event.get('eventType')
                log.info('resolvedEventsCollection: [%s]' %(resolved_events_collection))
                log.info('resolvedEventPayload: [%s]' %(resolved_event_payload))
                collection = self.db[resolved_events_collection]
                resolved_event_id = collection.insert(resolved_event_payload)
                log.info('Done resolving event. ResolvedEventID:[%s]' %(resolved_event_id))
                event.Event(self.db, dc=True).resolve(id=event_id)
        except Exception as e:
            log.error('In run Error enountered: %s' %(str(e)))
            log.error(traceback.format_exc())

    def get_test_score_results(self, test_score_ids):
        """
        """
        test_score_results = dict()
        auth_cookies = getLoginCookie()
        log.info('In get_test_score_results, auth_cookies: %s' %(auth_cookies))
        for test_score_id in test_score_ids:
            try:
                # Call the testscore api
                api = self.test_score_api.replace('@param1', test_score_id)
                o = urlparse(api)
                api_server, api_path, api_params = o.scheme + '://' + o.netloc, o.path.lstrip('/'), parse_qs(o.query)
                for key in api_params:
                    api_params[key] = api_params[key][0]
                api_response = remotecall.makeRemoteCallWithAuth(api_path, api_server, params_dict=api_params,
                                                                 method="POST", custom_cookie=auth_cookies)
            
                response = api_response['response']
                testscore = response.get('testScore')
                if testscore:
                    # Prepare the test score results
                    submissions = testscore.get('submissions', {})
                    for submission in submissions:
                        sequence = submission.get('sequence')
                        test_score_key = "%s_%s" % (test_score_id, sequence)
                        asmt_dict = dict()
                        asmt_dict['testScoreID_skipped'] = 1
                        asmt_dict['testScoreID_wrong'] = 1  
                        if submission.get('answered'):
                            asmt_dict['testScoreID_skipped'] = 0
                        if submission.get('correct'):
                            asmt_dict['testScoreID_wrong'] = 0
                        test_score_results[test_score_key] = asmt_dict
            except Exception as e:
                log.error('In get_test_score_results, Error enountered: %s' %(str(e)))
                log.error(traceback.format_exc())
                raise

        return test_score_results
    
    def get_resolved_parameters(self, payload):
        """
        """
        resolved_parameters = dict()
        parameters = payload.keys()
        parameters = parameter.Parameter(self.db).getParameters(parameters)
        for each_parameter in parameters:
            api = each_parameter.get('api')
            if not api:
                continue
            parameter_name = each_parameter.get('name')
            parameter_value = payload.get(parameter_name)
            if not parameter_value:
                continue
            parameter_value = str(parameter_value)
            if parameter_name == 'testScoreID':
                test_score_id = payload.get('testScoreID')
                sequence = payload.get('sequence')
                test_score_key = '%s_%s' % (test_score_id, sequence)
                test_score = self.test_score_results.get(test_score_key, {})
                log.info("test_score_key:%s, test_score:%s" % (test_score_key, test_score))
                resolved_parameters.update(test_score)
                continue
            else:
                table_name = each_parameter.get('tableName')
                entity_value = entity.Entity(self.db, dc=True).getByEntityKey(tableName = table_name, entityKey = parameter_value)
            if entity_value:
                entity_value = DotAccessibleDict(entity_value.get('entityValue'))

            if not entity_value:
                api = each_parameter.get('api').replace('@param', parameter_value)
                log.info('Preparing to execute API: [%s] for parameter: [%s]' %(api, parameter_name))
                o = urlparse(api)
                api_server, api_path, api_params = o.scheme + '://' + o.netloc, o.path.lstrip('/'), parse_qs(o.query)
                for key in api_params:
                    api_params[key] = api_params[key][0]
                if each_parameter.get('requiresAuth'):
                    auth_cookies = getLoginCookie()
                    log.info('auth_cookies: %s' %(auth_cookies))
                    api_response = remotecall.makeRemoteCallWithAuth(api_path, api_server, params_dict=api_params,
                                                                     method="POST", custom_cookie=auth_cookies)
                else:
                    api_response = remotecall.makeRemoteCall(api_path, api_server, method='GET', params_dict=api_params)
                log.info('API Response: %s' % api_response)
                renameKeyWithDot(api_response)
                api_dict = DotAccessibleDict(api_response)
                status_field = each_parameter.get('statusField')
                if status_field:
                    log.info('statusField: %s' %(api_dict[status_field]))
                #raise Exception('Dummy Exception')
                if status_field and api_dict[status_field] != 0:
                    log.error('Non-zero status code from the API. Skipping...')
                    continue
                log.debug(api_response)
                entity.Entity(self.db, dc=True).store(tableName = table_name, entityKey = parameter_value, entityValue = api_response)
                entity_value = api_dict
            log.debug(entity_value)
            for each_attribute in each_parameter.get('attributesField',[]):
                attribute_name = each_attribute.split('.')[-1]
                resolved_parameters[parameter_name + '_' + attribute_name] = entity_value[each_attribute]
        return resolved_parameters

