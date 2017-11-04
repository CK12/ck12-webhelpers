from flx.model import api
from flx.lib.helpers import reindexArtifacts
from flx.controllers.common import ArtifactCache
from datetime import datetime
import logging

LOG_FILENAME = "/tmp/add_thumbnail_cover_images.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.addHandler(handler)

def run():

    termTypes = api.getBrowseTermTypesDict()
    terms = api.getBrowseTerms(termType=termTypes['domain'])
    levelTerms = api.getBrowseTerms(termType=termTypes['level'])
    lvlTermDict = {}
    for lvlTerm in levelTerms:
        lvlTermDict[lvlTerm.name] = lvlTerm.id

    changedArtifacts = {}
    added = 0
    termCnt = 1
    for term in terms:
        log.info("Processing term %d of %d: %s" % (termCnt, len(terms), term.encodedID))
        ras = api.getRelatedArtifactsForDomains(domainIDs=[ term.id ])
        if ras:
            for ra in ras:
                try:
                    a = api.getArtifactByID(id=ra.id)
                    if a and a.type.modality and a.type.name not in ['lesson', 'concept']:
                        for rr in a.revisions[0].resourceRevisions:
                            if rr.resource.isAttachment:
                                eo = rr.resource.getEmbeddedObject()
                                if eo and eo.thumbnail:
                                    coverImage = api.getResourceByUri(uri=eo.thumbnail, ownerID=a.creatorID)
                                    if not coverImage:
                                        language = api.getLanguageByName(name='English')
                                        coverImageType = api.getResourceTypeByName(name='cover page')
                                        coverImageDict = {
                                            'resourceType': coverImageType,
                                            'name': eo.thumbnail,
                                            'description': '',
                                            'uri': eo.thumbnail,
                                            'isExternal': True,
                                            'uriOnly': True,
                                            'languageID': language.id,
                                            'ownerID': a.creatorID,
                                            'creationTime': datetime.now(),
                                        }
                                        coverImageRevision = api.createResource(resourceDict=coverImageDict, commit=True)
                                    else:
                                        coverImageRevision = coverImage.revisions[0]
                                    api.createArtifactHasResource(artifactRevisionID=a.revisions[0].id, resourceRevisionID=coverImageRevision.id)
                                    log.info("Added cover page resource %d for artifact %d, type: %s" % (coverImageRevision.resource.id, a.id, a.type.name))
                                    api.invalidateArtifact(ArtifactCache(), a, recursive=True)
                                    ArtifactCache().load(id=a.id)
                                    changedArtifacts[a.id] = True
                                    added += 1
                                    break
                except Exception, e:
                    log.error("Error processing artifact: %d" % a.id, exc_info=e)
        else:
            log.info("No artifacts for term: %s" % term.encodedID)
        termCnt += 1

    log.info("Added cover page to %d artifacts" % added)
    if changedArtifacts:
        reindexArtifacts(changedArtifacts.keys())

