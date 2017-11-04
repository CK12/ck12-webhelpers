from celery.task import Task
from flx.controllers.common import ArtifactCache
from flx.controllers.celerytasks.generictask import GenericTask
from flx.model import api
import logging
from pylons import config
from flx.lib.helpers import load_pylons_config

########### Config Params ################
config = load_pylons_config()

#Eflex User ID
EFLEX_USER_ID = config.get('eflex_user_id')

logger = logging.getLogger(__name__)

class UpdateeFlexUserArtifact(GenericTask):
    
    def __init__(self, **kwargs):
        GenericTask.__init__(self, **kwargs)
        
        self.user_id = 4
        if EFLEX_USER_ID:
            self.user_id = int(EFLEX_USER_ID)
        self.routing_key = 'artifact'
        
    def run (self, memberID, memberEmail,**kwargs):
        GenericTask.run(self, **kwargs)
        eflexUserRequest = api.getEflexUserRequestByEmail(email=memberEmail);
        if eflexUserRequest and eflexUserRequest.artifactID is not 0 :
            memberArtifact = api.getArtifactByID(id=eflexUserRequest.artifactID);
            if memberArtifact and memberArtifact.creatorID == self.user_id:
                kwargs = {}
                kwargs['id'] = memberArtifact.id
                kwargs['creatorID'] = memberID
                kwargs['cache'] = ArtifactCache()
                artifact = api.updateArtifactOwner(**kwargs)
                if artifact:
                    api.safeAddObjectToLibrary(objectID=memberArtifact.revisions[0].id, objectType='artifactRevision', memberID=memberID, labels=None, systemLabels=None)
                        
                    if eflexUserRequest.title.lower().strip().startswith('contribute') :
                        artifactRevisions = artifact.revisions
                        for artifactRevision in artifactRevisions:
                            childRevisionIDList = api.getArtifactRevisionChildren(revisionID=artifactRevision.id)
                            if childRevisionIDList:
                                for childRevisionID in childRevisionIDList :
                                    childRevision = api.getArtifactRevisionByID(childRevisionID)
                                    childArtifact = api.getArtifactByID(id=childRevision.artifactID)
                                    if childArtifact and childArtifact.creatorID == self.user_id:
                                        kwargs = {}
                                        kwargs['id'] = childArtifact.id
                                        kwargs['creatorID'] = memberID
                                        kwargs['cache'] = ArtifactCache()
                                        art = api.updateArtifactOwner(**kwargs)
                                        if art:
                                            api.safeAddObjectToLibrary(objectID=art.revisions[0].id, objectType='artifactRevision', memberID=memberID, labels=None, systemLabels=None)
                                            self.updateResources(artifactRevisions=art.revisions,memberID=memberID)
                    self.updateResources(artifactRevisions=artifact.revisions,memberID=memberID)
                return artifact
            
    def updateResources(self,artifactRevisions,memberID):
        member = api.getMemberByID(id=memberID)
        if artifactRevisions :
            for artifactRevision in artifactRevisions:
                resourceRevisions = artifactRevision.resourceRevisions
                for resourceRevision in resourceRevisions :
                    resource = resourceRevision.resource
                    print resourceRevision.resource.type
                    print resourceRevision.resource.type.name
                                    
                    if resourceRevision.resource.type.name in ['contents']:
                        resourceDict = {}
                        resourceDict['id'] = resource.id
                        resourceDict['resourceType'] = resource.type
                        resourceDict['resourceName'] = resource.name
                        resourceDict['resourceDesc'] = resource.description
                        resourceDict['authors'] = resource.authors
                        resourceDict['license'] = resource.license
                        resourceDict['ownerID'] = memberID
                        resourceDict['isExternal'] = resource.isExternal
                        resourceDict['isAttachment'] = resource.isAttachment
                        resourceDict['resourceRevision'] = resource.revisions[0]
                        newResourceRevision, copied, versioned = api.updateResource(resourceDict=resourceDict, member=member, commit=True)
                        api.deleteArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id)
                        kwargs = {}
                        kwargs['artifactRevisionID'] = artifactRevision.id
                        kwargs['resourceRevisionID'] = newResourceRevision.id
                        api.createArtifactHasResource(removePrintResources=False,**kwargs)
                        api.deleteAssociationsForResource(resourceRevisionID=resource.revisions[0].id)
                        api.deleteResource(resource=resource)
                    else :
                        kwargs = {}
                        kwargs['id'] = resource.id
                        kwargs['ownerID'] = memberID
                        api.updateResourceOwner(**kwargs)
