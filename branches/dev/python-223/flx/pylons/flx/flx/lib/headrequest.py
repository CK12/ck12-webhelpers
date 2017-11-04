import urllib2
#from urlparse import urlparse
import urlparse

class HeadRequest(urllib2.Request):
    """
        Class that overloads an HTTP request to get just the HEAD and not the whole response.
    """
    def get_method(self):
        return 'HEAD'

class HeadRedirectHandler(urllib2.HTTPRedirectHandler):
    """
        This is only needed for python 2.6.
        HEAD request on chunked transfer encodings do not work if the URL returns a redirect
        Python bug: http://bugs.python.org/issue6312
        Already fixed in 2.6.6 and above. However, on lucid lynx 2.6.6 is not available
    """
    def http_error_302(self, req, fp, code, msg, headers):
        # Some servers (incorrectly) return multiple Location headers
        # (so probably same goes for URI).  Use first header.
        if 'location' in headers:
            newurl = headers.getheaders('location')[0]
        elif 'uri' in headers:
            newurl = headers.getheaders('uri')[0]
        else:
            return

        # fix a possible malformed URL
        urlparts = urlparse.urlparse(newurl)
        if not urlparts.path:
            urlparts = list(urlparts)
            urlparts[2] = "/"
        newurl = urlparse.urlunparse(urlparts)

        newurl = urlparse.urljoin(req.get_full_url(), newurl)

        # XXX Probably want to forget about the state of the current
        # request, although that might interact poorly with other
        # handlers that also use handler-specific request attributes
        new = self.redirect_request(req, fp, code, msg, headers, newurl)
        if new is None:
            return

        # loop detection
        # .redirect_dict has a key url if url was previously visited.
        if hasattr(req, 'redirect_dict'):
            visited = new.redirect_dict = req.redirect_dict
            if (visited.get(newurl, 0) >= self.max_repeats or
                len(visited) >= self.max_redirections):
                raise urllib2.HTTPError(req.get_full_url(), code,
                                self.inf_msg + msg, headers, fp)
        else:
            visited = new.redirect_dict = req.redirect_dict = {}
        visited[newurl] = visited.get(newurl, 0) + 1

        # Don't close the fp until we are sure that we won't use it
        # with HTTPError.
        if req.get_method() == 'HEAD':
            fp.close()
        else:
            fp.read()
            fp.close()

        return self.parent.open(new, timeout=req.timeout)

    http_error_301 = http_error_303 = http_error_307 = http_error_302



