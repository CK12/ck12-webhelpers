"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""
# Import helpers as desired, or define your own, ie:
#from webhelpers.html.tags import checkbox, password
from pylons.i18n.translation import _ 
import os
import logging
from pylons import config
from pylons import url as _url
import socket
import re
from tempfile import NamedTemporaryFile
"""
try:
    from PIL import Image, ImageFont, ImageDraw
except:
    import Image, ImageFont, ImageDraw
"""
import shutil, hashlib
from datetime import datetime, date
from bson.objectid import ObjectId

from flx.lib.localtime import Local

## Following imports are used in templates - DO NOT REMOVE

log = logging.getLogger(__name__)

EMBEDED_PROVIDERS = {               #[<list of regex for URL match> , <oembed endpoint>, <supported format>]
                    'youtube.com': ['youtube.com/.+','http://www.youtube.com/oembed','json'],
                    'www.schooltube.com': ['http://www.schooltube.com/video/.+','http://www.schooltube.com/oembed.xml','xml'],
                    'vimeo.com': ['http://vimeo.com/.+','http://vimeo.com/api/oembed.xml','xml'],
                    'www.ted.com': ['http://www.ted.com/talks/.+','http://www.ted.com/talks/oembed.xml','xml'],
                    'www.scribd.com': ['http://www.scribd.com/doc/.+','http://www.scribd.com/services/oembed/','json'],
                    'www.slideshare.net': ['http://www.slideshare.net/.+/.+','http://www.slideshare.net/api/oembed/2','json'],
                    'www.thinglink.com': ['www.thinglink.com/scene/+','https://www.thinglink.com/api/oembed','json'],
                    'www.teachertube.com': ['http://www.teachertube.com/video/.+','http://api.embed.ly/1/oembed','json']
                    }

ALLOWED_ATTACHMENT_EXTENSIONS = [ 
    '.doc', '.docx', '.odt', '.dot', '.dotx', '.txt', '.ott',
    '.ppt', '.pptx', '.odp', '.otp', '.pps', '.pot', '.potx', '.ppsx', '.swf',
    '.xls', '.xlsx', '.ods', '.xlt', '.xltx', '.ots',
    '.zip', '.pdf', '.tar', '.tgz', '.gz',
    '.epub', '.mobi',
    '.key', '.keynote',
    '.numbers', '.pages',
    '.png', '.jpg', '.jpeg', '.bmp', 
    '.cdf', '.flv',
    '.mp4', '.mp3',
    '.html'
    ]

##
## Exceptions
##
class InvalidImageException(Exception):
    """
        Invalid image endpoints in the HTML
    """
    pass

class MaliciousFileException(Exception):
    """
        Malicious File content
    """
    pass

level1BucketSize = 1024*1024
level2BucketSize = 1024

def getBucketPath(relPath, id=None):
    """
        Use a 2-level bucket for allowing a huge amount of ids.

        relPath     The relative path to form the VCS path.
        id          The member identifer. If not given, then it's embedded in
                    the relPath as 'id/...'. If not, then nothing will be done.

        It will return a path in the form of:

            <level 1 bucket number>/<level 2 bucket number>/id/fileName
    """
    if id is None:
        id = relPath.split(os.path.sep)[0]
        if id == relPath:
            return relPath
        #
        #  The remaining part without the id.
        #
        dirList = relPath.split(os.path.sep)[1:]
        relPath = ''
        for dir in dirList:
            relPath = os.path.join(relPath, dir)

    if type(id) is str:
        id = int(id)

    level1Bucket = id / level1BucketSize
    level2Bucket = (id - level1Bucket*level1BucketSize) / level2BucketSize
    path = '%s/%s/%s/%s' % (level1Bucket, level2Bucket, id, relPath)
    log.info("Bucket path: %s" % path)
    return path

def makedirs(path, startFromRoot=False):
    """
        Add a new path with one or more non-existent directories.
    """
    dirPath = ''
    if startFromRoot:
        dirPath = '/'
    path = os.path.dirname(path)
    dirList = path.split(os.path.sep)
    dirCreated = False
    for dir in dirList:
        if dir == '':
            continue
        dirPath = os.path.join(dirPath, dir)
        if not os.path.exists(dirPath):
            os.mkdir(dirPath, 0755)
            dirCreated = True

    return dirCreated

dataDir = None
def getDataPath(relPath, id=None):
    """
        Return the data directory together with bucket path.
        Also create non-existing directories.
    """
    global dataDir
    if dataDir is None:
        dataDir = config.get('data_dir')
    path = os.path.join(dataDir, getBucketPath(relPath, id=id))
    makedirs(path)
    return path

def saveUploaded(uri, file):
    """
        Save the uploaded contents to the given file.
    """
    shutil.copyfileobj(uri.file, file)
    uri.file.close()

