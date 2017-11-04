import logging
import os
from datetime import datetime
import traceback
from tempfile import NamedTemporaryFile

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select
from pylons.decorators.cache import beaker_cache

from sts.controllers import decorators as d
import sts.controllers.user as u
import sts.controllers.activitylog as alog
from sts.model import meta
from sts.model.model import ActivityLog, name2Handle
from sts.model import api
from sts.lib.base import BaseController, render
from sts.lib.app_globals import MultiPaginator
import sts.lib.helpers as h

from sts.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

def getSubject(subjectID, tryName=False, failOnError=True):
    subject = api.getSubjectByShortname(shortname=subjectID)
    if not subject and tryName:
        subject = api.getSubjectByName(name=subjectID)

    if not subject and failOnError:
        c.errorCode = ErrorCodes.NO_SUCH_SUBJECT
        raise Exception('No such subject by shortname : %s' % subjectID)
    return subject

def getBranch(branchID, subjectID=None, tryName=False, failOnError=True):
    if subjectID:
        subject = getSubject(subjectID)
        subjectID = subject.id

    branch = api.getBranchByShortname(shortname=branchID, subjectID=subjectID)
    if not branch and tryName:
        branch = api.getBranchByName(name=branchID, subjectID=subjectID)
    
    if not branch and failOnError:
        c.errorCode = ErrorCodes.NO_SUCH_BRANCH
        raise Exception('No such branch by shortname: %s' % branchID)

    return branch

