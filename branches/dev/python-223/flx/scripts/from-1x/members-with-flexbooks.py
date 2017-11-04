from __future__ import print_function

import logging
import os
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import get1xinfo as f

class From1xBookMember(f.Model):
    pass

class From1xBook(f.Model):
    pass

class Member(f.Model):
    pass

class FlexbookMember:

    def __init__(self, url1x, url):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.fu = f.FlexrUtil(url1x)

        bookMemberMapper = orm.mapper(From1xBookMember, meta.From1xBookMembers)
        bookMemberMapper = orm.mapper(From1xBook, meta.From1xBooks)
        memberMapper = orm.mapper(Member, meta.Members)

    def create(self, what, **kwargs):
        instance = what(**kwargs)
        self.session.add(instance)
        return instance

    def getMember(self, email):
        query = self.session.query(Member)
        query = query.filter_by(email = email)
        return query.one()

if __name__ == "__main__":
    import optparse

    url1x = 'mysql://dbadmin:ck123@skylab.ck12.org:3306/flexr?charset=utf8'
    url = 'mysql://dbadmin:D-coD#43@thejas-dev-2.ck12.org:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-s', '--src', dest='url1x', default=url1x,
        help='The URL for connecting to the 1.x database. Defaults to %s' % url1x
    )
    parser.add_option(
        '-d', '--dest', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-e', '--email', dest='email', default=None,
        help='The URL for connecting to the 2.0 database.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url1x = options.url1x
    url = options.url
    email = options.email
    verbose = options.verbose

    if verbose:
        print('Populating 1.x members that have flexbooks or chapters.')

    fbm = FlexbookMember(url1x, url)
    flexr = fbm.fu.getFlexr()
    if email:
        users = [ flexr.getUser(email) ]
        if verbose:
            print('Processing %s.' % email)
    else:
        users = flexr.getUsersWithBooks()
        if verbose:
            print('There are %d users with books or chapters.' % len(users))

    from sqlalchemy.orm import exc

    memberDict = {}
    missedList = []
    count = 0
    n = 0
    fbm.session.begin()
    for user in users:
        try:
            member = fbm.getMember(user.email)
            if memberDict.get(member.id) is None:
                data = { 'memberID': member.id, 'memberID1x': user.id, 'status': 'Not Started' }
                fbMember = fbm.create(From1xBookMember, **data)
                memberDict[member.id] = 1
                count += 1
                if verbose:
                    if (count % 100) == 0:
                        print('%d' % n, end='')
                        n += 1
                if (count % 1000) == 0:
                    #
                    #  Commit every 1000. It will take too long to commit
                    #  everything in 1 transaction.
                    #
                    fbm.session.commit()
                    if verbose:
                        print('= %d =' % count, end='')
                    n = 0
                    fbm.session.begin()
        except exc.NoResultFound:
            missedList.append(user.email)
        except Exception, e:
            print('Unable to create for member[%s] exception[%s]' % (member, e))
            fbm.session.rollback()
            fbm.session.begin()
    print('')
    fbm.session.commit()
    if verbose:
        print('total=%d' % count)
    for n in range(0, len(missedList)):
        print('%s not in 2.0.' % missedList[n])
