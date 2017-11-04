import logging

from flx.model import api
from flx.model import meta
from flx.model import model
from flx.controllers.common import ArtifactCache

LOG_FILENAME = "/tmp/detect_duplicate_artifacts.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)

def run(creatorID=3, artifactTypeName=None, forceUpdate=False):
    pageSize = 256
    duplicates = {}
    reIndexList = []
    artifactTypes = api.getArtifactTypesDict()
    for artifactType in artifactTypes.keys():
        if artifactTypeName and artifactTypeName != artifactType:
            log.info("Skipping %s. Not %s" % (artifactType, artifactTypeName))
            continue
        log.info('Processing artifacts of type: [%s]' %(artifactType))
        duplicates[artifactType] = []
        pageNum = 1
        while True:
            print "Fetching %d artifacts of type: [%s], pageNum: %d" % (pageSize, artifactType, pageNum)
            artifacts = api.getArtifacts(typeName=artifactType, ownerID=creatorID, pageNum=pageNum, pageSize=pageSize)
            if not artifacts:
                break
            for a in artifacts:
                log.info('Processing artifact with artifactID: [%s]' %(a.id))
                handle = a.handle
                updatedHandle = model.title2Handle(handle)
                log.info('Handle: [%s], UpdatedHandle: [%s]' %(handle, updatedHandle))
                if handle == updatedHandle:
                    log.info('Identical handles. Skipping this artifact...')
                    continue
                duplicateArtifact = api.getArtifactByHandle(handle=updatedHandle, typeID=artifactTypes[artifactType].id, creatorID=creatorID)
                if not duplicateArtifact and not forceUpdate:
                    log.info('No duplicate artifacts with handle: [%s]. Continuing...' %(handle))
                    continue

                if duplicateArtifact:
                    duplicates[artifactType].append(duplicateArtifact.id)
                    log.info('Duplicated artifact found! ArtifactID: [%s]. Deleting it.' %(duplicateArtifact.id))
                    recursive = False
                    if artifactType == 'book':
                        recursive = True
                    api.deleteArtifactByID(id=duplicateArtifact.id, recursive=recursive, cache=ArtifactCache())
                    oldArtifact = api.getArtifactByID(id=duplicateArtifact.id)
                    log.info("Artifact still there? %s" % oldArtifact)
                    session = meta.Session()
                    session.begin()
                    if oldArtifact:
                        log.info('Artifact not deleted. Updating the handle, and setting the encodedID to None')
                        oldArtifact.handle = oldArtifact.handle + '-dup-handle-tbd'
                        oldArtifact.encodedID = None
                        session.merge(oldArtifact)
                    session.commit()

                session = meta.Session()
                session.begin()
                log.info('Adding the old handle to ArtifactHandles table')
                kwargs = { 'artifactID': a.id, 'handle': a.handle }
                ah = model.ArtifactHandle(**kwargs)
                session.add(ah)
                kwargs['handle'] = updatedHandle
                ah = model.ArtifactHandle(**kwargs)
                session.add(ah)

                log.info('Updating the handle of artifactID [%s]: [%s] to [%s]' %(a.id, a.handle, updatedHandle))
                a.handle = updatedHandle
                session.merge(a)
                api.invalidateArtifact(cache=ArtifactCache(), artifact=a)
                reIndexList.append(a.id)
                session.commit()
                #session.flush()
                #session.close()
                #session = None
            pageNum += 1

    if reIndexList:
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reIndexList, user=None)
    for eachID in reIndexList:
        a = api.getArtifactByID(id=eachID)
        api.invalidateArtifact(cache=ArtifactCache(), artifact=a)
    return duplicates
