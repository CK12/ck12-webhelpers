from sys import stdout, exit, __stdout__
from urllib import unquote
import urllib2
from string import join
import os
import re
import codecs
from shutil import copyfile as copy
import logging

from mwlib.expander import Expander
from mwlib.uparser import parseString
from mwlib.advtree import buildAdvancedTree
from mwlib.treecleaner import TreeCleaner
from mwlib.parser import Node, Text
from mwlib import wiki

from lisp import nullp, append
import helpers as h
from processwithtimeout import ProcessWithTimeout

from xml.dom import minidom
from elementtree.SimpleXMLWriter import encode_entity
import settings
import shutil

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(__stdout__)
logger.addHandler(handler)

def empty_element_explicit(tag, attributes):
    return ['<%s%s />' % (tag, attributes_to_string(attributes))]

def element_explicit(tag, content, attributes):
    return ['<%s%s>' % (tag, attributes_to_string(attributes)),
            content,
            '</%s>' % tag]

def element_explicit_simple(tag, content, attributes):
    return ['<%s %s>' % (tag, attributes),
            content,
            '</%s>' % tag]

def create_comment(data):
    return ['<!-- %s -->' % data]

def empty_element(tag, **attributes):
    return empty_element_explicit(tag, attributes)

def element(tag, *content, **attributes):
    return element_explicit(tag, content, attributes)

class Options_container(object):
    chapter_option = None
    disable_embedded_objects = False

# Bug 4092
class Chapter_info_container(object):
    chapter_title = ''
    lesson_title = ''

def dont_purge(node):
    node.children = [Text("don't purge me")]

def attributes_to_string(attributes):
    return reduce(lambda accumulata, key:
                  join([accumulata,
                        '%s="%s"' % \
                        (key, encode_entity('%s' %(attributes[key])))],
                       ' '),
                  filter(lambda key: attributes[key] is not None,
                         attributes),
                  '')

def render(translation, root, out=stdout):
    translation.out = out
    if root:
        if isinstance(root, Node):
            render(translation,
                   translation.translation.get(root.__class__.__name__,
                                               translation.default)\
                   (translation, root),
                   out=out)
        elif isinstance(root, list) or isinstance(root, tuple):
            # FOR as opposed to list comprehensions since the endpoint
            # mutates
            for root in root:
                render(translation, root, out=out)
        else:
            out.write(root)

def parse(title, raw):
    article = parseString(title=title, raw=raw)
    buildAdvancedTree(article)
    TreeCleaner(article).cleanAll()
    return article

def printConsole(string):
    if string and type(string).__name__ == 'str':
        string = string.decode('utf-8')
    logger.info(string)

