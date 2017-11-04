import logging
import json
from datetime import datetime
from pylons.i18n.translation import _

from pylons import request, response, config, tmpl_context as c

import flx.controllers.user as u
from flx.controllers.errorCodes import ErrorCodes

import flx.lib.helpers as h
from flx.lib import ads
from flx.model import exceptions

log = logging.getLogger(__name__)
slowlog = logging.getLogger('slowapi')

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
            mod = func.__module__
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
                if time.seconds > int(config.get('slowapi_threshold_secs', 3)):
                    slowlog.warn("[%s.%ss] %s:%s" % ( (time.days*3600 + time.seconds), time.microseconds/1000, mod, name ) )

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

class addCORSHeaders(object):
    """
        Adds CORS related headers to the call that comes through a CDN
    """
    def __init__(self, req, res):
        self.request = req
        self.response = res
        #self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            #newKwargs = getArgs(self.argNames, **kwargs)
            # uncomment this if we want to enable any random domain
            if self.request.method == 'OPTIONS':
                # we want to return just the headers and not the complete response
                log.debug("OPTIONS call, returning only headers and no response")
                output = ""
            else:
                output = func(funcSelf, *args, **kwargs)
            h.setCORSAndCacheHeaders(self.request, self.response)
            log.info("Response headers: [%s]" % str(self.response.headers))
            return output

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

def setCacheControlHeaders(request, response):
    cacheAgeMap = {
        "nocache" : 0,
        "quarter-hourly" : 60 * 15,
        "half-hourly" : 60 * 30,
        "hourly" : 3600,
        "daily" : 3600 * 24,
        "weekly" : 3600 * 24 * 7,
        "biweekly" : 3600 * 24 * 14,
        "monthly" : 3600 * 24 * 30,
        "yearly" : 3600 * 24 * 365
    }
    cacheAge = cacheAgeMap["nocache"]

    if 'expirationAge' in request.params:
        expirationAge = request.params.get('expirationAge')

        if request.method == 'OPTIONS':
            expirationAge = "monthly"
        if expirationAge in cacheAgeMap:
            cacheAge = cacheAgeMap[expirationAge]
        else:
            #this should not happen, error in the request
            pass

    ## Removing existing Cache-Control header, if present
    for header in ['Cache-Control', 'Pragma']:
        if header in response.headers:
            del response.headers[header]
    response.cache_expires(seconds=cacheAge)
    log.debug("Response headers: [%s]" % str(response.headers))



