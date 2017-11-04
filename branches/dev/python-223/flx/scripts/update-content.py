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

class UpdateContent:

    def __init__(self, url, verbose):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.session.begin()
        self.verbose = verbose
        self.count = 0

    def commit(self):
        self.session.commit()

    def update(self, root, limit):
        import hashlib, zlib

        for pathName, dirNames, fileNames in os.walk(os.path.abspath(root)):
            for dirName in dirNames:
                if dirName != '.bzr':
                    self.update(os.path.join(pathName, dirName), limit)
            for fileName in fileNames:
                path = os.path.join(pathName, fileName)
                size = os.path.getsize(path)
                if size > limit:
                    components = pathName.split('/')
                    ownerID = components[-1]
                    self.count += 1
                    print('updating[%d]: ownerID[%s] path[%s] size[%s]' % (self.count, ownerID, path, size), end='')
                    query = self.session.query(model.Content)
                    query = query.filter_by(resourceURI=fileName)
                    query = query.filter_by(ownerID=ownerID)
                    query = query.order_by(model.Content.contentRevisionID.desc())
                    data = query.first()
                    if not data:
                        print(' >>> not found <<<', end='')
                    else:
                        f = open(path)
                        contents = f.read()
                        md5 = hashlib.md5()
                        md5.update(contents)
                        data.checksum = md5.hexdigest()
                        zipped = zlib.compress(contents)
                        unzipped = zlib.decompress(zipped)
                        if contents == unzipped:
                            data.compressed = True
                            data.contents = zipped
                        else:
                            data.compressed = False
                            data.contents = contents
                        self.session.add(data)
                        if self.count % 100:
                            self.session.commit()
                            self.session.begin()
                    print(' - Done')

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'
    root = '/opt/data/bzr'
    limit = 64*1024 - 1

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-r', '--root', dest='root', default=root,
        help='The root path. Defaults to %s' % root
    )
    parser.add_option(
        '-l', '--limit', dest='limit', default=limit,
        help='The size boundary. Defaults to %s' % limit
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    root = options.root
    limit = long(options.limit)
    verbose = options.verbose

    if verbose:
        print('Updating contents')

    c = UpdateContent(url, verbose)
    c.update(root, limit)
    c.commit()
