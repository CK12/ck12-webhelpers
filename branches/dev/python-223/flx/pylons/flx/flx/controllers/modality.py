import logging
from urllib import unquote
from datetime import datetime, timedelta
import pytz

from pylons import config, request, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.model import api, exceptions as ex, model, migrated_concepts as mc
from flx.controllers.mongo.base import MongoBaseController 
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.controllers.celerytasks import modality
from flx.controllers.common import ArtifactCache, BrowseTermCache, ArtifactRevisionCache
from flx.lib.search import solrclient
from flx.model.mongo.specialsearch import SpecialSearchEntry

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

globalEncodedIDDict = {}

class ModalityController(MongoBaseController):
    """
        Artifact get related APIs.
    """
    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadModalities(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

            googleDocumentName = googleWorksheetName = savedFilePath = None
            if request.params.get('googleDocumentName'):
                googleDocumentName = request.params.get('googleDocumentName')
                if not googleDocumentName:
                    raise Exception(_('Google Spreadsheet name is required.'))
                googleWorksheetName = request.params.get('googleWorksheetName')
                if not googleWorksheetName:
                    log.info("No worksheet specified. Using the first one.")
                    googleWorksheetName = None
            else:
                ## save the file to temp location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
            if not request.params.has_key('toReindex'):
                toReindex = True
            else:
                toReindex = request.params.get('toReindex')
                toReindex = toReindex == 'True'
            autoPublish = request.params.get('autoPublish', 'false').lower() == 'true'
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                modalityLoader = modality.QuickModalityLoaderTask()
                ret = modalityLoader.apply(kwargs={'csvFilePath': savedFilePath, 'googleDocumentName': googleDocumentName, \
                                                   'googleWorksheetName': googleWorksheetName, 'user': member.id, 'loglevel': 'INFO', \
                                                   'toReindex': toReindex, 'autoPublish': autoPublish})
                result['response'] = ret.result
            else:
                modalityLoader = modality.ModalityLoaderTask()
                task = modalityLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName, \
                                            googleWorksheetName=googleWorksheetName, loglevel='INFO', \
                                            user=member.id, toReindex=toReindex, autoPublish=autoPublish)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load modality data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_MODALITY_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def loadModalitiesForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/modalities/uploadForm.html')

    def _getModalities(self, cnode, pageSize, pageNum, level=None, rtype='minimal', sort=None, returnAll=False):
        memberID = None
        isAdmin = False
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id
            isAdmin = u.isMemberAdmin(member)
        except Exception as e:
            pass

        levels = None
        if level:
            levels = [level.strip().replace('-', ' ').lower()]

        typeIDs = []
        modalities = request.params.get('modalities', '').strip()
        modalities = [ x.lower().strip() for x in modalities.split(',') ]
        log.debug("Modalities: %s" % modalities)
        tz = request.params.get('tz', 'US/Pacific').strip()
        log.info("Timezone: [%s]" %(tz))
        if not modalities:
            modalities = None
        else:
            for m in modalities:
                if m:
                    artifactTypes = g.getArtifactTypes()
                    if artifactTypes.has_key(m):
                        typeIDs.append(artifactTypes[m])
                    else:
                        raise Exception('Invalid modality: %s' % m)
        
        conceptCollectionHandleLikeQuery = False
        conceptCollectionHandle = request.params.get('conceptCollectionHandle', None)
        if conceptCollectionHandle:
            conceptCollectionHandle = conceptCollectionHandle.lower()
            conceptCollectionHandle = h.unquoteIterate(conceptCollectionHandle)
        else:
            collectionHandle = request.params.get('collectionHandle')
            if collectionHandle:
                if not collectionHandle.endswith(model.CONCEPT_COLLECTION_HANDLE_SEPARATOR):
                    collectionHandle += model.CONCEPT_COLLECTION_HANDLE_SEPARATOR
                conceptCollectionHandle = collectionHandle
                conceptCollectionHandleLikeQuery = True

        collectionCreatorID = int(request.params.get('collectionCreatorID', 3))

        includeAllUnpublished = isAdmin and str(request.params.get('includeAllUnpublished')).lower() == 'true'
        ownedBy = request.params.get('ownedBy')
        if ownedBy and ownedBy not in ['ck12', 'community', 'all']:
            raise Exception('Invalid value for ownedBy: %s' % ownedBy)
        log.debug("Params: %s" % request.params)
        log.debug("Getting relatedArtifacts for domain: %s, typeIDs: %s, levels=%s, memberID=%s, ownedBy=%s, conceptCollectionHandle: %s, collectionCreatorID: %s" % ([cnode.id], 
            typeIDs, levels, memberID, ownedBy, conceptCollectionHandle, collectionCreatorID))
        artifacts = api.getRelatedArtifactsForDomains(domainIDs=[cnode.id], conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID,
                typeIDs=typeIDs, levels=levels, memberID=memberID, sort=sort, ownedBy=ownedBy, conceptCollectionHandleLikeQuery=conceptCollectionHandleLikeQuery, includeAllUnpublished=includeAllUnpublished, pageNum=pageNum, pageSize=pageSize)
        if returnAll and int(artifacts.getTotal()) < 50:
            artifacts = api.getRelatedArtifactsForDomains(domainIDs=[cnode.id],
             conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, typeIDs=typeIDs, levels=levels, memberID=memberID,
              sort=sort, ownedBy=ownedBy, conceptCollectionHandleLikeQuery=conceptCollectionHandleLikeQuery, pageNum=1, pageSize=50)
            
        #idList = [ int(x.id) for x in artifacts ]
        #an artifact could be in multiple collections. Hence, this.
        idList = []
        for x in artifacts:
            if x.id not in idList:
                idList.append(int(x.id))
        log.info("Got artifact ids: %s" % idList)
        modalities = []
        cnodeDict = cnode.asDict(includeParent=True, recursive=True)
       
        for id in idList:
            aDict = self._loadArtifact(id, infoOnly=True, minimalOnly=(rtype=='minimal'))
            aDict['domain'] = cnodeDict        
            modalities.append(aDict)

        ##
        from flx.logic.artifactBusinessAnalyticsManager import ArtifactBusinessAnalyticsLogic
        artifactAnalyticsLogic = ArtifactBusinessAnalyticsLogic()
        artifactAnalytics = artifactAnalyticsLogic.getArtifactVisitDetails(idList)
        log.info('Artifact Analytics: [%s]' %(artifactAnalytics))
            
        ASSIGNMENT_STATUS = ['unassigned', 'completed', 'assigned', 'overdue']

        def getDueScore(assignment, tz):
            status = assignment.get('status', 'incomplete')
            due = assignment.get('due')
            if not due:
                due = datetime(2099, 12, 31, 11, 59, 59)
            else:
                due += timedelta(hours = 23, minutes = 59, seconds = 59)
            due = due.replace(tzinfo=pytz.timezone('UTC'))
            now = datetime.now(pytz.timezone(tz))
            if status == 'completed':
                dueSince = float('-inf')
            else:
                dueSince = now - due
                dueSince = int(dueSince.total_seconds()/60)
                if dueSince < 0:
                    status = 'assigned'
                else:
                    status = 'overdue'
            return status, dueSince

        log.info('Getting assginedModalities for: [%s] for: [%s]' %(cnode.encodedID, memberID))
        assignedArtifacts = {}
        if memberID != 2:
        	assignedArtifacts = api.getAssignedModalitiesForDomain(domainEID=cnode.encodedID, memberID=memberID, ownedBy='ck12')
        artifactAssignmentScore = {}
        for eachAssignedArtifact, assignments in assignedArtifacts.items():
            topDueScore = float('-inf')
            topStatus = -1
            for eachAssignment in assignments:
                status, dueScore = getDueScore(eachAssignment, tz)
                if dueScore > topDueScore:
                    topDueScore = dueScore
                if ASSIGNMENT_STATUS.index(status) > topStatus:
                    topStatus = ASSIGNMENT_STATUS.index(status)
            artifactAssignmentScore[eachAssignedArtifact] = status, topDueScore
        log.info('Assignment scores: [%s]' %(artifactAssignmentScore))

        artifactAnalyticsOrdered = []
        levelToScore = {'basic':2, 'at grade':3, 'advanced':1}
        for i, id in enumerate(idList):
            found = False
            for eachArtifactAnalytics in artifactAnalytics:
                if int(id) == int(eachArtifactAnalytics['artifactID']):
                    artifactAnalyticsOrdered.append(eachArtifactAnalytics)
                    found = True
                    break
            if not found:
                eachArtifactAnalytics = {'userVisits': 0, 'artifactVisits': 0, 'artifactID': id}
                artifactAnalyticsOrdered.append({'userVisits': 0, 'artifactVisits': 0, 'artifactID': id})
            aDict = modalities[i]
            aDict['userVisits'] = eachArtifactAnalytics['userVisits']
            aDict['artifactVisits'] = eachArtifactAnalytics['artifactVisits']
            aDict['levelToScore'] = levelToScore.get(aDict.get('level'))
            aDict['assignmentStatus'], aDict['dueScore'] = artifactAssignmentScore.get(id, (ASSIGNMENT_STATUS[0], float('-inf')))
            modalities[i] = aDict

        sortedModalities = sorted(modalities, key=lambda x:(x['dueScore'], x['levelToScore'], x['userVisits']), reverse=True)
        for modality in sortedModalities: del modality['dueScore']

        domainDict = BrowseTermCache().load(cnode.id, memberID, prePost=True, 
                ck12only=ownedBy=='ck12', communityOnly=ownedBy=='community', conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        result = {}
        result['domain'] = domainDict
        result['domain']['modalities'] = sortedModalities
        result['total'] = artifacts.getTotal()
        result['limit'] = len(artifacts)
        result['offset'] = (pageNum - 1)*pageSize
        return result

    def _loadArtifact(self, id, revisionID=0, infoOnly=True, minimalOnly=True):
        aDict, a = ArtifactCache().load(id, revisionID, infoOnly=infoOnly, minimalOnly=minimalOnly)
        return aDict

    @d.jsonify()
    @d.setPage(request, ['level', 'sub', 'brn', 'term', 'rtype'])
    @d.trace(log, ['level', 'sub', 'brn', 'term', 'pageSize', 'pageNum', 'rtype'])
    def getModalitiesByDomainName(self, pageNum, pageSize, sub, brn, term, level=None, rtype='minimal'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eidPrefix = '%s.%s.' % (sub, brn)
            cnode = api.getDomainTermByName(name=term, eidPrefix=eidPrefix)
            if not cnode:
                raise Exception(_('No such concept node by name: %s (eidPrefix: %s)' % (term, eidPrefix)))
            result['response'] = self._getModalities(cnode, pageSize, pageNum, level, rtype)
            return result
        except Exception as e:
            log.error('get modalities by domain name Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['level', 'eid', 'rtype'])
    @d.trace(log, ['level', 'eid', 'rtype', 'pageSize', 'pageNum'])
    def getModalities(self, pageNum, pageSize, eid, level=None, rtype='minimal'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        returnAll = True if str(request.params.get("returnAll", False)).lower() in ("true") else False
        try:
            btypes = g.getBrowseTermTypes()
            cnode = api.getBrowseTermByEncodedID(encodedID=eid)
            if not cnode:
                cnode = api.getBrowseTermByHandle(handle=eid, typeID=btypes['domain'])
            if not cnode:
                cnode = api.getBrowseTermByHandle(handle=eid, typeID=btypes['pseudodomain'])
            if not cnode:
                raise Exception('No such concept node by EID or handle: %s' % h.safe_encode(eid))
            supercedingConcept = mc.getSupercedingConcept(encodedID=cnode.encodedID)
            if supercedingConcept:
                msg = "Deprecated concept node [%s]. Use [%s] instead." % (cnode.encodedID, supercedingConcept.encodedID)
                log.error(msg)
                return ErrorCodes().asDict(ErrorCodes.DEPRECATED_DOMAIN_TERM, msg, {'redirectedConcept': supercedingConcept.asDict()})
            sort = request.params.get('sort', None)
            result['response'] = self._getModalities(cnode, pageSize, pageNum, level, rtype, sort, returnAll=returnAll)
            return result
        except Exception as e:
            log.error('get modalities by eid Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['type', 'handle', 'realm', 'rtype'])
    @d.trace(log, ['type', 'handle', 'realm', 'rtype', 'pageSize', 'pageNum'])
    def getModalitiesByPerma(self, pageNum, pageSize, type, handle, realm=None, rtype='minimal'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            cnode = None
            extDict = h.parsePermaExtension(request.params.get('extension'))
            ar = g.ac.getArtifactByPerma(type, handle, realm, extDict)
            artifactDict, artifact = ArtifactCache().load(ar.id, ar.artifactRevisionID, None, None)
            ## Return the old style perma detail info if this artifact is not part of modalities
            ## This is temporary - till we migrate all sections/lessons to modality based urls
            if not api.getRelatedArtifactsForArtifact(artifactID=artifact.id, pageNum=1, pageSize=1):
                options = g.ac.parseExtension(extDict)
                result = g.ac.getDetail(result,
                                        id=ar.id,
                                        type=type,
                                        revisionID=ar.artifactRevisionID,
                                        options=options)
                return result

            if artifactDict.has_key('domain'):
                cnode = api.getBrowseTermByID(id=artifactDict['domain']['id'])
            if not cnode:
                raise Exception('No such domain or pseudodomain node for artifact: %s' % artifact.id)
            level = extDict.get('level')
            result['response'] = self._getModalities(cnode, pageSize, pageNum, level=level, rtype=rtype)
            return result
        except Exception as e:
            log.error('get modalities by eid Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    def getModalityByPerma(self, type, handle, eid, realm=None):
        artifactTypeDict = g.getArtifactTypes()
        if artifactTypeDict.has_key(type):
            typeID = artifactTypeDict[type]
        else:
            c.errorCode = ErrorCodes.UNKNOWN_ARTIFACT_TYPE
            raise Exception((_(u'Unknown artifact type[%(type)s]')  % {"type":type}).encode("utf-8"))

        if not realm:
            creatorID = g.getCK12EditorID()
        else:
            key, login = realm.split(':')
            if key.lower() != 'user':
                c.errorCode = ErrorCodes.UNKNOWN_REALM_TYPE
                raise Exception((_(u'Unknown realm type[%(key)s]')  % {"key":key}).encode("utf-8"))

            member = api.getMemberByLogin(login=login)
            if not member:
                c.errorCode = ErrorCodes.NO_SUCH_MEMBER
                raise Exception((_(u'No member with login[%(login)s]')  % {"login":login}).encode("utf-8"))
            creatorID = member.id

        ## [Bug: 9171] unquote cannot work with unicode
        ## So encode it, unquote it, decode it back
        handle = h.safe_decode(unquote(h.safe_encode(handle)))

        artifact = api.getRelatedArtifactByPerma(typeID=typeID, handle=handle, creatorID=creatorID, domainEID=eid)
        if artifact:
            artifact = artifact.artifact
        else:
            ## Get artifact by perma
            artifact = api.getArtifactByHandle(handle=handle, typeID=typeID, creatorID=creatorID)
            if not artifact:
                artifactHandles = api.getArtifactHandles(handle=handle, typeID=typeID, creatorID=creatorID)
                artifact = None
                log.debug('getModalityByPerma: artifactHandles[%s]' % str(artifactHandles))
                for artifactHandle in artifactHandles:
                    log.debug('getModalityByPerma: artifactHandle id:[%s]' % str(artifactHandle.artifactID))
                    try:
                        anArtifact = api.getArtifactByID(id=artifactHandle.artifactID, typeName=type, creatorID=creatorID)
                        if anArtifact: 
                            artifact = anArtifact
                            break
                    except ex.WrongTypeException, wte:
                        log.warn("Artifact not of expected type: %s" % str(wte))
            if not artifact:
                c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
                raise Exception(_(u'No artifact with handle[%s] type[%s] realm[%s] eid[%s]' % (h.safe_encode(handle), type, h.safe_encode(realm), h.safe_encode(eid))))

        return artifact

    def _get(self, type, handle, cnode, result, realm=None, infoOnly=False, minimalOnly=False):
        log.info("Request params: %s" % request.params)
        log.debug('minimalOnly: %s, infoOnly: %s' % (minimalOnly, infoOnly))
        eid = cnode.encodedID
        artifact = self.getModalityByPerma(type=type, handle=handle, eid=eid, realm=realm)
        memberID = None
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id
        except Exception as e:
            pass

        ## Collection params
        conceptCollectionHandle = request.params.get('conceptCollectionHandle')
        collectionCreatorID = 3
        if conceptCollectionHandle:
            collectionCreatorID = int(request.params.get('collectionCreatorID', '3'))
        #levels = None
        extDict = h.parsePermaExtension(request.params.get('extension'))
        forUpdate = str(extDict.get('forupdate', False)) == 'true'
        revisionID = g.ac.getPermaArtifactRevisionID(artifact, extDict)
        options = g.ac.parseExtension(extDict)
        """for option in options:
            if option.startswith('level='):
                levels = [ option.replace('level=', '').lower() ]
                break """

        ## Check for correct domain and fix it in the response
        artifactDomainIDs = [ x[0] for x in api.getDomainIDsForRelatedArtifactID(artifactID=artifact.id, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID) ]
        log.debug("artifactDomainIDs: %s" % str(artifactDomainIDs))
        if artifactDomainIDs and cnode.id not in artifactDomainIDs:
            cnode = api.getBrowseTermByID(id=artifactDomainIDs[0])
            log.debug("Got actual cnode: %s" % str(cnode))
        domainDict = BrowseTermCache().load(cnode.id, memberID, prePost=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
        preDomains = domainDict['pre']
        postDomains = domainDict['post']
        preDomainIDs = [ preDomains[k]['id'] for k in preDomains.keys() ]
        postDomainIDs = [ postDomains[k]['id'] for k in postDomains.keys() ]
        
        returnDraftIfDraftExists = request.params.get('returnDraftIfDraftExists')
        if returnDraftIfDraftExists in ('TRUE', 'True', 'true', 'YES','Yes', 'yes'):
            returnDraftIfDraftExists = True
        else:
            returnDraftIfDraftExists= False

        draftResult = None
        if returnDraftIfDraftExists and memberID and revisionID:
            draftResult = api.getMemberArtifactDraftByArtifactRevisionID(memberID=memberID, artifactRevisionID=revisionID)

        from flx.lib import artifact_utils as au

        result = au.getArtifact(artifact.id, revisionID, type, memberID, options, result, draftResult=draftResult, forUpdate=forUpdate, infoOnly=infoOnly, minimalOnly=minimalOnly, domainID=cnode.id, preDomainIDs=preDomainIDs, postDomainIDs=postDomainIDs)

        result['response']['domain'] = domainDict
        for k in result['response'].keys():
            if k != 'domain':
                result['response']['domain'][k] = result['response'][k]
                del result['response'][k]
        return result

    @d.trace(log, ['type', 'handle', 'realm', 'eid', 'rtype'])
    def get(self, type, handle, eid, realm=None, rtype='detail'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            btypes = g.getBrowseTermTypes()
            cnode = api.getBrowseTermByEncodedID(encodedID=eid)
            if not cnode:
                cnode = api.getBrowseTermByHandle(handle=eid, typeID=btypes['domain'])
            if not cnode:
                cnode = api.getBrowseTermByHandle(handle=eid, typeID=btypes['pseudodomain'])
            if not cnode:
                raise Exception('No such concept node by EID or handle: %s' % eid)
            infoOnly = rtype == 'info'
            minimalOnly = rtype == 'minimal'
            if minimalOnly:
                infoOnly = True
            self._get(type, handle, cnode, result, realm=realm, infoOnly=infoOnly, minimalOnly=minimalOnly)
            if request.GET.get('format') == 'html' and not infoOnly and not minimalOnly:
                if result['response'].get('domain') and result['response']['domain'].get(type) \
                    and result['response']['domain'][type].get('xhtml'):
                        return result['response']['domain'][type]['xhtml']
            return d.jsonifyResponse(result, datetime.now())
        except Exception as e:
            log.error('get modalities by eid Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), datetime.now())

    ## Not used any more
    @d.trace(log, ['type', 'handle', 'realm', 'sub', 'brn', 'term'])
    def getByDomainPerma(self, type, handle, sub, brn, term, realm=None, infoOnly=False):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eidPrefix = '%s.%s.' % (sub, brn)
            cnode = api.getDomainTermByName(name=term, eidPrefix=eidPrefix)
            if not cnode:
                raise Exception(_('No such concept node by name: %s (eidPrefix: %s)' % (term, eidPrefix)))
            self._get(type, handle, cnode, result, realm=realm, infoOnly=infoOnly)
            if request.GET.get('format') == 'html':
                if result['response'].get(type) and result['response'][type].get('xhtml'):
                    return result['response'][type]['xhtml']
            return d.jsonifyResponse(result, datetime.now())
        except Exception as e:
            log.error('get modalities by eid Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), datetime.now())

    @d.ck12_cache_region('weekly')
    def __browseModalities(self, eid, typeIDs, memberID, getAll, termOnly, levels, modifiedAfter, ck12only, conceptCollectionHandle, collectionCreatorID, pageNum, pageSize):
        start = (pageNum-1) * pageSize
        domainType = api.getBrowseTermTypeByName(name='domain')
        cat = api.getBrowseTermByHandle(handle=eid, typeID=domainType.id)
        if not cat:
            ## Check if it is an encodedID
            cat = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(eid))
        if not cat:
            cat = api.getBrowseTermByIDOrName(idOrName=eid, type=domainType.id)
        if not cat:
            raise Exception(_(u'No such domain term: %s' % eid).encode("utf-8"))
        if not cat.encodedID:
            raise Exception(_(u'Not a valid domain term: %s. Does not have encodedID.'  % eid).encode("utf-8"))

        supercedingConcept = mc.getSupercedingConcept(encodedID=cat.encodedID)
        if supercedingConcept:
            msg = "Deprecated concept node [%s]. Use [%s] instead." % (cat.encodedID, supercedingConcept.encodedID)
            log.error(msg)
            raise ex.DeprecatedDomainException(msg, supercedingConcept.asDict())

        terms = [cat.encodedID]
        grandkids = []
        likeQuery = False
        if getAll:
            if cat.encodedID.upper() == 'CKT':
                terms.append('MAT.%%')
                terms.append('SCI.%%')
                likeQuery = True
            elif cat.encodedID.count('.') <= 1:
                terms.append('%s.%%' % cat.encodedID)
                likeQuery = True
            else:
                descendants = api.getBrowseTermDescendants(id=cat.id, levels=None)
                for t in descendants:
                    terms.append(t.encodedID)
        
        elif not termOnly:
            children = api.getBrowseTermChildren(id=cat.id)
            for child in children:
                terms.append(child.encodedID)
                gks = api.getBrowseTermChildren(id=child.id)
                for gk in gks:
                    grandkids.append(gk.encodedID)
                    ## Only the first grandkid
                    break
            terms.extend(grandkids)

        domains = api.browseRelatedDomains(domainEIDs=terms, typeIDs=typeIDs, levels=levels, excludeIDs=None, memberID=memberID,
                    likeQuery=likeQuery, modifiedAfter=modifiedAfter, ck12only=ck12only, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, pageNum=pageNum, pageSize=pageSize)

        modalities = []
        log.info('domains: %s' %(domains))
        for o in domains:
            log.info('Getting browseTerm for id: [%s]' %(o.domainID))
            domainDict = BrowseTermCache().load(o.domainID, memberID, modalitiesOnly=True, ck12only=ck12only, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID)
            modalities.append(domainDict)

        result = {
                'results': modalities,
                'total': domains.getTotal(),
                'limit': len(domains),
                'offset': start,
                }
        return result

    @d.jsonify()
    @d.setPage(request, ['eid', 'types', 'all'])
    @d.trace(log, ['eid', 'types', 'all', 'pageNum', 'pageSize'])
    def browseModalities(self, pageNum, pageSize, eid, types=None, all=False):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.info("Params: %s" % str(request.params))
            artifactTypeDict = g.getArtifactTypes()
            ck12only = str(request.params.get('ck12only')).lower() != 'false'
            log.info("ck12only: %s" % ck12only)
            member = None
            if not ck12only:
                member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None

            typeIDs = None
            if types and not 'artifact' in types.lower():
                types = [ x.strip().lower() for x in types.split(',') ]
                typeIDs = []
                for type in types:
                    typeIDs.append(artifactTypeDict[type])

            log.info('All: %s' % all)
            getAll = False
            if str(all).lower() == 'true' or str(all).lower() == 'all' or str(all) == '1':
                getAll = True
            termOnly = str(request.params.get('termOnly')).lower() == 'true'

            levels = None
            if request.params.get('levels'):
                levels = [ x.strip().lower() for x in str(request.params.get('levels')).split(',') ]

            log.info('All: %s' % getAll)
            modifiedAfter = request.params.get('modifiedAfter')
            if modifiedAfter:
                modifiedAfter = solrclient.getSolrTime(modifiedAfter, format=1)
            
            conceptCollectionHandle = request.params.get('conceptCollectionHandle', None)
            if conceptCollectionHandle:
                conceptCollectionHandle = conceptCollectionHandle.lower()
                conceptCollectionHandle = h.unquoteIterate(conceptCollectionHandle)
            collectionCreatorID = int(request.params.get('collectionCreatorID', 3))
            result['response'] = self.__browseModalities(eid, typeIDs, memberID, getAll, termOnly, levels, modifiedAfter, ck12only, conceptCollectionHandle, collectionCreatorID, pageNum, pageSize)
            return result
        except ex.DeprecatedDomainException as dde:
            log.error("browseModalities: Deprecated domain term: [%s]" % str(dde), exc_info=dde)
            return ErrorCodes().asDict(ErrorCodes.DEPRECATED_DOMAIN_TERM, dde.message, {'redirectedConcept': dde.redirectedConcept})
        except Exception, e:
            log.error('browse artifacts by browse category Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['brn', 'types', 'all'])
    def browseModalitiesSummary(self, brn, types=None, all=False):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            log.info("Params: %s" % str(request.params))
            artifactTypeDict = g.getArtifactTypes()
            ## Do not get the member - this API is member agnostic
            member = None
            # member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None

            typeIDs = None
            if types and not 'artifact' in types.lower():
                types = [ x.strip().lower() for x in types.split(',') ]
                typeIDs = []
                for type in types:
                    typeIDs.append(artifactTypeDict[type])

            domainType = api.getBrowseTermTypeByName(name='domain')
            eid = brn
            cat = api.getBrowseTermByHandle(handle=eid, typeID=domainType.id)
            if not cat:
                ## Check if it is an encodedID
                cat = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(eid))
            if not cat:
                cat = api.getBrowseTermByIDOrName(idOrName=eid, type=domainType.id)
            if not cat:
                raise Exception(_(u'No such domain term: %s' % eid).encode("utf-8"))
            if not cat.encodedID:
                raise Exception(_(u'Not a valid domain term: %s. Does not have encodedID.'  % eid).encode("utf-8"))

            terms = [cat.encodedID]
            childDict = {}
            children = api.getBrowseTermChildren(id=cat.id)
            for ch in children:
                terms.append('%s.%%' % ch.encodedID)
                childDict[ch.encodedID] = ch

            modifiedAfter = request.params.get('modifiedAfter')
            if modifiedAfter:
                modifiedAfter = solrclient.getSolrTime(modifiedAfter, format=1)
            ck12only = str(request.params.get('ck12only')).lower() != 'false'
            log.info("ck12only: %s" % ck12only)
            domains = api.browseRelatedDomainsSummary(domainEIDs=terms, typeIDs=typeIDs, levels=None, excludeIDs=None, memberID=memberID,
                    modifiedAfter=modifiedAfter, ck12only=ck12only)
            modalities = []
            for o in domains:
                domain = childDict.get(o.domainEID)
                if domain:
                    term = api.getBrowseTermByID(id=domain.id)
                    domainDict = term.asDict(includeParent=True, recursive=False)
                    #domainDict = BrowseTermCache().load(domain.id, memberID, modalitiesOnly=True, ck12only=ck12only)
                    domainDict['descendantDomainCount'] = o.count
                    modalities.append(domainDict)

            result['response'] = {
                    'results': modalities,
                    }
            return result
        except Exception, e:
            log.error('browse artifacts by browse category Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.sortable(request, ['encodedID', 'types', 'rtype' ])
    @d.filterableSearch(request, ['encodedID', 'types', 'rtype'])
    @d.setPage(request, ['encodedID', 'types', 'rtype'])
    @d.trace(log, ['encodedID', 'types', 'rtype', 'pageNum', 'pageSize'])
    def getFeaturedArtifactsForEncodedID(self, pageNum, pageSize, encodedID, rtype=None, types=None):
        """
            Searches for any types of artifacts that match the given
            encodedID.
        """
        try:
            version = request.params.get('version','single')
            member = u.getCurrentUser(request, anonymousOkay=True)
            member = u.getImpersonatedMember(member)
            memberID = member.id if member is not None else None
            if memberID == 2:
                memberID = None
            typeNames = None
            if types:
                #Using new tmp list instaed of set to get unique types and maintain order
                _types = [x.strip() for x in types.lower().split(',')]
                typeNames = []
                for mType in _types:
                    if mType not in typeNames:
                        typeNames.append(mType)
            if not rtype:
                rtype = 'minimal'
            infoOnly = True
            minimalOnly = False
            if rtype == 'minimal':
                minimalOnly = True
            log.info("Type names in searchModalities: %s" % typeNames)
            log.info("Version: %s" % version)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            ck12only = str(request.params.get('ck12only', 'true')).lower() == 'true'
            communityContributed=str(request.params.get('communityContributed')).lower() == 'true'
            conceptCollectionHandle = request.params.get('conceptCollectionHandle', None)
            if conceptCollectionHandle:
                conceptCollectionHandle = conceptCollectionHandle.lower()
                conceptCollectionHandle = h.unquoteIterate(conceptCollectionHandle)
            collectionCreatorID = int(request.params.get('collectionCreatorID', 3))

            artifacts = []
            if version == 'featured':
                featuredEID = 'featured-' + encodedID
                artifacts = self._getFeaturedArtifactsForEncodedID(pageNum, pageSize, featuredEID, typeNames=typeNames,
                                                                   infoOnly=infoOnly, minimalOnly=minimalOnly, ck12only=ck12only,
                                                                   communityContributed=communityContributed, memberID=memberID)
            else: # case if version = 'single' or version = 'bookflow'
                artifacts = self.getUniqueRelatedArtifactsForDomains(encodedID, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, version=version, typeNames=typeNames,
                                                                ck12only=ck12only, memberID=None, minimalOnly=minimalOnly)
                    #artifacts = api.getArtifactsDictByIDs(artifactIDs)
            result['response']['total'] = len(artifacts)
            result['response']['Artifacts'] = artifacts
            return result
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.ck12_cache_region('short_term')
    def getUniqueRelatedArtifactsForDomains(self, encodedID, conceptCollectionHandle=None, collectionCreatorID=3, typeNames=[], 
                                                version='single', memberID=None, 
                                                ck12only=True, infoOnly=True, minimalOnly=True):
        if ck12only:
            ownedBy = 'ck12'
        else:
            ownedBy = 'community'
        typeIDs = []
        artifactTypes = g.getArtifactTypes()
        enrichmentTypeID = lectureTypeID = None
        isBookFlow = False
        if version == 'bookflow':
            isBookFlow = True
            typeNames = ['asmtpractice', 'lecture', 'enrichment', 'rwa', 'simulation', 'plix', 'studyguide', 'flashcard']
        for typeName in typeNames:
            if artifactTypes.has_key(typeName):
                if typeName == 'enrichment':
                    enrichmentTypeID = artifactTypes[typeName]
                if typeName == 'lecture':
                    lectureTypeID = artifactTypes[typeName]
                typeIDs.append(artifactTypes[typeName])

        btypes = g.getBrowseTermTypes()
        browseTerm = api.getBrowseTermByHandle(handle=encodedID, typeID=btypes['domain'])
        if not browseTerm:
            browseTerm = api.getBrowseTermByEncodedID(encodedID=encodedID)
        log.info("browseTerm :: %s"%browseTerm)
        artifacts = []
        if browseTerm:
            artifactIDs = []
            for typeID in typeIDs:
                pageSize = pageNum = 1 # As we required only single record for each ArtifactType
                related_artifacts = api.getRelatedArtifactsForDomains(domainIDs=[browseTerm.id], conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, typeIDs=[typeID],
                                                                      levels=None, memberID=memberID, sort=None,
                                                                      ownedBy=ownedBy, pageNum=pageNum, pageSize=pageSize)
                log.info("related_artifacts :: %s"%related_artifacts)
                if related_artifacts:
                    artifactIDs.append(related_artifacts[0].id)
                    if isBookFlow: 
                        #For bookflow return only 1 video (either lecture or enrichment)
                        if len(artifactIDs) == 5:
                            break
                    if typeID == lectureTypeID and enrichmentTypeID in typeIDs:
                        typeIDs.remove(enrichmentTypeID) 

            if isBookFlow and len(artifactIDs) < 5:
                typeNames.extend(['concept', 'lesson'])
                modalityTypes = api.getArtifactTypes(modalitiesOnly=True)
                typeIDs = []
                for modalityType in modalityTypes:
                    if modalityType.name not in typeNames:
                        typeIDs.append(modalityType.id)
                for typeID in typeIDs:
                    pageSize = pageNum = 1 # As we required only single record for each ArtifactType
                    related_artifacts = api.getRelatedArtifactsForDomains(domainIDs=[browseTerm.id], conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collectionCreatorID, typeIDs=[typeID],
                                                                          levels=None, memberID=memberID, sort=None,
                                                                          ownedBy=ownedBy, pageNum=pageNum, pageSize=pageSize)
                    log.info("related_artifacts :: %s"%related_artifacts)
                    if related_artifacts:
                        artifactIDs.append(related_artifacts[0].id)
                        if len(artifactIDs) == 5:
                            break
            log.info("Artifact Ids :: %s"% artifactIDs)
            artifacts = [ArtifactCache().load(x, memberID=memberID, infoOnly=infoOnly, minimalOnly=minimalOnly)[0] for x in artifactIDs]
        #Sort artifacts on order of input artifact types
        #1. Convert typeNames list to dict with key as list index and value as type name
        sortOrder = dict(enumerate(typeNames))
        #2. Swap typeName as key to dict and index as value
        sortOrder = dict (zip(sortOrder.values(), sortOrder.keys()))
        #3. sort artifacts on input artifact type order
        artifacts = sorted(artifacts, key=lambda artifact: sortOrder[artifact.get('artifactType')])
        
        return artifacts
        
    @d.ck12_cache_region('short_term')
    def _getFeaturedArtifactsForEncodedID(self, pageNum, pageSize, featuredEID, typeNames=[],
                                          infoOnly=True, minimalOnly=False, ck12only=False,
                                          communityContributed=False, memberID=None):
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        hits = api.getFeaturedArtifactsForEncodedID(featuredEID=featuredEID, typeNames=typeNames, start=start, rows=pageSize,
                                                    memberID=memberID, idsOnly=True, ck12only=ck12only,
                                                    communityContributed=communityContributed)
        artifacts = []
        hitList = hits['artifactList']
        nodeList = [{'id':abs(node['id']), 'score': node['score']} for node in hitList if node['id'] < 0]
        artifactList = [art for art in hitList if art['id'] > 0]
        for aid in artifactList:
            try:
                a = api.getArtifactByID(id=aid['id'])
                if not a:
                    h.reindexArtifacts([aid['id']], recursive=True)
                    raise Exception("No such artifact by id: %s" % aid['id'])
                #aDict = a.asDict(memberID=memberID, includeRevisions=not minimalOnly, includeFeedbacks=False)
                aDict, a = ArtifactCache().load(aid['id'], memberID=memberID, infoOnly=infoOnly, minimalOnly=minimalOnly)
                if aDict:
                    aDict['id'] = int(aDict['id'])
                    aDict['score'] = aid['score']
                    artifacts.append(aDict)
            except Exception as ae:
                log.warn("Error loading artifact: %s" % str(ae))

        for nid in nodeList:
            try:
                nDict = BrowseTermCache().load(nid['id'], memberID=memberID, modalitiesOnly=True)
                if nDict:
                    if not nDict.get('ck12ModalityCount') and not nDict.get('communityModalityCount'):
                        h.reindexArtifacts([-int(nDict['id'])], recursive=False)
                        raise Exception('No modalities for %s' % nDict['encodedID'])
                    nDict['id'] = -int(nDict['id'])
                    nDict['score'] = nid['score']
                    artifacts.append(nDict)
            except Exception as be:
                log.warn("No modalities for browseTerm. error: %s" % str(be))
        idList = []
        for hit in hitList:
            idList.append(hit.get('id'))
        artifacts = sorted(artifacts, cmp=lambda x,y: cmp(idList.index(int(x.get('id'))), idList.index(int(y.get('id')))))
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
    @d.sortable(request, ['searchTerm', 'types', 'rtype' ])
    @d.filterableSearch(request, ['searchTerm', 'types', 'rtype', 'sort'])
    @d.setPage(request, ['searchTerm', 'types', 'rtype', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'rtype', 'sort', 'pageNum', 'pageSize', 'fq'])
    def searchModalities(self, fq, pageNum, pageSize, searchTerm, rtype=None, types=None, sort=None):
        """
            Searches for any types of artifacts that match the given
            searchTerm.
        """
        try:
            member = u.getCurrentUser(request, anonymousOkay=True)
            member = u.getImpersonatedMember(member)
            memberID = member.id if member is not None else None
            if memberID == 2:
                memberID = None
            typeNames = None
            if types:
                typeNames = set( x.strip() for x in types.lower().split(',') )
            if not rtype:
                rtype = 'info'
            infoOnly = True
            minimalOnly = False
            if rtype == 'minimal':
                minimalOnly = True
            log.info("FQ: %s" % fq)
            log.info("Type names in searchModalities: %s" % typeNames)
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['total'] = 1
            sort = solrclient.getSortOrder(sort)
            specialSearch = str(request.params.get('specialSearch')).lower() == 'true'
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            relatedArtifacts = str(request.params.get('relatedArtifacts')).lower() == 'true'
            ck12only = str(request.params.get('ck12only')).lower() == 'true'
            if ck12only and memberID != 3:
                memberID = None
            communityContributed=str(request.params.get('communityContributed')).lower() == 'true'
            minScore = 0.0
            try:
                minScore = float(str(request.params.get('minScore')))
            except:
                minScore = 0.0
            log.info("minScore=%s" % minScore)
            includeEIDs = None
            eids = request.params.get('includeEIDs')
            if eids:
                try:
                    includeEIDs = [ int(x.strip()) for x in eids.split(',') ]
                except:
                    raise Exception((_(u'includeEIDs must be a comma-separated list of integers')).encode("utf-8"))

            if searchTerm == '__all__':
                searchTerm = ''
            log.info("searchTerm >> %s" % searchTerm)
            if memberID:
                resultsDict = self._searchMemberModalities(pageNum, pageSize, searchTerm, typeNames=typeNames,
                    infoOnly=infoOnly, minimalOnly=minimalOnly,
                    sort=sort, fq=fq, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                    relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, ck12only=ck12only,
                    communityContributed=communityContributed, memberID=memberID, minScore=minScore)
            else:
                resultsDict = self._searchCK12Modalities(pageNum, pageSize, searchTerm, typeNames=typeNames,
                    infoOnly=infoOnly, minimalOnly=minimalOnly,
                    sort=sort, fq=fq, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                    relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, ck12only=ck12only,
                    communityContributed=communityContributed, minScore=minScore)
            result['response']['Artifacts'] = resultsDict
            return result
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    def getDomainAndBranchHandles(self, encodedID, domainEIDs, artifactID):
        global globalEncodedIDDict
        domain = None
        found = False
        if False and encodedID and not encodedID in globalEncodedIDDict:
            encodedList = encodedID.split('.')
            domainHandle = domainName = None
            branchHandle = None
            domainEncoding = False
            branchEncoding = False
            if len(encodedList) > 2:
                domainEncoding = True
            if len(encodedList) > 1:
                branchEncoding = True
        
            if domainEncoding:
                domainEncodedID = h.getDomainEIDFromEID(encodedID)
                domainBrowseTermObj = api.getBrowseTermByEncodedID(domainEncodedID)
                if domainBrowseTermObj:
                    found = True
                    domainHandle = domainBrowseTermObj.handle
                    domainName = domainBrowseTermObj.name

            if branchEncoding:
                branchEncodedID = '.'.join(encodedList[:2])
                branchBrowseTermObj = api.getBrowseTermByEncodedID(branchEncodedID)
                if branchBrowseTermObj:
                    branchHandle = branchBrowseTermObj.handle

            if domainHandle or branchHandle:
                domain = {
                          'name': domainName,
                          'encodedID': domainEncodedID.upper(),
                          'handle': domainHandle,
                          'branchInfo': {
                                         'handle': branchHandle
                                         }
                          }
                globalEncodedIDDict[encodedID] = domain
            else:
                return None
        if not found:
            if domainEIDs:
                domainBrowseTermObj = [api.getBrowseTermByEncodedID(encodedID=domainEIDs[0].upper())]
            if not domainEIDs:
                browseTermTypes = api.getBrowseTermTypeByName(name = "domain")
                domainBrowseTermObj = api.getArtifactHasBrowseTermsByType(artifactID=artifactID, browseTermTypeID=browseTermTypes.id)
            if not domainBrowseTermObj:
                browseTermTypes = api.getBrowseTermTypeByName(name = "pseudodomain")
                domainBrowseTermObj = api.getArtifactHasBrowseTermsByType(artifactID=artifactID, browseTermTypeID=browseTermTypes.id)
            if domainBrowseTermObj:
                domainBrowseTermObj = domainBrowseTermObj[0]
                supercedingDomain = mc.getSupercedingConcept(encodedID=domainBrowseTermObj.encodedID)
                domainBrowseTermObj = supercedingDomain if supercedingDomain else domainBrowseTermObj
            else:
                return None
            domainHandle = domainBrowseTermObj.handle
            domainName = domainBrowseTermObj.name
            branchHandle = 'na'
            encodedID = domainBrowseTermObj.encodedID
            deid = (encodedID if encodedID else 'UGC.UBR').split('.')[:2]
            if encodedID in globalEncodedIDDict:
                return globalEncodedIDDict[encodedID]
            log.info("Domain EID: %s" % deid)
            if ".".join(deid) != 'UGC.UBR':
                term = api.getBrowseTermByEncodedID(encodedID=".".join(deid))
                if term and term.handle:
                    branchHandle = term.handle.lower()
            domain = {
                      'name': domainName,
                      'encodedID': encodedID.upper(),
                      'handle': domainHandle,
                      'branchInfo': { 'handle': branchHandle }
                      }
            globalEncodedIDDict[encodedID] = domain

        return globalEncodedIDDict[encodedID]
    
    ## This API is cached at the CDN
    #@d.ck12_cache_region('daily')
    def __getSpecialSearchMatches(self, searchTerm, limit=1):
        specialMatches = []
        matches = SpecialSearchEntry(self.db).lookupSpecialSearchTerm(searchTerm, limit=limit)
        log.info("specialMatches: %s" % matches)
        for m in matches:
            if m and m['score'] >= 0.8:
                specialMatches.append(m)
            else:
                break
        log.debug("Returning matches: %s" % str(specialMatches))
        return specialMatches

    ## This API is cached at the CDN
    @d.jsonify()
    @d.sortable(request, ['searchTerm', 'types', 'rtype' ])
    @d.filterableSearch(request, ['searchTerm', 'types', 'rtype', 'sort'])
    @d.setPage(request, ['searchTerm', 'types', 'rtype', 'sort', 'fq'])
    @d.trace(log, ['searchTerm', 'types', 'rtype', 'sort', 'pageNum', 'pageSize', 'fq'])
    def searchDirectModalities(self, fq, pageNum, pageSize, searchTerm, rtype=None, types=None, sort=None):
        """
            Searches for any types of artifacts on solr that match the given
            searchTerm.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=True)
            member = u.getImpersonatedMember(member)
            memberID = member.id if member is not None else None
            typeNames = None
            if types:
                typeNames = set( x.strip() for x in types.lower().split(',') )
            if not rtype:
                rtype = 'info'
            infoOnly = True
            minimalOnly = False
            if rtype == 'minimal':
                minimalOnly = True
            log.info("FQ: %s" % fq)
            log.info("Type names in searchModalities: %s" % typeNames)
            result['response']['total'] = 1
            sort = solrclient.getSortOrder(sort)
            specialSearch = str(request.params.get('specialSearch')).lower() == 'true'
            extendedArtifacts = str(request.params.get('extendedArtifacts')).lower() == 'true'
            relatedArtifacts = str(request.params.get('relatedArtifacts')).lower() == 'true'
            includeSpecialMatches = str(request.params.get('includeSpecialMatches')).lower() == 'true'
            spellSuggest = str(request.params.get('spellSuggest')).lower() != 'false'
            excludeSubjects = [ x.strip().lower() for x in request.params.get('excludeSubjects', '').lower().split(',') ]
            ck12only = str(request.params.get('ck12only')).lower() == 'true'
            ## No per-member results in this case.
            if ck12only or memberID == 2:
                memberID = None
            communityContributed=str(request.params.get('communityContributed')).lower() == 'true'
            searchAll = str(request.params.get('mylib')).lower() != 'true'
            minScore = 0.0
            try:
                minScore = float(str(request.params.get('minScore')))
            except:
                minScore = 0.0
            log.info("minScore=%s" % minScore)
            includeEIDs = None
            eids = request.params.get('includeEIDs')
            if eids:
                try:
                    includeEIDs = [ int(x.strip()) for x in eids.split(',') ]
                except:
                    raise Exception((_(u'includeEIDs must be a comma-separated list of integers')).encode("utf-8"))

            if searchTerm == '__all__':
                searchTerm = ''
            log.info("searchTerm >> %s" % searchTerm)
            if memberID:
                resultsDict = self._searchMemberModalities(pageNum, pageSize, searchTerm, typeNames=typeNames,
                    infoOnly=infoOnly, minimalOnly=minimalOnly,
                    sort=sort, fq=fq, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                    relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, ck12only=ck12only,
                    communityContributed=communityContributed, memberID=memberID, searchAll=searchAll,
                    minScore=minScore, onlyHits=True, spellSuggest=spellSuggest, excludeSubjects=excludeSubjects)
            else:
                resultsDict = self._searchCK12Modalities(pageNum, pageSize, searchTerm, typeNames=typeNames,
                    infoOnly=infoOnly, minimalOnly=minimalOnly,
                    sort=sort, fq=fq, specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                    relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, ck12only=ck12only,
                    communityContributed=communityContributed, minScore=minScore, onlyHits=True, spellSuggest=spellSuggest,
                    excludeSubjects=excludeSubjects)
            result['response']['Artifacts'] = resultsDict
            if includeSpecialMatches and pageNum == 1 and searchTerm:
                specialMatches = self.__getSpecialSearchMatches(searchTerm, limit=1)
                if specialMatches:
                    result['response']['specialMatches'] = [ specialMatches ]

            return result
            
        except Exception as e:
            log.error('search Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.INVALID_SEARCH_QUERY
            return ErrorCodes().asDict(c.errorCode, str(e))

    ## This API is cached at the CDN
    #@d.ck12_cache_region('daily')
    def _searchCK12Modalities(self, pageNum, pageSize, searchTerm, typeNames=[],
            infoOnly=True, minimalOnly=False,
            sort=None, fq=[], specialSearch=False, extendedArtifacts=False, 
            relatedArtifacts=False, includeEIDs=None, ck12only=False,
            communityContributed=False, minScore=0.0, onlyHits=False, spellSuggest=True, excludeSubjects=[]):
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        hits = api.searchModalities(domain=None, term=searchTerm, typeNames=typeNames, 
                fq=fq, sort=sort, start=start, rows=pageSize, memberID=None, spellSuggest=spellSuggest,
                specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, idsOnly=True,
                ck12only=ck12only, communityContributed=communityContributed, minScore=minScore, excludeSubjects=excludeSubjects)
        return self.__processSearchResults(searchTerm=searchTerm, hits=hits, start=start, infoOnly=infoOnly, minimalOnly=minimalOnly, 
                memberID=None, onlyHits=onlyHits, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts)

    ## This API is cached at the CDN
    #@d.ck12_cache_region('short_term')
    def _searchMemberModalities(self, pageNum, pageSize, searchTerm, typeNames=[],
            infoOnly=True, minimalOnly=False,
            sort=None, fq=[], specialSearch=False, extendedArtifacts=False, 
            relatedArtifacts=False, includeEIDs=None, ck12only=False,
            communityContributed=False, memberID=None, searchAll=True, minScore=0.0, onlyHits=False, spellSuggest=True, excludeSubjects=[]):
        start = (pageNum-1) * pageSize
        log.info("Page number: %d, page size: %d" % (pageNum, pageSize))
        hits = api.searchModalities(domain=None, term=searchTerm, typeNames=typeNames, 
                fq=fq, sort=sort, start=start, rows=pageSize, memberID=memberID, searchAll=searchAll, spellSuggest=spellSuggest,
                specialSearch=specialSearch, extendedArtifacts=extendedArtifacts, 
                relatedArtifacts=relatedArtifacts, includeEIDs=includeEIDs, idsOnly=True,
                ck12only=ck12only, communityContributed=communityContributed, minScore=minScore, excludeSubjects=excludeSubjects)
        return self.__processSearchResults(searchTerm=searchTerm, hits=hits, start=start, infoOnly=infoOnly, minimalOnly=minimalOnly, 
                memberID=memberID, onlyHits=onlyHits, extendedArtifacts=extendedArtifacts, relatedArtifacts=relatedArtifacts)

    def __processSearchResults(self, searchTerm, hits, start=0, infoOnly=True, minimalOnly=False, memberID=None, onlyHits=False, extendedArtifacts=False, relatedArtifacts=False):
        artifacts = []
        nodeList = []
        artifactList = []
        hitList = hits['artifactList']
        for item in hitList:
            if item['artifactType'] == 'domain':
                nodeList.append({'id': abs(int(item['id'])), 'score': item['score'], 'searchDoc': item})
            else:
                artifactList.append(item)
        creatorID = g.getCK12EditorID()
        for aid in artifactList:
            try:
                if onlyHits:
                    encodedID = aid['encodedID']
                    if not encodedID and aid.get('domainIDs.ext'):
                        encodedID = aid['domainIDs.ext'][0]
                    domain = self.getDomainAndBranchHandles(encodedID=encodedID, domainEIDs=aid['domainIDs.ext'], artifactID=aid['id'])
                    aid['domain'] = domain
                    ## Collections
                    aid['collections'] = self.__getCollections(aid.pop('chandles', []), aid.pop('ctitles', []), aid.pop('cchandles', []), aid.pop('cctitles', []), 
                            aid.pop('cceids', []))
                    ## Realm
                    realm = None
                    if creatorID != int(aid['ownerID']):
                        realm = "%s:%s" % ('user', aid['ownerLogin'])
                    aid['realm'] = realm
                    if aid.get('gradeGrid'):
                        aid['gradeGrid'] = sorted(aid['gradeGrid'], key=lambda x: model.SORTED_GRADES.index(x.lower()) if x.lower() in model.SORTED_GRADES else 9999)
                    artifacts.append(aid)
                    continue
                a = api.getArtifactByID(id=aid['id'])
                if not a:
                    h.reindexArtifacts([aid['id']], recursive=True)
                    raise Exception("No such artifact by id: %s" % aid['id'])
                #aDict = a.asDict(memberID=memberID, includeRevisions=not minimalOnly, includeFeedbacks=False)
                aDict, a = ArtifactCache().load(aid['id'], memberID=memberID, infoOnly=infoOnly, minimalOnly=minimalOnly)
                if aDict:
                    aDict['id'] = int(aDict['id'])
                    if not relatedArtifacts and aDict.has_key('relatedArtifacts'):
                        del aDict['relatedArtifacts']
                    if not extendedArtifacts and aDict.has_key('extendedArtifacts'):
                        del aDict['extendedArtifacts']
                    aDict['score'] = aid['score']
                    artifacts.append(aDict)
            except Exception as ae:
                log.warn("Error loading artifact: %s" % str(ae), exc_info=ae)

        exactMatches = []
        for nid in nodeList:
            try:
                log.debug("nid: %s" % str(nid))
                a = api.getBrowseTermByID(id=nid['id'])
                if not a:
                    h.reindexArtifacts([-nid['id']], recursive=True)
                    raise Exception("No such BrowseTerm by id: %s" % nid['id'])
                
                nDict = BrowseTermCache().load(nid['id'], memberID=memberID, modalitiesOnly=True)
                if nDict:
                    if not nDict.get('ck12ModalityCount') and not nDict.get('communityModalityCount'):
                        h.reindexArtifacts([-int(nDict['id'])], recursive=False)
                        raise Exception('No modalities for %s' % nDict['encodedID'])
                    nDict['id'] = -int(nDict['id'])
                    nDict['score'] = nid['score']
                    nDict['collections'] = self.__getCollections(nid['searchDoc'].get('chandles'), nid['searchDoc'].get('ctitles'), nid['searchDoc'].get('cchandles'), 
                            nid['searchDoc'].get('cctitles'), nid['searchDoc'].get('cceids'))
                    ## Add modality counts for each collection
                    for collection in nDict['collections']:
                        conceptCollectionHandle = '%s%s%s' % (collection['collectionHandle'], model.CONCEPT_COLLECTION_HANDLE_SEPARATOR, collection['conceptCollectionAbsoluteHandle'])
                        ncDict = BrowseTermCache().load(nid['id'], memberID=memberID, modalitiesOnly=True, conceptCollectionHandle=conceptCollectionHandle, collectionCreatorID=collection['collectionCreatorID'])
                        log.debug("ncDict: % s" % ncDict)
                        collection['ck12ModalityCount'] = ncDict.get('ck12ModalityCount')
                        collection['communityModalityCount'] = ncDict.get('communityModalityCount')

                    ## Exact match check.
                    exactMatch = False
                    if searchTerm:
                        if nDict.get('name', '').lower() == searchTerm.lower():
                            exactMatch = True
                        if nDict['collections']:
                            for collection in nDict['collections']:
                                if collection['conceptCollectionTitle'].lower() == searchTerm.lower():
                                    exactMatch = True
                                    collection['exactMatch'] = True

                    if exactMatch:
                        log.debug("Found an exact match for concept: [%s], searchTerm: [%s]" % (nDict.get('name'), searchTerm))
                        nDict['exactMatch'] = True
                        exactMatches.append(nDict)
                    else:
                        artifacts.append(nDict)
            except Exception as be:
                log.warn("No modalities for browseTerm. error: %s" % str(be), exc_info=be)
        idList = []
        log.debug("hitList: %s" % str(hitList))
        for hit in hitList:
            idList.append(int(hit.get('id')))
        artifacts = sorted(artifacts, cmp=lambda x,y: cmp(idList.index(int(x.get('id'))), idList.index(int(y.get('id')))))
        if exactMatches:
            log.debug("Exact matches: %d" % len(exactMatches))
            exactMatches.reverse()
            for em in exactMatches:
                artifacts.insert(0, em)
        artifactDict = {
                        'total': hits['numFound'],
                        'limit': len(hits['artifactList']),
                        'offset': start,
                        'result': artifacts,
                        'filters': hits['facets'],
                        'suggestions': hits['suggestions'],
                       }
        return artifactDict

    def __getCollections(self, chandles, ctitles, cchandles, cctitles, cceids):
        collections = []
        if chandles:
            for i in range(0, len(chandles)):
                chandle = chandles[i]
                cdict = h.splitSearchCollectionHandle(chandle)
                if len(ctitles) > i:
                    cdict['collectionTitle'] = ctitles[i]
                if len(cchandles) > i:
                    cdict['conceptCollectionAbsoluteHandle'] = cchandles[i]
                if len(cctitles) > i:
                    cdict['conceptCollectionTitle'] = cctitles[i]
                if len(cceids) > i:
                    cdict['encodedID'] = cceids[i]
                collections.append(cdict)
        return collections
