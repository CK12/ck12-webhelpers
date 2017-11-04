from flx.model import api, model, meta
import flx.lib.artifact_utils as au
import logging
import os

LOG_FILENAME = "/tmp/add_pseudodomains.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=50*1024*1024, backupCount=5)
log.addHandler(handler)
session = meta.Session()

RESOURCE_TYPES_MAP = {
        'lessonplan': 'lessonplan',
        'studyguide': 'studyguide',
        'web': 'web',
        'studyguide': 'studyguide',
        'image': 'image',
        'audio': 'audio',

        'attachment': 'attachment',
        }

def generateUniqueEncodedID(artifact):
    artifactID = str(artifact.id)
    encodedID = 'UGC.UBR' + '.' + artifactID[:3] + '.' + artifactID[3:]
    if encodedID.endswith('.'):
        encodedID = encodedID.strip('.')
    return encodedID

def run(ownerID=3, createPDomains=False):
    """
        Create pseudodomain for artifacts by type name and optionally ownerID
        run(typeName, ownerID=None)
    """

    reindexList = []
    browseTermTypeDict = api.getBrowseTermTypesDict()
    resourceTypesMap = RESOURCE_TYPES_MAP
    processedAttachments = {}
    domainTermTypeID = browseTermTypeDict['domain'].id
    pseudodomainTermTypeID = browseTermTypeDict['pseudodomain'].id
    levelBrowseTermType = api.getBrowseTermTypeByName(name='level')
    atGradeBrowseTerm = api.getBrowseTermByIDOrName(idOrName='at grade', type=levelBrowseTermType.id)
    artifactTypes = [x.name for x in api.getArtifactTypes()]
    #typeList = ['section', 'lesson']
    typeList = ['lesson']
    if not createPDomains:
        #typeList = ['lesson', 'concept']
        typeList = ['lesson']
    for type in typeList:
        pageNum = 1
        pageSize = 256
        while True:
            log.info("Fetching %d artifacts, pageNum: %d" % (pageSize, pageNum))
            artifacts = api.getArtifacts(typeName=type, pageNum=pageNum, pageSize=pageSize)
            #artifacts = [api.getArtifactByID(id=x) for x in artifactIDs]
            if not artifacts:
                break
            for a in artifacts:
                log.info('Processing artifact with id: [%d]' %(a.id))
                try:
                    if ownerID and a.creatorID != ownerID:
                        continue
                    if a.type.name not in typeList:
                        continue
                    domain = None
                    ancestorDomain = None
                    ## Try if domain exists for the artifact
                    ab = api.getArtifactHasBrowseTermsByType(artifactID=a.id, browseTermTypeID=domainTermTypeID)
                    if ab and ab[0]:
                        log.warn("Skipping %d. Has domain" % a.id)
                        domain = ab[0]
                    if not domain and createPDomains:
                        ## Try if pseudodomain exists
                        ab = api.getArtifactHasBrowseTermsByType(artifactID=a.id, browseTermTypeID=pseudodomainTermTypeID)
                        if ab and ab[0]:
                            log.warn("Skipping %d. Has pseudodomain" % a.id)
                            domain = ab[0]
                    if not domain and createPDomains:
                        if a.ancestorID:
                            ar = api.getArtifactRevisionsByIDs(idList=[a.ancestorID])
                            ancestorID = ar[0].id
                            log.info('Artifact with ID: [%d] has an AncestorID: [%d]' %(a.id, ancestorID))
                            aab = api.getArtifactHasBrowseTermsByType(artifactID=ancestorID, browseTermTypeID=domainTermTypeID)
                            if aab and aab[0]:
                                log.info('\tAncestorID: [%d] has a domain term: %s' %(ancestorID, aab[0]))
                                ancestorDomain = aab[0]
                            #else:
                            #    aab = api.getArtifactHasBrowseTermsByType(artifactID=ancestorID, browseTermTypeID=pseudodomainTermTypeID)
                            #    if aab and aab[0]:
                            #        log.info('\tAncestorID: [%d] has a pseudo-domain term: %s' %(ancestorID, aab[0]))
                            #        ancestorDomain = aab[0]

                    if ancestorDomain:
                        domain = ancestorDomain
                        log.info('Domain found without creating a new pseudo-domain term: %s' %(domain))
                        if not api.getRelatedArtifact(artifactID=a.id, domainID=ancestorDomain.browseTermID):
                            log.info('Linking artifactID: [%d] with domainID: [%d]' %(a.id, domain.browseTermID))
                            api.createRelatedArtifact(domainID=domain.browseTermID, artifactID=a.id, sequence=None)

                    ac = api.getArtifactByHandle(handle=a.handle, creatorID=a.creatorID, typeID=4)
                    if not domain:
                        if createPDomains:
                            ## Create new pseudodomain
                            pdHandle = api.createUniquePseudoDomainHandle(name=a.name)
                            uniqueHandle = pdHandle.getUniqueHandle()
                            uniqueEncodedID = generateUniqueEncodedID(a)
                            #term = a.getPerma().replace('/', '-')
                            domain = api.createBrowseTerm(name=a.name, handle=uniqueHandle, encodedID=uniqueEncodedID, browseTermType=pseudodomainTermTypeID)
                            if not domain:
                                raise Exception('Error creating new pseudodomain term: %s' %(uniqueHandle()))
                            api.createArtifactHasBrowseTerm(artifactID=a.id, browseTermID=domain.id)
                            api.createArtifactHasBrowseTerm(artifactID=ac.id, browseTermID=domain.id)
                            log.info("Associated new PseudoDomain term: [%d] handle: [%s] encodedID: [%s] with %d" % (domain.id, uniqueHandle, uniqueEncodedID, a.id))
                        else:
                            log.info("createPDomains: %s. Skipping ..." % str(createPDomains))
                            continue
                    else:
                        domain = api.getBrowseTermByID(id=domain.browseTermID)

                    if not api.getRelatedArtifact(artifactID=a.id, domainID=domain.id):
                        api.createRelatedArtifact(domainID=domain.id, artifactID=a.id, sequence=None)
                        log.info("Added RelatedArtifact row for the lesson/section: %s" % a.id)
                    if ac and not api.getRelatedArtifact(artifactID=ac.id, domainID=domain.id):
                        api.createRelatedArtifact(domainID=domain.id, artifactID=ac.id, sequence=None)
                        log.info("Added RelatedArtifact row for the concept: %s" %(ac.id))
                    reindexList.append(a.id)
                    reindexList.append(ac.id)

                    api.createArtifactHasBrowseTerm(artifactID=a.id, browseTermID=atGradeBrowseTerm.id)
                    if ac:
                        api.createArtifactHasBrowseTerm(artifactID=ac.id, browseTermID=atGradeBrowseTerm.id)

                    ## Convert attachments to modalities
                    #for rr in a.revisions[0].resourceRevisions:
                    #    if rr.resource.isAttachment:
                    #        if not processedAttachments.has_key(rr.resource.id):
                    #            ## Create an artifact modality for this attachment
                    #            if rr.resource.type.name in artifactTypes:
                    #                artifactTypeName = rr.resource.type.name
                    #            else:
                    #                artifactTypeName = 'attachment'
                    #            #artifactTypeName = resourceTypesMap[rr.resource.type.name]
                    #            artifactName = os.path.basename(rr.resource.name)
                    #            artifactName = os.path.splitext(artifactName)[0]

                    #            log.info("Upgrading %s of type %s to modality of type: %s" % (rr.resource.name, rr.resource.type.name, artifactTypeName))
                    #            artifactID, artifactRevisionID = au.saveArtifact(userID=rr.resource.ownerID,
                    #                    title=rr.resource.name,
                    #                    artifactHandle=model.title2Handle(rr.resource.name),
                    #                    xhtml=None,
                    #                    typeName=artifactTypeName,
                    #                    resourceRevisions=[rr],
                    #                    description=rr.resource.description,
                    #                    updateExisting=True)
                    #            log.info("Created new artifact %d or type %s" % (artifactID, artifactTypeName))
                    #            reindexList.append(artifactID)

                    #            api.createArtifactHasBrowseTerm(artifactID=artifactID, browseTermID=atGradeBrowseTerm.id)

                    #            artifactRevision = api.getArtifactRevisionByID(id=artifactRevisionID)
                    #            if rr.publishTime:
                    #                api.publishArtifactRevision(artifactRevision=artifactRevision, recursive=True)
                    #        else:
                    #            artifactID = processedAttachments[rr.resource.id]
                    #            log.info("Already processed this attachment: %s" % artifactID)

                    #        ## Associate the new artifact with this domain in RelatedArtifacts
                    #        if a.type.name != 'concept' and not api.getRelatedArtifact(artifactID=artifactID, domainID=domain.id, sequence=1):
                    #            api.createRelatedArtifact(domainID=domain.id, artifactID=artifactID, sequence=1)
                    #            log.info("Added related artifact row for: %s and domain: %s" % (artifactID, domain.name))

                    #        ## Remove attachment from existing artifact
                    #        #api.deleteArtifactHasResource(artifactRevisionID=a.revisions[0].id, resourceRevisionID=rr.id)
                    #        processedAttachments[rr.resource.id] = artifactID

                except Exception as e:
                    log.error("ERROR processing artifactID: %s: %s" % (a.id, str(e)), exc_info=e)
            pageNum += 1
            #break

    if reindexList:
        log.info("Reindexing %d artifacts" % len(reindexList))
        from flx.lib.helpers import reindexArtifacts
        reindexArtifacts(reindexList, user=None, recursive=True)
