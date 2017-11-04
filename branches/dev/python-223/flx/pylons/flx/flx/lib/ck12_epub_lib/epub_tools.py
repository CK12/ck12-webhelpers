import urllib, urllib2
from urlparse import urlparse
import hashlib
import random
import re
from datetime import datetime
import settings
import os
import subprocess
from tidylib import tidy_document
from BeautifulSoup import BeautifulSoup, Tag
from PIL import Image
import codecs
import logging
from xml.sax import saxutils
import traceback

from flx.model import api
from flx.lib.helpers import safe_decode, genURLSafeBase64Encode, getRandomString, createCustomCoverImage
#Initialing Debugger
log = logging.getLogger(__name__)

schemaOrg_re = re.compile('(<div.*?>.*?</div>)', re.DOTALL)
meta_re = re.compile('(<meta[ ]*itemprop=".*?"[ ]*content=".*?"[ ]*/>)', re.DOTALL)
meta_comment_re = re.compile('(<!--[ ]*<meta[ ]*itemprop=".*?"[ ]*content=".*?"[ ]*/>[ ]*-->)', re.DOTALL)

# Create a unique working directory.
# If fails after 3 attempts, it raises IOError exception
def create_work_dir():
    work_dir = ""
    attempt = 0
    created = False
    while attempt < 3:
        attempt +=1
        time_str = ""
        time_str = create_timestamp()
        work_dir = settings.ROOT_WORK_DIR + "/ck12" + time_str
        if mkdir(work_dir):
            created = True
            break;
    if not created:
        raise IOError("Failed to create working directory. Permission issue?")
    else :
        return work_dir

#simply make a dir. Return false if failed
def mkdir(path):
    if not os.path.exists(path):
        os.mkdir(path)
        return True
    else:
        return False

#performs a HTTP GET, returns the status and the result
def doGet(url):
    req = urllib2.Request(url, headers={'User-Agent' : "CK12 Browser"})
    f = urllib2.urlopen(req);
    return [f.code, f.read()]

#gets prefix from a url, returns empty string if prefix doesn't exist
def getPrefix(url):
    result = urlparse(url)
    #check if it is relative url
    if result.netloc == '':
        prefix = ''
    else :
        prefix = result.scheme +"://"+ result.netloc
    return result.scheme, prefix

#create the epub file after all preparation work has been done
def bundle_epub(working_dir, name):
    cmd = "cd "+ working_dir +";zip -0Xq "+ name +" mimetype;zip -Xr9Dq "+ name +" *"
    os.system(cmd)

# Given a path, add all the necessary ePub blank artifacs
# It uses random cover image
def populate_epub_dir(path):
    cmd = "cp -r "+ settings.EPUB_TEMPLATE_DIR  +"/* "+ path
    os.system(cmd)
    cmd = "cd "+ path + "; find -name \".svn\" | xargs rm -rf"
    os.system(cmd)

# Rename the src in image tags to refer to the correct path
def rename_html_images(html_str, base_path, resource_dir, chapter_number, chapter_title):
    log.info("Renaming src of images")
    resource_path = base_path + '/' + resource_dir
    image_array = []

    #Deal with regular images
    img_src_pattern = re.compile("<img.*?src=\"([^\"]+)\"")
    image_srcs = img_src_pattern.findall(html_str)
    image_array = []
    for image_src in image_srcs:
        newPath = resource_path + '/' + os.path.basename(image_src)
        log.info('Processing image: %s' %(newPath))
        each_image = {}
        image_obj = Image.open(newPath)
        img_format = image_obj.format.lower()
        each_image['image_format'] = "image/" + img_format
        each_image['image_href'] = resource_dir + '/' + os.path.basename(image_src)
        image_array.append(each_image)
        html_str = html_str.replace(image_src, image_src.replace('images', resource_dir, 1), 1)

    log.info("Resource path: " + resource_path)
    if (settings.AUTO_RESIZE_IMAGES):
        auto_resize_image_in_dir(resource_path)
    return html_str, image_array

def add_chapter_title_header(html_str, chapter_title):
    encoded_chapter_title = genURLSafeBase64Encode(chapter_title) + '-chapter'
    return html_str.replace('<body>', '<body>\n<h1 id="%s">\n%s\n</h1>' %(encoded_chapter_title, chapter_title), 1)

