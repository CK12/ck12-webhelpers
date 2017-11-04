"""Pylons application test package

This package assumes the Pylons environment is already loaded, such as
when this script is imported from the `nosetests --with-pylons=test.ini`
command.

This module initializes the application via ``websetup`` (`paster
setup-app`) and provides the base testing objects.

Run "nosetests --pdb --pdb-failures" for invoking pdb when fails.
"""
from unittest import TestCase

from paste.deploy import loadapp
from paste.script.appinstall import SetupCommand
from pylons import config, url
from routes.util import URLGenerator
from webtest import TestApp

import pylons.test
import time
from beaker.cache import CacheManager

__all__ = ['environ', 'url', 'TestController']

# Invoke websetup with the current config file
SetupCommand('setup-app').run([config['__file__']])

environ = {}

class TestController(TestCase):

    def __init__(self, *args, **kwargs):
        if pylons.test.pylonsapp:
            wsgiapp = pylons.test.pylonsapp
        else:
            wsgiapp = loadapp('config:%s' % config['__file__'])
        self.app = TestApp(wsgiapp)
        url._push_object(URLGenerator(config['routes.map'], environ))
        TestCase.__init__(self, *args, **kwargs)

    def __getCache(self):
        cm = CacheManager(type='file', data_dir=config.get('cache_share_dir'))
        return cm.get_cache('test-login-repo')

    def login(self, userID):
        """
            Imitate the login by creating a cache entry for the user id along with the 
            timestamp.
            Only valid for the expiration time
        """
        self.logout()
        cache = self.__getCache()
        ts = int(time.time() * 1000)
        val = '%s:%s' % (userID, ts)
        ret = cache.get_value(key='test-login-%s' % userID, createfunc=lambda: '%s' % (val), expiretime=30*60)
        return ret

    def getLoginCookie(self, userID):
        val = self.login(userID)
        cookie = '%s=%s' % (config.get('beaker.session.key'), val)
        print 'logged in cookie[%s]' % cookie
        return cookie

    def logout(self):
        self.__getCache().clear()

    def __before__(self):
        self.logout()

    def __after__(self):
        self.logout()

