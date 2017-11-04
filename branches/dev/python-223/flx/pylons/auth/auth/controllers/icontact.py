import json
import logging

from pylons import request
from pylons.i18n.translation import _ 

from auth.controllers import decorators as d
from auth.controllers import user as u
from auth.controllers import extAuth
from auth.model import exceptions as ex
from auth.lib.base import BaseController
from auth.lib.icontact import iContact

from auth.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class IcontactController(BaseController):

    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def getCompanyID(self, member):
        if not u.isMemberAdmin(member):
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        data = ic.getCompanyID()
        log.debug('getCompanyID: data[%s]' % data)
        result['response'] = data
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, [])
    @d.trace(log, ['member'])
    def getProfileID(self, member):
        if not u.isMemberAdmin(member):
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        log.debug('getProfileID: iContact[%s]' % ic)
        data = ic.getProfileID()
        log.debug('getProfileID: data[%s]' % data)
        result['response'] = data
        return result
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def getSubscription(self, member, id=None):
        if not u.isMemberAdmin(member) and id != member.id:
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        log.debug('getSubscriptions: id[%s]' % id)
        if id:
            data = ic.getSubscriptionByID(id)
        else:
            data = ic.getSubscriptions()
        log.debug('getSubscriptions: data[%s]' % data)
        result['response'] = data
        return result
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def getList(self, member, id=None):
        if not u.isMemberAdmin(member) and id != member.id:
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        log.debug('getList: id[%s]' % id)
        if id:
            data = ic.getListByID(id)
        else:
            data = ic.getLists()
        log.debug('getLists: data[%s]' % data)
        result['response'] = data
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def getContact(self, member, id=None):
        if not u.isMemberAdmin(member) and id != member.id:
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        log.debug('getContacts: id[%s]' % id)
        if id:
            data = ic.getContactByID(id)
        else:
            data = ic.getContacts()
        log.debug('getContacts: data[%s]' % data)
        result['response'] = data
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['email'])
    @d.trace(log, ['member', 'email'])
    def getContactByEmail(self, member, email):
        """
        if not u.isMemberAdmin(member) and email != member.email:
            raise ex.UnauthorizedException((_(u'Only admin can view other members.')).encode("utf-8"))
        """

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        ic = iContact()
        log.debug('getContactByEmail: email[%s]' % email)
        data = ic.getContactByEmail(email)
        log.debug('getContactByEmail: data[%s]' % data)
        result['response'] = data
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createSubscription(self, member):
        """
        Function to create icontact list subscription
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        params = {
                  'status': request.params.get('status','normal'),
                  'listId': request.params.get('listId'),
                  'contactId': request.params.get('contactId'),
                  }
        
        ic = iContact()
        data = ic.createSubscription(params=params)
        log.debug('iContact List Subscription created with details as %s' % str(data))

        result['response'] = data
        return result
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateSubscription(self, member, id=None):
        """
        Function to update subscription record
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        
        params = {
                  'status': request.params.get('status','normal')
                  }
        
        subscriptionId = id
        listId = None
        contactId = None
        ic = iContact()
        if not id:
            listId = request.params.get('listId')
            contactId = request.params.get('contactId')
            if listId and contactId:
                subscriptionId = listId +'_'+ contactId
        data = ic.updateSubscription(subscriptionId, params=params)
        log.debug('List subscription record updated on iContact with details as %s' % str(data))
        result['response'] = data
        return result
    
    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createList(self, member):
        """
        Function to create icontact list
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        params = {
                  'name': request.params.get('name'),
                  'emailOwnerOnChange': request.params.get('emailOwnerOnChange',1),
                  'welcomeOnManualAdd': request.params.get('welcomeOnManualAdd',1),
                  'welcomeOnSignupAdd': request.params.get('welcomeOnSignupAdd',1), 
#                   'welcomeMessageId': 1,
                  'description': request.params.get('description',None),
                  'publicname': request.params.get('name'),
                  }
        
        ic = iContact()
        data = ic.createList(params=params)
        log.debug('iContact List created with details as %s' % str(data))

        result['response'] = data
        return result
    
    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateList(self, member, id=None):
        """
        Function to update List record
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        
        params = {
                  'name': request.params.get('name'),
                  'emailOwnerOnChange': request.params.get('emailOwnerOnChange',1),
                  'welcomeOnManualAdd': request.params.get('welcomeOnManualAdd',1),
                  'welcomeOnSignupAdd': request.params.get('welcomeOnSignupAdd',1), 
#                   'welcomeMessageId': 1,
                  'description': request.params.get('description',None),
                  'publicname': request.params.get('name'),
                  }
        
        listId = id
        ic = iContact()
        if not id:
            name = request.params.get('name')
            if name:
                data = ic.getListByName(name=name)
                lists = data.get('lists', None)
                if lists:
                    listId = lists[0]['listId']
                log.debug('listId: [%s]' % listId)
        data = ic.updateList(listId, params=params)
        log.debug('IContact List record updated with details as %s' % str(data))
        result['response'] = data
        return result
    
    
    @d.jsonify()
    @d.checkAuth(request, False, False)
    @d.trace(log, ['member'])
    def createContact(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        status = request.params.get('status',None)
        extAuthInstance = extAuth.ExtAuthController()
        data = extAuthInstance._newVocusContact(member,status=status)
        result['response'] = data
        return result

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def updateContact(self, member, id=None):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        status = request.params.get('status',None)
        email = None
        if not id:
            email = member.email
        extAuthInstance = extAuth.ExtAuthController()
        data = extAuthInstance._newVocusContact(member, email=email,contactId=id,status=status)
        result['response'] = data
        return result

    @d.jsonify()
    @d.trace(log)
    def test(self):
        url = request.params.get('url')
        log.info('test: url[%s]' % url)
        #params = request.params.get('params')
        #log.info('test: params[%s]' % params)
        ic = iContact()
        data = ic.test(url)
        log.info('test: data[%s]' % data)
        try:
            data = json.loads(data)
        except Exception:
            pass
        return data