#copy all images in html to resource_dir,
#change all references to images in html_src to the local cache
#default_resource_prefix will be used when the image url is relative
#requirement: resource_dir has to be available, and writeable
def copy_html_images(html_str, base_path, resource_path,
                     default_resource_prefix, math_satelite_server, chapter_number, chapter_title, optimizeForKindle):

    log.info("Adding the chapter title header")
    html_str = add_chapter_title_header(html_str, chapter_title)
    log.info("Trying to copy images")
    f = open(settings.IMAGES_FAILURE_LOG, "a")
    f.write("<hr /><p> Chapter : "+ str(chapter_number) + ": "+chapter_title+"</p>")
    f.close()
    image_array = []

    #Deal with math images
    image_srcs = []
    soup = BeautifulSoup(html_str)
    for eachImg in soup.findAll('img', {'class': ['x-ck12-math', 'x-ck12-block-math']}):
        img_src = eachImg.get('src', '')
        formula = eachImg.get('alt', '')
        if img_src and formula:
            image_srcs.append((img_src, formula))
    #img_src_pattern = re.compile("<img src=\"([^\"]+)\" alt=\"(.*?)\" class=\"x-ck12[-block]*-math\" />")
    #image_srcs = img_src_pattern.findall(html_str)
    base_path += "/"
    math_images_resource_path = base_path + settings.MATH_IMAGES_DIR
    for image_src in image_srcs:
        formula = image_src[1]
        image_src = image_src[0]
        if optimizeForKindle:
            image_src = image_src + '/kindle'
        log.info('Image list: '+ image_src)
        mkdir(math_images_resource_path)
        new_path = create_unique_path_for_math(math_images_resource_path, image_src)
        resource_prefix = ''
        scheme, prefix = getPrefix(image_src)
        if prefix == '':
            resource_prefix = 'http://' + math_satelite_server
        else:
            if not scheme:
                resource_prefix = 'http:' + resource_prefix

        each_image = {}
        try:
            log.info('Downloading: %s' %(resource_prefix + image_src))
            retrieve_image(resource_prefix + image_src, new_path)
            image_obj = Image.open(new_path)
            img_format = image_obj.format.lower()
            each_image['image_format'] = "image/" + img_format

            #save image with extension
            cmd = 'mv ' + new_path + ' ' + new_path + '.' + img_format
            os.system(cmd)

            each_image['image_href'] = new_path.replace(base_path,"") + '.' + img_format
            image_array.append(each_image)
            dimension = get_image_dimension(new_path+"."+img_format)
            if optimizeForKindle:
                image_src = image_src.replace('/kindle', '')
            html_str = html_str.replace(image_src +"\"" , new_path.replace(base_path,"")+'.'+img_format+"\" width=\""+ dimension[0] +"\" height=\""+ dimension[1] +"\"", 1)
        except Exception:
            each_image = {}
            if os.path.exists(new_path):
                os.unlink(new_path)
            error_image_filename = os.path.basename(settings.ERROR_IMAGE_PATH)
            new_path = math_images_resource_path + "/" + error_image_filename
            if not os.path.exists(new_path):
                os.system("cp "+settings.ERROR_IMAGE_PATH + " " + new_path)
            html_str = html_str.replace(image_src + "\"" , new_path.replace(base_path, "") + "\"", 1)
            each_image['image_href'] = new_path.replace(base_path, "")
            image_obj = Image.open(new_path)
            each_image['image_format'] = "image/" + image_obj.format.lower()
            image_array.append(each_image)
            f = codecs.open(settings.IMAGES_FAILURE_LOG, encoding='utf-8', mode="a")
            f.write("<p>Image Failed with Formula: <a href=\"" + image_src + "\">" + formula + "</a></p>")
            f.close()
            log.info("Image type couldn't find for image with URL: " + image_src + ".Possible cause: Render Failure.")

    #Deal with regular images
    #img_src_pattern = re.compile("<img src=\"([^\"]+)\"")
    #img_src_pattern = re.compile("<img .*?src=\W*\"(.*?)\"", re.DOTALL)
    #image_srcs = img_src_pattern.findall(html_str)
    soup = BeautifulSoup(html_str)
    images = soup.findAll('img')
    image_srcs = [eachImg.get('src', '') for eachImg in images if eachImg.get('src', '')]
    for image_src in image_srcs:
        if image_src == 'EMBEDVIDEO':
            new_path = resource_path + "/"  +os.path.basename(settings.EMBED_IMAGE_PATH)
            if not os.path.exists(new_path):
                os.system("cp "+settings.EMBED_IMAGE_PATH  + " " + resource_path)
            html_str = html_str.replace(image_src, new_path.replace(base_path,"") + "\"", 1)
            continue
        if image_src == 'BLACKLISTED':
            new_path = resource_path + "/" +os.path.basename(settings.ERROR_IMAGE_PATH)
            if not os.path.exists(new_path):
                os.system("cp "+settings.EMBED_IMAGE_PATH  + " " + resource_path)
            html_str = html_str.replace(image_src, new_path.replace(base_path,"") + "\"", 1)
            continue
        if image_src.startswith("ck12_") :
            log.info("Already processed: "+ image_src)
            continue

        new_path = create_unique_path(resource_path)
        resource_prefix = ''

        scheme, prefix = getPrefix(image_src)
        if prefix == '':
            resource_prefix = default_resource_prefix
        else:
            if not scheme:
                resource_prefix = 'http:' + resource_prefix

        orig_img_path = resource_prefix + image_src
        log.info("Retrieving image: '" + image_src + "'")
        each_image = {}
        try:
            retrieve_image(orig_img_path, new_path)
            image_obj = Image.open(new_path)
            img_format = image_obj.format.lower()
            each_image['image_format'] = "image/" + img_format
            # Save image with extension
            cmd = 'mv ' + new_path + ' ' + new_path + '.' + img_format
            os.system(cmd)

            each_image['image_href'] = new_path.replace(base_path,"") + '.' + img_format
            image_array.append(each_image)
            buffer = html_str.replace(image_src + "\"", new_path.replace(base_path,"") + '.' + img_format + "\"", 1)
            if buffer == html_str:
                log.info("URL replacement fail! Watch the pattern ...")
            html_str = buffer
        except Exception:
            each_image = {}
            if os.path.exists(new_path):
                os.unlink(new_path)
            error_image_filename = os.path.basename(settings.ERROR_IMAGE_PATH)
            new_path = math_images_resource_path + "/" + error_image_filename
            if not os.path.exists(new_path):
                os.system("cp " + settings.ERROR_IMAGE_PATH + " " + new_path)
            html_str = html_str.replace(image_src + "\"" , new_path.replace(base_path, "") + "\"", 1)
            each_image['image_href'] = new_path.replace(base_path, "")
            image_obj = Image.open(new_path)
            each_image['image_format'] = "image/" + image_obj.format.lower()
            image_array.append(each_image)
            f = open(settings.IMAGES_FAILURE_LOG, "a")
            f.write("<p>Image Failed with URL: <a href=\"" + image_src + "\">" + image_src + "</a></p>")
            f.close()
            log.info("Image type couldn't find for image with URL: "+ image_src + ". Possible cause: Render Failure.")

    # Need to get soup object again as the html has been changed.
    soup = BeautifulSoup(html_str)
    # Get all the image tags.We can skip the re here if we have the exact class name of the images.
    images = soup.findAll('div', {'class': re.compile('x-ck12-img-.*')})
    fig_number = 1
    for image_div in images:
        # Prepare figure tag
        p_tag = Tag(soup, "p")
        strong_tag = Tag(soup, "strong")
        strong_tag.string = "Figure %s.%s" % (chapter_number, fig_number)
        p_tag.insert(0, strong_tag)
        # Get the index where the Figure tag will be inserted.
        for fig_index,elmt in enumerate(image_div):
            # Find the first image element index.
            if isinstance(elmt, Tag) and elmt.first() and elmt.first().name == 'img':
                fig_index += 1
                # Insert Figure tag after image.
                image_div.insert(fig_index, p_tag)
                break
            fig_index += 1
        fig_number += 1
    html_str = unicode(soup)
    log.info("Resource path: " + resource_path)
    if (settings.AUTO_RESIZE_IMAGES):
        auto_resize_image_in_dir(resource_path)
    return html_str, image_array


#save the html into a file, given the path and file_name
def save_html(payload, path, file_name):
    source = codecs.open(path + "/" + file_name, 'wb+', encoding='utf-8')
    payload = payload.decode('utf-8')
    payload = payload.encode('ascii', 'xmlcharrefreplace')
    source.write(payload)
    #source.write(payload.decode('utf-8', 'xmlcharrefreplace'))
    #source.write(payload.encode('ascii', 'xmlcharrefreplace'))
    return source.close();

def add_book_cover_image(user_image_file_path, book_title, artifactType):
    log.info("Trying to add cover image")
    imagesDir = os.path.dirname(user_image_file_path)
    log.info('Cover image location: %s' %(user_image_file_path))
    if can_read(user_image_file_path):
        cover_image = user_image_file_path
    else:
        cover_image = imagesDir + '/' + 'cover.png'
    #cover_image = imagesDir + '/' + 'cover.png'
    try:
        im = Image.open(cover_image)
    except:
        #Create custom cover image for ePubs if cover image is not set 
        outputCoverImage = createCustomCoverImage(settings.CUSTOM_COVER_TEMPLATE, settings.CUSTOM_COVER_IMAGE, book_title, imagesDir + '/' + 'cover.png')
        im = Image.open(outputCoverImage)
    im.save(imagesDir + '/' + 'cover.png')
    if(settings.FOR_ITUNES_SUBMISSION):
        resize_book_cover_image(imagesDir + '/' + 'cover.png')

    #Delete the temp cover image if it exists
    if os.path.exists(user_image_file_path):
        os.remove(user_image_file_path)

def can_write(filepath):
    '''Get the file permission.'''

    if filepath == '':
        return False
    if os.path.exists(filepath):
        if os.access(filepath, os.W_OK):
            return True
        else:
            log.info("WARNING: file "+filepath+" do not have write permission.")
            return False
    else:
        log.info("WARNING: file does not exist in the directory "+filepath+".")
        return False
    
