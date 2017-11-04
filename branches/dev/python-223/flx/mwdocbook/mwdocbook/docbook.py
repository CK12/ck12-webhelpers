from sys import stdout, path
from functools import partial
from logging import warning
from string import ascii_letters, join
from random import sample
from os.path import split, join as path_join, exists
from shutil import copy
import urllib
from urllib import quote
import string
import re
import time

import urllib2
from urllib2 import urlopen, HTTPError, URLError
#import settings
from json import decoder

from mwlib.parser import Node, Text, Caption
from mwlib.advtree import DefinitionTerm, DefinitionDescription
from mwlib.tagext import TagExtension, default_registry
from elementtree.SimpleXMLWriter import encode_entity

from lisp import car, cdr, cadr, cddr, dict_merge, nullp, cons, pairwise
from render import render, StringPort, parse, empty_element_explicit, \
     element_explicit, empty_element, element, dont_purge
from mwdocbook.render import Chapter_info_container, Options_container
from translation import Translation

class Docbook(Translation):
# Bug 2324
    urldocbook = ''
#
    rosetta_version = "0.1"
    wiki = None
    references = {}
    image_dir = None
    out = stdout
    rpc = 'http://localhost/rpc/ck12/ucs?%(params)s'
    webLocation = 'http://localhost'

    def node(self, node):
        # assumes isinstance(a, A)
        def issubinstance(a, A):
            return a.__class__.__name__ != A.__name__

        if issubinstance(node, Node):
            warning('unknown node: %s', str(node))

        return node.children

    def default(self, translation, node):
        self.node(node)

    def text(self, node):
        if node.caption:
            return encode_entity(node.caption)

    # do books have titles?
    def book(self, node):
        return element('book',
                       element('title',
                               Text(node.caption.replace('_', ' '))),
                       node.children)

    def article_info(self):
        return element('chapterinfo',
                       element('rosetta-version',
                               Text(self.rosetta_version)))

    # don't forget to do title
    def article(self, node):
        return element('chapter',
                       element('title',
                               Text(node.caption.replace('_', ' '))),
                            self.article_info(),
                            node.children)

    def blankarticle(self, node):
        return element('chapter',
                       element('title',
                               Text(node.caption.replace('_', ' '))),
                       self.article_info())

    # placeholder; have yet to see one in the wild
    def timeline(self, node):
        return node.children

    # just preserving foreign sgml tags for now
    def tagnode(self, node):
        return element(node.caption,
                       node.children)

    def url(self, node):
        return empty_element('ulink', url=node.caption)

    def namedurl(self, node):
        return element('ulink',
                       node.children,
                       url=node.caption)

    # presence of type/target distinguishes it from URLs
    def link(self, node, type='link'):
        return element('ulink',
                       node.children,
                       url=(node.url if node.url else ''),
                       target=node.full_target,
                       type=type)

    def article_link(self, node):
        url = self.wiki.wiki.getLinkURL(node, node.target)
        return element('ulink',
                       Text(node.target),
                       url=url)

    def emphasis(self, node, role):
        return element('emphasis',
                       node.children,
                       role=role)

    emphasized = partial(emphasis, role='italics')

    strong = partial(emphasis, role='strong')

    strike = partial(emphasis, role='strikethrough')

    underline = partial(emphasis, role='underline')

    # TODO: :+, ;
    def style(self, node):
        return emphasized(node, translation, default) \
               if node.caption == "''" \
               else strong(node, translation, default)

    def paragraph(self, node):
        # print "DOCBOOK PARAGRAPH: 122"
	# Bugs 2815 & 2157 : Julian 6-14-10
	if node.parent is not None and isinstance(node.parent, Caption):
	    print "DOCBOOK PARAGRAPH PARENT IS A CAPTION"
	    return node.children
        else: 
	# original:
	    return element('para', node.children)

    def item(self, node):
        return element('listitem', node.children)

    def itemlist(self, node):
        tag = 'orderedlist' if node.numbered else 'itemizedlist'
        return element_explicit(tag, node.children, node.attributes)

    def section(self, node):
        """A section of level 1 is actually a title block; every section
        thereafter has a mono-super-ordinate level."""
        # check bounds on children? what about childrenless sections?
        title = car(node.children)
        rest = cdr(node.children)
        title = element('title', title)
        title = element('sect%d' %(node.level), title)
        if node.level > 1:
            section = 'sect%d' % (node.level - 1)
            return [title, rest]
            #return element("", title, rest)
        else:
            return [title, rest]

    # header hack because mwlib doesn't yet distinguish headers from
    # bodies
    def table(self, node):
        class Table(Docbook):
            def row(self, node):
                return element('row', node.children)

            def cell(self, node):
                return element('entry', node.children)

            translation = dict_merge(self.translation,
                                     {'Row': row,
                                      'Cell': cell})

            def __init__(selfchen, translation=translation):
                super(Table, selfchen).__init__(translation,
                                                wiki=self.wiki,
                                                image_dir=self.image_dir,
                                                out=self.out,
                                                rpc=self.rpc)

        # hack to circumvent mwlib's lack of header-parsing facilities
        captioned = not nullp(node.children) and \
                    isinstance(car(node.children), Caption)
        caption, header, body = \
                {0: ([], [], []),
                1: (node.children, [], []) if captioned
	# aligned columns to 4-spaces
                else ([], [], node.children)} \
                    .get(len(node.children),
                    (car(node.children),
                    cadr(node.children),
                    cddr(node.children)) if captioned 
                    else ([], car(node.children), cdr(node.children)))
        title = node.attributes.get('title')
