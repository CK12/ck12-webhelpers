"""The application's model objects"""
import logging
#import sqlalchemy as sa
from sqlalchemy import orm

#import os.path
from flx.model import meta

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
    if type(engines) is not list:
        engines = [ engines ]
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
            engines.append(engine)
            log.debug('getSQLAlchemyEngines: DB url[%s]' % config.get('%surl' % s))
        except Exception, e:
            log.error("Error creating sqlalchemy engine: %s" % str(e), exc_info=e)
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

LEVEL = 3

class FlxModel(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')
        #return unicode(self.asDict()).encode('utf-8')

    def __repr__(self):
        return str(self)

    @staticmethod
    def processMulti(items, level=LEVEL):
        if hasattr(items, 'keys'):
            d = {}
            #
            #  Dictionary.
            #
            for key in items.keys():
                value = items.get(key, None)
                log.debug('processMulti: dict key[%s] %s[%s]' % (key, type(items), items))
                if isinstance(value, FlxModel):
                    d[key] = value.asDict(level - 1, top=False)
                else:
                    d[key] = processMulti(value, level - 1)
            return d
        elif hasattr(items, '__iter__'):
            #
            #  List.
            #
            l = []
            for value in items:
                log.debug('processMulti: list %s[%s]' % (type(value), value))
                if isinstance(value, FlxModel):
                    l.append(value.asDict(level=level - 1, top=level == LEVEL))
                else:
                    l.append(processMulti(value, level - 1))
            log.debug('processMulti: return %s[%s]' % (type(l), l))
            return l

    def asDict(self, level=LEVEL, top=True):
        """
            Return the dictionary this instance.
        """
        if level <= 0:
            return '...'

        d = {}
        mine_dict = self.__dict__
        for key in mine_dict.keys():

            if key == '_sa_instance_state':
                continue
            value = mine_dict.get(key)
            log.debug('asDict[%d]: key[%s] %s[%s]' % (level, key, type(value), value))
            if hasattr(value, 'keys') or hasattr(value, '__iter__'):
                children = FlxModel.processMulti(value, level - 1)
                d[key] = children
            elif isinstance(value, FlxModel):
                child = value.asDict(level - 1, top=False)
                d[key] = child
            else:
                #log.debug('asDict[%d]: single key[%s] value[%s]' % (level, key, value))
                d[key] = value
        return d
