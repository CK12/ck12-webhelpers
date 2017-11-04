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
from flx.lib.helpers import safe_encode

class SplitConceptResourcets:

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

    def getParents(self, childID, creatorID):
        query = self.session.query(model.Artifact).distinct()
        query = query.join(model.ArtifactAndChildren, model.Artifact.id == model.ArtifactAndChildren.id)
        query = query.filter(model.ArtifactAndChildren.childID == childID)
        parents = query.all()
        pList = []
        for parent in parents:
            if parent.creatorID == creatorID:
                pList.append(parent)
        return pList

    def fix(self, resources=None, memberID=None, atid=4, run=False, verbose=True):
        if not resources:
            self.session.begin()
            query = self.session.query(model.Resource)
            query = query.filter_by(resourceTypeID = 1)
            query = query.join(model.ResourceRevision, model.ResourceRevision.resourceID == model.Resource.id)
            query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
            query = query.join(model.ArtifactRevision, model.ArtifactRevision.id == model.ArtifactRevisionHasResources.artifactRevisionID)
            query = query.join(model.Artifact, model.Artifact.id == model.ArtifactRevision.artifactID)
            query = query.filter(model.Artifact.artifactTypeID == atid)
            query = query.filter(model.Artifact.creatorID == memberID)
            resources = query.all()
        else:
            if verbose:
                print('resources[%s]' % resources)
            resources = api.getResources(self.session, resources)
            self.session.begin()
        if verbose:
            print('There are %d resources to process.' % len(resources))

        r_dict = {}
        for resource in resources:
            r_dict[resource.id] = resource

        count = 0
        for resource in resources:
            member = api._getMemberByID(self.session, resource.ownerID)
            revisions = resource.revisions
            rrList = []
            for revision in revisions:
                rrList.append(revision)
            #
            #  Find artifact revisions that share it.
            #
            query = self.session.query(model.Artifact).distinct()
            query = query.filter_by(creatorID = member.id)
            query = query.join(model.ArtifactRevision, model.ArtifactRevision.artifactID == model.Artifact.id)
            query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.artifactRevisionID == model.ArtifactRevision.id)
            #query = query.filter(model.ArtifactRevisionHasResources.resourceRevisionID.in_(rrList))
            query = query.join(model.ResourceRevision, model.ResourceRevision.id == model.ArtifactRevisionHasResources.resourceRevisionID)
            query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
            query = query.filter(model.Resource.id == resource.id)
            artifacts = query.all()
            if len(artifacts) > 1:
                first = True
                found = False
                aid = -1
                for artifact in artifacts:
                    if first:
                        aid = artifact.id
                        first = False
                    else:
                        if artifact.id != aid:
                            found = True
                            break
                if found:
                    print('%d:' % resource.id, end='')
                    for rr in rrList:
                        print(' %d' % rr.id, end='')
                    print('')
                    splitList = []
                    for artifact in artifacts:
                        ar = artifact.revisions[0]
                        arid = ar.id
                        query = self.session.query(model.ResourceRevision)
                        query = query.join(model.Resource, model.Resource.id == model.ResourceRevision.resourceID)
                        query = query.filter(model.Resource.id == resource.id)
                        query = query.join(model.ArtifactRevisionHasResources, model.ArtifactRevisionHasResources.resourceRevisionID == model.ResourceRevision.id)
                        query = query.filter(model.ArtifactRevisionHasResources.artifactRevisionID == arid)
                        query = query.order_by(model.ResourceRevision.id.desc())
                        resourceRevision = query.first()
                        if resourceRevision:
                            rrid = resourceRevision.id
                            offset = 0
                            for rr in rrList:
                                if rr.id == rrid:
                                    break
                                offset += 1
                            splitList.append((offset, resourceRevision, arid, artifact))
                    total = len(splitList)
                    if total > 1:
                        splitList.sort()
                        for s in range(0, total):
                            offset, rr, arid, artifact = splitList[s]
                            print('\t%d %s %s %s [%s]' % (offset, rr.id, arid, artifact.id, artifact.handle))
                            if s >= total - 1:
                                nextOffset = len(rrList)
                            else:
                                nextOffset = splitList[s + 1][0]
                            if offset == 0 or offset == nextOffset:
                                #
                                #  Let the current resource and resource revision
                                #  still pointing to it, do nothing.
                                #
                                prevArid = arid
                                continue

                            query = self.session.query(model.Content)
                            query = query.filter(model.Content.resourceURI == resource.uri)
                            query = query.filter(model.Content.ownerID == resource.ownerID)
                            query = query.filter(model.Content.contentRevisionID == rr.revision)
                            content = query.first()
                            if not content:
                                print('\tno content for %d, %s' % (rr.id, rr.revision))
                                continue
                            if resource.uri != str(arid):
                                uri = str(arid)
                                content.resourceURI = uri
                            else:
                                uri = str(prevArid)
                                data = {
                                    'resourceURI': uri,
                                    'ownerID': resource.ownerID,
                                    'contentRevisionID': rr.revision,
                                    'contents': content.contents,
                                    'creationTime': content.creationTime,
                                    'checksum': content.checksum,
                                    'compressed': content.compressed,
                                }
                                content = model.Content(**data)
                            self.session.add(content)
                            #
                            #  Create new Resource.
                            #
                            data = {
                                'resourceTypeID': resource.resourceTypeID,
                                'name': resource.name,
                                'handle': uri,
                                'description': resource.description,
                                'authors': resource.authors,
                                'license': resource.license,
                                'uri': uri,
                                'refHash': api._computeReferenceHashForResource(self.session, uri, resource.type.name, member),
                                'ownerID': resource.ownerID,
                                'languageID': resource.languageID,
                                'isExternal': resource.isExternal,
                                'isAttachment': resource.isAttachment,
                                'checksum': content.checksum,
                                'satelliteUrl': resource.satelliteUrl,
                            }
                            nr = model.Resource(**data)
                            self.session.add(nr)
                            nrr = []
                            for r in range(offset, nextOffset):
                                rr = rrList[r]
                                del rr.resourceID
                                nrr.append(rr)
                                self.session.add(rr)
                            nr.revisions = nrr
                            self.session.flush()
                            print('\t\tnew: offset[%s] nextOffset[%s] arid[%s] revision[%s] rid[%s]' % (offset, nextOffset, arid, rr.revision, nr.id))
                        count += 1

        if run:
            self.session.commit()
            print('Resources splitted[%s]' % count)
        else:
            self.session.flush()
            self.session.rollback()
            print('Resources shown[%s]' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/flx2?charset=utf8'
    resources = ''
    member = None
    atid = 4

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-c', '--resources', dest='resources', default=resources,
        help='The resource list, comma separated.'
    )
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-m', '--member', dest='member', default=member,
        help='The member id.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    parser.add_option(
        '-t', '--type', dest='atid', default=atid,
        help='The artifact type id.'
    )
    parser.add_option(
        '-r', '--run', action='store_true', dest='run', default=False,
        help='Actually performance the fix. Defaults to dry run only.'
    )
    options, args = parser.parse_args()

    url = options.url
    resources = options.resources
    member = options.member
    atid = options.atid
    run = options.run
    verbose = options.verbose

    if not resources:
        print('Resource list missing.')
    else:
        resources = concepts.split(',')
    if verbose:
        if run:
            print('Splitting resources with multiple parents.')
        else:
            print('Show resources with multiple parents.')

    c = SplitConceptResourcets(url)
    c.fix(resources, member, atid, run, verbose)
