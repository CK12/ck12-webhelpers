"""
    The APIs for the model. An API method cannot call other API methods. methods
"""

from base64 import standard_b64encode
from datetime import datetime, timedelta
from flx.model.utils import _transactional, _checkAttributes, _queryOne, MissingAttributeError, trace, THREADLOCAL, getRegExpForEncodedID
from flx.lib import helpers as h
from flx.lib.fc import fcclient as fc
from flx.lib.search import solrclient
from flx.model import exceptions as ex, meta, model, page as p, migrated_concepts as mc
from flx.model.audit_trail import AuditTrail
from flx.model.vcs import vcs as v
from flx.model import studyTrackItemContext
from flx.model.mongo.collectionNode import CollectionNode
from flx.model.mongo import getDB as getMongoDB
from pylons import config
from pylons.i18n.translation import _
from sqlalchemy import event, distinct, union_all, exc as sexc
from sqlalchemy.orm import exc, joinedload, aliased
from sqlalchemy.pool import Pool
from sqlalchemy.sql import and_, or_, func, not_
from sqlalchemy.sql.expression import desc, asc, literal
import base64
import copy
import hashlib
import json
import logging
import os
import re
import shutil
import tempfile
import threading
import traceback
import urllib
import urllib2

log = logging.getLogger(__name__)

## A global thread-local object to hold event ids for processing
t = threading.local()
t.events = []
t.notifications = []
t.reindexList = []
mongodb = None

#config
global config
if not config.get('flx_home'):
    config = h.load_pylons_config()
if not mongodb:
    mongodb = getMongoDB(config)

isLessonConceptSplitEnabled = True
if config.get('artifact.enable_lesson_concept_split') == 'False' :
    isLessonConceptSplitEnabled = False

COLLECTION_HANDLE_IDENTIFIERS_SEPARATOR = '-::-'

@event.listens_for(Pool, "checkout")
def ping_connection(dbapi_connection, connection_record, connection_proxy):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1")
        #log.debug("Connection is live ... %s" % (connection_proxy._pool.status()))
    except:
        # optional - dispose the whole pool
        # instead of invalidating one at a time
        # connection_proxy._pool.dispose()

        # raise DisconnectionError - pool will try
        # connecting again up to three times before raising.
        log.warn("DisconnectionError: %s" % dbapi_connection)
        raise sexc.DisconnectionError()
    finally:
        if cursor:
            cursor.close()

class ModelError(Exception):
    pass

def connect(url):
    if meta.engine is None:
        from sqlalchemy import create_engine, orm

        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              expire_on_commit=False,
                              bind=meta.engine)
        meta.Session = orm.scoped_session(sm)
    return meta.engine.connect()

sqlCachedClasses = set([
model.BrowseTermType,
model.Country,
model.DomainUrl,
model.EmbeddedObjectProvider,
model.EventType,
model.From1xBookMember,
model.Grade,
model.Language,
model.License,
model.NotificationRule,
model.ResourceType,
model.Standard,
model.StandardBoard,
model.Subject,
])

def _getInstance(session, instance, instanceType, lockMode=None):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the instance in any case.
    """
    if isinstance(instance, instanceType):
        return instance
    #
    #  It should be an identifier.
    #
    global sqlCacheClasses

    query = session.query(instanceType)
    if instanceType in sqlCachedClasses:
        query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(id=instance)
    return _queryOne(query, lockMode=lockMode)

def _getInstanceID(instance, instanceType):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the identifier in any case.
    """
    if isinstance(instance, instanceType):
        return instance.id
    #
    #  It should be an identifier already.
    #
    return instance

def _memberCustomSort(page, sortOrder='asc', pageNum=None, pageSize=None):
    if page.results and isinstance(page.results[0], model.GroupHasMembers):
        page.results = sorted(page.results, key=lambda x: x.member_info.fix().name.lower())
        if sortOrder == 'desc':
            page.results = page.results[::-1]
        if pageNum and pageSize:
            page.num = pageNum
            page.size = pageSize
            #page.total = len(page.results)
            page.results = page.results[(pageNum-1) * pageSize: ((pageNum-1) * pageSize) + pageSize] if pageSize > 0 else page.results
    return page

def _getArtifactTypeByName(session, typeName):
    """
        Get the artifact type instance by matching the name.
    """
    query = session.query(model.ArtifactType)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(name=typeName)
    artifactType = _queryOne(query)
    return artifactType

@_transactional(readOnly=True)
def getArtifactTypeByName(session, typeName):
    """
        Get the artifact type instance by matching the name.
    """
    return _getArtifactTypeByName(session, typeName)

def _getArtifactTypeByID(session, id):
    """
        Get the artifact type instance by matching the id.
    """
    try:
        id = long(id)
        query = session.query(model.ArtifactType)
        query = query.prefix_with('SQL_CACHE')
        query = query.filter_by(id=id)
        artifactType = _queryOne(query)
        return artifactType
    except ValueError:
        return None

@_transactional(readOnly=True)
def getArtifactTypeByID(session, id):
    """
        Get the artifact type instance by matching the name.
    """
    return _getArtifactTypeByID(session, id)


@_transactional(readOnly=True)
def getArtifactTypes(session, modalitiesOnly=False, pageNum=0, pageSize=0):
    """
        Get all the artifact types.
    """
    query = session.query(model.ArtifactType)
    query = query.prefix_with('SQL_CACHE')
    if modalitiesOnly:
        query = query.filter(model.ArtifactType.modality == True)
    query = query.order_by(model.ArtifactType.name)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getStopWords(session, getAll=False, pageNum=1, pageSize=10):
    """
        Get the list of stop words .
    """
    query = session.query(model.StopWord)
    query = query.order_by(model.StopWord.word)
    if getAll:
        ## Do not use Page() since it cannot be cached.
        return query.all()

    page = p.Page(query, pageNum, pageSize)
    return page

def _stopWordExists(session, word):
    """
        Verify if stop words.
    """
    query = session.query(model.StopWord)
    query = query.filter_by(word=word)
    stopWord = _queryOne(query)
    if stopWord:
        return True
    return False

@_transactional()
def createStopWords(session, **kwargs):
    """
        Create stop words .
    """
    _checkAttributes(['word'], **kwargs)
    words = kwargs['word']
    # Raise exception if stopword already exists.
    for word in words:
        if _stopWordExists(session, word):
            raise Exception((_(u"Stopword already exists: %(word)s") % {"word":word}).encode("utf-8"))

    stopWords = []
    for word in words:
        params = {'word':word}
        stopWord = model.StopWord(**params)
        session.add(stopWord)
        stopWords.append(stopWord)

    return stopWords

@_transactional()
def deleteStopWords(session, **kwargs):
    """
        Delete stop words .
    """
    _checkAttributes(['word'], **kwargs)
    words = kwargs['word']

    query = session.query(model.StopWord)
    query = query.filter(model.StopWord.word.in_(words))
    stopWords = query.all()
    for stopWord in stopWords:
        session.delete(stopWord)
    session.flush()

@_transactional(readOnly=True)
def getArtifactsOfTypes(session, types):
    """
        Get list of Artifacts of the specified types.
    """
    return _getArtifactsOfTypes(session, types)

def _getArtifactsOfTypes(session, types):
    artifactTypesList = []
    for eachArtifactType in types:
        artifactType = _getArtifactTypeByName(session, eachArtifactType)
        if artifactType: artifactTypesList.append(artifactType.id)
    query = session.query(model.Artifact)
    query = query.filter(model.Artifact.artifactTypeID.in_(artifactTypesList))
    return query.all()

@_transactional(readOnly=True)
def getArtifactTypesDict(session):
    return _getArtifactTypesDict(session)

def _getArtifactTypesDict(session):
    query = session.query(model.ArtifactType)
    query = query.prefix_with('SQL_CACHE')
    rows = query.all()
    dict = {}
    for type in rows:
        dict[type.name.lower()] = type
    return dict

def _getArtifactTypesDictByID(session):
    query = session.query(model.ArtifactType)
    query = query.prefix_with('SQL_CACHE')
    rows = query.all()
    dict = {}
    for type in rows:
        dict[type.id] = type
    return dict

@_transactional(readOnly=True)
def getRWA(session, memberID):
    #
    #  Find entries that can be voted by this member.
    #
    query = session.query(model.RwaVote)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.RwaVote.creatorID != memberID)
    rwas = query.all()
    votable = len(rwas)
    #
    #  Find the number of entries that this member has voted on.
    #
    query = session.query(model.ArtifactFeedback.artifactID).distinct()
    ids = []
    for rwa in rwas:
        ids.append(rwa.id)
    query = query.filter_by(memberID = memberID)
    query = query.filter(model.ArtifactFeedback.artifactID.in_(ids))
    feedbacks = query.all()
    fl = []
    for feedback in feedbacks:
        fl.append(feedback.artifactID)
    voted = len(fl)
    #
    #  Find an entry this member can vote on next.
    #
    vset = set(fl)
    for rwa in rwas:
        if rwa.id not in vset:
            return [ rwa, voted, votable ]
    return [ None, voted, votable ]

@_transactional()
def getRWAs(session, pageNum=0, pageSize=10):
    query = session.query(model.RwaVote)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.RwaVote.updateTime.desc())
    page = p.Page(query, pageNum, pageSize, tableName='RwaVotes')
    return page

def _browse(session, idList, term):
    """
        Browse the artifacts that match the given term.
    """
    artifactIDList = []
    for id in idList:
        query = session.query(model.ArtifactsAndBrowseTerms).distinct()
        query = query.filter(and_(
                    model.ArtifactsAndBrowseTerms.id == id,
                    func.lower(model.ArtifactsAndBrowseTerms.name) == term))
        browseTerms = query.all()
        if len(browseTerms) > 0:
            artifactIDList.append(id)
        else:
            #
            #  See if its children has those search terms.
            #
            query = session.query(model.ArtifactAndChildren).distinct()
            query = query.filter_by(id=id)
            acList = query.all()
            children = []
            for ac in acList:
                children.append(ac.childID)
            if children is not None and len(children) > 0:
                result = _browse(session, children, term)
                if len(result) > 0:
                    artifactIDList.append(id)
    return artifactIDList


@_transactional(readOnly=True)
def getMemberPseudoDomainByName(session, term, creatorID, pageNum=0, pageSize=10):

    termType = _getUnique(session, model.BrowseTermType, 'name', 'pseudodomain')
    if not termType:
        raise Exception((_(u"No such browse term type: pseudodomain")).encode("utf-8"))

    query = session.query(model.ArtifactsAndBrowseTerms.browseTermID, model.ArtifactsAndBrowseTerms.name, model.ArtifactsAndBrowseTerms.encodedID, model.ArtifactsAndBrowseTerms.handle,model.ArtifactsAndBrowseTerms.creatorID).distinct()

    query = query.filter(and_(
               model.ArtifactsAndBrowseTerms.creatorID == creatorID,
               model.ArtifactsAndBrowseTerms.termTypeID == termType.id))

    term = re.sub(r'\s\s+', ' ', term)
    term = term.replace(' ', '%')
    query = query.filter(model.ArtifactsAndBrowseTerms.name.like('%' +term + '%'))
    page = p.Page(query, pageNum, pageSize)
    return page


def generateUniqueEncodedID(artifact):
    artifactID = str(artifact.id)
    encodedID = 'UGC.UBR' + '.' + artifactID[:3] + '.' + artifactID[3:]
    if encodedID.endswith('.'):
        encodedID = encodedID.strip('.')
    return encodedID

@_transactional(readOnly=True)
def getLatestArtifacts(session, typeName=None, pageNum=0, pageSize=10):
    """
        Returns all the latest artifacts.
    """
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    query = session.query(model.Artifact)
    query = query.order_by(model.Artifact.updateTime.desc())
    if typeName is not None:
        query = query.filter(model.Artifact.type.has(name = typeName))
    page = p.Page(query, pageNum, pageSize, tableName='Artifacts')
    return page

@_transactional(readOnly=True)
def getPopularArtifacts(session, typeName=None, pageNum=0, pageSize=10):
    """
        Returns all the popular artifacts.
    """
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    query = session.query(model.ArtifactPopularity)
    if typeName is not None:
        query = query.filter_by(typeName=typeName)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getRelatedArtifacts(session, terms, typeName=None, idList=None, idsOnly=False, excludeIDs=None, memberID=None, getAll=True, ck12only=False, start=0, rows=100, fq=[]):
    return _getRelatedArtifacts(session, terms, typeName=typeName, idList=idList, idsOnly=idsOnly, excludeIDs=excludeIDs, memberID=memberID, getAll=getAll, ck12only=ck12only, start=start, rows=rows, fq=fq)

def _getRelatedArtifacts(session, terms, typeName=None, idList=None, idsOnly=False, excludeIDs=None, memberID=None, getAll=True, ck12only=True, start=0, rows=100, fq=[]):
    query = ''
    for term in terms:
        if query:
            query += ' OR '
        query += solrclient.getSearchQueryForBrowseTerms(term, maxBoost=4, types=['domains'], exactOnly=True, descendents=False)
    if query:
        query = '(' + query + ')'

    if typeName and typeName != 'artifact':
        if query:
            query += ' AND '
        query += 'type:"%s"' % typeName

    if query:
        query += ' AND'
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query += ' isPublic:"1" AND ownerID:"%d"' % long(ck12editor.id)
    elif not getAll and memberID:
        query += ' ownerID:"%d"' % int(memberID)
    else:
        query += ' isPublic:"1"'

    if idList:
        ids = ''
        if len(idList) > 0:
            for id in idList:
                if ids:
                    ids += ' OR '
                ids += ('id:"%s"' % str(id))
        if ids:
            if query:
                query += ' AND '
            query += '(%s)' % ids
    if excludeIDs:
        notids = ''
        for id in excludeIDs:
            if notids:
                notids += ' AND '
            notids += ('-id:"%s"' % str(id))
        if notids:
            if query:
                query += ' AND '
            query += '%s' % notids

    sort = 'domainPrefix,asc;domainEncoding,asc;iencodedID,asc'
    sortOrder = solrclient.getSortOrder(sort)
    return _searchGeneric(session=session, query=query, fq=fq, sort=sortOrder, idsOnly=idsOnly, start=start, rows=rows, memberID=memberID, spellSuggest=False)

@_transactional(readOnly=True)
def browseArtifacts(session, term, typeNames=None, fq=[], sort=None, idList=None, idsOnly=False, start=0, rows=100,
        memberID=None, browseAll=True, ck12only=True, termTypes=None, excludeSubjects=None, includeDescendants=True,
        extendedArtifacts=False, modifiedAfter=None, termAsPrefix=False, collectionHandle=None, collectionCreatorID=3, isCollectionCanonical=True):
    """
        Get all artifacts associated with term and optionally of specified type.
        If idList is provided look at artifacts in the list only
        If typeName is not provided also look for artifacts whose children have
        the given term
    """
    #timeit = True
    if not termTypes:
        termTypes = ['browseTerms']
    query = ''
    if term:
        if type(term).__name__ == 'list':
            query = ''
            for t in term:
                if query:
                    query += ' AND '
                query += '(' + solrclient.getSearchQueryForBrowseTerms(t, maxBoost=400, types=termTypes, descendents=includeDescendants, exactOnly=True) + \
                    ')'
        elif term != '__all__':
            ## __all__ is special keyword that bypasses the browse term matching.
            exact = True
            escapeChars = True
            if termAsPrefix:
                term = term + '*'
            if term.endswith('*'):
                exact = False
                escapeChars=False
            query = '(' + solrclient.getSearchQueryForBrowseTerms(term, maxBoost=400, types=termTypes, descendents=includeDescendants, exactOnly=exact, escapeChars=escapeChars) + \
                    ')'
    ## Check if the encoded id does not have the excludeSubjects
    if excludeSubjects:
        eidQ = ''
        for esubject in excludeSubjects:
            if len(esubject) == 3:
                if eidQ:
                    eidQ += ' AND '
                eidQ += '-encodedID:*%s.*' % esubject.upper()
        if eidQ:
            if query:
                query += ' AND '
            query += '%s' % eidQ

        termQ = ''
        for esubject in excludeSubjects:
            if termQ:
                termQ += ' AND '
            termQ += '-subjects.ext:"%s"' % esubject.lower()
        if termQ:
            if query:
                query += ' AND '
            query += '%s' % termQ

    tpQuery = ''
    if typeNames and not 'artifact' in typeNames:
        for typeName in typeNames:
            if tpQuery:
                tpQuery += ' OR '
            tpQuery += 'type:"%s"' % typeName

    if tpQuery:
        if query:
            query += ' AND '
        query += '(' + tpQuery + ')'

    if query:
        query += ' AND'
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query += ' isPublic:"1" AND ownerID:"%d"' % int(ck12editor.id)
    elif not browseAll and memberID:
        query += ' ownerID:"%d"' % int(memberID)
    else:
        query += ' isPublic:"1"'

    if collectionHandle and collectionCreatorID:
        chandle = ''
        if isCollectionCanonical:
            chandle += 'c|'
        chandle += collectionHandle
        chandle += '|%d' % collectionCreatorID
        query += ' AND chandles:"%s"' % chandle

    if idList is not None:
        ids = ''
        if len(idList) > 0:
            for id in idList:
                if ids:
                    ids += " OR "
                ids += ('id:"%s"' % str(id))
        else:
            ## idList is not none - but it is an empty list
            ## That means the search term needs to be ANDed with idList (result is empty)
            ids = 'id:"-1"'
        if ids:
            query += ' AND (%s)' % ids

    if modifiedAfter:
        query += ' AND modified:[%s TO NOW]' % solrclient.getSolrTime(modifiedAfter)
    log.info("fq: %s" % fq)
    results = _searchGeneric(session=session, query=query, idsOnly=idsOnly, fq=fq, sort=sort, start=start, rows=rows, memberID=memberID, spellSuggest=False)
    artifacts = results['artifactList']
    idList = []
    artifactIDList = []
    if artifacts:
        for artifact in artifacts:
            idList.append(artifact['id'])
            artifactIDList.append(artifact['id'])

    if idsOnly:
        results['artifactList'] = artifactIDList
    else:
        #if timeit: s = int(time.time() * 1000)
        ret = _getArtifactsDictByIDs(session, artifactIDList, memberID=memberID, orderList=artifactIDList, extendedArtifacts=extendedArtifacts)
        for a in ret:
            log.info("Name: %s ID: %d" % (a['title'], a['id']))
        #if timeit: log.info("Time spent with MySQL (ms): %d" % (int(time.time()*1000) - s))
        results['artifactList'] = ret
    return results

@_transactional(readOnly=True)
def browseArtifacts_db(session, term, typeName=None, idList=None):
    """
        Browse the artifacts that match the given term.
    """
    term = term.lower()
    query = session.query(model.Artifact).distinct()
    if idList is not None and len(idList) > 0:
        query = query.filter(model.Artifact.id.in_(idList))
    if typeName is None:
        #
        #  No type specified, use bottom up approach and limit the set to
        #  artifacts that match the term.
        #
        query = query.filter(and_(
                    model.ArtifactsAndBrowseTerms.id == model.Artifact.id,
                    func.lower(model.ArtifactsAndBrowseTerms.name) == term))
        artifacts = query.all()
        artifactIDList = []
        idList = []
        idDict = {}
        for artifact in artifacts:
            artifactIDList.append(artifact.id)
            idList.append(artifact.id)
            idDict[artifact.id] = artifact
        while len(artifacts) > 0:
            #
            #  Get the parent artifacts.
            #
            query = session.query(model.Artifact).distinct()
            query = query.filter(and_(
                        model.Artifact.id == model.ArtifactAndChildren.id,
                        model.ArtifactAndChildren.childID.in_(idList)))
            artifacts = query.all()
            idList = []
            n = 0
            for artifact in artifacts:
                if not idDict.has_key(artifact.id):
                    artifactIDList.insert(n, artifact.id)
                    idList.append(artifact.id)
                    idDict[artifact.id] = artifact
                    n += 1
    else:
        #
        #  Use top down approach and limit the set to artifacts of
        #  the given type.
        #
        query = query.filter(model.Artifact.type.has(name = typeName))
        artifacts = query.all()
        idList = []
        for artifact in artifacts:
            idList.append(artifact.id)
        artifactIDList = _browse(session, idList, term)

    if artifactIDList is None or len(artifactIDList) == 0:
        return []
    #
    #  Retrive the qualified artifacts in dictionary format.
    #
    artifacts = _getArtifactsByIDs(session, artifactIDList)
    artifactList = []
    for artifact in artifacts:
        artifactList.append(artifact.asDict())
    return artifactList

def _searchGeneric(session, query, fq=[], sort=None, idsOnly=False, start=0, rows=10,
        memberID=None, specialSort=None, spellSuggest=True, minScore=0.0, extendedArtifacts=False, relatedArtifacts=False,
        origTerm=None):
    """
        Generic search for artifacts
    """
    #timeit = True
    artifactList = []
    solr = solrclient.SolrClient()
    log.info("Starting at :%d and rows: %d" % (start, rows))
    numFound = 0
    facets = {}
    try:
        #if timeit: s = int(time.time() * 1000)
        solr.connect()
        if sort:
            for s in sort:
                if 'featured' in s:
                    query += ' AND featured:[1 TO *]'
                    break
        log.info("Using query: %s" % query)
        if not fq:
            hits = solr.select(q=query, fields=['sid', 'handle', 'type','title','summary',
                                                'ownerID','isModality','subjects.ext', 'levels.ext', 'gradeLevels.ext',
                                                'encodedID', 'domains.ext', 'ownerLogin', 'coverPageUrl','owner','domains', 'domainIDs.ext', 'language',
                                                'chandles', 'ctitles', 'cchandles', 'cctitles', 'cceids', ],
                                                score=True, sort=sort, start=start, rows=rows, specialSort=specialSort, spellcheck=spellSuggest, origTerm=origTerm)
        else:
            hits = solr.select(q=query, fields=['sid', 'handle', 'type','title','summary',
                                                'ownerID','isModality','subjects.ext', 'levels.ext', 'gradeLevels.ext',
                                                'encodedID', 'domains.ext', 'ownerLogin', 'coverPageUrl', 'owner','domains', 'domainIDs.ext', 'language',
                                                'chandles', 'ctitles', 'cchandles', 'cctitles', 'cceids', ],
                                                score=True, sort=sort, start=start, rows=rows, facet=True, fq=fq, facet_fields=solrclient.MINIMAL_FACET_FIELDS, specialSort=specialSort, spellcheck=spellSuggest, origTerm=origTerm)

        numFound = hits.numFound
        facets = hits.facets
        spellsugs = hits.spellingSuggestions

        artifactIds = []
        goodHits = []
        if hits:
            for hit in hits:
                if minScore and hit['score'] < minScore:
                    log.info("Skipping: %s" % str(hit['score']))
                    continue
                goodHits.append(hit)
            #if len(goodHits) > 0:
            hits = goodHits
            for hit in hits:
                artifactIds.append((hit['sid'], (hit.get('score'), hit.get('handle'), hit.get('type'),
                                                hit.get('title'), hit.get('summary'), hit.get('ownerID'),
                                                hit.get('isModality', 0), hit.get('subjects.ext', None), hit.get('levels.ext', None),
                                                hit.get('gradeLevels.ext', None), hit.get('encodedID'), hit.get('domains.ext', None),
                                                hit.get('ownerLogin', None), hit.get('coverPageUrl', None), hit.get('owner',None), hit.get('domainIDs.ext', None),
                                                hit.get('language', None), hit.get('chandles', []), hit.get('ctitles', []), hit.get('cchandles', []), hit.get('cctitles', []),
                                                hit.get('cceids', [])
                                                )))
        #if timeit: log.info("Time spent with Solr (ms): %d" % (int(time.time()*1000) - s))
        if artifactIds:
            if idsOnly:
                for artifact, artifactData in artifactIds:
                    level = None
                    if type(artifactData[8]) == list:
                        level = artifactData[8][0]
                    artifactList.append({'id': artifact, 'score': artifactData[0], 'handle': artifactData[1],
                                         'artifactType': artifactData[2], 'title': artifactData[3], 'summary': artifactData[4],
                                         'ownerID': artifactData[5], 'isModality': artifactData[6], 'subjectGrid': artifactData[7],
                                         'level': level, 'gradeGrid': artifactData[9], 'encodedID': artifactData[10],
                                         'domains.ext': artifactData[11], 'ownerLogin': artifactData[12], 'coverImage': artifactData[13],
                                         'creator': artifactData[14], 'domainIDs.ext': artifactData[15], 'language': artifactData[16],
                                         'chandles': artifactData[17], 'ctitles': artifactData[18], 'cchandles': artifactData[19], 'cctitles': artifactData[20], 
                                         'cceids': artifactData[21]
                                         })
            else:
                idList = [ int(x[0]) for x in artifactIds ]
                #if timeit: s = int(time.time() * 1000)
                ## Maintain the order in which search results are returned
                artifactList = _getArtifactsDictByIDs(session, idList, memberID=memberID, orderList=idList, excludeChildren=True,
                        extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts)
                #if timeit: log.info("Time spent with MySQL (ms): %d" % (int(time.time()*1000) - s))
    finally:
        solr.disconnect()
    log.info("Returning %d artifacts" % len(artifactList))
    if not idsOnly:
        for artifact in artifactList:
            log.info("ID: %s Type: %s Title: %s " % (artifact['id'], artifact['artifactType'], artifact['title']))
    return {'artifactList': artifactList, 'numFound': numFound, 'facets': facets, 'suggestions': spellsugs}

def _orderBy(session, orderedList, objectList, param):
    objectDict = {}
    for obj in objectList:
        objectDict[obj[param]] = obj
    retList = []
    for item in orderedList:
        if objectDict.has_key(item):
            retList.append(objectDict[item])
    return retList

def _search(session, domain, term, subject=None, typeNames=None, fq=[], sort=None, spellSuggest=True, start=0, rows=100,
        memberID=None, searchAll=True, specialSearch=False, extendedArtifacts=False, relatedArtifacts=False,
        includeEIDs=None, idsOnly=False):
    """
        Search the artifacts based on various parameters
    """
    DEFAULT_TYPE_BOOSTS = { 'concept': 5000, 'lesson': 5000, 'book': 1000, 'tebook': 100, 'labkit': 100, 'studyguide': 100, 'workbook': 100 }
    query = ""
    subjectsDict = _getSubjectsDict(session)
    term = term.strip()
    if not specialSearch and not subject and term:
        termL = term.lower().strip()
        ## Check if subject name is part of the term
        maxLen = 0
        subject = None
        for s in subjectsDict.keys():
            s = s.lower()
            subRe = re.compile(r'\b%s\b' % s, re.I)
            if subRe.search(termL) and len(s) > maxLen:
                maxLen = len(s)
                subject = s
        if subject and termL == subject:
            for key in DEFAULT_TYPE_BOOSTS:
                DEFAULT_TYPE_BOOSTS[key] = 1000
            DEFAULT_TYPE_BOOSTS['book'] = 5000
            DEFAULT_TYPE_BOOSTS['lesson'] = DEFAULT_TYPE_BOOSTS['concept'] = 500
        if subject:
            termL = termL.replace(subject, '').strip()
            termL = re.sub(r'\s+', ' ', termL)
            term = termL
        log.info("Term: %s" % term)
    if typeNames and 'artifact' not in typeNames:
        for typeName in typeNames:
            if typeName:
                typeName = typeName.lower()
                if query:
                    query += ' OR '
                else:
                    query += '('
                if includeEIDs and typeName in ['lesson', 'concept']:
                    query += '('
                if DEFAULT_TYPE_BOOSTS.has_key(typeName):
                    query += 'type:"%s"^%d ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                else:
                    query += 'type:"%s" ' % typeName
                if includeEIDs and typeName in ['lesson', 'concept']:
                    if searchAll:
                        query += ' AND ( isPublic:"0" OR encodedID:""'
                    else:
                        query += ' AND ( encodedID:""'
                    for eid in includeEIDs:
                        query += ' OR encodedID:*.%s' % eid
                    query += '))'
    if query:
        query += ') AND '
    if not searchAll:
        if memberID:
            ## If searching for only a user, we look for both private and public artifacts
            query += 'libraryMemberIDs:"%d" AND ' % (int(memberID))
        else:
            raise Exception((_(u'No authenticated member found. Cannot search in library!')).encode("utf-8"))
    else:
        ## If searching for public artifacts we look for isPublic flag - if memberID exists, we also look for library items
        if memberID:
            query += '(libraryMemberIDs:"%d" OR isPublic:"1") AND ' % (int(memberID))
        else:
            query += 'isPublic:"1" AND '
    log.info("specialSearch: %s" % specialSearch)
    if specialSearch and term:
        spq = solrclient.processSpecialSearchTerm(term, memberID)
        if spq:
            if not spq.startswith('NOT'):
                query += '(' + spq + ')'
            else:
                query += spq
    else:
        if subject:
            subject = subject.lower()
            query += '(' + solrclient.getSearchQueryForBrowseTerms(subject, maxBoost=200, types=['subjects'], descendents=True)
            query += ' OR ancestors:"%s"^100) AND ' % subject
            if not term:
                query += '(' + solrclient.getSearchQueryForContent(subject, maxBoost=1000, isArtifactSearch=True) + ') AND '
        if domain:
            domain = domain.lower()
            query += '(' + solrclient.getSearchQueryForBrowseTerms(domain, maxBoost=400, types=['domains'], descendents=True)
            query += ' OR ancestors:"%s"^100) AND ' % domain
        if term:
            term = term.lower()
            if term == '*' and not sort:
                sort = solrclient.getSortOrder('stitle,asc')
            query += solrclient.getDefaultFieldsQuery(term, memberID)

    if query.endswith(' AND '):
        query = query.rsplit(' AND ', 1)[0]

    return _searchGeneric(session, query, fq=fq, sort=sort, idsOnly=idsOnly, start=start, rows=rows, memberID=memberID, spellSuggest=spellSuggest, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts)

@_transactional(readOnly=True)
def searchArtifacts(session, domain, term, typeNames=None, fq=[], sort=None, start=0, rows=100,
        memberID=None, searchAll=True, libraryOnly=False, spellSuggest=True, specialSearch=False,
        extendedArtifacts=False, relatedArtifacts=False, includeEIDs=None, idsOnly=False):
    return _search(session=session, domain=domain, term=term, typeNames=typeNames, fq=fq, sort=sort, spellSuggest=spellSuggest, start=start, rows=rows,
            memberID=memberID, searchAll=searchAll, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts,
            includeEIDs=includeEIDs, idsOnly=idsOnly)

def _searchModalities(session, domain, term, subject=None, typeNames=None, fq=[], sort=None, spellSuggest=True, start=0, rows=100,
        memberID=None, searchAll=True, specialSearch=False, extendedArtifacts=False, relatedArtifacts=False,
        includeEIDs=None, idsOnly=False, ck12only=False, communityContributed=False, minScore=0.0, excludeSubjects=[], collectionHandle=None, collectionCreatorID=3, isCanonicalCollection=True):
    """
        Search the artifacts based on various parameters
    """
    DEFAULT_TYPE_BOOSTS = { 'book': 100, 'tebook': 100, 'section': 10,# Non Modalities
                           'domain': 100000, # Node / Browse Term of type domain
                           'concept': 7000, 'lesson': 7000, # Read Modalities
                           'rwa': 5000, 'rwaans': 5000, #Real World Application Modalities
                           'lecture': 5000, 'enrichment': 5000, 'simulation': 5000, 'simulationint': 5000, 'audio': 5000, 'plix': 5000, #Video Modalities
                           'lab': 5000, 'labans': 5000, 'worksheet': 5000, 'worksheetans': 5000, 'activity': 5000, 'activityans': 5000, 'preread': 5000, #Activities Modalities
                           'preread':5000,'prereadans':5000,'postread':5000,'postreadans':5000,'whileread':5000,'whilereadans':5000,'prepostread':5000,'prepostreadans':5000, # Activities Literacy Modalities
                           'studyguide':5000,'flashcard':5000, #Study Aid Modalities
                           'web':5000, #Web Links
                           'handout':5000,'rubric':5000,'lessonplanx':5000,'lessonplanxans':5000,'lessonplan':5000,'lessonplanans':5000,'presentation':5000,'cthink':5000, #Teaching Resources Modalities
                           'interactive':5000,'image':5000, # Image Modalities
                           'conceptmap':5000, # Mind Map
                           'quiz':5000,'quizans':5000,'quizdemo':5000,'exercise':5000,'exerciseint':5000, # Assessment Modalities
                           'attachment':100 } #Attachment Modalities
    query = ""
    subjectsDict = _getSubjectsDict(session)
    ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
    if not ck12editor:
        raise Exception((_(u'No user found for login: ck12editor')).encode("utf-8"))
    term = term.strip()
    exactMatch = (term.startswith('"') and term.endswith('"')) or (term.startswith("'") and term.endswith("'"))
    if exactMatch:
        term = term.strip('"')
        term = term.strip("'")
    origTerm = term
    if not specialSearch and not subject and term and not exactMatch:
        termL = term.lower().strip()
        ## Check if subject name is part of the term
        maxLen = 0
        subject = None
        for s in subjectsDict.keys():
            s = s.lower()
            subRe = re.compile(r'\b%s\b' % s, re.I)
            if subRe.search(termL) and len(s) > maxLen:
                maxLen = len(s)
                subject = s
        if subject and termL == subject:
            for key in DEFAULT_TYPE_BOOSTS:
                DEFAULT_TYPE_BOOSTS[key] = 500
            DEFAULT_TYPE_BOOSTS['book'] = 5000
            DEFAULT_TYPE_BOOSTS['lesson'] = DEFAULT_TYPE_BOOSTS['concept'] = DEFAULT_TYPE_BOOSTS['domain'] = 1000
            DEFAULT_TYPE_BOOSTS['section'] = 10
        log.info("Term: %s" % term)
    if exactMatch:
        for key in DEFAULT_TYPE_BOOSTS:
            DEFAULT_TYPE_BOOSTS[key] = 1
    if typeNames and 'artifact' not in typeNames:
        for typeName in typeNames:
            if typeName:
                typeName = typeName.lower()
                if query:
                    query += ' OR '
                else:
                    query += '('
                if DEFAULT_TYPE_BOOSTS.has_key(typeName) and DEFAULT_TYPE_BOOSTS[typeName]:
                    if typeName == 'domain':
                        if ck12only:
                            query += '(type:"%s"^%d AND NOT ck12PublishedModalityCount:0) ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                        else:
                            query += '(type:"%s"^%d AND ((-(publishedModalityCount:0) OR (publishedModalityCount:{* TO *} AND *:*)) ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                            if memberID:
                                query +=' OR modalityMemberIDs:%d ' % (int(memberID))
                            query += '))'
                    else:
                        query += 'type:"%s"^%d ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                else:
                    if typeName == 'domain':
                        if ck12only:
                            query += '(type:"%s" AND NOT ck12PublishedModalityCount:0) ' % typeName
                        else:
                            query += '(type:"%s" AND ((-(publishedModalityCount:0) OR (publishedModalityCount:{* TO *} AND *:*)) ' % typeName
                            if memberID:
                                query +=' OR modalityMemberIDs:%d ' % (int(memberID))
                            query += '))'
                    else:
                        query += 'type:"%s" ' % typeName
    if query:
        # Added check not to show RWAs submitted by user for competition
        query += ') AND NOT internaltags.ext:"getreal competition" AND '
    log.debug("searchAll: %s, ck12only: %s, communityContributed: %s" % (searchAll, ck12only, communityContributed))
    if ck12only or communityContributed:
        query += '(isPublic:"1" AND %s ownerID:"%d") AND ' % ('NOT' if communityContributed else '', int(ck12editor.id))
    elif not searchAll:
        if memberID:
            ## If searching for only a user, we look for both private and public artifacts
            query += 'libraryMemberIDs:"%d" AND ' % (int(memberID))
        else:
            raise Exception((_(u'No authenticated member found. Cannot search in library!')).encode("utf-8"))
    else:
        ## If searching for public artifacts we look for isPublic flag - if memberID exists, we also look for library items
        if memberID:
            query += '(libraryMemberIDs:"%d" OR isPublic:"1") AND ' % (int(memberID))
        else:
            query += 'isPublic:"1" AND '
        query += '(ownerID:"%d"^10000 OR ownerID:*) AND ' % (ck12editor.id)
    log.info("specialSearch: %s" % specialSearch)
    if specialSearch and term:
        spq = solrclient.processSpecialSearchTerm(term, memberID)
        if spq:
            if not spq.startswith('NOT'):
                query += '(' + spq + ')'
            else:
                query += spq
    else:
        if subject:
            subject = subject.lower()
            subjects = [ subject ]
            if subject == 'biology':
                subjects.append('life%20science')
            elif subject in ['physics', 'chemistry']:
                subjects.append('physical%20science')
            query += '('
            for i in range(0, len(subjects)):
                if i > 0:
                    query += ' OR '
                query += solrclient.getSearchQueryForBrowseTerms(subjects[i].replace('%20', ' '), maxBoost=200, types=['subjects'], exactOnly=exactMatch, descendents=not exactMatch)
                query += ' OR ancestors:"%s"^100' % subjects[i].replace('%20', ' ')
            ## Or subject can be any value including empty - these results have a lower weight
            query += ' OR subjects:* OR (*:* NOT subjects:*)) AND '
            if not term and not exactMatch:
                query += '(' + solrclient.getSearchQueryForContent(subject, maxBoost=1000, isArtifactSearch=True) + ') AND '
        if domain:
            domain = domain.lower()
            query += '(' + solrclient.getSearchQueryForBrowseTerms(domain, maxBoost=400, types=['domains'], exactOnly=exactMatch, descendents=not exactMatch)
            query += ' OR ancestors:"%s"^100) AND ' % domain
        if term:
            term = term.lower()
            if term == '*' and not sort:
                sort = solrclient.getSortOrder('stitle,asc')
            query += solrclient.getDefaultFieldsQuery(term, memberID, exactOnly=exactMatch, includeContent=not exactMatch)
        if excludeSubjects:
            subQ = ''
            for sub in excludeSubjects:
                if subQ:
                    subQ += ' AND '
                subQ += '-subjects.ext:"%s"' % sub.lower()
            if subQ:
                if not query.endswith(' AND '):
                    query += ' AND '
                query += subQ

    if collectionHandle:
        collectionHandle = '%s|%s' % (collectionHandle, collectionCreatorID) 
        if isCanonicalCollection:
            collectionHandle = 'c|%s' % collectionHandle
        query += ' AND chandles:"%s"' % collectionHandle
    if query.endswith(' AND '):
        query = query.rsplit(' AND ', 1)[0]

    return _searchGeneric(session, query, fq=fq, sort=sort, idsOnly=idsOnly, start=start, rows=rows, memberID=memberID,
            spellSuggest=spellSuggest, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts, origTerm=origTerm, minScore=minScore)


@_transactional(readOnly=True)
def searchModalities(session, domain, term, typeNames=None, fq=[], sort=None, start=0, rows=100,
        memberID=None, searchAll=True, libraryOnly=False, spellSuggest=True, specialSearch=False,
        extendedArtifacts=False, relatedArtifacts=False, includeEIDs=None, idsOnly=False, ck12only=False, communityContributed=False, minScore=0.0, excludeSubjects=[]):
    return _searchModalities(session=session, domain=domain, term=term, typeNames=typeNames, fq=fq, sort=sort, spellSuggest=spellSuggest, start=start, rows=rows,
            memberID=memberID, searchAll=searchAll, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts,
            includeEIDs=includeEIDs, idsOnly=idsOnly, ck12only=ck12only, communityContributed=communityContributed, minScore=minScore, excludeSubjects=excludeSubjects)


def _getFeaturedArtifactsForEncodedID(session, featuredEID, typeNames=None, start=0, rows=100, memberID=None, extendedArtifacts=False,
                                      relatedArtifacts=False, searchAll=True, idsOnly=False, ck12only=False, communityContributed=False):
    """
        Search the artifacts based on featuredEID and various parameters
    """
    DEFAULT_TYPE_BOOSTS = { 'book': 100, 'tebook': 100, 'section': 10,# Non Modalities
                           'domain': 100000, # Node / Browse Term of type domain
                           'concept': 7000, 'lesson': 7000, # Read Modalities
                           'rwa': 5000, 'rwaans': 5000, #Real World Application Modalities
                           'lecture': 5000, 'enrichment': 5000, 'simulation': 5000, 'simulationint': 5000, 'audio': 5000, 'plix': 5000, #Video Modalities
                           'lab': 5000, 'labans': 5000, 'worksheet': 5000, 'worksheetans': 5000, 'activity': 5000, 'activityans': 5000, 'preread': 5000, #Activities Modalities
                           'preread':5000,'prereadans':5000,'postread':5000,'postreadans':5000,'whileread':5000,'whilereadans':5000,'prepostread':5000,'prepostreadans':5000, # Activities Literacy Modalities
                           'studyguide':5000,'flashcard':5000, #Study Aid Modalities
                           'web':5000, #Web Links
                           'handout':5000,'rubric':5000,'lessonplanx':5000,'lessonplanxans':5000,'lessonplan':5000,'lessonplanans':5000,'presentation':5000,'cthink':5000, #Teaching Resources Modalities
                           'interactive':5000,'image':5000, # Image Modalities
                           'conceptmap':5000, # Mind Map
                           'quiz':5000,'quizans':5000,'quizdemo':5000,'exercise':5000,'exerciseint':5000, # Assessment Modalities
                           'attachment':100 } #Attachment Modalities
    query = ""
    ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
    if not ck12editor:
        raise Exception((_(u'No user found for login: ck12editor')).encode("utf-8"))
    featuredEID = featuredEID.strip()
    origTerm = featuredEID
    if typeNames and 'artifact' not in typeNames:
        for typeName in typeNames:
            if typeName:
                typeName = typeName.lower()
                if query:
                    query += ' OR '
                else:
                    query += '('
                if DEFAULT_TYPE_BOOSTS.has_key(typeName) and DEFAULT_TYPE_BOOSTS[typeName]:
                    if typeName == 'domain':
                        if ck12only:
                            query += '(type:"%s"^%d AND NOT ck12PublishedModalityCount:0) ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                        else:
                            query += '(type:"%s"^%d AND ((-(publishedModalityCount:0) OR (publishedModalityCount:{* TO *} AND *:*)) ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                            if memberID:
                                query +=' OR modalityMemberIDs:%d ' % (int(memberID))
                            query += '))'
                    else:
                        query += 'type:"%s"^%d ' % (typeName, DEFAULT_TYPE_BOOSTS[typeName])
                else:
                    if typeName == 'domain':
                        if ck12only:
                            query += '(type:"%s" AND NOT ck12PublishedModalityCount:0) ' % typeName
                        else:
                            query += '(type:"%s" AND ((-(publishedModalityCount:0) OR (publishedModalityCount:{* TO *} AND *:*)) ' % typeName
                            if memberID:
                                query +=' OR modalityMemberIDs:%d ' % (int(memberID))
                            query += '))'
                    else:
                        query += 'type:"%s" ' % typeName
    if query:
        # Added check not to show RWAs submitted by user for competition
        query += ') AND NOT internaltags.ext:"getreal competition" AND '
    log.debug("searchAll: %s, ck12only: %s, communityContributed: %s" % (searchAll, ck12only, communityContributed))
    if ck12only or communityContributed:
        query += '(isPublic:"1" AND %s ownerID:"%d") AND ' % ('NOT' if communityContributed else '', int(ck12editor.id))
    elif not searchAll:
        if memberID:
            ## If searching for only a user, we look for both private and public artifacts
            query += 'libraryMemberIDs:"%d" AND ' % (int(memberID))
        else:
            raise Exception((_(u'No authenticated member found. Cannot search in library!')).encode("utf-8"))
    else:
        ## If searching for public artifacts we look for isPublic flag - if memberID exists, we also look for library items
        if memberID:
            query += '(libraryMemberIDs:"%d" OR isPublic:"1") AND ' % (int(memberID))
        else:
            query += 'isPublic:"1" AND '
        query += '(ownerID:"%d"^10000 OR ownerID:*) AND ' % (ck12editor.id)
    if featuredEID:
        query += '(internaltags.ext: %s) AND ' % (featuredEID.lower())

    if query.endswith(' AND '):
        query = query.rsplit(' AND ', 1)[0]

    return _searchGeneric(session, query, fq=[], sort=None, idsOnly=idsOnly, start=start, rows=rows, memberID=memberID,
            spellSuggest=True, extendedArtifacts=False, relatedArtifacts=False, origTerm=origTerm, minScore=0.0)


@_transactional(readOnly=True)
def getFeaturedArtifactsForEncodedID(session, featuredEID, typeNames=None, start=0, rows=100, memberID=None, searchAll=True,
                                     extendedArtifacts=False, relatedArtifacts=False, idsOnly=False, ck12only=False, communityContributed=False):
    return _getFeaturedArtifactsForEncodedID(session=session, featuredEID=featuredEID, typeNames=typeNames, start=start, rows=rows,
                                            memberID=memberID, searchAll=searchAll, extendedArtifacts=extendedArtifacts, idsOnly=idsOnly,
                                            relatedArtifacts=relatedArtifacts, ck12only=ck12only, communityContributed=communityContributed)

@_transactional(readOnly=True)
def browseArtifactsWithQuery(session, query, fq=[], sort=None, start=0, rows=0, memberID=None, minScore=None):
    return _searchGeneric(session, query, fq=fq, sort=sort, start=start, rows=rows, memberID=memberID, spellSuggest=False, minScore=minScore)

@_transactional(readOnly=True)
def searchArtifactsByStandard(session, state='*', grade='*', subject='*', otherTerms=[], artifactTypeNames=None, start=0, rows=10, memberID=None, searchAll=True, ck12only=True, idsOnly=False):
    """
        Get a list of artifacts for a given standard and artifactTypeName
        Optionally look for additional browseTerms "otherTerms" - they will be ORed
    """
    standardTerm = ''
    if state == '*' and grade == '*' and subject == '*':
        return None
    if state:
        standardTerm += '%s.' % state.lower()
    if grade:
        standardTerm += '%s.' % grade.lower()

    if standardTerm:
        standardTerm += '*'

    query = '(standards.ext:%s^500 OR descendents.standards.ext:%s^300)' % (standardTerm, standardTerm)
    query += ' AND -encodedIDs:""'
    notSubjectsDict = { 'biology': ['life science'], 'physics': ['physical science'] }
    if subject:
        ## Bug 57186 - do not look for descendants subject match
        query += ' AND (subjects.ext:"%s"^500)' % (subject)
        ## query += ' AND (subjects.ext:"%s"^500 OR descendents.subjects.ext:"%s"^300)' % (subject, subject)
        if notSubjectsDict.has_key(subject.lower()):
            notQ = ''
            for notS in notSubjectsDict.get(subject.lower()):
                if notQ:
                    notQ += ' AND'
                notQ += ' -subjects.ext:"%s"' % notS
            if notQ:
                query += ' AND' + notQ
    log.info("Other terms: %s" % str(otherTerms))
    termQ = ''
    if otherTerms and len(otherTerms) > 0:
        termQ = ' AND ('
        for otherTerm in otherTerms:
            otherTerm = otherTerm.lower()
            if not termQ.endswith('('):
                termQ += ' AND '
            termQ += '(' + solrclient.getSearchQueryForBrowseTerms(otherTerm, maxBoost=200, types=['browseTerms'], descendents=True)
            termQ += ' OR ' + solrclient.getSearchQueryForBrowseTerms(otherTerm, maxBoost=100, types=['tags'], descendents=True)
            ## Also check for contents
            termQ += ' OR ' + solrclient.getSearchQueryForContent(otherTerm)
            termQ += ')'
        termQ += ')'

    query += termQ
    if artifactTypeNames and 'artifact' not in artifactTypeNames:
        typeQ = ''
        for typeName in artifactTypeNames:
            if typeQ:
                typeQ += ' OR '
            typeQ += 'type:"%s"' % typeName
        query += ' AND (%s)' % typeQ
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u'No user found for login: ck12editor')).encode("utf-8"))
        query += ' AND isPublic:"1" AND ownerID:"%d"' % int(ck12editor.id)
    elif not searchAll and memberID:
        ## If searching for only a user, we look for both private and public artifacts
        query += ' AND ownerID:"%d"' % int(memberID)
    else:
        ## If searching for public artifacts we look for isPublic flag
        query += ' AND isPublic:"1"'

    sort = 'encodedID,asc'
    sortOrder = solrclient.getSortOrder(sort)
    return _searchGeneric(session, query, sort=sortOrder, idsOnly=idsOnly, start=start, rows=rows, memberID=memberID)

def _getUnique(session, what, term, value, func=None):
    """
        Return the instance of type `what` with `term` = `value`.
    """
    global sqlCacheClasses

    query = session.query(what)
    if what in sqlCachedClasses:
        query = query.prefix_with('SQL_CACHE')
    if func is not None and func.__call__:
        query = func(query, 'all')
    kwargs = { term: value }
    return _queryOne(query.filter_by(**kwargs))

@_transactional(readOnly=True)
def getUnique(session, what, term, value):
    """
        API for the internal _getUnique() method.
    """
    return _getUnique(session, what, term, value)

def _getArtifactRevisionByID(session, id, lockMode=None):
    """
        Returns the artifact revision identified by revisionID.
    """
    try:
        id = long(id)
        query = session.query(model.ArtifactRevision)
        query = query.filter_by(id=id)
        if lockMode:
            query = query.with_lockmode(lockMode)
        revision = _queryOne(query)
        return revision
    except ValueError:
        return None

@_transactional(readOnly=True)
def getArtifactRevisionByID(session, id):
    """
        Returns the artifact revision identified by revisionID.
    """
    return _getArtifactRevisionByID(session, id)

@_transactional(readOnly=True)
def getArtifactRevisionsFromArtifacts(session, artifactIDList):
    return _getArtifactRevisionsFromArtifacts(session, artifactIDList)

@_transactional(readOnly=True)
def getArtifactRevisionByArtifactID(session, artifactID, artifactRevisionID=0):
    return _getArtifactRevisionByArtifactID(session, artifactID, artifactRevisionID)

def _getArtifactRevisionByArtifactID(session, artifactID, artifactRevisionID=0):
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.artifactID == artifactID)
    if artifactRevisionID:
        query = query.filter(model.ArtifactRevision.id == artifactRevisionID)
    query = query.order_by(model.ArtifactRevision.id.desc())
    return query.first()

def _getArtifactRevisionsFromArtifacts(session, artifactIDList):
    if not artifactIDList:
        return []
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.artifactID.in_(artifactIDList))
    query = query.order_by(model.ArtifactRevision.artifactID, model.ArtifactRevision.id.desc())
    revisions = query.all()
    return revisions

@_transactional(readOnly=True)
def getArtifactRevisionChildren(session, revisionID):
    return _getArtifactRevisionChildren(session, revisionID)

def _getArtifactRevisionChildren(session, revisionID):
    """
        Returns a list of children for the artifacts along with their
        sequence number.
    """
    query = session.query(model.ArtifactRevisionRelation)
    query = query.filter_by(artifactRevisionID=revisionID).order_by(model.ArtifactRevisionRelation.sequence)
    children = query.all()
    childList = []
    for child in children:
        childList.append(child.hasArtifactRevisionID)
    return childList

def _getArtifactRevisionRelation(session, artifactRevisionID, hasArtifactRevisionID):
    """
        Returns the relation between the 2 given artifact revisions.
    """
    query = session.query(model.ArtifactRevisionRelation)
    query = query.filter_by(artifactRevisionID = artifactRevisionID)
    query = query.filter_by(hasArtifactRevisionID = hasArtifactRevisionID)
    return _queryOne(query)

@_transactional(readOnly=True)
def getArtifactRevisionParents(session, revisionIDList):
    return _getArtifactRevisionParents(session, revisionIDList)

def _getArtifactRevisionParents(session, revisionIDList):
    """
        Returns a list of parents for the artifacts along with their
        sequence number.
    """
    if not revisionIDList:
        return {}
    query = session.query(model.ArtifactRevisionRelation)
    query = query.filter(model.ArtifactRevisionRelation.hasArtifactRevisionID.in_(revisionIDList)).order_by(model.ArtifactRevisionRelation.sequence)
    parents = query.all()
    parentDict = {}
    for parent in parents:
        if not parentDict.has_key(parent.hasArtifactRevisionID):
            parentDict[parent.hasArtifactRevisionID] = []
        parentDict[parent.hasArtifactRevisionID].append((parent.artifactRevisionID, parent.sequence))
    return parentDict

def _getStandards(session, revisionIDList):
    if not revisionIDList:
        return {}
    query = session.query(model.RevisionAndStandards)
    query = query.filter(model.RevisionAndStandards.rid.in_(revisionIDList))
    standards = query.all()

    standardIDList = []
    for standard in standards:
        standardIDList.append(standard.standardID)

    if not standardIDList:
        return {}
    query = session.query(model.StandardAndGrades).distinct()
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.StandardAndGrades.sid.in_(standardIDList))
    query = query.order_by(model.StandardAndGrades.sid, model.StandardAndGrades.id)
    grades = query.all()
    gradeDict = {}
    for grade in grades:
        if not gradeDict.has_key(grade.sid):
            gradeDict[grade.sid] = []
        gradeDict[grade.sid].append(grade.name)

    standardDict = {}
    for standard in standards:
        if not standardDict.has_key(standard.rid):
            standardDict[standard.rid] = {}
        name = '%s.%s' % (standard.standard.standardBoard.country.code2Letter.upper(), standard.boardName)
        if not standardDict[standard.rid].has_key(name):
            standardDict[standard.rid][name] = []
        standardDict[standard.rid][name].append({
            'subject': standard.subjectName,
            'section': standard.section,
            'title': standard.title,
            'grades': gradeDict[standard.standardID] if gradeDict.has_key(standard.standardID) else [],
        })
    return standardDict

def _getArtifactBrowseTermsByType(session, artifactIDList, btType):
    if not artifactIDList:
        return {}
    query = session.query(model.ArtifactsAndBrowseTerms).distinct()
    query = query.filter(model.ArtifactsAndBrowseTerms.id.in_(artifactIDList))
    query = query.filter(and_(
            model.BrowseTermType.id == model.ArtifactsAndBrowseTerms.termTypeID,
            model.BrowseTermType.name == btType))
    query = query.order_by(model.ArtifactsAndBrowseTerms.id)
    return query.all()

def _getArtifactRelatedDomainsDict(session, artifactIDList):
    relatedEids = session.query(model.RelatedArtifactsAndLevels).filter(and_(
                model.RelatedArtifactsAndLevels.id.in_(artifactIDList),
                not_(model.RelatedArtifactsAndLevels.domainEID.ilike('UGC.UBR.%%')))).all()
    relatedEidDict = {}
    seenEids = {}
    for relatedEid in relatedEids:
        artifactID = relatedEid.id
        if not artifactID in relatedEidDict:
            relatedEidDict[artifactID] = []
        term = _getBrowseTermByEncodedID(session, encodedID=relatedEid.domainEID, returnSupercedingConcept=True)
        if not artifactID in seenEids:
            seenEids[artifactID] = set()
        if not term.encodedID in seenEids[artifactID]:
            seenEids[artifactID].add(term.encodedID)
            relatedEidDict[artifactID].append((term.id, term.name, term.encodedID, term.handle, model.getBranchHandle(term.encodedID)))
    log.debug("Dict: %s" % relatedEidDict)
    return relatedEidDict

def _getArtifactBrowseTermsDictByType(session, artifactIDList, btType):
    browseTerms = _getArtifactBrowseTermsByType(session, artifactIDList, btType)
    browseTermDict = {}
    for browseTerm in browseTerms:
        artifactID = browseTerm.id
        if not browseTermDict.has_key(artifactID):
            browseTermDict[artifactID] = []
        tup = (browseTerm.browseTermID, browseTerm.name)
        browseTermDict[artifactID].append(tup)
    return browseTermDict

def _getArtifactFoundationGridDict(session, artifactIDList):
    return _getArtifactRelatedDomainsDict(session, artifactIDList)
    #return _getArtifactBrowseTermsDictByType(session, artifactIDList, 'domain')

def _getArtifactGradeGridDict(session, artifactIDList):
    return _getArtifactBrowseTermsDictByType(session, artifactIDList, 'grade level')

def _getArtifactStateGridDict(session, artifactIDList):
    return _getArtifactBrowseTermsDictByType(session, artifactIDList, 'state')

def _getArtifactSubjectGridDict(session, artifactIDList):
    return _getArtifactBrowseTermsDictByType(session, artifactIDList, 'subject')

def _getArtifactTagGridDict(session, artifactIDList):
    tagTerms = _getArtifactTagTerms(session, artifactIDList)
    tagTermDict = {}
    for tagTerm in tagTerms:
        if not tagTermDict.has_key(tagTerm.id):
            tagTermDict[tagTerm.id] = []
        tup = (tagTerm.tagTermID, tagTerm.name)
        tagTermDict[tagTerm.id].append(tup)
    return tagTermDict

def _getArtifactSearchGridDict(session, artifactIDList):
    searchTerms = _getArtifactSearchTerms(session, artifactIDList)
    searchTermDict = {}
    for searchTerm in searchTerms:
        if not searchTermDict.has_key(searchTerm.id):
            searchTermDict[searchTerm.id] = []
        tup = (searchTerm.searchTermID, searchTerm.name)
        searchTermDict[searchTerm.id].append(tup)
    return searchTermDict

@_transactional(readOnly=True)
def getResourceInfo(session, revisionIDList):
    return _getResourceInfo(session, revisionIDList)

def _getResourceInfo(session, revisionIDList):
    return model.getResourceInfo(session, revisionIDList)

@_transactional(readOnly=True)
def getArtifactIDsForRevisionIDs(session, revisionIDs):
    return _getArtifactIDsForRevisionIDs(session, revisionIDs)

def _getArtifactIDsForRevisionIDs(session, revisionIDs):
    if not revisionIDs:
        return None
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.id.in_(revisionIDs))
    rows = {}
    artifactIDs = []
    ## Make sure we return artifact ids in the same order as revisionIDs
    for r in query.all():
        rows[r.id] = r.artifactID
    for rid in revisionIDs:
        artifactIDs.append(rows[rid])
    return artifactIDs

def _getArtifactDictByID(session, artifactID, artifact=None, extendedArtifacts=True, relatedArtifacts=False):
    try:
        id = long(artifactID)
    except ValueError:
        raise Exception('invalid artifactID received')
    except TypeError:
        raise Exception('Unknown type of object received as artifactID')

    if not artifact:
        artifact = _getArtifactByID(session, id)

    if artifact :
        foundationGridDict = _getArtifactFoundationGridDict(session, [id])
        tagGridDict = _getArtifactTagGridDict(session, [id])
        gradeGridDict = _getArtifactGradeGridDict(session, [id])
        stateGridDict = _getArtifactStateGridDict(session, [id])
        subjectGridDict = _getArtifactSubjectGridDict(session, [id])
        searchGridDict = _getArtifactSearchGridDict(session, [id])

        aDict = artifact.asDict(foundationGrid=foundationGridDict[artifact.id] if foundationGridDict.has_key(artifact.id) else [],
                                tagGrid=tagGridDict[artifact.id] if tagGridDict.has_key(artifact.id) else [],
                                gradeGrid=gradeGridDict[artifact.id] if gradeGridDict.has_key(artifact.id) else [],
                                stateGrid=stateGridDict[artifact.id] if stateGridDict.has_key(artifact.id) else [],
                                subjectGrid=subjectGridDict[artifact.id] if subjectGridDict.has_key(artifact.id) else [],
                                searchGrid=searchGridDict[artifact.id] if searchGridDict.has_key(artifact.id) else [],
                                includeRevisions=False
                                )

        domainGrid = artifact.getFoundationGrid()
        aDict['extendedArtifacts'] = _getExtendedArtifacts(session, artifact=artifact)
        if relatedArtifacts and artifact.type.name in ['concept', 'lesson'] and domainGrid:
            related = _getRelatedArtifactsForDomains(session, domainIDs=[domainGrid[0][0]], typeIDs=[artifact.artifactTypeID], levels=None, sequence=None, 
                    excludeIDs=[artifact.id], ownedBy='ck12')
            if related.getTotal():
                relatedIDs = [ int(x.id) for x in related ]
                relatedRIDs = [ int(x.artifactRevisionID) for x in related ]
                aDict['relatedArtifacts'] = { 'artifactList': _getArtifactsDictByIDs(session, relatedIDs, revisionIDs=relatedRIDs, includeContent=False, excludeChildren=True)}
        ## When the member last read this artifact, revision in his library, favourites & stuff - Since there is no memberID - return Nones
        aDict['lastRead'] = None
        aDict['revisionInLibrary'] = None

        ## Vocabulary
        vlangs = _getVocabularyLanguagesForArtifact(session, artifactID=id)
        if vlangs:
            aDict['vocabulary'] = []
            for vl in vlangs:
                aDict['vocabulary'].append({'languageCode': vl.languageCode, 'languageName': vl.languageName})
        #
        #  Contribution type.
        #
        if hasattr(artifact, 'contributionType'):
            contributionType = artifact.contributionType
        else:
            contributionType = _getArtifactContributionType(session, artifact.id)
        log.debug('_getArtifactsDictByIDs: id[%s] contributionType[%s]' % (artifact.id, contributionType))
        if contributionType:
            aDict['contributionType'] = contributionType.typeName
            log.info('_getArtifactsDictByIDs: contributionType.typeName[%s]' % contributionType.typeName)
        #
        #  Ancestor information.
        #
        log.debug('_getArtifactDictByID: id[%s] artifact.ancestorID[%s]' % (artifact.id, artifact.ancestorID))
        if artifact.ancestorID:
            if hasattr(artifact, 'ancestor'):
                ancestorRev = artifact.ancestor
            else:
                ancestorRev = _getArtifactRevisionByID(session, artifact.ancestorID)
            log.info('_getArtifactDictByID: ancestorRev[%s]' % ancestorRev)
            if ancestorRev:
                if not hasattr(ancestorRev, 'artifact'):
                    ancestorRev.artifact = _getArtifactByID(session, ancestorRev.artifactID)
                ancestor = ancestorRev.artifact
                log.debug('_getArtifactDictByID: ancestor[%s]' % ancestor)
                aDict['ancestor'] = {
                    'artifactRevisionID': ancestorRev.id,
                    'artifactID': ancestor.id,
                    'title': ancestor.name,
                    'handle': ancestor.handle,
                }
                log.debug('_getArtifactDictByID: aDict.ancestor[%s]' % aDict['ancestor'])

        log.debug("ID: %s Type: %s Title: %s" % (aDict['id'], aDict['artifactType'], aDict['title']))
        return aDict
    else:
        raise Exception('Artifact with the given id couldnot be found in the database')

@_transactional(readOnly=True)
def getArtifactDictByID(session, artifactID, artifact=None, extendedArtifacts=True, relatedArtifacts=False):
    return _getArtifactDictByID(session, artifactID, artifact, extendedArtifacts, relatedArtifacts)

def _getArtifactRevisionDictByID(session, revisionID, revision=None):
    try:
        revisionID = long(revisionID)
    except ValueError:
        raise Exception('invalid revisionID received')
    except TypeError:
        raise Exception('Unknown type of object received as revisionID')

    if not revision :
        revision = _getArtifactRevisionByID(session, id=revisionID)

    if revision :
        parentDict = _getArtifactRevisionParents(session, [revisionID])
        levels = 0
        childDict = model.getChildDict(session, [revisionID])
        levels = 1
        resourceRevisionDict = model.getResourceInfo(session, [revisionID])
        resourceInfo = resourceRevisionDict[revision.id] if resourceRevisionDict.has_key(revision.id) else None
        revisionDict = revision.asDict(levels=levels,
                                resourceInfo=resourceInfo,
                                childList=childDict[revision.id] if childDict.has_key(revision.id) else [],
                                parentList=parentDict[revision.id] if parentDict.has_key(revision.id) else [])
        rDict = {}

        standardDict = _getStandards(session, [revisionID])
        rDict['revisions'] = [revisionDict]
        rDict['standardGrid'] = standardDict[revision.id] if standardDict.has_key(revision.id) else {}
        rDict['artifactRevisionID'] = revision.id
        rDict['revision'] = revision.revision

        coverImage = revision.getCoverImageUri(resourceInfo=resourceInfo)
        coverImageSatelliteUri = revision.getCoverImageSatelliteUri()
        if coverImage is not None:
            rDict['coverImage'] = coverImage
        if coverImageSatelliteUri is not None:
            rDict['coverImageSatelliteUrl'] = coverImageSatelliteUri

        rDict = revision.asContentDict(revisionDict=rDict,
                                       resourceInfo=resourceInfo,
                                       includeChildContent=revision.artifact.type.name == 'lesson')
    else :
        raise Exception('Revision with the given id couldnot be found in the database')

    return rDict

@_transactional(readOnly=True)
def getArtifactRevisionDictByID(session, revisionID, revision=None):
    return _getArtifactRevisionDictByID(session, revisionID, revision)

def _startTime():
    return datetime.now()

def _endTime(start):
    return datetime.now() - start

def _getArtifactsDictByIDs(session,
                           artifactIDList,
                           revisionIDs=None,
                           artifacts=None,
                           memberID=None,
                           includeContent=False,
                           orderList=None,
                           excludeChildren=False,
                           extendedArtifacts=False,
                           relatedArtifacts=False,
                           relatedModalities=False,
                           domainID=None):
    mstart = start = _startTime()
    log.info('_getArtifactsDictByIDs: artifactIDList%s' % artifactIDList)
    if revisionIDs and artifactIDList is None:
        artifactIDList = _getArtifactIDsForRevisionIDs(session, revisionIDs)
        log.info("artifactIDList: %s" % str(artifactIDList))
        orderList = artifactIDList[:]
    if not artifactIDList:
        return []
    if revisionIDs is not None and len(artifactIDList) != len(revisionIDs):
        raise ex.InvalidArgumentException((_(u'revisionIDs should be the same length as artifactIDList.')).encode("utf-8"))

    if artifacts is None or len(artifacts) == 0:
        artifacts = _getArtifactsByIDs(session, artifactIDList)
        ## Make sure order is the same as what we sent in
        artifacts = sorted(artifacts, cmp=lambda x,y: cmp(artifactIDList.index(x.id), artifactIDList.index(y.id)))
    log.info('_getArtifactsDictByIDs: retrieve artifacts took[%s]' % _endTime(start))
    start = _startTime()
    if not includeContent:
        foundationGridDict = {}
        tagGridDict = {}
        gradeGridDict = {}
        stateGridDict = {}
        subjectGridDict = {}
        searchGridDict = {}
    else:
        foundationGridDict = _getArtifactFoundationGridDict(session, artifactIDList)
        tagGridDict = _getArtifactTagGridDict(session, artifactIDList)
        gradeGridDict = _getArtifactGradeGridDict(session, artifactIDList)
        stateGridDict = _getArtifactStateGridDict(session, artifactIDList)
        subjectGridDict = _getArtifactSubjectGridDict(session, artifactIDList)
        searchGridDict = _getArtifactSearchGridDict(session, artifactIDList)
    log.info('_getArtifactsDictByIDs: content related took[%s]' % _endTime(start))
    start = _startTime()
    revisions = _getArtifactRevisionsFromArtifacts(session, artifactIDList)
    revisionDict = {}
    revisionIDList = []
    for revision in revisions:
        if not revisionDict.has_key(revision.artifactID):
            revisionDict[revision.artifactID] = []
        revisionDict[revision.artifactID].append(revision)
        revisionIDList.append(revision.id)
    log.info('_getArtifactsDictByIDs: get revisions took[%s]' % _endTime(start))
    parentDict = {} # _getArtifactRevisionParents(session, revisionIDList)
    childDict = {}
    levels = 0
    if not excludeChildren:
        start = _startTime()
        childDict = model.getChildDict(session, revisionIDList)
        levels = 1
        log.info('_getArtifactsDictByIDs: get childild took[%s]' % _endTime(start))
    feedbackDict = {} # _getFeedbacks(session, revisionIDList)
    start = _startTime()
    if not includeContent:
        standardDict = {}
    else:
        standardDict = _getStandards(session, revisionIDList)
        levels = 1
    log.info('_getArtifactsDictByIDs: get standards took[%s]' % _endTime(start))
    start = _startTime()
    resourceRevisionDict = model.getResourceInfo(session, revisionIDList)
    log.info('_getArtifactsDictByIDs: getResourceInfo took[%s]' % _endTime(start))
    """
    featuredDict = {}
    featuredList = _getFeaturedArtifactsByIDs(session, artifactIDList)
    for featured in featuredList:
        featuredDict[featured.artifactID] = featured
    """
    artifactDicts = []
    aIdx = 0
    for artifact in artifacts:
        start = _startTime()
        revisions = revisionDict[artifact.id]
        if not revisionIDs or not revisionIDs[aIdx]:
            revision = revisions[0]
        else:
            for revision in revisions:
                if revision.id == revisionIDs[aIdx]:
                    revision.artifact = artifact
                    break
        log.info('_getArtifactsDictByIDs: setup revisions took[%s]' % _endTime(start))
        start = _startTime()
        resourceInfo=resourceRevisionDict[revision.id] if resourceRevisionDict.has_key(revision.id) else None
        log.info('_getArtifactsDictByIDs: setup resource revision dict took[%s]' % _endTime(start))
        start = _startTime()
        aDict = artifact.asDict(revisions=revisions,
                                revision=revision,
                                levels=levels,
                                feedbacks=feedbackDict[revision.id] if feedbackDict.has_key(revision.id) else [],
                                standardGrid=standardDict[revision.id] if standardDict.has_key(revision.id) else {},
                                foundationGrid=foundationGridDict[artifact.id] if foundationGridDict.has_key(artifact.id) else [],
                                tagGrid=tagGridDict[artifact.id] if tagGridDict.has_key(artifact.id) else [],
                                gradeGrid=gradeGridDict[artifact.id] if gradeGridDict.has_key(artifact.id) else [],
                                stateGrid=stateGridDict[artifact.id] if stateGridDict.has_key(artifact.id) else [],
                                subjectGrid=subjectGridDict[artifact.id] if subjectGridDict.has_key(artifact.id) else [],
                                searchGrid=searchGridDict[artifact.id] if searchGridDict.has_key(artifact.id) else [],
                                resourceInfo=resourceInfo,
                                childList=childDict[revision.id] if childDict.has_key(revision.id) else [],
                                parentList=parentDict[revision.id] if parentDict.has_key(revision.id) else [],
                                memberID=memberID)
        log.info('_getArtifactsDictByIDs: artifact.asDict took[%s]' % _endTime(start))
        if includeContent:
            start = _startTime()
            aDict = artifact.asContentDict(artifactDict=aDict,
                                           revision=revision,
                                           memberID=memberID,
                                           resourceInfo=resourceInfo,
                                           includeChildContent=artifact.type.name == 'lesson')
            log.info('_getArtifactsDictByIDs: artifact.asContentDict took[%s]' % _endTime(start))
        if extendedArtifacts:
            start = _startTime()
            aDict['extendedArtifacts'] = _getExtendedArtifacts(session, artifact=artifact)
            log.info('_getArtifactsDictByIDs: getExtendedArtifacts took[%s]' % _endTime(start))
        if relatedArtifacts and artifact.type.name in ['concept', 'lesson'] and domainID:
            start = _startTime()
            related = _getRelatedArtifactsForDomains(session, domainIDs=[domainID], typeIDs=[artifact.artifactTypeID], levels=None, sequence=None, excludeIDs=[artifact.id], 
                    memberID=memberID, ownedBy='ck12')
            if related.getTotal():
                relatedIDs = [ int(x.id) for x in related ]
                relatedRIDs = [ int(x.artifactRevisionID) for x in related ]
                aDict['relatedArtifacts'] = {
                        'artifactList': _getArtifactsDictByIDs(session, relatedIDs, revisionIDs=relatedRIDs, memberID=memberID, includeContent=False, excludeChildren=True)
                }
            log.info('_getArtifactsDictByIDs: _getRelatedArtifacts took[%s]' % _endTime(start))
        log.info("relatedModalities: %s, domainID: %s" % (relatedModalities, domainID))
        if relatedModalities and artifact.type.modality and domainID:
            start = _startTime()
            related = _getRelatedArtifactsForDomains(session, domainIDs=[domainID], typeIDs=None, levels=None, sequence=None, excludeIDs=[artifact.id], memberID=memberID)
            log.info('_getArtifactsDictByIDs: _getRelatedArtifactsForDomains took[%s]' % _endTime(start))
            if related.getTotal():
                start = _startTime()
                relatedIDs = [ int(x.id) for x in related ]
                relatedRIDs = [ int(x.artifactRevisionID) for x in related ]
                aDict['relatedModalities'] = _getArtifactsDictByIDs(session, relatedIDs, revisionIDs=relatedRIDs, memberID=memberID, includeContent=False, excludeChildren=True)
                log.info('_getArtifactsDictByIDs: _getArtifactsDictByIDs for related took[%s]' % _endTime(start))
        aDict['latestRevisionID'] = revisions[0].id
        aDict['latestRevision'] = revisions[0].revision
        ## When the member last read this artifact
        lastViewTime = None
        revisionInLibrary = None
        if memberID:
            start = _startTime()
            lastRead = _getMemberViewedArtifact(session, memberID, artifact.id)
            if lastRead:
                lastViewTime = str(lastRead.lastViewTime)
            log.info('_getArtifactsDictByIDs: _getMemberViewedArtifact took[%s]' % _endTime(start))
            start = _startTime()
            libObj = _getMemberLibraryObjectByParentID(session, objectType='artifactRevision', parentID=artifact.id, memberID=memberID)
            revisionInLibrary = libObj.objectID if libObj else None
            log.info('_getArtifactsDictByIDs: _getMemberLibraryObjectByParentID took[%s]' % _endTime(start))

        aDict['lastRead'] = lastViewTime
        aDict['revisionInLibrary'] = revisionInLibrary

        start = _startTime()
        for n in range(0, len(revisions)):
            revision = revisions[n]
            if revision.id == aDict['revisions'][0]['id']:
                ## Only compute favorite if we are looking at the ONE revision we are
                ## going to return
                log.info("Member: %s revision: %s" % (memberID, revision.id))
                if memberID is None:
                    isFavorite = False
                else:
                    favorite = _getFavorite(session, revision.id, memberID)
                    isFavorite = favorite is not None
                aDict['revisions'][0]['isFavorite'] = isFavorite
                addedToLibrary = None
                labels = []
                if memberID:
                    libObj = _getMemberLibraryArtifactRevision(session, memberID, revision.id)
                    if libObj:
                        addedToLibrary = str(libObj.added)
                        labelObjs = _getLabelsForMemberLibraryObject(session, libraryObjectID=libObj.id)
                        for l in labelObjs:
                            labels.append({'label': l.label, 'systemLabel': l.systemLabel })

                aDict['revisions'][0]['addedToLibrary'] = addedToLibrary
                aDict['revisions'][0]['labels'] = labels
        log.info('_getArtifactsDictByIDs: update on dict of revisions took[%s]' % _endTime(start))
        """
        if featuredDict.has_key(artifact.id):
            featured = featuredDict[artifact.id]
            aDict['featured'] = featured.listOrder
        """
        ## Vocabulary
        start = _startTime()
        vlangs = _getVocabularyLanguagesForArtifact(session, artifactID=artifact.id)
        if vlangs:
            aDict['vocabulary'] = []
            for vl in vlangs:
                aDict['vocabulary'].append({'languageCode': vl.languageCode, 'languageName': vl.languageName})
        log.info('_getArtifactsDictByIDs: _getVocabularyLanguagesForArtifact took[%s]' % _endTime(start))
        #
        #  Contribution type.
        #
        if hasattr(artifact, 'contributionType'):
            contributionType = artifact.contributionType
        else:
            contributionType = _getArtifactContributionType(session, artifact.id)
        log.debug('_getArtifactsDictByIDs: id[%s] contributionType[%s]' % (artifact.id, contributionType))
        if contributionType:
            aDict['contributionType'] = contributionType.typeName
            log.debug('_getArtifactsDictByIDs: contributionType.typeName[%s]' % contributionType.typeName)
        #
        #  Ancestor information.
        #
        log.debug('_getArtifactsDictByIDs: id[%s] artifact.ancestorID[%s]' % (artifact.id, artifact.ancestorID))
        if artifact.ancestorID:
            if hasattr(artifact, 'ancestor'):
                ancestorRev = artifact.ancestor
            else:
                ancestorRev = _getArtifactRevisionByID(session, artifact.ancestorID)
            log.debug('_getArtifactsDictByIDs: ancestorRev[%s]' % ancestorRev)
            if ancestorRev:
                if not hasattr(ancestorRev, 'artifact'):
                    ancestorRev.artifact = _getArtifactByID(session, ancestorRev.artifactID)
                ancestor = ancestorRev.artifact
                log.debug('_getArtifactsDictByIDs: ancestor[%s]' % ancestor)
                aDict['ancestor'] = {
                    'artifactRevisionID': ancestorRev.id,
                    'artifactID': ancestor.id,
                    'title': ancestor.name,
                    'handle': ancestor.handle,
                }
                log.debug('_getArtifactsDictByIDs: aDict.ancestor[%s]' % aDict['ancestor'])
        artifactDicts.append(aDict)
        aIdx += 1
        log.info("ID: %s Type: %s Title: %s" % (artifactDicts[-1]['id'], artifactDicts[-1]['artifactType'], artifactDicts[-1]['title']))

    if orderList:
        ## Sort the artifacts by original list
        start = _startTime()
        artifactDicts = _orderBy(session, orderList, artifactDicts, 'id')
        log.info('_getArtifactsDictByIDs: _orderBy took[%s]' % _endTime(start))

    log.info('_getArtifactsDictByIDs: took[%s]' % _endTime(mstart))
    return artifactDicts

@_transactional(readOnly=True)
def getArtifactsDictByIDs(session,
                          idList,
                          revisionIDs=None,
                          artifacts=None,
                          memberID=None,
                          includeContent=False,
                          orderList=None,
                          excludeChildren=False,
                          extendedArtifacts=False,
                          relatedArtifacts=False,
                          relatedModalities=False,
                          domainID=None):
    return _getArtifactsDictByIDs(session,
                                  idList,
                                  revisionIDs,
                                  artifacts,
                                  memberID,
                                  includeContent,
                                  orderList=orderList,
                                  excludeChildren=excludeChildren,
                                  extendedArtifacts=extendedArtifacts,
                                  relatedArtifacts=relatedArtifacts,
                                  relatedModalities=relatedModalities,
                                  domainID=domainID)

def _getArtifactsByIDs(session, idList, pageNum=0, pageSize=0):
    """
        Returns a list of artifacts with given identifiers
    """
    if idList is None or len(idList) == 0:
        return []

    log.debug("idList: %d" % len(idList))
    query = session.query(model.Artifact).distinct()
    query = query.filter(model.Artifact.id.in_(idList))
    page = p.Page(query, pageNum, pageSize)
    log.debug("artifacts: %d" % len(page))
    return page

@_transactional(readOnly=True)
def getArtifactsByIDs(session, idList, pageNum=0, pageSize=0):
    """
        Returns a list of artifacts with given identifiers
    """
    return _getArtifactsByIDs(session, idList, pageNum, pageSize)

@_transactional(readOnly=True)
def getArtifactAncestorID(session, artifactID):
    query = session.query(model.Artifact.ancestorID)
    query = query.filter_by(id = artifactID)
    r = query.first()
    if not r:
        return None

    return r.ancestorID

@_transactional(readOnly=True)
def getDescendantArtifactRevisionBySequence(session, artifactRevision, sequenceList):
    return _getDescendantArtifactRevisionBySequence(session, artifactRevision, sequenceList)

def _getDescendantArtifactRevisionBySequence(session, artifactRevision, sequenceList):
    """
        Get artifactRevision for a descendant of an ancestor artifactRevision given a sequence number list
    """
    ars = [artifactRevision]
    ar = artifactRevision
    for seq in sequenceList:
        if seq == 0:
            break
        ar = _getArtifactChildBySequence(session, ar, seq)
        ars.append(ar)
    log.debug("Returning rev: %d, id: %d" % (ars[-1].id, ars[-1].artifactID))
    return ars

def _getArtifactChildBySequence(session, artifactRevision, sequence):
    """
        Get a child artifact given parent artifactRevision and sequence number
    """
    query = session.query(model.ArtifactRevisionRelation)
    query = query.filter_by(artifactRevisionID = artifactRevision.id)
    query = query.filter_by(sequence = sequence)
    row = query.first()
    if not row:
        raise Exception((_(u"Invalid child sequence: %(sequence)s for %(artifactRevision.id)d")  % {"sequence":sequence,"artifactRevision.id": artifactRevision.id}).encode("utf-8"))
    return row.child

@_transactional(readOnly=True)
def getNeighboringArtifactsSequenceBySequence(session, artifactRevision, sequenceList, descType='artifact', memberID=None):
    """
        Get the previous and next artifacts (of a given type 'descType') for the given ancestor artifactRevision
        The artifactRevision is typically a book revision and we return the previous and next for the artifact
        which is a descendants of artifactRevision identified by the sequenceList
    """
    ret = { 'prev': None, 'next': None, 'prev-artifact': None, 'next-artifact': None }
    next = sequenceList[:]
    prev = sequenceList[:]
    if not artifactRevision.artifact:
        artifactRevision = _getUnique(session, model.ArtifactRevision, 'id', artifactRevision.id)
    currentArtifactRevision = artifactRevision
    childLists = []
    log.debug("Original sequenceList: %s" % sequenceList)
    for seq in sequenceList:
        if currentArtifactRevision.artifact.type.name in ('lesson', 'section', 'chapter', 'book', 'tebook', 'textbook', 'quizbook', 'workbook', 'labkit', 'studyguide'):
            childLists.append((currentArtifactRevision.artifact.type.name, currentArtifactRevision.children))
            if seq >= 1 and seq <= len(currentArtifactRevision.children):
                currentArtifactRevision = currentArtifactRevision.children[seq-1].child
            elif seq == 0:
                break
            else:
                raise Exception((_(u"Invalid sequenceList received: %(sequenceList)s for %(artifactRevision.id)d")  % {"sequenceList":sequenceList, "artifactRevision.id": artifactRevision.id}).encode("utf-8"))
        else:
            raise Exception((_(u"Invalid artifactType : %(artifactType)s encountered while processing sequenceList : %(sequenceList)s for %(artifactRevision.id)d")  % {"artifactType":currentArtifactRevision.artifact.type.name, "sequenceList":sequenceList, "artifactRevision.id": artifactRevision.id}).encode("utf-8"))

    if not (len(sequenceList) == len(childLists) or len(sequenceList)+1 == len(childLists)):
        raise Exception((_(u"Invalid sequenceList received: %(sequenceList)s for %(artifactRevision.id)d")  % {"sequenceList":sequenceList, "artifactRevision.id": artifactRevision.id}).encode("utf-8"))


    ## Compute next - valid seq values by this step would be 0 or 1 to len(children) at that step
    enumeratedSequenceList = list(enumerate(sequenceList))
    for index, seq in reversed(enumeratedSequenceList):
        if childLists[index][0] in ('lesson', 'section') :
            next = next[:index]
        elif childLists[index][0] == 'chapter':
            if seq < len(childLists[index][1]):
                next[index] = next[index] + 1
                break
            else:
                next = next[:index]
        elif childLists[index][0] in ('book', 'tebook', 'textbook', 'quizbook', 'workbook', 'labkit', 'studyguide'):
            nextChildSequenceNumber = seq
            nextChildAdded = False

            while not nextChildAdded and nextChildSequenceNumber < len(childLists[index][1]):
                if childLists[index][1][nextChildSequenceNumber].child.artifact.type.name in ('lesson', 'section'):
                    next[index] = nextChildSequenceNumber+1
                    next.append(0)
                    nextChildAdded = True
                elif childLists[index][1][nextChildSequenceNumber].child.artifact.type.name == 'chapter' and len(childLists[index][1][nextChildSequenceNumber].child.children) > 0:
                    next[index] = nextChildSequenceNumber+1
                    next.append(1)
                    nextChildAdded = True
                else:
                    nextChildSequenceNumber = nextChildSequenceNumber+1

            if nextChildAdded:
                break
            else:
                next = next[:index]
        else:
            next = next[:index]

    ## Compute previous - valid seq values by this step would be 0 or 1 - len(children) at that step
    enumeratedSequenceList = list(enumerate(sequenceList))
    for index, seq in reversed(enumeratedSequenceList):
        if childLists[index][0] in ('lesson', 'section') :
            prev = prev[:index]
        elif childLists[index][0] == 'chapter':
            if seq > 1:
                prev[index] = prev[index] - 1
                break
            else:
                prev = prev[:index]
        elif childLists[index][0] in ('book', 'tebook', 'textbook', 'quizbook', 'workbook', 'labkit', 'studyguide'):
            prevChildSequenceNumber = seq
            prevChildAdded = False

            while not prevChildAdded and prevChildSequenceNumber > 1:
                if childLists[index][1][prevChildSequenceNumber-2].child.artifact.type.name in ('lesson', 'section'):
                    prev[index] = prevChildSequenceNumber-1
                    prev.append(0)
                    prevChildAdded = True
                elif childLists[index][1][prevChildSequenceNumber-2].child.artifact.type.name == 'chapter' and len(childLists[index][1][prevChildSequenceNumber-2].child.children) > 0:
                    prev[index] = prevChildSequenceNumber-1
                    prev.append(len(childLists[index][1][prevChildSequenceNumber-2].child.children))
                    prevChildAdded = True
                else:
                    prevChildSequenceNumber = prevChildSequenceNumber-1

            if prevChildAdded:
                break
            else:
                prev = prev[:index]
        else:
            prev = prev[:index]

    ret['prev'] = prev
    ret['next'] = next
    if prev :
        prevArtifactRevision = _getDescendantArtifactRevisionBySequence(session, artifactRevision, prev)[-1]
        if prevArtifactRevision:
            prevArtifactRevision = _getRelatedArtifactRevision(session, prevArtifactRevision, 'artifact')
            ret['prev-artifact'] = [ prevArtifactRevision.artifactID, prevArtifactRevision.id ]
            if descType == 'all':
                if artifactRevision.artifact.type.name == 'lesson' and descType == 'concept':
                    prevArtifactRevision = _getRelatedArtifactRevision(session, prevArtifactRevision, descType)
                    ret['prev-%s' % descType] = [ prevArtifactRevision.artifactID, prevArtifactRevision.id ]
                if artifactRevision.artifact.type.name == 'concept' and descType == 'lesson':
                    prevArtifactRevision = _getRelatedArtifactRevision(session, prevArtifactRevision, descType)
                    ret['prev-%s' % descType] = [ prevArtifactRevision.artifactID, prevArtifactRevision.id ]
    if next :
        nextArtifactRevision = _getDescendantArtifactRevisionBySequence(session, artifactRevision, next)[-1]
        if nextArtifactRevision:
            nextArtifactRevision = _getRelatedArtifactRevision(session, nextArtifactRevision, 'artifact')
            ret['next-artifact'] = [ nextArtifactRevision.artifactID, nextArtifactRevision.id ]
            if descType == 'all':
                if artifactRevision.artifact.type.name == 'lesson' and descType == 'concept':
                    nextArtifactRevision = _getRelatedArtifactRevision(session, nextArtifactRevision, descType)
                    ret['next-%s' % descType] = [ nextArtifactRevision.artifactID, nextArtifactRevision.id ]
                if artifactRevision.artifact.type.name == 'concept' and descType == 'lesson':
                    nextArtifactRevision = _getRelatedArtifactRevision(session, nextArtifactRevision, descType)
                    ret['next-%s' % descType] = [ nextArtifactRevision.artifactID, nextArtifactRevision.id ]

    return ret

@_transactional(readOnly=True)
def getExtendedArtifacts(session, artifact, memberID=None, artifactTypes=None, countOnly=False):
    return _getExtendedArtifacts(session, artifact, memberID, artifactTypes, countOnly)

def _getExtendedArtifacts(session, artifact, memberID=None, artifactTypes=None, countOnly=False):
    ## Get extended resources (tebook, workbook, etc.)
    typesDict = {
            'tebook': 'tebook',
            'book': 'book',
            'workbook': 'workbook',
            'studyguide': 'studyguide',
            'labkit': 'labkit',
            'quizbook': 'quizbook',
            'testbook': 'testbook',
            }
    ## If artifactTypes are specified, build a dict
    if artifactTypes and not 'artifact' in artifactTypes:
        typesDict = {}
        for atype in artifactTypes:
            typesDict[atype] = atype

    ## Always exclude the given artifact's type
    if typesDict.has_key(artifact.type.name):
        del typesDict[artifact.type.name]

    if countOnly:
        return _getRelatedArtifactsByTypes(session, artifact, typeNames=typesDict.keys(), countOnly=True)

    relatedDict = {}
    relatedIDs = []
    related = _getRelatedArtifactsByTypes(session, artifact, typeNames=typesDict.keys(), countOnly=False)
    if related:
        for relatedArt in related:
            relatedIDs.append(relatedArt.id)
        related = _getArtifactsDictByIDs(session, artifactIDList=relatedIDs, artifacts=related, memberID=memberID, excludeChildren=True, extendedArtifacts=False)
        for r in related:
            if not relatedDict.has_key(r['artifactType']):
                relatedDict[r['artifactType']] = []
            relatedDict[r['artifactType']].append(r)

    log.debug("relatedDict: %s" % relatedDict)
    return relatedDict

@_transactional(readOnly=True)
def getRelatedArtifactRevision(session, artifactRevision, descType):
    """
        Get related artifactRevision for a given artifactRevision.
        Gets related concept for a lesson or vice versa
    """

    return _getRelatedArtifactRevision(session, artifactRevision, descType)

def _getRelatedArtifactRevision(session, artifactRevision, descType):
    if not descType or descType == 'artifact':
        return artifactRevision
    if artifactRevision.artifact.type.name == 'lesson' and descType == 'concept':
        return artifactRevision.children[0].child
    if artifactRevision.artifact.type.name == 'concept' and descType == 'lesson':
        return artifactRevision.parents[0].parent
    return artifactRevision

@_transactional(readOnly=True)
def getRelatedArtifactsByTypesCount(session, artifactID, typeNames=None):
    artifact = _getUnique(session, model.Artifact, 'id', artifactID)
    if not artifact:
        raise Exception((_(u"Error getting artifact for id: %(artifactID)d")  % {"artifactID":artifactID}).encode("utf-8"))
    return _getRelatedArtifactsByTypes(session, artifact, typeNames=typeNames, countOnly=True)

@_transactional(readOnly=True)
def getRelatedArtifactsByTypes(session, artifactID, typeNames=None):
    artifact = _getUnique(session, model.Artifact, 'id', artifactID)
    if not artifact:
        raise Exception((_(u"Error getting artifact for id: %(artifactID)d")  % {"artifactID":artifactID}).encode("utf-8"))
    return _getRelatedArtifactsByTypes(session, artifact, typeNames=typeNames)

def _getRelatedArtifactsByTypes(session, artifact, typeNames=None, countOnly=False):
    typesDict = {
            'book': '.SE.',
            'tebook': '.TE.',
            'workbook': '.WB.',
            'lesson': '.L.',
            'concept': '.C.',
            'studyguide': '.SG.',
            'labkit': '.LK.',
            'quizbook': '.QB.',
            'testbook': '.TB.',
            }
    if not typeNames:
        typeNames = typesDict.keys()

    encodedIDs = []
    if artifact.encodedID:
        myTypeEncode = typesDict.get(artifact.type.name)
        if myTypeEncode and myTypeEncode in artifact.encodedID:
            log.info("EncodedID: %s, myTypeEncode: %s" % (artifact.encodedID, myTypeEncode))
            for typeName in typeNames:
                encodedIDs.append(artifact.encodedID.replace(myTypeEncode, typesDict.get(typeName.lower(), '')))

    if encodedIDs:
        query = session.query(model.Artifact)
        query = query.filter(model.Artifact.encodedID.in_(encodedIDs))
        if countOnly:
            rows = query.count()
        else:
            rows = query.all()
        return rows

    if countOnly:
        return 0
    return None

@_transactional(readOnly=True)
def getNextArtifactByID(session, id, typeName, ancestorRevisions=[], memberID=None):
    """
        Get the next artifact of a given type for a given parent
    """
    if not typeName:
        typeName = 'artifact'

    next = nextChapter = None
    next = _getNeighboringArtifactByID(session, id, typeName, True, ancestorRevisions)
    if next:
        next =  _getArtifactsDictByIDs(session, [ next.id ], artifacts=[ next ], memberID=memberID)[0]
        if typeName != 'chapter':
            nextChapter = _getAncestorChapterDict(session, ancestorRevisions=ancestorRevisions, memberID=memberID)
        else:
            nextChapter = next
    return next, nextChapter

@_transactional(readOnly=True)
def getPreviousArtifactByID(session, id, typeName, ancestorRevisions=[], memberID=None):
    """
        Get the next artifact of a given type for a given parent
    """
    if not typeName:
        typeName = 'artifact'

    previous = previousChapter = None
    previous = _getNeighboringArtifactByID(session, id, typeName, False, ancestorRevisions)
    if previous:
        previous = _getArtifactsDictByIDs(session, [ previous.id ], artifacts=[ previous ], memberID=memberID)[0]
        if typeName != 'chapter':
            previousChapter = _getAncestorChapterDict(session, ancestorRevisions=ancestorRevisions, memberID=memberID)
        else:
            previousChapter = previous
    return previous, previousChapter

@_transactional(readOnly=True)
def getAncestorChapterDict(session, ancestorRevisions, memberID=None):
    return _getAncestorChapterDict(session, ancestorRevisions, memberID)

def _getAncestorChapterDict(session, ancestorRevisions, memberID=None):
    """
        Get the chapter type artifact from ancestorRevisions list and return in dict form
    """
    chapter = None
    for ancestorRevision in ancestorRevisions:
        if ancestorRevision.artifact.type.name == 'chapter':
            return _getArtifactsDictByIDs(session, [ ancestorRevision.artifactID ], revisionIDs=[ ancestorRevision.id ], artifacts=[ ancestorRevision.artifact ], memberID=memberID)[0]
    return chapter

def _getNeighboringArtifactByID(session, id, typeName, nextNeighbor=True, ancestorRevisions=[]):
    """
        Returns the next or previous artifact for a given artifact and its ancestors
    """
    try:
        id = long(id)
    except ValueError:
        return None

    if not typeName or typeName == 'artifact':
        typeName = None

    if not ancestorRevisions:
        ## If not ancestorRevisions are given, find them from the artifact id
        ## Assume latest revisions of everything
        ancestorRevisions = []
        artifact = _getUnique(session, model.Artifact, 'id', id)
        while artifact and artifact.revisions[0].parents and artifact.revisions[0].parents[0].parent:
            ancestorRevisions.append(artifact.revisions[0].parents[0].parent)
            artifact = artifact.revisions[0].parents[0].parent.artifact
    else:
        ## Convert ids to objects
        for i in range(0, len(ancestorRevisions)):
            if type(ancestorRevisions[i]) in [int, long]:
                ancestorRevisions[i] = _getArtifactRevisionByID(session, ancestorRevisions[i])

    next = nextArtifact = None

    query = session.query(model.ArtifactAndChildren)
    query = query.filter_by(childID=id)
    if ancestorRevisions:
        query = query.filter_by(id=ancestorRevisions[0].artifactID)
    row = query.first()
    if row:
        mySeq = row.sequence
        parentID = row.id
        log.debug("My sequence is: %d, my parent: %d" % (mySeq, parentID))
        while not next:
            query = session.query(model.ArtifactAndChildren)
            query = query.filter_by(id=parentID)
            if nextNeighbor:
                query = query.filter_by(sequence=mySeq+1)
            else:
                query = query.filter_by(sequence=mySeq-1)
            row = query.first()
            if row:
                next = row.childID
                log.debug("Found the next sibling in sequence: id: %d" % next)
            else:
                log.debug("Did not find next sibling in sequence for parentID: %d", parentID)
                query = session.query(model.ArtifactAndChildren)
                query = query.filter_by(childID=parentID)
                if len(ancestorRevisions) > 1 and ancestorRevisions[1]:
                    query = query.filter_by(id=ancestorRevisions[1].artifactID)
                row = query.first()
                id = parentID
                if row:
                    parentID = row.id
                    parentType = row.artifactTypeID
                    log.debug("Calling _getNeighboringArtifactByID for id: %d, parent: %d, parentTypeID: %d" % (id, parentID, parentType))
                    return _getNeighboringArtifactByID(session, id, typeName, nextNeighbor=nextNeighbor, ancestorRevisions=ancestorRevisions[1:] if len(ancestorRevisions) > 1 else [])
                else:
                    break
    else:
        log.debug("No such child %d" % id)

    if next:
        if type(next) == int or type(next) == long:
            log.debug("Getting artifact for %s" % next)
            nextArtifact = _getUnique(session, model.Artifact, 'id', next)
        else:
            nextArtifact = next

        ## Get children till we find the correct type
        while nextArtifact and typeName and nextArtifact.type.name != typeName:
            idx = 0
            if not nextNeighbor:
                idx = -1
            if nextArtifact.revisions[0].children:
                nextArtifact = nextArtifact.revisions[0].children[idx].child.artifact
                log.debug("Artifact type: %s, id: %d" % (nextArtifact.type.name, nextArtifact.id))
            else:
                log.debug("Calling _getNeighboringArtifactByID for id: %d" % nextArtifact.id)
                nextArtifact = _getNeighboringArtifactByID(session, nextArtifact.id, typeName, nextNeighbor=nextNeighbor, ancestorRevisions=ancestorRevisions[1:] if len(ancestorRevisions) > 1 else [])

    return nextArtifact

@_transactional(readOnly=True)
def getDerivedArtifacts(session, id, pageNum=0, pageSize=0):
    """
        Returns the list of artifacts derived from the given
        artifact id.
    """
    query = session.query(model.ArtifactRevision)
    query = query.filter_by(artifactID=id)
    ars = query.all()
    if len(ars) == 0:
        return []

    ids = []
    for ar in ars:
        ids.append(ar.id)
    query = session.query(model.Artifact)
    query = query.filter(model.Artifact.ancestorID.in_(ids))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getArtifactByID(session, id, typeName=None, creatorID=None):
    return _getArtifactByID(session, id, typeName, creatorID)

def _getArtifactByID(session, id, typeName=None, creatorID=None):
    """
        Return the Artifact that matches the given identifier.
    """
    if typeName == 'artifact':
        typeName = None
    try:
        id = long(id)
        query = session.query(model.Artifact)
        query = query.filter_by(id=id)
        if creatorID:
            query = query.filter(model.Artifact.creatorID == creatorID)
        artifact = _queryOne(query)
        if artifact and typeName and artifact.type.name != typeName:
            #
            #  Wrong type.
            #
            raise ex.WrongTypeException('Artifact %d is of type %s, not %s' % (id, artifact.type.name, typeName))

        return artifact
    except ValueError:
        return None

@_transactional(readOnly=True)
def getArtifactByHandle(session, handle, typeID, creatorID, lockMode=None):
    return _getArtifactByHandle(session, handle, typeID, creatorID, lockMode=lockMode)

def __setupHandleQuery(query, handle, typeID, creatorID):
    if handle is None:
        raise ex.InvalidArgumentException("Invalid handle: [None] received.")

    if len(handle) > 255:
        handle = handle[0:255]
    query = query.filter_by(handle=handle)
    query = query.filter_by(artifactTypeID=typeID)
    query = query.filter_by(creatorID=creatorID)
    return query

def _getArtifactByHandle(session, handle, typeID, creatorID, lockMode=None):
    """
        Return the Artifact that matches the given perma URL information.
    """
    query = session.query(model.Artifact)
    query = __setupHandleQuery(query, handle, typeID, creatorID)
    artifact = _queryOne(query, lockMode=lockMode)
    return artifact

@_transactional(readOnly=True)
def getArtifactAndRevisionByHandle(session, handle, typeID, creatorID, version=0, idOnly=False):
    if idOnly:
        query = session.query(model.ArtifactAndRevision.id, model.ArtifactAndRevision.artifactRevisionID)
    else:
        query = session.query(model.ArtifactAndRevision)
    query = __setupHandleQuery(query, handle, typeID, creatorID)
    if version == 0:
        query = query.order_by(desc(model.ArtifactAndRevision.artifactRevisionID))
    else:
        query = query.order_by(model.ArtifactAndRevision.artifactRevisionID).offset(version - 1)
    query = query.limit(1)
    ar = _queryOne(query)
    if ar is None:
        #
        #  See if the version is incorrect.
        #  If not, then it's no such artifact.
        #
        query = query.limit(version + 1)
        count = query.count()
        if count > 0 and count < version:
            raise Exception((_(u'Invalid version[%(version)s]')  % {"version":version}).encode("utf-8"))
    return ar

@_transactional(readOnly=True)
def getArtifactByEncodedID(session, encodedID, typeName=None):
    return _getArtifactByEncodedID(session, encodedID, typeName)

def _getArtifactByEncodedID(session, encodedID, typeName=None):
    """
        Return the Artifact that matches the given encodedID information.
    """
    query = session.query(model.Artifact)
    query = query.filter_by(encodedID=encodedID)
    if typeName and typeName != 'artifact':
        query = query.filter(model.Artifact.type.has(name = typeName))
    artifact = _queryOne(query)
    if artifact and typeName and typeName != 'artifact':
        if artifact.type.name != typeName:
            #
            #  Wrong type.
            #
            raise ex.WrongTypeException('Artifact %d is of type %s, not %s' % (id, artifact.type.name, typeName))

    return artifact

@_transactional(readOnly=True)
def getArtifactsByEncodedID(session, encodedID, typeName=None, level=None, memberID=None):
    """
        Return the Artifact that matches the given encodedID information.

        It returns the sorted list of encodedIDs and the dictionary of
        { encodedID : artifact }.
    """
    typesDict = _getArtifactTypesDict(session)
    query = session.query(model.Artifact)
    query = query.outerjoin(model.PublishedArtifact, model.Artifact.id == model.PublishedArtifact.id)
    if level:
        termTypes = _getBrowseTermTypesDict(session)
        query = query.join(model.ArtifactsAndBrowseTerms, model.Artifact.id == model.ArtifactsAndBrowseTerms.id)
        query = query.filter(and_(
            model.ArtifactsAndBrowseTerms.termTypeID == termTypes['level'].id,
            model.ArtifactsAndBrowseTerms.name == level))
    query = query.filter(model.Artifact.encodedID.like(encodedID + '.%'))
    if typeName is not None:
        query = query.filter(model.Artifact.artifactTypeID == typesDict[typeName].id)

    #sqPub = session.query(model.PublishedArtifact.id).filter(and_(
    #    model.PublishedArtifact.publishTime != None,
    #    model.PublishedArtifact.encodedID.like(encodedID + '.%')))
    if memberID:
        sq = session.query(model.MemberLibraryObject.parentID).filter(and_(
            model.MemberLibraryObject.memberID == memberID,
            model.MemberLibraryObject.objectType == 'artifactRevision'))
        query = query.filter(or_(
            model.PublishedArtifact.publishTime != None,
            model.Artifact.id.in_(sq.subquery())))
    else:
        query = query.filter(model.PublishedArtifact.publishTime != None)

    query = query.group_by(model.Artifact.encodedID)
    artifacts = query.all()
    log.info("Artifacts: %d" % len(artifacts))
    if artifacts is None or len(artifacts) == 0:
        return None, None

    idDict = {}
    for artifact in artifacts:
        if artifact.encodedID:
            parts = artifact.encodedID.split('.')
            eid = '.'.join(parts[:-2])
            if encodedID != eid:
                ## Does not match the given encodedID
                continue
        idDict[artifact.encodedID] = artifact

    def cmpEncodedID(key1, key2):
        id1 = key1.split('.')
        id2 = key2.split('.')
        #
        #  Compare domain terms.
        #
        bt1 = ''.join(id1[0:-2]).ljust(50, '0')
        bt2 = ''.join(id2[0:-2]).ljust(50, '0')
        if bt1 < bt2:
            return -1
        if bt2 > bt2:
            return 1
        #
        #  Same domain term, compare type and leaf.
        #
        c1 = '.'.join([ id1[-2], id1[-1].zfill(9) ])
        c2 = '.'.join([ id2[-2], id2[-1].zfill(9) ])
        if c1 < c2:
            return -1
        if c2 > c2:
            return 1
        return 0

    return sorted(idDict.iterkeys(), cmp=cmpEncodedID), idDict

@_transactional(readOnly=True)
def getArtifactByTitle(session, title, creatorID, typeName):
    """
        Return the Artifacts that match the given title.
    """
    log.info('getArtifactByTitle: title[%s] creatorID[%s] typeName[%s]' % (title, creatorID, typeName))
    query = session.query(model.Artifact)
    query = query.filter_by(name=title)
    query = query.filter_by(creatorID=creatorID)
    query = query.filter(model.Artifact.type.has(name = typeName))
    return _queryOne(query)

@_transactional(readOnly=True)
def getArtifactsByTitle(session, title, typeName=None):
    """
        Return the Artifacts that match the given title.
    """
    query = session.query(model.Artifact)
    if typeName is not None:
        query = query.filter(model.Artifact.type.has(name = typeName))
    title = '%' + title + '%'
    artifacts = query.filter(model.Artifact.name.ilike(title)).all()
    return artifacts

@_transactional(readOnly=True)
def getArtifactByIDOrTitle(session, idOrTitle, typeName=None):
    return _getArtifactByIDOrTitle(session, idOrTitle, typeName=typeName)

def _getArtifactByIDOrTitle(session, idOrTitle, typeName=None):
    """
        Return the Artifact that matches the given identifier or title.
    """
    query = session.query(model.Artifact)

    try:
        id = long(idOrTitle)
        #
        #   SqlAlchemy sometimes mistakenly returns more than one entry with
        #   the following filter.
        #
        #   query = query.filter(or_(model.Artifact.id == id,
        #                            model.Artifact.name == idOrTitle))
        #
        #   Now break it down into 2 queries.
        #
        query = query.filter_by(id=id)
        artifact = _queryOne(query)
        if artifact is not None:
            if typeName is not None and artifact.type.name != typeName:
                raise ex.WrongTypeException((_(u'Artifact %(id)d is of type %(artifact.type.name)s, not %(typeName)s')  % {"id":id,"artifact.type.name": artifact.type.name,"typeName": typeName}).encode("utf-8"))
            return artifact
        #
        #  Now try the title.
        #
        query = session.query(model.Artifact)
    except ValueError:
        #
        #  Not numeric, can only be a title.
        #
        pass

    query = query.filter_by(name=idOrTitle)
    if typeName is not None:
        query = query.filter(model.Artifact.type.has(name = typeName))
    artifacts = query.all()
    if artifacts is None or len(artifacts) == 0:
        return None
    return artifacts[0]

@_transactional(readOnly=True)
def getArtifactContentDict(session, id, artifactRevisionID=None, artifactDict=None, withMathJax=False, includeChildContent=False, includeChildHeaders=False, artifact=None):
    if artifact is None:
        artifact = _getUnique(session, model.Artifact, 'id', id)
    if not artifact:
        raise Exception((_(u'No such artifact by id: %(id)s')  % {"id":id}).encode("utf-8"))

    revision = None
    if artifactRevisionID:
        for r in artifact.revisions:
            if r.id == artifactRevisionID:
                revision = r
                break
    else:
        revision = artifact.revisions[0]
    return artifact.asContentDict(revision=revision, artifactDict=artifactDict, withMathJax=withMathJax, includeChildContent=includeChildContent, includeChildHeaders=includeChildHeaders)

@_transactional(readOnly=True)
def getArtifactsByOwner(session, owner, typeName=None, pageNum=0, pageSize=0, sort=None):
    return _getArtifactsByOwner(session, owner=owner, typeName=typeName, pageNum=pageNum, pageSize=pageSize, sort=sort)

def _getArtifactsByOwner(session, owner, typeName=None, pageNum=0, pageSize=0, sort=None):
    """
        Return the Artifacts that match the given owner.
    """
    query = session.query(model.Artifact)
    query = query.filter_by(creatorID=owner.id)
    if typeName is not None:
        if type(typeName) == list:
            typeIDs = []
            typesDict = _getArtifactTypesDict(session)
            for tn in typeName:
                tn = tn.lower()
                if typesDict.has_key(tn):
                    typeIDs.append(typesDict.get(tn).id)
            query = query.filter(model.Artifact.artifactTypeID.in_(typeIDs))
        else:
            query = query.filter(model.Artifact.type.has(name = typeName))
    if sort:
        for col, order in sort:
            if col == 'name':
                oby = model.Artifact.sortableName
                #oby = "SUBSTRING_INDEX(%s, '-::of::-', 1)" % oby
            elif col == 'updateTime':
                oby = model.Artifact.updateTime
            elif col == 'creationTime':
                oby = model.Artifact.creationTime
            if order == 'asc':
                query = query.order_by(asc(oby))
            else:
                query = query.order_by(desc(oby))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def countArtifactsAndBrowseTerms(session, browseTermList, typeName=None, memberID=None, termTypeID=None):
    return _countArtifactsAndBrowseTerms(session=session, browseTermList=browseTermList, typeName=typeName, memberID=memberID, termTypeID=termTypeID)

def _countArtifactsAndBrowseTerms(session, browseTermList, typeName=None, memberID=None, termTypeID=None):
    """
        Return the Artifacts that have at least one of the given browse terms.
    """
    if not browseTermList:
        return 0
    query = session.query(func.count(model.ArtifactsAndBrowseTerms.id), model.ArtifactsAndBrowseTerms.artifactTypeID).distinct()
    query = query.outerjoin(model.PublishedArtifact, model.ArtifactsAndBrowseTerms.id == model.PublishedArtifact.id)

    ## Remarkable speed up by switching from IN clause to a series of OR clauses.
    #query = query.filter(model.ArtifactsAndBrowseTerms.browseTermID.in_(browseTermList))
    query = query.filter(or_(*map(lambda btID: model.ArtifactsAndBrowseTerms.browseTermID == btID, browseTermList)))

    if termTypeID:
        query = query.filter(model.ArtifactsAndBrowseTerms.termTypeID == termTypeID)

    if not memberID:
        query = query.filter(model.PublishedArtifact.publishTime != None)
    else:
        sq = session.query(model.MemberLibraryObject.parentID).filter(and_(
            model.MemberLibraryObject.memberID == memberID,
            model.MemberLibraryObject.objectType == 'artifactRevision'))
        query = query.filter(or_(
            model.PublishedArtifact.publishTime != None,
            model.ArtifactsAndBrowseTerms.id.in_(sq.subquery())))

    if typeName and typeName != 'artifact':
        type = _getArtifactTypeByName(session=session, typeName=typeName)
        query = query.filter(model.ArtifactsAndBrowseTerms.artifactTypeID == type.id)
        return {typeName: query.first()[0]}
    else:
        typesDict = _getArtifactTypesDictByID(session)
        query = query.group_by(model.ArtifactsAndBrowseTerms.artifactTypeID)
        rows = query.all()
        if not rows:
            return 0
        d = {}
        for r in rows:
            d[typesDict.get(r[1]).name] = r[0]
        return d

@_transactional(readOnly=True)
def countArtifactsForBrowseTermDescendants(session, term, typeName=None, memberID=None):
    if not term:
        return 0
    descendants = _getBrowseTermDescendants(session=session, id=term.id)
    browseTermList = [t.id for t in descendants]
    return _countArtifactsAndBrowseTerms(session=session, browseTermList=browseTermList, typeName=typeName, memberID=memberID,
            termTypeID=term.termTypeID)

@_transactional(readOnly=True)
def getArtifactsAndBrowseTerms(session, browseTermList, typeName=None, pageNum=0, pageSize=0):
    return _getArtifactsAndBrowseTerms(session=session, browseTermList=browseTermList, typeName=typeName, pageNum=pageNum, pageSize=pageSize)

def _getArtifactsAndBrowseTerms(session, browseTermList, typeName=None, pageNum=0, pageSize=0):
    """
        Return the Artifacts that have at least one of the given browse terms.
    """
    if not browseTermList:
        return []
    query = session.query(model.ArtifactsAndBrowseTerms).distinct()
    query = query.filter(
                model.ArtifactsAndBrowseTerms.browseTermID.in_(browseTermList))

    if typeName and typeName != 'artifact':
        type = _getArtifactTypeByName(session=session, typeName=typeName)
        query = query.filter(model.ArtifactsAndBrowseTerms.artifactTypeID == type.id)

    page = p.Page(query, pageNum, pageSize)
    return page

artifactSearchAttrMap = {
    'name': model.Artifact.name,
    'description': model.Artifact.description,
    'handle': model.Artifact.handle,
}


artifactAttrMap = copy.copy(artifactSearchAttrMap)
artifactAttrMap.update({
    'id': model.Artifact.id,
    'artifactTypeID': model.Artifact.artifactTypeID,
    'encodedID': model.Artifact.encodedID,
    'creatorID': model.Artifact.creatorID,
    'ancestorID': model.Artifact.ancestorID,
    'licenseID': model.Artifact.licenseID,
    'languageID': model.Artifact.languageID,
    'creationTime': model.Artifact.creationTime,
    'updateTime': model.Artifact.updateTime,
})

artifactFieldMap = {
    'title': 'name',
}

@_transactional(readOnly=True)
def getArtifacts(session, idList=None, typeName=None, ownerID=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0):
    return _getArtifacts(session, idList, typeName, ownerID, sorting, filterDict, searchDict, searchAll, pageNum, pageSize)

def _getArtifacts(session, idList=None, typeName=None, ownerID=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0):
    """
        Return the Artifacts, unless idList is given, in which case, only
        those in the list will be returned.
    """
    query = session.query(model.Artifact)
    filterKeys = filterDict.keys()
    if 'published' in filterKeys:
        query = query.join(model.ArtifactRevision, model.Artifact.id == model.ArtifactRevision.artifactID)
        query =  query.filter(not_(model.ArtifactRevision.publishTime == None))
        query = query.group_by(model.Artifact.id)
        if 'contribution_type' in filterKeys:
            query = query.join(model.ArtifactContributionType, model.Artifact.id == model.ArtifactContributionType.artifactID)
            query =  query.filter(model.ArtifactContributionType.typeName == filterDict['contribution_type'])
            filterDict.pop("contribution_type")
        filterDict.pop("published")
    if idList is not None and len(idList) > 0:
        query = query.filter(model.Artifact.id.in_(idList))

    if typeName is not None:
        query = query.filter(model.Artifact.type.has(name = typeName))
    if ownerID:
        query = query.filter(model.Artifact.creatorID == ownerID)

    if sorting is None or len(sorting) == 0:
        field = 'id'
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = sList[0]
        order = sList[1] if len(sList) > 1 else 'asc'
    attribute = artifactAttrMap.get(field)
    if attribute is None:
        field = artifactFieldMap.get(field, field)
        attribute = artifactAttrMap.get(field)
    if attribute is None:
        raise ex.InvalidArgumentException((_(u'Invalid sorting field: %(field)s')  % {"field":field}).encode("utf-8"))
    if order == 'asc':
        query = query.order_by(asc(attribute))
    else:
        query = query.order_by(desc(attribute))

    filterKeys = filterDict.keys()
    for key in filterKeys:
        value = filterDict.get(key)
        log.debug('filter: key[%s] value[%s]' % (key, value))
        if key == 'artifactType':
            query = query.filter(model.Artifact.type.has(name = value))
        elif key == 'artifactTypeID':
            query = query.filter_by(artifactTypeID = value)
        elif key == 'collectionHandle' and value:
            query = query.join(model.RelatedArtifact, model.RelatedArtifact.artifactID == model.Artifact.id)
            query = query.filter(model.RelatedArtifact.conceptCollectionHandle.like('%s-::-%%' % value))
            collectionCreatorID = filterDict.pop('collectionCreatorID', None)
            if collectionCreatorID:
                query = query.filter(model.RelatedArtifact.collectionCreatorID == collectionCreatorID)
        elif key == "fromDate" and value:
            if filterDict.has_key("toDate"):
                value2 = filterDict.pop("toDate")
                try:
                    if (isinstance(value2, (str, unicode))):
                        value2 = datetime.strptime(value2 + " 23:59:59" , '%d-%m-%Y %H:%M:%S')
                    if (isinstance(value, (str, unicode))):
                        value = datetime.strptime(value + " 00:00:01" , '%d-%m-%Y %H:%M:%S')
                except:
                    pass
                query = query.filter(and_(model.Artifact.creationTime >= value, model.Artifact.creationTime <= value2))
        elif key == "toDate" and value:
            if filterDict.has_key("fromDate"):
                value2 = filterDict.pop("fromDate")
                try:
                    if (isinstance(value2, (str, unicode))):
                        value2 = datetime.strptime(value2 + " 23:59:59" , '%d-%m-%Y %H:%M:%S')
                    if (isinstance(value, (str, unicode))):
                        value = datetime.strptime(value + " 00:00:01" , '%d-%m-%Y %H:%M:%S')
                except:
                    pass
                query = query.filter(and_(model.Artifact.creationTime >= value2, model.Artifact.creationTime <= value))
        elif key == "fromUpdateDate" and value:
            if filterDict.has_key("toUpdateDate"):
                value2 = filterDict.pop("toUpdateDate")
                try:
                    if (isinstance(value2, (str, unicode))):
                        value2 = datetime.strptime(value2 + " 23:59:59" , '%d-%m-%Y %H:%M:%S')
                    if (isinstance(value, (str, unicode))):
                        value = datetime.strptime(value + " 00:00:01" , '%d-%m-%Y %H:%M:%S')
                except:
                    pass
                query = query.filter(and_(model.Artifact.updateTime >= value, model.Artifact.updateTime <= value2))
        elif key == "toUpdateDate" and value:
            if filterDict.has_key("fromUpdateDate"):
                value2 = filterDict.pop("fromUpdateDate")
                try:
                    if (isinstance(value2, (str, unicode))):
                        value2 = datetime.strptime(value2 + " 23:59:59" , '%d-%m-%Y %H:%M:%S')
                    if (isinstance(value, (str, unicode))):
                        value = datetime.strptime(value + " 00:00:01" , '%d-%m-%Y %H:%M:%S')
                except:
                    pass
                query = query.filter(and_(model.Artifact.updateTime >= value2, model.Artifact.updateTime <= value))

        else:
            attribute = artifactAttrMap.get(key)
            if attribute:
                query = query.filter(attribute == value)

    if searchDict is not None and len(searchDict) > 0:
        searchKeys = searchDict.keys()
        for key in searchKeys:
            attr = artifactSearchAttrMap.get(key)
            if attr is None:
                name = artifactFieldMap.get(key, key)
                attr = artifactSearchAttrMap.get(name)
            else:
                name = key
            if attr is None:
                kwargs = { name : searchDict[key] }
                query = query.filter_by(**kwargs)
            else:
                query = query.filter(attr.ilike('%%%s%%' % searchDict[key]))
    elif searchAll is not None and len(searchAll) > 0:
        query = query.filter(or_(
                    model.Artifact.name.ilike('%%%s%%' % searchAll),
                    model.Artifact.description.ilike('%%%s%%' % searchAll),
                    model.Artifact.handle.ilike('%%%s%%' % searchAll)
                ))

    page = p.Page(query, pageNum, pageSize, tableName='Artifacts')
    return page

@_transactional(readOnly=True)
def getUGCArtifactCounts(session, sorting=None, filterDict={}, excludeCreatorIDs=[3], excludeArtifactTypes=['concept'], pageNum=0, pageSize=0):
    return _getUGCArtifactCounts(session, sorting, filterDict, excludeCreatorIDs, excludeArtifactTypes, pageNum, pageSize)

def _getUGCArtifactCounts(session, sorting=None, filterDict={}, excludeCreatorIDs=[3], excludeArtifactTypes=['concept'], pageNum=0, pageSize=0):
    """
        Return the count of user generated contents for available artifactTypes.
    """
    query = session.query(func.count(distinct(model.Artifact.id)).label('id'), model.Artifact.artifactTypeID, \
                          model.ArtifactType.name, model.Artifact.creatorID, model.Member.givenName, model.Member.surname)
    query = query.join(model.ArtifactType, model.Artifact.artifactTypeID == model.ArtifactType.id)
    query = query.join(model.Member, model.Artifact.creatorID == model.Member.id)

    filterKeys = filterDict.keys()
    if 'published' in filterKeys:
        query = query.outerjoin(model.ArtifactRevision, model.Artifact.id == model.ArtifactRevision.artifactID)
        query =  query.filter(not_(model.ArtifactRevision.publishTime == None))
        if 'contribution_type' in filterKeys:
            query = query.outerjoin(model.ArtifactContributionType, model.Artifact.id == model.ArtifactContributionType.artifactID)
            query =  query.filter(model.ArtifactContributionType.typeName == filterDict['contribution_type'])
            filterDict.pop("contribution_type")
        filterDict.pop("published")

    query = query.group_by(model.Artifact.creatorID, model.ArtifactType.name)

    #Exclude artifacts of specified type(s)
    typesDict = _getArtifactTypesDict(session)
    query = query.filter(not_(model.Artifact.artifactTypeID.in_([typesDict[artifactType].id for artifactType in excludeArtifactTypes])))

    if excludeCreatorIDs:
        query = query.filter(not_(model.Artifact.creatorID.in_(excludeCreatorIDs)))

    if sorting is None or len(sorting) == 0:
        field = 'id'
        order = 'desc'
    if order == 'desc':
        query = query.order_by(desc(field))
    else:
        query = query.order_by(asc(field))
    query = query.order_by(asc(model.Artifact.artifactTypeID))
    query = query.order_by(desc(model.Artifact.creatorID))
    for key in filterDict.keys():
        value = filterDict.get(key)
        log.info('filter: key[%s] value[%s]' % (key, value))
        if key == 'artifactType':
            query = query.filter(model.Artifact.artifactTypeID == typesDict[value].id)
        elif key == 'artifactTypeID':
            query = query.filter_by(artifactTypeID = value)
        elif key == "fromDate" and value:
            if filterDict.has_key("toDate"):
                value2 = filterDict.pop("toDate")
                query = query.filter(and_(model.Artifact.creationTime >= value, model.Artifact.creationTime <= value2))
        elif key == "toDate" and value:
            if filterDict.has_key("fromDate"):
                value2 = filterDict.pop("fromDate")
                query = query.filter(and_(model.Artifact.creationTime >= value2, model.Artifact.creationTime <= value))
        else:
            attribute = artifactAttrMap.get(key)
            if attribute:
                query = query.filter(attribute == value)
    page = p.Page(query, pageNum, pageSize, tableName='Artifacts')
    return page

@_transactional(readOnly=True)
def getArtifactAncestors(session, artifactID):
    return _getArtifactAncestors(session, artifactID)

def _getArtifactAncestors(session, artifactID):
    """
        Get all ancestors of an artifact - this includes parents, grandparents, etc. etc.
    """
    allAncestors = {}
    ancestors = []
    parents = _getArtifactParents(session, artifactID=artifactID)
    if parents:
        ancestors.extend(parents)
        while len(ancestors) > 0:
            ancestor = ancestors.pop(0)
            if ancestor:
                if allAncestors.has_key(ancestor['parentID']):
                    log.error("Already seen this ancestor: %s" % ancestor['parentID'])
                    continue
                allAncestors[ancestor['parentID']] = ancestor
                parents = _getArtifactParents(session,
                                              artifactID=ancestor['parentID'])
                if parents:
                    ancestors.extend(parents)
    return allAncestors.values()

@_transactional(readOnly=True)
def getArtifactParentsByCreatorID(session, artifactID, creatorID):
    artifacts = _getArtifactParentsByCreatorID(session, artifactID, creatorID)
    parents = []
    for row in artifacts:
        parents.append({'parentID': row.id, 'parentTypeID': row.artifactTypeID})
    return parents
    
def _getArtifactParentsByCreatorID(session, artifactID, creatorID):
    query = session.query(model.Artifact).distinct()
    query = query.join(model.ArtifactAndChildren, model.Artifact.id == model.ArtifactAndChildren.id)
    query = query.filter(model.ArtifactAndChildren.childID == artifactID)
    query = query.filter(model.Artifact.creatorID == creatorID)
    return query.all()

@_transactional(readOnly=True)
def getArtifactParents(session, artifactID, sameCreatorOnly=False):
    """
        Returns a list of parents of this artifact along with their type
    """
    return _getArtifactParents(session, artifactID, sameCreatorOnly=sameCreatorOnly)

def _getArtifactParents(session, artifactID, toFilterTypes=False, sameCreatorOnly=False):
    """
        Returns a list of parents of this artifact along with their type
    """
    parents = []
    if artifactID:
        query = session.query(model.ArtifactAndChildren).distinct()
        query = query.filter(model.ArtifactAndChildren.childID == artifactID)
        if toFilterTypes:
            artifact = _getArtifactByID(session, artifactID)
            if artifact.artifactTypeID == 2:
                query = query.join(model.Artifact, model.Artifact.id == model.ArtifactAndChildren.id)
                query = query.filter(model.Artifact.artifactTypeID != 1)
        if sameCreatorOnly:
            pArtifact = model.Artifact
            cArtifact = aliased(model.Artifact)
            query = query.join(cArtifact, cArtifact.id == model.ArtifactAndChildren.childID)
            query = query.join(pArtifact, pArtifact.id == model.ArtifactAndChildren.id)
            query = query.filter(pArtifact.creatorID == cArtifact.creatorID)
        rows = query.all()
        for row in rows:
            parents.append({'parentID': row.id, 'parentTypeID': row.artifactTypeID, 'sequence': row.sequence})
    return parents

@_transactional(readOnly=True)
def getArtifactRoot(session, artifactID):
    """
        Return artifact ID of the oldest root of the given artifactID.
        Normally, that will be a book.
    """
    return _getArtifactRoot(session, artifactID)

def _getArtifactRoot(session, artifactID):
    """
        Return artifact ID of the oldest root of the given artifactID.
        Normally, that will be a book.
    """
    query = session.query(model.ArtifactRevision)
    query = query.filter_by(artifactID=artifactID)
    query = query.order_by(model.ArtifactRevision.id.desc())
    artifactRevision = query.first()
    if not artifactRevision:
        raise ex.NotFoundException((_(u'No Artifact of id[%(id)s].')  % {"id":artifactID}).encode("utf-8"))
    artifactRevisionID = artifactRevision.id
    l = []
    while True:
        log.debug('_getArtifactRoot: artifactID[%s] artifactRevisionID[%s]' % (artifactID, artifactRevisionID))
        query = session.query(model.ArtifactRevisionRelation)
        query = query.filter_by(hasArtifactRevisionID=artifactRevisionID)
        query = query.order_by(model.ArtifactRevisionRelation.artifactRevisionID)
        arr = query.first()
        if not arr:
            break
        log.debug('_getArtifactRoot: arr[%s]' % arr)
        artifactRevisionID = arr.artifactRevisionID
        artifactRevision = _getArtifactRevisionByID(session, artifactRevisionID)
        artifactID = artifactRevision.artifactID
        l.append([artifactID, artifactRevisionID, arr.sequence, arr.hasArtifactRevisionID])
    return l

@_transactional(readOnly=True)
def getArtifactChildren(session, artifactID):
    return _getArtifactChildren(session, artifactID)

def _getArtifactChildren(session, artifactID):
    """
        Returns a list of children for this artifact along with their sequence number
    """
    query = session.query(model.ArtifactAndChildren)
    children = []
    if artifactID:
        query = query.filter(model.ArtifactAndChildren.id == artifactID).order_by(model.ArtifactAndChildren.sequence)
        rows = query.all()
        for row in rows:
            children.append({'childID': row.childID, 'sequence': row.sequence})
    return children

@_transactional(readOnly=True)
def getBrowseTermsDictForArtifactDescendants(session, artifactID):
    """
        Get browse terms in form of list of dicts
        for all descendants of an artifact
    """
    terms = []
    termTypes = _getBrowseTermTypes(session)
    typesDict = {}
    for type in termTypes:
        typesDict[type.id] = type.name
    descendants = _getArtifactDescendants(session, artifactID)
    if descendants:
        query = session.query(model.ArtifactsAndBrowseTerms)
        query = query.filter(model.ArtifactsAndBrowseTerms.id.in_(descendants))
        seen = {}
        for term in query.all():
            if not seen.has_key(term.browseTermID):
                seen[term.browseTermID] = True
                terms.append({'id': term.browseTermID,
                    'from': typesDict[term.termTypeID],
                    'encodedID': term.encodedID,
                    'term': term.name})
    return terms

@_transactional(readOnly=True)
def getTagTermsDictForArtifactDescendants(session, artifactID):
    """
        Get tag terms in form of list of dicts
        for all descendants of an artifact
    """
    terms = []
    descendants = _getArtifactDescendants(session, artifactID)
    if descendants:
        tagTerms = _getArtifactTagTerms(session, descendants)
        seen = {}
        for term in tagTerms:
            if not seen.has_key(term.tagTermID):
                seen[term.tagTermID] = True
                terms.append(
                    {
                        'id': term.tagTermID,
                        'term': term.name
                    }
                )
    return terms

@_transactional(readOnly=True)
def getTagTermsDictForMembers(session, memberID):
    """
        Get tag terms in form of list of dicts
        for provided MemberID
    """
    terms = []
    tagTerms = _getArtifactTagTerms(session, memberID=memberID)
    seen = {}
    for term in tagTerms:
        if not seen.has_key(term.tagTermID):
            seen[term.tagTermID] = True
            terms.append(
                {
                    'id': term.tagTermID,
                    'term': term.name
                }
            )
    return terms

@_transactional(readOnly=True)
def getSearchTermsDictForArtifactDescendants(session, artifactID):
    """
        Get search terms in form of list of dicts
        for all descendants of an artifact
    """
    terms = []
    descendants = _getArtifactDescendants(session, artifactID)
    if descendants:
        searchTerms = _getArtifactSearchTerms(session, descendants)
        seen = {}
        for term in searchTerms:
            if not seen.has_key(term.searchTermID):
                seen[term.searchTermID] = True
                terms.append(
                    {
                        'id': term.searchTermID,
                        'term': term.name
                    }
                )
    return terms

@_transactional(readOnly=True)
def getConceptsInfo(session):
    """
        Get the name, handle, and id for all concepts from BrowseTerms
    """
    cursor = mongodb.CollectionNodes.find({'encodedID':{'$ne': None}}).sort([('encodedID', 1)])
    conceptsInfo = []
    for eachConcept in cursor:
        info = {
                'encodedID': eachConcept['encodedID'],
                'subjectShortName': eachConcept['encodedID'].split('.')[0],
                'branch': eachConcept['collection']['handle'],
                'branchShortName': eachConcept['encodedID'].split('.')[1],
                'name': eachConcept['title'],
                'handle': eachConcept['absoluteHandle'],
                }
        conceptsInfo.append(info)
    return conceptsInfo

@_transactional(readOnly=True)
def getStandardsForArtifactDescendants(session, artifactID, artifactRevisionID):
    """
        Get standards for all descendants of an artifact
    """
    standards = []
    descendantRevisionIDs = _getArtifactDescendantRevisionIDs(session, artifactRevisionID)
    if descendantRevisionIDs:
        standards = _getCorrelatedStandards(session, artifactRevisionIDs=descendantRevisionIDs)
    descendants = _getArtifactDescendants(session, artifactID)
    domainStds = []
    if descendants:
        domainStds = _getCorrelatedStandardForDomain(session, artifactIDs=descendants)
    standards.extend(domainStds)
    standardTerms = {}
    for std in standards:
        standard = std.standard
        standardBoard = standard.standardBoard
        term = '%s.%s' % (standardBoard.country.code2Letter.upper(), standardBoard.name.upper())
        terms = []
        for grade in standard.grades:
            terms.append('%s.%s' % (term, grade.name))
        for term in terms:
            term += '.%s.%s' % (standard.subject.name, standard.section.replace('.', '_'))
            standardTerms[term] = term
    return standardTerms.keys()

@_transactional(readOnly=True)
def getArtifactDescendants(session, artifactID):
    return _getArtifactDescendants(session, artifactID)

def _getArtifactDescendants(session, artifactID):
    retList = {}
    descendants = [artifactID]
    while descendants:
        id = descendants.pop(0)
        children = _getArtifactChildren(session, id)
        for child in children:
            descendants.append(child['childID'])
            retList[child['childID']] = child['childID']
    return retList.keys()

@_transactional(readOnly=True)
def getArtifactDescendantRevisionIDs(session, artifactRevisionID):
    return _getArtifactDescendantRevisionIDs(session, artifactRevisionID)

def _getArtifactDescendantRevisionIDs(session, artifactRevisionID):
    retList = []
    descendants = [artifactRevisionID]
    while descendants:
        id = descendants.pop(0)
        query = session.query(model.ArtifactRevisionRelation.hasArtifactRevisionID)
        query = query.filter(model.ArtifactRevisionRelation.artifactRevisionID == id)
        query = query.order_by(model.ArtifactRevisionRelation.sequence)
        for r in query.all():
            retList.append(r.hasArtifactRevisionID)
            descendants.append(r.hasArtifactRevisionID)
    return retList

@_transactional(readOnly=True)
def checkArtifactHandle(session, creatorID, handle, typeID):
    return _checkArtifactHandle(session, creatorID, handle, typeID)

def _checkArtifactHandle(session, creatorID, handle, typeID):
    query = session.query(model.Artifact)
    query = query.filter_by(creatorID = creatorID)
    query = query.filter_by(handle = handle)
    if typeID:
        query = query.filter_by(artifactTypeID = typeID)
    artifacts = query.all()
    if artifacts and len(artifacts) > 0:
        handles = []
        for artifact in artifacts:
            kwargs = { 'artifactID': artifact.id, 'handle': artifact.handle, 'artifactTypeID': typeID, 'creatorID': creatorID }
            handles.append(model.ArtifactHandle(**kwargs))
        return handles
    #
    #  Check the ArtifactHandles table.
    #
    query = session.query(model.ArtifactHandle)
    query = query.filter(model.ArtifactHandle.handle == handle)
    query = query.filter(model.ArtifactHandle.creatorID == creatorID)
    if typeID:
        query = query.filter(model.ArtifactHandle.artifactTypeID == typeID)
    log.info('_checkArtifactHandle: query[%s]' % query)
    handles = query.all()
    log.info('_checkArtifactHandle: handles[%s]' % handles)
    return handles

@_transactional(readOnly=True)
def getArtifactHandles(session, id=None, handle=None, typeID=None, creatorID=None):
    return _getArtifactHandles(session, id, handle, typeID, creatorID)

def _getArtifactHandles(session, id=None, handle=None, typeID=None, creatorID=None):
    """
        Returns the old handles of the Artifact instance identified by id.
    """
    query = session.query(model.ArtifactHandle)
    if id:
        query = query.filter_by(artifactID=id)
    if handle:
        query = query.filter_by(handle=handle)
    if typeID:
        query = query.filter_by(artifactTypeID=typeID)
    if creatorID:
        query = query.filter_by(creatorID=creatorID)
    return query.all()

def _getArtifactHandle(session, id, handle, typeID, creatorID):
    """
        Returns the old handle of the Artifact instance identified by id.
    """
    query = session.query(model.ArtifactHandle)
    query = query.filter_by(artifactID=id)
    query = query.filter_by(handle=handle)
    query = query.filter_by(artifactTypeID=typeID)
    query = query.filter_by(creatorID=creatorID)
    return _queryOne(query)

def _archiveArtifactHandle(session, id, handle, typeID, creatorID):
    """
        Archives the old handle of the given Artifact instance
        indentified by id, if it hasn't yet.
    """
    ah = _getArtifactHandle(session, id, handle, typeID, creatorID)
    if not ah:
        data = {
            'artifactID': id,
            'handle': handle,
            'artifactTypeID': typeID,
            'creatorID': creatorID
        }
        ah = model.ArtifactHandle(**data)
        session.add(ah)
    return ah

def _getArtifactAuthor(session, id, name, roleID):
    """
        Returns the ArtifactAuthor instance identified by artifact id and
        author name.
    """
    query = session.query(model.ArtifactAuthor)
    query = query.filter(and_(model.ArtifactAuthor.artifactID == id,
                  model.ArtifactAuthor.name == name,
                              model.ArtifactAuthor.roleID == roleID))
    author = _queryOne(query)
    return author

def _createArtifactAttributer(session, **kwargs):
    _checkAttributes(['artifactID', 'roleID', 'givenName'], **kwargs)
    if kwargs.get('deleteIfExists', ''):
        log.info('deleteIfExists is set. Deleting existing attributers for the artifactID: %s' %(kwargs['artifactID']))
        _deleteArtifactAttributersByArtifactID(session, artifactID=kwargs['artifactID'])
    artifactAttributer = model.ArtifactAttributer(**kwargs)
    session.add(artifactAttributer)
    return artifactAttributer

@_transactional()
def createArtifactAttributer(session, **kwargs):
    return _createArtifactAttributer(session, **kwargs)

def _getArtifactAttributers(session, id=None, roleID=None, givenName=None, surname=None, middleName=None, institution=None):
    """
        Returns the ArtifactAttributer instance identified by artifact id and
        author name.
    """
    query = session.query(model.ArtifactAttributer)
    if id:
        query = query.filter_by(artifactID=id)
    else:
        query = query.order_by(model.ArtifactAttributer.artifactID)
    if roleID:
        query = query.filter_by(roleID=roleID)
    else:
        query = query.order_by(model.ArtifactAttributer.roleID)
    if institution:
        query = query.filter_by(institution=institution)
    if surname:
        query = query.filter_by(surname=surname)
    if givenName:
        query = query.filter_by(givenName=givenName)
    if middleName:
        query = query.filter_by(middleName=middleName)
    attributers = query.all()
    return attributers

@_transactional(readOnly=True)
def getArtifactAttributers(session, id, roleID, givenName=None, surname=None, middleName=None, institution=None):
    return _getArtifactAttributers(session, id, roleID, givenName, surname, middleName, institution)

def _deleteArtifactAttributersByArtifactID(session, artifactID):
    query = session.query(model.ArtifactAttributer)
    query = query.filter_by(artifactID=artifactID)
    query.delete()

@_transactional()
def deleteArtifactAttributersByArtifactID(session, artifactID):
    _deleteArtifactAttributersByArtifactID(session, artifactID)

"""
    ArtifactRevision related APIs.
"""
def _getArtifactRevisions(session, idList=None, pageNum=0, pageSize=0):
    query = session.query(model.ArtifactRevision)
    if idList is not None and len(idList) > 0:
        query = query.filter(model.ArtifactRevision.id.in_(idList))
    page = p.Page(query, pageNum, pageSize, tableName='ArtifactRevisions')
    return page

@_transactional(readOnly=True)
def getArtifactRevisions(session, idList=None, pageNum=0, pageSize=0):
    return _getArtifactRevisions(session, idList, pageNum, pageSize)

@_transactional(readOnly=True)
def getArtifactRevisionsByIDs(session, idList, isRevisionID=True):
    return _getArtifactRevisionsByIDs(session, idList, isRevisionID=isRevisionID)

def _getArtifactRevisionsByIDs(session, idList, isRevisionID=True):
    if idList:
        query = session.query(model.ArtifactAndRevision)
        if isRevisionID:
            query = query.filter(model.ArtifactAndRevision.artifactRevisionID.in_(idList))
        else:
            query = query.filter(model.ArtifactAndRevision.id.in_(idList))
        ars = query.all()
        if isRevisionID:
            artifactRevisions = sorted(ars, cmp=lambda x,y: cmp(idList.index(x.artifactRevisionID), idList.index(y.artifactRevisionID)))
        else:
            artifactRevisions = sorted(ars, cmp=lambda x,y: cmp(idList.index(x.id), idList.index(y.id)))
        return artifactRevisions
    return []

@_transactional(readOnly=True)
def getRevisionsOfArtifact(session, id, order='desc', pageNum=0, pageSize=0):
    query = session.query(model.ArtifactRevision)
    query = query.filter_by(artifactID=id)
    if order == 'desc':
        query = query.order_by(model.ArtifactRevision.id.desc())
    elif order == 'asc':
        query = query.order_by(model.ArtifactRevision.id.asc())
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getArtifactRevisionsByStandards(session, standards, artifactType=None, pageNum=0, pageSize=0):
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.id == model.ArtifactRevisionHasStandards.artifactRevisionID)
    standardIDs = []
    for standard in standards:
        standardIDs.append(standard.id)
    if standardIDs:
        query = query.filter(model.ArtifactRevisionHasStandards.standardID.in_(standardIDs))
    if artifactType is not None:
        q = session.query(model.ArtifactType)
        q = q.prefix_with('SQL_CACHE')
        artifactType = q.filter_by(name=artifactType).one()
        query = query.filter(model.ArtifactRevision.artifactID == model.Artifact.id).filter(model.Artifact.artifactTypeID == artifactType.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getArtifactRevisionHasStandard(session, artifactRevisionID, standardID):
    query = session.query(model.ArtifactRevisionHasStandards)
    query = query.filter(and_(
        model.ArtifactRevisionHasStandards.standardID == standardID,
        model.ArtifactRevisionHasStandards.artifactRevisionID == artifactRevisionID))
    return _queryOne(query)

"""
    Featured artifact related APIs.
"""

@_transactional(readOnly=True)
def getFeaturedArtifact(session, artifactID):
    """
        Returns the featured data of the given artifactID.
    """
    query = session.query(model.FeaturedArtifact)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(artifactID=artifactID)
    return _queryOne(query)

def _getFeaturedArtifactsByIDs(session, idList):
    """
        Returns the featured artifacts from the given idList.
    """
    if not idList:
        return []
    query = session.query(model.FeaturedArtifact)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.FeaturedArtifact.artifactID.in_(idList))
    query = query.order_by(model.FeaturedArtifact.listOrder)
    return query.all()

@_transactional(readOnly=True)
def getFeaturedArtifacts(session, typeName=None, pageNum=0, pageSize=0):
    """
        Returns all the featured artifacts.
    """
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    query = session.query(model.TypedFeaturedArtifact)
    query = query.prefix_with('SQL_CACHE')
    if typeName:
        query = query.filter_by(typeName=typeName)
    page = p.Page(query, pageNum, pageSize)
    return page

"""
    Resource related APIs.
"""

@_transactional(readOnly=True)
def getResourceTypeByName(session, name):
    return _getResourceTypeByName(session, name)

def _getResourceTypeByName(session, name):
    return _getUnique(session, model.ResourceType, 'name', name)

@_transactional(readOnly=True)
def getResourceTypes(session, pageNum=0, pageSize=0):
    return _getResourceTypes(session, pageNum=pageNum, pageSize=pageSize)

def _getResourceTypes(session, pageNum=0, pageSize=0):
    query = session.query(model.ResourceType)
    query = query.prefix_with('SQL_CACHE')
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getResourceTypesDict(session):
    return _getResourceTypesDict(session, asDict=True)

@_transactional(readOnly=True)
def getResourceTypesObjDict(session):
    return _getResourceTypesDict(session, asDict=False)

def _getResourceTypesDict(session, asDict=True):
    rd = {}
    query = session.query(model.ResourceType)
    query = query.prefix_with('SQL_CACHE')
    for rt in query.all():
        if asDict:
            rd[rt.name.lower()] = rt.asDict()
        else:
            rd[rt.name.lower()] = rt
    return rd

@_transactional(readOnly=True)
def getResourceByID(session, id):
    return _getResourceByID(session, id)

def _getResourceByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Resource, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getResourceByRefHash(session, refHash):
    return _getResourceByRefHash(session, refHash)

def _getResourceByRefHash(session, refHash):
    return _getUnique(session, model.Resource, 'refHash', refHash)

@_transactional(readOnly=True)
def getResourceByHandle(session, handle, typeID, ownerID):
    return _getResourceByHandle(session, handle, typeID, ownerID)

def _getResourceByHandle(session, handle, typeID, ownerID):
    """
        Return the Artifact that matches the given perma URL information.
    """
    query = session.query(model.Resource)
    query = query.filter_by(handle=handle)
    query = query.filter_by(resourceTypeID=typeID)
    query = query.filter_by(ownerID=ownerID)
    resource = _queryOne(query)
    return resource

@_transactional(readOnly=True)
def getResourceByHandleAndType(session, handle, typeID):
    query = session.query(model.Resource)
    query = query.filter_by(handle=handle)
    query = query.filter_by(resourceTypeID=typeID)
    return query.first()

@_transactional(readOnly=True)
def getResourceByUri(session, uri, ownerID):
    return _getResourceByUri(session, uri, ownerID)

def _getResourceByUri(session, uri, ownerID):
    query = session.query(model.Resource)
    if len(uri) > 255:
        urimd5 = hashlib.md5(uri).hexdigest()
        query = query.filter(model.Resource.uri.in_([uri, urimd5]))
    else:
        query = query.filter(model.Resource.uri == uri)
    query = query.filter(model.Resource.ownerID == ownerID)
    return _queryOne(query)

@_transactional(readOnly=True)
def getResourcesByOwner(session, ownerID, typeName=None, pageNum=0, pageSize=0):
    query = session.query(model.Resource)
    if typeName:
        query = query.filter(model.Resource.type.has(name = typeName))
    query = query.filter(model.Resource.ownerID == ownerID)
    query = query.order_by(model.Resource.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getResources(session, ids=None, typeName=None, pageNum=0, pageSize=0):
    query = session.query(model.Resource)
    if ids:
        query = query.filter(model.Resource.id.in_(ids))
    if typeName:
        query = query.filter(model.Resource.type.has(name = typeName))
    query = query.order_by(model.Resource.id)
    page = p.Page(query, pageNum, pageSize, tableName='Resources')
    return page

@_transactional()
def getInlineResourceDocument(session,ids=None,resourceIDs=None):
    """
        get all box document records.
    """
    return _getInlineResourceDocument(session,ids=ids,resourceIDs=resourceIDs)

def _getInlineResourceDocument(session,ids=None,resourceIDs=None):
    """
        get all box document records.
    """
    query = session.query(model.InlineResourceDocument)
    if ids:
        query = query.filter(model.InlineResourceDocument.id.in_(ids))
    if resourceIDs:
        query = query.filter(model.InlineResourceDocument.resourceID.in_(resourceIDs))
    return query.all()

@_transactional(readOnly=True)
def getResourceRevisionsByIDs(session, ids):
    return _getResourceRevisionsByIDs(session, ids)

def _getResourceRevisionsByIDs(session, ids):
    if not ids or ( len(ids) == 1 and not ids[0] ):
        return []
    rrIDs = []
    for id in ids:
        rrIDs.append(long(id))
    query = session.query(model.ResourceRevision)
    query = query.filter(model.ResourceRevision.id.in_(rrIDs))
    ## Preserve order
    allRevs = dict([(r.id, r) for r in query.all()])
    return [ allRevs.get(id) for id in rrIDs ]

@_transactional(readOnly=True)
def getResourceRevisionByID(session, id):
    return _getResourceRevisionByID(session, id)

def _getResourceRevisionByID(session, id):
    try:
        id = long(id)
        query = session.query(model.ResourceRevision)
        query = query.filter_by(id = id)
        return _queryOne(query)
    except ValueError:
        return None

def _getResourceRevision(session, resourceID, revision):
    query = session.query(model.ResourceRevision)
    query = query.filter_by(resourceID = resourceID)
    query = query.filter_by(revision = revision)
    return _queryOne(query)

@_transactional(readOnly=True)
def getResourcesWithGreaterID(session, resourceID, typeNames=[]):
    query = session.query(model.Resource)
    query = query.filter(model.Resource.id > resourceID)
    if typeNames:
        resourceTypes = _getResourceTypesDict(session)
        typeIDs = []
        for tn in typeNames:
            if resourceTypes.has_key(tn):
                typeIDs.append(resourceTypes[tn]['id'])
            else:
                raise Exception('Unknown resource type: %s' % tn)

        query = query.filter(model.Resource.resourceTypeID.in_(typeIDs))
    return query.all()

@_transactional(readOnly=True)
def getViewerQualifiedResources(session, pageNum=0, pageSize=0, createdAfter=None, resourceIDs=None):
    """
    get resources to upload on box viewer
    """
    return _getViewerQualifiedResources(session, pageNum, pageSize, createdAfter=createdAfter, resourceIDs=resourceIDs)

def _getViewerQualifiedResources(session, pageNum=0, pageSize=0, createdAfter=None, resourceIDs=None):
    """
    get resources to upload on box viewer
    """
    resourceTypes = _getResourceTypesDict(session)
    # Resource Types to be uploaded to vendor side for viewer
    resourceTypeNames = ['activity', 'answer demo', 'answer key', 'attachment', 'classwork',
            'cthink', 'handout', 'homework', 'inlineworksheet', 'lab', 'lessonplan', 'notes',
            'presentation', 'project', 'quiz', 'reading', 'rubric', 'starter', 'studyguide',
            'syllabus']

    resourceTypeIDs = []
    for name in resourceTypeNames:
        if resourceTypes[name]:
            resourceTypeIDs.append(resourceTypes[name]['id'])

    q = session.query(model.Resource)
    if resourceIDs:
        q = q.filter(model.Resource.id.in_(resourceIDs))
    else:
        q = session.query(model.Resource).outerjoin(model.InlineResourceDocument,model.Resource.id == model.InlineResourceDocument.resourceID)
        q = q.filter(model.InlineResourceDocument.resourceID == None)

    q = q.filter(and_(model.Resource.satelliteUrl != None, model.Resource.isAttachment == 1, model.Resource.ownerID == 3))
    q = q.filter(or_(model.Resource.uri.ilike('%.doc'),model.Resource.uri.ilike('%.docx'),model.Resource.uri.ilike('%.ppt'),model.Resource.uri.ilike('%.pptx'),model.Resource.uri.ilike('%.pdf'),
                     model.Resource.handle.ilike('%.doc'),model.Resource.handle.ilike('%.docx'),model.Resource.handle.ilike('%.ppt'),model.Resource.handle.ilike('%.pptx'),model.Resource.handle.ilike('%.pdf')))

    q = q.filter(model.Resource.resourceTypeID.in_(resourceTypeIDs))
    if createdAfter is not None:
        q = q.filter(model.Resource.creationTime > createdAfter)
    q = q.group_by(model.Resource.satelliteUrl)
    q = q.order_by(model.Resource.id)
    log.info(q)
    page = p.Page(q, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getResourcesByTypes(session, typeNames=None, ownerID=None, getAll=False, sort=None, pageNum=0, pageSize=0):
   return _getResourcesByTypes(session, typeNames=typeNames, ownerID=ownerID, getAll=getAll, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getResourcesByTypes(session, typeNames=None, ownerID=None, getAll=False, sort=None, pageNum=0, pageSize=0):
    resourceTypes = _getResourceTypesDict(session)
    typeIDs = []
    query = session.query(model.Resource).distinct()
    query = query.join(model.ResourceRevision, model.Resource.id == model.ResourceRevision.resourceID)
    if typeNames:
        if 'resource' in typeNames:
            typeIDs = []
        else:
            for typeName in typeNames:
                typeName = typeName.lower()
                if resourceTypes.has_key(typeName):
                    typeIDs.append(resourceTypes[typeName]['id'])
                else:
                    raise Exception('Unknown resource type: %s' % typeName)
    if typeIDs:
        query = query.filter(model.Resource.resourceTypeID.in_(typeIDs))
    else:
        raise Exception('Listing resources without specifying resource types is not supported')
    if ownerID and not getAll:
        query = query.filter(or_(
            model.Resource.ownerID == ownerID,
            model.ResourceRevision.publishTime != None))
    elif not ownerID and not getAll:
        query = query.filter(model.ResourceRevision.publishTime != None)
    if sort:
        for col, order in sort:
            if col == 'name':
                oby = model.Resource.name
            elif col == 'creationTime':
                oby = model.Resource.creationTime
            elif col == 'ownerID':
                oby = model.Resource.ownerID
            if order == 'asc':
                query = query.order_by(asc(oby))
            else:
                query = query.order_by(desc(oby))
    return p.Page(query, pageNum, pageSize)

@_transactional(readOnly=True)
def getResourcesFromArtifactRevisionID(session, artifactRevisionID, resourceTypeIDs=[], attachmentsOnly=False):
    return _getResourcesFromArtifactRevisionID(session, artifactRevisionID, resourceTypeIDs, attachmentsOnly)

def _getResourcesFromArtifactRevisionID(session, artifactRevisionID, resourceTypeIDs=[], attachmentsOnly=False):
    query = session.query(model.ResourceRevision)
    query = query.join(model.ArtifactRevisionHasResources,
            model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
    query = query.filter(model.ArtifactRevisionHasResources.artifactRevisionID == artifactRevisionID)
    if resourceTypeIDs or attachmentsOnly:
        query = query.join(model.Resource,
                model.ResourceRevision.resourceID == model.Resource.id)
        if resourceTypeIDs:
            query = query.filter(model.Resource.resourceTypeID.in_(resourceTypeIDs))
        if attachmentsOnly:
            query = query.filter(model.Resource.isAttachment == attachmentsOnly)
    resourceRevisions = query.all()
    rList = []
    for rr in resourceRevisions:
        rList.append((rr, rr.resource))
    return rList

def _getArtifactRevisionsForResource(session, resourceID, resourceRevisionID=None):
    query = session.query(model.RevisionAndResources)
    query = query.filter(model.RevisionAndResources.resourceID == resourceID)
    if resourceRevisionID:
        query = query.filter(model.RevisionAndResources.id == resourceRevisionID)
    return query.all()

@_transactional(readOnly=True)
def getArtifactRevisionsForResource(session, resourceID, resourceRevisionID=None):
    artifactRevisions = []
    results = _getArtifactRevisionsForResource(session, resourceID, resourceRevisionID)
    for result in results:
        artifactRevisions.append(result.artifactRevision)
    return artifactRevisions

@_transactional()
def updateResourceHash(session):
    query = session.query(model.Resource)
    pageNum = 1
    pageSize = 128
    page = p.Page(query, pageNum, pageSize, tableName='Resources')
    while page.results is not None and len(page.results) > 0:
        resources = page.results
        for resource in resources:
            revision = resource.revisions[0]
            if resource.isExternal or resource.type.versionable:
                revision.hash = str(resource.id)
            else:
                try:
                    path = h.getDataPath(resource.uri, id=resource.ownerID)
                    revision.hash = h.genMD5Hash(path)
                except Exception, e:
                    log.debug('updateResourceHash exception: %s' % e)
        pageNum += 1
        page = p.Page(query, pageNum, pageSize, tableName='Resources')

@_transactional(readOnly=True)
def getLanguageByID(session, id):
    return _getLanguageByID(session, id)

def _getLanguageByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Language, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getLanguageByCode(session, code):
    return _getLanguageByCode(session, code)

def _getLanguageByCode(session, code):
    return _getUnique(session, model.Language, 'code', code)

@_transactional(readOnly=True)
def getLanguageByName(session, name):
    return _getLanguageByName(session, name)

def _getLanguageByName(session, name):
    return _getUnique(session, model.Language, 'name', name)

@_transactional(readOnly=True)
def getLanguageByNameOrCode(session, nameOrCode):
    return _getLanguageByNameOrCode(session, nameOrCode)

def _getLanguageByNameOrCode(session, nameOrCode):
    ln = _getLanguageByCode(session, nameOrCode)
    if not ln:
        ln = _getLanguageByName(session, nameOrCode)
    return ln

@_transactional(readOnly=True)
def getLanguages(session, pageNum=0, pageSize=0):
    query = session.query(model.Language)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.Language.name)
    page = p.Page(query, pageNum, pageSize)
    return page

"""
    Vocabulary related APIs.
"""

def _createVocabulary(session, **kwargs):
    _checkAttributes([ 'term', 'definition', 'languageID'], **kwargs)
    """
        Create a Vocabulary instance.
    """
    vocabulary = model.Vocabularies(**kwargs)
    session.add(vocabulary)
    return vocabulary

@_transactional()
def createVocabulary(session, **kwargs):
    return _createVocabulary(session, **kwargs)

@_transactional()
def createArtifactHasVocabulary(session, **kwargs):
    return _createArtifactHasVocabulary(session, **kwargs)

def _createArtifactHasVocabulary(session, **kwargs):
    _checkAttributes([ 'artifactID', 'vocabularyID'], **kwargs)
    if not kwargs.has_key('sequence'):
        query = session.query(func.max(model.ArtifactHasVocabularies.sequence)).filter_by(artifactID=kwargs['artifactID'])
        sequence = query.scalar()
        if sequence == None:
            sequence = 0
        sequence = sequence + 1
        kwargs['sequence'] = sequence
    artifactHasVocabulary = model.ArtifactHasVocabularies(**kwargs)
    session.add(artifactHasVocabulary)
    return artifactHasVocabulary

@_transactional(readOnly=True)
def getVocabularies(session, term=None, definition=None, languageID=None):
    return _getVocabularies(session, term, definition, languageID)

def _getVocabularies(session, term=None, definition=None, languageID=None):
    """
        Return the vocabulary that matches the given term, definition and languageID
    """
    query = session.query(model.Vocabularies)
    query = query.prefix_with('SQL_CACHE')
    if term:
        query = query.filter_by(term=term)
    if definition:
        query = query.filter_by(definition=definition)
    if languageID:
        query = query.filter_by(languageID=languageID)
    vocabularies = query.all()
    return vocabularies

@_transactional(readOnly=True)
def getArtifactHasVocabularies(session, artifactID, vocabularyID=None, languageID=None, term=None):
    return _getArtifactHasVocabularies(session, artifactID, vocabularyID, languageID, term)

def _getArtifactHasVocabularies(session, artifactID, vocabularyID=None, languageID=None, term=None):
    query = session.query(model.ArtifactHasVocabularies)
    query = query.filter_by(artifactID=artifactID)
    if vocabularyID:
        query = query.filter_by(vocabularyID=vocabularyID)
    if languageID:
        query = query.filter(model.ArtifactHasVocabularies.vocabulary.has(languageID=languageID))
    if term:
        query = query.filter(model.ArtifactHasVocabularies.vocabulary.has(term=term))
    artifactHasVocabularies = query.all()
    return artifactHasVocabularies

@_transactional(readOnly=True)
def getVocabularyLanguagesForArtifact(session, artifactID):
    return _getVocabularyLanguagesForArtifact(session, artifactID)

def _getVocabularyLanguagesForArtifact(session, artifactID):
    query = session.query(model.ArtifactsAndVocabularies.languageCode, model.ArtifactsAndVocabularies.languageName).distinct()
    query = query.filter_by(id=artifactID)
    return query.all()

def _countArtifactsHasVocabulary(session, vocabularyID=None):
    query = session.query(model.ArtifactHasVocabularies)
    query = query.filter_by(vocabularyID=vocabularyID)
    return query.count()

@_transactional(readOnly=True)
def getVocabulariesByArtifactID(session, artifactID, pageNum=0, pageSize=0, languageCode=None):
    query = session.query(model.ArtifactsAndVocabularies)
    query = query.filter_by(id=artifactID)
    if languageCode:
        query = query.filter_by(languageCode=languageCode)
    query = query.order_by(model.ArtifactsAndVocabularies.sequence)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getVocabulariesByTerm(session, term, language=None, pageNum=0, pageSize=0, sort=None):
    """
        Get the Vocabularies for the specified search terms with pagination.
    """
    query = _getVocabulariesByTerm(session, term, language, pageNum, pageSize, sort)
    page = p.Page(query, pageNum, pageSize)
    return page

def _getVocabulariesByTerm(session, term, language=None, pageNum=0, pageSize=0, sorting=None):
    """
        Get the Vocabularies for the specified search terms with pagination.
    """
    if not term:
        raise Exception((_(u"Missing required attribute: term")).encode("utf-8"))
    languageID = None
    if language:
        language = _getLanguageByName(session=session, name=language)
        if not language:
            raise Exception('No such language by name,:%s' % language)
        languageID = language.id
    query = session.query(model.Vocabularies)
    query = query.filter(model.Vocabularies.term==term)
    if languageID:
        query = query.filter(model.Vocabularies.languageID==languageID)

    tableMap = {
        'id' : model.Vocabularies.id,
        'definition' : model.Vocabularies.definition
    }
    if sorting is None or len(sorting) == 0:
        field = tableMap['id']
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = tableMap[sList[0]]
        order = sList[1] if len(sList) > 1 else 'asc'

    if order == 'asc':
        query = query.order_by(asc( field ) )
    else :
        query = query.order_by(desc(  field ) )

    return query

@_transactional()
def deleteArtifactHasVocabularies(session, vocabulary):
    """
        Delete the given ArtifactHasVocabularies instance.
    """
    session.delete(vocabulary)
    session.flush()

@_transactional()
def deleteVocabulary(session, id):
    return _deleteVocabulary(session, id)

def _deleteVocabulary(session, id):
    """
        Delete the vocabulary that matches the given id
    """
    count = _countArtifactsHasVocabulary(session, vocabularyID=id)
    if count > 0:
        raise Exception((_(u'This vocabulary is currently mapped to one or more artifacts.')).encode("utf-8"))
    query = session.query(model.Vocabularies)
    query = query.filter_by(id=id)
    vocabulary = _queryOne(query)
    if vocabulary:
        session.delete(vocabulary)
    session.flush()

"""
    BrowseTerm related APIs.
"""
@_transactional(readOnly=True)
def getBrowseTermTypeByName(session, name):
    return _getBrowseTermTypeByName(session, name)

def _getBrowseTermTypeByName(session, name):
    """
        Return first browseTermType that matches the the given name
    """
    query = session.query(model.BrowseTermType)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.BrowseTermType.name.ilike(name))
    types = query.all()
    if types is not None and len(types) > 0:
        return types[0]
    return None

@_transactional(readOnly=True)
def getBrowseTermTypeByID(session, id):
    """
        Return the browseTermType that matches the the given ID
    """
    try:
        id = long(id)
        return _getUnique(session, model.BrowseTermType, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getBrowseTermTypes(session, name=None, pageNum=0, pageSize=0):
    return _getBrowseTermTypes(session, name, pageNum, pageSize)

def _getBrowseTermTypes(session, name=None, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTermType)
    query = query.prefix_with('SQL_CACHE')
    if name is not None:
        name = '%' + name + '%'
        query = query.filter(model.BrowseTermType.name.ilike(name))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getBrowseTermTypesDict(session):
    return _getBrowseTermTypesDict(session)

def _getBrowseTermTypesDict(session):
    """
        Get all browseTermType instances as a dictionary keyed from the type name.
    """
    allTermTypes = _getBrowseTermTypes(session)
    browseTermTypes = {}
    for termType in allTermTypes:
        browseTermTypes[termType.name] = termType
    return browseTermTypes

@_transactional(readOnly=True)
def getTopLevelBrowseTerms(session, pageNum=0, pageSize=0):
    """
        Get all browseTerms which do not have a parent
    """
    query = session.query(model.BrowseTerm)
    query = query.filter_by(parentID=None)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getSubjectBrowseTerms(session, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTermType)
    query = query.prefix_with('SQL_CACHE')
    subject = query.filter_by(name='subject').one()
    query = session.query(model.BrowseTerm)
    query = query.filter_by(termTypeID=subject.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getBrowseTermByID(session, id, typeName=None):
    return _getBrowseTermByID(session, id, typeName)

def _getBrowseTermByID(session, id, typeName=None):
    """
        Return the Browse Term that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.BrowseTerm)
        query = query.filter(model.BrowseTerm.id == id)
        if typeName:
            query = query.filter(model.BrowseTerm.type.has(name = typeName))
        return _queryOne(query)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getBrowseTermByHandle(session, handle, typeID=None):
    return _getBrowseTermByHandle(session, handle, typeID)

def _getBrowseTermByHandle(session, handle, typeID=None):
    if not typeID:
        types = _getBrowseTermTypesDict(session)
        typeID = types['domain'].id
    query = session.query(model.BrowseTerm)
    query = query.filter(and_(
        model.BrowseTerm.handle == handle,
        model.BrowseTerm.termTypeID == typeID))
    return _queryOne(query)

@_transactional()
def createUniquePseudoDomainHandle(session, name):
    return _createUniquePseudoDomainHandle(session, name)

def _createUniquePseudoDomainHandle(session, name):
    """
        Create a unique Pseudo domain handle by appending an integer sequencer
    """
    name = re.sub('%s.*' %(model.getChapterSeparator()), '', name)
    pseudoDomainHandleSequencer = _getUnique(session, model.PseudoDomainHandleSequencer, 'handle', model.title2Handle(name))
    if pseudoDomainHandleSequencer:
        pseudoDomainHandleSequencer.sequence = pseudoDomainHandleSequencer.sequence + 1
    else:
        kwargs = {'handle': model.title2Handle(name), 'sequence': 1}
        pseudoDomainHandleSequencer = model.PseudoDomainHandleSequencer(**kwargs)
    session.add(pseudoDomainHandleSequencer)
    return pseudoDomainHandleSequencer

@_transactional(readOnly=True)
def getBrowseTermByEncodedID(session, encodedID, returnSupercedingConcept=False):
    return _getBrowseTermByEncodedID(session, encodedID, returnSupercedingConcept=returnSupercedingConcept)

def _getBrowseTermByEncodedID(session, encodedID, returnSupercedingConcept=False):
    """
        Return the Browse Term that matches the given identifier or name.
    """
    types = _getBrowseTermTypesDict(session)
    query = session.query(model.BrowseTerm)
    query = query.filter(or_(
        and_(model.BrowseTerm.termTypeID == types['domain'].id, model.BrowseTerm.encodedID.like('%s%%' % h.getCanonicalEncodedID(encodedID)), model.BrowseTerm.encodedID.op('regexp')(getRegExpForEncodedID(encodedID))),
        and_(model.BrowseTerm.termTypeID == types['pseudodomain'].id, model.BrowseTerm.encodedID == encodedID)))
    term = query.first()
    newTerm = None
    if term and returnSupercedingConcept:
        newTerm = mc._getSupercedingConcept(session, encodedID=term.encodedID)
    return newTerm if newTerm else term

@_transactional(readOnly=True)
def getBrowseTermByEncodedIDs(session, encodedIDList):
    return _getBrowseTermByEncodedIDs(session, encodedIDList)

def _getBrowseTermByEncodedIDs(session, encodedIDList):
    """
        Return the Browse Term that matches the given identifier or name.
    """
    types = _getBrowseTermTypesDict(session)
    query = session.query(model.BrowseTerm).distinct()
    query = query.filter(or_(
        and_(model.BrowseTerm.termTypeID == types['domain'].id, 
            or_(*map(lambda eid: model.BrowseTerm.encodedID.like('%s%%' % h.getCanonicalEncodedID(eid)), encodedIDList)), 
            or_(*map(lambda eid: model.BrowseTerm.encodedID.op('regexp')(getRegExpForEncodedID(eid)), encodedIDList))),
        and_(model.BrowseTerm.termTypeID == types['pseudodomain'].id, model.BrowseTerm.encodedID.in_(encodedIDList))))
    log.debug(query)
    return query.all()

@_transactional()
def getDomainTermByName(session, name, eidPrefix=None):
    types = _getBrowseTermTypesDict(session)
    query = session.query(model.BrowseTerm)
    query = query.filter(and_(
        model.BrowseTerm.termTypeID == types['domain'].id,
        or_(model.BrowseTerm.handle == name, model.BrowseTerm.name == name)))
    if eidPrefix:
        query = query.filter(model.BrowseTerm.encodedID.ilike('%s%%' % eidPrefix))
    return query.first()

@_transactional(readOnly=True)
def getDomainTermByEncodedID(session, eid):
    return _getDomainTermByEncodedID(session, eid)

def _getDomainTermByEncodedID(session, eid):
    types = _getBrowseTermTypesDict(session)
    query = session.query(model.BrowseTerm)

    encodedIDQuery = query.filter(and_(
            model.BrowseTerm.termTypeID == types['domain'].id,
            model.BrowseTerm.encodedID == eid))
    domainTerm =  _queryOne(encodedIDQuery)

    if not domainTerm:
        canonicalEncodedIDQuery = query.filter(and_(
                model.BrowseTerm.termTypeID == types['domain'].id,
                model.BrowseTerm.encodedID.like('%s%%' % h.getCanonicalEncodedID(eid)),
                model.BrowseTerm.encodedID.op('regexp')(getRegExpForEncodedID(eid))))
        domainTerm = _queryOne(canonicalEncodedIDQuery)
    return domainTerm

@_transactional(readOnly=True)
def getDomainTermsByEIDLike(session, eidLike):
    types = _getBrowseTermTypesDict(session)
    query = session.query(model.BrowseTerm)
    query = query.filter(and_(
        model.BrowseTerm.termTypeID == types['domain'].id,
            model.BrowseTerm.encodedID.ilike('%s%%' % eidLike)))
    query = query.order_by(model.BrowseTerm.encodedID)
    return query.all()

@_transactional(readOnly=True)
def getBrowseTermsByName(session, name, termTypeID=None):
    return _getBrowseTermsByName(session, name, termTypeID=termTypeID)

def _getBrowseTermsByName(session, name, termTypeID=None):
    """
        Return the Browse Terms that match the given name.
    """
    query = session.query(model.BrowseTerm)
    query = query.filter_by(name=name)
    if termTypeID:
        query = query.filter_by(termTypeID=termTypeID)
    browseTerms = query.all()
    if browseTerms is None or len(browseTerms) == 0:
        return None
    return browseTerms

@_transactional(readOnly=True)
def getBrowseTermsByIDs(session, idList, pageNum=0, pageSize=0):
    """
        Return the list of BrowseTerms with given identifiers
    """
    if idList is None or len(idList) == 0:
        return []

    try:
        query = session.query(model.BrowseTerm).distinct()
        query = query.filter(model.BrowseTerm.id.in_(idList))
    except ValueError:
        pass
    page = p.Page(query, pageNum, pageSize)
    log.debug("browse terms: %d" % len(page))
    return page

@_transactional(readOnly=True)
def getBrowseTermsByType(session, termTypeID, pageNum=0, pageSize=0):
    return _getBrowseTermsByType(session, termTypeID, pageNum, pageSize)

def _getBrowseTermsByType(session, termTypeID, pageNum=0, pageSize=0):
    """
        Return the list of BrowseTerms with given type
    """
    if not termTypeID:
        return []

    try:
        query = session.query(model.BrowseTerm).distinct()
        query = query.filter(model.BrowseTerm.termTypeID == termTypeID)
    except ValueError:
        pass
    page = p.Page(query, pageNum, pageSize)
    log.debug("browse terms: %d" % len(page))
    return page

@_transactional(readOnly=True)
def getBrowseTermByName(session, name):
    """
        Return the Browse Term that matches the given name.
    """
    query = session.query(model.BrowseTerm)
    try:
        query = query.filter(model.BrowseTerm.name == name)
    except ValueError:
        pass
    browseTerms = query.all()
    if browseTerms is None or len(browseTerms) == 0:
        return None
    return browseTerms[0]

@_transactional(readOnly=True)
def getBrowseTermByIDOrName(session, idOrName, type=None):
    return _getBrowseTermByIDOrName(session, idOrName, type)

def _getBrowseTermByIDOrName(session, idOrName, type=None):
    """
        Return the Browse Term that matches the given identifier or name.
    """
    query = session.query(model.BrowseTerm)
    try:
        id = int(idOrName)
        query = query.filter(or_(model.BrowseTerm.id == id,
                                 model.BrowseTerm.name == idOrName))
    except ValueError:
        #
        #  Not numeric, can only be a title.
        #
        query = query.filter_by(name=idOrName)
    if type:
        query = query.filter_by(termTypeID=type)
    browseTerms = query.all()
    if browseTerms is None or len(browseTerms) == 0:
        return None
    return browseTerms[0]

@_transactional(readOnly=True)
def getTagTermsByIDs(session, idList, pageNum=0, pageSize=0):
    """
        Return the list of TagTerms with given identifiers
    """
    if idList is None or len(idList) == 0:
        return []

    try:
        query = session.query(model.TagTerm).distinct()
        query = query.filter(model.TagTerm.id.in_(idList))
    except ValueError:
        pass
    page = p.Page(query, pageNum, pageSize)
    log.debug("browse terms: %d" % len(page))
    return page

@_transactional(readOnly=True)
def getTagTermByName(session, name):
    return _getTagTermByName(session, name)

def _getTagTermByName(session, name):
    """
        Return the Browse Term that matches the given name.
    """
    try:
        query = session.query(model.TagTerm)
        query = query.filter(model.TagTerm.name == name)
        return _queryOne(query)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getTagTermByID(session, id):
    return _getTagTermByID(session, id)

def _getTagTermByID(session, id):
    """
        Return the Tag Term that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.TagTerm)
        query = query.filter(model.TagTerm.id == id)
        return _queryOne(query)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getTagTermByIDOrName(session, idOrName):
    return _getTagTermByIDOrName(session, idOrName)

def _getTagTermByIDOrName(session, idOrName):
    """
        Return the Browse Term that matches the given identifier or name.
    """
    query = session.query(model.TagTerm)
    try:
        id = int(idOrName)
        query = query.filter(or_(model.TagTerm.id == id,
                                 model.TagTerm.name == idOrName))
    except ValueError:
        #
        #  Not numeric, can only be a title.
        #
        query = query.filter_by(name=idOrName)
    tagTerms = query.all()
    if tagTerms is None or len(tagTerms) == 0:
        return None
    return tagTerms[0]

@_transactional()
def createTagTerm(session, **kwargs):
    return _createTagTerm(session, **kwargs)

def _createTagTerm(session, **kwargs):
    tagTerm = model.TagTerm(**kwargs)
    session.add(tagTerm)
    return tagTerm

@_transactional(readOnly=True)
def getSearchTermsByIDs(session, idList, pageNum=0, pageSize=0):
    """
        Return the list of SearchTerms with given identifiers
    """
    if idList is None or len(idList) == 0:
        return []

    try:
        query = session.query(model.SearchTerm).distinct()
        query = query.filter(model.SearchTerm.id.in_(idList))
    except ValueError:
        pass
    page = p.Page(query, pageNum, pageSize)
    log.debug("browse terms: %d" % len(page))
    return page

@_transactional(readOnly=True)
def getSearchTermByName(session, name):
    return _getSearchTermByName(session, name)

def _getSearchTermByName(session, name):
    """
        Return the Browse Term that matches the given name.
    """
    try:
        query = session.query(model.SearchTerm)
        query = query.filter(model.SearchTerm.name == name)
        return _queryOne(query)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getSearchTermByID(session, id):
    return _getSearchTermByID(session, id)

def _getSearchTermByID(session, id):
    """
        Return the Search Term that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.SearchTerm)
        query = query.filter(model.SearchTerm.id == id)
        return _queryOne(query)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getSearchTermByIDOrName(session, idOrName):
    return _getSearchTermByIDOrName(session, idOrName)

def _getSearchTermByIDOrName(session, idOrName):
    """
        Return the Browse Term that matches the given identifier or name.
    """
    query = session.query(model.SearchTerm)
    try:
        id = int(idOrName)
        query = query.filter(or_(model.SearchTerm.id == id,
                                 model.SearchTerm.name == idOrName))
    except ValueError:
        #
        #  Not numeric, can only be a title.
        #
        query = query.filter_by(name=idOrName)
    searchTerms = query.all()
    if searchTerms is None or len(searchTerms) == 0:
        return None
    return searchTerms[0]

@_transactional()
def createSearchTerm(session, **kwargs):
    return _createSearchTerm(session, **kwargs)

def _createSearchTerm(session, **kwargs):
    searchTerm = model.SearchTerm(**kwargs)
    session.add(searchTerm)
    return searchTerm

@_transactional(readOnly=True)
def getBrowseTermsSynonyms(session, ids):
    query = session.query(model.BrowseTermHasSynonyms).filter(model.BrowseTermHasSynonyms.termID.in_(ids))
    return query.all()

@_transactional(readOnly=True)
def getBrowseTermSynonyms(session, id):
    """
        Return the list of synonyms for given term id
    """
    query = session.query(model.BrowseTermHasSynonyms).filter(model.BrowseTermHasSynonyms.termID == id)
    synonyms = query.all()
    if synonyms is None or len(synonyms) == 0:
        return None
    return synonyms

@_transactional(readOnly=True)
def getBrowseTermDescendants(session, id, levels=None):
    return _getBrowseTermDescendants(session=session, id=id, levels=levels)

def _getBrowseTermDescendants(session, id, levels=None):
    """ Return the list of descendents for given term id """
    log.debug("Getting browseTerm by id: %s" % id)
    browseTerm = _getUnique(session, model.BrowseTerm, 'id', id)
    if not browseTerm:
        return None
    descendents = [browseTerm]
    lvl = 0
    idx = 0
    while idx < len(descendents):
        if levels and lvl >= levels:
            break
        browseTerm = descendents[idx]
        if browseTerm:
            log.debug("Getting browseTerm children by id: %s" % browseTerm.id)
            query = session.query(model.BrowseTerm)
            query = query.filter(model.BrowseTerm.parentID == browseTerm.id)
            children = query.all()
            descendents.extend(children)
        else:
            break
        lvl += 1
        idx += 1
    if descendents and len(descendents) > 1:
        return descendents[1:]
    return []

@_transactional(readOnly=True)
def getBrowseTermsAncestors(session, ids):
    ancestors = {}
    ids2Query = ids[:]
    cnt = 0
    while len(ids2Query) > 0:
        query = session.query(model.BrowseTerm)
        query = query.filter(model.BrowseTerm.id.in_(ids2Query))
        ids2Query = []
        for bt in query.all():
            if bt.parentID:
                ids2Query.append(bt.parentID)
            if cnt > 0:
                ancestors[bt.id] = bt
        cnt += 1
    return ancestors.values()

@_transactional(readOnly=True)
def getBrowseTermAncestors(session, id):
    """ Return the list of ancestors for given term id """
    log.debug("Getting browseTerm by id: %s" % id)
    browseTerm = _getUnique(session, model.BrowseTerm, 'id', id)
    if not browseTerm:
        return None
    ancestors = []
    while True:
        if browseTerm and browseTerm.parent:
            ancestors.append(browseTerm.parent)
            log.debug("Getting browseTerm parent by id: %s" % browseTerm.parent.id)
            browseTerm = _getUnique(session, model.BrowseTerm, 'id', browseTerm.parent.id)
        else:
            break
    return ancestors

@_transactional(readOnly=True)
def getBrowseTerm(session, name, browseTermTypeID):
    return _getBrowseTerm(session, name, browseTermTypeID)

def _getBrowseTerm(session, name, browseTermTypeID):
    """
        Return the Browse Term that matches the given name and type.
    """
    query = session.query(model.BrowseTerm)
    query = query.filter(and_(model.BrowseTerm.name == name,
                  model.BrowseTerm.termTypeID == browseTermTypeID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getBrowseTerms(session, term=None, parent=None, termType=None, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTerm)
    if term is not None:
        term = '%' + term + '%'
        query = query.filter(model.BrowseTerm.name.ilike(term))
    if parent is not None:
        query = query.filter_by(parentID=parent.id)
    if termType is not None:
        query = query.filter_by(termTypeID=termType.id)
    page = p.Page(query, pageNum, pageSize, tableName='BrowseTerms')
    return page

def _getBrowseTerms(session, terms, termTypeIDs=None, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTerm)
    query = query.filter(model.BrowseTerm.name.in_(terms))
    if termTypeIDs:
        query = query.filter(model.BrowseTerm.termTypeID.in_(termTypeIDs))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def isBrowseTermExists(session, **kwargs):
    """
    """
    domainType = _getBrowseTermTypeByName(session, 'domain')
    termTypeID = domainType.id
    passKey = kwargs.get('passKey', None)
    if not passKey or passKey != 'I@mSt$':
        raise Exception('Cannot access a domain type term. Must be access through taxonomy service.')
    parentEncodedID = kwargs.get('parentEncodedID', None)
    encodedID = kwargs.get('encodedID', '')
    eids = encodedID.split('.')
    noOfParts = len(eids)
    if not parentEncodedID:
        if noOfParts >= 3:
            log.info('No parentEncodedID specified for ConceptNode')
            branchEncodedID = '%s.%s' % (eids[0], eids[1])
            branchTerm = _getBrowseTermByEncodedID(session, encodedID=branchEncodedID)
            if not branchTerm:
                raise Exception('No domain term exists in flx for the encodedID:%s' %branchEncodedID)
            kwargs['parentID'] = branchTerm.id
        elif noOfParts == 2:
            log.info('No parentEncodedID specified for SubjectNode')
            subjectEncodedID = '%s' % eids[0]
            subjectTerm = _getBrowseTermByEncodedID(session, encodedID=subjectEncodedID)
            if not subjectTerm:
                raise Exception('No domain term exists in flx for the encodedID:%s' %subjectEncodedID)
            kwargs['parentID'] = subjectTerm.id
        elif noOfParts == 1:
            log.info('No parentEncodedID specified for BranchNode')
            CKTTerm = _getBrowseTermByEncodedID(session, encodedID='CKT')
            kwargs['parentID'] = CKTTerm.id
    else:
        del kwargs['parentEncodedID']
        parentTerm = _getBrowseTermByEncodedID(session, encodedID=parentEncodedID)
        if parentTerm:
            kwargs['parentID'] = parentTerm.id

    encodedID = kwargs['encodedID']
    name = kwargs['name']
    handle = kwargs['handle']
    parentID = kwargs.get('parentID')

    member = _getInstance(session, kwargs['creator'], model.Member)

    # Verify that if browseTerm exists.
    query = session.query(model.BrowseTerm)
    if parentID:
        query = query.filter(or_(
            model.BrowseTerm.encodedID.op('regexp')(getRegExpForEncodedID(encodedID)), 
                and_(model.BrowseTerm.name == name,
                    model.BrowseTerm.termTypeID == termTypeID, model.BrowseTerm.parentID == parentID),
                and_(model.BrowseTerm.handle == handle, model.BrowseTerm.termTypeID == termTypeID)))
    else:
        query = query.filter(or_(model.BrowseTerm.encodedID.op('regexp')(getRegExpForEncodedID(encodedID)), 
            and_(model.BrowseTerm.name == name, model.BrowseTerm.termTypeID == termTypeID),
            and_(model.BrowseTerm.handle == handle, model.BrowseTerm.termTypeID == termTypeID)))

    if query.count():
        return (True, 'Browseterm already exists.')

    # Verify that if artifact exists.
    creatorID = member.id
    artifact = _getArtifactByHandle(session, handle, termTypeID, creatorID)
    if artifact:
        return (True, ('Artifact with handle: %s exists.' % handle).encode('utf-8'))

    return (False, '')

def _getPreDomains(session, domainID):
    """
        Return the domains that are pre-requisite of the given domainID.
    """
    query = session.query(model.DomainNeighbor)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(domainID=domainID)
    return query.all()

def _getPreDomainIDs(session, domainID):
    """
        Return the domainIDs that are pre-requisite of the given domainID.
    """
    pre = _getPreDomains(session, domainID)
    ids = []
    for p in pre:
        ids.append(p.requiredDomainID)
    return ids

@_transactional(readOnly=True)
def getPreDomainIDs(session, domainID):
    """
        Return the domainIDs that are pre-requisite of the given domainID.
    """
    return _getPreDomainIDs(session, domainID)

def _getPostDomains(session, domainID):
    """
        Return the domains that are post-requisite of the given domainID.
    """
    query = session.query(model.DomainNeighbor)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(requiredDomainID=domainID)
    return query.all()

def _getPostDomainIDs(session, domainID):
    """
        Return the domainIDs that are post-requisite of the given domainID.
    """
    post = _getPostDomains(session, domainID)
    ids = []
    for p in post:
        ids.append(p.domainID)
    return ids

@_transactional(readOnly=True)
def getPostDomainIDs(session, domainID):
    """
        Return the domainIDs that are post-requisite of the given domainID.
    """
    return _getPostDomainIDs(session, domainID)

@_transactional(readOnly=True)
def getDomainNeighbors(session, domainID):
    """
        Return the domainIDs for both the pre-requisite and post-requisite
        of the given domainID.
    """
    pre = _getPreDomainIDs(session, domainID)
    post = _getPostDomainIDs(session, domainID)
    return pre, post

@_transactional(readOnly=True)
def getDomainNeighborDicts(session, domainID):
    """
        Return the BrowseTerm objects for both the pre-requisite and post-requisite
        of the given domainID
    """
    preDicts = []
    postDicts = []
    pre = _getPreDomains(session, domainID)
    for item in pre:
        preDicts.append({'id': item.requiredDomainID, 'term': item.requiredDomain.name})
    post = _getPostDomains(session, domainID)
    for item in post:
        postDicts.append({'id': item.domainID, 'term': item.domain.name})
    return preDicts, postDicts

@_transactional(readOnly=True)
def getPreEncodedID(session, encodedID):
    """
        Return the prerequisite of the given encodedID.
    """
    query = session.query(model.EncodedIDNeighbor)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(encodedID=encodedID)
    encodedIDNeighbor = query.first()
    if encodedIDNeighbor is None:
        return None

    return encodedIDNeighbor.requiredEncodedID

@_transactional(readOnly=True)
def getPostEncodedID(session, encodedID):
    """
        Return the prerequisite of the given encodedID.
    """
    query = session.query(model.EncodedIDNeighbor)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(requiredEncodedID=encodedID)
    encodedIDNeighbor = query.first()
    if encodedIDNeighbor is None:
        return None

    return encodedIDNeighbor.encodedID

"""
    Standard related APIs.
"""

@_transactional(readOnly=True)
def getGrades(session, idList=None, pageNum=0, pageSize=0):
    return _getGrades(session, idList, pageNum=0, pageSize=0)

def _getGrades(session, idList=None, pageNum=0, pageSize=0):
    """
        Return the Grades , unless idList is given, in which case, only
        those in the list will be returned.
    """
    query = session.query(model.Grade)
    query = query.prefix_with('SQL_CACHE')
    if idList is not None and len(idList) > 0:
        query = query.filter(model.Grade.id.in_(idList))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getGradeByID(session, id):
    return _getGradeByID(session, id)

def _getGradeByID(session, id):
    """
        Return the Grade that matches the given identifier.
    """
    try:
        id = long(id)
        return _getUnique(session, model.Grade, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getGradeByName(session, name):
   return _getGradeByName(session, name)

def _getGradeByName(session, name):
    """
        Return the Grade that matches the given name.
    """
    query = session.query(model.Grade)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.Grade.name.ilike(name))
    return _queryOne(query)

@_transactional(readOnly=True)
def getGradesDict(session):
    gradeDict = {}
    query = session.query(model.Grade)
    query = query.prefix_with('SQL_CACHE')
    grades = query.all()
    if grades:
        for grade in grades:
            gradeDict[grade.name.lower()] = grade
            if grade.name.lower() == 'k':
                gradeDict['0'] = grade
    return gradeDict

@_transactional(readOnly=True)
def getSubjectsDict(session):
    return _getSubjectsDict(session)

def _getSubjectsDict(session):
    subjectsDict = {}
    query = session.query(model.Subject)
    query = query.prefix_with('SQL_CACHE')
    subjects = query.all()
    if subjects:
        for subject in subjects:
            subjectsDict[subject.name.lower()] = subject
    return subjectsDict

@_transactional(readOnly=True)
def getSubjects(session, idList=None, pageNum=0, pageSize=0):
    """
        Return the Subjects, unless idList is given, in which case, only
        those in the list will be returned.
    """
    query = session.query(model.Subject)
    query = query.prefix_with('SQL_CACHE')
    if idList is not None and len(idList) > 0:
        query = query.filter(model.Subject.id.in_(idList))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getSubjectByID(session, id):
    """
        Return the Subject that matches the given identifier.
    """
    try:
        id = long(id)
        return _getUnique(session, model.Subject, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getSubjectByName(session, name):
    """
        Return the Subject that matches the given name.
    """
    query = session.query(model.Subject)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.Subject.name == name)
    subjects = query.all()

    if not subjects:
        query = session.query(model.Subject)
        query = query.prefix_with('SQL_CACHE')
        name = '%' + name + '%'
        query = query.filter(model.Subject.name.ilike(name))
        subjects = query.all()

    if subjects:
        return subjects[0]
    return None

@_transactional(readOnly=True)
def getStandardBoards(session, idList=None, pageNum=0, pageSize=0, BoardsList=False):
    """
        Return the StandardBoards, unless idList is given, in which case, only
        those in the list will be returned.
    """
    query = session.query(model.StandardBoard)
    query = query.prefix_with('SQL_CACHE')
    if idList is not None and len(idList) > 0:
        query = query.filter(model.StandardBoard.id.in_(idList))
    query = query.order_by(model.StandardBoard.sequence, model.StandardBoard.longname)
    if BoardsList:
        boards = []
        for bd in query.all():
            boards.append({'id': bd.id, 'name': bd.name, 'longname': bd.longname, 'countryID': bd.countryID, 'sequence': bd.sequence})
        return boards
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getStandardBoardByID(session, id):
    """
        Return the StandardBoard that matches the given identifier.
    """
    try:
        id = long(id)
        return _getUnique(session, model.StandardBoard, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getStandardBoardByName(session, name, country=None):
    """
        Return the standard board that matches the given name.
    """
    if country is None:
        country = _getCountry(session, code2Letter='US')
    query = session.query(model.StandardBoard)
    query = query.prefix_with('SQL_CACHE')
    #name = '%' + name + '%'
    standardBoard = query.filter(model.StandardBoard.name == name).filter_by(countryID=country.id).one()
    return standardBoard

@_transactional(readOnly=True)
def getStandardSubjects(session, standardBoardIDs=None, grades=None):
    query = session.query(model.StandardsBoardsSubjectsAndGrades.subjectID,
            model.StandardsBoardsSubjectsAndGrades.subjectName).distinct()
    query = query.prefix_with('SQL_CACHE')
    if standardBoardIDs:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.standardBoardID.in_(standardBoardIDs))
    if grades:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.grades.in_(grades))
    query = query.filter(and_(model.StandardsBoardsSubjectsAndGrades.title != None,
        model.StandardsBoardsSubjectsAndGrades.title != ''))
    query = query.order_by(model.StandardsBoardsSubjectsAndGrades.subjectName)
    subjects = []
    for r in query.all():
        subjects.append({'id': r.subjectID, 'name': r.subjectName.lower()})
    return subjects

@_transactional(readOnly=True)
def getStandardBoardsForSubjectsGrades(session, subjects=None, grades=None):
    query = session.query(model.StandardsBoardsSubjectsAndGrades.standardBoardID,
            model.StandardsBoardsSubjectsAndGrades.boardName,
            model.StandardsBoardsSubjectsAndGrades.boardLongName,
            model.StandardsBoardsSubjectsAndGrades.countryID).distinct()
    query = query.prefix_with('SQL_CACHE')
    if subjects:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.subjectName.in_(subjects))
    if grades:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.gradeName.in_(grades))
    query = query.filter(and_(model.StandardsBoardsSubjectsAndGrades.title != None,
        model.StandardsBoardsSubjectsAndGrades.title != ''))
    query = query.order_by(model.StandardsBoardsSubjectsAndGrades.sequence, model.StandardsBoardsSubjectsAndGrades.boardLongName)
    boards = []
    for r in query.all():
        boards.append({'id': r.standardBoardID, 'name': r.boardName, 'longname': r.boardLongName, 'countryID': r.countryID})
    return boards

@_transactional(readOnly=True)
def getStandardGradesForSubjectsBoards(session, subjects=None, standardBoardIDs=None):
    query = session.query(model.StandardsBoardsSubjectsAndGrades.gradeID,
            model.StandardsBoardsSubjectsAndGrades.gradeName).distinct()
    query = query.prefix_with('SQL_CACHE')
    if subjects:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.subjectName.in_(subjects))
    if standardBoardIDs:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.standardBoardID.in_(standardBoardIDs))
    query = query.filter(and_(model.StandardsBoardsSubjectsAndGrades.title != None,
        model.StandardsBoardsSubjectsAndGrades.title != ''))
    query = query.order_by(func.abs(model.StandardsBoardsSubjectsAndGrades.gradeName))
    grades = []
    for r in query.all():
        grades.append({'id': r.gradeID, 'name': r.gradeName})
    return grades

@_transactional(readOnly=True)
def browseStandards(session, title=None, standardBoardIDs=None, subjects=None, grades=None, pageNum=0, pageSize=0):
    """
        Browse standards by boards, subjects and grades - all are optional
    """
    query = session.query(distinct(model.StandardsBoardsSubjectsAndGrades.id))
    query = query.prefix_with('SQL_CACHE')
    if title:
        query = query.filter(or_(
            model.StandardsBoardsSubjectsAndGrades.description.ilike('%%%s%%' % title),
            model.StandardsBoardsSubjectsAndGrades.section.ilike('%%%s%%' % title),
            model.StandardsBoardsSubjectsAndGrades.boardName.ilike('%%%s%%' % title),
            model.StandardsBoardsSubjectsAndGrades.boardLongName.ilike('%%%s%%' % title)
            ))
    if standardBoardIDs:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.standardBoardID.in_(standardBoardIDs))
    if subjects:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.subjectName.in_(subjects))
    if grades:
        query = query.filter(model.StandardsBoardsSubjectsAndGrades.gradeName.in_(grades))

    query = query.filter(and_(model.StandardsBoardsSubjectsAndGrades.title != None,
        model.StandardsBoardsSubjectsAndGrades.title != ''))
    query = query.order_by(model.StandardsBoardsSubjectsAndGrades.sequence,
            model.StandardsBoardsSubjectsAndGrades.standardBoardID,
            model.StandardsBoardsSubjectsAndGrades.section,
            model.StandardsBoardsSubjectsAndGrades.subjectName,
            model.StandardsBoardsSubjectsAndGrades.gradeName)
    log.info("Query: %s" % query)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getStandardsByIDs(session, ids):
    if not ids:
        return []
    query = session.query(model.Standard)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.Standard.id.in_(ids))
    standards = query.all()

    ## Make sure the order is same as the ids order
    standards = sorted(standards, cmp=lambda x,y: cmp(ids.index(x.id), ids.index(y.id)))
    return standards

@_transactional(readOnly=True)
def getStandards(session, section=None, standardBoard=None, subject=None, pageNum=0, pageSize=0):
    """
        Return the standards. Optionally, section, standard board, or subject
        can be given.
    """
    query = session.query(model.Standard)
    query = query.prefix_with('SQL_CACHE')
    if section is not None:
        section = '%' + section + '%'
        query = query.filter(model.Standard.section.ilike(section))
    if standardBoard is not None:
        if type(standardBoard) is model.StandardBoard:
            query = query.filter_by(standardBoardID=standardBoard.id)
        else:
            query = query.filter(model.StandardBoard.name == standardBoard)
    if subject is not None:
        if type(subject) is model.Subject:
            query = query.filter_by(subjectID=subject.id)
        else:
            query = query.filter(model.Subject.name == subject)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getCorrelatedStandards(session, artifactRevisionIDs, standardBoardID=None):
    return _getCorrelatedStandards(session, artifactRevisionIDs, standardBoardID)

def _getCorrelatedStandards(session, artifactRevisionIDs, standardBoardID=None):
    query = session.query(model.RevisionAndStandards)
    query = query.filter(model.RevisionAndStandards.rid.in_(artifactRevisionIDs))
    if standardBoardID:
        query = query.filter(model.RevisionAndStandards.boardID == standardBoardID)
    return query.all()

@_transactional(readOnly=True)
def getCorrelatedStandardBoardsForArtifactRevisions(session, artifactRevisionIDs):
    boardIDs = []
    if artifactRevisionIDs:
        query = session.query(model.RevisionAndStandards.boardID).distinct()
        query = query.filter(model.RevisionAndStandards.rid.in_(artifactRevisionIDs))
        boardIDs = [ r.boardID for r in query.all() ]
    if boardIDs:
        query = session.query(model.StandardBoard)
        query = query.prefix_with('SQL_CACHE')
        query = query.filter(model.StandardBoard.id.in_(boardIDs))
        return query.all()
    return []

@_transactional(readOnly=True)
def getStandard(session, standardBoardID, subjectID, section):
    """
        Return the standard that matches the given key.
    """
    query = session.query(model.Standard)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(and_(model.Standard.standardBoardID == standardBoardID,
                  model.Standard.subjectID == subjectID,
                  model.Standard.section == section))
    return _queryOne(query)

@_transactional(readOnly=True)
def getStandardByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Standard, 'id', id)
    except:
        return None

@_transactional(readOnly=True)
def getCountryByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Country, 'id', id)
    except:
        return None

@_transactional(readOnly=True)
def getCountryByName(session, name):
    return _getCountryByName(session, name)

def _getCountryByName(session, name):
    query = session.query(model.Country)
    query = query.prefix_with('SQL_CACHE')    
    try:
        country = query.filter(model.Country.name.ilike(name)).one()    
    except:
        country = None 
    return country
    
@_transactional(readOnly=True)
def getCountry(session, code2Letter):
    return _getCountry(session, code2Letter)

def _getCountry(session, code2Letter):
    query = session.query(model.Country)
    query = query.prefix_with('SQL_CACHE')
    country = query.filter_by(code2Letter=code2Letter).one()
    return country

def _aggregateArtifactRating(session, artifactRatings):
    """
        Return the aggregate rating for an artifact
    """
    ratingDict = {}
    for i in range(1,6):
        ratingDict[str(i)] = 0
    ratingDict['average'] = 0
    totalCount = 0
    totalRating = 0
    for eachArtifactRating in artifactRatings:
        count = eachArtifactRating.count
        rating = eachArtifactRating.score
        ratingDict[str(rating)] = count
        totalCount = totalCount + count
        totalRating = totalRating + count*rating
    if totalCount != 0:
        ratingDict['average'] = round(totalRating/float(totalCount), 1)
    ratingDict['count'] = totalCount
    return ratingDict

def _aggregateArtifactVoting(session, artifactVotings):
    """
        Return the aggregate voting for an artifact
    """
    votingDict = {}
    votingDict['like'] = 0
    votingDict['dislike'] = 0
    for eachArtifactVoting in artifactVotings:
        if eachArtifactVoting.score == -1:
            votingDict['dislike'] = eachArtifactVoting.count
        elif eachArtifactVoting.score == 1:
            votingDict['like'] = eachArtifactVoting.count
    return votingDict

@_transactional(readOnly=True)
def getArtifactsFeedbacks(session, **kwargs):
    return _getArtifactsFeedbacks(session, **kwargs)

def _getArtifactsFeedbacks(session, **kwargs):
    """
        Returns average value and count of the ratings for multiple artifacts
    """
    _checkAttributes([ 'artifactIDList'], **kwargs)
    artifactIDList = kwargs['artifactIDList']
    rating_list = []
    if not artifactIDList:
        return rating_list

    query = session.query(model.ArtifactFeedbackAndCount)
    query = query.filter(model.ArtifactFeedbackAndCount.artifactID.in_(artifactIDList))
    query = query.order_by(model.ArtifactFeedbackAndCount.artifactID)
    artifactFeedbacks = query.all()
    artifactFeedbacksDict = {}
    for eachArtifactID in artifactIDList:
        log.info('ArtifactID: %s' %(eachArtifactID))
        artifactFeedbacksDict[eachArtifactID] = {}
        artifactRating = []
        artifactVoting = []
        for eachArtifactFeedback in artifactFeedbacks:
            if eachArtifactFeedback.artifactID == eachArtifactID:
                if eachArtifactFeedback.type == 'rating':
                    artifactRating.append(eachArtifactFeedback)
                else:
                    artifactVoting.append(eachArtifactFeedback)
        ratingDict = _aggregateArtifactRating(session, artifactRating)
        votingDict = _aggregateArtifactVoting(session, artifactVoting)
        artifactFeedbacksDict[eachArtifactID]['rating'] = ratingDict
        artifactFeedbacksDict[eachArtifactID]['vote'] = votingDict
    return artifactFeedbacksDict




@_transactional(readOnly=True)
def getGetRealFeedbacks(session, **kwargs):
    return _getGetRealFeedbacks(session, **kwargs)

def _getGetRealFeedbacks(session, **kwargs):
    """
        Returns average value and count of the ratings for multiple artifacts
    """
    _checkAttributes([ 'artifactIDList'], **kwargs)
    artifactIDList = kwargs['artifactIDList']
    rating_list = []
    if not artifactIDList:
        return rating_list
    CRITERIA_WEIGHTS = {'relevance': 35,'creativity': 20,'clarity': 20,'impactful': 25}
    group = _getGroupByNameAndCreator(session, groupName='CK-12 Get Real Judges', creatorID=1)
    getRealJudges = _getGroupMembers(session, group=group, pageNum=1, pageSize=100)
    log.info(getRealJudges)
    getRealJudgesMemberID = [x.GroupHasMembers.memberID for x in getRealJudges]

    query = session.query(model.ArtifactFeedback)
    query = query.filter(model.ArtifactFeedback.artifactID.in_(artifactIDList))
    query = query.order_by(model.ArtifactFeedback.artifactID)
    getRealFeedbacks = query.all()
    getRealFeedbacksDict = {}
    for eachArtifact in artifactIDList:
        getRealFeedbacksDict[eachArtifact] = {'publicscore': 0, 'officialscore': 0}

    for eachFeedback in getRealFeedbacks:
        artifactID = str(eachFeedback.artifactID)
        if not getRealFeedbacksDict.has_key(artifactID):
            getRealFeedbacksDict[artifactID] = {'publicscore': 0, 'officialscore': 0}
        if eachFeedback.memberID in getRealJudgesMemberID:
            getRealFeedbacksDict[artifactID]['officialscore'] = getRealFeedbacksDict[artifactID]['officialscore'] + CRITERIA_WEIGHTS.get(eachFeedback.type, 0)*eachFeedback.score
        else:
            getRealFeedbacksDict[artifactID]['publicscore'] = getRealFeedbacksDict[artifactID]['publicscore'] + CRITERIA_WEIGHTS.get(eachFeedback.type, 0)*eachFeedback.score

    weight_query = 'select weight from GetRealJudgesWeight;'
    weight = session.execute(weight_query).fetchall()[0][0]
    for artifactID in getRealFeedbacksDict.keys():
        getRealFeedbacksDict[artifactID]['totalscore'] = getRealFeedbacksDict[artifactID]['publicscore'] + getRealFeedbacksDict[artifactID]['officialscore']*weight
    return getRealFeedbacksDict


@_transactional(readOnly=True)
def getArtifactComments(session, **kwargs):
    return _getArtifactComments(session, **kwargs)

def _getArtifactComments(session, **kwargs):
    """
        Returns average value and count of the ratings for multiple artifacts
    """
    _checkAttributes([ 'artifactID'], **kwargs)
    artifactID = kwargs['artifactID']
    userID = kwargs['userID']
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    comments = []
    query = session.query(model.ArtifactFeedback)
    query = query.filter(and_(model.ArtifactFeedback.artifactID==artifactID, model.ArtifactFeedback.comments!=None))
    query = query.order_by(model.ArtifactFeedback.creationTime.desc())
    page = p.Page(query, pageNum, pageSize, tableName='ArtifactFeedbacks')
    for eachArtifactFeedback in page:
        if eachArtifactFeedback.comments:
            feedbackDict = eachArtifactFeedback.asDict()
            feedbackDict['memberName'] = eachArtifactFeedback.member.fix().name
            feedbackDict['hasReportedAbuse'] = False
            abuse = session.query(model.ArtifactFeedbackAbuseReport).filter(and_(
                                        model.ArtifactFeedbackAbuseReport.artifactID == artifactID,
                                        model.ArtifactFeedbackAbuseReport.memberID == eachArtifactFeedback.memberID,
                                        model.ArtifactFeedbackAbuseReport.reporterMemberID == userID))
            abuse = _queryOne(abuse)
            if abuse:
                feedbackDict['hasReportedAbuse'] = True
            comments.append(feedbackDict)
    return comments, page.getTotal()

@_transactional(readOnly=True)
def getArtifactAbusedComments(session, commentType='feedback', fq = None, pageNum=0, pageSize=0, sort=None):
    page = _getArtifactAbusedComments(session, commentType, fq, pageNum, pageSize, sort)
    abusedComments = []
    for comments in page:
        abusedComments.append({'artifactID': comments[0], \
                           'memberID' : comments[1], \
                           'comment' : comments[2], \
                           'notAbuse' : comments[3], \
                           'creationTime' : comments[4], \
                           'reporterID' : comments[5], \
                           'reviewID' : comments[6], \
                           'commentType' : comments[7]})
    return abusedComments, page.getTotal()

def _getArtifactAbusedComments(session, commentType='feedback', fq = None, pageNum=0, pageSize=0, sorting=None):
    """
        Return the  artifact feedbacks which are marked as abused by users.
    """
    fields = {
        'artifactID': model.ArtifactFeedback.artifactID,
        'memberID': model.ArtifactFeedback.memberID
    }
    tableMap = {
        'artifactID' : model.ArtifactFeedback.artifactID,
        'memberID' : model.ArtifactFeedback.memberID,
    }
    if commentType == 'feedback':
        query = session.query( model.ArtifactFeedback.artifactID.label('artifactID'), model.ArtifactFeedback.memberID.label('memberID'),
                           model.ArtifactFeedback.comments.label('comments'), model.ArtifactFeedback.notAbuse.label('notAbuse'),
                           model.ArtifactFeedback.creationTime.label('creationTime'), model.ArtifactFeedbackAbuseReport.reporterMemberID.label('reporterMemberID'),
                           literal(None).label('reviewID'), literal('feedback').label('commentType'))
        query = query.filter( and_(model.ArtifactFeedback.artifactID ==  model.ArtifactFeedbackAbuseReport.artifactID, \
                                model.ArtifactFeedback.memberID == model.ArtifactFeedbackAbuseReport.memberID))
        query = query.group_by(model.ArtifactFeedback.artifactID )
        query = query.group_by(model.ArtifactFeedback.memberID )
    else:
        fields = {
          'artifactID': model.ArtifactFeedbackReview.artifactID,
          'memberID': model.ArtifactFeedbackReview.memberID
        }
        tableMap = {
            'artifactID' : model.ArtifactFeedbackReview.artifactID,
            'memberID' : model.ArtifactFeedbackReview.memberID,
        }
        query = session.query( model.ArtifactFeedbackReview.artifactID.label('artifactID'), model.ArtifactFeedbackReview.reviewersMemberID.label('memberID'),
                               model.ArtifactFeedbackReview.reviewComment.label('comments'), model.ArtifactFeedbackReview.notAbuse.label('notAbuse'),
                               model.ArtifactFeedbackReview.creationTime.label('creationTime'), model.ArtifactFeedbackReviewAbuseReport.reporterMemberID.label('reporterMemberID'),
                               model.ArtifactFeedbackReview.id.label('reviewID'), literal('review').label('commentType'))

        query = query.filter(model.ArtifactFeedbackReview.id ==  model.ArtifactFeedbackReviewAbuseReport.artifactFeedbackReviewID)
        query = query.group_by(model.ArtifactFeedbackReview.artifactID )
        query = query.group_by(model.ArtifactFeedbackReview.memberID )

    filterDict = {}
    if fq:
        for filterFld, filt in fq:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld is not None and filt is not None:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filt)

    if filterDict:
        for filterFld in filterDict.keys():
            filt = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filt))
            query = query.filter(fields[filterFld].in_(filt))

    #query = query.all()

    if sorting is None or len(sorting) == 0:
        field = tableMap['artifactID']
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = tableMap[sList[0]]
        order = sList[1] if len(sList) > 1 else 'asc'

    if order == 'asc':
        query = query.order_by(asc( field ) )
    else :
        query = query.order_by(desc(  field ) )

    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getFeedbackReviewByID(session, id):
    return _getFeedbackReviewByID(session, id=id)

def _getFeedbackReviewByID(session, id):
    """
        Returns review by ID
    """
    try:
        id = long(id)
        return _getUnique(session, model.ArtifactFeedbackReview, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getFeedbackReviews(session, **kwargs):
    return _getFeedbackReviews(session, **kwargs)

def _getFeedbackReviews(session, **kwargs):
    """
        Returns reviews and the total number of reviews
    """
    _checkAttributes([ 'artifactID','memberID','type'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    userID = kwargs['userID']
    if artifactID is None or memberID is None:
        return None,0
    type = kwargs['type']
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    reviews = []
    query = session.query(model.ArtifactFeedbackReview)
    query = query.filter(and_(model.ArtifactFeedbackReview.artifactID==artifactID,model.ArtifactFeedbackReview.memberID==memberID,model.ArtifactFeedbackReview.type==type, model.ArtifactFeedbackReview.reviewComment!=None))
    query = query.order_by(model.ArtifactFeedbackReview.creationTime.desc())
    page = p.Page(query, pageNum, pageSize, tableName='ArtifactFeedbackReviews')
    for eachArtifactFeedbackReview in page:
        if eachArtifactFeedbackReview.reviewComment:
            feedbackReviewDict = eachArtifactFeedbackReview.asDict()
            feedbackReviewDict['reviewersMemberName'] = eachArtifactFeedbackReview.member.fix().name

            feedbackReviewDict['hasReportedAbuse'] = False
            abuse = session.query(model.ArtifactFeedbackReviewAbuseReport).filter(and_(
                                        model.ArtifactFeedbackReviewAbuseReport.artifactFeedbackReviewID == eachArtifactFeedbackReview.id,
                                        model.ArtifactFeedbackReviewAbuseReport.reporterMemberID == userID))
            abuse = _queryOne(abuse)
            if abuse:
                feedbackReviewDict['hasReportedAbuse'] = True

            reviews.append(feedbackReviewDict)
    return reviews, page.getTotal()


@_transactional(readOnly=True)
def getArtifactFeedbacksByMember(session, **kwargs):
    return _getArtifactFeedbacksByMember(session, **kwargs)

def _getArtifactFeedbacksByMember(session, **kwargs):
    """
        Return the rating for an artifact given by the user
    """
    _checkAttributes([ 'artifactID', 'memberID'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    rating_dict = {}
    if artifactID is None or memberID is None:
        return rating_dict
    query = session.query(model.ArtifactFeedback)
    query = query.filter(and_(model.ArtifactFeedback.artifactID==artifactID, model.ArtifactFeedback.memberID==memberID))
    artifactFeedbacks = query.all()
    artifactFeedbacksDict = {}
    for eachArtifactFeedback in artifactFeedbacks:
        artifactFeedbacksDict[eachArtifactFeedback.type] = eachArtifactFeedback.asDict()
    return artifactFeedbacksDict

@_transactional(readOnly=True)
def getAllArtifactFeedbacksByMember(session, memberID, filters={}, sort=None, pageNum=0, pageSize=0):
    return _getAllArtifactFeedbacksByMember(session, memberID, filters={}, sort=None, pageNum=pageNum, pageSize=pageSize)

def _getAllArtifactFeedbacksByMember(session, memberID, filters=None, sort=None, pageNum=0, pageSize=0):
    """
        Return the feedbacks by the user
    """
    fields = {
                'memberID':     model.ArtifactFeedback.memberID,
                'artifactID':   model.ArtifactFeedback.artifactID,
                'score':        model.ArtifactFeedback.score,
                'type':         model.ArtifactFeedback.type,
            }

    sortFields = {}
    sortFields.update(fields)
    sortFields.update({
        'created': model.ArtifactFeedback.creationTime,
    })

    artifactFeedbacksDict = {}
    if memberID is None:
        return artifactFeedbacksDict
    query = session.query(model.ArtifactFeedback)
    query = query.filter(model.ArtifactFeedback.memberID==memberID)

    filterDict = {}
    if filters:
        for filterFld, filter in filters():
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if not sort:
        sort = 'artifactID,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in sortFields:
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    page = p.Page(query, pageNum, pageSize)
    return page


@_transactional(readOnly=True)
def getArtifactFeedbacksByDateRange(session, **kwargs):
    return _getArtifactFeedbacksByDateRange(session, **kwargs)

def _getArtifactFeedbacksByDateRange(session, **kwargs):
    """
        Return the artifact feedbacks by the date
    """
    _checkAttributes(['startDatetime', 'endDatetime'], **kwargs)
    startDatetime = kwargs['startDatetime']
    endDatetime = kwargs['endDatetime']
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 100)

    if not (startDatetime and endDatetime):
        return []

    query = session.query(model.ArtifactFeedback)
    query = query.filter(and_(model.ArtifactFeedback.creationTime>=startDatetime, model.ArtifactFeedback.creationTime<=endDatetime))

    page = p.Page(query, pageNum, pageSize, tableName='ArtifactFeedbacks')
    return page

@_transactional()
def deleteArtifactFeedbackByArtifactID(session,**kwargs):
    return _deleteArtifactFeedbackByArtifactID(session, **kwargs)

def _deleteArtifactFeedbackByArtifactID(session, **kwargs):
    """
        Delete Artifact ratings
    """
    _checkAttributes([ 'artifactID'], **kwargs)
    artifactID = kwargs['artifactID']
    if artifactID is None:
        return False
    try:
        session.query(model.ArtifactFeedbackHelpful).filter(model.ArtifactFeedbackHelpful.artifactID==artifactID).delete()
        session.flush()
        session.query(model.ArtifactFeedbackReview).filter(model.ArtifactFeedbackReview.artifactID==artifactID).delete()
        session.flush()
        session.query(model.ArtifactFeedbackAbuseReport).filter(model.ArtifactFeedbackAbuseReport.artifactID==artifactID).delete()
        session.flush()
        query = session.query(model.ArtifactFeedback)
        query = query.filter(model.ArtifactFeedback.artifactID==artifactID)
        ratings = query.all()
        for each_rating in ratings:
            session.delete(each_rating)
        session.flush()
    except Exception as e:
        log.error("Error deleting ArtifactFeedbacks: %s" % str(e), exc_info=e)
        return False
    return True

@_transactional()
def deleteArtifactFeedbackByMemberID(session,**kwargs):
    return _deleteArtifactFeedbackByMemberID(session, **kwargs)

def _deleteArtifactFeedbackByMemberID(session, **kwargs):
    """
        Delete Artifact rating given by member
    """
    _checkAttributes([ 'artifactID', 'memberID', 'type'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    feedbackType = kwargs['type']
    if artifactID is None or memberID is None or feedbackType is None:
        return None
    try:
        session.query(model.ArtifactFeedbackHelpful).filter(and_(model.ArtifactFeedbackHelpful.artifactID==artifactID, model.ArtifactFeedbackHelpful.memberID==memberID, model.ArtifactFeedbackHelpful.type==feedbackType)).delete()
        session.flush()
        session.query(model.ArtifactFeedbackReview).filter(and_(model.ArtifactFeedbackReview.artifactID==artifactID, model.ArtifactFeedbackReview.memberID==memberID, model.ArtifactFeedbackReview.type==feedbackType)).delete()
        session.flush()
        session.query(model.ArtifactFeedbackAbuseReport).filter(and_(model.ArtifactFeedbackAbuseReport.artifactID==artifactID, model.ArtifactFeedbackAbuseReport.memberID==memberID)).delete()
        session.flush()
        query = session.query(model.ArtifactFeedback)
        query = query.filter(and_(model.ArtifactFeedback.artifactID==artifactID,model.ArtifactFeedback.type==feedbackType,model.ArtifactFeedback.memberID==memberID))
        artifact_rating_info = _queryOne(query)
        if artifact_rating_info:
            session.delete(artifact_rating_info)
            if kwargs.has_key('cache') and kwargs['cache']:
                cache = kwargs['cache']
                artifact = _getArtifactByID(session, id=artifactID)
                invalidateArtifact(cache, artifact, memberID=memberID)
                cache.personalCache.invalidate(memberID=kwargs['memberID'], id=kwargs['artifactID'])
        session.flush()
    except Exception as e:
        log.info(e.__str__())
        log.info(traceback.format_exc())
        return False
    return True

@_transactional()
def deleteAllArtifactFeedbackByMemberID(session,**kwargs):
    return _deleteAllArtifactFeedbackByMemberID(session, **kwargs)

def _deleteAllArtifactFeedbackByMemberID(session, **kwargs):
    """
        Delete All Artifact rating given by member
    """
    _checkAttributes(['memberID'], **kwargs)
    memberID = kwargs['memberID']
    if memberID is None:
        return None
    try:
        session.query(model.ArtifactFeedbackAbuseReport).filter(model.ArtifactFeedbackAbuseReport.memberID==memberID).delete()
        session.flush()
        query = session.query(model.ArtifactFeedback)
        query = query.filter(model.ArtifactFeedback.memberID==memberID)
        all_artifact_ratings = query.all()
        for each_rating in all_artifact_ratings:
            if each_rating:
                session.delete(each_rating)
        session.flush()
    except Exception:
        return False
    return True

def _getFavorite(session, artifactRevisionID, memberID):
    """
        Return the Favorite identified by artifactRevisionID and memberID.
    """
    query = session.query(model.ArtifactRevisionFavorite)
    query = query.filter(and_(
        model.ArtifactRevisionFavorite.artifactRevisionID == artifactRevisionID,
        model.ArtifactRevisionFavorite.memberID == memberID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getFavorite(session, artifactRevisionID, memberID):
    """
        Return the Favorite identified by artifactRevisionID and memberID.
    """
    return _getFavorite(session, artifactRevisionID, memberID)

@_transactional(readOnly=True)
def getFavorites(session, memberID, typeName=None, pageNum=0, pageSize=0):
    """
        Return the Favorite identified by memberID.
    """
    query = session.query(model.TypedArtifactFavorite)
    query = query.filter_by(memberID=memberID)
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    if typeName is not None:
        query = query.filter_by(typeName=typeName)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getFavoriteCount(session, memberID):
    """
        Return the number of Favorites a member, identified by memberID,
        has chosen.
    """
    query = session.query(model.ArtifactRevisionFavorite)
    query = query.filter_by(memberID=memberID)
    return query.count()

"""
    Feedback related APIs.
"""

'''def _getFeedback(session, artifactRevisionID, memberID):
    """
        Return the Feedback identified by artifactRevisionID and memberID.
    """
    query = session.query(model.ArtifactRevisionFeedback)
    query = query.filter(and_(
        model.ArtifactRevisionFeedback.artifactRevisionID == artifactRevisionID,
        model.ArtifactRevisionFeedback.memberID == memberID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getFeedback(session, artifactRevisionID, memberID):
    """
        Return the Feedback identified by artifactRevisionID and memberID.
    """
    return _getFeedback(session, artifactRevisionID, memberID)

@_transactional(readOnly=True)
def getFeedbackCount(session, memberID):
    """
        Return the number of Feedbacks member, identified by memberID,
        has given.
    """
    query = session.query(model.ArtifactRevisionFeedback)
    query = query.filter_by(memberID=memberID)
    return query.count()'''

"""
    Member related APIs.
"""

memberSearchAttrMap = {
    'email': model.Member.email,
    'firstName': model.Member.givenName,
    'lastName': model.Member.surname,
    'login': model.Member.login,
}


memberAttrMap = copy.copy(memberSearchAttrMap)
memberAttrMap.update({
    'id': model.Member.id,
})

memberFieldMap = {
    'firstName': 'givenName',
    'lastName': 'surname',
}

@_transactional(readOnly=True)
def getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0):
    """
        Return the Members, unless idList is given, in which case, only
        those in the list will be returned.
    """
    return _getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0)

def _getMembers(session, idList=None, sorting=None, filterDict={}, searchDict={}, searchAll=None, pageNum=0, pageSize=0):
    query = session.query(model.Member)
    if idList is not None and len(idList) > 0:
        query = query.filter(model.Member.id.in_(idList))

    if sorting is None or len(sorting) == 0:
        field = 'login'
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = sList[0]
        order = sList[1] if len(sList) > 1 else 'asc'
    attribute = memberAttrMap.get(field)
    if attribute is None:
        raise ex.InvalidArgumentException((_(u'Invalid sorting field: %(field)s')  % {"field":field}).encode("utf-8"))
    if order == 'asc':
        query = query.order_by(asc(attribute))
    else:
        query = query.order_by(desc(attribute))
    filterKeys = filterDict.keys()
    for key in filterKeys:
        if key == 'adminOnly':
            if filterDict[key]:
                query = query.join(model.GroupHasMembers, model.Member.id == model.GroupHasMembers.memberID)
                query = query.filter(model.GroupHasMembers.roleID == 1)
    if searchDict is not None and len(searchDict) > 0:
        searchKeys = searchDict.keys()
        for key in searchKeys:
            attr = memberSearchAttrMap.get(key)
            if attr is None:
                name = memberFieldMap.get(key, key)
                kwargs = { name : searchDict[key] }
                query = query.filter_by(**kwargs)
            else:
                query = query.filter(attr == searchDict[key])
    elif searchAll is not None:
        query = query.filter(or_(
                    model.Member.email == searchAll.lower().strip(),
                    model.Member.givenName == searchAll,
                    model.Member.surname == searchAll,
                    model.Member.login == searchAll.lower().strip()
                ))
    page = p.Page(query, pageNum, pageSize, tableName='Members')
    return page

@_transactional(readOnly=True)
def getMemberByAuthID(session, id):
    return _getMemberByAuthID(session, id)

def _getMemberByAuthID(session, id):
    """
        Return the Member that matches the given auth identifier.
    """
    log.debug('getMemberByAuthID id[%s]' % id)
    try:
        id = long(id)
        query = session.query(model.Member)
        query = query.filter_by(id=id)
        member = _queryOne(query)
        if member:
            member = member.fix()
        return member
    except ValueError:
        return None

@_transactional(readOnly=True)
def getMember(session, id=None, login=None, email=None):
    return _getMember(session, id=id, login=login, email=email)

def _getMember(session, id=None, login=None, email=None):
    member = None
    if id:
        member = _getMemberByID(session, id=id)
        if not isinstance( id, (int, long)):
            if not member:
                member = _getMemberByLogin(session, login=id)
            if not member:
                member = _getMemberByEmail(session, email=id)
    if not member and login:
        member = _getMemberByLogin(session, login=login)
    if not member and email:
        member = _getMemberByEmail(session, email=email)
    return member

@_transactional(readOnly=True)
def getMemberByID(session, id):
    return _getMemberByID(session, id)

def _getMemberByID(session, id):
    """
        Return the Member that matches the given identifier.
    """
    log.debug('getMemberByID id[%s]' % id)
    try:
        id = long(id)
        query = session.query(model.Member)
        query = query.filter_by(id=id)
        member = _queryOne(query)
        if member:
            member = member.fix()
        return member
    except ValueError:
        return None

@_transactional(readOnly=True)
def getMemberByEmail(session, email):
    return _getMemberByEmail(session, email)

def _getMemberByEmail(session, email):
    """
        Return the Member that matches the given email address.
    """
    #log.debug('getMemberByEmail email[%s]' % email)
    query = session.query(model.Member)
    query = query.filter_by(email=email.lower().strip())
    member = _queryOne(query)
    if member:
        member = member.fix()
    return member

@_transactional(readOnly=True)
def getMemberByLogin(session, login):
    return _getMemberByLogin(session, login)

def _getMemberByLogin(session, login):
    """
        Return the Member that matches the given login.
    """
    if login:
        login = login.strip()
    if not login:
        return None

    #log.debug('getMemberByLogin login[%s]' % login)
    ## Bug #52566 - Do not make an OR query - since different accounts can exist for login and login.lower()
    #query = query.filter(or_(model.Member.login == login, model.Member.login == login.lower()))
    member = _queryOne(session.query(model.Member).filter(model.Member.login == login))
    if not member and login != login.lower():
        member = _queryOne(session.query(model.Member).filter(model.Member.login == login.lower()))
    if member:
        member = member.fix()
    else:
        member = _getMemberByDefaultLogin(session, login)
    return member

@_transactional(readOnly=True)
def getMemberByDefaultLogin(session, defaultLogin):
    return _getMemberByDefaultLogin(session, defaultLogin)

def _getMemberByDefaultLogin(session, defaultLogin):
    """
        Return the Member that matches the given login.
    """
    if not defaultLogin:
        return None

    log.debug('getMemberByDefaultLogin defaultLogin[%s]' % defaultLogin)
    query = session.query(model.Member)
    query = query.filter_by(defaultLogin=defaultLogin.strip())
    member = _queryOne(query)
    if member:
        member = member.fix()
    return member

@_transactional(readOnly=True)
def getEmails(session, memberIDs):
    """
        Return the emails of the given memberIDs.
    """
    query = session.query(model.Member.email).distinct()
    query = query.filter(model.Member.id.in_(memberIDs))
    emails = query.all()
    if emails:
        emails = zip(*emails)
        if emails:
            emails = list(emails[0])

    #log.debug('getEmails: emails%s' % emails)
    return emails

def _getMemberRoles(session, idList=None, pageNum=0, pageSize=0):
    query = session.query(model.MemberRole)
    query = query.prefix_with('SQL_CACHE')
    if idList is not None and len(idList) > 0:
        query = query.filter(model.MemberRole.id.in_(idList))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberRoles(session, idList=None, pageNum=0, pageSize=0):
    """
        Return the MemberRoles, unless idList is given, in which case, only
        those in the list will be returned.
    """
    return _getMemberRoles(session, idList=None, pageNum=0, pageSize=0)

def _getMemberRolesByMemberIDs(session, memberIDs):
    query = session.query(model.GroupHasMembers)
    query = query.filter(model.GroupHasMembers.groupID == 1)
    query = query.filter(model.GroupHasMembers.memberID.in_(memberIDs))
    memberRoles = query.all()
    results = {}
    for ghm in memberRoles:
        if not int(ghm.memberID) in results.keys():
            results[int(ghm.memberID)] = []
        results[int(ghm.memberID)].append(int(ghm.roleID))
    return results

@_transactional(readOnly=True)
def getMemberRolesByMemberIDs(session, memberIDs):
    """
        Return the MemberRoles for each member id in list
    """
    return _getMemberRolesByMemberIDs(session, memberIDs)

@_transactional(readOnly=True)
def getMemberRoleIDByName(session, name):
    """
        Returns the Member role's id given the name
    """
    return _getMemberRoleIDByName(session, name)

def _getMemberRoleIDByName(session, name):
    memberRoles = _getMemberRoles(session)
    memberRoleID = None
    for eachMemberRole in memberRoles:
        if eachMemberRole.name == name:
            memberRoleID = eachMemberRole.id
            break
    return memberRoleID

@_transactional(readOnly=True)
def getMemberGroup(session, id, groupID=None):
    return _getMemberGroup(session, id, groupID=groupID)

def _getMemberGroup(session, id, groupID=None):
    """
        Return the list of groups the given member belongs to.
    """
    query = session.query(model.GroupHasMembers)
    query = query.filter_by(memberID=id)
    if groupID:
        query = query.filter_by(groupID=groupID)
    query = query.order_by(model.GroupHasMembers.groupID.asc(), model.GroupHasMembers.roleID.asc())
    return query.all()

@_transactional(readOnly=True)
def getMemberGroups(session, id):
   return _getMemberGroups(session, id)

def _getMemberGroups(session, id):
    """
        Return the list of groups the given member belongs to.
    """
    query = session.query(model.GroupHasMembers)
    query = query.join(model.Group, and_(model.GroupHasMembers.groupID ==  model.Group.id, model.Group.isActive == 1))
    query = query.filter(model.GroupHasMembers.memberID == id)
    query = query.order_by(model.GroupHasMembers.groupID, model.GroupHasMembers.roleID)
    return query.all()

@_transactional(readOnly=True)
def getMemberGroupsWithName(session, id):
   return _getMemberGroupsWithName(session, id)

def _getMemberGroupsWithName(session, id):
    """
        Return the list of groups the given member belongs to.
    """
    query = session.query(model.GroupHasMembers, model.Group.name)
    query = query.join(model.Group, and_(model.GroupHasMembers.groupID ==  model.Group.id, model.Group.isActive == 1))
    query = query.filter(model.GroupHasMembers.memberID == id)
    query = query.order_by(model.GroupHasMembers.groupID, model.GroupHasMembers.roleID)
    return query.all()

def _getMemberAuthApproval(session, memberID, domain):
    query = session.query(model.MemberAuthApproval)
    query = query.filter(
                and_(model.MemberAuthApproval.memberID == memberID,
                     model.MemberAuthApproval.domain == domain))
    return _queryOne(query)

@_transactional(readOnly=True)
def getMemberAuthApproval(session, memberID, domain):
    return _getMemberAuthApproval(session, memberID, domain)

@_transactional(readOnly=True)
def getMemberViewedArtifact(session, memberID, artifactID):
    return _getMemberViewedArtifact(session, memberID, artifactID)

def _getMemberViewedArtifact(session, memberID, artifactID):
    """
        Return the MemberViewedArtifact row if the member has viewed the artifact, None otherwise.
    """
    query = session.query(model.MemberViewedArtifact)
    query = query.filter(
                and_(model.MemberViewedArtifact.memberID == memberID,
                     model.MemberViewedArtifact.artifactID == artifactID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getMemberViewedArtifacts(session, id, typeName=None, pageNum=0, pageSize=0):
    """
        Return the artifacts downloaded by the given member id.
    """
    query = session.query(model.TypedMemberViewedArtifact)
    query = query.filter_by(memberID=id)
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    if typeName is not None:
        query = query.filter_by(typeName=typeName)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberViewedArtifactCount(session, id, typeName=None):
    """
        Return the number artifacts downloaded by the given member id.
    """
    query = session.query(model.TypedMemberViewedArtifact)
    query = query.filter_by(memberID=id)
    if typeName is not None and typeName.lower() == 'artifact':
        typeName = None
    if typeName is not None:
        query = query.filter_by(typeName=typeName)
    return query.count()

@_transactional()
def getUSState(session, abbreviation):
    """
        Return the USState that matches the given state
        abbrevation.
    """
    query = session.query(model.USState)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.USState.abbreviation.ilike(abbreviation))
    return _queryOne(query)

@_transactional(readOnly=True)
def getUSStates(session):
    """
        Return all the USState instances.
    """
    query = session.query(model.USState)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.USState.name)
    return query.all()

@_transactional(readOnly=True)
def getCountries(session):
    return _getCountries(session)

def _getCountries(session):
    """
        Return all the Country instances.
    """
    query = session.query(model.Country)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.Country.id)
    return query.all()

"""
    Deletion related APIs.
"""

@_transactional()
def delete(session, instance):
    """
        Delete the given instance.
    """
    if hasattr(instance.__class__, 'cache'):
        instance = instance.cache(action=model.INVALIDATE, instance=instance)
    session.delete(instance)

def _deleteMember(session, member):
    """
        Delete the given Member.
    """
    query = session.query(model.GroupActivity)
    query = query.filter(model.GroupActivity.ownerID == member.id)
    query.delete()
    session.delete(member)

@_transactional()
def deleteMember(session, member):
    """
        Delete the given Member.
    """
    _deleteMember(session, member)

@_transactional()
def deleteMemberByLogin(session, login):
    """
        Delete the Member that matches the login.
    """
    query = session.query(model.Member)
    member = _queryOne(query.filter_by(login=login.lower().strip()))
    if member is not None:
        _deleteMember(session, member)
    return member

@_transactional()
def deleteMemberByID(session, id):
    """
        Delete the Member that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.Member)
        member = _queryOne(query.filter_by(id=id))
        if member is not None:
            _deleteMember(session, member)
        return member
    except ValueError:
        return None

@_transactional()
def deleteMemberAuthApproval(session, memberID, domain):
    approval = _getMemberAuthApproval(session, memberID, domain)
    if approval is not None:
        session.delete(approval)
    return approval

def _deleteResource(session, resource, vcs=None, deleteAssociations=False, failOnError=False):
    """
        Delete the given Resource.
    """
    need2Commit = False

    log.debug('_deleteResource[%s]' % resource)
    resource = _getUnique(session, model.Resource, 'id', resource.id)
    if not resource:
        return
    if deleteAssociations:
        log.info("_deleteResource: Deleting artifact revision associations for resource: %d" % resource.id)
        _deleteAssociationsForResource(session, resourceRevisionID=resource.revisions[0].id)
        session.flush()

    artifactRevisions = _countArtifactRevisionsForResource(session, resource=resource)
    if artifactRevisions > 0:
        log.info('_deleteResource owned by %d artifactRevisions' % artifactRevisions)
        if failOnError:
            raise Exception((_(u"Cannot delete resource since it is associated with %(artifactRevisions)d artifact revisions")  % {"artifactRevisions":artifactRevisions}).encode("utf-8"))
    else:
        for revision in resource.revisions:
            _deleteGroupActivityForObject(session, 'resourceRevision', revision.id)
            session.delete(revision)
        if resource.type.versionable:
            need2Commit = vcs is None
            if not vcs:
                vcs = v.vcs(resource.ownerID, session=session)
            uri = resource.getUri()
            if vcs.exists(uri):
                vcs.remove(uri)
            if need2Commit:
                vcs.commit('Deleting resource: %d' % resource.id)
        elif not resource.isExternal:
            useImageSatellite, imageSatelliteServer, iamImageSatellite = h.getImageSatelliteOptions()
            if not useImageSatellite or iamImageSatellite:
                fcclient = fc.FCClient()
                fcclient.deleteResource(id=resource.refHash)

        _deleteGroupActivityForObject(session, 'resource', resource.id)

        # delete EmbeddedObjects that reference this resource -JK
        query = session.query(model.EmbeddedObject)
        query = query.filter_by(resourceID=resource.id)
        rows = query.all()
        for eo in rows:
            session.delete(eo)
        _deleteMemberLibraryObjectsByParentID(session, parentID=resource.id)
        session.delete(resource)

@_transactional()
def deleteResource(session, resource, deleteAssociations=False):
    _deleteResource(session, resource, deleteAssociations=deleteAssociations, failOnError=True)

def _removeAncestorsForRevisionID(session, artifactRevisionID):
    """
        Update all artifacts that use this revision id as the ancestor to point to null
    """
    query = session.query(model.Artifact)
    query = query.filter(model.Artifact.ancestorID == artifactRevisionID)
    for a in query.all():
        a.ancestorID = None
        log.debug("Removed ancestorID for %d" % a.id)

def _deleteArtifact(session, artifact, recursive=False, cache=None, idsToDelete=[], idsToKeep=[]):
    """
        Deletes the given artifact, a model.Artifact instance.
        If recursive is true, then all of its children will also be deleted.
    """
    log.info('Deleting artifact[%s]' % artifact.id)
    log.debug('Deleting artifact[%s]' % artifact)
    log.debug('         revisions[%s]' % artifact.revisions)
    artifactID = artifact.id
    if cache:
        invalidateArtifact(cache, artifact, isDelete=True)
    ownerID = artifact.creatorID

    log.debug('Deleting feedbacks')
    _deleteArtifactFeedbackByArtifactID(session, artifactID=artifactID)
    _deleteAbuseReportsForArtifact(session, artifactID=artifactID)

    ## Check if this artifact is a child of another which is not in the delete list
    ## - In that case we skip the deletion of this artifact.
    parents = _getArtifactParents(session, artifactID=artifactID)
    if parents:
        for parent in parents:
            if parent['parentID'] not in idsToDelete:
                #
                #  Skip deleting this artifact since someone else is
                #  referencing it.
                #
                idsToKeep.append(artifactID)
                return

    ## List of ids to delete as part of all the recursive calls to this function
    idsToDelete.append(artifactID)

    resourcesToDelete = []
    for revision in artifact.revisions:
        count = len(revision.resourceRevisions)
        for n in range(0, count):
            resRevision = revision.resourceRevisions[n]
            resource = resRevision.resource
            if resource not in resourcesToDelete:
                log.debug('Deleting resource: %s' % resource.id)
                resourcesToDelete.append(resource)
        revision.resourceRevisions = []

    childDict = {}
    for revision in artifact.revisions:
        count = len(revision.children)
        log.debug("Children of artifact: %d" % count)
        if count > 0:
            #
            #  Do not delete the domain nodes used by the study tracks.
            #
            if recursive and artifact.type.name != 'study-track':
                for n in range(0, count):
                    childRelation = revision.children[n]
                    child = childRelation.child.artifact
                    #
                    #  Only delete child artifacts of the same creator.
                    #
                    if child.creatorID == artifact.creatorID:
                        childDict[child.id] = child
                    else:
                        log.info('_deleteArtifact: not deleting %s owned by %s' % (child.id, child.creatorID))
            revision.children = []
        _removeAncestorsForRevisionID(session, revision.id)

        _deleteGroupActivityForObject(session, 'artifactRevision', revision.id)

        log.debug("Deleting revision: %s" % revision.id)
        session.delete(revision)
        log.debug("Deleting revision: %s complete" % revision.id)
    artifact.revisions = []

    for author in artifact.authors:
        log.debug("Deleting author: %s" % author.name)
        session.delete(author)

    log.debug('Deleting member library object')
    _deleteMemberLibraryObjectsByParentID(session, parentID=artifactID)

    log.debug('Deleting group activity')
    _deleteGroupActivityForObject(session, 'artifact', artifactID)

    if artifact.type.name == 'assignment':
        log.debug('Deleting assignment')
        query = session.query(model.MemberStudyTrackItemStatus)
        query = query.filter_by(assignmentID=artifact.id)
        query.delete()

        query = session.query(model.Assignment)
        query = query.filter_by(assignmentID=artifact.id)
        assignment = _queryOne(query)
        if assignment:
            session.delete(assignment)

    log.debug('Deleting artifact[%s]' % artifact.id)
    session.delete(artifact)
    log.debug('Deleted artifact[%s]' % artifact.id)
    session.flush()

    for id in childDict.keys():
        _deleteArtifact(session, childDict[id], recursive, cache, idsToDelete, idsToKeep)

    session.flush()

    log.debug("Deleting resources: %s" % str([ r.id for r in resourcesToDelete]))
    vcs = v.vcs(artifact.creatorID, session=session)
    for resource in resourcesToDelete:
        try:
            _deleteResource(session, resource, vcs)
            log.debug('Deleted resourceRevision: %s' % resource.id)
        except Exception, e:
            log.error("Error deleting resource: %d: %s" % (resource.id, str(e)), exc_info=e)
    vcs.commit('Deleted artifact id: %d' % artifact.id)

    ## Create event
    try:
        _createEventForType(session, typeName='ARTIFACT_DELETED', objectID=artifactID, objectType='artifact', eventData='Artifact %d deleted.' % artifactID, ownerID=ownerID, processInstant=True)
    except Exception as e:
        log.error("Error creating ARTIFACT_DELETED event: [%s]" % str(e), exc_info=e)

@_transactional()
def deleteArtifact(session, artifact, recursive=True, cache=None):
    """
        Deletes the given artifact, a model.Artifact instance.
        If recursive is true, then all of its children will also be deleted.
    """
    idsDeleted = []
    idsKept = []
    _deleteArtifact(session, artifact, recursive, cache=cache, idsToDelete=idsDeleted, idsToKeep=idsKept)
    return idsDeleted, idsKept

@_transactional()
def deleteArtifactByID(session, id, recursive=False, cache=None):
    try:
        id = long(id)
        artifact = _getUnique(session, model.Artifact, 'id', int(id))
    except ValueError:
        artifact = None

    if artifact:
        _deleteArtifact(session, artifact, recursive, cache=cache)
    else:
        raise Exception((_(u"No such artifact: %(id)s")  % {"id":id}).encode("utf-8"))

@_transactional()
def deleteFeaturedArtifact(session, featuredArtifact):
    """
        Delete the given FeaturedArtifact instance.
    """
    session.delete(featuredArtifact)

@_transactional()
def deleteBrowseTerm(session, browseTerm):
    """
        Delete the given BrowseTerm.
    """
    session.delete(browseTerm)

@_transactional()
def deleteBrowseTermByID(session, id):
    return _deleteBrowseTermByID(session, id)

def _deleteBrowseTermByID(session, id):
    """
        Delete the BrowseTerm that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.BrowseTerm)
        browseTerm = _queryOne(query.filter_by(id=id))
        if browseTerm is not None:
            session.delete(browseTerm)
        return browseTerm
    except ValueError:
        return None

@_transactional()
def deleteBrowseTermSynonym(session, termID, synonymTermID):
    """
        Delete the BrowseTermHasSynonyms record that matches the given identifier
    """
    log.info("Deleteing browseTermHasSynonym by [%s, %s]" % (termID, synonymTermID))
    query = session.query(model.BrowseTermHasSynonyms)
    record = _queryOne(query.filter(
                and_(model.BrowseTermHasSynonyms.termID == termID,
                     model.BrowseTermHasSynonyms.synonymTermID == synonymTermID)))
    if record is not None:
        session.delete(record)
    return record

@_transactional()
def deleteStandard(session, standard):
    """
        Delete the given Standard.
    """
    session.delete(standard)

@_transactional()
def deleteStandardByID(session, id):
    """
        Delete the Standard that matches the given identifier.
    """
    try:
        id = long(id)
        query = session.query(model.Standard)
        standard = _queryOne(query.filter_by(id=id))
        if standard is not None:
            session.delete(standard)
        return standard
    except ValueError:
        return None

@_transactional()
def deleteFavorite(session, favorite):
    """
        Delete the given favorite.
    """
    revisionID = favorite.artifactRevisionID
    revision = _getArtifactRevisionByID(session, revisionID)
    revision.favorites -= 1
    session.add(revision)
    session.delete(favorite)

@_transactional()
def deleteFeedback(session, **kwargs):
    return _deleteFeedback(session, **kwargs)

def _deleteFeedback(session, **kwargs):
    """
        Delete the given feedback.
    """
    _checkAttributes([ 'artifactID', 'memberID'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    if artifactID is None or memberID is None:
        return False
    session.query(model.ArtifactFeedbackHelpful).filter(and_(model.ArtifactFeedbackHelpful.artifactID==artifactID, model.ArtifactFeedbackHelpful.memberID==memberID)).delete()
    session.flush()
    session.query(model.ArtifactFeedbackReview).filter(and_(model.ArtifactFeedbackReview.artifactID==artifactID, model.ArtifactFeedbackReview.memberID==memberID)).delete()
    session.flush()
    session.query(model.ArtifactFeedbackAbuseReport).filter(and_(model.ArtifactFeedbackAbuseReport.artifactID==artifactID, model.ArtifactFeedbackAbuseReport.memberID==memberID)).delete()
    session.flush()
    session.query(model.ArtifactFeedback).filter(and_(model.ArtifactFeedback.artifactID==artifactID, model.ArtifactFeedback.memberID==memberID)).delete()
    if kwargs.has_key('cache') and kwargs['cache']:
        cache = kwargs['cache']
        artifact = _getArtifactByID(session, id=artifactID)
        invalidateArtifact(cache, artifact, memberID=memberID)
        cache.personalCache.invalidate(memberID=kwargs['memberID'], id=kwargs['artifactID'])
    return True

@_transactional()
def deleteFeedbackReview(session, **kwargs):
    return _deleteFeedbackReview(session, **kwargs)

def _deleteFeedbackReview(session, **kwargs):
    """
        Delete the feedback review entry.
    """
    _checkAttributes([ 'reviewID'], **kwargs)
    reviewID = kwargs['reviewID']
    if reviewID is None:
        return False
    session.query(model.ArtifactFeedbackReviewAbuseReport).filter(model.ArtifactFeedbackReviewAbuseReport.artifactFeedbackReviewID == reviewID).delete()
    session.flush()
    session.query(model.ArtifactFeedbackReview).filter(model.ArtifactFeedbackReview.id==reviewID).delete()
    return True

@_transactional()
def deleteFeedbackHelpful(session, **kwargs):
    return _deleteFeedbackHelpful(session, **kwargs)

def _deleteFeedbackHelpful(session, **kwargs):
    """
        Delete the feedback helpful.
    """
    _checkAttributes([ 'artifactID', 'memberID','reviewersMemberID'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    reviewersMemberID = kwargs['reviewersMemberID']
    if artifactID is None or memberID is None or reviewersMemberID is None:
        return False
    session.query(model.ArtifactFeedbackHelpful).filter(and_(model.ArtifactFeedbackHelpful.artifactID==artifactID, model.ArtifactFeedbackHelpful.memberID==memberID,model.ArtifactFeedbackHelpful.reviewersMemberID==reviewersMemberID)).delete()
    return True

def _deleteDomainNeighbors(session, domainNeighbors):
    """
        Delete the given DomainNeighbor entries.
    """
    for entry in domainNeighbors:
        session.delete(entry)

@_transactional()
def deleteDomainNeighbor(session, domainID, requiredDomainID=None):
    """
        Delete the DomainNeighbor entries identified by the domainID and
        optionally the requiredDomainID. If requiredDomainID is not
        given, then all entries having domainID or requiredDomainID
        equal to the given domainID will be deleted.
    """
    if requiredDomainID is not None:
        query = session.query(model.DomainNeighbor)
        query = query.filter(
                    and_(model.DomainNeighbor.domainID == domainID,
                         model.DomainNeighbor.requiredDomainID ==
                            requiredDomainID))
        domainNeighbor = _queryOne(query)
        session.delete(domainNeighbor)
    else:
        preNeighbors = _getPreDomains(session, domainID)
        _deleteDomainNeighbors(session, preNeighbors)
        postNeighbors = _getPostDomains(session, domainID)
        _deleteDomainNeighbors(session, postNeighbors)

@_transactional()
def deleteDomainNeighbors(session, domainNeighbors):
    """
        Delete the given DomainNeighbor entries.
    """
    _deleteDomainNeighbors(session, domainNeighbors)

"""
    Creation realated APIs.
"""

@_transactional()
def createStandard(session, **kwargs):
    """
        Create a Standard instance.
    """
    _checkAttributes([ 'section', 'standardBoardID', 'subjectID', 'grades' ], **kwargs)
    grades = kwargs['grades']
    del(kwargs['grades'])
    standard = model.Standard(**kwargs)
    for grade in grades:
        standard.grades.append(grade)
    session.add(standard)
    return standard

@_transactional()
def updateStandard(session, **kwargs):
    """
        Update a standard instance
    """
    _checkAttributes(['standardID', 'section', 'standardBoardID', 'subjectID'], **kwargs)
    standard = _getUnique(session, model.Standard, 'id', kwargs['standardID'])
    if standard:
        if kwargs.has_key('grades'):
            grades = kwargs['grades']
            existingGrades = {}
            ## If appendGrades is true, we append to existing grades
            if kwargs.has_key('appendGrades') and kwargs['appendGrades']:
                if standard.grades:
                    for grade in standard.grades:
                        existingGrades[grade.id] = grade
            else:
                ## Otherwise, we just clear all existing grades and add fresh ones
                standard.grades = []
            for grade in grades:
                if not existingGrades.has_key(grade.id):
                    standard.grades.append(grade)
        standard.section = kwargs['section']
        standard.standardBoardID = kwargs['standardBoardID']
        standard.subjectID = kwargs['subjectID']
        if kwargs.has_key('description'):
            standard.description = kwargs['description']
        if kwargs.has_key('title'):
            standard.title = kwargs['title']
        session.add(standard)
        return standard
    else:
        log.error("No such standard by id %s" % kwargs['standardID'])
        return None

@_transactional()
def createArtifactHasStandard(session, **kwargs):
    """
        Create an ArtifactHasStandards instance.
    """
    _checkAttributes([ 'artifactRevisionID', 'standardID' ], **kwargs)
    artifactRevisionHasStandards = model.ArtifactRevisionHasStandards(**kwargs)
    session.add(artifactRevisionHasStandards)
    return artifactRevisionHasStandards

@_transactional()
def deleteArtifactRevisionHasStandard(session, **kwargs):
    _checkAttributes([ 'artifactRevisionID', 'standardID' ], **kwargs)
    query = session.query(model.ArtifactRevisionHasStandards)
    query = query.filter(and_(
        model.ArtifactRevisionHasStandards.standardID == kwargs['standardID'],
        model.ArtifactRevisionHasStandards.artifactRevisionID == kwargs['artifactRevisionID']))
    artifactRevisionHasStandard = _queryOne(query)
    if artifactRevisionHasStandard:
        session.delete(artifactRevisionHasStandard)

def _createDomainTerm(session, **kwargs):
    """
        Create a Domain BrowseTerm instance.
    """
    _checkAttributes([ 'name', 'handle', 'encodedID'], **kwargs)
    domainType = _getBrowseTermTypeByName(session, 'domain')
    kwargs['termTypeID'] = domainType.id
    passKey = kwargs.get('passKey', None)
    if not passKey or passKey != 'I@mSt$':
        raise Exception('Cannot create a domain type term. Must be created through taxonomy service.')
    encodedID = kwargs['encodedID']
    noOfParts = len(encodedID.split('.'))
    branchEncodedID = kwargs.get('branchEncodedID', None)
    subjectEncodedID = kwargs.get('subjectEncodedID', None)
    parentEncodedID = kwargs.get('parentEncodedID', None)
    if not parentEncodedID:
        if noOfParts >= 3:
            log.info('No parentEncodedID specified for ConceptNode')
            branchTerm = _getBrowseTermByEncodedID(session, encodedID=branchEncodedID)
            if not branchTerm:
                raise Exception('No domain term exists in flx for the encodedID:%s' %branchEncodedID)
            del kwargs['branchEncodedID']
            kwargs['parentID'] = branchTerm.id
        elif noOfParts == 2:
            log.info('No parentEncodedID specified for SubjectNode')
            subjectTerm = _getBrowseTermByEncodedID(session, encodedID=subjectEncodedID)
            if not subjectTerm:
                raise Exception('No domain term exists in flx for the encodedID:%s' %subjectEncodedID)
            del kwargs['subjectEncodedID']
            kwargs['parentID'] = subjectTerm.id
        elif noOfParts == 1:
            log.info('No parentEncodedID specified for BranchNode')
            CKTTerm = _getBrowseTermByEncodedID(session, encodedID='CKT')
            del kwargs['subjectEncodedID']
            kwargs['parentID'] = CKTTerm.id
    else:
        parentTerm = _getBrowseTermByEncodedID(session, encodedID=parentEncodedID)
        del kwargs['parentEncodedID']
        kwargs['parentID'] = parentTerm.id
    creator = kwargs.get('creator', None)
    del kwargs['creator']
    domainTerm = model.BrowseTerm(**kwargs)
    session.add(domainTerm)
    session.flush()
    previewImageUrl = kwargs.get('previewImageUrl', None)
    previewIconUrl = kwargs.get('previewIconUrl', None)

    domainUrlDict = dict()
    if previewImageUrl is not None:
        domainUrlDict.update({'url': previewImageUrl})
    if previewIconUrl is not None:
        domainUrlDict.update({'iconUrl': previewIconUrl})

    if domainUrlDict:
        domainUrlDict.update({'domainID':domainTerm.id})
        _createDomainUrl(session, **domainUrlDict)

    if domainTerm.type.name == 'domain' and domainTerm.encodedID and len(domainTerm.encodedID.split('.')) > 2:
        #
        #  Create corresponding artifact only for concept nodes.
        #
        _backupDomainArtifact(session, domainTerm.handle, domainTerm.encodedID, creator)
       
        kwargs = {
            'name': domainTerm.name,
            'description': domainTerm.description,
            'encodedID': domainTerm.encodedID,
            'handle': domainTerm.handle,
            'typeName': 'domain',
            'creator': creator,
            'browseTerms': [ { 'browseTermID': domainTerm.id } ],
        }
        artifact = _createArtifact(session, **kwargs)
        session.add(artifact)
    return domainTerm

@_transactional()
def createDomainTerm(session, **kwargs):
    return _createDomainTerm(session, **kwargs)

def _backupDomainArtifact(session, handle, encodedID, creator):
    domainType = _getArtifactTypeByName(session, typeName='domain')
    domainArtifact = _getArtifactByHandle(session, handle, domainType.id, creator.id)
    if not domainArtifact:
        domainArtifact = _getArtifactByEncodedID(session, encodedID=encodedID, typeName='domain')
    if domainArtifact:
        ## Change the handle and encodedID for the artifact
        domainArtifact.handle = domainArtifact.handle + '-DEL-' + domainArtifact.encodedID + '-' + str(domainArtifact.id)
        domainArtifact.encodedID = None
        session.add(domainArtifact)
        session.flush()

def _deleteDomainTermByEncodedID(session, **kwargs):
    """
        Delete the BrowseTerm that matches the given identifier.
    """
    _checkAttributes(['encodedID'], **kwargs)
    try:
        passKey = kwargs.get('passKey', None)
        if not passKey or passKey != 'I@mSt$':
            raise Exception('Cannot delete a domain type term. Must be created through taxonomy service.')

        creator = kwargs.get('creator')
        encodedID = kwargs['encodedID']
        query = session.query(model.BrowseTerm)
        domainTerm = _queryOne(query.filter_by(encodedID=encodedID))
        if domainTerm is not None:

            # Delete Domain Neighbors
            _deleteDomainNeighbors(session, _getPreDomains(session, domainTerm.id))
            _deleteDomainNeighbors(session, _getPostDomains(session, domainTerm.id))

            query = session.query(model.DomainUrl)
            query = query.prefix_with('SQL_CACHE')
            domainUrl = _queryOne(query.filter_by(domainID=domainTerm.id))
            if domainUrl is not None:
                session.delete(domainUrl)
            query = session.query(model.ArtifactHasBrowseTerms)
            query = query.filter_by(browseTermID=domainTerm.id)
            ahbts = query.all()
            for ahbt in ahbts:
                log.info("Deleting: %s, %s" % (ahbt.browseTermID, ahbt.artifactID))
                session.delete(ahbt)
            session.delete(domainTerm)

            ## Back up the associated domain artifact
            _backupDomainArtifact(session, domainTerm.handle, domainTerm.encodedID, creator)
        return domainTerm
    except Exception as e:
        log.error('Error in deleteDomainTermByEncodedID', exc_info=e)
        return None

@_transactional()
def deleteDomainTermByEncodedID(session, **kwargs):
    return _deleteDomainTermByEncodedID(session, **kwargs)

def _updateDomainTerm(session, **kwargs):
    """
        Update a Domain BrowseTerm instance.
    """
    _checkAttributes(['id'], **kwargs)
    term = _getUnique(session, model.BrowseTerm, 'id', kwargs['id'])
    if not term:
        raise Exception('Invalid browseTerm id:' % kwargs['id'])

    passKey = kwargs.get('passKey', None)
    if not passKey or passKey != 'I@mSt$':
        raise Exception('Cannot update a domain term. Must be created through taxonomy service.')

    if kwargs.has_key('name'):
        term.name = kwargs['name']
    originalHandle = term.handle
    if kwargs.has_key('handle'):
        term.handle = kwargs['handle']
    originalEncodedID = term.encodedID
    if kwargs.has_key('encodedID'):
        term.encodedID = kwargs['encodedID']
    if kwargs.has_key('description'):
        term.description = kwargs['description']
    """
        Change to termTypeID should not be allowed.

    if kwargs.has_key('termTypeID'):
        term.termTypeID = kwargs['termTypeID']
    """
    if kwargs.has_key('parentID'):
        term.parentID = kwargs['parentID']

    session.add(term)
    previewImageUrl = kwargs.get('previewImageUrl', None)
    previewIconUrl = kwargs.get('previewIconUrl', None)

    domainUrlDict = dict()
    if previewImageUrl is not None:
        domainUrlDict.update({'url': previewImageUrl.strip()})
    if previewIconUrl is not None:
        domainUrlDict.update({'iconUrl': previewIconUrl.strip()})

    if domainUrlDict:
        domainUrlDict.update({'domainID': term.id})
        _updateDomainUrl(session, **domainUrlDict)

    ## Update the corresponding domain artifact
    creator = kwargs.get('creator')
    forceUpdate = kwargs.get('forceUpdate', False)
    domainType = _getArtifactTypeByName(session, typeName='domain')
    domainArtifact = _getArtifactByHandle(session, originalHandle, domainType.id, creator.id)
    if not domainArtifact:
        domainArtifact = _getArtifactByEncodedID(session, encodedID=originalEncodedID, typeName='domain')
    domainArtifactConflict = _getArtifactByHandle(session, term.handle, domainType.id, creator.id)
    if domainArtifactConflict and domainArtifact.id != domainArtifactConflict.id and forceUpdate:
        _backupDomainArtifact(session, domainArtifactConflict.handle, domainArtifactConflict.encodedID, creator)
    if domainArtifact:
        domainArtifact.handle = term.handle
        domainArtifact.encodedID = term.encodedID
        domainArtifact.description = term.description
        session.add(domainArtifact)
    else:
        log.warn("No domain artifact found for encodedID[%s] or handle[%s]" % (originalEncodedID, originalHandle))

    return term

@_transactional()
def updateDomainTerm(session, **kwargs):
    return _updateDomainTerm(session, **kwargs)

def _createBrowseTerm(session, **kwargs):
    _checkAttributes([ 'name', 'browseTermType' ], **kwargs)
    """
        Create a BrowseTerm instance.
    """
    force = str(kwargs.pop('force', False)).lower() == 'true'
    termTypesDict = _getBrowseTermTypesDict(session)
    browseTermType = kwargs['browseTermType']
    if type(browseTermType) is model.BrowseTermType:
        browseTermTypeID = browseTermType.id
    else:
        browseTermTypeID = browseTermType
    if not force and browseTermTypeID in [termTypesDict['grade level'].id, termTypesDict['level'].id, termTypesDict['domain'].id]:
        raise Exception('Cannot create term of typeID: %s' % browseTermTypeID)
    del(kwargs['browseTermType'])
    kwargs['termTypeID'] = browseTermTypeID
    browseTerm = model.BrowseTerm(**kwargs)
    session.add(browseTerm)
    return browseTerm

@_transactional()
def createBrowseTerm(session, **kwargs):
    return _createBrowseTerm(session, **kwargs)

@_transactional()
def updateBrowseTerm(session, **kwargs):
    return _updateBrowseTerm(session, **kwargs)

def _updateBrowseTerm(session, **kwargs):
    _checkAttributes(['id'], **kwargs)
    term = _getUnique(session, model.BrowseTerm, 'id', kwargs['id'])
    if not term:
        raise Exception((_(u"Invalid browseTerm id: %(str(kwargs['id']))s")  % {"str(kwargs['id'])":str(kwargs['id'])}).encode("utf-8"))
    if kwargs.has_key('name'):
        term.name = kwargs['name']
    if kwargs.has_key('encodedID'):
        term.encodedID = kwargs['encodedID']
    if kwargs.has_key('parentID'):
        term.parentID = kwargs['parentID']
    if kwargs.has_key('termTypeID'):
        term.termTypeID = kwargs['termTypeID']

    session.add(term)
    return term

@_transactional()
def createBrowseTermSynonym(session, **kwargs):
    """
        Create a synonym for browseTerm
    """
    _checkAttributes(['termID', 'synonymTermID'], **kwargs)
    browseTermHasSynonyms = model.BrowseTermHasSynonyms(**kwargs)
    session.add(browseTermHasSynonyms)
    return browseTermHasSynonyms

@_transactional(readOnly=True)
def getBrowseTermsByArtifactID(session, artifactID):
    return _getBrowseTermsByArtifactID(session, artifactID)

def _getBrowseTermsByArtifactID(session, artifactID):
    query = session.query(model.BrowseTerm)
    query = query.join(model.ArtifactHasBrowseTerms, model.ArtifactHasBrowseTerms.browseTermID == model.BrowseTerm.id)
    query = query.filter(model.ArtifactHasBrowseTerms.artifactID == artifactID)
    return query.all()

@_transactional(readOnly=True)
def getArtifactHasBrowseTermsByType(session, artifactID, browseTermTypeID):
    return _getArtifactHasBrowseTermsByType(session, artifactID, browseTermTypeID)

def _getArtifactHasBrowseTermsByType(session, artifactID, browseTermTypeID):
    query = session.query(model.ArtifactsAndBrowseTerms)
    query = query.filter(and_(model.ArtifactsAndBrowseTerms.id == artifactID,
        model.ArtifactsAndBrowseTerms.termTypeID == browseTermTypeID))
    return query.all()

@_transactional(readOnly=True)
def getArtifactHasBrowseTermsByBrowseTermID(session, browseTermID):
    return _getArtifactHasBrowseTermsByBrowseTermID(session, browseTermID)

def _getArtifactHasBrowseTermsByBrowseTermID(session, browseTermID):
    query = session.query(model.ArtifactHasBrowseTerms)
    query = query.filter(model.ArtifactHasBrowseTerms.browseTermID == browseTermID)
    return query.all()

@_transactional()
def createArtifactHasBrowseTerm(session, **kwargs):

    return _createArtifactHasBrowseTerm(session, **kwargs)

def _createArtifactHasBrowseTerm(session, **kwargs):
    """
        Create an ArtifactHasBrowseTerms instance.
    """
    _checkAttributes([ 'artifactID', 'browseTermID' ], **kwargs)
    browseTerm = _getUnique(session, model.BrowseTerm, 'id', kwargs['browseTermID'])
    if not browseTerm:
        raise Exception((_(u"No such browseTerm: %(kwargs['browseTermID'])s")  % {"kwargs['browseTermID']":kwargs['browseTermID']}).encode("utf-8"))
    artifact = _getUnique(session, model.Artifact, 'id', kwargs['artifactID'])
    if not artifact:
        raise Exception((_(u"No such artifact: %(kwargs['artifactID'])s")  % {"kwargs['artifactID']":kwargs['artifactID']}).encode("utf-8"))
    bookLevelArtifactTypes = ['book', 'tebook', 'studyguide', 'workbook', 'labkit', 'worksheet', 'quizbook']
    artifactHasBrowseTerm = _getArtifactHasBrowseTerm(session, kwargs['artifactID'], browseTerm.id)
    if artifactHasBrowseTerm:
        log.info("Artifact %d and browse term %d already exist" % (kwargs['artifactID'], browseTerm.id))
        return artifactHasBrowseTerm
    if artifact.type.name not in bookLevelArtifactTypes and browseTerm.type.name == 'domain' and browseTerm.encodedID and len(browseTerm.encodedID.split('.')) <= 2:
        log.warn('An artifact: [%s] cannot be associated with a subject or branch domain term: [%s]. Returning None' %(kwargs['artifactID'], browseTerm.id))
        return None

    ## Removal of duplicate terms - for certain types, only one term can be associate with an artifact
    termTypes = _getBrowseTermTypesDict(session)
    if browseTerm.type.name == 'domain':
        terms = _getArtifactHasBrowseTermsByType(session, kwargs['artifactID'], termTypes['pseudodomain'].id)
        if terms and terms[0]:
            _deleteArtifactHasBrowseTerm(session, kwargs['artifactID'], terms[0].browseTermID)
    if browseTerm.type.name in ['level', 'contributor', 'pseudodomain']:
        terms = None
        if browseTerm.type.name in ['pseudodomain']:
            terms = _getArtifactHasBrowseTermsByType(session, kwargs['artifactID'], termTypes['domain'].id)
            if not terms:
                terms = _getArtifactHasBrowseTermsByType(session, kwargs['artifactID'], termTypes['pseudodomain'].id)
        else:
            terms = _getArtifactHasBrowseTermsByType(session, kwargs['artifactID'], browseTerm.termTypeID)
        if terms and terms[0]:
            if browseTerm.type.name in ['pseudodomain']:
                ## Remove entry from related artifacts
                log.debug("Removing related artifact for artifact: %s, domain: %s" % (kwargs['artifactID'], terms[0].browseTermID))
                _deleteRelatedArtifact(session, artifactID=kwargs['artifactID'], domainID=terms[0].browseTermID)
            _deleteArtifactHasBrowseTerm(session, kwargs['artifactID'], terms[0].browseTermID)
            session.flush()
    artifactHasBrowseTerms = None
    if browseTerm.type.name not in ['domain', 'pseudodomain']:
        artifactHasBrowseTerms = model.ArtifactHasBrowseTerms(**kwargs)
        session.add(artifactHasBrowseTerms)
    artifact = _getArtifactByID(session, id=kwargs['artifactID'])
    if browseTerm.type.name in ['domain', 'pseudodomain']:
        sequence = None
        if artifact.encodedID:
            try:
                sequence = int(artifact.encodedID.split('.')[-1])
            except:
                pass
        hasRelatedArtifact = _getRelatedArtifact(session, kwargs['artifactID'], browseTerm.id)
        log.debug("Checking related artifact for: %s, %s: [%s]" % (kwargs['artifactID'], browseTerm.id, str(hasRelatedArtifact)))
        if not hasRelatedArtifact:
            sequence = None if not sequence else sequence
            ## Add entry to RelatedArtifacts
            log.debug("Adding related artifact for artifact: %s, domain: %s" % (artifact.id, browseTerm.id))
            _createRelatedArtifact(session, artifactID=artifact.id, domainID=browseTerm.id, sequence=sequence)
    return artifactHasBrowseTerms

def _addConceptCollectionHandlesToArtifact(session, **kwargs):
    _checkAttributes(['artifactID'], **kwargs)
    conceptCollectionHandles = kwargs.get('conceptCollectionHandles')
    collectionCreatorIDs = kwargs.get('collectionCreatorIDs')
    if not conceptCollectionHandles and not collectionCreatorIDs:
        return

    for i in range(0, len(conceptCollectionHandles)):
        hasRelatedArtifact = _getRelatedArtifact(session, artifactID=kwargs['artifactID'], 
                conceptCollectionHandle=conceptCollectionHandles[i], collectionCreatorID=collectionCreatorIDs[i])
        if not hasRelatedArtifact:
            sequence = None if not kwargs.get('sequence') else kwargs['sequence']
            log.debug("Adding RelatedArtifacts entry for artifact: %s, conceptCollectionHandle: %s, collectionCreatorID: %s" % (kwargs['artifactID'], conceptCollectionHandles[i], collectionCreatorIDs[i]))
            _createRelatedArtifact(session, artifactID=kwargs['artifactID'], sequence=sequence, conceptCollectionHandle=conceptCollectionHandles[i], collectionCreatorID=collectionCreatorIDs[i])

def _deleteConceptCollectionHandlesForArtifact(session, **kwargs):
    """
        Delete conceptCollectionHandle associations for artifactID
    """
    _checkAttributes(['artifactID'], **kwargs)
    conceptCollectionHandles = kwargs.get('conceptCollectionHandles')
    collectionCreatorIDs = kwargs.get('collectionCreatorIDs')
    
    query = session.query(model.RelatedArtifact)
    query = query.filter(model.RelatedArtifact.artifactID == kwargs['artifactID'])
    if conceptCollectionHandles and collectionCreatorIDs:
        conditions = []
        for i in range(0, len(conceptCollectionHandles)):
            conditions.append(and_(model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandles[i], model.RelatedArtifact.collectionCreatorID == collectionCreatorIDs[i]))
        query = query.filter(or_(*conditions))
    else:
        query = query.filter(and_(model.RelatedArtifact.conceptCollectionHandle != '', model.RelatedArtifact.conceptCollectionHandle != None, model.RelatedArtifact.collectionCreatorID != 0))
    log.debug("_deleteConceptCollectionHandlesForArtifact: query[%s]" % query)
    query.delete()

def _getConceptCollectionHandleForCanonicalCollection(session, browseTerm):
    ## Get the canonical collection handle
    conceptCollectionHandle = None
    collectionCreatorID = None
    if browseTerm.type.name == 'domain':
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        branchEID = browseTerm.encodedID[:7].upper() if len(browseTerm.encodedID) > 7 else None
        if branchEID:
            collectionHandle = model.BRANCH_ENCODEDID_MAPPING.get(branchEID)
        if collectionHandle:
            conceptCollectionNodes = CollectionNode(mongodb).getByEncodedIDs(eIDs=[browseTerm.encodedID], collectionHandle=collectionHandle, collectionCreatorID=ck12editor.id, canonicalOnly=True)
            if conceptCollectionNodes:
                for ccn in conceptCollectionNodes:
                    conceptCollectionHandle = ccn['handle']
                    break
        if conceptCollectionHandle:
            collectionCreatorID = ck12editor.id
    return conceptCollectionHandle, collectionCreatorID

@_transactional()
def deleteArtifactHasBrowseTerm(session, artifactID, browseTermID, conceptCollectionHandle=None, collectionCreatorID=3):
    _deleteArtifactHasBrowseTerm(session, artifactID, browseTermID, conceptCollectionHandle, collectionCreatorID)

def _deleteArtifactHasBrowseTerm(session, artifactID, browseTermID, conceptCollectionHandle=None, collectionCreatorID=3):
    obj = _getArtifactHasBrowseTerm(session, artifactID, browseTermID)
    if not obj:
        log.warn('No such ArtifactHasBrowseTerms row for: [%s], [%s]'  %(artifactID, browseTermID))
        return
        #raise Exception((_(u'No such ArtifactHasBrowseTerms row for: %(artifactID)d, %(browseTermID)d')  % {"artifactID":artifactID,"browseTermID": browseTermID}).encode("utf-8"))
    term = _getUnique(session, model.BrowseTerm, 'id', browseTermID)
    log.debug("Removing browseTerm: %d from artifactID: %d" % (browseTermID, artifactID))
    if term and term.type.name in ['domain', 'pseudodomain']:
        _deleteRelatedArtifact(session, artifactID=artifactID, domainID=browseTermID)
        ## Also delete association with collection
        if term.type.name == 'domain' and conceptCollectionHandle and collectionCreatorID:
            _deleteRelatedArtifact(session, artifactID=artifactID, domainID=browseTermID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
    session.delete(obj)
    session.flush()

def _deleteBrowseTermsForArtifact(session, artifactID, termTypeID, termPrefix=None):
    terms = _getArtifactHasBrowseTermsByType(session, artifactID, termTypeID)
    for term in terms:
        if termPrefix:
            if term.name.startswith(termPrefix):
                _deleteArtifactHasBrowseTerm(session, artifactID, term.browseTermID)
        else:
            _deleteArtifactHasBrowseTerm(session, artifactID, term.browseTermID)

@_transactional(readOnly=True)
def getArtifactHasBrowseTerm(session, artifactID, browseTermID):
    return _getArtifactHasBrowseTerm(session, artifactID, browseTermID)

def _getArtifactHasBrowseTerm(session, artifactID, browseTermID):
    query = session.query(model.ArtifactHasBrowseTerms)
    query = query.filter(and_(
        model.ArtifactHasBrowseTerms.artifactID == artifactID,
        model.ArtifactHasBrowseTerms.browseTermID == browseTermID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getArtifactHasTagTerm(session, artifactID, tagTermID):
    return _getArtifactHasTagTerm(session, artifactID, tagTermID)

def _getArtifactHasTagTerm(session, artifactID, tagTermID):
    query = session.query(model.ArtifactHasTagTerms)
    query = query.filter(and_(
        model.ArtifactHasTagTerms.artifactID == artifactID,
        model.ArtifactHasTagTerms.tagTermID == tagTermID))
    return _queryOne(query)

def _getArtifactTagTerms(session, artifactIDList=None,memberID=None):
    if not artifactIDList and not memberID:
        return {}
    query = session.query(model.ArtifactsAndTagTerms).distinct()
    if artifactIDList:
        query = query.filter(model.ArtifactsAndTagTerms.id.in_(artifactIDList))
    if memberID:
        query = query.filter(model.ArtifactsAndTagTerms.creatorID == memberID)
    query = query.order_by(model.ArtifactsAndTagTerms.id)
    return query.all()

@_transactional()
def createArtifactHasTagTerm(session, **kwargs):
    return _createArtifactHasTagTerm(session, **kwargs)

def _createArtifactHasTagTerm(session, **kwargs):
    """
        Create an ArtifactHasTagTerms instance.
    """
    _checkAttributes([ 'artifactID', 'tagTermID' ], **kwargs)
    tagTerm = _getUnique(session, model.TagTerm, 'id', kwargs['tagTermID'])
    if not tagTerm:
        raise Exception((_(u"No such tagTerm: %(kwargs['tagTermID'])s")  % {"kwargs['tagTermID']":kwargs['tagTermID']}).encode("utf-8"))
    artifact = _getUnique(session, model.Artifact, 'id', kwargs['artifactID'])
    if not artifact:
        raise Exception((_(u"No such artifact: %(kwargs['artifactID'])s")  % {"kwargs['artifactID']":kwargs['artifactID']}).encode("utf-8"))
    artifactHasTagTerm = _getArtifactHasTagTerm(session, kwargs['artifactID'], tagTerm.id)
    if artifactHasTagTerm:
        log.info("Artifact %d and tag term %d already exist" % (kwargs['artifactID'], tagTerm.id))
        return artifactHasTagTerm

    artifactHasTagTerms = model.ArtifactHasTagTerms(**kwargs)
    session.add(artifactHasTagTerms)
    return artifactHasTagTerms

@_transactional()
def deleteArtifactHasTagTerm(session, artifactID, tagTermID):
    _deleteArtifactHasTagTerm(session, artifactID, tagTermID)

def _deleteArtifactHasTagTerm(session, artifactID, tagTermID):
    obj = _getArtifactHasTagTerm(session, artifactID, tagTermID)
    if not obj:
        log.warn('No such ArtifactHasTagTerms row for: [%s], [%s]'  %(artifactID, tagTermID))
        return
        #raise Exception((_(u'No such ArtifactHasTagTerms row for: %(artifactID)d, %(tagTermID)d')  % {"artifactID":artifactID,"tagTermID": tagTermID}).encode("utf-8"))
    log.debug("Removing tagTerm: %d from artifactID: %d" % (tagTermID, artifactID))
    session.delete(obj)
    session.flush()

def _deleteTagTermsForArtifact(session, artifactID):
    terms = _getArtifactHasTagTerm(session, artifactID)
    for term in terms:
        _deleteArtifactHasTagTerm(session, artifactID, term.tagTermID)

@_transactional(readOnly=True)
def getArtifactHasSearchTerm(session, artifactID, searchTermID):
    return _getArtifactHasSearchTerm(session, artifactID, searchTermID)

def _getArtifactHasSearchTerm(session, artifactID, searchTermID):
    query = session.query(model.ArtifactHasSearchTerms)
    query = query.filter(and_(
        model.ArtifactHasSearchTerms.artifactID == artifactID,
        model.ArtifactHasSearchTerms.searchTermID == searchTermID))
    return _queryOne(query)

def _getArtifactSearchTerms(session, artifactIDList):
    if not artifactIDList:
        return {}
    query = session.query(model.ArtifactsAndSearchTerms).distinct()
    query = query.filter(model.ArtifactsAndSearchTerms.id.in_(artifactIDList))
    query = query.order_by(model.ArtifactsAndSearchTerms.id)
    return query.all()

@_transactional()
def createArtifactHasSearchTerm(session, **kwargs):
    return _createArtifactHasSearchTerm(session, **kwargs)

def _createArtifactHasSearchTerm(session, **kwargs):
    """
        Create an ArtifactHasSearchTerms instance.
    """
    _checkAttributes([ 'artifactID', 'searchTermID' ], **kwargs)
    searchTerm = _getUnique(session, model.SearchTerm, 'id', kwargs['searchTermID'])
    if not searchTerm:
        raise Exception((_(u"No such searchTerm: %(kwargs['searchTermID'])s")  % {"kwargs['searchTermID']":kwargs['searchTermID']}).encode("utf-8"))
    artifact = _getUnique(session, model.Artifact, 'id', kwargs['artifactID'])
    if not artifact:
        raise Exception((_(u"No such artifact: %(kwargs['artifactID'])s")  % {"kwargs['artifactID']":kwargs['artifactID']}).encode("utf-8"))
    artifactHasSearchTerm = _getArtifactHasSearchTerm(session, kwargs['artifactID'], searchTerm.id)
    if artifactHasSearchTerm:
        log.info("Artifact %d and search term %d already exist" % (kwargs['artifactID'], searchTerm.id))
        return artifactHasSearchTerm

    artifactHasSearchTerms = model.ArtifactHasSearchTerms(**kwargs)
    session.add(artifactHasSearchTerms)
    return artifactHasSearchTerms

@_transactional()
def deleteArtifactHasSearchTerm(session, artifactID, searchTermID):
    _deleteArtifactHasSearchTerm(session, artifactID, searchTermID)

def _deleteArtifactHasSearchTerm(session, artifactID, searchTermID):
    obj = _getArtifactHasSearchTerm(session, artifactID, searchTermID)
    if not obj:
        log.warn('No such ArtifactHasSearchTerms row for: [%s], [%s]'  %(artifactID, searchTermID))
        return
        #raise Exception((_(u'No such ArtifactHasSearchTerms row for: %(artifactID)d, %(searchTermID)d')  % {"artifactID":artifactID,"searchTermID": searchTermID}).encode("utf-8"))
    log.debug("Removing searchTerm: %d from artifactID: %d" % (searchTermID, artifactID))
    session.delete(obj)
    session.flush()

def _deleteSearchTermsForArtifact(session, artifactID):
    terms = _getArtifactHasSearchTerm(session, artifactID)
    for term in terms:
        _deleteArtifactHasSearchTerm(session, artifactID, term.searchTermID)

@_transactional()
def createFeaturedArtifact(session, artifactID, listOrder, comments=None):
    """
        Create a featured artifact instance.
    """
    featuredArtifact = model.FeaturedArtifact(artifactID=artifactID,
                                              listOrder=listOrder,
                                              comments=comments)
    session.add(featuredArtifact)
    return featuredArtifact

@_transactional()
def associateFeaturedArtifact(session, **kwargs):
    return _associateFeaturedArtifact(session, **kwargs)

def _associateFeaturedArtifact(session, **kwargs):
    _checkAttributes([ 'artifactID', 'encodedID' ], **kwargs)
    termName = 'featured-' + kwargs['encodedID']
    browseTermTypeName = 'internal-tag'
    browseTermType = _getBrowseTermTypeByName(session, browseTermTypeName)
    browseTerm = None
    browseTerms = _getBrowseTermsByName(session, termName, termTypeID=browseTermType.id)
    if browseTerms:
        log.info("browseTerm with name %s and  BrowseTermType %s already exist.:::%s" % (termName, browseTermTypeName, browseTerms))
        browseTerm = browseTerms[0]
    else:
        browseTerm = _createBrowseTerm(session, name=termName, browseTermType=browseTermType.id, encodedID=termName)
        session.flush()
        log.info("BrowseTerm %s is created" % (browseTerm))
    artifactHasBrowseTerm = _getArtifactHasBrowseTerm(session, artifactID=kwargs['artifactID'], browseTermID=browseTerm.id)
    if not artifactHasBrowseTerm:
        artifactHasBrowseTerm = _createArtifactHasBrowseTerm(session, artifactID=kwargs['artifactID'], browseTermID=browseTerm.id)
        log.info('created browse term[%s] for artifact[%s]' % (termName, kwargs['artifactID']))
#     session.flush()
    return artifactHasBrowseTerm

@_transactional()
def createDomainNeighbor(session, domainID, requiredDomainIDs):
    """
        Create an DomainNeighbor instance.
    """
    domainNeighbors = []
    for requiredDomainID in requiredDomainIDs:
        domainNeighbor = model.DomainNeighbor(domainID=domainID,
                                        requiredDomainID=requiredDomainID)
        session.add(domainNeighbor)
        domainNeighbors.append(domainNeighbor)
    return domainNeighbors

@_transactional()
def createDomainUrl(session, domainID, url=None, iconUrl=None):
    return _createDomainUrl(session, domainID, url, iconUrl)

def _createDomainUrl(session, domainID, url=None, iconUrl=None):
    if url is not None and iconUrl is not None:
        domainUrl = model.DomainUrl(domainID=domainID, url=url, iconUrl=iconUrl)
    elif url is not None:
        domainUrl = model.DomainUrl(domainID=domainID, url=url)
    elif iconUrl is not None:
        domainUrl = model.DomainUrl(domainID=domainID, iconUrl=iconUrl)
    session.add(domainUrl)
    return domainUrl

@_transactional()
def updateDomainUrl(session, domainID, url=None, iconUrl=None):
    return _updateDomainUrl(session, domainID, url, iconUrl)

def _updateDomainUrl(session, domainID, url=None, iconUrl=None):
    domainUrl = _getUnique(session, model.DomainUrl, 'domainID', domainID)
    if domainUrl:
        if url is not None:
            domainUrl.url = url
        if iconUrl is not None:
            domainUrl.iconUrl = iconUrl
        session.add(domainUrl)
    else:
        if url is not None and iconUrl is not None:
            domainUrl = model.DomainUrl(domainID=domainID, url=url, iconUrl=iconUrl)
        elif url is not None:
            domainUrl = model.DomainUrl(domainID=domainID, url=url)
        elif iconUrl is not None:
            domainUrl = model.DomainUrl(domainID=domainID, iconUrl=iconUrl)
        session.add(domainUrl)

    return domainUrl


@_transactional()
def deleteDomainUrl(session, domainID):
    domainUrl = _getUnique(session, model.DomainUrl, 'domainID', domainID)
    if domainUrl:
        session.delete(domainUrl)

def _getContents(session, resource, revNo=None):
    """
        Read the contents from the given resource.
    """
    uri = resource.getUri()
    if resource.type.versionable:
        vcs = v.vcs(resource.ownerID, session=session)
        contents = vcs.get(uri, revNo=revNo)
    else:
        #contents = h.getContents(uri)
        fcclient = fc.FCClient()
        contents = fcclient.getResourceLink(id=resource.refHash, resourceType=resource.type)
    return contents

def _copyResource(session, resource, creator, resourceRevision=None, vcs=None):
    """
        Create a resource from an existing one.

        resource    The resource to be copied.
        creator     The new creator.
        vcs         The versioning control for copying versionable resources.
    """
    log.info('Copying from resource[%s, %s]' % (resource.id, resource.type.name))
    if not resourceRevision:
        resourceRevision = resource.revisions[0]
    if resourceRevision.resourceID != resource.id:
        raise Exception((_(u"Resource revision[%s] not related to resource[%s]." % (resourceRevision.id, resource.id))).encode("utf-8"))
    log.debug('             revision[%s]' % resourceRevision)
    now = datetime.now()

    resourceType = _getInstance(session,
                                resource.resourceTypeID,
                                model.ResourceType)
    if not resource.isAttachment and resourceType.name != 'contents':
        log.info('Shared source resource[%s]' % resource.id)
        return resource, False

    resourceUri = resource.uri
    query = session.query(model.Resource)
    query = query.filter(and_(model.Resource.handle == resource.handle,
                              model.Resource.ownerID == creator.id,
                              model.Resource.resourceTypeID == resource.resourceTypeID))
    r = _queryOne(query)
    log.debug('query %s-%s-%s[%s]' % (resource.handle, creator.id, resource.resourceTypeID, r))
    revision = '1'
    if not r:
        log.info("Check resource by uri: %s owner: %d" % (resource.uri, creator.id))
        r = _getResourceByUri(session, resource.uri, creator.id)
        if r and not r.isExternal and r.checksum != resource.checksum:
            ## Resource exists but not the same resource
            ## Make the uri unique
            log.info("Resource exists but checksum differs [%s, %s] or external resource: %s" % (r.checksum, resource.checksum, r.isExternal))
            r = None
            i = 1
            while True:
                resourceUri = '%d__%s' % (i, resource.uri)
                if not _getResourceByUri(session, resourceUri, creator.id):
                    break
                i += 1
            log.info("Found unique uri: %s" % resourceUri)

    if r is not None:
        #
        #  If found, then already exists.
        #
        new = False
        if not r.type.versionable or r.id == resource.id:
            if r.resourceTypeID != resource.resourceTypeID:
                r.resourceTypeID = resource.resourceTypeID
            log.info('Copy from resource[%s] done by finding [%d]' % (resource.id, r.id))
            log.debug("Found resource: %s" % r)
            return r, new

        destResource = r
        destResourceRevision = destResource.revisions[0]
        revision = destResourceRevision.revision
    else:
        new = True
        refHash = _computeReferenceHashForResource(session, resource.handle, resource.type.name, creator)
        destResource = model.Resource(resourceTypeID=resource.resourceTypeID,
                                      name=resource.name,
                                      handle=resource.handle,
                                      description=resource.description,
                                      uri=resourceUri,
                                      refHash=refHash,
                                      ownerID=creator.id,
                                      languageID=resource.languageID,
                                      isExternal=resource.isExternal,
                                      authors=resource.authors,
                                      license=resource.license,
                                      checksum=resource.checksum,
                                      satelliteUrl=resource.satelliteUrl,
                                      isAttachment=resource.isAttachment,
                                      creationTime=now)
        session.add(destResource)
        if resourceType.versionable:
            destResourceRevision = None
        else:
            #
            #  For versionable, it will be created later.
            #
            destResourceRevision = model.ResourceRevision(revision=revision,
                                                          creationTime=now,
                                                          filesize=resourceRevision.filesize,
                                                          publishTime=resourceRevision.publishTime)
            destResourceRevision.resource = destResource
            session.add(destResourceRevision)
            if destResourceRevision not in destResource.revisions:
                destResource.revisions.insert(0, destResourceRevision)
            log.debug('_copyResource: new revision[%s]' % destResourceRevision)
        log.debug('_copyResource: new resource[%s]' % destResource)

    log.info('_copyResource: resource[%s]' % destResource.id)
    if destResourceRevision:
        log.info('_copyResource: revision[%s]' % destResourceRevision.id)

    #if resourceType.name == 'contents':
    #    destResource.uri = '%d.xhtml' % destResource.id
    destResource.type = resourceType
    fcclient = fc.FCClient()
    if not destResource.isExternal:
        suri = resource.getUri()
        uri = destResource.getUri()
        log.info('_copyResource: from uri[%s]' % suri)
        if resourceType.versionable:
            revNo = resourceRevision.revision
            log.info('_copyResource: from revNo[%s]' % revNo)
            contents = _getContents(session, resource, revNo=revNo)
            if not contents:
                raise Exception((_(u"No content for uri[%s] revNo[%s]" % (suri, revNo))).encode("utf-8"))
            if not vcs:
                vcs = v.vcs(creator.id, session=session)
            if new:
                newRevision = vcs.add(uri, contents)
            elif vcs.hasChanged(uri, contents=contents):
                newRevision = vcs.save(uri, contents)
            else:
                newRevision = revision
            log.info('_copyResource: revision[%s] newRevision[%s]' % (revision, newRevision))
            if int(revision) != int(newRevision):
                destResourceRevision = _getResourceRevision(session, destResource.id, newRevision)
                if not destResourceRevision:
                    #
                    #  Create a new revision.
                    #
                    newResourceRevision = model.ResourceRevision(revision=newRevision,
                                                                 creationTime=now)
                    if newResourceRevision not in destResource.revisions:
                        destResource.revisions.insert(0, newResourceRevision)
                    newResourceRevision.resource = destResource
                    session.add(newResourceRevision)
                    session.flush()
        else:
            ## Non-versionable resource
            useImageSatellite, imageSatelliteServer, iamImageSatellite = h.getImageSatelliteOptions()
            if iamImageSatellite:
                raise Exception((_(u"Copy resource should not be called for satellite server")).encode("utf-8"))
            elif not useImageSatellite:
                resContents = fcclient.getResource(id=resource.refHash, resourceType=resource.type.name)
                if resContents:
                    if uri.endswith("content"):
                        ## FC Repo resource - need to get the real name (so that mime-type guessing works)
                        oldObj = fcclient.getResourceObject(id=resource.refHash)
                        if oldObj:
                            uri = oldObj.label
                    f = tempfile.NamedTemporaryFile(suffix=os.path.basename(uri), delete=False)
                    shutil.copyfileobj(resContents.getContent(), f)
                    f.close()
                    checksum = fcclient.saveResource(id=destResource.refHash, resourceType=destResource.type, isExternal=False, creator=creator.id, name=uri, content=open(f.name, "rb"), isAttachment=destResource.isAttachment)
                    destResource.revisions[0].hash = checksum
                    os.remove(f.name)

    if new:
        session.flush()
        ## Copy embedded object if exists
        log.info("Getting embedded object for resource: %d" % resource.id)
        eo = resource.getEmbeddedObject()
        if eo:
            log.info("Existing embedded object: %d, new resource id: %d. Will copy!" % (eo.id, destResource.id))
            destEO = model.EmbeddedObject(
                    providerID=eo.providerID,
                    resourceID=destResource.id,
                    type=eo.type,
                    caption=eo.caption,
                    description=eo.description,
                    uri=eo.uri,
                    code=eo.code,
                    thumbnail=eo.thumbnail,
                    blacklisted=eo.blacklisted,
                    hash=eo.hash,
                    width=eo.width,
                    height=eo.height)
            session.add(destEO)
        else:
            log.debug("No embedded object for resource: %d" % resource.id)

    log.info('Copied to resource[%s]' % destResource.id)
    log.debug('          resource[%s]' % destResource)
    return destResource, new

def _appendBookName(chapterName, bookName):
    pattern = model.getChapterSeparator()
    chapterName = urllib.unquote(chapterName)
    bookName = urllib.unquote(bookName)
    log.debug('_appendBookName: chapterName[%s] bookName[%s]' % (chapterName, bookName))
    names = re.split(pattern, chapterName)
    name = '%s%s%s' % (names[0], pattern, bookName)
    log.info('_appendBookName: chapterName[%s] bookName[%s] name[%s]' % (chapterName, bookName, name))
    return name

def _associateResources(session, artifactRevision, resourceRevisions, creator, vcs=None, toAppend=False):
    if resourceRevisions is None:
        log.info('_associateResources: No change for artifact revision[%s]' % artifactRevision.id)
        return
    #
    #  Build content resource dictionary.
    #
    resourceDict = {}
    arrr = artifactRevision.resourceRevisions
    for rr in arrr:
        if not rr.resource:
            rr.resource = _getResourceByID(session, rr.resourceID)
        r = rr.resource
        if r.resourceTypeID in (1, 2, 3):
            resourceDict[rr.id] = r, rr

    log.debug('_associateResources: toAppend[%s]' % toAppend)
    if not toAppend:
        artifactRevision.resourceRevisions = []

    if not resourceRevisions:
        #
        #  Remove all but the contents and cover page.
        #
        log.debug('_associateResources: keep contents and cover page.')
        for id in resourceDict.keys():
            r, rr = resourceDict.get(id)
            log.debug('_associateResources: keep rr.id[%s]' % rr.id)
            artifactRevision.resourceRevisions.append(rr)
        return
    #
    #  Process given resource revisions.
    #
    rDict = {}
    for resourceRevision in resourceRevisions:
        if not resourceRevision.resource:
            resourceRevision.resource = _getResourceByID(session, resourceRevision.resourceID)
        resource = resourceRevision.resource
        ## Do not copy generated PDF, HTML and ePub resources since
        ## the artifact may have changed.
        if resource.type.name not in model.PRINT_RESOURCE_TYPES:
            #
            #  On attachments, only copy the published ones.
            #
            if creator.id == resource.ownerID or not resource.isAttachment or resourceRevision.publishTime:
                if rDict.get(resource.id, None):
                    continue
                rDict[resource.id] = resource
                log.info('_associateResources: Copying resource[%s] type[%s]' % (resource.id, resource.type.name))
                newResource, new = _copyResource(session, resource, creator, resourceRevision=resourceRevision, vcs=vcs)
                log.info('_associateResources: Copied from resource[%s] to[%s] new[%s]' % (resource.id, newResource.id, new))
                session.flush()
                resRevision = newResource.revisions[0]
                log.info('_associateResources: resource revision[%s]' % resRevision.id)
                if resRevision not in artifactRevision.resourceRevisions:
                    r, rr = resourceDict.get(resRevision.id, (None, None))
                    if r and r.id == newResource.id and rr in artifactRevision.resourceRevisions:
                        artifactRevision.resourceRevisions.remove(rr)
                    artifactRevision.resourceRevisions.append(resRevision)
                    log.info('_associateResources: resource revision[added]')
    #
    #  Check for more than one content on the list.
    #
    contents = []
    arrr = artifactRevision.resourceRevisions
    for rr in arrr:
        if not rr.resource:
            rr.resource = _getResourceByID(session, rr.resourceID)
        r = rr.resource
        if r.resourceTypeID == 1:
            contents.append('%d:%d' % (r.id, rr.id))
    if len(contents) > 1:
        #
        #  Log for now. Fix in the future.
        #
        auditTrailDict = {
            'auditType': 'multi_content_artifact',
            'memberID': creator.id,
            'artifactRevisionID': artifactRevision.id,
            'artifactID': artifactRevision.artifactID,
            'contentList': contents,
            'creationTime': datetime.utcnow()
        }
        try:
            AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
        except Exception, e:
            log.error('_associateResources: There was an issue logging the audit trail: %s' % e)
        log.error('Multiple contents: %s' % auditTrailDict)


def _get_artifact_name_handle(artifact, name, handle, parentName):
    if not artifact:
        return name, handle
    if not handle:
        if artifact.type.name != 'chapter':
            name = artifact.name
            handle = artifact.handle
        else:
            name = _appendBookName(artifact.name, parentName)
            handle = model.title2Handle(name)
        h = handle
        while True:
            handle = urllib.unquote(h)
            if handle == h:
                break
            h = handle
    return name, handle


def _get_resourceRevisions_from_dict(session, info, func_name=""):
    resourceRevisionIDs = info.get('resourceRevisionIDs', None)
    if resourceRevisionIDs is None:
        resourceRevisions = None
        log.info('_deep_copy_analysis: keep resource')
    elif not resourceRevisionIDs:
        resourceRevisions = []
        log.info('_deep_copy_analysis: empty resource')
    else:
        resourceRevisionIDs = resourceRevisionIDs.split(',')
        resourceRevisions = _getResourceRevisionsByIDs(session, resourceRevisionIDs)
        if len(resourceRevisions) != len(resourceRevisionIDs):
            raise Exception('Invalid resourceRevisionIDs%s' % resourceRevisionIDs)
        log.info('%s: update resource resourceIDs%s' % (func_name, resourceRevisionIDs))
    return resourceRevisions


def _get_new_name_handle(artifact, name, handle, parent_name):
    new_name = None
    if not name:
        name = artifact.name
    aName = model.stripChapterName(artifact.name)
    if aName != name:
        if aName == artifact.name:
            new_name = name
            if not handle:
                if model.title2Handle(artifact.name) == artifact.handle:
                    handle = model.title2Handle(new_name)
        else:
            pattern = model.getChapterSeparator()
            names = re.split(pattern, artifact.name)
            names[0] = re.split(pattern, name)[0]
            if parent_name and names[-1] != parent_name:
                names[-1] = parent_name
            new_name = pattern.join(names)
            if not handle:
                if model.title2Handle(artifact.name) == artifact.handle:
                    handle = model.title2Handle(new_name)
            name = new_name
    if artifact.name == new_name and artifact.handle == handle:
        new_name = None
    elif artifact.handle != handle:
        if not new_name:
            new_name = name
    return name, new_name, handle

def analyse_copyArtifact(session, artifact, creator, vcs, recursive=False, parentName='', name='', handle='', resourceRevisions=None, forceCopy=False, deepCopy=False, publish=None, targetArtifactID=None, analysis_dict={}, sequence=''):
    """
        artifact    The artifact to be copied.
        creator     The new creator.
        vcs         The versioning control for copying versionable resources.
    """
    try:
        artifactRevision = artifact.revisions[0]
        log.info('Copy from artifact[%s]' % artifact.id)
        log.info('          revision[%s]' % artifactRevision.id)
        log.debug('Copy from artifact[%s]' % artifact)
        log.debug('          revision[%s]' % artifactRevision)
        #
        #  See if the artifact for this creator exists already.
        #
        name, handle = _get_artifact_name_handle(artifact, name, handle, parentName)
        log.info('analyse_copyArtifact: name[%s] handle[%s] type[%s] creator[%s] recursive[%s]' % (name, handle, artifact.artifactTypeID, creator.id, recursive))
        if targetArtifactID:
            a = _getArtifactByID(session, id=targetArtifactID)
        else:
            a = _getArtifactByHandle(session, handle, artifact.artifactTypeID, creator.id)

        newArtifactRevision = None
        destArtifact = None
        if a is not None:
            if forceCopy:
                raise ex.AlreadyExistsException((_(u'%(artifact.type.name)s[%(handle)s] from[%(creator.email)s] exists already')  % {"artifact.type.name":artifact.type.name,"handle": handle,"creator.email": creator.email}).encode("utf-8"))
            #
            #  It exists, so just use the latest version.
            #
            newArtifactRevision = None
            log.info("analyse_copyArtifact: Destination artifact[%d] revision[%s, %s] already exists for this user."
                     % (a.id, a.revisions[0].id, a.revisions[0].revision))
            destArtifact = a
            destArtifact.description = artifact.description
            destArtifact.name = artifact.name
            destArtifact.licenseID = artifact.licenseID
            rev = a.revisions[0]
            revision = rev.revision
            if artifactRevision == rev:
                newArtifactRevision = rev
                analysis_dict["sameRev"].append({"type": artifact.type.name, "name": artifact.name,"artifactID": artifact.id,
                                                 "artifactRevisionID": artifactRevision.id, "sequence": sequence})
            else:
                revision = str(long(revision) + 1)
                if publish is None:
                    publishTime = rev.publishTime
                elif not publish:
                    publishTime = None
                else:
                    publishTime = datetime.now()
                log.info('analyse_copyArtifact: publish[%s] publishTime[%s]' % (publish, publishTime))
                source_content = artifact.getXhtml(revision=artifactRevision)
                dest_content = destArtifact.getXhtml(revision=rev)
                mod_xhtml = True
                if source_content == dest_content:
                    mod_xhtml = False
                update_dict = {"type": artifact.type.name, "name": artifact.name, "targetHandle": destArtifact.handle,
                               "artifactID": artifact.id, "artifactRevisionID": artifactRevision.id,
                               "contentChanged": mod_xhtml, "sequence": sequence}
                if destArtifact.type.name == "concept":
                    """find the handles of lesson parents. This case is included when target lesson is not found, but
                       we need to return target URL in the deepCopy result
                    """
                    parent_lessons = _getArtifactParents(session, destArtifact.id)
                    parent_handles = []
                    for pl in parent_lessons:
                        pl_artifact = _getArtifactByID(session, id=pl["parentID"])
                        parent_handles.append(pl_artifact.handle)
                    update_dict["parent_handles"] = parent_handles

                analysis_dict["update"].append(update_dict)
        else:
            #
            #  A new one.
            #
            analysis_dict["create"].append({"type": artifact.type.name, "name": artifact.name, "artifactID": artifact.id,
                                            "artifactRevisionID": artifactRevision.id, "sequence": sequence})

        if artifactRevision != newArtifactRevision and recursive:
            children = artifactRevision.children
            log.info('analyse_copyArtifact: from children[%s]' % children)
            if children:
                for child in children:
                    origChild = child.child.artifact
                    if destArtifact:
                        parentName = destArtifact.name
                    else:
                        parentName = name
                    if artifact.type.name != 'lesson':
                        sequence_str = sequence + '.' + str(child.sequence)
                    else:
                        sequence_str = sequence
                    analysis_dict = analyse_copyArtifact(session, origChild, creator, vcs, recursive=recursive,
                                                        parentName=parentName, publish=publish,
                                                        analysis_dict=analysis_dict, sequence=sequence_str)

        return analysis_dict
    except Exception, e:
        log.error("analyse_copyArtifact error: %s" % str(e))
        log.error(traceback.format_exc())
        raise e

@_transactional()
def deep_copy_analysis(session, member, info, isRevision, messages, artifactTypeDict, resourceTypeDict, roleNameDict, analysis_dict, vcs=None, commit=False, toCreate=False):
    _deep_copy_analysis.counter = 0
    analysis_dict = _deep_copy_analysis(session, member, info, isRevision, messages, artifactTypeDict, resourceTypeDict, roleNameDict, analysis_dict, vcs=None, commit=False, toCreate=False, sequence='')
    log.info("deep_copy_analysis - analysis_dict: %s" %analysis_dict)

    idName = 'artifactRevisionID' if isRevision else 'artifactID'
    id = _getChildID(info, idName)
    auditTrailDict = {
            'auditType': 'artifact_deep_copy',
            'deepCopy_phase': 'analysis',
            'memberID': member.id,
            'name': info.get('title'),
            idName: id,
            'time': datetime.utcnow()
    }
    try:
        AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
    except Exception, e:
        log.error('deep_copy_analysis: There was an issue logging the audit trail: %s' % e)
    return analysis_dict

def _deep_copy_analysis(session, member, info, isRevision, messages, artifactTypeDict, resourceTypeDict, roleNameDict, analysis_dict, vcs=None, commit=False, toCreate=False, sequence=''):
    log.debug('_deep_copy_analysis: info[%s]' % info)
    name = info.get('title')
    children = info.get('children', [])
    handle = info.get('handle', None)
    deepCopy = info.get('deepCopy')
    publish = info.get('publish', None)
    if publish is not None:
        if type(publish) == str or type(publish) == unicode:
            publish = publish.lower().strip()
            if publish in ['', 'none']:
                publish = None
            else:
                publish = publish in ['true', 'yes']
    idName = 'artifactRevisionID' if isRevision else 'artifactID'
    id = _getChildID(info, idName)
    resourceRevisionIDs = info.get('resourceRevisionIDs', None)
    resourceRevisions = _get_resourceRevisions_from_dict(session, info, func_name="_deep_copy_analysis")

    artifact = None
    artifactRevision = None

    if id <= 0 or toCreate:
       log.info("_deep_copy_analysis: Invalid id passed for deep copying")

    if id > 0:
        #
        #  Existing artifact.
        #
        if id > 0 and isRevision:
            artifactRevision = _getArtifactRevisionByID(session, id)
            if artifactRevision is None:
                raise Exception((_(u'ArtifactRevision of %(id)d not found')  % {"id":id}).encode("utf-8"))

            id = artifactRevision.artifactID
            if artifact:
                if id != artifact.id:
                    raise Exception((_(u'Artifact[%(artifact.id)s] not related to this revision[%(artifactRevision.id)s] of [%(id)s]')  % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"id": id}).encode("utf-8"))
                if artifactRevision != artifact.revision[0]:
                    raise Exception((_(u"ArtifactRevision of %(id)d not latest[%(artifact.revision[0].id)s]")  % {"id":id,"artifact.revision[0].id": artifact.revision[0].id}).encode("utf-8"))

            log.info('_deep_copy_analysis:: artifactRevision[%s]' % artifactRevision.id)
        if artifact is None:
            artifact = _getArtifactByID(session, id)
            if artifact is None:
                raise Exception((_(u'Artifact of %(id)s not found')  % {"id":id}).encode("utf-8"))
        log.info('_deep_copy_analysis: existing artifact[%s]' % artifact.id)

        artifact, typeID, name, handle = _getArtifactInfo(session,
                                                          member,
                                                          info,
                                                          artifactTypeDict,
                                                          name,
                                                          handle,
                                                          artifact)
        parentName = info.get('bookTitle', '')

        name, new_name, handle = _get_new_name_handle(artifact, name, handle, parent_name=parentName)
        log.info('_deep_copy_analysis: name old[%s] new[%s] handle[%s]' % (artifact.name, new_name, handle))

        if deepCopy:
            if vcs is None:
                vcs = v.vcs(member.id, session=session)
            targetArtifactID = info.get('targetArtifactID', None)
            log.info('_deep_copy_analysis: calling analyse_copyArtifact resourceRevisionIDs[%s]' % resourceRevisionIDs)

            if _deep_copy_analysis.counter == 0:
                #This is a check to execute this piece only in the first run.
                #counter is like a static variable for this recursive function. Is there a better way to implement?
                analysis_dict['source'] = {
                                        "handle": handle,
                                        "type": artifact.type.name,
                                        "owner_login": artifact.creator.login
                                      }
                if targetArtifactID:
                    target_artifact = _getArtifactByID(session, id=targetArtifactID)
                else:
                    target_artifact = _getArtifactByHandle(session, handle, artifact.artifactTypeID, member.id)

                analysis_dict['target'] = {
                                            "handle": target_artifact.handle if target_artifact else 'None',
                                            "type": target_artifact.type.name if target_artifact else 'None',
                                            "owner_login": member.login
                                      }
                _deep_copy_analysis.counter += 1
            analysis_dict = analyse_copyArtifact(session, artifact, member, vcs, parentName=parentName,
                                                 name=name, handle=handle, resourceRevisions=resourceRevisions, deepCopy=True, publish=publish, targetArtifactID=targetArtifactID, analysis_dict=analysis_dict, sequence=sequence)

    #
    #  Process children.
    #
    for seq,childInfo in enumerate(children):
        id = _getChildID(childInfo, 'artifactRevisionID')
        if sequence == '':
            sequence_str = sequence + str(seq+1)
        else:
            sequence_str = sequence + '.' + str(seq+1)
        if id == childInfo or str(id) == childInfo:
            child = _getArtifactRevisionByID(session, id)
            if not child:
                raise ex.NotFoundException((_(u'No ArtifactRevision of id[%(id)s].')  % {"id":id}).encode("utf-8"))
            if vcs is None:
                vcs = v.vcs(member.id, session=session)
            source = _getArtifactByID(session, id=child.artifactID)
            log.info('_deep_copy_analysis: copying from[%s, %s]' % (source.id, id))
            analysis_dict = analyse_copyArtifact(session, source, member, vcs, recursive=True, publish=publish, analysis_dict=analysis_dict, sequence=sequence_str)

        else:
            log.debug('_deep_copy_analysis: processing child id[%s]' % id)
            childInfo['bookTitle'] = artifact.name
            if deepCopy:
                childInfo['deepCopy'] = True
                childInfo['publish'] = publish

            analysis_dict = _deep_copy_analysis(session,
                                                   member,
                                                   childInfo,
                                                   id > 0,
                                                   messages,
                                                   artifactTypeDict,
                                                   resourceTypeDict,
                                                   roleNameDict,
                                                   vcs=vcs,
                                                   commit=False,
                                                   toCreate=toCreate, analysis_dict=analysis_dict, sequence=sequence_str)

    return analysis_dict

def _copyArtifact(session, artifact, creator, vcs, recursive=False, parentName='', name='', handle='', resourceRevisions=None, forceCopy=False, deepCopy=False, publish=None, targetArtifactID=None, artifactRevision=None):
    """
        Create an artifact from an existing one.

        artifact    The artifact to be copied.
        creator     The new creator.
        vcs         The versioning control for copying versionable resources.
    """
    try:
        if not artifactRevision:
            artifactRevision = artifact.revisions[0]
        log.info('Copy from artifact[%s]' % artifact.id)
        log.info('          revision[%s]' % artifactRevision.id)
        log.debug('Copy from artifact[%s]' % artifact)
        log.debug('          revision[%s]' % artifactRevision)
        domainTerm = None
        #
        #  See if the artifact for this creator exists already.
        #
        name, handle = _get_artifact_name_handle(artifact, name, handle, parentName)
        log.info('_copyArtifact: name[%s] handle[%s] type[%s] creator[%s] recursive[%s]' % (name, handle, artifact.artifactTypeID, creator.id, recursive))
        if targetArtifactID:
            a = _getArtifactByID(session, id=targetArtifactID)
        else:
            a = _getArtifactByHandle(session, handle, artifact.artifactTypeID, creator.id)
        domainTerm = None
        termTypes = _getBrowseTermTypesDict(session)
        if a is not None:
            if forceCopy:
                raise ex.AlreadyExistsException((_(u'%(artifact.type.name)s[%(handle)s] from[%(creator.email)s] exists already')  % {"artifact.type.name":artifact.type.name,"handle": handle,"creator.email": creator.email}).encode("utf-8"))
            #
            #  It exists, so just use the latest version.
            #
            #  Potentially, a new verion may be created later when
            #  processing resources.
            #
            log.info("_copyArtifact: Destination artifact[%d] revision[%s, %s] already exists for this user." % (a.id, a.revisions[0].id, a.revisions[0].revision))
            destArtifact = a
            destArtifact.description = artifact.description
            destArtifact.name = artifact.name
            destArtifact.licenseID = artifact.licenseID
            destArtifact.languageID = artifact.languageID
            rev = a.revisions[0]
            revision = rev.revision
            if artifactRevision == rev:
                isNew = False
                newArtifactRevision = rev
            else:
                isNew = True
                revision = str(long(revision) + 1)
                if publish is None:
                    publishTime = rev.publishTime
                elif not publish:
                    publishTime = None
                else:
                    publishTime = datetime.now()
                log.info('_copyArtifact: publish[%s] publishTime[%s]' % (publish, publishTime))
                newArtifactRevision = model.ArtifactRevision(revision=revision,
                                                             downloads=0,
                                                             favorites=0,
                                                             publishTime=publishTime)
                newArtifactRevision.resourceRevisions = rev.resourceRevisions
                newArtifactRevision.standards = rev.standards
                if deepCopy:
                    newArtifactRevision.messageToUsers = rev.messageToUsers
                log.info('messageToUsers: [%s]' %(rev.messageToUsers))
                _addArtifactRevision(session, destArtifact, newArtifactRevision)

                session.add(newArtifactRevision)
            session.add(destArtifact)
            session.flush()
            log.info("_copyArtifact: Destination artifact revision[%d, %s]." % (newArtifactRevision.id, revision))
        else:
            #
            #  A new one.
            #
            now = datetime.now()
            kwargs = {}
            kwargs['artifactTypeID'] = artifact.artifactTypeID
            kwargs['name'] = name
            kwargs['description'] = artifact.description
            kwargs['handle'] = handle
            kwargs['creatorID'] = creator.id
            kwargs['ancestorID'] = artifactRevision.id
            kwargs['creationTime'] = now
            kwargs['licenseID'] = artifact.licenseID
            kwargs['languageID'] = artifact.languageID
            destArtifact = model.Artifact(**kwargs)
            destArtifact.browseTerms = []
            ## Copy all browseTerms except domain terms
            destArtifact.tagTerms = []
            destArtifact.searchTerms = []
            revision = '1'
            isNew = True
            if not publish:
                publishTime = None
            else:
                publishTime = now
            log.info('_copyArtifact: publish[%s] publishTime[%s]' % (publish, publishTime))

            newArtifactRevision = model.ArtifactRevision(revision=revision,
                                                         downloads=0,
                                                         favorites=0,
                                                         publishTime=publishTime)
            #newArtifactRevision.artifact = destArtifact
            _addArtifactRevision(session, destArtifact, newArtifactRevision)
            newArtifactRevision.standards = artifactRevision.standards

            session.add(destArtifact)
            session.add(newArtifactRevision)
            session.flush()

        log.info("_copyArtifact: New Artifact[%d, %d]" % (destArtifact.id, newArtifactRevision.id))
        #
        #  Delete existing browse terms from destination artifact.
        #
        for bt in destArtifact.browseTerms:
            _deleteArtifactHasBrowseTerm(session, artifactID=destArtifact.id, browseTermID=bt.id)
        #
        #  Copy browse terms over from source artifact.
        #
        for bt in artifact.browseTerms:
            if bt.termTypeID == termTypes['domain'].id or bt.termTypeID == termTypes['pseudodomain'].id:
                domainTerm = bt
            _createArtifactHasBrowseTerm(session, artifactID=destArtifact.id, browseTermID=bt.id)

        ttList = []
        for tt in artifact.tagTerms:
            ttList.append(tt)
        destArtifact.tagTerms = ttList

        stList = []
        for st in artifact.searchTerms:
            stList.append(st)
        destArtifact.searchTerms = stList

        #Create a pseudo-domain term
        if destArtifact.type.name == 'lesson' and not domainTerm:
            domainTerm = _createPseudoDomainNode(session, artifact=destArtifact, browseTermTypeDict=termTypes)
        elif destArtifact.type.name == 'concept' and not domainTerm:
            lessonType = _getArtifactTypeByName(session, typeName='lesson')
            parentArtifact = _getArtifactByHandle(session, handle=artifact.handle, creatorID=artifact.creatorID, typeID=lessonType.id)
            if parentArtifact:
                log.info('ParentArtifact ID:[%s]' %(parentArtifact.id))
                for bt in parentArtifact.browseTerms:
                    if bt.termTypeID == termTypes['pseudodomain'].id:
                        domainTerm = bt
                        log.info('Domain Term: %s' %(domainTerm))
                        _createArtifactHasBrowseTerm(session, artifactID=destArtifact.id, browseTermID=bt.id)
        if resourceRevisions is None:
            #
            #  Resource revision list not provided by the caller.
            #  Copy from the source by default.
            #
            resourceRevisions = artifactRevision.resourceRevisions
        _associateResources(session, newArtifactRevision, resourceRevisions, creator, vcs)
        log.debug('_copyArtifact: resources[%s]' % newArtifactRevision.resourceRevisions)

        if artifactRevision != newArtifactRevision:
            children = artifactRevision.children
            log.info('_copyArtifact: from children[%s]' % children)
            newArtifactRevision.children = []
            if children:
                idList = []
                for child in children:
                    origChild = child.child.artifact
                    if not recursive:
                        newChild = origChild
                    else:
                        ar = _getArtifactRevisionByID(session, id=child.hasArtifactRevisionID)
                        newChild, new = _copyArtifact(session,
                                                      origChild,
                                                      creator,
                                                      vcs,
                                                      recursive=recursive,
                                                      parentName=destArtifact.name,
                                                      publish=publish,
                                                      artifactRevision=ar)
                        #
                        #  Break the existing relationship, if exists.
                        #
                        origChildRevision = origChild.revisions[0]
                        relation = _getArtifactRevisionRelation(session,
                                                                newArtifactRevision.id,
                                                                origChildRevision.id)
                        if relation is not None:
                            session.delete(relation)
                    if newChild.id not in idList:
                        childRevision = newChild.revisions[0]
                        relation = _getArtifactRevisionRelation(session,
                                                                newArtifactRevision.id,
                                                                childRevision.id)
                        if relation is None:
                            relation = model.ArtifactRevisionRelation(
                                                artifactRevisionID=newArtifactRevision.id,
                                                hasArtifactRevisionID=childRevision.id,
                                                sequence=child.sequence)
                        else:
                            relation.sequence = child.sequence
                        newArtifactRevision.children.append(relation)
                        idList.append(newChild.id)
            log.info('_copyArtifact: to   children[%s]' % newArtifactRevision.children)
        #
        #  Copy the authors over too.
        #
        if isNew and artifact.authors is not None and len(artifact.authors) > 0:
            session.flush()
        for author in artifact.authors:
            au = _getArtifactAuthor(session, destArtifact.id, author.name, author.roleID)
            if au is None:
                artifactAuthor = model.ArtifactAuthor(artifactID=destArtifact.id,
                                                      name=author.name,
                                                      roleID=author.roleID,
                                                      sequence=author.sequence)
                destArtifact.authors.append(artifactAuthor)

        log.info('Copied to artifact[%s]' % destArtifact.id)
        log.info('          revision[%s]' % destArtifact.revisions[0].id)
        log.debug('Copied to artifact[%s]' % destArtifact)
        log.debug('          revision[%s]' % destArtifact.revisions[0])
        return destArtifact, isNew
    except Exception, e:
        log.error("Copy artifact api error: %s" % str(e))
        log.error(traceback.format_exc())
        raise e

@_transactional()
def createPseudoDomainNode(session, artifact, browseTermTypeDict=None, createArtifactHasBrowseTerm=True):
    return _createPseudoDomainNode(session, artifact, browseTermTypeDict=None, createArtifactHasBrowseTerm=True)

def _createPseudoDomainNode(session, artifact, browseTermTypeDict=None, createArtifactHasBrowseTerm=True):
    # PseudoDomainNode should be created for non read modalities too.
    #if artifact.type.name != 'lesson':
    #    return None
    if not browseTermTypeDict:
        browseTermTypeDict = _getBrowseTermTypesDict(session)
    domainTermTypeID = browseTermTypeDict['domain'].id
    pseudodomainTermTypeID = browseTermTypeDict['pseudodomain'].id
    ab = _getArtifactHasBrowseTermsByType(session, artifactID=artifact.id, browseTermTypeID=domainTermTypeID)
    if not ab:
        ab = _getArtifactHasBrowseTermsByType(session, artifactID=artifact.id, browseTermTypeID=pseudodomainTermTypeID)
    if ab and ab[0]:
        ab = ab[0]
        domainTerm = _getBrowseTermByID(session, id=ab.browseTermID)
    else:
        termTypes = _getBrowseTermTypesDict(session)
        pseudodomainTermTypeID = termTypes['pseudodomain'].id
        pdHandle = _createUniquePseudoDomainHandle(session, name=artifact.name)
        uniqueHandle = pdHandle.getUniqueHandle()
        uniqueEncodedID = generateUniqueEncodedID(artifact)
        domainTerm = _getBrowseTermByEncodedID(session, encodedID=uniqueEncodedID)
        if not domainTerm:
            artifactName = re.sub('%s.*' %(model.getChapterSeparator()), '', artifact.name)
            domainTerm = _createBrowseTerm(session, name=artifactName, handle=uniqueHandle, encodedID=uniqueEncodedID, browseTermType=pseudodomainTermTypeID)
        session.flush()
        log.info('Domain created - handle: [%s], encodedID: [%s], domainID: [%s]' %(uniqueHandle, uniqueEncodedID, domainTerm.id))
        if not domainTerm:
            raise Exception('Error creating new pseudodomain term: [%s] for artifactID: [%s]' %(uniqueHandle(), artifact.id))
        if createArtifactHasBrowseTerm:
            _createArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=domainTerm.id)
            log.info("Associated new PseudoDomain term: [%d] handle: [%s] encodedID: [%s] with %d" % (domainTerm.id, uniqueHandle, uniqueEncodedID, artifact.id))
    session.flush()
    return domainTerm


def _checkForMultipleCoverPages(session, typeName, resourceList, addDefaultCoverIfNone=False):
    global config
    coverPageCnt = coverPageIconCnt = 0
    for resourceDict in resourceList:
        resourceType = resourceDict.get('resourceType')
        if not resourceType:
            resourceType = resourceDict.get('resourceRevision').resource.type.name
        if type(resourceType).__name__ not in ['str', 'unicode']:
            resourceType = resourceType.name
        if resourceType == 'cover page':
            coverPageCnt += 1
        if 'resourceType' == 'cover page icon':
            coverPageIconCnt += 1
    if coverPageCnt > 1 or coverPageIconCnt > 1:
        raise Exception((_(u'Only 1 resource of type "cover page" or "cover page icon" is allowed.')).encode("utf-8"))
    if addDefaultCoverIfNone and coverPageCnt == 0:
        ## Add default cover - since none was specified.
        coverImageFile = None
        flx_home = config.get('flx_home')
        if not flx_home:
            config = h.load_pylons_config()
            flx_home = config.get('flx_home')
        coverImagePath = os.path.join(flx_home, 'flx', 'lib', 'wiki_importer_lib', 'support_files', 'cover_images')

        if typeName == 'concept':
            coverImageFile = os.path.join(coverImagePath, 'cover_concept_generic.png')
        elif typeName in ['lesson', 'section']:
            coverImageFile = os.path.join(coverImagePath, 'cover_lesson_generic.png')
        elif typeName == 'chapter':
            coverImageFile = os.path.join(coverImagePath, 'cover_chapter_generic.png')
        elif typeName == 'book' or typeName == 'tebook':
            coverImageFile = os.path.join(coverImagePath, 'cover_flexbook_generic.png')

        if coverImageFile:
            if not os.path.exists(coverImageFile):
                raise Exception((_(u'Cannot find default cover images')).encode("utf-8"))

            coverImageType = _getUnique(session, model.ResourceType, 'name', 'cover page')
            language = _getUnique(session, model.Language, 'name', 'English')
            coverImageDict = {
                'resourceType': coverImageType,
                'name': os.path.basename(coverImageFile),
                'description': 'Default cover image',
                'uri': open(coverImageFile, 'rb'),
                'isExternal': False,
                'uriOnly': False,
                'languageID': language.id,
            }
            resourceList.append(coverImageDict)

@_transactional()
def createLesson(session, **kwargs):
    return _createLesson(session, **kwargs)

def _createLesson(session, **kwargs):
    """
        Create a new lesson and associated concept
    """
    kwdict = copy.deepcopy(kwargs)
    if kwdict.get('typeName') == 'lesson':
        lesson_xhtml = concept_xhtml = None
        if kwdict.has_key('resources'):
            resourceList = kwdict['resources']
            for resourceDict in resourceList:
                if resourceDict.get('resourceType') and resourceDict['resourceType'].name == 'contents':
                    xhtml = resourceDict.get('contents')
                    if not xhtml:
                        xhtml = '<p>&#160;</p>'
                    if isLessonConceptSplitEnabled:
                        splitSuccess = False
                        if kwdict.get('autoSplitLesson'):
                            try:
                                lesson_xhtml, concept_xhtml = h.splitLessonXhtml(xhtml)
                                splitSuccess = True
                            except Exception, e:
                                log.error("Error splitting concept: %s" % str(e), exc_info=e)
                        if not splitSuccess:
                            concept_xhtml = xhtml
                            lesson_xhtml = h.getLessonSkeleton()
                        log.debug("Lesson: %s, concept: %s" % (lesson_xhtml, concept_xhtml))
                        break
                    else:
                        conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                        conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                        conceptStartXHTML = re.search(conceptStartXHTML, xhtml)
                        conceptEndXHTML = re.search(conceptEndXHTML, xhtml)
                        if conceptStartXHTML and conceptEndXHTML:
                            xhtml = xhtml[:conceptStartXHTML.start()]+xhtml[conceptStartXHTML.end():conceptEndXHTML.start()]+xhtml[conceptEndXHTML.end():]

                        lesson_xhtml=xhtml
                        concept_xhtml=None

        concept = lesson = None
        conceptRevision = None
        if concept_xhtml:
            resourceDict['contents'] = concept_xhtml
            kwdict['typeName'] = 'concept'
            log.debug("_createArtifact (concept): %s" % str(kwdict))
            concept = _createArtifact(session, **kwdict)
            conceptRevision = concept.revisions[0]
            log.info("conceptRevision: %d" % conceptRevision.id)
        if lesson_xhtml:
            kwdict = copy.deepcopy(kwargs)
            resourceList = kwdict['resources']
            for resourceDict in resourceList:
                if resourceDict.get('resourceType') and resourceDict['resourceType'].name == 'contents':
                    resourceDict['contents'] = lesson_xhtml
                    break
            kwdict['children'] = []
            if isLessonConceptSplitEnabled:
                kwdict['children'].append({'artifact': conceptRevision})
            log.debug("_createArtifact (lesson): %s" % str(kwdict))
            lesson = _createArtifact(session, **kwdict)
        return lesson, concept
    else:
        return _createArtifact(session, **kwargs)

@_transactional()
def createArtifact(session, **kwargs):
    return _createArtifact(session, **kwargs)

def _createArtifact(session, **kwargs):
    """
        Creates a new artifact.

        name        The name of this artifact.
        creator     The creator. It could be a model.Member instance or
                    the identifier of a model.Member instance.
        Resources   A list of dictionaries that have the following keys:
                        resourceType, name, uri, owner
                    The resourceType can either be a model.ResourceType instance
                    or the identifier of a model.ResourceType instance.
                    The uri is used to locate the content of this resource.
                    The owner can either be a model.Member instance or the
                    identifier of a model.Member instance. If it's missing,
                    the creator of the artifact will be used.
    """
    log.info('Creating artifact[%s]' % kwargs)
    #
    #  Check existence of arguments.
    #
    _checkAttributes([ 'name', 'creator', 'typeName', 'handle' ], **kwargs)
    if kwargs.has_key('resources'):
        resourceList = kwargs['resources']
        for resourceDict in resourceList:
            try:
                _checkAttributes([ 'resourceRevision' ], **resourceDict)
            except:
                _checkAttributes([ 'resourceType', 'name', 'isExternal', 'uriOnly', ], **resourceDict)
        del(kwargs['resources'])
    else:
        resourceList = []
    _checkForMultipleCoverPages(session, kwargs['typeName'], resourceList, addDefaultCoverIfNone=True)
    log.debug('_createArtifact: handle[%s]' % kwargs['handle'])
    if kwargs['typeName'] == 'chapter':
        _checkAttributes([ 'bookTitle' ], **kwargs)
        bookName = kwargs['bookTitle']
        del kwargs['bookTitle']
        name = kwargs['name']
        kwargs['name'] = _appendBookName(name, bookName)
        kwargs['handle'] = model.title2Handle(kwargs['name'])

    if kwargs.has_key('children'):
        childList = kwargs['children']
        for childDict in childList:
            _checkAttributes([ 'artifact' ], **childDict)
        del(kwargs['children'])
    else:
        childList = []

    cache = kwargs.get('cache', None)

    typesWithoutResourcesOrChildren = ['domain', 'exercise', 'asmtquiz', 'asmttest', 'asmtpractice', 'asmtpracticeint', 'asmtpracticeg']
    if len(resourceList) == 0 and len(childList) == 0 and kwargs.get('typeName') not in typesWithoutResourcesOrChildren:
        raise ex.InvalidArtifactException((_(u'Must have either resource or children: %(kwargs)s')  % {"kwargs":kwargs}).encode("utf-8"))

    if kwargs.has_key('browseTerms'):
        browseTermList = kwargs['browseTerms']
        for browseTermDict in browseTermList:
            try:
                _checkAttributes([ 'name', 'browseTermType' ], **browseTermDict)
            except:
                _checkAttributes([ 'browseTermID' ], **browseTermDict)
        del(kwargs['browseTerms'])
    else:
        browseTermList = None

    tagTermList = None
    if kwargs.has_key('tagTerms'):
        tagTermList = kwargs['tagTerms']
        for tagTermDict in tagTermList:
            try:
                _checkAttributes(['name'], **tagTermDict)
            except:
                _checkAttributes(['tagTermID'], **tagTermDict)
        del(kwargs['tagTerms'])

    searchTermList = None
    if kwargs.has_key('searchTerms'):
        searchTermList = kwargs['searchTerms']
        for searchTermDict in searchTermList:
            try:
                _checkAttributes(['name'], **searchTermDict)
            except:
                _checkAttributes(['searchTermID'], **searchTermDict)
        del(kwargs['searchTerms'])

    member = _getInstance(session, kwargs['creator'], model.Member)
    if not kwargs.has_key('authors'):
        authors = [(member.fix().name, _getMemberRoleIDByName(session, 'author'))]
    else:
        authors = kwargs['authors']
        kwargs.pop('authors')

    creatorID = member.id
    del(kwargs['creator'])
    kwargs['creatorID'] = creatorID

    artifactType = _getArtifactTypeByName(session, kwargs['typeName'])
    del(kwargs['typeName'])
    kwargs['artifactTypeID'] = artifactType.id
    #
    #  See if the artifact exists already.
    #
    handle = model.title2Handle(kwargs['handle'])
    log.debug('_createArtifact: handle[%s]' % handle)
    kwargs['handle'] = handle
    artifact = _getArtifactByHandle(session, handle, artifactType.id, creatorID)
    if artifact is not None:
        raise ex.AlreadyExistsException((_(u'%(artifactType.name)s[%(handle)s] from[%(member.email)s] exists already')  % {"artifactType.name":artifactType.name,"handle": handle,"member.email": member.email}).encode("utf-8"))

    license = None
    if kwargs.has_key('licenseName'):
        license = _getUnique(session, model.License, 'name', kwargs.get('licenseName'))
        del kwargs['licenseName']
    kwargs['licenseID'] = license.id if license else None

    languageCode = kwargs.get('languageCode', 'en')
    language = _getLanguageByNameOrCode(session, nameOrCode=languageCode)
    if not language:
        raise Exception(_('Invalid languageCode [%s]' % languageCode))
    kwargs['languageID'] = language.id
    kwargs.pop('languageCode', None)

    ignoreLevel = ignoreContributor = False
    metaDataDict = kwargs.get('changed_metadata', None)
    if metaDataDict:
        if type(metaDataDict) != dict:
            import ast

            metaDataDict = ast.literal_eval(metaDataDict)
            if metaDataDict.get('add', {}).get('level'):
                ignoreLevel = True
            if metaDataDict.get('add', {}).get('contributor'):
                ignoreContributor = True
        del kwargs['changed_metadata']

    creationTime = datetime.now()
    if not kwargs.get('creationTime'):
        kwargs['creationTime'] = creationTime
    #
    #  Create artifact instance.
    #
    artifact = model.Artifact(**kwargs)
    session.add(artifact)

    #
    #  Create artifact revision instance.
    #
    artifactRevision = model.ArtifactRevision(revision='1',
                                              downloads=0,
                                              favorites=0)
    artifactRevision.artifact = artifact
    artifactRevision.comment = kwargs.get('comment',None)
    session.add(artifactRevision)
    session.flush()

    #
    # Process browseTermList
    #
    domainTerm = None
    pseudodomain = False
    getRealSubmission = False
    log.info("browseTermList: %s" % str(browseTermList))
    newBrowseTermList = []
    if browseTermList is not None:
        for browseTermDict in browseTermList:
            btID = browseTermDict.get('browseTermID')
            if btID:
                browseTerm = _getBrowseTermByID(session, id=int(btID))
            else:
                browseTerm = _createBrowseTerm(session, **browseTermDict)
                session.flush()
            if browseTerm.type.name == 'domain':
                domainTerm = browseTerm
            if browseTerm.type.name == 'internal-tag' and browseTerm.name == 'GetReal Competition Fall 2013':
                getRealSubmission = True
            if (browseTerm.type.name == 'level' and ignoreLevel) or (browseTerm.type.name == 'contributor' and ignoreContributor):
                ## These are already present in the changed_metadata - so ignore these [Bug #40165]
                log.debug("_createArtifact: Ignoring term type [%s] value [%s] because changed_metadata overrides it." % (browseTerm.type.name, browseTerm.name))
                continue
            _createArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
            newBrowseTermList.append({'browseTermID': browseTerm.id})
        browseTermList = newBrowseTermList

    if not domainTerm and artifact.type.name != 'concept' and artifact.type.modality:
        domainTerm = _createPseudoDomainNode(session, artifact=artifact)
        pseudodomain = True

    # Process conceptCollectionHandles and collectionCreatorIDs
    if kwargs.get('conceptCollectionHandles') and kwargs.get('collectionCreatorIDs'):
        _addConceptCollectionHandlesToArtifact(session, artifactID=artifact.id, 
                conceptCollectionHandles=kwargs['conceptCollectionHandles'], collectionCreatorIDs=kwargs['collectionCreatorIDs'])
    #
    # Process tagTermList
    #
    log.info("tagTermList: %s" % str(tagTermList))
    if tagTermList is not None:
        for tagTermDict in tagTermList:
            ttID = tagTermDict.get('tagTermID')
            if ttID:
                tagTerm = _getTagTermByID(session, id=int(btID))
            else:
                tagTerm = _createTagTerm(session, **tagTermDict)
                session.flush()
            _createArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)

    #
    # Process searchTermList
    #
    log.info("searchTermList: %s" % str(searchTermList))
    if searchTermList is not None:
        for searchTermDict in searchTermList:
            ttID = searchTermDict.get('searchTermID')
            if ttID:
                searchTerm = _getSearchTermByID(session, id=int(btID))
            else:
                searchTerm = _createSearchTerm(session, **searchTermDict)
                session.flush()
            _createArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)

    if metaDataDict and len(metaDataDict) > 0:
        messages = []
        _updateMetaData(session, artifact, metaDataDict, messages, browseTermList, cache.relatedArtifactCache.browseTermCache, tagTermList, searchTermList)
        if len(messages) > 0:
            log.warn('_createArtifact: messages%s' % messages)

    #
    #  Create author instance.
    #
    sequence = 0
    if type(authors) != dict and type(authors) != list:
        authors = json.loads(authors)
    for author in authors:
        if type(author) == tuple:
            authorName, roleID = author
        else:
            authorName = author[0]
            roleID = author[1]
        if authorName:
            authorName = authorName.strip()
        if authorName:
            if roleID.__class__.__name__ != 'long':
                roleID = _getMemberRoleIDByName(session, roleID)
            sequence += 1
            artifactAuthor = model.ArtifactAuthor(artifactID=artifact.id,
                                                  name=authorName,
                                                  roleID=roleID,
                                                  sequence=sequence)
            session.add(artifactAuthor)
            log.info("Artifact Authors: %s" %(artifactAuthor))

    vcs = v.vcs(creatorID, session=session)
    try:
        #
        #  Process children.
        #
        newArtifactList = []
        artifactRevision.children = []
        seq = 0
        idList = []
        aidList = []
        for childDict in childList:
            child = childDict['artifact']
            if isinstance(child, model.Artifact):
                child = child.revisions[0]
            """
                Changing to a lazy approach: share as much as possible, except chapters.
            if child.artifact.type.name == 'chapter':
                child, new = _copyArtifact(session, child.artifact, member, vcs, parentName=artifact.name)
                if new:
                    newArtifactList.append(child)
                child = child.revisions[0]
            """
            if child.id in idList:
                log.debug("_createArtifact: Duplicate child %s" % child.artifact.getTitle())
            else:
                seq += 1
                log.debug("_createArtifact: Adding %s with seq %d" % (child.artifact.getTitle(), seq))
                relation = _getArtifactRevisionRelation(session,
                                                        artifactRevision.id,
                                                        child.id)
                if relation is None:
                    relation = model.ArtifactRevisionRelation(
                                            artifactRevisionID=artifactRevision.id,
                                            hasArtifactRevisionID=child.id,
                                            sequence=seq)
                    session.add(relation)
                else:
                    relation.sequence = seq
                idList.append(child.id)
                aidList.append(child.artifactID)
                artifactRevision.children.append(relation)
        #
        #  Create resource and resource revision instances.
        #
        for resourceDict in resourceList:
            if not resourceDict.get('resourceRevision'):
                try:
                    ownerID = creatorID
                    resourceDict['ownerID'] = ownerID
                    resourceDict['creationTime'] = creationTime
                    resourceRevision = _createResource(session, resourceDict, artifactRevision=artifactRevision,
                            vcs=vcs, commit=False, artifactTypeName=artifactType.name)
                except Exception, e:
                    log.error('createArtifact Exception: %s' % str(e), exc_info=e)
                    vcs.revert()
                    raise e
            else:
                resourceRevision = _getResourceRevisionByID(session, id=resourceDict.get('resourceRevision').id)

            artifactRevision.resourceRevisions.append(resourceRevision)
            log.info("Added resourceRevision: %d" % resourceRevision.id)
        #
        #  Associate given resource, if any.
        #
        resourceRevisionIDs = kwargs.get('resourceRevisionIDs', None)
        log.debug('_createArtifact: resourceRevisionIDs[%s]' % resourceRevisionIDs)
        if resourceRevisionIDs:
            resourceRevisionIDs = resourceRevisionIDs.split(',')
            resourceRevisions = _getResourceRevisionsByIDs(session, resourceRevisionIDs)
            if len(resourceRevisions) != len(resourceRevisionIDs):
                raise Exception('Invalid resourceRevisionIDs%s' % resourceRevisionIDs)
            _associateResources(session, artifactRevision, resourceRevisions, member, vcs, toAppend=True)

        revision = vcs.commit('Resources for artifact[%s, %s]' % (artifact.id, artifact.name))
    except Exception, e:
        log.error("Create artifact api exception: [%s]" % str(e), exc_info=e)
        vcs.revert()
        raise e
    #
    #  Update the revision of resources of the new children.
    #
    for newArtifact in newArtifactList:
        log.debug('_createArtifact: newArtifact id[%s]' % newArtifact.id)
        newArtifactRevision = newArtifact.revisions[0]
        for resourceRevision in newArtifactRevision.resourceRevisions:
            _setResourceRevision(session, resourceRevision, revision)
    #
    #  Update the revision of versionable resources.
    #
    log.debug('_createArtifact: artifaceRevision id[%s]' % artifactRevision.id)
    for resourceRevision in artifactRevision.resourceRevisions:
        _setResourceRevision(session, resourceRevision, revision)
        log.debug('_createArtifact: resourceRevision id[%s] revision[%s]' % (resourceRevision.id, revision))

    # Assoicating the artifact with the browse term.
    if artifact.type.name == 'lesson' and pseudodomain and domainTerm:
        children = artifact.getChildren()
        if children:
            concept = children[0]
            _createArtifactHasBrowseTerm(session, artifactID=concept.id, browseTermID=domainTerm.id)

    log.info('Created artifact[%s]' % artifact.id)
    session.flush()
    # Log audit trail
    try:
        auditTrailDict = {
                'auditType': 'create_artifact',
                'artifactType': artifact.type.name,
                'artifactID': artifact.id,
                'memberID': creatorID,
                'nonImpersonateMemberID': kwargs.get('nonImpersonatedMemberID', None),
                'creationTime': datetime.utcnow()
        }
        AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
    except Exception, e:
        log.error('_createArtifact: There was an issue logging the audit trail: %s' % e)
    #
    #  Assignment.
    #
    if artifact.type.name == 'assignment':
        #
        #  Get all the study track items.
        #
        stItemIDs = []
        for aid in aidList:
            studyTrack = _getArtifactByID(session, id=aid)
            children = studyTrack.revisions[0].children
            for child in children:
                revID = child.hasArtifactRevisionID
                rev = _getArtifactRevisionByID(session, revID)
                stItemIDs.append(rev.artifactID)
        #
        #  Create Assignment related instances for extra
        #  information.
        #
        groupID = kwargs.get('groupID', None)
        assignmentType = kwargs.get('assignmentType', artifact.type.name)
        origin = kwargs.get('origin', 'ck-12')
        data = {
                'assignmentID': artifact.id,
                'groupID': groupID,
                'due': kwargs.get('due', None),
                'assignmentType': assignmentType,
                'origin': origin,
               }
        assignment = model.Assignment(**data)
        session.add(assignment)
        session.flush()
        if assignment.groupID:
            group = _getGroupByID(session, groupID)
            log.debug('createArtifact: assignment group[%s]' % group)
            if group:
                query = session.query(model.GroupHasMembers)
                query = query.filter_by(groupID=group.id)
                query = query.filter_by(roleID=14)
                members = query.all()
                log.debug('createArtifact: assignment len(members)[%s]' % len(members))
                for m in members:
                    for stItemID in stItemIDs:
                        data = {
                            'memberID': m.memberID,
                            'assignmentID': artifact.id,
                            'studyTrackItemID': stItemID,
                            'status': 'incomplete',
                        }
                        status = model.MemberStudyTrackItemStatus(**data)
                        session.add(status)

    _updateResourceAssociations(session, artifactRevision, artifactRevision.resourceRevisions)
    ## Add object to library
    _safeAddObjectToLibrary(session, objectID=artifactRevision.id, objectType='artifactRevision', memberID=member.id)
    _processCreateArtifactEvents(session, artifact)

    if getRealSubmission:
        aList = range(6)
        from random import shuffle
        import string
        shuffle(aList)
        artifactIDChars = list(str(artifact.id))
        for eachItem in aList[:3]:
            artifactIDChars[eachItem] = string.uppercase[int(artifactIDChars[eachItem])-1]
        hashedArtifactID = "".join(artifactIDChars)
        eventData = json.dumps({'hashedArtifactID' : hashedArtifactID})
        eventTypeName = 'GET_REAL_SUBMISSION'
        eventTypeForGetReal = _getEventTypeByName(session, typeName=eventTypeName)
        _createNotification(session, eventTypeID=eventTypeForGetReal.id, objectID=artifact.id, objectType='artifact', type='email', subscriberID=member.id, frequency='instant')
        _createEventForType(session, typeName=eventTypeName, objectID=artifact.id, objectType='artifact', eventData=eventData, ownerID=member.id, processInstant=True)
    return artifact

def _updateMetaData(session, artifact, metaDataDict, messages, browseTermList, browseTermCache, tagTermList, searchTermList):

    def _process(dataDict, action, browseTermList=None):
        if not dataDict or len(dataDict) == 0:
            return

        if action == 'add':
            browseTermSet = []
            if browseTermList:
                for browseTermDict in browseTermList:
                    btID = browseTermDict.get('browseTermID')
                    browseTermSet.append(btID)
            log.debug('_updateMetaData: browseTermSet%s' % browseTermSet)

        for termType in dataDict.keys():
            termType = termType.strip()
            log.info('_updateMetaData: termType[%s]' % termType)
            if not types.get(termType):
                log.debug('_updateMetaData: unknown browse term type[%s]' % termType)
                messages.append('Unknown browse term type %s' % termType)
                continue

            termNames = dataDict[termType]
            for termName in termNames:
                if type(termName) == str:
                    termName = termName.strip()
                termTypeID = types[termType].id
                if termType == 'level' and termName.lower() not in ['basic', 'at grade', 'advanced']:
                    messages.append("Invalid browse term for type [%s]: %s" % (termType, termName))
                    continue
                browseTerms = _getBrowseTermsByName(session, termName, termTypeID=types[termType].id)
                if action == 'add':
                    if not browseTerms or len(browseTerms) == 0:
                        browseTerm = _createBrowseTerm(session, name=termName, browseTermType=termTypeID)
                        newBT = True
                        session.flush()
                        log.debug('_updateMetaData: created browse term[%s]' % browseTerm)
                    else:
                        browseTerm = browseTerms[0]
                        newBT = False
                        log.debug('_updateMetaData: existing browse term[%s]' % browseTerm.id)
                    if newBT or browseTerm.id not in browseTermSet:
                        artifactHasBrowseTerm = _getArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
                        if not artifactHasBrowseTerm:
                            _createArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
                            log.debug('_updateMetaData: created browse term[%s] for artifact[%s]' % (termName, artifact.id))
                            if not newBT:
                                ## No need to invalidate cache for newly created browse term
                                invalidateBrowseTerm(browseTermCache, browseTerm.id, memberID=artifact.creatorID, session=session)
                        else:
                            log.debug('_updateMetaData: browse term[%s] already exists for artifact[%s]' % (termName, artifact.id))
                            messages.append('BrowseTerm %s already exists for artifact %s' % (termName, artifact.id))
                elif action == 'remove':
                    if not browseTerms or len(browseTerms) == 0:
                        log.debug('_updateMetaData: browse term[%s] does not exist' % termName)
                        messages.append('BrowseTerm %s does not exist' % termName)
                        continue
                    browseTerm = browseTerms[0]
                    artifactHasBrowseTerm = _getArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
                    if artifactHasBrowseTerm:
                        log.debug('_updateMetaData: deleting artifact browse term[%s]' % artifactHasBrowseTerm)
                        _deleteArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
                        invalidateBrowseTerm(browseTermCache, browseTerm.id, memberID=artifact.creatorID, session=session)
                    else:
                        log.info('_updateMetaData: browse term[%s] does not exist for artifact[%s]' % (termName, artifact.id))
                        messages.append('BrowseTerm %s does not exist for artifact %s' % (termName, artifact.id))
                else:
                    log.debug('_updateMetaData: unknown action[%s]' % action)
                    messages.append('Unknown action %s' % action)

    def _processTagTerms(tagList, action, tagTermList=None):
        if not tagList or len(tagList) == 0:
            return

        if action == 'add':
            tagTermSet = []
            if tagTermList:
                for tagTermDict in tagTermList:
                    btID = tagTermDict.get('tagTermID')
                    tagTermSet.append(btID)
            log.debug('_updateMetaData: tagTermSet%s' % tagTermSet)

        for termName in tagList:
            if type(termName) == str:
                termName = termName.strip()
            tagTerm = _getTagTermByName(session, termName)
            if action == 'add':
                if not tagTerm:
                    tagTerm = _createTagTerm(session, name=termName)
                    newTT = True
                    session.flush()
                    log.debug('_updateMetaData: created tag term[%s]' % tagTerm)
                else:
                    newTT = False
                    log.debug('_updateMetaData: existing tag term[%s]' % tagTerm.id)
                if newTT or tagTerm.id not in tagTermSet:
                    artifactHasTagTerm = _getArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)
                    if not artifactHasTagTerm:
                        _createArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)
                        log.debug('_updateMetaData: created tag term[%s] for artifact[%s]' % (termName, artifact.id))
                    else:
                        log.debug('_updateMetaData: tag term[%s] already exists for artifact[%s]' % (termName, artifact.id))
                        messages.append('TagTerm %s already exists for artifact %s' % (termName, artifact.id))
            elif action == 'remove':
                if not tagTerm:
                    log.debug('_updateMetaData: tag term[%s] does not exist' % termName)
                    messages.append('TagTerm %s does not exist' % termName)
                    continue
                artifactHasTagTerm = _getArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)
                if artifactHasTagTerm:
                    log.debug('_updateMetaData: deleting artifact tag term[%s]' % artifactHasTagTerm)
                    _deleteArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)
                else:
                    log.info('_updateMetaData: tag term[%s] does not exist for artifact[%s]' % (termName, artifact.id))
                    messages.append('TagTerm %s does not exist for artifact %s' % (termName, artifact.id))
            else:
                log.debug('_updateMetaData: unknown action[%s]' % action)
                messages.append('Unknown action %s' % action)

    def _processSearchTerms(searchList, action, searchTermList=None):
        if not searchList or len(searchList) == 0:
            return

        if action == 'add':
            searchTermSet = []
            if searchTermList:
                for searchTermDict in searchTermList:
                    btID = searchTermDict.get('searchTermID')
                    searchTermSet.append(btID)
            log.debug('_updateMetaData: searchTermSet%s' % searchTermSet)

        for termName in searchList:
            if type(termName) == str:
                termName = termName.strip()
            searchTerm = _getSearchTermByName(session, termName)
            if action == 'add':
                if not searchTerm:
                    searchTerm = _createSearchTerm(session, name=termName)
                    newTT = True
                    session.flush()
                    log.debug('_updateMetaData: created search term[%s]' % searchTerm)
                else:
                    newTT = False
                    log.debug('_updateMetaData: existing search term[%s]' % searchTerm.id)
                if newTT or searchTerm.id not in searchTermSet:
                    artifactHasSearchTerm = _getArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)
                    if not artifactHasSearchTerm:
                        _createArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)
                        log.debug('_updateMetaData: created search term[%s] for artifact[%s]' % (termName, artifact.id))
                    else:
                        log.debug('_updateMetaData: search term[%s] already exists for artifact[%s]' % (termName, artifact.id))
                        messages.append('SearchTerm %s already exists for artifact %s' % (termName, artifact.id))
            elif action == 'remove':
                if not searchTerm:
                    log.debug('_updateMetaData: search term[%s] does not exist' % termName)
                    messages.append('SearchTerm %s does not exist' % termName)
                    continue
                artifactHasSearchTerm = _getArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)
                if artifactHasSearchTerm:
                    log.debug('_updateMetaData: deleting artifact search term[%s]' % artifactHasSearchTerm)
                    _deleteArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)
                else:
                    log.info('_updateMetaData: search term[%s] does not exist for artifact[%s]' % (termName, artifact.id))
                    messages.append('SearchTerm %s does not exist for artifact %s' % (termName, artifact.id))
            else:
                log.debug('_updateMetaData: unknown action[%s]' % action)
                messages.append('Unknown action %s' % action)

    types = _getBrowseTermTypesDict(session)

    mdDict = metaDataDict.copy()
    addDict = mdDict.get('add', None)
    log.debug('_updateMetaData: addDict %s' % str(addDict))
    if addDict:
        if 'tag' in addDict:
            tagList = addDict['tag']
            _processTagTerms(tagList, 'add', tagTermList)
            del addDict['tag']
        if 'search' in addDict:
            searchList = addDict['search']
            _processSearchTerms(searchList, 'add', searchTermList)
            del addDict['search']
        _process(addDict, 'add', browseTermList)

    removeDict = metaDataDict.get('remove', None)
    log.debug('_updateMetaData: removeDict %s' % str(removeDict))
    if removeDict:
        if 'tag' in removeDict:
            tagList = removeDict['tag']
            _processTagTerms(tagList, 'remove')
            del removeDict['tag']
        if 'search' in removeDict:
            searchList = removeDict['search']
            _processSearchTerms(searchList, 'remove')
            del removeDict['search']
        _process(removeDict, 'remove')

@_transactional()
def assembleArtifact(session, member, info, isRevision, messages, artifactTypeDict, resourceTypeDict, roleNameDict, cache):
    artifactRevision, vcs, newRev = _assembleArtifact(session, member, info, isRevision, [], {}, messages, artifactTypeDict, resourceTypeDict, roleNameDict, cache, vcs=None, commit=True)
    log.debug('assembleArtifact: done artifactRevision[%s]' % artifactRevision)

    if info.get('deepCopy') or info.get('make_copy'):

        idName = 'artifactRevisionID' if isRevision else 'artifactID'
        id = _getChildID(info, idName)
        auditTrailDict = {
                'auditType': 'artifact_deep_copy',
                'deepCopy_phase': 'copy',
                'memberID': member.id,
                'name': info.get('title'),
                idName: id,
                'time': datetime.utcnow()
        }
        try:
            AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
        except Exception, e:
            log.error('deep_copy_analysis: There was an issue logging the audit trail: %s' % e)
    return artifactRevision

def _getChildID(child, idName):
    try:
        id = long(child)
    except TypeError:
        try:
            id = long(child.get(idName))
        except (TypeError, ValueError):
            id = -1
    return id

def _getArtifactInfo(session, member, info, artifactTypeDict, name=None, handle=None, artifact=None, id=None, isRevision=False):
    typeName = info.get('artifactType')
    if typeName is None:
        raise ex.InvalidArgumentException((_(u'Missing artifact type')).encode("utf-8"))
    typeID = artifactTypeDict.get(typeName)
    if typeID is None:
        raise ex.InvalidArgumentException((_(u'Incorrect artifact type, %(typeName)s')  % {"typeName":typeName}).encode("utf-8"))
    if name is None:
        name = info.get('title')
        if name:
            name = name.strip()
    if not handle:
        handle = info.get('handle')
    if not handle:
        handle = model.title2Handle(name)
    handle = handle.strip()
    if typeName == 'chapter':
        bookName = info.get('bookTitle').strip()
        name = _appendBookName(name, bookName)
        handle = _appendBookName(handle, bookName)
        handle = model.title2Handle(handle)

    if artifact is None:
        log.debug('_getArtifactInfo: handle[%s]' % handle)
        log.debug('_getArtifactInfo: id[%s] isRevision[%s]' % (id, isRevision))
        if handle:
            artifact = _getArtifactByHandle(session, handle, typeID, member.id)
        elif id and id > 0:
            if not isRevision:
                artifact = _getArtifactByID(session, id=id)
            else:
                revision = _getArtifactRevisionByID(session, id=id)
                if revision:
                    artifact = _getArtifactByID(session, id=revision.artifactID)
            if artifact:
                #
                #  Set up the name and handle again.
                #
                return _getArtifactInfo(session, member, info, artifactTypeDict, artifact=artifact)
    return artifact, typeID, name, handle

def _updateAuthors(session, artifact, authors, roleNameDict):
    log.debug('_updateAuthors: artifact.id[%s]' % artifact.id)
    log.debug('_updateAuthors: authors[%s]' % authors)
    isChanged = False
    if authors:
        authorsDict = {}
        try:
            if type(authors) != dict:
                authors = json.loads(authors)
            for roleName in authors.keys():
                roleID = roleNameDict[roleName]
                aList = authors[roleName]
                sequence = 0
                for authorInfo in aList:
                    if isinstance(authorInfo, list):
                        authorName, seq = authorInfo
                    else:
                        authorName = authorInfo
                        seq = None
                    sequence += 1
                    if not authorsDict.has_key(authorName):
                        authorsDict[authorName] = {}
                    authorsDict[authorName][roleID] = seq if seq else sequence
            log.debug('_updateAuthors: authorsDict[%s]' % authorsDict)

            for author in artifact.authors:
                if not authorsDict.has_key(author.name) or author.roleID not in authorsDict[author.name].keys():
                    log.debug('_updateAuthors: Removing author[%s]' % author)
                    _deleteArtifactHasAuthor(session, artifactID=artifact.id, name=author.name, roleID=author.roleID)

            authors = {}
            for author in artifact.authors:
                if not authors.has_key(author.name):
                    authors[author.name] = {}
                authors[author.name][author.roleID] = author
            log.debug('_updateAuthors: authors[%s]' % authors)
            artifact.authors = []
            if authorsDict:
                for authorName in authorsDict.keys():
                    for roleID in authorsDict[authorName].keys():
                        sequence = authorsDict[authorName][roleID]
                        name = authors.get(authorName)
                        if name and name.has_key(roleID):
                            artifactAuthor = name[roleID]
                            log.debug('_updateAuthors: existing author[%s] sequence[%s]' % (artifactAuthor, sequence))
                            artifactAuthor.sequence = sequence
                        else:
                            artifactAuthor = model.ArtifactAuthor(artifactID=artifact.id, name=authorName, roleID=roleID, sequence=sequence)
                            log.debug('_updateAuthors: new author[%s]' % artifactAuthor)
                        artifact.authors.append(artifactAuthor)
                        isChanged = True
        except ValueError, ve:
            log.error('_updateAuthors: exception[%s]' % ve)
            raise ex.InvalidArgumentException((_(u'Invalid formats for authors[%(authors)s]')  % {"authors":authors}).encode("utf-8"))
        except Exception, e:
            log.error('_updateAuthors: exception[%s]' % e)
            raise e

        log.debug('_updateAuthors: isChanged[%s]' % isChanged)
        return isChanged

def _assembleArtifact(session, member, info, isRevision, resourceRevisionList, resourceRevisionDict, messages, artifactTypeDict, resourceTypeDict, roleNameDict, cache, vcs=None, commit=False, toCreate=False):
    """
        Assemble an artifact based on the given information.
    """
    log.debug('_assembleArtifact: info[%s]' % info)
    isDirty = False
    isChanged = False
    isExist = False
    modXhtml = False
    new_name = None
    name = info.get('title')
    description = info.get('summary')
    messageToUsers = info.get('messageToUsers', None)
    revisionComment = info.get('comment', None)
    xhtml = info.get('xhtml', None)
    children = info.get('children', [])
    handle = info.get('handle', None)
    encodedID = info.get('encodedID')
    languageCode = info.get('languageCode', 'en')
    language = _getLanguageByNameOrCode(session, nameOrCode=languageCode)
    if not language:
        raise Exception(_('Invalid languageCode [%s]' % languageCode))
    deepCopy = info.get('deepCopy')
    publish = info.get('publish', None)
    if publish is not None:
        if type(publish) == str or type(publish) == unicode:
            publish = publish.lower().strip()
            if publish in ['', 'none']:
                publish = None
            else:
                publish = publish in ['true', 'yes']
    coverImageRevID = info.get('coverImageRevID',None)
    idName = 'artifactRevisionID' if isRevision else 'artifactID'
    id = _getChildID(info, idName)
    resourceRevisionIDs = info.get('resourceRevisionIDs', None)
    resourceRevisions = _get_resourceRevisions_from_dict(session, info, func_name="_assembleArtifact")

    artifact = None
    artifactRevision = None
    now = datetime.now()
    rev = None
    toCreateRev = False
    toUpdateRev = False
    if id <= 0 or toCreate:
        #
        #  Supposed to be new artifact, see if it exists already.
        #
        artifact, typeID, name, handle = _getArtifactInfo(session,
                                                          member,
                                                          info,
                                                          artifactTypeDict,
                                                          name,
                                                          handle,
                                                          id=id,
                                                          isRevision=isRevision)
        if artifact and ( typeID != 2 or not toCreate ):
            id = artifact.id
            isExist = True
        else:
            if id > 0 and typeID == 2 and resourceRevisions is None:
                if isRevision:
                    revision = _getArtifactRevisionByID(session, id=id)
                else:
                    artifact = _getArtifactByID(session, id=id)
                    revision = artifact.revisions[0]
                log.debug('_assembleArtifact: revision id[%s]' % revision.id)
                resourceRevisions = revision.resourceRevisions
            #
            #  Create artifact.
            #
            artifact = model.Artifact(artifactTypeID=typeID,
                                      name=name,
                                      handle=handle,
                                      encodedID=encodedID,
                                      description=description,
                                      languageID=language.id,
                                      creatorID=member.id,
                                      creationTime=now)
            log.debug('_assembleArtifact: new artifact[%s]' % artifact)
            rev = '1'
            isDirty = True
            toCreateRev = True
            modXhtml = True
        if toCreate:
            id = 0
    newCopy = False
    copied = False
    if id > 0 or isExist:
        #
        #  Existing artifact.
        #
        isExist = True
        if id > 0 and isRevision:
            artifactRevision = _getArtifactRevisionByID(session, id)
            if artifactRevision is None:
                raise Exception((_(u'ArtifactRevision of %(id)d not found')  % {"id":id}).encode("utf-8"))

            id = artifactRevision.artifactID
            if artifact:
                if id != artifact.id:
                    raise Exception((_(u'Artifact[%(artifact.id)s] not related to this revision[%(artifactRevision.id)s] of [%(id)s]')  % {"artifact.id":artifact.id,"artifactRevision.id": artifactRevision.id,"id": id}).encode("utf-8"))
                if artifactRevision != artifact.revision[0]:
                    raise Exception((_(u"ArtifactRevision of %(id)d not latest[%(artifact.revision[0].id)s]")  % {"id":id,"artifact.revision[0].id": artifact.revision[0].id}).encode("utf-8"))

            log.info('_assembleArtifact: artifactRevision[%s]' % artifactRevision.id)

        if artifact is None:
            artifact = _getArtifactByID(session, id)
            if artifact is None:
                raise Exception((_(u'Artifact of %(id)s not found')  % {"id":id}).encode("utf-8"))
        log.info('_assembleArtifact: existing artifact[%s]' % artifact.id)

        artifact, typeID, name, handle = _getArtifactInfo(session,
                                                          member,
                                                          info,
                                                          artifactTypeDict,
                                                          name,
                                                          handle,
                                                          artifact)
        parentName = info.get('bookTitle', '')

        name, new_name, handle = _get_new_name_handle(artifact, name, handle, parent_name=parentName)
        log.info('_assembleArtifact: name old[%s] new[%s] handle[%s]' % (artifact.name, new_name, handle))

        if deepCopy or info.get('make_copy'):
            if vcs is None:
                vcs = v.vcs(member.id, session=session)
            targetArtifactID = info.get('targetArtifactID', None)
            log.info('_assembleArtifact: calling _copyArtifact resourceRevisionIDs[%s]' % resourceRevisionIDs)
            artifact, newCopy = _copyArtifact(session, artifact, member, vcs, parentName=parentName, name=name, handle=handle, resourceRevisions=resourceRevisions, deepCopy=True, publish=publish, targetArtifactID=targetArtifactID, artifactRevision=artifactRevision)
            if newCopy:
                #
                #  Already a new artifact, no need to create new revision.
                #
                toCreateRev = False
                isExist = False
                copied = True
            toUpdateRev = True
            log.info('_assembleArtifact: copy[%s] createRev[%s] updateRev[%s] newCopy[%s]' % (artifact.id, toCreateRev, toUpdateRev, newCopy))
            artifactRevision = artifact.revisions[0]

        if artifactRevision is None:
            artifactRevision = artifact.revisions[0]
        log.info('_assembleArtifact: current artifact[%s] artifactRevision[%s]' % (artifact.id, artifactRevision.id))

        if encodedID and artifact.encodedID != encodedID:
            isDirty = True
        if new_name:
            log.info('_assembleArtifact: name changed old[%s] new[%s] handle[%s]' % (artifact.name, new_name, handle))
            isDirty = True
        #
        #  See if it's necessary to create a new revision.
        #
        if xhtml:
            #
            #  Any change in contents?
            #
            contents = artifact.getXhtml(revision=artifactRevision)
            xhtml = h.transform_to_xhtml(xhtml, validateRosetta=True, validateImages=True)
            modXhtml = xhtml != contents
            log.debug('_assembleArtifact: modXhtml[%s]' % modXhtml)
            if modXhtml:
                isChanged = True
            if not toCreateRev and not newCopy:
                toCreateRev = modXhtml
        log.info('_assembleArtifact: new revision[%s]' % toCreateRev)

        childList = _getArtifactRevisionChildren(session, artifactRevision.id)
        log.info('_assembleArtifact: childList[%s]' % childList)
        log.debug('_assembleArtifact: children[%s]' % children)
        if not toCreateRev and not newCopy and children is not None:
            #
            #  Any change of child list?
            #
            if len(children) != len(childList):
                log.info('_assembleArtifact: mismatch old[%s] new[%s]' % (len(childList), len(children)))
                isChanged = True
                toCreateRev = True
            elif len(children) > 0:
                for n in range(0, len(children)):
                    childInfo = children[n]
                    id = _getChildID(childInfo, 'artifactRevisionID')
                    if id <= 0:
                        childInfo['bookTitle'] = artifact.name
                        child, t, m, x = _getArtifactInfo(session,
                                                          member,
                                                          childInfo,
                                                          artifactTypeDict)
                        if child is not None:
                            id = child.revisions[0].id
                    if id != childList[n]:
                        log.info('_assembleArtifact: child mismatch n[%s] old[%s] new[%s]' % (n, childList[n], id))
                        isChanged = True
                        toCreateRev = True
                        break

        if info.get('artifactType') == 'book':
            revNo = len(artifact.revisions)
            #
            #  Rename the handle of children that will not be on the new revision.
            #
            childDict = {}
            for childInfo in children:
                id = _getChildID(childInfo, 'artifactRevisionID')
                childDict[id] = childInfo
            for childID in childList:
                if childDict.get(childID):
                    #
                    #  Child in new revision, skip.
                    #
                    continue
                #
                #  Get the child and modify the handle.
                #
                child = _getArtifactRevisionByID(session, childID)
                ca = child.artifact
                if ca.type.name == 'chapter' and ca.creatorID == member.id:
                    cPattern = model.getChapterSeparator()
                    cItems = re.split(cPattern, ca.handle)
                    cItem = cItems[0]
                    rPattern = '-::rev::-'
                    rItems = re.split(rPattern, cItem)
                    if len(rItems) == 1:
                        cItems[0] = '%s%s%s' % (cItem, rPattern, revNo)
                    else:
                        rItems[-1] = str(revNo)
                        cItems[0] = rPattern.join(rItems)
                    cHandle = cPattern.join(cItems)
                    log.debug('_assembleArtifact: modified chapter handle[%s]' % cHandle)
                    ca.handle = cHandle
                    session.add(ca)

        if description is not None and artifact.description != description:
            log.debug('_assembleArtifact: description changed old[%s] new[%s]' % (artifact.description, description))
            isDirty = True

    if isDirty or isChanged:
        if not copied and member.id != artifact.creatorID:
            if vcs is None:
                vcs = v.vcs(member.id, session=session)
            artifact, newCopy = _copyArtifact(session, artifact, member, vcs, parentName=parentName, name=artifact.name, handle=artifact.handle, resourceRevisions=resourceRevisions, publish=publish)
            if newCopy:
                #
                #  Already a new artifact, no need to create new revision.
                #
                toCreateRev = False
                isExist = False
                copied = True
                artifactRevision = artifact.revisions[0]
        #
        #  Update attributes of artifact.
        #
        artifact.description = description
        if encodedID:
            artifact.encodedID = encodedID
        if new_name:
            _archiveArtifactHandle(session, artifact.id, artifact.handle, artifact.artifactTypeID, artifact.creatorID)
            if cache:
                invalidatePerma(cache, artifact)
            artifact.name = new_name
            artifact.handle = handle
        log.debug('_assembleArtifact: artifact[%s]' % artifact)
        session.add(artifact)
    #
    #  Process children.
    #
    childList = []
    for childInfo in children:
        id = _getChildID(childInfo, 'artifactRevisionID')
        if id == childInfo or str(id) == childInfo:
            child = _getArtifactRevisionByID(session, id)
            if not child:
                raise ex.NotFoundException((_(u'No ArtifactRevision of id[%(id)s].')  % {"id":id}).encode("utf-8"))
            if deepCopy:
                if vcs is None:
                    vcs = v.vcs(member.id, session=session)
                source = _getArtifactByID(session, id=child.artifactID)
                log.info('_assembleArtifact: copying from[%s, %s]' % (source.id, id))
                a, newChildCopy = _copyArtifact(session, source, member, vcs, recursive=True, publish=publish, artifactRevision=child)
                child = a.revisions[0]
                log.info('_assembleArtifact: copied to[%s, %s]' % (a.id, child.id))
                if newChildCopy:
                    if not newCopy:
                        #
                        #  A new child, need new revision.
                        #
                        toCreateRev = True
                    else:
                        isChanged = True

                authors = {}
                for author in source.authors:
                    roleName = author.role.name
                    if not authors.get(roleName):
                        authors[roleName] = []
                    authors[roleName].append([author.name, author.sequence])
                isChanged = _updateAuthors(session, a, authors, roleNameDict) or isChanged

        else:
            toCreate = False
            toShare = False
            if id > 0 and not ( deepCopy or childInfo.get('make_copy', None) or childInfo.get('updated', False) ):
                #
                #  Find out if its chapter is part of
                #  this book. If not, indicate that it
                #  should be created.
                #
                toShare = True
                if artifact.artifactTypeID == 1:
                    if not artifactRevision:
                        toCreate = True
                        toShare = False
                        log.debug('_assembleArtifact: incomplete artifact[%s]' % artifact)
                    else:
                        query = session.query(model.ArtifactRevisionRelation)
                        query = query.filter_by(artifactRevisionID=artifactRevision.id)
                        query = query.filter_by(hasArtifactRevisionID=id)
                        toShare = query.first()
                    if not toShare:
                        #
                        #  Only to create if this is a chapter.
                        #
                        query = session.query(model.Artifact)
                        query = query.join(model.ArtifactRevision, model.Artifact.id == model.ArtifactRevision.artifactID)
                        query = query.filter(model.ArtifactRevision.id == id)
                        a = query.first()
                        if not a:
                            raise Exception((_(u'No artifact for revision %(revision)s')  % {"revision":id}).encode("utf-8"))
                        if a.artifactTypeID != 2:
                            toCreate = False
                            toShare = True
                        # No sharing of own chapter
                        if a.artifactTypeID == 2 and a.creatorID == member.id:
                            toCreate = True
            log.debug('_assembleArtifact: toCreate[%s]' % toCreate)
            log.debug('_assembleArtifact: toShare[%s]' % toShare)
            if toShare:
                log.debug('_assembleArtifact: sharing child id[%s]' % id)
                child = _getArtifactRevisionByID(session, id)
            else:
                log.debug('_assembleArtifact: processing child id[%s]' % id)
                childInfo['bookTitle'] = artifact.name
                if deepCopy:
                    childInfo['deepCopy'] = True
                    childInfo['publish'] = publish

                child, vcs, newRev = _assembleArtifact(session,
                                                       member,
                                                       childInfo,
                                                       id > 0,
                                                       resourceRevisionList,
                                                       resourceRevisionDict,
                                                       messages,
                                                       artifactTypeDict,
                                                       resourceTypeDict,
                                                       roleNameDict,
                                                       cache,
                                                       vcs=vcs,
                                                       commit=False,
                                                       toCreate=toCreate)
                if newRev:
                    if not toCreateRev and not newCopy:
                        toCreateRev = True
                    else:
                        isChanged = True
                if child is None or child.artifact is None:
                    raise ex.NotFoundException((_(u'No child of id %(child)s.')  % {"child":id}).encode("utf-8"))
                log.info('_assembleArtifact: child[%s, %s]' % (child.artifact.id, child.id))

            if child is None or child.artifact is None:
                raise ex.NotFoundException((_(u'No child of id %(child)s.')  % {"child":id}).encode("utf-8"))
            log.info('_assembleArtifact: child[%s, %s]' % (child.artifact.id, child.id))

        if child in childList:
            raise ex.DuplicateTitleException((_(u'Child[%(name)s] already added.')  % {"name":child.artifact.name}).encode("utf-8"))
        childList.append(child)
    childIDList = []
    for child in childList:
        childIDList.append([child.artifactID, child.id])
    log.info('_assembleArtifact: childIDList%s' % childIDList)
    log.debug('_assembleArtifact: childList%s' % childList)

    if not toCreateRev:
        log.info('_assembleArtifact: arid[%s] publishTime[%s]' % (artifact.revisions[0].id, artifact.revisions[0].publishTime))
        if ( publish is not None or publish ) and newCopy and len(artifact.revisions) > 1 and artifact.revisions[1].publishTime:
            artifactRevision.publishTime = datetime.now()
        log.info('_assembleArtifact: publishTime[%s]' % artifactRevision.publishTime)
        toAppend = resourceRevisions is not None and len(resourceRevisions) > 0
        _associateResources(session, artifact.revisions[0], resourceRevisions, member, vcs, toAppend=toAppend)
    else:
        handle = artifact.handle
        #
        #  Set new revision.
        #
        if rev is None:
            origArtifactRevision = artifact.revisions[0]
            rev = str(long(origArtifactRevision.revision) + 1)
        log.info('_assembleArtifact: new rev[%s]' % rev)
        #
        #  Create new revision.
        #
        artifactRevision = model.ArtifactRevision(revision=rev,
                                                  downloads=0,
                                                  favorites=0)
        if ( publish is None or publish ) and artifact.revisions and len(artifact.revisions) > 0:
            revision = artifact.revisions[0]
            log.info('_assembleArtifact: arid[%s] publishTime[%s]' % (revision.id, revision.publishTime))
            if revision.publishTime:
                artifactRevision.publishTime = datetime.now()
            log.info('_assembleArtifact: publishTime[%s]' % artifactRevision.publishTime)
        log.info('_assembleArtifact: new artifactRevision[%s]' % artifactRevision.id)
        #
        #  Associate resources to the new revision, if any.
        #
        toAppend = resourceRevisions is not None and len(resourceRevisions) > 0
        if len(artifact.revisions) > 0:
            origArtifactRevision = artifact.revisions[0]
            artifactRevision.resourceRevisions = origArtifactRevision.resourceRevisions
        else:
            artifactRevision.resourceRevisions = []
        _associateResources(session, artifactRevision, resourceRevisions, member, vcs, toAppend=toAppend)
        _addArtifactRevision(session, artifact, artifactRevision)

        session.add(artifactRevision)
        session.flush()

    if artifactRevision is None:
        raise Exception((_(u'_assembleArtifact: should have artifactRevision by now.')).encode("utf-8"))
    if revisionComment is not None:
        artifactRevision.comment = revisionComment
    if messageToUsers is not None and messageToUsers != 'None' and artifactRevision.messageToUsers != messageToUsers:
        log.debug('_assembleArtifact: messageToUsers changed old[%s] new[%s]' % (artifactRevision.messageToUsers, messageToUsers))
        artifactRevision.messageToUsers = messageToUsers
        isDirty = True
    if coverImageRevID:
        _createArtifactHasResource(session, artifactRevisionID=artifactRevision.id,resourceRevisionID=coverImageRevID)
    #
    #  Build/Reconstruct the child list.
    #
    if toCreateRev or toUpdateRev:
        artifactRevision.children = []
        seq = 0
        for child in childList:
            log.info('_assembleArtifact: Checking for cycles: %s' % str(child.id))
            if _hasCycle(session, artifact.id, child.artifactID):
                raise Exception((_(u'Cycle detected while adding child[%(child.id)s] to %(artifact.id)s')  % {"child.id":child.id,"artifact.id": artifact.id}).encode("utf-8"))

            seq += 1
            relation = _getArtifactRevisionRelation(session, artifactRevision.id, child.id)
            if relation is not None:
                relation.sequence = seq
            else:
                relation = model.ArtifactRevisionRelation(
                                        artifactRevisionID=artifactRevision.id,
                                        hasArtifactRevisionID=child.id,
                                        sequence=seq)
                session.add(relation)
            log.info('_assembleArtifact: Adding relation: id: %s hasID: %s seq: %s' % (relation.artifactRevisionID, relation.hasArtifactRevisionID, relation.sequence))
            artifactRevision.children.append(relation)

    try:
        #
        #  Contents.
        #
        if modXhtml and xhtml is not None:
            if vcs is None:
                vcs = v.vcs(member.id, session=session)

            resourceType = 'contents'
            resourceTypeID = resourceTypeDict[resourceType]
            key = '%s-%s-%s' % (resourceTypeID, handle, member.id)
            log.debug('_assembleArtifact: key[%s]' % key)
            #
            #  See if the meatdata of this resource exsits already.
            #
            query = session.query(model.Resource)
            query = query.filter(and_(
                            model.Resource.resourceTypeID == resourceTypeID,
                            model.Resource.handle == handle,
                            model.Resource.ownerID == member.id))
            resource = _queryOne(query)
            log.debug('_assembleArtifact: resource[%s]' % resource)
            if resource:
                uri = resource.uri
                resourceRevision = resource.revisions[0]
            else:
                resourceRevision = artifact.getResourceRevision(artifactRevision,
                                                                resourceType)
                if resourceRevision is None:
                    uri = '%s%s' % (str(artifactRevision.id), '.xhtml')
                else:
                    uri = resourceRevision.resource.uri

            if resourceRevision is None:
                resourceDict = {
                    'ownerID': member.id,
                    'uriOnly': False,
                    'isExternal': False,
                    'name': name,
                    'handle': handle,
                    'uri': uri,
                    'resourceType': resourceTypeID,
                    'contents': xhtml,
                    'creationTime': now,
                }
                resourceRevision = _createResource(session,
                                                   resourceDict,
                                                   artifactRevision=artifactRevision,
                                                   vcs=vcs,
                                                   commit=False)
                resource = resourceRevision.resource
                log.debug('_assembleArtifact: new resourceRevision[%s]' % resourceRevision)
            else:
                resource = resourceRevision.resource
                resourceDict = {
                    'id': resource.id,
                    'resourceTypeID': resourceTypeID,
                    'resourceRevision': resourceRevision,
                    'resourceName': resource.name,
                    'contents': xhtml,
                }
                resourceRevision, oc, ov = _updateResource(session,
                                                           resourceDict,
                                                           member,
                                                           vcs=vcs,
                                                           commit=False)
                log.debug('_assembleArtifact: update resourceRevision[%s]' % resourceRevision)

            ## Bug: 16820
            ## Check for existing content resource - if present, we replace it with the new resource revision...
            found = False
            i = 0
            while i < len(artifactRevision.resourceRevisions):
                if artifactRevision.resourceRevisions[i].resource.type.name == resourceType and artifactRevision.resourceRevisions[i].id != resourceRevision.id:
                    log.debug("_assembleArtifact: Replacing resourceRevision(%s) with resourceRevision(%s) (resource: %s)" % (artifactRevision.resourceRevisions[i].id, resourceRevision.id, resourceRevision.resource.id))
                    artifactRevision.resourceRevisions[i] = resourceRevision
                    found = True
                    break
                i += 1
            # ... otherwise append it as a new resource revision.
            if not found:
                log.debug("_assembleArtifact: Adding resource revision: %s (resource: %s)" % (resourceRevision.id, resourceRevision.resource.id))
                artifactRevision.resourceRevisions.append(resourceRevision)
            log.info("_assembleArtifact: Resource revisions for new artifact revision: %s" % len(artifactRevision.resourceRevisions))

            resourceRevisionList.append(resourceRevision)
            ## Not sure of the purpose of this dictionary - Nimish
            ## TODO: Please evaluate and remove, if unnecessary
            resourceRevisionDict[key] = resourceRevision
        #
        #  Create author instances.
        #
        authors = info.get('authors')
        isChanged = _updateAuthors(session, artifact, authors, roleNameDict) or isChanged

        if commit and vcs is not None:
            #
            #  Commit the content in VCS and save the resource revision.
            #
            session.flush()
            revision = vcs.commit('Added resources for artifact %s' % artifact.id)
            for resourceRevision in resourceRevisionList:
                _setResourceRevision(session, resourceRevision, revision)
            log.info('_assembleArtifact: vcs committed')
        #
        #  Process events.
        #
        log.info('isDirty: %s' %(isDirty))
        log.info('isChanged: %s' %(isChanged))
        log.info('isExist: %s' %(isExist))
        log.info('toCreateRev: %s' %(toCreateRev))
        if not isExist:
            #
            #  Add object to library.
            #
            session.flush()
            _safeAddObjectToLibrary(session,
                                    objectID=artifactRevision.id,
                                    objectType='artifactRevision',
                                    memberID=member.id)
            _processCreateArtifactEvents(session, artifact)
        elif toCreateRev:
            #
            #  Add revision to library.
            #
            session.flush()
            _safeAddObjectToLibrary(session,
                                    objectID=artifactRevision.id,
                                    objectType='artifactRevision',
                                    memberID=member.id)
            try:
                #
                #  Log the new artifact revision event.
                #
                data = {
                    'type': artifact.type.name,
                    'id': artifact.id,
                    'version': artifact.revisions[0].revision
                }
                _createEventForType(session,
                                    typeName='ARTIFACT_REVISION_CREATED',
                                    objectID=artifact.id,
                                    objectType='artifact',
                                    eventData=json.dumps(data),
                                    ownerID=member.id, processInstant=True)
            except Exception as e:
                log.error("_assembleArtifact: Error logging ARTIFACT_REVISION_CREATED event: %s" % str(e), exc_info=e)

        metaDataDict = info.get('changed_metadata', None)
        if metaDataDict and len(metaDataDict) > 0:
            _updateMetaData(session, artifact, metaDataDict, messages, None, cache.relatedArtifactCache.browseTermCache, None, None)
            isDirty = True

        if isDirty or isChanged:
            try:
                #
                #  No new revision created - change in title, author etc.
                #
                log.info('_assembleArtifact: Removing print resources')
                _removePrintResources(session, artifactRevision)
            except Exception as e:
                log.error("_assembleArtifact: Error logging remove print resource event: %s" % str(e), exc_info=e)
    finally:
        if commit and vcs is not None:
            #
            #  If it has been committed, then there should be nothing to
            #  revert.
            #
            vcs.revert()
        artifact.updateTime = datetime.now()
        session.flush()
        log.info('_assembleArtifact: done')

    if isDirty or isChanged or toCreateRev:
        invalidateArtifact(cache, artifact, memberID=member.id)
        log.info('_assembleArtifact: done invalidating cache for artifact id[%s]' % artifact.id)
    else:
        log.info("!!! _assembleArtifact: Skipped invalidation for artifact id[%s]. isDirty[%s], isChanged[%s], toCreateRev[%s]" % (artifact.id, isDirty, isChanged, toCreateRev))
    return artifactRevision, vcs, (toCreateRev or newCopy)

def _processCreateArtifactEvents(session, artifact):
    ## Log appropriate events
    try:
        if artifact.type.name in ['domain', 'study-track', 'assignment']:
            return

        _createEventForType(session, typeName='ARTIFACT_CREATED', objectID=artifact.id, objectType='artifact', ownerID=artifact.creatorID, processInstant=True)

        ## Related material
        types={'tebook': 'Teacher Edition', 'labkit': 'Lab Kit', 'studyguide': 'Study Guide', 'workbook': 'Workbook', 'quizbook': 'Quizzes and Tests'}
        if artifact.type.name in ['tebook', 'workbook', 'studyguide', 'labkit', 'quizbook']:
            ## TODO: Get original artifact
            origArtifacts = _getRelatedArtifactsByTypes(session, artifact, typeNames=['book'])
            if origArtifacts:
                origArtifact = origArtifacts[0]
                if origArtifact:
                    data = {'type': types.get(artifact.type.name), 'id': artifact.id}
                    _createEventForType(session, typeName='ARTIFACT_RELATED_MATERIAL_ADDED', objectID=origArtifact.id, objectType='artifact', eventData=json.dumps(data), ownerID=artifact.creatorID, processInstant=True)
    except Exception as e:
        log.error("Error logging event: %s" % str(e), exc_info=e)

def _computeReferenceHashForResource(session, handle, resourceTypeName, member):
    m = hashlib.md5()
    m.update(h.safe_encode(handle))
    m.update(resourceTypeName)
    m.update(h.safe_encode(member.login) if member.login else member.email)
    hash = m.hexdigest()
    while _getUnique(session, model.Resource, 'refHash', hash):
        ## Make sure the hash is unique
        m.update(member.email)
        hash = m.hexdigest()
    return hash

@_transactional()
def createResource(session, resourceDict, commit=False, artifactTypeName=None):
    if isinstance(resourceDict['resourceType'], (str, unicode)):
        resourceType = _getResourceTypeByName(session, name=resourceDict['resourceType'])
    else:
        resourceType = _getInstance(session, resourceDict['resourceType'], model.ResourceType)
    if resourceType.versionable:
        raise ex.WrongTypeException((_(u'%(resourceType.name)s type is not allowed.')  % {"resourceType.name":resourceType.name}).encode("utf-8"))

    return _createResource(session=session, resourceDict=resourceDict, resourceType=resourceType, commit=commit, artifactTypeName=artifactTypeName)

def _createResource(session, resourceDict, artifactRevision=None, resourceType=None, vcs=None, commit=False, artifactTypeName=None):
    log.debug("Resource dict: %s" % resourceDict)
    useImageSatellite, imageSatelliteServer, iamImageSatellite = h.getImageSatelliteOptions()
    fcclient = fc.FCClient()
    if resourceType is None:
        if isinstance(resourceDict['resourceType'], (str, unicode)):
            resourceType = _getResourceTypeByName(session, name=resourceDict['resourceType'])
        else:
            resourceType = _getInstance(session, resourceDict['resourceType'], model.ResourceType)
    resourceTypeID = resourceType.id
    del(resourceDict['resourceType'])
    resourceDict['resourceTypeID'] = resourceTypeID


    ownerID = resourceDict['ownerID']
    member = _getUnique(session, model.Member, 'id', ownerID)

    #
    #  Save the contents.
    #
    isExternal = int(resourceDict['isExternal'])
    uriOnly = int(resourceDict['uriOnly'])
    del(resourceDict['uriOnly'])
    publishTime = None
    if resourceDict.has_key('isPublic'):
        if resourceDict['isPublic']:
            publishTime = resourceDict['creationTime']
        del resourceDict['isPublic']
    size = 0

    log.info('Original URI: [%s]' %(resourceDict.get('uri')))
    longUri = False
    if (isExternal or uriOnly) and resourceDict.get('uri'):
        uri = resourceDict['uri']
        relPath = uri
        log.info(len(uri))
        if len(uri) > 255:
            uri = hashlib.md5(uri).hexdigest()
            resourceDict['uri'] = uri
            longUri = True
    log.info('Hashed URI: [%s]' %(resourceDict.get('uri')))
    log.info('isExternal: [%s]' %(isExternal))

    saveToFC = False
    rev = '1'
    try:
        try:
            if isExternal or uriOnly:
                #
                #  Only need to save the URI for external resources.
                #  uriOnly is referring to existing resource; so no need
                #  to save contents either.
                #
                uri = resourceDict['uri']
                #relPath = uri
                if not isExternal:
                    #
                    #  Check the existence of the resource.
                    #
                    if resourceType.versionable:
                        if vcs is None:
                            vcs = v.vcs(ownerID, session=session)
                        size = vcs.getSize(relPath)
                    else:
                        if useImageSatellite:
                            #h.checkUrlExists(relPath)
                            pass
                        elif not fcclient.checkResource(relPath, resourceType.name):
                            raise IOError('%s does not exist' % relPath)
                else:
                    if not resourceType.versionable:
                        #
                        # External resource
                        #
                        saveToFC = False
                        if not relPath.startswith('http://') and not relPath.startswith('https://'):
                            if relPath.startswith('//'):
                                relPath = 'http:' + relPath
                            else:
                                relPath = 'http://' + relPath
                        #h.checkUrlExists(relPath)
                        contents = relPath
            else:
                if resourceDict.has_key('uri'):
                    uri = resourceDict['uri']
                    log.debug("_createResource: Type of uri: %s" % type(uri))
                    if not h.isUploadField(uri):
                        relPath = uri
                    else:
                        ## Get the name of the file
                        ## MUST check for filename first since upload field (FieldStorage) has both attributes
                        if hasattr(uri, 'filename'):
                            ## if uri is uploaded file (using a multipart form)
                            relPath = uri.filename
                        elif hasattr(uri, 'name'):
                            ## if uri is any other open file
                            relPath = uri.name
                        else:
                            raise Exception((_(u"Unknown type of object for uri: %(type(uri))s. Must be either a file object or uploaded file object")  % {"type(uri)":type(uri)}).encode("utf-8"))
                    relPath = os.path.basename(relPath)
                    log.debug("_createResource: uri relPath: %s" % relPath)
                elif artifactRevision:
                    relPath = str(artifactRevision.id)
                    log.debug("_createResource: relPath: %s" % relPath)
                else:
                    raise Exception((_(u'No URI specified for creating resource.')).encode("utf-8"))

                if resourceDict.has_key('contents'):
                    #
                    #  Embedded contents.
                    #
                    contents = resourceDict['contents']
                    del(resourceDict['contents'])
                    if resourceType.versionable:
                        if vcs is None:
                            vcs = v.vcs(ownerID, session=session)
                        xhtml = h.transform_to_xhtml(contents, validateRosetta=True, demoteH2=artifactTypeName=='concept', validateImages=True)
                        rev = vcs.add(relPath, xhtml) #.encode('utf-8')))
                        log.debug("_createResource: vcs add[%s]" % relPath)
                    else:
                        saveToFC = True
                else:
                    #
                    #  Uploaded.
                    #
                    if resourceType.versionable:
                        if vcs is None:
                            vcs = v.vcs(ownerID, session=session)
                        vcs.save(uri)
                        rev = vcs.add(relPath)
                        log.debug("_createResource: vcs save[%s] to[%s]" % (uri, relPath))
                    else:
                        saveToFC = True
                        if type(uri).__name__ == 'file':
                            ## If uri is an open file
                            contents = uri
                        else:
                            ## if uri is uploaded file object
                            contents = uri.file
        except Exception, e:
            log.error('_createResource Exception: %s' % str(e), exc_info=e)
            raise e
        if not longUri:
            resourceDict['uri'] = relPath
        if not resourceDict.get('handle'):
            resourceDict['handle'] = resourceDict['uri'].replace(' ', '-')

        eoDict = None
        if resourceDict.has_key('eoDict'):
            eoDict = resourceDict['eoDict']
            del resourceDict['eoDict']

        #
        #  See if the meatdata of this resource exsits already.
        #
        resource = None
        if not iamImageSatellite:
            query = session.query(model.Resource)
            query = query.filter_by(uri=resourceDict['uri'])
            query = query.filter_by(ownerID=ownerID)
            resource = _queryOne(query)
            if not resource:
                query = session.query(model.Resource)
                query = query.filter_by(handle=resourceDict['handle'])
                query = query.filter_by(resourceTypeID=resourceTypeID)
                query = query.filter_by(ownerID=ownerID)
                resource = _queryOne(query)

        if resource:
            resourceRevision = resource.revisions[0]
            log.info("_createResource: Resource found: %s, uri: %s" % (resource.id, resource.uri))
        else:
            #
            #  Create a new one.
            #
            ## Calculate ref hash
            if not resourceDict.get('refHash'):
                resourceDict['refHash'] = _computeReferenceHashForResource(session, resourceDict['handle'], resourceType.name, member)

            resource = model.Resource(**resourceDict)
            session.add(resource)
            log.info("Creating resource revision: %s" % publishTime)
            resourceRevision = model.ResourceRevision(
                                revision=rev,
                                creationTime=resourceDict['creationTime'],
                                publishTime=publishTime)
            resourceRevision.resource = resource
            session.add(resourceRevision)
            session.flush()
            log.debug("Resource added: %s" % resource)

        if eoDict:
            ## Create embedded object
            eoDict['resourceID'] = resource.id
            eo = _createEmbeddedObject(session, **eoDict)
            log.info("Created embedded object: %s, code: %s" % (eo.id, eo.code))

        #
        # Save to fcrepo - at this point relPath has the name of the resource - either file name or url
        # content has the actual content - xml, uploaded image file obj, or url
        #
        log.info('isExternal: [%s]' %(isExternal))
        if saveToFC:
            sum, size = h.computeChecksum(contents, isAttachment=resource.isAttachment)
            log.info("Resource size: %s Limit: %s" % (size, h.getConfigOptionValue('attachment_max_upload_size')))
            if resource.isAttachment and size > int(h.getConfigOptionValue('attachment_max_upload_size')) and ownerID != 1:
                raise ex.ResourceTooLargeException((_(u'Maximum allowable file size exceeded for attachment: %(size)d')  % {"size":size}).encode("utf-8"))
            if useImageSatellite or iamImageSatellite:
                resource.checksum = sum
                existingResource = _getResourceByChecksum(session, checksum=sum, ownerID=ownerID)
                if not existingResource:
                    if not iamImageSatellite:
                        log.info("Make remote call to save resource at satellite")
                        newR, ret = h.createRemoteResource(resourceType=resourceType, isExternal=isExternal, creator=ownerID, name=relPath, contents=contents, checksum=sum,
                                authors=resource.authors, licenseName=resource.license, isAttachment=resource.isAttachment)
                        resourceRevision.resource.satelliteUrl = ret['response']['uri']
                        resourceRevision.filesize = size
                    else:
                        ## I am the satellite server!
                        log.info("Satellite server. Create resource")
                        resource.refHash = sum
                        relPath = os.path.basename(relPath)
                        checksum = fcclient.saveResource(id=resource.refHash, resourceType=resourceType, isExternal=isExternal, creator=ownerID, name=relPath, content=contents, isAttachment=resource.isAttachment)
                        resource.revisions[0].filesize = size
                        resource.revisions[0].hash = checksum
                        resource.satelliteUrl = resource.getUri()
                else:
                    if isExternal:
                        log.info('External resource: Set the resource.satelliteUrl and resource.checksum to None')
                        resource.satelliteUrl = None
                        resource.checksum = None
                    else:
                        resource.satelliteUrl = existingResource.satelliteUrl
                    resourceRevision.filesize = existingResource.revisions[0].filesize
            else:
                log.info("Create resource in local fedora")
                if not isExternal and relPath.endswith("content"):
                    ## FC Repo resource - need to get the real name (so that mime-type guessing works)
                    oldId = fcclient.getResourceIdFromLink(relPath)
                    if oldId:
                        resObj = fcclient.getResourceObject(id=oldId)
                        relPath = resObj.label
                        log.info("Relpath now: %s" % relPath)
                checksum = fcclient.saveResource(id=resource.refHash, resourceType=resourceType, isExternal=isExternal, creator=ownerID, name=relPath, content=contents, isAttachment=resource.isAttachment)
                resource.revisions[0].hash = checksum
                resource.revisions[0].filesize = size

        if commit and vcs is not None:
            ## Commit the content in VCS and save the resource revision
            revision = vcs.commit("Added resource with id: %s and type: %s" % (str(resource.id), resourceType.name))
            _setResourceRevision(session, resourceRevision, revision)
            log.debug('_createResource: vcs commit revision[%s]' % revision)

        ## Add resource to library
        if not iamImageSatellite and resourceRevision.resource.isAttachment:
            _safeAddObjectToLibrary(session, objectID=resourceRevision.id, objectType='resourceRevision', memberID=member.id)

        return resourceRevision
    finally:
        if commit and vcs is not None:
            #
            #  If it has been committed, then there should be nothing to
            #  revert.
            #
            vcs.revert()

resPermaRegex = re.compile(r'"/flx/render/perma/resource/([^"]*)"')
resPermaShortRegex = re.compile(r'/flx/show/([^"]*)"')
def _updateResourceAssociations(session, artifactRevision, resourceRevisions, xhtml=None):
    log.debug('_updateResourceAssociates: artifactRevision id[%s]' % artifactRevision.id)
    resourceTypes = _getResourceTypesDict(session)
    ## Get resources from xhtml
    xhtmlResourceRevisions = {}
    if not xhtml:
        if artifactRevision.artifact.type.name == 'lesson':
            xhtml = artifactRevision.getXhtml(includeChildContent=True)
        else:
            xhtml = artifactRevision.getXhtml()
    log.debug("Xhtml : %s" % xhtml)
    if xhtml:
        matches = resPermaRegex.findall(xhtml)
        matches.extend(resPermaShortRegex.findall(xhtml))
        log.debug("Matches: %s" % matches)
        for m in matches:
            parts = m.split('/')
            rtype = handle = login = None
            for i in range(0, len(parts)):
                parts[i] = urllib.unquote(parts[i])
            for i in range(0, len(parts)):
                if not resourceTypes.has_key(parts[i]):
                    continue
                rtype = parts[i]
                i += 1
                login = 'ck12editor'
                if len(parts) > i:
                    if parts[i].startswith('user:'):
                        login = parts[i].split(':', 1)[1]
                        i += 1
                    if len(parts) > i:
                        handle = '/'.join(parts[i:])
                if rtype and login and handle:
                    log.debug("Getting resource by perma: %s, %s, %s" % (rtype, login, handle))
                    member = _getMemberByLogin(session, login=login)
                    if not member:
                        log.warn("Could not find user with login: [%s]. Possibly encrypted? Skipping association for this resource..." % login)
                    else:
                        ## Get resource
                        r = _getResourceByHandle(session, handle, resourceTypes[rtype]['id'], member.id)
                        if r:
                            id = r.revisions[0].id
                            xhtmlResourceRevisions[id] = id
                        else:
                            log.warn("Could not find resource! %s, %s, %s" % (rtype, login, handle))
                break

    log.info("xhtmlResourceRevisions: %s" % xhtmlResourceRevisions)
    ## Get existing resource
    for rr in resourceRevisions:
        if rr.resource.isAttachment or rr.resource.resourceTypeID in [1, 2, 3]:
            if xhtmlResourceRevisions.has_key(rr.id):
                del xhtmlResourceRevisions[rr.id]
            continue
        if not xhtmlResourceRevisions.has_key(rr.id):
            log.info("Deleting resource associations: %d" % rr.id)
            arrr = _getArtifactRevisionHasResource(session, artifactRevision.id, rr.id)
            if arrr:
                session.delete(arrr)
        else:
            del xhtmlResourceRevisions[rr.id]
    for rrid in xhtmlResourceRevisions:
        log.info("Adding resource associations: %s" % rrid)
        _createArtifactHasResource(session, artifactRevisionID=artifactRevision.id, resourceRevisionID=rrid)

def _getArtifactRevisionHasResource(session, artifactRevisionID, resourceRevisionID):
    query = session.query(model.ArtifactRevisionHasResources)
    query = query.filter(and_(
        model.ArtifactRevisionHasResources.artifactRevisionID == artifactRevisionID,
        model.ArtifactRevisionHasResources.resourceRevisionID == resourceRevisionID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getResourceByChecksum(session, checksum, ownerID=None):
    return _getResourceByChecksum(session, checksum, ownerID)

def _getResourceByChecksum(session, checksum, ownerID=None):
    query = session.query(model.Resource)
    query = query.filter(model.Resource.checksum == checksum)
    if ownerID:
        query = query.filter(model.Resource.ownerID == ownerID)
    return query.first()

def _setResourceRevision(session, resourceRevision, revision):
    resourceType = resourceRevision.resource.type
    if resourceType is None:
        resourceType = _getInstance(session,
                                     resourceRevision.resource.resourceTypeID,
                                     model.ResourceType)
    log.debug('_setResourceRevision: resourceRevision revision[%s, %s] type[%s, %s]' % (resourceRevision.revision, revision, resourceRevision.resource.type, resourceType))
    if resourceRevision.revision != revision and resourceRevision.resource.type != resourceType:
        resourceRevision.resource.type = resourceType
        if resourceType.versionable:
            resourceRevision.revision = revision

@_transactional()
def createMemberAuthApproval(session, memberID, domain, approve):
    """
        Create a MemberAuthApproval instance.
    """
    approval = model.MemberAuthApproval(memberID=memberID,
                                        domain=domain,
                                        approve=approve)
    session.add(approval)
    return approval


@_transactional()
def createGroupHasMember(session, **kwargs):
    return _createGroupHasMember(session, **kwargs)

def _createGroupHasMember(session, **kwargs):
    _checkAttributes([ 'memberID', 'groupID', 'roleID' ], **kwargs)
    log.debug('_createGroupHasMember: kwargs[%s]' % kwargs)
    ghm = model.GroupHasMembers(**kwargs)
    session.add(ghm)
    roleID = kwargs['roleID']
    if roleID == 14 or long(roleID) == 14:
        #
        #  Add assignments to group member that are not due yet.
        #
        memberID = kwargs['memberID']
        groupID = kwargs['groupID']
        query = session.query(model.Assignment)
        query = query.filter_by(groupID=groupID)
        #
        #  [Bug 31174]
        #
        #   Remove the due date filter in this query; so that
        #   all assignments, even past due ones, will be included.
        #   This will allow those assignments that have past due
        #   dates to be changed back to the future.
        #
        #query = query.filter(or_(model.Assignment.due == None, model.Assignment.due == 0, model.Assignment.due >= now.date()))
        assignments = query.all()
        log.debug('_createGroupHasMember: memberID[%s]' % memberID)
        log.debug('_createGroupHasMember: groupID[%s]' % groupID)
        log.debug('_createGroupHasMember: assignments%s' % assignments)
        for assignment in assignments:
            assignmentID = assignment.assignmentID
            query = session.query(model.MemberStudyTrackItemStatus)
            query = query.filter_by(memberID=memberID)
            query = query.filter_by(assignmentID=assignmentID)
            item = query.first()
            log.debug('_createGroupHasMember: item[%s]' % item)
            if not item:
                #
                #  Get all concept node ids
                #  (assignment -> study track -> concept nodes).
                #
                query = session.query(model.ArtifactAndChildren)
                query = query.filter_by(id=assignmentID)
                asgns = query.all()
                log.debug('_createGroupHasMember: asgns[%s]' % asgns)
                stItemIDs = []
                for asgn in asgns:
                    query = session.query(model.ArtifactAndChildren)
                    query = query.filter_by(id=asgn.childID)
                    studyTracks = query.all()
                    for studyTrack in studyTracks:
                        stItemIDs.append(studyTrack.childID)
                log.debug('_createGroupHasMember: stItemIDs[%s]' % stItemIDs)
                #
                #  Create status instances for the concept nodes
                #  in this assignment.
                #
                for stItemID in stItemIDs:
                    log.debug('_createGroupHasMember: stItemID[%s]' % stItemID)
                    data = {
                        'memberID': memberID,
                        'assignmentID': assignmentID,
                        'studyTrackItemID': stItemID,
                        'status': 'incomplete',
                    }
                    status = model.MemberStudyTrackItemStatus(**data)
                    session.add(status)
    return ghm

@_transactional()
def deleteGroupHasMember(session, memberID, roleID, groupID=1):
    _deleteGroupHasMember(session, memberID, roleID, groupID)

def _deleteGroupHasMember(session, memberID, roleID, groupID=1):
    query = session.query(model.GroupHasMembers)
    query = query.filter(model.GroupHasMembers.groupID == 1)
    query = query.filter(model.GroupHasMembers.memberID == memberID)
    query = query.filter(model.GroupHasMembers.roleID == roleID)
    item = _queryOne(query)
    if item:
        session.delete(item)


@_transactional()
def createMember(session, **kwargs):
    return _createMember(session, **kwargs)

def _createMember(session, **kwargs):
    """
        Create a Member instance.
    """
    _checkAttributes([ 'givenName', 'email', 'roleID', 'authID' ], **kwargs)
    kwargs['id'] = kwargs['authID']
    del kwargs['authID']
    email = kwargs['email']
    email = email.lower().strip()
    kwargs['email'] = email
    login = kwargs.get('login', None)
    if login:
        kwargs['login'] = login.lower().strip()
    roleID = kwargs['roleID']
    del kwargs['roleID']
    if not kwargs.get('stateID', None):
        kwargs['stateID'] = 2
    kwargs['updateTime'] = kwargs['creationTime'] = datetime.now()

    member = model.Member(**kwargs)
    session.add(member)

    ## Create GroupHasMembers
    groupID = kwargs.get('groupID')
    if not groupID:
        groupID = 1
    query = session.query(model.GroupHasMembers)
    query = query.filter_by(groupID=groupID)
    query = query.filter_by(memberID=member.id)
    query = query.filter_by(roleID=roleID)
    groupMember = _queryOne(query)
    if groupMember is None:
        session.flush()
        d = { 'memberID': member.id, 'groupID': groupID, 'roleID': roleID, 'statusID': 2, 'disableNotification': 0}
        _createGroupHasMember(session, **d)

    return member

@_transactional()
def createMemberViewedArtifact(session, memberID, artifactID):
    return _createMemberViewedArtifact(session, memberID, artifactID)

def _createMemberViewedArtifact(session, memberID, artifactID):
    """
        Create a MemberViewedArtifact instance.
    """
    memberViewedArtifact = model.MemberViewedArtifact(memberID=memberID,
                                                      artifactID=artifactID,
                                                      lastViewTime=datetime.now())
    session.add(memberViewedArtifact)
    return memberViewedArtifact

@_transactional()
def updateMemberViewedArtifact(session, memberID, artifactID):
    """
        Update the MemberViewedArtifact instance identified by
        memberID and artifactID. If it already exists, then just
        update the lastViewTime.
    """
    viewed = _getMemberViewedArtifact(session, memberID, artifactID)
    if viewed is None:
        viewed = _createMemberViewedArtifact(session, memberID, artifactID)
    else:
        viewed.lastViewTime = datetime.now()
        session.add(viewed)
    return viewed

@_transactional()
def deleteMemberViewedArtifacts(session, artifactID):
    _deleteMemberViewedArtifacts(session, artifactID)

def _deleteMemberViewedArtifacts(session, artifactID):
    query = session.query(model.MemberViewedArtifact)
    query = query.filter(model.MemberViewedArtifact.artifactID == artifactID)
    memberViewedArtifacts = query.all()
    log.info("MemberViewedArtifacts for %d: %d" % (artifactID, len(memberViewedArtifacts)))
    for mva in memberViewedArtifacts:
        session.delete(mva)

@_transactional()
def getMemberAccessTime(session, memberID, objectType, objectID):
    return _getMemberAccessTime(session, memberID, objectType, objectID)

def _getMemberAccessTime(session, memberID, objectType, objectID):
    query = session.query(model.MemberAccessTime)
    query = query.filter(
                and_(model.MemberAccessTime.memberID == memberID,
                     model.MemberAccessTime.objectType == objectType,
                     model.MemberAccessTime.objectID == objectID
                     ))
    return query.first()

@_transactional()
def updateMemberAccessTime(session, memberID, objectType, objectID, accessTime):
    """
        Update the MemberAccessTime instance identified by memberID,
        objectType and objectID to NOW.
    """
    accessTimeObj = _getMemberAccessTime(session, memberID, objectType, objectID)
    if not accessTimeObj:
        accessTimeObj = model.MemberAccessTime(memberID=memberID,
                                                      objectType=objectType,
                                                      objectID=objectID,
                                                      accessTime=accessTime)
        session.add(accessTimeObj)
    else:
        accessTimeObj.accessTime = accessTime
        session.add(accessTimeObj)

@_transactional()
def createFavorite(session, artifactRevision, member):
    """
        Mark the given ArtifactRevision instance as the favorite for the
        given member.
    """
    artifactRevision = _getInstance(session,
                                    artifactRevision,
                                    model.ArtifactRevision)
    favorite = model.ArtifactRevisionFavorite(
                                    artifactRevisionID=artifactRevision.id,
                                    memberID=member.id)
    artifactRevision.favorites += 1
    session.add(artifactRevision)
    session.add(favorite)
    return favorite

@_transactional()
def createFeedback(session, **kwargs):
    return _createFeedback(session, **kwargs)

def _createFeedback(session, **kwargs):
    """
        Creates a feedbacks for the given ArtifactRevision. The following
        arguments are expected:

        artifactID          The artifact ID to which the feedback applies.
                            It could either be an Artifact ID or Artifact Model object.
        member              The logged in member. It could either be a Member
                            instance or be the identifier of a Member instance.
        rating              The rating ranging from 1 to 5 where 1 is the worst
                            and 5 is the best.
        comments            The feedback comments. It could be up to 16K bytes.
    """
    _checkAttributes([ 'artifactID', 'memberID', 'type', 'score'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    feedbackType = kwargs['type']
    score = kwargs['score']
    if artifactID is None or memberID is None:
        return None
    comments = kwargs.get('comments', None)
    if comments and comments.strip():
        comments = comments.strip()
        kwargs['comments'] = comments
    else:
        kwargs['comments'] = None
    query = session.query(model.ArtifactFeedback).filter(and_(model.ArtifactFeedback.artifactID==artifactID, model.ArtifactFeedback.memberID==memberID, model.ArtifactFeedback.type==feedbackType))
    feedback = _queryOne(query)
    log.debug('_createFeedback: before feedback[%s]' % feedback)
    deleteFeedbackAbuseReports = False
    if feedback:
        if feedback.comments != comments:
            deleteFeedbackAbuseReports = True
        feedback.comments = comments
        feedback.score = score
        feedback.creationTime = datetime.now()
        feedback.notAbuse = False
        #raise Exception('Feedback already exists.')
    else:
        feedback = model.ArtifactFeedback(**kwargs)

    log.debug('_createFeedback: after  feedback[%s]' % feedback)
    if feedback:
        session.add(feedback)

        if deleteFeedbackAbuseReports:
            session.query(model.ArtifactFeedbackAbuseReport).filter(and_(
                                        model.ArtifactFeedbackAbuseReport.artifactID == artifactID,
                                        model.ArtifactFeedbackAbuseReport.memberID == memberID)).delete()
            session.flush()

    if kwargs.has_key('cache') and kwargs['cache']:
        cache = kwargs['cache']
        artifact = _getArtifactByID(session, id=artifactID)
        if not artifact:
            raise Exception('No artifact with ID: [%d] exists. Exiting.' %(artifactID))
        invalidateArtifact(cache, artifact, memberID=memberID)
        cache.personalCache.invalidate(memberID=kwargs['memberID'], id=kwargs['artifactID'])
    return feedback

@_transactional()
def updateFeedback(session, **kwargs):
    return _updateFeedback(session, **kwargs)

def _updateFeedback(session, **kwargs):
    """
        Updates a feedbacks for the given Artifact. The following
        arguments are expected:

        artifactID          The artifact ID to which the feedback applies.
                            It could either be an Artifact ID or Artifact Model object.
        member              The logged in member. It could either be a Member
                            instance or be the identifier of a Member instance.
        rating              The rating ranging from 1 to 5 where 1 is the worst
                            and 5 is the best.
        comments            The feedback comments. It could be up to 16K bytes.
    """
    _checkAttributes([ 'artifactID', 'memberID', 'type', 'score'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    feedbackType = kwargs['type']
    if artifactID is None or memberID is None:
        return None
    comments = kwargs.get('comments', None)
    if comments and comments.strip():
        kwargs['comments'] = comments.strip()
    else:
        kwargs['comments'] = None
    query = session.query(model.ArtifactFeedback).filter(and_(model.ArtifactFeedback.artifactID==artifactID, model.ArtifactFeedback.memberID==memberID, model.ArtifactFeedback.type==feedbackType))
    is_exist = False
    try:
        feedback = _queryOne(query)
        if feedback:
            is_exist = True
    except Exception:
        is_exist = False
    if not is_exist:
        raise Exception('Feedback does not exist.')
    deleteFeedbackAbuseReports = False
    if kwargs['updateComments']:
        if feedback.comments != comments:
            deleteFeedbackAbuseReports = True
        feedback.comments = comments

    feedback.isApproved = kwargs['isApproved']
    feedback.notAbuse = kwargs['notAbuse']
    session.add(feedback)

    if deleteFeedbackAbuseReports:
        session.query(model.ArtifactFeedbackAbuseReport).filter(and_(
                                    model.ArtifactFeedbackAbuseReport.artifactID == artifactID,
                                    model.ArtifactFeedbackAbuseReport.memberID == memberID)).delete()
        session.flush()
    if kwargs.has_key('cache') and kwargs['cache']:
        cache = kwargs['cache']
        artifact = _getArtifactByID(session, id=artifactID)
        invalidateArtifact(cache, artifact, memberID=memberID)
        cache.personalCache.invalidate(memberID=kwargs['memberID'], id=kwargs['artifactID'])
    return feedback

@_transactional()
def createFeedbackReview(session, **kwargs):
    return _createFeedbackReview(session, **kwargs)

def _createFeedbackReview(session, **kwargs):
    """
        Creates a feedback review to a feedback for the given ArtifactRevision. The following
        arguments are expected:

        artifactID          The artifact ID to which the feedback applies.
                            It could either be an Artifact ID or Artifact Model object.
        memberID            The ID of the member who posted the feedback to the artifact.
        reviewersMemberID      The ID of the logged in member.
        reviewComment       The feedback review comments. It could be up to 16K bytes.
    """
    _checkAttributes([ 'artifactID', 'memberID', 'type', 'reviewersMemberID'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    reviewersMemberID = kwargs['reviewersMemberID']
    #feedbackType = kwargs['type']
    if artifactID is None or memberID is None or reviewersMemberID is None:
        return None
    reviewComment = kwargs.get('reviewComment', None)
    if reviewComment and reviewComment.strip():
        kwargs['reviewComment'] = reviewComment.strip()
    else:
        kwargs['reviewComment'] = None
    #query = session.query(model.ArtifactFeedbackReview).filter(and_(model.ArtifactFeedbackReview.artifactID==artifactID, model.ArtifactFeedbackReview.memberID==memberID, model.ArtifactFeedbackReview.type==feedbackType, model.ArtifactFeedbackReview.reviewersMemberID==reviewersMemberID))
    #feedbackReview = _queryOne(query)
    #if feedbackReview:
    #    kwargs['creationTime'] = feedbackReview.creationTime
    #    session.delete(feedbackReview)
    #    session.flush()
    feedbackReview = model.ArtifactFeedbackReview(**kwargs)
    session.add(feedbackReview)

    if kwargs.has_key('cache') and kwargs['cache']:
        cache = kwargs['cache']
        artifact = _getArtifactByID(session, id=artifactID)
        invalidateArtifact(cache, artifact, memberID=memberID)
        cache.personalCache.invalidate(memberID=int(kwargs['memberID']), id=kwargs['artifactID'])
    return feedbackReview

@_transactional()
def createFeedbackAbuse(session, **kwargs):
    return _createFeedbackAbuse(session, **kwargs)

def _createFeedbackAbuse(session, **kwargs):

    _checkAttributes([ 'artifactID', 'memberID', 'reporterMemberID'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    reporterMemberID = kwargs['reporterMemberID']
    comments = kwargs.get('comments', None)
    if comments:
        kwargs['comments'] = comments.strip()
    query = session.query(model.ArtifactFeedback).filter(and_(
                                model.ArtifactFeedback.artifactID == artifactID,
                                model.ArtifactFeedback.memberID == memberID))

    feedback = _queryOne(query)

    if not feedback:
        raise Exception('Feedback does not exist')

    query = session.query(model.ArtifactFeedbackAbuseReport).filter(and_(
                                model.ArtifactFeedbackAbuseReport.artifactID == artifactID,
                                model.ArtifactFeedbackAbuseReport.memberID == memberID,
                                model.ArtifactFeedbackAbuseReport.reporterMemberID == reporterMemberID))

    feedbackAbuse = _queryOne(query)

    if feedbackAbuse:
        raise Exception('Abuse already reported by the user.')

    kwargs['creationTime'] = datetime.now()
    feedbackAbuse = model.ArtifactFeedbackAbuseReport(**kwargs)
    session.add(feedbackAbuse)
    return feedbackAbuse

@_transactional()
def createFeedbackReviewAbuse(session, **kwargs):
    return _createFeedbackReviewAbuse(session, **kwargs)

def _createFeedbackReviewAbuse(session, **kwargs):

    _checkAttributes([ 'artifactFeedbackReviewID', 'reporterMemberID'], **kwargs)
    reviewID = kwargs['artifactFeedbackReviewID']
    reporterMemberID = kwargs['reporterMemberID']
    comments = kwargs.get('comments', None)
    if comments:
        kwargs['comments'] = comments.strip()
    query = session.query(model.ArtifactFeedbackReview).filter_by(id=reviewID)
    feedbackReview = _queryOne(query)

    if not feedbackReview:
        raise Exception('FeedbackReview does not exist')

    query = session.query(model.ArtifactFeedbackReviewAbuseReport).filter(and_(
                                model.ArtifactFeedbackReviewAbuseReport.artifactFeedbackReviewID == reviewID,
                                model.ArtifactFeedbackReviewAbuseReport.reporterMemberID == reporterMemberID))

    feedbackReviewAbuse = _queryOne(query)

    if feedbackReviewAbuse:
        raise Exception('FeedbackReview Abuse already reported by the user.')

    kwargs['creationTime'] = datetime.now()
    feedbackReviewAbuse = model.ArtifactFeedbackReviewAbuseReport(**kwargs)
    session.add(feedbackReviewAbuse)
    return feedbackReviewAbuse

@_transactional()
def updateFeedbackReview(session, **kwargs):
    return _updateFeedbackReview(session, **kwargs)

def _updateFeedbackReview(session, **kwargs):
    """
        Updates a feedback review to a feedback for the given ArtifactRevision. The following
        arguments are expected:

        reviewID      The ID of the feedback review.
        reviewersMemberID      The ID of the logged in member.
        reviewComment       The feedback review comments. It could be up to 16K bytes.
    """
    _checkAttributes([ 'reviewID', 'reviewersMemberID'], **kwargs)
    reviewersMemberID = kwargs['reviewersMemberID']
    reviewID = kwargs['reviewID']
    if reviewID is None or reviewersMemberID is None:
        return None
    reviewComment = kwargs.get('reviewComment', None)
    if reviewComment and reviewComment.strip():
        kwargs['reviewComment'] = reviewComment.strip()
    else:
        kwargs['reviewComment'] = None
    query = session.query(model.ArtifactFeedbackReview).filter(and_(model.ArtifactFeedbackReview.id==reviewID, model.ArtifactFeedbackReview.reviewersMemberID==reviewersMemberID))
    feedbackReview = _queryOne(query)
    if feedbackReview:
        #don't delete abuse reports, when update reviews from admin role
        deleteFeedbackReviewAbuseReports = False
        if kwargs['updateComments']:
            if feedbackReview.reviewComment != reviewComment:
                deleteFeedbackReviewAbuseReports = True
            feedbackReview.reviewComment = reviewComment
        else:
            feedbackReview.notAbuse = kwargs['notAbuse']
        feedbackReview.updationTime = datetime.now()
        reviewersMemberID = feedbackReview.reviewersMemberID
        memberID = feedbackReview.memberID
        artifactID = feedbackReview.artifactID
        session.add(feedbackReview)
        if deleteFeedbackReviewAbuseReports:
            session.query(model.ArtifactFeedbackReviewAbuseReport).filter(
                                            model.ArtifactFeedbackReviewAbuseReport.artifactFeedbackReviewID == feedbackReview.id).delete()
            session.flush()
        if kwargs.has_key('cache') and kwargs['cache']:
            cache = kwargs['cache']
            artifact = _getArtifactByID(session, id=artifactID)
            invalidateArtifact(cache, artifact, memberID=memberID)
            cache.personalCache.invalidate(memberID=memberID, id=artifactID)
            cache.personalCache.invalidate(memberID=reviewersMemberID, id=artifactID)
    return feedbackReview

@_transactional()
def createFeedbackHelpful(session, **kwargs):
    return _createFeedbackHelpful(session, **kwargs)

def _createFeedbackHelpful(session, **kwargs):
    """
        Add a feedback helpful entry. The following
        arguments are expected:

        artifactID          The artifact ID to which the feedback applies.
                            It could either be an Artifact ID or Artifact Model object.
        memberID            The ID of the member who posted the feedback to the artifact.
        reviewersMemberID      The ID of the logged in member.
        isHelpful       The feedback review isHelpful?.
    """
    _checkAttributes([ 'artifactID', 'memberID', 'type', 'reviewersMemberID', 'isHelpful'], **kwargs)
    artifactID = kwargs['artifactID']
    memberID = kwargs['memberID']
    reviewersMemberID = kwargs['reviewersMemberID']
    feedbackType = kwargs['type']
    if artifactID is None or memberID is None or reviewersMemberID is None:
        return None
    isHelpful = kwargs.get('isHelpful', False)
    query = session.query(model.ArtifactFeedbackHelpful).filter(and_(model.ArtifactFeedbackHelpful.artifactID==artifactID, model.ArtifactFeedbackHelpful.memberID==memberID, model.ArtifactFeedbackHelpful.type==feedbackType, model.ArtifactFeedbackHelpful.reviewersMemberID==reviewersMemberID))
    is_updated = False
    is_value_changed = False
    feedbackHelpful = query.all()
    if feedbackHelpful and len(feedbackHelpful) > 0:
        if isHelpful != feedbackHelpful[0].isHelpful:
            is_value_changed = True
        query.delete()
        is_updated = True

    feedbackHelpful = model.ArtifactFeedbackHelpful(**kwargs)
    session.add(feedbackHelpful)

    if kwargs.has_key('cache') and kwargs['cache']:
        cache = kwargs['cache']
        artifact = _getArtifactByID(session, id=artifactID)
        invalidateArtifact(cache, artifact, memberID=memberID)
        cache.personalCache.invalidate(memberID=int(kwargs['memberID']), id=kwargs['artifactID'])
        cache.personalCache.invalidate(memberID=int(kwargs['reviewersMemberID']), id=kwargs['artifactID'])
    result = {}
    if feedbackHelpful:
        result = feedbackHelpful.asDict()
    result['is_updated'] = is_updated
    result['is_value_changed'] = is_value_changed
    return result

@_transactional()
def create(session, what, **kwargs):
    instance = what(**kwargs)
    session.add(instance)
    return instance

"""
    Cache related.
"""

@_transactional()
def merge(session, instance):
    return session.merge(instance)

def invalidateBrowseTerm(cache, browseTermID, memberID=None, session=None):
    cache.invalidate(browseTermID, memberID=memberID)
    if session:
        associatedConceptCollectionHandles = _getConceptCollectionHandlesForDomain(session, domainID=browseTermID)
    else:
        associatedConceptCollectionHandles = getConceptCollectionHandlesForDomain(domainID=browseTermID)

    for conceptCollectionHandle, collectionCreatorID in associatedConceptCollectionHandles:
        cache.invalidate(termID=browseTermID, memberID=memberID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

def invalidateRelatedArtifacts(cache, domainID, memberID=None):
    cache.invalidate(domainID, memberID)

def invalidatePerma(cache, artifact):
    typeID = artifact.artifactTypeID
    creatorID = artifact.creatorID
    handle = artifact.handle
    for version in range(0, len(artifact.revisions) + 1):
        cache.permaCache.invalidate(handle, typeID, creatorID, version=version)
    cache.permaCache.invalidate(handle, typeID, creatorID)

def invalidateArtifact(cache, artifact, revision=None, memberID=None, recursive=False, clearRelatedArtifacts=True, isDelete=False, clearPrePost=False):
    creatorID = artifact.creatorID

    #if revision is passed (currently happening while publishing & unpublishing a revision) revision information becomes dirty, so invalidate it. And also the artifact info is still upto date, so no need to invalidate it.
    #Else if revision is not passed, the invalidate the Artifact & it's other necessary info
    if revision :
        cache.artifactRevisionCache.invalidate(revision.id)
        revisions = [revision]
    else :
        #when an artifact get's updated all it's revisions parent-revisions which might be having this artifact in it's revisionDict['children'] becomes dirty. So need to be invalidated
        #Each of these revisions can be recached here using an asynchronous call
        #As of the actual revisions, if this call is for deleting the artifact, all the revisions needs to be invalidated as well
        revisions = artifact.revisions
        for revision in revisions :
            if isDelete :
                cache.artifactRevisionCache.invalidate(revision.id)
            if revision.parents and len(revision.parents)>0:
                for parent in revision.parents:
                    if parent and parent.artifactRevisionID:
                        cache.artifactRevisionCache.invalidate(parent.artifactRevisionID)
                        #cache.recache(revisionID=parentRevision.id)

    #invalidate any cache having artifact's id as key
    cache.invalidate(artifact.id)

    #Also invalidate any caches having artifact's title or encodedID as key
    nameKey = None
    if artifact.name :
        nameKey = artifact.name.encode('ascii', 'xmlcharrefreplace')
        nameKey = standard_b64encode(nameKey)
        cache.invalidate(nameKey)

    encodedIDKey = None
    if artifact.encodedID:
        encodedIDKey = artifact.encodedID.encode('ascii', 'xmlcharrefreplace')
        encodedIDKey = standard_b64encode(encodedIDKey)
        cache.invalidate(encodedIDKey)

    #do a complete removal of the artifact on the old cache - complete removal of the caches with id as key prefix
    cacheCls = type(cache)
    if cacheCls.isMongoArtifactCacheConfigured and cacheCls.mongoArtifactCache:
        cacheCls.mongoArtifactCache.removeCompleteArtifactCache(artifact.id)
        if nameKey:
            cacheCls.mongoArtifactCache.removeCompleteArtifactCache(nameKey)
        if encodedIDKey:
            cacheCls.mongoArtifactCache.removeCompleteArtifactCache(encodedIDKey)

    #Other caches
    invalidatePerma(cache, artifact)

    for revision in revisions:
        if recursive:
            for child in revision.children:
                if isinstance(child, model.Artifact):
                    if not memberID or child.creatorID == memberID:
                        invalidateArtifact(cache, child, memberID=memberID, recursive=recursive, clearPrePost=clearPrePost)
                else:
                    ar = child.child
                    a = ar.artifact
                    if not memberID or a.creatorID == memberID:
                        invalidateArtifact(cache, a, revision=ar, memberID=memberID, recursive=recursive, clearPrePost=clearPrePost)

        #invalidate prePost caches.
        if clearPrePost:
            cache.prePostCache.invalidate(revision, [])
            for i in range(1, len(revision.children)+1):
                for j in range(0, len(revision.children[i-1].child.children)+1):
                    cache.prePostCache.invalidate(revision, [i, j])

        if memberID:
            cache.personalCache.invalidate(memberID, artifact.id, revision.id)
        cache.personalCache.invalidate(creatorID, artifact.id, revision.id)
        cache.personalCache.invalidate(2, artifact.id, revision.id)

    if memberID:
        cache.personalCache.invalidate(memberID, artifact.id)
    cache.personalCache.invalidate(creatorID, artifact.id)
    cache.personalCache.invalidate(2, artifact.id)

    if clearRelatedArtifacts:
        domains = artifact.getDomains()
        for domain in domains:
            if domain and domain.id:
                cache.relatedArtifactCache.invalidate(domain.id, creatorID)
                cache.relatedArtifactCache.invalidate(domain.id, 2)
                if memberID:
                    cache.relatedArtifactCache.invalidate(domain.id, memberID)

    log.debug('invalidateArtifact: artifact.id[%s]' % artifact.id)



"""
    Update related APIs.
"""

@_transactional()
def update(session, instance):
   return _update(session, instance)

def _update(session, instance):
    if hasattr(instance.__class__, 'cache'):
        instance = instance.cache(action=model.INVALIDATE, instance=instance)
        instance = session.merge(instance)
    session.add(instance)
    log.debug('Updated [%s]' % instance)


@_transactional()
def updateMember(session,
                 member,
                 roleID=None):
    return _updateMember(session,
                         member,
                         roleID=roleID)

def _updateMember(session,
                  member,
                  roleID=None):
    """
        Update a Member instance.
    """
    member.updateTime = datetime.now()
    session.add(member)
    log.debug('Updated [%s]' % member)
    if roleID is not None:
        roleID = long(roleID)
        query = session.query(model.GroupHasMembers)
        query = query.filter_by(memberID=member.id)
        query = query.filter_by(groupID=1)
        roles = query.all()
        roleDict = {}
        if roles:
            for role in roles:
                roleDict[role.roleID] = role
        if not roleDict.has_key(roleID):
            d = { 'memberID': member.id, 'groupID': 1, 'roleID': roleID }
            _createGroupHasMember(session, **d)
        if roleID == 5:
            teacher = roleDict.get(7)
            if teacher:
                session.delete(teacher)
        elif roleID == 7:
            student = roleDict.get(5)
            if student:
                session.delete(student)
        if roleID == 5 or roleID == 7:
            member_role = roleDict.get(13)
            if member_role:
                session.delete(member_role)
    return member

@_transactional()
def activateMember(session, id):
    """
        Activate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None, False

    alreadyActivated = (member.stateID == 2)
    if not alreadyActivated:
        #log.info('Activating member[%s]' % member)
        member.stateID = 2
        session.add(member)
    return member, alreadyActivated

@_transactional()
def deactivateMember(session, id):
    """
        Deactivate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None

    alreadyDeactivated = (member.stateID == 3)
    if not alreadyDeactivated:
        #log.info('Deactivating member[%s]' % member)
        member.stateID = 3
        session.add(member)
    return member

@_transactional()
def disableMember(session, id):
    """
        Deactivate the member identified by id.
    """
    member = _getMember(session, id=id)
    if member is None:
        return None

    alreadyDeactivated = (member.stateID == 4)
    if not alreadyDeactivated:
        #log.info('Disabling member[%s]' % member)
        member.stateID = 4
        session.add(member)
    return member

def _hasCycle(session, artifactID, childID):
    """
        See if child is already in artifact's parent path.
    """
    log.info("Check cycle for %d, %d" % (artifactID, childID))
    if artifactID == childID:
        return True

    parents = _getArtifactParents(session, artifactID, toFilterTypes=True)
    while parents is not None and len(parents) > 0:
        for parent in parents:
            artifactID = parent['parentID']
            if artifactID == childID:
                return True
            return _hasCycle(session, artifactID, childID)

    return False

@_transactional()
def assignNextEncode(session, artifactID, encodedID):
    """
        Find the next available encode for this artifact for the given encodedID and
        assign it. If the artifact already has an encode, do nothing.

        NOTE: Artifacts encodes should be assigned by user and this method
        should only be used during 1.x data wiki import - where the wiki does
        not hold the encodings for any artifacts.
    """
    artifact = _getUnique(session, model.Artifact, 'id', artifactID)
    if not artifact:
        raise Exception((_(u"No such artifact by id: %(artifactID)s")  % {"artifactID":artifactID}).encode("utf-8"))

    if artifact.encodedID:
        log.info("Artifact already has an encodedID: %s" % artifact.encodedID)
        return artifact

    typeName = artifact.type.name
    qualifiers = { 'concept': 'C', 'lesson': 'L', 'chapter': 'CH', 'book': 'FB' }
    qualifier = qualifiers[typeName.lower()]
    encodedID = '%s.%s' % (encodedID, qualifier)
    encodedID = encodedID.upper()

    existingArtifact = session.query(model.Artifact).from_statement("select * from Artifacts WHERE encodedID like :eid and artifactTypeID = :typeid order by CAST(SUBSTRING_INDEX(Artifacts.encodedID, '.', -1) AS UNSIGNED) DESC").\
            params(eid='%s.%%' % encodedID, typeid=artifact.type.id).first()

    log.debug("Existing artifact: %s" % existingArtifact)
    if existingArtifact:
        maxEncode = int(existingArtifact.encodedID.split('.')[-1])
    else:
        maxEncode = 0
    maxEncode += 1

    artifact.encodedID = '%s.%d' % (encodedID, maxEncode)
    session.add(artifact)
    return artifact

@_transactional()
def updateLesson(session, **kwargs):
    return _updateLesson(session, **kwargs)

def _updateLesson(session, **kwargs):
    """
        Create a new lesson and associated concept
    """
    log.debug("kwargs: %s" % kwargs)
    _checkAttributes([ 'artifactID', 'memberID', ], **kwargs)
    ## Remove all the existing SQLAlchemy "objects" they cause problem when copied
    if kwargs.has_key('artifact'):
        del kwargs['artifact']
    if kwargs.has_key('member'):
        del kwargs['member']
    resources  = kwargs.get('resources')
    if resources:
        del kwargs['resources']
    artifact = _getArtifactByID(session, id=int(kwargs['artifactID']))
    if artifact.type.name == 'section' and kwargs.get('forceType') == 'lesson':
        log.info("Type is: %s forceType: %s, creating lesson" % (artifact.type.name, kwargs.get('forceType')))
        kwargs['name'] = kwargs.get('name', artifact.getTitle())
        kwargs['handle'] = kwargs.get('handle', artifact.handle)
        kwargs['description'] = kwargs.get('description', artifact.description)
        kwargs['encodedID'] = kwargs.get('encodedID')
        kwargs['typeName'] = 'lesson'
        kwargs['licenseName'] = kwargs.get('licenseName')
        kwargs['creator'] = kwargs['memberID']
        if resources:
            for rd in resources:
                rd['isExternal'] = False
                rd['uriOnly'] = False
                if rd.has_key('id'):
                    del rd['id']
        ret = _createLesson(session, **kwargs)
        domainType = _getBrowseTermTypeByName(session, 'domain')
        pseudoDomainType = _getBrowseTermTypeByName(session, 'pseudodomain')
        if type(ret).__name__ == 'tuple':
            artifacts = [ret_artifact for ret_artifact in ret if ret_artifact]
            for a in artifacts:
                ## Copy all browseTerms except domain terms
                if a.browseTerms:
                    browseTerms = a.browseTerms
                else:
                    browseTerms = _getBrowseTermsByArtifactID(session, a.id)
                for bt in browseTerms:
                    if bt.termTypeID == domainType.id or bt.termTypeID == pseudoDomainType.id:
                        domainTerm = bt
                a.browseTerms = [domainTerm]
                for bt in artifact.browseTerms:
                    log.debug(bt)
                    if bt.termTypeID != domainType.id:
                        a.browseTerms.append(bt)

                a.tagTerms = []
                for tt in artifact.tagTerms:
                    log.debug('tagTerm: %s' % str(tt))
                    a.tagTerms.append(tt)

                a.searchTerms = []
                for tt in artifact.searchTerms:
                    log.debug('searchTerm: %s' % str(tt))
                    a.searchTerms.append(tt)

        return ret

    kwdict = copy.deepcopy(kwargs)
    if resources:
        kwdict['resources'] = resources
    if artifact.type.name == 'lesson':
        isLessonConceptSplitEligible = True
        if not artifact.revisions or not artifact.revisions[0].children:
            isLessonConceptSplitEligible = False

        lesson_xhtml = concept_xhtml = None
        if kwdict.has_key('resources'):
            resourceList = kwdict['resources']
            for resourceDict in resourceList:
                if resourceDict.get('resourceTypeName') == 'contents':
                    xhtml = resourceDict.get('contents')
                    if not xhtml:
                        xhtml = '<p>&#160;</p>'
                    if isLessonConceptSplitEligible and isLessonConceptSplitEnabled:
                        try:
                            if not kwdict.get('autoSplitLesson'):
                                raise Exception('autoSplitLesson: %s' % str(kwdict.get('autoSplitLesson')))
                            lesson_xhtml, concept_xhtml = h.splitLessonXhtml(xhtml)
                        except Exception, e:
                            log.error("Error splitting concept: %s" % str(e), exc_info=e)
                            concept_xhtml = xhtml
                            lesson_xhtml = h.getLessonSkeleton()
                        break
                    else:
                        conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
                        conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
                        conceptStartXHTML = re.search(conceptStartXHTML, xhtml)
                        conceptEndXHTML = re.search(conceptEndXHTML, xhtml)
                        if conceptStartXHTML and conceptEndXHTML:
                            xhtml = xhtml[:conceptStartXHTML.start()]+xhtml[conceptStartXHTML.end():conceptEndXHTML.start()]+xhtml[conceptEndXHTML.end():]

                        lesson_xhtml = xhtml
                        concept_xhtml = None

        concept = lesson = None
        conceptRevision = None

        if kwdict.has_key('children'):
            del kwdict['children']

        if concept_xhtml:
            concept = artifact.revisions[0].children[0].child.artifact
            concept = _getArtifactByID(session, id=concept.id)
            kwdict['artifact'] = concept

            xhtmlID, uri = concept.getContentInfo()
            resourceDict['contents'] = concept_xhtml
            resourceDict['id'] = xhtmlID

            kwdict['type'] = _getArtifactTypeByName(session, typeName='concept')
            kwdict['member'] = _getMemberByID(session, id=int(kwargs['memberID']))
            if kwdict.get('encodedID'):
                kwdict['encodedID'] = kwdict['encodedID'].replace('.L.', '.C.')

            log.debug("kwdict: %s" % str(kwdict))
            concept = _updateArtifact(session, **kwdict)
            session.flush()
            conceptRevision = concept.revisions[0]
            log.info("Got new concept revision: %s" % conceptRevision.id)
            log.info("!!!!!! Finished updating concept !!!!!!")
            if not conceptRevision:
                raise Exception((_(u"Failed to update child concept. id: %(concept.id)d")  % {"concept.id":concept.id}).encode("utf-8"))

        kwdict = copy.deepcopy(kwargs)
        kwdict['artifact'] = _getArtifactByID(session, id=artifact.id)
        kwdict['member'] = _getMemberByID(session, id=int(kwargs['memberID']))
        if resources:
            kwdict['resources'] = resources
        if lesson_xhtml:
            resourceList = kwdict.get('resources', [])
            for resourceDict in resourceList:
                if resourceDict.get('resourceTypeName') == 'contents':
                    resourceDict['contents'] = lesson_xhtml
                    resourceDict['resourceType'] = _getResourceTypeByName(session, name='contents')
                    break
        if isLessonConceptSplitEligible and isLessonConceptSplitEnabled:
            kwdict['children'] = [conceptRevision.id]
        else:
            kwdict['children'] = []
        log.debug("kwdict: %s" % str(kwdict))
        lesson = _updateArtifact(session, **kwdict)
        log.info("!!!!!! Finished updating lesson !!!!!!")
        return lesson, concept
    else:
        return _updateArtifact(session, **kwargs)

@_transactional()
def updateArtifactOwner(session, ** kwargs):
    return _updateArtifactOwner(session, **kwargs)

def _updateArtifactOwner(session, **kwargs):
    artifact = _getUnique(session, model.Artifact, 'id', kwargs['id'])
    if artifact:
        if kwargs.has_key('creatorID'):
            artifact.creatorID = kwargs['creatorID']
        session.add(artifact)
    return artifact

@_transactional()
def updateResourceOwner(session, ** kwargs):
    return _updateResourceOwner(session, **kwargs)

def _updateResourceOwner(session, **kwargs):
    resource = _getUnique(session, model.Resource, 'id', kwargs['id'])
    if resource:
        if kwargs.has_key('ownerID'):
            resource.ownerID = kwargs['ownerID']
        session.add(resource)
    return resource


@_transactional()
def updateArtifact(session, **kwargs):
    return _updateArtifact(session, **kwargs)

def _updateArtifact(session, **kwargs):
    """
        Update an artifact.
    """

    dirtyPrintResources = False
    vcs = None
    revisionComment = kwargs.get('comment',None)
    try:
        log.debug('Updating artifact[%s]' % kwargs)
        _checkAttributes([ 'artifact', 'member', ], **kwargs)
        if kwargs.has_key('resources'):
            resourceList = kwargs['resources']
            for resourceDict in resourceList:
                _checkAttributes([ 'resourceType', 'id', 'name', ], **resourceDict)
        else:
            resourceList = []

        cache = kwargs.get('cache')
        artifact = kwargs.get('artifact', None)
        if not artifact:
            raise ex.MissingArgumentException('Required parameter, artifact, is missing.')
        _checkForMultipleCoverPages(session, artifact.type.name, resourceList, addDefaultCoverIfNone=False)
        if artifact.type.name == 'chapter':
            bookName = kwargs['bookTitle']
        else:
            bookName = ''

        member = kwargs.get('member', None)
        if not member:
            raise ex.MissingArgumentException('Required parameter, member, is missing.')
        vcs = v.vcs(member.id, session=session)
        origArtifact = artifact
        origArtifactRevision = artifact.revisions[0]
        newCopy = False

        handle = None
        name = kwargs.get('name', '')
        newHandle = kwargs.get('handle')
        originalHandle = kwargs.get('originalHandle')
        if newHandle:
            if artifact.type.name == 'chapter':
                newHandle = _appendBookName(newHandle, bookName)
                newHandle = model.title2Handle(newHandle)
            #
            #  Comment out the following line.
            #  We should not change what the user provided.
            #
            #newHandle = model.title2Handle(newHandle)

        if name:
            if artifact.type.name != 'chapter':
                if model.title2Handle(artifact.name) == artifact.handle:
                    handle = model.title2Handle(name)
            else:
                if model.title2Handle(artifact.name) == artifact.handle:
                    handle = model.title2Handle(_appendBookName(name, bookName))
                name = _appendBookName(name, bookName)
            if originalHandle == artifact.handle:
                handle = originalHandle
            elif not newHandle and handle and handle != artifact.handle:
                newHandle = handle
        else:
            name = artifact.name
            handle = artifact.handle
        if newHandle:
            if newHandle.lower() != artifact.handle.lower():
                a = _getArtifactByHandle(session, newHandle, artifact.type.id, member.id)
                if a is not None:
                    raise ex.AlreadyExistsException((_(u'%(artifactType.name)s[%(handle)s] from[%(member.email)s] exists already')  % {"artifactType.name":artifact.type.name,"handle": newHandle,"member.email": member.email}).encode("utf-8"))

            handle = newHandle
        if not handle:
            handle = model.title2Handle(name)
            group_handle = kwargs.get('group_handle')
            if group_handle:
                handle = '%s-%s' % (handle, group_handle)

        log.debug('_updateArtifact: name[%s] handle[%s]' % (name, handle))

        deepCopy = kwargs.get('deepCopy')
        if deepCopy:
            forceCopy = False
        else:
            forceCopy = kwargs.get('forceCopy', False)

        revision = artifact.revisions[0]
        resourceRevisionIDs = kwargs.get('resourceRevisionIDs', None)
        toAppend = False
        if resourceRevisionIDs is None:
            resourceRevisions = None
            log.info('_updateArtifact: keep resource in artifact revision[%s]' % revision.id)
        elif not resourceRevisionIDs:
            resourceRevisions = []
            log.info('_updateArtifact: clear resource for artifact revision[%s]' % revision.id)
        else:
            if type(resourceRevisionIDs) != list:
                resourceRevisionIDs = resourceRevisionIDs.split(',')
            resourceRevisions = _getResourceRevisionsByIDs(session, resourceRevisionIDs)
            if len(resourceRevisions) != len(resourceRevisionIDs):
                raise Exception('Invalid resourceRevisionIDs%s' % resourceRevisionIDs)
            toAppend = True
            log.info('_updateArtifact: update resource for artifact revision[%s] resourceIDs%s' % (revision.id, resourceRevisionIDs))
        if artifact.creatorID == member.id:
            _associateResources(session, revision, resourceRevisions, member, vcs, toAppend=toAppend)
        else:
            #
            #  Not the original owner, need to make a copy of this artifact.
            #
            artifact, newCopy = _copyArtifact(session, artifact, member, vcs, recursive=deepCopy, parentName=bookName, name=name, handle=handle, resourceRevisions=resourceRevisions, forceCopy=forceCopy)
            if kwargs.has_key('encodedID') and kwargs.get('encodedID') == origArtifact.encodedID:
                ## Avoid duplication of encodedIDs when an artifact is copied
                del kwargs['encodedID']

            log.info("_updateArtifact: newCopy: %s" % newCopy)

        if name and name != artifact.name and not newCopy:
            if artifact.handle != handle:
                _archiveArtifactHandle(session, artifact.id, artifact.handle, artifact.artifactTypeID, artifact.creatorID)
                if cache:
                    invalidatePerma(cache, artifact)
            artifact.name = name
            artifact.handle = handle
            dirtyPrintResources = True
        elif handle and handle != artifact.handle and not newCopy:
            ## handle is changed but not name
            _archiveArtifactHandle(session, artifact.id, artifact.handle, artifact.artifactTypeID, artifact.creatorID)
            if cache:
                invalidatePerma(cache, artifact)
            artifact.handle = handle
            dirtyPrintResources = True

        log.info("dirtyPrintResources: %s" % str(dirtyPrintResources))
        if kwargs.has_key('description'):
            description = kwargs['description']
            artifact.description = description

        if kwargs.has_key('encodedID') and artifact.type.modality:
            eid = kwargs['encodedID'].strip()
            extType = eid.split('.')[-2]
            if artifact.type.extensionType.lower() != extType.lower():
                raise Exception('The encodedID does not match the artifact extensionType [%s] != [%s]' % (artifact.type.extensionType, extType))
            artifact.encodedID = eid

        if kwargs.has_key('licenseName'):
            license =  _getUnique(session, model.License, 'name', kwargs.get('licenseName'))
            artifact.licenseID = license.id if license else None

        if kwargs.has_key('languageCode'):
            language = _getLanguageByNameOrCode(session, nameOrCode=kwargs['languageCode'])
            if not language:
                raise Exception(_('Invalid languageCode [%s]' % kwargs['languageCode']))
            artifact.languageID = language.id


        #
        #  Get the latest revision.
        #
        artifactRevision = artifact.revisions[0]

        newArtifactRevision = None
        newResRevision = False
        newRevision = False
        copied = False
        revisionList = []
        #
        #  Update relationship to its children.
        #
        existingChildDict = {}
        for child in artifactRevision.children:
            if child.child is None:
                child.child = _getArtifactRevisionByID(session, child.hasArtifactRevisionID)
            existingChildDict[child.child.id] = child

        if kwargs.has_key('children'):
            childIDList = kwargs['children']
            if childIDList is not None:
                idList = []
                for child in artifactRevision.children:
                    idList.append(child.hasArtifactRevisionID)
                if idList != childIDList:
                    #
                    #  Defer the children assignment until after a new
                    #  revision has been created.
                    #
                    newRevision = True
        #
        #  Update resource information.
        #
        #  First build a dictionary for fast access.
        #
        existingResourceDict = {}
        if not newCopy:
            resourceRevisions = origArtifact.revisions[0].resourceRevisions
        else:
            #
            #  Should have already created new resources in _copyResource().
            #
            resourceRevisions = artifactRevision.resourceRevisions
        for resourceRevision in resourceRevisions:
            if resourceRevision.resource.type.name not in model.PRINT_RESOURCE_TYPES:
                existingResourceDict[resourceRevision.id] = resourceRevision
            else:
                log.info("Skipping resource: %s %s" % (resourceRevision.resource.type.name, resourceRevision.resourceID))

        for resourceDict in resourceList:
            #
            #  Save the contents.
            #
            try:
                id = int(resourceDict['id'])
                if existingResourceDict.has_key(id):
                    resourceRevision = existingResourceDict[id]
                else:
                    resourceRevision = _getResourceRevisionByID(session, id=id)
                    if not resourceRevision:
                        continue

                log.info("_updateArtifact: updating resource[%s] revision[%s]" % (resourceRevision.resourceID, resourceRevision.id))
                resourceDict['resourceRevision'] = resourceRevision
                resourceRevision, oneCopied, oneVersioned = _updateResource(session=session, resourceDict=resourceDict, member=member,
                        vcs=vcs, commit=False, artifactTypeName=artifact.type.name)

                # At least one /or newRevision
                if oneVersioned:
                    newResRevision = True
                if oneCopied:
                    copied = True
                revisionList.append((resourceRevision, resourceDict, newResRevision))
            except Exception, e:
                log.error('updateArtifact resource Exception: %s' % str(e), exc_info=e)
                raise e

        if copied or newResRevision or newRevision:
            log.info("Copied? %s, newResRevision? %s, newRevision? %s" % (copied, newResRevision, newRevision))
            if newCopy:
                #
                #  There has been no resource assigned to it yet.
                #
                newArtifactRevision = artifact.revisions[0]
            elif newResRevision or newRevision:
                if artifact.type.name in ['study-track', 'assignment']:
                    #
                    #  No versioning.
                    #
                    newArtifactRevision = artifactRevision
                else:
                    #
                    #  Increase revision of the artifact revision by 1.
                    #
                    rev = int(artifactRevision.revision) + 1
                    if rev <= int(artifact.revisions[0].revision):
                        newArtifactRevision = artifact.revisions[0]
                    else:
                        newArtifactRevision = model.ArtifactRevision(revision=rev,
                                                                    downloads=0,
                                                                    favorites=0)
                        newArtifactRevision.publishTime = artifactRevision.publishTime
                        _associateResources(session, newArtifactRevision, artifactRevision.resourceRevisions, member)
                        _addArtifactRevision(session, artifact, newArtifactRevision)
                        session.add(newArtifactRevision)
                        session.flush()
                    newArtifactRevision.children = []
                    seq = 1
                    for child in artifactRevision.children:
                        relation = _getArtifactRevisionRelation(session,
                                                                newArtifactRevision.id,
                                                                child.hasArtifactRevisionID)
                        if relation is not None:
                            relation.sequence = seq
                        else:
                            relation = model.ArtifactRevisionRelation(
                                                artifactRevisionID=newArtifactRevision.id,
                                                hasArtifactRevisionID=child.hasArtifactRevisionID,
                                                sequence=seq)
                        log.debug("Copied child: [%d], seq [%d]" % (child.hasArtifactRevisionID, seq))
                        newArtifactRevision.children.append(relation)
                        seq += 1
                    newArtifactRevision.feedbacks = []
                    '''for feedback in artifactRevision.feedbacks:
                        newArtifactRevision.feedbacks.append(
                                model.ArtifactRevisionFeedback(
                                    artifactRevisionID=newArtifactRevision.id,
                                    memberID=feedback.memberID,
                                    rating=feedback.rating,
                                    comments=feedback.comments))'''
                    newArtifactRevision.standards = []
                    for standard in artifactRevision.standards:
                        newArtifactRevision.standards.append(standard)
            else:
                newArtifactRevision = None

            if newArtifactRevision is not None:
                for resourceRevision, resourceDict, newRev in revisionList:
                    if resourceRevision.resource.type.versionable and ( copied or newResRevision ):
                        # At least one resource was copied or newResRevision
                        revision = vcs.commit('Updated artifact[%s, %s]' % (artifact.id, artifact.name))
                        if not revision:
                            #
                            #  No change, stick with the current revision.
                            #
                            revision = resourceRevision.revision
                    else:
                        revision = resourceRevision.revision

                    if newRev:
                        log.debug('UpdateArtifact: setting resource revision[%s][%s]' % (resourceRevision.resourceID, revision))
                        #
                        #  Newly created resource revision, no need to create
                        #  a new one.
                        #
                        _setResourceRevision(session, resourceRevision, revision)
                        if resourceRevision not in newArtifactRevision.resourceRevisions:
                            newArtifactRevision.resourceRevisions.append(resourceRevision)
                        if existingResourceDict.has_key(resourceDict['id']):
                            del(existingResourceDict[resourceDict['id']])
                    else:
                        log.debug('UpdateArtifact: getting resource revision[%s][%s]' % (resourceRevision.resourceID, revision))
                        rr = _getResourceRevision(session, resourceRevision.resourceID, revision)
                        log.debug('UpdateArtifact: resource revision[%s]' % rr)
                        if rr:
                            if rr not in newArtifactRevision.resourceRevisions:
                                newArtifactRevision.resourceRevisions.append(rr)
                        else:
                            #
                            #  Create a new resource revision because at least one
                            #  versionable resource has been modified.
                            #
                            creationTime = datetime.now()
                            #
                            #  New resource revision with revision information form
                            #  vcs.
                            #
                            newResourceRevision = model.ResourceRevision(
                                                                revision=revision,
                                                                creationTime=creationTime)
                            newResourceRevision.resource = resourceRevision.resource
                            session.add(newResourceRevision)
                            newArtifactRevision.resourceRevisions.append(newResourceRevision)
                    if existingResourceDict.has_key(resourceRevision.id):
                        del(existingResourceDict[resourceRevision.id])

            if newArtifactRevision is not None:
                #
                #  Include those resources that have not been modified.
                #
                for id in existingResourceDict.keys():
                    existingRevision = existingResourceDict[id]
                    if existingRevision.resource.ownerID == member.id and existingRevision not in newArtifactRevision.resourceRevisions:
                        newArtifactRevision.resourceRevisions.append(existingRevision)
                log.debug('updateArtifact: Artifact revision: %s %s' % (newArtifactRevision.revision, artifact.id))
                #
                #  Update relationship to its children.
                #
                if kwargs.has_key('children'):
                    childIDList = kwargs['children']
                    if childIDList is not None:
                        newArtifactRevision.children = []
                        seq = 0
                        idList = []
                        for childID in childIDList:
                            child = _getUnique(session, model.ArtifactRevision, 'id', childID)
                            if child is None or child.artifact is None:
                                continue

                            """
                                Changing to a lazy approach: share as much as possible, except chapters.
                            """
                            #if child.artifact.type.name == 'chapter' or deepCopy:
                            if deepCopy:
                                child, new = _copyArtifact(session, child.artifact, member, vcs, recursive=deepCopy, parentName=artifact.name, resourceRevisions=child.resourceRevisions, forceCopy=forceCopy, artifactRevision=child)
                                ## Convert child to an ArtifactRevision object - since _copyArtifact returns an Artifact object
                                child = child.revisions[0]
                            log.debug("Checking for cycles: %s" % str(child.id))
                            if _hasCycle(session, artifact.id, child.artifactID):
                                raise Exception((_(u'cycle detected: tring to add child[%(childID)s] to %(artifact.id)s')  % {"childID":childID,"artifact.id": artifact.id}).encode("utf-8"))
                            if child.id in idList:
                                log.debug("updateArtifact: relation: id: %s hasID: %s exists" % (relation.artifactRevisionID, relation.hasArtifactRevisionID))
                            else:
                                seq += 1
                                relation = _getArtifactRevisionRelation(session,
                                                                        newArtifactRevision.id,
                                                                        child.id)
                                if relation is not None:
                                    relation.sequence = seq
                                else:
                                    relation = model.ArtifactRevisionRelation(
                                                        artifactRevisionID=newArtifactRevision.id,
                                                        hasArtifactRevisionID=child.id,
                                                        sequence=seq)
                                    session.add(relation)
                                    log.debug("updateArtifact: Creating new child relation!")
                                log.debug("updateArtifact: Adding relation: id: %s hasID: %s seq: %s" % (relation.artifactRevisionID, relation.hasArtifactRevisionID, relation.sequence))
                                idList.append(child.id)
                                newArtifactRevision.children.append(relation)
            for r in artifact.revisions:
                log.debug("All revisions: %s" % r.revision)
                log.info("All revisions: %s %s children: %d" % (artifact.id, r.id, len(r.children)))

        if newArtifactRevision:
            newArtifactRevision.messageToUsers = artifactRevision.messageToUsers
        messageToUsers = kwargs.get('messageToUsers', None)
        if messageToUsers is not None and messageToUsers != 'None':
            if newArtifactRevision is not None:
                artifactRevision = newArtifactRevision
            if artifactRevision.messageToUsers != messageToUsers:
                artifactRevision.messageToUsers = messageToUsers
        #
        #  Commit any other additions.
        #
        vcs.commit('Updated children of artifact[%s, %s]' % (artifact.id, artifact.name))
        log.debug('_updateArtifact: artifact[%s]' % artifact)
        log.info('_updateArtifact: artifact[%s]' % artifact.id)
        session.flush()

        if kwargs.has_key('browseTerms'):
            browseTermList = kwargs['browseTerms']
            for browseTermDict in browseTermList:
                try:
                    _checkAttributes([ 'name', 'browseTermType' ], **browseTermDict)
                except:
                    _checkAttributes([ 'browseTermID' ], **browseTermDict)
            del(kwargs['browseTerms'])
        else:
            browseTermList = None

        tagTermList = None
        if 'tagTerms' in kwargs:
            tagTermList = kwargs['tagTerms']
            for tagTermDict in tagTermList:
                try:
                    _checkAttributes(['name'], **tagTermDict)
                except:
                    _checkAttributes(['tagTermID'], **tagTermDict)
            del(kwargs['tagTerms'])

        searchTermList = None
        if 'searchTerms' in kwargs:
            searchTermList = kwargs['searchTerms']
            for searchTermDict in searchTermList:
                try:
                    _checkAttributes(['name'], **searchTermDict)
                except:
                    _checkAttributes(['searchTermID'], **searchTermDict)
            del(kwargs['searchTerms'])

        browseTermTypes = _getBrowseTermTypesDict(session)
        ## Remove existing tags if necessary
        if kwargs.get('removeExistingTags'):
            _deleteTagTermsForArtifact(session, artifactID=artifact.id)
        if kwargs.get('removeExistingContributor'):
            _deleteBrowseTermsForArtifact(session, artifactID=artifact.id, termTypeID=browseTermTypes['contributor'].id)
        # Condition to delete the existing practice_eta internal tag whenever a new tag is added for the same.
        if kwargs.get('removeExistingPracticeETAInternalTag'):
            _deleteBrowseTermsForArtifact(session, artifactID=artifact.id, termTypeID=browseTermTypes['internal-tag'].id, termPrefix='practice_eta')
        if kwargs.get('removeExistingDomains'):
            log.debug("removeExistingDomains: %s" % str(kwargs['removeExistingDomains']))
            _deleteBrowseTermsForArtifact(session, artifactID=artifact.id, termTypeID=browseTermTypes['domain'].id)
        if kwargs.get('removeExistingRelatedArtifacts'):
            log.debug("removeExistingRelatedArtifacts: %s" % str(kwargs['removeExistingRelatedArtifacts']))
            _deleteRelatedArtifactsForArtifact(session, artifactID=artifact.id)

        if kwargs.get('removeExistingConceptCollectionAssociations') == True:
            _deleteConceptCollectionHandlesForArtifact(session, artifactID=artifact.id)
        else:
            log.debug("Not removing existing conceptCollection Associations: %s" % kwargs.get('removeExistingConceptCollectionAssociations'))
        session.flush()

        ignoreLevel = ignoreContributor = False
        metaDataDict = kwargs.get('changed_metadata', None)
        if metaDataDict and type(metaDataDict) != dict:
            import ast
            metaDataDict = ast.literal_eval(metaDataDict)
            if metaDataDict:
                if metaDataDict.get('add', {}).get('level'):
                    ignoreLevel = True
                if metaDataDict.get('add', {}).get('contributor'):
                    ignoreContributor = True

        #
        # Process browseTermList
        #
        domainTerm = None
        pseudodomain = False
        existingTermList = _getBrowseTermsByArtifactID(session, artifact.id)
        existingTerms = {}
        for bt in existingTermList:
            existingTerms[bt.id] = bt.type.name
        log.info("browseTermList: %s" % str(browseTermList))
        log.info("existing browseTermList: %s" % str(existingTerms))
        termsToInvalidate = []
        newBrowseTermList = []
        if browseTermList is not None:
            for browseTermDict in browseTermList:
                btID = browseTermDict.get('browseTermID')
                if btID:
                    browseTerm = _getBrowseTermByID(session, id=int(btID))
                else:
                    browseTerm = _createBrowseTerm(session, **browseTermDict)
                    session.flush()
                if (browseTerm.type.name == 'level' and ignoreLevel) or (browseTerm.type.name == 'contributor' and ignoreContributor):
                    ## These are already present in the changed_metadata - so ignore these [Bug #40165]
                    log.debug("_updateArtifact: Ignoring term type [%s] value [%s] because changed_metadata overrides it." % (browseTerm.type.name, browseTerm.name))
                    continue
                if browseTerm.type.name == 'domain' or browseTerm.type.name == 'pseudodomain':
                    domainTerm = browseTerm
                    pseudodomain = browseTerm.type.name == 'pseudodomain'
                if not existingTerms.has_key(browseTerm.id):
                    log.debug("Adding browseTerm %d to artifact %d" % (browseTerm.id, artifact.id))
                    _createArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=browseTerm.id)
                    termsToInvalidate.append(browseTerm.id)
                else:
                    log.debug("Browse term %d already exists for artifact %d" % (browseTerm.id, artifact.id))
                    if browseTerm.type.name == 'domain' and not _getRelatedArtifact(session, artifact.id, browseTerm.id):
                        ## Check relatedArtifacts and add entry if missing
                        log.debug("Adding related artifact for artifact: %s, domain: %s" % (artifact.id, browseTerm.id))
                        _createRelatedArtifact(session, artifactID=artifact.id, domainID=browseTerm.id)
                    del existingTerms[browseTerm.id]
                    termsToInvalidate.append(browseTerm.id)
                newBrowseTermList.append({'browseTermID': browseTerm.id})
            ## Delete other browse terms
            for btID in existingTerms.keys():
                if existingTerms[btID] in ['domain', 'pseudodomain']:
                    _deleteArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=btID, conceptCollectionHandle=kwargs.get('conceptCollectionHandle'), collectionCreatorID=kwargs.get('collectionCreatorID'))
                    termsToInvalidate.append(btID)
            browseTermList = newBrowseTermList

        if not domainTerm and artifact.type.name != 'concept' and artifact.type.modality:
            domainTerm = _createPseudoDomainNode(session, artifact=artifact)
            pseudodomain = True
        session.flush()

        # Process conceptCollectionHandles
        if kwargs.get('conceptCollectionHandles') and kwargs.get('collectionCreatorIDs'):
            _addConceptCollectionHandlesToArtifact(session, artifactID=artifact.id, 
                    conceptCollectionHandles=kwargs['conceptCollectionHandles'], collectionCreatorIDs=kwargs['collectionCreatorIDs'])

        #
        # Process tagTermList
        #
        existingTerms = []
        for tt in artifact.tagTerms:
            existingTerms.append(tt.id)
        log.info("tagTermList: %s" % str(tagTermList))
        log.info("existing tagTermList: %s" % str(existingTerms))
        if tagTermList is not None:
            for tagTermDict in tagTermList:
                ttID = tagTermDict.get('tagTermID')
                if ttID:
                    tagTerm = _getTagTermByID(session, id=int(btID))
                else:
                    tagTerm = _createTagTerm(session, **tagTermDict)
                    session.flush()
                if not tagTerm.id in existingTerms:
                    log.debug("Adding tagTerm %d to artifact %d" % (tagTerm.id, artifact.id))
                    _createArtifactHasTagTerm(session, artifactID=artifact.id, tagTermID=tagTerm.id)
                else:
                    log.debug("Tag term %d already exists for artifact %d" % (tagTerm.id, artifact.id))
                    existingTerms[:] = filter(lambda x: x != tagTerm.id, existingTerms)

        #
        # Process searchTermList
        #
        existingTerms = []
        for tt in artifact.searchTerms:
            existingTerms.append(tt.id)
        log.info("searchTermList: %s" % str(searchTermList))
        log.info("existing searchTermList: %s" % str(existingTerms))
        if searchTermList is not None:
            for searchTermDict in searchTermList:
                ttID = searchTermDict.get('searchTermID')
                if ttID:
                    searchTerm = _getSearchTermByID(session, id=int(btID))
                else:
                    searchTerm = _createSearchTerm(session, **searchTermDict)
                    session.flush()
                if not searchTerm.id in existingTerms:
                    log.debug("Adding searchTerm %d to artifact %d" % (searchTerm.id, artifact.id))
                    _createArtifactHasSearchTerm(session, artifactID=artifact.id, searchTermID=searchTerm.id)
                else:
                    log.debug("Search term %d already exists for artifact %d" % (searchTerm.id, artifact.id))
                    existingTerms[:] = filter(lambda x: x != searchTerm.id, existingTerms)

        if artifact.type.name == 'lesson' and domainTerm and pseudodomain:
            children = artifact.getChildren()
            if children:
                concept = children[0]
                _createArtifactHasBrowseTerm(session, artifactID=concept.id, browseTermID=domainTerm.id)
                termsToInvalidate.append(domainTerm.id)

        if metaDataDict and len(metaDataDict) > 0:
            messages = []
            _updateMetaData(session, artifact, metaDataDict, messages, browseTermList, cache.relatedArtifactCache.browseTermCache, tagTermList, searchTermList)
            if len(messages) > 0:
                log.warn('_updateArtifact: messages%s' % messages)

        if artifact.type.name == 'assignment':
            #
            #  Only updating due time is allowed.
            #
            due = kwargs.get('due', '%missing%')
            if due != '%missing%':
                query = session.query(model.Assignment)
                query = query.filter_by(assignmentID=artifact.id)
                assignment = _queryOne(query)
                if assignment:
                    if due is not None:
                        due = due.strip().lower()
                        if due == 'none' or due == '':
                            due = None
                    if due:
                        try:
                            due = datetime.strptime(due, '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            due = datetime.strptime(due, '%Y-%m-%d')

                        validateDueDate(due)
                    assignment.due = due
                    session.add(assignment)

        #
        #  Update authors.
        #
        authorsDict = {}
        if kwargs.has_key('authors'):
            dirtyPrintResources = True
            ## Only if authors was specified in the kwargs
            authors = kwargs['authors']
            if authors:
                sequence = 0
                for author in authors:
                    if len(author) == 3:
                        name, roleID, seq = author
                    else:
                        name, roleID = author
                    if not name:
                        continue
                    sequence += 1
                    if type(roleID).__name__ != 'long' and type(roleID).__name__ != 'int':
                        roleID = _getMemberRoleIDByName(session, name=roleID)
                    if not roleID:
                        raise Exception((_(u"Invalid author role specified: %(roleID)s")  % {"roleID":roleID}).encode("utf-8"))
                    if not authorsDict.has_key(name):
                        authorsDict[name] = {}
                    authorsDict[name][roleID] = sequence

            for author in artifact.authors:
                if not authorsDict.has_key(author.name) or author.roleID not in authorsDict[author.name].keys():
                    log.debug('updateArtifact: Removing author[%s]' % author)
                    _deleteArtifactHasAuthor(session, artifactID=artifact.id, name=author.name, roleID=author.roleID)
            authors = {}
            for author in artifact.authors:
                if not authors.has_key(author.name):
                    authors[author.name] = {}
                authors[author.name][author.roleID] = author
            artifact.authors = []
            if authorsDict:
                for authorName in authorsDict.keys():
                    for roleID in authorsDict[authorName].keys():
                        sequence = authorsDict[authorName][roleID]
                        name = authors.get(authorName)
                        if name and name.has_key(roleID):
                            artifactAuthor = name[roleID]
                            log.debug('updateArtifact: existing author[%s] sequence[%s]' % (artifactAuthor, sequence))
                            artifactAuthor.sequence = sequence
                        else:
                            artifactAuthor = model.ArtifactAuthor(artifactID=artifact.id, name=authorName, roleID=roleID, sequence=sequence)
                            log.debug('updateArtifact: new author[%s]' % artifactAuthor)
                        artifact.authors.append(artifactAuthor)

        ## Update resource associations from xhtml
        _updateResourceAssociations(session, artifact.revisions[0], artifact.revisions[0].resourceRevisions)
        ## Add object to library
        _safeAddObjectToLibrary(session, objectID=artifact.revisions[0].id, objectType='artifactRevision', memberID=member.id)
        try:
            ## Log the new artifact revision event
            if artifact.id == origArtifact.id and artifact.revisions[0].id != origArtifactRevision.id:
                ## New revision created
                data = { 'type': artifact.type.name, 'id': artifact.id, 'version': artifact.revisions[0].revision }
                _createEventForType(session, typeName='ARTIFACT_REVISION_CREATED', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data), ownerID=member.id, processInstant=True)
            if artifact.revisions[0].id == origArtifactRevision.id and dirtyPrintResources:
                ## No new revision created - change in title, author etc.
                _removePrintResources(session, origArtifactRevision)
        except Exception as e:
            log.error("Error logging ARTIFACT_REVISION_CREATED event: %s" % str(e), exc_info=e)
            ## pass
        artifact.updateTime = datetime.now()
        ## Update latest revision's comment
        newArtifactRevision = artifact.revisions[0]
        newArtifactRevision.comment = revisionComment
        session.flush()
        if cache:
            if cache.relatedArtifactCache and cache.relatedArtifactCache.browseTermCache:
                for browseTerm in set(termsToInvalidate):
                    log.debug("Invalidating browseTermCache for %s" % browseTerm)
                    invalidateBrowseTerm(cache.relatedArtifactCache.browseTermCache, browseTerm, memberID=artifact.creatorID, session=session)
            invalidateArtifact(cache, artifact, memberID=artifact.creatorID)
        # Log audit trail
        try:
            auditTrailDict = {
                    'auditType': 'update_artifact',
                    'artifactType': artifact.type.name,
                    'artifactID': artifact.id,
                    'artifactHandle': artifact.handle,
                    'memberID': member.id,
                    'nonImpersonateMemberID': kwargs.get('nonImpersonatedMemberID', None),
                    'creationTime': datetime.utcnow()
            }
            AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
        except Exception, e:
            log.error('_updateArtifact: There was an issue logging the audit trail: %s' % e)
        return artifact
    except Exception, e:
        log.error("Update artifact api exception: [%s]" % str(e), exc_info=e)
        if vcs:
            vcs.revert()
        raise e

@_transactional()
def replaceRevisionContent(session, id, xhtml):
    """
        Replace the content of the ArtifactRevision, identified by id, with xhtml.
    """
    ar = _getArtifactRevisionByID(session, id)
    if ar is None:
        raise ex.NotFoundException((_(u'No ArtifactRevision of id[%(id)s].')  % {"id":id}).encode("utf-8"))

    log.debug('replaceRevisionContent ar[%s]' % ar)
    a = ar.artifact
    for rr in ar.resourceRevisions:
        resource = rr.resource
        if resource.type.name != 'contents':
            continue

        log.debug('replaceRevisionContent resource[%s]' % resource)
        uri = resource.uri
        xhtml = h.transform_to_xhtml(xhtml, validateRosetta=True, validateImages=True)
        vcs = v.vcs(a.creatorID, session=session)
        rr.revision = vcs.save(uri, xhtml)
        vcs.commit('Replace content for artifact[%s] revision[%s] uri[%s]' % (a.id, ar.id, uri))
    return a, ar

def _deleteArtifactHasAuthor(session, artifactID, name, roleID):
    query = session.query(model.ArtifactAuthor)
    query = query.filter(and_(
        model.ArtifactAuthor.artifactID == artifactID,
        model.ArtifactAuthor.name == name,
        model.ArtifactAuthor.roleID == roleID))
    for au in query.all():
        session.delete(au)

def _addArtifactRevision(session, artifact, artifactRevision):
    if artifact:
        cnt = 0
        while cnt < len(artifact.revisions):
            if artifact.revisions[cnt].revision == artifactRevision.revision:
                artifact.revisions[cnt] = artifactRevision
                artifactRevision.artifact = artifact
                return
            cnt += 1
        artifact.revisions.insert(0, artifactRevision)
        artifactRevision.artifact = artifact

@_transactional()
def updateResourceLanguage(session, resourceID, language):
    ret = _updateResourceLanguage(session, resourceID, language)
    return ret

def _updateResourceLanguage(session, resourceID, language):
    language = _getLanguageByName(session=session, name=language)
    if not language:
        raise Exception('No such language by name,:%s' % language)
    resource = _getResourceByID(session=session, id=resourceID)
    if not resource:
        raise Exception('No such resource by id:%s' % language )
    resource.languageID = language.id
    session.add(resource)
    return resource

@_transactional()
def updateResource(session, resourceDict, member, commit=False, artifactTypeName=None):
    ret = _updateResource(session=session, resourceDict=resourceDict, member=member, commit=commit, artifactTypeName=artifactTypeName)
    return ret

def _updateResource(session, resourceDict, member, vcs=None, commit=False, artifactTypeName=None):
    """
        Update a resource dictionary object.

    """

    copied = False
    versioned = False
    isSaved = False
    saveToFC = False
    log.debug("_updateResource: resourceDict: %s" % str(resourceDict))

    try:
        if not vcs:
            vcs = v.vcs(member.id, session=session)

        resourceRevision = resourceDict['resourceRevision']

        resource = resourceRevision.resource

        if resource.owner.id != member.id:
            log.info("Copying resource with id (_updateResource): %d, %s" % (resource.id, resource.type.name))
            resource, new = _copyResource(session, resource, member, resourceRevision=resourceRevision, vcs=vcs)
            resourceRevision = resource.revisions[0]
            copied = True

        if resourceDict.get('resourceType') and resource.resourceTypeID != resourceDict['resourceType'].id:
            resource.type = session.merge(resourceDict['resourceType'])
        elif resourceDict.get('resourceTypeID') and resource.resourceTypeID != resourceDict['resourceTypeID']:
            resource.resourceTypeID = resourceDict['resourceTypeID']

        if resourceDict.has_key('isExternal'):
            resource.isExternal = resourceDict['isExternal']

        if resourceDict.has_key('resourceName'):
            resource.name = resourceDict['resourceName']

        if resourceDict.has_key('resourceHandle'):
            handle = model.resourceName2Handle(resourceDict['resourceHandle'])
            if not resourceDict.has_key('uri') and not resource.isExternal and resource.handle == resource.uri:
                resource.uri = handle
            resource.handle = handle

        if resourceDict.has_key('resourceDesc'):
            resource.description = resourceDict['resourceDesc']

        if resourceDict.has_key('ownerID'):
            resource.ownerID = resourceDict['ownerID']

        ## Change the uri even if the file is not changed for internal and non-versionable resources
        #if not resource.isExternal and not resource.type.versionable and \
        #        not resourceDict.has_key('uri') and not resourceDict.has_key('contents'):
        #    resource.uri = os.path.basename(resource.name)
        #    log.info("_updateResource(): Changed resource uri: %s" % resource.uri)

        if resourceDict.has_key('license'):
            resource.license = resourceDict['license']

        if resourceDict.has_key('authors'):
            resource.authors = resourceDict['authors']

        if resourceDict.has_key('isAttachment'):
            resource.isAttachment = resourceDict['isAttachment']

        if resourceDict.has_key('isPublic'):
            if resourceDict['isPublic']:
                resourceRevision.publishTime = datetime.now()
            else:
                resourceRevision.publishTime = None
            del resourceDict['isPublic']

        log.info("_updateResource: Saving resource: %s" % resource.id)
        log.debug("_updateResource: Saving resource: %s" % resource)
        rev = resourceRevision.revision
        if resource.isExternal:
            if resourceDict.has_key('uri'):
                path = resourceDict['uri']
                resource.satelliteUrl = None
                resource.checksum = None
                #resource.handle = os.path.basename(path)
                if path != resource.uri:
                    resource.uri = path
                    relPath = path
                    contents = path
                    #h.checkUrlExists(contents)
                    saveToFC = False
            resource.hash = str(resource.id)
        else:
            if resourceDict.has_key('uri') or resourceDict.has_key('contents'):
                if resourceDict.has_key('uri'):
                    if not h.isUploadField(resourceDict['uri']):
                        relPath = resourceDict['uri']
                        contents = relPath
                    else:
                        if hasattr(resourceDict['uri'], 'filename'):
                            relPath = resourceDict['uri'].filename
                        else:
                            relPath = resourceDict['uri'].name
                    if relPath:
                        resource.uri = os.path.basename(relPath)
                        log.info("_updateResource: Set resource uri to: %s" % resource.uri)

                if resource.type.name == 'contents' or resourceDict.has_key('contents'):
                    #
                    #  Embedded contents.
                    #
                    if resource.type.versionable:
                        if resourceDict.has_key('contents'):
                            ## Text contents are part of the HTTP post
                            contents = resourceDict['contents']
                            relPath = resource.getUri()
                        else:
                            ## Text contents are uploaded as a file
                            contents = resourceDict['uri'].file.read()
                            resourceDict['uri'].file.close()
                        log.info("Saving contents: %s, %s" % (resource.id, relPath))
                        log.debug("Saving contents: %s" % resource)
                        xhtml = h.transform_to_xhtml(contents, validateRosetta=True, demoteH2=artifactTypeName=='concept', validateImages=True)
                        isSaved = vcs.isSaved(relPath)

                        if vcs.hasChanged(relPath, contents=xhtml):
                            rev = vcs.save(relPath, contents=xhtml, cached=True) #.encode('utf-8')))
                            versioned = True
                            log.info('Content changed, new revision to be created.')
                        log.info("Saved contents")
                    elif type(resourceDict['uri']).__name__ != 'str':
                        # Need to save to fedora commons
                        ## Contents is the file object and relPath is the file name
                        if type(resourceDict['uri']).__name__ == 'file':
                            contents = resourceDict['uri']
                        else:
                            contents = resourceDict['uri'].file
                        saveToFC = True
                    log.debug('updateResource: wrote contents to %s, saveToFC[%s]' % (relPath, saveToFC))
                else:
                    #
                    #  Uploaded - non text content.
                    #
                    uri = resourceDict['uri']
                    if resource.type.versionable:
                        isSaved = vcs.isSaved(uri)
                        if vcs.hasChanged(uri):
                            rev = vcs.save(uri, cached=True)
                            versioned = True
                            log.info('Content changed, new revision to be created.')
                    elif type(resourceDict['uri']).__name__ != 'str':
                        if type(resourceDict['uri']).__name__ == 'file':
                            contents = resourceDict['uri']
                        else:
                            contents = resourceDict['uri'].file
                        saveToFC = True
                    log.debug('updateResource: wrote uri to %s, saveToFC[%s]' % (relPath, saveToFC))

        if resourceRevision.revision != rev:
            session.flush()
            publishTime = resourceRevision.publishTime
            resourceRevision = _getResourceRevision(session, resource.id, rev)
            if resourceRevision:
                if resourceRevision.publishTime != publishTime:
                    resourceRevision.publishTime = publishTime
            else:
                log.debug('_updateREsource: isSaved[%s]' % isSaved)
                if isSaved:
                    raise Exception((_(u'Cannot find saved resource revision for %(resource)s')  % {"resource":resource}).encode("utf-8"))
                resourceRevision = model.ResourceRevision(
                                                    revision=rev,
                                                    creationTime=datetime.now(),
                                                    publishTime=publishTime)
                resourceRevision.resource = resource
                session.add(resourceRevision)
                resource.revisions.insert(0, resourceRevision)
                session.flush()
                log.debug('updateResource: new resourceRevision.id[%s]' % resourceRevision.id)

        if saveToFC:
            fcclient = fc.FCClient()
            useImageSatellite, imageSatelliteServer, iamImageSatellite = h.getImageSatelliteOptions()
            sum, size = h.computeChecksum(contents, isAttachment=resource.isAttachment)
            if resource.isAttachment and size > int(h.getConfigOptionValue('attachment_max_upload_size')) and member.id != 1:
                raise ex.ResourceTooLargeException((_(u'Maximum allowable file size exceeded for attachment: %(size)d')  % {"size":size}).encode("utf-8"))
            if useImageSatellite or iamImageSatellite:
                resource.checksum = sum
                resourceRevision.filesize = size
                existingResource = _getResourceByChecksum(session, checksum=sum)
                if not iamImageSatellite:
                    ## Cal remote
                    newR, ret = h.createRemoteResource(resourceType=resource.type, isExternal=resource.isExternal, creator=member.id, name=relPath, contents=contents, checksum=sum,
                            authors=resource.authors, licenseName=resource.license, isAttachment=resource.isAttachment)
                    resource.satelliteUrl = ret['response']['uri']
                else:
                    ## I am the satellite server
                    if existingResource:
                        ## Just return existing if found in cache
                        resource = existingResource
                    else:
                        ## Create a resource
                        resource.refHash = sum
                        checksum = fcclient.saveResource(id=resource.refHash, resourceType=resource.type, isExternal=resource.isExternal, creator=member.id, name=relPath, content=contents, isAttachment=resource.isAttachment)
                        resourceRevision.hash = checksum
                        resourceRevision.filesize = size
                        testUri = resource.getUri()
                        if testUri.startswith("http"):
                            try:
                                headOpener = urllib2.build_opener(h.HeadRedirectHandler())
                                headOpener.open(h.HeadRequest(testUri))
                            except Exception, e:
                                log.error("Error making head request: %s" % str(e), exc_info=e)
                                raise Exception((_(u'Cannot resolve satellite url: %(testUri)s')  % {"testUri":testUri}).encode("utf-8"))

                        resource.satelliteUrl = resource.getUri()
            else:
                if not resource.isExternal and relPath.endswith("content"):
                    ## FC Repo resource - need to get the real name (so that mime-type guessing works)
                    oldId = fcclient.getResourceIdFromLink(relPath)
                    if oldId:
                        resObj = fcclient.getResourceObject(id=oldId)
                        relPath = resObj.label
                        log.debug("Relpath now: %s" % relPath)
                checksum = fcclient.saveResource(id=resource.refHash, resourceType=resource.type, isExternal=resource.isExternal, creator=member.id, name=relPath, content=contents, isAttachment=resource.isAttachment)
                resourceRevision.hash = checksum
                resourceRevision.filesize = size
            log.info("Resource after save: %s" % resource.id)
            log.debug("Resource after save: %s" % resource)

        if commit and (copied or versioned):
            # At least one resource was copied or versioned
            revision = vcs.commit('Updated resource [%s %s]' % (resource.id, resource.name))
            log.info("New revision: %s" % revision)
            _setResourceRevision(session, resourceRevision, revision)
        session.flush()

        ## Add resource to library
        if resource.isAttachment:
            _safeAddObjectToLibrary(session, objectID=resourceRevision.id, objectType='resourceRevision', memberID=member.id)
    except Exception, e:
        log.error('_updateResource Exception: %s' % str(e), exc_info=e)
        raise e
    return resourceRevision, copied, versioned

@_transactional()
def updateResourceBoxDocumentID(session, resourceID, resourceDict):
    """
    add or modify InlineResourceDocuments table
    """
    return _updateResourceBoxDocumentID(session, resourceID, resourceDict)

def _updateResourceBoxDocumentID(session, resourceID, resourceDict):
    """
    add or modify InlineResourceDocuments table
    """
    query = session.query(model.Resource).filter_by(id=resourceID)
    resource = _queryOne(query)
    q = session.query(model.Resource).filter_by(satelliteUrl=resource.satelliteUrl)
    duplicateDocumentResources = q.all()

    for _resource in duplicateDocumentResources:
        if resourceDict.has_key('document_id'):

            inlineDocuments = _getInlineResourceDocument(session,resourceIDs=[resourceID])
            if not inlineDocuments:
                box_doc_Data = model.InlineResourceDocument(resourceID=_resource.id,
                                  documentID=resourceDict['document_id'],
                                  )
                session.add(box_doc_Data)

            for inlineDocument in inlineDocuments:
                inlineDocument.documentID = resourceDict['document_id']
                inlineDocument.updateTime = datetime.now()
                session.add(inlineDocument)
    return resource

@_transactional(readOnly=True)
def getPublishRequest(session, memberID=None, artifactRevisionID=None):
    query = session.query(model.PublishRequest)
    if memberID is not None:
        query = query.filter_by(memberID=memberID)
    else:
        query.order_by(model.PublishRequest.memberID)
    if artifactRevisionID is not None:
        query = query.filter_by(artifactRevisionID=artifactRevisionID)
    else:
        query.order_by(model.PublishRequest.artifactRevisionID)
    return query.all()

@_transactional()
def createPublishRequest(session, member, artifactRevision, comments):
    request = model.PublishRequest(artifactRevisionID=artifactRevision.id,
                                   memberID=member.id,
                                   comments=comments)
    session.add(request)

def _publishArtifactRevision(session, artifactRevision, memberID, recursive=True, cache=None, nonImpersonatedMemberID=None):
    artifact = artifactRevision.artifact
    if artifact.creatorID == memberID:
        now = datetime.now()
        artifactRevision.publishTime = now
        artifact.updateTime = now
        session.add(artifactRevision)
        session.add(artifact)
        if cache:
            invalidateArtifact(cache, artifact, revision=artifactRevision)
        try:
            data = {'artifactRevisionID': artifactRevision.id}
            _createEventForType(session, typeName='ARTIFACT_PUBLISHED', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data), ownerID=artifact.creatorID, processInstant=True)
        except Exception as e:
            log.error("Error logging ARTIFACT_PUBLISHED event: %s" % str(e), exc_info=e)
            ## pass

        if recursive:
            for child in artifactRevision.children:
                _publishArtifactRevision(session, child.child, memberID, recursive, cache=cache)
        # Log audit trail
        try:
            auditTrailDict = {
                    'auditType': 'publish_artifact_revision',
                    'memberID': memberID,
                    'nonImpersonatedMemberID': nonImpersonatedMemberID,
                    'artifactRevisionID': artifactRevision.id,
                    'artifactID': artifact.id,
                    'recursive': recursive,
                    'creationTime': datetime.utcnow()
            }
            AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
        except Exception, e:
            log.error('_publishArtifactRevision: There was an issue logging the audit trail: %s' % e)
    return artifactRevision

@_transactional()
def publishArtifactRevision(session, artifactRevision, memberID, recursive=True, cache=None, nonImpersonatedMemberID=None):
    """
        Publish the given artifact revision. If recursive is true,
        it will publish all its children too.
    """
    artifactRevision = _getInstance(session,
                                    artifactRevision,
                                    model.ArtifactRevision)
    return _publishArtifactRevision(session, artifactRevision, memberID, recursive, cache=cache, nonImpersonatedMemberID=nonImpersonatedMemberID)

def _unpublishArtifactRevision(session, artifactRevision, memberID, recursive, cache=None, nonImpersonatedMemberID=None):
    artifact = artifactRevision.artifact
    if artifact.creatorID == memberID:
        now = datetime.now()
        artifactRevision.publishTime = None
        artifact.updateTime = now
        session.add(artifactRevision)
        session.add(artifact)
        if cache:
            invalidateArtifact(cache, artifact, revision=artifactRevision, memberID=memberID)
        try:
            data = {'artifactRevisionID': artifactRevision.id}
            _createEventForType(session, typeName='ARTIFACT_UNPUBLISHED', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data), ownerID=artifact.creatorID, processInstant=True)
        except Exception as e:
            log.error("Error logging ARTIFACT_UNPUBLISHED event: %s" % str(e), exc_info=e)
            ## pass

        if recursive:
            for child in artifactRevision.children:
                _unpublishArtifactRevision(session, child.child, memberID, recursive, cache=cache, nonImpersonatedMemberID=nonImpersonatedMemberID)
        # Log audit trail
        try:
            auditTrailDict = {
                    'auditType': 'unpublish_artifact_revision',
                    'memberID': memberID,
                    'nonImpersonatedMemberID': nonImpersonatedMemberID,
                    'artifactRevisionID': artifactRevision.id,
                    'artifactID': artifact.id,
                    'recursive': recursive,
                    'creationTime': datetime.utcnow()
            }
            AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
        except Exception, e:
            log.error('_unpublishArtifactRevision: There was an issue logging the audit trail: %s' % e)
    return artifactRevision

@_transactional()
def unpublishArtifactRevision(session, artifactRevision, memberID, recursive=True, cache=None, nonImpersonatedMemberID=None):
    """
        Publish the given artifact revision. If recursive is true,
        it will unpublish all its children too.
    """
    artifactRevision = _getInstance(session,
                                    artifactRevision,
                                    model.ArtifactRevision)
    return _unpublishArtifactRevision(session, artifactRevision, memberID, recursive, cache=cache, nonImpersonatedMemberID=nonImpersonatedMemberID)

@_transactional()
def updateDownloadCount(session, revisionID):
    """
        Update the download count of the given ArtifactRevision.
    """
    if revisionID is None:
        return

    try:
        revision = _getArtifactRevisionByID(session, id=revisionID)
    except Exception, e:
        log.error('updateDownloadCount error[%s]' % e)
        return

    if revision is not None:
        if revision.downloads is None:
            revision.downloads = 0
        revision.downloads += 1
        for child in revision.children:
            if child.child.downloads is None:
                child.child.downloads = 0
            child.child.downloads += 1

@_transactional()
def undoDownloadCount(session, artifactRevision):
    """
        Undo the download count of the given ArtifactRevision.
    """
    if artifactRevision is None:
        return

    artifactRevision.downloads -= 1
    for child in artifactRevision.children:
        child.child.downloads -= 1

def _countArtifactRevisionsForResource(session, resource):
    revIds = []
    for rev in resource.revisions:
        revIds.append(rev.id)

    if not revIds:
        return 0
    query = session.query(model.ArtifactRevisionHasResources)
    query = query.filter(model.ArtifactRevisionHasResources.resourceRevisionID.in_(revIds))
    revisions = query.count()
    return revisions

@_transactional(readOnly=True)
def countArtifactRevisionsForResource(session, resource):
    return _countArtifactRevisionsForResource(session, resource)

@_transactional()
def createArtifactHasResources(session, artifactRevisionID, resourceRevisionIDs, artifactRevision, resourceRevisions):
    rr = {}
    if resourceRevisions:
        for resourceRevision in resourceRevisions:
            rr[resourceRevision.id] = resourceRevision
    elif resourceRevisionIDs:
        for resourceRevisionID in resourceRevisionIDs:
            rr[resourceRevisionID] = None
    else:
        raise Exception((_(u'One of resourceRevisions or resourceRevisionIDs must be specified.')).encode("utf-8"))
    query = session.query(model.ArtifactRevisionHasResources)
    query = query.filter(model.ArtifactRevisionHasResources.artifactRevisionID == artifactRevisionID)
    query = query.filter(model.ArtifactRevisionHasResources.resourceRevisionID.in_(rr.keys()))
    for r in query.all():
        if rr.has_key(r.resourceRevisionID):
            del rr[r.resourceRevisionID]
    cnt = 0
    for resourceRevisionID in rr.keys():
        _createArtifactHasResource(session, resourceRevisionID=resourceRevisionID, artifactRevisionID=artifactRevisionID,
                artifactRevision=artifactRevision, resourceRevision=rr[resourceRevisionID])
        session.flush()
        cnt += 1
    return cnt

@_transactional()
def createArtifactHasResource(session,**kwargs):
    return _createArtifactHasResource(session, **kwargs)

def _createArtifactHasResource(session, **kwargs):
    """
        Create an ArtifactRevisionHasResources instance.
    """
    _checkAttributes([ 'artifactRevisionID', 'resourceRevisionID' ], **kwargs)
    resourceRevision = kwargs.get('resourceRevision')
    if not resourceRevision:
        resourceRevision = _getUnique(session, model.ResourceRevision, 'id', kwargs['resourceRevisionID'])
    artifactRevision = kwargs.get('artifactRevision')
    if not artifactRevision:
        artifactRevision = _getUnique(session, model.ArtifactRevision, 'id', kwargs['artifactRevisionID'])
    log.debug('_createArtifactHasResource: artifactRevisionID[%s] resourceRevisionID[%s]' % (artifactRevision.id, resourceRevision.id))
    ## Only one cover page for an artifact
    if resourceRevision.resource.type.name in ['cover page', 'cover page icon']:
        for rr in artifactRevision.resourceRevisions:
            if rr.resource.type.name in ['cover page', 'cover page icon']:
                ## Remove the existing cover page association
                _deleteArtifactHasResource(session, artifactRevision.id, rr.id)

    artifactRevisionHasResources = model.ArtifactRevisionHasResources(**kwargs)
    session.add(artifactRevisionHasResources)
    if resourceRevision.resource.type.name in ['cover page', 'cover page icon']:
        ## The print resources are now dirty
        _removePrintResources(session, artifactRevision)

    return artifactRevisionHasResources

def _removePrintResources(session, artifactRevision):
    for rr in artifactRevision.resourceRevisions:
        if rr.resource.type.name in model.PRINT_RESOURCE_TYPES:
            log.info("Removing resource of type: %s" % rr.resource.type.name)
            _deleteArtifactHasResource(session, artifactRevision.id, rr.id)

@_transactional()
def deleteArtifactHasResource(session, artifactRevisionID, resourceRevisionID):
    return _deleteArtifactHasResource(session, artifactRevisionID, resourceRevisionID)

def _deleteArtifactHasResource(session, artifactRevisionID, resourceRevisionID):
    """
        Delete an ArtifactRevisionHasResources instance.
    """
    query = session.query(model.ArtifactRevisionHasResources)
    query = query.filter(and_(
                model.ArtifactRevisionHasResources.artifactRevisionID == artifactRevisionID,
                model.ArtifactRevisionHasResources.resourceRevisionID == resourceRevisionID))
    artifactRevisionHasResources = _queryOne(query)
    if artifactRevisionHasResources:
        session.delete(artifactRevisionHasResources)
    return artifactRevisionHasResources

@_transactional()
def deleteAssociationsForResource(session, resourceRevisionID):
    return _deleteAssociationsForResource(session, resourceRevisionID)

def _deleteAssociationsForResource(session, resourceRevisionID):
    query = session.query(model.ArtifactRevisionHasResources)
    query = query.filter_by(resourceRevisionID=resourceRevisionID)
    query.delete()

    query = session.query(model.AbuseReport)
    query = query.filter_by(resourceRevisionID=resourceRevisionID)
    query.delete()

    query = session.query(model.Group)
    query = query.filter_by(resourceRevisionID=resourceRevisionID)
    query.delete()

@_transactional(readOnly=True)
def getArtifactIDsByBrowseTerm(session, termIDs, artifactTypeID=None):
    """
        Get the all artifacts associated with a browseTerm
    """
    if not termIDs:
        return []
    query = session.query(model.ArtifactsAndBrowseTerms).distinct()
    query = query.filter(model.ArtifactsAndBrowseTerms.browseTermID.in_(termIDs))
    if artifactTypeID:
        query = query.filter(model.ArtifactsAndBrowseTerms.artifactTypeID == artifactTypeID)

    rows = query.all()
    artifactIDs = []
    for row in rows:
        artifactIDs.append(row.id)
    return artifactIDs

@_transactional(readOnly=True)
def getArtifactIDsByBrowseTerm_search(session, terms, artifactType=None, memberID=None):
    if not terms:
        return []

    query = ''
    for term in terms:
        if query:
            query += ' OR '
        query += solrclient.getSearchQueryForBrowseTerms(term, maxBoost=4, types=['domains'], exactOnly=True, descendents=False)
    if not artifactType and artifactType != 'artifact':
        query = 'AND type:"%s"' % artifactType

    results = _searchGeneric(session=session, query=query, idsOnly=True, memberID=memberID)
    return results['artifactList']

@_transactional(readOnly=True)
def getBrowseTermChildren(session, id, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTerm)
    query = query.filter_by(parentID=id)
    ## Ignore the unpublished branches.
    query = query.filter(not_(model.BrowseTerm.encodedID.in_(model.UNPUBLISHED_BRANCHES)))
    query = query.order_by(func.rpad(func.replace(model.BrowseTerm.encodedID, '.', ''), 30, '0')) #"RPAD(REPLACE(encodedID, '.', ''), 30, '0')")
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def hasBrowseTermCandidate(session, categoryID, domainID):
    query = session.query(model.BrowseTermCandidates)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(and_(
        model.BrowseTermCandidates.categoryID == categoryID,
        model.BrowseTermCandidates.rangeStart == domainID,
        model.BrowseTermCandidates.rangeEnd == domainID))
    return query.count() > 0

@_transactional(readOnly=True)
def getCandidatesForBrowseTerm(session, categoryID, maxSequence=None, includeRanges=True, pageNum=0, pageSize=0):
    query = session.query(model.BrowseTermCandidates)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(categoryID=categoryID)
    if maxSequence:
        query = query.filter(model.BrowseTermCandidates.sequence <= maxSequence)
    if not includeRanges:
        query = query.filter(model.BrowseTermCandidates.rangeStart == model.BrowseTermCandidates.rangeEnd)
    query = query.order_by(model.BrowseTermCandidates.sequence)

    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getBrowseTermsStartingWithEncodedID(session, encodedIDPrefix, pageNum=0, pageSize=0):
    domainType = _getBrowseTermTypeByName(session, name='domain')
    query = session.query(model.BrowseTerm)
    query = query.filter(model.BrowseTerm.termTypeID == domainType.id) 
    if encodedIDPrefix:
        query = query.filter(or_(
            model.BrowseTerm.encodedID.like('%s%%' % encodedIDPrefix),
            model.BrowseTerm.encodedID == encodedIDPrefix))
    query = query.order_by(model.BrowseTerm.encodedID)
    return p.Page(query, pageNum, pageSize)

@_transactional(readOnly=True)
def browseArtifactsByCategory(session, terms, typeName=None, includeChildren=False, includeEIDs=None, includeRelated=False, levels=None, memberID=None,
        browseAll=True, ck12only=True, fq=[], sort=None, modifiedAfter=None, idsOnly=False, start=0, rows=100):
    """
        Get all artifacts associated with category and optionally of specified type.
    """

    log.debug("terms: %s" % str(terms))
    query = ''
    maxBoost = 1 #len(terms)*3
    for term in terms:
        if query:
            query += ' OR '
        query += solrclient.getCustomSearchQuery(term=term.lower(), fields=['domainIDs.ext'], exact=True, boost=2**maxBoost)
        #maxBoost -= 1
    ## Only look for children of the original term (which is always first in the list)
    terms = terms[1:]
    if includeChildren:
        for term in terms:
            query += ' OR '
            query += solrclient.getCustomSearchQuery(term='1_' + term.lower(), fields=['ancestorDomainIDs.ext'], exact=True, boost=2**(maxBoost-1))
            #maxBoost -= 1
        for term in terms:
            query += ' OR '
            query += solrclient.getCustomSearchQuery(term='2_' + term.lower(), fields=['ancestorDomainIDs.ext'], exact=True, boost=2**(maxBoost-1))
            #maxBoost -= 1

    query = '(%s)' % query
    if includeEIDs:
        eidQ = ''
        for eid in includeEIDs:
            if eidQ:
                eidQ += ' OR '
            eidQ += 'encodedID:*.%s' % eid
        if eidQ:
            query += ' AND ( %s )' % eidQ

    if levels:
        lvlQ = ''
        for lvl in levels:
            if lvlQ:
                lvlQ += ' OR '
            lvlQ += 'levels.ext:"%s"' % lvl.lower()
        if lvlQ:
            query += ' AND ( %s )' % lvlQ

    if typeName and typeName != 'artifact':
        query += ' AND '
        query += 'type:"%s"' % typeName

    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u'No user found for login: ck12editor')).encode("utf-8"))
        query += ' AND isPublic:"1" AND ownerID:"%d"' % int(ck12editor.id)
    elif not browseAll and memberID:
        ## If browsing for only a user, we look for both private and public artifacts
        query += ' AND ownerID:"%d"' % int(memberID)
    else:
        ## If browsing for public artifacts we look for isPublic flag
        query += ' AND isPublic:"1"'

    if modifiedAfter:
        query += ' AND modified:[%s TO NOW]' % solrclient.getSolrTime(modifiedAfter)

    specialSortOrder = None
    #specialSortOrder = { 'field': 'domainIDs.ext', 'order': [term.lower() for term in terms] }
    results = _searchGeneric(session=session, query=query, idsOnly=True, fq=fq, sort=sort, start=start, rows=rows, \
            memberID=memberID, specialSort=specialSortOrder, spellSuggest=False)
    artifacts = results['artifactList']
    idDict = {}
    idList = []
    artifactIDList = []
    if artifacts:
        for artifact in artifacts:
            idDict[artifact['id']] = artifact
            idList.append(artifact['id'])
            artifactIDList.append(int(artifact['id']))

    if idsOnly:
        results['artifactList'] = artifactIDList
    else:
        ret = _getArtifactsDictByIDs(session, artifactIDList, memberID=memberID, orderList=artifactIDList, relatedArtifacts=includeRelated)
        for a in ret:
            log.info("Name: %s ID: %d EncodedID: %s" % (a['title'], a['id'], a['encodedID']))
        results['artifactList'] = ret
    return results

@_transactional(readOnly=True)
def browseArtifactsByCategoryRanges(session, ranges, typeName=None, memberID=None, browseAll=True, fq=[], sort=None, start=0, rows=100):
    """
        Get all artifacts associated with category and optionally of specified type.
    """

    if not ranges:
        return [], 0, {}
    query = ''
    maxBoost = len(ranges)
    for range in ranges:
        startID, startPrefix = h.splitEncodedID(range['rangeStart'])
        endID, endPrefix = h.splitEncodedID(range['rangeEnd'])
        if query:
            query += ' OR '
        if startID == endID:
            query += '(domainPrefix:"%s" AND domainEncoding:%d^%d)' % (startPrefix, startID, maxBoost*10)
        else:
            query += '(domainPrefix:"%s" AND domainEncoding:[%d TO %d]^%d)' % (startPrefix, startID, endID, maxBoost*10)
        maxBoost -= 1

    query = '(%s)' % query

    if typeName and typeName != 'artifact':
        query += ' AND '
        query += 'type:"%s"' % typeName

    if not browseAll and memberID:
        ## If browsing for only a user, we look for both private and public artifacts
        query += 'AND ownerID:"%d"' % int(memberID)
    else:
        ## If browsing for public artifacts we look for isPublic flag
        query += 'AND isPublic:"1"'

    #if not sort:
    #    sort = ['domainPrefix asc', 'domainEncoding asc']

    results = _searchGeneric(session=session, query=query, idsOnly=True, fq=fq, sort=sort, start=start, rows=rows, memberID=memberID, spellSuggest=False)
    artifacts = results['artifactList']
    idDict = {}
    idList = []
    artifactIDList = []
    if artifacts:
        for artifact in artifacts:
            idDict[artifact['id']] = artifact
            idList.append(artifact['id'])
            artifactIDList.append(artifact['id'])

    ret = _getArtifactsDictByIDs(session, artifactIDList, memberID=memberID, orderList=artifactIDList)
    for a in ret:
        log.info("Name: %s ID: %d" % (a['title'], a['id']))
    results['artifactList'] = ret
    return results

@_transactional()
def createBrowseTermCandidate(session, **kwargs):
    """
        Create an BrowseTermCandidates instance.
    """
    _checkAttributes([ 'categoryID', 'rangeStart', 'rangeEnd' ], **kwargs)
    browseTermCandidate = model.BrowseTermCandidates(**kwargs)
    session.add(browseTermCandidate)
    return browseTermCandidate

@_transactional(readOnly=True)
def getBrowseTermCandidateRangesForTerm(session, categoryID, rangesOnly=False):
    return _getBrowseTermCandidateRangesForTerm(session=session, categoryID=categoryID, rangesOnly=rangesOnly)

def _getBrowseTermCandidateRangesForTerm(session, categoryID, rangesOnly=False):
    query = session.query(model.BrowseTermCandidates)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(model.BrowseTermCandidates.categoryID == categoryID)
    if rangesOnly:
        query = query.filter(model.BrowseTermCandidates.rangeStart != model.BrowseTermCandidates.rangeEnd)
    query = query.order_by(model.BrowseTermCandidates.sequence)
    return query.all()

@_transactional()
def deleteBrowseTermCandidateRangesForTerm(session, categoryID, rangesOnly=False):
    ranges = _getBrowseTermCandidateRangesForTerm(session=session, categoryID=categoryID, rangesOnly=rangesOnly)
    for range in ranges:
        session.delete(range)

@_transactional()
def createTask(session, **kwargs):
    return _createTask(session=session, **kwargs)

def _createTask(session, **kwargs):
    _checkAttributes([ 'name', 'taskID' ], **kwargs)
    """
        Create a Task instance.
    """
    if not kwargs.get('started'):
        kwargs['started'] = datetime.now()
    if not kwargs.get('status'):
        kwargs['status'] = 'PENDING'
    elif kwargs['status'].upper() not in model.TASK_STATUSES:
        raise Exception((_(u"Invalid task status: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))

    task = model.Task(**kwargs)
    session.add(task)
    return task

@_transactional()
def updateTask(session, **kwargs):
    return _updateTask(session, **kwargs)

def _updateTask(session, **kwargs):
    _checkAttributes(['id'], **kwargs)
    task = _getUnique(session, model.Task, 'id', kwargs['id'])
    if not task:
        raise Exception((_(u"No such task: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))
    if kwargs.has_key('name'):
        task.name = kwargs['name']

    if kwargs.has_key('message'):
        task.message = kwargs['message']

    if kwargs.has_key('userdata'):
        task.userdata = kwargs['userdata']

    if kwargs.has_key('artifactKey'):
        task.artifactKey = kwargs['artifactKey']

    if kwargs.has_key('hostname'):
        task.hostname = kwargs['hostname']

    if kwargs.has_key('taskID'):
        task.taskID = kwargs['taskID']

    if kwargs.has_key('ownerID'):
        task.ownerID = kwargs['ownerID']

    if kwargs.get('status'):
        if kwargs['status'].upper() not in model.TASK_STATUSES:
            raise Exception((_(u"Invalid task status specified: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))
        task.status = kwargs['status'].upper()

    session.add(task)
    return task

@_transactional(readOnly=True)
def getTaskByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Task, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getTaskByTaskID(session, taskID):
    return _getTaskByTaskID(session, taskID)

def _getTaskByTaskID(session, taskID):
    session.expire_all()
    query = session.query(model.Task)
    query = query.filter_by(taskID=taskID)
    task = _queryOne(query)
    return task

@_transactional()
def deleteTask(session, task):
    _deleteTask(session, task)

def _deleteTask(session, task):
    if task:
        session.delete(task)

@_transactional()
def deleteTaskByID(session, id):
    try:
        id = long(id)
        task = _getUnique(session, model.Task, 'id', id)
        _deleteTask(session, task=task)
    except ValueError:
        pass

@_transactional(readOnly=True)
def getTaskByArtifactRevisionID(session, ownerID, artifactRevisionID, taskName):
    return _getTaskByArtifactRevisionID(session, ownerID, artifactRevisionID, taskName)

def _getTaskByArtifactRevisionID(session, ownerID, artifactRevisionID, taskName):
    """
        Get the latest Task of a user for a given artifactRevisionID and
        taskName.
    """
    query = session.query(model.Task)
    if ownerID:
        query = query.filter(and_(
                    model.Task.ownerID == ownerID,
                    model.Task.artifactKey == artifactRevisionID,
                    model.Task.name == taskName))
    else:
        query = query.filter(and_(
                    model.Task.artifactKey == artifactRevisionID,
                    model.Task.name == taskName))
    task = None
    tasks = query.order_by('started').all()
    if len(tasks) > 0:
        task = tasks[-1]
    return task

@_transactional(readOnly=True)
def getLastTaskByName(session, name, statusList=None, excludeIDs=[]):
    query = session.query(model.Task)
    log.info("Getting task by name: %s" % name)
    query = query.filter(model.Task.name == name)
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    if excludeIDs:
        query = query.filter(not_(model.Task.id.in_(excludeIDs)))
    query = query.order_by(model.Task.updated.desc(), model.Task.started.desc())
    return query.first()

@_transactional()
def deleteTasksByLastUpdateTime(session, lastUpdated, op='before', names=None, excludeNames=None, statusList=None):
    if not lastUpdated:
        raise Exception("lastUpdated must be specified.")
    query = session.query(model.Task)
    if op == 'before':
        query = query.filter(model.Task.updated < lastUpdated)
    elif op == 'after':
        query = query.filter(model.Task.updated > lastUpdated)
    else:
        raise Exception("Invalid op. Should be one of ['before', 'after']. op=[%s]" % str(op))
    if names:
        query = query.filter(model.Task.name.in_(names))
    elif excludeNames:
        query = query.filter(not_(model.Task.name.in_(excludeNames)))
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))

    return query.delete(synchronize_session=False)

@_transactional(readOnly=True)
def getTasksByLastUpdateTime(session, lastUpdated, op='before', names=None, excludeNames=None, statusList=None, pageNum=0, pageSize=0):
    query = session.query(model.Task)
    if op == 'before':
        query = query.filter(model.Task.updated < lastUpdated)
    elif op == 'after':
        query = query.filter(model.Task.updated > lastUpdated)
    if names:
        query = query.filter(model.Task.name.in_(names))
    elif excludeNames:
        query = query.filter(not_(model.Task.name.in_(excludeNames)))
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    query = query.order_by(model.Task.updated.asc())
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page

@_transactional(readOnly=True)
def getTasks(session, filters=None, searchFld=None, term=None, sort=None, pageNum=0, pageSize=0):
    fields = {
            'status':       model.Task.status,
            'taskID':       model.Task.taskID,
            'id':           model.Task.id,
            'name':         model.Task.name,
            'ownerID':      model.Task.ownerID,
            }
    sortFields = {}
    sortFields.update(fields)
    sortFields.update({
        'started': model.Task.started,
        'updated': model.Task.updated,
    })

    if searchFld and searchFld != 'searchAll' and searchFld not in fields.keys():
        raise Exception((_(u'Unsupported search field: %(searchFld)s')  % {"searchFld":searchFld}).encode("utf-8"))

    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in sortFields:
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.Task)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if searchFld and term and searchFld != 'searchAll':
        query = query.filter(fields[searchFld].ilike('%%%s%%' % term))

    if searchFld == 'searchAll' and term:
        term = '%%%s%%' % term
        query = query.filter(or_(
            model.Task.status.ilike(term),
            model.Task.taskID.ilike(term),
            model.Task.id.ilike(term),
            model.Task.name.ilike(term),
            model.Task.ownerID.ilike(term)))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(sortFld))
        else:
            query = query.order_by(desc(sortFld))
    log.debug("Running tasks query: %s" % query)
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page

@_transactional(readOnly=True)
def getProviderByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.EmbeddedObjectProvider, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getProviderByDomain(session, domain, create=False):
    query = session.query(model.EmbeddedObjectProvider)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(domain=domain)
    provider = _queryOne(query)
    if not provider and '.' in domain:
        ## We add an initial wildcard to the domain - so we should check with one.
        if not domain.startswith('*.'):
            domain = '*.%s' % domain
        domains = []
        domainParts = domain.split('.')
        for i in range(1, len(domainParts)):
            domainPrefix = '*.' + ".".join(domainParts[i:])
            domains.append(domainPrefix)
        if domains:
            log.info("No provider for %s. Trying with %s" % (domain, domains))
            query = session.query(model.EmbeddedObjectProvider)
            query = query.prefix_with('SQL_CACHE')
            query = query.filter(model.EmbeddedObjectProvider.domain.in_(domains))
            provider = query.first()
    if not provider and create:
        log.info('EmbeddedObject provider does not exist for domain: %s. Creating one' %(domain))
        domainParts = domain.split('.')
        if len(domainParts) >= 2:
            domainName = ".".join(domainParts[-2:])
            domain = "*." + domainName
            pd = {
                'name': domainName,
                'domain': domain,
                'needsApi': False,
                'blacklisted': False
            }
            provider = _createProvider(session, **pd)
    return provider

@_transactional(readOnly=True)
def getEmbeddedObjectProviders(session, filters=None, searchFld=None, term=None, sort=None, pageNum=0, pageSize=0):
    fields = {
            'name':         model.EmbeddedObjectProvider.name,
            'domain':       model.EmbeddedObjectProvider.domain,
            'id':           model.EmbeddedObjectProvider.id,
            'blacklisted':  model.EmbeddedObjectProvider.blacklisted,
            }
    sortFields = {}
    sortFields.update(fields)
    sortFields.update({
        'created': model.EmbeddedObjectProvider.created,
        'updated': model.EmbeddedObjectProvider.updated,
    })

    if searchFld and searchFld != 'searchAll' and searchFld not in fields.keys():
        raise Exception((_(u'Unsupported search field: %(searchFld)s')  % {"searchFld":searchFld}).encode("utf-8"))

    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in sortFields:
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.EmbeddedObjectProvider)
    query = query.prefix_with('SQL_CACHE')
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if searchFld and term and searchFld != 'searchAll':
        query = query.filter(fields[searchFld].ilike('%%%s%%' % term))

    if searchFld == 'searchAll' and term:
        term = '%%%s%%' % term
        query = query.filter(or_(
            model.EmbeddedObjectProvider.name.ilike(term),
            model.EmbeddedObjectProvider.domain.ilike(term),
            model.EmbeddedObjectProvider.id.ilike(term)))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(sortFld))
        else:
            query = query.order_by(desc(sortFld))
    log.debug("Running EO Providers query: %s" % query)
    page = p.Page(query, pageNum, pageSize)
    return page

def _createProvider(session, **kwargs):
    _checkAttributes(['name', 'domain'], **kwargs)
    if not kwargs.has_key('blacklisted'):
        kwargs['blacklisted'] = 0
    if not kwargs.has_key('needsApi'):
        kwargs['needsApi'] = 0
    if not kwargs.get('created'):
        kwargs['created'] = datetime.now()

    provider = model.EmbeddedObjectProvider(**kwargs)
    session.add(provider)
    return provider

@_transactional()
def createProvider(session, **kwargs):
    return _createProvider(session, **kwargs)

@_transactional()
def updateProvider(session, **kwargs):
    _checkAttributes(['id'], **kwargs)
    provider = _getUnique(session, model.EmbeddedObjectProvider, 'id', kwargs['id'])
    if not provider:
        raise Exception((_(u"No provider by id: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))

    if kwargs.has_key('name'):
        provider.name = kwargs.get('name')
    if kwargs.has_key('domain'):
        provider.domain = kwargs['domain']
    if kwargs.has_key('blacklisted'):
        provider.blacklisted = kwargs['blacklisted']
    if kwargs.has_key('needsApi'):
        provider.needsApi = kwargs['needsApi']
    provider.updated = kwargs['updated'] if kwargs.get('updated') else datetime.now()

    session.add(provider)
    return provider

@_transactional()
def deleteProvider(session, providerID):
    provider = _getUnique(session, model.EmbeddedObjectProvider, 'id', int(providerID))
    if not provider:
        raise Exception((_(u'No provider by id: %(providerID)s')  % {"providerID":providerID}).encode("utf-8"))
    session.delete(provider)

@_transactional(readOnly=True)
def getEmbeddedObjectByURI(session, uri, width=None, height=None):
    query = session.query(model.EmbeddedObject)
    query = query.filter_by(uri=uri)
    if width and width.isdigit():
        query = query.filter_by(width=int(width))
    if height and height.isdigit():
        query = query.filter_by(height=int(height))
    return query.first()

@_transactional(readOnly=True)
def getEmbeddedObjectByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.EmbeddedObject, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getEmbeddedObjectByHash(session, hash, resourceID=None):
    query = session.query(model.EmbeddedObject)
    query = query.filter_by(hash=hash)
    if resourceID:
        query = query.filter(model.EmbeddedObject.resourceID == resourceID)
    return query.first()

@_transactional(readOnly=True)
def getEmbeddedObjectForResourceID(session, resourceID):
    query = session.query(model.EmbeddedObject)
    query = query.filter_by(resourceID=resourceID)
    return query.first()

@_transactional(readOnly=True)
def getEmbeddedObjects(session, type=None, pageNum=0, pageSize=0):
    query = session.query(model.EmbeddedObject)
    if type:
        query = query.filter_by(type=type)
    page = p.Page(query, pageNum, pageSize, tableName='EmbeddedObjects')
    return page

@_transactional(readOnly=True)
def getEmbeddedObjectsByProvider(session, provider, pageNum=0, pageSize=0):
    query = session.query(model.EmbeddedObject)
    query = query.filter_by(providerID=provider.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def createEmbeddedObject(session, **kwargs):
    return _createEmbeddedObject(session, **kwargs)

def _createEmbeddedObject(session, **kwargs):
    """
        Create an EmbeddedObject instance.
    """
    _checkAttributes([ 'providerID', 'code', 'hash', 'ownerID' ], **kwargs)

    if not kwargs.get('resourceID'):
        ## Create resource if id not provided
        resourceDict = {}
        resourceDict['uri'] = kwargs.get('uri')
        if resourceDict['uri']:
            path, name = os.path.split(resourceDict['uri'])
            resourceDict['name'] = name
        if kwargs.get('type'):
            ## Figure out the resource type based on the eo type
            if kwargs['type'] in ['youtube', 'schooltube', 'teachertube', 'remotevideo', ]:
                resourceDict['resourceType'] = _getUnique(session, model.ResourceType, 'name', 'video')
            elif kwargs['type'] in ['audio']:
                resourceDict['resourceType'] = _getUnique(session, model.ResourceType, 'name', 'audio')

        if not resourceDict.get('resourceType'):
            resourceDict['resourceType'] = _getUnique(session, model.ResourceType, 'name', 'interactive')
        resourceDict['description'] = kwargs.get('code')
        resourceDict['authors'] = kwargs.get('authors')
        resourceDict['license'] = kwargs.get('license')
        language = _getUnique(session, model.Language, 'name', 'English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = kwargs.get('ownerID')
        resourceDict['isExternal'] = True
        resourceDict['creationTime'] = datetime.now()
        resourceDict['uriOnly'] = True
        resourceRevision = _createResource(session=session, resourceDict=resourceDict, resourceType=resourceDict['resourceType'], commit=False)
        resourceID = resourceRevision.resourceID
        kwargs['resourceID'] = resourceID

    if not kwargs.get('blacklisted'):
        kwargs['blacklisted'] = 0
    eo = model.EmbeddedObject(**kwargs)
    session.add(eo)
    return eo

@_transactional()
def updateEmbeddedObject(session, **kwargs):
    """
        Update an embedded object instance
    """
    _checkAttributes([ 'id' ], **kwargs)
    eo = _getUnique(session, model.EmbeddedObject, 'id', kwargs['id'])
    if not eo:
        raise Exception((_(u"No embedded object by id: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))

    eo.uri = kwargs['uri'] if kwargs.has_key('uri') else eo.uri
    eo.type = kwargs['type'] if kwargs.has_key('type') else eo.type
    eo.caption = kwargs['caption'] if kwargs.has_key('caption') else eo.caption
    eo.description = kwargs['description'] if kwargs.has_key('description') else eo.description
    eo.code = kwargs['code'] if kwargs.has_key('code') else eo.code
    eo.width = kwargs['width'] if kwargs.has_key('width') else eo.width
    eo.height = kwargs['height'] if kwargs.has_key('height') else eo.height
    eo.hash = kwargs['hash'] if kwargs.has_key('hash') else eo.hash
    eo.providerID = kwargs['providerID'] if kwargs.has_key('providerID') else eo.providerID
    eo.resourceID = kwargs['resourceID'] if kwargs.has_key('resourceID') else eo.resourceID
    eo.blacklisted = kwargs['blacklisted'] if kwargs.has_key('blacklisted') else eo.blacklisted

    if eo.resource:
        if kwargs.has_key('license'):
            eo.resource.license = kwargs['license']
        if kwargs.has_key('authors'):
            eo.resource.authors = kwargs['authors']

    session.add(eo)
    return eo

@_transactional()
def deleteEmbeddedObject(session, id):
    eo = _getUnique(session, model.EmbeddedObject, 'id', int(id))
    if not eo:
        raise Exception((_(u'No embedded object by id: %(id)s')  % {"id":id}).encode("utf-8"))

    session.delete(eo)

@_transactional()
def createAbuseReport(session, **kwargs):
    """
        Create an abuse report
    """
    if not kwargs.get('resourceRevisionID') and not kwargs.get('artifactID'):
        raise Exception("One of these 2 parameters are required: 'resourceRevisionID', 'artifactID'")
    if not kwargs.get('status'):
        kwargs['status'] = 'reported'
    if not kwargs.get('created'):
        kwargs['created'] = datetime.now()

    ar = model.AbuseReport(**kwargs)
    if not ar.isStatusValid():
        raise Exception((_(u'Invalid abuse report status: %(ar.status)s')  % {"ar.status":ar.status}).encode("utf-8"))

    session.add(ar)
    return ar

@_transactional()
def updateAbuseReport(session, **kwargs):
    """
        Update an abuse report record
    """
    _checkAttributes(['id', 'reviewerID'], **kwargs)
    ar = _getUnique(session, model.AbuseReport, 'id', int(kwargs['id']))
    if not ar:
        raise Exception((_(u"No abuse report by id: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))

    if not kwargs.get('updated'):
        kwargs['updated'] = datetime.now()

    ar.resourceRevisionID = kwargs.get('resourceRevisionID', ar.resourceRevisionID)
    ar.artifactID = kwargs.get('artifactID') if kwargs.has_key('artifactID') else ar.artifactID
    ar.reasonID = kwargs.get('reasonID', ar.reasonID)
    ar.reason = kwargs.get('reason', ar.reason)
    ar.status = kwargs.get('status', ar.status)
    ar.reporterID = kwargs.get('reporterID', ar.reporterID)
    ar.updated = kwargs.get('updated')
    ar.reviewerID = kwargs['reviewerID']
    ar.remark = kwargs.get('remark', ar.remark)
    ar.imageUrl = kwargs.get('imageUrl') if kwargs.has_key('imageUrl') else ar.imageUrl

    if not ar.isStatusValid():
        raise Exception((_(u'Invalid abuse report status: %(ar.status)s')  % {"ar.status":ar.status}).encode("utf-8"))

    session.add(ar)
    return ar

@_transactional(readOnly=True)
def getAbuseReportByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.AbuseReport, 'id', int(id))
    except ValueError:
        return None

@_transactional(readOnly=True)
def getAbuseReportsByResourceRevisionID(session, resourceRevisionID, status=None, pageNum=0, pageSize=0):
    query = session.query(model.AbuseReport)
    query = query.filter_by(resourceRevisionID=resourceRevisionID)
    if status:
        query = query.filter_by(status=status)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getAbuseReportsByArtifactID(session, artifactID, status=None, pageNum=0, pageSize=0):
    return _getAbuseReportsByArtifactID(session, artifactID, status, pageNum, pageSize)

def _getAbuseReportsByArtifactID(session, artifactID, status=None, pageNum=0, pageSize=0):
    query = session.query(model.AbuseReport)
    query = query.filter_by(artifactID=artifactID)
    if status:
        query = query.filter_by(status=status)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getAbuseReportsByStatus(session, status, resourceRevisionID=None, pageNum=0, pageSize=0):
    query = session.query(model.AbuseReport)
    query = query.filter_by(status=status)
    if resourceRevisionID:
        query = query.filter_by(resourceRevisionID=resourceRevisionID)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getAbuseReports(session, filters=None, sort=None, pageNum=0, pageSize=0):
    """
        Get abuse reports by various filters and sorts with pagination
    """
    fields = {
            'status':       model.AbuseReport.status,
            'id':           model.AbuseReport.id,
            'resourceRevisionID': model.AbuseReport.resourceRevisionID,
            'artifactID':   model.AbuseReport.artifactID,
            'reporterID':   model.AbuseReport.reporterID,
            'reviewerID':   model.AbuseReport.reviewerID,
            'created':      model.AbuseReport.created,
            'updated':      model.AbuseReport.updated,
            'artifactType': model.ArtifactType.name,
            'resourceID': model.ResourceRevision.resourceID,
            'title': model.Artifact.name,
            'creatorID': model.Artifact.creatorID
            }

    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.AbuseReport)
    query = query.outerjoin(model.Artifact, model.AbuseReport.artifactID == model.Artifact.id)
    query = query.outerjoin(model.ArtifactType, model.ArtifactType.id == model.Artifact.artifactTypeID)

    fromDate = None
    toDate = None
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld == 'fromDate':
                fromDate = datetime.strptime(filter + " 00:00:00" , '%m-%d-%Y %H:%M:%S')
                continue
            if filterFld == 'toDate':
                toDate = datetime.strptime(filter + " 00:00:00" , '%m-%d-%Y %H:%M:%S')
                continue

            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))
        if filterDict.has_key('resourceID') or filterDict.has_key('resourceRevisionID'):
            query = query.join(model.ResourceRevision, model.ResourceRevision.id == model.AbuseReport.resourceRevisionID)

    if fromDate and toDate:
        query = query.filter(and_(model.AbuseReport.created >= fromDate, model.AbuseReport.created <= toDate))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    log.debug("Running AbuseReports query: %s" % query)
    page = p.Page(query, pageNum, pageSize)
    return page

def _deleteAbuseReportsForArtifact(session, artifactID):
    for ar in _getAbuseReportsByArtifactID(session, artifactID):
        session.delete(ar)

@_transactional()
def deleteAbuseReport(session, id):
    ar = _getUnique(session, model.AbuseReport, 'id', int(id))
    if not ar:
        raise Exception((_(u'No abuse report by id: %(id)s')  % {"id":id}).encode("utf-8"))
    session.delete(ar)

@_transactional(readOnly=True)
def getDomainUrlsForDomainID(session, domainID):
    return _getUnique(session, model.DomainUrl, 'domainID', domainID)

@_transactional(readOnly=True)
def getSubjectsForDomainID(session, domainID):
    return _getSubjectsForDomainID(session, domainID)

def _getSubjectsForDomainID(session, domainID):
    subjectTerms = []
    types = _getBrowseTermTypesDict(session)
    term = _getBrowseTermByID(session, domainID, typeName='domain')
    if term:
        subjectEID = ''
        eid = term.encodedID
        for i in [0, 1]:
            try:
                if subjectEID:
                    subjectEID += '.'
                subjectEID += eid.split('.')[i]
                if subjectEID:
                    subTerm = _getBrowseTermByEncodedID(session, encodedID=subjectEID)
                    if subTerm:
                        subTerm = _getBrowseTerm(session, name=subTerm.name, browseTermTypeID=types['subject'].id)
                        if subTerm:
                            subjectTerms.append(subTerm)
            except:
                pass
    return subjectTerms

@_transactional(readOnly=True)
def getMathImageForHash(session, hash):
    return _getMathImageForHash(session, hash)

def _getMathImageForHash(session, hash):
    return _getUnique(session, model.MathImage, 'hash', hash)

@_transactional()
def createMathImage(session, **kwargs):
    return _createMathImage(session, **kwargs)

def _createMathImage(session, **kwargs):
    _checkAttributes(['hash', 'eqnType', 'expression', 'resourceUrl'], **kwargs)
    mathImage = model.MathImage(**kwargs)
    session.add(mathImage)
    return mathImage

@_transactional()
def createEmbeddedObjectCache(session, **kwargs):
    _checkAttributes(['urlHash', 'cache'], **kwargs)
    cache = model.EmbeddedObjectCache(**kwargs)
    session.add(cache)
    return cache

@_transactional(readOnly=True)
def getEmbeddedObjectCache(session, urlHash):
    return _getUnique(session, model.EmbeddedObjectCache, 'urlHash', urlHash)

@_transactional(readOnly=True)
def getDownloadCountFor(session, downloadType):
    return _getDownloadCountFor(session, downloadType)

def _getDownloadCountFor(session, downloadType):
    """
        Get the download count for the specified download type from the
        DownloadStats table.
    """
    downloadStats = _getUnique(session, model.DownloadStats, 'downloadType', downloadType)
    return downloadStats.count if downloadStats else None

@_transactional(readOnly=True)
def getTotalDownloadCount(session):
    return _getTotalDownloadCount(session)

def _getTotalDownloadCount(session):
    """
        Get the sum of all the download count from the
        DownloadStats table.
    """
    query = session.query(model.DownloadStats)
    totalCount = 0
    for eachQuery in query.all():
        totalCount = totalCount + eachQuery.count
    return totalCount

@_transactional(readOnly=True)
def getTotalDownloadCountAsString(session):
    import locale
    totalCount =  _getTotalDownloadCount(session)
    locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    stringToReturn = locale.format("%d", totalCount, grouping=True)
    return stringToReturn

@_transactional()
def updateDownloadCountFor(session, downloadType, count):
    return _updateDownloadCountFor(session, downloadType, count)

def _updateDownloadCountFor(session, downloadType, count):
    """
        Update the download count for the specified download type from the
        DownloadStats table.
    """
    downloadStats = _getUnique(session, model.DownloadStats, 'downloadType', downloadType)
    if not downloadStats:
        raise Exception((_(u'The download type specified does not exist in the DownloadStats table: %(downloadType)s') % {"downloadType":downloadType}).encode("utf-8"))
    downloadStats.count = count
    downloadStats.updateTime = datetime.now()

@_transactional(readOnly=True)
def getDownloadStatsTypes(session):
    return _getDownloadStatsTypes(session)

def _getDownloadStatsTypes(session):
    """
        Get all the different download types from the
        DownloadStats table.
    """
    query = session.query(model.DownloadStats)
    downloadStatsTypes = []
    for eachQuery in query.all():
        downloadStatsTypes.append((eachQuery.downloadType, eachQuery.count, eachQuery.updateTime))
    return downloadStatsTypes

@_transactional()
def addDownloadStatsType(session, downloadType):
    return _addDownloadStatsType(session, downloadType)

def _addDownloadStatsType(session, downloadType):
    """
        Add a download type to the DownloadStats table.
    """
    downloadType = downloadType.strip()
    downloadStatsTypes = _getDownloadStatsTypes(session)
    for eachDownloadStatsType in downloadStatsTypes:
        if downloadType.lower() == eachDownloadStatsType[0].lower():
            raise ex.DuplicateDownloadTypeException(_(u'Download type for %s already exists' %(downloadType)).encode("utf-8"))
    downloadTypeObj = model.DownloadStats(downloadType=downloadType, count=0)
    session.add(downloadTypeObj)
    return downloadTypeObj

@_transactional()
def deleteDownloadStatsType(session, downloadType):
    return _deleteDownloadStatsType(session, downloadType)

def _deleteDownloadStatsType(session, downloadType):
    """
        Add a download type to the DownloadStats table.
    """
    downloadType = downloadType.strip()
    downloadStats = _getUnique(session, model.DownloadStats, 'downloadType', downloadType)
    if not downloadStats:
        raise Exception((_(u'The download type specified does not exist in the DownloadStats table: %(downloadType)s') % {"downloadType":downloadType}).encode("utf-8"))
    session.delete(downloadStats)
    return downloadStats

@_transactional(readOnly=True)
def getAbuseReasons(session, pageNum=0, pageSize=0):
    query = session.query(model.AbuseReason)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.AbuseReason.name.asc())
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getEventTypes(session, pageNum=0, pageSize=0):
    return _getEventTypes(session, pageNum=pageNum, pageSize=pageSize)

def _getEventTypes(session, pageNum=0, pageSize=0):
    query = session.query(model.EventType)
    query = query.prefix_with('SQL_CACHE')
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getEventTypeByName(session, typeName):
    return _getEventTypeByName(session, typeName)

def _getEventTypeByName(session, typeName):
    return _getUnique(session, model.EventType, 'name', typeName)

@_transactional(readOnly=True)
def getEventTypeByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.EventType, 'id', id)
    except ValueError:
        return None

@_transactional()
def createEvent(session, **kwargs):
    _checkAttributes([ 'eventTypeID', ], **kwargs)
    if not kwargs.has_key('created'):
        kwargs['created'] = datetime.now()
    event = model.Event(**kwargs)
    session.add(event)
    return event

@_transactional()
def createEventForType(session, typeName, objectID=None, objectType=None, eventData=None, ownerID=None, processInstant=True, notificationID=None,
        notificationIDs=None, subscriberID=None, subObjectID=None):
    return _createEventForType(session, typeName, objectID=objectID, objectType=objectType, eventData=eventData, ownerID=ownerID,
            processInstant=processInstant, notificationID=notificationID, notificationIDs=notificationIDs, subscriberID=subscriberID, subObjectID=subObjectID)

def _createEventForType(session, typeName, objectID=None, objectType=None, eventData=None, ownerID=None, processInstant=True, notificationID=None,
        notificationIDs=None, subscriberID=None, subObjectID=None):
    evtType = _getUnique(session, model.EventType, 'name', typeName)
    if not evtType:
        raise Exception((_(u"Invalid event type: %(typeName)s")  % {"typeName":typeName}).encode("utf-8"))
    kwargs = {
        'eventTypeID': evtType.id,
        'objectID': objectID,
        'objectType': objectType,
        'subObjectID': subObjectID,
        'eventData': eventData,
        'ownerID': ownerID,
        'subscriberID': subscriberID,
        'created': datetime.now(),
    }
    event = model.Event(**kwargs)
    session.add(event)
    session.flush()
    if processInstant:
        if not notificationIDs:
            notificationIDs = []
        if notificationID:
            notificationIDs.append(notificationID)
        log.info("Processing notification ids: %s" % notificationIDs)
        if notificationIDs:
            eventIDs = [event.id] * len(notificationIDs)
        else:
            eventIDs = [event.id]
        if eventIDs and (len(notificationIDs) == len(eventIDs) or event.objectType == 'group'):
            ## [Bug #53066] Do not process the event instantly if there are no notification ids.
            ## Group events are exception to this - the notifications for these are added separately.
            global THREADLOCAL
            if not hasattr(THREADLOCAL, 'events'):
                THREADLOCAL.events = []
            if not hasattr(THREADLOCAL, 'notifications'):
                THREADLOCAL.notifications = []
            THREADLOCAL.events.extend(eventIDs)
            if notificationIDs:
                THREADLOCAL.notifications.extend(notificationIDs)
    event.eventType.name
    return event

@_transactional()
def updateEventForType(session, **kwargs):
    _checkAttributes(['id',], **kwargs)
    event = _getUnique(session, model.Event, 'id', kwargs['id'])
    if not event:
        raise Exception((_(u"No such Event for id: %(kwargs['id'])d")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))

    if kwargs.has_key('eventData'):
        event.eventData = kwargs['eventData']
    session.add(event)
    return event

@_transactional()
def deleteEventsByFilter(session, filters):
    fields = {
        'eventTypeID': model.Event.eventTypeID,
        'objectID': model.Event.objectID,
        'objectType': model.Event.objectType,
        'subObjectID': model.Event.subObjectID,
        'ownerID': model.Event.ownerID,
        'subscriberID': model.Event.subscriberID,
        'since': model.Event.created,
        'created': model.Event.created,
    }
    query = session.query(model.Event)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            if filterFld == 'since':
                query = query.filter(fields[filterFld] > filter[0])
            else:
                log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
                query = query.filter(fields[filterFld].in_(filter))

    rows = query.delete(synchronize_session=False)
    log.debug("Deleted %s rows." % rows)
    return rows

@_transactional()
def deleteEventByID(session, id):
    id = long(id)
    e = _getUnique(session, model.Event, 'id', id)
    session.delete(e)

@_transactional(readOnly=True)
def getEventByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Event, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getEventsForObject(session, objectID, objectType, eventTypeIDs, since=None, pageNum=0, pageSize=0):
    return _getEvents(session, objectID=objectID, objectType=objectType, eventTypeIDs=eventTypeIDs, since=since, pageNum=pageNum, pageSize=pageSize, latestOnly=False)

@_transactional(readOnly=True)
def getLatestEventForObject(session, objectID, objectType):
    return _getEvents(session, objectID, objectType, since=None, latestOnly=True)

@_transactional(readOnly=True)
def getEvents(session, since=None, pageNum=0, pageSize=0):
    return _getEvents(session, since=since, pageNum=pageNum, pageSize=pageSize)

@_transactional()
def deleteEventsByTimestamp(session, timestamp, op='before', eventTypeIDs=None, excludeTypeIDs=None):
    if not timestamp:
        raise Exception("Timestamp must be specified.")
    query = session.query(model.Event)
    if eventTypeIDs:
        query = query.filter(model.Event.eventTypeID.in_(eventTypeIDs))
    if op == 'after':
        query = query.filter(model.Event.created > timestamp)
    elif op == 'before':
        query = query.filter(model.Event.created < timestamp)
    else:
        raise Exception("Invalid op. Should be one of ['before', 'after']. op=[%s]" % str(op))
    if excludeTypeIDs:
        query = query.filter(not_(model.Event.eventTypeID.in_(excludeTypeIDs)))
    return query.delete(synchronize_session=False)

@_transactional(readOnly=True)
def getEventsByTimestamp(session, timestamp, op='before', eventTypeIDs=None, excludeTypeIDs=None, pageNum=0, pageSize=0):
    return _getEvents(session, since=timestamp, op=op, eventTypeIDs=eventTypeIDs, excludeTypeIDs=excludeTypeIDs, pageNum=pageNum, pageSize=pageSize, latestOnly=False)

def _getEvents(session, eventTypeIDs=None, objectID=None, objectIDs=None, objectType=None, subscriberID=None, since=None, op='after', excludeTypeIDs=None, pageNum=0, pageSize=0, latestOnly=False):
    query = session.query(model.Event)
    if eventTypeIDs:
        query = query.filter(model.Event.eventTypeID.in_(eventTypeIDs))
    if objectID:
        query = query.filter(model.Event.objectID == objectID)
    elif objectIDs:
        query = query.filter(model.Event.objectID.in_(objectIDs))
    if objectType:
        query = query.filter(model.Event.objectType == objectType)
    if subscriberID:
        query = query.filter(model.Event.subscriberID == subscriberID)
    if since:
        if op == 'after':
            query = query.filter(model.Event.created > since)
        elif op == 'before':
            query = query.filter(model.Event.created < since)
    if excludeTypeIDs:
        query = query.filter(not_(model.Event.eventTypeID.in_(excludeTypeIDs)))
    query = query.order_by(model.Event.created.desc())
    if latestOnly:
        return query.first()
    page = p.Page(query, pageNum, pageSize, tableName='Events')
    return page

@_transactional(readOnly=True)
def getEventsByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0, doCount=False, doCountOnly=False):
    return _getEventsByFilters(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize, doCount=doCount, doCountOnly=doCountOnly)

def _getEventsByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0, doCount=False, doCountOnly=False):
    """
        Get event list by various filters and sort. Supports pagination
    """
    fields = {
        'eventTypeID': model.Event.eventTypeID,
        'objectID': model.Event.objectID,
        'objectType': model.Event.objectType,
        'subObjectID': model.Event.subObjectID,
        'ownerID': model.Event.ownerID,
        'subscriberID': model.Event.subscriberID,
        'since': model.Event.created,
        'created': model.Event.created,
    }
    if not sort:
        sort = 'created,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.Event)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            if filterFld == 'since':
                query = query.filter(fields[filterFld] > filter[0])
            else:
                log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
                query = query.filter(fields[filterFld].in_(filter))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    
    countCol=None
    if doCount:
        countCol=model.Event.id

    log.debug("Running events query: %s" % query)
    page = p.Page(query, pageNum, pageSize, tableName='Events', countCol=countCol, countOnly=doCountOnly)
    return page

@_transactional(readOnly=True)
def getEventsForNotification(session, notification, since=None, pageNum=0, pageSize=0):
    """
        Get events for a given notification optionally events that happened since a timestamp
    """
    objectID = None
    objectType = None
    if notification.objectID:
        objectID = notification.objectID
        objectType = notification.objectType
    elif notification.groupID:
        objectID = notification.groupID
        objectType = 'group'
    return _getEvents(session, eventTypeIDs=[notification.eventTypeID],
            objectID=objectID, objectType=objectType,
            since=since,
            pageNum=pageNum, pageSize=pageSize)

def _getUniqueNotification(session, eventTypeID, objectID, objectType, type, ruleID, address, subscriberID, groupID, frequency):
    """
        Make sure the notification entry is unique
    """
    query = session.query(model.Notification)
    filters = and_(
        model.Notification.eventTypeID == eventTypeID,
        model.Notification.objectID == objectID,
        model.Notification.objectType == objectType,
        model.Notification.type == type,
        model.Notification.ruleID == ruleID,
        model.Notification.subscriberID == subscriberID,
        model.Notification.groupID == groupID)

    if frequency is not None:
        filters = and_(filters, model.Notification.frequency == frequency)

    if address:
        filters = and_(filters, model.Notification.address == address)
    query = query.filter(filters)
    log.debug("Query: %s" % query)
    ## [Bug #46510] If any  of the fields in the unique index are null, the unique constraint does not work.
    ##   - Nimish
    if objectID is None or objectType is None or ruleID is None or subscriberID is None \
            or address is None or groupID is None:
        return query.first()
    return _queryOne(query)

@_transactional(readOnly=True)
def getUniqueNotification(session, eventTypeID, subscriberID, type, ruleID=None, objectID=None, objectType=None, address=None, groupID=None, frequency=None):
    return _getUniqueNotification(session,
                                  eventTypeID=eventTypeID,
                                  subscriberID=subscriberID,
                                  type=type,
                                  ruleID=ruleID,
                                  objectID=objectID,
                                  objectType=objectType,
                                  address=address,
                                  groupID=groupID,
                                  frequency=frequency)

@_transactional()
def createNotification(session, **kwargs):
    return _createNotification(session, **kwargs)

def _createNotification(session, **kwargs):
    _checkAttributes(['eventTypeID', 'type'], **kwargs)
    if not kwargs.has_key('address') and not kwargs.has_key('subscriberID') and not kwargs.has_key('groupID'):
        raise Exception((_(u'Either address or subscriberID or groupID must be specified.')).encode("utf-8"))

    groupID = kwargs.get('groupID', None)
    if groupID:
        group = _getGroupByID(session, groupID)
        if not group:
            raise Exception((_(u'Invalid groupID[%s].' % groupID)).encode("utf-8"))

    ## Check for uniqueness
    notification = _getUniqueNotification(session, kwargs['eventTypeID'],
            kwargs.get('objectID'), kwargs.get('objectType'),
            kwargs.get('type'), kwargs.get('ruleID'),
            kwargs.get('address'), kwargs.get('subscriberID'), groupID,
            kwargs.get('frequency'))
    if notification:
        if notification.frequency == 'once':
            notification.lastSent = None
        notification.updated = datetime.now()
        session.add(notification)
        return notification

    if not kwargs.has_key('created'):
        kwargs['created'] = datetime.now()

    notification = model.Notification(**kwargs)
    session.add(notification)
    log.debug("Last sent: %s" % str(notification.lastSent))
    return notification

@_transactional()
def updateNotification(session, **kwargs):
    _checkAttributes(['id',], **kwargs)
    notification = _getUnique(session, model.Notification, 'id', kwargs['id'])
    if not notification:
        raise Exception((_(u"No such notification for id: %(kwargs['id'])d")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))

    if kwargs.has_key('lastSent'):
        notification.lastSent = kwargs['lastSent']
    if kwargs.has_key('type'):
        notification.type = kwargs['type']
    if kwargs.has_key('eventTypeID'):
        notification.eventTypeID = kwargs['eventTypeID']
    if kwargs.has_key('objectID'):
        notification.objectID = kwargs['objectID']
    if kwargs.has_key('objectType'):
        notification.objectType = kwargs['objectType']
    if kwargs.has_key('address'):
        notification.address = kwargs['address']
    if kwargs.has_key('subscriberID'):
        notification.subscriberID = kwargs['subscriberID']
    if kwargs.has_key('frequency'):
        notification.frequency = kwargs['frequency']
    if kwargs.has_key('ruleID'):
        notification.ruleID = kwargs['ruleID']
    if kwargs.get('resetLastSent'):
        notification.lastSent = None
    if kwargs.has_key('copyTo'):
        notification.copyTo = kwargs['copyTo']

    session.add(notification)
    return notification

@_transactional()
def deleteNotification(session, id):
    _deleteNotification(session, id)

def _deleteNotification(session, id):
    notification = _getUnique(session, model.Notification, 'id', id)
    if not notification:
        raise Exception((_(u"No such notification for id: %(id)d")  % {"id":id}).encode("utf-8"))
    session.delete(notification)

@_transactional(readOnly=True)
def getNotificationByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Notification, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getNotificationsForEvent(session, event, notificationTypes=None, frequencies=None, notSentSinceUpdate=False, onlyRecent=False, pageNum=0, pageSize=0):
    """
        Get notifications for a specific event
        - look for the same objectID and objectType if one is specified in the notification.
    """
    if not event.objectID:
        raise Exception("Cannot process event with null objectID: [id: %s]" % event.id)
    twoDaysAgo = datetime.now() - timedelta(days=2)
    if onlyRecent and event.created < twoDaysAgo:
        return []
    query = session.query(model.Notification)
    query = query.filter(model.Notification.eventTypeID == event.eventTypeID)
    query = query.filter(or_(
        model.Notification.lastSent == None,
        model.Notification.lastSent < event.created))
    if frequencies:
        query = query.filter(model.Notification.frequency.in_(frequencies))
    if notificationTypes:
        query = query.filter(model.Notification.type.in_(notificationTypes))
    if event.objectType == 'group':
        query = query.filter(model.Notification.groupID == event.objectID)
    else:
        ## [Bug #53066] Never get null objectID matches. Potential danger of sending wrong emails to users.
        query = query.filter(
            and_(
                model.Notification.objectID == event.objectID,
                model.Notification.objectType == event.objectType
            )
        )
        ## Only apply this to non-group notifications. Group notifications should be sent even if they are not updated.
        if notSentSinceUpdate:
            query = query.filter(or_(
                model.Notification.lastSent == None,
                model.Notification.lastSent < model.Notification.updated))
        if onlyRecent:
            query = query.filter(model.Notification.updated >= twoDaysAgo)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getNotificationsForEventType(session, eventTypeID, notificationTypes=None, frequencies=None, pageNum=0, pageSize=0):
    """
        Get notifications for a specific event
        - look for the same objectID and objectType if one is specified in the notification.
    """
    query = session.query(model.Notification)
    query = query.filter(model.Notification.eventTypeID == eventTypeID)
    if frequencies:
        query = query.filter(model.Notification.frequency.in_(frequencies))
    if notificationTypes:
        query = query.filter(model.Notification.type.in_(notificationTypes))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getNotificationsForGroupIDs(session, groupIDs, notificationTypes=None):
    return _getNotificationsForGroupIDs(session, groupIDs, notificationTypes=notificationTypes)

def _getNotificationsForGroupIDs(session, groupIDs, notificationTypes=None):
    if not groupIDs:
        return []
    query = session.query(model.Notification)
    query = query.filter(model.Notification.groupID.in_(groupIDs))
    if notificationTypes:
        query = query.filter(model.Notification.type.in_(notificationTypes))
    return query.all()

@_transactional(readOnly=True)
def getNotifications(session, notificationTypes=None, frequencies=None, excludeOnceProcessed=True, createdSince=None, pageNum=0, pageSize=0):
    """
        Get notifications for given list of notification types (optional)
    """
    includeOnce = False
    if frequencies and excludeOnceProcessed:
        includeOnce = 'once' in frequencies
        if includeOnce:
            frequencies.remove('once')
    query = session.query(model.Notification)
    if notificationTypes:
        query = query.filter(model.Notification.type.in_(notificationTypes))
    if includeOnce and excludeOnceProcessed and frequencies:
        query = query.filter(or_(
            model.Notification.frequency.in_(frequencies),
            and_(
                model.Notification.frequency == 'once',
                model.Notification.lastSent == None)))
    elif includeOnce and excludeOnceProcessed:
        query = query.filter(and_(
            model.Notification.frequency == 'once',
            model.Notification.lastSent == None))
    elif frequencies:
        query = query.filter(model.Notification.frequency.in_(frequencies))
    if createdSince:
        query = query.filter(model.Notification.created >= createdSince)
    page = p.Page(query, pageNum, pageSize, tableName='Notifications')
    return page

@_transactional(readOnly=True)
def getNotificationsByFilter(session, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getNotificationsByFilter(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getNotificationsByFilter(session, filters=None, sort=None, pageNum=0, pageSize=0):
    """
        Get notifications by filters and sort parameters
    """
    fields = {
            'id': model.Notification.id,
            'eventTypeID': model.Notification.eventTypeID,
            'objectID': model.Notification.objectID,
            'objectType': model.Notification.objectType,
            'type': model.Notification.type,
            'ruleID': model.Notification.ruleID,
            'address': model.Notification.address,
            'subscriberID': model.Notification.subscriberID,
            'groupID': model.Notification.groupID,
            'frequency': model.Notification.frequency,
            'updated': model.Notification.updated,
            'created': model.Notification.created,
            'lastSent': model.Notification.lastSent,
            }
    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.Notification)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)
            elif filterFld == 'objectID' and filter is None:
                query = query.filter(func.isnull(fields[filterFld]))

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    log.debug("Running notifications query: %s" % query)
    page = p.Page(query, pageNum, pageSize, tableName='Notifications')
    return page

@_transactional(readOnly=True)
def getPublishedBooksIDs(session):
    bookArtifactTypes = ['book', 'workbook', 'tebook', 'labkit']
    artifacts = _getArtifactsOfTypes(session, bookArtifactTypes)
    publishedBooksList = []
    for eachArtifact in artifacts:
        if eachArtifact.revisions[0].publishTime:
            publishedBooksList.append(eachArtifact.id)
    return publishedBooksList

@_transactional()
def createEflexUserDetail(session, **kwargs):
    _checkAttributes(['memberID', 'email'], **kwargs)
    eflexUserDetail = model.EflexUserDetail(**kwargs)
    session.add(eflexUserDetail)
    return eflexUserDetail

@_transactional()
def createEflexUserRequest(session, **kwargs):
    _checkAttributes(['eflexUserDetailID'], **kwargs)
    eflexUserRequest = model.EflexUserRequest(**kwargs)
    session.add(eflexUserRequest)
    return eflexUserRequest

@_transactional(readOnly=True)
def getEflexUserDetailByEmail(session, email):
    """
        Return the Eflex user detail that matches the given email address.
    """
    return _getUnique(session, model.EflexUserDetail, 'email', email)

@_transactional(readOnly=True)
def getEflexUserDetailByID(session, id):
    """
        Return the Eflex user detail that matches ID.
    """
    try:
        id = long(id)
        return _getUnique(session, model.EflexUserDetail, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getEflexUserRequestByEmail(session, email):
    """
        Return the Eflex user reqeusts that matches the given email address.
    """
    return _getUnique(session, model.EflexUserRequest, 'requester', email)

@_transactional(readOnly=True)
def getEflexUserRequestByID(session, id):
    """
        Return the Eflex user request that matches ID.
    """
    try:
        id = long(id)
        return _getUnique(session, model.EflexUserRequest, 'id', id)
    except ValueError:
        return None

@_transactional()
def updateEflexUserDetail(session, **kwargs):
    eflexUserDetail = _getUnique(session, model.EflexUserDetail, 'id', kwargs['id'])
    if eflexUserDetail:
        if kwargs.has_key('isSuccessful'):
            eflexUserDetail.isSuccessful = kwargs['isSuccessful']
        if kwargs.has_key('isBlacklisted'):
            eflexUserDetail.isBlacklisted = kwargs['isBlacklisted']
        if kwargs.has_key('isRegistered'):
            eflexUserDetail.isRegistered = kwargs['isRegistered']
        if kwargs.has_key('errorCount'):
            eflexUserDetail.errorCount = kwargs['errorCount']
        if kwargs.has_key('memberID'):
            eflexUserDetail.memberID = kwargs['memberID']
        session.add(eflexUserDetail)
    return eflexUserDetail

@_transactional()
def updateEflexUserRequest(session, **kwargs):
    eflexUserRequest = _getUnique(session, model.EflexUserRequest, 'id', kwargs['id'])
    if eflexUserRequest:
        if kwargs.has_key('status'):
            eflexUserRequest.status = kwargs['status']
        if kwargs.has_key('artifactID'):
            eflexUserRequest.artifactID = kwargs['artifactID']
        session.add(eflexUserRequest)
    return eflexUserRequest

@_transactional(readOnly=True)
def getNotificationRules(session, pageNum=0, pageSize=0):
    query = session.query(model.NotificationRule)
    query = query.prefix_with('SQL_CACHE')
    query = query.order_by(model.NotificationRule.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getNotificationRuleByName(session, name):
    return _getUnique(session, model.NotificationRule, 'name', name)

@_transactional(readOnly=True)
def getNotificationRuleByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.NotificationRule, 'id', id)
    except ValueError:
        return None

###################################################
# Library related APIs
###################################################

@_transactional(readOnly=True)
def getLibraryArtifactRevisions(session, memberID, pageNum=0, pageSize=0):
    return _getMemberLibraryObjects(session, memberID, 'artifactRevision', pageNum, pageSize)

@_transactional(readOnly=True)
def getLibraryResourceRevisions(session, memberID, pageNum=0, pageSize=0):
    return _getMemberLibraryObjects(session, memberID, 'resourceRevision', pageNum, pageSize)

def _getMemberLibraryObjects(session, memberID, objectType, pageNum=0, pageSize=0):
    """
        Get objects from library
    """
    if objectType == 'artifactRevision':
        query = session.query(model.MemberLibraryArtifactRevision)
        query = query.filter(and_(model.MemberLibraryArtifactRevision.objectType == objectType,
            model.MemberLibraryArtifactRevision.memberID == memberID))
    elif objectType == 'resourceRevision':
        query = session.query(model.MemberLibraryResourceRevision)
        query = query.filter(and_(model.MemberLibraryResourceRevision.objectType == objectType,
            model.MemberLibraryResourceRevision.memberID == memberID))
    else:
        raise Exception((_(u"Invalid objectType: %(objectType)s")  % {"objectType":objectType}).encode("utf-8"))

    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberLibraryObjectsByParentIDsAndTypes(session, memberID, objectsDesc):
    return _getMemberLibraryObjectsByParentIDsAndTypes(session, memberID, objectsDesc)

def _getMemberLibraryObjectsByParentIDsAndTypes(session, memberID, objectsDesc):
    objects = {}
    query = session.query(model.MemberLibraryObject)
    query = query.filter(model.MemberLibraryObject.memberID == memberID)
    conditions = []
    parentIDs = []
    for parentID, objectType in objectsDesc:
        conditions.append(and_(
            model.MemberLibraryObject.parentID == parentID,
            model.MemberLibraryObject.objectType == objectType))
        parentIDs.append(parentID)
    if conditions:
        query = query.filter(or_(*conditions))
        query = query.order_by(model.MemberLibraryObject.objectID.desc())
        rows = query.all()
        for row in rows:
            if not objects.has_key(row.parentID):
                objects[row.parentID] = row.asDict()
    return objects

@_transactional(readOnly=True)
def getMemberLibraryObject(session, memberID, objectID, objectType, domainID=None):
    return _getMemberLibraryObject(session, memberID, objectID, objectType, domainID=domainID)

def _getMemberLibraryObject(session, memberID, objectID, objectType, domainID=None, update=False):
    if objectType == 'domain':
        domain, artifact, objectID, objectType = _convertDomainIDToArtifactRevision(session, objectID)

    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    if update:
        query = session.query(model.MemberLibraryObject)
        query = query.filter(and_(
            model.MemberLibraryObject.objectType == objectType,
            model.MemberLibraryObject.objectID == objectID,
            model.MemberLibraryObject.memberID == memberID,
            model.MemberLibraryObject.domainID == domainID))
    else:
        if objectType == 'artifactRevision':
            query = session.query(model.MemberLibraryArtifactRevision)
            query = query.filter(and_(
                model.MemberLibraryArtifactRevision.objectType == objectType,
                model.MemberLibraryArtifactRevision.artifactRevisionID == objectID,
                model.MemberLibraryArtifactRevision.memberID == memberID,
                model.MemberLibraryArtifactRevision.domainID == domainID))
        elif objectType == 'resourceRevision':
            query = session.query(model.MemberLibraryResourceRevision)
            query = query.filter(and_(
                model.MemberLibraryResourceRevision.objectType == objectType,
                model.MemberLibraryResourceRevision.resourceRevisionID == objectID,
                model.MemberLibraryResourceRevision.memberID == memberID,
                model.MemberLibraryResourceRevision.domainID == domainID))
        else:
            raise Exception((_(u"Invalid objectType: %(objectType)s")  % {"objectType":objectType}).encode("utf-8"))
    return _queryOne(query)

def _getMemberLibraryObjectsForObject(session, objectID, objectType, domainID=None):
    if objectType == 'domain':
        domain, artifact, objectID, objectType = _convertDomainIDToArtifactRevision(session, objectID)

    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    if objectType == 'artifactRevision':
        query = session.query(model.MemberLibraryArtifactRevision)
        query = query.filter(and_(
            model.MemberLibraryArtifactRevision.objectType == objectType,
            model.MemberLibraryArtifactRevision.artifactRevisionID == objectID,
            model.MemberLibraryArtifactRevision.domainID == domainID))
    elif objectType == 'resourceRevision':
        query = session.query(model.MemberLibraryResourceRevision)
        query = query.filter(and_(
            model.MemberLibraryResourceRevision.objectType == objectType,
            model.MemberLibraryResourceRevision.resourceRevisionID == objectID,
            model.MemberLibraryResourceRevision.domainID == domainID))
    else:
        raise Exception((_(u"Invalid objectType: %(objectType)s")  % {"objectType":objectType}).encode("utf-8"))
    return query.all()

def _getMemberLabelsDict(session, memberID):
    labels = _getMemberLabels(session, memberID)
    labelDict = {}
    for row in labels:
        labelDict[row.label] = row

    return labelDict

def _getMemberLabels(session, memberID, includeSystem=False, pageNum=0, pageSize=0):
    query = session.query(model.MemberLabel)
    if includeSystem:
        query = query.filter(or_(
            model.MemberLabel.memberID == memberID,
            model.MemberLabel.memberID == None))
    else:
        query = query.filter(model.MemberLabel.memberID == memberID)
    query = query.order_by(model.MemberLabel.systemLabel.desc(), model.MemberLabel.label.asc())
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberLabels(session, memberID, includeSystem=False, pageNum=0, pageSize=0):
    return _getMemberLabels(session, memberID, includeSystem, pageNum, pageSize)

@_transactional(readOnly=True)
def getMemberLabelsForArtifactRevision(session, artifactRevisionID, memberID=None, domainID=None):
    libObjIds = []
    if memberID:
        libObj = _getMemberLibraryObject(session, memberID, artifactRevisionID, 'artifactRevision', domainID=domainID)
        libObjIds.append(libObj.id)
    else:
        libObjs = _getMemberLibraryObjectsForObject(session, artifactRevisionID, 'artifactRevision', domainID=domainID)
        libObjIds = [ l.id for l in libObjs ]
    query = session.query(model.MemberLibraryObjectHasLabel)
    query = query.filter(model.MemberLibraryObjectHasLabel.libraryObjectID.in_(libObjIds))
    return query.all()

@_transactional(readOnly=True)
def getMemberLabelsByParentID(session, parentID, objectType='artifactRevision', memberID=None, domainID=None):
    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    query = session.query(model.MemberLibraryObject)
    query = query.filter(and_(
        model.MemberLibraryObject.objectType == objectType,
        model.MemberLibraryObject.parentID == parentID,
        model.MemberLibraryObject.domainID == domainID))
    if memberID:
        query = query.filter(model.MemberLibraryObject.memberID == memberID)
    libObjIds = [ r.id for r in query.all() ]
    if libObjIds:
        query = session.query(model.MemberLibraryObjectHasLabel)
        query = query.filter(model.MemberLibraryObjectHasLabel.libraryObjectID.in_(libObjIds))
        return query.all()
    return []

@_transactional(readOnly=True)
def getMemberLibraryArtifactsForLabel(session, memberID, labelName, systemLabel=False):
    label = _getMemberLabelByName(session, memberID=memberID, label=labelName, systemLabel=systemLabel)
    if label:
        query = session.query(model.MemberLibraryObjectHasLabel)
        query = query.filter(model.MemberLibraryObjectHasLabel.labelID == label.id)
        libObjIds = [ r.libraryObjectID for r in query.all() ]
        if libObjIds:
            query = session.query(model.MemberLibraryObject)
            query = query.filter(model.MemberLibraryObject.id.in_(libObjIds))
            return query.all()
        return []
    raise Exception((_(u'No such label: %(labelName)s for memberID: %(memberID)d')  % {"labelName":labelName,"memberID": memberID}).encode("utf-8"))

"""
@_transactional(readOnly=True)
def getMemberLibraryArtifactRevisions(session, memberID, typeNames=None, sort=None, filters=None,
        grades=None, all=True, excludeLabels=[model.MEMBER_LABEL_ARCHIVED], pageNum=0, pageSize=0):

    return _getMemberLibraryArtifactRevisionsByLabelAndGrades(session, memberID, None, typeNames,
            sort=sort, filters=filters, grades=grades,
            all=all, excludeLabels=excludeLabels, pageNum=pageNum, pageSize=pageSize)
"""

ownershipValues = ['all', 'bookmarks', 'owned']
import zlib

@_transactional(readOnly=True)
def getMemberArtifactChildArtifactDraftCounts(session, memberID, childArtifactRevisonIDs):
    if not memberID:
        raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

    if not childArtifactRevisonIDs or not isinstance(childArtifactRevisonIDs, list):
        raise Exception(u"Invalid childArtifactRevisonIDs : [{childArtifactRevisonIDs}] is received.".format(childArtifactRevisonIDs=childArtifactRevisonIDs).encode('utf-8'))

    artifactChildArtifactDraftCounts = session.query(meta.ArtifactRevisionRelations.c.artifactRevisionID, func.count(meta.ArtifactRevisionRelations.c.artifactRevisionID)).filter(meta.ArtifactRevisionRelations.c.artifactRevisionID.in_(childArtifactRevisonIDs)).join(meta.ArtifactDraft, and_(meta.ArtifactRevisionRelations.c.hasArtifactRevisionID==meta.ArtifactDraft.c.artifactRevisionID, meta.ArtifactDraft.c.creatorID==memberID)).group_by(meta.ArtifactRevisionRelations.c.artifactRevisionID).all()

    artifactChildArtifactDraftCountsMap = {}
    for artifactChildArtifactDraftCount in artifactChildArtifactDraftCounts:
        artifactChildArtifactDraftCountsMap[artifactChildArtifactDraftCount[0]] = artifactChildArtifactDraftCount[1]

    return artifactChildArtifactDraftCountsMap

@_transactional(readOnly=True)
def getMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID):
    return _getMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID)

def _getMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID):
    if not memberID:
        raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

    if not artifactRevisionID:
        raise Exception(u"Invalid artifactRevisionID : [{artifactRevisionID}] is received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))

    artifactDict = None
    try:
        artifactDraftDOFromArtifactRevisionID = session.query(model.ArtifactDraft).filter(model.ArtifactDraft.artifactRevisionID==artifactRevisionID, model.ArtifactDraft.creatorID==memberID).one()
        if artifactDraftDOFromArtifactRevisionID.isCompressed:
            try:
                artifactDraftData = zlib.decompress(artifactDraftDOFromArtifactRevisionID.draft)
            except Exception:
                artifactDraftData = artifactDraftDOFromArtifactRevisionID.draft
        else:
            artifactDraftData = artifactDraftDOFromArtifactRevisionID.draft
        artifactDict = json.loads(artifactDraftData)
    except exc.NoResultFound:
        pass
    except exc.MultipleResultsFound:
        raise Exception(u"Multiple artifactDrafts with the given artifactRevisionID : [{artifactRevisionID}],  memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactRevisionID=artifactRevisionID, memberID=memberID).encode('utf-8'))

    return artifactDict

@_transactional(readOnly=True)
def deleteMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID):
    return _deleteMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID)

def _deleteMemberArtifactDraftByArtifactRevisionID(session, memberID, artifactRevisionID):
    if not memberID:
        raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

    if not artifactRevisionID:
        raise Exception(u"Invalid artifactRevisionID : [{artifactRevisionID}] is received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))

    deletedDraftsCount = session.query(model.ArtifactDraft).filter(model.ArtifactDraft.artifactRevisionID==artifactRevisionID, model.ArtifactDraft.creatorID==memberID).delete()

    draftExistedAndDeleted = False
    if deletedDraftsCount == 1:
        draftExistedAndDeleted = True
    elif deletedDraftsCount == 0:
        draftExistedAndDeleted = False
    else:
        raise Exception(u"More than one draft for the given memberID : [{memberID}], artifactRevisionID : [{artifactRevisionID}] are found in the database.System data Error.".format(memberID=memberID, artifactRevisionID=artifactRevisionID).encode('utf-8'))

    return draftExistedAndDeleted

@_transactional(readOnly=True)
def getMemberArtifactDraftInfoByArtifactRevisionID(session, memberID, artifactRevisionID):
    if not memberID:
        raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

    if not artifactRevisionID:
        raise Exception(u"Invalid artifactRevisionID : [{artifactRevisionID}] is received.".format(artifactRevisionID=artifactRevisionID).encode('utf-8'))

    artifactDraftInfo = None
    try:
        artifactDraftInfo = session.query(meta.ArtifactDraft.c.artifactTypeID, meta.ArtifactDraft.c.handle, meta.ArtifactDraft.c.creatorID, meta.ArtifactDraft.c.created, meta.ArtifactDraft.c.updated).filter(meta.ArtifactDraft.c.creatorID == memberID, meta.ArtifactDraft.c.artifactRevisionID == artifactRevisionID).one()
    except exc.NoResultFound:
        pass
    except exc.MultipleResultsFound:
        raise Exception(u"Multiple artifactDrafts with the given artifactRevisionID : [{artifactRevisionID}],  memberID : [{memberID}] combination are found in the dataBase. Internal System data error.".format(artifactRevisionID=artifactRevisionID, memberID=memberID).encode('utf-8'))

    return artifactDraftInfo

@_transactional(readOnly=True)
def getMemberArtifactDraftInfosByArtifactRevisionIDs(session, memberID, artifactRevisionIDs):
    if not memberID:
        raise Exception(u"Invalid memberID : [{memberID}] is received.".format(memberID=memberID).encode('utf-8'))

    if not artifactRevisionIDs:
        raise Exception(u"Invalid artifactRevisionIDs : [{artifactRevisionIDs}] is received.".format(artifactRevisionIDs=artifactRevisionIDs).encode('utf-8'))

    artifactDraftInfos = session.query(meta.ArtifactDraft.c.artifactRevisionID, meta.ArtifactDraft.c.artifactTypeID, meta.ArtifactDraft.c.handle, meta.ArtifactDraft.c.creatorID, meta.ArtifactDraft.c.created, meta.ArtifactDraft.c.updated).filter(meta.ArtifactDraft.c.creatorID == memberID, meta.ArtifactDraft.c.artifactRevisionID.in_(artifactRevisionIDs)).all()
    artifactDraftInfosMap = {}
    for artifactDraftInfo in artifactDraftInfos:
        artifactDraftInfosMap[artifactDraftInfo[0]] = artifactDraftInfo[1:]

    return artifactDraftInfosMap

@_transactional(readOnly=True)
def getMemberLibraryArtifactRevisionsByLabels(session, memberID, labels, typeNames=None, sort=None, filters=None,
        grades=None, ownership='all',
        excludeLabels=[model.MEMBER_LABEL_ARCHIVED], includeRevisionsInState='ANY', includePublishedRevisionsOnly=False, pageNum=0, pageSize=0):

    return _getMemberLibraryArtifactRevisionsByLabelAndGrades(session, memberID, labels, typeNames=typeNames, sort=sort,
            filters=filters, grades=grades, ownership=ownership, excludeLabels=excludeLabels, includeRevisionsInState=includeRevisionsInState, includePublishedRevisionsOnly=includePublishedRevisionsOnly, pageNum=pageNum, pageSize=pageSize)

def _getMemberLibraryArtifactRevisionsByLabelAndGrades(session, memberID, labels,
        typeNames=None, sort=None, filters=None, grades=None, ownership='all',
        excludeLabels=[model.MEMBER_LABEL_ARCHIVED], includeRevisionsInState='ANY', includePublishedRevisionsOnly=False, pageNum=0, pageSize=0):

    global ownershipValues
    ownership = str(ownership).lower()
    if ownership not in ownershipValues:
        raise Exception((_(u'Invalid value for ownership: %(ownership)s. Must be one of: %(str(ownershipValues))s')  % {"ownership":ownership,"str(ownershipValues)": str(ownershipValues)}).encode("utf-8"))

    filterDict = {}
    if filters:
        for filterFld, filterTerm in filters:
            if filterFld and filterTerm:
                filterDict[filterFld] = filterTerm
    if grades:
        m = model.MemberLibraryArtifactRevisionHasLabelsAndBrowseTerm
    else:
        m = model.MemberLibraryArtifactRevisionHasLabel

    filterableFields = { 'name': m.sortableName }
    if filterDict.has_key('label'):
        filterableFields['label'] = m.labelName

    query = session.query(m.artifactRevisionID, m.artifactID, m.artifactTypeID, m.handle, m.creatorID, m.revision, m.login).distinct()
    query = query.filter(and_(
        m.objectType == 'artifactRevision',
        m.memberID == memberID))

    if includeRevisionsInState == 'DRAFT':
        query=query.join(model.ArtifactDraft, and_(m.artifactRevisionID==model.ArtifactDraft.artifactRevisionID, m.memberID==model.ArtifactDraft.creatorID))
    elif includeRevisionsInState == 'FINAL':
        query=query.outerjoin(model.ArtifactDraft, and_(m.artifactRevisionID==model.ArtifactDraft.artifactRevisionID, m.memberID==model.ArtifactDraft.creatorID)).filter(model.ArtifactDraft.id == None)
    else:
        query=query.outerjoin(model.ArtifactDraft, and_(m.artifactRevisionID==model.ArtifactDraft.artifactRevisionID, m.memberID==model.ArtifactDraft.creatorID))

    if includePublishedRevisionsOnly:
        query=query.join(model.ArtifactRevision, m.artifactRevisionID==model.ArtifactRevision.id).filter(model.ArtifactRevision.publishTime != None)

    if labels:
        query = query.filter(m.labelName.in_(labels))
    if excludeLabels:
        sq = session.query(m.artifactRevisionID).distinct()
        sq = sq.filter(and_(m.memberID == memberID, m.labelName.in_(excludeLabels)))
        query = query.filter(not_(m.artifactRevisionID.in_(sq)))

    if typeNames:
        typeIDs = []
        typesDict = _getArtifactTypesDict(session)
        for tn in typeNames:
            tn = tn.lower()
            if typesDict.has_key(tn):
                typeIDs.append(typesDict.get(tn).id)
        query = query.filter(m.artifactTypeID.in_(typeIDs))

    if grades:
        browseTermType = _getBrowseTermTypeByName(session, name='grade level')
        query = query.filter(m.termTypeID == browseTermType.id)
        query = query.filter(m.term.in_(grades))

    if filterDict:
        for filterFld, filterTerm in filterDict.iteritems():
            if filterFld not in filterableFields.keys():
                raise Exception((_(u'Invalid filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            query = query.filter(filterableFields[filterFld].ilike('%%%s%%' % filterTerm))

    if ownership == 'bookmarks':
        ## Get only artifacts not owned by the memberID
        query = query.filter(m.creatorID != memberID)
    elif ownership == 'owned':
        ## Get only artifacts owned by the member
        query = query.filter(m.creatorID == memberID)

    if sort:
        for col, order in sort:
            if col == 'name':
                oby = m.sortableName
                if order == 'asc':
                    query = query.order_by(asc(oby))
                else:
                    query = query.order_by(desc(oby))
            elif col == 'updateTime':
                if order == 'asc':
                    query = query.order_by(asc(func.greatest(func.coalesce(model.ArtifactDraft.updated, m.updateTime, m.added), func.coalesce(m.updateTime, m.added, model.ArtifactDraft.updated), func.coalesce(m.added, model.ArtifactDraft.updated, m.updateTime))))
                else:
                    query = query.order_by(desc(func.greatest(func.coalesce(model.ArtifactDraft.updated, m.updateTime, m.added), func.coalesce(m.updateTime, m.added, model.ArtifactDraft.updated), func.coalesce(m.added, model.ArtifactDraft.updated, m.updateTime))))
            elif col == 'creationTime':
                oby = m.creationTime
                if order == 'asc':
                    query = query.order_by(asc(oby))
                else:
                    query = query.order_by(desc(oby))
            elif col == 'added':
                oby = m.added
                if order == 'asc':
                    query = query.order_by(asc(oby))
                else:
                    query = query.order_by(desc(oby))
    page = p.Page(query, pageNum, pageSize)
    log.debug('page[%s]' % page)
    return page

@_transactional(readOnly=True)
def getMemberLibraryArtifactRevisionsByArtifactRevision(session, artifactRevisionID, domainID=None):
    return _getMemberLibraryArtifactRevisionsByArtifactRevision(session, artifactRevisionID, domainID=domainID)

def _getMemberLibraryArtifactRevisionsByArtifactRevision(session, artifactRevisionID, domainID=None):
    """
        Return all memberIDs which have this artifactRevision in their libraries
    """
    query = session.query(model.MemberLibraryArtifactRevision)
    query = query.filter(and_(
        model.MemberLibraryArtifactRevision.objectType == 'artifactRevision',
        model.MemberLibraryArtifactRevision.artifactRevisionID == artifactRevisionID,
        model.MemberLibraryArtifactRevision.domainID == domainID))
    memberIDs = {}
    for r in query.all():
        memberIDs[r.memberID] = r
    return memberIDs.keys()

@_transactional(readOnly=True)
def getMemberLibraryArtifactRevision(session, memberID, artifactRevisionID, domainID=None):
    return _getMemberLibraryArtifactRevision(session, memberID, artifactRevisionID, domainID)

def _getMemberLibraryArtifactRevision(session, memberID, artifactRevisionID, domainID=None):
    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    query = session.query(model.MemberLibraryArtifactRevision)
    query = query.filter(and_(
        model.MemberLibraryArtifactRevision.objectType == 'artifactRevision',
        model.MemberLibraryArtifactRevision.memberID == memberID,
        model.MemberLibraryArtifactRevision.artifactRevisionID == artifactRevisionID,
        model.MemberLibraryArtifactRevision.domainID == domainID))
    return query.first()

@_transactional(readOnly=True)
def getMemberLibraryResourceRevision(session, memberID, resourceRevisionID, domainID=None):
    return _getMemberLibraryResourceRevision(session, memberID, resourceRevisionID, domainID)

def _getMemberLibraryResourceRevision(session, memberID, resourceRevisionID, domainID=None):
    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    query = session.query(model.MemberLibraryResourceRevision)
    query = query.filter(and_(
        model.MemberLibraryResourceRevision.objectType == 'resourceRevision',
        model.MemberLibraryResourceRevision.memberID == memberID,
        model.MemberLibraryResourceRevision.resourceRevisionID == resourceRevisionID,
        model.MemberLibraryResourceRevision.domainID == domainID))
    return query.first()

@_transactional(readOnly=True)
def getMemberLibraryResourceRevisionsByLabels(session, memberID, labels, typeNames=None, sort=None, filters=None,
        ownership='all', excludeLabels=[model.MEMBER_LABEL_ARCHIVED], pageNum=0, pageSize=0):

    return _getMemberLibraryResourceRevisionsByLabels(session, memberID, labels, typeNames=typeNames, sort=sort,
            filters=filters, ownership=ownership, excludeLabels=excludeLabels, pageNum=pageNum, pageSize=pageSize)

def _getMemberLibraryResourceRevisionsByLabels(session, memberID, labels,
        typeNames=None, sort=None, filters=None, ownership='all',
        excludeLabels=[model.MEMBER_LABEL_ARCHIVED], pageNum=0, pageSize=0):

    global ownershipValues
    ownership = str(ownership).lower()
    if ownership not in ownershipValues:
        raise Exception((_(u'Invalid value for ownership: %(ownership)s. Must be one of: %(str(ownershipValues))s')  % {"ownership":ownership,"str(ownershipValues)": str(ownershipValues)}).encode("utf-8"))

    filterDict = {}
    if filters:
        for filterFld, filterTerm in filters:
            if filterFld and filterTerm:
                filterDict[filterFld] = filterTerm
    m = model.MemberLibraryResourceRevisionHasLabel

    filterableFields = { 'name': m.uri }
    if filterDict.has_key('label'):
        filterableFields['label'] = m.labelName

    query = session.query(m.resourceRevisionID).distinct()
    query = query.filter(and_(
        m.objectType == 'resourceRevision',
        m.memberID == memberID))

    if labels:
        query = query.filter(m.labelName.in_(labels))
    if excludeLabels:
        sq = session.query(m.resourceRevisionID).distinct()
        sq = sq.filter(and_(m.memberID == memberID, m.labelName.in_(excludeLabels)))
        query = query.filter(not_(m.resourceRevisionID.in_(sq)))

    if typeNames:
        typeIDs = []
        typesDict = _getResourceTypesDict(session)
        for tn in typeNames:
            tn = tn.lower()
            if typesDict.has_key(tn):
                typeIDs.append(typesDict.get(tn)['id'])
        query = query.filter(m.resourceTypeID.in_(typeIDs))

    if filterDict:
        for filterFld, filterTerm in filterDict.iteritems():
            if filterFld not in filterableFields.keys():
                raise Exception((_(u'Invalid filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            query = query.filter(filterableFields[filterFld].ilike('%%%s%%' % filterTerm))

    if ownership == 'bookmarks':
        ## Get only artifacts not owned by me
        query = query.filter(m.ownerID != memberID)
    elif ownership == 'owned':
        ## Get only artifacts owned by the member
        query = query.filter(m.ownerID == memberID)

    if sort:
        for col, order in sort:
            if col == 'name':
                oby = m.uri
            elif col == 'creationTime':
                oby = m.creationTime
            elif col == 'latest':
                oby = m.creationTime
                order = 'desc'
            elif col == 'added':
                oby = m.added
            if order == 'asc':
                query = query.order_by(asc(oby))
            else:
                query = query.order_by(desc(oby))
    log.info("Query: %s" % str(query))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def addObjectToLibrary(session, objectID, objectType, memberID, domainID=None, labels=None, systemLabels=None, removeExisting=False, cache=None):
    return _addObjectToLibrary(session, objectID, objectType, memberID, domainID, labels, systemLabels, removeExisting, cache)

@_transactional()
def safeAddObjectToLibrary(session, objectID, objectType, memberID, domainID=None, labels=None, systemLabels=None, cache=None):
    return _safeAddObjectToLibrary(session, objectID, objectType, memberID, domainID=domainID, labels=labels, systemLabels=systemLabels, cache=cache)

def _safeAddObjectToLibrary(session, objectID, objectType, memberID, domainID=None, labels=None, systemLabels=None, cache=None):
    if not _getMemberLibraryObject(session, memberID, objectID, objectType, domainID=domainID):
        log.info("Adding objectType: %s and id: %d (domainID: %s) to memberID: %d's library" % (objectType, objectID, domainID, memberID))
        return _addObjectToLibrary(session, objectID, objectType, memberID, domainID, labels, systemLabels, cache=cache)
    return None

def _getArtifactForDomain(session, domain, createNew=False):
    artifact = _getArtifactByEncodedID(session, encodedID='%s.DOM.1' % domain.encodedID, typeName='domain')
    if not artifact and createNew:
        ## Create one
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        kwargs = {'name': domain.name, 'creator':ck12editor, 'typeName':'domain', 'handle':domain.name, 'encodedID': '%s.DOM.1' % domain.encodedID}
        artifact = _createArtifact(session, **kwargs)
        _createArtifactHasBrowseTerm(session, artifactID=artifact.id, browseTermID=domain.id)
    return artifact

def _getDomainOrPseudodomain(session, id):
    domain = _getBrowseTermByID(session, id=int(id), typeName='domain')
    if not domain:
        domain = _getBrowseTermByID(session, id=int(id), typeName='pseudodomain')
    return domain

def _convertDomainIDToArtifactRevision(session, id):
    domain = _getDomainOrPseudodomain(session, id)
    artifact = _getArtifactForDomain(session, domain)
    objectID = artifact.revisions[0].id
    return domain, artifact, objectID, 'artifactRevision'

def _addObjectToLibrary(session, objectID, objectType, memberID, domainID=None, labels=None, systemLabels=None, removeExisting=False, cache=None):
    ## Get the parent id for the object
    parentID = None
    if objectType == 'domain':
        ## Check if domain artifact exists
        domain = _getDomainOrPseudodomain(session, objectID)
        if not domain:
            raise Exception(_('Could not find domain for id: %s' % objectID))
        artifact = _getArtifactForDomain(session, domain, createNew=True)
        objectID = artifact.revisions[0].id
        objectType = 'artifactRevision'

    if objectType == 'artifactRevision':
        ar = _getArtifactRevisionByID(session, id=objectID)
        parentID = ar.artifactID
        if cache:
            cache.personalCache.invalidate(memberID, parentID, ar.id)
    elif objectType == 'resourceRevision':
        rr = _getResourceRevisionByID(session, id=objectID)
        if not rr.resource.isAttachment:
            raise Exception((_(u"Cannot add non-attachment resources to library")).encode("utf-8"))
        parentID = rr.resourceID
    elif objectType == 'domain':
        domain = _getBrowseTermByID(session, id=int(objectID), typeName='domain')
        parentID = domain.id

    if not parentID:
        raise Exception((_(u"Cannot find parent for object [%(objectID)d] type [%(objectType)s]")  % {"objectID":objectID,"objectType": objectType}).encode("utf-8"))

    if not domainID:
        domainID = _getNullPseudoDomainID(session)

    if labels:
        labelsLwr = [ x.lower() for x in labels ]
    else:
        labelsLwr = []

    libObject = None
    labelIDs = []
    libObj = _getMemberLibraryObjectByParentID(session, objectType=objectType, parentID=parentID, memberID=memberID, domainID=domainID)
    if libObj:
        log.debug("Got library object for parentID: %d, libObj.objectID: %d, objectID: %d" % (parentID, libObj.objectID, objectID))
        labelObjs = _getLabelsForMemberLibraryObject(session, libraryObjectID=libObj.id)
        if libObj.objectID != objectID:
            ## Save the labels
            labelObjs = _getLabelsForMemberLibraryObject(session, libraryObjectID=libObj.id)
            for l in labelObjs:
                labelIDs.append(l.id)
            log.debug("Deleting object with id: %s" % libObj.objectID)
            session.delete(libObj)
            session.flush()
        else:
            if model.MEMBER_LABEL_ARCHIVED in labelsLwr:
                for l in labelObjs:
                    if l.sticky:
                        raise Exception((_(u"Cannot archive sticky object [%(objectID)d] type [%(objectType)s]") % {"objectID":objectID,"objectType": objectType}).encode("uft-8"))
            libObject = libObj

    if removeExisting:
        _removeAllLabelsForMemberLibraryObject(session, objectID, objectType, memberID, domainID)
        session.flush()

    if not libObject:
        nullDomainID = _getNullPseudoDomainID(session)
        kwargs = {
                'objectID': objectID,
                'objectType': objectType,
                'memberID': memberID,
                'parentID': parentID,
                'domainID': domainID if domainID else nullDomainID,
                'created': datetime.now(),
                }

        libObject = model.MemberLibraryObject(**kwargs)
        session.add(libObject)
        session.flush()
        if labelIDs:
            for labelID in labelIDs:
                session.add(model.MemberLibraryObjectHasLabel(libraryObjectID=libObject.id, labelID=labelID))

    if labelsLwr:
        ## If 'archived' is one of the labels, we remove all others
        if model.MEMBER_LABEL_ARCHIVED in labelsLwr:
            labels = [model.MEMBER_LABEL_ARCHIVED]
        for label in labels:
            _createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, False, libObj=libObject, domainID=domainID)
    if systemLabels:
        for label in systemLabels:
            _createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, True, libObj=libObject, domainID=domainID)

    return libObject

def _getNullPseudoDomainID(session):
    nullDomain = _getBrowseTermByEncodedID(session, encodedID='UGC.UBR.000.0000')
    return nullDomain.id

@_transactional(readOnly=True)
def getMemberLibraryObjectByParentID(session, objectType, parentID, memberID, domainID=None):
    return _getMemberLibraryObjectByParentID(session, objectType, parentID, memberID, domainID=domainID)

def _getMemberLibraryObjectByParentID(session, objectType, parentID, memberID, domainID=None):
    if not domainID:
        domainID = _getNullPseudoDomainID(session)
    query = session.query(model.MemberLibraryObject)
    query = query.filter(and_(
        model.MemberLibraryObject.objectType == objectType,
        model.MemberLibraryObject.parentID == parentID,
        model.MemberLibraryObject.memberID == memberID,
        model.MemberLibraryObject.domainID == domainID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getMemberLibraryObjectsByParentID(session, objectType, parentID, memberID=None):
    query = session.query(model.MemberLibraryObject)
    query = query.filter(and_(
        model.MemberLibraryObject.objectType == objectType,
        model.MemberLibraryObject.parentID == parentID))
    if memberID:
        query = query.filter(model.MemberLibraryObject.memberID == memberID)
    return query.all()

@_transactional()
def removeObjectFromLibrary(session, objectID, objectType, memberID, domainID=None, cache=None):
    return _removeObjectFromLibrary(session, objectID, objectType, memberID, domainID, cache)

def _removeObjectFromLibrary(session, objectID, objectType, memberID, domainID=None, cache=None):
    libObject = _getMemberLibraryObject(session, memberID, objectID, objectType, domainID, update=True)
    parentID = libObject.parentID
    if objectType == 'domain':
        domain, artifact, objectID, objectType = _convertDomainIDToArtifactRevision(session, objectID)

    if objectType == 'artifactRevision':
        artifact = _getUnique(session, model.Artifact, 'id', int(parentID))
        if artifact.creatorID == memberID:
            raise Exception((_(u'Cannot remove own object from library')).encode("utf-8"))
        if cache:
            cache.personalCache.invalidate(memberID, artifact.id, objectID)
    elif objectType == 'resourceRevision':
        resource = _getUnique(session, model.Resource, 'id', int(parentID))
        if resource.ownerID == memberID:
            raise Exception((_(u'Cannot remove own object from library')).encode("utf-8"))
    else:
        raise Exception((_(u'Unsupported objectType: %(objectType)s')  % {"objectType":objectType}).encode("utf-8"))

    if not libObject:
        raise Exception((_(u'No such object id %(objectID)d of type %(objectType)s for memberID: %(memberID)d')  % {"objectID":objectID,"objectType": objectType,"memberID": memberID}).encode("utf-8"))
    if libObject.labels:
        libObject.labels = []
    session.delete(libObject)
    return parentID

## To be called when an artifact or resource is deleted
def _deleteMemberLibraryObjectsByParentID(session, parentID):
    query = session.query(model.MemberLibraryObject)
    query = query.filter(model.MemberLibraryObject.parentID == parentID)
    for obj in query.all():
        obj.labels = []
        session.delete(obj)

@_transactional()
def assignLabelsToMemberLibraryObject(session, objectID, objectType, memberID, labels, systemLabels=False, domainID=None):
    objs = []
    for label in labels:
        obj = _createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel=systemLabels, domainID=domainID)
        objs.append(obj)
    return objs

@_transactional()
def assignLabelToMemberLibraryObjects(session, objectIDs, objectTypes, memberID, label, systemLabel=False, domainIDs=None):
    """
        Assign a label to multiple objects
    """
    objs = []
    for i in range(0, len(objectIDs)):
        domainID = None
        if domainIDs:
            domainID = domainIDs[i]
        objs.append(_createMemberLibraryObjectHasLabel(session, objectIDs[i], objectTypes[i], memberID, label, systemLabel, domainID=domainID))
    return objs

@_transactional()
def createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel=False, domainID=None):
    return _createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel, domainID=domainID)

def _createMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel=False, libObj=None, domainID=None):
    if not systemLabel:
        lbl = _getMemberLabelByName(session, memberID=memberID, label=label)
        if not lbl:
            lbl = _createMemberLabel(session, memberID, label)
            session.flush()
    else:
        lbl = _getMemberLabelByName(session, memberID=memberID, label=label, systemLabel=True)

    if not libObj:
        libObj = _getMemberLibraryObject(session, memberID, objectID, objectType, domainID=domainID, update=True)
    obj = _getMemberLibraryObjectHasLabel(session, libraryObjectID=libObj.id, labelID=lbl.id)
    if not obj:
        if lbl.label.lower() == model.MEMBER_LABEL_ARCHIVED and not lbl.systemLabel:
            ## Clear all labels
            libObj.labels = []
        kwargs = {
                'libraryObjectID': libObj.id,
                'labelID': lbl.id,
                }
        obj = model.MemberLibraryObjectHasLabel(**kwargs)
        session.add(obj)
    return obj

@_transactional()
def deleteMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel=False, domainID=None):
    _deleteMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel, domainID=domainID)

def _deleteMemberLibraryObjectHasLabel(session, objectID, objectType, memberID, label, systemLabel=False, domainID=None):
    lbl = _getMemberLabelByName(session, memberID=memberID, label=label, systemLabel=systemLabel)
    obj = _getMemberLibraryObject(session, memberID, objectID, objectType, domainID, update=True)
    _deleteMemberLibraryObjectHasLabelByID(session, obj.id, lbl.id)

def _removeAllLabelsForMemberLibraryObject(session, objectID, objectType, memberID, domainID=None):
    obj = _getMemberLibraryObject(session, memberID, objectID, objectType, domainID, update=True)
    if not obj:
        return
    query = session.query(model.MemberLibraryObjectHasLabel)
    query = query.filter(model.MemberLibraryObjectHasLabel.libraryObjectID == obj.id)
    for row in query.all():
        session.delete(row)

@_transactional()
def deleteMemberLibraryObjectHasLabelByID(session, libraryObjectID, labelID):
    _deleteMemberLibraryObjectHasLabelByID(session, libraryObjectID, labelID)

def _deleteMemberLibraryObjectHasLabelByID(session, libraryObjectID, labelID):
    o = _getMemberLibraryObjectHasLabel(session, libraryObjectID, labelID)
    if not o:
        raise Exception((_(u'Library Object [%(libraryObjectID)d] has no such label: %(labelID)s')  % {"libraryObjectID":libraryObjectID,"labelID": labelID}).encode("utf-8"))
    session.delete(o)

@_transactional()
def deleteLabelFromMemberLibraryObjects(session, objectIDs, objectTypes, memberID, label, systemLabel=False, domainIDs=None):
    for i in range(0, len(objectIDs)):
        domainID = None
        if domainIDs:
            domainID = domainIDs[i]
        _deleteMemberLibraryObjectHasLabel(session, objectIDs[i], objectTypes[i], memberID, label, systemLabel, domainID=domainID)

@_transactional()
def changeMemberLibraryObjectsLabel(session, objectIDs, objectTypes, memberID, oldLabel, newLabel, systemLabel=False, domainIDs=None):
    labelObjs = [None, None]
    labels = [ oldLabel, newLabel ]
    for i in range(0, len(labels)):
        if not systemLabel:
            labelObjs[i] = _getMemberLabelByName(session, memberID=memberID, label=labels[i])
            if not labelObjs[i] and i == 1:
                labelObjs[i] = _createMemberLabel(session, memberID, labels[i])
                session.flush()
        else:
            labelObjs[i] = _getMemberLabelByName(session, memberID=memberID, label=labels[i], systemLabel=True)
        if not labelObjs[i]:
            raise Exception((_(u"No such label by name [%(labels[i])s]")  % {"labels[i]":labels[i]}).encode("utf-8"))

    for i in range(0, len(objectIDs)):
        objectID = objectIDs[i]
        objectType = objectTypes[i]
        domainID = None
        if domainIDs:
            domainID = domainIDs[i]

        libObj = _getMemberLibraryObject(session, memberID, objectID, objectType, domainID)

        ## Remove label
        _deleteMemberLibraryObjectHasLabelByID(session, libraryObjectID=libObj.id, labelID=labelObjs[0].id)

        ## Add label
        kwargs = {
                'libraryObjectID': libObj.id,
                'labelID': labelObjs[1].id,
                }
        obj = model.MemberLibraryObjectHasLabel(**kwargs)
        session.add(obj)

@_transactional(readOnly=True)
def getMemberLibraryObjectHasLabel(session, libraryObjectID, labelID):
    return _getMemberLibraryObjectHasLabel(session, libraryObjectID, labelID)

def _getMemberLibraryObjectHasLabel(session, libraryObjectID, labelID):
    query = session.query(model.MemberLibraryObjectHasLabel)
    query = query.filter(and_(
        model.MemberLibraryObjectHasLabel.libraryObjectID == libraryObjectID,
        model.MemberLibraryObjectHasLabel.labelID == labelID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getLabelsForMemberLibraryObject(session, libraryObjectID):
    return _getLabelsForMemberLibraryObject(session, libraryObjectID)

def _getLabelsForMemberLibraryObject(session, libraryObjectID):
    query = session.query(model.MemberLibraryObjectHasLabel)
    query = query.filter(model.MemberLibraryObjectHasLabel.libraryObjectID == libraryObjectID)
    labels = []
    for r in query.all():
        labels.append(r.label)
    return labels

@_transactional(readOnly=True)
def getLabelsForArtifactRevisionIDs(session, memberID, artifactRevisionIDs):
    return _getLabelsForArtifactRevisionIDs(session, memberID, artifactRevisionIDs)

def _getLabelsForArtifactRevisionIDs(session, memberID, artifactRevisionIDs):
    query = session.query(model.MemberLibraryArtifactRevisionHasLabel.artifactID, model.MemberLibraryObjectHasLabel)
    query = query.filter(model.MemberLibraryArtifactRevisionHasLabel.libraryObjectID == model.MemberLibraryObjectHasLabel.libraryObjectID)
    query = query.filter(model.MemberLibraryArtifactRevisionHasLabel.memberID == memberID)
    query = query.filter(model.MemberLibraryArtifactRevisionHasLabel.artifactRevisionID.in_(artifactRevisionIDs))
    labels = []
    for artifactID, r in query.all():
        labels.append((artifactID, r.label))
    return labels

@_transactional(readOnly=True)
def getMemberLabelByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.MemberLabel, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getMemberLabelByName(session, memberID, label, systemLabel=False):
    return _getMemberLabelByName(session, memberID, label, systemLabel)

def _getMemberLabelByName(session, memberID, label, systemLabel=False):
    query = session.query(model.MemberLabel)
    query = query.filter(model.MemberLabel.systemLabel == systemLabel)
    if not systemLabel:
        query = query.filter(model.MemberLabel.memberID == memberID)
    query = query.filter(model.MemberLabel.label == label)
    return _queryOne(query)

@_transactional(readOnly=True)
def getSystemLabelByName(session, label):
    return _getSystemLabelByName(session, label)

def _getSystemLabelByName(session, label):
    return _getMemberLabelByName(session, None, label, True)

@_transactional()
def createMemberLabel(session, memberID, label, systemLabel=False):
    return _createMemberLabel(session, memberID, label, systemLabel)

def _createMemberLabel(session, memberID, label, systemLabel=False):
    query = session.query(model.MemberLabel)
    query = query.filter(
                or_(
                    and_(
                        model.MemberLabel.systemLabel == True,
                        model.MemberLabel.label == label),
                    and_(
                        model.MemberLabel.systemLabel == False,
                        model.MemberLabel.memberID == memberID,
                        model.MemberLabel.label == label)))
    if query.first():
        raise ex.AlreadyExistsException((_(u"A label already exists for this name: %(label)s")  % {"label":label}).encode("utf-8"))

    kwargs = {
            'label': label,
            'systemLabel': systemLabel,
            'created': datetime.now(),
            }
    if not systemLabel:
        kwargs['memberID'] = memberID
    memberLabel = model.MemberLabel(**kwargs)
    session.add(memberLabel)
    return memberLabel

@_transactional()
def updateMemberLabel(session, memberID, label, newLabel, systemLabel=False):
    labelObj = _getMemberLabelByName(session, memberID, label, systemLabel)
    if not labelObj:
        raise Exception((_(u'No such label: %(label)s')  % {"label":label}).encode("utf-8"))
    if labelObj.label.lower() in model.PROTECTED_MEMBER_LABELS:
        raise Exception((_(u'Cannot delete protected label: %(labelObj.label)s')  % {"labelObj.label":labelObj.label}).encode("utf-8"))
    query = session.query(model.MemberLabel)
    query = query.filter(and_(
            model.MemberLabel.memberID == None,
            model.MemberLabel.label == newLabel))
    if query.first():
        raise Exception((_(u"A system label already exists for this name: %(newLabel)s")  % {"newLabel":newLabel}).encode("utf-8"))

    labelObj.label = newLabel
    session.add(labelObj)
    return labelObj

@_transactional()
def deleteMemberLabel(session, memberID, label, systemLabel=False):
    return _deleteMemberLabel(session, memberID, label, systemLabel)

def _deleteMemberLabel(session, memberID, label, systemLabel=False):
    memberLabel = _getMemberLabelByName(session, memberID, label, systemLabel)
    if not memberLabel:
        raise Exception((_(u'Invalid label %(label)s for memberID: %(memberID)d')  % {"label":label,"memberID": memberID}).encode("utf-8"))
    if memberLabel.label.lower() in model.PROTECTED_MEMBER_LABELS:
        raise Exception((_(u'Cannot delete protected label: %(memberLabel.label)s')  % {"memberLabel.label":memberLabel.label}).encode("utf-8"))
    query = session.query(model.MemberLibraryObjectHasLabel)
    query = query.filter(model.MemberLibraryObjectHasLabel.labelID == memberLabel.id)
    for row in query.all():
        session.delete(row)
    session.delete(memberLabel)

def _deleteMemberLabelByID(session, memberID, labelID):
    try:
        labelID = long(labelID)
        query = session.query(model.MemberLabel)
        query = query.filter(model.MemberLabel.memberID == memberID)
        query = query.filter(model.MemberLabel.id == labelID)
        query = query.filter(model.MemberLabel.systemLabel == False)
        memberLabel = _queryOne(query)
        if not memberLabel:
            raise Exception((_(u'Invalid labelID %(labelID)d for memberID: %(memberID)d')  % {"labelID":labelID,"memberID": memberID}).encode("utf-8"))
        if memberLabel.label.lower() in model.PROTECTED_MEMBER_LABELS:
            raise Exception((_(u'Cannot delete protected label: %(memberLabel.label)s')  % {"memberLabel.label":memberLabel.label}).encode("utf-8"))
        session.delete(memberLabel)
    except ValueError:
        pass

##############################################
# Standard Correlations APIs
##############################################

@_transactional(readOnly=True)
def getSubjectsWithCorrelations(session, grade=None, standardBoardID=None, gradeID=None):
    query = session.query(model.ArtifactsStandardsGradesAndBrowseTerms.termID,
            model.ArtifactsStandardsGradesAndBrowseTerms.termName).distinct()
    query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.termTypeID == 3)
    if grade:
        query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.gradeName == grade)
    if gradeID:
        query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.gradeID == gradeID)
    if standardBoardID:
        query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.boardID == standardBoardID)
    query = query.order_by(model.ArtifactsStandardsGradesAndBrowseTerms.termName)
    subjects = []
    for r in query.all():
        subjects.append({'id': r.termID, 'name': r.termName.lower()})
    return subjects

@_transactional(readOnly=True)
def getGradesWithCorrelations(session, subject=None, standardBoardID=None):
    query = session.query(model.Grade.id, model.Grade.name).distinct()
    query = query.prefix_with('SQL_CACHE')
    query = query.join(model.StandardHasGrades, model.StandardHasGrades.gradeID == model.Grade.id)
    query = query.join(model.ArtifactRevisionHasStandards, model.ArtifactRevisionHasStandards.standardID == model.StandardHasGrades.standardID)

    if subject:
        query = query.join(model.ArtifactRevision, model.ArtifactRevisionHasStandards.artifactRevisionID == model.ArtifactRevision.id)
        query = query.join(model.ArtifactHasBrowseTerms, model.ArtifactHasBrowseTerms.artifactID == model.ArtifactRevision.artifactID)
        query = query.join(model.BrowseTerm, and_(model.ArtifactHasBrowseTerms.browseTermID == model.BrowseTerm.id, model.BrowseTerm.termTypeID == 3))
        query = query.filter(model.BrowseTerm.name == subject)
    if standardBoardID:
        query = query.join(model.Standard, model.Standard.id == model.ArtifactRevisionHasStandards.standardID)
        query = query.join(model.StandardBoard, model.StandardBoard.id == model.Standard.standardBoardID)
        query = query.filter(model.StandardBoard.id == standardBoardID)
    query = query.order_by(func.abs(model.Grade.name))
    log.info("Query: %s" % query)
    grades = []
    for r in query.all():
        grades.append({'id': r.id, 'name': r.name})
    return grades

@_transactional(readOnly=True)
def getGradesWithCorrelations_OLD(session, subject=None, standardBoardID=None):
    query = session.query(model.ArtifactsStandardsGradesAndBrowseTerms.gradeID,
            model.ArtifactsStandardsGradesAndBrowseTerms.gradeName).distinct()
    if subject:
        query = query.filter(and_(model.ArtifactsStandardsGradesAndBrowseTerms.termTypeID == 3,
            model.ArtifactsStandardsGradesAndBrowseTerms.termName == subject))
    if standardBoardID:
        query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.boardID == standardBoardID)
    query = query.order_by(func.abs(model.ArtifactsStandardsGradesAndBrowseTerms.gradeName))
    log.info("Query: %s" % query)
    grades = []
    for r in query.all():
        grades.append({'id': r.gradeID, 'name': r.gradeName})
    return grades

@_transactional(readOnly=True)
def getStandardBoardsWithCorrelations(session, subject=None, grade=None, includeSequence=False):
    if includeSequence:
        query = session.query(model.ArtifactsStandardsGradesAndBrowseTerms.boardID,
            model.ArtifactsStandardsGradesAndBrowseTerms.boardName,
            model.ArtifactsStandardsGradesAndBrowseTerms.boardLongName,
            model.ArtifactsStandardsGradesAndBrowseTerms.countryID,
            model.ArtifactsStandardsGradesAndBrowseTerms.sequence).distinct()
    else:
        query = session.query(model.ArtifactsStandardsGradesAndBrowseTerms.boardID,
            model.ArtifactsStandardsGradesAndBrowseTerms.boardName,
            model.ArtifactsStandardsGradesAndBrowseTerms.boardLongName,
            model.ArtifactsStandardsGradesAndBrowseTerms.countryID).distinct()
    if subject:
        query = query.filter(and_(model.ArtifactsStandardsGradesAndBrowseTerms.termTypeID == 3,
            model.ArtifactsStandardsGradesAndBrowseTerms.termName == subject))
    if grade:
        query = query.filter(model.ArtifactsStandardsGradesAndBrowseTerms.gradeName == grade)
    query = query.order_by(model.ArtifactsStandardsGradesAndBrowseTerms.sequence, model.ArtifactsStandardsGradesAndBrowseTerms.boardLongName)
    boards = []
    for r in query.all():
        board = {'id': r.boardID, 'name': r.boardName, 'longname': r.boardLongName, 'countryID': r.countryID}
        if includeSequence:
            board['sequence'] = r.sequence
        boards.append(board)

    return boards

@_transactional(readOnly=True)
def getFrom1xBookMember(session, memberID=None, email=None):
    query = session.query(model.From1xBookMemberInfo)
    query = query.prefix_with('SQL_CACHE')
    if email:
        query = query.filter_by(email=email)
    else:
        query = query.filter_by(memberID=memberID)
    return _queryOne(query)

from1xBookMemberAttrMap = {
    'memberID': model.From1xBookMemberInfo.memberID,
    'memberID1x': model.From1xBookMemberInfo.memberID1x,
    'taskID': model.From1xBookMemberInfo.taskID,
    'started': model.From1xBookMemberInfo.started,
    'migrated': model.From1xBookMemberInfo.migrated,
    'status': model.From1xBookMemberInfo.status,
    'email': model.From1xBookMemberInfo.email,
}

@_transactional(readOnly=True)
def getFrom1xBookMembers(session, sorting=None, filterDict={}, pageNum=0, pageSize=0):
    query = session.query(model.From1xBookMemberInfo)
    query = query.prefix_with('SQL_CACHE')

    if not sorting:
        field = 'memberID'
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = sList[0]
        order = sList[1] if len(sList) > 1 else 'asc'
    attribute = from1xBookMemberAttrMap.get(field)
    if attribute is None:
        raise ex.InvalidArgumentException((_(u'Invalid sorting field: %(field)s')  % {"field":field}).encode("utf-8"))
    if order == 'asc':
        query = query.order_by(asc(attribute))
    else:
        query = query.order_by(desc(attribute))

    filterKeys = filterDict.keys()
    for key in filterKeys:
        value = filterDict[key]
        if value.lower() in ('none', 'null'):
            value = None
        if key == 'status':
            query = query.filter(model.From1xBookMemberInfo.status == value)
        elif key == 'email':
            query = query.filter(model.From1xBookMemberInfo.email == value)

    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getFrom1xBookMembersByMemberID(session, memberID):
    return _getUnique(session, model.From1xBookMember, 'memberID', memberID)

@_transactional()
def updateFrom1xBookMembers(session, **kwargs):
    _checkAttributes(['memberID'], **kwargs)

    bm = _getUnique(session, model.From1xBookMember, 'memberID', kwargs['memberID'])
    if kwargs.has_key('taskID'):
        bm.taskID = kwargs['taskID']
    if kwargs.has_key('started'):
        bm.started = kwargs['started']
    if kwargs.has_key('migrated'):
        bm.migrated = kwargs['migrated']
    if kwargs.has_key('status'):
        bm.status = kwargs['status']
    session.add(bm)
    return bm

@_transactional(readOnly=True)
def getFrom1xBook(session, fid=None, artifactID=None):
    query = session.query(model.From1xBook)
    query = query.prefix_with('SQL_CACHE')
    if artifactID is not None:
        query = query.filter_by(artifactID=artifactID)
    else:
        query = query.order_by(model.From1xBook.artifactID)
    if fid is not None:
        query = query.filter_by(fid=fid)
    else:
        query = query.order_by(model.From1xBook.fid)
    return _queryOne(query)

@_transactional(readOnly=True)
def getFrom1xBooks(session, memberID=None, pageNum=0, pageSize=0):
    query = session.query(model.From1xBook)
    query = query.prefix_with('SQL_CACHE')
    if memberID is not None:
        query = query.filter_by(memberID=memberID)
    else:
        query = query.order_by(model.From1xBook.memberID)
    query = query.order_by(model.From1xBook.fid)
    query = query.order_by(model.From1xBook.artifactID)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getFrom1xChapter(session, cid, memberID):
    query = session.query(model.From1xChapter)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(cid=cid)
    query = query.filter_by(memberID=memberID)
    return _queryOne(query)

##########################################
# Standard Correlations related APIs
##########################################
@_transactional()
def createDomainHasStandard(session, domainID, standardID):
    ds = model.DomainHasStandard(domainID=domainID, standardID=standardID)
    session.add(ds)
    return ds

@_transactional()
def deleteDomainHasStandard(session, domainID, standardID):
    query = session.query(model.DomainHasStandard)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(and_(
        model.DomainHasStandard.domainID == domainID,
        model.DomainHasStandard.standardID == standardID))
    ds = _queryOne(query)
    if ds:
        session.delete(ds)

@_transactional()
def deleteDomainsForStandard(session, standardID):
    query = session.query(model.DomainHasStandard)
    query = query.prefix_with('SQL_CACHE')
    query.filter(model.DomainHasStandard.standardID == standardID)
    for r in query.all():
        session.delete(r)

@_transactional(readOnly=True)
def getDomainHasStandard(session, domainID, standardID):
    query = session.query(model.DomainHasStandard)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter(and_(
        model.DomainHasStandard.domainID == domainID,
        model.DomainHasStandard.standardID == standardID))
    return _queryOne(query)

@_transactional(readOnly=True)
def getCorrelatedStandardForDomain(session, artifactIDs, standardBoardID=None):
    return _getCorrelatedStandardForDomain(session, artifactIDs, standardBoardID)

def _getCorrelatedStandardForDomain(session, artifactIDs, standardBoardID=None):
    query = session.query(model.ArtifactDomainAndStandard)
    query = query.filter(model.ArtifactDomainAndStandard.artifactID.in_(artifactIDs))
    if standardBoardID:
        query = query.filter(model.ArtifactDomainAndStandard.boardID == standardBoardID)
    return query.all()

@_transactional(readOnly=True)
def getCorrelatedStandardBoardsForArtifacts(session, artifactIDs):
    boardIDs = []
    if artifactIDs:
        query = session.query(model.ArtifactDomainAndStandard.boardID).distinct()
        query = query.filter(model.ArtifactDomainAndStandard.artifactID.in_(artifactIDs))
        boardIDs = [ r.boardID for r in query.all() ]
    if boardIDs:
        query = session.query(model.StandardBoard)
        query = query.prefix_with('SQL_CACHE')
        query = query.filter(model.StandardBoard.id.in_(boardIDs))
        return query.all()
    return []

@_transactional(readOnly=True)
def getSubjectsWithCorrelationsForDomain(session, standardBoardID=None, gradeID=None):
    query = session.query(model.ArtifactDomainsStandardsGradesAndBrowseTerms.subject).distinct()

    if standardBoardID:
        query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardID == standardBoardID)
    if gradeID:
        query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.gradeID == gradeID)
    query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.termTypeID == 4)
    query = query.order_by(model.ArtifactDomainsStandardsGradesAndBrowseTerms.termName)
    subjects = []
    for r in query.all():
        subjects.append(r.subject.upper())
    subNames = []
    for s in subjects:
        bt = _getBrowseTermByEncodedID(session, encodedID=s)
        if bt:
            subNames.append({'name': bt.name.lower()})
    return subNames

def _getDomainEIDsForSubject(session, subject):
    domains = []
    domain = _getBrowseTermByIDOrName(session, idOrName=subject, type=4)
    if domain:
        domains.append(domain.encodedID)
        mappings = model.CANONICAL_DOMAIN_MAPPING.get(domain.encodedID)
        if mappings:
            for mapping in mappings:
                domains.append(mapping)
    return domains

@_transactional(readOnly=True)
def getGradesWithCorrelationsForDomain(session, subject=None, standardBoardID=None):
    ## Get domain term for subject
    query = session.query(model.ArtifactDomainsStandardsGradesAndBrowseTerms.gradeID,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.gradeName).distinct()
    if subject:
        domains = _getDomainEIDsForSubject(session, subject)
        log.debug("Domains: %s" % domains)
        query = query.filter(and_(model.ArtifactDomainsStandardsGradesAndBrowseTerms.termTypeID == 4,
                    or_(*map(lambda eid: model.ArtifactDomainsStandardsGradesAndBrowseTerms.subject == eid, domains))))
    if standardBoardID:
        query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardID == standardBoardID)
    query = query.order_by(func.abs(model.ArtifactDomainsStandardsGradesAndBrowseTerms.gradeName))
    grades = []
    for r in query.all():
        grades.append({'id': r.gradeID, 'name': r.gradeName})
    return grades

@_transactional(readOnly=True)
def getStandardBoardsWithCorrelationsForDomain(session, subject=None, grade=None, includeSequence=False):
    if includeSequence:
        query = session.query(model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardID,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardName,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardLongName,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.countryID,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.sequence).distinct()
    else:
        query = session.query(model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardID,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardName,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardLongName,
            model.ArtifactDomainsStandardsGradesAndBrowseTerms.countryID).distinct()
    if subject:
        domains = _getDomainEIDsForSubject(session, subject)
        log.info("Domains: %s" % domains)
        query = query.filter(and_(model.ArtifactDomainsStandardsGradesAndBrowseTerms.termTypeID == 4,
                    or_(*map(lambda eid: model.ArtifactDomainsStandardsGradesAndBrowseTerms.subject == eid, domains))))
    if grade:
        query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.gradeName == grade)
    query = query.order_by(model.ArtifactDomainsStandardsGradesAndBrowseTerms.sequence, model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardLongName)
    boards = []
    for r in query.all():
        board = {'id': r.boardID, 'name': r.boardName, 'longname': r.boardLongName, 'countryID': r.countryID}
        if includeSequence:
            board['sequence'] = r.sequence
        boards.append(board)

    return boards

@_transactional(readOnly=True)
def getCorrelatedStandardIDsForDomain(session, standardBoardID, domainEID):
    query = session.query(model.ArtifactDomainsStandardsGradesAndBrowseTerms.standardID).distinct()
    query = query.filter(and_(
        model.ArtifactDomainsStandardsGradesAndBrowseTerms.encodedID.like('%s%%' % h.getCanonicalEncodedID(domainEID)),
        model.ArtifactDomainsStandardsGradesAndBrowseTerms.encodedID.op('regexp')(getRegExpForEncodedID(domainEID))))
    query = query.filter(model.ArtifactDomainsStandardsGradesAndBrowseTerms.boardID==standardBoardID)
    query = query.order_by(model.ArtifactDomainsStandardsGradesAndBrowseTerms.standardID)
    return query.all()

@_transactional(readOnly=True)
def getTaskBookMetadatabyISBN(session, ISBN):
    return _getUnique(session, model.BMS_BookMetadata, 'ISBN', ISBN)

#########################################
# Group-related APIs
#########################################
@_transactional()
def createGroup(session, **kwargs):
    return _createGroup(session, **kwargs)

def _createGroup(session, **kwargs):
    """
        Create a new Group.
    """
    _checkAttributes([ 'groupName', 'creator'], **kwargs)
    groupName = kwargs['groupName']
    creator = kwargs['creator']
    del kwargs['creator']
    groupScope = kwargs.get('groupScope','closed')
    groupType = kwargs.get('groupType','class')
    if groupName is None or creator is None:
        return None

    kwargs['name'] = kwargs['groupName']
    if groupType != 'editing':
        kwargs['handle'] = _getUniqueGroupHandle(session, creator, kwargs['name'])
    del(kwargs['groupName'])
    description = kwargs.get('groupDescription')
    kwargs['description'] = description
    if description:
        del(kwargs['groupDescription'])
    if groupScope == 'closed':
        kwargs['accessCode'] = _getUniqueGroupAccessCode(session)
    kwargs['parentID'] = 1
    kwargs['isActive'] = 1
    kwargs['isVisible'] = True
    kwargs['groupScope'] = groupScope
    kwargs['groupType'] = groupType
    kwargs['creatorID'] = creator.id
    if not kwargs.has_key('origin'):
        kwargs['origin'] = 'ck-12'
    # Set updateTime for forums.
    if groupType == 'public-forum':
        creationTime = datetime.now()
        kwargs['creationTime'] = creationTime
        kwargs['updateTime'] = creationTime

    group = model.Group(**kwargs)
    session.add(group)
    session.flush()
    d = {'memberID':creator.id, 'groupID':group.id, 'roleID':15, 'statusID':2, 'disableNotification':0}
    _createGroupHasMember(session, **d)
    session.flush()
    return group

@_transactional()
def addOrUpdateGroupSubjects(session, **kwargs):
    return _addOrUpdateGroupSubjects(session, **kwargs)

def _addOrUpdateGroupSubjects(session, **kwargs):
    _checkAttributes(['groupID', 'subjects'], **kwargs)
    group = _getGroupByID(session, kwargs['groupID'])

    if group is None:
        return None

    subjectDict = _getSubjectsDict(session)
    groupSubjects = []
    for subjectName in kwargs['subjects']:
        subject = subjectDict.get(subjectName)
        if subject:
            #groupSubjects.append(**{'groupID': group.id, 'subjectID': subject.id})
            groupSubjects.append(subject)

    group.subjects = groupSubjects
    session.add(group)
    groupSubjects = [subject.asDict() for subject in groupSubjects]
    return groupSubjects

@_transactional()
def addOrUpdateGroupGrades(session, **kwargs):
    return _addOrUpdateGroupGrades(session, **kwargs)

def _addOrUpdateGroupGrades(session, **kwargs):
    _checkAttributes(['groupID', 'gradeIDs'], **kwargs)
    group = _getGroupByID(session, kwargs['groupID'])

    if group is None:
        return None

    groupGrades = []
    for gradeID in kwargs['gradeIDs']:
        grade = _getGradeByID(session, gradeID)
        if grade:
            groupGrades.append(grade)

    group.grades = groupGrades
    session.add(group)
    groupGrades = [grade.asDict() for grade in groupGrades]
    return groupGrades


@_transactional()
def addOrUpdateForumMetadata(session, **kwargs):
    return _addOrUpdateForumMetadata(session, **kwargs)


def _addOrUpdateForumMetadata(session, **kwargs):
    _checkAttributes(['groupID'], **kwargs)
    group = _getGroupByID(session, kwargs['groupID'])

    if group is None:
        return None

    roleIDs = []
    if 'taggedRole' in kwargs and kwargs['taggedRole']:
        for role in kwargs['taggedRole'].split(','):
            roleID = _getMemberRoleIDByName(session, role)
            roleIDs.append(roleID)

    existingRolesDict = {}
    query = session.query(model.ForumMetadata)
    query = query.filter_by(groupID=group.id)
    additionalMetadata = query.all()

    for eachMetadata in additionalMetadata:
        if eachMetadata.tagLine != kwargs['tagLine']:
            eachMetadata.tagLine = kwargs['tagLine']
        if eachMetadata.taggedWithRoleID:
            existingRolesDict[int(eachMetadata.taggedWithRoleID)] = eachMetadata
        if (eachMetadata.taggedWithRoleID is None and roleIDs) or eachMetadata.taggedWithRoleID not in roleIDs:
            session.delete(eachMetadata)
            session.flush()

    for newRoleID in roleIDs:
        if newRoleID is None:
            fm = model.ForumMetadata(**{'groupID': kwargs['groupID'], 'taggedWithRoleID': None, 'tagLine': kwargs.get('tagLine', None)})
            session.add(fm)
        elif existingRolesDict.get(int(newRoleID)) is None:
            fm = model.ForumMetadata(**{'groupID': kwargs['groupID'], 'taggedWithRoleID': newRoleID, 'tagLine': kwargs.get('tagLine', None)})
            session.add(fm)

    if not roleIDs:
        fm = model.ForumMetadata(**{'groupID': kwargs['groupID'], 'taggedWithRoleID': None, 'tagLine': kwargs.get('tagLine', None)})
        session.add(fm)

    session.flush()

    return group


@_transactional()
def updateGroup(session, **kwargs):
    return _updateGroup(session, **kwargs)

def _updateGroup(session, **kwargs):
    """
        Update existing Group.
    """
    log.debug('update group: Begin update group')
    _checkAttributes([ 'group'], **kwargs)
    group = kwargs['group']
    log.debug('update group: group %s' % group)
    new_name = kwargs.get('newGroupName', None)
    #For QA activity, only update group updateTime field
    isQAActivity = kwargs.get('isQAActivity', False)
    if isQAActivity and group:
        group.updateTime = datetime.now()
        session.add(group)
        return group

    if group is None or not new_name:
        return None

    new_desc = kwargs['newGroupDesc']
    groupType = kwargs.get('groupType', 'class')
    groupScope = kwargs.get('groupScope', 'closed')
    doGenCode = kwargs.get('doGenCode', False)
    isActive = kwargs.get('isActive', None )
    isVisible = kwargs.get('isVisible', None )
    # XXX: Handle does not change once group is created
    #new_handle = model.title2Handle(new_name)
    if kwargs.has_key('origin'):
        group.origin = kwargs['origin']

    group.name = new_name
    #group.handle = new_handle
    if group.groupScope == 'open' and groupScope == 'closed':
        doGenCode = True
    if new_desc != None:
        group.description = new_desc
    if doGenCode:
        group.accessCode = _getUniqueGroupAccessCode(session)
    if isActive != None:
        group.isActive = isActive
    if isVisible != None:
        group.isVisible = isVisible
    elif groupScope == 'open':
        group.accessCode = None
    group.groupType = groupType
    group.groupScope = groupScope
    group.updateTime = datetime.now()
    if kwargs.get('resourceRevisionID') is not None:
        group.resourceRevisionID = kwargs.get('resourceRevisionID')
    log.debug('update groups: %s' %group)
    session.add(group)
    return group

def _getUniqueGroupHandle(session, creator, groupName):
    """
        Get unique handle
    """
    handle = model.title2Handle(groupName.lower())
    _handle = handle + '-' + h.getRandomString(3)
    while True:
        query = session.query(model.Group.handle)
        query = query.filter_by(handle=_handle)
        _h = query.first()
        if not _h:
            break
        _handle = handle + '-' + h.getRandomString(3)
    return _handle

def _getUniqueGroupAccessCode(session):
    """
        Get unique access code
    """
    accessCode = h.getRandomString(5)
    numTries = 100
    tries = 0
    while tries < numTries:
        query = session.query(model.Group.accessCode)
        query = query.filter_by(accessCode=accessCode)
        ac = query.first()
        if not ac:
            break
        accessCode = h.getRandomString(5)
        tries += 1
        if tries == numTries:
            raise Exception('Cannot get unique access code')
    return accessCode

@_transactional()
def deleteGroup(session, **kwargs):
    return _deleteGroup(session, **kwargs)

def _deleteGroup(session, **kwargs):
    """
        Delete existing Group.
    """
    _checkAttributes([ 'group','memberID'], **kwargs)
    group = kwargs['group']
    userID = kwargs['memberID']
    if group is None or userID is None:
        return None
    group_info = {}
    group_info['name'] = group.name
    group_info['id'] = group.id
    group_info['handle'] = group.handle
    group_info['exist_before_delete'] = False
    group_info['is_deleted'] = False
    try:
        if group:
            query = session.query(model.GroupHasMembers)
            query = query.filter(model.GroupHasMembers.groupID == group.id)
            query.delete()
            query = session.query(model.GroupActivity)
            query = query.filter(model.GroupActivity.groupID == group.id)
            query.delete()
            query = session.query(model.Notification)
            query = query.filter(model.Notification.groupID == group.id)
            query.delete()
            group_info['exist_before_delete'] = True
            session.delete(group)
            group_info['is_deleted'] = True
    except Exception as e:
        group_info['error_message'] = e.__str__()
    return group_info

@_transactional()
def softDeleteGroup(session, **kwargs):
    return _softDeleteGroup(session, **kwargs)

def _softDeleteGroup(session, **kwargs):
    """
        Mark Group as deleted.
    """
    _checkAttributes([ 'group','memberID'], **kwargs)
    group = kwargs['group']
    userID = kwargs['memberID']
    if group is None or userID is None:
        return None
    group_info = {}
    group_info['name'] = group.name
    group_info['id'] = group.id
    group_info['handle'] = group.handle
    group_info['exist_before_delete'] = False
    group_info['is_deleted'] = False

    try:
        group.name = '__DEL__%d__%s' % (group.id, group.name)
        group.isActive = 0
        group.updateTime = datetime.now()
        group_info['exist_before_delete'] = True
        group_info['is_deleted'] = True
        session.add(group)
        query = session.query(model.Notification)
        query = query.filter(model.Notification.groupID == group.id)
        query.delete()
    except Exception as e:
        group_info['error_message'] = e.__str__()
    return group_info

@_transactional(readOnly=True)
def getGroupsByCreatorID(session, creatorID, onlyActive=True):
    return _getGroupsByCreatorID(session, creatorID, onlyActive)

def _getGroupsByCreatorID(session, creatorID, onlyActive=True):
    query = session.query(model.Group)
    query = query.filter(model.Group.creatorID == creatorID)
    if onlyActive:
        query = query.filter(model.Group.isActive == 1)
    query = query.filter(model.Group.isVisible==1)
    return query.all()

@_transactional(readOnly=True)
def getGroupByNameAndCreator(session, groupName, creatorID):
    return _getGroupByNameAndCreator(session, groupName, creatorID)

def _getGroupByNameAndCreator(session, groupName, creatorID):
    query = session.query(model.Group)
    query = query.filter(and_(model.Group.name == groupName, model.Group.creatorID == creatorID))
    query = query.filter(model.Group.isActive==1)
    query = query.filter(model.Group.isVisible==1)
    group = _queryOne(query)
    if group:
        return group
    return None

@_transactional(readOnly=True)
def getGroupByNameAccessCode(session, groupName, accessCode):
    return _getGroupByNameAccessCode(session, groupName, accessCode)

def _getGroupByNameAccessCode(session, groupName, accessCode):
    """
        Get existing Group by name and accessCode.
    """
    if groupName is None or accessCode is None:
        return None
    query = session.query(model.Group)
    query = query.filter(and_(model.Group.name == groupName, model.Group.accessCode == accessCode))
    query = query.filter(model.Group.isActive==1)
    query = query.filter(model.Group.isVisible==1)
    group = _queryOne(query)
    if group:
        return group
    return None

''' Removing this interface because groupnames are no longer unique across system '''
'''
@_transactional(readOnly=True)
def getGroupByName(session, groupName):
    return _getGroupByName(session, groupName)

def _getGroupByName(session, groupName):
    """
        Get existing Group.
    """
    if groupName is None:
        return None
    group = _getUnique(session, model.Group, 'name', groupName)
    if group:
        return group
    return None
'''

@_transactional(readOnly=True)
def getGroupByCode(session, accessCode):
    return _getGroupByCode(session, accessCode)

def _getGroupByCode(session, accessCode):
    """
        Get existing Group.
    """
    if accessCode is None or accessCode is 'null':
        return None
    group = _getUnique(session, model.Group, 'accessCode', accessCode)
    if group and group.isActive:
        return group
    return None

@_transactional(readOnly=True)
def getGroupByID(session, id, onlyActive=True):
    return _getGroupByID(session, id, onlyActive=onlyActive)

def _getGroupByID(session, id, onlyActive=True):
    """
        Get existing Group.
    """
    if id is None:
        return None
    group = _getUnique(session, model.Group, 'id', id)
    if group:
        if not onlyActive or group.isActive:
            return group
    return None

@_transactional(readOnly=True)
def getGroupByHandle(session, handle):
    return _getGroupByHandle(session, handle)

def _getGroupByHandle(session, handle):
    """
        Get existing Group.
    """
    if handle is None:
        return None
    group = _getUnique(session, model.Group, 'handle', handle)
    if group and group.isActive:
        return group
    return None

@_transactional(readOnly=True)
def getGroupsByMemberID(session, **kwargs):
    return _getGroupsByMemberID(session, **kwargs)

@trace
def _getGroupsByMemberID(session, **kwargs):
    """
        Get existing Group.
    """
    _checkAttributes([ 'memberID'], **kwargs)
    memberID = kwargs['memberID']

    if memberID is None:
        return None

    lmsAppID = kwargs.get('lmsAppID')
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    fq = kwargs.get('fq', [])
    sort = kwargs.get('sort', None)
    groupIDs = kwargs.get('groupIDs', None)
    groupTypes = kwargs.get('groupTypes', ['class', 'study'])

    #query = session.query(model.Group, model.GroupHasMembers.roleID.label('roleID'), model.GroupHasMembers.statusID.label('statusID'))
    query = session.query(model.Group,
        model.GroupHasMembers.roleID.label('roleID'), model.MemberRole.name.label('role'),
        model.GroupHasMembers.statusID.label('statusID'), model.GroupMemberStates.name.label('status')).distinct()
    query = query.join(model.GroupHasMembers, and_(model.GroupHasMembers.groupID ==  model.Group.id, model.GroupHasMembers.memberID == memberID))
    query = query.join(model.MemberRole, model.MemberRole.id==model.GroupHasMembers.roleID)
    query = query.join(model.GroupMemberStates, model.GroupMemberStates.id==model.GroupHasMembers.statusID)
    if groupIDs:
        query = query.filter(model.Group.id.in_(groupIDs))
    else:
        query = query.filter(not_(model.Group.id.in_(['1','2'])))
    if groupTypes:
        if isinstance(groupTypes, (str, unicode)):
            groupTypes = [groupTypes]
        query = query.filter(model.Group.groupType.in_(groupTypes))

    #Don't include hidden or inactive groups
    query = query.filter(and_(model.Group.isActive==1, model.Group.isVisible == True))
    if not lmsAppID:
        #sq = session.query(model.LMSProviderGroup.groupID).distinct()
        #sq = sq.filter(model.LMSProviderGroup.groupID != None)
        #sq = sq.join(model.LMSProviderGroupMember, model.LMSProviderGroupMember.providerGroupID == model.LMSProviderGroup.providerGroupID)
        #sq = sq.filter(model.LMSProviderGroupMember.memberID == memberID)
        #query = query.filter(not_(model.Group.id.in_(sq.subquery())))
        query = query.filter(model.Group.origin == 'ck-12')
    else:
        ## TODO: Implement groups for an app
        pass

    log.debug("fq: %s" % fq)
    if fq:
        roles = []
        for d in fq:
            if d[0] == 'myRole':
                roles.append(d[1])
            elif d[0] == 'permission':
                if d[1] == 'share':
                    query = query.filter(or_(
                        model.GroupHasMembers.roleID == 15,
                        and_(model.GroupHasMembers.roleID == 14, model.Group.groupType == 'study')
                    ))
        if roles:
            def getRoleFilter(role, memberID):
                if role == 'member':
                    return model.GroupHasMembers.roleID == 14
                elif role == 'admin':
                    return model.GroupHasMembers.roleID == 15
                elif role in ('creator', 'owner'):
                    return model.Group.creatorID == memberID
                return None

            roleFilter = None
            for role in roles:
                rf = getRoleFilter(role, memberID)
                if rf is not None:
                    if roleFilter is None:
                        roleFilter = rf
                    else:
                        roleFilter = or_(roleFilter, rf)
            query = query.filter(roleFilter)

    log.debug("sort: %s" % sort)
    if sort:
        ordr = None
        if sort[:2] == 'a_':
            ordr = asc
        elif sort[:2] == 'd_':
            ordr = desc

        if ordr:
            field = sort[2:]
            if field == 'name':
                query = query.order_by(ordr(model.Group.name))
            elif field == 'role':
                query = query.order_by(ordr(model.MemberRole.name))
            elif field == 'creationTime':
                query = query.order_by(ordr(model.Group.creationTime))
            elif field == 'updateTime':
                query = query.order_by(ordr(model.Group.updateTime))
            elif field == 'latestGroupActivity':
                if not groupIDs:
                    ## Get active groupIDs for the user - Bug 33473
                    gq = session.query(model.GroupHasMembers.groupID).distinct()
                    gq = gq.filter(and_(
                        model.GroupHasMembers.memberID == memberID,
                        model.GroupHasMembers.statusID == 2,
                        not_(model.GroupHasMembers.groupID.in_([1,2]))))
                    groupIDs = [ r.groupID for r in gq.all() ]
                    log.debug("groupIDs: %s" % groupIDs)
                q2 = session.query(model.GroupActivity.groupID.label('groupID'), func.max(model.GroupActivity.id).label('activityID'))
                q2 = q2.filter(model.GroupActivity.groupID.in_(groupIDs))
                q2 = q2.group_by(model.GroupActivity.groupID)
                sq = q2.subquery()
                query = query.filter(model.Group.id == sq.c.groupID)
                query = query.order_by(ordr(sq.c.activityID))

    log.debug("_getGroupsByMemberID: %s" % query)
    return p.Page(query, pageNum, pageSize)

@_transactional(readOnly=True)
def getLMSProviderGroupsByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getLMSProviderGroupsByFilters(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getLMSProviderGroupsByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    fields = {
    'providerGroupID': model.LMSProviderGroup.providerGroupID,
    'appID': model.LMSProviderApp.appID,
    'providerID': model.LMSProvider.id,
    'groupID': model.LMSProviderGroup.groupID
    }

    query = session.query(model.LMSProviderGroup)
    query = query.join(model.LMSProviderApp, model.LMSProviderApp.appID == model.LMSProviderGroup.appID)
    query = query.join(model.LMSProvider, model.LMSProvider.id == model.LMSProviderApp.providerID)
    query = query.group_by(model.LMSProviderGroup.groupID)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)
    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if not sort:
        sort = 'groupID,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    #page = p.Page(query, pageNum, pageSize)
    #return page
    return query.all()

@_transactional(readOnly=True)
def getGroups(session, **kwargs):
    """
        Returns all the Groups.
    """

    fields = {
              'groupType': model.Group.groupType,
              'creatorID': model.Group.creatorID,
              'appID': model.LMSProviderApp.appID,
              'providerID': model.LMSProvider.id,
              'isVisible': model.Group.isVisible,
              'taggedRole': model.MemberRole.name
             }

    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    groupName = kwargs.get('groupName')
    sort = kwargs.get('sort', None)
    filters = kwargs.get('filters', [])
    searchDict = kwargs.get('searchDict', {})
    isHidden = kwargs.get('isHidden',0)
    query = session.query(model.Group)
    if not isHidden:
    	query = query.filter(model.Group.isVisible==1)

    query = query.filter(model.Group.id>2)
    query = query.filter(model.Group.isActive==1)
    if not isHidden:
        query = query.filter(model.Group.isVisible==1)

    if groupName:
        query = query.filter(model.Group.name == groupName)

    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter or filterFld in ['isVisible'] :
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    #
    #Support to filter CK-12 groups based on LMS provider ID or appID
    #
    groupIDs = []
    if 'providerID' in filterDict.keys() or 'appID' in filterDict.keys():
        filt = []
        if 'providerID' in filterDict.keys():
            for providerID in filterDict['providerID']:
                filt.append((('providerID'), providerID),)
            #Remove lms filter from original param dict
            del filterDict['providerID']
        if 'appID' in filterDict.keys():
            for appID in filterDict['appID']:
                filt.append((('appID'), appID),)
            #Remove lms filter from original param dict
            del filterDict['appID']
        LMSProviderGroups = _getLMSProviderGroupsByFilters(session, filters=filt, sort=None, pageNum=pageNum, pageSize=pageSize)
        for LMSProviderGroup in LMSProviderGroups:
            groupIDs.append(LMSProviderGroup.groupID)
        if groupIDs is not None and len(groupIDs) == 0:
            groupIDs.append(0)

    if 'taggedRole' in filterDict.keys():
        query = query.join(model.ForumMetadata, model.ForumMetadata.groupID == model.Group.id)
        query = query.filter(model.MemberRole.name.in_(filterDict['taggedRole']))
        query = query.filter(model.MemberRole.id == model.ForumMetadata.taggedWithRoleID)

    if groupIDs is not None and len(groupIDs) > 0:
        query = query.filter(model.Group.id.in_(groupIDs))

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if searchDict and len(searchDict) > 0:
        for key in searchDict.keys():
            if key not in fields.keys():
                raise Exception((_(u'Unsupported search field: %(searchFld)s')  % {"searchFld":key}).encode("utf-8"))
            val = searchDict[key]
            log.info("Search fld: %s, terms: %s" % (key, val))
            query = query.filter(fields[key].in_(val))

    if sort:
        ordr = None
        field = None
        if ',' in sort:
            _ordr = {
                'asc': asc,
                'desc': desc,
            }
            _sort = sort.split(',')
            field = _sort[0]
            ordr = _ordr.get(_sort[1])
        else:
            _ordr = {
                'a_': asc,
                'd_': desc,
            }

            ordr = _ordr.get(sort[:2])
            if ordr:
                field = sort[2:]

        if ordr and field:
            attrMap = {
                'id': model.Group.id,
                'name': model.Group.name,
                'accessCode': model.Group.accessCode,
                'groupScope': model.Group.groupScope,
                'groupType': model.Group.groupType,
                'description': model.Group.description,
                'creationTime': model.Group.creationTime,
                'updateTime': model.Group.updateTime,
                'isVisible': model.Group.isVisible,
            }
            attr = attrMap.get(field)
            if attr:
                query = query.order_by(ordr(attr))

    page = p.Page(query, pageNum, pageSize, tableName='Groups')
    return page

@_transactional()
def updateGroupMemberState(session, **kwargs):
    return _updateGroupMemberState(session, **kwargs)

def _updateGroupMemberState(session, **kwargs):
    """
        Update a Group member's state.
    """
    _checkAttributes([ 'group', 'memberID'], **kwargs)
    group = kwargs['group']
    userID = kwargs['memberID']
    statusID = kwargs['statusID']
    result = {}
    if group is None or userID is None or statusID is None:
        return None

    try:
        query = session.query(model.GroupHasMembers)
        query = query.filter(and_(model.GroupHasMembers.groupID == group.id, model.GroupHasMembers.memberID == userID, model.GroupHasMembers.roleID==14))
        groupMember = _queryOne(query)
        if not groupMember:
            raise Exception('Member not in the group')
        groupMember.statusID = statusID
        session.add(groupMember)
        if groupMember:
            result['is_state_updated'] = True
    except Exception as e:
        result['is_state_updated'] = False
        result['message'] = e.__str__()
    return result

@_transactional()
def addMemberToGroup(session, **kwargs):
    return _addMemberToGroup(session, **kwargs)

def _addMemberToGroup(session, **kwargs):
    """
        Add member to Group.
    """
    _checkAttributes(['group', 'memberID'], **kwargs)
    group = kwargs['group']
    userID = kwargs['memberID']

    if userID is None or group is None:
        return None

    result = {}
    result['is_user_added'] = False
    result['message'] = 'Unable to add member to group'

    member_status_id = 2
    if group.groupScope == 'protected':
        member_status_id = 1

    query = session.query(model.GroupHasMembers)
    query = query.filter(and_(model.GroupHasMembers.memberID==userID, model.GroupHasMembers.groupID==group.id))
    groupMember = _queryOne(query)
    if groupMember:
        result['message'] = 'Already in the group'
        return result

    isAdmin = kwargs.get('isAdmin', False)
    roleID = 15 if isAdmin else 14
    d = {'memberID':userID, 'groupID':group.id, 'roleID':roleID, 'statusID':member_status_id, 'disableNotification':0}
    if _createGroupHasMember(session, **d):
        result['is_user_added'] = True
        del result['message']
    session.flush()
    return result


@_transactional()
def deleteMemberFromGroup(session, **kwargs):
    return _deleteMemberFromGroup(session, **kwargs)

def _deleteMemberFromGroup(session, **kwargs):
    """
        Delete member from Group.
    """
    _checkAttributes([ 'group', 'memberID', 'requesterID'], **kwargs)
    group = kwargs['group']
    userID = kwargs['memberID']
    if group is None or userID is None:
        return None

    """query = session.query(model.GroupHasMembers)
    query = query.filter(or_(and_(model.GroupHasMembers.groupID == group.id, model.GroupHasMembers.memberID == requesterID, model.GroupHasMembers.roleID==15),and_(model.GroupHasMembers.memberID==requesterID, model.GroupHasMembers.roleID==1)))
    groupMember = _queryOne(query)
    if not groupMember:
        raise Exception('Only Admin or group owner can delete members from the group.')"""

    query = session.query(model.GroupHasMembers)
    query = query.filter(and_(model.GroupHasMembers.groupID == group.id, model.GroupHasMembers.memberID == userID, or_(model.GroupHasMembers.roleID==14, model.GroupHasMembers.roleID==15, model.GroupHasMembers.roleID==26, model.GroupHasMembers.roleID==27)))
    groupMember = _queryOne(query)
    if not groupMember:
        raise Exception('Member not in the group')

    roleID = groupMember.roleID
    if roleID == 14 or long(roleID) == 14:
        #
        #  Delete member status for all assignments in this group.
        #
        memberID = groupMember.memberID
        groupID = groupMember.groupID
        query = session.query(model.Assignment)
        query = query.filter_by(groupID=groupID)
        query = query.filter_by(assignmentType='assignment')
        assignments = query.all()
        if assignments and len(assignments) > 0:
            aids = []
            for assignment in assignments:
                aids.append(assignment.assignmentID)
            query = session.query(model.MemberStudyTrackItemStatus)
            query = query.filter_by(memberID=memberID)
            query = query.filter(model.MemberStudyTrackItemStatus.assignmentID.in_(aids))
            statusList = query.all()
            for status in statusList:
                session.delete(status)

    session.delete(groupMember)
    return True

@_transactional(readOnly=True)
def getIncompleteAssignments(session, memberIDs, dueBefore):
    return _getIncompleteAssignments(session, memberIDs, dueBefore)

def _getIncompleteAssignments(session, memberIDs, dueBefore):
    """
        Find the incomplete assignments that's due before dueIn
        for the given list of members.
    """
    from datetime import datetime as dt, date
    import datetime

    query = session.query(model.MemberStudyTrackItemStatus.memberID,
                          model.Assignment.assignmentID,
                          model.Assignment.groupID,
                          model.Assignment.due,
                          model.Group.name).distinct()
    query = query.filter(model.MemberStudyTrackItemStatus.assignmentID == model.Assignment.assignmentID)
    query = query.filter(model.Assignment.groupID == model.Group.id)
    query = query.filter(model.MemberStudyTrackItemStatus.memberID.in_(memberIDs))
    today = dt.combine(date.today(), datetime.time())
    query = query.filter(model.Assignment.due >= today)
    query = query.filter(model.Assignment.due < dueBefore)
    query = query.order_by(model.MemberStudyTrackItemStatus.memberID, model.Assignment.due)
    log.debug('_getIncompleteAssignments: query[%s]' % query)
    tuples = query.all()
    return tuples

@_transactional(readOnly=True)
def getAssignedModalitiesForDomain(session, domainEID, memberID, ownedBy='ck12', conceptCollectionHandle=None, collectionCreatorID=3):
    return _getAssignedModalitiesForDomain(session, domainEID, memberID, ownedBy, conceptCollectionHandle, collectionCreatorID)

def _getAssignedModalitiesForDomain(session, domainEID, memberID, ownedBy='ck12', conceptCollectionHandle=None, collectionCreatorID=3):
    ## Check if the domain is assigned - we show practice as the assigned modality
    domainArts = []
    practiceArt = None
    domainType = _getArtifactTypeByName(session, 'domain')
    if ownedBy == 'ck12' or ownedBy == 'all':
        domainTerm = _getBrowseTermByEncodedID(session, encodedID=domainEID)
        log.debug("Found domain term for %s: %s" % (domainEID, domainTerm))
        if domainTerm:
            practiceType = _getArtifactTypeByName(session, 'asmtpractice')
            ## Get corresponding practice
            practiceArts = _getRelatedArtifactsForDomains(session, domainIDs=[domainTerm.id], 
                    conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, typeIDs=[practiceType.id], ownedBy='ck12')
            if practiceArts:
                practiceArt = practiceArts[0]
            log.debug("Found practice artifact for %s: %s" % (domainEID, practiceArt))
            if practiceArt:
                ## The order of tables in important here.
                query = session.query(model.Artifact,
                        model.MemberStudyTrackItemStatus,
                        model.Assignment)
                query = query.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
                query = query.filter(model.MemberStudyTrackItemStatus.assignmentID == model.Assignment.assignmentID)
                query = query.filter(model.Artifact.id == model.MemberStudyTrackItemStatus.studyTrackItemID)
                query = query.filter(model.Artifact.artifactTypeID == domainType.id)
                query = query.filter(and_(
                    model.Artifact.encodedID.like('%s%%' % h.getCanonicalEncodedID(domainEID)),
                    model.Artifact.encodedID.op('regexp')(getRegExpForEncodedID(domainEID))))
                query = query.filter(model.Assignment.assignmentType == 'assignment')
                domainArts = query.all()

    ## The order of tables in important here.
    query = session.query(model.RelatedArtifactsAndLevels,
            model.MemberStudyTrackItemStatus,
            model.Assignment)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    query = query.filter(model.RelatedArtifactsAndLevels.domainEID == domainEID)
    query = query.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
    query = query.filter(model.MemberStudyTrackItemStatus.assignmentID == model.Assignment.assignmentID)
    query = query.filter(model.RelatedArtifactsAndLevels.id == model.MemberStudyTrackItemStatus.studyTrackItemID)
    query = query.filter(model.Assignment.assignmentType == 'assignment')
    query = query.filter(model.Assignment.origin == 'ck-12')
    if ownedBy:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if ownedBy == 'ck12':
            query = query.filter(model.RelatedArtifactsAndLevels.creatorID == ck12editor.id)
        elif ownedBy == 'community':
            query = query.filter(model.RelatedArtifactsAndLevels.creatorID != ck12editor.id)
        elif ownedBy == 'all':
            pass
        else:
            query = query.filter(model.RelatedArtifactsAndLevels.creatorID == int(ownedBy))

    assignedModalities = {}
    modalities = query.all()
    modalities.extend(domainArts)
    for r in modalities:
        ## r is KeyedTuple with each table indexed in an array
        origStii = r[1].studyTrackItemID
        stii = r[1].studyTrackItemID
        if r[0].artifactTypeID == domainType.id and practiceArt:
            stii = practiceArt.id
        if not assignedModalities.has_key(stii):
            assignedModalities[stii] = []
        assignedModalities[stii].append({
                    'groupID': r[2].groupID,
                    'assignmentID': r[2].assignmentID,
                    'due': r[2].due,
                    'status': r[1].status,
                    'score': r[1].score,
                    'lastAccess': r[1].lastAccess,
                    'creatorID': r[0].creatorID,
                    'studyTrackItemID': origStii,
                })
    return assignedModalities

@_transactional(readOnly=True)
def searchGroups(session, term, pageNum=1, pageSize=10):
    return _searchGroups(session, term, pageNum, pageSize)

def _searchGroups(session, term, pageNum, pageSize):
    """
       Search Public Groups
    """
    query = session.query(model.Group)
    query = query.filter(and_(model.Group.groupScope=='open', model.Group.id > 2))
    query = query.filter(func.lower(model.Group.name).ilike('%%%s%%' % term.lower()))
    query = query.filter(model.Group.isActive==1)
    query = query.filter(model.Group.isVisible==1)
    page = p.Page(query, pageNum, pageSize, tableName='Groups')
    return page

@_transactional(readOnly=True)
def getMemberIDsForGroupIDs(session, groupIDs, onlyAdmins=False):
    return _getMemberIDsForGroupIDs(session, groupIDs, onlyAdmins=onlyAdmins)

def _getMemberIDsForGroupIDs(session, groupIDs, onlyAdmins=False):
    """
        get memberID of all groups requested
    """
    if not groupIDs:
        return None

    roleIDs = [15, ]
    if not onlyAdmins:
        roleIDs.append(14)

    query = session.query(model.GroupHasMembers.memberID).distinct()
    query = query.filter(model.GroupHasMembers.groupID.in_(groupIDs))
    query = query.filter(model.GroupHasMembers.roleID.in_(roleIDs))
    memberIDs = query.all()
    if memberIDs:
        memberIDs = zip(*memberIDs)
        if memberIDs:
            memberIDs = list(memberIDs[0])

    return memberIDs

@_transactional(readOnly=True)
def setGroupMemberRoles(session, groupID, memberID):
    return _getGroupMemberRoles(session, groupID, memberID)

def _getGroupMemberRoles(session, groupID, memberID):
    query = session.query(model.GroupHasMembers)
    query = query.filter_by(groupID=groupID)
    query = query.filter_by(memberID=memberID)
    return query.all()

@_transactional()
def addMemberToBlockedList(session, **kwargs):
    return _addMemberToBlockedList(session, **kwargs)

def _addMemberToBlockedList(session, **kwargs):
    """
        Add member to blocked members list.
    """
    _checkAttributes(['memberID', 'blockedBy'], **kwargs)
    memberID = kwargs['memberID']

    if memberID is None:
        return None

    objectType = kwargs.get('objectType', None)
    subObjectType = kwargs.get('subObjectType', None)
    objectID = kwargs.get('objectID', None)

    blockedMember = _getBlockedMemberByMemberID(session, memberID, objectType, subObjectType, objectID)
    if blockedMember:
        raise Exception('Already blocked for objectType[%s], subObjectType[%s] and objectID[%s]' % (objectType, subObjectType, objectID))

    d = {'memberID': memberID, \
         'objectType': objectType, \
         'subObjectType': subObjectType, \
         'objectID': objectID, \
         'blockedBy': kwargs.get('blockedBy', None), \
         'reason' : kwargs.get('reason', None), \
         'creationTime' : datetime.now()}

    _blockedMember = model.BlockedMembers(**d)
    session.add(_blockedMember)
    return _blockedMember

@_transactional()
def removeMemberFromBlockedList(session, **kwargs):
    return _removeMemberToBlockedList(session, **kwargs)

def _removeMemberToBlockedList(session, **kwargs):
    """
        Removes a member from blocked members list.
    """
    _checkAttributes(['memberID'], **kwargs)
    memberID = kwargs['memberID']

    try:
        if memberID is None:
            return None

        objectType = kwargs.get('objectType', None)
        subObjectType = kwargs.get('subObjectType', None)
        objectID = kwargs.get('objectID', None)

        blockedMember = _getBlockedMemberByMemberID(session, memberID, objectType, subObjectType, objectID)

        if blockedMember is not None:
            session.delete(blockedMember)
        return blockedMember
    except ValueError:
        return None

@_transactional(readOnly=True)
def getBlockedMembers(session, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getBlockedMembers(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getBlockedMembers(session, filters=None, sort=None, pageNum=0, pageSize=0):
    """
        Returns all the blocked members info.
    """

    fields = {
              'memberID': model.BlockedMembers.memberID,
              'objectType': model.BlockedMembers.objectType,
              'blockedBy': model.BlockedMembers.blockedBy,
             }

    query = session.query(model.BlockedMembers)

    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)


    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if sort:
        ordr = None
        field = None
        if ',' in sort:
            _ordr = {
                'asc': asc,
                'desc': desc,
            }
            _sort = sort.split(',')
            field = _sort[0]
            ordr = _ordr.get(_sort[1])
        else:
            _ordr = {
                'a_': asc,
                'd_': desc,
            }

            ordr = _ordr.get(sort[:2])
            if ordr:
                field = sort[2:]

        if ordr and field:
            attrMap = {
                'memberID': model.BlockedMembers.memberID,
                'objectType': model.BlockedMembers.objectType,
                'blockedBy': model.BlockedMembers.blockedBy,
                'creationTime': model.BlockedMembers.creationTime,
            }
            attr = attrMap.get(field)
            if attr:
                query = query.order_by(ordr(attr))

    page = p.Page(query, pageNum, pageSize, tableName='BlockedMembers')
    return page


@_transactional(readOnly=True)
def getBlockedMemberByMemberID(session, memberID, objectType=None, subObjectType=None, objectID=None):
    return _getBlockedMemberByMemberID(session, memberID, objectType=objectType, subObjectType=subObjectType, objectID=objectID)

def _getBlockedMemberByMemberID(session, memberID, objectType=None, subObjectType=None, objectID=None):
    if not memberID:
        raise ex.MissingArgumentException('Required parameters are missing')
    query = session.query(model.BlockedMembers)
    query = query.filter(model.BlockedMembers.memberID==memberID)
    if objectType:
        query = query.filter_by(objectType=objectType)
    if subObjectType:
        query = query.filter_by(subObjectType=subObjectType)
    if objectID:
        query = query.filter_by(objectID=objectID)

    return _queryOne(query)

@_transactional(readOnly=True)
def getGroupMembersCounts(session, **kwargs):
    return _getGroupMembersCounts(session, **kwargs)

def _getGroupMembersCounts(session, **kwargs):
    """
        Get Group members counts
    """
    _checkAttributes(['groupIDs'], **kwargs)
    groupIDs = kwargs['groupIDs']
    if groupIDs is None:
        return None
    count_query = session.query(model.GroupHasMembers.groupID, \
        func.count(model.GroupHasMembers.memberID)).\
    filter(model.GroupHasMembers.groupID.in_(groupIDs)).\
    group_by(model.GroupHasMembers.groupID)

    cnt_results = p.Page(count_query, pageNum=1, pageSize=None)

    for i in range(0, len(cnt_results)):
        if isinstance(cnt_results[i], list):
            cnt_results[i] = cnt_results[i][0]
    return cnt_results

@_transactional(readOnly=True)
def getGroupMembers(session, **kwargs):
    return _getGroupMembers(session, **kwargs)

def _getGroupMembers(session, **kwargs):
    """
        Get Group member list
    """

    _checkAttributes([ 'group'], **kwargs)
    group = kwargs['group']
    publicForums = kwargs.get('publicForums', False)
    #userID = kwargs['memberID']
    if group is None:
        return None
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    fq = kwargs.get('fq', [])
    sort = kwargs.get('sort', None)
    ## Sorting not supported for forums
    if not isinstance(group, basestring): 
        if group.groupType in ['public-forum']:
            sort = None

    group_members_alias = aliased(model.GroupHasMembers)
    member_role_alias = aliased(model.MemberRole)
    aliasNeeded = False

    providerAppName = kwargs.get('providerAppName')
    if providerAppName:
        query = session.query(model.GroupHasMembers,
                model.LMSProviderGroupMember.providerMemberID.label('providerMemberID'))
        query = query.join(model.LMSProviderGroupMember, model.LMSProviderGroupMember.memberID == model.GroupHasMembers.memberID)
        query = query.join(model.LMSProvider, model.LMSProvider.id == model.LMSProviderGroupMember.providerID)
        query = query.join(model.LMSProviderApp, model.LMSProviderApp.providerID == model.LMSProvider.id)
        query = query.filter(model.LMSProviderApp.appID == providerAppName)
    else:
        query = session.query(model.GroupHasMembers)
    query = query.join(model.GroupHasMembers.member_info).options(joinedload(model.GroupHasMembers.member_info, innerjoin=True))
    if isinstance(group, basestring):
        fltr = and_(model.GroupHasMembers.groupID.in_([group]), or_(model.GroupHasMembers.roleID==14, model.GroupHasMembers.roleID==15))
    else:
        fltr = and_(model.GroupHasMembers.groupID == group.id, or_(model.GroupHasMembers.roleID==14, model.GroupHasMembers.roleID==15))
    if publicForums:
        query = query.join(model.Group, and_(model.Group.id == model.GroupHasMembers.groupID, model.Group.isActive == 1, model.Group.isVisible == 1, model.Group.groupType == "public-forum"))

    if fq:
        for d in fq:
            if (d[0] == 'groupMemberRoleID'):
                fltr = and_(fltr, (model.GroupHasMembers.roleID == d[1]))
            elif (d[0] == 'groupMemberRole'):
                fltr = and_(fltr, and_(model.MemberRole.name == d[1], model.MemberRole.id == model.GroupHasMembers.roleID))
            elif (d[0] == 'userRole'):
                aliasNeeded = True
                values = d[1].split('+')
                _fltr = (member_role_alias.name == values[0])
                for i in range(1, len(values)):
                    _fltr = or_(_fltr, member_role_alias.name == values[i])
                fltr = and_(fltr, _fltr)
            elif (d[0] == 'userRoleID'):
                aliasNeeded = True
                fltr = and_(fltr, and_(member_role_alias.id == d[1]))
            elif (d[0] == 'statusID'):
                fltr = and_(fltr, (model.GroupHasMembers.statusID == d[1]))
            elif (d[0] == 'status'):
                fltr = and_(fltr, and_(model.GroupMemberStates.name == d[1], model.GroupMemberStates.id == model.GroupHasMembers.statusID))
            elif (d[0] == 'joinTimeStart'):
                fltr = and_(fltr, (model.GroupHasMembers.joinTime >= d[1]))
            elif (d[0] == 'joinTimeEnd'):
                fltr = and_(fltr, (model.GroupHasMembers.joinTime <= d[1]))
            elif (d[0] == 'updateTimeStart'):
                # updateTime is NULL by default. Unless this is changed, we have to consider joinTime as the first updateTime
                fltr = and_(
                    fltr,
                    or_(
                        and_(model.GroupHasMembers.updateTime != None, model.GroupHasMembers.updateTime >= d[1]),
                        and_(model.GroupHasMembers.updateTime == None, model.GroupHasMembers.joinTime >= d[1])
                    )
                )
            elif (d[0] == 'updateTimeEnd'):
                fltr = and_(
                    fltr,
                    or_(
                        and_(model.GroupHasMembers.updateTime != None, model.GroupHasMembers.updateTime <= d[1]),
                        and_(model.GroupHasMembers.updateTime == None, model.GroupHasMembers.joinTime <= d[1])
                    )
                )
            elif (d[0] == 'memberID'):
                fltr = and_(fltr, (model.GroupHasMembers.memberID == d[1]))
            elif (d[0] == 'providerMemberID'):
                if not providerAppName:
                    raise Exception("Must specify a providerAppName to filter on providerMemberID")
                fltr = and_(fltr, (model.LMSProviderGroupMember.providerMemberID == d[1]))

    if aliasNeeded or (sort and 'userRole' in sort):
        query = query.join(group_members_alias, group_members_alias.memberID==model.GroupHasMembers.memberID)
        query = query.join(member_role_alias, member_role_alias.id==group_members_alias.roleID)
        query = query.filter(group_members_alias.groupID == 1)

    query = query.filter(fltr)
    field = ordr = None
    if sort:
        ordr = None
        if sort[:2] == 'a_':
            ordr = asc
        elif sort[:2] == 'd_':
            ordr = desc

        if ordr:
            field = sort[2:]
            if field == 'joinTime':
                query = query.order_by(ordr(model.GroupHasMembers.joinTime))
            elif field == 'updateTime':
                query = query.order_by(ordr(model.GroupHasMembers.joinTime))
            elif field == 'userRole':
                query = query.order_by(ordr(member_role_alias.name))
            elif field == 'userRoleID':
                query = query.order_by(ordr(member_role_alias.id))
            elif field == 'status':
                query = query.join(model.GroupHasMembers.status).options(joinedload(model.GroupHasMembers.status, innerjoin=True)).order_by(ordr(model.GroupMemberStates.name))
            elif field == 'groupMemberRole':
                query = query.join(model.GroupHasMembers.role).options(joinedload(model.GroupHasMembers.role, innerjoin=True)).order_by(ordr(model.MemberRole.name))
            elif field == 'name':
                query = query.order_by(ordr(model.Member.givenName), ordr(model.Member.surname))

    """
    query = query.group_by(model.GroupHasMembers.memberID)

        The _memberCustomSort() method assumes the entire class is fetched before doing the sorting
        but limits the class size to 100. See bug 49987. Disable it and let front end handle the sort.

    if field == 'name':
        ordr = 'asc' if ordr == asc else 'desc'
        results = _memberCustomSort(p.Page(query, 1, 100), ordr, pageNum, pageSize)
    else:
        results = p.Page(query, pageNum, pageSize)
    """
    results = p.Page(query, pageNum, pageSize)

    for i in range(0, len(results)):
        if isinstance(results[i], list):
            results[i] = results[i][0]
    return results

@_transactional(readOnly=True)
def getGroupMemberCounts(session, group, memberRoleNameDict):
    return _getGroupMemberCounts(session, group, memberRoleNameDict)

def _getGroupMemberCounts(session, group, memberRoleNameDict):
    groupLeaderRoleID = memberRoleNameDict['groupadmin']
    statement = 'select distinct mgm.roleID as roleID, mgm.memberID as memberID from GroupHasMembers mgm, GroupHasMembers gm where mgm.groupID=1 and mgm.memberID=gm.memberID and gm.groupID=%s and gm.roleID!=%s' % (group.id, groupLeaderRoleID)
    rows = session.execute(statement).fetchall()
    teacherRoleID = memberRoleNameDict['teacher']
    memberRoleID = memberRoleNameDict['member']
    studentRoleID = memberRoleNameDict['student']
    teacherDict = {}
    studentDict = {}
    for roleID, memberID in rows:
        if roleID == teacherRoleID:
            teacherDict[memberID] = roleID
    for roleID, memberID in rows:
        if (roleID == memberRoleID or roleID == studentRoleID) and not teacherDict.get(memberID):
            studentDict[memberID] = roleID
    teacherCount = len(teacherDict.keys())
    studentCount = len(studentDict.keys())
    return teacherCount, studentCount

@_transactional(readOnly=True)
def getGroupActivity(session, **kwargs):
    return _getGroupActivity(session, **kwargs)

@trace
def _getGroupActivity(session, **kwargs):
    """
        Get Group Activity
    """

    _checkAttributes([ 'group'], **kwargs)
    group = kwargs['group']

    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    memberID = kwargs.get('memberID')
    fq = kwargs.get('fq', [])
    sort = kwargs.get('sort', None)

    query = session.query(model.GroupActivity)
    fltr = (model.GroupActivity.groupID == group.id)

    excludeViewed = False
    if fq:
        for d in fq:
            if (d[0] == 'ownerID'):
                fltr = and_(fltr, model.GroupActivity.ownerID == d[1])
            elif (d[0] == 'activityType'):
                fltr = and_(fltr, model.GroupActivity.activityType == d[1])
            elif (d[0] == 'objectID'):
                fltr = and_(fltr, model.GroupActivity.objectID == d[1])
            elif (d[0] == 'objectType'):
                fltr = and_(fltr, model.GroupActivity.objectType == d[1])
            elif (d[0] == 'timeStart'):
                fltr = and_(fltr, (model.GroupActivity.creationTime >= d[1]))
            elif (d[0] == 'timeEnd'):
                fltr = and_(fltr, (model.GroupActivity.creationTime <= d[1]))
            elif (d[0] == 'excludeActivityTypes'):
                excActivities = []
                if d[1]:
                    excActivities = d[1].split(',')
                    fltr = and_(fltr, not_(model.GroupActivity.activityType.in_(excActivities)))
            elif d[0] == 'includeViewed' and str(d[1]).lower() == 'false':
                excludeViewed = True

    if memberID and excludeViewed:
        sq = session.query(model.MemberViewedGroupActivity.activityID).filter(and_(
                model.MemberViewedGroupActivity.memberID == memberID,
                model.MemberViewedGroupActivity.groupID == group.id))
        fltr = and_(fltr, not_(model.GroupActivity.id.in_(sq.subquery())))

    query = query.filter(fltr)

    if sort:
        ordr = None
        if sort[:2] == 'a_':
            ordr = asc
        elif sort[:2] == 'd_':
            ordr = desc

        if ordr:
            field = sort[2:]

            if (field == 'activityType'):
                query = query.order_by(ordr(model.GroupActivity.activityType), desc(model.GroupActivity.creationTime))
            elif (field == 'objectType'):
                query = query.order_by(ordr(model.GroupActivity.objectType), desc(model.GroupActivity.creationTime))
            elif field == 'userName':
                query = query.join(model.GroupActivity.owner).options(joinedload(model.GroupActivity.owner)).order_by(ordr(model.Member.givenName), ordr(model.Member.surname))
                query = query.order_by(desc(model.GroupActivity.creationTime))
    else: # default sort by latest activity first
        query = query.order_by(desc(model.GroupActivity.creationTime))

    log.debug("_getGroupActivity: Query: %s" % str(query))
    return p.Page(query, pageNum, pageSize)

def _deleteGroupActivityForObject(session, objectType, objectID):
    query = session.query(model.GroupActivity)
    query = query.filter(and_(model.GroupActivity.objectID == objectID, model.GroupActivity.objectType == objectType))
    query.delete()

@_transactional(readOnly=True)
def getGroupActivityByID(session, id, activityType=None):
    return _getGroupActivityByID(session, id, activityType=activityType)

def _getGroupActivityByID(session, id, activityType=None):
    query = session.query(model.GroupActivity).filter_by(id=id)
    if activityType:
        query = query.filter_by(activityType=activityType)
    groupActivity = _queryOne(query)
    return groupActivity

@_transactional()
def isGroupFirstActivity(session, groupID, accessTime):
    query = session.query(model.GroupActivity)
    query = query.filter(model.GroupActivity.groupID == groupID)
    query = query.filter(model.GroupActivity.activityType != 'create')
    #query = query.filter(model.GroupActivity.creationTime < accessTime)
    query = query.order_by(asc(model.GroupActivity.creationTime))
    row = query.first()

    if row and row.creationTime > accessTime:
        return True

    return False

@_transactional()
def addGroupNotificationSetting(session, eventType, groupID, subscriberID=None, notificationType='email', frequency='instant'):
    return _addGroupNotificationSetting(session, eventType, groupID, subscriberID, notificationType, frequency)

def _addGroupNotificationSetting(session, eventType, groupID, subscriberID=None, notificationType='email', frequency='instant'):
    '''
        Add a notification setting for the admin for member joined notification
    '''
    eventTypeObj = _getEventTypeByName(session, typeName=eventType)

    notification = None
    if eventTypeObj is None:
        log.error('_addGroupNotificationSetting: eventType not found: %s. Not adding notification for groupID: %d, subscriberID: %d' % (eventType, groupID, subscriberID))
    else:
        notification = _createNotification(session, eventTypeID=eventTypeObj.id, objectType='group', objectID=groupID, groupID=groupID, subscriberID=subscriberID, type=notificationType, frequency=frequency)
    return notification

@_transactional()
def addGroupEvent(session, **kwargs):
    return _addGroupEvent(session, kwargs)

def _addGroupEvent(session, **kwargs):
    return _createEventForType(session, typeName=kwargs['eventType'], objectID=kwargs['objectID'], objectType=kwargs['objectType'], eventData=kwargs['eventData'], ownerID=kwargs['ownerID'], processInstant=kwargs['processInstant'], notificationID=kwargs['notificationID'])

@_transactional()
def addGroupNotification(session, **kwargs):
    return _addGroupNotification(session, **kwargs)

def _addGroupNotification(session, **kwargs):
    """
        Add a group notification to be sent to member(s) including admin.
    """
    _checkAttributes(['groupID','eventType', 'eventData'], **kwargs)
    address = None
    if kwargs.has_key('address'):
        address = kwargs['address']
    eventTypeForGroupShare = _getEventTypeByName(session, typeName=kwargs['eventType'])
    notification = _createNotification(session, eventTypeID=eventTypeForGroupShare.id, objectID=kwargs['groupID'], objectType='group', groupID=kwargs['groupID'], address=address, type='email', frequency='instant')
    event = _createEventForType(session, typeName=kwargs['eventType'], objectID=kwargs['groupID'], objectType='group', eventData=kwargs['eventData'], processInstant=False)
    return event, notification

@_transactional()
def addGroupActivity(session, **kwargs):
    return _addGroupActivity(session, **kwargs)

def _addGroupActivity(session, **kwargs):
    """
        Add a group activity
    """
    _checkAttributes([ 'groupID', 'ownerID', 'objectID', 'objectType', 'activityType'], **kwargs)

    if not kwargs.has_key('creationTime'):
        kwargs['creationtime'] = datetime.now()
    groupActivity = model.GroupActivity(**kwargs)
    session.add(groupActivity)

    #Create an event for the GroupActivity for notifications
    #event = _createEventForType(session, typeName='GROUP_SHARE', objectID=kwargs['objectID'], objectType=kwargs['objectType'], eventData=json.dumps({"url": kwargs['url']}), ownerID=kwargs['ownerID'], processInstant=False)
    return groupActivity

@_transactional()
def updateMemberActivityStatus(session, **kwargs):
    return _updateMemberActivityStatus(session, **kwargs)

def _updateMemberActivityStatus(session, **kwargs):
    """
        Marks activity status as viewed for given user
    """
    _checkAttributes([ 'groupID', 'memberID', 'activityID'], **kwargs)

    memberID = kwargs['memberID']
    activityID = kwargs['activityID']
    query = session.query(model.MemberViewedGroupActivity).filter(and_(model.MemberViewedGroupActivity.memberID==memberID,
                                                                       model.MemberViewedGroupActivity.activityID==activityID))
    viewedActivity = _queryOne(query)
    if not viewedActivity:
        viewedActivity = model.MemberViewedGroupActivity(**kwargs)
        session.add(viewedActivity)

    return viewedActivity

@_transactional()
def deleteGroupActivityByID(session, activityID):
    _deleteGroupActivityByID(session, activityID)

def _deleteGroupActivityByID(session, activityID):
    query = session.query(model.GroupActivity).filter_by(id=activityID)
    query.delete()

@_transactional()
def deleteGroupActivity(session, **kwargs):
    return _deleteGroupActivity(session, **kwargs)

def _deleteGroupActivity(session, **kwargs):
    """
        Delete a group activity
    """
    _checkAttributes([ 'groupID', 'objectID', 'objectType', 'activityType'], **kwargs)

    return session.query(model.GroupActivity).filter(and_(
        model.GroupActivity.groupID == kwargs['groupID'],
        model.GroupActivity.objectID == kwargs['objectID'],
        model.GroupActivity.objectType == kwargs['objectType'],
        model.GroupActivity.activityType == kwargs['activityType'],
    )).delete()

@_transactional(readOnly=True)
def getGroupAdmins(session, **kwargs):
    return _getGroupAdmins(session, **kwargs)

def _getGroupAdmins(session, **kwargs):
    """
        Return all the group admins
    """
    _checkAttributes(['groupID'], **kwargs)
    groupID = kwargs['groupID']
    if groupID is None:
        return False
    query = session.query(model.GroupHasMembers)
    query = query.filter(and_(model.GroupHasMembers.groupID == groupID, model.GroupHasMembers.roleID==15))
    groupAdmins = query.all()
    groupAdminsInfo = []
    for eachGroupAdmin in groupAdmins:
        member = _getMemberByID(session, eachGroupAdmin.memberID)
        adminInfo = {}
        memberInfo = member.infoDict()
        adminInfo['name'] = memberInfo['name']
        adminInfo['id'] = eachGroupAdmin.memberID
        groupAdminsInfo.append(adminInfo)
    return groupAdminsInfo


@_transactional(readOnly=True)
def isGroupAdmin(session, **kwargs):
    return _isGroupAdmin(session, **kwargs)

def _isGroupAdmin(session, **kwargs):
    """
        Returns true if the member is an admin of the specified Group
    """
    _checkAttributes(['groupID', 'memberID'], **kwargs)
    groupID = kwargs['groupID']
    memberID = kwargs['memberID']
    if groupID is None or memberID is None:
        return False
    query = session.query(func.count(model.GroupHasMembers.memberID))
    query = query.filter(and_(model.GroupHasMembers.groupID==groupID, model.GroupHasMembers.memberID==memberID, or_(model.GroupHasMembers.roleID==15, model.GroupHasMembers.roleID==1)))
    groupAdminCount, = query.first()
    return True if groupAdminCount > 0 else False


@_transactional(readOnly=True)
def isGroupMember(session, **kwargs):
    return _isGroupMember(session, **kwargs)

def _isGroupMember(session, **kwargs):
    """
        Returns true if the user is a member of the specified Group
    """
    _checkAttributes(['groupID', 'memberID'], **kwargs)
    groupID = kwargs['groupID']
    memberID = kwargs['memberID']
    if groupID is None or memberID is None:
        return False
    query = session.query(func.count(model.GroupHasMembers.memberID))
    query = query.filter(and_(model.GroupHasMembers.groupID == groupID, model.GroupHasMembers.roleID.in_([1, 14, 15])))
    if memberID:
        query = query.filter(model.GroupHasMembers.memberID == memberID)
    groupMemberCount, = query.first()
    return True if groupMemberCount > 0 else False

@_transactional(readOnly=True)
def checkGroupsMembershipForMember(session, groupIDs, memberID):
    membership = {}
    query = session.query(model.GroupHasMembers.groupID).distinct()
    query = query.filter(model.GroupHasMembers.groupID.in_(groupIDs))
    query = query.filter(model.GroupHasMembers.memberID == memberID)
    query = query.filter(model.GroupHasMembers.roleID.in_([1, 14, 15]))
    rows = query.all()
    for row in rows:
        membership[int(row.groupID)] = True
    return membership

@_transactional(readOnly=True)
def countDistinctMembersInGroups(session, memberID, groupTypes=[], origin='ck-12'):
    return _countDistinctMembersInGroups(session, memberID=memberID, groupTypes=groupTypes, origin=origin)

def _countDistinctMembersInGroups(session, memberID, groupTypes=[], origin='ck-12'):
    q = session.query(distinct(model.Group.id))
    q = q.join(model.GroupHasMembers, model.Group.id == model.GroupHasMembers.groupID)
    q = q.filter(model.GroupHasMembers.roleID.in_([14,15]))
    q = q.filter(model.GroupHasMembers.memberID == memberID)
    q = q.filter(model.Group.isActive == 1)
    q = q.filter(model.Group.isVisible == 1)
    if origin:
        q = q.filter(model.Group.origin == origin)
    if groupTypes:
        q = q.filter(model.Group.groupType.in_(groupTypes))
    groupIDs = []
    for row in q.all():
        groupIDs.append(row[0])

    q = session.query(func.count(distinct(model.GroupHasMembers.memberID)))
    q = q.filter(model.GroupHasMembers.groupID.in_(groupIDs))
    count = q.first()
    if count:
        return count[0]
    return 0

@_transactional(readOnly=True)
def countMemberGroups(session, memberID, groupType=None, origin='ck-12'):
    return _countMemberGroups(session, memberID, groupType=groupType, origin=origin)

def _countMemberGroups(session, memberID, groupType=None, origin='ck-12'):
    q = session.query(func.count(distinct(model.Group.id)))
    q = q.join(model.GroupHasMembers, model.Group.id == model.GroupHasMembers.groupID)
    q = q.filter(model.GroupHasMembers.roleID.in_([14,15]))
    q = q.filter(model.GroupHasMembers.memberID == memberID)
    q = q.filter(model.Group.isActive == 1)
    q = q.filter(model.Group.isVisible == 1)
    if origin:
        q = q.filter(model.Group.origin == origin)
    if groupType:
        q = q.filter(model.Group.groupType == groupType)
    groupCount = q.first()
    if not groupCount:
        return 0
    return groupCount[0]

@_transactional(readOnly=True)
def countMemberGroupsActivities(session, memberID):
    return _countMemberGroupsActivities(session, memberID)

def _countMemberGroupsActivities(session, memberID, groupIDs=[]):
    q = session.query(func.count(distinct(model.GroupActivity.id)))
    q = q.join(model.Group, model.Group.id == model.GroupActivity.groupID)
    q = q.join(model.GroupHasMembers, model.GroupHasMembers.groupID == model.Group.id)
    q = q.filter(model.GroupHasMembers.memberID == memberID)
    q = q.filter(model.GroupHasMembers.roleID.in_([14,15]))
    q = q.filter(not_(model.GroupActivity.activityType.in_(['leave'])))
    q = q.filter(model.Group.isActive == 1)
    q = q.filter(model.Group.isVisible == 1)
    if groupIDs:
        q = q.filter(model.Group.id.in_(groupIDs))
    activityCount = q.first()
    if not activityCount:
        return 0
    return activityCount[0]
#
#  Assignment Related
#
@_transactional()
def createStudyTrack(session, **kwargs):
    return _createStudyTrack(session, **kwargs)

def _createStudyTrack(session, **kwargs):
    _checkAttributes([ 'creator', 'name', 'nodes'], **kwargs)

    nodes = kwargs['nodes']
    creator = kwargs['creator']
    name = kwargs['name']
    description = kwargs.get('description', None)
    handle = kwargs.get('handle', model.title2Handle(name))
    #
    #  Create the study track with the concept nodes as children.
    #
    children = []
    for node in nodes:
        children.append({ 'artifact': node.revisions[0] })
    data = {
        'name': name,
        'description': description,
        'handle': handle,
        'typeName': 'study-track',
        'creator': creator,
        'children': children,
    }
    studyTrack = _createArtifact(session, **data)
    _createStudyTrackItemContexts(session, studyTrack.id, nodes)
    session.flush()
    return studyTrack

@_transactional()
def createStudyTrackItemContexts(session, studyTrackID, nodes):
    _createStudyTrackItemContexts(session, studyTrackID, nodes)

def _createStudyTrackItemContexts(session, studyTrackID, nodes):
    existingStudyTrackItemContexts =  studyTrackItemContext._getStudyTrackItemContexts(session, studyTrackID)
    for node in nodes:
        studyTrackItemID = node.id
        kwargs = {}
        kwargs['studyTrackItemID'] = studyTrackItemID        

        contextUrl = ''
        if hasattr(node, 'contextUrl') and node.contextUrl:
            contextUrl = node.contextUrl
        kwargs['contextUrl'] = contextUrl

        conceptCollectionHandle = ''
        if hasattr(node, 'conceptCollectionHandle') and node.conceptCollectionHandle:
            conceptCollectionHandle = node.conceptCollectionHandle
        kwargs['conceptCollectionHandle'] = conceptCollectionHandle

        collectionCreatorID = 0
        if hasattr(node, 'collectionCreatorID') and node.collectionCreatorID:
            collectionCreatorID = node.collectionCreatorID
            collectionCreator = _getMemberByID(session, collectionCreatorID)
            if not collectionCreator:
                raise Exception(u"Member with the given collectionCreatorID: "+str(collectionCreatorID)+" could not be found in the database.")
        kwargs['collectionCreatorID'] = collectionCreatorID

        if (conceptCollectionHandle and not collectionCreatorID) or (not conceptCollectionHandle and collectionCreatorID):
            raise Exception((_(u"Invalid node received. node should either contain / not contain  conceptCollectionHandle & collectionCreatorID togeather.")).encode("utf-8"))              

        if (conceptCollectionHandle and collectionCreatorID) or contextUrl:
            if kwargs not in existingStudyTrackItemContexts:
                kwargs['studyTrackID'] = studyTrackID
                log.debug("Calling _createStudyTrackItemContext: %s, %s, %s, %s, %d" % (studyTrackID, studyTrackItemID, contextUrl, conceptCollectionHandle, collectionCreatorID))
                studyTrackItemContext._createStudyTrackItemContext(session, **kwargs)    
    session.flush()

@_transactional()
def countMyStudyTracks(session, memberID):
   return _countMyStudyTracks(session, memberID=memberID)

def _countMyStudyTracks(session, memberID):
    query = session.query(model.Artifact)
    query = query.filter_by(creatorID=memberID)
    query = query.filter_by(artifactTypeID=55)
    query = query.filter(~model.Artifact.handle.ilike('lms:%%'))
    query = query.filter(~model.Artifact.name.ilike('%%:ltiApp'))
    query = query.filter(~model.Artifact.name.ilike('%%:GOOGLE_CLASSROOM'))
    count = query.count()
    log.debug('_countMyStudyTracks: memberID[%s] count[%s]' % (memberID, count))
    return count

def validateDueDate(due):
    from datetime import datetime as dt, date
    import datetime

    if type(due) != datetime.datetime:
        raise ex.InvalidArgumentException((_(u'Incorrect due date format.')).encode("utf-8"))

    today = dt.combine(date.today(), datetime.time())
    if due < today:
        raise ex.InvalidArgumentException((_(u'Due date has passed.')).encode("utf-8"))

@_transactional()
def createAssignment(session, **kwargs):
    return _createAssignment(session, **kwargs)

def _createAssignment(session, **kwargs):
    _checkAttributes([ 'groupID', 'creator', 'assignmentType', 'studyTrack'], **kwargs)

    studyTrack = kwargs['studyTrack']
    creator = kwargs['creator']
    name = kwargs.get('name', studyTrack.name)
    description = kwargs.get('description', studyTrack.description)
    #
    #  Validate due date.
    #
    due = kwargs.get('due', None)
    if not due:
        due = None
    else:
        try:
            due = datetime.strptime(due, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            due = datetime.strptime(due, '%Y-%m-%d')

        validateDueDate(due)
    #
    #  Validate arguments before creating.
    #
    assignmentType = kwargs['assignmentType']
    if assignmentType not in ['assignment','self-assignment','self-study']:
        raise ex.InvalidArgumentException('Invalid assignment type[%s].' % assignmentType)

    handle = kwargs.get('handle', model.title2Handle(name))
    artifact = _getArtifactByHandle(session, handle=handle, typeID=56, creatorID=creator.id)
    if artifact:
        raise ex.AlreadyExistsException((_(u'%(artifact.type.name)s[%(handle)s] from[%(creator.email)s] exists already')  % {"artifact.type.name":artifact.type.name,"handle": handle,"creator.email": creator.email}).encode("utf-8"))
    #
    #  Create the assignment with the study track as child.
    #
    groupID = kwargs['groupID']
    origin = kwargs.get('origin', 'ck-12')
    data = {
        'name': name,
        'description': description,
        'handle': handle,
        'typeName': 'assignment',
        'creator': creator,
        'groupID': groupID,
        'assignmentType': assignmentType,
        'origin': origin,
        'due': due,
        'children': [ { 'artifact': studyTrack.revisions[0] } ],
    }
    assignment = _createArtifact(session, **data)
    return assignment

@_transactional()
def deleteMemberStudyTrackStatus(session, memberID=None, studyTrackItemID=None, assignmentID=None, groupIDs=[]):
    return _deleteMemberStudyTrackStatus(session, memberID, studyTrackItemID, assignmentID, groupIDs=groupIDs)

def _deleteMemberStudyTrackStatus(session, memberID=None, studyTrackItemID=None, assignmentID=None, groupIDs=[]):
    nodeStatusList = _getMemberStudyTrackStatus(session,
                                                memberIDs=[] if not memberID else [memberID],
                                                studyTrackItemID=studyTrackItemID,
                                                assignmentID=assignmentID,
                                                groupIDs=groupIDs)
    for nodeStatus in nodeStatusList:
        session.delete(nodeStatus)

@_transactional()
def deleteAssignment(session, memberID, assignment, deleteStudyTrack=True, cache=None):
    _deleteAssignment(session, memberID, assignment, deleteStudyTrack=deleteStudyTrack, cache=cache)

def _deleteAssignment(session, memberID, assignment, deleteStudyTrack=True, cache=None):
    objList = _createArchivedMemberStudyTrackItemStatus(session, assignment)
    if objList:
        log.debug("Archived %d MemberStudy Track Item Status(es)."%len(objList))

    assignmentID = assignment.assignmentID
    #
    #  Delete all status entries of this assignment.
    #
    _deleteMemberStudyTrackStatus(session, assignmentID=assignmentID)
    #
    #  Find its corresponding study tracks.
    #
    studyTracks = []
    if type(deleteStudyTrack) != bool:
        deleteStudyTrack = deleteStudyTrack.lower() == 'true'
    if deleteStudyTrack:
        query = session.query(model.ArtifactAndChildren)
        query = query.filter_by(id=assignmentID)
        acList = query.all()
        if acList and len(acList) > 0:
            for ac in acList:
                studyTrackID = ac.childID
                query = session.query(model.Artifact)
                query = query.filter_by(id = studyTrackID)
                studyTrack = _queryOne(query)
                if studyTrack:
                    studyTracks.append(studyTrack)
    #
    #  Delete the assignment.
    #
    _deleteArtifact(session, assignment.artifact, cache=cache)
    #
    #  Delete the study tracks.
    #
    for studyTrack in studyTracks:
        studyTrackItemContext._deleteStudyTrackItemContexts(session, studyTrackID=studyTrack.id)
        _deleteArtifact(session, studyTrack, cache=cache)

@_transactional()
def getAssignmentByID(session, id):
    return _getAssignmentByID(session, id)

def _getAssignmentByID(session, id):
    query = session.query(model.Assignment)
    query = query.filter_by(assignmentID=id)
    return _queryOne(query)

@_transactional()
def getAssignmentsByCreatorID(session, creatorID, typeIDs, artifactTypeDict, groupID=None, sort=None, pageNum=1, pageSize=10):
    return _getAssignmentsByCreatorID(session, creatorID, typeIDs, artifactTypeDict, groupID, sort, pageNum, pageSize)

def _getAssignmentsByCreatorID(session, creatorID, typeIDs, artifactTypeDict, groupID=None, sort=None, pageNum=1, pageSize=10):
    """
        It returns artifacts of types of both assignment and unassigned study track (if both specified in typeIDs).
    """
    stID = artifactTypeDict['study-track']
    asID = artifactTypeDict['assignment']
    if stID in typeIDs and asID in typeIDs:
        #
        #  Get the study tracks for this creator.
        #
        query = session.query(model.Artifact.id)
        query = query.filter_by(creatorID=creatorID)
        query = query.filter_by(artifactTypeID=stID)
        idList = query.all()
        ids = []
        for id in idList:
            ids.append(id[0])
        #
        #  Find out the study tracks that are already assigned.
        #
        query = session.query(model.ArtifactAndChildren.childID)
        query = query.filter_by(artifactTypeID=asID)
        if groupID:
            query = query.join(model.Assignment,
                               and_(model.Assignment.assignmentID == model.ArtifactAndChildren.id,
                                    model.Assignment.groupID == groupID))
        query = query.filter(model.ArtifactAndChildren.childID.in_(ids))
        idList = query.all()
        ids = []
        for id in idList:
            ids.append(id[0])

    stQuery = None
    if stID in typeIDs:
        #
        #  Get the qualified artifacts.
        #
        stQuery = session.query(model.Artifact)
        stQuery = stQuery.filter_by(creatorID=creatorID)
        stQuery = stQuery.filter_by(artifactTypeID=stID)
        stQuery = stQuery.filter(~model.Artifact.handle.ilike('lms:%%'))
        stQuery = stQuery.filter(~model.Artifact.name.ilike('%%:ltiApp'))
        stQuery = stQuery.filter(~model.Artifact.name.ilike('%%:GOOGLE_CLASSROOM'))
        if stID in typeIDs and asID in typeIDs:
            #
            #  Skip the assigned study tracks.
            #
            stQuery = stQuery.filter(not_(model.Artifact.id.in_(ids)))
        stQuery = stQuery.order_by(model.Artifact.id.desc())

    if asID not in typeIDs:
        asQuery = None
    else:
        asQuery = session.query(model.Artifact)
        asQuery = asQuery.filter_by(creatorID=creatorID)
        asQuery = asQuery.filter_by(artifactTypeID=asID)
        if not groupID:
            asQuery = asQuery.join(model.Assignment,
                                   and_(model.Assignment.assignmentID == model.Artifact.id, model.Assignment.origin == 'ck-12'))
        else:
            asQuery = asQuery.join(model.Assignment,
                                   and_(model.Assignment.assignmentID == model.Artifact.id,
                                        model.Assignment.groupID == groupID,
                                        model.Assignment.origin == 'ck-12'))
        #
        #  Sorting order for assignment specific.
        #
        sortedByDueDate = False
        if sort:
            asgn = model.Assignment
            col, order = sort.split(',')
            if col == 'due':
                oby = asgn.due
                if order == 'asc':
                    asQuery = asQuery.order_by(func.isnull(oby), asc(oby))
                else:
                    asQuery = asQuery.order_by(func.isnull(oby), desc(oby))
                sortedByDueDate = True
                sort = None

        if not sortedByDueDate:
            asQuery = asQuery.order_by(func.isnull(model.Assignment.due), desc(model.Assignment.due), desc(model.Assignment.assignmentID))

    if not asQuery:
        query = stQuery
    elif not stQuery:
        query = asQuery
    else:
        #
        #  SQLAlchemy does not put parentheses on queries between union
        #  so the order by clause won't work unless we use subquery.
        #
        stQuery = stQuery.subquery()
        asQuery = asQuery.subquery()
        query = session.query(model.Artifact).select_entity_from(union_all(stQuery.select(), asQuery.select()))
    #
    #  Sorting order.
    #
    if not sort:
        query = query.order_by(model.Artifact.artifactTypeID.desc())
    else:
        art = model.Artifact
        col, order = sort.split(',')
        oby = None
        if col == 'name':
            oby = art.name
        elif col == 'assign':
            oby = art.artifactTypeID
        if oby:
            if order == 'asc':
                query = query.order_by(asc(oby))
            else:
                query = query.order_by(desc(oby))

    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberSelfStudyCount(session, memberID):
    return _getMemberSelfStudyCount(session, memberID)

def _getMemberSelfStudyCount(session, memberID):
    return session.query(func.count(model.MemberSelfStudyItemStatus.domainID)).filter_by(memberID=memberID).scalar()

@_transactional(readOnly=True)
def getMemberAssignmentCount(session, memberID, assignmentType='assignment', fq=None, lms=False):
    return _getMemberAssignmentCount(session, memberID, assignmentType, fq=fq, lms=lms)

def _getMemberAssignmentCount(session, memberID, assignmentType='assignment', fq=None, lms=False):
    query = session.query(model.MemberStudyTrackItemStatus.assignmentID).distinct()
    query = query.filter_by(memberID=memberID)
    query = query.join(model.Assignment, model.Assignment.assignmentID == model.MemberStudyTrackItemStatus.assignmentID)
    query = query.filter(model.Assignment.assignmentType == assignmentType)
    #
    #  Exclude LMS groups if lms is False.
    #
    if not lms:
        query = query.filter(model.Assignment.origin == 'ck-12')
    else:
        query = query.filter(model.Assignment.origin == 'lms')

    if fq:
        states = []
        afterDateStr = None
        for f in fq:
            if f[0] == 'state':
                if f[1].startswith('past-due-after-'):
                    afterDateStr = f[1][15:]
                    states.append(f[1][:14])
                else:
                    states.append(f[1])
        filter = None
        today = datetime.strptime(datetime.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
        for state in states:
            if state == 'completed':
                completedFilter = model.MemberStudyTrackItemStatus.status == 'completed'
                log.debug('_getMemberAssignmentCount: completedFilter[%s]' % completedFilter)
                if filter is None:
                    filter = completedFilter
                else:
                    filter = or_(filter, completedFilter)
            elif state == 'past-due' or state == 'past-due-after':
                pastFilter = and_(
                    model.MemberStudyTrackItemStatus.status != 'completed',
                    model.Assignment.due != None,
                    model.Assignment.due != 0,
                    model.Assignment.due < today
                )
                if afterDateStr:
                    pastFilter = and_(
                        pastFilter,
                        model.Assignment.due >= afterDateStr,
                    )
                if filter is None:
                    filter = pastFilter
                else:
                    filter = or_(filter, pastFilter)
            elif state == 'upcoming':
                upcomingFilter = and_(
                    model.MemberStudyTrackItemStatus.status != 'completed',
                    or_(
                        model.Assignment.due == None,
                        model.Assignment.due == 0,
                        model.Assignment.due >= today
                    )
                )
                if filter is None:
                    filter = upcomingFilter
                else:
                    filter = or_(filter, upcomingFilter)
            else:
                raise ex.InvalidArgumentException('Invalid filter value[state,%s].' % state)
        log.debug('_getMemberAssignmentCount: filter[%s]' % filter)
        query = query.filter(filter)
    aids = query.all()
    log.debug('_getMemberAssignmentCount: aids[%s]' % aids)
    count = len(aids)
    log.debug('_getMemberAssignmentCount: count[%s]' % count)
    return count

@_transactional(readOnly=True)
def getAssignmentsByMemberID(session, memberID, pageNum, pageSize):
    return _getAssignmentsByMemberID(session, memberID, pageNum, pageSize)

def _getAssignmentsByMemberID(session, memberID, pageNum, pageSize):
    q = session.query(model.Assignment).distinct()
    q = q.join(model.MemberStudyTrackItemStatus, model.Assignment.assignmentID == model.MemberStudyTrackItemStatus.assignmentID)
    q = q.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
    q = q.filter(model.Assignment.assignmentType == 'assignment')
    q = q.order_by(func.isnull(model.Assignment.due), desc(model.Assignment.due), desc(model.Assignment.assignmentID))
    page = p.Page(q, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getGroupAssignmentsCount(session, groupID, lms=False):
    return _getGroupAssignmentsCount(session, groupID, lms=lms)

def _getGroupAssignmentsCount(session, groupID, lms=False):
    query = session.query(func.count(model.Assignment.assignmentID))
    query = query.filter_by(groupID=groupID)
    if not lms:
        query = query.join(model.Artifact, model.Artifact.id == model.Assignment.assignmentID)
        query = query.filter(~model.Artifact.handle.ilike('lms:%%'))
        query = query.filter(~model.Artifact.name.ilike('%%:ltiApp'))
    counts = query.first()
    if not counts:
        return 0
    return counts[0]

@_transactional(readOnly=True)
def getAssignmentsByGroupID(session, groupID, memberID=None, pageNum=0, pageSize=0):
    return _getAssignmentsByGroupID(session, groupID, memberID=memberID, pageNum=pageNum, pageSize=pageSize)

def _getAssignmentsByGroupID(session, groupID, memberID=None, pageNum=0, pageSize=0):
    q = session.query(model.Assignment).distinct()
    q = q.filter(model.Assignment.groupID == groupID)
    if memberID:
        q = q.join(model.MemberStudyTrackItemStatus, model.Assignment.assignmentID == model.MemberStudyTrackItemStatus.assignmentID)
        q = q.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
        q = q.filter(model.Assignment.assignmentType == 'assignment')
    q = q.order_by(func.isnull(model.Assignment.due), desc(model.Assignment.due), desc(model.Assignment.assignmentID))
    log.debug('_getAssignmentsByGroupID: q[%s]' % q)
    page = p.Page(q, pageNum=pageNum, pageSize=pageSize)
    return page

@_transactional(readOnly=True)
def getAssignments(session, assignmentIDs=None, groupID=None):
    return _getAssignments(session, assignmentIDs, groupID)

def _getAssignments(session, assignmentIDs=None, groupID=None):
    query = session.query(model.Assignment).distinct()
    query = query.join(model.Group, and_(model.Group.id == model.Assignment.groupID, model.Group.isActive == 1, model.Group.isVisible == 1))
    if assignmentIDs:
        query = query.filter(model.Assignment.assignmentID.in_(assignmentIDs))
    if groupID:
        query = query.filter(model.Assignment.groupID == groupID)
    query = query.order_by(func.isnull(model.Assignment.due), desc(model.Assignment.due), desc(model.Assignment.assignmentID))
    return query.all();

@_transactional(readOnly=True)
def getAssignmentsByFilters(session, assignmentIDs=None, groupID=None, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getAssignmentsByFilters(session, assignmentIDs, groupID, filters, sort, pageNum, pageSize)

def _getAssignmentsByFilters(session, assignmentIDs=None, filters=None, sort=None, pageNum=0, pageSize=0):
    fields = {
    'creatorID': model.Artifact.creatorID,
    'groupID': model.Assignment.groupID,
    'due': model.Assignment.due,
    'providerID': model.LMSProviderAssignment.providerID,
    'appID': model.LMSProviderApp.appID,
    'artifactType': model.ArtifactType.name,
    'updateTime': model.Artifact.updateTime,
    'creationTime': model.Artifact.creationTime,
    'title': model.Artifact.name,
    'id': model.Artifact.id,
    'origin': model.Assignment.origin,
    'assignmentID': model.Assignment.assignmentID,
    }
    query = session.query(model.Assignment)
    query = query.join(model.Artifact, model.Assignment.assignmentID == model.Artifact.id)
    query = query.outerjoin(model.LMSProviderAssignment, model.Assignment.assignmentID == model.LMSProviderAssignment.assignmentID)
    #query = query.outerjoin(model.LMSProviderApp, model.LMSProviderAssignment.providerID == model.LMSProviderApp.providerID)
    if assignmentIDs:
        query = query.filter(model.Assignment.assignmentID.in_(assignmentIDs))

    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filterFld
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            if filterFld == 'due':
                now = datetime.now()
                if 'upcoming' in filter:
                    query = query.filter(and_(or_((model.Assignment.due) >= now, (model.Assignment.due) == None)))
                elif 'past' in filter:
                    query = query.filter(and_(model.Assignment.due) < now)
            else:
                query = query.filter(fields[filterFld].in_(filter))
    if not sort:
        sort = 'due,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getMemberIncompleteAssignments(session, **kwargs):
    return _getMemberIncompleteAssignments(session, **kwargs)

def _getMemberIncompleteAssignments(session, **kwargs):
    _checkAttributes(['memberID', 'artifactTypeDict'], **kwargs)
    log.debug('_getMemberIncompleteAssignments: kwargs[%s]' % kwargs)
    artifactTypeDict = kwargs['artifactTypeDict']
    groupIDs = kwargs.get('groupIDs', None)
    memberID = kwargs['memberID']
    assignmentType = kwargs['assignmentType']
    eids = kwargs.get('eids', None)
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    today = datetime.strptime(datetime.now().__format__('%m/%d/%Y'), '%m/%d/%Y')
    lms = kwargs.get('lms', False)
    fq = kwargs.get('fq')
    sort = kwargs.get('sort')
    countOnly = kwargs.get('countOnly', False)
    if memberID is None or fq is None:
        raise ex.MissingArgumentException('Required parameters are missing')

    log.info('fq[%s]' % fq)
    hasState = False
    afterDateStr = ''
    afterDate = None
    if fq:
        for f in fq:
            if f[0] == 'state' and f[1] == 'all':
                #
                #  Clear fq to skip processing later.
                #
                fq = None
                break
            if f[0] == 'state' and (f[1] == 'past-due' or f[1].startswith('past-due-after-') or f[1] == 'upcoming'):
                if f[1].startswith('past-due-after-'):
                    afterDateStr = f[1][15:]
                hasState = True
                break
    if fq and not hasState:
        raise ex.MissingArgumentException('Required parameters are missing')

    if afterDateStr:
        afterDate = datetime.strptime(afterDateStr, '%Y%m%d')

    stID = artifactTypeDict['study-track']
    asID = artifactTypeDict['assignment']

    query = session.query(model.Artifact)
    if not lms:
        query = query.filter(~model.Artifact.handle.ilike('lms:%%'))
        query = query.filter(~model.Artifact.name.ilike('%%:ltiApp'))
        query = query.filter(~model.Artifact.name.ilike('%%:GOOGLE_CLASSROOM'))

    assignAlias = aliased(model.Assignment)
    msAlias = aliased(model.MemberStudyTrackItemStatus)
    sq = session.query(func.count(model.MemberStudyTrackItemStatus.studyTrackItemID).label('statusCount'), model.MemberStudyTrackItemStatus.assignmentID)
    sq = sq.filter(and_(model.MemberStudyTrackItemStatus.memberID == memberID, model.MemberStudyTrackItemStatus.status == 'incomplete'))
    sq = sq.group_by(model.MemberStudyTrackItemStatus.assignmentID)
    subquery = sq.subquery()

    query = query.join(assignAlias, assignAlias.assignmentID == model.Artifact.id)
    if assignmentType != 'self-study':
        query = query.join(model.Group, and_(model.Group.id == assignAlias.groupID, model.Group.isActive == 1, model.Group.isVisible == 1))
    query = query.join(msAlias, and_(assignAlias.assignmentID == msAlias.assignmentID, msAlias.memberID == memberID))
    #query = query.join(msAlias, assignAlias.assignmentID == msAlias.assignmentID)
    query = query.filter(assignAlias.assignmentType == assignmentType)
    if groupIDs:
        query = query.filter(assignAlias.groupID.in_(groupIDs))
    if not lms:
        query = query.filter(assignAlias.origin == 'ck-12')
    else:
        query = query.filter(assignAlias.origin == 'lms')
    #
    #  Prepare filters.
    #
    and1 = and_(
        subquery.c.statusCount != 0,
        subquery.c.assignmentID == assignAlias.assignmentID
    )

    pastFilterDue = and_(
        assignAlias.due != None,
        assignAlias.due != 0,
        assignAlias.due < today
    )

    if afterDate:
        pastFilterDue = and_(
            pastFilterDue,
            assignAlias.due >= afterDate,
        )

    pastFilter = and_(
        pastFilterDue,
        and1
    )

    upcomingFilter = and_(
        or_(
            assignAlias.due == None,
            assignAlias.due == 0,
            assignAlias.due >= today
        ),
        and1
    )

    innerFilter = None
    if not fq:
        includeStudyTracks = ( assignmentType == 'self-study' )
    else:
        includeStudyTracks = False
        for f in fq:
            if f[0] == 'state' and (f[1] == 'past-due' or f[1].startswith('past-due-after-')):
                if innerFilter is None:
                    innerFilter = pastFilter
                else:
                    innerFilter = or_(innerFilter, pastFilter)
            if f[0] == 'state' and f[1] == 'upcoming':
                includeStudyTracks = True
                if innerFilter is None:
                    innerFilter = upcomingFilter
                else:
                    innerFilter = or_(innerFilter, upcomingFilter)
    if innerFilter is not None and eids is None:
        query = query.filter(innerFilter)

    query = query.group_by(model.Artifact.id)

    log.info('sort[%s]' % sort)

    if assignmentType == 'assignment':
        sortedByDueDate = False
        if sort:
            col, order = sort.split(',')
            if col == 'due':
                oby = assignAlias.due
                if order == 'asc':
                    query = query.order_by(func.isnull(oby), asc(oby))
                else:
                    query = query.order_by(func.isnull(oby), desc(oby))
                sortedByDueDate = True
                sort = None

        if not sortedByDueDate:
            query = query.order_by(func.isnull(assignAlias.due), assignAlias.due)
    elif eids:
        query =  query.order_by(model.Artifact.handle)
    else:
        query = query.order_by(func.max(msAlias.lastAccess).desc())

    if eids:
        log.debug('_getMemberIncompleteAssignments: study track eids%s' % eids)
        query = query.filter(model.Artifact.handle.in_(eids))

        if includeStudyTracks and assignmentType == 'self-study':
            #
            #  Find the study tracks that have assignments already,
            #  and filter them out.
            #
            artifacts = query.all()
            ids = []
            for artifact in artifacts:
                if artifact.artifactTypeID == asID:
                    ids.append(artifact.id)
            cQuery = session.query(model.ArtifactAndChildren.childID)
            cQuery = cQuery.filter(model.ArtifactAndChildren.id.in_(ids))
            children = cQuery.all()
            ids = []
            for child in children:
                ids.append(child[0])
            log.debug('_getMemberIncompleteAssignments: filtering out artifact ids%s' % ids)

            eidQuery = session.query(model.Artifact)
            eidQuery = eidQuery.filter(model.Artifact.handle.in_(eids))
            eidQuery = eidQuery.filter(not_(model.Artifact.id.in_(ids)))
            eidQuery = eidQuery.filter_by(artifactTypeID=stID)
            eidQuery = eidQuery.group_by(model.Artifact.id)
            eidQuery = eidQuery.order_by(model.Artifact.handle)
            eidQuery = eidQuery.subquery()
            #
            #  SQLAlchemy does not put parentheses on queries between union
            #  so the order by clause won't work unless we use subquery.
            #
            inQuery = query.subquery()
            query = session.query(model.Artifact)
            query = query.select_entity_from(union_all(inQuery.select(), eidQuery.select()))
            query = query.group_by(model.Artifact.id)
            query = query.order_by(model.Artifact.handle)
    page = p.Page(query, pageNum, pageSize)
    if countOnly:
        return page.total
    #
    #  Convert artifacts into assignments.
    #
    ids = []
    for artifact in page:
        ids.append(artifact.id)
    log.debug('_getMemberIncompleteAssignments: resulting artifact ids%s' % ids)
    query = session.query(model.Assignment)
    query = query.filter(model.Assignment.assignmentID.in_(ids))
    assignmentList = query.all()
    assignmentDict = {}
    for assignment in assignmentList:
        assignmentDict[assignment.assignmentID] = assignment
    assignments = []
    for artifact in page:
        assignment = assignmentDict.get(artifact.id, None)
        if not assignment:
            #
            #  Create a fake one.
            #
            data = {
                'assignmentID': artifact.id,
                'assignmentType': 'self-study',
            }
            assignment = model.Assignment(**data)
            assignment.artifact = artifact
            assignment.group = None
        assignments.append(assignment)
    page.results = assignments
    return page

@_transactional(readOnly=True)
def getMemberAssignments(session, **kwargs):
    return _getMemberAssignments(session, **kwargs)

def _getMemberAssignments(session, **kwargs):
    _checkAttributes(['memberID', 'assignmentType'], **kwargs)
    assignmentID = kwargs.get('assignmentID')
    groupIDs = kwargs.get('groupIDs', None)
    defaultStates = ['completed', 'incomplete']
    states = kwargs.get('states')
    if not states:
        states = []
    memberID = kwargs['memberID']
    assignmentType = kwargs['assignmentType']
    eids = kwargs.get('eids', None)
    lms = kwargs.get('lms', False)
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    if memberID is None:
        raise ex.MissingArgumentException('Required parameters are missing')

    isSelfStudy = kwargs.get('isSelfStudy', False)

    if assignmentID:
        if isSelfStudy:
            query = _constructMemberSelfStudyQuery(session, memberID, assignmentType, eids, groupIDs, states, assignmentID=assignmentID, lms=lms)
        else:
            query = _constructMemberAssignmentQuery(session, memberID, assignmentType, eids, groupIDs, states, assignmentID=assignmentID, lms=lms)
    else:
        for state in states:
            if state not in defaultStates:
                raise ex.InvalidArgumentException('Invalid filter value[state,%s].' % state)
        if isSelfStudy:
            query = _constructMemberSelfStudyQuery(session, memberID, assignmentType, eids, groupIDs, states, lms=lms)
        else:
            query = _constructMemberAssignmentQuery(session, memberID, assignmentType, eids, groupIDs, states, lms=lms)
    countCol = model.Assignment.assignmentID if not isSelfStudy else None
    page = p.Page(query, pageNum, pageSize, countCol=countCol)
    log.debug('_getMemberAssignments: page[%s]' % page)
    if isSelfStudy:
        if page:
            rl = []
            for r in page.results:
                assignment, la = r
                rl.append(assignment)
            page.results = rl
    return page

def _constructMemberAssignmentQuery(session, memberID, assignmentType, eids, groupIDs, states, assignmentID=None, lms=False):

    def commonQuery(query, assign_alias):
        query = query.filter(assign_alias.assignmentType == assignmentType)
        if not lms:
            query = query.filter(assign_alias.origin == 'ck-12')
        else:
            query = query.filter(assign_alias.origin == 'lms')
            query = query.join(model.LMSProviderAssignment, model.LMSProviderAssignment.assignmentID == assign_alias.assignmentID)
            query = query.filter(model.LMSProviderAssignment.isValid == 1)
        if eids or not lms:
            query = query.join(model.Artifact, model.Artifact.id == assign_alias.assignmentID)
            if eids:
                query = query.filter(model.Artifact.handle.in_(eids))
            if not lms:
                query = query.filter(~model.Artifact.handle.ilike('lms:%%'))
                query = query.filter(~model.Artifact.name.ilike('%%:ltiApp'))
                query = query.filter(~model.Artifact.name.ilike('%%:GOOGLE_CLASSROOM'))
        if groupIDs:
            query = query.filter(assign_alias.groupID.in_(groupIDs))
        else:
            query = query.join(model.GroupHasMembers, and_(model.GroupHasMembers.groupID == assign_alias.groupID, model.GroupHasMembers.memberID == memberID, model.GroupHasMembers.roleID == 14))
        query = query.join(model.MemberStudyTrackItemStatus, model.MemberStudyTrackItemStatus.assignmentID == assign_alias.assignmentID)
        query = query.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
        return query

    log.debug('_constructMemberAssignmentQuery: memberID[%s]' % memberID)
    log.debug('_constructMemberAssignmentQuery: assignmentType[%s]' % assignmentType)
    log.debug('_constructMemberAssignmentQuery: eids%s' % eids)
    log.debug('_constructMemberAssignmentQuery: groupIDs%s' % groupIDs)
    log.debug('_constructMemberAssignmentQuery: states[%s]' % states)
    log.debug('_constructMemberAssignmentQuery: lms[%s]' % lms)
    log.debug('_constructMemberAssignmentQuery: assignmentID[%s]' % assignmentID)

    assign_alias = model.Assignment
    query = session.query(assign_alias).distinct()
    query = commonQuery(query, assign_alias)
    # prepare filters
    filter = None
    if assignmentID:
        filter = assign_alias.assignmentID == assignmentID
    else:
        for state in states:
            sFilter = model.MemberStudyTrackItemStatus.status == state
            if filter is None:
                filter = sFilter
            else:
                filter = or_(filter, sFilter)
    if filter is not None:
        query = query.filter(filter)

    if states and len(states) == 1 and states[0] == 'completed':
        assign_alias2 = aliased(model.Assignment)
        sq = session.query(assign_alias2.assignmentID).distinct()
        sq = commonQuery(sq, assign_alias2)
        sq = sq.filter(model.MemberStudyTrackItemStatus.status == 'completed')
        subquery1 = sq.subquery()
        sq = session.query(model.MemberStudyTrackItemStatus.assignmentID).distinct()
        sq = sq.filter_by(memberID=memberID)
        sq = sq.filter_by(status='incomplete')
        sq = sq.filter(model.MemberStudyTrackItemStatus.assignmentID.in_(subquery1))
        subquery2 = sq.subquery()
        query = query.filter(not_(assign_alias.assignmentID.in_(subquery2)))

    query = query.order_by(func.isnull(model.Assignment.due), desc(model.Assignment.due), desc(model.Assignment.assignmentID))
    return query

@_transactional(readOnly=True)
def getMemberSelfStudyItemStatusesByMemberID(session, memberID, domainEncodedID=None, conceptCollectionHandle=None, collectionHandle=None, collectionCreatorID=None, contextUrl=None, offset=0, limit=0):
    return _getMemberSelfStudyItemStatusesByMemberID(session, memberID, domainEncodedID, conceptCollectionHandle, collectionHandle, collectionCreatorID, contextUrl, offset, limit)
   
def _getMemberSelfStudyItemStatusesByMemberID(session, memberID, domainEncodedID=None, conceptCollectionHandle=None, collectionHandle=None, collectionCreatorID=None, contextUrl=None, offset=0, limit=0):
    memberSelfStudyItemStatusesQuery = session.query(model.MemberSelfStudyItemStatus).filter(model.MemberSelfStudyItemStatus.memberID == memberID)

    if domainEncodedID:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.filter(model.MemberSelfStudyItemStatus.item.has(encodedID=domainEncodedID))

    if conceptCollectionHandle:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.filter(model.MemberSelfStudyItemStatus.conceptCollectionHandle == conceptCollectionHandle)

    if collectionHandle:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.filter(model.MemberSelfStudyItemStatus.conceptCollectionHandle.like(collectionHandle+COLLECTION_HANDLE_IDENTIFIERS_SEPARATOR+'%'))

    if collectionCreatorID:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.filter(model.MemberSelfStudyItemStatus.collectionCreatorID == collectionCreatorID)

    if contextUrl:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.filter(model.MemberSelfStudyItemStatus.contextUrl == contextUrl)

    memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.order_by(model.MemberSelfStudyItemStatus.lastAccess.desc())
    if offset:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.offset(offset)
    if limit:
        memberSelfStudyItemStatusesQuery = memberSelfStudyItemStatusesQuery.limit(limit)
    return memberSelfStudyItemStatusesQuery.all()


@_transactional(readOnly=True)
def getArtifactsByEncodedIDs(session, encodedIDs, creatorID=None, artifactTypeID=None):
    return _getArtifactsByEncodedIDs(session, encodedIDs, creatorID, artifactTypeID)
 
def _getArtifactsByEncodedIDs(session, encodedIDs, creatorID=None, artifactTypeID=None):
    artifactsQuery = session.query(model.Artifact).filter(model.Artifact.encodedID.in_(encodedIDs))
    if creatorID:
        artifactsQuery.filter(model.Artifact.creatorID == creatorID)
    if artifactTypeID:
        artifactsQuery.filter(model.Artifact.artifactTypeID == artifactTypeID)
    return artifactsQuery.all()


def _constructMemberSelfStudyQuery(session, memberID, assignmentType, eids, groupIDs, states, assignmentID=None, lms=False):
    log.debug('_constructMemberSelfStudyQuery: memberID[%s]' % memberID)
    log.debug('_constructMemberSelfStudyQuery: assignmentType[%s]' % assignmentType)
    log.debug('_constructMemberSelfStudyQuery: eids%s' % eids)
    log.debug('_constructMemberSelfStudyQuery: groupIDs%s' % groupIDs)
    log.debug('_constructMemberSelfStudyQuery: states[%s]' % states)
    log.debug('_constructMemberSelfStudyQuery: lms[%s]' % lms)
    log.debug('_constructMemberSelfStudyQuery: assignmentID[%s]' % assignmentID)

    assign_alias = aliased(model.Assignment)
    la = func.max(model.MemberStudyTrackItemStatus.lastAccess).label('la')
    query = session.query(assign_alias, la)
    query = query.filter(assign_alias.assignmentType == assignmentType)
    if not lms:
        query = query.filter(assign_alias.origin == 'ck-12')
    else:
        query = query.filter(assign_alias.origin == 'lms')
    if eids:
        query = query.join(model.Artifact, model.Artifact.id == assign_alias.assignmentID)
        query = query.filter(model.Artifact.handle.in_(eids))
    if groupIDs:
        query = query.filter(assign_alias.groupID.in_(groupIDs))

    # prepare filters
    query = query.join(model.MemberStudyTrackItemStatus, model.MemberStudyTrackItemStatus.assignmentID == assign_alias.assignmentID)
    query = query.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
    query = query.group_by(assign_alias.assignmentID)

    filter = None
    if assignmentID:
        filter = assign_alias.assignmentID == assignmentID
    else:
        for state in states:
            sFilter = model.MemberStudyTrackItemStatus.status == state
            if filter is None:
                filter = sFilter
            else:
                filter = or_(filter, sFilter)
    if filter is not None:
        query = query.filter(filter)

    query = query.order_by(la.desc(), func.isnull(assign_alias.due))
    return query

@_transactional(readOnly=True)
def countMemberCompletedAssignments(session, **kwargs):
    return _countMemberCompletedAssignments(session, **kwargs)

def _countMemberCompletedAssignments(session, **kwargs):
    """
    Counts total no.of assignments/self-study compeleted by an user
    if group is provided then for that group count will be calculated
    """
    _checkAttributes(['memberID', 'assignmentType'], **kwargs)
    groupID = kwargs.get('groupID', None)
    memberID = kwargs['memberID']
    assignmentType = kwargs['assignmentType']
    eids = kwargs.get('eids', None)
    if memberID is None:
        raise ex.MissingArgumentException('Required parameters are missing')

    assign_alias = aliased(model.Assignment)

    # completed concept count
    sq = session.query(func.count(model.MemberStudyTrackItemStatus.studyTrackItemID).label('statusCount'),model.MemberStudyTrackItemStatus.assignmentID)
    sq = sq.filter(and_(model.MemberStudyTrackItemStatus.memberID == memberID, model.MemberStudyTrackItemStatus.status == 'completed'))
    sq = sq.group_by(model.MemberStudyTrackItemStatus.assignmentID)
    subquery = sq.subquery()

    # total concept count
    sq1 = session.query(func.count(model.MemberStudyTrackItemStatus.studyTrackItemID).label('totalCount'),model.MemberStudyTrackItemStatus.assignmentID)
    sq1 = sq1.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
    sq1 = sq1.group_by(model.MemberStudyTrackItemStatus.assignmentID)
    subquery1 = sq1.subquery()

    q = session.query(func.count(distinct(assign_alias.assignmentID)))
    q = q.filter(assign_alias.assignmentType == assignmentType)
    if eids:
        q = q.join(model.Artifact, model.Artifact.id == assign_alias.assignmentID)
        q = q.filter(model.Artifact.handle.in_(eids))
    if groupID:
        q = q.filter(assign_alias.groupID == groupID)
    # prepare filters
    completedFilter = and_(subquery.c.statusCount == subquery1.c.totalCount, subquery.c.assignmentID == subquery1.c.assignmentID, subquery.c.assignmentID==assign_alias.assignmentID)
    q = q.filter(completedFilter)

    log.debug('Query %s' % q)
    aCount = q.first()
    if not aCount:
        return 0
    return aCount[0]

@_transactional(readOnly=True)
def hasNewAssignment(session, groupID):
    return _hasNewAssignment(session, groupID)

@trace
def _hasNewAssignment(session, groupID):
    global config
    assignment_new_period = config.get('assignment_new_period')
    if not assignment_new_period:
        config = h.load_pylons_config()
        assignment_new_period = config.get('assignment_new_period', 7)
    log.debug("assignment_new_period=[%s]"%assignment_new_period)

    q = session.query(func.count(model.Assignment.assignmentID))
    q = q.join(model.Artifact, model.Artifact.id == model.Assignment.assignmentID)
    q = q.filter(model.Assignment.groupID == groupID)
    q = q.filter(model.Assignment.assignmentType == 'assignment')
    q = q.filter(func.datediff(datetime.now(), model.Artifact.creationTime) <= assignment_new_period)
    counts = q.first()
    if not counts:
        return 0
    return 1 if counts[0] != 0 else 0

@_transactional(readOnly=True)
def getMemberStudyTrackStatus(session, memberIDs=[], studyTrackItemID=None, assignmentID=None, assignmentIDs=[], groupIDs=[], includeTrackArtifact=False):
    return _getMemberStudyTrackStatus(session, memberIDs, studyTrackItemID, assignmentID, assignmentIDs=assignmentIDs, groupIDs=groupIDs, includeTrackArtifact=includeTrackArtifact)

def _getMemberStudyTrackStatus(session, memberIDs=[], studyTrackItemID=None, assignmentID=None, assignmentIDs=[], groupIDs=[], includeTrackArtifact=False):
    # If none of the filters found return blank list
    log.debug('_getMemberStudyTrackStatus: memberIDs%s' % memberIDs)
    log.debug('_getMemberStudyTrackStatus: studyTrackItemID[%s]' % studyTrackItemID)
    log.debug('_getMemberStudyTrackStatus: assignmentID[%s]' % assignmentID)
    log.debug('_getMemberStudyTrackStatus: assignmentIDs[%s]' % assignmentIDs)
    log.debug('_getMemberStudyTrackStatus: groupIDs%s' % groupIDs)
    if not memberIDs and not studyTrackItemID and not assignmentID and not assignmentIDs:
        return []
    if includeTrackArtifact:
        q = session.query(model.MemberStudyTrackItemStatus, model.ArtifactAndRevision).distinct()
        q = q.group_by(model.MemberStudyTrackItemStatus.assignmentID, model.ArtifactAndRevision.id)
        q = q.join(model.ArtifactAndRevision, model.ArtifactAndRevision.id == model.MemberStudyTrackItemStatus.studyTrackItemID)
    else:
        q = session.query(model.MemberStudyTrackItemStatus).distinct()

    if groupIDs:
        q = q.join(model.Assignment, model.MemberStudyTrackItemStatus.assignmentID == model.Assignment.assignmentID)
        q = q.filter(model.Assignment.groupID.in_(groupIDs))
        q = q.join(model.GroupHasMembers, model.MemberStudyTrackItemStatus.memberID == model.GroupHasMembers.memberID)
        q = q.filter(model.GroupHasMembers.groupID.in_(groupIDs))

    if memberIDs:
        q = q.filter(model.MemberStudyTrackItemStatus.memberID.in_(memberIDs))
    if studyTrackItemID:
        q = q.filter(model.MemberStudyTrackItemStatus.studyTrackItemID == studyTrackItemID)
    if assignmentID:
        q = q.filter(model.MemberStudyTrackItemStatus.assignmentID == assignmentID)
    elif assignmentIDs:
        q = q.filter(model.MemberStudyTrackItemStatus.assignmentID.in_(assignmentIDs))
        q = q.order_by(model.MemberStudyTrackItemStatus.assignmentID)

    nodeStatusList = q.all()
    return nodeStatusList

@_transactional(readOnly=True)
def getMemberStudyTrackStatusByAssignment(session, memberID, assignmentID):
    return _getMemberStudyTrackStatusByAssignment(session, memberID, assignmentID)

def _getMemberStudyTrackStatusByAssignment(session, memberID, assignmentID):
    query = session.query(model.MemberStudyTrackItemStatus)
    query = query.filter_by(memberID = memberID)
    query = query.filter_by(assignmentID = assignmentID)
    query = query.order_by(model.MemberStudyTrackItemStatus.studyTrackItemID.asc())
    return query.all()

@_transactional(readOnly=True)
def getMemberStudyTrackStatusByItemID(session, memberID, studyTrackItemID, groupIDs=None):
    return _getMemberStudyTrackStatusByAssignment(session, memberID, studyTrackItemID, groupIDs=groupIDs)

def _getMemberStudyTrackStatusByItemID(session, memberID, studyTrackItemID, groupIDs=None):
    query = session.query(model.MemberStudyTrackItemStatus)
    query = query.filter_by(memberID = memberID)
    query = query.filter_by(studyTrackItemID = studyTrackItemID)
    if groupIDs:
        query = query.join(model.Assignment, model.Assignment.assignmentID == model.MemberStudyTrackItemStatus.assignmentID)
        query = query.filter(model.Assignment.groupID.in_(groupIDs))
    query = query.order_by(model.MemberStudyTrackItemStatus.assignmentID.desc(),
                           model.MemberStudyTrackItemStatus.studyTrackItemID.asc())
    return query.all()

def _getPracticeModalityForEID(session, domainEID, conceptCollectionHandle=None):
    practiceArt = None
    domainTerm = _getBrowseTermByEncodedID(session, encodedID=domainEID)
    log.debug("Found domain term for %s: %s" % (domainEID, domainTerm))
    if domainTerm:
        practiceType = _getArtifactTypeByName(session, 'asmtpractice')
        ## Get corresponding practice
        practiceArts = _getRelatedArtifactsForDomains(session, domainIDs=[domainTerm.id], conceptCollectionHandle=conceptCollectionHandle, typeIDs=[practiceType.id], ownedBy='ck12')
        if practiceArts:
            practiceArt = practiceArts[0]
        log.debug("Found practice artifact for %s: %s" % (domainEID, practiceArt))

    return practiceArt

def _getDomainArtifactForModality(session, artifactID, typeName, conceptCollectionHandle=None, collectionCreatorID=3):
    domainArt = None
    modalityType = _getArtifactTypeByName(session, typeName)
    query = session.query(model.RelatedArtifactsAndLevels)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    query = query.filter(model.RelatedArtifactsAndLevels.id == artifactID)
    query = query.filter(model.RelatedArtifactsAndLevels.artifactTypeID == modalityType.id)
    a = query.first()
    if a and a.domainEID:
        domainArt = _getArtifactByEncodedID(session, a.domainEID)

    return domainArt

@_transactional(readOnly=True)
def getMemberStudyTrackStatusByEID(session, memberID, eid, groupIDs=[]):
    return _getMemberStudyTrackStatusByEID(session, memberID, eid, groupIDs=groupIDs)

def _getMemberStudyTrackStatusByEID(session, memberID, eid, groupIDs=[], conceptCollectionHandle=None):
    #
    #  Get the study track status ids that have this eid.
    #
    log.debug('_getMemberStudyTrackStatusByEID: memberID[%s]' % memberID)
    log.debug('_getMemberStudyTrackStatusByEID: eid[%s]' % eid)
    log.debug('_getMemberStudyTrackStatusByEID: groupIDs[%s]' % groupIDs)
    log.debug('_getMemberStudyTrackStatusByEID: conceptCollectionHandle[%s]' % conceptCollectionHandle)
    ## If a practice modality or the domain is assigned, we should return the assignment is either case.
    practiceArt = domainArt = None
    if '.' in eid: ## Valid EID
        practiceArt = _getPracticeModalityForEID(session, eid, conceptCollectionHandle=conceptCollectionHandle)
    else:          ## Probably a modality id
        domainArt = _getDomainArtifactForModality(session, artifactID=eid, typeName='asmtpractice')

    query = session.query(model.MemberStudyTrackItemStatus)
    query = query.filter_by(memberID = memberID)
    query = query.join(model.Artifact, model.Artifact.id == model.MemberStudyTrackItemStatus.studyTrackItemID)
    orTerms = [
            model.MemberStudyTrackItemStatus.studyTrackItemID == eid,
            model.Artifact.encodedID.op('regexp')(getRegExpForEncodedID(eid)),
            ]
    if practiceArt:
        orTerms.append(model.MemberStudyTrackItemStatus.studyTrackItemID == practiceArt.id)
    elif domainArt:
        orTerms.append(model.MemberStudyTrackItemStatus.studyTrackItemID == domainArt.id)
    query = query.filter(or_(*orTerms))
    if groupIDs:
        query = query.join(model.Assignment, model.Assignment.assignmentID == model.MemberStudyTrackItemStatus.assignmentID)
        query = query.filter(model.Assignment.groupID.in_(groupIDs))
    query = query.order_by(model.MemberStudyTrackItemStatus.assignmentID.desc(),
                           model.MemberStudyTrackItemStatus.studyTrackItemID.asc())
    sts = query.all()
    #
    #  Get the encodedID for these study track status entries.
    #
    ids = []
    for st in sts:
        ids.append(st.studyTrackItemID)
    query = session.query(model.Artifact.id, model.Artifact.encodedID)
    query = query.filter(model.Artifact.id.in_(ids))
    query = query.order_by(model.Artifact.encodedID)
    ids = query.all()
    return sts, ids

@_transactional(readOnly=True)
def getAssignedGroups(session, assignmentID):
    return _getAssignedGroups(session, assignmentID)

def _getAssignedGroups(session, assignmentID, appID=None, memberID=None):
    query = session.query(model.Group, model.Assignment.assignmentType, model.Assignment.due)
    query = query.join(model.Assignment, model.Assignment.groupID == model.Group.id)
    query = query.filter(model.Assignment.assignmentID == assignmentID)
    if appID:
        query = query.filter(model.Assignment.origin == 'lms')
        query = query.join(model.LMSProviderGroup, model.LMSProviderGroup.groupID == model.Group.id)
        query = query.filter(model.LMSProviderGroup.appID == appID)

        if memberID:
            query = query.join(model.LMSProviderGroupMember,
                                       model.LMSProviderGroup.providerGroupID == model.LMSProviderGroupMember.providerGroupID)
            query = query.filter(model.LMSProviderGroupMember.memberID == memberID)
    else:
        query = query.filter(model.Assignment.origin == 'ck-12')
    query = query.order_by(model.Group.id.asc())
    return query.all()

@_transactional()
def createMemberStudyTrackItemStatus(session, **kwargs):
    return _createMemberStudyTrackItemStatus(session, **kwargs)

def _createMemberStudyTrackItemStatus(session, **kwargs):
    nodeStatus = model.MemberStudyTrackItemStatus(**kwargs)
    _checkAttributes(['assignmentID','memberID','studyTrackItemID'], **kwargs)
    nodeStatus.score = None
    nodeStatus.lastAccess = None
    nodeStatus.status = 'incomplete'
    session.add(nodeStatus)
    return nodeStatus

@_transactional(readOnly=True)
def getMemberStudyTrackAverage(session, memberID, assignmentType, assignmentID=None):
    return _getMemberStudyTrackAverage(session, memberID= memberID, assignmentType=assignmentType, assignmentID=assignmentID)

def _getMemberStudyTrackAverage(session, memberID, assignmentType, assignmentID=None):
    # memberID and assignmentType are required
    if memberID is None and assignmentType is None:
        return []
    q = session.query(func.sum(model.MemberStudyTrackItemStatus.score),func.count(model.MemberStudyTrackItemStatus.studyTrackItemID))
    q = q.filter(model.MemberStudyTrackItemStatus.memberID == memberID)
    q = q.filter(not_(and_(model.MemberStudyTrackItemStatus.status == 'completed', model.MemberStudyTrackItemStatus.score == None)))
    if assignmentID:
        q = q.filter(model.MemberStudyTrackItemStatus.assignmentID == assignmentID)
    row = _queryOne(q)

    if row[0] and row[1] and row[1] > 0:
        return int(row[0] / row[1])
    return 0

@_transactional()
def deleteRelatedArtifactsForArtifact(session, artifactID, conceptCollectionHandle=None, collectionCreatorID=3):
    _deleteRelatedArtifactsForArtifact(session, artifactID, conceptCollectionHandle, collectionCreatorID)

def _deleteRelatedArtifactsForArtifact(session, artifactID, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(model.RelatedArtifact)
    query = query.filter(model.RelatedArtifact.artifactID == artifactID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifact.conceptCollectionHandle == None, model.RelatedArtifact.conceptCollectionHandle == ''))
    relatedArtifacts = query.all();

    toDelete = []
    domainIDs = _getDomainIDsWithNoModalitiesForArtifactIDs(session, [artifactID])
    toDelete = [-(dm) for dm in domainIDs]

    log.debug("Domains for deletion %s" % toDelete)
    for r in relatedArtifacts:
        session.delete(r)
    if toDelete:
        log.debug("Domains deleted %s" % toDelete)
        global THREADLOCAL
        if not hasattr(THREADLOCAL, 'reindexList'):
            THREADLOCAL.reindexList = []
        THREADLOCAL.reindexList.extend(toDelete)

@_transactional()
def deleteRelatedArtifact(session, artifactID, domainID, sequence=None, conceptCollectionHandle=None, collectionCreatorID=3):
    _deleteRelatedArtifact(session, artifactID, domainID, sequence, conceptCollectionHandle, collectionCreatorID)

def _deleteRelatedArtifact(session, artifactID, domainID, sequence=None, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(model.RelatedArtifact)
    query = query.filter(and_(
        model.RelatedArtifact.artifactID == artifactID,
        model.RelatedArtifact.domainID == domainID))
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifact.conceptCollectionHandle == None, model.RelatedArtifact.conceptCollectionHandle == ''))
    if sequence:
        query = query.filter(model.RelatedArtifact.sequence == sequence)
    toDelete = []
    domainIDs = _getDomainIDsWithNoModalitiesForArtifactIDs(session, [artifactID])
    toDelete = [-(dm) for dm in domainIDs]
    log.info("Domains for deletion  %s" % toDelete)
    for r in query.all():
        session.delete(r)
    if toDelete:
        log.info("Domains deleted %s" % toDelete)
        global THREADLOCAL
        if not hasattr(THREADLOCAL, 'reindexList'):
            THREADLOCAL.reindexList = []
        THREADLOCAL.reindexList.extend(toDelete)

@_transactional()
def createRelatedArtifact(session, **kwargs):
    return _createRelatedArtifact(session, **kwargs)

def _createRelatedArtifact(session, **kwargs):
    _checkAttributes(['artifactID'], **kwargs)
    if not kwargs.get('domainID') and not (kwargs.get('conceptCollectionHandle') and kwargs.get('collectionCreatorID')):
        raise Exception('Either domainID or conceptCollectionHandle and collectionCreatorID must be specified.')

    if not kwargs.get('domainID') and kwargs.get('conceptCollectionHandle') and kwargs.get('collectionCreatorID'):
        cnode = CollectionNode(mongodb).getByConceptCollectionHandle(conceptCollectionHandle=kwargs['conceptCollectionHandle'], collectionCreatorID=kwargs['collectionCreatorID'])
        if not cnode or not cnode.get('encodedID'):
            raise Exception('Invalid conceptCollectionHandle[%s]-collectionCreatorID[%s] combination. No such exists or not a leaf node.' % (kwargs['conceptCollectionHandle'], kwargs['collectionCreatorID']))
        domain = _getBrowseTermByEncodedID(session, encodedID=cnode['encodedID'])
        kwargs['domainID'] = domain.id

    artifact = _getArtifactByID(session, id=kwargs['artifactID'])
    if not artifact.type.modality:
        log.debug("Not creating entry in RelatedArtifacts for non-modality artifact type")
        return None
    if not kwargs.get('sequence'):
        query = session.query(func.max(model.RelatedArtifactsAndLevels.sequence))
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.domainID == kwargs['domainID'],
            model.RelatedArtifactsAndLevels.artifactTypeID == artifact.artifactTypeID))
        log.debug("_createRelatedArtifact: Query: %s" % query)
        row = _queryOne(query)
        try:
            kwargs['sequence'] = int(row[0])+1
        except:
            kwargs['sequence'] = 1
    log.debug("_createRelatedArtifact: params %s" % str(kwargs))
    ra = model.RelatedArtifact(**kwargs)
    session.add(ra)
    return ra

@_transactional(readOnly=True)
def getRelatedArtifact(session, artifactID, domainID=None, sequence=None, conceptCollectionHandle=None, collectionCreatorID=3):
    return _getRelatedArtifact(session, artifactID, domainID, sequence, conceptCollectionHandle, collectionCreatorID)

def _getRelatedArtifact(session, artifactID, domainID=None, sequence=None, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(model.RelatedArtifact)
    query = query.filter(model.RelatedArtifact.artifactID == artifactID)
    if domainID:
        query = query.filter(model.RelatedArtifact.domainID == domainID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    elif not domainID:
        raise Exception('Either domainID or conceptCollectionHandle must be provided.')
    else:
        query = query.filter(or_(model.RelatedArtifact.conceptCollectionHandle == None, model.RelatedArtifact.conceptCollectionHandle == ''))
    if sequence:
        query = query.filter(model.RelatedArtifact.sequence == sequence)
    return query.first()

@_transactional(readOnly=True)
def getConceptCollectionHandlesForDomain(session, domainID):
    return _getConceptCollectionHandlesForDomain(session, domainID)

def _getConceptCollectionHandlesForDomain(session, domainID):
    query = session.query(model.RelatedArtifact.conceptCollectionHandle, model.RelatedArtifact.collectionCreatorID).distinct()
    query = query.filter(model.RelatedArtifact.domainID == domainID)
    return query.all()

@_transactional(readOnly=True)
def getRelatedArtifactsForArtifact(session, artifactID=None, conceptCollectionHandle=None, collectionCreatorID=3, pageNum=0, pageSize=0):
    return _getRelatedArtifactsForArtifact(session, artifactID, conceptCollectionHandle, collectionCreatorID, pageNum, pageSize)

def _getRelatedArtifactsForArtifact(session, artifactID=None, conceptCollectionHandle=None, collectionCreatorID=3, pageNum=0, pageSize=0):
    query = session.query(model.RelatedArtifact)
    if artifactID:
        query = query.filter(model.RelatedArtifact.artifactID == artifactID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifact.conceptCollectionHandle == None, model.RelatedArtifact.conceptCollectionHandle == ''))
    return p.Page(query, pageNum=pageNum, pageSize=pageSize)

@_transactional(readOnly=True)
def getConceptCollectionHandlesAndDomainEIDsForArtifact(session, artifactID, collectionCreatorID=3):
    query = session.query(model.RelatedArtifact, model.BrowseTerm)
    query = query.filter(model.RelatedArtifact.domainID == model.BrowseTerm.id)
    query = query.filter(model.RelatedArtifact.artifactID == artifactID)
    query = query.filter(and_(model.RelatedArtifact.conceptCollectionHandle != None, model.RelatedArtifact.conceptCollectionHandle != '',
        model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    ret = []
    for r in query.all():
        ret.append((r.BrowseTerm.encodedID, r.RelatedArtifact.conceptCollectionHandle))
    return ret

@_transactional(readOnly=True)
def getRelatedArtifactByPerma(session, typeID, handle, creatorID, domainEID, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(model.RelatedArtifactsAndLevels)
    query = query.filter(and_(
        model.RelatedArtifactsAndLevels.artifactTypeID == typeID,
        model.RelatedArtifactsAndLevels.handle == handle,
        model.RelatedArtifactsAndLevels.creatorID == creatorID,
        model.RelatedArtifactsAndLevels.domainEID.like('%s%%' % h.getCanonicalEncodedID(domainEID)),
        model.RelatedArtifactsAndLevels.domainEID.op('regexp')(getRegExpForEncodedID(domainEID))))
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, 
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    return query.first()

@_transactional(readOnly=True)
def getRelatedArtifactsForDomains(session, domainIDs, conceptCollectionHandle=None, collectionCreatorID=3, typeIDs=None, 
        levels=None, sequence=None, excludeIDs=None, memberID=None, sort=None, ownedBy=None, conceptCollectionHandleLikeQuery=False, includeAllUnpublished=False, pageNum=0, pageSize=0):
    return _getRelatedArtifactsForDomains(session, domainIDs=domainIDs, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, typeIDs=typeIDs, 
            levels=levels, sequence=sequence, excludeIDs=excludeIDs, memberID=memberID, sort=sort, ownedBy=ownedBy, 
            conceptCollectionHandleLikeQuery=conceptCollectionHandleLikeQuery, includeAllUnpublished=includeAllUnpublished, pageNum=pageNum, pageSize=pageSize)

def _getRelatedArtifactsForDomains(session, domainIDs, conceptCollectionHandle=None, collectionCreatorID=3, typeIDs=None, 
        levels=None, sequence=None, excludeIDs=None, memberID=None, sort=None, ownedBy=None, conceptCollectionHandleLikeQuery=False, includeAllUnpublished=False, pageNum=0, pageSize=0):
    if not domainIDs:
        return []

    query = session.query(model.RelatedArtifactsAndLevels)
    query = query.filter(model.RelatedArtifactsAndLevels.domainID.in_(domainIDs))
    if typeIDs:
        query = query.filter(model.RelatedArtifactsAndLevels.artifactTypeID.in_(typeIDs))
    typesDict = _getArtifactTypesDict(session)
    query = query.filter(not_(model.RelatedArtifactsAndLevels.artifactTypeID.in_([typesDict['concept'].id])))
    if levels:
        query = query.filter(model.RelatedArtifactsAndLevels.level.in_(levels))
    if sequence:
        query = query.filter(model.RelatedArtifactsAndLevels.sequence == sequence)

    if conceptCollectionHandle:
        if conceptCollectionHandleLikeQuery:
            query = query.filter(and_(
                model.RelatedArtifactsAndLevels.conceptCollectionHandle.like('%s%%' % conceptCollectionHandle),
                model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
        else:
            query = query.filter(and_(
                model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
                model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))

    if ownedBy:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if ownedBy == 'ck12':
            query = query.filter(model.RelatedArtifactsAndLevels.creatorID == ck12editor.id)
        elif ownedBy == 'community':
            query = query.filter(model.RelatedArtifactsAndLevels.creatorID != ck12editor.id)
        elif ownedBy == 'all':
            pass
        else:
            raise Exception('Invalid value for ownedBy: %s' % ownedBy)

    q1 = query
    if memberID:
        if not includeAllUnpublished:
            query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
            if ownedBy in ['community', 'all']:
                q2 = q1.filter(and_(
                    model.RelatedArtifactsAndLevels.creatorID == memberID,
                    model.RelatedArtifactsAndLevels.publishTime == None))
                query = query.union(q2)
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
    if excludeIDs:
        query = query.filter(not_(model.RelatedArtifactsAndLevels.id.in_(excludeIDs)))
    #if sort == 'popularity':
    #    query = query.order_by(model.RelatedArtifactsAndLevels.likeCount.desc())
    #else:
    
    query = query.order_by(model.RelatedArtifactsAndLevels.domainEID.asc(), model.RelatedArtifactsAndLevels.sequence.asc())
    return p.Page(query, pageNum=pageNum, pageSize=pageSize)

@_transactional(readOnly=True)
def getDomainIDsWithNoModalitiesForArtifactIDs(session, artifactIDs, conceptCollectionHandle=None, collectionCreatorID=3):
    return _getDomainIDsWithNoModalitiesForArtifactIDs(session, artifactIDs, conceptCollectionHandle, collectionCreatorID)

def _getDomainIDsWithNoModalitiesForArtifactIDs(session, artifactIDs, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(distinct(model.RelatedArtifactsAndLevels.domainID).label('domainID'))
    #query = session.query(model.RelatedArtifactsAndLevels.domainID.label('domainID'), model.RelatedArtifactsAndLevels.id.label('artifactID'))
    #query = query.join(model.RelatedArtifactsAndLevels, model.RelatedArtifactsAndLevels.domainID == model.RelatedArtifactsAndLevels.domainID)
    
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))    

    artifactIDs = [artifactID for artifactID in artifactIDs if artifactID > 0]
    log.debug("ARTIFACT IDS BEFORE FILTER %s" %artifactIDs)
    if artifactIDs.__len__() == 0:
        return []
    log.debug("ARTIFACT IDS AFTER FILTER %s" %artifactIDs)
    query = query.filter((model.RelatedArtifactsAndLevels.id.in_(artifactIDs)))
    log.debug("Query: %s" % query)
    domainIDs = query.all()
    if domainIDs and domainIDs.__len__() == 0:
        return []
    domainIDs = [dTuple[0] for dTuple in domainIDs]
    query1 = session.query(model.RelatedArtifactsAndLevels.id.label('artifactID'),model.RelatedArtifactsAndLevels.domainID.label('domainID'))
    query1 = query1.filter(model.RelatedArtifactsAndLevels.domainID.in_(domainIDs))
    #query1 = query1.group_by(model.RelatedArtifactsAndLevels.domainID)
    log.debug("Query: %s" % query1)
    art_domain = query1.all()
    domainModalityCountDict = {}
    # Identify domainIDs having modality count 1.
    for ad in art_domain:
        domainID = ad[1]
        artifactID = ad[0]
        if not domainID in domainModalityCountDict.keys():
             domainModalityCountDict[domainID] = 0
        if not artifactID in artifactIDs:
            domainModalityCountDict[domainID] = domainModalityCountDict[domainID] + 1

    domainModalityCountList = [dm[0] for dm in domainModalityCountDict.items() if dm[1] == 0]
    log.debug("DomainIDs having modality count ONE %s" %domainIDs)
    return domainModalityCountList

@_transactional()
def browseRelatedDomains(session, domainEIDs, typeIDs=None, levels=None, sequences=None, excludeIDs=None, memberID=None,
        likeQuery=False, modifiedAfter=None, ck12only=True, conceptCollectionHandle=None, collectionCreatorID=3, pageNum=0, pageSize=0):
    query = session.query(distinct(model.RelatedArtifactsAndLevels.domainID).label('domainID'))
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle, 
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    if likeQuery:
        query = query.filter(or_(*map(lambda eid: model.RelatedArtifactsAndLevels.domainEID.ilike(eid), domainEIDs)))
    else:
        query = query.filter(or_(*map(lambda eid: model.RelatedArtifactsAndLevels.domainEID.op('regexp')(getRegExpForEncodedID(eid)), domainEIDs)))
        #query = query.filter(model.RelatedArtifactsAndLevels.domainEID.in_(domainEIDs))
    if typeIDs:
        query = query.filter(model.RelatedArtifactsAndLevels.artifactTypeID.in_(typeIDs))
    if levels:
        query = query.filter(model.RelatedArtifactsAndLevels.level.in_(levels))
    if sequences:
        query = query.filter(model.RelatedArtifactsAndLevels.sequence.in_(sequences))
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.creatorID == ck12editor.id))
    elif memberID:
        sq = session.query(model.MemberLibraryObject.parentID).filter(and_(
            model.MemberLibraryObject.memberID == memberID,
            model.MemberLibraryObject.objectType == 'artifactRevision'))
        query = query.filter(or_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.id.in_(sq.subquery())))
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
    if excludeIDs:
        query = query.filter(not_(model.RelatedArtifactsAndLevels.id.in_(excludeIDs)))
    if modifiedAfter:
        query = query.filter(model.RelatedArtifactsAndLevels.updateTime > solrclient.getSolrTime(modifiedAfter, format=1))
    query = query.order_by(model.RelatedArtifactsAndLevels.domainEID.asc(), model.RelatedArtifactsAndLevels.sequence.asc())
    log.debug("Query: %s" % query)
    return p.Page(query, pageNum=pageNum, pageSize=pageSize)

@_transactional(readOnly=True)
def browseRelatedDomainsSummary(session, domainEIDs, typeIDs=None, levels=None, sequences=None,
        excludeIDs=None, memberID=None, modifiedAfter=None, ck12only=True, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(func.count(distinct(model.RelatedArtifactsAndLevels.domainID)).label('count'), func.substring_index(model.RelatedArtifactsAndLevels.domainEID, '.', 2).label('domainEID'))
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))    
    query = query.filter(or_(*map(lambda eid: model.RelatedArtifactsAndLevels.domainEID.ilike(eid), domainEIDs)))
    if typeIDs:
        query = query.filter(model.RelatedArtifactsAndLevels.artifactTypeID.in_(typeIDs))
    if levels:
        query = query.filter(model.RelatedArtifactsAndLevels.level.in_(levels))
    if sequences:
        query = query.filter(model.RelatedArtifactsAndLevels.sequence.in_(sequences))
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.creatorID == ck12editor.id))
    elif memberID:
        sq = session.query(model.MemberLibraryObject.parentID).filter(and_(
            model.MemberLibraryObject.memberID == memberID,
            model.MemberLibraryObject.objectType == 'artifactRevision'))
        query = query.filter(or_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.id.in_(sq.subquery())))
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
    if excludeIDs:
        query = query.filter(not_(model.RelatedArtifactsAndLevels.id.in_(excludeIDs)))
    if modifiedAfter:
        query = query.filter(model.RelatedArtifactsAndLevels.updateTime > solrclient.getSolrTime(modifiedAfter, format=1))
    query = query.group_by(func.substring_index(model.RelatedArtifactsAndLevels.domainEID, '.', 2))
    return query.all()

@_transactional()
def getDomainIDsForRelatedArtifactID(session, artifactID, conceptCollectionHandle=None, collectionCreatorID=3):
    return _getDomainIDsForRelatedArtifactID(session, artifactID, conceptCollectionHandle, collectionCreatorID)

def _getDomainIDsForRelatedArtifactID(session, artifactID, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(model.RelatedArtifact.domainID).distinct()
    query = query.filter(model.RelatedArtifact.artifactID == artifactID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifact.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifact.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifact.conceptCollectionHandle == None, model.RelatedArtifact.conceptCollectionHandle == ''))
    return query.all()

@_transactional(readOnly=True)
def getDomainEIDsForRelatedArtifactID(session, artifactID, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(distinct(model.RelatedArtifactsAndLevels.domainEID).label('domainEID'))
    query = query.filter(model.RelatedArtifactsAndLevels.id == artifactID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    return query.all()

@_transactional(readOnly=True)
def countRelatedArtifactsForDomains(session, domainIDs, memberID=None, ck12only=False, privateOnly=False, domainCount=False, conceptCollectionHandle=None, collectionCreatorID=3):
    return _countRelatedArtifactsForDomains(session, domainIDs, memberID=memberID, ck12only=ck12only, privateOnly=privateOnly, 
            domainCount=domainCount, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)

def _countRelatedArtifactsForDomains(session, domainIDs, memberID=None, ck12only=False, privateOnly=False, domainCount=False, conceptCollectionHandle=None, collectionCreatorID=3):
    if not domainIDs:
        return (0, 0) if domainCount else 0
    query = session.query(func.count(model.RelatedArtifactsAndLevels.id), model.RelatedArtifactsAndLevels.artifactTypeID,
            model.RelatedArtifactsAndLevels.level, model.RelatedArtifactsAndLevels.domainID).distinct()
    query = query.filter(
                model.RelatedArtifactsAndLevels.domainID.in_(domainIDs))

    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))

    typesDict = _getArtifactTypesDict(session)
    query = query.filter(not_(model.RelatedArtifactsAndLevels.artifactTypeID.in_([typesDict['concept'].id])))
    if ck12only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.creatorID == ck12editor.id))
    elif memberID:
        if privateOnly:
            query = query.filter(and_(
                model.RelatedArtifactsAndLevels.publishTime == None,
                model.RelatedArtifactsAndLevels.creatorID == memberID))
        else:
            query = query.filter(or_(
                model.RelatedArtifactsAndLevels.publishTime != None,
                model.RelatedArtifactsAndLevels.creatorID == memberID))
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)

    typesDict = _getArtifactTypesDictByID(session)
    query = query.group_by(model.RelatedArtifactsAndLevels.artifactTypeID,
                model.RelatedArtifactsAndLevels.level,
                model.RelatedArtifactsAndLevels.domainID)
    rows = query.all()
    if not rows:
        return (0, 0) if domainCount else 0
    domainsWithModalities = {}
    d = {}
    for r in rows:
        log.debug("%s, %s, %s, %s" % (r[0], r[1], r[2], r[3]))
        domainsWithModalities[r[3]] = True
        typeName = typesDict.get(r[1]).name
        if not d.has_key(typeName):
            d[typeName] = {}
        lvl = str(r[2]).lower()
        if not d[typeName].has_key(lvl):
            d[typeName][lvl] = 0
        d[typeName][lvl] += r[0]

    return (d, len(domainsWithModalities.keys())) if domainCount else d

@_transactional(readOnly=True)
def countRelatedArtifactsForDomainByLevel(session, domainID, memberID=None, conceptCollectionHandle=None, collectionCreatorID=3):
    return _countRelatedArtifactsForDomainByLevel(session, domainID, memberID, conceptCollectionHandle, collectionCreatorID)

def _countRelatedArtifactsForDomainByLevel(session, domainID, memberID=None, conceptCollectionHandle=None, collectionCreatorID=3):
    query = session.query(func.count(model.RelatedArtifactsAndLevels.id), model.RelatedArtifactsAndLevels.level).distinct()
    query = query.filter(model.RelatedArtifactsAndLevels.domainID == domainID)
    if conceptCollectionHandle:
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    if memberID:
        query = query.filter(or_(
            model.RelatedArtifactsAndLevels.publishTime != None,
            model.RelatedArtifactsAndLevels.creatorID == memberID))
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)

    query = query.group_by(model.RelatedArtifactsAndLevels.level)
    rows = query.all()
    if not rows:
        return 0
    d = {}
    for r in rows:
        d[str(r.level).lower()] = r[0]
    return d

@_transactional(readOnly=True)
def countTotalRelatedArtifactsForDomain(session, domainID, publishedOnly=False, ck12Only=False, conceptCollectionHandle=None, collectionCreatorID=3):
    return _countTotalRelatedArtifactsForDomain(session, domainID, publishedOnly, ck12Only, conceptCollectionHandle, collectionCreatorID)

def _countTotalRelatedArtifactsForDomain(session, domainID, publishedOnly=False, ck12Only=False, conceptCollectionHandle=None, collectionCreatorID=3):
    query1 = session.query(func.count(model.RelatedArtifactsAndLevels.id).label('count'))
    query1 = query1.filter(model.RelatedArtifactsAndLevels.domainID == domainID)
    if conceptCollectionHandle:
        query1 = query1.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query1 = query1.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    if publishedOnly:
        query1 = query1.filter(model.RelatedArtifactsAndLevels.publishTime != None)
    if ck12Only:
        ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
        if not ck12editor:
            raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
        query1 = query1.filter(model.RelatedArtifactsAndLevels.creatorID == ck12editor.id)

    query1 = query1.group_by(model.RelatedArtifactsAndLevels.domainID)
    domainModalityCount = query1.first()
    if not domainModalityCount:
        return 0
    log.debug("Query: %s" % query1)
    return domainModalityCount[0]

@_transactional(readOnly=True)
def countTotalRelatedArtifactsForDomainIDs(session, domainEIDs, publishedOnly=False, conceptCollectionHandle=None, collectionCreatorID=3):
    return _countTotalRelatedArtifactsForDomainIDs(session, domainEIDs, publishedOnly, conceptCollectionHandle, collectionCreatorID)

def _countTotalRelatedArtifactsForDomainIDs(session, domainEIDs, publishedOnly=False, conceptCollectionHandle=None, collectionCreatorID=3):
    query1 = session.query(model.RelatedArtifactsAndLevels.domainEID, func.count(model.RelatedArtifactsAndLevels.id).label('count'))
    query1 = query1.filter(and_(
            or_(*map(lambda eid: model.RelatedArtifactsAndLevels.domainEID.like('%s%%' % h.getCanonicalEncodedID(eid)), domainEIDs)),
            or_(*map(lambda eid: model.RelatedArtifactsAndLevels.domainEID.op('regexp')(getRegExpForEncodedID(eid)), domainEIDs))))
    #query1 = query1.filter(model.RelatedArtifactsAndLevels.domainEID.in_(domainEIDs))
    if conceptCollectionHandle:
        query1 = query1.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query1 = query1.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    if publishedOnly:
        query1 = query1.filter(model.RelatedArtifactsAndLevels.publishTime != None)

    query1 = query1.group_by(model.RelatedArtifactsAndLevels.domainEID)
    domainModalityCounts = query1.all()
    return domainModalityCounts

@_transactional(readOnly=True)
def getLatestModalityForDomains(session, domainIDs, memberID=None, ck12only=False, conceptCollectionHandle=None, collectionCreatorID=3):
    return _getLatestModalityForDomains(session, domainIDs, memberID, ck12only, conceptCollectionHandle, collectionCreatorID)

@_transactional(readOnly=True)
def getLatestModalityForDomainDescendants(session, domainID, memberID=None, ck12only=False, conceptCollectionHandle=None, collectionCreatorID=3):
    descendants = _getBrowseTermDescendants(session=session, id=domainID)
    domainIDs = [t.id for t in descendants]
    return _getLatestModalityForDomains(session, domainIDs, memberID, ck12only, conceptCollectionHandle, collectionCreatorID)

def _getLatestModalityForDomains(session, domainIDs, memberID=None, ck12only=False, conceptCollectionHandle=None, collectionCreatorID=3):
    if domainIDs:
        query = session.query(model.RelatedArtifactsAndLevels)
        query = query.filter(model.RelatedArtifactsAndLevels.domainID.in_(domainIDs))

        if conceptCollectionHandle:
            query = query.filter(and_(
                model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
                model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
        else:
            query = query.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))

        if ck12only:
            ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
            if not ck12editor:
                raise Exception((_(u"No such user by login: ck12editor")).encode("utf-8"))
            query = query.filter(and_(
                model.RelatedArtifactsAndLevels.publishTime != None,
                model.RelatedArtifactsAndLevels.creatorID == ck12editor.id))
        elif memberID:
            query = query.filter(or_(
                model.RelatedArtifactsAndLevels.publishTime != None,
                model.RelatedArtifactsAndLevels.creatorID == memberID))
        else:
            query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)

        query = query.order_by(model.RelatedArtifactsAndLevels.creationTime.desc())
        return query.first()
    return None

@_transactional(readOnly=True)
def getModalityIDsForCollection(session, collectionHandle, collectionCreatorID=3, typeIDs=None, ownedBy='ck12'):
    query = session.query(model.RelatedArtifactsAndLevels.id.label('artifactID')).distinct()
    query = query.filter(and_(
        model.RelatedArtifactsAndLevels.conceptCollectionHandle.like('%s-::-%%' % collectionHandle),
        model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    if typeIDs:
        query = query.filter(model.RelatedArtifactsAndLevels.artifactTypeID.in_(typeIDs))
    ck12editor = _getUnique(session, model.Member, 'login', 'ck12editor')
    if ownedBy == 'ck12':
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.creatorID == ck12editor.id,
            model.RelatedArtifactsAndLevels.publishTime != None))
    elif ownedBy == 'community':
        query = query.filter(and_(
            model.RelatedArtifactsAndLevels.creatorID != ck12editor.id,
            model.RelatedArtifactsAndLevels.publishTime != None))
    elif ownedBy == 'all':
        query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
    else:
        query = query.filter(model.RelatedArtifactsAndLevels.creatorID == int(ownedBy))

    rows = query.all()
    return [ r.artifactID for r in rows ]

@_transactional(readOnly=True)
def getThumbnailModalities(session, **kwargs):
    return _getThumbnailModalities(session, **kwargs)

def _getThumbnailModalities(session, **kwargs):
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 25)
    fromDate = kwargs.get('fromDate', None)
    toDate = kwargs.get('toDate', None)
    handle = kwargs.get('handle', None)
    force = kwargs.get('force', False)
    artifactTypeID = kwargs.get('artifactTypeID', '34')
    if not force:
        sq = session.query(model.ArtifactAndResources.artifactID.label('artifactID')).distinct()
        sq = sq.filter(model.ArtifactAndResources.resourceTypeID == 2)
        subquery = sq.subquery()

    query = session.query(func.max(model.ArtifactRevision.id).label('latestRevision'),
                          model.ArtifactRevision.artifactID.label('artifactID'),
                          model.Artifact.name.label('title'))
    query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
    query = query.filter(model.Artifact.artifactTypeID == artifactTypeID)
    if not force:
        query = query.filter(not_(model.ArtifactRevision.artifactID.in_(subquery)))

    if fromDate and toDate:
        query = query.filter(and_(model.Artifact.creationTime >= fromDate, model.Artifact.creationTime <= toDate))
    if handle:
        query = query.filter(model.Artifact.handle == handle)
    query = query.group_by(model.ArtifactRevision.artifactID)
    log.debug(query)
    page = p.Page(query, pageNum, pageSize,)
    return page

@_transactional(readOnly=True)
def getPrePostDomainForEncodedID(session, encodedID, levels=None, memberID=None, conceptCollectionHandle=None, collectionCreatorID=3):
    """
        Get pre/post domains for given eid - make sure the returned set has at least some artifacts associated
    """
    browseTerm = _getBrowseTermByEncodedID(session, encodedID)
    if not browseTerm:
        raise Exception('No browseTerm for encodedID: %s' % encodedID)

    preDomains = {}
    postDomains = {}

    preDomainID = browseTerm.id
    while not preDomains:
        pre = _getPreDomains(session, domainID=preDomainID)
        log.debug("Pre: %s" % pre)
        if not pre:
            break
        for p in pre:
            cnt = _countRelatedArtifactsForDomains(session, [p.requiredDomainID], memberID=memberID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
            if cnt:
                totalCount = 0
                for key in cnt.keys():
                    for l in cnt[key].keys():
                        totalCount += cnt[key][l]
                if totalCount:
                    preDomains[p.requiredDomain.encodedID] = p.requiredDomain.asDict()
                    preDomains[p.requiredDomain.encodedID]['modalityCount'] = cnt
            preDomainID = p.requiredDomainID

    postDomainID = browseTerm.id
    while not postDomains:
        post = _getPostDomains(session, domainID=postDomainID)
        if not post:
            break
        for p in post:
            cnt = _countRelatedArtifactsForDomains(session, [p.domainID], memberID=memberID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
            if cnt:
                totalCount = 0
                for key in cnt.keys():
                    for l in cnt[key].keys():
                        totalCount += cnt[key][l]
                if totalCount:
                    postDomains[p.domain.encodedID] = p.domain.asDict()
                    postDomains[p.domain.encodedID]['modalityCount'] = cnt
            postDomainID = p.domainID

    return preDomains, postDomains

@_transactional(readOnly=True)
def getMembersForDomain(session, domainID, includePublished=False, conceptCollectionHandle=None, collectionCreatorID=3):
    return _getMembersForDomain(session, domainID, includePublished, conceptCollectionHandle, collectionCreatorID)

def _getMembersForDomain(session, domainID, includePublished=False, conceptCollectionHandle=None, collectionCreatorID=3):
    query1 = session.query(model.RelatedArtifactsAndLevels.creatorID.label('memberID')).distinct()
    query1 = query1.filter(model.RelatedArtifactsAndLevels.domainID == domainID)
    if conceptCollectionHandle:
        query1 = query1.filter(and_(
            model.RelatedArtifactsAndLevels.conceptCollectionHandle == conceptCollectionHandle,
            model.RelatedArtifactsAndLevels.collectionCreatorID == collectionCreatorID))
    else:
        query1 = query1.filter(or_(model.RelatedArtifactsAndLevels.conceptCollectionHandle == None, model.RelatedArtifactsAndLevels.conceptCollectionHandle == ''))
    # defaulted to return only unpublished member IDs
    if not includePublished:
        query1 = query1.filter(model.RelatedArtifactsAndLevels.publishTime == None)
    log.debug("Query: %s" % query1)

    memberIDs = query1.all()
    if not memberIDs:
        return []
    memberIDs = [int(memberID[0]) for memberID in memberIDs]
    return memberIDs

@_transactional()
def addOrUpdateMemberGrades(session, **kwargs):
    return _addOrUpdateMemberGrades(session, **kwargs)

def _addOrUpdateMemberGrades(session, **kwargs):
    _checkAttributes(['memberID', 'gradeIDs'], **kwargs)
    member = _getMemberByID(session, kwargs['memberID'])

    if member is None:
        return None

    memberGrades = []
    for gradeID in kwargs['gradeIDs']:
        grade = _getGradeByID(session, gradeID)
        if grade:
            memberGrades.append(grade)

    member.grades = memberGrades
    session.add(member)
    memberGrades = [grade.asDict() for grade in memberGrades]
    return memberGrades

@_transactional()
def deleteMemberGrades(session, memberID):
    _deleteMemberGrades(session, memberID)

def _deleteMemberGrades(session, memberID):
    memberGrades = _getMemberHasGrades(session, memberID=memberID)
    for eachMemberGrade in memberGrades:
        session.delete(eachMemberGrade)
    session.flush()

@_transactional(readOnly=True)
def getMemberHasGrades(session, memberID):
    return _getMemberHasGrades(session, memberID)

def _getMemberHasGrades(session, memberID):
    if memberID is None:
        return None
    query = session.query(model.MemberHasGrades)
    query = query.filter(model.MemberHasGrades.memberID == memberID)
    return query.all()

@_transactional(readOnly=True)
def getMembersByGrade(session, gradeID, pageNum, pageSize):
    return _getMembersByGrade(session, gradeID, pageNum, pageSize)

def _getMembersByGrade(session, gradeID, pageNum, pageSize):
    if gradeID is None:
        return None
    query = session.query(model.Member)
    query = query.join(model.MemberHasGrades, model.Member.id == model.MemberHasGrades.memberID)
    query = query.filter(model.MemberHasGrades.gradeID == gradeID)
    page = p.Page(query, pageNum, pageSize)
    return page


@_transactional()
def addOrUpdateMemberSubjects(session, **kwargs):
    return _addOrUpdateMemberSubjects(session, **kwargs)

def _addOrUpdateMemberSubjects(session, **kwargs):
    _checkAttributes(['memberID', 'subjects'], **kwargs)
    member = _getMemberByID(session, kwargs['memberID'])

    if member is None:
        return None

    subjectDict = _getSubjectsDict(session)
    memberSubjects = []
    for subjectName in kwargs['subjects']:
        subject = subjectDict.get(subjectName)
        if subject:
            memberSubjects.append(subject)

    member.subjects = memberSubjects
    session.add(member)
    memberSubjects = [subject.asDict(includeEID=True) for subject in memberSubjects]
    return memberSubjects

@_transactional()
def deleteMemberSubjects(session, memberID):
    _deleteMemberSubjects(session, memberID)

def _deleteMemberSubjects(session, memberID):
    memberSubjects = _getMemberHasSubjects(session, memberID=memberID)
    for eachmemberSubject in memberSubjects:
        session.delete(eachmemberSubject)
    session.flush()

@_transactional(readOnly=True)
def getMemberHasSubjects(session, memberID):
    return _getMemberHasSubjects(session, memberID)

def _getMemberHasSubjects(session, memberID):
    if memberID is None:
        return None
    query = session.query(model.MemberHasSubjects)
    query = query.filter(model.MemberHasSubjects.memberID == memberID)
    return query.all()

@_transactional(readOnly=True)
def createLMSProvider(session, **kwargs):
    return _createLMSProvider(session, **kwargs)

def _createLMSProvider(session, **kwargs):
    _checkAttributes(['name'], **kwargs)
    lmsProvider = model.LMSProvider(**kwargs)
    session.add(lmsProvider)
    return lmsProvider

@_transactional(readOnly=True)
def getLMSProvider(session, id=None):
    return _getLMSProvider(session, id)

def _getLMSProvider(session, id=None):
    query = session.query(model.LMSProvider)
    query = query.prefix_with('SQL_CACHE')
    if id:
        query = query.filter_by(id = id)
    return query.all()

@_transactional()
def deleteLMSProvider(session, id):
    _deleteLMSProvider(session, id)

def _deleteLMSProvider(session, id):
    query = session.query(model.LMSProvider)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(id=id)
    query.delete()

@_transactional(readOnly=True)
def createLMSProviderApp(session, **kwargs):
    return _createLMSProviderApp(session, **kwargs)

def _createLMSProviderApp(session, **kwargs):
    _checkAttributes(['providerID', 'appID', 'policy'], **kwargs)
    log.debug('_createLMSProviderApp: kwargs[%s]' % kwargs)
    lmsProviderApp = model.LMSProviderApp(**kwargs)
    session.add(lmsProviderApp)
    return lmsProviderApp

@_transactional(readOnly=True)
def getLMSProviderApps(session, providerID, appID=None):
    return _getLMSProviderApps(session, providerID, appID)

def _getLMSProviderApps(session, providerID, appID=None):
    query = session.query(model.LMSProviderApp)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(providerID = providerID)
    if appID:
        query = query.filter_by(appID = appID)
    else:
        query = query.order_by(model.LMSProviderApp.appID)
    return query.all()

@_transactional(readOnly=True)
def getLMSProviderAppByAppID(session, appID):
    return _getLMSProviderAppByAppID(session, appID)

def _getLMSProviderAppByAppID(session, appID):
    query = session.query(model.LMSProviderApp)
    query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(appID = appID)
    return _queryOne(query)

@_transactional()
def deleteLMSProviderApp(session, providerID, appID=None):
    _deleteLMSProviderApp(session, providerID, appID)

def _deleteLMSProviderApp(session, providerID, appID=None):
    query = session.query(model.LMSProviderApp)
    query = query.filter_by(providerID=providerID)
    if appID:
        query = query.filter_by(appID=appID)
    query.delete()

@_transactional(readOnly=True)
def createLMSProviderGroup(session, **kwargs):
    return _createLMSProviderGroup(session, **kwargs)

def _createLMSProviderGroup(session, **kwargs):
    _checkAttributes(['appID', 'providerGroupID', 'title'], **kwargs)
    now = datetime.now()
    kwargs['creationTime'] = now
    kwargs['updateTime'] = now
    lmsProviderGroup = model.LMSProviderGroup(**kwargs)
    session.add(lmsProviderGroup)
    return lmsProviderGroup

@_transactional(readOnly=True)
def getLMSProviderGroups(session, appID=None, providerGroupID=None, groupID=None):
    return _getLMSProviderGroups(session, appID, providerGroupID, groupID)

def _getLMSProviderGroups(session, appID=None, providerGroupID=None, groupID=None):
    """
        If groupID is provided, then neither providerID nor providerGroupID will be needed.
    """
    query = session.query(model.LMSProviderGroup)
    if groupID:
        query = query.filter_by(groupID = groupID)
    if appID:
        query = query.filter_by(appID = appID)
    if providerGroupID:
        query = query.filter_by(providerGroupID = providerGroupID)
    return query.all()

@_transactional(readOnly=True)
def getLMSProviderGroupsOfMember(session, memberID, appID=None):
    return _getLMSProviderGroupsOfMember(session, memberID, appID)

def _getLMSProviderGroupsOfMember(session, memberID, appID=None):
    query = session.query(model.LMSProviderGroup)
    if appID:
        query = query.filter_by(appID = appID)
    query = query.join(model.LMSProviderGroupMember,
                       model.LMSProviderGroup.providerGroupID == model.LMSProviderGroupMember.providerGroupID)
    query = query.filter(model.LMSProviderGroupMember.memberID == memberID)
    return query.all()

@_transactional()
def deleteLMSProviderGroup(session, groupID=None, appID=None, providerGroupID=None):
    _deleteLMSProviderGroup(session, groupID, appID, providerGroupID)

def _deleteLMSProviderGroup(session, groupID=None, appID=None, providerGroupID=None):
    query = session.query(model.LMSProviderGroup)
    if groupID:
        query = query.filter_by(groupID = groupID)
    if appID:
        query = query.filter_by(appID = appID)
    if providerGroupID:
        query = query.filter_by(providerGroupID = providerGroupID)
    query.delete()

@_transactional(readOnly=True)
def createLMSProviderGroupMember(session, **kwargs):
    return _createLMSProviderGroupMember(session, **kwargs)

def _createLMSProviderGroupMember(session, **kwargs):
    _checkAttributes(['providerID', 'providerGroupID', 'providerMemberID'], **kwargs)
    lmsProviderGroupMember = model.LMSProviderGroupMember(**kwargs)
    session.add(lmsProviderGroupMember)
    session.flush()
    return lmsProviderGroupMember

@_transactional(readOnly=True)
def getLMSProviderGroupMembers(session, providerID=None, providerGroupID=None, providerMemberID=None, memberID=None):
    return _getLMSProviderGroupMembers(session, providerID, providerGroupID, providerMemberID, memberID)

def _getLMSProviderGroupMembers(session, providerID=None, providerGroupID=None, providerMemberID=None, memberID=None):
    query = session.query(model.LMSProviderGroupMember)
    if memberID:
        query = query.filter_by(memberID = memberID)
    if providerID:
        query = query.filter_by(providerID = providerID)
    if providerGroupID:
        query = query.filter_by(providerGroupID = providerGroupID)
    if providerMemberID:
        query = query.filter_by(providerMemberID = providerMemberID)
    return query.all()

@_transactional(readOnly=True)
def getLMSProviderGroupMembersByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    return _getLMSProviderGroupMembersByFilters(session, filters=filters, sort=sort, pageNum=pageNum, pageSize=pageSize)

def _getLMSProviderGroupMembersByFilters(session, filters=None, sort=None, pageNum=0, pageSize=0):
    fields = {
        'providerMemberID': model.LMSProviderGroupMember.providerMemberID,
        'providerGroupID': model.LMSProviderGroup.providerGroupID,
        'memberID': model.LMSProviderGroupMember.memberID,
        'appID': model.LMSProviderApp.appID,
        'providerID': model.LMSProvider.id,
        'groupID': model.LMSProviderGroup.groupID
    }
    query = session.query(model.LMSProviderGroupMember)
    query = query.join(model.LMSProviderGroup, model.LMSProviderGroupMember.providerGroupID == model.LMSProviderGroup.providerGroupID)
    query = query.join(model.LMSProviderApp, model.LMSProviderApp.appID == model.LMSProviderGroup.appID)
    query = query.join(model.LMSProvider, model.LMSProvider.id == model.LMSProviderApp.providerID)
    query = query.group_by(model.LMSProviderGroupMember.providerMemberID)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if not sort:
        sort = 'memberID,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in fields.keys():
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(fields[sortFld]))
        else:
            query = query.order_by(desc(fields[sortFld]))
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def setLMSProviderGroupMemberID(session, **kwargs):
    return _setLMSProviderGroupMemberID(session, **kwargs)

def _setLMSProviderGroupMemberID(session, **kwargs):
    _checkAttributes(['providerID', 'providerGroupID', 'providerMemberID', 'memberID'], **kwargs)
    providerID = kwargs.get('providerID')
    providerGroupID = kwargs.get('providerGroupID')
    providerMemberID = kwargs.get('providerMemberID')
    memberID = kwargs.get('memberID')
    query = session.query(model.LMSProviderGroupMember)
    query = query.filter_by(providerID = providerID)
    query = query.filter_by(providerGroupID = providerGroupID)
    query = query.filter_by(providerMemberID = providerMemberID)
    lmsProviderGroupMember = _queryOne(query)
    if not lmsProviderGroupMember:
        groupID = kwargs.get('groupID')
        raise ex.NotFoundException((_(u'No LMSProviderGroupMember of id[%(providerID)s.%(groupID).%s(memberID)].')  % {"providerID":providerID, "groupID":groupID, "memberID":memberID}).encode("utf-8"))
    lmsProviderGroupMember.memberID = memberID
    session.add(lmsProviderGroupMember)
    return lmsProviderGroupMember

@_transactional()
def deleteLMSProviderGroupMember(session, memberID=None, providerID=None, providerGroupID=None, providerGroupMemberID=None):
    _deleteLMSProviderGroupMember(session, memberID, providerID, providerGroupID, providerGroupMemberID)

def _deleteLMSProviderGroupMember(session, memberID=None, providerID=None, providerGroupID=None, providerGroupMemberID=None):
    query = session.query(model.LMSProviderGroupMember)
    if memberID:
        query = query.filter_by(memberID=memberID)
    if providerID:
        query = query.filter_by(providerID=providerID)
    if providerGroupID:
        query = query.filter_by(providerGroupID=providerGroupID)
    if providerGroupMemberID:
        query = query.filter_by(providerGroupMemberID=providerGroupMemberID)
    query.delete()

@_transactional(readOnly=True)
def createLMSProviderAssignment(session, **kwargs):
    return _createLMSProviderAssignment(session, **kwargs)

def _createLMSProviderAssignment(session, **kwargs):
    _checkAttributes(['providerID', 'providerAssignmentID', 'assignmentID'], **kwargs)
    lmsProviderAssignment = model.LMSProviderAssignment(**kwargs)
    session.add(lmsProviderAssignment)
    return lmsProviderAssignment

@_transactional()
def updateLMSProviderAssignmentStatus(session, **kwargs):
    return _updateLMSProviderAssignmentStatus(session, **kwargs)

def _updateLMSProviderAssignmentStatus(session, **kwargs):
    """
        Set status to 0 to mark assignmetn as invalid.
        Invalid assignments will be ignored in future queries.
        Required params:
            - status = 1 or 0. The default is 1 for valid.
            - providerAssignmentID = the id for the assignment from the provider.
    """
    _checkAttributes(['status', 'providerAssignmentID'], **kwargs)
    lmsProviderAssignment = _getUnique(session, model.LMSProviderAssignment, 'providerAssignmentID', kwargs['providerAssignmentID'])
    if lmsProviderAssignment:
       lmsProviderAssignment.isValid = kwargs['status']
       session.add(lmsProviderAssignment)
    return lmsProviderAssignment

@_transactional(readOnly=True)
def getLMSProviderAssignments(session, providerID=None, providerAssignmentID=None, providerAssignmentIDLike=False, assignmentID=None):
    return _getLMSProviderAssignments(session, providerID, providerAssignmentID, providerAssignmentIDLike, assignmentID)

def _getLMSProviderAssignments(session, providerID=None, providerAssignmentID=None, providerAssignmentIDLike=False, assignmentID=None):
    """
        If assignmentID is provided, then neither providerID nor providerAssignmentID will be needed.
    """
    query = session.query(model.LMSProviderAssignment)
    if assignmentID:
        query = query.filter_by(assignmentID = assignmentID)
    if providerID:
        query = query.filter_by(providerID = providerID)
    if providerAssignmentID:
	if not providerAssignmentIDLike:
	    query = query.filter_by(providerAssignmentID = providerAssignmentID)
	else:
	    providerAssignmentID = ':'.join(providerAssignmentID.split(':')[0:-1])
	    providerAssignmentID += ':%'
	    query = query.filter(model.LMSProviderAssignment.providerAssignmentID.like(providerAssignmentID))
    return query.all()

@_transactional()
def deleteLMSProviderAssignment(session, assignmentID=None, providerID=None, providerAssignmentID=None):
    _deleteLMSProviderAssignment(session, assignmentID, providerID, providerAssignmentID)

def _deleteLMSProviderAssignment(session, assignmentID=None, providerID=None, providerAssignmentID=None):
    query = session.query(model.LMSProviderAssignment)
    if assignmentID:
        query = query.filter_by(assignmentID = assignmentID)
    if providerID:
        query = query.filter_by(providerID = providerID)
    if providerAssignmentID:
        query = query.filter_by(providerAssignmentID = providerAssignmentID)
    query.delete()

@_transactional(readOnly=True)
def createLMSProviderAssignmentScore(session, **kwargs):
    return _createLMSProviderAssignmentScore(session, **kwargs)

def _createLMSProviderAssignmentScore(session, **kwargs):
    _checkAttributes(['providerID', 'providerGroupID', 'providerMemberID', 'providerAssignmentID'], **kwargs)
    lmsProviderAssignmentScore = model.LMSProviderAssignmentScore(**kwargs)
    session.add(lmsProviderAssignmentScore)
    return lmsProviderAssignmentScore

@_transactional(readOnly=True)
def getLMSProviderAssignmentScores(session, providerID=None, providerGroupID=None, providerMemberID=None, providerAssignmentID=None):
    return _getLMSProviderAssignmentScores(session, providerID, providerGroupID, providerMemberID, providerAssignmentID)

def _getLMSProviderAssignmentScores(session, providerID=None, providerGroupID=None, providerMemberID=None, providerAssignmentID=None):
    """
        If assignmentID is provided, then neither providerID nor providerAssignmentID will be needed.
    """
    query = session.query(model.LMSProviderAssignmentScore)
    if providerID:
        query = query.filter_by(providerID = providerID)
    if providerGroupID:
        query = query.filter_by(providerGroupID = providerGroupID)
    if providerMemberID:
        query = query.filter_by(providerMemberID = providerMemberID)
    if providerAssignmentID:
        query = query.filter_by(providerAssignmentID = providerAssignmentID)
    return query.all()

@_transactional()
def deleteLMSProviderAssignmentScore(session, providerID=None, providerGroupID=None, providerMemberID=None, providerAssignmentID=None):
    _deleteLMSProviderAssignmentScore(session, providerID, providerGroupID, providerMemberID, providerAssignmentID)

def _deleteLMSProviderAssignmentScore(session, providerID=None, providerGroupID=None, providerMemberID=None, providerAssignmentID=None):
    query = session.query(model.LMSProviderAssignmentScore)
    if providerID:
        query = query.filter_by(providerID = providerID)
    if providerGroupID:
        query = query.filter_by(providerGroupID = providerGroupID)
    if providerMemberID:
        query = query.filter_by(providerMemberID = providerMemberID)
    if providerAssignmentID:
        query = query.filter_by(providerAssignmentID = providerAssignmentID)
    query.delete()

@_transactional()
def createDomainRetrolation(session, sectionEID, domainEIDs):
    return _createDomainRetrolation(session, sectionEID, domainEIDs)

def _createDomainRetrolation(session, sectionEID, domainEIDs):
    validDomainEIDs = []
    # Verify the validity of sectionEID.
    artifact = _getArtifactByEncodedID(session, sectionEID)
    if not artifact:
        raise Exception('sectionEID does not map to valid Artifact. sectionEID/domainEIDs: %s/%s' % (sectionEID, domainEIDs))

    # Verify the validity of domainEIDs.
    for domainEID in domainEIDs:
        browseTerm = _getBrowseTermByEncodedID(session, domainEID)
        if browseTerm:
            validDomainEIDs.append(domainEID)
        else:
            log.error('domainEID does not map to valid BrowseTerm. sectionEID/domainEID: %s:%s' % (sectionEID, domainEID))

    if validDomainEIDs:
        # Remove all the exisitng retrolation under sectionEID.
        query = session.query(model.Retrolation)
        query = query.filter_by(sectionEID = sectionEID)
        domainRetrolations = query.all()
        for domainRetrolation in domainRetrolations:
            session.delete(domainRetrolation)
        session.flush()

        # Add only valid domains
        for validDomainEID in validDomainEIDs:
            domainRetrolation = model.Retrolation(sectionEID=sectionEID, domainEID=validDomainEID)
            session.add(domainRetrolation)

@_transactional()
def updateDomainRetrolation(session, sectionEID,domainEID):
    return _updateDomainRetrolation(session, sectionEID, domainEID)

def _updateDomainRetrolation(session, sectionEID, domainEID):

    # Verify the validity of sectionEID and domainEID.
    artifact = _getArtifactByEncodedID(session, sectionEID)
    if not artifact:
        raise Exception('sectionEID does not map to valid Artifact. sectionEID/domainEIDs: %s/%s' % (sectionEID, domainEID))
    browseTerm = _getBrowseTermByEncodedID(session, domainEID)
    if not browseTerm:
        raise Exception('domainEID does not map to valid browseTerm. domainEID: %s' % domainEID)

    # Add retrolation if does not exists.
    query = session.query(model.Retrolation)
    query = query.filter_by(sectionEID = sectionEID)
    query = query.filter_by(domainEID = domainEID)
    domainRetrolation = _queryOne(query)
    if not domainRetrolation:
        domainRetrolation = model.Retrolation(sectionEID=sectionEID, domainEID=domainEID)
        session.add(domainRetrolation)

    return domainRetrolation

@_transactional()
def deleteDomainRetrolation(session, sectionEID, domainEID):
    return _deleteDomainRetrolation(session, sectionEID, domainEID)

def _deleteDomainRetrolation(session, sectionEID, domainEID):
    # Verify the validity of sectionEID and domainEID.
    artifact = _getArtifactByEncodedID(session, sectionEID)
    if not artifact:
        raise Exception('sectionEID does not map to valid Artifact. sectionEID/domainEIDs: %s/%s' % (sectionEID, domainEID))
    browseTerm = _getBrowseTermByEncodedID(session, domainEID)
    if not browseTerm:
        raise Exception('domainEID does not map to valid browseTerm. domainEID: %s' % domainEID)

    # Delete retrolation if exists.
    query = session.query(model.Retrolation)
    query = query.filter_by(sectionEID = sectionEID)
    query = query.filter_by(domainEID = domainEID)
    domainRetrolation = _queryOne(query)
    if domainRetrolation:
        session.delete(domainRetrolation)
        session.flush()

@_transactional()
def getDomainRetrolationByDomainEID(session, domainEID):
    return _getDomainRetrolationByDomainEID(session, domainEID)

def _getDomainRetrolationByDomainEID(session, domainEID):

    results = []
    query = session.query(model.Retrolation)
    query = query.filter_by(domainEID = domainEID)
    domainRetrolations = query.all()

    for domainRetrolation in domainRetrolations:
        sectionEID = domainRetrolation.sectionEID
        bookEID = '.'.join(sectionEID.split('.')[:-2])
        bookArtifact = _getArtifactByEncodedID(session, bookEID)
        bookArtifactDict = dict()
        if bookArtifact:
            bookArtifactDict = bookArtifact.asDict()
        artifact = _getArtifactByEncodedID(session, sectionEID)
        artifactDict = artifact.asDict()
        results.append({'section':artifactDict, 'book':bookArtifactDict})
    return results

@_transactional()
def getDomainRetrolationBySectionEID(session, sectionEID):
    return _getDomainRetrolationBySectionEID(session, sectionEID)

def _getDomainRetrolationBySectionEID(session, sectionEID):

    results = []
    query = session.query(model.Retrolation)
    query = query.filter_by(sectionEID = sectionEID)
    domainRetrolations = query.all()

    for domainRetrolation in domainRetrolations:
        domainEID = domainRetrolation.domainEID
        browseTerm = _getBrowseTermByEncodedID(session, domainEID)
        browseTermDict = browseTerm.asDict()
        results.append(browseTermDict)
    return results

@_transactional(readOnly=True)
def getLatestRevisionForArtifact(session, id):
    return _getLatestRevisionForArtifact(session, id)

def _getLatestRevisionForArtifact(session, id):
    query = session.query(model.ArtifactRevision)
    query = query.filter(model.ArtifactRevision.artifactID == id)
    query = query.order_by(desc(model.ArtifactRevision.id))
    return query.first()

@_transactional(readOnly=True)
def getFeaturedArtifactsByInternalTag(session, term, typeNames=None, sort=None, start=0, rows=5):
    query = ''
    if not term:
        term = '*'

    query += 'internaltags.ext:"__featured-%s" AND isPublic:"1"' % (term)
    if typeNames and 'artifact' not in typeNames:
        query += ' AND ('
        for typeName in typeNames:
            query += 'type:"%s" OR ' % (typeName)
        if query.endswith(' OR '):
            query = query.rsplit(' OR ', 1)[0]
        query += ')'

    return _searchGeneric(session, query, fq=False, sort=sort, idsOnly=True, start=start, rows=rows, spellSuggest=False)

def _getArtifactFeedbackDetails(session, fq = None, count=10,  pageNum=0, pageSize=0, sorting=None):

    """
        Return the  artifact feedbacks helpful count details information.
    """
    fields = {
        'isHelpful': model.ArtifactFeedbackHelpful.isHelpful,
        'isApproved': model.ArtifactFeedback.isApproved,
        'memberID': model.ArtifactFeedback.memberID
    }
    query = session.query(model.ArtifactFeedback, func.count(model.ArtifactFeedbackHelpful.artifactID).label('countOfNo'), model.ArtifactFeedbackHelpful.isHelpful)
    query = query.outerjoin(model.ArtifactFeedbackHelpful,
                            and_(model.ArtifactFeedback.artifactID == model.ArtifactFeedbackHelpful.artifactID,
                                 model.ArtifactFeedback.memberID == model.ArtifactFeedbackHelpful.memberID))
    #query = query.filter(model.ArtifactFeedbackHelpful.memberID == model.ArtifactFeedback.memberID)
    query = query.group_by(model.ArtifactFeedback.artifactID )
    query = query.group_by(model.ArtifactFeedback.memberID )
    query = query.having( func.count(model.ArtifactFeedbackHelpful.artifactID) >= count  )
    filterDict = {}
    if fq:
        for filterFld, filt in fq:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld is not None and filt is not None:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filt)

    if filterDict:
        for filterFld in filterDict.keys():
            filt = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filt))
            if filterFld == 'isHelpful':
                # if feedback count is zero then search for feedbacks which don't have any helpful count/flag
                if count == 0:
                    query = query.having(
                                     or_(fields[filterFld].in_(filt),
                                         func.count(model.ArtifactFeedbackHelpful.artifactID) == 0))
                    continue
            query = query.filter(fields[filterFld].in_(filt))

    #query = query.all()
    tableMap = {
        'artifactID' : model.ArtifactFeedback.artifactID,
        'memberID' : model.ArtifactFeedback.memberID,
        'comments' : model.ArtifactFeedback.comments,
        'countOfNo' : 'countOfNo',
    }

    if sorting is None or len(sorting) == 0:
        field = tableMap['artifactID']
        order = 'asc'
    else:
        sList = sorting.split(',')
        field = tableMap[sList[0]]
        order = sList[1] if len(sList) > 1 else 'asc'

    if order == 'asc':
        query = query.order_by(asc( field ) )
    else :
        query = query.order_by(desc(  field ) )

    return query

@_transactional(readOnly=True)
def getArtifactFeedbackDetails(session, fq=None, feedbackcount=10, pageNum=0, pageSize=0, sort=None) :
    """
        Get the artifact feedbacks helpful count details.with pagination
    """
    query = _getArtifactFeedbackDetails(session, fq, feedbackcount, pageNum, pageSize, sort)
    page = p.Page(query, pageNum, pageSize)
    return page


def _createArtifactContributionType(session, **kwargs):
    """
        Create a ContributionType artifact instance.
    """
    artifactID = kwargs.get('artifactID', None)
    log.debug('_createArtifactContributionType: artifactID[%s]' % artifactID)
    artifactContributionType = _getArtifactContributionType(session, artifactID)
    log.debug('_createArtifactContributionType: artifactContributionType[%s]' % artifactContributionType)
    if artifactContributionType:
        typeName = kwargs.get('typeName')
        log.debug('_createArtifactContributionType: typeName[%s]' % typeName)
        if artifactContributionType.typeName != typeName:
            raise Exception((_(u'Artifact id, %s, exists and have a different type, %s.' % (artifactID, artifactContributionType.typeName))).encode("utf-8"))
    else:
        artifactContributionType = model.ArtifactContributionType(**kwargs)
        session.add(artifactContributionType)

    log.debug('_createArtifactContributionType: artifactContributionType[%s]' % artifactContributionType)
    return artifactContributionType

@_transactional()
def createArtifactContributionType(session, **kwargs):
    """
        Create a ContributionType artifact instance.
    """
    _checkAttributes(['artifactID', 'typeName'], **kwargs)
    if not kwargs['artifactID'] or kwargs['typeName'] not in ['original', 'derived', 'modified']:
       raise Exception((_(u'Argument missing or invalid.')).encode("utf-8"))

    #checking artifact exsists
    if(getArtifactByID(kwargs['artifactID']) == None) :
        raise Exception((_(u'Artifact id Invalid or not exist.')).encode("utf-8"))

    #checking artifactID already exsists in ArtifactContributionType table
    if(getArtifactContributionType(kwargs['artifactID']).count()):
        raise Exception((_(u'Artifact id ('+str(kwargs['artifactID'])+') Already exists.')).encode("utf-8"))

    return _createArtifactContributionType(session, **kwargs)

@_transactional(readOnly=True)
def getArtifactContributionType(session, artifactID):
    return _getArtifactContributionType(session, artifactID)

def _getArtifactContributionType(session, artifactID):

    """
        Return the Artifact Contribution Type details that matches the given artifactID.
    """
    query = session.query(model.ArtifactContributionType)
    query = query.filter(model.ArtifactContributionType.artifactID ==  artifactID )
    return query.first()

def _deleteBranch(session, **kwargs):
    """
        Delete the entire branch.
    """
    _checkAttributes(['encodedID'], **kwargs)
    passKey = kwargs.get('passKey', None)
    if not passKey or passKey != 'I@mSt$':
        raise Exception('Cannot delete a branch. Must be created through taxonomy service.')

    browseTermEIDs = []
    def _getChilds(parentID):
        """
        Recursive function to get list of concepts under the branch.
        To avoid any dependancy issues during delete operation the list is prepared as leaf concepts first.
        """
        childs = query.filter_by(parentID=parentID)
        if not childs.count():
            return
        for child in childs:
            _getChilds(child.id)
            browseTermEIDs.append(child.encodedID)

    encodedID = kwargs['encodedID']
    query = session.query(model.BrowseTerm)
    branchTerm = _queryOne(query.filter_by(encodedID=encodedID))
    if not branchTerm:
        raise Exception('No Branch exists for encodedID/%s' % encodedID)

    branchID = branchTerm.id
    _getChilds(branchID)
    log.info("Total browseTerms to delete:%s" % len(browseTermEIDs))
    for browseTermEID in browseTermEIDs:
        log.info("Deleting browseTerm:%s" % browseTermEID)
        kwargs['encodedID'] = browseTermEID
        domainTerm = _deleteDomainTermByEncodedID(session, **kwargs)
        if not domainTerm:
            log.info("Unable to delete browseTerm, %s" % browseTermEID)

    kwargs['encodedID'] = branchTerm.encodedID
    domainTerm = _deleteDomainTermByEncodedID(session, **kwargs)
    if not domainTerm:
        log.info("Unable to delete browseTerm(Branch), %s" % branchTerm.encodedID)
    return branchTerm

@_transactional()
def deleteBranch(session, **kwargs):
    return _deleteBranch(session, **kwargs)

@_transactional(readOnly=True)
def getEmailReceiver(session, id):
    return _getEmailReceiver(session, id)

def _getEmailReceiver(session, id):
    """
        Get the email receiver by ID.
    """
    query = session.query(model.EmailReceiver)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional(readOnly=True)
def getEmailReceiverByEmail(session, email):
    return _getEmailReceiverByEmail(session, email)

def _getEmailReceiverByEmail(session, email):
    """
        Get the email receiver by email.
    """
    query = session.query(model.EmailReceiver)
    query = query.filter_by(email=email)
    return _queryOne(query)

@_transactional()
def createEmailReceiver(session, **kwargs):
    return _createEmailReceiver(session, **kwargs)

def _createEmailReceiver(session, **kwargs):
    """
        Create the email receiver.
    """
    _checkAttributes(['email'], **kwargs)
    emailReceiver = model.EmailReceiver(**kwargs)
    session.add(emailReceiver)
    return emailReceiver

@_transactional(readOnly=True)
def getEmailSender(session, id):
    return _getEmailSender(session, id)

def _getEmailSender(session, id):
    """
        Get the email sender by ID.
    """
    query = session.query(model.EmailSender)
    query = query.filter_by(id=id)
    return _queryOne(query)

@_transactional(readOnly=True)
def getEmailSenderByEmail(session, email):
    return _getEmailSenderByEmail(session, email)

def _getEmailSenderByEmail(session, email):
    """
        Get the email sender by email.
    """
    query = session.query(model.EmailSender)
    query = query.filter_by(email=email)
    return _queryOne(query)

@_transactional()
def createEmailSender(session, **kwargs):
    return _createEmailSender(session, **kwargs)

def _createEmailSender(session, **kwargs):
    """
        Create the email sender.
    """
    _checkAttributes(['email', 'name'], **kwargs)
    emailSender = model.EmailSender(**kwargs)
    session.add(emailSender)
    return emailSender

@_transactional(readOnly=True)
def getEmailSharing(session, senderID, receiverID, emailType):
    return _getEmailSharing(session, senderID, receiverID, emailType)

def _getEmailSharing(session, senderID, receiverID, emailType):
    """
        Get the email sender by senderID, receiverID, and emailType.
    """
    query = session.query(model.EmailSharing)
    query = query.filter_by(senderID=senderID)
    query = query.filter_by(receiverID=receiverID)
    query = query.filter_by(emailType=emailType)
    return _queryOne(query)

@_transactional()
def createEmailSharing(session, **kwargs):
    return _createEmailSharing(session, **kwargs)

def _createEmailSharing(session, **kwargs):
    """
        Create the email sender.
    """
    _checkAttributes(['senderID', 'receiverID', 'emailType'], **kwargs)
    emailSharing = model.EmailSharing(**kwargs)
    session.add(emailSharing)
    return emailSharing
##Course Related APIs

@_transactional()
def createCourse(session, **kwargs):
    """
        Create a Course instance.
    """
    return _createCourse(session, **kwargs)

def _createCourse(session, **kwargs):

    _checkAttributes(['title', 'shortName'], **kwargs)

    handle = kwargs.get('handle', '')
    title = kwargs['title']
    if not handle:
        handle = model.title2Handle(title)
        kwargs['handle'] = handle

    if getCourseByHandle(session, handle):
        raise Exception((_(u'Handle already in use.')).encode("utf-8"))

    if getCourseByTitle(session, title):
         raise Exception((_(u'Title already in use.')).encode("utf-8"))

    if getCourseByShortName(session, kwargs['shortName']):
         raise Exception((_(u'ShortName already in use.')).encode("utf-8"))

    now = datetime.now()
    kwargs['creationTime'] = now
    kwargs['updateTime'] = now
    course = model.Course(**kwargs)
    session.add(course)
    return course

@_transactional(readOnly=True)
def getCourse(session, sh):
    """
        Return course matching the handle or shortName passed
    """
    return _getCourse(session, sh)

def _getCourse(session, sh):
    c = getCourseByHandle(session, sh)
    if not c:
        c = getCourseByShortName(session, sh)
    return c

def getCourseByShortName(session, shortName):

    """
        Return course matching the shortName passed.
    """
    query = session.query(model.Course)
    query = query.filter_by(shortName=shortName)
    course = _queryOne(query)
    return course

def getCourseByHandle(session, handle):

    """
        Return course matching the handle passed.
    """
    query = session.query(model.Course)
    query = query.filter_by(handle=handle)
    course = _queryOne(query)
    return course

def getCourseByTitle(session, title):

    """
        Return course matching the title passed.
    """
    query = session.query(model.Course)
    query = query.filter_by(title=title)
    course = _queryOne(query)
    return course

@_transactional()
def getInfoCourses(session):

    """
        Return all courses info
    """
    query = session.query(model.Course).all()
    courseList = [c.asDict() for c in query]
    return courseList

@_transactional()
def updateCourse(session, **kwargs):

    return _updateCourse(session, **kwargs)

def _updateCourse(session, **kwargs):

    handle = kwargs.get('handle', None)
    shortName = kwargs.get('shortName', None)

    if not (handle or shortName):
        raise MissingAttributeError('No Course handle or shortName passed in attributes')

    if shortName:
        course = getCourseByShortName(session, shortName)
        if not course:
            raise Exception((_(u"No course with shortName: %(kwargs['shortName'])s")  % {"kwargs['shortName']":kwargs['shortName']}).encode("utf-8"))

    else:
        course = getCourseByHandle(session, handle)
        if not course:
            raise Exception((_(u"No course with handle: %(kwargs['handle'])s")  % {"kwargs['handle']":kwargs['handle']}).encode("utf-8"))

    if kwargs.has_key('title'):
        course.title = kwargs['title']

    if kwargs.has_key('description'):
        course.description = kwargs['description']

    course.updateTime = datetime.now()
    session.add(course)
    return course

@_transactional()
def deleteCourse(session, courseIdentifier):

    """
        Delete a Course instance with the handle or shortName as courseIdentifier.
    """
    return _deleteCourse(session, courseIdentifier)

def _deleteCourse(session, courseIdentifier):

    course = _getCourse(session, courseIdentifier)
    if not course:
       raise Exception ((_(u"No course with handle or shortName: %s")  % courseIdentifier).encode("utf-8"))

    session.delete(course)
    session.flush()
    return course

@_transactional()
def createArtifactCourse(session, **kwargs):

    return  _createArtifactCourse(session, **kwargs)

def _createArtifactCourse(session, **kwargs):

    _checkAttributes(['courseShortName', 'artifactID', 'domainID'], **kwargs)

    courseShortName = kwargs.get('courseShortName', None)
    course = getCourseByShortName(session, courseShortName)
    if not course:
         raise Exception ((_(u"No course with shortName: %s")  % courseShortName).encode("utf-8"))

    collectionHandle = course.handle
    artifact = _getArtifactByID(session, id=kwargs['artifactID'])
    if not artifact:
        raise Exception ((_(u"No artifact with id: %s")  % kwargs['artifactID']).encode("utf-8"))

    domainTerm = _getBrowseTermByID(session, id=kwargs['domainID'], typeName='domain')
    if not domainTerm :
        raise Exception ((_(u"No domainTerm with id: %s")  % kwargs['domainID']).encode("utf-8"))

    encodedID = domainTerm.encodedID

    query = session.query(model.RelatedArtifact)
    query = query.filter(and_(
        model.RelatedArtifact.artifactID == kwargs['artifactID'],
        model.RelatedArtifact.domainID == kwargs['domainID'])).all()

    if len(query) == 0 :
        raise Exception ((_(u"encodedID: %s and artifactID: %s are not related") %(encodedID, kwargs['artifactID'])).encode("utf-8"))

    for ra in query:
        if ra.conceptCollectionHandle == collectionHandle:
            raise Exception ((_(u"encodedID: %s, artifactID: %s, courseHandle: %s are already related") %(encodedID, kwargs['artifactID'], collectionHandle)).encode("utf-8"))

    sequence = query[0].sequence
    for ra in query:
        if ra.conceptCollectionHandle=='':
            ra.conceptCollectionHandle = collectionHandle
            session.add(ra)
            return ra
    kwargs['sequence'] = sequence
    artifactCourse = model.RelatedArtifact(**kwargs)
    session.add(artifactCourse)
    return artifactCourse

@_transactional()
def getPublishedArtifacts(session, **kwargs):
    """Get the published artifacts.
    """
    pageNum = kwargs.get('pageNum', 1)
    pageSize = kwargs.get('pageSize', 10)
    typeDict = _getArtifactTypesDict(session)
    typeIDs = []
    if kwargs.has_key('typeNames'):
        # Get the respective typeIDs for typeNames
        typeIDs = [typeDict[name].id for name in kwargs['typeNames']]

    skipCreatorIDs = kwargs.get('skipCreatorIDs', [])
    sinceUpdateTime = kwargs.get('sinceUpdateTime')
    untilUpdateTime = kwargs.get('untilUpdateTime')
    query = session.query(model.PublishedArtifact)
    if typeIDs:
        query = query.filter(model.PublishedArtifact.artifactTypeID.in_(typeIDs))
    if skipCreatorIDs:
        query = query.filter(~model.PublishedArtifact.creatorID.in_(skipCreatorIDs))
    if sinceUpdateTime and untilUpdateTime:
        query = query.filter(model.PublishedArtifact.updateTime>=sinceUpdateTime, model.PublishedArtifact.updateTime<=untilUpdateTime)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional()
def getConceptMapFeedbacks(session, memberID=None, encodedID=None, suggestion=None, reviewer=None, status=None, visitorID=None):
    return _getConceptMapFeedbacks(session, memberID=memberID, encodedID=encodedID, suggestion=suggestion, reviewer=reviewer, status=status, visitorID=visitorID)

def _getConceptMapFeedbacks(session, memberID=None, encodedID=None, suggestion=None, reviewer=None, status=None, visitorID=None):
    query = session.query(model.ConceptMapFeedback)
    if memberID:
        query = query.filter_by(memberID=memberID)
    else:
        query = query.order_by(memberID)
    if visitorID:
        query = query.filter_by(visitorID=visitorID)
    else:
        query = query.order_by(visitorID)
    if encodedID:
        query = query.filter_by(encodedID=encodedID)
    else:
        query = query.order_by(encodedID)
    if suggestion:
        query = query.filter_by(suggestion=suggestion)
    else:
        query = query.order_by(suggestion)
    if reviewer:
        query = query.filter_by(reviewer=reviewer)
    else:
        query = query.order_by(reviewer)
    if status:
        query = query.filter_by(status=status)
    else:
        query = query.order_by(status)
    feedbacks = query.all()
    return feedbacks

@_transactional()
def createBookEditingAssignment(session, assignee, book, artifact, group):
   return _createBookEditingAssignment(session, assignee, book, artifact, group)

def _createBookEditingAssignment(session, assignee, book, artifact, group):
    from datetime import datetime as dt

    data = {
        'assigneeID': assignee.id,
        'bookID': book.id,
        'artifactID': artifact.id,
        'artifactTypeID': artifact.artifactTypeID,
        'groupID': group.id,
        'creationTime': dt.now(),
    }
    bookEditingAssignment = model.BookEditingAssignment(**data)
    session.add(bookEditingAssignment)
    log.debug('_createBookEditingAssignment: bookEditingAssignment[%s]' % bookEditingAssignment)
    return bookEditingAssignment

@_transactional()
def getBookEditingAssignments(session, assigneeID=None, bookID=None, artifactID=None, groupID=None, activeOnly=True):
    return _getBookEditingAssignments(session, assigneeID=assigneeID, bookID=bookID, artifactID=artifactID, groupID=groupID, activeOnly=activeOnly)

def _getBookEditingAssignments(session, assigneeID=None, bookID=None, artifactID=None, groupID=None, activeOnly=True):
    query = session.query(model.BookEditingAssignment).distinct()
    if bookID:
        query = query.filter_by(bookID=bookID)
    if assigneeID:
        query = query.filter_by(assigneeID=assigneeID)
    if artifactID:
        query = query.filter_by(artifactID=artifactID)
    if groupID:
        query = query.filter_by(groupID=groupID)
    if activeOnly:
        query = query.join(model.Group, model.Group.id == model.BookEditingAssignment.groupID)
        query = query.filter(model.Group.isActive == 1)
    results = query.all()
    return results

@_transactional()
def getBookEditingAssignmentsWithARID(session, assigneeID=None, bookID=None, artifactID=None, groupID=None, creatorID=None, activeOnly=True):
    return _getBookEditingAssignmentsWithARID(session, assigneeID=assigneeID, bookID=bookID, artifactID=artifactID, groupID=groupID, creatorID=creatorID, activeOnly=activeOnly)

def _getBookEditingAssignmentsWithARID(session, assigneeID=None, bookID=None, artifactID=None, groupID=None, creatorID=None, activeOnly=True):
    arAlias = aliased(model.ArtifactRevision)
    sq = session.query(func.max(arAlias.id).label('maxID'), arAlias.artifactID.label('artifactID'))
    if artifactID:
        sq = sq.filter(arAlias.artifactID == artifactID)
    sq = sq.group_by(arAlias.artifactID)
    sq = sq.subquery()

    query = session.query(model.BookEditingAssignment, sq.c.maxID, model.Member.email).distinct()
    if bookID:
        query = query.filter_by(bookID=bookID)
    if assigneeID:
        query = query.filter_by(assigneeID=assigneeID)
    if artifactID:
        query = query.filter_by(artifactID=artifactID)
    if groupID:
        query = query.filter_by(groupID=groupID)
    if creatorID or activeOnly:
        query = query.join(model.Group, model.Group.id == model.BookEditingAssignment.groupID)
        if creatorID:
            query = query.filter(model.Group.creatorID == creatorID)
        if activeOnly:
            query = query.filter(model.Group.isActive == 1)

    query = query.join(model.Member, model.Member.id == model.BookEditingAssignment.assigneeID)
    query = query.join(sq, sq.c.artifactID == model.BookEditingAssignment.artifactID)
    results = query.all()
    return results

@_transactional()
def getBookEditingAssignmentsFromARID(session, artifactRevisionID):
    return _getBookEditingAssignmentsFromARID(session, artifactRevisionID)

def _getBookEditingAssignmentsFromARID(session, artifactRevisionID):
    log.debug('_getBookEditingAssignmentsFromARID: artifactRevisionID[%s]' % artifactRevisionID)
    query = session.query(model.BookEditingAssignment, model.Artifact.creatorID)
    query = query.join(model.BookEditingDraft, model.BookEditingDraft.assigneeID == model.BookEditingAssignment.assigneeID)
    query = query.filter(model.BookEditingDraft.artifactRevisionID == artifactRevisionID)
    query = query.join(model.ArtifactRevision, model.ArtifactRevision.id == artifactRevisionID)
    query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
    query = query.filter(model.BookEditingAssignment.artifactID == model.Artifact.id)
    return query.first()

BOOK_EDITING_READ = 1
BOOK_EDITING_CREATE = 2
BOOK_EDITING_UPDATE = 3
BOOK_EDITING_DELETE = 4
BOOK_EDITING_FINALIZE = 5

@_transactional()
def authorizeBookEditing(session, memberID, email, operation, creatorID, artifactID):
    _authorizeBookEditing(session, memberID, email, operation, creatorID, artifactID)

def _authorizeBookEditing(session, memberID, email, operation, creatorID, artifactID):
    if int(creatorID) == memberID:
        #
        #  Owner, make sure no other assignees except the READ operation.
        #
        if operation in [BOOK_EDITING_CREATE, BOOK_EDITING_UPDATE, BOOK_EDITING_DELETE, BOOK_EDITING_FINALIZE]:
            editingAssignments = _getBookEditingAssignments(session, artifactID=artifactID)
            if editingAssignments:
                raise ex.UnauthorizedException(u'Artifact[{artifactID}] is being edited by others.'.format(artifactID=artifactID).encode('utf-8'))
    else:
        #
        #  Not owner, need to authorize.
        #
        if not email:
            email = memberID
        if operation in [BOOK_EDITING_FINALIZE]:
            #
            #  Assignees cannot finalize.
            #
            editingAssignments = _getBookEditingAssignments(session, artifactID=artifactID)
            if editingAssignments:
                editingAssignment = editingAssignments[0]
                if editingAssignment.assigneeID == memberID:
                    raise ex.UnauthorizedException(u'Artifact[{artifactID}] is not authorized for [{email}] to finalize.'.format(artifactID=artifactID, email=email).encode('utf-8'))
        elif operation in [BOOK_EDITING_CREATE, BOOK_EDITING_UPDATE, BOOK_EDITING_DELETE]:
            #
            #  Non-assignee and not-owner cannot make changes.
            #
            editingAssignments = _getBookEditingAssignments(session, assigneeID=memberID, artifactID=artifactID)
            if not editingAssignments:
                raise ex.UnauthorizedException(u'Artifact[{artifactID}] has not been assigned to [{email}].'.format(artifactID=artifactID, email=email).encode('utf-8'))
        elif operation == BOOK_EDITING_READ:
            #
            #  Assignees within the book can read all drafts of the book.
            #
            editingAssignments = _getBookEditingAssignments(session, artifactID=artifactID)
            log.debug('_authorizeBookEditing: artifactID[%s] editingAssignments[%s]' % (artifactID, editingAssignments))
            if editingAssignments:
                editingAssignment = editingAssignments[0]
                groupID = editingAssignment.groupID
                gm = _getMemberGroup(session, id=memberID, groupID=groupID)
                if not gm:
                    #
                    #  Not an assignee of the book this artifact belongs to.
                    #
                    raise ex.UnauthorizedException(u'Artifact[{artifactID}] is not authorized to [{email}] to read.'.format(artifactID=artifactID, email=email).encode('utf-8'))
            else:
                editingAssignments = _getBookEditingAssignments(session, assigneeID=memberID)
                log.debug('_authorizeBookEditing: memberID[%s] editingAssignments[%s]' % (memberID, editingAssignments))
                if not editingAssignments:
                    raise ex.UnauthorizedException(u'Artifact[{artifactID}] is not authorized to [{email}] to read.'.format(artifactID=artifactID, email=email).encode('utf-8'))
                authorized = False
                for editingAssignment in editingAssignments:
                    bookID = editingAssignment.bookID
                    descendants = _getArtifactDescendants(session, bookID)
                    log.debug('_authorizeBookEditing: bookID[%s] descendants[%s]' % (bookID, descendants))
                    if descendants and artifactID in descendants:
                        authorized = True
                        break
                if not authorized:
                    #
                    #  Not an assignee of the book this artifact belongs to.
                    #
                    raise ex.UnauthorizedException(u'Artifact[{artifactID}] is not authorized to [{email}] to read.'.format(artifactID=artifactID, email=email).encode('utf-8'))

@_transactional()
def createBookEditingDraft(session, artifactRevisionID, assigneeID):
   return _createBookEditingDraft(session, artifactRevisionID, assigneeID)

def _createBookEditingDraft(session, artifactRevisionID, assigneeID):
    from datetime import datetime as dt

    data = {
        'artifactRevisionID': artifactRevisionID,
        'assigneeID': assigneeID,
        'creationTime': dt.now(),
    }
    bookEditingDraft = model.BookEditingDraft(**data)
    session.add(bookEditingDraft)
    log.debug('_createBookEditingDraft: bookEditingDraft[%s]' % bookEditingDraft)
    return bookEditingDraft

@_transactional()
def getBookEditingDrafts(session, artifactRevisionID=None, assigneeID=None):
    return _getBookEditingDrafts(session, artifactRevisionID=artifactRevisionID, assigneeID=assigneeID)

def _getBookEditingDrafts(session, artifactRevisionID=None, assigneeID=None):
    query = session.query(model.BookEditingDraft).distinct()
    if artifactRevisionID:
        query = query.filter_by(artifactRevisionID=artifactRevisionID)
    if assigneeID:
        query = query.filter_by(assigneeID=assigneeID)
    results = query.all()
    return results

@_transactional()
def createBookFinalization(session, bookID, total):
   return _createBookFinalization(session, bookID, total)

def _createBookFinalization(session, bookID, total):
    from datetime import datetime as dt

    data = {
        'bookID': bookID,
        'total': total,
        'completed': 0,
        'creationTime': dt.now(),
    }
    bookFinalization = model.BookFinalization(**data)
    session.add(bookFinalization)
    log.debug('_createBookFinalization: bookFinalization[%s]' % bookFinalization)
    return bookFinalization

@_transactional()
def getBookFinalization(session, bookID=None, taskID=None):
    return _getBookFinalization(session, bookID=bookID, taskID=taskID)

def _getBookFinalization(session, bookID=None, taskID=None):
    query = session.query(model.BookFinalization).distinct()
    if bookID:
        query = query.filter_by(bookID=bookID)
    if taskID:
        query = query.filter_by(taskID=taskID)
    results = query.first()
    return results

@_transactional()
def createBookFinalizationLock(session, artifactID, bookID):
   return _createBookFinalizationLock(session, artifactID, bookID)

def _createBookFinalizationLock(session, artifactID, bookID):
    data = {
        'artifactID': artifactID,
        'bookID': bookID,
    }
    bookFinalizationLock = model.BookFinalizationLock(**data)
    session.add(bookFinalizationLock)
    log.debug('_createBookFinalizationLock: bookFinalizationLock[%s]' % bookFinalizationLock)
    return bookFinalizationLock

@_transactional()
def getBookFinalizationLock(session, artifactID):
    return _getBookFinalizationLock(session, artifactID)

def _getBookFinalizationLock(session, artifactID):
    query = session.query(model.BookFinalizationLock)
    query = query.filter_by(artifactID=artifactID)
    lock = query.first()
    return lock

@_transactional()
def checkBookFinalizationLock(session, artifactID):
    return _checkBookFinalizationLock(session, artifactID)

def _checkBookFinalizationLock(session, artifactID):
    lock = _getBookFinalizationLock(session, artifactID)
    if lock:
        from pylons import tmpl_context as c
        from flx.controllers.errorCodes import ErrorCodes

        log.debug('_checkBookFinalizationLock: lock[%s]' % lock)
        c.errorCode = ErrorCodes.BOOK_FINALIZING
        raise ex.UnauthorizedException((_(u'Group finalization in progress.')).encode("utf-8"))

def _constructUpdateArtifactArgs(session, artifact, params, member, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, artifactCache, isEncoded=True):
    log.debug('_constructUpdateArtifactArgs: isEncoded[%s]' % isEncoded)
    memberID = member.id
    kwargs = {
        'artifact': artifact,
        'artifactID': artifact.id,
        'member': member,
        'memberID': memberID,
    }

    if artifact.type.name not in bookTypes:
        if memberID != artifact.creatorID:
            _authorizeBookEditing(session, member.id, member.email, BOOK_EDITING_FINALIZE, artifact.creatorID, artifact.id)

    kwargs['forceCopy'] = params.has_key('forceCopy')
    if params.has_key('comment'):
        kwargs['comment'] = params.get('comment')
    domainEID = params.get('domainEID')
    domainEIDs = params.get('domainEIDs', '')
    if domainEIDs:
        domainEIDs = [ x.strip().upper() for x in domainEIDs.split(',') ]

    if domainEID and not domainEIDs:
        domainEIDs = [ domainEID ]

    for domainEID in domainEIDs:
        try:
            domainID = long(domainEID)
            domainTerm = _getBrowseTermByID(session, id=domainID)
            domainEID = domainTerm.encodedID
        except:
            pass
    if domainEIDs:
        kwargs['domainEIDs'] = domainEIDs
        log.debug("_constructUpdateArtifactArgs: domainEIDs: %s" % str(domainEIDs))
    else:
        kwargs['removeExistingDomains'] = params.has_key('domainEIDs')

    if params.get('removeExistingRelatedArtifacts'):
        kwargs['removeExistingRelatedArtifacts'] = True
    if params.get('removeExistingDomains'):
        kwargs['removeExistingDomains'] = True
        if not 'removeExistingRelatedArtifacts' in kwargs:
            kwargs['removeExistingRelatedArtifacts'] = True

    collections = params.get('collections', None)
    if collections:
        conceptCollectionHandles = []
        collectionCreatorIDs = []
        for collection in collections:
            log.debug('_constructUpdateArtifactArgs: collection[%s]' % collection)
            conceptCollectionHandle = collection.get('conceptCollectionHandle').strip()
            if conceptCollectionHandle:
                conceptCollectionHandles.append(conceptCollectionHandle)
            collectionCreatorID = collection.get('collectionCreatorID')
            if collectionCreatorID:
                collectionCreatorIDs.append(int(collectionCreatorID))
        log.debug('_constructUpdateArtifactArgs: conceptCollectionHandles[%s]' % conceptCollectionHandles)
        log.debug('_constructUpdateArtifactArgs: collectionCreatorIDs[%s]' % collectionCreatorIDs)
        if len(collectionCreatorIDs) != len(conceptCollectionHandles):
            raise Exception('Count mismatch for conceptCollectionHandles and collectionCreatorIDs')
        kwargs['conceptCollectionHandles'] = conceptCollectionHandles
        kwargs['collectionCreatorIDs'] = collectionCreatorIDs
    elif params.get('conceptCollectionHandles') and params.get('collectionCreatorIDs'):
        conceptCollectionHandles = params.get('conceptCollectionHandles', '')
        collectionCreatorIDs = params.get('collectionCreatorIDs', '')
        conceptCollectionHandles = conceptCollectionHandles.split(",")
        collectionCreatorIDs = [ int(x) if x.strip() else 0 for x in collectionCreatorIDs.split(',') ]
        if conceptCollectionHandles and collectionCreatorIDs:
            kwargs['collectionCreatorIDs'] = collectionCreatorIDs
            if len(kwargs['collectionCreatorIDs']) != len(conceptCollectionHandles):
                raise Exception('Count mismatch for conceptCollectionHandles and collectionCreatorIDs')
            kwargs['conceptCollectionHandles'] = conceptCollectionHandles
    elif params.has_key('conceptCollectionHandles'):
        kwargs['removeExistingConceptCollectionAssociations'] = True
    kwargs['removeExistingConceptCollectionAssociations'] = str(params.get('removeExistingConceptCollectionAssociations')).lower() == 'true'
    

    kwargs['changed_metadata'] = params.get('changed_metadata', None)
    kwargs['resourceRevisionIDs'] = params.get('resourceRevisionIDs', None)
    #
    #  Here is the handle selection, assuming that title (name) are always provided:
    #
    #   handle              yes         yes              no          no
    #   originalHandle      yes          no             yes          no
    #   ---------------------------------------------------------------
    #   selection        handle      handle  originalHandle     current(creator)
    #                                                           title(derivation)
    #
    name = params.get('title')
    if not name and params.has_key('titleEnc'):
        try:
            name = h.safe_decode(base64.b64decode(params.get('titleEnc')))
        except TypeError:
            log.warn("Could not base64 decode titleEnc")
    if name:
        name = name.strip()
    handle = params.get('handle')
    if handle:
        handle = handle.strip()
    originalHandle = params.get('originalHandle')
    if originalHandle:
        originalHandle = originalHandle.strip()
    kwargs['originalHandle'] = originalHandle
    if not handle:
        if originalHandle:
            handle = originalHandle
    if not handle:
        if memberID == artifact.creatorID:
            handle = artifact.handle
        else:
            handle = model.title2Handle(name)
    if not handle:
        raise ex.EmptyArtifactHandleException((_(u'The handle was empty or not provided. Please provide one.')).encode("utf-8"))
    log.info("_constructUpdateArtifactArgs: handle: %s" % handle)

    if name is None:
        name = artifact.name
    else:
        if name != artifact.name and name != model.stripChapterName(artifact.name):
            log.debug('_constructUpdateArtifactArgs: name[%s]' % name)
            log.debug('_constructUpdateArtifactArgs: artifact.name[%s]' % artifact.name)
            pattern = model.getChapterSeparator()
            names = re.split(pattern, artifact.name)
            if len(names) > 1:
                names[0] = name
                pattern = model.getChapterSeparator()
                name = pattern.join(names)
            typeID = artifact.artifactTypeID
            log.debug('_constructUpdateArtifactArgs: name[%s]' % name)

            a = _getArtifactByHandle(session, handle=handle, typeID=typeID, creatorID=member.id)
            if a is not None and a.id != artifact.id:
                raise ex.AlreadyExistsException(_(u"%s with handle, '%s', already exists" % (artifact.type.name, handle)).encode("utf-8"))

            kwargs['name'] = name

    if artifact.type.name == 'assignment':
        #
        #  Assignment.
        #
        if member.id != artifact.creatorID:
            raise ex.UnauthorizedException((_(u'Only creator can update assignments.')).encode("utf-8"))

        kwargs['due'] = params.get('due', None)

    if not kwargs.get('handle') and handle:
        kwargs['handle'] = handle

    log.info("updateArtifact: handle: %s" % kwargs.get('handle'))
    if params.has_key('description'):
        kwargs['description'] = params['description']
    elif params.has_key('summary'):
        kwargs['description'] = params['summary']
    elif params.has_key('summaryEnc'):
        try:
            kwargs['description'] = h.safe_decode(base64.b64decode(params.get('summaryEnc')))
        except TypeError:
            log.warn("Could not base64 decode summaryEnc")

    try:
        kwargs['messageToUsers'] = params['messageToUsers']
    except Exception, e:
        kwargs['messageToUsers'] = None

    if params.has_key('licenseName'):
        kwargs['licenseName'] = params.get('licenseName')

    if params.has_key('languageCode'):
        kwargs['languageCode'] = params.get('languageCode')

    ## Get languageCode for resources
    languageCode = params.get('languageCode', 'en')
    language = _getLanguageByNameOrCode(session, nameOrCode=languageCode)
    if not language:
        raise Exception(_('Invalid languageCode [%s]' % languageCode))

    browseTerms = []
    for domainEID in domainEIDs:
        ## skip subject and branch level terms [Bug: 15699]
        if domainEID.count('.') <= 1:
            continue
        term = _getBrowseTermByEncodedID(session, encodedID=domainEID)
        if not term:
            raise Exception('No such domain term: %s' % domainEID)
        browseTerms.append({'browseTermID': term.id})

    eid = params.get('encodedID', '')
    if eid:
        eid = eid.strip()
    if artifact.type.modality and eid:
        domainEID = '.'.join(eid.split('.')[:-2])
        if domainEID not in domainEIDs:
            term = _getBrowseTermByEncodedID(session, encodedID=domainEID)
            if not term:
                raise Exception('No such domain term for EID: %s' % domainEID)
            browseTerms.append({'browseTermID': term.id})
        kwargs['encodedID'] = eid
    elif eid:
        kwargs['encodedID'] = eid

    level = params.get('level', '')
    if level:
        level = level.strip().lower()
    if level:
        lvlTerm = _getBrowseTermByIDOrName(session, idOrName=level, type=termTypes['level'])
        if lvlTerm:
            browseTerms.append({'browseTermID': lvlTerm.id})
        else:
            raise Exception('No such level term: %s' % level)

    kwargs['removeExistingContributor'] = params.has_key('contributedBy')
    contributedBy = params.get('contributedBy', '')
    if contributedBy:
        contributedBy = contributedBy.strip().lower()
    if contributedBy:
        cbTerm = _getBrowseTermByIDOrName(session, idOrName=contributedBy, type=termTypes['contributor'])
        if cbTerm:
            browseTerms.append({'browseTermID': cbTerm.id })
        else:
            raise Exception(_('Invalid contributedBy term [%s] specified.' % contributedBy))

    kwargs['removeExistingTags'] = params.has_key('tags')
    tagTerms = []
    tags = params.get('tags', '')
    if tags:
        tags = [ x.strip() for x in tags.split(';') ]
        for tag in tags:
            if tag:
                tagTerm = _getTagTermByIDOrName(session, idOrName=tag)
                if tagTerm:
                    tagTerms.append({'tagTermID': tagTerm.id })
                else:
                    tagTerms.append({'name': tag})

    if params.get('bookTitle'):
        kwargs['bookTitle'] = params.get('bookTitle')

    resources = []
    try:
        coverImageType = _getResourceTypeByName(session, name='cover page')
        coverImageName = params.get('cover image name')
        coverImageDescription = params.get('cover image description')
        coverImagePath = None

        uriOnly = False
        hasPath = False
        if params.has_key('cover image path'):
            coverImagePath = params['cover image path']
            if h.isUploadField(coverImagePath):
                hasPath = True
        else:
            hasPath = False
        xhtml = None
        try:
            xhtml = params['xhtml']
            if xhtml is None or len(xhtml) == 0:
                raise KeyError()
            log.debug('_constructUpdateArtifactArgs: xhtml[%s]' % xhtml)
            if isEncoded:
                try:
                    xhtml = base64.b64decode(xhtml)
                    log.debug('_constructUpdateArtifactArgs: decoded xhtml[%s]' % xhtml)
                except TypeError:
                    log.warn("Unable to base64 decode 'xhtml'")
        except KeyError:
            pass

        existingCoverImage = artifact.revisions[0].getCoverImageUri(returnWithID=False)
        log.info('existingCoverImage: [%s]' %(existingCoverImage))
        genericCoverImages = ['cover_chapter_generic.png', 'cover_concept_generic.png', 'cover_flexbook_generic.png', 'cover_lesson_generic.png', 'read_gicon.png']
        existingCoverImageName = None
        if existingCoverImage:
            existingCoverImageName = os.path.basename(existingCoverImage)
        if params.has_key('cover image uri') and params['cover image uri']:
            log.info("Cover image uri: %s" % params['cover image uri'])
            coverImagePath = params['cover image uri']
        elif (type == 'lesson' or type == 'concept') and xhtml and artifact.creatorID == member.id and existingCoverImageName in genericCoverImages:
            ## Bug #29978 Do not find the first image as cover page if the lesson is being copied
            coverImagePath = _get_first_img_src(xhtml)

        isExternal = False
        if coverImagePath:
            if coverImagePath.startswith('/flx/'):
                coverImagePath = config.get('web_prefix_url') + coverImagePath
            if coverImagePath.find('://') > 0:
                isExternal = True
            log.info('CoverImagePath: %s' %(coverImagePath))

        if not hasPath and coverImagePath:
            uriOnly = True
            coverImagePath = coverImagePath.rstrip('/')

        log.info("Has path %s, uriOnly: %s" % (str(hasPath), str(uriOnly)))
        if hasPath or uriOnly:
            path,coverID = artifact.revisions[0].getCoverImageUri(returnWithID=True)
            if coverID:
                if coverImagePath and path != coverImagePath:
                    #
                    #  See if the resource for coverImagePath already exist.
                    #
                    resource = _getResourceByUri(session, coverImagePath, member.id)
                    if resource:
                        coverID = resource.revisions[0].id
                    else:
                        coverID = None
                if coverID:
                    coverImageDict = {
                        'resourceType': coverImageType,
                        'name': coverImageName,
                        'resourceHandle': os.path.basename(coverImagePath),
                        'description': coverImageDescription,
                        'uri': coverImagePath,
                        'isExternal': isExternal,
                        'uriOnly': uriOnly,
                        'id': coverID,
                        'languageID': language.id,
                    }
                    resources.append(coverImageDict)
    except Exception, e:
        log.error('create artifact cover image Exception[%s]' % str(e), exc_info=e)
        raise e

    try:
        xhtml = params['xhtml']
        if xhtml is None: # or len(xhtml) == 0:
            raise KeyError()
        log.debug('_constructUpdateArtifactArgs: xhtml[%s]' % xhtml)
        if isEncoded:
            try:
                xhtml = base64.b64decode(xhtml)
                log.debug('_constructUpdateArtifactArgs: decoded xhtml[%s]' % xhtml)
            except TypeError:
                log.warn("Unable to base64 decode 'xhtml'")
        try:
            xhtmlID = params['xhtmlID']
        except KeyError:
            xhtmlID, uri = artifact.getContentInfo()
        contentType = _getResourceTypeByName(session, name='contents')
        contentDict = {
            'resourceType': contentType,
            'resourceTypeName': 'contents',
            'id': xhtmlID,
            'name': name,
            'description': kwargs.get('description', ''),
            'contents': xhtml,
        }
        resources.append(contentDict)
        kwargs['resources'] = resources
    except KeyError:
        #
        #  No content update for this artifact.
        #
        pass
    except Exception, e:
        raise e

    if browseTerms:
        kwargs['browseTerms'] = browseTerms

    if tagTerms:
        kwargs['tagTerms'] = tagTerms

    if params.has_key('authors'):
        isJson = True
        authorDict = params['authors']
        if type(authorDict) != dict:
            try:
                authorDict = json.loads(authorDict)
            except TypeError:
                isJson = False
            except ValueError:
                isJson = False
        if isJson:
            authors = []
            for roleName in authorDict.keys():
                roleID = memberRoleNameDict[roleName]
                aList = authorDict[roleName]
                sequence = 0
                for info in aList:
                    if isinstance(info, list):
                        authorName, sequence = info
                    else:
                        authorName = info
                        sequence += 1
                    authors.append([ authorName, roleID, sequence ])
        elif type(authorDict) == list:
            authorList = authorDict
            authors = []
            for author in authorList:
                authors.append([ author.get('name'), author.get('role', author.get('roleID')), author.get('sequence') ])
        else:
            authors = authorDict.strip()
            authors = authors.split(';')
            authors = [ x.split(':') if ':' in x else [ '%s' % x, 'author' ] for x in authors ]
            log.info('_constructUpdateArtifactArgs: else authors[%s]' % authors)
        kwargs['authors'] = authors
        log.info("Authors: %s" % authors)

    if params.has_key('children'):
        children = params['children']
        log.info("Children: %s" % children)
        if type(children) == list:
            childIDList = children
        else:
            childIDList = []
            ch = re.sub(r'[^0-9,]', '', children)
            try:
                if ',' not in ch:
                    if ch[0] == '[':
                        ch = ch[1:-1]
                    childIDList = [ int(ch) ]
                else:
                    childIDList = json.loads(ch)
            except:
                ## Not json
                log.warn("Not json: %s" % ch)
                if ch.strip():
                    childIDList = [ int(child.strip()) for child in ch.strip().split(',') ]
        kwargs['children'] = childIDList
        log.info("Children: %s" % kwargs['children'])

    #api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, memberID=member.id)
    kwargs['cache'] = artifactCache
    return kwargs

def _get_first_img_src(xhtml_content):
    log.info("Trying to find first image as cover page from xhtml ...")
    img_src = None
    try:
        img_re = re.compile('<img .*?src=\W*"(.*?)"', re.DOTALL)
        img_srcs = img_re.findall(xhtml_content.replace('\n',''))
        img_src = None
        for each in img_srcs: 
            if not each.lower().__contains__('/flx/math/'):
                img_src = each
                break
        if img_src:
            img_src = re.sub('(.*?)THUMB.*?(image.*)','\\1\\2',img_src)
        
    except Exception: 
        img_src = None
    log.info("Found first image from xhtml as cover page: [%s]" % img_src)
    return img_src

@_transactional()
def finalizeBook(session, info, memberID, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, artifactCache, task=None):
    member = _getMemberByID(session, id=memberID)
    return _finalizeBook(session, info, member, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, artifactCache, task=task)

def _finalizeBook(session, info, member, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, artifactCache, task=None):

    def _copyChildren(session, revisionID):
        children = []
        revision = _getArtifactRevisionByID(session, id=revisionID)
        for child in revision.children:
            data = {
                'hasArtifactRevisionID': child.hasArtifactRevisionID,
                'sequence': child.sequence,
            }
            children.append(data)
        log.debug('_finalizeBook._copyChildren: children[%s]' % children)
        return revision, children

    def _createNewRevision(session, revision, children):
        log.debug('_finalizeBook._createNewRevision: revision.id[%s]' % revision.id)
        data = {
            'artifactID': revision.artifactID,
            'revision': str(int(revision.revision) + 1),
            'comment': revision.comment,
            'messageToUsers': revision.messageToUsers,
            'downloads': 0,
            'favorites': revision.favorites,
            'creationTime': datetime.utcnow(),
            'publishTime': revision.publishTime,
        }
        log.debug('_finalizeBook._createNewRevision: data[%s]' % data)

        newRevision = model.ArtifactRevision(**data)
        newChildren = []
        for child in children:
            newChild = model.ArtifactRevisionRelation(**child)
            newChild.parent = newRevision
            newChildren.append(newChild)
        newRevision.children = newChildren
        log.debug('_finalizeBook._createNewRevision: newRevision[%s]' % newRevision)
        session.add(newRevision)
        session.flush()
        _safeAddObjectToLibrary(session, objectID=newRevision.id, objectType='artifactRevision', memberID=newRevision.artifact.creatorID)
        return newRevision


    try:
        memberID = member.id
        bookID = info.get('artifactID', None)
        bookFinalization = _getBookFinalization(session, bookID=bookID)
        bookRevisionID = info.get('artifactRevisionID', None)
        log.debug('_finalizeBook: bookRevisionID[%s]' % bookRevisionID)
        bookRevision, bookChildren = _copyChildren(session, bookRevisionID)
        children = info.get('children', None)
        bcCount = len(children)
        if bcCount != len(bookChildren):
            raise ex.InvalidArgumentException((_(u'Incorrect book children list.')).encode("utf-8"))
        log.debug('_finalizeBook: bcCount[%s]' % bcCount)

        toCreateNewBookRevision = False
        for c in range(0, bcCount):
            child = children[c]
            log.debug('_finalizeBook: child[%s]' % child)

            def finalize(child, bookID, bookFinalization):
                log.debug('_finalizeBook.finalize: child[%s]' % child)
                log.debug('_finalizeBook.finalize: bookID[%s]' % bookID)
                artifactDict = None
                try:
                    finalize = child.get('finalize', None)
                    log.debug('_finalizeBook.finalize: finalize[%s]' % finalize)
                    if finalize is True:
                        revisionID = child.get('artifactRevisionID', None)
                        log.debug('_finalizeBook.finalize: revisionID[%s]' % revisionID)
                        query = session.query(model.ArtifactDraft)
                        query = query.filter_by(artifactRevisionID=revisionID)
                        artifactDraft = query.first()
                        if not artifactDraft:
                            raise ex.ResourceNotFoundException(u"ArtifactDraft with the given artifactRevisionID : [{revisionID}] could not be found.".format(revisionID=revisionID).encode('utf-8'))
                        if artifactDraft.isCompressed:
                            try:
                                artifactDraftData = zlib.decompress(artifactDraft.draft)
                            except Exception, e:
                                artifactDraftData = artifactDraft.draft
                        else:
                            artifactDraftData = artifactDraft.draft
                        artifactDict = json.loads(artifactDraftData)
                        artifactDict['memberID'] = artifactDict.get('creatorID')
                        if revisionID != artifactDict.get('latestRevisionID'):
                            latestRevisionID = artifactDict.get('latestRevisionID')
                            latestArtifactRevision = _getArtifactRevisionByID(session, id=latestRevisionID)
                            if not latestArtifactRevision or latestArtifactRevision.artifactID == int(artifactDict.get('id')):
                                raise ex.InvalidArgumentException((_(u'%(revisionID)s is not the latest revision, %(latestRevisionID)s is.' % {'revisionID':revisionID, 'latestRevisionID':latestRevisionID})).encode("utf-8"))
                        artifact = _getArtifactByID(session, id=artifactDict.get('id'))
                        log.debug('_finalizeBook.finalize: before artifact.id[%s]' % artifact.id)
                        log.debug('_finalizeBook.finalize: before revision.id[%s]' % artifact.revisions[0].id)
                        kwargs = _constructUpdateArtifactArgs(session, artifact, artifactDict, member, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, artifactCache, isEncoded=False)
                        if artifactDict.get('artifactType') == 'lesson':
                            artifact, concept = _updateLesson(session, **kwargs)
                        else:
                            artifact = _updateArtifact(session, **kwargs)
                        if artifact:
                            session.flush()
                            log.debug('_finalizeBook.finalize: deleting draft for revisionID[%s]' % revisionID)
                            _deleteMemberArtifactDraftByArtifactRevisionID(session, memberID=memberID, artifactRevisionID=revisionID)
                            #
                            #  Delete the BookEditingDraft entry if it already exists.
                            #
                            bookEditingDrafts = _getBookEditingDrafts(session, artifactRevisionID=revisionID)
                            for bookEditingDraft in bookEditingDrafts:
                                log.debug('_finalizeBook.finalize: deleting bookEditingDraft[%s]' % bookEditingDraft)
                                session.delete(bookEditingDraft)

                            log.debug('_finalizeBook.finalize: after artifact.id[%s]' % artifact.id)
                            log.debug('_finalizeBook.finalize: after revision.id[%s]' % artifact.revisions[0].id)
                            bookFinalization.completed += 1
                            session.add(bookFinalization)
                            return artifact
                except Exception as e:
                    log.info('_finalizeBook.finalize: exception[%s]' % str(e))
                    log.info(traceback.format_exc())

                    try:
                        if artifactDict:
                            artifactID = artifactDict.get('artifactID')
                        else:
                            revision = _getArtifactRevisionByID(session, id=revisionID)
                            artifactID = revision.artifactID
                    except Exception as na:
                        log.info('_finalizeBook.finalize: na error[%s]' % str(na))
                        artifactID = None

                    try:
                        #
                        #  Update message in lock.
                        #
                        if artifactID:
                            bookFinalizationLock = _getBookFinalizationLock(session, artifactID)
                            bookFinalizationLock.message = str(e)
                            session.add(bookFinalizationLock)
                        #
                        #  Update task.
                        #
                        if task:
                            if task.userdata:
                                userData = json.loads(task.userdata)
                            else:
                                userData = []

                            md = {
                                'message': str(e),
                            }
                            if artifactID:
                                md['artifactID'] = artifactID
                            userData.append(md)
                            task.userdata = json.dumps(userData)

                            taskDict = {
                                'id': task.task.get('id'),
                                'artifactKey': task.artifactKey,
                                'userdata': task.userdata,
                            }
                            _updateTask(**taskDict)
                    except Exception as ee:
                        log.info('_finalizeBook.finalize: ee error[%s]' % str(ee))
                log.info('_finalizeBook.finalize: Skip')
                return None

            lessons = child.get('children', None)
            log.debug('_finalizeBook: lessons[%s]' % lessons)
            if not lessons:
                log.debug('_finalizeBook: finalizing chapter bookID[%s]' % bookID)
                artifact = finalize(child, bookID, bookFinalization)
                if artifact:
                    log.debug('_finalizeBook: finalizing chapter artifact.id[%s]' % artifact.id)
                    bookChildren[c]['hasArtifactRevisionID'] = artifact.revisions[0].id
                    log.debug('_finalizeBook: finalizing bookChildren[%s].hasArtifactRevisionID[%s]' % (c, bookChildren[c]['hasArtifactRevisionID']))
                    toCreateNewBookRevision = True
                    invalidateArtifact(artifactCache, artifact, memberID=memberID)
            else:
                chapterRevisionID = child.get('artifactRevisionID', None)
                log.debug('_finalizeBook: chapterRevisionID[%s]' % chapterRevisionID)
                chapterRevision, chapterChildren = _copyChildren(session, chapterRevisionID)
                log.debug('_finalizeBook: len(chapterChildren)[%s]' % len(chapterChildren))

                ccCount = len(lessons)
                log.debug('_finalizeBook: ccCount[%s]' % ccCount)
                if ccCount != len(chapterChildren):
                    raise ex.InvalidArgumentException((_(u'Incorrect chapter children list for (chapterRevisionID)s.' % {'chapterRevisionID':chapterRevisionID})).encode("utf-8"))
                log.debug('_finalizeBook: ccCount[%s]' % ccCount)

                toCreateNewChapterRevision = False
                for l in range(ccCount):
                    log.debug('_finalizeBook: l[%s]' % l)
                    lesson = lessons[l]
                    log.debug('_finalizeBook: lesson[%s]' % lesson)

                    artifact = finalize(lesson, bookID, bookFinalization)
                    if artifact:
                        log.debug('_finalizeBook: finalized lesson artifact.id[%s]' % artifact.id)
                        chapterChildren[l]['hasArtifactRevisionID'] = artifact.revisions[0].id
                        log.debug('_finalizeBook: finalized lesson chapterChildren[%s]' % chapterChildren)
                        toCreateNewChapterRevision = True

                if toCreateNewChapterRevision:
                    log.debug('_finalizeBook: chapterRevision[%s]' % chapterRevision)
                    newChapterRevision = _createNewRevision(session, chapterRevision, chapterChildren)
                    log.debug('_finalizeBook: newChapterRevision[%s]' % newChapterRevision)
                    bookChildren[c]['hasArtifactRevisionID'] = newChapterRevision.id
                    log.debug('_finalizeBook: finalizing bookChildren[%s].hasArtifactRevisionID[%s]' % (c, bookChildren[c]['hasArtifactRevisionID']))
                    toCreateNewBookRevision = True
                    chapter = _getArtifactByID(session, id=chapterRevision.artifactID)
                    invalidateArtifact(artifactCache, chapter, memberID=memberID)

        if toCreateNewBookRevision:
            log.debug('_finalizeBook: bookRevision[%s]' % bookRevision)
            newBookRevision = _createNewRevision(session, bookRevision, bookChildren)
            log.debug('_finalizeBook: newBookRevision[%s]' % newBookRevision)
            book = _getArtifactByID(session, id=bookRevision.artifactID)
            invalidateArtifact(artifactCache, book, memberID=memberID)
    except Exception as e:
        log.info('_finalizeBook: exception[%s]' % str(e))
    finally:
        finalizeList = _unlockFinalization(session, memberID, bookID, children)
        return finalizeList

@_transactional()
def unlockFinalization(session, memberID, bookID, children):
    return _unlockFinalization(session, memberID, bookID, children)

def _unlockFinalization(session, memberID, bookID, children):
    log.debug('_unlockFinalization: memberID[%s]' % memberID)
    log.debug('_unlockFinalization: bookID[%s]' % bookID)
    log.debug('_unlockFinalization: children[%s]' % children)
    finalizeList = []
    bookFinalization = _getBookFinalization(session, bookID=bookID)
    log.debug('_unlockFinalization: bookFinalization[%s]' % bookFinalization)
    if not bookFinalization:
        raise Exception((_(u'No finalization entry for %(bookID)s') % {'bookID':bookID}).encode('utf-8'))

    book = _getArtifactByID(session, id=bookID)
    for child in children:

        def unlock(child):
            finalize = child.get('finalize', None)
            if finalize is True:
                revisionID = child.get('artifactRevisionID', None)
                revision = _getArtifactRevisionByID(session, id=revisionID)
                log.debug('_unlockFinalization: artifactID[%s]' % revision.artifactID)
                bookFinalizationLock = _getBookFinalizationLock(session, revision.artifactID)
                log.debug('_unlockFinalization: bookFinalizationLock[%s]' % bookFinalizationLock)
                if not bookFinalizationLock:
                    raise Exception((_(u'No finalization lock for %(revisionID)s') % {'revisionID':revisionID}).encode('utf-8'))

                finalizeInfo = {
                    'artifactID': bookFinalizationLock.artifactID,
                }
                if bookFinalizationLock.message:
                    finalizeInfo.update({ 'message': bookFinalizationLock.message })
                finalizeList.append(finalizeInfo)
                session.delete(bookFinalizationLock)

        lessons = child.get('children', None)
        if not lessons:
            unlock(child)
        else:
            for lesson in lessons:
                unlock(lesson)
    bookFinalizationLock = _getBookFinalizationLock(session, bookID)
    log.debug('_unlockFinalization: bookFinalizationLock[%s]' % bookFinalizationLock)
    log.debug('_unlockFinalization: bookFinalization[%s]' % bookFinalization)
    session.delete(bookFinalizationLock)
    session.delete(bookFinalization)

    #
    #  Log before deleting.
    #
    from flx.model.audit_trail import AuditTrail

    auditTrailDict = {
        'auditType': 'book_finalizing',
        'memberID': memberID,
        'artifactID': book.id,
        'taskID': bookFinalization.taskID,
        'total': bookFinalization.total,
        'completed': bookFinalization.completed,
        'finalizeList': finalizeList,
        'creationTime': datetime.utcnow()
    }
    log.debug('_unlockFinalization: auditTrailDict[%s]' % auditTrailDict)
    try:
        AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
    except Exception, e:
        log.error('unlockFinalization: There was an issue logging the audit trail: %s' % e)
    log.debug('unlockFinalization: %s' % auditTrailDict)
    return finalizeList

@_transactional()
def createConceptMapFeedback(session, **kwargs):
    return _createConceptMapFeedback(session, **kwargs)

def _createConceptMapFeedback(session, **kwargs):
    _checkAttributes(['memberID', 'encodedID', 'suggestion'], **kwargs)
    if not kwargs.get('status', None):
        kwargs['status'] = 'reviewing'
    if not kwargs.get('creationTime', None):
        kwargs['creationTime'] = datetime.now()

    memberID = kwargs.get('memberID', None)
    encodedID = kwargs.get('encodedID', None)
    suggestion = kwargs.get('suggestion', None)
    feedbacks = _getConceptMapFeedbacks(session, memberID=memberID, encodedID=encodedID, suggestion=suggestion)
    if feedbacks and len(feedbacks) > 0:
        return feedbacks[0]

    feedback = model.ConceptMapFeedback(**kwargs)
    log.debug('_createConceptMapFeedback: feedback[%s]' % feedback)
    session.add(feedback)
    return feedback

@_transactional()
def createTeacherStudentRelation(session, studentID, teacherID):
    return _createTeacherStudentRelation(session, studentID, teacherID)

def _createTeacherStudentRelation(session, studentID, teacherID):
    """
        Create a teacher student relation instance.
    """
    data = {
        'studentID': studentID,
        'teacherID': teacherID,
        'creationTime': datetime.now(),
    }
    teacherStudentRelation = model.TeacherStudentRelation(**data)
    session.add(teacherStudentRelation)
    return teacherStudentRelation

@_transactional()
def getTeacherStudentRelations(session, studentID=None, studentIDs=None, teacherID=None, pageNum=1, pageSize=10):
    return _getTeacherStudentRelations(session, studentID=studentID, studentIDs=studentIDs, teacherID=teacherID, pageNum=pageNum, pageSize=pageSize)

def _getTeacherStudentRelations(session, studentID=None, studentIDs=None, teacherID=None, pageNum=1, pageSize=10):
    query = session.query(model.TeacherStudentRelation)
    if studentID:
        query = query.filter_by(studentID=studentID)
    else:
        if studentIDs:
            query = query.filter(model.TeacherStudentRelation.studentID.in_(studentIDs))

        query = query.order_by(model.TeacherStudentRelation.studentID.desc())
    if teacherID:
        query = query.filter_by(teacherID=teacherID)
    else:
        query = query.order_by(model.TeacherStudentRelation.teacherID)
    page = p.Page(query, pageNum, pageSize, tableName='TeacherStudentRelations')
    return page

@_transactional()
def getMyStudents(session, teacherID, onlyActiveGroups=True, pageNum=1, pageSize=10):
    return _getTeacherStudentRelations(session, teacherID=teacherID, onlyActiveGroups=onlyActiveGroups, pageNum=pageNum, pageSize=pageSize)

def _getMyStudents(session, teacherID, onlyActiveGroups=True, pageNum=1, pageSize=10):
    query = session.query(model.Member)
    query = query.join(model.GroupHasMembers, and_(model.GroupHasMembers.memberID == model.Member.id, model.GroupHasMembers.memberID != teacherID))
    if onlyActiveGroups:
        query = query.join(model.Group, and_(model.Group.id == model.GroupHasMembers.groupID, model.Group.creatorID == teacherID, model.Group.isActive == 1, model.Group.isVisible == 1))
    else:
        query = query.join(model.Group, and_(model.Group.id == model.GroupHasMembers.groupID, model.Group.creatorID == teacherID, model.Group.isVisible == 1))
    page = p.Page(query, pageNum, pageSize, tableName='Members')
    return page

@_transactional()
def createArchivedMemberStudyTrackItemStatus(session, **kwargs):
    return _createArchivedMemberStudyTrackItemStatus(session, **kwargs)

def _createArchivedMemberStudyTrackItemStatus(session, assignment):
    """
        Create a new ArchivedMemberStudyTrackItemStatus.
    """
    nodeStatusList = _getMemberStudyTrackStatus(session,
                                                memberIDs=[],
                                                assignmentID=assignment.assignmentID)

    artifactAndAssignmentData = dict()
    assignmentKeys = ['assignmentID','groupID','assignmentType','origin','due']

    objList = list()
    objIsDict = False
    if hasattr(assignment, "__getitem__"):
        objIsDict = True

    for key in assignmentKeys:
        if objIsDict:
            artifactAndAssignmentData[key] = assignment[key]
        else:
            artifactAndAssignmentData[key] = getattr(assignment, key)

    if hasattr(assignment,"artifact"):
        artifactAndAssignmentData["artifactID"] = assignment.artifact.id
        artifactAndAssignmentData["artifactTypeID"] = assignment.artifact.artifactTypeID
        artifactAndAssignmentData["assignmentName"] = assignment.artifact.name
        artifactAndAssignmentData["assignmentDescription"] = assignment.artifact.description
        artifactAndAssignmentData["assignmentCreatorID"] = assignment.artifact.creatorID

    for node in nodeStatusList:
        dataItem = dict()
        dataItem["status"] = node.status
        dataItem["studyTrackItemID"] = node.studyTrackItemID
        dataItem["memberID"] = node.memberID
        dataItem["lastAccess"] = node.lastAccess
        dataItem["score"] = node.score
        dataItem.update(artifactAndAssignmentData)
        obj = model.ArchivedMemberStudyTrackItemStatus(**dataItem)
        session.add(obj)
        objList.append(obj)
    session.flush()
    return objList
