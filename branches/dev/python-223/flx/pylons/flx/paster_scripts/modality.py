from pylons.i18n.translation import _ 
from flx.controllers.resourceHelper import ResourceHelper
from flx.model import api, model
from flx.model import meta
from flx.lib.unicode_util import UnicodeDictReader
import flx.controllers.eohelper as eohelper
from flx.lib.helpers import reindexArtifacts

import logging
import os
import urllib
from datetime import datetime

log = None

ARTIFACT_TYPES_MAP = {
        'web': 'web',
        'enrichment': 'video',
        'lecture': 'video',
        'flashcard': 'web',
        'studyguide': 'studyguide',
        'preread': 'reading',
        'prereadans': 'reading',
        'postread': 'reading',
        'postreadans': 'reading',
        'prepostread': 'reading',
        'prepostreadans': 'reading',
        'whileread': 'reading',
        'whilereadans': 'reading',
        'conceptmap': 'interactive',
        'quiz': 'quiz',
        'quizans': 'quiz',
        'quizdemo': 'quiz',
        'simulation': 'interactive',
        'activity': 'activity',
        'activityans': 'activity',
        'lessonplan': 'lessonplan',
        'lessonplanx': 'lessonplan',
        'lessonplanans': 'lessonplan',
        'lessonplanxans': 'lessonplan',
        'lab': 'lab',
        'labans': 'lab',
        'worksheet': 'worksheet',
        'worksheetans': 'worksheet',
        'presentation': 'presentation',
        'interactive': 'interactive',
        'image': 'image',
        'rubric': 'rubric',
        'handout': 'handout',
        'audio': 'audio',
        'cthink': 'cthink',

        ## Catch-all
        'attachment': 'attachment',
    }

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/upload_modalities.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
        handler.setFormatter(formatter)
        log.addHandler(handler)
        return log
    except:
        pass

rh = ResourceHelper()

def run(csvDir, deleteAll=False):
    log = initLog()
    uploadFailures = 0
    associateFailures = 0
    uploads = 0
    associations = 0
    reindexList = {}
    newResources = 0
    updatedResources = 0
    deletedResources = 0

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
    for csvFile in csvFiles:
        if not os.path.exists(csvFile):
            log.error("Cannot process file: %s. It was not found!" % csvFile)
            continue
        log.info("Processing csvFile: %s" % csvFile)
        meta.Session()
        reader = UnicodeDictReader(open(csvFile, 'rb'))
        rowCnt = 0
        for row in reader:
            rowCnt += 1
            try:
                type = row.get('Type').lower()
                resourceType = ARTIFACT_TYPES_MAP[type]
                resourceType = api.getResourceTypeByName(name=resourceType)

                eids = row.get('Concept EIDs')
                if eids:
                    eids = [ x.strip() for x in eids.strip().split(',') ]
                if not eids:
                    raise Exception('Skipping row %d due to missing EIDs.' % rowCnt)

                location = row.get('Resource Location').strip()
                if not location:
                    raise Exception(_('No location specified.'))
                name = row.get('Resource Name').strip()
                authors = row.get('Authors')
                if authors:
                    authors = [ x.strip() for x in authors.split(';') ]
                description = row.get('Description', '').strip()

                embedCode = row.get('Embed Code', '').strip()
                thumbnail = row.get('Thumbnail', '').strip()
                action = row.get('Action', '').strip().lower()
                if deleteAll and not action:
                    action = 'delete'
                license = row.get('License', 'CC BY NC SA')

                ## Create or update artifact/resource
                resourceUri = location
                if 's3.amazonaws.' in location or '.ck12.org' in location:
                    resourceUri = os.path.basename(location)
                    tmpFile = os.path.join('/tmp', resourceUri)
                    if action != 'delete':
                        log.info("Downloading [%s] to [%s]." % (location, tmpFile))
                        urllib.urlretrieve(location, tmpFile)
                        if not os.path.exists(tmpFile):
                            uploadFailures += 1
                            raise Exception(_('Failed to download from s3: %s' % location))
                    location = tmpFile

                ck12editor = api.getMemberByLogin(login='ck12editor')
                if resourceType.name in ['video', 'audio', 'interactive'] and not embedCode:
                    resourceType = api.getResourceTypeByName(name='web')
                log.info("Resource uri: %s, location: %s" % (resourceUri, location))
                resource = api.getResourceByUri(uri=resourceUri, ownerID=ck12editor.id)
                if not resource:
                    ## Create resource
                    if action != 'delete':
                        resourceRevision = createResource(location, name, ck12editor.id, resourceType.name, description, authors, license)
                        log.info("Created resource %d with type: %s" % (resourceRevision.resource.id, resourceType.name))
                        newResources += 1
                    else:
                        log.info("Skip creation of resource. Action: %s" % action)
                else:
                    resourceRevision = resource.revisions[0]
                    ## exists
                    if action != 'delete':
                        ## Update
                        resourceRevision = updateResource(resourceRevision, location, name, resourceUri, ck12editor.id, resourceType.name, description, authors, license)
                        log.info("Updated existing resource %d with type: %s" % (resourceRevision.resource.id, resourceType.name))
                        updatedResources += 1
                    else:
                        ## delete
                        resourceID = resource.id
                        ## Delete associated embedded object, if any
                        eo = resource.getEmbeddedObject()
                        if eo:
                            api.deleteEmbeddedObject(id=eo.id)
                        api.deleteResource(resource=resource, deleteAssociations=True)
                        log.info("Deleted existing resource %d with type: %s" % (resourceID, resourceType.name))
                        deletedResources += 1

                if action != 'delete' and embedCode:
                    ## Create/Update embedded object
                    embedInfo = {'embeddable': embedCode, 'resourceID': resourceRevision.resource.id}
                    if thumbnail:
                        embedInfo['thumbnail'] = thumbnail
                    eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(embedInfo=embedInfo, ownerID=ck12editor.id)
                    eo = eowrapper.createEmbeddedObject()
                    log.info("Embedded object: %s [resourceID: %d]" % (eo.id, eo.resourceID))

                if action != 'delete' and resourceRevision:
                    for eid in eids:
                        if eid:
                            lsn = api.getArtifactByEncodedID(encodedID=eid)
                            if not lsn:
                                associateFailures += 1
                                log.error("ERROR: [%d] No such artifact by encodedID: %s" % (rowCnt, eid))
                                continue
                            try:
                                associate_resource(3, resourceRevision.resource, lsn)
                                reindexList[lsn.id] = lsn.id
                                associations += 1
                                if lsn.type.name == 'lesson':
                                    children = api.getArtifactChildren(artifactID=lsn.id)
                                    for child in children:
                                        childArtifact = api.getArtifactByID(id=child['childID'])
                                        if childArtifact:
                                            associate_resource(3, resourceRevision.resource, childArtifact)
                                            associations += 1
                                            reindexList[childArtifact.id] = childArtifact.id
                                        else:
                                            log.error("ERROR: [%d] No such child artifact %s for %s" % (rowCnt, child['childID'], lsn.id))
                            except Exception as ee:
                                associateFailures += 1
                                log.error("ERROR: [%d] Error associating resource to %d" % (rowCnt, lsn.id), exc_info=ee)
            except Exception as e:
                uploadFailures += 1
                log.error("ERROR: [%d] Error uploading %s: %s" % (rowCnt, type, str(e)), exc_info=e)

        if rowCnt == 1:
            #break
            pass
    if reindexList:
        reindexArtifacts(reindexList.keys())
    log.info("Done. Processed %d rows" % rowCnt)
    log.info("Rows: %d, uploads: %d, newResources: %d, updatedResources: %d, deletedResources: %d, associations: %d, uploadFailures: %d, associateFailures: %d" % (rowCnt, uploads, newResources, updatedResources, deletedResources, associations, uploadFailures, associateFailures))

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

