'''
This is the wiki importer for loading 2.0 data from wiki.
from pylons.i18n.translation import _ 
'''
import os, re, jsonlib
from xml.dom import minidom
import codecs

import logging
import traceback

import settings
from importer import WikiImporterBase
from flx.lib import helpers as h
from flx.model import api
#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
#logging.basicConfig(filename=settings.LOG_FILENAME)

FLX_PREFIX = settings.FLX_PREFIX 

class WikiImporter(WikiImporterBase):

    def __init__(self):
        WikiImporterBase.__init__(self)
        self.log = logging.getLogger(__name__)
        #self.log.setLevel(log_level)
        #self.log.info("Initializing WikiImporter object")
        self.working_dir = ''
        self.buffer = ''
        self.ALLOWED_TYPES_FOR_DOMAINS = settings.ALLOWED_TYPES_FOR_DOMAINS
        self.book_info = {}
        self.book_info['children'] = []
        self.standalone_content_info = {}
        self.chapters_info = []
        self.lessons_info = []
        self.all_artifact_ids = []
        self.working_dir = settings.WORKING_DIR
        self.user_id = ''
        self.breadcrumb = ''
        if not os.path.exists(self.working_dir):
            os.mkdir(self.working_dir)
        self.browse_term_csv_path = settings.BROWSE_TERM_CSV_PATH
        self.browse_term_csv_writer = None
        self.state_standard_csv_path = settings.STATE_STANDARD_CSV_PATH
        self.state_standard_csv_writer = None
        self.is_metadata_mode = False
        self.all_image_paths = {}
        self.is_new_metadata_format = True
    
    def import_from_wiki(self, _wikiurl, user_id, workdir=None, is_metadata_mode=False, hasZipFile=False):
        return WikiImporterBase.import_from_wiki(self, _wikiurl, user_id, workdir=workdir, is_metadata_mode=is_metadata_mode, concept_mode=True, hasZipFile=hasZipFile)

    def process_and_import_content(self, _working_dir, user_id,
                                   import_drill_mode='concept',
                                   content_splitter_guide=None,
                                   is_metadata_mode=False,
                                   toCache=True,
                                   wikiurl=None,
                                   taskID=None,
                                   toWait=False):
        is_content_standalone = False
        chapter_xhtmls = os.walk(_working_dir).next()[2]
        if not chapter_xhtmls == []: 
            for each in chapter_xhtmls:
                if each.lower().startswith('metadata'):
                    file_path = _working_dir + "/" + each
                    try:
                        self.check_for_metadata_attributes(file_path)
                        is_content_standalone = self.is_wiki_rwa(file_path)
                    except Exception as e:
                        self.api_manager.updateTaskUserData(taskID, updateDict={'message':e.__str__(), 'status': 'Failed'})
                        raise e
                    break
        if is_content_standalone:
            return self.process_and_import_standalone_content(_working_dir, user_id, import_drill_mode, content_splitter_guide, is_metadata_mode, toCache, wikiurl, taskID, toWait)
        self.wikiurl = wikiurl
        self.user_id = user_id
        try:
            self.is_metadata_mode = eval(str(is_metadata_mode))
        except Exception as e:
            self.is_metadata_mode = False

        self.browse_term_csv_path = _working_dir + "/" + self.browse_term_csv_path
        self.state_standard_csv_path = _working_dir + "/" + self.state_standard_csv_path
        try:
            ff = open("%s/%s"%(_working_dir, settings.IMG_PATH_MAPPER_FILE), 'r')
            self.all_image_paths = jsonlib.read(ff.read())
            ff.close()
        except Exception as e:
            self.all_image_paths = {}
        chapter_xhtmls = os.walk(_working_dir).next()[2]
        chapter_xhtmls.sort()
        if not chapter_xhtmls == []: 
            for each in chapter_xhtmls:
                if each.lower().endswith('.xhtml'):
                    file_path = _working_dir + "/" + each
                    f = open(file_path,"r")
                    self.buffer = f.read()
                    if self.buffer == False:
                        return
                if each.lower().startswith('metadata'):
                    file_path = _working_dir + "/" + each
                    self.fetch_all_info(file_path, import_drill_mode)
            #self.chapters_info = sorted(self.chapters_info, key=lambda k: k['xhtml_path'])
            self.log.info('Book::%s'%str(self.book_info))
            self.log.info('Chapters::%s'%str(self.chapters_info))

            return self.save_as_artifacts(user_id, toCache, taskID=taskID, toWait=toWait)

    def process_and_import_standalone_content(self, _working_dir, user_id,
                                   import_drill_mode='concept',
                                   content_splitter_guide=None,
                                   is_metadata_mode=False,
                                   toCache=True,
                                   wikiurl=None,
                                   taskID=None,
                                   toWait=False):
        self.wikiurl = wikiurl
        self.user_id = user_id
        try:
            self.is_metadata_mode = eval(str(is_metadata_mode))
        except Exception as e:
            self.is_metadata_mode = False

        self.browse_term_csv_path = _working_dir + "/" + self.browse_term_csv_path
        self.state_standard_csv_path = _working_dir + "/" + self.state_standard_csv_path
        try:
            ff = open("%s/%s"%(_working_dir, settings.IMG_PATH_MAPPER_FILE), 'r')
            self.all_image_paths = jsonlib.read(ff.read())
            ff.close()
        except Exception as e:
            self.all_image_paths = {}
        chapter_xhtmls = os.walk(_working_dir).next()[2]
        chapter_xhtmls.sort()
        if not chapter_xhtmls == []: 
            for each in chapter_xhtmls:
                if each.lower().endswith('.xhtml'):
                    file_path = _working_dir + "/" + each
                    f = open(file_path,"r")
                    self.buffer = f.read()
                    if self.buffer == False:
                        return
                if each.lower().startswith('metadata'):
                    file_path = _working_dir + "/" + each
                    xmldoc = minidom.parse(file_path)
                    head = xmldoc.documentElement
 
                    base_dir = os.path.dirname(file_path)
                    root_dir = base_dir
                    sub_dirs = os.walk(root_dir).next()[1]
     
                    for each in head.childNodes:
                        if each.nodeName.lower() == 'book':
                            self.standalone_content_info = self.new_fetch_info(each)
                            if os.path.isabs(each.getAttribute('fileref')):
                                standalone_content_xml_path = each.getAttribute('fileref')
                            else:
                                standalone_content_xml_path = base_dir + '/' + each.getAttribute('fileref')
                            standalone_content_xhtml_path = os.path.splitext(standalone_content_xml_path)[0] + ".xhtml" 
                            self.standalone_content_info['xml_path'] = standalone_content_xml_path
                            self.standalone_content_info['xhtml_path'] = standalone_content_xhtml_path
                            self.standalone_content_info['xhtml'] = self.get_content(self.standalone_content_info['xhtml_path'])
                            self.standalone_content_info['type'] = 'rwa'
                            self.standalone_content_info['children'] = []
                            self.standalone_content_info['related_eids'] = self.get_value_list(each, 'property:Related_EIDs')
                            self.log.info('property:Related_EIDs: [%s]' %(self.standalone_content_info['related_eids']))
                            concepts_re = re.compile('(<h3.*?>\s*Concepts\s*</h3>.*?)<h3',re.DOTALL)
                            try:
                                concepts_content = concepts_re.findall(self.standalone_content_info['xhtml'])[0]
                                self.standalone_content_info['xhtml'] = self.standalone_content_info['xhtml'].replace(concepts_content,'')
                            except Exception as e:
                                pass
                    standalone_content_id, standalone_content_rev_id = self._save_as_artifacts(self.standalone_content_info, 1, user_id, toCache)
                    if standalone_content_id != None:
                        self.all_artifact_ids.append(standalone_content_id)
                        self.api_manager.associate_resources(user_id, standalone_content_id, self.standalone_content_info.get('xhtml'))
                        self.api_manager.delete_existing_browse_terms_for_artifact(standalone_content_id)
                        traceback = {}
                        traceback['taskID'] = taskID
                        traceback['info'] = '1 (%s)'%self.standalone_content_info.get('title')
                        self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['keyword_list'], 'tag', None, traceback=traceback)
                        self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['grade_list'], 'grade level', None, traceback=traceback)
                        self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['state'], 'state', None, traceback=traceback)
                        self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['subjects'], 'subject', None, traceback=traceback)
                        if self.standalone_content_info.has_key('search'):
                            self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['search_terms'], 'search', None, traceback=traceback)
                        if self.standalone_content_info.has_key('level'):
                            self.build_browse_term_csv(standalone_content_id, self.standalone_content_info['level'], 'level', None, traceback=traceback)
                        for each in self.standalone_content_info['categories']:
                            self.build_browse_term_category_csv(standalone_content_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
                        self.api_manager.addRelatedArtifacts(standalone_content_id, self.standalone_content_info['related_eids']) 
                    self.api_manager.bulk_upload_browse_terms(user_id, self.browse_term_csv_path, toCache, toWait=toWait)
                    if toCache:
                        self.api_manager.reindex_artifacts(self.all_artifact_ids, user_id)
                    if standalone_content_id:
                        self.log.info("RWA Imported successfully, ID: " + str(standalone_content_id))
                        self.api_manager.createEvent('ARTIFACT_IMPORTED', objectID=standalone_content_id, objectType='artifact', 
                                eventData='RWA [id: %d] was successfully imported from "%s"' % (standalone_content_id, self.wikiurl), memberID=user_id)
                    else:
                        self.log.error("RWA import failed. Url: %s " % self.wikiurl)
                        self.api_manager.createEvent('ARTIFACT_IMPORT_FAILED', eventData='RWA import from "%s" failed' % (self.wikiurl), memberID=user_id)
                    return str(standalone_content_id)

    def fetch_all_info(self, metadata_xml_file_path, import_drill_mode):
        xmldoc = minidom.parse(metadata_xml_file_path)
        head = xmldoc.documentElement
        chapter_count = 1
 
        base_dir = os.path.dirname(metadata_xml_file_path)
        root_dir = base_dir
        sub_dirs = os.walk(root_dir).next()[1]
     
        for each in head.childNodes:
            self.is_new_metadata_format = True
            #try:
            #    self.is_new_metadata_format = self.deduce_metadata_format(each)
            #except Exception as e:
            #    self.is_new_metadata_format = False
            if each.nodeName.lower() == 'book':
                if self.is_new_metadata_format: 
                    self.book_info = self.new_fetch_info(each)
                else:
                    self.book_info = self.fetch_book_info(each) 
                if os.path.isabs(each.getAttribute('fileref')):
                    book_xml_path = each.getAttribute('fileref')
                else:
                    book_xml_path = base_dir + '/' + each.getAttribute('fileref')
                book_xhtml_path = os.path.splitext(book_xml_path)[0] + ".xhtml" 
                self.book_info['xml_path'] = book_xml_path
                self.book_info['xhtml_path'] = book_xhtml_path
                self.book_info['xhtml'] = self.get_content(self.book_info['xhtml_path'])
                self.book_info['xhtml'] = self.replace_chapter_toc(self.book_info['xhtml'])
                self.book_info['children'] = []
                self.book_info['type'] = 'book'
            artifact_type = self.get_artifact_type(each)
            if not artifact_type:
                artifact_type = each.nodeName.lower()
                
            if each.nodeName.lower() == 'chapter':
                if artifact_type.lower() == 'chapter':
                    if self.is_new_metadata_format: 
                        chapter_info = self.new_fetch_info(each)
                    else:
                        chapter_info = self.fetch_chapter_info(each)
                    chapter_info['children'] = []
                    if os.path.isabs(each.getAttribute('fileref')):
                        chapter_xml_path =  each.getAttribute('fileref')
                    else:
                        chapter_xml_path = base_dir + '/' + each.getAttribute('fileref')
                    chapter_xhtml_path = os.path.splitext(chapter_xml_path)[0] + ".xhtml" 
                    chapter_info['xml_path'] = chapter_xml_path
                    chapter_info['xhtml_path'] = chapter_xhtml_path
                    chapter_xhtml = ''
                    if not self.is_metadata_mode:
                        chapter_xhtml = self.get_content(chapter_info['xhtml_path'])
                    chapter_xhtml = self.build_chapter_xhtml(chapter_xhtml)
                    chapter_info['xhtml'] = chapter_xhtml
                    chapter_info['type'] = 'chapter'
                    #chapter_info['xhtml'] = self.get_content(chapter_info['xhtml_path'])
                    self.chapters_info.append(chapter_info)
                    self.book_info['children'].append(chapter_info)
                elif artifact_type.lower() == 'lesson':
                    if self.is_new_metadata_format: 
                        lesson_info = self.new_fetch_info(each)
                    else:
                        lesson_info = self.fetch_lesson_info(each)
                    lesson_info['children'] = []
                    if os.path.isabs(each.getAttribute('fileref')):
                        lesson_xml_path = each.getAttribute('fileref')
                    else:
                        lesson_xml_path = base_dir + '/' + each.getAttribute('fileref')
                    lesson_xhtml_path = os.path.splitext(lesson_xml_path)[0] + ".xhtml" 
                    lesson_info['xml_path'] = lesson_xml_path
                    lesson_info['xhtml_path'] = lesson_xhtml_path
                    lesson_xhtml = ''
                    if not self.is_metadata_mode:
                        lesson_xhtml = self.get_content(lesson_info['xhtml_path'])
                    lesson_info['xhtml'] = lesson_xhtml
                    lesson_info,concept_info = self.build_concept(each, lesson_info)
                    lesson_info['cover_image'] = self.get_first_img_info(lesson_info['xhtml'])
                    duplicated_file_path = self.make_duplicate(lesson_info['cover_image'])
                    #if duplicated_file_path != None:
                    lesson_info['cover_image'] = duplicated_file_path
                    concept_info['type'] = 'concept'
                    concept_info['children'] = []
                    lesson_info['type'] = 'lesson'
                    lesson_info['children'].append(concept_info)
                    self.lessons_info.append(lesson_info)
                    self.book_info['children'].append(lesson_info)
            if each.nodeName.lower() == 'lesson':
                if self.is_new_metadata_format: 
                    lesson_info = self.new_fetch_info(each)
                else:
                    lesson_info = self.fetch_lesson_info(each)
                lesson_info['children'] = []
                if os.path.isabs(each.getAttribute('fileref')):
                    lesson_xml_path = each.getAttribute('fileref')
                else:
                    lesson_xml_path = base_dir + '/' + each.getAttribute('fileref')
                lesson_xhtml_path = os.path.splitext(lesson_xml_path)[0] + ".xhtml" 
                lesson_info['xml_path'] = lesson_xml_path
                lesson_info['xhtml_path'] = lesson_xhtml_path
                lesson_xhtml = ''
                if not self.is_metadata_mode:
                    lesson_xhtml = self.get_content(lesson_info['xhtml_path'])
                lesson_info['xhtml'] = lesson_xhtml
                lesson_info['type'] = 'lesson'
                lesson_info,concept_info = self.build_concept(each, lesson_info)
                lesson_info['cover_image'] = self.get_first_img_info(lesson_info['xhtml'])
                duplicated_file_path = self.make_duplicate(lesson_info['cover_image'])
                #if duplicated_file_path != None:
                lesson_info['cover_image'] = duplicated_file_path
                concept_info['type'] = 'concept'
                concept_info['children'] = []
                lesson_info['children'].append(concept_info)
                parent_chapter = self.book_info['children'][-1:][0]
                #self.log.info('PARENT: %s'%str(parent_chapter))
                parent_chapter['children'].append(lesson_info)
                self.lessons_info.append(lesson_info)
                self.chapters_info.append(parent_chapter)

    def _save_as_artifacts(self, artifact, artifact_no, user_id, toCache=True, prefix='', taskID=None):
            child_artifact_no = 1
            child_ids = {}
            child_rev_ids = {}
            for each_child in artifact['children']:
                if prefix and not prefix.endswith('.'):
                    prefix += '.'
                newPrefix = '%s%s' % (prefix, child_artifact_no)
                self.api_manager.updateTaskUserData(taskID, updateDict={'processing': '%s (%s) (%s)' % (newPrefix, artifact.get('encoded_id'), artifact.get('title'))})
                artifact_id, artifact_rev_id = self._save_as_artifacts(each_child, child_artifact_no, user_id, toCache, prefix=newPrefix, taskID=taskID)
                if artifact_id and artifact_rev_id:
                    child_ids[child_artifact_no] = artifact_id 
                    child_rev_ids[child_artifact_no] = artifact_rev_id
                    self.api_manager.associate_resources(user_id, artifact_id, each_child.get('xhtml')) 
                    self.api_manager.delete_existing_browse_terms_for_artifact(artifact_id)
                    traceback = {}
                    traceback['taskID'] = taskID
                    traceback['info'] = '%s (%s)' % (newPrefix, artifact.get('encoded_id'))
                    self.build_browse_term_csv(artifact_id, each_child['keyword_list'], 'tag', None, traceback=traceback)
                    self.build_browse_term_csv(artifact_id, each_child['grade_list'], 'grade level', None, traceback=traceback)
                    self.build_browse_term_csv(artifact_id, each_child['state'], 'state', None, traceback=traceback)
                    self.build_browse_term_csv(artifact_id, each_child['subjects'], 'subject', None, traceback=traceback)
                    if each_child.has_key('search_terms'):
                        self.build_browse_term_csv(artifact_id, each_child['search_terms'], 'search', None, traceback=traceback)
                    if each_child.has_key('level'):
                        self.build_browse_term_csv(artifact_id, each_child['level'], 'level', None, traceback=traceback)
                    if each_child['type'].lower() in self.ALLOWED_TYPES_FOR_DOMAINS:
                        if each_child.get('shortened_encoded_id'):
                            self.build_browse_term_csv(artifact_id, [each_child['shortened_encoded_id']], 'domain', None, traceback=traceback)
                            if each_child.has_key('related_eids') and each_child['related_eids'] and each_child.get('shortened_encoded_id') not in each_child['related_eids']:
                                each_child['related_eids'].append(each_child.get('shortened_encoded_id'))
                    for each in each_child['categories']:
                        self.build_browse_term_category_csv(artifact_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
                    if each_child.has_key('related_eids') and each_child['related_eids']:
                        self.api_manager.addRelatedArtifacts(artifact_id, each_child['related_eids'])
                    if artifact['type'].lower() == 'lesson':
                        artifact['concept_id'] = artifact_id
                        artifact['concept_rev'] = '1'
                        artifact = self.build_lesson_xhtml(artifact)
                    if each_child['type'].lower() == 'lesson':
                        for each_concept in each_child['children']:
                            self.api_manager.associate_resources(user_id, artifact_id, each_concept.get('xhtml'))
                            cover_image_url,resource_id = self.api_manager.create_resource_int(each_concept['cover_image'], user_id, "cover page",each_concept['title'])
                            if resource_id and cover_image_url != each_concept['cover_image']:
                                self.api_manager.associate_resource(user_id, resource_id, artifact_id)
                            else:
                                self.log.warn("Cover image resource_id: %s, cover_image_url: %s, artifact_id: %s" % (resource_id, cover_image_url, artifact_id))
                    child_artifact_no = child_artifact_no + 1
            if artifact['type'].lower() == 'chapter':
                artifact['bookTitle'] = self.book_info['title']
                artifact['seq'] = artifact_no
                if self.book_info.get('encoded_id') and not artifact.get('encoded_id'):
                    artifact['encoded_id'] = '%s.%d' % (self.book_info.get('encoded_id'), artifact_no)
                    self.log.info("Setting chapter encoded_id to: %s" % artifact.get('encoded_id'))
                self.log.info("Saving chapter: %s of %s" % (artifact['title'], artifact['bookTitle']))
            artifact['children_ids'] = child_ids
            artifact['children_rev_ids'] = child_rev_ids
            try:
                artifact_id, artifact_rev_id = self.api_manager.save_artifact_internal(artifact, user_id, artifact['type'], self.is_metadata_mode, toCache)
            except Exception as e:
                if prefix and not prefix.endswith('.'):
                    prefix += '.'
                newPrefix = '%s%s' % (prefix, artifact_no)
                self.api_manager.updateTaskUserData(taskID, {'message': e.__str__(), 'status':'Failed', 'traceback': '%s (%s)'%(newPrefix, artifact.get('encoded_id'))})
                raise e 
            return artifact_id, artifact_rev_id

    def save_as_artifacts(self, user_id, toCache=True, taskID=None, toWait=False):
        book_id, book_rev_id = self._save_as_artifacts(self.book_info, 1, user_id, toCache, taskID=taskID)
        if book_id != None:
            self.all_artifact_ids.append(book_id)
            self.api_manager.associate_resources(user_id, book_id, self.book_info.get('xhtml'))
            self.api_manager.delete_existing_browse_terms_for_artifact(book_id)
            traceback = {}
            traceback['taskID'] = taskID
            traceback['info'] = '1 (%s)'%self.book_info.get('encoded_id')
            self.build_browse_term_csv(book_id, self.book_info['keyword_list'], 'tag', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['grade_list'], 'grade level', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['state'], 'state', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['subjects'], 'subject', None, traceback=traceback)
            if self.book_info.has_key('search'):
                self.build_browse_term_csv(book_id, self.book_info['search_terms'], 'search', None, traceback=traceback)
            if self.book_info.has_key('level'):
                self.build_browse_term_csv(book_id, self.book_info['level'], 'level', None, traceback=traceback)
            for each in self.book_info['categories']:
                self.build_browse_term_category_csv(book_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
        
        self.api_manager.bulk_upload_browse_terms(user_id, self.browse_term_csv_path, toCache, toWait=toWait)
        if toCache:
            self.api_manager.reindex_artifacts(self.all_artifact_ids, user_id)
        if book_id:
            self.log.info("Book Imported successfully, ID: " + str(book_id))
            self.api_manager.createEvent('ARTIFACT_IMPORTED', objectID=book_id, objectType='artifact', 
                    eventData='Book [id: %d] was successfully imported from "%s"' % (book_id, self.wikiurl), memberID=user_id)
        else:
            self.log.error("Book import failed. Url: %s " % self.wikiurl)
            self.api_manager.createEvent('ARTIFACT_IMPORT_FAILED', eventData='Book import from "%s" failed' % (self.wikiurl), memberID=user_id)
        return str(book_id)

    def fetch_book_info(self, book_node):
        book_info = {}

        # Explicit control of reindex and cache generation
        book_info['reindex'] = 'False'
        book_info['cache_math'] = 'True'
        

        try:
            book_info['title'] = book_node.getElementsByTagName('property:Book_title')[0].firstChild.data
        except:
            book_info['title'] = '' 

        try:
            if book_info['title'].strip() == '':
                book_info['title'] = os.path.basename(book_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        except Exception as e:
            book_info['title'] = ''

        try:
            book_info['desc'] = book_node.getElementsByTagName('property:About_book')[0].firstChild.data
        except:
            book_info['desc'] = '' 

        book_info['book_type'] = 'book'
        try:
            book_info['book_type'] = book_node.getElementsByTagName('property:Book_type')[0].firstChild.data
        except:
            pass
        ## Check if the book is a teacher edition
        if 'teacher' in book_info['book_type'].lower():
            book_info['book_type'] = 'tebook'
        elif 'quiz' in book_info['book_type'].lower():
            book_info['book_type'] = 'quizbook'
        else:
            book_info['book_type'] = 'book'

        book_info['keyword_list'] = self.get_value_list(book_node, 'property:Keyword')
        book_info['grade_list'] = self.parseGrades(self.get_value_list(book_node, 'property:Grade'))
        book_info['state'] = self.get_value_list(book_node, 'property:State')
        book_info['subjects'] = []

        book_info['author_details'] = self.get_author_details(book_node)
        book_info['categories'] = self.get_categories(book_node)
       
        try:
            cover_image_resolver =  book_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
            subjects = book_node.getElementsByTagName('swivt:Subject')
            book_info['cover_image'] = None
  
            for each in subjects:
                if each.getAttribute('rdf:about') == cover_image_resolver:
                    cover_image_url = each.getElementsByTagName('rdfs:label')[0].childNodes[0].data.strip().replace(' ','_')
                    book_info['cover_image_url'] = cover_image_url
                    book_info['cover_image'] = self.downloadImage(cover_image_url)
                    break
        except:
            book_info['cover_image'] = None
       
        category_list = book_node.getElementsByTagName('property:Category_Node_2')
        category_list.extend(book_node.getElementsByTagName('property:Category_Node'))
        book_category = None
        try:
            for each in category_list:
                if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
                    book_category = each.childNodes[1].childNodes[5].childNodes[0].data
                    break
        except:
            book_category = None

        book_info['book_category'] = book_category


        return book_info

    def fetch_chapter_info(self, chapter_node):
        chapter_info = {}

        # Explicit control of reindex and cache generation
        chapter_info['reindex'] = 'False'
        chapter_info['cache_math'] = 'True'

        try:
            chapter_info['title'] = chapter_node.getElementsByTagName('property:Chapter_title')[0].firstChild.data
        except Exception as e:
            chapter_info['title'] = '' 
 
        try:
            if chapter_info['title'].strip() == '':
                chapter_info['title'] = os.path.basename(chapter_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        except Exception as e:
            chapter_info['title'] = ''

        try:
            chapter_info['desc'] = chapter_node.getElementsByTagName('property:About_chapter')[0].firstChild.data
        except Exception as e:
            chapter_info['desc'] = ''

        chapter_info['keyword_list'] = self.get_value_list(chapter_node, 'property:Keyword')
        chapter_info['grade_list'] = self.parseGrades(self.get_value_list(chapter_node, 'property:Grade'))
        chapter_info['state'] = self.get_value_list(chapter_node, 'property:State')
        chapter_info['subjects'] = []

        chapter_info['author_details'] = self.get_author_details(chapter_node)
        chapter_info['categories'] = self.get_categories(chapter_node)
        try:
            cover_image_resolver =  chapter_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
            subjects = chapter_node.getElementsByTagName('swivt:Subject')
            chapter_info['cover_image'] = None
  
            for each in subjects:
                if each.getAttribute('rdf:about') == cover_image_resolver:
                    cover_image_url = each.getElementsByTagName('rdfs:label')[0].childNodes[0].data.strip().replace(' ','_') 
                    chapter_info['cover_image'] = self.downloadImage(cover_image_url)
                    break
        except:
            chapter_info['cover_image'] = None

        category_list = chapter_node.getElementsByTagName('property:Category_Node_2')
        category_list.extend(chapter_node.getElementsByTagName('property:Category_Node'))
        chapter_category = None
        try:
            for each in category_list:
                if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
                    chapter_category = each.childNodes[1].childNodes[5].childNodes[0].data
                    break
        except:
            chapter_category = None

        chapter_info['chapter_category'] = chapter_category

        return chapter_info

    def fetch_lesson_info(self, lesson_node):
        lesson_info = {}

        # Explicit control of reindex and cache generation
        lesson_info['reindex'] = 'False'
        lesson_info['cache_math'] = 'True'
        lesson_info['subjects'] = []

        try:
            lesson_info['title'] = lesson_node.getElementsByTagName('property:Lesson_title')[0].firstChild.data
        except Exception as e:
            lesson_info['title'] = '' 

        try:
            if lesson_info['title'].strip() == '':
                lesson_info['title'] = os.path.basename(lesson_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        except Exception as e:
            lesson_info['title'] = ''

        try:
            lesson_info['desc'] = lesson_node.getElementsByTagName('property:About_Lesson')[0].firstChild.data
        except Exception as e:
            lesson_info['desc'] = ''

        lesson_info['keyword_list'] = self.get_value_list(lesson_node, 'property:Keyword')
        lesson_info['grade_list'] = self.parseGrades(self.get_value_list(lesson_node, 'property:Grade'))
        lesson_info['state'] = self.get_value_list(lesson_node, 'property:State')

        lesson_info['related_eids'] = self.get_value_list(each, 'property:Related_EIDs')
        self.log.info('property:Related_EIDs: [%s]' %(lesson_info['related_eids']))

        lesson_info['author_details'] = self.get_author_details(lesson_node)
        lesson_info['categories'] = self.get_categories(lesson_node)
        encoded_id = self.new_get_encoded_id(lesson_node, 'lesson')
        if encoded_id != {}:
            lesson_info['encoded_id'] = encoded_id['full']
            lesson_info['shortened_encoded_id'] = encoded_id['shortened']
            #lesson_info['keyword_list'].append(lesson_info['encoded_id'])
            #lesson_info['keyword_list'].append(lesson_info['shortened_encoded_id'])
        else:
            lesson_info['encoded_id'] = None
            lesson_info['shortened_encoded_id'] = None
        try:
            cover_image_resolver =  lesson_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
            subjects = lesson_node.getElementsByTagName('swivt:Subject')
            lesson_info['cover_image'] = None
  
            for each in subjects:
                if each.getAttribute('rdf:about') == cover_image_resolver:
                    cover_image_url = each.getElementsByTagName('rdfs:label')[0].childNodes[0].data.strip().replace(' ','_') 
                    lesson_info['cover_image'] = self.downloadImage(cover_image_url)
                    break
        except:
            lesson_info['cover_image'] = None

        category_list = lesson_node.getElementsByTagName('property:Category_Node_2')
        category_list.extend(lesson_node.getElementsByTagName('property:Category_Node'))
        lesson_category = None
        try:
            for each in category_list:
                if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
                    lesson_category = each.childNodes[1].childNodes[5].childNodes[0].data
                    break
        except:
            lesson_category = None

        lesson_info['lesson_category'] = lesson_category

        return lesson_info

    def get_encoded_id(self, node, artifact_type):
        encoded_id = {}
        encoded_id['full'] = ''
        encoded_id['shortened'] = ''
        if artifact_type.lower() == 'concept':
            splitter = '.C.'
        if artifact_type.lower() == 'lesson':
            splitter = '.L.'

        try:
            enc_ids = self.get_value_list(node, 'property:Encoded_ID')
            for each_enc_id in enc_ids:
               if each_enc_id.__contains__(splitter):
                   encoded_id_parts = each_enc_id.split('.')
                   if len(encoded_id_parts) == 6 and encoded_id_parts[3] == '0':
                       encoded_id_parts.pop(3)
                       each_enc_id = ".".join(encoded_id_parts)
                   encoded_id['full'] = each_enc_id
                   encoded_id['shortened'] = each_enc_id.split(splitter)[0]
                   break
        except Exception as e:
            self.log.error('GET_ENCODED_ID: Exception: %s'% (e.__str__()))

        return encoded_id
                

    def build_chapter_xhtml(self, chapter_xhtml):
        chapter_skeleton = self.get_content(settings.CHAPTER_SKELETON_FILE)
        try:
            sections_re_obj = re.compile('<h2.*?>')
            sections = sections_re_obj.split(chapter_xhtml)
            introduction_content = None
            summary_content = None
            for each in sections:
                if each.strip().startswith('Introduction'):
                    introduction_content = each.split('</h2>')[1]
                    introduction_content = '<h2 id="x-ck12-SW50cm9kdWN0aW9u">Introduction</h2>' + introduction_content
                    self.log.info(introduction_content)
                if each.strip().startswith('Summary'):
                    summary_content = each.split('</h2>')[1]
                    summary_content = '<h2 id="x-ck12-U3VtbWFyeQ..">Summary</h2>' + summary_content
                    self.log.info(summary_content)
            if introduction_content:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_CONT%',
                                                            introduction_content)
            else:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_CONT%', '')
            if summary_content:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_TAIL_SUBSECTIONS%', summary_content)
            else:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_TAIL_SUBSECTIONS%', '')
        except Exception as e:
            self.log.info(e.__str__())
        self.log.info('Chapter skeleton: %s' %(chapter_skeleton))
        return chapter_skeleton

    def build_concept(self, metadata_node, lesson_info):
        concept_info = {}
        # Explicit control of reindex and cache generation
        concept_info['reindex'] = 'False'
        concept_info['cache_math'] = 'True'

        try:
            concept_info['title'] = metadata_node.getElementsByTagName('property:Title')[0].firstChild.data
        except Exception as e:
            concept_info['title'] = ''

        try:
            if concept_info['title'].strip() == '':
                concept_info['title'] = os.path.basename(metadata_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        except Exception as e:
            concept_info['title'] = ''

        concept_info['handle'] = lesson_info.get('handle')

        try:
            concept_info['desc'] = metadata_node.getElementsByTagName('property:Description')[0].firstChild.data
        except Exception as e:
            concept_info['desc'] = ''

        concept_info['xhtml'] = ''
        concept_content = ''
        if api.isLessonConceptSplitEnabled:        
            try:
                lesson_xhtml = lesson_info['xhtml']
                lesson_xhtml, concept_content = h.splitLessonXhtml(lesson_xhtml, splitOn='h2')
                self.log.info("Getting first video from: %s" % concept_info['title'])
                first_video_snippet,first_video_url,first_video_resid = self.get_first_video_snippet(concept_content)
                if first_video_snippet is not None:
                    concept_info['first_video_snippet'] = first_video_snippet
                    concept_info['first_video_url'] = first_video_url
                    concept_info['first_video_resid'] = first_video_resid
                lesson_info['xhtml'] = lesson_xhtml
            except Exception as e:
                self.log.error("Error splitting lesson content into concept: %s" % str(e), exc_info=e)
                concept_content = lesson_info['xhtml']
                lesson_xhtml = h.getLessonSkeleton()
        else:
            conceptStartXHTML = "<!-- Begin inserted XHTML \[CONCEPT: .*\] -->"
            conceptEndXHTML = "<!-- End inserted XHTML \[CONCEPT: .*\] -->"
            conceptStartXHTML = re.search(conceptStartXHTML, xhtml)
            conceptEndXHTML = re.search(conceptEndXHTML, xhtml)
            if conceptStartXHTML and conceptEndXHTML:
                xhtml = xhtml[:conceptStartXHTML.start()]+xhtml[conceptStartXHTML.end():conceptEndXHTML.start()]+xhtml[conceptEndXHTML.end():]
    
            lesson_xhtml=xhtml
            concept_content=None             

        lesson_info['xhtml'] = lesson_xhtml
        concept_info['xhtml'] = concept_content
        # Passing metadata of lesson to concept
        concept_info['cover_image'] = self.get_first_img_info(concept_info['xhtml'])
        duplicated_file_path = self.make_duplicate(concept_info['cover_image'])
        #if duplicated_file_path != None:
        concept_info['cover_image'] = duplicated_file_path
        concept_info['keyword_list'] = []
        concept_info['grade_list'] = []
        concept_info['state'] = []
        concept_info['subjects'] = []
        concept_info['categories'] = []
        concept_info['level'] = []
        concept_info['keyword_list'].extend(lesson_info['keyword_list'])
        concept_info['grade_list'].extend(lesson_info['grade_list'])
        concept_info['state'].extend(lesson_info['state'])
        concept_info['subjects'].extend(lesson_info['subjects'])
        concept_info['categories'].extend(lesson_info['categories'])
        concept_info['level'].extend(lesson_info['level'])
        concept_info['author_details'] = self.new_get_author_details(metadata_node)
        #Derive concept encoded ID from lesson's
        encoded_id = self.new_get_encoded_id(metadata_node, 'lesson')
        if encoded_id != {}:
            concept_info['encoded_id'] = encoded_id['full'].replace('.L.','.C.')
            concept_info['shortened_encoded_id'] = encoded_id['shortened']
            if encoded_id['full'] != '':
                concept_info['keyword_list'].append(concept_info['encoded_id'])
            #concept_info['keyword_list'].append(concept_info['shortened_encoded_id'])
        else:
            concept_info['encoded_id'] = None
            concept_info['shortened_encoded_id'] = None

        return lesson_info, concept_info

    def build_lesson_xhtml(self, lesson_info):
        # Concept ID and revision replacing
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_ID%',str(lesson_info['concept_id']))
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_REV%',str(lesson_info['concept_rev']))
        return lesson_info

    def process_images(self, working_dir, user_id):
        self.log.info("Getting into images section 1")
        self.user_id = user_id
 
        os_walker = os.walk(working_dir)
        xhtmls = os_walker.next()
        try:
            while xhtmls != None:
                for each in xhtmls[2]:
                   if each.endswith('.xhtml') and not each.startswith('metadata'): 
                       file_path = xhtmls[0] + "/" + each
                       f = codecs.open(file_path,"r", encoding='utf-8')
                       self.buffer = f.read()
                       f.close()
                       try:
                           self.buffer = h.transform_to_xhtml(self.buffer, addIDs=False)
                       except Exception as e:
                           self.log.info("transform_to_xhtml: %s" % e.__str__())
                       try:
                           self.buffer = self.process_external_images(xhtmls[0], self.buffer)
                       except Exception as e:
                           self.log.info("Process_external_images: %s" % e.__str__())
                       try:
                           self.buffer = self.create_embedded_objects(self.buffer, user_id)
                       except Exception as e:
                           self.log.info("create_embedded_objects: %s" % e.__str__())
                       try:
                           self.buffer = self.process_embedded_objects(self.buffer, user_id)
                       except Exception as e:
                           self.log.info("process_embedded_objects: %s" % e.__str__())
                       xhtml_write_path = codecs.open(file_path, "w", encoding='utf-8')
                       xhtml_write_path.write(self.buffer)
                       xhtml_write_path.close()
                xhtmls = os_walker.next()
        except Exception as e:
            self.log.info("Method:process_images: %s" % e.__str__())
        ''' 
        chapter_xhtmls = os.walk(working_dir).next()[2]
        chapter_xhtmls.sort()
        if not chapter_xhtmls == []: 
            for each in chapter_xhtmls:
                if each.lower().startswith('chapter'):
                    self.log.info (" Converting " + each + " to tidied xhtml..")
                    file_path = working_dir + "/" + each
                    f = open(file_path,"r")
                    xhtml_write_path = open(os.path.splitext(file_path)[0] + ".xhtml", "w")
                    self.buffer = self.translator.get_rosetta_xhtml(f.read())
                    if self.buffer == False:
                        return
                    self.buffer = self.process_external_images(working_dir, self.buffer)    
                    xhtml_write_path.write(self.buffer)
                    f.close()
                    xhtml_write_path.close()
        '''
        try:
            ff = open("%s/%s"%(working_dir, settings.IMG_PATH_MAPPER_FILE), 'w')
            ff.write(jsonlib.dumps(self.all_image_paths))
            ff.close()
        except Exception as e:
            self.log.error("IMG Mapper writer: "+ str(e)) 

    ## Regular expressions to get first video info
    videoRegex = re.compile(r'<iframe ([^<>]*)>', re.I | re.MULTILINE)
    idRegex = re.compile(r'[ ]*name="([0-9]*)"', re.I)

    def get_first_video_snippet(self, xhtml_content):

        video_text = None
        video_url = None
        video_resource_id = None

        self.get_first_video = False
        if self.get_first_video:
            try:
                p = self.videoRegex.search(xhtml_content)
                if p:
                    text = p.group(1)
                    m = self.idRegex.search(text)
                    if m:
                        videoID = int(m.group(1))
                        eo_info = self.api_manager.get_eo_info(eo_id=videoID)
                        if eo_info.get('resource'):
                            video_resource_id = eo_info['resource']['id']
                        video_url = eo_info['url']
                        video_text = eo_info['code']
                        self.log.info("First video: url: %s, code: %s" % (video_url, video_text))
                if not video_text or not video_url:
                    raise Exception((_(u'Cannot find first_video_snippet')).encode("utf-8"))
            except Exception as e: 
                self.log.info("Error getting first video_snippet: %s" % str(e))
                video_text  = None
                video_url = None
                
        return video_text,video_url,video_resource_id

    def is_wiki_rwa(self, metadata_xml_file_path):
        xmldoc = minidom.parse(metadata_xml_file_path)
        head = xmldoc.documentElement
     
        artifact_type = ''
        for each in head.childNodes:
            if each.nodeName.lower() == 'book':
                try:
                    artifact_type = each.getElementsByTagName('property:Artifact_Type')[0].firstChild.data
                    break
                except: 
                    pass
        if artifact_type == 'application':
            return True
        else:
            return False
 
if __name__ == "__main__":
    wiki_importer = WikiImporter()
    user_id = "1"
    importer_res = wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/SAT_Prep_FlexBook_%28Questions_and_Answer_Key%29', user_id)
    logger = logging.getLogger(__name__)
    logger.setLevel(log_level)
    wiki_importer.process_and_import_content(importer_res['working_dir'], importer_res['user_id'], 'concept')
    #wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/CK-12_Biology', user_id)