# Bug 2324
        if 'infobox' in node.attributes.get('class', '').lower():
            if str(Docbook.urldocbook).find('wikipedia') > -1:
                return ''
#
        render(Table(),
               element_explicit
               ('table',
                node.children if nullp(node.children)
                else [element('title', node.attributes.get('title')) \
                      if title else title,
                      element('thead', header) if header else header,
                      element('tbody', body) if body else body,
                      caption],
               {'class': node.attributes.get('class'),
                'id': node.attributes.get('id')}),
               self.out)

    def math(self, node):
        return element('inlineequation',
                       element('graphic',
                               fileref=self.rpc % \
                               {'params': 'math=%s' % \
                                # see
                                # http://mail.python.org/pipermail/python-dev/2006-July/067248.html
                                # for the necessity of encode()
                                quote(node.caption.encode('utf-8'))}),
                       element('alt',
                               Text(node.caption)))

    def blockmath(self, node):
        return element('equation',
                       element('graphic',
                               fileref=self.rpc % \
                               {'params': 'blockmath=%s' % \
                                quote(node.caption.encode('utf-8'))}),
                       element('alt',
                               Text(node.caption)))

    def anchor(self, node):
        # had to switch from link to xlink because link is special-
        # cased downstream
        href = node.attributes.get('href')
        id = node.attributes.get('id')
        return (element('xlink',
                        car(node.children),
                        linkend=href)
                if href
                else empty_element('anchor',
                                   id=id))

    def preformatted(self, node):
        return element('literallayout', node.children)

    # docbook doesn't seem to have a newline short of
    # <literallayout></literallayout> and <sbr /> (when it's
    # applicable)
    def breakingreturn(self, node):
# Bug 2324
        return ''
#
#        return empty_element('sbr')

    def teletyped(self, node):
        return element('computeroutput', node.children)

    def code(self, node):
        return element('node', node.children)

    def sub(self, node):
        return element('subscript', node.children)

    def sup(self, node):
        return element('superscript', node.children)

    # not really sure what to do with this one
    def center(self, node):
        return node.children

    def span(self, node):
        return node.children

    def div(self, node):
        return node.children

    def blockquote(self, node):
        return element('blockquote', node.children)

    def definitionlist(self, node):
        class DefinitionList(Docbook):
            def definitionterm(self, node):
                return element('term', node.children)

            def definitiondescription(self, node):
                return element('listitem', node.children)

            translation = dict_merge(Docbook.translation,
                                     {'DefinitionTerm':
                                      definitionterm,
                                      'DefinitionDescription':
                                      definitiondescription})

            def __init__(selfchen, translation=translation):
                super(DefinitionList, selfchen).__init__(translation,
                                                         wiki=self.wiki,
                                                         image_dir=self.image_dir,
                                                         out=self.out,
                                                         rpc=self.rpc)


        def normalize_elements(elements, expect_term=True):
            """Make sure every definitionterm has a definitiondescription
            and vice versa, even if it's empty."""
            if nullp(elements):
                return [] if expect_term else [DefinitionDescription()]
            element = car(elements)
            rest = cdr(elements)
            if isinstance(element, DefinitionTerm):
                if expect_term:
                    return cons(element,
                                normalize_elements(rest, False))
                else:
                    return cons(DefinitionDescription(),
                                cons(element,
                                     normalize_elements(rest, False)))
            elif isinstance(element, DefinitionDescription):
                if expect_term:
                    return cons(DefinitionTerm(),
                                cons(element,
                                     normalize_elements(rest, True)))
                else:
                    return cons(element,
                                normalize_elements(rest, True))

        pairs = pairwise(normalize_elements(node.children))

        render(DefinitionList(),
               element('variablelist',
                       map(lambda pair: element('varlistentry',
                                                pair),
                           pairs)),
               self.out)

    # [Peter] doesn't seem to exist in docbook-ese
    # [julian] for now provide support for <hr class="pagebreak" /> in wiki
    # to translate to <beginpage /> in docbook, but no support for horizontal rules yet
    def horizontalrule(self, node):
    #    return ''
        return empty_element('beginpage')

    # children stored as named citation; if no name attribute: make one
    # up? no, let apps do that ad-hocery. but then you would have an xref
    # to an entry with no name. must fabricate one.
    #
    # it means the fucker has state now, which has to be reinitialized;
    # class/closure? python doesn't have nested scopes; no closures in the
    # humane sense.
    def reference(self, node):
        def random_string(length):
            return join(sample(ascii_letters, length), '')
        # don't check for collision; probably should
        name = node.attributes.get('name', random_string(8))
        childless = nullp(node.children)
        if not childless:
            out = StringPort()
            render(self, node.children, out=out)
            self.references[name] = out.read()
# Bug 2324
        else:
            if str(Docbook.urldocbook).find('wikipedia') > -1:
                return ''
            else:
                return empty_element('xref', linkend=name)
