import logging
import json
from datetime import datetime
from pylons.i18n.translation import _ 

from pylons import request, response, config, url, tmpl_context as c

import auth.controllers.user as u
from auth.controllers.errorCodes import ErrorCodes

from auth.lib import ads, helpers as h

log = logging.getLogger(__name__)

def getArgs(argNames, **kwargs):
    """
        Construct arguments based on the argument name list.
    """
    newKwargs = {}
    for argName in argNames:
        if kwargs.has_key(argName):
            newKwargs[argName] = kwargs[argName]
    return newKwargs

def decorator(decorator):
    """
        This decorator can be used to turn simple functions into
        well-behaved decorators, so long as the decorators are
        fairly simple. If a decorator expects a function and returns
        a function (no descriptors), and if it doesn't modify function
        attributes or docstring, then it is eligible to use this.
        Simply apply @decorator to your decorator and it will
        automatically preserve the docstring and function attributes
        of functions to which it is applied.
    """

    def newDecorator(f):
        g = decorator(f)
        g.__name__ = f.__name__
        g.__doc__ = f.__doc__
        g.__dict__.update(f.__dict__)
        return g
    #
    #  Now a few lines needed to make decorator itself
    #  be a well-behaved decorator.
    #
    newDecorator.__name__ = decorator.__name__
    newDecorator.__doc__ = decorator.__doc__
    newDecorator.__dict__.update(decorator.__dict__)
    return newDecorator

class trace(object):
    """
        Decorator to add entry and exit log for tracing purpose.Sample Use:
        It also shows the time spent in the given function.
    """

    def __init__(self, log, argNames=[]):
        self.log = log
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            name = func.__name__
            start = datetime.now()
            self.log.info('>>> Entering %s' % name)
            self.log.debug('>>>          %s' % kwargs)
            try:
                newKwargs = getArgs(self.argNames, **kwargs)
                return func(funcSelf, *args, **newKwargs)
            finally:
                ads.logExternalRequest(name, kwargs.get('member'))
                end = datetime.now()
                time = end - start
                self.log.info('<<< Exiting  %s, took %s' % (name, time))

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

class checkAuth(object):
    """
        Decorator to check if authentication has been done.

        If not, it returns AUTHENTICATION_REQUIRED error.
    """

    def __init__(self, request, redirectToLogin=False, toJsonifyError=False, argNames=[]):
        self.request = request
        self.redirectToLogin = redirectToLogin
        self.toJsonifyError = toJsonifyError
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            log.debug("checkAuth: Params: %s" % str(request.params))
            log.debug("checkAuth: Cookies: %s" % request.cookies)
            user = u.getCurrentUser(self.request, anonymousOkay=False, autoLogin=True)
            if user:
                c.user, user = u.getUserInfo(user, includePersonal=True)
            else:
                ## auto-login not successful - already tried as part of getCurrentUser
                globalRedirectToLogin = config.get('redirect_to_login')
                log.info("globalRedirectToLogin: %s" % str(globalRedirectToLogin))
                if globalRedirectToLogin == 'true' and self.redirectToLogin:
                    from pylons.controllers.util import redirect
                    #log.info("Vars: %s" % str(self.request.environ))
                    uri = ''
                    if self.request.environ.has_key('REQUEST_URI'):
                        uri = self.request.environ['REQUEST_URI']
                    elif self.request.environ.has_key('RAW_URI'):
                        uri = self.request.environ['RAW_URI']
                    elif self.request.environ.has_key('PATH_INFO'):
                        uri = self.request.environ['PATH_INFO'] 
                        if self.request.environ.has_key('QUERY_STRING'):
                            uri += '?' + self.request.environ['QUERY_STRING']
                    elif self.request.params.get('returnTo'):
                        uri = self.request.params.get('returnTo')

                    if uri:
                        from urllib import quote
                        uri = '/' + uri.lstrip('/')
                        uri = quote(uri)
                    loginUrl = url(controller='extAuth', action='loginForm', qualified=True, protocol='https') + '?returnTo=%s' % uri
                    return redirect(loginUrl)
                else:
                    log.info("checkAuth: Params: %s" % str(request.params))
                    log.info("checkAuth: Cookies: %s" % request.cookies)
                    errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                    result = ErrorCodes().asDict(errorCode,
                                                    'Authentication required')
                    return json.dumps(result) if self.toJsonifyError else result

            newKwargs = getArgs(self.argNames, **kwargs)
            newKwargs['member'] = user
            log.info(">>> %s" % newKwargs)
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

