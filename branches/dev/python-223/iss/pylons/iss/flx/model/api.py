"""
    The APIs for the model. An API method cannot call other API methods. methods 
"""

from datetime import datetime
from flx.model.utils import _transactional, _checkAttributes, _queryOne
from flx.lib import helpers as h
from flx.lib.fc import fcclient as fc
from flx.model import exceptions as ex, meta, model, page as p
from pylons import config
from pylons.i18n.translation import _
from sqlalchemy import event, exc as sexc
from sqlalchemy.pool import Pool
from sqlalchemy.sql import or_, not_
from sqlalchemy.sql.expression import desc, asc
import hashlib
import logging
import os
import threading
import urllib2

log = logging.getLogger(__name__)

## A global thread-local object to hold event ids for processing
t = threading.local()
t.events = []
t.notifications = []
t.reindexList = []

#config
global config
if not config.get('flx_home'):
    config = h.load_pylons_config()

@event.listens_for(Pool, "checkout")
def ping_connection(dbapi_connection, connection_record, connection_proxy):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1")
        #log.debug("Connection is live ... %s" % (connection_proxy._pool.status()))
    except:
        # optional - dispose the whole pool
        # instead of invalidating one at a time
        # connection_proxy._pool.dispose()

        # raise DisconnectionError - pool will try
        # connecting again up to three times before raising.
        log.warn("DisconnectionError: %s" % dbapi_connection) 
        raise sexc.DisconnectionError()
    finally:
        if cursor:
            cursor.close()

class ModelError(Exception):
    pass

def connect(url):
    if meta.engine is None:
        from sqlalchemy import create_engine, orm

        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              expire_on_commit=False,
                              bind=meta.engine)
        meta.Session = orm.scoped_session(sm)
    return meta.engine.connect()

sqlCachedClasses = set([
model.ResourceType,
])

