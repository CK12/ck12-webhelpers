import logging
import json
from flx.model import api
import flx.lib.helpers as h
from flx.controllers.celerytasks.periodictask import PeriodicTask
from urllib import quote
from BeautifulSoup import BeautifulSoup
import eventlet
from eventlet.green import urllib2
from urlparse import urlparse
import cgi

SERVER_URL = "https://www.ck12.org"
USER_AGENT = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36" ## Google Chrome
bookTypes = ['book', 'tebook', 'workbook' ,'studyguide', 'labkit', 'quizbook', 'testbook', 'section', 'chapter']
skip_artifact_type = ['domain', 'concept', 'study-track', 'assignment', 'book', 'tebook', 'workbook' ,'studyguide', 'labkit', 'quizbook', 'testbook']
url_skip_list = ['http://www.teachertube.com', 'http://teachertube.com']
logger = logging.getLogger(__name__)

InvalidArtifacts = []
class ArtifactUrlValidator(PeriodicTask):

    recordToDB = True

    def __init__(self, **kwargs):
        ## Initialize ValidatorTask
        PeriodicTask.__init__(self, **kwargs)
        self.loglevel = 'WARN'
        self.skipIfRunning = True
        self.routing_key = "artifact"
        self.pageSize = 1000

    def skip_url_validation(self, url):
        if not url:
            return True
        if url in ['#'] or url.startswith('#') or url.startswith('javascript:') or url.endswith('icon_loading.gif'):
            return True
        parsed_uri = urlparse(url)
        domain = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_uri)
        if domain in url_skip_list:
            return True
        return False

    def run(self, **kwargs):
        """
            Validate the ck12 created artifacts url, html href, image src and iframe src url's 
            This task runs periodically to check if any artifact url are correct.
        """
        PeriodicTask.run(self, **kwargs)
        InvalidArtifacts = []
        try:
            if self.config.get('celery_test_mode') == 'true':
                logger.warn("Running in test mode. Skip validator...")
                return
        except:
            pass

        ## Make sure we don't run again if already running/scheduled
        if self.isAlreadyRunning():
            return "Skipped"

        try:
            global SERVER_URL
            SERVER_URL = self.config.get('web_prefix_url', SERVER_URL)
            lastPageNum = 1
            lastTask = api.getLastTaskByName(name='ArtifactUrlValidator', statusList=['SUCCESS'])
            if lastTask and lastTask.userdata:
                udJ = json.loads(lastTask.userdata.replace('\n', ''))
                lastPageNum = udJ.get('pageNum', 0)
                lastPageNum = lastPageNum + 1
                logger.info("Found last task. Starting from page: %s" % lastPageNum)
            else:
                logger.info("No last successful task. Starting from page 1")
            if not lastPageNum:
                lastPageNum = 1
            pageNum = lastPageNum
            logger.info("Starting from pageNum: %d" % pageNum)
            #Get all artifacts for each artifact type, owened if ck12
            ownerID=3
            owner = api.getMemberByID(id=ownerID)
            ownerID = owner.id
            if not owner:
                logger.warn("No member with id [%]..." % ownerID)
                return
            #Sorting=None will return artifacts by id in asc order
            sorting=None
            artifacts = api.getArtifacts(idList= None, ownerID=ownerID, typeName=None, sorting=sorting, pageNum=pageNum, pageSize=self.pageSize)

            totalArtifacts = len(artifacts)
            for index,artifact in enumerate(artifacts):
                try:
                    logger.info("Processing %s of %s" % (index+1, totalArtifacts))
                    if artifact.getArtifactType() in skip_artifact_type:
                        logger.info("Skipped artifactID %s of type %s" % (artifact.id, artifact.getArtifactType()))
                        continue
                    artifactID = artifact.id
                    if artifact.revisions[0].publishTime:
                        #construct new modality urls for artifact
                        artifact_url = self.getNewModalityURLForArtifact(artifact)
                        _artifact_url = h.safe_encode(artifact_url).replace(SERVER_URL, '') 
                        _artifact_url = quote(_artifact_url)
                        _artifact_url = "%s%s" % (SERVER_URL, _artifact_url)
                        errorDict = {}
                        errorDict['artifactID'] = artifactID
                        errorDict['artifact_url'] = cgi.escape(artifact_url)
                        errorDict['artifact_title'] = cgi.escape(artifact.getTitle())
                        logger.info("Calling url %s" % _artifact_url)
                        try:
                            req = urllib2.Request(_artifact_url)
                            req.add_header("User-Agent", USER_AGENT)
                            response = urllib2.urlopen(req)
                        except Exception as e:
                            errorDict['reason'] = "Remote API Exception : [%s]" % (str(e))
                            logger.info("Failed to validate artifact url [%s] : Error: %s"% (artifact_url, str(e)), exc_info=e)
                            InvalidArtifacts.append(errorDict)
                            continue
                        _url = response.geturl()
                        responseCode = response.getcode()
                        if responseCode != 200:
                            logger.info("Invalid response code from server [%s] for artifactID [%s]" % (responseCode, artifactID))
                            errorDict['reason'] = "Invalid HTTP Status Code [%s]" % responseCode
                            InvalidArtifacts.append(errorDict)
                            continue
                        protocolRelativeUrl = _url.lower().replace('http://', '').replace('https://', '').rstrip('/?&#')
                        protocolRelativeArtifactUrl = _artifact_url.lower().replace('http://', '').replace('https://', '').rstrip('/?&#')
                        if protocolRelativeUrl != protocolRelativeArtifactUrl:
                            errorDict['reason'] = "Server Returned different url [%s]" % _url
                            InvalidArtifacts.append(errorDict)
                            logger.info("Invalid artifact url [%s], server returned [%s] for artifactID [%s]" % (_artifact_url, _url, artifactID))
                            continue
                        #Check if artifact url is accessible to anonymous user
                        response = response.read()
                        artifact_html = BeautifulSoup(response)
                        xhtml = artifact_html.find("article")
                        if not xhtml and response.index('auth/signin') != -1:
                            logger.info("Server returned signin page for  artifactID [%s], url [%s]," % (artifactID, _url))
                            errorDict['reason'] = "Server Returned signin page for CK-12 owned contents [%s]" % _url
                            InvalidArtifacts.append(errorDict)
                            continue
                        details_api = '%s%s%s' % (SERVER_URL,'/flx/get/detail/', artifactID)
                        try:
                            #TODO: Instead of calling details api, artifact xhtml can be directly used.
                            logger.info("Details url : %s" % details_api)
                            req = urllib2.Request(details_api)
                            req.add_header("User-Agent", USER_AGENT)
                            response = urllib2.urlopen(req)
                            response = response.read()
                            response = json.loads(response)
                        except Exception as e:
                            logger.info("Server returned invalid json for artifactID [%s]. api : [%s]" % (artifactID, details_api))
                            errorDict['reason'] = "Server returned invalid json for [%s]" % (details_api)
                            InvalidArtifacts.append(errorDict)
                            continue
                        if not response['response']['artifact']['hasXhtml']:
                            continue
                        artifact_html = BeautifulSoup(response['response']['artifact']['xhtml'])
                        urls = []
                        anchor_tags = artifact_html.findAll("a")
                        for a_tag in anchor_tags:
                            href = a_tag.get("href")
                            if href and not self.skip_url_validation(href):
                                logger.info(href)
                                urls.append(href)
                        image_tags = artifact_html.findAll("img")
                        for i_tag in image_tags:
                            src = i_tag.get("src")
                            if src and not self.skip_url_validation(src):
                                logger.info(src)
                                urls.append(src)
                        iframe_tags = artifact_html.findAll("iframe")
                        for if_tag in iframe_tags:
                            src = if_tag.get("src")
                            if src and not self.skip_url_validation(src):
                                logger.info(if_tag.get("src"))
                                urls.append(if_tag.get("src"))

                        def fetch(url):
                            if not url.startswith("http"):
                                url = SERVER_URL + url
                            if not (url.startswith(SERVER_URL) or url.startswith("https://www.ck12.org")):
                                errorDict['external'] = 'Yes'
                            ## Fix the CDN urls to use http - since python does not support the cloudfront's new SSL connections
                            if url.startswith('https://') and 'cloudfront.net/' in url:
                                url = url.replace('https://', 'http://')
                            logger.info('Calling url %s' % url )
                            try:
                                req = urllib2.Request(url)
                                req.add_header("User-Agent", USER_AGENT)
                                response = urllib2.urlopen(req)
                            except Exception as e:
                                errorDict['reason'] = "Failed to validate url [%s] from artifact contents : Error: %s" % (url, str(e))
                                InvalidArtifacts.append(errorDict)
                                logger.error("Failed to validate url [%s] from artifact contents : Error: %s"% (url, str(e)), exc_info=e)
                                return None, None
                            return url, response
                            
                        pool = eventlet.GreenPool(300)
                        for url, response in pool.imap(fetch, urls):
                            if not url and not response:
                                continue
                            responseCode = response.getcode()
                            if responseCode != 200:
                                errorDict['reason'] = "Error In XHML content for url, responsecode [%s]" % url, responseCode
                                InvalidArtifacts.append(errorDict)
                                logger.error("Invalid response code from server [%s] for artifactID [%s] for url[%s]" % (responseCode, artifactID, url))
                                continue
                        self.userdata = json.dumps({'pageNum': pageNum, 'pageSize':self.pageSize, 'processed': '%s of %s' %(index+1, totalArtifacts), "Invalid Artifacts" : InvalidArtifacts})
                        self.updateTask()
                except Exception as e:
                    logger.error('Error in processing artifact information for id %s : Exception[%s]' % (artifactID,str(e)))
        except Exception, e:
            logger.error("%s: Exception while validating artifact urls" % str(e), exc_info=e)
        finally:
            sendEmailToEditor = str(self.config.get('send_notifications_to_ck12editor')).lower() == "true"
            if InvalidArtifacts and sendEmailToEditor:
                logger.info("Invalid Artifacts Dict for pageNum[%s] with pageSize [%s] :" % (pageNum, self.pageSize))
                logger.info(InvalidArtifacts)
                e = api.createEventForType(typeName='ARTIFACT_CONTENT_INVALID_URL', objectID=artifact.id, objectType='artifact', eventData=json.dumps(InvalidArtifacts), ownerID=owner.id, processInstant=False)
                n = api.createNotification(eventTypeID=e.eventTypeID, objectID=artifact.id, objectType='artifact', address=owner.email, subscriberID=owner.id, type='email', frequency='instant')
                h.processInstantNotifications([e.id], notificationIDs=[n.id], user=owner.id, noWait=True)
            self.userdata = json.dumps({'pageNum': pageNum, 'pageSize':self.pageSize, "Invalid Artifacts" : InvalidArtifacts})
            self.updateTask()
        return self.userdata

                

    def getNewModalityURLForArtifact(self, artifact):
        """
            1. Get List of distinct domain ecodedID's
            2. Get brach name for each encode ID,
            3. Consturct new modality url
            4. Return the artifact_url
        """
        artifact_domain = artifact.getDomain()
        if (not artifact_domain or artifact_domain.get('encodedID', None) is None) and artifact.getArtifactType() in bookTypes:
            return "%s%s" % (SERVER_URL, artifact.getPerma())
        allEIDS = ['.'.join( artifact_domain['encodedID'].split('.')[:2] )] if artifact_domain else []
        allEIDS = list(set(allEIDS)) # Get the distinct encodedID's from the ecodeedID list
        artifact_url = None
        try:
            eid_branch_dict = self.getBranchHandlesByEIDs(allEIDS)
        except Exception, e:
            logger.error('Error in getting browse Term for %s : Exception[%s]' % (allEIDS,str(e)))
        if artifact_domain :
            browse_term_short = '.'.join( artifact_domain['encodedID'].split('.')[:2])
            browseTerm = {}
            browseTerm[browse_term_short] = eid_branch_dict[browse_term_short]
            artifact_url = self.getNewModalityURL(browseTerm,artifact)
        else:
            artifact_url = '%s%s'%(SERVER_URL,artifact.getPerma())
        return artifact_url
        
    def getNewModalityURL(self, browseTerm,artifact):
        """ Get New Modality url in for following format 
            http://<host>/<branch>/<concept-handle>/<modality-type>/<realm>/<modality-handle>"""
        artifactDict = artifact.asDict()
        if not browseTerm:
            return None
        if browseTerm.keys()[0].startswith('UGC'):
            branch = 'na'
        else:
            branch = browseTerm[browseTerm.keys()[0]]
        if branch is None:
            branch = ''    
        if artifactDict['artifactType'] in bookTypes:
            return "%s%s" % (SERVER_URL, artifactDict['perma'])
        else:
            return "%s/%s/%s/%s/%s" % (SERVER_URL, branch.lower(), artifactDict['domain']['handle']\
                                            , artifactDict['artifactType'], artifactDict['handle'])
    
    def getBranchHandlesByEIDs(self, eids=None):
        """
            Make flx API call to get the branch name from encodedID
        """
        if not eids:
            return None
        browseTerms =  api.getBrowseTermByEncodedIDs(encodedIDList=eids)
        result = {}
        for browseTerm in browseTerms:
            result[browseTerm.encodedID] = browseTerm.handle
        return result
