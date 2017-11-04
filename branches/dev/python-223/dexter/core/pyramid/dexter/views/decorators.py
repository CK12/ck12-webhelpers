from decorator import decorator as python_decorator
from bson.objectid import ObjectId
import json
from urllib2 import build_opener
from datetime import date, datetime, time
from pyramid.response import Response
from pyramid import response, request
import logging

from urllib import quote
from dexter.lib import helpers as h
from dexter.views.errorCodes import ErrorCodes
from dexter.models import exceptions

log = logging.getLogger(__name__)

@python_decorator
def jsonify(func, *args, **kwargs):
    start = datetime.now()
    result = func(*args, **kwargs)
    if isinstance(result, Response):
        return result
    return jsonifyResponse(result, start)

def toJson(pythonObject):
    if isinstance(pythonObject, datetime):
        return pythonObject.isoformat(' ')

    if isinstance(pythonObject, date):
        return pythonObject.isoformat()

    if isinstance(pythonObject, time):
        return pythonObject.isoformat()

    if isinstance(pythonObject, ObjectId):
        return pythonObject.__str__()
    raise TypeError(repr(pythonObject) + ' is not JSON serializable')

def jsonifyResponse(result, start):
    end = datetime.now()
    if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
        result['responseHeader']['QTime'] = str(end - start)
    response =  Response(json.dumps(result, sort_keys=True, default=toJson))
    response.headerlist.extend(
            (
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
                ('Access-Control-Allow-Credentials', 'true'),
            )
            )

    response.content_type = 'application/json; charset=utf-8'
    log.info('response headers: [%s]' %(response.headers))
    return response

def getArgs(argNames, **kwargs):
    """
        Construct arguments based on the argument name list.
    """
    newKwargs = {}
    for argName in argNames:
        if kwargs.has_key(argName):
            newKwargs[argName] = kwargs[argName]
    return newKwargs

def paginate(request):
    #
    #  Get page number, 1-origin.
    #
    if request.GET.has_key('pageNum'):
        pageNum = int(request.GET['pageNum'])
        if pageNum <= 0:
            pageNum = 1
    else:
        pageNum = 1
    #
    #  Get page size.
    #
    if request.GET.has_key('pageSize'):
        pageSize = int(request.GET['pageSize'])
    else:
        log.info("Default page size: %s" % request.registry.settings.get('default_page_size'))
        pageSize = int(request.registry.settings.get('default_page_size', "10"))

    if pageSize <= 0:
        pageNum = 1

    log.info("Page size is %d. Getting page number %d" % (pageSize, pageNum))
    return pageNum, pageSize

from dexter.views import user as u
def autoLogin(request):
    user = None
    config = request.registry.settings
    login_cookie = config.get('ck12_login_cookie')
    if login_cookie and request.cookies and request.cookies.get(login_cookie):
        try:
            ## Make login call
            opener = build_opener()
            opener.addheaders.append(('Cookie', '%s=%s' % (login_cookie, request.cookies[login_cookie])))
            prefix = config.get('ck12_auth_prefix')
            log.info("Trying auto login: %s" % opener.addheaders)
            data = opener.open('%s/get/info/my' % prefix, None, 30).read()
            log.debug("Auto login response: %s" % data)
            j = None
            try:
                j = json.loads(data)
            except Exception as je:
                log.warn("Cannot autoLogin: %s" % str(je))
            if j and j['responseHeader']['status'] == 0:
                resp = j['response']
                if not resp.get('authType'):
                    resp['authType'] = 'ck-12'
                u.saveSession(request, resp, authCookie=request.cookies[login_cookie])
                user = u.getCurrentUser(request, anonymousOkay=False, tryAutoLogin=False)
                log.info('autoLogin c.user[%s]' % user)
            else:
                user = None
        except Exception, e:
            log.error('Failed to login automatically to auth: %s' % h.safe_encode(unicode(e)), exc_info=e)
            user = None
    return user

class checkAuth(object):
    """
        Decorator to check if authentication has been done.

        If not, it returns AUTHENTICATION_REQUIRED error.
    """

    def __init__(self, redirectToLogin=False, toJsonifyError=False, checkAdmin=False, viewName=None, argNames=[], 
                throwbackException=False):
        #self.request = request
        self.redirectToLogin = redirectToLogin
        self.toJsonifyError = toJsonifyError
        self.checkAdmin = checkAdmin
        self.viewName = viewName
        self.argNames = argNames
        self.throwbackException = throwbackException

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            self.request = funcSelf.request
            #log.info("Request:%s" %self.request)
            log.info("args:%s" % str(args))
            log.info("kwargs:%s" % str(kwargs))
            log.info("Req:%s" % funcSelf.request)
            #log.debug('checkAuth: Params[%s]' % str(self.request.params))
            #log.debug('checkAuth: Cookies[%s]' % self.request.cookies)
            user = u.getCurrentUser(self.request, anonymousOkay=False)
            log.info('checkAuth: c.user[%s]' % user)
            # User not present.
            if user is None:
                if self.redirectToLogin:
                    url = self.request.route_url(self.viewName)
                    login_url = h.get_signin_url(return_to=url)
                    #login_url = login_url.replace('chaplin', 'tesla')
                    return Response(status_int=302, location=login_url)
                else:
                    if self.throwbackException is True:
                        raise exceptions.AuthenticationRequiredException(u"User needs to be logged in (authenticated) to perform the requested operation.".encode('utf-8'))
                    else:
                        errorCode = ErrorCodes.AUTHENTICATION_REQUIRED
                        result = ErrorCodes().asDict(errorCode, 'Authentication required')
                        return Response(json.dumps(result)) if self.toJsonifyError else result
            # User available                
            if self.checkAdmin:
                isAdmin = u.isMemberAdmin(self.request, user)
                if not isAdmin:
                    if self.throwbackException is True:
                        raise exceptions.UnauthorizedException(u"User needs to be Admin to perform the requested operation.".encode('utf-8'))
                    else:
                        errorCode = ErrorCodes.UNAUTHORIZED_OPERATION
                        result = ErrorCodes().asDict(errorCode, 'Admin access required')
                        return Response(json.dumps(result)) if self.toJsonifyError else result

            newKwargs = getArgs(self.argNames, **kwargs)
            #newKwargs['member'] = user
            log.info(">>> %s" % newKwargs)
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator
