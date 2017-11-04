from bson.objectid import ObjectId
import logging
from datetime import datetime

from dexter.models.validationwrapper import ValidationWrapper
from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class Parameter(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc

        self.required_fields = ['name', 'type']
        self.required_field_structure = {'name': 'str or unicode', 'type': 'str or unicode or NoneType'}

    """
        Register a parameter
    """
    @h.trace
    def register(self, **kwargs):
        self.before_insert(**kwargs)

        existing = self.getUnique(name = kwargs['name'])
        if existing:
            raise Exception('Parameter with given name already exists: %s' % kwargs['name'])
        if not (kwargs.has_key('tableName') and kwargs['tableName']):
            kwargs['tableName'] = kwargs['name']
        kwargs['created'] = datetime.now()
        kwargs['updated'] = datetime.now()
        id = self.db.Parameters.insert(kwargs)
        return self.db.Parameters.find_one(id)

    """
        Update a Parameter
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
        elif kwargs.has_key('parameter_id') and kwargs['parameter_id']:
            _id = ObjectId(str(kwargs['parameter_id']))
            del kwargs['parameter_id']
        else:
            raise Exception('Parameter _id or id or parameter_id not specified to update')

        if kwargs.has_key('name') and kwargs['name']:
            existing = self.getUnique(name = kwargs['name'])
            if existing:
                raise Exception('Parameter with given name already exists: %s' % kwargs['name'])
        result = self.db.Parameters.update(
                            { '_id': _id },
                            { '$set': kwargs },
                            )
        return result

    """
        Unregister the parameter
    """
    @h.trace
    def unregister(self, **kwargs):
        log.info('Deleting parameter with parameters: [%s]' %(kwargs))
        _id = None
        if kwargs.has_key('_id') and kwargs['_id']:
            _id = ObjectId(str(kwargs['_id']))
        elif kwargs.has_key('id') and kwargs['id']:
            _id = ObjectId(str(kwargs['id']))
        elif kwargs.has_key('parameter_id') and kwargs['parameter_id']:
            _id = ObjectId(str(kwargs['parameter_id']))
        if _id:
            result = self.db.Parameters.remove({'_id':_id})
        else:
            raise Exception('Parameter _id or id or parameter_id not specified to unregister')
        return result

    """
        Get Parameter
    """
    @h.trace
    def getByID(self, id):
        log.info("Getting parameter for id: %s" % id)
        parameter = self.db.Parameters.find_one(ObjectId(str(id)))
        self.asDict(parameter)
        log.info("Parameter: %s" % parameter)
        return parameter

    def getUnique(self, **kwargs):
        parameter = self.db.Parameters.find_one(kwargs)
        return parameter

    def getParameters(self, parameter_list):
        '''
        Get multiple parameters by passing parameter name list
        '''
        cursor = self.db.Parameters.find({'name': {'$in': parameter_list}})
        parameters = [self.asDict(x) for x in cursor]
        return parameters

    def asDict(self, parameter):
        if parameter:
            return parameter

    """
        Get all Parameters
    """
    @h.trace
    def getAll(self, pageNum=0, pageSize=0):
        parameters = p.Page(self.db.Parameters, None, pageNum, pageSize)
        return parameters
