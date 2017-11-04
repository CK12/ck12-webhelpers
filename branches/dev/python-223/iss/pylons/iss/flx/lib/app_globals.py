"""The application's Globals object"""
import logging
from pylons import config

from flx.model import api

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
        #self.cache = CacheManager(**parse_cache_config_options(config))
        self.ck12Editor = None
        self.memberID = None

    def getCK12Editor(self):
        if not self.ck12Editor:
            self.ck12Editor = config.get('ck12_editor')
            if self.ck12Editor is None or self.ck12Editor == '':
                self.ck12Editor = 'ck12editor'
            log.info('getEditorInfo ck12Editor[%s]' % self.ck12Editor)
        return self.ck12Editor

    def getCK12EditorID(self):
        ck12Editor = self.getCK12Editor()
        if not self.memberID:
            member = api.getMemberByLogin(login=ck12Editor)
            self.memberID = member.id
            log.info('getEditorInfo member.id[%s]' % self.memberID)
        return self.memberID
