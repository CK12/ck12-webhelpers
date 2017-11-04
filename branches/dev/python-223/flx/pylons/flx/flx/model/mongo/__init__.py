import pymongo
import logging

log = logging.getLogger(__name__)


def getDB(config):
    from flx.lib.helpers import getDBAndCollectionFromUrl
    db_url, dbname, collection = getDBAndCollectionFromUrl(config['mongo_uri'])
    log.debug("db_url: %s %s %s" % (db_url, dbname, collection) )
    max_pool_size = int(config.get('mongo.max_pool_size', 3))
    replica_set = config.get('mongo.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
        replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

    db = conn[dbname]
    return db
