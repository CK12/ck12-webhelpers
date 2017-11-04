import os
import json
import logging

from pylons import app_globals as g
from flx.model import api
from flx.lib import helpers as h

LOG_FILE_PATH = "/tmp/update_modality.log"

# Initialise Logger
log = logging.getLogger('__name__')
#hdlr = logging.FileHandler(LOG_FILE_PATH)
hdlr = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
log.addHandler(hdlr)
log.setLevel(logging.INFO)


def run(memberID=3, subBrEID=None):
    """Update read modalities level from basic to at grade
    """
    termTypes = g.getBrowseTermTypes()
    termTypeID = termTypes['internal-tag']

    basicTerm = api.getBrowseTermByIDOrName(idOrName='basic', type=termTypes['level'])
    gradeTerm = api.getBrowseTermByIDOrName(idOrName='at grade', type=termTypes['level'])
    inTerm = api.getBrowseTermByIDOrName(idOrName='auto-created-by-system', type=termTypeID)
    if not inTerm:
        raise Exception("No Browseterm Exists with Id/Name, auto-created-by-system")

    basicTermID = basicTerm.id
    gradeTermID = gradeTerm.id
    inTermID = inTerm.id
    # Fetch all the internal 
    results = api.getArtifactHasBrowseTermsByBrowseTermID(inTermID)
    log.info("Total artifacts to process :%s" % len(results))
    for result in results:
        log.info(str(result))
        try:
            artifactID = result.artifactID
            log.info("Processing BrowseTerm for artifactID:%s" % artifactID)
            # Get the Basic level Term
            basicTerm = api.getArtifactHasBrowseTerm(artifactID, basicTermID)
            if basicTerm:
                # Remove the  Basic Term association
                api.deleteArtifactHasBrowseTerm(artifactID, basicTermID)
                # Associate At Grade Term
                kwargs = dict()
                kwargs['artifactID'] = artifactID
                kwargs['browseTermID'] = gradeTermID
                api.createArtifactHasBrowseTerm(**kwargs)        
                log.info("Completed processing of BrowseTerm, artifactID:%s" % artifactID)
        except Exception as e:
            log.info("Unable to update BrowseTerm for artifactID:%s" % artifactID)

if __name__ == "__main__":
    run()
