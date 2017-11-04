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
var do_upload = false;
var image_meta = {
    author: '',
    //license: 'CC BY-NC', //'CC BY-NC-SA'
    url: ''
};
var ImageDialog = {
    getWin: function () {
        'use strict';
        return window.dialogArguments || opener || parent || top;
    },

    preInit: function () {
        'use strict';
        var url = tinyMCEPopup.getParam('external_image_list_url');

        tinyMCEPopup.requireLangPack();

        if (url) {
            document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
        }
    },

    init: function (ed) {
        'use strict';
        var parent, nl, istable, imageID, img_classes, img_type_class, img_align_class,
            patt, postCardParent, meta_key, parentNode, img_align, commentNode, values, metaElement, elmName,
            img_type = 'inline',
            img_class = '',
            captionText = '',
            f = document.forms[0],
            dom = ed.dom,
            n = ed.selection.getNode(),
            ck12 = this.getWin().$.flxweb.settings,
            imgClassThumbnail = tinyMCEPopup.getParam('image_class_thumbnail'),
            imgClassPostcard = tinyMCEPopup.getParam('image_class_postcard'),
            imgClassFullpage = tinyMCEPopup.getParam('image_class_fullpage'),
            imgClassNofloat = tinyMCEPopup.getParam('image_class_nofloat');

        nl = f.elements;
        tinyMCEPopup.resizeToInnerSize();

        this.resource_perma_endpoint = ck12.render_resource_perma_endpoint;
        if (!this.resource_perma_endpoint) {
            this.resource_perma_endpoint = '/flx/show';
        }



        if (n.nodeName === 'P') {
            parent = ed.dom.getParent(n, 'DIV');
        }
        //Bug 10465 disable image type selection in insert/edit image dialog if image is being inserted in the table,set default to inline.
        istable = ed.dom.getParent(n, 'TABLE');
        if (istable && istable.nodeName === 'TABLE') {
            $('#type_list').val('inline');
            $('#type_list').attr('disabled', 'true');
            this.toggleInlineForm(true);
        }


        if (parent && parent.nodeName === 'DIV') {
            if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') !== -1) {
                //we want the <img /> element
                tinymce.each(parent.children, function (c) {
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
            imageID = dom.getAttrib(n, 'id');
            if (imageID && imageID !== '' && imageID.indexOf('x-ck12-') !== -1) {
                imageID = imageID.replace('x-ck12-', '');
                nl.image_id.value = Base64.decode(imageID);
            }
            //nl.longdesc.value = dom.getAttrib(n, 'longdesc');
            parentNode = n.parentNode;
            if (parentNode && parentNode.nodeName === 'P' && parentNode.nextSibling && parentNode.nextSibling.nodeName === 'P') {
                captionText = parentNode.nextSibling.innerHTML;
            }
            captionText = tinymce.trim(captionText);
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
                if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') !== -1) {
                    img_classes = this.getAttrib(parent, 'class');
                    img_class = imgClassPostcard;
                    img_align = imgClassNofloat;

                    img_type_class = img_classes.match('x-ck12-img-[a-z]*');
                    if (img_type_class && img_type_class.length > 0) {
                        img_class = img_type_class[0];
                    }

                    img_align_class = img_classes.match('x-ck12-[no]*float');
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
                patt = new RegExp(/@@(.*)="(.*)"/);
                patt.compile(patt);
                //bug: 27473
                //handle case for bug 27473: duplicate postcard divs
                postCardParent = parent.parentNode;
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
                    if (values && image_meta.hasOwnProperty(values[1])) {
                        image_meta[values[1]] = values[2];
                    }
                    commentNode = commentNode.nextSibling;
                }
                for (meta_key in image_meta) {
                    if (image_meta.hasOwnProperty(meta_key)) {
                        if (image_meta[meta_key] !== 'undefined' && image_meta[meta_key] !== '') {
                            elmName = meta_key;
                            metaElement = nl[elmName];
                            if (metaElement && metaElement !== 'undefined' && metaElement.nodeName === 'INPUT') {
                                metaElement.value = image_meta[meta_key];
                            }
                        }
                    }
                }
            }
            do_upload = false;
        }
    },

    insert: function () {
        'use strict';
        var options,
            ed = tinyMCEPopup.editor,
            t = this,
            f = document.forms[0],
            ck12 = this.getWin().$.flxweb.settings,
            uploadfile = document.getElementById('uploadfile'),
            frm = document.getElementById('imageform');

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
            options = {
                type: 'POST',
                url: frm.action,
                dataType: 'html',
                success: function (res) {
                    var errorData,
                        data = $.parseJSON(res);
                    if (data.status !== 'error') {
                        ImageDialog.uploadComplete(data);
                    } else {
                        errorData = data.data;
                        if (errorData && errorData.reason === 'RESOURCE_ALREADY_EXISTS' && errorData.resource) {
                            ImageDialog.uploadComplete(errorData.resource);
                        } else {
                            ImageDialog.uploadFailed('Image insert failed. Please try again or do refresh and try again');
                        }
                    }
                },
                error: function () {
                    ImageDialog.uploadFailed('Image insert failed. Please try again or do refresh and try again');
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

            tinyMCEPopup.close();
            return;
        }
        t.insertAndClose();
    },

    validateFileType: function (filename) {
        'use strict';
        var filetype_re = new RegExp('(.jpg|jpeg|png|bmp|gif)$', 'i');
        return filetype_re.test(filename);
    },

    disableForm: function (val) {
        'use strict';
        document.getElementById('uploadfile').disabled = val;
        document.getElementById('src').disabled = val;
        document.getElementById('alt').disabled = val;
        //document.getElementById('title').disabled = val;
        document.getElementById('insert').disabled = val;
        document.getElementById('cancel').disabled = val;
    },

    toggleInlineForm: function (val) {
        'use strict';
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

    uploadFailed: function (msg) {
        'use strict';
        tinyMCE.activeEditor.windowManager.alert(msg);

        this.disableForm(false);
    },

    uploadComplete: function (res) {
        'use strict';
        var src = res.uri,
            imgsrc = document.getElementById('src'),
            uploadsrc = document.getElementById('uploadfile');
        if (src.indexOf(this.resource_perma_endpoint) === -1) {
            src = this.resource_perma_endpoint + res.permaUri;
        }
        imgsrc.value = src;
        uploadsrc.value = '';
        do_upload = false;
        this.disableForm(false);
        this.insertAndClose();
    },

    insertAndClose: function () {
        'use strict';
        var nl, meta_key, img_type, imgParentNode, width, postCardParent,
            commentFirst, commentSecond, thirdChild, commentThird, enclosedP, parentElement, img, id,
            img_div, ne, _temp,
            str_meta_comment = '',
            ed = tinyMCEPopup.editor,
            f = document.forms[0],
            args = {},
            imgClassInline = tinyMCEPopup.getParam('image_class_inline'),
            imgClassThumbnail = tinyMCEPopup.getParam('image_class_thumbnail'),
            imgClassPostcard = tinyMCEPopup.getParam('image_class_postcard'),
            imgClassFullpage = tinyMCEPopup.getParam('image_class_fullpage'),
            imgClassFloat = tinyMCEPopup.getParam('image_class_float'),
            imgClassNofloat = tinyMCEPopup.getParam('image_class_nofloat');

        nl = f.elements;
        tinyMCEPopup.restoreSelection();


        // Fixes crash in Safari
        if (tinymce.isWebKit) {
            ed.getWin().focus();
        }

        //if (!ed.settings.inline_styles) {
        //	args = {
        //		vspace : nl.vspace.value,
        //		hspace : nl.hspace.value,
        //		border : nl.border.value,
        //		align : getSelectValue(f, 'align')
        //	};
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
            image_meta.url = nl.url.value;
        }
        if (nl.author) {
            image_meta.author = nl.author.value;
        }
        for (meta_key in image_meta) {
            if (image_meta.hasOwnProperty(meta_key)) {
                if (image_meta[meta_key] !== 'undefined' && image_meta[meta_key] !== '') {
                    str_meta_comment += '<!-- @@' + meta_key + '="' + image_meta[meta_key] + '" -->';
                }
            }
        }
        img_type = getSelectValue(f, 'type_list');

        if (tinymce.isWebKit) {
            ed.execCommand('inserthtml', false, '');
        } else {
            ed.execCommand('mceInsertContent', false, '');
        }
        //[Bug #43572]: Commenting out the call to moveToBookmark. It was initially added for IE [Bug #43259]
        //tinyMCEPopup.editor.selection.moveToBookmark(tinyMCEPopup.editor.storeSelection);
        imgParentNode = ed.selection.getNode().parentNode;
        if (img_type === 'inline') {
            width = '';
            if (nl.width.value && this.isNumber(nl.width.value)) {
                width = nl.width.value;
            }
            tinymce.extend(args, {
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
                postCardParent = imgParentNode.parentNode;
                if (postCardParent && postCardParent.nodeName === 'DIV' &&
                    (ed.dom.hasClass(postCardParent, imgClassPostcard) ||
                        ed.dom.hasClass(postCardParent, imgClassThumbnail) ||
                        ed.dom.hasClass(postCardParent, imgClassFullpage))) {
                    ed.dom.remove(imgParentNode, true);
                    imgParentNode = postCardParent;
                }
                //TODO: Why not remove all the comments ? rather than
                //individual comments ? 
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

            parentElement = ed.dom.get('ck12image').parentNode;
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
            img = ed.dom.get('__mce_tmp');
            img.onload = function () {
                ed.execCommand('mceAutoResize');
            };

            ed.dom.setAttribs('__mce_tmp', args);
            if (getSelectValue(f, 'align')) {
                ed.dom.setAttrib('__mce_tmp', 'style', 'float: ' + getSelectValue(f, 'align') + ';');
            }
            ed.dom.setAttrib('__mce_tmp', 'id', '');
            ed.dom.addClass('ck12image', imgClassInline);
            ed.dom.setAttrib('ck12image', 'id', '');
            ed.undoManager.add();

        } else {
            id = nl.image_id.value;
            if (!id || id === '') {
                id = nl.src.value.substring(nl.src.value.lastIndexOf('/') + 1);
                if (id.lastIndexOf('.') >= 0) {
                    id = id.substr(0, id.lastIndexOf('.'));
                }
                id = decodeURIComponent((id.toString()).replace(/\+/g, '%20'));
                id = 'x-ck12-' + Base64.encode(id);
            } else {
                id = Base64.encode(id);
                id = 'x-ck12-' + id;
            }
            tinymce.extend(args, {
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
            img = ed.dom.get('__mce_tmp');
            img.onload = function () {
                ed.execCommand('mceAutoResize');
            };

            ed.dom.setAttribs('__mce_tmp', args);
            ed.dom.setHTML('__mce_tmp_caption', nl.longdesc.value || '<br/>');
            ed.dom.setAttrib('__mce_tmp', 'id', '');
            ed.dom.setAttrib('__mce_tmp_caption', 'id', '');
            ed.dom.addClass('ck12image', getSelectValue(f, 'class_list'));
            ed.dom.addClass('ck12image', getSelectValue(f, 'align_list'));
            ed.undoManager.add();

            //Fix for bug 7337
            img_div = ed.dom.get('ck12image');

            //Find next element to div 
            if (img_div) {
                ne = img_div.nextSibling;

                //If no valid next element, Create new one
                if (!ne || ne.nodeName === 'BR' || ne.nodeName === '#comment') {
                    _temp = ed.getDoc().createElement('P');
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
        }
        //alert('Closing now');
        tinyMCEPopup.close();
    },
    isNumber: function (n) {
        'use strict';
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    notifyImageChange: function (input) {
        'use strict';
        do_upload = true;
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + e.target.result + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
            };

            reader.readAsDataURL(input.files[0]);
        }
    },
    checkChangeInClass: function () {
        'use strict';

        var nl, size, img_src,
            f = document.forms[0],
            imgClassThumbnail = tinyMCEPopup.getParam('image_class_thumbnail'),
            imgClassPostcard = tinyMCEPopup.getParam('image_class_postcard'),
            imgClassFullpage = tinyMCEPopup.getParam('image_class_fullpage'),
            re = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', 'g');

        nl = f.elements;
        img_src = nl.src.value;
        size = getSelectValue(f, 'class_list');

        if (size === imgClassThumbnail) {
            nl.src.value = img_src.replace(re, '/show/THUMB_LARGE/');
        } else if (size === imgClassPostcard) {
            nl.src.value = img_src.replace(re, '/show/THUMB_POSTCARD/');
        } else if (size === imgClassFullpage) {
            nl.src.value = img_src.replace(re, '/show/default/');
        }
    },
    changeClass: function () {
        'use strict';
        var nl, img_src, img,
            f = document.forms[0],
            re = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', 'g');
        nl = f.elements;
        img_src = nl.src.value;
        img = img_src.match(re);
        if (img && img.length > 0) {
            this.checkChangeInClass();
            do_upload = false;
        }
    },
    getAttrib: function (e, at) {
        'use strict';
        var dom, v, v2, ed = tinyMCEPopup.editor;
        dom = ed.dom;

        //if (ed.settings.inline_styles) {
        switch (at) {
        case 'align':
            v = dom.getStyle(e, 'float');
            if (v) {
                return v;
            }

            v = dom.getStyle(e, 'vertical-align');
            if (v) {
                return v;
            }

            break;

        case 'hspace':
            v = dom.getStyle(e, 'margin-left');
            v2 = dom.getStyle(e, 'margin-right');

            if (v && v === v2) {
                return parseInt(v.replace(/[^0-9]/g, ''), 10);
            }

            break;

        case 'vspace':
            v = dom.getStyle(e, 'margin-top');
            v2 = dom.getStyle(e, 'margin-bottom');
            if (v && v === v2) {
                return parseInt(v.replace(/[^0-9]/g, ''), 10);
            }

            break;

        case 'border':
            v = 0;

            tinymce.each(['top', 'right', 'bottom', 'left'], function (sv) {
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
                return parseInt(v.replace(/[^0-9]/g, ''), 10);
            }

            break;
        }
        //}

        v = dom.getAttrib(e, at);
        if (v) {
            return v;
        }

        return '';
    },

    setSwapImage: function (st) {
        'use strict';
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

    fillClassList: function (id) {
        'use strict';
        var lst, cl,
            dom = tinyMCEPopup.dom,
            v = tinyMCEPopup.getParam('theme_advanced_styles');

        lst = dom.get(id);

        if (v) {
            cl = [];

            tinymce.each(v.split(';'), function (v) {
                var p = v.split('=');

                cl.push({
                    'title': p[0],
                    'class': p[1]
                });
            });
        } else {
            cl = tinyMCEPopup.editor.dom.getClasses();
        }

        if (cl.length > 0) {
            lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

            tinymce.each(cl, function (o) {
                lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
            });
        } else {
            dom.remove(dom.getParent(id, 'tr'));
        }
    },

    fillFileList: function (id, l) {
        'use strict';
        var lst, dom = tinyMCEPopup.dom;

        lst = dom.get(id);

        l = window[l];

        if (l && l.length > 0) {
            lst.options[lst.options.length] = new Option('', '');

            tinymce.each(l, function (o) {
                lst.options[lst.options.length] = new Option(o[0], o[1]);
            });
        } else {
            dom.remove(dom.getParent(id, 'tr'));
        }
    },

    resetImageData: function () {
        'use strict';
        document.forms[0].elements.width.value = '';
    },

    updateImageData: function (img, st) {
        'use strict';

        if (!st) {
            document.forms[0].elements.width.value = img.width;
        }

        this.preloadImg = img;
    },

    changeAppearance: function () {
        'use strict';
        var ed = tinyMCEPopup.editor,
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

    changeType: function () {
        'use strict';
        var selected, f = document.forms[0];
        selected = getSelectValue(f, 'type_list');
        if (selected === 'inline') {
            this.toggleInlineForm(true);
        } else {
            this.toggleInlineForm(false);
        }

        //alert('joe: ' + selected);
    },

    updateStyle: function (ty) {
        'use strict';
        var v, img,
            dom = tinyMCEPopup.dom,
            f = document.forms[0];

        img = dom.create('img', {
            style: dom.get('style').value
        });

        if (tinyMCEPopup.editor.settings.inline_styles) {
            // Handle align
            if (ty === 'align') {
                dom.setStyle(img, 'float', '');
                dom.setStyle(img, 'vertical-align', '');

                v = getSelectValue(f, 'align');
                if (v) {
                    if (v === 'left' || v === 'right') {
                        dom.setStyle(img, 'float', v);
                    } else {
                        img.style.verticalAlign = v;
                    }
                }
            }

            // Handle border
            if (ty === 'border') {
                dom.setStyle(img, 'border', '');

                v = f.border.value;
                if (v || v === '0') {
                    if (v === '0') {
                        img.style.border = '0';
                    } else {
                        img.style.border = v + 'px solid black';
                    }
                }
            }

            // Handle hspace
            if (ty === 'hspace') {
                dom.setStyle(img, 'marginLeft', '');
                dom.setStyle(img, 'marginRight', '');

                v = f.hspace.value;
                if (v) {
                    img.style.marginLeft = v + 'px';
                    img.style.marginRight = v + 'px';
                }
            }

            // Handle vspace
            if (ty === 'vspace') {
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

    showPreviewImage: function (u, st) {
        'use strict';
        if (!u) {
            tinyMCEPopup.dom.setHTML('prev', '');
            return;
        }
        do_upload = true;

        if (!st && tinyMCEPopup.getParam('advimage_update_dimensions_onchange', true)) {
            this.resetImageData();
        }

        u = tinyMCEPopup.editor.documentBaseURI.toAbsolute(u);

        if (!st) {
            tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
        } else {
            tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this, 1);" />');
        }
    }
};

ImageDialog.preInit();
tinyMCEPopup.onInit.add(ImageDialog.init, ImageDialog);
