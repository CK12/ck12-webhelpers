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
            });

            ed.onPreInit.add(function() {

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
