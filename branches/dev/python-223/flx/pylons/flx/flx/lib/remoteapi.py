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

from cookielib import Cookie, CookieJar
from pylons.i18n.translation import _ 
from datetime import datetime
from multipartpost import MultipartPostHandler
from flx.lib.ck12.errorcodes import ErrorCodes
from pylons import config, session, request
from urllib import urlencode, quote, unquote
from urllib2 import build_opener, HTTPCookieProcessor, Request
try:
    from webob.multidict import UnicodeMultiDict as MultiDict
except:
    from webob.multidict import MultiDict
import logging
import json,os
#import Cookie
import time
from httplib import BadStatusLine
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options
from flx.lib.helpers import getConfigOptionValue
from flx.lib.ck12.exceptions import RemoteAPIStatusException,\
    RemoteAPIException

log = logging.getLogger( __name__ )

cache_opts = {
            'cache.type': getConfigOptionValue('beaker.cache.type'),
            'cache.data_dir': getConfigOptionValue('beaker.cache.data_dir'),
            'cache.url': getConfigOptionValue('beaker.cache.url'),
            }
log.debug("Cache opts: %s" % cache_opts)
cache = CacheManager(**parse_cache_config_options(cache_opts))

class RemoteAPI( object ):

    @staticmethod
    def initConfig():
        global config
        if not config or not config.get('image_use_satellite'):
            from flx.lib.helpers import load_pylons_config
            config = load_pylons_config()

    @staticmethod
    def _restoreCookiesFromSession(cj, fromReq=False):
        """
            Copy cookies from session to the request for remote server
        """
        log.debug('_restoreCookiesFromSession: session[%s]' % session)
        key = config.get('ck12_login_cookie')
        if 'cookies' in session:
            for cookie in session['cookies']:
                if cookie.name == key:
                    cj.set_cookie(cookie)
                    log.info("Copied cookie: %s" % cookie.name)
        if fromReq:
            log.info("_restoreCookiesFromSession: cookies[%s]" % request.cookies)
            for name in request.cookies.keys():
                value = request.cookies[name]
                cookie = Cookie(version=0,
                                name=name,
                                value=value,
                                port=None,
                                port_specified=False,
                                domain=config.get('beaker.session.cookie_domain'),
                                domain_specified=False,
                                domain_initial_dot=False,
                                path='/',
                                path_specified=True,
                                secure=False,
                                expires=None,
                                discard=True,
                                comment=None,
                                comment_url=None,
                                rest={'HttpOnly': None},
                                rfc2109=False)
                cj.set_cookie(cookie)
                log.info("Copied cookie: %s" % cookie.name)
        return cj

    @staticmethod
    def _storeCookiesToSession(cj):
        """
            Store cookies from remote server response to session
        """
        if not "cookies" in session:
            session['cookies'] = []

        key = config.get('ck12_login_cookie')
        # read all the cookies API response and add them to the session.
        for index, cookie in enumerate(cj):
            if cookie.name == key:
                session['cookies'].append(cookie)
                log.debug("Saved cookie: %s" % cookie.name)
        session.save()

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
    def getAuthServerURL():
        RemoteAPI.initConfig()
        return config.get('flx_auth_api_server')
    
    @staticmethod
    def _makeCall(server_url, api, timeout, params_dict=None, method=None, raw_response=False, multipart=False, failIfNonZero=True, sendCookie=False, custom_cookies=None):
        responseReceived = False
        try:
            from flx.lib.helpers import safe_decode
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
                        params = urlencode( [(k, safe_decode(v)) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    else:
                        params = urlencode(params_dict)
               
            
            # if the method is 'GET' then append the parameters to the URL
            if method == 'GET' and params:
                url += '?%s' % params
                # clean out params, as urllib2.Request() needs it only for non 'GET' requests
                params = None
            #if params and not multipart:
            #    params = urlencode(params)

            if multipart:
                opener = build_opener(MultipartPostHandler( ) )
            else:
                if not sendCookie:
                    opener = build_opener(HTTPCookieProcessor())
                else:
                    cj = CookieJar()
                    RemoteAPI._restoreCookiesFromSession(cj, fromReq=True)
                    opener = build_opener(HTTPCookieProcessor(cj))
                headers = [
                    ('Accept', 'application/json, */*; q=0.01'),
                    ('Host', 'www.ck12.org'),
                    ('Content-Type', 'application/json; charset=UTF-8'),
                    ('Connection', 'keep-alive'),
                ]
                opener.addheaders = headers

            if custom_cookies:
                cookies = {'Cookie': '; '.join(custom_cookies)}
                req = Request(url, params, cookies)
            else:
                req = Request(url, params)

            start_time = datetime.today()
            #response = opener.open(url, params, timeout=timeout)
            response = opener.open( req, timeout=timeout )
            end_time = datetime.today()
            if sendCookie:
                RemoteAPI._storeCookiesToSession(cj)
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
    #@cache.cache('makeHomeworkpediaGetCall', expire=86400) ## 1 day
    def makeHomeworkpediaGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getHomeworkpediaServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeTaxonomyGetCall( api, params_dict=None, serverUrl=None ):
        if not serverUrl:
            serverUrl = RemoteAPI.getTaxonomyServerURL()
        return RemoteAPI._makeCall(serverUrl, api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeAuthServiceGetCall( api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeAuthServiceCall( api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, 30, params_dict=params_dict, method='PUT', sendCookie=True)

    @staticmethod
    def makeImageGetCall( api, params_dict=None, failIfNonZero=True ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getImageServerTimeout(),params_dict=params_dict,method='GET', failIfNonZero=failIfNonZero)

    @staticmethod
    def makeImageCall( api, params_dict=None, raw_response=False, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getImageServerTimeout(),params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeRemoteCall( api, server_url, params_dict=None , method=None, raw_response=False, multipart=False, timeout=180.0):
        return RemoteAPI._makeCall(server_url, api, timeout, params_dict=params_dict, method=method, raw_response=raw_response, multipart=multipart)


    @staticmethod
    def makeRemoteCallWithAuth( api, server_url, params_dict=None , method=None, raw_response=False, multipart=False, ownerID=None, timeout=180.0):
        flxCookieName = RemoteAPI.getFlxLoginCookie()
        filename = RemoteAPI._makeInternalAuthFile(ownerID=ownerID)
        custom_cookies = [ '%s=%s' % (flxCookieName, filename) ]
        custom_cookies.append( '%s=%s' % (RemoteAPI.getLoginCookie(), filename) )
        return RemoteAPI._makeCall(server_url, api, timeout, params_dict=params_dict, method=method, raw_response=raw_response, multipart=multipart, custom_cookies=custom_cookies)

    @staticmethod
    def getLoginCookie():
        RemoteAPI.initConfig()
        return config.get('ck12_login_cookie')

    @staticmethod
    def getFlxLoginCookie():
        RemoteAPI.initConfig()
        return config.get('beaker.session.key')

    @staticmethod
    def getInternalAuthSharedDir():
        RemoteAPI.initConfig()
        return config.get('internal_auth_shared_dir')

    @staticmethod
    def getContentAdminUserID():
        RemoteAPI.initConfig()
        return config.get('content_admin_user_id')


    @staticmethod
    def _makeInternalAuthFile(ownerID=None):
        if not ownerID:
            ownerID = RemoteAPI.getContentAdminUserID()

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
            f.write(str(ownerID))
        except Exception as e:
            log.error(e, exc_info=e)
        finally:
            f.close()

        return os.path.basename(filename)

    @staticmethod
    def _create_timestamp():
        return datetime.now().strftime("%d%H%M%S%f")


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

