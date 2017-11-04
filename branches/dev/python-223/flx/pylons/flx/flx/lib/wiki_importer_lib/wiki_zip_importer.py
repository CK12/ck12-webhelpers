'''This is the wiki importer for loading data from wiki zip files.
from pylons.i18n.translation import _
'''
import os, re, jsonlib
import codecs

import logging
import shutil
from datetime import datetime
from urllib import quote

import settings
from wiki_importer_2_0 import WikiImporter as WikiImporterBase
from flx.lib import helpers as h
from flx.model import api
#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
from flx.model import model as m
from BeautifulSoup import BeautifulSoup
import json
#logging.basicConfig(filename=settings.LOG_FILENAME)
import urllib2
PREFIX = "flx"
FLX_PREFIX = settings.FLX_PREFIX

#Don't Process Book Front Matter, Back Matter and Epub license files
EXCLUDE_CHAPTERS_LIST = ['CK-12 License', 'Front Matter', 'Foreword', 'Preface', 'Dedication', 'Back Matter']
BOOK_TITLE_FILE_NAME = 'title.html'
BOOK_TOC_FILE_NAME = 'toc.html'
EPUB_LICENCE_FILE_NAME = 'ck12_epub_licence.html'
BOOK_AUTHOR_ATTRIBUTION_FILE_NAME = 'ck12_author_attribution.html'
EXCLUDE_CHAPTERS_LIST_BY_FILE_NAME = [EPUB_LICENCE_FILE_NAME, '1.html', '2.html', '3.html', '4.html']

EXCLUDE_CHAPTERS_BY_FILE_TITLE_LIST = [BOOK_TITLE_FILE_NAME, BOOK_TOC_FILE_NAME, EPUB_LICENCE_FILE_NAME, BOOK_AUTHOR_ATTRIBUTION_FILE_NAME]
AUTHORS_ATTRIBUTION_MAP = {'contributors' : 'contributor',
                           'authors' : 'author',
                           'editors' : 'editor',
                           'sources' : 'source',
                           'translated by' : 'translator'
                           }

