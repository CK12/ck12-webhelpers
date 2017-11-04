import logging
from pylons import config
from pylons.i18n.translation import _
import urllib, urllib2
import re
import urlparse
import hashlib
from urlparse import urlparse, parse_qs

from flx.model import api
from flx.model import exceptions as ex
from flx.controllers.resourceHelper import ResourceHelper
from flx.lib.headrequest import HeadRequest, HeadRedirectHandler

log = logging.getLogger(__name__)

#url patterns for various enmbed types

CK12_EMBED_REGEX = re.compile("ck12.org\/embed\/.*?(module=launcher)&.*?(artifactID=([0-9]+))", re.I)

URLPATTERNS = {
        'youtube': re.compile(r"[http:]?//(.*youtube\.edu/.*|.*youtube\.com/embed/.*|.*youtube\.com/watch.*|.*\.youtube\.com/v/.*|.*\.youtube\.com/e/.*|youtu\.be/.*|.*\.youtube\.com/user/.*#.*|.*\.youtube\.com/.*#.*/.*|m\.youtube\.com/watch.*|m\.youtube\.com/index.*)", re.I),
        'schooltube': re.compile(r"http://(www\.schooltube\.com/video/.*/.*|www.schooltube.com/v/.*|www.schooltube.com/embed/.*)", re.I),
        'vimeo': re.compile(r"[http:]?//(www\.vimeo\.com/.*|vimeo\.com/.*|.*\.vimeo\.com/.*)", re.I),
        'teachertube': re.compile(r"[http:]?//(.*teachertube\.com/viewVideo\.php.*|teachertube\.com/viewVideo\.php.*|www\.teachertube\.com/viewVideo\.php.*|www\.teachertube\.com/embedFLV\.php.*|.*\.teachertube\.com/embedFLV\.php.*)", re.I),
        'remoteswf': re.compile(r"[http:]?//(.*?)/(.*?)(\.swf)", re.I),
        'remotevideo': re.compile(r"[http:]?//(.*?)/(.*?)(\.mov|\.mp4|\.flv)", re.I),
        'audio': re.compile(r"[http:]?//(.*?)/(.*?)(\.mp3)", re.I),
        'ck12-embed': CK12_EMBED_REGEX,
}

OBJPATTERNS = {
        'customembed': [re.compile(r'<object(.+?)</object>', re.I), re.compile(r'<embed(.+?)/>', re.I), re.compile(r'<embed(.+?)</embed>', re.I), re.compile(r'<iframe(.+?)/>', re.I), re.compile(r'<iframe(.+?)</iframe>', re.I), re.compile(r'<a(.+?)</a>', re.I), ],
        'applet': [re.compile(r'<applet(.+?)</applet>', re.I), re.compile(r'<applet(.+?)/>', re.I),]
}

# default parameters for select providers and embed types
DEFAULT_PARAMS = {
        'youtube': {'allowfullscreen':'true', 'allowscriptaccess':'true'},
        'schooltube': {'allowfullscreen':'true', 'allowscriptaccess':'true'},
        'teachertube': {'width':400,'height':315, 'allowfullscreen':'true', 'allowscriptaccess':'true'},
        'remotevideo': {'width':400,'height':315,'src':'%slib/player/player.swf' % config.get('MEDIA_URL'), 'allowfullscreen':'true', 'allowscriptaccess':'true'},
        'audio': {'width':400,'height':20,'src':'%slib/player/player.swf' % config.get('MEDIA_URL'), 'allowfullscreen':'false', 'allowscriptaccess':'true'},
}

YOUTUBE_URL = re.compile(r'http://(.*)\.youtube\.com/v/(.+)\?', re.I)
SCHOOLTUBE_URL = re.compile(r'http://www\.schooltube\.com/v/(.+)?', re.I)
TEACHERTUBE_URL1 = re.compile(r'http://(.*)\.teachertube\.com/embedFLV\.php\?pg=video_(\d+)', re.I)
TEACHERTUBE_URL2 = re.compile(r'http://teachertube\.com/(.+)/?', re.I)
YOUTUBE_ID_REGEX = re.compile(r'http[s]?://.*\.youtube\.com/embed/([^ &?]*)', re.I)
IFRAME_REGEX = re.compile('<iframe.*?>[ ]*</iframe>')
SRC_REGEX = re.compile('src="(.*?)"')
FRAMEBORDER_REGEX = re.compile('frameborder[\s]*=[\s]*["\'][^"]["\']')

