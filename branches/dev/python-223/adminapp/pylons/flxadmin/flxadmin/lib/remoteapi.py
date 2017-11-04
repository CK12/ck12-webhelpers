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
from flxadmin.lib.ck12.exceptions import * 
from flxadmin.lib.ck12.util import to_unicode
from flxadmin.lib.multiposthandler import MultipartPostHandler
from flxadmin.model.session import SessionManager
from flxadmin.lib.ck12.errorcodes import ErrorCodes
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

log = logging.getLogger( __name__ )


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
    def getFlxwebURL():
        return config.get('flxweb_server_root')
    
    @staticmethod
    def getHwpTimeout():
        return float(config.get('hwp_api_timeout'))
    
    @staticmethod
    def getHwpServerURL():
        return config.get('hwp_api_server')

    @staticmethod
    def getADSServerURL():
        return config.get('ads_api_server')

    @staticmethod
    def getADSTimeout():
        return float(config.get('ads_api_timeout'))
    
    @staticmethod
    def getTaxonomyServerURL():
        return config.get('taxonomy_api_server')

    @staticmethod
    def getTaxonomyServiceTimeout():
        return float(config.get('taxonomy_api_timeout'))
    
    @staticmethod
    def getDexterServerURL():
        return config.get('dexter_api_server')

    @staticmethod
    def getDexterServiceTimeout():
        return float(config.get('dexter_api_timeout'))
    
    @staticmethod
    def getPartnerAPIServerURL():
        return config.get('partner_api_server')

    @staticmethod
    def getPartnerAPITimeout():
        return float(config.get('partner_api_timeout'))

    @staticmethod
    def getAssessmentServerURL():
        return config.get('assessment_api_server')

    @staticmethod
    def getAssessmentTimeout():
        return float(config.get('assessment_api_timeout'))

    @staticmethod
    def getPeerhelpServerURL():
        return config.get('peerhelp_api_server')

    @staticmethod
    def getPeerhelpAPITimeout():
        return float(config.get('peerhelp_api_timeout'))

    @staticmethod
    def _makeCall(server_url, api, timeout, params_dict=None, method=None, 
                  raw_response=False, multipart=False, check_status=True, update_request_header=False):
        try:
            api = api.encode( 'utf-8' )
            #TODO:look for a better alternative. This was done to prevent double-quoting of URLs
            api = unquote ( api ) 
            params = None
            url = '%s/%s' % ( server_url , quote( api ) )
            # values for parameters may be a list, hence the 2nd for loop
            if params_dict and multipart:
                params = dict(params_dict)
                for k,vs in params.items():
                    for v in isinstance(vs, (list, tuple)) and vs or [vs]:
                        if not isinstance(v, file):
                            params[k] = to_unicode(v, True)
            elif isinstance(params_dict, (dict, MultiDict)):
                params = urlencode([ (k, to_unicode(v, True))\
                    for k,vs in params_dict.items()\
                        for v in isinstance(vs, (list, tuple)) and vs or [vs] ])
            else:
                params = params_dict
            # if the method is 'GET' the append the parameters to the URL
            if method == 'GET' and params:
                url += '?%s' % params
                # clean out params, as urllib2.Request() needs it only for non 'GET' requests
                params = None
            
            cj = CookieJar()
            cookies = SessionManager.getCookiesFromSession( )
            cookies_str = cookies.output(header='',sep=';')
            #log.debug('Cookie header: %s' % cookies_str)
            #Bug 13347 - API Partner application uses Flask-restless to produce a CRUD interface
            #this required content-type as application/json for POST, PUT and DELETE operations
            #Also set method(for PUT and DELETE, need to set explicitly) in request object
            if update_request_header:
                req = Request(url, params, headers={'Content-type': 'application/json','Cookie':cookies_str})
                req.get_method = lambda : method
            else:
                req = Request(url, params, headers={'Cookie':cookies_str})
            if method == 'GET':
                req.get_method = lambda: method
            if multipart:
                opener = build_opener(MultipartPostHandler( cj ))
            else:
                opener = build_opener( HTTPCookieProcessor( cj ) )
            start_time = datetime.today()
            response = opener.open( req, timeout=timeout )
            end_time = datetime.today()
            delta = end_time - start_time
            simple_cookies = RemoteAPI.create_simple_cookie(cj)
            SessionManager.storeCookiesToSession( simple_cookies )
            log.info("[%s.%ss] %s" % (delta.seconds, delta.microseconds%100, url))

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
                raise RemoteAPIException('API did not return a valid JSON') 

            if 'responseHeader' in data and 'status' in data['responseHeader']:
                status = data['responseHeader']['status']
                if check_status and status != ErrorCodes.OK: 
                    api_message = (data.get('response') or {}).get('message')
                    log.error("API Returned Status[%s] with Message: [%s]" % (status, api_message) )
                    raise RemoteAPIStatusException(status, api_message) 

            if not "response" in data:
                raise RemoteAPIException('response field missing in API response')
            return data
        except RemoteAPIException, e:
            raise e
        except RemoteAPIStatusException, e:
            raise e
        except Exception, e:
            log.error( '%s API failed' % ( url ))
            log.exception(e)
            raise e

    @staticmethod
    def makeAuthServiceGetCall( api, params_dict=None, check_status=True,timeOut=None):
        api_time_out = None
        if timeOut:
            api_time_out = timeOut
        else: 
            api_time_out = RemoteAPI.getAuthServerTimeout()

        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, api_time_out,params_dict=params_dict,method='GET', check_status=check_status)

    @staticmethod
    def makeAuthServiceCall( api, params_dict=None, raw_response=False, multipart=False, check_status=True):
        return RemoteAPI._makeCall(RemoteAPI.getAuthServerURL(), api, RemoteAPI.getAuthServerTimeout() ,params_dict=params_dict, raw_response=raw_response, multipart=multipart, check_status=check_status)

    @staticmethod
    def makeGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getServerURL(), api, RemoteAPI.getTimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response)

    @staticmethod
    def makeCall( api, params_dict=None, raw_response=False, multipart=False, check_status=True):
        return RemoteAPI._makeCall(RemoteAPI.getServerURL(), api, RemoteAPI.getTimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart, check_status=check_status)

    @staticmethod
    def makeFlxwebGetCall( api, params_dict=None, raw_response=True):
        return RemoteAPI._makeCall(RemoteAPI.getFlxwebURL(), api, RemoteAPI.getTimeout(), params_dict=params_dict, raw_response=raw_response, method='GET')

    @staticmethod
    def makeFlxwebCall( api, params_dict=None, raw_response=True, multipart=False ):
        return RemoteAPI._makeCall(RemoteAPI.getFlxwebURL(), api, RemoteAPI.getTimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeHwpCall( api, params_dict=None, multipart=False, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getHwpServerURL(), api, RemoteAPI.getHwpTimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeHwpGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getHwpServerURL(), api, RemoteAPI.getHwpTimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response)

    @staticmethod
    def makeADSCall( api, params_dict=None, multipart=False, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getADSServerURL(), api, RemoteAPI.getADSTimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeADSGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getADSServerURL(), api, RemoteAPI.getADSTimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response)

    @staticmethod
    def makeCustomGetCall(api, server_host=None, params_dict=None):
        if not server_host:
            server_host = RemoteAPI.getServerURL()
        return RemoteAPI._makeCall(server_host, api, RemoteAPI.getTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makeTaxonomyCall(api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getTaxonomyServerURL(), api, timeout=RemoteAPI.getTaxonomyServiceTimeout(),params_dict=params_dict)

    @staticmethod
    def makeTaxonomyGetCall(api, params_dict=None, update_request_header=False):
        return RemoteAPI._makeCall(RemoteAPI.getTaxonomyServerURL(), api, timeout=RemoteAPI.getTaxonomyServiceTimeout(),params_dict=params_dict,method='GET', update_request_header=update_request_header)
    
    @staticmethod
    def makeDexterCall(api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getDexterServerURL(), api, timeout=RemoteAPI.getDexterServiceTimeout(),params_dict=params_dict)

    @staticmethod
    def makeDexterGetCall(api, params_dict=None):
        return RemoteAPI._makeCall(RemoteAPI.getDexterServerURL(), api, timeout=RemoteAPI.getDexterServiceTimeout(),params_dict=params_dict,method='GET')

    @staticmethod
    def makePartnerAPICall( api, params_dict=None, multipart=False, raw_response=False, method='POST'):
        return RemoteAPI._makeCall(RemoteAPI.getPartnerAPIServerURL(), api, RemoteAPI.getPartnerAPITimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart, method=method, update_request_header=True)

    @staticmethod
    def makePartnerAPIGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getPartnerAPIServerURL(), api, RemoteAPI.getPartnerAPITimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response,update_request_header=True)

    @staticmethod
    def makeAssessmentCall( api, params_dict=None, multipart=False, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getAssessmentServerURL(), api, RemoteAPI.getAssessmentTimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makeAssessmentGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getAssessmentServerURL(), api, RemoteAPI.getAssessmentTimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response)

    @staticmethod
    def makePeerhelpCall( api, params_dict=None, multipart=False, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getPeerhelpServerURL(), api, RemoteAPI.getPeerhelpAPITimeout(), params_dict=params_dict, raw_response=raw_response, multipart=multipart)

    @staticmethod
    def makePeerhelpGetCall( api, params_dict=None, check_status=True, raw_response=False):
        return RemoteAPI._makeCall(RemoteAPI.getPeerhelpServerURL(), api, RemoteAPI.getPeerhelpAPITimeout(), params_dict=params_dict, method='GET', check_status=check_status, raw_response=raw_response)

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
