#!/usr/bin/python
import mailbox
import re
import sys
import jsonlib
import urllib
import urllib2
import smtplib
from email.mime.text import MIMEText
from pylons.i18n.translation import _ 
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import time
import logging
import os
from tempfile import NamedTemporaryFile
from datetime import datetime
from flx.lib.ck12_eflex_lib import egx_settings
from flx.lib.wiki_importer_lib.api_manager import APIManager
from flx.model import api
import flx.lib.helpers as h
from flx.lib.search import solrclient
from flx.controllers.resourceHelper import ResourceHelper
from flx.controllers.celerytasks import pdf
from flx.controllers.celerytasks import gdt
import traceback
from pylons import config

renderer_celerytask_home = 'flx.controllers.celerytasks'

########### Config Params ################
from flx.lib.helpers import load_pylons_config
config = load_pylons_config()
# Web Host Name
WEB_PREFIX_URL = config.get('web_prefix_url')

# Web Host Name
FLX_PREFIX_URL = config.get('flx_prefix_url')

#Eflex User ID
EFLEX_USER_ID = config.get('eflex_user_id')

# SMTP Host Name
SMTP_HOST_NAME = config.get('smtp_server')

# EGX Admin Mail ID
EGX_ADMIN_MAIL_ID = egx_settings.EGX_ADMIN_MAIL_ID

# Path to mail templates directory
MAIL_TEMPLATE_DIR = egx_settings.MAIL_TEMPLATE_DIR
#MAIL_TEMPLATE_DIR ='/san/beta-setup/misc/email_gateway/'

#Cover images
GENERIC_CONCEPT_COVER = egx_settings.DEFAULT_CONCEPT_COVER
GENERIC_LESSON_COVER = egx_settings.DEFAULT_LESSON_COVER
GENERIC_CHAPTER_COVER = egx_settings.DEFAULT_CHAPTER_COVER
GENERIC_FLEXBOOK_COVER = egx_settings.DEFAULT_BOOK_COVER

#Threshold failure limit
THRESHOLD_FAILURE_LIMIT = egx_settings.THRESHOLD_FAILURE_LIMIT

#Initialing Debugger
logging = logging.getLogger(__name__)

