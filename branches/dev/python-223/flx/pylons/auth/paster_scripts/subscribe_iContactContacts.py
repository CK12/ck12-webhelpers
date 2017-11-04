"""
script to subscribed all Unsubscribe iContact contacts into particular list
"""
import logging
import os
import sys
import datetime
import time

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from pylons import config    
from auth.lib.icontact import iContact
from auth.model import api
# from auth.controllers import extAuth

LOG_FILENAME = "/tmp/icontact_subscribelist.log"
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
handler.setFormatter(formatter)
log.addHandler(handler)

class SubscribeContacts(object):

    def getList(self, fileName):
        return [ line.strip() for line in open(fileName) ]

    def subscribeContactsList(self):
        """subscribe all contacts into list and add data into designation field
        which is used in segment
        """

        """
        doNotContact = self.getList('/tmp/donotcontact.out')
        unsubscribed = self.getList('/tmp/unsubscribed.out')
        skipContacts = set(doNotContact + unsubscribed)
        """
        skipContacts = set([])
        listId = config.get('vic_contact_list_id')
        count = 0
        offset = 0
        limit = 300
        ic = iContact()
        data = ic.getUnsubscribedContacts(offset=offset, limit=limit)
        contacts = data.get('contacts', None)
        while contacts:
            log.debug('Contact count: %d, offset: %d, limit: %d' % (len(contacts), offset, limit))
            contactDict = {}
            for contact in contacts:
                contactId = contact['contactId']
                if contactId not in skipContacts:
                    log.debug('subscribeContactsList: processing contact[%s]' % contactId)
                    contactDict[contact['email']] = contactId
                else:
                    log.debug('subscribeContactsList: skipping contact[%s]' % contactId)
            #log.debug("Contact Dictionary {'email':'contactID'} as %s" % contactDict)

            all_params = []
            update_params = []
            batch_count = 0
            for email in contactDict:
                contactId = contactDict[email]
                member = api.getMemberByEmail(email=email)
                log.debug("member record: %s"%member)
                if member:
                    memberRole = api.getMemberHasRoles(memberID=member.id)
                    roleName = memberRole[0].role.name
                    params = {
                        "contactId": int(contactId),
                        "designation": roleName,
                        "ck12_status": "normal",
                    }
                    update_params.append(params)

                subscription_params = {
                                      "status": "normal", #normal, pending, unsubscribed 
                                      "listId": int(listId),
                                      "contactId": int(contactId),
                                      }
                log.debug('params: %s' % subscription_params)
                all_params.append(subscription_params)
                count +=1
                batch_count += 1
            if len(update_params) > 0:
                log.debug('update_params%s' % update_params)
                updated_data = ic.updateContacts(params=update_params)
                log.debug("Updated icontact with designation record: %s" % str(updated_data))
            if len(all_params) > 0:
                log.debug('all_params%s' % all_params)
                subscription_data = ic.createSubscription(params=all_params)
                log.debug('Member contact subscription record created on iContact with details as %s' % str(subscription_data))
            log.debug('Processed contact count: %d' % count)
            #
            #  Slow down to prevent hitting minute and hourly limit.
            #
            offset += limit
            if ( ( offset + 3000 ) % 3000 ) == 0:
                time.sleep(80)
            data = ic.getUnsubscribedContacts(offset=offset, limit=limit)
            contacts = data.get('contacts', None)

        return {"No. of contacts subscribed are":count}
    
    def newSubscribeContactsList(self, startDate, endDate):
        """
        Function to get startDate,endDate as input parameter 
        and upload newly created member records into iContact
        """
        count = 0
        offset = 0
        pageNum = 1
        pageSize = 100
        listId = config.get('vic_contact_list_id')
        members = api.getMembers(pageNum=pageNum, pageSize=pageSize, startDate=startDate, endDate=endDate)
        ic = iContact()
        while members:
            memberInfoList = []
            log.debug('No. of Members: %s, pageNum: %d, pageSize: %d' % (len(members), pageNum, pageSize))
            
            for member in members:
                memberRole = api.getMemberHasRoles(memberID=member.id)
                if memberRole:
                    roleName = memberRole[0].role.name
                else:
                    roleName = None
            
                params = {
                          'ck12_status': 'normal', #normal,bounced,donotcontact,pending,invitable,deleted
                          'fax': member.fax,
                          'suffix': None,
                          'firstName': member.givenName, 
                          'lastName': member.surname,
                          'email': member.email,
                          'phone': member.phone,
                          'prefix': member.suffix,
                          }
                if roleName:
                    params['designation'] = roleName
                
                memberInfoList.append(params)
                
                count += 1
            
            data = ic.createContact(params=memberInfoList)
            log.debug("Member contact record created on iContact:: %s " % (data))
            log.debug('Processed contact count: %d' % count)
            
            contacts = data.get('contacts', None)
            if contacts:
                subscriptionInfoList = []
                for contact in contacts:
                    contactId = contact.get('contactId', None)
                    subscription_params = {
                                          'status': 'normal', #normal, pending, unsubscribed 
                                          'listId': int(listId),
                                          'contactId': int(contactId),
                                          }
                    subscriptionInfoList.append(subscription_params)
                subscription_data = ic.createSubscription(params=subscriptionInfoList)
                log.debug('Member contact subscription record created on iContact with details as %s' % str(subscription_data))

            #
            #  Slow down to prevent hitting minute and hourly limit.
            #
            offset += pageSize
            if ( ( offset + 3000 ) % 3000 ) == 0:
                time.sleep(80)
            pageNum += 1
            members = api.getMembers(pageNum=pageNum, pageSize=pageSize, startDate=startDate, endDate=endDate)
            
            
        return {"No. of new member contacts subscribed are":count}

if __name__ == "__main__":
    c = SubscribeContacts()
    c.subscribeContactsList()
