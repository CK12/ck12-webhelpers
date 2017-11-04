import logging
import os
import json
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 
import urllib
from urllib2 import unquote
from urllib2 import urlparse
from urllib2 import build_opener
from xml.dom.minidom import parseString
from datetime import datetime

from pylons import request, session, url, tmpl_context as c, config
from pylons.controllers.util import redirect
from beaker.cache import CacheManager
from beaker.util import parse_cache_config_options

from flx.controllers import decorators as d
from flx.lib.base import BaseController, render
from flx.controllers.celerytasks import gdt
from flx.controllers.errorCodes import ErrorCodes
import flx.controllers.user as u

import httplib2
from apiclient.discovery import build
from apiclient.http import MediaFileUpload
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.client import AccessTokenCredentials

GOOGLE_AUTHSUB_URL = r'https://www.google.com/accounts/AuthSubRequest?scope=https%3A%2F%2Fdocs.google.com%2Ffeeds%2F&session=1&secure=0&next='
GOOGLE_AUTHSUB_SESSION_URL = r'https://www.google.com/accounts/AuthSubSessionToken'
GOOGLE_SERVER = 'https://docs.google.com'
GOOGLE_LIST_DOCUMENTS_API = '/feeds/documents/private/full?category=document'
#GOOGLE_LIST_FOLDERS_API = '/feeds/default/private/full/folder%3Aroot/contents?category=folder'
GOOGLE_LIST_FOLDERS_API = '/feeds/default/private/full?category=folder'


CLIENT_ID = config.get('CLIENT_ID')
CLIENT_SECRET = config.get('CLIENT_SECRET')
OAUTH_SCOPE = config.get('OAUTH_SCOPE')
REDIRECT_URI = config.get('REDIRECT_URI')
ADMIN_REDIRECT_URI = config.get('ADMIN_REDIRECT_URI')
REFRESH_REDIRECT_URI = config.get('REFRESH_REDIRECT_URI')
REFRESH_TOKEN_JSON_PATH = '/opt/2.0/flx/pylons/flx/refreshtoken.json'

DOCUMENT_TYPE = 'application/vnd.google-apps.document'
FOLDER_TYPE = 'application/vnd.google-apps.folder'
FIELDS = 'items(id,modifiedDate,title)'
MAX_RESULTS = 500

log = logging.getLogger(__name__)
cache_opts = {
            'cache.type': config.get('beaker.cache.type'), 
            'cache.data_dir': config.get('beaker.cache.data_dir'),
            'cache.url': config.get('beaker.cache.url'),
            }
cache = CacheManager(**parse_cache_config_options(cache_opts))

