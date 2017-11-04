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
 * This file originally written by Nachiket Karve
 *
 * $id$
 */
(function() {
    // Load plugin specific language pack
    //tinymce.PluginManager.requireLangPack('example');

    //private variables
    var plugin_url = '';
    var colors = {
        "aqua" : "#00FFFF",
        "black" : "#000000",
        "blue" : "#0000FF",
        "fuchsia" : "#FF00FF",
        "grey" : "#808080",
        "green" : "#008000",
        "lime" : "#00FF00",
        "maroon" : "#800000",
        "navy" : "#000080",
        "olive" : "#808000",
        "purple" : "#800080",
        "red" : "#FF0000",
        "silver" : "#C0C0C0",
        "teal" : "#008080",
        "white" : "#FFFFFF",
        "yellow" : "#FFFF00"
    };
    var colorNames = [];
    var colorValues = [];
    for(var col in colors) {
        if(col && colors[col]) {
            colorNames.push(col);
            colorValues.push(colors[col]);
        }
    }

    var textColorButton = null;
    var textHighlightButton = null;

    //private methods

    function getColorName(color_hex) {
        for(var i = 0; i < colorValues.length; i++) {
            if(colorValues[i] == color_hex) {
                return colorNames[i];
            }
        }
        return null;
    }

    function applyFormat(format, value) {
        if(getColorName(value)) {
            tinymce.activeEditor.formatter.apply(format, {
                'value' : getColorName(value)
            });
        }
        tinymce.activeEditor.execCommand('mceCK12CleanupRosettaColors', false);
    }

    function menuitem_click() {
        tinymce.activeEditor.formatter.apply('ck12textcolor', {
            value : this.ck12class
        });
    }

    //Initialize  the plugin
    tinymce.create('tinymce.plugins.CK12Rosetta', {
        init : function(ed, url) {
            plugin_url = url;

            //add commands
            ed.addCommand('mceCK12CleanupRosettaColors', function() {
                var dom = ed.dom;
                var spans = dom.select('span');
                if(spans && spans.length) {
                    var span, _cn, _c, _fc, _bc, final_cn;
                    for(var i = 0; i < spans.length; i++) {
                        span = spans[i];
                         _bc='';
                        if(span.className && (span.className.indexOf('x-ck12-textcolor') != -1 || span.className.indexOf('x-ck12-textbgcolor') != -1 )) {
                            _cn = span.className.split(' ');
                            final_cn = [];
                            for (var j = 0 ; j < _cn.length; j++){
                                _c = _cn[j];
                                if (_c.indexOf('x-ck12-textcolor') === 0){
                                    _fc = _c;
                                } else if (_c.indexOf('x-ck12-textbgcolor') === 0){
                                    _bc = _c;
                                } else if (_c){
                                    final_cn.push(_c);
                                }
                            }
                            final_cn.push(_fc);
                            final_cn.push(_bc);
                            final_cn = final_cn.join(' ');
                            span.className = final_cn;
                        }
                    }
                }
            });

           // Bug 10647 : Add a node change handler, selects the button in the UI when a Header is selected.
           ed.onNodeChange.add(function (ed, cm, n) {
               var disableHeaderStyling = false;
               if (n.nodeName === "H3" || n.nodeName === "H4" || n.nodeName === "H5" || n.nodeName === "H6" || n.nodeName === "H2" || n.nodeName === "H1") {
                   disableHeaderStyling = true;
               }
               if (disableHeaderStyling) {
                   cm.setDisabled('italic', true);
                   cm.setDisabled('bold', true);
                   cm.setDisabled('underline', true);
                   cm.setDisabled('strikethrough', true);
                   cm.setDisabled('sub', true);
                   cm.setDisabled('sup', true);
                   cm.setDisabled('ck12textcolor', true);
                   cm.setDisabled('ck12highlight', true);
                   cm.setDisabled('link', true);
               }
              
                // Bug 10836 allow only 'paragraph' format for blockquotes.
                cm.setDisabled('formatselect', false);
                cm.setDisabled('blockquote', false);
                
                // if parent node is BLOCKQUOTE disable format.
                if (n && n.parentNode && n.parentNode.nodeName == 'BLOCKQUOTE') {
                    cm.setDisabled('formatselect', true);
                } else {
                    cm.setDisabled('formatselect', false);
                }
                
                // if selection has BLOCKQUOTE parent disable format.    
                if (ed && ed.parents && ed.parents.length > 0) {
                    // Loop over parents array as there could be other elements than 'TD' 
                    for (var i = 0;
                    (i < ed.parents.length); i++) {
                        var arrElm = ed.parents[i];
                        if ('BLOCKQUOTE' == arrElm.tagName.toUpperCase()) {
                            cm.setDisabled('formatselect', true);
                        }
                    }
                }
                
                // if text has already format, disable BLOCKQUOTE
                if (disableHeaderStyling || (n && n.nodeName === "PRE")) {
                    cm.setDisabled('blockquote', true);
                }
           });
                     
            // Bug 7931 : wrap ck12-media-placeholder with P if it is not in paragraph before save operation. 
            ed.onPreProcess.add(function(ed, args) {
            	var nodes, node, dom = ed.dom;
                nodes = dom.select('.ck12-media-placeholder');
                i = nodes.length;
                while (i--) {
                    node = nodes[i];
                    if(null!=node.parentNode && node.parentNode.nodeName!='P')
                    {
                     $(node).wrap('<P/>');
                    }
                }
              
               //Bug 7379 Before save, change element box table back to div structure.
                nodes = ed.dom.select('.x-ck12-element-box-placeholder');
                i = nodes.length;
                while (i--) {
                    nodep = nodes[i];
                    td_head = $(nodep).find('td.x-ck12-editor-header-td-element-box');
                    td_body = $(nodep).find('td.x-ck12-editor-body-td-element-box');
                    $(nodep).replaceWith('<div class="x-ck12-element-box"><div class="x-ck12-element-box-header">' + td_head.html() + '</div><div class="x-ck12-element-box-body">' + td_body.html() + '</div></div>');
                 }
                 
                 
                 //Bug 8889  bogus element is removed while getting xhtml content from tinymce
                // if it has data it is placed in new P element and bogus br is removed.  
                nodes = dom.select('.x-ck12-editor-clearbottom');
                i = nodes.length;
                while (i--) {
                    node = nodes[i];
                    if($(node).children().length != 0 || $.trim($(node).text()).length > 0){
                        var innerData = node.innerHTML;
                        $(node).replaceWith('<p>'+innerData+'</p>');
                     }else{
                            dom.remove($(node));
                     }
                }
               
                nodes = dom.select('img');
                i = nodes.length;
                while (i--) {
                    var node = nodes[i];
                    //look for data-flx-url for images pasted from details pages.
                    var flxurl = $(node).attr('data-flx-url');
                    if (typeof flxurl != 'undefined' || typeof flxurl != 'string'){
                        if ( node.attributes['data-flx-url'] ){
                            flxurl = node.attributes['data-flx-url'].nodeValue;
                        } else {
                            flxurl = null;
                        }
                    }
                    if (flxurl) {
                        $(node).attr('src', flxurl);
                        $(node).attr('data-mce-src', flxurl);
                    } else {
                        //check whether src contains absolute urls to /flx/ image endpoints.
                        var src = $(node).attr('src');
                        if (typeof src != 'string'){
                            src = node.attributes['src'] ? node.attributes['src'].nodeValue : '';
                        }
                        var index = src.indexOf("/flx/");
                        if (index !== -1 && index !== 0) {
                            src = src.substring(index);
                            $(node).attr('src', src);
                            $(node).attr('data-mce-src', src);
                        }
                    }
                    $(node).removeAttr('data-flx-url');
                }                   
            });
            
            
            
            // Bug 8709 on undo/redo, active context menu is closed.
            ed.onUndo.add(function() {
                var cmplugin = ed.plugins.contextmenu;
                cmplugin._getMenu(ed).hideMenu();
            });
            
            ed.onRedo.add(function() {
                var cmplugin = ed.plugins.contextmenu;
                cmplugin._getMenu(ed).hideMenu();
            });
            
            ed.onInit.add(function() {
                //Add formats
                ed.formatter.register('underline', {
                    inline : 'span',
                    classes : 'x-ck12-underline'
                });
                ed.formatter.register('strikethrough', {
                    inline : 'span',
                    classes : 'x-ck12-strikethrough'
                });
                ed.formatter.register('ck12textcolor', {
                    inline : 'span',
                    classes : 'x-ck12-textcolor-%value',
                });
                ed.formatter.register('ck12highlight', {
                    inline : 'span',
                    classes : 'x-ck12-textbgcolor-%value',
                });
                
                //Bug 8889 adding a bogus br with style="clear:both" at the bottom.
                //ed.dom.add(ed.getBody(),ed.dom.create('br', {'class': "x-ck12-editor-clearbottom"}));
                 
            });

            ed.onPreInit.add(function() {

                   //Bug 7379 Before add content to tinymce change element box div structure to table with 2 rows and a column.
                  ed.parser.addNodeFilter('div', function (nodes) {
                         var i = nodes.length;
                         while (i--) {
                             node = nodes[i];
                             var nodeclass = node.attr('class') || '';

                             if (nodeclass == 'x-ck12-element-box') {

                                 // table structure is created using tinyMCE.html.node
                                 var elementBox_table = new tinymce.html.Node('table class="x-ck12-element-box-placeholder"');
                                 var elementBox_tr1 = new tinymce.html.Node('tr class="x-ck12-element-box-header"');
                                 var elementBox_tr2 = new tinymce.html.Node('tr class="x-ck12-element-box-body"');
                                 var elementBox_td1 = new tinymce.html.Node('td class="x-ck12-editor-header-td-element-box"');
                                 var elementBox_td2 = new tinymce.html.Node('td class="x-ck12-editor-body-td-element-box"');

                                 // append element box div to td of created table, after and unwrap which removes parent and keep its children.
                                 var children = node.getAll('div');
                                 var head_child = children[0];
                                 var body_child = children[1];
                                 if(head_child) {
                                     elementBox_td1.append(head_child);
                                     head_child.unwrap();
                                 }
                                 if(body_child) {
                                     elementBox_td2.append(body_child);
                                     body_child.unwrap();
                                 }

                                 elementBox_tr1.append(elementBox_td1);
                                 elementBox_tr2.append(elementBox_td2);
                                 elementBox_table.append(elementBox_tr1);
                                 elementBox_table.append(elementBox_tr2);

                                // replace element box div with this newly formed table.
                                 node.replace(elementBox_table);

                             }
                         }
                         
                         
                         
                 });


                //Before add content to tinymce
                // Remove rosetta classes in ol list and add its css style as inline style. so that tinymce can handle it.
                ed.parser.addNodeFilter('ol', function(nodes) {
                    var i = nodes.length;
                    while(i--) {
                        node = nodes[i];
                        var nodeclass = node.attr('class') || '';

                        if(nodeclass.indexOf('x-ck12-') !== -1) {
                            var nodestyle = '';

                            if(nodeclass.indexOf('x-ck12-lower-alpha') !== -1) {
                                nodestyle = 'list-style-type: lower-alpha;';

                            } else if(nodeclass.indexOf('x-ck12-upper-alpha') !== -1) {
                                nodestyle = 'list-style-type: upper-alpha;';

                            } else if(nodeclass.indexOf('x-ck12-lower-roman') !== -1) {
                                nodestyle = 'list-style-type: lower-roman;';

                            } else if(nodeclass.indexOf('x-ck12-upper-roman') !== -1) {
                                nodestyle = 'list-style-type: upper-roman;';
                            }
                            node.attr('class', null);
                            node.attr('style', nodestyle);
                        }
                    }
                });
                //Before get content from tinymce
                // Add rosetta style classes to ol lists
                ed.serializer.addNodeFilter('ol', function(nodes, name, args) {
                    var i = nodes.length, node;

                    while(i--) {
                        node = nodes[i];
                        var nodeclass = node.attr('class') || '';

                        if(nodeclass.indexOf('x-ck12-') == -1) {
                            var nodestyle = node.attr('style') || '';
                            var nodeclass = null;

                            if(nodestyle.indexOf('lower-alpha') !== -1) {
                                nodeclass = 'x-ck12-lower-alpha';

                            } else if(nodestyle.indexOf('upper-alpha') !== -1) {
                                nodeclass = 'x-ck12-upper-alpha';

                            } else if(nodestyle.indexOf('lower-roman') !== -1) {
                                nodeclass = 'x-ck12-lower-roman';

                            } else if(nodestyle.indexOf('upper-roman') !== -1) {
                                nodeclass = 'x-ck12-upper-roman';
                            }
                            node.attr('class', nodeclass);
                            node.attr('style', null);
                        }
                    }
                });
                ed.serializer.addNodeFilter('img', function(nodes, name, args) {
                    var i = nodes.length, node;
                    while(i--) {
                        node = nodes[i];
                        var longDesc = node.attr('longdesc') || '';
                            if(longDesc) {
                                node.attr('longdesc',encodeURIComponent(decodeURIComponent(longDesc)));
                            }
                    }
                });
            });
        },
        /**
         * createControl
         * creates split buttons for various Rosetta elements
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use in order to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            var c = null;
            if(n == 'ck12textcolor') {
                //CK-12 Text Color
                c = textColorButton = cm.createColorSplitButton('ck12textcolor', {
                    colors : colorValues,
                    title : 'Text Color',
                    'class' : 'mce_forecolor',
                    'onclick' : function() {
                        c.showMenu();
                    },
                    'onselect' : function() {
                    }
                });
                c.onHideMenu.add(function() {
                    if(this.value) {
                        applyFormat('ck12textcolor', this.value);
                    }
                });
                return c;
            } else if(n == 'ck12highlight') {
                //CK-12 Text Highlight (bgcolor)
                c = textHighlightButton = cm.createColorSplitButton('ck12highlight', {
                    colors : colorValues,
                    title : 'Highlight Color',
                    'class' : 'mce_backcolor',
                    'onclick' : function() {
                        c.showMenu();
                    },
                    'onselect' : function() {
                    }
                });
                c.onHideMenu.add(function() {
                    if(this.value) {
                        applyFormat('ck12highlight', this.value);
                    }
                });
                return c;
            }
            return null;
        },
        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'CK-12 Text Colors',
                author : 'Nachiket Karve',
                authorurl : 'http://www.ck12.org',
                infourl : 'https://insight.ck12.org/wiki/index.php/Tinymce-flxweb',
                version : "1.0"
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('ck12rosetta', tinymce.plugins.CK12Rosetta);
})();
