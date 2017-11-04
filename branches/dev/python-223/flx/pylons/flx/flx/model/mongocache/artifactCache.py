import logging
import bson
from datetime import datetime
import time

from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model.mongocache import depickle, dopickle, getCacheAge, getDB

log = logging.getLogger(__name__)

class ArtifactCache(ValidationWrapper):

    def __init__(self, db=None): 
        if not db:
            db = getDB()
        self.db = db

    def getArtifact(self, id, revID=0):
        fields = None
        log.debug('get: id[%s]' % id)
        log.debug('get: revID[%s]' % revID)
        query = {
            '_id.key': 'c-a-id %s %s' % (id, revID)
        }
        value = self._getValue(query, fields)
        if value:
            return value
        return None

    def _getValue(self, query, fields, collection='FlxForever'):
        log.debug('_getValue: query%s' % query)
        ret = None
        collection = getattr(self.db, collection)
        result = collection.find_one(query)
        if not result:
            return None

        data = result.get('data', None)
        log.debug("Data: %s", data)
        if not data:
            return None

        value = depickle(data['value']) if data.get('pickled') else data['value']
        ret = { 'key': result['_id']['key'], 'namespace': result['_id']['namespace'], 'value': value }
        log.debug("[key: %s] Value: %s" % (query, value))
        return ret

    def putArtifact(self, id, revID, namespace, value, isLatest=True):
        if not revID:
            revID = 0
        doc = self._putValue(id, revID, namespace, value)
        if isLatest and revID:
            self._putValue(id, 0, namespace, revID)
        return { 'key': doc['_id']['key'], 'namespace': doc['_id']['namespace'], 'value': doc['data']['value'] }

    def _putValue(self, id, revID, namespace, value, collection='FlxForever'):
        _id = {}
        doc = {}

        data = {
            'stored': time.time(),
            'expires': getCacheAge('forever'),
            'value': value,
            'pickled': False
        }
        try:
            bson.encode(data)
        except:
            log.debug("Value is not bson serializable, pickling inner value.")
            data['value'] = dopickle(data['value'])
            data['pickled'] = True

        key = 'c-a-id %s %s' % (id, revID)
        _id = {
            'namespace': namespace,
            'key': key
        }
        collection = getattr(self.db, collection)
        result = collection.find_one({'_id': _id}, fields={'created': True})

        doc['data'] = data
        doc['_id'] = _id
        doc['created'] = result.get('created', datetime.now()) if result else datetime.now()

        log.debug("Upserting Doc '%s' to _id '%s'" % (doc, _id))
        collection.update({"_id": _id}, doc, upsert=True)
        return doc

    def removeArtifact(self, id, revID, namespace):
        if not revID:
            revID = 0
        self._delete(id, revID, namespace)
        if revID:
            self._delete(id, 0, namespace)

    def _delete(self, id, revID, namespace, collection='FlxForever'):
        if not revID:
            revID = 0
        _id = {
            'namespace': namespace,
            'key': 'c-a-id %s %s' % (id, revID)
        }
        collection = getattr(self.db, collection)
        collection.remove({'_id': _id})
        log.debug("Removed doc with id: %s" % str(_id))

    #method to remove the whole artifact from the cache, Removes all revisions
    def removeCompleteArtifact(self, id, namespace):
        return self._deleteCompletely(id, namespace)

    def _deleteCompletely(self, id,  namespace, collection='FlxForever'):
        import re
        whitespace = ' '
        keyPattern = '^c-a-id %s' %(id)+whitespace
        keyRegex = re.compile(keyPattern)

        collection = getattr(self.db, collection)
        result = collection.remove({'_id.namespace': namespace, '_id.key':keyRegex})
        log.debug("Removed docs matching id: %s" % str(id))
        return result 


