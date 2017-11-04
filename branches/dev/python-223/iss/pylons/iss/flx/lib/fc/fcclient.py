from fcrepo.connection import Connection
from pylons.i18n.translation import _ 
from fcrepo.client import FedoraClient

import logging
import traceback
from tempfile import NamedTemporaryFile
import os
import urllib
import re
from boto.s3 import key
from boto.s3.connection import S3Connection
from datetime import datetime, timedelta
import subprocess

from pylons import config
import flx.lib.helpers

log = logging.getLogger(__name__)

pid_prefix_generic = 'f-'
pid_prefix_dl = 'f-d:'
pid_prefix_st = 'f-s:'
pid_prefixes = [ pid_prefix_dl, pid_prefix_st ]

class FCClient(object):

    def __init__(self, cfg=None):
        self.client = None
        self.configure(cfg)
        self.thumbnailSizes = {'POSTCARD': (500, 500), "LARGE": (192, 192), "SMALL": (95, 95)}

    def configure(self, cfg=None):
        global config
        if not cfg and (not config or not config.has_key('fedora_commons_url') or not config['fedora_commons_url']):
            log.info("Initializing config ...")
            config = flx.lib.helpers.load_pylons_config()
            cfg = config
        if not cfg:
            cfg = config
        self.setConnectionParams(cfg.get('fedora_commons_url'), cfg.get('fedora_commons_user'), cfg.get('fedora_commons_password'))
        self.cdnStreamingUrl = cfg.get('cdn_streaming_url')
        self.cdnDownloadUrl = cfg.get('cdn_download_url')
        self.awsAccessKey = cfg.get('aws_access_key')
        self.awsSecretKey = cfg.get('aws_secret_key')
        self.awsBucketName = cfg.get('aws_bucket_name')

    def setConnectionParams(self, url, user, passwd):
        self.url = url
        self.user = user
        self.password = passwd
        log.debug("Connection params: %s" % self.url)

    def __connect(self):
        if not self.client:
            log.debug("Connecting to %s@%s" % (self.user, self.url))
            ## Open a non-persistent connection - this will avoid connection errors due to too many open connections
            self.conn = Connection(self.url, username=self.user, password=self.password, persistent=False)
            self.client = FedoraClient(self.conn)

    def deleteResource(self, id):
        """
            Delete the resource identified by id
        """
        deleted = False
        self.__connect()
        results = self.searchResources(query='pid~f-?:%s' % id, maxResults=2)
        log.info("Results: %s" % results)
        if results:
            for result in results:
                try:
                    pid = result['pid']
                    obj = self.client.getObject(pid)
                    obj.delete(logMessage=u'Removing from repository')
                    deleted = True
                except Exception:
                    ## Pass
                    pass
        return deleted

    def saveResource(self, id, resourceType, isExternal, creator, name, content, isAttachment=False):
        """
            Save the resource with given id and resourceType
            isExternal: True for resources where only their links should be stored
            creator: The owner of the resource
            name: name of the resource
            content: either the link or contents of the resource

            Deletes existing resource with same id if it exists
        """
        unicodeName = flx.lib.helpers.safe_decode(name)
        log.info("Saving resource with id: %s, type: %s, streamable: %s, external: %s, creator: %s, name: %s" % (str(id), resourceType.name, str(resourceType.streamable), str(isExternal), creator, unicodeName))

        if resourceType.streamable:
            pid = flx.lib.helpers.safe_decode('%s%s' % (pid_prefix_st, id))
        else:
            pid = flx.lib.helpers.safe_decode('%s%s' % (pid_prefix_dl, id))

        if name.endswith('content'):
            raise Exception((_(u'Bad content name: %(unicodeName)s')  % {"unicodeName":unicodeName}).encode("utf-8"))

        self.__connect()
        self.deleteResource(id=id)
        obj = self.client.createObject(pid, label=flx.lib.helpers.safe_decode(name))
        obj.ownerId = flx.lib.helpers.safe_decode('%s' % str(creator))

        mimeType = None
        controlGroup = u'M'
        tmpFile = None
        dsName = self.getDSName(resourceType.name)
        checksum = None

        if isExternal:
            controlGroup = u'E'
            obj.addDataStream(dsName, self.getDSXml(resourceType.name), location=flx.lib.helpers.safe_decode('%s' % content), controlGroup=controlGroup, logMessage=flx.lib.helpers.safe_decode('Storing %s' % resourceType.name))
        else:
            filename = flx.lib.helpers.safe_encode(os.path.basename(name))
            tmpFile = NamedTemporaryFile(suffix=filename, delete=False)
            import shutil
            shutil.copyfileobj(content, tmpFile)
            tmpFile.close()
            content.close()
            ## Get MD5
            f = open(tmpFile.name, "rb")
            import hashlib
            m = hashlib.md5()
            m.update(f.read())
            f.close()
            log.info("Hash: %s" % m.hexdigest())

            import mimetypes
            (mimeType, enc) = mimetypes.guess_type(tmpFile.name)

            if not mimeType:
                mimeType = 'application/binary'

            log.info("Mime type: %s" % mimeType)
            obj.addDataStream(dsName, self.getDSXml(resourceType.name), label=flx.lib.helpers.safe_decode('%s' % name), mimeType=flx.lib.helpers.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=flx.lib.helpers.safe_decode('Storing %s' % resourceType))
            ds = obj[dsName]
            f = open(tmpFile.name, "rb")
            ds.setContent(f)

            # Create tiny stream which is a copy of the original stream 
            if resourceType.name in ['cover page', 'image']:
                obj.addDataStream(dsName + "_TINY", self.getDSXml(resourceType.name), label=flx.lib.helpers.safe_decode('uncompressed_tiny_%s' % name), mimeType=flx.lib.helpers.safe_decode('%s' % mimeType), controlGroup=controlGroup, logMessage=flx.lib.helpers.safe_decode('Storing %s' % resourceType))
                dsTiny = obj[dsName + "_TINY"]
                f.seek(0)
                dsTiny.setContent(f)

            f.close()
            log.info("Checksum: %s" % ds.checksum)
            checksum = ds.checksum

            animated = False
            if resourceType.name in ['cover page', 'image'] and not isAttachment:
                suffix = os.path.basename(tmpFile.name)
                if suffix.lower().endswith(".gif"):
                    ## check for animation
                    frames = 0
                    cmd = ["identify", "-format", "%%n", "%s" % tmpFile.name]
                    formatOutFile = NamedTemporaryFile(suffix=".out", delete=False)
                    p = subprocess.Popen(cmd, stdout=formatOutFile)
                    retcode = p.wait()
                    formatOutFile.close()
                    if not retcode and os.path.exists(formatOutFile.name):
                        with open(formatOutFile.name, "r") as fof:
                            try:
                                frames = int(fof.read())
                            except Exception as e:
                                log.warn("Could not get frames: %s" % str(e))
                                frames = 0
                        os.remove(formatOutFile.name)
                    animated = frames > 1
                #
                # Create a thumbnail for the image
                #
                for sizename in self.thumbnailSizes.keys():
                    x,y = self.thumbnailSizes[sizename]
                    try:
                        thumbImg = self.getThumbnail(tmpFile.name, width=x, height=y, animated=animated)
                        (mimeType, enc) = mimetypes.guess_type(thumbImg.name)
                        if not mimeType:
                            mimeType = 'application/binary'
                        log.info('Mimetype of thumbnail: %s' %(mimeType))
                        dsNameThumb = self.getDSName(resourceType.name, 'thumb_%s' % sizename)
                        obj.addDataStream(dsNameThumb, self.getDSXml(resourceType.name), label=flx.lib.helpers.safe_decode('thumbnail_%s_for_%s' % (sizename, name)), mimeType=flx.lib.helpers.safe_decode('%s' % mimeType), 
                                controlGroup=controlGroup, logMessage=flx.lib.helpers.safe_decode('Storing thumbnail of size %dx%d for %s' % (x, y, resourceType.name)))
                        obj[dsNameThumb].setContent(thumbImg)
                        thumbImg.seek(0)

                        #add tiny stream which is a copy of the original stream
                        obj.addDataStream(dsNameThumb + "_TINY", self.getDSXml(resourceType.name), label=flx.lib.helpers.safe_decode('uncompressed_tiny_thumbnail_%s_for_%s' % (sizename, name)), mimeType=flx.lib.helpers.safe_decode('%s' % mimeType), 
                                controlGroup=controlGroup, logMessage=flx.lib.helpers.safe_decode('Storing tiny uncompressed thumbnail of size %dx%d for %s' % (x, y, resourceType.name)))
                        obj[dsNameThumb + "_TINY"].setContent(thumbImg)
                        thumbImg.close()

                        os.remove(thumbImg.name)
                    except:
                        log.error("Error creating thumbnail of size: %dx%d" % (x, y))
                        log.error(traceback.format_exc())

            os.remove(tmpFile.name)

        log.info("ResourceType: %s" % resourceType.name)
        link = self.getResourceLink(id, resourceType)
        log.info("Link: %s" % link)
        if not link.endswith('/content'):
            onlyMakePublic = True
            if isAttachment or resourceType.name in ['pdf', 'epub', 'mobi', 'lessonplan', 'studyguide', 'attachment']:
                onlyMakePublic = False
            ## S3 storage - add headers
            try:
                self.addS3Headers(link, mimeType, name, onlyMakePublic=onlyMakePublic)
            except Exception, e:
                log.error("Error applying s3 headers to downloadable objects: %s" % str(e), exc_info=e)
        return checksum

    def addS3Headers(self, link, mimeType, name, onlyMakePublic=False):

        bucketRe = re.compile(r'.*(datastreams/.*)$')
        m = bucketRe.match(link)
        if m:
            keyName = urllib.unquote(m.group(1))
            if keyName:
                conn = S3Connection(self.awsAccessKey, self.awsSecretKey)
                bucket = conn.get_bucket(self.awsBucketName)
                # Create key
                k = key.Key(bucket)
                k.key = keyName
                log.debug("Key: %s" % k)
                log.debug("Metadata: %s" % k.metadata)
                if not onlyMakePublic:
                    expiresIn = 5*12*30*24*60*60
                    expires = datetime.now() + timedelta(seconds=expiresIn)
                    #format = "Tue, 27 Mar 2012 22:09:46 GMT"
                    format = '%a, %d %b %Y %H:%M:%S GMT'
                    newMetadata = { 
                            "Content-Disposition": "attachment; filename=\"%s\"" % flx.lib.helpers.safe_encode(name),
                            "Content-Type": "%s" % flx.lib.helpers.safe_encode(mimeType),
                            "Cache-Control": "PUBLIC, max-age=%s, must-revalidate" % expiresIn,
                            "Expires": expires.strftime(format),
                            "x-amz-acl": "public-read",
                            }
                    k.metadata.update(newMetadata)
                    log.info("Updating S3 metada with new metadata: %s" % newMetadata)
                    # Copy old key
                    k2 = k.copy(k.bucket.name, k.name, k.metadata, preserve_acl=True)
                    k = k2
                else:
                    k.make_public()
            else:
                log.error("Error getting keyname for : %s "% link)
        else:
            log.error("Error parsing url: %s" % link)


    def searchResources(self, query, fields=['pid'], maxResults=-1):
        """
            Search for resources given a query and a list of fields
        """
        self.__connect()
        results = self.client.searchObjects(query=flx.lib.helpers.safe_decode('%s' % query), fields=fields)
        resultList = []
        for result in results:
            res = {}
            for field in fields:
                fldUC = flx.lib.helpers.safe_decode('%s' % field)
                res[field] = result[fldUC][0]
            resultList.append(res)
            log.info("Result: %s" % str(res))
            if maxResults > 0 and len(resultList) == maxResults:
                break
        return resultList

    def checkResource(self, name, resourceType):
        """
            Check if a resource of given name and type exists
        """
        query = flx.lib.helpers.safe_decode('pid~%s* label=%s' % (pid_prefix_generic, name))
        self.__connect()
        results = self.client.searchObjects(query=query, fields=['pid', 'label'], maxResults=1)
        if results:
            for result in results:
                obj = self.client.getObject(result['pid'][0])
                log.info("Found object with pid: %s" % obj.pid)
                dsName = self.getDSName(resourceType)
                if dsName in obj.datastreams():
                    log.info("Object has stream by name: %s" % dsName)
                    return obj[dsName]
        log.info("No object with name %s or stream %s" % (name, self.getDSName(resourceType)))
        return None

    def getResourceObject(self, id):
        """
            Get the resource object for an id
        """
        log.debug("Getting resource object with id: %s" % str(id))
        self.__connect()
        for pid_prefix in pid_prefixes:
            try:
                pid = flx.lib.helpers.safe_decode('%s%s' % (pid_prefix, id))
                obj = self.client.getObject(pid)
                return obj
            except:
                log.error("Error getting object with id: %s" % pid)
        return None

    def getResource(self, id, resourceType, dsSuffix=''):
        log.debug("Get resource with id: %s, resourceType: %s, dsSuffix: %s" % (str(id), resourceType, dsSuffix))
        try:
            obj = self.getResourceObject(id)
            if obj:
                dsName = self.getDSName(resourceType, dsSuffix)
                log.info("Checksum: %s" % str(obj[dsName].checksum))
                return obj[dsName]
        except:
            log.error("Could not get resource for id: %s" % str(id))
            log.error(traceback.format_exc())
        return None

    def getThumbnail(self, imageFile, width=48, height=48, animated=False):
        if os.path.exists(imageFile):
            suffix = os.path.basename(imageFile)
            if suffix.lower().endswith('.bmp'):
                suffix = suffix[:len(suffix)-4] + '.jpg'

            if animated:
                ## First use coalesce
                coalF = NamedTemporaryFile(suffix=suffix, delete=False)
                coalFName = coalF.name
                coalF.close()
                cmd = ["convert", "%s" % imageFile, "-coalesce", "%s" % coalFName ]
                log.info("Coalescing animated GIF: %s" % " ".join(cmd))
                p = subprocess.Popen(cmd)
                retcode = p.wait()
                if not retcode and os.path.exists(coalFName):
                    imageFile = coalFName
                    log.info("Switching input image file to: %s" % imageFile)

            ## Create thumbnail
            f = NamedTemporaryFile(suffix=suffix, delete=False)
            outputFile = f.name
            f.close()
            cmd = ["convert", "%s" % imageFile, "-antialias", "-thumbnail", "%dx%d>" % (width, height), "%s" % outputFile]
            log.info("Creating thumbnail of size %dx%d at %s with cmd: %s" % (width, height, outputFile, " ".join(cmd)))
            p = subprocess.Popen(cmd)
            retcode = p.wait()
            if not retcode and os.path.exists(outputFile):
                log.info("Created thumbnail of size %dx%d at %s" % (width, height, outputFile))
                return open(outputFile, "rb")
            else:
                raise Exception((_(u"Failed to generate thumbnail image; retcode: %(retcode)d")  % {"retcode":retcode}).encode("utf-8"))
        else:
            raise Exception((_(u"No such input image file: %(imageFile)s")  % {"imageFile":imageFile}).encode("utf-8"))
        return None

    def getResourceLink(self, id, resourceType, dsSuffix=''):
        """
            Gets the actual url to the resource
            This method simply does string manipulation and does not need to connect to fedora server
        """
        log.debug("Get resource link with id: %s, resourceType: %s, dsSuffix: %s" % (str(id), resourceType, dsSuffix))
        url = None
        if resourceType.streamable:
            pid_prefix = pid_prefix_st
            url = self.cdnStreamingUrl
        else:
            pid_prefix = pid_prefix_dl
            url = self.cdnDownloadUrl
        pid = flx.lib.helpers.safe_decode('%s%s' % (pid_prefix, id))
        dsName = self.getDSName(resourceType.name, dsSuffix)
        if not url or url == self.url:
            return '%s/objects/%s/datastreams/%s/content' % (self.url, pid, dsName)
        return ('%s/datastreams/' % url) + urllib.quote('%s+%s+%s.1' % (pid, dsName, dsName))

    def getResourceIdFromLink(self, link):
        import re
        exp = re.compile(r'.*/f-?:([0-9a-f]+)/.*')
        m = exp.match(link)
        if m:
            return m.group(1)
        log.error("Could not get resource id from link: %s" % link)
        return None

    def getDSName(self, resourceType, suffix=''):
        dsName = resourceType
        if suffix:
            dsName += '_' + suffix
        dsName = dsName.replace(' ', '_')
        return flx.lib.helpers.safe_decode('%s' % dsName.upper())
    
    def getDSXml(self, resourceType):
        xml = '<%s/>' % resourceType.lower()
        xml = xml.replace(' ', '-')
        return xml

    def connect(self):
        self.__connect()