class CK12EflexGateway():
    #not really __init__ becayse Daemon class has one that I don't want to overide..
    def __init__(self,cache=None):
        self.book_title = ''
        self.new_book_title = ''
        self.is_book_title_changed = False
        self.artifact_handle = None
        self.concept_desc = ''
        self.mail_sender = ''
        self.user_id = 4
        self.artifact_cache = cache
        try:
            if EFLEX_USER_ID:
                self.user_id = int(EFLEX_USER_ID)
            else:
                self.user_id = 4
        except Exception as e:
            self.user_id = 4
        self.cover_image = None
        from flx.lib.helpers import load_pylons_config
        self.config = load_pylons_config()
        self.defaultImageHost = self.config.get('default_image_host')
        self.downloadPrefix = self.config.get('pdf_download_prefix')
        self.mathSatelliteServer = self.config.get('math_satelite_server')
        self.artifact_type = ''
        self.rh = ResourceHelper()
        self.skipDomains = ['forward', 'coverimage']
        fp = open(MAIL_TEMPLATE_DIR +'mail_body.txt', 'rb')
        self.message_template =  fp.read()
        fp = open(MAIL_TEMPLATE_DIR +'mail_help_body.txt', 'rb')
        self.help_message_template =  fp.read() 
        fp = open(MAIL_TEMPLATE_DIR +'mail_failure_notice.txt', 'rb')
        self.failure_message_template =  fp.read()
        fp = open(MAIL_TEMPLATE_DIR +'mail_thanks.txt', 'rb')
        self.thanks_message_template =  fp.read()
        fp = open(MAIL_TEMPLATE_DIR +'mail_invite.txt', 'rb')
        self.invite_message_template =  fp.read()
        fp = open(MAIL_TEMPLATE_DIR +'mail_thanks_to_contributor.txt', 'rb')
        self.thanks_to_contributor_message_template =  fp.read()
    
    def setLogger(self, logger):
        logging = logger

    def setImageHost(self, defaultImageHost):
        self.defaultImageHost = defaultImageHost

    def setDownloadPrefix(self, downloadPrefix):
        self.downloadPrefix = downloadPrefix

    def process_email(self, user_email_path):
        try:
            email_file = open(user_email_path,'r')
            email_content = email_file.read()
            email_file.close()
            message = mailbox.MaildirMessage(email_content)
            subject = message['subject']
            sender = message['from']
            self.mail_sender = message['to']
            self.sender = sender
            self.message = message
            self.sender_raw_email = None
            self.eflexUserRequestID = None
            self.is_user_registered = 0
            try:
                email_id_re = re.compile('.*?<(.*?)>')
                self.sender_raw_email = email_id_re.findall(self.sender)[0]
            except Exception as e:
                self.sender_raw_email = None
            track_identifier_re = re.compile('^([\w\s\'"-.]+)[:;]\s*([\w\s\'"-.\[\]\{\}]+)$')
            track_identified = track_identifier_re.search(subject)
            is_message_valid = self.is_message_valid(track_identified,message)
            if track_identified and is_message_valid:
                self.book_title = track_identified.group(2)
            if self.is_user_blacklisted(self.sender_raw_email):
                info_to_admin ="\nUser Email Address: "+str(sender)
                info_to_admin += "\nMessage: "+message.__str__()
                subject = "Blacklist User's request" 
                self.mail_admin(subject, info_to_admin)
                return
            if track_identified == None or not is_message_valid:
                self.update_task_status(None, 4)
                self.mail_help(sender)
                return
            if self.sender_raw_email is not None and not self.can_allow_user(self.sender_raw_email):
                self.mail_invite(sender)
                return
            if self.sender_raw_email: 
                user_info = api.getMemberByEmail(email=self.sender_raw_email) 
                if user_info is None:
                    logging.info('eflex: email[%s] not found' % self.sender_raw_email)
                elif user_info.id:
                    self.user_id = user_info.id
                    logging.info('eflex: USER[%s] found' % self.user_id)
                self.eflexUserRequestID = self.save_eflex_request(self.message)
            if track_identified and is_message_valid:
                self.book_title = track_identified.group(2)
                if track_identified.group(1).lower().strip() == 'create':
                    self.artifact_type = 'flexbook'
                    msg = "request for the book \""+self.book_title+"\""
                    self.mail_thanks(sender, msg)
                    self.update_task_status(self.eflexUserRequestID, 2)
                    self.search_artifacts(message)
                    logging.debug("Print Now: "+ self.book_title)
                elif track_identified.group(1).lower().strip() == 'contribute':
                    msg = "request for the book %s"% self.book_title
                    self.mail_thanks(sender, msg)
                    self.update_task_status(self.eflexUserRequestID, 2)
                    artifact_source, googledoc_id = self.get_artifact_source(message)
                    if artifact_source == 'googledoc':
                        artifact_details = self.contribute_artifact_from_googledoc(googledoc_id,self.book_title)
                        artifact_details['artifactType'] = 'concept'
                        if artifact_details: 
                            self.mail_result_to_contributor(sender, artifact_details)
                    else:
                        self.mail_help(sender)
                else:
                    self.mail_help(sender)
        except Exception,e:
            print traceback.format_exc()    
            failure_reason = 'your request for the book "%s" cannot be processed at the moment, we will get back to you shortly' %(self.book_title)
            self.mail_failure_notice(sender, failure_reason)
            #info_to_admin = "EGX Request ID: "+str(egx_request_id)
            info_to_admin ="\nUser Email Address: "+str(sender)
            info_to_admin += "\nFailure Reason: Exception: "+e.__str__()
            subject = "Exception thrown" 
            self.mail_admin(subject, info_to_admin)

    def get_artifact_source(self, message):
        if (message.is_multipart()) :
            body = message.get_payload()
            mail_content = body[0].get_payload()
        else :
            mail_content = message.get_payload()
        p = re.compile('@([Gg]oogle[Dd]oc)\s*[:;]\s*(.*)')
        match = p.findall(mail_content)
        artifact_source = None
        googledoc_id = None
        if match:
            artifact_source = match[0][0].lower()
            googledoc_id = match[0][1]
            return artifact_source, googledoc_id
        else:
            return None, None

    def save_eflex_request(self, message):
        subject = message['subject']
        sender = message['from']
        if (message.is_multipart()) :
            body = message.get_payload()
            mail_content = body[0].get_payload()
        else :
            mail_content = message.get_payload()
        eflexUserDetailID = self.save_eflex_user_detail()
        eflexUserRequestID = None
        if eflexUserDetailID:     
            kwargs = {}
            kwargs['eflexUserDetailID'] = eflexUserDetailID
            kwargs['requester'] = self.sender_raw_email
            kwargs['title'] = subject
            kwargs['emailBody'] = mail_content
            kwargs['status'] = 1
            kwargs['artifactID'] = 0
            eflexUserRequest = api.createEflexUserRequest(**kwargs)
            eflexUserRequestID = eflexUserRequest.id
        return eflexUserRequestID

    def update_task_status(self, eflexUserRequestID, status):
        if eflexUserRequestID:
            kwargs = {}
            kwargs['id'] = eflexUserRequestID
            kwargs['status'] = status
            eflexUserRequest = api.updateEflexUserRequest(**kwargs)
            eflexUserDetail = api.getEflexUserDetailByID(id=eflexUserRequest.eflexUserDetailID)
        else:
            eflexUserDetail = api.getEflexUserDetailByEmail(email=self.sender_raw_email)
        if eflexUserDetail:
            kwargs = {}
            kwargs['id'] = eflexUserDetail.id
            if status == 4 or status == 5:
                kwargs['errorCount'] = eflexUserDetail.errorCount + 1
                if kwargs['errorCount'] > THRESHOLD_FAILURE_LIMIT:
                    kwargs['isBlacklisted'] = 1
                if eflexUserDetail.isRegistered == 1:
                    kwargs['isBlacklisted'] = 0
            elif status == 3:
                kwargs['isSuccessful'] = 1
                kwargs['errorCount'] = 0
            eflexUserDetail = api.updateEflexUserDetail(**kwargs)
   
    def update_eflex_user_request_artifact_id(self, eflexUserRequestID, artifactID):
        if eflexUserRequestID:
            kwargs = {}
            kwargs['id'] = eflexUserRequestID
            kwargs['artifactID'] = artifactID
            eflexUserRequest = api.updateEflexUserRequest(**kwargs)
     
  
    def save_eflex_user_detail(self):
        member = api.getMemberByEmail(email=self.sender_raw_email) 
        eflexUserDetailID = None
        if member:
            isRegistered = True
            eflex_user_detail = api.getEflexUserDetailByEmail(email=self.sender_raw_email)
            if eflex_user_detail:
                eflexUserDetailID = eflex_user_detail.id
            else:
                kwargs = {}
                kwargs['memberID'] = member.id
                kwargs['email'] = self.sender_raw_email
                kwargs['isSuccessful'] = 0
                kwargs['errorCount'] = 0
                kwargs['isBlacklisted'] = 0
                kwargs['isRegistered'] = 1
                eflex_user_detail = api.createEflexUserDetail(**kwargs) 
                if eflex_user_detail:
                    eflexUserDetailID = eflex_user_detail.id
            
        else:
            isRegistered = False
        if not isRegistered:
            eflex_user_detail = api.getEflexUserDetailByEmail(email=self.sender_raw_email)
            if eflex_user_detail:
                eflexUserDetailID = eflex_user_detail.id
            else:
                kwargs = {}
                kwargs['memberID'] = self.user_id
                kwargs['email'] = self.sender_raw_email
                kwargs['isSuccessful'] = 0
                kwargs['errorCount'] = 0
                kwargs['isBlacklisted'] = 0
                kwargs['isRegistered'] = 0
                eflex_user_detail = api.createEflexUserDetail(**kwargs) 
                if eflex_user_detail:
                    eflexUserDetailID = eflex_user_detail.id
        return eflexUserDetailID 
  
    def is_user_blacklisted(self, emailID):  
        eflex_user_detail = api.getEflexUserDetailByEmail(email=emailID)
        is_blacklisted = False
        if eflex_user_detail:
            if eflex_user_detail.isBlacklisted == 1:
                is_blacklisted = True
        return is_blacklisted
 
    def can_allow_user(self, emailID):
        eflex_user_detail = api.getEflexUserDetailByEmail(email=emailID)
        member = api.getMemberByEmail(email=emailID)
        can_allow = True
        if eflex_user_detail:
            if eflex_user_detail.isBlacklisted == 1:
                can_allow = False
            if eflex_user_detail.isBlacklisted == 0 and eflex_user_detail.isRegistered == 0 and eflex_user_detail.isSuccessful == 1:
                can_allow = False
            if eflex_user_detail.isBlacklisted == 0 and eflex_user_detail.isRegistered == 0 and eflex_user_detail.isSuccessful == 1 and member:
                try:
                    kwargs = {}
                    kwargs['id'] = eflex_user_detail.id
                    kwargs['memberID'] = member.id
                    kwargs['isRegistered'] = 1
                    api.updateEflexUserDetail(**kwargs)
                    can_allow = True
                except Exception as e:
                    logging.error('Error: %s' % e.__str__())
                    can_allow = True
            self.is_user_registered = eflex_user_detail.isRegistered 
        if not can_allow:
            self.update_task_status(None, 5)
        return can_allow
    
    def search_artifacts(self, message):
        if (message.is_multipart()) :
            body = message.get_payload()
            mail_content = body[0].get_payload()
        else :
            mail_content = message.get_payload()
        p = re.compile('^([@\w\s\'"-.]+)[:;]\s*([\w\s\'"-.]+)$', re.M)
        logging.debug(mail_content)
        topics = p.findall(mail_content)
        new_topics = []
        for each in topics:
            new_entry = []
            new_entry.append(each[0])
            new_entry.append(each[1])
            if new_entry[0].__contains__('\n'):
                new_entry[0] = new_entry[0].split('\n')[1]
            new_topics.append(new_entry)
        topics = new_topics
        self.order_parameters =""
        self.concepts =""
        index = 1
        self.concept_arts = []
        self.concept_ids = {}
        forward = {}
        if topics:
            p = re.compile('@[fF]orward(.*?)\s*[:;]\s*(.*?):', re.DOTALL)
            match = p.findall(mail_content)
            if match:
                for each_match in match:
                    try:
                        new_entry = []
                        new_entry.append(each_match[0])
                        new_entry.append(each_match[1])
                        tmp = new_entry[1].split('\n')
                        tmppop = tmp.pop()
                        new_entry[1] = ''.join(tmp)
                        if forward.__contains__(new_entry[0]):
                            forward[new_entry[0]] = '%s%s'%(forward[new_entry[0]],new_entry[1])
                        else:
                            forward[new_entry[0]] = new_entry[1]
                        forward[new_entry[0]] = forward[new_entry[0]].replace('\n','')
                    except Exception as e:
                        continue
            else:
                p2 = re.compile('@[fF]orward(.*?)\s*[:;]\s*(.*)', re.DOTALL)
                match = p2.findall(mail_content)
                if match:
                    for each_match in match:
                        try:
                            new_entry = []
                            new_entry.append(each_match[0])
                            new_entry.append(each_match[1])
                            if forward.__contains__(new_entry[0]):
                                forward[new_entry[0]] = '%s%s'%(forward[new_entry[0]],new_entry[1])
                            else:
                                forward[new_entry[0]] = new_entry[1]
                            forward[new_entry[0]] = forward[new_entry[0]].replace('\n','')
                        except Exception as e:
                            continue
                
            p = re.compile('@[cC]over[iI]mage\s*[:;]\s*(.*)')
            match = p.findall(mail_content)
            if match:
                self.cover_image = match[0]
            

        print "TOPICS: %s" % topics
        for tupple in topics:
            searchDomain = tupple[0]
            searchTerm = tupple[1]
            #artifact_source, googledoc_id = self.get_artifact_source(message)
            if searchDomain.replace('@','').lower() == 'googledoc':
                googledoc_id = searchTerm.replace('\n','').strip()
                artifact_details = self.contribute_artifact_from_googledoc(googledoc_id,'','concept')
                self.concept_arts.append(artifact_details)
                self.concept_ids[index] = artifact_details['id']
                self.concepts += artifact_details['title'] +", \n"
                index = index + 1
                self.order_parameters += tupple[0].strip() +': '+ tupple[1].strip() +"\n"
                continue
            elif any([searchDomain.replace('@','').lower().startswith(i) for i in self.skipDomains]):
                continue
 
            self.order_parameters += tupple[0].strip() +': '+ tupple[1].strip() +"\n"
            #sort = solrclient.getSortOrder('score')
            # Bug-9112 eFlex search implementation should be via external API
            # Instead of directly invoking the Search API from api.py file behaviour is changed API call
            # e.g: <host name>://flx/search/concept/<term>
            #Old method : hits = api.searchArtifacts(domain=None, term="%s: %s"%(searchDomain, searchTerm), typeNames=['concept'], fq=[], sort=sort, start=0, rows=1, memberID=None)
            searchDomain = searchDomain.strip('\n')
            searchTerm = searchTerm.strip('\n')
            if '\n' in searchTerm:
                searchTerm = searchTerm.split('\n')[0]
            search_api = '/flx/search/lesson/%s?filters=False&pageSize=1' % (urllib2.quote('%s %s' % (searchDomain, searchTerm)))
            search_api = FLX_PREFIX_URL + search_api
            print "Search API: %s" % search_api
            response = urllib2.urlopen(search_api)
            res = response.read()
            jsonResponse = jsonlib.read(res)
            artifactList = []
            if len(jsonResponse['response']['Artifacts']['result']) is not 0 :
                artifactList = [jsonResponse['response']['Artifacts']['result'][0]]
            artifactDict = {
                            'total': jsonResponse['response']['Artifacts']['limit'],
                            'limit': len(artifactList),
                            'offset': 0,
                            'result': artifactList,
                            'filters': jsonResponse['response']['Artifacts']['filters'],
                           }
            if artifactDict['result'] and not self.concept_ids.values().__contains__(artifactDict['result'][0]['revisions'][0]['artifactID']):
                self.concept_arts.append(artifactDict['result'][0])
                self.concept_ids[index] = artifactDict['result'][0]['revisions'][0]['artifactID']
                self.concepts += artifactDict['result'][0]['revisions'][0]['title'] +", \n"
                index = index + 1

        if self.concept_arts:
            book_id, book_rev_id = self.build_book()
            
            if self.user_id == 4 :
                self.update_eflex_user_request_artifact_id(self.eflexUserRequestID,book_id)
            if book_id:
                artifact = api.getArtifactByID(id=book_id)
                self.artifact_handle = artifact.handle
                artifactDict = artifact.asDict()
                self.artifact_realm = artifactDict['realm']
            #pdf_response = self.schedule_render_pdf(book_rev_id)
            #pdf_response = self.schedule_render_pdf(book_id, book_rev_id)
            render_result_urls = {}
            if not forward:
                forward['pdf'] = ''
            render_result_urls = self.render_book(forward, book_id, book_rev_id)
            title_change_info = ''
            if self.is_book_title_changed:
                title_change_info = 'We changed the book title to "%s", as there exists a book titled "%s" in your library.' % (self.new_book_title, self.book_title)
            if self.is_book_title_changed and str(self.is_user_registered) == '0':
                title_change_info = 'We changed the book title to "%s", as the book title "%s" is unavailable.' % (self.new_book_title, self.book_title)
            self.mail_result(self.sender, render_result_urls, title_change_info)
            is_forward = False
            for each_email in forward.values():
                if each_email:
                    is_forward = True
                    break

            if is_forward:
                self.mail_result_pdf(self.sender, forward, render_result_urls, title_change_info)
        else:
            failure_reason = "your request didn't match any of our concepts."
            self.mail_failure_notice(self.sender, failure_reason)

    def render_book(self, forward, book_id, book_rev_id):
        render_result_urls = {}
        for render_type, forward_email in forward.items():
            render_type = render_type.lower()
            __import__('%s.%s' % (renderer_celerytask_home, render_type))
            render_class = sys.modules['%s.%s' % (renderer_celerytask_home, render_type)]
            render_obj = getattr(render_class, render_type)()
            if render_type == "epub":
                task = render_obj.delay(book_id, self.mathSatelliteServer, self.defaultImageHost, revisionID=book_rev_id, nocache=False, skip_notify=True, user=self.user_id)
            elif render_type == "mobi":
                task = render_obj.delay(book_id, self.mathSatelliteServer, self.defaultImageHost, revisionID=book_rev_id, nocache=False, skip_notify=True, user=self.user_id)
            else:
                task = render_obj.delay(book_id, self.downloadPrefix, self.defaultImageHost, revisionID=book_rev_id, nocache=False, skip_notify=True, user=self.user_id)
            pdf_response = {}
            task_id = task.task_id
            while True:
                task = api.getTaskByTaskID(taskID=task_id)
                task_status = task.status
                if task_status == "SUCCESS":
                    pdf_response = jsonlib.read(task.userdata)
                    render_result_urls[render_type] = pdf_response['downloadUri'] 
                    self.update_task_status(self.eflexUserRequestID, 3)
                    break
                elif task_status == "FAILURE":
                    failure_reason = 'your request for the book "%s" cannot be processed at the moment, we will get back to you shortly' %(self.book_title)
                    self.mail_failure_notice(self.sender, failure_reason)
                    render_result_urls[render_type] = None
                    self.update_task_status(self.eflexUserRequestID, 6)
                    break
                else:
                    time.sleep(10)

        return render_result_urls

    def contribute_artifact_from_googledoc(self, googledoc_id, artifact_title=None, artifact_type='lesson'):
        self.artifact_type = artifact_type
        artifact_details = {}
        if googledoc_id:
            gdtTask = gdt.GdtTask()
            command = 'gdoc2xhtml'
            docID = googledoc_id
            googleAuthToken = None
            if artifact_title:
                artifactHandle = artifact_title.replace(' ', '-')
            else:
                artifactHandle = ''
            tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
            tempf.close()
            tofile = tempf.name
            handle = gdtTask.delay(command, docID, tofile, self.user_id, artifact_title, artifactHandle, self.artifact_type, googleAuthToken, loglevel='INFO', user=self.user_id)
            task_id = handle.task_id
            while True:
                task = api.getTaskByTaskID(taskID=task_id)
                task_status = task.status
                if task_status == "SUCCESS":
                    artifact_response = jsonlib.read(task.userdata)
                    artifact_details = artifact_response
                    artifact_id = artifact_details['id']
                    artifact = api.getArtifactByID(id=artifact_id) 
                    try:
                        if str(EFLEX_USER_ID) == str(self.user_id):
                            api.publishArtifactRevision(artifactRevision=artifact.revisions[0], recursive=True)
                        else:
                            logging.info("Did not publish artifact revision, the creator login is: %s" % artifact.creator.login)
                    except Exception as e:
                        logging.info("Couldn't publish artifact: %s" % e.__str__())
                    print artifact_details
                    self.update_task_status(self.eflexUserRequestID, 3)
                    break
                elif task_status == "FAILURE":
                    failure_reason = 'your request for the book "%s" cannot be processed at the moment, we will get back to you shortly' %(artifact_title)
                    self.mail_failure_notice(self.sender, failure_reason)
                    self.update_task_status(self.eflexUserRequestID, 6)
                    break
                else:
                    time.sleep(10)
        if self.user_id == 4 :
            self.update_eflex_user_request_artifact_id(self.eflexUserRequestID,artifact_details['id'])
        return artifact_details
         
    def build_book(self):
        artifact_info = {}
        artifact_info['title'] = self.book_title
        artifact_info['desc'] = self.book_title + " - generated via Eflex"
        artifact_info['children_ids'] = self.concept_ids 
        artifact_info['cover_image'] = self.cover_image
        artifact_type = 'book' 
        #api_manager = APIManager(config=self.config)
        #return api_manager.save_artifact_internal(artifact_info, self.user_id, 'book')
        kwargs = {}
        kwargs['typeName'] = artifact_type
        artifactType = api.getArtifactTypeByName(typeName=artifact_type)
        if artifact_type.lower() == "concept":
            generic_cover = GENERIC_CONCEPT_COVER
        elif artifact_type.lower() in [ "lesson", "section"]:
            generic_cover = GENERIC_LESSON_COVER
        elif artifact_type.lower() == "chapter":
            generic_cover = GENERIC_CHAPTER_COVER
            kwargs['bookTitle'] = artifact_info.get('bookTitle')
        elif artifact_type.lower() in ["book", "tebook", "workbook", "studyguide", "labkit"]:
            generic_cover = GENERIC_FLEXBOOK_COVER

        kwargs['creator'] = self.user_id
        kwargs['name'] = artifact_info.get('title')
        kwargs['description'] = artifact_info.get('desc')
        kwargs['handle'] = artifact_info.get('handle')
        if not kwargs['handle']:
            kwargs['handle'] = kwargs['name'].replace(' ', '-')
        kwargs['resources'] = []
        language = api.getLanguageByName(name='English')
        contentType = api.getResourceTypeByName(name='contents')
        contentDict = {
            'resourceType': contentType,
            'name': kwargs['name'],
            'description': kwargs['description'],
            'isExternal': False,
            'uriOnly': False,
            'languageID': language.id,
        }
        contentDict['contents'] = artifact_info.get('xhtml', '')
        kwargs['resources'].append(contentDict)

        children_ids = artifact_info.get('children_ids')
        if children_ids:
            kwargs['children'] = []
            for num in range(0,len(children_ids)):
                ca = api.getArtifactByID(id=children_ids[num+1])
                if ca:
                    kwargs['children'].append({'artifact': ca})

        artifact = None
        ## Check if artifact exists
        if kwargs.get('handle'):
            handle = kwargs['handle']
            artifact = api.getArtifactByHandle(handle=handle, typeID=artifactType.id, creatorID=self.user_id)

        logging.info("Children ids: %s" % artifact_info.get('children_ids'))
        logging.info("Authors: %s" % str(kwargs.get('authors')))
        try:
            if artifact:
                artifact_name = kwargs['name'] 
                is_artifact_exist = True
                while is_artifact_exist:
                        artifact_name = kwargs['name'] 
                        artifact_name_list = artifact_name.split(' ')
                        try:
                            artifact_name_list[len(artifact_name_list) - 1] = str(int(artifact_name_list[len(artifact_name_list) - 1]) + 1)
                            self.is_book_title_changed = True
                        except Exception as e:
                            kwargs['name'] = "%s 1" % artifact_name
                            self.is_book_title_changed = True
                            artifact_name = kwargs['name']
                            artifact_name_list = artifact_name.split(' ')
                        artifact_name = " ".join(artifact_name_list)
                        kwargs['name'] = artifact_name
                        kwargs['handle'] = kwargs['name'].replace(' ', '-')
                        handle = kwargs['handle']
                        artifact = api.getArtifactByHandle(handle=handle, typeID=artifactType.id, creatorID=self.user_id)
                        if not artifact:
                            is_artifact_exist = False
            self.new_book_title = kwargs['name']
            logging.info("Artifact does not exist. [%s] Creating: %s %s" % (artifact_type, kwargs['name'], kwargs['typeName']))
            artifact = api.createArtifact(**kwargs)
        except Exception, e:
            logging.error("Error saving artifact: %s" % str(e))
            logging.error(traceback.format_exc())

        if not artifact:
            artifact_info['id'] = None
            artifact_rev_id = None
            return artifact_info['id'], artifact_rev_id

        artifact_info['id'] = artifact.id
        artifact_rev_id = artifact.revisions[0].id
        user_id = self.user_id
        ck12Editor = self.config.get('ck12_editor')
        if not ck12Editor:
            ck12Editor = 'ck12editor'
        '''if str(EFLEX_USER_ID) == str(self.user_id):
            ## Auto-publish
            api.publishArtifactRevision(artifactRevision=artifact.revisions[0], recursive=False)
            logging.info("Published artifact revision: %d" % artifact_rev_id)
        else:
            logging.info("Did not publish artifact revision, the creator login is: %s" % artifact.creator.login)'''
        adict = artifact.asDict()
        if artifact_type.lower() == "lesson" or artifact_type.lower() == "concept" or artifact_type.lower() == "section":
            if artifact_info['cover_image'] != None:
                self.createCustomCover(artifact, adict['title'], artifact_info['cover_image'], artifact_type.lower(), adict['handle'], adict['realm'] )
            else:
                cover_image_url,resource_id = self.create_resource_int(generic_cover, user_id, resource_type="cover page")
                #cover_image_url,resource_id = self.create_resource(generic_cover, user_id, resource_type="cover page")
                if not cover_image_url == generic_cover:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
        else:
            if artifact_info['cover_image'] == None:
                cover_image_url,resource_id = self.create_resource_int(generic_cover, user_id, resource_type="cover page")
                #cover_image_url,resource_id = self.create_resource(generic_cover, user_id, resource_type="cover page")
                if not cover_image_url == generic_cover:
                    self.associate_resource(user_id, resource_id, artifact_info['id'])
            else:
                self.createCustomCover(artifact, adict['title'], artifact_info['cover_image'], artifact_type.lower(), adict['handle'], adict['realm'] )

        return artifact_info["id"], artifact_rev_id

    def createCustomCover(self, artifact, bookTitle, coverImageUri, artifactType, handle, realm):
        from tempfile import NamedTemporaryFile
        from urllib import urlretrieve
        import Image
        from shutil import move, copyfileobj
        try:
            title = bookTitle
            if not title:
                raise Exception((_(u"Must specify a Book title to create custom cover")).encode("utf-8"))

            uriOnly = True

            customCoverWorkdir = '/tmp/custom_cover_workdir/'
            if not os.path.exists(customCoverWorkdir):
                os.mkdir(customCoverWorkdir)
            tempfd = NamedTemporaryFile()
            tempFile = customCoverWorkdir + '/' + os.path.basename(tempfd.name)
            tempfd.close()
            h.urlretrieve(coverImageUri, tempFile)
            image_obj = Image.open(tempFile)
            imgType = image_obj.format.lower()
            newTempFile = tempFile + '.' + imgType
            move(tempFile, newTempFile)

            outputCoverImage = customCoverWorkdir + title.replace(' ', '_') + '.jpg'
            outputCoverImage = h.createCustomCoverImage('/opt/2.0/flx/pylons/flx/data/images/CK12_CoverImage_Template.jpg',
                                     newTempFile, title, outputCoverImage)
            resourceRevision = self._createCoverImageResource(outputCoverImage)
            self._associateCoverImage(artifact, resourceRevision)
            return resourceRevision.resource.getPermaUri(fullUrl=True, qualified=True)
        except Exception, e:
            logging.error('Exception in custom cover image creation[%s]' % str(e), exc_info=e)
            return None

    def _createCoverImageResource(self, cover_image_path):
        resourceDict = {}
        path, name = os.path.split(cover_image_path)
        resourceDict['uri'] = open(cover_image_path, "rb")
        resourceDict['uriOnly'] = False
        resourceDict['isExternal'] = False
        resourceDict['resourceType'] = api.getResourceTypeByName(name='cover page')
        resourceDict['name'] = name
        resourceDict['description'] = None
        language = api.getLanguageByName(name='English')
        resourceDict['languageID'] = language.id
        resourceDict['ownerID'] = self.user_id
        resourceDict['creationTime'] = datetime.now()
        resourceRevision = api.createResource(resourceDict=resourceDict,
                                              commit=True)
        return resourceRevision

    def _associateCoverImage(self, artifact, resourceRevision):
        artifactRevision = artifact.revisions[0]
        artifactRevisionHasResource = api.createArtifactHasResource(artifactRevisionID=artifactRevision.id,
                                      resourceRevisionID=resourceRevision.id)
        return artifactRevisionHasResource

    def create_resource_int(self, image_path, user_id, resource_type='image',
                            resource_name='image', resource_desc='image',
                            authors=None, license=None):
        logging.info("post image payload interal: "+ image_path)
        internal_url = ''
        try:
            resourceDict = {}
            path, name = os.path.split(image_path)
            if image_path.lower().startswith('http'):
                resourceDict['uri'] = image_path
                resourceDict['uriOnly'] = True
                resourceDict['isExternal'] = True 
            else:
                resourceDict['uri'] = open(image_path, "rb")
                resourceDict['uriOnly'] = False
                resourceDict['isExternal'] = False
            resourceDict['resourceType'] = api.getResourceTypeByName(name=resource_type)
            resourceDict['name'] = name
            resourceDict['description'] = resource_desc
            language = api.getLanguageByName(name='English')
            resourceDict['languageID'] = language.id
            resourceDict['ownerID'] = user_id   
            resourceDict['creationTime'] = datetime.now()
            resourceDict['authors'] = authors
            resourceDict['license'] = license
            
            if resource_type == 'cover video' or resource_type == 'video':
               resourceDict['uriOnly'] = True
               resourceDict['isExternal'] = True
            
            logging.info("Params: "+ str(resourceDict))

            resourceRevision = api.createResource(resourceDict=resourceDict, commit=True)
            resourceID = resourceRevision.resource.id
            #resourceUri = resourceRevision.resource.getUri()
            ## Use the perma url
            resourceUri = self.get_resource_perma(resource=resourceRevision.resource)
            return (resourceUri, resourceID)
        except Exception as e:
            logging.error("Error: "+ str(e))
            return (image_path,None)

    def get_resource_perma(self, resource=None, resourceID=None):
        if not resource and resourceID:
            resource = api.getResourceByID(id=resourceID)
        return resource.getPermaUri(fullUrl=True)

    def associate_resource(self, user_id, resource_id, artifact_id):
        """
            Associate resource with an artifact - using the internal API helper method
        """
        resource = api.getResourceByID(id=int(resource_id))
        artifact = api.getArtifactByID(id=int(artifact_id))
        member = api.getMemberByID(id=int(user_id))

        if resource and artifact and member:
            resourceID, resourceRevisionID = self.rh.createResourceArtifactAssociation(resource, artifact, member)
            logging.info("Associated resource: %s with artifact: %s (resource revision: %s)" % (resourceID, artifact_id, resourceRevisionID))
        else:
            raise Exception((_(u'Invalid arguments: resource: %(resource_id)s artifact: %(artifact_id)s member: %(user_id)s')  % {"resource_id":resource_id,"artifact_id": artifact_id,"user_id": user_id}).encode("utf-8"))

    def get_artifact_read_url(self, artifact_details):
        artifact_url = ''
        artifact_dict = None
        try:
            if self.artifact_cache:
                artifact_dict,artifact = self.artifact_cache().load(id=artifact_details['id'],infoOnly=True)
        except Exception as e:
            artifact_dict = None
        try:
            if artifact_dict and artifact_dict.get('domain',None):
                branchEID = '.'.join(artifact_dict['domain']['encodedID'].split('.')[:2])
                browseTerm = api.getBrowseTermByEncodedID(encodedID=h.formatEncodedID(branchEID))
                artifact_url = h.getNewModalityURLForArtifact(artifact_dict,browseTerm) 
        except Exception as e:
            artifact_url = ''
        if not artifact_url:
            if artifact_dict['realm']:
                artifact_url = '%s/%s/%s/%s' %( WEB_PREFIX_URL, artifact_dict['realm'], artifact_details['artifactType'], urllib2.quote(artifact_dict['handle'].encode('utf-8')))
            else:
                artifact_url = '%s/%s/%s' %( WEB_PREFIX_URL, artifact_details['artifactType'], urllib2.quote(artifact_dict['handle'].encode('utf-8')))
        return artifact_url

    def schedule_render_pdf(self, book_id, book_rev_id):
        createPdf = pdf.pdf()
        template = None
        task = createPdf.delay(book_id,self.downloadPrefix, self.defaultImageHost, revisionID=book_rev_id, nocache=True, user=self.user_id, template=None)
        pdf_response = {}
        task_id = task.task_id
        while True:
            task = api.getTaskByTaskID(taskID=task_id)
            task_status = task.status
            if task_status == "SUCCESS":
                pdf_response = jsonlib.read(task.userdata)
                break
            elif task_status == "FAILURE":
                failure_reason = 'your request for the book "%s" cannot be processed at the moment, we will get back to you shortly' %(self.book_title)
                self.mail_failure_notice(self.sender, failure_reason)
                break
            else:
                time.sleep(10)

        return pdf_response
 
    def is_message_valid(self, track_identified, message):
        if track_identified == None:
            return False
        elif track_identified.group(1).lower().strip() == 'contribute':
            return True
        else:
            if (message.is_multipart()) :
                body = message.get_payload()
                mail_content = body[0].get_payload()
            else :
                mail_content = message.get_payload()
            p = re.compile('^([\w\s\'"-.]+)[:;]\s*([\w\s\'"-.]+)$', re.M)
            logging.debug(mail_content)
            topics = p.findall(mail_content)
            if topics:
                return True
            else:
                return False

    def mail_result_to_contributor(self, sender, artifact_details):
        artifact_url = ''
        #In Bug No. 9117 - Remove reader related link, this viewer_url is removed
        # Old one was viewer_url = %s/read/%s/%s/%s' %( WEB_PREFIX_URL, artifact_details['realm'], artifact_details['artifactType'], artifact_details['handle'])
        #             viewer_url = ''#'%s/read/%s/%s' %( WEB_PREFIX_URL, artifact_details['artifactType'], artifact_details['handle'])
        viewer_url = ''
        if artifact_details:
            try:
                artifact_url = self.get_artifact_read_url(artifact_details)
                '''if artifact_details['realm']:
                    artifact_url = '%s/%s/%s/%s' %( web_prefix_url, artifact_details['realm'], artifact_details['artifacttype'], urllib2.quote(artifact_details['handle'].encode('utf-8')))
                else:
                    artifact_url = '%s/%s/%s' %( WEB_PREFIX_URL, artifact_details['artifactType'], urllib2.quote(artifact_details['handle'].encode('utf-8')))'''
            except Exception as e:
                artifact_url = '%s/%s/%s' %( WEB_PREFIX_URL, artifact_details['artifactType'], urllib2.quote(artifact_details['handle'].encode('utf-8')))
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(sender), self.thanks_to_contributor_message_template)
        
        p = re.compile('%info')
        if artifact_url:
            msg_text = p.sub('Your doc can be found here: \n%s'%(artifact_url), msg_text)
        else:
            msg_text = p.sub('', msg_text)
        message = MIMEText(msg_text)
        requester_list = list()
        requester_list.append(sender)
        '''if forward != '':
            requester += ", "+ forward
            requester_list.append(forward)
        ''' 
        message['Subject'] = "Your contribution: "+ self.book_title
        message['From'] = self.mail_sender
        message['To'] = sender
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester_list, message.as_string())         
            logging.debug("Successfully sent email to " + sender)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")

    def mail_result(self, requester, render_result_urls, title_change_info=''):
        render_result = ''
        viewer_url = ''
        if render_result_urls:
            for render_type, renderer_url  in render_result_urls.items():             
                viewer_url = renderer_url.replace('http://','').replace('https://','')
                host_re = re.compile('(.*?)/.*')
                try:
                    if self.artifact_realm:
                        viewer_url = '%s/%s/book/%s' %( WEB_PREFIX_URL, self.artifact_realm, urllib2.quote(self.artifact_handle.encode('utf-8')))
                    else:
                        viewer_url = '%s/book/%s' %( WEB_PREFIX_URL, urllib2.quote(self.artifact_handle.encode('utf-8')))
                except Exception as e:
                    viewer_url = '%s/book/%s' %( WEB_PREFIX_URL, urllib2.quote(self.artifact_handle.encode('utf-8')))
                render_result = render_result + '%s - %s\n' % (render_type.upper(), renderer_url) 
        p = re.compile('%renderer_url')
        msg_text = p.sub(render_result, self.message_template)
        p = re.compile('%viewer_url')
        msg_text = p.sub(viewer_url, msg_text)
        p = re.compile('%order_parameters')
        msg_text = p.sub(self.order_parameters, msg_text)
        p = re.compile('%concepts')
        msg_text = p.sub(self.concepts, msg_text)
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(requester), msg_text)
        p = re.compile('%title_change_info')
        msg_text = p.sub(title_change_info, msg_text)
        message = MIMEText(msg_text)
        requester_list = list()
        requester_list.append(requester)
        '''if forward != '':
            requester += ", "+ forward
            requester_list.append(forward)
        ''' 
        message['Subject'] = "Your book request: "+ self.book_title
        message['From'] = self.mail_sender
        message['To'] = requester
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester_list, message.as_string())         
            logging.debug("Successfully sent email to " + requester)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")

                
    def mail_result_pdf(self, requester, forward, render_result_urls, title_change_info=''):
        render_result = ''
        viewer_url = ''
        if render_result_urls:
            for render_type, renderer_url  in render_result_urls.items():             
                viewer_url = renderer_url.replace('http://','').replace('https://','')
                host_re = re.compile('(.*?)/.*')
                try:
                    if self.artifact_realm:
                        viewer_url = '%s/%s/book/%s' %( WEB_PREFIX_URL, self.artifact_realm, self.artifact_handle)
                    else:
                        viewer_url = '%s/book/%s' %( WEB_PREFIX_URL, self.artifact_handle)
                except Exception as e:
                    viewer_url = '%s/book/%s' %( WEB_PREFIX_URL, self.artifact_handle)
        if forward:
            for render_type, forward_email in forward.items():
                renderer_url = render_result_urls.get(render_type.lower())
                if not renderer_url:
                    continue
                p = re.compile('%viewer_url')
                msg_text = p.sub(viewer_url, self.message_template)
                p = re.compile('%order_parameters')
                msg_text = p.sub(self.order_parameters, msg_text)
                p = re.compile('%concepts')
                msg_text = p.sub(self.concepts, msg_text)
                p = re.compile('%name')
                msg_text = p.sub('Sir/Madam,\n\n\nAs %s requested, this email is forwarded to you'%(requester), msg_text)
                render_result = '%s - %s\n' % (render_type.upper(), renderer_url) 
                p = re.compile('%renderer_url')
                msg_text = p.sub(render_result, msg_text)
                p = re.compile('%title_change_info')
                msg_text = p.sub(title_change_info, msg_text)
                message_text = MIMEText(msg_text)
                message = MIMEMultipart()
                requester_list = list()
                requester_list.extend(forward_email.split(','))
                message['Subject'] = "Book request: "+ self.book_title
                message['From'] = self.mail_sender
                #message['To'] = requester
                message['To'] = forward_email
                message.attach(message_text)
                ctype = 'application/octet-stream'
                maintype, subtype = ctype.split('/', 1)
                message_pdf = MIMEBase(maintype, subtype)
                response = urllib2.urlopen(renderer_url)
                pdf = response.read()
                message_pdf.set_payload(pdf)
                encoders.encode_base64(message_pdf)
                message_pdf.add_header('Content-Disposition', 'attachment', filename=self.book_title +".%s"%render_type.lower())
                message.attach(message_pdf)
                try:
                    smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
                    smtpObj.sendmail(self.mail_sender, requester_list, message.as_string())       
                    logging.debug("Successfully sent email to " + str(requester_list))
                except smtplib.SMTPException:
                    logging.debug("Error: unable to send email with attached %s" % render_type )
                    failure_reason = "due to technical inconsistencies, We could not forward %s to %s" % (render_type, forward)
                    self.mail_failure_notice(requester, failure_reason)
                    info_to_admin = "EGX Request ID: "
                    info_to_admin +="\nUser Email Address: "+str(requester)
                    info_to_admin += "\nFailure Reason: Couldn't send %s attachment" % render_type.upper()
                    subject = "Failure while sending %s attachment" % render_type.upper()
                    self.mail_admin(subject, info_to_admin)
                

    def mail_help(self, requester):
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(requester), self.help_message_template)
        message = MIMEText(msg_text)
        message['Subject'] = "CK12 Flexbook Email Gateway"
        message['From'] = self.mail_sender
        message['To'] = requester
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester, message.as_string())         
            logging.debug("Successfully sent email to " + requester)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")
                
    def mail_admin(self, subject, msg):
        message = MIMEText(msg)
        message['Subject'] = "[EGX Alert]: "+subject
        message['From'] = self.mail_sender
        message['To'] = EGX_ADMIN_MAIL_ID
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, EGX_ADMIN_MAIL_ID, message.as_string())         
            logging.debug("Successfully sent email to " + EGX_ADMIN_MAIL_ID)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")

    def mail_failure_notice(self, requester, failure_reason):
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(requester), self.failure_message_template)
        p = re.compile('%failure_reason')
        msg_text = p.sub(failure_reason, msg_text)
        message = MIMEText(msg_text)
        message['Subject'] = "CK12 Flexbook Email Gateway"
        message['From'] = self.mail_sender
        message['To'] = requester
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester, message.as_string())         
            logging.debug("Successfully sent email to " + requester)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")
                
    def mail_thanks(self, requester, msg):
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(requester), self.thanks_message_template)
        p = re.compile('%message')
        msg_text = p.sub(msg, msg_text)
        message = MIMEText(msg_text)
        message['Subject'] = "CK12 Flexbook Email Gateway"
        message['From'] = self.mail_sender
        message['To'] = requester
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester, message.as_string())         
            logging.debug("Successfully sent email to " + requester)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")

    def mail_invite(self, requester):
        p = re.compile('%name')
        msg_text = p.sub(self.get_requester_name(requester), self.invite_message_template)
        p = re.compile('%register_url')
        register_url = '%s/auth/signup?returnTo=%s' % (FLX_PREFIX_URL, WEB_PREFIX_URL)
        msg_text = p.sub(register_url, msg_text)
        message = MIMEText(msg_text)
        message['Subject'] = "CK12 Flexbook Email Gateway"
        message['From'] = self.mail_sender
        message['To'] = requester
        try:
            smtpObj = smtplib.SMTP(SMTP_HOST_NAME)
            smtpObj.sendmail(self.mail_sender, requester, message.as_string())         
            logging.debug("Successfully sent email to " + requester)
        except smtplib.SMTPException:
            logging.debug("Error: unable to send email")

    def get_requester_name(self, requester):
        p = re.compile('(.*)(<.*>)')
        matched = p.match(requester)
        if matched:
            return matched.group(1).strip()
        else:
            return requester
