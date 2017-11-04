from bson.objectid import ObjectId
import logging
import pymongo
from datetime import datetime
from datetime import timedelta
import traceback

from paste.deploy.converters import asbool

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models.parameter import Parameter
from dexter.models.rule import Rule
from dexter.models import page as p
from dexter.lib import helpers as h


log = logging.getLogger(__name__)

class Event(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.parameter = Parameter(db)
        self.timezone = "America/Los_Angeles"
        self.timeformat = "%Y-%m-%d %H:%M:%S %f"
        self.required_fields = ['clientID', 'eventType', 'payload']
        self.field_dependencies = {
                            'clientID': {
                                  'collection':self.db.Clients,
                                  'field':'clientID',
                             },
                            'eventType': {
                                  'collection':self.db.EventTypes,
                                  'field': 'eventType',
                             },
                          }

    """
        Record the event in Redis Queue
    """
    @h.trace
    def record(self, **kwargs):
        try:
            from dexter.views.celerytasks import events
            self.before_insert(**kwargs)
            log.info('Event Data: %s' %kwargs)
            if not (kwargs['payload'].has_key('timestamp') and  kwargs['payload']['timestamp']):
                currentTime = datetime.now()
                kwargs['payload']['timestamp'] = h.toTimestamp(currentTime, format=self.timeformat)
            else:
                currentTime = h.toDatetime(kwargs['payload']['timestamp'], format=self.timeformat)
            if kwargs.has_key('resolved') and kwargs['resolved'] == True:
                resolved = True
            else:
                resolved = False
            clientID = kwargs['clientID']
            eventType = kwargs['eventType']
            if not (clientID and eventType):
                log.info('clientID: [%s] or eventType: [%s] not specified. Discarding the event' %(clientID, eventType))
                raise Exception('Invalid clientID or eventType. Discarding the event')
            rule = Rule(self.db).getUnique(clientID=clientID, eventType=eventType)
            if rule:
                queue = rule['queue']
            else:
                queue = 'priority8'
            log.info('Rule: [%s], Queue: [%s]' %(rule, queue))

            # Add the UTC timestamp to payload
            timestamp_utc = h.convert_to_utc_from_timestamp(currentTime)
            kwargs['payload']['timestamp_utc'] = h.toTimestamp(timestamp_utc, format=self.timeformat)
            eventIDParameters = {
                                 'visitorID': kwargs['payload'].get('visitorID', ''), \
                                 'sessionID': kwargs['payload'].get('sessionID', ''), \
                                 'memberID': kwargs['payload'].get('memberID', '2'), \
                                 'timestamp_utc': kwargs['payload'].get('timestamp_utc')
                                }
            generatedEventID = h.getEventID(eventIDParameters)
            kwargs['payload']['g_event_id'] = generatedEventID
            ev = events.EventTask()
            log.info('Event Payload: %s'%kwargs['payload'])
            ev.apply_async((clientID, eventType, resolved, kwargs['payload']), queue=queue)
        except Exception as e:
            log.error('Error while recording event: %s' %(str(e)))
            log.error(traceback.format_exc())
            raise e
        return True

    @h.trace
    def validate(self, **kwargs):
        """
            Validate the event against event type
        """
        is_valid = True
        error_msg = None
        kwargs['clientID'] = int(kwargs['clientID'])
        log.info('Validating event from clientID: [%s] for eventType: [%s] with payload: [%s]' %(kwargs['clientID'], kwargs['eventType'], kwargs['payload']))
        try:
            event_type = self.db.EventTypes.find_one({'clientID': kwargs['clientID'], 'eventType': kwargs['eventType']})
            if not event_type:
                raise Exception('No matching EventType found for clientID: [%s] and eventType: [%s]. Please register the event before recording' %(kwargs['clientID'], kwargs['eventType']))
            parameter_list = [each_parameter['name'] for each_parameter in event_type.get('parameters')]
            unexpected_params = [each_parameter for each_parameter in kwargs.get('payload').keys() if not parameter_list.__contains__(each_parameter)]
            if False:
                is_valid = False
                error_msg = 'Unexpected parameters received: %s'%(','.join(unexpected_params))
            else:
                parameters_info = self.parameter.getParameters(parameter_list)
                [k.update(l) for k in event_type.get('parameters') for l in parameters_info if k['name'] == l['name']]
                event_parameters = event_type.get('parameters')
                event_payload = kwargs.get('payload')
                for each_parameter in event_parameters:
                    parameter_name = each_parameter.get('name')
                    if each_parameter.get('mandatory', False):
                        if not parameter_name in event_payload.keys():
                            is_valid = False
                            error_msg = 'Parameter: (%s) is mandatory' % (parameter_name)
                            break
                    if parameter_name in event_payload.keys():
                        if each_parameter.get('type'):
                            is_valid = self.compare_type(each_parameter.get('type'), event_payload.get(parameter_name))
                        if not is_valid:
                            error_msg = 'Type of the parameter(%s) is invalid, Expected(%s), received: (%s)'% (parameter_name, each_parameter.get('type'), type(event_payload.get(parameter_name)))
                            break

        except Exception as e:
            is_valid = False
            error_msg = 'Error while validating event: %s'% e.__str__()
            log.error(error_msg)
            log.error(traceback.format_exc())
            raise e
        return is_valid, error_msg

    """
        Store the event in DB
    """
    @h.trace
    def store(self, **kwargs):
        is_valid, error_msg = self.validate(**kwargs)
        log.info('Event Payload: %s' %(kwargs))
        log.info('Was the event payload valid? %s. Error_msg: %s' %(is_valid, error_msg))
        config = h.load_config()
        sendToKafka = str(config.get('send_to_kafka', False))
        sendToKafka = asbool(sendToKafka)
        log.info('sendToKafka: [%s]' %(sendToKafka))
        if is_valid:
            #resolver = self.getEventResolver(**kwargs)
            #log.info("In store, resolver:%s" % resolver)
            #kwargs['resolved'] = resolver
            eventType = kwargs['eventType']
            insert_kwargs = kwargs.copy()
            payload = insert_kwargs['payload']
            del insert_kwargs['payload']
            insert_kwargs.update(payload)
            id = self.db[eventType].insert(insert_kwargs)

            try:
                import json
                from kafka import SimpleProducer, KafkaClient
                if sendToKafka:
                    kafkaBrokers = config.get('kafka_brokers', '')
                    if not kafkaBrokers:
                        log.info('kafkaBroker not set. Exiting...')
                    else:
                        kafkaClient = KafkaClient(kafkaBrokers)
                        producer = SimpleProducer(kafkaClient)
                        kafkaPayload = kwargs['payload']
                        eventType = kwargs['eventType']
                        kafkaPayload['eventType'] = eventType
                        kafkaPayload['timestamp'] = h.toTimestamp(kwargs['timestamp'], format='%Y-%m-%d %H:%M:%S %f')
                        kafkaPayload['_id'] = str(id)
                        kafkaMessage = json.dumps(kafkaPayload)
                        topic = config.get('kafka_events_topic', 'gamma_ads_events')
                        log.info('Sending kafka message: [%s] to topic: [%s] via brokers: [%s]' %(kafkaMessage, topic, kafkaBrokers))
                        producer.send_messages(topic, kafkaMessage)
                        eventTypeTopic = topic + '_' + eventType.lower()
                        kafkaClient.ensure_topic_exists(eventTypeTopic)
                        producer.send_messages(eventTypeTopic, kafkaMessage)
                        log.info('Done sending kafka message: [%s] to topic: [%s] via brokers: [%s]' %(kafkaMessage, eventTypeTopic, kafkaBrokers))
            except Exception as ke:
                log.error('Error while sending events to kafka: %s' %(str(ke)))
                log.error(traceback.format_exc())

            event_data =  self.db[eventType].find_one(id)
            return event_data
        else:
            kwargs['reason'] = error_msg
            id = self.db.InvalidEvents.insert(kwargs)
            try:
                import json
                from kafka import SimpleProducer, KafkaClient
                if sendToKafka:
                    kafkaBrokers = config.get('kafka_brokers', '')
                    if not kafkaBrokers:
                        log.info('kafkaBroker not set. Exiting...')
                    else:
                        kafkaClient = KafkaClient(kafkaBrokers)
                        producer = SimpleProducer(kafkaClient)
                        kafkaPayload = kwargs.get('payload', {})
                        eventType = kwargs['eventType']
                        kafkaPayload['eventType'] = eventType
                        kafkaPayload['errorMessage'] = error_msg
                        kafkaPayload['timestamp'] = h.toTimestamp(kwargs['timestamp'], format='%Y-%m-%d %H:%M:%S %f')
                        kafkaPayload['_id'] = str(id)
                        kafkaMessage = json.dumps(kafkaPayload)
                        topic = config.get('kafka_invalid_events_topic', 'gamma_invalid_ads_events')
                        log.info('Sending kafka message: [%s] to topic: [%s] via brokers: [%s]' %(kafkaMessage, topic, kafkaBrokers))
                        producer.send_messages(topic, kafkaMessage)                    
            except Exception as ke:
                log.error('Error while sending Invalid events to kafka: %s' %(str(ke)))
                log.error(traceback.format_exc())
            return self.db.InvalidEvents.find_one(id)

    """
        Add the resolver.
    """
    @h.trace
    def getEventResolver(self, **kwargs):
        resolver = False
        event_type = self.db.EventTypes.find_one({'clientID': int(kwargs['clientID']), 'eventType': kwargs['eventType']})
        if not event_type:
            return resolver
        if event_type:
            # Get the default resolution for the event type.
            resolution = event_type.get('default_resolution', False)
            log.info("Default resolution, %s" % resolution)
            for each_parameter in event_type.get('parameters'):
                if each_parameter['name'] == 'resolver':
                    resolver = kwargs.get('resolver', resolution)
                    break
        return resolver

    """
        Mark an event as Resolved
    """
    @h.trace
    def resolve(self, **kwargs):
        _id = None
        if kwargs.has_key('_id') and kwargs['_id']:
            _id = ObjectId(str(kwargs['_id']))
            del kwargs['_id']
        elif kwargs.has_key('id') and kwargs['id']:
            _id = ObjectId(str(kwargs['id']))
            del kwargs['id']
        else:
            raise Exception('Event _id or id not specified to resolve the event')
        result = self.db.Events.update(
                            { '_id': _id },
                            { '$set': {'resolved':True} },
                            )
        return result

    """
        Mark event as Processing
    """
    @h.trace
    def process(self, **kwargs):
        if not kwargs.has_key('idList'):
            raise Exception('idList not specified to mark the events as processed')
        idList = kwargs['idList']
        if not isinstance(idList, list):
            raise Exception('idList specified is not a list')
        result = self.db.Events.update(
                            { '_id': {'$in': idList }},
                            { '$set': {'resolved':'in progress'} },
                            multi = True
                            )
        return result


    """
        Get Event
    """
    @h.trace
    def getByID(self, id):
        log.info("Getting Event with id: [%s]" %(id))
        event = self.db.Events.find_one(ObjectId(str(id)))
        self.asDict(event)
        log.info("event: %s" % event)
        return event

    def getUnique(self, **kwargs):
        event = self.db.Events.find_one(kwargs)
        return event

    def asDict(self, event):
        if event:
            return event

    """
        Get all Events
    """
    @h.trace
    def getAll(self, query=None, pageNum=0, pageSize=0, sort=[]):
        events = p.Page(self.db.Events, query, pageNum, pageSize, sort)
        return events

    """
        Get Event.
    """
    @h.trace
    def getEvent(self, **kwargs):
        log.info('kwargs :%s'% kwargs)
        if kwargs.has_key('eventID') and kwargs['eventID']:
            return self.getByID(kwargs['eventID'])    

        params = {}
        for param in ['clientID', 'eventType', 'payload']:
            if kwargs.has_key(param):
                params[param] = kwargs[param]
        log.info('params :%s'% params)
        evnts = self.db.Events.find(params).sort('timestamp',-1)
        for ev in evnts:
            return ev
        return {}

    """
        get resolved event.
    """
    @h.trace
    def getResolvedEvent(self, **kwargs):
        log.info('kwargs :%s'% kwargs)
        collname = 'Resolved_%s' % kwargs['eventType']
        eventID = kwargs['eventID']
        collection = self.db[collname]
        ev = collection.find_one({'eventID':ObjectId(eventID)})
        return ev

    """
        get assessment event.
    """
    @h.trace
    def getAssessmentEvents(self, fromTime, toTime):
        log.info('from_time, to_time :%s/%s'% (fromTime, toTime))
        # Get the assessment events for the given time
        time_dict = {'$gte': fromTime, '$lt': toTime}
        #time_dict = {'$gte': datetime.now() - timedelta(days=1)}
        results = self.db.Events.find({'eventType':'FBS_ASSESSMENT', 'resolved':'assessment',
                                      'timestamp': time_dict}).sort("timestamp", pymongo.ASCENDING)

        log.info('%s Assessment events found.'% results.count())
        events = [event for event in results]
        return events

