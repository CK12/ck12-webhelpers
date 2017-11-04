import urllib, urllib2
import cookielib
import os
from stat import *
from xml.etree.ElementTree import ElementTree
import jsonlib
import sys


'''
Strategy:
1. Read docs per chapter
2. Post things per chapter
'''

path_to_here = "/opt/2.0/test_data/chapters/new_chapters"
host_prefix = "http://localhost/flx"
create_book_url = "/create/book"
create_chapter_url = "/create/chapter"
create_lesson_url = "/create/lesson"
get_info_url = "/get/info/"
auth_url = "/member/login"

class ChapterData:

    def __init__(self, dirpath):
        self.user_name = 'admin'
        self.user_password = 'anything_goes'
        self.path = os.path.abspath(dirpath)
        self.meta_file = 'chapter.xml'
        chapterFile = os.path.join(self.path, self.meta_file)
        if not os.path.exists(chapterFile):
            ## skip
            return None
        self.metadata = ""
        self.title = ""
        self.description = ""
        self.id = ""
        self.bookTitle = ""
        self.chapterSeq = -1
        self.lessons = []
        self.authenticated = False
        self._loadData()
        
    def _loadData(self):
        if not os.path.exists(self.path):
            raise IOError("Directory doesn't seem to exist or readable...")
        self.metadata = ElementTree()
        self.metadata.parse(os.path.join(self.path, self.meta_file))
        self.bookTitle = self.metadata.findtext("/chapter/metadata/book").strip()
        self.chapterSeq = self.metadata.findtext("/chapter/metadata/chapterSeq").strip()
        self.title = self.metadata.findtext("/chapter/metadata/title").strip()
        self.description = self.metadata.findtext("/chapter/metadata/description").strip()
        lesson_list = self.metadata.findall("/chapter/lessons/item")
        for lesson in lesson_list:
            lesson_dict = {
                "title": lesson.attrib["id"],
                "id": -1, #not inserted yet
                "file_name": lesson.attrib["href"],
                "xhtml": self._getXhtml(lesson.attrib["href"]),
                "seq": lesson.attrib["sequence"]}
            self.lessons.append(lesson_dict)
            self.lessons.sort(cmp=lambda x,y: cmp(int(x['seq']), int(y['seq'])), reverse=True)
        
    def _getXhtml(self, file_name):
        file_handle = open(os.path.join(self.path, file_name))
        return file_handle.read()        
        
        
    def submitBook(self, chapterIDs):
        payload = []
        payload.append(('authorID', 1))
        payload.append(('title', self.bookTitle))
        payload.append(('type', 'book'))
        payload.append(('cover image name', ''))
        payload.append(('cover image description', ''))
        payload.append(('cover image uri', 'http://www.ck12.org/media/images/covers/Algebra_I_fbs.png'))
        for chapter in chapterIDs:
            payload.append(('children', chapter))
        payload.append(('summary', ''))
        
        post_result = self._doPost(host_prefix + create_book_url, urllib.urlencode(payload))
        result_dict = jsonlib.read(post_result)
        self.bookID = result_dict["response"]["id"]
        return self.bookID
        #print post_result

    def getBookID(self):
        response = self._doGet(host_prefix + get_info_url + "book/" + self.bookTitle)
        response_dict = jsonlib.read(response)
        self.bookID = response_dict['response']['id']

    def submitChapter(self):
        payload = []
        payload.append(('authorID', 1))
        payload.append(('title', self.title))
        payload.append(('type', 'chapter'))
        payload.append(('cover image name', ''))
        payload.append(('cover image description', ''))
        payload.append(('cover image uri', 'http://www.ck12.org/media/images/covers/cover_chapter_generic.png'))
        for lesson in self.lessons:
            payload.append(('children', lesson['id']))
        payload.append(('summary', self.description))
        
        post_result = self._doPost(host_prefix + create_chapter_url, urllib.urlencode(payload))
        result_dict = jsonlib.read(post_result)
        self.id = result_dict["response"]["id"]
        #print post_result


    def submitLessons(self):
        for lesson in self.lessons :
            payload = {'authorID': 1,
                       'title': lesson["title"],
                       'type': 'lesson',
                       'cover image name': '',
                       'cover image description': '',
                       'cover image uri': 'http://www.ck12.org/media/images/covers/cover_chapter_generic.png',
                       'xhtml': lesson["xhtml"],
                       'summary': ''}
            post_result = self._doPost(host_prefix + create_lesson_url, urllib.urlencode(payload))
            result_array = jsonlib.read(post_result)
            #print result_array
            lesson["id"] = result_array["response"]["id"]
            #print post_result

    def submit(self):
        self.submitLessons()
        self.submitChapter()
        
    def _getLessonID(self):
        ID = []
        for lesson in self.lessons :
            ID.append(lesson['id'])
        
        return ID
        
        
    def _doPost(self, url, payload):
        if (not self.authenticated):
            self._authenticate_user()
            self.authenticated = True
            
        post_response = urllib2.urlopen(url, payload)  
        return post_response.read()

    def _doGet(self, url):
        response = urllib2.urlopen(url)
        return response.read()

    def _authenticate_user(self):
        #user authentication  
        cookiejar = cookielib.CookieJar()
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cookiejar))
         
        urllib2.install_opener(opener)  
        payload = {}
        payload['name'] = self.user_name 
        payload['password'] = self.user_password
        payload = urllib.urlencode(payload) 
        user_auth_url = host_prefix + auth_url+'?'+payload

        response = urllib2.urlopen(user_auth_url)
        auth_response = response.read()
        return auth_response  

        
    def printDebug(self):
        for lesson in self.lessons:
            print str(lesson["id"]) +":  "+ lesson["title"] +" (lesson)"
        print str(self.id) +": "+ self.title +" (chapter)"
            
if __name__ == "__main__":
    chapters = []
    for root, dirs, files in os.walk(path_to_here):
        for name in files:
            if name == "chapter.xml":
                chapters.append(os.path.join(root, name))
    i = 0
    count = len(chapters)
    chapterData = {}
    for chapter in chapters:
        i += 1
        print "Processing %d of %d" % (i, count)
        my_chapter = ChapterData(os.path.dirname(chapter))
        if my_chapter:
            if not chapterData.has_key(my_chapter.bookTitle):
                chapterData[my_chapter.bookTitle] = []
            chapterData[my_chapter.bookTitle].append(my_chapter)

    for book in chapterData.keys():
        chapters = chapterData[book]
        print "Processing book: %s, chapters in this book: %d" % (book, len(chapters))
        chapterIDs = []
        if chapters:
            chapters.sort(cmp=(lambda x,y: cmp(int(x.chapterSeq), int(y.chapterSeq))), reverse=True)
            for chapter in chapters:
                chapter.submit()
                chapterIDs.append(chapter.id)
                chapter.printDebug()
            bookid = chapters[0].submitBook(chapterIDs)
            print "created book with id %d for title '%s' with %s chapters" % (bookid, book, str(chapterIDs))
           
