import pymongo
import logging
from auth.lib.helpers import getDBAndCollectionFromUrl

from pylons import config

log = logging.getLogger(__name__)

def _getConfig():
    global config
    if not config or not config.has_key('beaker.session.url'):
        log.info("Initializing config ...")
        from auth.lib.helpers import load_pylons_config
        config = load_pylons_config()
    return config

def getDB(config=None):
    if not config:
        config = _getConfig()
    if config.get('beaker.session.type') != 'mongodb':
        return None
    session_url = config['beaker.session.url']
    db_url, dbname, _collection = getDBAndCollectionFromUrl(session_url)
    log.debug("db_url: %s %s %s" % (db_url, dbname, _collection) )
    max_pool_size = int(config['beaker.session.max_pool_size'])
    replica_set = config.get('beaker.session.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
        replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

    log.debug("db_url: conn[%s]" % conn)
    db = conn[dbname]
    return db

class MongoSession():

    def __init__(self, db=None): 
        if not db:
            db = getDB()
        self.db = db
        if not self.db:
            raise Exception('Cannot initialize!')
        session_url = config['beaker.session.url']
        db_url, dbname, collection = getDBAndCollectionFromUrl(session_url)
        if not collection:
            collection = "FlxSessions"
        self.collection = getattr(self.db, collection)

    def clearSessionsForUser(self, userID, preserveList=[]):
        query = { 
                'userID': str(userID),
                '_id.key': "session"
                }
        if preserveList:
            query["_id.namespace"] = { '$nin': preserveList }
        log.debug("Query: %s" % str(query))
        ret = self.collection.remove(query)
        log.info("Return: %s" % str(ret))

