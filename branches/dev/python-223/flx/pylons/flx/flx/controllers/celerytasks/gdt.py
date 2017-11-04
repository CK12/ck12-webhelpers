import logging
import os
from tempfile import NamedTemporaryFile
from pylons.i18n.translation import _ 
import json
import re
import urllib2, urllib, jsonlib, json
from flx.lib.gdt.multipartpost import MultipartPostHandler

from flx.model import api
from flx.model.model import title2Handle
from flx.model.workdir import workdir as WD
from flx.controllers.celerytasks.generictask import GenericTask
from flx.lib.gdt.gdt2xhtml import GDT2XhtmlParser
from flx.lib.gdt.download import GDTDownloader
from flx.lib.gdt import settings
import flx.lib.helpers as h
import flx.lib.artifact_utils as au
from flx.lib.unicode_util import UnicodeWriter

log = logging.getLogger(__name__)

class GdtTask(GenericTask):
    recordToDB = True
    serializer = "json"
    loglevel = "INFO"

    def __init__(self, **kwargs):
        ## Initialize GenericTask
        GenericTask.__init__(self, **kwargs)
        self.routing_key = "print"
        self.output_file = None
    
    def _create_working_location(self):
        myUtil = WD.WorkDirectoryUtil()
        workdir_prefix = "/opt/2.0/work/"
        if not os.path.exists(workdir_prefix):
            os.mkdir(workdir_prefix)
            
        self.working_dir = workdir_prefix + myUtil.getWorkdir()[1]
        return self.working_dir
    
    def get_heading_content(self, xhtml, heading, is_heading_needed=True):
        if not heading:
            return ''
        heading_content = ''
        try:
            heading_contents = re.split('<h2.*?>', xhtml)
            heading_contents.__delitem__(0)
            for each_heading_content in heading_contents:
                if each_heading_content.strip().startswith(heading):
                    heading_content = each_heading_content
                    break
            if is_heading_needed:
                actual_heading = heading_content.split('</h2>')[0]
                h2_re = re.compile('(<h2.*?>)(.*?)</h2>', re.DOTALL)
                h2_full_tags = h2_re.findall(xhtml)
                for each_full_tag in h2_full_tags:
                    if each_full_tag[1].strip() == actual_heading.strip():
                        heading_content = '%s</h2>%s' % (each_full_tag[0], heading_content.split('</h2>')[1])
                        break 
            else:
                heading_content = heading_content.split('</h2>')[1].strip()
        except Exception as e:
            log.info('ERROR: GET HEADING: %s' % e.__str__())
            heading_content = ''
        return heading_content

    def bulk_upload_browse_terms(self, user_id, browse_term_csv_path, toCache=True):
        try:
            cfg = h.load_pylons_config()
            FLX_PREFIX = cfg.get('flx_prefix_url')
            PREFIX = "flx"
            log.info("Uploading browseTerms: %s" % browse_term_csv_path)
            browse_term_bulk_upload_api = FLX_PREFIX +'/'+PREFIX+'/load/browseTerms'
            opener = urllib2.build_opener(MultipartPostHandler)

            params = {"file" : open(browse_term_csv_path, "r") }
            params['submit'] = "Upload"
            params['toReindex'] = str(toCache)
            
            urllib2.install_opener(opener)
            req = urllib2.Request(browse_term_bulk_upload_api, params)
            req.add_header('Cookie', h.getLoginCookie(user_id))
            
            #log.info("Params: "+ str(req.headers))
            res = urllib2.urlopen(req)
            resource_upload_response = res.read()
            resource_upload_response = jsonlib.read(resource_upload_response)
            print "Response from handler: "+  str(resource_upload_response)
            
            try:
                status = resource_upload_response["responseHeader"]["status"]
                if status != 0:
                    log.error('Browse terms not uploaded successfully')
                    log.error('reason: '+resource_upload_response['response']['message'] )
            except Exception as e:
                log.info("Error: "+ str(e))
        
        except Exception as e:
            log.error('Error when bulk uploading browse terms: %s' % str(e), exc_info=e)

    def addRelatedArtifacts(self, artifact_id, related_eid_list):
        browse_term_list = []
        try:
            log.info("related_eid_list: %s" % related_eid_list)
            lesson_eid_re = re.compile('.*?\.L\..*')
            for each_eid in related_eid_list:
                for each_split_eid in each_eid.split(','):
                    each_split_eid = each_split_eid.strip()
                    if each_split_eid:
                        if lesson_eid_re.match(each_split_eid):
                            each_split_eid = re.sub('(.*?)\.L\..*','\\1', each_split_eid)
                        each_split_eid = h.getDomainEIDFromEID(each_split_eid)
                        log.info("each_split_eid: %s" % each_split_eid)
                        browse_term_list.append(api.getBrowseTermByEncodedID(each_split_eid))
            log.info("browse_term_list: %s" % browse_term_list)
            # Add related artifacts only if we have any browse terms.
            if browse_term_list:
                api.deleteRelatedArtifactsForArtifact(artifact_id)
                for each_browse_term in browse_term_list:
                    if each_browse_term:
                        kwargs = {}
                        kwargs['domainID'] = each_browse_term.id
                        kwargs['sequence'] = None
                        kwargs['artifactID'] = artifact_id
                        api.createRelatedArtifact(**kwargs)
        except Exception as e:
            log.error("Error adding related_eid: %s" % str(e), exc_info=e)
    
    def build_browse_term_csv(self, artifact_id, keyword_list, domain, parent, encodedID = None):

        file_obj = None
        self.browse_term_csv_path = '%s/browse_term.csv' % self.working_dir
        if not os.path.exists(self.browse_term_csv_path):
            file_obj = open(self.browse_term_csv_path,"w")
            self.browse_term_csv_writer = UnicodeWriter(file_obj)
            self.browse_term_csv_writer.writerow(['artifactID','browseTerm','browseTermType','browseTermParent','encodedID'])
        else:
            file_obj = open(self.browse_term_csv_path,"a")
            self.browse_term_csv_writer = UnicodeWriter(file_obj)

        for each in keyword_list:
            if not each or not each.strip():
                continue
            each = each.strip()
            bt_row = list()
            bt_row.append(artifact_id)
            bt_row.append(each)

            if domain != None:
                bt_row.append(domain)
            else:
                bt_row.append('domain')

            if parent != None:
                bt_row.append(parent)
            else:
                bt_row.append('')

            if encodedID != None:
                bt_row.append(encodedID)
            else:
                bt_row.append('')

            self.browse_term_csv_writer.writerow(bt_row)
        file_obj.close()

    def get_artifact_metadata(self, xhtml_content):
        artifact_metadata = {}
        is_metadata_table = False
        table_re = re.compile('(<table.*?</table>)', re.DOTALL)
        row_re = re.compile('(<tr.*?</tr>)', re.DOTALL)
        span_re = re.compile('<p.*?>(.*?)</p>', re.DOTALL)
        tables = table_re.findall(xhtml_content)
        for each_table in tables:
            artifact_metadata = {}
            metadata_key = ''
            rows = row_re.findall(each_table)
            for each_row in rows:
                span_elements = span_re.findall(each_row)
                if len(span_elements) > 0:
                    if len(span_elements) == 1:
                        span_elements.append('')
                    artifact_metadata[span_elements[0].strip()] = span_elements[1].strip()
                    if span_elements[0].lower() == 'title':
                        metadata_key = span_elements[1].lower()
            if any(['artifact handle' == x.lower().strip() for x in artifact_metadata.keys()]):
                is_metadata_table = True
                xhtml_content = xhtml_content.replace(each_table, '')
                break
            else:
                artifact_metadata = {}
                is_metadata_table = False
        return artifact_metadata, xhtml_content

    def _saveArtifact(self, artifact, artifact_no, user_id, book_title, updateExisting=False):
            child_artifact_no = 1
            child_ids = []
            child_rev_ids = []
            for each_child in artifact['children']:
                try:
                    artifact_id, artifact_rev_id = self._saveArtifact(each_child, child_artifact_no, user_id, book_title, updateExisting=updateExisting)
                except Exception as e:
                    raise e
                if artifact_id and artifact_rev_id:
                    child_ids.append(artifact_id )
                    child_rev_ids.append(artifact_rev_id)
                    if each_child.get('Keywords'):
                        self.build_browse_term_csv(artifact_id, each_child.get('Keywords', '').split(','), 'tag', None)
                    if each_child.get('Grades'):
                        self.build_browse_term_csv(artifact_id, each_child.get('Grades', '').split(','), 'grade level', None)
                    if each_child.get('States'):
                        self.build_browse_term_csv(artifact_id, each_child.get('States', '').split(','), 'state', None)
                    if each_child.get('Subjects'):
                        self.build_browse_term_csv(artifact_id, each_child.get('Subjects', '').split(','), 'subject', None)
                    if each_child.get('Level'):
                        self.build_browse_term_csv(artifact_id, each_child.get('Level', '').split(','), 'level', None)
                    child_artifact_no = child_artifact_no + 1
            artifact['children_ids'] = child_ids
            artifact['children_rev_ids'] = child_rev_ids
            if artifact['type'].lower() == 'lesson':
                parser = GDT2XhtmlParser(user_id, "", "")
                try:
                    artifactID = parser.saveArtifacts(artifact['Title'], artifact['handle'], 'lesson', artifact_xhtml=artifact['xhtml'], artifact_desc=artifact['Description'], encodedID=artifact.get('Encoded ID', None), updateExisting=updateExisting, authors=artifact.get('Authors','').split(','))
                except Exception as e:
                    raise e
                artifact_info = api.getArtifactByID(id=artifactID)
                artifact_id = artifactID
                artifact_rev_id = artifact_info.revisions[0].id
            else:
                try:
                    artifact_id, artifact_rev_id, newArtifact = au.saveArtifact(user_id, artifact['Title'], artifact['handle'], artifact['xhtml'], artifact['type'].lower().strip(), encodedID=artifact.get('Encoded ID', None), children=artifact['children_rev_ids'], description=artifact['Description'], bookTitle=book_title, updateExisting=updateExisting, authors=artifact.get('Authors','').split(','))
                except Exception as e:
                    raise e
            return artifact_id, artifact_rev_id
    

    def run(self, command, docid, toFile, userId, title, handle, artifactType, googleAuthToken=None, updateExisting=False, **kwargs):
        """
            Convert to lesson
        """
        GenericTask.run(self, **kwargs)
        log.info('UPDATE AT TASK: %s' % updateExisting)
        zipfile = None
        if artifactType == 'book':
            log.info("Converting %s %s to %s as user %d" % (docid, command, toFile, userId))
        else:
            log.info("Converting %s %s to %s as user %d" % (docid, command, toFile, userId))
            tempf = NamedTemporaryFile(suffix='.zip', delete=False)
            tempf.close()
            zipfile = tempf.name
            log.info("Downloading to zip file: %s" % zipfile)

        self.working_dir = self._create_working_location()        
        self.browse_term_csv_path = None
        try:
            if command == 'gdoc2xhtml':
                downloader = GDTDownloader(docid, googleAuthToken)
                if artifactType == 'book':
                    downloader.downloadCollection(self.working_dir)
                    chapters = os.listdir(self.working_dir)
                    artifact_title_file = '%s/%s' % (self.working_dir, 'artifact_titles')
                    f = open(artifact_title_file, 'r')
                    artifact_titles = f.read()
                    chapter_metadata = {}
                    book_metadata = {}
                    book_info = {}
                    book_info['children'] = []
                    book_info['type'] = 'book'
                    chapter_info = {}
                    lesson_info = {}
                    f.close()
                    artifact_titles = json.loads(artifact_titles)
                    chapters.sort()
                    chapter_rev_ids = []
                    if not title.strip():
                        book_title = artifact_titles['book']
                        book_title = re.sub('.*?_','',book_title)
                    else:
                        book_title = title
                    book_handle = title2Handle(book_title)
                    chapter_title = ''
                    chapter_rev_ids = []
                    for each_chapter in chapters:
                        chapter_metadata = {}
                        chapter_info = {}
                        chapter_info['children'] = []
                        chapter_info['type'] = 'chapter'
                        if each_chapter.startswith('chapter_'):
                            chapter_dir = '%s/%s' % (self.working_dir, each_chapter)
                            lessons = os.listdir(chapter_dir)
                            lessons.sort()
                            lesson_rev_ids = []
                            chapter_xhtml = ''
                            try:
                                f = open(settings.CHAPTER_SKELETON_FILE, 'r')
                                chapter_xhtml = f.read()
                                f.close()
                            except Exception as e:
                                chapter_xhtml = ''
                            for each_lesson in lessons:
                                lesson_title = ''
                                lesson_handle = ''
                                lesson_info = {}
                                lesson_info['children'] = []
                                lesson_info['type'] = 'lesson'
                                if each_lesson.endswith('.zip'):
                                    lesson_title = artifact_titles["%s/%s" % (chapter_dir, each_lesson)]
                                    lesson_title = re.sub('.*?_','',lesson_title)
                                    lesson_handle = title2Handle(lesson_title)
                                    tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
                                    tempf.close()
                                    tolessonfile = tempf.name
                                    parser = GDT2XhtmlParser(userId, "%s/%s" % (chapter_dir, each_lesson), tolessonfile)
                                    parser.start()
                                    parser.close()
                                    log.info("Finished parsing input: %s" % tolessonfile)
                                if each_lesson.endswith('.zip') and not each_lesson.endswith('chapter_content.zip'):
                                    log.info("Finished parsing input: %s" % tolessonfile)
                                    xhtml = h.getContents(parser.destFile)
                                    lesson_metadata, lesson_xhtml = self.get_artifact_metadata(xhtml)
                                    lesson_info.update(lesson_metadata)
                                    if not lesson_info.get('Title'):
                                        lesson_info['Title'] = lesson_title
                                    if not lesson_info.get('Description'):
                                        lesson_info['Description'] = ''
                                    lesson_info['handle'] = lesson_handle
                                    lesson_info['xhtml'] = lesson_xhtml
                                    chapter_info['children'].append(lesson_info)
                                    '''artifactID = parser.saveArtifacts(lesson_title, lesson_handle, 'lesson', artifact_xhtml=lesson_xhtml, artifact_desc=lesson_metadata['Description'], encodedID=lesson_metadata['Encoded ID'])
                                    self.build_browse_term_csv(artifactID, lesson_metadata['Keywords'].split(','), 'tag', None)
                                    self.build_browse_term_csv(artifactID, lesson_metadata['Grades'].split(','), 'grade level', None)
                                    self.build_browse_term_csv(artifactID, lesson_metadata['States'].split(','), 'state', None)
                                    self.build_browse_term_csv(artifactID, lesson_metadata['Subjects'].split(','), 'subject', None)
                                    self.build_browse_term_csv(artifactID, lesson_metadata['Level'].split(','), 'level', None)
                                    log.info('LESSON Metadata: %s' % str(lesson_metadata))
                                    artifact = api.getArtifactByID(id=artifactID)
                                    lesson_rev_ids.append(artifact.revisions[0].id)'''
                                elif each_lesson.endswith('.zip'):
                                    log.info("Finished parsing input: %s" % tolessonfile)
                                    xhtml = h.getContents(parser.destFile)
                                    body_re = re.compile('<body>(.*?)</body>', re.DOTALL)
                                    chapter_metadata, xhtml = self.get_artifact_metadata(xhtml)
                                    content_body = body_re.findall(xhtml)
                                    log.info('CHAPTER Metadata: %s' % str(chapter_metadata))
                                    introduction_content = self.get_heading_content(content_body[0], 'Introduction')
                                    summary_content = self.get_heading_content(content_body[0], 'Summary')
                                    log.info('INTRO: %s' % introduction_content)
                                    chapter_xhtml = chapter_xhtml.replace('%CHAP_CONT%', introduction_content)
                                    chapter_xhtml = chapter_xhtml.replace('%CHAP_TAIL_SUBSECTIONS%', summary_content)
                            chapter_title = artifact_titles[chapter_dir]
                            chapter_title = re.sub('.*?_','',chapter_title)
                            chapter_handle = '%s%s%s' % (title2Handle(chapter_title), '-::of::-', title2Handle(book_title))
                            if not chapter_metadata:
                                chapter_xhtml = chapter_xhtml.replace('%CHAP_CONT%','').replace('%CHAP_TAIL_SUBSECTIONS%', '')
                                try:
                                    chapter_xhtml = h.transform_to_xhtml(chapter_xhtml, cleanHtml=True)
                                except Exception as e:
                                    pass
                                chapter_metadata, chapter_xhtml = self.get_artifact_metadata(chapter_xhtml)
                            chapter_info.update(chapter_metadata)
                            if not chapter_info.get('Title'):
                                chapter_info['Title'] = chapter_title
                            if not chapter_info.get('Description'):
                                chapter_info['Description'] = ''
                            chapter_info['handle'] = chapter_handle
                            chapter_info['xhtml'] = chapter_xhtml
                            book_info['children'].append(chapter_info)
                            '''chapter_id, chapter_rev_id = au.saveArtifact(userId, chapter_title, chapter_handle, chapter_xhtml, 'chapter', encodedID=chapter_metadata['Encoded ID'], children=lesson_rev_ids, description=chapter_metadata['Description'], bookTitle=book_title)
                            chapter_rev_ids.append(chapter_rev_id)
                            self.build_browse_term_csv(chapter_id, chapter_metadata['Keywords'].split(','), 'tag', None)
                            self.build_browse_term_csv(chapter_id, chapter_metadata['Grades'].split(','), 'grade level', None)
                            self.build_browse_term_csv(chapter_id, chapter_metadata['States'].split(','), 'state', None)
                            self.build_browse_term_csv(chapter_id, chapter_metadata['Subjects'].split(','), 'subject', None)
                            self.build_browse_term_csv(chapter_id, chapter_metadata['Level'].split(','), 'level', None)'''
                        elif each_chapter.endswith('.xml'):
                            log.info("Found book feed xml: %s" % each_chapter)
                            book_xhtml = h.transform_to_xhtml('<body></body>', cleanHtml=True)
                        elif each_chapter.endswith('book_content.zip'):
                                    tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
                                    tempf.close()
                                    tobookfile = tempf.name
                                    parser = GDT2XhtmlParser(userId, "%s/%s" % (self.working_dir, each_chapter), tobookfile)
                                    parser.start()
                                    parser.close()
                                    xhtml = h.getContents(parser.destFile)
                                    body_re = re.compile('<body>(.*?)</body>', re.DOTALL)
                                    book_metadata,xhtml = self.get_artifact_metadata(xhtml)
                                    content_body = body_re.findall(xhtml)
                                    log.info('BOOK Metadata: %s' % str(book_metadata))
                                    book_xhtml = content_body[0]
                                    front_matter_content = self.get_heading_content(content_body[0], 'Front Matter')
                                    back_matter_content = self.get_heading_content(content_body[0], 'Back Matter')
                                    book_xhtml = "<body>%s%s</body>" % (front_matter_content,back_matter_content)
                                    book_xhtml = h.transform_to_xhtml(book_xhtml, cleanHtml=True)
                        elif each_chapter.startswith('lesson_') and each_chapter.endswith('.zip'):
                                    lesson_info = {}
                                    lesson_info['children'] = []
                                    lesson_info['type'] = 'lesson'
                                    lesson_title = artifact_titles["%s/%s" % (self.working_dir, each_chapter)]
                                    lesson_title = re.sub('.*?_','',lesson_title)
                                    lesson_handle = title2Handle(lesson_title)
                                    tempf = NamedTemporaryFile(suffix='.xhtml', delete=False)
                                    tempf.close()
                                    tolessonfile = tempf.name
                                    parser = GDT2XhtmlParser(userId, "%s/%s" % (self.working_dir, each_chapter), tolessonfile)
                                    parser.start()
                                    parser.close()
                                    xhtml = h.getContents(parser.destFile)
                                    lesson_metadata, lesson_xhtml = self.get_artifact_metadata(xhtml)
                                    lesson_info.update(lesson_metadata)
                                    if not lesson_info.get('Title'):
                                        lesson_info['Title'] = lesson_title
                                    if not lesson_info.get('Description'):
                                        lesson_info['Description'] = ''
                                    lesson_info['handle'] = lesson_handle
                                    lesson_info['xhtml'] = lesson_xhtml
                                    book_info['children'].append(lesson_info)
                    if not book_metadata:
                        book_xhtml = h.transform_to_xhtml('<body></body>', cleanHtml=True)
                        book_metadata, book_xhtml = self.get_artifact_metadata(book_xhtml)
                    book_info.update(book_metadata)
                    if not book_info.get('Title'):
                        book_info['Title'] = book_title
                    if not book_info.get('Description'):
                        book_info['Description'] = ''
                    book_info['handle'] = book_handle
                    book_info['xhtml'] = book_xhtml
                    '''book_id, book_rev_id = au.saveArtifact(userId, book_title, book_handle, book_xhtml, 'book', encodedID=book_metadata['Encoded ID'], children=chapter_rev_ids, description=book_metadata['Description'])'''
                    book_id = None
                    try:
                        msg = 'GDT import successful'
                        book_id, book_rev_id = self._saveArtifact(book_info, 1, userId, book_info['Title'], updateExisting=updateExisting)
                        ev = api.createEventForType(typeName='ARTIFACT_COPIED', objectID=book_id, objectType='artifact', eventData=msg, 
                        ownerID=userId, processInstant=False)
                        log.info("Save artifact successful. Book ID:%s- Book Rev ID:%s" % (book_id, book_rev_id))
                    except Exception as e:
                        msg = 'GDT import failed'
                        ev = api.createEventForType(typeName='ARTIFACT_COPY_FAILED', objectID=book_id, objectType='artifact', eventData=msg, 
                        ownerID=userId, processInstant=False)
                        log.info("Save artifact failed. Error:%s" %e)
                        raise e
                    finally:
                        if not ev:
                            log.info('Unable to send the notification as Event object is not defined or skip_notify is set to True.')
                        else:
                            member = api.getMemberByID(id=userId)
                            n = api.createNotification(eventTypeID=ev.eventTypeID, objectID=book_id, objectType='artifact', address=member.email,
                            subscriberID=userId, type='email', frequency='instant')
                            h.processInstantNotifications([ev.id], notificationIDs=[n.id], user=userId, noWait=True)

                    if book_metadata:
                        self.build_browse_term_csv(book_id, book_metadata['Keywords'].split(','), 'tag', None)
                        self.build_browse_term_csv(book_id, book_metadata['Grades'].split(','), 'grade level', None)
                        self.build_browse_term_csv(book_id, book_metadata['States'].split(','), 'state', None)
                        self.build_browse_term_csv(book_id, book_metadata['Subjects'].split(','), 'subject', None)
                        self.build_browse_term_csv(book_id, book_metadata['Level'].split(','), 'level', None)
                    try:
                        if self.browse_term_csv_path:
                            self.bulk_upload_browse_terms(userId, self.browse_term_csv_path)
                    except Exception as e:
                        log.error('Bulk upload browse terms: %s'% e.__str__())
                        pass
                    artifact = api.getArtifactByID(id=book_id)
                    adict = artifact.asDict()
                    self.userdata = json.dumps({'artifactType': adict['artifactType'], 'realm': adict['realm'], 'handle': adict['handle'], 'id': adict['id'], 'title': adict['title']})
                    log.info("Saving info: %s" % self.userdata)
                            
                else:
                    downloader.download(zipfile)
                    parser = GDT2XhtmlParser(userId, zipfile, toFile)
                    parser.start()

                    parser.close()
                    log.info("Finished parsing input")

                    xhtml = h.getContents(toFile)
                    artifact_metadata, artifact_xhtml = self.get_artifact_metadata(xhtml)
                    try:
                        if artifact_metadata.get('Artifact Type', None):
                            artifactType = artifact_metadata['Artifact Type']
                        if artifact_metadata.get('Artifact Title', None):
                            title = artifact_metadata['Artifact Title']
                        if artifact_metadata.get('Artifact Handle', None):
                            handle = artifact_metadata['Artifact Handle']
                        description = ''
                        if artifact_metadata.get('Description', None):
                            description = artifact_metadata['Description']
                        encoded_id = None
                        if artifact_metadata.get('Encoded ID', None):
                            encoded_id = artifact_metadata['Encoded ID']
                        authors = []
                        if artifact_metadata.get('Authors', []):
                            try:
                                authors = artifact_metadata['Authors'].split(',')
                            except Exception as e:
                                authors = []
                        artifactID = parser.saveArtifacts(title, handle, artifactType, artifact_xhtml=artifact_xhtml, artifact_desc=description, encodedID=encoded_id, updateExisting=updateExisting, authors=authors)
                    except Exception as e:
                        raise e
                    if artifact_metadata: 
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('Keywords', '').split(','), 'tag', None)
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('Grades', '').split(','), 'grade level', None)
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('States', '').split(','), 'state', None)
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('Subjects', '').split(','), 'subject', None)
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('Search Terms', '').split(','), 'search', None)
                        self.build_browse_term_csv(artifactID, artifact_metadata.get('Level', '').split(','), 'level', None)
                        self.addRelatedArtifacts(artifactID, artifact_metadata.get('Related EIDs', '').split(','))
                        self.bulk_upload_browse_terms(userId, self.browse_term_csv_path)
                    
                    artifact = api.getArtifactByID(id=artifactID)
                    adict = artifact.asDict()
                    self.userdata = json.dumps({'artifactType': adict['artifactType'], 'realm': adict['realm'], 'handle': adict['handle'], 'id': adict['id'], 'title': adict['title']})
                    log.info("Saving info: %s" % self.userdata)
            else:
                raise Exception((_(u"Unknown command: %(command)s")  % {"command":command}).encode("utf-8"))
        finally:
            if zipfile and os.path.exists(zipfile):
                os.remove(zipfile)
            if toFile and os.path.exists(toFile):
                os.remove(toFile)

