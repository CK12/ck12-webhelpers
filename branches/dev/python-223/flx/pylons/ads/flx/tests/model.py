"""
    Map database tables to python classes.
"""
import logging

from sqlalchemy import Table, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

log = logging.getLogger(__name__)

"""
    Classes defined using declarative mapping
"""

Base = declarative_base()

tMembers_tGroups = Table('tMembers_tGroups', Base.metadata,
    Column('memberID', Integer, ForeignKey('tMembers.id')),
    Column('t_groupID', Integer, ForeignKey('tGroups.id'))
)

class tMemberRole(Base):
    __tablename__ = 'tMemberRoles'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    members = relationship("tMember", backref="role")

class tMember(Base):
    __tablename__ = 'tMembers'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    roleID = Column(Integer, ForeignKey('tMemberRoles.id'))
    groups = relationship("tGroup", secondary=tMembers_tGroups, backref="members")

class tGroup(Base):
    __tablename__ = 'tGroups'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))

class tComponent(Base):
    __tablename__ = 'tComponents'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    lessonID = Column(Integer, ForeignKey('tLessons.id'))
    quizes = relationship("tQuiz", backref="component")
    
class tLesson(Base):
    __tablename__ = 'tLessons'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    unitID = Column(Integer, ForeignKey('tUnits.id'))
    components = relationship("tComponent", backref="lesson")

class tUnit(Base):
    __tablename__ = 'tUnits'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    subjectID = Column(Integer, ForeignKey('tSubjects.id'))
    lessons = relationship("tLesson", backref="unit")

class tSubject(Base):
    __tablename__ = 'tSubjects'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    units = relationship("tUnit", backref="subject")

class tQuiz(Base):
    __tablename__ = 'tQuizes'

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    scores = relationship("tQuizScore", backref="quiz")
    componentID = Column(Integer, ForeignKey('tComponents.id'))

class tQuizScore(Base):
    __tablename__ = 'tQuizScores'

    id = Column(Integer, primary_key=True)
    right = Column(Integer)
    wrong = Column(Integer)
    points = Column(Integer)
    quizID = Column(Integer, ForeignKey('tQuizes.id'))
    memberID = Column(Integer, ForeignKey('tMembers.id'))
    student = relationship("tMember", backref="scores")
