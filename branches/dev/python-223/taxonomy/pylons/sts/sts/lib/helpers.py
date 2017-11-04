"""Helper functions

Consists of functions to typically be used within templates, but also
available to Controllers. This module is available to templates as 'h'.
"""
# Import helpers as desired, or define your own, ie:
#from webhelpers.html.tags import checkbox, password
import os
import logging
from pylons import config, session
from routes import url_for
import traceback
import time
import re
import stat
from tempfile import NamedTemporaryFile
from cookielib import CookieJar
from urllib import urlencode
from urllib2 import urlopen, build_opener, HTTPCookieProcessor
from datetime import datetime
import json
import socket

log = logging.getLogger(__name__)

def formatEncodedID(encodedID):
    if encodedID:
        newID = ''
        parts = encodedID.split('.')
        if not parts:
            return encodedID
        cnt = 0
        for part in parts:
            if newID:
                newID += '.'
            if part.isdigit():
                if cnt == 2:
                    ## The main concept identifier
                    newID += '%03d' % int(part)
                else:
                    newID += part
            else:
                newID += part.upper()
            cnt += 1
        return newID
    return encodedID

def splitEncodedID(encodedID):
    subject = None
    branch = None
    numbers = None
    if encodedID:
        parts = encodedID.split('.')
        if len(parts) > 0:
            subject = parts[0].upper()
        if len(parts) > 1:
            branch = parts[1].upper()
        if len(parts) > 2:
            numbers = '.'.join(parts[2:])
    return subject, branch, numbers

def getEncodedIDForOrdering(encodedID):
    maxLength = int(config.get('max_encode_length', 50))
    subject, branch, numbers = splitEncodedID(encodedID)
    if numbers:
        numberStr = ''.join(numbers.split('.'))
    ret = '%s.%s.%s' % (subject, branch, numberStr)
    return ret.ljust(maxLength, '0')

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
    elif os.path.exists('/opt/2.0/taxonomy/pylons/sts/production.ini'):
        cfg.read('/opt/2.0/taxonomy/pylons/sts/production.ini')
    elif os.path.exists('/opt/2.0/taxonomy/pylons/sts/development.ini'):
        cfg.read('/opt/2.0/taxonomy/pylons/sts/development.ini')
    else:
        raise Exception("Cannot find %(CONFIG_FILE)s or %(DEV_CONFIG_FILE)s"  % {"CONFIG_FILE":CONFIG_FILE,"DEV_CONFIG_FILE": DEV_CONFIG_FILE})


    configs = [cfg]
    if test_mode:
        test_cfg = ConfigParser.ConfigParser()
        if os.path.exists(CONFIG_FILE):
            TEST_CONFIG_FILE = CONFIG_FILE.replace('production.ini', 'test.ini')
        else:
            TEST_CONFIG_FILE = "/opt/2.0/taxonomy/pylons/sts/test.ini"
        if os.path.exists(TEST_CONFIG_FILE):
            test_cfg.read(TEST_CONFIG_FILE)
        configs.append(test_cfg)


    config = {}
    for cfg in configs:
        sections = ['DEFAULT', 'app:main', 'server:main']
        for section in sections:
            for name, value in cfg.items(section):
                config[name] = value
    return config

def saveUploadedFile(request, fileParam, dir=None):
    uploadedFile = request.POST.get(fileParam)
    log.info('File %s [%d bytes]' % (uploadedFile.filename, len(uploadedFile.value)))
    try:
        ## save the file to temp location
        tfile = NamedTemporaryFile(suffix=os.path.basename(uploadedFile.filename), delete=False, dir=dir)
        import shutil
        shutil.copyfileobj(uploadedFile.file, tfile)
        uploadedFile.file.close()
        tfile.close()
        os.chmod(tfile.name, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP | stat.S_IROTH | stat.S_IWOTH)
        return tfile.name
    except Exception, e:
        log.error('Error saving uploaded file to disk: Exception[%s]' % str(e))
        raise e

def safe_encode(s):
    if s and type(s).__name__ == 'unicode':
        return s.encode('utf-8')
    return s

def safe_decode(s):
    if s and type(s).__name__ == 'str':
        return s.decode('utf-8')
    return s

def _restoreCookiesFromSession(cj):
    """
        Copy cookies from session to the request for remote server
    """
    log.info("Taxonomy cookies: %s" % session.get('cookies'))
    if 'cookies' in session:
        for cookie in session['cookies']:
            cj.set_cookie(cookie)
            log.info("Copied cookie: %s" % cookie.name)
    return cj

def storeCookiesToSession(cj):
    """
        Store cookies from remote server response to session
    """
    if not "cookies" in session:
        session['cookies'] = []

    # read all the cookies API response and add them to the session.
    log.info("Cookies: %s" % enumerate(cj))
    for index, cookie in enumerate(cj):
        session['cookies'].append(cookie)
        log.info("Saved cookie: %s" % cookie.name)
    session.save()

