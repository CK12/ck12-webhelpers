"""Pylons application test package

This package assumes the Pylons environment is already loaded, such as
when this script is imported from the `nosetests --with-pylons=test.ini`
command.

This module initializes the application via ``websetup`` (`paster
setup-app`) and provides the base testing objects.
"""
import time
import json
import Cookie
from urllib import urlencode, quote, unquote
from urllib2 import build_opener, HTTPCookieProcessor,Request
from cookielib import CookieJar 

from unittest import TestCase

from paste.deploy import loadapp
from paste.script.appinstall import SetupCommand
from pylons import url
from routes.util import URLGenerator
from webtest import TestApp

import pylons.test
from beaker.cache import CacheManager
from pylons.i18n.translation import _

__all__ = ['environ', 'url', 'TestController', 'ADMIN_USER', 'ADMIN_USER_ID']

# Invoke websetup with the current config file
SetupCommand('setup-app').run([pylons.test.pylonsapp.config['__file__']])

environ = {}

AUTH_LOGIN = 'admin'
AUTH_TOKEN = 'notck12'
AUTH_TYPE  = 'ck-12'
AUTH_SERVER_URL = pylons.test.pylonsapp.config.get('ck12_login_prefix')
AUTH_API = 'login/member'

ADMIN_USER_ID = 1
ADMIN_USER = {
         'id': 1,
         'login': 'testAdmin',
         'defaultLogin': 'testAdmin',
         'email': None,
         'name': 'Test Admin',
         'authType': 'ck-12',
         'sessionID': None,
         'timeout': 0
       }

class TestController(TestCase):

    def __init__(self, *args, **kwargs):
        wsgiapp = pylons.test.pylonsapp
        config = wsgiapp.config
        self.app = TestApp(wsgiapp)
        self.config = config
        url._push_object(URLGenerator(config['routes.map'], environ))
        TestCase.__init__(self, *args, **kwargs)
        self.session = {}    #This dic object will ack like session object
        self.ck12LoginCookieVal = None

    def __getCache(self):
        dir = self.config.get('cache_share_dir')
        cm = CacheManager(type='file', data_dir=dir)
        return cm.get_cache('test-login-repo')

    def applogin(self):
        """
            Imitate the login by creating a cache entry for the user cookie
        """
        cache = self.__getCache()
        ret = cache.get_value(key='test-login-user', createfunc=self.authenticateUser, expiretime=30*60)
        return ret

    def login(self, user=ADMIN_USER):
        """
            Imitate the login by creating a cache entry for the user id along with the 
            timestamp.
            Only valid for the expiration time
        """
        self.logout()
        cache = self.__getCache()
        ts = int(time.time() * 1000)
        userID = user['id']
        val = '%s:%s' % (json.dumps(user), ts)
        ret = cache.get_value(key='test-login-%s' % userID, createfunc=lambda: '%s' % (val), expiretime=30*60)
        return '%s:%s' % (userID, ts)

    def getLoginCookie(self, user=ADMIN_USER):
        val = self.login(user)
        return '%s=%s' % (self.config.get('beaker.session.key'), val)

    def getLoginAppCookieObject(self):
        ck12_login_cookie = pylons.test.pylonsapp.config.get('ck12_login_cookie')
        val = self.applogin()
        print "val: %s" % val
        cookies = Cookie.SimpleCookie(val)
        cookies['testUser'] = quote(json.dumps(ADMIN_USER))
        return cookies

    def logout(self):
        self.__getCache().clear()

    def __before__(self):
        self.logout()

    def __after__(self):
        self.logout()

    def authenticateUser(self):
        cookie = self.makeAuthServiceCall( AUTH_API, {'login': AUTH_LOGIN, 'token' : AUTH_TOKEN, 'authType': AUTH_TYPE } )
        print 'cookie[%s]' % cookie
        ck12_login_cookie = pylons.test.pylonsapp.config.get('ck12_login_cookie')
        print 'ck12_login_cookie[%s]' % ck12_login_cookie
        assert cookie.has_key(ck12_login_cookie), "Failed to login" 
        return cookie.get(ck12_login_cookie).output(header='')

    def _makeCall(self, server_url, api, timeout=180.0, params_dict=None):
        try:
            api = api.encode( 'utf-8' )
            api = unquote ( api )
            params = urlencode(params_dict)
            url = '%s/%s' % ( server_url , quote( api ) )
            print "Calling API: [%s]" % url
            cj = CookieJar()
            req = Request(url, params)
            opener = build_opener( HTTPCookieProcessor( cj ) )
            response = opener.open( req, timeout=timeout )
            auth_cookie_str = response.headers.getheader('Set-Cookie')
            print "auth_cookie_str=[%s]" % auth_cookie_str
            simple_cookies = Cookie.SimpleCookie(auth_cookie_str)
            #simple_cookies = self.create_simple_cookie(cj)
            return simple_cookies
        except Exception, e:
            raise Exception((_(u'%(url)s API failed with Exception:%(str(e))s') % ({"url":url, "str(e)":str(e)})).encode("utf-8"))

    def makeAuthServiceCall(self, api, params_dict=None ):
        print "AUTH_SERVER_URL: [%s]" % AUTH_SERVER_URL
        return self._makeCall(AUTH_SERVER_URL, api, params_dict=params_dict)

    def create_simple_cookie(self, cookiejar):
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

    def getCookiesHeaderVal(self):
        if not self.ck12LoginCookieVal:
            ck12_login_cookie = self.config.get('ck12_login_cookie')
            cookies = self.getLoginAppCookieObject()
            print "cookies: %s" % cookies
            self.ck12LoginCookieVal = cookies[ck12_login_cookie].output(header='').strip()
            print "self.ck12LoginCookieVal: [%s]" % self.ck12LoginCookieVal
        cookiesHeaderVal = '%s;%s' % (self.ck12LoginCookieVal, self.getLoginCookie(ADMIN_USER))
        print "getCookiesHeaderVal: [%s]" % cookiesHeaderVal
        return cookiesHeaderVal

