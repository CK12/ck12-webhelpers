import logging
import logging.handlers
from urlparse import urlparse, parse_qs

import pymongo

from dexter.lib.remoteapi import RemoteAPI as remotecall
from dexter.lib.helpers import DotAccessibleDict, renameKeyWithDot
from dexter.models import entity

LOG_FILENAME = "/tmp/generate_browse_term_info.log"
log = logging.getLogger('generate_browse_term_info')
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
log.addHandler(handler)

browseTermAPI = 'http://www.ck12.org/flx/get/info/browseTerm/@param'
statusField = 'responseHeader.status'
tableName = 'context_eid'
conn = pymongo.MongoClient(host='localhost', port=27017, max_pool_size=20)
db = conn['dexter']

csvFile = '/tmp/eid.csv'
with open(csvFile) as fd:
    eids = fd.read()
eids = eids.strip()
#print eids
#print eids.split(',')
eids = eids.split(',')

log.info(eids)
print eids
for eachEID in eids:
    if not eachEID:
        continue
    entityValue = entity.Entity(db, dc=True).getByEntityKey(tableName = tableName, entityKey = eachEID)
    if entityValue:
        continue
    api = browseTermAPI.replace('@param', eachEID)
    log.info('Preparing to execute API: [%s] for parameter: [%s]' %(api, eachEID))
    o = urlparse(api)
    api_server, api_path, api_params = o.scheme + '://' + o.netloc, o.path.lstrip('/'), parse_qs(o.query)
    for key in api_params:
        api_params['key'] = api_params['key'][0]
    api_response = remotecall.makeRemoteCall(api_path, api_server, method='GET', params_dict=api_params)
    renameKeyWithDot(api_response)
    log.info(api_response)
    apiDict = DotAccessibleDict(api_response)
    if statusField and apiDict[statusField] != 0:
        log.error('Non-zero status code from the API. Skipping...')
        continue

    entity.Entity(db, dc=True).store(tableName = tableName, entityKey = eachEID, entityValue = api_response)



