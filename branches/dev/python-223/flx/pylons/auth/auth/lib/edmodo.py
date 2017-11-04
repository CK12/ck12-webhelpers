from datetime import datetime
from auth.controllers import decorators as d
from auth.lib.base import BaseController
from auth.controllers.errorCodes import ErrorCodes
from oauth2client.client import AccessTokenCredentials
from oauth2client.client import OAuth2WebServerFlow
import httplib2
import json
import urllib
import logging
from pylons import config
log = logging.getLogger(__name__)


class Edmodo(BaseController):
    def __init__ (self,access_token):
        self.token = access_token
        self.connectAPI_prefix = 'https://api.edmodo.com'
    
   
    def _getAccessTokenCredentials(self, token=None):
        if token:
            self.token = token
        credentials = AccessTokenCredentials(self.token,'')
        return credentials

    def _getHTTPObject(self):
        credentials = self._getAccessTokenCredentials()
        http = httplib2.Http()
        _http = credentials.authorize(http)
        return _http

    @d.trace(log)        
    def postToEdmodoLibrary(self,type,itemObj, token=None):
        """
            Method to POST a CK-12 link to user's edmodo library
        """
        add_library_api = '%s/library_items'%(self.connectAPI_prefix)
        if token:
            self.token = token
        log.debug('postToEdmodoLibrary token[%s]'%(self.token))
        log.debug('postToEdmodoLibrary item type[%s]'%(type))
        log.debug('postToEdmodoLibrary item object[%s]'%( str(json.dumps(itemObj))))

        _http = self._getHTTPObject()

        headers = {'Content-type': 'application/json'}
        data = json.dumps({"type": type, "item": itemObj})

        log.debug("postToEdmodoLibrary data: [%s]" % str(data))
        
        info = _http.request(add_library_api,method='POST',body=data, headers = headers)
        return info[1]

    @d.trace(log)
    def getUserEdmodoGroups(self):
        """
           Method to get all the groups a teacher is in.
        """

        get_groups_api = '%s/groups'%(self.connectAPI_prefix)
        _http = self._getHTTPObject()

        info = _http.request(get_groups_api)

        log.debug("getUserEdmodoGroups info: [%s]" % str(info))
        group_list = json.loads(info[1])
        for group in group_list:
            log.debug("getUserEdmodoGroups groupID: [%s]" % str(group['id']))
            info = _http.request("https://api.edmodo.com/group_memberships?group_id=%s"%group['id'])
            log.debug("getUserEdmodoGroups info: [%s]" % str(info))
            group_members = map( lambda x: x['user'],json.loads(info[1]))
            group['members'] = group_members

        return json.dumps(group_list)
        
