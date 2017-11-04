/**
 * $Id: editor_plugin_src.js 520 2008-01-07 16:30:32Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

/* globals tinymce:false, _:false, $:false */

(function() {
    'use strict';
    var Event = tinymce.dom.Event,
        lastSelectedRng,
        shouldBlock,
        isImage,
        isInlineImage;

    function setSelection(editor) {
        var currentRng = editor.selection.getRng();
        if(lastSelectedRng && currentRng !== lastSelectedRng){
            editor.selection.setRng(lastSelectedRng);
            lastSelectedRng = null;
        } else if (currentRng === lastSelectedRng) {
            lastSelectedRng = null;
        }
    }

    tinymce.create('tinymce.plugins.CK12ImagePlugin', {
        init : function(ed, url) {

            if(ed.settings.ck12_plugins_url){
                url = ed.settings.ck12_plugins_url + 'ck12image';
            }
            // Register commands
            var t = this;

            ed.on('init', function() {
                if (ed.settings.content_css !== false) {
                    ed.dom.loadCSS(url + '/css/ck12image.css');
                }
                if (ed && (ed.plugins.contextmenu || ed.plugins.ck12contextmenu)) {
                    // Register context menu
                    ed.addMenuItem('ck12imageEditCM', {
                        text: 'Insert/Edit Image',
                        context: 'insert',
                        cmd: 'mceAdvImage',
                        onPostRender: function(){
                            this.visible(true);
                            t.contextMenu.changeText.call(this, ed);
                        },
                        icon: 'image',
                        ui: true
                    });

                    ed.addMenuItem('ck12imageDeleteCM', {
                        text: 'Delete Image',
                        context: 'insert',
                        cmd: 'mceDeleteImage',
                        onPostRender: function(){
                            t.contextMenu.postRender.call(this, ed);
                        },
                        image: url + '/img/icon_img_del.gif',
                        icon: 'delete',
                        ui: true
                    });
                }
            });

            ed.addCommand('mceAdvImage', function() {
                var e;
                setSelection(ed);
                e = ed.selection.getNode();

                // Internal image object like a flash placeholder. Check for math image
                var nodeclass = ed.dom.getAttrib(e, 'class');
                if (nodeclass){
                    if ((nodeclass.indexOf('mceItem') !== -1) ||
                        (nodeclass.indexOf('x-ck12-block-math') !== -1) ||
                        (nodeclass.indexOf('x-ck12-math') !== -1) ||
                        (nodeclass.indexOf('ck12-media-placeholder')) !== -1){
                        return;
                    }
                }

                ed.windowManager.open({
                    file : url + '/image.htm',
                    classes: 'window-tabs',
                    title: 'Insert/Edit Image',
                    width : 480 + parseInt(ed.getLang('advimage.delta_width', 0)),
                    // Padding and height adds about 70px
                    height : window.innerHeight < 645 ? 360 : 575,
                    inline : 1
                }, {
                    plugin_url : url
                });

                ed.fire('focus:window');
            });

            ed.addCommand('mceDeleteImage', function() {
                var el;
                setSelection(ed);
                el = ed.selection.getNode();

                var div = ed.dom.getParent(el, 'div');
                if (div && (ed.dom.getAttrib(div, 'class').indexOf('x-ck12-img') !== -1)) {
                    div.parentNode.removeChild(div);
                    ed.execCommand('mceRepaint');
                } else if (el.nodeName === 'IMG') {
                    el.parentNode.removeChild(el);
                }
                ed.nodeChanged();
            });

            // Register buttons
            ed.addButton('image', {
                title : 'Insert/Edit Image',
                cmd : 'mceAdvImage'
            });


            t.editor = ed;
            var nonEditClass1 = ed.getParam('image_class_thumbnail'),
                nonEditClass2 = ed.getParam('image_class_postcard'),
                nonEditClass3 = ed.getParam('image_class_fullpage'),
                inlineClass   = ed.getParam('image_class_inline');

            ed.on('nodechange', function() {
                var selectionStart = ed.selection.getStart(),
                    selectionEnd   = ed.selection.getEnd(),
                    sc, ec, inlineStart, inlineEnd;

                // Block if start or end is inside a non editable element
                sc = t._parentHasClass(selectionStart, [nonEditClass1, nonEditClass2, nonEditClass3]);
                ec = t._parentHasClass(selectionEnd, [nonEditClass1, nonEditClass2, nonEditClass3]);
                 // Block or unblock
                if (sc || ec) {
                    t._setDisabled(true);
                    ed.fire('enable', { button: 'image' });
                    ed.fire('active', { button: 'image' });
                } else {
                    t._setDisabled(false);

                    inlineStart = t._parentHasClass(selectionStart, [inlineClass]);
                    inlineEnd   = t._parentHasClass(selectionEnd, [inlineClass]);

                    if(inlineStart || inlineEnd){
                        ed.fire('disable', { buttons: t._fontButtons });
                        ed.fire('active', { button: 'image' });
                    } else {
                        ed.fire('enable', { buttons: t._fontButtons });
                        ed.fire('inactive', { button: 'image' });
                    }
                }
            });

            ed.on('KeyDown KeyPress KeyUp Paste', t._block);
            
            ed.on('click', function(e){
				if(e.target.nodeName === "IMG") {
					tinyMCE.activeEditor.selection.select(e.target);
					e.preventDefault();
				}
			});


            isImage = function _isImage(el){
                var div = ed.dom.getParent(el, 'div');
                return !!( el.nodeName === 'IMG' && ed.dom.getAttrib(el, 'class').indexOf('math') === -1 && ed.dom.getAttrib(el, 'class').indexOf('ck12-media-placeholder') === -1 || (div && ed.dom.getAttrib(div, 'class').indexOf('x-ck12-img') > -1));
            };

            isInlineImage = function _isInlineImage(el){
                var span = ed.dom.getParent(el, 'span');
                return el.nodeName === 'IMG' && (span && ed.dom.getAttrib(span, 'class') === 'x-ck12-img-inline');
            };

            // Extend editor with events
            if(!ed.events){ed.events = {}; }
            $.extend(true, ed.events, {
                'ck12image': {
                    'isImage': isImage,
                    'isInlineImage': isInlineImage
                }
            });
        },

        _parentHasClass : function (selection, arr) {
            var ed = this.editor,
                dom = ed.dom;

            var hasClass = function hasClass (n) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if( dom.hasClass(n, arr[i]) ) { return true; }
                }
                return false;
            };

            return dom.getParent(selection, function(n){
                var result = hasClass(n);
                if( result ) { return result; }
            });
        },
        _block : function(e) {
            if (!shouldBlock){ return; }
            var k = e.keyCode;

            //Bug 7810, Do not block backspace and delete key
            if (k === 8 || k === 46){
                tinymce.activeEditor.execCommand('mceDeleteImage');
                return;
             }

            // Don't block arrow keys, pg up/down, and F1-F12
            if ((k > 32 && k < 41) || (k > 111 && k < 124)) {
                return;
            }

            return Event.cancel(e);
        },
        _fontButtons : [
            'bold',
            'italic',
            'strikethrough',
            'subscript',
            'superscript',
            'underline',
            'ck12textcolor',
            'ck12highlight',
            'styleselect'
        ],
        _uiButtons : function(){
            return Array.prototype.concat.apply(this._fontButtons, [
                'blockquote',
                'bullist',
                'charmap',
                'ck12definitionlist',
                'ck12embed',
                'ck12table',
                'elementbox',
                'fullscreen',
                'hr',
                'link',
                'matheditor',
                'numlist',
                'redo',
                'save',
                'undo',
                'unlink'
            ]);
        },

        _setDisabled : function(disable) {
            var t = this,
                ed = t.editor,
                uiButtons = t._uiButtons();

            if(disable){
                ed.fire('disable', { buttons: uiButtons });
            } else {
                ed.fire('enable', { buttons: uiButtons });
            }
            shouldBlock = disable;
            if (disable !== t.disabled) {
                t.disabled = disable;
            }
        },

        contextMenu: {
            postRender: function(editor) {
                var ctrl = this;

                function handleDisable () {
                    var dom, selection, el, disabledState;

                    setSelection(editor);

                    dom           = editor.dom;
                    selection     = editor.selection;
                    el            = selection.getNode() || editor.getBody();
                    disabledState = isImage(el, dom);

                    ctrl.disabled( !disabledState );
                    ctrl.visible( disabledState );
                    if (disabledState) { editor.fire('contextmenu:override', { enable: ['ck12image'] }); }
                }

                function bindListener () {
                    editor.on('contextmenu:reselect', function(e){
                        lastSelectedRng = e.range || null;
                        handleDisable();
                    });
                }

                if (editor.initialized) {
                    bindListener();
                } else {
                    editor.on('init', bindListener);
                }
            },
            changeText: function(editor) {
                var ctrl = this;

                function handleTextChange (e) {
                    var text = isImage(e.target, editor.dom) ? 'Edit Image' : 'Insert/Edit Image';
                    ctrl.$el.find('span').text(text);
                }

                function bindListener () {
                    editor.on('contextmenu', handleTextChange);
                }

                if (editor.initialized) {
                    bindListener();
                } else {
                    editor.on('init', bindListener);
                }
            }
        },


        getInfo : function() {
            return {
                longname : 'Advanced image',
                author : 'Moxiecode Systems AB',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/advimage',
                version : tinymce.majorVersion + '.' + tinymce.minorVersion
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12image', tinymce.plugins.CK12ImagePlugin);
})();
