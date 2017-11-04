import logging,traceback
import base64
import urllib
import urllib2
import json

from pylons import config,request, tmpl_context as c, url
from pylons.controllers.util import redirect
from pylons.i18n.translation import _

from auth.lib.base import BaseController, render
from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.controllers.extAuth import ExtAuthController
import auth.lib.helpers as h

log = logging.getLogger(__name__)

class CleverController(ExtAuthController):
    """
    Clever.com authentication related APIs. 
    """

    site = "clever"
    
    def __init__(self):
        self.client_id = config.get('clever_client_id')
        self.client_secret = config.get('clever_client_secret')
        self.clever_token_url = config.get('clever_access_token_url')
        self.clever_get_url = config.get('clever_get_url')
        self.redirect_url = config.get('clever_redirect_uri')
    
    @d.trace(log)
    def login(self):
        """
            Login via Clever oAuth2.
        """
        try:
            log.debug("request.params-------%s"%request.params)
            code = str(request.params.get('code'))
            accessTokenUrl = self.clever_token_url
            log.debug('------------accessTokenUrl---:%s'%(accessTokenUrl))
            redirectUrl = url(controller=self.site, action='login', qualified=True, protocol='https')
            params = {'code': code, 'grant_type': 'authorization_code', 'redirect_uri': redirectUrl}
            params = urllib.urlencode(params)
            log.debug('-----------params---:%s'%(params))

            #authorization = "Basic MjAxNDhiYTFlYzc2NWVjNzJjOWI6NWYyZjU1MzcwNzAwMjE4NTA4NWYyNTczOTYxOWRmMmU4NDBiM2ZkNA=="
            authorization = 'Basic ' + base64.b64encode(self.client_id + ':' + self.client_secret)
            
            headers = { 'Authorization': authorization }
            log.debug('-----------headers---:%s'%(headers))
            req = urllib2.Request(accessTokenUrl, params, headers)
            response = urllib2.urlopen(req)
            the_page = response.read()
            data = json.loads(the_page)
            log.debug('-=================data---:%s'%(data))
            accessToken= data.get('access_token', None)
            if not accessToken:
                raise Exception((_(u'Not Getting Access Token.')).encode("utf-8"))

            redirectTo = '%s?token=%s' % (self.redirect_url, accessToken)
        except urllib2.HTTPError as e:
            error_message = e.read()
            log.error('login: Error Getting TokenID from clever : %s' %  error_message)
            return render('%s/common/error.html' % self.prefix)
        except Exception, e:
            log.exception(e)
            c.status = ErrorCodes().getName(ErrorCodes.AUTHENTICATION_FAILED)
            c.message = str(e)
            return render('%s/common/error.html' % self.prefix)

        return redirect(redirectTo)

    
    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information as well as district information from clever.
        """
        log.debug("request.params-------%s"%request.params)
        accessToken = request.params.get('token')
        getInfoUrl = '%s/me' % self.clever_get_url
        log.debug('------------getInfoUrl---:%s'%(getInfoUrl))
        
        authorization = 'Bearer %s' % accessToken
        headers = { 'Authorization': authorization }
        req = urllib2.Request(getInfoUrl, headers=headers)
        
        result = urllib2.urlopen(req).read()
        cleverData = json.loads(result)
        
        log.debug('-=================cleverData---:%s'%(cleverData))

        params = {
            'authType': self.site,
            'countryCode': 'US',
        }
        role = cleverData.get('type')
        if role:
            params['role'] = role
            
        if role == 'district':
            data = cleverData.get('data')
            name = data.get('name')
            if name:
                params['name'] = name
            districtID = data.get('id')
            if districtID:
                params['partnerDistrictID'] = districtID
            tokenID = data.get('id')
            if tokenID:
                params['tokenID'] = accessToken
        else:
            data = cleverData.get('data')
            if data:
                if not role:
                    role = data.get('type')
                    if role:
                        params['role'] = role
                params['roleID'] = 5 if role == 'teacher' else 7
                name = data.get('name')
                if name:
                    name = h.safe_encode(name)
                    givenName = name.get('first')
                    if givenName:
                        params['firstName'] = h.safe_encode(givenName)
                    surname = name.get('last')
                    if surname:
                        params['lastName'] = h.safe_encode(surname)
                gender = data.get('gender')
                if gender:
                    if gender == 'F':
                        params['gender'] = 'female'
                    elif gender == 'M':
                        params['gender'] = 'male'
                    else:
                        pass
                email = data.get('email')
                if email:
                    email = email.lower().strip()
                    params['email'] = h.safe_encode(email)
                else:
                    params['email'] = '%s-%s@partners.ck12.org' % (self.site, data.get('id').lower().strip())
                grade = data.get('grade')
                if grade:
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
                        params['gradeIDs'] = [gradeID]
                    except Exception, e:
                        log.error('clever getInfo exception[%s]' % str(e))
                        log.error(traceback.format_exc())
                dob = data.get('dob')
                if dob:
                    from datetime import datetime

                    dt = datetime.strptime(dob, '%Y-%m-%dT%H:%M:%S.000Z')
                    birthday = dt.strftime('%m/%d/%Y')
                    params['birthday'] = birthday
                location = data.get('location')
                if location:
                    params['zip'] = location.get('zip')
                districtID = data.get('district')
                if districtID:
                    params['partnerDistrictID'] = districtID
                schoolID = data.get('school')
                if schoolID:
                    params['partnerSchoolID'] = schoolID
                sysID = data.get('sis_id')
                if sysID:
                    params['partnerSysID'] = sysID
                number = data.get('%s_number' % role)
                if number:
                    params['partnerMemberID'] = number

                params['externalID'] = data.get('id')
                params['token'] = 'https://clever.com/%s' % data.get('id')

        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        result['response']['clever'] = params
        return result

    @d.trace(log)
    def authenticated(self):
        """
            This is an example for how authenticated could be implemented at
            the App layer.
        """
        log.debug('clever authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)

