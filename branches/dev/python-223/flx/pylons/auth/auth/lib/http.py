import logging
import json
from cookielib import Cookie, CookieJar
from pylons.i18n.translation import _ 
from urllib import urlencode
from datetime import datetime

from pylons import config, request, session

log = logging.getLogger(__name__)

class Http:

    timeout = 0
    fromReq = False
    external = True
    headers = None

    def __init__(self, timeout=30, fromReq=False, external=True, headers=None):
        self.timeout = timeout
        self.fromReq = fromReq
        self.external = external
        self.headers = headers

    def _restoreCookiesFromSession(self, cj):
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
        if self.fromReq:
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

    def call(self, durl, method='GET', params=None, usePostBody=True, useCookies=True):
        """
            Make call to the api
        """
        start_time = datetime.today()

        durl = durl.encode('utf-8')
        log.debug("call: url[%s]" % durl)
        log.debug("call: params%s" % params)
        cj = CookieJar()
        if useCookies:
            self._restoreCookiesFromSession(cj)
        if True:
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
            if self.headers:
                headers.update(self.headers)
            log.debug("call: headers%s" % headers)

            try:
                import requests

                certPath = config.get('ca_cert_path')
                if method == 'POST':
                    if usePostBody:
                        if params:
                            params = json.dumps(params)
                    else:
                        if params:
                            try:
                                params = urlencode(params)
                            except Exception:
                                pass
                            if '?' in durl:
                                durl = '%s&%s' % (durl, params)
                            else:
                                durl = '%s?%s' % (durl, params)
                            log.debug('call: durl[%s]' % durl)
                            params = None
                    r = requests.post(durl, data=params, headers=headers, cookies=cj, timeout=self.timeout, allow_redirects=False, verify=certPath)
                elif method == 'GET':
                    r = requests.get(durl, params=params, headers=headers, cookies=cj, timeout=self.timeout, allow_redirects=False, verify=certPath)
                elif method == 'DELETE':
                    r = requests.delete(durl, data=params, headers=headers, cookies=cj, timeout=self.timeout, allow_redirects=False, verify=certPath)
                elif method == 'PUT':
                    r = requests.put(durl, params=params, headers=headers, cookies=cj, timeout=self.timeout, allow_redirects=False, verify=certPath)
                else:
                    raise Exception((_(u'Unknown method: %s' % method)).encode("utf-8"))
                log.debug('call: status[%s]' % r.status_code)
                log.debug("call: r.url[%s]" % r.url)
                log.debug("call: r.headers[%s]" % r.headers)
                log.debug("call: r.encoding[%s]" % r.encoding)
                data = r.text
                log.debug("call: data[%s]" % data)
            except Exception, e:
                log.warn('_call: Exception[%s]' % str(e))
                raise e
        else:
            import urllib2
            from urllib2 import build_opener, HTTPCookieProcessor

            opener = build_opener(HTTPCookieProcessor(cj))
            opener.addheaders = [
                ('Accept', 'application/json, */*; q=0.01'),
                ('Content-Type', 'application/json; charset=UTF-8'),
            ]
            if self.headers:
                opener.addheaders.extend(self.headers)

            postBody = None
            if params:
                if method == 'POST':
                    try:
                        postBody = urlencode(params)
                    except Exception:
                        postBody = params
                else:
                    if '?' in durl:
                        durl += '&%s' % urlencode(params)
                    else:
                        durl += '?%s' % urlencode(params)

            try:
                if method == 'POST':
                    data = opener.open(durl, postBody, self.timeout).read()
                else:
                    data = opener.open(durl, None, self.timeout).read()
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
        if not self.external and not "response" in data:
            raise Exception((_(u'response field missing in API response')).encode("utf-8"))
        if useCookies:
            self._storeCookiesToSession(cj)
        delta = end_time - start_time
        log.debug("_call: [%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , durl))
        try:
            r = json.loads(data)
        except Exception:
            r = data
        log.info('_call: r[%s]' % r)
        if self.external:
            return r

        return r['responseHeader']['status'], r['response']
