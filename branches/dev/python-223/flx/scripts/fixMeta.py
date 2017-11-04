from __future__ import print_function

import hashlib
import httplib
import json
import logging
import re
import sys
import zlib

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model, init_model, getSQLAlchemyEngines
from flx.model.vcs import vcs as v
from flx.controllers.common import ArtifactCache
from sqlalchemy import desc

log = logging.getLogger(__name__)

encoding = 'utf-8'

class FixMeta:

    def __init__(self, url, verbose):
        config = h.load_pylons_config()
        if meta.engine is None:
            engines = getSQLAlchemyEngines(config)
            init_model(engines)
        self.session = meta.Session()
        self.verbose = verbose
        self.cookies = None
        self.initCache(config)
        h.initTranslator()

    def initCache(self, config):
        keys = config.keys()
        cacheDict = {}
        for key in keys:
            if key.startswith('beaker.'):
                cacheDict[key] = config[key]

        from beaker.cache import CacheManager
        from beaker.util import parse_cache_config_options

        self.cache = CacheManager(**parse_cache_config_options(cacheDict))

    def _getCookies(self):
        cookies = ''
        keys = self.cookies.keys()
        for key in keys:
            if cookies != '':
                cookies += '; '
            cookies += '%s=%s' % (key, self.cookies[key])
        cookies += '; '
        if self.verbose:
            print('cookies[%s]' % cookies)
        return cookies

    def _setCookies(self, cookie):
        if cookie is None or len(cookie) == 0:
            return

        pairs = cookie.split(';')
        for pair in pairs:
            pair = pair.strip()
            key, value = pair.split('=')
            if not self.cookies:
                self.cookies = {}
            self.cookies[key] = value
        if self.verbose:
            print('cookies[%s]' % self.cookies)

    def _httpRequest(self, server, port, method, command, params={}, headers=None):
        """
            Implement HTTP request and remember the status and response.
        """
        if headers is None:
            headers = {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Accept': 'text/html,application/xhtml+xml,application/xml/,application/json',
                        'Connection': 'keep-alive',
                        'Keep-Alive': 115,
                      }
        if self.cookies is not None:
            headers['Cookie'] = self._getCookies()

        conn = httplib.HTTPConnection(server, port)
        for n in range(0, 2):
            try:
                import urllib

                conn.request(method,
                             command,
                             urllib.urlencode(params),
                             headers)
                r = conn.getresponse()
                cookie = r.getheader('Set-Cookie')
                self._setCookies(cookie)
                status = '%s %s' % (r.status, r.reason)
                result = r.read()
                return status, result
            except Exception, e:
                print('Exception[%s]' % e)
                conn = httplib.HTTPConnection(server, port)

    def _httpGet(self, server, port, command, params={}):
        """
            Implement HTTP GET and remember the status and response.
        """
        return self._httpRequest(server, port, 'GET', command, params)

    def getArtifactDict(self, d):
        """
           Support the following types.
        """
        a = d.get('book')
        if not a:
            a = d.get('chapter')
        if not a:
            a = d.get('lesson')
        if not a:
            a = d.get('concept')
        if not a:
            a = d.get('section')
        return a

    def processRevision(self, revision, server, port, vcs, cache):
        #
        #  Process content.
        #
        file = revision.get('file')
        if file:
            if self.verbose:
                print(' file[%s]' % file, end='')
            content = vcs.get(file)
            if content:
                revNo = vcs.getRevision(file)
                #
                #  Fix:
                #
                #   If '@@credits=' exists, change '@@author=' to '@@x-author=' and '@@credits=' to '@@author='.
                #   If '@@source=' exists, change '@@url=' to '@@x-url=' and '@@source=' to '@@url='.
                #
                changed = False
                if content.find('@@credits=') > 0:
                    content = content.replace('@@author=', '@@x-author=')
                    content = content.replace('@@credits=', '@@author=')
                    changed = True
                if content.find('@@source=') > 0:
                    content = content.replace('@@url=', '@@x-url=')
                    content = content.replace('@@source=', '@@url=')
                    changed = True
                if changed:
                    vcs.update(file, revNo=revNo, contents=content)
                    id = revision['artifactID']
                    revID = revision['artifactRevisionID']
                    cache.invalidate(id)
                    cache.invalidate(id, revID)
                    if self.verbose:
                        print(' fixed.', end='')
                    else:
                        print('Fixed artifact id[%s] revID[%s] perma[/%s/%s]' % (id, revID, revision['artifactType'], revision['handle']))
        if self.verbose:
            print('')
        #
        #  Recursively process children.
        #
        children = revision.get('children')
        for child in children:
            if type(child) == int or type(child) == long:
                command = '/flx/get/detail/revision/%d' % child
                status, result = self._httpGet(server, port, command)
                response = json.loads(result)['response']
                child = self.getArtifactDict(response)

            revision = child['revisions'][0]
            if self.verbose:
                print('Processing ', end='')
                print('id[%s] revID[%s] ' % (child['artifactID'], child['artifactRevisionID']), end='')
                print('perma[%s]' % child['perma'], end='')
            self.processRevision(revision, server, port, vcs, cache)

    def process(self, perma, dryRun=False):
        #
        #  Get the artifac info from perma.
        #
        from urlparse import urlparse

        o = urlparse(perma)
        server = o.hostname
        if o.port:
            port = o.port
        else:
            if o.scheme == 'https':
                port = 443
            else:
                port = 80
        command = o.path
        if o.query:
            command += '?' + o.query
        status, result = self._httpGet(server, port, command, o.params)
        response = json.loads(result)['response']
        a = self.getArtifactDict(response)
        revision = a['revisions'][0]
        creatorID = a['creatorID']
        #
        #  Start processing.
        #
        if self.verbose:
            print('Processing ', end='')
            print('id[%s] revID[%s] ' % (a['artifactID'], a['artifactRevisionID']), end='')
            print('perma[%s]' % a['perma'], end='')
        self.session.begin()
        vcs = v.vcs(creatorID)
        cache = ArtifactCache()
        self.processRevision(revision, server, port, vcs, cache)
        self.session.commit()
        if self.verbose:
            print('Done with perma[%s]' % a['perma'])


if __name__ == "__main__":
    import optparse

    class OptionParser(optparse.OptionParser):

        def format_description(self, formatter):
            return self.description


    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    permas = None

    parser = OptionParser('%prog [options]', description=
"""Fix Image Metadata:
- @@credits -> @@author
- @@source -> @@url

When @@credits is found in a content, we first replace @@author, if any, with @@x-author before changing @@credits to @@author.
When @@source is found in a content, we first replace @@url, if any, with @@x-url before changing @@source to @@url.

Example:
    python -u fixMeta.py --permas=http://www.ck12.org/flx/get/perma/book/CK-12-Physics-Concepts---Intermediate/user%3AY2sxMnNjaWVuY2VAY2sxMi5vcmc.
""")
    parser.add_option(
        '-d', '--database', dest='url', default=url, action='store',
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-p', '--permas', dest='permas', default=permas, action='store',
        help='The perma URLs of the artifacts and their children that need to be fixed, separated by comma, ",". The URL form is "http://<host>:<port>/flx/get/perma/<perma>/user:<user>".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    permas = options.permas
    verbose = options.verbose

    fix = FixMeta(url, verbose)
    #
    #  Process one perma at a time.
    #
    for perma in permas.split(','):
        fix.process(perma, verbose)
