from flx.model import model
from sqlalchemy import desc
import zlib
import hashlib
import logging
log = logging.getLogger(__name__)

class ContentDataManager(object):
    
    @staticmethod
    def hasContentChanged(session, memberDO, resourceURI, xhtml):
        md5 = hashlib.md5()
        md5.update(xhtml)
        localChecksum = md5.hexdigest()
        dbChecksum = session.query(model.Content.checksum) \
                                .filter(model.Content.resourceURI == resourceURI) \
                                .filter(model.Content.ownerID == memberDO.id) \
                                .order_by(desc(model.Content.contentRevisionID)) \
                                .limit(1) \
                                .scalar()
        log.debug('ContentDataManager::hasContentChanged db checksum: %s; local check sum: %s', dbChecksum, localChecksum)
        return localChecksum != dbChecksum
    
    
    @staticmethod
    def updateContent(session, memberDO, resourceURI, xhtml):
        contentRevisionDO = model.ContentRevision(log="")
        session.add(contentRevisionDO)
        session.flush()
        md5 = hashlib.md5()
        md5.update(xhtml)
        checksum = md5.hexdigest()
        xhtml = zlib.compress(xhtml)
        contentDO = model.Content(resourceURI=resourceURI, ownerID=memberDO.id,
                                  contentRevisionID=contentRevisionDO.id, contents=xhtml,
                                  checksum=checksum, compressed=True)
        session.add(contentDO)
        session.flush()
        return contentRevisionDO.id
    
    
    @staticmethod
    def getContent(session, ownerID, resourceURI, revNo):
        c = session.query(model.Content) \
                            .filter(model.Content.resourceURI == resourceURI) \
                            .filter(model.Content.ownerID == ownerID) \
                            .filter(model.Content.contentRevisionID == revNo) \
                            .scalar()
        content = None
        if c is None:
            content = None
        elif c.compressed:
            content = zlib.decompress(c.contents)
        else:
            content = c.contents
        log.debug('getContent: len(content)[%s]' % (len(content) if content else 'None'))
        return content
    
