import logging
import json
from datetime import datetime

from pylons import request, response, config

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
            newKwargs = getArgs(self.argNames, **kwargs)
            result = func(funcSelf, *args, **newKwargs)
            return jsonifyResponse(result, start)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

def jsonifyResponse(result, start):
    end = datetime.now()
    if type(result).__name__ == 'dict' and result.has_key('responseHeader'):
        result['responseHeader']['QTime'] = str(end - start)
    ## Set header to application/json if the browser accepts it
    if ('Accept' in request.headers and 'application/json' in request.headers['Accept']):
        response.content_type = 'application/json; charset=utf-8'
    return json.dumps(result, sort_keys=True)

class setPage(object):
    """
        Decorator to get the page number and size from the request.

        PageNum is 1-origin. If pageSize is 0, there will be no pagination.
    """

    def __init__(self, argNames=[]):
        self.argNames = argNames

    def __call__(self, func):
        def decorator(funcSelf, *args, **kwargs):
            newKwargs = getArgs(self.argNames, **kwargs)
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
                pageSize = 0

            log.info("Page size is %d. Getting page number %d" % (pageSize, pageNum))
            newKwargs['pageNum'] = pageNum
            newKwargs['pageSize'] = pageSize
            return func(funcSelf, *args, **newKwargs)

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator


