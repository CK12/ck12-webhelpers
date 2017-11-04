/**
 * Copyright 2007-2010 CK-12 Foundation
 *
 * All rights reserved
 *      
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied.  See the License for the specific language governing
 * permissions and limitations.
 *
 * This file originally written by Shanmuga Bala
 *
 * $Id$
 */
(function () {
    'use strict';

    tinymce.create('tinymce.plugins.CK12PastePlugin', {
        init: function (ed /*, url*/ ) {

            var t = this,
                acceptableID = ['__mce_tmp', 'ck12image', '__mce_tmp_caption', 'previewImg'],
                acceptableClass = ['ck12-media-placeholder', 'mceItemTable'],
                acceptableDataAttributes = ['data-error', 'data-mce-src'],
                forceRemoveAttributes = ['mce_bogus'],
                invalid_elements = ['nobr'];

            function removeEmptyandDataAttributes(node) {
                var attribIndex, attribName,
                    attributesArray = [],
                    domAttributes = node.attributes;
                if (domAttributes.length) {
                    for (attribIndex = 0; attribIndex < domAttributes.length; attribIndex++) {
                        attribName = domAttributes[attribIndex].name;
                        if ('type' !== attribName && 'input' === node.nodeName.toLowerCase()) {
                            // do not change type property on an input (due to browser constraints), trim all other properties of all other elements
                            $(node).attr(attribName, (domAttributes[attribIndex].value || '').trim());
                        }
                        if (0 === attribName.indexOf('data-') && -1 === acceptableDataAttributes.indexOf(attribName) && -1 === attribName.indexOf('data-ck12embed-')) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                        if (attribName && !domAttributes[attribIndex].value) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                        if (-1 !== forceRemoveAttributes.indexOf(attribName)) {
                            attributesArray.push(domAttributes[attribIndex].name);
                        }
                    }
                    $(node).removeAttr(attributesArray.join(' '));
                }
            }

            function checkForInvalidCK12Content() {

                if ($(this).hasClass('x-ck12-mathEditor') || $(this).parents('.x-ck12-mathEditor').length) {
                    return this;
                }

                if (-1 !== invalid_elements.indexOf((this.tagName || '').toLowerCase())) {
                    $(this).remove();
                    return false;
                }

                var index, classList = this.classList;

                if ((0 !== this.id.indexOf('x-ck12-') || 8 > this.id.length) && -1 === acceptableID.indexOf(this.id)) {
                    this.id = '';
                }
                for (index = 0; index < classList.length; index++) {
                    if ((0 !== classList.item(index).indexOf('x-ck12-') || 8 > classList.item(index).length) && -1 === acceptableClass.indexOf(classList.item(index))) {
                        classList.remove(classList.item(index));
                        index--;
                    }
                }
                removeEmptyandDataAttributes(this);
                return this;
            }

            // Register commands
            ed.addCommand('mcePreProcess', function (ui, o) {
                //Bug 9152 MS word doc list copy past convert to list structure
                //stack used to store closing <ul> or <ol> tag values
                var a, i, htmlElement, srtStyle, startIndex, endIndex, nbspIndex, dotIndex, bracketIndex, level, levelStr, latestLevel,
                    currentContents, imgPattern, imgArray, isImgURLLocal, olPattern, olArray, formattedOl, ol, aPattern, aArray, anchor,
                    formattedAnchor, pasteInsideElementBox,
                    content = o.content,
                    listTag = [],
                    newContent = '',
                    intLevel = 0,
                    startOfList = true,
                    listStructure = '';

                if (/class="?Mso|style="[^"]*\bmso-|w:WordDocument/i.test(content)) {
                    $(content).each(function () {
                        htmlElement = $(this).html();
                        if ('null' !== htmlElement) {
                            srtStyle = $(this).attr('style').toString();
                            startIndex = htmlElement.lastIndexOf('__MCE_ITEM__') + '__MCE_ITEM__'.length;
                            endIndex = -1;
                            //Replace all &nbsp characters which appears before the start of actual text.
                            while (true) {
                                if (htmlElement.substring(startIndex).substring(0, 6) === '&nbsp;') {
                                    htmlElement = htmlElement.replace('&nbsp;', '');
                                } else {
                                    break;
                                }
                            }
                            nbspIndex = htmlElement.indexOf('&nbsp;');
                            dotIndex = htmlElement.indexOf('.', startIndex);
                            bracketIndex = htmlElement.indexOf(')', startIndex);

                            if (dotIndex !== -1 || bracketIndex !== -1) {
                                if (dotIndex !== -1 && (bracketIndex === -1 || dotIndex < bracketIndex)) {
                                    endIndex = dotIndex;
                                } else if (bracketIndex !== -1 && (dotIndex === -1 || bracketIndex < dotIndex)) {
                                    endIndex = bracketIndex;
                                }
                                if (endIndex > nbspIndex) {
                                    endIndex = -1;
                                }
                            }
                            if (srtStyle && !(srtStyle === undefined) && srtStyle.indexOf('mso-list') !== -1) {
                                try {
                                    //@@ListStructure@@ key is used to place the list structure in the original content once
                                    //structure gets created.
                                    if (startOfList) {
                                        //Place holder for list structure
                                        newContent += '@@ListStructure@@';
                                        startOfList = false;
                                    }

                                    level = srtStyle.substring(srtStyle.indexOf('mso-list')).split(' ');
                                    levelStr = '';
                                    if (level[1].indexOf('level') !== -1) {
                                        levelStr = level[1].substring(5);
                                    } else {
                                        //Fix for IE, in IE level appears at third
                                        //position in the array
                                        levelStr = level[2].substring(5);
                                    }
                                    latestLevel = parseInt(levelStr, 10);
                                    currentContents = '';
                                    //If current li item level is greater than previous then start new list
                                    if (intLevel < latestLevel) {
                                        if (endIndex !== -1) {
                                            listStructure += '<ol>';
                                            listTag.push('</ol>');
                                        } else {
                                            listStructure += '<ul>';
                                            listTag.push('</ul>');
                                        }
                                    } else if (intLevel > latestLevel) {
                                        //if current li item level is less than previous then first close all 
                                        //the list tags till the current level
                                        for (i = intLevel; i > latestLevel && listTag.length > 0; i--) {
                                            a = listTag.pop();
                                            listStructure += a;
                                        }
                                    }
                                    intLevel = latestLevel;

                                    //Fix to avoid displaying extra bullets in case of unordered/bulleted list
                                    if (endIndex !== -1) {
                                        currentContents = htmlElement.substring(endIndex + 1).replace(/(&nbsp;)*/gi, '');
                                    } else {
                                        currentContents = htmlElement.replace(/(__MCE_ITEM__)*/gi, '').substring(1).replace(/(&nbsp;)*/gi, '');
                                    }
                                    listStructure += '<li>' + currentContents + '</li>';

                                } catch (e) {
                                    console.log(e);
                                }
                            } else {
                                for (i = intLevel; i > 0 && listTag.length > 0; i--) {
                                    listStructure += listTag.pop();
                                }
                                newContent += $('<div>').append(this).html();
                                newContent = newContent.replace('@@ListStructure@@', listStructure);
                                startOfList = true;
                                listStructure = '';
                                intLevel = 0;
                            }
                        }
                    });
                } else {
                    newContent += content;
                }
                if (newContent.indexOf('@@ListStructure@@') !== -1) {
                    newContent = newContent.replace('@@ListStructure@@', listStructure);
                    startOfList = true;
                    listStructure = '';
                    intLevel = 0;
                }
                content = newContent;

                //Removing Script tags
                content = content.replace(/<\s*script.*?>/g, '').replace(/<\/script.*?>/g, '');
                //Reformatting Header tags
                //Bug 9066 : removing class attribute from Header tags
                //console.debug(content);
                //Bug 10233 h4 replace is added, h3 h4 & h5 on replace kept as it is being Format Sections 1,2 & 3. h6 is changed to h5.
                content = content.replace(/<h5>/g, '<h5>').replace(/<\/h5>/g, '</h5>').replace(/<h5\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h5>');
                content = content.replace(/<h6>/g, '<h5>').replace(/<\/h6>/g, '</h5>').replace(/<h6\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h5>');
                content = content.replace(/<h4>/g, '<h4>').replace(/<\/h4>/g, '</h4>').replace(/<h4\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h4>');
                content = content.replace(/<h3>/g, '<h3>').replace(/<\/h3>/g, '</h3>').replace(/<h3\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h3>');
                content = content.replace(/<h2>/g, '<h3>').replace(/<\/h2>/g, '</h3>').replace(/<h2\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h3>');
                content = content.replace(/<h1>/g, '<h3>').replace(/<\/h1>/g, '</h3>').replace(/<h1\s*class="\s*((\w|\s|_*|-*)*)\s*"\s*>/gi, '<h3>');
                content = content.replace(/<u>/gi, '<span class="x-ck12-underline">').replace(/<\/u>/gi, '</span>');
                content = content.replace(/<s>/gi, '<span class="x-ck12-strikethrough">').replace(/<\/s>/gi, '</span>');
                //Bug 8837 inline image identified by parent span class name, is applied class x-ck12-img-inline to pass through processing.  
                content = content.replace(/<\s*span\s*class="x-ck12-img-inline">\s*<img/gim, '<span class="x-ck12-img-inline"><img class="x-ck12-img-inline" ');
                content = content.replace(/<br>/g, '\n');

                //Bug 9153 ms word page break changed to hr with ck12 pagebrake class.  
                content = content.replace(/<br\s*style="mso-special-character:line-break;\s*page-break-before:always"\s*clear="all"\s*>/gi, '<hr class="x-ck12-pagebreak" />');

                // Bug 9149 indent of ms word paste, change p with style margin-left to single indent with ck12 indent class.
                //content = content.replace(/<p\s*style="\s*margin-left:.in[;]|\s*\S*"\s*>/gi,'<p class="x-ck12-indent">');
                content = content.replace(/<p\s.*style="margin-left:\.in.*\/>/gi, '<p class="x-ck12-indent">');

                // Exclude images that are CK12 image e.g that have 'x-ck12-math'  class. e.g: 
                // <img class="x-ck12-math" alt="3^{\text{rd}}" src="/flx/math/inline/3%5E%7B%5Ctext%7Brd%7D%7D">
                // OR images that have src from CK12 site e.g images with source like 
                // <img width="450" id="" alt="" longdesc="" title="" src="/flx/render/perma/resource/THUMB_POSTCARD/image/user/a8af51e2789a7dbdf31d7b3b445e3ccb.jpg">
                // These are all CK12 internal images. We do not want them to be modified in any way.
                // see bugs 2971 and 721

                //Build RE to exclude CK-12 Images and include external images e.g pasted from google
                // ck12-media-placeholder class for media placeholder image should not be modified in any way. See bug 8551.
                //Bug 8837 inline image is applied class x-ck12-img-inline and bypassed through processing. 
                //var imgPattern = new RegExp(/<img\\s((?!x-ck12-math)(?!ck12-media-placeholder)(?!\/ck12\/images\\?id\\=).)+?>/g);
                imgPattern = new RegExp(/<img+\s+((?!x-ck12-math)(?!x-ck12-img-inline)(?!ck12-media-placeholder)(?!x-ck12-block-math)(?!x-ck12-hwpmath)(?!\/perma\/resource)(?!>).)+?>/ig);
                imgArray = content.match(imgPattern);
                isImgURLLocal = false;

                if (imgArray !== null) {
                    var img, altPattern, flxUrlPattern, srcPattern, titlePattern, flxurl, src, alt, title, alt_data, caption_data,
                        title_data, flxurl_data, formattedImg, url;
                    for (i = 0; i < imgArray.length; i++) {
                        img = imgArray[i];
                        altPattern = new RegExp('alt="(.*?)"');
                        flxUrlPattern = new RegExp('data-flx-url="(.*?)"');
                        srcPattern = new RegExp(/src\s*=\s*"(.+?)"/g);
                        titlePattern = new RegExp('title="(.*?)"');
                        src = img.match(srcPattern); //src='img loc'
                        alt = img.match(altPattern); //alt='img desc',img desc
                        title = img.match(titlePattern); //title='img desc'
                        flxurl = img.match(flxUrlPattern); //data-flx-url=' flx relative loc'
                        alt_data = '';
                        caption_data = '';
                        title_data = '';
                        flxurl_data = '';

                        if (alt !== null) {
                            if (alt.length > 0) {
                                alt_data = alt[1];
                            }
                            caption_data = alt[1];
                        }

                        if (title !== null) {
                            if (title.length > 0) {
                                title_data = title[1];
                            }
                        }

                        if (flxurl !== null) {
                            if (flxurl.length > 0) {
                                flxurl_data = flxurl[1];
                            }
                        }

                        formattedImg = '';
                        if (src !== null) {
                            if ((src.toString()).indexOf('file:/') !== -1) {
                                url = (src.toString()).match('src="(.*?)"');
                                if (url !== null) {
                                    if (url.length > 0) {
                                        tinyMCE.activeEditor.execCommand('mceAdvImage');
                                    }
                                }
                                isImgURLLocal = true;
                                break;
                            }
                            if (-1 !== src.toString().indexOf('data:image')) {
                                $(document).trigger($.flxweb.editor.tinymce.events.DATA_IMAGE, $(content)[0]);
                                content = $(content).addClass('x-ck12-dataimage-' + window.imageClassIterator)[0].outerHTML;
                            } else {
                                formattedImg = '<div class="x-ck12-img-postcard x-ck12-nofloat" ><p><img ' + src;
                                formattedImg += ' data-flx-url = "' + flxurl_data + '" longdesc="' + caption_data + '" title="' + title_data + '" alt="' + alt_data + '"/></p></div>';
                                if (!isImgURLLocal) {
                                    content = content.replace(img, formattedImg);
                                }
                            }
                        }

                    }
                }
                olPattern = new RegExp(/<ol+\s+(?!x-ck12-\w+)(?!>)(?=type\s*=\s*\"?(\w+)\"?).+?>/ig);
                olArray = content.match(olPattern);
                formattedOl = '';
                if (olArray !== null) {
                    var typePattern, olClass, type,
                        decimalPattern = new RegExp(/\d+/),
                        romanUpperAlphaPattern = new RegExp(/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/),
                        romanLowerAlphaPattern = new RegExp(/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/i),
                        lowerAlphaPattern = new RegExp(/[a-z]+/),
                        upperAlphaPattern = new RegExp(/[A-Z]+/);

                    for (i = 0; i < olArray.length; i++) {
                        ol = olArray[i];
                        olClass = '';
                        typePattern = new RegExp(/type\s*=\s*\"?(\w+)\"?/);
                        type = ol.match(typePattern);
                        if (type !== null && type.length > 1) {
                            if (decimalPattern.test(type[1])) {
                                olClass = 'x-ck12-decimal';
                            } else if (romanUpperAlphaPattern.test(type[1])) {
                                olClass = 'x-ck12-upper-roman';
                            } else if (romanLowerAlphaPattern.test(type[1])) {
                                olClass = 'x-ck12-lower-roman';
                            } else if (lowerAlphaPattern.test(type[1])) {
                                olClass = 'x-ck12-lower-alpha';
                            } else if (upperAlphaPattern.test(type[1])) {
                                olClass = 'x-ck12-upper-alpha';
                            }
                        }
                        formattedOl = '<ol class="' + olClass + '" >';
                        content = content.replace(ol, formattedOl);
                    }
                }

                aPattern = new RegExp(/<a[^<]*(href="([^"]+)">)/g);
                aArray = content.match(aPattern);
                formattedAnchor = '';
                if (aArray !== null) {
                    var href, hrefPattern = new RegExp('href="(.*?)"');
                    for (i = 0; i < aArray.length; i++) {
                        anchor = aArray[i];
                        href = anchor.match(hrefPattern); //href='http://wwww.example.com'
                        if (href !== null && href.length > 1) {
                            formattedAnchor = '<a href="' + href[1] + '" >';
                            content = content.replace(anchor, formattedAnchor);
                        }

                    }
                }
                pasteInsideElementBox = t._pasteInsideElementBox(tinyMCE.activeEditor);
                //Change all the elementboxes inside the pasting content to para tags<p>, if you past the content inside an element box.
                if (pasteInsideElementBox) {
                    var ebElements, ebPattern = new RegExp(/<div.*?class=\"(x-ck12-element-box-body|x-ck12-element-box-header|x-ck12-element-box)\".*?>/g);
                    ebElements = content.match(ebPattern);

                    if (ebElements !== null) {
                        for (i = 0; i < ebElements.length; i++) {
                            content = content.replace(ebElements[i], '<p>');
                        }
                    }


                    //Bug 9061 : remove class,data-artifactrevisionid,data-artifacttype,data-artifactid attribute of paste content in Element box
                    content = content.replace(/class=["']+(?!x-ck12).*["']+"/gim, '').replace(/data-artifactrevisionid="\s*((\w|\s|_*|-*)*)\s*"/gim, '');
                    content = content.replace(/data-artifacttype="\s*((\w|\s|_*|-*)*)\s*"/gim, '').replace(/data-artifactid="\s*((\w|\s|_*|-*)*)\s*"/gim, '');

                }
                content = t._pasteInsideTable(tinyMCE.activeEditor, content);
                if (content.indexOf('MathJax-Span') !== -1) {
                    if (content.indexOf('x-ck12-mathEditor') !== -1) {
                        content = t._pasteEquation(tinyMCE.activeEditor, content);
                    } else {
                        content = '';
                    }
                }
                content = $('<div>' + content + '</div>').children().each(function () {
                    if ($(this).closest('.x-ck12-mathEditor').length) {
                        return false;
                    }
                    if (ed.dom.isBlock(this)) {
                        $(this).addClass('x-ck12-dirty').removeClass('x-ck12-validated');
                    }
                }).end().html();
                o.content = content;
            });

            ed.addCommand('mcePostProcess', function (ui, o) {
                //Remove any non-ck12 classes and Ids pasted content
                $(o.node).find('*').each(function () {
                    checkForInvalidCK12Content.call(this);

                    var objClasses, arr_classes, newClasses, c, objId, newId,
                        obj = $(this);
                    objClasses = obj.attr('class');
                    if (objClasses && objClasses.indexOf('x-ck12-') === -1) {
                        arr_classes = objClasses.split(' ');
                        newClasses = '';
                        for (c = 0; c < arr_classes.length; c++) {
                            if (arr_classes[c].indexOf('x-ck12-') !== -1 || arr_classes[c].indexOf('ck12-') !== -1) {
                                newClasses += arr_classes[c] + ' ';
                            }
                        }
                        obj.attr('class', newClasses);
                    }
                    objId = obj.attr('id');
                    if (objId && objId.indexOf('x-ck12-') === -1) {
                        if (!obj.hasClass('x-ck12-mathEditor') && objId.match('MathJax')) {
                            obj.removeAttr('id');
                        } else {
                            // Bug 39475: Make sure the mce_<id> id for span elements of Math editor is unique
                            if (tinymce.activeEditor.dom.get(objId) !== null) {
                                newId = tinymce.DOM.uniqueId();
                                while (tinymce.activeEditor.dom.get(newId) !== null) {
                                    newId = tinymce.DOM.uniqueId();
                                }
                                obj.attr('id', newId);
                            }
                        }
                    }
                    // modality_content div have data-loadurl which if pasted causes content validatin error.  
                    obj.removeAttr('data-loadurl');
                });
                //Remove any non-text node from header tags
                $(o.node).find('h1,h2,h3,h4,h5,h6').find('*').remove();
            });
        },
        _pasteInsideElementBox: function (ed) {
            var sc, ec,
                ebClass = ed.getParam('element_box_class'),
                ebHeaderClass = ed.getParam('element_box_header_class'),
                ebBodyClass = ed.getParam('element_box_body_class');

            sc = ed.dom.getParent(ed.selection.getStart(), function (n) {
                return ed.dom.hasClass(n, ebClass) ||
                    ed.dom.hasClass(n, ebHeaderClass) ||
                    ed.dom.hasClass(n, ebBodyClass);
            });
            ec = ed.dom.getParent(ed.selection.getEnd(), function (n) {
                return ed.dom.hasClass(n, ebClass) ||
                    ed.dom.hasClass(n, ebHeaderClass) ||
                    ed.dom.hasClass(n, ebBodyClass);
            });
            if (sc && ec) {
                return true;
            }
            return false;
        },
        _pasteInsideTable: function (editor, content) {
            var tableElements, iframeElements, i, hasCell, arrElm, _content,
                tablePattern = new RegExp(/<table.*?>.*<\/table.*?>/gmi),
                iframePattern = new RegExp(/<iframe.*?>.*<\/iframe.*?>/gmi),
                newLinePattern = new RegExp(/\n/gmi);
            // Replace new line characters so that pattern can be matched.
            _content = content.replace(newLinePattern, '');

            tableElements = content.replace(/\n/gmi, '').match(tablePattern);
            iframeElements = content.replace(/\n/gmi, '').match(iframePattern);

            if (tableElements !== null || iframeElements !== null) {
                if (editor && editor.parents && editor.parents.length > 0) {
                    hasCell = false;
                    // Loop over parents array as there could be other elements than 'TD' 
                    for (i = 0;
                        (i < editor.parents.length && !hasCell); i++) {
                        arrElm = editor.parents[i];
                        if ('TD' === arrElm.tagName.toUpperCase()) {
                            hasCell = true;
                            // if iframe present in copied content
                            if (iframeElements !== null) {
                                content = _content.replace(iframePattern, '');
                            }
                            // if table present in copied content
                            if (tableElements !== null) {
                                content = _content.replace(tablePattern, '');
                            }
                        }
                    }
                }
            }
            return content;
        },
        _pasteEquation: function (editor, content) {
            /* var $this, newContent, newId, oldId,
                 modifiedContent = '',
                 contentToSearch = '';
             $.each($($.trim(content)), function () {
                 $this = $(this);
                 if ($this.hasClass('x-ck12-mathEditor')) {
                     $this.find('br.Apple-interchange-newline').remove();
                     newId = tinymce.DOM.uniqueId();
                     while (editor.dom.get(newId) !== null) {
                         newId = tinymce.DOM.uniqueId();
                     }
                     contentToSearch = $(editor.serializer.serialize(this));
                     contentToSearch.find('span.x-ck12-mathEditor').attr('contenteditable', false);
                     contentToSearch = contentToSearch.html();
                     idMath = contentToSearch.indexOf('id="mce_');
                     if(idMath == -1){
                     	$this.attr('id',newId);
                     }
                     else {
                         oldId = 'mce_' + contentToSearch.slice(idMath + 8, contentToSearch.indexOf('"', idMath + 8));
                         newContent = contentToSearch.split(oldId).join(newId);
                     }
                 } else {
                     if ($this.html() === '&nbsp;') {
                         newContent = '&nbsp;';
                     } else {
                         newContent = $(editor.serializer.serialize(this)).html();
                     }
                 }
                 modifiedContent = modifiedContent + newContent;
             });
                 */

            var modifiedContent, $this, oldId, newId, mathLatex, thisContent,
                contentUpdate = $('<div>' + content + '</div>');
            $.each((contentUpdate.find('.x-ck12-mathEditor')), function () {
                $this = $(this);
                //mathLatex = ('@$' + decodeURIComponent($this.data('tex')) + '@$').replace(/</g, '&lt;');
                $this.find('br.Apple-interchange-newline').remove();
                oldId = $this.attr('id');
                newId = tinymce.DOM.uniqueId();
                while (editor.dom.get(newId) !== null) {
                    newId = tinymce.DOM.uniqueId();
                }
                thisContent = ($this.html()).split(oldId).join(newId);
                $this.html(thisContent).attr({id:newId, contenteditable:false});
                //editor.contentWindow.MathJax.Hub.Queue(['Typeset',editor.contentWindow.MathJax.Hub,this]);
            });
            //editor.contentWindow.MathJax.Hub.Queue(['Typeset', editor.contentWindow.MathJax.Hub]);
            modifiedContent = ($(contentUpdate).html() || '').trim();
            return modifiedContent;
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12paste', tinymce.plugins.CK12PastePlugin);
}());