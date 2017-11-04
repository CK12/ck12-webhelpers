import logging
from pylons import request
from pylons.decorators import jsonify
from bson.json_util import dumps

from flx.controllers.mongo.base import MongoBaseController
from flx.model.mongo.urlmapping import UrlMapping
from flx.controllers import decorators as d
import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class UrlmappingController(MongoBaseController):
    
    """
        URL mapping related APIs.
    """
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.um = UrlMapping(self.db)
        
        #TODO: 1 comment 2- Admin authorization, 3- Proper error codes, 4- Change update method, 5- Use pyflakes

    """
        Create new url corresponding to old url 
    """
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def createUrlMap(self,member):
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can create url map')
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
            oldUrl = request.params['oldUrl']
            if self.um.getByOldUrl(oldUrl):
                response = self.um.getByOldUrl(oldUrl)
            else:
                kwargs = {}
                kwargs['oldUrl'] = oldUrl
                kwargs['newUrl'] = request.params['newUrl']
                response = self.um.create(**kwargs)
            result['response'] = response
            return result
        except Exception as e:
            log.error('createUrl()- Error in create mapping url: %s' %(str(e)), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_URLMAP, str(e))
                  
            
    """
        Update newUrl corresponding to oldUrl
    """
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def updateUrlMap(self,member):
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can update url map')
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            # Check if the oldUrl exists in DB
            oldUrl = request.params['oldUrl']
            if not self.um.getByOldUrl(oldUrl):
                return ErrorCodes().asDict(ErrorCodes.URLMAP_DOES_NOT_EXIST, 'This url:[%s] is not mapped yet' % oldUrl) 
            
            kwargs = {}
            kwargs['oldUrl'] = oldUrl
            kwargs['newUrl'] = request.params['newUrl']
            
            response = self.um.update(**kwargs)
            result['response'] = response
            return result
        except Exception as e:
            log.error('updateUrlMap()- Error in update mapping url: %s' %(str(e)), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_URLMAP, str(e))
        
    
    """
        Delete url Mapping corresponding to oldUrl
    """    
    @d.jsonify()
    @d.trace(log, ['member'])
    @d.checkAuth(request)
    def deleteUrlMap(self,member):
        try:
            if not u.isMemberAdmin(member):
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can delete url map')
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
            # Check if the oldUrl exists in DB
            oldUrl = request.params['oldUrl']
            if not self.um.getByOldUrl(oldUrl):
                return ErrorCodes().asDict(ErrorCodes.URLMAP_DOES_NOT_EXIST, 'This url:[%s] is not mapped yet' % oldUrl)
            # Delete
            self.um.delete(oldUrl)
            return result
        except Exception as e:
            log.error('deleteUrlMap()- Error in deleting mapping url: %s' %(str(e)), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_URLMAP, str(e))
        
    """
        Get url mapping info based on oldUrl passed
    """      
    @d.jsonify()
    @d.trace(log)
    def getUrlMapInfo(self):
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            
            # Get by oldUrl
            oldUrl = request.params.get('oldUrl', '')
            if oldUrl:
                response = self.um.getByOldUrl(oldUrl)
            # Get by id
            else:
                id = request.params.get('id', '')
                if not id:
                    raise Exception("Please provide either 'oldUrl' or 'id' to get the mapping info")
                else:
                    response = self.um.getByID(id)

            result['response'] = response
            return result
        except Exception as e:
            log.error('getUrlMapInfo()- Error in getting mapping url info: %s' %(str(e)), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.URLMAP_DOES_NOT_EXIST, str(e))
        
    
    """
        Browse all the mapped url with pagination.
    """
    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def browseInfoUrlMaps(self, pageNum, pageSize):
        try:
#             if not u.isMemberAdmin(member):
#                 return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'Only administrator can browse url mappings')
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            sort = request.params.get('sort', 'updated,desc')
            kwargs['oldUrl'] = request.params.get('oldUrl', None)
            kwargs['newUrl'] = request.params.get('newUrl', None)
            res = self.um.browseUrlMaps(pageNum=pageNum, pageSize=pageSize,sort=sort, **kwargs)
            
            result['response']['urlMaps'] = [ m for m in res ]
            result['response']['total'] = res.getTotal()
            result['response']['limit'] = res.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception as e:
            log.error('browseInfoUrlMaps()- Error in browsing url mappings: %s' %(str(e)), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_BROWSE_URLMAP, str(e))
    
    
    
                        