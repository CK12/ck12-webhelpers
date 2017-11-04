/**
 * Copyright 2007-2011 CK-12 Foundation
 *
 * All rights reserved
 *
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations.
 *
 * This file originally written by Shanmuga Bala
 *
 * $Id$
 */

/* global Base64:false */

    var do_upload = false;
    var image_meta = {
        author: '',
        //license: "CC BY-NC", //"CC BY-NC-SA"
        url: ''
    };

var ImageDialog = (function() {
    'use strict';

    var win = getWin();

    var _popupEditor = win.tinymce.activeEditor,
        _popup = _popupEditor.windowManager.windows[0];

    function getWin() {
        return window.dialogArguments || opener || parent || top;
    }

    function getSelectValue(form_obj, field_name) {
        var elm = form_obj.elements[field_name];

        if (elm == null || elm.options == null || elm.selectedIndex === -1) {
            return '';
        }

        return elm.options[elm.selectedIndex].value;
    }

    function selectByValue(form_obj, field_name, value, add_custom, ignore_case) {
        if (!form_obj || !form_obj.elements[field_name]) {
            return;
        }

        if (!value) {
            value = '';
        }

        var sel = form_obj.elements[field_name];

        var found = false;
        for (var i = 0; i < sel.options.length; i++) {
            var option = sel.options[i];

            if (option.value === value || (ignore_case && option.value.toLowerCase() == value.toLowerCase())) {
                option.selected = true;
                found = true;
            } else {
                option.selected = false;
            }
        }

        if (!found && add_custom && value !== '') {
            var option = new Option(value, value);
            option.selected = true;
            sel.options[sel.options.length] = option;
            sel.selectedIndex = sel.options.length - 1;
        }

        return found;
    }

    var $ = getWin().jQuery;

    return {
        // preInit: function() {
        //     var url;

        //     // tinyMCEPopup.requireLangPack();

        //     if (url = _popupEditor.getParam('external_image_list_url')) {
        //         document.write('<script language="javascript" type="text/javascript" src="' + _popupEditor.documentBaseURI.toAbsolute(url) + '"></script>');
        //     }
        // },

        init: function(ed) {
            var f    = document.forms[0],
                nl   = f.elements,
                dom  = ed.dom,
                n    = ed.selection.getNode(),
                ck12 = getWin().$.flxweb.settings;

            var parent, parentNode, captionText = '';
            // _popupEditor.resizeToInnerSize();
            this.resource_perma_endpoint = ck12.render_resource_perma_endpoint;
            if (!this.resource_perma_endpoint) {
                this.resource_perma_endpoint = '/flx/show';
            }

            var imgClassThumbnail = _popupEditor.getParam('image_class_thumbnail');
            var imgClassPostcard = _popupEditor.getParam('image_class_postcard');
            var imgClassFullpage = _popupEditor.getParam('image_class_fullpage');
            var imgClassFloat = _popupEditor.getParam('image_class_float');
            var imgClassNofloat = _popupEditor.getParam('image_class_nofloat');


            var img_type = 'inline',
                img_class = '',
                img_align;

            if (n.nodeName === 'P') {
                parent = ed.dom.getParent(n, 'DIV');
            }
            //Bug 10465 disable image type selection in insert/edit image dialog if image is being inserted in the table,set default to inline.
            var table = ed.dom.getParent(n, 'TABLE');
            if (table && table.nodeName === 'TABLE') {
                $('#type_list').val('inline');
                $('#type_list').attr('disabled', 'true');
                this.toggleInlineForm(true);
            }


            if (parent && parent.nodeName === 'DIV') {
                if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') > -1) {
                    //we want the <img /> element
                    getWin().tinymce.each(parent.children, function(c) {
                        if (c.firstChild && c.firstChild.nodeName === 'IMG') {
                            n = c.firstChild;
                        }
                    });
                }
            }

            if (n && n.nodeName === 'IMG') {
                nl.src.value = dom.getAttrib(n, 'src');
                nl.width.value = dom.getAttrib(n, 'width').replace('px', '');
                nl.alt.value = dom.getAttrib(n, 'alt');
                nl.title.value = dom.getAttrib(n, 'title');
                var imageID = dom.getAttrib(n, 'id');
                if (imageID && imageID !== '' && imageID.indexOf('x-ck12-') > -1) {
                    imageID = imageID.replace('x-ck12-', '');
                    nl.image_id.value = Base64.decode(imageID);
                }
                //nl.longdesc.value = dom.getAttrib(n, 'longdesc');
                parentNode = n.parentNode;
                if (parentNode && parentNode.nodeName === 'P' && parentNode.nextSibling && parentNode.nextSibling.nodeName === 'P') {
                    captionText = parentNode.nextSibling.innerHTML;
                }
                captionText = getWin().tinymce.trim(captionText);
                if (captionText === '<br>' || captionText === '<br />' || captionText === '<br/>') {
                    captionText = '';
                }
                nl.longdesc.value = captionText;
                selectByValue(f, 'type_list', img_type);
                if (img_class === '') {
                    img_class = imgClassPostcard;
                }
                selectByValue(f, 'class_list', img_class);
                this.changeType();
                this.showPreviewImage(nl.src.value, 1);
                parent = ed.dom.getParent(n, 'DIV');
                if (parent && parent.nodeName === 'DIV') {
                    if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') > -1) {
                        var img_classes = this.getAttrib(parent, 'class');
                        img_class = imgClassPostcard;
                        img_align = imgClassNofloat;

                        var img_type_class = img_classes.match('x-ck12-img-[a-z]*');
                        if (img_type_class && img_type_class.length > 0) {
                            img_class = img_type_class[0];
                        }

                        var img_align_class = img_classes.match('x-ck12-[no]*float');
                        if (img_align_class && img_align_class.length > 0) {
                            img_align = img_align_class[0];
                        }

                        img_type = 'figure';
                        selectByValue(f, 'class_list', img_class, true, true);
                        selectByValue(f, 'align_list', img_align, true, true);
                        selectByValue(f, 'type_list', img_type);
                        this.changeType();
                        //selectByValue(f, 'align', this.getAttrib(parent, 'align'));
                        this.showPreviewImage(nl.src.value, 1);
                    }
                }

                if (parent === null && n.nodeName === 'IMG') {
                    parent = ed.dom.getParent(n, 'SPAN');
                }

                if (parent) {
                    var patt = new RegExp(/@@(.*)="(.*)"/),
                        commentNode,
                        values;
                    patt.compile(patt);
                    //bug: 27473
                    //handle case for bug 27473: duplicate postcard divs
                    var postCardParent = parent.parentNode;
                    if (postCardParent && postCardParent.nodeName === 'DIV' &&
                        (ed.dom.hasClass(postCardParent, imgClassPostcard) ||
                            ed.dom.hasClass(postCardParent, imgClassThumbnail) ||
                            ed.dom.hasClass(postCardParent, imgClassFullpage))) {
                        commentNode = postCardParent.firstChild;
                    } else {
                        commentNode = parent.firstChild;
                    }
                    while (commentNode.nodeName === '#comment') {
                        values = patt.exec(commentNode.data);
                        if (values && values[1] in image_meta) {
                            image_meta[values[1]] = values[2];
                        }
                        commentNode = commentNode.nextSibling;
                    }
                    for (var meta_key in image_meta) {
                        if (image_meta[meta_key] !== 'undefined' && image_meta[meta_key] !== '') {
                            var elmName = meta_key,
                                metaElement = nl[elmName];

                            if (metaElement && metaElement !== 'undefined' && metaElement.nodeName === 'INPUT') {
                                metaElement.value = image_meta[meta_key];
                            }
                        }
                    }
                }
                do_upload = false;
            }
        },

        insert: function(file, title) {
            var ed = _popupEditor,
                t = this,
                f = document.forms[0],
                ck12 = getWin().$.flxweb.settings;
            var uploadfile = document.getElementById('uploadfile');
            var frm = document.getElementById('imageform');

            // validate uploded insert image type
            if (uploadfile.value === '' && f.src.value === '') {
                ImageDialog.uploadFailed('Please upload an image from your computer Or choose an image from the web.');
                return;
            }
            if (uploadfile.value !== '' && !this.validateFileType(uploadfile.value)) {
                ImageDialog.uploadFailed('Image insert failed. Image type jpeg, png, gif and bmp are supported.');
                return;
            }

            //Bug 10079 clear out existing source if user uploads a new file, doing edit image operation.
            if (uploadfile.value !== '' && f.src.value !== '') {
                f.src.value = '';
            }
            // Bug 7645 if entered url starts with /flx/show/ do not process it as an external url.
            if ((uploadfile.value !== '' || f.src.value !== '') && f.src.value.indexOf(this.resource_perma_endpoint) !== 0 && do_upload) {
                frm.action = ck12.resource_upload_endpoint + '?format=html';
                var options = {
                    type: 'POST',
                    url: frm.action,
                    dataType: 'json',
                    success: function(res) {
                        //var data = $.parseJSON(res);
                        if (res.status !== 'error') {
                            ImageDialog.uploadComplete(res);
                        } else {
                            var errorData = res.data;
                            if (errorData && errorData.reason === 'RESOURCE_ALREADY_EXISTS' && errorData.resource) {
                                ImageDialog.uploadComplete(errorData.resource);
                            } else {
                                ImageDialog.uploadFailed('Image insert failed. Please try again or do refresh and try again');
                            }
                        }
                    },
                    error: function() {
                        ImageDialog.uploadFailed('Image insert failed.111 Please try again or do refresh and try again');
                    }

                };
                jQuery(frm).ajaxSubmit(options);
                return;
            }


            if (f.src.value === '') {
                if (ed.selection.getNode().nodeName === 'IMG') {
                    ed.dom.remove(ed.dom.getParent(ed.selection.getNode(), 'div'));
                    ed.execCommand('mceRepaint');
                }

                _popup.close();
                return;
            }
            t.insertAndClose();
        },

        validateFileType: function(filename) {
            var filetype_re_str = '(.jpg|jpeg|png|bmp|gif)$';
            var filetype_re = new RegExp(filetype_re_str, 'i');
            return filetype_re.test(filename);
        },

        disableForm: function(val) {
            document.getElementById('uploadfile').disabled = val;
            document.getElementById('src').disabled = val;
            document.getElementById('alt').disabled = val;
            //document.getElementById('title').disabled = val;
            document.getElementById('insert').disabled = val;
            document.getElementById('cancel').disabled = val;
        },

        toggleInlineForm: function(val) {
            document.getElementById('class_list').disabled = val;
            document.getElementById('align_list').disabled = val;
            document.getElementById('longdesc').disabled = val;
            document.getElementById('image_id').disabled = val;
            document.getElementById('width').disabled = !val;
            /*if ( val ) {
                //If inline is selected, set the default align.
                document.getElementById('align').selectedIndex = 0;
            }
            document.getElementById('align').disabled = val;*/
        },

        changeFileName: function(){
            var uploadSrc = document.getElementById('uploadfile'),
                imageName = uploadSrc.value.split('\\'),
                fileName  = document.getElementById('fileName');

            $(fileName).text( imageName[imageName.length - 1] || 'No file chosen' );
        },

        uploadFailed: function(msg) {
            getWin().tinyMCE.activeEditor.windowManager.alert(msg);

            this.disableForm(false);
        },

        uploadComplete: function(res) {
            var src = res.uri;
            if (src.indexOf(this.resource_perma_endpoint) === -1) {
                src = this.resource_perma_endpoint + res.permaUri;
            }
            var imgsrc = document.getElementById('src');
            var uploadsrc = document.getElementById('uploadfile');
            var imageName = uploadsrc.value.split('\\'),
                fileName  = document.getElementById('fileName');

            fileName.innerText = imageName[imageName.length - 1];

            imgsrc.value = src;
            uploadsrc.value = '';
            do_upload = false;
            this.disableForm(false);
            this.insertAndClose();
        },

        insertAndClose: function() {
            var ed = _popupEditor,
                f = document.forms[0],
                nl = f.elements,
                v, args = {},
                el, ck12 = getWin().$.flxweb.settings;
            // _popupEditor.restoreSelection();

            var imgClassInline = _popupEditor.getParam('image_class_inline');
            var imgClassThumbnail = _popupEditor.getParam('image_class_thumbnail');
            var imgClassPostcard = _popupEditor.getParam('image_class_postcard');
            var imgClassFullpage = _popupEditor.getParam('image_class_fullpage');
            var imgClassFloat = _popupEditor.getParam('image_class_float');
            var imgClassNofloat = _popupEditor.getParam('image_class_nofloat');

            // Fixes crash in Safari
            if (getWin().tinymce.isWebKit) {
                ed.getWin().focus();
            }

            //if (!ed.settings.inline_styles) {
            //  args = {
            //      vspace : nl.vspace.value,
            //      hspace : nl.hspace.value,
            //      border : nl.border.value,
            //      align : getSelectValue(f, 'align')
            //  };
            //} else {
            // Remove deprecated values
            args = {
                vspace: '',
                hspace: '',
                border: '',
                align: ''
            };
            //}


            this.checkChangeInClass();
            /*if (nl.license) {
                image_meta['license'] = nl.license.value;
            }*/
            if (nl.url) {
                image_meta['url'] = nl.url.value;
            }
            if (nl.author) {
                image_meta['author'] = nl.author.value;
            }
            var str_meta_comment = '';
            for (var meta_key in image_meta) {
                if (image_meta[meta_key] != 'undefined' && image_meta[meta_key] !== '') {
                    str_meta_comment += '<!-- @@' + meta_key + '="' + image_meta[meta_key] + '" -->';
                }
            }
            var img_type = getSelectValue(f, 'type_list');


            // Add alert for image if width is not a number
            if (img_type === 'inline') {
                if (nl.width.value && !this.isNumber(nl.width.value)) {
                    return ed.windowManager.alert(
                        'Image width is not a number',
                        function(){
                            nl.width.focus();
                            nl.width.select();
                        }

                    );
                }
            }
            // End alert

            if (getWin().tinymce.isWebKit) {
                ed.execCommand('inserthtml', false, '');
            } else {
                ed.execCommand('mceInsertContent', false, '');
            }

            var imgParentNode = ed.selection.getNode().parentNode;
            if (img_type === 'inline') {
                var width = '';
                if (nl.width.value && this.isNumber(nl.width.value)) {
                    width = nl.width.value;
                }
                getWin().tinymce.extend(args, {
                    src: nl.src.value,
                    width: width,
                    title: nl.title.value,
                    alt: nl.alt.value
                });
                ed.execCommand('mceInsertContent', false, '<span id="ck12image">' + str_meta_comment + '<img id="__mce_tmp" /></span>', {
                    skip_undo: 1
                });
                // captioned image to inline
                if (imgParentNode.nodeName === 'DIV') {

                    //handle case for bug 27473: Remove duplicate postcard divs
                    var postCardParent = imgParentNode.parentNode;
                    if (postCardParent && postCardParent.nodeName === 'DIV' &&
                        (ed.dom.hasClass(postCardParent, imgClassPostcard) ||
                            ed.dom.hasClass(postCardParent, imgClassThumbnail) ||
                            ed.dom.hasClass(postCardParent, imgClassFullpage))) {
                        ed.dom.remove(imgParentNode, true);
                        imgParentNode = postCardParent;
                    }
                    //TODO: Why not remove all the comments ? rather than
                    //individual comments ?
                    var commentFirst, commentSecond, thirdChild, commentThird, enclosedP;
                    commentFirst = imgParentNode.firstChild;
                    if (commentFirst) {
                        commentSecond = commentFirst.nextSibling;
                    }

                    if (commentSecond) {
                        thirdChild = commentSecond.nextSibling;
                        if (thirdChild && thirdChild.nodeName === '#comment') {
                            commentThird = thirdChild;
                        } else if (thirdChild && thirdChild.nodeName === 'P') {
                            enclosedP = thirdChild;
                        }
                    }

                    if (commentFirst && commentFirst.nodeName === '#comment') {
                        ed.dom.remove(commentFirst);
                    }
                    if (commentSecond && commentSecond.nodeName === '#comment') {
                        ed.dom.remove(commentSecond);
                    }
                    if (commentThird && commentThird.nodeName === '#comment') {
                        ed.dom.remove(commentThird);
                    }
                    if (enclosedP && enclosedP.nodeName === 'P') {
                        ed.dom.remove(enclosedP, true);
                    }
                    ed.dom.remove(imgParentNode, true);
                }

                var parentElement = ed.dom.get('ck12image').parentNode;
                if (parentElement.nodeName === 'SPAN') {
                    commentFirst = parentElement.firstChild;
                    commentSecond = parentElement.firstChild.nextSibling;
                    if (commentFirst && commentFirst.nodeName === '#comment') {
                        ed.dom.remove(commentFirst);
                    }
                    if (commentSecond && commentSecond.nodeName === '#comment') {
                        ed.dom.remove(commentSecond);
                    }
                    ed.dom.remove(parentElement, true);
                }

                //Fix for bug 6522
                var img = ed.dom.get('__mce_tmp');
                img.onload = function() {
                    ed.execCommand('mceAutoResize');
                };

                ed.dom.setAttribs('__mce_tmp', args);
                ed.dom.setAttrib('__mce_tmp', 'style', 'float: ' + getSelectValue(f, 'align') + ';');
                ed.dom.setAttrib('__mce_tmp', 'id', '');
                ed.dom.addClass('ck12image', imgClassInline);
                ed.dom.setAttrib('ck12image', 'id', '');
                ed.undoManager.add();

            } else {
                var id = nl.image_id.value;
                if (!id || id === '') {
                    id = nl.src.value.substring(nl.src.value.lastIndexOf('/') + 1);
                    if (id.lastIndexOf('.') >= 0) {
                        id = id.substr(0, id.lastIndexOf('.'));
                    }
                    id = decodeURIComponent((id + '').replace(/\+/g, '%20'));
                    id = 'x-ck12-' + Base64.encode(id);
                } else {
                    id = Base64.encode(id);
                    id = 'x-ck12-' + id;
                }
                getWin().tinymce.extend(args, {
                    src: nl.src.value,
                    id: id,
                    title: nl.title.value,
                    alt: nl.alt.value,
                    longdesc: encodeURIComponent(nl.longdesc.value)
                });
                if (imgParentNode && imgParentNode.nodeName && imgParentNode.nodeName === 'DIV' && (ed.dom.hasClass(imgParentNode, imgClassThumbnail) || ed.dom.hasClass(imgParentNode, imgClassPostcard) || ed.dom.hasClass(imgParentNode, imgClassFullpage))) {
                    ed.dom.setHTML(imgParentNode, str_meta_comment + '<p><img id="__mce_tmp" /></p><p id="__mce_tmp_caption"><br/></p>');
                    ed.dom.setAttrib(imgParentNode, 'id', 'ck12image');
                    //Remove all class names
                    ed.dom.removeClass('ck12image', imgClassThumbnail);
                    ed.dom.removeClass('ck12image', imgClassPostcard);
                    ed.dom.removeClass('ck12image', imgClassFullpage);
                    ed.dom.removeClass('ck12image', imgClassNofloat);
                    ed.dom.removeClass('ck12image', imgClassFloat);
                } else {
                    ed.execCommand('mceInsertContent', false, '<div id="ck12image">' + str_meta_comment + '<p><img id="__mce_tmp" /></p><p id="__mce_tmp_caption"><br/></p></div>', {
                        skip_undo: 1
                    });
                }

                //Fix for bug 6522
                var img = ed.dom.get('__mce_tmp');
                img.onload = function() {
                    ed.execCommand('mceAutoResize');
                };

                ed.dom.setAttribs('__mce_tmp', args);
                ed.dom.setHTML('__mce_tmp_caption', nl.longdesc.value ? nl.longdesc.value : '<br/>');
                ed.dom.setAttrib('__mce_tmp_caption', 'contenteditable', 'false');
                ed.dom.setAttrib('__mce_tmp', 'id', '');
                ed.dom.setAttrib('__mce_tmp_caption', 'id', '');
                ed.dom.addClass('ck12image', getSelectValue(f, 'class_list'));
                ed.dom.addClass('ck12image', getSelectValue(f, 'align_list'));
                ed.undoManager.add();

                //Fix for bug 7337
                var ne;
                var img_div = ed.dom.get('ck12image');

                //Find next element to div
                if (img_div) {
                    ne = img_div.nextSibling;

                    //If no valid next element, Create new one
                    if (!ne || ne.nodeName === 'BR' || ne.nodeName === '#comment') {
                        var _temp = ed.getDoc().createElement('P');
                        _temp.innerHTML = '&nbsp;';
                        jQuery(_temp).insertAfter(img_div);

                        //Bug 8889 for float:left image add bogus br at bottom to resize editor.
                        // if(img_div.className.indexOf('x-ck12-float') != -1) {
                        // if($('.x-ck12-editor-clearbottom').length == 0 ) {
                        // var dummy_br = ed.getDoc().createElement('br');
                        // dummy_br.className='x-ck12-editor-clearbottom';
                        // ed.getDoc().body.appendChild(dummy_br);
                        // }
                        // }

                    }
                    ne = img_div.nextSibling;
                }

                //Move cursor out of enclosed div
                if (ne) {
                    ed.selection.select(ne);
                    ed.selection.collapse(1);
                }

                ed.dom.setAttrib('ck12image', 'id', '');

                // Bug 43761 -
                // Postcard images need an empty span before the image to allow
                // the list bullet/number to be seen
                if(img_div.parentNode.tagName === 'LI'){
                    if(!img_div.previousElementSibling || img_div.previousElementSibling.tagName !== 'SPAN'){
                        img_div.insertAdjacentHTML('beforebegin', '<span style="overflow:hidden;">&nbsp;</span>');
                    }
                }
            }


            //alert('Closing now');
            ed.nodeChanged();
            _popup ? _popup.close() : ed.windowManager.windows[0].close();
        },
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        notifyImageChange: function(input) {
            var $iframe = $( $('iframe[src$="image.htm"]')[0].contentWindow.document ),
                $prev = $iframe.find('#prev');

            do_upload = true;
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function(e) {
                    $prev.html('<img id="previewImg" src="' + e.target.result + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
                };

                reader.readAsDataURL(input.files[0]);
            }

            this.changeFileName();
        },
        checkChangeInClass: function() {

            var imgClassThumbnail = _popupEditor.getParam("image_class_thumbnail");
            var imgClassPostcard = _popupEditor.getParam("image_class_postcard");
            var imgClassFullpage = _popupEditor.getParam("image_class_fullpage");

            var f         = document.forms[0],
                nl        = f.elements,
                img_class = getSelectValue(f, 'class_list'),
                img_src   = nl.src.value,
                size      = getSelectValue(f, 'class_list'),
                re        = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', 'g');

            if (size === imgClassThumbnail)
                nl.src.value = img_src.replace(re, '/show/THUMB_LARGE/');
            else if (size === imgClassPostcard)
                nl.src.value = img_src.replace(re, '/show/THUMB_POSTCARD/');
            else if (size === imgClassFullpage)
                nl.src.value = img_src.replace(re, '/show/default/');
        },
        changeClass: function() {
            var f = document.forms[0],
                nl = f.elements,
                img_src = nl.src.value,
                img;

            var re = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', "g");
            img = img_src.match(re);
            if (img && img.length > 0) {
                this.checkChangeInClass();
                do_upload = false;
            }
        },
        getAttrib: function(e, at) {
            var ed = _popupEditor,
                dom = ed.dom,
                v, v2;

            //if (ed.settings.inline_styles) {
            switch (at) {
                case 'align':
                    if (v = dom.getStyle(e, 'float')) {
                        return v;
                    }

                    if (v = dom.getStyle(e, 'vertical-align')) {
                        return v;
                    }

                    break;

                case 'hspace':
                    v = dom.getStyle(e, 'margin-left');
                    v2 = dom.getStyle(e, 'margin-right');

                    if (v && v === v2) {
                        return parseInt(v.replace(/[^0-9]/g, ''));
                    }

                    break;

                case 'vspace':
                    v = dom.getStyle(e, 'margin-top');
                    v2 = dom.getStyle(e, 'margin-bottom');
                    if (v && v === v2) {
                        return parseInt(v.replace(/[^0-9]/g, ''));
                    }

                    break;

                case 'border':
                    v = 0;

                    getWin().tinymce.each(['top', 'right', 'bottom', 'left'], function(sv) {
                        sv = dom.getStyle(e, 'border-' + sv + '-width');

                        // False or not the same as prev
                        if (!sv || (sv !== v && v !== 0)) {
                            v = 0;
                            return false;
                        }

                        if (sv) {
                            v = sv;
                        }
                    });

                    if (v) {
                        return parseInt(v.replace(/[^0-9]/g, ''));
                    }

                    break;
            }
            //}

            if (v = dom.getAttrib(e, at)) {
                return v;
            }

            return '';
        },

        setSwapImage: function(st) {
            var f = document.forms[0];

            f.onmousemovecheck.checked = st;
            setBrowserDisabled('overbrowser', !st);
            setBrowserDisabled('outbrowser', !st);

            if (f.over_list) {
                f.over_list.disabled = !st;
            }

            if (f.out_list) {
                f.out_list.disabled = !st;
            }

            f.onmouseoversrc.disabled = !st;
            f.onmouseoutsrc.disabled = !st;
        },

        fillClassList: function(id) {
            var dom = _popupEditor.dom,
                lst = dom.get(id),
                v, cl;

            if (v = _popupEditor.getParam('theme_advanced_styles')) {
                cl = [];

                getWin().tinymce.each(v.split(';'), function(v) {
                    var p = v.split('=');

                    cl.push({
                        'title': p[0],
                        'class': p[1]
                    });
                });
            } else
                cl = _popupEditor.dom.getClasses();

            if (cl.length > 0) {
                lst.options[lst.options.length] = new Option(_popupEditor.getLang('not_set'), '');

                getWin().tinymce.each(cl, function(o) {
                    lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
                });
            } else
                dom.remove(dom.getParent(id, 'tr'));
        },

        fillFileList: function(id, l) {
            var dom = _popupEditor.dom,
                lst = dom.get(id),
                v, cl;

            l = window[l];

            if (l && l.length > 0) {
                lst.options[lst.options.length] = new Option('', '');

                getWin().tinymce.each(l, function(o) {
                    lst.options[lst.options.length] = new Option(o[0], o[1]);
                });
            } else {
                dom.remove(dom.getParent(id, 'tr'));
            }
        },

        resetImageData: function() {
            var f = document.forms[0];
            f.elements.width.value = '';
        },

        updateImageData: function(img, st) {
            var f = document.forms[0];

            if (!st) {
                f.elements.width.value = img.width;
            }

            this.preloadImg = img;
        },

        changeAppearance: function() {
            var ed = _popupEditor,
                f = document.forms[0],
                img = document.getElementById('alignSampleImg');

            if (img) {
                if (ed.getParam('inline_styles')) {
                    //ed.dom.setAttrib(img, 'style', f.style.value);
                    ed.dom.setAttrib(img, 'style', 'float: ' + getSelectValue(f, 'align') + ';');
                } else {
                    img.align = f.align.value;
                    img.border = f.border.value;
                    img.hspace = f.hspace.value;
                    img.vspace = f.vspace.value;
                }
            }
        },

        changeType: function() {
            var ed = _popupEditor,
                f = document.forms[0];
            //alert(getSelectedValue(f, 'type_list'));
            var selected = getSelectValue(f, 'type_list');
            if (selected === 'inline') {
                this.toggleInlineForm(true);
            } else {
                this.toggleInlineForm(false);
            }

            //alert("joe: " + selected);
        },

        changeHeight: function() {},

        changeWidth: function() {
            var f = document.forms[0],
                tp, t = this;
        },

        updateStyle: function(ty) {
            var dom = _popupEditor.dom,
                st, v, f = document.forms[0],
                img = dom.create('img', {
                    style: dom.get('style').value
                });

            if (_popupEditor.settings.inline_styles) {
                // Handle align
                if (ty == 'align') {
                    dom.setStyle(img, 'float', '');
                    dom.setStyle(img, 'vertical-align', '');

                    v = getSelectValue(f, 'align');
                    if (v) {
                        if (v == 'left' || v == 'right')
                            dom.setStyle(img, 'float', v);
                        else
                            img.style.verticalAlign = v;
                    }
                }

                // Handle border
                if (ty == 'border') {
                    dom.setStyle(img, 'border', '');

                    v = f.border.value;
                    if (v || v == '0') {
                        if (v == '0')
                            img.style.border = '0';
                        else
                            img.style.border = v + 'px solid black';
                    }
                }

                // Handle hspace
                if (ty == 'hspace') {
                    dom.setStyle(img, 'marginLeft', '');
                    dom.setStyle(img, 'marginRight', '');

                    v = f.hspace.value;
                    if (v) {
                        img.style.marginLeft = v + 'px';
                        img.style.marginRight = v + 'px';
                    }
                }

                // Handle vspace
                if (ty == 'vspace') {
                    dom.setStyle(img, 'marginTop', '');
                    dom.setStyle(img, 'marginBottom', '');

                    v = f.vspace.value;
                    if (v) {
                        img.style.marginTop = v + 'px';
                        img.style.marginBottom = v + 'px';
                    }
                }

                // Merge
                dom.get('style').value = dom.serializeStyle(dom.parseStyle(img.style.cssText));
            }
        },

        changeMouseMove: function() {},

        showPreviewImage: function(u, st) {
            var $iframe = $( $('iframe[src*="ck12-tinymce4-plugins/ck12image/image.htm"]')[0].contentWindow.document ),
                $prev = $iframe.find('#prev');

            if (!u) {
                $prev.html('');
                return;
            }
            do_upload = true;

            if (!st && _popupEditor.getParam("advimage_update_dimensions_onchange", true)) {
                this.resetImageData();
            }

            u = _popupEditor.documentBaseURI.toAbsolute(u);

            if (!st) {
                $prev.html('<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
            } else {
                $prev.html('<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this, 1);" />');
            }
        },
        tabHandler: function (node) {
            var nodeTab      = node,
                siblingId    = node.id !== 'general_tab' ? 'general_tab' : 'appearance_tab',
                siblingTab   = document.getElementById(siblingId),
                nodePanel    = document.getElementById(node.dataset.controls),
                siblingPanel = document.getElementById(siblingTab.dataset.controls);


            nodeTab.classList.add('mce-active');
            siblingPanel.classList.add('hidden');

            siblingTab.classList.remove('mce-active');
            nodePanel.classList.remove('hidden');
        },
        getWin: getWin 
    };
})();

ImageDialog.init(ImageDialog.getWin().tinymce.activeEditor);
