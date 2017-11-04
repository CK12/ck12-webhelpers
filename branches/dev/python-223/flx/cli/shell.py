"""
    The interactive shell for flx 2.0 APIs.
"""

import cmd
import os
import sys
import json
import Cookie
import httplib
import urllib
import urllib2

"""
    The command line shell.
"""
class Shell(cmd.Cmd):

    def __init__(self, server, port=80, prompt=None, verbose=False):
        """
            Constructor: Initialize the super class, prompt, http connection,
            etc.
        """
        cmd.Cmd.__init__(self)
        if prompt is None:
            self.prompt = 'flx> '
        else:
            self.prompt = prompt

        self.server = server
        self.port = port
        self.conn = httplib.HTTPConnection(self.server, self.port)
        self.cookies = {}
        self.status = ''
        self.last_output = ''
        self.verbose = verbose

    def _getCookies(self):
        cookies = ''
        keys = self.cookies.keys()
        for key in keys:
            if cookies != '':
                cookies += '; '
            cookies += '%s=%s' % (key, self.cookies[key])
        cookies += '; '
        print 'cookies[%s]' % cookies
        return cookies

    def _setCookies(self, cookie):
        if cookie is None or len(cookie) == 0:
            return

        pairs = cookie.split(';')
        for pair in pairs:
            pair = pair.strip()
            key, value = pair.split('=')
            self.cookies[key] = value
        print 'cookies[%s]' % self.cookies

    def _auth(self, cmd, params, headers=None):
        from cookielib import CookieJar

        cj = CookieJar()
        cookie = Cookie.SimpleCookie()
        s = cookie.output(header='', sep=';')
        if headers is None:
            headers = { 'Cookie': s }
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
        request = urllib2.Request('https://%s/auth/%s' % (self.server, cmd),
                                  urllib.urlencode(params),
                                  headers)
        r = opener.open(request)
        headers = r.headers
        cookie = headers.get('Set-Cookie')
        self._setCookies(cookie)
        self.status = 'OK'
        return r

    def _login(self, cmd, params):
        r = self._auth(cmd, params)
        self.last_output = r.read()
        return self.last_output

    def _httpRequest(self, method, command, params={}, headers=None, prefix='flx'):
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

        for n in range(0, 2):
            try:
                if prefix == 'auth':
                    r = self._auth(command, params, headers)
                else:
                    self.conn.request(method,
                                      '/%s/%s' % (prefix, command),
                                      urllib.urlencode(params),
                                      headers)
                    r = self.conn.getresponse()
                    cookie = r.getheader('Set-Cookie')
                    self._setCookies(cookie)
                    self.status = '%s %s' % (r.status, r.reason)
                print 'r[%s]' % r
                self.last_output = r.read()
                return self.last_output
            except Exception, e:
                print 'Exception[%s]' % e
                self.conn = httplib.HTTPConnection(self.server, self.port)

    def _httpGet(self, command, prefix='flx'):
        """
            Implement HTTP GET and remember the status and response.
        """
        return self._httpRequest('GET', command, prefix=prefix)

    def _httpPost(self, command, params={}, headers=None, prefix='flx'):
        """
            Implement HTTP GET and store the status and response.
        """
        return self._httpRequest('POST', command, params=params, headers=headers, prefix=prefix)

    def postloop(self):
        """
            Called before exiting the command loop.
        """
        self.conn.close()
        print ''

    def postcmd(self, stop, command):
        """
            Called after running each command.
        """
        show = not ( stop or
                     command.startswith('outfile ') or
                     command.startswith('show') or
                     command.startswith('shell ') )
        if show:
            print self.status
        if self.verbose and show:
            print self.last_output
        return cmd.Cmd.postcmd(self, stop, command)

    def help_cookie(self):
        print 'Show cookie'

    def do_cookie(self, line):
        print 'Cookie[%s]' % self.cookies

    def help_browse(self):
        print 'Browse command: browse [<ArtifactType>/]<browseTerm*>'
        print ''
        print '<ArtifactType> can be book, chapter, lesson, or concept.'

    def do_browse(self, line):
        self.last_output = self._httpGet('browse/%s' % line)

    def help_export(self):
        print 'Export command: export [<file>]'

    def do_export(self, line):
        file = line if len(line) > 0 else None
        self.last_output = self._httpGet('export/data')
        j = json.loads(self.last_output)
        if file is None:
            print json.dumps(j, sort_keys=True, indent=4)
        else:
            f = open(file, 'w')
            try:
                r = j['response']
                t = r['tables']
                json.dump(t, f, sort_keys=True, indent=4)
            except KeyError, e:
                print e
                print json.dumps(j, sort_keys=True, indent=4)
            finally:
                f.close()

    def help_exportSystem(self):
        print 'Export command: exportSystem [<file>]'

    def do_exportSystem(self, line):
        file = line if len(line) > 0 else None
        self.last_output = self._httpGet('export/data/system')
        j = json.loads(self.last_output)
        if file is None:
            print json.dumps(j, sort_keys=True, indent=4)
        else:
            f = open(file, 'w')
            try:
                r = j['response']
                t = r['tables']
                json.dump(t, f, sort_keys=True, indent=4)
            except KeyError, e:
                print e
                print json.dumps(j, sort_keys=True, indent=4)
            finally:
                f.close()

    def help_exportMembers(self):
        print 'Export command: exportMembers [<file>] <email>[,<email>[,...]]'

    def do_exportMembers(self, line):
        itemList = line.split(' ')
        if len(itemList) == 0:
            print 'file name and/or email list expected'
            return

        if len(itemList) == 1:
            file = None
            emails = ''.join(itemList)
        else:
            file = itemList[0]
            emails = ''.join(itemList[1:])
        self.last_output = self._httpGet('export/data/%s' % emails)
        j = json.loads(self.last_output)
        if file is None:
            print json.dumps(j, sort_keys=True, indent=4)
        else:
            f = open(file, 'w')
            try:
                r = j['response']
                t = r['tables']
                json.dump(t, f, sort_keys=True, indent=4)
            except KeyError, e:
                print e
                print json.dumps(j, sort_keys=True, indent=4)
            finally:
                f.close()

    def help_get(self):
        print 'Get command: get info/[<type>/]<ID>'
        print '             get info/[<type>/]<Title>'
        print '             get info/[<ArtifactType>/]standard/<state>/<standardStrandID>'
        print '             get info/[standard/]<ID>'
        print '             get info/[country/]<ID>'
        print '             get info/my'
        print '             get detail/[<type>/]<ID>'
        print '             get detail/[<type>/]<Title>'
        print '             get detail/[<ArtifactType>/]standard/<state>/<standardStrandID>'
        print '             get member/<login>'
        print '             get mylib/info/<ArtifactType>'
        print '             get errorCode/<errorCodeString>'
        print '             get version'
        print ''
        print '<ArtifactType> can be book, chapter, lesson, or concept.'
        print '<type> can be book, chapter, lesson, concept, or browseTerm.'

    def do_get(self, line):
        self.last_output = self._httpGet('get/%s' % line)

    def help_search(self):
        print 'Search command: search [<ArtifactType>/]<ArtifactSearchTerm>'
        print '                search [<DomainName>/]<ArtifactSearchTerm>'
        print ''
        print '<ArtifactType> can be book, chapter, lesson, or concept.'

    def do_search(self, line):
        self.last_output = self._httpGet('search/%s' % line)

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

    def help_create(self):
        print 'Create command: create <type>'
        print ''
        print '<type> can be book, chapter, lesson, topic, browseTerm, standard, or member.'
        print ''
        print 'Input format for book, chapter, lesson, or topic:'
        print "\tcontent location=<location of the content file>"
        print "\tauthorID=<login name of author>"
        print "\tchildren=[ '<chapter id>', ... ]"
        print "\tcover image name=<name of the cover image>"
        print "\tcover image description=<description of the cover image>"
        print "\tcover image path=<location of the cover image file>"
        print "\tcover image uri=<URI of the cover image>"
        print "\tsummary=<summary of the artifact>"
        print "\ttitle=<title of the artifact>"
        print ''
        print 'Input format for browseTerm:'
        print "\tname=<browse term name>"
        print "\ttypeID=<browse term type ID>"
        print "\tparentID=<browse term parent ID>"
        print ''
        print 'Input format for standard:'
        print "\tsection=<section>"
        print "\ttitle=<title>"
        print "\tdescription=<description>"
        print "\tgrades=<grade level list>"
        print "\tsubjectID=<subject ID>"
        print "\tstandardBoardID=<standard board ID>"
        print ''
        print 'Input format for member:'
        print "\tfirstName=<first name>"
        print "\tlastName=<last name>"
        print "\tgender=<gender>"
        print "\tlogin=<login>"
        print "\tmemberTypeID=<member type ID>"

    def do_create(self, line):
        createType = line
        params = {}
        if createType == 'book' or createType == 'chapter' or \
           createType == 'lesson' or createType == 'topic':
            file = raw_input('content location=')
            if len(file) > 0:
                params['xhtml'] = self._readFile(file)
            author = raw_input('author=')
            self._httpPost('get/member/%s' % author)
            memberDict = eval(self.last_output)
            authorID = memberDict['response']['id']
            params['authorID'] = authorID
            params['cover image path'] = raw_input('cover image path=')
            params['cover image uri'] = raw_input('cover image uri=')
            params['summary'] = raw_input('summary=')
            params['title'] = raw_input('title=')
            params['children'] = raw_input('children=')
        elif createType == 'browseTerm':
            params['name'] = raw_input('name=')
            params['typeID'] = raw_input('typeID=')
            params['parentID'] = raw_input('parentID=')
        elif createType == 'standard':
            params['section'] = raw_input('section=')
            params['title'] = raw_input('title=')
            params['description'] = raw_input('description=')
            params['grades'] = raw_input('grades=')
            params['subjectID'] = raw_input('subjectID=')
            params['standardBoardID'] = raw_input('standardBoardID=')
        elif createType == 'member':
            params['givenName'] = raw_input('firstName=')
            params['surname'] = raw_input('lastName=')
            params['gender'] = raw_input('gender=')
            params['login'] = raw_input('login=')
            params['type'] = raw_input('memberTypeID=')
        else:
            print 'Unknown type: %s' % createType
            return
        self._httpPost('create/%s' % createType, params=params)

    def help_update(self):
        print 'Update command: update [<ArtifactType>/]<ArtifactID>'
        print '                update [<ArtifactType>/]<Title>'
        print ''
        print '<ArtifactType> can be book, chapter, lesson, or topic.'
        print ''
        print 'Input format (skip if just type enter):'
        print "\tcontent location=<location of the content file>"
        print "\tauthorID=<name of author>"
        print "\tchildren=[ '<chapter id>', ... ]"
        print "\tsummary=<summary of the artifact>"
        print "\ttitle=<title of the artifact>"

    def do_update(self, line):
        """
            Get data from the user.
        """
        params = {}
        file = raw_input('content location=')
        if len(file) > 0:
            params['xhtml'] = self._readFile(file)
        children = raw_input('children=')
        if len(children) > 0:
            params['children'] = children
        summary = raw_input('summary=')
        if len(summary) > 0:
            params['summary'] = summary
        title = raw_input('title=')
        if len(title) > 0:
            params['title'] = title
        self._httpPost('update/%s' % line, params=params)

    def help_delete(self):
        print 'Delete command: delete [<ArtifactType>/]<ArtifactID>'
        print '                delete [<ArtifactType>/]<Title>'
        print ''
        print '<ArtifactType> can be book, chapter, lesson, or concept.'

    def do_delete(self, line):
        """
        if line is not None and len(line) > 0:
            l = line.split('/')
            artifactType = l[0]
            id = l[1]
        else:
            artifactType = raw_input('type=')
            id = getpass.getpass('id=')
        params = {}
        if artifactType is not None and len(artifactType) > 0:
            params['type'] = artifactType
        params['id'] = id
        self._httpPost('delete/%s/%s' % (artifactType, id), params=params)
        """
        self._httpPost('delete/%s' % line)

    def help_publish(self):
        print 'Delete command: publish <ArtifactID>'
        print '                publish revision/<RevisionID>'

    def do_publish(self, line):
        self._httpGet('publish/%s' % line)

    def help_upload(self):
        print 'Upload command: upload students/<prefix>'

    def do_upload(self, line):
        print 'line[%s]' % line
        rows = []
        while True:
            row = raw_input('student:')
            if len(row) == 0:
                break
            rows.append(row)
        params = {}
        params['data'] = json.dumps({ 'students': rows })
        self._httpPost('upload/%s' % line, params=params, prefix='auth')

    def help_login(self):
        print 'Login command: login [name/password]'
        print ''
        print 'If name and password not given, it will prompt for input.'

    def do_login(self, line):
        if line is not None and len(line) > 0:
            l = line.split('/')
            login = l[0]
            password = l[1]
        else:
            import getpass

            login = raw_input('login=')
            password = getpass.getpass('password=')
        params = { 'login' : login, 'token' : password, 'authType': 'ck-12' }
        self._login('login/member', params=params)

    def help_logout(self):
        print 'Logout command: logout'

    def do_logout(self, line):
        self._httpGet('logout/member')

    def help_shell(self):
        print 'Run a shell command'

    def do_shell(self, line):
        self.last_output = os.popen(line).read()
        print self.last_output

    def help_showp(self):
        self.help_showpretty()

    def help_showpretty(self):
        print "Show the last output in pretty-formatted JSON."

    def help_show(self):
        print 'Show the last output. Useful when --verbose is off.'

    def do_show(self, line):
        print self.last_output

    def do_showp(self, line):
        self.do_showpretty(line)

    def do_showpretty(self, line):
        try:
            j = json.loads(self.last_output)
            print json.dumps(j, indent=4)
        except Exception, e:
            print "Not a valid json: [%s]" % str(e)
            self.do_show(line)

    def help_outfile(self):
        print 'Output the last output to the given file.'

    def do_outfile(self, line):
        f = open(line, 'w')
        f.write(self.last_output)
        f.close()

    def help_exit(self):
        print 'Exit the shell.'

    def do_exit(self, line):
        return True

    def help_EOF(self):
        self.help_exit()

    def do_EOF(self, line):
        return self.do_exit(line)

def usage():
    print 'Usage:'
    print '\t%s: --help --server=<server name> --port=<port number> --prompt=<prompt> --verbose [command]' % sys.argv[0]

def main(argv):                         
    """
        Process command line arguments.
    """
    try:                                
        import getopt

        opts, args = getopt.getopt(argv, "hp:s:t:v", ['help', 'port=', 'server=', 'prompt=', 'verbose'])
    except getopt.GetoptError:
        usage()
        sys.exit(2) 

    server = 'localhost'
    port = '80'
    prompt = None
    verbose = False
    for opt, arg in opts:
        if opt == '--server':
            server = arg
        elif opt == '--port':
            port = arg
        elif opt == '--prompt':
            prompt = arg
        elif opt == '--help':
            usage()
        elif opt == '--verbose':
            verbose = True

    """
        Run the command shell.
    """
    print 'server[%s]' % server
    shell = Shell(server, port=port, prompt=prompt, verbose=verbose)
    if args is None or len(args) == 0:
        shell.cmdloop()
    else:
        cmd = ''
        for item in args:
            cmd += ' ' + item
        shell.onecmd(cmd)
        print shell.status
        print shell.last_output

if __name__ == "__main__":
    main(sys.argv[1:])