KNOWN_PROVIDERS_REGEX = re.compile(r'(youtube\.com|schooltube\.com|teachertube\.com)', re.I)

def cleanup(str):
    str = str.replace('\t', ' ')
    str = str.replace('\n', ' ')
    return str

## Regular expressions to get parameters from the code
MOVIE_PARAM_REGEX = re.compile(r'<param name="movie" value="([\w\./:;&#\?=\-_]+)"', re.I)
FULLSCREEN_PARAM_REGEX = re.compile(r'<param name="allowfullscreen" value="([\w\./:;&#\?=]+)"', re.I)
ALLOWSCRIPT_PARAM_REGEX = re.compile(r'<param name="allowscriptaccess" value="([\w\./:;&#\?=]+)"', re.I)
FLASHVARS_PARAM_REGEX = re.compile(r'<param name="flashvars" value="([\w\./:;&#\?=\-_]+)"', re.I)

def parseParams(str):
    src = afs = asc = flashvars = ''
    # remove tabs and newlines
    str = cleanup(str)

    #get movie (source, player)
    m = MOVIE_PARAM_REGEX.search(str)
    if m:
        src = m.group(1)

    #allowfullscreen
    m = FULLSCREEN_PARAM_REGEX.search(str)
    if m:
        afs = m.group(1)

    #allowscriptaccess
    m = ALLOWSCRIPT_PARAM_REGEX.search(str)
    if m:
        asc = m.group(1)

    #flashvars
    m = FLASHVARS_PARAM_REGEX.search(str)
    if m:
        flashvars=m.group(1)
    return {'src':src, 'allowfullscreen':afs, 'allowscriptaccess':asc, 'flashvars':flashvars}

EMBED_REGEX = re.compile(r'<embed\s*(.+?)\s*>', re.IGNORECASE)

def parseEmbed(str):
    """
        Parse the embed code and get some important parameters
    """
    info = { 
            'src': '', 
            'allowfullscreen': '',
            'allowscriptaccess': '',
            'flashvars': ''
            }
    # remove tabs and newlines
    str = cleanup(str)
    m = EMBED_REGEX.search(str)
    if m:
        embedparams = m.group(1)
        for key,val in re.findall(r'(\w+?)="(.+?)"', embedparams, re.IGNORECASE):
            info[key.lower()]=val
            
    return info

def parseIFrame(str):
    """
        Parse the iframe type embed code and get 
        source url parameter
    """
    src = ''
    str = str.replace("\t", " ")
    str = str.replace("\n", " ")
    m = re.search('src="([\w\./:;&#\?=\-_]+)"', str, re.IGNORECASE)
    if m:
        src = m.group(1)
    return src

def getEmbeddedObjectFromUrl(url, embedInfo, checkBlacklist=True, ownerID=None):
    """
        Get an embedded object from the database based on the url
        and optionally, width and height.
        If checkBlacklist is True, raise exception for blacklisted embedded objects.

        Does not create an embedded object in any case!
    """
    eowrapper = EmbeddedObjectWrapper(url=url, embedInfo=embedInfo, ownerID=ownerID)
    eo = eowrapper.getEmbeddedObject(checkBlacklist=checkBlacklist)
    return eo

