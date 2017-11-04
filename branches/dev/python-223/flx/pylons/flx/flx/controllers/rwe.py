import logging
import traceback
import json

from pylons import request, tmpl_context as c
from flx.controllers.mongo.base import MongoBaseController
from flx.model import exceptions as ex
import flx.controllers.user as u
from pylons.i18n.translation import _
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes

from flx.model.mongo import rwe

log = logging.getLogger(__name__)

class RweController(MongoBaseController):
    """
    RWE(real world examples) related API's
    """
    
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def createRWE(self, member):
        """
        create RWE record
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            member = u.getImpersonatedMember(member)
            kwargs = {}

            title = request.POST.get('title', None)
            if not title:
                raise ex.MissingArgumentException((_(u'title not specified.')).encode("utf-8"))
            kwargs['title'] = title
            
            kwargs['content'] = request.POST.get('content', None)
            kwargs['imageUrl'] = request.POST.get('imageUrl', None)
            
            level = request.POST.get('level', 'at grade')
            if level.lower() in ['basic', 'at grade', 'advanced']:
                kwargs['level'] = level
            else:
                raise ex.NotFoundException((_(u"Incorrect level specified. it should be in('basic', 'at grade', 'advanced')")).encode("utf-8"))
            kwargs['ownerID'] = member.id
 
            simID = request.POST.get('simID', None)
            if not simID:
                raise ex.MissingArgumentException((_(u'simID not specified.')).encode("utf-8"))
            kwargs['simID'] = simID
            
            eids = request.POST.get('eids', None)
            if not eids:
                raise ex.MissingArgumentException((_(u'At-least one encodedID must be specified.')).encode("utf-8"))
            kwargs['eids'] = eids.split(',')

            kwargs['rweData'] = None
            if request.params.get('rweData'):
                kwargs['rweData'] = json.loads(request.params.get('rweData'))

            result['response'] = rwe.RWE(self.db).create(**kwargs)
            return result
        except Exception, e:
            log.error('Error in initiating a rwe[%s]' %(str(e)), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_INITIATE_RWE
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['id', 'member'])
    def updateRWE(self, member, id=None):
        """
            Update RWE information specified by the id
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            member = u.getImpersonatedMember(member)
            kwargs = {}

            if not id:
                id = request.POST.get('id', None)
                if not id:
                    raise ex.MissingArgumentException((_(u'RWE ID is missing.')).encode("utf-8"))

            rweObj = rwe.RWE(self.db).getByID(id=id)
            if not rweObj:
                raise Exception("Invalid RWE id specified: %s" % str(id))
            if not u.isMemberAdmin(member) and rweObj['ownerID'] != member.id :
                return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, 'You do not have permission to update this RWE.')

            title = request.POST.get('title', None)
            kwargs['content'] = request.POST.get('content', None)
            kwargs['imageUrl'] = request.POST.get('imageUrl', None)
            
            level = request.POST.get('level', 'at grade')
            if level.lower() in ['basic', 'at grade', 'advanced']:
                kwargs['level'] = level
            else:
                raise ex.NotFoundException((_(u"Incorrect level specified. it should be in('basic', 'at grade', 'advanced')")).encode("utf-8"))
            
            if not title:
                raise ex.MissingArgumentException((_(u'RWE title not specified.')).encode("utf-8"))
            kwargs['title'] = title
            
            simID = request.POST.get('simID', None)
            if not simID:
                raise ex.MissingArgumentException((_(u'simID not specified.')).encode("utf-8"))
            kwargs['simID'] = simID
            
            eids = request.POST.get('eids', None)
            if not eids:
                raise ex.MissingArgumentException((_(u'At-least one encodedID must be specified.')).encode("utf-8"))
            kwargs['eids'] = eids.split(',')

            if request.params.get('rweData'):
                kwargs['rweData'] = json.loads(request.params['rweData'])
            
            result['response'] = rwe.RWE(self.db).update(id=id, **kwargs)
            return result

        except ex.MissingArgumentException, mae:
            log.error('updateRWE: Missing Argument Exception[%s] traceback' %(traceback.format_exc()), exc_info=mae)
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except Exception as exe:
            c.errorCode = ErrorCodes.CANNOT_UPDATE_RWE
            log.error('updateRWE: Cannot Update RWE [%s] due to exception [%s]' %(id, traceback.format_exc()), exc_info=exe)
            return ErrorCodes().asDict(c.errorCode, 'Cannot Update RWE for id [%s]' %(id))
    
    @d.jsonify()
    @d.checkAuth(request)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def getRWE(self, member, pageNum, pageSize):
        """
        get RWE record
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            
            kwargs['userID'] = member.id
            simID = request.params.get('simID', None)
            kwargs['simID'] = simID
            kwargs['id'] = request.params.get('id')
            
            eids = request.params.get('eids', None)
            if eids:
                kwargs['eids'] = eids.split(',')
            
            # Commented below code to get all RWEs, if params are empty in request
            #if not simID and not eids and not kwargs['id']:
                #raise Exception("Missing parameters simID/eids")
            
            ownedBy = request.params.get('ownedBy', None)
            if ownedBy:
                if ownedBy.lower() in ['ck12', 'me', 'community']:
                    kwargs['ownedBy'] = ownedBy
                else:
                    raise ex.NotFoundException((_(u"Value of 'ownedBy' should be in('ck12', 'me', 'community')")).encode("utf-8"))
            
            res = rwe.RWE(self.db).getRWE(pageNum, pageSize, **kwargs)
            result['response']['RWEs'] = [ q for q in res ]
            result['response']['total'] = res.getTotal()
            result['response']['limit'] = res.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception, e:
            log.error('Error in initiating a recommendation[%s]' %(str(e)), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_INITIATE_RECOMMENDATION
            log.error(traceback.format_exc(e))
            return ErrorCodes().asDict(c.errorCode, str(e))
        
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def deleteRWE(self, member, id=None):
        """
            Delete RWE information specified by the id
        """
        try:
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            kwargs = {}
            kwargs['ownerID'] = member.id
            kwargs['memberAdmin'] = False
            
            if u.isMemberAdmin(member):
                kwargs['memberAdmin'] = True
            if not id:
                id = request.POST.get('id', None)
                if not id:
                    raise ex.MissingArgumentException((_(u'RWE ID is missing.')).encode("utf-8"))
            
            result['response'] = rwe.RWE(self.db).remove(id=id, **kwargs)
            return result

        except ex.MissingArgumentException, mae:
            log.debug('deleteRWE: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except Exception as exe:
            c.errorCode = ErrorCodes.CANNOT_DELETE_RWE
            log.debug('deleteRWE: Cannot Delete RWE [%s] due to exception [%s]' %(id, traceback.format_exc()))
            return ErrorCodes().asDict(c.errorCode, 'Cannot Delete RWE for id [%s] ERROR:- %s' %(id, exe))

