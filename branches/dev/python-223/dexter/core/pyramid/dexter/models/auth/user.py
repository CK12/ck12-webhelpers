#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Deepak Babu
#
# $Id: user.py 26270 2013-05-08 09:35:15Z chetan $

from dexter.models.generic.ck12model import CK12Model
from dexter.lib.remoteapi import RemoteAPI
import json
import logging

LOG = logging.getLogger(__name__)

class User( CK12Model ):
    AUTH_TYPE_CK12 = 'ck-12'
    AUTH_TYPE_GOOGLE = 'google'
    AUTH_TYPE_FB = 'facebook'
    
    @classmethod
    def fromValues(cls, firstName, lastName, email, token, state="activated", authType=AUTH_TYPE_CK12 ):
        new_user = cls()
        new_user['firstName'] = firstName
        new_user['lastName'] = lastName
        new_user['email'] = email
        new_user['token'] = token
        new_user['state'] = state
        new_user['authType'] = authType
        new_user['gender'] = ''
        return new_user


class UserManager( object ):
    
    @staticmethod
    def getUser( request, id, auth_cookies ):
        if id:
            data = RemoteAPI.makeAuthServiceGetCall( 'get/member/%s' % id, custom_cookie=auth_cookies )
            if "response" in data:
                user = User( data['response'] )
                return user
            else:
                raise Exception('get/member API did not returned a response field')

        
    @staticmethod
    def login(username, password, authType=User.AUTH_TYPE_CK12):
        """ Login user with username & password, and returns auth cookies which have to be used 
            for further auth API calls      
        """

        api_error_msg = "login API response not as excepted"
        auth_cookies = None
        try:
            data = RemoteAPI.makeAuthServiceGetCall( 'login/member', 
                 {'login': username, 'token': password, 'authType': authType}, raw_response=True)
            auth_cookies = data.headers.getheader('Set-Cookie')
            result = data.read()
            result = json.loads(result)
            if not 'response' in result or not 'id' in result['response']:
                raise Exception(api_error_msg)
        except Exception as e:
            raise e
        return auth_cookies

    @staticmethod
    def logout(request, auth_cookies):
        RemoteAPI.makeAuthServiceGetCall('logout/member', auth_pass=auth_cookies) 

