from datetime import datetime

import auth.lib.helpers as h
from auth.model import model
from auth.model import api
from auth.model.exceptions import NotFoundException
from auth.controllers.member import generateDigest


class UploadStudents:

    class Message:

        def __init__(self):
            self.data = ''

        def get(self):
            return self.data

        def append(self, message):
            if self.data:
                self.data += '.  '
            self.data += message
            return self.data


    def __init__(self, session):
        self.session = session
        h.initTranslator()

    def _cache(self, cls, dict):
        """
            Cache the given class.
        """
        query = self.session.query(cls)
        rows = query.all()
        for row in rows:
            dict[row.name] = row.asDict()

    def _processRow(self, row):
        srow = [ e.strip() for e in row ]
        return srow

    def process(self, students, teacherID, school):
        memberRoleDict = dict()
        self._cache(model.MemberRole, memberRoleDict)
        memberStateDict = dict()
        self._cache(model.MemberState, memberStateDict)
        memberAuthTypeDict = dict()
        self._cache(model.MemberAuthType, memberAuthTypeDict)
        ck12AuthID = memberAuthTypeDict['ck-12']['id']
        school = school.strip()

        mList = []
        midList = []
        lmList = []
        #
        #  Create students.
        #
        for row in students:
            l = self._processRow(row)
            if len(l) == 5:
                login, password, firstName, lastName, email = l
                rest = []
            else:
                login, password, firstName, lastName, email, rest = l
            message = self.Message()
            try:
                #
                #  Generate a fake email if not given.
                #
                if not email:
                    #
                    #  Construct a fake email.
                    #
                    local = login.replace('@', '_').replace('<', '_').replace('>', '_').replace(' ', '_').replace("'", '').replace('"', '')
                    email = 'student-%s-%s@school-%s.partners.ck12.org' % (teacherID, local, school)
                    email = email.strip()
                try:
                    member = api._getMember(self.session, email=email)
                    if member:
                        if member.givenName.lower() != firstName.lower() and member.surname.lower() != lastName.lower():
                            message.append('Error: email, %s, already signed up as %s, %s' % (email, member.surname, member.givenName))
                        else:
                            if not api._getMemberSchool(self.session, memberID=member.id):
                                #
                                #  Add school information.
                                #
                                api._newMemberSchool(self.session, memberID=member.id, schoolID=school, schoolType='usmaster')
                            #
                            #  Add this student to the group.
                            #
                            mList.append(dict(login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id))
                            message.append('Warning: email, %s, already signed up' % email)
                        continue
                except NotFoundException:
                    member = None
                #
                #  Convert login to lower case.
                #
                login = login.lower()
                #
                #  Make sure login is unique.
                #
                try:
                    member = api._getMember(self.session, login=login)
                    if member:
                        if member.email == email:
                            if not api._getMemberSchool(self.session, memberID=member.id):
                                #
                                #  Add school information.
                                #
                                api._newMemberSchool(self.session, memberID=member.id, schoolID=school, schoolType='usmaster')
                            #
                            #  Add this student to the group.
                            #
                            mList.append(dict(login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id))
                            message.append('Warning: user name, %s, already signed up' % login)
                            continue
                        #
                        #  Find a unique login.
                        #
                        counter = 1
                        while True:
                            newLogin = '%s%d' % (member.login, counter)
                            member = api._getMember(self.session, login=newLogin)
                            if not member:
                                login = newLogin
                                break
                            counter += 1
                        message.append('Warning: user name, %s, already exists, new user name, %s' % (member.login, login))
                except NotFoundException:
                    member = None
                #
                #  Use login as password if not given.
                #
                if not password:
                    password = login
                    message.append('password: %s' % login)
                token = generateDigest(password)

                roleID = memberRoleDict['student']['id']
                stateID = memberStateDict['activated']['id']
                now = datetime.now()
                data = {
                    'roleID': roleID,
                    'stateID': stateID,
                    'email': email,
                    'givenName': firstName,
                    'surname': lastName,
                    'authTypeID': ck12AuthID,
                    'creationTime': now,
                    'updateTime': now,
                    'login': login,
                    'token': token,
                }
                member = api._createMember(self.session, **data)
                self.session.flush()
                api._newMemberSchool(self.session, memberID=member.id, schoolID=school, schoolType='usmaster')
                mList.append(dict(login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id))
                midList.append(int(member.id))
            finally:
                if message.get():
                    lmList.append('%s,%s,%s,%s,%s,%s' % (login, password, firstName, lastName, email, message.get()))

        return mList, midList, lmList
