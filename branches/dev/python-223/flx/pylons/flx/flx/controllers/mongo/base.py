from flx.lib.base import BaseController
from flx.model.mongo import getDB as getMongoDB
from flx.model.mongocache import getDB as getCacheDB
from flx.model.mongosession import getDB as getSessionDB
from pylons import config
import logging

log = logging.getLogger(__name__)


class MongoBaseController(BaseController):
    def __init__(self, **kwargs):
        BaseController.__init__(self, **kwargs)

        self.db = getMongoDB(config)

class MongoCacheBaseController(MongoBaseController):

    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.db = getCacheDB(config)

class MongoSessionBaseController(MongoBaseController):

    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.db = getSessionDB(config)
