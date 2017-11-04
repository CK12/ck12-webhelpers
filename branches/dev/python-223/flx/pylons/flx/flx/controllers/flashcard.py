import logging
import os
import simplejson
from datetime import datetime
import traceback

from pylons import config, request, response, session, tmpl_context as c
from pylons import app_globals as g
from pylons.controllers.util import abort
from sqlalchemy.sql import select
from sqlalchemy.exc import IntegrityError, OperationalError

from flx.controllers import decorators as d
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.base import BaseController, render
import flx.lib.helpers as h
from flx.lib.search import solrclient
import flx.controllers.user as u
import flx.controllers.resource as r
from flx.controllers.celerytasks import mathcache

from flx.controllers.errorCodes import ErrorCodes

log = logging.getLogger(__name__)

bookType = 'book'
chapterType = 'chapter'
lessonType = 'lesson'
conceptType = 'concept'

class FlashcardController(BaseController):

    @d.jsonify()
    @d.trace(log, ['id', 'type'])
    def getDefinitions(self, id, type='artifact'):

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            if type == 'artifact':
                typeName = None
            else:
                typeName = type
            artifact = api.getArtifactByIDOrTitle(idOrTitle=id, typeName=typeName)
            definitions = h.getDefinitions(artifact.getXhtml())
            log.info("Definitions: %s" % definitions)
            result['response']['total'] = len(definitions.keys())
            result['response']['definitions'] = []
            for dt in sorted(definitions.keys()):
                result['response']['definitions'].append({'term': dt, 'definition': definitions.get(dt)})
            return result
        except Exception, e:
            log.error("No such artifact: %s" % id)
            log.error(traceback.format_exc())
            c.errorCode = ErrorCodes.NO_SUCH_ARTIFACT
            return ErrorCodes().asDict(c.errorCode, str(e))

    def renderFlashCards(self):
        c.prefix = self.prefix
        return render('/flx/render/flashcards.html')

