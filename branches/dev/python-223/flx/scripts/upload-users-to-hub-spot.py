from __future__ import print_function

import sys

from datetime import datetime, timedelta

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta
from auth.model import model
from auth.model import api

class UploadUsers2HubSpot:

    def __init__(self, url, dry, csv):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.dry = dry

        if not dry:
            from hapi.forms import FormSubmissionClient
            import auth.lib.helpers as h

            self.config = h.load_pylons_config()
            self.hubID = self.config.get('hs_hub_id')
            formURL = self.config.get('hs_form_url')
            formAPI = self.config.get('hs_form_api')
            self.formGUID = self.config.get('hs_form_guid')
            self.api = '%s%s%s/%s' % (formURL, formAPI, self.hubID, self.formGUID)
            api_key = self.config.get('hs_api_key')
            self.fsc = FormSubmissionClient(api_key)
        self.csv = csv

    def getQualifiedMembers(self, since, offset, limit):
        query = self.session.query(model.Member)
        query = query.filter(model.Member.creationTime >= since)
        query = query.offset(offset)
        query = query.limit(limit)
        members = query.all()
        return members

    def upload(self, day):
        import time

        try:
            since = time.strptime(day, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            since = time.strptime(day, '%Y-%m-%d')
        since = datetime.fromtimestamp(time.mktime(since))
        if verbose:
            print('since[%s]' % since)

        self.session.begin()
        #
        #  Get teacher role id.
        #
        memberRoles = api._getMemberRoles(self.session)
        roleNameDict = {}
        for memberRole in memberRoles:
            id = memberRole.id
            name = memberRole.name
            roleNameDict[name] = id
        student = roleNameDict['student']
        teacher = roleNameDict['teacher']
        #
        #  Get qualified members.
        #
        count = 0
        offset = 0
        limit = 2000

        if verbose:
            print('Uploading members', end='')
        self.csv.write('id,email,first name,last name,role,signup on\n')
        while True:
            from urllib import quote

            members = self.getQualifiedMembers(since, offset, limit)
            if not members:
                break
            limit = len(members)
            for member in members:
                if member.roles:
                    roles = member.roles
                else:
                    roles = api._getMemberHasRoles(self.session, member.id)
                role = 'member'
                for r in roles:
                    if r.roleID == teacher:
                        role = 'teacher'
                        break
                    if r.roleID == student:
                        role = 'student'
                        break
                firstName = quote(member.givenName.encode('utf-8')) if member.givenName else ''
                lastName = quote(member.surname.encode('utf-8')) if member.surname else ''
                email = quote(member.email.encode('utf-8'))
                creationTime = member.creationTime
                self.csv.write("%d,'%s','%s','%s','%s','%s'\n" % (member.id, email, firstName, lastName, role, creationTime))
                if not self.dry:
                    creationTime = quote(str(creationTime))
                    loginTime = member.loginTime
                    loginTime = quote(str(loginTime))
                    data = 'name=%s&email=%s&roleID=%s&date_of_registration=%s&last_active=%s' % (firstName, email, role, creationTime, loginTime)
                    options = {}
                    self.fsc.submit_form(self.hubID, self.formGUID, data, **options)
            offset += limit
            count += limit
        self.session.commit()
        if verbose:
            print(':Done:%d' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    day = datetime.today() - timedelta(days=1)
    day = day.strftime('%Y-%m-%d')

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--from', dest='day', default=day,
        help='The starting time in the format of YYYY-MM-DD HH:MM:SS or just YYYY-MM-DD'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-r', '--run', action='store_false', dest='dry', default=True,
        help='Turn dry run off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    day = options.day
    dry = options.dry
    verbose = options.verbose

    if verbose:
        print('Upload members to Hub Spot: dry[%s]' % dry)

    csv = open('/tmp/signups-since-%s.csv' % day, 'w')
    try:
        c = UploadUsers2HubSpot(url, dry, csv)
        c.upload(day)
    finally:
        csv.close()