# original:
#       return empty_element('xref', linkend=name)
#

    def referencelist(self, node):
        return element('bibliography',
                       map(lambda name:
                           element('bibliomixed',
                                   self.references[name],
                                   id=name),
                           self.references.iterkeys()))

    def figure_iframe(self, node):

        return element_explicit('figure',
                            [node.children],
                            {'iframeid': node.attributes.get('iframeid'),
                             'width': node.attributes.get('width'),
                             'height': node.attributes.get('height'),
                             'src': node.attributes.get('src_url'),
                             'allowfullscreen': node.attributes.get('allow_fullscreen'),
                             'frameborder': node.attributes.get('frame_border'),
                             'thumbnailurl': node.attributes.get('thumbnailurl'),
                             'class': node.attributes.get('klass')})

    def figure(self, node):
	htmllocal = node.attributes.get('htmllocal', None)
	if htmllocal is None:
            return element_explicit('figure',
                                [element('title',
                                         Text(node.caption)),
                                 element('caption',
                                         node.attributes\
                                         .get('caption')),
                                 node.children],
                                {'id': node.attributes.get('id'),
                                 'class': node.attributes.get('klass')})
	else:
	    #print 'DOCBOOK.PY: FIGURE: BEF AMPERSAND REPLACEMENT: htmllocal = %s' % htmllocal
	    htmllocal = htmllocal.replace('&#38;amp;', '&#38;')
            #print 'DOCBOOK.PY: FIGURE: AFT AMPERSAND REPLACEMENT: htmllocal = %s' % htmllocal
            return element_explicit('figure',
                                [element('title',
                                         Text(node.caption)),
                                 element('caption',
                                         node.attributes\
                                         .get('caption')),
                                 node.children],
                                {'id': node.attributes.get('id'),
                                 'class': node.attributes.get('klass'),
				 'htmllocal': htmllocal})

# To disable embedded objects in authors RenderPDF:
# If mwdocbook invoked with -e option, as on authors preview.php, insert figureeo tag instead
# of figure.  figureeo not handled by fb2n, so skipped in pdf
# Not used.  Instead, have MediaTag call empty method on disable_embedded_object = True,
# so we don't unnecessarily try to fetch urls that could give errors stopping import 
    def figureeo(self, node):
        htmllocal = node.attributes.get('htmllocal', None)
        if htmllocal is None:
            return element_explicit('figureeo',
                                [element('title',
                                         Text(node.caption)),
                                 element('caption',
                                         node.attributes\
                                         .get('caption')),
                                 node.children],
                                {'id': node.attributes.get('id'),
                                 'class': node.attributes.get('klass')})
        else:
            return element_explicit('figureeo',
                                [element('title',
                                         Text(node.caption)),
                                 element('caption',
                                         node.attributes\
                                         .get('caption')),
                                 node.children],
                                {'id': node.attributes.get('id'),
                                 'class': node.attributes.get('klass'),
                                 'htmllocal': htmllocal})

