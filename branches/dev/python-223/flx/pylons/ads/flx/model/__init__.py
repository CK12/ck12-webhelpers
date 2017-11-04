"""The application's model objects"""
#import sqlalchemy as sa
from sqlalchemy import orm

#import os.path
from flx.model import meta
from flx.model.model import Base

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    ## Reflected tables must be defined and mapped here
    #global reflected_table
    #reflected_table = sa.Table("Reflected", meta.metadata, autoload=True,
    #                           autoload_with=engine)
    #orm.mapper(Reflected, reflected_table)
    #
    #meta.Session.configure(bind=engine)
    #meta.engine = engine
    sm = orm.sessionmaker(autoflush=False,
                          autocommit=True,
                          expire_on_commit=False, ## Needed for apache2 to avoid instance expiration mid-request
                          bind=engine)

    meta.engine = engine
    meta.Session = orm.scoped_session(sm)
    meta.meta = Base.metadata
    #meta.meta.drop_all(engine, checkfirst=False)
    meta.meta.create_all(engine)


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