def saveUploadedToTemp(uri):
    """
        Save the uploaded contents to a temporary file
    """
    import shutil
    tempfd = NamedTemporaryFile()
    tempFile = tempfd.name
    tempfd.close()
    tempFilefd = open(tempFile, 'w')
    shutil.copyfileobj(uri.file, tempFilefd)
    tempFilefd.close()
    uri.file.seek(0, 0)
    #uri.file.close()
    return tempFile

def demoteH2s(xhtml):
    lxhtml = xhtml.lower()
    if '<h1 ' in lxhtml or '<h1>' in lxhtml:
        demoteLevel = 2
    elif '<h2 ' in lxhtml or '<h2>' in lxhtml:
        demoteLevel = 1
    else:
        return xhtml

    def replaceHeaders(m):
        level = int(m.group(2)) + demoteLevel
        if level > 6:
            level = 6
        log.info("New Level: %d" % level)
        return '<' + m.group(1) + 'h' + str(level) + m.group(3) + '>'

    h_re = re.compile(r'<(/?)h([123456])([^<>]*)>', re.I)
    xhtml = h_re.sub(replaceHeaders, xhtml)
    return xhtml

def genURLSafeBase64Encode(string, strip=True, usePrefix=True):
    """ Returns a URL-safe Base64 encode of the string with '=' replaced with
    '_' after the encode. """
    if not string:
        return string
    from base64 import urlsafe_b64encode
    if strip:
        string = string.strip()
    if not isinstance(string, str):
        string = string.encode('utf-8')
    string = urlsafe_b64encode(string).replace('=', '.')
    if usePrefix:
        string = 'x-ck12-%s' % string
    return string

def genURLSafeBase64Decode(encoded_string, hasPrefix=True):
    """ Returns the decoded string of the base64 encode generated by
    genURLSafeBase64Encode function. """
    if not encoded_string:
        return encoded_string
    from base64 import urlsafe_b64decode
    if hasPrefix:
        encoded_string = encoded_string.replace('x-ck12-','')
    if not isinstance(encoded_string, str):
        encoded_string = encoded_string.encode('utf-8')
    return urlsafe_b64decode(encoded_string.replace('.', '='))

def load_pylons_config(test_mode=False):
    """
        Loads some parts of pylons configuration for modules outside pylons
    """
    ## Get the production.ini file path
    mydir = os.path.dirname(os.path.abspath(__file__))
    for i in range(1, 3):
        mydir = os.path.dirname(mydir)
    CONFIG_FILE = os.path.join(mydir, "production.ini")

    import ConfigParser

    cfg = ConfigParser.ConfigParser()
    DEV_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'development.ini')
    if os.path.exists(CONFIG_FILE):
        cfg.read(CONFIG_FILE)
    elif os.path.exists(DEV_CONFIG_FILE):
        cfg.read(DEV_CONFIG_FILE)
    elif os.path.exists('/opt/2.0/flx/pylons/flx/production.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/production.ini')
    elif os.path.exists('/opt/2.0/flx/pylons/flx/development.ini'):
        cfg.read('/opt/2.0/flx/pylons/flx/development.ini')
    else:
        raise Exception(safe_encode(_(u"Cannot find %(CONFIG_FILE)s or %(DEV_CONFIG_FILE)s")  % {"CONFIG_FILE":CONFIG_FILE,"DEV_CONFIG_FILE": DEV_CONFIG_FILE}))


    configs = [cfg]
    if test_mode:
        test_cfg = ConfigParser.ConfigParser()
        if os.path.exists(CONFIG_FILE):
            TEST_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'test.ini')
        else:
            TEST_CONFIG_FILE = "/opt/2.0/flx/pylons/flx/test.ini"
        if os.path.exists(TEST_CONFIG_FILE):
            test_cfg.read(TEST_CONFIG_FILE)
        configs.append(test_cfg)


    cf = {}
    for cfg in configs:
        sections = ['DEFAULT', 'app:main', 'server:main']
        for section in sections:
            for name, value in cfg.items(section):
                cf[name] = value
    return cf

def isUploadField(fld):
    if fld is None:
        return False
    log.debug("Type: %s" % type(fld))
    if type(fld) != str and type(fld) != unicode:
        return True
    return False

def url(*args, **kwargs):
    if args and len(args) > 0:
        return unicode(_url(args[0].encode('utf-8'),**kwargs),'utf-8')

    return _url(*args,**kwargs)

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s

def decode_encrypted(s):
    try:
        return safe_decode(s)
    except:
        return s.decode('utf-8', 'ignore')

def checkUrlExists(url):
    from urllib import FancyURLopener
    class CK12Opener(FancyURLopener):
        version = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.124 Safari/534.31'
    if not url:
        return False
    if url.startswith('//'):
        url = 'http:%s' % url
    try:
        opener = CK12Opener().open(url)
        return opener.getcode() < 400
    except Exception as e:
        from M2Crypto.SSL.Checker import WrongHost
        if isinstance(e, WrongHost):
            log.warn("Got an DNS domain name mismatch exception: [%s]. Ignoring ..." % str(e))
            return True
        raise e
    return False

