
import urllib2
from urlparse import urlparse
from urllib import quote
import json
import Cookie
import traceback
import sys
import argparse
import logging
from datetime import datetime
import pymongo
from bson.objectid import ObjectId
from dexter.lib import helpers as h
from dexter.models.auth.user import UserManager as um

test_score_api = "http://astro.ck12.org/assessment/api/get/detail/testScore/@param1?sequence=@param2"

# Initialise Logger
log = logging.getLogger(__name__)
hdlr = logging.StreamHandler()
#hdlr = logging.FileHandler('/tmp/assessment_error.log')
#hdlr = logging.handlers.RotatingFileHandler('/tmp/assessment_error.log', maxBytes=20*1024*1024, backupCount=5)

formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)


def run(event_type, time_bucket, valid_reasons):
    """
    """
    # Get mongo db instance.
    db = get_mongo_db()
    print "%s:%s:%s" %(event_type, time_bucket, valid_reasons)
    valid_count = 0
    
    delete_events = []
    skip_counter = 0 
    record_limit = 1000
    rec_count = 0
    auth_cookies = getLoginCookie()
    while True:        
        events = db.InvalidEvents.find({'eventType':event_type, 'time_bucket':time_bucket}).limit(record_limit).skip(skip_counter)
        processing = False           
        for event in events:
            event_id = event['_id']
            log.info('Processing InvalidEvent with id: [%s]' %(event_id))
            processing = True
            rec_count += 1
            reason = event.get('reason')
            # Process the event if the reason is present in valid reasons list
            if reason not in valid_reasons:
                continue            
            resolve_status = resolve_event(db, auth_cookies, **event)
            if resolve_status:
                valid_count += 1
                tmp_event = event.copy()
                del tmp_event['_id']
                tmp_event['resolved'] = True
                # Add the event to Events collection
                insert_id = db.Events.insert(tmp_event)
                log.info("Added the record to Events collection id:%s" % insert_id)
                # mark Invalid events for deletion.
                delete_events.append(event_id)
                break

        if delete_events:
            break
        #break
        if not processing:
            break        
        skip_counter += record_limit
    log.info("Invalid events to be deleted :%s" % str(delete_events))
    if delete_events:
        print delete_events
        #delete_events = map(lambda id:ObjectId(str(id)), delete_events)
        #db.InvalidEvents.remove({'_id' : {'$in':delete_events}})

    print "Processed %s invalid events." % rec_count
    print "Valid events processed : %s" % valid_count

def resolve_event(db, auth_cookies, **kwargs):
    """
    """
    try:
        payload = kwargs.get('payload')
        event_id = kwargs.get('_id')

        resolved_event_payload = {}
        resolved_event_payload.update(payload)
        timestamp = kwargs.get('timestamp')
        resolved_event_payload['timestamp'] = timestamp
        resolved_event_payload['time_bucket'] = get_time_bucket(timestamp)
        resolved_event_payload['eventID'] = event_id
        resolved_parameters = get_resoved_parameters(db, auth_cookies, **kwargs)

        resolved_event_payload.update(resolved_parameters)

        resolved_events_collection = 'Resolved_' + kwargs.get('eventType')
        log.info('resolvedEventsCollection: [%s]' %(resolved_events_collection))
        log.info('resolvedEventPayload: [%s]' %(resolved_event_payload))
        resolved_collection = db[resolved_events_collection]
        resolved_event_id = resolved_collection.insert(resolved_event_payload)
        log.info('Done resolving event. ResolvedEventID:[%s]' %(resolved_event_id))
        return True
    except Exception as e:
        log.error('Exception in resolving event with id: [%s]. Skipping...' %(event_id))
        log.error(traceback.format_exc())
    return False

