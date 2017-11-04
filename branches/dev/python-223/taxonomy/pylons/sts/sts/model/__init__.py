"""The application's model objects"""
from sts.model.meta import Session, Base
from sqlalchemy import orm


def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    # Session.configure(bind=engine)
    sm = orm.sessionmaker(autoflush=False,
                          autocommit=True,
                          #expire_on_commit=False,
                          bind=engine)

    meta.engine = engine
    meta.Session = orm.scoped_session(sm)
