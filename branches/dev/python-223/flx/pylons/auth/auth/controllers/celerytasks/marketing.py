import json
import logging
from urllib import quote

from auth.model import api
from auth.controllers.celerytasks.generictask import GenericTask
from auth.lib.icontact import iContact
from auth.lib import app_globals as g

log = logging.getLogger(__name__)

class VocusUpdater(GenericTask):
    """
        Update Vocus/iContact when a new user joins.
    """
    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialise 
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'data-auth'

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)

        memberID = int(kwargs['memberID'])
        email = kwargs.get('email')
        firstName = kwargs.get('firstName')
        roleName = kwargs.get('roleName')
        status = kwargs.get('status')
        contactId = kwargs.get('contactId')
        isExisting = kwargs.get('isExisting')

        data = None
        if '@partners.ck12.org' in email:
            #
            #  Do not create contacts for those who
            #  have fake emails.
            #
            log.debug('newVocusContact: skip email[%s]' % email)
            return data

        params = {
                  'ck12_status': status or 'normal', #normal,bounced,donotcontact,pending,invitable,deleted
                  'city': kwargs.get('city',None),
                  #'fax': member.fax,
                  'suffix': None,
                  'firstName': firstName, 
                  #'lastName': member.surname,
                  'memberID': memberID,
                  'email': email,
                  'designation': roleName,
                  #'street': kwargs.get('street',None),
                  #'street2': kwargs.get('street2',None),
                  'postalCode': kwargs.get('postalCode',None),
                  'state': kwargs.get('state',None),
                  #'business': kwargs.get('business',None),
                  #'phone': member.phone,
                  #'prefix': member.suffix,
                  }

        ic = iContact(extConfig=self.config)
        if isExisting:
            if not contactId:
                data = ic.getContactByEmail(email=email)
                contacts = data.get('contacts', None)
                if contacts:
                    contactId = contacts[0]['contactId']
                log.debug('newVocusContact: contactId[%s]' % contactId)
            data = ic.updateContact(contactId, params=params)
            log.debug('newVocusContact: Member contact record updated on iContact with details as %s' % str(data))
        else:
            data = ic.createContact(params=params)
            log.debug('newVocusContact: Member contact record created on iContact with details as %s' % str(data))
            
            contacts = data.get('contacts', None)
            if contacts:
                subscription_params = {
                                      'status': kwargs.get('subscription_status','normal'), #normal, pending, unsubscribed 
                                      'listId': self.config.get('vic_contact_list_id'),
                                      'contactId': contacts[0]['contactId'],
                                      }
                subscription_data = ic.createSubscription(params=subscription_params)
                log.debug('newVocusContact: Member contact subscription record created on iContact with details as %s' % str(subscription_data))
                data.update(subscription_data)
                log.debug('newVocusContact: Updated Member contact and subscription record on iContact is as %s' % str(data))
            
        self.userdata = json.dumps(data) 
        self.updateTask()

        return data

class HubSpotUpdater(GenericTask):
    """
        Update HubSpot when a new user joins.
    """
    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialise 
        GenericTask.__init__(self, **kwargs)
        self.routing_key = 'data-auth'

    def run(self, **kwargs):
        GenericTask.run(self, **kwargs)

        memberID = int(kwargs['memberID'])
        member = api.getMemberByID(id=memberID)
        optout = kwargs.get('optout')

        from hapi.forms import FormSubmissionClient

        hubID = self.config.get('hs_hub_id')
        #formURL = self.config.get('hs_form_url')
        #formAPI = self.config.get('hs_form_api')
        formGUID = self.config.get('hs_form_guid')

        roleDict, roleNameDict = g.getAuthMemberRoles()
        teacher = roleNameDict['teacher']
        role = 'student'
        for r in member.roles:
            if r.roleID == teacher:
                role = 'teacher'
                break

        name = quote(member.fix().name.encode('utf-8'))
        email = quote(member.email.encode('utf-8'))
        creationTime = quote(str(member.creationTime))
        loginTime = quote(str(member.loginTime))
        data = 'name=%s&email=%s&roleID=%s&date_of_registration=%s&last_active=%s' % (name, email, role, creationTime, loginTime)
        if optout is not None:
            data += '&optout=%s' % optout

        hsContext = {}
        hsutkCookie = kwargs.get('hubspotutk')
        if hsutkCookie:
            hsContext['hutk'] = hsutkCookie
            jContext = json.dumps(hsContext)
            data += '&hs_context=%s' % jContext

        api_key = self.config.get('hs_api_key')
        log.info('_newHubSpotContact: api_key [%s]' % api_key)
        fsc = FormSubmissionClient(api_key=api_key)
        options = {}
        log.info('_newHubSpotContact: hubID[%s] formGUID[%s] data[%s]' % (hubID, formGUID, data))
        result = fsc.submit_form(hubID, formGUID, data, **options)
        log.info('_newHubSpotContact: result[%s]' % result)

        self.userdata = json.dumps(result) 
        self.updateTask()

        return result



