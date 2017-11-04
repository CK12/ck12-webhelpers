import logging
import json
from datetime import datetime 
from pylons.i18n.translation import _ 

from pylons import request, response, config

from flx.controllers.errorCodes import ErrorCodes

import flx.lib.helpers as h

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
                end = datetime.now()
                time = end - start
                self.log.info('<<< Exiting  %s, took %s' % (name, time))
                if time.seconds > int(config.get('slowapi_threshold_secs', 3)):
                    slowlog.warn("[%s.%ss] %s:%s" % ( (time.days*3600 + time.seconds), time.microseconds/1000, mod, name ) )

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
        #    request.params.get('format') == 'json':
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
                    fq = []
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