def get_resoved_parameters(db, auth_cookies, **kwargs):
    """
    """
    event_id = kwargs['_id']
    payload = kwargs.get('payload')
    parameters = payload.keys()
    parameters = db.Parameters.find({'name': {'$in': parameters}})
    resolved_parameters = {}
    try:
        for each_parameter in parameters:
            api = each_parameter.get('api')
            if not api:
                continue
            parameter_name = each_parameter.get('name')
            parameter_value = payload.get(parameter_name, '')
            if not parameter_value:
                continue
            parameter_value = str(parameter_value)
            # TODO , Handle testScoreID
            quiz_api = False
            if parameter_name == 'testScoreID':
                quiz_api = True
                entity_value = None # For testScoreID we do not store response in db.
            else:
                table_name = each_parameter.get('tableName')
                collection = db[table_name]
                entity_value = collection.find_one({'entityKey': parameter_value})

            if entity_value:
                entity_value = DotAccessibleDict(entity_value.get('entityValue'))
            #entityValue = None
            if not entity_value:
                # Prepare the API for quiz.
                if quiz_api:
                    test_score_id = payload.get('testScoreID')
                    sequence = str(payload.get('sequence'))
                    api = test_score_api.replace('@param1', test_score_id).replace('@param2', sequence)
                else:
                    api = each_parameter.get('api').replace('@param', parameter_value)

                log.info('Preparing to execute API: [%s] for parameter: [%s]' %(api, parameter_name))
                api_response = call_auth_url(api, auth_cookies)
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
                entity_value = api_dict
            log.debug(entity_value)
            for each_attribute in each_parameter.get('attributesField',[]):
                attribute_name = each_attribute.split('.')[-1]
                resolved_parameters[parameter_name + '_' + attribute_name] = entity_value[each_attribute]
    except Exception as e:
        log.error('Exception in processing event with id: [%s]. Skipping...' %(event_id))
        log.error(traceback.format_exc())
    return resolved_parameters

def call_remote_api(api, requires_auth):
    o = urlparse(api)
    api_server, api_path, api_params = o.scheme + '://' + o.netloc, o.path.lstrip('/'), parse_qs(o.query)
    for key in api_params:
        api_params[key] = api_params[key][0]
    if requires_auth:
        auth_cookies = getLoginCookie()
        log.info('auth_cookies: %s' %(auth_cookies))

        api_response = remotecall(api_path, api_server, params_dict=api_params,method="POST", custom_cookie=auth_cookies)
    else:
        api_response = remotecall(api_path, api_server, method='GET', params_dict=api_params)
    return api_response

def call_auth_url(url, auth_cookies):
    opener = urllib2.build_opener()
    opener.addheaders.append(('Cookie', auth_cookies))
    f = opener.open(url)
    data = f.read()
    response = json.loads(data)

    return response    

def get_time_bucket(timestamp):
    timeBucketFormats = ['%Y-year', '%Y-%m-month', '%Y-%W-week', '%Y-%m-%d-day', '%Y-%m-%d %H-hour']
    return [timestamp.strftime(x) for x in timeBucketFormats]

def getLoginCookie():
    from pylons import config
    if not config or not config.get('ck12_login_cookie'):
        config = h.load_config()
    user = config.get('ck12_ads_user')
    key = config.get('ck12_ads_key')
    auth_cookies = um.login(user, key)
    
    return auth_cookies

class DotAccessibleDict (object):
  def __init__ ( self, data ):
    self._data = data

  def __getitem__ ( self, name ):
    val = self._data
    for key in name.split( '.' ):
      val = val[key]
    return val

def renameKeyWithDot(aDict):
    for key in aDict.keys():
        new_key = key.replace('.', '_')
        if new_key != key:
            aDict[new_key] = aDict[key]
            del aDict[key]
            if isinstance(aDict[new_key], dict):
                renameKeyWithDot(aDict[new_key])
        elif isinstance(aDict[key], dict):
            renameKeyWithDot(aDict[key])

def get_mongo_db():
    """
    """
    config = h.load_config()
    db_url = urlparse(config.get('mongo_uri'))
    max_pool_size = int(config.get('mongo.max_pool_size'))
    replica_set = config.get('mongo.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size,
            replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url.hostname, port=db_url.port, max_pool_size=max_pool_size)
    db = conn[db_url.path[1:]]
    if db_url.username and db_url.password:
        db.authenticate(db_url.username, db_url.password)
    return db


if __name__ == "__main__":

    #parser = argparse.ArgumentParser()
    #parser.add_argument("event_type")
    #parser.add_argument("time_bucket")
    #args = parser.parse_args()
    #event_type = args.event_type
    #time_bucket = args.time_bucket
    event_type = 'FBS_TIMESPENT'
    time_bucket = '2014-year'
    valid_reasons = ['Parameter: (pageType) is mandatory']
    run(event_type, time_bucket, valid_reasons)
    #print "Please provide EventType and TimeBucket"
    
