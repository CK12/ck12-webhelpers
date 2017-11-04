import csv
import sys
from datetime import datetime
from sqlalchemy import create_engine, orm, MetaData

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import auth.lib.helpers as ah
from auth.model import meta as ameta
from auth.model import model as amodel
from auth.model import api as aapi
from auth.model.exceptions import NotFoundException
from auth.controllers.member import generateDigest

from flx.model import meta as fmeta
from flx.model import api as fapi

encoding = 'utf-8'


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


class UploadUsers:
    memberRoleDict = {}
    memberStateDict = {}
    memberAuthTypeDict = {}

    def __init__(self, aurl, furl, run, verbose):
        self.aconfig = ah.load_pylons_config()
        if ameta.engine is None:
            ameta.engine = create_engine(aurl)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=ameta.engine)
            ameta.ameta = MetaData()
            ameta.Session = orm.scoped_session(sm)
        self.asession = ameta.Session()
        ah.initTranslator()

        if fmeta.engine is None:
            fmeta.engine = create_engine(furl)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=fmeta.engine)
            fmeta.fmeta = MetaData()
            fmeta.Session = orm.scoped_session(sm)
        self.fsession = fmeta.Session()

        self.run = run
        self.verbose = verbose

    def _cache(self, cls, dict):
        """
            Cache the given class.
        """
        query = self.asession.query(cls)
        rows = query.all()
        for row in rows:
            dict[row.name] = row.asDict()

    def processRow(self, row):
        srow = [ e.strip() for e in row ]
        return srow

    def process(self, csvUsrFile, logFile, code, grade, school, schoolType='usmaster'):
        self.asession.begin()
        self._cache(amodel.MemberRole, self.memberRoleDict)
        self._cache(amodel.MemberState, self.memberStateDict)
        self._cache(amodel.MemberAuthType, self.memberAuthTypeDict)
        self.asession.commit()
        ck12AuthID = self.memberAuthTypeDict['ck-12']['id']
        f = open(csvUsrFile, 'r')
        lf = open(logFile, 'w')
        if grade:
            grade = grade.strip()
            if self.verbose:
                print 'grade[%s]' % grade
        school = school.strip()
        if self.verbose:
            print 'school[%s]' % school
        #
        #  Process users.
        #
        #  Start the flx side to verify grade and group info.
        #
        self.fsession.begin()
        gradeLevel = None
        if grade:
            gradeLevel = fapi._getGradeByName(self.fsession, grade)
            if not gradeLevel:
                print 'No such grade: %s' % grade
                return
        if not code:
            group = None
        else:
            group = fapi._getGroupByCode(self.fsession, code)
            if not group:
                print 'No group with access code: %s' % code
                return
        #
        #  Read student info from file.
        #
        reader = csv.reader(f, delimiter=',', quotechar='"')
        mList = []
        midList = []
        #
        #  Auth side.
        #
        self.asession.begin()
        for row in reader:
            l = self.processRow(row)
            if len(l) == 5:
                login, password, firstName, lastName, email = l
                grade = None
            elif len(l) == 6:
                login, password, firstName, lastName, email, grade = l
            else:
                login, password, firstName, lastName, email, grade, rest = l
            message = Message()
            try:
                if grade:
                    gradeLevel = fapi._getGradeByName(self.fsession, grade)
                #
                #  Generate a fake email if not given.
                #
                if not email:
                    if not group:
                        print 'No group provided, cannot construct email.'
                        return
                    #
                    #  Construct a fake email.
                    #
                    local = login.replace('@', '_').replace('<', '_').replace('>', '_').replace(' ', '_').replace("'", '').replace('"', '')
                    email = 'student-%s-%s@school-%s.partners.ck12.org' % (group.creatorID, local, school)
                    email = email.strip()
                try:
                    member = aapi._getMember(self.asession, email=email)
                    if member:
                        if not aapi._getMemberSchool(self.asession, memberID=member.id):
                            #
                            #  Add school information.
                            #
                            aapi._newMemberSchool(self.asession, memberID=member.id, schoolID=school, schoolType=schoolType)
                        if group:
                            #
                            #  Add this student to the group.
                            #
                            mList.append((dict(id=member.id, login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id), gradeLevel, True))
                        message.append('Email, %s, already signed up' % email)
                        midList.append(int(member.id))
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
                    member = aapi._getMember(self.asession, login=login)
                    if member:
                        if member.email == email:
                            if not aapi._getMemberSchool(self.asession, memberID=member.id):
                                #
                                #  Add school information.
                                #
                                aapi._newMemberSchool(self.asession, memberID=member.id, schoolID=school, schoolType=schoolType)
                            if group:
                                #
                                #  Add this student to the group.
                                #
                                mList.append((dict(id=member.id, login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id), gradeLevel, True))
                            message.append('User name, %s, already signed up' % login)
                            midList.append(int(member.id))
                            continue
                        #
                        #  Find a unique login.
                        #
                        oLogin = login
                        counter = 1
                        while True:
                            newLogin = '%s%d' % (member.login, counter)
                            member = aapi._getMember(self.asession, login=newLogin)
                            if not member:
                                login = newLogin
                                break
                            counter += 1
                        message.append('Existing user name, %s, becomes %s' % (oLogin, login))
                except NotFoundException:
                    member = None
                #
                #  Use login as password if not given.
                #
                if not password:
                    password = login
                    message.append('password: %s' % login)
                token = generateDigest(password)

                roleID = self.memberRoleDict['student']['id']
                stateID = self.memberStateDict['activated']['id']
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
                member = aapi._createMember(self.asession, **data)
                self.asession.flush()
                aapi._newMemberSchool(self.asession, memberID=member.id, schoolID=school, schoolType=schoolType)
                if group:
                    mList.append((dict(id=None, login=member.login, email=member.email, givenName=member.givenName, surname=member.surname, defaultLogin=member.defaultLogin, timezone=member.timezone, roleID=2, authID=member.id), gradeLevel, False))
                midList.append(int(member.id))
            finally:
                if self.verbose:
                    print '%s, %s, %s, %s, %s, %s:  %s' % (login, password, firstName, lastName, email, grade, message.get())
                if message.get():
                    lf.write('%s\n' % message.get())
        if run:
            self.asession.commit()
        else:
            self.asession.rollback()
        #
        #  Update flx side.
        #
        for m, gradeLevel, created in mList:
            memberID = None
            if created:
                memberID = m.get('id')
                member = fapi._getMemberByID(self.fsession, id=memberID)
                if not member:
                    memberID = None
            if not memberID:
                member = fapi._createMember(self.fsession, **m)
                self.fsession.flush()
                memberID = member.id
            if gradeLevel:
                fapi._addOrUpdateMemberGrades(self.fsession, memberID=memberID, gradeIDs=[gradeLevel.id])
            if group:
                isGroupMember = fapi._isGroupMember(self.fsession, memberID=memberID, groupID=group.id)
                if not isGroupMember:
                    fapi._createGroupHasMember(self.fsession, memberID=memberID, groupID=group.id, roleID=14)
                student = fapi._getTeacherStudentRelations(self.fsession, studentID=memberID, teacherID=group.creatorID)
                if len(student) == 0:
                    fapi._createTeacherStudentRelation(self.fsession, studentID=memberID, teacherID=group.creatorID)
        if run:
            self.fsession.commit()
        else:
            self.fsession.rollback()

        print 'mids %s' % midList