def resize_book_cover_image(book_cover_image_file_path):
    '''Resizes image to the to size.'''

    log.info("Trying to resize cover image.")
    if can_write(book_cover_image_file_path):
        try:
            cover_image = Image.open(book_cover_image_file_path)
            log.info('Image location: %s' %(book_cover_image_file_path))
            cover_image = cover_image.resize(settings.BOOK_COVER_IMAGE_SIZE, Image.ANTIALIAS)
            cover_image.save(book_cover_image_file_path)
        except Exception as e:
            log.error(e)
    else:
        log.info("Unable to resize the file.")   
#add book cover
#def add_book_cover_image(lib_titleimage_dir, user_image_file_path):
#    log.info("Trying to add cover image")
#    if can_read(user_image_file_path):
#        cover_image=user_image_file_path
#    else:
#        default_cover_image_dir=settings.EPUB_COVER_IMAGES_DIR

#        if not default_cover_image_dir.endswith('/'):
#   	    default_cover_image_dir += '/'
#        image_namelist=os.listdir(default_cover_image_dir)

#        total_images=len(image_namelist)
#        if total_images == 0:
#	    log.info("WARNING: No bookcovers in generic book cover directory. Using the default image.")
#	    return
#        random_value=random.randint(0,total_images-1)
#        random_image_file=image_namelist[random_value]


#        if not random_image_file.endswith('.png'):
#	    random_image_file=image_namelist[0]

#        cover_image=default_cover_image_dir+random_image_file

#    dest_image=lib_titleimage_dir+"cover.png"
#    source_image_file=open(cover_image,"r")
#    raw_image=source_image_file.read()
#    source_image_file.close()
#    dest_image_file=open(dest_image,"w")
#    dest_image_file.write(raw_image)
#    dest_image_file.close()

# Get the file permission
def can_read(filepath):
    if filepath == '':
        return False
    if os.path.exists(filepath):
        if os.access(filepath, os.R_OK):
            return True
        else:
            log.info("WARNING: file "+filepath+" do not have read permission.")
            return False
    else:
        log.info("WARNING: file does not exist in the directory "+filepath+".")
        return False

# Takes the internalID of embedded objects as input and returns the thumbnail 
# and the embedded object
def getThumbnail(internalID):
    from tempfile import NamedTemporaryFile
    from urllib import urlretrieve
    import Image
    from shutil import move
    import settings
    
    thumbnail = None
    thumbnailDir = settings.THUMBNAIL_DIR
    videoProviders = settings.VIDEO_PROVIDERS
    eo = api.getEmbeddedObjectByID(id=internalID)
    if not eo:
        thumbnail = thumbnailDir + '/' + 'emb_multimedia_na.png'
        return None, thumbnail
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
        if eo.type in videoProviders:
            thumbnail = eo.thumbnail
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

    if not thumbnail:
        thumbnail = thumbnailDir + '/' + 'emb_multimedia.png'
    if thumbnail.startswith('http://') or thumbnail.startswith('https://'):
        tempfd = NamedTemporaryFile()
        tempFile = tempfd.name
        tempfd.close()
        urlretrieve(thumbnail, tempFile)
        image_obj = Image.open(tempFile)
        imgType = image_obj.format.lower()
        newTempFile = tempFile + '.' + imgType
        move(tempFile, newTempFile)
        thumbnail = newTempFile

    return eo, thumbnail


def render_embedded_objects(html, base_path, resource_path, http_prefix):
    log.info('Rendering embedded objects...')
    try:
        internalID_re = re.compile('<iframe.*?name=\"(\d*)\".*?/iframe>', re.DOTALL)
        #schemaOrg_re = re.compile('(<div itemprop="video".*?</div>)', re.DOTALL)
        #iframe_objects_re = re.compile('<iframe.*</iframe>')
        #permaURI_re = re.compile('<iframe.*src=\"([a-zA-Z0-9\%\:\.//]*)\".*</iframe>')

        serverName = urlparse(http_prefix).netloc
        #serverName = 'remap.ck12.org'
        renderURLPrefix = 'http://' + serverName + '/flx/render/perma/resource'
        #reObj = re.compile('<iframe.*</iframe>')
        #all_iframes = reObj.findall(html)
        all_iframes = schemaOrg_re.findall(html)
        image_array = []
        for each_iframe in all_iframes:
            if 'itemprop' not in each_iframe and 'itemscope' not in each_iframe:
                continue
            log.info('Handling %s' %(each_iframe))
            image_string = '<p><a href="permaURI"><img src="imagePath" width="WIDTH" height="HEIGHT"/></a></p><p>Click on the image above for more content</p>'
            log.info(internalID_re.findall(each_iframe))
            internalid =  internalID_re.findall(each_iframe)[0]
            log.info('Rendering embedded object with internalid %s' %(internalid))
            each_image = {}
            eo, thumbnail = getThumbnail(internalid)
            cmd = 'cp ' + thumbnail + ' ' + resource_path
            os.system(cmd)
            thumbnailFilename = os.path.basename(thumbnail)
            newThumbnailPath = resource_path + '/' + thumbnailFilename
            width, height = get_image_dimension(newThumbnailPath)
            image_obj = Image.open(newThumbnailPath)
            img_format = image_obj.format.lower()
            each_image['image_format'] = "image/" + img_format
            newThumbnailPath = newThumbnailPath.replace(base_path + '/', '')
            each_image['image_href'] = newThumbnailPath
            image_string = image_string.replace('imagePath', newThumbnailPath)
            image_array.append(each_image)
            if eo:
                if not eo.isBlacklisted():
                    if eo.resource:
                        href = renderURLPrefix + eo.resource.getPermaUri()
                    else:
                       href = serverName + 'flx/render/embeddedobject/%s' + internalid
                    image_string = image_string.replace('permaURI', href)
                else:
                    log.info('Embedded object is blacklisted. Rendering an un-availale image instead')
                    #href = serverName + 'flx/render/embeddedobject/%s' + internalid
                    href = renderURLPrefix + eo.resource.getPermaUri()
                    image_string = image_string.replace('permaURI', href)
            else:
                image_string = image_string.replace('permaURI', '')
            image_string = image_string.replace('WIDTH', width)
            image_string = image_string.replace('HEIGHT', height)
            log.info('Final image string: %s' %(image_string))
            html = html.replace(each_iframe, image_string)
            #html = re.sub('<iframe.*name=\"%s\".*</iframe>' %(internalid),
            #              image_string, html, re.DOTALL)
        return html, image_array
    except Exception as e:
        log.error(e)
        log.error(traceback.format_exc())
        return html, image_array

#remove empty tags using BeautifulSoup
def remove_emptyTags(soup,tag_name):
    empty_tags = soup.findAll(lambda tag: tag.name == tag_name and tag.find(True) is None and (tag.string is None or tag.string.strip()==""))
    for e in empty_tags:
        e.extract()

