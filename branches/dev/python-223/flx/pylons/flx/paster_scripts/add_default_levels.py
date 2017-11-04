from flx.model import api
from flx.lib.helpers import reindexArtifacts
from flx.controllers.common import ArtifactCache
import logging

LOG_FILENAME = "/tmp/add_default_level.log"
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
                a = api.getArtifactByID(id=ra.id)
                if a:
                    lvlTerms = api.getArtifactHasBrowseTermsByType(artifactID=a.id, browseTermTypeID=termTypes['level'].id)
                    if not lvlTerms:
                        log.info("Adding level term 'basic' for %s" % a.id)
                        api.createArtifactHasBrowseTerm(artifactID=a.id, browseTermID=lvlTermDict['basic'])
                        api.invalidateArtifact(ArtifactCache(), a, recursive=True)
                        ArtifactCache().load(a.id)
                        changedArtifacts[a.id] = True
                        added += 1
        else:
            log.info("No artifacts for term: %s" % term.encodedID)
        termCnt += 1

    log.info("Added term to %d artifacts" % added)
    if changedArtifacts:
        reindexArtifacts(changedArtifacts.keys())

