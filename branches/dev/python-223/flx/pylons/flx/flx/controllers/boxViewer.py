import logging
import traceback

from pylons import request, tmpl_context as c
from pylons.i18n.translation import _

#from flx.lib.viewer.ck12doc.ck12doc import CK12DocError
from flx.controllers import decorators as d
from flx.lib.viewer import boxSession as boxViewerSession, boxViewer as BoxView
from flx.controllers.errorCodes import ErrorCodes
from flx.model import exceptions as ex
from flx.lib.base import BaseController

log = logging.getLogger(__name__)

class BoxviewerController(BaseController):

    def index(self):
        # Return a rendered template
        #return render('/boxViewer.mako')
        # or, return a string
        return 'Hello World'
    
    @d.jsonify()
    @d.trace(log)
    def getSession(self):
        """
        function to return response with box viewer session ID
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        document_id = request.params.get('document_id')
        log.debug("document_id %s" %document_id)
        try:
            if not document_id:
                raise ex.MissingArgumentException((_(u'Missing document_id')).encode("utf-8"))
            sessionID = boxViewerSession.create_session(document_id)
            result['response']['session']=sessionID
        except ex.MissingArgumentException, mae:
            log.debug('Get Session: Missing Argument Exception[%s] traceback' %(traceback.format_exc()))
            c.errorCode = ErrorCodes.REQUIRED_PARAMS_MISSING
            return ErrorCodes().asDict(c.errorCode, str(mae))
        except Exception:
            log.info("document_id 44444 %s" %document_id)
            log.debug('get: Exception[%s] traceback' %(traceback.format_exc()))
        return result

    @d.jsonify()
    @d.trace(log)
    def getBoxDocumentList(self):
        """
        function to return response with box viewer documents
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        limit = request.params.get('limit')
        created_before = request.params.get('created_before')
        created_after = request.params.get('created_after')
        log.debug("limit %s" %limit)
        try:
            boxInstance = BoxView.BoxViewer()
            data = boxInstance.boxDocumentsList(limit=limit,created_before=created_before,created_after=created_after)
            result['response']['Documents']=data
        except Exception, e:
            log.debug('get: Exception[%s] traceback' %(traceback.format_exc()))
            result['response']['Error']=e
        return result
