# -*- coding: utf-8 -*-

from auth.tests import TestController
from auth.model import api
from sqlalchemy.exc import IntegrityError

class TestAPIs(TestController):

    def setUp(self):
        super(TestAPIs, self).setUp()
        self.login = 'stephen'
        self.email = 'stephen@ck12.org'
        try:
            self.member = api.createMember(gender='male',
                                           login=self.login,
                                           defaultLogin=self.login,
                                           stateID=2,
                                           authTypeID=1,
                                           token='youguessit',
                                           email=self.email,
                                           givenName='Stephen',
                                           surname='AuYeung',
                                           roleID=5,
                                           emailVerified=True
                                          )
            self.new = True
        except IntegrityError:
            self.member = api.getMemberByEmail(email=self.email)
            self.new = False

    def tearDown(self):
        super(TestAPIs, self).tearDown()
        if self.new:
            api.deleteMemberByID(id=self.member.id)

    def test_member(self):
        member = None
        try:
            member = api.createMember(surname='AuYeung')
            assert member is None
        except Exception:
            assert member is None

        login = 'stephen1'
        email = 'stephen1@ck12.org'
        member = api.createMember(gender='male',
                                  stateID=1,
                                  login=login,
                                  defaultLogin=login,
                                  givenName='Stephen',
                                  surname='AuYeung',
                                  authTypeID=1,
                                  token='noneed',
                                  email=email,
                                  emailVerified=True,
                                  roleID=7
                                 )
        assert member is not None
        ext = api.createMemberExtData(memberID=member.id,
                                      authTypeID=3,
                                      token='test',
                                      verified=True)
        assert ext is not None
        member = api.deleteMemberByLogin(login=login)
        assert member is not None
        member = api.createMember(gender='male',
                                  stateID=2,
                                  login=login,
                                  defaultLogin=login,
                                  givenName='Stephen',
                                  surname='AuYeung',
                                  authTypeID=1,
                                  token='noneed',
                                  email=email,
                                  emailVerified=True,
                                  roleID=5
                                 )
        assert member is not None
        member = api.deleteMemberByID(id=member.id)
        assert member is not None

    def test_updateMember(self):
        self.member.givenName = 'Hang'
        api.update(instance=self.member)
        member = api.getMemberByEmail(email=self.email)
        assert member.givenName == 'Hang'
