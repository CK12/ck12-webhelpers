"""
    Map database tables to python classes.
"""
import datetime
import logging

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

log = logging.getLogger(__name__)

"""
    Classes defined using declarative mapping
"""

Base = declarative_base()

class FlxModel(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

    def asDict(self):
        return self.__dict__

class MeasureDimensionAssociation(Base):
    __tablename__ = 'Measures_Dimensions'
    id = Column(Integer, primary_key=True)
    measure_id = Column(Integer, ForeignKey('Measures.id', ondelete='CASCADE'), primary_key=True)
    dimension_id = Column(Integer, ForeignKey('Dimensions.id', ondelete='CASCADE'), primary_key=True)
    fk_column = Column(String(50))
    dimension = relationship('Dimension', backref='measure_associations')

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               fk_column=self.fk_column,
                               dimension=self.dimension.cacheable())
    
class Measure(Base, FlxModel):
    __tablename__ = 'Measures'

    LATENCY_RT = 1  # real-time
    LATENCY_NT = 2  # near-time
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    latency = Column(Integer, default=LATENCY_NT)
    creation_date = Column(DateTime, default=datetime.datetime.now())
    aggregate = Column(Enum('day', 'week', 'month', 'quarter', 'year'))
    
    discriminator = Column('type', String(50))
    __mapper_args__ = {'polymorphic_on': discriminator}

    associations = relationship('MeasureDimensionAssociation',
                                backref='measure',
                                order_by='asc(MeasureDimensionAssociation.id)')

class Metric(Measure):
    __tablename__ = 'Metrics'
    __mapper_args__ = {'polymorphic_identity': 'Metrics'}
    
    metric_id = Column('id', Integer, ForeignKey('Measures.id', ondelete='CASCADE'), primary_key=True)
    source_column = Column(String(50))
    source_table = Column(String(50))
    source_db_host = Column(String(50))
    source_db_user = Column(String(50))
    source_db_password= Column(String(50))
    source_db_db = Column(String(50))

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               name=self.name,
                               latency=self.latency,
                               creation_date=self.creation_date,
                               aggregate=self.aggregate,
                               associations=[i.cacheable() for i in self.associations],
                               source_column=self.source_column,
                               source_table=self.source_table,
                               source_db_host=self.source_db_host,
                               source_db_user=self.source_db_user,
                               source_db_password=self.source_db_password,
                               source_db_db=self.source_db_db)

class EventGroup(Measure):
    __tablename__ = 'EventGroups'
    __mapper_args__ = {'polymorphic_identity': 'EventGroup'}
    
    eventgroup_id = Column('id', Integer, ForeignKey('Measures.id', ondelete='CASCADE'), primary_key=True)
    events = relationship('Event', backref='eventgroup', order_by='asc(Event.id)')
    attributes = relationship('Attribute', backref='eventgroup', order_by='asc(Attribute.id)')

    tablename = property(lambda self: 'F_' + self.name)
    aggregate_name = property(lambda self: 'F_' + self.name + ('_$%s$' % self.aggregate if self.aggregate else ''))
    
    @staticmethod
    def getEventGroupName(table):
        """Returns event group name of a table."""
        return table.strip('F_')

    def getColumnList(self):
        """Returns a list of database column names of the event group."""
        columns = [i.name.lower() for i in self.events]
        columns.extend([i.dimension.hierarchies[0].levels[-1].name+'ID' for i in self.associations]) 
        columns.extend([i.name.lower() for i in self.attributes])
        return columns 

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               name=self.name,
                               latency=self.latency,
                               creation_date=self.creation_date,
                               aggregate=self.aggregate,
                               associations=[i.cacheable() for i in self.associations],
                               events=[i.cacheable() for i in self.events],
                               attributes=[i.cacheable() for i in self.attributes],
                               tablename=self.tablename,
                               aggregate_name=self.aggregate_name)
    
class Event(Base, FlxModel):
    __tablename__ = 'Events'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    min_value = Column(Float)  # minimum value threshold (value less than this threshold will be discarded)
    max_value = Column(Float)  # maximum value threshold (value greater than this threshold will be discarded)
    eventgroup_id = Column(Integer, ForeignKey('EventGroups.id', ondelete='CASCADE'))

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id, name=self.name, min_value=self.min_value, max_value=self.max_value)
    
class Attribute(Base, FlxModel):
    __tablename__ = 'Attributes'
    COLUMN_LENGTH = 100
    
    id = Column(Integer, primary_key=True)
    eventgroup_id = Column(Integer, ForeignKey('EventGroups.id', ondelete='CASCADE'))
    name = Column(String(50))

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id, name=self.name)

class Dimension(Base, FlxModel):
    __tablename__ = 'Dimensions'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    is_builtin = Column(Boolean())
    load_script = Column(Text())    # MySQL TEXT type (max. 64K chars)
    update_script = Column(Text())  # MySQL TEXT type (max. 64K chars)
    hierarchies = relationship('Hierarchy', backref='dimension')
    tag = Column(Boolean())
    
    tablename = property(lambda self: 'D_' + self.name)
    
    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               name=self.name,
                               is_builtin=self.is_builtin,
                               load_script=self.load_script,
                               update_script=self.update_script,
                               hierarchies=[i.cacheable() for i in self.hierarchies],
                               tablename=self.tablename,
                               tag=self.tag)
    
class Hierarchy(Base, FlxModel):
    __tablename__ = 'Hierarchies'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    dimension_id = Column(Integer, ForeignKey('Dimensions.id', ondelete='CASCADE'))
    levels = relationship('Level', backref='hierarchy', order_by='desc(Level.id)')

    # A ragged hierarchy needs a bridge table to be built by ADS at runtime for
    # executing queries
    ragged = Column(Boolean(), default=False)
    pk_column = Column(String(50))
    parent_pk_column = Column(String(50))
    lookup_table = Column(String(50))
    db_host = Column(String(50))
    db_user = Column(String(50))
    db_password= Column(String(50))
    db_db = Column(String(50))

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               name=self.name,
                               ragged=self.ragged,
                               pk_column=self.pk_column,
                               parent_pk_column=self.parent_pk_column,
                               lookup_table=self.lookup_table,
                               db_host=self.db_host,
                               db_user=self.db_user,
                               db_password=self.db_password,
                               db_db=self.db_db,
                               levels=[i.cacheable() for i in self.levels])
        
class Level(Base, FlxModel):
    __tablename__ = 'Levels'
    COLUMN_LENGTH = 100
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    hierarchy_id = Column(Integer, ForeignKey('Hierarchies.id', ondelete='CASCADE'))
    
    parent_id = Column(Integer, ForeignKey('Levels.id'))
    parent = relationship('Level', remote_side=[id], backref='child', uselist=False)

    def cacheable(self):
        """Returns cacheable (not managed by SQLAlchemy) version of this object."""
        return CacheableObject(id=self.id,
                               name=self.name,
                               parent=self.parent)

class CacheableObject(object):
    def __init__(self, **kwargs):
        for k,v in kwargs.items():
            setattr(self, k, v)
