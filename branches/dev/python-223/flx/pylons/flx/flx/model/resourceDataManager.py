from flx.model import model, utils, api
import logging
import os
import tempfile
import shutil
from flx.model.contentDataManager import ContentDataManager
from flx.lib.fc import fcclient as fc
from flx.lib import helpers
from datetime import datetime
from sqlalchemy.sql import and_
import hashlib
from flx.model.audit_trail import AuditTrail

log = logging.getLogger(__name__)

class ResourceDataManager(object):
    
    @staticmethod
    def computeReferenceHashForResource(session, handle, resourceTypeName, memberDO):
        m = hashlib.md5()
        m.update(helpers.safe_encode(handle))
        m.update(resourceTypeName)
        m.update(helpers.safe_encode(memberDO.login) if memberDO.login else memberDO.email)
        hash = m.hexdigest()
        while ResourceDataManager.getResourceByRefHash(session, hash):
            ## Make sure the hash is unique
            m.update(memberDO.email)
            hash = m.hexdigest()
        return hash

    @staticmethod
    def getResourceTypeByName(session, name):
        return utils.queryOne(session.query(model.ResourceType).filter(model.ResourceType.name == name))

    @staticmethod
    def getResourceTypeByID(session, id):
        return utils.queryOne(session.query(model.ResourceType).filter(model.ResourceType.id == id))
    
    @staticmethod
    def getResourceByID(session, id):
        return utils.queryOne(session.query(model.Resource).filter(model.Resource.id == id))
    
    @staticmethod
    def getResourceByRefHash(session, refHash):
        return utils.queryOne(session.query(model.Resource).filter(model.Resource.refHash == refHash))
    
    @staticmethod
    def getResourceByUri(session, uri, ownerID):
        query = session.query(model.Resource)
        if len(uri) > 255:
            urimd5 = hashlib.md5(uri).hexdigest()
            query = query.filter(model.Resource.uri.in_([uri, urimd5]))
        else:
            query = query.filter(model.Resource.uri == uri)
        query = query.filter(model.Resource.ownerID == ownerID)
        return utils.queryOne(query)
    
    @staticmethod
    def getResourceByHandleOwnerAndType(session, handle, ownerID, resourceTypeID):
        query = session.query(model.Resource)
        query = query.filter(and_(model.Resource.handle == handle,
                                  model.Resource.ownerID == ownerID,
                                  model.Resource.resourceTypeID == resourceTypeID))
        return utils.queryOne(query)
    
    @staticmethod
    def getResourceRevisionByResourceIDRevision(session, resourceID, revision):
        query = session.query(model.ResourceRevision).filter(and_(model.ResourceRevision.resourceID == resourceID,
                                                                  model.ResourceRevision.revision == revision))
        return utils.queryOne(query)
    
    @staticmethod
    def getResourceRevisionByID(session, id):
        return utils.queryOne(session.query(model.ResourceRevision).filter(model.ResourceRevision.id == id))
    
    @staticmethod
    def createContentTypeResource(session, memberDO, resourceDict):
        utils._checkAttributes(['name', 'uri'], **resourceDict)
        resourceDict['ownerID'] = memberDO.id
        if 'languageID' not in resourceDict or not resourceDict['languageID']:
            languageDO = session.query(model.Language).filter(model.Language.name == 'English').one()
            resourceDict['languageID'] = languageDO.id
        if 'handle' not in resourceDict or not resourceDict['handle']:
            resourceDict['handle'] = resourceDict['uri'].replace(' ', '-')
        contentResourceTypeDO = ResourceDataManager.getResourceTypeByName(session, 'contents')
        resourceDict['resourceTypeID'] = contentResourceTypeDO.id
        if 'refHash' not in resourceDict or not resourceDict['refHash']:
            resourceDict['refHash'] = ResourceDataManager.computeReferenceHashForResource(session, resourceDict['handle'],
                                                                          contentResourceTypeDO.name, memberDO)
        resourceDO = model.Resource(**resourceDict)
        session.add(resourceDO)
        session.flush()
        log.debug("Content Type Resource added: %s" % resourceDO)
        return resourceDO
    
    
    @staticmethod
    def checkAndUpdateContentTypeResource(session, memberDO, contentTypeResourceDO, xhtml):
        newContentTypeResourceRevisionCreated, contentTypeResourceRevisionDO = False, None
        if ContentDataManager.hasContentChanged(session, memberDO, contentTypeResourceDO.uri, xhtml):
            contentRevID = ContentDataManager.updateContent(session, memberDO, contentTypeResourceDO.uri, xhtml)
            contentTypeResourceRevisionDO = model.ResourceRevision(resourceID=contentTypeResourceDO.id, revision=contentRevID)
            newContentTypeResourceRevisionCreated = True
            session.add(contentTypeResourceRevisionDO)
            session.flush()
        else:
            if len(contentTypeResourceDO.revisions) > 0:
                contentTypeResourceRevisionDO = contentTypeResourceDO.revisions[0]
        return newContentTypeResourceRevisionCreated, contentTypeResourceRevisionDO
    
    @staticmethod
    def copyResource(session, memberDO, resourceDO, resourceRevisionDO=None):
        """
            Create a resource from an existing one.
    
            resourceDO    The resource to be copied.
            memberDO     The new creator.
        """
        log.info('Copying from resource[%s, %s]' % (resourceDO.id, resourceDO.type.name))
        if not resourceRevisionDO:
            resourceRevisionDO = resourceDO.revisions[0]
        if resourceRevisionDO.resourceID != resourceDO.id:
            raise Exception((_(u"Resource revision[%s] not related to resource[%s]." % (resourceRevisionDO.id, resourceDO.id))).encode("utf-8"))
        log.debug('             revision[%s]' % resourceRevisionDO)
        now = datetime.now()
    
        resourceTypeDO = ResourceDataManager.getResourceTypeByID(session, resourceDO.resourceTypeID)
        if not resourceDO.isAttachment and resourceTypeDO.name != 'contents':
            log.info('Shared source resource[%s]' % resourceDO.id)
            return resourceDO, False
    
        resourceUri = resourceDO.uri
        r = ResourceDataManager.getResourceByHandleOwnerAndType(session, resourceDO.handle, memberDO.id, resourceDO.resourceTypeID)
        log.debug('query %s-%s-%s[%s]' % (resourceDO.handle, memberDO.id, resourceDO.resourceTypeID, r))
        revision = '1'
        if not r:
            log.info("Check resource by uri: %s owner: %d" % (resourceDO.uri, memberDO.id))
            r = ResourceDataManager.getResourceByUri(session, resourceDO.uri, memberDO.id)
            if r and not r.isExternal and r.checksum != resourceDO.checksum:
                ## Resource exists but not the same resource
                ## Make the uri unique
                log.info("Resource exists but checksum differs [%s, %s] or external resource: %s" % (r.checksum, resourceDO.checksum, r.isExternal))
                r = None
                i = 1
                while True:
                    resourceUri = '%d__%s' % (i, resourceDO.uri)
                    if not ResourceDataManager.getResourceByUri(session, resourceUri, memberDO.id):
                        break
                    i += 1
                log.info("Found unique uri: %s" % resourceUri)
    
        destResourceDO, destResourceRevisionDO = None, None
        if r is not None:
            #
            #  If found, then already exists.
            #
            new = False
            if not r.type.versionable or r.id == resourceDO.id:
                if r.resourceTypeID != resourceDO.resourceTypeID:
                    r.resourceTypeID = resourceDO.resourceTypeID
                log.info('Copy from resource[%s] done by finding [%d]' % (resourceDO.id, r.id))
                log.debug("Found resource: %s" % r)
                return r, new
    
            destResourceDO = r
            destResourceRevisionDO = destResourceDO.revisions[0]
            revision = destResourceRevisionDO.revision
        else:
            new = True
            refHash = ResourceDataManager.computeReferenceHashForResource(session, resourceDO.handle, resourceDO.type.name, memberDO)
            destResourceDO = model.Resource(resourceTypeID=resourceDO.resourceTypeID,
                                          name=resourceDO.name,
                                          handle=resourceDO.handle,
                                          description=resourceDO.description,
                                          uri=resourceUri,
                                          refHash=refHash,
                                          ownerID=memberDO.id,
                                          languageID=resourceDO.languageID,
                                          isExternal=resourceDO.isExternal,
                                          authors=resourceDO.authors,
                                          license=resourceDO.license,
                                          checksum=resourceDO.checksum,
                                          satelliteUrl=resourceDO.satelliteUrl,
                                          isAttachment=resourceDO.isAttachment,
                                          creationTime=now)
            session.add(destResourceDO)
            if resourceTypeDO.versionable:
                destResourceRevisionDO = None
            else:
                #
                #  For versionable, it will be created later.
                #
                destResourceRevisionDO = model.ResourceRevision(revision=revision,
                                                              creationTime=now,
                                                              filesize=resourceRevisionDO.filesize,
                                                              publishTime=resourceRevisionDO.publishTime)
                destResourceRevisionDO.resource = destResourceDO
                session.add(destResourceRevisionDO)
                destResourceDO.revisions.insert(0, destResourceRevisionDO)
                log.debug('_copyResource: new revision[%s]' % destResourceRevisionDO)
            log.debug('_copyResource: new resource[%s]' % destResourceDO)
    
        log.info('_copyResource: resource[%s]' % destResourceDO.id)
        if destResourceRevisionDO:
            log.info('_copyResource: revision[%s]' % destResourceRevisionDO.id)
    
        #if resourceType.name == 'contents':
        #    destResource.uri = '%d.xhtml' % destResource.id
        destResourceDO.type = resourceTypeDO
        fcclient = fc.FCClient()
        if not destResourceDO.isExternal:
            suri = resourceDO.getUri()
            uri = destResourceDO.getUri()
            log.info('_copyResource: from uri[%s]' % suri)
            if resourceTypeDO.name == 'contents':
                revNo = resourceRevisionDO.revision
                log.info('_copyResource: from revNo[%s]' % revNo)
                contents = ContentDataManager.getContent(session, resourceDO.ownerID, uri, revNo)
                if ContentDataManager.hasContentChanged(session, memberDO, uri, contents):
                    newRevision = ContentDataManager.updateContent(session, memberDO, uri, contents)
                else:
                    newRevision = revision
                log.info('_copyResource: revision[%s] newRevision[%s]' % (revision, newRevision))
                if int(revision) != int(newRevision):
                    destResourceRevisionDO = ResourceDataManager.getResourceRevisionByResourceIDRevision(session, destResourceDO.id, 
                                                                                                         newRevision)
                    if not destResourceRevisionDO:
                        #
                        #  Create a new revision.
                        #
                        newResourceRevisionDO = model.ResourceRevision(revision=newRevision,
                                                                     creationTime=now)
                        newResourceRevisionDO.resource = destResourceDO
                        session.add(newResourceRevisionDO)
                        destResourceDO.revisions.insert(0, newResourceRevisionDO)
                        session.add(destResourceDO)
                        session.flush()
            else:
                ## Non-versionable resource
                useImageSatellite, imageSatelliteServer, iamImageSatellite = helpers.getImageSatelliteOptions()
                if iamImageSatellite:
                    raise Exception((_(u"Copy resource should not be called for satellite server")).encode("utf-8"))
                elif not useImageSatellite:
                    resContents = fcclient.getResource(id=resourceDO.refHash, resourceType=resourceDO.type.name)
                    if resContents:
                        if uri.endswith("content"):
                            ## FC Repo resource - need to get the real name (so that mime-type guessing works)
                            oldObj = fcclient.getResourceObject(id=resourceDO.refHash)
                            if oldObj:
                                uri = oldObj.label
                        f = tempfile.NamedTemporaryFile(suffix=os.path.basename(uri), delete=False)
                        shutil.copyfileobj(resContents.getContent(), f)
                        f.close()
                        checksum = fcclient.saveResource(id=destResourceDO.refHash, resourceType=destResourceDO.type, isExternal=False, 
                                    creator=memberDO.id, name=uri, content=open(f.name, "rb"), isAttachment=destResourceDO.isAttachment)
                        destResourceDO.revisions[0].hash = checksum
                        os.remove(f.name)
    
        if new:
            session.flush()
            ## Copy embedded object if exists
            log.info("Getting embedded object for resource: %d" % resourceDO.id)
            eo = resourceDO.getEmbeddedObject()
            if eo:
                log.info("Existing embedded object: %d, new resource id: %d. Will copy!" % (eo.id, destResourceDO.id))
                destEODO = model.EmbeddedObject(
                        providerID=eo.providerID,
                        resourceID=destResourceDO.id,
                        type=eo.type,
                        caption=eo.caption,
                        description=eo.description,
                        uri=eo.uri,
                        code=eo.code,
                        thumbnail=eo.thumbnail,
                        blacklisted=eo.blacklisted,
                        hash=eo.hash,
                        width=eo.width,
                        height=eo.height)
                session.add(destEODO)
            else:
                log.debug("No embedded object for resource: %d" % resourceDO.id)
    
        log.info('Copied to resource[%s]' % destResourceDO.id)
        log.debug('          resource[%s]' % destResourceDO)
        return destResourceDO, new
    
    
    @staticmethod
    def associateResources(session, memberDO, artifactRevisionDO, resourceRevisionDOs, processContentTypeResource=False, toAppend=False):
        if resourceRevisionDOs is None:
            log.info('_associateResources: No change for artifact revision[%s]' % artifactRevisionDO.id)
            return
        rDict = {}
        if not toAppend:
            artifactRevisionDO.resourceRevisions = []
        #
        #  Build content resource dictionary.
        #
        resourceDict = {}
        arrr = artifactRevisionDO.resourceRevisions
        for rr in arrr:
            if not rr.resource:
                rr.resource = ResourceDataManager.getResourceByID(session, rr.resourceID)
            r = rr.resource
            if r.resourceTypeID == 1:
                resourceDict[rr.id] = r, rr
        #
        #  Process given resource revisions.
        #
        for resourceRevisionDO in resourceRevisionDOs:
            if not resourceRevisionDO.resource:
                resourceRevisionDO.resource = ResourceDataManager.getResourceByID(session, resourceRevisionDO.resourceID)
            resourceDO = resourceRevisionDO.resource
            ## Do not copy generated PDF, HTML and ePub resources since
            ## the artifact may have changed.
            if resourceDO.type.name not in model.PRINT_RESOURCE_TYPES:
                #
                #  On attachments, only copy the published ones.
                #
                if memberDO.id == resourceDO.ownerID or not resourceDO.isAttachment or resourceRevisionDO.publishTime:
                    if rDict.get(resourceDO.id, None) or (not processContentTypeResource and resourceDO.resourceTypeID == 1):
                        continue
                    rDict[resourceDO.id] = resourceDO
                    log.info('_associateResources: Copying resource[%s] type[%s]' % (resourceDO.id, resourceDO.type.name))
                    newResourceDO, new = ResourceDataManager.copyResource(session, memberDO, resourceDO, resourceRevisionDO)
                    log.info('_associateResources: Copied from resource[%s] to[%s] new[%s]' % (resourceDO.id, newResourceDO.id, new))
                    session.flush()
                    resRevisionDO = newResourceDO.revisions[0]
                    log.info('_associateResources: resource revision[%s]' % resRevisionDO.id)
                    if resRevisionDO not in artifactRevisionDO.resourceRevisions:
                        r, rr = resourceDict.get(resRevisionDO.id, (None, None))
                        if r and r.id == newResourceDO.id:
                            artifactRevisionDO.resourceRevisions.remove(rr)
                        artifactRevisionDO.resourceRevisions.append(resRevisionDO)
                        log.info('_associateResources: resource revision[added]')
        #
        #  Check for more than one content on the list.
        #
        contents = []
        arrr = artifactRevisionDO.resourceRevisions
        for rr in arrr:
            if not rr.resource:
                rr.resource = ResourceDataManager.getResourceByID(session, rr.resourceID)
            r = rr.resource
            if r.resourceTypeID == 1:
                contents.append('%d:%d' % (r.id, rr.id))
        if len(contents) > 1:
            #
            #  Log for now. Fix in the future.
            #
            auditTrailDict = {
                'auditType': 'multi_content_artifact',
                'memberID': memberDO.id,
                'artifactRevisionID': artifactRevisionDO.id,
                'artifactID': artifactRevisionDO.artifactID,
                'contentList': contents,
                'creationTime': datetime.utcnow()
            }
            try:
                AuditTrail().insertTrail(collectionName='artifacts', data=auditTrailDict)
            except Exception, e:
                log.error('_associateResources: There was an issue logging the audit trail: %s' % e)
            log.error('Multiple contents: %s' % auditTrailDict)
