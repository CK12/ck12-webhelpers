import logging
from datetime import datetime

from . import getCollection, getDB, getKeyName, isEncryptionEnabled

log = logging.getLogger(__name__)

class Key():

    def __init__(self, db=None): 
        self.isEncryptionEnabled = isEncryptionEnabled()
        if not self.isEncryptionEnabled:
            return
        if not db:
            db = getDB()
        self.db = db
        self.collection = getCollection()
        self.key = getKeyName()

    def getKey(self):
        query = {
            'key': self.key
        }
        value = self._getValue(query)
        if value:
            return value
        return '\x0b\x9a.\x84\x0b\xdbFx\xb1\xf7*\xf8\x05\xf3Z\xb7'

    def _getValue(self, query):
        log.debug('_getValue: query%s' % query)
        collection = getattr(self.db, self.collection)
        result = collection.find_one(query)
        if not result:
            return None

        return result['value']

    def putKey(self, value):
        collection = getattr(self.db, self.collection)
        updDict = {
            'key': self.key,
            'value': value,
            'updated': datetime.now()
        }
        collection.update({'key': self.key}, updDict, upsert=True)

