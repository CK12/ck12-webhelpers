from flx.model.utils import _transactional, _queryOne
from flx.lib import helpers as h
from flx.model import model, meta
from flx.model.mongo.conceptnode import ConceptNode
from flx.model.mongo import getDB as getMongoDB
from flx.model.mongo.conceptnode import ConceptNode
from flx.model.mongo import getDB as getMongoDB

from pylons import config

import logging

log = logging.getLogger(__name__)

mongodb = None

#config
global config
if not config.get('flx_home'):
    config = h.load_pylons_config()
if not mongodb:
    mongodb = getMongoDB(config)

@_transactional(readOnly=True)
def getSupercedingConcept(session, encodedID, artifactID=0):
    return _getSupercedingConcept(session, encodedID, artifactID=artifactID)

def _getSupercedingConcept(session, encodedID, artifactID=0):
    newEID = _getNewEIDForConcept(session, encodedID, artifactID=artifactID)
    if newEID:
        return _queryOne(session.query(model.BrowseTerm).filter(model.BrowseTerm.encodedID == newEID))
    return None

@_transactional(readOnly=True)
def getNewEIDForConcept(session, encodedID, artifactID=0):
    return _getNewEIDForConcept(session, encodedID, artifactID=artifactID)

def _getNewEIDForConcept(session, encodedID, artifactID=0):
    if not encodedID:
        return None
    encodedID = h.getCanonicalEncodedID(encodedID)
    mc = _queryOne(session.query(model.MigratedConcept).filter(model.MigratedConcept.originalEID == encodedID))
    if mc:
        browseTermArtifactCollectionContexts = None
        if artifactID:
            browseTermIDInfo = _queryOne(session.query(meta.BrowseTerms.c.id).filter(meta.BrowseTerms.c.encodedID == encodedID))
            if browseTermIDInfo:
                browseTermID = browseTermIDInfo[0]
                browseTermArtifactCollectionContexts = session.query(meta.RelatedArtifacts.c.conceptCollectionHandle, meta.RelatedArtifacts.c.collectionCreatorID).filter(meta.RelatedArtifacts.c.domainID == browseTermID, meta.RelatedArtifacts.c.artifactID == artifactID).all()
        cnode = ConceptNode(mongodb).getByEncodedID(eID=encodedID)
        return None if cnode and (not artifactID or (artifactID and browseTermArtifactCollectionContexts)) else mc.newEID       
    return None

@_transactional(readOnly=True)
def isConceptSuperceded(session, encodedID):
    return _isConceptSuperceded(session, encodedID)

def _isConceptSuperceded(session, encodedID):
    return _getNewEIDForConcept(session, encodedID) != None

