##
## $Id$
##

from pylons import request, tmpl_context as c

from flx.controllers import decorators as d
from flx.controllers.mongo.base import MongoBaseController
from flx.lib.base import BaseController
from flx.lib import helpers as h
from flx.model.mongo.collectionNode import CollectionNode
from flx.controllers.errorCodes import ErrorCodes

import logging

log = logging.getLogger(__name__)

class CollectionController(MongoBaseController):
    def __init__(self, **kwargs):
        MongoBaseController.__init__(self, **kwargs)
        self.cn = CollectionNode(self.db)

    @d.jsonify()
    @d.trace(log, ['encodedIDs'])
    def getConceptCollectionNodesForEID(self, encodedIDs):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            encodedIDs = [ h.getCanonicalEncodedID(e) for e in encodedIDs.split(',') ]
            collectionHandle = request.params.get('collectionHandle')
            collectionCreatorID = request.params.get('collectionCreatorID')
            publishedOnly = str(request.params.get('publishedOnly')).lower() != 'false'
            canonicalOnly = str(request.params.get('canonicalOnly')).lower() == 'true'

            nodes = self.cn.getByEncodedIDs(eIDs=encodedIDs, collectionHandle=collectionHandle, collectionCreatorID=collectionCreatorID,
                    publishedOnly=publishedOnly, canonicalOnly=canonicalOnly)
            result['response']['collectionNodes'] = [self.cn.asDict(n) for n in nodes]
            return result
        except Exception as e:
            log.error('getConceptCollectionNodesForEID Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.NO_SUCH_BROWSE_TERM
            return ErrorCodes().asDict(c.errorCode, str(e))


