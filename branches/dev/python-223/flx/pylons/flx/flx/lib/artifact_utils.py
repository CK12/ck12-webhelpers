import logging
import urllib2, urllib, json
#import re
from datetime import datetime
from pylons import config
from pylons.i18n.translation import _
from flx.lib.helpers import safe_encode
from flx.controllers.common import ArtifactCache
from flx.model import exceptions as ex

log = logging.getLogger(__name__)

def saveArtifact(userID, title, artifactHandle, xhtml, typeName, encodedID=None, domainEIDs=[], children=[], resources=None, resourceRevisions=None, description='', bookTitle=None,
        updateExisting=False, authors=[], level='basic', contributedBy=None, tags=None, internalTags=None, artifactID=None):
    '''
        Create an artifact using the internal apis
        - assign child artifacts if children list is provided
    '''
    from flx.model import api

    member = api.getMemberByID(id=userID)
    artifactType = api.getArtifactTypeByName(typeName=typeName)
    artifact = None
    ## Check if artifact exists
    if artifactID:
        artifact = api.getArtifactByID(id=artifactID, typeName=artifactType.name, creatorID=member.id)
    else:
        artifact = api.getArtifactByHandle(handle=artifactHandle, typeID=artifactType.id, creatorID=member.id)
    if not artifact and encodedID:
        artifactByEID = api.getArtifactByEncodedID(encodedID=encodedID)
        if artifactByEID:
            artifact = artifactByEID

    termTypes = api.getBrowseTermTypesDict()
    kwargs = {}
    kwargs['creator'] = member.id
    kwargs['name'] = title
    kwargs['description'] = description
    kwargs['handle'] = artifactHandle
    kwargs['member'] = member
    if artifact:
        kwargs['artifact'] = artifact
    if typeName == 'chapter':
        kwargs['bookTitle'] = bookTitle
    browseTerms = []
    log.info("domainEIDs: %s, level: %s, contributedBy: %s, tags: %s, internalTags: %s" % (domainEIDs, level, contributedBy, tags, internalTags))
    if domainEIDs:
        domainEIDsCnt = 0
        for domainEID in domainEIDs:
            term = api.getBrowseTermByEncodedID(encodedID=domainEID)
            if term:
                browseTerms.append({'browseTermID': term.id})
                domainEIDsCnt += 1
        if domainEIDsCnt == 0 and artifact:
            kwargs['removeExistingDomains'] = True

    if level:
        term = api.getBrowseTermByIDOrName(idOrName=level, type=termTypes['level'].id)
        if term:
            browseTerms.append({'browseTermID': term.id})
    if contributedBy is not None:
        if artifact:
            kwargs['removeExistingContributor'] = True
        cbTerm = api.getBrowseTermByIDOrName(idOrName=contributedBy, type=termTypes['contributor'].id)
        if cbTerm:
            browseTerms.append({'browseTermID': cbTerm.id })
    if internalTags:
        for internalTag in internalTags:
            if internalTags:
                internalTagTerm = api.getBrowseTermByIDOrName(idOrName=internalTag, type=termTypes['internal-tag'].id)
                if internalTagTerm:
                    browseTerms.append({'browseTermID': internalTagTerm.id})
                else:
                    browseTerms.append({'name': internalTag, 'browseTermType': termTypes['internal-tag'].id})

    if browseTerms:
        kwargs['browseTerms'] = browseTerms

    tagTerms = []
    if tags:
        if artifact:
            kwargs['removeExistingTags'] = True
        for tag in tags:
            if tag:
                tagTerm = api.getTagTermByIDOrName(idOrName=tag)
                if tagTerm:
                    tagTerms.append({'tagTermID': tagTerm.id })
                else:
                    tagTerms.append({'name': tag})

    if tagTerms:
        kwargs['tagTerms'] = tagTerms

    kwargs['authors'] = []
    for each_author in authors:
        try:
            author_type,name = each_author.split(':')
            kwargs['authors'].append((name, api.getMemberRoleIDByName(name=author_type.strip().lower())))
        except Exception as e:
            continue
    language = api.getLanguageByName(name='English')
    kwargs['resources'] = []
    if xhtml:
        contentType = api.getResourceTypeByName(name='contents')
        contentDict = {
            'resourceType': contentType,
            'name': title,
            'description': description,
            'isExternal': False,
            'uriOnly': False,
            'languageID': language.id,
        }
        if artifact:
            ## Update case
            xhtmlID, uri = artifact.getContentInfo()
            contentDict['id'] = xhtmlID

        contentDict['contents'] = xhtml
        kwargs['resources'] = [ contentDict ]

    if not resources:
        resources = []
    if resourceRevisions:
        for rr in resourceRevisions:
            rDict = { 'resourceRevision': rr, 'id': rr.id, 'resourceType': rr.resource.type, 'name': rr.resource.name }
            kwargs['resources'].append(rDict)
            resources.append(rr.resource)
            if artifactType.modality:
                eo = rr.resource.getEmbeddedObject()
                if eo and eo.thumbnail:
                    coverImage = api.getResourceByUri(uri=eo.thumbnail, ownerID=member.id)
                    if not coverImage:
                        language = api.getLanguageByName(name='English')
                        coverImageType = api.getResourceTypeByName(name='cover page')
                        coverImageDict = {
                            'resourceType': coverImageType,
                            'name': eo.thumbnail,
                            'description': '',
                            'uri': eo.thumbnail,
                            'isExternal': True,
                            'uriOnly': True,
                            'languageID': language.id,
                            'ownerID': member.id,
                            'creationTime': datetime.now(),
                        }
                        coverImageRevision = api.createResource(resourceDict=coverImageDict, commit=True)
                    else:
                        coverImageRevision = coverImage.revisions[0]
                    kwargs['resources'].append( {'resourceRevision': coverImageRevision, 'id': coverImageRevision.id, 'resourceType': coverImageRevision.resource.type, 'name': coverImageRevision.resource.name})
                    resources.append(coverImageRevision.resource)

    kwargs['typeName'] = typeName
    if encodedID:
        kwargs['encodedID'] = encodedID
    if children:
        kwargs['children'] = []
        for child in children:
            if artifact:
                ## Update
                kwargs['children'].append(child)
            else:
                ca = api.getArtifactRevisionByID(id=int(child))
                if ca:
                    kwargs['children'].append({'artifact': ca})
    log.info('Resources in artifact_utils: %s' %(kwargs['resources']))
    newArtifact = False
    if not artifact:
        try:
            artifact = api.createArtifact(**kwargs)
            log.info("Created new %s with handle: %s, id: %s" % (typeName, artifactHandle, artifact.id))
            newArtifact = True
        except Exception as e:
            raise e
    elif updateExisting:
        ## Artifact exists and we are allowed to update
        if kwargs.has_key('children'):
            log.info("Updated existing %s with handle: %s, id: %s, children: %s" % (typeName, artifactHandle, artifact.id, kwargs['children']))
        else:
            kwargs['children'] = []
                
        kwargs['cache'] = ArtifactCache()
        artifact = api.updateArtifact(**kwargs)
        log.info("Updated existing %s with handle: %s, id: %s" % (typeName, artifactHandle, artifact.id))
    else:
        ## Artifact exists but we are not allowed to update - throw AlreadyExistsException
        raise ex.AlreadyExistsException((_(u'%(typeName)s[%(artifactHandle)s] from[%(member.email)s] exists already')  % {"typeName":typeName,"artifactHandle": artifactHandle,"member.email": member.email}).encode("utf-8"))

    if not artifact:
        raise Exception((_(u"Error creating new %(typeName)s artifact")  % {"typeName":typeName}).encode("utf-8"))

    if resources or xhtml:
        associateResources(xhtml, artifact, resources, member)

    return artifact.id, artifact.revisions[0].id, newArtifact

