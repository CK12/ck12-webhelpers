import urllib2
import os
from datetime import datetime
from PIL import Image
import re
from urlparse import urlparse
from pdf_generator_f2pdf import PdfGenerator as PdfGeneratorViaf2Pdf
import hashlib
import urllib
from shutil import copyfile
from Crypto.Cipher import AES
from BeautifulSoup import BeautifulSoup, Tag, NavigableString
import logging

import settings
from flx.model import api
import flx.lib.helpers as h

#Initialing Debugger
#logging.basicConfig(filename=settings.LOG_FILENAME,level=logging.DEBUG,)

def download_file(url, filepath):

    class MyHTTPRedirectHandler(urllib2.HTTPRedirectHandler):
        def http_error_302(self, req, fp, code, msg, headers):
            result = urlparse(headers['location'])
            if result.scheme == 'https':
                if '.cloudfront.net' in result.netloc:
                    headers['location'] = headers['location'].replace('https://', 'http://')
                elif 'interactives.ck12.org' in result.netloc:
                    headers['location'] = headers['location'].replace('https://', 'http://')
                    headers['location'] = headers['location'].replace('interactives.ck12.org', 'interactivescdn.ck12.org')
            return urllib2.HTTPRedirectHandler.http_error_302(self, req, fp, code, msg, headers)

        http_error_301 = http_error_303 = http_error_307 = http_error_302

    opener = urllib2.build_opener(MyHTTPRedirectHandler)
    urllib2.install_opener(opener)
    if 'https://interactives.ck12.org/' in url:
        url = url.replace('https://', 'http://')
        url = url.replace('interactives.ck12.org', 'interactivescdn.ck12.org')

    response = urllib2.urlopen(url)
    with open(filepath, 'wb') as fd:
        fd.write(response.read())

