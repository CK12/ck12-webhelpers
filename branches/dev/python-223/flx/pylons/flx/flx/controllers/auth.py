import logging
import json
import urllib
from urllib2 import urlopen
from pylons.i18n.translation import _ 
from datetime import datetime

from pylons import config, request, session
from pylons.controllers.util import redirect
from flx.controllers import decorators as d
from flx.controllers.errorCodes import ErrorCodes
from flx.lib.base import BaseController

log = logging.getLogger(__name__)

__controller__ = 'AuthController'

class AuthController(BaseController):

    @d.trace(log)
    def _call(self, api):
        """
            For making a restful API call.
        """
        f = urlopen(api)
        data = f.read()
        log.info("Data from api: %s" % data)
        result = json.loads(data)
        status = result['responseHeader']['status']
        res = result['response']
        return status, res

    @d.trace(log, ['returnTo'])
    def _logout(self, returnTo=None):
        """
            Log the user out 
        """
        if session.has_key('userID'):
            userID = session['userID']
            log.info('_logout: session userID[%s]' % userID)
            session['userID'] = None
            session['email'] = None
        request.environ['REMOTE_USER'] = None
        try:
            session.invalidate()
            session.delete()
        except Exception:
            pass

        instance = config.get('instance')
        log.info('_logout: instance[%s]' % instance)
        if instance != 'auth':
            #
            #  Also logout from Auth Service.
            #
            loginCookie = config.get('ck12_login_cookie')
            log.info('_logout: loginCookie[%s]' % loginCookie)
            log.info('_logout: request.cookie[%s]' % request.cookies.get(loginCookie))
            if loginCookie and request.cookies and request.cookies.get(loginCookie):
                prefix = config.get('flx_auth_api_server')
                if returnTo is None:
                    loUrl = '%s/logout/member' % prefix
                else:
                    loUrl = '%s/logout/member?returnTo=%s' % (prefix, urllib.quote_plus(returnTo))
                log.info('_logout: loUrl[%s]' % loUrl)
                return loUrl

        log.info('_logout: returnTo[%s]' % returnTo)
        return returnTo

    @d.trace(log)
    def logout(self):
        """
            Log the user out 
        """

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        start = datetime.now()
        try:
            returnTo = request.POST.get('returnTo')
            returnTo = self._logout(returnTo)
            if not returnTo:
                return d.jsonifyResponse(result, start)
        except Exception, e:
            log.error("Error logging out: %s" % str(e), exc_info=e)
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_FAILED, str(e)), start)

        ## Redirect if returnTo is set (must be called outside of try .. except block)
        if returnTo:
            return redirect(returnTo, 302)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def getLoginCookie(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            instance = config.get('instance')
            if instance != 'auth':
                login_cookie = config.get('ck12_login_cookie')
                flx2_cookie = config.get('beaker.session.key')
                ## Check if the login_cookie exists and is same as what we saved when we logged in
                ## Otherwise kill the session
                log.debug("Session: %s" % session)
                log.info("Session: %s" % session.cookie.output(attrs=['name'], header=''))
                cookieVal = None
                cookieVals = session.cookie.output(attrs=['name'], header='')
                parts = cookieVals.split()
                for part in parts:
                    part = part.strip()
                    name, val = part.split('=', 1)
                    if name == flx2_cookie:
                        cookieVal = val
                        break
                if login_cookie and request.cookies.get(login_cookie) \
                        and session.get('authCookie') == request.cookies[login_cookie] \
                        and cookieVal:
                    result['response'] = { 'name': flx2_cookie, 'cookie': cookieVal }
                    return result
                else:
                    raise Exception((_(u'Invalid cookies. Is user logged in?')).encode("utf-8"))
            else:
                raise Exception((_(u'Not implemented')).encode("utf-8"))
        except Exception as e:
            log.error('Error getting login cookie: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.UNAUTHORIZED_OPERATION, str(e))
