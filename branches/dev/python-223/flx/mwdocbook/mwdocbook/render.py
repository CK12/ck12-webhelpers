from sys import stdout, version_info, exit
from urllib import unquote, quote
import urllib2
from string import join
import os

from mwlib.wiki import makewiki
from mwlib.expander import Expander
from mwlib.uparser import parseString
from mwlib.advtree import buildAdvancedTree
from mwlib.treecleaner import TreeCleaner
from mwlib.parser import Node, Book, log as parser_log, show, Text

from lisp import car, cadr, nullp, append, flatten
from artifacts import Artifacts

from xml.dom import minidom
from elementtree.SimpleXMLWriter import encode_entity
from elementtree.ElementTree import SubElement
from xml.etree import ElementTree as et

# have to have these explicit versions around to circumvent the
# bug that class, etc. are illegal keys
def empty_element_explicit(tag, attributes):
    return ['<%s%s />' % (tag, attributes_to_string(attributes))]

def element_explicit(tag, content, attributes):
    return ['<%s%s>' % (tag, attributes_to_string(attributes)),
            content,
            '</%s>' % tag]

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

# Omit Nones, but keep null strings?
def attributes_to_string(attributes):
    return reduce(lambda accumulata, key:
                  join([accumulata,
                        '%s="%s"' % \
                        (key, encode_entity(attributes[key]))],
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
            out.write(str(root))

def parse(title, raw):
    article = parseString(title=title, raw=raw)
    buildAdvancedTree(article)
    TreeCleaner(article).cleanAll()
    return article

class WikiRenderer:

    def __init__(self):
        self.wiki_url = None
        self.working_dir = None
        self.webLocation = "http://localhost"


    def book_to_dir(self, book_wiki_url, dest_dir_path, webLocation, translation_class):
        self.book_from_wiki(dest_dir_path, book_wiki_url, webLocation, translation_class)

    def book_from_wiki(self, dest_dir_path, book_wiki_url, webLocation, translation_class):
        self.webLocation = webLocation

        base, index, current_artifact = self.partition_url(book_wiki_url)
        book_xml_file = '%s/%s'%(dest_dir_path,'book.xml')
        book_img_dir = '%s/%s'%(dest_dir_path,'book_images')
        if not os.path.exists(dest_dir_path):
            os.mkdir(dest_dir_path)
        if not os.path.exists(book_img_dir):
            os.mkdir(book_img_dir)
        self.generate_artifact(base, current_artifact, book_xml_file, book_img_dir, translation_class)
        self.fix_titles_in_xml(book_xml_file)
        metadata_file = '%s/%s'%(dest_dir_path,'metadata.xml')
        current_artifact = current_artifact.replace(' ','_')
        metadata_header,book_metadata = self.get_metadata_rdf(base, index, current_artifact)
        book_metadata = '<metadata><book fileref="%s">%s</book>'% (book_xml_file, book_metadata)
        self.append_content_to_file(metadata_file, metadata_header)
        self.append_content_to_file(metadata_file, book_metadata)
        wiki,all_chapters = self.get_children(base, current_artifact)
        chapter_count = 1
        for each_chapter in all_chapters:
            chapter_dir = "%s/chapter_%s/" % (dest_dir_path,chapter_count)
            chapter_xml_file = '%s%s'%(chapter_dir,'chapter.xml')
            chapter_img_dir = '%s%s'%(chapter_dir,'chapter_images')
            if not os.path.exists(chapter_dir):
                os.mkdir(chapter_dir)
            if not os.path.exists(chapter_img_dir):
                os.mkdir(chapter_img_dir)
            self.generate_artifact(base, each_chapter, chapter_xml_file,chapter_img_dir, translation_class)
            self.fix_titles_in_xml(chapter_xml_file)
            each_chapter = each_chapter.replace(' ','_')
            metadata_header,chapter_metadata = self.get_metadata_rdf(base, index, each_chapter)
            chapter_metadata = '<chapter fileref="%s">%s</chapter>'% (chapter_xml_file, chapter_metadata)
            self.append_content_to_file(metadata_file, chapter_metadata)
            chapter_count = chapter_count + 1
            lesson_count = 1
            wiki, all_lessons = self.get_children(base, each_chapter)
            for each_lesson in all_lessons:
                Chapter_info_container.chapter_title = each_chapter.title()
                Chapter_info_container.lesson_title = each_lesson.title()
                lesson_xml_file = '%slesson_%s.xml'%(chapter_dir,lesson_count)
                lesson_img_dir = '%slesson_%s_images'%(chapter_dir,lesson_count)
                if not os.path.exists(lesson_img_dir):
                    os.mkdir(lesson_img_dir)
                self.generate_artifact(base, each_lesson, lesson_xml_file,lesson_img_dir, translation_class)
                #self.fix_titles_in_xml(lesson_xml_file)
                each_lesson = each_lesson.replace(' ','_')
                metadata_header,lesson_metadata = self.get_metadata_rdf(base, index, each_lesson)
                lesson_metadata = '<lesson fileref="%s">%s</lesson>'% (lesson_xml_file, lesson_metadata)
                self.append_content_to_file(metadata_file, lesson_metadata)
                lesson_count = lesson_count + 1
        self.append_content_to_file(metadata_file, '</metadata>')

    def get_children(self, base, current_artifact):
        artifacts, wiki = self.parse_remote(base, current_artifact)
        children_list = []
        try:
            all_children = artifacts.getAllChildren()
            ele = all_children.next()
            while ele != None:
                if ele.type == 'link':
                    children_list.append(ele.full_target)
                ele = all_children.next()
            return wiki,children_list
        except Exception as e:
            print e.__str__()
            return wiki,children_list

    def generate_artifact(self, base, artifact_target, target_file, target_image_dir, translation_class):
 
        artifact, wiki = self.parse_remote(base, artifact_target)
        render(translation_class(wiki=wiki, image_dir=target_image_dir, out=open(target_file,'w'), webLocation=self.webLocation), artifact, open(target_file,'w'))


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

    def parse_remote(self, base, artifact):

        try:
            wiki = makewiki(base)
        except RuntimeError:
            print "RENDER.PY:PARSE_REMOTE:MAKEWIKI:RUNTIMEERROR"
        db = wiki['wiki']
        db.setTemplateExclusion(category='Non importanda')
        article = artifact
        raw = db.getRawArticle(article)
        if raw:
            expanded = Expander(raw, pagename=article, wikidb=db).expandTemplates()
            return parse(article, expanded), wiki
        else:
            return None, None

    def get_metadata_rdf(self, base, index, title):
        metadata_header = ''
        metadata_content = ''
        try: 
            metadata_rdf_url = '%s%sSpecial:ExportRDF/%s'%(base,index,title)
            metadata_opener = urllib2.urlopen(metadata_rdf_url)
            doc = minidom.parse(metadata_opener)
            if len(doc.childNodes) > 1:
                metadata_header = doc.childNodes[0].toxml()
                metadata_content = doc.childNodes[1].toxml()
        except Exception as e:
            print e.__str__()
        return (metadata_header,metadata_content)
           
    def append_content_to_file(self, file, content):
        try: 
            file_handle = open(file, 'a')
            file_handle.write(content)
            file_handle.close()
            return True
        except Exception as e:
            print e.__str__()
            return False
         
            
    def partition_url(self, url):
        return unicode(unquote(url)).partition('index.php/')

    def fix_titles_in_xml(self, xml_path):    
        file = open(xml_path,'r')
        xml = file.read()
        file.close()
        try:
            newxml = xml.replace('sect4','sect5').replace('sect3','sect4').replace('sect2','sect3').replace('sect1','sect2')
            file = open(xml_path,'w')
            file.write(newxml)
            file.close()

            f = open(xml_path,'r')
            xml = f.read()
            tree = et.XML(xml)
            for titleTag in tree.findall('title')[1:]:
                titleTag.tag = 'sect1'
                subElement = SubElement(titleTag, 'title')
                subElement.text = titleTag.text
                titleTag.text = ''
            file = open(xml_path,'w')
            et.ElementTree(tree).write(file)
        except Exception as e:
            return


class StringPort(object):
    string = ''

    def __init__(self, string=string):
        self.string = string

    def write(self, string):
        self.string += string

    def read(self):
        return self.string
