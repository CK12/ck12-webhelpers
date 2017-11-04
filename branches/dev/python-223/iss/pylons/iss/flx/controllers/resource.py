import logging
import os
from datetime import datetime
from pylons.i18n.translation import _ 
from Crypto.Cipher import Blowfish

from pylons import config, request, tmpl_context as c
from pylons import app_globals as g

from flx.controllers import decorators as d
from flx.lib.base import BaseController
import flx.lib.helpers as h
from flx.model import api
from flx.model import exceptions as ex
from flx.model import model
from flx.model import utils

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class ResourceController(BaseController):

    #
    #  Common internal methods.
    #
    def __getResource(self, id, type=None):
        """
            Retrieves the resource from the given id or title, and its type.
            If type is None, then it will look for all artifact types.
        """
        if type == 'resource':
            type = None
        resource = api.getResourceByID(id=id)
        if not resource or (type and resource.type.name.lower() != type.lower()):
            c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            if not type:
                type = 'resource'
            raise Exception((_(u'No %(type)s identified by: %(id)s')  % {"type":type,"id": id}).encode("utf-8"))

        return resource

    def __getRevision(self, resource, revisionID):
        """
            From the given artifact, returns the revision with id
            equals revisionID.
        """
        revisions = resource.revisions
        if revisionID == 0:
            #
            # Not specified, get the latest.
            #
            return revisions[0]

        for revision in revisions:
            if revision.id == revisionID:
                return revision

        return None

    def getResourceInfo(self, resourceRevision, resourceRevisions=None, suffix=None, resource=None):
        """
            Get the resource info in a dictionary format
        """
        if resource is None:
            resource = resourceRevision.resource
        revisions = []

        if not resourceRevisions:
            resourceRevisions = [ resourceRevision ]
        if resourceRevisions:
            for rr in resourceRevisions:
                revisions.append(rr.asDict())

        resourceTypeName, handle, realm = resource.getPermaParts()
        resourceDict = {
                'id': resource.id,
                'name': resource.name,
                'type': resourceTypeName,
                'description': resource.description,
                'uri': resource.getUri(suffix=suffix, perma=True),
                'permaUri': resource.getPermaUri(suffix=suffix),
                'handle': handle,
                'realm': realm,
                'isExternal': resource.isExternal,
                'isAttachment': resource.isAttachment,
                'streamable': resource.type.streamable,
                'originalName': resource.uri,
                'ownerID': resource.ownerID,
                'authors': resource.authors,
                'license': resource.license,
                'created': resource.creationTime,
                'revision': resourceRevision.revision,
                'resourceRevisionID': resourceRevision.id,
                'revisions': revisions,
                'publishTime': resourceRevision.publishTime,
                'filesize': resourceRevision.filesize,
                'isAbused': False,
                'satelliteUrl': resource.satelliteUrl,
                }
        return resourceDict

    @d.jsonify()
    @d.trace(log, ['id', 'type', 'revisionID'])
    def getInfo(self, id, type=None, revisionID=0):
        """
            Retrieves the meta data of resource identified by id. If type is
            specified, the look up will be limited to only the given resource
            type. If revisionID is specified, it will return the revision
            identified by revisionID; otherwise, the latest revision.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resource = self.__getResource(id, type)
            if resource is None:
                if type is None:
                    type = 'resource'
                raise Exception((_(u'No %(type)s of id %(id)s')  % {"type":type,"id": id}).encode("utf-8"))
            rr = resource.revisions[0]
            if revisionID:
                for resourceRev in resource.revisions:
                    if resourceRev.id == revisionID:
                        rr = resourceRev
                        break

            if type is None:
                type = 'resource'

            ## Get all revisions
            revisions = []
            if revisionID:
                revisions.append(rr)
            else:
                revisions = resource.revisions

            result['response'][type] = self.getResourceInfo(rr, revisions)
            return result
        except Exception, e:
            log.error('get resource Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _createResource(self, session, member, returnIfExists=False, checksum=None):
        timestamp = datetime.now()
        resourceDict = {}
        language = api._getLanguageByName(session, name='English')
        resourceTypeName = request.POST.get('resourceType', None)
        if not resourceTypeName:
            raise Exception((_(u"ResourceType parameter missing.")).encode("utf-8"))
        resourceType = api._getResourceTypeByName(session, name=resourceTypeName)
        if not resourceType:
            raise Exception((_(u"Unknown resource type: %(resourceTypeName)s")  % {"resourceTypeName":resourceTypeName}).encode("utf-8"))

        resourceName = request.POST['resourceName']
        resourceDesc = None
        if request.POST.has_key('resourceDesc'):
            resourceDesc = request.POST['resourceDesc']

        resourceAuthors = request.POST.get('resourceAuthors')
        resourceLicense = request.POST.get('resourceLicense')
        isAttachment = str(request.POST.get('isAttachment')).lower() == 'true'
        isPublic = str(request.POST.get('isPublic')).lower() == 'true'
        
        isExternal = False
        uriOnly = False
        resourceUri = None
        hasPath = False
        if request.POST.has_key('resourceUri') and request.POST['resourceUri']:
            resourceUri = request.POST['resourceUri']
            uriOnly = True

        resourcePath = None
        if request.POST.has_key('resourcePath') and type(request.POST['resourcePath']) not in [unicode, str]:
            ## Uploading a file - it takes precedence
            uriOnly = False
            resourcePath = request.POST['resourcePath']
            hasPath = True

        if request.POST.has_key('resourcePathLocation'):
            ## Optionally, the request can specify a file location accessible to the server
            uriOnly = False
            resourcePath = open(h.safe_encode(request.POST['resourcePathLocation']), 'rb')
            hasPath = True

        filename = None
        if not uriOnly:
            if hasattr(resourcePath, 'filename'):
                log.info("resourcePath.filename: %s" % resourcePath.filename)
                filename = os.path.basename(resourcePath.filename)
                tempFile = h.saveUploadedToTemp(resourcePath)
                if h.isFileMalicious(tempFile):
                    raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))
            elif hasattr(resourcePath, 'name'):
                log.info("resourcePath.name: %s" % resourcePath.name)
                filename = os.path.basename(resourcePath.name)
            if isAttachment and filename:
                path, ext = os.path.splitext(filename)
                if not ext or ext.lower() not in h.ALLOWED_ATTACHMENT_EXTENSIONS:
                    raise Exception((_(u'Invalid file extension. Files of type %(ext)s are not supported as attachments.')  % {"ext":ext}).encode("utf-8"))
        handle = request.POST.get('resourceHandle')
        if not handle:
            if uriOnly:
                handle = resourceUri
            else:
                handle = filename
        if not handle:
            raise Exception((_(u'Cannot get resource handle from %(resourceUri)s or %(resourcePath)s')  % {"resourceUri":resourceUri,"resourcePath": resourcePath}).encode("utf-8"))
        handle = model.resourceName2Handle(handle)
        log.info("Using handle: %s" % handle)

        resource = api._getResourceByHandle(session, handle=handle, typeID=resourceType.id, ownerID=member.id)
        if resource:
            if returnIfExists:
                return False, resource.revisions[0]
            else:
                raise Exception((_(u'Resource with handle [%(handle)s] already exists (id: %(resource.id)d)')  % {"handle":handle,"resource.id": resource.id}).encode("utf-8"))

        if uriOnly and '://' in resourceUri:
            isExternal = True
        if checksum:
            ## Satellite
            existingResource = api._getResourceByChecksum(session, checksum=checksum, ownerID=member.id)
            if existingResource:
                if returnIfExists:
                    return False, existingResource.revisions[0]
                else:
                    raise Exception((_(u'Resource with checksum [%(checksum)s] already exists (id: %(existingResource.id)s)')  % {"checksum":checksum,"existingResource.id": existingResource.id}).encode("utf-8"))
        elif resourceUri or filename:
            ruri = resourceUri
            if filename:
                ruri = filename
            existingResource = api._getResourceByUri(session, uri=ruri, ownerID=member.id)
            if existingResource:
                if returnIfExists:
                    return False, existingResource.revisions[0]
                else:
                    raise Exception((_(u'Resource with uri [%(ruri)s] already exists (id: %(existingResource.id)d)')  % {"ruri":ruri,"existingResource.id": existingResource.id}).encode("utf-8"))

        if resourceUri or hasPath:
            resourceDict['resourceType'] = resourceType
            resourceDict['name'] = resourceName
            resourceDict['handle'] = handle
            resourceDict['description'] = resourceDesc
            resourceDict['authors'] = resourceAuthors
            resourceDict['license'] = resourceLicense
            resourceDict['languageID'] = language.id
            resourceDict['ownerID'] = member.id
            resourceDict['isExternal'] = isExternal
            resourceDict['isAttachment'] = isAttachment
            if uriOnly:
                resourceDict['uri'] = resourceUri
            else:
                resourceDict['uri'] = resourcePath
            resourceDict['creationTime'] = timestamp
            resourceDict['isPublic'] = isPublic
            resourceDict['uriOnly'] = uriOnly
            resourceRevision = api._createResource(session, resourceDict=resourceDict)
            return True, resourceRevision
        else:
            raise Exception((_(u'Neither resource uri nor resource path is specified')).encode("utf-8"))

    @d.jsonify()
    @d.trace(log)
    def createResourceSatellite(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info(str(request.POST))
        try:
            secret = request.params.get('secret')
            checksum = request.params.get('checksum')
            passcode = config.get('iss_passcode') + checksum
            if secret:
                secret = Blowfish.new(config.get('iss_secret')).decrypt(h.genURLSafeBase64Decode(secret, hasPrefix=False)).rstrip('X')
                log.info("secret: [%s]" % secret)
            if secret != passcode:
                log.error("Invalid secret - cannot authenticate request")
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, "Invalid secret - cannot authenticate request")

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = api._getMemberByLogin(session, login=g.getCK12Editor())
                new, resourceRevision = self._createResource(session, member, returnIfExists=True, checksum=checksum)
            result['response'] = self.getResourceInfo(resourceRevision)
            result['response']['uri'] = resourceRevision.resource.getUri()
            return result
        except ex.ResourceTooLargeException as rtle:
            log.error('create resource Exception[%s] ResourceTooLargeException' % str(rtle), exc_info=rtle)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_TOO_LARGE, str(rtle))
        except Exception, e:
            log.error('create resource Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['checksum'])
    def getResourceByChecksum(self, checksum):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resource = None
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = api._getMemberByLogin(session, login=g.getCK12Editor())
                resource = api._getResourceByChecksum(session, checksum=checksum, ownerID=member.id)
            if not resource:
                raise Exception((_(u'Could not get resource')).encode("utf-8"))
            result['response'] = self.getResourceInfo(resource.revisions[0])
            result['response']['uri'] = resource.getUri()
            return result
        except Exception as e:
            log.error("Error getting resource by checksum: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_RESOURCE, str(e))

    @d.jsonify()
    def deleteResource(self):
        """
            Delete a resource identified by resource id
        """
        try:
            id = request.params.get('id')
            login = g.getCK12Editor()
            tx = utils.transaction(self.getFuncName())
            with tx as session:
                member = api._getMemberByLogin(session, login=login)
                if id:
                    resource = api._getResourceByID(session, id=id)
                else:
                    ## Allow deleting for resource by checksum for satellite server
                    checksum = request.params.get('checksum')
                    if checksum:
                        resource = api._getResourceByChecksum(session, checksum=checksum, ownerID=member.id)

                if not resource:
                    raise Exception((_(u'No such resource by id: %(str(id))s')  % {"str(id)":str(id)}).encode("utf-8"))

                # The user deleting should be the owner of this resource
                if member.id != resource.ownerID:
                    raise Exception((_(u'Not owner.')).encode("utf-8"))
                api._deleteResource(session, resource=resource)

            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete resource Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.setPage(request, ['types'])
    @d.sortable(request, ['types', 'pageNum', 'pageSize'])
    @d.trace(log, ['types', 'pageNum', 'pageSize', 'sort'])
    def getResourcesInfo(self, pageNum, pageSize, sort, types=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = api.getMemberByLogin(login=g.getCK12Editor())
            memberID = member.id
            sortOn = self.getSortOrder(sort, 'Resources')
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'resource' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None
            getAll = str(request.params.get('getAll')).lower() == 'true'
            log.info("Type names: %s, ownerID: %s, getAll: %s" % (typeNames, memberID, getAll))
            resources, total = self.__getResourcesByTypes(typeNames=typeNames, ownerID=memberID,
                    getAll=getAll, sort=sortOn, pageNum=pageNum, pageSize=pageSize)
            result['response']['resources'] = resources
            result['response']['total'] = total
            result['response']['limit'] = len(resources)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception, e:
            log.error("Exception in getting resources [%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_RESOURCE, str(e))

    def __getResourcesByTypes(self, typeNames, ownerID, getAll, sort, pageNum, pageSize):
        resources = api.getResourcesByTypes(typeNames=typeNames, ownerID=ownerID, getAll=getAll, sort=sort,
                pageNum=pageNum, pageSize=pageSize)
        return [ self.getResourceInfo(resourceRevision=r.revisions[0]) for r in resources ], resources.total
