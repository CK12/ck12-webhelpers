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
# This file originally written by Ravi Gidwani
#
# $Id: remoteapi.py 15925 2012-02-24 09:52:44Z ravi $

#from cookielib import CookieJar
from pylons.i18n.translation import _
from datetime import datetime
from multipartpost import MultipartPostHandler
from sts.lib.errorcodes import ErrorCodes
from pylons import config
from urllib import urlencode, quote, unquote
from urllib2 import build_opener, HTTPCookieProcessor,Request
try:
    from webob.multidict import UnicodeMultiDict as MultiDict
except:
    from webob.multidict import MultiDict
import logging
import json
import Cookie
import time
from httplib import BadStatusLine

log = logging.getLogger( __name__ )

class RemoteAPIException(Exception):
    pass

class RemoteAPIStatusException(Exception):
    '''
    Exception raised when the remote API returns a response
    with a status_code other than 0 i.e 'OK'
    '''
    def __init__(self,status_code, api_message = None, response_data = None):
        self.status_code = status_code
        self.api_message = api_message
        self.response_data = response_data
        self.error = ErrorCodes.get(status_code)
        if self.error:
            message = 'API returned status %s' % self.error['name']
        else:
            message = 'API returned unknown status code = %s' % status_code
        Exception.__init__(self, message)

