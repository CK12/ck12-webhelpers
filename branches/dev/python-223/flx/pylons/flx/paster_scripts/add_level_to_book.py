import logging
import logging.handlers

from flx.model import api
import flx.lib.helpers as h
from flx.controllers.common import ArtifactCache, BrowseTermCache

# Initialise Logger
log = logging.getLogger(__name__)
#hdlr = logging.StreamHandler()  # Prints on console
#hdlr = logging.FileHandler('/tmp/add_level_to_book.log') # Use for smaller logs
hdlr = logging.handlers.RotatingFileHandler('/tmp/add_level_to_book.log', maxBytes=10*1024*1024, backupCount=500) #Use for bigger logs
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)

def run(bookArtifactID, level):
    """
    """
    reIndexArtifactIDs = []
    reloadDomains = set()
    if level not in ['basic', 'at grade', 'advanced']:
        log.info("Incorrect level provided")
        return

    log.info("Processing Book artifactID:%s, adding level:%s" % (bookArtifactID, level))
    levelBrowseTermType = api.getBrowseTermTypeByName(name='level')
    browseTerm = api.getBrowseTerm(name=level, browseTermTypeID=levelBrowseTermType.id)
    browseTermID = browseTerm.id

    book = api.getArtifactByID(id=bookArtifactID)
    chapters = book.revisions[0].children

    for chapter in chapters:
        tmp_artifact = chapter.child.artifact.revisions[0].artifact
        artifactID = tmp_artifact.id
        log.info('\tCreating AHBT entry')
        ahbt = api.createArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=browseTermID)
        if ahbt:
            reIndexArtifactIDs.append(artifactID)
            # Invalidate and reload the cache for section
            log.info('\tInvalidating artifact cache, Section')
            api.invalidateArtifact(ArtifactCache(), artifact=tmp_artifact, recursive=False)
            log.info('\tRecaching artifact, Concept')
            ArtifactCache().load(id=artifactID)
            log.info('\t%s level set for artifactID: [%s]' %(level, artifactID))
            # invalidate the browseTermCache for the concept node with the artifact, and recache the browseTerm
            domains = tmp_artifact.getDomains()
            for d in domains:
                reloadDomains.add(d)
        else:
            log.info('Unable to set %s level for artifactID: [%s]' %(level, artifactID))

    for domain in reloadDomains:
        log.info("Rebuilding cache for: [%s] %s" % (domain.encodedID, domain.name))
        api.invalidateBrowseTerm(BrowseTermCache(), browseTermID = domain.id)
        BrowseTermCache().load(domain.id)

    log.info('artifactIDs: [%s]' %(reIndexArtifactIDs))
    taskID = h.reindexArtifacts(reIndexArtifactIDs, 1, recursive=False)
    log.info("Reindexing artifacts. TaskID: [%s]" %(taskID))
