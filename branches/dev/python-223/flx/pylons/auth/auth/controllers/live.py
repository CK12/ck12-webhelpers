import logging
import json
from urllib2 import urlopen
import urllib

from pylons import config, request, session, tmpl_context as c
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController


log = logging.getLogger(__name__)

class LiveController(ExtAuthController):
    """
        Microsoft Live authentication related APIs.
    """
    site = 'live'

    def __init__(self):
        self.liveDict = {
            'appID': config.get('live_client_id'),
            'secret': config.get('live_secret'),
            'oauthUrl': config.get('live_oauth_url'),
            'tokenUrl': config.get('live_token_url'),
            'scopes': config.get('live_scopes'),
            'state': config.get('live_state'),
            'userInfoUrl': config.get('live_userinfo_url'),
            'redirectUrl': config.get('live_redirect_uri'),
        }

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Microsoft Live.
        """
        live = self.liveDict
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        log.debug('MS live login: url[%s]' % url)
        # if popup is false, the request is for a non-popup signin
        # default behavior is popup
        popup = request.params.get('popup','true')
       
        try:
            url, rest = url.split('?')
            if '&' in rest:
                returnTo, requestor = rest.split('&')
                if '=' in returnTo:
                    returnTo = rest.split('=')[1]
                if '=' in requestor:
                    requestor = rest.split('=')[1]
            else:
                if '=' in rest:
                    returnTo = rest.split('=')[1]
                requestor = ''
        except ValueError:
            returnTo = request.params.get('returnTo')
            requestor = request.params.get('requestor', '')
        log.debug("login: returnTo[%s]" % returnTo)
        log.debug("login: requestor[%s]" % requestor)
        session['isPopup'] = popup
        if popup == 'false':
            if requestor:
                session['requestor'] = self._base64encode(requestor)
            if returnTo:
                session['returnTo'] = self._base64encode(returnTo)
        else:
            ## Use base64 encode to make sure no special chars are passed to the returnTo url
            if returnTo:
                if '?' in url:
                    url += '&returnTo=%s' % returnTo
                else:
                    url += '?returnTo=%s' % returnTo
            if requestor:
                if '?' in url:
                    url += '&requestor=%s' % requestor
                else:
                    url += '?requestor=%s' % requestor

        role = request.params.get('role', None)
        if role:
            session['role'] = role
            log.debug("login: role[%s]" % role)
        session.save()
        oauthUrl = live['oauthUrl']
        ch = '&' if '?' in oauthUrl else '?'
        redirectUrl = '%s%sresponse_type=code&client_id=%s&scope=%s&redirect_uri=%s' % (live['oauthUrl'], ch, live['appID'], urllib.quote(live['scopes']), urllib.quote(url))
        log.debug("login: redirectUrl[%s]" % redirectUrl)
        return redirect(redirectUrl)

    @d.trace(log)
    def _getInfo(self, url, code):
        """
            Get the member information from live.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        live = self.liveDict
        log.debug('_getInfo: params[%s]' % request.params)
        log.debug("_getInfo: code:[%s] Url:[%s]" % (code, url))

        tokenUrl = live['tokenUrl']
        ch = '&' if '?' in tokenUrl else '?'
        tokenUrl = '%s%sgrant_type=authorization_code&client_id=%s&client_secret=%s&code=%s&redirect_uri=%s' % (tokenUrl, ch, live['appID'], live['secret'], code, urllib.quote(url))
        log.debug("_getInfo: Calling tokenUrl[%s]" % tokenUrl)
        try:
            f = urlopen(tokenUrl)
            j = f.read()
            data = json.loads(j)
        except Exception, e:
            log.exception(e)
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Provider is down[%s].' % str(e))

        log.debug("_getInfo: Called tokenUrl data[%s]" % data)

        accessToken = data['access_token']
        scope = data['scope']
        log.debug("_getInfo: accessToken[%s]" % accessToken)
        log.debug("_getInfo: scope[%s]" % scope)

        userInfoUrl = live['userInfoUrl']
        ch = '&' if '?' in userInfoUrl else '?'
        userInfoUrl = '%s%saccess_token=%s' % (userInfoUrl, ch, accessToken)
        log.debug("_getInfo: Calling userInfoUrl[%s]" % userInfoUrl)
        try:
            f = urlopen(userInfoUrl)
            j = f.read()
            data = json.loads(j)
        except Exception, e:
            log.exception(e)
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Provider is down[%s].' % str(e))

        log.debug("_getInfo: Called userInfoUrl data[%s]" % data)
        emails = data.get('emails', {})
        params = {
            'firstName':    data.get('first_name', None),
            'lastName':     data.get('last_name', None),
            'email':        emails.get('preferred', emails.get('account', None)),
            'token':        data.get('id', None),
            'authType':     self.site,
        }
        log.debug("_getInfo: params%s" % params)

        email = params['email'].strip().lower()
        if email:
            import auth.controllers.user as u

            member = u.getCurrentUser(request, anonymousOkay=False)
            if member and member.email != email:
                from auth.model import api

                newMember = api.getMemberByEmail(email=email)
                if newMember:
                    errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
                    return ErrorCodes().asDict(errorCode, 'Already logged in as a different user')

        result['response'][self.site] = params
        return result

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from live.
        """
        log.debug("getInfo: params[%s]" % request.params)
        code = request.params.get('code')
        if code is None:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode)

        url = self._getAuthenticatedURL(self.site)
        returnTo = request.params.get('returnTo')
        if returnTo:
            url = '%s?returnTo=%s' % (url, returnTo)

        return self._getInfo(url, code)

    #
    #  Internal code for testing.
    #
    @d.trace(log)
    def test(self):
        """
            Test the login action.
        """
        return self._test(self.site)

    @d.trace(log)
    def authenticated(self):
        """
            This is an example for how authenticated could be implemented at
            the App layer.
        """
        log.debug('live authenticated: params[%s]' % request.params)
        self.base64Encoded = True
        return self._authenticated(self.site)
