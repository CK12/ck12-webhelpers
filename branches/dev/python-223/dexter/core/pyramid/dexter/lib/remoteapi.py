# -- coding: utf-8 --
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
# This file originally written by Shanmuga Bala
#
# $Id$

from datetime import datetime
from multiposthandler import MultipartPostHandler
from urllib import urlencode, quote, unquote
from urllib2 import build_opener, Request
try:
    from webob.multidict import UnicodeMultiDict as MultiDict
except:
    from webob.multidict import MultiDict
from pylons import config
import logging
import simplejson
import os

log = logging.getLogger( __name__ )

class RemoteAPI( object ):

    @staticmethod
    def initConfig():
        global config
        if not config or not config.get('ck12_login_cookie'):
            from dexter.lib.helpers import load_config
            config = load_config()

    @staticmethod
    def getAuthServerTimeout():
        RemoteAPI.initConfig()
        return float(config.get('flx_auth_api_timeout'))

    @staticmethod
    def getNotificationServerURL():
        RemoteAPI.initConfig()
        return config.get('notification_server_url')

    @staticmethod
    def getAuthServerURL():
        RemoteAPI.initConfig()
        return config.get('ck12_auth_prefix')

    @staticmethod
    def getLoginCookie():
        RemoteAPI.initConfig()
        return config.get('ck12_login_cookie')

    @staticmethod
    def getFlxLoginCookie():
        RemoteAPI.initConfig()
        return config.get('flx_login_cookie')

    @staticmethod
    def getInternalAuthSharedDir():
        RemoteAPI.initConfig()
        return config.get('internal_auth_shared_dir')

    @staticmethod
    def getContentAdminUserID():
        RemoteAPI.initConfig()
        return config.get('content_admin_user_id')

    @staticmethod
    def _makeCall(api, server_url, timeout=180.0, auth_pass=None, params_dict=None, method=None, raw_response=False, multipart=False, custom_cookie=None):
        try:
            api = api.encode( 'utf-8' )
            #TODO:look for a better alternative. This was done to prevent double-quoting of URLs
            api = unquote ( api )
            params = None
            url = '%s/%s' % ( server_url , quote( api ) )
            log.info(url)
            if params_dict:
                if multipart:
                    params = params_dict
                else:
                    if isinstance(params_dict,MultiDict):
                        params = urlencode([(k, v) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    elif isinstance(params_dict,dict):
                        #before urlencode, make sure values are utf-8 encoded
                        params = urlencode( [(k, RemoteAPI.to_unicode(v, True)) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    else:
                        params = params_dict

            # if the method is 'GET' the append the parameters to the URL
            if method == 'GET' and params:
                url += '?%s' % params
                params = None

            cookie_pass = None
            # auth_pass only works when you call this func from pyramid 
            if auth_pass is not None:
                login_cookie = RemoteAPI.getLoginCookie()
                if login_cookie and auth_pass and auth_pass.get(login_cookie,None):
                    cookie_pass = '%s=%s' % (login_cookie, auth_pass[login_cookie])

            if cookie_pass:
                req = Request(url, params, {'Cookie': cookie_pass })
            elif custom_cookie:
                req = Request(url, params, {'Cookie': custom_cookie})
            else:
                req = Request(url, params)

            if multipart:
                opener = build_opener(MultipartPostHandler() )
            else:
                opener = build_opener()
            start_time = datetime.today()
            response = opener.open( req, timeout=timeout )
            end_time = datetime.today()
            delta = end_time - start_time
            if raw_response:
                return response
            data = response.read()
            # Make sure we are getting a "response" field in the API response 
            if not "response" in data:
                raise Exception(u'response field missing in API response')
            return simplejson.loads( data )
        except Exception, e:
            log.error('%(url)s API failed' % {"url": url})
            log.exception(e)
            raise e

    @staticmethod
    def to_unicode( obj, encode=False):
         if not isinstance( obj, basestring):
             obj = unicode(obj)
         if encode and isinstance(obj,unicode):
             obj = obj.encode('utf-8')
         return obj

    @staticmethod
    def makeNotificationCall( api, auth_pass=None, params_dict=None , raw_response=True):
        return RemoteAPI._makeCall(api, server_url=RemoteAPI.getNotificationServerURL(), auth_pass=auth_pass, params_dict=params_dict)

    @staticmethod
    def makeRemoteCall( api, server_url, auth_pass=None, params_dict=None , method=None, raw_response=False, multipart=False):
        return RemoteAPI._makeCall(api, server_url, auth_pass=auth_pass, params_dict=params_dict, method=method, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeAuthServiceGetCall( api, params_dict=None, auth_pass=None, custom_cookie=None, raw_response=False ):
        return RemoteAPI._makeCall(api, RemoteAPI.getAuthServerURL(),RemoteAPI.getAuthServerTimeout(),auth_pass=auth_pass,custom_cookie=custom_cookie,params_dict=params_dict,method='POST',raw_response=raw_response)

    @staticmethod
    def makeRemoteCallWithAuth( api, server_url, auth_pass=None, custom_cookie=None, params_dict=None , method=None, raw_response=False, multipart=False):
        #flxCookieName = RemoteAPI.getFlxLoginCookie()
        #filename = RemoteAPI._makeInternalAuthFile()
        #custom_cookie = '%s=%s' % (flxCookieName, filename)
        return RemoteAPI._makeCall(api, server_url, auth_pass=auth_pass, custom_cookie=custom_cookie, params_dict=params_dict, method=method, raw_response=raw_response, multipart=multipart)


    @staticmethod
    def _makeInternalAuthFile():
        prefix = RemoteAPI.getInternalAuthSharedDir()
        
        #make sure directory exists
        if not os.path.exists(prefix):
            os.mkdir(prefix, 0755)
        
        #make sure filename doesn't exist in dir
        filename = prefix + "/" + RemoteAPI._create_timestamp()
        while os.path.exists(filename):
            filename = prefix + "/" + RemoteAPI._create_timestamp()

        f = open(filename, "w")
        try:
            f.write(RemoteAPI.getContentAdminUserID())
        except Exception as e:
            log.error(e)
        finally:
            f.close()
            
        return os.path.basename(filename)
        
    @staticmethod
    def _create_timestamp():
        return datetime.now().strftime("%d%H%M%S%f")
                    
