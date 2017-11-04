import logging
from datetime import datetime
from bson.objectid import ObjectId
import pymongo
import hashlib
import urllib
import json
from flx.lib import helpers as h
from flx.model.mongo.validationwrapper import ValidationWrapper
from flx.model import api
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class SchoolArtifacts(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        self.required_fields = []

    """
        Get Schools for given parameters.
    """
    def getSchools(self, **kwargs):
        try:
            if kwargs.get('isDeleted') and kwargs['isDeleted'] in ['true', 'false']:
                isDeleted = True if kwargs['isDeleted'] == 'true' else False
                kwargs['isDeleted'] = {'$exists':isDeleted}
            else:
                del kwargs['isDeleted']
                
            results = []
            schools = self.db.SchoolArtifacts.find(kwargs, {'schoolName':1, 'schoolID':1})
            for school in schools:
                results.append({'schoolName': school['schoolName'], 'schoolID' : school['schoolID']})

            log.info("Results: [%s]" % results)
            return results
        except Exception as e:
            log.error('Error getting schools: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Get School artifacts.
    """
    def getSchoolArtifacts(self, **kwargs):
        try:
            log.info("kwargs: [%s]" %kwargs)
            params = {'state':kwargs['state']} 
            filter_status = filter_published = False
            if kwargs.get('status'):
                filter_status = True
            if kwargs.get('published') and kwargs['published'] in ['true', 'false']:
                kwargs['published'] = True if kwargs['published'] == 'true' else False
                filter_published = True
            if kwargs.get('isDeleted'):
                if kwargs['isDeleted'] == 'true':
                    params['isDeleted'] = {'$exists': True}
                elif kwargs['isDeleted'] == 'false':
                    params['isDeleted'] = {'$exists': False}
                     
            results = self.db.SchoolArtifacts.find(params).sort("schoolName", pymongo.ASCENDING)
            school_artifacts = []
            for result in results:
                if filter_status:
                    # Filter out the artifacts based on status
                    result['artifacts'] = filter(lambda x:x.get('status') == kwargs['status'], result['artifacts']) 
                if filter_published:
                    # Filter out the artifacts based on status
                    result['artifacts'] = filter(lambda x:x.get('published') == kwargs['published'], result['artifacts']) 
                school_artifacts.append(result)
            
            if kwargs.has_key('hasSchoolArtifacts') and kwargs['hasSchoolArtifacts']:
                if kwargs['hasSchoolArtifacts'] == 'true':
                    school_artifacts = filter(lambda arft:arft.get('artifacts'), school_artifacts) 
                elif kwargs['hasSchoolArtifacts'] == 'false':
                    school_artifacts = filter(lambda arft:not arft.get('artifacts'), school_artifacts)
            
            return school_artifacts
        except Exception as e:
            log.error('Error getting school artifacts: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Add flexbook to school.
    """
    def addSchoolArtifact(self, **kwargs):
        try:
            school_id = kwargs['school_id']
            school = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school:
                raise Exception("Unable to find the school with schooID: [%s]" % school_id)
            if school.has_key('isDeleted') and school['isDeleted'] == True:
                raise Exception("Cannot add school artifact, School is deleted. schooID: [%s]" % school_id)            
            _id = school['_id']
            config = h.load_pylons_config()
            web_prefix_url = config.get('web_prefix_url', '')        
            # Get the artifact object from the request parameters.
            if kwargs['artifact_id']:
                artifact_id = kwargs['artifact_id']
                artifact = api.getArtifactByID(artifact_id)
            elif kwargs['artifact_revision_id']:
                arft_rev = api.getArtifactRevisionByID(kwargs['artifact_revision_id'])
                artifact = arft_rev.artifact
            else:
                arft_type = api.getArtifactTypeByName(kwargs['artifact_type'])
                if not arft_type:
                    raise Exception("Invalid artifact type provided: %s" % kwargs['artifact_type'])
                perma_url = kwargs['perma_url'].strip()
                new_perma_url = '%s/flx/get/perma/info/%s' % (web_prefix_url, perma_url)
                log.info("new_perma_url: [%s]" % new_perma_url)

                creator_id, perma_handle = self._getCreatorFromPermaURL(new_perma_url)
                if not creator_id:
                    raise Exception("Unable to get creatorID from perma URL: %s" % kwargs['perma_url'], ErrorCodes.INVALID_PERMA_URL)
                handle = h.safe_encode(kwargs['handle']) # Encode the handle
                handle = urllib.quote(handle)
                artifact = api.getArtifactByHandle(handle, arft_type.id, creator_id)
                if not artifact: # Check if the artifact is saved without encoding.
                    artifact = api.getArtifactByHandle(kwargs['handle'], arft_type.id, creator_id)
                if not artifact and perma_handle:
                    artifact = api.getArtifactByHandle(perma_handle, arft_type.id, creator_id)
            if not artifact:
                raise Exception("Unable to get the artifact.", ErrorCodes.ARTIFACT_DOES_NOT_EXISTS)

            if not artifact.revisions[0].publishTime:
                raise Exception("Unable to add the artifact, Artifact not published.", ErrorCodes.ARTIFACT_NOT_PUBLISHED)
                
            # Check condition artifact already exists.
            artifacts = school.get('artifacts', [])
            artifact_ids = [arft['artifactID'] for arft in artifacts]
            if str(artifact.id) in artifact_ids:
                raise Exception("Artifact already present. schoolID/artifactID: %s/%s" % (school_id, str(artifact.id)), 
                                ErrorCodes.ARTIFACT_ALREADY_EXISTS)

            artifact_info = artifact.asDict()

            # Build details url
            config = h.load_pylons_config()
            web_prefix_url = config.get('web_prefix_url', '')        
            details_url = '%s/flxadmin/artifact/%s' % (web_prefix_url, artifact_info['id'])
            # Build artifact perma
            perma = artifact_info.get('perma')
            if perma.split('/')[-1].startswith('user:'):
                new_perma = '/'.join(perma.split('/')[:-1])    
                realm = perma.split('/')[-1]
                artifact_perma = '%s/%s%s' % (web_prefix_url, realm, new_perma)
            else:
                artifact_perma = '%s%s' % (web_prefix_url, perma)

            flexbook_info = dict()
            flexbook_info['artifactID'] = str(artifact_info['id'])
            flexbook_info['reviewerID'] = None
            flexbook_info['published'] = True if artifact.revisions[0].publishTime else False
            flexbook_info['detailsURL'] = details_url
            flexbook_info['description'] = artifact.description
            flexbook_info['creatorName'] = artifact_info.get('creator')
            flexbook_info['cover'] = artifact_info.get('coverImageSatelliteUrl')
            flexbook_info['artifactTitle'] = artifact_info.get('title')
            flexbook_info['artifactPerma'] = artifact_perma
            flexbook_info['memberID'] = str(artifact_info.get('creatorID'))
            flexbook_info['status'] = kwargs.get('status', 'approved')

            update_info = self.db.SchoolArtifacts.update({'_id':_id}, {'$push':{'artifacts':flexbook_info}})
            log.info("Update Result: [%s]" % update_info)
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            artifacts = school_info.get('artifacts', [])
            filtered_artifacts = filter(lambda x:x.get('status') == 'approved', artifacts) # Filter out the approved artifacts.
            school_info['artifacts'] = filter(lambda x:x.get('published') == True, filtered_artifacts) # Filter out the published artifacts.
                        
            log.info("School Info: [%s]" % school_info)
            return school_info
        except Exception as e:
            log.error('Error adding flexbook to school: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Delete flexbook from school.
    """
    def deleteSchoolArtifact(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            school = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school:
                raise Exception("Unable to find the school with schooID: [%s]" % school_id)
            if school.has_key('isDeleted') and school['isDeleted'] == True:
                raise Exception("Cannot delete school artifact, School is deleted. schooID: [%s]" % school_id)                            
            _id = school['_id']
            artifact_id = kwargs['artifactID']
            log.info("School MongoID/schoolID/artifactID:%s/%s/%s" % (_id, school_id, artifact_id))
            delete_info = self.db.SchoolArtifacts.update({'_id':ObjectId(_id)}, {'$pull':{'artifacts':{'artifactID':artifact_id}}})
            log.info("Delete Info: [%s]" % delete_info)
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            artifacts = school_info.get('artifacts', [])
            filtered_artifacts = filter(lambda x:x.get('status') == 'approved', artifacts) # Filter out the approved artifacts.
            school_info['artifacts'] = filter(lambda x:x.get('published') == True, filtered_artifacts) # Filter out the published artifacts.
            log.info("School Info: [%s]" % school_info)
            return school_info
        except Exception as e:
            log.error('Error deleting flexbook from school: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Update flexbook of the school.
    """
    def updateSchoolArtifact(self, **kwargs):
        try:
            school_id = kwargs['school_id']
            school = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school:
                raise Exception("Unable to find the school artifact with schooID: [%s]" % school_id)
            if school.has_key('isDeleted') and school['isDeleted'] == True:
                raise Exception("Cannot update school artifact, School is deleted. schooID: [%s]" % school_id)                
            _id = school['_id']
            # Retrieve the update information
            update_info = kwargs['update_info']
            if not update_info:
                raise Exception("No update info provided")

            # Get the artifact object from the request parameters.
            if kwargs['artifact_id']:
                artifact_id = kwargs['artifact_id']
                artifact = api.getArtifactByID(artifact_id)
            elif kwargs['artifact_revision_id']:
                arft_rev = api.getArtifactRevisionByID(kwargs['artifact_revision_id'])
                artifact = arft_rev.artifact
            else:
                arft_type = api.getArtifactTypeByName(kwargs['artifact_type'])
                if not arft_type:
                    raise Exception("Invalid artifact type provided: [%s]" % kwargs['artifact_type'])
                perma_url = kwargs['perma_url'].strip()
                new_perma_url = '%s/flx/get/perma/info/%s' % (web_prefix_url, perma_url)
                log.info("new_perma_url: [%s]" % new_perma_url)
                creator_id, perma_handle = self._getCreatorFromPermaURL(new_perma_url)
                if not creator_id:
                    raise Exception("Unable to get creatorID from perma URL: %s" % new_perma_url)
                artifact = api.getArtifactByHandle(kwargs['handle'], arft_type.id, creator_id)
                if not artifact and perma_handle:
                    artifact = api.getArtifactByHandle(perma_handle, arft_type.id, creator_id)
            if not artifact:
                raise Exception("Unable to get the artifact.")
            
            if update_info.get('published'):
                if update_info['published'] in ['true', 'false']:
                    update_info['published'] = True if update_info['published'] == 'true' else False
                else:
                    raise Exception("Please provide appropriate value for published.")
            
            if update_info.get('memberID'):
                try:
                    m_id = int(update_info['memberID'])
                except Exception as e:
                    raise Exception("Please provide appropriate value for memberID.")

            if update_info.get('reviewerID'):
                try:
                    r_id = int(update_info['reviewerID'])
                except Exception as e:
                    raise Exception("Please provide appropriate value for reviewerID.")

            artifact_id = str(artifact.id)
            # Get the artifact that needs to be updated.
            artifacts = school['artifacts']
            artifact_dict = dict([(arft['artifactID'], arft) for arft in artifacts])            
            if not artifact_dict.has_key(artifact_id):
                raise Exception("Artifact is not associated with the school, schoolID/artifactID: [%s/%s]" % (school_id, artifact_id))
            
            # prepare the updated artifact dict
            artifact_info = artifact_dict[artifact_id]
            for prop in artifact_info.keys():
                if update_info.has_key(prop):
                    artifact_info[prop] = update_info[prop]
            artifact_dict[artifact_id] = artifact_info
            
            updated_artifacts = artifact_dict.values()
            update_info = self.db.SchoolArtifacts.update({'_id':_id}, {'$set':{'artifacts':updated_artifacts}})
            log.info("Update Result: [%s]" % update_info)
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            artifacts = school_info.get('artifacts', [])
            filtered_artifacts = filter(lambda x:x.get('status') == 'approved', artifacts) # Filter out the approved artifacts.
            school_info['artifacts'] = filter(lambda x:x.get('published') == True, filtered_artifacts) # Filter out the published artifacts.
            log.info("School Info: [%s]" % school_info)
            return school_info           
        except Exception as e:
            log.error('Error updating flexbook to school: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Create School.
    """
    def createSchool(self, **kwargs):
        try:
            school_name = kwargs['schoolName']
            if len(school_name) > 100:
                raise Exception("Please provide proper school name. Error:School name is very long.")
            zipcode = kwargs['zipcode']
            school_id = school_name + zipcode
            school_id = hashlib.md5(school_id).hexdigest()

            school = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if school:
                raise Exception('School with school name: [%s] in zipcode: [%s] already exists' %(school_name, zipcode))
            kwargs['schoolID'] = school_id
            kwargs['artifacts'] = []
                
            create_info = self.db.SchoolArtifacts.insert(kwargs)
            log.info("Create Result: [%s]" % create_info)
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})

            log.info("School Info: [%s]" % school_info)
            return school_info
        except Exception as e:
            log.error('Error getting schools: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Update School.
    """
    def updateSchool(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            school_name = kwargs['schoolName']
            school = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school:
                raise Exception('School with schoolID: [%s] does not exists.' %(school_id))
            if school.has_key('isDeleted') and school['isDeleted'] == True:
                raise Exception("Cannot update school, School is deleted. schooID: [%s]" % school_id)
            if len(school_name) > 100:
                raise Exception("Please provide proper school name. Error:School name is very long.")
            _id = school['_id']
            zipcode = school['zipcode']
            old_school_name = school['schoolName'] 
            if old_school_name == school_name:
                log.info("No change in school name.")
                return school
                
            new_school_id = school_name + zipcode
            new_school_id = hashlib.md5(new_school_id).hexdigest()
            new_school = self.db.SchoolArtifacts.find_one({'schoolID':new_school_id})
            if new_school:
                raise Exception('School with school name: [%s] in zipcode: [%s] already exists' %(school_name, zipcode))
            # Update the schoolID when school name is changed.
            update_args = {'schoolName':school_name, 'schoolID':new_school_id}               
            update_info = self.db.SchoolArtifacts.update({'_id':ObjectId(_id)}, {'$set':update_args})
            log.info("Update Result: [%s]" % update_info)
            
            results = self.db.SchoolMemberAssociation.find({'schoolID':school_id})
            for result in results:
                _id = result['_id']
                update_result = self.db.SchoolMemberAssociation.update({'_id':ObjectId(_id)}, {'$set': {'schoolID': new_school_id}})
                log.info("update_member_result: [%s]" % update_result)
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':new_school_id})
            log.info("School Info: [%s]" % school_info)
            return school_info           
        except Exception as e:
            log.error('Error updating school: [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Get School claim information.
    """
    def getSchoolClaim(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            member_id = str(kwargs['memberID'])
            claim_info = {'schoolID': school_id, 'claimedByCurentUser':False}
            school_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            if school_info:            
                log.info("School is claimed. Claim Info: [%s]" % school_info)
                if school_info['memberID']:
                    claim_info['claimStatus'] = 'CLAIMED'
                    if member_id == school_info['memberID']:
                        claim_info['claimedByCurentUser'] = True                    
                else:
                    claim_info['claimStatus'] = 'NOT_CLAIMED'

                claim_info['memberID'] = school_info['memberID']
                claim_info['createdTime'] = school_info['createdTime']
                claim_info['updatedTime'] = school_info['updatedTime'] 
            else:
                log.info("School not yet claimed.")
                claim_info['claimStatus'] = 'NOT_CLAIMED'
            return claim_info
        except Exception as e:
            log.error('Error gettting school claim : [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Get School claim information.
    """
    def getSchoolClaims(self, **kwargs):
        try:
            member_id = kwargs['memberID']
            claim_info = {'schoolClaimCount': 0, 'schools':[]}
            school_info = self.db.SchoolMemberAssociation.find({'memberID':member_id})
            if school_info:
                school_ids = [school['schoolID'] for school in school_info]
                results = self.db.SchoolArtifacts.find({'schoolID': {'$in': school_ids}}, {'schoolID':1, 'schoolName':1})                
                schools = [school for school in results]
                claim_info['schools'] = schools
                claim_info['schoolClaimCount'] = len(schools)
                log.info("Total [%s] Schools claimed by memberID [%s] " % (len(schools), member_id))
            return claim_info
        except Exception as e:
            log.error('Error gettting school claim : [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Add School claim information.
    """
    def addSchoolClaim(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            member_id = kwargs['memberID']
            has_role = self._memberHasRole(member_id, 'teacher')
            if not has_role:
                raise Exception("Only Teachers can claim a school.")
            
            school_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            if school_info:
                if school_info.get('memberID'):
                    log.info("School is already claimed by schoolID/memberID: [%s/%s]" % (school_info['schoolID'], school_info['memberID']))
                    raise Exception("School is already claimed by schoolID/memberID: [%s/%s]" % (school_info['schoolID'], school_info['memberID']))

            now = datetime.now()
            claim_info = dict()            
            claim_info['memberID'] = member_id            
            claim_info['updatedTime'] = now
            if school_info:
                add_result = self.db.SchoolMemberAssociation.update({'schoolID':school_id}, {'$set':claim_info})
            else:
                claim_info['schoolID'] = school_id
                claim_info['createdTime'] = now
                log.info("School will be claimed first time.")
                add_result = self.db.SchoolMemberAssociation.insert(claim_info)
            log.info("Add Result: [%s]" % add_result)
            claim_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id, 'memberID':member_id})
            log.info("School Claim Info: [%s]" % claim_info)
            return claim_info
        except Exception as e:
            log.error('Error adding school claim : [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Update School claim information.
    """
    def updateSchoolClaim(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            member_id = kwargs.get('memberID', '')
            if member_id:
                has_role = self._memberHasRole(member_id, 'teacher')
                if not has_role:
                    raise Exception("Only Teachers can claim a school.")
                school_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
                if not school_info:
                    log.info("Cannot update school claim, school is not yet claimed.")
                    raise Exception("Cannot update school claim, school is not yet claimed.")                
            else:
                # Remove the school claim
                member_id = None

            claim_info = dict()
            claim_info['memberID'] = member_id
            claim_info['updatedTime'] = datetime.now()
            update_result = self.db.SchoolMemberAssociation.update({'schoolID':school_id}, {'$set':claim_info})

            log.info("Update Result: [%s]" % update_result)
            claim_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            log.info("School Claim Info: [%s]" % claim_info)
            return claim_info
        except Exception as e:
            log.error('Error updating school claim : [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Delete School claim information.
    """
    def deleteSchoolClaim(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            member_id = kwargs['memberID']
            school_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            if not school_info:
                log.info("Cannot delete school claim, school is not yet claimed.")
                raise Exception("Cannot delete school claim, school is not yet claimed.")
            if school_info['memberID'] != member_id:
                log.info("Cannot delete school claim, claimed by other member, schoolID/memberID: [%s/%s]" % (school_id, school_info['memberID']))
                raise Exception("Cannot delete school claim, claimed by other member, schoolID/memberID: [%s/%s]" % (school_id, school_info['memberID']))

            claim_info = dict()
            claim_info['memberID'] = member_id
            claim_info['updatedTime'] = datetime.now()
            delete_result = self.db.SchoolMemberAssociation.remove({'schoolID':school_id, 'memberID':member_id})
            log.info("Delete Result: [%s]" % delete_result)
            claim_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id, 'memberID':member_id})
            delete_info = {'message':'Failed to delete School claim.'} if claim_info else {'message':'School claim successfully deleted.'}
            return delete_info
        except Exception as e:
            log.error('Error deleting school claim : [%s]' %(str(e)), exc_info=e)
            raise e

    """
        Get School Counts
    """
    def getSchoolCounts(self, **kwargs):
        try:
            params = dict()
            state_schools_dict = dict()
            filter_status = filter_published = False
            if kwargs.get('status'):
                filter_status = True
            if kwargs.get('published') and kwargs['published'] in ['true', 'false']:
                kwargs['published'] = True if kwargs['published'] == 'true' else False
                filter_published = True
            if kwargs.get('isDeleted'):
                if kwargs['isDeleted'] == 'true':
                    params['isDeleted'] = {'$exists': True}
                elif kwargs['isDeleted'] == 'false':
                    params['isDeleted'] = {'$exists': False}
            if kwargs.has_key('hasSchoolArtifacts') and kwargs['hasSchoolArtifacts']:
                handle_school_artifacts = True
            else:
                handle_school_artifacts = False
                                     
            results = self.db.SchoolArtifacts.find(params, {'schoolName':1, 'schoolID':1, 'state':1, 'artifacts':1})
            school_artifacts = []
            for result in results:
                state = result['state'].strip()
                if not state:
                    continue            
                if filter_status:
                    # Filter out the artifacts based on status
                    result['artifacts'] = filter(lambda x:x.get('status') == kwargs['status'], result['artifacts']) 
                if filter_published:
                    # Filter out the artifacts based on status
                    result['artifacts'] = filter(lambda x:x.get('published') == kwargs['published'], result['artifacts']) 
                
                
                if handle_school_artifacts:
                    if kwargs['hasSchoolArtifacts'] == 'true' and result.get('artifacts'):
                        state_schools_dict.setdefault(state, []).append(result['schoolName'])
                    elif kwargs['hasSchoolArtifacts'] == 'false' and not result.get('artifacts'):
                        state_schools_dict.setdefault(state, []).append(result['schoolName'])
                    else:
                        state_schools_dict.setdefault(state, [])
                else:
                    state_schools_dict.setdefault(state, []).append(result['schoolName'])
                    
            states = state_schools_dict.keys()
            states.sort()
            results = []
            for state in states:
                rec = {'_id':state, 'total':len(state_schools_dict[state])}
                results.append(rec)
            log.info("Results: [%s]" % results)
            
            return results
        except Exception as e:
            log.error('Error getting school counts: [%s]' %(str(e)), exc_info=e)
            raise e
            
          
    def _getCoverImage(artifact_type):
        """
        """
        image_dict = {}
        image_dict['book'] = '/media/images/thumb_dflt_flexbook_lg.png'
        image_dict['chapter'] = '/media/images/thumb_dflt_chapter_lg.png'
        image_dict['lesson'] = '/media/images/thumb_dflt_lesson_lg.png'
        image_dict['concept'] = '/media/images/thumb_dflt_concept_lg.png'
        image_dict['default'] = '/media/images/thumb_dflt_concept_lg.png'

        if artifact_type in ['book', 'chapter', 'lesson', 'concept']:
            return image_dict[artifact_type] 
        else:
            return image_dict['default']            

    """
        Get Schools by attributes.
    """
    def getSchoolsByAttributes(self, **kwargs):
        try:
            match_query = dict()
            if kwargs['school_id']:
                match_query['schoolID'] = kwargs['school_id']
            if kwargs['school_name']:
                match_query['schoolName'] = {'$regex': kwargs['school_name'], '$options':'i'}
            if kwargs['state'] and kwargs['state'] != 'all':
                match_query['state'] = kwargs['state']
            if kwargs['city']:
                match_query['city'] = kwargs['city']
            if kwargs['zipcode']:
                match_query['zipcode'] = kwargs['zipcode']
            if kwargs['is_deleted'] == 'true':
                match_query['isDeleted'] = {'$exists':True}
            elif kwargs['is_deleted'] == 'false':
                match_query['isDeleted'] = {'$exists': False}
            page_num = 1
            page_size = 10
            if kwargs.has_key('page_num'):
                page_num = kwargs['page_num']
            if kwargs.has_key('page_size'):
                page_size = kwargs['page_size']                

            group_query = {"_id": { "schoolName": "$schoolName", "schoolID": "$schoolID",
                                    "state":"$state","city":"$city", "zipcode":"$zipcode", "isDeleted":"$isDeleted"}}
            sort_query = dict() 
            aggr_query = [{"$match": match_query}, {"$group":group_query}]
            if kwargs['sort']:
                attb, order = kwargs['sort'].split(',')
                sort_query = {"_id.%s" %attb: 1 if order == 'asc' else -1}
                aggr_query.append({"$sort":sort_query})
            log.info("Aggr Query:%s" % aggr_query)
            school_results = self.db.SchoolArtifacts.aggregate(aggr_query)
            school_results = school_results['result']
            total = len(school_results)
            if page_size != -1:
                s_offset = (page_num - 1) * page_size
                e_offset = page_num * page_size
                school_results = school_results[s_offset:e_offset]

            schools = []
            for school_artifact in school_results:
                school_info = dict()
                for item in ['schoolName', 'schoolID', 'state', 'city', 'zipcode']:
                    school_info[item] = school_artifact['_id'][item]
                if school_artifact['_id'].has_key('isDeleted'):
                    school_info['isDeleted'] = school_artifact['_id']['isDeleted']
                else:
                    school_info['isDeleted'] = False
                schools.append(school_info)

            log.info("Schools: [%s]" % schools)
            result = {}
            result['schools'] = schools
            result['total'] = total
            return result
                    
        except Exception as e:
            log.error('Error getting schools: [%s]' %(str(e)), exc_info=e)
            raise e            

    def _getCreatorFromPermaURL(self, perma_url):
        """
        """
        try:
            perma_url = h.safe_encode(perma_url)
            resp = urllib.urlopen(perma_url).read()            
            json_resp = json.loads(resp)
            arft_type = json_resp['response'].keys()[0]
            creator_id = json_resp['response'][arft_type]['creatorID']
            handle = json_resp['response'][arft_type].get('handle', '')
            return (creator_id, handle)
        except Exception as ex:
            log.info("Unable to get creator from perma url. Error:%s" % str(ex))
            return (None, None)

    def _memberHasRole(self, member_id, role_name):
        """
        """
        roles = []
        member = api.getMemberByAuthID(member_id)
        log.info("memebr model:%s" % str(member))
        if hasattr(member, 'groupRoles'):
            groupRoles = member.groupRoles
        else:
            groupRoles = api._getGroupMemberRoles(1, member.id)
        log.info("group Roles:%s" % groupRoles)
        for groupRole in groupRoles:
            if groupRole.groupID != 1:
                continue

            if groupRole.role.name:
                if groupRole.role.name == role_name:
                    return True
        return False
        
    """
        Delete School information.
    """
    def deleteSchool(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            school_artifacts_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school_artifacts_info:
                raise Exception("Cannot delete school , school does not exists.")
                  
            delete_info = {'isDeleted':True}
            delete_result = self.db.SchoolArtifacts.update({'schoolID':school_id}, {'$set':delete_info})            
            log.info("Delete School Result: [%s]" % delete_result)

            school_claim_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            if school_claim_info:
                delete_result = self.db.SchoolMemberAssociation.update({'schoolID':school_id}, {'$set':delete_info})
                log.info("Delete School Claim Result: [%s]" % delete_result)
            
            delete_info = {'message':'School successfully deleted.'}
            return delete_info
        except Exception as e:
            log.error('Error deleting school : [%s]' %(str(e)), exc_info=e)
            raise e
            
    """
        Restore School information.
    """
    def restoreSchool(self, **kwargs):
        try:
            school_id = kwargs['schoolID']
            school_info = self.db.SchoolArtifacts.find_one({'schoolID':school_id})
            if not school_info:
                raise Exception("Cannot restore school , school does not exists.")
                
            if not school_info.get('isDeleted'):
                raise Exception("Cannot restore school , school is not deleted.")
                  
            delete_info = {'isDeleted':1}
            restore_result = self.db.SchoolArtifacts.update({'schoolID':school_id}, {'$unset':delete_info})            
            log.info("Restore School Result: [%s]" % restore_result)

            school_claim_info = self.db.SchoolMemberAssociation.find_one({'schoolID':school_id})
            if school_claim_info:
                restore_result = self.db.SchoolMemberAssociation.update({'schoolID':school_id}, {'$unset':delete_info})
                log.info("Restore School Claim Result: [%s]" % restore_result)
            
            restore_info = {'message':'School successfully restored.'}
            return restore_info
        except Exception as e:
            log.error('Error restoring school : [%s]' %(str(e)), exc_info=e)
            raise e