def associateResources(xhtml, artifact, resources, member):
    ## Get all img sources and associate them with resources
    #from flx.controllers.resourceHelper import ResourceHelper
    from flx.model import api
    ## Remove this processing - since resources is a list and not a dictionary, the if condition with has_key is never True.
    #if xhtml:
    #    img_re = re.compile(r'<img .*src="([^"]*)"', re.DOTALL)
    #    for img_txt in img_re.findall(xhtml):
    #        try:
    #            log.info("Looking for: %s in %s" % (img_txt, resources))
    #            if resources.has_key(img_txt):
    #                resource = api.getResourceByID(id=int(resources[img_txt]))
    #                rh = ResourceHelper()
    #                resourceID, resourceRevisionID = rh.createResourceArtifactAssociation(resource, artifact, member)
    #        except Exception, e:
    #            log.error("Error associating resources: %s" % str(e), exc_info=e)
    artifactRevision = artifact.revisions[0]
    existintResourceRevisions = []
    for rr in artifactRevision.resourceRevisions:
        existintResourceRevisions.append(rr.id)
    if resources:
        for resource in resources:
            resourceRevision = resource.revisions[0]
            if resourceRevision.id in existintResourceRevisions:
                log.info('The artifact-resource association already exists: %d %d' %(artifactRevision.id, resourceRevision.id))
                continue
            api.createArtifactHasResource(artifactRevisionID=artifactRevision.id, resourceRevisionID=resourceRevision.id,
                                          artifactRevision=artifactRevision, resourceRevision=resourceRevision)