#improve content issues
def improve_content(html,base_path):
    # bring to xhtml 1.0 first
    html = transform_to_xhtml(html)

    #display list from 1
    list_pattern=re.compile('<ol start=\"(.*?)\">')
    html=re.sub(list_pattern,'<ol>',html)

    #remove empty table id
    list_pattern=re.compile('<table id="table\W"')
    html=re.sub(list_pattern,'<table ',html)

    #remove empty numbered list
    empty_ol_pattern=re.compile('(<ol></ol>)',re.DOTALL)
    html=re.sub(empty_ol_pattern,'',html)

    #removing name on anchors
    name_pattern = re.compile('<a(.*?)(name=".*?")(.*?)>')
    html = name_pattern.sub(remove_name_attr, html)

    #remove empty anchors
    empty_anchor_pattern=re.compile('(<a[\s]*>[\s]*</a>)')
    html=re.sub(empty_anchor_pattern,'',html)

    #fixing long desc
    long_des_pattern=re.compile('(<div class="x-ck12-img-.*?>.*?longdesc=\"(.*?)\".*?</p>.*?<p>.*?</p>.*?</div>)',re.DOTALL)
    long_descriptions = long_des_pattern.findall(html)
    for long_desc in long_descriptions:
        if len(long_desc) > 1:
            new_desc=long_desc[0].replace(long_desc[1],"")
            html=html.replace(long_desc[0],new_desc)

    #remove empty id
    html=html.replace('id=""','')

    #fixing id attribute with spaces
    id_pattern=re.compile('id=\"(.*?)\"',re.DOTALL)
    ids=id_pattern.findall(html)
    for _id in ids:
        new_id=re.sub(" ",'-',_id)
        new_id=re.sub(":",'-',new_id)
        #new_id=re.sub("_",'-',new_id)
        new_id=re.sub("\+",'-',new_id)
        new_id=re.sub("%20",'-',new_id)
        html=html.replace(_id,new_id)

    #video image resize fix
    video_img_pattern = re.compile('(<img src=\"(.*?)\".*?alt=\"video_image\".*?name=\"thumbnail_video\".*?/>)')
    video_img_srcs = video_img_pattern.findall(html)
    for video_img_src in video_img_srcs:
        resize_image(base_path +'/'+video_img_src[1],480,360)

    #Removing anchor tags of internal links of table
    id_pattern=re.compile('(<a class=\"xref\" href=\"#table:.*?\".*?>(.*?)</a>)',re.DOTALL)
    ids=id_pattern.findall(html)
    for _id in ids:
        html=html.replace(_id[0],"<span class=\"strong\">"+_id[1]+"</span>")

    #fixing id issues
    id_pattern=re.compile('(<a class=\"xref\" href=\"#(.*?)\">(.*?)</a>)')
    ids=id_pattern.findall(html)
    try:
        i=1
        for _id in ids:
            id_pa=re.compile('id=\"'+_id[1]+'\"')
            id_s=id_pa.findall(html)

            #removing unnecessary links(if no stuffs available for that link)
            if len(id_s)==0:
                html=html.replace(_id[0],'<span class=\"strong\">'+_id[2]+'</span>')
             #modifying id if more than one element have same id
            else:
                if len(id_s) > 1:
                    html=html.replace(_id[0],'<a class=\"xref\" href=\"#ck12-'+str(i)+'-'+_id[1]+'\">'+_id[2]+'</a>',1)
                    html=html.replace('id="'+_id[1]+'"','id="ck12-'+str(i)+'-'+_id[1]+'"',1)
                    i=i+1
                #Add figure no in internal links
                figure_no_pattern = re.compile('<div.*?id="'+_id[1]+'".*?>.*?Figure (\d+\.\d+).*?</div>',re.DOTALL)
                figure_no  = figure_no_pattern.findall(html)
                if len(figure_no) > 0:
                    link_with_figure_no = _id[0].replace(_id[2],figure_no[0])
                    html = html.replace(_id[0],link_with_figure_no)

    except Exception as detail:
         log.info(detail)

    #fixing id attribute that begins with number, or an '-'
    id_pattern=re.compile('id=\"([0-9-].*?)\"',re.DOTALL)
    ids=id_pattern.findall(html)
    for _id in ids:
        html=re.sub(' id="'+_id+'"',' id="ck12-'+_id+'"',html)

    #fixing dangling contents between un-numbered lists
    #ul_pattern = re.compile('</ul>(<[^p].*?)<ul>', re.DOTALL)
    #html = ul_pattern.sub(fix_ul, html)
    #ul_pattern = re.compile('</ul>([^<]*?)<ul>')
    #html = ul_pattern.sub(fix_ul, html)

    #fixing dangling contents between un-numbered lists
    #ol_pattern = re.compile('</ol>(<[^p].*?)<ol>', re.DOTALL)
    #html = ol_pattern.sub(fix_ol, html)
    #ol_pattern = re.compile('</ol>([^<]*?)<ol>')
    #html = ol_pattern.sub(fix_ol, html)

    #fixing dangling anchors after divs
    an_pattern = re.compile('</div>(<a .*?</a>)')
    html = an_pattern.sub(fix_dangling_anchor, html)

    #removing strong tag inside blockquotes
    bq_pattern = re.compile("<blockquote>\W*?<strong>")
    html = bq_pattern.sub("<blockquote><p><strong>", html)
    bq_pattern = re.compile("</strong>\W*?</blockquote>")
    html = bq_pattern.sub("</strong></p></blockquote>", html)

    #Wrapping dangling text
    #dangling_text_pattern = re.compile('(</\w+(?<=h[1-4]|ol|ul|di)[v]?>((\w|<[^p])(?:.(?!</p>))*?)<\w+(?<=h[1-4]|ol|ul|di)[v]?)',re.DOTALL)
    #html = dangling_text_pattern.sub(fix_dangling_text, html)

    #Fixing the <p> tags which are not having proper siblings with in it.
    #Throw out <div>,<h.> tags outside the <p>...</p> by adding </p> before it.
    p_siblings_pattern = re.compile(r'(\.*?>\S*<p>((?:.(?!</p>))*?)<\w+(?<=h[1-4]|di)[v]?)',re.DOTALL)
    html = p_siblings_pattern.sub(fix_p_siblings, html)

    #Removing unnessary </p> tag
    p_pattern = re.compile('(/\w+(?<=h[1-4]|di)[v]?>(\s*</p>\s*)<\w+)',re.DOTALL)
    html = p_pattern.sub(remove_end_p, html)

    table_soup = BeautifulSoup(html)
    theads = table_soup.findAll('thead')
    tbodys = table_soup.findAll('tbody')
    head_tds = [t.findAll('td') for t in theads if t.findAll('td')]
    body_tds = [t.findAll('td') for t in tbodys if t.findAll('td')]
    index_dict = {}
    for r in range(len(head_tds)):
        for t in range(len(head_tds[r])):
           if head_tds[r][t].find(True) is None and (head_tds[r][t].string is None or head_tds[r][t].string.strip() == '' ):
               head_tds[r][t].extract()
               index_dict[r] = t
    for k,v in index_dict.iteritems():
        try:
            for b in range(len(body_tds[k])):
                if body_tds[k][b].find(True) is None and (body_tds[k][b].string is None or body_tds[k][b].string.strip() == ''):
                    body_tds[k][b].extract()
        except:
            pass

    remove_emptyTags(table_soup,'tr')
    remove_emptyTags(table_soup,'thead')
    remove_emptyTags(table_soup,'tbody')
    remove_emptyTags(table_soup,'table')
    #generate_unique_ids(table_soup)
    html = table_soup.prettify()

    #Fixing Inner List items
    #list_soup =  BeautifulSoup(html)
    #lists = list_soup.findAll('li')
    #inner_lists = [l.findAll('ol') for l in lists if l.findAll('ol')]
    #innerLis = []
    #if inner_lists:
    #    for t in range(len(inner_lists)):
    #        for s in range(len(inner_lists[t])):
    #            innerLis.append(inner_lists[t][s].findAll('li'))
    #    for h in range(len(innerLis)):
    #        for i in range(len(innerLis[h])):
    #            my_char = chr(97+i)
    #            try:
    #                if innerLis[h][i].parent is not None:
    #                    innerLis[h][i].replaceWith("<div>&nbsp;&nbsp;&nbsp;&nbsp;"+my_char+"."+innerLis[h][i].renderContents()+"</div>")
    #            except:
    #                pass

    #    for i in range(len(inner_lists)):
    #        for t in range(len(inner_lists[i])):
    #            try:
    #                if innerLis[h][i].parent is not None:
    #                    inner_lists[i][t].replaceWith(inner_lists[i][t].renderContents())
    #            except:
    #                pass
    #    html = list_soup.prettify()
    #if settings.TRANSFORM_TABLE:
    #    html = tableToList(html)
    return html

