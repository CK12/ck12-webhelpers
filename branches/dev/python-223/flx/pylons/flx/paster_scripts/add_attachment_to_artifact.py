import os
from flx.model import api
from flx.lib import helpers as h
from flx.controllers.common import ArtifactCache
from datetime import datetime

def run(artifactID, resourceTypeName, resourceFilePath, artifactTypeName=None, publish=True):
    artifact = api.getArtifactByID(id=artifactID)
    if not artifact:
        raise Exception("No such artifact by id [%s]" % artifactID)
    if artifactTypeName and artifact.type.name != artifactTypeName:
        raise Exception("Artifact type name mismatch [%s!=%s] for [id:%s]" % (artifact.type.name, artifactTypeName, artifact.id))

    resourceDict = {}
    path, name = os.path.split(resourceFilePath)
    resourceDict['uri'] = open(resourceFilePath, "rb")
    resourceDict['isAttachment'] = True
    resourceDict['uriOnly'] = False
    resourceDict['isExternal'] = False
    resourceDict['handle'] = name
    resourceDict['resourceType'] = api.getResourceTypeByName(name=resourceTypeName)
    resourceDict['name'] = name
    resourceDict['description'] = "%s for %s" % (resourceTypeName, artifact.type.name)
    language = api.getLanguageByName(name='English')
    resourceDict['languageID'] = language.id
    resourceDict['ownerID'] = artifact.creatorID
    resourceDict['creationTime'] = datetime.now()
    resourceDict['authors'] = "CK-12"
    resourceDict['license'] = "CC BY NC"
    resourceDict['isPublic'] = publish

    ## Check for resource
    resourceList = api.getResourcesFromArtifactRevisionID(artifactRevisionID=artifact.revisions[0].id, resourceTypeIDs=[resourceDict['resourceType'].id], attachmentsOnly=True)
    for rr, r in resourceList:
        if r.name == name and r.ownerID == artifact.creatorID:
            print "Resource [id:%s] already exists for [name:%s], [ownerID:%s]. Skipping ..." % (r.id, r.name, r.ownerID)
            return r.id, False

    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
    resourceID = resourceRevision.resource.id

    artifactRevision = artifact.revisions[0]
    artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                    resourceRevisionID=resourceRevision.id)

    api.invalidateArtifact(ArtifactCache(), artifact=artifact, revision=artifact.revisions[0], recursive=False)
    ArtifactCache().load(id=artifact.id)
    h.reindexArtifacts([artifact.id])

    print "Added resource[%s] to artifact[%s] resource name[%s], artifact name[%s]" % (resourceID, artifact.id, name, artifact.name)
    return resourceID, True
