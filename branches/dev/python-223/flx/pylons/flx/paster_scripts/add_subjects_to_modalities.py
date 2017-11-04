from flx.model import api
from flx.lib.helpers import reindexArtifacts

import logging

log = None

## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/add_subjects.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=30)
        handler.setFormatter(formatter)
        log.addHandler(handler)
        return log
    except:
        pass

def run():
    initLog()
    pageSize = 512
    pageNum = 1
    artifacts = {}
    associations = 0
    while True:
        relatedArtifacts = api.getRelatedArtifactsForArtifact(artifactID=None, pageNum=pageNum, pageSize=pageSize)
        log.info("RelatedArtifacts: %d" % len(relatedArtifacts))
        if not relatedArtifacts:
            break
        for a in relatedArtifacts:
            try:
                artifactID = a.artifactID
                domainID = a.domainID
                term = api.getBrowseTermByID(id=domainID)
                if not term:
                    raise Exception("No such term: %s" % domainID)
                if term.type.name != 'domain':
                    log.info("Not a domain term: %s" % domainID)
                    continue
                subjectTerms = api.getSubjectsForDomainID(domainID=term.id)
                log.info("Subject terms: %s" % subjectTerms)
                for st in subjectTerms:
                    if not api.getArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=st.id):
                        api.createArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=st.id)
                        associations += 1
                        artifacts[artifactID] = True
            except Exception as e:
                log.error("Error: %s" % str(e), exc_info=e)
        pageNum += 1

    if artifacts:
        reindexArtifacts(artifacts.keys())
    log.info("Added associations: %d, Changed artifacts: %d" % (associations, len(artifacts.keys())))
    print "Added associations: %d, Changed artifacts: %d" % (associations, len(artifacts.keys()))
