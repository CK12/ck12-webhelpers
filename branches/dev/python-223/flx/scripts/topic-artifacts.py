from __future__ import print_function

import sys

cmdFolder = '/opt/2.0/flx/pylons/flx'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model import model
from flx.model import api
import flx.lib.helpers as h

class TopicArtifact:

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

    def getMember(self, id=1):
        if verbose:
            print('Getting member:', end='')
        query = self.session.query(model.Member)
        query = query.filter_by(id = id)
        member = query.one()
        if verbose:
            print(', [%s]' % member)
        return member

    def createArtifacts(self, force):
        creator = self.getMember()

        if verbose:
            print('Creating ', end='')
        count = -1
        self.session.begin()
        #
        #  Get the root.
        #
        query = self.session.query(model.BrowseTerm)
        query = query.filter_by(termTypeID = 4)
        query = query.filter_by(encodedID = 'CKT')
        root = query.one()
        #
        #  Get the 1st level children.
        #
        children = api._getBrowseTermDescendants(self.session,
                                                 id=root.id,
                                                 levels=1)
        for child in children:
            #
            #  Get the branches (subjects).
            #
            branches = api._getBrowseTermDescendants(self.session,
                                                     id=child.id,
                                                     levels=1)
            for branch in branches:
                #
                #  Get the topics.
                #
                topics = api._getBrowseTermDescendants(self.session,
                                                       id=branch.id,
                                                       levels=1)
                for topic in topics:
                    count += 1
                    artifact = api._getArtifactByHandle(self.session,
                                                        handle=topic.encodedID,
                                                        typeID=55,
                                                        creatorID=creator.id)
                    if artifact:
                        if not force:
                            continue

                    if verbose:
                        if count > 0:
                            print(', ', end='')
                        print('%s[%s]' % (topic.encodedID, topic.id), end='')
                    #
                    #  Get the concept nodes.
                    #
                    browseTerms = api._getBrowseTermDescendants(self.session,
                                                                id=topic.id,
                                                                levels=None)
                    if not browseTerms or len(browseTerms) == 0:
                        if verbose:
                            print('-0', end='')
                        continue
                    #
                    #  Filter out the non-modalities and non-published ones.
                    #
                    eids = [ topic.encodedID ]
                    for browseTerm in browseTerms:
                        eids.append(browseTerm.encodedID)
                    query = self.session.query(model.RelatedArtifactsAndLevels.domainEID).distinct()
                    query = query.filter(model.RelatedArtifactsAndLevels.creatorID == 3)
                    query = query.filter(model.RelatedArtifactsAndLevels.publishTime != None)
                    query = query.filter(model.RelatedArtifactsAndLevels.domainEID.in_(eids))
                    eidList = query.all()
                    if not eidList or len(eidList) == 0:
                        if artifact:
                            query = self.session.query(model.RelatedArtifactsAndLevels.domainEID).distinct()
                            query = query.filter(model.RelatedArtifactsAndLevels.domainEID.in_(eids))
                            e = query.first()
                            if e:
                                print(' d.e[%s]' % e, end='')
                                #
                                #  Remove the supposedly empty study track.
                                #
                                idsDeleted = []
                                api._deleteArtifact(self.session, artifact, idsToDelete=idsDeleted)
                                if artifact.id not in idsDeleted:
                                    print('')
                                    print(' unable to delete existing study track of topic %s[%s], skipping. ' % (artifact.handle, artifact.id))
                                elif verbose:
                                    print('--d', end='')
                                continue

                        if verbose:
                            print('--0', end='')
                        continue
                    eids = []
                    for eid in eidList:
                        eids.append(eid[0])
                    #
                    #  Setup the child artifacts.
                    #
                    children = []
                    for eid in eids:
                        a = api._getArtifactByEncodedID(self.session,
                                                        encodedID=eid,
                                                        typeName='domain')
                        children.append(a)
                    if artifact:
                        #
                        #  Only update the child list.
                        #
                        revision = artifact.revisions[0]
                        if len(children) == len(revision.children):
                            continue
                        print('--%d->%d' % (len(revision.children), len(children)), end='')
                        revisionIDs = []
                        for child in children:
                            revisionIDs.append(child.revisions[0].id)
                        kwargs = {
                            'member': creator,
                            'memberID': creator.id,
                            'artifact': artifact,
                            'artifactID': artifact.id,
                            'children': revisionIDs,
                        }
                        api._updateArtifact(self.session, **kwargs)
                    else:
                        #
                        #  Create the study tracks.
                        #
                        api._createStudyTrack(self.session,
                                              creator=creator,
                                              handle=topic.encodedID,
                                              name=topic.name,
                                              description=topic.description,
                                              nodes=children)
        self.session.commit()
        if verbose:
            print(':%d Done.' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:SeeK#94E03@mysql.master:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--force', action='store_true', dest='force', default=False,
        help='Replace existing artifacts.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    force = options.force
    verbose = options.verbose

    if verbose:
        print('Create topic artifacts')

    c = TopicArtifact(url)
    c.createArtifacts(force)
