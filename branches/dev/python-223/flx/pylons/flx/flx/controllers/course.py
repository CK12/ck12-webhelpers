import logging

from pylons import config, request, tmpl_context as c
from pylons.i18n.translation import _ 

from flx.controllers import decorators as d
from flx.model import api, exceptions as ex
from flx.lib.base import BaseController
import flx.lib.helpers as h
import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.celerytasks import course

log = logging.getLogger(__name__)

class CourseController(BaseController):
    
    @d.jsonify()
    @d.trace(log)
    def createCourse(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            title = request.POST.get('title', '')
            shortName = request.POST.get('shortName','').strip() 
            
            if not (title and shortName):
                raise Exception('Course name and shortName are mandatory')
            
            handle = request.POST.get('handle', '').strip()
            description = request.POST.get('description', '')
            kwargs = {
                'title': title,
                'shortName': shortName,
                'description': description,
                'handle': handle,
            }
            newCourseInstance = api.createCourse(**kwargs).asDict()
            log.info("Created new course instance: %s" % newCourseInstance)
            result['response']['courseInstance'] = newCourseInstance
            return result

        except Exception, e:
            log.error("Error creating new course: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_COURSE
            return ErrorCodes().asDict(c.errorCode, str(e))
 
    
    @d.jsonify()
    @d.trace(log, ['course'])
    def getCourse(self, course):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            courseInstance = api.getCourse(course)
            
            if not courseInstance:
                c.errorCode = ErrorCodes.NO_SUCH_COURSE
                return ErrorCodes().asDict(c.errorCode, 'Course: %s not found' % course)
            
            result['response']['courseInstance'] = courseInstance.asDict()
            return result
            
        except Exception, e:
            log.error("Error getting course %s" %str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_COURSE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getInfoCourses(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
        courseList = api.getInfoCourses()
            
        result['response']['courses'] = courseList
        return result 

    @d.jsonify()
    @d.trace(log)
    def deleteCourse(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            courseIdentifier = request.POST.get('shortName', '')
            if not courseIdentifier:
                courseIdentifier = request.POST.get('handle', '')
            result['response']['deletedCourse'] = api.deleteCourse(courseIdentifier).asDict()
            return result
        except Exception, e:
            log.error("Error deleting course %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_COURSE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def updateCourse(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            shortName = request.POST.get('shortName', '')
            handle = request.POST.get('handle', '').strip()
            
            if not (shortName or handle):
                raise Exception('Course handle or shortName is mandatory')
            
            title = request.POST.get('title', '')
            description = request.POST.get('description', '')
            kwargs = {
                'title': title,
                'shortName': shortName,
                'description': description,
                'handle': handle,
            }
            result['response']['updatedCourse'] = api.updateCourse(**kwargs).asDict()
            return result
            
        except Exception, e:
            log.error("Error updating the course: %s" % str(e), exc_info=e) 
            c.errorCode = ErrorCodes.CANNOT_UPDATE_COURSE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def createArtifactCourse(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            artifactID = request.POST.get('artifactID')
            domainID = request.POST.get('domainID')
            courseHandle = request.POST.get('courseHandle')

            if not (artifactID and domainID and courseHandle):
                raise Exception('artifactID, domainID and courseHandle are mandatory')
            
            kwargs = {
                'artifactID' : artifactID,
                'domainID' : domainID,
                'courseHandle' : courseHandle,    
            }
            
            result['response']['createdArtifactCourse'] = api.createArtifactCourse(**kwargs)
            return result 
                
        except Exception, e:
            log.error("Error creating related-artifact-course: %s" % str(e), exc_info=e) 
            c.errorCode = ErrorCodes.CANNOT_CREATE_ARTIFACT_COURSE
            return ErrorCodes().asDict(c.errorCode, str(e))
     
    @d.jsonify()
    @d.trace(log,['member'])
    @d.checkAuth(request)
    def loadCourseArtifact(self, member):
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
            ## No in-process task for now
            #waitFor = str(request.params.get('waitFor')).lower() == 'true'
            #log.info("Wait for task? %s" % str(waitFor))
            courseArtifactLoader = course.CourseArtifactLoaderTask()
            task = courseArtifactLoader.delay(csvFilePath=savedFilePath, googleDocumentName=googleDocumentName, googleWorksheetName=googleWorksheetName, loglevel='INFO', user=member.id, toReindex=toReindex)
            result['response']['taskID'] = task.task_id
            return result
        
        except Exception, e:
            log.error('load course tag, artifactID, eid data from CSV Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_LOAD_COURSE_ARTIFACT_DATA 
            return ErrorCodes().asDict(c.errorCode, str(e))

 
 
