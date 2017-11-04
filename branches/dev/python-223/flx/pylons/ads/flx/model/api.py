import logging
import traceback

from flx.model import meta

log = logging.getLogger(__name__)

class _transactional(object):
    """
        The transactional decorator that wraps a function into a transaction.

        Any transactional method cannot call another transactional method.
    """

    def __init__(self):
        pass

    def __call__(self, func):
        def decorator(*args, **kwargs):
            from datetime import datetime

            action = 'commit'
            log.info('--- begin %s' % func.__name__)
            start = datetime.now()
            session = meta.Session()
            try:
                session.begin()
                kwargs['session'] = session
                result = func(*args, **kwargs)
                dirty = False
                if session.dirty or session.new or session.deleted:
                    dirty = True
                session.commit()
                if result and dirty:
                    try:
                        session.expire_all()
                    except:
                        pass
                return result
            except Exception, e:
                session.rollback()
                action = 'rollback'
                log.error(traceback.format_exc())
                raise e
            finally:
                end = datetime.now() - start
                log.info('--- %s %s, took %s' % (action, func.__name__, end))

        decorator.__name__ = func.__name__
        decorator.__doc__ = func.__doc__
        decorator.__dict__ = func.__dict__
        return decorator