def get_nonunique_ids_list(soup):
    ''' Provides douplicate ids list '''
    searchResults =soup.findAll(id=True)
    elementsIds = []
    for tag in searchResults:
        elementsIds.append(tag['id'])

    nonUniqueIds=[]
    for elementId in set(elementsIds):
        if(elementsIds.count(elementId)>1):
            nonUniqueIds.append(elementId)
    return nonUniqueIds

def get_href_values_list(soup):
    ''' Lists value attribute of all hrefs in the document. '''
    searchResults =soup.findAll(href=True)
    hrefValuesList = []

    for tag in searchResults:
        value = tag['href']
        if(value.startswith('#')):
            value = value[1:]
        hrefValuesList.append(value)
    hrefValuesList = list(set(hrefValuesList))
    return hrefValuesList

def create_unique_id(elementId, soup):
    ''' Append '_' and numbers 1, 2, 3 ... to id so as to make it unique'''
    searchResults =soup.findAll(id=re.compile(elementId + "$"))
    for index, element in enumerate(searchResults):
        element['id'] = element['id'] + '_' + str(index)

def generate_unique_ids(soup):
    ''' Performs unique id generation task. If douplicate id not value attribute of href'''
    result = False
    nonUniqueIdsList = get_nonunique_ids_list(soup)
    hrefValuesList = get_href_values_list(soup)
    for elementId in nonUniqueIdsList:
        if (hrefValuesList.count(elementId)<=0):
            create_unique_id(elementId, soup)
            result = True
    return result


def getNoOfColumns(table):
    thHeaders = len(table.tr.findAll('th'))
    tdHeaders = len(table.tr.findAll('td'))
    return thHeaders if thHeaders > tdHeaders else tdHeaders

def getNoOfRows(table):
    tableRows = table.findAll('tr')
    return len(tableRows)

def tableHasWideImage(table):
    spans = table.findAll('span')
    for eachSpan in spans:
        if eachSpan.has_key('class') and eachSpan['class'].find('x-ck12-img-inline') >= 0:
            return True
    divs = table.findAll('div')
    for eachDiv in divs:
        if eachDiv.has_key('class') and eachDiv['class'].find('x-ck12-img') >= 0:
            return True
    images = table.findAll('img')
    for eachImage in images:
        if eachImage.has_key('class') and eachImage['class'].find('math') >= 0:
            if eachImage.has_key('width') and int(eachImage['width']) >= int(settings.TABLE_MATH_WIDTH_THRESHOLD_EPUB):
                return True
            if eachImage.has_key('height') and int(eachImage['height']) >= int(settings.TABLE_MATH_HEIGHT_THRESHOLD_EPUB):
                return True
    return False

def tableNeedsConversion(table):
    noOfColumns = getNoOfColumns(table)
    return True if noOfColumns >= settings.TABLE_WIDTH_THRESHOLD else False

def tableToList(content):
    soup = BeautifulSoup(content)
    for table in soup.findAll('table'):
        log.info('Handling table with title: %s' %(table.get('title')))
        if not tableNeedsConversion(table):
            continue
        if len(table.findAll('td')) <= 0:
            continue
        newTable = Tag(soup, 'table')
        if table.caption:
            newTable.append(table.caption)
        thead = table.thead
        if thead:
            headers = thead.findAll('td')
        else:    
            headers = table.tr.findAll('th')
        hasHeaders = False
        if len(headers) > 0:
            hasHeaders = True
        log.info('Found headers: %s' %(len(headers)))
        try:
            for row in table.findAll('tr'):
                ul = Tag(soup, 'ul')
                i = 0
                foundTd = False
                for cell in row.findAll('td'):
                    li = Tag(soup, 'li')
                    if hasHeaders:
                        strong = Tag(soup, 'strong')
                        strong.contents.extend(headers[i].contents)
                        strongColon = Tag(soup, 'strong')
                        strongColon.string = ':'
                        li.append(strong)
                        li.append(strongColon)
                        i = i + 1
                    li.contents.extend(cell.contents)
                    ul.append(li)
                    foundTd = True
                if foundTd:
                    tr = Tag(soup, 'tr')
                    td = Tag(soup, 'td')
                    td.append(ul)
                    tr.append(td)
                    newTable.append(tr)
            for attr, value in table.attrs:
                newTable[attr] = value
            table.replaceWith(newTable)
        except Exception as e:
            log.error('Caught an exception while transforming wide tables. Skipping this table. %s' %(e.__str__()))
    return soup.prettify().decode('utf-8')

def tableNeedsConversionEpub(table):
    if getNoOfRows(table) >= settings.TABLE_HEIGHT_THRESHOLD_EPUB:
        log.info('No Of Rows: %s' %(getNoOfRows(table)))
        return True
    if getNoOfColumns(table) >= settings.TABLE_WIDTH_THRESHOLD_EPUB:
        log.info('No Of Columns: %s' %(getNoOfColumns(table)))
        return True
    if tableHasWideImage(table):
        log.info('tableHasWideImage: %s' %(tableHasWideImage(table)))
        return True
    return False