def _getInstance(session, instance, instanceType, lockMode=None):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the instance in any case.
    """
    if isinstance(instance, instanceType):
        return instance
    #
    #  It should be an identifier.
    #
    global sqlCacheClasses

    query = session.query(instanceType)
    if instanceType in sqlCachedClasses:
        query = query.prefix_with('SQL_CACHE')
    query = query.filter_by(id=instance)
    return _queryOne(query, lockMode=lockMode)

def _getInstanceID(instance, instanceType):
    """
        Allow the instance to be the instance object or just its identifier.

        Return the identifier in any case.
    """
    if isinstance(instance, instanceType):
        return instance.id
    #
    #  It should be an identifier already.
    #
    return instance

def _getUnique(session, what, term, value, func=None):
    """
        Return the instance of type `what` with `term` = `value`.
    """
    global sqlCacheClasses

    query = session.query(what)
    if what in sqlCachedClasses:
        query = query.prefix_with('SQL_CACHE')
    if func is not None and func.__call__:
        query = func(query, 'all')
    kwargs = { term: value }
    return _queryOne(query.filter_by(**kwargs))

@_transactional(readOnly=True)
def getLanguageByName(session, name):                                                                                                                                                                          
    return _getLanguageByName(session, name)

def _getLanguageByName(session, name):
    return _getUnique(session, model.Language, 'name', name)

@_transactional(readOnly=True)
def getMemberByLogin(session, login):                                                                                                                                                                         
    return _getMemberByLogin(session, login)

def _getMemberByLogin(session, login):                                                                                                                                                                         
    """
        Return the Member that matches the given login.
    """
    if login:
        login = login.strip()
    if not login:
        return None

    #log.debug('_getMemberByLogin login[%s]' % login)
    ## Bug #52566 - Do not make an OR query - since different accounts can exist for login and login.lower()
    #query = query.filter(or_(model.Member.login == login, model.Member.login == login.lower()))
    member = _queryOne(session.query(model.Member).filter(model.Member.login == login))
    if not member and login != login.lower():
        member = _queryOne(session.query(model.Member).filter(model.Member.login == login.lower()))
    if member:
        member = member.fix()
    else:
        member = _getMemberByDefaultLogin(session, login)
    return member

def _getMemberByDefaultLogin(session, defaultLogin):
    """
        Return the Member that matches the given login.
    """
    if not defaultLogin:
        return None

    log.debug('getMemberByDefaultLogin defaultLogin[%s]' % defaultLogin)
    query = session.query(model.Member)
    query = query.filter_by(defaultLogin=defaultLogin.strip())
    member = _queryOne(query)
    if member:
        member = member.fix()
    return member

@_transactional(readOnly=True)
def getResourceByID(session, id):                                                                                                                                                                              
    return _getResourceByID(session, id)

def _getResourceByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Resource, 'id', id)
    except ValueError:
        return None

def _getResourceByHandle(session, handle, typeID, ownerID):                                                                                                                                                    
    """
        Return the Resouce that matches the given perma URL information.
    """
    query = session.query(model.Resource)
    query = query.filter_by(handle=handle)
    query = query.filter_by(resourceTypeID=typeID)
    query = query.filter_by(ownerID=ownerID)
    resource = _queryOne(query)
    return resource

@_transactional(readOnly=True)
def getResourceByUri(session, uri, ownerID):                                                                                                                                                                   
    return _getResourceByUri(session, uri, ownerID)

def _getResourceByUri(session, uri, ownerID):
    query = session.query(model.Resource)
    if len(uri) > 255:
        urimd5 = hashlib.md5(uri).hexdigest()
        query = query.filter(model.Resource.uri.in_([uri, urimd5]))
    else:
        query = query.filter(model.Resource.uri == uri)
    query = query.filter(model.Resource.ownerID == ownerID)
    return _queryOne(query)

@_transactional(readOnly=True)
def getResourceByChecksum(session, checksum, ownerID=None):
    return _getResourceByChecksum(session, checksum, ownerID)

def _getResourceByChecksum(session, checksum, ownerID=None):
    query = session.query(model.Resource)
    query = query.filter(model.Resource.checksum == checksum)
    if ownerID:
        query = query.filter(model.Resource.ownerID == ownerID)
    return query.first()

@_transactional(readOnly=True)
def getResources(session, ids=None, typeName=None, pageNum=0, pageSize=0):
    query = session.query(model.Resource)
    if ids:
        query = query.filter(model.Resource.id.in_(ids))
    if typeName:
        query = query.filter(model.Resource.type.has(name = typeName))
    query = query.order_by(model.Resource.id)
    page = p.Page(query, pageNum, pageSize, tableName='Resources')
    return page

@_transactional(readOnly=True)
def getResourcesByOwner(session, ownerID, typeName=None, pageNum=0, pageSize=0):
    query = session.query(model.Resource)
    if typeName:
        query = query.filter(model.Resource.type.has(name = typeName))
    query = query.filter(model.Resource.ownerID == ownerID)
    query = query.order_by(model.Resource.id)
    page = p.Page(query, pageNum, pageSize)
    return page

@_transactional(readOnly=True)
def getResourcesWithGreaterID(session, resourceID, typeNames=[]):
    query = session.query(model.Resource)
    query = query.filter(model.Resource.id > resourceID)
    if typeNames:
        resourceTypes = _getResourceTypesDict(session)
        typeIDs = []
        for tn in typeNames:
            if resourceTypes.has_key(tn):
                typeIDs.append(resourceTypes[tn]['id'])
            else:
                raise Exception('Unknown resource type: %s' % tn)

        query = query.filter(model.Resource.resourceTypeID.in_(typeIDs))
    return query.all()

@_transactional(readOnly=True)
def getResourcesByTypes(session, typeNames=None, ownerID=None, getAll=False, sort=None, pageNum=0, pageSize=0):
    resourceTypes = _getResourceTypesDict(session)
    typeIDs = []
    query = session.query(model.Resource).distinct()
    query = query.join(model.ResourceRevision, model.Resource.id == model.ResourceRevision.resourceID)
    if typeNames:
        if 'resource' in typeNames:
            typeIDs = []
        else:
            for typeName in typeNames:
                typeName = typeName.lower()
                if resourceTypes.has_key(typeName):
                    typeIDs.append(resourceTypes[typeName]['id'])
                else:
                    raise Exception('Unknown resource type: %s' % typeName)
    if typeIDs:
        query = query.filter(model.Resource.resourceTypeID.in_(typeIDs))
    else:
        raise Exception('Listing resources without specifying resource types is not supported')
    if ownerID and not getAll:
        query = query.filter(or_(
            model.Resource.ownerID == ownerID,
            model.ResourceRevision.publishTime != None))
    elif not ownerID and not getAll:
        query = query.filter(model.ResourceRevision.publishTime != None)
    if sort:
        for col, order in sort:
            if col == 'name':
                oby = model.Resource.name
            elif col == 'creationTime':
                oby = model.Resource.creationTime
            elif col == 'ownerID':
                oby = model.Resource.ownerID
            if order == 'asc':
                query = query.order_by(asc(oby))
            else:
                query = query.order_by(desc(oby))
    return p.Page(query, pageNum, pageSize)

def _setResourceRevision(session, resourceRevision, revision):
    resourceType = resourceRevision.resource.type
    if resourceType is None:
        resourceType = _getInstance(session,
                                    resourceRevision.resource.resourceTypeID,
                                    model.ResourceType)
    log.debug('_setResourceRevision: resourceRevision revision[%s, %s] type[%s, %s]' % (resourceRevision.revision, revision, resourceRevision.resource.type, resourceType))
    if resourceRevision.revision != revision and resourceRevision.resource.type != resourceType:
        resourceRevision.resource.type = resourceType
        if resourceType.versionable:
            resourceRevision.revision = revision

def _computeReferenceHashForResource(session, handle, resourceTypeName, member):                                                                                                                               
    m = hashlib.md5()
    m.update(h.safe_encode(handle))
    m.update(resourceTypeName)
    m.update(h.safe_encode(member.login) if member.login else member.email)
    hash = m.hexdigest()
    while _getUnique(session, model.Resource, 'refHash', hash):
        ## Make sure the hash is unique
        m.update(member.email)
        hash = m.hexdigest()
    return hash

@_transactional()
def createResource(session, resourceDict):
    return _createResource(session=session, resourceDict=resourceDict)

def _createResource(session, resourceDict, resourceType=None):
    log.debug("Resource dict: %s" % resourceDict)
    fcclient = fc.FCClient()
    if resourceType is None:
        if isinstance(resourceDict['resourceType'], (str, unicode)):
            resourceType = _getResourceTypeByName(session, name=resourceDict['resourceType'])
        else:
            resourceType = _getInstance(session, resourceDict['resourceType'], model.ResourceType)
    if resourceType.versionable:
        raise ex.WrongTypeException((_(u'%(resourceType.name)s type is not allowed.')  % {"resourceType.name":resourceType.name}).encode("utf-8"))

    resourceTypeID = resourceType.id
    del(resourceDict['resourceType'])
    resourceDict['resourceTypeID'] = resourceTypeID


    ownerID = resourceDict['ownerID']
    member = _getUnique(session, model.Member, 'id', ownerID)

    #
    #  Save the contents.
    #
    isExternal = int(resourceDict['isExternal'])
    uriOnly = int(resourceDict['uriOnly'])
    del(resourceDict['uriOnly'])
    publishTime = None
    if resourceDict.has_key('isPublic'):
        if resourceDict['isPublic']:
            publishTime = resourceDict['creationTime']
        del resourceDict['isPublic']
    size = 0

    log.info('Original URI: [%s]' %(resourceDict.get('uri')))
    longUri = False
    if (isExternal or uriOnly) and resourceDict.get('uri'):
        uri = resourceDict['uri']
        relPath = uri
        log.info(len(uri))
        if len(uri) > 255:
            uri = hashlib.md5(uri).hexdigest()
            resourceDict['uri'] = uri
            longUri = True
    log.info('Hashed URI: [%s]' %(resourceDict.get('uri')))
    log.info('isExternal: [%s]' %(isExternal))

    saveToFC = False
    rev = '1'
    try:
        try:
            if isExternal or uriOnly:
                #
                #  Only need to save the URI for external resources.
                #  uriOnly is referring to existing resource; so no need
                #  to save contents either.
                #
                uri = resourceDict['uri']
                if not isExternal:
                    #
                    #  Check the existence of the resource.
                    #
                    if not fcclient.checkResource(relPath, resourceType.name):
                        raise IOError('%s does not exist' % relPath)
                else:
                    if not resourceType.versionable:
                        #
                        # External resource
                        #
                        saveToFC = False
                        if not relPath.startswith('http://') and not relPath.startswith('https://'):
                            if relPath.startswith('//'):
                                relPath = 'http:' + relPath
                            else:
                                relPath = 'http://' + relPath
                        h.checkUrlExists(relPath)
                        contents = relPath
            else:
                if resourceDict.has_key('uri'):
                    uri = resourceDict['uri']
                    log.debug("_createResource: Type of uri: %s" % type(uri))
                    if not h.isUploadField(uri):
                        relPath = uri
                    else:
                        ## Get the name of the file
                        ## MUST check for filename first since upload field (FieldStorage) has both attributes
                        if hasattr(uri, 'filename'):
                            ## if uri is uploaded file (using a multipart form)
                            relPath = uri.filename
                        elif hasattr(uri, 'name'):
                            ## if uri is any other open file
                            relPath = uri.name
                        else:
                            raise Exception((_(u"Unknown type of object for uri: %(type(uri))s. Must be either a file object or uploaded file object")  % {"type(uri)":type(uri)}).encode("utf-8"))
                    relPath = os.path.basename(relPath)
                    log.debug("_createResource: uri relPath: %s" % relPath)
                else:
                    raise Exception((_(u'No URI specified for creating resource.')).encode("utf-8"))

                if resourceDict.has_key('contents'):
                    #
                    #  Embedded contents.
                    #
                    contents = resourceDict['contents']
                    del(resourceDict['contents'])
                    saveToFC = True
                else:
                    #
                    #  Uploaded.
                    #
                    saveToFC = True
                    if type(uri).__name__ == 'file':
                        ## If uri is an open file
                        contents = uri
                    else:
                        ## if uri is uploaded file object
                        contents = uri.file
        except Exception, e:
            log.error('_createResource Exception: %s' % str(e), exc_info=e)
            raise e
        if not longUri:
            resourceDict['uri'] = relPath
        if not resourceDict.get('handle'):
            resourceDict['handle'] = resourceDict['uri'].replace(' ', '-')
        #
        #  See if the meatdata of this resource exsits already.
        #
        resource = None
        if resource:
            resourceRevision = resource.revisions[0]
            log.info("_createResource: Resource found: %s, uri: %s" % (resource.id, resource.uri))
        else:
            #
            #  Create a new one.
            #
            ## Calculate ref hash
            if not resourceDict.get('refHash'):
                resourceDict['refHash'] = _computeReferenceHashForResource(session, resourceDict['handle'], resourceType.name, member)

            resource = model.Resource(**resourceDict)
            session.add(resource)
            log.info("Creating resource revision: %s" % publishTime)
            resourceRevision = model.ResourceRevision(
                                revision=rev,
                                creationTime=resourceDict['creationTime'],
                                publishTime=publishTime)
            resourceRevision.resource = resource
            session.add(resourceRevision)
            session.flush()
            log.debug("Resource added: %s" % resource)
        #
        #  Save to fcrepo - at this point relPath has the name of the resource - either file name or url
        #  content has the actual content - xml, uploaded image file obj, or url
        #
        log.info('isExternal: [%s]' %(isExternal))
        if saveToFC:
            sum, size = h.computeChecksum(contents, isAttachment=resource.isAttachment)
            log.info("Resource size: %s Limit: %s" % (size, h.getConfigOptionValue('attachment_max_upload_size')))
            if resource.isAttachment and size > int(h.getConfigOptionValue('attachment_max_upload_size')) and ownerID != 1:
                raise ex.ResourceTooLargeException((_(u'Maximum allowable file size exceeded for attachment: %(size)d')  % {"size":size}).encode("utf-8"))

            resource.checksum = sum
            existingResource = _getResourceByChecksum(session, checksum=sum, ownerID=ownerID)
            if not existingResource:
                ## I am the satellite server!
                log.info("Satellite server. Create resource")
                resource.refHash = sum
                relPath = os.path.basename(relPath)
                checksum = fcclient.saveResource(id=resource.refHash, resourceType=resourceType, isExternal=isExternal, creator=ownerID, name=relPath, content=contents, isAttachment=resource.isAttachment)
                resource.revisions[0].filesize = size
                resource.revisions[0].hash = checksum
                resource.satelliteUrl = resource.getUri()
            else:
                if isExternal:
                    log.info('External resource: Set the resource.satelliteUrl and resource.checksum to None')
                    resource.satelliteUrl = None
                    resource.checksum = None
                else:
                    resource.satelliteUrl = existingResource.satelliteUrl
                resourceRevision.filesize = existingResource.revisions[0].filesize

        return resourceRevision
    finally:
        pass

@_transactional()
def deleteResource(session, resource, failOnError=False):
    return _deleteResource(session, resource, failOnError=failOnError)

def _deleteResource(session, resource, failOnError=False):
    """
        Delete the given Resource.
    """
    log.debug('_deleteResource[%s]' % resource)
    resource = _getUnique(session, model.Resource, 'id', resource.id)
    if not resource:
        return

    for revision in resource.revisions:
        session.delete(revision)
    session.delete(resource)

@_transactional(readOnly=True)
def getResourceTypeByName(session, name):
    return _getResourceTypeByName(session, name)

def _getResourceTypeByName(session, name):
    return _getUnique(session, model.ResourceType, 'name', name)

def _getResourceTypesDict(session, asDict=True):                                                                                                                                                               
    rd = {}
    query = session.query(model.ResourceType)
    query = query.prefix_with('SQL_CACHE')
    for rt in query.all():
        if asDict:
            rd[rt.name.lower()] = rt.asDict()
        else:
            rd[rt.name.lower()] = rt
    return rd

def _getResourceRevision(session, resourceID, revision):                                                                                                                                                       
    query = session.query(model.ResourceRevision)
    query = query.filter_by(resourceID = resourceID)
    query = query.filter_by(revision = revision)
    return _queryOne(query)

@_transactional()
def updateResource(session, resourceDict, member):
    return _updateResource(session=session, resourceDict=resourceDict, member=member)

def _updateResource(session, resourceDict, member):
    """
        Update a resource dictionary object.

    """
    copied = False
    versioned = False
    isSaved = False
    saveToFC = False
    log.debug("_updateResource: resourceDict: %s" % str(resourceDict))

    try:
        resourceRevision = resourceDict['resourceRevision']
        resource = resourceRevision.resource

        if resource.owner.id != member.id:
            raise Exception((_(u'Resource owner, %(ownerID)s, different from %(mid)')  % {"ownerID":resource.owner.id, "mid":member.id}).encode("utf-8"))

        if resourceDict.get('resourceType') and resource.resourceTypeID != resourceDict['resourceType'].id:
            resource.type = session.merge(resourceDict['resourceType'])
        elif resourceDict.get('resourceTypeID') and resource.resourceTypeID != resourceDict['resourceTypeID']:
            resource.resourceTypeID = resourceDict['resourceTypeID']

        if resourceDict.has_key('isExternal'):
            resource.isExternal = resourceDict['isExternal']

        if resourceDict.has_key('resourceName'):
            resource.name = resourceDict['resourceName']

        if resourceDict.has_key('resourceHandle'):
            handle = model.resourceName2Handle(resourceDict['resourceHandle'])
            if not resourceDict.has_key('uri') and not resource.isExternal and resource.handle == resource.uri:
                resource.uri = handle
            resource.handle = handle

        if resourceDict.has_key('resourceDesc'):
            resource.description = resourceDict['resourceDesc']

        if resourceDict.has_key('ownerID'):
            resource.ownerID = resourceDict['ownerID']
            
        ## Change the uri even if the file is not changed for internal and non-versionable resources
        #if not resource.isExternal and not resource.type.versionable and \
        #        not resourceDict.has_key('uri') and not resourceDict.has_key('contents'):
        #    resource.uri = os.path.basename(resource.name)
        #    log.info("_updateResource(): Changed resource uri: %s" % resource.uri)

        if resourceDict.has_key('license'):
            resource.license = resourceDict['license']

        if resourceDict.has_key('authors'):
            resource.authors = resourceDict['authors']

        if resourceDict.has_key('isAttachment'):
            resource.isAttachment = resourceDict['isAttachment']

        if resourceDict.has_key('isPublic'):
            if resourceDict['isPublic']:
                resourceRevision.publishTime = datetime.now()
            else:
                resourceRevision.publishTime = None
            del resourceDict['isPublic']

        log.info("_updateResource: Saving resource: %s" % resource.id)
        log.debug("_updateResource: Saving resource: %s" % resource)
        rev = resourceRevision.revision
        if resource.isExternal:
            if resourceDict.has_key('uri'):
                path = resourceDict['uri']
                resource.satelliteUrl = None
                resource.checksum = None
                #resource.handle = os.path.basename(path)
                if path != resource.uri:
                    resource.uri = path
                    relPath = path
                    contents = path
                    h.checkUrlExists(contents)
                    saveToFC = False
            resource.hash = str(resource.id)
        else:
            if resourceDict.has_key('uri') or resourceDict.has_key('contents'):
                if resourceDict.has_key('uri'):
                    if not h.isUploadField(resourceDict['uri']):
                        relPath = resourceDict['uri']
                        contents = relPath
                    else:
                        if hasattr(resourceDict['uri'], 'filename'):
                            relPath = resourceDict['uri'].filename
                        else:
                            relPath = resourceDict['uri'].name
                    if relPath:
                        resource.uri = os.path.basename(relPath)
                        log.info("_updateResource: Set resource uri to: %s" % resource.uri)

                if resourceDict.has_key('contents'):
                    #
                    #  Embedded contents.
                    #
                    if type(resourceDict['uri']).__name__ != 'str':
                        # Need to save to fedora commons
                        ## Contents is the file object and relPath is the file name
                        if type(resourceDict['uri']).__name__ == 'file':
                            contents = resourceDict['uri']
                        else:
                            contents = resourceDict['uri'].file
                        saveToFC = True
                    log.debug('updateResource: wrote contents to %s, saveToFC[%s]' % (relPath, saveToFC))
                else:
                    #
                    #  Uploaded - non text content.
                    #
                    uri = resourceDict['uri']
                    if type(uri).__name__ != 'str':
                        if type(uri).__name__ == 'file':
                            contents = uri
                        else:
                            contents = uri.file
                        saveToFC = True
                    log.debug('updateResource: wrote uri to %s, saveToFC[%s]' % (relPath, saveToFC))

        if resourceRevision.revision != rev:
            session.flush()
            publishTime = resourceRevision.publishTime
            resourceRevision = _getResourceRevision(session, resource.id, rev)
            if resourceRevision:
                if resourceRevision.publishTime != publishTime:
                    resourceRevision.publishTime = publishTime
            else:
                log.debug('_updateREsource: isSaved[%s]' % isSaved)
                if isSaved:
                    raise Exception((_(u'Cannot find saved resource revision for %(resource)s')  % {"resource":resource}).encode("utf-8"))
                resourceRevision = model.ResourceRevision(
                                                    revision=rev,
                                                    creationTime=datetime.now(),
                                                    publishTime=publishTime)
                resourceRevision.resource = resource
                session.add(resourceRevision)
                resource.revisions.insert(0, resourceRevision)
                session.flush()
                log.debug('updateResource: new resourceRevision.id[%s]' % resourceRevision.id)

        if saveToFC:
            fcclient = fc.FCClient()
            sum, size = h.computeChecksum(contents, isAttachment=resource.isAttachment)
            if resource.isAttachment and size > int(h.getConfigOptionValue('attachment_max_upload_size')) and member.id != 1:
                raise ex.ResourceTooLargeException((_(u'Maximum allowable file size exceeded for attachment: %(size)d')  % {"size":size}).encode("utf-8"))
            resource.checksum = sum
            resourceRevision.filesize = size
            existingResource = _getResourceByChecksum(session, checksum=sum)
            ## I am the satellite server
            if existingResource:
                ## Just return existing if found in cache
                resource = existingResource
            else:
                ## Create a resource
                resource.refHash = sum
                checksum = fcclient.saveResource(id=resource.refHash, resourceType=resource.type, isExternal=resource.isExternal, creator=member.id, name=relPath, content=contents, isAttachment=resource.isAttachment)
                resourceRevision.hash = checksum
                resourceRevision.filesize = size
                testUri = resource.getUri()
                if testUri.startswith("http"):
                    try:
                        headOpener = urllib2.build_opener(h.HeadRedirectHandler())
                        headOpener.open(h.HeadRequest(testUri))
                    except Exception, e:
                        log.error("Error making head request: %s" % str(e), exc_info=e)
                        raise Exception((_(u'Cannot resolve satellite url: %(testUri)s')  % {"testUri":testUri}).encode("utf-8"))
                    
                resource.satelliteUrl = resource.getUri()
            log.info("Resource after save: %s" % resource.id)
            log.debug("Resource after save: %s" % resource)

        session.flush()
    except Exception, e:
        log.error('_updateResource Exception: %s' % str(e), exc_info=e)
        raise e
    return resourceRevision, copied, versioned

@_transactional()
def createTask(session, **kwargs):
    return _createTask(session=session, **kwargs)

def _createTask(session, **kwargs):
    _checkAttributes([ 'name', 'taskID' ], **kwargs)
    """
        Create a Task instance.
    """
    if not kwargs.get('started'):
        kwargs['started'] = datetime.now()
    if not kwargs.get('status'):
        kwargs['status'] = 'PENDING'
    elif kwargs['status'].upper() not in model.TASK_STATUSES:
        raise Exception((_(u"Invalid task status: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))

    task = model.Task(**kwargs)
    session.add(task)
    return task

@_transactional()
def updateTask(session, **kwargs):
    _checkAttributes(['id'], **kwargs)
    task = _getUnique(session, model.Task, 'id', kwargs['id'])
    if not task:
        raise Exception((_(u"No such task: %(kwargs['id'])s")  % {"kwargs['id']":kwargs['id']}).encode("utf-8"))
    if kwargs.has_key('name'):
        task.name = kwargs['name']

    if kwargs.has_key('message'):
        task.message = kwargs['message']

    if kwargs.has_key('userdata'):
        task.userdata = kwargs['userdata']

    if kwargs.has_key('artifactKey'):
        task.artifactKey = kwargs['artifactKey']

    if kwargs.has_key('hostname'):
        task.hostname = kwargs['hostname']

    if kwargs.has_key('taskID'):
        task.taskID = kwargs['taskID']

    if kwargs.has_key('ownerID'):
        task.ownerID = kwargs['ownerID']

    if kwargs.get('status'):
        if kwargs['status'].upper() not in model.TASK_STATUSES:
            raise Exception((_(u"Invalid task status specified: %(kwargs['status'])s")  % {"kwargs['status']":kwargs['status']}).encode("utf-8"))
        task.status = kwargs['status'].upper()

    session.add(task)
    return task

@_transactional(readOnly=True)
def getTaskByID(session, id):
    try:
        id = long(id)
        return _getUnique(session, model.Task, 'id', id)
    except ValueError:
        return None

@_transactional(readOnly=True)
def getTaskByTaskID(session, taskID):
    return _getTaskByTaskID(session, taskID)

def _getTaskByTaskID(session, taskID):
    session.expire_all()
    query = session.query(model.Task)
    query = query.filter_by(taskID=taskID)
    task = _queryOne(query)
    return task

@_transactional()
def deleteTask(session, task):
    _deleteTask(session, task)

def _deleteTask(session, task):
    if task:
        session.delete(task)

@_transactional()
def deleteTaskByID(session, id):
    try:
        id = long(id)
        task = _getUnique(session, model.Task, 'id', id)
        _deleteTask(session, task=task)
    except ValueError:
        pass

@_transactional(readOnly=True)
def getLastTaskByName(session, name, statusList=None, excludeIDs=[]):
    query = session.query(model.Task)
    log.info("Getting task by name: %s" % name)
    query = query.filter(model.Task.name == name)
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    if excludeIDs:
        query = query.filter(not_(model.Task.id.in_(excludeIDs)))
    query = query.order_by(model.Task.updated.desc(), model.Task.started.desc())
    return query.first()

@_transactional()
def deleteTasksByLastUpdateTime(session, lastUpdated, op='before', names=None, excludeNames=None, statusList=None):
    if not lastUpdated:
        raise Exception("lastUpdated must be specified.")
    query = session.query(model.Task)
    if op == 'before':
        query = query.filter(model.Task.updated < lastUpdated)
    elif op == 'after':
        query = query.filter(model.Task.updated > lastUpdated)
    else:
        raise Exception("Invalid op. Should be one of ['before', 'after']. op=[%s]" % str(op))
    if names:
        query = query.filter(model.Task.name.in_(names))
    elif excludeNames:
        query = query.filter(not_(model.Task.name.in_(excludeNames)))
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))

    return query.delete(synchronize_session=False)

@_transactional(readOnly=True)
def getTasksByLastUpdateTime(session, lastUpdated, op='before', names=None, excludeNames=None, statusList=None, pageNum=0, pageSize=0):
    query = session.query(model.Task)
    if op == 'before':
        query = query.filter(model.Task.updated < lastUpdated)
    elif op == 'after':
        query = query.filter(model.Task.updated > lastUpdated)
    if names:
        query = query.filter(model.Task.name.in_(names))
    elif excludeNames:
        query = query.filter(not_(model.Task.name.in_(excludeNames)))
    if statusList:
        query = query.filter(model.Task.status.in_(statusList))
    query = query.order_by(model.Task.updated.asc())
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page

@_transactional(readOnly=True)
def getTasks(session, filters=None, searchFld=None, term=None, sort=None, pageNum=0, pageSize=0):
    fields = {
            'status':       model.Task.status,
            'taskID':       model.Task.taskID,
            'id':           model.Task.id,
            'name':         model.Task.name,
            'ownerID':      model.Task.ownerID,
            }
    sortFields = {}
    sortFields.update(fields)
    sortFields.update({
        'started': model.Task.started,
        'updated': model.Task.updated,
    })

    if searchFld and searchFld != 'searchAll' and searchFld not in fields.keys():
        raise Exception((_(u'Unsupported search field: %(searchFld)s')  % {"searchFld":searchFld}).encode("utf-8"))
    
    if not sort:
        sort = 'updated,desc'

    sortDir = 'asc'
    if ',' in sort:
        sortFld, sortDir = sort.split(',', 1)
    else:
        sortFld = sort
    if sortFld not in sortFields:
        raise Exception((_(u'Unsupported sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))

    query = session.query(model.Task)
    filterDict = {}
    if filters:
        for filterFld, filter in filters:
            if filterFld not in fields.keys():
                raise Exception((_(u'Unsupported filter field: %(filterFld)s')  % {"filterFld":filterFld}).encode("utf-8"))
            if filterFld and filter:
                if not filterDict.has_key(filterFld):
                    filterDict[filterFld] = []
                filterDict[filterFld].append(filter)

    if filterDict:
        for filterFld in filterDict.keys():
            filter = filterDict[filterFld]
            log.info("Filter fld: %s, terms: %s" % (filterFld, filter))
            query = query.filter(fields[filterFld].in_(filter))

    if searchFld and term and searchFld != 'searchAll':
        query = query.filter(fields[searchFld].ilike('%%%s%%' % term))

    if searchFld == 'searchAll' and term:
        term = '%%%s%%' % term
        query = query.filter(or_(
            model.Task.status.ilike(term),
            model.Task.taskID.ilike(term),
            model.Task.id.ilike(term),
            model.Task.name.ilike(term),
            model.Task.ownerID.ilike(term)))

    if sortFld:
        if sortDir == 'asc':
            query = query.order_by(asc(sortFld))
        else:
            query = query.order_by(desc(sortFld))
    log.debug("Running tasks query: %s" % query)
    page = p.Page(query, pageNum, pageSize, tableName='Tasks')
    return page
