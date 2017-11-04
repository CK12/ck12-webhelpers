from bson.objectid import ObjectId
import logging
from datetime import datetime

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class Rule(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['clientID', 'queue']
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
        Register a Rule
    """
    @h.trace
    def register(self, **kwargs):
        self.before_insert(**kwargs)
        queue = kwargs.pop('queue')
        existing = self.getUnique(**kwargs)
        if existing:
            raise Exception('Rule with the given parameters already exists: %s' % kwargs)

        kwargs['queue'] = queue
        kwargs['created'] = datetime.now()
        kwargs['updated'] = datetime.now()
        id = self.db.Rules.insert(kwargs)
        return self.db.Rules.find_one(id)

    """
        Update a Rule
    """
    @h.trace
    def update(self, **kwargs):
        kwargs['updated'] = datetime.now()
        _id = None
        if kwargs.has_key('_id') and kwargs['_id']:
            _id = ObjectId(str(kwargs['_id']))
            del kwargs['_id']
        elif kwargs.has_key('id') and kwargs['id']:
            _id = ObjectId(str(kwargs['id']))
            del kwargs['id']
        else:
            raise Exception('Rule _id or id not specified to update')

        if kwargs.has_key('name') and kwargs['name']:
            existing = self.getUnique(name = kwargs['name'])
            if existing:
                raise Exception('Rule with given name already exists: %s' % kwargs['name'])
        result = self.db.Rules.update(
                            { '_id': _id },
                            { '$set': kwargs },
                            )
        return result


    """
        Unregister a Rule
    """
    @h.trace
    def unregister(self, **kwargs):
        if not kwargs:
            raise Exception('Please specify the parameters to match the rules to unregister')
        log.info('Deleting rule with parameters: [%s]' %(kwargs))
        _id = None
        if kwargs.has_key('_id') and kwargs['_id']:
            _id = ObjectId(str(kwargs['_id']))
        elif kwargs.has_key('id') and kwargs['id']:
            _id = ObjectId(str(kwargs['id']))
        if _id:
            result = self.db.Rules.remove({'_id':_id})
        else:
            result = self.db.Rules.remove(kwargs, safe=True)
        return result

    """
        Get Rule
    """
    @h.trace
    def getByID(self, id):
        log.info("Getting Rule with id: [%s]" %(id))
        client = self.db.Rules.find_one(ObjectId(str(id)))
        self.asDict(client)
        log.info("Client: %s" % client)
        return client

    def getUnique(self, **kwargs):
        rule = self.db.Rules.find_one(kwargs)
        return rule

    def asDict(self, rule):
        if rule:
            return rule

    """
        Get all Rules
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0):
        rules = p.Page(self.db.Rules, None, pageNum, pageSize)
        return rules
