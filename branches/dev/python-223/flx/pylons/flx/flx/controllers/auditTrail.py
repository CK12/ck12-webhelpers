# Copyright 2007-2015 CK-12 Foundation
#
# All rights reserved
#
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Felix Nance
#
from pylons import request, tmpl_context as c
from flx.controllers.mongo.base import MongoBaseController
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.model import exceptions as ex
from flx.model.audit_trail import AuditTrail
import flx.controllers.user as u
from pylons.i18n.translation import _
from ast import literal_eval

import logging

log = logging.getLogger(__name__)

class AudittrailController(MongoBaseController):

    def __init__(self):
        self.auditTrail = AuditTrail()

    @d.jsonify()
    @d.filterable(request, ['collectionName','auditType', 'memberID'], noformat=True)
    @d.checkAuth(request,False,False,['collectionName','auditType','fq'])
    def getAuditTrail(self,member,collectionName=None, auditType=None, fq=None):
        """
            This will retrieve an audit trail based on the collection name, and type of audit.
            Filters are based on a query string for example: 
                ?filters=memberID,123;providerID,2
            This will become {memberID:123,providerID:2}
        """
        log.debug("Begin Get Audit Trail")
        try:
            query = None
            pageSize = int(request.params.get('pageSize', 20))
            pageNum = int(request.params.get('pageNum', 1))
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
	    if not u.isMemberAdmin(member):
	        raise ex.UnauthorizedException((_(u'Only admin can make this api call.')).encode("utf-8"))
            if (fq):
                query = dict((str(k),str(v)) for k,v in fq)
                query['auditType'] = str(auditType)
            log.debug("Query for audit trail [%s"%query)
            trail_results = self.auditTrail.getTrail(collectionName=collectionName, auditType=auditType, query=query, pageSize=pageSize, pageNum=pageNum)
            result['response']['results'] = list(trail_results)
            result['response']['total'] = trail_results.getTotal()
            result['response']['limit'] = trail_results.getResultCount()
            result['response']['offset'] = (pageNum-1)*pageSize
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.CANNOT_GET_AUDIT_TRAIL
            log.error("Could not get audit trail %s"%e,exc_info=e)
            return ErrorCodes().asDict(c.errorCode,str(e))

    @d.jsonify()
    @d.checkAuth(request)
    def createAuditTrail(self, **kwargs):
        """
            Insert a new audit into mongodb.
        """
        try:
            log.debug("Begin Create Audit Trail")
            result = MongoBaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            collectionName = request.params.get('collectionName', None)
            audit = request.params.get('audit', None)
            post = literal_eval(request.params.get('launchdata', None))
            log.debug("Request body is %s"%post)
            if not post: 
                post = request.body
            log.debug("Creating new audit trail %s" %audit)
            log.debug("Post params %s" %post)
            res = self.auditTrail.insertTrail(collectionName=collectionName,data=post)
            result['reponse'] = res
            return result
        except Exception, e:
            c.errorCode = ErrorCodes.CANNOT_INSERT_AUDIT_TRAIL
            log.error("Could not create audit trail %s"%e,exc_info=e)
            return ErrorCodes().asDict(c.errorCode,str(e))
