from __future__ import print_function

import sys
cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta as fmeta
from flx.model import model as fmodel

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import meta as ameta
from auth.model import model as amodel

class MergeMember:

    def _connect(self, url, meta):
        from sqlalchemy import create_engine, orm, MetaData

        meta.engine = create_engine(url)
        sm = orm.sessionmaker(autoflush=False,
                                autocommit=True,
                                bind=meta.engine)
        meta.meta = MetaData()
        meta.Session = orm.scoped_session(sm)
        return meta.Session()

    def __init__(self, aurl, furl):
        self.asession = self._connect(aurl, ameta)
        self.fsession = self._connect(furl, fmeta)

    def getMember(self, mid, model, session):
        query = session.query(model.Member)
        query = query.filter_by(id=mid)
        return query.first()

    def updateMember(self, kmember, dmember, session, table, columnList=[], emailCol=None, mid=None, deleteOnFailure=False):
        for column in columnList:
            query = session.query(table)
            print('%s.%s.%s' % (table.__module__, table.__name__, column), end='')
            if not mid:
                mid = dmember.id
            query = query.filter(getattr(table, column) == mid)
            rows = query.all()
            if rows:
                for row in rows:
                    print('')
                    if emailCol:
                        email = getattr(row, emailCol)
                        with session.begin_nested():
                            if email == dmember.email:
                                setattr(row, emailCol, dmember.email.upper())
                            elif email == kmember.email:
                                setattr(row, emailCol, kmember.email.lower())
                        print('\trow[%s]' % row, end='')
                    else:
                        try:
                            with session.begin_nested():
                                setattr(row, column, kmember.id)
                                session.add(row)
                            print('\trow[%s]' % row, end='')
                        except Exception as e:
                            print('\trow[%s]: Exception[%s], ignored' % (row, str(e)), end='')
                            if deleteOnFailure:
                                try:
                                    with session.begin_nested():
                                        setattr(row, column, dmember.id)
                                        session.delete(row)
                                    print(', deleted', end='')
                                except Exception as de:
                                    print(', fail to delete[%s]' % str(de), end='')
            print('')

    def merge(self, kmid, dmid, verbose=True):
        self.asession.begin()
        kmember = self.getMember(kmid, amodel, self.asession)
        if not kmember:
            raise Exception('No member of id: %s' % kmid)
        dmember = self.getMember(dmid, amodel, self.asession)
        if not dmember:
            raise Exception('No member of id: %s' % dmid)
        #
        #  Merge on flx2.
        #
        self.fsession.begin()
        self.updateMember(kmember, dmember, self.fsession, fmodel.AbuseReport, ['reporterID', 'reviewerID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactAttributer, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactDraft, ['creatorID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactFeedbackAbuseReport, ['memberID', 'reporterMemberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactFeedbackReviewAbuseReport, ['reporterMemberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactFeedback, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactHandle, ['creatorID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ArtifactRevisionFavorite, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.Artifact, ['creatorID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.BlockedMembers, ['memberID', 'blockedBy'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.CampaignMember, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.ConceptMapFeedback, ['memberID', 'reviewer'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.EflexUserDetail, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.Event, ['ownerID', 'subscriberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.From1xBookMember, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.GroupActivity, ['ownerID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.GroupHasMembers, ['memberID'], deleteOnFailure=True)
        self.updateMember(kmember, dmember, self.fsession, fmodel.Group, ['creatorID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.LMSProviderGroupMember, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberAccessTime, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberAuthApproval, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberHasGrades, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberHasSubjects, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberLabel, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberLibraryObject, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberStudyTrackItemStatus, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberViewedArtifact, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.MemberViewedGroupActivity, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.Overlay, ['ownerID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.PublishRequest, ['memberID'])
        #self.updateMember(kmember, dmember, self.fsession, fmodel.Resource, ['ownerID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.SharedArtifact, ['memberID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.Task, ['ownerID'])
        self.updateMember(kmember, dmember, self.fsession, fmodel.TeacherStudentRelation, ['studentID', 'teacherID'])
        #
        #  Change the email of the deactivated account to all upper case.
        #  Change the email of the merged account to all lower case.
        #
        dm = self.getMember(dmid, fmodel, self.fsession)
        dm.email = dm.email.upper()
        if dm.login != dm.defaultLogin:
            dm.login = dm.login.upper()
        self.fsession.add(dm)
        self.asession.commit()
        self.asession.begin()
        km = self.getMember(kmid, fmodel, self.fsession)
        km.email = km.email.lower()
        self.fsession.add(km)
        #self.fsession.rollback()
        self.fsession.commit()
        #
        #  Merge on auth.
        #
        self.updateMember(kmember, dmember, self.asession, amodel.Address, ['memberID'])
        #self.updateMember(kmember, dmember, self.asession, amodel.AdminTrace, ['memberID', 'adminID'])
        self.updateMember(kmember, dmember, self.asession, amodel.CampaignMember, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.MemberExtData, ['memberID'], emailCol='externalID')
        self.updateMember(kmember, dmember, self.asession, amodel.MemberExtData, ['memberID'], emailCol='externalID', mid=kmember.id)
        self.updateMember(kmember, dmember, self.asession, amodel.MemberHasRole, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.MemberLocation, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.MemberSchool, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.OAuthClient, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.OAuthToken, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.PartnerSchoolHasMember, ['memberID'])
        self.updateMember(kmember, dmember, self.asession, amodel.Task, ['ownerID'])
        self.updateMember(kmember, dmember, self.asession, amodel.UnderageEmailToken, ['studentID'])
        self.updateMember(kmember, dmember, self.asession, amodel.UnderageMemberParent, ['memberID'])
        #
        #  Change the email of the deactivated account to all upper case.
        #  Change the email of the merged account to all lower case.
        #
        dmember.email = dmember.email.upper()
        dmember.stateID = 4
        self.asession.add(dmember)
        self.asession.commit()
        self.asession.begin()
        kmember.email = kmember.email.lower()
        self.asession.add(kmember)
        #self.asession.rollback()
        self.asession.commit()

if __name__ == "__main__":
    import optparse

    aurl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'
    furl = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    dmid = None
    kmid = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-a', '--auth', dest='aurl', default=aurl,
        help='The URL for connecting to the 2.0 auth database. Defaults to %s' % aurl
    )
    parser.add_option(
        '-f', '--flx', dest='furl', default=furl,
        help='The URL for connecting to the 2.0 flx database. Defaults to %s' % furl
    )
    parser.add_option(
        '-d', '--deactivate', dest='dmid', default=dmid,
        help='The member id to be merged from.'
    )
    parser.add_option(
        '-k', '--keep', dest='kmid', default=kmid,
        help='The member id to be merged into.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    aurl = options.aurl
    furl = options.furl
    dmid = options.dmid
    kmid = options.kmid
    verbose = options.verbose

    if verbose:
        print('Merging %s into %s.' % (dmid, kmid))

    a = MergeMember(aurl, furl)
    a.merge(kmid, dmid, verbose)
