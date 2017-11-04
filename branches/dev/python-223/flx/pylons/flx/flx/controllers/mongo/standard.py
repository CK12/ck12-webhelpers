import logging
import re
from pylons import request
from pylons import tmpl_context as c
from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers.errorCodes import ErrorCodes
from flx.model.mongo.standardset import StandardSet
from flx.model.mongo.standard import Standard
from flx.model.mongo.standardalignments import StandardAlignment
from flx.model.mongo.conceptnode import ConceptNode
from flx.lib import helpers as h
import flx.controllers.user as u

log = logging.getLogger(__name__)


class StandardController(MongoBaseController):
    """
        Standard related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.stsetdb = StandardSet(self.db)
        self.stdb = Standard(self.db)
        self.staldb = StandardAlignment(self.db)
        self.cndb = ConceptNode(self.db)
        
    @d.jsonify()
    @d.trace(log)
    def getStandards(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            standardSet = request.params.get('set')
            if not standardSet:
                msg = 'Error: getStandards [Required params missing: set]'
                log.error(msg)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, msg)
            
            if '_' in standardSet:
                (co, st) = standardSet.split('_', 1)
            else:
                co = 'US'
                st = standardSet
            log.info("Getting standard set for: %s, %s" % (st, co))
            standardSetObj = self.stsetdb.getByName(name=st, country=co)
            if not standardSetObj:
                msg = 'Error: getStandards [No such set: %s]' % standardSet
                log.error(msg)
                c.errorCode = ErrorCodes.NO_SUCH_STANDARD_SET
                return ErrorCodes().asDict(c.errorCode, msg)

            eid = request.params.get('eid')
            if eid:
                standards = self.stdb.getByEncodedID(country=co, setName=st, eid=eid)
                result['response']['encodedID'] = eid
                result['response']['standards'] = standards
            else:
                depth = request.params.get('depth', 1)
                sid = request.params.get('sid')
                getConcepts = request.params.get('getConcepts', False)
                getConcepts = h.str_to_bool(getConcepts)

                standards = self.stdb.getTree(country=co, setName=st, sid=sid, depth=depth, getConcepts=getConcepts)
                result['response']['standards'] = standards
                result['response']['maxDepth'] = self.stdb.getMaxDepth()

            return result
        except Exception, e:
            log.error('getStandards Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.trace(log)
    def getStandardsForBranchOrSubject(self):
        ##
        ## This API is currently not cached. Used only at build time for SIM browse
        ##
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            standardSet = request.params.get('set')
            if not standardSet:
                raise Exception('Error: getStandardsForBranchOrSubject [Required params missing: set]')
            
            if '_' in standardSet:
                (co, st) = standardSet.split('_', 1)
            else:
                co = 'US'
                st = standardSet
            log.info("Getting standard set for: %s, %s" % (st, co))
            standardSetObj = self.stsetdb.getByName(name=st, country=co)
            if not standardSetObj:
                raise Exception('Error: getStandardsForBranchOrSubject [No such set: %s]' % standardSet)

            branch = request.params.get('branch')
            if not branch:
                subject = request.params.get('subject')
                if not subject:
                    raise Exception('Error: getStandardsForBranchOrSubject [Required params missing: either branch or subject must be specified.]')

            if branch:
                sub, brn = branch.split('.')
                if not sub or not brn:
                    raise Exception("Invalid branch code: %s" % branch)
            elif subject:
                sub = subject
                brn = None
    
            ## Do not include modality counts by default (too much data)
            includeMdodalityCounts = str(request.params.get('includeMdodalityCounts', False)).lower() == 'true'
            cndb = ConceptNode(self.db)
            nodes = list(cndb.getConceptsForBranch(subject=sub, branch=brn, includeMdodalityCounts=includeMdodalityCounts))
            if not nodes:
                raise Exception("No concept nodes for branch: %s" % branch)

            cs = { 'concepts': {}, 'standards': {}}
            for n in nodes:
                cns = cs['concepts']
                sts = cs['standards']
                eid = n['encodedID']
                log.debug("Getting standards for eid: %s" % eid)
                standards = list(self.stdb.getStandardsForConcept(eid, setName=st, country=co))
                ## Only include concepts that have standards mappings.
                if len(standards) > 0:
                    if not cns.has_key(eid):
                        cns[eid] = { 'concept': cndb.asDict(n), 'standards': [] }
                    for s in standards:
                        if not sts.has_key(s['sid']):
                            sts[s['sid']] = s
                        if not s['sid'] in cns[eid]['standards']:
                            cns[eid]['standards'].append(s['sid'])
                else:
                    log.debug("No standards for %s" % eid)
            
            result['response'] = cs
            return result
        except Exception, e:
            log.error('getStandardsForBranchOrSubject Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_STANDARD_CORRELATION, str(e))
            
    @d.jsonify()
    @d.trace(log)
    def getStandardAlignments(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            standardAlignments = self.staldb.getAllStandardAlignments()
            records = []
            for standardAlignment in standardAlignments:
                del standardAlignment['_id']
                records.append(standardAlignment)
            result['response']['standardAlignments'] = records

            return result
        except Exception, e:
            log.error('getStandardAlignments Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getAutoStandardCountries(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            countries = self.staldb.getAutoStandardCountries()
            result['response']['countries'] = countries

            return result
        except Exception, e:
            log.error('getAutoStandardCountries Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))            
            
    @d.jsonify()
    @d.trace(log)
    def getAutoStandardStandards(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)            
            country = request.params.get('country' ,'' ).strip().lower()
            if not country:
                msg = 'Error: getAutoStandardStandards [Required params missing: country]'
                log.error(msg)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, msg)            
            region = request.params.get('region', '').strip().lower() 
            includeCountries = request.params.get('includeCountries', '').strip().lower() 
            includeCountries = True if includeCountries == 'true' else False

            standards_info = self.staldb.getStandardAlignmentStandards(country, region=region, includeCountries=includeCountries)
            result['response']['standards'] = standards_info['standards']
            if includeCountries:
                result['response']['countries'] = standards_info['countries']
            return result
        except Exception, e:
            log.error('getAutoStandardStandards Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))
            
    @d.jsonify()
    @d.trace(log)
    def getAutoStandardStandardInfo(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)            
            SID = request.params.get('SID' ,'' ).strip()
            if not SID:
                msg = 'Error: getAutoStandardStandardInfo [Required params missing: standardID]'
                log.error(msg)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, msg)
            branch_ids = request.params.get('branches' ,'' ).strip().lower()
            if branch_ids:
                branch_ids = branch_ids.split(',')
                pat = re.compile('[a-z]{3,3}\.[a-z]{3,3}$')
                for branch_id in branch_ids:
                    if not pat.findall(branch_id):
                        msg = 'Error: getAutoStandardStandardInfo [Please provide proper branch_ids]'
                        log.error(msg)
                        c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                        return ErrorCodes().asDict(c.errorCode, msg)
            standards_info = self.staldb.getStandardAlignmentInfo(SID, branch_ids)
            result['response']['standardsInfo'] = standards_info

            return result
        except Exception, e:
            log.error('getAutoStandardStandardInfo Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))            

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def addAutoStandardConcept(self, member):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            # Check if the member has standards-admin role
            is_authorised = u.isMemberAuthorized(member , ['standards-admin'])
            if not is_authorised:
                msg = 'Error: addAutoStandardConcept [Unauthorised Operation]'
                log.error(msg)
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode, msg)                
                
            sid = request.POST.get('StandardID' ,'' ).strip()
            if not sid:
                msg = 'Error: getAutoStandardStandardInfo [Required params missing: standardID]'
                log.error(msg)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, msg)
            eid = request.POST.get('encodedID' ,'' ).strip()
            if not eid:
                msg = 'Error: addAutoStandardConcept [Required params missing: encodedID]'
                log.error(msg)
                c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
                return ErrorCodes().asDict(c.errorCode, msg)
            result['response']['addStandard'] = self.staldb.addAutoStandardConcept(sid, eid)

            return result
        except Exception, e:
            log.error('getAutoStandardCountries Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_STANDARD
            return ErrorCodes().asDict(c.errorCode, str(e))            
