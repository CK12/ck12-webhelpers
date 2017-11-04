from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController 
from flx.model import exceptions as ex
from pylons import request
from pylons.i18n.translation import _
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u
from flx.model.mongo.specialsearch import SpecialSearchEntry

import logging
import json

log = logging.getLogger(__name__)

__controller__ = 'SpecialSearchController'

class SpecialSearchController(MongoBaseController):
    """
    SpecialSearchEntry related APIs
    """

    @d.jsonify()
    @d.trace(log, ['term'])
    def getSpecialSearchEntry(self, term=None):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not term:
                term = request.params.get('term')
            if not term:
                raise Exception("Must specify a search term.")
            log.debug("term: %s" % term)
            result['response'] = SpecialSearchEntry(self.db).getSpecialSearchEntry(term)
            return result
        except Exception as e:
            log.error('getSpecialSearchEntry Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SPECIAL_SEARCH_ENTRY, str(e))

    @d.jsonify()
    @d.setPage(request)
    @d.trace(log, ['pageNum', 'pageSize'])
    def getSpecialSearchEntries(self, pageNum, pageSize):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            termLike = request.params.get('termLike')
            entries = SpecialSearchEntry(self.db).getSpecialSearchEntries(termLike, pageNum, pageSize)
            result['response']['entries'] = [ e for e in entries ]
            result['response']['total'] = entries.getTotal()
            result['response']['limit'] = len(entries)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception as e:
            log.error('getSpecialSearchEntries Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SPECIAL_SEARCH_ENTRY, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def createSpecialSearchEntry(self, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name": member.fix().name}).encode("utf-8"))
            if not request.params.get('term'):
                raise Exception("Missing required parameter: term")
            if not request.params.get('entry'):
                raise Exception("Missing required parameter: entry")
            kwargs = {'term': request.params['term']}
            kwargs['entry'] = json.loads(request.params.get('entry'))
            if 'entryType' in request.params and request.params['entryType']:
                kwargs['entryType'] = request.params.get('entryType')
            result['response'] = SpecialSearchEntry(self.db).create(**kwargs)
            return result
        except Exception as e:
            log.error("createSpecialSearchEntry exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_CREATE_SPECIAL_SEARCH_ENTRY, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def updateSpecialSearchEntry(self, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name": member.fix().name}).encode("utf-8"))
            id = request.params.get('id')
            if not id:
                raise Exception("Missing required parameter: id")
            kwargs = {}
            if request.params.has_key('term'):
                kwargs['term'] = request.params.get('term')
            if request.params.has_key('entry'):
                kwargs['entry'] = json.loads(request.params.get('entry'))
            if 'entryType' in request.params and request.params['entryType']:
                kwargs['entryType'] = request.params.get('entryType')

            result['response'] = SpecialSearchEntry(self.db).update(id, **kwargs)
            return result
        except Exception as e:
            log.error("updateSpecialSearchEntry exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_UPDATE_SPECIAL_SEARCH_ENTRY, str(e))

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def deleteSpecialSearchEntry(self, member):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'%(member.name)s is not authorized.')  % {"member.name":member.fix().name}).encode("utf-8"))

            term = request.params.get('term')
            if not term:
                raise Exception("Missing required parameter: term")
            result['response'] = SpecialSearchEntry(self.db).delete(term=term)
            return result
        except Exception as e:
            log.error("deleteSpecialSearchEntry exception[%s]" % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_DELETE_SPECIAL_SEARCH_ENTRY, str(e))

    @d.jsonify()
    @d.setPage(request, ['term' ])
    @d.trace(log, ['term', 'pageSize', 'pageNum'])
    def matchSpecialSearchEntries(self, pageNum, pageSize, term=None):
        result = self.getResponseTemplate(ErrorCodes.OK, 0)
        try:
            if not term:
                term = request.params.get('term')
            if not term:
                raise Exception("Must specify a search term.")
            result['response']['entries'] = SpecialSearchEntry(self.db).lookupSpecialSearchTerm(term=term, limit=pageSize)
            return result
        except Exception as e:
            log.error('getSpecialSearchEntry Exception[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_SPECIAL_SEARCH_ENTRY, str(e))


