import pymongo
import logging
from pylons import config
import os

if os.path.join('flx', 'flx') in os.path.abspath(__file__):
    from flx.lib.helpers import getDBAndCollectionFromUrl
else:
    from auth.lib.helpers import getDBAndCollectionFromUrl

log = logging.getLogger(__name__)

_collection = None

def _getConfig():
    global config
    if not config or not config.has_key('security.db.url'):
        try:
            from flx.lib.helpers import load_pylons_config
        except:
            from auth.lib.helpers import load_pylons_config
        config = load_pylons_config()
    return config

def getCollection(config=None):
    global _collection
    if not _collection:
        if not config:
            config = _getConfig()
        key_url = config['security.db.url']
        if key_url:
            db_url, dbname, _collection = getDBAndCollectionFromUrl(key_url)
    return _collection

def isEncryptionEnabled(config=None):
    if not config:
        config = _getConfig()
    return str(config.get('security.db.enc_enabled')).lower() != 'false'

def getDB(config=None):
    global _collection
    if not config:
        config = _getConfig()
    use_enc = isEncryptionEnabled(config)
    if not use_enc:
        return None
    key_url = config['security.db.url']
    db_url, dbname, _collection = getDBAndCollectionFromUrl(key_url)
    log.debug("db_url: %s %s %s" % (db_url, dbname, _collection))
    max_pool_size = int(config.get('security.db.max_pool_size', 3))
    replica_set = config.get('security.db.replica_set')
    if replica_set:
        conn = pymongo.MongoReplicaSetClient(hosts_or_uri=db_url, max_pool_size=max_pool_size,
        replicaSet=replica_set, read_preference=pymongo.read_preferences.ReadPreference.PRIMARY_PREFERRED)
        log.debug("Using Replica Set: %s" % replica_set)
    else:
        conn = pymongo.MongoClient(host=db_url, max_pool_size=max_pool_size)

    log.debug("db_url: conn[%s]" % conn)
    db = conn[dbname]
    return db

def getKeyName(config=None):
    if not config:
        config = _getConfig()
    return config.get('security.key.name')
