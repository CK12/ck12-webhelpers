"""The application's model objects"""
import logging
import sqlalchemy as sa
from sqlalchemy import orm

import os.path
from auth.model import meta

log = logging.getLogger(__name__)

def init_model(engines):
    """Call me before using any of the tables or classes in the model"""
    ## Reflected tables must be defined and mapped here
    #global reflected_table
    #reflected_table = sa.Table("Reflected", meta.metadata, autoload=True,
    #                           autoload_with=engine)
    #orm.mapper(Reflected, reflected_table)
    #
    #meta.Session.configure(bind=engine)
    #meta.engine = engine
    meta.Sessions = []
    for n in range(0, len(engines)):
        engine = engines[n]
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              expire_on_commit=False, ## Needed for apache2 to avoid instance expiration mid-request
                              bind=engine)
        meta.Sessions.append(orm.scoped_session(sm))
    meta.Session = meta.Sessions[0]
    meta.engine = engines[0]
    meta.engines = engines

def getSQLAlchemyEngines(config, prefix='sqlalchemy'):
    from sqlalchemy import engine_from_config

    engines = []
    s = '%s.master.' % prefix
    log.debug('getSQLAlchemyEngines: prefix[%s]' % s)
    try:
        engine = engine_from_config(config, s)
        engines.append(engine)
        log.debug('getSQLAlchemyEngines: DB url[%s]' % config.get('%surl' % s))
    except Exception:
        engine = None
    if not engine:
        s = '%s.' % prefix
        log.debug('getSQLAlchemyEngines: prefix[%s]' % s)
        try:
            engine = engine_from_config(config, s)
            log.debug("Engine: %s" % engine)
            engines.append(engine)
            log.debug('getSQLAlchemyEngines: DB url[%s]' % config.get('%surl' % s))
        except Exception, e:
            log.error("ERROR!!", exc_info=e)
            pass
            
        return engines
    n = 1
    while True:
        try:
            s = '%s.slave%d.' % (prefix, n)
            log.debug('getSQLAlchemyEngines: prefix[%s]' % s)
            engine = engine_from_config(config, s)
            engines.append(engine)
            log.debug('getSQLAlchemyEngines: DB url[%s]' % config.get('%surl' % s))
            n += 1
        except Exception:
            break
    return engines

## Non-reflected tables may be defined and mapped at module level
#foo_table = sa.Table("Foo", meta.metadata,
#    sa.Column("id", sa.types.Integer, primary_key=True),
#    sa.Column("bar", sa.types.String(255), nullable=False),
#    )
#
#class Foo(object):
#    pass
#
#orm.mapper(Foo, foo_table)


## Classes for reflected tables may be defined here, but the table and
## mapping itself must be done in the init_model function
#reflected_table = None
#
#class Reflected(object):
#    pass
