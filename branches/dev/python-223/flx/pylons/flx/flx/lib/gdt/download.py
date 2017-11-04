from urllib2 import urlopen, build_opener
from pylons.i18n.translation import _ 
from xml.dom.minidom import parse,parseString
import logging
import os
import json
import re
from oauth2client.client import AccessTokenCredentials
import httplib2
from urllib2 import build_opener
from apiclient.discovery import build
from memoryzip import InMemoryZip

from flx.lib.helpers import isFileMalicious, MaliciousFileException

GOOGLE_SERVER = 'https://docs.google.com'
EXPORT_API = '/feeds/download/documents/Export?id=%s&exportFormat=zip'
COLLECTION_CONTENT_API = '/feeds/default/private/full/%s/contents'
DOWNLOAD_FILE_API = 'https://www.googleapis.com/drive/v2/files/%s'
DOWNLOAD_URL = "https://docs.google.com/feeds/download/documents/export/Export?id=%s&exportFormat=zip"

DOC_FIELDS = 'id,title,mimeType,exportLinks'
FOLDER_TYPE = 'application/vnd.google-apps.folder'
DOCUMENT_TYPE = 'application/vnd.google-apps.document'

log = logging.getLogger(__name__)

class GDTDownloader(object):

    def __init__(self, docid, googleAuthToken=None):
        self.docid = docid
        self.googleAuthToken = googleAuthToken

    def download(self, toFile, docID=None):
        """
            Download a google document as HTML file optionally using an auth token
        """
        if not docID:
            docID = self.docid
        try:
            # Get the service object
            service = self.getGoogService()
            drive_file = service.files().get(fileId=docID).execute()
            log.info('drive_file: %s' % drive_file)

            download_url = drive_file['exportLinks']['text/html']
            log.info("Getting url: %s" % download_url)
            # Download GoogleDoc as HTML file containing images sourced from Google server. 
            resp, content = service._http.request(download_url)
            # Download the respective images from Google server.
            self.downloadImagesFromHTML(service, content, toFile)

            log.info("Wrote file: %s" % toFile)
            if isFileMalicious(toFile):
                raise Exception((_(u'Malicious file detected. Aborting.')).encode("utf-8"))
        except MaliciousFileException as mfe:
            log.error('Malicious file detected in GoogleDoc with id: %s' %(docID))
            #os.remove(toFile)
            raise mfe
        except Exception, e:
            log.error("Cannot download document id: %s" % docID, exc_info=e)
            raise Exception((_(u'Cannot download document id: %(docID)s')  % {"docID":docID}).encode("utf-8"))

    def downloadCollection(self, working_dir):
        """
            Download a google folder along with subfolders and documents.
        """
        try:
            downloadList = []
            book_id = self.docid
            log.info('Work Directory :: %s' %working_dir)
            artifact_titles = {}
            service = self.getGoogService()
            # Get the title of the book.
            book_file = service.files().get(fileId=book_id).execute()
            log.info('book_file: %s' % book_file)
            book_title = book_file['title']
            artifact_titles['book'] = book_title    
            book_title = book_title.lower().strip()
            # Get the list of lessons and chapters in the book.           
            param = {'q': 'trashed=false'} # Do not include trashed documents.            
            documents = self.getDocsFromFolder(service, book_id, param, sort_by='title')
            chapter_index = lesson_index = 1
            for doc in documents:
                # Process chapters
                if doc['mimeType'] == FOLDER_TYPE:
                    # Prepare chapter title and file.
                    chapter_id = doc['id']
                    chapter_title = doc['title']
                    chapter_part = str(chapter_index).rjust(3, '0')
                    chapter_dir = '%s/%s' % (working_dir, 'chapter_%s' % chapter_part )
                    if not os.path.exists(chapter_dir):
                        os.mkdir(chapter_dir)
                    artifact_titles[chapter_dir] = chapter_title
                    chapter_title = chapter_title.lower().strip() 
                    # Get the list of lessons inside chapter.       
                    param = {'q': "mimeType='%s' and trashed=false" % DOCUMENT_TYPE}
                    lessons = self.getDocsFromFolder(service, chapter_id, param, sort_by='title')
                    ch_lesson_index = 1
                    for lesson in lessons:
                        ch_lesson_id = lesson['id'] 
                        ch_lesson_title = lesson['title']
                        # Check for chapter content.
                        if chapter_title == ch_lesson_title.lower().strip():
                            ch_lesson_file = '%s/chapter_content.zip' % chapter_dir
                        else:
                            ch_lesson_part = str(ch_lesson_index).rjust(3, '0')
                            ch_lesson_file = '%s/%s' % (chapter_dir, 'lesson_%s.zip' % ch_lesson_part )
                            ch_lesson_index = ch_lesson_index + 1    
                        artifact_titles[ch_lesson_file] = ch_lesson_title
                        downloadList.append((ch_lesson_file,ch_lesson_id ))
                    chapter_index = chapter_index + 1
                else:
                    # Process lessson directly under book.
                    lesson_title = doc['title']
                    lesson_id = doc['id']
                    # Check for chapter contents.
                    if book_title == lesson_title.lower().strip():
                        lesson_file = '%s/book_content.zip' % working_dir
                    else:
                        lesson_part = str(lesson_index).rjust(3, '0')
                        lesson_file = '%s/%s' % (working_dir, 'lesson_%s.zip' % lesson_part )
                        lesson_index = lesson_index + 1
                    artifact_titles[lesson_file] = lesson_title
                    downloadList.append((lesson_file,lesson_id ))
                    
            # Update the artifact titles.
            artifact_title_file = '%s/%s' % (working_dir, 'artifact_titles')
            artifact_titles = json.dumps(artifact_titles)
            f = open(artifact_title_file, 'w')
            f.write(artifact_titles)
            f.close()

            for data in downloadList:
                self.download(data[0], docID=data[1])
        except Exception, e:
            log.error("Cannot download collection id: %s" % self.docid, exc_info=e)
            raise Exception((_(u'Cannot download collection id: %(self.docid)s')  % {"self.docid":self.docid}).encode("utf-8"))

    def getGoogService(self):
        """
        """
        credentials = AccessTokenCredentials(self.googleAuthToken, 'ck12-user-agent/1.0')
        http = httplib2.Http()
        if credentials.invalid or credentials.access_token_expired:
            log.info("Google Doc credentials expired. Access Token: %s" % self.googleAuthToken)
            raise Exception("Google Doc credentials expired.")
        http = credentials.authorize(http)
        service = build('drive', 'v2', http=http)
        return service

    def downloadImagesFromHTML(self, service, htmlData, toFile):
        """
        """
        srcList = []   
        # Get all the image tags
        imgpat = re.compile('<img.*?>')
        # Get only the images that are coming from Google Server.
        srcpat = re.compile('src="https://lh\d+\.googleusercontent\.com.*?"')

        imgList = imgpat.findall(htmlData)
        for img in imgList:
            tmpSrc = srcpat.findall(img)
            if tmpSrc:
                src = tmpSrc[0].replace('src=','').replace('"', '')
                log.info('Found Google Image, src:%s' % src)
                srcList.append(src)
        counter = 0
        imgList = []
        imz = InMemoryZip()
        log.info('Image Count :: %s' % len(srcList))
        pat = re.compile('filename="(.*?)"')
        for srcURL in srcList:
            try:
                log.info('Downloading Image:%s' % srcURL)
                fp = urlopen(srcURL)
                content = fp.read()
                try:
                    despData = fp.headers['Content-Disposition']
                    names = pat.findall(despData)
                    ext = names[0].split('.')[1]
                except:
                    ext = ''

                imgName = 'img%s' % str(counter)
                if ext:        
                    imgName = "%s.%s" % (imgName, ext) 
                imz.append(imgName, content)
                imgList.append((imgName, srcURL))
                counter += 1            
            except Exception as e:
                log.info("Unable to download image, Error: %s" % str(e))

        log.info("Download Images info : %s" % imgList)
        for imgInfo in imgList:
            htmlData = htmlData.replace(imgInfo[1], imgInfo[0])

        imz.append("gdoc.html", htmlData)
        imz.writetofile(toFile)
            
    def getDocsFromFolder(self, service, folder_id, params, sort_by=None):
        """
        Returns the documents inside folder.
        """
        childrens = service.children().list(folderId=folder_id, **params).execute()
        documents = []
        for child in childrens.get('items', []):
            child_file = service.files().get(fileId=child['id'], fields=DOC_FIELDS).execute()
            log.info('child_file: %s' % child_file)
            documents.append(child_file)
        if sort_by:
            documents = sorted(documents, key=lambda lesson:lesson.get(sort_by,''))
        return documents
