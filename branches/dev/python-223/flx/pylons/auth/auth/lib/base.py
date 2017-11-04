"""The base Controller API

Provides the BaseController class for subclassing.
"""
from pylons import config, request, response, tmpl_context as c
from pylons import app_globals as g
from pylons.controllers import WSGIController
from pylons.i18n.translation import _, add_fallback, set_lang
#
#  The following render is needed even though it's not used in this file.
#
from pylons.templating import render_jinja2 as render

from auth.model import meta
from auth.controllers import decorators as d
from auth.lib import helpers as h

import logging
from datetime import datetime

log = logging.getLogger(__name__)

SORTABLE_COLUMNS = {
        'Artifacts': [ 'creationTime', 'updateTime', 'name', 'creatorID', ],
        'MemberLibraryArtifactRevisions': [ 'creationTime', 'updateTime', 'name', 'creatorID', 'added' ],
        'MemberLibraryResourceRevisions': [ 'creationTime', 'name', 'ownerID', 'added', 'latest', ],
    }

class BaseController(WSGIController):
    prefix = '/%s' % config.get('instance')

    def __before__(self):
        c.now = datetime.now()
        try:
            c.member = None
            import auth.controllers.user as u
            user = u.getCurrentUser(request, anonymousOkay=False, autoLogin=False)
            if user:
                c.member = user
                c.user = user
        except Exception, e:
            log.error("Exception getting user: %s" % str(e))
            c.member = None

    def __after__(self):
        ## Set CORS and Cache headers for all API calls.
        h.setCORSAndCacheHeaders(request, response)
        h.setSEOHeaders(response)

    def __call__(self, environ, start_response):
        """Invoke the Controller"""
        # WSGIController.__call__ dispatches to the Controller method
        # the request is routed to. This routing information is
        # available in environ['pylons.routes_dict']
        self.setLanguage()
        try:
            return WSGIController.__call__(self, environ, start_response)
        finally:
            meta.Session.remove()

    def getFuncName(self):
        import inspect
        return inspect.stack()[1][3]

    def getResponseTemplate(self, status, time):
        return {
                'responseHeader':{'status':status, 'time':time},
                'response':{},
               }

    def getSortOrder(self, sort, modelName):
        """
            Get sort order prescription from request parameters
            Format is: fld1,order1;fld2,order2 ...
        """
        if not sort or sort.lower() == 'none':
            return None
        if sort == 'latest':
            sort = [('updateTime', 'desc'), ('creationTime', 'desc')]
        else:
            sortParts = sort.split(';')
            sort = []
            for s in sortParts:
                order = 'asc'
                if s.endswith(',desc'):
                    order = 'desc'
                sortFld = s.split(",", 1)[0]
                if sortFld in SORTABLE_COLUMNS[modelName]:
                    sort.append((sortFld, order))
                else:
                    raise Exception((_(u'Invalid sort field: %(sortFld)s')  % {"sortFld":sortFld}).encode("utf-8"))
        log.info('Sort order: %s' % sort)
        return sort

    def setLanguage(self):

	accept_languages= str(request.accept_language)

	if accept_languages:
            accept_languages=accept_languages.replace(',',';')
            acceptlanguagesList= accept_languages.split(';')
            languagesList=[]
            supportedLanguages=g.languagesSupported		
            for language in range(len(acceptlanguagesList)):
                acceptlanguagesList[language]=acceptlanguagesList[language].strip().split('-')
                if acceptlanguagesList[language][0].find('=')==-1 and acceptlanguagesList[language][0] not in languagesList and acceptlanguagesList[language][0] in supportedLanguages:
                    languagesList.append(acceptlanguagesList[language][0])
            if len(languagesList)>0:
                for lang in range(1, len(languagesList)):
                    add_fallback(languagesList[lang])
                set_lang(languagesList[0])
	else:
            set_lang('en')	

    @d.trace(log, ['cj', 'fromReq'])
    def _restoreCookiesFromSession(self, cj, fromReq=False):
        """
            Copy cookies from session to the request for remote server
        """
        from pylons import session

        log.debug('_restoreCookiesFromSession: session[%s]' % session)
        key = config.get('beaker.session.key')
        if 'cookies' in session:
            for cookie in session['cookies']:
                if cookie.name == key:
                    cj.set_cookie(cookie)
                    log.debug("Copied cookie: %s" % cookie.name)

        from pylons import response
        from cookielib import Cookie

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
        from pylons import session

        if not "cookies" in session:
            session['cookies'] = []

        key = config.get('beaker.session.key')
        # read all the cookies API response and add them to the session.
        for index, cookie in enumerate(cj):
            if cookie.name == key:
                session['cookies'].append(cookie)
                log.debug("Saved cookie: %s" % cookie.name)
        session.save()

    def _call(self, durl, timeout=30, method='GET', params=None, fromReq=False, external=False):
        """
            Make call to the api
        """
        import json
        import urllib2
        from cookielib import CookieJar
        from urllib2 import build_opener, HTTPCookieProcessor

        import auth.lib.helpers as h

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
                log.debug('_call: durl[%s] postBody[%s]' % (durl, postBody))
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
        except Exception:
            try:
                log.debug("Using TLSv1.")
                self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1)
            except ssl.SSLError:
                try:
                    log.warn("Using SSLv3. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv3)
                except ssl.SSLError:
                    log.warn("Using SSLv23. This is unsafe.")
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv23)

from urllib2 import HTTPSHandler 

class HTTPSHandlerV3(HTTPSHandler):
    def https_open(self, req):
        return self.do_open(HTTPSConnectionV3, req)
