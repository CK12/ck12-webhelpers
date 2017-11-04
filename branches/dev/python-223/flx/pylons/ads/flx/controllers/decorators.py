import logging
import json
from datetime import date, datetime, time
from decimal import Decimal
from urllib2 import build_opener
from pylons import request, response, config
from flx.controllers.errorCodes import ErrorCodes

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
            """
                Verify that the user has logged in to AUTH server by passing the cookie
                to AUTH server. The user's profile data is returned as `memberId` keyword
                parameter. If the user is not logged in, return `AUTHENTICATION_REQUIRED`.
            """
            log.info("Cookies: %s" % request.cookies)
            login_cookie = config.get('ck12_login_cookie')
            id = None
            if login_cookie and request.cookies and request.cookies.get(login_cookie):
                try:
                    opener = build_opener()
                    opener.addheaders.append(('Cookie', '%s=%s' % (login_cookie, request.cookies[login_cookie])))
                    prefix = config.get('ck12_login_prefix')
                    log.info("Verify cookie using AUTH: %s" % opener.addheaders)
                    data = opener.open('%s/get/info/my' % prefix, None, 30).read()
                    log.debug("AUTH response: %s" % data)
                    j = json.loads(data)
                    if j['responseHeader']['status'] == 0:
                        response = j['response']
                        id = response['id']
                        email = response['email']
                        log.debug('User verified: id=%s, email=%s' % (id, email))
                except Exception, e:
                    log.error('Failed to verify cookie using AUTH: %s' % str(e), exc_info=e)

            if not id:
                errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                result = ErrorCodes().asDict(errorCode, 'Authentication required')
                return json.dumps(result) if self.toJsonifyError else result

            newKwargs = getArgs(self.argNames, **kwargs)
            newKwargs['memberId'] = id
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

def toJson(pythonObject):
    if isinstance(pythonObject, datetime):
        return pythonObject.isoformat(' ')

    if isinstance(pythonObject, date):
        return pythonObject.isoformat()

    if isinstance(pythonObject, time):
        return pythonObject.isoformat()

    if isinstance(pythonObject, Decimal):
        return float(pythonObject)

    raise TypeError(repr(pythonObject) + ' is not JSON serializable')

def jsonifyResponse(result, start):
    end = datetime.now()
    if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
        result['responseHeader']['QTime'] = str(end - start)
    ## Set header to application/json if the browser accepts it
    if 'Accept' in request.headers and 'application/json' in request.headers['Accept']:
        response.content_type = 'application/json; charset=utf-8'
    return json.dumps(result, sort_keys=True, default=toJson)