#
    # bail out if we don't have a wiki; or if the image doesn't exist
    # locally (i.e. pulling it failed for whatever reason)
    def imageobject(self, image, klass, width=None, thumb=False):
        WIDTH = 256
        if not self.wiki:
            return None

        source = self.wiki['images'].getDiskPath(image)
        if source and exists(source):
            path, file = split(source)
            target = path_join(self.image_dir, file.replace(' ', '_'))
            copy(source, target)
        else:
            return None
        
        return element('mediaobject',
                       element('imageobject',
                               empty_element_explicit\
                               ('imagedata',
                                {'fileref': target,
                                 'class': klass,
                                 'width': '%dpx' % (width \
                                                    if width \
                                                    else WIDTH)})))

    def imagelink(self, node):
        return self.imageobject(node.target,
                                None,
                                node.width,
                                node.thumb)

    def image(self, node):
        def full_target_to_target(full_target):
            head, sep, tail = full_target.partition(':')
            return tail if tail else full_target
        return self.imageobject(full_target_to_target\
                                (node.attributes.get('source')),
                                node.attributes.get('klass'))

    def float(self, node):
        class Float(Docbook):
            def floatcontent(self, node):
                return element('mediaobject',
                               element('textobject',
                                       empty_element_explicit\
                                       ('textdata',
                                        {'class':
                                         node.attributes.
                                         get('klass')})),
                               node.children)

            translation = dict_merge(Docbook.translation,
                                     {'FloatContent': floatcontent})

            def __init__(selfchen, translation=translation):
                super(Float, selfchen).__init__(translation,
                                                wiki=self.wiki,
                                                image_dir=self.image_dir,
                                                out=self.out,
                                                rpc=self.rpc)
                
        render(Float(),
               element('float',
                       element('title',
                               Text(node.caption)),
                       node.children,
                       id=node.attributes.get('id')),
               self.out)

    def caption(self, node):
        return element('caption',
                       node.children)

    def cite(self, node):
        return node.children

    def get_embed_info(self, embeddable, post_code=None):
        attempts_number = 5
        if '/opt/lampp/website/ck12' not in path:
            path.append('/opt/lampp/website/ck12')
        servername = self.webLocation
        url_base = u'%s/flx/create/embeddedobject' % servername
        if post_code is None:
            queryparams_dict = {'url': embeddable}
        else:
            queryparams_dict = {'code': embeddable}
        queryparams_data = urllib.urlencode(queryparams_dict)
        requesturl = urllib2.Request(url_base, queryparams_data)
        print 'DOCBOOK.PY: CHAPTER TITLE = %s' %(Chapter_info_container.chapter_title)
        print 'DOCBOOK.PY: LESSON TITLE = %s' %(Chapter_info_container.lesson_title)
        print 'DOCBOOK.PY: GET_EMBED_INFO: BASE_URL + PARAMS = %s'  %(url_base +
                                                               str(queryparams_dict))

        decodedjson = None
        got_nonerroneous_json = False
        invalid_video_urls_handle = open('/tmp/invalid_video_urls', 'a')
        for i in range(1, attempts_number):
            try:
                decodedjson = self._get_embed_info(requesturl)
            except (HTTPError, URLError, RuntimeError, Exception) as err:
                time.sleep(2 * i)
                print 'DOCBOOK.PY: GET_EMBED_INFO \
                        ERROR TYPE = %s \
                        ERROR ON ATTEMPT NO: %s \
                        CHAPTER TITLE = %s, LESSON TITLE = %s \
                        REQUESTURL = %s , ERROR = %s' \
                         %(err.__class__, attempts_number, \
                           Chapter_info_container.chapter_title, \
                           Chapter_info_container.lesson_title, \
                           url_base + str(queryparams_dict), err)

                invalid_video_urls_handle.write('DOCBOOK.PY: GET_EMBED_INFO: \
                        ERROR TYPE =  %s \
                        ERROR ON ATTEMPT NO: %s\
                        CHAPTER TITLE = %s, LESSON TITLE = %s \
                        REQUESTURL = %s , ERROR = %s' \
                         %(err.__class__, attempts_number, \
                           Chapter_info_container.chapter_title, \
                           Chapter_info_container.lesson_title, \
                           url_base + str(queryparams_dict), err))
                decodedjson = {}
                decodedjson['response'] = {'message': 'Something went wrong. \
                                            Look at the debug logs for more \
                                            info'}
            else:
                got_nonerroneous_json = True
                break
        invalid_video_urls_handle.close()
        return decodedjson['response']

    def _get_embed_info(self, requesturl):
        if '/opt/lampp/website/ck12' not in path:
            path.append('/opt/lampp/website/ck12')
        httpresponse = None
        decodedjson = None
        httpresponse = urllib2.urlopen(requesturl)
        if httpresponse is None:
            raise RuntimeError, 'HTTPRESPONSE IS STILL NONE, NOT YET ASSIGNED BY URLLIB2.URLOPEN'
        responsejson = httpresponse.read()
        ajsondecoder = decoder.JSONDecoder()
        decodedjson = ajsondecoder.decode(responsejson)
        statusCode = decodedjson.get('responseHeader').get('status')
        if statusCode != 0:
            raise Exception, 'GOT A NON-ZERO ERROR CODE FROM IN JSON. ARE YOU \
                              SURE THE OBJECT STILL EXISTS? STATUS CODE: %d  \
                              RESPONSE MESSAGE: %s ' \
                              %(statusCode,
                                decodedjson.get('response').get('message'))
        return decodedjson

    def youtube(self, node):
        from gdata.youtube.service import YouTubeService
        from gdata.service import RequestError
        from gdata.youtube import YouTubeVideoFeed, YouTubeVideoEntry
        from random import choice
        from urllib import urlretrieve
        from tempfile import mkstemp
        from os.path import join, basename, splitext

        videoid = node.attributes.get('videoid')
        if videoid:
            if u'\u0026NR=1' in videoid:
                videoid = videoid.replace(u'\u0026NR=1', u'')
            embeddable = u'http://www.youtube.com/watch?v=' + unicode(videoid)
            decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            #import pdb; pdb.set_trace()
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            embed_code = decodedjson.get('code','')

            try:
                frame_border_re = re.compile('frameborder="(\w*)"')
                frame_border = frame_border_re.search(embed_code).groups()[0]
            except:
                frame_border = ""

            try:
                src_url_re = re.compile('src="(.*?)"')
                src_url = src_url_re.search(embed_code).groups()[0]
            except:
                src_url = ""

            try:
                allow_fullscreen_re = re.compile('allowfullscreen="(\w*)"',
                                                 re.IGNORECASE)
                allow_fullscreen = allow_fullscreen_re.search(embed_code).groups()[0]
            except:
                allow_fullscreen = ""

            iframeid = "eo_youtube_%s_iframe" %(internalid)

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
            video = element('videoobject',
                            empty_element\
                            ('videodata',
                    internalid=internalid))

            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'iframeyoutube'}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            node.attributes['caption'] = caption
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src_url'] = src_url
            node.attributes['frame_border'] = frame_border
            node.attributes['allow_fullscreen'] = allow_fullscreen
            node.attributes['thumbnailurl'] = relative_thumbnail
            node.attributes['klass'] = 'iframeyoutube'
            node.attributes['iframeid'] = iframeid
            node.children = [media]
            return self.figure_iframe(node)

