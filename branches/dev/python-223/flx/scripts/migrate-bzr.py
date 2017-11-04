import logging
import os

from optparse import OptionParser

from flx.model import meta
from flx.model import model
from flx.model.migrate import Migrate

log = logging.getLogger(__name__)

class Bzr2DB(Migrate):
    Contents = None

    def createFile(self, path, m, buf):
        dirName = os.path.dirname(path)
        if not os.path.exists(dirName):
            os.makedirs(os.path.dirname(path))
        if os.path.exists(path):
            log.debug('Updating %s' % path)
            f = open(path, 'w')
            try:
                f.write(buf)
            finally:
                f.close()
        else:
            log.debug('Creating %s' % path)
            f = os.open(path, os.O_CREAT|os.O_RDWR, int(m, 8))
            try:
                os.write(f, buf)
            finally:
                os.close(f)

    def createRevision(self, session, rev, msg):
        cr = model.ContentRevision(id=rev, log=msg)
        session.add(cr)
        log.debug('contentRevision[%s]' % cr)

    def createEntry(self, session, name, ownerID, rev, buf, md5):
	query = session.query(model.Resource)
	items = name.split('.')
	query = query.filter_by(uri = items[0])
	query = query.all()
	if query != None and len(query) > 0:
	    name = items[0]
	else:
	    query = session.query(model.Resource)
	    query = query.filter_by(uri = name)
	    query = query.all()
	    if query == None or len(query) == 0:
		print 'No resource matching %s' % name
		log.debug('No resource matching %s' % name)
		return

        md5.update(buf)
        c = model.Content(resourceURI=name,
                          ownerID=ownerID,
                          contentRevisionID=rev,
                          contents=buf,
                          checksum=md5.hexdigest())
        session.add(c)
        log.debug('Content name[%s] rev[%s]' % (name, rev))

    def migrate(self, bzrExportFile, rootPath):
        import hashlib

        md5 = hashlib.md5()
        session = meta.Session
        f = open(bzrExportFile, 'r')
        try:
            inTx = False
            isContent = False
            line = f.readline()
            while len(line) > 0:
                l = line.split(' ')
                if l[0] == 'mark':
                    session.begin()
                    inTx = True
                    rev = l[1].lstrip(':').rstrip()
                    isMessage = True
                elif l[0] == 'M':
                    if l[2] == 'inline':
                        isContent = True
                        m = l[1]
                        d = l[3].rstrip()
                elif l[0] == 'data':
                    size = int(l[1])
                    buf = f.read(size)
                    if isContent:
                        p = d.split('/')
                        ownerID = p[-2]
                        name = p[-1]
                        if name.endswith('.xhtml'):
                            path = os.path.join(rootPath, d)
                            self.createFile(path, m, buf)
                            self.createEntry(session, name, ownerID, rev, buf, md5)
                            isContent = False
                    elif isMessage:
                        log.debug('Message[%s] for revision %s' % (buf, rev))
                        self.createRevision(session, rev, buf)
                        isMessage = False
                elif l[0] == 'commit' and l[0] != 'committer':
                    if inTx:
                        log.debug('Committing rev[%s]' % rev)
                        session.commit()
                        inTx = False
                        log.debug('Committed rev[%s]' % rev)
                line = f.readline()
        finally:
            if inTx:
                rev = str(int(rev) + 1)
                log.debug('Committing rev[%s]' % rev)
                session.commit()
                log.debug('Committed rev[%s]' % rev)
            f.close()

if __name__ == "__main__":
    def setupArgs(configFile):
        parser = OptionParser(description='Migrate from Bazaar to MySQL')
        parser.add_option('--config-file', dest='configFile', type=str, help='Location of config file (optional), defaults to %s' % configFile)
        parser.add_option('--bzr-export-file', dest='bzrExport', type=str, help='Bazaar export file')
        parser.add_option('--dest', dest='dest', type=str, help='Root of exported location')
        return parser

    configFile = '/opt/2.0/flx/pylons/flx/development.ini'

    parser = setupArgs(configFile)
    (options, args) = parser.parse_args()
    if not options.configFile:
        options.configFile = configFile
    log.debug('configFile[%s]' % options.configFile)
    if not options.bzrExport:
        raise Exception('Bazaar export file location must be provided')
    log.debug('bzrExport[%s]' % options.bzrExport)
    if not options.dest:
        raise Exception('Exported location must be provided')
    log.debug('dest[%s]' % options.dest)

    import ConfigParser

    config = ConfigParser.ConfigParser()
    config.read(options.configFile)
    url = config.get('app:main', 'sqlalchemy.url')
    log.debug('url[%s]' % url)
    b2d = Bzr2DB(url)
    b2d.migrate(options.bzrExport, options.dest)
