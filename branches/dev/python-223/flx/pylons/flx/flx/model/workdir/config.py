import os
from flx.model import meta
from flx.model import api
from flx.model import init_model, getSQLAlchemyEngines
import flx.lib.helpers as h

"""
    Configuration parameter class for common working directory utils.
"""
class config:
    local_prefix = ""
    
    def __init__(self):
        self.cfg = h.load_pylons_config()
        self.local_prefix = self.cfg.get('workdir_prefix')

    def createDBSession(self):
        engines = getSQLAlchemyEngines(self.cfg)
        init_model(engines)
        return meta.Session() 
