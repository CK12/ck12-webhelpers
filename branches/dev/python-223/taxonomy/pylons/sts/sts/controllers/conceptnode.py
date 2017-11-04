import logging
import datetime
import os
from datetime import datetime
import traceback
from tempfile import NamedTemporaryFile

from pylons import request, tmpl_context as c

from sts.controllers import decorators as d
import sts.controllers.subjectbranch as sb
import sts.controllers.activitylog as alog
import sts.controllers.user as u
from sts.model import api
from sts.model.model import ConceptNode, ActivityLog, name2Handle
from sts.lib.base import BaseController, render
import sts.lib.helpers as h
from sts.lib.unicode_util import UnicodeDictReader, UnicodeWriter
from sts.model import graph_model
from sts.util import util

from sts.controllers.errorCodes import ErrorCodes

PUBLISHED = 'published'
PROPOSED = 'proposed'
DELETED = 'deleted'

log = logging.getLogger(__name__)

class ConceptnodeController(BaseController):

    def _getConceptNode(self, encodedID, includeRedirectionConcept=False):
        """
            Convenience method to get a conceptNode by either encodedID or handle
        """
        #1st search with the given encodedID
        conceptNode = api.getConceptNodeByEncodedID(encodedID=encodedID)
        if not conceptNode:
            conceptNode = api.getConceptNodeByHandle(handle=encodedID)
            if not conceptNode:
                conceptNode = api.getConceptNodeByOldHandle(oldHandle=encodedID)

        #search with the processedEncodedID as encodedID if no conceptNode could be found
        if not conceptNode:
            processedEncodedID = util.processEncodedID(encodedID)
            if processedEncodedID != encodedID:
                conceptNode = api.getConceptNodeByEncodedID(encodedID=processedEncodedID)

        if includeRedirectionConcept is True:
            if not conceptNode:
                redirectedReferences = [encodedID]
            else:
                redirectedReferences = []
                if conceptNode.info.get('handle'):
                    redirectedReferences.append(conceptNode.info.get('handle'))
                if conceptNode.info.get('encodedID'):
                    redirectedReferences.append(conceptNode.info.get('encodedID'))
                if conceptNode.info.get('oldHandles'):
                    redirectedReferences.extend(conceptNode.info.get('oldHandles'))
            
            redirectionGraphConceptNodes = api.getGraphConceptNodesByRedirectedReferences(redirectedReferences=redirectedReferences)
            if len(redirectionGraphConceptNodes) == 0:
                redirectionGraphConceptNode = None
                if not redirectionGraphConceptNode:
                    processedRedirectedReferences = []
                    for redirectedReference in redirectedReferences:
                        processedRedirectedReference = util.processEncodedID(redirectedReference)
                        if processedRedirectedReference != redirectedReference and processedRedirectedReference not in processedRedirectedReferences:
                            processedRedirectedReferences.append(processedRedirectedReference)
                    if processedRedirectedReferences:
                        redirectionGraphConceptNodes = api.getGraphConceptNodesByRedirectedReferences(redirectedReferences=processedRedirectedReferences)                    
                        if len(redirectionGraphConceptNodes) == 1:
                            redirectionGraphConceptNode = redirectionGraphConceptNodes[0]
                        elif len(redirectionGraphConceptNodes) > 1:
                            raise Exception('Multiple redirection concept nodes are found for the given node with for eid or handle: %s' % encodedID)
            elif len(redirectionGraphConceptNodes) == 1:
                redirectionGraphConceptNode = redirectionGraphConceptNodes[0]
            else:
                raise Exception('Multiple redirection concept nodes are found for the given node with for eid or handle: %s' % encodedID)

            if redirectionGraphConceptNode:
                redirectionGraphConceptNodeProperties = redirectionGraphConceptNode._properties
                if not redirectionGraphConceptNodeProperties:
                    redirectionGraphConceptNodeProperties = redirectionGraphConceptNode.get_properties()
                    
                if redirectionGraphConceptNodeProperties.get('encodedID'):
                    redirectionConceptNodeReference = redirectionGraphConceptNodeProperties.get('encodedID')
                elif redirectionGraphConceptNodeProperties.get('handle'):
                    redirectionConceptNodeReference = redirectionGraphConceptNodeProperties.get('handle')
                elif redirectionGraphConceptNodeProperties.get('oldHandles'):
                    redirectionConceptNodeReference = redirectionGraphConceptNodeProperties.get('oldHandles')[0]

                redirectionConceptNode  = self._getConceptNode(redirectionConceptNodeReference, True)
                if redirectionConceptNode:
                    if not conceptNode:
                        conceptNode = graph_model.conceptNode({}, api.graph_db)
                    conceptNode.info['redirectionConcept'] = redirectionConceptNode.asDict()

        if not conceptNode:
            raise Exception('No concept node for eid or handle: %s' % encodedID)
        return conceptNode

    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getInfo(self, encodedID):
        """
            Get information about a concept node given its encodedID or handle
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            conceptNode = self._getConceptNode(encodedID, includeRedirectionConcept=True)
            result['response'] = conceptNode.asDict()
            return result
        except Exception, e:
            log.error('get conceptNode Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(['subjectID', 'branchID', 'toplevel'])
    @d.trace(log, ['subjectID', 'branchID', 'toplevel', 'pageNum', 'pageSize'])
    def getConceptNodes(self, subjectID, branchID, toplevel=None, pageNum=0, pageSize=0):
        """
            Get concept nodes for a given subject and branch
            The subject and branch are retrieved via either respective ids or shortnames
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            #@d.ck12_cache_region('hourly')
            def _getConceptNodes(subjectID, branchID, toplevel, pageNum, pageSize):
                subject = sb.getSubject(subjectID)
                branch = sb.getBranch(branchID)
                toplevel = str(toplevel).lower() == 'top'

                conceptNodes = api.getConceptNodes(subjectID=subject.id, branchID=branch.id, toplevel=toplevel, pageSize=pageSize, pageNum=pageNum)

                result['response']['total'] = conceptNodes.getTotal()
                result['response']['offset'] = (pageNum - 1) * pageSize
                result['response']['limit'] = len(conceptNodes.results)
                result['response']['conceptNodes'] = [ x.asDict() for x in conceptNodes ]
                return result

            result = _getConceptNodes(subjectID, branchID, toplevel, pageNum, pageSize)
            return result
        except Exception, e:
            log.error('get conceptNodes by subject and branch Exception[%s]' % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(['encodedID'])
    @d.trace(log, ['encodedID', 'pageNum', 'pageSize'])
    def getPreviousInfo(self, encodedID, pageNum=0, pageSize=0):
        """
            Get the previous concept node to the one identified by encodedID or handle using the implicit ordering
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #@d.ck12_cache_region('hourly')
            def _getPreviousInfo(encodedID, pageNum, pageSize):
                if pageSize == 0:
                    pageSize = 10
                conceptNode = self._getConceptNode(encodedID)

                prev = api.getPreviousConceptNodes(id=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
                result['response']['total'] = prev.getTotal()
                result['response']['offset'] = (pageNum-1) * pageSize;
                result['response']['limit'] = len(prev.results)
                result['response']['conceptNodes'] = [ x.asDict() for x in prev ]
                log.info(result['response']['conceptNodes'])
                return result

            result = _getPreviousInfo(encodedID, pageNum, pageSize)
            return result
        except Exception, e:
            log.error('get previous conceptNode Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(['encodedID'])
    @d.trace(log, ['encodedID', 'pageNum', 'pageSize'])
    def getNextInfo(self, encodedID, pageNum=0, pageSize=0):
        """
            Get the next concept nodes to the one identified by encodedID or handle using the implicit ordering
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #@d.ck12_cache_region('hourly')
            def _getNextInfo(encodedID, pageNum, pageSize):
                if pageSize == 0:
                    pageSize = 10
                conceptNode = self._getConceptNode(encodedID)

                next = api.getNextConceptNodes(id=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
                result['response']['total'] = next.getTotal()
                result['response']['offset'] = (pageNum-1) * pageSize
                result['response']['limit'] = len(next.results)
                result['response']['conceptNodes'] = [ x.asDict() for x in next ]
                return result

            result = _getNextInfo(encodedID, pageNum, pageSize)
            return result
        except Exception, e:
            log.error('get next conceptNode Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getPrereqs(self, conceptNode, level, prereqs=None, pageNum=0, pageSize=0):
        log.info("Called _getPrereqs with conceptNode: %s, level: %d, pageNum: %d, pageSize: %d" % (conceptNode.encodedID, level, pageNum, pageSize))
        prerequisites = []
        if level < 0:
            return prerequisites
        if not prereqs:
            # Get all the nodes having requires relation from conceptNode.
            prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
        if level == 0:
            return prereqs.getTotal()
        for prereqNode in prereqs:
            prerequisites.append(prereqNode.asDict(includeParent=False))
            prs = self._getPrereqs(prereqNode, level-1, pageNum=pageNum, pageSize=pageSize)
            if type(prs).__name__ == 'list':
                prerequisites[-1]['pre'] = prs
            else:
                prerequisites[-1]['preCount'] = prs
        return prerequisites

    @d.jsonify()
    @d.setPage(['encodedID', 'levels'])
    @d.trace(log, ['encodedID', 'levels', 'pageNum', 'pageSize'])
    def getPrerequisites(self, encodedID, levels=1, pageNum=0, pageSize=0):
        """
            Get prerequisites for a concept node (paginated)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            #@d.ck12_cache_region('hourly')
            def _getPrerequisites(encodedID, levels, pageNum, pageSize):
                levels = int(levels)
                if levels <= 0:
                    levels = 0
                if levels > 3:
                    raise Exception("Cannot get prerequisites for levels more than 3 for performance reasons")

                conceptNode = self._getConceptNode(encodedID)
                # Get all the nodes having requires relation from conceptNode.
                prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
                result['response']['total'] = prereqs.getTotal()
                result['response']['pre'] = self._getPrereqs(conceptNode, levels, prereqs=prereqs, pageNum=pageNum, pageSize=pageSize)
                log.info("Got prerequisites: %s" % result['response']['pre'])
                result['response']['limit'] = len(result['response']['pre']) if type(result['response']['pre']).__name__ == 'list' else result['response']['pre']
                result['response']['offset'] = (pageNum-1) * pageSize
                return result

            result = _getPrerequisites(encodedID, levels, pageNum, pageSize)
            return result
        except Exception, e:
            log.error("Error getting prerequisites for concept node: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.jsonify()
    @d.setPage(['encodedID'])
    @d.trace(log, ['encodedID'])
    def getPrerequisite(self, encodedID):
        """
            Get prerequisite for a concept node on the same level.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            conceptNode = self._getConceptNode(encodedID)
            prereqnode = api.getPrerequisiteConceptNode(conceptNode.id)    
            result['response']['pre'] = prereqnode.asDict(includeParent=False)
            return result
        except Exception, e:
            log.error("Error getting prerequisite for concept node: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    def _getPostreqs(self, conceptNode, level, postreqs=None, pageNum=0, pageSize=0):
        log.info("Called _getPostreqs with conceptNode: %s, level: %d, pageNum: %d, pageSize: %d" % (conceptNode.encodedID, level, pageNum, pageSize))
        postrequisites = []
        if level < 0:
            return postrequisites
        if not postreqs:
            postreqs = api.getPostrequisiteConceptNodes(conceptNodeID=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
        if level == 0:
            return postreqs.getTotal()
        for postreqNode in postreqs:
            postrequisites.append(postreqNode.asDict(includeParent=False))
            prs = self._getPostreqs(postreqNode, level-1, pageNum=pageNum, pageSize=pageSize)
            if type(prs).__name__ == 'list':
                postrequisites[-1]['post'] = prs
            else:
                postrequisites[-1]['postCount'] = prs
        return postrequisites

    @d.jsonify()
    @d.setPage(['encodedID', 'levels'])
    @d.trace(log, ['encodedID', 'levels', 'pageNum', 'pageSize'])
    def getPostrequisites(self, encodedID, levels=1, pageNum=0, pageSize=0):
        """
            Get post-requisites for a concept node (paginated)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:

            #@d.ck12_cache_region('hourly')
            def _getPostrequisites(encodedID, levels, pageNum, pageSize):
                levels = int(levels)
                if levels <= 0:
                    levels = 0
                if levels > 3:
                    raise Exception("Cannot get postrequisites for levels more than 3 for performance reasons")

                conceptNode = self._getConceptNode(encodedID)
                postreqs = api.getPostrequisiteConceptNodes(conceptNodeID=conceptNode.id, pageNum=pageNum, pageSize=pageSize)
                result['response']['total'] = postreqs.getTotal()
                result['response']['post'] = self._getPostreqs(conceptNode, levels, postreqs=postreqs, pageSize=pageSize, pageNum=pageNum)
                result['response']['limit'] = len(result['response']['post']) if type(result['response']['post']).__name__ == 'list' else result['response']['post']
                result['response']['offset'] = (pageNum-1) * pageSize
                return result

            result = _getPostrequisites(encodedID, levels, pageNum, pageSize)
            return result
        except Exception, e:
            log.error("Error getting post-requisites for concept node: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.jsonify()
    @d.setPage(['subjectID', 'branchID'])
    @d.trace(log, ['subjectID', 'branchID', 'pageNum', 'pageSize'])
    def getFundamentalConceptNodes(self, subjectID, branchID, pageNum=0, pageSize=0):
        """
            Get concept nodes that belong to the given subject and branch that have 
            no prerequisites (they are fundamental)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subject = sb.getSubject(subjectID)
            branch = sb.getBranch(branchID)

            nodes = api.getFundamentalConceptNodes(subjectID=subject.id, branchID=branch.id, pageNum=pageNum, pageSize=pageSize)
            result['response']['offset'] = (pageNum-1) * pageSize
            result['response']['limit'] = len(nodes)
            result['response']['total'] = nodes.getTotal()
            result['response']['conceptNodes'] = [ x.asDict() for x in nodes ]
            return result

        except Exception, e:
            log.error("Get fundamental concept nodes exception: %s" % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.setPage(['term', 'branch', 'subject'])
    @d.trace(log, ['term', 'subject', 'branch', 'pageSize', 'pageNum'])
    def search(self, term, subject=None, branch=None, pageNum=0, pageSize=0):
        """
            Search a concept node based on parts of name or keywords
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not term or not term.strip():
                raise Exception("Invalid or empty search term")

            subjectID = branchID = brn = sub = None
            if subject:
                sub = sb.getSubject(subject, tryName=True, failOnError=False)
                if sub:
                    subjectID = sub.id
            if branch:
                brn = sb.getBranch(branch, subjectID=subjectID, tryName=True, failOnError=False)
                if not brn and not sub:
                    sub = sb.getSubject(branch, tryName=True, failOnError=False)
                    if sub:
                        subjectID = sub.id
                if brn:
                    branchID = brn.id

            ## Check if term matches any of the subjects or branches
            branchesDict = api.getBranchesDict()
            subjectsDict = api.getSubjectsDict()
            lterm = term.lower()
            # Skipping the functionality: setting search term to empty if search term is branch/subject.
            if False and not subjectID and lterm in subjectsDict.keys():
                subjectID = subjectsDict[lterm]['id']
                term = ''
            if False and not branchID and lterm in branchesDict.keys():
                branchID = branchesDict[lterm]['id']
                term = ''
            log.info("Branch ID: %s, Subject ID: %s, Term: [%s]" % (branchID, subjectID, term))

            nodes = api.searchConceptNodes(term=term, subjectID=subjectID, branchID=branchID, pageNum=pageNum, pageSize=pageSize)
            result['response']['offset'] = (pageNum-1) * pageSize
            result['response']['limit'] = len(nodes)
            result['response']['total'] = nodes.getTotal()
            result['response']['conceptNodes'] = []
            if nodes:
                result['response']['conceptNodes'] = [x.asDict(includeParent=False) for x in nodes]
            for c in result['response']['conceptNodes']:
                log.info("Name: %s" % c['name'])
            return result
        except Exception, e:
            log.error("Error searching for conceptNodes [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def loadConceptNodeData(self, member):
        """
            Load foundation grid terms and their relationships from comma-separated values file
            The format is expected to be:
                foundation_code | name | handle | description | parent_code (optional) | required_codes (optional) | keywords (optional) | previewImageUrl
                
        """
        if not u.hasRoleInGroup('admin'):
            log.error('Insufficient privileges for user: %s' % member['id'])
            return ErrorCodes().asDict(ErrorCodes.INSUFFICIENT_PRIVILEGES)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        messages = []
        try:
            ## save the file to temp location
            keywordsOnly = str(request.params.get('keywordsOnly')).lower() == 'true'
            savedFilePath = h.saveUploadedFile(request, 'file')
            csvReader = UnicodeDictReader(open(savedFilePath, 'rb'))
            rowCnt = 0
            for row in csvReader:
                log.info("Row %d: %s" % (rowCnt, row))
                try:
                    rowCnt += 1
                    if row['foundation_code']:
                        encodedID = row['foundation_code']
                        node = api.getConceptNodeByEncodedID(encodedID=encodedID)
                        if not keywordsOnly:
                            parentID = None
                            description = None
                            if row['name']:
                                name = row['name']
                                if not node:
                                    node = api.getConceptNodeByName(name=name)
                                handle = row.get('handle')
                                if not handle:
                                    handle = name2Handle(name)
                                if row['parent_code']:
                                    parentCode = row['parent_code']
                                    parent = api.getConceptNodeByEncodedID(encodedID=parentCode)
                                    if not parent:
                                        raise Exception('No parent node with encodedID: %s' % parentCode)
                                    parentID = parent.id

                                redirectedReferences = row.get('redirectedReferences')
                                if isinstance(redirectedReferences, basestring):
                                    redirectedReferences = redirectedReferences.strip()
                                    if redirectedReferences:
                                        redirectedReferences = redirectedReferences.split(',')
                                    else:
                                        redirectedReferences = []
                                    
                                    processedRedirectedReferences = []
                                    for redirectedReference in redirectedReferences:
                                        redirectedReference  = redirectedReference.strip()
                                        if not redirectedReference:
                                            raise Exception((u'Empty / Blank redirectedReference received.').encode('utf-8'))
                                        redirectedReference = util.processEncodedID(redirectedReference)
                                        if redirectedReference not in processedRedirectedReferences:
                                            processedRedirectedReferences.append(redirectedReference)
                                    kwargs['redirectedReferences'] = processedRedirectedReferences

                                if row['description']:
                                    description = row['description']

                                kwargs = { 'name': name, 'handle': handle, 'encodedID': encodedID, 'parentID': parentID, 'status': 'published', 'description': description }
                                kwargs['previewImageUrl'] = row.get('previewImageUrl')
                                if not node:
                                    subjectID = branchID = None
                                    subject, branch, numbers = h.splitEncodedID(encodedID)
                                    if subject:
                                        subjectObj = api.getSubjectByShortname(shortname=subject)
                                        if subjectObj:
                                            subjectID = subjectObj.id
                                    if branch:
                                        branchObj = api.getBranchByShortname(shortname=branch)
                                        if branchObj:
                                            branchID = branchObj.id
                                    kwargs.update({'subjectID': subjectID, 'branchID': branchID, 'cookies': request.cookies})
                                    node = api.createConceptNode(**kwargs)
                                    messages.append('Row %d: Successfully created ConceptNode with encoded id: %s' % (rowCnt, encodedID))
                                else:
                                    kwargs.update({ 'id': node.id})
                                    node = api.updateConceptNode(**kwargs)
                                    messages.append('Row %d: Successfully update ConceptNode with encoded id: %s' % (rowCnt, encodedID))

                                ## Create ConceptnodeNeighbor relationships
                                if row['required_codes']:
                                    requiredNodeIDs = []
                                    required_codes = row['required_codes'].split(',')
                                    if required_codes:
                                        for rcode in required_codes:
                                            rcode = rcode.strip()
                                            if rcode:
                                                rnode = api.getConceptNodeByEncodedID(encodedID=rcode)
                                                if not rnode:
                                                    raise Exception('No required node with encodedID: %s' % rcode)
                                                requiredNodeIDs.append(rnode.id)

                                        if requiredNodeIDs:
                                            for requiredNodeID in requiredNodeIDs:
                                                if not api.existsConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNodeID):
                                                    api.createConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNodeID, cookies=request.cookies)
                                                    messages.append('Row %d: Added node %s as a dependency for node: %s' % (rowCnt, requiredNodeID, encodedID))
                                                else:
                                                    messages.append('Row %d: Node %s is already a dependency for node: %s' % (rowCnt, requiredNodeID, encodedID))
                            else:
                                raise Exception('No ConceptNode name specified for row %d. Skipping ...' % rowCnt)

                        ## Create keyword associations
                        if row['keywords']:
                            keywords = row['keywords'].split(";")
                            kwAssoc = { 'conceptNodeID': node.id, 'keywords': keywords }
                            # Get the node updated by keywords. 
                            newNode = api.createConceptNodeKeywords(**kwAssoc)
                    else:
                        raise Exception("No encodedID specified for row %d" % rowCnt)

                except Exception, e:
                    log.error('Error occurred when processing row: %d' % rowCnt)
                    log.error(e, exc_info=e)
                    messages.append('ERROR: %s' % unicode(e))
            result['response']['messages'] = messages
            return result
        except Exception, e:
            log.error('load ConceptNodes Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_CONCEPT_NODE_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth()
    def loadConceptNodeDataForm(self, member):
        if not u.hasRoleInGroup('admin'):
            log.error('Insufficient privileges for user: %s' % member['id'])
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.INSUFFICIENT_PRIVILEGES), datetime.now())

        c.member = member['login']
        return render('/sts/load/conceptnodes.html')

    @d.checkAuth(argNames=['subjectID', 'branchID'])
    @d.trace(log, ['subjectID', 'branchID', 'member'])
    def exportConceptNodeData(self, member, subjectID=None, branchID=None):
        """
            Export concept nodes data as a CSV file (using same format as the load function above)
        """
        start = datetime.now()
        if not u.hasRoleInGroup('admin'):
            log.error('Insufficient privileges for user: %s' % member['id'])
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.INSUFFICIENT_PRIVILEGES, 'Insufficient privileges for user'), start)

        columns = ['foundation_code', 'name', 'handle', 'description', 'parent_code', 'required_codes', 'keywords']

        try:
            if subjectID:
                subject = sb.getSubject(subjectID)
                subjectID = subject.id
            if branchID:
                branch = sb.getBranch(branchID)
                branchID = branch.id
            log.info("Getting concepts for subject: %s and branch: %s" % (subjectID, branchID))

            csvFile = NamedTemporaryFile(suffix='.csv', delete=False)
            csvFile.close()

            f = open(csvFile.name, 'wb')
            writer = UnicodeWriter(f)
            writer.writerow(columns)

            # Get all the export details
            exportData = api.exportConceptNodeData(subjectID=subjectID, branchID=branchID,pageSize=-1)
            for rowData in exportData:    
                writer.writerow(rowData)

            f.close()
            file_size = os.path.getsize(csvFile.name)
            headers = [('Content-Disposition', 'attachment; filename=\"conceptNodes.csv\"'), ('Content-Type', 'text/csv'), ('Content-Length', str(file_size))]

            from paste.fileapp import FileApp
            fapp = FileApp(csvFile.name, headers=headers)

            return fapp(request.environ, self.start_response)
        except Exception, e:
            log.error("Error exporting ConceptNode data: %s" % str(e))
            log.error(traceback.format_exc())
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_EXPORT_CONCEPT_NODE_DATA
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), start)

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def create(self, member):
        """
            Create a new concept node. Expected post parameters:
                name: The name of the concept node
                description: A short description for the new concept node
                subjectID: the subject to which the new concept node belongs
                branchID: the branch to which the new concept node belongs
                parentID: the parent node of the new node
                One of:
                    insertAfter: encodedID of the concept node immediately after which this node should be inserted
                    insertBefore: encodedID of the concept node immediately before which this node should be inserted
                    insertFirst: True, if this is the first concept node inserted for this subject and branch. If 
                                using this parameter, please make sure that there are no concept nodes for this
                                subject and branch
                keywords: keywords to be associated with the concept node
                prereqs: encodedIDs that are prerequisites of this concept node

            Returns: the info about the new node if successful or error
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("create: params: %s" % str(request.params))
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            isAdmin = u.hasRoleInGroup('admin')

            ## Verify that keywords are not duplicate.
            if request.POST.has_key('keywords'):
                keywords = request.POST.get('keywords').strip()
                try:
                    import ast
                    # If the input is in the form ['a','b']
                    keywordList = ast.literal_eval(keywords)
                    keywordList = map(lambda x:x.strip().lower(), keywordList)
                except:
                    keywordList = map(lambda x:x.strip().lower(), keywords.split(','))
                keywordList = filter(None, keywordList)
                if len(keywordList) != len(set(keywordList)):
                    raise Exception("Duplicate keywords are not allowed.")
            name = request.POST.get('name', '').strip()
            if not name:
                raise Exception('Concept node name is required')

            handle = request.POST.get('handle', '').strip()
            if not handle:
                handle = name2Handle(name)
            

            description = request.POST.get('description', '').strip()
            
            parentID = request.POST.get('parentID', '').strip()
            if parentID:
                parent = self._getConceptNode(parentID)
                parentID = parent.id
            else:
                parentID = None

            subjectID = request.POST.get('subjectID', '').strip()
            if not subjectID:
                raise Exception('subjectID is required for the new concept node')
            subject = sb.getSubject(subjectID)

            branchID = request.POST.get('branchID', '').strip()
            if not branchID:
                raise Exception('branchID is required for the new concept node')

            branch = sb.getBranch(branchID)
            insertAfter = request.POST.get('insertAfter', '').strip()
            insertBefore = request.POST.get('insertBefore', '').strip()
            insertFirst = request.POST.get('insertFirst', '').strip()
            insertFirst = insertFirst and str(insertFirst).lower() == 'true'
            encodedID = request.POST.get('encodedID', '').strip()
            previewImageUrl = request.POST.get('previewImageUrl', '').strip()
            previewIconUrl = request.POST.get('previewIconUrl', '').strip()

            kwargs = {
                'name': name,
                'handle': handle,
                'description': description,
                'subjectID': subject.id,
                'branchID': branch.id,
                'parentID': parentID,
                'previewImageUrl': previewImageUrl,
				'previewIconUrl': previewIconUrl,
            }

            redirectedReferences = request.params.get('redirectedReferences')
            if isinstance(redirectedReferences, basestring):
                redirectedReferences = redirectedReferences.strip()
                if redirectedReferences:
                    redirectedReferences = redirectedReferences.split(',')
                else:
                    redirectedReferences = []
                
                processedRedirectedReferences = []
                for redirectedReference in redirectedReferences:
                    redirectedReference  = redirectedReference.strip()
                    if not redirectedReference:
                        raise Exception((u'Empty / Blank redirectedReference received.').encode('utf-8'))
                    redirectedReference = util.processEncodedID(redirectedReference)
                    if redirectedReference not in processedRedirectedReferences:
                        processedRedirectedReferences.append(redirectedReference)
                kwargs['redirectedReferences'] = processedRedirectedReferences

            if isAdmin:
                kwargs['status'] = PUBLISHED

            if not encodedID.strip():
                if insertFirst:
                    kwargs['encodedID'] = '%s.%s.100' % (subject.shortname, branch.shortname)
                else:
                    en1 = en2 = None
                    if insertAfter:
                        cn1 = self._getConceptNode(insertAfter)
                        log.info("insertAfter: %d" % cn1.id)
                        en1 = cn1.encodedID
                        cn2 = api.getNextConceptNode(id=cn1.id)
                        if cn2:
                            en2 = cn2.encodedID
                            log.info("Next encodedID: %s" % cn2.encodedID)
                    if insertBefore:
                        en1 = None
                        cn2 = self._getConceptNode(insertBefore)
                        en2 = cn2.encodedID
                        cn1 = api.getPreviousConceptNode(id=cn2.id)
                        if cn1:
                            en1 = cn1.encodedID
                            log.info("First encodedID: %s" % en1)

                    if not en1 and not en2:
                        raise Exception('Could not find a node to insert after or before')

                    mean = h.getMeanEncode(en1, en2)
                    kwargs['encodedID'] = mean
            else:
                kwargs['encodedID'] = encodedID
            eid = kwargs.get('encodedID')
            sub, brn, num = h.splitEncodedID(eid)
            subject = api.getSubjectByShortname(shortname=sub)
            if not subject or subject.id != kwargs['subjectID']:
                raise Exception('The given subject does not match the specified EID.')
            branch = api.getBranchByShortname(shortname=brn, subjectID=subject.id)
            if not branch or branch.id != kwargs['branchID']:
                raise Exception('The given branch does not match the specified EID.')
            if num.count('.') not in [0, 1]:
                raise Exception('Invalid numeric part for the EID. Can contain only 0 or 1 periods.')
            kwargs['cookies'] = request.cookies
            newNode = api.createConceptNode(**kwargs)            
            log.info("Created new concept node: %d %s" % (newNode.id, newNode.encodedID))

            activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_CREATE
            if isAdmin:
                activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_PUBLISH
            alog.logActivity(activityType, newNode)

            ## process dependencies
            prereqs = request.POST.get('prereqs')
            if prereqs:
                prereqs = prereqs.split(',')
                for prereq in prereqs:
                    preConceptNode = self._getConceptNode(prereq.strip())
                    neighbor = api.createConceptNodeNeighbor(conceptNodeID=newNode.id, requiredConceptNodeID=preConceptNode.id, cookies=request.cookies)

            ## Process keywords
            keywords = request.POST.get('keywords')
            if keywords:
                keywords = keywords.split(',')
                kwAssoc = { 'conceptNodeID': newNode.id, 'keywords': keywords }
                # Get the node updated by keywords. 
                newNode = api.createConceptNodeKeywords(**kwAssoc)
                """
                for keyword in keywords:
                    kw = api.getConceptKeywordByName(name=keyword.strip())
                    if not kw:
                        keywordArgs = { 'name': keyword }
                        kw = api.createConceptKeyword(**keywordArgs)
                    kwAssoc = { 'conceptNodeID': newNode.id, 'keywordID': kw.id }
                    api.createConceptNodeHasKeyword(**kwAssoc)
                """

            result['response'] = newNode.asDict()
            return result
        except Exception, e:
            log.error("Error creating new concept node: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createRelation(self, member):
        """
            Create a new concept node alias. Expected post parameters:
                encodedID: The name of the concept node
                relatedEncodedID: A short description for the new concept node
                relationType: Relation type between encodedID and relatedEncodedID
            Returns: the info about the new alias if successful or error
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("create: params: %s" % str(request.params))
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            kwargs = {}
            encodedID = request.POST.get('encodedID')
            if not encodedID:
                raise Exception('Concept encodedID is required')
            kwargs['encodedID'] = encodedID
            relatedEncodedID = request.POST.get('relatedEncodedID')
            if not relatedEncodedID:
                raise Exception('Concept relatedEncodedID is required')
            kwargs['relatedEncodedID'] = relatedEncodedID
            relationType = request.POST.get('relationType')
            if not relationType:
                raise Exception('relationType is required')
            kwargs['relationType'] = relationType

            newRelation = api.createConceptNodeRelationByEncodedID(**kwargs)
            log.info("Created new concept node relation between conceptID: [%d], and relatedConceptID: [%d] as relationType: [%s]" % (newRelation.conceptID, newRelation.relatedConceptID, newRelation.relationType))

            result['response'] = newRelation.asDict()
            return result
        except Exception, e:
            log.error("Error creating new concept node relation: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.checkAuth()
    @d.trace(log, ['member'])
    def createForm(self, member):
        c.memberLogin = member['login']
        c.memberID = member['id']
        return render('/sts/create/conceptNode.html')

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createRelationForm(self, member):
        c.memberLogin = member['login']
        c.memberID = member['id']
        return render('/sts/create/conceptRelation.html')


    @d.checkAuth(toJsonifyError=True, argNames=['id'])
    @d.trace(log, ['id', 'member'])
    def updateForm(self, member, id):
        c.memberLogin = member['login']
        c.memberID = member['id']
        conceptNode = self._getConceptNode(id)
        c.conceptNode = conceptNode
        if conceptNode.parent:
            c.parentEID = conceptNode.parent.get('encodedID')
        c.keywords = conceptNode.keywords
        prereqs = api.getPrerequisiteConceptNodes(conceptNodeID=conceptNode.id)
        c.prereqs = []
        for p in prereqs:
            c.prereqs.append(p.encodedID)
        c.prereqs = ','.join(c.prereqs)
        return render('/sts/update/conceptNode.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def update(self, member):
        """
            Update a concept node. Supported post parameters:
                id: REQUIRED the concept node id.

            From the following supported parameters, please include only
            the ones that need updating.
                name: The name of the concept node
                description: A short description for the new concept node
                subjectID: the subject to which the new concept node belongs
                branchID: the branch to which the new concept node belongs
                parentID: the parent node of the new node
                keywords: keywords to be associated with the concept node (comma-separated)
                previewImageUrl: previewImageUrl to be associated with the concept node
                prereqs: encodedIDs that are prerequisites of this concept node (comma-separated)

            Returns: the info about the updated node if successful or error
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("update: params: %s" % str(request.params))
        try:
            ret, err = u.checkCreatePrivileges(additional_roles=['content-admin'])
            if not ret:
                return err

            isAdmin = u.hasRoleInGroup('admin')

            ## Verify that keywords are not duplicate.
            if request.params.has_key('keywords'):
                keywords = request.params.get('keywords').strip()
                try:
                    import ast
                    # If the input is in the form ['a','b']
                    keywordList = ast.literal_eval(keywords)
                    keywordList = map(lambda x:x.strip().lower(), keywordList)
                except:
                    keywordList = map(lambda x:x.strip().lower(), keywords.split(','))
                keywordList = filter(None, keywordList)
                if len(keywordList) != len(set(keywordList)):
                    raise Exception("Duplicate keywords are not allowed.")

            if not request.params.get('id', '').strip():
                raise Exception('Concept Node encoded ID is required.')
            conceptNode = self._getConceptNode(encodedID=request.params.get('id').strip())
            kwargs = { 'id': conceptNode.id }
            if request.params.has_key('name'):
                if not request.params.get('name').strip():
                    raise Exception('Must specify concept name.')
                name = request.params.get('name').strip()
                kwargs['name'] = name

            if request.params.has_key('handle'):
                kwargs['handle'] = request.params.get('handle').strip()
            elif kwargs.has_key('name'):
                kwargs['handle'] = name2Handle(kwargs['name'])
                
            if kwargs.has_key('handle') and not kwargs['handle']:
                raise Exception('Must specify correct handle.')

            if kwargs.get('handle'):
                kwargs['handle'] = name2Handle(kwargs['handle'])

            persistOldHandles = request.params.get('persistOldHandles', True)
            if persistOldHandles is not None:
                if persistOldHandles not in ('true', 'false', 'True', 'False', True, False):
                    raise exceptions.InvalidArgumentException(u"Invalid value for persistOldHandles : [{persistOldHandles}] received.".format(persistOldHandles=persistOldHandles).encode('utf-8'))
                
                if persistOldHandles in ('true', 'True', True):
                    persistOldHandles = True
                else:
                    persistOldHandles = False
                kwargs['persistOldHandles'] = persistOldHandles

            extendRedirectedReferences = request.params.get('extendRedirectedReferences', True)
            if extendRedirectedReferences is not None:
                if extendRedirectedReferences not in ('true', 'false', 'True', 'False', True, False):
                    raise exceptions.InvalidArgumentException(u"Invalid value for extendRedirectedReferences : [{extendRedirectedReferences}] received.".format(extendRedirectedReferences=extendRedirectedReferences).encode('utf-8'))
                
                if extendRedirectedReferences in ('true', 'True', True):
                    extendRedirectedReferences = True
                else:
                    extendRedirectedReferences = False
                kwargs['extendRedirectedReferences'] = extendRedirectedReferences           

            redirectedReferences = request.params.get('redirectedReferences')
            if isinstance(redirectedReferences, basestring):
                redirectedReferences = redirectedReferences.strip()
                if redirectedReferences:
                    redirectedReferences = redirectedReferences.split(',')
                else:
                    redirectedReferences = []
                
                processedRedirectedReferences = []
                for redirectedReference in redirectedReferences:
                    redirectedReference  = redirectedReference.strip()
                    if not redirectedReference:
                        raise Exception((u'Empty / Blank redirectedReference received.').encode('utf-8'))
                    redirectedReference = util.processEncodedID(redirectedReference)                    
                    if redirectedReference not in processedRedirectedReferences:
                        processedRedirectedReferences.append(redirectedReference)
                kwargs['redirectedReferences'] = processedRedirectedReferences
            else:
                #if extend is False & received redirectedReferences is not present override them to empty
                if kwargs.get('extendRedirectedReferences') == False:
                    kwargs['redirectedReferences'] = []


            if request.params.has_key('description'):
                description = request.params.get('description').strip()
                kwargs['description'] = description

            if request.params.has_key('parentID'):
                parentID = request.params.get('parentID').strip()
                if parentID:
                    parent = self._getConceptNode(parentID)
                    kwargs['parentID'] = parent.id
                else:
                    kwargs['parentID'] = None

            if request.params.has_key('subjectID'):
                subjectID = request.params.get('subjectID', ).strip()
                if subjectID:
                    subject = sb.getSubject(subjectID)
                    if not subject: 
                        raise Exception("Must specify correct subjectID.")
                    kwargs['subjectID'] = subject.id

            if not kwargs.get('subjectID'):    
                kwargs['subjectID'] = conceptNode.subject['subjectID']

            if request.params.has_key('branchID'):
                branchID = request.params.get('branchID').strip()
                if branchID:
                    branch = sb.getBranch(branchID)
                    if not branch:
                        raise Exception("Must specify correct branchID.")
                    kwargs['branchID'] = branch.id

            if not kwargs.get('branchID'):    
                kwargs['branchID'] = conceptNode.branch['branchID']
    
            if request.params.has_key('encodedID'):
                eid = request.params.get('encodedID').strip()
                if not eid:
                    raise Exception("Must specify correct encodedID.")        
                kwargs['encodedID'] = eid

            for url in ['previewImageUrl', 'previewIconUrl']:
				if request.params.has_key(url):
					kwargs[url] = request.params.get(url, '').strip()
					if not kwargs[url]:
						kwargs[url] = None

            if isAdmin:
                if request.params.get('status') in [PROPOSED, PUBLISHED, DELETED]:
                    kwargs['status'] = request.params.get('status')
                    kwargs['extendRedirectedReferences'] = False
                    kwargs['redirectedReferences'] = []
                else:
                    kwargs['status'] = PUBLISHED

            eid = kwargs.get('encodedID')
            if not eid:
                eid = conceptNode.encodedID
            sub, brn, num = h.splitEncodedID(eid)
            subject = api.getSubjectByShortname(shortname=sub)
            if not subject or subject.id != kwargs['subjectID']:
                raise Exception('The given subject does not match the specified EID.')
            branch = api.getBranchByShortname(shortname=brn, subjectID=subject.id)
            if not branch or branch.id != kwargs['branchID']:
                raise Exception('The given branch does not match the specified EID.')
            if num.count('.') not in [0, 1]:
                raise Exception('Invalid numeric part for the EID. Can contain only 0 or 1 periods.')
            kwargs['cookies'] = request.cookies
            node = api.updateConceptNode(**kwargs)
            log.info("Updated concept node: %d %s" % (node.id, node.encodedID))

            activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_UPDATE
            if isAdmin:
                activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_PUBLISH
            alog.logActivity(activityType, node)

            ## process dependencies
            if request.params.has_key('prereqs'):
                api.deleteConceptNodeNeighbors(conceptNodeID=node.id, cookies=request.cookies)
                prereqs = request.params.get('prereqs')
                if prereqs:
                    prereqs = prereqs.split(',')
                    for prereq in prereqs:
                        preConceptNode = self._getConceptNode(prereq.strip())
                        neighbor = api.createConceptNodeNeighbor(conceptNodeID=node.id,         
                                   requiredConceptNodeID=preConceptNode.id,cookies=request.cookies)

            ## Process keywords
            if request.params.has_key('keywords'):
                keywords = request.params.get('keywords').strip()
                keywordList = []
                for k in keywords.split(','):
                    if k and k.strip():
                        keywordList.append(k.strip())

                ## Delete all existing
                api.deleteConceptNodeKeywords(conceptNodeID=node.id)
                if keywordList:
                    kwAssoc = { 'conceptNodeID': node.id, 'keywords': keywordList }
                    # Get the node updated by keywords. 
                    node = api.createConceptNodeKeywords(**kwAssoc)
                """
                if keywordList:
                    for keyword in keywordList:
                        kw = api.getConceptKeywordByName(name=keyword)
                        if not kw:
                            keywordArgs = { 'name': keyword }
                            kw = api.createConceptKeyword(**keywordArgs)
                        kwAssoc = { 'conceptNodeID': node.id, 'keywordID': kw.id }
                        node = api.createConceptNodeHasKeyword(**kwAssoc)
                """
            result['response'] = node.asDict()
            return result
        except Exception, e:
            log.error("Error updating concept node: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_CONCEPT_NODE_UPDATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteForm(self, member):
        c.memberLogin = member['login']
        c.memberID = member['id']
        return render('/sts/delete/conceptNode.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def delete(self, member):
        """
            Deletes the concept node.
            Also deletes the parent, contains, requires, instances relations.
            The respective data from concept index is also deleted.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID")
            node = self._getConceptNode(conceptNodeID)
            if not node:
                raise Exception("Invalid conceptNodeID")

            api.deleteConceptNode(node.id, cookies=request.cookies)
            return result
        except Exception, e:
            log.error('Exception deleting Conceptnode: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_CONCEPT_NODE, str(e))

    def _getChildren(self, node, nodeType, nodeLevel, levels):
        """
        """
        def _getDepthChilds(eid, nodeLevel, levels):
            childs = nodeMap.get(eid, [])
            if levels == 0:
                return len(childs)
            childrenList = []
            for child in childs:
                node_dict = nodes.get(child)
                node_dict['level'] = nodeLevel + 1
                childrenList.append(node_dict)
                # Get the nested childs.
                chs = _getDepthChilds(child, nodeLevel=nodeLevel+1, levels=levels-1)
                if levels > 1:
                    childrenList[-1]['hasChildren'] = len(chs) > 0
                    childrenList[-1]['children'] = chs
                    childrenList[-1]['childCount'] = len(chs)
                elif levels == 1:
                    ## Only return if further children are available
                    childrenList[-1]['hasChildren'] = chs > 0
                    childrenList[-1]['childCount'] = chs
            return childrenList

        nodes = {}
        sub_br_dict = {}
        if nodeType == 'branch':
            nodeName = node.shortname
            nodes[nodeName] = node.asDict(includeSubject=False)
            # To avoid circular reference error using copy of the node data.
            sub_br_dict['branch'] = node.asDict(includeSubject=False).copy()
        else:
            nodeName = node.encodedID
            sub_br_dict['branch'] = node.branch
        sub_br_dict['subject'] = node.subject
        # Create a node map containing all the node encodedIDs and respective child encodedIDs. 
        nodeMap = api.getConceptNodeChildrensMap(nodeName, nodeType=nodeType, level=levels)
        eids = nodeMap.keys()
        # Prepare all the data for the nodes.           
        nodeList = []
        if eids:
            nodes = api.getConceptNodesByEncodedIDs(eids, sub_br_dict)
        return _getDepthChilds(nodeName, nodeLevel, levels)



    @d.jsonify()
    @d.setPage(['encodedID', 'levels'])
    @d.trace(log, ['encodedID', 'levels', 'pageNum', 'pageSize'])
    def getDescendants(self, encodedID, levels=1, pageNum=0, pageSize=0):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #@d.ck12_cache_region('daily')
            def _getDescendants(encodedID, levels, pageNum, pageSize):
                levels = int(levels)
                if levels <= 0:
                    levels = 0
                if levels > 7:
                    raise Exception("Cannot get children for levels more than 7 for performance reasons")

                rootNode = node = None
                try:
                    node = self._getConceptNode(encodedID=encodedID)
                except:
                    log.debug("Try as a branch: %s" % encodedID)
                    shortname = encodedID.split('.')[1]
                    branch = api.getBranchByShortname(shortname=shortname)
                    if branch:
                        rootNode = branch.asDict()
                if not node and not rootNode:
                    raise Exception('Could not get descendants for %s' % encodedID)

                if rootNode:
                    result['response']['branch'] = branch.asDict()
                    myLevel = -1
                    result['response']['branch']['level'] = myLevel
                    nodeType = 'branch'
                    node = branch
                else:
                    ancestors = api.getConceptNodeAncestors(id=node.id)
                    myLevel = len(ancestors)
                    result['response']['conceptNode'] = node.asDict(includeParent=False, includeChildren=False, level=myLevel)
                    nodeType = 'conceptNode'
                result['response'][nodeType]['children'] = self._getChildren(node, nodeType, nodeLevel=myLevel, levels=levels)
                if isinstance(result['response'][nodeType]['children'], list):
                    nodeCount = len(result['response'][nodeType]['children'])
                else:
                    nodeCount = result['response'][nodeType]['children']
                result['response']['limit'] = nodeCount
                result['response']['total'] = nodeCount
                result['response'][nodeType]['childCount'] = nodeCount
                result['response'][nodeType]['hasChildren'] = nodeCount > 0
                result['response']['offset'] = 0
                return result

            result = _getDescendants(encodedID, levels, pageNum, pageSize)
            return result
        except Exception, e:
            log.error("Exception getting descendants: [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getAncestors(self, encodedID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            node = self._getConceptNode(encodedID=encodedID)
            ancestors = api.getConceptNodeAncestors(id=node.id)
            myLevel = len(ancestors)
            result['response']['total'] = len(ancestors)
            result['response']['ancestors'] = []
            cnt = 1
            for ancestor in ancestors:
                result['response']['ancestors'].append(ancestor.asDict(includeParent=False, level=myLevel-cnt))
                cnt += 1
            return result
        except Exception, e:
            log.error('Exception getting ancestors: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))
    
    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getDependants(self, encodedID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            node = self._getConceptNode(encodedID=encodedID)
            dependants = api.getConceptNodeDependants(id=node.id)
            result['response']['total'] = len(dependants)
            result['response']['dependants'] = [x.asDict() for x in dependants]
            return result
        except Exception, e:
            log.error('Exception getting dependants: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.trace(log)
    def visualizeConceptNodeTree(self):
        return render('/sts/visual/tree.html')

    @d.trace(log, ['subjectID', 'branchID', 'startID', 'endID'])
    def visualizeConceptNodeMap(self, subjectID, branchID, startID=None, endID=None):
        start = datetime.now()
        try:
            subject = sb.getSubject(subjectID)
            branch = sb.getBranch(branchID)
            if startID:
                startNode = self._getConceptNode(startID)
                c.startNode = startNode
            if endID:
                endNode = self._getConceptNode(endID)
                c.endNode = endNode
            c.subject = subject
            c.branch = branch
            return render('/sts/visual/map.html')
        except Exception, e:
            log.error("Exception visualizing map: %s" % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), start)

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createConceptNodeNeighbor(self, member):
        """
            Create a concept node neighbor relationship between given conceptNodeID and requiredConceptNodeID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID");
            node = self._getConceptNode(conceptNodeID)

            requiredConceptNodeID = request.POST.get('requiredConceptNodeID')
            if not requiredConceptNodeID:
                raise Exception('Must specify a requiredConceptNodeID as the dependency')
            requiredNode = self._getConceptNode(requiredConceptNodeID)
            if node.id == requiredNode.id:
                raise Exception('The conceptNodeID and requiredConceptNodeID specified cannot be the same node')
            if api.existsConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNode.id):
                raise Exception('ConceptNodeNeighbor relationship already exists between node: %s and requiredNode: %s' % (node.encodedID, requiredNode.encodedID))
            requiredConceptNode = api.createConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNode.id, cookies=request.cookies)
            result['response']['requiredConceptNode'] = requiredConceptNode.asDict()
            return result
        except Exception, e:
            log.error('Exception creating ConceptnodeNeighbor: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_CONCEPT_NODE_NEIGHBOR, str(e))

    @d.jsonify()
    @d.trace(log, ['encodedID', 'pageNum', 'pageSize'])
    def getConceptNodeInstances(self, encodedID, pageNum=0, pageSize=0):
        """
            Get all instances of a concept node given its encodedID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            node = self._getConceptNode(encodedID=encodedID)
            instances = api.getConceptNodeInstances(conceptNodeID=node.id, pageNum=pageNum, pageSize=pageSize)
            result['response']['offset'] = (pageNum-1) * pageSize
            result['response']['limit'] = len(instances)
            result['response']['total'] = instances.getTotal()
            result['response']['conceptInstances'] = [ x.asDict() for x in instances ]
            return result
        except Exception, e:
            log.error('get conceptNodeInstance Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createConceptNodeInstanceForm(self, member):
        return render('/sts/create/conceptNodeInstance.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createConceptNodeInstance(self, member):
        """
            Create a concept node instance that relates a particular source URL to the given concept node, assigning it a sequence (seq) number
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID");
            node = self._getConceptNode(conceptNodeID)
            if not node:
                raise Exception("Invalid conceptNodeID")

            artifactTypeName = request.POST.get('artifactType')
            if not artifactTypeName:
                raise Exception("Must specify artifact type")
            artifactType = api.getArtifactExtensionTypeByShortname(shortname=artifactTypeName)
            if not artifactType:
                raise Exception("Invalid artifact type")

            sourceURL = request.POST.get('sourceURL')
            if not sourceURL:
                raise Exception('Must specify a sourceURL for an instance of a concept')

            log.error('creating conceptNode instance')
            instance = api.createConceptNodeInstance(conceptNodeID=node.id, sourceURL=sourceURL, artifactTypeID=artifactType.id)
            result['response'] = instance.asDict()
            return result
        except Exception, e:
            log.error('Exception creating ConceptInstance: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_CONCEPT_NODE_INSTANCE, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteConceptNodeInstance(self, member):
        """
            Delete concept node instances.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID")
            node = self._getConceptNode(conceptNodeID)
            if not node:
                raise Exception("Invalid conceptNodeID")
            artifactTypeName = request.POST.get('artifactType')
            if not artifactTypeName:
                raise Exception("Must specify artifact type")
            artifactType = api.getArtifactExtensionTypeByShortname(shortname=artifactTypeName)
            if not artifactType:
                raise Exception("Invalid artifact type")
            seq = request.POST.get('seq')
            if not seq:
                raise Exception("Must specify seq")
            try:
                seq = int(seq)
            except:
                raise Exception("seq must be an integer.")

            api.deleteConceptNodeInstance(conceptNodeID=node.id, artifactTypeID=artifactType.id,seq=seq)
            return result
        except Exception, e:
            log.error('Exception creating ConceptnodeNeighbor: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteConceptNodeInstances(self, member):
        """
            Delete concept node instance.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID");
            node = self._getConceptNode(conceptNodeID)

            api.deleteConceptNodeInstances(conceptNodeID=node.id)
            return result
        except Exception, e:
            log.error('Exception creating ConceptnodeNeighbor: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteConceptNodeNeighbor(self, member):
        """
            Delete a concept node neighbor record
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID");
            node = self._getConceptNode(conceptNodeID)

            requiredConceptNodeID = request.POST.get('requiredConceptNodeID')
            if not requiredConceptNodeID:
                raise Exception('Must specify a requiredConceptNodeID as the dependency')
            requiredNode = self._getConceptNode(requiredConceptNodeID)

            if not api.existsConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNode.id):
                raise Exception('ConceptNodeNeighbor relationship does not exist between node: %s and requiredNode: %s' % (node.encodedID, requiredNode.encodedID))
            api.deleteConceptNodeNeighbor(conceptNodeID=node.id, requiredConceptNodeID=requiredNode.id, cookies=request.cookies)
            return result
        except Exception, e:
            log.error('Exception creating ConceptnodeNeighbor: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_CONCEPT_NODE_NEIGHBOR, str(e))

    @d.jsonify()
    @d.trace(log, ['encodedID', 'toplevel'])
    def getConceptNodeRank(self, encodedID, toplevel=False):
        """
            Get rank of the given concept node within all concept nodes for its parent branch and subject
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            node = self._getConceptNode(encodedID)
            toplevel = str(toplevel).lower() in ['true', 'top']
            rank = api.getConceptNodeRank(encodedID=node.encodedID, toplevel=toplevel)
            result['response']['rank'] = rank
            return result
        except Exception, e:
            log.error('Exception getting rank for concept node: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_CONCEPT_NODE, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def associateConceptNodeKeywordForm(self, member):
        return render('/sts/create/conceptNodeKeyword.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def associateConceptNodeKeyword(self, member):
        """
            Associate a concept node with a keyword
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID', '').strip()
            if not conceptNodeID:
                raise Exception('Must specify a concept node id')

            node = self._getConceptNode(conceptNodeID)

            keyword = request.POST.get('keyword', '').strip()

            if not keyword:
                raise Exception('Must specify a keyword')

            kwargs = {'conceptNodeID': node.id, 'keywords': [keyword], 'error_on_duplicate': True}

            results = api.createConceptNodeKeywords(**kwargs)

            result['response']['conceptNodeID'] = node.encodedID
            result['response']['keyword'] = keyword
            return result
        except Exception, e:
            log.error("Exception associating keyword with Concept node: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_ASSOCIATE_CONCEPT_NODE_WITH_KEYWORD, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteConceptNodeKeyword(self, member):
        """
            Delete association between a concept node and a keyword
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception('Must specify a concept node id')

            node = self._getConceptNode(conceptNodeID)

            keyword = request.POST.get('keyword')
            if not keyword:
                raise Exception('Must specify a keyword')

            keyword = keyword.strip()

            api.deleteConceptNodeKeyword(conceptNodeID=node.id, keyword=keyword)

            return result
        except Exception, e:
            log.error("Exception deleting association between keyword and concept node: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_CONCEPT_NODE_KEYWORD_ASSOCIATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    #@d.trace(log)
    def conceptForm(self):
        """
            Return a concept form to demo some things that can be done with a concept node
        """
        return render("/sts/info/conceptForm.html")

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createNodeAttribute(self, member):
        """
            Add the attribute to the node.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            nodeIDs = request.POST.get('nodeIDs')
            if not nodeIDs:
                raise Exception('Must specify a nodes')
            node_ids = nodeIDs.split(',')

            attributeName = request.POST.get('attributeName')
            if not attributeName:
                raise Exception('Must specify attributeName')

            attributeValue = request.POST.get('attributeValue')
            if not attributeValue:
                raise Exception('Must specify attributeValue')

            kwargs = {'nodeIDs': node_ids, 'attributeName':attributeName, 'attributeValue':attributeValue}
            results = api.createNodeAttribute(**kwargs)
            result['response']['nodes'] = [x.asDict() for x in results]
            return result
        except Exception, e:
            log.error("Exception creating node attribute: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_NODE_ATTRIBUTE, str(e))

    @d.jsonify()
    @d.trace(log, ['nodeType', 'attributeName', 'attributeValue'])
    def getNodesFromAttribute(self, nodeType, attributeName, attributeValue):
        """
            Get the nodes from the attributes.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            results = api.getNodesFromAttribute(nodeType, attributeName, attributeValue)
            result['response']['nodes'] = [x.asDict() for x in results]
            return result
        except Exception, e:
            log.error('get Nodes from attribute Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createNodeRelation(self, member):
        """
            Add the relation between the nodes.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            from_id = request.POST.get('fromNode')
            if not from_id:
                raise Exception('Must specify a from node id.')
            from_node = api.getNodeByID(from_id)
            if not from_node:
                raise Exception('Invalid node id.')

            to_id = request.POST.get('toNode')
            if not to_id:
                raise Exception('Must specify a to node id.')
            to_node = api.getNodeByID(to_id)
            if not to_node:
                raise Exception('Invalid node id.')

            rel_type = request.POST.get('relType')
            if not rel_type:
                raise Exception('Must specify relation type.')

            kwargs = {'fromNode': from_id, 'toNode':to_id, 'relType':rel_type}
            results = api.createNodeRelation(**kwargs)

            return result
        except Exception, e:
            log.error("Exception creating node attribute: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_NODE_RELATION, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createConceptNodePrerequiresForm(self, member):
        return render('/sts/create/conceptNodePrerequires.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])    
    def createConceptNodePrerequires(self, member):
        """
            Create a concept node prerequires.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            conceptNodeID = request.POST.get('conceptNodeID')
            if not conceptNodeID:
                raise Exception("Must specify conceptNodeID");
            node = self._getConceptNode(conceptNodeID)
            if not node:
                raise Exception("Invalid conceptNodeID")

            prerequireConcepts = request.POST.get('prerequireConcepts')
            if not prerequireConcepts:
                raise Exception("Must specify prerequireConcepts");
            prerequireConcepts = prerequireConcepts.split(',')
            common_weight = 100 / len(prerequireConcepts)
            preqConcepts = []
            for prerequireConcept in prerequireConcepts:
                tmpData = prerequireConcept.split(':')
                if len(tmpData) == 1:
                    preqConcepts.append((tmpData[0].strip(), common_weight))
                else:
                    weight = tmpData[1].strip()
                    preqConcepts.append((tmpData[0].strip(), float(weight)))

            prereqs = api.createPrerequiresRelation(conceptNodeID, preqConcepts)
            result['response'] = prereqs
            return result
        except Exception, e:
            log.error('Exception creating ConceptPrerequires: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_CONCEPT_NODE_PREREQUIRES, str(e))

    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getConceptNodePrerequires(self, encodedID):
        """
            Get all prerequire nodes of a concept node given its encodedID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            node = self._getConceptNode(encodedID=encodedID)
            prerequires = api.getPrerequires(conceptNodeID=node.id)
            result['response']['total'] = len(prerequires)
            result['response']['prerequires'] = prerequires
            return result
        except Exception, e:
            log.error('get getPrerequires Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['encodedID'])
    def getRelatedConceptNodes(self, encodedID):
        """
            Get all related nodes of a concept node given its encodedID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            similarity = 0.0
            if request.params.has_key('similarity'):                
                similarity = float(request.params['similarity'])
            #node = self._getConceptNode(encodedID=encodedID)
            
            related_concepts = api.getRelatedConceptNodes(conceptNodeID=encodedID, similarity=similarity)
            result['response']['total'] = len(related_concepts)
            result['response']['related_concepts'] = related_concepts
            return result
        except Exception, e:
            log.error('get relatedConcepts Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log, ['encodedID'])
    def displayKnowledgeGraph(self, encodedID):
        if request.params.has_key('expandCount'):
            c.expandCount = request.params['expandCount']
        if encodedID == 'unknown':
            c.encodedID = ''
        else:
            c.encodedID = encodedID

        c.conceptType = 'related'
        if request.params.has_key('show'):
            c.conceptType = request.params['show']

        return render('/sts/visual/knowledge_graph.html')
