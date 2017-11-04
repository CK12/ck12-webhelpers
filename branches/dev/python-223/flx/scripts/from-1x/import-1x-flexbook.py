import httplib
import json
import sys
import threading
import time
import urllib
import urllib2

from Queue import Empty, Queue
from subprocess import Popen, PIPE

class Conn(object):

    def __init__(self, server, concur=1, port=80, verbose=False, out=sys.stdout):
        """
            Constructor: Initialize the super class, prompt, http connection,
            etc.
        """
        self.server = server
        self.port = port
        self.conn = httplib.HTTPConnection(self.server, self.port)
        self.cookies = {}
        self.status = ''
        self.last_output = ''
        self.verbose = verbose
        self.out = out

    def _getCookies(self):
        cookies = ''
        keys = self.cookies.keys()
        for key in keys:
            if cookies != '':
                cookies += '; '
            cookies += '%s=%s' % (key, self.cookies[key])
        cookies += '; '
        return cookies

    def _setCookies(self, cookie):
        if cookie is None or len(cookie) == 0:
            return

        pairs = cookie.split(';')
        for pair in pairs:
            pair = pair.strip()
            key, value = pair.split('=')
            self.cookies[key] = value

    def _httpRequest(self, method, command, params={}, headers=None):
        """
            Implement HTTP request and remember the status and response.
        """
        if headers is None:
            headers = {
                        'Content-type': 'application/x-www-form-urlencoded',
                        'Accept': 'text/html,application/xhtml+xml,application/xml,application/json,application/zip',
                        'Connection': 'keep-alive',
                        'Keep-Alive': 180,
                      }
        """
        if len(self.cookies) > 0:
            headers['Cookie'] = self._getCookies()
        """
        headers['Cookie'] = self._getCookies()

        for n in range(0, 2):
            try:
                self.conn.request(method,
                                  '/flx/%s' % command,
                                  urllib.urlencode(params),
                                  headers)
                r = self.conn.getresponse()
                cookie = r.getheader('Set-Cookie')
                self._setCookies(cookie)
                self.status = '%s %s' % (r.status, r.reason)
                self.last_output = r.read()
                return self.last_output
            except Exception:
                self.conn = httplib.HTTPConnection(self.server, self.port)

    def _httpGet(self, command):
        """
            Implement HTTP GET and remember the status and response.
        """
        return self._httpRequest('GET', command)

    def _httpPost(self, command, params={}, headers=None):
        """
            Implement HTTP GET and store the status and response.
        """
        return self._httpRequest('POST', command, params, headers)

    def _readFile(self, path):
        try:
            f = open(path, 'r')
        except Exception, e:
            print 'Cannot open file %s for contents: %s' % (file, str(e))
            return None
        try:
            contents = f.read()
        except Exception, e:
            print 'Cannot read file %s for contents: %s' % (file, str(e))
            f.close()
            return None
        return contents

    def login(self, login, password):
        from cookielib import CookieJar
        from Cookie import SimpleCookie

        cj = CookieJar()
        cookie = SimpleCookie()
        s = cookie.output(header='', sep=';')
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
        params = {
            'login' : login,
            'token' : password,
            'authType': 'ck-12'
        }
        request = urllib2.Request('https://%s/auth/login/member' % self.server,
                                  urllib.urlencode(params),
                                  { 'Cookie': s })
        print 'request[%s]' % request.__dict__
        r = opener.open(request)
        headers = r.headers
        cookie = headers.get('Set-Cookie')
        self._setCookies(cookie)
        self.status = 'OK'
        self.last_output = r.read()
        return self.last_output

    def logout(self):
        self._httpGet('logout/member')

    def log(self, id, message):
        from datetime import datetime

        now = datetime.now()
        self.out.write('%s  T%d: %s\n' % (str(now), id, message))

    def getMembers(self, memberID=None, id=-1, includeFailed=False, startingID=0, idList=[]):
        start = time.time()
        if memberID:
            pipe = Popen(['curl', '--cookie', '%s' % self._getCookies(), 'http://%s/flx/get/member/has/1x/books/%s' % (host, memberID)], stdout=PIPE, stderr=PIPE)
        else:
            pipe = Popen(['curl', '--cookie', '%s' % self._getCookies(), 'http://%s/flx/get/members/have/1x/books?pageSize=0' % host], stdout=PIPE, stderr=PIPE)
        result, err = pipe.communicate()
        #
        #  Get the task ID and wait.
        #
        status = 'success'
        startingID = long(startingID)
        try:
            queue = Queue()
            j = json.loads(result)
            r = j['response']
            if not r.has_key('result'):
                self.log(id, 'response[%s]' % r)
                return queue

            members = r['result']
            if memberID:
                members = [ members ]
            elif len(idList) > 0:
                idDict = {}
                for i in idList:
                    idDict[long(i)] = True
                memberList = []
                for member in members:
                    if idDict.has_key(long(member['memberID'])):
                        memberList.append(member)
                members = memberList
            for member in members:
                status = member.get('status')
                qualified = status == 'Not Started'
                if includeFailed:
                    failed = status == 'Failed'
                else:
                    failed = False
                id = long(member['memberID'])
                if (failed or qualified) and id > startingID:
                    queue.put(id)
            return queue
        except Exception, e:
            self.log(id, 'Exception[%s] type[%s] result[%s] not json' % (e, type(result), result))
            return 0
        finally:
            end = time.time()
            self.log(id, 'Members Ends(%s). Took %s seconds.' % (status, (end - start)))

    def waitForImportBook(self, taskID, id=-1):
        result = ''
        count = 0
        try:
            #
            #  Check the task status every 5 seconds until it is
            #  not 'IN PROGRESS' nor 'PENDING'.
            #
            status = 'success'
            while True:
                count += 1
                result = self._httpGet('get/status/task/%s' % taskID)
                j = json.loads(result)
                r = j['response']
                status = r['status'].lower()
                if (count % 100) == 0:
                    self.log(id, 'taskID[%s] status[%s]' % (taskID, status))
                if status != 'in progress' and status != 'pending':
                    break
                time.sleep(5)
            return status, r['userdata']
        except Exception, e:
            self.log(id, 'Exception[%s] result[%s]' % (e, result))
            return 'failure'

    def importBooks(self, memberID, id=-1):
        self.log(id, 'Importing flexbooks for member[%s]' % memberID)
        pipe = Popen(['curl', '--cookie', '%s' % self._getCookies(), 'http://%s/flx/import/1x/books/%s' % (host, memberID)], stdout=PIPE, stderr=PIPE)
        result, err = pipe.communicate()
        #
        #  Get the task ID and wait.
        #
        status = 'success'
        userdata = ''
        try:
            j = json.loads(result)
            r = j['response']
            if not r.has_key('result'):
                self.log(id, 'response[%s]' % r)
            else:
                taskID = r['result']['taskID']
                self.log(id, 'taskID[%s]' % taskID)
                status, userdata = self.waitForImportBook(taskID, id=id)
            return 1
        except Exception, e:
            self.log(id, 'Exception[%s] type[%s] result[%s] not json' % (e, type(result), result))
            return 0
        finally:
            end = time.time()
            self.log(id, '%s Ends(%s:%s). Took %s seconds.' % (memberID, status, userdata, (end - start)))