def getEmbeddedObjectWrapperFromCode(embedInfo, checkBlacklist=True, ownerID=None):
    """
        Get embedded object wrapper instance from the embedded code.
        This method is useful when we do not have a URL to decide the
        source, type, and the provider.

        Does not create an embedded object in any case!
    """

    eowrapper = None
    #some cleanup
    code = cleanup(embedInfo.get('embeddable'))
    resourceID = embedInfo.get('resourceID')

    # handle embeds from known providers, URL is better
    r = KNOWN_PROVIDERS_REGEX.search(code)
    if False:
        type = r.group(0).replace('.com','').lower()
        if type == 'youtube':
            # #4139: fix to handle youtube's latest iframe embed code
            if code.find("<iframe") != -1 :
                url = parseIFrame(code)
                url = url.replace('/v/','/embed/')
            else:
                url = parseParams(code)['src']
            eowrapper = EmbeddedObjectWrapper(url=url, embedInfo=embedInfo, ownerID=ownerID)
        elif type == 'teachertube' :
            flashvars = parseEmbed(code)['flashvars']
            url = flashvars.replace('file=','')
            if url.find('&') > 0:
                url = url[0:url.find('&')]
            eowrapper = EmbeddedObjectWrapper(url=url, embedInfo=embedInfo, ownerID=ownerID)
        elif type == 'schooltube':
            url = parseIFrame(code)
            url = url.replace('/embed/','/v/')
            eowrapper = EmbeddedObjectWrapper(url=url, embedInfo=embedInfo, ownerID=ownerID)

        if eowrapper:
            ## Try to get height and width from code
            eowrapper.getHeightAndWidth()
    else:
        ## Unknown provider - we will try our best to guess what this is...
        ## only keep the <object>, <embed> or <applet> tags, strip everything else
        embedmatch = True
        #for type, patterns in OBJPATTERNS.iteritems():
        #    for pattern in patterns:
        #        r = pattern.search(code)
        #        if r:
        #            code = r.group(0)
        #            embedmatch = True
        #            break

        if not embedmatch:
            raise Exception((_(u'Invalid embed code. Unable to parse.')).encode("utf-8"))

        #try to locate an embedded object using hash
        hash = hashlib.md5(code.encode('utf8')).hexdigest()
        eo = api.getEmbeddedObjectByHash(hash=hash, resourceID=resourceID)
        if not eo:
            log.warn("Could not find embedded object by hash: %s" % hash)
            eowrapper = EmbeddedObjectWrapper(embedInfo=embedInfo, ownerID=ownerID)
        else:
            log.info("Got embedded object by hash: %s" % hash)
            eowrapper = EmbeddedObjectWrapper(embedInfo=embedInfo, ownerID=ownerID)
            eowrapper.fill(eo)
    return eowrapper