class GdtController(BaseController):

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def gdtImportArtifact(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        artifactHandle = None
        tofile = None
        try:
            member = u.getImpersonatedMember(member)
            command = None
            if request.POST.has_key('command'):
                command = request.POST['command']
                if command == 'gdocImport':
                    command = 'gdoc2xhtml'

            docID = request.params.get('docID')
            if not docID:
                raise Exception((_(u"docID must be specified.")).encode("utf-8"))

            title = request.params.get('title', '').strip()
            if not title:
                raise Exception((_(u"title for the artifact must be specified.")).encode("utf-8"))

            artifactHandle = title.replace(' ', '-')
            artifactType = request.params.get('artifactType', 'lesson')
            token = session.get('googleAuthToken')
            if not token:
                token = request.params.get('googleAuthTokenFromTest')

            log.info("Converting with docID: %s, authToken: %s" % (docID, token))

            tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
            tempf.close()
            tofile = tempf.name
            updateExisting = False
            if request.POST.has_key('updateExisting'):
                updateExisting = request.POST['updateExisting']
            gdtTask = gdt.GdtTask()
            handle = gdtTask.delay(command, docID, tofile, member.id, title, artifactHandle, artifactType, token, updateExisting=updateExisting, loglevel='INFO', user=member.id)
            taskID = handle.task_id
            log.info("Task id: %s" % taskID)
            result['response']['taskID'] = taskID
            return result
        except Exception, e:
            log.error('GDT import Exception[%s]' % str(e), exc_info=e)
            c.errorCode = ErrorCodes.CANNOT_IMPORT_GDT_DATA
            return ErrorCodes().asDict(c.errorCode, str(e))
        finally:
            if tofile and os.path.exists(tofile):
                os.remove(tofile)

    @d.checkAuth(request, True, True)
    @d.trace(log, ['member'])
    def gdtImportForm(self, member):
        c.prefix = self.prefix
        c.member = member
        c.googleAuthToken = session.get('googleAuthToken')
        ret = url(controller='gdt', action='googleAuthToken', qualified=True)
        if ret.startswith('https://'):
            ret = ret.replace('https://', 'http://')
        c.googleAuth = GOOGLE_AUTHSUB_URL + urllib.quote(ret)
        c.googleAuthLogout = url(controller='gdt', action='googleAuthLogout', qualified=True)
        c.googleAuthLogout += '?returnTo=' + urllib.quote(url(controller='gdt', action='gdtImportForm', qualified=True))
        return render('/flx/gdt/gdtimport.html')


    @d.checkAuth(request, False, True)
    @d.trace(log, ['member'])
    def googleAuthToken(self, member):
        token = request.params.get('code')
        error = request.params.get('error')
        rurl = request.params.get('redirectUrl')
        if token:
            log.info("Received single use token: %s" % token)
            # This will be admin request if the URL contains flxadmin.
            isAdmin = '1' if rurl.find('flxadmin') >= 0 else None
            credentials = self._getCredentials(auth_token=token, is_admin=isAdmin)
        else:
            log.error('No authentication token found in request')
            if not error:
                error = "No authentication token found in request"
            #raise Exception('No authentication token found in request.')
        
        if not rurl:
            rurl = url(controller='gdt', action='gdtImportForm', qualified=True)
        if error:
            rurl += '?error=%s' % error
            log.info("With error Redirecting to: %s" % rurl)
            return redirect(rurl)

        rurl += '?token=%s' % session.get('googleAuthToken')
        log.info("Redirecting to: %s" % rurl)
        return redirect(rurl)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def googleAuthURL(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            isAdmin = request.params.get('isAdmin')            
            if isAdmin and isAdmin == "1":
                redirect_uri = ADMIN_REDIRECT_URI
            else:
                redirect_uri = REDIRECT_URI
            flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=OAUTH_SCOPE, redirect_uri=redirect_uri)
            authorize_url = flow.step1_get_authorize_url()
            log.info('authorize_url :: %s' %authorize_url)
            result['response']['googleAuthURL'] = authorize_url
            return result
        except Exception as e:
            log.error('Error getting google authorization URL: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_GOOGLEDOC_AUTH, str(e))


    @d.trace(log)
    def googleAuthLogout(self):
        """
            Logout from Google auth session - basically simply remove the googleAuthToken
            from session
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        start = datetime.now()
        try:
            if session.has_key('googleAuthToken'):
                del session['googleAuthToken']
                session.save()
            returnTo = request.params.get('returnTo')
            if not returnTo:
                return d.jsonifyResponse(result, start)
        except Exception as e:
            log.error('Error logging out of google doc authentication: %s' % str(e), exc_info=e)
            return d.jsonifyResponse(ErrorCodes().asDict(ErrorCodes.NO_SUCH_GOOGLEDOC_AUTH, str(e)), start)
        ## Redirect
        if returnTo:
            log.info("Redirecting to: %s" % returnTo)
            return redirect(returnTo)

    @d.jsonify()
    @d.checkAuth(request)
    @d.trace(log, ['member'])
    def isGoogleDocAuthenticated(self, member):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            token = session.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Not authenticated for Google Docs')).encode("utf-8"))
            # Verify if we can retrieve the service object.
            service = self._getGoogService(token)
            result['response']['googleDocAuthenticated'] = True
            return result
        except Exception as e:
            # User is not authenticated with Google, If any auth related data present in session remove it.
            for skey in ['googleAuthToken', 'googleAuthCredentials', 'googleRefreshToken']:
                if session.has_key(skey):
                    del session[skey]
            session.save()
            log.error('Error getting google doc authenticated check: %s' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.NO_SUCH_GOOGLEDOC_AUTH, str(e))

    def _getNodeText(self, node):
        text = ''
        try:
            for node in node.childNodes:
                if node.nodeType == node.TEXT_NODE:
                    text = text + node.data
            return text
        except Exception as e:
            log.error("Error getting text for node[%s]" % str(e), exc_info=e)
        return text

    def _getAttributeValue(self, node, attribute):
        text = ''
        try:
            text = node.getAttribute(attribute)
        except Exception as e:
            log.error("Error getting attribute for node[%s]" % str(e), exc_info=e)
        return text

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def listDocuments(self, member, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            token = session.get('googleAuthToken') or request.params.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Must authenticate with Google')).encode("utf-8"))
            service = self._getGoogService(token)
            results = []
            param = {}
            # Only fetch documents not folders , and do not list trashed files. 
            param['q'] = "mimeType='%s' and trashed=false" % (DOCUMENT_TYPE)
            param['fields'] = FIELDS
            param['maxResults'] = MAX_RESULTS
            files = service.files().list(**param).execute()
            results.extend(files['items'])
            total = len(results)    
            if pageSize:
                start = ((pageNum-1) * pageSize)
                end = start + pageSize
            results = results[start:end]	
            documents = []
            # Prepare the documents.
            for record in results:
                tmp_dict = dict()
                tmp_dict['id'] = record['id']
                tmp_dict['docID'] = record['id']
                tmp_dict['title'] = record['title']
                tmp_dict['updated'] = record['modifiedDate']
                documents.append(tmp_dict)
            result['response']['documents'] = documents
            result['response']['total'] = total
            result['response']['limit'] = len(documents)
            result['response']['offset'] = (pageNum - 1)*pageSize
            return result
        except Exception as e:
            log.error('GDT list documents exception:[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_LIST_GOOGLE_DOCUMENTS, str(e))

    #@cache.cache('_listGoogleFolders', expire=3600)
    def _listGoogleFolders(self, token, url):

        if not token:
            raise Exception((_(u'Must authenticate with Google')).encode("utf-8"))
        folders = []

        service = self._getGoogService(token)
        param = {}
        # Only fetch folders not documents , and do not list trashed files. 
        param['q'] = "mimeType='%s' and trashed=false" % (FOLDER_TYPE)
        param['fields'] = FIELDS
        param['maxResults'] = MAX_RESULTS
        results = []
        files = service.files().list(**param).execute()
        results.extend(files['items'])
        # Prepare folders.
        for record in results:
            tmp_dict = dict()
            tmp_dict['id'] = record['id']
            tmp_dict['title'] = record['title']
            tmp_dict['updated'] = record['modifiedDate']
            folders.append(tmp_dict)
        return folders

    @d.jsonify()
    @d.checkAuth(request, False, True)
    @d.setPage(request, ['member'])
    @d.trace(log, ['member', 'pageNum', 'pageSize'])
    def listFolders(self, member, pageNum, pageSize):
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        try:
            token = session.get('googleAuthToken') or request.params.get('googleAuthToken')
            if not token:
                raise Exception((_(u'Must authenticate with Google')).encode("utf-8"))

            start = ((pageNum-1) * pageSize) 
            end = start + pageSize
            if start == 0:
                log.info("Start from 0 - invalidate cache")
                #cache.invalidate(self._listGoogleFolders, '_listGoogleFolders', token)
            folders = self._listGoogleFolders(token, url)
            docs = folders
            log.info("start: %s, end: %s, pageSize: %s, total: %d" % (start, end, pageSize, len(folders)))
    	    if pageSize:
                docs = folders[start:end]

            result['response']['folders'] = docs
            result['response']['limit'] = len(docs)
            result['response']['offset'] = (pageNum - 1)*pageSize
            result['response']['total'] = len(folders)
            log.debug("Result: %s" % result['response'])
            return result
        except Exception as e:
            log.error('GDT list documents exception:[%s]' % str(e), exc_info=e)
            return ErrorCodes().asDict(ErrorCodes.CANNOT_LIST_GOOGLE_DOCUMENTS, str(e))

    def _getGoogService(self, token):
        """
        Get the Google service object.
        """
        http = httplib2.Http()		
        credentials = self._getCredentials(access_token=token)
        #http.disable_ssl_certificate_validation = True
        # Build the service object
        http = credentials.authorize(http)
        service = build('drive', 'v2', http=http)
        return service

    def _getCredentials(self, auth_token=None, access_token=None, is_admin=None):
        """
        """
        save = False        
        credentials = session.get('googleAuthCredentials')
        # Prpeare the credentials.
        if not credentials:
            if auth_token:
                # Create credentials from oauthflow, only once.	
                if is_admin and is_admin == "1":
                    redirect_uri = ADMIN_REDIRECT_URI
                else:
                    redirect_uri = REDIRECT_URI
                flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=OAUTH_SCOPE, redirect_uri=redirect_uri)
                flow.redirect_uri = redirect_uri
                credentials = flow.step2_exchange(auth_token)
            else:
                credentials = AccessTokenCredentials(access_token, 'ck-12')
                if credentials.invalid or credentials.access_token_expired:
                    raise Exception('Google docs credentials invalid/expired, Please relogin.')
            save = True
        else:
            # Raise exception if credentials are invalid.
            if credentials.invalid:
                raise Exception('Google docs invalid credentials, Please relogin.')
            # Refresh the access token if expired.
            if credentials.access_token_expired:
                http = httplib2.Http()
                try:
                    credentials.refresh(http)
                except Exception as e:
                    raise Exception('Google docs AccessToken expired, Please relogin.')
                save = True
        if save:
            # Save credentials in session.
            session['googleAuthCredentials'] = credentials
            session['googleAuthToken'] = credentials.access_token
            try:
                googleRefreshToken = credentials.refresh_token
            except Exception as e:
                googleRefreshToken = None
            session['googleRefreshToken'] = googleRefreshToken
            session.save()
            log.info('Saving Tokens, AccessToken: %s, RefreshToken:%s' % (credentials.access_token, googleRefreshToken))            

        return credentials

    @d.trace(log)    
    def generateRefreshToken(self):
        """
        """
        flow = OAuth2WebServerFlow(client_id=CLIENT_ID,client_secret=CLIENT_SECRET, scope=OAUTH_SCOPE, redirect_uri=REFRESH_REDIRECT_URI)
        authorize_url = flow.step1_get_authorize_url()
        log.info('authorize_url :: %s' %authorize_url)
        return redirect(authorize_url)

    @d.jsonify()
    @d.trace(log)    
    def refreshToken(self):
        """
        """
        result = BaseController.getResponseTemplate(self, ErrorCodes.OK, 0)
        log.info('request.params :: %s' %request.params)
        code = request.params.get('code')
        flow = OAuth2WebServerFlow(CLIENT_ID, CLIENT_SECRET, OAUTH_SCOPE, REFRESH_REDIRECT_URI)
        flow.redirect_uri = REFRESH_REDIRECT_URI
        credentials = flow.step2_exchange(code)
        log.info('Refresh credentials: %s' % credentials)

        if credentials:
            jsonData = credentials.to_json()
            fp = open(REFRESH_TOKEN_JSON_PATH, "w")
            fp.write(jsonData)
            fp.close()
            result['response']['msg'] = 'Successfully saved the refresh token.'
        else:
            result['response']['msg'] = 'Unable to generate refresh token.'
        
        return result
