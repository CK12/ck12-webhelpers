import logging

from pylons import config, request, response, tmpl_context as c

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.model import api
from auth.lib.base import BaseController, render
import auth.controllers.user as u

from openid.store.filestore import FileOpenIDStore
from openid.server import server

log = logging.getLogger(__name__)

class OpenidserverController(BaseController):
    """
        The Core Platform side of the OpenID Provider support.
    """

    def __init__(self):
        """
            Set up the provider instance for OpenID authentication.
        """
        openidFilestorePath = config.get('openid_filestore_path')
        store = FileOpenIDStore(openidFilestorePath)
        baseURL = config.get('openid_url')
        self.server = server.Server(store, baseURL)

    @d.trace(log)
    def index(self):
        """
            For verifying return to URL.
        """
        response.headers['content-type'] = 'application/xrds+xml; charset=utf-8'
        return render('%s/authenticate/openid-index.xml' % self.prefix)

    @d.trace(log)
    def authenticate(self):
        """
            Authenticate.
        """
        query = dict((k, v) for k, v in request.params.iteritems())
        log.info('OpenIDServer authenticate query[%s]' % query)
        openIDRequest = self.server.decodeRequest(query)
        if openIDRequest is None:
            response.headers['content-type'] = 'application/xrds+xml; charset=utf-8'
            return render('%s/authenticate/openid-signon.xml' % self.prefix)
        #
        #  Handle the request.
        #
        openIDResponse = self.server.handleRequest(openIDRequest)
        #
        #  Complete the construction of the response instance.
        #
        webResponse = self.server.encodeResponse(openIDResponse)
        response.status = webResponse.code
        log.info('OpenIDServer authenticate code[%s]' % response.status)
        for header, value in webResponse.headers.iteritems():
            log.info('OpenIDServer authenticate header[%s] value[%s]' % (header, value))
            response.headers[header] = value
        response.body = webResponse.body
        log.info('OpenIDServer authenticate body[%s]' % response.body)

    @d.jsonify()
    @d.trace(log, [ 'domain' ])
    def getApproval(self, domain):
        """
            Get the approval/rejection decision.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member is None:
            c.errorCode = ErrorCodes.LOGIN_REQUIRED
            return ErrorCodes().asDict(c.errorCode, 'Login required')

        try:
            approval = api.getMemberAuthApproval(memberID=member.id,
                                                 domain=domain)
            if approval is None:
                c.errorCode = ErrorCodes.NO_SUCH_APPROVAL_DOMAIN
                message = ErrorCodes().getName(c.errorCode)
                return ErrorCodes().asDict(c.errorCode, message)

            result['response'] = {
                'memberID' : member.id,
                'domain' : approval.domain,
                'approve' : approval.approve,
            }
            return result
        except Exception, e:
            log.error('get approval Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, [ 'domain', 'approve' ])
    def rememberApproval(self, domain, approve):
        """
            Remember the approval/rejection decision.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member is None:
            c.errorCode = ErrorCodes.LOGIN_REQUIRED
            return ErrorCodes().asDict(c.errorCode, 'Login required')

        try:
            approval = api.createMemberAuthApproval(memberID=member.id,
                                                    domain=domain,
                                                    approve=approve)
            result['response'] = {
                'memberID' : member.id,
                'domain' : approval.domain,
                'approve' : approval.approve,
            }
            return result
        except Exception, e:
            log.error('remember approval Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.trace(log, [ 'domain' ])
    def revokeApproval(self, domain):
        """
            Revoke the approval/rejection decision made earlier.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        member = u.getCurrentUser(request, anonymousOkay=False)
        if member is None:
            c.errorCode = ErrorCodes.LOGIN_REQUIRED
            return ErrorCodes().asDict(c.errorCode, 'Login required')

        try:
            approval = api.deleteMemberAuthApproval(memberID=member.id,
                                                    domain=domain)
            if approval is None:
                c.errorCode = ErrorCodes.NO_SUCH_APPROVAL_DOMAIN
                return ErrorCodes().asDict(c.errorCode,
                                           'No record for %s' % domain)

            result['response'] = {
                'memberID' : member.id,
                'domain' : approval.domain,
                'approve' : approval.approve,
            }
            return result
        except Exception, e:
            log.error('revoke approval Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.RETRIEVAL_ERROR
            return ErrorCodes().asDict(c.errorCode, str(e))
