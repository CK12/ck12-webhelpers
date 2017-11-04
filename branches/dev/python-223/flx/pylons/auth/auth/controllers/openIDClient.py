import logging

from pylons import config, request, response, session, url, tmpl_context as c
from pylons.controllers.util import redirect

from auth.controllers import decorators as d
from auth.controllers.errorCodes import ErrorCodes
from auth.lib.base import BaseController, render
import auth.controllers.user as u
import auth.lib.helpers as h

from openid.extensions.ax import FetchRequest, FetchResponse
from openid.store.filestore import FileOpenIDStore
from openid.server import server

log = logging.getLogger(__name__)

class OpenidclientController(BaseController):
    """
        The OpenID Provider support.

        This is a reference implementation only. The real implementation
        should be done at the Web layer.
    """

    uriDict = {
        #
        #  Supported attributes.
        #
        'http://axschema.org/contact/email':        'email',
        'http://axschema.org/namePerson':           'name',
        'http://axschema.org/namePerson/first':     'firstname',
        'http://axschema.org/namePerson/last':      'lastname',
        'http://axschema.org/namePerson/suffix':    'suffix',
        'http://axschema.org/namePerson/prefix':    'title',
        'http://axschema.org/namePerson/friendly':  'login',
        'http://axschema.org/namePerson/gender':    'gender',
    }
    memberInfoDict = {
        'email':        [ 'email',
                          'email address',
                        ],
        'name':         [ 'name',
                          'full name',
                        ],
        'firstname':    [ 'givenName',
                          'first name',
                        ],
        'lastname':     [ 'surname',
                          'last name',
                        ],
        'suffix':       [ 'suffix',
                          'suffix',
                        ],
        'prefix':       [ 'title',
                          'title',
                        ],
        'friendly':     [ 'login',
                          'login',
                        ],
        'gender':       [ 'gender',
                          'gender',
                        ],
    }

    def __init__(self):
        """
            Set up the provider instance for OpenID authentication.
        """
        openidFilestorePath = config.get('openid_filestore_path')
        store = FileOpenIDStore(openidFilestorePath)
        baseURL = config.get('openid_url')
        self.server = server.Server(store, baseURL)

    @d.trace(log, [ 'api', 'cookie', 'isJson' ])
    def _call(self, api, cookie=None, isJson=False):
        """
            For making a restful API call.
        """
        if cookie is None:
            from urllib2 import urlopen

            f = urlopen(api)
        else:
            from cookielib import CookieJar
            from urllib2 import build_opener, HTTPCookieProcessor

            cj = CookieJar()
            cj.set_cookie(cookie)
            f = build_opener(HTTPCookieProcessor(cj)).open(api)

        data = f.read()
        if not isJson:
            log.info('OpenIDClient _call data[%s]' % data)
            return data

        import simplejson

        result = simplejson.loads(data)
        status = result['responseHeader']['status']
        resp = result['response']
        log.info('OpenIDClient _call status[%s]' % status)
        log.info('OpenIDClient _call response[%s]' % resp)
        return status, resp

    @d.trace(log)
    def index(self):
        """
            For verifying return to URL.
        """
        serverUrl = url(controller='openIDServer',
                        action='index',
                        qualified=True)
        return self._call(serverUrl)

    @d.trace(log)
    def authenticate(self):
        """
            Authenticate.
        """
        params = request.params
        query = dict((k, v) for k, v in params.iteritems())
        query['openid.return_to'] = h.restoreSlash(query.get('openid.return_to'))
        log.info('OpenIDClient authenticate query[%s]' % query)
        openIDRequest = self.server.decodeRequest(query)

        if openIDRequest is not None:
            if openIDRequest.mode in ['checkid_immediate', 'checkid_setup']:
                return self._handleCheckIDRequest(request, query)

        serverUrl = url(controller='openIDServer',
                        action='authenticate',
                        qualified=True,
                        **params)
        return self._call(serverUrl)

    @d.trace(log, [ 'request' ])
    def _getURI(self, request):
        """
            Extract the uri information from request.
        """
        uri = ''
        if request.environ.has_key('REQUEST_URI'):
            uri = request.environ['REQUEST_URI']
        elif request.environ.has_key('RAW_URI'):
            uri = request.environ['RAW_URI']
        elif request.environ.has_key('PATH_INFO'):
            uri = request.environ['PATH_INFO']
            if request.environ.has_key('QUERY_STRING'):
                uri = '%s?%s' % (uri, request.environ['QUERY_STRING'])

        return uri

    @d.trace(log, [ 'openIDRequest' ])
    def _fetch(self, openIDRequest):
        """
            Fetch the data from request.
        """
        freq = FetchRequest.fromOpenIDRequest(openIDRequest)
        if freq is None:
            return None, None
        return freq, freq.getRequiredAttrs()

    @d.trace(log, [ 'name', 'member' ])
    def _getMemberData(self, name, member):
        """
            For the given name, return the value from the given member.
        """
        if name == 'email':
            data = member.email
        elif name == 'name':
            data = '' if member.fix().name is None else member.name
        elif name == 'firstname':
            data = '' if member.givenName is None else member.givenName
        elif name == 'lastname':
            data = '' if member.surname is None else member.surname
        elif name == 'suffix':
            data = '' if member.suffix is None else member.suffix
        elif name == 'prefix':
            data = '' if member.title is None else member.title
        elif name == 'friendly':
            data = '' if member.login is None else member.login
        elif name == 'gender':
            data = '' if member.gender is None else member.gender
        else:
            data = ''
        return data

    @d.trace(log, [ 'name', 'domain', 'request' ])
    def _getCookie(self, name, domain, request):
        """
            Get the cookie identified by name from request
            and re-construct the cookie.
        """
        cookies = request.cookies
        if not cookies.has_key(name):
            return None

        from cookielib import Cookie

        value = request.cookies[name]
        cookie = Cookie(version=0,
                        name=name,
                        value=value,
                        port=None,
                        port_specified=False,
                        domain=domain,
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
        return cookie

    @d.trace(log, [ 'request', 'query' ])
    def _handleCheckIDRequest(self, request, query):
        """
            Handle the check ID request.
        """
        openIDRequest = self.server.decodeRequest(query)
        log.info('OpenIDClient handleCheckID openIDRequest[%s]' % openIDRequest.__dict__)

        member = u.getCurrentUser(request, anonymousOkay=False)
        if member is None:
            #
            #  Redirect to login page.
            #
            uri = self._getURI(request)
            log.info('OpenIDClient handleCheckID uri[%s]' % uri)
            if uri:
                from urllib import quote

                uri = '/%s' % quote(uri)
            loginUrl = url(controller='extAuth', action='loginForm')
            redirect('%s%s' % (loginUrl, uri), 302)
        #
        #  Saved query into session.
        #
        session['query'] = query
        u.saveSession(request, str(member.id), member.email, 'ck-12')
        #
        #  Figure out domain information.
        #
        try:
            sourceUrl = query['openid.realm']
        except Exception:
            sourceUrl = query['openid.return_to']

        from urlparse import urlparse

        proto, netloc, path, params, query, frag = urlparse(sourceUrl)
        netlocList = netloc.split('.')
        if len(netlocList) < 3 or netlocList[-3] != '*':
            domain = netloc
        else:
            domain = '.'.join(netlocList[-2:])
        #
        #  See if the member has remembered the approval decision.
        #
        params = {}
        params['domain'] = domain
        approveUrl = url(controller='openIDServer',
                         action='getApproval',
                         qualified=True,
                         **params)
        cookieName = config.get('beaker.session.key')
        cookie = self._getCookie(cookieName, domain, request)
        status, resp = self._call(approveUrl, cookie=cookie, isJson=True)
        if status == ErrorCodes.OK:
            approve = resp['approve']
            #
            #  Directly go to the approve method based on the remembered
            #  decision.
            #
            params = {}
            params['domain'] = domain
            if approve == '1' or approve == 1:
                params['allow'] = 'Yes'
            redirectUrl = url(controller='openIDClient',
                              action='approve',
                              qualified=True,
                              **params)
            return redirect(redirectUrl)

        if openIDRequest.mode == 'checkid_immediate':
            c.status = ErrorCodes().getName(ErrorCodes.MEMBER_INTERACTION_NEEDED)
            c.message = 'Missing user interaction.'
            c.prefix = self.prefix
            return render('%s/common/error.html' % self.prefix)

        c.domain = domain
        #
        #  Account information.
        #
        c.account = member.email
        #
        #  List required attributes for member to approve.
        #
        c.items = []
        freq, requiredAttrs = self._fetch(openIDRequest)
        if freq is not None:
            for attr in requiredAttrs:
                if self.uriDict.has_key(attr):
                    name = self.uriDict[attr]
                    info = self.memberInfoDict[name]
                    data = self._getMemberData(name, member)
                    c.items.append('%s: %s' % (info[1], data))
            c.items = sorted(c.items)
        #
        #  URL to forward to after member approval or rejection.
        #
        c.approvalURL = url(controller='openIDClient',
                            action='approve',
                            qualified=True)
        #
        #  Show the approval page.
        #
        c.prefix = self.prefix
        return render('%s/authenticate/approval.html' % self.prefix)

    @d.trace(log)
    def approve(self):
        """
            Process the result of the member approval/rejection.
        """
        #
        #  Get query back from session.
        #
        query = session['query']
        log.info('OpenIDClient approve query[%s]' % query)

        openIDRequest = self.server.decodeRequest(query)

        allowed = 'allow' in request.params
        remember = 'remember' in request.params
        domain = request.params['domain']
        identity = url(controller='openIDClient',
                       action='authenticate',
                       qualified=True)
        openIDResponse = openIDRequest.answer(allowed,
                                              identity=identity)
        log.info('OpenIDClient approve openIDResponse[%s]' % openIDResponse)

        member = u.getCurrentUser(request, anonymousOkay=False)

        if remember:
            #
            #  Remember the approval/rejection decision.
            #
            try:
                params = {}
                params['domain'] = domain
                params['approve'] = 1 if allowed else 0
                approveUrl = url(controller='openIDServer',
                                action='rememberApproval',
                                qualified=True,
                                **params)
                cookieName = config.get('beaker.session.key')
                cookie = self._getCookie(cookieName, domain, request)
                self._call(approveUrl, cookie=cookie, isJson=True)
            except Exception, e:
                log.error('OpenIDClient approve unable to save decision, %s' % str(e))
                pass
        #
        #  Retrieve the member information.
        #
        freq, requiredAttrs = self._fetch(openIDRequest)
        if freq is not None:
            fres = FetchResponse(request=freq)
            for attr in requiredAttrs:
                if self.uriDict.has_key(attr):
                    name = self.uriDict[attr]
                    data = self._getMemberData(name, member)
                    fres.addValue(attr, data)
            openIDResponse.addExtension(fres)
        #
        #  Complete the construction of the response instance.
        #
        webResponse = self.server.encodeResponse(openIDResponse)
        response.status = webResponse.code
        log.info('OpenIDClient approve code[%s]' % response.status)
        for header, value in webResponse.headers.iteritems():
            log.info('OpenIDClient approve header[%s] value[%s] type[%s]' % (header, value, type(value).__name__))
            response.headers.add(header, str(value))
        response.body = webResponse.body
        log.info('OpenIDClient approve body[%s]' % response.body)
