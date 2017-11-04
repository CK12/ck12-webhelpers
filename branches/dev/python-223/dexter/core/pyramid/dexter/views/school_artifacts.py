from datetime import datetime, timedelta, date
import hashlib

from pyramid.view import view_config

from pyramid.renderers import render_to_response
from dexter.lib import helpers as h
from dexter.views.decorators import jsonify
from dexter.views.errorCodes import ErrorCodes
from dexter.views.common import AssessCommon as common
from dexter.views.base import BaseView
from bson.objectid import ObjectId

import logging
log = logging.getLogger(__name__)


class SchoolArtifactsView(BaseView):

    def __init__(self, context, request):
        BaseView.__init__(self, context, request)
        self.config = h.load_config()
        self.web_prefix_url = self.config.get('web_prefix_url', 'http://www.ck12.org')
        self.message = ''
        self.region = ''
        self.country = ''

    @view_config(route_name='get_school_artifacts')
    @jsonify
    @h.trace
    def get_school_artifacts(self):
        """
        """
        try:
            request = self.request
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            state = params.get('state', '').lower()
            published = params.get('published', '').lower()
            status = params.get('status', '').lower()   
            try:
                convert_to_title_case = int(params.get('convert_to_title_case', '0'))
            except:
                convert_to_title_case = 0
            if not published:
                published = 'yes'
            if not status:
                status = 'approved'

            status = status.split(",")
            published = published.split(",")
            response = {}
            if not state:
                response['school_artifacts'] = []
            else:
                response['school_artifacts'] = self._get_school_artifacts(request.db, state, published, status, convert_to_title_case)
            result['response'] = response
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_ARTIFACTS
            log.error('schoolArtifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    def _get_school_artifacts(self, db, state, published, status, convert_to_title_case):
        """
        """
        school_artifacts_info = dict()
        results = db.SchoolArtifacts.find({'state':state.lower(), 'published': {'$in' : published}, 'status': {'$in' : status}, 'artifactID':{'$exists':True}})
        for result in results:
            school_name = result['schoolName']
            school_artifacts_info.setdefault(school_name, []).append(result)

        school_artifacts = []
        # Sort the schools by name
        schools = school_artifacts_info.keys()
        schools.sort()
        for school in schools:
            books = school_artifacts_info[school]
            approved_books = filter(lambda x:x.get('status') == 'approved', books)
            rejected_books = filter(lambda x:x.get('status') == 'rejected', books)
            not_reviewed_books = filter(lambda x:x.get('status') == 'to_be_reviewed', books)
            tmp_dict = dict()
            if convert_to_title_case:
                tmp_dict['school_name'] = school.title()
            else:
                tmp_dict['school_name'] = school
            tmp_dict['approved_books'] = approved_books
            tmp_dict['rejected_books'] = rejected_books
            if approved_books:
                school_id = approved_books[0]['schoolID']
            elif rejected_books:
                school_id = rejected_books[0]['schoolID']
            elif not_reviewed_books:
                school_id = not_reviewed_books[0]['schoolID']
            tmp_dict['school_id'] = school_id
            tmp_dict['not_reviewed_books'] = not_reviewed_books

            school_artifacts.append(tmp_dict)

        return school_artifacts

    @view_config(route_name='create_school')
    @jsonify
    @h.trace
    def create_school(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            school_info = {}
            school_name = params.get('schoolName')
            if not school_name:
                raise Exception('School Name is mandatory')
            state = params.get('state')
            if not state:
                raise Exception('State of the school is mandatory')
            city = params.get('city')
            if not city:
                raise Exception('City of the school is mandatory')
            zipcode = params.get('zipcode')
            if not zipcode:
                raise Exception('Zipcode of the school is mandatory')


            school_name = school_name.lower()
            state = state.lower()
            city = city.lower()
            school_id = zipcode + school_name
            school_id = hashlib.md5(school_id).hexdigest()

            school_info['schoolName'] = school_name
            school_info['state'] = state
            school_info['city'] = city
            school_info['zipcode'] = zipcode
            school_info['schoolID'] = school_id
            school_info['status'] = 'approved'

            school = db.SchoolArtifacts.find_one({'schoolID':school_id})
            if school:
                raise Exception('School with school name: [%s] in zipcode: [%s] already exists' %(school_name, zipcode))

            mongo_response = db.SchoolArtifacts.insert(school_info)
            log.info('mongo response: [%s]' %(mongo_response))
            school_info['message'] = 'Successfully added school name: [%s]. Mongo ID: [%s]' %(school_name, mongo_response)
            result['response'] = school_info
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_CREATE_SCHOOL
            log.error('schoolArtifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='update_school')
    @jsonify
    @h.trace
    def update_school(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            school_info = {}
            school_id = params.get('schoolID')
            if not school_id:
                raise Exception('SchoolID is mandatory')
            school_name = params.get('schoolName')
            if not school_name:
                raise Exception('School Name is mandatory')

            school_name = school_name.lower()
            mongo_response = db.SchoolArtifacts.update({'schoolID':school_id}, {'$set':{'schoolName':school_name}}, multi=True)

            log.info('mongo response: [%s]' %(mongo_response))
            school_info['message'] = 'Successfully updated school name: [%s]' %(school_name)
            result['response'] = school_info
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_CREATE_SCHOOL
            log.error('schoolArtifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='associate_school_artifact')
    @jsonify
    @h.trace
    def associate_school_artifact(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.POST
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            artifact_info = {}
            school_id = params.get('schoolID')
            if not school_id:
                raise Exception('schoolID is mandatory')
            school = db.SchoolArtifacts.find_one({'schoolID':school_id})
            del school['_id']
            if not school:
                raise Exception('School with schoolID: [%s] not found' %(school_id))
            artifact_info.update(school)
            artifact_id = params.get('artifactID')
            if not artifact_id:
                raise Exception('artifactID is mandatory')
            artifact_title = params.get('artifactTitle')
            if not artifact_title:
                raise Exception('artifactID is mandatory')
            artifact_cover = params.get('artifactCover')
            if not artifact_cover:
                artifact_cover = '%s/media/images/thumb_dflt_flexbook_lg.png' % self.web_prefix_url
            else:
                artifact_cover = '%s/' % self.web_prefix_url + artifact_cover
            artifact_creator_name = params.get('artifactCreatorName')
            if not artifact_creator_name:
                raise Exception('creatorName is mandatory')
            artifact_perma = params.get('artifactPerma')
            if not artifact_perma:
                raise Exception('artifactPerma is mandatory')
            artifact_creator_id = params.get('artifactCreatorID')
            if not artifact_creator_id:
                raise Exception('artifact_creator_id is mandatory')
            reviewer_id = params.get('reviewerID')
            if not reviewer_id:
                raise Exception('reviewerID is mandatory')
            artifact_perma = '%s/' % self.web_prefix_url + artifact_perma
            artifact_description = params.get('artifactDescription', '')
            artifact_details_url = '%s/flxadmin/artifact/' % self.web_prefix_url + artifact_id

            artifact_info['artifactID'] = artifact_id
            artifact_info['artifactTitle'] = artifact_title
            artifact_info['artifactPerma'] = artifact_perma
            artifact_info['cover'] = artifact_cover
            artifact_info['creatorName'] = artifact_creator_name
            artifact_info['description'] = artifact_description
            artifact_info['detailsURL'] = artifact_details_url
            artifact_info['memberID'] = artifact_creator_id
            artifact_info['published'] = 'yes'
            artifact_info['status'] = 'approved'
            artifact_info['reviewerID'] = reviewer_id

            existing_artifacts = db.SchoolArtifacts.find({'artifactID':artifact_id})
            existing_artifacts = [x['_id'] for x in existing_artifacts]

            mongo_response = db.SchoolArtifacts.insert(artifact_info)
            log.info('mongo response: [%s]' %(mongo_response))
            artifact_info['message'] = 'Successfully associated artifactID: [%s] with schoolID: [%s]. Mongo ID: [%s]' %(artifact_id, school_id, mongo_response)
            result['response'] = artifact_info

            if existing_artifacts:
                for each_artifact in existing_artifacts:
                    log.info('Found an existing artifact in document: [%s]' %(each_artifact))
                    db.SchoolArtifacts.remove(each_artifact)

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_ASSOCIATE_ARTIFACT
            log.error('schoolArtifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='update_school_artifacts')
    @jsonify
    @h.trace
    def update_school_artifacts(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            ids = params.get('id', '')
            ids = ids.split(',')
            action = params.get('action', '')
            response = {}
            if action not in ['approved', 'rejected', 'to_be_reviewed']:
                response['message'] = 'Please provide valid action'
                result['response'] = response
                return result            
            if not ids:
                response['message'] = 'Please provide ID'
                result['response'] = response
                return result

            update_fields = {}
            update_fields['status'] = action
            if params.has_key('rejection_reasons') and params['rejection_reasons']:
                update_fields['rejection_reasons'] = params['rejection_reasons']
            if params.has_key('rejection_comment') and params['rejection_comment']:
                update_fields['rejection_comment'] = params['rejection_comment']
            if params.has_key('user_id') and params['user_id']:
                update_fields['reviewerID'] = params['user_id']

            update_clause = {'$set' : update_fields}

            if action in ['approved', 'to_be_reviewed']:
                update_clause['$unset'] = {'rejection_comment':'', 'rejection_reasons':''}

            objects_ids = map(lambda x:ObjectId(x), ids)
            db.SchoolArtifacts.update({'_id':{'$in':objects_ids}}, update_clause, multi=True)
            response['message'] = 'Successfully %s the books, ID:%s' % (action, str(ids))
            result['response'] = response
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_UPDATE_SCHOOL_ARTIFACT
            log.error('schoolArtifacts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_school_counts')
    @jsonify
    @h.trace
    def get_school_counts(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            published = params.get('published', '').lower()
            status = params.get('status', '').lower()
            if not published:
                published = 'yes'
            if not status:
                status = 'approved'

            main_filters = {"published": published, "status":status}
            matchClause = {"$match": main_filters}
            groupClause = {"$group": {"_id" : "$state", "total": { "$sum": 1 } }}
            # Prepare query
            query = []
            query.append(matchClause)
            query.append(groupClause)

            log.info("Query :%s"%query)
            school_results = db.SchoolArtifacts.aggregate(query)
            results = school_results['result']
            log.info("Results :%s"%results)

            response = {'school_counts': results}
            result['response'] = response

            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_SCHOOL_COUNTS
            log.error('Error in get_school_counts: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='display_school_artifacts')
    @jsonify
    @h.trace
    def display_school_artifacts(self):
       return render_to_response('/schoolartifacts/schoolartifacts.jinja2', {})

    @view_config(route_name='display_school_artifacts_new')
    @jsonify
    @h.trace
    def display_school_artifacts_new(self):
       return render_to_response('/schoolartifacts/schoolartifacts_new.jinja2', {})

    @view_config(route_name='get_schools')
    @jsonify
    @h.trace
    def get_schools(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            state = params.get('state', '')
            if not state:
                raise Exception('Required input parameter "state" is missing')
            state = state.lower()

            #school_results = db.SchoolArtifacts.find({'state': state})
            school_results = db.SchoolArtifacts.aggregate([ {"$match":{"state": state, "status":"approved"}}, {"$group":{ "_id": { "schoolName": "$schoolName", "schoolID": "$schoolID" } }} ])

            schools = []
            for school_artifact in school_results['result']:
                schools.append({'schoolName': school_artifact['_id']['schoolName'], 'schoolID' : school_artifact['_id']['schoolID']})

            #log.info("Results :%s"%schools)

            result['response']['schools'] = schools
            #log.info(result)
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_SCHOOLS
            log.error('Error in get_school: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))

    @view_config(route_name='get_schools_by_attributes')
    @jsonify
    @h.trace
    def get_schools_by_attributes(self):
        """
        """
        try:
            request = self.request
            db = request.db
            result = common.getResponseTemplate(ErrorCodes.OK, 0)

            params = request.GET
            log.info('params: %s' %(params))
            h.trimParameters(params)
            log.info('trimmed params: %s' %(params))
            school_name = params.get('schoolName', '').lower()
            state = params.get('state', '').lower()
            city = params.get('city', '').lower()
            zipcode = params.get('zipcode', '').lower()
            school_id = params.get('schoolID', '').lower()
            sort = params.get('sort', '')
            try:
                page_num = int(params['pageNum'])
                page_size = int(params['pageSize'])
            except:
                page_num = 1
                page_size = 10

            if not (school_id or school_name or state or city or zipcode):
                raise Exception('Please provide atleast one of the parameter School ID/Name/State/City/Zipcode')

            match_query = dict()
            if school_id:
                match_query['schoolID'] = school_id
            if school_name:
                match_query['schoolName'] = {'$regex':school_name}
            if state:
                match_query['state'] = state
            if city:
                match_query['city'] = city
            if zipcode:
                match_query['zipcode'] = zipcode

            group_query = {"_id": { "schoolName": "$schoolName", "schoolID": "$schoolID",
                                    "state":"$state","city":"$city", "zipcode":"$zipcode"}}
            sort_query = dict() 
            aggr_query = [{"$match": match_query}, {"$group":group_query}]
            if sort:
                attb, order = sort.split(',')
                sort_query = {"_id.%s" %attb: 1 if order == 'asc' else -1}
                aggr_query.append({"$sort":sort_query})
            log.info("Aggr Query:%s" % aggr_query)
            school_results = db.SchoolArtifacts.aggregate(aggr_query)
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
                schools.append(school_info)

            result['response']['schools'] = schools
            result['response']['total'] = total
            return result
        except Exception,e:
            if not hasattr(self.c,'errorCode'):
                self.c.errorCode = ErrorCodes.CANNOT_GET_SCHOOLS
            log.error('Error in get_school: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(self.c.errorCode, str(e))
