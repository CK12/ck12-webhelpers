import pymongo
import logging

from pylons import config
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.lib.helpers import getDBAndCollectionFromUrl

log = logging.getLogger(__name__)

def _getConfig():
    global config
    if not config or not config.has_key('beaker.session.url'):
        log.info("Initializing config ...")
        from flx.lib.helpers import load_pylons_config
        config = load_pylons_config()
    return config

def getDB(config=None):
    if not config:
        config = _getConfig()
    if config.get('beaker.session.type') != 'mongodb':
        log.warn("Not using mongodb backend for sessions!")
        return None
    session_url = config['beaker.session.url']
    db_url, dbname, collection = getDBAndCollectionFromUrl(session_url)
    log.debug("db_url: %s %s %s" % (db_url, dbname, collection) )
    max_pool_size = int(config.get('beaker.session.max_pool_size', 3))
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

class MongoSession(ValidationWrapper):

    def __init__(self, db=None, collection='FlxSessions'): 
        if not db:
            db = getDB()
        if not db:
            raise Exception("Cannot initialize - no session db found.")
        self.db = db
        session_url = config['beaker.session.url']
        if session_url:
            collection = session_url.rsplit('.', 1)[1]
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
        ret = self.collection.remove(query)
        log.info("Return: %s" % str(ret))

