import logging
import traceback

from pylons import request, tmpl_context as c

from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes

from flx.model.mongo import schoolartifacts

log = logging.getLogger(__name__)

class SchoolartifactsController(MongoBaseController):
    """
        School Artifacts APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    @d.jsonify()
    @d.trace(log)
    def getSchools(self):
        """
            Get Schools for the given state.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            state = request.params.get('state')
            if not state:
                raise Exception('Required input parameter "state" is missing')
            isDeleted = request.params.get('isDeleted', '').lower()
            kwargs['isDeleted'] = isDeleted
            kwargs['state'] = state
            result['response']['schools'] = schoolartifacts.SchoolArtifacts(self.db).getSchools(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting schools: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOLS
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getSchoolArtifacts(self):
        """
            Get School Artifacts.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            state = request.params.get('state', '').lower()
            published = request.params.get('published', '').lower()
            status = request.params.get('status', '').lower()
            is_deleted = request.params.get('isDeleted', '').lower()
            has_school_artifacts = request.params.get('hasSchoolArtifacts', '').lower()
            kwargs['state'] = state
            kwargs['published'] = published
            kwargs['status'] = status
            kwargs['isDeleted'] = is_deleted
            kwargs['hasSchoolArtifacts'] = has_school_artifacts
            
            response = {}
            if not state:
                response['schoolArtifacts'] = []
            else:
                response['schoolArtifacts'] = schoolartifacts.SchoolArtifacts(self.db).getSchoolArtifacts(**kwargs)
            result['response'] = response
            return result

        except Exception, e:
            log.error('Error in getting school artifacts: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_ARTIFACTS
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def addSchoolArtifact(self, member):
        """
            Add flexbook to the school.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            school_id = request.POST.get('schoolID')
            if not school_id:
                raise Exception('Required input parameter "schoolID" is missing')

            if not u.isMemberAdmin(member): # Admin can add the school artifact.
                params = {'schoolID': school_id, 'memberID': member.id}
                claim_response = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaim(**params)
                if not claim_response.get('claimedByCurentUser'):
                    raise Exception("User not authorised to perform the operation.")            
            
            kwargs['school_id'] = school_id
            kwargs['artifact_id'] = request.POST.get('artifactID')
            kwargs['artifact_revision_id'] = request.POST.get('artifactRevisionID')
            kwargs['member_id'] = request.POST.get('memberID')
            kwargs['perma_url'] = request.POST.get('permaURL')
            kwargs['handle'] = request.POST.get('handle')
            kwargs['artifact_type'] = request.POST.get('artifactType')
            kwargs['status'] = request.POST.get('status', 'approved')
            

            if not (kwargs['artifact_id'] or kwargs['artifact_revision_id'] or (kwargs['perma_url'] and kwargs['handle'] and kwargs['artifact_type'])):
                raise Exception('Required input parameter "artifactID OR artifactRevisionID OR memberID-handle-artifactType" is missing')
            result['response']['schoolArtifacts'] = schoolartifacts.SchoolArtifacts(self.db).addSchoolArtifact(**kwargs)
            return result
        except Exception, e:
            log.error('Error in adding school artifact: [%s]' %(str(e)))
            if len(e.args) > 1:
                c.errorCode = e.args[1]
            else:
                c.errorCode = ErrorCodes.CANNOT_ADD_SCHOOL_ARTIFACT
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def deleteSchoolArtifact(self, member):
        """
            Delets flexbook from the school.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)

            kwargs = {}
            required_fields = ['schoolID', 'artifactID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field]

            if not u.isMemberAdmin(member): # Admin can delete the school artifact.
                params = {'schoolID': kwargs['schoolID'], 'memberID': member.id}
                claim_response = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaim(**params)
                if not claim_response.get('claimedByCurentUser'):
                    raise Exception("User not authorised to perform the operation.")            

            result['response']['schoolArtifacts'] = schoolartifacts.SchoolArtifacts(self.db).deleteSchoolArtifact(**kwargs)
            return result
        except Exception, e:
            log.error('Error in deleting school artifact: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_DELETE_SCHOOL_ARTIFACT
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def updateSchoolArtifact(self, member):
        """
            Update flexbook of the school.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}

            school_id = request.POST.get('schoolID')
            if not school_id:
                raise Exception('Required input parameter "schoolID" is missing')

            if not u.isMemberAdmin(member): # Admin can update the school artifact.
                params = {'schoolID': school_id, 'memberID': member.id}
                claim_response = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaim(**params)
                if not claim_response.get('claimedByCurentUser'):
                    raise Exception("User not authorised to perform the operation.")            
                                
            kwargs['school_id'] = school_id
            kwargs['artifact_id'] = request.POST.get('artifactID')
            kwargs['artifact_revision_id'] = request.POST.get('artifactRevisionID')
            kwargs['member_id'] = request.POST.get('memberID')
            kwargs['perma_url'] = request.POST.get('permaURL')
            kwargs['handle'] = request.POST.get('handle')
            kwargs['reviewerID'] = request.POST.get('reviewerID')
            kwargs['artifact_type'] = request.POST.get('artifactType')
            kwargs['status'] = request.POST.get('status', 'approved')
            
            update_dict = {}
            update_props = ['artifactPerma', 'cover', 'creatorName', 'description', 'detailsURL', 'memberID', 'published', 'reviewerID']
            for update_prop in update_props:
                if request.POST.get(update_prop) is not None:
                    update_dict[update_prop] = request.POST[update_prop]

            if not update_dict:
                raise Exception('No update information provided.')

            if not (kwargs['artifact_id'] or kwargs['artifact_revision_id'] or (kwargs['perma_url'] and kwargs['handle'] and kwargs['artifact_type'])):
                raise Exception('Required input parameter "artifactID OR artifactRevisionID OR memberID-handle-artifactType" is missing')
            kwargs['update_info'] = update_dict
            result['response']['schoolArtifacts'] = schoolartifacts.SchoolArtifacts(self.db).updateSchoolArtifact(**kwargs)
            return result
        except Exception, e:
            log.error('Error in updating school artifact: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_SCHOOL_ARTIFACT
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def createSchool(self, member):
        """
            Create school.
        """
        try:
            log.info('Member:%s' % member)
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")        
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['schoolName', 'state', 'city', 'zipcode']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field].strip():
                    raise Exception("%s can not be empty." % required_field)
                if required_field == 'schoolName':
                    kwargs[required_field] = request.POST[required_field].strip()
                else:
                    kwargs[required_field] = request.POST[required_field].strip().lower()

            result['response']['school'] = schoolartifacts.SchoolArtifacts(self.db).createSchool(**kwargs)
            return result
        except Exception, e:
            log.error('Error in creating school: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_CREATE_SCHOOL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def updateSchool(self, member):
        """
            Update school.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['schoolID', 'schoolName']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field].strip():
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field].strip()

            if not u.isMemberAdmin(member): # Admin can update the school.
                params = {'schoolID': kwargs['schoolID'], 'memberID': member.id}
                claim_response = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaim(**params)
                if not claim_response.get('claimedByCurentUser'):
                    raise Exception("User not authorised to perform the operation.")            
                                    
            result['response']['school'] = schoolartifacts.SchoolArtifacts(self.db).updateSchool(**kwargs)
            return result
        except Exception, e:
            log.error('Error in updating school: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_SCHOOL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getSchoolClaim(self):
        """
            Get school claim information.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['memberID', 'schoolID']
            for required_field in required_fields:
                if request.GET.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.GET[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.GET[required_field]

            result['response']['schoolClaim'] = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaim(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting school claim: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_CLAIM
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getSchoolClaims(self):
        """
            Get school claims for the given user.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['memberID']
            for required_field in required_fields:
                if request.GET.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.GET[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.GET[required_field]

            result['response']['schoolClaims'] = schoolartifacts.SchoolArtifacts(self.db).getSchoolClaims(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting school claims: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_CLAIM
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))            

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def addSchoolClaim(self, member):
        """
            Add school claim information.
        """
        try:
            log.info('Member:%s' % member)
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['memberID', 'schoolID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field].strip():
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field].strip()

            result['response']['schoolClaim'] = schoolartifacts.SchoolArtifacts(self.db).addSchoolClaim(**kwargs)
            return result
        except Exception, e:
            log.error('Error in adding school claim: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_ADD_SCHOOL_CLAIM
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def updateSchoolClaim(self, member):
        """
            Update school claim information.
        """
        try:
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['schoolID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field].strip()
                
            kwargs['memberID'] = request.POST.get('memberID')
            result['response']['schoolClaim'] = schoolartifacts.SchoolArtifacts(self.db).updateSchoolClaim(**kwargs)
            return result
        except Exception, e:
            log.error('Error in updating school claim: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_SCHOOL_CLAIM
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def deleteSchoolClaim(self, member):
        """
            Delete school claim information.
        """
        try:
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")                
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['memberID', 'schoolID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field]

            result['response'] = schoolartifacts.SchoolArtifacts(self.db).deleteSchoolClaim(**kwargs)
            return result
        except Exception, e:
            log.error('Error in deleting school claim: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_DELETE_SCHOOL_CLAIM
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))


    @d.jsonify()
    @d.trace(log)
    def getSchoolCounts(self):
        """
            Get School Counts.
        """
        try:
            kwargs = dict()
            status = request.GET.get('status', '').strip().lower()
            published = request.GET.get('published', '').strip().lower()
            isDeleted = request.GET.get('isDeleted', '').strip().lower()
            has_school_artifacts = request.GET.get('hasSchoolArtifacts', '').lower()
            kwargs['status'] = status
            kwargs['published'] = published     
            kwargs['isDeleted'] = isDeleted     
            kwargs['hasSchoolArtifacts'] = has_school_artifacts
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response']['schoolCounts'] = schoolartifacts.SchoolArtifacts(self.db).getSchoolCounts(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting school counts: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_COUNT
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getSchoolsByAttributes(self):
        """
            Get Schools based on the given attributes.
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            
            params = request.GET
            log.info('params: %s' %(params))
            school_id = params.get('schoolID', '').lower()
            school_name = params.get('schoolName', '')
            state = params.get('state', '').lower()
            city = params.get('city', '').lower()
            zipcode = params.get('zipcode', '').lower()
            sort = params.get('sort', '')
            is_deleted = params.get('isDeleted', '')
            try:
                page_num = int(params['pageNum'])
                page_size = int(params['pageSize'])
            except:
                page_num = 1
                page_size = 10

            if not (school_id or school_name or state or city or zipcode):
                raise Exception('Please provide atleast one of the parameter School ID/Name/State/City/Zipcode')
                            
            kwargs['school_id'] = school_id
            kwargs['school_name'] = school_name
            kwargs['state'] = state
            kwargs['city'] = city
            kwargs['zipcode'] = zipcode
            kwargs['page_num'] = page_num
            kwargs['page_size'] = page_size
            kwargs['sort'] = sort
            kwargs['is_deleted'] = is_deleted
            result['response'] = schoolartifacts.SchoolArtifacts(self.db).getSchoolsByAttributes(**kwargs)
            return result
        except Exception, e:
            log.error('Error in getting schools: [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_GET_SCHOOLS
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
            
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def deleteSchool(self, member):
        """
            Delete school.
        """
        try:
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")                        
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['schoolID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field]

            result['response'] = schoolartifacts.SchoolArtifacts(self.db).deleteSchool(**kwargs)
            return result
        except Exception, e:
            log.error('Error in deleting school : [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_DELETE_SCHOOL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
            
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def restoreSchool(self, member):
        """
            Restore school.
        """
        try:
            if not u.isMemberAdmin(member):
                raise Exception("User not authorised to perform the operation.")                        
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            required_fields = ['schoolID']
            for required_field in required_fields:
                if request.POST.get(required_field) is None:
                    raise Exception("%s is mandatory." % required_field)
                if not request.POST[required_field]:
                    raise Exception("%s can not be empty." % required_field)
                kwargs[required_field] = request.POST[required_field]

            result['response'] = schoolartifacts.SchoolArtifacts(self.db).restoreSchool(**kwargs)
            return result
        except Exception, e:
            log.error('Error in restoring school : [%s]' %(str(e)))
            c.errorCode = ErrorCodes.CANNOT_RESTORE_SCHOOL
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
