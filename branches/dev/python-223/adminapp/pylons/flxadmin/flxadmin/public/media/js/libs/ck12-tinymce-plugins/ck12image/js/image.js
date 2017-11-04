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
var ImageDialog = {
    getWin : function() {
            return window.dialogArguments || opener || parent || top;
    },

    preInit : function() {
        var url;

        tinyMCEPopup.requireLangPack();

        if (url = tinyMCEPopup.getParam("external_image_list_url"))
            document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
    },

    init : function(ed) {
        var f = document.forms[0], nl = f.elements, ed = tinyMCEPopup.editor, dom = ed.dom, n = ed.selection.getNode();
        var parent;
        tinyMCEPopup.resizeToInnerSize();

        var imgClassThumbnail = tinyMCEPopup.getParam("image_class_thumbnail");
        var imgClassPostcard = tinyMCEPopup.getParam("image_class_postcard");
        var imgClassFullpage = tinyMCEPopup.getParam("image_class_fullpage");
        var imgClassFloat = tinyMCEPopup.getParam("image_class_float");
        var imgClassNofloat = tinyMCEPopup.getParam("image_class_nofloat");

        
        var img_type = "inline";
        var img_class = "";
                var captionText = "";
        if (n.nodeName == 'P') {
            parent = ed.dom.getParent(n,'DIV');
        }
               
        if (parent && parent.nodeName == 'DIV') {
                if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') != -1){
                    //we want the <img /> element
                tinymce.each(parent.children, function(c) {
                    if (c.firstChild && c.firstChild.nodeName == 'IMG') {
                        n=c.firstChild;
                    }
                });        
            }
        }

        if (n && n.nodeName == 'IMG') {
            nl.src.value = dom.getAttrib(n, 'src');
            nl.width.value = dom.getAttrib(n, 'width').replace('px','');
            nl.alt.value = dom.getAttrib(n, 'alt');
            nl.title.value = dom.getAttrib(n, 'title');
            //nl.longdesc.value = dom.getAttrib(n, 'longdesc');
                        parentNode = n.parentNode;
                        if(parentNode && parentNode.nodeName == 'P' && parentNode.nextSibling && parentNode.nextSibling.nodeName == 'P') {
                            captionText = parentNode.nextSibling.innerHTML;
                        }
            nl.longdesc.value = captionText;
                selectByValue(f, 'type_list', img_type);
                if (img_class == "") {
                    img_class = imgClassPostcard;
                }
                selectByValue(f, 'class_list', img_class);
            this.changeType();
            this.showPreviewImage(nl.src.value, 1);

            parent = ed.dom.getParent(n,'DIV');
            if (parent && parent.nodeName == 'DIV') {
                if (ed.dom.getAttrib(parent, 'class').indexOf('x-ck12-img') != -1){
                    var img_classes = this.getAttrib(parent, 'class');
                    img_class = imgClassPostcard;
                    img_align = imgClassNofloat;

                    var img_type_class = img_classes.match('x-ck12-img-[a-z]*');
                    if (img_type_class && img_type_class.length > 0) {
                        img_class= img_type_class[0];
                                        }
                                         
                    var img_align_class = img_classes.match('x-ck12-[no]*float');
                    if (img_align_class && img_align_class.length > 0) {
                        img_align= img_align_class[0];
                                        }

                    img_type ="figure";
                    selectByValue(f, 'class_list', img_class, true, true);
                    selectByValue(f, 'align_list', img_align, true, true);
                    selectByValue(f, 'type_list', img_type);
                    this.changeType();
                    //selectByValue(f, 'align', this.getAttrib(parent, 'align'));
                    this.showPreviewImage(nl.src.value, 1);
                }
            }
            do_upload = false;
        }
    },

    insert : function(file, title) {
        var ed = tinyMCEPopup.editor, t = this, f = document.forms[0];
        var uploadfile = document.getElementById('uploadfile');
        var frm = document.getElementById('imageform');
        if ( (uploadfile.value != '' || f.src.value != '') && do_upload ){
            frm.action = t.getWin().CK12.resource_upload_endpoint;
            var options = {
                type: 'POST',
                url : frm.action,
                dataType: 'json',
                success: function(res) {
                    if (res.status != 'error'){
                        ImageDialog.uploadComplete(res);
                    }
                    else if (res.data && res.data.resource &&
                             res.data.reason=="RESOURCE_ALREADY_EXISTS"){
                        ImageDialog.uploadComplete(res.data.resource);
                    }else{
                        var _msg = res.message || '';
                        ImageDialog.uploadFailed('Image insert failed. '+_msg+'. Please try again or refresh and try again');
                    }
                },
                error: function() {
                    ImageDialog.uploadFailed('Image insert failed. Please try again or refresh and try again');
                }
            };
            jQuery(frm).ajaxSubmit(options);
			return;
		}
		if (f.src.value === '') {
			if (ed.selection.getNode().nodeName == 'IMG') {
				ed.dom.remove(ed.dom.getParent(ed.selection.getNode(), 'div'));
				ed.execCommand('mceRepaint');
			}
			tinyMCEPopup.close();
			return;
		}
		t.insertAndClose();
	},

	disableForm: function( val ){
		document.getElementById('uploadfile').disabled = val;
		document.getElementById('src').disabled = val;
		document.getElementById('alt').disabled = val;
		//document.getElementById('title').disabled = val;
		document.getElementById('insert').disabled = val;
		document.getElementById('cancel').disabled = val;
	},
	
	toggleInlineForm : function ( val ) {
		document.getElementById('class_list').disabled = val;
		document.getElementById('align_list').disabled = val;
		document.getElementById('longdesc').disabled = val;
		document.getElementById('width').disabled = !val;
		/*if ( val ) {
			//If inline is selected, set the default align.
			document.getElementById('align').selectedIndex = 0;
		}
		document.getElementById('align').disabled = val;*/
	},
	
	uploadFailed : function( msg ){
	  tinyMCE.activeEditor.windowManager.alert( msg );
	
		this.disableForm( false );
	},
	
	uploadComplete : function( res ) {
		var src = res.uri;
		var imgsrc = document.getElementById('src');
		var uploadsrc = document.getElementById('uploadfile');
		imgsrc.value = src;
		uploadsrc.value = '';
		do_upload = false;
		this.disableForm( false );
		this.insertAndClose();
	},

	insertAndClose : function() {
		var ed = tinyMCEPopup.editor, f = document.forms[0], nl = f.elements, v, args = {}, el;
		tinyMCEPopup.restoreSelection();

		var imgClassInline = tinyMCEPopup.getParam("image_class_inline");
		var imgClassThumbnail = tinyMCEPopup.getParam("image_class_thumbnail");
		var imgClassPostcard = tinyMCEPopup.getParam("image_class_postcard");
		var imgClassFullpage = tinyMCEPopup.getParam("image_class_fullpage");
		var imgClassFloat = tinyMCEPopup.getParam("image_class_float");
		var imgClassNofloat = tinyMCEPopup.getParam("image_class_nofloat");

		// Fixes crash in Safari
		if (tinymce.isWebKit)
			ed.getWin().focus();

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
				vspace : '',
				hspace : '',
				border : '',
				align : ''
			};
		//}


                this.checkChangeInClass();  

		var img_type = getSelectValue(f, 'type_list');

		if(tinymce.isWebKit)
        		ed.execCommand('inserthtml', false, '');
		else
	        	ed.execCommand('mceInsertContent', false, '');				

		imgParentNode = ed.selection.getNode().parentNode;
		if (img_type == 'inline') {
                        var width = '';   
			if(nl.width.value && this.isNumber(nl.width.value))
                        	width = nl.width.value;
			tinymce.extend(args, {
				src : nl.src.value,
				width : width,
				title : nl.title.value,
				alt : nl.alt.value
			});
			ed.execCommand('mceInsertContent', false, '<span id="ck12image"><!-- @@author="CK-12 Foundation" --><!-- @@license="CCSA" --><img id="__mce_tmp" /></span>', {skip_undo : 1});
			// captioned image to inline
			if(imgParentNode.nodeName == "DIV"){
				commentFirst = imgParentNode.firstChild;
				commentSecond = imgParentNode.firstChild.nextSibling;
				enclosedP = imgParentNode.firstChild.nextSibling.nextSibling;
				if(commentFirst.nodeName == '#comment')
					ed.dom.remove(commentFirst);
				if(commentSecond.nodeName == '#comment')
					ed.dom.remove(commentSecond);
				ed.dom.remove(enclosedP, true);
				ed.dom.remove(imgParentNode, true);
			}

			parentElement = ed.dom.get('ck12image').parentNode;
			if(parentElement.nodeName == 'SPAN'){
				commentFirst = parentElement.firstChild;
				commentSecond = parentElement.firstChild.nextSibling;
				if(commentFirst.nodeName == '#comment')
					ed.dom.remove(commentFirst);
				if(commentSecond.nodeName == '#comment')
					ed.dom.remove(commentSecond);
				ed.dom.remove(parentElement, true);
			}

                        //Fix for bug 6522
                        var img = ed.dom.get('__mce_tmp');
                        img.onload = function() {
                                 ed.execCommand('mceAutoResize');
                        }
 
            ed.dom.setAttribs('__mce_tmp', args);
            ed.dom.setAttrib('__mce_tmp','style','float: '+ getSelectValue(f, 'align') +';');
            ed.dom.setAttrib('__mce_tmp', 'id', '');
            ed.dom.addClass('ck12image', imgClassInline);
            ed.dom.setAttrib('ck12image', 'id', '');
            ed.undoManager.add();
        
        } else {
                        var id = nl.src.value.substring(nl.src.value.lastIndexOf('/')+1);
                        if(id.lastIndexOf('.') >= 0) {
                                id = id.substr(0, id.lastIndexOf('.'));
                        }
                        id = decodeURIComponent((id+'').replace(/\+/g, '%20'));
                        id = 'x-ck12-' + Base64.encode(id);
            tinymce.extend(args, {
                src : nl.src.value,
                                id : id,
                title : nl.title.value,
                alt : nl.alt.value,
                longdesc : encodeURIComponent(nl.longdesc.value)
            });
            if(imgParentNode && imgParentNode.nodeName && imgParentNode.nodeName == "DIV" && (ed.dom.hasClass(imgParentNode, imgClassThumbnail) || ed.dom.hasClass(imgParentNode, imgClassPostcard) || ed.dom.hasClass(imgParentNode, imgClassFullpage))){
                ed.dom.setHTML(imgParentNode, '<!-- @@author="CK-12 Foundation" --><!-- @@license="CCSA" --><p><img id="__mce_tmp" /></p><p id="__mce_tmp_caption"></p>');
                ed.dom.setAttrib(imgParentNode, 'id', 'ck12image');
                //Remove all class names
                ed.dom.removeClass('ck12image', imgClassThumbnail);
                                ed.dom.removeClass('ck12image', imgClassPostcard);
                                ed.dom.removeClass('ck12image', imgClassFullpage);
                ed.dom.removeClass('ck12image', imgClassNofloat);
                                ed.dom.removeClass('ck12image', imgClassFloat);
            } else {
                ed.execCommand('mceInsertContent', false, '<div id="ck12image"> <!-- @@author="CK-12 Foundation" --><!-- @@license="CCSA" --><p><img id="__mce_tmp" /></p><p id="__mce_tmp_caption"></p></div>', {skip_undo : 1});
            }

                        //Fix for bug 6522
                        var img = ed.dom.get('__mce_tmp');
                        img.onload = function() {
                                 ed.execCommand('mceAutoResize');
            }
 
            ed.dom.setAttribs('__mce_tmp', args);
            ed.dom.setHTML('__mce_tmp_caption', nl.longdesc.value);                                                       
            ed.dom.setAttrib('__mce_tmp', 'id', '');
            ed.dom.setAttrib('__mce_tmp_caption', 'id', '');
            ed.dom.addClass('ck12image',getSelectValue(f, 'class_list'));
            ed.dom.addClass('ck12image',getSelectValue(f, 'align_list'));
            ed.undoManager.add();

            //Fix for bug 7337
                        var ne;
                        var img_div = ed.dom.get('ck12image');

                        //Find next element to div 
                        if(img_div) {
                            ne = img_div.nextSibling;

                                //If no valid next element, Create new one
                            if(!ne || ne.nodeName == "BR" || ne.nodeName == "#comment" ) {
                                var _temp = ed.getDoc().createElement("P");
                    _temp.innerHTML = '&nbsp;';
                    jQuery(_temp).insertAfter(img_div); 
                } 
                ne = img_div.nextSibling;
            }  

            //Move cursor out of enclosed div 
            if(ne) {
                ed.selection.select(ne);
                ed.selection.collapse(1);
            } 

            ed.dom.setAttrib('ck12image', 'id', '');
        }
        //alert('Closing now');
        tinyMCEPopup.close();
    },
        isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
        notifyImageChange : function(img_src) {
               do_upload = true; 
        },
        checkChangeInClass : function() {

        var imgClassThumbnail = tinyMCEPopup.getParam("image_class_thumbnail");
        var imgClassPostcard = tinyMCEPopup.getParam("image_class_postcard");
        var imgClassFullpage = tinyMCEPopup.getParam("image_class_fullpage");

        var f = document.forms[0],nl = f.elements;
        var img_class = getSelectValue(f, 'class_list');
                img_src = nl.src.value;
                var size = getSelectValue(f, 'class_list');
                var re = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', "g");

                if (size == imgClassThumbnail)
                        nl.src.value = img_src.replace(re, '/show/THUMB_LARGE/');
                else if (size == imgClassPostcard)
                        nl.src.value = img_src.replace(re, '/show/THUMB_POSTCARD/');
                else if (size == imgClassFullpage)
                        nl.src.value = img_src.replace(re, '/show/default/');
        },
        changeClass : function() {
        var f = document.forms[0],nl = f.elements;
        img_src = nl.src.value;
        var re = new RegExp('/show/(THUMB_LARGE|default|THUMB_POSTCARD)?/?', "g");
        img = img_src.match(re);
            if(img && img.length > 0) { 
                this.checkChangeInClass();
                do_upload = false;
            } 
        },
    getAttrib : function(e, at) {
        var ed = tinyMCEPopup.editor, dom = ed.dom, v, v2;

        //if (ed.settings.inline_styles) {
            switch (at) {
                case 'align':
                    if (v = dom.getStyle(e, 'float'))
                        return v;

                    if (v = dom.getStyle(e, 'vertical-align'))
                        return v;

                    break;

                case 'hspace':
                    v = dom.getStyle(e, 'margin-left')
                    v2 = dom.getStyle(e, 'margin-right');

                    if (v && v == v2)
                        return parseInt(v.replace(/[^0-9]/g, ''));

                    break;

                case 'vspace':
                    v = dom.getStyle(e, 'margin-top')
                    v2 = dom.getStyle(e, 'margin-bottom');
                    if (v && v == v2)
                        return parseInt(v.replace(/[^0-9]/g, ''));

                    break;

                case 'border':
                    v = 0;

                    tinymce.each(['top', 'right', 'bottom', 'left'], function(sv) {
                        sv = dom.getStyle(e, 'border-' + sv + '-width');

                        // False or not the same as prev
                        if (!sv || (sv != v && v !== 0)) {
                            v = 0;
                            return false;
                        }

                        if (sv)
                            v = sv;
                    });

                    if (v)
                        return parseInt(v.replace(/[^0-9]/g, ''));

                    break;
            }
        //}

        if (v = dom.getAttrib(e, at))
            return v;

        return '';
    },

    setSwapImage : function(st) {
        var f = document.forms[0];

        f.onmousemovecheck.checked = st;
        setBrowserDisabled('overbrowser', !st);
        setBrowserDisabled('outbrowser', !st);

        if (f.over_list)
            f.over_list.disabled = !st;

        if (f.out_list)
            f.out_list.disabled = !st;

        f.onmouseoversrc.disabled = !st;
        f.onmouseoutsrc.disabled  = !st;
    },

    fillClassList : function(id) {
        var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

        if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
            cl = [];

            tinymce.each(v.split(';'), function(v) {
                var p = v.split('=');

                cl.push({'title' : p[0], 'class' : p[1]});
            });
        } else
            cl = tinyMCEPopup.editor.dom.getClasses();

        if (cl.length > 0) {
            lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

            tinymce.each(cl, function(o) {
                lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
            });
        } else
            dom.remove(dom.getParent(id, 'tr'));
    },

    fillFileList : function(id, l) {
        var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

        l = window[l];

        if (l && l.length > 0) {
            lst.options[lst.options.length] = new Option('', '');

            tinymce.each(l, function(o) {
                lst.options[lst.options.length] = new Option(o[0], o[1]);
            });
        } else
            dom.remove(dom.getParent(id, 'tr'));
    },

    resetImageData : function() {
        var f = document.forms[0];
        f.elements.width.value = '';
    },

    updateImageData : function(img, st) {
        var f = document.forms[0];

        if (!st) {
            f.elements.width.value = img.width;
        }

        this.preloadImg = img;
    },

    changeAppearance : function() {
        var ed = tinyMCEPopup.editor, f = document.forms[0], img = document.getElementById('alignSampleImg');

        if (img) {
            if (ed.getParam('inline_styles')) {
                //ed.dom.setAttrib(img, 'style', f.style.value);
                ed.dom.setAttrib(img, 'style', 'float: '+ getSelectValue(f, 'align') +';');
            } else {
                img.align = f.align.value;
                img.border = f.border.value;
                img.hspace = f.hspace.value;
                img.vspace = f.vspace.value;
            }
        }
    },
    
    changeType : function() {
        var ed = tinyMCEPopup.editor, f = document.forms[0];
        //alert(getSelectedValue(f, 'type_list'));
        var selected = getSelectValue(f, 'type_list');
        if (selected == 'inline') {
            this.toggleInlineForm(true);
        } else {
            this.toggleInlineForm(false);
        }
        
        //alert("joe: " + selected);
    },

    changeHeight : function() {
    },

    changeWidth : function() {
        var f = document.forms[0], tp, t = this;
    },

    updateStyle : function(ty) {
        var dom = tinyMCEPopup.dom, st, v, f = document.forms[0], img = dom.create('img', {style : dom.get('style').value});

        if (tinyMCEPopup.editor.settings.inline_styles) {
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

    changeMouseMove : function() {
    },

    showPreviewImage : function(u, st) {
        if (!u) {
            tinyMCEPopup.dom.setHTML('prev', '');
            return;
        }
                do_upload=true;

        if (!st && tinyMCEPopup.getParam("advimage_update_dimensions_onchange", true))
            this.resetImageData();

        u = tinyMCEPopup.editor.documentBaseURI.toAbsolute(u);

        if (!st)
            tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
        else
            tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + u + '" border="0" onload="ImageDialog.updateImageData(this, 1);" />');
    }
};

ImageDialog.preInit();
tinyMCEPopup.onInit.add(ImageDialog.init, ImageDialog);
