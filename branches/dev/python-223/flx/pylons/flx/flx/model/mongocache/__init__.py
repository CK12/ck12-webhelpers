import pymongo
import logging
import base64
try:
    import cPickle as pickle
except ImportError:
    import pickle

from pylons import config

log = logging.getLogger(__name__)


def _getConfig():
    global config
    if not config or not config.has_key('beaker.cache.forever.url'):
        log.info("Initializing config ...")
        from flx.lib.helpers import load_pylons_config
        config = load_pylons_config()
    return config

def getDB(config=None):
    from flx.lib.helpers import getDBAndCollectionFromUrl
    if not config:
        config = _getConfig()
    cache_url = config['beaker.cache.forever.url']
    db_url, dbname, collection = getDBAndCollectionFromUrl(cache_url)
    log.debug("db_url: %s %s %s" % (db_url, dbname, collection) )
    max_pool_size = int(config.get('beaker.cache.forever.max_pool_size', 3))
    replica_set = config.get('beaker.cache.forever.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
        replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

    log.debug("db_url: conn[%s]" % conn)
    db = conn[dbname]
    return db

def depickle(value):
    from flx.lib.helpers import safe_encode, safe_decode
    try:
        return safe_decode(pickle.loads(base64.standard_b64decode(safe_encode(value))))
    except Exception, e:
        log.exception("Failed to unpickle value.", e)
        raise e

def dopickle(value):
    from flx.lib.helpers import safe_encode, safe_decode
    try:
        return safe_decode(base64.standard_b64encode(pickle.dumps(safe_encode(value))))
    except Exception, e:
        log.exception("Failed to pickle value.", e)
        raise e

def getCacheAge(region):
    config = _getConfig()
    cacheAge = long(config['beaker.cache.' + region + '.expire'])
    return cacheAge