def saveArtifactREST(flxPrefix, userID, token, title, artifactHandle, xhtml, typeName, encodedID=None, children=[], resources=None, updateExisting=False):

    log.info("flxPrefix: %s, userID: %d, title: %s, artifactHandle: %s, typeName: %s" % (flxPrefix, userID, title, artifactHandle, typeName))
    from flx.model import api
    global config

    member = api.getMemberByID(id=userID)
    artifactType = api.getArtifactTypeByName(typeName=typeName)
    artifact = None
    ## Check if artifact exists
    artifact = api.getArtifactByHandle(handle=artifactHandle, typeID=artifactType.id, creatorID=member.id)
    if not artifact and encodedID:
        artifactByEID = api.getArtifactByEncodedID(encodedID=encodedID)
        if artifactByEID:
            artifact = artifactByEID

    form = {}
    if not artifact:
        form["cover image description"] = ""
        form["cover image name"] = ""
        form["cover image uri"] = ""
        form["xhtml path"] = ""
        form["summary"] = ""
    else:
        form['description'] = safe_encode(artifact.getSummary())

    form["xhtml"] = safe_encode(xhtml)
    form["handle"] = safe_encode(artifactHandle)
    form["title"] = safe_encode(title)
    form["reindex"] = 'true'
    form["cache math"] = 'true'
    form["encodedID"] = ""

    form["type"] = typeName

    form['children'] = ','.join([ str(c) for c in children])
    body = urllib.urlencode(form)

    if not artifact:
        url = '%s/flx/create/%s'%(flxPrefix, typeName)
    elif updateExisting:
        ## Update only if updateExisting is True
        url = '%s/flx/update/%s'%(flxPrefix, str(artifact.id))
    else:
        ## Artifact exists but we are not allowed to update - throw AlreadyExistsException
        raise ex.AlreadyExistsException((_(u'%(typeName)s[%(artifactHandle)s] from[%(member.email)s] exists already')  % {"typeName":typeName,"artifactHandle": artifactHandle,"member.email": member.email}).encode("utf-8"))
    request = urllib2.Request(url)
    log.info("Url: %s" % url)

    if not config.has_key('ck12_login_cookie'):
        from flx.lib.helpers import load_pylons_config
        config = load_pylons_config()
    authCookie = config.get('ck12_login_cookie')
    request.add_header('Cookie', '%s=%s'% (authCookie, str(token)))
    request.add_data(body)
    resp = urllib2.urlopen(request).read()
    resp = json.loads(resp)
    log.info("Response from API: %s" % resp)
    if resp['responseHeader']['status'] != 0:
        raise Exception((_(u"Error saving artifact: %(resp)s")  % {"resp":resp}).encode("utf-8"))

    try:
        artifactDict = resp['response'][typeName]
    except Exception, e:
        artifactDict = resp['response']['artifact']
    artifactID = int(artifactDict['id'])

    artifact = api.getArtifactByID(id=artifactID)
    if resources:
        associateResources(xhtml, artifact, resources, member)
    return artifact.id, artifact.revisions[0].id


