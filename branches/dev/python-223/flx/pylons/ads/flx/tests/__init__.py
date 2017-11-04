"""Pylons application test package

This package assumes the Pylons environment is already loaded, such as
when this script is imported from the `nosetests --with-pylons=test.ini`
command.

This module initializes the application via ``websetup`` (`paster
setup-app`) and provides the base testing objects.

Run "nosetests --pdb --pdb-failures" for invoking pdb when fails.
"""
from unittest import TestCase

from paste.deploy import loadapp
from paste.script.appinstall import SetupCommand
from pylons import config, url
from routes.util import URLGenerator
from webtest import TestApp

import pylons.test
import os
import time
from beaker.cache import CacheManager

__all__ = ['environ', 'url', 'TestController']

# Invoke websetup with the current config file
SetupCommand('setup-app').run([config['__file__']])

environ = {}

class TestController(TestCase):

    def __init__(self, *args, **kwargs):
        celeryTestFile = "/var/run/celery/celeryd.test"
        try:
            if not os.path.exists(celeryTestFile):
                f = open(celeryTestFile, "w")
                f.write("1")
                f.close()
        except:
            pass
        if pylons.test.pylonsapp:
            wsgiapp = pylons.test.pylonsapp
        else:
            wsgiapp = loadapp('config:%s' % config['__file__'])
        self.app = TestApp(wsgiapp)
        url._push_object(URLGenerator(config['routes.map'], environ))
        TestCase.__init__(self, *args, **kwargs)

    def __getCache(self):
        cm = CacheManager(type='file', data_dir=config.get('cache_share_dir'))
        return cm.get_cache('test-login-repo')

    def login(self, userID):
        """
            Imitate the login by creating a cache entry for the user id along with the 
            timestamp.
            Only valid for the expiration time
        """
        self.logout()
        cache = self.__getCache()
        ts = int(time.time() * 1000)
        val = '%s:%s' % (userID, ts)
        ret = cache.get_value(key='test-login-%s' % userID, createfunc=lambda: '%s' % (val), expiretime=30*60)
        return ret

    def getLoginCookie(self, userID):
        val = self.login(userID)
        return '%s=%s' % (config.get('beaker.session.key'), val)

    def logout(self):
        self.__getCache().clear()

    def __before__(self):
        self.logout()

    def __after__(self):
        self.logout()

#
# Create test database
#
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flx.tests.model import Base, tMemberRole, tMember, tGroup, tSubject, tUnit, tLesson, tComponent, tQuiz, tQuizScore

_TEST_DB = 'ads_test'
NUM_STUDENTS = 7
NUM_STUDENTS_PER_GROUP = 2
NUM_GROUPS = NUM_STUDENTS / NUM_STUDENTS_PER_GROUP + 1
NUM_GROUPS_PER_TEACHER = 2
NUM_TEACHERS = NUM_GROUPS / NUM_GROUPS_PER_TEACHER + 1
NUMSUBJECTS = 3
SUBJECT_TREE_FANOUT = 3
NUM_QUIZES = NUMSUBJECTS * SUBJECT_TREE_FANOUT**3

def setup():
    engine = create_engine('mysql://dbadmin:D-coD#43@localhost:3306/?charset=utf8', echo=False)
    engine.execute('DROP DATABASE IF EXISTS %s' % _TEST_DB)
    engine.execute('CREATE DATABASE %s' % _TEST_DB)
    engine = create_engine('mysql://dbadmin:D-coD#43@localhost:3306/%s?charset=utf8' % _TEST_DB, echo=False)
    Base.metadata.drop_all(engine, checkfirst=True)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Roles:
    #  Student
    #  Teacher
    try:
        studentRole = tMemberRole(name='Student')
        teacherRole = tMemberRole(name='Teacher')
        session.add(studentRole)
        session.add(teacherRole)
    except Exception, e:
        print >>sys.stderr, str(e)

    # Groups
    try:
        groups = []
        for i in xrange(1, NUM_GROUPS+1):
            group = tGroup(name='Group %d' % i)
            session.add(group)
            groups.append(group)
    except Exception, e:
        print >>sys.stderr, str(e)
    
    # Students
    try:
        students = []
        for i in xrange(1, NUM_STUDENTS+1):
            student = tMember(name='Student %d' % i, role=studentRole)
            session.add(student)
            students.append(student)
    except Exception, e:
        print >>sys.stderr, str(e)

    # Students --> Groups
    try:
        for i,student in enumerate(students):
            student.groups.append(groups[i/NUM_STUDENTS_PER_GROUP])
    except Exception, e:
        print >>sys.stderr, str(e)

    # Teachers
    try:
        teachers = []
        for i in xrange(1, NUM_TEACHERS+1):
            teacher = tMember(name='Teacher %d' % i, role=teacherRole)
            session.add(teacher)
            teachers.append(teacher)
    except Exception, e:
        print >>sys.stderr, str(e)

    # Groups --> Teachers
    try:
        for i,group in enumerate(groups):
            group.members.append(teachers[i/NUM_GROUPS_PER_TEACHER])
    except Exception, e:
        print >>sys.stderr, str(e)

    # Subject tree
    try:
        components = []
        ic = jc = kc = lc = 1
        for i in xrange(1, NUMSUBJECTS+1):
            subject = tSubject(name="Subject %d" % ic)
            session.add(subject)
            ic += 1
            for j in xrange(1, SUBJECT_TREE_FANOUT+1):
                unit = tUnit(name="Unit %d" % jc)
                session.add(unit)
                subject.units.append(unit)
                jc += 1
                for k in xrange(1, SUBJECT_TREE_FANOUT+1):
                    lesson = tLesson(name="Lesson %d" % kc)
                    session.add(lesson)
                    unit.lessons.append(lesson)
                    kc += 1
                    for l in xrange(1, SUBJECT_TREE_FANOUT+1):
                        component = tComponent(name="Component %d" % lc)
                        session.add(component)
                        lesson.components.append(component)
                        components.append(component)
                        lc += 1
    except Exception, e:
        print >>sys.stderr, str(e)
    
    # Quizes
    try:
        quizes = []
        for i,component in enumerate(components, 1):
            quiz = tQuiz(name='Quiz %d' % i, component=component)
            session.add(quiz)
            quizes.append(quiz)
    except Exception, e:
        print >>sys.stderr, str(e)

    # Quizes --> Students
    try:
        for i,student in enumerate(students, 1):
            for j in xrange(1, i%NUM_QUIZES+2):
                score = tQuizScore(right=i, wrong=i+2, points=i, quiz=quizes[j-1], student=student)
                session.add(score)
    except Exception, e:
        print >>sys.stderr, str(e)
    
    session.commit()
    
def teardown():
    pass



