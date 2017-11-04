"""The application's Globals object"""

import logging
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

log = logging.getLogger(__name__)

class Globals(object):
    """Globals acts as a container for objects available throughout the
    life of the application

    """

    def __init__(self, config):
        """One instance of Globals is created during application
        initialization and is available during requests via the
        'app_globals' variable

        """
        self.cache = CacheManager(**parse_cache_config_options(config))

class MultiPaginator(object):
    """
        Supports pagination on multiple query apis
    """

    def __init__(self, funclist, kwargs, pageNum=0, pageSize=0):
        log.debug("Args: funclist: %s, kwargs: %s, pageNum: %d, pageSize: %d" % (funclist, kwargs, pageNum, pageSize))
        cnt = 0
        self.uberPage = None
        self.results = None
        self.total = 0
        self.pages = 0

        self.size = pageSize

        for func in funclist:
            kwargs[cnt]['pageNum'] = pageNum
            kwargs[cnt]['pageSize'] = pageSize
            log.debug("Calling %s with args %s" % (func.__name__, kwargs[cnt]))
            page = func.__call__(**kwargs[cnt])
            if not self.uberPage:
                self.uberPage = page
            else:
                if len(self.uberPage.results) < self.size:
                    self.uberPage.results.extend(page.results)
                self.uberPage.total += page.total
            log.info("total: %d results: %d" % (self.uberPage.total, len(self.uberPage.results)))
            if len(page.results) < pageSize:
                pageSize = pageSize - len(page.results)
                pageNum = 1
            else:
                ## Just run more queries to get the total count
                pageSize = 1
                pageNum = 1

            cnt += 1
        self.results = self.uberPage.results
        self.total = self.uberPage.total
        if self.size <= 0:
            self.pages = 1
        else:
            self.pages = 1 + (self.total - 1)/self.size

    def __repr__(self):
        return str(vars(self))

    def __len__(self):
        return len(self.results)

    def __getitem__(self, i):
        return self.results[i]

    def __iter__(self):
        return iter(self.results)

    def getTotal(self):
        return self.total


