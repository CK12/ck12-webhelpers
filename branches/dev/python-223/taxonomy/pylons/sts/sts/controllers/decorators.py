import logging
import json
from datetime import datetime
from urllib import quote

from pylons import request, response, config, url, tmpl_context as c

import sts.controllers.user as u
from sts.controllers.errorCodes import ErrorCodes
import sts.lib.helpers as h
from sts.model import exceptions

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

    def __init__(self, request=request, redirectToLogin=False, toJsonifyError=False, argNames=[], throwbackException=False):
        self.request = request
        self.redirectToLogin = redirectToLogin
        self.toJsonifyError = toJsonifyError
        self.argNames = argNames
        self.throwbackException = throwbackException

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            log.debug('checkAuth: Params[%s]' % str(self.request.params))
            log.debug('checkAuth: Cookies[%s]' % self.request.cookies)
            
            try:
                user = u.getCurrentUser(self.request, anonymousOkay=False, autoLogin=True, throwbackException = self.throwbackException)
            except (exceptions.InvalidArgumentException, exceptions.ResourceNotFoundException, exceptions.SystemDataException, exceptions.UnauthorizedException) as e:
                if self.throwbackException is True:
                    raise e
                else:
                    logging.exception(e)
                    user = None       
            except Exception, e:
                if self.throwbackException is True:
                    raise exceptions.AuthenticationRequiredException(u"User needs to be logged in (authenticated) to perform the requested operation but an error with errorMessage : [{errorMessage}] has occured while trying to authenticate the user.".format(errorMessage=str(e)).encode('utf-8'))
                else:
                    logging.exception(e)
                    user = None

            ## Must be debug to protect PII
            log.debug("User: %s" % user)
            if user is None:
                globalRedirectToLogin = config.get('redirect_to_login')
                log.debug('checkAuth: globalRedirectToLogin[%s]' % str(globalRedirectToLogin))
                if globalRedirectToLogin == 'true' and self.redirectToLogin:
                    from pylons.controllers.util import redirect
                    uri = ''
                    log.info("Env: %s" % str(self.request.environ))
                    if self.request.environ.has_key('REQUEST_URI'):
                        uri = self.request.environ['REQUEST_URI']
                    elif self.request.environ.has_key('RAW_URI'):
                        uri = self.request.environ['RAW_URI']
                    elif self.request.environ.has_key('PATH_INFO'):
                        uri = self.request.environ['PATH_INFO'] 
                        if self.request.environ.has_key('QUERY_STRING'):
                            uri += '?' + self.request.environ['QUERY_STRING']

                    if uri:
                        uri = '/' + uri.lstrip('/')
                        uri = quote(uri)
                    redirectTo = url(controller='oAuthClient', action='login', qualified=True) + '?returnTo=%s' % uri
                    log.info("Redirecting to: %s" % redirectTo)
                    redirect(redirectTo, 302)
                    return
                else:
                    if self.throwbackException is True:
                        raise exceptions.AuthenticationRequiredException(u"User needs to be logged in (authenticated) to perform the requested operation but an unKnownError has occured while trying to authenticate the user.".encode('utf-8'))
                    else:
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

        PageNum is 1-origin. If pageSize is 0, there will be no pagination.
    """

    def __init__(self, argNames=[]):
        self.request = request
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            newKwargs = getArgs(self.argNames, **kwargs)
            #
            #  Get page number, 1-origin.
            #
            if self.request.GET.has_key('pageNum'):
                try:
                    pageNum = int(self.request.GET['pageNum'])
                except:
                    errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
                    result = ErrorCodes().asDict(errorCode, 'Incorrect value provided for pageNum')
                    return result

                if pageNum <= 0:
                    pageNum = 1
            else:
                pageNum = 1
            #
            #  Get page size.
            #
            if self.request.GET.has_key('pageSize'):
                try:
                    pageSize = int(self.request.GET['pageSize'])
                except:
                    errorCode = ErrorCodes.NO_SUCH_CONCEPT_NODE
                    result = ErrorCodes().asDict(errorCode, 'Incorrect value provided for pageSize')
                    return result

            else:
                pageSize = 10

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
    if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
        result['responseHeader']['QTime'] = str(end - start)
        result['responseHeader']['source'] = h.getHostname()
    ## Set header to application/json if the browser accepts it
    ## if 'Accept' in request.headers.keys() and 'application/json' in request.headers['Accept'] or \
    ##    request.params.get('format') == 'json':
    response.content_type = 'application/json; charset=utf-8'
    return json.dumps(result, sort_keys=True)

def ck12_cache_region(region,*deco_args,**deco_kwargs):
    """
    Modified version of the beaker cache_region decorator.
    We add a support for nocache parameter which will fetch
    the latest data and replace it in the cache.
    Return a caching function decorator.
    """
    import beaker.util as util
    from beaker.exceptions import BeakerException
    from beaker.cache import cache_regions,Cache
    from beaker.crypto.util import sha1
    cache = [None]

    def decorate(func):
        namespace = util.func_namespace(func)
        skip_self = util.has_self_arg(func)
        def cached(*args, **kwargs):
            if not cache[0]:
                if region is not None:
                    if region not in cache_regions:
                        raise BeakerException(
                            'Cache region not configured: %s' % region)
                    reg = cache_regions[region]
                    if not reg.get('enabled', True):
                        return func(*args)
                    cache[0] = Cache._get_cache(namespace, reg)
                else:
                    raise Exception("'manager + kwargs' or 'region' "
                                    "argument is required")

            if skip_self:
                try:
                    cache_key = " ".join(map(str, deco_args + args[1:]))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args[1:]))
            else:
                try:
                    cache_key = " ".join(map(str, deco_args + args))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, deco_args + args))
            if region:
                key_length = cache_regions[region]['key_length']
            else:
                key_length =  250
            if len(cache_key) + len(namespace) > key_length:
                cache_key = sha1(cache_key).hexdigest()
            def go():
                return func(*args)

            invalidation_key = None
            if 'invalidation_key' in deco_kwargs:
                invalidation_key = deco_kwargs['invalidation_key']
            if 'nocache' in request.params\
                and ( (not invalidation_key) or \
                ('key' in request.params and invalidation_key == request.params.get('key') )):
                    log.info("ck12_cache_region: Invalidating cached: %s" % func)
                    data = go()
                    cache[0].set_value(cache_key,data)
                    return data
            else:
                log.info("ck12_cache_region: Cache hit!: %s" % func)
                return cache[0].get_value(cache_key, createfunc=go)
        cached._arg_namespace = namespace
        if region is not None:
            cached._arg_region = region
        return cached
    return decorate

