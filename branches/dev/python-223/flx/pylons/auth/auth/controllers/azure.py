import logging
import json
import jwt
from urllib2 import urlopen
import urllib

from pylons import config, request, session, tmpl_context as c
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController


log = logging.getLogger(__name__)

class AzureController(ExtAuthController):
    """
        Microsoft Azure authentication related APIs.
    """
    site = 'azure'

    def __init__(self):
        self.azureDict = {
            'appID': config.get('azure_client_id'),
            'secret': config.get('azure_secret'),
            'oauthUrl': config.get('azure_oauth_url'),
            'tokenUrl': config.get('azure_token_url'),
            'scopes': config.get('azure_scopes'),
            'state': config.get('azure_state'),
        }

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Microsoft Azure.
        """
        azure = self.azureDict
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        log.debug('MS azure login: url[%s]' % url)
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
        oauthUrl = azure['oauthUrl']
        ch = '&' if '?' in oauthUrl else '?'
        redirectUrl = '%s%sclient_id=%s&response_type=code&response_mode=query&state=%s&scope=%s&redirect_uri=%s' % (azure['oauthUrl'], ch, azure['appID'], azure['state'], urllib.quote(azure['scopes'], safe=''), urllib.quote(url, safe=''))
        log.debug("login: redirectUrl[%s]" % redirectUrl)
        return redirect(redirectUrl)

    @d.trace(log)
    def _getInfo(self, url, code):
        """
            Get the member information from azure.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        azure = self.azureDict
        log.debug('_getInfo: params[%s]' % request.params)
        log.debug('_getInfo: code[%s] Url[%s]' % (code, url))

        try:
            tokenUrl = azure['tokenUrl']
            log.debug('_getInfo: token tokenUrl[%s]' % tokenUrl)
            data = {
                'client_id': azure['appID'],
                'grant_type': 'authorization_code',
                'client_secret': azure['secret'],
                'redirect_uri': url,
                'code': code,
            }
            log.debug('_getInfo: data[%s]' % data)
            params = urllib.urlencode(data)
            params = '%s&scope=%s' % (params, urllib.quote(azure['scopes'], safe=''))
            log.debug('_getInfo: params[%s]' % params)

            f = urlopen(tokenUrl, data=params)
            try:
                data = f.read()
                data = json.loads(data)
                log.debug("_getInfo: Called tokenUrl data[%s]" % data)
            finally:
                f.close()

            refreshToken = data.get('refresh_token')
            log.debug('_getInfo: refreshToken[%s]' % refreshToken)

            idToken = data['id_token']
            log.debug('_getInfo: idToken[%s]' % idToken)
            profile = jwt.decode(idToken, verify=False)
            log.debug("_getInfo: profile[%s]" % profile)
        except Exception, e:
            log.exception(e)
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Provider is down[%s].' % str(e))

        email = profile.get('email', None)
        if not email:
            #
            #  Try to get email from various fields.
            #
            pn = profile.get('preferred_username', None)
            if pn and '@' in pn:
                email = pn
            if not email:
                un = profile.get('unique_name', None)
                if un and '@' in un:
                    email = un
                if not email:
                    upn = profile.get('upn', None)
                    if upn and '@' in upn:
                        email = upn
        if not email:
            errorCode = ErrorCodes.INVALID_EMAIL
            return ErrorCodes().asDict(errorCode, 'No email provided.')
        email = email.strip().lower()

        name = profile.get('name', None)
        if name:
            if ' ' in name:
                firstName, lastName = name.split(' ', 1)
            else:
                firstName = name
                lastName = ''
        else:
            firstName = ''
            lastName = ''
        subject = profile.get('sub')
        params = {
            'firstName':    firstName,
            'lastName':     lastName,
            'email':        email,
            'token':        subject,
            'externalID':   subject,
            'authType':     self.site,
        }
        log.debug("_getInfo: params%s" % params)

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
            Get the member information from azure.
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
        log.debug('azure authenticated: params[%s]' % request.params)
        self.base64Encoded = True
        return self._authenticated(self.site)