def create_xhtml_for_table(xhtml_body, base_path, resource_path, chapter_number, title):
    soup = BeautifulSoup(xhtml_body)
    newSoup = BeautifulSoup('')
    count = 0
    table_array = []
    for table in soup.findAll('table'):
        log.info('Handling table with title: %s' %(table.get('title')))
        if not tableNeedsConversionEpub(table):
            continue
        tableString = table.prettify()
        newTableSoup = BeautifulSoup(tableString)
        newTable = newTableSoup.findAll('table')[0]
        count = count + 1
        div = Tag(newSoup, 'div')
        if not newTable.has_key('id') or len(newTable['id'].strip()) <= 0:
            div['id'] = genURLSafeBase64Encode(getRandomString(10))
        else:
            div['id'] = newTable['id']
            del newTable['id']

        allIDs = [eachID['id'] for eachID in newTableSoup.findAll(id=True) if eachID.has_key('id')]
        for eachAnchor in  newTableSoup.findAll('a'):
            if eachAnchor.has_key('href') and eachAnchor['href'].startswith("#x-ck12") and eachAnchor['href'] not in allIDs:
                eachAnchor['href'] = '%s' %(str(chapter_number) + '.html' + eachAnchor['href'])
                log.info('eachAnchor: %s' %(eachAnchor['href']))

        div.append(newTable)
        para = Tag(soup, 'p')
        anchor = Tag(soup, 'a')
        strong = Tag(soup, 'strong')
        strong.string = 'Click here to return to the main text'
        anchor['href'] = str(chapter_number) + '.html#' +  div['id']
        anchor.string = strong
        para.append(anchor)
        div.append(para)
        option = {"output-xhtml":1, "clean":1, "enclose-text":1, "tidy-mark":0, "char-encoding":"utf8", "output-encoding":"ascii"}
        table_xhtml, errors = tidy_document(div.prettify(), option)
        table_xhtml_path = '%s/table_%s-%s.html' %(base_path, chapter_number, count)
        table_array.append(os.path.basename(table_xhtml_path))
        table_xhtml = improve_content(table_xhtml, base_path)
        table_xhtml = inject_css_link(table_xhtml)
        table_xhtml = table_xhtml.decode('utf-8')
        table_xhtml = table_xhtml.encode('ascii', 'xmlcharrefreplace')

        chapter_div = Tag(soup, 'div')
        firstPara = Tag(soup, 'p')
        anchor = Tag(soup, 'a')
        anchor['href'] = table_xhtml_path.replace('%s/' %(base_path), '')
        img = Tag(soup, 'img')
        img['src'] = "images/table.png"
        img['width'] = 200
        img['height'] = 100
        anchor.string = img
        firstPara.append(anchor)

        secondPara = Tag(soup, 'p')
        strong = Tag(soup, 'strong')
        strong.string = settings.TABLE_PLACEHOLDER_MESSAGE_EPUB
        secondPara.string = strong

        chapter_div['id'] = div['id']
        chapter_div.append(firstPara)
        chapter_div.append(secondPara)
        table.replaceWith(chapter_div)

        with codecs.open(table_xhtml_path, 'w', encoding='utf-8') as fd:
            fd.write(table_xhtml)
    xhtml_body = soup.prettify().decode('utf-8')
    return xhtml_body, table_array

def render_tables(xhtml_body, base_path, resource_path, chapter_number, title, optimizeForKindle):
    table_array = []
    if optimizeForKindle or settings.TRANSFORM_TABLE_OVERRIDE:
        # Convert side tables to a single column table
        if settings.TRANSFORM_TABLE:
            log.info('Converting tables to a single column table')
            xhtml_body = tableToList(xhtml_body)
            #return xhtml_body, []
        #pass
    else:
        if settings.TRANSFORM_TABLE_EPUB:
            log.info('Creating a table for each xhtml')
            xhtml_body, table_array = create_xhtml_for_table(xhtml_body, base_path, resource_path, chapter_number, title)
    return xhtml_body, table_array



#resize video images to (x*y)
def resize_image(video_src,x,y):
    img = Image.open(video_src).resize( (x,y) )
    image_size = img.size
    if image_size[0] <= 480 and image_size[1] <= 360 :
        img = img.resize( (x,y) )
        out = file(video_src, "w")
        try:
            img.save(out, img.format)
        finally:
            out.close()

#wrapping dangling anchors inside a <p>
def fix_dangling_anchor(match_object):
    return "</div><p>"+ match_object.group(1) + "</p>"

#wrapping dangling objects between 2 <ul>s with <p>
def fix_ul(match_object):
    return "</ul><p>"+ match_object.group(1) + "</p><ul>"

#wrapping dangling objects between 2 <ol>s with <p>
def fix_ol(match_object):
    return "</ol><p>"+ match_object.group(1) + "</p><ol>"

#the name attr should be in match_object.group(2). Returns everything else
def remove_name_attr(match_object):
    return "<a"+ match_object.group(1) +" "+ match_object.group(3) +">"

#Put </p> before the child <div>, For to avoid the <div> tags inside <p>..</p>
def fix_p_siblings(match_object):
    return match_object.group(1).replace(match_object.group(2), match_object.group(2)+ "</p>")

#Enclosing <p> tags with dangling text
def fix_dangling_text(match_object):
    return match_object.group(1).replace(match_object.group(2), "<p>" +match_object.group(2)+ "</p>")

#remove unnessary </p> tag
def remove_end_p(match_object):
    return match_object.group(1).replace(match_object.group(2), "")

#inject css link
def inject_css_link(html):
    head_pattern=re.compile('</head>')
    head_html=head_pattern.findall(html)
    html=html.replace(head_html[0],"<link type=\"text/css\" rel=\"stylesheet\" media=\"all\" href=\"stylesheet.css\" />"+head_html[0])
    html=html.replace(head_html[0],"<link type=\"text/css\" rel=\"stylesheet\" media=\"all\" href=\"ck12_stylesheet.css\" />"+head_html[0])
    return html

def add_author_attribution(author_attribution_page,
                           book_authors_string,
                           book_editors_string,
                           book_sources_string,
                           book_contributors_string,
                           book_translators_string,
                           book_reviewers_string,
                           book_technicalreviewers_string):

        file_handle = open(author_attribution_page, "r")
        contents = file_handle.read()
        file_handle.close()
        if book_authors_string:
            contents = re.sub('<!--(.*)__authors__(.*)-->', '\\1__authors__\\2', contents)
            contents = contents.replace('__authors__', book_authors_string)
        if book_editors_string:
            contents = re.sub('<!--(.*)__editors__(.*)-->', '\\1__editors__\\2', contents)
            contents = contents.replace('__editors__', book_editors_string)
        if book_contributors_string:
            contents = re.sub('<!--(.*)__contributors__(.*)-->','\\1__contributors__\\2', contents)
            contents = contents.replace('__contributors__', book_contributors_string)
        if book_sources_string:
            contents = re.sub('<!--(.*)__sources__(.*)-->', '\\1__sources__\\2', contents)
            contents = contents.replace('__sources__', book_sources_string)
        if book_translators_string:
            contents = re.sub('<!--(.*)__translators__(.*)-->','\\1__translators__\\2', contents)
            contents = contents.replace('__translators__', book_translators_string)
        if book_reviewers_string:
            contents = re.sub('<!--(.*)__reviewers__(.*)-->','\\1__reviewers__\\2', contents)
            contents = contents.replace('__reviewers__', book_reviewers_string)
        if book_technicalreviewers_string:
            contents = re.sub('<!--(.*)__technicalreviewers__(.*)-->','\\1__technicalreviewers__\\2', contents)
            contents = contents.replace('__technicalreviewers__', book_technicalreviewers_string)

        base_path = os.path.dirname(author_attribution_page)
        filename = os.path.basename(author_attribution_page)
        save_html(contents.encode('utf-8'), base_path, filename)