def isFileMalicious(filepath, delete=True):
    global config
    if not config.get('check_for_malicious'):
        config = load_pylons_config()
    check_for_malicious = config.get('check_for_malicious')
    if check_for_malicious != 'true':
        return False
    else:
        import pyclamd
        pyclamd.init_network_socket('localhost', 3310)
        status = pyclamd.scan_file(filepath)
        if status:
            log.error('Malicious file detected: %s' %(status))
            if delete:
                os.remove(filepath)
            raise MaliciousFileException(safe_encode(_(u'Malicious file detected: %(status.values())s') % {"status.values()":status.values()}))
        else:
            log.info('File is free of malicious content.')
            return False

def computeChecksum(contents, isAttachment=False):
    """
        Calculate checksum for given content
        the contents param could be a file object or a string
    """
    ## Compute checksum using sha224
    size = 0
    m = hashlib.sha224()
    if type(contents).__name__ in ['str', 'unicode']:
        m.update(contents)
        size = len(contents)
    else:
        tf = NamedTemporaryFile(delete=False)
        shutil.copyfileobj(contents, tf)
        tf.close()
        size = os.path.getsize(tf.name)
        log.info("Saved file for checksum: %s, size: %d" % (tf.name, size))
        m.update(open(tf.name).read())
        contents.seek(0)
        os.remove(tf.name)
    if isAttachment:
        log.info("computeChecksum: isAttachment: %s" % str(isAttachment))
        m.update(str(isAttachment))
    sum = m.hexdigest()
    log.info("Object checksum: %s" % sum)
    return sum, size

def getConfigOptionValue(option):
    global config
    if not config or not config.has_key('instance'):
        config = load_pylons_config()
    return config.get(option)

def obfuscate(s):
    return s.encode('rot13') if s else None

def deobfuscate(s):
    return s.decode('rot13') if s else None

hostname = None
def getHostname():
    global hostname
    if not hostname:
        hostname = obfuscate(socket.gethostname())
    return hostname

def initTranslator():
    import pylons

    push = False
    if hasattr(pylons, 'translator'):
        typeName = type(pylons.translator).__name__
        log.debug('initTranslator: Found translator: %s' % typeName)
        if typeName not in [ 'NullTranslations', 'GNUTranslations', 'StackedObjectProxy' ]:
            log.debug('initTranslator: Did not find any objects of interest - pushing!')
            push = True
        elif typeName == 'StackedObjectProxy':
            found = False
            objects = None
            try:
                objects = pylons.translator._object_stack()
            except:
                pass
            if objects:
                log.debug('initTranslator: Found StackedObjectProxy: Size: %d' % len(objects))
                for obj in objects:
                    objType = obj.__class__.__name__
                    log.debug('Object: %s, Type: %s' % (obj, objType))
                    if objType in [ 'NullTranslations', 'GNUTranslations' ]:
                        log.debug('initTranslator: Found object of type: %s' % objType)
                        found = True
                        break
            push = not found
    else:
        push = True

    if push:
        #
        #  Set up i18n translator.
        #
        conf = pylons.config.current_conf()
        if not conf['pylons.paths']['root']:
            conf['pylons.paths']['root'] = os.path.abspath('/opt/2.0/flx/pylons/flx/flx')
            if os.name == 'nt':
                conf['pylons.paths']['root'] = os.path.abspath('c:/2.0/flx/pylons/flx/flx')
        if not conf.get('pylons.package'):
            conf['pylons.package'] = 'flx'
        obj = pylons.i18n.translation._get_translator('en')
        pylons.translator._push_object(obj)
        log.info('initTranslator: pushed: %s' % obj)
    log.info('initTranslator: translator[%s]' % pylons.translator)

def toJson(pythonObject):
    if isinstance(pythonObject, datetime):
        pythonObject = pythonObject.replace(tzinfo=Local)
        #return pythonObject.isoformat(' ')
        return pythonObject.isoformat()

    if isinstance(pythonObject, date):
        return pythonObject.isoformat()

    
    from datetime import time

    if isinstance(pythonObject, time):
        return pythonObject.isoformat()

    if type(pythonObject) == ObjectId:
        return str(pythonObject)

    if isinstance(pythonObject, Exception):
        return repr(pythonObject)

    log.error("Cannot jsonify object: %s, type: %s" % (repr(pythonObject), type(pythonObject).__name__))
    raise TypeError(repr(pythonObject) + ' is not JSON serializable')

def getFuncName():
    import inspect

    return inspect.stack()[1][3]

def urlretrieve(uri, filepath):
    from urllib import FancyURLopener
    class CK12Opener(FancyURLopener):
        version = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.124 Safari/534.31'
    return CK12Opener().retrieve(uri, filepath)

