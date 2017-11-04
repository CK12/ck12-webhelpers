from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from sqlalchemy.sql import distinct, func
from flx.model import meta
from flx.model import model
import flx.lib.helpers as h


class FindTeachersCreatedAssignments:

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
        h.initTranslator()

    def getTeachers(self, verbose=True, since=None):
        if verbose:
            print('Getting members:', end='')
        query = self.session.query(model.Member, func.count(distinct(model.Artifact.id)).label('ac')).distinct()
        query = query.join(model.Artifact, model.Artifact.creatorID == model.Member.id)
        query = query.filter(model.Artifact.artifactTypeID == 55)
        if since:
            from datetime import datetime

            try:
                since = datetime.strptime(since, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                since = datetime.strptime(since, '%Y-%m-%d')
            query = query.filter(model.Artifact.creationTime >= since)
        query = query.group_by(model.Artifact.creatorID)
        members = query.all()
        if verbose:
            print(' [%d]' % len(members))
        return members

    def findTeachers(self, verbose=True, since=None):
        f = open('/tmp/teachers.csv', 'w')
        f.write('id,last name,first name,email,assignment count\n')
        count = 0
        self.session.begin()
        members = self.getTeachers(verbose=verbose, since=since)
        for member, c in members:
            if c < 5:
                continue
            if member.email.endswith('@ck12.org') or member.email.endswith('.ck12.org'):
                continue
            f.write("%d,'%s','%s','%s',%s\n" % (member.id, member.surname, member.givenName, member.email, c))
            count += 1
            if verbose and (count % 1000) == 0:
                print('.', end='')
        self.session.commit()
        if verbose:
            print('Done[%d]' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    since = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-s', '--since', dest='since', default=since,
        help='The starting date time.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    since = options.since
    verbose = options.verbose

    if verbose:
        if since:
            print('Find teachers who created assignments on or after %s.' % since)
        else:
            print('Find teachers who created assignments.')

    c = FindTeachersCreatedAssignments(url)
    c.findTeachers(verbose, since)
