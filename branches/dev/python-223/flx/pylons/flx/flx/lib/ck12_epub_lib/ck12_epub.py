from BeautifulSoup import BeautifulStoneSoup
from feed_article import FeedArticle
import logging

import settings
from flx.lib import helpers as h
import epub_tools
import re
#Initialing Debugger
#logging.basicConfig(filename=settings.LOG_FILENAME,level=logging.DEBUG,)


class CK12EPub:

    def __init__(self):
        self.log = logging.getLogger(__name__)
        self.workdir = ""
        self.book_title = ""
        self.chapter_array = []
        self.chapter_concept_map = {}
        self.artifactType = 'book'
        self.playOrder = 4
        self.create_work_dir();
        self.chapter_counter = 0
        self.toc = ""
        self.html_toc = ""
        self.manifest = ""
        self.image_manifest = ""
        self.table_manifest = ""
        self.spine =""
        self.table_spine =""
        self.optimizeForKindle = False

    def set_book_title(self, title):
        title = epub_tools.escape_xml_entities(title)
        title = title.encode('ascii', 'xmlcharrefreplace')
        self.book_title = title

    def setLogger(self, logger):
        self.log = logger

    def add_new_chapter_from_url(self, url):
        chapter_title = 'Chapter ' + str(self.chapter_counter + 1)
        chapter_title = epub_tools.escape_xml_entities(chapter_title)
        chapter_body = '<body><p>Hello World</p></body>'
        resource_prefix = ''
        scheme, http_prefix = epub_tools.getPrefix(url)
        if http_prefix == '':
            resource_prefix = settings.DEFAULT_HTTP_PREFIX
        else:
            if not scheme:
                resource_prefix = 'http:' + resource_prefix

        web_result = epub_tools.doGet(url)
        if  (web_result[0] == 200) :
            chapter_body = epub_tools.transform_to_xhtml(web_result[1])
            chapter_title = chapter_title + epub_tools.get_html_title(chapter_body)

        chapter_body = epub_tools.purify_html(chapter_body)
        self.add_new_chapter(chapter_title, chapter_body, http_prefix)


    def add_new_chapter_from_feed(self, url, offset):
        chapter_title = 'Chapter ' + str(self.chapter_counter + 1)
        chapter_title = epub_tools.escape_xml_entities(chapter_title)
        chapter_body = '<body><p>Hello World</p></body>'
        resource_prefix = ''
        scheme, http_prefix = epub_tools.getPrefix(url)
        if http_prefix == '':
            resource_prefix = settings.DEFAULT_HTTP_PREFIX
        else:
            if not scheme:
                resource_prefix = 'http:' + resource_prefix

        new_chap = FeedArticle()
        try:
            new_chap.init_from_feed(url, offset)
            chapter_body = new_chap.content
            chapter_title = new_chap.title
        except Exception, e:
            self.log.info(str(e))

        #chapter_body = epub_tools.purify_html(chapter_body)
        self.add_new_chapter(chapter_title, chapter_body, http_prefix)

    def add_new_chapter(self, chapter_title, chapter_xhtml_body, http_prefix):
        chapter_title = epub_tools.escape_xml_entities(chapter_title)
        chapter_xhtml_body=epub_tools.transform_to_xhtml(chapter_xhtml_body)
        self.chapter_counter += 1
        new_chap = EPubChapter(chapter_title, chapter_xhtml_body, http_prefix, self.chapter_counter)
        new_chap.serialize(self.workdir + "/OEBPS");
        self.chapter_array.append(new_chap)
        return 0

    def add_new_chapter_with_concepts(self, chapter_title, concept_titles,
                                      chapter_xhtml_body, http_prefix, math_satellite_server):
        chapter_title = epub_tools.escape_xml_entities(chapter_title)
        concept_titles = [epub_tools.escape_xml_entities(each_title) for each_title in concept_titles]
        concept_titles = [BeautifulStoneSoup(each_title, convertEntities=BeautifulStoneSoup.HTML_ENTITIES).text for each_title in concept_titles]
        chapter_xhtml_body=epub_tools.transform_to_xhtml(chapter_xhtml_body)
        self.chapter_counter += 1
        self.log.info('Adding chapter to ePub: %s' %(chapter_title))
        new_chap = EPubChapter(chapter_title, chapter_xhtml_body, http_prefix,
                               math_satellite_server, self.chapter_counter)
        new_chap.optimizeForKindle = self.optimizeForKindle
        new_chap.serialize(self.workdir + "/OEBPS");
        self.chapter_array.append(new_chap)
        self.chapter_concept_map[chapter_title] = concept_titles
        return 0

    def add_new_chapter_for_gdt2epub(self, chapter_title, chapter_xhtml_body, resource_dir):
        chapter_title = epub_tools.escape_xml_entities(chapter_title)
        self.chapter_counter += 1
        self.log.info('Adding chapter to ePub: %s' %(chapter_title))
        new_chap = EPubChapterFromGDT(chapter_title, chapter_xhtml_body, self.chapter_counter)
        new_chap.serialize(self.workdir + "/OEBPS", resource_dir);
        self.chapter_array.append(new_chap)
        self.chapter_concept_map[chapter_title] = []
        return 0

    def create_work_dir(self):
        self.workdir = epub_tools.create_work_dir()
        epub_tools.populate_epub_dir(self.workdir)

    def bundle(self):
        epub_tools.bundle_epub(self.workdir, "book.epub")
        if not settings.EPUB_DEBUG_FLAG:
           epub_tools.removeTmpDirectories(self.workdir)

    def add_book_metadata(self):
        epub_tools.add_book_title(self.workdir, self.book_title)

    def add_chapter_metadata(self):
        #prepare metadata
        images_added_in_manifest = []
        for i in self.chapter_array:
            i.title = epub_tools.escape_xml_entities(i.title)
            i.title = BeautifulStoneSoup(i.title, convertEntities=BeautifulStoneSoup.HTML_ENTITIES).text
            self.prepare_toc(i.title, i.chapter_number+1, self.chapter_concept_map.get(i.title) or [], i.serialized_file_name)
            self.prepare_manifest(i.chapter_number, i.serialized_file_name)
            image_number = 1
            for j in i.image_array:
                if not images_added_in_manifest.__contains__(j["image_href"]):
                    j["image_num"] = str(i.chapter_number)+"."+str(image_number)
                    self.prepare_image_manifest(j["image_num"], j["image_href"], j["image_format"])
                    images_added_in_manifest.append(j["image_href"])
                    image_number = image_number + 1
            table_number = 1
            for j in i.table_array:
                number = str(i.chapter_number) + "." + str(table_number)
                self.prepare_table_manifest(number, j)
                self.prepare_table_spine(number)
                table_number = table_number + 1
            self.prepare_spine(i.chapter_number)
            self.playOrder = self.playOrder + 1
        epub_tools.add_toc(self.workdir, self.toc)
        epub_tools.add_html_toc(self.workdir, self.html_toc)
        epub_tools.add_manifest(self.workdir, self.manifest)
        epub_tools.add_image_manifest(self.workdir, self.image_manifest)
        epub_tools.add_table_manifest(self.workdir, self.table_manifest)
        epub_tools.add_spine(self.workdir, self.spine)
        epub_tools.add_table_spine(self.workdir, self.table_spine)

    def prepare_toc(self, title, chapter_number, concepts, source):
        #making a toc element. The playOrder is chapter_number + 1 because playOrder 1 is the title page
        self.toc += epub_tools.make_toc_element(title, self.playOrder, source)
        self.html_toc = self.html_toc + '\n' + epub_tools.make_html_toc_element(title, source)
        concept_toc = ''
        concept_html_toc = ''
        for eachConcept in concepts:
            self.playOrder = self.playOrder + 1
            concept_toc += epub_tools.make_toc_element(eachConcept, self.playOrder, source +
                                        "#" + h.genURLSafeBase64Encode(eachConcept))
            concept_html_toc = concept_html_toc + '\n' + epub_tools.make_html_toc_element(eachConcept, source +
                                        "#" + h.genURLSafeBase64Encode(eachConcept))
        concept_toc = concept_toc.replace('__CONCEPT_TOC__', '')
        concept_html_toc = concept_html_toc.replace('__CONCEPT_TOC__', '')
        if len(concept_html_toc) > 0:
            concept_html_toc = '\n<ul>' + concept_html_toc + '\n</ul>\n'
        self.toc = self.toc.replace('__CONCEPT_TOC__', concept_toc)
        self.html_toc = self.html_toc.replace('__CONCEPT_TOC__', concept_html_toc)

    def prepare_manifest(self, number, source):
        self.manifest += epub_tools.make_manifest_element(number, source)

    def prepare_image_manifest(self, number, source, format):
        self.image_manifest += epub_tools.make_image_manifest_element(number, source, format)

    def prepare_table_manifest(self, number, source):
        self.table_manifest += epub_tools.make_table_manifest_element(number, source)

    def prepare_spine(self, number):
        self.spine += epub_tools.make_spine_element(number)

    def prepare_table_spine(self, number):
        self.table_spine += epub_tools.make_table_spine_element(number)

    def add_book_cover(self, cover_image_path):
        epub_tools.add_book_cover_image(self.workdir+"/OEBPS/images/",cover_image_path)

    def add_book_cover_from_url(self, cover_image_url):
        imgFormat = cover_image_url.split('.')[-1]
        cover_image_path = self.workdir+"/OEBPS/images/temp_cover.%s" %(imgFormat)
        epub_tools.retrieve_image(cover_image_url, cover_image_path)
        epub_tools.add_book_cover_image(cover_image_path, self.book_title, self.artifactType)

    def add_isbn_number(self,isbn_number):
        epub_tools.add_isbn_number(self.workdir,isbn_number)

    def add_author_attribution(self, book_authors_string,
                                     book_editors_string,
                                     book_sources_string,
                                     book_contributors_string,
                                     book_translators_string,
                                     book_reviewers_string,
                                     book_technicalreviewers_string):
        epub_tools.add_author_attribution(self.workdir + "/OEBPS/ck12_author_attribution.html",
                                          book_authors_string,
                                          book_editors_string,
                                          book_sources_string,
                                          book_contributors_string,
                                          book_translators_string,
                                          book_reviewers_string,
                                          book_technicalreviewers_string)

    def fix_image_extension(self,epub_book_path):
        epub_tools.fix_image_extension(epub_book_path)

    def render(self):
        self.add_book_metadata()
        self.add_chapter_metadata()
        self.bundle()

    def extract_front_and_back_matter(self, xhtml):
        """
        Will extract the front and back matter from the given xhtml.
        """
        # Prepare the re strings and patterns
        data_re = '<h2.*?\s*#title#\s*.*?</h2>\s*<p'
        empty_re = '<h2.*?\s*#title#\s*.*?</h2>'
        back_matter_pat = re.compile('<h2.*?\s*Back\s*Matter\s*.*?</h2>\s*<p', re.IGNORECASE)

        front_matter = ''
        back_matter = ''
        try:
            text = xhtml.replace(xhtml[:xhtml[xhtml.find('DOCTYPE')-2:].find('>')+1], '').strip()
            if (text.startswith('>')):
                    text = text.strip('>').strip()
            #text = text.replace(text[:text[text.find('html'):].find('>')+2], '').strip()
            text = text.replace(text[:text[text.find('html'):].find('<')], '').strip()
            z = re.search('x-ck12-data-chapter', text)
            if (text.find('<h2') != -1):
                    front_matter =  text[:z.start()].strip()
                    front_matter = front_matter[:front_matter.rfind('<h2')].strip()
                    front_matter = front_matter[front_matter.find('<body') : ]
                    front_matter = front_matter.replace('h3', 'h2')
                    for title in ["Front\s*Matter", "Foreword", "Preface", "Dedication"]:
                        # Find if the front matter has data.
                        tmp_re = data_re.replace("#title#", title)
                        front_matter_pat = re.compile(tmp_re, re.IGNORECASE)
                        if not front_matter_pat.findall(front_matter):
                            # The front matter does not have any data so remove the empty tag.
                            tmp_re = empty_re.replace("#title#", title)
                            front_matter_empty_pat = re.compile(tmp_re, re.IGNORECASE)
                            front_matter = re.sub(front_matter_empty_pat,'',front_matter)
                    if front_matter.find('<h2') == -1:
                        front_matter = ''
        except:
            front_matter = ''
        try:
            if (text.rfind('<h2') != -1):
                    n = re.search('<div class="x-ck12-data-chapter">', text)
                    back_matter = text[n.end():][text[n.end():].find('<h2')-2:].replace('</html>', '').strip()
                    back_matter = back_matter.strip()
                    back_matter = back_matter.replace('h3', 'h2')
                    # Find if the back matter has data.
                    if not back_matter_pat.findall(back_matter):
                        # The back matter does not have any data so remove the empty tag.
                        back_matter_empty_pat = re.compile('<h2.*?\s*Back\s*Matter\s*.*?</h2>', re.IGNORECASE)
                        back_matter = re.sub(back_matter_empty_pat,'',back_matter)                    
                    if back_matter.find('<h2') == -1:
                        back_matter = ''
        except:
            back_matter = ''
        return (front_matter, back_matter)
    
    def make_front_matter_chapters(self, xhtml):
        chapters = []
        html_head = '<html xmlns="http://www.w3.org/1999/xhtml"> \n<head> \n<title>'
        html_end = '</body>\n</html>'

        while 1:
            title = html_head
            h2_start = xhtml.find('<h2')
            xhtml = xhtml[h2_start + 1 : ]
            h2_start = xhtml.find('</h2>')
            m_title = xhtml[xhtml.find('>') + 1 : xhtml.find('<') - 1]
            title += m_title + "</title>\n</head>\n<body>" 
            xhtml = xhtml[h2_start + 5 : ]
            new_h2_start = xhtml.find('<h2')

            if new_h2_start != -1 :
                chap = {'title':m_title, 'xhtml':title + xhtml[: new_h2_start] + html_end}
            else:
                chap = {'title':m_title, 'xhtml':title + xhtml[:] + html_end}
            chapters.append(chap)
            xhtml = xhtml[new_h2_start : ]
            if new_h2_start == -1:
                break

        if not chapters:
            temp_xhtml = xhtml[xhtml.find('<h2') + 1 :]
            title = temp_xhtml[temp_xhtml.find('>') + 1 : temp_xhtml.find('<') - 1]
            h2_start = xhtml.find('</h2>') + 5
            html_head += title + "</title></head><body>" 
            chapters.append({'title':title, 'xhtml':html_head + xhtml[h2_start:] + html_end})
        return chapters

    def __str__(self):
        self.log.info("CK12EPub object")
        self.log.info("Title: "+ self.book_title)
        self.log.info("Workdir: "+ self.workdir)
        self.log.info("Chapter counter: "+ str(self.chapter_counter))
        self.log.info("TOC string: "+ self.toc)