def createResource(resourcePath, name, user_id, resourceType, desc, authors, license=None):
    """
        Create a new resource
    """
    try:
        log.info("Resource Type: %s" % resourceType)
        resourceDict = {}
        if resourcePath.startswith('http'):
            resourceDict['uri'] = resourcePath
            resourceDict['uriOnly'] = True
            resourceDict['isExternal'] = True
        else:
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
        resourceDict['authors'] = ', '.join(authors)
        resourceDict['license'] = license
        
        resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        return resourceRevision
    finally:
        if not resourcePath.startswith('http') and os.path.exists(resourcePath):
            os.remove(resourcePath)

def updateResource(resourceRevision, resourcePath, name, uri, ownerID, resourceTypeName, description, authors, license):
    """
        Update an existing resource
    """
    try:
        resource = resourceRevision.resource
        if resource:
            member = api.getMemberByID(id=ownerID)
            resourceDict = {}
            resourceDict['id'] = resource.id
            resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceTypeName)
            if resource.name != name:
                resourceDict['handle'] = model.resourceName2Handle(resource.name)
            resourceDict['resourceName'] = name
            resourceDict['resourceDesc'] = description
            resourceDict['authors'] = ', '.join(authors)
            resourceDict['license'] = license
            resourceDict['ownerID'] = ownerID
            if uri.startswith('http'):
                resourceDict['isExternal'] = True
                resourceDict['uriOnly'] = True
                resourceDict['uri'] = uri
            else:
                resourceDict['isExternal'] = False
                resourceDict['uriOnly'] = False
                resourceDict['uri'] = open(resourcePath, 'rb')
            resourceDict['isAttachment'] = True
            resourceDict['isPublic'] = True
            resourceDict['resourceRevision'] = resourceRevision
            resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
            return resourceRevision
        else:
            raise Exception('No resource to update!')
    finally:
        if not resourcePath.startswith('http') and os.path.exists(resourcePath):
            os.remove(resourcePath)


