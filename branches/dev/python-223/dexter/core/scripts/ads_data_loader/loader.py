from datetime import datetime
import time
import logging
import ast
import logging.handlers
from generic_thread import GenericThread
import settings
import pymongo
from urllib2 import Request, build_opener
import simplejson
import traceback

# Initialise Logger
logger = logging.getLogger('__name__')
hdlr = logging.FileHandler(settings.LOG_FILE_PATH)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.INFO)


def start_loader(args):
    """
    This function will create necessary threads.
    """
    csvFile = args['file_name']
    csvFile = ast.literal_eval(csvFile)

    thread_count = settings.MAX_THREAD_COUNT

    with open(csvFile) as fd:
        ids = fd.read()
    ids = ids.strip()
    ids = ids.split(',')

    id_break_points = range(0, len(ids), len(ids)/thread_count)
    worker_threads = []
    for each in range(1, len(id_break_points)-1):
       worker_threads.append(GenericThread(loadArtifacts, ids[id_break_points[each-1]:id_break_points[each]]))
    residue = ids[id_break_points[len(id_break_points)-2]:len(ids)]
    if residue:
       worker_threads.append(GenericThread(loadArtifacts, residue))
    for each_worker in worker_threads:
       each_worker.start()
    for each_worker in worker_threads:
       each_worker.join()


def loadArtifacts(ids):
    """
    Load the artifacts.
    """
    artifactAPI = settings.ARTIFACT_API
    statusField = settings.STATUS_FIELD
    tableName = settings.MONGO_COLLECTION_NAME

    ids = ids[0]
    conn = pymongo.MongoClient(host=settings.MONGO_HOST, port=settings.MONGO_PORT, max_pool_size=20)
    db = conn[settings.MONGO_DB]
    collection = db[tableName]
    for eachID in ids:
        if not eachID:
            continue
        try:
            api = artifactAPI.replace('@param', str(eachID))
            api_response = _makeCall(api)
            renameKeyWithDot(api_response)
            apiDict = DotAccessibleDict(api_response)
            if statusField and apiDict[statusField] != 0:
                logger.info('artifactID:%s - Non-zero status code from the API. Skipping...' % eachID)
                continue
            entityDict = {'entityKey':eachID, 'entityValue': api_response}
            mongo_id = store(collection, entityDict)
            logger.info("artifactID:%s - MongoDBID:%s" %(eachID, mongo_id))
        except:
            logger.info("artifactID:%s Exception:%s" % (eachID, traceback.print_exc()))

class DotAccessibleDict (object):
  def __init__ ( self, data ):
    self._data = data

  def __getitem__ ( self, name ):
    val = self._data
    for key in name.split( '.' ):
      val = val[key]
    return val

def store(collection, kwargs):
    """
    Store data into mongodb.
    """   
    entityKey = kwargs['entityKey']
    entityValue = kwargs['entityValue']
    created = datetime.now()
    renameKeyWithDot(entityValue)
    entityDict = {'entityKey':entityKey, 'entityValue':entityValue, 'created': created}
    id = collection.insert(entityDict)
    return id

def renameKeyWithDot(aDict):
    """
    """
    for key in aDict.keys():
        new_key = key.replace('.', '_')
        if new_key != key:
            aDict[new_key] = aDict[key]
            del aDict[key]
            if isinstance(aDict[new_key], dict):
                renameKeyWithDot(aDict[new_key])
        elif isinstance(aDict[key], dict):
            renameKeyWithDot(aDict[key])

def _makeCall(url, params=None, cookie = None):
    """
    Call the URL.
    """
    print url
    if cookie:
        req = Request(url, params, {'Cookie': cookie})
    else:
        req = Request(url, params)
    opener = build_opener()
    response = opener.open( req, timeout=100)
    data = response.read()
    return simplejson.loads( data )
