from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.model import exceptions as ex
from flx.model.mongo import annotation
from pylons import request
from pylons.i18n.translation import _
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u

import logging
import json

log = logging.getLogger(__name__)

class AnnotatorController(MongoBaseController):
    """
        Annotator related APIs.
    """

    @d.jsonify()
    @d.checkAuth(request, False, False, ['annotationID'])
    @d.trace(log, ['annotationID'])
    def multiPurpose(self, annotationID):
        """
            Read, Update or Delete an annotation identified by its id
        """
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        user = u.getCurrentUser(request)
        an = annotation.Annotation(self.db).getByID(id = annotationID)
        if not an:
            return ErrorCodes().asDict(ErrorCodes.CANNOT_GET_ANNOTATION, message = "Annotation of id %s does not exist." %str(annotationID))
        if an['memberID'] != user.id and not u.isMemberAdmin(user):
            raise ex.UnauthorizedException((_(u'Not authorised to access this annotation.')).encode("utf-8"))

        if request.method == 'GET':
            try:
                return an
            
            except Exception as e:
                log.error("get annotation exception[%s]" % str(e), exc_info=e)
                return ErrorCodes().asDict(ErrorCodes.CANNOT_GET_ANNOTATION, str(e))
        
        elif request.method == 'PUT' or request.method == 'DELETE':
            try:
                kwargs = json.loads(request.body)
                if "id" in kwargs:
                    del kwargs["id"]
                if 'artifactID' not in kwargs:
                    raise Exception('artifactID not found in request body')
                kwargs['artifactID'] = int(kwargs['artifactID'])
                if 'revisionID' not in kwargs:
                    raise Exception('revisionID not found in request body')
                kwargs['revisionID'] = int(kwargs['revisionID'])
            except Exception as e:
                log.error("Insufficient arguments exception: %s" % str(e), exc_info=e)
                return ErrorCodes().asDict(ErrorCodes.INVALID_ARGUMENT, str(e))

            if request.method == 'PUT':
                try:
                    result['response'] = annotation.Annotation(self.db).update(id=annotationID, **kwargs)
                    return result
                except Exception as e:
                    log.error("Update annotation exception[%s]" % str(e), exc_info=e)
                    return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_ANNOTATION, str(e))
            
            elif request.method == 'DELETE':
                try:
                    annotation.Annotation(self.db).delete(annotationID, artifactID=kwargs['artifactID'], revisionID=kwargs['revisionID'])
                    result['response'] = "Annotation deleted successfully!"
                    return result 
                except Exception as e:
                    log.error("Delete annotation exception[%s]" % str(e), exc_info=e)
                    return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_ANNOTATION, str(e))

        else:
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTTP_REQUEST_ANNOTATION, 'Invalid HTTP request method for Annotation.')


    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def create(self, member):
        """
           Create an Annotation 
        """
        if request.method != 'POST':
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_ANNOTATION, message='Invalid HTTP request method. Use POST to create annotation.')
        try:
            member = u.getImpersonatedMember(member)
            if not request.body:
                raise Exception('Cannot save empty annotation')
            kwargs = json.loads(request.body)
            kwargs['memberID'] = member.id
            if 'artifactID' not in kwargs:
                raise Exception('artifactID not found in request body')
            kwargs['artifactID'] = int(kwargs['artifactID'])
            if 'revisionID' not in kwargs:
                raise Exception('revisionID not found in request body')
            kwargs['revisionID'] = int(kwargs['revisionID'])
            return annotation.Annotation(self.db).create(**kwargs)

        except Exception as e:
            log.error("create Annotation Exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_ANNOTATION, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def search(self, member):
        """
            Search for Annotations
        """
        if request.method != 'GET':
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTTP_REQUEST_ANNOTATION, message='Invalid HTTP request method. Use GET to search annotation.')

        member = u.getImpersonatedMember(member)
        artifactID = request.GET.get('artifactID', None)
        if not artifactID:
            return ErrorCodes().asDict(ErrorCodes.CANNOT_SEARCH_ANNOTATIONS, message="No artifactID passed.")
        artifactID = int(artifactID)
        return annotation.Annotation(self.db).search(memberID = member.id, artifactID = artifactID)

    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def getMigrated(self, member):
        member = u.getImpersonatedMember(member)
        if not u.isMemberAdmin(member):
            return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can call this API')
        artifactID = request.params.get('artifactID', None)
        email = request.params.get('email', None)
        memberID = request.params.get('memberID', None)
        find_dict = {'migrated': True}
        if artifactID:
            try:
                artifactID = int(artifactID)
                find_dict['artifactID'] = artifactID
            except ValueError:
                return {"message": "Invalid value of artifactID"}
        if email:
            find_dict['email'] = email
        if memberID:
            try:
                memberID = int(memberID)
                find_dict['memberID'] = memberID
            except ValueError:
                return {"message": "Invalid value of memberID"}
        return annotation.Annotation(self.db).getMigrated(find_dict=find_dict)

    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def getPopularAnnotations(self, member):
        if request.method != 'GET':
            return ErrorCodes().asDict(ErrorCodes.INVALID_HTTP_REQUEST_ANNOTATION, message='Invalid HTTP request method.'
                                                                                           ' Use GET')
        artifactID = request.GET.get('artifactID', None)
        if not artifactID:
            return ErrorCodes().asDict(ErrorCodes.CANNOT_SEARCH_ANNOTATIONS, message="No artifactID passed.")
        artifactID = int(artifactID)
        return annotation.Annotation(self.db).getPopularAnnotations(artifactID=artifactID)

