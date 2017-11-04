import logging
import os
from datetime import datetime
from pylons.i18n.translation import _ 
import traceback
from tempfile import NamedTemporaryFile
import json

from pylons import request, tmpl_context as c, config
from pylons.decorators.cache import beaker_cache
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache, BrowseTermCache
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.lib.search import solrclient
import flx.controllers.user as u
from flx.controllers.celerytasks import browseTerm as bttasks
from flx.lib.unicode_util import UnicodeWriter

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class BrowsetermController(BaseController):
    """
        Browse Term related APIs.
    """
    def _getInfo(self, term, level=None, memberID=None, prePost=False, ownedBy=None):
        return BrowseTermCache().load(term.id, memberID, level=level, prePost=prePost, 
                ck12only=ownedBy=='ck12', communityOnly=ownedBy=='community')

    #
    #  Get related APIs.
    #
    @d.jsonify()
    @d.trace(log, ['id'])
    def get(self, id):
        """ Get information about a browseTerm """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            browseTerm = api.getBrowseTermByIDOrName(idOrName=id)
            if not browseTerm:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
            if not browseTerm:
                browseTerm = api.getBrowseTermByHandle(handle=id)
            if not browseTerm:
                raise Exception((_(u'No browse term of %(id)s')  % {"id":id}).encode("utf-8"))
            result['response'] = self._getInfo(browseTerm, memberID=member.id)
            return result
        except Exception, e:
            log.error('get browseTermInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.trace(log, ['terms'])
    @d.setPage(request, ['terms'])
    @d.trace(log, ['terms', 'pageNum', 'pageSize'])
    def searchMemberPseudoDomainByName(self, terms, pageNum, pageSize):
        """ Get information about a browseTerm """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            if not member:
                raise Exception("User not logged in")

            browseTerms = api.getMemberPseudoDomainByName(terms, creatorID=member.id, pageNum=pageNum, pageSize=pageSize)
            bTermList = []
            for bTerm in browseTerms:
                bTermList.append({'browseTermID': bTerm.browseTermID, 'name': bTerm.name, 'encodedID': bTerm.encodedID, 'handle': bTerm.handle , 'creatorID': bTerm.creatorID})

            result['response']['total'] = browseTerms.getTotal()
            result['response']['limit'] = len(bTermList)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['result'] = bTermList
            return result
        except Exception, e:
            log.error('searchMemberPseudoDomainByName Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getBrowseTermsByEIDs(self):
        """ Get information about a browseTerm """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            EIDList = request.params.get('EIDList',None)
            if not EIDList:
                raise Exception('EIDList is not provided')
            EIDList = json.loads(EIDList)
            EIDList = [h.formatEncodedID(each) for each in EIDList]
            browseTerms = api.getBrowseTermByEncodedIDs(encodedIDList=EIDList)
            if not browseTerms:
                raise Exception((_(u'No browse term of %(id)s')  % {"id":EIDList}).encode("utf-8"))
            result['response'] = [{'name':browseTerm.name,'encodedID':browseTerm.encodedID, 'handle':browseTerm.handle} for browseTerm in browseTerms]
            return result
        except Exception, e:
            log.error('get browseTermInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e)) 

    @d.jsonify()
    @d.trace(log, ['member'])
    def isBrowseTermExists(self, member=None):
        """ Get the browse terms """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not member:
                member = u.getCurrentUser(request)
            kwargs = dict()
            for key in ['name', 'handle', 'encodedID', 'parentEncodedID', 'passKey']:
                kwargs[key] = request.GET.get(key, None)
            kwargs['creator'] = member
            browseTermExists, msg = api.isBrowseTermExists(**kwargs)
            result['response']['browseTermExists'] = browseTermExists
            result['response']['msg'] = msg
            return result
        except Exception, e:
            log.error('isBrowseTermExists Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e)) 

    @d.jsonify()
    @d.trace(log, ['handle'])
    def getDomain(self, handle):
        """
            Get information about domain or pseudodomain term by handle
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            browseTerm = api.getBrowseTermByEncodedID(encodedID=handle)
            if not browseTerm:
                termTypes = g.getBrowseTermTypes()
                domainTypeID = termTypes['domain']
                browseTerm = api.getBrowseTermByHandle(handle=handle, typeID=domainTypeID)
            if not browseTerm:
                pdomainTypeID = termTypes['pseudodomain']
                browseTerm = api.getBrowseTermByHandle(handle=handle, typeID=pdomainTypeID)
            if not browseTerm:
                raise Exception((_(u'No browse term for handle %(name)s')  % {"name":handle}).encode("utf-8"))
            ownedBy = request.params.get('ownedBy')
            if ownedBy and ownedBy not in ['ck12', 'community']:
                raise Exception('Invalid value for ownedBy: %s' % ownedBy)
            result['response'] = self._getInfo(browseTerm, memberID=member.id, prePost=True, ownedBy=ownedBy)
            return result
        except Exception, e:
            log.error('get browseTermInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['subject', 'branch', 'name'])
    def getDomainByName(self, subject, branch, name):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            eidPrefix = '%s.%s.' % (subject, branch)
            browseTerm = api.getDomainTermByName(name=name, eidPrefix=eidPrefix)
            if not browseTerm:
                raise Exception((_(u'No browse term for name %(name)s')  % {"name":name}).encode("utf-8"))
            result['response'] = self._getInfo(browseTerm, memberID=member.id, prePost=True)
            return result
        except Exception, e:
            log.error('get browseTermInfo Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.trace(log, ['id'])
    @beaker_cache(expire=31536000, query_args=True)
    def getAncestors(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            browseTerm = api.getBrowseTermByIDOrName(idOrName=id)
            if not browseTerm:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
                if not browseTerm:
                    raise Exception((_(u'No browse term by name, id or encodedID %(id)s')  % {"id":id}).encode("utf-8"))
            ancestors = []
            ancestorTerms = api.getBrowseTermAncestors(id=browseTerm.id)
            if ancestorTerms:
                for item in ancestorTerms:
                    term = api.getBrowseTermByID(id=item.id)
                    ancestors.append(self._getInfo(term, memberID=member.id))
                    #ancestors.append({'id': term.id, 'name': term.name})
            result['response']['ancestors'] = ancestors
            return result
        except Exception, e:
            log.error('get browseTermAncestors Exception [%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id', 'forceID'])
    def getSynonyms(self, id, forceID="0"):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            if forceID == "1":
                browseTerm = api.getBrowseTermByID(id=id)
            else:
                browseTerm = api.getBrowseTermByIDOrName(idOrName=id)
            if not browseTerm:
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
                if not browseTerm:
                    raise Exception((_(u'No browse term by name or id %(id)s')  % {"id":id}).encode("utf-8"))
            synonyms = []
            synonymTerms = api.getBrowseTermSynonyms(id=browseTerm.id)
            if synonymTerms:
                for item in synonymTerms:
                    term = api.getBrowseTermByIDOrName(idOrName=item.synonymTermID)
                    #synonyms.append({'id': term.id, 'name': term.name})
                    synonyms.append(self._getInfo(term, memberID=member.id))
            result['response']['synonyms'] = synonyms
            return result
        except Exception, e:
            log.error('get browseTermSynonyms Exception [%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getNeighbor(self, id):
        """
            Retrieves the pre-requisite and post-requisite lists of domain
            ids of the given domain id (browse term of domain type).
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            pre, post = api.getDomainNeighborDicts(domainID=id)
            if pre is not None:
                result['response']['pre'] = pre
            if post is not None:
                result['response']['post'] = post
            result['response']['id'] = id
            return result
        except Exception, e:
            log.error('get revisions Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _orderChildren(self, children):
        """
            Order the children in proper order - if it is not possible to use 
            the default encoded id order.
        """
        masterOrder = { 
                    'MAT': 1, 'SCI': 2, 'ENG': 3, 'TEC': 4, 
                    'MAT.ELM': 100, 'MAT.ARI': 101, 'MAT.MEA': 102, 'MAT.ALG': 103, 'MAT.GEO': 104, 'MAT.PRB': 105,
                    'MAT.STA': 106, 'MAT.TRG': 107, 'MAT.ALY': 108, 'MAT.CAL': 109,
                    'MAT.ADV': 110, 'MAT.LOG': 111, 'MAT.GRH': 112, 'MAT.APS': 113,
                    'SCI.ESC': 201, 'SCI.LSC': 202, 'SCI.PSC': 203, 'SCI.BIO': 204, 'SCI.CHE': 205, 'SCI.PHY': 206,
                }
        log.info("Ordering by specialSort")
        return sorted(children, key=lambda child: masterOrder[child['encodedID']] if masterOrder.has_key(child['encodedID']) else 9999)

    def _getChildren(self, term, termLevel=0, levels=1, memberID=None, ownedBy=None, pageNum=0, pageSize=0):
        if levels == 0:
            children = api.getBrowseTermChildren(id=term.id, pageNum=pageNum, pageSize=pageSize)
            return len(children)
        childrenList = []
        children = api.getBrowseTermChildren(id=term.id, pageNum=pageNum, pageSize=pageSize)
        for child in children:
            childrenList.append(self._getInfo(child, level=termLevel+1, memberID=memberID, ownedBy=ownedBy))
            chs = self._getChildren(child, termLevel=termLevel+1, levels=levels-1, memberID=memberID, ownedBy=ownedBy)
            if levels > 1:
                childrenList[-1]['hasChildren'] = len(chs) > 0
                childrenList[-1]['children'] = chs
            elif levels == 1:
                ## Only return if further children are available
                childrenList[-1]['hasChildren'] = chs > 0
        if termLevel <= 1:
            childrenList = self._orderChildren(childrenList)
        return childrenList

    @d.ck12_cache_region('weekly')
    def _getDescendants(self, pageNum, pageSize, id, levels=1, memberID=None, ownedBy=None):
        maxLevels = 7
        if levels < 0:
            levels = 0
        if maxLevels and levels > maxLevels:
            raise Exception(_(u'Levels cannot be greater than %s for performance reasons.' % str(maxLevels)))
        domainType = api.getBrowseTermTypeByName(name="domain")
        term = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
        if not term:
            term = api.getBrowseTermByHandle(handle=id, typeID=domainType.id)
        if not term:
            term = api.getBrowseTermByIDOrName(idOrName=id, type=domainType.id)
        if not term:
            raise Exception((_(u'No term of %(id)s')  % {"id":id}).encode("utf-8"))
        ancestors = api.getBrowseTermAncestors(id=term.id)
        myLevel = len(ancestors)
        termDict = self._getInfo(term, level=myLevel, memberID=memberID, ownedBy=ownedBy)
        children = api.getBrowseTermChildren(id=term.id, pageNum=pageNum, pageSize=pageSize)
        grandChildren = self._getChildren(term, termLevel=myLevel, levels=levels, memberID=memberID, ownedBy=ownedBy, pageNum=pageNum, pageSize=pageSize)
        return termDict, children.getTotal(), grandChildren

    @d.jsonify()
    @d.setPage(request, ['id', 'levels'])
    @d.trace(log, ['id', 'levels', 'pageNum', 'pageSize'])
    def getDescendants(self, pageNum, pageSize, id, levels=1):
        """
            Get descendants for a browse category
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        levels = int(levels)
        member = u.getCurrentUser(request, anonymousOkay=True)
        try:
            ## Get the ownedBy filter - defaults to ck12
            ownedBy = request.params.get('ownedBy', 'ck12')
            if ownedBy and ownedBy not in ['ck12', 'community']:
                raise Exception('Invalid value for ownedBy: %s' % ownedBy)
            termDict, childrenCnt, grandChildren = self._getDescendants(pageNum, pageSize, id, levels, member.id, ownedBy)
            result['response']['term'] = termDict
            result['response']['total'] = childrenCnt
            result['response']['term']['hasChildren'] = childrenCnt > 0
            result['response']['term']['children'] = grandChildren
            if type(result['response']['term']['children']).__name__ == 'list':
                result['response']['limit'] = len(result['response']['term']['children'])
            else:
                result['response']['limit'] = result['response']['term']['children']
            result['response']['offset'] = (pageNum-1) * pageSize
            return result
        except Exception, e:
            log.error('get browse term descendants exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))

    #
    #  Create related APIs.
    #
    def __createBrowseTerm(self):
        browseTermTypes = api.getBrowseTermTypes()
        c.browseTermTypeDict = {}
        for browseTermType in browseTermTypes:
            c.browseTermTypeDict[str(browseTermType.id)] = browseTermType.name
        c.browseTermTypeKeys = sorted(c.browseTermTypeDict.keys(), cmp=h.num_compare)
        subjectBrowseTerms = api.getSubjectBrowseTerms()
        c.subjectBrowseTermDict = {}
        for subjectBrowseTerm in subjectBrowseTerms:
            c.subjectBrowseTermDict[str(subjectBrowseTerm.id)] = subjectBrowseTerm.name
        c.subjectBrowseTermKeys = sorted(c.subjectBrowseTermDict.keys(), cmp=h.num_compare)
        c.browseTermList = [ 'name' ]
        c.prefix = self.prefix
        return render('/flx/browseTerm/createForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createDomain(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        name = request.GET['name']
        handle = request.GET['handle']
        encodedID = request.GET['encodedID']
        subjectEncodedID = request.GET.get('subjectEncodedID', None)
        branchEncodedID = request.GET.get('branchEncodedID', None)
        parentEncodedID = request.GET.get('parentEncodedID', None)
        previewImageUrl = request.GET.get('previewImageUrl', None)
        previewIconUrl = request.GET.get('previewIconUrl', None)
        description = request.GET.get('description', None)
        passKey = request.GET.get('passKey', None)
        try:
            domainTerm = api.createDomainTerm(name=name,
                                              handle=handle,
                                              encodedID=encodedID,
                                              subjectEncodedID=subjectEncodedID,
                                              branchEncodedID=branchEncodedID,
                                              parentEncodedID=parentEncodedID,
                                              previewImageUrl=previewImageUrl,
                                              previewIconUrl=previewIconUrl,
                                              description=description,
                                              passKey=passKey,
                                              creator=member)
            result['response']['id'] = domainTerm.id
            result['response']['name'] = domainTerm.name
            return result
        except Exception, e:
            log.error('create domain term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_BROWSE_TERM
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createDomainNeighbor(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

        encodedID = request.GET['encodedID']
        reqEncodedID = request.GET['requiredEncodedID']
        try:
            domainTerm = api.getDomainTermByEncodedID(encodedID)
            reqDomainTerm = api.getDomainTermByEncodedID(reqEncodedID)
            pre = api.getPreDomainIDs(domainID=domainTerm.id)
            # Create Domain Neighbor if it does not exists.
            if reqDomainTerm.id not in pre:
                domainNeighbors = api.createDomainNeighbor(domainID=domainTerm.id, requiredDomainIDs=[reqDomainTerm.id])
                result['response']['domainID'] = domainNeighbors[0].domainID
                result['response']['requiredDomainID'] = domainNeighbors[0].requiredDomainID
            else:
                result['response']['domainID'] = domainTerm.id
                result['response']['requiredDomainID'] = reqDomainTerm.id

            return result
        except Exception, e:
            log.error('create domain term neighbor Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_BROWSE_TERM_NEIGHBOR
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteDomain(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            encodedID = request.GET.get('encodedID', None)
            if not encodedID:
                raise Exception('encodedID not specified. Please sepcify the encodedID')
            passKey = request.GET.get('passKey', None)
            domainTerm = api.deleteDomainTermByEncodedID(encodedID=encodedID,
                                                        passKey=passKey, creator=member)
            if domainTerm:
                result['response']['id'] = domainTerm.id
                result['response']['name'] = domainTerm.name
            else:
                result['response']['id'] = 0
                result['response']['name'] = 'None'
            return result
        except Exception, e:
            log.error('delete domain term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_BROWSE_TERM
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteDomainNeighbor(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            encodedID = request.GET.get('encodedID', None)
            if not encodedID:
                raise Exception('encodedID not specified. Please sepcify the encodedID')
            reqEncodedID = request.GET.get('requiredEncodedID', None)
            domainTerm = api.getDomainTermByEncodedID(encodedID)
            if reqEncodedID:
                reqDomainTerm = api.getDomainTermByEncodedID(reqEncodedID)
                api.deleteDomainNeighbor(domainID=domainTerm.id, requiredDomainID=reqDomainTerm.id)
            else:
                api.deleteDomainNeighbor(domainID=domainTerm.id)
            return result
        except Exception, e:
            log.error('delete domain term neighbor Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_BROWSE_TERM_NEIGHBOR
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def updateDomain(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            encodedID = request.params.get('encodedID', None)
            if not encodedID:
                raise Exception('encodedID not specified. Please sepcify the encodedID')
            domainTerm = api.getDomainTermByEncodedID(encodedID)
            if not domainTerm:
                raise Exception('No domainTerm exists for encodedID:%s ' % encodedID)

            kwargs = { 'id': domainTerm.id }
            kwargs['encodedID'] = encodedID
            kwargs['passKey'] = request.params.get('passKey', None)
            
            for key in ['name', 'handle', 'description', 'termTypeID', 'previewImageUrl', 'previewIconUrl']:
                if request.params.has_key(key):
                    kwargs[key] = request.params.get(key, '').strip()
    
            if request.params.has_key('parentEncodedID'):
                parentTerm = api.getBrowseTermByEncodedID(encodedID=request.params.get('parentEncodedID'))
                if not parentTerm:
                    raise Exception('No parent exists for parentEncodedID:%s' % request.params.get('parentEncodedID'))
                kwargs['parentID'] = parentTerm.id
            kwargs['forceUpdate'] = str(request.params.get('forceUpdate')).lower() == 'true'
            kwargs['creator'] = member

            domainTerm = api.updateDomainTerm(**kwargs)
            domainTermID = domainTerm.id
            # Reload the cache.
            api.invalidateBrowseTerm(BrowseTermCache(), browseTermID=domainTermID)
            BrowseTermCache().load(domainTermID)
            taskId = h.reindexArtifacts([-domainTermID])
            log.info("Task id for BrowseTerm reindex: %s" % taskId)
            result['response']['id'] = domainTermID
            result['response']['name'] = domainTerm.name
            return result
        except Exception, e:
            log.error('update domain term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_BROWSE_TERM
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createForm(self):
        return self.__createBrowseTerm()

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def create(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        name = request.POST['name']
        termTypeID = request.POST['typeID']
        handle = request.POST.get('handle')
        encodedID = request.POST['encodedID']
        try:
            if request.POST.has_key('parentID'):
                parentID = request.POST['parentID']
                if parentID == '':
                    parentID = None
            else:
                parentID = None
            browseTerm = api.createBrowseTerm(name=name,
                                              handle=handle,
                                              parentID=parentID,
                                              browseTermType=termTypeID,
                                              encodedID=encodedID)
	    result['response']['id'] = browseTerm.id
	    result['response']['name'] = browseTerm.name
            return result
        except Exception, e:
            log.error('create browse term Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_BROWSE_TERM
	    try:
                browseTerm = api.getBrowseTerm(name=name,
                                               browseTermTypeID=termTypeID)
		if browseTerm is not None:
		    infoDict = {
				'id': browseTerm.id,
				'name': browseTerm.name
			       }
	    except Exception:
		infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createSynonymForm(self):
        browseTerms = api.getBrowseTerms(pageSize=0) ## Get all
        log.info("Total number of browseTerms: %d" % len(browseTerms))
        c.browseTerms = browseTerms
        c.prefix = self.prefix
        return render('/flx/browseTerm/create/SynonymForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def createSynonym(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        termID = request.POST['termID']
        synonymTermID = request.POST['synonymTermID']
        try:
            if termID == synonymTermID:
                raise Exception((_(u"Cannot create a synonym for itself. termID: %(termID)s")  % {"termID":termID}).encode("utf-8"))
            browseTermSynonym = api.createBrowseTermSynonym(termID=termID, synonymTermID=synonymTermID)
            result['response']['termID'] = browseTermSynonym.termID
            result['response']['synonymTermID'] = browseTermSynonym.synonymTermID
            return result
        except Exception, e:
            log.error('create browse term synonym Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_BROWSE_TERM_SYNONYM
            return ErrorCodes().asDict(c.errorCode, message=str(e))

    @d.checkAuth(request)
    @d.trace(log)
    def deleteSynonym(self):
        pass 

    def __createBrowseTermAssociation(self):
        artifacts = api.getArtifacts()
        c.artifactDict = {}
        for artifact in artifacts:
            title = artifact.type.name + '.' + artifact.name #.decode('utf-8')
            c.artifactDict[title] = str(artifact.id)
        c.artifactKeys = sorted(c.artifactDict.keys())
        browseTerms = api.getBrowseTerms()
        c.browseTermDict = {}
        for browseTerm in browseTerms:
            s = '.'.join([ browseTerm.name, browseTerm.type.name ])
            c.browseTermDict[str(browseTerm.id)] = s
        c.browseTermKeys = sorted(c.browseTermDict.keys(), cmp=h.num_compare)
        c.prefix = self.prefix
        return render('/flx/browseTerm/createAssociationForm.html')

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createAssociationForm(self):
        return self.__createBrowseTermAssociation()

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            browseTermID = int(request.POST['browseTermID'])
            api.createArtifactHasBrowseTerm(artifactID=artifactID,
					    browseTermID=browseTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            api.invalidateBrowseTerm(BrowseTermCache(), browseTermID, artifact.creatorID)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID])
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('create browse term association Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_BROWSE_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = int(request.POST['artifactID'])
            artifact = api.getArtifactByID(id=artifactID)
            browseTermID = int(request.POST['browseTermID'])
            api.deleteArtifactHasBrowseTerm(
					    artifactID=artifactID,
					    browseTermID=browseTermID)
            api.invalidateArtifact(ArtifactCache(), artifact, memberID=member.id)
            api.invalidateBrowseTerm(BrowseTermCache(), browseTermID, member.id)
            ## Call the reindex method
            taskId = h.reindexArtifacts([artifactID], member.id)
            log.info("Task id for reindex: %s" % taskId)
            return result
        except Exception, e:
            log.error('delete browse term association Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_BROWSE_TERM_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def loadDataFromCSV(self, member):
        """ Load the browseTerm association data from a CSV file. The file format is as follows:
            | artifactID | browseTerm | browseTermType (opt) | browseTermParent (opt) | encodedID (opt) | action (opt)
              |            |            |                      |                        |                     - 'add|remove' (add is assumed if empty)
              |            |            |                      |                         - Encoded ID for foundation grid term (used to break ties if "browseTerm" returns more than one browseTerms)
              |            |            |                       - Needed only when adding a new browseTerm
              |            |             - Needed only when adding a new browseTerm or to uniquely identify one 
              |             - The browseTerm to associte with artifact (this could be the encodedID for foundation grid terms (type='domain')
               - artifact id
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        savedFilePath = None
        try:
            if not request.params.has_key('file') and request.params.get('data'):
                data = request.params.get('data')
                data = json.loads(data)
                ## Create the temp file
                file = NamedTemporaryFile(suffix='.csv', dir=config.get('cache_share_dir'), delete=False)
                writer = UnicodeWriter(file)
                writer.writerow(['artifactID', 'browseTerm', 'browseTermType', 'browseTermParent', 'encodedID', 'action'])
                for row in data:
                    writer.writerow([row.get('artifactID', ''), 
                        row.get('browseTerm', ''),
                        row.get('browseTermType', ''),
                        row.get('browseTermParent', ''),
                        row.get('encodedID', ''),
                        row.get('action', '')])
                file.close()
                savedFilePath = file.name
                log.info("Created savedFilePath: %s" % savedFilePath)
            elif request.params.has_key('file'):
                ## save the file to temp location
                savedFilePath = h.saveUploadedFile(request, 'file', dir=config.get('cache_share_dir'))
            else:
                raise Exception((_(u'CSV File or JSON formatted data required.')).encode("utf-8"))
            if not request.params.has_key('toReindex'):
                toReindex = True
            else:
                toReindex = request.params.get('toReindex')
                toReindex = toReindex == 'True'
            waitFor = str(request.params.get('waitFor')).lower() == 'true'
            log.info("Wait for task? %s" % str(waitFor))
            if waitFor:
                ## Run in-process
                browseTermLoad = bttasks.QuickBrowseTermLoaderTask()
                ret = browseTermLoad.apply(kwargs={'csvFilePath': savedFilePath, 'user': member.id, 'loglevel': 'INFO', 'toReindex': toReindex})
                result['response'] = ret.result
            else:
                browseTermLoad = bttasks.BrowseTermLoaderTask()
                task = browseTermLoad.delay(csvFilePath=savedFilePath, loglevel='INFO', user=member.id, toReindex=toReindex)
                result['response']['taskID'] = task.task_id
            return result
        except Exception, e:
            log.error('load browseTerms data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_BROWSE_TERM_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def loadBrowseTermsForm(self):
        c.prefix = self.prefix
        return render('/flx/browseTerm/uploadBrowseTermsForm.html')

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def loadFoundationGridForm(self):
        c.prefix = self.prefix
        return render('/flx/browseTerm/uploadFoundationGridForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def loadFoundationGridFromCSV(self):
        """
            Load foundation grid terms and their relationships from comma-separated values file
            The format is expected to be:
                foundation_code | name | parent_code (optional) | required_codes (optional)
                |                 |      |                        + comma-separated encoded ids of prerequisites 
                |                 |       - Optional parent encoded id
                |                  - Browse term
                 - Encoded id for the browse term
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        messages = []
        try:
            ## save the file to temp location
            savedFilePath = h.saveUploadedFile(request, 'file')
            import csv
            csvReader = csv.DictReader(open(savedFilePath, 'r'))
            rowCnt = 0
            domainType = api.getBrowseTermTypeByName(name='domain')
            for row in csvReader:
                try:
                    rowCnt += 1
                    if row['foundation_code']:
                        encodedID = row['foundation_code']
                        encodedID = h.formatEncodedID(encodedID)
                        term = api.getBrowseTermByEncodedID(encodedID=encodedID)
                        parentID = None
                        if row['name']:
                            name = row['name']
                            if not term:
                                terms = api.getBrowseTermsByName(name=name)
                                if terms:
                                    for aterm in terms:
                                        if not aterm.encodedID and aterm.termTypeID == domainType.id:
                                            term = aterm
                                            break
                            if row['parent_code']:
                                parentCode = row['parent_code']
                                parentCode = h.formatEncodedID(parentCode)
                                parent = api.getBrowseTermByEncodedID(encodedID=parentCode)
                                if not parent:
                                    raise Exception((_(u'No parent term with encodedID: %(parentCode)s')  % {"parentCode":parentCode}).encode("utf-8"))
                                parentID = parent.id

                            if not term:
                                term = api.createBrowseTerm(name=name, browseTermType=domainType, parentID=parentID, encodedID=encodedID)
                                messages.append('Row %d: Successfully created browseTerm with encoded id: %s' % (rowCnt, encodedID))
                            else:
                                term = api.updateBrowseTerm(id=term.id, name=name, termTypeID=domainType.id, parentID=parentID, encodedID=encodedID)
                                messages.append('Row %d: Successfully update browseTerm with encoded id: %s' % (rowCnt, encodedID))

                            ## Create domain neighbor relationships
                            if row['required_codes']:
                                requiredDomainIDs = []
                                required_codes = row['required_codes'].split(',')
                                if required_codes:
                                    for rcode in required_codes:
                                        rcode = h.formatEncodedID(rcode)
                                        rterm = api.getBrowseTermByEncodedID(encodedID=rcode)
                                        if not rterm:
                                            raise Exception((_(u'No required term with encodedID: %(rcode)s')  % {"rcode":rcode}).encode("utf-8"))
                                        requiredDomainIDs.append(rterm.id)

                                    if requiredDomainIDs:
                                        api.createDomainNeighbor(domainID=term.id, requiredDomainIDs=requiredDomainIDs)
                        else:
                            raise Exception((_(u'No term name specified for row %(rowCnt)d. Skipping ...')  % {"rowCnt":rowCnt}).encode("utf-8"))
                    else:
                        raise Exception((_(u"No foundation_code specified for row %(rowCnt)d")  % {"rowCnt":rowCnt}).encode("utf-8"))

                except Exception, e:
                    log.error('Error occurred when processing row: %d' % rowCnt)
                    log.error(e, exc_info=e)
                    messages.append('ERROR: %s' % str(e))
            result['response']['messages'] = messages
            return result
        except Exception, e:
            log.error('load foundationGrid Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_BROWSE_TERM_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def loadBrowseTermCandidatesFromCSVForm(self):
        c.prefix = self.prefix
        return render('/flx/browseTerm/uploadCandidatesForm.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def loadBrowseTermCandidatesFromCSV(self):
        """
            Load all browse category candidates 
            Format:
            | CATEGORY | CANDIDATE | CANDIDATE ... | START | END |
              |          |                           |       |
              |          |                           |       |
              |          |                           |       + End of domain term range (encoded id)
              |          |                           + Start of domain term range (encoded id)
              |          + One or more columns each with one candidate domain term 
              + Name of the category
        """

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        messages = []
        try:
            ## save the file to temp location
            savedFilePath = h.saveUploadedFile(request, 'file')
            import csv
            csvReader = csv.DictReader(open(savedFilePath, 'r'))
            rowCnt = 0
            seenCategories = {}
            for row in csvReader:
                try:
                    rowCnt += 1
                    if row['CATEGORY']:
                        category = row['CATEGORY'].lower()
                        category = h.formatEncodedID(category)
                        cat = api.getBrowseTermByEncodedID(encodedID=category)
                        if not cat:
                            raise Exception((_(u'No such term by encodedID: %(category)s')  % {"category":category}).encode("utf-8"))

                        if not seenCategories.has_key(cat.id):
                            api.deleteBrowseTermCandidateRangesForTerm(categoryID=cat.id)
                            seenCategories[cat.id] = 1000

                        candidates = []
                        colCnt = 1
                        while True:
                            name = 'CANDIDATE_%d' % colCnt
                            if row.has_key(name):
                                if row[name]:
                                    candID = h.formatEncodedID(row[name])
                                    candidates.append(candID)
                            else:
                                break
                            colCnt += 1

                        cndCnt = 1
                        for candidate in candidates:
                            try:
                                if not api.hasBrowseTermCandidate(categoryID=cat.id, domainID=candidate):
                                    api.createBrowseTermCandidate(categoryID=cat.id, rangeStart=candidate, rangeEnd=candidate, sequence=cndCnt)
                                    messages.append('Row %d: Candidate %s successfully associated with browseCategory: %s' % (rowCnt, candidate, category))
                                else:
                                    messages.append('Row %d: Candidate %s already exists for browseCategory: %s' % (rowCnt, candidate, category))
                            except Exception, e:
                                messages.append('ERROR: Row %d: Error saving browseTermCandidate: %s [%s]' % (rowCnt, candidate, str(e)))
                            cndCnt += 1

                        start = None
                        end = None
                        if row['START']:
                            start = row['START']
                            start = h.formatEncodedID(start)
                            startParts = start.split('.')
                        if row['END']:
                            end = row['END']
                            end = h.formatEncodedID(end)
                            endParts = end.split('.')

                        if start and end and len(startParts) == len(endParts) and startParts[:2] == endParts[:2]:
                            if seenCategories.has_key(cat.id):
                                seenCategories[cat.id] += 1
                            try:
                                api.createBrowseTermCandidate(categoryID=cat.id, rangeStart=start, rangeEnd=end, sequence=seenCategories[cat.id])
                                messages.append('Row %d: Range %s to %s successfully added for category: %s' % (rowCnt, start, end, category))
                            except Exception, e:
                                messages.append('ERROR: Row %d: Error saving candidate range [%s]' % (rowCnt, str(e)))
                        else:
                            messages.append('ERROR: Row %d: Invalid start or end or start and end do not belong to the the same SUBJECT.BRANCH [%s, %s]' % (rowCnt, start, end))

                    else:
                        raise Exception((_(u"No category specified for row %(rowCnt)d")  % {"rowCnt":rowCnt}).encode("utf-8"))

                except Exception, e:
                    log.error('Error occurred when processing row: %d' % rowCnt)
                    log.error(e, exc_info=e)
                    messages.append('ERROR: %s' % str(e))
            result['response']['messages'] = messages
            return result
        except Exception, e:
            log.error('load browseTermCandidates Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_BROWSE_CANDIDATE_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _addDomainTerm(self, term):
        domainType = api.getBrowseTermTypeByName(name='domain')
        term = api.createBrowseTerm(name=term, encodedID=term, browseTermType=domainType)
        return term

    @d.jsonify()
    @d.filterable(request, ['id', 'type', 'all', 'sort'])
    @d.setPage(request, ['id', 'type', 'all', 'sort', 'fq'])
    @d.trace(log, ['id', 'type', 'all', 'sort', 'fq', 'pageSize', 'pageNum'])
    def browseArtifactsByRange(self, pageNum, pageSize, id, fq, type=None, all=False, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize

            domainType = api.getBrowseTermTypeByName(name='domain')
            cat = api.getBrowseTermByIDOrName(idOrName=id, type=domainType.id)
            if not cat:
                ## Check if it is an encodedID
                cat = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
                if not cat:
                    raise Exception((_(u'No such term: %(id)s')  % {"id":id}).encode("utf-8"))
            log.info('All: %s' % all)
            getAll = False
            if str(all).lower() == 'true' or str(all).lower() == 'all':
                getAll = True

            log.info('All: %s' % getAll)
            log.info("Sort order: %s" % sort)

            if not getAll:
                candidates = api.getCandidatesForBrowseTerm(categoryID=cat.id, maxSequence=100, includeRanges=False)
                ranges = []
                if candidates:
                    for candidate in candidates:
                        ranges.append({'rangeStart': candidate.rangeStart, 'rangeEnd': candidate.rangeStart})
                log.info("Candidates: %s" % ranges)

                sort = None
            else:
                ranges = []
                rangeObjs = api.getBrowseTermCandidateRangesForTerm(categoryID=cat.id)
                for range in rangeObjs:
                    ranges.append({'rangeStart': range.rangeStart, 'rangeEnd': range.rangeEnd})
                sort = solrclient.getSortOrder(sort)
            
            ## Make the query
            hits = api.browseArtifactsByCategoryRanges(ranges=ranges,
                                                       typeName=type,
                                                       fq=fq,
                                                       sort=sort,
                                                       start=start,
                                                       rows=pageSize,
                                                       memberID=memberID)

            result['response'] = {
                    'results': hits['artifactList'], 
                    'total': hits['numFound'], 
                    'limit': len(hits['artifactList']), 
                    'offset': start,
                    'filters': hits['facets'],
                    }
            return result
        except Exception, e:
            log.error('browse artifacts by browse category Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))    
    
    @d.jsonify()
    @d.sortable(request, ['id', 'type', 'all'])
    @d.filterable(request, ['id', 'type', 'all', 'sort'])
    @d.setPage(request, ['id', 'type', 'all', 'sort', 'fq'])
    @d.trace(log, ['id', 'type', 'all', 'sort', 'fq', 'pageSize', 'pageNum'])
    def browseArtifacts(self, pageNum, pageSize, id, fq, type=None, all=False, sort='domainPrefix,asc;domainEncoding,asc;iencodedID,asc'):
        """
            ##################################################################
            # THIS API IS BEING USED BY EXTERNAL CLIENTS AND APPLICATIONS
            # PLEASE MAINTAIN BACKWARD COMPATIBILITY AT ALL TIMES
            ##################################################################
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #timeit = True
            ## No spelling suggestions
            member = u.getCurrentUser(request, anonymousOkay=False)
            memberID = member.id if member is not None else None
            start = (pageNum-1) * pageSize

            domainType = api.getBrowseTermTypeByName(name='domain')
            cat = api.getBrowseTermByIDOrName(idOrName=id, type=domainType.id)
            if not cat:
                ## Check if it is an encodedID
                cat = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(id))
                if not cat:
                    raise Exception((_(u'No such domain term: %(id)s')  % {"id":id}).encode("utf-8"))
            if not cat.encodedID:
                raise Exception((_(u'Not a valid domain term: %(id)s. Does not have encodedID.')  % {"id":id}).encode("utf-8"))

            log.info('All: %s' % all)
            getAll = False
            if str(all).lower() == 'true' or str(all).lower() == 'all':
                getAll = True

            includeEIDs = None
            eids = request.params.get('includeEIDs')
            if eids:
                try:
                    includeEIDs = [ int(x.strip()) for x in eids.split(',') ]
                except:
                    raise Exception((_(u'includeEIDs must be a comma-separated list of integers')).encode("utf-8"))

            levels = None
            if request.params.get('levels'):
                levels = [ x.strip().lower() for x in str(request.params.get('levels')).split(',') ]

            includeRelated = str(request.params.get('includeRelated')).lower() == 'true'
            log.info('All: %s' % getAll)
            if not sort:
                sort = 'domainPrefix,asc;domainEncoding,asc;iencodedID,asc'
            log.info("Sort order: %s" % sort)

            terms = [cat.encodedID]
            grandkids = []
            includeChildren = False
            if not getAll:
                children = api.getBrowseTermChildren(id=cat.id)
                for child in children:
                    terms.append(child.encodedID)
                    gks = api.getBrowseTermChildren(id=child.id)
                    for gk in gks:
                        grandkids.append(gk.encodedID)
                        ## Only the first grandkid
                        break

                terms.extend(grandkids)
                #includeChildren = True
            else:
                if cat.encodedID.upper() == 'CKT':
                    terms.append('MAT.*')
                    terms.append('SCI.*')
                elif cat.encodedID.count('.') <= 1:
                    terms.append('%s.*' % cat.encodedID)
                else:
                    #if timeit: s = int(time.time() * 1000)
                    descendants = api.getBrowseTermDescendants(id=cat.id, levels=None)
                    #if timeit: log.info("Time spent getting descendants (ms): %d" % (int(time.time()*1000) - s))
                    for t in descendants:
                        terms.append(t.encodedID)

            sort = solrclient.getSortOrder(sort)
            modifiedAfter = request.params.get('modifiedAfter')

            ## Make the query
            hits = api.browseArtifactsByCategory(
                                            terms=terms,
                                            typeName=type,
                                            includeChildren=includeChildren,
                                            includeEIDs=includeEIDs,
                                            includeRelated=includeRelated,
                                            levels=levels,
                                            fq=fq,
                                            sort=sort,
                                            start=start,
                                            rows=pageSize,
                                            memberID=memberID,
                                            modifiedAfter=modifiedAfter,
                                            idsOnly=True)

            artifacts = []
            for a in hits['artifactList']:
                aDict, art = ArtifactCache().load(a, memberID=memberID, infoOnly=True)
                artifacts.append(aDict)
            result['response'] = {
                    'results': artifacts,
                    'total': hits['numFound'], 
                    'limit': len(hits['artifactList']), 
                    'offset': start,
                    'filters': hits['facets'],
                    }
            return result
        except Exception, e:
            log.error('browse artifacts by browse category Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def importConceptMap(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        start = datetime.now()
        try:
            savedFilePath = h.saveUploadedFile(request, 'file')
            flxHome = config.get('flx_home')
            f = NamedTemporaryFile()
            outputName = os.path.join('flx', 'public', 'media', 'mapcache', os.path.basename(f.name))
            f.close()
            from flx.lib.cxlparser import cxlParse
            cxlParse.parse(savedFilePath, os.path.join(flxHome, outputName))
            if request.params.get('userform'):
                c.url = outputName.replace('/public/', '/') + '.html'
                c.imported = True
                c.prefix = self.prefix
                c.member = member
                return render('/flx/browseTerm/conceptMapImport.html')
            else:
                result['response']['generatedFile'] = outputName
                return d.jsonifyResponse(result, start)
        except Exception, e:
            log.error('import concept map Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_IMPORT_CONCEPT_MAP
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), start)

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def importConceptMapForm(self, member):
        c.prefix = self.prefix
        c.member = member
        return render('/flx/browseTerm/conceptMapImport.html')

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log)
    def deleteBranch(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            encodedID = request.GET.get('encodedID', None)
            if not encodedID:
                raise Exception('encodedID not specified. Please sepcify the encodedID')
            passKey = request.GET.get('passKey', None)
            domainTerm = api.deleteBranch(encodedID=encodedID,
                                                        passKey=passKey)
            result['response']['id'] = domainTerm.id
            result['response']['name'] = domainTerm.name
            return result
        except Exception, e:
            log.error('delete branch Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_BROWSE_TERM
            infoDict = None
            return ErrorCodes().asDict(c.errorCode,
                                       message=str(e),
                                       infoDict=infoDict)
