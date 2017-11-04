#!/usr/bin/python
'''
This is the wiki importer for loading 2.0 data from wiki.
from pylons.i18n.translation import _ 
'''
from pylons import config
import os, re, jsonlib, glob
from xml.dom import minidom
from BeautifulSoup import BeautifulStoneSoup
import codecs
from datetime import datetime
from flx.lib.unicode_util import UnicodeDictReader
from flx.model.model import title2Handle

from importer import WikiImporterBase
import logging
import settings
import traceback
import ConfigParser

from flx.model import api
from flx.model import model
from flx.lib import helpers as h


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
        self.chapters_info = []
        self.lessons_info = []
        self.all_artifact_ids = []
        self.working_dir = settings.WORKING_DIR
        self.user_id = ''
        if not os.path.exists(self.working_dir):
            os.mkdir(self.working_dir)
        self.browse_term_csv_path = settings.BROWSE_TERM_CSV_PATH
        self.browse_term_csv_writer = None
        self.state_standard_csv_path = settings.STATE_STANDARD_CSV_PATH
        self.state_standard_csv_writer = None
        self.content_splitter_guide = None
        self.is_metadata_mode = False
        self.all_image_paths = {}
        self.externalEncodes = {}
        self.checkForExistingArtifacts = False
        self.importUserID = config.get('import_user_id')
        if self.importUserID is None:
            self.importUserID = 3
        else:
            self.importUserID = int(self.importUserID)

    def import_from_wiki(self, _wikiurl, user_id, workdir=None, is_metadata_mode=False):
        return WikiImporterBase.import_from_wiki(self, _wikiurl, user_id, workdir=workdir, is_metadata_mode=is_metadata_mode, concept_mode=False)

    def process_and_import_content(self, _working_dir, user_id, 
            import_drill_mode='concept', 
            content_splitter_guide=None, 
            is_metadata_mode=False,
            toCache=True,
            wikiurl=None, taskID=None, toWait=False):

        self.wikiurl = wikiurl
        self.user_id = user_id
        self.content_splitter_guide = content_splitter_guide
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
        chapter_docbooks = os.walk(_working_dir).next()[2]
        chapter_docbooks.sort()
        if not chapter_docbooks == []: 
            for each in chapter_docbooks:
                if each.lower().endswith('.xhtml'):
                    file_path = _working_dir + "/" + each
                    f = open(file_path,"r")
                    self.buffer = f.read()
                    if self.buffer == False:
                        return
                if each.lower().startswith('metadata'):
                    file_path = _working_dir + "/" + each
                    self.fetch_all_info(file_path, import_drill_mode)
            #self.chapters_info = sorted(self.chapters_info, key=lambda k: k['chapter_xhtml_path'])

            return self.save_as_artifacts(user_id, toCache, taskID=taskID, toWait=toWait)

    def fetch_all_info(self, metadata_xml_file_path, import_drill_mode):
        xmldoc = minidom.parse(metadata_xml_file_path)
        head = xmldoc.documentElement
        chapter_count = 1
        titleDict = {}
        for each in head.childNodes:
            try:
                self.is_new_metadata_format = self.deduce_metadata_format(each)
            except Exception as e:
                self.is_new_metadata_format = False
    
            self.log.info("is_new_metadata_format: %s" % str(self.is_new_metadata_format))
            if self.is_artifact_type(each,"book") == True:
                self.log.info('found book')
                base_dir = os.path.dirname(metadata_xml_file_path)
                if self.is_new_metadata_format:
                    self.book_info = self.new_fetch_info(each)
                else:
                    self.book_info = self.fetch_book_info(each) 
                if self.book_info['title'].strip() == '':
                    self.book_info['title'] = 'Untitled FlexBook'
                if os.path.isabs(each.getAttribute('fileref')):
                    book_xml_path = each.getAttribute('fileref')
                else:
                    book_xml_path = base_dir + '/' + each.getAttribute('fileref')
                book_xhtml_path = os.path.splitext(book_xml_path)[0] + ".xhtml" 
                self.book_info['xml_path'] = book_xml_path
                self.book_info['xhtml_path'] = book_xhtml_path
                self.book_info['xhtml'] = self.get_content(self.book_info['xhtml_path'])
                self.book_info['xhtml'] = self.replace_chapter_toc(self.book_info['xhtml'])
                if self.book_info:
                    self.loadExternalCategories(self.book_info['title'])
            else:
                if self.is_artifact_type(each, "chapter") == True:
                    self.log.info( 'found chapter')
                    base_dir = os.path.dirname(metadata_xml_file_path)
                    if self.is_new_metadata_format: 
                        chapter_info = self.new_fetch_info(each)
                    else:
                        chapter_info = self.fetch_chapter_info(each)
                    chapter_xml_path = each.getAttribute('fileref')
                    if os.path.isabs(chapter_xml_path):
                        chapter_info['chapter_xhtml_path'] = os.path.splitext(chapter_xml_path)[0] + ".xhtml"
                    else:
                        chapter_info['chapter_xhtml_path'] = base_dir + "/" + os.path.splitext(chapter_xml_path)[0] + ".xhtml"

                    chapter_info['xhtml'] = ''
                    try:
                        if not self.is_metadata_mode:
                            chapter_info['xhtml'] = codecs.open(chapter_info['chapter_xhtml_path'],"r",encoding="utf-8").read()
                    except Exception as e:
                        chapter_info['xhtml'] = ''
                        self.log.error('Error with reading file: %s'% chapter_info['chapter_xhtml_path'])
                        self.log.error('Reason: %s'%e.__str__())
                    chapter_info['lessons'] = []

                    chapter_title_prefix_remover = self.get_from_config(self.content_splitter_guide, 'chapter_content', 'title_prefix_remover')
                    if not chapter_title_prefix_remover:
                        chapter_title_prefix_remover = []
                    chapter_title_suffix_remover = self.get_from_config(self.content_splitter_guide, 'chapter_content', 'title_suffix_remover')
                    if not chapter_title_suffix_remover:
                        chapter_title_suffix_remover = []

                    title = chapter_info['title']
                    t = title
                    count = 1
                    while titleDict.get(title):
                        title = '%s - %d' % (t, count)
                        count += 1
                    chapter_info['title'] = title
                    chapter_info['old_title'] = title
                    titleDict[title] = chapter_info

                    for eachpref in chapter_title_prefix_remover:
                        chapter_info['title'] = re.sub('^%s'%eachpref,'',chapter_info['title'])
                    for eachsuf in chapter_title_suffix_remover:
                        chapter_info['title'] = re.sub('%s$'%eachsuf,'',chapter_info['title'])

                    if import_drill_mode == 'concept':
                        chapter_info = self.split_lessons(chapter_info, import_drill_mode)
                    elif import_drill_mode == 'section':
                        chapter_info = self.split_sections(chapter_info)

                    self.chapters_info.append(chapter_info)
                    chapter_count = chapter_count + 1

    def save_as_artifacts(self, user_id, toCache=True, taskID=None, toWait=False):
        chapter_ids = {}
        chapter_rev_ids = {}
        chapter_no = 1

        for each_chapter in self.chapters_info:

            self.book_info['subjects'].extend(each_chapter.get('subjects', []))

            chapter = None
            ## If checkForExistingArtifacts is True - we try to find a CK-12 artifact that matches the user artifact's title
            ## This is for user content import - when a chapter is referred from a CK-12 published book.
            self.api_manager.updateTaskUserData(taskID, {'processing': '%s.0' % chapter_no})
            if self.checkForExistingArtifacts and each_chapter.has_key('ck12ChapterName'):
                ck12BookName = each_chapter.get('ck12BookName')
                ck12ChapterName = each_chapter.get('ck12ChapterName')
                title = '%s%s%s' % (ck12ChapterName, self.getChapterSeparator(), ck12BookName)
                chapter = api.getArtifactByTitle(title=title, creatorID=self.importUserID, typeName='chapter')
                self.log.info('save_as_artifacts: share title[%s] chapter[%s]' % (title, chapter))
                if chapter is None:
                    if ck12BookName.startswith('CK-12 '):
                        ck12BookName = ck12BookName[6:]
                        title = '%s%s%s' % (ck12ChapterName, self.getChapterSeparator(), ck12BookName)
                        chapter = api.getArtifactByTitle(title=title, creatorID=self.importUserID, typeName='chapter')
                        self.log.info('save_as_artifacts: share title[%s] chapter[%s]' % (title, chapter))
                        if chapter is not None and not chapter.getChildren() and each_chapter.get('sections'):
                            self.log.info('save_as_artifacts: share title[%s] chapter[%s], but with no Children.  Trying to resave' % (title, chapter))
                            chapter = None
                if chapter is not None:
                    chapter_id = chapter.id
                    chapter_rev_id =  chapter.revisions[0].id

            if chapter is None:
                lesson_ids = {}
                lesson_rev_ids = {}
                lesson_no = 1

                if each_chapter.has_key('sections'):
                    section_ids = {}
                    section_rev_ids = {}
                    section_no = 1
                    for each_section in each_chapter['sections']:
                        children_ids = {}
                        children_rev_ids = {}
                        children_no = 1
                        each_section['children_ids'] = children_ids
                        each_section['children_rev_ids'] = children_rev_ids
                        #section_id = self.api_manager.save_artifact(each_section, user_id, "section")
                        each_section['parent_title'] = each_chapter['title']
                        each_section['parent_type'] = 'chapter'
                        if self.api_manager.is_duplicate_title(self.user_id,each_section,'section') and not self.api_manager.is_duplicate_artifact(self.user_id,each_section,'section'):
                            each_section['old_title'] = each_section['title']
                            each_section['title'] = "%s%s%s%s%s" % (each_section['old_title'], model.getChapterSeparator(), each_chapter['title'], model.getChapterSeparator(), self.book_info['title'])
                            self.log.info("Changed duplicate section title from: [%s] to [%s] handle:[%s]" % (each_section['old_title'], each_section['title'], each_section.get('handle')))

                        if not each_section.get('encoded_id') and each_chapter.get('encoded_id'):
                            each_section['encoded_id'] =  '%s.%d' % (each_chapter.get('encoded_id'), section_no)
                        self.log.info("Saving section: %s [EID: %s]" % (each_section['title'], each_section.get('encoded_id')))
                        try:
                            section_id, section_rev_id = self.api_manager.save_artifact_internal(each_section, user_id, "section", self.is_metadata_mode, toCache)
                        except Exception as e:
                            self.api_manager.updateTaskUserData(taskID, updateDict={'message': e.__str__(), 'traceback':'%s.%s.%s (%s:%s:%s)'%(1,chapter_no,section_no, self.book_info['title'], each_chapter['title'], each_section['title'])})
                            raise e
                        if section_id and section_rev_id:
                            self.all_artifact_ids.append(section_id)
                            section_ids[section_no] = section_id
                            section_rev_ids[section_no] = section_rev_id
                            self.api_manager.associate_resources(user_id, section_id, each_section.get('xhtml'))
                            self.api_manager.delete_existing_browse_terms_for_artifact(section_id)
                            traceback = {}
                            traceback['taskID'] = taskID
                            traceback['info'] = '%s.%s.%s (%s:%s:%s)'%(1,chapter_no,section_no, self.book_info['title'], each_chapter['title'], each_section['title'])
                            self.build_browse_term_csv(section_id, each_section['keyword_list'], 'tag', None, traceback=traceback)
                            self.build_browse_term_csv(section_id, each_section['grade_list'], 'grade level', None, traceback=traceback)
                            self.build_browse_term_csv(section_id, each_section['state'], 'state', None, traceback=traceback)
                            self.build_browse_term_csv(section_id, each_section['subjects'], 'subject', None, traceback=traceback)
                            if each_section.has_key('level'):
                                self.build_browse_term_csv(section_id, each_section['level'], 'level', None, traceback=traceback)
                            for each in each_section['categories']:
                                self.build_browse_term_category_csv(section_id, each['category_name'],'domain',each['category_parent'],each['category_child'], traceback=traceback)
                            section_no = section_no + 1
                    each_chapter['children_ids'] = section_ids
                    each_chapter['children_rev_ids'] = section_rev_ids
                else:
                    for each_lesson in each_chapter['lessons']:
                        concept_ids = {}
                        concept_rev_ids = {}
                        concept_no = 1
                        for each_concept in each_lesson['concepts']:
                            children_ids = {}
                            children_rev_ids = {}
                            children_no = 1
                            each_concept['children_ids'] = children_ids
                            each_concept['children_rev_ids'] = children_rev_ids
                            #concept_id = self.api_manager.save_artifact(each_concept, user_id, "concept")
                            try:
                                concept_id, concept_rev_id = self.api_manager.save_artifact_internal(each_concept, user_id, "concept", self.is_metadata_mode, toCache)
                            except Exception as e:
                                self.api_manager.updateTaskUserData(taskID, updateDict={'message': e.__str__(), 'traceback':'%s.%s.%s.%s (%s:%s:%s:%s)'%(1,chapter_no,lesson_no, concept_no, self.book_info['title'], each_chapter['title'], each_lesson['title'], each_concept['title'])})
                                raise e
                            if concept_id and concept_rev_id:
                                self.all_artifact_ids.append(concept_id)
                                concept_ids[concept_no] = concept_id
                                concept_rev_ids[concept_no] = concept_rev_id
                                self.api_manager.associate_resources(user_id, concept_id, each_concept.get('xhtml'))
                                self.api_manager.delete_existing_browse_terms_for_artifact(concept_id)
                                traceback = {}
                                traceback['taskID'] = taskID
                                traceback['info'] = '%s.%s.%s.%s (%s:%s:%s:%s)'%(1,chapter_no,lesson_no, concept_no, self.book_info['title'], each_chapter['title'], each_lesson['title'], each_concept['title'])
                                self.build_browse_term_csv(concept_id, each_concept['keyword_list'], 'tag', None, traceback=traceback)
                                self.build_browse_term_csv(concept_id, each_concept['grade_list'], 'grade level', None, traceback=traceback)
                                self.build_browse_term_csv(concept_id, each_concept['state'], 'state', None, traceback=traceback)
                                self.build_browse_term_csv(concept_id, each_concept['subjects'], 'subject', None, traceback=traceback)
                                if each_concept.has_key('level'):
                                    self.build_browse_term_csv(concept_id, each_concept['level'], 'level', None, traceback=traceback)
                                for each in each_concept['categories']:
                                    self.build_browse_term_category_csv(concept_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
                                each_lesson['concept_id'] = concept_id
                                each_lesson['concept_rev'] = '1'
                                each_lesson = self.build_lesson_xhtml(each_lesson)
                                concept_no = concept_no + 1
                        each_lesson['children_ids'] = concept_ids
                        each_lesson['children_rev_ids'] = concept_rev_ids
                        #lesson_id = self.api_manager.save_artifact(each_lesson, user_id,"lesson")
                        try:
                            lesson_id, lesson_rev_id = self.api_manager.save_artifact_internal(each_lesson, user_id,"lesson", self.is_metadata_mode, toCache)
                        except Exception as e:
                            self.api_manager.updateTaskUserData(taskID, updateDict={'message': e.__str__(), 'traceback':'%s.%s.%s (%s:%s:%s)'%(1,chapter_no,lesson_no, self.book_info['title'], each_chapter['title'], each_lesson['title'])})
                            raise e
                        if lesson_id and lesson_rev_id:
                            self.all_artifact_ids.append(lesson_id)
                            lesson_ids[lesson_no] = lesson_id
                            lesson_rev_ids[lesson_no] = lesson_rev_id
                            self.api_manager.associate_resources(user_id, lesson_id, each_lesson.get('xhtml'))
                            for each_concept in each_lesson['concepts']:
                                self.api_manager.associate_resources(user_id, lesson_id, each_concept.get('xhtml'))
                                cover_image_url,resource_id = self.api_manager.create_resource_int(each_concept['cover_image'], user_id, "cover page",each_concept['title'])
                                if not cover_image_url == each_concept['cover_image']:
                                    self.api_manager.associate_resource(user_id, resource_id, lesson_id)
                            self.api_manager.delete_existing_browse_terms_for_artifact(lesson_id)
                            traceback = {}
                            traceback['taskID'] = taskID
                            traceback['info'] = '%s.%s.%s (%s:%s:%s)'%(1,chapter_no,lesson_no, self.book_info['title'], each_chapter['title'], each_lesson['title'])
                            self.build_browse_term_csv(lesson_id, each_lesson['keyword_list'], 'tag', None, traceback=traceback)
                            self.build_browse_term_csv(lesson_id, each_lesson['grade_list'], 'grade level', None, traceback=traceback)
                            self.build_browse_term_csv(lesson_id, each_lesson['state'], 'state', None, traceback=traceback)
                            self.build_browse_term_csv(lesson_id, each_lesson['subjects'], 'subject', None, traceback=traceback)
                            if each_lesson.has_key('level'):
                                self.build_browse_term_csv(lesson_id, each_lesson['level'], 'level', None, traceback=traceback)
                            for each in each_lesson['categories']:
                                self.build_browse_term_category_csv(lesson_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
                            lesson_no = lesson_no + 1
                    each_chapter['children_ids'] = lesson_ids
                    each_chapter['children_rev_ids'] = lesson_rev_ids
                #chapter_id = self.api_manager.save_artifact(each_chapter, user_id, "chapter")
                each_chapter['bookTitle'] = self.book_info['title']
                each_chapter['seq'] = chapter_no
                if self.book_info.get('encoded_id'):
                    each_chapter['encoded_id'] = '%s.%d' % (self.book_info.get('encoded_id'), chapter_no)
                    self.log.info("Setting chapter encoded_id to: %s" % each_chapter.get('encoded_id'))
                self.log.info("Saving chapter: %s of %s" % (each_chapter['title'], each_chapter['bookTitle']))
                try:
                    chapter_id, chapter_rev_id = self.api_manager.save_artifact_internal(each_chapter, user_id, "chapter", self.is_metadata_mode, toCache)
                except Exception as e:
                    self.api_manager.updateTaskUserData(taskID, updateDict={'message': e.__str__(), 'traceback':'%s.%s (%s:%s)'%(1,chapter_no, self.book_info['title'], each_chapter['title'])})
                    raise e
            if chapter_id and chapter_rev_id:
                self.all_artifact_ids.append(chapter_id)
                chapter_ids[chapter_no] = chapter_id
                chapter_rev_ids[chapter_no] = chapter_rev_id
                self.api_manager.associate_resources(user_id, chapter_id, each_chapter.get('xhtml'))
                self.api_manager.delete_existing_browse_terms_for_artifact(chapter_id)
                traceback = {}
                traceback['taskID'] = taskID
                traceback['info'] = '%s.%s (%s:%s)'%(1,chapter_no, self.book_info['title'], each_chapter['title'])
                self.build_browse_term_csv(chapter_id, each_chapter['keyword_list'], 'tag', None, traceback=traceback)
                self.build_browse_term_csv(chapter_id, each_chapter['grade_list'], 'grade level', None, traceback=traceback)
                self.build_browse_term_csv(chapter_id, each_chapter['state'], 'state', None, traceback=traceback)
                self.build_browse_term_csv(chapter_id, each_chapter['subjects'], 'subject', None, traceback=traceback)
                if each_chapter.has_key('level'):
                    self.build_browse_term_csv(chapter_id, each_chapter['level'], 'level', None, traceback=traceback)
                for each in each_chapter['categories']:
                    self.build_browse_term_category_csv(chapter_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)
                chapter_no = chapter_no + 1
        self.book_info['children_ids'] = chapter_ids
        self.book_info['children_rev_ids'] = chapter_rev_ids
        #book_id = self.api_manager.save_artifact(self.book_info, user_id, "book")
        #self.log.info("Saving book: %s" % self.book_info['title'])
        try:
            book_id, book_rev_id = self.api_manager.save_artifact_internal(self.book_info, user_id, self.book_info['book_type'], self.is_metadata_mode, toCache)
        except Exception as e:
            self.api_manager.updateTaskUserData(taskID, updateDict={'message': e.__str__(), 'traceback':'%s (%s)'%(1, self.book_info['title'])})
            raise e
        #self.log.info("Saved book: %s, ID: %s, revID: %s" % (self.book_info['title'], book_id, book_rev_id))
        if book_id != None:
            self.all_artifact_ids.append(book_id)
            self.api_manager.associate_resources(user_id, book_id, self.book_info.get('xhtml'))
            self.api_manager.delete_existing_browse_terms_for_artifact(book_id)
            traceback = {}
            traceback['taskID'] = taskID
            traceback['info'] = '%s (%s)'%(1, self.book_info['title'])
            self.build_browse_term_csv(book_id, self.book_info['keyword_list'], 'tag', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['grade_list'], 'grade level', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['state'], 'state', None, traceback=traceback)
            self.build_browse_term_csv(book_id, self.book_info['subjects'], 'subject', None, traceback=traceback)
            if self.book_info.has_key('level'):
                self.build_browse_term_csv(book_id, self.book_info['level'], 'level', None, traceback=traceback)
            for each in self.book_info['categories']:
                self.build_browse_term_category_csv(book_id, each['category_name'],'domain',each['category_parent'],each['category_child'],traceback=traceback)

        self.api_manager.bulk_upload_browse_terms(user_id, self.browse_term_csv_path, toCache, toWait=toWait)
        if toCache:
            self.api_manager.reindex_artifacts(self.all_artifact_ids, user_id)
        if book_id:
            self.log.info("Book Imported successfully, ID: %s from [%s]" % (str(book_id), self.wikiurl))
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
        self.log.info('book_type: [%s]' %(book_info['book_type']))
        if 'teacher' in book_info['book_type'].lower():
            book_info['book_type'] = 'tebook'
        elif 'quiz' in book_info['book_type'].lower():
            book_info['book_type'] = 'quizbook'
        else:
            book_info['book_type'] = 'book'

        book_info['keyword_list'] = self.get_value_list(book_node, 'property:Keyword')
        book_info['grade_list'] = self.parseGrades(self.get_value_list(book_node, 'property:Grade'))
        book_info['state'] = self.get_value_list(book_node, 'property:State')

        book_info['author_details'] = self.get_author_details(book_node)
        book_info['categories'] = self.get_categories(book_node)
        book_info['subjects'] = []
        book_info['level'] = []
        book_info['created'] = ''
        book_info['subjects'] = self.get_value_list(book_node, 'property:Subjects')
        book_info['keyword_list'] = [x.lower() for x in book_info['keyword_list']]
        book_info['subjects'] = [x.lower() for x in book_info['subjects']]
        subjectBrowseTerms = self.api_manager.getAllSubjectBrowseTerms()
        subjects = book_info['subjects'][:]
        for eachSubject in subjects:
            if eachSubject not in subjectBrowseTerms:
                book_info['keyword_list'].append(eachSubject)
                book_info['subjects'].remove(eachSubject)
        book_info['level'] = self.get_value_list(book_node, 'property:Difficulty')
        timeCreated = self.get_value_list(book_node, 'property:Created')
        if timeCreated:
            book_info['created'] = timeCreated[0]
        for cat in book_info['categories']:
            encode = cat.get('category_child', '')
            if encode.startswith('CKT.') and len(encode.split('.')) == 3:
                book_info['subjects'].append(cat.get('category_name'))

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

        self.log.info("Cover image for the book: %s" % book_info['cover_image'])

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
        #self.loadExternalCategories(book_info['title'])
        return book_info

    def getChapterSeparator(self):
        return '-::of::-'

    def fetch_chapter_info(self, chapter_node):
        chapter_info = {}

        # Explicit control of reindex and cache generation
        chapter_info['reindex'] = 'False'
        chapter_info['cache_math'] = 'True'

        try:
            chapter_info['ck12BookName'] = chapter_node.getAttribute('ck12BookName')
            chapter_info['ck12ChapterName'] = chapter_node.getAttribute('ck12ChapterName')
        except Exception as e:
            pass

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
        chapter_info['grade_list'] = self.get_value_list(chapter_node, 'property:Grade')
        chapter_info['state'] = self.get_value_list(chapter_node, 'property:State')
        chapter_info['created'] = ''
        timeCreated = self.get_value_list(chapter_node, 'property:Created')
        if timeCreated:
            chapter_info['created'] = timeCreated[0]

        chapter_info['author_details'] = self.get_author_details(chapter_node)
        chapter_info['categories'] = self.get_categories(chapter_node)
        chapter_info['subjects'] = []
        for cat in chapter_info['categories']:
            encode = cat.get('category_child', '')
            if encode.startswith('CKT.') and len(encode.split('.')) == 3:
                chapter_info['subjects'].append(cat.get('category_name'))
        chapter_info['subjects'].extend(self.get_value_list(chapter_node, 'property:Subjects'))

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

        subjectBrowseTerms = self.api_manager.getAllSubjectBrowseTerms()
        subjects = chapter_info['subjects'][:]
        for eachSubject in subjects:
            if eachSubject not in subjectBrowseTerms:
                chapter_info['keyword_list'].append(eachSubject)
                chapter_info['subjects'].remove(eachSubject)

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

    def split_sections(self, chapter_info):
        chapter_content = chapter_info['xhtml']
        section_title_obj = re.compile('(.*?)</h1>.*', re.DOTALL)
        h1_id_re = re.compile('<h1 id=(.*?)>',re.DOTALL)
        h1_ids = h1_id_re.findall(chapter_content)
        h1_ids.insert(0,'dummy')
        is_h1 = True
        sections = re.split('<h1.*?>',chapter_content.replace('</html>','').replace('</body>',''))
        if not len(sections) > 1:
            section_title_obj = re.compile('(.*?)</h2>.*', re.DOTALL)
            h2_id_re = re.compile('<h2 id=(.*?)>',re.DOTALL)
            h2_ids = h2_id_re.findall(chapter_content)
            h2_ids.insert(0,'dummy')
            sections = re.split('<h2.*?>',chapter_content.replace('</html>','').replace('</body>',''))
            is_h1 = False

        chapter_info['sections'] = []
        chapter_info['xhtml'] = self.get_content(settings.CHAPTER_SKELETON_FILE)
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('<lessons','<sections')
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('x-ck12-data-lesson','x-ck12-data-section')

        chapter_tail_subsections = self.get_from_config(self.content_splitter_guide, 'chapter_content', 'tail_subsections')
        if not chapter_tail_subsections:
            chapter_tail_subsections = settings.CHAPTER_TAIL_SUBSECTIONS

        section_title_changer = self.get_from_config(self.content_splitter_guide, 'lesson_content', 'title_changer')
        if not section_title_changer:
            section_title_changer = []
      
        chapter_content_obj = re.compile('.*<body>(.*)', re.DOTALL)
        if len(sections) > 1:
            try:
                chapter_content = chapter_content_obj.match(sections[0]).group(1).strip()
            except:
                chapter_content = ''
            for i in range(1, len(sections)):
                section_info = {}
                # Explicit control of reindex and cache generation
                section_info['reindex'] = 'False'
                section_info['cache_math'] = 'True'
                concept_info = {}
                section_content = sections[i]
                try:
                    tmpTitle = section_title_obj.match(section_content).group(1).strip()
                    section_info['title'] = self.__decode_html_entities(tmpTitle)
                    if section_info['title'] is None:
                        raise Exception((_(u'Error getting section title. Got None! Check raw title for invalid characters: [%(tmpTitle)s]')  % {"tmpTitle":tmpTitle}).encode("utf-8"))
                except Exception as e:
                    self.log.error('Lesson Title Exception: %s'%(e.__str__()), exc_info=e)
                    section_info['title'] = ''
                if not section_info['title'].strip():
                    if is_h1:
                        section_content = re.sub('.*?</h1>','',section_content)
                    else:
                        section_content = re.sub('.*?</h2>','',section_content)
                    if section_content.strip():
                        if chapter_info['sections']:
                            prev_section_info = chapter_info['sections'][len(chapter_info['sections']) - 1]
                            prev_section_info['xhtml'] =  '%s%s' % (prev_section_info['xhtml'], section_content)
                        else:
                            chapter_content = '%s%s' % (chapter_content, section_content)
                    continue                         
                section_info['old_title'] = section_info['title']
                if is_h1:
                    section_info['xhtml'] = '<h1 id=%s>'%h1_ids[i]+ section_content
                    title_re = re.compile('.*?(<h1.*?>.*?</h1>).*',re.DOTALL)
                else:
                    section_info['xhtml'] = '<h2 id=%s>'%h2_ids[i]+ section_content
                    title_re = re.compile('.*?(<h2.*?>.*?</h2>).*',re.DOTALL)
                #Removing title from section html
                try:
                    section_info['xhtml'] = section_info['xhtml'].replace(title_re.findall(section_info['xhtml'])[0],'')
                except Exception as e:
                    self.log.info("Couldn't remove h1 title from concept html, Reason: %s"%e.__str__())
                if [s.lower().strip() for s in chapter_tail_subsections].__contains__(section_info['title'].lower()):
                    chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_TAIL_SUBSECTIONS%',section_info['xhtml']+"%CHAP_TAIL_SUBSECTIONS%")
                    continue

                section_info['desc'] = ''#self.get_first_para_text(section_info['xhtml'])
                section_info['cover_image'] = self.get_first_img_info(section_info['xhtml'])
                # Passing metadata of chapter to section
                section_info['keyword_list'] = []
                section_info['grade_list'] = []
                section_info['state'] = []
                section_info['categories'] = []
                section_info['keyword_list'].extend(chapter_info['keyword_list'])
                section_info['grade_list'].extend(chapter_info['grade_list'])
                section_info['state'].extend(chapter_info['state'])
                section_info['categories'].extend(chapter_info['categories'])
                section_info['subjects'] = chapter_info['subjects'][:]
                if chapter_info.has_key('created'):
                    section_info['created'] = chapter_info['created']
                #extCat = self.getExternalCategories(section_info['title'], chapter_info['title'])
                #if extCat:
                #    section_info['categories'].append(extCat)
                #    section_info['encoded_id'] = '%s.L.1' % extCat['category_name']
                #self.log.info("Got categories for section: %s and encoded_id: %s" % (str(section_info['categories']), section_info.get('encoded_id')))

                duplicated_file_path = self.make_duplicate(section_info['cover_image'])
                #if duplicated_file_path != None:
                section_info['cover_image'] = duplicated_file_path
                chapter_info['sections'].append(section_info)
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_CONT%',chapter_content)
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_TAIL_SUBSECTIONS%','')
        return chapter_info


    def split_lessons(self, chapter_info, import_drill_mode):

        chapter_content = chapter_info['xhtml']
        lesson_title_obj = re.compile('(.*?)</h1>.*', re.DOTALL)
        h1_id_re = re.compile('<h1 id=(.*?)>',re.DOTALL)
        h1_ids = h1_id_re.findall(chapter_content)
        h1_ids.insert(0,'dummy')
        lessons = re.split('<h1.*?>',chapter_content.replace('</html>','').replace('</body>',''))
        chapter_info['lessons'] = []
        chapter_info['xhtml'] = self.get_content(settings.CHAPTER_SKELETON_FILE)

        chapter_tail_subsections = self.get_from_config(self.content_splitter_guide, 'chapter_content', 'tail_subsections')
        if not chapter_tail_subsections:
            chapter_tail_subsections = settings.CHAPTER_TAIL_SUBSECTIONS

        lesson_title_changer = self.get_from_config(self.content_splitter_guide, 'lesson_content', 'title_changer')
        if not lesson_title_changer:
            lesson_title_changer = []
      
        chapter_content_obj = re.compile('.*<body>(.*)', re.DOTALL)
        if len(lessons) > 1:
            try:
                chapter_content = chapter_content_obj.match(lessons[0]).group(1).strip()
            except:
                chapter_content = ''
            for i in range(1, len(lessons)):
                lesson_info = {}
                # Explicit control of reindex and cache generation
                lesson_info['reindex'] = 'False'
                lesson_info['cache_math'] = 'True'
                concept_info = {}
                lesson_content = lessons[i]
                try:
                    tmpTitle = lesson_title_obj.match(lesson_content).group(1).strip()
                    lesson_info['title'] = self.__decode_html_entities(tmpTitle)
                    if lesson_info['title'] is None:
                        raise Exception((_(u'Error getting lesson title. Got None! Check raw title for invalid characters: [%(tmpTitle)s]')  % {"tmpTitle":tmpTitle}).encode("utf-8"))
                except Exception as e:
                    self.log.error('Lesson Title Exception: %s'%(e.__str__()), exc_info=e)
                    lesson_info['title'] = ''
                if not lesson_info['title'].strip():
                    continue                         
                lesson_info['old_title'] = lesson_info['title']
                lesson_info['xhtml'] = '<h1 id=%s>'%h1_ids[i]+ lesson_content
                if [s.lower().strip() for s in chapter_tail_subsections].__contains__(lesson_info['title'].lower()):
                    chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_TAIL_SUBSECTIONS%',lesson_info['xhtml']+"%CHAP_TAIL_SUBSECTIONS%")
                    continue
                if [s.lower().strip() for s in lesson_title_changer].__contains__(lesson_info['title'].lower()):
                    lesson_info['old_title'] = lesson_info['title']
                    lesson_info['title'] = "%s - %s" % (lesson_info['old_title'], chapter_info['title'])

                lesson_info['desc'] = ''#self.get_first_para_text(lesson_info['xhtml'])
                lesson_info['cover_image'] = self.get_first_img_info(lesson_info['xhtml'])
                # Passing metadata of chapter to lesson
                lesson_info['keyword_list'] = []
                lesson_info['grade_list'] = []
                lesson_info['state'] = []
                lesson_info['categories'] = []
                lesson_info['keyword_list'].extend(chapter_info['keyword_list'])
                lesson_info['grade_list'].extend(chapter_info['grade_list'])
                lesson_info['state'].extend(chapter_info['state'])
                lesson_info['subjects'] = chapter_info.get('subjects', '')[:]
                #lesson_info['categories'].extend(chapter_info['categories'])
                extCat = self.getExternalCategories(lesson_info['title'], chapter_info['title'])
                if extCat:
                    lesson_info['categories'].append(extCat)
                    lesson_info['encoded_id'] = '%s.L.1' % extCat['category_name']
                ## Get external categories for all headings
                sectionRegex = re.compile(r'<h[0-9]\s[^<>]*>\s*(.*)\s*</h[0-9]>', re.MULTILINE)
                for m in sectionRegex.finditer(lesson_info['xhtml']):
                    if m:
                        extCat = self.getExternalCategories(m.group(1).strip(), chapter_info['title'])
                        if extCat:
                            lesson_info['categories'].append(extCat)
                self.log.info("Got categories for lesson: %s and encoded_id: %s" % (str(lesson_info['categories']), lesson_info.get('encoded_id')))

                duplicated_file_path = self.make_duplicate(lesson_info['cover_image'])
                #if duplicated_file_path != None:
                lesson_info['cover_image'] = duplicated_file_path
                lesson_info['concepts'] = []
                if import_drill_mode == 'concept':
                    lesson_info,concept_info = self.build_concept(lesson_info)
                    lesson_info['concepts'].append(concept_info)
                chapter_info['lessons'].append(lesson_info)
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_CONT%',chapter_content)
        chapter_info['xhtml'] = chapter_info['xhtml'].replace('%CHAP_TAIL_SUBSECTIONS%','')
        return chapter_info

    def get_from_config(self, config_file, section, key):
        value = None
        try:
            if config_file:
                config = ConfigParser.RawConfigParser()
                config.read(config_file)
            else:
                return value
        except Exception as e:
            self.log.info("Couldn't read config file: %s"%config_file)

        try:
            value = eval(config.get(section, key))
        except Exception as e:
            self.log.info("Not found: section: %s, key: %s" % (section, key))
        return value
   
    def loadExternalCategories(self, book_title):
        """
            Get domain terms from external CSV file - the expected structure of the file is:
                subject | branch | book | chapter | Encode ID | Level 1 | Level 2 | Level 3 
            The book column contains the book title, the chapter column has the chapter title,
            and the level columns have titles for lessons or concepts
        """
        self.log.info("Looking for external categories for book: %s" % book_title)
        encodeDir = settings.EXTERNAL_DOMAIN_TERM_ASSOCIATIONS_DIR
        bookHandle = title2Handle(book_title)
        encodeFile = None
        if os.path.exists(encodeDir):
            for file in os.listdir(encodeDir):
                if file.endswith('.csv') and bookHandle.lower() in file.lower():
                    encodeFile = os.path.join(encodeDir, file)
                    break

        if encodeFile:
            self.log.info("Processing external encodes from :%s" % encodeFile)
            csvIn = UnicodeDictReader(open(encodeFile, mode='rb'))
            for row in csvIn:
                for l in range(1, 5):
                    level = 'Level %d' % l
                    concept = row.get(level)
                    if concept:
                        chapter = row.get('chapter')
                        key = u'%s|%s' % (chapter, concept)
                        self.externalEncodes[key] = row.get('Encode ID')
                        break
            #self.log.info("The external encode dict: %s" % str(self.externalEncodes))
        else:
            self.log.warn('No csv file for the book: %s' % book_title)

    def getExternalCategories(self, lesson_title, chapter_title):
        """
            Look up the external encoding for this lesson or concept and chapter
        """
        key = u'%s|%s' % (chapter_title, lesson_title)
        cat = self.externalEncodes.get(key)
        if cat:
            return { 'category_name': cat.upper(), 'category_parent': '', 'category_child': '' }
        self.log.warn("Could not find external category for [%s]" % key)
        return {}

    def build_concept(self, lesson_info):
        concept_info = {}
        # Explicit control of reindex and cache generation
        concept_info['reindex'] = 'False'
        concept_info['cache_math'] = 'True'
        concept_info['title'] = lesson_info['title']
        concept_info['handle'] = lesson_info.get('handle')
        concept_info['old_title'] = lesson_info['old_title']
        concept_info['cover_image'] = lesson_info['cover_image']
        concept_info['desc'] = lesson_info['desc']
        concept_info['xhtml'] = lesson_info['xhtml']

        # Passing metadata of lesson to concept
        concept_info['keyword_list'] = []
        concept_info['grade_list'] = []
        concept_info['state'] = []
        concept_info['categories'] = []
        concept_info['keyword_list'].extend(lesson_info['keyword_list'])
        concept_info['grade_list'].extend(lesson_info['grade_list'])
        concept_info['state'].extend(lesson_info['state'])
        concept_info['categories'].extend(lesson_info['categories'])
        concept_info['subjects'] = lesson_info['subjects'][:]
        concept_info['encoded_id'] = lesson_info['encoded_id'].replace('.L.1', '.C.1') if lesson_info.get('encoded_id') else None
        self.log.info("Concept categories for %s :%s encodedID: %s" % (concept_info['title'], str(concept_info['categories']), concept_info['encoded_id']))

        actual_lesson_xhtml = lesson_info['xhtml']
        lesson_info['xhtml'] = h.LESSON_SKELETON
        # Problem set content replacing
        lesson_head_subsections = self.get_from_config(self.content_splitter_guide, 'lesson_content', 'head_subsections')
        if not lesson_head_subsections:
            lesson_head_subsections = settings.LESSON_HEAD_SUBSECTIONS
        lesson_tail_subsections = self.get_from_config(self.content_splitter_guide, 'lesson_content', 'tail_subsections')
        if not lesson_tail_subsections:
            lesson_tail_subsections = settings.LESSON_TAIL_SUBSECTIONS

        h2_id_re = re.compile('<h2 id=(.*?)>',re.DOTALL)
        h2_ids = h2_id_re.findall(actual_lesson_xhtml)
        h2_ids.insert(0,'dummy')
        subsections = re.split('<h2.*?>',actual_lesson_xhtml)
        subsection_title_obj = re.compile('(.*?)</h2>.*', re.DOTALL)
        subsection_count = 0
        for i in range(len(subsections)):
            try:
                each_subsection = subsections[i]
                subsection_title = subsection_title_obj.match(each_subsection).group(1).strip()
                subsection_title = self.__decode_html_entities(subsection_title)
                if not subsection_title.strip():
                    continue                         
                if [s.lower().strip() for s in lesson_head_subsections].__contains__(subsection_title.lower()):
                    subsection_content = '<h2 id=%s>%s'% (h2_ids[i],subsections[subsection_count])
                    lesson_info['xhtml'] = lesson_info['xhtml'].replace('%LHS%',subsection_content+'%LHS%')
                    concept_info['xhtml'] = concept_info['xhtml'].replace(subsection_content,'')
                    subsection_count = subsection_count + 1
                    continue
                if [s.lower().strip() for s in lesson_tail_subsections].__contains__(subsection_title.lower()):
                    subsection_content = '<h2 id=%s>%s'% (h2_ids[i],subsections[subsection_count])
                    lesson_info['xhtml'] = lesson_info['xhtml'].replace('%LTS%',subsection_content+'%LTS%')
                    concept_info['xhtml'] = concept_info['xhtml'].replace(subsection_content,'')
            except Exception as e:
                self.log.error('No title found for a subsection: %s'%str(e.__str__()))
            subsection_count = subsection_count + 1
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%LTS%','')
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%LHS%','')
        #lesson_info['xhtml'] = lesson_info['xhtml'].replace('%KT%', '')

        #Removing h1 title from concept html
        try:
            h1_title_re = re.compile('.*?(<h1.*?>.*?</h1>).*',re.DOTALL)
            concept_info['xhtml'] = concept_info['xhtml'].replace(h1_title_re.findall(concept_info['xhtml'])[0],'')
        except Exception as e:
            self.log.info("Couldn't remove h1 title from concept html, Reason:%s"%e.__str__())
        
        return lesson_info, concept_info

    def build_lesson_xhtml(self, lesson_info):
        # Concept ID and revision replacing
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_ID%',str(lesson_info['concept_id']))
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_REV%',str(lesson_info['concept_rev']))
        return lesson_info

    def process_images(self, working_dir, user_id):
        self.log.info("Getting into images section 1")
        self.user_id = user_id

        chapter_docbooks = []
        for root, dirnames, filenames in os.walk(working_dir):
            chapter_docbooks.extend(glob.glob(root + '/*.xhtml'))
        #chapter_docbooks = os.walk(working_dir).next()[2]
        self.log.info(chapter_docbooks)
        chapter_docbooks.sort()
        if not chapter_docbooks == []:
            for each in chapter_docbooks:
                self.log.info(each)
                self.log.info (" Converting " + each + " to tidied xhtml..")
                file_path = working_dir + "/" + each
                file_path = each
                f = codecs.open(file_path,"r",encoding="utf-8")
                self.buffer = f.read()
                f.close()
                self.buffer = h.transform_to_xhtml(self.buffer, addIDs=False)
                self.log.info("Buffer after tidy: %d" % len(self.buffer))
                #self.log.debug("Errors running tidy: %s" % str(errors))

                xhtml_write_path = codecs.open(os.path.splitext(file_path)[0] + ".xhtml", "w", encoding="utf-8")
                try:
                    self.buffer = self.process_external_images(working_dir, self.buffer)
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
                xhtml_write_path.write(self.buffer)
                f.close()
                xhtml_write_path.close()
        try:
            ff = open("%s/%s"%(working_dir, settings.IMG_PATH_MAPPER_FILE), 'w')
            ff.write(jsonlib.dumps(self.all_image_paths))
            ff.close()
        except Exception as e:
            self.log.error("IMG Mapper writer: "+ str(e))

    tagExp = re.compile(r'<.*?>')
    def __decode_html_entities(self, string):
        soup = BeautifulStoneSoup(string, convertEntities=BeautifulStoneSoup.HTML_ENTITIES)
        s = unicode(soup) if soup else None
        if s:
            s = self.tagExp.sub(u'', s)
        return s


if __name__ == "__main__":
    wiki_importer = WikiImporter()
    user_id = "1"
    importer_res = wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/SAT_Prep_FlexBook_%28Questions_and_Answer_Key%29', user_id)
    logger = logging.getLogger(__name__)
    logger.setLevel(log_level)
    wiki_importer.process_and_import_content(importer_res['working_dir'], importer_res['user_id'], 'concept')
    #wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/CK-12_Biology', user_id)