class setPage(object):
    """
        Decorator to get the page number and size from the request.

        PageNum is 1-origin. If pageSize is -1, there will be no pagination.
        If pageSize is omitted, it defaults to default_page_size 
    """

    def __init__(self, request, argNames=[]):
        self.request = request
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            newKwargs = getArgs(self.argNames, **kwargs)
            #
            #  Get page number, 1-origin.
            #
            if self.request.GET.has_key('pageNum'):
                pageNum = int(self.request.GET['pageNum'])
                if pageNum <= 0:
                    pageNum = 1
            else:
                pageNum = 1
            #
            #  Get page size.
            #
            if self.request.GET.has_key('pageSize'):
                pageSize = int(self.request.GET['pageSize'])
            else:
                pageSize = int(config.get('default_page_size', "10"))

            if pageSize <= 0:
                pageNum = 1

            log.info("Page size is %d. Getting page number %d" % (pageSize, pageNum))
            newKwargs['pageNum'] = pageNum
            newKwargs['pageSize'] = pageSize
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

class jsonify(object):
    """
        Decorator to create a response template and pass it to the decorated
        function. It then jsonifies this response template at the end.
    """

    def __init__(self, argNames=[]):
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            start = datetime.now()
            result = func(funcSelf, *args, **kwargs)
            return jsonifyResponse(result, start)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

def jsonifyResponse(result, start):
    end = datetime.now()
    cookies = None
    if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
        result['responseHeader']['time'] = str(end - start)
        result['responseHeader']['source'] = h.getHostname()
        if result.has_key('__cookies'):
            cookies = result.get('__cookies')
            del result['__cookies']
    ## Set header to application/json if the browser accepts it
    #if ('Accept' in request.headers and 'application/json' in request.headers['Accept']) or \
    #        request.params.get('format') == 'json':
    response.content_type = 'application/json; charset=utf-8'
    if cookies:
        for cookie in cookies:
            response.set_cookie(cookie['name'], cookie['value'], max_age=cookie.get('max_age'), path=cookie.get('path', '/'))
    return json.dumps(result, sort_keys=True, default=h.toJson)

class filterable(object):
    """
        Decorator to get the facet query filter parameter
    """

    def __init__(self, request, argNames=[], noformat=False):
        self.request = request
        self.argNames = argNames
        self.noformat = noformat

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            newKwargs = getArgs(self.argNames, **kwargs)
            #
            #  Get facet query
            #
            fq = False
            if self.request.GET.has_key('filters'):
                filters = self.request.GET['filters']
                if str(filters).lower() == 'false':
                    fq = False
                elif filters:
                    fq = []
                    log.info("Filters: %s" % filters)
                    parts = filters.split(";")
                    log.info("Parts: %s" % parts)
                    for part in parts:
                        pair = part.split(',')
                        if len(pair) != 2:
                            raise Exception((_(u'Incorrect number of parameters for filters. Could not get field and filter term.')).encode("utf-8"))
                        if self.noformat:
                            fq.append((pair[0], pair[1]))
                        else:
                            fq.append('%s:"%s"' % (pair[0], pair[1]))

            log.info("Facet queries: %s" % fq)
            newKwargs['fq'] = fq
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

class sortable(object):
    """
        Decorator to get the sort parameter for search query
    """

    def __init__(self, request, argNames=[]):
        self.request = request
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            newKwargs = getArgs(self.argNames, **kwargs)
            #
            #  Get sort parameter
            #
            newKwargs['sort'] = None
            if self.request.GET.has_key('sort'):
                sort = self.request.GET['sort']
                if sort:
                    log.info("Sorted by: %s" % sort)
                    newKwargs['sort'] = sort

            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

def cache_control(seconds=60*60):
    """
        Enable response to be cacheable by Squid. By default, the response
        is cached for one hour.
    """
    def _cache_controller(func):
        def _cache_controlled(*args, **kw):
            # Clear the default cache headers set by Pylons
            global response
            del response.headers['Cache-Control']
            del response.headers['Pragma']
            result = func(*args, **kw)
            # cache_expires() set HTTP response header Cache-Control ('public,max-age=<seconds>'),
            # Expires, and Last-Modified so is preferred over cache_control() which only set
            # Cache-Control. Last-Modified is really irrelevant as APIs are invoked by Pylons
            # app tier, not browsers.
            response.cache_expires(seconds=seconds)
            return result
        _cache_controlled.__name__ = func.__name__
        _cache_controlled.__doc__ = func.__doc__
        _cache_controlled.__dict__ = func.__dict__
        return _cache_controlled
    return _cache_controller

