import logging
import random
from urllib import quote

from oauthlib.oauth1.rfc5849 import Server as OAuthServer
from pylons import request, response, tmpl_context as c
from pylons.controllers.util import redirect
from pylons.i18n.translation import _ 

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render
from auth.model import api
from auth.model import model
from auth.model import utils

from sqlalchemy.orm.exc import DetachedInstanceError

log = logging.getLogger(__name__)

__controller__ = 'OAuthServerController'

class OAuthServerController(BaseController, OAuthServer):
    clientDict = {}
    tokenDict = {}

    def _getClient(self, id):
        client = self.clientDict.get(id)
        if client:
            try:
                client.id
            except DetachedInstanceError:
                client = api.merge(client)
                self.clientDict[client.id] = client
                self.clientDict[client.secret] = client
        else:
            client = api.getOAuthClientByID(id=id)
            if not client:
                client = api.getOAuthClientBySecret(secret=id)
            if client:
                self.clientDict[client.id] = client
                self.clientDict[client.secret] = client
        log.debug('_getClient: dict client[%s]' % client)
        return client

    def getOAuthToken(self, token):
        oAuthToken = self.tokenDict.get(token)
        if oAuthToken:
            try:
                oAuthToken.token
            except DetachedInstanceError:
                oAuthToken = api.merge(oAuthToken)
                self.tokenDict[oAuthToken.token] = oAuthToken
        else:
            oAuthToken = api.getOAuthToken(token=token)
            if oAuthToken:
                self.tokenDict[oAuthToken.token] = oAuthToken
        log.debug('getOAuthToken: dict oAuthToken[%s]' % oAuthToken)
        return oAuthToken

    def generateToken(self, length=25):
        import string

        token = ''.join(random.choice(string.ascii_letters.decode('ascii') + string.digits.decode('ascii')) for i in range(length))
        return unicode(token)

    def generateClientID(self):
        while True:
            id = self.generateToken(length=30)
            client = api.getOAuthClientByID(id=id)
            if client is None:
                break
        return id

    def generateRequestToken(self):
        while True:
            token = self.generateToken(length=25)
            oAuthToken = api.getOAuthToken(token=token)
            if oAuthToken is None:
                break
        return token

    def generateAccessToken(self):
        while True:
            token = self.generateToken(length=30)
            oAuthToken = api.getOAuthToken(token=token)
            if oAuthToken is None:
                break
        return token

    def generateSecret(self):
        while True:
            secret = self.generateToken(length=50)
            client = api.getOAuthClientBySecret(secret=secret)
            if client is None:
                break
        return secret

    def check_nonce(self, nonce):
        return nonce > 0

    def validate_timestamp_and_nonce(self, client_key, timestamp, nonce, request_token=None, access_token=None): 
        log.debug('validate_timestamp_and_nonce: client_key[%s] timestamp[%s] nonce[%s] request_token[%s] access_token[%s]' % (client_key, timestamp, nonce, request_token, access_token))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_timestamp_and_nonce: client[%s] not found' % client_key)
            return False
        oAuthToken = api.getOAuthTokenByNonce(nonce=nonce)
        if oAuthToken:
            token = request_token
            if not token:
                token = access_token
            if token and oAuthToken.token != token:
                log.debug('validate_timestamp_and_nonce: wrong token')
                return False

            import time

            currentTime = time.time()
            delta = currentTime - oAuthToken.timestamp
            if delta > 600:
                log.debug('validate_timestamp_and_nonce: timed out, idled[%d]' % delta)
                return False
        return True

    def validate_client_key(self, client_key):
        log.debug('validate_client_key: client_key[%s]' % client_key)
        client = self._getClient(client_key)
        return client.id == client_key

    def validate_redirect_uri(self, client_key, redirect_uri):
        log.debug('validate_redirect_uri: client_key[%s] redirect_uri[%s]' % (client_key, redirect_uri))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_redirect_uri: client[%s] not found' % client_key)
            return False
        log.debug('validate_redirect_uri: client.callback[%s]' % client.callback)
        return True

    def validate_requested_realm(self, client_key, realm):
        log.debug('validate_requested_realm: client_key[%s] realm[%s]' % (client_key, realm))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_requested_realm: client[%s] not found' % client_key)
            return False
        return True

    def validate_realm(self, client_key, access_token, uri=None, required_realm=None):
        log.debug('validate_realm: client_key[%s] access_token[%s] uri[%s] required_realm[%s]' % (client_key, access_token, uri, required_realm))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_realm: client[%s] not found' % client_key)
            return False
        return True

    def validate_verifier(self, client_key, request_token, verifier):
        log.debug('validate_verifier: client_key[%s] request_token[%s] verifier[%s]' % (client_key, request_token, verifier))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_verifier: client[%s] not found' % client_key)
            return False
        oAuthToken = self.getOAuthToken(token=request_token)
        if not oAuthToken:
            log.debug('validate_verifier: request_token[%s] not found' % request_token)
            return False
        return True

    def validate_request_token(self, client_key, resource_owner_key):
        log.debug('validate_request_token: client_key[%s] resource_owner_key[%s]' % (client_key, resource_owner_key))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_request_token: client[%s] not found' % client_key)
            return False
        oAuthToken = self.getOAuthToken(token=resource_owner_key)
        if not oAuthToken:
            log.debug('validate_request_token: resource_owner_key[%s] not found' % resource_owner_key)
            return False
        return True

    def validate_access_token(self, client_key, resource_owner_key):
        log.debug('validate_access_token: client_key[%s] resource_owner_key[%s]' % (client_key, resource_owner_key))
        client = self._getClient(client_key)
        if not client:
            log.debug('validate_access_token: client[%s] not found' % client_key)
            return False
        oAuthToken = self.getOAuthToken(token=resource_owner_key)
        if not oAuthToken:
            log.debug('validate_access_token: resource_owner_key[%s] not found' % resource_owner_key)
            return False
        return True

    def get_client_secret(self, client_key):
        client = self._getClient(client_key)
        if not client:
            log.debug('get_client_secret: client[%s] not found' % client_key)
            return None
        return client.secret

    def get_request_token_secret(self, client_key, request_token): 
        client = self._getClient(client_key)
        if not client or not request_token:
            log.debug('get_request_token_secret: client[%s] not found' % client_key)
            return None
        oAuthToken = self.getOAuthToken(request_token)
        if not oAuthToken:
            log.debug('get_request_token_secret: request_token[%s] not found' % request_token)
            return None
        return oAuthToken.secret

    def get_access_token_secret(self, client_key, access_token):
        client = self._getClient(client_key)
        if not client or not access_token:
            log.debug('get_access_token_secret: client[%s] not found' % client_key)
            return None
        oAuthToken = self.getOAuthToken(access_token)
        if not oAuthToken:
            log.debug('get_access_token_secret: access_token[%s] not found' % access_token)
            return None
        return oAuthToken.secret

    def dummy_request_token(self, client_key, request_token): 
        client = self._getClient(client_key)
        if not client:
            log.debug('dummy_request_token: client[%s] not found' % client_key)
            return None
        return 'dummy'

    def dummy_access_token(self, client_key, access_token):
        client = self._getClient(client_key)
        if not client:
            log.debug('dummy_access_token: client[%s] not found' % client_key)
            return None
        return 'dummy'

    @d.trace(log)
    def getRequestToken(self):
        try:
            params = request.params
            log.debug('getRequestToken: params[%s]' % params)
            log.debug('getRequestToken: request.uri[%s]' % request.url)
            log.debug('getRequestToken: request.method[%s]' % request.method)
            log.debug('getRequestToken: request.headers[%s]' % request.headers)
            log.debug('getRequestToken: request.body[%s]' % request.body)
            headers = request.headers
            if headers:
                try:
                    headers = headers.items()
                except AttributeError:
                    headers = None
            try:
                self.verify_request(unicode(request.url),
                                    http_method=unicode(request.method),
                                    body=request.body,
                                    headers=headers,
                                    require_verifier=False,
                                    require_resource_owner=False)
            except Exception, e:
                log.debug('getRequestToken: verify_request e[%s]' % e)
                raise Exception((_(u"Request verification failed.")).encode("utf-8"))

            consumerKey = params.get('oauth_consumer_key')
            callback = params.get('oauth_callback')
            nonce = params.get('oauth_nonce')
            timestamp = params.get('oauth_timestamp')
            log.debug('getRequestToken: consumerKey[%s]' % consumerKey)
            log.debug('getRequestToken: callback[%s]' % callback)
            log.debug('getRequestToken: nonce[%s]' % nonce)
            log.debug('getRequestToken: timestamp[%s]' % timestamp)
            client = self._getClient(id=consumerKey)
            if callback == 'oob':
                callback = client.callback
            token = self.generateRequestToken()
            tokenSecret = self.generateSecret()
            data = {
                'token': token,
                'clientID': client.id,
                'timestamp': timestamp,
                'nonce': nonce,
                'callback': callback,
                'secret': tokenSecret,
                'type': 'request',
            }
            oAuthToken = api.create(model.OAuthToken, **data)
            r = 'oauth_token=%s&oauth_token_secret=%s&oauth_callback_confirmed=true' % (quote(token, safe=''), quote(oAuthToken.secret, safe=''))
            log.debug('getRequestToken: r[%s]' % r)
            return r
        except ValueError, ve:
            response.status_int = 400
            ve = str(ve)
            log.debug('getRequestToken: ve[%s]' % ve)
            return ve
        except Exception, e:
            response.status_int = 401
            e = str(e)
            log.debug('getRequestToken: e[%s]' % e)
            return e

    def generateVerifier(self, length=25):
        return ''.join([str(random.randint(0, 9)) for i in range(length)])

    def authorizedRedirect(self, callback, token):
        verifier = self.generateVerifier(length=25)
        ch = '&' if '?' in callback else '?'
        callback = '%s%soauth_token=%s&oauth_verifier=%s' % (callback, ch, token, verifier)
        log.debug('authorizedRedirect: after callback[%s]' % callback)
        redirect(callback)

    def updateOAuthToken(self, oAuthToken, member):
        #
        #  Associate member with the token.
        #
        oAuthToken.memberID = member.id
        api.update(instance=oAuthToken)

    @d.checkAuth(request, True, False)
    @d.trace(log, ['member'])
    def authorize(self, member):
        """
            OAuth server -- Authorization Endpoint.
        """
        params = request.params
        log.debug('authorize: params[%s]' % params)
        log.debug('authorize: request.method[%s]' % request.method)

        from auth.forms.oauth import AuthorizeForm

        c.form = AuthorizeForm()

        token = params.get('oauth_token')
        log.debug('authorize: token[%s]' % token)
        oAuthToken = self.getOAuthToken(token=token)
        log.debug('authorize: oAuthToken[%s]' % oAuthToken)
        if oAuthToken:
            client = self._getClient(id=oAuthToken.clientID)
            log.debug('authorize: client[%s]' % client)
        else:
            client = None
        if client:
            callback = oAuthToken.callback
            c.callback = callback
            if request.method == "GET":
                #
                #  If the client is trusted, don't ask user.
                #
                if client.trusted:
                    #
                    #  Return auth token. No need for user confirmation.
                    #
                    self.updateOAuthToken(oAuthToken, member)
                    if callback:
                        self.authorizedRedirect(callback, token)
                    else:
                        response.status_int = 400
            elif request.method == "POST":
                try:
                    self.updateOAuthToken(oAuthToken, member)
                except Exception, e:
                    response.status_int = 401
                    log.debug('authorize: e[%s]' % e)
                    c.form_errors = e
                    callback = None

                if callback:
                    self.authorizedRedirect(callback, token)
        else:
            response.status_int = 400

        c.member = member
        c.client = client
        c.token = token

        # GET request or POST with invalid CSRF
        log.debug('authorize: invoking form[%s/authenticate/oauthAuthorize.html]' % (self.prefix))
        return render('%s/authenticate/oauthAuthorize.html' % self.prefix)

    @d.trace(log)
    def getAccessToken(self):
        try:
            params = request.params
            log.debug('getAccessToken: request.url[%s]' % request.url)
            log.debug('getAccessToken: request.method[%s]' % request.method)
            log.debug('getAccessToken: params[%s]' % params)
            log.debug('getAccessToken: request.headers[%s]' % request.headers)
            url = request.url
            if '?' not in url:
                first = True
                for key in params:
                    if first:
                        ch = '?'
                        first = False
                    else:
                        ch = '&'
                    value = params[key]
                    log.debug('getAccessToken: key[%s] value[%s]' % (key, value))
                    url = '%s%s%s=%s' % (url, ch, key, quote(value, safe=''))
            log.debug("getAccessToken: url=[%s]" % url)
            headers = request.headers
            if headers:
                try:
                    headers = headers.items()
                except AttributeError:
                    headers = None
            try:
                self.verify_request(unicode(url),
                                    http_method=unicode(request.method),
                                    body=request.body,
                                    headers=headers,
                                    require_verifier=True,
                                    require_resource_owner=True)
            except Exception, e:
                log.debug('getAccessToken: verify_request e[%s]' % e)
                raise Exception((_(u"Request verification failed.")).encode("utf-8"))

            token = params.get('oauth_token')
            log.debug('getAccessToken: token[%s]' % token)
            reqToken = self.getOAuthToken(token=token)
            log.debug('getAccessToken: reqToken[%s]' % reqToken)
            memberID = reqToken.memberID
            member = api.getMemberByID(memberID)
            log.debug('getAccessToken: member[%s]' % member)
            client = self._getClient(id=reqToken.clientID)
            log.debug('getAccessToken: client[%s]' % client)
            nonce = params.get('oauth_nonce')
            timestamp = params.get('oauth_timestamp')
            token = self.generateAccessToken()
            tokenSecret = self.generateSecret()

            tx = utils.transaction(self.getFuncName())
            with tx as session:
                data = {
                    'token': token,
                    'clientID': client.id,
                    'memberID': member.id,
                    'timestamp': timestamp,
                    'nonce': nonce,
                    'callback': reqToken.callback,
                    'secret': tokenSecret,
                    'type': 'access',
                }
                api._create(session, model.OAuthToken, **data)
                api._delete(session, instance=reqToken)
                del self.tokenDict[reqToken.token]
            r = 'oauth_token=%s&oauth_token_secret=%s&access_token=%s' % (token, tokenSecret, token)
            log.debug('getAccessToken: r[%s]' % r)
            return r
        except ValueError, ve:
            log.debug('getAccessToken: ve[%s]' % ve)
            response.status_int = 400
            return ve
        except Exception, e:
            log.debug('getAccessToken: e[%s]' % e)
            response.status_int = 401
            return e

    @d.trace(log)
    def getMyInfo(self):
        try:
            params = request.params
            log.debug('getMyInfo: request.url[%s]' % request.url)
            log.debug('getMyInfo: request.method[%s]' % request.method)
            log.debug('getMyInfo: params[%s]' % params)
            log.debug('getMyInfo: request.headers[%s]' % request.headers)
            url = request.url
            log.debug("getMyInfo: url=[%s]" % url)

            token = params.get('oauth_token')
            log.debug('getMyInfo: token[%s]' % token)
            reqToken = self.getOAuthToken(token=token)
            log.debug('getMyInfo: reqToken[%s]' % reqToken)
            clientID = params.get('oauth_consumer_key')
            if clientID != reqToken.clientID:
                raise Exception((_(u"Request verification failed.")).encode("utf-8"))
            memberID = reqToken.memberID
            member = api.getMemberByID(memberID)
            log.debug('getMyInfo: member[%s]' % member)
            #data = 'id=%s&email=%s&firstName=%s&lastName=%s' % (member.id, member.email, member.givenName, member.surname)
            data = {
                'id': member.id,
                'email': member.email,
                'firstName': member.givenName,
                'lastName': member.surname,
            }

            import json

            data = json.dumps(data)

            log.debug('getMyInfo: data[%s]' % data)
            return data
        except ValueError, ve:
            log.debug('getAccessToken: ve[%s]' % ve)
            response.status_int = 400
            return ve
        except Exception, e:
            log.debug('getAccessToken: e[%s]' % e)
            response.status_int = 401
            return e

    @d.jsonify()
    @d.checkAuth(request, True, False)
    @d.trace(log, ['member'])
    def getClient(self, member):
        """
            Retrieve the OAuth client of the logged in member.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:
            client = api.getOAuthClientByMember(memberID=member.id)
            if not client:
                c.errorCode = ErrorCodes.NO_SUCH_OAUTH_CLIENT
                raise Exception((_(u"No OAuth client.")).encode("utf-8"))

            result['response']['client'] = client.asDict()
            return result
        except Exception, e:
            log.error('getClient Exception[%s]' % str(e))
            return ErrorCodes().asDict(c.errorCode, str(e))

    @d.jsonify()
    @d.checkAuth(request, True, False)
    @d.trace(log, ['member'])
    def createClient(self, member):
        """
            Create a OAuth client.
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        c.errorCode = ErrorCodes.OK
        try:

            params = request.params
            name = params.get('name')
            if not name:
                raise Exception((_(u"Missing name.")).encode("utf-8"))

            client = api.getOAuthClientByName(name=name)
            if client:
                raise Exception((_(u"Client already exists.")).encode("utf-8"))

            callback = params.get('callback')
            if not name:
                raise Exception((_(u"Missing callback.")).encode("utf-8"))

            description = params.get('description', None)
            url = params.get('website', None)
            clientID = self.generateClientID()
            secret = self.generateSecret()
            data = {
                'id': clientID,
                'memberID': member.id,
                'name': name,
                'description': description,
                'url': url,
                'callback': callback,
                'secret': secret,
                'trusted': False,
            }
            oAuthClient = api.create(model.OAuthClient, **data)
            if not oAuthClient:
                raise Exception((_(u"Unable to create Client.")).encode("utf-8"))
            key = {
                'consumer_key': oAuthClient.id,
                'secret': oAuthClient.secret,
            }
            result['response'] = key
            return result
        except Exception, e:
            log.error('createClient Exception[%s]' % str(e))
            c.errorCode = ErrorCodes.CANNOT_CREATE_OAUTH_CLIENT
            return ErrorCodes().asDict(c.errorCode, str(e))