class CK12Pdf:
    def __init__(self):
        self.log = logging.getLogger(__name__)
        self.base_dir = settings.ROOT_WORK_DIR
        self.default_http_prefix = settings.DEFAULT_HTTP_PREFIX
        self._get_print_id();
        self.create_work_dir();
        self.chapter_no = 1
        self.meta = Metadata(self.work_dir)
        self.pdf_file = ''
        self.artifact_type = 'book'
        self.artifactHandle = ""
        self.template = None

    def setLogger(self, logger):
        self.log = logger

    def create_pdf_via_f2pdf(self):
         pdf_book = PdfGeneratorViaf2Pdf()
         pdf_book.setLogger(self.log)
         if not self.template or self.template not in settings.F2PDF_TEMPLATES:
             self.log.info('No template or invalid template specified. Defaulting to onecolumn template')
             self.template = 'onecolumn'
         pdf_path = pdf_book.createPDF(self.work_dir,settings.F2PDF_HOME,
                                       self.template, self.artifact_type )
         self.pdf_file = pdf_path
         #Remove all tmp files from the working directory
         if not settings.PDF_DEBUG_FLAG:
              self.removeTmpDirectories()
         return pdf_path, self.template
    
    #Returns work dir path
    def get_work_dir_path(self):
        return self.work_dir

    # Create working dir (use print_id as dir name)
    def create_work_dir(self):
        work_dir = self.base_dir + '/' + self.print_id
        self.log.info(work_dir)
        if mkdir(work_dir):
             self.work_dir = work_dir
             return True
        else:
             self.log.info("Could not create working directory")
             return False

    def removeTmpDirectories(self):
        rm_cmd = "cd "+self.work_dir+";find . ! -name '*.pdf' -delete";
        os.system(rm_cmd);

    # Saving XHTML chapter as xhtml file
    def save_chapter_xhtml(self,chapter):
        xhtml = chapter['xhtml']
        if self.chapter_no < 10:
            c_no = str('0'+str(self.chapter_no))
        else:
            c_no = str(self.chapter_no)
        file_name = 'chapter_'+c_no+'.xhtml'

        xhtml = self.refine_xhtml(xhtml)

        if not len(xhtml) == 0:
            result = self.save(xhtml,self.work_dir,file_name)
            self.log.info('In save_chapter_xhtml: %s' %(result))
            if not result == 0:
                self.chapter_no = self.chapter_no + 1
                return True
            else:
                return False
        else:
            self.log.info('Could not save the chapter')
            return False

    def extract_pdf_front_and_back_matter(self, xhtml):
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

    def save_front_matter(self, xhtml):
        file_name = 'frontmatter_'
        xhtml = xhtml.replace('h3','h2')
        xhtml = self.refine_xhtml(xhtml)
        count = 1
        chapters = []
        if not len(xhtml) == 0:
            chapters = self.make_front_back_matter_chapters(xhtml)
            for xhtml in chapters:
                result = self.save(xhtml,self.work_dir,file_name + str(count) + '.xhtml')
                if not result == 0:
                    count += 1
        else:
            self.log.info('No front matter to add')
            return False

    def save_back_matter(self, xhtml):
        file_name = 'backmatter_'
        xhtml = xhtml.replace('h3','h2')
        xhtml = self.refine_xhtml(xhtml)
        count = 1
        chapters = []
        if not len(xhtml) == 0:
            chapters = self.make_front_back_matter_chapters(xhtml)
            for xhtml in chapters:
                result = self.save(xhtml,self.work_dir,file_name + str(count) + '.xhtml')
                if not result == 0:
                    count += 1
        else:
            self.log.info('No back matter to add')
            return False

    def make_front_back_matter_chapters(self, xhtml):
        chapters = []
        html_head = '<html xmlns="http://www.w3.org/1999/xhtml"> \n<head> \n<title>'
        html_end = '</body>\n</html>'
        
        while 1:
            title = html_head
            h2_start = xhtml.find('<h2')
            temp_xhtml = xhtml[h2_start + 1 : ]
            m_title = temp_xhtml[temp_xhtml.find('>') + 1 : temp_xhtml.find('<') - 1]
            title += m_title + "</title>\n</head>\n<body>" 
            new_h2_start = temp_xhtml.find('<h2')
            if new_h2_start != -1 :
                chap = title + xhtml[h2_start:new_h2_start + h2_start] + html_end
            else:
                chap = title + xhtml[h2_start:] + html_end
            chapters.append(chap)
            xhtml = xhtml[new_h2_start:]
            len(xhtml)
            if new_h2_start == -1:
                break

        if not chapters:
            temp_xhtml = xhtml[xhtml.find('<h2') + 1 :]
            title = temp_xhtml[temp_xhtml.find('>') + 1 : temp_xhtml.find('<') - 1]
            html_head += title + "</title></head><body>" 
            chapters.append(html_head + xhtml + html_end)
        return chapters

    # Refine xhtml      
    def refine_xhtml(self,xhtml):
        xhtml = self.remove_broken_hrefs(xhtml)
        xhtml = self.copy_html_images(xhtml,self.work_dir,self.chapter_no)
        xhtml = self.process_ck12_embeds(xhtml)
        xhtml = self.removeC1(xhtml)
        xhtml = self.add_headers(xhtml)
        xhtml = self.remove_image_from_header(xhtml)
        return xhtml

    # Replace h3,h4,h5 headers with paragraph tags
    # See bug #53406
    def remove_image_from_header(self, xhtml):
        self.log.info("Removing images from headers")
        try:
            soup = BeautifulSoup(xhtml)

            # Print nodes run BeautifulSoup 3
            #inlines = soup.findAll("span", {"class":"x-ck12-img-inline"})
            # Check all images. The span with class x-ck12-img-inline is not
            # always the case.
            inlines = soup.findAll("img")
            # Check the parent tags for all the found elements
            # If a heading tag is found replace it with a p tag.
            for mg in inlines:
                h3 = mg.findParent('h3')
                h4 = mg.findParent('h4')
                h5 = mg.findParent('h5')
                if h5 !=None:
                    self.log.info("Found image in h5.")
                    temp = str(h5)
                    h5.name = 'p'
                    xhtml = xhtml.replace(temp, str(h5))
                elif h4 !=None:
                    self.log.info("Found image in h4")
                    temp = str(h4)
                    h4.name = 'p'
                    xhtml = xhtml.replace(temp, str(h4))
                elif h3 !=None:
                    self.log.info("Found image in h3")
                    temp = str(h3)
                    h3.name = 'p'
                    xhtml = xhtml.replace(temp, str(h3))
            self.log.info("xhtml after removing images from headers: %s" %xhtml)
        except Exception as e:
            self.log.error("Exception from remove_image_from_header %s" %(e))

        return xhtml

    # Adding headers for vocaulary and learning objective sections
    def add_headers(self, xhtml):
        self.log.info("Adding headers")
        soup = BeautifulSoup(xhtml)

        # Print nodes run BeautifulSoup 3
        vocab_sections = soup.findAll("div", {"class":"x-ck12-data-vocabulary"})
        for section in vocab_sections:
            if section.contents:
                temp = str(section)
                vocab_header = Tag(soup,"h3")
                vocab_header.insert(0, NavigableString("Vocabulary"))
                section.insert(0, vocab_header)
                xhtml = xhtml.replace(temp, str(section))
                self.log.info("xhtml with vocabulary headers: %s" %xhtml)

        lo_sections = soup.findAll("div", {"class":"x-ck12-data-objectives"})
        for section in lo_sections:
            if section.contents:
                temp = str(section)
                learningObjective_header = Tag(soup, "h3")
                learningObjective_header.insert(0, NavigableString("Learning Objectives"))
                section.insert(0, learningObjective_header)
                xhtml = xhtml.replace(temp, str(section))
                self.log.info("xhtml with learning objectives headers: %s"  %xhtml)

        return xhtml

    # Removing extra c1 text in image div class(fixed temporarly)        
    def removeC1(self,xhtml):
        c1_pattern = re.compile('(class="x-ck12-img-.*?( c1)")')
        img_classes = c1_pattern.findall(xhtml)
        for result in img_classes:
            class_name = result[0].replace(result[1],'')
            xhtml = xhtml.replace(result[0],class_name)

        return xhtml

    def remove_broken_hrefs(self, xhtml):
        soup = BeautifulSoup(xhtml)
        for eachAnchor in soup.findAll('a'):
            if eachAnchor.has_key('href') and eachAnchor['href'].startswith('#'):
                anchorID = eachAnchor['href'][1:]
                if xhtml.find('id=\"%s\"' %(anchorID)) < 0:
                    xhtml = xhtml.replace('href="%s"' %(eachAnchor['href']), '')
        return xhtml

     # Download all images and save it in work_dir
    def copy_html_images(self, xhtml,resource_path, chapter_number):
        self.log.info("Copying images")
        error_images_resource_path = resource_path + '/'+ settings.ERROR_IMAGES_DIR
        mkdir(resource_path + '/'+ settings.ERROR_IMAGES_DIR)
        error_images_resource_path = resource_path + '/' + settings.ERROR_IMAGES_DIR

        stream_re = re.compile('(flx/show/(thumb_large|thumb_small|thumb_postcard|default)/.*)', re.I)
        for eachStreamImage in stream_re.findall(xhtml):
            xhtml = xhtml.replace(eachStreamImage[0], eachStreamImage[0].replace(eachStreamImage[1], 'default'))
        stream_re = re.compile('(flx/render/perma/resource/(thumb_large|thumb_small|thumb_postcard|default)/.*)', re.I)
        for eachStreamImage in stream_re.findall(xhtml):
            xhtml = xhtml.replace(eachStreamImage[0], eachStreamImage[0].replace(eachStreamImage[1], 'default'))

        # Deal with math images
        soup = BeautifulSoup(xhtml)
        for eachImg in soup.findAll('img', {'class': ['x-ck12-math', 'x-ck12-block-math']}):
            img_src = eachImg.get('src', '')
            if img_src:
                xhtml = xhtml.replace(img_src, 'ck12_math')
        self.log.info(xhtml)

        # Deal with regular images
        soup = BeautifulSoup(xhtml)
        images = soup.findAll('img')
        image_srcs = [eachImg.get('src', '') for eachImg in images if eachImg.get('src', '')]
        # Create image dir
        image_dir_name = 'images_'+str(chapter_number)

        if not mkdir(resource_path+'/'+image_dir_name):
             self.log.info("Could not create image directory")

        image_dir_path = resource_path+'/'+image_dir_name
        for image_src in image_srcs:
            if image_src.startswith("ck12_") :
                continue

            new_path = self.create_unique_path(image_dir_path)
            resource_prefix = ''
            scheme, prefix = self.getPrefix(image_src)
            if prefix == '':
                resource_prefix = settings.DEFAULT_HTTP_PREFIX
            else:
                if not scheme:
                    resource_prefix = 'http:' + resource_prefix

            orig_img_path = resource_prefix + image_src
            self.log.info("Retrieving image: '"+ image_src +"'")
            try:
                #self.retrieve_image(orig_img_path, new_path)
                download_file(orig_img_path, new_path)
                image_obj = Image.open(new_path)
                img_format = image_obj.format.lower()

                # Save image with extension 
                cmd = 'mv '+new_path+' '+new_path+'.'+img_format
                os.system(cmd)

                buffer = xhtml.replace(image_src +"\"", new_path.replace(resource_path+'/',"")+'.'+img_format+"\"", 1)
                if buffer == xhtml:
                    self.log.info("URL replacement fail! Watch the pattern ...")
                xhtml = buffer
            except Exception as Detail:
                self.log.info("Exception :"+str(Detail))
                if os.path.exists(new_path):
                    os.unlink(new_path)
                error_image_filename = os.path.basename(settings.ERROR_IMAGE_PATH)
                new_path = error_images_resource_path + "/" + error_image_filename
                if not os.path.exists(new_path):
                    cmd = "cp " + settings.ERROR_IMAGE_PATH + " " + new_path
                    os.system(cmd)
                xhtml = xhtml.replace(image_src +"\"" , new_path.replace(resource_path+'/', "") +"\"", 1)
                image_obj = Image.open(new_path)
                self.log.info("Image type couldn't find for image with URL: "+ image_src + " .  Possible cause: Render Failure.")

        iframe_re = re.compile("(<iframe .*?name=\")(.*?)(\" .*?</iframe>)", re.DOTALL)
        iframe_tags = iframe_re.findall(xhtml)
        for eachIframe in iframe_tags:
            internalid = eachIframe[1]
            resource_prefix = settings.DEFAULT_HTTP_PREFIX
            thumbnail_path = self.get_thumbnail_image(internalid)
            previousIframeTag = eachIframe[0] + eachIframe[1] + eachIframe[2]
            newIframeTag = eachIframe[0] + eachIframe[1] + '" thumbnail="%s' %(thumbnail_path) + eachIframe[2]
            self.log.info(newIframeTag)
            xhtml = xhtml.replace(previousIframeTag, newIframeTag)

        return xhtml

    def process_ck12_embeds(self, xhtml):
        iframe_re = re.compile("(<iframe .*?src=\")(.*?)(\" .*?</iframe>)", re.DOTALL)
        iframe_tags = iframe_re.findall(xhtml)
        CK12_EMBED_REGEX = re.compile("ck12.org\/embed\/.*?(module=launcher)&.*?(artifactID=([0-9]+))", re.I)
        for eachIframe in iframe_tags:
            src = urllib.unquote(eachIframe[1])
            m = CK12_EMBED_REGEX.search(src)
            if not m:
                continue
            artifactID = int(m.group(3))
            self.log.info('Found a CK-12 embed with artifactID: [%s]' %(artifactID))
            artifact = api.getArtifactByID(id=artifactID)
            if not artifact:
                self.log.info('No artifact found for artifactID: [%s]. Skipping...' %(artifactID))
                continue
            artifactDomain = artifact.getDomain()
            artifactType = artifact.type.name
            if not artifactDomain:
                artifactURL = "/".join(['',artifactType, artifact.handle])
            else:
                branchHandle = artifactDomain['branchInfo']['handle'].lower()
                conceptHandle = artifactDomain['handle']
                artifactURL = "/".join(['', branchHandle, conceptHandle, artifactType, artifact.handle])
            previousIframeTag = eachIframe[0] + eachIframe[1] + eachIframe[2]
            newIframeTag = eachIframe[0] + artifactURL + '" artifacttype="%s' %(artifact.type.name) + eachIframe[2]
            self.log.info(newIframeTag)
            xhtml = xhtml.replace(previousIframeTag, newIframeTag)
        return xhtml


    # Takes the internalID of embedded objects as input and returns the thumbnail 
    # and the embedded object
    def get_thumbnail_image(self, internalID):
        from tempfile import NamedTemporaryFile
        from urllib import urlretrieve
        from shutil import move
        import settings

        self.log.info('Getting thumbnail for EO with internalID: %s' %(internalID))
        thumbnail_workdir = self.work_dir + '/thumbnail/'
        if not os.path.exists(thumbnail_workdir):
            mkdir(thumbnail_workdir)
        thumbnailDir = settings.THUMBNAIL_DIR
        videoProviders = settings.VIDEO_PROVIDERS
        eo = api.getEmbeddedObjectByID(id=internalID)
        if not eo:
            thumbnail = thumbnailDir + '/' + 'emb_multimedia_na.png'
            return thumbnail
        self.log.info('EmbedInfo: %s' %(eo))
        isBlacklisted = eo.isBlacklisted()
        if isBlacklisted:
            if eo.type in videoProviders:
                thumbnail = thumbnailDir + '/' + 'emb_video_inapp.png'
            elif eo.type == 'schooltube':
                thumbnail = thumbnailDir + '/' + 'emb_video_inapp.png'
            elif eo.type == 'teachertube':
                thumbnail = thumbnailDir + '/' + 'emb_video_inapp.png'
            elif eo.type == 'remoteswf':
                thumbnail = thumbnailDir + '/' + 'emb_flash_inapp.png'
            elif eo.type == 'remotevideo':
                thumbnail = thumbnailDir + '/' + 'emb_video_inapp.png'
            elif eo.type == 'audio':
                thumbnail = thumbnailDir + '/' + 'emb_audio_inapp.png'
            elif eo.type == 'customembed':
                thumbnail = thumbnailDir + '/' + 'emb_multimedia_inapp.png'
            elif eo.type == 'applet':
                thumbnail = thumbnailDir + '/' + 'emb_applet_inapp.png'
            else:
                thumbnail = thumbnailDir + '/' + 'emb_multimedia_inapp.png'
        else:
            if eo.type in videoProviders:
                thumbnail = eo.thumbnail
                if thumbnail and not (thumbnail.startswith('http://') or thumbnail.startswith('https://')):
                    thumbnail = settings.DEFAULT_HTTP_PREFIX + thumbnail
                if not thumbnail:
                    thumbnail = thumbnailDir + '/' + 'emb_video.png'
            elif eo.type == 'schooltube':
                thumbnail = thumbnailDir + '/' + 'emb_video.png'
            elif eo.type == 'teachertube':
                thumbnail = thumbnailDir + '/' + 'emb_video.png'
            elif eo.type == 'remoteswf':
                thumbnail = thumbnailDir + '/' + 'emb_flash.png'
            elif eo.type == 'remotevideo':
                thumbnail = thumbnailDir + '/' + 'emb_video.png'
            elif eo.type == 'audio':
                thumbnail = thumbnailDir + '/' + 'emb_audio.png'
            elif eo.type == 'customembed':
                thumbnail = thumbnailDir + '/' + 'emb_multimedia.png'
            elif eo.type == 'applet':
                thumbnail = thumbnailDir + '/' + 'emb_applet.png'
            else:
                thumbnail = thumbnailDir + '/' + 'emb_multimedia.png'

        tempfd = NamedTemporaryFile()
        tempFile = thumbnail_workdir + '/' + os.path.basename(tempfd.name)
        tempfd.close()
        if thumbnail.startswith('http://') or thumbnail.startswith('https://'):
            self.log.info('Downloading thumbnail: [%s]' %(thumbnail))
            try:
                download_file(thumbnail, tempFile)
            except:
                copyfile(thumbnailDir + '/' + 'emb_multimedia.png', tempFile)
            #urlretrieve(thumbnail, tempFile)
            image_obj = Image.open(tempFile)
            imgType = image_obj.format.lower()
            newTempFile = tempFile + '.' + imgType
            move(tempFile, newTempFile)
        else:
            tempFile = tempFile + '.' + os.path.basename(thumbnail).split('.')[1]
            copyfile(thumbnail, tempFile)
            os.path.basename(thumbnail)
            newTempFile = tempFile
        thumbnail = newTempFile
        return thumbnail

    # Creating meta data attributes for pdf book (here some fields are empty now .we will get it soon)  
    def create_metadata_pdf(self, content_dic, artifact_type):
        artifactRevisionID = content_dic['revisionID']
        templateToEncode = 'onecolumn' if not self.template else self.template
        UUID = str(artifactRevisionID) + '-' + templateToEncode
        self.log.info('UUID: %s'  %(UUID))
        encryptedUUID = generateEncryptedUUID(UUID)
        self.log.info('Encrypted UUID: %s' %(encryptedUUID))
        content_dic['encryptedUUID'] = encryptedUUID
        self.meta.create_metadata_pdf(content_dic, artifact_type)

    # Save pdf metadata in metadata.ini
    def save_metadata_file(self, artifact_type):
        self.artifact_type = artifact_type
        self.meta.save_metadata_file(self.work_dir, artifact_type)

    # Naming math images(while saving image)  
    def create_unique_path_for_math(self, prefix, imgsrc):
        if not prefix.endswith('/'):
            prefix += '/'
        return prefix + hashlib.md5(imgsrc).hexdigest()

    # Naming regular images(while saving image)
    def create_unique_path(self,prefix):
        if not prefix.endswith('/'):
            prefix += '/'
        return prefix + self.create_timestamp()

    # save files
    def save(self,payload, path, file_name):
        source = open(path +"/"+ file_name, 'wb+')
        source.write(payload.encode('utf-8'))
        source.close();
        return path+'/'+file_name

    def _get_print_id(self):
        self.print_id = self.create_timestamp()

    def create_timestamp(self):
        return datetime.now().strftime("%Y%m%d%H%M%S%f")

    def retrieve_image(self, url, path):
        self.log.info('URL: [%s]' %(url))
        class MyHTTPRedirectHandler(urllib2.HTTPRedirectHandler):
            def http_error_302(self, req, fp, code, msg, headers):
                #self.log.info(headers['location'])
                print headers['location']
                result = urlparse(headers['location'])
                if '.cloudfront.net' in result.netloc and result.scheme == 'https':
                    print 'Found cloudfront'
                    headers['location'] = headers['location'].replace('https://', 'http://')
                print headers['location']
                #self.log.info(headers['location'])
                return urllib2.HTTPRedirectHandler.http_error_302(self, req, fp, code, msg, headers)
            http_error_301 = http_error_303 = http_error_307 = http_error_302
        opener = urllib2.build_opener(MyHTTPRedirectHandler)
        urllib2.install_opener(opener)

        response = urllib2.urlopen(url)
        with open(path, 'wb') as fd:
            fd.write(response.read())

    def getPrefix(self, url):
        result = urlparse(url)
        # Check if it is relative url
        if result.netloc == '':
            prefix = ''
        else :
            prefix = result.scheme +"://"+ result.netloc
        return result.scheme, prefix

