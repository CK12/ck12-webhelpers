/**
 * $Id: editor_plugin_src.js 520 2008-01-07 16:30:32Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright 2004-2008, Moxiecode Systems AB, All rights reserved.
 */
(function () {
    'use strict';

    var Event = tinymce.dom.Event;

    tinymce.create('tinymce.plugins.CK12ImagePlugin', {
        init: function (ed, url) {
            if (ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'ck12image';
            }
            // Register commands
            var nonEditClass1, nonEditClass2, nonEditClass3, t = this;

            ed.onInit.add(function () {
                if (ed.settings.content_css !== false) {
                    ed.dom.loadCSS(url + '/css/ck12image.css');
                }
            });


            ed.addCommand('mceAdvImage', function () {
                var nodeclass, e = ed.selection.getNode();

                // Internal image object like a flash placeholder. Check for math image
                nodeclass = ed.dom.getAttrib(e, 'class');
                if (nodeclass) {
                    if ((nodeclass.indexOf('mceItem') !== -1) ||
                        (nodeclass.indexOf('x-ck12-block-math') !== -1) ||
                        (nodeclass.indexOf('x-ck12-math') !== -1) ||
                        (nodeclass.indexOf('ck12-media-placeholder')) !== -1) {
                        return;
                    }
                }

                ed.storeSelection = ed.selection.getBookmark();
                ed.windowManager.open({
                    file: url + '/image.htm',
                    width: 480 + parseInt(ed.getLang('advimage.delta_width', 0), 10),
                    height: 450 + parseInt(ed.getLang('advimage.delta_height', 0), 10),
                    inline: 1
                }, {
                    plugin_url: url
                });
            });

            ed.addCommand('mceDeleteImage', function () {
                var div, el = ed.selection.getNode();
                div = ed.dom.getParent(el, 'div');
                if (div && (ed.dom.getAttrib(div, 'class').indexOf('x-ck12-img') !== -1)) {
                    div.parentNode.removeChild(div);
                    ed.execCommand('mceRepaint');
                } else if (el.nodeName === 'IMG') {
                    el.parentNode.removeChild(el);
                }
            });


            ed.onInit.add(function () {
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function (th, m, e) {
                        var el,
                            se = ed.selection,
                            div = ed.dom.getParent(e, 'div');
                        el = se.getNode() || ed.getBody();

                        if ((el.nodeName === 'IMG' && ed.dom.getAttrib(e, 'class').indexOf('math') === -1) ||
                            (div && (ed.dom.getAttrib(div, 'class').indexOf('x-ck12-img') !== -1))) {
                            m.removeAll();
                            m.add({
                                title: 'Edit Image',
                                icon: 'image',
                                cmd: 'mceAdvImage',
                                ui: true
                            });
                            m.add({
                                title: 'Delete Image',
                                icon: 'delete',
                                cmd: 'mceDeleteImage',
                                ui: true
                            });
                            m.addSeparator();
                        }
                    });
                }
            });


            // Register buttons
            ed.addButton('image', {
                title: 'advimage.image_desc',
                cmd: 'mceAdvImage'
            });

            t.editor = ed;
            nonEditClass1 = ed.getParam('image_class_thumbnail');
            nonEditClass2 = ed.getParam('image_class_postcard');
            nonEditClass3 = ed.getParam('image_class_fullpage');

            ed.onNodeChange.addToTop(function (ed, cm) {
                var sc, ec;

                // Block if start or end is inside a non editable element
                sc = ed.dom.getParent(ed.selection.getStart(), function (n) {
                    return ed.dom.hasClass(n, nonEditClass1) ||
                        ed.dom.hasClass(n, nonEditClass2) ||
                        ed.dom.hasClass(n, nonEditClass3);
                });

                ec = ed.dom.getParent(ed.selection.getEnd(), function (n) {
                    return ed.dom.hasClass(n, nonEditClass1) ||
                        ed.dom.hasClass(n, nonEditClass2) ||
                        ed.dom.hasClass(n, nonEditClass3);
                });

                // Block or unblock
                if (sc || ec) {
                    t._setDisabled(1);
                    cm.setDisabled('image', false);
                    cm.setActive('image', true);
                    return false;
                }
                t._setDisabled(0);

            });
        },

        _block: function (ed, e) {
            var k = e.keyCode;

            //Bug 7810, Do not block backspace and delete key
            if (k === 8 || k === 46) {
                ed.execCommand('mceDeleteImage');
                return;
            }
            // Don't block arrow keys, pg up/down, and F1-F12
            if ((k > 32 && k < 41) || (k > 111 && k < 124)) {
                return;
            }

            return Event.cancel(e);
        },

        _setDisabled: function (s) {
            var t = this,
                ed = t.editor;

            tinymce.each(ed.controlManager.controls, function (c) {
                c.setDisabled(s);
            });



            if (s !== t.disabled) {
                if (s) {
                    ed.onKeyDown.addToTop(t._block);
                    ed.onKeyPress.addToTop(t._block);
                    ed.onKeyUp.addToTop(t._block);
                    ed.onPaste.addToTop(t._block);
                } else {
                    ed.onKeyDown.remove(t._block);
                    ed.onKeyPress.remove(t._block);
                    ed.onKeyUp.remove(t._block);
                    ed.onPaste.remove(t._block);
                }

                t.disabled = s;
            }
        },

        getInfo: function () {
            return {
                longname: 'Advanced image',
                author: 'Moxiecode Systems AB',
                authorurl: 'http://tinymce.moxiecode.com',
                infourl: 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/advimage',
                version: tinymce.majorVersion + '.' + tinymce.minorVersion
            };
        }
    });

    // Register plugin  
    tinymce.PluginManager.add('ck12image', tinymce.plugins.CK12ImagePlugin);
}());