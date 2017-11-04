import logging
import os,re,json
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

from sts.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)


PUBLISHED = 'published'

class CoursesController(BaseController):
    @d.jsonify()
    @d.trace(log, ['course'])
    def getCourseStructure(self,course):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.debug("get course structure params: %s" % str(request.params))
        try:
            cs = api.getCourseStructure(course)
            if not cs:
                raise Exception('Course Structure not found')
            result['response']['courseStructure'] = cs
            return result
        except Exception, e:
            log.error("Error getting course structue: %s" % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_GET_COURSE_FLOW
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def deleteCourseStructure(self,**kwargs):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.debug("deleteCourseStructure params: %s" % str(request.params))
        try:
            isAdmin = u.hasRoleInGroup('admin')
            if not isAdmin:
                raise Exception('User must be  admin to create course structure')
            course_shortname = request.POST.get('shortname')
            result['response']['deletedCourseStrcture']=api.deleteCourseStructure(course_shortname)
            return result            
        except Exception, e:
            log.error("Error getting course structue: %s" % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_GET_COURSE_FLOW
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    #@d.checkAuth()
    #@d.trace(log, ['member'])
    def createCourseStructure(self,**kwargs):
        log.error("create course structure ::"+request.body)
        courseInfo = None
        try:
            courseInfo = json.loads(request.body)
        except Exception,e:
            log.error("Content-Type header must be set to 'application/json; charset=UTF-8'. %s  " % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_GET_COURSE_FLOW
            return ErrorCodes().asDict(c.errorCode, str(e))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course structure')
            result['response'] = api.createCourseStructure(**courseInfo)
            return result
        except Exception, e:
            log.error("Error creating course flow: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_COURSE_FLOW_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE_FLOW
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['course'])
    def getCourseNode(self,course):       
        ''' get all available info for course '''
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info('get course flow params: %s' % str(request.params))
        try:
            courseNode = api.getCourseNode(course)
            if not courseNode:
                c.errorCode = ErrorCodes.NO_SUCH_COURSE_NODE
                return ErrorCodes().asDict(c.errorCode, 'course: %s not found' % course)

            result['response']['courseNode'] = courseNode.asDict()
            return  result
        except Exception, e:
            log.error("Error getting course: %s" % str(e), exc_info=e)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_COURSE_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['course'])
    def updateCourseNode(self, course):
        ''' update course node '''
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("updateCourseNode params: %s" % str(request.params))
        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course node')
            kwargs = {}
            if request.POST.get('name'):
                kwargs['name'] = request.POST.get('name')
            if request.POST.get('handle'):
                kwargs['handle'] = request.POST.get('handle')            
            if request.POST.get('description'):
                kwargs['description'] = request.POST.get('description')
            if request.POST.get('previewImageUrl'):
                kwargs['previewImageUrl'] = request.POST.get('previewImageUrl')            
            if request.POST.get('country'):
                kwargs['country'] = request.POST.get('country')   
            if request.POST.get('created'):
                kwargs['created'] = request.POST.get('created')   
            result['response']['updatedCourseNode'] = api.updateCourseNode(course,**kwargs).asDict()
        except Exception,e:
            log.error("Error updating course node: %s"  % str(e), exc_info=e )
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_UPDATE_COURSE_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))
        return result


    @d.jsonify()
    #@d.checkAuth()
    @d.trace(log, ['member'])
    def insertConceptNodeIntoUnit(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("insertConceptNodeIntoUnit params: %s" % str(request.params))
        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course node')
            unitEID = request.POST.get('unitEID','')
            conceptEID = request.POST.get('conceptEID','')
            seq = request.POST.get('sequenceNo','') 
            if unitEID and conceptEID and seq:
                result['response']['updatedCourseStructure'] = api.insertConceptNodeIntoUnit(unitEID,conceptEID,seq)
            else:
                raise Exception('unitEID, conceptEID, sequenceNo are required')
        except Exception, e:
            log.error("Error creating course flow: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_COURSE_FLOW_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE_FLOW
            return ErrorCodes().asDict(c.errorCode, str(e))            
        return result
   
    @d.jsonify()
    #@d.checkAuth()
    @d.trace(log, ['member'])
    def createUnitNode(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("create course unit params: %s" % str(request.params))
        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course node')
            name = request.POST.get('name', '').strip()
            sequenceNo = request.POST.get('sequenceNo','').strip()
            courseShortnameOrHandle = request.POST.get('course',None)
            if not(name and sequenceNo and courseShortnameOrHandle):
                raise Exception('name, sequenceNo, course are required')
            handle = request.POST.get('handle', '')
            description = request.POST.get('description', '')
            previewImageUrl = request.POST.get('previewImageUrl','')
            created = request.POST.get('created',str(datetime.now()))
            updated = str(datetime.now())
            un = api.createUnitNode(name,sequenceNo,handle,description,previewImageUrl,courseShortnameOrHandle,created=created,updated=updated)[0].asDict()
            log.info("Created new unit node: %s" % ( un))

            activityType = ActivityLog.ACTIVITY_TYPE_UNIT_NODE_CREATE
            alog.logActivity(activityType, un)

            result['response']['unitNode'] = un
            return result

        except Exception, e:
            log.error("Error creating new unit node: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_UNIT_NODE_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_UNIT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    #@d.checkAuth()
    @d.trace(log, ['unitEID'])
    def updateUnitNode(sef,unitEID):
        ''' update unit node '''
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("updateUnitNode params: %s" % str(request.params))
        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course node')
            kwargs = {}
            if request.POST.get('name'):
                kwargs['name'] = request.POST.get('name')
            if request.POST.get('handle'):
                kwargs['handle'] = request.POST.get('handle')            
            if request.POST.get('description'):
                kwargs['description'] = request.POST.get('description')
            if request.POST.get('previewImageUrl'):
                kwargs['previewImageUrl'] = request.POST.get('previewImageUrl')            
            if request.POST.get('created'):
                kwargs['created'] = request.POST.get('created')   
            result['response']['updatedCourseNode'] = api.updateCourseNode(course,**kwargs).asDict()
        except Exception,e:
            log.error("Error updating unit node: %s"  % str(e), exc_info=e )
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_UPDATE_UNIT_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))
        return result

    @d.jsonify()
    #@d.checkAuth()
    @d.trace(log, ['member'])
    def createCourseNode(self):
        """
           Create new course node
               Fields:
               name, handle, description, previewImageUrl, country, created, updated, shortname, branches
        """
	
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("create course node params: %s" % str(request.params))

        try:
            isAdmin = u.hasRoleInGroup('admin')
            #if not isAdmin:
            #    raise Exception('User must be  admin to create course node')
            
            name = request.POST.get('name', '').strip()
            shortName = request.POST.get('shortName','').strip()

            if not (name and shortName):
                raise Exception('Course name and shortName are mandatory') 

            country = request.POST.get('country','US')
            handle = request.POST.get('handle', name2Handle(name))

            description = request.POST.get('description', '')
            previewImageUrl = request.POST.get('previewImageUrl','')
            branchesString = request.POST.get('branches','')
            branches = []
            if branchesString:
                branches = [b.strip() for b in branchesString.split(',')]
                
                
            created = request.POST.get('created',str(datetime.now()))
            updated = str(datetime.now())

            kwargs = {
                'name': name,
                'handle': handle,
                'description': description,
                'country':country,
                'shortname':shortName,
                'previewImageUrl':previewImageUrl,
                'created':created,
                'updated':updated,
                'branches':branches
            }

            if isAdmin:
                kwargs['status'] = PUBLISHED
            
            kwargs['cookies'] = request.cookies 
            
            newCourseNode = api.createCourseNode(**kwargs)[0].asDict()
            log.info("Created new course node: %s" % ( newCourseNode))
            
            activityType = ActivityLog.ACTIVITY_TYPE_COURSE_NODE_CREATE
            if isAdmin:
                activityType = ActivityLog.ACTIVITY_TYPE_COURSE_NODE_PUBLISH
            alog.logActivity(activityType, newCourseNode)

            result['response']['courseNode'] = newCourseNode
            #result['response']['courseFlow'] = courseFlow
            return result

        except Exception, e:    
            log.error("Error creating new course node: %s" % str(e), exc_info=e)
            activityType = ActivityLog.ACTIVITY_TYPE_COURSE_NODE_CREATE_FAILED
            alog.logActivity(activityType, e, logFailure=True)
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE_NODE
            return ErrorCodes().asDict(c.errorCode, str(e))
            
            
            
            
            
           
