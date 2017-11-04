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
 * $id$
 */

/*global $:true */
/*global tinymce:true */

(function() {
    'use strict';
    var Event = tinymce.dom.Event;
    var ebClass, ebHeaderClass, ebBodyClass;
	var keypresshistory,
        ELEMENTBOX_PLACEHOLDER_CLASS = 'x-ck12-element-box-placeholder';

    tinymce.create('tinymce.plugins.ElementBoxPlugin', {
        init : function(ed, url) {

            if(ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'elementbox';
            }

            var t = this;
            t.editor = ed;
            var each = tinymce.each;

            ebClass = ed.getParam('element_box_class');
            ebHeaderClass = ed.getParam('element_box_header_class');
            ebBodyClass = ed.getParam('element_box_body_class');

            // Register commands
            ed.addCommand('mceAddElementBox', function() {
                ed.selection.collapse(0);
                var elementBox = '<div class="' + ebClass + '">  <div class="' + ebHeaderClass + '">&nbsp;<span id="_mce_temp_span">&nbsp;</span></div>  <div class="' + ebBodyClass + '"></div></div>';
                ed.execCommand('mceInsertContent', false, elementBox, {
                    skip_undo : 1
                });
                ed.undoManager.add();
                //Fix for position cursor position at start of the elementbox header
                ed.focus();
                ed.selection.select(ed.dom.select('#_mce_temp_span')[0]);
                ed.selection.collapse(0);
                ed.dom.remove(ed.dom.select('span#_mce_temp_span')[0]);
            });

            ed.addCommand('mceDeleteElementBox', function() {
                var el = ed.selection.getNode();
                var eb = null;
                if(hasPlaceholderClass(el)) {
                    eb = el;
                } else {
                    eb = ed.dom.getParent(ed.selection.getNode(), function(n) {
                        return hasPlaceholderClass(n);
                    });
                }
                if(eb) {
                    eb.parentNode.removeChild(eb);
                    ed.execCommand('mceRepaint');
                }
            });

            function contains(array, item){
                if(!array instanceof Array){ return false; }
                return array.indexOf(item) > -1;
            }

            function hasPlaceholderClass(node){
                return ed.dom.hasClass(node, ELEMENTBOX_PLACEHOLDER_CLASS);
            }

            function isWithinElementBox(node){
                return ed.dom.getParents(node, 'table.' + ELEMENTBOX_PLACEHOLDER_CLASS).length > 0;
            }

            function isElementBox(node){
                return hasPlaceholderClass(node) || isWithinElementBox(node);
            }

            ed.on('preinit', function() {
                //Bug 7379 Before add content to tinymce change element box div structure to table with 2 rows and a column.
                ed.parser.addNodeFilter('div', function(nodes) {
                    var i = nodes.length,
                        node, nodeClass;

                    while (i--) {
                        node = nodes[i];
                        nodeClass = node.attr('class');
                        if (nodeClass && contains(nodeClass.split(' '), 'x-ck12-element-box')) {
                            // table structure is created using tinyMCE.html.node
                            var elementBoxTable = new tinymce.html.Node('table class="x-ck12-element-box-placeholder"');
                            var elementBoxTr1 = new tinymce.html.Node('tr class="x-ck12-element-box-header"');
                            var elementBoxTr2 = new tinymce.html.Node('tr class="x-ck12-element-box-body"');
                            var elementBoxTd1 = new tinymce.html.Node('td class="x-ck12-editor-header-td-element-box"');
                            var elementBoxTd2 = new tinymce.html.Node('td class="x-ck12-editor-body-td-element-box"');

                            // append element box div to td of created table, after and unwrap which removes parent and keep its children.
                            var children = node.getAll('div');
                            var headChild = children[0];
                            var bodyChild = children[1];
                            if (headChild) {
                                elementBoxTd1.append(headChild);
                                headChild.unwrap();
                            }
                            if (bodyChild) {
                                elementBoxTd2.append(bodyChild);
                                bodyChild.unwrap();
                            }

                            elementBoxTr1.append(elementBoxTd1);
                            elementBoxTr2.append(elementBoxTd2);
                            elementBoxTable.append(elementBoxTr1);
                            elementBoxTable.append(elementBoxTr2);
                            // replace element box div with this newly formed table.
                            node.replace(elementBoxTable);
                        }
                    }
                });
            });

            ed.on('keydown', function(e) {
                var eb, eh, ec, ebBody;

                var key = e.keyCode,
                    isDoubleEnter = (keypresshistory === 13 && key === 13);

                // Handle tab key
                if(key === 9){
                    ebBody = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                        return ed.dom.hasClass(n, ebBodyClass);
                    });

                    // If the cursor is currently in the element body and it is not followed in sequence
                    // by the shift key, cancel the event and then move the cursor after the element box.
                    // This resolves an issue where the tab key creates a new element body tag within the
                    // element box.
                    if (ebBody && keypresshistory !== 16) {
                        tinymce.dom.Event.cancel(e);
                        ed.selection.setCursorLocation(ed.dom.getParent(ebBody, 'table'), 1);
                    }
                }

                // Handle enter|return key
                if(key === 13) {

                    //End caret positions is inside the element box header
                    ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                        return ed.dom.hasClass(n, ebHeaderClass);
                    });
                    //Pressing Enter|Return key inside an element box header will change the cursor position to the end of element box body

                    if(ec) {
                        eb = ed.selection.getEnd().parentNode;
                        eh = ec;
                        ebBody = eh.nextSibling;
                        if(ebBody.className === ebBodyClass) {

                            ed.focus();
                            ed.selection.select(ebBody.firstChild, true);
                            ed.selection.collapse(true);
                        }
                        return tinymce.dom.Event.cancel(e);
                    } else {
                        ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                            return ed.dom.hasClass(n, ebBodyClass);
                        });
                        if(ec) {
                            if(isDoubleEnter) { return t._overrideDoubleEnter(t, e); }
                        }
                    }
                }

                // Set history to current key
                keypresshistory = key;
            });

            //Preprocessing before getcontent()
            ed.on('preprocess', function(o) {

                var nodep, tdHead, tdBody;
                //Bug 7379 Before save, change element box table back to div structure.
                var nodes = ed.dom.select('.' + ELEMENTBOX_PLACEHOLDER_CLASS),
                    i = nodes.length;
                while (i--) {
                    nodep = nodes[i];
                    tdHead = $(nodep).find('td.x-ck12-editor-header-td-element-box');
                    tdBody = $(nodep).find('td.x-ck12-editor-body-td-element-box');
                    $(nodep).replaceWith('<div class="x-ck12-element-box"><div class="x-ck12-element-box-header">' + tdHead.html() + '</div><div class="x-ck12-element-box-body">' + tdBody.html() + '</div></div>');
                }

                if(o.get) {
                    t._fixElementBoxes(ed, t, o);
                }

            });

            // Register toolbar button
            ed.addButton('elementbox', {
                title : 'Insert Element Box',
                cmd : 'mceAddElementBox',
                image : url + '/img/icon_elementbox.png'
            });

            // Register context menu
            ed.addMenuItem('elementboxCM', {
                text: 'Delete Element Box',
                context: 'insert',
                cmd: 'mceDeleteElementBox',
                onPostRender: function(){
                    t.contextMenu.postRender.call(this, ed);
                },
                image: url + '/img/icon_elementbox_del.png',
                ui: true
            });

            // Extend editor with events
            if(!ed.events){ ed.events = {}; }
            $.extend(true, ed.events, {
                'elementbox': {
                    'toolbar': t.toolbar,
                    'contextMenu': t.contextMenu,
                    isElementBox: isElementBox
                }
            });
        },

        getParentBlock : function(n) {
            var d = this.editor.dom;
            return d.getParent(n, d.isBlock);
        },
        _fixElementBoxes : function(ed, t, o) {
            var each = tinymce.each;
            each(ed.dom.select('DIV', o.node), function(n) {
                if(n.parentNode !== null) {

                    //Ensure that no orphan elementbox headers or bodies inside the content.
                    //Change any header or body that is not inside a proper elementbox to simple paragraphs.
                    if(ed.dom.hasClass(n, ebHeaderClass) || ed.dom.hasClass(n, ebBodyClass)) {
                        if(!ed.dom.hasClass(n.parentNode, ebClass)) {
                            var p = ed.getDoc().createElement('P');
                            p.innerHTML = n.innerHTML;
                            ed.dom.replace(p, n);
                        }
                    }

                    //Ensure that each element box has only one body,
                    if(ed.dom.hasClass(n, ebClass)) {
                        var firstBody = null;
                        each(ed.dom.select('DIV', n), function(c) {
                            if(ed.dom.hasClass(c.parentNode, ebClass)) {
                                if(ed.dom.hasClass(c, ebBodyClass)) {
                                    if(firstBody) {
                                        var p = ed.getDoc().createElement('P');
                                        p.innerHTML = c.innerHTML;
                                        firstBody.appendChild(p);
                                        c.parentNode.removeChild(c);
                                        ed.execCommand('mceRepaint');
                                        t.editor.nodeChanged();
                                    } else {
                                        firstBody = c;
                                    }
                                }
                            }
                        });
                    }

                    //Ensure that each elementbox has a header and a body (insert an empty body/header in case one is missing)
                    if(ed.dom.hasClass(n, ebClass)) {
                        var hasHeader = false;
                        var hasBody = false;
                        each(n.children, function(c) {
                            if(ed.dom.hasClass(c.parentNode, ebClass)) {
                                if(ed.dom.hasClass(c, ebHeaderClass)) {
                                    hasHeader = true;
                                } else if(ed.dom.hasClass(c, ebBodyClass)) {
                                    hasBody = true;
                                }
                            }
                        });
                        if(!hasHeader) {
                            var header = ed.getDoc().createElement('DIV');
                            header.className = ebHeaderClass;
                            header.innerHTML = '&nbsp;';
                            n.insertBefore(header, n.firstChild);
                        }
                        if(!hasBody) {
                            var body = ed.getDoc().createElement('DIV');
                            body.className = ebBodyClass;
                            body.innerHTML = '&nbsp;';
                            n.appendChild(body);
                        }
                    }

                    //Ensure that elementbox header and body is not empty
                    if(ed.dom.hasClass(n, ebClass)) {
                        each(n.children, function(c) {
                            if(c.innerHTML && (c.innerHTML.length === 0 || (c.innerHTML === '<br>' || c.innerHTML === 'null') )) {
                                c.innerHTML = '&nbsp;';
                            }
                        });
                    }
                }
            });
        },
        // rewriting capture double enter as getRangeAt etc renge API do not work on IE.
        _overrideDoubleEnter : function(t,e){
            var ed = t.editor;
            ed.undoManager.beforeChange();
            //Overriding double enter event here
            var pa = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                return ed.dom.hasClass(n, ELEMENTBOX_PLACEHOLDER_CLASS);
            });
            var next = pa.nextSibling;
            if (!next && pa.parentNode) {
                var _temp = ed.getDoc().createElement('P');
                _temp.innerHTML = '&nbsp;';
                pa.parentNode.appendChild(_temp);
            }
            next = pa.nextSibling;
            if (next) {
                ed.focus();
                if (next.firstChild) {
                    ed.selection.select(next.firstChild, true);
                } else {
                    ed.selection.select(next, true);
                }

                ed.selection.collapse(1);
                return tinymce.dom.Event.cancel(e);
            }
        },

        getInfo : function() {
            return {
                longname : 'CK-12 Element Box',
                author : 'Shanmuga Bala',
                authorurl : 'http://www.ck12.org',
                infourl : 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version : '1.0'
            };
        },

        contextMenu: {
            postRender: function(editor) {
                var ctrl = this;

                function handleDisable () {
                    var dom           = editor.dom,
                        selection     = editor.selection,
                        el            = selection.getNode() || editor.getBody(),
                        table         = dom.getParent(el, 'table'),
                        disabledState = !!( table && dom.hasClass(table, ELEMENTBOX_PLACEHOLDER_CLASS));

                    ctrl.disabled( !disabledState );
                    ctrl.visible( disabledState );
                }

                function bindListener () {
                    editor.on('contextmenu:postrender', handleDisable);
                }

                if (editor.initialized) {
                    bindListener();
                } else {
                    editor.on('init', bindListener);
                }
            }
        },

        toolbar: {
            handleDisable: function (ctrl, editor) {
                var dom           = editor.dom,
                    selection     = editor.selection,
                    parents       = this._parentsWithElementBoxClass(editor, dom, selection),
                    el            = selection.getNode() || editor.getBody(),
                    disabledState = !!(parents.sc || parents.ec);

                // force disable when it's an image and not inline
                if (editor.events && editor.events.ck12image && editor.events.ck12image.isImage(el, dom)) {
                    if(editor.events.ck12image.isInlineImage && !editor.events.ck12image.isInlineImage(el, dom)){
                        disabledState = true;
                    }
                }

                ctrl.disabled( disabledState );
            },

            _parentsWithElementBoxClass: function (editor, dom, selection) {
                var parents   = {},
                    self      = this;

                parents.sc = dom.getParent(selection.getStart(), function(n) {
                    return self._hasElementBoxClasses(dom, n);
                });
                parents.ec = dom.getParent(selection.getEnd(), function(n) {
                    return self._hasElementBoxClasses(dom, n);
                });
                return parents;
            },

            _hasElementBoxClasses: function (dom, node) {
                return dom.hasClass(node, ebClass) || dom.hasClass(node, ebHeaderClass) || dom.hasClass(node, ebBodyClass);
            }
        }

    });

    // Register plugin
    tinymce.PluginManager.add('elementbox', tinymce.plugins.ElementBoxPlugin);


})();