class WikiRenderer:

    def __init__(self):
        self.wiki_url = None
        self.username = None
        self.password = None
        self.concept_based = False
        self.content_caching = False
        self.working_dir = None
        self.articles = {}


    def book_to_dir(self, book_wiki_url, dest_dir_path, translation_class):
        self.book_from_wiki(dest_dir_path, book_wiki_url, translation_class)

    def book_from_wiki(self, dest_dir_path, book_wiki_url, translation_class):
        if self.concept_based:
            self.get_children = self.get_concepts
        else:
            self.get_children = self.get_chapters

        base, index, current_artifact = self.partition_url(book_wiki_url)
        book_xhtml_file = '%s/%s'%(dest_dir_path,'book.xhtml')
        book_img_dir = '%s/%s'%(dest_dir_path,'book_images')
        if not os.path.exists(dest_dir_path):
            os.mkdir(dest_dir_path)
        if not self.metadata_only and not os.path.exists(book_img_dir):
            os.mkdir(book_img_dir)
        if not self.metadata_only:
            status = self.generate_artifact(base, current_artifact, book_xhtml_file, book_img_dir, translation_class)
            if not status:
                printConsole('ERROR: Could not fetch the contents for the book. Exiting...')
                exit(1)
            if self.concept_based:
                self.fix_headings(book_xhtml_file)
            else:
                self.upgrade_headings(book_xhtml_file)
        metadata_file = '%s/%s'%(dest_dir_path,'metadata.xml')
        current_artifact = current_artifact.replace(' ','_')
        if not self.metadata_file:
            metadata_header,book_metadata = self.get_metadata_rdf(base, index, current_artifact)
            book_metadata = '<metadata><book fileref="%s">%s</book>' %(book_xhtml_file.replace(dest_dir_path + '/', ''), book_metadata)
            fd = open(metadata_file, 'w').close()
            self.append_content_to_file(metadata_file, metadata_header)
            self.append_content_to_file(metadata_file, book_metadata)
        wiki, all_chapters = self.get_children(base, current_artifact)
        chapter_count = 1
        for each_chapter in all_chapters:
            each_chapter = self.translate_benutzer(each_chapter)
            printConsole('Fetching chapter: %s' %(each_chapter))
            chapter_dir = "%s/chapter_%s/" % (dest_dir_path,chapter_count)
            chapter_xhtml_file = '%s%s'%(chapter_dir,'chapter.xhtml')
            chapter_img_dir = '%s%s'%(chapter_dir,'chapter_images')
            if not self.metadata_only and not os.path.exists(chapter_dir):
                os.mkdir(chapter_dir)
            if not self.metadata_only and not os.path.exists(chapter_img_dir):
                os.mkdir(chapter_img_dir)
            if not self.metadata_only:
                status = self.generate_artifact(base, each_chapter, chapter_xhtml_file,chapter_img_dir, translation_class)
                if not status:
                    printConsole('ERROR: Could not fetch the contents for this chapter. Skipping this chapter and moving on')
                    continue
                if self.concept_based:
                    self.fix_headings(chapter_xhtml_file)
                else:
                    self.upgrade_headings(chapter_xhtml_file)
            each_chapter = each_chapter.replace(' ','_')
            if not self.metadata_file:
                metadata_header,chapter_metadata = self.get_metadata_rdf(base, index, self.get_article_url(wiki, each_chapter))
                chapter_metadata = '<chapter fileref="%s">%s</chapter>' %(chapter_xhtml_file.replace(dest_dir_path + '/', ''), chapter_metadata)
                self.append_content_to_file(metadata_file, chapter_metadata)
            chapter_count = chapter_count + 1
            lesson_count = 1
            childWiki, all_lessons = self.get_children(base, each_chapter)
            for each_lesson in all_lessons:
                each_lesson = self.translate_benutzer(each_lesson)
                printConsole('Fetching lesson: %s' %(each_lesson))
                Chapter_info_container.chapter_title = each_chapter.title()
                Chapter_info_container.lesson_title = each_lesson.title()
                lesson_xhtml_file = '%slesson_%s.xhtml'%(chapter_dir,lesson_count)
                lesson_img_dir = '%slesson_%s_images'%(chapter_dir,lesson_count)
                if not self.metadata_only and not os.path.exists(lesson_img_dir):
                    os.mkdir(lesson_img_dir)
                if not self.metadata_only:
                    status = self.generate_artifact(base, each_lesson, lesson_xhtml_file,lesson_img_dir, translation_class)
                    if not status:
                        printConsole('ERROR: Could not fetch the contents for this lesson. Skipping this lesson and moving on')
                        continue
                    if self.concept_based:
                        self.fix_headings(lesson_xhtml_file)
                each_lesson = each_lesson.replace(' ','_')
                if not self.metadata_file:
                    metadata_header,lesson_metadata = self.get_metadata_rdf(base, index, self.get_article_url(childWiki, each_lesson))
                    lesson_metadata = '<lesson fileref="%s">%s</lesson>' %(lesson_xhtml_file.replace(dest_dir_path + '/', ''), lesson_metadata)
                    self.append_content_to_file(metadata_file, lesson_metadata)
                lesson_count = lesson_count + 1
        self.append_content_to_file(metadata_file, '</metadata>')
        if self.metadata_file:
            printConsole('Metadata file supplied. Using the supplied file')
            copy(self.metadata_file, metadata_file)

    def mask_vertical_space(self, raw_content):
        raw_content = re.sub(h.verticalSpaceP, h.verticalSpaceIntmP, raw_content)
        return raw_content

    def mask_pound_sign(self, raw_content):
        anchor_tag_re = re.compile('(<a href=.*?>)',re.DOTALL)
        all_anchor_tags = anchor_tag_re.findall(raw_content)
        for each_tag in all_anchor_tags:
            raw_content = raw_content.replace(each_tag, each_tag.replace('#',h.POUND_SIGN_TEXT))
        return raw_content

    def fix_anchors(self, raw_content):
        anchor_tag_re = re.compile('(<a href=.*?</a>)',re.DOTALL)
        all_anchor_tags = anchor_tag_re.findall(raw_content)
        for each_tag in all_anchor_tags:
            raw_content = raw_content.replace(each_tag, h.convert_html_entitities(each_tag))
        return raw_content

    def add_newline_after_section(self, raw_content):
        section_re = re.compile(r'(^[ ]*=+(.*?)=+[ ]*$)', re.MULTILINE)
        raw_content = section_re.sub("\\1" + "\\n", raw_content)
        return raw_content

    def cleanup_uniq_chars(self, raw_content):
        uniq_char_re = re.compile("\x7fUNIQ-[a-z0-9]+-\\d+-[a-f0-9]+-QINU\x7f",re.DOTALL)
        try:
            uniq_chars = uniq_char_re.findall(raw_content)
            for each_char in uniq_chars:
                raw_content = raw_content.replace(each_char,'')
        except Exception as e:
            print 'Exception from cleanup_uniq_chars: %s'% e.__str__()
        return raw_content

    def get_concepts(self, base, current_artifact):
        artifacts, wiki, tmpdir = self.parse_remote(base, current_artifact)
        children_list = []
        try:
            for eachChild in artifacts.children:
                if eachChild.children[0].asText().lower().startswith('chapter') or \
                   eachChild.children[0].asText().lower().startswith('lesson'):
                    for eachSubChild in eachChild.children[1:]:
                        if eachSubChild.__class__.__name__ == 'ItemList':
                            chapterList = eachSubChild.children
                            children_list = [x.children[0].full_target for x in chapterList]
                            return wiki, children_list
        except Exception as e:
            printConsole(e.__str__)
            return wiki, children_list
        finally:
            if tmpdir is not None:
                pass
                #shutil.rmtree(tmpdir)
            return wiki, children_list

    def get_chapters(self, base, current_artifact):
        artifacts, wiki, tmpdir = self.parse_remote(base, current_artifact)
        children_list = []
        try:
            for eachChild in artifacts.children:
                if eachChild.__class__.__name__ == 'ItemList':
                    chapterList = eachChild.children
                    children_list = [x.children[0].full_target for x in
                                     chapterList if
                                     x.children[0].__class__.__name__ == 'ArticleLink' or x.children[0].__class__.__name__ == 'NamespaceLink']
                    return wiki, children_list
                if eachChild.__class__.__name__ == 'Section':
                    if eachChild.children[1].__class__.__name__ == 'ItemList':
                        chapterList = eachChild.children[1].children
                        children_list = [x.children[0].full_target for x in
                                     chapterList if
                                     x.children[0].__class__.__name__ == 'ArticleLink' or x.children[0].__class__.__name__ == 'NamespaceLink']
                        return wiki, children_list
        except Exception as e:
            printConsole(e.__str__)
            return wiki, children_list
        finally:
            if tmpdir is not None:
                pass
                #shutil.rmtree(tmpdir)
            return wiki, children_list

    def translate_benutzer(self, artifact):
        if artifact.startswith('Benutzer:'):
            return artifact.replace('Benutzer:', 'User:')
        else:
            return artifact
            
    
            
    def get_mwlib_tmpdir(self, strn=None):
        """
        This function takes in the file output, a string, as parameter, it is for the .out file,
        reads the file, searches for the keyword 'keeping tmpdir', extarcts the full path
        of the tmpdir, and deletes it.
        """
        import re
        import shutil
        tmpdir = False
        
        if (strn):
            try:
                lst = strn.split("\n")
                tmpdir_string = [x for x in lst if x.__contains__('keeping tmpdir')][0] 
                tmpdir = re.findall("'(.+?)'", tmpdir_string)[0]
                shutil.rmtree(tmpdir)
            except:
                pass 
            
        return (tmpdir)
    
    
    
    def parse_remote(self, base, artifact):
        artifact = self.translate_benutzer(artifact)

        zip_creator = '/usr/local/bin/mw-zip'
        wiki_server = base.split('//')[1].split('.')[0]
        zip_filename = artifact.replace(' ', '_').replace(';', '_').replace('/',
                                                                            '_').replace(":",
                                                                                         "_").replace('-','_').replace('"', '')
        zip_directory = '/opt/data/export2xhtml/%s/' %(wiki_server)
        zip_location = zip_directory + zip_filename + '.zip'
        zip_dirname = os.path.dirname(zip_location)
        if not os.path.exists(zip_dirname):
            os.makedirs(zip_dirname)
        params = ' -c \"%s\" --username \"%s\" --password \"%s\" -o \"%s\" --keep-tmpfiles \
                 --template-exclusion-category \"Non importanda\" \"%s\"' \
                 %(base, self.username, self.password, zip_location, artifact.replace('"', '\\"')
)

        logProcessTimedout = logging.getLogger('logProcessTimedout')
        logProcessTimedout.setLevel(logging.INFO)
        fileHandle = open(settings.LOG_FILENAME, 'w')
        handlerProcessTimedout = logging.StreamHandler(fileHandle)
        logProcessTimedout.addHandler(handlerProcessTimedout)

        cmd = zip_creator + params
        if self.content_caching:
            printConsole( 'Checking if the article is cached locally...')
            if not os.path.exists(zip_location):
                printConsole('Article not found in the local cache. Fetching it from the wiki...')
                printConsole('Running command: %s' %(cmd))
                proc = ProcessWithTimeout(cmd=cmd, shell=True, log=logProcessTimedout)
                returnCode, log_output = proc.start(timeout=10*60)
                tmpdir = self.get_mwlib_tmpdir(log_output)
                if returnCode != 0:
                    return None, None, None
        else:
                printConsole('Running command: %s' %(cmd))
                proc = ProcessWithTimeout(cmd=cmd, shell=True, log=logProcessTimedout)
                returnCode, log_output = proc.start(timeout=10*60)
                tmpdir = self.get_mwlib_tmpdir(log_output)
                if returnCode != 0:
                    return None, None, None

        artifactObj = None
        wikiObj = None
        try:
            env = wiki.makewiki(zip_location)
            page = env.wiki.nuwiki.normalize_and_get_page(artifact, 0)

            raw = page.rawtext
            raw = Expander(raw, pagename=artifact, wikidb=env.wiki).expandTemplates()
            raw = self.mask_vertical_space(raw)
            raw = self.mask_pound_sign(raw)
            raw = self.fix_anchors(raw)
            raw = self.add_newline_after_section(raw)
            raw = self.cleanup_uniq_chars(raw)
            #article = parseString(artifact, raw, wikidb=env.wiki)
            article = parseString(artifact, raw)
            buildAdvancedTree(article)
            TreeCleaner(article).cleanAll()
            artifactObj = article
            wikiObj = env
        except Exception as e:
            printConsole(e.__str__())

        tmpdir = self.get_tmpdir_path()
        return artifactObj, wikiObj, tmpdir

    def get_tmpdir_path(self):
        fileHandle = open(settings.LOG_FILENAME, 'r')
        logFileLines = fileHandle.readlines()
        fileHandle.close()
        tmpdir = None
        for line in logFileLines:
            result = line.find('keeping tmpdir')
            if result>= 0:
                tmpdir = line.split()[2]
                break
        if tmpdir is not None:
            tmpdir = tmpdir[2:len(tmpdir) - 1]
        return tmpdir

    def get_article_url(self, wiki, article):
        return wiki.wiki.getURL(article).split('title=')[1]

    def generate_artifact(self, base, artifact_target, target_file, target_image_dir, translation_class):
        artifact, wiki, tmpdir = self.parse_remote(base, artifact_target)
        if not wiki:
            print 'Error generating XHTML for %s' %(artifact_target)
            raise Exception('Error generating XHTML for %s' %(artifact_target))
            return False
        fd = codecs.open(target_file,'w',encoding='utf-8')
        render(translation_class(wiki=wiki, image_dir=target_image_dir, out=fd), artifact, fd)
        fd.close()
        if tmpdir is not None:
            pass
            #shutil.rmtree(tmpdir)
        return True

    def reduce_article(self, translation, roots, reduction=append, init=[]):
        if nullp(roots):
            return []
        else:
            return self.reduce_article\
                   (translation,
                    reduce(append, map(lambda root: root.children, roots)),
                    reduction,
                    reduction(init,
                              map(lambda root: translation\
                                  .translation.get(root.__class__.__name__,
                                                   translation.default)\
                                  (translation, root), roots)))

    def get_metadata_rdf(self, base, index, title):
        metadata_header = ''
        metadata_content = ''
        try:
            metadata_rdf_url = '%s%sSpecial:ExportRDF/%s'%(base,index,title)
            printConsole('Running ExportRDF: %s' %(metadata_rdf_url))
            metadata_opener = urllib2.urlopen(metadata_rdf_url)
            doc = minidom.parse(metadata_opener)
            if len(doc.childNodes) > 1:
                metadata_header = doc.childNodes[0].toxml()
                metadata_content = doc.childNodes[1].toxml()
        except Exception as e:
            printConsole(e.__str__())
        return (metadata_header,metadata_content)

    def append_content_to_file(self, file, content):
        try:
            file_handle = codecs.open(file, 'a', encoding='utf-8')
            file_handle.write(content)
            file_handle.close()
            return True
        except Exception as e:
            printConsole(e.__str__())
            return False

    def partition_url(self, url):
        return unquote(url).partition('index.php/')

    def fix_headings(self, xhtml_path):
        fd = codecs.open(xhtml_path, 'r', encoding='utf-8')
        xhtml_content = fd.read()
        fd.close()
        h5_re_obj = re.compile('<h5(.*?)>',re.DOTALL)
        h4_re_obj = re.compile('<h4(.*?)>',re.DOTALL)
        h3_re_obj = re.compile('<h3(.*?)>',re.DOTALL)
        h2_re_obj = re.compile('<h2(.*?)>',re.DOTALL)
        h1_re_obj = re.compile('<h1(.*?)>',re.DOTALL)
        try:
            xhtml_content = h5_re_obj.sub('<h6\\1>', xhtml_content).replace('</h5>', '</h6>')
            xhtml_content = h4_re_obj.sub('<h5\\1>', xhtml_content).replace('</h4>', '</h5>')
            xhtml_content = h3_re_obj.sub('<h4\\1>', xhtml_content).replace('</h3>', '</h4>')
            xhtml_content = h2_re_obj.sub('<h3\\1>', xhtml_content).replace('</h2>', '</h3>')
            xhtml_content = h1_re_obj.sub('<h2\\1>', xhtml_content).replace('</h1>', '</h2>')
            fd = codecs.open(xhtml_path, 'w', encoding='utf-8')
            fd.write(xhtml_content)
            fd.close()
        except Exception as e:
            printConsole(e.__str__())
            return False

    def upgrade_headings(self, xhtml_path):
        fd = codecs.open(xhtml_path, 'r', encoding='utf-8')
        xhtml_content = fd.read()
        fd.close()
        for i in range(2, 7):
            h_re = re.compile(r'(<h%s id="(.*?)">)' %(i), re.DOTALL)
            h_end_re = re.compile(r'</h%s>' %(i))
            xhtml_content = h_re.sub("<h%s id=\"\\2\">" %(i-1), xhtml_content)
            xhtml_content = h_end_re.sub(r'</h%s>' %(i-1), xhtml_content)
        fd = codecs.open(xhtml_path, 'w', encoding='utf-8')
        fd.write(xhtml_content)
        fd.close()


class StringPort(object):
    string = ''

    def __init__(self, string=string):
        self.string = unicode(string).encode('utf-8')

    def write(self, string):
        self.string += unicode(string).encode('utf-8')

    def read(self):
        return self.string