class ImportFlexbookThread(threading.Thread):

    def __init__(self, id, queue, conn):
        threading.Thread.__init__(self)
        self.id = id
        self.queue = queue
        self.conn = conn
        self.count = 0

    def run(self):
        while True:
            try:
                count = 0
                #
                #  Process the next email.
                #
                memberID = self.queue.get_nowait()
                try:
                    #
                    #  Import all the books belong to this email.
                    #
                    count = conn.importBooks(memberID, id=self.id)
                except Exception, ex:
                    conn.log(self.id, 'Exception[%s]' % ex)
                finally:
                    #
                    #  Signals to queue job is done
                    #
                    self.queue.task_done()
                    self.count += count
            except Empty:
                conn.log(self.id, 'Processed %d books.' % self.count)
                return

if __name__ == "__main__":
    def setupArgs():
        from optparse import OptionParser

        id = None
        ids = None

        parser = OptionParser(description='Import 1.x flexbooks')
        parser.add_option('--host', dest='host', type=str, help='Host name')
        parser.add_option('--login', dest='login', type=str, help='Login name')
        parser.add_option('--password', dest='password', type=str, help='password')
        parser.add_option('--include-failed', dest='includeFailed', action='store_true', default=False, help='Include previously failed migration? (defaults to False)')
        parser.add_option('--starting-id', dest='startingID', default='0', help='The starting id of the member')
        parser.add_option('--id', dest='id', default=id, help='The id of the member whose books is to be migrated')
        parser.add_option('--ids', dest='ids', default=ids, help='The list of the member ids whose books are to be migrated, comma separated')
        parser.add_option('--concur', dest='concur', type=int, default=1, help='Number of concurrent imports (defaults to 1)')
        return parser

    parser = setupArgs()
    (options, args) = parser.parse_args()

    if not options.host:
        raise Exception('host name required')
    host = options.host
    print 'host[%s]' % host

    if options.login:
        login = options.login
    else:
        login = 'admin'

    if options.password:
        password = options.password
    else:
        password = 'notck12'

    includeFailed = options.includeFailed
    if options.startingID:
        startingID = options.startingID
    else:
        startingID = 0

    if options.id:
        memberID = options.id
    else:
        memberID = None

    if options.ids:
        idList = options.ids.split(',')
    else:
        idList = []

    if not options.concur:
        options.concur = 1
    concur = options.concur
    print 'concur[%d]' % concur

    #
    #  Initialize connection and login.
    #
    start = time.time()
    conn = Conn(host, concur=concur)
    print 'Before login: cookie[%s]' % conn.cookies
    conn.login(login, password)
    print 'After login;  cookie[%s]' % conn.cookies
    #
    #  Start the threads for importing.
    #
    try:
        queue = conn.getMembers(memberID=memberID, includeFailed=includeFailed, startingID=startingID, idList=idList)
        for n in range(concur):
            t = ImportFlexbookThread(n, queue, conn)
            t.start()

        queue.join()
    finally:
        conn.logout()
    end = time.time()
    print 'Processed queue in %s seconds.' % (end - start)
