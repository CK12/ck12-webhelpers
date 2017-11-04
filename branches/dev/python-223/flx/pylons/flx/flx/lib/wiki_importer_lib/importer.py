'''
This is the wiki importer base class for loading 2.0 data from wiki.
This class  contains the common code that is used by the 2 subclasses
'''
import os, random, hashlib, re
from xml.dom import minidom
import urllib
import urllib2
import codecs
import traceback
import shutil
from datetime import datetime

from flx.lib.unicode_util import UnicodeWriter
import flx.lib.helpers as h
from flx.model.model import title2Handle

from wiki_extractor import CK12WikiExtractor
from translator import CK12Translator
from api_manager import APIManager
import logging
import settings
import Image

#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)
#logging.basicConfig(filename=settings.LOG_FILENAME)

FLX_PREFIX = settings.FLX_PREFIX 

SUBJECTS = {
    'MAT': 'mathematics',
    'SCI': 'science',
    'ENG': 'engineering',
    'TEC': 'technology',
    'MAT.ARI': 'arithmetic',
    'MAT.MEA': 'measurement',
    'MAT.ALG': 'algebra',
    'MAT.ALY': 'analysis',
    'MAT.GEO': 'geometry',
    'MAT.ADV': 'advanced algebra',
    'MAT.TRI': 'trigonometry',
    'MAT.PRB': 'probability',
    'MAT.STA': 'statistics',
    'MAT.CAL': 'calculus',
    'MAT.LOG': 'logic',
    'MAT.GRH': 'graphing',
    'SCI.BIO': 'biology',
    'SCI.CHE': 'chemistry',
    'SCI.ESC': 'earth science',
    'SCI.LSC': 'life science',
    'SCI.PHY': 'physics',
    'SCI.PSC': 'physical science',
    }