# Bug 3448
    def schooltube(self, node):
        videoid = node.attributes.get('videoid')
        if videoid:
	    embeddable = u'http://www.schooltube.com/v/' + unicode(videoid)
	    decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            src_url = decodedjson.get('src_url', '')
            embed_code = decodedjson.get('embed_code','')

            try:
                frame_border_re = re.compile('frameborder="(\w*)"')
                frame_border = frame_border_re.search(embed_code).groups()[0]              
            except:
                frame_border = ""
   
            try:
                src_url_re = re.compile('src="(.*?)"')
                src_url = src_url_re.search(embed_code).groups()[0]              
            except:
                src_url = ""

            try:
                allow_fullscreen_re = re.compile('allowFullScreen="(\w*)"')
                allow_fullscreen = allow_fullscreen_re.search(embed_code).groups()[0]
            except:
                allow_fullscreen = ""
      
            try:
                iframeid_re = re.compile(' id="(\w*)"')
                iframeid = iframeid_re.search(embed_code).groups()[0]
            except:
                iframeid = ""
      
      
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
            video = element('videoobject',
                            empty_element\
                            ('videodata',
			     internalid=internalid
			    )
			   )
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'iframeschooltube'}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            #node.attributes['caption'] = description
            node.attributes['caption'] = caption
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src_url'] = src_url
            node.attributes['frame_border'] = frame_border
            node.attributes['allow_fullscreen'] = allow_fullscreen
            node.attributes['thumbnailurl'] = relative_thumbnail
            node.attributes['klass'] = 'iframeschooltube'
            node.attributes['iframeid'] = iframeid
            node.children = [media]
            return self.figure_iframe(node)

    def teachertube(self, node):
        videoid = node.attributes.get('videoid')
        if videoid:
	    videoflashvars = node.attributes.get('videoflashvars', "")
	    embeddabletemplate = u'http://www.teachertube.com/embedFLV.php?pg=video_VIDEOID'
	    embeddabletemplate += u'&menu=false&frontcolor=ffffff&lightcolor=FF0000&logo='
	    embeddabletemplate += u'http://www.teachertube.com/www3/images/greylogo.swf&skin='
	    embeddabletemplate += u'http://www.teachertube.com/embed/overlay.swf&volume=80&controlbar='
	    embeddabletemplate += u'over&displayclick=link&viral.link=http://www.teachertube.com/'
	    embeddabletemplate += u'viewVideo.php?video_id=VIDEOID&stretching=exactfit&plugins='
	    embeddabletemplate += u'viral-2&viral.callout=none&viral.onpause=false'
            #embeddable = embeddabletemplate.replace('VIDEOID', unicode(videoid))
	    embeddableviewVideotemplate = u'http://www.teachertube.com/viewVideo.php?video_id=VIDEOID'
            #embeddableviewVideotemplate = u'http://www.teachertube.com/embedFLV.php?pg=video_VIDEOID'
	    embeddable = embeddableviewVideotemplate.replace('VIDEOID', unicode(videoid))
	    #print "DOCBOOK.PY:TEACHERTUBE: EMBEDDABLE = %s" % embeddable
            decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            #print "DOCBOOK.PY:TEACHERTUBE: DECODEDJSON = %s" % decodedjson
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
	    #print 'BEF NEWLINE REPLACEMENT: title = %s' % title
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
	    #print 'AFT NEWLINE REPLACEMENT: title = %s' % title
	    #flashvars = decodedjson.get('flashvars', 'NoFlashvarsFoundInJson')
	    flashvars = u'file=http://www.teachertube.com/embedFLV.php?pg=video_' + unicode(videoid)
	    #print "DOCBOOK.PY:TEACHERTUBE:EMBEDDABLE = %s" % embeddable
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            video = element('videoobject',
                            empty_element\
                            ('videodata',
                             fileref=embeddable,
			     internalid=internalid,
			     flashvars=flashvars))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'teachertube'}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            #node = Node()
	    node = Node(title)
            # node.attributes['caption'] = description
	    node.attributes['caption'] = caption
            node.attributes['klass'] = 'teachertube'
            node.children = [media]
            return self.figure(node)


    def remoteswf(self, node):
        videosrc = node.attributes.get('videosrc')
        #print 'VIDEOSRC = %s' % videosrc
        if videosrc:
            videoflashvars = node.attributes.get('videoflashvars', "")
            embeddable = videosrc
            decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
            # placeholder until get remotevideo icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            video = element('videoobject',
                            empty_element\
                            ('videodata',
                             fileref=embeddable,
			     internalid=internalid,
                             flashvars=videoflashvars))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'remoteswf'}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            # node.attributes['caption'] = description
	    node.attributes['caption'] = caption
            node.attributes['klass'] = 'remoteswf'
            node.children = [media]
            return self.figure(node)

    def remotevideo(self, node):
# videoflashvars would be gotten here if flashvars supported in mediawiki
        videosrc = node.attributes.get('videosrc')
        if videosrc:
            videoflashvars = node.attributes.get('videoflashvars', "")
            embeddable = videosrc
            decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
            # placeholder until get remotevideo icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            video = element('videoobject',
                            empty_element\
                            ('videodata',
# flashvars would be inserted into docbook here if supported in mediawiki
                             fileref=embeddable,
			     internalid=internalid,
                             flashvars=videoflashvars))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'remotevideo'}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            # node.attributes['caption'] = description
	    node.attributes['caption'] = caption
            node.attributes['klass'] = 'remotevideo'
            node.children = [media]
            return self.figure(node)

    def audio(self, node):
        audiosrc = node.attributes.get('audiosrc')
        if audiosrc:
            embeddable = audiosrc
            decodedjson = self.get_embed_info(embeddable)
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')

            # placeholder until get audio icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
# still use videoobject and videodata in docbook to simplify fb2n
            audio = element('videoobject',
                            empty_element\
                            ('videodata',
                             fileref=embeddable,
			     internalid=internalid
			    ))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': 'audio'}))
            media = element('mediaobject',
                            audio,
                            thumbnail)
            node = Node(title)
            node.attributes['caption'] = caption
            node.attributes['klass'] = 'audio'
            node.children = [media]
            return self.figure(node)
#
    def applet(self, node):
        applethtml = node.content.get('applet')
