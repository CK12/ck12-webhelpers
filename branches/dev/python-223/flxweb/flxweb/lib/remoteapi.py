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
# $Id$

from cookielib import CookieJar
from datetime import datetime
from pylons import request
from flxweb.lib.ck12.util import to_unicode
from flxweb.lib.multiposthandler import MultipartPostHandler
from flxweb.model.session import SessionManager
from flxweb.lib.ck12.errorcodes import ErrorCodes
from pylons import config
from urllib import urlencode, quote, unquote
from httplib import BadStatusLine
from urllib2 import build_opener, HTTPCookieProcessor, Request, HTTPSHandler, HTTPError
import socket
import httplib, ssl, sys
try:
    from webob.multidict import UnicodeMultiDict as MultiDict
except:
    from webob.multidict import MultiDict
import logging
import json
import Cookie
import time
from flxweb.lib.ck12.exceptions import RemoteAPIStatusException,\
    RemoteAPIException, RemoteAPITimeoutException, RemoteAPIHTTPException

log = logging.getLogger( __name__ )
slowapi = logging.getLogger('slowapi')

class RemoteAPI( object ):

    @staticmethod
    def getAuthServerTimeout():
        return float(config.get('flx_auth_api_timeout'))

    @staticmethod
    def getAuthServerURL():
        return config.get('flx_auth_api_server')

    @staticmethod
    def getTimeout():
        return float(config.get('flx_core_api_timeout'))

    @staticmethod
    def getServerURL():
        return config.get('flx_core_api_server')

    @staticmethod
    def getWriteServerURL():
        return config.get('flx_write_api_server')

    @staticmethod
    def getHwpTimeout():
        return float(config.get('hwp_api_timeout'))

    @staticmethod
    def getAssessmentTimeout():
        return float(config.get('assessment_api_timeout'))

    @staticmethod
    def getHwpServerURL():
        return config.get('assessment_api_server')

    @staticmethod
    def getAssessmentServerURL():
        return config.get('assessment_api_server')

    @staticmethod
    def getTaxonomyServerURL():
        return config.get('taxonomy_api_server')

    @staticmethod
    def getADSServerURL():
        return config.get('ads_api_server')

    @staticmethod
    def getTaxonomyServiceTimeout():
        return float(config.get('taxonomy_api_timeout'))

    @staticmethod
    def getCDNCacheURL():
        return config.get('cdn_api_cache')

    @staticmethod
    def _makeCall( server_url, api, timeout, params_dict=None, method=None, raw_response=False, multipart=False):
        try:
            if type(api) == str:
                api = api.decode('utf-8').encode( 'utf-8' )
            else:
                api = api.encode('utf-8')
            #TODO:look for a better alternative. This was done to prevent double-quoting of URLs
            api = unquote ( api )
            params = None
            if not params_dict:
                params_dict = {}
            apiLogInfo = {}

            # default format is json
            format = 'json'


            # if we get the format as part of the params_dict, use that
            if 'format' in params_dict:
                format = params_dict['format']

            # make sure we have the method and format in proper case
            method = method.upper() if method else method
            format = format.lower() if format else format


            url = '%s/%s' % ( server_url , quote( api ) )
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
                        params = urlencode( [(k, to_unicode(v, True)) for k,vs in params_dict.items()\
                                                 for v in isinstance(vs,list) and vs or [vs] ] )
                    else:
                        params = params_dict


            # if the method is 'GET' then append the parameters to the URL
            if method == 'GET' and params:
                url += '?%s' % params
                # clean out params, as urllib2.Request() needs it only for non 'GET' requests
                params = None

            cj = CookieJar()
            cookies = SessionManager.getCookiesFromSession( )

            cookies_str = cookies.output(header='',sep=';')
            req = Request(url, params, {'Cookie':cookies_str})
            if multipart:
                opener = build_opener( HTTPSHandlerV3(), MultipartPostHandler( cj ) )
            else:
                opener = build_opener( HTTPSHandlerV3(), HTTPCookieProcessor( cj ) )
            log.debug('Calling %s' % url)
            req.add_header('Accept-Language',str(request.accept_language))
            if format == 'json':
                req.add_header('Accept','application/json')
            start_time = datetime.today()
            response = opener.open( req, timeout=timeout )
            end_time = datetime.today()
            delta = end_time - start_time
            simple_cookies = RemoteAPI.create_simple_cookie(cj)
            if simple_cookies:
                SessionManager.storeCookiesToSession( simple_cookies )
            log.info( "[%s.%ss] %s  " % ( delta.seconds, delta.microseconds%100 , url ) )
            if delta.seconds > int(config.get('slowapi_time')):
                slowapi.info("[%s.%ss] %s  " % ( (delta.days*3600 + delta.seconds), delta.microseconds/1000 , url ) )

            apiLogInfo['url'] = url
            apiLogInfo['responseTime'] = "%s.%ss" % ((delta.days*3600 + delta.seconds), delta.microseconds/1000)

            headers = dict(response.info())
            apiLogInfo['backendServer'] = headers.get('x-ck12-server','unknown')

            if raw_response:
                data = response
            elif format == 'json':
                # Make sure the API returned proper content-type header

                if not 'content-type' in headers or not 'application/json' in headers['content-type']:
                    raise RemoteAPIException('API did not return a valid JSON header.Returned Headers=%s' % headers)

                try:
                    data = response.read()
                    data = json.loads( data )
                except ValueError,e:
                    data = None
                # Make sure:
                # 0) we got a valid json response
                # 1) we are getting a "response" field in the API response
                # 2) status is 0 i.e OK
                # else raise RemoteAPIStatusException
                if not data:
                    raise RemoteAPIException('API did not return a valid JSON')

                if  'responseHeader' in data and 'status' in data['responseHeader']:
                    status = data['responseHeader']['status']
                    if not status == ErrorCodes.OK:
                        api_message = data.get('response').get('message')

                        raise RemoteAPIStatusException(status, api_message, response_data = data)

                if not "response" in data:
                    raise RemoteAPIException( 'response field missing in API response' )
            elif format == 'html':
                data = response.read()
            else:
                raise RemoteAPIException('illegal value(%s) for format parameter' % format)

            log.debug("[%(url)s\t%(responseTime)s\t%(backendServer)s]" % apiLogInfo)
            return data
        except RemoteAPIException, e:
            raise e
        except RemoteAPIStatusException, e:
            if hasattr(e, 'response_data'):
                source = e.response_data['responseHeader'].get('source', '')
                log.warn('API returned status code(%s)=%s, Source=%s' % (e.status_code,ErrorCodes.get_description(e.status_code),source))
            else:
                log.warn('API returned status code(%s)=%s' % (e.status_code,ErrorCodes.get_description(e.status_code)))
            log.debug('API returned with message: %s' % e.api_message)
            raise e
        except BadStatusLine, e:
            log.error( '%s API failed' % ( url ))
            log.exception(e)
            log.debug('args=%s' % e.args)
            log.debug('message=%s' % e.message)
            log.debug('line=%s' % e.line)
            raise e
        except socket.timeout, e:
            log.error('API timed out %s' % (url))
            raise RemoteAPITimeoutException(e)
        except HTTPError, e:
            log.error('HTTP Status %s returned for api %s' % (e.code, url))
            #TODO : Code below is repeated from successful response. it should be moved to a common function.
            try:
                data = e.read()
                data = json.loads( data )
            except Exception, e:
                data = None
            
            if not data:
                # HTTP Error returned with a non-json response, raise the exception as-is
                raise e
                
            if not "response" in data:
                # Got a valid json that can't be recognized by remoteAPI, 
                # raise the original exception
                raise e
            
            if 'errors' in data['response']:
                errors = data['response']['errors']
                if errors:
                    raise RemoteAPIHTTPException(e.code, errors)
                else:
                    raise e

            log.error('%S API failed with HTTPError' % (url))
            raise e
        except Exception, e:
            log.exception(e)
            log.error( '%s API failed' % ( url ))
            raise e

    @staticmethod
    def makeAuthServiceGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, RemoteAPI.getAuthServerTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeAuthServiceCall( api, params_dict=None, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, RemoteAPI.getAuthServerTimeout(),params_dict=params_dict, multipart=multipart)

    @staticmethod
    def makeGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeCDNGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getCDNCacheURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeCall( api, params_dict=None, raw_response=False, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeWriteCall(api, params_dict=None, raw_response=False, multipart=False, method='POST' ):
        return RemoteAPI._makeCall(RemoteAPI.getWriteServerURL(), api, RemoteAPI.getTimeout(),params_dict=params_dict, raw_response=raw_response, multipart=multipart, method=method)

    @staticmethod
    def makeHwpCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getHwpServerURL(), api, RemoteAPI.getHwpTimeout(),params_dict=params_dict)

    @staticmethod
    def makeHwpGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getHwpServerURL(), api, RemoteAPI.getHwpTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeAssessmentCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getAssessmentServerURL(), api, RemoteAPI.getAssessmentTimeout(),params_dict=params_dict)

    @staticmethod
    def makeAssessmentGetCall( api, params_dict=None ):
        return RemoteAPI._makeCall(RemoteAPI.getAssessmentServerURL(), api, RemoteAPI.getAssessmentTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeCustomGetCall(api, server_host=None, params_dict=None, api_timeout=None):
        if not server_host:
            server_host = RemoteAPI.getServerURL()
        if not api_timeout:
            api_timeout = RemoteAPI.getTimeout()
        return RemoteAPI._makeCall(server_host, api,api_timeout ,params_dict=params_dict,method='GET')

    @staticmethod
    def makeTaxonomyGetCall(api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getTaxonomyServerURL(), api, timeout=RemoteAPI.getTaxonomyServiceTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeADSGetCall(api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getADSServerURL(), api, RemoteAPI.getAuthServerTimeout(), params_dict=params_dict)

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

##
## Special handler for Python 2.7 for SSL V3
## Based on: http://bugs.python.org/issue11220
##
class HTTPSConnectionV3(httplib.HTTPSConnection):
    def __init__(self, *args, **kwargs):
        httplib.HTTPSConnection.__init__(self, *args, **kwargs)

    def connect(self):
        sock = socket.create_connection((self.host, self.port), self.timeout)
        if self._tunnel_host:
            self.sock = sock
            self._tunnel()
        pythonVer = sys.version_info
        oldPython = False
        if pythonVer[0] <= 1 or (pythonVer[0] < 3 and pythonVer[1] <= 7 and pythonVer[2] < 9):
            oldPython = True
        try:
            if oldPython:
                raise Exception("Old python [version: %s]. Trying TLSv1" % pythonVer)
            self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1_2)
        except Exception, oldpy:
            try:
                log.debug("Using TLSv1.")
                self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1)
            except ssl.SSLError, tlsv1:
                try:
                    log.warn("Using SSLv3. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv3)
                except ssl.SSLError, sslv3:
                    log.warn("Using SSLv23. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv23)

class HTTPSHandlerV3(HTTPSHandler):
    def https_open(self, req):
        return self.do_open(HTTPSConnectionV3, req)