class EmbeddedObjectWrapper(object):
    """
        A wrapper class for the EmbeddedObject model
        Helps in determining the source, type and provider of the object
        from either the url or the code.
    """
    def __init__(self, url=None, embedInfo=None, ownerID=None):

        self.object = None
        self.resolved = False
        self.embedInfo = embedInfo
        self.url = url
        if self.embedInfo.has_key('embeddable'):
            embedInfo['embeddable'] = embedInfo['embeddable'].replace('\'', '"')
            embedInfo['embeddable'] = embedInfo['embeddable'].replace('\n', ' ')
            embedInfo['embeddable'] = embedInfo['embeddable'].replace('\r', ' ')
        self.code = embedInfo.get('embeddable')
        self.width = embedInfo.get('width')
        self.height = embedInfo.get('height')
        self.authors = embedInfo.get('authors')
        self.license = embedInfo.get('license')
        self.desc = embedInfo.get('desc')
        self.title = embedInfo.get('title')
        self.frameborder = embedInfo.get('frameborder')
        self.name = embedInfo.get('name')
        self.className = embedInfo.get('className')
        self.anchorID = embedInfo.get('anchorID')
        self.src = embedInfo.get('src')
        self.resourceID = embedInfo.get('resourceID')
        self.thumbnail = embedInfo.get('thumbnail')
        self.iframe = None

        self.defaultWidth = 400
        self.defaultHeight = 315
        #if not self.height:
        #    self.height = self.defaultHeight
        #if not self.width:
        #    self.width = self.defaultWidth
        self.type = None
        self.artifact = None
        self.provider = None
        self.hash = None
        self.ownerID = ownerID
        if self.code:
            self.hash = hashlib.md5(self.code.encode('utf8')).hexdigest()
            self.code = self._setWmodeInObjectCode(self.code)
            log.info("Computed code hash: %s" % self.hash)
            self._identify()
            if self.type == 'youtube':
                iframeString = IFRAME_REGEX.findall(self.code)
                if not (iframeString or self.code.startswith('<object')):
                    log.error('Invalid embeddable for youtube. Skipping...')
                    raise ex.InvalidEmbedCode('Invalid Embed code for youtube: %s' %(self.code))
                if iframeString:
                    iframeString = iframeString[0]
                    iframeMatch = SRC_REGEX.search(iframeString)
                    if iframeMatch:
                        iframeSrc = iframeMatch.group(1)
                        log.info('src from iFrame: %s' %(iframeSrc))
                        parseResult = urlparse(iframeSrc)
                        queryDict = parse_qs(parseResult.query)
                        queryDict['wmode'] = ['transparent']
                        queryDict['rel'] = ['0']
                        protocol = parseResult.scheme
                        if not protocol:
                            protocol = 'http'
                        newIframeSrc = protocol + '://' + parseResult.netloc + parseResult.path + "?" + urllib.urlencode(queryDict, True)
                        self.code = self.code.replace(iframeSrc, newIframeSrc)
                        log.info('New EmbedCode: %s' %(self.code))
            #elif self.type == 'teachertube':
            #    oldEmbedCode = self.code.strip()
            #    if oldEmbedCode.startswith('<embed src=') and oldEmbedCode.find('wmode="true"') <= 0:
            #        newEmbedCode = oldEmbedCode.replace('<embed ', '<embed wmode="true" ', 1)
            #        log.info('Replacing oldEmbedCode: %s with embedcode: %s' %(oldEmbedCode, newEmbedCode))
            #        self.code = newEmbedCode

            if IFRAME_REGEX.search(self.code):
                if FRAMEBORDER_REGEX.search(self.code):
                    self.code = FRAMEBORDER_REGEX.sub('frameborder="0"', self.code)
                else:
                    self.code = self.code.replace('<iframe ', '<iframe frameborder="0" ')

        if self.url:
            ## If we know the url, then try to resolve it to get the actual target.
            self._resolve()
            ## Get the provider for the resolved url
            if not self._identify():
                raise Exception((_(u'Unidentified url: %(self.url)s. Could not find the provider.')  % {"self.url":self.url}).encode("utf-8"))
            self._filter()

    def _setWmodeToTransparent(self, matchobj):
        return matchobj.group(0).replace(matchobj.group(1), 'transparent')

    def _setWmodeInObjectCode(self, objectCode):
        wmodeObjectParamRegex = "<param[\s]*name[\s]*=\"wmode\"[\s]*value[\s]*=[\s]*\"([^\"]+)\"[\s]*[/]?>"
        wmodeEmbedParamRegex = "wmode[\s]*=[\s]*\"([^\"]+)\""

        wmodeObjectParam_re = re.compile(wmodeObjectParamRegex, re.DOTALL)
        if wmodeObjectParam_re.search(objectCode):
            objectCode = re.sub(wmodeObjectParamRegex, self._setWmodeToTransparent, objectCode)
        else:
            objectCode = objectCode.replace('</object>', '<param name="wmode" value="transparent"></param></object>')

        wmodeEmbed_re = re.compile("<embed[\s]*([^>]+)>", re.DOTALL)
        objectEmbed = wmodeEmbed_re.findall(objectCode)
        if objectEmbed:
            objectEmbed = objectEmbed[0]
            wmodeEmbedParam_re = re.compile(wmodeEmbedParamRegex, re.DOTALL)
            if wmodeEmbedParam_re.search(objectEmbed):
                newObjectEmbed = re.sub(wmodeEmbedParamRegex, self._setWmodeToTransparent, objectEmbed)
                objectCode = objectCode.replace(objectEmbed, newObjectEmbed)
            else:
                objectCode = objectCode.replace('<embed', '<embed wmode="transparent" ')
        return objectCode


    def fill(self, eo):
        """
            Create an EmbeddedObjectWrapper instance from an existing
            EmbeddedObject instance from the db.
        """
        self.resolved = True
        self.url = eo.uri
        self.name = eo.id
        self.code = eo.code
        self.width = eo.width
        self.height = eo.height
        self.type = eo.type
        self.provider = eo.provider
        self.object = eo
        if eo.resource:
            self.ownerID = eo.resource.ownerID
            self.authors = eo.resource.authors
            self.license = eo.resource.license
            self.src = eo.resource.getPermaUri(fullUrl=True, qualified=False)
        self.constructIFrame()
        self.object.iframe = self.iframe

    # check for supported sources for embedded objects and return the object type
    def _identify(self):
        """
            Check for supported sources for embedded objects
            Returns the object type
        """
        embeddable = self.url
        if not embeddable:
            embeddable = self.code
        log.info("Using embeddable: %s" % embeddable)
        if not self.type:
            objtype = None
            for type, pattern in URLPATTERNS.iteritems():
                m = re.search(pattern, embeddable)
                if m:
                    log.info("Matched pattern: %s for type: %s" % (pattern, type))
                    objtype = type
                    if objtype == 'ck12-embed':
                        artifactID = int(m.group(3))
                        self.artifact = api.getArtifactByID(id=artifactID)
                        self.desc = self.artifact.getSummary() if self.artifact.type.name != 'plix' else self.artifact.getTitle()
                    break
            if not objtype:
                self.provider = self.getProvider()
                if self.provider:
                    objtype = 'customembed'
            self.type = objtype
        return self.type

    def _resolve(self):
        """
            Check if the url is valid by making a HEAD request
            Also resolves the URL by getting the ultimate URL in case the server redirects (301 or 302)
        """
        ## Only resolve once
        if not self.resolved:
            _url = None
            try:
                headOpener = urllib2.build_opener(HeadRedirectHandler())
                response = headOpener.open(HeadRequest(self.url))
                _url = response.geturl()
            except Exception, e:
                log.error("Error making head request: %s" % str(e), exc_info=e)
                raise Exception((_(u'Cannot resolve embedded url: %(self.url)s')  % {"self.url":self.url}).encode("utf-8"))
            self.url = _url
            self.resolved = True

    def getProvider(self):
        """
            Get the provider from the url
        """

        if not self.provider:
            if self.url:
                provider_url = urlparse.urlparse(self.url).netloc
                log.info("Netloc: %s" % provider_url)
                self.provider = api.getProviderByDomain(domain=provider_url, create=True)
        return self.provider

    def _filter(self):
        """
            Convert urls to more standard formats
        """
        r = YOUTUBE_URL.search(self.url)
        if r:
            subdomain = r.group(1)
            video_id = r.group(2)
            self.url = 'http://%s.youtube.com/watch?v=%s' % (subdomain,video_id)

        else:
            r = SCHOOLTUBE_URL.search(self.url)
            if r:
                video_id = r.group(1)
                self.url = 'http://www.schooltube.com/video/%s/title' % video_id
                #TODO /title part of the url could lead to dups, find a solution

            else:
                r = TEACHERTUBE_URL1.search(self.url)
                if r:
                    subdomain = r.group(1)
                    video_id = r.group(2)
                    self.url = 'http://%s.teachertube.com/viewVideo.php?video_id=%s' % (subdomain,video_id)

                else:
                    r = TEACHERTUBE_URL2.search(self.url)
                    if r:
                        self.url = 'http://www.teachertube.com/%s' % r.group(1)
                        if self.url.find('&') < 0:
                            self.url += '&'

        if (self.url.find('.swf') > -1):
            self.url = self.url[:self.url.find('.swf')+4]
        elif (self.url.find('.mp4') > -1):
            self.url = self.url[:self.url.find('.mp4')+4]
        elif (self.url.find('.flv') > -1):
            self.url = self.url[:self.url.find('.flv')+4]
        elif (self.url.find('.mp3') > -1):
            self.url = self.url[:self.url.find('.mp3')+4]
        elif (self.url.find('.mov') > -1):
            self.url = self.url[:self.url.find('.mov')+4]
 
    def getObjectInfo(self):
        """
            Get information about an embedded object by using embed.ly service.
            We need the url to make this happen
        """
        if not self.url:
            self.getUrlFromCode()
        if not self.url:
            raise Exception(_("No url for object"))
        else:
            hash = hashlib.sha256(self.url).hexdigest()
            eocache = api.getEmbeddedObjectCache(urlHash=hash)
            if eocache and eocache.cache:
                log.info("Got cached response for url [%s]" % self.url)
                return eocache.cache
            else:
                log.warn("No cached response for url [%s] hash [%s]" % (self.url, hash))

            qryurl = 'http://api.embed.ly/1/oembed?key=e6a2bd42adb911e0b28a4040d3dc5c07&url=%s&format=json' % urllib.quote(self.url)
            try:
                log.info("Quering embed.ly for [%s] Qryurl [%s]" % (self.url, qryurl))
                request = urllib2.Request(qryurl)
                request.add_header('User-Agent', 'Mozilla/5.0 (compatible; CK-12/2.0beta; +http://about.ck12.org/about/contact)')
                res = urllib2.urlopen(request, timeout=30).read()

                ## Cache the object
                try:
                    kwargs = { 'urlHash': hash, 'cache': res, 'ownerID': self.ownerID }
                    eocache = api.createEmbeddedObjectCache(**kwargs)
                    log.info("Cached response for [%s] in db" % self.url)
                except Exception, e:
                    log.error("Error creating cache for embedded object: %s" % str(e), exc_info=e)
                return res
            except urllib2.HTTPError, e:
                log.error("Unable to query embed.ly API: %s [Query: %s]" % (str(e), qryurl), exc_info=e)
                raise Exception((_(u"Unable to query embed.ly API: %(str(e))s")  % {"str(e)":str(e)}).encode("utf-8"))
        return None

    def getEmbeddedObject(self, checkBlacklist=True):
        """
            Retrieve an EmbeddedObject instance from the database using the url.
            If checkBlacklist is True, raise exception if the retrived EmbeddedObject is
            blacklisted.
        """
        if self.url:
            if self.type == 'remoteswf':
                eo = api.getEmbeddedObjectByURI(uri=self.url, width=self.width, height=self.height)
            else:
                eo = api.getEmbeddedObjectByURI(uri=self.url)
            if not eo:
                raise Exception((_(u'No such embedded object: %(self.url)s')  % {"self.url":self.url}).encode("utf-8"))
            if checkBlacklist and eo.isBlacklisted():
                raise Exception((_(u'Embedded object or its provider has been blacklisted: %(self.url)s')  % {"self.url":self.url}).encode("utf-8"))
            self.constructIFrame()
            eo.iframe = self.iframe
            return eo
        raise Exception((_(u'Unknown url for object.')).encode("utf-8"))

    widthRegex = re.compile(r'width="([0-9]*[%]?)', re.I)
    widthRegexStyle = re.compile(r'width[ ]*:[ ]*([0-9]*[%]?)', re.I)
    heightRegex = re.compile(r'height="([0-9]*[%]?)', re.I)
    heightRegexStyle = re.compile(r'height[ ]*:[ ]*([0-9]*[%]?)', re.I)

    def getHeightAndWidth(self):
        ## Get height and width
        if not self.height:
            m = None
            m = self.heightRegex.search(self.code)
            if not m:
                m = self.heightRegexStyle.search(self.code)
            if m:
                ## Give a 20 pixel padding so no scroll bars show up
                try:
                    self.height = int(m.group(1)) + 20
                except:
                    self.height = m.group(1)
                log.info("Got height from code: %s" % self.height)

        if not self.width:
            m = None
            m = self.widthRegex.search(self.code)
            if not m:
                m = self.widthRegexStyle.search(self.code)
            if m:
                ## Give a 20 pixel padding so no scroll bars show up
                try:
                    self.width = int(m.group(1)) + 20
                except:
                    self.width = m.group(1)
                log.info("Got width from code: %s" % self.width)

    def getThumbnail(self, url):
        thumbnail = None
        if 'youtube' in url:
            url = url.replace('/watch?v=', '/embed/')
            url = url.replace('/v/', '/embed/')
            m = YOUTUBE_ID_REGEX.match(url)
            if m:
                thumbnail = 'https://img.youtube.com/vi/%s/hqdefault.jpg' % m.group(1)
        elif self.type == 'ck12-embed':
            thumbnail = self.artifact.getCoverImageUri()
        return thumbnail

    def getUrlFromCode(self):
        if not self.code:
            raise Exception(_("Cannot find url. No embed code specified."))
        else:
            m = re.search(r'http[s]?://[^"]*', self.code, re.I)
            if not m:
                m = re.search(r'[http:]?//[^"]*', self.code, re.I)
            if m:
                self.url = m.group(0)
                log.info("Got url from embedded code using regex: %s" % self.url)
        return self.url

    def _createEmbeddedObjectFromCode(self, checkBlacklist=True, returnDict=False):
        eo = None
        provider = None
        if not self.code:
            raise Exception((_(u'No code specified. Cannot create embedded object.')).encode("utf-8"))

        log.info("Create embedded object with code: %s" % self.code)
        eowrapper = getEmbeddedObjectWrapperFromCode(embedInfo=self.embedInfo, ownerID=self.ownerID)
        if eowrapper and eowrapper.object:
            log.info("Returning existing embedded object by id: %s" % eowrapper.object.id)
            return eowrapper.object
        if eowrapper and eowrapper.url:
            log.info("eowrapper code: %s" % eowrapper.code)
            eowrapper.license = self.license
            eowrapper.authors = self.authors
            log.info("Got url from code: %s" % eowrapper.url)
            eo = eowrapper._createEmbeddedObjectFromUrl(checkBlacklist=checkBlacklist, returnDict=returnDict)
            return eo
        else:
            #look for providers
            r = re.search(r'http[s]?://(.+?)/', self.code, re.I)
            if not r:
                r = re.search(r'//(.+?)/', self.code, re.I)
            if r:
                for netloc in r.groups():
                    provider = api.getProviderByDomain(domain=netloc, create=True)
                    if not provider:
                        continue
                    if checkBlacklist and provider.blacklisted:
                        raise Exception((_(u'The provider for this object is blacklisted: %(provider.name)s')  % {"provider.name":provider.name}).encode("utf-8"))
                    if provider:
                        self.provider = provider
                        break
                if not provider:
                    raise Exception((_(u'Unknown provider: %(netloc)s')  % {"netloc":netloc}).encode("utf-8"))

                self.getUrlFromCode()
                self.getHeightAndWidth()

            if provider:
                #create a new embed
                eoDict = {}
                eoDict['type'] = self._identify()
                eoDict['ownerID'] = self.ownerID
                eoDict['authors'] = self.authors
                eoDict['license'] = self.license
                eoDict['providerID'] = provider.id
                eoDict['height'] = self.height if self.height else self.defaultHeight
                eoDict['width'] = self.width if self.width else self.defaultWidth
                eoDict['title'] = self.title
                eoDict['desc'] = self.desc
                eoDict['resourceID'] = self.resourceID
                if eowrapper and eowrapper.code:
                    eoDict['code'] = eowrapper.code
                else:
                    eoDict['code'] = self.code
                if eowrapper and eowrapper.url:
                    eoDict['uri'] = eowrapper.url
                else:
                    eoDict['uri'] = self.url
                #eoDict['hash'] = hashlib.md5(eoDict['code']).hexdigest()
                eoDict['hash'] = self.hash
                if '?' in eoDict['uri']:
                    eoDict['uri'] += '&hash=%s' % eoDict['hash']
                else:
                    eoDict['uri'] += '?hash=%s' % eoDict['hash']
                if not eoDict['type']:
                    if self.code.startswith('<applet'):
                        eoDict['type'] = 'applet'
                    else:
                        eoDict['type'] = 'customembed'
                log.info("Creating embeddedObject: %s" % str(eoDict))
                eoDict['thumbnail'] = self.thumbnail
                if not eoDict.get('thumbnail'):
                    eoDict['thumbnail'] = self.getThumbnail(eoDict['uri'])
                    self.thumbnail = self.embedInfo['thumbnail'] = eoDict['thumbnail']
                if returnDict:
                    return eoDict
                eo = api.createEmbeddedObject(**eoDict)
                self.name = self.embedInfo['name'] = eo.id
                self.src = self.embedInfo['src'] = eo.resource.getPermaUri(fullUrl=True, qualified=False)
                self.constructIFrame()
                eo.iframe = self.iframe
                log.info("EmbeddedObject created: %s" % eo)
                return eo
            else:
                raise Exception((_(u'Unknown provider')).encode("utf-8"))

    def _createEmbeddedObjectFromUrl(self, checkBlacklist=True, returnDict=False):
        """
            Create or return an existing embedded object for a url
            Note:
                Embed code is also needed unless this is a youtube url)
                We are treating youtube as a special case
        """
        if not self.url:
            raise Exception((_(u'No url specified for this embedded object.')).encode("utf-8"))

        log.info("Embedded object create with url: %s" % self.url)
        #ensure that provider is not blacklisted
        self.getProvider()
        if not self.provider:
            raise Exception((_(u'Could not determine provider for url: %(self.url)s')  % {"self.url":self.url}).encode("utf-8"))
        if checkBlacklist and self.provider.blacklisted:
            raise Exception((_(u'This provider is blacklisted: %(self.provider.name)s')  % {"self.provider.name":self.provider.name}).encode("utf-8"))

        ## create new one if it does not exist
        eoDict = {}
        eoDict['type'] = self.type
        eoDict['providerID'] = self.provider.id
        eoDict['uri'] = self.url
        eoDict['width'] = self.width if self.width else self.defaultWidth
        eoDict['height'] = self.height if self.height else self.defaultHeight
        eoDict['ownerID'] = self.ownerID
        eoDict['authors'] = self.authors
        eoDict['license'] = self.license
        eoDict['title'] = self.title
        eoDict['desc'] = self.desc
        eoDict['code'] = self.code
        eoDict['hash'] = ''
        eoDict['resourceID'] = self.resourceID

        if not eoDict['code']:
            ## Get code for the url WITHOUT using embed.ly - only for youtube
            if 'youtube' in eoDict['uri']:
                url = eoDict['uri'].replace('/watch?v=', '/embed/')
                eoDict['code'] = '<iframe width="%s" height="%s" src="%s" frameborder="0" allowfullscreen></iframe>' % (eoDict['width'], eoDict['height'], url)
        if not eoDict['code']:
            raise Exception((_(u"Cannot create an embedded object without the embed code: %(self.url)s")  % {"self.url":self.url}).encode("utf-8"))
        ## Create the object
        eoDict['hash'] = hashlib.md5(eoDict['code']).hexdigest()
        eoDict['thumbnail'] = self.thumbnail
        if not eoDict.get('thumbnail'):
            eoDict['thumbnail'] = self.getThumbnail(eoDict['uri'])
            self.thumbnail = self.embedInfo['thumbnail'] = eoDict['thumbnail']
        log.info("EmbeddedObject: %s" % str(eoDict))
        if returnDict:
            return eoDict
        eo = api.createEmbeddedObject(**eoDict)
        self.name = self.embedInfo['name'] = eo.id
        self.src = self.embedInfo['src'] = eo.resource.getPermaUri(fullUrl=True, qualified=False)
        self.constructIFrame()
        eo.iframe = self.iframe
        log.info("EmbeddedObject created: %s" % eo)
        return eo

    def constructIFrame(self):
        schemaOrgTag = '<div itemprop="video" itemscope itemtype="http://schema.org/VideoObject">'
        if self.desc:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="description" content="%s" />' %(self.desc)
        if self.thumbnail:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="image" content="%s" />' %(self.thumbnail)
        if self.title:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="name" content="%s" />' %(self.title)
        if self.src:
            schemaOrgTag = schemaOrgTag + '<meta itemprop="url" content="%s" />' %(self.src)

        iframeAttributes = ''
        if self.anchorID:
            iframeAttributes = iframeAttributes + 'id="%s" ' %(self.anchorID)
        if self.name:
            iframeAttributes = iframeAttributes + 'name="%s" ' %(self.name)
        if self.artifact:
            iframeAttributes = iframeAttributes + 'data-artifactid="%s" ' %(self.artifact.id)
        if self.title:
            iframeAttributes = iframeAttributes + 'title="%s" ' %(self.name)
        if self.desc:
            iframeAttributes = iframeAttributes + 'longdesc="%s" ' %(self.desc)
        if self.className:
            iframeAttributes = iframeAttributes + 'class="%s" ' %(self.className)
        if self.width:
            iframeAttributes = iframeAttributes + 'width="%s" ' %(self.width)
        if self.height:
            iframeAttributes = iframeAttributes + 'height="%s" ' %(self.height)
        if self.src:
            iframeAttributes = iframeAttributes + 'src="%s" ' %(self.src)
        iframeAttributes = iframeAttributes + 'frameborder="0" '

        iframe = '<iframe ' + iframeAttributes + '> </iframe>'
        iframe = schemaOrgTag + iframe + '</div>'
        self.iframe = iframe

    def createEmbeddedObject(self, checkBlacklist=True, returnDict=False):
        """
            Creates a new EmbeddedObject from this EmbeddedObjectWrapper instance.
            Works with either a URL or the embed code.
        """
        ## If code is specified, we don't need anything else (hopefully)
        if self.code:
            return self._createEmbeddedObjectFromCode(checkBlacklist=checkBlacklist, returnDict=returnDict)
        elif self.url:
            return self._createEmbeddedObjectFromUrl(checkBlacklist=checkBlacklist, returnDict=returnDict)
        else:
            raise Exception((_(u'Unknown url and code for the embedded object')).encode("utf-8"))
        return None