if __name__ == "__main__":
    import optparse

    class OptionParser(optparse.OptionParser):

        def format_description(self, formatter):
            return self.description


    sourceFile = '/tmp/students.csv'
    logFile = '/tmp/students.log'
    code = None
    grade = None
    school = None
    schoolType = 'usmaster'
    aurl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    furl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

    parser = OptionParser('%prog [options]', description=
"""Upload student information from a CSV file.
user name, password, first name, last name, email, grade
The required fields are: user name, first name
The optional fields are: password, last name, email, and grade

For example:
  mshs-johnsmith,,John
  doe@yahoo.com,secret,Bob,Doe,bob.doe@yahoo.com

If email is empty, this tool will generate a fake one.
When password is missing, this tool will also generate one.

Records will be skipped for those emails or user names that already exist.
""")
    parser.add_option(
        '-a', '--auth', dest='aurl', default=aurl, action='store',
        help='The URL for connecting to the database. Defaults to %s' % aurl
    )
    parser.add_option(
        '-f', '--flx', dest='furl', default=furl, action='store',
        help='The URL for connecting to the database. Defaults to %s' % furl
    )
    parser.add_option(
        '-u', '--source-file', dest='sourceFile', default=sourceFile, action='store',
        help='Location of the user file to be imported. Defaults to %s' % sourceFile
    )
    parser.add_option(
        '-c', '--code', dest='code', default=code, action='store',
        help='Group access code.'
    )
    parser.add_option(
        '-g', '--grade', dest='grade', default=grade, action='store',
        help='Grade level.'
    )
    parser.add_option(
        '-l', '--log-file', dest='logFile', default=logFile, action='store',
        help='Location of the log file. Defaults to %s' % logFile
    )
    parser.add_option(
        '-r', '--run', action='store_true', dest='run', default=False,
        help='Actually performance the fix. Defaults to dry run only.'
    )
    parser.add_option(
        '-s', '--school', dest='school', default=school, action='store',
        help='School id. Should not have spaces.'
    )
    parser.add_option(
        '-t', '--school-type', dest='schoolType', default=schoolType, action='store',
        help='School type. Defaults to usmaster.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    sourceFile = options.sourceFile
    logFile = options.logFile
    code = options.code
    grade = options.grade
    school = options.school
    schoolType = options.schoolType
    aurl = options.aurl
    furl = options.furl
    run = options.run
    verbose = options.verbose

    if not school:
        print 'Missing school.'
        exit()

    if verbose:
        print 'Uploading students from %s to %s, %s. Real run? %s' % (sourceFile, aurl, furl, run)
    UploadUsers(aurl, furl, run, verbose).process(sourceFile, logFile, code, grade, school, schoolType)