def makeRemoteCall(url, params=None, method='POST'):
    serverUrl = config.get('remote_server_url')
    timeout = float(config.get('remote_server_timeout'))
    return _makeRemoteCall(url, serverUrl, timeout, params, method)

def _makeRemoteCall(url, serverUrl, timeout=30, params=None, method='POST'):
    """
        Make call the 2.0 core server for the given API and parameters dict
    """
    try:
        url = url.encode('utf-8')
        remoteUrl = u'%s/%s' % (serverUrl, url)
        log.info("Params: %s" % str(params))

        postBody = None
        if params:
            if method == 'POST':
                postBody = urlencode(params)
            else:
                remoteUrl += '?%s' % urlencode(params)

        log.info("Calling remote url: %s" % remoteUrl)
        cj = CookieJar()
        _restoreCookiesFromSession(cj)
        opener = build_opener(HTTPCookieProcessor(cj))
        start_time = datetime.today()

        if method == 'POST':
            data = opener.open(remoteUrl, postBody, timeout).read()
        else:
            data = opener.open(remoteUrl, None, timeout).read()

        end_time = datetime.today()
        # Make sure we are getting a "response" field in the API response 
        if not "response" in data:
            raise Exception('response field missing in API response')
        storeCookiesToSession(cj)
        delta = end_time - start_time
        log.debug("[%s.%s seconds] %s  " % (delta.seconds, delta.microseconds , url))
        return json.loads(data)
    except Exception, e:
        log.error("Failed called to remote API: %s" % url)
        log.error(traceback.format_exc())
        raise e

def getMeanEncode(encode1, encode2):
    """
        Compute an equidistant mean encode that lies between encode1 and encode2
        Make sure we do not use any extra decimals than we need do
    """
    if not encode1 and not encode2:
        return None

    if encode1 == encode2:
        return None

    #print "Computing mean of: %s, %s" % (encode1, encode2)
    log.info("Computing mean of: %s, %s" % (encode1, encode2))
    if encode1:
        subject, branch, numbers1 = splitEncodedID(encode1)
    if encode2:
        subject, branch, numbers2 = splitEncodedID(encode2)

    if not encode2:
        numbers2 = '1000'
    if not encode1:
        numbers1 = '0'

    ## Break both number parts into integer and decimal parts
    number1parts = numbers1.split('.')
    intpart1 = int(number1parts[0])
    decpart1 = ''
    if len(number1parts) > 1:
        decpart1 = number1parts[1]

    number2parts = numbers2.split('.')
    intpart2 = int(number2parts[0])
    decpart2 = ''
    if len(number2parts) > 1:
        decpart2 = number2parts[1]

    #print intpart1, decpart1, intpart2, decpart2

    mean = numbers1
    ## If int parts differ, try their mean
    if intpart1 < intpart2:
        mean = int((int(intpart1) + int(intpart2))/2)
        mean = '%03d' % mean
        #print "integer mean: %s" % mean
        log.info("integer mean: %s" % mean)

    if float(mean) <= float(numbers1) or float(mean) >= float(numbers2):
        ## since this was an integer mean, the mean could look like the intpart1 due to rounding down
        ## Get the decimal parts - assume extremes if one or both of them are missing
        if not decpart1:
            decpart1 = '0'
        if not decpart2:
            decpart2 = '1'.ljust(len(decpart1)+1, '0')
        ## Make sure decpart2 is bigger than decpart1 by multiplying it by 10 enough times
        while int(decpart1) > int(decpart2):
            decpart2 += '0'

        #print "Decimal parts: %s, %s" % (decpart1, decpart2)
        log.debug("Decimal parts: %s, %s" % (decpart1, decpart2))

        loopCnt = 0
        while float(mean) <= float(numbers1) or float(mean) >= float(numbers2):
            #print "Decimal parts after padding: %s, %s" % (decpart1, decpart2)
            log.debug("Decimal parts after padding: %s, %s" % (decpart1, decpart2))
            mean = int((int(decpart1) + int(decpart2))/2)
            #print "int mean of decimal parts: %d" % mean

            meanStr = '%03d.%s' % (int(intpart1), mean)
            meanStr = meanStr.rstrip('0')
            if float(meanStr) >= float(numbers2):
                ## If the mean is greater than numbers2, we should pad 0s to the left of the decimal part
                ## eg: The mean of MAT.ARI.000 and MAT.ARI.000.1 is MAT.ARI.000.05

                maxlen = max(len(decpart1), len(decpart2))
                meanStr = str(mean).rjust(maxlen, '0')
                meanStr = '%03d.%s' % (int(intpart1), meanStr)
                meanStr = meanStr.rstrip('0')

            mean = meanStr
            #print "Mean so far: %s numbers1: %s" % (mean, numbers1)
            log.debug("Mean so far: %s numbers1: %s" % (mean, numbers1))

            decpart1 += '0'
            decpart2 += '0'

            loopCnt += 1
            if loopCnt > 20:
                mean = None
                raise Exception('Failed calculating mean after 20 interations')

    #print "Mean: %s" % mean
    log.info("Mean: %s" % mean)

    meanEncode = '%s.%s.%s' % (subject, branch, mean)
    return meanEncode