def createPlaceholderEmbeddedObject(imageDir, memberID, type='video', error=''):
    resourceHelper = ResourceHelper()
    resourceRevision = resourceHelper.createPlaceholderResource(imageDir, memberID=memberID, type=type)
    resourceID = resourceRevision.resource.id
    perma = resourceRevision.resource.getPermaUri(fullUrl=True, qualified=False)
    ## Get provider
    ck12Provider = api.getProviderByDomain(domain='*.ck12.org')
    code = '''
<!-- Error: [%s] -->
<div class="x-ck12-img-postcard x-ck12-nofloat">
    <p>
        <img alt="Missing Embedded Object" title="" src="%s">
    </p>
    <p>%s</p>
</div>
''' % (error, perma, '')

    eo = None
    try:
        eowrapper = getEmbeddedObjectWrapperFromCode(code=code)
        eo = eowrapper.getEmbeddedObject(checkBlacklist=False)
    except Exception, e:
        log.error("Error getting existing embedded object for %s [%s]" % (type, str(e)))
        ## No such object - create it
        dict = {
                'providerID': ck12Provider.id,
                'resourceID': resourceID,
                'ownerID': memberID,
                'uri': perma,
                'type': 'placeholder',
                'description': 'placeholder',
                'code': code,
                'hash': hashlib.md5(code).hexdigest(),
                'width': 220,
                'height': 120,
            }
        eo = api.createEmbeddedObject(**dict)
    return eo

