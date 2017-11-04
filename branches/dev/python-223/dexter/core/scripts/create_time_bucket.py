import logging
import logging.handlers

import pymongo

from dexter.models import page as p

LOG_FILENAME = "/tmp/create_time_bucket.log"
log = logging.getLogger('create_time_bucket.log')
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
log.addHandler(handler)

conn = pymongo.MongoClient(host='localhost', port=27017, max_pool_size=20)
db = conn['dexter']

def getAll(db, query=None, pageNum=0, pageSize=0, sort=[]):
    events = p.Page(db.Resolved_FBS_MODALITY, query, pageNum, pageSize, sort)
    return events

pageNum = 1
pageSize = 5000
timeBucketFormats = ['%Y-year', '%Y-%m-month', '%Y-%W-week', '%Y-%m-%d-day', '%Y-%m-%d %H-hour']
while True:
    resolvedEvents = getAll(db, query= None, pageNum=pageNum, pageSize=pageSize)
    if not resolvedEvents:
        break
    for eachResolvedEvent in resolvedEvents:
        resolvedEventID = eachResolvedEvent.get('_id')
        timestamp = eachResolvedEvent.get('timestamp')
        time_bucket = [timestamp.strftime(x) for x in timeBucketFormats]
        db.Resolved_FBS_MODALITY.update({'_id': resolvedEventID}, {'$set':{'time_bucket':time_bucket}}, upsert=True)
        log.info('Processed ResolvedEvent with id: [%s]' %(resolvedEventID))
    pageNum = pageNum + 1
    log.info(pageNum)
