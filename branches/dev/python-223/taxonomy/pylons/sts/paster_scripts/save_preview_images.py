from sts.model import api
from sts.model import meta
from pylons import config

import sys
import Cookie

sys.path.append('/opt/2.0/flx/pylons/flx')

from flx.lib.unicode_util import UnicodeDictReader
from flx.controllers.eohelper import HeadRequest, HeadRedirectHandler

import logging
import os, urllib2

log = None


## Initialize logging
def initLog():
    try:
        global log
        if log:
            return log
        LOG_FILENAME = "/tmp/save_preview_images.log"
        log = logging.getLogger(__name__)
        log.setLevel(logging.DEBUG)
        handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=10*1024*1024, backupCount=5)
        log.addHandler(handler)
        return log
    except:
        pass

def login():
    internal_auth_shared_dir = config.get('internal_auth_shared_dir')
    if not internal_auth_shared_dir:
        raise Exception("internal_auth_shared_dir is not set")
    from tempfile import NamedTemporaryFile
    f = NamedTemporaryFile(suffix='.txt', dir=internal_auth_shared_dir, delete=False)
    f.write("1")
    f.close()
    return f.name

def clearBrowseTermCache(encodedID):
    global log
    val = None
    try:
        cookiename = config.get('flx_cookie_name')
        serverUrl = config.get('flx_server_url')
        val = login()
        opener = urllib2.build_opener()
        log.info("Cookie: %s=%s" % (cookiename, os.path.basename(val)))
        opener.addheaders.append(('Cookie', '%s=%s' % (cookiename, val)))
        f = opener.open("%s/invalidate/cache/browseTerm/%s?recursive=true" % (serverUrl, encodedID))
        j = f.read()
        log.debug("Invalidate cache returned: %s" % j)
    except Exception as e:
        log.error("Exception while clearning cache: %s" % str(e), exc_info=e)
    finally:
        if val and os.path.exists(val):
            os.remove(val)

def getLoginCookieObject():
    """
    Get the login Cookie.
    """
    cookiename = config.get('ck12_login_cookie')
    val = login()
    sc = Cookie.SimpleCookie()
    sc[cookiename] = val
    return sc

def run(csvFile):
    log = initLog()
    associateFailures = 0
    associations = 0
    badUrls = []
        
    if not os.path.exists(csvFile):
        raise Exception("No such file: %s" % csvFile)

    cookies = getLoginCookieObject()
    log.info("Loading csvFile: %s" % csvFile)
    csvFiles = [ csvFile ]
    for csvFile in csvFiles:
        if not os.path.exists(csvFile):
            log.error("Cannot process file: %s. It was not found!" % csvFile)
            continue
        meta.Session()
        reader = UnicodeDictReader(open(csvFile, 'rb'))
        rowCnt = 1
        for row in reader:
            rowCnt += 1
            try:
                eid = row.get('EID', '').strip()
                if not eid:
                    raise Exception("No EID specified. Skipping ...")
                log.info("Row[%d]: Processing EID: %s" % (rowCnt, eid))
                imageUrl = row.get('Image URL', '').strip()
                if not imageUrl:
                    raise Exception('No Image URL specified. Skipping ...')

                try:
                    log.info("Checking image: %s" % imageUrl)
                    headOpener = urllib2.build_opener(HeadRedirectHandler())
                    response = headOpener.open(HeadRequest(imageUrl))
                    imageUrl = response.geturl()
                except Exception, e:
                    badUrls.append((eid, imageUrl))
                    log.error("Error making head request: %s" % str(e), exc_info=e)
                    #raise Exception('Cannot resolve image url: %s' % imageUrl)

                subject = branch = domain = None
                if eid.count('.') == 0:
                    subject = api.getSubjectByShortname(shortname=eid)
                    if not subject:
                        raise Exception('Could not find subject for shortname: %s' % eid)
                    if subject.previewImageUrl != imageUrl:
                        kwargs = {'id': subject.id, 'previewImageUrl': imageUrl, 'cookies': cookies }
                        api.updateSubject(**kwargs)
                        clearBrowseTermCache(subject.shortname)
                        log.info("Associated url [%s] for subject: %s" % (imageUrl, subject.shortname))
                        associations += 1

                elif eid.count('.') == 1:
                    shortname = eid.split('.')[1]
                    branch = api.getBranchByShortname(shortname=shortname)
                    if not branch:
                        raise Exception('Could not find branch for shortname: %s' % shortname)
                    if branch.previewImageUrl != imageUrl:
                        kwargs = {'id': branch.id, 'previewImageUrl': imageUrl , 'cookies': cookies}
                        api.updateBranch(**kwargs)
                        clearBrowseTermCache(branch.shortname)
                        log.info("Associated url [%s] for branch: %s" % (imageUrl, branch.shortname))
                        associations += 1

                else:
                    domain = api.getConceptNodeByEncodedID(encodedID=eid)
                    if not domain:
                        eid2 = '.'.join(eid.split('.')[:-2])
                        domain = api.getConceptNodeByEncodedID(encodedID=eid2)
                    if not domain:
                        raise Exception('Could not find concept node for encodedID: %s or %s' % (eid, eid2))

                    if not domain.previewImageUrl or domain.previewImageUrl != imageUrl:
                        kwargs = {'id': domain.id, 'previewImageUrl': imageUrl, 'cookies': cookies}
                        api.updateConceptNode(**kwargs)
                        clearBrowseTermCache(domain.encodedID)
                        log.info("Associated url [%s] for concept node: %s" % (imageUrl, domain.encodedID))
                        associations += 1
                    else:
                        log.info("Already exists association for %s" % domain.encodedID)
            except Exception as e:
                associateFailures += 1
                log.error("ERROR: [%d] Error processing: %s" % (rowCnt, str(e)), exc_info=e)

    if badUrls:
        log.info("==================== BAD URLs (%d) =======================" % len(badUrls))
        for eid, bu in badUrls:
            log.info("%s: %s" % (eid, bu))
        log.info("=====================================================")
    log.info("Done. Processed %d rows" % rowCnt)
    log.info("Rows: %d, associations: %d, associateFailures: %d" % (rowCnt, associations, associateFailures))
