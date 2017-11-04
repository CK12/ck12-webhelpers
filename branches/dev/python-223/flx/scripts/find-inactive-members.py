from __future__ import print_function

import logging
import sys

from datetime import datetime, timedelta

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import auth.lib.helpers as h
from auth.model import meta
from auth.model import model
from auth.model import api

class FindInactiveMembers:

    def __init__(self, url):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()

        self.config = h.load_pylons_config()
        self.hubID = self.config.get('hs_hub_id')
        self.formURL = self.config.get('hs_form_url')
        self.formAPI = self.config.get('hs_form_api')
        self.formGUID = self.config.get('hs_form_guid')
        self.api = '%s%s%s/%s' % (self.formURL, self.formAPI, self.hubID, self.formGUID)
        api_key = self.config.get('hs_api_key')

    def getQualifiedMembers(self, date, roleID, limit):
        query = self.session.query(model.Member)
        query = query.filter(model.Member.loginTime < date)
        query = query.filter(model.Member.stateID == 2)
        query = query.join(model.MemberHasRole, model.MemberHasRole.memberID == model.Member.id)
        query = query.filter(model.MemberHasRole.roleID == roleID)
        query = query.order_by(model.Member.loginTime.desc(), model.Member.id.desc())
        query = query.limit(limit)
        members = query.all()
        return members

    def show(self, date, role, limit, filename):
        import time

        try:
            date = time.strptime(date, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            date = time.strptime(date, '%Y-%m-%d')
        date = datetime.fromtimestamp(time.mktime(date))

        self.session.begin()
        roleID = None
        if role:
            role = role.lower()
        #
        #  Get role id.
        #
        roleID = None
        memberRoles = api._getMemberRoles(self.session)
        for memberRole in memberRoles:
            if role == memberRole.name:
                roleID = memberRole.id
                break
        if not roleID:
            print('Role %s is invalid.' % role)
        #
        #  Get qualified members.
        #
        members = self.getQualifiedMembers(date, roleID=roleID, limit=limit)
        if verbose:
            print('There are %d qualified members ' % len(members), end='')

        count = 0
        with open(filename, 'w') as f:
            for member in members:
                if member.email.endswith('ck12.org'):
                    continue
                f.write('%d, %s, %s, %s, %s\n' % (member.id, member.email, member.givenName, member.surname, member.loginTime))
                count += 1
                if verbose and ( count % 10 ) == 0:
                    print('.', end='')
        self.session.commit()
        if verbose:
            print(':%d Done.' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    date = datetime.today() - timedelta(days=183)
    date = date.strftime('%Y-%m-%d')
    limit = 20000
    role = 'teacher'
    filename = '/tmp/inactive-members.csv'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--filename', dest='filename', default=filename,
        help='If specified, the output filename. Defaults to "/tmp/inactive-members.csv".'
    )
    parser.add_option(
        '-l', '--limit', dest='limit', default=limit,
        help='If specified, the returned entries will be limited to this number. Defaults to 1000.'
    )
    parser.add_option(
        '-r', '--role', dest='role', default=role,
        help='If specified, only members of this role will be processes. They are either "student" or "teacher".'
    )
    parser.add_option(
        '-s', '--since', dest='date', default=date,
        help='For members last logged in before this, in the format of YYYY-MM-DD HH:MM:SS or just YYYY-MM-DD'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    date = options.date
    filename = options.filename
    role = options.role
    limit = options.limit
    verbose = options.verbose

    if verbose:
        print('Get members that has not been logged in since %s' % date)

    c = FindInactiveMembers(url)
    c.show(date, role, limit, filename)
