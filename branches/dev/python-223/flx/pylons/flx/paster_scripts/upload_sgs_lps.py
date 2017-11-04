from flx.controllers.resourceHelper import ResourceHelper
from flx.model import api
from flx.model import meta
from flx.lib.unicode_util import UnicodeDictReader

import logging
import os
import urllib
from datetime import datetime

log = None

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/upload_resources.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        log.addHandler(handler)
        return log
    except:
        pass

rh = ResourceHelper()

def run(csvDir, type='studyguide'):
    log = initLog()
    uploadFailures = 0
    associateFailures = 0
    uploads = 0
    associations = 0

    if not os.path.exists(csvDir) or not os.path.isdir(csvDir):
        raise Exception("Cannot find directory: %s" % csvDir)

    csvFiles = []
    for file in os.listdir(csvDir):
        if file.endswith('.csv'):
            csvFiles.append(os.path.join(csvDir, file))
    log.info("Loading csvFiles: %s" % csvFiles)
    if not csvFiles:
        log.info("No files to process")
        return
    log.info("Processing files of type: %s" % type)
    for csvFile in csvFiles:
        if not os.path.exists(csvFile):
            log.error("Cannot process file: %s. It was not found!" % csvFile)
            continue
        meta.Session()
        reader = UnicodeDictReader(open(csvFile, 'rb'))
        rowCnt = 0
        for row in reader:
            rowCnt += 1
            try:
                pdf = row.get('Download Location')
                if not pdf:
                    raise Exception("No PDF file specified.")
                pdf = pdf.strip()
                log.info("Processing %d: %s" % (rowCnt, pdf))
                pdfFile = pdf
                if pdf.startswith('http://'):
                    pdfFile = os.path.join('/tmp', os.path.basename(pdf))
                    urllib.urlretrieve(pdf, pdfFile)
                if os.path.exists(pdfFile):
                    log.info("Uploading file: %s" % pdfFile)
                    rr = create_resource(pdfFile, 3, type, row.get('DESCRIPTION'), license='CC by NCSA')
                    if not rr:
                        uploadFailures += 1
                        raise Exception('Error creating resource: [%d] %s' % (rowCnt, pdfFile))
                    uploads += 1
                    eids = [ x.strip() for x in row.get('EIDs', '').split(',') ]
                    for eid in eids:
                        if eid:
                            lsn = api.getArtifactByEncodedID(encodedID=eid)
                            if not lsn:
                                associateFailures += 1
                                log.error("ERROR: [%d] No such artifact by encodedID: %s" % (rowCnt, eid))
                                continue
                            try:
                                associate_resource(3, rr.resource, lsn)
                                associations += 1
                                if lsn.type.name == 'lesson':
                                    children = api.getArtifactChildren(artifactID=lsn.id)
                                    for child in children:
                                        childArtifact = api.getArtifactByID(id=child['childID'])
                                        if childArtifact:
                                            associate_resource(3, rr.resource, childArtifact)
                                            associations += 1
                                        else:
                                            log.error("ERROR: [%d] No such child artifact %s for %s" % (rowCnt, child['childID'], lsn.id))
                            except Exception as ee:
                                associateFailures += 1
                                log.error("ERROR: [%d] Error associating resource to %d" % (rowCnt, lsn.id), exc_info=ee)
            except Exception as e:
                log.error("ERROR: [%d] Error uploading %s: %s" % (rowCnt, type, str(e)), exc_info=e)

        if rowCnt == 1:
            #break
            pass
    log.info("Done. Processed %d rows" % rowCnt)
    log.info("Rows: %d, uploads: %d, associations: %d, uploadFailures: %d, associateFailures: %d" % (rowCnt, uploads, associations, uploadFailures, associateFailures))

def associate_resource(user_id, resource, artifact):
    """
        Associate resource with an artifact
    """
    member = api.getMemberByID(id=int(user_id))

    if resource and artifact and member:
        resourceID, resourceRevisionID = rh.createResourceArtifactAssociation(resource, artifact, member)
        log.info("Associated resource: %s with artifact: %s (resource revision: %s)" % (resourceID, artifact.id, resourceRevisionID))
    else:
        raise Exception('Invalid arguments: resource: %s artifact: %s member: %s' % (resource.id, artifact.id, user_id))

def create_resource(resourcePath, user_id, resourceType, desc, license=None):
    resourceDict = {}
    path, name = os.path.split(resourcePath)
    resourceDict['uri'] = open(resourcePath, "rb")
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['isAttachment'] = True
    resourceDict['isPublic'] = True
    resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceType)
    resourceDict['name'] = name
    resourceDict['description'] = desc
    language = api.getLanguageByName(name='English')
    resourceDict['languageID'] = language.id
    resourceDict['ownerID'] = user_id   
    resourceDict['creationTime'] = datetime.now()
    resourceDict['authors'] = None
    resourceDict['license'] = license
    
    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    if os.path.exists(resourcePath):
        os.remove(resourcePath)
    return resourceRevision

