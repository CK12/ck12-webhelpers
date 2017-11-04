import codecs
from BeautifulSoup import BeautifulSoup
import logging

from flx.model import api
from flx.lib.remoteapi import RemoteAPI
from flx.lib import helpers as h
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/get_concept_images.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

taxonomy_server = 'http://gamma.ck12.org/taxonomy'
server_name = 'http://gamma.ck12.org'
remoteapi = RemoteAPI()
typeIDs = [3]
pageNum = 1
pageSize = 20
work_dir = '/home/thejaswi/concept_lessons'

def run(subject, branch):
    outputFile = open('/tmp/image_alt_tags_%s.%s.csv' %(subject, branch), 'w')
    writer = UnicodeWriter(outputFile)
    log.info('Exporting image alt tags: [%s]' %(outputFile.name))
    writer.writerow(["Artifact ID", "Artifact URL", "Image Src", "Alt"])

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
            artifact_url = server_name + '/flxadmin/artifact/%s' %(artifactID)
            artifact = api.getArtifactByID(id=artifactID)
            xhtml = artifact.getXhtml(includeChildContent=True, includeChildHeaders=True)

            soup = BeautifulSoup(xhtml)
            images = soup.findAll('img')
            for each_image in images:
                if each_image.get('class') in ['x-ck12-math', 'x-ck12-block-math']:
                    continue
                image_src = server_name + each_image.get('src')
                image_alt = each_image.get('alt')
                log.info('artifactID: [%s], image_src: [%s], image_alt: [%s]' %(artifactID, image_src, image_alt))
                writer.writerow([artifactID, artifact_url, image_src, image_alt])
        i = i + 1

    outputFile.close()
