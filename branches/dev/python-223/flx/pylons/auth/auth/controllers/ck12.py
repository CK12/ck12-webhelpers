import logging
import urllib

from pylons import config, request, session, tmpl_context as c
from pylons.i18n.translation import _ 
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.extAuth import ExtAuthController
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render

from openid.extensions.ax import FetchRequest, AttrInfo, FetchResponse
from openid.store.filestore import FileOpenIDStore
from openid.consumer.consumer import Consumer, SUCCESS, CANCEL

log = logging.getLogger(__name__)

class Ck12Controller(ExtAuthController):
    """
        CK-12 authentication related APIs.
    """
    site = 'ck12'

    def __init__(self):
        schemaUrl = config.get('schema_url')
        person = '%s/namePerson' % schemaUrl
        contact = '%s/contact' % schemaUrl
        openidFilestorePath = config.get('openid_filestore_path')
        store = FileOpenIDStore(openidFilestorePath)
        self.ck12Dict = {
            'openidUrl': config.get('openid_url'),
            'openidStore': store,
            'openidRealm': config.get('openid_realm'),
            'firstName': '%s/first' % person,
            'lastName': '%s/last' % person,
            'email': '%s/email' % contact,
            'gender': '%s/gender' % person,
        }

    @d.trace(log, ['url'])
    def login(self, url=None):
        """
            Login via CK-12.
        """
        if request.params.has_key('url'):
            url = request.params.get('url')
        log.info('ck-12 login: url[%s]' % url)
        returnTo = request.params.get('returnTo')
        if returnTo:
            url = url + '?returnTo=%s' % urllib.quote(returnTo)

        try:
            gd = self.ck12Dict
            if request.params.has_key('openidRealm'):
                openidRealm = request.params.get('openidRealm')
            else:
                openidRealm = gd['openidRealm']

            consumer = Consumer(session, gd['openidStore'])
            authRequest = consumer.begin(gd['openidUrl'])
            freq = FetchRequest()
            freq.add(AttrInfo(gd['firstName'], 1, True, 'firstname'))
            freq.add(AttrInfo(gd['lastName'], 1, True, 'lastname'))
            freq.add(AttrInfo(gd['email'], 1, True, 'email'))
            freq.add(AttrInfo(gd['gender'], 1, True, 'gender'))
            authRequest.addExtension(freq)

            redirectUrl = authRequest.redirectURL(openidRealm,
                                                  return_to=url,
                                                  immediate=False)
            log.info('ck-12 login: redirectURL[%s]' % redirectUrl)
        except Exception, e:
            log.exception(e)
            c.status = ErrorCodes().getName(ErrorCodes.AUTHENTICATION_FAILED)
            return render('%s/common/error.html' % self.prefix)

        return redirect(redirectUrl)

    @d.jsonify()
    @d.trace(log)
    def getInfo(self):
        """
            Get the member information from ck-12.
        """
        log.info('ck-12 getInfo params[%s]' % request.params)
        url = self._getAuthenticatedURL(self.site)
        log.info('ck-12 getInfo url[%s]' % url)

        gd = self.ck12Dict
        consumer = Consumer(session, gd['openidStore'])
        log.info('ck-12 getInfo consumer[%s]' % consumer)
        info = consumer.complete(request.params, url)
        log.info('ck-12 getInfo info.status[%s]' % info.status)
        log.info('ck-12 getInfo info[%s]' % info.__dict__)
        if info.status == CANCEL:
            c.errorCode = ErrorCodes.AUTHENTICATION_REJECTED
            return ErrorCodes().asDict(c.errorCode, 'ck-12 authentication rejected.')
        elif info.status != SUCCESS:
            log.error('ck-12 getInfo failed[%s]' % info.message)
            c.errorCode = ErrorCodes.AUTHENTICATION_FAILED
            return ErrorCodes().asDict(c.errorCode, 'ck-12 getInfo failed[%s]' % info.message)

        try:
            result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
            #
            #  Get information returned from CK-12.
            #
            freqResponse = FetchResponse.fromSuccessResponse(info)
            if freqResponse is None:
                raise Exception((_(u'Empty response from CK-12')).encode("utf-8"))

            params = {}
            givenName = freqResponse.getSingle(gd['firstName'])
            if givenName is not None:
                params['firstName'] = givenName
            surname = freqResponse.getSingle(gd['lastName'])
            if surname is not None:
                params['lastName'] = surname
            gender = freqResponse.getSingle(gd['gender'])
            if gender is not None:
                params['gender'] = gender
            email = freqResponse.getSingle(gd['email'])
            if email is not None:
                params['email'] = email
                params['token'] = email
            params['authType'] = 'ck12'
            result['response']['ck12'] = params
            return result
        except Exception, e:
            log.error('ck-12 authenticated exception[%s]' % e)
            c.errorCode = ErrorCodes.UNKNOWN_MEMBER
            return ErrorCodes().asDict(c.errorCode, e)

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
        log.info('ck-12 authenticated: params[%s]' % request.params)
        return self._authenticated(self.site)
