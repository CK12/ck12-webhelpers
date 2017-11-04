from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

import flx.lib.helpers as h
from flx.model import meta
from flx.model import model, init_model, getSQLAlchemyEngines
from flx.model import api

class FixEmptyStudyTrack:

    def __init__(self, url):
        config = h.load_pylons_config()
        if meta.engine is None:
            engines = getSQLAlchemyEngines(config)
            init_model(engines)
        self.session = meta.Session()
        self.engine = meta.engine

    def fix(self, verbose=True):
        #
        #  Rebuild/Recover.
        #
        self.session.begin()
        select = 'SELECT ac.id, a.id FROM ArtifactAndChildren ac, Artifacts a WHERE a.artifactTypeID = 55 AND ac.childID = a.id AND ( SELECT count(*) FROM ArtifactAndChildren aac WHERE a.id = aac.id ) = 0 ORDER BY a.id, ac.id DESC'
        rows = self.engine.execute(select)
        totalCount = rows.rowcount
        if verbose:
            print('There are %d matches.' % totalCount)

        stSet = set()
        fixCount = 0
        skipCount = 0
        for aid, stid in rows:
            if stid in stSet:
                continue
            studyTrack = api._getArtifactByID(self.session, id=stid)
            query = self.session.query(model.MemberStudyTrackItemStatus.studyTrackItemID).distinct()
            query = query.filter(model.MemberStudyTrackItemStatus.assignmentID == aid)
            itemIDs = query.all()
            if itemIDs and len(itemIDs) > 0:
                arid = studyTrack.revisions[0].id
                arrList = []
                s = 0
                success = True
                for itemID, in itemIDs:
                    car = api._getArtifactRevisionByArtifactID(self.session, artifactID=itemID)
                    if not car:
                        if verbose:
                            print('\tArtifact %d has no revision, skip.' % itemID)
                        success = False
                        skipCount += 1
                        break
                    s += 1
                    data = dict(artifactRevisionID=arid, hasArtifactRevisionID=car.id, sequence=s)
                    arr = model.ArtifactRevisionRelation(**data)
                    arrList.append(arr)
                if success and len(arrList) > 0:
                    if verbose:
                        print('Creating ArtifactRevisionRelations %d, %d:' % (studyTrack.id, arid), end='')
                    first = True
                    for arr in arrList:
                        self.session.add(arr)
                        if first:
                            first = False
                        else:
                            if verbose:
                                print(',', end='')
                        if verbose:
                            print(' %d' % arr.hasArtifactRevisionID, end='')
                    stSet.add(stid)
                    fixCount += 1
                    if verbose:
                        print('')
        self.session.commit()
        if verbose:
            print('Fixed %d study tracks out of %d, skipped %d' % (fixCount, totalCount, skipCount))
        #
        #  Cleanup.
        #
        self.session.begin()
        select = 'SELECT a.id FROM Artifacts a WHERE a.artifactTypeID = 55 AND ( SELECT count(*) FROM ArtifactAndChildren aac WHERE a.id = aac.id ) = 0'
        rows = self.engine.execute(select)
        totalCount = rows.rowcount
        if totalCount == 0:
            if verbose:
                print('There are no more empty study tracks.')
        else:
            if verbose:
                print('There are still %d empty study tracks.' % totalCount)

            if verbose:
                print('Deleting ', end='')
            first = True
            for aid, in rows:
                if first:
                    first = False
                elif verbose:
                    print(',', end='')
                try:
                    with self.session.begin_nested():
                        statement = 'delete from AbuseReports where artifactID = %d' % aid
                        self.engine.execute(statement)
                        statement = 'delete from MemberViewedArtifacts where artifactID = %d' % aid
                        self.engine.execute(statement)
                        statement = 'delete from ArtifactAuthors where artifactID = %d' % aid
                        self.engine.execute(statement)
                        statement = 'delete from ArtifactRevisions where artifactID = %d' % aid
                        self.engine.execute(statement)
                        statement = 'delete from Artifacts where id = %d' % aid
                        self.engine.execute(statement)
                    if verbose:
                        print(' %d' % aid, end='')
                except Exception as e:
                    if verbose:
                        print(' [%d]:<%s>' % (aid, str(e)), end='')
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    verbose = options.verbose

    if verbose:
        print('Fix empty study tracks.')

    a = FixEmptyStudyTrack(url)
    a.fix(verbose)
