from __future__ import print_function

import os
import sys

cmdFolder = os.path.dirname(os.path.abspath('/opt/inap/server/inap'))
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from inap.model import meta as imeta
from inap.model import model as imodel
from inap.model import api as iapi
from inap.model import page as p

cmdFolder = os.path.dirname(os.path.abspath(__file__))
cmdFolder = os.path.dirname(cmdFolder)
cmdFolder = os.path.dirname(cmdFolder)
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta as fmeta
from auth.model import model as fmodel
from auth.model import api as fapi

class MigrateMember(object):

    def __init__(self, src, dst, verbose=True):
        from sqlalchemy import create_engine, orm

        imeta.engine = create_engine(src)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              bind=imeta.engine)
        imeta.Session = orm.scoped_session(sm)
        self.srcConn = imeta.engine.connect()
        self.srcSession = imeta.Session()

        fmeta.engine = create_engine(dst)
        sm = orm.sessionmaker(autoflush=False,
                              autocommit=True,
                              bind=fmeta.engine)
        fmeta.Session = orm.scoped_session(sm)
        self.dstConn = fmeta.engine.connect()
        self.dstSession = fmeta.Session()
        self.verbose = verbose

    def getCountries(self):
        #countries = fapi._getCountries(self.dstSession)
        countries = fapi.getCountries()
        countryDict = {}
        countryNameDict = {}
        for country in countries:
            countryDict[country.id] = '%s: %s' % (country.code2Letter, country.name)
            countryNameDict[country.code2Letter] = country.id
        return countryDict, countryNameDict

    def getStates(self):
        #states = fapi._getUSStates(self.dstSession)
        states = fapi.getUSStates()
        stateDict = {}
        for state in states:
            stateDict[state.abbreviation] = state.name
        return stateDict

    def getMemberRoles(self):
        self.dstSession.begin()
        memberRoles = fapi._getMemberRoles(self.dstSession)
        memberRoleDict = {}
        memberRoleNameDict = {}
        for memberRole in memberRoles:
            id = memberRole.id
            name = memberRole.name
            memberRoleDict[id] = name
            memberRoleNameDict[name] = id
        self.dstSession.commit()
        return memberRoleDict, memberRoleNameDict

    def process(self, log=None, dryrun=False, pageSize=1000):
        from datetime import datetime

        roleMap = {
            1: 'admin',
            2: 'mentor',
            3: 'representative',
            4: 'student',
        }
        memberRoleDict, memberRoleNameDict = self.getMemberRoles()
        countryDict, countryNameDict = self.getCountries()
        stateDict = self.getStates()
        self.srcSession.begin()
        query = self.srcSession.query(imodel.Member)
        pageNum = 1
        members = p.Page(query, pageNum, pageSize)
        while members and len(members) > 0:
            self.dstSession.begin()
            count = 0
            for member in members:
                #
                #  Migrate member information to authentication server.
                #
                qry = self.srcSession.query(imodel.MemberExtData)
                qry = qry.filter_by(memberID=member.id)
                qry = qry.filter_by(authTypeID=1)
                ed = qry.first()
                m = fapi._getMemberByEmail(self.dstSession, email=member.email)
                if m:
                    log.write('iNap member%s exists as%s\n' % (member.asDict(), m.infoDict()))
                elif not dryrun:
                    reset = not ed or not ed.token.startswith('sha256:')
                    data = {
                        'stateID': member.stateID,
                        'roleID': memberRoleNameDict[roleMap[member.roleID]],
                        'email': member.email,
                        'givenName': member.name if member.name else 'Anonym',
                        'authTypeID': 1,
                        'creationTime': member.creationTime,
                        'loginTime': member.loginTime,
                        'updateTime': datetime.now(),
                        'token': ed.token if ed else '',
                        'reset': reset,
                    }
                    m = fapi._createMember(self.dstSession, **data)
                    self.dstSession.add(m)
                if not dryrun:
                    #
                    #  Create/Update address.
                    #
                    cid = member.countryID
                    if cid and countryDict.get(cid):
                        locations = None
                        if m.id:
                            locations = fapi._getMemberLocations(self.dstSession, memberID=m.id)
                            if locations and len(locations) > 0:
                                for location in locations:
                                    if cid == location.countryID:
                                        continue
                        state = member.state
                        if state:
                            state = state.strip()
                            if state == '':
                                state = None
                            elif len(state) > 2:
                                state = state[0:2]
                        zip = member.postalCode
                        if zip:
                            zip = zip.strip()
                            if zip == '':
                                zip = None
                            elif len(zip) > 9:
                                zip = zip[0:9]
                        address = fapi._newUSAddress(self.dstSession, state=state, zip=zip)
                        self.dstSession.add(address)
                        self.dstSession.flush()
                        location = fapi._newMemberLocation(self.dstSession,
                                                        memberID=m.id,
                                                        countryID=cid,
                                                        addressID=address.id)
                        self.dstSession.add(location)
                    #
                    #  Store the member id of the authentication server
                    #  into inap.
                    #
                    member.authID = m.id
                    self.srcSession.add(member)
                count += 1
                if (count % 100) == 0:
                    print('.', end='')
            self.dstSession.commit()
            self.srcSession.commit()
            print('%d ' % (pageNum*pageSize), end='')
            pageNum += 1
            self.srcSession.begin()
            members = p.Page(query, pageNum, pageSize)
	self.srcSession.commit()
        print(' Done')


if __name__ == "__main__":
    import optparse

    dryrun = False
    logFile = '/tmp/migrate-inap-member.out'
    src = 'mysql://dbadmin:D-coD#43@localhost:3306/inap?charset=utf8'
    dst = 'mysql://dbadmin:D-coD#43@localhost:3306/auth?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--dryrun', action='store_true', dest='dryrun', default=False,
        help='Dryrun only.'
    )
    parser.add_option(
        '-l', '--logFile', dest='logFile', default=logFile,
        help='The path of the log file. Defaults to %s.' % logFile
    )
    parser.add_option(
        '-s', '--source', dest='src', default=src,
        help='The URL for connecting to the source database. Defaults to %s' % src
    )
    parser.add_option(
        '-t', '--target', dest='dst', default=dst,
        help='The URL for connecting to the target database. Defaults to %s' % dst
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    dryrun = options.dryrun
    logFile = options.logFile
    src = options.src
    dst = options.dst
    verbose = options.verbose

    log = open(logFile, 'w')
    if verbose:
        print('Migrate members.')
    MigrateMember(src, dst, verbose=verbose).process(log=log, dryrun=dryrun)