def add_isbn_number(workdir, isbn_number):
    opf_path = workdir+"/OEBPS/content.opf"
    if not isbn_number=='':
        file_handle = open(opf_path, "r")
        a = file_handle.read()
        file_handle.close()
        b = a.replace("__isbn_number__",str(isbn_number))
        #contents = re.sub('<!--(.*)__authors__(.*)-->', '\\1__authors__\\2', a)
        #contents = contents.replace('__authors__', book_authors_string)
        file_handle =open(opf_path, "w")
        file_handle.write(b)
        file_handle.close()
        licence_path=workdir+"/OEBPS/ck12_epub_licence.html"
        file_handle = open(licence_path, "r")
        a = file_handle.read()
        file_handle.close()
        b = a.replace("__isbn_number__",str(isbn_number))
        file_handle =open(licence_path, "w")
        file_handle.write(b)
        file_handle.close()

#fixing_image_extention
def fix_image_extension(epub_book_path):
    if can_read(epub_book_path):
       epub_book=epub_book_path.rsplit('/',1)
       book_path=epub_book[0]
       log.info("path:"+book_path)
       book_name=epub_book[1]
       log.info("name:"+book_name)
       tmp_dir='ck12'+create_timestamp()
       cmd='cd /tmp;mkdir '+tmp_dir
       os.system(cmd)
       cmd ='cp '+epub_book_path+' /tmp/'+tmp_dir+'/.'
       log.info(cmd)
       os.system(cmd)
       book_path='/tmp/'+tmp_dir
       cmd ='cd '+book_path+';'+'unzip -o -q '+book_name+';'
       os.system(cmd)
       dir_list=os.listdir(book_path+'/OEBPS')

       #read opf
       opf_path=book_path+'/OEBPS/content.opf'
       opf_content=read_file(opf_path)

       log.info("Adding image extentions.....")
       #for each directory in /OEBPS
       for _dir in dir_list:
           dir_path=book_path+'/OEBPS/'+_dir
           if os.path.isdir(dir_path):
               opf_content=add_extensions(dir_path,book_path,opf_content)

       #rewrite opf
       write_file(opf_path,opf_content)

       #add math extensions in html (separately)
       add_math_ext_html(book_path+'/OEBPS')

       #bundle new book
       cmd ="cd "+book_path+";rm "+book_name
       os.system(cmd)

       cmd ="cd "+book_path+";zip -0Xq "+ book_name +" mimetype;zip -Xr9Dq "+ book_name +" *"
       os.system(cmd)

       log.info("The epub book '"+book_name+"' successfully Modified")
       log.info("Location: "+book_path+"/"+book_name)

#add image extentions in html local ref dir,math_image_dir and html files(only for regular images)
def add_extensions(dir_path,book_path,opf_content):
    images=os.listdir(dir_path)
    file_pattern=re.compile('ck12_([0-9].*)_files',re.DOTALL)
    file_name=file_pattern.findall(dir_path)
    html=' '
    content_changed=0

    #if directory  is a html local reference directory
    if len(file_name)!=0:
        html=read_file(book_path+'/OEBPS/'+file_name[0]+'.html')

    #for each images in a directory
    for image_name in images:
        image_path=dir_path+'/'+image_name
        try:
            image_obj = Image.open(image_path)
            image_ext=os.path.splitext(image_path)

            # if image file have no extension
            if len(image_ext[1])==0:
                image_format =image_obj.format.lower()
                cmd ='mv '+image_path+' '+image_path+'.'+image_format
                os.system(cmd)
                new_image_name=image_name+'.'+image_format
		opf_content=opf_content.replace(image_name,new_image_name)

                #if html file exist
                if len(html)!=1:
                   html=html.replace(image_name,new_image_name)
                   content_changed=1
        except Exception:
            continue

    #if html file is changed
    if content_changed==1:
        write_file(book_path+'/OEBPS/'+file_name[0]+'.html',html)

    return opf_content


#add math extensions in html files
def add_math_ext_html(work_dir):
    log.info("Adding math image extensions.....")
    math_dir=work_dir+'/ck12_math_images_dir'
    files=os.listdir(work_dir)
    htmls={}

    #put  html content of all html files into a dictionary in the name file name
    for _file in files:
        file_path=work_dir+'/'+_file
        if os.path.isfile(file_path):
           file_ext=os.path.splitext(file_path)
           #if _file is a html file
           if file_ext[1]=='.html':
              html=read_file(work_dir+'/'+_file)
              if html!=' ':
                  htmls[_file]=html
           else:
               continue
        else:
          continue

    #get all math images
    math_images=os.listdir(math_dir)
    #for each math image
    for new_math_image in math_images:
        old_image_name=os.path.splitext(new_math_image)
        if len(old_image_name[0])!=0:
            #replace a math image in all html content
            for html in htmls:
                #replace new image name( if math image not have ext already)
                if htmls[html].find(new_math_image)==-1:
                      htmls[html]=htmls[html].replace(old_image_name[0],new_math_image)
        else:
            continue

    #rewrite all html content
    for html in htmls:
        file_path=work_dir+'/'+html
        write_file(file_path,htmls[html])

#read content
def read_file(path):
    if can_read(path):
       _file=open(path,'r')
       content=_file.read()
       _file.close()
       return content
    else:
       return ' '

#write content
def write_file(path,content):

    if can_read(path):
       _file=open(path,'w')
       _file.write(content)
       _file.close()
       return True
    else:
       return False

#get the title from an html page
def get_html_title(html):
    title = ''
    return title

#clean up html from offending stuff that do not play nice in epub
def purify_html(html):
    result = html
    result = remove_head(result)
    result = remove_javascript(result)
    return result

#remove javascript
def remove_javascript(html):
    #p = re.compile('<script[^>]*>[^<]*</script>', {re.DOTALL, re.IGNORECASE})
    p = re.compile('<script[^>]*>[^<]*</script>', re.DOTALL + re.IGNORECASE)
    return p.sub('', html)

#remove javascript
def remove_head(html):
    p = re.compile('<head[^>]*>.*</head>', re.DOTALL + re.IGNORECASE)
    return p.sub('', html)

def transform_to_xhtml(html):
    for eachSchemaOrgDiv in schemaOrg_re.findall(html):
        newSchemaOrgDiv = eachSchemaOrgDiv
        for eachMeta in meta_re.findall(eachSchemaOrgDiv):
            newSchemaOrgDiv = newSchemaOrgDiv.replace(eachMeta, '<!-- %s -->' %(eachMeta))
        html = html.replace(eachSchemaOrgDiv, newSchemaOrgDiv)

    option = {"output-xhtml":1, "clean":1, "enclose-text":1, "tidy-mark":0, "char-encoding":"utf8", "output-encoding":"ascii"}
    document, errors = tidy_document(html, option)
    if type(document).__name__ != 'unicode':
        document = document.decode('utf-8')
    return fix_tidy_issues(document)

