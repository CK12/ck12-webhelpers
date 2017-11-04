import logging
import urllib
import urlparse
import json

import oauth2 as oauth

from Crypto.Cipher import Blowfish
from base64 import b16encode, b16decode

from pylons import config, request, session, response, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons.controllers.util import redirect
from pylons import app_globals as g

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.controllers import member as m
from auth.model import api
from auth.model import model
from auth.model import exceptions as ex
from auth.lib.base import BaseController, render


log = logging.getLogger(__name__)

class TwitterController(ExtAuthController):
    """
        Twitter authentication related APIs.
    """
    site = 'twitter'

    def __init__(self):
        self.twitterDict = {
            'consumerKey': config.get('twitter_consumer_key'),
            'secret': config.get('twitter_secret'),
            'tokenUrl': config.get('twitter_token_url'),
            'authUrl': config.get('twitter_auth_url'),
            'accessUrl': config.get('twitter_access_url'),
            'callbackUrl': config.get('twitter_callback_url'),
            'usershowUrl': config.get('twitter_user_show_url'),
        }

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Twitter.
        """
        twitter = self.twitterDict
        #
        #  Step 1. Get a request token from Twitter.
        #
        #   Set the oauth_callback here for returning to the right place after authUrl.
        #
        consumer = oauth.Consumer(key=twitter['consumerKey'], secret=twitter['secret'])
        client = oauth.Client(consumer)
        tokenUrl = twitter['tokenUrl']
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        else:
            url = twitter['callbackUrl']
        returnTo = request.params.get('returnTo')
        requestor = request.params.get('requestor')
        log.debug("twitter login: returnTo[%s]" % returnTo)
        log.debug("twitter login: requestor[%s]" % requestor)
        # if popup is false, the request is for a non-popup signin
        # default behavior is popup
        popup = request.params.get('popup','true')
        session['isPopup'] = popup
        if popup == 'false':
            if requestor:
                session['requestor'] = requestor 
            if returnTo:
                session['returnTo'] = returnTo
        else:
            if returnTo:
                if '?' in url:
                    url += '&returnTo=%s' % returnTo
                else:
                    url += '?returnTo=%s' % returnTo

        role = request.params.get('role', None)
        if role:
            session['role'] = role
            log.debug("toitter login: role[%s]" % role)
        session.save()
        url = urllib.quote(url, safe='')
        log.debug('twitter login: url[%s]' % url)
        tokenUrl = '%s?oauth_callback=%s' % (tokenUrl, url)
        resp, content = client.request(tokenUrl, 'GET')
        if resp['status'] != '200':
            raise Exception((_(u"twitter login: Invalid response on token request from Twitter.")).encode("utf-8"))
        #
        #  Step 2. Store the request token in a cookie for later use.
        #
        rt = urlparse.parse_qsl(content)
        tokenDict = dict(rt)
        response.set_cookie('oauth_token', tokenDict['oauth_token'])
        response.set_cookie('oauth_token_secret', tokenDict['oauth_token_secret'])
        #
        #  Step 3. Ask Twitter to authorize.
        #
        #   Twitter does not return the email.
        #
        #   May redirect to ask the user for the email after authenticating (if it's the first time).
        #
        redirectUrl = '%s?oauth_token=%s' % (twitter['authUrl'], tokenDict['oauth_token'])
        log.debug("Redirect url twitter: %s" % redirectUrl)
        return redirect(redirectUrl)

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from twitter.
        """
        #
        #  Response data from twitter.
        #
        token = request.params.get('oauth_token')
        verifier = request.params.get('oauth_verifier')
        #
        #  Get access token stored earlier from cookie.
        #
        oauthToken = request.cookies.get('oauth_token')
        oauthTokenSecret = request.cookies.get('oauth_token_secret')
        if token != oauthToken:
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Token mismatched.')

        twitter = self.twitterDict
        #
        #  Switch to use the access token.
        #
        consumer = oauth.Consumer(key=twitter['consumerKey'], secret=twitter['secret'])
        token = oauth.Token(key=oauthToken, secret=oauthTokenSecret)
        token.set_verifier(verifier)
        client = oauth.Client(consumer, token)
        resp, content = client.request(twitter['accessUrl'], 'POST')
        if resp['status'] != '200':
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Invalid response status[%s] on token request from Twitter.' % resp['status'])
        #
        #  Get user information.
        #
        userInfo = urlparse.parse_qsl(content)
        userDict = dict(userInfo)

        userID = userDict.get('user_id')
        token = m.generateDigest(userID, seed=userID)
        authTypeID = g.getMemberAuthTypes()[self.site]
        extData = api.getMemberExtData(authTypeID=authTypeID, token=token)
        if extData is None or not extData.verified:
            #
            #  Ask for the email from user.
            #
            from pylons import url

            screenName = userDict.get('screen_name')

            s = userDict['oauth_token'] + ':' + userDict['oauth_token_secret']
            # since blowfish needs input string of length 8
            l = len(s)
            t = divmod(l, 8)
            _d = (((t[0] + 1) if t[1] else t[0]) * 8) - l
            s = s + (' ' * _d)

            ttoken = b16encode(Blowfish.new(config.get('twitter_secret')).encrypt(s))

            call = url(controller=self.site,
                       action='getEmail',
                       userID=userID,
                       screenName=screenName,
                       token=oauthToken,
                       ttoken=ttoken,
                       qualified=True,
                       protocol='https')

            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            result['response'][self.site] = {
                'redirect': call,
            }
            return result
        #
        #  User logged in via twitter before, continue the login process.
        #
        member = api.getMemberByID(id=extData.memberID)
        return self.getEmailComplete(userID=userID, email=member.email, oauthToken=userDict['oauth_token'],
                                             oauthTokenSecret=userDict['oauth_token_secret'])

    def getUserProfileImage(self, screenName, oauthToken, oauthTokenSecret):
        imageURL = None
        url = '%s?screen_name=%s' % (self.twitterDict['usershowUrl'], screenName)
        consumer = oauth.Consumer(key=self.twitterDict['consumerKey'], secret=self.twitterDict['secret'])
        token = oauth.Token(key=oauthToken, secret=oauthTokenSecret)
        #token.set_verifier(verifier)
        client = oauth.Client(consumer, token)
        resp, content = client.request(url, 'GET')
        try:
            if resp['status'] == '200':
                userDict = json.loads(content)
                imageURL = userDict['profile_image_url']
                imageURL = imageURL.replace('http:', 'https:')
        except Exception, e:
            log.error('getUserProfileImage twitter: %s' % str(e))
        return imageURL

    @d.trace(log, ['userID', 'screenName', 'token', 'ttoken'])
    def getEmail(self, userID, screenName, token, ttoken):
        oauthToken = request.cookies.get('oauth_token')
        if token != oauthToken:
            raise ex.InvalidArgumentException((_(u'getEmail: token mismatched.')).encode("utf-8"))
        #
        #  Prompt user for the email address.
        #
        from auth.forms.member import TwitterEmailForm
        from auth.lib.ck12 import messages

        c.form = TwitterEmailForm()
        c.messages = messages
        c.userID = userID
        c.screenName = screenName
        c.token = token
        c.ttoken = ttoken

        if request.method == "POST":
            try:
                formResult = c.form.to_python(request.params)
                email = formResult['email']
                if email:
                    email = email.lower().strip()

                s = Blowfish.new(config.get('twitter_secret')).decrypt(b16decode(ttoken))
                a = s.split(':')
                oauthToken = a[0].strip()
                oauthTokenSecret = a[1].strip()

                return self.getEmailComplete(userID=userID,
                                             email=email,
                                             screenName=screenName,
                                             oauthToken=oauthToken,
                                             oauthTokenSecret=oauthTokenSecret)
            except Exception, e:
                log.debug('getEmail: e[%s]' % e)
                c.form_errors = e

        return render('%s/authenticate/twitterEmail.html' % self.prefix)

    @d.trace(log, ['userID', 'email', 'screenName', 'oauthToken', 'oauthTokenSecret'])
    def getEmailComplete(self, userID=None, email=None, screenName=None, oauthToken=None, oauthTokenSecret=None):
        if userID is None:
            userID = request.params.get('userID')
        if email is None:
            email = request.params.get('email')
        if email:
            email = email.lower().strip()
        authTypeID = g.getMemberAuthTypes()[self.site]
        token = m.generateDigest(userID, seed=userID)
        toVerify = False
        extData = api.getMemberExtData(authTypeID, token)
        if extData:
            member = api.getMemberByID(id=extData.memberID)
            if member.email != email:
                raise Exception((_(u'Twitter account already used by %(member.email)s')  % {"member.email":member.email}).encode("utf-8"))
        else:
            member = api.getMemberByEmail(email=email)
        if member is not None:
            member, extDict = m.getMember(id=member.id, member=member)
            if not member.imageURL and oauthToken and oauthTokenSecret:
                imageURL = self.getUserProfileImage(screenName, oauthToken, oauthTokenSecret)
                api.updateMember(member=member, imageURL=imageURL)
            twitter = extDict.get(self.site)
            if twitter and twitter.get('token') != token:
                #
                #  Unmatched token, recreate.
                #
                api.remove_member_ext_data(member.id, authTypeID)
                twitter = None
            if not twitter:
                member = member.cache(model.INVALIDATE, instance=member)
                extData = api.createMemberExtData(memberID=member.id,
                                                  authTypeID=authTypeID,
                                                  token=token,
                                                  externalID=email,
                                                  verified=True)
                log.debug('getEmailComplete: existing member extData[%s]' % extData)
                toVerify = True
            elif not twitter.get('verified', False):
                toVerify = True
        else:
            if screenName is None:
                screenName = request.params.get('screenName')
            imageURL = None
            if oauthToken and oauthTokenSecret:
                imageURL = self.getUserProfileImage(screenName, oauthToken, oauthTokenSecret)

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
                                      emailVerified=False,
                                      imageURL=imageURL)
            params = member.asDict()
            params['authID'] = params['id']
            params['givenName'] = member.givenName
            params['surname'] = member.surname
            params['roleID'] = member.roleID

            prefix = config.get('flx_prefix_url')
            createMemberUrl = '%s/create/member' % prefix
            status, result = self._call(createMemberUrl, method='POST', params=params, fromReq=True)
            log.debug('getEmailComplete: saved member in flx2 status=%s and result=%s' % (status, result))

            toVerify = True
            log.debug('getEmailComplete: new member extData[%s]' % member.ext)
            self._newHubSpotContact(member)
        if toVerify:
            memberID = member.id
            from pylons import url

            verifiedUrl = url(controller='twitter', action='verifiedEmail', qualified=True, protocol='https')
            expire = request.params.get('expire', 2)
            token = m.encryptPasswordResetToken(member.id, member.email, expire)
            rurl = '%s?t=%s' % (verifiedUrl, token)
            try:
                #e = api.createEventForType(typeName='MEMBER_FROM_TWITTER', objectID=None, objectType=None, eventData=rurl, ownerID=memberID, processInstant=False)
                #n = api.createNotification(eventTypeID=e.eventTypeID, subscriberID=memberID, type='email', frequency='instant')
                #h.processInstantNotifications([e.id], notificationIDs=[n.id], user=memberID, noWait=True)
                self._sendEmail(memberID, email, 'MEMBER_FROM_TWITTER', rurl)
            except Exception, en:
                log.error('getInfoComplete: Unable to send email[%s]' % en, exc_info=en)
            c.status = 0

            from auth.forms.member import TwitterEmailCompleteForm
            from auth.lib.ck12 import messages
 
            c.form = TwitterEmailCompleteForm()
            c.messages = messages
            c.status = 0
            return render('%s/authenticate/twitterEmailComplete.html' % self.prefix)
        
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response'][self.site] = {
            'token': userID,
            'email': email,
            'authType': self.site,
        }
        return result

    @d.trace(log)
    def verifiedEmail(self):
        try:
            email, id, expire = m.decryptPasswordResetToken(request.params['t'], checkExpiration=False)
            member, extDict = m.getMember(id)
            if member.email.lower() != email.lower():
                raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))

            twitter = extDict.get(self.site)
            c.isNewMember = 'false'
            if twitter is None:
                raise Exception((_(u'Incomplete email verification.  Please re-start the process by signing in again.')).encode("utf-8"))
            if not twitter['verified']:
                import time

                if expire < time.time():
                    raise Exception((_(u'Time duration for this request has expired.  Please re-start the process by signing in again.')).encode("utf-8"))
                for ext in member.ext:
                    if ext.authTypeID == twitter['authTypeID']:
                        ext.verified = True
                        c.isNewMember = 'true'
                        member = member.cache(model.INVALIDATE, instance=member)
                        api.update(instance=ext)
                        member.emailVerified = True
                        api.update(instance=member)
                        break

            from auth.forms.member import TwitterEmailVerifiedForm
            from auth.lib.ck12 import messages

            c.form = TwitterEmailVerifiedForm()
            c.site = config.get('web_prefix_url', 'https://www.ck12.org')
            c.messages = messages
        except Exception, e:
            log.error('Twitter emailVerified Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            c.form = e
            c.form_errors = e
            #
            #  Delete the Twitter entry so that it can be verified again.
            #
            for ext in member.ext:
                if ext.authType.name == self.site:
                    try:
                        member = member.cache(model.INVALIDATE, instance=member)
                        api.delete(ext)
                    except Exception, e:
                        log.exception('verifiedEmail: cannot delete twitter entry[%s] exception[%s]' % (ext, e))

        return render('%s/authenticate/twitterEmailVerified.html' % self.prefix)

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
        log.debug('twitter authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
