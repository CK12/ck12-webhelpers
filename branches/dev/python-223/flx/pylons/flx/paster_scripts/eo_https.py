import urllib2
import logging

from flx.model import api
from flx.lib.unicode_util import UnicodeWriter

LOG_FILENAME = "/tmp/eo_https.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)
output_csv_path = '/tmp/eo_https_check.csv'
output_csv_details_path = '/tmp/eo_https_check_details.csv'


def run():
    pageSize = 1000
    pageNum = 1
    processed_eos = {}
    csv_headers = ['artifactID' ,'creatorID' ,'artifactTitle' ,'artifactPerma', 'artifactDetails' ,'noOfEos' ,'noOfEosHttps']
    fd = open(output_csv_path, 'w')
    csv_writer = UnicodeWriter(fd)
    csv_writer.writerow(csv_headers)

    csv_details_headers = ['artifactID' ,'creatorID' ,'artifactTitle' ,'artifactPerma', 'artifactDetails' ,'URL']
    fd_details = open(output_csv_details_path, 'w')
    csv_details_writer = UnicodeWriter(fd_details)
    csv_details_writer.writerow(csv_details_headers)

    while True:
        log.info('Processing pageNum: [%d]' %(pageNum))
        artifacts = api.getArtifacts(pageSize=pageSize, pageNum=pageNum)
        if not artifacts:
            break
        for eachArtifact in artifacts:
            artifactID = eachArtifact.id
            if eachArtifact.type.name == 'concept' or 'book' in eachArtifact.type.name:
                continue
            email = eachArtifact.creator.email.lower()
            if email != 'editor@ck12.org' and email.endswith('ck12.org'):
                continue

            permaArray = eachArtifact.getPerma().split('/')
            artifactPermas = []
            # Build the artifact perma like, 'http://www.ck12.org/' + [perma_array[3], perma_array[1], perma_array[2]].join('/')
            for index, val in enumerate(permaArray):
                if index in [1, 2]:
                    artifactPermas.append(val)
                if index == 3:
                    artifactPermas = [val] + artifactPermas
            artifactPerma = 'http://www.ck12.org/%s' % '/'.join(artifactPermas)

            artifactDetails = 'http://www.ck12.org/flxadmin/artifact/%s' %(artifactID)

            eos = []
            hasXhtml = False
            log.info('Processing artifactID: [%d]' %(eachArtifact.id))
            for eachResource in eachArtifact.revisions[0].resourceRevisions:
                if eachResource.resource.type.name == 'contents':
                    hasXhtml = True
                elif eachResource.resource.type.name in ['video', 'cover video']:
                    eos.append(eachResource.resource.uri)
            if not hasXhtml:
                log.info('artifactID: [%d] has no XHTML resources' %(eachArtifact.id))
                continue
            noOfEos = len(eos)
            noOfEosHttps = 0
            log.info('artifactID: [%d] has [%d] videos' %(eachArtifact.id, noOfEos))
            for eachEoUri in eos:
                if eachEoUri in processed_eos:
                    supportsHttps = processed_eos[eachEoUri]
                else:
                    supportsHttps = checkHttps(eachEoUri)
                    processed_eos[eachEoUri] = supportsHttps
                if supportsHttps:
                    noOfEosHttps += 1
                else:
                    row_details = [artifactID, eachArtifact.creatorID, eachArtifact.getTitle(), artifactPerma, artifactDetails, eachEoUri]
                    csv_details_writer.writerow(row_details)
                    log.info('Uri: [%s] does not support https. Writing to CSV file' %(eachEoUri))
            row = [artifactID, eachArtifact.creatorID, eachArtifact.getTitle(), artifactPerma, artifactDetails, noOfEos, noOfEosHttps]
            csv_writer.writerow(row)
        pageNum += 1
    fd.close()
    fd_details.close()


def checkHttps(uri):
    httpsUri = uri
    log.info('Checking uri: [%s] for https' %(uri))
    if uri.startswith('http') and not uri.startswith('https'):
        httpsUri = uri.replace('http', 'https')
    if uri.startswith('://'):
        httpsUri = 'https' + uri
    request = urllib2.Request(httpsUri)
    opener = urllib2.build_opener()
    request.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36')
    supportsHttps = True
    try:
        request_opener = opener.open(request, timeout=30)
        log.info('Uri [%s] works on https? [%s]' %(uri, supportsHttps))
    except Exception as ex:
        supportsHttps = False
        log.info('Uri: [%s] does not support https' %(uri))
    return supportsHttps
