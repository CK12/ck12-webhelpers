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

(function() {
    var Event = tinymce.dom.Event;
    var ebClass, ebHeaderClass, ebBodyClass;

    tinymce.create('tinymce.plugins.ElementBoxPlugin', {
        init : function(ed, url) {

            if(ed.settings.ck12_plugins_url) {
                url = ed.settings.ck12_plugins_url + 'elementbox';
            }

            var t = this;
            t.editor = ed;
            var each = tinymce.each;
            ebClass = ed.getParam("element_box_class");
            ebHeaderClass = ed.getParam("element_box_header_class");
            ebBodyClass = ed.getParam("element_box_body_class");

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
                if(ed.dom.hasClass(el, ebClass)) {
                    eb = el;
                } else {
                    eb = ed.dom.getParent(ed.selection.getNode(), function(n) {
                        return ed.dom.hasClass(n, ebClass);
                    });
                }
                if(eb) {
                    eb.parentNode.removeChild(eb);
                    ed.execCommand('mceRepaint');
                }
            });

            ed.onInit.add(function() {
                if(ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.addToTop(function(th, m, e) {
                        var sm, se = ed.selection, el = se.getNode() || ed.getBody();
                        var div = ed.dom.getParent(e, 'div');
                        if((el.nodeName == "DIV") && (div && (ed.dom.hasClass(div, ebClass) || ed.dom.hasClass(div, ebHeaderClass) || ed.dom.hasClass(div, ebBodyClass)))) {

                            m.addSeparator();
                            //Fix for adding option image. http://www.tinymce.com/forum/viewtopic.php?pid=41952#p88239
                            m.add({
                                title : '<span style="white-space:nowrap;"><img src="' + url + '/img/icon_elementbox_del.png" style="margin-left:-20px; margin-right:5px;"><span style="display:inline; position:relative; bottom:2px;">Delete Element Box</span></span>',
                                cmd : 'mceDeleteElementBox',
                                ui : true
                            });
                        }
                    });
                }
            });

            ed.onNodeChange.add(function(ed, cm, n) {
                var sc, ec;

                // Block if start or end is inside a non editable element
                sc = ed.dom.getParent(ed.selection.getStart(), function(n) {
                    return ed.dom.hasClass(n, ebClass) || ed.dom.hasClass(n, ebHeaderClass) || ed.dom.hasClass(n, ebBodyClass);
                });
                ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                    return ed.dom.hasClass(n, ebClass) || ed.dom.hasClass(n, ebHeaderClass) || ed.dom.hasClass(n, ebBodyClass);
                });
                // Block or unblock
                if(sc || ec) {
                    cm.setDisabled('elementbox', true);
                    cm.setActive('elementbox', false);
                } else {
                    cm.setDisabled('elementbox', false);
                }

            });

            ed.onKeyPress.addToTop(function(ed, e) {
                var key = e.keyCode;

                if(key == 13) {

                    //End caret positions is inside the element box header
                    var ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                        return ed.dom.hasClass(n, ebHeaderClass);
                    });
                    //Pressing Enter|Return key inside an element box header will change the cursor position to the end of element box body
                    var eb, eh, ebBody;
                    if(ec) {
                        eb = ed.selection.getEnd().parentNode;
                        eh = ec;
                        ebBody = eh.nextSibling;
                        if(ebBody.className == ed.getParam("element_box_body_class")) {

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
                            return t._overrideDoubleEnter(t, e);
                        }
                    }
                }
            });
            //Preprocessing before getcontent()
            ed.onPreProcess.add(function(ed, o) {
                if(o.get) {
                    t._fixElementBoxes(ed, t, o);
                }

            });
            // Register buttons
            ed.addButton('elementbox', {
                title : 'Insert Element Box',
                cmd : 'mceAddElementBox',
                image : url + '/img/icon_elementbox.png'
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
                            var p = ed.getDoc().createElement("P");
                            p.innerHTML = n.innerHTML;
                            ed.dom.replace(p, n);
                        }
                    }

                    //Ensure that each element box has only one body,
                    if(ed.dom.hasClass(n, ebClass)) {
                        var firstBody = null;
                        var elms = [];
                        each(ed.dom.select('DIV', n), function(c) {
                            if(ed.dom.hasClass(c.parentNode, ebClass)) {
                                if(ed.dom.hasClass(c, ebBodyClass)) {
                                    if(firstBody) {
                                        var p = ed.getDoc().createElement("P");
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
                            var header = ed.getDoc().createElement("DIV");
                            header.className = ebHeaderClass;
                            header.innerHTML = '&nbsp;';
                            n.insertBefore(header, n.firstChild);
                        }
                        if(!hasBody) {
                            var body = ed.getDoc().createElement("DIV");
                            body.className = ebBodyClass;
                            body.innerHTML = '&nbsp;';
                            n.appendChild(body);
                        }
                    }

                    //Ensure that elementbox header and body is not empty
                    if(ed.dom.hasClass(n, ebClass)) {
                        each(n.children, function(c) {
                            if(c.innerHTML && (c.innerHTML.length == 0 || c.innerHTML == '<br>')) {
                                c.innerHTML = '&nbsp;'      
                            }  
                        });
                   }  
                }
            });
        },
        _overrideDoubleEnter : function(t, e) {
            var ed = t.editor, dom = ed.dom, d = ed.getDoc(), se = ed.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
            var rb, ra, dir, sn, en, sb, eb, bn, sc, ec, n, next, pa;

            ed.undoManager.beforeChange();
            // Setup before/after range
            rb = d.createRange();
            rb.setStart(s.anchorNode, s.anchorOffset);
            rb.collapse(true);
            ra = d.createRange();
            ra.setStart(s.focusNode, s.focusOffset);
            ra.collapse(true);

            // Setup start/end points
            dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
            sn = dir ? s.anchorNode : s.focusNode;
            en = dir ? s.focusNode : s.anchorNode;
            sb = t.getParentBlock(sn);
            eb = t.getParentBlock(en);
            bn = sb ? sb.nodeName : se.element;
            // Get block name to create

            if(sb && (sb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
                bn = se.element;
            }
            // Find start chop node
            n = sc = sn;
            do {
                if(n == b || n.nodeType == 9 || t.editor.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName)){
                    break;
                }
                sc = n;
            } while ((n = n.previousSibling ? n.previousSibling : n.parentNode));
            // Find end chop node
            n = ec = en;
            do {
                if(n == b || n.nodeType == 9 || t.editor.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName)){
                    break;
                }
                ec = n;
            } while ((n = n.nextSibling ? n.nextSibling : n.parentNode));

            if(sc.nodeName == bn && !ec.nextSibling && ec.parentNode.nodeName == bn) {
                //Overriding double enter event here
                pa = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                    return ed.dom.hasClass(n, ebClass);
                });
                next = pa.nextSibling;
                if(!next && pa.parentNode) {
                    var _temp = ed.getDoc().createElement("P");
                    _temp.innerHTML = '&nbsp;';
                    pa.parentNode.appendChild(_temp);
                }
                next = pa.nextSibling;
                if(next) {
                    ed.focus();
                    if(next.firstChild){
                        ed.selection.select(next.firstChild, true);
                    }
                    else{
                        ed.selection.select(next, true);
                    }

                    ed.selection.collapse(1);
                    return tinymce.dom.Event.cancel(e);
                }
            }

        },
        getInfo : function() {
            return {
                longname : 'CK-12 Element Box',
                author : 'Shanmuga Bala',
                authorurl : 'http://www.ck12.org',
                infourl : 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version : "1.0"
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('elementbox', tinymce.plugins.ElementBoxPlugin);
})();