#	print 'DOCBOOK.PY: APPLET: APPLETHTML = %s' % str(applethtml)
        if applethtml:
	    fb2napplet_type = 'fb2napplet'
	    applet_type = 'applet'
	    fileref_value = 'AppletNoImagedataFileref'
	    applethtml = applethtml.strip()
	    if applethtml.startswith('<object'):
		fb2napplet_type = 'fb2nappletobject'
# applets in object-parent format should be handled as customembed, 
# so no applet_type = 'customembed' or 'object' included here
		fileref_value = 'AppletObjectNoImagedataFileref'
# handle case: empty applethtml
	    applethtml_safer = applethtml
	    applethtml_safer = self.remove_ck12_ids(applethtml_safer)
	    applethtml_safer = applethtml_safer.replace('"', u'DOCBOOKDOUBLEQUOTE')
            applethtml_safer = applethtml_safer.replace('<', u'DOCBOOKLEFTANGLE')
            applethtml_safer = applethtml_safer.replace('>', u'DOCBOOKRIGHTANGLE')
#            print 'DOCBOOK.PY: APPLET: APPLETHTML_SAFER = %s' % str(applethtml_safer)
# Bug 3797: applethtml has <, >, "
            embeddable = applethtml
	    embeddable = self.remove_ck12_ids(embeddable)
            decodedjson = self.get_embed_info(embeddable, True)
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
# insert into applethtml_safer surrounded by spaces immediately after
# DOCBOOKLEFTANGLEapplet  :
# id=DOCBOOKDOUBLEQUOTEeo_applet_<internalid>_appletDOCBOOKDOUBLEQUOTE 
	    internalid_in_htmllocal = ' id=DOCBOOKDOUBLEQUOTEeo_' + applet_type + '_' + \
		str(internalid) + '_' + applet_type + 'DOCBOOKDOUBLEQUOTE'
	    applettagtoken = 'DOCBOOKLEFTANGLE' + applet_type
#	    print 'internalid_in_htmllocal = %s' % internalid_in_htmllocal
#	    print 'applettagtoken = %s' % applettagtoken
	    applethtml_safer = applethtml_safer.replace(applettagtoken, applettagtoken + internalid_in_htmllocal)
#            print 'DOCBOOK.PY: APPLET: AFT APPLETTAGTOKEN REPLACE: APPLETHTML_SAFER = %s' % str(applethtml_safer)
#
            # placeholder until get teachertube icon if any
            #relative_thumbnail = u'http://localhost/rpc/ck12/images?id=4'
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
#
#	    title = ''
#	    caption = ''
            video = element('videoobject',
                            empty_element\
                            ('videodata',
                             internalid=internalid))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': fb2napplet_type}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            node.attributes['caption'] = caption
            node.attributes['klass'] = fb2napplet_type
            node.attributes['htmllocal'] = applethtml_safer
            node.children = [media]
            return self.figure(node)
# handle case: empty applethtml
	else:
	    return ''
#
    def customembed(self, node):
        applethtml = node.content.get('customembed')
        print 'DOCBOOK.PY: CUSTOMEMBED: APPLETHTML = %s' % str(applethtml)
        if applethtml:
            fb2napplet_type = 'fb2ncustomembed'
	    applet_type = 'customembed'
            fileref_value = 'CustomembedNoImagedataFileref'
            applethtml = applethtml.strip()
# handle case: empty applethtml
            applethtml_safer = applethtml
	    applethtml_safer = self.remove_ck12_ids(applethtml_safer)
            applethtml_safer = applethtml_safer.replace('"', u'DOCBOOKDOUBLEQUOTE')
            applethtml_safer = applethtml_safer.replace('<', u'DOCBOOKLEFTANGLE')
            applethtml_safer = applethtml_safer.replace('>', u'DOCBOOKRIGHTANGLE')
            print 'DOCBOOK.PY: CUSTOMEMBED: APPLETHTML_SAFER = %s' % str(applethtml_safer)
# Bug 3797: applethtml has <, >, "
            embeddable = applethtml
            embeddable = self.remove_ck12_ids(embeddable)
            decodedjson = self.get_embed_info(embeddable, True)
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
# docbook figure should have attribute starting as
# htmllocal="DOCBOOKLEFTANGLEobject id=DOCBOOKDOUBLEQUOTEeo_customembed_2_objectDOCBOOKDOUBLEQUOTE
# .....
# insert into applethtml_safer surrounded by spaces immediately after
# DOCBOOKLEFTANGLEobject  :
# id=DOCBOOKDOUBLEQUOTEeo_customembed_<internalid>_objectDOCBOOKDOUBLEQUOTE
            internalid_in_htmllocal = ' id=DOCBOOKDOUBLEQUOTEeo_' + applet_type + '_' + \
                str(internalid) + '_object' + 'DOCBOOKDOUBLEQUOTE'
            applettagtoken = 'DOCBOOKLEFTANGLEobject'
            print 'internalid_in_htmllocal = %s' % internalid_in_htmllocal
            print 'applettagtoken = %s' % applettagtoken
            applethtml_safer = applethtml_safer.replace(applettagtoken, applettagtoken + internalid_in_htmllocal)
            print 'DOCBOOK.PY: APPLET: AFT APPLETTAGTOKEN REPLACE: APPLETHTML_SAFER = %s' % str(applethtml_safer)
#
            relative_thumbnail = decodedjson.get('thumbnail', '')
            title = decodedjson.get('description', '')
            caption = decodedjson.get('caption', '')
            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            if caption is not None:
                caption = caption.replace('\n', ' ')
                caption = caption.replace('\r', ' ')
