from __future__ import print_function

import logging
import os
import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model
from flx.model import api
from flx.model.vcs import vcs as v
from flx.lib.helpers import safe_encode

from sqlalchemy.sql import func

class RecreateMemberStudyTrackItemStatus:

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

    def recreate(self, start, end, groupID, verbose=True, dryRun=True):
        self.session.begin()
        #
        #  Get the assignment with due date after the given one.
        #
        query = self.session.query(model.Assignment).distinct()
        if groupID:
            query = query.filter(model.Assignment.groupID == groupID)
        else:
            if start:
                query = query.filter(model.Assignment.due >= start)
            if end:
                query = query.filter(model.Assignment.due <= end)
        query = query.order_by(model.Assignment.assignmentID)
        assignments = query.all()
        if verbose:
            l = len(assignments)
            print('%d assignments need to be processed.' % l)
            if l > 0:
                print('Processing', end='')
        recreatedDict = {}
        count = 0
        itemDict = {}
        for assignment in assignments:
            #
            #  Get the corresponding group members.
            #
            if verbose:
                print(' %s,%s' % (assignment.assignmentID, assignment.groupID), end='')
            groupID = assignment.groupID
            query = self.session.query(model.GroupHasMembers).distinct()
            query = query.filter_by(groupID=groupID)
            query = query.filter_by(roleID=14)
            query = query.order_by(model.GroupHasMembers.memberID)
            ghms = query.all()
            if not ghms:
                if verbose:
                    print('.', end='')
                continue
            gms = []
            for ghm in ghms:
                gms.append(ghm)
            #
            #  Get the study track IDs.
            #
            query = self.session.query(model.ArtifactAndChildren).distinct()
            query = query.filter_by(id=assignment.assignmentID)
            children = query.all()
            for child in children:
                #
                #  Get the items in this study track.
                #
                studyTrackID = child.childID
                if verbose:
                    print(',%s' % studyTrackID, end='')
                query = self.session.query(model.ArtifactAndChildren).distinct()
                query = query.filter_by(id=studyTrackID)
                items = query.all()
                for item in items:
                    itemID = item.childID
                    if verbose:
                        print(':%s' % itemID, end='')
                    for gm in gms:
                        query = self.session.query(model.MemberStudyTrackItemStatus)
                        query = query.filter_by(memberID=gm.memberID)
                        query = query.filter_by(assignmentID=assignment.assignmentID)
                        query = query.filter_by(studyTrackItemID=itemID)
                        entry = query.first()
                        if not entry:
                            item = itemDict.get(itemID, None)
                            if not item:
                                item = api._getArtifactByID(self.session, id=itemID)
                                itemDict[itemID] = item
                            #
                            #  Recreate the entry.
                            #
                            if not dryRun:
                                kwargs = {
                                    'memberID': gm.memberID,
                                    'assignmentID': assignment.assignmentID,
                                    'studyTrackItemID': itemID,
                                    'status': 'incomplete',
                                }
                                api._createMemberStudyTrackItemStatus(self.session, **kwargs)
                            if verbose:
                                print(',%s' % gm.memberID, end='')
                            if not recreatedDict.get(assignment.groupID, None):
                                recreatedDict[assignment.groupID] = {}
                            key = '%s:%s' % (itemID, item.encodedID)
                            if not recreatedDict.get(assignment.groupID).get(key):
                                recreatedDict[assignment.groupID][key] = []
                            recreatedDict[assignment.groupID][key].append(gm.memberID)
                            count += 1
                    if verbose:
                        print(' ', end='')
                if verbose:
                    print(';', end='')
            if verbose:
                print('.', end='')
        self.session.commit()
        if verbose:
            print('')
        print('')
        print('There were %d assignments affected with %d entries recreated.' % (len(recreatedDict.keys()), count))

        """
        for groupID in recreatedDict.keys():
            d = recreatedDict.get(groupID)
            print('%s: %s' % (groupID, d))
        """

        import pprint

        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(recreatedDict)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-g', '--group', dest='groupID', default=None,
        help='For group with given id.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-r', '--run', action='store_false', dest='dryRun', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-s', '--start', dest='start', default='',
        help='From the given due date.'
    )
    parser.add_option(
        '-e', '--end', dest='end', default='',
        help='To the given due date.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    verbose = options.verbose
    dryRun = options.dryRun
    groupID = options.groupID
    start = options.start
    end = options.end

    if dryRun:
        print('This is a dry run.')

    if groupID:
        print('Recreating MemberStudyTrackItemStatus entries for group with id, %s.' % groupID)
    else:
        s = start
        if not start:
            s = 'the beginning'
        e = end
        if not end:
            e = 'now'
        print('Recreating MemberStudyTrackItemStatus entries from %s to %s.' % (s, e))

    a = RecreateMemberStudyTrackItemStatus(url)
    a.recreate(start, end, groupID, verbose, dryRun)
