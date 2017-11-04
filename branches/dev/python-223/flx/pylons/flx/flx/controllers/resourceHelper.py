import logging
import os
from datetime import datetime
from pylons.i18n.translation import _ 

from flx.model import api
from flx.controllers.common import ArtifactCache
import flx.controllers.user as u

log = logging.getLogger(__name__)

class ResourceHelper(object):

    def isResourceAbused(self, resourceRevision):
        """
            Check if a resource is abused or blacklisted
        """
        ## Reload the object - in case it is from cache
        resourceRevision = api.getResourceRevisionByID(id=resourceRevision.id)
        return resourceRevision.isContentAbused() if resourceRevision else False

    def getPlaceholderURI(self, resourceRevision):
        """
            For an abused or blacklisted resource, return a placeholder URI.
        """
        log.info('getPlaceholderURI: rr.id[%s]' % resourceRevision.id)
        resource = resourceRevision.resource
        rTypeID = resource.resourceTypeID
        if rTypeID == 1:
            #
            #  Conents will be handled separatly.
            #
            return None

        reports = api.getAbuseReportsByResourceRevisionID(resourceRevisionID=resourceRevision.id, status='flagged')
        if len(reports) == 0:
            #
            #  EO object.
            #
            resource = api.getResourceByHandle(handle='emb_video_na.png', typeID=4, ownerID=1)
        else:
            #
            #  Image.
            #
            report = reports[0]
            reasonID = report.reasonID
            if reasonID is None:
                reasonID = 4
            if reasonID == 1:
                if rTypeID == 4:
                    resource = api.getResourceByHandle(handle='imgdisabled_copyright.jpg', typeID=4, ownerID=1)
                else:
                    resource = api.getResourceByHandle(handle='emb_video_copyright.png', typeID=4, ownerID=1)
            elif reasonID == 2:
                if rTypeID == 4:
                    resource = api.getResourceByHandle(handle='imgdisabled_inappropriate.jpg', typeID=4, ownerID=1)
                else:
                    resource = api.getResourceByHandle(handle='emb_video_inapp.png', typeID=4, ownerID=1)
            elif reasonID == 3:
                if rTypeID == 4:
                    resource = api.getResourceByHandle(handle='imgdisabled_inappropriate.jpg', typeID=4, ownerID=1)
                else:
                    resource = api.getResourceByHandle(handle='emb_video_malcontent.png', typeID=4, ownerID=1)
            else:
                if rTypeID == 4:
                    resource = api.getResourceByHandle(handle='imgdisabled_disable.jpg', typeID=4, ownerID=1)
                else:
                    resource = api.getResourceByHandle(handle='emb_video_na.png', typeID=4, ownerID=1)
        return resource

    def getResourceInfo(self, resourceRevision, resourceRevisions=None, artifactRevisions=None, suffix=None, failIfAbused=True, memberID=None, resource=None):
        """
            Get the resource info in a dictionary format
        """

        isAbused = False
        if failIfAbused and self.isResourceAbused(resourceRevision):
            #
            #  This is an abused resource, replace with placeholder.
            #
            resource = self.getPlaceholderURI(resourceRevision)
            isAbused = True

        if resource is None:
            resource = resourceRevision.resource
        artifactRevs = []
        revisions = []

        if not resourceRevisions:
            resourceRevisions = [ resourceRevision ]
        if resourceRevisions:
            for rr in resourceRevisions:
                revisions.append(rr.asDict())
                addedToLibrary = None
                labels = []
                if memberID:
                    libObj = api.getMemberLibraryResourceRevision(memberID=memberID, resourceRevisionID=rr.id)
                    if libObj:
                        addedToLibrary = str(libObj.added)
                        labelObjs = api.getLabelsForMemberLibraryObject(libraryObjectID=libObj.id)
                        for l in labelObjs:
                            labels.append({'label': l.label, 'systemLabel': l.systemLabel })

                revisions[-1]['addedToLibrary'] = addedToLibrary
                revisions[-1]['labels'] = labels

        if artifactRevisions:
            for artifactRevision in artifactRevisions:
                artifactID = artifactRevision.artifact.id
                relatedEIDs = api.getDomainEIDsForRelatedArtifactID(artifactID=artifactID)
                relatedEIDs = [ x.domainEID for x in relatedEIDs ]
                artifactRevs.append({
                    'artifactID': artifactRevision.artifactID, 
                    'artifactRevisionID': artifactRevision.id, 
                    'revision': artifactRevision.revision,
                    'artifactType': artifactRevision.artifact.type.name,
                    'domainEIDs': relatedEIDs,
                    })

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
                'artifactRevisions': artifactRevs,
                'publishTime': resourceRevision.publishTime,
                'filesize': resourceRevision.filesize,
                'isAbused': isAbused,
                'satelliteUrl': resource.satelliteUrl,
                }
        eo = resource.getEmbeddedObject()
        if eo:
            resourceDict['thumbnail'] = eo.thumbnail
            resourceDict['embeddedObject'] = eo.asDict(resourceInfo=False)
        if resource.boxDocuments:
            resourceDict['boxDocuments'] = resource.boxDocuments.asDict()
        return resourceDict

    def createResourceArtifactAssociations(self, member, resourceRevisions, artifactRevision):
        """
            Associate resource with artifact. Make sure the artifact is owned by the member.
            If resource is not owned by the member, change its ownership (by copying).
        """
        artifact = artifactRevision.artifact
        resourceRevisionIDs = {}

        u.checkOwner(member, artifact.getOwnerId(), artifact)
        for rr in resourceRevisions:
            if rr.resource.ownerID != member.id:
                raise Exception((_(u'Cannot associate resource %(rr.resourceID)d owned by %(rr.resource.ownerID)d to artifact owned by %(artifact.ownerID)d')  % {"rr.resourceID":rr.resourceID,"rr.resource.ownerID": rr.resource.ownerID,"artifact.ownerID": artifact.ownerID}).encode("utf-8"))
            resourceRevisionIDs[rr.id] = rr
        #
        #  Check and see if it's being finalized.
        #
        api.checkBookFinalizationLock(artifact.id)

        cnt = api.createArtifactHasResources(artifactRevisionID=artifactRevision.id, resourceRevisionIDs=None, 
                artifactRevision=artifactRevision, resourceRevisions=resourceRevisionIDs.values())
        log.info("Added %d associations" % cnt)
        return cnt, artifact.id

    def createResourceArtifactAssociation(self, resource, artifact, member, resourceRevision=None, artifactRevision=None):
        """
            Associate resource with artifact. Make sure the artifact is owned by the member.
            If resource is not owned by the member, change its ownership (by copying).
        """
        if not resourceRevision:
            resourceRevision = resource.revisions[0]
        if not artifactRevision:
            artifactRevision = artifact.revisions[0]

        if not artifact:
            artifact = artifactRevision.artifact
        if not resource:
            resource = resourceRevision.resource

        # Check if the resource revision already exists for the artifact
        found = False
        for rr in artifactRevision.resourceRevisions:
            if rr.id == resourceRevision.id:
                log.info("The association already exists: %d %d" % (artifactRevision.id, rr.id))
                found = True

        if not found:
            u.checkOwner(member, artifact.getOwnerId(), artifact)
            #
            #  Check and see if it's being finalized.
            #
            api.checkBookFinalizationLock(artifact.id)

            if resource.ownerID != member.id:
                # Update the resource owner to be same as the artifact owner.
                log.info("Changing resource owner to: %d" % artifact.getOwnerId())
                resourceDict = {
                        'id': resource.id,
                        'resourceRevision': resourceRevision,
                        'ownerID': member.id
                        }
                resourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member) 
                log.info("Resource copied: %s" % str(copied))
            ## Create the association
            log.info("Adding association for resource: %d to artifact: %d" % (resourceRevision.resourceID, artifact.id))
            api.createArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id,
                    artifactRevision=artifactRevision, resourceRevision=resourceRevision)
            api.invalidateArtifact(cache=ArtifactCache(), artifact=artifact, revision=artifactRevision, memberID=member.id)
        return (resourceRevision.resourceID, resourceRevision.id)

    def createPlaceholderResource(self, imageDir, memberID, type='video'):
        """
            Create or return a placeholder resource for a give type
        """
        resourceDict = {}
        if type == 'applet':
            image = 'emb_applet_na.png'
        elif type == 'audio':
            image = 'emb_audio_na.png'
        elif type == 'flash':
            image = 'emb_flash_na.png'
        elif type == 'flv':
            image = 'emb_flv_na.png'
        elif type == 'java':
            image = 'emb_java_na.png'
        elif type == 'multimedia':
            image = 'emb_multimedia_na.png'
        else:
            image = 'emb_video_na.png'

        resourceType = api.getResourceTypeByName(name='image')
        r = api.getResourceByHandle(handle='image', typeID=resourceType.id, ownerID=memberID)
        if not r:
            image_path = os.path.join(imageDir, image)
            if os.path.exists(image_path):
                resourceDict['uri'] = open(image_path, "rb")
                resourceDict['uriOnly'] = False
                resourceDict['isExternal'] = False
            resourceDict['resourceType'] = resourceType
            resourceDict['name'] = image
            resourceDict['description'] = 'Placeholder image for missing %s resource' % type
            language = api.getLanguageByName(name='English')
            resourceDict['languageID'] = language.id
            resourceDict['ownerID'] = memberID
            resourceDict['creationTime'] = datetime.now()
            resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
        else:
            resourceRevision = r.revisions[0]

        return resourceRevision