#
#           title = ''
#           caption = ''
            video = element('videoobject',
                            empty_element\
                            ('videodata',
                             internalid=internalid))
            thumbnail = element('imageobject',
                                empty_element_explicit\
                                ('imagedata',
                                 {'fileref': relative_thumbnail,
                                  'class': fb2napplet_type}))
            media = element('mediaobject',
                            video,
                            thumbnail)
            node = Node(title)
            node.attributes['caption'] = caption
            node.attributes['klass'] = fb2napplet_type
            node.attributes['htmllocal'] = applethtml_safer
            node.children = [media]
            return self.figure(node)
# handle case: empty applethtml
        else:
            return ''

    def remove_ck12_ids(self, applethtml_safer):
	html_no_eo_ids = self.remove_ck12_eo_ids(applethtml_safer)
	return self.remove_ck12_internal_ids(html_no_eo_ids)

    def remove_ck12_internal_ids(self, applethtml_safer):
        start_index = string.find(applethtml_safer, 'internalid=\"', 0)
        #print 'start_index = %s' % start_index
        if start_index < 0:
            return applethtml_safer
        else:
            end_index = string.find(applethtml_safer, '\"', start_index + 12)
            # handle case of end_index == -1 which would mean ill-formed html code in wiki
            #print 'end_index = %s    ,    start_index = %s' % (end_index, start_index)
            #print 'applethtml_safer = %s' % applethtml_safer
            #applethtml_safer_str = str(applethtml_safer)
            id_substring = applethtml_safer[start_index:end_index + 1]
            return applethtml_safer.replace(id_substring, '')

    def remove_ck12_eo_ids(self, applethtml_safer):
	start_index = string.find(applethtml_safer, 'id=\"eo_', 0)
	#print 'start_index = %s' % start_index
	if start_index < 0:
	    return applethtml_safer
	else:
	    end_index = string.find(applethtml_safer, '\"', start_index + 7)
	    # handle case of end_index == -1 which would mean ill-formed html code in wiki
            #print 'end_index = %s    ,    start_index = %s' % (end_index, start_index)
	    #print 'applethtml_safer = %s' % applethtml_safer
	    #applethtml_safer_str = str(applethtml_safer)
	    id_substring = applethtml_safer[start_index:end_index + 1]
	    return applethtml_safer.replace(id_substring, '')
#
    def skipembeddedobject(self, node):
        pass