class SubjectbranchController(BaseController):

    @d.jsonify()
    @d.trace(log, ['subjectID', 'branchID'])
    def getBranchInfo(self, branchID, subjectID=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            branch = getBranch(branchID, subjectID)
            result['response'] = branch.asDict()
            return result
        except Exception, e:
            log.error('Get branch info exception: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_BRANCH, str(e))

    @d.jsonify()
    @d.trace(log, ['subjectID'])
    def getSubjectInfo(self, subjectID):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subject = getSubject(subjectID)
            result['response'] = subject.asDict()
            return result
        except Exception, e:
            log.error('Get subject info exception: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SUBJECT, str(e))

    @d.jsonify()
    @d.setPage()
    @d.trace(log, ['pageNum', 'pageSize'])
    def getSubjects(self, pageNum=1, pageSize=10):
        """
            Get subjects 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            subjects = api.getSubjects(pageNum=pageNum, pageSize=pageSize)

            result['response']['total'] = subjects.getTotal()
            result['response']['limit'] = len(subjects.results)
            if len(subjects.results):
                result['response']['offset'] = (pageNum-1) * pageSize
            else:
                result['response']['offset'] = 0
            result['response']['subjects'] = self.__orderSubjectsBranches([ x.asDict() for x in subjects ], orderSubjects=True)
            return result
        except Exception, e:
            log.error('Get subjects exception: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SUBJECT, str(e))

    def __orderSubjectsBranches(self, objects, orderSubjects=False):
        masterOrder = { 
                'subjects': {
                    'MAT': 1, 'SCI': 2, 'ENG': 3, 'TEC': 4, 'SOC': 5,
                    },
                'MAT': {
                    'EM1': 95, 'EM2': 96, 'EM3': 97, 'EM4': 98, 'EM5': 99,
                    'ARI': 101, 'MEA': 102, 'ALG': 103, 'GEO': 104, 'PRB': 105,
                    'STA': 106, 'TRG': 107, 'ALY': 108, 'CAL': 109,
                    'ADV': 110, 'LOG': 111, 'GRH': 112, 'APS': 113,
                    },
                'SCI': {
                    'ESC': 201, 'LSC': 202, 'PSC': 203, 'BIO': 204, 'CHE': 205, 'PHY': 206,
                    }
                }
        log.info("Ordering by specialSort")
        if orderSubjects:
            return sorted(objects, key=lambda obj: masterOrder['subjects'].get(obj['shortname']) if masterOrder['subjects'].has_key(obj['shortname']) else 999)
        return sorted(objects, key=lambda obj: masterOrder.get(obj['subject']['shortname'], {}).get(obj['shortname']) if masterOrder.get(obj['subject']['shortname'], {}).has_key(obj['shortname']) else 999)


    @d.jsonify()
    @d.setPage(['subjectID'])
    @d.trace(log, ['subjectID', 'pageNum', 'pageSize'])
    def getBranches(self, subjectID, pageNum=1, pageSize=25):
        """
            Get branches for a subject
        """
        if not request.GET.has_key('pageSize'):
            pageSize = 25
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if subjectID:
                subject = getSubject(subjectID)
                subjectID = subject.id
            branches = api.getBranches(subjectID=subjectID, pageNum=pageNum, pageSize=pageSize)

            result['response']['total'] = branches.getTotal()
            result['response']['limit'] = len(branches.results)
            if len(branches.results):
                result['response']['offset'] = (pageNum-1) * pageSize
            else:
                result['response']['offset'] = 0
            result['response']['branches'] = self.__orderSubjectsBranches([ x.asDict() for x in branches ])

            return result        
        except Exception, e:
            log.error('Get branches exception: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SUBJECT, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createSubject(self, member):
        """
            Create a new subject - expects a POST request with following parameters
            name: Name of the new subject
            description: Description of the new subject
            shortname: Short name of the new subject
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            name = request.POST.get('name', '').strip()
            if not name:
                raise Exception('Must specify name for the new subject')

            description = request.POST.get('description', '').strip()
            shortname = request.POST.get('shortname', '').strip()
            if not shortname:
                raise Exception('Must specify shortname for the new subject')
            if len(shortname) != 3:
                raise Exception('Shortname must be exactly 3-letters long')

            kwargs = {
                    'name': name,
                    'description': description,
                    'shortname': shortname.upper(),
                    'cookies': request.cookies,
                }
            subject = api.createSubject(**kwargs)

            alog.logActivity(ActivityLog.ACTIVITY_TYPE_SUBJECT_CREATE, subject)

            result['response'] = subject.asDict()
            return result
        except Exception, e:
            log.error('Error creating new subject: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_SUBJECT_CREATE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_SUBJECT, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createSubjectForm(self, member):
        c.memberID = member['id']
        c.memberLogin = member['login']
        return render('/sts/create/subject.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def createBranch(self, member):
        """
            Create a new branch - expects a POST request with following parameters
            name: Name of the new branch
            description: Description of the new branch
            shortname: Short name of the new branch
            subjectID: ID (shortname) of the parent subject
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            name = request.POST.get('name', '').strip()
            if not name:
                raise Exception('Must specify name for the new subject')

            handle = request.POST.get('handle', '').strip()
            if not handle:
                handle = name2Handle(name)
            description = request.POST.get('description', '').strip()
            shortname = request.POST.get('shortname', '').strip()
            if not shortname:
                raise Exception('Must specify shortname for the new subject')
            if len(shortname) != 3:
                raise Exception('Shortname must be exactly 3-letters long')

            subjectID = request.POST.get('subjectID')
            subject = getSubject(subjectID)

            kwargs = {
                    'name': name,
                    'handle': handle,
                    'description': description,
                    'shortname': shortname.upper(),
                    'subjectID': subject.id,
                    'cookies': request.cookies,
                }
            branch = api.createBranch(**kwargs)

            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_CREATE, branch)

            result['response'] = branch.asDict()
            return result
        except Exception, e:
            log.error('Error creating new branch: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_CREATE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_BRANCH, str(e))

    @d.checkAuth()
    @d.trace(log, ['member'])
    def createBranchForm(self, member):
        c.memberID = member['id']
        c.memberLogin = member['login']
        subjects = api.getSubjects()
        c.subjects = subjects
        return render('/sts/create/branch.html')

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def updateBranch(self, member):
        """
            Update the branch - expects a POST request with following parameters
            name: Name of the branch
            handle: handle of the branch
            description: Description of the branch
            previewImageUrl:previewImageUrl
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err
            id = request.POST.get('id', '').strip()
            if not id:
                raise Exception('Must specify shortname of the branch as id')

            branch = api.getBranchByShortname(id)
            if not branch:
                raise Exception('No branch exists for the  id:%s' % id)

            kwargs = dict()
            kwargs['id'] = id
            for field in ['name', 'handle', 'description', 'previewImageUrl']:
                field_val = request.POST.get(field, '').strip()
                if field_val:
                    kwargs[field] = field_val
            if kwargs:
                kwargs['cookies'] = request.cookies   
                branch = api.updateBranch(**kwargs)
                alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_CREATE, branch)
                result['response'] = branch.asDict()
                return result
            else:
                result['response'] = 'Please provide atleast one parameter to update the branch.'
                return result

        except Exception, e:
            log.error('Error updating new branch: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_CREATE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_BRANCH, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteSubject(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            id = request.POST.get('id')
            subject = getSubject(id)
            api.deleteSubject(id=subject.id, cookies=request.cookies)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_SUBJECT_DELETE, subject)
            result['response'] = 'Subject with SubjectID:%s deleted.' %id
            return result
        except Exception, e:
            log.error('Error deleting subject: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_SUBJECT_DELETE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_SUBJECT, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteBranch(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            id = request.POST.get('id')
            subjectID = request.POST.get('subjectID')
            branch = getBranch(id, subjectID=subjectID)
            api.deleteBranch(id=branch.id, cookies=request.cookies)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_DELETE, branch)
            result['response'] = 'Branch with BranchtID:%s deleted.' %id
            return result
        except Exception, e:
            log.error('Error deleting branch: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_DELETE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_BRANCH, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteEntireBranch(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            ret, err = u.checkCreatePrivileges()
            if not ret:
                return err

            id = request.POST.get('id')
            subjectID = request.POST.get('subjectID')
            branch = getBranch(id, subjectID=subjectID)
            api.deleteEntireBranch(id=branch.id, cookies=request.cookies)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_DELETE, branch)
            result['response'] = 'Entire Branch with BranchtID:%s deleted.' %id
            return result
        except Exception, e:
            log.error('Error deleting entire branch: %s' % str(e), exc_info=e)
            alog.logActivity(ActivityLog.ACTIVITY_TYPE_BRANCH_DELETE_FAILED, e, logFailure=True)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_BRANCH, str(e))
