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

class ConceptNodeArtifact:

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

    def getMember(self, id=1):
        if verbose:
            print('Getting member:', end='')
        query = self.session.query(model.Member)
        query = query.filter_by(id = id)
        member = query.one()
        if verbose:
            print(', [%s]' % member)
        return member

    def getDomains(self):
        if verbose:
            print('Getting domain list', end='')
        query = self.session.query(model.BrowseTerm)
        query = query.filter_by(termTypeID = 4)
        domains = query.all()
        if verbose:
            print(', count[%s]' % len(domains))
        return domains

    def createArtifacts(self):
        creator = self.getMember()
        domains = self.getDomains()

        if verbose:
            print('Creating', end='')
        count = 0
        self.session.begin()
        for domain in domains:
            if not domain.encodedID:
                continue
            domainID = domain.id
	    artifact = api._getArtifactByEncodedID(self.session, domain.encodedID, typeName='domain')
	    if artifact:
		continue
            if not domain.handle:
                continue
            kwargs = {
                'name': domain.name,
                'description': domain.description,
                'encodedID': domain.encodedID,
                'handle': domain.handle,
                'typeName': 'domain',
                'creator': creator,
                'browseTerms': [ { 'browseTermID': domain.id } ],
            }
            artifact = api._createArtifact(self.session, **kwargs)
            count += 1
            if (count % 100) == 0:
                if verbose:
                    print(':%d' % count, end='')
        self.session.commit()
        if verbose:
            print(':%d Done.' % count)

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'

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
        print('Create concept node artifacts')

    c = ConceptNodeArtifact(url)
    c.createArtifacts()
