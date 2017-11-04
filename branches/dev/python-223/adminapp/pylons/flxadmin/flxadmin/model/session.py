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
# This file originally written by Ravi Gidwani
#
# $Id$

import logging
from pylons import session
import Cookie

LOG = logging.getLogger(__name__)

class SessionManager( object ):
    
    @staticmethod
    def invalidate():
        session.invalidate()
        session['dummy'] = 'dummy'
        session.save()
    
    @staticmethod
    def invalidate_delete():
        session.invalidate()
        session.delete()

    @staticmethod
    def hasKey( key ):
        return key in session
    
    @staticmethod
    def getCookiesFromSession(  ):
        if 'cookies' in session:
            return session['cookies'] 
        else:
            return Cookie.SimpleCookie() 

    @staticmethod
    def storeCookiesToSession( cookies ):
        if not "cookies" in session:
            session['cookies'] = Cookie.SimpleCookie() 
        # read all the cookies API response and add them to the session.

        if not type(cookies) == Cookie.SimpleCookie:
            LOG.error('The cookies parameter passed to storeCookiesToSession(cookies) is not an instance of Cookie.SimpleCookie. Ignoring the passed cookies')
        else:
            session['cookies'].update(cookies)
    
    @staticmethod
    def getDataFromSession( key ):
        if key in session:
            return session[key]
        else:
            return None

    @staticmethod
    def saveDataInSession(dataDict):
        for key,value in dataDict.items():
            session[key] = value
        session.save()

    @staticmethod
    def deleteDataFromSession(keyList):
        for key in keyList:
            try:
                del session[key] 
            except Exception as e:
                continue
        session.save()

    @staticmethod
    def isGuest():
        return not 'user' in session

    @staticmethod
    def getCurrentUser():
        if 'user' in session:
            return session ['user']
        else:
            return None

    @staticmethod
    def isLoggedIn(user):
        return user and session ['user'] and user['id'] == session ['user']['id']
