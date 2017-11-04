import logging
import json, base64
from cookielib import Cookie, CookieJar
from pylons.i18n.translation import _ 
from urllib2 import build_opener, HTTPCookieProcessor
from urllib import quote, unquote
from datetime import datetime
from Crypto.Cipher import Blowfish
import re

from pylons import config, request, session, url, tmpl_context as c
from pylons import app_globals as g
from pylons.controllers.util import redirect
from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render
from auth.lib.remoteapi import RemoteAPI
import auth.controllers.user as u
import auth.lib.helpers as h
from auth.model import api, model

log = logging.getLogger(__name__)

__controller__ = 'ExtAuthController'
class ExtAuthController(BaseController):

    base64Encoded = False

    @d.trace(log, ['cj', 'fromReq'])
    def _restoreCookiesFromSession(self, cj, fromReq=False):
        """
            Copy cookies from session to the request for remote server
        """
        log.debug('_restoreCookiesFromSession: session[%s]' % session)
        key = config.get('beaker.session.key')
        if 'cookies' in session:
            for cookie in session['cookies']:
                if cookie.name == key:
                    cj.set_cookie(cookie)
                    log.debug("Copied cookie: %s" % cookie.name)

        from pylons import response

        if hasattr(response, 'cookies') and response.cookies:
            cookies = response.cookies
            for name in cookies.keys():
                value = request.cookies[name]
                cookie = Cookie(version=0,
                                name=name,
                                value=value,
                                port=None,
                                port_specified=False,
                                domain=config.get('beaker.session.domain'),
                                domain_specified=False,
                                domain_initial_dot=False,
                                path='/',
                                path_specified=True,
                                secure=False,
                                expires=None,
                                discard=True,
                                comment=None,
                                comment_url=None,
                                rest={'HttpOnly': None},
                                rfc2109=False)
                cj.set_cookie(cookie)
                log.debug("Copied response cookie: %s" % cookie.name)
        if fromReq:
            log.debug("_restoreCookiesFromSession: cookies[%s]" % request.cookies)
            for name in request.cookies.keys():
                value = request.cookies[name]
                cookie = Cookie(version=0,
                                name=name,
                                value=value,
                                port=None,
                                port_specified=False,
                                domain=config.get('beaker.session.domain'),
                                domain_specified=False,
                                domain_initial_dot=False,
                                path='/',
                                path_specified=True,
                                secure=False,
                                expires=None,
                                discard=True,
                                comment=None,
                                comment_url=None,
                                rest={'HttpOnly': None},
                                rfc2109=False)
                cj.set_cookie(cookie)
                log.debug("Copied cookie: %s" % cookie.name)
        return cj

    @d.trace(log, ['cj'])
    def _storeCookiesToSession(self, cj):
        """
            Store cookies from remote server response to session
        """
        if not "cookies" in session:
            session['cookies'] = []

        key = config.get('beaker.session.key')
        # read all the cookies API response and add them to the session.
        for index, cookie in enumerate(cj):
            if cookie.name == key:
                session['cookies'].append(cookie)
                log.debug("Saved cookie: %s" % cookie.name)
        session.save()

    ## Do not trace calls to this method - it can log passwords.
    #@d.trace(log, ['durl', 'timeout', 'method', 'params', 'fromReq', 'external'])
    def _call(self, durl, timeout=30, method='GET', params=None, fromReq=False, external=False):
        """
            Make call to the api
        """
        import urllib2

        durl = durl.encode('utf-8')
        log.debug("Calling remote url[%s]" % durl)
        cj = CookieJar()
        self._restoreCookiesFromSession(cj, fromReq=fromReq)
        opener = build_opener(HTTPSHandlerV3(), HTTPCookieProcessor(cj))
        opener.addheaders = [
            ('Accept', 'application/json, */*; q=0.01'),
            ('Host', 'www.ck12.org'),
            ('Content-Type', 'application/json; charset=UTF-8'),
            ('Connection', 'keep-alive'),
        ]
        start_time = datetime.today()

        postBody = None
        if params:
            if method == 'POST':
                postBody = h.urlencode(params)
                log.debug('_call: durl[%s] postBody[%s]' % (durl, re.sub(r'(token=)([^\&\?]*)', r'\1*****', postBody)))
            else:
                if '?' in durl:
                    durl += '&%s' % h.urlencode(params)
                else:
                    durl += '?%s' % h.urlencode(params)
                log.debug('_call: durl[%s]' % durl)

        try:
            if method == 'POST':
                data = opener.open(durl, postBody, timeout).read()
            else:
                data = opener.open(durl, None, timeout).read()
        except urllib2.HTTPError, he:
            log.warn('_call: HTTPError[%s]' % str(he))
            raise he
        except urllib2.URLError, ue:
            log.warn('_call: URLError[%s]' % str(ue))
            raise urllib2.URLError((_(u'Network or provider down.')).encode("utf-8"))
        except Exception, e:
            log.warn('_call: Exception[%s]' % str(e))
            raise e

        end_time = datetime.today()
        # Make sure we are getting a "response" field in the API response
        if not "response" in data:
            raise Exception((_(u'response field missing in API response')).encode("utf-8"))
        self._storeCookiesToSession(cj)
        delta = end_time - start_time
        log.debug("[%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , durl))

        if data.startswith('"'):
            data = data[1:-1]
            data = data.replace('\\"', '"')
        log.debug('_call: data[%s]' % data)

        r = json.loads(data)
        log.info('_call: r[%s]' % r)
        if external:
            return r

        if isinstance(r, list):
            r = r[0]

        if isinstance(r, dict):
            resp = r['response']
        else:
            resp = r
        return r['responseHeader']['status'], resp

    @d.trace(log)
    def _test(self, site):
        """
            Test the login action.
        """
        c.url = url(controller=site, action='authenticated', qualified=True, protocol='https')
        c.prefix = self.prefix
        return render('%s/authenticate/%s.html' % (self.prefix, site))

    @d.trace(log)
    def _getAuthenticatedURL(self, site):
        """
            Return the URL of the authenticated action for the given site.
        """
        return url(controller=site, action='authenticated', qualified=True, protocol='https')

    @d.trace(log)
    def _authenticated(self, site):
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
        # check if it was a non popup version of signin
        # this is usually the case for signin via apps e.g Windows App or Android apps
        if 'isPopup' in session:
            popup = (session['isPopup'].lower() == "true")
        elif site in ['clever']:
            popup = False
        else:
            popup = True # default behavior is popup
        log.debug("_authenticated: Request params[%s]" % params)
        log.debug("popup: %s" % popup)
        returnTo = request.params.get('returnTo')
        if returnTo and self.base64Encoded:
            returnTo = self._base64decode(returnTo)
        # if not the popup version, check for returnTo in session
        # this is normally set in the login method of the controllers.
        if not popup:
            if 'returnTo' in session:
                returnTo = session['returnTo']
                if returnTo and self.base64Encoded:
                    returnTo = self._base64decode(returnTo)
            else:
                returnTo = '%s/my/dashboard/' % config.get('web_prefix_url')
        
        denied = False
        if site == 'facebook':
            reason = params.get('error_reason')
            if reason == 'user_denied':
                denied = True
        elif site == 'google' or site == 'classlink' or site == 'edmodoconnect':
            error = params.get('error')
            if error == 'access_denied':
                denied = True
        elif site == 'twitter':
            denied = params.get('denied')
            if denied:
                denied = True
        elif site == 'live':
            error = params.get('error')
            if error:
                denied = True
        elif site == 'clever':
            error = params.get('error')
            if error:
                denied = True
        elif site == 'oAuthClient':
            denied = params.get('denied')
            if denied:
                denied = True
        if popup and denied:
            return '<script>window.close(); if (window.opener && !window.opener.closed) { window.opener.location.reload(); }</script>'
        elif denied:
            return redirect(url('signin', returnTo=returnTo, protocol='https'))

        fromGetInfo = request.params.get('fromGetInfo', False)
        if fromGetInfo:
            params = request.params
        else:
            restApi = url(controller=site,
                        action='getInfo',
                        qualified=True,
                        protocol='https',
                        **params)
            status = None
            result = None
            # Bug #57674 - We wan't to capture third-party network issues
            # and message to users that they are down and to contact their support.
            import ssl
            import urllib2
            site_name = h.getExtSiteName(site)
            site_down_msg = "<p>Sorry, but {0} is unreachable at this time. Please contact {0} support and try again later.</p>".format(site_name)
            site_down_status = "Third-party network is down"
            try:
                status, result = self._call(restApi, fromReq=True)
            except ssl.SSLError, sslerror:
                log.error("_athenticated: SSLError Exception[%s]" % str(sslerror), exc_info=sslerror)
                c.status = site_down_status
                c.message = site_down_msg
                return render('%s/common/error.html' % self.prefix)
            except urllib2.URLError, ue:
                log.error("_athenticated: URLError Exception[%s]" % str(ue), exc_info=ue)
                c.status = site_down_status
                c.message = site_down_msg
                return render('%s/common/error.html' % self.prefix)
            except Exception, e:
                log.warn('_athenticated: Exception[%s]' % str(e))
                raise e

            if status != ErrorCodes.OK:
                log.error('%s _autenticated: getInfo failed[%s]' % (site, result))
                if 'redirect' in result:
                    return redirect(result['redirect'])
                c.status = ErrorCodes().getName(status)
                c.message = result.get('message')
                return render('%s/common/error.html' % self.prefix)

            params = result[site]
        role = session.get('role', None)
        if role:
            params['role'] = role
            log.debug("_authenticated: role[%s]" % role)
        log.debug("_authenticated: response params[%s]" % params)

        if params.has_key('role') and params.get('role')=='district':
            # If clever district admin is giving access to CK12
            # then at run time it will create that district authentication record in partnerSchoolDistricts table
            authType = params['authType']
            authTypeID = g.getMemberAuthTypes()[authType]
            partnerDistrictID = params.get('partnerDistrictID')
            tokenID = params.get('tokenID')
            
            psd_data = {
                        'siteID': authTypeID,
                        'partnerDistrictID': partnerDistrictID,
                        'tokenID':tokenID,
                        'districtID':None
                       }
            partnerSchoolDistrict = api.getPartnerSchoolDistrict(siteID=authTypeID, partnerDistrictID=partnerDistrictID)
            if not partnerSchoolDistrict:
                api.createPartnerSchoolDistrict(**psd_data)
            else:
                api.updatePartnerSchoolDistrict(**psd_data)
                
            return
        
        if params.has_key('redirect'):
            #
            #  Redirect instead of continuing the login process.
            #
            call = params['redirect']
            return redirect(call)
        #
        #  TODO:    We will remove the site == 'clever' check
        #           in a future release.
        # 
        # Removed the check for bug #46625 Felix
        #
        if session and session.has_key('authType'):
            try:
                if session.get('email') != params.get('email'):
                    log.debug("_authenticated: Already has another user session with authType Clever. session[%s] " % session)
                    log.debug("_authenticated: Clearing existing user session...")
                    session['userID'] = None
                    session['email'] = None
                    session.invalidate()
                    log.debug('_authenticated: logout session[%s]' % session)
            except Exception:
                pass
        #
        #  Call to login and if the member doesn't exist yet,
        #  creates it.
        #
        restApi = url(controller='member',
                  action='federatedLogin',
                  qualified=True,
                  protocol='https')
        status, result = self._call(restApi, method='POST', params=params)
        if status not in [ErrorCodes.OK, ErrorCodes.ALREADY_LOGGED_IN]:
            log.error('%s _authenticated: login failed[%s] params[%s]' % (site, result, params))
            c.status = ErrorCodes().getName(status)
            c.message = result.get('message')
            c.excludeheader = True
            return render('%s/common/error.html' % self.prefix)
        else:
            #
            #  Setup session info.
            #
            id = result['id']
            email = result['email']
            timeout = result['timeout']
            if not session.has_key('authType'):
                log.debug('Saving session parameters id[%s],email[%s],site[%s],timeout[%s]' % (id, email, site, timeout))
                u.saveSession(request, id, email, site, timeout)
                
            
            authType = params.get('authType')
            log.debug('_authenticated: authType[%s]' % authType)
            # Added for Edmodo Connect redirect functionality. Allow the user to be logged in and then redirect.
            if params.has_key('appRedirect'):
                call = params['appRedirect']
                return redirect(call)
            if authType == 'facebook' and params.has_key('id'):
                #
                #  Switch the image URL from using user name to using id.
                #
                member = api.getMemberByID(id=id)
                if member:
                    imageURL = member.imageURL
                    log.debug('_authenticated: imageURL[%s]' % imageURL)
                    prefix = 'https://graph.facebook.com/'
                    if imageURL and imageURL.startswith(prefix):
                        newImageURL = '%s%s/picture' % (prefix, params.get('id'))
                        log.debug('_authenticated: newImageURL[%s]' % newImageURL)
                        if newImageURL != imageURL:
                            member.imageURL = newImageURL
                            api.update(member)
                            log.debug('_authenticated: update member[%s] to newImageURL[%s]' % (id, newImageURL))
            if authType == 'classlink':
                try:
                    member = api.getMemberByID(id=id)
                    # Update member
                    #if member and member.isProfileUpdated !=1:
                        # Classlink did not want the profile builder to show up for new members.
                        #member.isProfileUpdated = params.get('isProfileUpdated')
                        #api.update(member)
                    partnerDistrictName = params.get('partnerDistrictName')
                    partnerDistrictID = params.get('partnerDistrictID')
                    authTypeID = g.getMemberAuthTypes()[authType]
                    log.debug("_authenticated classlink: authTypeID[%s]"%authTypeID)
                    if not authTypeID:
                        raise Exception((_(u'Unknown auth type, authTypeID was not found.')).encode("utf-8"))

                    if partnerDistrictName and partnerDistrictID:
                        schoolDistrict = api.getSchoolDistrictbyName(partnerDistrictName)
                        log.debug("_authenticated classlink: schooldistrict[%s]"%schoolDistrict)
                        if not schoolDistrict:
                            schoolDistrict = api.createSchoolDistrict(name=partnerDistrictName)
                            log.debug("_authenticated classlink: schooldistrict[%s]"%schoolDistrict)

                        psd_data = {
                            'siteID': authTypeID,
                            'partnerDistrictID': partnerDistrictID,
                            'tokenID': None,
                            'districtID': schoolDistrict.id
                        }
                        partnerSchoolDistrict = api.getPartnerSchoolDistrict(siteID=authTypeID, partnerDistrictID=partnerDistrictID)
                        if not partnerSchoolDistrict:
                            api.createPartnerSchoolDistrict(**psd_data)
                        else:
                            api.updatePartnerSchoolDistrict(**psd_data)
                    else:
                        log.debug("_authenticated classlink: missing parameter partnerDistrictName [%s] / partnerDistrictID[%s]" %(partnerDistrictName,partnerDistrictID))

                except Exception, e:
                    log.error('_authenticated classlink: Exception[%s]' % str(e))
            elif authType == 'edmodoconnect':
                try:
                    _access_token = params.get('access_token', None)
                    # Save accessToken to DB for teacher users
                    isTeacher = params.get('isTeacher')
                    if isTeacher:
			prefix = config.get('flx_prefix_url')
			insert_token_url = "%s/create/oauth2/entry"%prefix 
                        refreshToken = params.get('refresh_token')
                        expires = params.get('token_expiry')
                        data = {'memberID':id,'accessToken': _access_token, 'refreshToken': refreshToken, 'expires': expires, 'authTypeID':42}
                        status, result_token = self._call(insert_token_url ,method='POST', params=data, fromReq=True)
                        log.debug ('_authenticated save access token response: [%s]'%result_token)
                    appID = params.get("appID", None)
                    log.debug('_authenticated edmodoConnect: _access_token[%s]' % str(_access_token))
                    kwargs = {'edmodo_connect_access_token':_access_token}
                    kwargs["userToken"] = params.get("userToken")
                    # NOTE: Saving the access token to cookies for flx use when calling APIs
		    from pylons import response
		    ## Set cookie for access token
		    accessTokenEnc = Blowfish.new(config.get('lms_secret')).encrypt(h.pad_string(_access_token)) if config.get('lms_secret') else _access_token
		    accessTokenEnc = h.genURLSafeBase64Encode(accessTokenEnc, strip=False, usePrefix=False)
                    # appID gets used in flx to build the cookie name.
                    # If not found we will set a generic cookie _edmcat
                    if appID:
		        response.set_cookie("edmodoappID", appID, max_age=86400)
                        kwargs["edmodoAppID"] = appID
		        lmsCookieName = '%s%s' % (config.get('lms_cookie_prefix'), appID)
		        log.debug("[launch] Setting: lmsCookieName: %s, accessToken: %s, accessTokenEnc: %s" % (lmsCookieName, _access_token, accessTokenEnc))
		        response.set_cookie(lmsCookieName, accessTokenEnc, max_age=86400)
                    else:
                        # Set a generic cookie
		        log.debug("[launch] Setting: CookieName: _edmcat, accessToken: %s, accessTokenEnc: %s" % (_access_token, accessTokenEnc))
		        response.set_cookie('_edmcat', accessTokenEnc, max_age=86400)
                   
                    email = params.get('email')
                    log.debug("_authenticated Saving session")
                    u.saveSession(request,id, email,authType,timeout=0, **kwargs)
                    
                except Exception, e:
                    log.error('_authenticated edmodoConnect: Exception[%s]' % str(e))

            elif authType == 'clever':
                gradeIDs = params.get('gradeIDs')
                if gradeIDs:
                    params = {'gradeIDs' : gradeIDs}
                    data = RemoteAPI.makeFlxCall('/set/member/grades', params_dict=params, fromReq=False)
                    log.debug("_authenticated: Data from /flx/set/member/grades API: %s"%data)
                else:
                    roleID = params.get('roleID', 7)
                    if roleID == 5 or roleID == '5':
                        import urllib2

                        siteID = g.getMemberAuthTypes()[authType]
                        partnerDistrictID = params.get('partnerDistrictID')
                        partnerDistricts = api.getPartnerSchoolDistrict(siteID, partnerDistrictID)
                        tokenID = None
                        if len(partnerDistricts) == 1:
                            tokenID = partnerDistricts[0].tokenID
                        log.debug('_authenticated: tokenID[%s]' % tokenID)
                        authorization = 'Bearer %s' % tokenID
                        headers = { 'Authorization': authorization }
                        log.debug('_authenticated: headers[%s]' % headers)
                        externalID = params.get('externalID')
                        teacherUrl = '%s/v1.1/teachers/%s/grade_levels' % (config.get('clever_get_url'), externalID)
                        log.debug("_authenticated: TeacherURL[%s]" % teacherUrl)
                        req = urllib2.Request(teacherUrl, headers=headers)
                        response = urllib2.urlopen(req)
                        the_page = response.read()
                        data = json.loads(the_page)
                        grades = data.get('data')
                        if grades:
                            gradeIDs = []
                            for grade in grades:
                                try:
                                    _grade = grade.lower()
                                    if _grade == 'kindergarten':
                                        gradeID = 1
                                    elif _grade == 'prekindergarten':
                                        gradeID = 14
                                    elif _grade == 'postgraduate':
                                        gradeID = 15
                                    elif _grade == 'other':
                                        gradeID = 16
                                    else:
                                        gradeID = int(grade) + 1
                                    gradeIDs.append(gradeID)
                                except Exception, e:
                                    import traceback

                                    log.error('clever _athenticated exception[%s]' % str(e))
                                    log.error(traceback.format_exc())
                            log.debug("_authenticated: gradeIDs[%s]" % gradeIDs)
                            params = {'gradeIDs': gradeIDs}
                            data = RemoteAPI.makeFlxCall('/set/member/grades', params_dict=params, fromReq=False)                                                                                                                        
                            log.debug("_authenticated: Data from /flx/set/member/grades API: %s" % data)

            log.debug('authenticated: returnTo[%s]' % returnTo)
            if returnTo:
                returnTo = h.restoreSlash(returnTo)
                c.returnTo = returnTo
        c.newMember = result.get('newMember',False);
        if c.newMember:
            session['new_signup'] = True
            session.save()
        c.status = status
        if returnTo and c.newMember:
            returnTo ="%s/auth/signup/complete?returnTo=%s" % (config.get('web_prefix_url'),returnTo)
            return redirect(returnTo)
        elif returnTo:
            returnTo = "%s/account/signin-complete/%s/?redirect=%s" % (config.get('web_prefix_url'),authType, returnTo)
            return redirect(returnTo)
        else:
            return render('%s/authenticate/extauth_success.html' % self.prefix)
 
    @d.trace(log, ['returnTo'])
    def loginForm(self, returnTo=None):
        if self.prefix != '/auth':
            raise Exception((_(u'Should only be called by auth instance.')).encode("utf-8"))

        log.debug('loginForm: params[%s]' % request.params)
        if returnTo is None:
            returnTo = request.params.get('returnTo')
        if returnTo:
            returnTo = returnTo.strip()
            c.returnTo = returnTo
        else:
            ## Use a default returnTo url
            c.returnTo = config.get('web_prefix_url')
        log.debug('loginForm: returnTo[%s]' % c.returnTo)
        try:
            h.validateDomain(c.returnTo)
        except h.ForbiddenError:
            c.returnTo = config.get('web_prefix_url')
            return render('%s/errors/403.html' % self.prefix)

        member = u.getCurrentUser(request, anonymousOkay=False)
        if member and request.method == "GET":
            from auth.controllers.member import getDict

            userDict = getDict(member)
            userDict['authType'] = session.get('authType')
            from base64 import standard_b64encode

            encodedData = json.dumps(userDict, ensure_ascii=False, default=h.toJson).encode('utf-8')
            encodedData = quote(standard_b64encode(encodedData))
            if '?' in c.returnTo:
                c.returnTo += '&'
            else:
                c.returnTo += '?'
            c.returnTo += 'userinfo=%s' % encodedData

            ## Auto-redirect (do not show the form)
            log.info("loginForm: Auto redirecting skipping login page: %s" % c.returnTo)
            log.info("loginForm: cookies[%s]" % request.cookies)
            return redirect(c.returnTo)

        popup = request.params.get('popup')
        c.requestor = request.params.get('requestor', '/')
        log.debug('loginForm: requestor[%s]' % c.requestor)

        from auth.forms.member import SigninForm

        form = SigninForm()
        c.form = form
        toRedirect = False
        if request.method == "GET":
            c.returnTo = '/my/dashboard' if c.returnTo == config.get('web_prefix_url')  else c.returnTo
            #c.returnTo = '%s/account/federated/authorized/?next=%s' % (config.get('web_prefix_url'), c.returnTo) 
            c.form.next = c.returnTo
            c.form.requestor = c.requestor
            c.prefix = self.prefix
            log.debug('loginForm: GET c.form[%s]' % c.form)
        elif request.method == "POST":
            import formencode

            try:
                formResult = form.to_python(request.params)
                login = formResult['username'].strip()
                token = formResult['password']
                remember = formResult['remember']
                authType = formResult['authType']
                c.returnTo = formResult['next']
                log.debug('loginForm: POST formResult[%s]' % formResult)
                if popup and not c.requestor:
                    try:
                        c.requestor = formResult['requestor']
                    except KeyError:
                        c.requestor = ''

                from auth.controllers import member as m

                cookies_enabled = True
                if request.headers.get('cookie') is None :
                    cookies_enabled = False
                    raise Exception((_(u'Cookies are disabled on your browser.')).encode("utf-8"))
                m.validateLogin(login, token, authType)
                if type(token) == unicode:
                    token = token.encode('utf8')
                token = quote(token)
                if type(login) == unicode:
                    login = login.encode('utf8')
                login = quote(login)
                params = {
                    'authType': authType,
                }
                api = url(controller='member',
                          action='login',
                          qualified=True,
                          protocol='https',
                          **params)
                status, result = self._call(api, method='POST', params={'login': login, 'token': token}, fromReq=True)
                if status != ErrorCodes.OK:
                    log.error('loginForm: login failed[%s]' % result)
                    c.status = ErrorCodes().getName(status)
                    c.message = result.get('message')
                    return render('%s/common/error.html' % self.prefix)

                toRedirect = c.returnTo is not None
                newMember = False
                if result.has_key('newMember'):
                    if result.get('newMember'):
                        newMember = True
                    del result['newMember']
            except formencode.validators.Invalid, error:
                log.debug('loginForm: error[%s]' % error)
                log.debug('loginForm: value[%s]' % error.value)
                log.debug('loginForm: dict[%s]' % error.error_dict)
                c.form.username = request.params.get('username')
                c.form_errors = error.error_dict or {}
            except Exception, e:
                log.debug('loginForm: e[%s]' % e)
                c.form_errors =  {ErrorCodes.UNKNOWN_MEMBER: str(e)}
                if cookies_enabled :
                    c.form.username = unquote(login)

            if toRedirect:
                from pylons import response
                from base64 import standard_b64encode

                encodedData = json.dumps(result, ensure_ascii=False, default=h.toJson).encode('utf-8')
                encodedData = quote(standard_b64encode(encodedData))
                c.returnTo += '&' if '?' in c.returnTo else '?'
                c.returnTo += 'userinfo=%s' % encodedData
                if newMember:
                    c.returnTo += '&newMember=true'
                if c.requestor:
                    #params.update({ 'requestor': quote(c.requestor) })
                    c.returnTo += '&requestor=%s' % quote(c.requestor)
                log.debug("loginForm: returnTo[%s]" % c.returnTo)
                response.location = c.returnTo
                #
                #  Create and save the session.
                #
                id = str(result['id'])
                timeout = None if remember else 0
                u.saveSession(request, id, result['email'], authType, timeout=timeout)
                #
                #  Redirect back to the caller.
                #
                #Required to route the user th' account/federated/authorized url when first time login,
                #in order to execute to new user tracking code in flxweb (Required in case of underage user registration and login)
                #if newMember and not 'account/federated/authorized' in c.returnTo:
                #    c.returnTo = '%s/account/federated/authorized/?newMember=true&next=%s' % (config.get('web_prefix_url'), c.returnTo)
                return redirect(c.returnTo, 302)

            c.form.next = c.returnTo
            c.form.requestor = c.requestor
            c.prefix = self.prefix

        popup = request.params.get('popup')
        log.debug('loginForm: popup[%s]' % popup)
        from auth.lib.ck12 import messages
        c.messages = messages
        if popup:
            return render('%s/authenticate/federatedLoginPopup.html' % self.prefix)

        # This is a hack to get session working
        session['_'] = '_'
        session.save()

        return render('%s/authenticate/federatedLogin.html' % self.prefix)

    def _base64encode(self, string):
        return h.genURLSafeBase64Encode(string, usePrefix=False)

    def _base64decode(self, encoded_string):
        return h.genURLSafeBase64Decode(encoded_string, hasPrefix=False)

    def _sendEmail(self, id, email, eventType, eventData):
        """
            Create notification event for sending email.
        """
        prefix = config.get('flx_prefix_url')
        email = quote(email)
        eventData = base64.b64encode(h.safe_encode(eventData))
        #
        #  Create notification.
        #
        notificationUrl = '%s/create/notification?eventType=%s&notificationType=email&objectType=member&address=%s&frequency=instant' % (prefix, eventType, email)
        if id:
            objectID = id
        else:
            import hashlib

            objectID = hashlib.md5(eventData.encode('utf8')).hexdigest()
        notificationUrl = '%s&objectID=%s' % (notificationUrl, objectID)
        log.info('_sendEmail: notificationUrl[%s]' % notificationUrl)
        status, result = self._call(notificationUrl, fromReq=True)
        log.info('_sendEmail: notification[%s]' % result)
        if status != ErrorCodes.OK:
            log.warn('_sendEmail: create notification for[%s, %s, %s] failed[%s]' % (id, email, eventType, result))

        notificationID = result['id']
        #
        #  Create event.
        #
        eventUrl = '%s/create/event?eventType=%s&objectType=member&eventData=%s&notificationID=%s&processInstant=true' % (prefix, eventType, eventData, notificationID)
        eventUrl = '%s&objectID=%s' % (eventUrl, objectID)
        log.info('_sendEmail: eventUrl[%s]' % eventUrl)
        status, result = self._call(eventUrl, fromReq=True)
        log.info('_sendEmail: event[%s]' % result)
        if status != ErrorCodes.OK:
            log.warn('_sendEmail: create event for[%s, %s, %s] failed[%s]' % (id, email, eventType, result))

    def _checkExcludingEmail(self, email):
        if not email:
            return True

        domains = [ 'houstonisd.org', 'philasd.org', '@partners.ck12.org' ]
        toBeExcluded = False
        for domain in domains:
            if email.endswith(domain):
                toBeExcluded = True
                break
        return toBeExcluded

    def _newVocusContact(self, member, isExisting=False, contactId=None, status=None, session=None):
        """
        Get All required Parameters and create/update iContact
        """
        toBeExcluded = self._checkExcludingEmail(member.email)
        if toBeExcluded:
            log.debug('_newVocusContact: skip email[%s]' % member.email)
            return None

        try:
            if not session:
                memberRole = api.getMemberHasRoles(memberID=member.id)
            else:
                memberRole = api._getMemberHasRoles(session, memberID=member.id)
            if memberRole:
                roleName = memberRole[0].role.name
            else:
                roleName = ''
            kwargs = {
                'memberID': member.id,
                'email': member.email,
                'firstName': member.givenName,
                'roleName': roleName,
                'contactId': contactId,
                'status': status,
                'city': request.params.get('city',None),
                #'street': request.params.get('street',None),
                #'street2': request.params.get('street2',None),
                'postalCode': request.params.get('postalCode',None),
                'state': request.params.get('state',None),
                #'business': request.params.get('business',None),
                'isExisting': isExisting,
            }
            log.info("Scheduling task for VocusUpdater. Params: %s" % str(kwargs))
            from auth.controllers.celerytasks.marketing import VocusUpdater
            task = VocusUpdater().delay(**kwargs)
            log.info("Returned task_id: %s" % task.task_id)
            return task.task_id
        except Exception as e:
            log.error("Error scheduling task for VocusUpdater(). [%s]" % str(e), exc_info=e)
            return None
        
    def _newHubSpotContact(self, member, optout=None):
        """
            Create a HubSpot new contact from the newly created member.
        """
        toBeExcluded = self._checkExcludingEmail(member.email)
        if not toBeExcluded:
            try:
                from auth.controllers.celerytasks.marketing import HubSpotUpdater

                kwargs = {
                    'memberID': member.id,
                    'optout': optout,
                    'hubspotutk': request.cookies.get('hubspotutk'),
                }

                log.info("Scheduling task for HubSpotUpdater. Params: %s" % str(kwargs))
                task = HubSpotUpdater().delay(**kwargs)
                log.info("Returned task_id: %s" % task.task_id)
                return task.task_id
            except Exception, e:
                log.warn('_newHubSpotContact: Unable to schedule HubSpotUpdater task for member[%s, %s] Error: [%s]' % (member.id, member.email, str(e)))
                return None

    def _updateAnalytics(self, member, typeID, session=None):
        #
        #  Update login count.
        #
        for ext in member.ext:
            if ext.authTypeID == typeID:
                ext.loginCount += 1
                #
                #  Piggybag the verified update here.
                #
                ext.verified = True
                try:
                    if session:
                        api._update(session, instance=ext)
                    else:
                        api.update(instance=ext)
                except Exception, e:
                    log.debug('_updateAnalytics: Unable to update login count: %s' % str(e))
                break
        #
        #  Update login time.
        #
        member.loginTime = datetime.now()
        try:
            if session:
                api._update(session, instance=member)
            else:
                api.update(instance=member)
        except Exception, e:
            log.debug('_updateAnalytics: Unable to update login time: %s' % str(e))

        return member.cache(model.INVALIDATE, instance=member)

import httplib, ssl, sys
import socket

##
## Special handler for Python 2.7 for SSL V3 
## Based on: http://bugs.python.org/issue11220
##
class HTTPSConnectionV3(httplib.HTTPSConnection):
    def __init__(self, *args, **kwargs):
        httplib.HTTPSConnection.__init__(self, *args, **kwargs)

    def connect(self):
        sock = socket.create_connection((self.host, self.port), self.timeout)
        if self._tunnel_host:
            self.sock = sock
            self._tunnel()
        pythonVer = sys.version_info
        oldPython = False
        if pythonVer[0] <= 1 or (pythonVer[0] < 3 and pythonVer[1] <= 7 and pythonVer[2] < 9):
            oldPython = True
        try:
            if oldPython:
                raise Exception("Old python [version: %s]. Trying TLSv1" % pythonVer)
            self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1_2)
        except Exception, oldpy:
            try:
                log.debug("Using TLSv1.")
                self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1)
            except ssl.SSLError, tlsv1:
                try:
                    log.warn("Using SSLv3. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv3)
                except ssl.SSLError, sslv3:
                    log.warn("Using SSLv23. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv23)

from urllib2 import HTTPSHandler 

class HTTPSHandlerV3(HTTPSHandler):
    def https_open(self, req):
        return self.do_open(HTTPSConnectionV3, req)
