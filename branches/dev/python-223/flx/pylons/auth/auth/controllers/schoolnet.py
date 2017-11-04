import logging
from pysimplesoap.client import SoapClient
from pysimplesoap.simplexml import SimpleXMLElement
import uuid

from pylons import config, request, session, tmpl_context as c, url as _url
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController
from auth.model import exceptions as ex
from pylons.i18n.translation import _


log = logging.getLogger(__name__)

__controller__ = 'SchoolnetController'
class SchoolnetController(ExtAuthController):
    """
        Schoolnet authentication related APIs.
    """
    site = 'schoolnet'

    def __init__(self):
        self.hostURL = 'http://tempuri.org'
        self.schoolnetHost = config.get('schoolnet_host')
        self.schoolnetURL = 'https://%s' % self.schoolnetHost
        self.username = config.get('schoolnet_username')
        self.password = config.get('schoolnet_password')
        self.schoolnetRedirectURI = config.get('schoolnet_redirect_uri')

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via Schoolnet.

            Expected parameters:

                authid
                institutionid
                userid
        """
        params = request.params
        log.debug('login: params[%s]' % params)
        authID = params.get('authid')
        institutionID = params.get('institutionid')
        userID = params.get('userid')
        returnTo = '%s' % config.get('web_prefix_url')
        url = _url(controller=self.site, action='authenticated', qualified=True, protocol='https')
        session['isPopup'] = 'true'
        redirectTo = '%s?authid=%s&institutionid=%s&userid=%s&returnTo=%s' % (url, authID, institutionID, userID, returnTo)
        return redirect(redirectTo, 302)

    @d.trace(log)
    def _getInfo(self, url, authID, institutionID, userID):
        """
            Get the member information from schoolnet.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        authID = str(uuid.UUID(authID))
        log.debug('_getInfo: authID[%s]' % authID)
        log.debug('_getInfo: params[%s]' % request.params)

        wsdlURL = _url(controller=self.site, action='getWSDL', qualified=True, protocol='https')
        client = SoapClient(wsdl=wsdlURL, http_headers={ 'Host': self.schoolnetHost })
        header = SimpleXMLElement('<Header/>')
        auth = header.add_child('SoapAuthenticationHeader')
        auth['xmlns'] = '%s/' % self.hostURL
        auth.marshall('Username', self.username)
        auth.marshall('Password', self.password)
        client['SoapAuthenticationHeader'] = auth
        resp = client.wsdl_call('GetUserByAuthenticationId', id=authID)
        log.debug("_getInfo: Called GetUserByAuthenticatedId resp[%s]" % resp)
        try:
            if not resp:
                raise ex.RemoteAPIStatusException(ErrorCodes.AUTHENTICATION_FAILED, (_(u'GetUserByAuthenticatedId no response value was returned.')).encode("utf-8"))
            data = resp.get('GetUserByAuthenticationIdResult')
            if not data:
                raise ex.RemoteAPIStatusException(ErrorCodes.AUTHENTICATION_FAILED, (_(u'GetUserByAuthenticationIdResult returned null data.')).encode("utf-8"))
            roleID = None
            role = data.get('GroupName', None)
            if role:
                role = role.lower()
                if role == 'teachers' or role == 'admin':
                    roleID = 5
                    role = 'teacher'
                elif role == 'students':
                    roleID = 7
                    role = 'student'
            gradeIDs = []
            grade = data.get('Grade', None)
            if grade:
                grade = grade.lower()
                if grade == 'k' or grade == 'pre-k':
                    gradeID = 1
                else:
                    gradeID = int(grade) + 1
                gradeIDs.append(gradeID)
            dob = data.get('DateBirth')
            if not dob:
                birthday = ''
            else:
                try:
                    from datetime import datetime
        
                    try:
                        dt = datetime.strptime(dob, '%m/%d/%y')
                    except ValueError:
                        dt = datetime.strptime(dob, '%m/%d/%Y')
                    birthday = dt.strftime('%m/%d/%Y')
                except Exception as de:
                    log.warn("Error converting birthdate: %s" % dob, exc_info=de)
                    birthday = ''

            email = data.get('Email', None)
            if email:
                email = email.lower().strip()
            params = {
                'firstName':    data.get('FirstName', None),
                'lastName':     data.get('LastName', None),
                'email':        email,
                'token':        data.get('UserId', None),
                'role':         role,
                'roleID':       roleID,
                'gradeIDs':     gradeIDs,
                'birthday':     birthday,
                'authType':     self.site,
            }
            log.debug("_getInfo: params%s" % params)
            result['response'][self.site] = params
            return result
        except ex.RemoteAPIStatusException as rae:
            log.warn("_getInfo Remote API Exception: %s" %str(rae), exc_info=rae)
            return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_FAILED, message="<p>Sorry, but Schoolnet is unreachable at this time. Please contact your Schoolnet administrator and try again later.</p>")
        except Exception as e:
            log.warn("_getInfo: Exception [%s]" % e, exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.AUTHENTICATION_FAILED, str(e))

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from schoolnet.
        """
        log.debug("getInfo: params[%s]" % request.params)
        authID = request.params.get('authid')
        if authID is None:
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode)

        institutionID = request.params.get('institutionid')
        userID = request.params.get('userid')

        url = self._getAuthenticatedURL(self.site)
        returnTo = request.params.get('returnTo')
        if returnTo:
            url = '%s?returnTo=%s' % (url, returnTo)

        return self._getInfo(url, authID, institutionID, userID)

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
        log.debug('schoolnet authenticated: params[%s]' % request.params)
        self.base64Encoded = False
        return self._authenticated(self.site)

    @d.trace(log)
    def getWSDL(self):
        hostURL = self.hostURL
        if not hostURL.endswith('/'):
            hostURL = '%s/' % hostURL
        wsdl = '''
<wsdl:definitions xmlns:s="http://www.w3.org/2001/XMLSchema"
                  xmlns:soap12="http://schemas.xmlsoap.org/wsdl/soap12/"
                  xmlns:http="http://schemas.xmlsoap.org/wsdl/http/"
                  xmlns:mime="http://schemas.xmlsoap.org/wsdl/mime/"
                  xmlns:tns="%s"
                  xmlns:s1="http://microsoft.com/wsdl/types/"
                  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
                  xmlns:tm="http://microsoft.com/wsdl/mime/textMatching/"
                  xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"
                  targetNamespace="%s"
                  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/">
  <wsdl:types>
    <s:schema elementFormDefault="qualified" targetNamespace="%s">
      <s:import namespace="http://microsoft.com/wsdl/types/" />
      <s:element name="AuthenticateUser">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="username" type="s:string" />
            <s:element minOccurs="0" maxOccurs="1" name="password" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="AuthenticateUserResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="AuthenticateUserResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:complexType name="User">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="1" name="Username" type="s:string" />
          <s:element minOccurs="1" maxOccurs="1" name="UserId" type="s1:guid" />
          <s:element minOccurs="0" maxOccurs="1" name="ExternalId" type="s:string" />
          <s:element minOccurs="1" maxOccurs="1" name="InstitutionId" type="s1:guid" />
          <s:element minOccurs="0" maxOccurs="1" name="InstitutionName" type="s:string" />
          <s:element minOccurs="1" maxOccurs="1" name="GroupId" type="s1:guid" />
          <s:element minOccurs="0" maxOccurs="1" name="GroupName" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="FirstName" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="MiddleName" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="LastName" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="CalledName" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="NamePrefix" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="NameSuffix" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Gender" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Grade" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="DateBirth" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Email" type="s:string" />
          <s:element minOccurs="1" maxOccurs="1" name="EmailFormat" type="tns:MailFormat" />
          <s:element minOccurs="1" maxOccurs="1" name="Status" type="tns:Status" />
          <s:element minOccurs="0" maxOccurs="1" name="LinkedStudents" type="tns:ArrayOfGuid" />
          <s:element minOccurs="0" maxOccurs="1" name="AuthenticationId" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Evidence" type="s:string" />
        </s:sequence>
      </s:complexType>
      <s:simpleType name="MailFormat">
        <s:restriction base="s:string">
          <s:enumeration value="Text" />
          <s:enumeration value="Html" />
        </s:restriction>
      </s:simpleType>
      <s:simpleType name="Status">
        <s:restriction base="s:string">
          <s:enumeration value="Deleted" />
          <s:enumeration value="Active" />
          <s:enumeration value="Pending" />
          <s:enumeration value="Archived" />
          <s:enumeration value="Inactive" />
          <s:enumeration value="Private" />
          <s:enumeration value="Retired" />
          <s:enumeration value="Draft" />
          <s:enumeration value="ScheduledAnnounced" />
          <s:enumeration value="ScheduledUnannounced" />
          <s:enumeration value="Approved" />
          <s:enumeration value="Scored" />
          <s:enumeration value="Available" />
          <s:enumeration value="NoDataYet" />
          <s:enumeration value="Evidence" />
          <s:enumeration value="ALL" />
          <s:enumeration value="Unknown" />
        </s:restriction>
      </s:simpleType>
      <s:complexType name="ArrayOfGuid">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="unbounded" name="guid" type="s1:guid" />
        </s:sequence>
      </s:complexType>
      <s:element name="SoapAuthenticationHeader" type="tns:SoapAuthenticationHeader" />
      <s:complexType name="SoapAuthenticationHeader">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="1" name="Data" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Username" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="Password" type="s:string" />
          <s:element minOccurs="0" maxOccurs="1" name="PartnerId" type="s:string" />
        </s:sequence>
        <s:anyAttribute />
      </s:complexType>
      <s:element name="AuthenticateDIUser">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="diUser" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="AuthenticateDIUserResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="AuthenticateDIUserResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="AuthenticateADUser">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="1" maxOccurs="1" name="adGuid" type="s1:guid" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="AuthenticateADUserResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="AuthenticateADUserResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="CanPerformOperationAtDistrict">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="1" maxOccurs="1" name="userId" type="s1:guid" />
            <s:element minOccurs="0" maxOccurs="1" name="operation" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="CanPerformOperationAtDistrictResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="1" maxOccurs="1" name="CanPerformOperationAtDistrictResult" type="s:boolean" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserByAuthenticationId">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="id" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserByAuthenticationIdResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="GetUserByAuthenticationIdResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="ProvisionAuthenticationToken">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="1" maxOccurs="1" name="userId" type="s1:guid" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="ProvisionAuthenticationTokenResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="ProvisionAuthenticationTokenResult" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="ProvisionAuthenticationTokenForCurrentUser">
        <s:complexType />
      </s:element>
      <s:element name="ProvisionAuthenticationTokenForCurrentUserResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="ProvisionAuthenticationTokenForCurrentUserResult" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="ProvisionAuthenticationTokenByAuthenticationId">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="authenticationId" type="s:string" />
            <s:element minOccurs="0" maxOccurs="1" name="username" type="s:string" />
            <s:element minOccurs="0" maxOccurs="1" name="membershipProviderName" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="ProvisionAuthenticationTokenByAuthenticationIdResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="ProvisionAuthenticationTokenByAuthenticationIdResult" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserByExternalId">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="externalId" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserByExternalIdResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="GetUserByExternalIdResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserById">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="1" maxOccurs="1" name="id" type="s1:guid" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUserByIdResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="GetUserByIdResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetUsersByExternalId">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="externalIds" type="tns:ArrayOfString" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:complexType name="ArrayOfString">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="unbounded" name="string" nillable="true" type="s:string" />
        </s:sequence>
      </s:complexType>
      <s:element name="GetUsersByExternalIdResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="GetUsersByExternalIdResult" type="tns:ArrayOfUser" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:complexType name="ArrayOfUser">
        <s:sequence>
          <s:element minOccurs="0" maxOccurs="unbounded" name="User" nillable="true" type="tns:User" />
        </s:sequence>
      </s:complexType>
      <s:element name="GetLastLoginUserByUserName">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="userName" type="s:string" />
          </s:sequence>
        </s:complexType>
      </s:element>
      <s:element name="GetLastLoginUserByUserNameResponse">
        <s:complexType>
          <s:sequence>
            <s:element minOccurs="0" maxOccurs="1" name="GetLastLoginUserByUserNameResult" type="tns:User" />
          </s:sequence>
        </s:complexType>
      </s:element>
    </s:schema>
    <s:schema elementFormDefault="qualified" targetNamespace="http://microsoft.com/wsdl/types/">
      <s:simpleType name="guid">
        <s:restriction base="s:string">
          <s:pattern value="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" />
        </s:restriction>
      </s:simpleType>
    </s:schema>
  </wsdl:types>
  <wsdl:message name="AuthenticateUserSoapIn">
    <wsdl:part name="parameters" element="tns:AuthenticateUser" />
  </wsdl:message>
  <wsdl:message name="AuthenticateUserSoapOut">
    <wsdl:part name="parameters" element="tns:AuthenticateUserResponse" />
  </wsdl:message>
  <wsdl:message name="AuthenticateUserSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="AuthenticateDIUserSoapIn">
    <wsdl:part name="parameters" element="tns:AuthenticateDIUser" />
  </wsdl:message>
  <wsdl:message name="AuthenticateDIUserSoapOut">
    <wsdl:part name="parameters" element="tns:AuthenticateDIUserResponse" />
  </wsdl:message>
  <wsdl:message name="AuthenticateADUserSoapIn">
    <wsdl:part name="parameters" element="tns:AuthenticateADUser" />
  </wsdl:message>
  <wsdl:message name="AuthenticateADUserSoapOut">
    <wsdl:part name="parameters" element="tns:AuthenticateADUserResponse" />
  </wsdl:message>
  <wsdl:message name="CanPerformOperationAtDistrictSoapIn">
    <wsdl:part name="parameters" element="tns:CanPerformOperationAtDistrict" />
  </wsdl:message>
  <wsdl:message name="CanPerformOperationAtDistrictSoapOut">
    <wsdl:part name="parameters" element="tns:CanPerformOperationAtDistrictResponse" />
  </wsdl:message>
  <wsdl:message name="CanPerformOperationAtDistrictSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="GetUserByAuthenticationIdSoapIn">
    <wsdl:part name="parameters" element="tns:GetUserByAuthenticationId" />
  </wsdl:message>
  <wsdl:message name="GetUserByAuthenticationIdSoapOut">
    <wsdl:part name="parameters" element="tns:GetUserByAuthenticationIdResponse" />
  </wsdl:message>
  <wsdl:message name="GetUserByAuthenticationIdSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenSoapIn">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationToken" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenSoapOut">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationTokenResponse" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenForCurrentUserSoapIn">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationTokenForCurrentUser" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenForCurrentUserSoapOut">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationTokenForCurrentUserResponse" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenByAuthenticationIdSoapIn">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationTokenByAuthenticationId" />
  </wsdl:message>
  <wsdl:message name="ProvisionAuthenticationTokenByAuthenticationIdSoapOut">
    <wsdl:part name="parameters" element="tns:ProvisionAuthenticationTokenByAuthenticationIdResponse" />
  </wsdl:message>
  <wsdl:message name="GetUserByExternalIdSoapIn">
    <wsdl:part name="parameters" element="tns:GetUserByExternalId" />
  </wsdl:message>
  <wsdl:message name="GetUserByExternalIdSoapOut">
    <wsdl:part name="parameters" element="tns:GetUserByExternalIdResponse" />
  </wsdl:message>
  <wsdl:message name="GetUserByExternalIdSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="GetUserByIdSoapIn">
    <wsdl:part name="parameters" element="tns:GetUserById" />
  </wsdl:message>
  <wsdl:message name="GetUserByIdSoapOut">
    <wsdl:part name="parameters" element="tns:GetUserByIdResponse" />
  </wsdl:message>
  <wsdl:message name="GetUserByIdSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="GetUsersByExternalIdSoapIn">
    <wsdl:part name="parameters" element="tns:GetUsersByExternalId" />
  </wsdl:message>
  <wsdl:message name="GetUsersByExternalIdSoapOut">
    <wsdl:part name="parameters" element="tns:GetUsersByExternalIdResponse" />
  </wsdl:message>
  <wsdl:message name="GetUsersByExternalIdSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:message name="GetLastLoginUserByUserNameSoapIn">
    <wsdl:part name="parameters" element="tns:GetLastLoginUserByUserName" />
  </wsdl:message>
  <wsdl:message name="GetLastLoginUserByUserNameSoapOut">
    <wsdl:part name="parameters" element="tns:GetLastLoginUserByUserNameResponse" />
  </wsdl:message>
  <wsdl:message name="GetLastLoginUserByUserNameSoapAuthenticationHeader">
    <wsdl:part name="SoapAuthenticationHeader" element="tns:SoapAuthenticationHeader" />
  </wsdl:message>
  <wsdl:portType name="UserInfoServiceSoap">
    <wsdl:operation name="AuthenticateUser">
      <wsdl:input message="tns:AuthenticateUserSoapIn" />
      <wsdl:output message="tns:AuthenticateUserSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="AuthenticateDIUser">
      <wsdl:input message="tns:AuthenticateDIUserSoapIn" />
      <wsdl:output message="tns:AuthenticateDIUserSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="AuthenticateADUser">
      <wsdl:input message="tns:AuthenticateADUserSoapIn" />
      <wsdl:output message="tns:AuthenticateADUserSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="CanPerformOperationAtDistrict">
      <wsdl:input message="tns:CanPerformOperationAtDistrictSoapIn" />
      <wsdl:output message="tns:CanPerformOperationAtDistrictSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="GetUserByAuthenticationId">
      <wsdl:input message="tns:GetUserByAuthenticationIdSoapIn" />
      <wsdl:output message="tns:GetUserByAuthenticationIdSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationToken">
      <wsdl:input message="tns:ProvisionAuthenticationTokenSoapIn" />
      <wsdl:output message="tns:ProvisionAuthenticationTokenSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenForCurrentUser">
      <wsdl:input message="tns:ProvisionAuthenticationTokenForCurrentUserSoapIn" />
      <wsdl:output message="tns:ProvisionAuthenticationTokenForCurrentUserSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenByAuthenticationId">
      <wsdl:input message="tns:ProvisionAuthenticationTokenByAuthenticationIdSoapIn" />
      <wsdl:output message="tns:ProvisionAuthenticationTokenByAuthenticationIdSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="GetUserByExternalId">
      <wsdl:input message="tns:GetUserByExternalIdSoapIn" />
      <wsdl:output message="tns:GetUserByExternalIdSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="GetUserById">
      <wsdl:input message="tns:GetUserByIdSoapIn" />
      <wsdl:output message="tns:GetUserByIdSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="GetUsersByExternalId">
      <wsdl:input message="tns:GetUsersByExternalIdSoapIn" />
      <wsdl:output message="tns:GetUsersByExternalIdSoapOut" />
    </wsdl:operation>
    <wsdl:operation name="GetLastLoginUserByUserName">
      <wsdl:input message="tns:GetLastLoginUserByUserNameSoapIn" />
      <wsdl:output message="tns:GetLastLoginUserByUserNameSoapOut" />
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="UserInfoServiceSoap" type="tns:UserInfoServiceSoap">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http" />
    <wsdl:operation name="AuthenticateUser">
      <soap:operation soapAction="%s/AuthenticateUser" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:AuthenticateUserSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:AuthenticateUserSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="AuthenticateDIUser">
      <soap:operation soapAction="%s/AuthenticateDIUser" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="AuthenticateADUser">
      <soap:operation soapAction="%s/AuthenticateADUser" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="CanPerformOperationAtDistrict">
      <soap:operation soapAction="%s/CanPerformOperationAtDistrict" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:CanPerformOperationAtDistrictSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:CanPerformOperationAtDistrictSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserByAuthenticationId">
      <soap:operation soapAction="%s/GetUserByAuthenticationId" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByAuthenticationIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByAuthenticationIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationToken">
      <soap:operation soapAction="%s/ProvisionAuthenticationToken" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenForCurrentUser">
      <soap:operation soapAction="%s/ProvisionAuthenticationTokenForCurrentUser" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenByAuthenticationId">
      <soap:operation soapAction="%s/ProvisionAuthenticationTokenByAuthenticationId" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserByExternalId">
      <soap:operation soapAction="%s/GetUserByExternalId" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserById">
      <soap:operation soapAction="%s/GetUserById" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:GetUserByIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUsersByExternalId">
      <soap:operation soapAction="%s/GetUsersByExternalId" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:GetUsersByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:GetUsersByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetLastLoginUserByUserName">
      <soap:operation soapAction="%s/GetLastLoginUserByUserName" style="document" />
      <wsdl:input>
        <soap:body use="literal" />
        <soap:header message="tns:GetLastLoginUserByUserNameSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap:body use="literal" />
        <soap:header message="tns:GetLastLoginUserByUserNameSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:binding name="UserInfoServiceSoap12" type="tns:UserInfoServiceSoap">
    <soap12:binding transport="http://schemas.xmlsoap.org/soap/http" />
    <wsdl:operation name="AuthenticateUser">
      <soap12:operation soapAction="%s/AuthenticateUser" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:AuthenticateUserSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:AuthenticateUserSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="AuthenticateDIUser">
      <soap12:operation soapAction="%s/AuthenticateDIUser" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="AuthenticateADUser">
      <soap12:operation soapAction="%s/AuthenticateADUser" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="CanPerformOperationAtDistrict">
      <soap12:operation soapAction="%s/CanPerformOperationAtDistrict" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:CanPerformOperationAtDistrictSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:CanPerformOperationAtDistrictSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserByAuthenticationId">
      <soap12:operation soapAction="%s/GetUserByAuthenticationId" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByAuthenticationIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByAuthenticationIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationToken">
      <soap12:operation soapAction="%s/ProvisionAuthenticationToken" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenForCurrentUser">
      <soap12:operation soapAction="%s/ProvisionAuthenticationTokenForCurrentUser" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="ProvisionAuthenticationTokenByAuthenticationId">
      <soap12:operation soapAction="%s/ProvisionAuthenticationTokenByAuthenticationId" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserByExternalId">
      <soap12:operation soapAction="%s/GetUserByExternalId" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUserById">
      <soap12:operation soapAction="%s/GetUserById" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUserByIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetUsersByExternalId">
      <soap12:operation soapAction="%s/GetUsersByExternalId" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUsersByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetUsersByExternalIdSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
    <wsdl:operation name="GetLastLoginUserByUserName">
      <soap12:operation soapAction="%s/GetLastLoginUserByUserName" style="document" />
      <wsdl:input>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetLastLoginUserByUserNameSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:input>
      <wsdl:output>
        <soap12:body use="literal" />
        <soap12:header message="tns:GetLastLoginUserByUserNameSoapAuthenticationHeader" part="SoapAuthenticationHeader" use="literal" />
      </wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
  <wsdl:service name="UserInfoService">
    <wsdl:port name="UserInfoServiceSoap" binding="tns:UserInfoServiceSoap">
      <soap:address location="%s/services/userinfoservice.asmx" />
    </wsdl:port>
    <wsdl:port name="UserInfoServiceSoap12" binding="tns:UserInfoServiceSoap12">
      <soap12:address location="%s/services/userinfoservice.asmx" />
    </wsdl:port>
  </wsdl:service>
</wsdl:definitions>
''' % (hostURL, hostURL, hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.hostURL, self.schoolnetURL, self.schoolnetURL)
        return wsdl
