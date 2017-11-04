from flx.model import api
from flx.controllers.common import ArtifactCache
from flx.lib.helpers import reindexArtifacts

from datetime import datetime
import re
import logging

LOG_FILENAME = "/tmp/%s.log" % __name__
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
handler.setFormatter(formatter)
log.handlers = []
log.addHandler(handler)
print "Logging to %s" % LOG_FILENAME

changedArtifacts = {}
iframeRegex = re.compile(r'.*<iframe .*name="([0-9]*)"[^>]*>', re.I)

def run(typeName='lecture', ownerID=3, artifactIDs=[], dryRun=False):
    pageSize = 256
    pageNum = 1
    artifacts = []
    if artifactIDs:
        for id in artifactIDs:
            a = api.getArtifactByID(id=id)
            if a and (not typeName or a.type.name == typeName) and (not ownerID or ownerID == a.creatorID):
                artifacts.append(a)
	_processCoverImages(artifacts, dryRun)
    else:
        while True:
            print "Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum)
            log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
            artifacts = api.getArtifacts(typeName=typeName, ownerID=ownerID, pageNum=pageNum, pageSize=pageSize)
            if not artifacts:
                break
            _processCoverImages(artifacts, dryRun)
            pageNum += 1

    log.info("Added cover page to %d artifacts" % len(changedArtifacts.keys()))
    if changedArtifacts:
	log.info("Reindexing ....")
        reindexArtifacts(changedArtifacts.keys())

def _processCoverImages(artifacts, dryRun=False):
    for a in artifacts:
        try:
            xhtml = a.getXhtml()
            m = iframeRegex.search(xhtml)
            if m:
                eoID = m.group(1)
                if eoID:
                    eo = api.getEmbeddedObjectByID(id=eoID)
                    if eo and eo.thumbnail:
                        coverImage = api.getResourceByUri(uri=eo.thumbnail, ownerID=a.creatorID)
                        if not coverImage:
			    log.info("No cover image found for [%s]. Creating new." % (eo.thumbnail))
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
			    if not dryRun:
				coverImageRevision = api.createResource(resourceDict=coverImageDict, commit=True)
                        else:
			    log.info("Found cover image for [%s]. id[%s]" % (eo.thumbnail, coverImage.id))
                            coverImageRevision = coverImage.revisions[0]
                        log.info("Added cover page resource for artifact %d, type: %s" % (a.id, a.type.name))
			if not dryRun:
			    api.createArtifactHasResource(artifactRevisionID=a.revisions[0].id, resourceRevisionID=coverImageRevision.id)
			    log.info("Added cover page resource %d for artifact %d, type: %s" % (coverImageRevision.resource.id, a.id, a.type.name))
			api.invalidateArtifact(ArtifactCache(), a, recursive=True)
			ArtifactCache().load(id=a.id)
		       	changedArtifacts[a.id] = True
                    else:
                        log.warn("No embedded object or thumbnail found. artifactID[%s], eoID[%s]" % (a.id, eoID))
                else:
                    log.warn("Cannot find eoID in the 'name' attribute of iframe. artifactID[%s] XHTML[%s]" % (a.id, xhtml))
            else:
                log.warn("Cannot find eoID in the 'name' attribute of iframe. artifactID[%s] XHTML[%s]" % (a.id, xhtml))
        except Exception, e:
            log.error("Error processing artifact. [%s]" % a.id, exc_info=e)


