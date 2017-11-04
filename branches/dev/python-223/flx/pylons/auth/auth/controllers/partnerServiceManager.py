from pylons.controllers import WSGIController
from pylons import request, config, session 
from auth.util import decorators as dec2
from auth.logic.partnerBusinessManager import PartnerBusinessLogic
from auth.model import exceptions
from datetime import datetime, timedelta
from auth.lib import helpers as h
import re
import json
import urlparse
import urllib
import base64
import logging

log = logging.getLogger(__name__)

__controller__ = 'PartnerServiceController'

class PartnerServiceController(WSGIController):

    def __init__(self):
        self.businessLogic = PartnerBusinessLogic()

    #logs in the partnerMember after authenticating the partner and his ownership of the member
    #loging in could be a signIn or signUp + signIn depending on member being already registered with CK12.
    @dec2.responsify(argNames=['partnerName'])
    def loginMember(self, partnerName):
        if request.method != 'POST':
            raise exceptions.InvalidHTTPMethodException(u"HTTPMethod : [{httpMethod}] is not supported for this URL : [{URL}]".format(httpMethod=request.method, URL=request.path_qs).encode('utf-8'))                

        if request.content_type != 'application/json':
            raise exceptions.InvalidContentTypeException(u"contentType : [{contentType}] content in the request body is not supported.".format(contentType=request.content_type).encode('utf-8'))                

        if not partnerName or not isinstance(partnerName, basestring):
            raise exceptions.InvalidArgumentException(u"Invalid partnerName : [{partnerName}] is received in the headers. partnerName is mandatory.".format(partnerName=partnerName).encode('utf-8'))

        requestSignature = request.headers.get('x-ck12-meta-request-signature')
        try:
            requestSignature = base64.b64decode(requestSignature)
        except (ValueError, TypeError, SyntaxError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid requestSignature : [{requestSignature}] received in the headers. A valid base64 encoded signature generated using the partner key is mandatory.".format(requestSignature=requestSignature).encode('utf-8'))

        if not requestSignature or not isinstance(requestSignature, str):
            raise exceptions.InvalidArgumentException(u"Invalid requestSignature : [{requestSignature}] is received in the headers. A valid base64 encoded signature generated using the partner key is mandatory.".format(requestSignature=base64.b64encode(requestSignature)).encode('utf-8'))

        #validate loginData and other details in it
        loginData = request.body
        try:
            loginDict = json.loads(loginData)
        except (ValueError, TypeError) as e:
            raise exceptions.InvalidArgumentException(u"Invalid loginData : [{loginData}] received in the request body. A valid JSON is expected.".format(loginData=loginData).encode('utf-8'))

        #validate the requestOrigin
        isRequestValid = self.businessLogic.validatePartnerRequestOrigin(partnerName, requestSignature, loginData)
        if not isRequestValid:
            raise exceptions.UnauthorizedException(u"Verification of current request with given requestSignature : [{requestSignature}] against the key for the partner with the partnerName : [{partnerName}] failed.".format(requestSignature=base64.b64encode(requestSignature), partnerName=partnerName).encode('utf-8'))

        #process redirectInfo
        redirectURL = None
        url = None
        redirectInfo = loginDict.get('redirectInfo')
        if redirectInfo is not None:
            if not redirectInfo or not isinstance(redirectInfo, dict):
                raise exceptions.InvalidArgumentException(u"Invalid redirectInfo : [{redirectInfo}] is received.".format(redirectInfo=redirectInfo).encode('utf-8'))
            
            partnerAppName = redirectInfo.get('partnerAppName')
            if not partnerAppName or not isinstance(partnerAppName, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))
                
            redirectMode = redirectInfo.get('redirectMode')
            if redirectMode not in ('ASSIGNMENT', 'ASSIGNMENT_PROGRESS', 'PREVIEW'):
                raise exceptions.InvalidArgumentException(u"Invalid redirectMode : [{redirectMode}] is received. It should be one of 'ASSIGNMENT' | 'ASSIGNMENT_PROGRESS' ".format(redirectMode=redirectMode).encode('utf-8'))

            if redirectMode == 'PREVIEW':
                url = redirectInfo.get('url')
            else:
                assignmentID = redirectInfo.get('assignmentID')
                try :
                    assignmentID=long(assignmentID)
                except (ValueError, TypeError) as e:
                    raise exceptions.InvalidArgumentException(u"Invalid value for assignmentID : [{assignmentID}] received. assignmentID is mandatory and should be a proper long integer with the redirectMode : [{redirectMode}].".format(assignmentID=assignmentID, redirectMode=redirectMode).encode('utf-8'))
                if assignmentID <=0:
                    raise exceptions.InvalidArgumentException(u"Invalid value for assignmentID : [{assignmentID}] received. assignmentID is mandatory and should be a proper long integer with the redirectMode : [{redirectMode}].".format(assignmentID=assignmentID, redirectMode=redirectMode).encode('utf-8'))
                
                if redirectMode == 'ASSIGNMENT_PROGRESS':
                    partnerMemberID =  redirectInfo.get('partnerMemberID')
                    if partnerMemberID is not None:
                        if not partnerMemberID or not isinstance(partnerMemberID, basestring):
                            raise exceptions.InvalidArgumentException(u"Invalid partnerMemberID : [{partnerMemberID}] is received. partnerMemberID is mandatory with the redirectMode : [{redirectMode}].".format(partnerMemberID=partnerMemberID, redirectMode=redirectMode).encode('utf-8'))

            webPrefixURL = config.get('web_prefix_url')
            if not webPrefixURL:
                webPrefixURL = 'https://www.ck12.org/'
            if url:
                webPrefixURL = webPrefixURL.rstrip('/') + '/' + url.lstrip('/')
            else:
                webPrefixURL = webPrefixURL+'/lmspractice/partners/launcher.html'
            webPrefixURLParts = list(urlparse.urlparse(webPrefixURL))
            webPrefixURLQueryParams = dict(urlparse.parse_qsl(webPrefixURLParts[4]))
            
            redirectQueryParams = {'partnerAppName':partnerAppName, 'mode':redirectMode}
            if redirectMode != 'PREVIEW':
                redirectQueryParams['assignmentID'] = assignmentID
            if redirectMode == 'ASSIGNMENT_PROGRESS' and partnerMemberID is not None:
                redirectQueryParams['partnerMemberID'] = partnerMemberID

            webPrefixURLQueryParams.update(redirectQueryParams)
            webPrefixURLParts[4] = urllib.urlencode(webPrefixURLQueryParams)
            redirectURL = h.safe_encode(urlparse.urlunparse(webPrefixURLParts))

        #process other requestInfo
        partnerMemberID = loginDict.get('partnerMemberID')
        if partnerMemberID is not None:
            if not partnerMemberID or not isinstance(partnerMemberID, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid partnerMemberID : [{partnerMemberID}] is received.".format(partnerMemberID=partnerMemberID).encode('utf-8'))
        
        memberFirstName = loginDict.get('memberFirstName')
        if memberFirstName is not None:
            if not memberFirstName or not isinstance(memberFirstName, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid memberFirstName : [{memberFirstName}] is received.".format(memberFirstName=memberFirstName).encode('utf-8'))
            
        memberLastName = loginDict.get('memberLastName')
        if memberLastName is not None:
            if not memberLastName or not isinstance(memberLastName, basestring):
                raise exceptions.InvalidArgumentException(u"Invalid memberLastName : [{memberLastName}] is received.".format(memberLastName=memberLastName).encode('utf-8'))

        memberEmail = loginDict.get('memberEmail')
        if memberEmail is not None:
            if not memberEmail or not isinstance(memberEmail, basestring) or not re.match(r"[^@]+@[^@]+\.[^@]+", memberEmail):
                raise exceptions.InvalidArgumentException(u"Invalid memberEmail : [{memberEmail}] is received.".format(memberEmail=memberEmail).encode('utf-8'))

        memberRoleNames = loginDict.get('memberRoleNames')
        if memberRoleNames is not None:
            if not memberRoleNames or not isinstance(memberRoleNames, list) or not all(isinstance(memberRoleName, basestring) for memberRoleName in memberRoleNames) or ((set(["Teacher", "TEACHER", "teacher"]) & set(memberRoleNames)) and (set(["Student", "STUDENT", "student"]) & set(memberRoleNames))):
                raise exceptions.InvalidArgumentException(u"Invalid memberRoleNames : [{memberRoleNames}] is received.".format(memberRoleNames=memberRoleNames).encode('utf-8'))
            loginDict['memberRoleNames'] = set(memberRoleNames)
        
        memberSharePermissionGrantedAt = loginDict.get('memberSharePermissionGrantedAt')
        if memberSharePermissionGrantedAt is not None:
            try:
                memberSharePermissionGrantedAt = datetime.strptime(memberSharePermissionGrantedAt[:19], '%Y-%m-%dT%H:%M:%S')
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for memberSharePermissionGrantedAt : [{memberSharePermissionGrantedAt}] received. Need a proper past datetime in format of YYYY-mm-DDTHH:MM:SS".format(memberSharePermissionGrantedAt=memberSharePermissionGrantedAt).encode('utf-8'))
            if memberSharePermissionGrantedAt > datetime.now():
                raise exceptions.InvalidArgumentException(u"Invalid value for memberSharePermissionGrantedAt : [{memberSharePermissionGrantedAt}] received. Need a proper past datetime in format of YYYY-mm-DDTHH:MM:SS".format(memberSharePermissionGrantedAt=memberSharePermissionGrantedAt).encode('utf-8'))
            loginDict['memberSharePermissionGrantedAt'] = memberSharePermissionGrantedAt

        memberLicenseAcceptedAt = loginDict.get('memberLicenseAcceptedAt')
        if memberLicenseAcceptedAt is not None:
            try:
                memberLicenseAcceptedAt = datetime.strptime(memberLicenseAcceptedAt[:19], '%Y-%m-%dT%H:%M:%S')
            except (ValueError, TypeError) as e:
                raise exceptions.InvalidArgumentException(u"Invalid value for memberLicenseAcceptedAt : [{memberLicenseAcceptedAt}] received. Need a proper past datetime in format of YYYY-mm-DDTHH:MM:SS".format(memberLicenseAcceptedAt=memberLicenseAcceptedAt).encode('utf-8'))
            if memberLicenseAcceptedAt > datetime.now():
                raise exceptions.InvalidArgumentException(u"Invalid value for memberLicenseAcceptedAt : [{memberLicenseAcceptedAt}] received. Need a proper past datetime in format of YYYY-mm-DDTHH:MM:SS".format(memberLicenseAcceptedAt=memberLicenseAcceptedAt).encode('utf-8'))
            loginDict['memberLicenseAcceptedAt'] = memberLicenseAcceptedAt

        loginDict = self.businessLogic.loginMember(partnerName, loginDict)

        #Handle the session
        userIdInSession = session.get('userID') 
        if userIdInSession and (str(userIdInSession) != str(loginDict.get('memberID'))):
            session.clear()
            session.invalidate()
        session._set_domain(domain=config.get('beaker.session.domain'))
        session._set_path(path=config.get('beaker.session.path'))
        session._set_cookie_expires(expires=(datetime.now() + timedelta(0, long(config.get('beaker.session.timeout', 7776000)))))
        session._update_cookie_out()
    
        session['userID'] = loginDict['memberID']
        session['email'] = loginDict['memberEmail']
        session['authType'] = loginDict['partnerID']
        session['partnerID'] = loginDict['partnerID']
        session['partnerName'] = loginDict['partnerName']
        session['partnerMemberID'] = loginDict['partnerMemberID']
        session['userLoggedInByPartner'] = True
        session.save()
        session.persist()

        loginDict['token'] = session.key
        loginDict.pop('partnerID', None)
        responseDict = {'login':loginDict}
        if redirectURL:
            responseDict['redirectRequest'] = True
            responseDict['redirectURL'] = redirectURL
        
        log.debug("responseDict: [%s]" % responseDict)
        return responseDict