class checkAuth(object):
    """
        Decorator to check if authentication has been done.

        If not, it returns AUTHENTICATION_REQUIRED error.
    """

    def __init__(self, request=request, redirectToLogin=False, toJsonifyError=False, argNames=[], throwbackException=False, verifyPartnerLogin=False):
        self.request = request
        self.redirectToLogin = redirectToLogin
        self.toJsonifyError = toJsonifyError
        self.argNames = argNames
        self.throwbackException = throwbackException
        self.verifyPartnerLogin = verifyPartnerLogin

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            log.debug('checkAuth: Params[%s]' % str(self.request.params))
            log.debug('checkAuth: Cookies[%s]' % self.request.cookies)

            if self.verifyPartnerLogin:
                if 'partnerAppName' not in self.argNames:
                    raise exceptions.SystemImplementationException(u"partnerAppName, a mandatory argument for the APIs to have verifyPartnerLogin turned on could not be found in the current service implemntation.".encode('utf-8'))

                partnerAppName = kwargs.get('partnerAppName')
                if not partnerAppName or not isinstance(partnerAppName, basestring):
                    raise exceptions.InvalidArgumentException(u"Invalid partnerAppName : [{partnerAppName}] is received. partnerAppName is mandatory.".format(partnerAppName=partnerAppName).encode('utf-8'))
            else:
                partnerAppName = None

            try:
                user = u.getCurrentUser(self.request, anonymousOkay=False, autoLogin=True, throwbackException = self.throwbackException, verifyPartnerLogin=self.verifyPartnerLogin, partnerAppName=partnerAppName)
            except (exceptions.InvalidArgumentException, exceptions.ResourceNotFoundException, exceptions.SystemDataException, exceptions.UnauthorizedException) as e:
                if self.throwbackException is True:
                    raise e
                else:
                    logging.exception(e)
                    user=None
            except Exception, e:
                if self.throwbackException is True:
                    raise exceptions.AuthenticationRequiredException(u"User needs to be logged in (authenticated) to perform the requested operation but an error with errorMessage : [{errorMessage}] has occured while trying to authenticate the user.".format(errorMessage=str(e)).encode('utf-8'))
                else:
                    logging.exception(e)
                    user = None

            if user is not None:
                c.user, user = u.getUserInfo(user, includePersonal=True)
                log.debug('checkAuth: c.user[%s]' % c.user)
                #
                #  To keep track of user's activeness but don't want to update the
                #  database too often, we use a cookie, flx-active-session, that expires
                #  in 1 day. If the cookie doesn't exist for the logged in user, we
                #  will update the auth.Members.loginTime and create this cookie to
                #  eliminate additional database access on behave of this user for
                #  the next 24 hours.
                #
                activeCookieName = 'flx-active-session'
                activeCookie = self.request.cookies.get(activeCookieName)
                if not activeCookie:
                    #
                    #  Update the auth.Members.loginTime.
                    #
                    from urllib2 import build_opener

                    try:
                        loginCookieName = config.get('ck12_login_cookie')
                        loginCookie = self.request.cookies.get(loginCookieName)
                        opener = build_opener()
                        opener.addheaders.append(('Cookie', '%s=%s' % (loginCookieName, loginCookie)))
                        prefix = config.get('flx_auth_api_server')
                        url = '%s/update/member/login/time/%d' % (prefix, user.id)
                        data = opener.open(url, None, 1).read()
                        log.debug('checkAuth: data[%s]' % data)
                    except Exception, e:
                        #
                        #  Stop and try again the next day (after the cookie expires).
                        #
                        log.debug('checkAuth: e[%s]' % e)
                        pass
                    #
                    #  Create the cookie.
                    #
                    now = str(datetime.now()).replace(' ', '.')
                    log.debug('checkAuth: create activeCookie[%s %s]' % (user.id, now))
                    response.set_cookie(activeCookieName, '%s;%s' % (user.id, now), max_age=24*60*60)
            else:
                ## auto-login not successful - already tried as part of getCurrentUser
                if not user:
                    globalRedirectToLogin = config.get('redirect_to_login')
                    log.debug('checkAuth: globalRedirectToLogin[%s]' % str(globalRedirectToLogin))
                    if globalRedirectToLogin == 'true' and self.redirectToLogin:
                        from pylons.controllers.util import redirect
                        #log.debug("Vars: %s" % str(self.request.environ))
                        uri = ''
                        if self.request.environ.has_key('REQUEST_URI'):
                            uri = self.request.environ['REQUEST_URI']
                        elif self.request.environ.has_key('RAW_URI'):
                            uri = self.request.environ['RAW_URI']
                        elif self.request.environ.has_key('PATH_INFO'):
                            uri = self.request.environ['PATH_INFO']
                            if self.request.environ.has_key('QUERY_STRING'):
                                uri += '?' + self.request.environ['QUERY_STRING']

                        if uri:
                            from urllib import quote
                            uri = '/' + uri.lstrip('/')
                            uri = quote(uri)
                        prefix = config.get('flx_auth_api_server')
                        loginUrl = '%s/signin?returnTo=%s' % (prefix, uri)
                        return redirect(loginUrl)
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
            log.debug(">>> %s" % newKwargs)
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
                try:
                    pageNum = int(self.request.GET['pageNum'])
                except ValueError:
                    pageNum = 1
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
                except ValueError:
                    pageSize = int(config.get('default_page_size', "10"))
            else:
                pageSize = int(config.get('default_page_size', "10"))

            if pageSize <= 0:
                pageNum = 1

            log.debug("Page size is %d. Getting page number %d" % (pageSize, pageNum))
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
    try:
        end = datetime.now()
        if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
            result['responseHeader']['time'] = str(end - start)
            result['responseHeader']['source'] = h.getHostname()
        ## Set header to application/json if the browser accepts it
        #if ('Accept' in request.headers and 'application/json' in request.headers['Accept']) or \
        #        request.params.get('format') == 'json':
        #    response.content_type = 'application/json; charset=utf-8'
        response.content_type = 'application/json; charset=utf-8'
        return json.dumps(result, sort_keys=True, default=h.toJson)
    except Exception, e:
        log.error("Error in jsonifyResponse: [%s]" % str(e), exc_info=e)
        raise e