def getArtifact(artifactID, revisionID, type, memberID, options, result=None, draftResult=None, forUpdate=False, infoOnly=False, minimalOnly=False, descendantType=None, sequenceList=None, descRevs=None, domainID=None, preDomainIDs=None, postDomainIDs=None):
    from flx.controllers.common import ArtifactRevisionCache
    from flx.lib import helpers as h
    from flx.model import api
    from pylons import app_globals as g

    isCollaborator = False
    if draftResult:
        if draftResult.has_key('xhtml') and draftResult.get('xhtml') and not forUpdate:
            draftResult = ArtifactRevisionCache().process(revisionID, draftResult)
        elif draftResult.has_key('xhtml') and not draftResult.get('xhtml'):
            draftResult['xhtml'] = h.getLessonSkeleton()
        if not result:
            artifactDict = draftResult
        else:
            artifactDict = result['response'][type] = draftResult
        artifactDict['isDraft'] = True
        #
        #  See if this draft is locked for finalization.
        #
        if artifactID:
            lock = api.getBookFinalizationLock(artifactID)
            artifactDict['isDraftLocked'] = True if lock is not None else False
    else:
        if not result:
            artifactDict, artifact = ArtifactCache().load(revisionID=revisionID, forUpdate=forUpdate)
            if not artifact:
                raise Exception((_(u'No artifact with revisionID, %(revisionID)s' % {'revisionID': revisionID})).encode("utf-8"))
        else:
            if infoOnly and not descRevs:
                result = g.ac.getInfo(result,
                                    id=artifactID,
                                    type=type,
                                    revisionID=revisionID,
                                    domainID=domainID,
                                    minimalOnly=minimalOnly,
                                    options=options)
            else:
                if not descRevs:
                    ancestorRevisions = None
                else:
                    ancestorRevisions = descRevs[:-1]
                result = g.ac.getDetail(result,
                                        id=artifactID,
                                        type=type,
                                        revisionID=revisionID,
                                        options=options,
                                        descType=descendantType,
                                        sequenceList=sequenceList,
                                        ancestorRevisions=ancestorRevisions,
                                        domainID=domainID,
                                        preDomainID=preDomainIDs,
                                        postDomainID=postDomainIDs,
                                        infoOnly=infoOnly,
                                        minimalOnly=minimalOnly,
                                        forUpdate=forUpdate)

            if result.has_key('response') and result['response'].has_key(type):
                artifactDict = result['response'][type]
            else:
                artifactDict = None

        if artifactDict:
            artifactDict['isDraft'] = False
            if memberID and revisionID:
                artifactDict['hasDraft'] = False 
                data = api.getBookEditingAssignmentsFromARID(artifactRevisionID=revisionID)
                if not data and ( type == 'chapter' or artifactDict['artifactType'] == 'chapter' ):
                    if not artifactID:
                        artifactID = artifactDict['artifactID']
                    parents = api.getArtifactParents(artifactID, sameCreatorOnly=True)
                    if parents and len(parents) == 1:
                        a = parents[0]
                        aid = a['parentID']
                        beas = api.getBookEditingAssignments(bookID=aid)
                        if beas and len(beas) > 0:
                            bea = beas[0]
                            data = bea, artifactDict['creatorID']
                if not data:
                    log.debug('getArtifact: empty data')
                    creatorID = memberID
                else:
                    artifactEditingAssignment, creatorID = data
                    log.debug('getArtifact: artifactEditingAssignment[%s]' % artifactEditingAssignment)
                    log.debug('getArtifact: creatorID[%s]' % creatorID)
                    groupID = artifactEditingAssignment.groupID
                    mg = api.getMemberGroup(memberID, groupID=groupID)
                    log.debug('getArtifact: mg[%s]' % mg)
                    if mg:
                        isCollaborator = True

                    groupEditingData = {
                        'artifactRevisionID': revisionID,
                        'artifactID': artifactEditingAssignment.artifactID,
                        'bookID': artifactEditingAssignment.bookID,
                        'assigneeID': artifactEditingAssignment.assigneeID,
                        'groupID': artifactEditingAssignment.groupID,
                    }
                    artifactDict['groupEditing'] = groupEditingData
                if isCollaborator or creatorID == memberID:
                    artifactDraftInfo = api.getMemberArtifactDraftInfoByArtifactRevisionID(memberID=creatorID, artifactRevisionID=revisionID)                
                    if artifactDraftInfo:
                        artifactDict['hasDraft'] = True
                        artifactDict['draftTypeID'] = artifactDraftInfo[0]
                        artifactDict['draftHandle'] = artifactDraftInfo[1]
                        artifactDict['draftCreatorID'] = artifactDraftInfo[2]
                        artifactDict['draftCreatedTimeStamp'] = artifactDraftInfo[3]
                        artifactDict['draftLastUpdatedTimeStamp'] = artifactDraftInfo[4]

    if artifactDict and artifactDict.has_key('revisions') and artifactDict['revisions'] and artifactDict['revisions'][0].has_key('children'):
        childArtifactRevisionIDs = []
        children = artifactDict['revisions'][0]['children']
        for child in children:
            if isinstance(child, dict) and child.has_key('artifactRevisionID'):
                childArtifactRevisionIDs.append(child['artifactRevisionID'])

        artifactChildArtifactDraftCountsMap = {}
        artifactDraftInfosMap = {}
        creatorID = artifactDict['creatorID']
        if memberID:
            if childArtifactRevisionIDs:
                if isCollaborator:
                    mid = creatorID
                else:
                    mid = memberID
                artifactChildArtifactDraftCountsMap = api.getMemberArtifactChildArtifactDraftCounts(memberID=mid, childArtifactRevisonIDs=childArtifactRevisionIDs)
                artifactDraftInfosMap = api.getMemberArtifactDraftInfosByArtifactRevisionIDs(memberID=mid, artifactRevisionIDs=childArtifactRevisionIDs)

        for child in children:
            if isinstance(child, dict) and child.has_key('artifactRevisionID') :
                if artifactChildArtifactDraftCountsMap.has_key(child['artifactRevisionID']):
                    child['draftChildrenCount'] = artifactChildArtifactDraftCountsMap[child['artifactRevisionID']]
                else:
                    child['draftChildrenCount'] = 0

                if isCollaborator or creatorID == memberID:
                    isQualified = True
                else:
                    isQualified = api.getBookEditingDrafts(artifactRevisionID=child['artifactRevisionID'], assigneeID=memberID)
                if isQualified and artifactDraftInfosMap.has_key(child['artifactRevisionID']):
                    artifactDraftInfo = artifactDraftInfosMap[child['artifactRevisionID']]
                    child['hasDraft'] = True
                    child['draftTypeID'] = artifactDraftInfo[0]
                    child['draftHandle'] = artifactDraftInfo[1]
                    child['draftCreatorID'] = artifactDraftInfo[2]
                    child['draftCreatedTimeStamp'] = artifactDraftInfo[3]
                    child['draftLastUpdatedTimeStamp'] = artifactDraftInfo[4]
                else:
                    child['hasDraft'] = False

    log.debug('getArtifact: artifactDict[%s]' % artifactDict)
    return result if result else artifactDict
