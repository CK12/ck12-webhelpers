import logging
from urllib import quote

from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from flx.lib import helpers as h
from flx.lib.unicode_util import UnicodeWriter


LOG_FILENAME = "/tmp/detect_duplicate_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

api_server_url = 'http://gamma.ck12.org'
api_end_point = 'flx/get/info/'
branch_dict = {'bio': 'biology',
                'phy': 'physics',
                'che': 'chemistry',
                'psc': 'physical-science',
                'lsc': 'life-science',
                'esc': 'earth-science',
                'alg': 'algebra',
                'geo': 'geometry',
                'ari': 'arithmetic',
                'mea': 'measurement',
                'prb': 'probability',
                'sta': 'Statistics',
                }

def get_content_info(artifactID):
    global api_end_point
    global api_server_url

    remoteAPI = RemoteAPI()
    rest_api = api_end_point + str(artifactID)
    response = remoteAPI._makeCall(api_server_url, rest_api, 30)
    artifact_title  = response['response']['artifact']['title']
    artifact_perma = response['response']['artifact']['perma']
    artifact_perma = quote(h.safe_encode(artifact_perma))
    domain_handle = response['response']['artifact']['domain']['handle']
    domain = response['response']['artifact']['domain']['branch'].lower()
    branch_handle = branch_dict[domain]
    url = api_server_url + '/' + branch_handle + '/' + domain_handle + artifact_perma
    return url, artifact_title, branch_handle


def run(creatorID=3, artifactTypeName='simulation'):
    pageSize = 256
    duplicates = {}
    fd = open("/tmp/simulations.csv", "wb")
    writer = UnicodeWriter(fd)
    headers = [ 'Title', 'Branch', 'URL' ]
    writer.writerow(headers)

    artifactTypes = api.getArtifactTypesDict()
    for artifactType in artifactTypes.keys():
        if artifactTypeName and artifactTypeName != artifactType:
            log.info("Skipping %s. Not %s" % (artifactType, artifactTypeName))
            continue
        log.info('Processing artifacts of type: [%s]' %(artifactType))
        duplicates[artifactType] = []
        pageNum = 1
        while True:
            log.info('Fetching %d artifacts of type: [%s], pageNum: %d' % (pageSize, artifactType, pageNum))
            artifacts = api.getArtifacts(typeName=artifactType, ownerID=creatorID, pageNum=pageNum, pageSize=pageSize)
            if not artifacts:
                break
            for a in artifacts:
                log.info('Processing simulation with artifactID: [%s]' %(a.id))
                url, artifact_title, branch_handle =  get_content_info(a.id)
                row = [artifact_title, branch_handle, url]
                writer.writerow(row)
            pageNum += 1
    fd.close()
    log.info('Wrote /tmp/simulations.csv')