class WikiImporterBase(object):

    def __init__(self):
        self.wikiurl = None
        self.wiki_extractor = CK12WikiExtractor()
        self.translator = CK12Translator()
        from flx.lib.helpers import load_pylons_config
        self.config = load_pylons_config()
        self.subjectEIDs = {}
        for k, v in SUBJECTS.iteritems():
            self.subjectEIDs[v] = k
        self.api_manager = APIManager(config=self.config)

    def setLogger(self, logger):
        self.log = logger
        self.wiki_extractor.setLogger(self.log)
        self.translator.setLogger(self.log)
        self.api_manager.setLogger(self.log)

    def create_working_location(self):
        self.working_dir = self.working_dir + hashlib.md5(random.random().__str__()).hexdigest()
        if not os.path.exists(self.working_dir):
            os.mkdir(self.working_dir)

        self.browse_term_csv_path = self.working_dir + "/" + self.browse_term_csv_path
        self.state_standard_csv_path = self.working_dir + "/" + self.state_standard_csv_path

        return self.working_dir

    def import_from_wiki(self, _wikiurl, user_id, workdir=None, is_metadata_mode=False, concept_mode=False, hasZipFile=False):
        self.user_id = user_id
        try:
            self.is_metadata_mode = eval(str(is_metadata_mode))
        except Exception as e:
            self.is_metadata_mode = False
        importer_response = {}
        importer_response['success'] = False
        importer_response['user_id'] = user_id
        importer_response['metadata_mode'] = str(self.is_metadata_mode)
        importer_response['import_mode'] = 'concept' if concept_mode else 'section'

        if _wikiurl.strip() == '':
            print "Wiki URL cannot be empty"
            return importer_response
            
        if workdir is None:
            _working_dir = self.create_working_location()
        else:
            _working_dir = workdir
        importer_response['working_dir'] = _working_dir

        #self.log.info("Importing wiki content from: %s for user: %s in: %s" %(_wikiurl, user_id, _working_dir))
      
        self.log.info("Calling wiki extractor with concept_mode=%s" % concept_mode)
        self.wikiurl = _wikiurl
        importer_response['wiki_url'] = self.wikiurl
        self.log.info("Wiki url: %s" % self.wikiurl)
        importer_response['success'] = self.wiki_extractor.import_from_wiki_to_dir(_wikiurl, _working_dir, concept_mode=concept_mode, is_metadata_mode=self.is_metadata_mode)
        if hasZipFile == True and importer_response['success'] == True:
            #
            #  Extract and process zip file.
            #
            files = os.walk(_working_dir).next()[2]
            zipFilePath = None
            if not files == []: 
                for each in files:
                    self.log.info(each)
                    if each.lower().endswith('.zip'):
                        zipFilePath = _working_dir + each
                        break
            self.log.info('Zip File Path: [%s]' %(zipFilePath))
            if zipFilePath:
                from zipfile import ZipFile

                zf = ZipFile(zipFilePath)
                try:
                    ZipFile.extractall(zf, _working_dir)
                    importer_response['working_dir'] = zipFilePath.replace('.zip','')
                    self.log.info('new working dir: [%s]' %(importer_response['working_dir']))
                finally:
                    zf.close()
        return importer_response

    def get_artifact_type(self, artifact_node):
        artifact_type = None
        try:
            artifact_type = artifact_node.getElementsByTagName('property:Artifact_Type')[0].firstChild.data
            self.log.info('artifact_type: [%s]' %(artifact_type))
        except:
            pass
        return artifact_type

    def parseGrades(self, grades):
        """
            Parse the grades and look for ranges
        """
        gradeList = []
        for grade in grades:
            try:
                if "-" in grade:
                    gradeParts = grade.split('-',1)
                    if gradeParts and len(gradeParts) > 1:
                        gs = int(gradeParts[0].strip())
                        ge = int(gradeParts[1].strip())
                        gradeList.extend(range(gs, ge+1))
                elif "," in grade:
                    gradeParts = grade.split(',')
                    for g in gradeParts:
                        gradeList.append(int(g))
                else:
                    gradeList.append(int(grade))
            except Exception as e:
                self.log.warn("Error parsing grades: %s" % str(e))
        if gradeList:
            gradeList = [ str(x) for x in gradeList ]
            self.log.info("Returning gradeList: %s" % gradeList)
            return gradeList
        self.log.info("Grades: %s" % grades)
        return grades

    def new_fetch_info(self, artifact_node):
        artifact_info = {}

        # Explicit control of reindex and cache generation
        artifact_info['reindex'] = 'True'
        artifact_info['cache_math'] = 'True'
        artifact_info['subjects'] = []
        artifact_info['search_terms'] = []
        

        try:
            artifact_info['title'] = artifact_node.getElementsByTagName('property:Title')[0].firstChild.data
        except:
            artifact_info['title'] = '' 

        try:
            if artifact_info['title'].strip() == '':
                artifact_info['title'] = artifact_node.getElementsByTagName('rdfs:label')[0].lastChild.data
        except Exception as e:
            artifact_info['title'] = ''

        try:
            artifact_info['handle'] = artifact_node.getElementsByTagName('property:Artifact_Handle')[0].firstChild.data.strip()
            if not artifact_info['handle']:
                artifact_info['handle'] = title2Handle(artifact_info['title'])
            else:
                artifact_info['handle'] = title2Handle(artifact_info['handle'])
            self.log.info("Found artifact handle specified: %s" % artifact_info['handle'])
        except Exception as e:
            pass
        if artifact_info.has_key('handle') and not artifact_info['handle']:
            del artifact_info['handle']

        try:
            artifact_info['desc'] = artifact_node.getElementsByTagName('property:Description')[0].firstChild.data
        except:
            artifact_info['desc'] = '' 

        try:
            artifact_info['licenseName'] = artifact_node.getElementsByTagName('property:License')[0].firstChild.data
        except:
            artifact_info['licenseName'] = '' 

        artifact_info['book_type'] = 'book'
        artifact_type = ''
        try:
            artifact_type = artifact_node.getElementsByTagName('property:Artifact_Type')[0].firstChild.data
            artifact_info['book_type'] = artifact_node.getElementsByTagName('property:Type')[0].firstChild.data
        except:
            pass
        ## Check if the book is a teacher edition
        if 'teacher' in artifact_info['book_type'].lower():
            artifact_info['book_type'] = 'tebook'
        elif 'workbook' in artifact_info['book_type'].lower():
            artifact_info['book_type'] = 'workbook'
        elif 'study guide' in artifact_info['book_type'].lower():
            artifact_info['book_type'] = 'studyguide'
        elif 'lab kit' in artifact_info['book_type'].lower():
            artifact_info['book_type'] = 'labkit'
        elif 'quiz' in artifact_info['book_type'].lower():
            artifact_info['book_type'] = 'quizbook'
        else:
            artifact_info['book_type'] = 'book'
        self.log.info('Book type is: %s' % artifact_info['book_type'])

        artifact_info['keyword_list'] = self.get_value_list(artifact_node, 'property:Keywords')
        artifact_info['grade_list'] = self.parseGrades(self.get_value_list(artifact_node, 'property:Grades'))
        artifact_info['search_terms'] = self.get_value_list(artifact_node, 'property:Search_Terms')
        artifact_info['state'] = self.get_value_list(artifact_node, 'property:States')
        artifact_info['subjects'] = self.get_value_list(artifact_node, 'property:Subjects')
        artifact_info['level'] = self.get_value_list(artifact_node, 'property:Level')
        artifact_info['related_eids'] = self.get_value_list(artifact_node, 'property:Related_EIDs')
        if artifact_info['search_terms']:
            artifact_info['search_terms'] = [x.strip() for x in artifact_info['search_terms'][0].split(';')]
        if artifact_info['subjects']:
            artifact_info['subjects'] = [ x.strip().lower() for x in artifact_info['subjects'] ]

        artifact_info['author_details'] = self.new_get_author_details(artifact_node)
        artifact_info['categories'] = []
        self.log.info("Artifact type in get_info: [%s]" % artifact_type)
        encoded_id = self.new_get_encoded_id(artifact_node, artifact_type)
        if encoded_id['full'] and encoded_id['shortened']:
            artifact_info['encoded_id'] = encoded_id['full']
            artifact_info['shortened_encoded_id'] = encoded_id['shortened']
            if encoded_id['full'] != '':
                artifact_info['keyword_list'].append(artifact_info['encoded_id'])
            parts = encoded_id['full'].upper().split('.')
            if artifact_type in ['book', 'chapter', 'section']:
                artifact_info['shortened_encoded_id'] = ''
                if len(parts) > 1:
                    artifact_info['subjects'].append(SUBJECTS.get(parts[1], ''))
                if len(parts) > 2:
                    artifact_info['subjects'].append(SUBJECTS.get('.'.join(parts[1:3]), ''))
                for s in artifact_info['subjects']:
                    if s:
                        if self.subjectEIDs.has_key(s):
                            if len(artifact_info['shortened_encoded_id']) <= len(self.subjectEIDs.get(s, '')):
                                artifact_info['shortened_encoded_id'] = self.subjectEIDs.get(s)
            elif artifact_type in ['lesson', 'concept']:
                if len(parts) > 0:
                    artifact_info['subjects'].append(SUBJECTS.get(parts[0], ''))
                if len(parts) > 1:
                    artifact_info['subjects'].append(SUBJECTS.get('.'.join(parts[0:2]), ''))
            self.log.info("Encoded_ID: %s, Subjects: %s" % (encoded_id['full'], artifact_info['subjects']))
        else:
            artifact_info['encoded_id'] = None
            artifact_info['shortened_encoded_id'] = None

        cover_image_url = None
        try:
            cover_image_resolver =  artifact_node.getElementsByTagName('property:Cover_image')[0].getAttribute('rdf:resource')
            if len(cover_image_resolver.split('Http-3A')) > 0:
                cover_image_url = "http:%s"%cover_image_resolver.split('Http-3A')[1]
            elif len(cover_image_resolver.split('Https-3A')) > 0:
                cover_image_url = "https:%s"%cover_image_resolver.split('Https-3A')[1]
            self.log.info("Cover image url: %s" % cover_image_url)
            artifact_info['cover_image'] = self.downloadImage(cover_image_url)
            self.log.info("Got cover image: %s" % artifact_info['cover_image'])
            try:
                Image.open(artifact_info['cover_image'])
            except Exception, ie:
                self.log.error("Cannot open downloaded image file: %s. No cover image for this artifact." % artifact_info['cover_image'], exc_info=ie)
                artifact_info['cover_image'] = None
        except Exception, e:
            self.log.error("Error message: %s" %(e.__str__()))
            self.log.error("Error getting cover image: %s. We will use the default image." % cover_image_url)
            artifact_info['cover_image'] = None

        return artifact_info

    def replace_chapter_toc(self, html_content):
        try:
            toc_re = re.compile('<h2 id="x-ck12-Q2hhcHRlcnM.">.*?Chapters.*?</h2>.*?(<ul>.*?</ul>)',re.DOTALL)
            toc = toc_re.findall(html_content)
            if toc:
                toc = toc[0]
                chapter_toc_placeholder = '<div class="x-ck12-data-chapter">\n<!--\n    <chapters />\n-->\n</div>'
                html_content = html_content.replace(toc, chapter_toc_placeholder)
        except Exception as e:
            self.log.error('Error: replace_chapter_toc: %s'%e.__str__())
        return html_content

    def build_browse_term_category_csv(self, artifact_id, category_name, domain, parent, encodedID = None, traceback={}):
        if domain == 'domain' and not self.api_manager.is_domain_present(category_name.strip()):
            self.api_manager.updateTaskUserData(traceback.get('taskID'), updateDict={'message': 'Invalid domain found: %s'%category_name, 'status':'Failed', 'traceback': traceback.get('info')})
            raise Exception('Invalid domain found: %s'%category_name)
        file_obj = None
        if not os.path.exists(self.browse_term_csv_path):
            file_obj = open(self.browse_term_csv_path,"w")
            self.browse_term_csv_writer = UnicodeWriter(file_obj)
            self.browse_term_csv_writer.writerow(['artifactID','browseTerm','browseTermType','browseTermParent','encodedID'])
        else:
            file_obj = open(self.browse_term_csv_path,"a")
            self.browse_term_csv_writer = UnicodeWriter(file_obj)
 
        self.log.info(parent)
        bt_row = list()
        bt_row.append(artifact_id)
        bt_row.append(category_name)

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

    def build_browse_term_csv(self, artifact_id, keyword_list, domain, parent, encodedID = None, traceback={}):

        self.log.info("Adding browse terms to CSV, artifactID: %d, termType: %s, terms: %s" % (artifact_id, domain, keyword_list))
        file_obj = None

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
            if domain == 'domain' and not self.api_manager.is_domain_present(each.strip()):
                self.api_manager.updateTaskUserData(traceback.get('taskID'), updateDict={'message': 'Invalid domain found: %s'%each, 'status':'Failed', 'traceback': traceback.get('info')})
                raise Exception('Invalid domain found: %s'%each)
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

    def is_artifact_type(self, node, artifact_type):
        class_elements = node.getElementsByTagName('owl:Class')
        result = False
        try: 
            for each in class_elements:
                label = each.getElementsByTagName('rdfs:label')[0].firstChild.data
                if label.lower() == artifact_type.lower():
                    result = True
                    break
        except Exception as e:
            result = False

        if not result:
            result = (str(node.tagName).lower() == artifact_type.lower())
        return result

    def downloadImageFromWikiFile(self, wiki_fileinfo_url):
        self.log.info('Downloading image from Wiki FileInfo url: %s' %(wiki_fileinfo_url))
        wiki_url = wiki_fileinfo_url.split('wiki')[0]
        highResCoverImageName = wiki_fileinfo_url.split('/')[-1].split(':')[1]
        downloadDirectory = '/tmp/cover_images'
        if not os.path.exists(downloadDirectory):
            os.mkdir(downloadDirectory)
        req = urllib2.Request(wiki_fileinfo_url, headers={'User-Agent' : "CK12 Browser"})
        f = urllib2.urlopen(req)
        if f.code == 200:
            content = f.read()
            reObj = re.compile('<a href="(.*?)" class="internal" title="(.*?)">Full resolution</a>')
            downloadUri = reObj.findall(content)[0][0]
            downloadPath = downloadDirectory + '/' + highResCoverImageName
            self.log.info('Downloading: %s into %s' %(wiki_url + downloadUri, downloadPath))
            urllib.urlretrieve(wiki_url + downloadUri, downloadPath)
            self.log.info('Downloaded cover image to: %s' %(downloadPath))
            return downloadPath
        else:
            self.log.info('Full resolution cover image does not exist. Skipping...')
            return None

    def downloadImage(self, cover_image_url):
        ## Bug in wiki plugin for ExportRDF: '-' in image name is converted to '-2D'
        ## Convert it back (bug: 9413)
        cover_image_url = cover_image_url.replace('-2D', '-')
        self.log.info('Downloading cover image from url: %s' %(cover_image_url))
        if cover_image_url.lower().startswith('http'):
            if (cover_image_url.find('File:') > 0 or cover_image_url.find('File-3A') > 0):
                cover_image_url = cover_image_url.replace('File-3A', 'File:')
                return self.downloadImageFromWikiFile(cover_image_url)

            fname = os.path.join(self.working_dir, os.path.basename(cover_image_url))
            try:
                urllib.urlretrieve(cover_image_url, fname)
                return fname
            except Exception, e:
                cover_image_url = None
                self.log.error("Error downloading cover image: %s" % cover_image_url, exc_info=e)
        return cover_image_url

    def new_get_encoded_id(self, node, artifact_type):
        encoded_id = {}
        encoded_id['full'] = ''
        encoded_id['shortened'] = ''
        if artifact_type.lower() == 'concept':
            splitter = ['.C.']
        if artifact_type.lower() == 'lesson':
            splitter = ['.L.']
        if artifact_type.lower() in ['book', 'tebook', 'workbook', 'quizbook', 'labkit', 'studyguide', 'chapter']:
            splitter = ['.SE.','.TE.', '.WB.', '.QB.', 'LK', 'SG']

        try:
            enc_ids = self.get_value_list(node, 'property:Encoded_ID')
            is_split_done = False
            for each_enc_id in enc_ids:
               for each_splitter in splitter:
                   if each_enc_id.__contains__(each_splitter): 
                       encoded_id_parts = each_enc_id.split('.')
                       if len(encoded_id_parts) == 6 and encoded_id_parts[3] == '0':
                           encoded_id_parts.pop(3)
                           each_enc_id = ".".join(encoded_id_parts)

                       encoded_id['full'] = each_enc_id
                       encoded_id['shortened'] = each_enc_id.split(each_splitter)[0]
                       is_split_done = True
                       break
               if is_split_done:
                   break
        except Exception as e:
            self.log.error('GET_ENCODED_ID: Exception: %s'% (e.__str__()))

        return encoded_id
        
    def deduce_metadata_format(self, node):
        value_list = self.get_value_list(node, 'property:Artifact_Type')
        if value_list:
            self.log.info("metadata_format: New")
            return True
        else:
            self.log.info("metadata_format: Old")
            return False
        
    def get_value_list(self, node, key):
        value_list = []
        try:
            value_node_list = node.getElementsByTagName(key)
            for each in value_node_list:
                value_list.append(each.childNodes[0].data)
            return value_list
        except:
            self.log.info('Key Error: '+key)
            return value_list

    def get_categories(self, node):
        CATEGORY_NODE = 'property:Category_Node_2'
        CATEGORY_NAME = 'swivt:value3'
        CATEGORY_PARENT = 'swivt:value2'
        CATEGORY_CHILD = 'swivt:value1'
        
        categories = []
   
        try:
            category_containers = node.getElementsByTagName(CATEGORY_NODE)
            each_category = {}
            for each_container in category_containers:
                each_category['category_name'] = each_container.getElementsByTagName(CATEGORY_NAME)[0].childNodes[0].data
                each_category['category_parent'] = each_container.getElementsByTagName(CATEGORY_PARENT)[0].childNodes[0].data
                each_category['category_child'] = each_container.getElementsByTagName(CATEGORY_CHILD)[0].childNodes[0].data
                categories.append(each_category)
                each_category = {}
        except Exception as e:
            self.log.warning("Error while fetching categories[%s]" % e) 
        return categories

    def new_get_author_details(self, node):
        author_details_list = []
        try:
            author_full_list = node.getElementsByTagName('property:Authors')[0].firstChild.data.strip().split(';')
            for author_container in author_full_list:
                author_details = {}
                author_details['type'] = author_container.split(':')[0]
                if author_details['type']:
                    author_details['type'] = author_details['type'].strip()
                author_details['readable_name'] = author_container.split(':')[1]
                if author_details['readable_name']:
                    author_details['readable_name'] = author_details['readable_name'].strip()
                    author_details['givenName'] = author_details['readable_name']
                author_details_list.append(author_details)
        except Exception as e:
            pass
        self.log.info('AUTHORSLIST FOUND: %s' % author_details_list)
        return author_details_list
                    
         

    def get_author_details(self, node):

        AUTHOR_FIRST_NAME = "swivt:value1"      # givenName
        AUTHOR_MIDDLE_NAME = "swivt:value2"     # middleName
        AUTHOR_LAST_NAME = "swivt:value3"       # surname
        AUTHOR_TITLE = "swivt:value4"           # ignore
        AUTHOR_AFFILIATION = "swivt:value5"     # ignore
        AUTHOR_EMAIL = "swivt:value6"           # email
        AUTHOR_ID = "swivt:value7"              # ignore
        AUTHOR_TYPE = "swivt:value8"            # -> roleID
        AUTHOR_URL = "swivt:value9"             # url
        AUTHOR_ORGANIZATION = "swivt:value10"   # institution
        AUTHOR_PREFIX = "swivt:value11"         # prefix
        AUTHOR_SUFFIX = "swivt:value12"         # suffix
 
        author_details_list = {}
   
        try:
            for author_node in node.getElementsByTagName('property:Author'):
                author_detail_container = author_node.getElementsByTagName('swivt:Container')[0]
                author_details = {}
                author_details['first_name'] = ''
                author_details['middle_name'] = ''
                author_details['last_name'] = ''
                author_details['title'] = ''
                author_details['affiliation'] = ''
                author_details['id'] = ''
                author_details['email'] = ''
                author_details['type'] = ''
                author_details['url'] = ''
                author_details['organization'] = ''
                author_details['prefix'] = ''
                author_details['suffix'] = ''

                if  author_detail_container.getElementsByTagName(AUTHOR_FIRST_NAME):
                    if  author_detail_container.getElementsByTagName(AUTHOR_FIRST_NAME)[0].childNodes:
                        author_details['first_name'] = author_detail_container.getElementsByTagName(AUTHOR_FIRST_NAME)[0].childNodes[0].data.replace('""','')
                        author_details['givenName'] =  author_details['first_name']

                if  author_detail_container.getElementsByTagName(AUTHOR_MIDDLE_NAME):
                    if  author_detail_container.getElementsByTagName(AUTHOR_MIDDLE_NAME)[0].childNodes:
                        author_details['middle_name'] = author_detail_container.getElementsByTagName(AUTHOR_MIDDLE_NAME)[0].childNodes[0].data.replace('""','')
                        author_details['middleName'] =  author_details['middle_name']

                if  author_detail_container.getElementsByTagName(AUTHOR_LAST_NAME):
                    if  author_detail_container.getElementsByTagName(AUTHOR_LAST_NAME)[0].childNodes:
                        author_details['last_name'] = author_detail_container.getElementsByTagName(AUTHOR_LAST_NAME)[0].childNodes[0].data.replace('""','')
                        author_details['surname'] =  author_details['last_name']

                if  author_detail_container.getElementsByTagName(AUTHOR_TITLE):
                    if  author_detail_container.getElementsByTagName(AUTHOR_TITLE)[0].childNodes:
                        author_details['title'] = author_detail_container.getElementsByTagName(AUTHOR_TITLE)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_AFFILIATION):
                    if  author_detail_container.getElementsByTagName(AUTHOR_AFFILIATION)[0].childNodes:
                        author_details['affiliation'] = author_detail_container.getElementsByTagName(AUTHOR_AFFILIATION)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_ID):
                    if  author_detail_container.getElementsByTagName(AUTHOR_ID)[0].childNodes:
                        author_details['id'] = author_detail_container.getElementsByTagName(AUTHOR_ID)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_EMAIL):
                    if  author_detail_container.getElementsByTagName(AUTHOR_EMAIL)[0].childNodes:
                        author_details['email'] = author_detail_container.getElementsByTagName(AUTHOR_EMAIL)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_TYPE):
                    if  author_detail_container.getElementsByTagName(AUTHOR_TYPE)[0].childNodes:
                        author_details['type'] = author_detail_container.getElementsByTagName(AUTHOR_TYPE)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_ORGANIZATION):
                    if  author_detail_container.getElementsByTagName(AUTHOR_ORGANIZATION)[0].childNodes:
                        author_details['organization'] = author_detail_container.getElementsByTagName(AUTHOR_ORGANIZATION)[0].childNodes[0].data.replace('""','')
                        author_details['institution'] =  author_details['organization']

                if  author_detail_container.getElementsByTagName(AUTHOR_URL):
                    if  author_detail_container.getElementsByTagName(AUTHOR_URL)[0].childNodes:
                        author_details['url'] = author_detail_container.getElementsByTagName(AUTHOR_URL)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_PREFIX):
                    if  author_detail_container.getElementsByTagName(AUTHOR_PREFIX)[0].childNodes:
                        author_details['prefix'] = author_detail_container.getElementsByTagName(AUTHOR_PREFIX)[0].childNodes[0].data.replace('""','')

                if  author_detail_container.getElementsByTagName(AUTHOR_SUFFIX):
                    if  author_detail_container.getElementsByTagName(AUTHOR_SUFFIX)[0].childNodes:
                        author_details['suffix'] = author_detail_container.getElementsByTagName(AUTHOR_SUFFIX)[0].childNodes[0].data.replace('""','')

                author_details['readable_name'] = "%s %s %s %s %s" % (author_details['prefix'],author_details['first_name'],author_details['middle_name'],author_details['last_name'],author_details['suffix'])

                author_details['readable_name'] = author_details['readable_name'].strip()
                if author_details['readable_name'] == '':
                    org = author_details.get('organization')
                    if org:
                        author_details['readable_name'] = org.strip()
                if author_details['type'].lower() == 'source':
                    author_details['readable_name'] = author_details['url']
                author_details['givenName'] = author_details['readable_name']
                author_details_list[author_details['readable_name']] = author_details
        except Exception as e:
            self.log.error(e.__str__())

        return author_details_list.values()

    def get_content(self, file_path):
        content = ''
        try:
            file_handler = codecs.open(file_path, 'r', 'utf-8')
            content = file_handler.read()
            file_handler.close()
        except Exception as e:
            content = ''
        return content

    def process_external_images(self, base_dir, xhtml_content):
        img_re = re.compile('<img .*?src=\W*"(.*?)"', re.DOTALL)
        img_srcs = img_re.findall(xhtml_content.replace('\n',''))

        for each_src in img_srcs:
            try:
                if not each_src.startswith(base_dir.replace(os.path.basename(base_dir),'')):
                    self.log.info('Already internal: '+ each_src)
                    if each_src.find('math/inline') > 0 and each_src.find('localhost') > 0:
                        new_src = each_src.replace(settings.OLD_INLINE_MATH_PREFIX, settings.NEW_INLINE_MATH_PREFIX)
                        self.log.info('New math image location: %s' %(new_src))
                        xhtml_content = xhtml_content.replace(each_src,new_src)
                    if each_src.find('math/block') > 0 and each_src.find('localhost') > 0:
                        new_src = each_src.replace(settings.OLD_BLOCK_MATH_PREFIX, settings.NEW_BLOCK_MATH_PREFIX)
                        xhtml_content = xhtml_content.replace(each_src,new_src)
                    continue
                self.log.info('Processing: '+ each_src)
                internal_url,resource_id = self.api_manager.create_resource_int(each_src, self.user_id)
                if each_src and internal_url == each_src:
                    ## Try to duplicate the image and save again.
                    timestamp = datetime.now().strftime("%Y%m%d%s%f")
                    new_file_loc = '%s-%s%s'%(os.path.splitext(each_src)[0],timestamp,os.path.splitext(each_src)[1])
                    shutil.copy(each_src,new_file_loc)
                    internal_url,resource_id = self.api_manager.create_resource_int(new_file_loc, self.user_id)
                self.log.info('New image location: '+ str(internal_url))
                self.all_image_paths[internal_url] = "%s"%(each_src)
                xhtml_content = xhtml_content.replace(each_src, internal_url)
            except Exception as e:
                self.log.info('Process external Images: %s:%s '%(each_src,e.__str__()) )
        div_re = re.compile('<div.*?/div>',re.DOTALL)
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
                continue
        return xhtml_content

    def get_comments(self, html_sting):
        re_comments = re.compile('<!--(.*?)-->', re.DOTALL)
        allComments = re_comments.findall(html_sting)
        return allComments

    def get_values_from_comment(self, comment):
        re_attribute = re.compile('@@(.*?)[ ]*=[ ]*"(.*)"', re.DOTALL)
        key, value = re_attribute.findall(comment)[0]
        return key, value

    def create_embedded_objects(self, xhtml_content, user_id):
        """
            Create all embedded objects internally
        """
        #iframe_re = re.compile(r'[^"](<iframe.*?"[ ]*--></iframe>)', re.DOTALL)
        iframe_re = re.compile('<iframe.*?</iframe>', re.DOTALL)
        all_iframes = iframe_re.findall(xhtml_content)
        embeddable_re = re.compile('(<!-- @@embeddable="(.*?)" -->)', re.DOTALL)
        author_re = re.compile('<!-- @@author="(.*?)" -->', re.DOTALL)
        license_re = re.compile('<!-- @@license="(.*?)" -->', re.DOTALL)
        class_re = re.compile('class="(.*?)[\W|,].*?"')
        title_re = re.compile('title="(.*?)"')
        name_re = re.compile('name="(.*?)"')
        desc_re = re.compile('longdesc="(.*?)"')
        width_re = re.compile('width="(.*?)"')
        height_re = re.compile('height="(.*?)"')
        src_re = re.compile('src="(.*?)"')
        frameborder_re = re.compile('frameborder="(.*?)"')
        #flashvars_re = re.compile('flashvars=".*?"')
        name_re = re.compile('name="(.*?)"')
        id_re = re.compile('id="(.*?)"')
        #url_re = re.compile(r'http[s]://[^ ]*', re.I)
        self.log.info("All iframes: %s" % str(all_iframes))
        for each_iframe in all_iframes:
            self.log.info('Processing iframe: %s' %(each_iframe))
            new_iframe = each_iframe
            embeddable = embeddable_re.findall(each_iframe)
            if not embeddable:
                continue
            else:
                embeddable = embeddable[0][1]
            try:
                old_embeddable = embeddable
                embeddable = h.genURLSafeBase64Decode(old_embeddable, hasPrefix=False)
            except Exception as e:
                pass
            #embeddable_src = embeddable_re.findall(each_iframe)[0][0]
            author = author_re.findall(each_iframe)[0]
            license = license_re.findall(each_iframe)[0]
            try:
                className = class_re.findall(each_iframe)[0]
            except Exception as e:
                className = "x-ck12-nofloat"
            try:
                title = title_re.findall(each_iframe)[0]
                if str(title) == "None":
                    title = ""
            except Exception as e:
                title = ""
            try:
                name = name_re.findall(each_iframe)[0]
                if str(name) == "None":
                    name = ""
            except Exception as e:
                name = ""
            try:
                desc = desc_re.findall(each_iframe)[0]
                if str(desc) == "None":
                    desc = ""
            except Exception as e:
                desc = ""
            anchorID = id_re.findall(each_iframe)[0]
            #if width_re.findall(each_iframe):
            #    width = width_re.findall(each_iframe)[0]
            #if height_re.findall(each_iframe):
            #    height = height_re.findall(each_iframe)[0]
            try:
                frameborder = frameborder_re.findall(each_iframe)[0]
            except Exception as e:
                frameborder = "0"
            #flashvars = flashvars_re.findall(each_iframe)[0]
            src = src_re.findall(each_iframe)[0]

            embedInfo = {}
            embedInfo['embeddable'] = embeddable
            embedInfo['author'] = author
            embedInfo['license'] = license
            embedInfo['className'] = className
            embedInfo['title'] = title
            embedInfo['desc'] = desc
            embedInfo['anchorID'] = anchorID
            embedInfo['width'] = None
            embedInfo['height'] = None
            embedInfo['frameborder'] = frameborder
            embedInfo['src'] = src
            embedInfo['name'] = name
            self.log.info('embedInfo: %s' %(embedInfo))

            post_code = True
            self.log.info('EMBEDDABLE: %s'%embeddable)
            try:
                decoded = self.api_manager.create_embedded_object(embedInfo, user_id, post_code)
                self.log.info('DECODED: %s'%decoded)
                if decoded:
                    self.log.info("Inserting iframe: %s" %(decoded.iframe))
                    xhtml_content = xhtml_content.replace(each_iframe, decoded.iframe)
            except Exception as eo_create_exception:
                self.log.error("Caught an exception in creatng embedded object: %s" %(eo_create_exception.__str__()))
                return xhtml_content
        return xhtml_content

    def process_embedded_objects(self, xhtml_content, user_id):
        """
            Process all embeddedobjects within the XHTML content.
        """
        internalIdRegex = re.compile(r' name="([0-9]+)"', re.IGNORECASE | re.DOTALL)
        srcRegex = re.compile(r' src="([^"]+)"', re.IGNORECASE)
        xhtml_content_ic = xhtml_content.lower()
        iframe_re = re.compile('(<iframe.*?</iframe>)', re.DOTALL)
        all_iframes = iframe_re.findall(xhtml_content)
        for iFrameCode in all_iframes:
            oldCodeLen = len(iFrameCode)
            oldiFrameCode = iFrameCode
            self.log.info('iFrameCode before sub: %s' % iFrameCode)
            m = internalIdRegex.search(iFrameCode)
            comment_attributes = {}
            allComments = self.get_comments(iFrameCode)
            for eachComment in allComments:
                key, value = self.get_values_from_comment(eachComment)
                comment_attributes[key] = value

            if m:
                internalID = int(m.group(1))
                info = self.api_manager.get_eo_info(eo_id=internalID)
                self.log.info("EO info: %s" % info)
                if not info.get('resource'):
                    resource_uri, resource_id = \
                                              self.api_manager.create_resource_int(info['url'],
                                                                              user_id,
                                                                              'video',
                                                                              info['url'],
                                                                              info['code'],
                                                                              comment_attributes.get('author'),
                                                                              comment_attributes.get('license'))
                    self.api_manager.associate_resource_with_eo(user_id, resource_id, eo_id=internalID)
                else:
                    resource_id = info['resource']['id']
                iFrameCode = srcRegex.sub(r' src="%s"' % self.api_manager.get_resource_perma(resourceID=resource_id), iFrameCode)
                ## Remove frame border
                iFrameCode = re.sub(r'[ ]*frameborder="[^"]*"', r' frameborder="0"', iFrameCode)
                ## set height and width
                if info.get('width'):
                    width = int(info.get('width'))
                    if 'width=' not in iFrameCode:
                        iFrameCode = re.sub(r'"[ ]*>', '" width="%d">' % width, iFrameCode)
                    else:
                        iFrameCode = re.sub(r'[ ]*width="[^"]*"', ' width="%d"' % width, iFrameCode)
                if info.get('height'):
                    height = int(info.get('height'))
                    if 'height=' not in iFrameCode:
                        iFrameCode = re.sub(r'"[ ]*>', '" height="%d">' % height, iFrameCode)
                    else:
                        iFrameCode = re.sub(r'[ ]*height="[^"]*"', ' height="%d"' % height, iFrameCode)
                self.log.info('iFrameCode after sub: %s' % iFrameCode)
                xhtml_content = xhtml_content.replace(oldiFrameCode, iFrameCode)
                newCodeLen = len(iFrameCode)

        object_re = re.compile('(<object.*?</object>)', re.DOTALL)
        all_objects = object_re.findall(xhtml_content)
        for objectCode in all_objects:
            oldObjectCode = objectCode
            self.log.info('objectCode before sub: %s' % objectCode)
            m = internalIdRegex.search(objectCode)
            if m:
                internalID = int(m.group(1))
                info = self.api_manager.get_eo_info(eo_id=internalID)
                if not info.get('resource') or not info.get('resource').get('id'):
                    resource_uri, resource_id = self.api_manager.create_resource_int(info['url'], user_id, 'video', info['url'], info['code'])
                    self.api_manager.associate_resource_with_eo(user_id, resource_id, eo_id=internalID)
                else:
                    resource_id = info['resource']['id']
                width = info.get('width')
                height = info.get('height')
                objectCode = '<iframe name="%d" src="%s" frameborder="0" width="%s" height="%s">%s</iframe>' % (internalID, self.api_manager.get_resource_perma(resourceID=resource_id), width, height, objectCode)
                self.log.info('objectCode after sub: %s' % objectCode)
                xhtml_content = xhtml_content.replace(oldObjectCode, objectCode)
                newCodeLen = len(objectCode)

        return xhtml_content

    def get_first_img_info(self, xhtml_content):
        actual_img_src = None
        try:
            img_re = re.compile('<img .*?src=\W*"(.*?)"', re.DOTALL)
            img_srcs = img_re.findall(xhtml_content.replace('\n',''))
            img_src = None
            for each in img_srcs: 
                if not each.lower().__contains__('/flx/math/'):
                    img_src = each
                    break
            
            actual_img_src = self.all_image_paths[img_src] 
        except Exception as e: 
            actual_img_src = None
        return actual_img_src

    def get_book_skeleton_xhtml(self):
        book_skeleton_xhtml = ""
        try:
            book_skeleton_xhtml = self.get_content(settings.BOOK_SKELETON_FILE)
        except Exception as e:
            book_skeleton_xhtml = ""
        return book_skeleton_xhtml

    def get_first_para_text(self, xhtml_content):
        p_text = ""
        
        try:
            p_re = re.compile('<p>(.*?)</p>', re.DOTALL)
            p = p_re.search(xhtml_content)
            p_text = p.group(0).replace("<p>","").replace("</p>","")
            
        except Exception as e: 
            p_text  = "Text.."
            
        return p_text

    def check_for_metadata_attributes(self, metadata_xml_file_path):
        xmldoc = minidom.parse(metadata_xml_file_path)
        head = xmldoc.documentElement
     
        artifact_type = ''
        artifact_wiki_url = ''
        for each in head.childNodes:
                try:
                    artifact_wiki_url = each.getElementsByTagName('swivt:Subject')[0].getElementsByTagName('swivt:page')[0].getAttribute('rdf:resource')
                except: 
                    pass
                if len(each.getElementsByTagName('property:Artifact_Type')) < 1:
                    raise Exception('Missing Artifact Type in the wiki: %s. Expected values: ["book", "chapter", "lesson", "application"]'%artifact_wiki_url)
        return True
    
    def make_duplicate(self, original_file_path):

        if not original_file_path:
            return None

        try:

            timestamp = datetime.now().strftime("%Y%m%d%s%f")
            duplicate_file_path = "%s/%s-%s"%(os.path.dirname(original_file_path),hashlib.md5(random.random().__str__()).hexdigest(), timestamp)
            duplicate_file_path = "%s%s"% (duplicate_file_path, os.path.splitext(original_file_path)[1])

            target = open(duplicate_file_path, 'w')
            source = open(original_file_path, 'r')

            target.write(source.read())

            source.close()
            target.close()
            self.log.info("Duplicate file path: %s" % duplicate_file_path)
            
            return duplicate_file_path

        except Exception as e:
            self.log.error("Error from make_duplicate", exc_info=e)
            return None


