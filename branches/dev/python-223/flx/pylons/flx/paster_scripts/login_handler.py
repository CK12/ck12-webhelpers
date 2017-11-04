import time

from beaker.cache import CacheManager
from pylons import config, url, session, request


class LoginHandler():
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
        return '%s=%s' % (config.get('beaker.session.key'), val)

    def logout(self):
        self.__getCache().clear()