#
    def unknownmedia(self, node):
        print node

    translation = {'Node': node,
                   'Text': text,
                   'Cite': cite,
                   'Style': style,
                   'Paragraph': paragraph,
                   'Item': item,
                   'ItemList': itemlist,
                   'Section': section,
                   'Table': table,
                   'Math': math,
                   'Blockmath': blockmath,
                   'Anchor': anchor,
                   'Book': book,
                   'Article': article,
                   'Timeline': timeline,
                   'TagNode': tagnode,
                   'URL': url,
                   'NamedURL': namedurl,
                   'Link': link,
                   'ArticleLink': article_link,
                   'SpecialLink': partial(link, type='special'),
                   'NamespaceLink': article_link,
                   'InterwikiLink': partial(link, type='interwiki'),
                   'LangLink': partial(link, type='lang'),
                   'CategoryLink': partial(link, type='category'),
                   'ImageLink': imagelink,
                   'Control': text,
                   'Strong': strong,
                   'Emphasized': emphasized,
                   'BreakingReturn': breakingreturn,
                   'PreFormatted': preformatted,
                   'Teletyped': teletyped,
                   'Code': code,
                   'Strike': strike,
                   'Underline': underline,
                   'Span': span,
                   'Sup': sup,
                   'Sub': sub,
                   'Center': center,
                   'Blockquote': blockquote,
                   'Div': div,
                   'DefinitionList': definitionlist,
                   'HorizontalRule': horizontalrule,
                   'Reference': reference,
                   'ReferenceList': referencelist,
                   'Figure': figure,
                   # handle sub-figure images and inline distinctly?
                   'Image': image,
                   'Float': float,
                   'Caption': caption,
                   'BlankArticle': blankarticle,
		   # Bug 3448
		   'SchoolTube': schooltube,
		   'TeacherTube': teachertube,
		   'RemoteSwf': remoteswf,
		   'RemoteVideo': remotevideo,
		   'Audio': audio,
		   'Applet': applet,
		   'Customembed': customembed,
		   'SkipEmbeddedObject': skipembeddedobject,
		   #
                   'YouTube': youtube,
                   'UnknownMedia': unknownmedia,
                   }

    # a wiki db will have to be used to instantiate the class, if
    # we're to make use of templates in captions, etc.
    #
    # caption is currently the children of the tag; should introduce a
    # <caption></caption> element?
    class ImageTag(TagExtension):
        name = 'image'
                
        def __call__(self, content, attributes):
            class Figure(Node):
                attributes = {}
                def __init__(self, title, id, klass, caption, *children):
                    super(Figure, self).__init__(title)
                    self.attributes['id'] = id
                    self.attributes['klass'] = klass
                    self.attributes['caption'] = parse('caption',
                                                       caption).children
                    self.children = children
                    
            class Image(Node):
                attributes = {}
                def __init__(self, source, klass):
                    super(Image, self).__init__()
                    self.attributes['source'] = source
                    self.attributes['klass'] = klass
                    dont_purge(self)

            figure = Figure(attributes.get('alt'),
                            attributes.get('id'),
                            attributes.get('class'),
                            content,
                            Image(attributes.get('src'),
                                  attributes.get('class')))
            return figure

    class FloatTag(TagExtension):
        name = 'float'

        def __call__(self, content, attributes):
            class Float(Node):
                attributes = {}
                def __init__(self, title, id, *children):
                    super(Float, self).__init__(title)
                    self.attributes['id'] = id
                    self.children = children

            class FloatContent(Node):
                attributes = {}
                def __init__(self, klass, content):
                    self.attributes['klass'] = klass
                    content = parse('content', content)
                    self.children = content.children

            # image is a type of float; yet an inconsistenty here:
            # title vs. alt
            float = Float(attributes.get('title'),
                          attributes.get('id'),
                          FloatContent(attributes.get('class'),
                                       content))

            return float

    class BlockmathTag(TagExtension):
        name = 'blockmath'

        def __call__(self, content, attributes):
            class Blockmath(Node):
                def __init__(self, caption):
                    super(Blockmath, self).__init__()
                    self.caption = caption
                    dont_purge(self)

            return Blockmath(content)

    class MediaTag(TagExtension):
        name = 'media'

        def __call__(self, content, attributes):
            class UnknownMedia(Node):
                pass

            class YouTube(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = attributes.get('id')
                    dont_purge(self)
# Bug 3448
            class SchoolTube(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = attributes.get('id')
                    dont_purge(self)

            class TeacherTube(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = attributes.get('id')
		    self.attributes['videoflashvars'] = attributes.get('flashvars', "")
                    dont_purge(self)

            class RemoteSwf(Node):
                attributes = {}
                def __init__(self, attributes):
# NOTE videosrc NOT videoid, correponding difference in remoteswf fn
                    self.attributes['videosrc'] = attributes.get('src')
                    self.attributes['videoflashvars'] = attributes.get('flashvars', "")
                    dont_purge(self)

            class RemoteVideo(Node):
                attributes = {}
                def __init__(self, attributes):
# NOTE videosrc NOT videoid, correponding difference in remotevideo fn
# flashvars would be added here if supported in mediawiki
                    self.attributes['videosrc'] = attributes.get('src')
                    self.attributes['videoflashvars'] = attributes.get('flashvars', "")
                    dont_purge(self)

            class Audio(Node):
                attributes = {}
                def __init__(self, attributes):
# NOTE videosrc NOT videoid, correponding difference in remotevideo fn
                    self.attributes['audiosrc'] = attributes.get('src')
                    dont_purge(self)

            class Applet(Node):
                attributes = {}
		content = {}
                def __init__(self, content, attributes):
#                    self.attributes['videoflashvars'] = attributes.get('flashvars', "")
		    self.content['applet'] = content
                    dont_purge(self)
#
            class Customembed(Node):
                attributes = {}
                content = {}
                def __init__(self, content, attributes):
#                    self.attributes['videoflashvars'] = attributes.get('flashvars', "")
                    self.content['customembed'] = content
                    dont_purge(self)
#
            class SkipEmbeddedObject(Node):
                attributes = {}
                def __init__(self, attributes):
                    dont_purge(self)
#
            # case sensitive, btw; instantiates each of these
# Bug 3448 original:
#            return {'youtube': YouTube}\
	    if Options_container.disable_embedded_objects:
		return SkipEmbeddedObject(attributes)
	    else:
	        embedded_object_class = {'youtube': YouTube, 'schooltube': SchoolTube, 'teachertube': TeacherTube,\
                 'remoteswf': RemoteSwf, 'remotevideo': RemoteVideo, 'audio': Audio, 'applet': Applet,\
		 'customembed': Customembed}\
                    .get(attributes['class'],
                         UnknownMedia)
	        if embedded_object_class in [Applet, Customembed]:
	            return embedded_object_class(content, attributes)
	        else:
                    return {'youtube': YouTube, 'schooltube': SchoolTube, 'teachertube': TeacherTube,\
		     'remoteswf': RemoteSwf, 'remotevideo': RemoteVideo, 'audio': Audio}\
                        .get(attributes['class'],
                         UnknownMedia)\
                         (attributes)

    class AnchorTag(TagExtension):
        name = 'a'

        def __call__(self, content, attributes):
            def purge_ref_of_octothorpe(href):
                from re import findall
                href = findall('[^#]+$', href)
                if href:
                    return href[0]
                else:
                    return href

            class Anchor(Node):
                attributes = {}
                def __init__(self, href, id, text):
                    super(Anchor, self).__init__()
                    if href:
                        self.attributes['href'] = purge_ref_of_octothorpe(href)
                    if id:
                        self.attributes['id'] = id
                    if text:
                        self.children = [Text(text)]
                    else:
                        dont_purge(self)
                    
            return Anchor(attributes.get('href'),
                          attributes.get('id'),
                          content)

    for klass in [ImageTag,
                  FloatTag,
                  BlockmathTag,
                  MediaTag,
                  AnchorTag
                  ]:
        if not default_registry.__contains__(klass.name):
            default_registry.registerExtension(klass)

    def __init__(self,
                 translation=translation,
                 wiki=wiki,
                 image_dir=image_dir,
                 out=out,
                 references=references,
                 rpc=rpc, 
				 webLocation="http://localhost"):
        super(Docbook, self).__init__(translation)
        self.wiki = wiki
        self.image_dir = image_dir
        self.out = out
        self.references = references
        self.rpc = rpc
        self.webLocation = webLocation
