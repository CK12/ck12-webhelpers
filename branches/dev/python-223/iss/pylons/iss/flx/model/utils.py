import logging
from decorator import decorator as python_decorator
from datetime import datetime
import traceback
import sys
from sqlalchemy.orm import exc

from flx.model import meta

log = logging.getLogger(__name__)

class transaction(object):

    def __init__(self, name, readOnly=False):
        log.info('--- begin %s' % name)
        self.start = datetime.now()
        self.name = name
        self.readOnly = readOnly
        self.session = None
        self.result = None

    def setResult(self, result):
        self.result = result

    def __enter__(self):
        if not self.readOnly:
            session = meta.Session()
        else:
            meta.nextSession = ( meta.nextSession + 1 ) % len(meta.Sessions)
            session = meta.Sessions[meta.nextSession]
            log.debug('Using session[%s]' % meta.nextSession)
        session.begin()
        self.session = session
        return session

    def __exit__(self, type, value, trace):
        session = self.session
        action = ''
        try:
            if trace:
                session.rollback()
                action = 'rollback'
                log.error(type)
                log.error(value)
                log.error(trace)
            else:
                action = 'commit'

                try:
                    dirty = False
                    if session.dirty or session.new or session.deleted:
                        dirty = True
                    session.commit()
                    if self.result and dirty:
                        try:
                            session.expire_all()
                        except Exception:
                            pass
                except Exception, e:
                    et, ei, tb = sys.exc_info()
                    session.rollback()
                    action = 'rollback'
                    log.error(traceback.format_exc())
                    raise e
        finally:
            end = datetime.now() - self.start
            log.info('--- %s %s, took %s' % (action, self.name, end))

class _transactional(object):
    """
        The transactional decorator that wraps a function into a transaction.

        Any transactional method cannot call another transactional method.
    """

    def __init__(self, readOnly=False):
        self.readOnly = readOnly

    def __call__(self, func):
        def decorator(*args, **kwargs):
            #with (tx = transaction(func.__name__, readOnly=self.readOnly)) as session:
            tx = transaction(func.__name__, readOnly=self.readOnly)
            with tx as session:
                result = func(session, *args, **kwargs)
                tx.setResult(result)
                return result

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

@python_decorator
def trace(func, *args, **kwargs):
    name = func.__name__
    start = datetime.now()
    log.info('>>> Entering %s' % name)
    log.debug('>>>          %s' % str(args))
    if kwargs:
        log.debug('>>>          %s' % str(kwargs))
    try:
        return func(*args, **kwargs)
    finally:
        end = datetime.now()
        time = end - start
        log.info('<<< Exiting  %s, took %s' % (name, time))

def _checkAttributes(expectedList, **kwargs):
    """
        Validate the existence of required parameters.
    """
    missingList = []
    for expected in expectedList:
        if not kwargs.has_key(expected):
            missingList.append(expected)
    if len(missingList) > 0:
        raise MissingAttributeError('Missing required attributes: %s' % str(missingList))

"""
    Errors.
"""
class MissingAttributeError(Exception):
    def __init__(self, value):
        Exception.__init__(self, value)
        self.value = value

    def __repr__(self):
        return self.value

def _queryOne(query, lockMode=None):
    if lockMode:
        query = query.with_lockmode(lockMode)
    try:
        return query.one()
    except exc.NoResultFound:
        return None


