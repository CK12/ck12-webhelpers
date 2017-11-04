from __future__ import print_function

import json
import os
import sys

from datetime import datetime, timedelta

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
from flx.model import api

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
                self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_TLSv1)
            except ssl.SSLError, tlsv1:
                try:
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv3)
                except ssl.SSLError, sslv3:
                    self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv23)

from urllib2 import HTTPSHandler 

class HTTPSHandlerV3(HTTPSHandler):
    def https_open(self, req):
        return self.do_open(HTTPSConnectionV3, req)

class StudyGuideImagesUpload:

    def __init__(self, url):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.config = h.load_pylons_config()

    def urlencode(self, params):
        out = {}
        for k, v in params.iteritems():
            if isinstance(v, unicode):
                v = v.encode('utf8')
            elif isinstance(v, str):
                v.decode('utf8')
            out[k] = v

        from urllib import urlencode as ue
        return ue(out)

    def _call(self, durl, timeout=30, method='GET', params=None, fromReq=False, external=False):
        """
            Make call to the api
        """
        import urllib2
        from urllib2 import build_opener

        durl = durl.encode('utf-8')
        print("Calling remote url[%s]" % durl)
        #cj = CookieJar()
        #self._restoreCookiesFromSession(cj, fromReq=fromReq)
        #opener = build_opener(HTTPSHandlerV3(), HTTPCookieProcessor(cj))
        opener = build_opener(HTTPSHandlerV3())
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
                postBody = self.urlencode(params)
                print('_call: durl[%s] postBody[%s]' % (durl, postBody))
            else:
                if '?' in durl:
                    durl += '&%s' % self.urlencode(params)
                else:
                    durl += '?%s' % self.urlencode(params)
                print('_call: durl[%s]' % durl)

        try:
            if method == 'POST':
                data = opener.open(durl, postBody, timeout).read()
            else:
                data = opener.open(durl, None, timeout).read()
        except urllib2.HTTPError, he:
            print('_call: HTTPError[%s]' % str(he))
            raise he
        except urllib2.URLError, ue:
            print('_call: URLError[%s]' % str(ue))
            raise urllib2.URLError((_(u'Network or provider down.')).encode("utf-8"))
        except Exception, e:
            print('_call: Exception[%s]' % str(e))
            raise e

        end_time = datetime.today()
        # Make sure we are getting a "response" field in the API response
        if not "response" in data:
            raise Exception((_(u'response field missing in API response')).encode("utf-8"))
        #self._storeCookiesToSession(cj)
        delta = end_time - start_time
        print("[%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , durl))

        if data.startswith('"'):
            data = data[1:-1]
            data = data.replace('\\"', '"')
            print('_call: data[%s]' % data)

        r = json.loads(data)
        print('_call: r[%s]' % r)
        if external:
            return r

        if isinstance(r, list):
            r = r[0]

        if isinstance(r, dict):
            resp = r['response']
        else:
            resp = r
        return r['responseHeader']['status'], resp

    def upload(self, verbose, csvFileName):
        self.session.begin()
        with open(csvFileName, 'r') as f:
            import csv

            for row in csv.reader(f, delimiter=',', skipinitialspace=True):
                aid, rid, png = row
                print('aid[%s] png[%s]' % (aid, png))
                createCoverURL = "%s/flx/create/customCover" % self.config.get('flx_prefix_url')
                params = {
                    'bookArtifactID': aid,
                    'bookTitle': rid,
                    'coverImageUri': 'http://hints.ck12.org/study-guide-images/%s' % png,
                }
                status, resp = self._call(createCoverURL, method='POST', params=params)
                print('status[%s] resp[%s]' % (status, resp))
                break
        self.session.rollback()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    csv = '/tmp/study-guide-images.csv'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-c', '--csv', dest='csv', default=csv,
        help='The csv file having artifact and image file assocation. Defaults to "/tmp/study-guide-images.csv".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=False,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    csv = options.csv
    verbose = options.verbose

    print('Upload study guide images from %s' % csv)

    c = StudyGuideImagesUpload(url)
    c.upload(verbose, csvFileName=csv)