def getConceptInfoQuery(nodeIDs):
    """
    """
    query = '''
        START n = node(%s)
        MATCH sub-[:contains]->br-[:contains]->n<-[?:parent]-parent
        WITH n, sub, br, parent
        MATCH n-[?:parent]->children
        WITH n, sub, br, parent, children
        MATCH psub-[?:contains]->pbr-[?:contains]->parent<-[?:parent]-parent1
        WITH n, sub, br, parent, children, psub, pbr, parent1
        MATCH parent-[?:parent]->children1
        WITH n, sub, br, parent, children, psub, pbr, parent1, children1
        WHERE n.nodeType! = 'concept'
        RETURN sub.created, sub.description!,sub.name, sub.previewImageUrl!,sub.shortname,sub.updated!,ID(sub),
        br.bisac!, br.created, br.description!,br.name,br.handle!, br.previewImageUrl!,br.shortname,sub.shortname,br.updated!,ID(br),
        count(children),n.created, n.description!, n.encodedID, n.handle, n.oldHandles?, n.redirectedReferences?, n.keywords,n.name,parent.encodedID!,n.previewImageUrl!,n.previewIconUrl!, 
		n.updated!,n.status!,ID(n),psub.created, psub.description!,psub.name, psub.previewImageUrl!,psub.shortname,psub.updated!,ID(psub),
        pbr.bisac!, pbr.created, pbr.description!,pbr.name,pbr.handle!, pbr.previewImageUrl!,pbr.shortname, psub.shortname,pbr.updated!,ID(pbr),
        count(children1), parent.created, parent.description!, parent.encodedID, parent.handle, parent.oldHandles?, parent.redirectedReferences?, parent.keywords, parent.name,
        parent1.encodedID!, parent.previewImageUrl!, parent.previewIconUrl!, parent.updated!, parent.status!,ID(parent)
    ''' %(nodeIDs)
    return query

def checkValue(value):
    check = True
    if not value.isalnum():
        check = False
    if value.isdigit():
        check = False
    return check

def name2Handle(name):
    handle = None
    if name:
        handle = name.replace(' ', '-')
        handle = handle.replace(',', '')
        handle = handle.replace(':', '')
    return handle

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

def setCORSAndCacheHeaders(request, response):
    originUrl = request.headers['Origin'] if 'Origin' in request.headers else None
    # uncomment this if we want to enable any random domain
    log.debug("setCORSAndCacheHeaders: Method:[%s] Origin:[%s]" % (request.method, originUrl))
    if originUrl:
        # this header is also added from R2 config for *.ck12.org sites
        # the check is to prevent from adding it multiple times
        if "ck12.org" not in originUrl: 
            response.headers['Access-Control-Allow-Origin'] = originUrl
    if request.method == 'OPTIONS':
        # we want to return just the headers and not the complete response
        log.debug("OPTIONS call, returning only headers and no response")
        # cache the options call for 30 days
        response.headers['Access-Control-Max-Age'] = '2592000'
    
    if 'Access-Control-Request-Headers' in request.headers:
        response.headers['Access-Control-Allow-Headers'] = request.headers['Access-Control-Request-Headers']

    log.debug("setCORSAndCacheHeaders: response.headers: [%s]" % str(response.headers))
    setCacheControlHeaders(request, response)

def setCacheControlHeaders(request, response):
    cacheAgeMap = {
        "nocache" : 0,
        "quarter-hourly" : 60 * 15,
        "half-hourly" : 60 * 30,
        "hourly" : 3600,
        "daily" : 3600 * 24,
        "weekly" : 3600 * 24 * 7,
        "biweekly" : 3600 * 24 * 14,
        "monthly" : 3600 * 24 * 30,
        "yearly" : 3600 * 24 * 365
    }
    cacheAge = cacheAgeMap["nocache"]
    
    if 'expirationAge' in request.params:
        expirationAge = request.params.get('expirationAge')

        if request.method == 'OPTIONS':
            expirationAge = "monthly"
        if expirationAge in cacheAgeMap:
            cacheAge = cacheAgeMap[expirationAge]
        else:
            #this should not happen, error in the request
            pass

    ## Removing existing Cache-Control header, if present
    for header in ['Cache-Control', 'Pragma']:
        if header in response.headers:
            del response.headers[header]
    response.cache_expires(seconds=cacheAge)
    log.debug("setCacheControlHeaders: response.headers: [%s]" % str(response.headers))

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

def setSEOHeaders(response):
    response.headers['X-Robots-Tag'] = 'noindex'