class RemoteAPI( object ):

    @staticmethod
    def initConfig():
        global config
        if not config or not config.get('image_use_satellite'):
            from sts.lib.helpers import load_pylons_config
            config = load_pylons_config()

    @staticmethod
    def getImageServerTimeout():
        RemoteAPI.initConfig()
        return float(config.get('image_satellite_server_timeout', 300))

    @staticmethod
    def getImageServerURL():
        RemoteAPI.initConfig()
        return config.get('image_satellite_server')

    @staticmethod
    def getHomeworkpediaServerURL():
        RemoteAPI.initConfig()
        return config.get('homeworkpedia_server')

    @staticmethod
    def getTaxonomyServerURL():
        RemoteAPI.initConfig()
        return config.get('taxonomy_server')

    @staticmethod
    def getLoginCookie():
        RemoteAPI.initConfig()
        return config.get('ck12_login_cookie')

    @staticmethod
    def getAuthServerTimeout():
        RemoteAPI.initConfig()
        return float(config.get('remote_server_timeout'))

    @staticmethod
    def getAuthServerURL():
        RemoteAPI.initConfig()
        return config.get('ck12_login_prefix')

    @staticmethod
    def _makeCall(server_url, api, timeout, params_dict=None, method=None, raw_response=False, multipart=False, failIfNonZero=True, auth_pass=None, custom_cookie=None):
        responseReceived = False
        try:
            from sts.lib.helpers import safe_encode
            api = api.encode( 'utf-8' )
            #TODO:look for a better alternative. This was done to prevent double-quoting of URLs
            api = unquote ( api )
            params = None
            if api.startswith('/'):
                api = api.lstrip('/')
            url = '%s/%s' % ( server_url , quote( api ) )
            if params_dict:
                if multipart:
                    params = params_dict
                else:
                    # if the params_dict is already unicode, no to_unicode needed
                    # else to_unicode the values
                    # Note: we want to support parameters passed as following:
                    # {"var": ["value", "value2"], "var2": "yetanothervalue"} 
                    # so we loop and make sure values of type "list" are iterated
                    if isinstance(params_dict,MultiDict):
                        params = urlencode([(k, v) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    elif isinstance(params_dict,dict):
                        #before urlencode, make sure values are utf-8 encoded
                        params = urlencode( [(k, safe_encode(v)) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    else:
                        params = params_dict

            # if the method is 'GET' then append the parameters to the URL
            if method == 'GET' and params:
                url += '?%s' % params
                # clean out params, as urllib2.Request() needs it only for non 'GET' requests
                params = None

            cookie_pass = None
            # auth_pass only works when you call this func from pylons  
            if auth_pass is not None:
                login_cookie = RemoteAPI.getLoginCookie()
                log.debug("login_cookie: %s, auth_pass.get(login_cookie): %s" % (login_cookie, auth_pass.get(login_cookie)))
                if login_cookie and auth_pass and auth_pass.get(login_cookie,None):
                    cookie_pass = '%s=%s' % (login_cookie, auth_pass[login_cookie])

            log.debug("cookie_pass: %s" % cookie_pass)
            if cookie_pass:
                req = Request(url, params, {'Cookie': cookie_pass })
            elif custom_cookie:
                req = Request(url, params, {'Cookie': custom_cookie})
            else:
                req = Request(url, params)
            if multipart:
                opener = build_opener(MultipartPostHandler( ) )
            else:
                opener = build_opener( HTTPCookieProcessor( ) )
            start_time = datetime.today()
            response = opener.open( req, timeout=timeout )
            end_time = datetime.today()
            delta = end_time - start_time
            #simple_cookies = RemoteAPI.create_simple_cookie(cj)
            #log.debug('Cookies from API: %s' % simple_cookies)
            #SessionManager.storeCookiesToSession( simple_cookies )
            log.info( "[%s.%ss] %s  " % ( delta.seconds, delta.microseconds%100 , url ) )

            if raw_response:
                return response

            data = response.read()
            try:
                data = json.loads( data )
            except ValueError,e:
                data = None
            # Make sure:
            # 0) we got a valid json response
            # 1) we are getting a "response" field in the API response 
            # 2) status is 0 i.e OK
            # else raise RemoteAPIStatusException
            if not data:
                raise RemoteAPIException((_(u'API did not return a valid JSON')).encode("utf-8"))

            if  'responseHeader' in data and 'status' in data['responseHeader']:
                responseReceived = True
                status = data['responseHeader']['status']
                if not status == ErrorCodes.OK:
                    api_message = data.get('response').get('message')
                    if failIfNonZero:
                        raise RemoteAPIStatusException(status, api_message, response_data = data)
                    else:
                        log.warn('Got non-zero status code in JSON response: %d, %s' % (status, api_message))

            if not "response" in data:
                raise RemoteAPIException((_(u'response field missing in API response' )).encode("utf-8"))

            return data
        except RemoteAPIException, e:
            raise e
        except RemoteAPIStatusException, e:
            log.debug('API returned status code(%s)=%s' % (e.status_code,ErrorCodes.get_description(e.status_code)))
            log.debug('API returned with message: %s' % e.api_message)
            raise e
        except BadStatusLine, e:
            log.error( '%s API failed' % ( url ))
            log.exception(e)
            log.debug('args=%s' % e.args)
            log.debug('message=%s' % e.message)
            log.debug('line=%s' % e.line)
            raise e
        except Exception, e:
            log.error( '%s API failed' % ( url ))
            log.exception(e)
            raise e

    @staticmethod
    def makeHomeworkpediaGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getHomeworkpediaServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeTaxonomyGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getTaxonomyServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeImageGetCall( api, params_dict=None, failIfNonZero=True ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getImageServerTimeout(),params_dict=params_dict,method='GET', failIfNonZero=failIfNonZero)

    @staticmethod
    def makeImageCall( api, params_dict=None, raw_response=False, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getImageServerTimeout(),params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeAuthServiceGetCall( api, params_dict=None, auth_pass=None, custom_cookie=None, raw_response=False ):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, RemoteAPI.getAuthServerTimeout(),params_dict=params_dict,method='POST',raw_response=raw_response)
    @staticmethod
    def create_simple_cookie(cookiejar):
        "Returns a Cookie.SimpleCookie based on cookielib.CookieJar."
        sc = Cookie.SimpleCookie()
        attrs = ('expires', 'path', 'comment', 'domain', 'secure', 'version')
        # Doesn't look like Cookie.SimpleCookie allows for nonstandard attributes, so
        # we only deal with the standard ones.
        for path_dict in cookiejar._cookies.values(): #iterate through paths
            for cookie_dict in path_dict.values():
                for name, cookie in cookie_dict.items():
                    sc[name] = cookie.value
                    for attr in attrs:
                        if getattr(cookie, attr):
                            if attr == 'expires':
                                # Cookies thinks an int expires x seconds in future,
                                # cookielib thinks it is x seconds from epoch,
                                # so doing the conversion to string for Cookies
                                fmt = '%a, %d %b %Y %H:%M:%S GMT'
                                sc[name]['expires'] = time.strftime(fmt,
                                                        time.gmtime(cookie.expires))
                            else:
                                sc[name][attr] = getattr(cookie, attr)
        return sc

