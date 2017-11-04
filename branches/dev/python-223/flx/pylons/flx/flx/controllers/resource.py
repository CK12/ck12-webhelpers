import logging
import os
from urllib import unquote, quote
from datetime import datetime
from pylons.i18n.translation import _ 
import urllib, urllib2
from Crypto.Cipher import Blowfish

from pylons import config, request, tmpl_context as c
from pylons.controllers.util import abort, redirect
from pylons import app_globals as g
#from pylons.decorators.cache import beaker_cache

from flx.controllers import decorators as d
from flx.controllers.common import ArtifactCache
from flx.model import api, exceptions as ex, model
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
import flx.controllers.user as u
import hashlib

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

    #
    #  Get related APIs.
    #
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

            if revisionID:
                artifactRevisions = api.getArtifactRevisionsForResource(resourceID=resource.id, resourceRevisionID=rr.id)
            else:
                artifactRevisions = api.getArtifactRevisionsForResource(resourceID=resource.id)
            log.debug("ArtifactRevisions: %s" % artifactRevisions)
            result['response'][type] = g.resourceHelper.getResourceInfo(rr, revisions, artifactRevisions)
            return result
        except Exception, e:
            log.error('get resource Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getAbuseReasons(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        abuseReasonDict, abuseReasonNameDict = g.getAbuseReasons()
        result['response']['reasons'] = abuseReasonDict
        return result

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def createResourceForm(self):
        resourceTypes = api.getResourceTypes()
        c.resourceTypes = []
        for rt in resourceTypes:
            if not rt.versionable:
                c.resourceTypes.append(rt.name)
        c.prefix = self.prefix
        return render('/flx/resource/createForm.html')

    def _createResource(self, member, returnIfExists=False, checksum=None):
        timestamp = datetime.now()
        resourceDict = {}
        language = api.getLanguageByName(name='English')
        resourceTypeName = request.POST.get('resourceType', None)
        if not resourceTypeName:
            raise Exception((_(u"ResourceType parameter missing.")).encode("utf-8"))
        resourceType = api.getResourceTypeByName(name=resourceTypeName)
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

        resource = api.getResourceByHandle(handle=handle, typeID=resourceType.id, ownerID=member.id)
        if resource:
            if returnIfExists:
                return False, resource.revisions[0]
            else:
                raise Exception((_(u'Resource with handle [%(handle)s] already exists (id: %(resource.id)d)')  % {"handle":handle,"resource.id": resource.id}).encode("utf-8"))

        if uriOnly and '://' in resourceUri:
            isExternal = True
        if checksum:
            ## Satellite
            existingResource = api.getResourceByChecksum(checksum=checksum, ownerID=member.id)
            if existingResource:
                if returnIfExists:
                    return False, existingResource.revisions[0]
                else:
                    raise Exception((_(u'Resource with checksum [%(checksum)s] already exists (id: %(existingResource.id)s)')  % {"checksum":checksum,"existingResource.id": existingResource.id}).encode("utf-8"))
        elif resourceUri or filename:
            ruri = resourceUri
            if filename:
                ruri = filename
            existingResource = api.getResourceByUri(uri=ruri, ownerID=member.id)
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
            resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
            return True, resourceRevision
        else:
            raise Exception((_(u'Neither resource uri nor resource path is specified')).encode("utf-8"))

    @d.jsonify()
    @d.trace(log)
    def createResourceSatellite(self):
        member = api.getMemberByLogin(login=g.getCK12Editor())
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

            member = u.getImpersonatedMember(member)
            new, resourceRevision = self._createResource(member, returnIfExists=True, checksum=checksum)
            result['response'] = g.resourceHelper.getResourceInfo(resourceRevision)
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
    @d.checkAuth(request, False, False, ['member'])
    @d.trace(log, ['member'])
    def createResource(self, member):
        """
            Creates an resource of given type with either 
            attached file or a url. Following parameters 
            are expected in HTTP post.

            resourceType: Name of the type of resource
            resourceName: Name of the resource
            resourceDesc: Description of the resource
            resourceUri:  External url of the resource 
                or
            resourcePath: The actual resource file if it being uploaded
            resourceAuthors: Authors of this resource
            resourceLicense: license for this resource
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info(str(request.POST))
        rInfo = None
        try:
            member = u.getImpersonatedMember(member)
            new, resourceRevision = self._createResource(member, returnIfExists=True)
            if not new:
                rInfo = g.resourceHelper.getResourceInfo(resourceRevision)
                raise ex.DuplicateResourceException((_(u'Resource uri or handle already exists for this user: %(member.id)d')  % {"member.id":member.id}).encode("utf-8"))
            result['response'] = g.resourceHelper.getResourceInfo(resourceRevision)
            return result
        except ex.ResourceTooLargeException as rtle:
            log.error('create resource Exception[%s] ResourceTooLargeException' % str(rtle), exc_info=rtle)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_TOO_LARGE, str(rtle))
        except ex.DuplicateResourceException as dre:
            log.error("Duplication resource exception[%s]" % str(dre), exc_info=dre)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_ALREADY_EXISTS, str(dre), rInfo)
        except Exception, e:
            log.error('create resource Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e), rInfo)

    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['id', 'member'])
    def updateResourceForm(self, id, member):
        resourceTypes = api.getResourceTypes()
        c.resourceTypes = []
        for rt in resourceTypes:
            c.resourceTypes.append(rt.name)
        resource = api.getResourceByID(id=id)
        if not resource:
            raise Exception((_(u"No such resource: %(id)s")  % {"id":id}).encode("utf-8"))
        c.resourceID = resource.id
        c.resourceType = resource.type.name
        c.resourceDesc = resource.description
        c.resourceName = resource.name
        c.resourceAuthors = resource.authors
        c.resourceLicense = resource.license
        c.resourceAttachment = resource.isAttachment
        c.resourcePublic = resource.revisions[0].publishTime != None
        c.resourceHandle = resource.handle
        c.resourceOwner = resource.owner.email
        c.member = member
        if resource.isExternal:
            c.resourceUri = resource.uri
        else:
            c.resourcePath = resource.getUri()
        c.prefix = self.prefix
        return render('/flx/resource/updateForm.html')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['member'])
    @d.trace(log, ['member'])
    def updateResource(self, member):
        """
            Updates a resource of given type with either 
            attached file or a url. Following parameters 
            are expected in HTTP post.

            id:           Resource id
            resourceType: Name of the type of resource (optional)
            resourceName: Name of the resource (optional)
            resourceDesc: Description of the resource (optional)
            resourceAuthors: Authors of this resource (optional)
            resourceLicense: License of this resource (optional)
            resourceUri:  External url of the resource (optional)
                or
            resourcePath: The actual resource file if it being uploaded (optional)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info("Update resource request: %s" % str(request.POST))
        
        rInfo = None
        resourceDict = {}
        try:
            typeChanged = handleChanged = False
            member = u.getImpersonatedMember(member)
            id = request.POST['id']
            resource = api.getResourceByID(id=id)
            if not resource:
                raise Exception((_(u'Unknown resource id: %(str(id))s')  % {"str(id)":str(id)}).encode("utf-8"))

            resourceRevision = resource.revisions[0]

            if request.POST.has_key('resourceType') and request.POST['resourceType']:
                resourceType = api.getResourceTypeByName(name=request.POST['resourceType'])
                if not resourceType:
                    raise Exception((_(u"Unknown resource type: %(request.POST['resourceType'])s")  % {"request.POST['resourceType']":request.POST['resourceType']}).encode("utf-8"))
                if resourceType.id != resource.type.id:
                    typeChanged = True
            else:
                resourceType = resource.type

            if request.POST.has_key('resourceName') and request.POST['resourceName']:
                resourceName = request.POST['resourceName']
            else: 
                resourceName = resource.name

            resourceDesc = resource.description
            if request.POST.has_key('resourceDesc'):
                resourceDesc = request.POST['resourceDesc']

            resourceAuthors = resource.authors
            if request.POST.has_key('resourceAuthors'):
                resourceAuthors = request.POST.get('resourceAuthors')

            resourceLicense = resource.license
            if request.POST.has_key('resourceLicense'):
                resourceLicense = request.POST.get('resourceLicense')

            isAttachment = resource.isAttachment
            if request.POST.has_key('isAttachment'):
                isAttachment = str(request.POST.get('isAttachment')).lower() == 'true'

            isPublic = resource.revisions[0].publishTime != None
            if request.POST.has_key('isPublic'):
                isPublic = str(request.POST.get('isPublic')).lower() == 'true'

            resourceHandle = None
            if request.POST.has_key('resourceHandle'):
                resourceHandle = model.resourceName2Handle(request.POST.get('resourceHandle'))
                if resourceHandle != resource.handle:
                    handleChanged = True
            else:
                resourceHandle = resource.handle

            if typeChanged or handleChanged:
                ## Check for duplicates
                r = api.getResourceByHandle(handle=resourceHandle, typeID=resourceType.id, ownerID=member.id)
                if r:
                    rInfo = g.resourceHelper.getResourceInfo(r.revisions[0])
                    raise ex.DuplicateResourceException((_(u'Resource with handle [%(resourceHandle)s] already exists for type [%(resourceType.name)s]. (id: %(r.id)d)')  % {"resourceHandle":resourceHandle,"resourceType.name": resourceType.name,"r.id": r.id}).encode("utf-8"))

            isExternal = False
            uriOnly = False
            hasPath = False
            resourceUri = None
            if request.POST.has_key('resourceUri') and request.POST['resourceUri']:
                resourceUri = request.POST['resourceUri']
                uriOnly = True

            resourcePath = None
            if request.POST.has_key('resourcePath') and h.isUploadField(request.POST['resourcePath']):
                ## Uploading a file - it takes precedence
                uriOnly = False
                resourcePath = request.POST['resourcePath']
                hasPath = True
            elif request.POST.get('resourcePathLocation'):
                uriOnly = False
                resourcePath = open(h.safe_encode(request.POST['resourcePathLocation']), 'rb')
                hasPath = True

            if uriOnly and '://' in resourceUri:
                isExternal = True

            resourceDict['id'] = resource.id
            resourceDict['resourceType'] = resourceType
            resourceDict['resourceName'] = resourceName
            if resourceHandle:
                resourceDict['resourceHandle'] = resourceHandle
            resourceDict['resourceDesc'] = resourceDesc
            resourceDict['authors'] = resourceAuthors
            resourceDict['license'] = resourceLicense
            resourceDict['ownerID'] = member.id
            resourceDict['isExternal'] = isExternal
            resourceDict['isAttachment'] = isAttachment
            resourceDict['isPublic'] = isPublic
            resourceDict['uriOnly'] = uriOnly
            resourceDict['resourceRevision'] = resourceRevision
            if resourceUri or hasPath:
                if uriOnly:
                    resourceDict['uri'] = resourceUri
                else:
                    resourceDict['uri'] = resourcePath
                    filename = None
                    if hasattr(resourcePath, 'filename'):
                        log.info("resourcePath.filename: %s" % resourcePath.filename)
                        filename = resourcePath.filename
                        tempFile = h.saveUploadedToTemp(resourcePath)
                        if h.isFileMalicious(tempFile):
                            raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))
                    elif hasattr(resourcePath, 'name'):
                        log.info("resourcePath.name: %s" % resourcePath.name)
                        filename = resourcePath.name
                    if isAttachment and filename:
                        path, ext = os.path.splitext(filename)
                        if not ext or ext.lower() not in h.ALLOWED_ATTACHMENT_EXTENSIONS:
                            raise Exception((_(u'Invalid file extension. Files of type %(ext)s are not supported as attachments.')  % {"ext":ext}).encode("utf-8"))

            resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
            resourceRevision = api.getResourceRevisionsByIDs(ids=[resourceRevision.id])[0]
            try:
                ## Invalidate the resource cache
                perma = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
                if perma:
                    log.info("Trying to clear cache for: %s" % perma)
                    r = urllib2.urlopen(perma + '?nocache=true', timeout=10)
            except Exception, e:
                log.error("Error clearing resource cache on update: %s" % str(e), exc_info=e)
            try:
                artifactRevisions = api.getArtifactRevisionsForResource(resource.id)
                invalidatedArtifactID = []
                for artifactRevision in artifactRevisions:
                    artifactID = artifactRevision.artifactID
                    if artifactID not in invalidatedArtifactID:
                        invalidatedArtifactID.append(artifactID)
                        artifact = api.getArtifactByID(id=artifactID)
                        api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=member.id, clearRelatedArtifacts=False)
            except Exception, e:
                log.error('Artifact resource cache invalidation error %s' % str(e))
            result['response'] = g.resourceHelper.getResourceInfo(resourceRevision)
            result['response']['resourceUri'] = resourceRevision.resource.getUri(suffix='default', perma=True)
            result['response']['resourceHandle'] = resourceRevision.resource.handle
            return result
        except ex.ResourceTooLargeException as rtle:
            log.error('update resource Exception[%s] ResourceTooLargeException' % str(rtle), exc_info=rtle)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_TOO_LARGE, str(rtle))
        except ex.DuplicateResourceException as dre:
            log.error("Duplication resource exception[%s]" % str(dre), exc_info=dre)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_ALREADY_EXISTS, str(dre), rInfo)
        except Exception, e:
            log.error('update resource Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_UPDATE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['checksum'])
    def getResourceByChecksum(self, checksum):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resource = None
            member = api.getMemberByLogin(login=g.getCK12Editor())
            resource = api.getResourceByChecksum(checksum=checksum, ownerID=member.id)
            if not resource:
                raise Exception((_(u'Could not get resource')).encode("utf-8"))
            result['response'] = g.resourceHelper.getResourceInfo(resource.revisions[0])
            result['response']['uri'] = resource.getUri()
            return result
        except Exception as e:
            log.error("Error getting resource by checksum: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_RESOURCE, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def deleteResourceForm(self):
        c.prefix = self.prefix
        return render('/flx/resource/deleteForm.html')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['member'])
    @d.trace(log, ['member'])
    def deleteResource(self, member):
        """
            Delete a resource identified by resource id
        """
        try:
            resource = None
            iam_image_satellite = str(config.get('iam_image_satellite')).lower() == 'true'
            id = request.params.get('id')
            if id:
                resource = api.getResourceByID(id=id)
            elif iam_image_satellite:
                ## Allow deleting for resource by checksum for satellite server
                checksum = request.params.get('checksum')
                if checksum:
                    member = api.getMemberByLogin(login=g.getCK12Editor())
                    resource = api.getResourceByChecksum(checksum=checksum, ownerID=member.id)
            else:
                raise Exception((_(u'Resource id is missing and this is not an image satellite server')))

            if not resource:
                raise Exception((_(u'No such resource by id: %(str(id))s')  % {"str(id)":str(id)}).encode("utf-8"))
            # The user deleting should be the owner of this resource
            u.checkOwner(member, resource.ownerID, resource)
            artifactRevisions = None
            if u.isMemberAdmin(member):
                force = str(request.params.get('force')).lower() == 'true'
                if force:
                    artifactRevisions = api.getArtifactRevisionsForResource(resource.id)
                    api.deleteAssociationsForResource(resourceRevisionID=resource.revisions[0].id)
            api.deleteResource(resource=resource)
            
            if artifactRevisions:
                #invalidate resource/artifact cache 
                artifact_ids = []
                for artifactRevision in artifactRevisions:
                    artifact_ids.append(artifactRevision.artifactID)
                artifact_ids = list(set(artifact_ids))
                artifacts = api.getArtifactsByIDs(idList=artifact_ids, pageNum=1, pageSize=250)
                for artifact in artifacts:
                    api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, memberID=member.id)
            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete resource Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_DELETE_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _createAssociation(self, member):
        resourceID = request.POST['resourceID']
        resourceRevisionID = None
        if request.POST.has_key('resourceRevisionID') and request.POST['resourceRevisionID']:
            resourceRevisionID = int(request.POST['resourceRevisionID'])
        artifactID = request.POST['artifactID']
        artifactRevisionID = None
        if request.POST.has_key('artifactRevisionID') and request.POST['artifactRevisionID']:
            artifactRevisionID = int(request.POST['artifactRevisionID'])

        resource = api.getResourceByID(id=resourceID)
        if not resource:
            raise Exception((_(u'No such resource: %(str(resourceID))s')  % {"str(resourceID)":str(resourceID)}).encode("utf-8"))

        resourceRevision = None
        if resourceRevisionID:
            for rr in resource.revisions:
                if rr.id == resourceRevisionID:
                    resourceRevision = rr
                    break
        else:
            resourceRevision = resource.revisions[0]
        if not resourceRevision:
            raise Exception((_(u"No such resource revision: %(resourceRevision)s")  % {"resourceRevision":resourceRevision}).encode("utf-8"))

        artifact = api.getArtifactByID(id=artifactID)
        if not artifact:
            raise Exception((_(u'No such artifact: %(str(artifactID))s')  % {"str(artifactID)":str(artifactID)}).encode("utf-8"))

        if artifactRevisionID:
            for revision in artifact.revisions:
                if revision.id == artifactRevisionID:
                    artifactRevision = revision
                    break
        else:
            artifactRevision = artifact.revisions[0]
        #
        #  Check and see if it's being finalized.
        #
        api.checkBookFinalizationLock(artifactID)

        resourceID, resourceRevisionID = g.resourceHelper.createResourceArtifactAssociation(resource, artifact, member, resourceRevision, artifactRevision)
        api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=member.id, clearRelatedArtifacts=False)
        ## reindex
        ## [Nimish] - This needs to be called for each resource association creation 
        ##   - this API is not called from wiki import anymore. Wiki import calls the helper method
        ##     createResourceArtifactAssociation directly.
        taskId = h.reindexArtifacts([artifact.id])
        log.info("Task id for reindex: %s" % taskId)
        return resourceID, resourceRevisionID

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        """
            Create an association between the resourceID and the artifactID. 
            Optionally, a resourceRevisionID and/or artifactRevisionID can be specified.
            If any one of them are omitted, the latest revision will be selected for
            the association.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            log.info("Post: %s" % request.POST)
            resourceID, resourceRevisionID = self._createAssociation(member)

            result['response'] = {'resourceID': resourceID, 'resourceRevisionID': resourceRevisionID}
            return result
        except Exception, e:
            log.error('create artifact-resource association Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCodes = ErrorCodes.CANNOT_CREATE_RESOURCE_ASSOCIATION
            return ErrorCodes().asDict(c.errorCodes, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createAssociations(self, member):
        """
            Create an association between the resourceRevisionIDs and the given artifactRevisionID. 
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getImpersonatedMember(member)
            log.info("Post: %s" % request.params)
            artifactRevisionID = int(request.params.get('artifactRevisionID'))
            artifactRevision = api.getArtifactRevisionByID(id=artifactRevisionID)
            resourceRevisionIDs = request.params.get('resourceRevisionIDs')
            if resourceRevisionIDs:
                resourceRevisionIDs = [ int(x.strip()) for x in resourceRevisionIDs.strip().split(',') ]
                resourceRevisions = api.getResourceRevisionsByIDs(ids=resourceRevisionIDs)
            cnt, artifactID = g.resourceHelper.createResourceArtifactAssociations(member, resourceRevisions, artifactRevision)
            ## reindex
            ## [Nimish] - This needs to be called for each resource association creation 
            ##   - this API is not called from wiki import anymore. Wiki import calls the helper method
            ##     createResourceArtifactAssociation directly.
            taskId = h.reindexArtifacts([artifactID])
            log.info("Task id for reindex: %s" % taskId)
            result['response'] = {'resourceRevisionIDs': resourceRevisionIDs, 'artifactRevisionID': artifactRevisionID, 'artifactID': artifactID, 'associations': cnt}
            return result
        except Exception, e:
            log.error('create artifact-resource associations Exception[%s]' % str(e), exc_info=e)
            c.errorCodes = ErrorCodes.CANNOT_CREATE_RESOURCE_ASSOCIATION
            return ErrorCodes().asDict(c.errorCodes, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAssociationForm(self, member):
        c.prefix = self.prefix
        return render('/flx/resource/createAssociationForm.html') 

    @d.checkAuth(request, True, True)
    @d.trace(log)
    def deleteAssociationForm(self):
        c.prefix = self.prefix
        return render('/flx/resource/deleteAssociationForm.html')

    @d.jsonify()
    @d.checkAuth(request, False, False, ['member'])
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        """
            Delete association between a resourceID and an artifactID.
            Optionally, a resourceRevisionID and/or artifactRevisionID can be specified.
            If any one of them are omitted, the latest revision will be selected for
            identifying the association to delete.
        """
        try:
            member = u.getImpersonatedMember(member)
            resourceID = request.POST['resourceID']
            resourceRevisionID = None
            if request.POST.has_key('resourceRevisionID') and request.POST['resourceRevisionID']:
                resourceRevisionID = int(request.POST['resourceRevisionID'])
            artifactID = request.POST['artifactID']
            artifactRevisionID = None
            if request.POST.has_key('artifactRevisionID') and request.POST['artifactRevisionID']:
                artifactRevisionID = int(request.POST['artifactRevisionID'])

            resource = api.getResourceByID(id=resourceID)
            if not resource:
                raise Exception((_(u'No such resource: %(str(resourceID))s')  % {"str(resourceID)":str(resourceID)}).encode("utf-8"))

            if resourceRevisionID:
                # Get specific ResourceRevision if specified
                for rr in resource.revisions:
                    if rr.id == resourceRevisionID:
                        resourceRevision = rr
                        break
            else:
                # Or just select the latest revision
                resourceRevision = resource.revisions[0]

            artifact = api.getArtifactByID(id=artifactID)
            if not artifact:
                raise Exception((_(u'No such artifact: %(str(artifactID))s')  % {"str(artifactID)":str(artifactID)}).encode("utf-8"))
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(artifactID)

            log.info("%s %s" % (artifact.getOwnerId(), member.id))
            u.checkOwner(member, artifact.getOwnerId(), artifact)
            if artifactRevisionID:
                artifactRevision = None
                # Get specific ArtifactRevision if specified
                for revision in artifact.revisions:
                    if revision.id == artifactRevisionID:
                        artifactRevision = revision
                        break
                if artifactRevision is None:
                    raise Exception((_(u'Artifact: %(str(artifactID))s is not for revision: %(str(artifactRevisionID))s')  % {"str(artifactID)":str(artifactID), "str(artifactRevisionID)":str(artifactRevisionID)}).encode("utf-8"))
            else:
                # Or just select the latest revision
                artifactRevision = artifact.revisions[0]

            # Check if the resource revision already exists for the artifact
            found = False
            cnt = 0
            while cnt < len(artifactRevision.resourceRevisions):
                rr = artifactRevision.resourceRevisions[cnt]
                # Find the specified association
                if rr.id == resourceRevision.id:
                    log.info("The association exists: %d %d" % (artifactRevision.id, rr.id))
                    found = True
                    # Delete the association
                    api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id)
                    break
                cnt += 1

            if not found:
                raise Exception((_(u'No such association for resource %(resource.id)d to artifact %(artifact.id)d')  % {"resource.id":resource.id,"artifact.id": artifact.id}).encode("utf-8"))

            api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=member.id, clearRelatedArtifacts=False)

            ## reindex
            taskId = h.reindexArtifacts([artifact.id])
            log.info("Task id: %s" % taskId)

            return ErrorCodes().asDict(ErrorCodes.OK)
        except Exception, e:
            log.error('delete artifact-resource association Exception[%s]' % str(e), exc_info=e)
            if c.errorCode == ErrorCodes.OK:
                c.errorCodes = ErrorCodes.CANNOT_DELETE_RESOURCE_ASSOCIATION
            return ErrorCodes().asDict(c.errorCodes, str(e))

    def _constructPerma(self, resource, stream='default'):
        if not resource:
            raise Exception((_(u"No such resource")).encode("utf-8"))

        if g.resourceHelper.isResourceAbused(resource.revisions[0]):
            raise Exception((_(u"The resource is marked for abuse: %(resource.id)s")  % {"resource.id":resource.id}).encode("utf-8"))

        return resource.getPermaUri(suffix=stream)

    @d.jsonify()
    @d.trace(log, ['id', 'stream'])
    def constructPerma(self, id, stream='default'):
        """
            Returns the perma URL of the given artifact identifier.
        """
        c.errorCode = ErrorCodes.OK
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resource = api.getResourceByID(id=id)
            if resource is None:
                c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
                raise Exception((_(u'No resource of id %(id)s')  % {"id":id}).encode("utf-8"))

            type, handle, realm = resource.getPermaParts()
            perma = self._constructPerma(resource, stream)
            result['response']['perma'] = perma
            result['response']['realm'] = realm
            result['response']['type'] = type
            result['response']['handle'] = handle
            return result
        except Exception, e:
            log.error('get perma Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _getPerma(self, type, handle, realm=None):
        if realm and realm.endswith(':'):
            handle = '%s/%s' % (realm, handle)
            realm = None
            log.info("Added realm to handle: %s %s" % (realm, handle))
        resourceTypeDict, resourceTypeNameDict = g.getResourceTypes()
        if resourceTypeDict.has_key(type):
            typeID = resourceTypeDict[type]
        else:
            c.errorCode = ErrorCodes.UNKNOWN_RESOURCE_TYPE
            raise Exception((_(u'Unknown resource type[%(type)s]')  % {"type":type}).encode("utf-8"))

        creatorID = None
        if not realm:
            creatorID = g.getCK12EditorID()
        else:
            tmpRealm = realm
            while True:
                realm = unquote(tmpRealm)
                if realm == tmpRealm:
                    break
                tmpRealm = realm

            if not ':' in realm:
                c.errorCode = ErrorCodes.NO_SUCH_MEMBER
                raise Exception((_(u'No login info: realm[%(realm)s]')  % {"realm":realm}).encode("utf-8"))

            key, login = realm.split(':')
            if key.lower() != 'user':
                c.errorCode = ErrorCodes.UNKNOWN_REALM_TYPE
                raise Exception((_(u'Unknown realm type[%(key)s]')  % {"key":key}).encode("utf-8"))

            member = api.getMemberByLogin(login=login)
            if member is None:
                log.warn("Cannot find member with login[%s]" % login)
            else:
                creatorID = member.id

        if ':/' in handle and '://'  not in handle:
            ## Fix for apache stripping double-slash from handle urls
            handle = handle.replace(':/', '://')
        if creatorID:
            resource = api.getResourceByHandle(handle=handle,
                                                typeID=typeID,
                                                ownerID=creatorID)
        else:
            resource = api.getResourceByHandleAndType(handle=handle, typeID=typeID)

        if resource is None:
            ## If the same video is cover video for one concept and a "video" for
            ## another concept - one of the concepts will not render it correctly 
            ## due to wrong typeName in perma - Bug 7271
            if type in ['video', 'cover video']:
                resourceTypeDict, resourceTypeNameDict = g.getResourceTypes()
                if type == 'video':
                    typeID = resourceTypeDict.get('cover video')
                elif type == 'cover video':
                    typeID = resourceTypeDict.get('video')
                if typeID:
                    resource = api.getResourceByHandle(handle=handle, typeID=typeID, ownerID=creatorID)
        if resource is None:
            c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            log.error("No resource with handle[%s] type[%s] realm[%s]" % (handle, type, realm))
            raise Exception((_(u'No resource with handle[%(handle)s] type[%(type)s] realm[%(realm)s]')  % {"handle":handle,"type": type,"realm": realm}).encode("utf-8"))

        resourceRevision = resource.revisions[0]
        if g.resourceHelper.isResourceAbused(resourceRevision):
            #
            #  This is an abused resource, replace with placeholder.
            #
            r = g.resourceHelper.getPlaceholderURI(resourceRevision)
            if r:
                resource = r

        return resource

    @d.jsonify()
    @d.trace(log, ['type', 'handle', 'realm', 'stream'])
    def getPerma(self, type, handle, realm=None, stream='default'):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = u.getCurrentUser(request)
            resource = self._getPerma(type, handle, realm)
            stream = self._fixStream(stream, resource)
            ## Get all revisions
            artifactRevisions = api.getArtifactRevisionsForResource(resourceID=resource.id)
            result['response']['resource'] = g.resourceHelper.getResourceInfo(resource.revisions[0], resource.revisions, artifactRevisions, suffix=stream, memberID=member.id)
            return result
        except Exception, e:
            log.error('get resource with perma Exception[%s]' % str(e))
            if not hasattr(c, 'errorCode'):
                c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
            return ErrorCodes().asDict(c.errorCode, str(e))

    def _fixStream(self, stream, resource):
        if not stream or stream.lower() == 'default':
            stream = ''

        if resource.type.name not in ['image', 'cover page'] and not (resource.type.name in ['video', 'cover video'] and stream == 'autoplay'):
            ## For non-image resources, there are no streams
            ## For video resources, autoplay is allowed.
            stream = ''
        return stream

    @d.ck12_cache_region('monthly')
    def _renderPerma(self, hash, type, handle, realm=None, stream='default', thumbnailOnly=False):
        """
            Cached for 30 days
            This method is cached instead of the actual controller method
            because methods with redirect cannot be cached.
        """
        log.warn("Cache miss!!!")
        resource = self._getPerma(type, handle, realm)
        stream = self._fixStream(stream, resource)
        uri = resource.getUri(suffix=stream)
        isExternal = resource.isExternal
        if not resource.type.versionable:
            ## Get the embeddedObject (if it exists)
            eo = resource.getEmbeddedObject()
            if eo:
                if thumbnailOnly:
                    if eo.thumbnail:
                        return {'isRedirect': True, 'isExternal': isExternal, 'uri': eo.thumbnail}
                    else:
                        return abort(404)
                if not stream:
                    ruri = h.url(controller='embeddedObject', action='renderObject', id=eo.id)
                else:
                    ruri = h.url(controller='embeddedObject', action='renderObject', id=eo.id, mode=stream)
                return {'isRedirect': True, 'isExternal': False, 'uri': ruri}
            elif thumbnailOnly:
                return abort(404)
            ## Non-streamable
            log.info("Redirecting to: %s" % uri)
            return {'isRedirect': True, 'isExternal': isExternal, 'uri': uri}
        elif thumbnailOnly:
            return abort(404)
        return {'isRedirect': False, 'isExternal': False, 'uri': resource.getXhtml()}

    @d.trace(log, ['type', 'handle', 'realm', 'stream'])
    def renderPerma(self, type, handle, realm=None, stream='default'):
        """
            Returns the perma URL of the given artifact identifier.
        """
        hash = self._generateHash(type, handle, realm, stream)
        log.info('Hash: %s' % hash)
        thumbnailOnly = str(request.params.get('thumbnailOnly', 'false')).lower() == 'true'
        proxy = str(request.params.get('proxy', 'false')).lower() == 'true'
        retDict = {}
        try:
            retDict = self._renderPerma(hash, type, handle, realm, stream, thumbnailOnly)
        except Exception, e:
            log.error("Error rendering resource: %s" % str(e), exc_info=e)
            return abort(404)
        if not retDict.get('isRedirect'):
            return retDict['uri'] ## xhtml
        
        if retDict.get('isExternal') and proxy:
            proxyEndPoint = config.get('proxy_request_endpoint')
            rUrl = '%s%s' % (proxyEndPoint, quote(retDict['uri']))
            log.debug("External resource with proxy request - redirecting to: %s" % rUrl)
            return redirect(rUrl, 301)

        tiny = str(request.params.get('tiny', 'true')).lower() == 'true'
        if tiny and type == 'image':
            #THUMB_* are common suffix for both image and cover_page streams
            dsNames = ["THUMB_POSTCARD", "THUMB_LARGE", "THUMB_SMALL", "IMAGE", "COVER_PAGE"]
            for ds in dsNames:
                if ds in retDict['uri']:
                    retDict['uri'] = retDict['uri'].replace(ds, ds+"_TINY")
                    break
        log.debug("Redirecting to: [%s]" % retDict['uri'])
        return redirect(retDict['uri'], code=301)

    def _generateHash(self, type, handle, realm=None, stream='default'):
        m = hashlib.sha224()
        m.update(h.safe_encode(handle))
        m.update(type)
        if realm:
            m.update(h.safe_encode(realm))
        m.update(stream)
        hash = m.hexdigest()
        return hash

    @d.jsonify()
    @d.trace(log)
    def createAbuseReport(self):
        """
            Create a new abuse report. The POST data should contain:
                resourceID: Id of the resource to be reported.
                resourceRevisionID: Revision id of the resource (optional - will pick the latest revision by default)
                reason: A brief explanation about why the user thinks this resource is abused.
            NOTE: This API does not need authentication so that even anonymous users can report abuse.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resourceRevision = None
            if request.params.get('resourceID'):
                resourceID = int(request.POST.get('resourceID'))
                if not resourceID:
                    raise Exception((_(u'Invalid request - missing resource id')).encode("utf-8"))

                resource = api.getResourceByID(id=resourceID)
                if not resource:
                    log.error("No resource by id: %s" % resourceID)
                    c.errorCode = ErrorCodes.NO_SUCH_RESOURCE
                    return ErrorCodes().asDict(c.errorCode)

                resourceRevision = resource.revisions[0]
                resourceRevisionID = request.POST.get('resourceRevisionID')
                if resourceRevisionID:
                    for rr in resource.revisions:
                        if rr.id == int(resourceRevisionID):
                            resourceRevision = rr
                            break

            kwargs = {}
            reason = request.POST.get('reason')
            ## Get reasonID
            reasonID = request.params.get('reasonID')
            if not reasonID:
                reasonName = request.params.get('reasonName')
                if reasonName:
                    reasonName = reasonName.lower()
                reasons = api.getAbuseReasons()
                for r in reasons:
                    if r.name.lower() == reasonName:
                        reasonID = r.id
                        break
            if reasonID:
                kwargs['reasonID'] = reasonID
            user = u.getCurrentUser(request)

            if resourceRevision:
                kwargs['resourceRevisionID'] = resourceRevision.id
            kwargs['reason'] = reason
            kwargs['reporterID'] = user.id
            if request.POST.has_key('artifactID'):
                kwargs['artifactID'] = request.POST.get('artifactID')
            if request.POST.has_key('imageUrl'):
                kwargs['imageUrl'] = request.POST.get('imageUrl')

            if not kwargs.get('artifactID') and not kwargs.get('resourceRevisionID'):
                raise Exception("Either artifactID or resourceID must be specified.")

            userAgent = request.params.get('userAgent', request.user_agent)
            if userAgent:
                kwargs['userAgent'] = userAgent
            ar = api.createAbuseReport(**kwargs)
            if not resourceRevision:
                result['response'] = ar.asDict()
            else:
                result['response'] = ar.asDict(resourceInfo=g.resourceHelper.getResourceInfo(ar.resourceRevision, failIfAbused=False))
            if ar.artifactID:
                aDict, a = ArtifactCache().load(ar.artifactID, minimalOnly=True)
                result['response']['artifact'] = aDict
            
            return result
        except Exception, e:
            log.error('create abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_ABUSE_REPORT, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def updateAbuseReport(self, member):
        """
            Modifies a given abuse report by changing its status and adding a reviewer remark to the report.
            This API is only available to the Administrator.
                POST parameters:
                    id: ID of the report
                    status: New status of the report
                    remark: Remark by admin for the status change.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            id = int(request.POST.get('id'))
            if not id or id == 'None':
                raise Exception((_(u'Invalid request - missing abuse report id')).encode("utf-8"))

            report = api.getAbuseReportByID(id=id)
            if not report:
                log.error("No abuse report by id: %s" % id)
                return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT)

            reasonID = request.POST.get('reasonID')
            status = request.POST.get('status')
            remark = request.POST.get('remark')
            kwargs = { 'id': report.id, 'status': status, 'remark': remark, 'reviewerID': member.id, 'reasonID': reasonID, }
            if request.POST.has_key('artifactID'):
                kwargs['artifactID'] = request.POST.get('artifactID')
            if request.POST.has_key('imageUrl'):
                kwargs['imageUrl'] = request.POST.get('imageUrl')
            report = api.updateAbuseReport(**kwargs)
            if report.resourceRevision:
                result['response'] = report.asDict(resourceInfo=g.resourceHelper.getResourceInfo(report.resourceRevision, failIfAbused=False))
            else:
                result['response'] = report.asDict()
            if report.artifactID:
                aDict, a = ArtifactCache().load(report.artifactID, minimalOnly=True)
                result['response']['artifact'] = aDict
            return result
        except Exception, e:
            log.error('update abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_ABUSE_REPORT, str(e))
        
    @d.jsonify()
    @d.trace(log)
    def deleteAbuseReportForm(self):
        """
            Delete a Abuse Report based on id
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        user = u.getCurrentUser(request, anonymousOkay=True)
        try:
            id = request.params.get('id')
            if not id:
                raise Exception((_(u"Abuse Report ID must be specified.")).encode("utf-8"))
            id = int(id)

            abuseReport = api.getAbuseReportByID(id=id)
            if not abuseReport:
                raise Exception((_(u"No such Abuse Report: %(id)d")  % {"id":id}).encode("utf-8"))
            if abuseReport.artifactID:
                artifact = api.getArtifactByID(id=abuseReport.artifactID)
                u.checkOwner(user, artifact.creatorID, artifact)
            
            api.deleteAbuseReport(id=abuseReport.id)
            return result
        except Exception, e:
            log.error('Notification delete Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_DELETE_NOTIFICATION
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, ['id'])
    def getInfoAbuseReport(self, id):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            report = api.getAbuseReportByID(id=id)
            if not report:
                log.error("No abuse report by id: %s" % id)
                return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT)

            if report.resourceRevision:
                result['response'] = report.asDict(resourceInfo=g.resourceHelper.getResourceInfo(report.resourceRevision, failIfAbused=False))
            else:
                result['response'] = report.asDict()
            if report.artifactID:
                aDict, a = ArtifactCache().load(report.artifactID, minimalOnly=True)
                result['response']['artifact'] = aDict
            return result
        except Exception, e:
            log.error('get info abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT, str(e))

    @d.jsonify()
    @d.setPage(request, ['resourceRevisionID', 'status'])
    @d.trace(log, ['resourceRevisionID', 'status', 'pageNum', 'pageSize'])
    def getAbuseReportInfoForResourceRevision(self, pageNum, pageSize, resourceRevisionID, status=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            reports = api.getAbuseReportsByResourceRevisionID(resourceRevisionID=resourceRevisionID,
                    status=status, pageNum=pageNum, pageSize=pageSize)
            result['response']['reports'] = []
            result['response']['total'] = reports.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(reports)
            for report in reports:
                if report.resourceRevision:
                    result['response']['reports'].append(report.asDict(resourceInfo=g.resourceHelper.getResourceInfo(report.resourceRevision, failIfAbused=False)))
            return result
        except Exception, e:
            log.error('get info abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT, str(e))

    @d.jsonify()
    @d.setPage(request, ['artifactID', 'status'])
    @d.trace(log, ['artifactID', 'status', 'pageNum', 'pageSize'])
    def getAbuseReportInfoForArtifact(self, pageNum, pageSize, artifactID, status=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            reports = api.getAbuseReportsByArtifactID(artifactID=artifactID,
                    status=status, pageNum=pageNum, pageSize=pageSize)
            result['response']['reports'] = []
            result['response']['total'] = reports.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(reports)
            for report in reports:
                if report.resourceRevision:
                    result['response']['reports'].append(report.asDict(resourceInfo=g.resourceHelper.getResourceInfo(report.resourceRevision, failIfAbused=False)))
                else:
                    result['response']['reports'].append(report.asDict())
                if report.artifactID:
                    aDict, a = ArtifactCache().load(report.artifactID, minimalOnly=True)
                    result['response']['reports'][-1]['artifact'] = aDict

            return result
        except Exception, e:
            log.error('get info abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT, str(e))

    @d.jsonify()
    @d.checkAuth(request)
    @d.sortable(request, ['member'])
    @d.filterable(request, ['sort', 'member'], noformat=True)
    @d.setPage(request, ['member', 'sort', 'fq'])
    @d.trace(log, ['member', 'sort', 'fq', 'pageNum', 'pageSize'])
    def listAbuseReports(self, member, fq, pageNum, pageSize, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            reports = api.getAbuseReports(filters=fq, sort=sort, pageNum=pageNum, pageSize=pageSize)
            result['response']['total'] = reports.getTotal()
            result['response']['offset'] = (pageNum-1)*pageSize
            result['response']['limit'] = len(reports)
            result['response']['reports'] = []
            for report in reports:
                if report.resourceRevision:
                    result['response']['reports'].append(report.asDict(resourceInfo=g.resourceHelper.getResourceInfo(report.resourceRevision, failIfAbused=False)))
                else:
                    result['response']['reports'].append(report.asDict())
                if report.artifactID:
                    aDict, a = ArtifactCache().load(report.artifactID, minimalOnly=True)
                    result['response']['reports'][-1]['artifact'] = aDict
            return result
        except Exception, e:
            log.error('get list abuse report Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_ABUSE_REPORT, str(e))


    @d.trace(log)
    def createAbuseReportForm(self):
        member = u.getCurrentUser(request)
        c.reporterID = member.id
        c.reporterLogin = member.login
        c.prefix = self.prefix
        return render('/flx/resource/createAbuseReport.html')    
    
    @d.checkAuth(request, True, True, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateAbuseReportForm(self, id, member):
        if not u.isMemberAdmin(member):
            c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode), datetime.now())

        abuseReasonDict, abuseReasonNameDict = g.getAbuseReasons()
        c.reasons = abuseReasonNameDict
        c.reasonKeys = sorted(c.reasons.keys())
        c.reportID = id
        report = api.getAbuseReportByID(id=int(id))
        c.reason = report.reason
        c.reporterID = report.reporter.id
        c.reporterLogin = report.reporter.login
        c.resourceRevisionID = report.resourceRevisionID
        c.resourceID = report.resourceRevision.resourceID
        c.created = str(report.created)
        c.status = report.status
        c.allStatuses = report.statuses
        c.remark = report.remark
        c.prefix = self.prefix
        return render('/flx/resource/updateAbuseReport.html')

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAttachmentForm(self, member):
        c.owner = member
        c.prefix = self.prefix
        return render('/flx/resource/createAttachmentForm.html')

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAttachment(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        rInfo = None
        try:
            member = u.getImpersonatedMember(member)
            perma = request.POST.get('artifactPerma')
            if not perma:
                raise Exception((_(u"Must specify perma url for artifact")).encode("utf-8"))
            perma = perma.strip('/')
            parts = perma.split('/')
            type = handle = realm = None
            if len(parts) >= 2:
                type = parts[0]
                handle = urllib.unquote(parts[1])
            if len(parts) >= 3:
                realm = urllib.unquote(parts[2])

            log.info("Getting artifact by perma: %s, %s, %s" % (type, handle, realm))
            ar = g.ac.getArtifactByPerma(type, handle, realm)
            u.checkOwner(member, ar.creatorID, ar)
            new, resourceRevision = self._createResource(member, returnIfExists=True)
            if not new:
                rInfo = g.resourceHelper.getResourceInfo(resourceRevision)
                raise ex.DuplicateResourceException((_(u'Resource uri or handle already exists for this user: %(member.id)d')  % {"member.id":member.id}).encode("utf-8"))

            resourceID, resourceRevisionID = g.resourceHelper.createResourceArtifactAssociation(resourceRevision.resource, ar, member, resourceRevision)

            result['response']['resourceID'] = resourceID
            result['response']['resourceRevisionID'] = resourceRevisionID
            result['response']['artifactID'] = ar.id
            result['response']['artifactRevisionID'] = ar.artifactRevisionID
            return result
        except ex.DuplicateResourceException as dre:
            log.error('Create attachment exception[%s] DuplicateResourceException' % str(dre), exc_info=dre)
            return ErrorCodes().asDict(ErrorCodes.RESOURCE_ALREADY_EXISTS, str(dre), rInfo)
        except Exception, e:
            log.error('Create Attachment Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_RESOURCE, str(e), rInfo)

    @d.jsonify()
    @d.checkAuth(request, True, True, ['type'])
    @d.trace(log, ['member', 'type'])
    def createPlaceholderResource(self, member, type='video'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            imageDir = os.path.join(config.get('flx_home'), 'flx', 'public', 'media', 'images', 'placeholders')
            resourceRevision = g.resourceHelper.createPlaceholderResource(imageDir, memberID=member.id, type=type)
            result['response'] = g.resourceHelper.getResourceInfo(resourceRevision)
            return result
        except Exception, e:
            log.error('Error getting placeholder resource: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_RESOURCE, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createCustomCoverForm(self, member):
        c.owner = member
        c.prefix = self.prefix
        return render('/flx/resource/createCustomCoverForm.html')

    def _createCoverImageResource(self, cover_image_path, userID):
        resourceDict = {}
        path, name = os.path.split(cover_image_path)
        resourceDict['uri'] = open(cover_image_path, "rb")
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
        resourceDict['name'] = name
        resourceDict['description'] = None
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = userID
        resourceDict['creationTime'] = datetime.now()
        resourceRevision = api.createResource(resourceDict=resourceDict,
                                              commit=True)
        return resourceRevision

    def _associateCoverImage(self, artifact, resourceRevision, memberID=None):
        artifactRevision = artifact.revisions[0]
        artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                      resourceRevisionID=resourceRevision.id)
        api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=memberID, clearRelatedArtifacts=False)
        return artifactRevisionHasResource

    def _createAssociateCoverImage(self, artifact, cover_image_path, memberID=None):
        resourceRevision = self._createCoverImageResource(cover_image_path)
        self._associateCoverImage(artifact, resourceRevision, memberID=memberID)

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createCustomCover(self, member):
        from tempfile import NamedTemporaryFile
        from PIL import Image
        from shutil import move, copyfileobj
        from datetime import datetime
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        memberID = member.id
        try:
            title = request.POST.get('bookTitle')
            if not title:
                raise Exception((_(u"Must specify a Book title to create custom cover")).encode("utf-8"))

            if request.POST.has_key('coverImageUri') and request.POST['coverImageUri']:
                coverImageUri = request.POST['coverImageUri']
                uriOnly = True

            coverImagePath = None
            if request.POST.has_key('coverImagePath') and type(request.POST['coverImagePath']) not in [unicode, str]:
                ## Uploading a file - it takes precedence
                uriOnly = False
                coverImagePath = request.POST['coverImagePath']
                hasPath = True

            useOriginal = request.POST.get('useOriginal', "false").lower()
            if useOriginal == "true":
                useOriginal = True
            else:
                useOriginal = False

            hasPerma = False
            perma = request.POST.get('bookPerma')
            if perma:
                perma = perma.strip('/')
                parts = perma.split('/')
                artifactType = handle = realm = None
                if len(parts) >= 2:
                    artifactType = parts[0]
                    handle = urllib.unquote(parts[1])
                if len(parts) >= 3:
                    realm = urllib.unquote(parts[2])
                log.info("Getting artifact by perma: %s, %s, %s" % (artifactType, handle, realm))
                ar = g.ac.getArtifactByPerma(artifactType, handle, realm)
                title = model.stripChapterName(ar.name)
                hasPerma = True
                artifact = ar.artifact
            artifactID = request.POST.get('bookArtifactID')
            if artifactID:
                ar = g.ac.getArtifact(artifactID)
                if ar:
                    hasPerma = True
                    artifact = ar
                    title = artifact.name

            customCoverWorkdir = '/tmp/custom_cover_workdir/'
            if not os.path.exists(customCoverWorkdir):
                os.mkdir(customCoverWorkdir)
            tempfd = NamedTemporaryFile()
            tempFile = customCoverWorkdir + '/' + os.path.basename(tempfd.name)
            tempfd.close()
            if uriOnly:
                tempFile = tempFile + '.' + coverImageUri.split('.')[-1]
                h.urlretrieve(coverImageUri, tempFile)
            elif hasPath:
                tempFilefd = open(tempFile, 'w')
                copyfileobj(coverImagePath.file, tempFilefd)
                tempFilefd.close()
                coverImagePath.file.close()
            else:
                raise Exception((_(u'Must upload an image or specify the URL of an image')).encode("utf-8"))
            if h.isFileMalicious(tempFile):
                raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))
            image_obj = Image.open(tempFile)
            imgType = image_obj.format.lower()
            newTempFile = tempFile + '.' + imgType
            move(tempFile, newTempFile)

            if useOriginal:
                outputCoverImage = newTempFile
            else:
                timestamp = datetime.now().strftime("%Y%m%d%s%f")
                outputCoverImage = customCoverWorkdir + 'custom-' + h.safe_encode(title).replace(' ', '_') + '-%s' %(timestamp) + '.jpg'
                outputCoverImage = h.createCustomCoverImage('/opt/2.0/flx/pylons/flx/data/images/CK12_CoverImage_Template.jpg',
                                         newTempFile, title, outputCoverImage)
            resourceRevision = self._createCoverImageResource(outputCoverImage, userID=memberID)
            if hasPerma:
                self._associateCoverImage(artifact, resourceRevision, memberID=memberID)
            result['response']['customCoverImageUri'] = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
            result['response']['resourceRevision'] = resourceRevision.asDict()
            return result
        except Exception, e:
            log.error('Exception in custom cover image creation[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_RESOURCE, str(e))

    @d.jsonify()
    @d.setPage(request, ['types'])
    @d.sortable(request, ['types', 'pageNum', 'pageSize'])
    @d.trace(log, ['types', 'pageNum', 'pageSize', 'sort'])
    def getResourcesInfo(self, pageNum, pageSize, sort, types=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            member = memberID = None
            publishedOnly = str(request.params.get('publishedOnly')).lower() == 'true'
            if not publishedOnly:
                member = u.getCurrentUser(request, anonymousOkay=True)
                member = u.getImpersonatedMember(member)
                memberID = member.id
            sortOn = self.getSortOrder(sort, 'Resources')
            typeNames = None
            if types:
                typeNames = [ x.strip() for x in types.lower().split(',') ]
                if typeNames and 'resource' in typeNames:
                    ## If artifact is specified, include all types
                    typeNames = None
            getAll = str(request.params.get('getAll')).lower() == 'true'
            if not member or not u.isMemberAdmin(member):
                getAll = False
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

    @d.ck12_cache_region('daily')
    def __getResourcesByTypes(self, typeNames, ownerID, getAll, sort, pageNum, pageSize):
        resources = api.getResourcesByTypes(typeNames=typeNames, ownerID=ownerID, getAll=getAll, sort=sort,
                pageNum=pageNum, pageSize=pageSize)
        return [ g.resourceHelper.getResourceInfo(resourceRevision=r.revisions[0]) for r in resources ], resources.total

