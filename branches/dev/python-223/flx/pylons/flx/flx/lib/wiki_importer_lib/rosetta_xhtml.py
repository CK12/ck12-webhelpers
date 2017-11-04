## rosetta_xhtml.py:  Converts raw xhtml to rosetta compliant xhtml

import re
from flx.lib.helpers import genURLSafeBase64Encode, load_pylons_config, transform_to_xhtml, safe_decode
import logging
import settings
import urllib
import traceback
import htmlentitydefs
import os
from tidylib import tidy_document
from pylons import config
from xml.dom import minidom
from xml.sax import saxutils
#from BeautifulSoup import BeautifulSoup

from urllib import quote, unquote
#Initialing logger
log_level = settings.LEVELS.get(settings.LOG_LEVEL, logging.NOTSET)

class CK12RosettaXHTML:

    raw_xhtml = ""
    rosetta_xhtml = ""

    def __init__(self):
        self.log = logging.getLogger(__name__)
    
    def to_rosetta_xhtml(self, _raw_xhtml):
        self.raw_xhtml = _raw_xhtml
        self.rosetta_xhtml = _raw_xhtml
        self.fix_heading_ids()
        self.fix_classes()
        self.fix_embedded_objects()
        self.fix_all_ids()
        self.fix_tags()
        self.post_process()
        return self.rosetta_xhtml

    def fix_heading_ids(self):
        header_num = 2

        while header_num < 7:
            h_re = re.compile('(<h%s>(.*?)</h%s>)'%(header_num,header_num), re.DOTALL)
            h_txt = h_re.findall(self.rosetta_xhtml)
            for each_txt in h_txt:
                try:
                    offending_content = ['<iframe','<object','fb2ncustomembed','embed']
                    if any(each_txt[1].__contains__(x) for x in offending_content):
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(each_txt[0], each_txt[1])
                        continue
                    to_be_replaced_h = each_txt[0]
                    h_val = each_txt[1].replace('<strong>','').replace('</strong>','')
                    h_id = genURLSafeBase64Encode(h_val.strip())
                    new_h = to_be_replaced_h.replace('<h%s>'%header_num,'<h%s id="%s">'%(header_num,h_id)).replace('<strong>','').replace('</strong>','')
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(to_be_replaced_h, new_h)
                except Exception as e:
                    self.log.error('HEADER ID FIXER: %s' % e.__str__())
                    continue
            header_num = header_num + 1 

    def fix_embedded_objects(self):
        iframe_re = re.compile('(<iframe.*?</iframe>)', re.DOTALL)
        all_iframes = iframe_re.findall(self.rosetta_xhtml)
        src_re = re.compile('(src="(.*?)")')
        allow_fullscreen_re = re.compile('(allowfullscreen=["|\'].*?["|\'])')
        thumbnail_url_re = re.compile('(thumbnail_url=["|\'].*?["|\'])')
        internalid_re = re.compile('(internalid=["|\'].*?["|\'])')
        for each_iframe in all_iframes:
            if each_iframe.__contains__('@@embeddable'):
                continue
            new_iframe = each_iframe
            tn_url_code = thumbnail_url_re.findall(each_iframe)
            afs_code = allow_fullscreen_re.findall(each_iframe)
            internalid_code = internalid_re.findall(each_iframe)
            if tn_url_code:
                new_iframe = new_iframe.replace(tn_url_code[0],'')
            if afs_code:
                new_iframe = new_iframe.replace(afs_code[0],'')
            if internalid_code:
                new_iframe = new_iframe.replace(internalid_code[0],'')
            src_match = src_re.findall(each_iframe)
            if not src_match:
                continue
            src = src_match[0][1]
            src_code = src_match[0][0]
            new_src = src
            new_embed = None
            videoid = None
            if src.__contains__('youtube'):
                new_src,videoid = self.fix_youtube(src)
            elif src.__contains__('teachertube'):
                new_embed,new_src,videoid = self.fix_teachertube(src)
            elif src.__contains__('schooltube'):
                new_src,videoid = self.fix_schooltube(src)
            if not videoid:
                videoid = str(videoid)
            if not new_embed:
                new_embed = new_src
            videoid = genURLSafeBase64Encode(videoid)
            each_iframe_embeddable = genURLSafeBase64Encode(each_iframe.replace(src, new_embed), usePrefix=False)
            embeddable = "<!-- @@author=\"\" --><!-- @@license=\"\" --><!-- @@embeddable=\"%s\" -->"%each_iframe_embeddable
            new_iframe = new_iframe.replace("</iframe>","%s</iframe>"%embeddable)
            new_iframe = new_iframe.replace(src_code, 'src="%s" name="NoIdFoundInJSON" id="%s"'%(new_src,videoid))
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_iframe, new_iframe)
        object_re = re.compile('(<object.*?</object>)', re.DOTALL)
        all_objects = object_re.findall(self.rosetta_xhtml)
        embed_re1 = re.compile('<embed.*?flashvars="(.*?)".*?/>', re.DOTALL)
        embed_re2 = re.compile('<embed.*?flashvars="(.*?)".*?</embed>', re.DOTALL)
        for each_object in all_objects:
            new_object = each_object
            flashvars = embed_re1.findall(each_object)
            if not flashvars:
                flashvars = embed_re2.findall(each_object)
            if flashvars:
                try:
                    src = flashvars[0].split('file=')[1]
                except Exception as e:
                    data_re = re.compile('data="(.*?)"',re.DOTALL)
                    try:
                        src = data_re.findall(each_object)[0]
                    except Exception as e:
                        src = "None"
            else:
                src = "None"
            if src:
                new_src = src
                videoid = None
                new_embed = None
                if src.__contains__('youtube'):
                    new_src,videoid = self.fix_youtube(src)
                elif src.__contains__('teachertube'):
                    new_embed,new_src,videoid = self.fix_teachertube(src)
                elif src.__contains__('schooltube'):
                    new_src,videoid = self.fix_schooltube(src)
                if not videoid:
                    videoid = str(videoid)
                if not new_embed:
                    new_embed = new_src
                videoid = genURLSafeBase64Encode(videoid)
                each_object_embeddable = genURLSafeBase64Encode(each_object.replace(src, new_embed), usePrefix=False)
                new_object = '<iframe id="%s" name="NoIdFoundInJSON" src="%s" width="" height="" title="" longdesc="" frameborder="0" class="x-ck12-nofloat"><!-- @@author="" --><!-- @@license="" --><!-- @@embeddable="%s" --></iframe>'%(videoid, new_src, each_object_embeddable)
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_object, new_object)
        self.fix_custom_embed(self.rosetta_xhtml)

    def fix_custom_embed(self, xhtml):
        self.rosetta_xhtml = xhtml
        customembed_re = re.compile('<fb2ncustomembed.*?</fb2ncustomembed>', re.DOTALL)
        all_customembeds = customembed_re.findall(self.rosetta_xhtml)
        htmllocal_re = re.compile('htmllocal="(.*?)"', re.DOTALL)
        for each_customembed in all_customembeds:
            htmllocal_val = htmllocal_re.findall(each_customembed)
            if htmllocal_val:
                embed_val = htmllocal_val[0].replace('DOCBOOKLEFTANGLE','<').replace('DOCBOOKRIGHTANGLE','>').replace('DOCBOOKDOUBLEQUOTE','"')
                object_id = 'None'
                try:
                    if embed_val.__contains__('id='):
                        object_re = re.compile(' id="(.*?)"', re.DOTALL)
                        object_id = object_re.findall(embed_val)[0]
                except Exception as e:
                    object_id = 'None'
                object_id = genURLSafeBase64Encode(object_id)
                embeddable = genURLSafeBase64Encode(embed_val, usePrefix=False)
                new_customembed = '<iframe id="%s" name="NoIdFoundInJSON" src="None" width="" height="" title="" longdesc="" frameborder="0" class="x-ck12-nofloat"><!-- @@author="" --><!-- @@license="" --><!-- @@embeddable="%s" --></iframe>'%(object_id,embeddable)
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_customembed, new_customembed)
        iframe_re = re.compile('<iframe.*?</iframe>', re.DOTALL)
        id_re = re.compile('id="(.*?)"', re.DOTALL)
        src_re = re.compile('src="(.*?)"', re.DOTALL)
        customattrslocal_re = re.compile('customattrslocal="(.*?)"', re.DOTALL)
       
        all_iframes = iframe_re.findall(self.rosetta_xhtml)
        for each_iframe in all_iframes:
            iframe_id = id_re.findall(each_iframe)
            if iframe_id:
                if iframe_id[0].startswith('eo_customembed'):
                    customval = customattrslocal_re.findall(each_iframe)
                    try:
                        customval = customval[0].replace('DOCBOOKDOUBLEQUOTE','"')
                        src = src_re.findall(customval)
                        if not src:
                            continue
                        object_id = genURLSafeBase64Encode(iframe_id[0])
                        embeddable = genURLSafeBase64Encode('<iframe %s></iframe>'%customval, usePrefix=False)
                        new_customembed = '<iframe id="%s" name="NoIdFoundInJSON" src="None" width="" height="" title="" longdesc="" frameborder="0" class="x-ck12-nofloat"><!-- @@author="" --><!-- @@license="" --><!-- @@embeddable="%s" --></iframe>'%(object_id,embeddable)
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(each_iframe,new_customembed)
                    except Exception as e:
                        self.log.error('Custom Embed processor: %s' % e.__str__())
        embed_re = re.compile('<embed.*?\)"\s*/>', re.DOTALL)
        fileref_re = re.compile('fileref="(.*?)"', re.DOTALL)
        flashvars_re = re.compile('flashvars="(.*?)"', re.DOTALL)
        id_re = re.compile('id="(.*?)"', re.DOTALL)
        width_re = re.compile('[\.\&]width=(.*?)&', re.DOTALL)
        height_re = re.compile('[\.\&]height=(.*?)&', re.DOTALL)
        all_embeds = embed_re.findall(self.rosetta_xhtml)
        for each_embed in all_embeds:
            try:
                flashvars = flashvars_re.findall(each_embed)
                fileref = fileref_re.findall(each_embed)
                videoid = id_re.findall(each_embed)
                if fileref:
                    src = fileref[0]
                else:
                    self.log.info('No fileref found for EO: %s' % each_embed)
                    continue
                if videoid:
                    videoid = videoid[0]
                else:
                    videoid = 'None'
                videoid = genURLSafeBase64Encode(videoid)
                if flashvars:
                    flashvars = flashvars[0]
                    width_val = width_re.findall(flashvars) 
                    height_val = height_re.findall(flashvars) 
                    if width_val:
                        width_val = width_val[0]
                    else:
                        width_val = ''
                    if height_val:
                        height_val = height_val[0]
                    else:
                        height_val = ''
                    each_embeddable = genURLSafeBase64Encode('<embed width="%s" height="%s" src="%s" flashvars="%s" />'%(width_val, height_val,src,flashvars), usePrefix=False)
                    new_embed = '<iframe id="%s" name="NoIdFoundInJSON" src="%s" width="" height="" title="" longdesc="" frameborder="0" class="x-ck12-nofloat"><!-- @@author="" --><!-- @@license="" --><!-- @@embeddable="%s" --></iframe>'%(videoid, src, each_embeddable)
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_embed, new_embed)
            except Exception as e:
                continue
        return self.rosetta_xhtml

    def fix_youtube(self, old_src):
        videoid_re = re.compile('.*embed/(.*)')
        new_src = old_src
        videoid = None
        try:
            videoid = videoid_re.findall(old_src)[0].split('?')[0]
            if videoid:
                new_src = 'http://www.youtube.com/v/%s'%videoid
        except Exception as e:
            new_src = old_src
        try:
            if not videoid:
                videoid = old_src.split('v=')[1].split('&')[0]
            if videoid:
                new_src = 'http://www.youtube.com/v/%s'%videoid
        except Exception as e:
            new_src = old_src
        return new_src,videoid

    def fix_teachertube(self, old_src):
        videoid = None
        try:
            videoid = old_src.split("video_")[1].split('&')[0]
        except Exception as e:
            videoid = None
        if videoid:
            new_src = u'http://www.teachertube.com/viewVideo.php?video_id=%s'%videoid
            new_embed = u'<embed src="http://www.teachertube.com/embed/player.swf"  width="470"  height="275"  bgcolor="undefined"  allowscriptaccess="always"  allowfullscreen="true"  flashvars="file=http://www.teachertube.com/embedFLV.php?pg=video_%s&menu=false&frontcolor=ffffff&lightcolor=FF0000&logo=http://www.teachertube.com/www3/images/greylogo.swf&skin=http://www.teachertube.com/embed/overlay.swf&volume=80&controlbar=over&displayclick=link&viral.link=http://www.teachertube.com/viewVideo.php?video_id=%s&stretching=exactfit&plugins=viral-2&viral.callout=none&viral.onpause=false" />'%(videoid, videoid)
            return new_embed,new_src,videoid
        videoid_re = re.compile('.*v/(.*)')
        new_src = old_src
        try:
            videoid = videoid_re.findall(old_src)[0].split('?')[0]
            if videoid:
                new_src = u'http://www.teachertube.com/viewVideo.php?video_id=%s'%videoid
                new_embed = u'<embed src="http://www.teachertube.com/embed/player.swf"  width="470"  height="275"  bgcolor="undefined"  allowscriptaccess="always"  allowfullscreen="true"  flashvars="file=http://www.teachertube.com/embedFLV.php?pg=video_%s&menu=false&frontcolor=ffffff&lightcolor=FF0000&logo=http://www.teachertube.com/www3/images/greylogo.swf&skin=http://www.teachertube.com/embed/overlay.swf&volume=80&controlbar=over&displayclick=link&viral.link=http://www.teachertube.com/viewVideo.php?video_id=%s&stretching=exactfit&plugins=viral-2&viral.callout=none&viral.onpause=false" />'%(videoid,videoid)
        except Exception as e:
            new_src = old_src
            new_embed = new_src
        return new_embed,new_src,videoid
  
    def fix_schooltube(self, old_src):
        videoid = None
        videoid_re = re.compile('.*v/(.*)')
        new_src = old_src
        try:
            videoid = videoid_re.findall(old_src)[0].split('?')[0]
            if videoid:
                new_src = u'http://www.schooltube.com/embed/%s'%videoid
        except Exception as e:
            new_src = old_src
        return new_src,videoid


    def fix_classes(self):
        ele_pattern = re.compile("<.*?>", re.DOTALL)
        class_re = re.compile('(class="(.*?)")',re.DOTALL)
        ele_matches = ele_pattern.findall(self.rosetta_xhtml)
        for each_ele in ele_matches:
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ele, each_ele.replace('&#38;#10;',' '))
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ele, each_ele.replace('&amp;#10;',' '))
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ele, each_ele.replace('&#10;',' '))
            each_ele = each_ele.replace('&#38;#10;',' ').replace('&#10;',' ').replace('&amp;#10;',' ')
            class_match = class_re.findall(each_ele)
            if class_match:
                if class_match[0][1]:
                    class_names = class_match[0][1].split(' ')
                    full_class = class_match[0][1]
                    for each_class in class_names:
                        if not each_class.__contains__('x-ck12-'):
                            full_class = full_class.replace(each_class,'')
                    new_ele = each_ele.replace(class_match[0][0], 'class="%s"'%full_class.strip())
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ele, new_ele)
                            
        full_img_re = re.compile('<img.*?longdesc="(.*?)".*?>', re.DOTALL)
        img_tags = full_img_re.findall(self.rosetta_xhtml)
        for each_img_tag in img_tags:
            try:
                longdesc = each_img_tag
                new_img_tag = each_img_tag.replace(longdesc, quote(unquote(longdesc)))
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_img_tag, new_img_tag)
            except Exception as e:
                continue

        full_img_re = re.compile('<img.*?>', re.DOTALL)
        img_tags = full_img_re.findall(self.rosetta_xhtml)
        class_re = re.compile('(class="(.*?)")', re.DOTALL)
        src_re = re.compile('(src="(.*?)")', re.DOTALL)
        for each_img_tag in img_tags:
            try:
                img_src = src_re.findall(each_img_tag)
                img_class = class_re.findall(each_img_tag)
                new_img_class = None
                if img_src[0][1].__contains__('ucs?math=') or img_src[0][1].__contains__('ucs/?math='):
                    new_img_class = 'class="x-ck12-math"'
                elif img_src[0][1].__contains__('ucs?blockmath=') or img_src[0][1].__contains__('ucs/?blockmath='):
                    new_img_class = 'class="x-ck12-block-math"'
                new_img_tag = each_img_tag
                if img_class and new_img_class:
                    new_img_tag = each_img_tag.replace(img_class[0][0],new_img_class)
                elif new_img_class:
                    new_img_tag = each_img_tag.replace(img_src[0][0],"%s %s" % (img_src[0][0], new_img_class))
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_img_tag, new_img_tag)
            except Exception as e:
                continue

            '''
            img_class = class_pattern.findall(div)
            try:
                if len(img_class) != 0:   
                    if len(img_class[0][1])!=0 or len(img_class[0][3])!=0:     
                        new_div = div.replace(img_class[0][0],img_class[0][2])
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(div,new_div)        
            except Exception as e:
                continue
        div_pattern = re.compile("<object.*?>", re.DOTALL)
        divs = div_pattern.findall(self.rosetta_xhtml)          
        for div in divs:
            class_pattern = re.compile('class="(\w*?)\s*?([a-zA-Z0-9-]*?ck12[a-zA-Z0-9-]*)\s*(\w*?))"')
            img_class = class_pattern.findall(div)
            print img_class
            try:
                if len(img_class) != 0:   
                    if len(img_class[0][1])!=0 or len(img_class[0][3])!=0:     
                        new_div = div.replace(img_class[0][0],img_class[0][2])
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(div,new_div)        
            except Exception as e:
                continue

        a_pattern = re.compile("<a.*?>", re.DOTALL)
        a_s = a_pattern.findall(self.rosetta_xhtml)          
        for each_a in a_s:
            class_pattern = re.compile('class="(.*?)"')
            a_class = class_pattern.findall(each_a)
            try:
                if len(a_class) != 0:   
                    new_a = each_a.replace(a_class[0],'')
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a,new_a)        
            except Exception as e:
                continue
        '''
    def fix_all_ids(self):
        table_pattern = re.compile("<table.*?>", re.DOTALL)
        table_matches = table_pattern.findall(self.rosetta_xhtml)
        table_id_pattern = re.compile('(id="(.*?)")',re.DOTALL)
        table_title_pattern = re.compile('(title="(.*?)")',re.DOTALL)
        for each_table in table_matches:
            table_id = table_id_pattern.findall(each_table)
            new_table = each_table
            if table_id:
                new_table_id = table_id[0][1]
                if not new_table_id:
                    new_table_id = 'table'
                new_table = each_table.replace(table_id[0][0], 'id="%s"'%new_table_id)
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_table, new_table)
            else:
                new_table_id = new_table.replace('<table ','<table id="table" ')
                self.rosetta_xhtml = self.rosetta_xhtml.replace(new_table, new_table_id)
                new_table = new_table_id 

            table_title = table_title_pattern.findall(new_table)
            if not table_title:
                new_table_title = new_table.replace('<table ','<table title="" ')
                self.rosetta_xhtml = self.rosetta_xhtml.replace(new_table, new_table_title)

        div_pattern = re.compile("<div.*?>", re.DOTALL)
        divs = div_pattern.findall(self.rosetta_xhtml)          
        tables = table_pattern.findall(self.rosetta_xhtml)          
        divs.extend(tables)
        for each_div in divs:
            id_pattern = re.compile('(id="(.*?)")')
            div_id = id_pattern.findall(each_div)
            try:
                if div_id:
                    new_div = each_div.replace(div_id[0][0],'id="%s"'%genURLSafeBase64Encode(div_id[0][1].strip()))
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_div,new_div)        
            except Exception as e:
                continue
 
        div_img_pattern = re.compile("<div.*?</div>", re.DOTALL)
        img_pattern = re.compile("<img.*?>", re.DOTALL)
        id_pattern = re.compile('(id="(.*?)")', re.DOTALL)
        div_imgs = div_img_pattern.findall(self.rosetta_xhtml)
        for each_div_img in div_imgs:
            try:
                img_tag = img_pattern.findall(each_div_img)
                div_id = id_pattern.findall(each_div_img)
                if div_id:
                    if img_tag:
                        img_id = id_pattern.findall(img_tag[0])
                        if not img_id:
                            new_img_tag = img_tag[0].replace('<img','<img id="%s"' % div_id[0][1])
                        else:
                            new_img_tag = img_tag[0].replace(img_id[0][0],div_id[0][0])
                        new_div_img = each_div_img.replace(div_id[0][0],'')
                        new_div_img = new_div_img.replace(img_tag[0], new_img_tag)
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(each_div_img, new_div_img)
            except Exception as e:
                self.log.info('DIV IMG ERROR: %s' % e.__str__())
                self.log.info(traceback.format_exc())
                continue
                

        a_pattern = re.compile("<a.*?>", re.DOTALL)
        a_s = a_pattern.findall(self.rosetta_xhtml)          
        for each_a in a_s:
            href_pattern = re.compile('href="#(.*?)"')
            id_pattern = re.compile('(id="(.*?)")')
            name_pattern = re.compile('(name="(.*?)")')
            a_href = href_pattern.findall(each_a)
            a_id = id_pattern.findall(each_a)
            a_name = name_pattern.findall(each_a)
            try:
                if a_name and a_id:
                    if a_name[0][1].strip() == a_id[0][1].strip():
                        each_a = each_a.replace(a_name[0][0], '')
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(a_name[0][0].strip(), '')
                new_a = each_a 
                if len(a_href) != 0:  
                    unquoted_href = unquote(a_href[0]) 
                    new_a = each_a.replace(a_href[0],genURLSafeBase64Encode(unquoted_href.strip()))
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a,new_a)
                if len(a_id) != 0:   
                    new_a2 = new_a.replace(a_id[0][1],genURLSafeBase64Encode(a_id[0][1].strip()))
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(new_a,new_a2)        
            except Exception as e:
                continue

    def fix_tags(self):
        u_re = re.compile('(<u>(.*?)</u>)',re.DOTALL)
        u_tags = u_re.findall(self.rosetta_xhtml)
        for each_tag in u_tags:
            try:
                new_tag_text = each_tag[1].replace('<u>','').replace('</u>','')
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_tag[0],'<span class="x-ck12-underline">%s</span>'%new_tag_text)
            except Exception as e:
                continue

        self.rosetta_xhtml = self.rosetta_xhtml.replace('<strike>','<span class="x-ck12-strikethrough">')
        self.rosetta_xhtml = self.rosetta_xhtml.replace('</strike>','</span>')

        #Unused <a id..></a> tags are commented.
        a_re = re.compile('(<a .*?>(.*?)</a>)',re.DOTALL) 
        a_tags = a_re.findall(self.rosetta_xhtml)
        for each_a_tag in a_tags:
            try:
                if each_a_tag[1].strip() == '':
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a_tag[0], "<!--%s-->"%each_a_tag[0])
                    #self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a_tag[0], "")
            except Exception as e:
                continue
        #Fix comment tags if its inserted multiple times for duplicated empty anchor tags        
        self.rosetta_xhtml = re.sub('(<!--)+','<!--',self.rosetta_xhtml)
        self.rosetta_xhtml = re.sub('(-->)+','-->',self.rosetta_xhtml)

        
        global config
        if not config.get('flx_home'):
            config = load_pylons_config()

        from flx.lib.rosetta import XhtmlValidator
        xsdPath = os.path.join(config.get('flx_home'), 'flx/templates/flx/rosetta/2_0.xsd')
        option = {"output-xhtml":1, "clean":1, "tidy-mark":0, "char-encoding":"utf8"}
        a_re = re.compile('(<a .*?>(.*?)</a>)',re.DOTALL) 
        a_tags = a_re.findall(self.rosetta_xhtml)
        for each_a_tag in a_tags:
            try:
                xhtml = "<p>%s</p>" % each_a_tag[0]
                tidy_doc = transform_to_xhtml(xhtml)
                invalid_href = False
                xv = XhtmlValidator(xsdPath)
                if not xv.validate(tidy_doc):
                    if len(xv.errors) > 0:
                        for each_error in xv.errors:
                            if each_error.__contains__("attribute 'href'") and each_error.__contains__("is not a valid value"):
                                invalid_href = True
                                break
                if invalid_href:
                    href_re = re.compile(r'href="(.*?)"', re.DOTALL)
                    href_val = href_re.findall(each_a_tag[0])[0]
                    help_text = "<strong>(Anchor tag was removed as the target location was wrong: '%s')</strong>" % href_val
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a_tag[0], "%s %s"%(help_text, each_a_tag[1]))
            except Exception as e:
                 #self.log.error('INVALID HREF FINDER: %s' % e.__str__())
                 if e.__str__().__contains__("EntityRef: expecting ';'"):
                     a_tag_href_re = re.compile('href="(.*?)"')
                     try:
                         href_val = a_tag_href_re.findall(each_a_tag[0])[0]
                         esc_href_val = saxutils.escape(href_val)
                         new_a_tag = each_a_tag[0].replace('href="%s"'%href_val,'href="%s"'%esc_href_val)
                         self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a_tag[0],new_a_tag)
                     except Exception as e:
                         continue
                 if e.__str__().__contains__("EntityRef: expecting ';'"):
                     a_tag_href_re = re.compile('href="(.*?)"')
                     try:
                         href_val = a_tag_href_re.findall(each_a_tag[0])[0]
                         esc_href_val = saxutils.escape(href_val)
                         new_a_tag = each_a_tag[0].replace('href="%s"'%href_val,'href="%s"'%esc_href_val)
                         self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a_tag[0],new_a_tag)
                     except Exception as e:
                         continue
                 continue
    
        #Remove empty strong and em tags
        self.rosetta_xhtml = re.sub('<em>(<strong>|</strong>|\s|&#160;)</em>','', self.rosetta_xhtml)
        self.rosetta_xhtml = re.sub('<strong>(<em>|</em>|\s|&#160;)</strong>','', self.rosetta_xhtml)
        # Below regex does not work
        #self.rosetta_xhtml = re.sub('<em>[\s|&#160;|<strong>]*[\s|&#160;]*[</strong>|\s|&#160;]*</em>','',self.rosetta_xhtml)
        #self.rosetta_xhtml = re.sub('<strong>[\s|&#160;|<em>]*[\s|&#160;]*[</em>|\s|&#160;]*</strong>','',self.rosetta_xhtml)
        
        #Unused <ol> tags are commented.
        ol_re = re.compile('(<ol.*?>(.*?)</ol>)',re.DOTALL) 
        ol_tags = ol_re.findall(self.rosetta_xhtml)
        for each_ol_tag in ol_tags:
            try:
                if each_ol_tag[1].strip() == '':
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ol_tag[0], "")
                    #self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ol_tag[0], "<!--%s-->"%each_ol_tag[0])
            except Exception as e:
                continue
        #Fix blockquote tags
        self.rosetta_xhtml = self.rosetta_xhtml.replace('<blockquote>','<blockquote><p>').replace('</blockquote>','</p></blockquote>')
        blockquote_re = re.compile(r'(<blockquote>(.*?)</blockquote>)',re.DOTALL) 
        blockquote_tags = blockquote_re.findall(self.rosetta_xhtml)
        for each_blockquote_tag in blockquote_tags:
            try:
                if each_blockquote_tag[1].replace('<p>','').replace('</p>','').strip() == '':
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_blockquote_tag[0], "<!--%s-->"%each_blockquote_tag[0])
                else:
                    new_blockquote_val1 = re.sub('^<p>\s*<p>','<p>', each_blockquote_tag[1])
                    new_blockquote_val2 = re.sub('</p>\s*</p>$','</p>', new_blockquote_val1)
                    if new_blockquote_val2 != new_blockquote_val1:
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(each_blockquote_tag[0], "<blockquote>%s</blockquote>"%new_blockquote_val2)
            except Exception as e:
                continue
    
        #Replacing header tags with strong tag inside td tags
        td_ele_re = re.compile('(<td>(.*?)</td>)',re.DOTALL)
        td_eles = td_ele_re.findall(self.rosetta_xhtml)
        for each_td_ele in td_eles:
            new_td_ele = re.sub('<h[1234567].*?>','<strong>',each_td_ele[1])
            new_td_ele = re.sub('</h[1234567]>','</strong>',new_td_ele)
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_td_ele[0],'<td>%s</td>'%new_td_ele)

        #updated_xhtml = self.rosetta_xhtml
        #try:
        #    soup = BeautifulSoup(self.rosetta_xhtml)
        #    body = soup.find('body')
        #    blockElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "pre", "address", "fieldset", "ins", "del", 'ul', 'ol', 'dl', 'table', 'div', 'blockquote']
        #    for eachContent in  body.contents:
        #        if eachContent.__class__.__name__ == 'NavigableString':
        #            if eachContent.string and eachContent.string.strip():
        #                updated_xhtml = updated_xhtml.replace(safe_decode(eachContent.string.strip()), '<p>' + safe_decode(eachContent.string.strip()) + '</p>')
        #        elif eachContent.__class__.__name__ == 'Tag' and eachContent.name and eachContent.name not in blockElements and eachContent.string:
        #            updated_xhtml = updated_xhtml.replace(unicode(eachContent), '<p>' + unicode(eachContent) + '</p>')
        #except Exception as e:
        #    self.log.error('Error in fixing dangling tag: %s' %(e.__str__()))
        #    self.log.error('Stack Trace: %s' %(traceback.format_exc()))
        #self.rosetta_xhtml = updated_xhtml
                

    def post_process(self):
        #Fix html entities
        self.rosetta_xhtml = self.rosetta_xhtml.replace('&nbsp;','&#160;')
        self.rosetta_xhtml = re.sub(r'</iframe>[\s|<br\s*/>]*</p>','</iframe></p>',self.rosetta_xhtml)
        self.rosetta_xhtml = re.sub(r'<br[ ]*/>', '', self.rosetta_xhtml)
 
        #Remove imgs from pre tag
        pre_re = re.compile('(<pre>(.*?)</pre>)', re.DOTALL)
        pre_tags = pre_re.findall(self.rosetta_xhtml)
        for each_pre_tag in pre_tags:
            try:
                new_pre_tag = each_pre_tag[1]
                new_pre_tag = re.sub('(<img.*?>)','</pre><p>\\1</p><pre>', new_pre_tag)
                if each_pre_tag[1] != new_pre_tag:
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_pre_tag[1], new_pre_tag)
            except Exception as e:
                continue

        #Fix extra http://
        self.rosetta_xhtml = self.rosetta_xhtml.replace('http://http://','http://')
         
        #Fix width and height units
        ele_pattern = re.compile('(width="([0-9]*)[\w|;]*")',re.DOTALL)
        ele_matches = ele_pattern.findall(self.rosetta_xhtml)
        for each_match in ele_matches:
            if each_match[1]:
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match[0], 'width="%s"'%each_match[1])
            else:
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match[0], '')

        ele_pattern = re.compile('(height="([0-9]*)[\w|;]*")',re.DOTALL)
        ele_matches = ele_pattern.findall(self.rosetta_xhtml)
        for each_match in ele_matches:
            if each_match[1]:
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match[0], 'height="%s"'%each_match[1])
            else:
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match[0], '')
 
        #Remove emtpy imgs
        img_re = re.compile('<img.*?>', re.DOTALL)
        src_re = re.compile('src=".*?"', re.DOTALL)
        img_matches = img_re.findall(self.rosetta_xhtml)
        for each_match in img_matches:
            is_replace = False
            if not each_match.__contains__('src='):
                is_replace = True
            else:
                src_match = src_re.findall(each_match)
                if len(src_match) > 0:
                    if not src_match[0].strip():
                        is_replace = True
            if is_replace:
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match,'')

        entity_re = re.compile(r'&(\w+);')
        def fixEntities(m):
            """
                Replace html entities with xml entities
            """
            if m.group(1):
                entity = m.group(1)
                if htmlentitydefs.name2codepoint.has_key(entity):
                    ret = '&#%s;' %  htmlentitydefs.name2codepoint[entity]
                    return ret
            return m.group(0)
        self.rosetta_xhtml = entity_re.sub(fixEntities, self.rosetta_xhtml)

        #Fix strong node
        try:
            s = minidom.parseString(self.rosetta_xhtml)
            html_node = s.childNodes[len(s.childNodes)-1]
            body_node = ''
            for each_child in html_node.childNodes:
                if each_child.nodeName == 'body':
                    body_node = each_child
                    break
            for each_child in body_node.childNodes:
                if each_child.nodeName =='#text':
                    self.log.info('NODE: %s' % each_child)
                if each_child.nodeName == 'strong':
                    p_ele = s.createElement('p')
                    p_ele.appendChild(each_child.cloneNode('deep'))
                    body_node.replaceChild(p_ele, each_child)
            result = unicode(s.toxml()).encode('utf8')
            if result:
                self.rosetta_xhtml = result
        except Exception as e:
            self.log.error('DOM Error from fix_tags: %s' % e.__str__()) 


        #Fix attrs for imgs
        img_re = re.compile(r'<img.*?>', re.DOTALL)
        id_re = re.compile('id="(.*?)"')
        title_re = re.compile('title="(.*?)"')
        alt_re = re.compile('alt="(.*?)"')
        width_re = re.compile('width="(.*?)"')
        longdesc_re = re.compile('longdesc="(.*?)"')
        src_re = re.compile('(src="(.*?)")') 
        class_re = re.compile('class="(.*?)"') 
        img_matches = img_re.findall(self.rosetta_xhtml)
        for each_match in img_matches:
            img_id = id_re.findall(each_match)
            img_src_val = ''
            img_title = ''
            img_longdesc = ''
            img_alt = ''
            img_class = ''
            img_src = src_re.findall(each_match)
            if img_src:
                img_src_val = img_src[0][1]
            if not img_id:
                    actual_img_src = os.path.basename(os.path.splitext(img_src_val)[0])
                    img_id = genURLSafeBase64Encode(actual_img_src)
            else:
                img_id = img_id[0]
            equiv_img = '<img src="%s" id="%s"' % (img_src_val, img_id) 
            
            img_class = class_re.findall(each_match)
            if img_class:
                img_class = img_class[0]
                equiv_img = '%s class="%s"' % (equiv_img, img_class)
            
            img_width = width_re.findall(each_match)
            if img_width:
                img_width = img_width[0]
                equiv_img = '%s width="%s"' % (equiv_img, img_width)
           
            img_title = title_re.findall(each_match)
            if img_title:
                img_title = img_title[0]
                equiv_img = '%s title="%s"' % (equiv_img, img_title)
            
            img_longdesc = longdesc_re.findall(each_match)
            if img_longdesc:
                img_longdesc = img_longdesc[0]
                equiv_img = '%s longdesc="%s"' % (equiv_img, img_longdesc)
           
            img_alt = alt_re.findall(each_match)
            if img_alt:
                img_alt = img_alt[0]
                equiv_img = '%s alt="%s"' % (equiv_img, img_alt)
        
            equiv_img = "%s />"%(equiv_img) 
             
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_match, equiv_img) 

        #Fix anchor name
        '''
        a_pattern = re.compile("<a.*?>", re.DOTALL)
        a_s = a_pattern.findall(self.rosetta_xhtml)          
        for each_a in a_s:
            name_pattern = re.compile('name="(.*?)"', re.DOTALL)
            a_name = name_pattern.findall(each_a)
            try:
                if len(a_name) != 0:   
                    new_a = re.sub('\?.*', '',a_name[0])
                    new_a = each_a.replace(a_name[0], new_a)
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_a,new_a)        
            except Exception as e:
                print traceback.format_exc()
                continue
        '''

        #fix list empty start
        ol_pattern = re.compile('<ol.*?start="".*?>',re.DOTALL) 
        ol_matches = ol_pattern.findall(self.rosetta_xhtml)
        for each_ol in ol_matches:
            new_ol = each_ol.replace('start=""','')
            self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ol,new_ol)
  
        #Fix empty ids
        ele_pattern = re.compile("<.*?>", re.DOTALL)
        id_re = re.compile('(id="")',re.DOTALL)
        ele_matches = ele_pattern.findall(self.rosetta_xhtml)
        for each_ele in ele_matches:
            id_match = id_re.findall(each_ele) 
            if id_match:
                new_ele = each_ele.replace(id_match[0],'')
                self.rosetta_xhtml = self.rosetta_xhtml.replace(each_ele, new_ele)
    
        #Replace &#160; with whitespace
        self.rosetta_xhtml = self.rosetta_xhtml.replace('&#160;',' ')    
 
        #Combine multiple caption tags into one
        table_re = re.compile('(<table.*?</table>)', re.DOTALL)
        caption_re = re.compile('<caption>(.*?)</caption>', re.DOTALL)
        table_tags = table_re.findall(self.rosetta_xhtml)
        for each_table_tag in table_tags:
            caption_tag_contents = caption_re.findall(each_table_tag)
            if len(caption_tag_contents) > 1:
                caption_tag_content = ''.join(caption_tag_contents)
                entire_caption_re = re.compile('<caption>.*</caption>',re.DOTALL)
                try:
                    entire_caption_content = entire_caption_re.findall(each_table_tag)[0]
                    new_table_tag = each_table_tag.replace(entire_caption_content,'<caption>%s</caption>'%caption_tag_content)
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_table_tag, new_table_tag)
                except Exception as e:
                    continue

        #Move tr tags inside tbody tag:
        table_re = re.compile('(<table.*?</table>)', re.DOTALL)
        tr_re = re.compile('</tbody>(.*?)</table>', re.DOTALL)
        table_tags = table_re.findall(self.rosetta_xhtml)
        for each_table_tag in table_tags:
            tr_tag_contents = tr_re.findall(each_table_tag)
            if tr_tag_contents:
                try:
                    tr_tag_content = tr_tag_contents[0]
                    new_table_tag = each_table_tag.replace('</tbody>%s'%tr_tag_content,'%s</tbody>'%tr_tag_content)
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_table_tag, new_table_tag)
                except Exception as e:
                    continue

        #Combine multiple title tags into one inside head tag
        self.rosetta_xhtml = re.sub('<title\s*/>','<title></title>',self.rosetta_xhtml)
        head_re = re.compile('(<head.*?</head>)', re.DOTALL)
        title_re = re.compile('<title>(.*?)</title>', re.DOTALL)
        head_tags = head_re.findall(self.rosetta_xhtml)
        for each_head_tag in head_tags:
            title_tag_contents = title_re.findall(each_head_tag)
            if len(title_tag_contents) > 1:
                title_tag_content = ''.join(title_tag_contents)
                entire_title_re = re.compile('<title>.*</title>',re.DOTALL)
                try:
                    entire_title_content = entire_title_re.findall(each_head_tag)[0]
                    new_head_tag = each_head_tag.replace(entire_title_content,'<title>%s</title>'%title_tag_content)
                    self.rosetta_xhtml = self.rosetta_xhtml.replace(each_head_tag, new_head_tag)
                except Exception as e:
                    continue

        #Add <p> after <hr> tag:
        self.rosetta_xhtml = re.sub('(<hr.*?>)','\\1<p>',self.rosetta_xhtml)

        #Remove strong,em,sup and sub tags if they have iframe tag as children
        no_iframe_tags = ['strong','em','sup','sub','span.*?']
        for each_tag in no_iframe_tags: 
            tag_re = re.compile('(<%s>(.*?)</%s>)'%(each_tag,each_tag), re.DOTALL)
            all_tags = tag_re.findall(self.rosetta_xhtml)
            for each_sup_tag in all_tags:
                try:
                    if each_sup_tag[1].__contains__('<iframe'):
                        self.rosetta_xhtml = self.rosetta_xhtml.replace(each_sup_tag[0],each_sup_tag[1])
                except Exception as e:
                    self.log.error('%s in IFRAME: %s' %(each_tag, e.__str__()))
