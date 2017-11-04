import logging
import json
import urllib
from urllib2 import urlopen
from pylons.i18n.translation import _ 
from datetime import datetime
from urllib import quote

from pylons import config, request, session, url, tmpl_context as c
from pylons.controllers.util import redirect
from auth.controllers import decorators as d
from auth.controllers import member as m
from auth.controllers.errorCodes import ErrorCodes
from auth.model import exceptions as ex
from auth.lib.base import BaseController
from auth.lib import helpers as h
import auth.controllers.user as u

log = logging.getLogger(__name__)

__controller__ = 'IntAuthController'

loginUrl = '/%s/federatedLogin/memberForm' % config.get('instance')
#loginUrl = url(controller='extAuth', action='loginForm')

class IntAuthController(BaseController):

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
    def login(self, returnTo=None):
        """
            Send to the login page
        """
        global loginUrl

        if request.params.has_key('returnTo'):
            returnTo = request.params.get('returnTo')
        if not returnTo:
            returnTo = url(controller='member', action='getInfo', qualified=True, protocol='https')
        rurl = '%s?returnTo=%s' % (loginUrl, quote(returnTo))
        log.debug("AuthController rurl[%s]" % rurl)
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
        log.info("auth authenticated: params[%s]" % params)

        encodedData = params.get('userinfo')
        log.info("auth authenticated: encodedData[%s]" % encodedData)
        if encodedData is None:
            returnTo = params.get('returnTo')
            if returnTo is None:
                returnTo = url(controller='member', action='getInfo', protocol='https')
            log.info("auth authenticated: Redirecting to[%s]" % returnTo)
            return redirect(returnTo)

        from base64 import standard_b64decode

        j = json.loads(standard_b64decode(encodedData))
        log.info("User info: %s" % json.dumps(j, ensure_ascii=False, default=h.toJson))
        #
        #  Setup session info.
        #
        id = str(j['id'])
        email = str(j['email'])
        authType = j.get('authType', 'ck12')
        login_cookie = config.get('ck12_login_cookie')
        authCookie = request.cookies.get(login_cookie)
        u.saveSession(request, id, email, authType, authCookie=authCookie)

        returnTo = request.params.get('returnTo')
        if not returnTo:
            returnTo = url(controller='member', action='getInfo', protocol='https')
        log.info("auth authenticated: Redirecting to [%s] after successful login" % returnTo)
        return redirect(returnTo)

    @d.jsonify()
    @d.checkAuth(request, False, False, ['id'])
    @d.trace(log, ['member', 'id'])
    def switchLogin(self, member, id):
        """
            Switches from one login to another.
        """
        try:
            if not u.isMemberAdmin(member):
                raise ex.UnauthorizedException((_(u'Only admin can become other members.')).encode("utf-8"))

            if id is None:
                id = request.params.get('id')
                if id is None:
                    c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                    return ErrorCodes().asDict(c.errorCode,
                                               'no login provided.')
            returnTo = None
            if request.params.has_key('returnTo'):
                returnTo = request.params['returnTo']

            member, extDict = m.getMember(id)
            if member is None:
                c.errorCode = ErrorCodes.UNKNOWN_MEMBER
                return ErrorCodes().asDict(c.errorCode,
                                           'No member of %s.' % id)
            #
            #  Prepare login information.
            #
            token = m.encryptPasswordResetToken(member.id, member.email, expire=0.05)
            completeUrl = '%s/login/member/internal?token=%s' % (self.prefix, token)
            if returnTo is not None:
                completeUrl += '&returnTo=%s' % returnTo
            #
            #  Logout from current session.
            #
            returnTo = self._logout(completeUrl)
        except Exception, e:
            log.error('member switchLogin Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, str(e))

        log.debug('switchLogin: returnTo[%s]' % returnTo)
        return redirect(returnTo, 302)

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
                if returnTo is None:
                    loUrl = '%s/logout/member' % self.prefix
                else:
                    loUrl = '%s/logout/member?returnTo=%s' % (self.prefix, urllib.quote_plus(returnTo))
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

