import logging
import json
from cookielib import Cookie, CookieJar
from urllib2 import build_opener, HTTPCookieProcessor
import urllib
from datetime import datetime

from pylons import config, request, session, url, tmpl_context as c
from pylons.controllers.util import redirect
from sts.controllers import decorators as d
from sts.controllers.errorCodes import ErrorCodes
from sts.lib.base import BaseController, render
import sts.controllers.user as u
import sts.lib.helpers as h

log = logging.getLogger(__name__)

__controller__ = 'ExtAuthController'
class ExtAuthController(BaseController):

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
        if fromReq:
            log.debug("_restoreCookiesFromSession: cookies[%s]" % request.cookies)
            for name in request.cookies.keys():
                value = request.cookies[name]
                cookie = Cookie(version=0,
                                name=name,
                                value=value,
                                port=None,
                                port_specified=False,
                                domain=config.get('beaker.session.cookie_domain'),
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

    @d.trace(log, ['durl', 'timeout', 'method', 'params', 'fromReq'])
    def _call(self, durl, timeout=30, method='GET', params=None, fromReq=False):
        """
            Make call to the api
        """
        durl = durl.encode('utf-8')
        log.debug("Calling remote url[%s]" % durl)
        cj = CookieJar()
        self._restoreCookiesFromSession(cj, fromReq=fromReq)
        opener = build_opener(HTTPCookieProcessor(cj))
        start_time = datetime.today()

        postBody = None
        if params:
            if method == 'POST':
                postBody = urllib.urlencode(params)
            else:
                durl += '?%s' % urllib.urlencode(params)

        if method == 'POST':
            data = opener.open(durl, postBody, timeout).read()
        else:
            data = opener.open(durl, None, timeout).read()

        end_time = datetime.today()
        # Make sure we are getting a "response" field in the API response
        if not "response" in data:
            raise Exception((u'response field missing in API response').encode("utf-8"))
        self._storeCookiesToSession(cj)
        delta = end_time - start_time
        log.debug("[%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , durl))
        r = json.loads(data)
        return r['responseHeader']['status'], r['response']

    @d.trace(log)
    def _test(self, site):
        """
            Test the login action.
        """
        c.url = url(controller=site, action='authenticated', qualified=True)
        c.prefix = self.prefix
        return render('%s/authenticate/%s.html' % (self.prefix, site))

    @d.trace(log)
    def _getAuthenticatedURL(self, site):
        """
            Return the URL of the authenticated action for the given site.
        """
        return url(controller=site, action='authenticated', qualified=True)
