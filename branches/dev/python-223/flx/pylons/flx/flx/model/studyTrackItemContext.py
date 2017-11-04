import logging
from sqlalchemy.sql import and_

from flx.model.utils import _transactional, _checkAttributes, _queryOne, trace
from flx.model import model

log = logging.getLogger(__name__)

@_transactional()
def createStudyTrackItemContext(session, **kwargs):
    return _createStudyTrackItemContext(session, **kwargs)

@trace
def _createStudyTrackItemContext(session, **kwargs):
    _checkAttributes(['studyTrackID', 'studyTrackItemID'], **kwargs)
    stic = model.StudyTrackItemContext(**kwargs)
    session.add(stic)
    return stic

@_transactional()
def deleteStudyTrackItemContext(session, studyTrackID, studyTrackItemID):
    _deleteStudyTrackItemContext(session, studyTrackID, studyTrackItemID)

@trace
def _deleteStudyTrackItemContext(session, studyTrackID, studyTrackItemID):
    stic = _getStudyTrackItemContext(session, studyTrackID, studyTrackItemID)
    if stic:
        session.delete(stic)

@_transactional()
def deleteStudyTrackItemContexts(session, studyTrackID):
    _deleteStudyTrackItemContexts(session, studyTrackID)

@trace
def _deleteStudyTrackItemContexts(session, studyTrackID):
    query = session.query(model.StudyTrackItemContext)
    query = query.filter(model.StudyTrackItemContext.studyTrackID == studyTrackID)
    for stic in query.all():
        session.delete(stic)

@trace
def _getStudyTrackItemContext(session, studyTrackID, studyTrackItemID):
    query = session.query(model.StudyTrackItemContext)
    query = query.filter(and_(
        model.StudyTrackItemContext.studyTrackID == studyTrackID,
        model.StudyTrackItemContext.studyTrackItemID == studyTrackItemID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getStudyTrackItemContexts(session, studyTrackID):
    return _getStudyTrackItemContexts(session, studyTrackID)

@trace
def _getStudyTrackItemContexts(session, studyTrackID):
    d = []
    query = session.query(model.StudyTrackItemContext)
    query = query.filter(model.StudyTrackItemContext.studyTrackID == studyTrackID)
    for r in query.all():
        d.append({'studyTrackItemID': r.studyTrackItemID, 'contextUrl':r.contextUrl, 'conceptCollectionHandle':r.conceptCollectionHandle, 'collectionCreatorID':r.collectionCreatorID})
    return d

