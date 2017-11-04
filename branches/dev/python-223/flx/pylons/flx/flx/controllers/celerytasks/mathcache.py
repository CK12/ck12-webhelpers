from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.ck12_math_lib import render
from flx.model import api
import logging
import re, os
from datetime import datetime
from hashlib import sha1
import httplib
from urllib import quote,unquote
import flx.lib.helpers as h

logger = logging.getLogger(__name__)

class MathCacheTask(GenericTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self)
        self.userId = 1
        self.useSatellite = self.config.get("math_use_satellite")
        self.satelliteServer = self.config.get("math_satelite_server")

        if kwargs.has_key('userID'):
            self.userId = kwargs['userID']
        self.routing_key = "print"
        self.session = kwargs.get('session')

    def _generateCacheFromContent(self, artifactDict):
        try :
            xhtml = artifactDict['xhtml']
            logger.debug("Xhtml exists, continuing...")
            return self.generate_cache_from_content(xhtml)
        except Exception, e:
            logger.error("Xhtml doesn't exists, nothing to create" + str(e), exc_info=e)

    def __generateCacheForEquation(self, mathType, equation):
        try:
            return self.generate_cache_for_equation(mathType, equation)
        except Exception, e:
            logger.error("Error converting equation: %s [%s]" % (equation, str(e)), exc_info=e)

    def run(self, artifactID=None, equation=None, type=None, **kwargs):
        """
            Generate math cache for an artifact with id artifactID. If not
            given, then all artifacts will be processed.

            Does not recurse through it's children
        """
        GenericTask.run(self, **kwargs)
        logger.info("Creating math cache for artifact id: %s" % artifactID)
        logger.info("Creating math cache for equation: %s" % equation)
        logger.info("DB: %s" % self.config['celery.sqlalchemy.url'])

        if kwargs.has_key('user'):
            self.userId = kwargs['user']

        if not artifactID and equation:
            return self.__generateCacheForEquation(type, equation)

        if artifactID is not None:
            logger.info('artifactID[%s]' % artifactID)
            if self.session:
                artifact = api._getArtifactByID(session=self.session, id=artifactID)
            else:
                artifact = api.getArtifactByID(id=artifactID)
            if artifact is not None:
                self._generateCacheFromContent(artifact.asContentDict())
            return "Generated math cache for artifact: %s" % artifactID
        else:
            pageSize = 128
            pageNum = 1
            while True:
                try:
                    if self.session:
                        artifacts = api._getArtifacts(session=self.session, pageNum=pageNum, pageSize=pageSize)
                    else:
                        artifacts = api.getArtifacts(pageNum=pageNum, pageSize=pageSize)
                    if len(artifacts) == 0:
                        break
                    idList = []
                    for artifact in artifacts:
                        idList.append(artifact.id)
                    if self.session:
                        artifactsDict = api._getArtifactsDictByIDs(session=self.session, idList=idList, artifacts=artifacts, includeContent=True)
                    else:
                        artifactsDict = api.getArtifactsDictByIDs(idList=idList, artifacts=artifacts, includeContent=True)
                    for artifactDict in artifactsDict:
                        self._generateCacheFromContent(artifactDict)
                except Exception, e:
                    logger.error("Error generating cache: %s" % str(e), exc_info=e)
                pageNum += 1
        return "Generated math cache for all artifacts"

    def serve_inline_math(self, latex, target = "web"):
        type = "inline"
        return self.serve_math(type, latex, target)
    
    def serve_block_math(self, latex, target = "web"):
        type = "block"
        return self.serve_math(type, latex, target)

    def serve_alignat_math(self, latex, target = "web"):
        type = "alignat"
        return self.serve_math(type, latex, target)

    def generate_cache_from_content(self, xhtml):
        logger.debug("Trying to create math cache.")
        #img_re = re.compile("<img class=\W*\"x-ck12(.*?)-math\" src=\W*\"(.*?)\" alt=\"(.*?)\"")
        img_re = re.compile("<img src=\W*\"(.*?)\" alt=\"(.*?)\" class=\W*\"x-ck12(.*?)-math\"")
        img_srcs = img_re.findall(xhtml.replace('\n',''))
        target = "web"
        
        for each_src in img_srcs:
            url = each_src[0]
            formula =  each_src[1]
            logger.debug("Here is url and formula: "+ url + " "+ formula)
            
            if url.find('inline') > 0:
                 logger.debug("Got inline math..."+ formula)
                 self.serve_math('inline', formula, target)
                 
            if url.find('block') > 0 :
                 logger.debug("Got block math..."+ formula)
                 self.serve_math('block', formula, target)
                 

    def generate_cache_for_equation(self, mathType, equation):
        logger.info("Generating math for equation: %s of type: %s" % (mathType, equation))
        return self.serve_math(mathType, equation, 'web')


    def serve_math(self, type, latex, target):
        hash = self.__create_hash(type, target, latex)
        if self.session:
            record = api._getMathImageForHash(self.session, hash)
        else:
            record = api.getMathImageForHash(hash=hash)
        if record != None:
            logger.debug("Got a cache hit! Sweeett..")
            return [True, record.resourceUrl]
        else:
            #not found, get one
            if self.useSatellite == 'false' :
                #locally
                image_path = render.create(type, latex, hash, target)
                error = ""
                if image_path != "":
                    url = self.__upload_image(image_path, hash)
                    if url != "":
                        if self.__persist_image(hash, type, target, latex, url):
                            return [True, url]
                        else:
                            error = "Cannot persist image to db. Please contact the administrator."
                    else:
                        error = "Cannot upload image to repository. Please contact the administrator."
                else :
                    error = "Image cannot be generated. Error in expression ?"
            else:
                #from satellite
                url = self.__get_remote_math(type, latex, target)
                if url != "":
                    if self.__persist_image(hash, type, target, latex, url):
                        return [True, url]
                    else:
                        error = "Cannot persist image to db. Please contact the administrator."
                else:
                    error = "Cannot generate math from satellite. Please contact the administrator."
                                    
            return [False, error]


    def __get_remote_math(self, type, latex, target):
        try:
            if isinstance(latex, unicode):
                latex = h.safe_encode(latex)
            conn = httplib.HTTPConnection(self.satelliteServer)
            uri = '/flx/math/%s/%s' % (type, quote(unquote(latex)))
            logger.debug("Calling satellite with uri: [%s]" % uri)
            conn.request("HEAD", uri)
            response = conn.getresponse()
            conn.close()
            if response.status == 302:
                return response.getheader('location')
            else:
                logger.error("Error fetching math from satellite. Status %d Reason: [%s] expression %s" % (response.status, response.reason, latex))
                return ''
                
        except Exception as e:
            logger.error("Error fetching math from satellite. Reason: [%s]" % str(e), exc_info=e)
            return ''
        
   
    def __create_hash(self, type, target, latex):
        a = sha1(type)
        a.update(target)
        if isinstance(latex, unicode):
            latex = h.safe_encode(latex)
        a.update(latex)
        return a.hexdigest()     

    def __persist_image(self, hash, type, target, expr, url):
        logger.debug("Trying to persist to db")
        kwargs = {
                'hash': hash,
                'eqnType': type,
                'target': target,
                'expression': expr,
                'resourceUrl': url,
                }
        try:
            if self.session:
                mathImage = api._getMathImageForHash(session=self.session, hash=hash)
            else:
                mathImage = api.getMathImageForHash(hash=hash)
            if not mathImage:
                if self.session:
                    mathImage = api._createMathImage(session=self.session, **kwargs)
                else:
                    mathImage = api.createMathImage(**kwargs)
            return mathImage
        except Exception, e:
            logger.error("Error saving Math Image record: %s" % str(e), exc_info=e)
        return False
        
    #Saving image using direct api call
    def __upload_image(self, image_path, hash):
        logger.debug("creating resource object")
        resourceDict = {}
        try:
            if self.session:
                resource = api._getResourceByRefHash(session=self.session, refHash=hash)
            else:
                resource = api.getResourceByRefHash(refHash=hash)
            if resource:
                resourceID = resource.id
                #resourceURL = resource.getPermaUri(fullUrl=False)
                resourceURL = resource.getUri()
                logger.info("Found existing resource: %s" % resourceID)
            else:
                logger.info("Creating new resource for :%s" % hash)
                path, name = os.path.split(image_path)
                if self.session:
                    language = api._getLanguageByName(session=self.session, name='English')
                else:
                    language = api.getLanguageByName(name='English')
                resourceDict['resourceType'] = api.getResourceTypeByName(name="equation")
                resourceDict['name'] = name
                resourceDict['languageID'] = language.id  
                resourceDict['ownerID'] = self.userId
                resourceDict['isExternal'] = False
                resourceDict['uri'] = open(image_path, "rb")
                resourceDict['creationTime'] = datetime.now()
                resourceDict['uriOnly'] = False
                if self.session:
                    resourceRevision = api._createResource(session=self.session, resourceDict=resourceDict, commit=True)
                else:
                    resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
                resourceID = resourceRevision.resource.id
                #resourceURL = resourceRevision.resource.getPermaUri(fullUrl=False)
                resourceURL = resourceRevision.resource.getUri()
            logger.debug("Resource id: "+ str(resourceID))
            logger.debug("Resource url: "+ str(resourceURL))

            return resourceURL
        except Exception as e:            
            logger.exception ("Error: failed uploading, "+ str(e))
            return ""
        finally:
            logger.debug("DEBUG: Trying to delete file after upload: "+ image_path)
            render.cleanup(image_path) 

