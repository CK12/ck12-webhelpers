import logging
import urllib
import urlparse

import oauth2 as oauth

from pylons import config, request, response
from pylons.i18n.translation import _ 
from pylons.controllers.util import redirect
from pylons import app_globals as g

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.controllers import member as m
from auth.model import api
from auth.model import model
from auth.lib.base import BaseController


log = logging.getLogger(__name__)

__controller__ = 'OAuthClientController'

class OAuthClientController(ExtAuthController):
    """
        CK-12 OAuth authentication related APIs.
    """
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

    @d.trace(log, ['url'])
    def login(self, url=None):
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
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        else:
            url = ck12oauth['callbackUrl']
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
            raise Exception((_(u"ck12oauth login: Invalid response on token request from OAuthClient.")).encode("utf-8"))
        #
        #  Step 2. Store the request token in a cookie for later use.
        #
        rt = urlparse.parse_qsl(content)
        log.info('ck12oauth rt[%s]' % rt)
        tokenDict = dict(rt)
        response.set_cookie('oauth_token', tokenDict['oauth_token'])
        response.set_cookie('oauth_token_secret', tokenDict['oauth_token_secret'])
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
        oauthToken = request.cookies.get('oauth_token')
        oauthTokenSecret = request.cookies.get('oauth_token_secret')
        log.debug('getInfo: oauthToken[%s]' % oauthToken)
        log.debug('getInfo: oauthTokenSecret[%s]' % oauthTokenSecret)
        if token != oauthToken:
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Token mismatched.')

        ck12oauth = self.ck12oauthDict
        #
        #  Switch to use the access token.
        #
        consumer = oauth.Consumer(key=ck12oauth['consumerKey'], secret=ck12oauth['secret'])
        token = oauth.Token(key=oauthToken, secret=oauthTokenSecret)
        token.set_verifier(verifier)
        client = oauth.Client(consumer, token)
        resp, content = client.request(ck12oauth['accessUrl'], 'POST')
        if resp['status'] != '200':
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Invalid response status[%s] on token request from OAuthClient.' % resp['status'])
        #
        #  Get user information.
        #
        log.info('getInfo: resp[%s]' % resp)
        log.info('getInfo: content[%s]' % content)
        userInfo = urlparse.parse_qsl(content)
        log.info('getInfo: userInfo[%s]' % userInfo)
        userDict = dict(userInfo)
        log.info('getInfo: userDict[%s]' % userDict)
        userID = userDict.get('user_id')
        log.info('getInfo: userID[%s]' % userID)
        email = userDict.get('email')
        log.info('getInfo: email[%s]' % email)
        return self._getInfo(userID=userID, email=email)

    @d.trace(log, ['userID', 'email', 'screenName'])
    def _getInfo(self, userID=None, email=None, screenName=None):
        if userID is None:
            userID = request.params.get('userID')
        if not email:
            email = request.params.get('email')
        if email:
            email = email.lower().strip()
        authTypeID = g.getMemberAuthTypes()[self.site]
        token = m.generateDigest(userID, seed=userID)
        extData = api.getMemberExtData(authTypeID, token)
        if extData:
            member = api.getMemberByID(id=extData.memberID)
            if member.email != email:
                raise Exception((_(u'CK12OAuth account already used by %(member.email)s')  % {"member.email":member.email}).encode("utf-8"))
        else:
            member = api.getMemberByEmail(email=email)
        if member is not None:
            member, extDict = m.getMember(id=member.id, member=member)
            ck12oauth = extDict.get(self.site)
            if ck12oauth is None:
                member = member.cache(model.INVALIDATE, instance=member)
                extData = api.createMemberExtData(memberID=member.id,
                                                  authTypeID=authTypeID,
                                                  token=token,
                                                  externalID=email,
                                                  verified=True)
                log.debug('getEmailComplete: existing member extData[%s]' % extData)
        else:
            if screenName is None:
                screenName = request.params.get('screenName')
            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            roleID = memberRoleNameDict.get('member', 'Member')
            member = api.createMember(givenName=screenName,
                                      surname='',
                                      authTypeID=authTypeID,
                                      token=token,
                                      email=email,
                                      externalID=email,
                                      stateID=2,
                                      roleID=roleID,
                                      groupID=1,
                                      emailVerified=False)
            log.debug('getEmailComplete: new member extData[%s]' % member.ext)
            self._newHubSpotContact(member)

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response'][self.site] = {
            'token': userID,
            'email': email,
            'authType': self.site,
        }
        return result

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
        log.debug('oAuthClient authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
