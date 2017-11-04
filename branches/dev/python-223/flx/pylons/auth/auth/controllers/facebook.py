import logging
import json
from urllib2 import urlopen
import urllib

from pylons import session,config, request, tmpl_context as c
from pylons import app_globals as g
from pylons.controllers.util import redirect
from pylons.i18n.translation import _ 

from auth.controllers import member as m
from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render
from auth.model import api
from auth.model import model

log = logging.getLogger(__name__)

class FacebookController(ExtAuthController):
    """
        Facebook authentication related APIs.
    """
    site = 'facebook'

    def __init__(self):
        self.fbDict = {
            'appID': config.get('fb_app_id'),
            'secret': config.get('fb_secret'),
            'tokenEndpoint': config.get('fb_token_endpoint'),
            'graphEndpoint': config.get('fb_graph_endpoint'),
            'oauthUrl': config.get('fb_oauth_url'),
        }

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Facebook.
        """
        appLogin = True if request.params.get('appLogin', '').lower() == 'true' else False
        if request.params.has_key('url'):
            url = request.params.get('url')
            url = urllib.unquote(url)
        log.debug('facebook login: url[%s]' % url)
        returnTo = request.params.get('returnTo','')
        requestor = request.params.get('requestor','')
        log.debug("facebook login: returnTo[%s]" % returnTo)
        log.debug("facebook login: requestor[%s]" % requestor)
        # facebook supports different login display types.
        # see https://developers.facebook.com/docs/reference/dialogs/oauth/
        display_type = "popup"
        # if popup is false, the request is for a non-popup signin
        # default behavior is popup
        popup = request.params.get('popup','true')
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
                    url += '&returnTo=%s' % self._base64encode(returnTo)
                else:
                    url += '?returnTo=%s' % self._base64encode(returnTo)
            if requestor:
                if '?' in url:
                    url += '&requestor=%s' % self._base64encode(requestor)
                else:
                    url += '?requestor=%s' % self._base64encode(requestor)

        role = request.params.get('role', None)
        if role:
            session['role'] = role
            log.debug("facebook login: role[%s]" % role)
        session.save()
        fb = self.fbDict
        if appLogin:
            return 'OK' # No need to return anything for app login.
        redirectUrl = '%s?client_id=%s&scope=email&display=%s&redirect_uri=%s' % (fb['oauthUrl'], fb['appID'], display_type,urllib.quote(url))
        log.debug("Redirect url facebook: %s" % redirectUrl)
        return redirect(redirectUrl)

    @d.trace(log)
    def _getInfo(self, url, code):
        """
            Get the member information from facebook.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        fb = self.fbDict
        params = request.params
        log.debug('facebook _getInfo: params[%s]' % request.params)
        log.debug("facebook _getInfo: code:[%s] Url:[%s]" % (code, url))
        accessToken = None
        if code.lower() == 'applogin' and params.get("token"): #In-app login will return the acess token instead of exchange code.
            log.debug("Got the access token already..")
            accessToken = '%s=%s' % ('access_token', params.get("token"))
        if not accessToken:    
            tokenUrl = '%s?client_id=%s&client_secret=%s&code=%s&redirect_uri=%s' % (fb['tokenEndpoint'], fb['appID'], fb['secret'], code, urllib.quote(url))
            log.debug("Calling tokenUrl: %s" % tokenUrl)
            try:
                f = urlopen(tokenUrl)
                accessToken = f.read()
                try:
                    #
                    #  Facebook started returning accessToken
                    #  in json string since v2.3.
                    #
                    d = json.loads(accessToken)
                    accessToken = urllib.urlencode(d)
                except Exception as e:
                    log.debug("tokenUrl: exception[%s]" % str(e))
            except Exception, e:
                log.exception(e)
                errorCode = ErrorCodes.AUTHENTICATION_FAILED
                return ErrorCodes().asDict(errorCode, 'Provider is down[%s].' % str(e))

        fields = 'first_name,last_name,email,gender,id'
        graphUrl = '%s?%s&fields=%s' % (fb['graphEndpoint'], accessToken, fields)
        log.debug("Calling graphUrl: %s" % graphUrl)
        try:
            f = urlopen(graphUrl)
            j = f.read()
            log.debug("graphUrl: j[%s]" % j)
        except Exception, e:
            log.exception(e)
            errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(errorCode, 'Provider is down[%s].' % str(e))

        fbUser = json.loads(j)
        params = {}
        if fbUser.has_key('first_name'):
            params['firstName'] = fbUser['first_name']
        if fbUser.has_key('last_name'):
            params['lastName'] = fbUser['last_name']
        if fbUser.has_key('email'):
            import auth.controllers.user as u

            email = fbUser['email'].strip().lower()
            member = u.getCurrentUser(request, anonymousOkay=False)
            if member and member.email != email:
                newMember = api.getMemberByEmail(email=email)
                if newMember:
                    errorCode = ErrorCodes.MEMBER_ALREADY_EXISTS
                    return ErrorCodes().asDict(errorCode, 'Already logged in as a different user')

            params['email'] = email
        if fbUser.has_key('gender'):
            params['gender'] = fbUser['gender']
        if fbUser.has_key('id'):
            params['token'] = fbUser['id']
            params['id'] = fbUser['id']
            params['imageURL'] = 'https://graph.facebook.com/%s/picture' % fbUser['id']
        params['authType'] = 'facebook'
        log.debug("graphUrl: params[%s]" % params)
        
        #
        #  Get user information.
        #
        userID = fbUser.get('id')
        token = m.generateDigest(userID, seed=userID)
        authTypeID = g.getMemberAuthTypes()[self.site]
        extData = api.getMemberExtData(authTypeID=authTypeID, token=token)
            
        if not params.has_key('email') or extData:
            
            if extData is None or not extData.verified:
                #
                #  Ask for the email from user.
                #
                from pylons import url
    
                call = url(controller=self.site,
                           action='getEmail',
                           userID=userID,
                           params=params,
                           qualified=True,
                           protocol='https')
    
                result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
                result['response'][self.site] = {
                    'redirect': call,
                }
                return result
            else:
                member = api.getMemberByID(id=extData.memberID)
                params = self.getEmailComplete(userID=userID, email=member.email)

        result['response']['facebook'] = params
        return result

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from facebook.
        """
        log.debug("facebook getInfo: params[%s]" % request.params)
        code = request.params.get('code')
        if code is None:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode)

        url = self._getAuthenticatedURL(self.site)
        returnTo = request.params.get('returnTo')
        if returnTo:
            url = '%s?returnTo=%s' % (url, returnTo)

        return self._getInfo(url, code)

    @d.trace(log, ['userID'])
    def getEmail(self, userID):
        #
        #  Prompt user for the email address.
        #
        import ast
        from auth.forms.member import FacebookEmailForm
        from auth.lib.ck12 import messages

        c.form = FacebookEmailForm()
        c.messages = messages
        c.userID = userID
        params = request.params.get('params')
        if params:
            params = ast.literal_eval(params)
            c.firstName = params.get('firstName')
            c.lastName = params.get('lastName')
            c.imageURL = params.get('imageURL')
            c.gender = params.get('gender')

        if request.method == "POST":
            data = None
            try:
                try:
                    formResult = c.form.to_python(request.params)
                    email = formResult['email']
                except:
                    email = None
                if email:
                    email = email.lower().strip()
                if not email:
                    raise Exception(_(u'Please enter an email address.'))
                log.debug('getEmail: email[%s]' % email)

                data = self.getEmailComplete(userID=userID,
                                             email=email,
                                             params=params
                                            )
                if data and type(data) is not dict:
                    return data
            except Exception as e:
                log.debug('getEmail: e[%s]' % e)
                c.form_errors = e

            if data:
                from pylons import url

                params = data
                call = url(controller=self.site,
                           action='authenticated',
                           qualified=True,
                           protocol='https',
                           **params)
                #
                #  Putting id in params will result in a different url.
                #
                call = '%s&id=%s' % (call, userID)
                log.debug('getEmail: redirect call[%s]' % call)
                return redirect(call)

        return render('%s/authenticate/facebookEmail.html' % self.prefix)
    
    @d.trace(log, ['userID', 'email', 'params'])
    def getEmailComplete(self, userID=None, email=None, params=None):
        if userID is None:
            userID = request.params.get('userID')
        if not email:
            email = request.params.get('email')
        if email:
            email = email.lower().strip()
        if not email:
            raise Exception(_(u'Please enter an email address.'))
        authTypeID = g.getMemberAuthTypes()[self.site]
        token = m.generateDigest(userID, seed=userID)
        toVerify = False
        extData = api.getMemberExtData(authTypeID, token)
        if extData:
            member = api.getMemberByID(id=extData.memberID)
            if member.email != email:
                raise Exception((_(u'Facebook account already used by %(member.email)s')  % {"member.email":member.email}).encode("utf-8"))
            log.debug('getEmailComplete: extData[%s]' % extData)
        else:
            member = api.getMemberByEmail(email=email)
            log.debug('getEmailComplete: member[%s]' % member)
        imageURL = request.params.get('imageURL')
        if member is not None:
            member, extDict = m.getMember(id=member.id, member=member)
            if not member.imageURL:
                api.updateMember(member=member, imageURL=imageURL)
            facebook = extDict.get(self.site)
            if facebook is None:
                member = member.cache(model.INVALIDATE, instance=member)
                extData = api.createMemberExtData(memberID=member.id,
                                                  authTypeID=authTypeID,
                                                  token=token,
                                                  externalID=email,
                                                  verified=True)
                log.debug('getEmailComplete: existing member extData[%s]' % extData)
                toVerify = True
            elif not facebook.get('verified', False):
                toVerify = True
        else:
            memberRoleDict, memberRoleNameDict = g.getMemberRoles()
            roleID = memberRoleNameDict.get('member', 'Member')
            member = api.createMember(givenName=request.params.get('firstName'),
                                      surname=request.params.get('lastName'),
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
            params['roleID'] = roleID

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

            verifiedUrl = url(controller='facebook', action='verifiedEmail', qualified=True, protocol='https')
            expire = request.params.get('expire', 2)
            token = m.encryptPasswordResetToken(member.id, member.email, expire)
            rurl = '%s?t=%s' % (verifiedUrl, token)
            try:
                self._sendEmail(memberID, email, 'MEMBER_FROM_TWITTER', rurl)
            except Exception as en:
                log.error('getInfoComplete: Unable to send email[%s]' % en, exc_info=en)
            c.status = 0

            from auth.forms.member import FacebookEmailCompleteForm
            from auth.lib.ck12 import messages

            c.form = FacebookEmailCompleteForm()
            c.messages = messages
            c.status = 0
            return render('%s/authenticate/facebookEmailComplete.html' % self.prefix)
        
        params = dict(token=userID, email=email, authType=self.site, fromGetInfo=True)
        params['firstName'] = member.givenName
        params['lastName'] = member.surname
        roleID = request.params.get('roleID', None)
        if roleID:
            params['roleID'] = roleID
        gender = request.params.get('gender', None)
        if gender:
            params['gender'] = gender
        if imageURL:
            params['imageURL'] = imageURL
        #params['externalID'] = email
        log.debug('getEmailComplete: params[%s]' % params)
        return params

    @d.trace(log)
    def verifiedEmail(self):
        try:
            email, id, expire = m.decryptPasswordResetToken(request.params['t'], checkExpiration=False)
            member, extDict = m.getMember(id)
            if member.email.lower() != email.lower():
                raise Exception((_(u'Email not matched for %(email)s, should have been %(member.email)s')  % {"email":email,"member.email": member.email}).encode("utf-8"))

            facebook = extDict.get(self.site)
            c.isNewMember = 'false'
            if facebook is None:
                raise Exception((_(u'Incomplete email verification.  Please re-start the process by signing in again.')).encode("utf-8"))
            if not facebook['verified']:
                import time

                if expire < time.time():
                    raise Exception((_(u'Time duration for this request has expired.  Please re-start the process by signing in again.')).encode("utf-8"))
                for ext in member.ext:
                    if ext.authTypeID == facebook['authTypeID']:
                        ext.verified = True
                        c.isNewMember = 'true'
                        member = member.cache(model.INVALIDATE, instance=member)
                        api.update(instance=ext)
                        member.emailVerified = True
                        api.update(instance=member)
                        break

            from auth.forms.member import FacebookEmailVerifiedForm
            from auth.lib.ck12 import messages

            c.form = FacebookEmailVerifiedForm()
            c.site = config.get('web_prefix_url', 'http://www.ck12.org')
            c.messages = messages
        except Exception, e:
            log.error('Facebook emailVerified Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_UPDATE_MEMBER
            c.form = e
            c.form_errors = e
            #
            #  Delete the Facebook entry so that it can be verified again.
            #
            for ext in member.ext:
                if ext.authType.name == self.site:
                    try:
                        member = member.cache(model.INVALIDATE, instance=member)
                        api.delete(ext)
                    except Exception, e:
                        log.exception('verifiedEmail: cannot delete facebook entry[%s] exception[%s]' % (ext, e))

        return render('%s/authenticate/facebookEmailVerified.html' % self.prefix)

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
        log.debug('facebook authenticated: params[%s]' % request.params)
        self.base64Encoded = True
        return self._authenticated(self.site)