class EPubChapter:
    def __init__(self, title, body, prefix, math_satellite_server, chapter_number):
        self.log = logging.getLogger(__name__)
        title = epub_tools.escape_xml_entities(title)
        self.title = title.encode('ascii', 'xmlcharrefreplace')
        self.xhtml_body = body
        self.http_prefix = prefix
        self.math_satellite_server = math_satellite_server
        self.chapter_number = chapter_number
        self.serialized_file_name =""
        self.image_array = []
        self.table_array = []
        self.optimizeForKindle = False

    def serialize (self, base_path):
        resource_dir = "ck12_"+ str(self.chapter_number) + "_files"
        resource_path = base_path +"/"+ resource_dir
        if epub_tools.mkdir(resource_path) :
            serialized_body, self.image_array = epub_tools.copy_html_images(self.xhtml_body, base_path, resource_path,
                                                self.http_prefix, self.math_satellite_server, self.chapter_number, self.title, self.optimizeForKindle)
            serialized_body, self.table_array = epub_tools.render_tables(serialized_body, base_path, resource_path,self.chapter_number, self.title, self.optimizeForKindle)
            serialized_body, thumbnail_array = epub_tools.render_embedded_objects(serialized_body, base_path, resource_path, self.http_prefix)
            self.image_array.extend(thumbnail_array)
            serialized_body = epub_tools.inject_css_link(serialized_body)
            serialized_body = epub_tools.improve_content(serialized_body,base_path)
            self.serialized_file_name =  str(self.chapter_number) +".html"
            epub_tools.save_html(serialized_body, base_path, self.serialized_file_name)
        else:
            raise IOError("Failed to create working directory. Permission issue?")

    def __str__(self):
        self.log.info("EPubChapter object: "+ str(self.chapter_number))
        self.log.info("Title: "+ self.title)

class EPubChapterFromGDT:
    def __init__(self, title, body, chapter_number):
        self.log = logging.getLogger(__name__)
        title = epub_tools.escape_xml_entities(title)
        self.title = title.encode('ascii', 'xmlcharrefreplace')
        self.xhtml_body = body
        self.chapter_number = chapter_number
        self.serialized_file_name =""
        self.image_array = []

    def serialize (self, base_path, resource_dir):
        serialized_body, self.image_array = epub_tools.rename_html_images(self.xhtml_body,
                                                        base_path, resource_dir, self.chapter_number, self.title)
        self.serialized_file_name =  str(self.chapter_number) + ".html"
        epub_tools.save_html(serialized_body, base_path, self.serialized_file_name)

    def __str__(self):
        self.log.info("EPubChapterFromGDT object: "+ str(self.chapter_number))
        self.log.info("Title: " + self.title)
