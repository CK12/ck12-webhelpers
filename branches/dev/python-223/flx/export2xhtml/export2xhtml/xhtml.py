from sys import stdout
from functools import partial
from logging import warning
from string import ascii_letters, join
from random import sample
from os.path import split, join as path_join, exists
from shutil import copy
from urllib import quote
import re
from BeautifulSoup import BeautifulStoneSoup
import Image
from datetime import datetime

from mwlib.parser import Node, Text, Caption
from mwlib.advtree import DefinitionTerm, DefinitionDescription
from mwlib.tagext import TagExtension, default_registry
from elementtree.SimpleXMLWriter import encode_entity

from lisp import car, cdr, cadr, cddr, dict_merge, nullp, cons, pairwise
from render import render, StringPort, parse, empty_element_explicit, \
     element_explicit, empty_element, element, dont_purge, create_comment
from export2xhtml.render import Options_container
from translation import Translation
import helpers as h
import settings

class XHTML(Translation):
    xhtmlurl = ''
    local_swf = settings.SWF_PLAYER
    rosetta_version = "0.2"
    wiki = None
    references = {}
    image_dir = None
    out = stdout
    rpc = 'http://localhost/flx/math/'

    def node(self, node):
        def issubinstance(a, A):
            return a.__class__.__name__ != A.__name__

        if issubinstance(node, Node):
            warning('unknown node: %s', str(node))

        return node.children

    def default(self, translation, node):
        self.node(node)

    def text(self, node):
        if node.caption:
            img_tag_re = re.compile('(&#60;img .*? /&#62;)', re.DOTALL)
            encoded_text = encode_entity(node.caption)
            for eachTag in img_tag_re.findall(encoded_text):
                encoded_text = encoded_text.replace(eachTag,
                                                    h.convert_html_entitities(eachTag))
            return encoded_text
        else:
            return ''

    def book(self, node):
        return element('book',
                       element('title',
                               Text(node.caption.replace('_', ' '))),
                       node.children)

    def article_info(self):
        return element('chapterinfo',
                       element('rosetta-version',
                               Text(self.rosetta_version)))

    #TODO: Need to replace element_explicit_simple with the more generic
    #element_explicit
    def title_info(self):
        return element('title',' ')

    def get_css_styles(self):
        styles = ''
        styles = styles+h.get_textcolor_styles()
        styles = styles+h.get_textbgcolor_styles()
        styles = styles+h.elementbox_style
        return styles

    def article(self, node):
        return element('html',
                       element('head', ''),
                       element('body',
                               self.title_info(),
                               node.children),
                               xmlns = 'http://www.w3.org/1999/xhtml')


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
        return element('a', node.caption, href=node.caption)

    def namedurl(self, node):
        if node.children and node.children[-1].__class__.__name__ == 'URL':
            node.children[0].caption = node.caption
            node.removeChild(node.children[-1])
        return element('a',
                       node.children,
                       href=node.caption)

    # presence of type/target distinguishes it from URLs
    def link(self, node, type='link'):
        return element('a',
                       node.children,
                       href=(node.url if node.url else ''),
                       target=node.full_target,
                       type=type)

    def article_link(self, node):
        href = node.target
        if href.__contains__(h.POUND_SIGN_TEXT):
            href = href.replace(h.POUND_SIGN_TEXT,'#')
        if href.startswith('#'):
            href = href.replace('#','')
            href = '#' + h.genURLSafeBase64Encode(unicode(href).encode('utf-8'))
            url = href
        else:
            url = self.wiki.wiki.getURL(node.target)
        return element('a',
                       Text(node.target),
                       href=url)

    def emphasis(self, node, role):
        return element('emphasis',
                       node.children,
                       role=role)

    def strong(self, node):
        return element('strong',
                       node.children)

    def emphasized(self, node):
        return element('em',
                       node.children)

    def strike(self, node):
        return element_explicit('span',
                       node.children,
                       {"class" : "x-ck12-strikethrough"})


    def underline(self, node):
        return element_explicit('span',
                       node.children,
                       {"class" : "x-ck12-underline"})

    def style(self, node):
        return self.emphasized(node, translation, self.default) \
               if node.caption == "''" \
               else self.strong(node, translation, self.default)

    def paragraph(self, node):
        try:
            if node.children[0].caption:
                node.children[0].caption = re.sub(h.verticalSpaceIntmRaw,h.verticalSpaceRaw,node.children[0].caption)
        except Exception:
            print "From PARA: Caption '%s' is not good" % node.children[0].caption
        if node.parent is not None and isinstance(node.parent, Caption):
            return node.children
        else:
            return element_explicit('p', node.children, node.attributes)

    def item(self, node):
        if node.children[0].__class__.__name__ == "ItemList":
            return node.children
        else:
            return element('li', node.children)

    def _isNodeChildOfProblem(self, node):
        if node.getParents():
            classType = node.getParents()[-1].attributes.get('class', '')
            return classType == 'x-ck12-problem'
        return False

    def itemlist(self, node):
        tag = 'ol' if node.numbered else 'ul'
        if tag == 'ol' and not node.attributes.get('class') and node.liststyle:
            # This is due to a bug in mediawiki. For OrderedList mediawiki
            # returns the liststyle as x-ck12-decimal! To fix it, we override
            # the liststyle here.
            if self._isNodeChildOfProblem(node) and node.liststyle == 'x-ck12-decimal':
                node.attributes['class'] = 'x-ck12-lower-alpha'
            else:
                node.attributes['class'] = node.liststyle
        return element_explicit(tag, node.children, node.attributes)

    def section(self, node):
        """A section of level 1 is actually a title block; every section
        thereafter has a mono-super-ordinate level."""
        title = car(node.children)
        rest = cdr(node.children)
        if len(title.children) > 0:
            h_id = h.genURLSafeBase64Encode(unicode(title.children[0].caption).encode('utf-8'))
        else:
            h_id = h.genURLSafeBase64Encode(unicode(h.getRandomString(10)).encode('utf-8'))
        if not h_id:
            h_id = h.genURLSafeBase64Encode(unicode(h.getRandomString(10)).encode('utf-8'))
        nodeLevel = node.level
        if nodeLevel > 5:
            nodeLevel = 5
        title = element('h%d' %(nodeLevel), title, id=h_id)
        if node.level > 1:
            return [title, rest]
        else:
            return [title, rest]

    def table(self, node):
        class Table(XHTML):
            def row(self, node):
                return element('tr', node.children)

            def cell(self, node):
                if node.attributes.has_key('header') and node.attributes['header']:
                    return element('th', node.children)
                else:
                    return element('td', node.children)

            translation = dict_merge(self.translation,
                                     {'Row': row,
                                      'Cell': cell})

            def __init__(selfchen, translation=translation):
                super(Table, selfchen).__init__(translation,
                                                wiki=self.wiki,
                                                image_dir=self.image_dir,
                                                out=self.out,
                                                rpc=self.rpc)

        captioned = not nullp(node.children) and \
                    isinstance(car(node.children), Caption)
        caption, header, body = \
                {0: ([], [], []),
                1: (node.children, [], []) if captioned
                # Aligned columns to 4-spaces
                else ([], [], node.children)} \
                    .get(len(node.children),
                    (car(node.children),
                    cadr(node.children),
                    cddr(node.children)) if captioned
                    else ([], car(node.children), cdr(node.children)))
        #I know its a hack, but currently mwlib does not support marking
        #the header distinctly
        if len(node.children) == 1:
            header = node.children[0]
            body = []
        headerTag = ''
        for i in range(len(header.children)):
            headerTag = headerTag + '<th>%s</th>' \
                                %(header.children[i].asText())

        for i in range(len(header.children)):
            header.children[i].attributes['header'] = True

        headerTag = element('tr', headerTag)
        # Bug 2324
        if 'infobox' in node.attributes.get('class', '').lower():
            if str(XHTML.xhtmlurl).find('wikipedia') > -1:
                return ''
        longcaption = ''
        for each_child in node.children:
            if len(each_child.children) > 0:
                if each_child.children[0].__class__.__name__ == "Text":
                    longcaption = each_child.children[0]
        caption = element('caption',longcaption)
        if node.attributes.get('float'):
            table_float = str(node.attributes.get('float')).lower()
            if table_float == 'off':
                node.attributes['class'] = 'x-ck12-nofloat'
            else:
                node.attributes['class'] = 'x-ck12-float'
        if node.attributes.get('id') and node.attributes.get('id').strip() == 'table:':
            node.attributes['id'] = h.genURLSafeBase64Encode(unicode(h.getRandomString(10)).encode('utf-8'))

        render(Table(),
               element_explicit
               ('table',
                node.children if nullp(node.children)
                else [caption,
                      element('thead', header) if (header and body) else header,
                      element('tbody', body) if body else body],
               h.clear_dictionary({'summary': node.attributes.get('title'),
                'title': node.attributes.get('title'),
                'id': h.genURLSafeBase64Encode(node.attributes.get('id')),
                'border': node.attributes.get('border'),
                'class': node.attributes.get('class')}, ['id'])),
               self.out)


    def math(self, node):
        return empty_element_explicit('img',
                             {'class': 'x-ck12-math', \
                              'src': self.rpc + 'inline/' +\
                              quote(node.caption.encode('utf-8')), \
                                # see
                                # http://mail.python.org/pipermail/python-dev/2006-July/067248.html
                                # for the necessity of encode()
                              'alt' : node.caption})

    def blockmath(self, node):
        return empty_element_explicit('img',
                             {'class': 'x-ck12-block-math', \
                              'src': self.rpc + 'block/' +\
                              quote(node.caption.encode('utf-8')), \
                                # see
                                # http://mail.python.org/pipermail/python-dev/2006-July/067248.html
                                # for the necessity of encode()
                              'alt' : node.caption})

    def anchor(self, node):
        href = node.attributes.get('href')
        if href:
            if href.__contains__(h.POUND_SIGN_TEXT):
                href = href.replace(h.POUND_SIGN_TEXT,'#')
            if href.startswith('#'):
                href = href.replace('#','')
                href = '#' + h.genURLSafeBase64Encode(unicode(href).encode('utf-8'))
            return element('a',
                           node.children,
                           href=href)
        else:
            return node.children


    def preformatted(self, node):
        return element('pre', node.children)

    def breakingreturn(self, node):
        return '\n'

    def teletyped(self, node):
        return element('computeroutput', node.children)

    def code(self, node):
        return element('node', node.children)

    def sub(self, node):
        return element('sub', node.children)

    def sup(self, node):
        return element('sup', node.children)

    # not really sure what to do with this one
    def center(self, node):
        return node.children

    def span(self, node):
        return element_explicit('span', node.children, node.attributes)

    def div(self, node):
        supportedDiv = False
        if node.attributes.has_key('class') and node.attributes['class'].startswith('x-ck12-'):
            supportedDiv = True
        if supportedDiv:
            return element_explicit('div', node.children, node.attributes)
        return node.children

    def blockquote(self, node):
        if node.children[0].__class__.__name__ != 'Paragraph':
            return element('blockquote', element('p', node.children))
        else:
            return element('blockquote', node.children)

    def definitionlist(self, node):
        class DefinitionList(XHTML):
            def definitionterm(self, node):
                return element('dt', node.children)

            def definitiondescription(self, node):
                return element('dd', node.children)

            translation = dict_merge(XHTML.translation,
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
               element('dl',
                       node.children),
               self.out)


    def horizontalrule(self, node):
        return empty_element('beginpage')


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
        else:
            if str(XHTML.xhtmlurl).find('wikipedia') > -1:
                return ''
            else:
                return empty_element('xref', linkend=name)


    def referencelist(self, node):
        return element('bibliography',
                       map(lambda name:
                           element('bibliomixed',
                                   self.references[name],
                                   id=name),
                           self.references.iterkeys()))


    def figure_iframe(self, node):
        author = node.attributes.get('author', '')
        license = node.attributes.get('license', '')
        return element_explicit('iframe',
                            ["%s%s%s"%(create_comment('@@author="%s"'%(author))[0],
                            create_comment('@@license="%s"'%(license))[0],
                            create_comment('@@embeddable="%s"'%h.genURLSafeBase64Encode(node.attributes.get('embeddable'), usePrefix=False))[0])
                             ],
                            {'id': node.attributes.get('id'),
                             'name': node.attributes.get('name'),
                             'title': node.attributes.get('title'),
                             'longdesc': quote(node.attributes.get('longdesc')),
                             'class': node.attributes.get('class'),
                             'width': node.attributes.get('width'),
                             'height': node.attributes.get('height'),
                             'src': node.attributes.get('src'),
                             'frameborder': '0'})


    def figure(self, node):
        htmllocal = node.attributes.get('htmllocal', None)
        node.children[0].caption = node.caption
        if node.children[0].__class__.__name__ == 'Image':
            image = node.children[0].attributes['source']
            image = BeautifulStoneSoup(image, convertEntities=BeautifulStoneSoup.HTML_ENTITIES).text
            source = self.wiki.images.getDiskPath(image)
            if source:
                im = Image.open(source)
                widthImage = im.size[0]
            else:
                widthImage = 0
        try:
            out = StringPort()
            render(self, node.attributes.get('caption'), out)
            node.children[0].attributes['caption'] = out.read()
        except Exception as e:
            node.children[0].attributes['caption'] = ''
            print "FIGURE: %s"% node.attributes.get('caption')
            print "FIGURE: %s"% e.__str__()
        if htmllocal is None:
            if node.attributes.get('align') == 'float':
                width = 'width:%spx;' %(widthImage)
            else:
                width = ''

            return element_explicit('div',
                                [create_comment('@@author="%s"'%node.children[0].attributes.get('author','')),
                                create_comment('@@url="%s"'%node.children[0].attributes.get('url','')),
                                create_comment('@@license="%s"'%node.children[0].attributes.get('license','')),
                                 element('p', node.children), element('p', node.children[0].attributes['caption'])],
                                    {'class': "x-ck12-img-%s x-ck12-%s" %(node.attributes.get('size'), node.attributes.get('align'))})
        else:
            htmllocal = htmllocal.replace('&#38;amp;', '&#38;')
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
# If export2xhtml invoked with -e option, as on authors preview.php, insert figureeo tag instead
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


    def imageobject(self, image, klass, width=None, title = "", longdesc = "",
                    thumb=False, id = ""):
        image = BeautifulStoneSoup(image, convertEntities=BeautifulStoneSoup.HTML_ENTITIES).text
        WIDTH = ''
        if not self.wiki:
            return None

        source = self.wiki.images.getDiskPath(image)
        if source and exists(source):
            path, file = split(source)
            timestamp = datetime.now().strftime("%Y%m%d%s%f")
            file = timestamp + '_' + file
            target = path_join(self.image_dir, file.replace(' ', '_'))
            copy(source, target)
        else:
            return None

        return empty_element_explicit('img',
                                h.clear_dictionary(
                                 {'src': target,
                                 'width': '%s' % (width \
                                                    if width \
                                                    else WIDTH),
                                 'alt': title,
                                 'title': title,
                                 'longdesc': quote(longdesc),
                                 'id':id }, ['id']))


    def imagelink(self, node):
        inlineimage =  self.imageobject(node.target,
                                None,
                                node.width,
                                "",
                                "",
                                node.thumb)
        if inlineimage:
            author = node.attributes.get('author', '')
            license = node.attributes.get('license', '')
            url = node.attributes.get('url', '')
            authorComment = create_comment('@@author="%s"' %(author))
            licenseComment = create_comment('@@license="%s"'%(license))
            urlComment = create_comment('@@url="%s"'%(url))[0] if url else ''
            comments = authorComment[0] + licenseComment[0] + urlComment
            inlineimage = '<span class="x-ck12-img-inline"> %s %s </span>' %(comments, inlineimage[0])
            return inlineimage
        else:
            return ''

    def image(self, node):
        def full_target_to_target(full_target):
            head, sep, tail = full_target.partition(':')
            return tail if tail else full_target
        return self.imageobject(full_target_to_target\
                                (node.attributes.get('source')),
                                node.attributes.get('klass'),
                                width = None,
                                title = node.caption,
                                longdesc = node.attributes.get('caption'),
                                id = node.attributes.get('id'))

    def float(self, node):
        class Float(XHTML):
            def floatcontent(self, node):
                return element('mediaobject',
                               element('textobject',
                                       empty_element_explicit\
                                       ('textdata',
                                        {'class':
                                         node.attributes.
                                         get('klass')})),
                               node.children)

            translation = dict_merge(XHTML.translation,
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

    def youtube(self, node):
        videoid = node.attributes.get('videoid')
        if videoid:
            if u'\u0026NR=1' in videoid:
                videoid = videoid.replace(u'\u0026NR=1', u'')
            src = u'http://www.youtube.com/watch?v=' + unicode(videoid)
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            embeddable = '<iframe title="YouTube Video Player" width="480" height="360" src="%s"></iframe>' %(src.replace('/watch?v=', '/embed/'))
            ##decodedjson = self.get_embed_info(embeddable, author, license)
            decodedjson = {}
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('caption')
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            align = node.attributes.get('align','nofloat')
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

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''
            node = Node(title)
            node.attributes['id'] = 'x-ck12-%s' %(h.genURLSafeBase64Encode(videoid))
            node.attributes['name'] = internalid
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = frame_border
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)

    def vimeo(self, node):
        videoid = node.attributes.get('videoid', '')
        if videoid:
            if u'\u0026NR=1' in videoid:
                videoid = videoid.replace(u'\u0026NR=1', u'')
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            embeddable = '<iframe src="http://player.vimeo.com/video/%s?badge=0" width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' % videoid
            #embeddable = '<object width="500" height="281"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=%s&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=a8a8a8&amp;fullscreen=1&amp;autoplay=0&amp;loop=0" /><embed src="http://vimeo.com/moogaloop.swf?clip_id=%s&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=a8a8a8&amp;fullscreen=1&amp;autoplay=0&amp;loop=0" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="500" height="281"></embed></object>' %(videoid, videoid)
            internalid = 'NoIdFoundInJson-Vimeo'
            title = node.attributes.get('title') if node.attributes.get('title', '') else ''
            description = node.attributes.get('description') if node.attributes.get('description', '') else ''
            align = node.attributes.get('align','nofloat')
            width = node.attributes.get('width', '')
            height = node.attributes.get('height', '')
            embed_code = node.attributes.get('code','')

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

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''
            node = Node(title)
            node.attributes['id'] = 'x-ck12-%s' %(h.genURLSafeBase64Encode(videoid))
            node.attributes['name'] = internalid
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = frame_border
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)

    def schooltube(self, node):
        videoid = node.attributes.get('videoid')
        if videoid:
            src = u'http://www.schooltube.com/v/' + unicode(videoid)
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            #decodedjson = self.get_embed_info(embeddable, author, license)
            embeddable = '<object id="%s" width="425" height="344"><param name="movie" value="%s"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="%s" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="344"></embed></object>' %(videoid, src, src)
            decodedjson = {}
            if decodedjson is None:
                return ''
            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            align = node.attributes.get('align','nofloat')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            author = node.attributes.get('author')
            license = node.attributes.get('license')
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
                src_url = decodedjson.get('url', '').split('/title')[0]

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''

            node = Node(title)
            node.attributes['id'] = 'x-ck12-%s' %(h.genURLSafeBase64Encode(videoid))
            node.attributes['name'] = internalid
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = frame_border
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)

    def teachertube(self, node):
        videoid = str(node.attributes.get('videoid'))
        if videoid:
            embeddableviewVideotemplate = u'http://www.teachertube.com/viewVideo.php?video_id=VIDEOID'
            embeddable = embeddableviewVideotemplate.replace('VIDEOID', unicode(videoid))
            embeddable = '<embed src="http://www.teachertube.com/embed/player.swf" width="470" height="275" bgcolor="undefined" allowscriptaccess="always" allowfullscreen="true" flashvars="file=http://www.teachertube.com/embedFLV.php?pg=video_%s&menu=false&frontcolor=ffffff&lightcolor=FF0000&logo=http://www.teachertube.com/www3/images/greylogo.swf&skin=http://www.teachertube.com/embed/overlay.swf&volume=80&controlbar=over&displayclick=link&viral.link=http://www.teachertube.com/viewVideo.php?video_id=%s&stretching=exactfit&plugins=viral-2&viral.callout=none&viral.onpause=false"/>' %(videoid, videoid)
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            #decodedjson = self.get_embed_info(embeddable, author, license)
            decodedjson = {}
            if decodedjson is None:
                return ''

            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            align = node.attributes.get('align','nofloat')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            #embed_code = decodedjson.get('code','')
            src_url = decodedjson.get('url')

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''

            node = Node(title)
            node.attributes['id'] = 'x-ck12-%s' %(h.genURLSafeBase64Encode(videoid))
            node.attributes['name'] = internalid
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = "0"
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)


    def remoteswf(self, node):
        videosrc = node.attributes.get('videosrc')
        if videosrc:
            flashvars = node.attributes.get('flashvars', "")
            #embeddable = videosrc
            embeddable = '<object id="player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" name="player" width="640" height="480"><param name="movie" value="%s" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><embed type="application/x-shockwave-flash" id="player2" name="player2" src="%s" width="640" height="480" allowscriptaccess="always" allowfullscreen="true"/></object>' %(videosrc, videosrc)
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            #decodedjson = self.get_embed_info(embeddable, author, license)
            decodedjson = {}
            if decodedjson is None:
                return ''

            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            align = node.attributes.get('align','nofloat')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            #embed_code = decodedjson.get('code','')
            src_url = videosrc

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''

            node = Node(title)
            node.attributes['name'] = internalid
            node.attributes['id'] = 'x-ck12-%s' %(h.getRandomString(10))
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = "0"
            node.attributes['flashvars'] = flashvars
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)

    def remotevideo(self, node):
        videosrc = node.attributes.get('videosrc')
        if videosrc:
            flashvars = node.attributes.get('flashvars', "")
            embeddable = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="400" height="315"><param name="movie" value="%s" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="flashvars" value="file=%s" /><embed type="application/x-shockwave-flash" src="%s" width="400" height="315" allowscriptaccess="true" allowfullscreen="true" flashvars="file=%s" /></object>' %(self.local_swf, videosrc, self.local_swf, videosrc)
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            #decodedjson = self.get_embed_info(embeddable, author, license)
            decodedjson = {}
            if decodedjson is None:
                return ''

            internalid = decodedjson.get('id', 'NoIdFoundInJson')
            internalid = unicode(internalid)
            flashvars = embeddable
            flashvars = unicode(flashvars)
            title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            align = node.attributes.get('align','nofloat')
            width = decodedjson.get('width', '')
            height = decodedjson.get('height', '')
            #embed_code = decodedjson.get('code','')
            src_url = videosrc

            if title is not None:
                title = title.replace('\n', ' ')
                title = title.replace('\r', ' ')
            else:
                title = ''
            if description is not None:
                description = description.replace('\n', ' ')
                description = description.replace('\r', ' ')
            else:
                description = ''

            node = Node(title)
            node.attributes['name'] = internalid
            node.attributes['id'] = 'x-ck12-%s' %(h.getRandomString(10))
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = "0"
            node.attributes['flashvars'] = flashvars
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)

    def audio(self, node):
        audiosrc = node.attributes.get('audiosrc')
        if audiosrc:
            #videoflashvars = node.attributes.get('videoflashvars', "")
            embeddable = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="400" height="20"><param name="movie" value="%s" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="flashvars" value="file=%s&provider=sound" /><embed type="application/x-shockwave-flash" src="%s" width="400" height="20" allowscriptaccess="true" allowfullscreen="true" flashvars="file=%s&provider=sound" /></object>' %(self.local_swf, audiosrc, self.local_swf, audiosrc)
            #decodedjson = self.get_embed_info(embeddable)
            decodedjson = {}
            flashvars = embeddable
            flashvars = unicode(flashvars)
            description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
            author = node.attributes.get('author')
            license = node.attributes.get('license')
            align = node.attributes.get('align','nofloat')
            if decodedjson is None:
                title = ''
                caption = ''
                width = '400'
                height = '20'
                src_url = audiosrc
                frame_border = ''
                allow_fullscreen = ''
                relative_thumbnail = ''
                internalid = 'notfound'
                iframeid = "eo_audio_%s_iframe" %(internalid)
            else:
                internalid = decodedjson.get('id', 'NoIdFoundInJson')
                internalid = unicode(internalid)
                width = decodedjson.get('width', '')
                height = decodedjson.get('height', '')
                src_url = decodedjson.get('url')
                relative_thumbnail = decodedjson.get('thumbnail', '')
                title = decodedjson.get('description', '')
                caption = decodedjson.get('caption', '')
                #embed_code = decodedjson.get('code')
                if title is not None:
                    title = title.replace('\n', ' ')
                    title = title.replace('\r', ' ')
                else:
                    title = ''
                if caption is not None:
                    caption = caption.replace('\n', ' ')
                    caption = caption.replace('\r', ' ')
                else:
                    caption = ''
                if description is not None:
                    description = description.replace('\n', ' ')
                    description = description.replace('\r', ' ')
                else:
                    description = ''

            node = Node(title)
            node.attributes['name'] = internalid
            node.attributes['id'] = 'x-ck12-%s' %(h.getRandomString(10))
            node.attributes['title'] = title
            node.attributes['longdesc'] = description
            node.attributes['class'] = 'x-ck12-%s' %(align)
            node.attributes['width'] = width
            node.attributes['height'] = height
            node.attributes['src'] = src_url
            node.attributes['frameborder'] = "0"
            node.attributes['flashvars'] = flashvars
            node.attributes['author'] = author
            node.attributes['license'] = license
            node.attributes['embeddable'] = embeddable
            return self.figure_iframe(node)


    def applet(self, node):
        applethtml = node.content.get('applet')
        embeddable = re.search('(<[ ]*applet.*</[ ]*applet[ ]*>)',applethtml).groups()[0]
        author = node.attributes.get('author')
        license = node.attributes.get('license')
        #decodedjson = self.get_embed_info(embeddable, author, license, True)
        decodedjson = {}
        if decodedjson is None:
            return ''
        internalid = decodedjson.get('id', 'NoIdFoundInJson')
        internalid = unicode(internalid)
        title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
        description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
        align = node.attributes.get('align','nofloat')
        width = decodedjson.get('width', '')
        height = decodedjson.get('height', '')
        src_url = decodedjson.get('url')

        if title is not None:
            title = title.replace('\n', ' ')
            title = title.replace('\r', ' ')
        else:
            title = ''
        if description is not None:
            description = description.replace('\n', ' ')
            description = description.replace('\r', ' ')
        else:
            description = ''

        node = Node(title)
        node.attributes['name'] = internalid
        node.attributes['id'] = 'x-ck12-%s' %(h.getRandomString(10))
        node.attributes['title'] = title
        node.attributes['longdesc'] = description
        node.attributes['class'] = 'x-ck12-%s' %(align)
        node.attributes['width'] = width
        node.attributes['height'] = height
        node.attributes['src'] = src_url
        node.attributes['frameborder'] = "0"
        node.attributes['author'] = author
        node.attributes['license'] = license
        node.attributes['embeddable'] = embeddable
        return self.figure_iframe(node)


    def customembed(self, node):
        embeddable = node.content.get('customembed', True)
        author = node.attributes.get('author')
        license = node.attributes.get('license')
        #decodedjson = self.get_embed_info(embeddable, author, license, True)
        decodedjson = {}

        if decodedjson is None:
            return ''
        internalid = decodedjson.get('id', 'NoIdFoundInJson')
        internalid = unicode(internalid)
        title = node.attributes.get('title') if node.attributes.get('title') else decodedjson.get('title')
        description = node.attributes.get('description') if node.attributes.get('description') else decodedjson.get('description')
        align = node.attributes.get('align','nofloat')
        width = decodedjson.get('width', '')
        height = decodedjson.get('height', '')
        src_url = decodedjson.get('url')

        if title is not None:
            title = title.replace('\n', ' ')
            title = title.replace('\r', ' ')
        else:
            title = ''
        if description is not None:
            description = description.replace('\n', ' ')
            description = description.replace('\r', ' ')
        else:
            description = ''

        node = Node(title)
        node.attributes['name'] = internalid
        node.attributes['id'] = 'x-ck12-%s' %(h.getRandomString(10))
        node.attributes['title'] = title
        node.attributes['longdesc'] = description
        node.attributes['class'] = 'x-ck12-%s' %(align)
        node.attributes['width'] = width
        node.attributes['height'] = height
        node.attributes['src'] = src_url
        node.attributes['frameborder'] = "0"
        node.attributes['author'] = author
        node.attributes['license'] = license
        node.attributes['embeddable'] = embeddable
        return self.figure_iframe(node)


    def skipembeddedobject(self, node):
        pass


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
                   'Image': image,
                   'Float': float,
                   'Caption': caption,
                   'BlankArticle': blankarticle,
                   'SchoolTube': schooltube,
                   'TeacherTube': teachertube,
                   'RemoteSwf': remoteswf,
                   'RemoteVideo': remotevideo,
                   'Audio': audio,
                   'Applet': applet,
                   'Customembed': customembed,
                   'SkipEmbeddedObject': skipembeddedobject,
                   'YouTube': youtube,
                   'Vimeo': vimeo,
                   'UnknownMedia': unknownmedia,
                   }

    class ImageTag(TagExtension):
        name = 'image'
        def __call__(self, content, attributes):
            class Figure(Node):
                attributes = {}
                def __init__(self, attributes, caption, *children):
                    attributes = h.convert_strip_dictionary(attributes)
                    super(Figure, self).__init__(attributes.get('title'))
                    self.attributes['id'] = h.genURLSafeBase64Encode(attributes.get('id'))
                    self.attributes['source'] = attributes.get('src')
                    align = attributes.get('align').lower()
                    if align == 'left' or align == 'right':
                        align = 'float'
                    else:
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['caption'] = attributes.get('caption')
                    self.attributes['author'] = attributes.get('author')
                    self.attributes['title'] = attributes.get('title')
                    self.attributes['license'] = attributes.get('license')
                    self.attributes['url'] = attributes.get('url', '')
                    size = attributes.get('class').replace(' ', '').lower()
                    if size not in ['thumbnail', 'postcard','fullpage']:
                        size = 'postcard'
                    self.attributes['size'] = size
                    self.attributes['caption'] = parse('caption',
                                                       caption).children
                    self.children = children

            class Image(Node):
                #attributes = {}
                def __init__(self, attributes):
                    super(Image, self).__init__()
                    attributes = h.convert_strip_dictionary(attributes)
                    self.attributes['id'] = h.genURLSafeBase64Encode(attributes.get('id'))
                    self.attributes['source'] = attributes.get('src')
                    align = attributes.get('align').lower()
                    if align == 'left' or align == 'right':
                        align = 'float'
                    else:
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['caption'] = attributes.get('caption')
                    self.attributes['author'] = attributes.get('author')
                    self.attributes['title'] = attributes.get('title')
                    self.attributes['license'] = attributes.get('license')
                    self.attributes['url'] = attributes.get('url', '')
                    size = attributes.get('class').replace(' ', '').lower()
                    if size not in ['thumbnail', 'postcard','fullpage']:
                        size = 'postcard'
                    self.attributes['size'] = size
                    dont_purge(self)
            figure = Figure(attributes,
                            content,
                            Image(attributes))
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
                    self.attributes['videoid'] = attributes.get('id').strip()
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class Vimeo(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = str(attributes.get('id', '')).strip()
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class SchoolTube(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = attributes.get('id').strip()
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class TeacherTube(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videoid'] = attributes.get('id')
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class RemoteSwf(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videosrc'] = attributes.get('src').strip()
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    self.attributes['flashvars'] = attributes.get('flashvars', "")
                    dont_purge(self)

            class RemoteVideo(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['videosrc'] = attributes.get('src').strip()
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    self.attributes['flashvars'] = attributes.get('flashvars', "")
                    dont_purge(self)

            class Audio(Node):
                attributes = {}
                def __init__(self, attributes):
                    self.attributes['audiosrc'] = attributes.get('src').strip()
                    dont_purge(self)

            class Applet(Node):
                attributes = {}
                content = {}
                def __init__(self, content, attributes):
                    self.content['applet'] = content
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class Customembed(Node):
                attributes = {}
                content = {}
                def __init__(self, content, attributes):
                    self.content['customembed'] = content
                    self.attributes['title'] = attributes.get('title')
                    if attributes.get('description'):
                        self.attributes['description'] = quote(attributes.get('description'))
                    else:
                        self.attributes['description'] = ''
                    align = attributes.get('align')
                    if align != 'float':
                        align = 'nofloat'
                    self.attributes['align'] = align
                    self.attributes['author'] = attributes.get('author', '')
                    self.attributes['license'] = attributes.get('license', '')
                    dont_purge(self)

            class SkipEmbeddedObject(Node):
                attributes = {}
                def __init__(self, attributes):
                    dont_purge(self)

            if Options_container.disable_embedded_objects:
                return SkipEmbeddedObject(attributes)
            else:
                embedded_object_class = {'youtube': YouTube, 'vimeo': Vimeo, 'schooltube': SchoolTube, 'teachertube': TeacherTube,\
                'remoteswf': RemoteSwf, 'remotevideo': RemoteVideo, 'audio': Audio, 'applet': Applet,\
                'customembed': Customembed}.get(attributes['class'],UnknownMedia)
                if embedded_object_class in [Applet, Customembed]:
                    return embedded_object_class(content, attributes)
                else:
                    return {'youtube': YouTube, 'vimeo': Vimeo, 'schooltube': SchoolTube, 'teachertube': TeacherTube,\
                        'remoteswf': RemoteSwf, 'remotevideo': RemoteVideo, 'audio': Audio}\
                        .get(attributes['class'],UnknownMedia)(attributes)

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
                 rpc=rpc):
        super(XHTML, self).__init__(translation)
        self.wiki = wiki
        self.image_dir = image_dir
        self.out = out
        self.references = references
        self.rpc = rpc