class filterable(object):
    """
        Decorator to get the facet query filter parameter
    """

    def __init__(self, request, argNames=[], noformat=False, toJsonifyError=False):
        self.request = request
        self.argNames = argNames
        self.noformat = noformat
        self.toJsonifyError = toJsonifyError

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
                    log.debug("Filters: %s" % filters)
                    parts = filters.split(";")
                    log.debug("Parts: %s" % parts)
                    for part in parts:
                        try:
                            if part:
                                pair = part.split(',')
                                if len(pair) != 2:
                                    raise Exception((_(u'Incorrect number of parameters for filters. Could not get field and filter term.')).encode("utf-8"))
                                if self.noformat:
                                    fq.append((pair[0], pair[1]))
                                else:
                                    fq.append('%s:"%s"' % (pair[0], pair[1]))
                        except Exception, e:
                            errorCode = ErrorCodes.INVALID_ARGUMENT
                            result = ErrorCodes().asDict(errorCode, str(e))
                            return json.dumps(result) if self.toJsonifyError else result
            log.debug("Facet queries: %s" % fq)
            newKwargs['fq'] = fq
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator


class filterableSearch(object):
    """
        Decorator to get the facet query filter parameter
        same field are always OR'd and different fields are AND'd in results.
        eg : filters=gradeLevels.ext,8;gradeLevels.ext,9;subjects.ext,algebra;subjects.ext,mathematics
        will return list - [u'gradeLevels.ext:("8" OR "9")' AND u'subjects.ext:("algebra" OR "mathematics")']
    """

    def __init__(self, request, argNames=[], concate_similar_terms_with="OR", concate_different_terms_with="AND", toJsonifyError=False):
        self.request = request
        self.argNames = argNames
        self.toJsonifyError = toJsonifyError
        self.concate_similar_terms_with = concate_similar_terms_with
        self.concate_different_terms_with = concate_different_terms_with

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
                elif str(filters).lower() == 'true':
                    fq = True
                elif filters:
                    fq = []
                    log.debug("Filters: %s" % filters)
                    parts = filters.split(";")
                    log.debug("Parts: %s" % parts)
                    for part in parts:
                        try:
                            if part:
                                pair = part.split(',')
                                if len(pair) != 2:
                                    raise Exception((_(u'Incorrect number of parameters for filters. Could not get field and filter term.')).encode("utf-8"))
                                fq.append((pair[0], pair[1]))
                        except Exception, e:
                            errorCode = ErrorCodes.INVALID_ARGUMENT
                            result = ErrorCodes().asDict(errorCode, str(e))
                            return json.dumps(result) if self.toJsonifyError else result
                    if fq:
                        filter_dict = {}
                        for filter_fld, _filter in fq:
                            if filter_fld and _filter:
                                if not filter_dict.has_key(filter_fld):
                                    filter_dict[filter_fld] = []
                                filter_dict[filter_fld].append(_filter)

                        new_fq = []
                        if filter_dict:
                            for filter_fld in filter_dict.keys():
                                _filter = filter_dict[filter_fld]
                                temp_filters = ""
                                for fil in _filter:
                                    if not temp_filters and len(_filter) > 1:
                                        temp_filters += '('
                                    elif len(_filter) > 1:
                                        temp_filters += ' %s ' % (self.concate_similar_terms_with)
                                    temp_filters += '"%s"' % fil
                                if len(_filter) > 1:
                                    temp_filters += ')'
                                temp_filters = '%s:%s' %(filter_fld, temp_filters)
                                new_fq.append(temp_filters)
                        if new_fq and len(new_fq) > 0 :
                            fq = [(" %s " %(self.concate_different_terms_with)).join(new_fq) ]
            log.debug("Facet queries: %s" % fq)
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
                    log.debug("Sorted by: %s" % sort)
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
                        return func(*args, **kwargs)
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
            if kwargs:
                try:
                    cache_key += " ".join(map(str, kwargs.items()))
                except UnicodeEncodeError:
                    cache_key = " ".join(map(unicode, kwargs.items()))
            if region:
                key_length = cache_regions[region]['key_length']
            else:
                key_length =  250
            log.debug("cache_key: %s, type: %s" % (cache_key, type(cache_key).__name__))
            if len(cache_key) + len(namespace) > key_length:
                cache_key = sha1(h.safe_encode(cache_key)).hexdigest()
            def go():
                return func(*args, **kwargs)

            invalidation_key = None
            if 'invalidation_key' in deco_kwargs:
                invalidation_key = deco_kwargs['invalidation_key']
            if 'nocache' in request.params\
                and ( (not invalidation_key) or \
                ('key' in request.params and invalidation_key == request.params.get('key') )):
                    log.debug("ck12_cache_region: Invalidating cached: %s" % func)
                    data = go()
                    cache[0].set_value(cache_key,data)
                    return data
            else:
                log.debug("ck12_cache_region: Cache hit!: %s" % func)
                return cache[0].get_value(cache_key, createfunc=go)
        cached._arg_namespace = namespace
        if region is not None:
            cached._arg_region = region
        return cached
    return decorate
