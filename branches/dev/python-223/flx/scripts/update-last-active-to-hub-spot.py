from __future__ import print_function

import logging
import os
import sys

from datetime import datetime, timedelta
from hapi.forms import FormSubmissionClient
from sqlalchemy.sql import and_

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model
from flx.model import api
from flx.lib.helpers import safe_encode

class UpdateLastActive2HubSpot:

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
        self.fsc = FormSubmissionClient(api_key=api_key)

    def getQualifiedMembers(self, start, end, roleID=None):
        query = self.session.query(model.Member)
        query = query.filter(and_(model.Member.loginTime >= start, model.Member.loginTime < end))
        if roleID:
            query = query.join(model.MemberHasRole, model.MemberHasRole.memberID == model.Member.id)
            query = query.filter(model.MemberHasRole.roleID == roleID)
        members = query.all()
        return members

    def updateHubSpot(self, day, role=None):
        import time

        try:
            start = time.strptime(day, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            start = time.strptime(day, '%Y-%m-%d')
        start = datetime.fromtimestamp(time.mktime(start))
        end = start + timedelta(days=1)
        if verbose:
            print('from[%s] to[%s]' % (start, end))

        self.session.begin()
        roleID = None
        if role:
            role = role.lower()
        #
        #  Get teacher role id.
        #
        memberRoles = api._getMemberRoles(self.session)
        roleNameDict = {}
        for memberRole in memberRoles:
            id = memberRole.id
            name = memberRole.name
            if role and role == name:
                roleID = id
            roleNameDict[name] = id
        teacher = roleNameDict['teacher']
        #
        #  Get qualified members.
        #
        members = self.getQualifiedMembers(start, end, roleID=roleID)

        if verbose:
            print('Uploading %d members:' % len(members), end='')
        count = 0
        for member in members:
            from urllib import quote

            role = 'student'
            for r in member.roles:
                if r.roleID == teacher:
                    role = 'teacher'
                    break
            name = quote(member.name.encode('utf-8'))
            email = quote(member.email.encode('utf-8'))
            creationTime = quote(str(member.creationTime))
            loginTime = quote(str(member.loginTime))
            data = 'name=%s&email=%s&roleID=%s&date_of_registration=%s&last_active=%s' % (name, email, role, creationTime, loginTime)
            if verbose:
                print(' %s' % member.email, end='')
            options = {}
            result = self.fsc.submit_form(self.hubID, self.formGUID, data, **options)
            count += 1
            if (count % 100) == 0:
                if verbose:
                    print(':%d' % count, end='')
        self.session.commit()
        if verbose:
            print(':%d Done.' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    day = datetime.today() - timedelta(days=1)
    day = day.strftime('%Y-%m-%d')
    role = None

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
        '-r', '--role', dest='role', default=role,
        help='If specified, only members of this role will be processes. They are either "student" or "teacher".'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    day = options.day
    role = options.role
    verbose = options.verbose

    if verbose:
        print('Update last active members to Hub Spot')

    c = UpdateLastActive2HubSpot(url)
    c.updateHubSpot(day, role)