class WikiImporter(WikiImporterBase):

    def __init__(self):
        WikiImporterBase.__init__(self)
        self.log = logging.getLogger(__name__)
        #self.log.setLevel(log_level)
        #self.log.info("Initializing WikiImporter object")
        self.working_dir = ''
        self.buffer = ''
        self.ALLOWED_TYPES_FOR_DOMAINS = settings.ALLOWED_TYPES_FOR_DOMAINS
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
        self.EO_IFRAME_CONTENT = """
            <!-- @@author="" -->
            <!-- @@license="" -->
            <!-- @@embeddable="" -->
            """
   
    def import_from_wiki(self, _wikiurl, user_id, workdir=None, is_metadata_mode=False):
        #importer_response = WikiImporterBase.import_from_wiki(self, _wikiurl, user_id, workdir=workdir, is_metadata_mode=is_metadata_mode, hasZipFile=True)
        importer_response = {}
        files = os.walk(workdir).next()[2]
        zipFilePath = None
        success = True
        if not files == []:
            for each in files:
                if each.lower().endswith('.zip'):
                    zipFilePath = workdir + each
                    break
        self.log.info('Zip File Path: [%s]' %(zipFilePath))
        if zipFilePath:
            from zipfile import ZipFile

            zf = ZipFile(zipFilePath)
            try:
                #for f in zf.namelist():
                #    if f.endswith('/'):
                #        new_work_dir = workdir + f
                #        break
                ZipFile.extractall(zf, workdir)
                new_work_dir = os.walk(workdir).next()[1][0]
                importer_response['working_dir'] = workdir + new_work_dir
                self.log.info('new working dir: [%s]' %(importer_response['working_dir']))
                success = True
            except Exception as ex:
                self.log.error("Error Extracting zip contents : %s" % ex)
                success = False
            finally:
                zf.close()
        else:
            success = False
        importer_response['success'] = success
        importer_response['user_id'] = user_id
        importer_response['metadata_mode'] = str(self.is_metadata_mode)
        importer_response['import_mode'] = 'concept'
        return importer_response

    def process_and_import_content(self, _working_dir, user_id,
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
        except Exception as ex:
            self.is_metadata_mode = False

        self.browse_term_csv_path = _working_dir + "/" + self.browse_term_csv_path
        self.state_standard_csv_path = _working_dir + "/" + self.state_standard_csv_path
        try:
            ff = open("%s/%s"%(_working_dir, settings.IMG_PATH_MAPPER_FILE), 'r')
            self.all_image_paths = jsonlib.read(ff.read())
            ff.close()
        except Exception as ex:
            self.all_image_paths = {}
        chapter_xhtmls = os.walk(_working_dir).next()[2]
        chapter_xhtmls.sort()
        if not chapter_xhtmls == []:
            for each in chapter_xhtmls:
                if each.lower().endswith('.html'):
                    file_path = _working_dir + "/" + each
                    f = open(file_path,"r")
                    self.buffer = f.read()
                    if self.buffer == False:
                        return
                file_path = _working_dir + "/" + each
                node_type = None
                if each.lower()in [BOOK_TOC_FILE_NAME]:
                    node_type = "toc"
                if each.lower() in [BOOK_TITLE_FILE_NAME]:
                    node_type = "book"
                if node_type:
                    self.fetch_all_info(file_path, import_drill_mode, node_type)
            #self.chapters_info = sorted(self.chapters_info, key=lambda k: k['xhtml_path'])
            self.log.info('Book::%s'%str(self.book_info))
            self.log.info('Chapters::%s'%str(self.chapters_info))

            return self.save_as_artifacts(user_id, toCache, taskID=taskID, toWait=toWait)

    def process_inline_tables_for_html(self, chapter_html, root_dir, chapter_file_name):
        chapter_nodes = BeautifulSoup(chapter_html)
        inline_tables = chapter_nodes.findAll("a", {"href": re.compile("table_\d-\d.html")})
        if inline_tables:
            for each_table_pointer in inline_tables:
                file_pointer = each_table_pointer.get("href")
                table_html = self.get_content(root_dir  + '/' + file_pointer)
                table_nodes = BeautifulSoup(table_html)
                table_container_div = table_nodes.find("body").find("div")
                table_container_div_id = table_container_div.get("id")
                div_temp = chapter_nodes.find("div", {'id' : table_container_div_id})
                if div_temp:
                    div_temp.replaceWith(table_container_div)
                    node_to_remove = chapter_nodes.find("a", {'href' : "%s#%s" % (chapter_file_name, table_container_div_id)})
                    if node_to_remove:
                        node_to_remove.findPrevious().extract()
                    chapter_html = str(chapter_nodes)
                """chapter_table_re = re.compile(r'%s'% chapter_table_regex, re.I|re.M|re.DOTALL)
                table_html = chapter_table_re.findall(chapter_html)
                if table_html:
                    #chapter_html = chapter_html.replace(table_html[0], new_table_html)
                    regex = re.compile(ur'%s'% table_html[0], re.I|re.M|re.DOTALL)
                    chapter_html = regex.sub(new_table_html, chapter_html)"""
        return chapter_html

    def replace_chapter_toc(self, book_html):
        toc_nodes = BeautifulSoup(book_html)
        li_items = toc_nodes.find("body").find("div").findAll("li")
        if li_items:
            for each_li in li_items:
                chapter_title = each_li.find("a").getText()
                chapter_src = each_li.find("a").get('href')
                if chapter_title in EXCLUDE_CHAPTERS_LIST or chapter_src in EXCLUDE_CHAPTERS_LIST_BY_FILE_NAME:
                    book_html = book_html.replace(h.safe_decode(str(each_li)), '')
        return book_html

    def fixHTMLEntities(self, text):
        for match in list(set(re.findall(r"(&{1}(?!amp)[\w|\d]+.;)", text))):
            text = text.replace(match, match.replace('.;',';.'))
        html_entities = re.findall(r"(&{1}(?!amp)[\w|\d]+;)", text)
        html_entities = list(set(html_entities))
        for entity in html_entities:
            text = text.replace(entity, h.safe_decode(str(BeautifulSoup(entity,convertEntities=BeautifulSoup.HTML_ENTITIES))))
        return text
    
    def fixHTMLCodes(self, text):
        for match in list(set(re.findall(r"(&#;&\d+;)", text))):
            text = text.replace(match, match.replace('&#;&','&#'))
        html_codes = re.findall(r"(&#\d+;)", text)
        html_codes = list(set(html_codes))
        for entity in html_codes:
            text = text.replace(entity, h.safe_decode(str(BeautifulSoup(entity,convertEntities=BeautifulSoup.HTML_ENTITIES))))
        return text

    def pre_process_xhtml(self, xhtml):
        """
            spanish translated zip contains some characters which fails artifact save due to rosetta
            validation error, clean up such data.
        """
        xhtml = re.sub(r"http%3%C3%81", "http%3A", xhtml)
        xhtml = re.sub("http%3&Aacute;", "http%3A", xhtml)
        invalid_ids = re.findall('id=".*?&Aacute;.*?"', xhtml)
        for invalid_id in invalid_ids:
            xhtml = xhtml.replace(invalid_id, invalid_id.replace("&Aacute;", "A"))
        xhtml = xhtml.replace("X-U&Aacute;-Compatible", "X-UA-Compatible")

        #add semi-colon(;) at the end of unicodes if not present
        malformed_unicodes = re.findall(r"(&#\d+(?![;|\d+]))", xhtml)
        for match in malformed_unicodes:
            xhtml = xhtml.replace(match, '%s;' % match)

        #if consecutive & then replace with &amp; 
        for match in list(set(re.findall("&{2,}", xhtml))):
            xhtml = xhtml.replace(match , "".join(['&amp;'] * len(match)))
        xhtml = re.sub(r'<dl id=".*?">', '<dl>', xhtml)
        xhtml = re.sub(r"(&#38;)", '&amp;', xhtml)

        xhtml = re.sub(r'(<li><a href="(ck12_epub_licence|1|2|3|4).html"(.*)</a></li>(.*)\n)', '',  xhtml)
        xhtml = self.fixHTMLEntities(xhtml)
        xhtml = self.fixHTMLCodes(xhtml)
        #Remove meta tags with charset attribute
        xhtml = re.sub(r"(<meta.*?charset=.*?>)",  "", xhtml)

        #Replace empty classes : eg : class=""
        xhtml = re.sub(r"\sclass=['\"]['\"]", "", xhtml)

        #remove class with attribute c1
        xhtml = re.sub(r"\sclass=['\"](?!x-ck12)(.*)['\"]","",  xhtml)
        
        #remove all classes if x-ck12 present
        all_classes = re.findall(r"\sclass=[\"'](.*?x-ck12.*?)[\"']",  xhtml)
        for cls in all_classes:
            ck12_class = re.findall(r"(x-ck12.*?)[\s\"]", cls)
            if ck12_class:
                xhtml = xhtml.replace(cls, ck12_class[0])
        return xhtml

    def get_chapter_info_from_toc(self, metadata_xml_file_path):
        base_dir = os.path.dirname(metadata_xml_file_path)
     
        self.is_new_metadata_format = True
        toc_html = self.get_content(metadata_xml_file_path)
        soup = BeautifulSoup(toc_html)
        chapter_li_items = soup.find('ul').findAll('li')
        chapter_file_name = None
        for each_li in chapter_li_items:
            href_link = each_li.find("a").get("href")
            chapter_title = each_li.find("a").getText()

            if chapter_title not in EXCLUDE_CHAPTERS_LIST or href_link not in EXCLUDE_CHAPTERS_LIST_BY_FILE_NAME:
                if href_link and not "#" in str(href_link):
                    chapter_file_name = href_link
                    chapter_html = self.get_content(base_dir  + '/' + chapter_file_name)
                    #replace single & follow by space with &amp
                    chapter_html = re.sub(r"(\s&\s)", " &amp; ", chapter_html)
                    chapter_html = self.process_inline_tables_for_html(chapter_html, base_dir, chapter_file_name)
                    chapter_nodes = BeautifulSoup(chapter_html)
                    chapter_info = self.fetch_chapter_info(chapter_nodes)
                    chapter_info['children'] = []
                    if not self.is_metadata_mode:
                        chapter_xhtml = self.build_chapter_xhtml(''.join([h.safe_decode(str(nodes)) for nodes in chapter_nodes.findAll("div", 'x-ck12-data')]))
                        chapter_info["xhtml"] = chapter_xhtml

                        chapter_info['type'] = 'chapter'
                        chapter_info['bookTitle'] = self.book_info['title']
                        #chapter_info['xhtml'] = self.get_content(chapter_info['xhtml_path'])
                        self.chapters_info.append(chapter_info)
                        self.book_info['children'].append(chapter_info)

                #if anchor tag points to specific lesson from the dom
                elif href_link:
                    #write logic to process lessons from chapter
                    if '#' in str(href_link) and href_link.split("#")[0] == chapter_file_name:
                        lesson_id = href_link.split('#')[1]
                        lesson_start_node = chapter_nodes.findAll("h1", {'id':lesson_id})[0]
                        lesson_previous_node = lesson_start_node.findAllPrevious('p', text=re.compile(r'(.*?)Begin inserted XHTML \[LESSON:(.*?)'))
                        concept_start_node = None
                        concept_end_node = None
                        lesson_end_node = None
                        if lesson_previous_node:
                            lesson_previous_node = lesson_previous_node[0]
                            lesson_end_node_identifier = lesson_previous_node.split('[')[1]
                            end_nodes = lesson_start_node.findAllNext('p', text=re.compile(r'(.*?)inserted XHTML \[(.*?)'))
                            for end_node in end_nodes:
                                if "Begin inserted XHTML [CONCEPT:" in h.safe_decode(str(end_node)):
                                    concept_start_node = end_node
                                    continue
                                if "End inserted XHTML [CONCEPT:" in h.safe_decode(str(end_node)):
                                    concept_end_node = end_node
                                    continue
                                if lesson_end_node_identifier in h.safe_decode(str(end_node)):
                                    lesson_end_node = end_node
                                    break
                            if not lesson_end_node:
                                lesson_end_node = end_nodes[2]
                            if concept_end_node and concept_start_node:
                                concept_regex = '%s(.*?)%s' % (str(concept_start_node), str(concept_end_node))
                                concept_html_re = re.compile(r'%s'% concept_regex.replace('[', '\[').replace(']','\]'), re.I|re.M|re.DOTALL)
                                concept_html = concept_html_re.findall(chapter_html)
                                if concept_html:
                                    old_concept_html = concept_html[0]
                                    concept_html = "%s%s%s" %("<div class='x-ck12-data-concept'>", concept_html[0], '</div>')
                                    chapter_html = chapter_html.replace(old_concept_html, concept_html)

                            lesson_regex = '%s(.*?)%s' % (h.safe_decode(str(lesson_previous_node)), h.safe_decode(str(lesson_end_node)))
                            lesson_html_re = re.compile(r'%s'% lesson_regex.replace('[', '\[').replace(']','\]'), re.I|re.M|re.DOTALL)
                            lesson_html = lesson_html_re.findall(chapter_html)
                            if lesson_html:
                                lesson_html = lesson_html[0]
                                lesson_html = BeautifulSoup(lesson_html)

                            lesson_info = self.fetch_lesson_info(lesson_html, lesson_id)
                            lesson_info['children'] = []
                            lesson_info['xhtml'] = h.safe_decode(str(lesson_html))
                            lesson_info,concept_info = self.build_concept(lesson_id, lesson_info)
                            concept_info['type'] = 'concept'
                            concept_info['children'] = []
                            concept_info['bookTitle'] = self.book_info['title']
                            parent_chapter = self.book_info['children'][-1:][0]
                            lesson_info['parent_title'] = parent_chapter['title']
                            lesson_info['parent_type'] = 'chapter'
                            concept_info['parent_type'] = 'lesson'
                            concept_info['parent_title'] = lesson_info['title']
                            lesson_info['type'] = 'lesson'
                            if self.api_manager.is_duplicate_title(self.user_id, lesson_info, 'lesson') and not self.api_manager.is_duplicate_artifact(self.user_id, lesson_info, 'lesson'):
                                lesson_info['old_title'] = lesson_info['title']
                                lesson_info['title'] = "%s%s%s%s%s" % (lesson_info['old_title'], m.getChapterSeparator(), lesson_info['title'], m.getChapterSeparator(), self.book_info['title'])
                                lesson_info['handle'] = m.title2Handle(lesson_info['title'])
                                concept_info['parent_title'] = lesson_info['title']
                                self.log.info("Changed duplicate lesson title from: [%s] to [%s] handle:[%s]" % (lesson_info['old_title'], lesson_info['title'], lesson_info.get('handle')))

                            if self.api_manager.is_duplicate_title(self.user_id, concept_info, 'concept') and not self.api_manager.is_duplicate_artifact(self.user_id, concept_info, 'concept'):
                                concept_info['old_title'] = concept_info['title']
                                concept_info['title'] = "%s%s%s%s%s" % (concept_info['old_title'], m.getChapterSeparator(), concept_info['title'], m.getChapterSeparator(), self.book_info['title'])
                                concept_info['handle'] = m.title2Handle(concept_info['title'])
                                self.log.info("Changed duplicate concept title from: [%s] to [%s] handle:[%s]" % (concept_info['old_title'], concept_info['title'], concept_info.get('handle')))

                            lesson_info['children'].append(concept_info)
                            lesson_info['bookTitle'] = self.book_info['title']
                            self.lessons_info.append(lesson_info)
                            parent_chapter['children'].append(lesson_info)
                            self.lessons_info.append(lesson_info)
                            self.chapters_info.append(parent_chapter)

    def fetch_all_info(self, metadata_xml_file_path, import_drill_mode, node_type='chapter'):
        metadata_html = self.get_content(metadata_xml_file_path)
        metadata_nodes = BeautifulSoup(metadata_html)

        base_dir = os.path.dirname(metadata_xml_file_path)

        #for each in head.childNodes:
        self.is_new_metadata_format = True
            #try:
            #    self.is_new_metadata_format = self.deduce_metadata_format(each)
            #except Exception as e:
            #    self.is_new_metadata_format = False
        if node_type.lower() == 'book':
            self.book_info = self.fetch_book_info(metadata_nodes, base_dir)
            book_xml_path = base_dir + '/' + BOOK_TOC_FILE_NAME
            book_xhtml_path = base_dir + '/' + BOOK_TOC_FILE_NAME
            self.book_info['xml_path'] = book_xml_path
            self.book_info['xhtml_path'] = book_xhtml_path
            self.book_info['xhtml'] = self.get_content(self.book_info['xhtml_path'])
            self.book_info['xhtml'] = self.replace_chapter_toc(self.book_info['xhtml'])
            self.book_info['children'] = []
            self.book_info['type'] = 'book'
        if node_type.lower() == 'toc':
            self.get_chapter_info_from_toc(metadata_xml_file_path)

    def get_book_author_details(self, root_dir):
        author_details_list = []
        try:
            attribution_file = "%s/%s" % (root_dir, BOOK_AUTHOR_ATTRIBUTION_FILE_NAME)
            if os.path.exists(attribution_file):
                attribution_html = self.get_content(attribution_file)
                attribution_nodes = BeautifulSoup(attribution_html)
                for attribution in attribution_nodes.findAll('strong'):
                    author_details = {}
                    author_details['type'] = attribution.getText().strip()
                    author_details['readable_name'] = attribution.findPrevious('p').getText().strip()
                    author_details['givenName'] = author_details['readable_name']
                    if author_details['type'].lower() in AUTHORS_ATTRIBUTION_MAP.keys():
                        author_details['type'] = AUTHORS_ATTRIBUTION_MAP[author_details['type'].lower()]
                        author_details_list.append(author_details)
                    else:
                        self.log.info("Invalid author attribution [%s], ignoring" % author_details['type'])
        except Exception as ex:
            pass
        self.log.info('AUTHORSLIST FOUND: %s' % author_details_list)
        return author_details_list

    def fetch_book_info(self, book_node, root_dir):
        book_info = {}

        # Explicit control of reindex and cache generation
        book_info['reindex'] = 'False'
        book_info['cache_math'] = 'True'

        try:
            title = book_node.find('title').getText().strip()
            title = re.sub(r"^\d+.\d+\s+",'',  title)
            book_info['title'] = title
            #(book_node.getElementsByTagName('title')[0].firstChild.data).strip()
        except Exception as ex:
            self.log.info("fetch_book_info: Error getting title for book")
            self.log.info(ex)
            book_info['title'] = ''

        #try:
        #    book_info['desc'] = book_node.getElementsByTagName('property:About_book')[0].firstChild.data
        #except:
        #    book_info['desc'] = ''

        book_info['book_type'] = 'book'
        book_info['handle'] = m.title2Handle(book_info['title'])
        #try:
        #    book_info['book_type'] = book_node.getElementsByTagName('property:Book_type')[0].firstChild.data
        #except:
        #    pass
        ## Check if the book is a teacher edition
        if 'teacher' in book_info['book_type'].lower():
            book_info['book_type'] = 'tebook'
        elif 'quiz' in book_info['book_type'].lower():
            book_info['book_type'] = 'quizbook'
        else:
            book_info['book_type'] = 'book'

        #book_info['keyword_list'] = self.get_value_list(book_node, 'property:Keyword')
        #book_info['grade_list'] = self.parseGrades(self.get_value_list(book_node, 'property:Grade'))
        #book_info['state'] = self.get_value_list(book_node, 'property:State')
        #book_info['subjects'] = []

        #book_info['author_details'] = self.get_author_details(book_node)
        #book_info['categories'] = self.get_categories(book_node)
       
        try:
            cover_img_relative_path = (book_node.find('body').findAll('div')[0]).find('img').get('src')

            if cover_img_relative_path:
                book_info['cover_image_url'] = "%s/%s" % (root_dir, cover_img_relative_path)
                book_info['cover_image'] = "%s/%s" % (root_dir, cover_img_relative_path)
        except:
            book_info['cover_image'] = None

        #category_list = book_node.getElementsByTagName('property:Category_Node_2')
        #category_list.extend(book_node.getElementsByTagName('property:Category_Node'))
        book_category = None
        #try:
        #    for each in category_list:
        #        if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
        #            book_category = each.childNodes[1].childNodes[5].childNodes[0].data
        #            break
        #except:
        #    book_category = None

        #Skipped authors information from zip importer, instead do from copy_book_metadata script 
        book_info['author_details'] = []#self.get_book_author_details(root_dir)
        book_info['book_category'] = book_category
        book_info['keyword_list'] = []
        book_info['grade_list'] = []
        book_info['state'] = []
        book_info['subjects'] = []
        book_info['categories'] = []
        book_info['level'] = []
        book_info['encoded_id'] = None
        book_info['shortened_encoded_id'] = None
        return book_info

    def fetch_chapter_info(self, chapter_node):
        chapter_info = {}

        # Explicit control of reindex and cache generation
        chapter_info['reindex'] = 'False'
        chapter_info['cache_math'] = 'True'

        try:
            title = chapter_node.find('title').getText().strip()
            head_tags = chapter_node.findAll('h1')
            for h_tag in head_tags:
                if h_tag["id"].endswith("-chapter"):
                    title = h_tag.getText().strip()
                    break
            title = re.sub(r"^\d+.\d+\s+",'',  title)
            chapter_info['title'] = title
        except Exception as ex:
            self.log.info("fetch_chapter_info: Error getting title for chapter")
            self.log.info(ex)
            chapter_info['title'] = ''
 
        chapter_info['handle'] = m.title2Handle(chapter_info['title'])
        #try:
        #    if chapter_info['title'].strip() == '':
        #        chapter_info['title'] = os.path.basename(chapter_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        #except Exception as e:
        #    chapter_info['title'] = ''

        try:
            chapter_info['desc'] = chapter_node.getElementsByTagName('property:About_chapter')[0].firstChild.data
        except Exception as ex:
            chapter_info['desc'] = ''

        #chapter_info['keyword_list'] = self.get_value_list(chapter_node, 'property:Keyword')
        #chapter_info['grade_list'] = self.parseGrades(self.get_value_list(chapter_node, 'property:Grade'))
        #chapter_info['state'] = self.get_value_list(chapter_node, 'property:State')
        #chapter_info['subjects'] = []

        #chapter_info['author_details'] = self.get_author_details(chapter_node)
        #chapter_info['categories'] = self.get_categories(chapter_node)
        #try:
        #    cover_image_resolver =  chapter_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
        #    subjects = chapter_node.getElementsByTagName('swivt:Subject')
        #    chapter_info['cover_image'] = None
 
        #    for each in subjects:
        #        if each.getAttribute('rdf:about') == cover_image_resolver:
        #            cover_image_url = each.getElementsByTagName('rdfs:label')[0].childNodes[0].data.strip().replace(' ','_')
        #            chapter_info['cover_image'] = self.downloadImage(cover_image_url)
        #            break
        #except:
        #    chapter_info['cover_image'] = None

        #category_list = chapter_node.getElementsByTagName('property:Category_Node_2')
        #category_list.extend(chapter_node.getElementsByTagName('property:Category_Node'))
        #chapter_category = None
        #try:
        #    for each in category_list:
        #        if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
        #            chapter_category = each.childNodes[1].childNodes[5].childNodes[0].data
        #            break
        #except:
        #    chapter_category = None

        #chapter_info['chapter_category'] = chapter_category

        chapter_info['author_details'] = []
        chapter_info['keyword_list'] = []
        chapter_info['grade_list'] = []
        chapter_info['state'] = []
        chapter_info['subjects'] = []
        chapter_info['categories'] = []
        chapter_info['level'] = []
        chapter_info['cover_image'] = None
        chapter_info['encoded_id'] = None
        chapter_info['shortened_encoded_id'] = None
        return chapter_info

    def fetch_lesson_info(self, lesson_node, lesson_id):
        lesson_info = {}

        # Explicit control of reindex and cache generation
        lesson_info['reindex'] = 'False'
        lesson_info['cache_math'] = 'True'
        lesson_info['subjects'] = []

        try:
            title = lesson_node.find('h1', {'id':lesson_id}).getText().strip()
            title = re.sub(r"^\d+.\d+\s+",'',  title)
            lesson_info['title'] = title
        except Exception as ex:
            self.log.info("fetch_lesson_info: Error getting title for lesson id" % lesson_id)
            self.log.info(ex)
            lesson_info['title'] = ''

        lesson_info['handle'] = m.title2Handle(lesson_info['title'])
        #try:
        #    lesson_info['desc'] = lesson_node.getElementsByTagName('property:About_Lesson')[0].firstChild.data
        #except Exception as e:
        #    lesson_info['desc'] = ''

        #lesson_info['keyword_list'] = self.get_value_list(lesson_node, 'property:Keyword')
        #lesson_info['grade_list'] = self.parseGrades(self.get_value_list(lesson_node, 'property:Grade'))
        #lesson_info['state'] = self.get_value_list(lesson_node, 'property:State')

        #lesson_info['related_eids'] = self.get_value_list(each, 'property:Related_EIDs')
        #self.log.info('property:Related_EIDs: [%s]' %(lesson_info['related_eids']))

        #lesson_info['author_details'] = self.get_author_details(lesson_node)
        #lesson_info['categories'] = self.get_categories(lesson_node)
        #encoded_id = self.new_get_encoded_id(lesson_node, 'lesson')
        #if encoded_id != {}:
        #    lesson_info['encoded_id'] = encoded_id['full']
        #    lesson_info['shortened_encoded_id'] = encoded_id['shortened']
            #lesson_info['keyword_list'].append(lesson_info['encoded_id'])
            #lesson_info['keyword_list'].append(lesson_info['shortened_encoded_id'])
        #else:
        #    lesson_info['encoded_id'] = None
        #    lesson_info['shortened_encoded_id'] = None
        #try:
        #    cover_image_resolver =  lesson_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
        #    subjects = lesson_node.getElementsByTagName('swivt:Subject')
        #    lesson_info['cover_image'] = None
 
        #    for each in subjects:
        #        if each.getAttribute('rdf:about') == cover_image_resolver:
        #            cover_image_url = each.getElementsByTagName('rdfs:label')[0].childNodes[0].data.strip().replace(' ','_')
        #            lesson_info['cover_image'] = self.downloadImage(cover_image_url)
        #            break
        #except:
        #    lesson_info['cover_image'] = None

        #category_list = lesson_node.getElementsByTagName('property:Category_Node_2')
        #category_list.extend(lesson_node.getElementsByTagName('property:Category_Node'))
        #lesson_category = None
        #try:
        #    for each in category_list:
        #        if each.childNodes[1].childNodes[3].childNodes[0].data == 'CKT':
        #            lesson_category = each.childNodes[1].childNodes[5].childNodes[0].data
        #            break
        #except:
        #    lesson_category = None

        #lesson_info['lesson_category'] = lesson_category
        lesson_info['author_details'] = []
        lesson_info['keyword_list'] = []
        lesson_info['grade_list'] = []
        lesson_info['state'] = []
        lesson_info['subjects'] = []
        lesson_info['categories'] = []
        lesson_info['level'] = []
        lesson_info['cover_image'] = None
        lesson_info['encoded_id'] = None
        lesson_info['shortened_encoded_id'] = None
        return lesson_info

    def build_chapter_xhtml(self, chapter_xhtml):
        chapter_skeleton = self.get_content(settings.CHAPTER_SKELETON_FILE)
        try:
            chapter_nodes = BeautifulSoup(chapter_xhtml)
            introduction_content = None
            summary_content = None
            index_counter = 1;
            for each in chapter_nodes.findAll("div", 'x-ck12-data'):
                heading_tag = each.find("h2")
                content = ''
                if heading_tag:
                    content = ''.join([h.safe_decode(str(nodes)) for nodes in each.find("h2").findNextSiblings()])
                elif each.findAll():
                    content = ''.join([h.safe_decode(str(nodes)) for nodes in each.contents])
                if index_counter == 1:
                    try:
                        introduction_content = content
                        #Introduction_content string contains unicode chanracter first decode it and the perform string concatenation
                        introduction_content = '<h2 id="x-ck12-SW50cm9kdWN0aW9u">' + (each.find("h2").getText() if heading_tag else '') + '</h2>' + introduction_content
                    except Exception as ex:
                        self.log.error(ex.__str__())
                if index_counter == 2:
                    try:
                        summary_content = content
                        summary_content = '<h2 id="x-ck12-U3VtbWFyeQ..">' + (each.find("h2").getText() if heading_tag else '') + '</h2>' + summary_content
                    except Exception as ex:
                        self.log.error(ex.__str__())
                index_counter += index_counter
            if introduction_content:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_CONT%',
                                                           introduction_content)
            else:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_CONT%', '')
            if summary_content:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_TAIL_SUBSECTIONS%', h.safe_decode(summary_content))
            else:
                chapter_skeleton = chapter_skeleton.replace('%CHAP_TAIL_SUBSECTIONS%', '')
        except Exception as ex:
            self.log.error(ex.__str__())
        self.log.info('Chapter skeleton: %s' %(chapter_skeleton))
        return chapter_skeleton

    def build_concept(self, lesson_id, lesson_info):
        concept_info = {}
        # Explicit control of reindex and cache generation
        concept_info['reindex'] = 'False'
        concept_info['cache_math'] = 'True'

        try:
            title = lesson_info.get("title")
            title = re.sub(r"^\d+.\d+\s+",'',  title)
            concept_info['title'] = title
        except Exception as ex:
            concept_info['title'] = ''

        #try:
        #    if concept_info['title'].strip() == '':
        #        concept_info['title'] = os.path.basename(metadata_node.getElementsByTagName('rdfs:label')[0].lastChild.data)
        #except Exception as e:
        #    concept_info['title'] = ''

        concept_info['handle'] = lesson_info.get('handle')

        #try:
        #    concept_info['desc'] = metadata_node.getElementsByTagName('property:Description')[0].firstChild.data
        #except Exception as e:
        #    concept_info['desc'] = ''

        concept_info['xhtml'] = ''
        concept_content = ''
        if api.isLessonConceptSplitEnabled:
            try:
                lesson_xhtml = lesson_info['xhtml']
                lesson_xhtml, concept_content = h.splitLessonXhtml(lesson_xhtml, splitOn='div class="x-ck12-data')
                self.log.info("Getting first video from: %s" % concept_info['title'])
                first_video_snippet,first_video_url,first_video_resid = self.get_first_video_snippet(concept_content)
                if first_video_snippet is not None:
                    concept_info['first_video_snippet'] = first_video_snippet
                    concept_info['first_video_url'] = first_video_url
                    concept_info['first_video_resid'] = first_video_resid
                lesson_info['xhtml'] = lesson_xhtml
            except Exception as ex:
                raise ex
                self.log.error("Error splitting lesson content into concept: %s" % str(ex), exc_info=ex)
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
        concept_info['cover_image'] = None#self.get_first_img_info(concept_info['xhtml'])
        #duplicated_file_path = self.make_duplicate(concept_info['cover_image'])
        #if duplicated_file_path != None:
        #concept_info['cover_image'] = duplicated_file_path
        concept_info['author_details'] = []
        concept_info['keyword_list'] = []
        concept_info['grade_list'] = []
        concept_info['state'] = []
        concept_info['subjects'] = []
        concept_info['categories'] = []
        concept_info['level'] = []
        #concept_info['keyword_list'].extend(lesson_info['keyword_list'])
        #concept_info['grade_list'].extend(lesson_info['grade_list'])
        #concept_info['state'].extend(lesson_info['state'])
        #concept_info['subjects'].extend(lesson_info['subjects'])
        #concept_info['categories'].extend(lesson_info['categories'])
        #concept_info['level'].extend(lesson_info['level'])
        #concept_info['author_details'] = self.new_get_author_details(metadata_node)
        #Derive concept encoded ID from lesson's
        encoded_id = {}#self.new_get_encoded_id(lesson_info, 'lesson')
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
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_ID%',h.safe_decode(str(lesson_info['concept_id'])))
        lesson_info['xhtml'] = lesson_info['xhtml'].replace('%C_REV%',h.safe_decode(str(lesson_info['concept_rev'])))
        return lesson_info

    def process_external_images(self, base_dir, xhtml_content):
        xhtml_nodes = BeautifulSoup(xhtml_content)
        all_images = xhtml_nodes.findAll("img")

        for image_tag in all_images:
            try:
                if image_tag.get('class') and image_tag.get('class') in ['x-ck12-block-math', 'x-ck12-math']:
                    image_src = image_tag.get('src')
                    new_src = image_tag.get('alt')
                    if 'x-ck12-block-math' in image_tag.get('class'):
                        new_src = re.sub(r'&amp;=', '&=', new_src)
                        new_src = re.sub(r'\\times', '*', new_src)
                        new_src = re.sub(r'\\{3}(?![&|\\])', '\\\\\\\\', new_src)
                        new_src = re.sub(r'\\{3}&', '\\\\\\\\&', new_src)
                        new_src = re.sub(r']\s\\{2}lim\\limits_', '] \\\\\\\\\\\\lim\\limits_', new_src)
                        new_src = re.sub(r"\\\\int", "\\\\\\\\\\int", new_src)
                        
                        new_src = re.sub(r"&gt;", "\\\\gt", new_src)
                        new_src = re.sub(r"&lt;", "\\\\lt", new_src)
                        new_src = re.sub(r"\\{2}end{", "\\\\\\\\\\\\end{", new_src)
                        new_src = "%s%s" % (settings.NEW_BLOCK_MATH_PREFIX, quote(new_src, safe="()"))
                    else:
                        new_src = "%s%s" % (settings.NEW_INLINE_MATH_PREFIX, quote(new_src))
                    self.log.info(new_src)
                    new_image_tag = image_tag
                    #new_image_tag.attrs.append(('data-flx-url', new_src))
                    new_image_tag['src'] = new_src
                    #new_image_tag = str(new_image_tag).replace(image_src, new_src)
                    #xhtml_content = xhtml_content.replace(str(image_tag), new_image_tag)
                    image_tag.replaceWith(new_image_tag)
                    continue
                image_src = image_tag.get('src')
                new_src = "%s/%s" % (base_dir, image_src)
                self.log.info('New absolute image location: %s' %(new_src))
                new_image_tag = image_tag
                new_image_tag['src'] = new_src
                image_tag.replaceWith(new_image_tag)
                #xhtml_content = xhtml_content.replace(str(image_tag), new_image_tag)
                self.log.info('Processing: '+ new_src)

                internal_url,resource_id = self.api_manager.create_resource_int(new_src, self.user_id)
                if new_src and internal_url == new_src:
                    ## Try to duplicate the image and save again.
                    timestamp = datetime.now().strftime("%Y%m%d%s%f")
                    new_file_loc = '%s-%s%s'%(os.path.splitext(new_src)[0],timestamp,os.path.splitext(new_src)[1])
                    shutil.copy(new_src,new_file_loc)
                    internal_url,resource_id = self.api_manager.create_resource_int(new_file_loc, self.user_id)
                self.log.info('New image location: '+ h.safe_decode(str(internal_url)))
                self.all_image_paths[internal_url] = "%s"%(new_src)
                #xhtml_content = xhtml_content.replace(new_src, internal_url)
                new_image_tag['src'] = internal_url
            except Exception as ex:
                self.log.error('Process external Images: :%s '%(ex.__str__()) )
        """div_re = re.compile('<div.*?/div>',re.DOTALL)
        divs = div_re.findall(xhtml_content)
        for each_div in divs:
            try:
                div_tag_re = re.compile('<div.*?>')
                div_tag = div_tag_re.findall(each_div)[0]
                class_re = re.compile('class="(.*?)"')
                class_val = class_re.findall(div_tag)[0]
                class_val = class_val.split(' ')
                img_re = re.compile('(<img.*?src="(.*?)".*?>)', re.DOTALL)
                img_tag = img_re.findall(each_div)
                img_src = img_tag[0][1]
                img_tag = img_tag[0][0]
                repl_val = None
                if class_val.__contains__('x-ck12-img-thumbnail'):
                    repl_val = 'THUMB_LARGE'
                elif class_val.__contains__('x-ck12-img-postcard'):
                    repl_val = 'THUMB_POSTCARD'
                elif class_val.__contains__('x-ck12-img-fullpage'):
                    repl_val = 'default'
                if repl_val and not img_src.__contains__('/show/%s'%repl_val):
                    new_img_src = img_src.replace('/show/','/show/%s/'%repl_val)
                    new_img_tag = img_tag.replace(img_src, new_img_src)
                    new_div = each_div.replace(img_tag, new_img_tag)
                    xhtml_content = xhtml_content.replace(each_div, new_div)
            except Exception as e:
                continue"""
        return h.safe_decode(str(xhtml_nodes))

    def get_content(self, file_path):
        content = ''
        try:
            self.log.info("Reading contents for file = [%s]" % file_path )
            file_handler = codecs.open(file_path, 'r', 'utf-8')
            content = file_handler.read()
            file_handler.close()
        except Exception as ex:
            self.log.error("get_content : Error [%s]" % ex)
            content = ''
            #if utf-8 encoding fails try to read content with latin_1 and convert content back to utf-8 for futher processing
            try:
                self.log.info("Reading with latin_1")
                file_handler = codecs.open(file_path,"r", encoding='latin_1')
                content = file_handler.read()
                file_handler.close()
                file_write_handler = codecs.open(file_path,"wr", encoding='utf-8')
                file_write_handler.write(content)
                file_write_handler.close()
                file_handler = codecs.open(file_path,"r", encoding='utf-8')
                content = file_handler.read()
                file_handler.close()
            except Exception as ex:
                self.log.error(ex)
        return self.pre_process_xhtml(content)

    def process_images(self, working_dir, user_id):
        self.log.info("Getting into images section 1")
        self.user_id = user_id
 
        os_walker = os.walk(working_dir)
        xhtmls = os_walker.next()
        try:
            while xhtmls != None:
                for each in xhtmls[2]:
                    if each.endswith('.html') and not each.startswith('metadata') and each not in EXCLUDE_CHAPTERS_BY_FILE_TITLE_LIST:
                        file_path = xhtmls[0] + "/" + each
                        self.buffer = self.get_content(file_path)
                        try:
                            self.buffer = self.create_embedded_objects(self.buffer, user_id)
                        except Exception as ex:
                            self.log.info("create_embedded_objects: %s" % ex.__str__())
                        try:
                            self.buffer = self.process_external_images(xhtmls[0], self.buffer)
                        except Exception as ex:
                            self.log.info("Process_external_images: %s" % ex.__str__())
                        try:
                            self.buffer = h.transform_to_xhtml(self.buffer, addIDs=False)
                        except Exception as ex:
                            self.log.info("transform_to_xhtml: %s" % ex.__str__())
                        xhtml_write_path = codecs.open(file_path, "w", encoding='utf-8')
                        xhtml_write_path.write(self.buffer)
                        xhtml_write_path.close()
                xhtmls = os_walker.next()
        except Exception as ex:
            self.log.info("Method:process_images: %s" % ex.__str__())
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
        except Exception as ex:
            self.log.error("IMG Mapper writer: "+ str(ex))

    ## Regular expressions to get first video info
    videoRegex = re.compile(r'<iframe ([^<>]*)>', re.I | re.MULTILINE)
    idRegex = re.compile(r'[ ]*name="([0-9]*)"', re.I)

    def get_href(self, href):
        tmp_src = href.split("?")
        if len(tmp_src) > 1:
            params = "%s" % tmp_src[1].replace("&amp;", "&").replace("&#38;", "&")
            href = "%s?%s" % (tmp_src[0], quote(params).replace("%25", "%"))
        return href

    def create_embedded_objects(self, xhtml_content, user_id):
        """
            Create all embedded objects internally
        """
        xhtml_nodes = BeautifulSoup(xhtml_content)
        all_anchors = xhtml_nodes.findAll("a")

        for a_tag in all_anchors:
            a_href = a_tag.get('href').strip()
            if h.safe_decode(str(a_href)).startswith('http://www.ck12.org/flx/render/perma/resource'):
                new_id = "%s-%s" % ("x-ck12",h.getRandomString(15))
                resource_type = a_href.split("/")[7]
                resource_handle = a_href.split("/%s/" % resource_type)[1]
                api_end_point = '%s/%s/get/perma/resource/info/%s/%s'%(FLX_PREFIX, PREFIX, resource_type, self.get_href(resource_handle))
                req = urllib2.Request(api_end_point)
                response = urllib2.urlopen(req)
                resource_info = response.read()
                resource_info = json.loads(resource_info)
                if resource_info.has_key('responseHeader') and resource_info['responseHeader']['status'] == 0:
                    try:
                        resource_info = resource_info['response']['resource']
                        embeddedObject = resource_info['embeddedObject']
                        eo_iframe_node = BeautifulSoup(embeddedObject['iframe'])
                        eo_iframe_node.find("iframe")['id'] = new_id
                        embeddable = h.genURLSafeBase64Decode(str(eo_iframe_node), hasPrefix=False)
                        self.EO_IFRAME_CONTENT = re.sub(r'<!-- @@embeddable=(.*)-->',"<!-- @@embeddable=%s-->"% embeddable, self.EO_IFRAME_CONTENT)
                        eo_iframe_node_str = re.sub(r'</iframe>',"%s </iframe>"% self.EO_IFRAME_CONTENT, str(eo_iframe_node))
                        a_tag.findParent().replaceWith(BeautifulSoup(eo_iframe_node_str))
                    except Exception as ex:
                        self.log.error(ex)
            #elif h.safe_decode(str(a_href)).startswith('http'):
            #    a_tag['href'] = self.get_href(a_tag['href'])

        return h.safe_decode(str(xhtml_nodes))
    
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
            except Exception as ex:
                self.log.info("Error getting first video_snippet: %s" % str(ex))
                video_text  = None
                video_url = None
               
        return video_text,video_url,video_resource_id

if __name__ == "__main__":
    wiki_importer = WikiImporter()
    user_id = "1"
    importer_res = wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/SAT_Prep_FlexBook_%28Questions_and_Answer_Key%29', user_id)
    logger = logging.getLogger(__name__)
    logger.setLevel(log_level)
    wiki_importer.process_and_import_content(importer_res['working_dir'], importer_res['user_id'], 'concept')
    #wiki_importer.import_from_wiki('http://authors.ck12.org/wiki/index.php/CK-12_Biology', user_id)
