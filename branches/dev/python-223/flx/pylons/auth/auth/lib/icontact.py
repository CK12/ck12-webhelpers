import logging

from http import Http
from pylons import config

log = logging.getLogger(__name__)

class iContact:

    urlPrefix = None
    appUsername = None
    appPassword = None
    appID = None
    appVersion = None
    companyID = None
    profileID = None
    http = None

    def __init__(self, urlPrefix=None, appUsername=None, appPassword=None, appID=None, appVersion=None, extConfig=None):
        myConfig = config
        if extConfig:
            myConfig = extConfig
        self.urlPrefix = urlPrefix if urlPrefix else myConfig.get('vic_url_prefix')
        self.appUsername = appUsername if appUsername else myConfig.get('vic_app_username')
        self.appPassword = appPassword if appPassword else myConfig.get('vic_app_password')
        self.appID = appID if appID else myConfig.get('vic_app_id')
        self.companyID = myConfig.get('vic_company_id', None)
        self.profileID = myConfig.get('vic_profile_id', None)
        self.appVersion = appVersion if appVersion else myConfig.get('vic_app_version')
        if True:
            headers = {
                'API-Version': self.appVersion,
                'API-Appid': self.appID,
                'API-Username': self.appUsername,
                'API-Password': self.appPassword,
            }
        else:
            headers = [
                ('API-Version', self.appVersion),
                ('API-Appid', self.appID),
                ('API-Username', self.appUsername),
                ('API-Password', self.appPassword),
            ]
        self.http = Http(external=True, headers=headers)

    def _getCompanyID(self):
        data = self.call('companyID')
        log.debug('_getCompanyID: data[%s]' % data)
        accounts = data.get('accounts', None)
        log.debug('_getCompanyID: accounts%s' % accounts)
        self.companyID = accounts[0]['accountId']
        log.debug('_getCompanyID: companyID[%s]' % self.companyID)

    def _getProfileID(self):
        data = self.call('profileID')
        log.debug('_getProfileID: data[%s]' % data)
        profiles = data.get('clientfolders', None)
        log.debug('_getProfileID: profiles%s' % profiles)
        self.profileID = profiles[0]['clientFolderId']
        log.debug('call: profileID[%s]' % self.profileID)

    def call(self, command, method='GET', params=None, offset=None, limit=None):
        if command == 'companyID':
            url = '%s/a/' % self.urlPrefix
        elif command == 'profileID':
            if not self.companyID:
                self._getCompanyID()
            url = '%s/a/%s/c/' % (self.urlPrefix, self.companyID)
        else:
            if not self.profileID:
                self._getProfileID()
            url = '%s/a/%s/c/%s/%s' % (self.urlPrefix, self.companyID, self.profileID, command)
        if offset is not None and limit is not None:
            if '?' in url:
                c = '&'
            else:
                c = '?'
            url = '%s%soffset=%s&limit=%s' % (url, c, offset, limit)

        log.info('call: method[%s] url[%s]' % (method, url))
        data = self.http.call(url, method=method, params=params, useCookies=False)
        return data

    def getCompanyID(self):
        data = self.call(command='companyID')
        return data

    def getProfileID(self):
        data = self.call(command='profileID')
        return data
    
    def getSubscriptions(self):
        data = self.call(command='subscriptions')
        return data
    
    def getSubscriptionByID(self, id):
        data = self.call(command='subscriptions/%s' % id)
        return data
    
    def getLists(self):
        data = self.call(command='lists')
        return data
    
    def getListByID(self, id):
        data = self.call(command='lists/%s' % id)
        return data
    
    def getListByName(self, name):
        data = self.call(command='lists?name=%s' % name)
        return data

    def getContacts(self):
        data = self.call(command='contacts')
        return data
    
    def getUnsubscribedContacts(self, status='unlisted', offset=None, limit=None):
        data = self.call(command='contacts?status=%s' % status, offset=offset, limit=limit)
        return data

    def getContactByID(self, id):
        data = self.call(command='contacts/%s' % id)
        return data

    def getContactByEmail(self, email):
        data = self.call(command='contacts?email=%s' % email)
        return data

    def createSubscription(self, params=None):
        if params and type(params) != list:
            params = [ params ]
            log.debug('createSubscription: params%s' % params)
        data = self.call(command='subscriptions', method='POST', params=params)
        log.debug('createSubscription: data[%s]' % data)
        return data
    
    def updateSubscription(self, id, params=None):
        log.debug('updateSubscription: params%s' % params)
        data = self.call(command='subscriptions/%s' % id, method='POST', params=params)
        log.debug('updateSubscription: data[%s]' % data)
        return data
    
    def createList(self, params=None):
        if params and type(params) != list:
            params = [ params ]
            log.debug('createList: params%s' % params)
        data = self.call(command='lists', method='POST', params=params)
        log.debug('createList: data[%s]' % data)
        return data
    
    def updateList(self, id, params=None):
        log.debug('updateList: params%s' % params)
        data = self.call(command='lists/%s' % id, method='POST', params=params)
        log.debug('updateList: data[%s]' % data)
        return data
    
    def createContact(self, params=None):
        if params and type(params) != list:
            params = [ params ]
            log.debug('createContact: params%s' % params)
        data = self.call(command='contacts', method='POST', params=params)
        log.debug('createContact: data[%s]' % data)
        return data

    def updateContact(self, id, params=None):
        log.debug('updateContact: params%s' % params)
        data = self.call(command='contacts/%s' % id, method='POST', params=params)
        log.debug('updateContact: data[%s]' % data)
        return data

    def updateContacts(self, params=None):
        data = self.call(command='contacts', method='POST', params=params)
        return data

    def deleteContactByID(self, id):
        data = self.call(command='contacts/%s' % id, method='DELETE')
        return data

    def deleteContactByEmail(self, email):
        data = self.call(command='contacts?email=%s' % email, method='DELETE')
        return data

    def test(self, url, method='GET', params=None):
        data = self.http.call(url, method=method, params=params)
        return data