def mkdir(path):
    if not os.path.exists(path):
        os.makedirs(path)
        return True
    else:
        return False

def doGet(url):
    f = urllib2.urlopen(url);
    return [f.code, f.read()]

def generateEncryptedUUID(string):
    BLOCKSIZE = 16
    PADDING = '$'
    paddedString = string + (BLOCKSIZE - len(string) % BLOCKSIZE) * PADDING

    key = 'ClUNf9OS5GyDQ7vmcZtsJr1hjk8RKIEB'
    key = key[0:BLOCKSIZE]
    encryptingCipher = AES.new(key)
    encryptedString = encryptingCipher.encrypt(paddedString)
    encodedString = h.genURLSafeBase64Encode(encryptedString, strip=False, usePrefix=False)
    decryptingCipher = AES.new(key)
    decodedString = h.genURLSafeBase64Decode(encodedString, hasPrefix=False)
    decryptedString = decryptingCipher.decrypt(decodedString).rstrip(PADDING)
    if string != decryptedString:
        print 'ERROR: The input string and the decoded string after encryption do not match. This needs fixing.'
    return encodedString


class Metadata:

    def __init__(self, work_dir):
        self.meta_data = {}

    def create_metadata_pdf(self, content_dic, artifact_type):

        self.meta_data['title'] = content_dic.get('title')
        self.meta_data['authors'] = content_dic.get('authors')
        self.meta_data['editors'] = content_dic.get('editors')
        self.meta_data['contributors'] = content_dic.get('contributors')
        self.meta_data['translators'] = content_dic.get('translators')
        self.meta_data['sources'] = content_dic.get('sources')
        self.meta_data['reviewers'] = content_dic.get('reviewers')
        self.meta_data['technicalreviewers'] = content_dic.get('technicalreviewers')
        self.meta_data['coverimage'] = content_dic.get('coverimage')
        self.meta_data['encryptedUUID'] = content_dic.get('encryptedUUID')

    # Save pdf metadata in metadata.ini
    def save_metadata_file(self,work_dir, artifact_type):

        from configobj import ConfigObj
        meta_data = self.meta_data
        config = ConfigObj(work_dir + '/' + 'metadata.ini', encoding='UTF8')
        config['DEFAULT'] = {}
        config['DEFAULT']['Title'] = meta_data['title']
        config['DEFAULT']['Authors'] = meta_data['authors']
        config['DEFAULT']['Editors'] = meta_data['editors']
        config['DEFAULT']['Contributors'] = meta_data['contributors']
        config['DEFAULT']['Translators'] = meta_data['translators']
        config['DEFAULT']['Sources'] = meta_data['sources']
        config['DEFAULT']['Reviewers'] = meta_data['reviewers']
        config['DEFAULT']['TechnicalReviewers'] = meta_data['technicalreviewers']
        config['DEFAULT']['EncryptedUUID'] = meta_data['encryptedUUID']
        coverimage = meta_data['coverimage']
        if coverimage:
            coverimage = self._downloadImage(coverimage, work_dir + '/' + 'ck12_coverimage' + '.' + coverimage.split('.')[-1])
        else:
            generic_coverimage = settings.BOOK_COVER_IMAGE
            coverimage = work_dir + '/' + os.path.basename(generic_coverimage)
            copyfile(generic_coverimage, coverimage)
        config['DEFAULT']['CoverImage'] = coverimage
        config.write()

    # Save files
    def save(self,payload, path, file_name):
        source = open(path + "/" + file_name, 'wb+')
        source.write(payload.encode('utf-8'))
        source.close()
        return path + '/' + file_name

    def _downloadImage(self, image_url, filepath):
        if image_url.lower().startswith('http'):
            try:
                download_file(image_url, filepath)
                return filepath
            except Exception as e:
                print 'Could not download the image and save %s' %(e.__str__())
        return image_url
