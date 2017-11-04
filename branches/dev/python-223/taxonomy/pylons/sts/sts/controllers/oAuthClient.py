import logging
from datetime import datetime
import urllib
import urlparse

import oauth2 as oauth

from pylons import config, request, response, session, url, tmpl_context as c
from pylons.controllers.util import redirect
from sts.controllers import decorators as d
from sts.controllers.errorCodes import ErrorCodes
from sts.controllers.extAuth import ExtAuthController
from sts.lib.base import BaseController, render
import sts.controllers.user as u
import sts.lib.helpers as h

log = logging.getLogger(__name__)

__controller__ = 'AuthController'

loginUrl = config.get('ck12_login_url')
loginPrefix = config.get('ck12_login_prefix')

class AuthController(ExtAuthController):
    site = 'oAuthClient'

    def __init__(self):
        self.ck12oauthDict = {
            'consumerKey': config.get('ck12oauth_consumer_key'),
            'secret': config.get('ck12oauth_secret'),
            'tokenUrl': config.get('ck12oauth_token_url'),
            'authUrl': config.get('ck12oauth_auth_url'),
            'accessUrl': config.get('ck12oauth_access_url'),
            'callbackUrl': config.get('ck12oauth_callback_url'),
        }

    @d.trace(log, ['returnTo'])
    def login(self, returnTo=None):
        """
            Login via oAuthClient.
        """
        ck12oauth = self.ck12oauthDict
        #
        #  Step 1. Get a request token from OAuthClient.
        #
        #   Set the oauth_callback here for returning to the right place after authUrl.
        #
        consumer = oauth.Consumer(key=ck12oauth['consumerKey'], secret=ck12oauth['secret'])
        client = oauth.Client(consumer)
        tokenUrl = ck12oauth['tokenUrl']
        log.debug('ck12oauth login: tokenUrl[%s]' % tokenUrl)
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        else:
            url = ck12oauth['callbackUrl']
        if not returnTo:
            returnTo = request.params.get('returnTo')
        if returnTo:
            if '?' in url:
                url += '&returnTo=%s' % returnTo
            else:
                url += '?returnTo=%s' % returnTo
        url = urllib.quote(url, safe='')
        log.debug('ck12oauth login: url[%s]' % url)
        tokenUrl = '%s?oauth_callback=%s' % (tokenUrl, url)
        log.debug('ck12oauth tokenUrl[%s]' % tokenUrl)
        resp, content = client.request(tokenUrl, 'GET')
        log.debug('ck12oauth resp[%s]' % resp)
        log.debug('ck12oauth content[%s]' % content)
        if resp['status'] != '200':
            raise Exception((u"ck12oauth login: Invalid response on token request from OAuthClient.").encode("utf-8"))
        #
        #  Step 2. Store the request token in a cookie for later use.
        #
        rt = urlparse.parse_qsl(content)
        tokenDict = dict(rt)
        log.info('ck12oauth tokenDict[%s]' % tokenDict)
        response.set_cookie('oauth_token', tokenDict['oauth_token'])
        response.set_cookie('oauth_token_secret', tokenDict['oauth_token_secret'])
        response.set_cookie('sts_oauth_token', tokenDict['oauth_token'])
        response.set_cookie('sts_oauth_token_secret', tokenDict['oauth_token_secret'])
        log.info('login: response.headers[%s]' % response.headers)
        #
        #  Step 3. Ask OAuthClient to authorize.
        #
        #   OAuthClient does not return the email.
        #
        #   May redirect to ask the user for the email after authenticating (if it's the first time).
        #
        redirectUrl = '%s?oauth_token=%s' % (ck12oauth['authUrl'], tokenDict['oauth_token'])
        log.debug("Redirect url ck12oauth: %s" % redirectUrl)
        return redirect(redirectUrl)

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from ck12oauth.
        """
        #
        #  Response data from ck12oauth.
        #
        token = request.params.get('oauth_token')
        verifier = request.params.get('oauth_verifier')
        log.debug('getInfo: token[%s]' % token)
        log.debug('getInfo: verifier[%s]' % verifier)
        #
        #  Get access token stored earlier from cookie.
        #
        log.debug('getInfo: cookies[%s]' % request.cookies)
        oauthToken = request.cookies.get('sts_oauth_token')
        oauthTokenSecret = request.cookies.get('sts_oauth_token_secret')
        log.debug('getInfo: oauthToken[%s]' % oauthToken)
        log.debug('getInfo: oauthTokenSecret[%s]' % oauthTokenSecret)
        if token != oauthToken:
            errorCode = ErrorCodes.AUTHENTICATION_ERROR
            return ErrorCodes().asDict(errorCode, 'Token mismatched.')

        ck12oauth = self.ck12oauthDict
        #
        #  Switch to use the access token.
        #
        consumer = oauth.Consumer(key=ck12oauth['consumerKey'], secret=ck12oauth['secret'])
        log.debug('getInfo: consumer[%s]' % consumer)
        token = oauth.Token(key=token, secret=oauthTokenSecret)
        log.debug('getInfo: token[%s]' % token)
        token.set_verifier(verifier)
        client = oauth.Client(consumer, token)
        log.debug('getInfo: client[%s]' % client)
        resp, content = client.request(ck12oauth['accessUrl'], 'POST')
        if resp['status'] != '200':
            log.debug('getInfo: resp[%s]' % resp)
            errorCode = ErrorCodes.AUTHENTICATION_ERROR
            return ErrorCodes().asDict(errorCode, 'Invalid response status[%s] on token request from OAuthClient.' % resp['status'])
        #
        #  Get user information.
        #
        ## Must be debug to protect PII
        log.debug('getInfo: resp[%s]' % resp)
        log.debug('getInfo: content[%s]' % content)
        userInfo = urlparse.parse_qsl(content)
        ## Must be debug to protect PII
        log.debug('getInfo: userInfo[%s]' % userInfo)
        userDict = dict(userInfo)
        userID = userDict.get('user_id')
        log.debug('getInfo: userID[%s]' % userID)
        email = userDict.get('email')
        return self._getInfo(userID=userID, email=email)

    @d.trace(log, ['userID', 'email', 'screenName'])
    def _getInfo(self, userID=None, email=None, screenName=None):
        if userID is None:
            userID = request.params.get('userID')
        if email is None:
            email = request.params.get('email')

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response'][self.site] = {
            'token': userID,
            'email': email,
            'authType': self.site,
        }
        return result

    @d.trace(log)
    def authenticated(self):
        """
            This is an example for how authenticated could be implemented at
            the App layer.

            Please note that the session setup is for the Core Platform
            layer only and should be done differently at the App layer.
        """
        log.debug('authenticated: cookies[%s]' % request.cookies)
        #
        #  Call to get the member information from external authenticator.
        #
        params = request.params
        log.debug("authenticated: Request params[%s]" % params)
        denied = params.get('denied', None)
        if denied:
            log.info("authenticated: denied by user.")
            response.status_int = 401
            return '<script>window.close(); if (window.opener && !window.opener.closed) { window.opener.location.reload(); }</script>'

        api = url(controller='oAuthClient',
                action='getInfo',
                qualified=True,
                **params)
        status, result = self._call(api, fromReq=True)
        if status != ErrorCodes.OK:
            log.error('%s _autenticated: getInfo failed[%s]' % (self.site, result))
            response.status_int = 400
            raise Exception('Error: %s' % status)

        log.debug("_authenticated: response result[%s]" % result)
        params = result[self.site]
        log.debug("_authenticated: response params[%s]" % params)
        if params.has_key('redirect'):
            #
            #  Redirect instead of continuing the login process.
            #
            call = params['redirect']
            return redirect(call)
        api = url('%s/get/info/my' % loginPrefix)
        log.info("_authenticated: api[%s]" % api)
        status, result = self._call(api, fromReq=True)
        log.info("_authenticated: status[%s]" % status)
        if status != ErrorCodes.OK:
            log.error('%s _autenticated: /get/info/my failed[%s]' % (self.site, result))
            response.status_int = 401
            raise Exception('Error: %s' % status)
        #
        #  Setup session info.
        #
        user = result
        log.debug("_authenticated")
        params = { 'user': user, 'groupRoles': None }
        u.saveToSession(params, 1*60*60)
        u.saveCookies()
        
        returnTo = request.params.get('returnTo')
        log.info("_authenticated: returnTo[%s]" % returnTo)
        if not returnTo:
            returnTo = url(controller='conceptnode', action='conceptForm')

        log.info("auth authenticated: Redirecting to [%s] after successful login." % returnTo)
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
