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
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options
from auth.lib.helpers import getConfigOptionValue
from cookielib import CookieJar
from pylons import session, request
from auth.model.exceptions import RemoteAPIStatusException

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
            from auth.lib.helpers import load_pylons_config
            config = load_pylons_config()

    @staticmethod
    def getTimeout():
        RemoteAPI.initConfig()
        return float(config.get('timeout', 300))
    
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
    def getFlxServerURL():
        RemoteAPI.initConfig()
        return config.get('flx_prefix_url')

    @staticmethod
    def getAssessmentServerURL():
        RemoteAPI.initConfig()
        return config.get('flx_prefix_url').replace('/flx', '/assessment/api')

    @staticmethod
    def _makeCall(server_url, api, timeout, params_dict=None, method=None, raw_response=False, multipart=False, failIfNonZero=True, fromReq=True):
        responseReceived = False
        try:
            from auth.lib.helpers import safe_decode, safe_encode, to_unicode
            api = api.encode( 'utf-8' )
            #TODO:look for a better alternative. This was done to prevent double-quoting of URLs
            api = unquote ( api ) 
            params = None
            if api.startswith('/'):
                api = api.lstrip('/')
            url = '%s/%s' % ( server_url , quote( api ) )
            log.info("Calling: %s" % url)
            if params_dict:
                if multipart:
                    params = dict(params_dict)
                    for k,vs in params.items():
                        for v in isinstance(vs, (list, tuple)) and vs or [vs]:
                            if not isinstance(v, file):
                                params[k] = to_unicode(v, True)
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

            
            cj = CookieJar()
            cookies = RemoteAPI._restoreCookiesFromSession(cj, fromReq=fromReq)
            req = Request(url, params, {'Cookie':cookies})
            if multipart:
                opener = build_opener( MultipartPostHandler( cj ) )
            else:
                opener = build_opener( HTTPCookieProcessor( cj ) )
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
                raise Exception((_(u'API did not return a valid JSON')).encode("utf-8")) 

            if  'responseHeader' in data and 'status' in data['responseHeader']:
                responseReceived = True
                status = data['responseHeader']['status']
                if not status == 0:
                    api_message = data.get('response').get('message')
                    if failIfNonZero:
                        raise RemoteAPIStatusException(status, api_message, response_data = data)
                    else:
                        log.warn('Got non-zero status code in JSON response: %d, %s' % (status, api_message))

            if not "response" in data:
                raise Exception((_(u'response field missing in API response' )).encode("utf-8"))

            return data
        except Exception, e:
            log.error( '%s API failed' % ( url ))
            if not responseReceived:
                log.exception(e)
            raise e

    @staticmethod
    #@cache.cache('makeHomeworkpediaGetCall', expire=86400) ## 1 day
    def makeHomeworkpediaGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getHomeworkpediaServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeTaxonomyGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getTaxonomyServerURL(), api, 30, params_dict=params_dict, method='GET')

    @staticmethod
    def makeImageGetCall( api, params_dict=None, failIfNonZero=True ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict,method='GET', failIfNonZero=failIfNonZero)

    @staticmethod
    def makeImageCall( api, params_dict=None, raw_response=False, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getImageServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeFlxGetCall( api, params_dict=None, failIfNonZero=True ):
        return RemoteAPI._makeCall(RemoteAPI.getFlxServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict,method='GET', failIfNonZero=failIfNonZero)

    @staticmethod
    def makeFlxCall( api, params_dict=None, raw_response=False, multipart=False, failIfNonZero=True, method=None, fromReq=True):
        return RemoteAPI._makeCall(RemoteAPI.getFlxServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict, raw_response=raw_response, method=method, multipart=multipart, failIfNonZero=failIfNonZero, fromReq=fromReq)

    @staticmethod
    def makeAssessmentCall( api, params_dict=None, raw_response=False, multipart=False, failIfNonZero=True, method=None, fromReq=True):
        return RemoteAPI._makeCall(RemoteAPI.getAssessmentServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict, raw_response=raw_response, method=method, multipart=multipart, failIfNonZero=failIfNonZero, fromReq=fromReq)

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

    @staticmethod
    def _restoreCookiesFromSession(cj, fromReq=False):
        """
            Copy cookies from session to the request for remote server
        """
        log.debug('_restoreCookiesFromSession: session[%s]' % session)
        key = config.get('beaker.session.key')
        if 'cookies' in session:
            for cookie in session['cookies']:
                if cookie.name == key:
                    cj.set_cookie(cookie)
                    log.debug("Copied cookie: %s" % cookie.name)
        if fromReq:
            from cookielib import Cookie as Cookielib
            log.debug("_restoreCookiesFromSession: cookies[%s]" % request.cookies)
            for name in request.cookies.keys():
                value = request.cookies[name]
                cookie = Cookielib(version=0,
                                name=name,
                                value=value,
                                port=None,
                                port_specified=False,
                                domain=config.get('beaker.session.domain'),
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
                log.debug("Copied cookie: %s" % cookie.name)
        return cj
