import logging
import json, base64
import traceback
import re, os
from datetime import datetime
# import httplib

from pylons import config, request, tmpl_context as c
from pylons.decorators.cache import beaker_cache
#from beaker.cache import cache_region
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache, LabelCache
import flx.controllers.eohelper as eohelper
from flx.model import model
from flx.model import exceptions as ex
from flx.model import api, utils
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.lib.search import solrclient
import flx.controllers.user as u
#from flx.controllers.celerytasks import mathcache
from flx.controllers.mongo.base import MongoCacheBaseController

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

bookTypes = ['book', 'tebook', 'workbook', 'labkit', 'quizbook', 'testbook']
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

class ArtifactController(MongoCacheBaseController):
    """
        Artifact get related APIs.
    """

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id', 'type', 'revisionID'])
    def getInfo(self, id, type=None, revisionID=0):
        """
            Retrieves the meta data of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        includeExtendedArtifacts = str(request.params.get('includeExtendedArtifacts')).lower() == 'true'
        options = []
        if includeExtendedArtifacts:
            options.append('includeExtendedArtifacts')
        return g.ac.getInfo(result, id, type, revisionID, options=options)

    @d.jsonify()
    @d.trace(log, ['id', 'type'])
    def getMinimal(self, id, type=None):
        """
            Retrieves the meta data of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        includeExtendedArtifacts = str(request.params.get('includeExtendedArtifacts')).lower() == 'true'
        options = []
        if includeExtendedArtifacts:
            options.append('includeExtendedArtifacts')
        return g.ac.getInfo(result, id, type, options=options, minimalOnly=True)

    def _getArtifactRevisionsForEncodedID(self, eid):
        if not eid:
            raise Exception((_(u'No encoded id specified.')).encode("utf-8"))

        bt = api.getBrowseTermByEncodedID(encodedID=eid)
        if not bt:
            raise Exception((_(u"No such encoded id: %(eid)s")  % {"eid":eid}).encode("utf-8"))

        artifactIDs = []
        artifacts = api.getArtifactsAndBrowseTerms(browseTermList=[bt.id])
        if artifacts:
            for artifact in artifacts:
                artifactIDs.append(artifact.id)

        artifactRevisions = api.getArtifactRevisionsFromArtifacts(artifactIDList=artifactIDs)
        return artifactRevisions

    @d.jsonify()
    @d.trace(log, ['id', 'type', 'revisionID', 'resourceTypes'])
    def getResourcesInfo(self, id, type='artifact', revisionID=0, resourceTypes='resource'):
        """
            Retrieves metadata for all resources associated with this artifact.
            If type is specified, the loopup will be limited to only the given 
            artifact type. If revision is not specified, the latest revision will
            be selected. If resourceType is specified, only resources of that type
            will be returned.
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ## Allow EID based queries too - if an EID is given, find all artifacts for 
            ## that eid and get all their resources
            attachmentsOnly = str(request.params.get('attachmentsOnly')).lower() == 'true'
            member = u.getCurrentUser(request)
            eid = None
            try:
                id = int(id)
            except ValueError:
                eid = str(id).upper()

            rInfos = self.__getResourcesInfo(eid, id, type, revisionID, resourceTypes, attachmentsOnly, member)
            result['response']['resources'] = rInfos
            result['response']['total'] = len(rInfos)
            return result
        except Exception, e:
            log.error('get artifact resources Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            log.error(traceback.format_exc())
            return ErrorCodes().asDict(c.errorCode, str(e))

    #@d.ck12_cache_region('daily')
    def __getResourcesInfo(self, eid, id, type, revisionID, resourceTypes, attachmentsOnly, member):
        artifactRevisions = []
        if eid:
            artifactRevisions = self._getArtifactRevisionsForEncodedID(eid=eid)
        else:
            if not type or type == 'artifact':
                artifactType = None
            else:
                artifactType = type
            #artifact = g.ac.getArtifact(id=id, type=artifactType)
            revisionID = int(revisionID)
            #artifactRevision = g.ac.getRevision(artifact, revisionID)
            artifactRevision = api.getArtifactRevisionByArtifactID(artifactID=id, artifactRevisionID=revisionID)
            if artifactType and artifactRevision.artifact.type.name != artifactType:
                raise Exception("Incorrect artifact type: [%s]" % artifactType)
            artifactRevisions = [ artifactRevision ]

        rInfos = g.ac.getResourcesInfo(resourceTypes, artifactRevisions, attachmentsOnly, member)
        return rInfos

    @d.jsonify()
    @d.setPage(request, ['id', 'type'])
    @d.filterable(request, ['id', 'type', 'pageNum', 'pageSize'])
    @d.trace(log, ['id', 'type', 'pageNum', 'pageSize', 'fq'])
    def getRelatedArtifacts(self, fq, pageNum, pageSize, id, type='artifact'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize
            log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
            artifact = g.ac.getArtifact(id, None)
            if not artifact:
                raise Exception((_(u'No artifact of id %(id)s')  % {"id":id}).encode("utf-8"))
            id = artifact.id
            log.info("BT: %s" % artifact.browseTerms)
            domainTerms = {}
            for term in artifact.browseTerms:
                if term.type.name == 'domain':
                    domainTerms[term.name] = term
            results = None
            if domainTerms:
                results = api.getRelatedArtifacts(terms=domainTerms.keys(), typeName=type, idsOnly=True, excludeIDs=[id], start=start, rows=pageSize, memberID=memberID, fq=fq)
                #if results['numFound'] == 0 and domainTerms:
                #    log.info("Got 0 results - need to look for artifacts for post-requisite")
                #    ## Get the artifacts for next browse term
                #    postDomainIDs = api.getPostDomainIDs(domainID=domainTerms.values()[0].id)
                #    for postId in postDomainIDs:
                #        term = api.getBrowseTermByID(id=postId)
                #        domainTerms[term.name] = term
                #    results = api.getRelatedArtifacts(terms=domainTerms.keys(), typeName=type, excludeIDs=[id], start=start, rows=pageSize, memberID=memberID, fq=fq)
            if not results:
                results = { 'numFound': 0, 'artifactList': [], 'facets': {} }
            else:
                ids = results['artifactList']
                artifactList = []
                for idDict in ids:
                    id = idDict['id']
                    artifactDict, artifact = ArtifactCache().load(id)
                    artifactList.append(artifactDict)
                results['artifactList'] = artifactList
                log.info('getRelatedArtifacts: results[%s]' % results)


            artifactDict = {
                        'total': results['numFound'], 
                        'limit': len(results['artifactList']),
                        'offset': start,
                        'result': results['artifactList'],
                        'filters': results['facets'],
                       }
            
            result['response'] = artifactDict
            return result
        except Exception as e:
            log.error('get related artifacts Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getArtifactNeighbors(self, artifact, type, level, maxLevels=3, memberID=None):
        log.info("This level: %d, maxLevels: %d" % (level, maxLevels))
        artifactType = api.getArtifactTypeByName(typeName=type)
        if not artifactType:
            artifactType = artifact.type
        fg = artifact.getFoundationGrid()
        preSet = {}
        postSet = {}
        for termId, term in fg:
            pre, post = api.getDomainNeighborDicts(domainID=termId)
            for preterm in pre:
                preSet[preterm['id']] = preterm['term']
            for postterm in post:
                postSet[postterm['id']] = postterm['term']

        log.info("Pre set: %s" % preSet)
        log.info("Post set: %s" % postSet)
        
        preArtifactIds = api.getArtifactIDsByBrowseTerm(termIDs=preSet.keys(), artifactTypeID=artifactType.id)
        postArtifactIds = api.getArtifactIDsByBrowseTerm(termIDs=postSet.keys(), artifactTypeID=artifactType.id)
        
        artifactIds = []
        artifactIds.extend(preArtifactIds)
        artifactIds.extend(postArtifactIds)
        artifacts = api.getArtifactsDictByIDs(idList=artifactIds, memberID=memberID)

        artifactSet = {}
        for a in artifacts:
            id = a['id']
            artifactSet[id] = a
            if level < maxLevels:
                artifact = api.getArtifactByID(id=id)
                pre, post = self._getArtifactNeighbors(artifact, artifactType.name, level+1, maxLevels=maxLevels, memberID=memberID)
                artifactSet[id]['prereqs'] = pre
                artifactSet[id]['postreqs'] = post

        preArtifactList = []
        postArtifactList = []
        for id in preArtifactIds:
            preArtifactList.append(artifactSet[id])
        for id in postArtifactIds:
            postArtifactList.append(artifactSet[id])

        return preArtifactList, postArtifactList

    @d.jsonify()
    @d.trace(log, ['id', 'type', 'levels'])
    def getArtifactMap(self, id, type='concept', levels=1):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            levels = int(levels)
            if levels > 3:
                raise Exception((_(u'Levels greater than 3 are not supported!')).encode("utf-8"))
            artifact = g.ac.getArtifact(id, None)
            if not artifact:
                raise Exception((_(u'No artifact by id: %(id)s')  % {"id":id}).encode("utf-8"))
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            pre, post = self._getArtifactNeighbors(artifact,
                                                   type,
                                                   1,
                                                   maxLevels=levels,
                                                   memberID=memberID)

            result['response']['prereqs'] = pre
            result['response']['postreqs'] = post
            return result
        except Exception as e:
            log.error('get artifact map Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id', 'type'])
    def getParents(self, id, type=None):
        """
            Returns the parent(s) of the artifact identified by id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            artifact = g.ac.getArtifact(id, type)
            if artifact is None:
                if type is None:
                    type = 'artifact'
                raise Exception((_(u'No %(type)s found for %(id)s')  % {"type":type,"id": id}).encode("utf-8"))

            parents = api.getArtifactParents(artifactID=artifact.id)
            artifactDictList = []
            for parent in parents:
                artifactDict, ar = ArtifactCache().load(id=parent['parentID'], memberID=memberID)
                artifactDictList.append(artifactDict)
            result['response']['result'] = artifactDictList
            return result
        except Exception as e:
            log.error('get artifact parents Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['type'])
    @d.trace(log, ['type', 'pageNum', 'pageSize'])
    def getLatest(self, pageNum, pageSize, type=None):
        """
            Returns the most recently updated Artifacts.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            artifacts = api.getLatestArtifacts(typeName=type,
                                               pageNum=pageNum,
                                               pageSize=pageSize)
            artifactDictList = []
            for artifact in artifacts:
                artifactDict, ar = ArtifactCache().load(id=artifact.id, artifact=artifact, memberID=memberID)
                artifactDictList.append(artifactDict)
            result['response']['total'] = artifacts.getTotal()
            result['response']['limit'] = len(artifactDictList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = artifactDictList
            return result
        except Exception as e:
            log.error('get latest artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['type'])
    @d.trace(log, ['type', 'pageNum', 'pageSize'])
    def getPopular(self, pageNum, pageSize, type=None):
        """
            Returns the most recently updated Artifacts.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            raise Exception('NotImplemented')
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            artifacts = api.getPopularArtifacts(typeName=type,
                                                pageNum=pageNum,
                                                pageSize=pageSize)
            artifactDictList = []
            for artifact in artifacts:
                artifactDict, ar = ArtifactCache().load(id=artifact.id, artifact=artifact, memberID=memberID)
                artifactDictList.append(artifactDict)
            result['response']['total'] = artifacts.getTotal()
            result['response']['limit'] = len(artifactDictList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = artifactDictList
            return result
        except Exception as e:
            log.error('get popular artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['id'])
    @d.trace(log, ['id', 'pageNum', 'pageSize'])
    def getDerivedArtifactInfo(self, id, pageNum, pageSize):
        """
            Returns the list of artifacts derived from the given
            artifact id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifacts = api.getDerivedArtifacts(id=id,
                                                pageNum=pageNum,
                                                pageSize=pageSize)
            artifactDictList = []
            for artifact in artifacts:
                artifactDictList.append(artifact.asDict())
            result['response']['result'] = artifactDictList
            return result
        except Exception as e:
            log.error('get derived artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id', 'type', 'revisionID'])
    def getDetail(self, id, type=None, revisionID=0):
        """
            Retrieves the contents of artifact identified by id. If type is
            specified, the look up will be limited to only the given artifact
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.

            Delegated to g.ac.getDetail
        """
        waitForTask = request.params.get('waitForTask', False)
        if str(waitForTask).lower() == 'true':
            waitForTask = True
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        includeChildContent = request.params.get('includeChildContent', 'false')
        includeExtendedArtifacts = str(request.params.get('includeExtendedArtifacts')).lower() == 'true'
        includeRelatedArtifacts = str(request.params.get('includeRelatedArtifacts')).lower() == 'true'
        forUpdate = str(request.params.get('forUpdate')).lower() == 'true'
        level = request.params.get('level')
        options = []
        if str(includeChildContent).lower() == 'true':
            options.append('includeChildContent')
        if includeExtendedArtifacts:
            options.append('includeExtendedArtifacts')
        if includeRelatedArtifacts:
            options.append('includeRelatedArtifacts')
        if level:
            options.append('level=%s' % level.lower())
        return g.ac.getDetail(result, id, type, revisionID, options, waitForTask=waitForTask, forUpdate=forUpdate)

    @d.jsonify()
    @d.trace(log, ['id', 'type', 'revisionID'])
    def getMathjaxDetail(self, id, type=None, revisionID=0):
        """
            Exactly like getDetail, but with ck12-math replaced with mathjax
                        
            Delegated to _getDetail
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        return g.ac.getDetail(result, id, type, revisionID, ['mathjax'])

    def _getRevisionDetail(self, id, forUpdate=False):
        """
            Retrieves the contents of artifact revision identified by id as the
            unique revision identifier.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            tiny = str(request.params.get('tiny', 'true')).lower() == 'true'
            artifactRevision = api.getArtifactRevisionByID(id=id)
            if artifactRevision is None:
                raise Exception((_(u'No revision id %(id)s')  % {"id":id}).encode("utf-8"))
            artifact = artifactRevision.artifact
            artifactDict, ar = ArtifactCache().load(id=artifact.id, revisionID=id, artifact=artifact, forUpdate=forUpdate, tiny=tiny)
            result['response'][artifact.type.name] = artifactDict
            return result
        except Exception, e:
            log.error('get revision detail Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        finally:
            try:
                g.ac.updateStatistics(artifact.id, artifactRevision.id)
                """
                #
                #  Reindex.
                #
                taskId = h.reindexArtifacts([id])
                log.info("artifact getDetail[%s] Task id: %s" % (id, taskId))
                """
            except Exception, e:
                log.error('get revision detail unable to update statistics[%s]' % str(e))
                pass

    @d.jsonify()
    @d.trace(log, ['id'])
    def getRevisionDetail(self, id):
        """
            Retrieves the contents of artifact revision identified by id as the
            unique revision identifier.
        """
        forUpdate = str(request.params.get('forUpdate')).lower() == 'true'
        return self._getRevisionDetail(id,forUpdate)

    @d.jsonify()
    @d.trace(log, ['id'])
    def getRevisionMathjaxDetail(self, id):
        """
            Exactly like getRevisionDetail, but with ck12-math replaced with
            mathJax.

            No longer supported.
        """
        c.errorCode = ErrorCodes.DEPRECATED_API
        return ErrorCodes().asDict(c.errorCode, 'No longer supported.')

    @d.jsonify()
    @d.sortable(request, ['ids'])
    @d.filterable(request, ['sort', 'ids'], noformat=True)    
    @d.setPage(request, ['sort', 'ids', 'fq', 'ids'])
    @d.trace(log, ['ids', 'fq', 'sort', 'pageNum', 'pageSize'])
    def getArtifactListInfo(self, fq, ids=None, sort=None, pageNum=0, pageSize=0):
        """
            Retrieves the metadata of artifacts identified by the
            list of artifact identifiers, separated by commas.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if ids is not None:
                idList = ids.split(',')
                artifacts = api.getArtifactsByIDs(idList=idList,
                                                  pageNum=pageNum,
                                                  pageSize=pageSize)
            else:
                filterDict = {}
                if fq:
                    for fld, term in fq:
                        filterDict[fld] = term

                search = request.params.get('search')
                if search is None:
                    searchDict = None
                    searchAll = request.params.get('searchAll')
                else:
                    searchDict = {}
                    if len(search) > 0:
                        name, value = search.split(',')
                        searchDict[name] = value
                    searchAll = None

                artifacts = api.getArtifacts(sorting=sort,
                                             filterDict=filterDict,
                                             searchDict=searchDict,
                                             searchAll=searchAll,
                                             pageNum=pageNum,
                                             pageSize=pageSize)

            artifactDictList = []
            if len(artifacts) > 0:
                for artifact in artifacts:
                    artifactDict, ar = ArtifactCache().load(id=artifact.id, artifact=artifact)
                    artifactDictList.append(artifactDict)


            result['response']['total'] = artifacts.getTotal()
            result['response']['limit'] = len(artifacts)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['artifacts'] = artifactDictList
            return result
        except Exception, e:
            log.error('get artifacts Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    @d.filterable(request, ['member', 'fq', 'sort'], noformat=True)
    @d.setPage(request, ['member', 'fq', 'sort'])
    @d.trace(log, ['member', 'fq', 'pageNum', 'pageSize', 'sort'])
    def getUGCArtifactCountInfo(self, member, fq, ids=None, sort=None, pageNum=0, pageSize=0):
        """
            Retrieves the count of artifacts identified by the
            artifact type for specified interval.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
            filterDict = {}
            if fq:
                for fld, term in fq:
                    filterDict[fld] = term

            if not filterDict.get('fromDate') or not filterDict.get('toDate'):
                raise ex.InvalidArgumentException((_(u'Required parameter, fromDate or toDate, is missing')).encode("utf-8"))
            
            filterDict['fromDate'] =  datetime.strptime(filterDict.get('fromDate') + " 00:00:00" , '%d-%m-%Y %H:%M:%S')
            filterDict['toDate'] =  datetime.strptime(filterDict.get('toDate') + " 23:59:59" , '%d-%m-%Y %H:%M:%S')

            ugcCounts = api.getUGCArtifactCounts(sorting=sort,
                                         filterDict=filterDict,
                                         excludeCreatorIDs=[1, 3, 5111, 98045],
                                         excludeArtifactTypes=['concept', 'assignment', 'study-track'],
                                         pageNum=pageNum,
                                         pageSize=pageSize)

            artifactDictList = []
            if len(ugcCounts) > 0:
                for artifact in ugcCounts:
                    artifactDict = {}
                    artifactDict['count'] = artifact[0]
                    artifactDict['artifactType'] = artifact[1]
                    artifactDict['artifactTypeName'] = artifact[2]
                    artifactDict['creatorID'] = artifact[3]
                    artifactDict['givenName'] = artifact[4]
                    artifactDict['surname'] = artifact[5]
                    artifactDictList.append(artifactDict)

            result['response']['artifacts'] = artifactDictList
            return result
        except Exception, e:
            log.error('get artifacts Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['ids'])
    def getRevisionListInfo(self, ids):
        """
            Retrieves the metadata of artifacts identified by the
            list of artifact revision identifiers, separated by commas.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            forUpdate = str(request.params.get('forUpdate', 'false')).lower() == 'true'
            
            returnDraftIfDraftExists = request.params.get('returnDraftIfDraftExists')
            if returnDraftIfDraftExists in ('TRUE', 'True', 'true', 'YES','Yes', 'yes'):
                returnDraftIfDraftExists = True
            else:
                returnDraftIfDraftExists= False

            memberID = None
            try:
                member = u.getCurrentUser(request, anonymousOkay=False)
                memberID = member.id
            except Exception as e:
                pass

            revisionIDList = ids.split(',')
            artifactDictList = []

            for revisionID in revisionIDList:
                draftResult = None
                if returnDraftIfDraftExists and memberID and revisionID:
                    draftResult = api.getMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=revisionID)

                from flx.lib import artifact_utils as au

                artifactDict = au.getArtifact(None, revisionID, None, memberID, None, None, draftResult=draftResult, forUpdate=forUpdate)
                artifactDictList.append(artifactDict)

            result['response']['artifacts'] = artifactDictList
            return result
        except Exception, e:
            log.error('get revisions Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['id', 'order'])
    @d.trace(log, ['id', 'order', 'pageNum', 'pageSize'])
    def getRevisionListInfoOfArtifact(self, id, order='desc', pageNum=0, pageSize=0):
        """
            Retrieves the metadata of artifact revisions identified
            by the artifact identifier.

            The sorted order should be one of the followings:
                desc -  descending (latest revision first) [default]
                asc  -  ascending (earliest revision first)
            Any other value will return in the order determined
            by the database.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactRevisions = api.getRevisionsOfArtifact(id=id,
                                                           order=order,
                                                           pageNum=pageNum,
                                                           pageSize=pageSize)
            revisionDictList = []
            for revision in artifactRevisions:
                revisionDictList.append(revision.asDict())
            result['response']['total'] = artifactRevisions.getTotal()
            result['response']['limit'] = len(artifactRevisions)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['revisions'] = revisionDictList
            return result
        except Exception, e:
            log.error('get revisions Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Get my lib APIs.
    #
    @d.jsonify()
    @d.checkAuth(request, False, False, ['types'])
    @d.setPage(request, ['types', 'member'])
    @d.sortable(request, ['types', 'member', 'pageNum', 'pageSize'])
    @d.trace(log, ['types', 'member', 'pageNum', 'pageSize', 'sort'])
    def getMyArtifactInfo(self, pageNum, pageSize, member, sort, types=None):
        """
            Retrieves all the artifacts that belong to the logged in member.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
            Supports one or multiple artifact types as a comma-separated list.
            If 'artifact' is one of the artifact types, all types of artifacts
            will be returned
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            memberID = member.id
            sortOn = self.getSortOrder(sort, 'Artifacts')
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'artifact' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None

            artifacts = api.getArtifactsByOwner(owner=member,
                                                typeName=typeNames,
                                                pageNum=pageNum,
                                                pageSize=pageSize,
                                                sort=sortOn)
            artifactDictList = []
            for artifact in artifacts:
                artifactDict, ar = ArtifactCache().load(id=artifact.id, artifact=artifact, memberID=memberID)
                artifactDictList.append(artifactDict)
            result['response']['artifacts'] = artifactDictList
            #for item in artifactDictList:
            #    typeName = item['artifactType']
            #    if not result['response'].has_key(typeName):
            #        result['response'][typeName] = []
            #    result['response'][typeName].append(item)
            result['response']['total'] = artifacts.total
            result['response']['limit'] = len(artifacts)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['searchTerm', 'types'])
    @d.sortable(request, ['searchTerm', 'types', 'member' ])
    @d.filterable(request, ['searchTerm', 'types', 'member', 'sort'])
    @d.setPage(request, ['searchTerm', 'types', 'member', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def searchMyArtifacts(self, member, fq, pageNum, pageSize, types, searchTerm=None, sort=None):
        """
            Retrieves all the artifacts that belong to the logged in member.
            Pagination is supported for this API. The pageNum is 1-origin.
            If pageSize is 0, then the entire collection will be returned.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            start = (pageNum-1) * pageSize
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower == 'true'
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
            hits = api.searchArtifacts(domain=None, term=searchTerm, typeNames=typeNames, fq=fq, start=start, rows=pageSize, 
                    sort=sort, memberID=member.id, searchAll=False,
                    extendedArtifacts=extendedArtifacts, idsOnly=True)
            artifacts = []
            for aid in hits['artifactList']:
                aDict, a = ArtifactCache().load(aid['id'], infoOnly=True)
                artifacts.append(aDict)
            artifactDict = {
                            'total': hits['numFound'], 
                            'limit': len(hits['artifactList']),
                            'offset': start,
                            'result': artifacts,
                            'filters': hits['facets'],
                            'suggestions': hits['suggestions'],
                           }
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['Artifacts'] = artifactDict
            return result
        except Exception, e:
            log.error('mylib Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Handle related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id', 'handle'])
    def getArtifactHandles(self, id=None, handle=None, typeName=None, creatorID=None):
        """
            Returns the previously used handles for the given artifact
            identified by id.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            creatorID = request.params.get('ownerID')
            if creatorID:
                creatorID = long(creatorID)
            typeName = request.params.get('typeName')
            artifactTypeDict = g.getArtifactTypes()
            typeID = artifactTypeDict.get(typeName)
            
            handle = model.title2Handle(handle)
            handles = api.getArtifactHandles(id=id, handle=handle, typeID=typeID, creatorID=creatorID)
            handleList = []
            for handle in handles:
                handleList.append(handle.asDict())
            result['response']['handles'] = handleList
            return result
        except Exception, e:
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, True, ['type', 'handle'])
    @d.trace(log, ['member', 'type', 'handle'])
    def checkArtifactHandle(self, member, type, handle):
        """
            Check if the given handle exists in the user space. If a
            qualified artifact is found, it will return the id of that
            artifact.

            If type = 'artifact', then the id of all qualified artifacts
            will be returned.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if type == 'artifact':
                typeID = None
            else:
                artifactTypeDict = g.getArtifactTypes()
                typeID = artifactTypeDict.get(type, None)
            handle = model.title2Handle(handle)
            handles = api.checkArtifactHandle(creatorID=member.id, typeID=typeID, handle=handle)
            handleList = []
            for handle in handles:
                handleList.append(handle.asDict())
            result['response']['artifacts'] = handleList
            return result
        except Exception, e:
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Search related APIs.
    #
    class wikiItem(object):

        def __init__(self, url, title, timestamp):
            self.url = url
            self.title = title
            self.timestamp = timestamp

    @d.jsonify()
    @d.setPage(request, ['searchTerm', 'domain'])
    @d.trace(log, ['searchTerm', 'domain', 'pageNum', 'pageSize'])
    def searchWikipedia(self, pageNum, pageSize, searchTerm, domain=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            offset = (pageNum-1) * pageSize
            limit = pageSize
            wikiDict = self._searchWikipedia(domain, searchTerm, offset, limit)
            result['response']['Wikipedia'] = wikiDict
            return result
        except Exception, e:
            log.error("Error searching wikipedia: %s" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _searchWikipedia(self, domain, searchTerm, offset, limit):
        if domain is not None and domain != '':
            searchTerm = '%s %s' % (domain, searchTerm)

        import urllib
        import urllib2

        if limit <= 0:
            limit = 10
        params = urllib.urlencode({'action':'query',
                                   'list':'search',
                                   'srwhat':'text',
                                   'format':'json',
                                   'srsearch':searchTerm,
                                   'srlimit':limit,
                                   'sroffset':offset})
        host = 'https://en.wikipedia.org'
        url = '%s/w/api.php' % host
        request = urllib2.Request(url, params)
        furl = urllib2.urlopen(request)
        response = furl.read()
        j = json.loads(response)
        total = int(j['query']['searchinfo']['totalhits'])
        wikiItems = j['query']['search']
        wikiList = []
        for item in wikiItems:
            title = item['title']
            url = '%s/w/index.php/%s' % (host, title.replace(' ', '_'))
            timestamp = datetime.strptime(item['timestamp'],'%Y-%m-%dT%H:%M:%SZ')
            dict = {
                    'url': url,
                    'title': title,
                    'timestamp': str(timestamp),
                   }
            wikiList.append(dict)
        return { 'total': total,
                 'offset': offset,
                 'limit': limit,
                 'result': wikiList,
               }
        
    @d.jsonify()
    @d.trace(log, ['url'])
    def validateBookmarkURL(self, url=None):
        """
            Validate that provided artifact url is valid or not.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not url:
                url = request.params.get('url')
                if not url:
                    raise Exception((_(u'Bookmark URL is not provided')).encode("utf-8"))
            log.info("URL: %s" % url)
            url_info_data = h.get_bookmarkURL_status(url)
            log.info("url_info_data: %s" % url_info_data)
            result['response']['url_info'] = url_info_data
            return result
        except Exception as e:
            log.error('validateBookmarkURL Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
    
    @d.jsonify()
    @d.sortable(request, ['searchTerm', 'domain'])
    @d.filterable(request, ['searchTerm', 'domain', 'sort'])
    @d.setPage(request, ['searchTerm', 'domain', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'domain', 'sort', 'fq', 'pageNum', 'pageSize'])
    def searchDomain(self, pageNum, pageSize, fq, searchTerm, domain=None, sort=None):
        """
            Searches for artifacts that match the given searchTerm and an
            optional domain.
        """
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower == 'true'
            hits = api.searchArtifacts(domain=domain, term=searchTerm, fq=fq, start=start, rows=pageSize, sort=sort, memberID=memberID,
                    extendedArtifacts=extendedArtifacts, idsOnly=True)
            artifacts = []
            for aid in hits['artifactList']:
                aDict, a = ArtifactCache().load(aid['id'], infoOnly=True)
                artifacts.append(aDict)
            artifactDict = {
                            'total': hits['numFound'], 
                            'limit': len(hits['artifactList']),
                            'offset': start,
                            'result': artifacts,
                            'filters': hits['facets'],
                            'suggestions': hits['suggestions'],
                           }
            ## Do not do automatic wikipedia search
            #wikiDict = self._searchWikipedia(domain, searchTerm, 0, 10)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['Artifacts'] = artifactDict
            #result['response']['Wikipedia'] = wikiDict
            return result
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['searchTerm', 'types', 'rtype' ])
    @d.filterable(request, ['searchTerm', 'types', 'rtype', 'sort'])
    @d.setPage(request, ['searchTerm', 'types', 'rtype', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'rtype', 'sort', 'pageNum', 'pageSize', 'fq'])
    def searchArtifacts(self, fq, pageNum, pageSize, searchTerm, rtype=None, types=None, sort=None):
        """
            Searches for any types of artifacts that match the given
            searchTerm.
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        try:
            infoOnly = True
            minimalOnly = False
            if not rtype:
                rtype = 'info'
            if rtype == 'minimal':
                minimalOnly = True
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
            log.info("FQ: %s" % fq)
            log.info("Type names in searchArtifacts: %s" % typeNames)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['total'] = 1
            sort = solrclient.getSortOrder(sort)
            specialSearch = str(request.params.get('specialSearch')).lower() == 'true'
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            relatedArtifacts = str(request.params.get('relatedArtifacts')).lower() == 'true'
            includeEIDs = None
            eids = request.params.get('includeEIDs')
            if eids:
                try:
                    includeEIDs = [ int(x.strip()) for x in eids.split(',') ]
                except:
                    raise Exception((_(u'includeEIDs must be a comma-separated list of integers')).encode("utf-8"))

            if searchTerm == '__all__':
                searchTerm = ''
            result['response']['Artifacts'] = self._searchArtifacts(pageNum, pageSize, searchTerm, typeNames=typeNames, 
                    infoOnly=infoOnly, minimalOnly=minimalOnly,
                    sort=sort, fq=fq, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                    relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs)
            return result
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _searchArtifacts(self, pageNum, pageSize, searchTerm, typeNames=[], 
            infoOnly=True, minimalOnly=False,
            sort=None, fq=[], specialSearch=False, extendedArtifacts=False, 
            relatedArtifacts=False, includeEIDs=None):
        member = u.getCurrentUser(request, anonymousOkay=False)
        memberID = member.id if member is not None else None
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        hits = api.searchArtifacts(domain=None, term=searchTerm, typeNames=typeNames, fq=fq, sort=sort, start=start, rows=pageSize, memberID=memberID, 
                specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, idsOnly=True)
        artifacts = []
        for aid in hits['artifactList']:
            aDict, a = ArtifactCache().load(aid['id'], infoOnly=infoOnly, minimalOnly=minimalOnly)
            artifacts.append(aDict)
        artifactDict = {
                        'total': hits['numFound'],
                        'limit': len(hits['artifactList']),
                        'offset': start,
                        'result': artifacts,
                        'filters': hits['facets'],
                        'suggestions': hits['suggestions'],
                       }
        return artifactDict

    @d.jsonify()
    @d.setPage(request, ['artifactTypes', 'state', 'grade', 'subject', 'searchTerms'])
    @d.trace(log, ['artifactTypes', 'state', 'grade', 'subject', 'searchTerms', 'pageNum', 'pageSize'])
    def searchArtifactsByStandard(self, pageNum, pageSize, artifactTypes=None, state=None, grade=None, subject=None, searchTerms=None):
        """
            Searches for artifacts that match the given combination of state/grade/subject and optionally searchTerms 
            Note: searchTerms are ORed (at least of them should exist)
        """
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            ck12only = str(request.params.get("ck12only")).lower() != "false"
            if ck12only:
                memberID = None

            def getEncodedID(artifactDict):
                if artifactDict.get('encodedID'):
                    return artifactDict['encodedID']
                for domain in artifactDict.get('foundationGrid', []):
                    if len(domain) > 2 and domain[2]:
                        return domain[2]
                return None

            @d.ck12_cache_region('weekly')
            def __searchArtifactsByStandard(pageNum, pageSize, artifactTypes, state, grade, subject, searchTerms, memberID, ck12only):
                start = (pageNum-1) * pageSize
                typeNames = None
                if artifactTypes:
                    typeNames = [ x.strip() for x in artifactTypes.lower().split(',') ]
                subjectsDict = api.getSubjectsDict()
                if not state:
                    state = '*'
                if not grade:
                    grade = '*'
                if not subject:
                    subject = '*'
                otherTerms = []
                if searchTerms:
                    otherTerms = searchTerms.split(self.termSeparator)
                if subject != '*':
                    subject = subject.lower()
                    if subjectsDict.has_key(subject):
                        subjectObj = subjectsDict[subject]
                    else:
                        log.warn("No such subject exists: %s" % subject)
                        term = api.getBrowseTermByEncodedID(encodedID=subject)
                        if term:
                            subject = term.name.lower()
                        else:
                            ## We will find an approximation for this using browse terms
                            term = api.getBrowseTermByName(name=subject)
                            if term:
                                ancestors = api.getBrowseTermAncestors(id=term.id)
                                if ancestors:
                                    for ancestor in ancestors:
                                        if subjectsDict.has_key(ancestor.name.lower()):
                                            subjectObj = subjectsDict[ancestor.name.lower()]
                                            log.info("Replacing subject '%s' with '%s'" % (subject, subjectObj.name))
                                            if subject not in otherTerms:
                                                otherTerms.append(subject)
                                            subject = subjectObj.name.lower()

                hits = api.searchArtifactsByStandard(state=state, grade=grade, subject=subject,
                        otherTerms=otherTerms, artifactTypeNames=typeNames,
                        start=start, rows=pageSize, memberID=memberID, ck12only=ck12only, idsOnly=True)
                artifacts = []
                for aid in hits['artifactList']:
                    aDict, a = ArtifactCache().load(aid['id'], infoOnly=True)
                    artifacts.append(aDict)

                splitAt = 10
                orderList = []
                groupedList = {}
                chapters = {}
                chapterNames = {}
                oldBrowseTermRegex = re.compile(r'(.*) \d+\.\d*$')
                for a in artifacts:
                    encPart = None
                    if a['artifactType'] in ['concept', 'lesson']:
                        encodedID = getEncodedID(a)
                        if not encodedID:
                            continue
                        encPart = encodedID[0:splitAt]
                        if not chapters.has_key(encPart):
                            log.info("Get chapter title for : %s" % encPart)
                            bt = api.getBrowseTermByEncodedID(encodedID=encPart.ljust(11, '0'), returnSupercedingConcept=True)
                            if bt:
                                chapterTitle = oldBrowseTermRegex.sub(r'\1', bt.name)
                            else:
                                chapterTitle = 'Chapter %d' % (len(orderList) + 1)
                            if not chapterNames.has_key(chapterTitle):
                                chapterNames[chapterTitle] = encPart
                            else:
                                encPart = chapterNames[chapterTitle]
                            chapters[encPart] = chapterTitle
                        else:
                            chapterTitle = chapters[encPart]
                    elif a['artifactType'] in ['section']:
                        encodedID = getEncodedID(a)
                        if not encodedID:
                            continue
                        encParts = encodedID.split('.')
                        if len(encParts) > 2:
                            encPart = '.'.join(encParts[:-1])
                            if not chapters.has_key(encPart):
                                log.info("Get chapter title for : %s" % encPart)
                                ch = api.getArtifactByEncodedID(encodedID=encPart)
                                if ch:
                                    chapterTitle = ch.getTitle()
                                else:
                                    chapterTitle = 'Chapter %d' % (len(orderList)+1)
                                if not chapterNames.has_key(chapterTitle):
                                    chapterNames[chapterTitle] = encPart
                                else:
                                    encPart = chapterNames[chapterTitle]
                                chapters[encPart] = chapterTitle
                            else:
                                chapterTitle = chapters[encPart]
                    else:
                        log.info("Book - adding %s" % a['title'])
                        if not groupedList.has_key('books'):
                            groupedList['books'] = { 'artifacts': [] }
                        groupedList['books']['artifacts'].append(a)
                        continue
                    if encPart:
                        if not groupedList.has_key(encPart):
                            groupedList[encPart] = { 'chapterTitle': chapterTitle, 'artifacts': [] }
                            orderList.append(encPart)
                        groupedList[encPart]['artifacts'].append(a)
                            
                if groupedList.has_key('books'):
                    orderList.append('books')
                artifactDict = {
                                'total': hits['numFound'],
                                'limit': len(hits['artifactList']),
                                'offset': start,
                                'result': [ groupedList[x] for x in orderList ],
                            }
                result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                result['response']['total'] = 1
                result['response']['Artifacts'] = artifactDict
                return result

            result = __searchArtifactsByStandard(pageNum, pageSize, artifactTypes, state, grade, subject, searchTerms, memberID, ck12only)
            return result
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Browse related APIs.
    #
    gridSeparator = config.get('grid_separator')
    termSeparator = config.get('term_separator')

    def _browseArtifacts(self, typeName, grids, sort=None, artifactList=None, memberID=None):
        """
            Searches for artifacts that match the given typeName and grids.

            If typeName is None or 'artifact', then any types of artifacts
            will be included.

            The grids are one or more browse terms separated by ','.

            if artifactList is not None, then it will only browse from this
            list.
        """
        #
        #  Each level has its own dictionary.
        #
        gridDict = {}
        grid = grids[0]
        grid = grid.lower()
        #
        #  There may be multiple terms on each level.
        #
        terms = grid.split(self.termSeparator)
        originalArtifactList = artifactList
        for term in terms:
            term = term.lower()
            gridDict[term] = []
            artifactIDList = None
            artifactList = originalArtifactList
            if artifactList is not None:
                #
                #  The artifact list to search from.
                #
                artifactIDList = []
                for artifact in artifactList:
                    artifactIDList.append(str(artifact['id']))
            #
            #  Look up qualified artifacts from the given list.
            #
            if typeName == 'artifact':
                typeName = None
            hits = api.browseArtifacts(term=term,
                                       typeNames=[typeName],
                                       sort=sort,
                                       idList=artifactIDList,
                                       idsOnly=True,
                                       memberID=memberID)
            artifactIDList = hits['artifactList']
            for artifactID in artifactIDList:
                artifactDict, artifact = ArtifactCache().load(artifactID)
                gridDict[term].append(artifactDict)
        #
        #  Process the next level of grids, if any.
        #
        if len(grids) > 1:
            for term in terms:
                gridDict[term] = self._browseArtifacts(typeName, grids[1:], sort=sort, artifactList=gridDict[term], memberID=memberID)
        return gridDict

    @d.jsonify()
    @d.trace(log, ['browseTerm', 'type'])
    @beaker_cache(expire=864000, query_args=False)
    def browseArtifactInfo(self, browseTerm, type='artifact'):
        """
            Browses for artifacts that match the given browseTerm.

            If type is not None and not 'artifact', then only the specified
            type will be included.

            The browseTerm parameter may have more than one term separated
            by '/'.

            Each browse term may also have multiple grids separated by ','.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            sort = None
            if request.GET.has_key('sort') and request.GET['sort']:
                sort = request.GET['sort']
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            grids = browseTerm.split(self.gridSeparator)
            log.info("Getting artifacts for type: %s and grids: %s" % (type, str(grids)))
            ret = self._browseArtifacts(type, grids, sort=sort, memberID=memberID)
            result['response'] = ret
            #log.info("records: %d" % len(ret['physics']))
            return result
        except Exception, e:
            log.error('browse artifactInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['browseTerms', 'type'])
    @d.filterable(request, ['browseTerms', 'type', 'sort'])
    @d.setPage(request, ['browseTerms', 'type', 'fq', 'sort'])
    @d.trace(log, ['browseTerms', 'type', 'fq', 'pageNum', 'pageSize', 'sort'])
    def browseArtifactInfoByTermGridPaginated(self, pageNum, pageSize, fq, browseTerms, type='artifact', sort=None):
        """
            Browses for artifacts that match the given browseTerm.

            If type is not None and not 'artifact', then only the specified
            type will be included.

            The browseTerm parameter may have more than one term separated
            by '/'.

            Each browse term may also have multiple grids separated by ','.

            The lookup is only on browseTerms and only exact matches are considered.
            For inexact matching, use the search APIs.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize

            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)

            grids = browseTerms.split(self.gridSeparator)
            log.info("Getting artifacts for type: %s and grids: %s" % (type, str(grids)))
            cnt = len(grids)-1
            query = ''
            while cnt >= 0:
                if query:
                    query += ' AND '
                terms = grids[cnt].split(self.termSeparator)
                subquery = ''
                for term in terms:
                    if subquery:
                        subquery += ' OR '
                    #subquery += '(' 
                    subquery += solrclient.getSearchQueryForBrowseTerms(term, maxBoost=400, types=['browseTerms'], exactOnly=True, descendents=True)  
                    #subquery += ' OR title:%s' % term.lower()
                    #subquery += ')'
                query += '(' + subquery + ')'
                cnt -= 1

            if type and type != 'artifact':
                if query:
                    query += ' AND '
                query += 'type:"%s"' % type.lower()

            log.info("Query: %s" % query)
            hits = api.browseArtifactsWithQuery(query=query, fq=fq, sort=sort, start=start, rows=pageSize, memberID=memberID)
            result['response'] = {
                    'result': hits['artifactList'], 
                    'total': hits['numFound'], 
                    'limit': len(hits['artifactList']), 
                    'offset': start,
                    'filters': hits['facets'],
                    }
            return result
            #queryDict = self._getQueryDict(grids)
            #log.info("Query dict: %s" % queryDict)

        except Exception, e:
            log.error('browse artifactInfo Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    ## Disabling cache since this API is now cached and available via CDN
    #@d.ck12_cache_region('weekly')
    def __browseArtifactInfoBySubject(self, pageNum, pageSize, fq, browseTerm, typeNames, getAll, ck12only, sort, extendedArtifacts, modifiedAfter, memberID):
        start = (pageNum-1) * pageSize
        sort = solrclient.getSortOrder(sort)
        log.info("Sort order: %s" % sort)
        term = [browseTerm]
        if ',' in browseTerm:
            term  = browseTerm.split(',')
            for i in range(0, len(term)):
                term[i] = term[i].strip()
        notSubjects = []
        ## Replace encoded ids by subject name
        for i in range(0, len(term)):
            bterm = api.getBrowseTermByEncodedID(encodedID=term[i], returnSupercedingConcept=True)
            if bterm:
                term[i] = bterm.name
                if bterm.encodedID in ['MAT', 'SCI'] and not getAll:
                    ## Do not get children
                    children = api.getBrowseTermChildren(id=bterm.id)
                    for child in children:
                        notSubjects.append(child.name)

        if 'other' in term:
            notSubjects = ['MAT', 'SCI', 'mathematics', 'science',
                    'exam preparation', 'history', 'technology', 'engineering',
                    'english', 'writing', 'astronomy', 'economics', ]
            sci = api.getBrowseTermByEncodedID(encodedID='SCI')
            mat = api.getBrowseTermByEncodedID(encodedID='MAT')
            topLevels = [sci, mat]
            for topLevel in topLevels:
                if topLevel:
                    for de in api.getBrowseTermDescendants(id=topLevel.id, levels=1):
                        notSubjects.append(de.name)
            term = None
        log.info("Not subjects: %s" % notSubjects)
        ## Make the query
        hits = api.browseArtifacts(term=term,
                                   typeNames=typeNames,
                                   fq=fq,
                                   sort=sort,
                                   start=start,
                                   rows=pageSize,
                                   memberID=memberID,
                                   browseAll=getAll,
                                   ck12only=ck12only,
                                   termTypes=['subjects'],
                                   idsOnly=True,
                                   excludeSubjects=notSubjects,
                                   includeDescendants=False,
                                   extendedArtifacts=extendedArtifacts, 
                                   modifiedAfter=modifiedAfter)
        artifactIDList = hits['artifactList']
        artifactList = []
        for artifactID in artifactIDList:
            artifactDict, artifact = ArtifactCache().load(artifactID, memberID=memberID, infoOnly=True)
            artifactList.append(artifactDict)
        result = {
                browseTerm: artifactList, 
                'total': hits['numFound'], 
                'limit': len(artifactList), 
                'offset': start,
                'filters': hits['facets'],
                }
        return result

    @d.jsonify()
    @d.sortable(request, ['browseTerm', 'types', 'all'])
    @d.filterable(request, ['browseTerm', 'types', 'all', 'sort'])
    @d.setPage(request, ['browseTerm', 'types', 'all', 'sort', 'fq'])
    @d.trace(log, ['browseTerm', 'types', 'all', 'sort', 'fq', 'pageNum', 'pageSize'])
    def browseArtifactInfoBySubject(self, pageNum, pageSize, fq, browseTerm, types=None, all=None, sort=None):
        """
            Browses for artifacts that match the given browseTerm.

            If type is not None and not 'artifact', then only the specified
            type will be included.
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ck12only = str(request.params.get('ck12only')).lower() == 'true'
            member = None
            if not ck12only:
                member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            getAll = False
            if str(all).lower() == 'true' or str(all).lower() == 'all':
                getAll = True

            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'artifact' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None

            modifiedAfter = request.params.get('modifiedAfter')
            result['response'] = self.__browseArtifactInfoBySubject(pageNum, pageSize, fq, browseTerm, typeNames, getAll, ck12only, sort, extendedArtifacts, modifiedAfter, memberID)
            return result
        except Exception, e:
            log.error('browse artifactInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['browseTerm', 'rtype', 'types'])
    @d.filterable(request, ['browseTerm', 'rtype', 'types', 'sort'])
    @d.setPage(request, ['browseTerm', 'rtype', 'types', 'sort', 'fq'])
    @d.trace(log, ['browseTerm', 'rtype', 'types', 'sort', 'fq', 'pageNum', 'pageSize'])
    def browseArtifactInfoPaginated(self, pageNum, pageSize, fq, browseTerm, rtype=None, types=None, sort=None):
        """
            Browses for artifacts that match the given browseTerm.

            If type is not None and not 'artifact', then only the specified
            type will be included. Multiple types can be specified by separating them with
            a comma.

            a special term __all__ can be used to get all artifacts without matching
            any specific browse terms
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize

            if not sort:
                sort = 'domainPrefix,asc;domainEncoding,asc;iencodedID,asc'
            sort = solrclient.getSortOrder(sort)
            log.info("Sort order: %s" % sort)
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'

            ck12only = str(request.params.get('ck12only')).lower() != 'false'
            termTypes = request.params.get('termTypes')
            if termTypes:
                termTypes = termTypes.split(',')

            if not rtype:
                rtype = 'info'
            if rtype == 'info':
                infoOnly = True
                minimalOnly = False
            else:
                infoOnly = False
                minimalOnly = True
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'artifact' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None

            term = browseTerm
            if ',' in browseTerm:
                term  = browseTerm.split(',')
                for i in range(0, len(term)):
                    term[i] = term[i].strip()
            termAsPrefix = str(request.params.get('termAsPrefix')).lower() == 'true'
            publicOnly = str(request.params.get('publicOnly')).lower() != 'false'
            collectionHandle = request.params.get('collectionHandle')
            collectionCreatorID = None
            isCollectionCanonical = False
            if collectionHandle:
                collectionHandle = collectionHandle.lower()
                isCollectionCanonical = str(request.params.get('canonicalCollection')).lower() == 'true'
                collectionCreatorID = int(request.params.get('collectionCreatorID', '3'))
            ## Make the query
            hits = api.browseArtifacts(term=term,
                                       typeNames=typeNames,
                                       fq=fq,
                                       sort=sort,
                                       idsOnly=True,
                                       start=start,
                                       rows=pageSize,
                                       memberID=memberID,
                                       browseAll=publicOnly,
                                       ck12only=ck12only,
                                       termTypes=termTypes,
                                       extendedArtifacts=extendedArtifacts,
                                       termAsPrefix=termAsPrefix,
                                       collectionHandle=collectionHandle,
                                       collectionCreatorID=collectionCreatorID,
                                       isCollectionCanonical=isCollectionCanonical)
            log.info("Artifacts: %s" % hits['artifactList'])
            artifactList = []
            for id in hits['artifactList']:
                artifactDict, artifact = ArtifactCache().load(id, memberID=memberID, infoOnly=infoOnly, minimalOnly=minimalOnly)
                artifactList.append(artifactDict)
                
            result['response'] = {
                    browseTerm: artifactList, 
                    'total': hits['numFound'], 
                    'limit': len(artifactList), 
                    'offset': start,
                    'filters': hits['facets'],
                    }
            return result
        except Exception, e:
            log.error('browse artifactInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))


    #
    #  Create related APIs.
    #
    def _createArtifact(self, type, member):
        c.metaDict = {
            'type': type,
            'title': '',
            'handle': '',
            'encodedID': '',
            'domainEIDs': '',
            'summary': '',
            'comment': '',
            'contributedBy': '',
            'tags': '',
            'cover image name': '',
            'cover image description': '',
            'cover image path': '',
            'cover image uri': '',
            'xhtml': '',
            'xhtml path': '',
        }
        #
        # Following code will not work now since user can have multiple roles within a group - Nimish
        # TODO: Need to define a new API - memberHasRole(member, group, rolename)
        # 

        #if user.type.name != 'admin':
        #    c.authorID = user.id
        #else:
        #    c.authorID = None
        #    c.memberDict = {}
        #    members = api.getMembers()
        #    for member in members:
        #        c.memberDict[member.login] = str(member.id)
        #    c.memberKeys = sorted(c.memberDict.keys())

        c.childrenDict = None
        c.childDict = {}
        """
        childType = type
        childTypes = []
        if type == 'book':
            childTypes = ['chapter']
        elif type == 'chapter':
            childTypes = ['section', 'lesson']
            c.metaDict['bookTitle'] = ''
        elif type == 'lesson':
            childTypes = ['concept']
        c.typeName = type
        #for childType in childTypes:
        #    children.extend(api.getArtifacts(typeName=childType))
        """
        children = []
        for child in children:
            try:
                name = '[%s] %s' % (child.type.name, child.name) #.decode('utf-8')
            except UnicodeDecodeError, e:
                name = '%s: %s' % (child.id, e)
            c.childDict[name] = str(child.revisions[0].id)
        c.childKeys = sorted(c.childDict.keys())

        c.keys = sorted(c.metaDict.keys())
        c.inputType = {
            'type': 'text',
            'title': 'text',
            'handle': 'text',
            'encodedID': 'text',
            'domainEIDs': 'text',
            'summary': 'textarea',
            'comment': 'text',
            'contributedBy': 'text',
            'tags': 'text',
            'cover image name': 'text',
            'cover image description': 'text',
            'cover image path': 'file',
            'cover image uri': 'text',
            'xhtml': 'textarea',
            'xhtml path': 'file',
            'bookTitle': 'text',
        }
        c.readonly = {
            'type': True,
            'title': False,
            'handle': False,
            'encodedID': False,
            'domainEIDs': False,
            'summary': False,
            'contributedBy': False,
            'tags': False,
            'cover image name': False,
            'cover image description': False,
            'cover image path': False,
            'cover image uri': False,
            'xhtml': False,
            'xhtml path': False,
        }
        c.member = member
        c.prefix = self.prefix
        return render('/flx/artifact/createForm.html')

    @d.checkAuth(request, True, True, ['type'])
    @d.trace(log, ['type', 'member'])
    def createArtifactForm(self, type, member):
        return self._createArtifact(type, member)

    def _isDict(self, aDict):
        return type(aDict) == dict

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createFeaturedArtifact(self,member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.info('createFeaturedArtifact params[%s]' % request.params)
            artifactID = request.params.get('artifactID')
            encodedID = request.params.get('encodedID')
            if artifactID and encodedID:
                artifactHasBrowseTerm = api.associateFeaturedArtifact(artifactID=artifactID,encodedID=encodedID)
                  
                #
                #  Reindex.
                #
                taskId = h.reindexArtifacts([artifactID],member.id)
                log.info("artifact getDetail[%s] Task id: %s" % (artifactID, taskId))
                
                result['response']['artifact'] = {
                                                  'artifactID': artifactHasBrowseTerm.artifactID,
                                                  'browseTermID': artifactHasBrowseTerm.browseTermID
                                                  }
            return result
        except Exception, e:
            log.error('createFeaturedArtifact: Exception[%s]' % e, exc_info=e)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_CREATE_FEATURED_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))
        
    @d.jsonify()
    @d.checkAuth(request, False, False, ['typeName'])
    @d.trace(log, ['member', 'typeName'])
    def createArtifact(self, member, typeName):
        """
            Creates an artifact of the given type.

            The following attributes are expected in HTTP params:

            authors:                The names of authors and their role separated by ':' 
                                    and each entry separated by ';'. (eg: 'John Smith:author;Kate Winslet:contributor')
            title:                  The title of this artifact.
            handle:                 The handle of this artifact. To be used
                                    as part of the permaURL. Defaults to
                                    the encoded title (' ' -> '_').
            encodedID:              The encodedID for artifact.
            licenseName:            The license for the artifact
            summary:                The summary of this artifact.
            resourceRevisionIDs:
                                    The list of resource revision IDs to be assigned. If given, it will forget the existing list.
            message to users:       This brief message will appear on the first page or
				    screen below the title, to explain important facts about the resource or version.
            cover image name:       The title of the cover page image.
            cover image description:The description of the cover page image.
            cover image path:       The path of the cover page image, if
                                    the image is to be uploaded, or
            cover image uri:        The URI of the cover page image, if the
                                    image is from external source.
            xhtml:                  The contents of this artifact in xhtml
                                    format, or
            xhtml path:             The path of the contents of this artifact
                                    in xhtml format, if the contents are stored
                                    in a file.
            reindex:                'True' => reindex; otherwise => no reindex
                                    the Solr index of this artifact.
            cache math:             'True' => cache; otherwise => no cache.
            bookTitle:              For chapter type only. The title of the book this chapter belongs to.
            autoSplitLesson:        If the xhtml should be automatically split into lesson/concept pair 
                                    (true or false) default: false 
            domainEIDs:             Optional list of domain term to be assigned to the artifact
            level:                  Optional level ('basic', 'at grade', 'advanced')
            contributedBy:          Optional contributedBy ('student', 'teacher', 'community')
            tags:                   Optional tags to be associated with the artifact
            internal-tags:          Optional tags to be associated with the artifact which is not accessible to the end user

            ATTACHMENT INFO:        Optionally, a single attachment to be uploaded (for modalities)
            attachmentPath:         File upload for attachment
            attachmentUri:          External url for attachment
            attachmentPathLocation: A local path for attachment file (shared between client and server)
            attachmentEmbedCode:    Embedded code for certain type of attachments
            attachmentThumbnail:    Thumbnail image url for embedded object

        """
        #
        #  In a multi-user environment, a shared resource may try to be
        #  created concurrently. In that case, only one will succeed.
        #  We will try to do it one more time on the failed ones so that
        #  they can use the newly created shared resource.
        #
        try:
            kwargs = {}
            kwargs['cache'] = ArtifactCache()

            artifactTypeDict = g.getArtifactTypes()
            if not artifactTypeDict.has_key(typeName):
                raise Exception((_(u'Invalid type[%(type)s]')  % {"type":typeName}).encode("utf-8"))
                error = "Invalid type, '%s'" % typeName
                log.error('createArtifact: %s' % error)
                c.errorCode = ErrorCodes.UNKNOWN_ARTIFACT_TYPE
                return ErrorCodes().asDict(c.errorCode, error)
            typeID = artifactTypeDict[typeName]
            artifactType = api.getArtifactTypeByID(id=typeID)

            kwargs['nonImpersonatedMemberID'] = None
            if member:
                kwargs['nonImpersonatedMemberID'] = member.id
            member = u.getImpersonatedMember(member)

            kwargs['creator'] = member.id

            log.info('createArtifact params[%s]' % request.params)
            name = request.params.get('title')
            if not name and request.params.has_key('titleEnc'):
                try:
                    name = h.safe_decode(base64.b64decode(request.params.get('titleEnc')))
                except TypeError:
                    log.warn("Could not base64 decode titleEnc")
            if name is None or name == '':
                c.errorCode = ErrorCodes.CANNOT_CREATE_ARTIFACT
                return ErrorCodes().asDict(c.errorCode, 'No title provided')

            kwargs['name'] = name

            handle = request.params['handle'] if request.params.has_key('handle') else None
            if not handle:
                handle = model.title2Handle(name)
            handle = model.title2Handle(handle)
            if not handle:
                raise ex.EmptyArtifactHandleException((_(u'The handle was empty or not provided. Please provide one.')).encode("utf-8"))
            kwargs['handle'] = handle

            artifact = api.getArtifactByHandle(handle=handle, typeID=typeID, creatorID=member.id)
            if artifact is not None:
                error = "%s with handle, '%s', already exists" % (typeName, handle)
                log.error('createArtifact: %s' % error)
                c.errorCode = ErrorCodes.ARTIFACT_ALREADY_EXIST
                return ErrorCodes().asDict(c.errorCode,
                                        message=error,
                                        infoDict={ 'id': artifact.id })

            domainEID = request.params.get('domainEID', '').upper()
            domainEIDs = request.params.get('domainEIDs', [])
            if domainEIDs:
                domainEIDs = [ x.strip().upper() for x in domainEIDs.split(',') ]

            if domainEID and not domainEIDs:
                domainEIDs = [ domainEID ]

            browseTerms = []

            if domainEIDs:
                kwargs['domainEIDs'] = domainEIDs
            log.info("createArtifact: Domain EIDs: %s" % domainEIDs)

            encodedID = request.params['encodedID'] if request.params.has_key('encodedID') else None
            if encodedID:
                encodedID = encodedID.upper()
                artifact = api.getArtifactByEncodedID(encodedID=encodedID)
                if artifact:
                    err = 'Artifact with encodedID: %s already exists.' % encodedID
                    log.error('createArtifact: ' + err)
                    c.errorCode = ErrorCodes.ARTIFACT_ALREADY_EXIST
                    return ErrorCodes().asDict(c.errorCode, message=err, infoDict={'id':artifact.id})
                if artifactType.extensionType != encodedID.upper().split('.')[-2]:
                    raise Exception('Invalid encodedID for type: %s' % typeName)
                kwargs['encodedID'] = encodedID
                deid = '.'.join(encodedID.split('.')[:-2])
                if domainEIDs and deid not in domainEIDs:
                    raise Exception('Mismatch between domainEIDs[%s] and encodedID[%s]' % (domainEIDs, encodedID))
                if not domainEIDs:
                    domainEIDs = [ deid ]

            termTypes = g.getBrowseTermTypes()
            if artifactType.modality and domainEIDs:
                for domainEID in domainEIDs: #and domainEID == deid:
                    ## skip subject and branch level terms [Bug: 15699]
                    if domainEID.count('.') <= 1:
                        continue
                    domainTerm = api.getBrowseTermByEncodedID(encodedID=domainEID, returnSupercedingConcept=True)
                    if not domainTerm:
                        raise Exception('Invalid domainEID [%s] or encodedID [%s] specified.' % (domainEID, encodedID))
                    browseTerms.append({'browseTermID': domainTerm.id})
            if request.params.get('conceptCollectionHandles') and request.params.get('collectionCreatorIDs'):
                conceptCollectionHandles = request.params.get('conceptCollectionHandles', '').split(',')
                if conceptCollectionHandles:
                    collectionCreatorIDs = [ int(x) if x.strip() else 0 for x in request.params.get('collectionCreatorIDs', '').split(',') ]
                    if len(conceptCollectionHandles) != len(collectionCreatorIDs):
                        raise Exception('Count mismatch for conceptCollectionHandles and collectionCreatorIDs')
                    kwargs['conceptCollectionHandles'] = conceptCollectionHandles
                    kwargs['collectionCreatorIDs'] = collectionCreatorIDs

            if artifactType.name == 'assignment':
                #
                #  Assignment.
                #
                groupID = request.params.get('groupID', None)
                if groupID:
                    isAdmin = api.isGroupAdmin(groupID=groupID, memberID=member.id)
                    isSuperAdmin = api.isGroupAdmin(groupID=1, memberID=member.id)
                    if not isAdmin and not isSuperAdmin:
                        raise ex.UnauthorizedException((_(u'Only admin can create assignments.')).encode("utf-8"))

                kwargs['groupID'] = groupID
                kwargs['due'] = request.params.get('due', None)

            level = request.params.get('level', 'at grade').strip().lower()
            if level:
                lvlTerm = api.getBrowseTermByIDOrName(idOrName=level, type=termTypes['level'])
                if lvlTerm:
                    browseTerms.append({'browseTermID': lvlTerm.id})
                else:
                    raise Exception('Invalid level [%s] specified.' % level)

            contributedBy = request.params.get('contributedBy', '').strip().lower()
            if contributedBy:
                cbTerm = api.getBrowseTermByIDOrName(idOrName=contributedBy, type=termTypes['contributor'])
                if cbTerm:
                    browseTerms.append({'browseTermID': cbTerm.id })
                else:
                    raise Exception(_('Invalid contributedBy term [%s] specified.' % contributedBy))

            internalTags = request.params.get('internal-tags', '').strip()
            if internalTags:
                internalTags = [ x.strip() for x in internalTags.split(';') ]
                for internalTag in internalTags:
                    if internalTag:
                        internalTagTerm = api.getBrowseTermByIDOrName(idOrName=internalTag, type=termTypes['internal-tag'])
                        if internalTagTerm:
                            browseTerms.append({'browseTermID': internalTagTerm.id })
                        else:
                            browseTerms.append({'name': internalTag, 'browseTermType': termTypes['internal-tag']})

            if browseTerms:
                kwargs['browseTerms'] = browseTerms

            tagTerms = []
            tags = request.params.get('tags', '').strip()
            if tags:
                tags = [ x.strip() for x in tags.split(';') ]
                for tag in tags:
                    if tag:
                        tagTerm = api.getTagTermByIDOrName(idOrName=tag)
                        if tagTerm:
                            tagTerms.append({'tagTermID': tagTerm.id })
                        else:
                            tagTerms.append({'name': tag})

            if tagTerms:
                kwargs['tagTerms'] = tagTerms

            kwargs['changed_metadata'] = request.params.get('changed_metadata', None)
            kwargs['resourceRevisionIDs'] = request.params.get('resourceRevisionIDs', None)

            authors = []
            if request.params.has_key('authors'):
                isJson = True
                authorDict = request.params['authors']
                if not self._isDict(authorDict):
                    try:
                        authorDict = json.loads(authorDict)
                    except ValueError:
                        isJson = False
                if isJson:
                    authors = []
                    for roleName in authorDict.keys():
                        memberRoleDict, memberRoleNameDict = g.getMemberRoles()
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
                else:
                    authors = authorDict.strip()
                    authors = authors.split(';')
                    authors = [ x.split(':') if ':' in x else [ '%s' % x, 'author' ] for x in authors ]
                kwargs['authors'] = authors
                log.info("Authors: %s" % authors)

            try:
                description = request.params['summary']
            except Exception, e:
                description = None

            if not description and request.params.has_key('summaryEnc'):
                try:
                    description = h.safe_decode(base64.b64decode(request.params.get('summaryEnc')))
                except TypeError:
                    log.warn("Could not base64 decode summaryEnc")
                    description = None
            kwargs['description'] = description

            try:
                kwargs['messageToUsers'] = request.params['messageToUsers']
            except Exception, e:
                kwargs['messageToUsers'] = None

            try:
                comment = request.params['comment']
                kwargs['comment'] = comment
            except Exception, e:
                kwargs['comment'] = None

            try:
                licenseName = request.params['licenseName']
                kwargs['licenseName'] = licenseName
            except Exception, e:
                kwargs['licenseName'] = None

            kwargs['languageCode'] = request.params.get('languageCode', 'en')
            language = api.getLanguageByNameOrCode(nameOrCode=kwargs['languageCode'])
            if not language:
                raise Exception(_('Invalid languageCode [%s]' % kwargs['languageCode']))

            resources = []
            log.debug("params: %s" % request.params)
            try:
                coverImageType = api.getResourceTypeByName(name='cover page')
                coverImageName = request.params.get('cover image name')
                coverImageDescription = request.params.get('cover image description')
                coverImagePath = None

                uriOnly = False
                hasPath = False
                if request.params.has_key('cover image path'):
                    coverImagePath = request.params['cover image path']
                    if h.isUploadField(coverImagePath):
                        hasPath = True
                else:
                    hasPath = False

                xhtml = None
                try:
                    xhtml = request.params['xhtml']
                    if xhtml is None or len(xhtml) == 0:
                        raise KeyError()
                    try:
                        xhtml = base64.b64decode(xhtml)
                    except TypeError:
                        log.warn("Unable to base64 decode 'xhtml'")
                except KeyError:
                    #
                    #  No content for this artifact.
                    #
                    pass
                
                if request.params.has_key('cover image uri') and request.params['cover image uri']:
                    log.info("Cover image uri: %s" % request.params['cover image uri'])
                    coverImagePath = request.params['cover image uri']
                elif not hasPath and request.params.get('attachmentEmbedCode') and request.params.get('attachmentThumbnail') and artifactType.modality:
                    ## Use thumbnail image as the cover image
                    thumbnail = request.params.get('attachmentThumbnail')
                    log.info("Found thumbnail url. Using as cover image: %s" % thumbnail)
                    coverImagePath = thumbnail
                    coverImageName = thumbnail
                elif (typeName == 'lesson' or typeName == 'concept') and xhtml:
                    coverImagePath = api._get_first_img_src(xhtml)

                isExternal = False
                if not hasPath and coverImagePath:
                    if coverImagePath.startswith('/flx/'):
                        coverImagePath = config.get('web_prefix_url') + coverImagePath
                    if coverImagePath.find('://') > 0:
                        isExternal = True
                    log.info('CoverImagePath: %s' %(coverImagePath))

                if not hasPath and coverImagePath:
                    uriOnly = True

                log.info("Has path %s, uriOnly: %s" % (str(hasPath), str(uriOnly)))
                if hasPath or uriOnly:
                    coverImageDict = {
                        'resourceType': coverImageType,
                        'name': coverImageName,
                        'description': coverImageDescription,
                        'uri': coverImagePath,
                        'isExternal': isExternal,
                        'uriOnly': uriOnly,
                        'languageID': language.id,
                    }
                    resources.append(coverImageDict)
            except Exception, e:
                log.error('create artifact cover image Exception[%s]' % str(e), exc_info=e)
                raise e

            contentType = api.getResourceTypeByName(name='contents')
            contentDict = {
                'resourceType': contentType,
                'name': name,
                'description': description,
                'isExternal': False,
                'uriOnly': False,
                'languageID': language.id,
            }
            try:
                xhtml = request.params['xhtml']
                if xhtml is None or len(xhtml) == 0:
                    raise KeyError()
                try:
                    xhtml = base64.b64decode(xhtml)
                except TypeError:
                    log.warn("Unable to base64 decode 'xhtml'")
                contentDict['contents'] = xhtml
                resources.append(contentDict)
            except KeyError:
                try:
                    uri = request.params['xhtml path']
                    if not uri:
                        raise KeyError()
                    contentDict['uri'] = uri
                    resources.append(contentDict)
                except KeyError:
                    #
                    #  No content for this artifact.
                    #
                    pass

            resourceTypes = api.getResourceTypesObjDict()
            attachmentDict = {}
            attachmentPath = request.params.get('attachmentPath')
            log.info("attachmentPath: %s, type: %s" % (attachmentPath, type(attachmentPath).__name__))
            attachmentPathLocation = request.params.get('attachmentPathLocation')
            attachmentURL = request.params.get('attachmentUri')
            attachmentEmbedCode = request.params.get('attachmentEmbedCode')
            contentType = request.params.get('contentType')
            processAttachment = True
            eoDict = None
            if attachmentURL:
                log.info("attachment is a url")
                attachmentDict['uri'] = attachmentURL
                attachmentDict['uriOnly'] = True
                attachmentDict['isExternal'] = True
            elif request.params.has_key('attachmentPath') and type(attachmentPath).__name__ not in ['unicode', 'str']:
                log.info("attachment is a uploaded file")
                attachmentDict['uriOnly'] = False
                attachmentDict['isExternal'] = False
            elif attachmentPathLocation:
                log.info("attachment is a file path")
                attachmentPath = open(h.safe_encode(attachmentPathLocation), 'rb')
                attachmentDict['uriOnly'] = False
                attachmentDict['isExternal'] = False
            elif attachmentEmbedCode:
                log.info("attachment is an embeddedObject: %s" % attachmentEmbedCode)
                thumbnail = request.params.get('attachmentThumbnail')
                embedInfo = {'embeddable': attachmentEmbedCode}
                if thumbnail:
                    embedInfo['thumbnail'] = thumbnail
                eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(embedInfo=embedInfo, ownerID=member.id)
                if not eowrapper.object:
                    eoDict = eowrapper.createEmbeddedObject(returnDict=True)
                log.info("eoDict: %s" % eoDict)
                attachmentDict['uri'] = eowrapper.getUrlFromCode()
                log.info("Using uri: %s" % attachmentDict['uri'])
                attachmentDict['uriOnly'] = True
                attachmentDict['isExternal'] = True
            else:
                log.info("No attachment file or url specified")
                processAttachment = False
            if processAttachment:
                if not attachmentDict['uriOnly']:
                    if hasattr(attachmentPath, 'filename'):
                        log.info("attachmentPath.filename: %s" % attachmentPath.filename)
                        filename = os.path.basename(attachmentPath.filename)
                        tempFile = h.saveUploadedToTemp(attachmentPath)
                        if h.isFileMalicious(tempFile):
                            raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))
                    elif hasattr(attachmentPath, 'name'):
                        log.info("attachmentPath.name: %s" % attachmentPath.name)
                        filename = os.path.basename(attachmentPath.name)
                    if filename:
                        path, ext = os.path.splitext(filename)
                        if not ext or ext.lower() not in h.ALLOWED_ATTACHMENT_EXTENSIONS:
                            raise Exception((_(u'Invalid file extension. Files of type %(ext)s are not supported as attachments.')  % {"ext":ext}).encode("utf-8"))
                    attachmentDict['uri'] = attachmentPath
                attachmentDict['isAttachment'] = True
                attachmentDict['isPublic'] = False
                if contentType:
                    attachmentDict['resourceType'] = contentType
                else:
                    attachmentDict['resourceType'] = resourceTypes[model.ARTIFACT_TYPES_MAP[typeName]]
                attachmentDict['name'] = request.params.get('attachmentName', '')
                attachmentDict['description'] = request.params.get('attachmentDesc')
                attachmentDict['languageID'] = language.id
                attachmentDict['ownerID'] = member.id
                attachmentDict['creationTime'] = datetime.now()
                attachmentDict['authors'] = ', '.join([x[0] for x in authors]) if authors else None
                attachmentDict['license'] = kwargs.get('licenseName')
                if eoDict:
                    attachmentDict['eoDict'] = eoDict
                resources.append(attachmentDict)

            kwargs['resources'] = resources
            log.info('createArtifact: resource[%s]' % resources)

            log.info("Children: %s" % request.params.getall('children'))
            try:
                childIDList = request.params.getall('children')
                if len(childIDList) == 1 and not childIDList[0]:
                    childIDList = None
                log.info('createArtifact: childIDList[%s] len[%s]' % (childIDList, len(childIDList)))
                if len(childIDList) == 1 and not childIDList[0]:
                    childIDList = None
                if childIDList and len(childIDList) > 0:
                    if len(childIDList) == 1:
                        #
                        #  See if it is a comma separated list.
                        #
                        a = childIDList[0]
                        try:
                            i = a.index(',')
                            if i > 0:
                                childIDList = a.split(',')
                        except ValueError, v:
                            log.debug('createArtifact: childIDList error[%s]' % v)
                            pass
                    ## Get artifacts one by one since order of the children is
                    ## important and should be preserved.
                    ## using api.getArtifacts() will change the order
                    ## - Nimish
                    #children = api.getArtifacts(idList=childIDList)
                    childList = []
                    for child in childIDList:
                        log.debug('createArtifact: child[%s]' % child)
                        if artifactType.extensionType != 'ST':
                            ca = api.getArtifactRevisionByID(id=child)
                        else:
                            #
                            #  Study track.
                            #
                            #   The child list could either be artifact ID
                            #   or encodedID.
                            #
                            try:
                                child = long(child)
                                a = api.getArtifactByID(child)
                            except ValueError:
                                a = api.getArtifactByEncodedID(child, typeName='domain')
                            if not a:
                                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                                return ErrorCodes().asDict(c.errorCode, 'No such artifact.')
                            ca = a.revisions[0]
                        if ca is not None:
                            childList.append({ 'artifact': ca })
                        else:
                            log.info("child[%s] not found" % child)
                    kwargs['children'] = childList
                    log.info("Children: %s" % str(childList))
            except Exception, e:
                #
                #  No child for this artifact.
                #
                pass

            if request.params.get('bookTitle'):
                kwargs['bookTitle'] = request.params.get('bookTitle')

            kwargs['typeName'] = typeName
            autoSplitLesson = str(request.params.get('autoSplitLesson')).lower() == 'true'
            if typeName == 'lesson' and autoSplitLesson:
                kwargs['autoSplitLesson'] = autoSplitLesson
                artifact, concept = api.createLesson(**kwargs)
            else:
                artifact = api.createArtifact(**kwargs)

            log.info("Artifact:-----%s" % artifact)
            if processAttachment and attachmentEmbedCode and eowrapper:
                for rr in artifact.revisions[0].resourceRevisions:
                    if rr.resource.isAttachment:
                        eowrapper.resourceID = rr.resourceID
                        break
                eo = eowrapper.createEmbeddedObject()
                log.info("Embedded object: %s [resourceID: %d]" % (eo.id, eo.resourceID))

            for browseTerm in artifact.browseTerms:
                if browseTerm.type.name in ['domain', 'pseudodomain', 'internal-tag']:
                    log.info('Invalidting cache: %s, MemberID: %s' %(browseTerm.id, artifact.creatorID))
                    #api.invalidateArtifact(ArtifactCache(), artifact)
                    api.invalidateBrowseTerm(BrowseTermCache(), browseTerm.id, artifact.creatorID)
            #
            #Create login users labels for filter from tags
            #
            import ast
            labels = None
            mylabels = []
            systemLabels = []
            labelDict = request.params.get('labels')
            if labelDict:
                labelDict = ast.literal_eval(labelDict)
                if labelDict:
                    labels = labelDict.get('labels')
                
            if labels:
                for label in labels:
                    if re.search("[!#$%&'*+\/=?^_`{}\",;.]+",label):
                        return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_LABEL,'Invalid label. A label can contain numbers, letters, spaces and hyphens')
                    memberLabel = api.getMemberLabelByName(memberID=member.id, label=label, systemLabel=False)
                    sysLabel = api.getMemberLabelByName(memberID=member.id,label=label, systemLabel=True)
                    if memberLabel or sysLabel:
                        if sysLabel:
                            systemLabels.append(sysLabel.label)
                        else:
                            mylabels.append(memberLabel.label)
                            
                        log.info('Label %s is already exist in user account so skipping it' % label)
                    else:
                        systemLabel = False
                        labelObj = api.createMemberLabel(memberID=member.id, label=label, systemLabel=systemLabel)
                        log.info('Created Label[%s]' % labelObj)
                        mylabels.append(label)
                        LabelCache().invalidate(member.id)
                        
            #        
            #  Apply Labels to created artifact
            #
            objectID = artifact.revisions[0].id
            objectType = 'artifactRevision'
            domainID = None
            if domainID:
                domainID = int(domainID)
                
            if mylabels:
                labels = [ x.strip() for x in mylabels ]
            else:
                labels = None
                
            if systemLabels:
                systemLabels = [ x.strip() for x in systemLabels ]
            else:
                systemLabels = None
            
            obj = api.addObjectToLibrary(objectID=objectID, objectType=objectType, 
                        memberID=member.id, domainID=domainID, labels=labels, systemLabels=systemLabels,
                        removeExisting=True, cache=ArtifactCache())
            log.info("Adding %d to library" % (objectID))
            if objectType == 'artifactRevision':
                ids2Reindex = [obj.parentID]
            LabelCache().invalidate(member.id)

            if ids2Reindex:
                h.reindexArtifacts(ids2Reindex, member.id)
            
            #
            #  Reindex.
            #
            if request.params.has_key('reindex'):
                reindex = request.params['reindex'].lower() == 'true'
            else:
                reindex = True
            if reindex:
                taskId = h.reindexArtifacts([artifact.id], member.id)
                log.info("create artifact[%s] Task id: %s" % (artifact.id, taskId))
        except h.InvalidContentException as ice:
            log.error("createArtifact: invalid rosetta content: %s" % str(ice), exc_info=ice)
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTML_CONTENT, str(ice))
        except h.InvalidRosettaException as ire:
            log.error("createArtifact: invalid rosetta syntax: %s" % str(ire), exc_info=ire)
            return ErrorCodes().asDict(ErrorCodes.INVALID_ROSETTA, str(ire))
        except h.InvalidImageException as iie:
            log.error("createArtifact: invalid image endpoints: %s" % str(iie), exc_info=iie)
            return ErrorCodes().asDict(ErrorCodes.INVALID_IMAGE_ENDPOINT, str(iie))
        except ex.EmptyArtifactHandleException as eahe:
            log.debug("createArtifact: %s" % str(eahe), exc_info=eahe)
            return ErrorCodes().asDict(ErrorCodes.EMPTY_ARTIFACT_HANDLE, str(eahe))
        except Exception, e:
            log.error('createArtifact: Exception[%s]' % e, exc_info=e)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_CREATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

        ## Caching math is not necessary - we are using MathJax now.
        #fire celery task to create cache:
        #if request.params.has_key('cache math'):
        #    cacheMath = request.params['cache math'].lower() == 'true'
        #else:
        #    cacheMath = True
        #if cacheMath and artifact.getXhtml():
        #    cache_maker = mathcache.MathCacheTask()
        #    cache_maker.delay(artifactID=artifact.id, user=member.id)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        return g.ac.getInfo(result, artifact.id, type=typeName, artifact=artifact)

    def updateArtifactCacheItem(self, aDict, key, value):
        if value:
            value = value.strip()
            if value != aDict.get(key):
                aDict[key] = value
                aDict['isDirty'] = True

    @d.trace(log, ['member', 'id', 'payload'])
    def updateArtifactCache(self, member, id, payload, session=None):
        """
            Update the artifact cache instead of the database.

            Returns True if the cache has been updated; False otherwise.
        """
        if not payload or type(payload) != dict:
            raise Exception((_(u'No payload provided.')).encode("utf-8"))

        log.debug('updateArtifactCache: payload%s' % payload)
        revID = payload.get('artifactRevisionID', 0)

        from flx.controllers.mongocache.artifactCache import ArtifactCache

        ac = ArtifactCache(self.db)
        acDict = ac.getArtifactCache(id=id, revID=revID)
        log.debug('updateArtifactCache: acDict%s' % acDict)
        if not acDict:
            #
            #  Not in cache.
            #
            return False

        aDict = acDict['value']

        creatorID = aDict.get('creatorID', 0)
        if creatorID != member.id:
            #
            #  Not creator.
            #
            return False

        handle = payload.get('handle', None)
        if handle:
            handle = handle.strip()
            oHandle = aDict.get('handle')
            if handle != oHandle:
                #
                #  Will need to update the perma cache also.
                #  Skip for now.
                #
                return False

        revID = aDict['artifactRevisionID']
        #
        #  Update aDict from payload.
        #
        self.updateArtifactCacheItem(aDict, 'encodedID', payload.get('encodedID', None))
        self.updateArtifactCacheItem(aDict, 'messageToUsers', payload.get('messageToUsers', None))
        self.updateArtifactCacheItem(aDict, 'summary', payload.get('summary', None))
        self.updateArtifactCacheItem(aDict, 'title', payload.get('title', None))

        xhtml = payload.get('xhtml', None)
        self.updateArtifactCacheItem(aDict, 'xhtml', xhtml)
        if aDict.get('xhtml_prime', None):
            self.updateArtifactCacheItem(aDict, 'xhtml_prime', xhtml)

        revisions = aDict.get('revisions')
        revision = revisions[0]
        self.updateArtifactCacheItem(revision, 'comment', payload.get('comment', None))
        self.updateArtifactCacheItem(revision, 'summary', payload.get('summary', None))
        self.updateArtifactCacheItem(revision, 'title', payload.get('title', None))
        #
        #  TODO:
        #   attachment related
        #   authors
        #   changed_metadata: grades, levels
        #   cover image related
        #   domainEIDs
        #   encodedID
        #   foundation related
        #   grade related
        #   subject related
        #   tag related
        #

        handle = payload.get('handle', None)
        if handle:
            handle = handle.strip()
            oHandle = aDict.get('handle')
            if handle != oHandle:
                perma = aDict.get('perma')
                i = perma.index(oHandle)
                if i >= 0:
                    #
                    #  TODO:  Also need to update the perma cache.
                    #
                    perma = perma[0:i] + handle + perma[i + len(oHandle):]
                    self.updateArtifactCacheItem(aDict, 'perma', perma)
                self.updateArtifactCacheItem(aDict, 'handle', handle)
                self.updateArtifactCacheItem(revision, 'handle', handle)

        childDict = {}
        i = 0
        children = revision.get('children', None)
        for child in children:
            childDict[child['artifactRevisionID']] = i, child
            i += 1
        changedOrder = False
        children = []
        n = 0
        nChildren = payload.get('children', None)
        if nChildren:
            for nChild in nChildren:
                i, child = childDict[nChild['artifactRevisionID']]
                if i != n:
                    changedOrder = True

                self.updateArtifactCacheItem(child, 'summary', nChild.get('summary', None))
                self.updateArtifactCacheItem(child, 'title', nChild.get('title', None))

                cRevisions = child.get('revisions')
                cRevision = cRevisions[0]
                self.updateArtifactCacheItem(cRevision, 'comment', nChild.get('comment', None))
                self.updateArtifactCacheItem(cRevision, 'summary', nChild.get('summary', None))
                #
                #  TODO:
                #   authors
                #   handle
                #
                children.append(child)
        if changedOrder:
            revision['children'] = children
            aDict['isDirty'] = True

        now = datetime.now()
        aDict['modified'] = now.strftime('%Y-%m-%dT%H:%M:%S%z')

        namespace = acDict['namespace']
        ac.putArtifactCache(id=id, revID=revID, namespace=namespace, artifactDict=aDict)
        return True

    def _validateAssembleArtifactInfo(self, info):
        if not isinstance(info, dict):
            raise ex.InvalidArgumentException(('Invalid type of info received in assembleArtifact.').encode("utf-8"))
        
        #validate is the mandatory arguments are present
        if not info.get('artifactType') or not info.get('title'):
            raise ex.MissingArgumentException(('one or more of the mandatory arguments(type/title) are missing in the request received for assembleArtifact.').encode("utf-8"))

        #validate the type
        if info.get('artifactType') not in ('lesson', 'section', 'chapter', 'book', 'tebook', 'testbook', 'quizbook', 'workbook', 'labkit', 'studyguide'):
            raise ex.InvalidArgumentException(('invalid artifactType received in the request for assembleArtifact.').encode("utf-8"))
           
        #preProcess and validate handle
        handle = info.get('handle')
        if not handle:
            title = info.get('title')
            if title:
                handle = model.title2Handle(title)
        if not handle:
            raise ex.EmptyArtifactHandleException((_(u'The handle was empty or not provided. Please provide one.')).encode("utf-8"))

    def _validateAssembleArtifactRequestPayload(self, requestPayload):
        if not isinstance(requestPayload, dict):
            raise ex.InvalidArgumentException(('Invalid type of request payload received in assembleArtifact.').encode("utf-8"))
        
        #validate this level
        self._validateAssembleArtifactInfo(requestPayload)
        
        #validate the children
        children = requestPayload.get('children')
        if children:
            if not isinstance(children, list):
                raise ex.InvalidArgumentException(('Invalid type of children received in the requestPayload for assembleArtifact.').encode("utf-8"))
            for child in children:
                if isinstance(child, dict):
                    self._validateAssembleArtifactRequestPayload(child)

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def assembleArtifact(self, member):
        """
            Assemble an artifact based on the information given in the
            'artifact' parameter.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        messages = []
        try:
            data = request.params.get('artifact')
            if not data:
                raise Exception((_(u'No artifact information given')).encode("utf-8"))

            try:
                data = base64.b64decode(data)
            except TypeError:
                log.warn("Error decoding base64")

            info = json.loads(data)
            log.debug("Input: %s" % info)

            #By here we would have already authenticated the member, so we can take it for granted that member has all the necessary information present - Member is already validated
            #Validate info by checking that valid type, title are passed for the book as well as all children if they are Infos(ie..dicts) as well
            self._validateAssembleArtifactRequestPayload(info)

            #  Check for duplicate children (chapter) names.
            artifactType = info['artifactType']
            if artifactType == 'book':
                children = info['children']
                childDict = {}
                for child in children:
                    if child['artifactType'] == 'chapter':
                        title = child['title']
                        if childDict.has_key(title):
                            raise ex.DuplicateTitleException((_(u"duplicate chapter title between %(childDict[title])s and %(child)s")  % {"childDict[title]":childDict[title],"child": child}).encode("utf-8"))
                        childDict[title] = child

            #
            #  See if the artifact exists already.
            #
            handle = info.get('handle')
            if not handle:
                name = info.get('title')
                handle = model.title2Handle(name)
            handle = model.title2Handle(handle)
            if not handle:
                raise ex.EmptyArtifactHandleException((_(u'The handle was empty or not provided. Please provide one.')).encode("utf-8"))
            if not info.get('handle'):
                info['handle'] = handle
            artifactType = info.get('artifactType')
            artifactTypeDict = g.getArtifactTypes()
            resourceTypeDict, resourceTypeNameDict = g.getResourceTypes()
            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            revID = 0

            originalArtifactRevisionID = 0
            memberID = 0
            deepCopy = info.get('deepCopy')
            if not deepCopy:
                tx = utils.transaction(self.getFuncName())
                with tx as session:
                    artifact = api._getArtifactByHandle(session, handle, artifactTypeDict[artifactType], member.id, lockMode='update')
                    if type(handle) != unicode:
                        handle = unicode(handle, 'utf-8')
                    email = member.email
                    if type(email) != unicode:
                        email = unicode(member.email, 'utf-8')

                    if artifact and artifact.revisions:
                        originalArtifactRevisionID=artifact.revisions[0].id
                    if member:
                        memberID=member.id

                    updating = request.params.get('updating', 'false').lower()
                    if updating == 'false':
                        #
                        #  Creating artifact, should not find another one.
                        #
                        if artifact:
                            raise ex.AlreadyExistsException((_(u'%(artifactType)s[%(handle)s] from[%(email)s] exists already')  % {"artifactType":artifactType, "handle": handle, "email": email}).encode("utf-8"))
                    else:
                        #
                        #  Updating artifact, should not find another one except itself.
                        #
                        artifactID = info.get('artifactID')
                        if artifact:
                            if artifactID:
                                if type(artifactID) == str:
                                    artifactID = long(artifactID)
                                if artifact.id != artifactID:
                                    raise ex.AlreadyExistsException((_(u'%(artifactType)s[%(handle)s] from[%(email)s] exists already')  % {"artifactType":artifactType, "handle": handle, "email": email}).encode("utf-8"))
                    if artifact:
                        #
                        #  Check and see if it's being finalized.
                        #
                        api._checkBookFinalizationLock(session, artifact.id)

                    ar, vcs, newRev = api._assembleArtifact(session,
                                                            member=member,
                                                            info=info,
                                                            isRevision=False,
                                                            resourceRevisionList=[],
                                                            resourceRevisionDict={},
                                                            messages=messages,
                                                            artifactTypeDict=artifactTypeDict,
                                                            resourceTypeDict=resourceTypeDict,
                                                            roleNameDict=memberRoleNameDict,
                                                            cache=ArtifactCache(),
                                                            vcs=None,
                                                            commit=True)
                    artifact = ar.artifact
                    artifactID = artifact.id
                    revID = ar.id
                
                ##delete draft
                if originalArtifactRevisionID and memberID:
                    api.deleteMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=originalArtifactRevisionID)

                ## Reindex
                taskId = h.reindexArtifacts([artifactID], user=member.id, recursive=True)
                log.info("Reindex task id: %s" % taskId)

		from flx.lib import artifact_utils as au

                log.info("!!! Reloading artifact from cache. id[%s], revID[%s], memberID[%s]" % (artifactID, revID, member.id))
		artifactDict = au.getArtifact(artifactID, revID, artifactType, member.id, options=None)
                result['response']['artifact'] = artifactDict
                if len(messages) > 0:
                    result['response']['messages'] = messages
                return result            
            else:
                #
                #  Perform the assembly asynchronously.
                #
                from flx.controllers.celerytasks import artifact as a

                info['handle'] = handle
                assembleArtifactTask = a.assembleArtifactTask()
                kwargs = {
                    'memberID': member.id,
                    'info': info,
                    'isRevision': False,
                    'artifactTypeDict': artifactTypeDict,
                    'resourceTypeDict': resourceTypeDict,
                    'roleNameDict': memberRoleNameDict,
                }
                task = assembleArtifactTask.delay(**kwargs)
                result['response']['taskID'] = task.task_id
                return result
        except ex.AlreadyExistsException, aee:
            log.error('assembleArtifact: exists already[%s]' % str(aee), exc_info=aee)
            c.errorCode = ErrorCodes.ARTIFACT_ALREADY_EXIST
            return ErrorCodes().asDict(c.errorCode, str(aee))
        except ex.DuplicateTitleException, dte:
            log.error('assembleArtifact: duplicate chapter title[%s]' % str(dte), exc_info=dte)
            c.errorCode = ErrorCodes.DUPLICATE_CHAPTER_TITLE
            return ErrorCodes().asDict(c.errorCode, str(dte))
        except h.InvalidContentException, ice:
            log.error("assembleArtifact: invalid rosetta: %s" % str(ice), exc_info=ice)
            c.errorCode = ErrorCodes.INVALID_HTML_CONTENT
            return ErrorCodes().asDict(c.errorCode, str(ice))
        except h.InvalidImageException as iie:
            log.error("assembleArtifact: invalid image endpoints: %s" % str(iie), exc_info=iie)
            return ErrorCodes().asDict(ErrorCodes.INVALID_IMAGE_ENDPOINT, str(iie))
        except ex.EmptyArtifactHandleException as eahe:
            log.debug("assembleArtifact: %s" % str(eahe), exc_info=eahe)
            return ErrorCodes().asDict(ErrorCodes.EMPTY_ARTIFACT_HANDLE, str(eahe))
        except Exception, e:
            log.error('assembleArtifact: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['bookType'])
    @d.trace(log, ['member', 'bookType'])
    def finalizeBook(self, member, bookType):
        """
            Finalize selected sections of the given book.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            memberID = member.id

            bookType = bookType.strip().lower()
            if bookType not in bookTypes:
                raise ex.InvalidArgumentException((_(u'Invalid type, %(bookType)s.' % {'bookType':bookType})).encode("utf-8"))

            data = request.params.get('finalize')
            if not data:
                raise Exception((_(u'No finalize information given.')).encode("utf-8"))
            log.debug("finalizeBook: data[%s]" % data)

            info = json.loads(data)
            log.debug("finalizeBook: type(info)[%s] info[%s]" % (type(info), info))
            bookID = info.get('artifactID', None)
            if not bookID:
                raise ex.MissingArgumentException((_(u'Missing artifactID.')).encode("utf-8"))
            bookRevisionID = info.get('artifactRevisionID', None)
            if not bookRevisionID:
                raise ex.InvalidArgumentException((_(u'Missing artifactRevisionID.')).encode("utf-8"))
            bookRevisionID = int(bookRevisionID)
            children = info.get('children', None)
            if not children:
                raise ex.InvalidArgumentException((_(u'Missing children.')).encode("utf-8"))

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Validate the book.
                #
                book = api._getArtifactByID(session, id=bookID)
                if not book:
                    c.errorCode = ErrorCodes.NO_SUCH_BOOK
                    raise ex.InvalidArgumentException((_(u'Unknown book, %(bookID)s.' % {'bookID':bookID})).encode("utf-8"))
                if book.type.name != bookType:
                    raise ex.InvalidArgumentException((_(u'Given type %(bookType)s not matching the actual type %(actualType)s.' % {'bookType':bookType, 'actualType':book.type.name})).encode("utf-8"))
                bookRevision = book.revisions[0]
                if bookRevision.id != bookRevisionID:
                    raise ex.InvalidArgumentException((_(u'Book revision, %(bookRevisionID)s, not the latest of book, %(bookID)s[%(bookName)s].' % {'bookRevisionID':bookRevisionID, 'bookID':bookID, 'bookName':book.name})).encode("utf-8"))
                if memberID != book.creatorID:
                    raise ex.InvalidArgumentException((_(u'Not creator of book, %(bookID)s[%(bookName)s].' % {'bookID':bookID, 'bookName':book.name})).encode("utf-8"))
                #
                #  Check and see if it's been locked.
                #
                bookFinalization = api._getBookFinalization(session, bookID=bookID)
                if bookFinalization:
                    c.errorCode = ErrorCodes.BOOK_FINALIZING
                    raise Exception((_(u'Book, %(bookID)s, already finalizing.' % {'bookID':bookID})).encode("utf-8"))
                #
                #  Lock the book.
                #
                finalizationList = []
                bookFinalization = api._createBookFinalization(session, bookID, 0)
                bookFinalizationLock = api._createBookFinalizationLock(session, bookID, bookID)
                finalizationList.append(bookFinalizationLock.asDict())
                #
                #  Validate and lock the children.
                #
                try:
                    total = 0
                    for child in children:

                        def validateChild(child, finalizationList, total):
                            log.debug('finalizeBook.validateChild: child%s' % child)
                            revisionID = child.get('artifactRevisionID', None)
                            finalize = child.get('finalize', None)
                            if finalize:
                                revision = api._getArtifactRevisionByID(session, id=revisionID)
                                if not revision:
                                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                                    raise ex.InvalidArgumentException((_(u'Unknown artifact, %(revisionID)s.' % {'revisionID':revisionID})).encode("utf-8"))

                                artifact = revision.artifact
                                if artifact.type.name not in ['lesson', 'section']:
                                    c.errorCode = ErrorCodes.INVALID_TYPE
                                    raise ex.InvalidArgumentException((_(u'Invalid type of the artifact, %(artifactID)s[%(artifactName)s].' % {'artifactID':artifact.id, 'artifactName': artifact.name})).encode("utf-8"))
                                if memberID != artifact.creatorID:
                                    raise ex.InvalidArgumentException((_(u'Not creator of %(type)s, %(artifactID)s[%(artifactName)s].' % {'type':artifact.type.name, 'artifactID':artifact.id, 'artifactName':artifact.name})).encode("utf-8"))

                                bookFinalizationLock = api._createBookFinalizationLock(session, artifact.id, bookID)
                                log.debug('finalizeBook.validateChild: bookFinalizationLock[%s]' % bookFinalizationLock)
                                finalizationList.append(bookFinalizationLock.asDict())
                                total += 1
                            return total

                        lessons = child.get('children', None)
                        if not lessons:
                            total = validateChild(child, finalizationList, total)
                        else:
                            for lesson in lessons:
                                total = validateChild(lesson, finalizationList, total)
                except Exception as e:
                    api._unlockFinalization(session, memberID, bookID, children)
                    raise e
                bookFinalization.total = total

            #
            #  Perform the book finalizing asynchronously.
            #
            from flx.controllers.celerytasks import artifact as a

            browseTermTypes = g.getBrowseTermTypes()
            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            finalizeBookTask = a.FinalizeBookTask()
            kwargs = {
                'info': info,
                'memberID': memberID,
                'bookTypes': bookTypes,
                'browseTermTypes': json.dumps(browseTermTypes),
                'memberRoleDict': json.dumps(memberRoleDict),
                'memberRoleNameDict': json.dumps(memberRoleNameDict),
            }
            task = finalizeBookTask.delay(**kwargs)
            #
            #  Update task id.
            #
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                bookFinalization = api._getBookFinalization(session, bookID=bookID)
                bookFinalization.taskID = task.task_id
                api._update(session, bookFinalization)
                result['response'][bookType] = bookFinalization.asDict()
            return result
        except Exception as e:
            log.error('finalizeBook: Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Delete related APIs.
    #

    def _deleteArtifact(self, id, type=None):
        c.id = id
        artifact = g.ac.getArtifact(id, type).asDict()
        #
        #  Check and see if it's being finalized.
        #
        api.checkBookFinalizationLock(id)

        c.metaDict = {
            'type': artifact['artifactType'],
            'authors': artifact['authors'],
            'title': artifact['title'],
            'summary': artifact['summary'],
            'created': artifact['created'],
            'modified': artifact['modified'],
            'foundationGrid': artifact['foundationGrid'],
            'standardGrid': artifact['standardGrid'],
            'statistics': artifact['revisions'][0]['statistics'],
        }
        c.type = artifact['artifactType']
        c.title = artifact['title']
        c.authors = artifact['authors']
        c.keys = sorted(c.metaDict.keys())
        c.prefix = self.prefix
        return render('/flx/artifact/deleteForm.html')

    @d.checkAuth(request, True, True, ['id', 'type'])
    @d.trace(log, ['id', 'type'])
    def deleteArtifactForm(self, id, type=None):
        return self._deleteArtifact(id, type)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'type'])
    @d.trace(log, ['id', 'type', 'member'])
    def deleteArtifact(self, id, member, type=None):
        """
            Deletes the artifact identifed by id. The logged in member
            must have the delete privilege on this artifact. The type
            of this artifact is optional.
        """
        if id is None:
            id = request.params['id']
        if type is None:
            try:
                type = request.params['type']
            except Exception:
                pass

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifact = g.ac.getArtifact(id, type)
            u.checkOwner(member, artifact.creatorID, artifact)
            #
            #  See if this artifact is still being assigned.
            #
            assignments = api.getBookEditingAssignments(artifactID=id)
            if assignments:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, '%s, %s, is being collaborated.' % (artifact.type.name, id))
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(id)

            if request.params.has_key('recursive'):
                recursive = request.params['recursive'].lower()
                recursive = recursive == 'true' or recursive == '1'
            else:
                recursive = True
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            notificationID = request.params.get('notificationID')
            if notificationID:
                notificationID = int(notificationID)
            from flx.controllers.celerytasks import artifact as deleteArtifact
            task = None
            if not waitFor:
                deleteArtifactTask = deleteArtifact.deleteArtifactTask()
                task = deleteArtifactTask.delay(artifact.id, type, member.id, recursive, user=member.id, revisionID=artifact.id, notificationID=notificationID)
                result['response']['taskID'] = task.task_id
            else:
                deleteArtifactTask = deleteArtifact.QuickDeleteArtifactTask()
                ret = deleteArtifactTask.apply({'artifactID': artifact.id, 'artifactType': type, 'memberID': member.id, 'recursive': recursive, 'revisionID': artifact.id, 'notificationID': notificationID})
                result['response']['message'] = ret.result
            from flx.model.audit_trail import AuditTrail
            #Log Audit Trail
            try:
                auditTrailDict = {
                        'auditType': 'delete_artifact',
                        'artifactType': artifact.type.name,
                        'artifactID': artifact.id,
                        'memberID': member.id,
                        'ownerID': artifact.creatorID,
                        'recursive': recursive,
                        'taskID': task.task_id if task else None,
                        'creationTime': datetime.utcnow()
                        }
                AuditTrail().insertTrail(collectionName='adminTracking', data=auditTrailDict)
            except Exception, e:
                log.error('deleteArtifact: There was an issue logging the audit trail %s' %e)

            return result
        except ex.NotFoundException, nfe:
            log.debug('deleteArtifact: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_DELETE_ARTIFACT
            log.error('deleteArtifact: Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Update related APIs.
    #
    def _updateArtifact(self, id, type):
        try:
            c.id = id
            artifact = api.getArtifactByIDOrTitle(idOrTitle=id, typeName=type)
            if artifact is None:
                if type is None:
                    type = 'artifact'
                raise Exception((_(u'No %(type)s identifed by: %(id)s')  % {"type":type,"id": id}).encode("utf-8"))
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(id)

            artifactDict = artifact.asDict()

            contributedBy = None
            tags = []
            for bt in artifact.browseTerms:
                if bt.type.name == 'tag':
                    tags.append(bt.name)
                elif bt.type.name == 'contributor':
                    contributedBy = bt.name
            authorDicts = artifactDict['authors']
            authors = []
            for authorDict in authorDicts:
                authors.append([ authorDict['name'], authorDict['role'], authorDict['sequence'] ])
            domains = artifact.getDomains()
            c.metaDict = {
                'type': artifactDict['artifactType'],
                'authors': authors,
                'title': artifactDict['title'],
                'handle': artifactDict['handle'],
                'encodedID': artifactDict['encodedID'] if artifactDict['encodedID'] else '',
                'domainEIDs': ', '.join([ d.encodedID for d in domains ]) if domains else '',
                'summary': artifactDict['summary'] if artifactDict['summary'] else '',
                'messageToUsers': artifactDict['messageToUsers'] if artifactDict['messageToUsers'] else None,
                'comment': artifactDict['revisions'][0]['comment'],
                'created': artifactDict['created'],
                'modified': artifactDict['modified'],
                'foundationGrid': artifactDict['foundationGrid'],
                'standardGrid': artifactDict['standardGrid'],
                'revisions': artifactDict['revisions'],
                'tags': '; '.join(tags),
                'contributedBy': contributedBy if contributedBy else '',
            }
            if artifactDict['artifactType'] == 'chapter':
                name = artifact.name
                pattern = model.getChapterSeparator()
                names = re.split(pattern, name)
                if len(names) > 1:
                    bookTitle = names[1]
                else:
                    bookTitle = ''
                c.metaDict['bookTitle'] = bookTitle

            c.xhtmlID = 0
            contentID, contentURI = artifact.getContentInfo()
            if contentID > 0:
                xhtml = artifact.getXhtml(includeChildContent=False)
                if xhtml is not None:
                    c.metaDict['xhtml'] = h.safe_decode(xhtml)
                    c.xhtmlID = contentID

            children = artifact.revisions[0].children
            chList = []
            if children is not None and len(children) > 0:
                for child in children:
                    chList.append(child.child.id)
            c.metaDict['children'] = chList
            c.rev = len(artifact.revisions)

            c.keys = sorted(c.metaDict.keys())
            c.readonly = {
                'type': True,
                'authors': True,
                'title': False,
                'handle': False,
                'encodedID': False,
                'domainEIDs': False,
                'created': True,
                'modified': True,
                'summary': False,
                'foundationGrid': True,
                'standardGrid': True,
                'revisions': False,
                'xhtml': False,
                'children': False,
                'bookTitle': True,
                'tags': False,
                'contributedBy': False,
            }
            c.prefix = self.prefix
            return render('/flx/artifact/updateForm.html')
        except Exception, e:
            log.error("Update artifact form exception [%s]" % str(e))
            log.error(traceback.format_exc())
            return str(e)

    @d.checkAuth(request, True, True, ['id', 'type'])
    @d.trace(log, ['id', 'type'])
    def updateArtifactForm(self, id, type=None):
        return self._updateArtifact(id, type)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id', 'type', 'rev'])
    @d.trace(log, ['member', 'id', 'type', 'rev'])
    def updateArtifact(self, member, id, type=None, rev=None):
        from sqlalchemy.exc import OperationalError
          
        count = 0
        while True:
            try:
                return self.__updateArtifact(member, id, type=type, rev=rev)
            except OperationalError, oe:
                log.info('updateArtifact: OperationalError[%s]' % oe, exc_info=oe)
                count += 1
                if count < 3:
                    continue
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
                return ErrorCodes().asDict(c.errorCode, str(oe))
            except Exception, e:
                log.error('updateArtifact: Exception[%s]' % e, exc_info=e)
                c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
                return ErrorCodes().asDict(c.errorCode, str(e))

    def __updateArtifact(self, member, id, type=None, rev=None):
        """
            Update the artifact identified by id.

            The following attributes are expected in HTTP Post:

            title:      The title of this artifact.
            handle:     The handle of this artifact.
            encodedID:  The encodedID of this artifact.
            domainEIDs: Optional domain terms to be assigned to the artifact
            summary:    The summary of this artifact.
            resourceRevisionIDs:
                        The list of resource revision IDs to be assigned. If given, it will forget the existing list.
            message to users:       This brief message will appear on the first page or
				    screen below the title, to explain important facts about the resource or version.
            xhtml:      The contents of this artifact in xhtml format, or
            xhtmlID:    The id of this content resource.
            children:   The list of child artifact identifiers,
                        separated by ','.
            level:      Optional level for the artifact ('basic', 'at grade', 'advanced')
            contributedBy: 
                        Optional contributor for the artifact ('student', 'teacher', 'community')
            authors:    The names of authors and their role separated by ':' 
                        and each entry separated by ';'. (eg: 'John Smith:author;Kate Winslet:contributor')
                        OPTIONAL
                        If included, the authors included in the parameter will be added and 
                        other authors will be removed. Please include all authors that need to be associated.
            autoSplitLesson
                        If the xhtml should be automatically split into lesson/concept pair (true or false)
                        default: false
            upgradeToLesson
                        If the artifact should be saved as a lesson (only for section artifacts) (true or false)
                        (Needs autoSplitLesson to be true)
                        default: false
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        #
        #  In a multi-user environment, a shared resource may try to be
        #  created concurrently. In that case, only one will succeed.
        #  We will try to do it one more time on the failed ones so that
        #  they can use the newly created shared resource.
        #
        try:
            try:
                artifact = g.ac.getArtifact(id, type)
                if artifact is None:
                    if type is None:
                        type = 'artifact'
                    raise Exception((_(u'No %(type)s identifed by: %(id)s')   % {"type":type,"id": id}).encode("utf-8"))
                if rev and member.id == artifact.creatorID:
                    if int(rev) != len(artifact.revisions):
                        raise Exception((_(u'%(rev)s is not the latest revision')  % {"rev":rev}).encode("utf-8"))
            except Exception, e:
                log.error('update artifact Exception[%s]' % str(e))
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                return ErrorCodes().asDict(c.errorCode, str(e))

            originalArtifactRevisionID = 0
            if artifact and artifact.revisions:
                originalArtifactRevisionID = artifact.revisions[0].id

            member = u.getImpersonatedMember(member)
            memberID = member.id
            termTypes = g.getBrowseTermTypes()
            memberRoleDict, memberRoleNameDict = g.getMemberRoles()

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                #
                #  Check and see if it's being finalized.
                #
                api._checkBookFinalizationLock(session, artifact.id)

                kwargs = api._constructUpdateArtifactArgs(session, artifact, request.params, member, bookTypes, termTypes, memberRoleDict, memberRoleNameDict, ArtifactCache())
                if (artifact.type.name == 'lesson' or \
                        (artifact.type.name == 'section' and str(request.params.get('upgradeToLesson')).lower() == 'true')):
                    kwargs['autoSplitLesson'] = str(request.params.get('autoSplitLesson')).lower() == 'true'
                    log.info("Calling update lesson")
                    if artifact.type.name == 'section':
                        kwargs['forceType'] = 'lesson'
                    artifact, concept = api._updateLesson(session, **kwargs)
                else:
                    artifact = api._updateArtifact(session, **kwargs)

            ##delete draft
            if originalArtifactRevisionID and memberID:
                api.deleteMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=originalArtifactRevisionID)
        except h.InvalidContentException as ice:
            log.error("updateArtifact: invalid rosetta: %s" % str(ice), exc_info=ice)
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTML_CONTENT, str(ice))
        except h.InvalidImageException as iie:
            log.error("updateArtifact: invalid image endpoints: %s" % str(iie), exc_info=iie)
            return ErrorCodes().asDict(ErrorCodes.INVALID_IMAGE_ENDPOINT, str(iie))
        except ex.AlreadyExistsException as aee:
            log.error("updateArtifact: already exists: %s" % str(aee), exc_info=aee)
            return ErrorCodes().asDict(ErrorCodes.ARTIFACT_ALREADY_EXIST, str(aee))
        except ex.EmptyArtifactHandleException as eahe:
            log.debug("updateArtifact: %s" % str(eahe), exc_info=eahe)
            return ErrorCodes().asDict(ErrorCodes.EMPTY_ARTIFACT_HANDLE, str(eahe))
        except ex.UnauthorizedException as uae:
            log.debug("updateArtifact: %s" % str(uae), exc_info=uae)
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(uae))

        ## Reindex
        taskId = h.reindexArtifacts([artifact.id], user=member.id)
        log.info("updateArtifact: reindex task id: %s" % taskId)
        #fire celery task to create cache:
        #cache_maker = mathcache.MathCacheTask()
        #cache_maker.delay(artifactID=artifact.id, user=member.id)

        ## Need to change type to lesson if forceType is specified (Bug #30281)
        log.debug("Using type: %s" % kwargs.get('forceType', type))
        return g.ac.getInfo(result, artifact.id, type=kwargs.get('forceType', type), artifact=artifact)

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def replaceRevisionContent(self, id, member):
        """
            Replace the content of the artifact revision, identified by id, without
            creating a new revision.

            Only admin is allowed to perform this operation.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.debug('replaceRevisionContent not admin')
                raise ex.UnauthorizedException((_(u'Only admin can replace contents.')).encode("utf-8"))

            xhtml = request.params.get('xhtml')
            if xhtml is None:
                log.debug('replaceRevisionContent no xhtml')
                raise ex.InvalidArgumentException((_(u'Missing content in xhtml.')).encode("utf-8"))
            try:
                xhtml = base64.b64decode(xhtml)
            except TypeError:
                log.warn("Unable to base64 decode 'xhtml'")

            log.debug('replaceRevisionContent calling api')
            a, ar = api.replaceRevisionContent(id=id, xhtml=xhtml)
            ArtifactCache().invalidate(a.id, id)
            log.debug('replaceRevisionContent ar[%s]' % ar)
            result['response']['artifact'] = ar.asContentDict()
            return result
        except ex.UnauthorizedException, ue:
            log.error('replaceRevisionContent: Exception[%s]' % str(ue), exc_info=ue)
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(ue))
        except ex.NotFoundException, nfe:
            log.error('replaceRevisionContent: Exception[%s]' % str(nfe), exc_info=nfe)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(nfe))
        except h.InvalidContentException, ice:
            log.error('replaceRevisionContent: Exception[%s]' % str(ice), exc_info=ice)
            c.errorCode = ErrorCodes.INVALID_HTML_CONTENT
            return ErrorCodes().asDict(c.errorCode, str(ice))
        except Exception, e:
            log.error('replaceRevisionContent: Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def publishArtifact(self, id, member):
        """
            Publishes the latest revision of the artifact identified by id.
            The logged in member must have the publish privilege on this
            artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_PUBLISH_ARTIFACT
        try:
            nonImpersonatedMemberID = None
            if member:
                nonImpersonatedMemberID = member.id
            member = u.getImpersonatedMember(member)
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(id)
            memberID = member.id
            artifact = g.ac.getArtifact(id)
            artifactRevision = artifact.revisions[0]
            u.checkOwner(member, artifact.creatorID, artifact)
            artifactRevision = api.publishArtifactRevision(
                                            artifactRevision=artifactRevision,
                                            memberID=memberID,
                                            cache=ArtifactCache(),
                                            nonImpersonatedMemberID=nonImpersonatedMemberID)

            #reindex
            taskId = h.reindexArtifacts([artifact.id], member.id, recursive=True)
            log.info("publish artifact[%s] Task id: %s" % (artifact.id, taskId))

            result['response']['artifactID'] = artifact.id
            result['response']['revisionID'] = artifactRevision.id
            result['response']['revision'] = artifactRevision.revision
            result['response']['title'] = artifact.name
            return result
        except Exception, e:
            log.error('publish artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def requestPublishRevision(self, id, member):
        """
            Request to publish the artifact revision identified by id.
            The logged in member must have the publish privilege on this
            artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_PUBLISH_ARTIFACT
        try:
            artifactRevision = api.getArtifactRevisionByID(id=id)
            artifact = artifactRevision.artifact
            u.checkOwner(member, artifact.creatorID, artifact)
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(artifact.id)

            req = api.getPublishRequest(memberID=member.id,
                                        artifactRevisionID=artifactRevision.id)
            if req is not None and len(req) > 0:
                try:
                    email = unicode(member.email, 'utf-8')
                    name = unicode(artifact.name, 'utf-8')
                except:
                    email = member.email.encode('utf-8')
                    name = artifact.name.encode('utf-8')
                raise Exception((_(u'Publish request from %(email)s for %(id)s[%(name)s] already made')  % {"email": email, "id": artifactRevision.id, "name": name}).encode("utf-8"))

            comments = request.params.get('comments')
            website = request.params.get('website')
            if website is None:
                website = 'http://www.ck12.org'
            api.createPublishRequest(member=member,
                                     artifactRevision=artifactRevision,
                                     comments=comments)

            try:
                data = {
                    'member': member.infoDict(),
                    'artifactRevision': artifactRevision.asDict(),
                    'comments': comments,
                    'website': website,
                }
                e = api.createEventForType(typeName='PUBLISH_REQUEST', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=member.id, processInstant=False)
                n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifact.id, objectType='artifact', address=config.get('publish_email_to'), subscriberID=member.id, type='email', frequency='instant')
                h.processInstantNotifications([e.id], notificationIDs=[n.id], user=member.id, noWait=False)
                
            except Exception, en:
                log.error('request publish revision: Unable to send email[%s]' % en, exc_info=en)

            result['response']['artifactID'] = artifact.id
            result['response']['revisionID'] = artifactRevision.id
            result['response']['revision'] = artifactRevision.revision
            result['response']['title'] = artifact.name
            return result
        except Exception, e:
            log.error('request publish revision Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def publishArtifactRevision(self, id, member):
        """
            Publishes the artifact revision identified by id. The logged in
            member must have the publish privilege on this artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_PUBLISH_ARTIFACT
        try:
            typeName = request.params.get('contributionType', 'original')
            if not typeName or typeName not in ['original', 'derived', 'modified']:
                raise Exception((_(u'Argument contributionType is missing or invalid.')).encode("utf-8"))

            nonImpersonatedMemberID = None
            if member:
                nonImpersonatedMemberID = member.id
            member = u.getImpersonatedMember(member)
            memberID = member.id
            artifactRevision = api.getArtifactRevisionByID(id=id)
            artifact = artifactRevision.artifact
            u.checkOwner(member, artifact.creatorID, artifact)
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(artifact.id)

            artifactRevision = api.publishArtifactRevision(
                                            artifactRevision=artifactRevision,
                                            memberID=memberID,
                                            cache=ArtifactCache(),
                                            nonImpersonatedMemberID=nonImpersonatedMemberID)

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                artifactRevision = api._getArtifactRevisionByID(session, id=id)
                artifact = artifactRevision.artifact
                u.checkOwner(member, artifact.creatorID, artifact, session=session)
                api._createArtifactContributionType(session, artifactID=artifact.id, typeName=typeName)
                artifactRevision = api._publishArtifactRevision(
                                                session,
                                                artifactRevision=artifactRevision,
                                                memberID=memberID,
                                                cache=ArtifactCache(),
                                                nonImpersonatedMemberID=nonImpersonatedMemberID)

            #reindex
            taskId = h.reindexArtifacts([artifact.id], member.id, recursive=True)
            log.info("create artifact[%s] Task id: %s" % (artifact.id, taskId))

            try:
                data = {
                    'artifactRevisionID': artifactRevision.id
                }
                members = []
                user = {'id': member.id, 'email': member.email}
                members.append(user)
                if (member.id != artifact.creatorID):
                    creator = {'id': artifact.creatorID, 'email': api.getMemberByID(artifact.creatorID).email}
                    members.append(creator)
                for member in members:
                    if member['id'] != 3 or str(config.get('send_notifications_to_ck12editor')).lower() == 'true':
                        e = api.createEventForType(typeName='ARTIFACT_PUBLISHED', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=member.get('id'), processInstant=False)
                        n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifact.id, objectType='artifact', address=member.get('email'), subscriberID=member.get('id'), type='email', frequency='instant')
                        h.processInstantNotifications([e.id], notificationIDs=[n.id], user=member.get('id'), noWait=False)
            
                if request.params and request.params.get('autorizedBy') and request.params.get('publishedComments') and str(config.get('send_notifications_to_ck12editor')).lower() == 'true':
                    authorizedBy = request.params.get('autorizedBy')
                    publishedComments = request.params.get('publishedComments')
                    data = {
                            'artifactRevision': artifactRevision.id,
                            'reason': publishedComments,
                            'authorizedBy' : authorizedBy
                            }
                    e = api.createEventForType(typeName='ARTIFACT_PUBLISHED_INFORMATION', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), processInstant=False)
                    n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifact.id, objectType='artifact', address=config.get('publish_email_to'), subscriberID=config.get('published_email_to_user_id'), type='email', frequency='instant')
                    h.processInstantNotifications([e.id], notificationIDs=[n.id], user=config.get('published_email_to_user_id'), noWait=False)

            except Exception, en:
                log.error('publish revision: Unable to send email[%s]' % en, exc_info=en)
            
            result['response']['artifactID'] = artifact.id
            result['response']['revisionID'] = artifactRevision.id
            result['response']['revision'] = artifactRevision.revision
            result['response']['title'] = artifact.name
            return result
        except Exception, e:
            log.error('publish artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def unpublishArtifact(self, id, member):
        """
            Unpublishes the latest revision of the artifact identified by id.
            The logged in member must have the publish privilege on this
            artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_UNPUBLISH_ARTIFACT
        try:
            nonImpersonatedMemberID = None
            if member:
                nonImpersonatedMemberID = member.id
            member = u.getImpersonatedMember(member)
            artifact = g.ac.getArtifact(id)
            artifactRevision = artifact.revisions[0]
            u.checkOwner(member, artifact.creatorID, artifact)
            artifactRevision = api.unpublishArtifactRevision(
                                            artifactRevision=artifactRevision,
                                            memberID=member.id,
                                            cache=ArtifactCache(),
                                            nonImpersonatedMemberID=nonImpersonatedMemberID)
            #reindex
            taskId = h.reindexArtifacts([artifact.id], member.id, recursive=True)
            log.info("unpublish artifact[%s] Task id: %s" % (artifact.id, taskId))

            log.info('artifact[%s]' % artifact)
            log.info('artifactRevision[%s]' % artifactRevision)
            result['response']['artifactID'] = artifact.id
            result['response']['revisionID'] = artifactRevision.id
            result['response']['revision'] = artifactRevision.revision
            result['response']['title'] = artifact.name
            return result
        except Exception, e:
            log.error('unpublish artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def unpublishArtifactRevision(self, id, member):
        """
            Unpublishes the artifact revision identified by id. The logged in
            member must have the publish privilege on this artifact.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_UNPUBLISH_ARTIFACT
        try:
            nonImpersonatedMemberID = None
            if member:
                nonImpersonatedMemberID = member.id
            member = u.getImpersonatedMember(member)
            artifactRevision = api.getArtifactRevisionByID(id=id)
            artifact = artifactRevision.artifact
            u.checkOwner(member, artifact.creatorID, artifact)
            artifactRevision = api.unpublishArtifactRevision(
                                            artifactRevision=artifactRevision,
                                            memberID=member.id,
                                            cache=ArtifactCache(),
                                            nonImpersonatedMemberID=nonImpersonatedMemberID)
            #reindex
            taskId = h.reindexArtifacts([artifact.id], member.id, recursive=True)
            log.info("unpublish artifact revision[%s] Task id: %s" % (artifact.id, taskId))

            log.info('artifact[%s]' % artifact)
            log.info('artifactRevision[%s]' % artifactRevision)
            result['response']['artifactID'] = artifact.id
            result['response']['revisionID'] = artifactRevision.id
            result['response']['revision'] = artifactRevision.revision
            result['response']['title'] = artifact.name
            return result
        except Exception, e:
            log.error('unpublish artifact Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def updateResourceHash(self):
        """
            Recalculates the MD5 hash for all resources.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            api.updateResourceHash()
            return result
        except Exception, e:
            log.error('update resource hash Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_RESOURCE_HASH
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def findCircularDependency(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            msgs = []
            pageNum = 1
            pageSize = 64
            while True:
                log.info("pageNum=%d" % pageNum)
                artifacts = api.getArtifacts(pageNum=pageNum, pageSize=pageSize)
                if not artifacts:
                    break
                for artifact in artifacts:
                    ancestors = api.getArtifactAncestors(artifactID=artifact.id)
                    for ancestor in ancestors:
                        if ancestor['parentID'] == artifact.id:
                            msgs.append("Artifact %d is an ancestor of itself" % artifact.id)
                            break
                pageNum += 1
            log.info("Messages: %s" % msgs)
            result['response']['messages'] = msgs
            return result
        except Exception, e:
            log.error('findCircularDependency Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['type', 'id', 'artifactTypes'])
    @beaker_cache(expire=864000, query_args=False)
    def getExtendedArtifacts(self, id, type=None, artifactTypes='artifact'):
        """
            Retrieves metadata information for all extended artifacts associated with
            the given artifact using id.
            Supported artifactTypes are: book, tebook, workbook, studyguide, labkit
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if type == 'artifact':
                type = None
            artifact = api.getArtifactByID(id=int(id), typeName=type)
            if not artifact:
                raise Exception((_(u'No such artifact: %(id)d type: %(type)s')  % {"id":id,"type": type}).encode("utf-8"))

            artifactTypes = [ x.strip() for x in artifactTypes.split(',') ]
            if 'artifact' in artifactTypes:
                artifactTypes = None

            member = u.getCurrentUser(request, anonymousOkay=True)

            artifacts = api.getExtendedArtifacts(artifact=artifact, memberID=member.id, artifactTypes=artifactTypes, countOnly=False) 
            result['response']['extendedArtifacts'] = artifacts
            return result
        except Exception, e:
            log.error('get extended artifacts Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getArtifactTypes(self, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            modalitiesOnly = str(request.params.get('modalitiesOnly')).lower() == 'true'
            types = api.getArtifactTypes(modalitiesOnly=modalitiesOnly, pageNum=pageNum, pageSize=pageSize)
            result['response']['artifactTypes'] = [ t.asDict() for t in types ]
            result['response']['total'] = types.getTotal()
            result['response']['limit'] = len(types)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception, e:
            log.error("Error getting artifact types: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LIST_ARTIFACT_TYPES
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def updateArtifactUserNotification(self, id, member):
        """
            Update Artifact Revision Updated email notifications and web notificaitons.
            @subscriberID, sendEmailNotification = both specified in request and user is not admin, raise exception
            @subscriberID = if only subscriberID is specified, check and update user specific ARTIFACT_NEW_REVISION_AVAILABLE
                and ARTIFACT_NEW_REVISION_AVAILABLE_WEB notification and events
            Only Admin User is allowed to update artifact revision updated notifications.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.CANNOT_UPDATE_ARTIFACT
        try:
            subscriberID = request.params.get('subscriberID', None)
            sendEmailNotification = request.params.get('sendEmailNotification', 'false').lower() == 'true'
            if subscriberID and not u.isMemberAdmin(member):
                if sendEmailNotification:
                    raise ex.UnauthorizedException((_(u'Only admin can update artifact revision user notification.')).encode("utf-8"))
            if id is None:
                raise Exception((_(u'No Artifact ID specified.')).encode("utf-8"))
            member = u.getImpersonatedMember(member)
            #Don't create notification for guest user login/donwloads
            if member.login == 'guest':
                raise Exception((_(u"Guest user login can't call this API.")).encode("utf-8"))
            if isinstance(id, str) or isinstance(id, unicode):
                id = int(id)
            artifact = api.getArtifactByID(id=id)
            isBook = artifact.getArtifactType() in bookTypes
            if request.params.has_key('messageToUsers') and request.params.get('messageToUsers') != artifact.getMessageToUsers():
                #self.updateArtifact(member=member, id=artifact.id, type=None)
                artifactRevision = artifact.revisions[0]
                artifactRevision.messageToUsers = request.params.get('messageToUsers')
                api.update(instance=artifactRevision)
                ArtifactCache().invalidate(artifact.id, artifactRevision.id)
            #artifactRevision = api.updateArtifactRevisionUserNotification(**kwargs)
            data = {
                            'artifact': artifact.id,
                            'isBook': isBook,
                            'artifactTypeName' : "FlexBook&#174; Textbook" if isBook else "Read Resource",
                            'title': artifact.getTitle(),
                            'handle': artifact.getHandle(),
                            'message': request.params.get('messageToUsers', None),
                            'artifact_url': request.params.get('artifact_url'),
                            'cover_img': artifact.revisions[0].getCoverImageUri(returnWithID=False)
                    }

            #Update Email notifications
            artifactEventType = api.getEventTypeByName('ARTIFACT_NEW_REVISION_AVAILABLE')
            notificationFilters = (('eventTypeID', artifactEventType.id), ('objectType', 'artifact'), ('type', 'email'), ('objectID', artifact.id))
            if subscriberID:
                notificationFilters = notificationFilters + (('subscriberID', subscriberID), )
            notifications = api.getNotificationsByFilter(filters=notificationFilters)
            
            newsLetterEventType = api.getEventTypeByName('NEWSLETTER_PUBLISHED')
            if not notifications and subscriberID:
                #User notification doen't exists create new one
                tmpMember = api.getMemberByID(subscriberID)
                memberName = 'Member'
                if tmpMember:
                    memberName = tmpMember.givenName
                    if tmpMember.surname:
                        memberName = '%s %s' %(memberName, tmpMember.surname)
                data['memberName'] = memberName
                #Create notification event for artifact only when notification is to be sent.
                #e = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=tmpMember.id, subscriberID=tmpMember.id, processInstant=False)
                api.createNotification(eventTypeID=artifactEventType.id, objectID=artifact.id, objectType='artifact', address=tmpMember.email, subscriberID=tmpMember.id, type='email', frequency='off')
            else:
                for notification in notifications:
                    tmpMember = api.getMemberByID(notification.subscriberID)
                    memberName = 'Member'
                    if tmpMember:
                        memberName = tmpMember.givenName
                        if tmpMember.surname:
                            memberName = '%s %s' %(memberName, tmpMember.surname)
                    data['memberName'] = memberName
                    kwargs = {}
                    kwargs['id'] = notification.id
                    kwargs['resetLastSent'] = True
                    kwargs['frequency'] = 'instant' if int(request.params.get('notifyUsers', 0)) == 1 else 'off'
                    notification = api.updateNotification(**kwargs)
                    if sendEmailNotification:
                        #check user newsletter notification is enabled or not
                        newsletter_notification = api.getUniqueNotification(eventTypeID=newsLetterEventType.id, subscriberID=tmpMember.id, type='email')
                        if newsletter_notification and (newsletter_notification.asDict())['frequency'] != 'off':
                            filters = (('subscriberID', tmpMember.id), ('objectType', 'artifact'), ('objectID', notification.objectID), ('eventTypeID', artifactEventType.id))
                            event = api.getEventsByFilters(filters=filters, pageNum=1, pageSize=1)
                            if not event:
                                event = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=tmpMember.id, subscriberID=tmpMember.id, processInstant=False)
                            else:
                                event = event[0]

                            h.processInstantNotifications([event.id], notificationIDs=[notification.id], user=tmpMember.id, noWait=False)
            
            #Update Web notifications
            artifactEventType = api.getEventTypeByName('ARTIFACT_NEW_REVISION_AVAILABLE_WEB')
            notificationFilters = (('eventTypeID', artifactEventType.id), ('objectType', 'artifact'), ('type', 'web'), ('objectID', artifact.id))
            if subscriberID:
                notificationFilters = notificationFilters + (('subscriberID', subscriberID), )
            notifications = api.getNotificationsByFilter(filters=notificationFilters)
            
            if not notifications and subscriberID:
                #User notification doen't exists create new one
                tmpMember = api.getMemberByID(subscriberID)
                memberName = 'Member'
                if tmpMember:
                    memberName = tmpMember.givenName
                    if tmpMember.surname:
                        memberName = '%s %s' %(memberName, tmpMember.surname)
                data['memberName'] = memberName
                #Create notification event for artifact only when notification is to be sent.
                #web_event = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE_WEB', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=tmpMember.id, subscriberID=tmpMember.id, processInstant=False)
                api.createNotification(eventTypeID=artifactEventType.id, objectID=artifact.id, objectType='artifact', address=tmpMember.email, subscriberID=tmpMember.id, type='web', frequency='off')
            else:
                for notification in notifications:
                    tmpMember = api.getMemberByID(notification.subscriberID)
                    memberName = 'Member'
                    if tmpMember:
                        memberName = tmpMember.givenName
                        if tmpMember.surname:
                            memberName = '%s %s' %(memberName, tmpMember.surname)
                    data['memberName'] = memberName
                    filters = (('subscriberID', tmpMember.id), ('objectType', 'artifact'), ('objectID', notification.objectID), ('eventTypeID', artifactEventType.id))
                    event = api.getEventsByFilters(filters=filters, pageNum=1, pageSize=1)
                    #if user dismisses notificaiton from paper plane system, event gets deleted so create new one for user
                    if not event:
                        event = api.createEventForType(typeName='ARTIFACT_NEW_REVISION_AVAILABLE_WEB', objectID=artifact.id, objectType='artifact', eventData=json.dumps(data, default=h.toJson), ownerID=tmpMember.id, subscriberID=tmpMember.id, processInstant=False)
                    else:
                        event = event[0]
                        event.created = datetime.now()
                        event.eventData = json.dumps(data, default=h.toJson)
                        api.update(instance=event)
                    kwargs = {}
                    kwargs['id'] = notification.id
                    kwargs['resetLastSent'] = True
                    kwargs['frequency'] = 'ondemand' if int(request.params.get('notifyUsers', 0)) == 1 else 'off'
                    notification = api.updateNotification(**kwargs)
            result['response']['artifactID'] = artifact.id
            return result
        except Exception, e:
            log.error('Update Artifact User Notification Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactID', 'typeName'])
    @d.trace(log, ['artifactID', 'typeName'])
    def createArtifactContributionType(self, artifactID, typeName):
        """
            Create a ContributionType artifact .
        """      
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                 
            if not artifactID or typeName not in ['original', 'derived', 'modified']:
                raise Exception((_(u'Argument missing or invalid.')).encode("utf-8"))
            
            artifactID= int(artifactID)
           
            # Adding artifactID, typeName in to table
            data = api.createArtifactContributionType(artifactID=artifactID, typeName=typeName )
            
            log.debug('create Artifact Contribution Type result :   %s ' %  result )
            if not data.artifactID :
                raise data
                        
            result['response']['artifactID']=artifactID
            result['response']['typeName']=typeName
            return result
        
        except Exception, e:
            log.error('create Artifact Contribution Type Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _aPartOf(self, session, book, artifact):
        """
            See if the given artifact is part of the book.
        """
        parents = api._getArtifactParentsByCreatorID(session, artifact.id, artifact.creatorID)
        if parents:
            #
            #  Look for match.
            #
            for parent in parents:
                if parent.id == book.id:
                    return True
            #
            #  Look for match at parent level.
            #
            for parent in parents:
                if self._aPartOf(session, book, parent):
                    return True
        return False

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactID', 'bookID', 'assigneeID'])
    @d.trace(log, ['member', 'artifactID', 'bookID', 'assigneeID'])
    def assignGroupEditing(self, member, artifactID, bookID, assigneeID=None):
        """
            Assign a chapter/section, identified by artifactID, of a book,
            identified by bookID, to member, identified by assigneeID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            if not assigneeID:
                assigneeID = request.params.get('assigneeID', None)
            if not assigneeID:
                raise ex.MissingArgumentException(_(u'Missing assigneeID').encode("utf-8"))

            try:
                assigneeID = base64.b64decode(assigneeID)
            except Exception:
                pass

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                book = api._getArtifactByID(session, id=bookID)
                if not book:
                    c.errorCode = ErrorCodes.NO_SUCH_BOOK
                    raise ex.InvalidArgumentException((_(u'Unknown book, %(bookID)s.' % {'bookID':bookID})).encode("utf-8"))
                if book.type.name not in bookTypes:
                    raise ex.InvalidArgumentException((_(u'Artifact, %(artifactID)s[%(artifactName)s], is not a book.' % {'artifactID':artifactID, 'artifactName':book.name})).encode("utf-8"))
                if book.creatorID != memberID:
                    raise ex.InvalidArgumentException((_(u'Not creator of book, %(bookID)s[%(bookName)s].' % {'bookID':bookID, 'bookName':book.name})).encode("utf-8"))

                assignee = api._getMember(session, id=assigneeID)
                if not assignee:
                    raise ex.InvalidArgumentException((_(u'Unknown assignee, %(assigneeID)s.' % {'assigneeID':assigneeID})).encode("utf-8"))

                artifact = api._getArtifactByID(session, id=artifactID)
                if not artifact:
                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                    raise ex.InvalidArgumentException((_(u'Unknown artifact, %(artifactID)s.' % {'artifactID':artifactID})).encode("utf-8"))
                if artifact.type.name not in ['lesson', 'section']:
                    c.errorCode = ErrorCodes.INVALID_TYPE
		    raise ex.InvalidArgumentException((_(u'Invalid type of the artifact, %(artifactID)s[%(artifactName)s].' % {'artifactID':artifact.id, 'artifactName':artifact.name})).encode("utf-8"))
                if artifact.creatorID != book.creatorID:
		    raise ex.InvalidArgumentException((_(u'Not creator of %(type)s, %(artifactID)s[%(artifactName)s].' % {'type':artifact.type.name, 'artifactID':artifact.id, 'artifactName':artifact.name})).encode("utf-8"))
                if not self._aPartOf(session, book, artifact):
                    raise ex.InvalidArgumentException((_(u'Artifact, %(artifactID)s is not part of the book, %(bookID)s.' % {'artifactID':artifact.id, 'bookID':book.id})).encode("utf-8"))
                log.debug('assignGroupEditing: artifact.id[%s]' % artifact.id)

                groupHandle = '%s-Editing-%s' % (memberID, bookID)
                group = api._getGroupByHandle(session, handle=groupHandle)
                if not group:
                    raise ex.NotFoundException((_(u'No active editing group for member, %(memberID)s, on book, %(bookID)s.' % {'memberID':memberID, 'bookID':bookID})).encode("utf-8"))
                log.debug('assignGroupEditing: group[%s]' % group)

                m = api._getMemberGroup(session, id=assignee.id, groupID=group.id)
                log.debug('assignGroupEditing: m[%s]' % m)
                if not m:
                    raise ex.InvalidArgumentException((_(u'Member, %(assigneeID)s, has not been assigned to book, %(bookID)s' % {'assigneeID':assigneeID, 'bookID':bookID})).encode("utf-8"))

                if group.creatorID == assignee.id:
                    c.errorCode = ErrorCodes.INVALID_ARGUMENT
                    return ErrorCodes().asDict(c.errorCode, 'No need to assign group owner as a member.')

                if artifact.type.name != 'chapter':
                    bookEditingAssignments = api._getBookEditingAssignments(session, artifactID=artifactID)
                    if bookEditingAssignments:
                        c.errorCode = ErrorCodes.ASSIGNMENT_ALREADY_ASSIGNED
                        raise ex.AlreadyExistsException((_(u'Artifact %(artifactID)s already assigned to %(assigneeID)s')  % {'artifactID':artifactID, 'assigneeID':bookEditingAssignments[0].assigneeID}).encode("utf-8"))
                    bookEditingAssignment = api._createBookEditingAssignment(session, assignee, book, artifact, group)
                    result['response']['bookEditingAssignment'] = bookEditingAssignment.asDict()

                    revision = artifact.revisions[0]
                    bookEditingDrafts = api._getBookEditingDrafts(session, artifactRevisionID=revision.id)
                    if bookEditingDrafts:
                        #
                        #  Switch the assignee if BookEditingDraft entry already exists.
                        #
                        for bookEditingDraft in bookEditingDrafts:
                            bookEditingDraft.assigneeID = assignee.id
                            session.add(bookEditingDraft)
                    else:
                        #
                        #  Create the BookEditingDraft entry if a draft by the owner already exists.
                        #
                        draft = api._getMemberArtifactDraftByArtifactRevisionID(session, memberID, revision.id)
                        if draft:
                            beDraft = api._createBookEditingDraft(session, artifactRevisionID=revision.id, assigneeID=assignee.id)
                            log.debug('assignGroupEditing: beDraft[%s]' % beDraft)
                else:
                    #
                    #  The following is not supported for now.
                    #
                    bookEditingAssignments = []
                    children = artifact.revisions[0].children
                    for child in children:
                        lesson = child.artifact
                        bookEditingAssignments = api._getBookEditingAssignments(session, artifactID=lesson.id)
                        if bookEditingAssignments:
                            c.errorCode = ErrorCodes.ASSIGNMENT_ALREADY_ASSIGNED
                            raise ex.AlreadyExistsException((_(u'Artifact %(artifactID)s already assigned to %(assigneeID)s')  % {'artifactID':artifactID, 'assigneeID':bookEditingAssignments[0].assigneeID}).encode("utf-8"))
                        bookEditingAssignment = api._createBookEditingAssignment(session, assignee, book, artifact, group)
                        bookEditingAssignments.append(bookEditingAssignment.asDict())
                    result['response']['bookEditingAssignments'] = bookEditingAssignments
                    raise Exception((_(u'Editing of chapter not yet supported.')).encode("utf-8"))

            return result
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactID', 'bookID', 'assigneeID'])
    @d.trace(log, ['member', 'artifactID', 'bookID', 'assigneeID'])
    def unassignGroupEditing(self, member, artifactID, bookID, assigneeID=None):
        """
            Unassign a chapter/section, identified by artifactID, of a book,
            identified by bookID, to member, identified by assigneeID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            if not assigneeID:
                assigneeID = request.params.get('assigneeID', None)
                if assigneeID:
                    try:
                        assigneeID = base64.b64decode(assigneeID)
                    except Exception:
                        pass
            if not assigneeID:
                raise ex.MissingArgumentException(_(u'Missing assigneeID').encode("utf-8"))

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                book = api._getArtifactByID(session, id=bookID)
                if not book:
                    c.errorCode = ErrorCodes.NO_SUCH_BOOK
                    raise ex.InvalidArgumentException((_(u'Unknown book, %(bookID)s.' % {'bookID':bookID})).encode("utf-8"))
                if book.type.name not in bookTypes:
                    c.errorCode = ErrorCodes.INVALID_TYPE
                    raise ex.InvalidArgumentException((_(u'Artifact, %(artifactID)s[%(artifactName)s], is not a book.' % {'artifactID':artifactID, 'artifactName':book.name})).encode("utf-8"))
                if book.creatorID != memberID:
                    raise ex.InvalidArgumentException((_(u'Not creator of book, %(bookID)s[%(bookName)s].' % {'bookID':bookID, 'bookName':book.name})).encode("utf-8"))

                assignee = api._getMember(session, id=assigneeID)
                if not assignee:
                    raise ex.InvalidArgumentException((_(u'Unknown assignee, %(assigneeID)s.' % {'assigneeID':assigneeID})).encode("utf-8"))

                artifact = api._getArtifactByID(session, id=artifactID)
                if not artifact:
                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                    raise ex.InvalidArgumentException((_(u'Unknown artifact, %(artifactID)s.' % {'artifactID':artifactID})).encode("utf-8"))
                if artifact.type.name not in ['lesson', 'section']:
                    c.errorCode = ErrorCodes.INVALID_TYPE
                    raise ex.InvalidArgumentException((_(u'Invalid type of artifact, %(artifactID)s.' % {'artifactID':artifactID})).encode("utf-8"))

                bookEditingAssignments = api._getBookEditingAssignments(session, bookID=bookID, assigneeID=assignee.id, artifactID=artifactID)
                if not bookEditingAssignments or len(bookEditingAssignments) == 0:
                    c.errorCode = ErrorCodes.NOT_YET_ASSIGNED
                    raise ex.NotFoundException((_(u'The artifact, %(artifactID)s, of book, %(bookID)s, was not assigned to %(assigneeID)s.' % {'artifactID':artifactID, 'bookID':bookID, 'assigneeID':assigneeID})).encode("utf-8"))

                if bookEditingAssignments and len(bookEditingAssignments) > 0:
                    bookEditingAssignment = bookEditingAssignments[0]
                    session.delete(bookEditingAssignment)
                    result['response']['bookEditingAssignments'] = bookEditingAssignment.asDict()
                    #
                    #  Delete the BookEditingDraft entry if it already exists.
                    #
                    bookEditingDrafts = api._getBookEditingDrafts(session, artifactRevisionID=artifact.revisions[0].id)
                    for bookEditingDraft in bookEditingDrafts:
                        log.debug('unassignGroupEditing: bookEditingDraft[%s]' % bookEditingDraft)
                        session.delete(bookEditingDraft)
                else:
                    result['response']['bookEditingAssignments'] = {}
            return result
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['bookID'])
    @d.trace(log, ['member', 'bookID'])
    def getGroupEditingAssignments(self, member, bookID=None):
        """
            Get assigned info of a book, identified by bookID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            memberID = member.id
            artifactID = request.params.get('artifactID', None)
            assigneeID = request.params.get('assigneeID', None)
            creatorID = request.params.get('creatorID', None)
            activeOnly = request.params.get('activeOnly', 'true').lower() == 'true'

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                if bookID:
                    book = api._getArtifactByID(session, id=bookID)
                    if not book:
                        c.errorCode = ErrorCodes.NO_SUCH_BOOK
                        raise ex.InvalidArgumentException((_(u'Unknown book, %(bookID)s.' % {'bookID':bookID})).encode("utf-8"))
                    if book.creatorID != memberID and assigneeID is None:
                        assigneeID = memberID

                bookEditingAssignments = api._getBookEditingAssignmentsWithARID(session, bookID=bookID, assigneeID=assigneeID, artifactID=artifactID, creatorID=creatorID, activeOnly=activeOnly)
                if bookEditingAssignments:
                    assignments = []
                    for assignment, arid, email in bookEditingAssignments:
                        assignmentDict = assignment.asDict()
                        assignmentDict['artifactRevisionID'] = arid
                        assignmentDict['assigneeEmail'] = email
                        assignments.append(assignmentDict)
                    result['response']['bookEditingAssignments'] = assignments
                else:
                    result['response']['bookEditingAssignments'] = []
            return result
        except Exception, e:
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_CREATE_ASSIGNMENT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['bookID'])
    @d.trace(log, ['member', 'bookID'])
    def getEditingDrafts(self, member, bookID):
        """
            Get editing draft info of a book, identified by bookID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            drafts = []
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                book = api._getArtifactByID(session, id=bookID)
                if not book:
                    c.errorCode = ErrorCodes.NO_SUCH_BOOK
                    raise ex.InvalidArgumentException((_(u'Unknown book, %(bookID)s.' % {'bookID':bookID})).encode("utf-8"))
                if book.creatorID != memberID:
                    c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                    raise ex.UnauthorizedException((_(u'Only creator can get this inforamtion.')).encode("utf-8"))
                bookEditingAssignments = api._getBookEditingAssignments(session, bookID=bookID)
                if bookEditingAssignments:
                    for assignment in bookEditingAssignments:
                        query = session.query(model.ArtifactDraft, model.Artifact.name)
                        query = query.join(model.ArtifactRevision, model.ArtifactRevision.id == model.ArtifactDraft.artifactRevisionID)
                        query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
                        query = query.filter(model.Artifact.id == assignment.artifactID)
                        query = query.order_by(model.ArtifactDraft.artifactRevisionID.desc())
                        data = query.first()
                        if data:
                            draft, title = data
                            drafts.append({
                                'id': draft.id,
                                'artifactID': assignment.artifactID,
                                'artifactRevisionID': draft.artifactRevisionID,
                                'typeID': draft.artifactTypeID,
                                'title': title,
                                'handle': draft.handle,
                                'creatorID': draft.creatorID,
                            })
            result['response']['drafts'] = drafts
            return result
        except Exception, e:
            log.debug('getEditingDrafts: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_GET_FEATURED_ARTIFACT_LIST
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactID'])
    @d.trace(log, ['member', 'artifactID'])
    def checkEditingAuthority(self, member, artifactID):
        """
            Check if member is authorized to create/update an artifact draft.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                artifact = api._getArtifactByID(session, id=artifactID)
                if not artifact:
                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                    raise ex.InvalidArgumentException((_(u'Unknown artifact, %(artifactID)s.' % {'artifactID':artifactID})).encode("utf-8"))
                if artifact.type.name not in ['lesson', 'section']:
                    c.errorCode = ErrorCodes.INVALID_TYPE
                    raise ex.InvalidArgumentException((_(u'Invalid type of the artifact, %(artifactID)s.' % {'artifactID':artifactID})).encode("utf-8"))

                api._authorizeBookEditing(session, memberID, member.email, api.BOOK_EDITING_CREATE, artifact.creatorID, artifact.id)
            result['response'] = 'authorized'
            return result
        except Exception, e:
            log.debug('checkEditingAuthority: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactRevisionID'])
    @d.trace(log, ['member', 'artifactRevisionID'])
    def startBookEditingDraft(self, member, artifactRevisionID):
        """
            Indicate that member is about to edit content identified by artifactRevisionID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                revision = api._getArtifactRevisionByID(session, id=artifactRevisionID)
                if not revision:
                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                    raise ex.InvalidArgumentException((_(u'Unknown artifact revision, %(artifactRevisionID)s.' % {'artifactRevisionID':artifactRevisionID})).encode("utf-8"))

                artifact = revision.artifact
                if artifact.type.name not in ['lesson', 'section']:
                    c.errorCode = ErrorCodes.INVALID_TYPE
                    raise ex.InvalidArgumentException((_(u'Invalid type of the artifact, %(artifactID)s.' % {'artifactID':artifact.id})).encode("utf-8"))

                bookEditingAssignments = api._getBookEditingAssignments(session, assigneeID=memberID, artifactID=artifact.id)
                if not bookEditingAssignments:
                    c.errorCode = ErrorCodes.NOT_YET_ASSIGNED
                    raise ex.InvalidArgumentException((_(u'Artifact, %(artifactID)s is not assigned to, %(assigneeID)s.' % {'artifactID':artifact.id, 'assigneeID':memberID})).encode("utf-8"))

                bookEditingDrafts = api._getBookEditingDrafts(session, artifactRevisionID=revision.id, assigneeID=memberID)
                if bookEditingDrafts:
                    c.errorCode = ErrorCodes.ALREADY_EDITING
                    raise ex.InvalidArgumentException((_(u'Artifact revision, %(artifactRevisionID)s is already being edited.' % {'artifactRevisionID':artifactRevisionID})).encode("utf-8"))

                bookEditingDraft = api._createBookEditingDraft(session, artifactRevisionID=revision.id, assigneeID=memberID)
                result['response']['started'] = bookEditingDraft.asDict()
            return result
        except Exception, e:
            log.debug('startBookEditingDraft: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_START
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactRevisionID'])
    @d.trace(log, ['member', 'artifactRevisionID'])
    def stopBookEditingDraft(self, member, artifactRevisionID):
        """
            Indicate that member is about to stop editing content identified by artifactRevisionID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                bookEditingDrafts = api._getBookEditingDrafts(session, artifactRevisionID=artifactRevisionID, assigneeID=memberID)
                if not bookEditingDrafts:
                    c.errorCode = ErrorCodes.NOT_YET_EDITING
                    raise ex.InvalidArgumentException((_(u'Artifact revision, %(artifactRevisionID)s is not being edited.' % {'artifactRevisionID':artifactRevisionID})).encode("utf-8"))

                bookEditingDraft = bookEditingDrafts[0]
                bookEditingDraftDict = bookEditingDraft.asDict()
                session.delete(bookEditingDraft)
                log.debug('stopBookEditingDraft: deleted')
                result['response']['stopped'] = bookEditingDraftDict
            return result
        except Exception, e:
            log.debug('startBookEditingDraft: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_STOP
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, ['artifactRevisionID'])
    @d.trace(log, ['member', 'artifactRevisionID'])
    def getBookEditingDraft(self, member, artifactRevisionID):
        """
            Get the member editing content identified by artifactRevisionID.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                revision = api._getArtifactRevisionByID(session, id=artifactRevisionID)
                if not revision:
                    c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                    raise ex.InvalidArgumentException((_(u'Unknown artifact revision, %(artifactRevisionID)s.' % {'artifactRevisionID':artifactRevisionID})).encode("utf-8"))

                artifact = revision.artifact
                if artifact.type.name not in ['lesson', 'section']:
                    c.errorCode = ErrorCodes.INVALID_TYPE
                    raise ex.InvalidArgumentException((_(u'Invalid type of the artifact, %(artifactID)s.' % {'artifactID':artifact.id})).encode("utf-8"))

                bookEditingAssignments = api._getBookEditingAssignments(session, artifactID=artifact.id)
                if not bookEditingAssignments:
                    c.errorCode = ErrorCodes.NOT_YET_ASSIGNED
                    raise ex.InvalidArgumentException((_(u'Artifact, %(artifactID)s is not yet assigned.' % {'artifactID':artifact.id})).encode("utf-8"))

                bookEditingAssignment = bookEditingAssignments[0]
                if bookEditingAssignment.assigneeID != memberID or artifact.creatorID != memberID:
                    if not api._isGroupAdmin(session, groupID=1, memberID=memberID):
                        c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        raise ex.UnauthorizedException((_(u'Only owner or collaborator can get this inforamtion.')).encode("utf-8"))

                bookEditingDrafts = api._getBookEditingDrafts(session, artifactRevisionID=artifactRevisionID)
                if not bookEditingDrafts:
                    bookEditingDraftDict = {}
                else:
                    bookEditingDraft = bookEditingDrafts[0]
                    bookEditingDraftDict = bookEditingDraft.asDict()
                    if bookEditingDraft.assigneeID != memberID:
                        member = api._getMemberByID(session, id=bookEditingDraft.assignmentID)
                    bookEditingDraftDict['assigneeEmail'] = member.email
                result['response']['editingDraft'] = bookEditingDraftDict
            return result
        except Exception, e:
            log.debug('getBookEditingDraft: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_RETRIEVE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def getMyBookEditingDrafts(self, member):
        """
            Get all editing drafts being edited by this member.
        """      
        c.errorCode = ErrorCodes.OK
        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            memberID = member.id
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                bookEditingDrafts = api._getBookEditingDrafts(session, assigneeID=memberID)
                bookEditingDraftList = []
                for bookEditingDraft in bookEditingDrafts:
                    bookEditingDraftDict = bookEditingDraft.asDict()
                    bookEditingDraftList.append(bookEditingDraftDict)
                result['response']['editingDrafts'] = bookEditingDraftList
            return result
        except Exception, e:
            log.debug('startBookEditingDraft: exception[%s]' % str(e))
            if c.errorCode == ErrorCodes.OK:
                c.errorCode = ErrorCodes.CANNOT_RETRIEVE
            return ErrorCodes().asDict(c.errorCode, str(e))
