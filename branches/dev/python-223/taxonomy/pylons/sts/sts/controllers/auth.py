import logging
import json
from urllib2 import urlopen
from datetime import datetime
from urllib import quote

from pylons import config, request, session, url 
from pylons.controllers.util import redirect
from sts.controllers import decorators as d
from sts.controllers.errorCodes import ErrorCodes
from sts.lib.base import BaseController
import sts.controllers.user as u
import sts.lib.helpers as h

log = logging.getLogger(__name__)

__controller__ = 'AuthController'

loginUrl = config.get('ck12_login_url')

class AuthController(BaseController):

    @d.trace(log)
    def _call(self, api):
        """
            For making a restful API call.
        """
        f = urlopen(api)
        data = f.read()
        log.debug("Data from api: %s" % data)
        result = json.loads(data)
        status = result['responseHeader']['status']
        response = result['response']
        return status, response

    @d.trace(log, ['returnTo'])
    def login(self, returnTo=None):
        """
            Send to the login page
        """
        global loginUrl
        callbackUrl = url(controller='auth', action='authenticated', qualified=True)
        if request.params.has_key('returnTo'):
            returnTo = request.params.get('returnTo')
        if not returnTo:
            returnTo = url(controller='auth', action='myinfo', qualified=True)
        callbackUrl = '%s?returnTo=%s' % (callbackUrl, returnTo)
        rurl = '%s?returnTo=%s' % (loginUrl, quote(callbackUrl))
        log.info("AuthController rurl[%s]" % rurl)
        return redirect(rurl)

    @d.trace(log)
    def authenticated(self):
        """
            This is an example for how authenticated could be implemented at
            the App layer.

            Please note that the session setup is for the Core Platform
            layer only and should be done differently at the App layer.
        """
        #
        #  Call to get the member information from external authenticator.
        #
        params = request.params
        log.debug("auth authenticated: params[%s]" % params)
        log.debug("auth request.cookies: %s" % request.cookies)

        encodedData = params.get('userinfo')
        ## Do not log user information above debug level
        log.debug("auth authenticated: encodedData[%s]" % encodedData)
        from base64 import standard_b64decode
        j = json.loads(standard_b64decode(encodedData))

        log.debug("User info: %s" % json.dumps(j, ensure_ascii=False))
        #
        #  Setup session info.
        #
        params = { 'user': j, 'groupRoles': None }
        u.saveToSession(params, j.get('timeout', 1*60*60))
        u.saveCookies()
            
        returnTo = request.params.get('returnTo')
        if not returnTo:
            returnTo = url(controller='auth', action='myinfo')
        log.info("auth authenticated: Redirecting to [%s] after successful login" % returnTo)
        return redirect(returnTo)

    @d.trace(log)
    def logout(self):
        """
            Log the user out
        """

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        start = datetime.now()
        try:
            returnTo = request.POST.get('returnTo')
            user = u.getCurrentUser(anonymousOkay=False)
            session['user'] = None
            session['groupRoles'] = None
            session.delete()

            if not returnTo:
                return d.jsonifyResponse(result, start)
        except Exception, e:
            log.error("Error loggin in: %s" % str(e), exc_info=e)
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_ERROR, str(e)), start)

        ## Redirect if returnTo is set (must be called outside of try .. except block)
        if returnTo:
            return redirect(returnTo, 302)

    @d.jsonify()
    @d.checkAuth()
    @d.trace(log, ['member'])
    def myinfo(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        # log.debug("Hello %s" % str(u.getCurrentUser(anonymousOkay=True)))
        result['response'] = u.getCurrentUser(anonymousOkay=True)
        return result