# tidy has a few bugs, and it hasn't been maintained in the past few years.
# Compensate for all the problems here.
def fix_tidy_issues(buffer):
    # 1. tidy remove double backslash from image alt tag.
    # This makes math notation invalid.
    img_pattern_re = re.compile("<img src=\"([^\"]+)\" alt=\"(.*?)\" class=\"x-ck12[-block]*-math\" />")
    img_patterns = img_pattern_re.findall(buffer.replace('\n',''))
    for eachImgPattern in img_patterns:
        altText = eachImgPattern[1]
        # Replace // with ///
        backslashEscapedAltText = altText.replace('\\\\', '\\\\\\')
        buffer = buffer.replace(altText, backslashEscapedAltText)

    ## Uncomment the meta tag in schema.org divs
    for eachSchemaOrgDiv in schemaOrg_re.findall(buffer):
        newSchemaOrgDiv = eachSchemaOrgDiv
        for eachMeta in meta_comment_re.findall(eachSchemaOrgDiv):
            newSchemaOrgDiv = newSchemaOrgDiv.replace(eachMeta, eachMeta.replace('<!--', '').replace('-->', ''))
        buffer = buffer.replace(eachSchemaOrgDiv, newSchemaOrgDiv)

    return buffer

#remove indents
def remove_eol(text):
    return re.sub('\n',' ',text)

#download an image, store in directory
def retrieve_image(url, path):
    log.info(url)
    log.info(path)
    return urllib.urlretrieve(url, path)
    return 0

def create_random_hash():
    return hashlib.md5(random.random().__str__()).hexdigest()

def create_timestamp():
    return datetime.now().strftime("%Y%m%d%H%M%S%f")

def create_unique_path(prefix):
    if not prefix.endswith('/'):
        prefix += '/'
    #return prefix + create_random_hash()
    return prefix + create_timestamp()

def create_unique_path_for_math(prefix, imgsrc):
    if not prefix.endswith('/'):
        prefix += '/'
    #return prefix + create_random_hash()
    return prefix + hashlib.md5(imgsrc).hexdigest()

def auto_resize_image(image_path, file_name, size_parameter):
    source_path = image_path +"/"+ file_name
    dest_path = image_path +"/"+ file_name +"__"
    cmd="convert "+ source_path +" -resize "+ size_parameter +" "+ dest_path
    a = os.system(cmd)
    if (a == 0) :
        cmd2 = "mv "+ dest_path +" "+ source_path
        os.system(cmd2)


def auto_resize_image_in_dir(path):
    image_list = os.listdir(path)
    max_image_size = settings.MAX_IMAGE_SIZE
    for file in image_list:
        #auto_resize_image(path, file, "1024x1024\\>")
        auto_resize_image(path, file, max_image_size)


def get_image_dimension(image_path):
    #fetching image size using identify tool from imagemagic
    cmd=["identify", image_path ]
    a = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    ret = a.communicate()[0]
    dimensions = ret.split(" ")[2]

    #returns a tuple [width, height]
    return dimensions.split("x")

#Methods for processing metadata

#add book title from the template
def add_book_title(workdir, book_title):
    # Escaping single quotes
    book_title=book_title.replace("'","\\\\\'")
    # Escaping Double quotes
    book_title=book_title.replace('"','\\\\\\"')
    #Escaping ampersand
    book_title=book_title.replace('&','\\\\&')
    cmd='cd '+ workdir +'; sed -i "s/__book_title__/'+book_title+'/" OEBPS/*.*'
    os.system(cmd)

#Add the TOC content to the toc file
def add_toc(workdir, toc):
    path = workdir+"/OEBPS/toc.ncx"
    file_handle = codecs.open(path, "r", encoding='utf-8')
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__TOC__", toc)
    file_handle = codecs.open(path, "w", encoding='utf-8')
    file_handle.write(b)
    file_handle.close()


def escape_html_enitities(text):
    text = safe_decode(text)
    return saxutils.escape(text)

#create a TOC xml element for a chapter
def make_toc_element(title, playOrder, source):
    title = escape_html_enitities(title)
    toc_template = settings.TOC_ELEMENT_TEMPLATE
    return toc_template % {'num': playOrder, 'title':title, 'source': source}

#Add the HTML TOC content to the toc.html file
def add_html_toc(workdir, toc):
    path = workdir+"/OEBPS/toc.html"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__TOC__", toc)
    file_handle = codecs.open(path, "w", encoding='utf-8')
    file_handle.write(b)
    file_handle.close()

#create a HTML TOC element for a chapter
def make_html_toc_element(title, source):
    #playOrder=playOrder+1
    title = escape_html_enitities(title)
    toc_template = settings.HTML_TOC_ELEMENT_TEMPLATE
    return toc_template % {'title':title, 'source': source}

#create a manifest element for a resource
def make_manifest_element(number, source):
    template = settings.MANIFEST_ELEMENT_TEMPLATE
    return template % {'num': number, 'source': source}

#create an image manifest element for a resource
def make_image_manifest_element(number, source, format):
    template = settings.IMAGE_MANIFEST_ELEMENT_TEMPLATE
    return template % {'num': number, 'source': source, 'format': format}

def make_table_manifest_element(number, source):
    template = settings.TABLE_MANIFEST_ELEMENT_TEMPLATE
    return template % {'num': number, 'source': source}

#add the manifest content to the content.opf file
def add_manifest(workdir, manifest):
    path = workdir+"/OEBPS/content.opf"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__MANIFEST__", manifest)
    file_handle =open(path, "w")
    file_handle.write(b)
    file_handle.close()

#add the Image manifest content to the content.opf file
def add_image_manifest(workdir, manifest):
    path = workdir+"/OEBPS/content.opf"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__IMAGE_MANIFEST__", manifest)
    file_handle =open(path, "w")
    file_handle.write(b)
    file_handle.close()

#add the table manifest content to the content.opf file
def add_table_manifest(workdir, manifest):
    path = workdir+"/OEBPS/content.opf"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__TABLE_MANIFEST__", manifest)
    file_handle =open(path, "w")
    file_handle.write(b)
    file_handle.close()

#create a spine element for a resource
def make_spine_element(number):
    template = settings.SPINE_ELEMENT_TEMPLATE
    return template % {'num': number}

#create a table spine element for a resource
def make_table_spine_element(number):
    template = settings.TABLE_SPINE_ELEMENT_TEMPLATE
    return template % {'num': number}

#add the spine content to the content.opf file
def add_spine(workdir, spine):
    path = workdir+"/OEBPS/content.opf"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__SPINE__", spine)
    file_handle =open(path, "w")
    file_handle.write(b)
    file_handle.close()

#add the spine content to the content.opf file
def add_table_spine(workdir, table_spine):
    path = workdir+"/OEBPS/content.opf"
    file_handle = open(path, "r")
    a = file_handle.read()
    file_handle.close()
    b = a.replace("__TABLE_SPINE__", table_spine)
    file_handle =open(path, "w")
    file_handle.write(b)
    file_handle.close()

def removeTmpDirectories(workdir):
    rm_cmd = "cd "+workdir+";find . ! -name '*.epub' -delete";
    os.system(rm_cmd);

def constructFullName(first_name, middle_name, last_name):
    fullname = ""
    if first_name:
        fullname = first_name + " "
    if middle_name:
        fullname = fullname + middle_name + " "
    if last_name:
        fullname = fullname + last_name
    return fullname.strip()

def escape_xml_entities(title=None):
    if (title):
        try:
            alnum = str(title).translate(None, ' ').isalnum()
            if (not alnum):
                title = saxutils.escape(title)
        except:
            alnum = None
    return (title)
