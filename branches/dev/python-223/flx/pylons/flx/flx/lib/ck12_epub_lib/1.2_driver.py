#!/usr/bin/python
'''
This is the driver file to create epubs from books in a 1.2.x system.

'''

import urllib2
import sys
import logging
from optparse import OptionParser

import simplejson as json

from ck12_epub import CK12EPub
from epub_tools import constructFullName
import settings

#Initialing Debugger
logging.basicConfig(filename=settings.LOG_FILENAME,level=logging.DEBUG,)

class FlexrDriver:

    def __init__(self):
        self.content_host = ''
        self.chapter_dict = []
        self.book_title = ''

    def get_flexbook_data(self, fid):
        url = self.content_host + settings.GET_FLEXBOOK_ENDPOINT + fid
        result = doGet(url)
        if result[0] == 200 :
            s = json.JSONDecoder().decode(result[1])
            logging.debug("1.2 Driver :"+str(s))
            self.book_title = s['ftitle']
            self.chapter_dict = s['chapters']
            book_attributions = s['attributions']
            book_authors = []
            book_contributors = []
            book_editors = []
            book_sources = []
            book_translators = []
            for eachAttribution in book_attributions:
                if eachAttribution['attribution_type'] == 'author':
                    book_authors.append(constructFullName(eachAttribution['first_name'], \
                                                               eachAttribution['middle_name'], \
                                                               eachAttribution['last_name']))
                if eachAttribution['attribution_type'] == 'contributor':
                    book_contributors.append(constructFullName(eachAttribution['first_name'], \
                                                               eachAttribution['middle_name'],\
                                                               eachAttribution['last_name']))
                if eachAttribution['attribution_type'] == 'editor':
                    book_editors.append(constructFullName(eachAttribution['first_name'],\
                                                               eachAttribution['middle_name'],\
                                                               eachAttribution['last_name']))
                if eachAttribution['attribution_type'] == 'source':
                    book_sources.append(constructFullName(eachAttribution['first_name'],\
                                                               eachAttribution['middle_name'],\
                                                               eachAttribution['last_name']))
                if eachAttribution['attribution_type'] == 'translator':
                    book_translators.append(constructFullName(eachAttribution['first_name'],\
                                                               eachAttribution['middle_name'],\
                                                               eachAttribution['last_name']))
            self.book_authors_string = ", ".join(book_authors)
            self.book_editors_string = ", ".join(book_editors)
            self.book_sources_string = ", ".join(book_sources)
            self.book_contributors_string = ", ".join(book_contributors)
            self.book_translators_string = ", ".join(book_translators)
            logging.debug("1.2 Driver :"+self.book_title)
            logging.debug("Authors: " + self.book_authors_string)
            logging.debug("Editors: " + self.book_editors_string)
            logging.debug("Sources: " + self.book_sources_string)
            logging.debug("Contributors: " + self.book_contributors_string)
            logging.debug("Translators: " + self.book_translators_string)
            return True
        else :
            logging.debug("1.2 Driver :"+ "Could not get book information. Check if the server is up. Error code: "+ result[0])
            return False

    def create_epub_from_book(self, host, fid,coverimage_path,book_isbn_number):
        logging.debug ("1.2 Driver :"+"Host: "+ host +", fid: "+ fid)
        self.content_host = host
        myEpub = CK12EPub()
        if self.get_flexbook_data(fid):
            myEpub.set_book_title(self.book_title)
            chapter_number = 0
            for chapter in self.chapter_dict :
                chapter_number += 1
                chapter_title = "Chapter "+ str(chapter_number) +": "+ chapter['ctitle']
                logging.debug("1.2 Driver :"+ str(chapter['cid']) +", "+ chapter['ctitle'])
                url = self.content_host + settings.GET_CHAPTER_ENDPOINT + chapter['cid']
                result = doGet(url)
                if result[0] == 200 :
                    s = json.JSONDecoder().decode(result[1])
                    logging.debug("1.2 Driver :"+ "\n\n\n"+ s['xhtml'] +"\n\n\n")
                    #display chapter number and title	
                    display_chapter_title = "<h2>"+ chapter_title +"</h2>"
                    xhtml_body = display_chapter_title + s['xhtml']
                    myEpub.add_new_chapter(chapter_title, xhtml_body, '')
            myEpub.add_book_cover(coverimage_path)
            myEpub.add_isbn_number(book_isbn_number)
            myEpub.add_author_attribution(self.book_authors_string,
                                          self.book_editors_string,
                                          self.book_sources_string,
                                          self.book_contributors_string,
                                          self.book_translators_string)

            myEpub.render()
            logging.debug("1.2 Driver :"+myEpub.workdir +"/book.epub")
            print "Book finished in: "+myEpub.workdir +"/book.epub"

    def fix_image_extension(self,epub_book_path):
        logging.debug(epub_book_path)
        myEpub=CK12EPub()
        myEpub.fix_image_extension(epub_book_path)

def doGet(url):
    f = urllib2.urlopen(url);
    return [f.code, f.read()]


if __name__ == "__main__":
    my_driver = FlexrDriver()
    cover_image_path = ''
    book_isbn_number=' '
    Usage = "python 1.2_driver.py <host URL> <Flexbook Id> [options] "
    parser = OptionParser(usage=Usage)
    parser.add_option("-p", "--cover",dest="cover_path",help="(optional) Enter your book cover image with full path",default='')
    parser.add_option("-n", "--isbn",dest="isbn",help="(optional) Enter ISBN number of your book",default='Not Available')
    parser.add_option("-e","--ext",dest="ext",help="(optional) Input a ePub file with full path for add extentions in images",default=' ')
    (options,args)=parser.parse_args()

    if options.ext!=' ':
       my_driver.fix_image_extension(options.ext)
    else:
        if len(sys.argv) >= 3:
             my_driver.create_epub_from_book(sys.argv[1],sys.argv[2],options.cover_path,options.isbn)
        else:
            logging.debug("1.2 Driver :" '''Usage: python 1.2_driver.py <host URL> <Flexbook Id> [options]

Options:
  -h, --help            show this help message and exit
  -p COVER_PATH, --cover=COVER_PATH
                        (optional) Enter your book cover image with full path
  -n ISBN, --isbn=ISBN  (optional) Enter ISBN number of your book ''')
