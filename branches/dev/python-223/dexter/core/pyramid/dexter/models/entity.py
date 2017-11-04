#from bson.objectid import ObjectId
import logging
from datetime import datetime

from dexter.models import model
from dexter.models.validationwrapper import ValidationWrapper
#from dexter.models import page as p
from dexter.lib import helpers as h

log = logging.getLogger(__name__)

class Entity(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = ['tableName', 'entityKey', 'entityValue']

    """
        Store an Entity
    """
    @h.trace
    def store(self, **kwargs):
        self.before_insert(**kwargs)

        tableName = kwargs['tableName']
        entityKey = kwargs['entityKey']
        entityValue = kwargs['entityValue']
        collection = self.db[tableName]
        created = datetime.now()
        entityDict = {'entityKey':entityKey, 'entityValue':entityValue, 'created': created}
        id = collection.insert(entityDict)
        return id

    """
        Get an Entity
    """
    @h.trace
    def getByEntityKey(self, **kwargs):
        required_fields = ['tableName', 'entityKey']
        model.checkAttributes(required_fields, **kwargs)
        tableName = kwargs['tableName']
        entityKey = kwargs['entityKey']
        collection = self.db[tableName]
        log.info('Getting entity from collection: [%s] for entity key: [%s]' %(tableName, entityKey))
        entity = collection.find_one({'entityKey': entityKey})
        if entity:
            log.info('Found entity from collection: [%s] for entity key: [%s]' %(tableName, entityKey))
            log.debug("Entity: %s" %(entity))
        else:
            log.info('No such entity from collection: [%s] for entity key: [%s]' %(tableName, entityKey))
        return entity

    """
        Delete an Entity
    """
    @h.trace
    def delete(self, **kwargs):
        pass

    """
        Get an Entity Information from Parameter and entity key.
    """
    @h.trace
    def getByParameterAndEntityKey(self, **kwargs):
        required_fields = ['paramName', 'entityKey']
        model.checkAttributes(required_fields, **kwargs)
        paramCollName = 'Parameters'
        paramName = kwargs['paramName']
        entityKey = kwargs['entityKey']
        # Get the table name from parameter.
        collection = self.db[paramCollName]
        log.info('Getting parameter from collection: [%s] for paremeterName: [%s]' %(paramCollName, paramName))        
        param = collection.find_one({'name': paramName})
        if not param:
            log.info('No parameter exists for collection: [%s] and paremeterName: [%s]' %(paramCollName, paramName))        
            raise Exception("No such parameter exists by name: %s" % paramName)

        log.info('Found parameter from collection: [%s] for parameterName: [%s]' %(paramCollName, paramName))
        log.debug("Parameter: %s" %(param))

        # Get the entity.
        tableName = param['tableName']
        collection = self.db[tableName]
        entity = collection.find_one({'entityKey': entityKey})
        if entity:
            log.info('Found entity from collection: [%s] for entity key: [%s]' %(tableName, entityKey))
            log.debug("Entity: %s" %(entity))
        else:
            log.info('No such entity from collection: [%s] for entity key: [%s]' %(tableName, entityKey))
        return entity
