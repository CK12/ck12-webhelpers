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

class ResetArtifact:

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

    def _delete(self, revisions, aSet, dList, verbose=True):
        arSet = set()
        n = 0
        for revision in reversed(revisions):
            if n == 0:
                if verbose:
                    print('%d[%d, %s] Kept' % (n, revision.id, revision.creationTime))
                    for child in revision.children:
                        arSet.add(child.hasArtifactRevisionID)
                n += 1
                continue

            for child in revision.children:
                if child.hasArtifactRevisionID not in arSet:
                    arSet.add(child.hasArtifactRevisionID)
                    query = self.session.query(model.Artifact)
                    query = query.join(model.ArtifactRevision, model.Artifact.id == model.ArtifactRevision.artifactID)
                    query = query.filter(model.ArtifactRevision.id == child.hasArtifactRevisionID)
                    artifact = query.one()
                    self._reset(artifact, aSet, dList, verbose=verbose)
                if verbose:
                    print('child[%d, %d] Delet' % (child.artifactRevisionID, child.hasArtifactRevisionID), end='')
                self.session.delete(child)
                if verbose:
                    print('ed.')
            if revision not in dList:
                dList.append(revision)
            n += 1

    def _reset(self, artifact, aSet, dList, verbose=True):
        if artifact in aSet:
            return

        if verbose:
            print('artifact[%d, %s, %s]' % (artifact.id, artifact.handle, artifact.creationTime))
        aSet.add(artifact)
        self._delete(artifact.revisions, aSet, dList, verbose=verbose)

    def reset(self, artifactID, verbose=True):
        self.session.begin()
        #
        #  Reset the artifact, identified by id, to the
        #  original/initial state.
        #
        query = self.session.query(model.Artifact)
        query = query.filter_by(id=artifactID)
        """
        if verbose:
            print('query[%s]' % query)
        """
        dList = []
        artifact = query.one()
        self._reset(artifact, set(), dList, verbose=verbose)
        self.session.flush()
        for revision in dList:
            query = self.session.query(model.ArtifactRevisionRelation)
            query = query.filter_by(hasArtifactRevisionID=revision.id)
            p = query.all()
            if p:
                #
                #  Don't delete those that are still used by others.
                #
                continue
            query = self.session.query(model.ArtifactRevisionHasResources)
            query = query.filter_by(artifactRevisionID=revision.id)
            query.delete()
            if verbose:
                print('revision[%d, %s] Delet' % (revision.id, revision.creationTime), end='')
            self.session.delete(revision)
            if verbose:
                print('ed.')
        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    artifactID = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-i', '--id', dest='artifactID', default=artifactID,
        help='The artifact ID to be reset.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    artifactID = options.artifactID
    verbose = options.verbose

    if verbose:
        print('Reset artifact to its original/initial state.')

    a = ResetArtifact(url)
    a.reset(artifactID, verbose)
