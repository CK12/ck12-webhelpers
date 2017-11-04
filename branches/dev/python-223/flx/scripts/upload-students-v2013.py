import csv
import sys
from datetime import datetime

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.model.exceptions import NotFoundException
from flx.controllers.member import generateDigest

encoding = 'utf-8'

class UploadUsers:
    memberRoleDict = {}
    memberStateDict = {}
    memberAuthTypeDict = {}

    def __init__(self, url, verbose):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.verbose = verbose
        h.initTranslator()

    def _cache(self, cls, dict):
        """
            Cache the given class.
        """
        query = self.session.query(cls)
        rows = query.all()
        for row in rows:
            dict[row.name] = row.asDict()

    def process(self, csvUsrFile, logFile, prefix):
        self.session.begin()
        self._cache(model.MemberRole, self.memberRoleDict)
        self._cache(model.MemberState, self.memberStateDict)
        self._cache(model.MemberAuthType, self.memberAuthTypeDict)
        self.session.commit()
        ck12AuthID = self.memberAuthTypeDict['ck-12']['id']
        f = open(csvUsrFile, 'r')
        l = open(logFile, 'w')
        prefix = prefix.strip()
        print 'prefix[%s]' % prefix
        #
        #  Process users.
        #
        reader = csv.reader(f, delimiter=',', quotechar='"')
        self.session.begin()
        for row in reader:
            message = ''
            email = ''
            login = ''
            password = ''
            size = len(row)
            try:
                if size < 4:
                    message = 'Missing field.'
                    continue
                #
                #  Process what's given.
                #
                if size == 4:
                    sid, firstName, lastName, birthday = row
                elif size == 5:
                    sid, firstName, lastName, birthday, email = row
                else:
                    sid = row[0]
                    firstName = row[1]
                    lastName = row[2]
                    birthday = row[3]
                    email = row[4]
                    rest = row[5:]
                    login = rest[0]
                    if len(rest) > 1:
                        password = rest[1]
                if not login:
                    login = '%s:%s' % (prefix, sid)
                if not password:
                    password = '%s:%s' % (prefix, sid)

                sid = sid.strip()
                firstName = firstName.strip()
                lastName = lastName.strip()
                try:
                    #
                    #  Birthday of the format YYYYMMDD.
                    #
                    birthday = datetime.strptime(birthday, "%Y%m%d").date()
                except ValueError:
                    birthday = None
                login = login.strip()
                password = password.strip()
                token = generateDigest(password)
                if not email:
                    #
                    #  Construct a fake email that ends with .fake.
                    #  That will make it identifiable/searchable.
                    #
                    email = '%s@%s.fake' % (sid, prefix)
                    if len(row) == 4:
                        row.append(email)
                    else:
                        row[4] = email
                email = email.strip()
                try:
                    member = api._getMember(self.session, email=email)
                except NotFoundException:
                    member = None
                if member:
                    if member.givenName == firstName and member.surname == lastName and member.login == login:
                        message = 'Already exists'
                        continue
                else:
                    try:
                        member = api._getMember(self.session, login=login)
                    except NotFoundException:
                        member = None
                    if member and member.email != email:
                        message = 'User name exists'
                        continue

                roleID = self.memberRoleDict['student']['id']
                stateID = self.memberStateDict['activated']['id']
                now = datetime.now()
                data = {
                    'roleID': roleID,
                    'stateID': stateID,
                    'email': email,
                    'givenName': firstName,
                    'surname': lastName,
                    'birthday': birthday,
                    'authTypeID': ck12AuthID,
                    'creationTime': now,
                    'updateTime': now,
                    'login': login,
                    'token': token,
                }
                api._createMember(self.session, **data)
                if verbose:
                    print '%s, %s, %s, %s, %s, %s, %s, %s' % (sid, firstName, lastName, birthday, email, login, password, message)
            finally:
                l.write('%s,%s,%s,%s,%s,%s,%s,%s\n' % (sid, firstName, lastName, birthday, email, login, password, message))
        self.session.commit()


if __name__ == "__main__":
    import optparse

    class OptionParser(optparse.OptionParser):

        def format_description(self, formatter):
            return self.description


    sourceFile = '/tmp/students.csv'
    logFile = '/tmp/students.log'
    prefix = None
    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    #url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

    parser = OptionParser('%prog [options]', description=
"""Upload student information from a CSV file.
The required fields are: student ID, first name, last name, birthday, and email
The optional fields are: user name, and password

For example:
  s1001,John,Smith,20080808,john.smith@gmail.com
  s1002,Bob,Doe,20001010,bog.doe@yahoo.com,bob.doe@yahoo.com,secret

If email is empty, this tool will generate a fake one.
When password and/or user name are missing, this tool will generate them.

Records will be skipped for those emails or user names that already exist.
""")
    parser.add_option(
        '-d', '--dest', dest='url', default=url, action='store',
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--source-file', dest='sourceFile', default=sourceFile, action='store',
        help='Location of the user file to be imported. Defaults to %s' % sourceFile
    )
    parser.add_option(
        '-l', '--log-file', dest='logFile', default=logFile, action='store',
        help='Location of the log file. Defaults to %s' % logFile
    )
    parser.add_option(
        '-p', '--prefix', dest='prefix', default=prefix, action='store',
        help='Prefix of the generating logins (user names) and fake emails for this group of students. It should be unique for each school. One convention is to use the initials of the state, city and school name. For example, caf.msjh for California Fremont Mission San Jose High'
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
    prefix = options.prefix
    url = options.url
    verbose = options.verbose

    if not prefix:
        print 'Missing prefix.'
        exit()

    if verbose:
        print 'Uploading students from %s to %s' % (sourceFile, url)
    UploadUsers(url, verbose).process(sourceFile, logFile, prefix)
