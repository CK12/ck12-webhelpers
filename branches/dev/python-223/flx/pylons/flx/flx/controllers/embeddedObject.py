import logging
import os
from BeautifulSoup import BeautifulSoup
from datetime import datetime
from pylons.i18n.translation import _ 
import traceback
import json
import base64
import re

from pylons import config, request, tmpl_context as c
from pylons.controllers.util import redirect
from pylons import app_globals as g
#from pylons.decorators.cache import beaker_cache

from flx.controllers import decorators as d
from flx.model import api
from flx.lib.base import BaseController, render
import flx.controllers.user as u

from flx.controllers.errorCodes import ErrorCodes
from flx.controllers.resourceHelper import ResourceHelper
import flx.controllers.eohelper as eohelper

log = logging.getLogger(__name__)

protocolRegex = re.compile(r'^(http[s]?://)', re.I)

def isEmbeddedObjectAbused(eo):
    if eo and eo.resource:
        rh = g.resourceHelper
        if not rh:
            rh = ResourceHelper()
        return rh.isResourceAbused(eo.resource.revisions[0])
    return False

class EmbeddedobjectController(BaseController):

    def _getEmbeddedObject(self, param, embedInfo, type='url', checkBlacklist=True):
        """
            Internal method to get an embedded object instance by url or code if one exists in the database.
            Raises error if one is not found.
        """
        eo = None
        if type == 'url':
            url = param
            eo = eohelper.getEmbeddedObjectFromUrl(url, embedInfo=embedInfo, checkBlacklist=checkBlacklist)
            if not eo:
                raise Exception((_(u'Could not get embedded object by url: [%(url)s]')  % {"url":url}).encode("utf-8"))
        elif type == 'code':
            code = param
            eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(embedInfo)
            eo = eowrapper.getEmbeddedObject(checkBlacklist=checkBlacklist)
            if not eo:
                raise Exception((_(u'Could not get embedded object for code: %(code)s')  % {"code":code}).encode("utf-8"))
        else:
            raise Exception((_(u'Unknown request')).encode("utf-8"))
        if checkBlacklist and isEmbeddedObjectAbused(eo):
            raise Exception((_(u'EmbeddedObject is forbidden: %(eo.id)s')  % {"eo.id":eo.id}).encode("utf-8"))
        return eo


    @d.jsonify()
    @d.trace(log, ['url', 'width', 'height'])
    def getInfo(self, width=0, height=0, url=None):
        """
            Get info for the embedded object by url, id or code (code must be a post request)
            Returns error if the object is blacklisted
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eo = None
            if url:
                eid = url
                try:
                    id = int(url.strip())
                    eo = api.getEmbeddedObjectByID(id=id)
                except:
                    pass
                if not eo:
                    if width == 0:
                        width = None
                    if height == 0:
                        height = None
                    eo = self._getEmbeddedObject(url, type='url', width=width, height=height, checkBlacklist=True)
            else:
                code = request.POST.get('code')
                if not code:
                    raise Exception((_(u'Invalid request. No embedded code in POST')).encode("utf-8"))
                try:
                    code = base64.b64decode(code)
                except TypeError:
                    log.warn("Unable to base64 decode 'code'")
                eid = code
                embedInfo = {}
                embedInfo['embeddable'] = code
                eo = self._getEmbeddedObject(code, embedInfo=embedInfo, type='code', checkBlacklist=False)

            if not eo:
                log.debug('Could not get embedded object for %s' % eid)
                return ErrorCodes().asDict(ErrorCodes.NO_SUCH_EMBEDDED_OBJECT)

            if eo.isBlacklisted() or (eo.resource and g.resourceHelper.isResourceAbused(eo.resource.revisions[0])):
                log.info("EmbeddedObject is forbidden: %s" % eid)
                return ErrorCodes().asDict(ErrorCodes.FORBIDDEN_EMBEDDED_OBJECT)

            result['response'] = eo.asDict()
            if result['response']['resource']:
                resource = api.getResourceByID(id=result['response']['resource']['id'])
                result['response']['resource'] = g.resourceHelper.getResourceInfo(resource.revisions[0])
            return result
        except Exception, e:
            log.error("Exception getting info for embedded object: %s" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def create(self, member):
        """
            Create a new embedded object by either specifying a url or embed code
            Parameters:
                One of:
                    url: url of the object
                    code: embed code for the object
                When specifying url, also optionally specify width and height
                authors: Authors for this embedded object (optional)
                license: License of this embedded object (optional)
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            eo = None
            log.info("Post for create: %s" % request.POST)
            url = request.POST.get('url')
            embedInfo = {}
            embedInfo['url'] = request.POST.get('url')
            embedInfo['embeddable'] = request.POST.get('code')
            try:
                embedInfo['embeddable'] = base64.b64decode(embedInfo['embeddable'])
            except TypeError:
                log.warn("Unable to base64 decode 'code'")
            embedInfo['embeddable'] = embedInfo['embeddable'].replace('\'', '"')
            embedInfo['authors'] = request.POST.get('authors')
            embedInfo['license'] = request.POST.get('license')
            embedInfo['className'] = request.POST.get('className')
            embedInfo['title'] = request.POST.get('title')
            embedInfo['desc'] = request.POST.get('desc')
            embedInfo['anchorID'] = request.POST.get('anchorID')
            embedInfo['frameborder'] = request.POST.get('frameborder')
            embedInfo['src'] = request.POST.get('src')
            embedInfo['name'] = request.POST.get('name')
            height = request.POST.get('height')
            if height:
                height = int(height)
            embedInfo['height'] = height
            width = request.POST.get('width')
            if width:
                width = int(width)
            embedInfo['width'] = width
            log.info('embedInfo: %s' %(embedInfo))

            eowrapper = None
            if url:
                try:
                    eo = self._getEmbeddedObject(url, embedInfo=embedInfo, type='url', checkBlacklist=False)
                except Exception, e:
                    ## No such object - create it
                    eowrapper = eohelper.EmbeddedObjectWrapper(url, embedInfo=embedInfo, ownerID=member.id)
                    #eowrapper = eohelper.EmbeddedObjectWrapper(url, width=width, height=height, ownerID=member.id)
            else:
                code = request.POST.get('code')
                try:
                    code = base64.b64decode(code)
                except TypeError:
                    log.warn("Unable to base64 decode 'code'")
                if not code:
                    raise Exception((_(u'Invalid request. No embedded code in POST')).encode("utf-8"))
                try:
                    eo = self._getEmbeddedObject(code,  embedInfo=embedInfo, type='code', checkBlacklist=True)
                except Exception, e:
                    ## No such object - create it
                    eowrapper = eohelper.EmbeddedObjectWrapper(url=None, embedInfo=embedInfo, ownerID=member.id)

            if eowrapper:
                eo = eowrapper.createEmbeddedObject(checkBlacklist=True)
            elif eo:
                eoDict = {}
                if height and eo.height != height:
                        eoDict['height'] = height
                if width and eo.width != width:
                        eoDict['width'] = width
                eoDict['license'] = embedInfo['license']
                eoDict['authors'] = embedInfo['authors']
                if eoDict:
                    eoDict['id'] = eo.id
                    eo = api.updateEmbeddedObject(**eoDict)

            eoDict = eo.asDict()
            eoDict['iframe'] = eo.iframe
            log.info('Returning eoDict: %s' %(eoDict))
            result['response'] = eoDict
            return result
        except Exception, e:
            log.error("Exception constructing embedded object: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_CREATE_EMBEDDED_OBJECT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createForm(self, member):
        c.prefix = self.prefix
        return render('/flx/embeddedObject/createForm.html')

    @d.jsonify()
    @d.trace(log, ['ids'])
    def getInfoMulti(self, ids):
        """
            Get information for multiple embedded objects by ids (used when rendering)
            Do not raise exception if one or more of the objectes are blacklisted.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            result['response']['embeddedObjects'] = []
            idList = ids.split(',')
            for id in idList:
                if id.strip():
                    eo = api.getEmbeddedObjectByID(id=int(id.strip()))
                    result['response']['embeddedObjects'].append(eo.asDict(errorIfBlacklisted=False))
            return result
        except Exception, e:
            log.error("Exception getting info for embedded object(s): %s" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def addToBlacklist(self, member):
        """
            Blacklist an embedded object.
            Parameters:
                One of:
                    providerID: id of the provider to be blacklisted
                    id: id of the embedded object to be blacklisted
            Only administrator can make this change
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            if request.POST.get('providerID'):
                providerID = int(request.POST.get('providerID'))
                provider = api.getProviderByID(id=providerID)
                if not provider:
                    c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT_PROVIDER
                    return ErrorCodes().asDict(c.errorCode)
                providerDict = { 'id': providerID, 'blacklisted': 1 }
                api.updateProvider(**providerDict)
            elif request.POST.get('id'):
                eoID = int(request.POST.get('id'))
                eo = api.getEmbeddedObjectByID(id=eoID)
                if not eo:
                    c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
                    return ErrorCodes().asDict(c.errorCode)
                eoDict = {'id': eo.id, 'blacklisted': 1}
                api.updateEmbeddedObject(**eoDict)
            else:
                raise Exception((_(u'Insufficient data. No embedded object id or provider id found.')).encode("utf-8"))
            return result
        except Exception, e:
            log.error("Exception blacklisting embedded object or provider: [%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def removeFromBlacklist(self, member):
        """
            Un-blacklist an embedded object.
            Parameters:
                One of:
                    providerID: id of the provider to be un-blacklisted
                    id: id of the embedded object to be un-blacklisted
            Only administrator can make this change
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                c.errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                return ErrorCodes().asDict(c.errorCode)

            if request.POST.get('providerID'):
                providerID = int(request.POST.get('providerID'))
                provider = api.getProviderByID(id=providerID)
                if not provider:
                    c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT_PROVIDER
                    return ErrorCodes().asDict(c.errorCode)
                providerDict = { 'id': providerID, 'blacklisted': 0 }
                api.updateProvider(**providerDict)
            elif request.POST.get('id'):
                eoID = int(request.POST.get('id'))
                eo = api.getEmbeddedObjectByID(id=eoID)
                if not eo:
                    c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
                    return ErrorCodes().asDict(c.errorCode)
                eoDict = {'id': eo.id, 'blacklisted': 0}
                api.updateEmbeddedObject(**eoDict)
            else:
                raise Exception((_(u'Insufficient data. No embedded object id or provider id found.')).encode("utf-8"))
            return result
        except Exception, e:
            log.error("Exception removing embedded object or provider from blacklist: [%s]" % str(e))
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER
            return ErrorCodes().asDict(c.errorCode, str(e))
            
    @d.trace(log, ['id'])
    def renderObject(self, id):
        """
            Render the embedded object - either redirect to the object's iframe source
            or return the HTML code snippet
            Cached for 30 days - at the resource.renderPerma action
        """
        start = datetime.now()
        try:
            mode = request.params.get('mode', '')
            """
                Embedded object look up cached for 7 days.
            """
            #@d.ck12_cache_region('weekly')
            def __render_object(id, mode):
                eo = api.getEmbeddedObjectByID(id=int(id))
                if not eo:
                    c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
                    return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, 'No embedded object of id, %s' % id), start)

                ## Make sure the object is not blacklisted
                if eo.isBlacklisted() or isEmbeddedObjectAbused(eo):
                    log.error("Embedded object is blacklisted: %s" % id)
                    return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.FORBIDDEN_EMBEDDED_OBJECT), start)

                if eo.code:
                    log.info("Code: %s" % eo.code)
                    soup = BeautifulSoup(eo.code)
                    iframe = soup.findAll('iframe')
                    if iframe:
                        iframe = iframe[0]
                        iframe['width'] = '95%'
                        iframe['height'] = '95%'
                        iframe['frameborder'] = '0'
                        if iframe.get('src'):
                            iframe['src'] = protocolRegex.sub(r'//', iframe['src'])
                        eo.code = iframe.prettify()
                    log.info("Updated Code: %s" % eo.code)

                    c.mode = mode if mode == 'autoplay' else ''
                    c.code = eo.code
                    c.prefix = self.prefix
                    return render('/flx/embeddedObject/renderForm.html')
                elif eo.uri:
                    log.info("url: %s" % eo.uri)
                    url = eo.uri
                    if eo.type == 'youtube' or eo.type == 'schooltube':
                        url = url.replace('/v/', '/embed/')
                    redirect(url)
                    return
            return __render_object(id, mode)
        except Exception, e:
            log.error("Error rendering embedded object: %s" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT
            return d.jsonifyResponse(ErrorCodes().asDict(c.errorCode, str(e)), start)

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAssociation(self, member):
        """
            Associate an embedded object with a resource
            Parameters:
                resourceID: id of the resource
                embeddedObjectID: id of the embedded object to associate with the resource
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resourceID = int(request.POST.get('resourceID'))
            eoID = int(request.POST.get('embeddedObjectID'))

            resource = api.getResourceByID(id=resourceID)
            if not resource:
                raise Exception((_(u'No such resource: %(str(resourceID))s')  % {"str(resourceID)":str(resourceID)}).encode("utf-8"))

            eo = api.getEmbeddedObjectByID(id=eoID)
            if not eo:
                raise Exception((_(u'No such embedded object: %(str(eoID))s')  % {"str(eoID)":str(eoID)}).encode("utf-8"))

            u.checkOwner(member, resource.ownerID, resource)
            log.info("Adding association for resource: %d to embeddedObject: %d" % (resource.id, eo.id))
            eoDict = { 'id': eo.id, 'resourceID': resource.id }
            eo = api.updateEmbeddedObject(**eoDict)
            result['response'] = {'resourceID': resource.id, 'embeddedObjectID': eo.id}
            return result
        except Exception, e:
            log.error('create embeddedObject-resource association Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCodes = ErrorCodes.CANNOT_CREATE_RESOURCE_ASSOCIATION
            return ErrorCodes().asDict(c.errorCodes, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createAssociationForm(self, member):
        resources = api.getResourcesByOwner(ownerID=member.id, pageNum=1, pageSize=400)
        c.resources = []
        for resource in resources:
            r = {'id': resource.id, 'type': resource.type.name, 'uri': resource.uri }
            c.resources.append(r)

        eos = api.getEmbeddedObjects(pageNum=1, pageSize=400)
        c.eos = []
        for eo in eos:
            c.eos.append({'id': eo.id, 'type': eo.type, 'uri': eo.uri, 'hash': eo.hash})

        c.prefix = self.prefix
        return render('/flx/embeddedObject/createAssociation.html') 

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def deleteAssociation(self, member):
        """
            Delete association of an embedded object from a resource
            Parameters:
                resourceID: id of the resource
                embeddedObjectID: id of the embedded object to dissociate from the resource
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            resourceID = int(request.POST.get('resourceID'))
            eoID = int(request.POST.get('embeddedObjectID'))

            resource = api.getResourceByID(id=resourceID)
            if not resource:
                raise Exception((_(u'No such resource: %(str(resourceID))s')  % {"str(resourceID)":str(resourceID)}).encode("utf-8"))

            eo = api.getEmbeddedObjectByID(id=eoID)
            if not eo:
                raise Exception((_(u'No such embedded object: %(str(eoID))s')  % {"str(eoID)":str(eoID)}).encode("utf-8"))

            u.checkOwner(member, resource.ownerID, resource)
            if eo.resource and eo.resourceID == resource.id:
                log.info("Removing association for resource: %d to embeddedObject: %d" % (resource.id, eo.id))
                eoDict = { 'id': eo.id, 'resourceID': None }
                eo = api.updateEmbeddedObject(**eoDict)
                result['response'] = {'resourceID': resource.id, 'embeddedObjectID': eo.id}
            else:
                raise Exception((_(u'No such embeddedObject - resource association')).encode("utf-8"))
            return result
        except Exception, e:
            log.error('create embeddedObject-resource association Exception[%s]' % str(e))
            log.error(traceback.format_exc())
            c.errorCodes = ErrorCodes.CANNOT_CREATE_RESOURCE_ASSOCIATION
            return ErrorCodes().asDict(c.errorCodes, str(e))

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createEmbeddedObjectProviderForm(self, member):
        """
            A sample form to create embedded object provider
        """
        c.prefix = self.prefix
        return render('/flx/embeddedObject/createProviderForm.html')

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def createEmbeddedObjectProvider(self, member):
        """
            Create a new embedded object provider from the post parameters.
            Expected POST parameters:
                name: Name of the provider (unique)
                domain: Domain of the provider - a http domain such as www.youtube.com or *.youtube.com
                blacklisted: If the provider should be blacklisted
                needsApi: If we should use the embed.ly API to get more information about an embedded object from this provider
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.error("Insufficient privileges to create an embedded object provider")
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, "Only administrators can create embedded object provider")

            name = request.POST.get("name")
            if not name:
                raise Exception((_(u"Name of the provider is required")).encode("utf-8"))

            domain = request.POST.get("domain")
            if not domain:
                raise Exception((_(u"Domain of the provider is required")).encode("utf-8"))
            ep = api.getProviderByDomain(domain=domain)
            if ep:
                log.error("EmbeddedObjectProvider already exists for domain: %s" % domain)
                return ErrorCodes().asDict(ErrorCodes.EMBEDDED_OBJECT_PROVIDER_ALREADY_EXISTS, "Embedded Object Provider already exists for this domain")

            blacklisted = str(request.POST.get('blacklisted')).lower() == 'true'
            needsApi = str(request.POST.get('needsApi')).lower() == 'true' 

            kwargs = {
                    'name': name,
                    'domain': domain,
                    'needsApi': needsApi,
                    'blacklisted': blacklisted,
                    }
            eop = api.createProvider(**kwargs)
            result['response'] = eop.asDict()
            return result
        except Exception, e:
            log.error("create embeddedobjectprovider exception: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_EMBEDDED_OBJECT_PROVIDER, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def updateEmbeddedObjectProvider(self, member):
        """
            Update an embedded object provider from the post parameters. Only include
            the parameters that need updating. 
            Expected POST parameters:
                id: Id of the provider (REQUIRED)
                name: Name of the provider
                domain: Domain of the provider - a http domain such as www.youtube.com or *.youtube.com
                blacklisted: If the provider should be blacklisted
                needsApi: If we should use the embed.ly API to get more information about an embedded object from this provider
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                log.error("Insufficient privileges to update an embedded object provider")
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, "Only administrators can update embedded object provider")

            id = int(request.POST.get('id'))
            kwargs = {}
            kwargs['id'] = id
            if request.POST.has_key('name'):
                kwargs['name'] = request.POST['name']

            if request.POST.has_key('domain'):
                kwargs['domain'] = request.POST['domain']

            if request.POST.has_key('blacklisted'):
                kwargs['blacklisted'] = str(request.POST.get('blacklisted')).lower() == 'true'
            if request.POST.has_key('needsApi'):
                kwargs['needsApi'] = str(request.POST.get('needsApi')).lower() == 'true' 

            eop = api.updateProvider(**kwargs)
            result['response'] = eop.asDict()
            return result
        except Exception, e:
            log.error("update embeddedobjectprovider exception: %s" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_EMBEDDED_OBJECT_PROVIDER, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, True, ['type'])
    @d.trace(log, ['member', 'type'])
    def createPlaceholderEmbeddedObject(self, member, type='video'):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            #originalUrl = request.param.get('originalUrl', '')
            imageDir = os.path.join(config.get('flx_home'), 'flx', 'public', 'media', 'images', 'placeholders')
            eo = eohelper.createPlaceholderEmbeddedObject(imageDir, memberID=member.id, type=type)
            result['response'] = eo.asDict()
            return result
        except Exception, e:
            log.error('Error getting placeholder embedded object: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_EMBEDDED_OBJECT, str(e))
 
    @d.jsonify()
    @d.sortable(request)
    @d.filterable(request, ['sort'], noformat=True)
    @d.setPage(request, ['sort', 'fq'])
    @d.trace(log, ['sort', 'fq', 'pageNum', 'pageSize'])
    def getEmbeddedObjectProvidersInfo(self, fq, pageNum, pageSize, sort=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            search = request.params.get('search')
            searchFld = None
            searchTerm = None
            if search:
                searchFld, searchTerm = search.split(',', 1)
            else:
                searchTerm = request.params.get('searchAll')
                if searchTerm:
                    searchFld = 'searchAll'

            providers = api.getEmbeddedObjectProviders(filters=fq, 
                    searchFld=searchFld, term=searchTerm, 
                    sort=sort, 
                    pageNum=pageNum, pageSize=pageSize)

            result['response']['total'] = providers.getTotal()
            result['response']['limit'] = len(providers)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['providers'] = [ p.asDict() for p in providers ]
            return result
        except Exception, e:
            log.error("No such provider exists: [%s]" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT_PROVIDER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log)
    def getThumbnail(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            code = request.params.get('code')
            if not code:
                raise Exception("No embed code specified for video")
            try:
                code = base64.b64decode(code)
            except TypeError:
                log.warn("Unable to base64 decode 'code'")
            embedInfo = {'embeddable': code}
            eowrapper = eohelper.getEmbeddedObjectWrapperFromCode(embedInfo)
            res = eowrapper.getObjectInfo()
            result['response'] = json.loads(res)
            return result
        except Exception as e:
            log.error("No such provider exists: [%s]" % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_EMBEDDED_OBJECT_PROVIDER
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.trace(log)
    def getThumbnailForm(self):
        c.prefix = self.prefix
        return render('/flx/embeddedObject/getThumbnailForm.html')

