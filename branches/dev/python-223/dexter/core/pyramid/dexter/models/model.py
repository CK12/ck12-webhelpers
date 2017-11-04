class DexterModel(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

    def _rmState(self, obj):
        try:
            if obj.has_key('_sa_instance_state'):
                del obj['_sa_instance_state']
        except:
            pass

        if hasattr(obj, '_sa_instance_state'):
            del obj.__dict__['_sa_instance_state']

        if hasattr(obj, 'asDict'):
            obj = obj.asDict()
        elif hasattr(obj, 'keys'):
            for key in obj.keys():
                obj[key] = self._rmState(obj[key])
        elif hasattr(obj, '__iter__'):
            l = []
            for item in obj:
                l.append(self._rmState(item))
            obj = l

        return obj

    def asDict(self):
        from copy import copy

        d = copy(self.__dict__)
        return self._rmState(d)


"""
    Errors.
"""
class MissingAttributeError(Exception):
    def __init__(self, value):
        Exception.__init__(self, value)
        self.value = value

    def __repr__(self):
        return self.value

def checkAttributes(expectedList, **kwargs):
    """
        Validate the existence of required parameters.
    """
    missingList = []
    for expected in expectedList:
        if not kwargs.has_key(expected):
            missingList.append(expected)
    if len(missingList) > 0:
        raise MissingAttributeError('Missing required attributes: %s' % str(missingList))
