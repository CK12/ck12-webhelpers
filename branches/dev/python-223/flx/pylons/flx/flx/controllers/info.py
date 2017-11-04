import logging
import os

from pylons import config, request, response, session, tmpl_context as c
from pylons.controllers.util import abort
from sqlalchemy.sql import select

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

class InfoController(BaseController):
    flxVersion = config.get('flx.version')

    @d.jsonify()
    @d.trace(log)
    def version(self):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['version'] = self.flxVersion
        return result
