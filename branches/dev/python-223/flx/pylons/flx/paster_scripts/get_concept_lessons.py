import codecs
import logging

from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from flx.lib import helpers as h

LOG_FILENAME = "/tmp/get_concept_lessons.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

taxonomy_server = 'http://gamma.ck12.org/taxonomy'
remoteapi = RemoteAPI()
typeIDs = [3]
pageNum = 1
pageSize = 20
work_dir = '/home/thejaswi/concept_lessons'

def run(subject, branch):
    taxonomy_api = '/get/info/concepts/%s/%s' %(subject.lower(), branch.lower())
    data = remoteapi._makeCall(taxonomy_server, taxonomy_api, 500, params_dict={'pageSize':1000}, method='GET')
    concept_nodes = data['response']['conceptNodes']
    total = len(concept_nodes)
    i = 2
    for each_concept_node in concept_nodes:
        encodedID = each_concept_node['encodedID']
        print 'Processing encodedID: [%s] - [%s/%s]' %(encodedID, i, total)
        log.info('Processing encodedID: [%s] - [%s/%s]' %(encodedID, i, total))
        browse_term = api.getBrowseTermByEncodedID(encodedID=encodedID)
        if not browse_term:
            log.info('\tSkipping encodedID: [%s]' %(encodedID))
            continue
        domainIDs = [browse_term.id]
        artifacts = api.getRelatedArtifactsForDomains(domainIDs, typeIDs=typeIDs, ownedBy='ck12', pageNum=pageNum, pageSize=pageSize)
        if not artifacts:
            log.info('\tNo lessons for encodedID: [%s]' %(encodedID))
            continue
        for each_artifact in artifacts:
            artifactID = each_artifact.id
            artifact = api.getArtifactByID(id=artifactID)
            xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True)
            text = h.xhtml_to_text(xhtml)
            filepath = work_dir + '/' + '%s_%s.txt' %(each_artifact.id, encodedID)
            log.info('\tStorting the content for artifactID: [%s] [%s] in [%s]' %(filepath, artifact.getTitle(), filepath))
            with codecs.open(filepath, 'w', encoding='utf-8') as fd:
                fd.write(text)
        i = i + 1

