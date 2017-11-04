from bson.objectid import ObjectId
import logging

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models.parameter import Parameter
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class EventType(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.parameter = Parameter(db)
        self.required_fields = ['clientID', 'eventType', 'parameters']
        self.required_fields_structure = {
                            'clientID':'long or int',
                            'eventType':'str or unicode',
                            'parameters':[
                                {'name':'str or unicode',
                                 'mandatory': bool,
                                }
                            ]}

        self.field_dependencies = {
                            'clientID': {
                                  'collection':self.db.Clients,
                                  'field':'clientID',
                             }
                          }

    """
        Register an event
    """
    @h.trace
    def register(self, **kwargs):
        self.before_insert(**kwargs)
        existing = self.getUnique(eventType = kwargs['eventType'], clientID= kwargs['clientID'])
        if existing:
            raise Exception('Event type already registered: %s' % kwargs['eventType'])
        if not kwargs.get('parameters', None):
            raise Exception('parameters is mandatory')
        for each_parameter in kwargs['parameters']:
            existing = self.parameter.getUnique(name = each_parameter['name'])
            if not existing:
                raise Exception('Please register parameter(%s)'%each_parameter['name'])
        id = self.db.EventTypes.insert(kwargs)
        return self.db.EventTypes.find_one(id)

    @h.trace
    def unregister(self, **kwargs):
        self.required_fields = ['clientID', 'eventType']
        self.required_fields_structure = {
                            'clientID':'long or int',
                            'eventType':'str or unicode'
                           }
        self.before_delete(**kwargs)
        existing = self.getUnique(eventType = kwargs['eventType'], clientID= kwargs['clientID'])
        if not existing:
            raise Exception('Event type not registered: %s' % kwargs['eventType'])
        res = self.db.EventTypes.remove({'$and':[{'eventType':kwargs['eventType'],'clientID':kwargs['clientID']}]})
        return res

    """
        Get Event
    """
    @h.trace
    def get(self, id):
        log.info("Getting event type for id: %s" % id)
        event_type = self.db.EventTypes.find_one(ObjectId(str(id)))
        self.asDict(event_type)
        log.info("Event type: %s" % event_type)
        return event_type

    def getEventTypesByClientID(self, clientID, pageNum=0, pageSize=0):
        event_types = p.Page(self.db.EventTypes,{'clientID':clientID}, pageNum, pageSize)
        return event_types

    def getUnique(self, eventType, clientID):
        event_type = self.db.EventTypes.find_one({'$and':[{'eventType':eventType,'clientID':clientID}]})
        return event_type

    def asDict(self, event_type):
        if event_type:
            return event_type

    """
        Get all Clients
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0, sort=[]):
        event_types = p.Page(self.db.EventTypes,None, pageNum, pageSize, sort)
        return event_types
